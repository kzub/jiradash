(function(){

  var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';

  if(~document.location.href.indexOf('mobile')){
    var DEVTEAM = DEVTEAM_DONE = [
      'sergey.glotov',
      'pavel.akhrameev',
      'nikolay.serebrennikov',
      'dmitry.kobelev',
      'marat.tolegenov',
      'sergey.bay',
      'max.kotov',
      'mikhail.froimson',
      'dmitry.purtov'
    ];

    var DEVTEAM_TODO = ['sergey.mashkov'];

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

  }else /* AVIA TEAM */ {
    var DEVTEAM_TODO = DEVTEAM_DONE =[];
    var DEVTEAM  = [
      'alexey.sutiagin','aleksandr.gladkikh','alexander.litvinov','alexander.neyasov','Yury.Kocharyan', 'danila.dergachev', 'ruslan.ismagilov',
      'ek','andrey.ivanov','anton.ipatov','andrey.plotnikov',
      'fedor.shumov','Ango','andrey.iliopulo', 'dmitry.zharsky', 'alexander.ryzhikov', 'vadim.kudryavtsev',
      'konstantin.kalinin', 'pavel.kilin', 'andrey.lakotko', 'pavel.vlasov'
    ];

    var STATUSES_TO_LOAD_TODO = STATUSES_TO_LOAD_DONE =['!Closed', '!Done' , '!Rejected'];
    var BLOCKS_TODO = [
      {
        title : 'To Do',
        projects : ['OTT', 'AH', 'AC', 'PM', 'SEO'],
        statuses : ['Open', 'To Do'],
        limit : 26,
        title_link : 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) AND ({statuses}) AND (LABELS = Planned) AND assignee is Empty ORDER BY priority,rank',
        task_links : TASK_LINK,
        sort_by:'created_reverse'
      }
    ];

    BLOCKS_DONE = JSON.parse(JSON.stringify(BLOCKS_TODO));
    BLOCKS_DONE[0].limitFrom = BLOCKS_TODO[0].limit;
    BLOCKS_DONE[0].limit     = BLOCKS_TODO[0].limit*2;
    BLOCKS_TODO[0].hideMoreLink = true;

    var OPTIONS_TODO = OPTIONS_DONE = {
      SCREEN_WIDTH : '50%',
      LOAD_PROJECTS : ['OTT', 'AH', 'AC', 'PM', 'SEO'],
      LABELS_TO_LOAD : ['Planned'],
      LOAD_LIMIT : 500,
    };

    var OPTIONS_TIMESPENT = {
      SCREEN_WIDTH : '100%'
    };
  }


  var utils  = new window.Utils();
  var params = utils.getQueryString();
  var time_to_look   = +params.timespent || +params.timespent_mobile || 7;

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

