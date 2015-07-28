(function(){

  var TASK_STATUSES     = ['!Closed', '!Done', '!Rejected', '!Merge ready', '!In Release', '!Test ready'];

  var USER_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=assignee IN ({login}) and ({statuses}) ORDER BY priority,updated';
  var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';
  var STATUS_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) and ({statuses}) ORDER BY priority,updated';

  var DEVOPSTEAM  = ['melnik', 'eth', 'marina.ilina', 'VadZay'];

  var LEADLIMIT = 20;
  var DEVLIMIT  = 10;

  var TASK_REWRITE_RULES = [];

  var BLOCKS = [
  { login : 'melnik', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT},
  { project : 'SRV', statuses : ['Code Review'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Code Review'},
  
  { login : 'eth', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { project : 'SRV', statuses : ['Test ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Test Ready'},

  { login : 'marina.ilina', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { project : 'SRV', statuses : ['Merge ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Merge Ready'},
  
  { login : 'VadZay', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { project : 'SRV', statuses : ['Done'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Done', sort_by : 'updated', limit : 25 },
  ];

  var PRIORITY_RANK = {
    'ASAP'     : 0,
    'Critical' : 1,
    'Very High': 2,
    'High'     : 3,
    'Normal'   : 4
  };

  var TASKS_TO_WORK =
    //'(status = "In Progress" Or status = "To Do" OR status="Open" OR status="Code Review" OR status="Merge ready" OR status="Test ready") ' +
    '(status != Closed AND  status != Rejected) ' +
    'AND assignee IN (' + DEVOPSTEAM.join(',') + ') ' +
    'ORDER BY priority,rank';

  var query =
    '/jira/api/2/search?maxResults=2000' +
    '&fields=id,customfield_10300,key,updated,assignee,description,status,priority,project,subtasks,summary,timespent' +
    '&jql=' + TASKS_TO_WORK;


  var options = {
    PRIORITY_RANK : PRIORITY_RANK,
    COLUMNS : 2
  };

  // 1 column for mobile + release/test/merge ready moved to the end
  if(typeof window.orientation !== 'undefined'){
    options.COLUMNS = 1;
    BLOCKS.sort(function(a, b){
      if(!!a.project === !!b.project){
        return 0;
      }
      return !!a.project > !!b.project;
    });
  }

  var task_engine = new window.TaskEngine(document.body, options);

  // MAIN LOOP =>
  (function loadData(){
    task_engine.loadData(query, function(err, result){
      if(!err){
        task_engine.draw(BLOCKS, result);
      }
      setTimeout(loadData, 5*60*1000);
    });
  })();
})();

