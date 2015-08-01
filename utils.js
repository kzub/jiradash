(function(){
  /*
  * some utils for runnung engine
  */

  var PRIORITY_RANK = {
    'ASAP'     : 0,
    'Critical' : 1,
    'Very High': 2,
    'High'     : 3,
    'Normal'   : 4
  };

  function Utils(OPTIONS){
    this.prepareURL = function(template, data){
      if(!template) {
        return;
      }

      var vars = template.match(/\{[a-z]*\}/g);
      for(var idx in vars){
        var variable = vars[idx];

        if(variable === '{login}'){
          template = template.replace(variable, data.login || '');
          continue;
        }

        if(variable === '{logins}'){
          template = template.replace(variable, data.logins ? data.logins.join(',') : '');
          continue;
        }

        if(variable === '{statuses}'){
          if(data.statuses instanceof Array){
            var statusQuery = '';
            for(var idx in data.statuses){
              var status = data.statuses[idx];

              if(statusQuery){
                statusQuery += (status[0] === '!' ? ' AND ' : ' OR ');
              }

              if(status[0] === '!'){
                statusQuery += ("status != '" + status.slice(1)) + "'";
              }
              else{
               statusQuery += ("status = '" + status + "'");
              }
            }
            template = template.replace(variable, statusQuery);
            continue;
          }
          else if(data.statuses){
            template = template.replace(variable, data.statuses);
            continue;
          }
          /* no filter */
          template = template.replace(variable, 'createdDate < endOfYear()');
          continue;
        }

        if(variable === '{key}'){
          template = template.replace(variable, data.key || '');
          continue;
        }

        if(variable === '{project}'){
          template = template.replace(variable, data.project || '');
          continue;
        }
      }

      return template;
    };

    this.rewrite_task = function(TASK_REWRITES, task){
      if(!TASK_REWRITES || !TASK_REWRITES.length){
        return;
      }

      for(var idx in TASK_REWRITES){
        var apply = true;
        var rule = TASK_REWRITES[idx];

        for(var key in rule.conditions){
          if(rule.conditions[key].indexOf(task[key]) === -1){
            apply = false;
            break;
          }
        }

        if(apply){
          for(var key in rule.actions){
            task[key] = rule.actions[key];
          }
        }
      }
    };

    // this class helps extract the value
    this.Extractor = function(issue){
      this.get = function(path){
        var elements = path.split('.');
        var pointer  = issue;

        for(var i in elements){
          pointer = pointer[elements[i]];
          if(!pointer){
            return;
          }
        }

        return pointer;
      };
    };

    this.timespentToHours = function(timespent){
      if(!timespent){
        return 0;
      }
      return timespent/3600;
    };

    this.timespentFormater = function(timespent){
      var symb = '';
      var value;

      if(timespent > 100){
        value = Math.ceil(timespent);
      }
      else if(timespent > 0){
        value = Math.ceil(timespent) + symb;
      }
      else{
        return '';
      }

      return value;
    };

    this.PRIORITY_RANK = function(r){
      if(isFinite(PRIORITY_RANK[r])){
        return PRIORITY_RANK[r];
      }
      return 10000; // very low rank
    };

    var scale  = 1000;
    var calcTaskRank = function(t){
      var a = 0;
      for(var i in t.rank){
        a += (1/(+i+1))*t.rank.charCodeAt(i);
      }
      return a;
    };

    var today = Date.now();
    var calcTaskAge = function(t){
      var age = (1-(today - t.updated)/today)*1000;
      return age;
    }

    this.task_sorter_default = function(a, b){
      var power =
        (a.priority*scale + calcTaskRank(a) + calcTaskAge(a))
        -
        (b.priority*scale + calcTaskRank(b) + calcTaskAge(b));
      return power;
    };

    this.task_sorter_updated = function(a, b){
      return b.updated - a.updated;
    };

    this.task_sorter_project_attribute = function(a, b){
      return !!a.project - !!b.project;
    };

    this.task_sorter_timespent = function(a, b){
      return b.timespent - a.timespent;
    };
  };

  window.Utils = Utils;
})();