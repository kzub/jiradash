(function(){
  /*
  * Main program
  */
  // constants
  var URL_ICON_LOADING = 'https://s3.eu-central-1.amazonaws.com/ott-static/images/jira/ajax-loader.gif';
  var JIRA_QUERY = '/jira/api/2/search?maxResults=2000' +
    '&fields=key,description,project,priority,worklog,summary,timespent,updated' +
    '&jql=(worklogDate >= -%DAYS_TO_ANALIZE%d) AND worklogAuthor IN (%DEVTEAM%) ORDER BY updated';

  var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';

  function ENGINE(DEVTEAM, MAIN_CONTAINER, OPTIONS){
    var self = this;
    var initialized;
    var storage = new window.TaskStorage();
    var layout  = new window.TaskLayout(OPTIONS);
    var network = new window.Network();
    var utils   = new window.Utils(OPTIONS);
    var drawlib = new window.DrawLib();
window.storage = storage;

    var processResults= function(data, DAYS_TO_ANALIZE){
      var timeLimit = new Date() - DAYS_TO_ANALIZE*1000*60*60*24;

      for(var idx = 0; idx < data.issues.length; idx++){
        var issue = new utils.Extractor(data.issues[idx]);
        var worklogs = issue.get('fields.worklog.worklogs');

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
            // status        : issue.get('fields.status.name'),
            priorityIcon  : issue.get('fields.priority.iconUrl'),
            // priority      : utils.PRIORITY_RANK(issue.get('fields.priority.name')),
            // rank          : issue.get('fields.customfield_10300'),
            key           : issue.get('key'),
            // subtasks      : issue.get('fields.subtasks.length'),
            summary       : issue.get('fields.summary'),
            description   : issue.get('fields.description'),
            project       : issue.get('fields.project.key'),
            // timespent     : utils.timespentToHours(issue.get('fields.timespent')),
            updated       : new Date(issue.get('fields.updated')),
            timespent      : utils.timespentToHours(worklog.get('timeSpentSeconds'))
          };

          utils.rewrite_task(OPTIONS.TASK_REWRITE_RULES, task);
          storage.addPersonTask(task.login, task);
        }
      };
    };

    var drawBlocksTable = function(max_days, max_work_hours){
      var people = storage.getPersons(DEVTEAM);

      var bar_height = 18;
      var bar_margin = 4;
      var top_margin = 30;
      var bottom_margin = 10;
      var left_margin = 160;
      var right_margin = 00;
      var max_time = 8 /* work hours*/ * (max_days - (1.5*(max_days/7|0)));

      var width = layout.getBlockWidth();
      var height = people.length * (bar_height + bar_margin);
      var time_to_show_up_task_name = 2 * max_work_hours / (max_days - (2*(max_days/7|0)));
      // console.log('time_to_show_up_task_name', time_to_show_up_task_name);

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
          if(person.color_step > 10){
            person.color_step = 10;
          }
          person.task_keys = {};
        }

        if(!person.task_keys[task.key]){
          person.task_keys[task.key] = d3.hsl(person.color_counter, 0.9, 0.5);
          person.color_counter += person.color_step;
        }

        return person.task_keys[task.key];
      }

      var x = d3.scale.linear()
          .range([0, width - left_margin])
          .domain([0, max_time])

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
          if(people[p].offset === undefined){
            people[p].offset = 0;
          }
          task.offset = people[p].offset;
          people[p].offset += timespent;
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
        // .on('mouseover', function(task){
        //   console.log([task.login, task.key, Math.round(10*task.offset)/10].join(' '))
        // })
        .attr('fill', function(task, i, p){
          // return 'steelblue';
          return person_color(people[p], task);
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
          return task.timespent < time_to_show_up_task_name ? 'hidden' : '';
        })


      // NORMAIL AMOUNT OF WORK
      var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(0)

      svg.append("g")
        .attr("transform", "translate(" + x(max_work_hours) + ", 0)")
        .attr("class", "y axis")
        .call(yAxis)
      // .append("text")
      //   // .attr("transform", "rotate(0)")
      //   .attr("y", height)
      //   .attr("dy", "10px")
      //   .style("text-anchor", "end")
      //   .text("deadline");
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

    this.process = function(DAYS_TO_ANALIZE, WORK_HOURS, callback){
      if(!initialized){
        self.drawMsg('loading...');
      }

      // replace vars in templae
      var query = JIRA_QUERY
        .replace('%DEVTEAM%', DEVTEAM.join(','))
        .replace('%DAYS_TO_ANALIZE%', DAYS_TO_ANALIZE);

      network.load([query], function(err, data){
        self.clearScreen();
        initialized = true;

        if(err){
          self.drawMsg([err.status, err.statusText].join(' '));
          callback(err);
        }
        else if(data){
          storage.clear();

          processResults(data[0], DAYS_TO_ANALIZE);
          drawBlocksTable(DAYS_TO_ANALIZE, WORK_HOURS);
          callback(null, data);
        }
      });
    };
  }

  window.TaskTimespend = ENGINE;
})();


