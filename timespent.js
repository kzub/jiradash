(function(){

  var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';

  if(~document.location.href.indexOf('mobile')){
    var DEVTEAM = DEVTEAM_DONE = [
      'sergey.glotov',
      'nikolay.serebrennikov',
      'dmitry.kobelev',
      'marat.tolegenov',
      'sergey.bay',
      'max.kotov',
      'mikhail.froimson',
      'dmitry.purtov'
    ];

    var DEVTEAM_TODO = ['dmitry.panshin'];

    var STATUSES_TO_LOAD_TODO = ['!Closed', '!Rejected', '!Done'];
    var BLOCKS_TODO = [
      {
        title : 'To Do',
        projects : ['MOB', 'IOS', 'ADR'],
        limit : 49,
        title_link : 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) AND ({statuses}) ORDER BY priority,rank',
        task_links : TASK_LINK,
        sort_by : 'duedate_priority'
      }
    ];
    var OPTIONS_TODO = {
      SCREEN_WIDTH : '50%',
      LOAD_PROJECTS : ['MOB', 'IOS', 'ADR'],
      LOGIN_KEY_FIELDNAME : 'customfield_10201',
      LOGIN_KEY_CONDTIONS : 'PM',
      LOAD_LIMIT : 500,
      SHOW_DUEDATE_PLUS_TIMESPEND : true,
      TASK_ICON : 'typeIcon'
    };

    var STATUSES_TO_LOAD_DONE = ['Finished'];
    var BLOCKS_DONE = [
      {
        title : 'Recently done',
        projects : ['MOB', 'IOS', 'ADR'],
        statuses : ['Finished'],
        limit : 25,
        title_link : 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) and ({statuses}) ORDER BY priority,updated',
        task_links : TASK_LINK,
        sort_by:'updated'
      }
    ];
    var OPTIONS_DONE = {
      SCREEN_WIDTH : '50%',
      LOAD_BY_PRIORITY : 'updated',
      LOAD_LIMIT : 50,
      LOAD_PROJECTS : ['MOB', 'IOS', 'ADR'],
      TASK_ICON : 'typeIcon'
    };

    var OPTIONS_TIMESPENT = {
      SCREEN_WIDTH : '100%',
      BAR_HEIGHT : 20
    };

  }
  else if(~document.location.href.indexOf('devops')){
    var DEVTEAM = DEVTEAM_DONE = [
      'melnik',
      'eth',
      'dmitry.shmelev',
      'vladimir.karnushin'
    ];

    var DEVTEAM_TODO = DEVTEAM_DONE;

    var STATUSES_TO_LOAD_TODO = ['!Closed', '!Rejected', '!Done'];
    var BLOCKS_TODO = [
      {
        title : 'To Do',
        projects : ['SRV'],
        limit : 49,
        title_link : 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) AND ({statuses}) ORDER BY priority,rank',
        task_links : TASK_LINK,
        sort_by : 'duedate_priority'
      }
    ];
    var OPTIONS_TODO = {
      SCREEN_WIDTH : '50%',
      LOAD_PROJECTS : ['SRV'],
      LOAD_LIMIT : 500,
      SHOW_DUEDATE_PLUS_TIMESPEND : true,
      TASK_ICON : 'typeIcon'
    };

    var STATUSES_TO_LOAD_DONE = ['Done', 'Rejected'];
    var BLOCKS_DONE = [
      {
        title : 'Recently done',
        projects : ['SRV'],
        statuses : ['Done', 'Rejected'],
        limit : 25,
        title_link : 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) and ({statuses}) ORDER BY priority,updated',
        task_links : TASK_LINK,
        sort_by:'updated'
      }
    ];
    var OPTIONS_DONE = {
      SCREEN_WIDTH : '50%',
      LOAD_BY_PRIORITY : 'updated',
      LOAD_LIMIT : 50,
      LOAD_PROJECTS : ['SRV'],
      TASK_ICON : 'typeIcon'
    };

    var OPTIONS_TIMESPENT = {
      SCREEN_WIDTH : '100%',
      BAR_HEIGHT : 20
    };
  }
  else /* AVIA TEAM */ {
    var DEVTEAM  = [
      'alexey.sutiagin','aleksandr.gladkikh','alexander.litvinov','alexander.neyasov','Yury.Kocharyan', 'danila.dergachev', 'ruslan.ismagilov', 'evgeniy.petrov',
      'ek','andrey.ivanov','anton.ipatov','andrey.plotnikov',
      'fedor.shumov','andrey.iliopulo', 'dmitry.zharsky', 'alexander.ryzhikov', 'vadim.kudryavtsev', 'vladislav.kolesnikov',
      'konstantin.kalinin', 'pavel.kilin', 'andrey.lakotko', 'pavel.vlasov','dmitrii.loskutov'
    ];

    var AVIATEAM = ['konstantin.zubkov', 'leonid.riaboshtan'].concat(DEVTEAM);

    var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';
    var STATUS_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) and ({statuses}) ORDER BY priority,created ASC';
    var sorting_order = 'review_inprogress_created';
    var STATUSES_TO_LOAD = ['!Closed', '!Done' , '!Rejected'];

    var BLOCKS = [
      { projects : ['OTT', 'AH', 'AC', 'PM', 'SEO', 'FE'], statuses : ['Test ready'],  title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Test Ready', sort_by : sorting_order},
      { projects : ['OTT', 'AH', 'AC', 'PM', 'SEO', 'FE'], statuses : ['Merge ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Merge Ready', sort_by : sorting_order, limit: 24},
      { projects : ['OTT', 'AH', 'AC', 'PM', 'SEO', 'FE'], statuses : ['In Release', 'Merge Failed', 'Contains Bugs'], title : 'In Release', title_link : STATUS_LINK, task_links : TASK_LINK,  sort_by : sorting_order, limit:24},
      { projects : ['OTT', 'AH', 'AC', 'PM', 'SEO', 'FE'], types :    ['Release'],     title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Release', title_extras : ['status'], sort_by : sorting_order},
    ];

    var OPTIONS = {
      COLUMNS : 3
    };

    var OPTIONS_TIMESPENT = {
      SCREEN_WIDTH : '100%'
    };

    var utils  = new window.Utils();
    var params = utils.getQueryString();
    var time_to_look = +params.timespent || +params.timespent_mobile || 7;

    var timespent = new window.TaskTimespend(DEVTEAM, time_to_look, document.getElementById('timespend-left'), OPTIONS_TIMESPENT);
    var todo = new window.TaskTable(AVIATEAM, BLOCKS, STATUSES_TO_LOAD, document.getElementById('timespend-split-screen'), OPTIONS);

    // MAIN LOOP =>
    (function loadData(){
      timespent.process(function(){
        setTimeout(loadData, 5.1*60*1000);
      });
      todo.process(function(){});
    })();
    return;
  }


  var utils  = new window.Utils();
  var params = utils.getQueryString();
  var time_to_look   = +params.timespent || +params.timespent_mobile || +params.timespent_devops || 7;

  var timespent = new window.TaskTimespend(DEVTEAM, time_to_look, document.getElementById('timespend-left'), OPTIONS_TIMESPENT);
  var todo = new window.TaskTable(DEVTEAM_TODO, BLOCKS_TODO, STATUSES_TO_LOAD_TODO, document.getElementById('timespend-bottom'), OPTIONS_TODO);
  var done = new window.TaskTable(DEVTEAM_DONE, BLOCKS_DONE, STATUSES_TO_LOAD_DONE, document.getElementById('timespend-right'), OPTIONS_DONE);

  // MAIN LOOP =>
  (function loadData(){
    timespent.process(function(){
      setTimeout(loadData, 5.1*60*1000);
    });
    todo.process(function(){});
    done.process(function(){});
  })();
})();

