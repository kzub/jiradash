(function(){

  var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';

  var DEVTEAM  = [
    'alexey.sutiagin','aleksandr.gladkikh','renat.abdusalamov','alexander.litvinov','alexander.neyasov','Yury.Kocharyan',
    'ek','andrey.ivanov','anton.ipatov','andrey.plotnikov',
    'fedor.shumov','ivan.hilkov','Ango','andrey.iliopulo',
    'konstantin.kalinin', 'andrey.lakotko','anastasia.oblomova', 'valentin.lapchevskiy'
  ];

  var BLOCKS_TODO = [
    {
      title : 'To Do',
      projects : ['OTT', 'AH', 'AC'],
      statuses : ['Open', 'To Do'],
      limit : 49,
      title_link : 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) AND ({statuses}) AND (LABELS = Planned) AND assignee is Empty ORDER BY priority,rank',
      task_links : TASK_LINK,
      sort_by:'created_reverse'
    }
  ];

  var BLOCKS_DONE = [
    {
      title : 'Recently done',
      projects : ['OTT', 'AH', 'AC'],
      statuses : ['Done', 'Closed'],
      limit : 25,
      title_link : 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) and ({statuses}) ORDER BY priority,updated',
      task_links : TASK_LINK,
      sort_by:'updated'
    }
  ];

  var OPTIONS_TIMESPENT = {
    SCREEN_WIDTH : '100%'
  };

  var OPTIONS_DONE = {
    SCREEN_WIDTH : '50%',
    LOAD_BY_PRIORITY : 'updated',
    LOAD_LIMIT : 50,
    LOAD_PROJECTS : ['OTT', 'AH', 'AC'],
    SHOW_DUEDATE_PLUS_TIMESPEND : true
  };

  var OPTIONS_TODO = {
    SCREEN_WIDTH : '50%',
    LOAD_PROJECTS : ['OTT', 'AH', 'AC'],
    LABELS_TO_LOAD : ['Planned'],
    LOAD_LIMIT : 500,
  };

  var utils  = new window.Utils();
  var params = utils.getQueryString();
  var time_to_look   = +params.timespent || 7;

  var timespent = new window.TaskTimespend(DEVTEAM, time_to_look, document.getElementById('timespend-left'), OPTIONS_TIMESPENT);
  var todo = new window.TaskTable([], BLOCKS_TODO, ['!Closed', '!Done' , '!Rejected'], document.getElementById('timespend-bottom'), OPTIONS_TODO);
  var done = new window.TaskTable(DEVTEAM, BLOCKS_DONE, ['Closed', 'Done'], document.getElementById('timespend-right'), OPTIONS_DONE);

  // MAIN LOOP =>
  (function loadData(){
    timespent.process(function(){
      setTimeout(loadData, 5.1*60*1000);
    });
    todo.process(function(){});
    done.process(function(){});
  })();
})();

