(function (){
  /*
  * Place where the data from JIRA is stored
  */
  function TaskStorage(){
    this.persons = {};
    this.tasks = [];
  };
  window.TaskStorage = TaskStorage;

  TaskStorage.prototype.addPerson = function(login, displayName, avatar){
    if(!this.persons[login]){
      this.persons[login] = {
        displayName : displayName,
        avatar : avatar,
        login : login
      };
    }
    else if(!this.persons[login].displayName){
      this.persons[login].displayName = displayName;
      this.persons[login].avatar = avatar;
    }
  };

  TaskStorage.prototype.addPersonTask = function(login, task){
    if(!this.persons[login]){
      this.persons[login] = {};
    }
    if(!this.persons[login].tasks){
      this.persons[login].tasks = [];
    }
    this.tasks.push(task);
    this.persons[login].tasks.push(task);
  };

  TaskStorage.prototype.getPersons = function(logins){
    if(logins instanceof Array){
      var persons = [];
      for(var idx in logins){
        var login = logins[idx];
        var person = this.persons[login];

        if(!person){
          person = {
            displayName : login,
            login : login,
            tasks : []
          };
        }
        persons.push(person);
      }

      return persons;
    }
    // or just find a person
    return this.persons[logins];
  };

  TaskStorage.prototype.applyTasksFilter = function(tasks, filter_options){
    return this.getTasks.call({ tasks : tasks }, filter_options);
  };

  TaskStorage.prototype.getTasks = function(filter_options){
    var filtered_tasks = [];
    var login          = filter_options.login;
    var statuses       = filter_options.statuses;
    var project        = filter_options.project;
    var task_sorter    = filter_options.task_sorter;
    var subtasks       = filter_options.subtasks;
    var group          = filter_options.group;

    for(var i = 0; i < this.tasks.length; i++){
      var task = this.tasks[i];

      // filter by login
      if(login){
        if(login instanceof Array){
          if(login.indexOf(task.login) === -1){
            continue
          }
        }
        else if(task.login !== login){
          continue;
        }
      }

      // filter by project
      if(project){
        if(project !== task.project){
          continue;
        }
      }

      // filter tasks if subtask criteria not match
      if(subtasks !== undefined){
        if(subtasks != !!task.subtasks){
          continue;
        }
      }

      // filter by statuses
      if(!statuses){
        filtered_tasks.push(task);
      }
      // list of allowed/denied statuseses
      else if(statuses instanceof Array){
        var include = undefined; // it is important to inizialize it here!

        for(var idx in statuses){
          var status = statuses[idx];
          // in reject mode, task will be included only if all statuese are not exists
          if(status[0] === '!'){
            if(include === undefined){
              include = true;
            }
            if(status.slice(1) === task.status){
              include = false;
              break;
            }
          }
          // in direct mode, task will be included if any of statuses is exist
          else if(status === task.status){
            include = true;
            break;
          }
        }
        // do iclude action if needed
        if(include){
          filtered_tasks.push(task);
        }
      }
      // just one statuses string
      else if(statuses === task.status || (statuses[0] === '!' && statuses.slice(1) !== task.status)){
        filtered_tasks.push(task);
      }
    }

    if(group instanceof Object){
      var keys = group.keys;
      var aggs = group.aggregates;
      var grouped = {};

      for(var i in filtered_tasks){
        var task = filtered_tasks[i];
        // build task key
        var key = keys.map(function(k){ return task[k]}).join();
        // add first element
        if(!grouped[key]){
          grouped[key] = task;
          grouped[key].grouped_elements = 1;
          continue;
        }
        grouped[key].grouped_elements++;
        // process aggregation
        for(var i2 in aggs){
          var ag = aggs[i2];
          // sum the values
          if(ag.name === 'sum'){
            for(var i3 in ag.values){
              var value = ag.values[i3];
              grouped[key][value] += task[value];
            }
          }
        }
      }

      // build new array from grouped tasks
      filtered_tasks = [];
      for(var key in grouped){
        filtered_tasks.push(grouped[key]);
      }
    }

    if(task_sorter){
      filtered_tasks.sort(task_sorter);
    }

    return filtered_tasks;
  };

  TaskStorage.prototype.clear = function(login, status, sort){
    this.persons = {};
    this.tasks = [];
  };

})();