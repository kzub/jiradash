var http = require('http');
var https = require('https');
var net = require('net');
var url = require('url');

var authorizationHeader = process.env.JIRA_AUTH;

var content_type  = 'application/json';
var jira_url_base = 'onetwotripdev.atlassian.net/rest';
var jira_url_set  = '/api/2/issue/{key}';
var jira_url_changelog = '/api/2/issue/{key}?expand=changelog&fields=none';
var allowed_authors = ['konstantin.zubkov'];
var checked_fields  = [{ name : 'priority', key : 'id', default : '4' }];
var checked_projects= ['OTT', 'AH', 'AC'];

var log_rollbacks = [];
var log_changes = [];

function filter_check_projects(projects){
  return function(task, change, item){
    if(task && task.key){
      for(var idx in projects){
        if(task.key.indexOf(projects[idx]) === 0){
          return true;
        }
      }
    }
  };
}

function filter_change_authorized_author(authors){
  return function(task, change, item){
    if(change && change.author){
      return authors.indexOf(change.author.key) > -1;
    }
  }
}

function filter_change_fields(fields){
  return function(task, change, item){
    if(item && item.field){
      return fields.indexOf(item.field) > -1;
    }
  }
}

function filter_change_time(hours){
  return function(task, change, item){
    if(change && change.created){
      var time_of_change = new Date(change.created);
      var some_time_ago  = new Date();
      some_time_ago.setHours(hours);
      return time_of_change > some_time_ago;
    }
  }
}

function action_rollback_field_value(name, key, value){
  return function(task, change, item){
    var change_data = {
      fields : {}
    };

    if(key){
      change_data.fields[name] = {};
      change_data.fields[name][key] = value instanceof Function ? value.apply(this, arguments) : value;
    }else{
      change_data.fields[name] = value instanceof Function ? value.apply(this, arguments) : value;
    }

    return {
      type : 'set-value',
      data : change_data
    };
  }
}

function get_item_field(name) {
  return function(task, change, item) {
    return item[name];
  };
}

var timeToControl = -1000;
var checklist = [{
    name : 'Priority control',
    filters : [
      filter_check_projects(['OTT']),
      filter_change_fields(['priority']),
      filter_change_time(timeToControl)
    ],
    authorizations : [
      filter_change_authorized_author(['konstantin.zubkov'])
    ],
    actions : [
      action_rollback_field_value('priority', 'id', get_item_field('from'))
    ]
  },
  {
    name : 'Code review transition control',
    filters : [
      filter_check_projects(['OTT']),
      filter_change_fields(['status']),
      filter_change_time(timeToControl),
      function transiontion_check(task, change, item) {
        return item.fromString === "Code Review" && item.toString === "Merge Ready";
      }
    ],
    authorizations_mode : 'ANY',
    authorizations : [
      filter_change_authorized_author(['konstantin.zubkov']),
      function check_reviewer(task, change, item) {
        return task.fields.customfield_10024.key === change.author.key;
      }
    ],
    actions : [
      action_rollback_field_value('status', 'id', get_item_field('from'))
    ]
  },
  {
    name : 'Planned label controle',
    filters : [
      filter_check_projects(['OTT']),
      filter_change_fields(['labels']),
      filter_change_time(timeToControl),
      function transiontion_check(task, change, item) {
        var label_was = item.fromString.toLowerCase().indexOf('planned') > -1;
        var label_is  = item.toString.toLowerCase().indexOf('planned') > -1;
        return (label_was && !label_is) || (!label_was && label_is);
      }
    ],
    authorizations_mode : 'ANY',
    authorizations : [
      filter_change_authorized_author(['konstantin.zubkov']),
      function check_reviewer(task, change, item) {
        return task.fields.customfield_10024.key === change.author.key;
      }
    ],
    actions : [
      action_rollback_field_value('labels', null, function(task, change, item) {
        var label_was = item.fromString.toLowerCase().indexOf('planned') > -1;
        var new_value;
        if(label_was){
          new_value = item.toString + ' planned';
        }else{
          new_value = item.toString.replace(/planned/gi, '');
        }
        return new_value.split(' ').filter(function(e){ return !!e; });
      })
    ]
  }
];


