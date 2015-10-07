(function(){

  var TASK_STATUSES     = ['!Closed', '!Done', '!Rejected', '!Merge ready', '!In Release', '!Test ready'];
  var QA_TASK_STATUSES  = ['!Closed', '!Done', '!Rejected', '!Merge ready', '!In Release'];
  var PM_TASK_STATUSES  = ['!Closed', '!Done', '!Rejected'];
  var SV_TASK_STATUSES  = ['!Closed', '!Done', '!Rejected'];

  var USER_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=((assignee = {login} OR Reviewer = {login}) AND ({statuses})) ORDER BY priority,created ASC';
  var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';
  var STATUS_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) and ({statuses}) ORDER BY priority,created ASC';
  var LABELS_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=({labels}) and ({statuses}) ORDER BY priority,created ASC';
  var team = 'avia';

  if(~document.location.href.indexOf('devops')){
    team = 'devops';
  }else if(~document.location.href.indexOf('pm2')){
    team = 'pm2';
  }else if(~document.location.href.indexOf('pm')){
    team = 'pm';
  }else if(~document.location.href.indexOf('roadmap')){
    team = 'roadmap';
  }


  if(team === 'avia'){
    var AVIATEAM  = ['alexey.sutiagin','ek','fedor.shumov','aleksandr.gladkikh','andrey.ivanov','ivan.hilkov','renat.abdusalamov','anton.ipatov',
                     'Ango','alexander.litvinov','andrey.plotnikov','andrey.iliopulo','alexander.neyasov','Yury.Kocharyan',
                     'konstantin.kalinin','valentin.lapchevskiy'];
    var VIEWTEAM  = ['dmitrii.loskutov', 'andrey.lakotko', 'anastasia.oblomova', 'konstantin.zubkov','marina.severyanova', 'leonid.riaboshtan'].concat(AVIATEAM);

    var LEADLIMIT = 20;
    var DEVLIMIT  = 7;

    var TASK_REWRITE_RULES = [
      { // without team
        fields : {
          status : ['Code Review', 'Resolved']
        },
        change_fields : {
          login : {
            source_field : 'reviewEngineer',
            source_field_allowed_values : AVIATEAM
          }
        }
      },
      {
        fields : {
          login  : ['ivan.hilkov', 'Ango', 'andrey.iliopulo'],
          status : ['Code Review', 'Resolved']
        },
        change_fields : {
          login : {
            source_field : 'reviewEngineer',
            source_field_allowed_values : AVIATEAM,
            default : 'fedor.shumov'
          }
        }
      },
      {
        fields : {
          login  : ['aleksandr.gladkikh', 'renat.abdusalamov', 'alexander.neyasov', 'Yury.Kocharyan', 'alexander.litvinov', 'valentin.lapchevskiy'],
          status : ['Code Review', 'Resolved']
        },
        change_fields : {
          login : {
            source_field : 'reviewEngineer',
            source_field_allowed_values : AVIATEAM,
            default : 'alexey.sutiagin'
          }
        }
      },
      {
        fields : {
          login  : ['andrey.ivanov', 'anton.ipatov', 'andrey.plotnikov'],
          status : ['Code Review', 'Resolved']
        },
        change_fields : {
          login : {
            source_field : 'reviewEngineer',
            source_field_allowed_values : AVIATEAM,
            default : 'ek'
          }
        }
      },
    ];

    var sorting_order = 'created_reverse_priority';

    var BLOCKS = [
    { login : 'alexey.sutiagin',      title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT, sort_by : sorting_order },
    { login : 'ek',                   title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT, sort_by : sorting_order },
    { login : 'fedor.shumov',         title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT, sort_by : sorting_order },
    { skip : 1, statuses : ['Code Review'], title_link : STATUS_LINK, task_links : TASK_LINK, logins : AVIATEAM, title : 'Code Review', sort_by : sorting_order },

    { login : 'renat.abdusalamov',    title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
    { login : 'andrey.ivanov',        title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
    { login : 'ivan.hilkov',          title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
    { projects : ['OTT', 'AH', 'AC', 'PM'], statuses : ['Test ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Test Ready', sort_by : sorting_order},

    { login : 'aleksandr.gladkikh',   title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
    { login : 'anton.ipatov',         title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
    { login : 'Ango',                 title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
    { projects : ['OTT', 'AH', 'AC', 'PM'], statuses : ['Merge ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Merge Ready', sort_by : sorting_order},

    { login : 'alexander.neyasov',    title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
    { login : 'andrey.plotnikov',     title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
    { login : 'andrey.iliopulo',      title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
    { projects : ['OTT', 'AH', 'AC', 'PM'], types : ['Release'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Release', title_extras : ['status'], sort_by : sorting_order},

    { login : 'valentin.lapchevskiy', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
    { skip : 1 },
    { skip : 1 },
    { projects : ['OTT','AC', 'AH'], statuses : ['In Release', 'Merge Failed', 'Contains Bugs'], title_link : STATUS_LINK, task_links : TASK_LINK,  sort_by : sorting_order},

    { skip : 1 },
    { skip : 1},
    { skip : 1 },
    { skip : 1 },

    { skip : 1 },
    { login : 'alexander.litvinov',   title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
    { login : 'konstantin.kalinin',   title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
    { skip : 1 },

    { login : 'Yury.Kocharyan',       title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order}
    ];

    var STATUSES_TO_LOAD = ['!Closed', '!Done' , '!Rejected'];
    var OPTIONS = {
      TASK_REWRITE_RULES : TASK_REWRITE_RULES,
      COLUMNS : 4,
      MOBILE_COLUMNS : 1,
      MOBILE_BLOCKS_SORTER : 'project_attribute',
      SHOW_DUEDATE_PLUS_TIMESPEND : true,
      REVIEWERS : AVIATEAM
    };
  }
  else if(team === 'devops'){
    var VIEWTEAM  = ['melnik', 'eth', 'marina.ilina'];
    var LEADLIMIT = 20;
    var DEVLIMIT  = 10;

    BLOCKS = [
    { login : 'melnik', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT},
    { projects : ['SRV'], statuses : ['Code Review'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Code Review'},

    { login : 'eth', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { projects : ['SRV'], statuses : ['Test ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Test Ready'},

    { login : 'marina.ilina', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { projects : ['SRV'], statuses : ['Merge ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Merge Ready'},

    { skip : 1},
    { projects : ['SRV'], statuses : ['Done'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Done', sort_by : 'updated', limit : 25 },
    ];

    var STATUSES_TO_LOAD = ['!Closed', '!Rejected'];
    var OPTIONS = {
      COLUMNS : 2,
      MOBILE_COLUMNS : 1,
      MOBILE_BLOCKS_SORTER : 'project_attribute'
    };
  }
  else if(team === 'pm'){
    var VIEWTEAM  = ['evgeny.bush', 'rostislav.palchun', 'valentin.kachanov', 'leonid.riaboshtan',
      'nikolay.malikov', 'armen.dzhanumov', 'alexander.bezhan', 'timur.danilov', 'dmitry.rumyantsev',
      'sergey.mashkov', 'alexey.sutiagin', 'ek', 'fedor.shumov'];

    var PMLIMIT   = Infinity;

    BLOCKS = [
    { login : 'evgeny.bush',        title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'rostislav.palchun',  title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'valentin.kachanov',  title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'alexander.bezhan',   title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'armen.dzhanumov',    title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'leonid.riaboshtan',  title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'nikolay.malikov',    title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'timur.danilov',      title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'dmitry.rumyantsev',  title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},
    { login : 'sergey.mashkov',     title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT},

    { title : 'TODO', labels : ['PM-Planned'], title_link : LABELS_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT }
    ];

    var STATUSES_TO_LOAD = ['!Closed', '!Rejected', '!Done'];
    var OPTIONS = {
      COLUMNS : 2,
      MOBILE_COLUMNS : 1,
      MOBILE_BLOCKS_SORTER: 'project_attribute',
      LOGIN_KEY_FIELDNAME : 'customfield_10201',
      LOGIN_KEY_CONDTIONS : 'PM',
      SHOW_DUEDATE_INSTEAD_TIMESPEND : true,
      LABELS_TO_LOAD : ['PM-Planned'],
      LABELS_MODE : 'OR'
    };
  }
  else if(team === 'pm2'){
    var VIEWTEAM  = [ 'nikolay.malikov' ];
    var PMLIMIT   = Infinity;

    BLOCKS = [
    { login : 'nikolay.malikov',  title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT },
    { title : 'Peter Kutis', labels : ['PK'], title_link : LABELS_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT }
    ];

    var STATUSES_TO_LOAD = ['!Closed', '!Rejected', '!Done'];
    var OPTIONS = {
      COLUMNS : 2,
      MOBILE_COLUMNS : 1,
      MOBILE_BLOCKS_SORTER: 'project_attribute',
      LOGIN_KEY_FIELDNAME : 'customfield_10200',
      LOGIN_KEY_CONDTIONS : 'Stakeholder',
      SHOW_DUEDATE_INSTEAD_TIMESPEND : true,
      LABELS_TO_LOAD : ['PK'],
      LABELS_MODE : 'OR'
    };
  }
  else if(team === 'roadmap'){
    var VIEWTEAM  = ['mikhail.sokolov', 'konstantin.mamonov', 'timur.usmanov', 'leonid.riaboshtan', 'konstantin.zubkov', 'kim', 'max.karaush'];

    var SVLIMIT   = Infinity;

    BLOCKS = [
    { login : 'mikhail.sokolov',   title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT},
    { login : 'konstantin.mamonov',title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT},
    { login : 'timur.usmanov',     title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT},
    { login : 'leonid.riaboshtan', title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT},
    { login : 'kim',               title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT},
    { login : 'max.karaush',       title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT},
    { login : 'konstantin.zubkov', title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT},
    ];

    var STATUSES_TO_LOAD = ['!Closed', '!Rejected', '!Done'];
    var OPTIONS = {
      COLUMNS : 2,
      MOBILE_COLUMNS : 1,
      MOBILE_BLOCKS_SORTER: 'project_attribute',
      LOGIN_KEY_FIELDNAME : 'customfield_10900', // supervisor
      LOGIN_KEY_CONDTIONS : 'Supervisor',
      SHOW_DUEDATE_INSTEAD_TIMESPEND : true
    };
  }
  else{
    throw 'unknown team:' + team;
  }

  var task_engine = new window.TaskTable(VIEWTEAM, BLOCKS, STATUSES_TO_LOAD, document.getElementById('todo_block'), OPTIONS);
  // MAIN LOOP =>
  (function loadData(){
    task_engine.process(function(){
      setTimeout(loadData, 5.1*60*1000);
    });
  })();
})();

