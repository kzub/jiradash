(function(){

  var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';

  var DEVTEAM  = [
    'alexey.sutiagin','aleksandr.gladkikh','renat.abdusalamov','alexander.litvinov','alexander.neyasov','Yury.Kocharyan','h3x3d',
    'ek','andrey.ivanov','anton.ipatov','andrey.plotnikov',
    'fedor.shumov','ivan.hilkov','Ango','andrey.iliopulo','marina.severyanova',
    'konstantin.kalinin', 'andrey.lakotko','anastasia.oblomova'
  ];

  var BLOCKS_TODO = [
    {
      title : 'To Do',
      project : 'OTT',
      statuses : ['Open'],
      limit : 16,
      title_link : 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) AND ({statuses}) AND assignee is Empty ORDER BY priority,updated',
      task_links : TASK_LINK
    },{
      title : 'Bugs',
      project : 'OTT',
      statuses : ['To Do'],
      limit : 16,
      title_link : 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) AND ({statuses}) AND assignee is Empty ORDER BY priority,updated',
      task_links : TASK_LINK
    }
  ];

  var BLOCKS_DONE= [
    {
      title : 'Recently done',
      project : 'OTT',
      statuses : ['Done', 'Closed'],
      limit : 14,
      title_link : 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) and ({statuses}) ORDER BY priority,updated',
      task_links : TASK_LINK,
      sort_by:'updated'
    }
  ];

  var OPTIONS_TIMESPENT = {
    SCREEN_WIDTH : '50%'
  };

  var OPTIONS_DONE = {
    SCREEN_WIDTH : '50%',
    LOAD_BY_PRIORITY : 'updated',
    LOAD_LIMIT : 50,
    LOAD_PROJECTS : ['OTT']
  };

  var OPTIONS_TODO = {
    SCREEN_WIDTH : '50%',
    LOAD_PROJECTS : ['OTT']
  };

  var timespent = new window.TaskTimespend(DEVTEAM, document.getElementById('timespend-left'), OPTIONS_TIMESPENT);
  var todo = new window.TaskTable(BLOCKS_TODO, document.getElementById('timespend-right'), OPTIONS_TODO);
  var done = new window.TaskTable(BLOCKS_DONE, document.getElementById('timespend-bottom'), OPTIONS_DONE);

  // MAIN LOOP =>
  (function loadData(){
    timespent.process(7*1, 1*40, function(){
      setTimeout(loadData, 5*60*1000);
    });
    todo.process([], ['!Closed', '!Done' , '!Rejected'], function(){});
    done.process(DEVTEAM, ['Closed', 'Done'], function(){});
  })();
})();

