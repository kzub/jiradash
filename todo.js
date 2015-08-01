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
  { login : 'alexey.sutiagin', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT },
  { login : 'ek', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT },
  { login : 'fedor.shumov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT },
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

  var STATUSES_TO_LOAD = ['!Closed', '!Done' , '!Rejected'];
  var OPTIONS = {
    TASK_REWRITE_RULES : TASK_REWRITE_RULES,
    COLUMNS : 4,
    MOBILE_COLUMNS : 1,
    MOBILE_BLOCKS_SORTER : 'project_attribute'
  };

  var task_engine = new window.TaskTable(BLOCKS, document.getElementById('todo_block'), OPTIONS);

  // MAIN LOOP =>
  (function loadData(){
    task_engine.process(DEVTEAM, STATUSES_TO_LOAD, function(){
      setTimeout(loadData, 5*60*1000);
    });
  })();
})();

