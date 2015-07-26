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
        avatar : avatar
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

  TaskStorage.prototype.getPersons = function(login){
    if(login){ return this.persons[login]; }
    return this.persons;
  };

  TaskStorage.prototype.getTasks = function(login, statuses, project, task_sorter){
    var filtered_tasks = [];

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