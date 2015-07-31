(function(){
  /*
  * Main program
  */
  // constants
  var URL_ICON_LOADING = 'https://s3.eu-central-1.amazonaws.com/ott-static/images/jira/ajax-loader.gif';
  var SUBTASK_QUERY = '/jira/api/2/issue/{key}?fields=timespent';
  var JIRA_QUERY = '/jira/api/2/search?maxResults=2000' +
    '&fields=key,description,project,priority,worklog,summary,timespent' +
    '&jql=(worklogDate >= -%DAYS_TO_ANALIZE%d) AND assignee IN (%DEVTEAM%) ORDER BY updated';

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
            // updated       : new Date(issue.get('fields.updated')),
            timespent      : utils.timespentToHours(worklog.get('timeSpentSeconds'))
          };

          utils.rewrite_task(OPTIONS.TASK_REWRITE_RULES, task);
          storage.addPersonTask(task.login, task);
        }
      };
    };

    var drawBlocksTable = function(max_days, max_work_hours){
      var people = storage.getPersons(DEVTEAM);
      
      var bar_height = 40;

      var width = layout.getBlockWidth();
      var height = people.length * bar_height;
      var top_margin = 30;
      var bottom_margin = 100;
      var left_margin = 230;
      var max_time = 8 /* work hours*/ * max_days;

      var svg = d3.select(MAIN_CONTAINER).append("svg")
        .attr("width", width)
        .attr("height", height + top_margin + bottom_margin)
        .append("g")
        .attr("transform", "translate(" + left_margin + "," + top_margin+ ")");

      // build color line from red to violet per each man
      var person_color = function(person, task){
        if(person.color_counter === undefined){
          person.color_counter = 0;
          person.color_step = 360 / person.tasks.length;
          person.task_keys = {};
        }

        if(!person.task_keys[task.key]){
          person.color_counter += person.color_step;
          person.task_keys[task.key] = d3.hsl(person.color_counter, 0.6, 0.5);
        }

        return person.task_keys[task.key];
      }

      var x = d3.scale.linear()
          .range([0, width])
          .domain([0, max_time])

      var y = d3.scale.linear()
          .range([height, 0])
          .domain([0, people.length])

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .ticks(20)
          .tickFormat(function(d){
            return d+'h';
          })

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + -top_margin + ")")
          .call(xAxis);

      // DRAW NAMES
      svg.append("g").attr("transform", "translate(-10, 7)")
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
      svg.selectAll(".bar")
          .data(people)
        .enter().append("g")
          .selectAll(".tasks")
          .data(function(d){
            return d.tasks;
          })
        .enter().append("rect")
          .attr("class", "bar")
          .attr("width", function(task, i, p){
            var timespent = task.timespent;
            if(people[p].offset === undefined){
              people[p].offset = 0;
            }            
            task.offset = people[p].offset;
            people[p].offset += timespent;
            return x(timespent);
          })
          .attr("x", function(task, i, p){
            return x(task.offset)  /* block shift */;
          })
          .attr("y", function(d, i, p) {
            return height - y(p);
          })
          .attr("height", bar_height*0.9)
          .on('mouseover', function(task){
            console.log([task.login, task.key, Math.round(10*task.offset)/10].join(' '))
          })
          .attr('fill', function(task, i, p){
            return person_color(people[p], task);
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
      .append("text")
        // .attr("transform", "rotate(0)")
        .attr("y", height)
        .attr("dy", "18px")
        .style("text-anchor", "start")
        .text("Week work hours");

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


