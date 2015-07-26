(function(){
  /*
  * some utils for runnung engine
  */
  function Utils(){
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

    var scale = 10000;
    var calcTaskRank = function(s){
      var a = 0;
      for(var i in s){
        a += (1/(+i+1))*s.charCodeAt(i);
      }
      return a;
    };

    this.task_sorter = function(a, b){
      return (a.priority*scale + calcTaskRank(a.rank)) - (b.priority*scale + calcTaskRank(b.rank));
    };
  };

  window.Utils = Utils;
})();