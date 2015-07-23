var EventEmmiter = function(){
  var self = this;
  var events = {};

  self.on = function(event, handler){
    if(!handler instanceof Function){ return; }
    events[event] = events[event] || [];
    events[event].push(handler);
  };

  var getCaller = function(func, p1, p2){
    return function(){
      func(p1, p2);
    };
  };

  self.emit = function(event, p1, p2){
    if(!events[event]){ return; }

    for(var hIdx in events[event]){
      var func = events[event][hIdx];
      setTimeout(getCaller(func, p1, p2), 0);
    }
  }
};
var events = new EventEmmiter();

/*
* Place where the data from jira is stored
*/
function Storage(){
  this.persons = {};
  this.tasks = [];
};

Storage.prototype.addPerson = function(login, displayName, avatar){
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

Storage.prototype.addPersonTask = function(login, task){
  if(!this.persons[login]){
    this.persons[login] = {};
  }
  if(!this.persons[login].tasks){
    this.persons[login].tasks = [];
  }
  this.tasks.push(task);
  this.persons[login].tasks.push(task);
};

Storage.prototype.getPersons = function(login){
  if(login){ return this.persons[login]; }
  return this.persons;
};

Storage.prototype.getTasks = function(login, statuses, task_sorter){
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

Storage.prototype.clear = function(login, status, sort){
  this.persons = {};
  this.tasks = [];
};

var storage = new Storage;

/*
* Page layout definition
*/
var LAYOUT = [[],[],[],[]];
LAYOUT.getHeight = function(col){
  var height = 0;
  for(var i in LAYOUT[col]){
    height += LAYOUT[col][i];
  }
  return height;
};
LAYOUT.addHeight = function(col, height){
  LAYOUT[col].push(height);
};
LAYOUT.x = 0;
LAYOUT.nextWindow = function(){
  if(this.x++ >= LAYOUT.length - 1){
    this.x = 0;
  }
};
LAYOUT.getWindowNum = function(){
  return this.x;
};
LAYOUT.reset = function(){
  for(var i in LAYOUT){
    if(LAYOUT[i] instanceof Array){
      LAYOUT[i] = [];
    }
  }
  LAYOUT.x = 0;
};

/*
* SVG drawing helpers
*/
function SVG(container){
  var self = this;
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  svg.setAttribute('class', 'paper');
  container.appendChild(svg);

  this.text = function(x, y, text, url){
    var txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute('x', x);
    txt.setAttribute('y', y);
    txt.textContent = text;

    if(url){
      if(url.url && (url.summary || url.description)){
        var link = makeLink(url.url, (url.summary || '') + (url.description||''));
      }else{
        var link = makeLink(url, text);
      }
      link.appendChild(txt);
      svg.appendChild(link);
    }else{
      svg.appendChild(txt);
    }
    return txt;
  };

  this.img = function(x, y, w, h, url){
    var svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
    svgimg.setAttributeNS(null,'height', w);
    svgimg.setAttributeNS(null,'width', h);
    svgimg.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href', url);
    svgimg.setAttributeNS(null,'x', x);
    svgimg.setAttributeNS(null,'y', y);
    svgimg.setAttributeNS(null, 'visibility', 'visible');
    svg.appendChild(svgimg);
    return svgimg;
  };

  function makeLink(url, description){
    var element = document.createElementNS('http://www.w3.org/2000/svg','a');
    element.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href', url);
    if(description){
      element.setAttributeNS('http://www.w3.org/1999/xlink','xlink:title', description);
    }
    element.setAttribute('target', '_blank');
    return element;
  };

  this.setAttribute = function(attr, value){
    svg.setAttribute(attr, value);
  };
};

/*
* define constants
*/
var CONST = {
  block_width   : 480,
  block_margin_x: 0,
  block_margin_y: 10,
  line_height   : 20
}

var PRIORITY_RANK = {
  'ASAP'     : 0,
  'Critical' : 1,
  'Very High': 2,
  'High'     : 3,
  'Normal'   : 4
};


var TASK_STATUSES  = ['In Progress', 'To Do', 'Open', 'WTF'];
var TASK_STATUSES  = ['!Closed', '!Done', '!Rejected', '!Merge ready', '!Test ready', '!In Release'];
var QA_TASK_STATUSES  = ['!Closed', '!Done', '!Rejected', '!Merge ready', '!In Release'];

var USER_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=assignee IN ({login}) and ({statuses}) ORDER BY priority,updated';
var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';
var STATUS_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=assignee IN ({logins}) and ({statuses}) ORDER BY priority,updated';

var DEVTEAM   = ['alexey.sutiagin','ek','fedor.shumov','aleksandr.gladkikh','andrey.ivanov','ivan.hilkov','renat.abdusalamov','anton.ipatov','Ango','alexander.litvinov','andrey.plotnikov','andrey.iliopulo','alexander.neyasov','marina.severyanova','Yury.Kocharyan','konstantin.kalinin','konstantin.zubkov','h3x3d','andrey.lakotko','anastasia.oblomova'];
var LEADLIMIT = 15;
var DEVLIMIT  = 5;

var TASK_REWRITES = [
  {
    conditions : {
      login  : ['ivan.hilkov', 'Ango', 'andrey.iliopulo', 'marina.severyanova'],
      status : ['Code Review']
    },
    actions : {
      login : 'fedor.shumov'
    }
  },
  {
    conditions : {
      login  : ['aleksandr.gladkikh', 'renat.abdusalamov', 'alexander.litvinov', 'alexander.neyasov', 'Yury.Kocharyan', 'h3x3d'],
      status : ['Code Review']
    },
    actions : {
      login : 'alexey.sutiagin'
    }
  },
  {
    conditions : {
      login  : ['andrey.ivanov', 'anton.ipatov', 'andrey.plotnikov'],
      status : ['Code Review']
    },
    actions : {
      login : 'ek'
    }
  },
];

TASK_REWRITES_APPLY = function(task){
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


var BLOCKS = [
{ login : 'alexey.sutiagin', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT},
{ login : 'ek', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT},
{ login : 'fedor.shumov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT},
{ skip : 1, statuses : ['Code Review'], title_link : STATUS_LINK, task_links : TASK_LINK, logins : DEVTEAM, title : 'Code Review' },

{ login : 'aleksandr.gladkikh', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
{ login : 'andrey.ivanov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
{ login : 'ivan.hilkov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
{ statuses : ['Test ready'], title_link : STATUS_LINK, task_links : TASK_LINK, logins : DEVTEAM, title : 'Test Ready'},

{ login : 'renat.abdusalamov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
{ login : 'anton.ipatov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
{ login : 'Ango', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
{ statuses : ['Merge ready'], title_link : STATUS_LINK, task_links : TASK_LINK, logins : DEVTEAM, title : 'Merge Ready'},

{ login : 'alexander.litvinov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
{ login : 'andrey.plotnikov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
{ login : 'andrey.iliopulo', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
{ statuses : ['In Release'], title_link : STATUS_LINK, task_links : TASK_LINK, logins : DEVTEAM, title : 'Release'},

{ login : 'alexander.neyasov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
{ skip : 1 },
{ login : 'marina.severyanova', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
{ skip : 1 },

{ login : 'Yury.Kocharyan', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
{ login : 'konstantin.kalinin', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
{ skip : 1 },
{ skip : 1 },

{ login : 'h3x3d', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
{ login : 'andrey.lakotko', statuses : QA_TASK_STATUSES, title_link : USER_LINK, task_links : TASK_LINK, limit : DEVLIMIT},
{ login : 'anastasia.oblomova', statuses : QA_TASK_STATUSES, title_link : USER_LINK, task_links : TASK_LINK, limit : DEVLIMIT}
];

/*
* Main program
*/
function processResults(data){
  for(var i = 0; i < data.issues.length; i++){
    var issue = data.issues[i];

    if(issue.fields.assignee){
      var displayName = issue.fields.assignee.displayName;
      var email       = issue.fields.assignee.emailAddress;
      var login       = issue.fields.assignee.name;
      var avatar      = issue.fields.assignee.avatarUrls['48x48'];

      storage.addPerson(login, displayName, avatar);

      var task = {
        login         : login,
        status        : issue.fields.status.name,
        statusIcon    : issue.fields.status.iconUrl,
        priorityIcon  : issue.fields.priority.iconUrl,
        priority      : PRIORITY_RANK[issue.fields.priority.name],
        rank          : issue.fields.customfield_10300,
        issuetypeIcon : issue.fields.issuetype.iconUrl,
        key           : issue.key,
        subtasks      : issue.fields.subtasks.length,
        summary       : issue.fields.summary,
        description   : issue.fields.description,
        project       : issue.fields.project.key,
        timespent     : Math.round(10*issue.fields.timespent/3600)/10,
      };

      TASK_REWRITES_APPLY(task);

      // if(task.subtasks){
      //   (function(tt){
      //     json
      //     setTimeout(function(){
      //       console.log(tt)
      //       if(tt.update){
      //         tt.update(tt);
      //       }
      //     }, 1000);
      //   })(task);
      // }

      storage.addPersonTask(task.login, task);
    }

    // if(i==0){ console.log(issue); }
  };
}

function clearScreen(){
  // CLEAR SCREEN
  var node = document.body;
  while (node.hasChildNodes()) {
    node.removeChild(node.lastChild);
  }
  LAYOUT.reset();
}

function drawMsg(text){
  var container = document.createElement("div");
  container.setAttribute('class', 'message');
  document.body.appendChild(container);
  container.innerHTML = text;
}

function prepareURL(block, urlKey, data){
  var template = block[urlKey];
  if(!template) {
    return;
  }

  var vars = template.match(/\{[a-z]*\}/g);
  for(var idx in vars){
    var variable = vars[idx];

    if(variable === '{login}'){
      template = template.replace(variable, data.login);
      continue;
    }

    if(variable === '{logins}'){
      template = template.replace(variable, data.logins.join(','));
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

      template = template.replace(variable, 'createdDate < endOfYear()'); /* ~no filter */
      continue;
    }

    if(variable === '{key}'){
      template = template.replace(variable, data.key);
      continue;
    }

    // not found => bad scheme
    console.error('BAD SCHEME FOR', variable, urlKey, data);
  }

  return template;
}

var task_sorter = new (function SORTER(){
  var scale = 10000;

  function calcRank(s){
    var a = 0;
    for(var i in s){
      a += (1/(+i+1))*s.charCodeAt(i);
    }
    return a;
  }

  return function(a, b){
    return (a.priority*scale + calcRank(a.rank)) - (b.priority*scale + calcRank(b.rank));
  }
})();

function getLine(init){
  if(init !== undefined){
    this.line = init;
  }
  return CONST.line_height*this.line++;
};

function drawLineTextFromTask(block, paper, elms, y, task){
  //  mark tasks with subtasks
  var css_name = task.status.replace(/ /g, '_').toLowerCase();
  if(task.subtasks){
    css_name += ' subtasks';
  }

  // draw  info line
  var text = [task.key, task.timespent + 'h',  task.summary].join(' ');
  // generate url's
  var task_url = {
    url        : prepareURL(block, 'task_links', task),
    summary    : task.summary,
    description: task.description
  };

  if(elms){
    console.log('redraw', elms);
    return;
  }

  var elements = [];
  elements.push(paper.text(36, y, text, task_url).setAttribute('class', css_name));
  elements.push(paper.img(0,  y-14, 16, 16, task.priorityIcon));
  elements.push(paper.img(16, y-14, 16, 16, task.issuetypeIcon));

  return elements;
}

function draw(){

  // MAIN CODE:
  for(var idx in BLOCKS){
    var title = '';
    var block = BLOCKS[idx];

    if(block.skip){
      LAYOUT.nextWindow();
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
      tasks : storage.getTasks(block.login || block.logins, block.statuses, task_sorter)
    };

    // create box
    var container = document.createElement("div");
    container.setAttribute('class', 'man');
    document.body.appendChild(container);

    // init SVG
    paper = new SVG(container);
    // generate from template and block data
    var title_url = prepareURL(block, 'title_link', block);
    // add names
    paper.text(0, getLine(1), block_data.title, title_url).setAttribute('class', 'man_name');

    var tasks_to_display = 2;
    // add tasks
    for(var i in block_data.tasks){
      var task = block_data.tasks[i];

      var y = getLine();
      var elms = drawLineTextFromTask(block, paper, null, y, task);
      
      // task.update = (function(){
      //   return function(updated_task){
      //     drawLineTextFromTask(block, null, elms, null, updated_task);
      //   };
      // })(block, elms);

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
    var height = tasks_to_display * CONST.line_height;
    paper.setAttribute('height', height);

    container.style.left = CONST.block_margin_x + (CONST.block_width * LAYOUT.getWindowNum()) + 'px';
    container.style.top  = LAYOUT.getHeight(LAYOUT.getWindowNum()) + 'px';
    container.style.height = height + 'px';

    LAYOUT.addHeight(LAYOUT.getWindowNum(), height + CONST.block_margin_y);
    LAYOUT.nextWindow();
  }
}

var TASKS_TO_WORK =
  //'(status = "In Progress" Or status = "To Do" OR status="Open" OR status="Code Review" OR status="Merge ready" OR status="Test ready") ' +
  '(status != Closed AND status != Done and status != Rejected) ' +
  'AND assignee IN (' + DEVTEAM.join(',') + ') ' +
  'ORDER BY priority,updatedDate';
var query =
  '/jira/api/2/search?maxResults=2000' +
  '&fields=id,customfield_10300,key,assignee,description,status,priority,issuetype,subtasks,summary,project,timespent' +
  '&jql=' + TASKS_TO_WORK;

var stop = false;
function loadData(){
  d3.json(query, function(err, data){
    clearScreen();

    if(err){
      drawMsg([err.status, err.statusText].join(' '));
    }
    else if(data){
      storage.clear();
      processResults(data);
      draw();
    }
    if(stop){ return; }
    setTimeout(loadData, 5*60*1000);
  });
}

window.onload = function(){
  drawMsg('Loading...');
  // *** for debugginng
  // *** define `var _data =` variable with real response and uncomment next line
  // d3.json = function(a, cb){ cb(null, _data); }
  loadData();
}

