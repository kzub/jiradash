(function(){

  var TASK_STATUSES     = ['!Closed', '!Done', '!Rejected', '!Merge ready', '!In Release', '!Test ready'];
  var QA_TASK_STATUSES  = ['!Closed', '!Done', '!Rejected', '!Merge ready', '!In Release'];

  var USER_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=assignee IN ({login}) and ({statuses}) ORDER BY priority,updated';
  var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';
  var STATUS_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) and ({statuses}) ORDER BY priority,updated';

  var AVIATEAM  = ['alexey.sutiagin','ek','fedor.shumov','aleksandr.gladkikh','andrey.ivanov','ivan.hilkov','renat.abdusalamov','anton.ipatov','Ango','alexander.litvinov','andrey.plotnikov','andrey.iliopulo','alexander.neyasov','marina.severyanova','Yury.Kocharyan','konstantin.kalinin','h3x3d','andrey.lakotko','anastasia.oblomova'];
  var DEVTEAM   = AVIATEAM;
  var LEADLIMIT = undefined;
  var DEVLIMIT  = undefined;

  var BLOCKS = [
  { login : 'alexey.sutiagin', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT },
  { login : 'ek', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT },
  { login : 'fedor.shumov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT },

  { login : 'aleksandr.gladkikh', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { login : 'andrey.ivanov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { login : 'ivan.hilkov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},

  { login : 'renat.abdusalamov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { login : 'anton.ipatov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { login : 'Ango', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},

  { login : 'alexander.litvinov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { login : 'andrey.plotnikov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { login : 'andrey.iliopulo', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},

  { login : 'alexander.neyasov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { login : 'marina.severyanova', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},

  { login : 'Yury.Kocharyan', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
  { login : 'konstantin.kalinin', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},

  { login : 'anastasia.oblomova', statuses : QA_TASK_STATUSES, title_link : USER_LINK, task_links : TASK_LINK, limit : DEVLIMIT},
  { login : 'andrey.lakotko', statuses : QA_TASK_STATUSES, title_link : USER_LINK, task_links : TASK_LINK, limit : DEVLIMIT},
  { login : 'h3x3d', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT}
  ];

  var STATUSES_TO_LOAD = ['!Closed', '!Done' , '!Rejected'];
  var OPTIONS = {
    // COLUMNS : 2,
    MOBILE_COLUMNS : 1,
    MOBILE_BLOCKS_SORTER : 'project_attribute'
  };

  var task_engine = new window.TaskTimespend(DEVTEAM, document.body, OPTIONS);

  // MAIN LOOP =>
  (function loadData(){
    task_engine.process(7, 40, function(){
      setTimeout(loadData, 5*60*1000);
    });
  })();
})();

