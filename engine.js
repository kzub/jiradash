(function(){
  /*
  * Main program
  */
  // constants
  var url_icon_loading = 'https://s3.eu-central-1.amazonaws.com/ott-static/images/jira/ajax-loader.gif';
  var subtask_query = '/jira/api/2/issue/{key}?fields=timespent';

  function ENGINE(MAIN_CONTAINER, OPTIONS){
    var self = this;
    var initialized;
    var storage = new window.TaskStorage();
    var layout  = new window.TaskLayout(OPTIONS);
    var network = new window.Network();
    var utils   = new window.Utils(OPTIONS);
    var drawlib = new window.DrawLib();

    var TASK_REWRITE_RULES = OPTIONS.TASK_REWRITE_RULES || [];
    var PRIORITY_RANK = function(r){
      if(OPTIONS.PRIORITY_RANK && isFinite(OPTIONS.PRIORITY_RANK[r])){
        return OPTIONS.PRIORITY_RANK[r];
      }
      return 10000; // very low rank
    }

    var processResults= function(data){
      for(var i = 0; i < data.issues.length; i++){
        var issue = data.issues[i];

        if(!issue.fields.assignee){
          issue.fields.assignee = {
            name : 'unassigned',
            avatarUrls : {}
          };
        }

        if(issue.fields.assignee){
          var displayName = issue.fields.assignee.displayName;
          var email       = issue.fields.assignee.emailAddress;
          var login       = issue.fields.assignee.name;
          var avatar      = issue.fields.assignee.avatarUrls['48x48'];

          storage.addPerson(login, displayName, avatar);

          var task = {
            login         : login,
            status        : issue.fields.status.name,
            priorityIcon  : issue.fields.priority.iconUrl,
            priority      : PRIORITY_RANK(issue.fields.priority.name),
            rank          : issue.fields.customfield_10300,
            key           : issue.key,
            subtasks      : issue.fields.subtasks.length,
            summary       : issue.fields.summary,
            description   : issue.fields.description,
            project       : issue.fields.project.key,
            timespent     : utils.timespentToHours(issue.fields.timespent)
          };

          utils.rewrite_task(TASK_REWRITE_RULES, task);

          // laod all the data associated with task
          if(issue.fields.subtasks.length){
            // load task data
            var urls = [utils.prepareURL(subtask_query, task)];

            // prepare url for subtasks loading
            for(var k = 0; k < issue.fields.subtasks.length; k++){
              var subtask = issue.fields.subtasks[k];
              urls.push(utils.prepareURL(subtask_query, subtask));
            }
            // clear subtask time spend util it loaded complete
            task.timespent = '*';

            // add tasks for sequental loading
            network.load(task, urls, function(err, context, results){
              var timespent = 0;
              for(var idx in results){
                var subtask = results[idx];
                timespent += utils.timespentToHours(subtask.fields.timespent);
              }
              // update calculated timespent
              context.timespent = timespent;
              // if context hidden by limit, it doesnt have update function;
              if(context.update){
                context.update();
              }
            });
          }

          storage.addPersonTask(task.login, task);
        }

        // if(issue.fields.subtasks.length){ console.log(issue); }
      };
    };

    var drawLineTextFromTask = function(block, task, paper, y, update_elms){
      //  mark tasks with subtasks
      var css_name = task.status.replace(/ /g, '_').toLowerCase();
      if(task.subtasks){
        css_name += ' subtasks';
      }

      var timespent      = task.timespent === '*' ? '' : task.timespent;
      var task_url       = utils.prepareURL(block['task_links'], task);
      var task_url_title = (task.summary || '') + (task.description || '');

      // when update data is done and update() is called
      if(update_elms){
        // update timespent
        update_elms[0].changeText(utils.timespentFormater(timespent));
        // update prioirty icon
        update_elms[1].changeImage(task.priorityIcon);
        return;
      }

      // save elements to have pointer to them on update ^^
      var elements = [];
      var text_element;

      // timespent
      text_element = paper.text(25, y-1, utils.timespentFormater(timespent), task_url, task_url_title);
      text_element.setAttribute('class', css_name + ' text-hours');
      elements.push(text_element);

      // priority icon or loading symbol...
      if(task.timespent === '*'){
        elements.push(paper.img(27, y-14, 16, 16, url_icon_loading));
      }else{
        elements.push(paper.img(27, y-14, 16, 16, task.priorityIcon));
      }

      // task key
      text_element = paper.text(46, y, task.key, task_url, task_url_title);
      text_element.setAttribute('class', css_name + ' text-task-number');
      text_element.setAttributeNS("http://www.w3.org/XML/1998/namespace", 'textLength', '3');
      elements.push(text_element);

      // task summary
      text_element = paper.text(134, y, task.summary, task_url, task_url_title);
      text_element.setAttribute('class', css_name + ' text-summary');
      elements.push(text_element);

      return elements;
    };

    this.draw = function(BLOCKS){
      // MAIN CODE:
      for(var idx in BLOCKS){
        var title = '';
        var block = BLOCKS[idx];

        if(block.skip){
          layout.nextWindow();
          continue;
        }

        if(block.title){
          title = block.title;
        }
        else if(block.login){
          var person = storage.getPersons(block.login);
          title = person && person.displayName || block.login;
        }

        var block_data = {
          title : title,
          tasks : storage.getTasks(block.login || block.logins, block.statuses, block.project, utils.task_sorter)
        };

        // create box
        var container = document.createElement("div");
        container.setAttribute('class', 'man');
        container.style.width = layout.getBlockWidth() + 'px';
        MAIN_CONTAINER.appendChild(container);

        // init SVG
        paper = new drawlib.paper(container);
        paper.setStyle('width', container.style.width);
        // generate from template and block data
        var title_url = utils.prepareURL(block['title_link'], block);
        // add names
        paper.text(0, layout.getLine(1), block_data.title, title_url).setAttribute('class', 'man_name');

        var tasks_to_display = 2;
        // add tasks
        for(var i in block_data.tasks){
          var task = block_data.tasks[i];

          var y = layout.getLine();
          var elms = drawLineTextFromTask(block, task, paper, y);

          // define update function (used when subtasks data updated)
          task.update = (function(t, b, e){
            return function(){
              drawLineTextFromTask(b, t, null, null, e);
            };
          })(task, block, elms);

          // draw not all tasks but as block limit require
          var left = block_data.tasks.length - 1 - i;
          if(left){
            tasks_to_display++;
          }

          if(i > block.limit - 1){
            if(left){
              paper.text(0, y + 18, left + ' more ...', title_url);
            }
            break;
          }
        }

        // adjust block deminition
        var height = tasks_to_display * layout.getLineHeight();
        paper.setAttribute('height', height);

        container.style.left   = layout.getBlockLeft() + 'px';
        container.style.top    = layout.getBlockHeight() + 'px';
        container.style.height = height + 'px';

        layout.addBlockHeight(height);
        layout.nextWindow();
      }
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


    this.loadData = function(query, callback){
      if(!initialized){
        self.drawMsg('loading...');
      }

      network.load([query], function(err, data){
        self.clearScreen();
        initialized = true;

        if(err){
          self.drawMsg([err.status, err.statusText].join(' '));
          callback(err);
        }
        else if(data){
          storage.clear();
          processResults(data[0]);
          callback(null, data);
        }
      });
    };
  }

  window.TaskEngine = ENGINE;
})();