loadData2('onetwotripdev.atlassian.net/rest/api/2/issue/OTT-111?expand=changelog&fields=customfield_10024', function(err, data){
  var task = data;
  // generate empty rollback info storage
  var action_required = [];

  // task has several changes
  for(var idx in task.changelog.histories){
    var history = task.changelog.histories[idx];

    // each change could have serveral items
    for(var idx2 in history.items){
      var item = history.items[idx2];

      // test current item with our protection checklist
      for(var checklist_idx in checklist){
        var need_to_process_changes = true;
        var current_checklist_item = checklist[checklist_idx];

        // filter tasks we really interested in
        for(var filters_idx in current_checklist_item.filters){
          var filter = current_checklist_item.filters[filters_idx];

          if(filter(task, history, item)){
            continue;
          }

          need_to_process_changes = false;
          break;
        }

        // we need to analize change
        if(need_to_process_changes){
          // is match all authorization criterias?
          var authorizated = current_checklist_item.authorizations_mode === 'ANY' ? false : true;

          for(var idx4 in current_checklist_item.authorizations){
            var authorizated_func = current_checklist_item.authorizations[idx4];
            // reset actions in current check item
            if(current_checklist_item.authorizations_mode === 'ANY'){
              authorizated |= authorizated_func(task, history, item);
            }else{
              authorizated &= authorizated_func(task, history, item);
            }
          }

          if(authorizated){
            // clear rollback actions
            delete action_required[checklist_idx];
          }else{
            // if not authorizated => generate rollback actions for checklist item and current filter
            action_required[checklist_idx] = [];

            for(var idx5 in current_checklist_item.actions){
              var action = current_checklist_item.actions[idx5];
              action_required[checklist_idx].push(action(task, history, item));
            }
          }
        }
      }

      console.log(history.author.key, JSON.stringify(action_required));
    }
  }

  console.log(JSON.stringify(action_required));
});



function loadData2(url, callback){
  var options = prepareOptions(url);

  https.get(options, function(res){
    // console.log('STATUS: ' + res.statusCode);
    var data = '';
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('end', function(){
      if(res.statusCode !== 200){
        return callback('BAD_STATUS_CODE:' + res.statusCode + data);
      }
      var result;
      try{
        result = JSON.parse(data);
      }
      catch(e){
        callback('parser error');
        return;
      }

      callback(null, result);
    });
  });
}

return;

// OLD VERSION ->


// Create an HTTP tunneling server
http.createServer(function (req, res) {
  if(req.url === '/favicon.ico'){
    res.end();
    return;
  }

  console.log('income:', req.url);
  if(req.url === '/status'){
    res.writeHead(200, { 'Content-Type': 'text/plain'});
    res.end(log_rollbacks.slice().reverse().concat(log_changes.slice().reverse()).join('\n'));
    return;
  }

  var params = url.parse(req.url, true);
  var msg  = [printDate(), 'change', params.query.key, params.query.user_key].join(' ');
  log_changes.push(msg);
  if(log_changes.length > 50){
    log_changes = log_changes.slice(log_changes.length - 50);
  }

  processRequest(params);
  res.end('ok');
}).listen(25678, '127.0.0.1', function(){
  console.log('ready');
});


function processRequest(params){
  var task_key;
  var rollback;
  var rollback_list;

  Step(
    function check(){
      // skip project we dont follow
      if(checked_projects.indexOf(params.query && params.query.project) === -1){
        return;
      }
      // skip action trusted users
      if(allowed_authors.indexOf(params.query && params.query.user_key) > -1){
        return;
      }
      if(!params.query.key){
        return;
      }
      task_key = params.query.key;
      // console.log('loading data');
      loadData(prepareURL(jira_url_base + jira_url_changelog, { key : task_key }), this);
    },
    function(err, data){
      if(err){
        console.log(err);
        return;
      }

      var response = JSON.parse(data);
      var hist = response.changelog.histories;
      rollback = check_field_changes(response.changelog.histories, checked_fields, allowed_authors);
      rollback_list = Object.keys(rollback);

      if(!rollback_list.length){
        return;
      }

      set_field_value(task_key, rollback, this);
    },
    function end(err, results){
      if(err){
        console.log(err);
        return;
      }

      var msg  = [printDate(), 'rollback', task_key, params.query.user_key, JSON.stringify(rollback)].join(' ');
      log_rollbacks.push(msg);

      if(log_rollbacks.length > 40){
        log_rollbacks = log_rollbacks.slice(log_rollbacks.length - 40);
      }

      console.log(msg);
    }
  );
}

function set_field_value(key, fields, callback){
  var url = prepareURL(jira_url_base + jira_url_set, { key : key });

  var postdata = { fields : {} };

  for(var name in fields){
    postdata.fields[name] = {};
    postdata.fields[name][fields[name].key] = fields[name].value;
  }

  postData(url, postdata, callback);
}

function check_field_changes(histories, fields, allowed_authors){
  var fields_change = {};
  var fields_change_allowed = {};

  for(var idx in histories){
    var history = histories[idx];
    var author = history.author.key;

    for(var idz in history.items){
      var item = history.items[idz];

      if(item.fieldtype !== 'jira'){
        continue;
      }

      // skip fields we are not interested in
      var field_info = fields.filter(function(e){
        return e.name === item.field;
      });
      if(!field_info.length){ continue; }
      var field_change_key = field_info[0].key;

      // check if authoe is in white list
      if(allowed_authors.indexOf(author) === -1){
        // bad author: need to rollback field change
        if(!fields_change[item.field]){
          fields_change[item.field] = fields_change_allowed[item.field] || {
            key   : field_change_key,
            value : item.from
          };
        }
      }else{
        // good author: leave field unchanged
        delete fields_change[item.field];
        // save allowed change
        fields_change_allowed[item.field] = {
          key   : field_change_key,
          value : item.to
        };
      }
    }
  }

  return fields_change;
}

