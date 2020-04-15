(function(){
  var TASK_STATUSES     = ['!Closed', '!Done', '!Rejected', '!Merge ready', '!In Release', '!Test ready'];

  var USER_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=assignee IN ({login}) and ({statuses}) ORDER BY priority,updated';
  var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';
  var STATUS_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) and ({statuses}) ORDER BY priority,updated';

  var DEVOPSTEAM  = ['melnik', 'eth', 'marina.ilina', 'VadZay'];
  var LEADLIMIT = 20;
  var DEVLIMIT  = 10;

  var BLOCKS = [
  { login : 'melnik', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT},
  { projects : ['SRV'], statuses : ['Code Review'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Code Review'},
  
  { login : 'eth', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { projects : ['SRV'], statuses : ['Test ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Test Ready'},

  { login : 'marina.ilina', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { projects : ['SRV'], statuses : ['Merge ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Merge Ready'},
  
  { login : 'VadZay', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { projects : ['SRV'], statuses : ['Done'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Done', sort_by : 'updated', limit : 25 },
  ];

  var STATUSES_TO_LOAD = ['!Closed', '!Rejected'];
  
  var OPTIONS = {
    COLUMNS : 2,
    MOBILE_COLUMNS : 1,
    MOBILE_BLOCKS_SORTER : 'project_attribute'
  };

  var task_engine = new window.TaskTable(BLOCKS, document.getElementById('todo_block'), OPTIONS);

  // MAIN LOOP =>
  (function loadData(){
    task_engine.process(DEVOPSTEAM, STATUSES_TO_LOAD, function(){
      setTimeout(loadData, 5.1*60*1000);
    });
  })();
})();

