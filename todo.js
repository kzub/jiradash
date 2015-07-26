(function(){

  var TASK_STATUSES     = ['!Closed', '!Done', '!Rejected', '!Merge ready', '!In Release', '!Test ready'];
  var QA_TASK_STATUSES  = ['!Closed', '!Done', '!Rejected', '!Merge ready', '!In Release'];

  var USER_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=assignee IN ({login}) and ({statuses}) ORDER BY priority,updated';
  var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';
  var STATUS_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) and ({statuses}) ORDER BY priority,updated';

  var AVIATEAM  = ['alexey.sutiagin','ek','fedor.shumov','aleksandr.gladkikh','andrey.ivanov','ivan.hilkov','renat.abdusalamov','anton.ipatov','Ango','alexander.litvinov','andrey.plotnikov','andrey.iliopulo','alexander.neyasov','marina.severyanova','Yury.Kocharyan','konstantin.kalinin','konstantin.zubkov','h3x3d','andrey.lakotko','anastasia.oblomova'];
  var DEVTEAM   = AVIATEAM.concat('dmitrii.loskutov');

  var LEADLIMIT = 15;
  var DEVLIMIT  = 5;

  var TASK_REWRITE_RULES = [
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

  var BLOCKS = [
  { login : 'alexey.sutiagin', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT},
  { login : 'ek', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT},
  { login : 'fedor.shumov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT},
  { skip : 1, statuses : ['Code Review'], title_link : STATUS_LINK, task_links : TASK_LINK, logins : AVIATEAM, title : 'Code Review' },

  { login : 'aleksandr.gladkikh', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { login : 'andrey.ivanov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { login : 'ivan.hilkov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { project : 'OTT', statuses : ['Test ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Test Ready'},

  { login : 'renat.abdusalamov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { login : 'anton.ipatov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { login : 'Ango', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { project : 'OTT', statuses : ['Merge ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Merge Ready'},

  { login : 'alexander.litvinov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { login : 'andrey.plotnikov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { login : 'andrey.iliopulo', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { project : 'OTT', statuses : ['In Release'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Release'},

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

  var PRIORITY_RANK = {
    'ASAP'     : 0,
    'Critical' : 1,
    'Very High': 2,
    'High'     : 3,
    'Normal'   : 4
  };

  var TASKS_TO_WORK =
    //'(status = "In Progress" Or status = "To Do" OR status="Open" OR status="Code Review" OR status="Merge ready" OR status="Test ready") ' +
    '(status != Closed AND status != Done and status != Rejected) ' +
    'AND assignee IN (' + DEVTEAM.join(',') + ') ' +
    'ORDER BY priority,rank';

  var query =
    '/jira/api/2/search?maxResults=2000' +
    '&fields=id,customfield_10300,key,assignee,description,status,priority,project,subtasks,summary,timespent' +
    '&jql=' + TASKS_TO_WORK;


  var options = {
    TASK_REWRITE_RULES : TASK_REWRITE_RULES,
    PRIORITY_RANK : PRIORITY_RANK,
    COLUMNS : 4
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
      task_engine.draw(BLOCKS, result);
      setTimeout(loadData, 5*60*1000);
    });
  })();
})();