function loadData(url, callback){
  var options = prepareOptions(url);

  https.get(options, function(res){
    // console.log('STATUS: ' + res.statusCode);
    var data = '';
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('end', function(){
      if(res.statusCode !== 200){
        return callback('BAD_STATUS_CODE:' + res.statusCode + data);
      }
      callback(null, data);
    });
  });
}

function postData(url, postdata_, callback){

  var options = prepareOptions(url, 'PUT');
  var postdata = JSON.stringify(postdata_);
  options.headers['Content-Length'] = postdata.length;

  var req = https.request(options, function(res){
    var data = '';
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('end', function(){
      if(res.statusCode !== 200 && res.statusCode !== 204){
        return callback('BAD_STATUS_CODE:' + res.statusCode + data);
      }
      callback(null, data);
    });
  });

  req.write(postdata);
  req.end();
}

function prepareURL(template, data){
  var vars = template.match(/\{[a-z]*\}/g);
  for(var idx in vars){
    var variable  = vars[idx];
    var prop_name = variable.slice(1, variable.length - 1);
    template = template.replace(variable, data[prop_name] || '');
  }

  return template;
}

function prepareOptions(url, method){
  var url_parts = url.split('/');
  var options = {
    hostname: url_parts[0],
    port: 443,
    path: '/' + url_parts.slice(1).join('/'),
    method: method || 'GET',
    headers: {
      'Content-Type': content_type,
      'Authorization': authorizationHeader
    }
  }
  return options;
}


function printDate(){
  var date = new Date(Date.now() + 3*1000*60*60);
  return date.toJSON().slice(0,19).replace('T',' ');;
}




/*
Copyright (c) 2010 Tim Caswell <tim@creationix.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Inspired by http://github.com/willconant/flow-js, but reimplemented and
// modified to fit my taste and the node.JS error handling system.
function Step() {
  var steps = Array.prototype.slice.call(arguments),
      counter, results, lock;

  // Define the main callback that's given as `this` to the steps.
  function next() {

    // Check if there are no steps left
    if (steps.length === 0) {
      // Throw uncaught errors
      if (arguments[0]) {
        throw arguments[0];
      }
      return;
    }

    // Get the next step to execute
    var fn = steps.shift();
    counter = 0;
    results = [];

    // Run the step in a try..catch block so exceptions don't get out of hand.
    try {
      lock = true;
      var result = fn.apply(next, arguments);
    } catch (e) {
      // Pass any exceptions on through the next callback
      next(e);
    }

    // If a syncronous return is used, pass it to the callback
    if (result !== undefined) {
      next(undefined, result);
    }
    lock = false;
  }

  // Add a special callback generator `this.parallel()` that groups stuff.
  next.parallel = function () {
    var i = counter;
    counter++;
    function check() {
      counter--;
      if (counter === 0) {
        // When they're all done, call the callback
        next.apply(null, results);
      }
    }
    return function () {
      // Compress the error from any result to the first argument
      if (arguments[0]) {
        results[0] = arguments[0];
      }
      // Send the other results as arguments
      results[i + 1] = arguments[1];
      if (lock) {
        process.nextTick(check);
        return;
      }
      check();
    };
  };

  // Generates a callback generator for grouped results
  next.group = function () {
    var localCallback = next.parallel();
    var counter = 0;
    var result = [];
    var error = undefined;
    // Generates a callback for the group
    return function () {
      var i = counter;
      counter++;
      function check() {
        counter--;
        if (counter === 0) {
          // When they're all done, call the callback
          localCallback(error, result);
        }
      }
      return function () {
        // Compress the error from any result to the first argument
        if (arguments[0]) {
          error = arguments[0];
        }
        // Send the other results as arguments
        result[i] = arguments[1];
        if (lock) {
          process.nextTick(check);
          return;
        }
        check();
      };

    };
  };

  // Start the engine an pass nothing to the first step.
  next([]);
}

// Tack on leading and tailing steps for input and output and return
// the whole thing as a function.  Basically turns step calls into function
// factories.
Step.fn = function StepFn() {
  var steps = Array.prototype.slice.call(arguments);
  return function () {
    var args = Array.prototype.slice.call(arguments);

    // Insert a first step that primes the data stream
    var toRun = [function () {
      this.apply(null, args);
    }].concat(steps);

    // If the last arg is a function add it as a last step
    if (typeof args[args.length-1] === 'function') {
      toRun.push(args.pop());
    }


    Step.apply(null, toRun);
  };
};
