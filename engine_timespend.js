(function(){
  /*
  * Main program
  */
  // constants
  var URL_ICON_LOADING = 'https://s3.eu-central-1.amazonaws.com/ott-static/images/jira/ajax-loader.gif';
  var JIRA_QUERY = '/monitor/jira/api/2/search?maxResults=2000' +
    '&fields=key,description,project,priority,worklog,summary,timespent,updated' +
    '&jql=(worklogDate >= -%DAYS_TO_ANALIZE%d) AND worklogAuthor = "%DEVELOPER%" ORDER BY updated';

  var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';
  var WORKLOG_QUERY = '/monitor/jira/api/2/issue/{key}/worklog';

  function ENGINE(DEVTEAM, DAYS_TO_ANALIZE, MAIN_CONTAINER, OPTIONS){
    var self = this;
    var storage = new window.TaskStorage();
    var layout  = new window.TaskLayout(OPTIONS);
    var network = new window.Network();
    var utils   = new window.Utils(OPTIONS);
    var drawlib = new window.DrawLib();
    var loading_queue = 0;
    var startDate;

    var processResults= function(data, callback){
      startDate = Date.now() - (DAYS_TO_ANALIZE)*1000*60*60*24;
      var timeLimit = utils.getDayEndMs(startDate);

      for(var idx = 0; idx < data.issues.length; idx++){
        var issue = new utils.Extractor(data.issues[idx]);
        var worklog_info = issue.get('fields.worklog');
        var worklogs = issue.get('fields.worklog.worklogs');

        // if worklog doesn't fit load it
        if(worklog_info.total > worklog_info.maxResults && !data.worklogRequest){
          loading_queue++;
          // set task to load worklog detail
          (function(issue_pointer){
            // load task data
            var url = utils.prepareURL(WORKLOG_QUERY, { key : issue.get('key') });
            network.load(undefined, [url], function(err, context, results){
              --loading_queue;
              // update worklog
              issue_pointer.fields.worklog = results[0]
              // and reprocess it
              processResults({ issues : [issue_pointer], worklogRequest: true }, callback);
            });
          })(data.issues[idx]);
          continue;
        }

        for(var idx2 = 0; idx2 < worklogs.length; idx2++){
          var worklog = new utils.Extractor(worklogs[idx2]);

          var displayName = worklog.get('author.displayName');
          var login       = worklog.get('author.displayName'); // author.login перестал существовать, author.accountId; - плохо работает, если нету ворклога, будет uuid на дашборде
          var avatar      = worklog.get('author.avatarUrls.48x48');
          var time        = utils.getTimeFormat(worklog.get('started')); // could be used 'started' ot 'created'

          // skip not releavnt worklog's
          if(time < timeLimit){
            continue;
          }
          if(DEVTEAM.indexOf(login) === -1){
            continue;
          }

          storage.addPerson(login, displayName, avatar);

          var task = {
            id            : worklog.get('id'),
            login         : login,
            priorityIcon  : issue.get('fields.priority.iconUrl'),
            key           : issue.get('key'),
            summary       : issue.get('fields.summary'),
            comment       : worklog.get('comment'),
            description   : issue.get('fields.description'),
            project       : issue.get('fields.project.key'),
            updated       : utils.getTimeFormat(issue.get('fields.updated')),
            timespent     : worklog.get('timeSpentSeconds')*1000 /* in miliseconds */,
            timespentTotal: issue.get('fields.timespent')*1000 /* in miliseconds */,
            time          : time
          };

          utils.rewrite_task(OPTIONS.TASK_REWRITE_RULES, task);
          storage.addPersonTask(task.login, task);
        }
      };

      // if all loading processes finished => callback
      if(loading_queue === 0){
        callback();
      }
    };

    var drawBlocksTable = function(){
      var people = storage.getPersons(DEVTEAM);

      var task_day_offset = {};

      var bar_height = OPTIONS.BAR_HEIGHT || 18;
      var bar_margin = bar_height / 7;
      var top_margin = 22;
      var bottom_margin = 4;
      var left_margin = 0; // DEVTEAM.reduce(function(a, b){ return ((a|0) >= b.length) || (b.length > 15) ? a|0 : b.length; }); // max name length
      var right_margin = 160; // left_margin;
      var max_time = 8 /* 5 work days in a week */ * (DAYS_TO_ANALIZE - (2*(DAYS_TO_ANALIZE/7|0)));
      var DAY_PERCENT_TO_SHOW_UP_TASK_NAME = 50;
      var HOUR = 3600000;
      var shrug_koef = 0.8;

      var ts_max = utils.getDayEndMs();
      var ts_min = utils.getDayEndMs(startDate);

      var width = layout.getBlockWidth();
      var height = people.length * (bar_height + bar_margin);
      var dates_x_shift = (width / DAYS_TO_ANALIZE)/3;

      // info about total time spent on task. Used for coloring
      var task_spent_info = storage.getTasks({
        group : {
          keys : ['login', 'key'],
          aggregates : [{ name : 'sum', values : ['timespent']}]
        },
        modifiers : [function(t){
          t.time = utils.getDayStartMs(t.time, 'date');
        }],
        resultFormat : 'group_object'
      });

      var task_coloring_helper = d3.scale.linear()
        .domain([HOUR, 25*HOUR, 50*HOUR])
        .range(['green', 'orange', 'red']);

      var person_color2 = function(task){
        var elm = task_spent_info[[task.login, task.key].join()];
        return task_coloring_helper(elm.timespentTotal);
      };

      var task_workday_percent = function(task){
        return 100*(task.timespent)/(8*HOUR);
      };

      var task_get_summary = function(task){
        return [task.key, task.summary,
        utils.timestampToHours(task.timespent, 'round') + 'h (' + utils.timestampToHours(task.timespentTotal, 'round') + 'h)',
        '\n' + task.comment].join(' ');
      };

      var x_v2 = d3.scale.linear()
          .range([0, width - left_margin - right_margin])
          .domain([ts_min, ts_max]);

      var y = d3.scale.linear()
          .range([height, 0])
          .domain([0, people.length]);

      // Draw timeline axis
      var xAxis = d3.svg.axis()
          .scale(x_v2)
          .orient("bottom")
          .tickSize(0)
          .tickValues(d3.time.days(ts_min, ts_max))
          .tickFormat(function(d){
            return new Date(d).toDateString().slice(4, 10);
          });

      // CREATE PLACE TO DRAW
      var svg = d3.select(MAIN_CONTAINER).append("svg")
        .attr("width", width)
        .attr("height", height + top_margin + bottom_margin)
        .append("g")
        .attr("transform", "translate(" + left_margin + "," + top_margin+ ")");

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate("+dates_x_shift+"," + -top_margin + ")")
          .call(xAxis);

      // DRAW NAMES (right)
      svg.append("g")
        .attr("transform", "translate(-10, 0)")
        .selectAll(".names")
        .data(people)
        .enter()
      .append("text")
        .attr("x", function(task, i, p){
          return x_v2(ts_max) + 20;
        })
        .attr("y", function(d, i, p) {
          return height - y(i);
        })
        .text(function(p){
          return p.displayName
        })
        .attr('class', 'text-timespent-names-right')

      // DRAW SPENTLINE
      var man_line = svg.selectAll(".bar-back")
          .data(people)
        .enter().append("g")

      // BACKGROUND BIG GRAY BAR
      man_line.append('rect')
        .attr("x", 0)
        .attr("y", function(person, i) {
          return height - y(i) + bar_height/2;
        })
        .attr("height", function(d){
          return 2;
        })
        .attr("width", x_v2(ts_max))
        .attr('class', function(d, i){
          if(!d.login){
            return 'man-timespent-background3';
          }
          return i % 2 === 0 ? 'man-timespent-background' : 'man-timespent-background2';
        })

      // TASK BARS (TIMESPEND)
      man_line = man_line.selectAll(".tasks")
        .data(function(person){
          // get tasks by person
          return storage.applyTasksFilter(person.tasks, {
            modifiers : [function(t){
              t.time = utils.getDayStartMs(t.time, 'date');
            }],
            task_sorter : utils.task_sorter_updated_reverse
          });
        })
      .enter().append("g");

      man_line.append("a")
        .attr("xlink:href", function(task){
          return utils.prepareURL(TASK_LINK, task);
        })
        .attr('target', '_blank')
        .attr('xlink:title', task_get_summary)
        .append('rect')
        .attr("class", "bar")
        .attr("width", function(task, i, p){
          var timespent = task.timespent;

          var bar_width = x_v2(ts_min + timespent)*(3*shrug_koef);
          if(bar_width < 1){
            bar_width = 1;
          }

          // -> for grouping one day tasks to
          if(!task_day_offset[p]){
            task_day_offset[p] = {};
          }
          // for grouping tasks per day
          if(!task_day_offset[p][task.time]){
            task_day_offset[p][task.time] = 0;
          }
          task.offset = task_day_offset[p][task.time];
          task_day_offset[p][task.time] += bar_width;

          return bar_width;
        })
        .attr("x", function(task, i, p){
          return x_v2(task.time) + task.offset;
        })
        .attr("y", function(d, i, p) {
          return height - y(p);
        })
        .attr("height", bar_height)
        .attr('fill', function(task, i, p){
          return person_color2(task);
        })

      // TASKS KEY (OTT-XXXX)
      man_line.append('a')
        .attr("xlink:href", function(task){
          return utils.prepareURL(TASK_LINK, task);
        })
        .attr('target', '_blank')
        .attr('xlink:title', task_get_summary)
        .append('text')
        .attr("x", function(task, i, p){
          return x_v2(task.time) + task.offset;
        })
        .attr("y", function(d, i, p) {
          return height - y(p);
        })
        .text(function(d){
          return d.key;
        })
        .attr('class', 'text-task-keys')
        .style('visibility', function(task){
          return task_workday_percent(task) > DAY_PERCENT_TO_SHOW_UP_TASK_NAME ? '' : 'hidden';
        })

      // NORMAL AMOUNT OF WORK (VERTICAL LINES)
      // var yAxis = d3.svg.axis()
      //   .scale(y)
      //   .orient("right")
      //   .ticks(0);

      // var yAxis2 = d3.svg.axis()
      //   .scale(y)
      //   .orient("left")
      //   .ticks(0);

      // svg.selectAll('vlines').data(d3.range(DAYS_TO_ANALIZE)).enter().append("g")
      //   .attr("transform", function(d, i){
      //     return "translate(" + x_v2(ts_min + HOUR*24)*i + ", 0)";
      //   })
      //   .attr("class", "y axis")
      //   .call(yAxis);

      // svg.selectAll('vlines2').data(d3.range(DAYS_TO_ANALIZE)).enter().append("g")
      //   .attr("transform", function(d, i){
      //     return "translate(" + x_v2(ts_min + HOUR*24)*(shrug_koef + i) + ", 0)";
      //   })
      //   .attr("class", "y axis")
      //   .call(yAxis2);
    };

    this.clearScreen = function(){
      // CLEAR SCREEN
      var node = MAIN_CONTAINER;
      while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
      }
      layout.reset();
    };

    this.drawMsg = function(text){
      var container = document.createElement("div");
      container.setAttribute('class', 'message');
      MAIN_CONTAINER.appendChild(container);
      container.innerHTML = text;
    };

    this.process = function(callback){
      drawlib.showLoader(true);
      storage.clear();
      var updaterId = setInterval(function(){
        self.clearScreen();
        drawBlocksTable();
      }, 1000);

      var queries = [];
      for (var idx in DEVTEAM) {
        var name = DEVTEAM[idx];
        if (!name) {
          continue;
        }
        var query = JIRA_QUERY
          .replace('%DEVELOPER%', name)
          .replace('%DAYS_TO_ANALIZE%', DAYS_TO_ANALIZE);
        queries.push(query);
      }

      var stop;
      var totalRequests = queries.length;
      for (var idx2 in queries) {
        setTimeout(networkRequest([queries[idx2]]), 100*idx2);
      }

      function networkRequest(q){
        return function(){
          network.load([q], queryResponseHandler);
        }
      }

      function queryResponseHandler(err, data){
        if(stop){ return; }
        totalRequests--;

        if(err){
          stop = true;
          self.drawMsg([err.status, err.statusText].join(' '));
          callback && callback(err);
          return;
        }

        if(data){
          processResults(data[0], function(){
            if(totalRequests === 0){
              clearInterval(updaterId);
              drawlib.showLoader(false);
              self.clearScreen();
              drawBlocksTable();
              callback && callback();
            }
          });
        }
      }
    };
  }

  window.TaskTimespend = ENGINE;
})();


