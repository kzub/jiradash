(function(){
  /*
  * Main program
  */
  // constants
  var URL_ICON_LOADING = 'https://s3.eu-central-1.amazonaws.com/ott-static/images/jira/ajax-loader.gif';
  var JIRA_QUERY = '/monitor/jira/api/2/search?maxResults=2000' +
    '&fields=key,description,project,priority,worklog,summary,timespent,updated' +
    '&jql=(worklogDate >= -%DAYS_TO_ANALIZE%d) AND worklogAuthor IN (%DEVTEAM%) ORDER BY updated';

  var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';
  var WORKLOG_QUERY = '/monitor/jira/api/2/issue/{key}/worklog';

  function ENGINE(DEVTEAM, DAYS_TO_ANALIZE, MAIN_CONTAINER, OPTIONS){
    var self = this;
    var initialized;
    var storage = new window.TaskStorage();
    var layout  = new window.TaskLayout(OPTIONS);
    var network = new window.Network();
    var utils   = new window.Utils(OPTIONS);
    var drawlib = new window.DrawLib();
    var loading_queue = 0;

    var processResults= function(data, callback){
      var timeLimit = new Date() - DAYS_TO_ANALIZE*1000*60*60*24;

      for(var idx = 0; idx < data.issues.length; idx++){
        var issue = new utils.Extractor(data.issues[idx]);
        var worklog_info = issue.get('fields.worklog');
        var worklogs = issue.get('fields.worklog.worklogs');

        // if worklog doesn't fit load it
        if(worklog_info.total > worklog_info.maxResults){
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
              processResults({ issues : [issue_pointer] }, callback);
            });
          })(data.issues[idx]);
          continue;
        }

        for(var idx2 = 0; idx2 < worklogs.length; idx2++){
          var worklog = new utils.Extractor(worklogs[idx2]);

          var displayName = worklog.get('author.displayName');
          var login       = worklog.get('author.name');
          var avatar      = worklog.get('author.avatarUrls.48x48');
          var time        = new Date(worklog.get('started')); // could be used 'started' ot 'created'

          // skip old work log tracks
          if(time < timeLimit){
            continue;
          }

          storage.addPerson(login, displayName, avatar);

          var task = {
            login         : login,
            priorityIcon  : issue.get('fields.priority.iconUrl'),
            key           : issue.get('key'),
            summary       : issue.get('fields.summary'),
            description   : issue.get('fields.description'),
            project       : issue.get('fields.project.key'),
            updated       : new Date(issue.get('fields.updated')),
            timespent      : utils.timespentToHours(worklog.get('timeSpentSeconds'))
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

      var people_info = {};

      var bar_height = 18;
      var bar_margin = 4;
      var top_margin = 30;
      var bottom_margin = 10;
      var left_margin = 160;
      var right_margin = 00;
      var max_time = 8 /* 5 work days in a week */ * (DAYS_TO_ANALIZE - (2*(DAYS_TO_ANALIZE/7|0)));
      var TIME_TO_SHOW_UP_TASK_NAME = 16;

      var width = layout.getBlockWidth();
      var height = people.length * (bar_height + bar_margin);

      var svg = d3.select(MAIN_CONTAINER).append("svg")
        .attr("width", width + right_margin)
        .attr("height", height + top_margin + bottom_margin)
        .append("g")
        .attr("transform", "translate(" + left_margin + "," + top_margin+ ")");

      // build color line from red to violet per each man
      var person_color = function(person, task){
        if(person.color_counter === undefined){
          person.color_counter = 30;
          person.color_step = 360 / person.tasks.length;
          if(person.color_step > 20){
            person.color_step = 20;
          }
          person.task_keys = {};
        }

        if(!person.task_keys[task.key]){
          person.task_keys[task.key] = d3.hsl(person.color_counter, 0.9, 0.5);
          person.color_counter += person.color_step;
          if(person.color_counter > 360){
            person.color_counter = 0;
          }
        }

        return person.task_keys[task.key];
      }

      var x = d3.scale.linear()
          .range([0, width - left_margin])
          .domain([0, max_time*1.05])

      var y = d3.scale.linear()
          .range([height, 0])
          .domain([0, people.length])

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .ticks(10)
          .tickFormat(function(d){
            return d+'h';
          })

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + -top_margin + ")")
          .call(xAxis);

      // DRAW NAMES
      svg.append("g")
        .attr("transform", "translate(-10, 0)")
        .selectAll(".names")
        .data(people)
      .enter().append("text")
      .attr("x", function(task, i, p){
        return 0;
      })
      .attr("y", function(d, i, p) {
        return height - y(i);
      })
      .text(function(p){
        return p.displayName
      })
      .attr('class', 'text-timespent-names')

      // DRAW SPENTLINE
      var man_line = svg.selectAll(".bar-back")
          .data(people)
        .enter().append("g")

      // background BIG WHITE BAR
      man_line.append('rect')
        .attr("x", 0)
        .attr("y", function(person, i) {
          return height - y(i);
        })
        .attr("height", bar_height)
        .attr("width", function(person){
          var person_timespent = d3.sum(person.tasks, function(t){
            return t.timespent;
          })
          return x(person_timespent);
        })
        .attr('class', 'man-timespent-background')

      // lines with tasks (TIMESPEND)
      man_line = man_line.selectAll(".tasks")
        .data(function(person){
          // get tasks by person
          return storage.applyTasksFilter(person.tasks, {
            group: {
              keys : ['login', 'key'],
              aggregates : [{ name : 'sum', values : ['timespent']}]
            },
            task_sorter : utils.task_sorter_updated_reverse
          });
        })
      .enter().append("g")

      man_line.append("a")
        .attr("xlink:href", function(task){
          return utils.prepareURL(TASK_LINK, task);
        })
        .attr('target', '_blank')
        .attr('xlink:title', function(task){
          return [task.key, task.summary, Math.round(10*task.timespent)/10 + 'h'].join(' ');
        })
        .append('rect')
        .attr("class", "bar")
        .attr("width", function(task, i, p){
          var timespent = task.timespent;

          if(!people_info[p]){
            people_info[p] = {
              offset : 0,
              tasks  : people[p].tasks
            };
          }
          task.offset = people_info[p].offset;
          people_info[p].offset += timespent;

          var bar_width = x(timespent) - 1;
          if(bar_width < 1){
            bar_width = 1;
          }
          return bar_width;
        })
        .attr("x", function(task, i, p){
          return x(task.offset) /* block shift */;
        })
        .attr("y", function(d, i, p) {
          return height - y(p);
        })
        .attr("height", bar_height)
        .attr('fill', function(task, i, p){
          return person_color(people_info[p], task);
        })
      // TASKS KEY (OTT-XXXX)
      man_line.append('text')
        .attr("x", function(task, i, p){
          return x(task.offset) /* block shift */;
        })
        .attr("y", function(d, i, p) {
          return height - y(p);
        })
        .text(function(d){
          return d.key;
        })
        .attr('class', 'text-task-keys')
        .style('visibility', function(task){
          return task.timespent < TIME_TO_SHOW_UP_TASK_NAME ? 'hidden' : '';
        })

      // NORMAIL AMOUNT OF WORK
      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(0)

      svg.append("g")
        .attr("transform", "translate(" + x(max_time) + ", 0)")
        .attr("class", "y axis")
        .call(yAxis)
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
      if(!initialized){
        self.drawMsg('loading...');
      }

      // replace vars in templae
      var query = JIRA_QUERY
        .replace('%DEVTEAM%', DEVTEAM.join(','))
        .replace('%DAYS_TO_ANALIZE%', DAYS_TO_ANALIZE);

      network.load([query], function(err, data){
        initialized = true;

        if(err){
          self.drawMsg([err.status, err.statusText].join(' '));
          callback(err);
        }
        else if(data){
          storage.clear();

          processResults(data[0], function(){
            self.clearScreen();
            drawBlocksTable();
            callback(null, data);
          });
        }
      });
    };
  }

  window.TaskTimespend = ENGINE;
})();


