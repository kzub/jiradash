(function(){

  var TASK_STATUSES     = ['!Closed', '!Done', '!Rejected', '!Merge ready', '!In Release', '!Test ready'];
  var QA_TASK_STATUSES  = ['Test ready', 'Testing', 'In Testing', 'Ready for Test'];
  var PM_TASK_STATUSES  = ['!Closed', '!Done', '!Rejected', '!Finished'];
  var SV_TASK_STATUSES  = ['!Closed', '!Done', '!Rejected', '!Finished'];
  var OPEN_TASK_STATUSES= ['!Closed', '!Done', '!Rejected', '!Finished'];

  var USER_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=((assignee = {login} OR Reviewer = {login}) AND ({statuses})) ORDER BY priority,created ASC';
  var PM_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=((PM = {login}) AND ({statuses})) ORDER BY priority,created ASC';
  var TASK_LINK = 'https://onetwotripdev.atlassian.net/browse/{key}';
  var STATUS_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=project IN({project}) and ({statuses}) ORDER BY priority,created ASC';
  var LABELS_LINK = 'https://onetwotripdev.atlassian.net/issues/?jql=({labels}) and ({statuses}) ORDER BY priority,created ASC';

  var BLOCK2;

  if(~document.location.href.indexOf('qa')){
    var VIEWTEAM  = ['marat.tolegenov', 'alfina.biktasheva', 'sergey.matveev', 'veronika.peknaya'];
    var LEADLIMIT = 20;
    var DEVLIMIT  = 10;

    BLOCKS = [
    { login : 'sergey.matveev', title_link : USER_LINK, task_links : TASK_LINK, statuses : QA_TASK_STATUSES, limit : LEADLIMIT},
    { login : 'marat.tolegenov', title_link : USER_LINK, task_links : TASK_LINK, statuses : QA_TASK_STATUSES, limit : DEVLIMIT},
    { login : 'alfina.biktasheva', title_link : USER_LINK, task_links : TASK_LINK, statuses : QA_TASK_STATUSES, limit : DEVLIMIT},
    { login : 'veronika.peknaya', title_link : USER_LINK, task_links : TASK_LINK, statuses : QA_TASK_STATUSES, limit : DEVLIMIT},
    ];

    var TASK_REWRITE_RULES = [
      {
        fields : {
          status : QA_TASK_STATUSES
        },
        change_fields : {
          login : {
            source_field : 'reviewer',
            source_field_allowed_values : VIEWTEAM
          }
        }
      },
      {
        fields : {
          status : QA_TASK_STATUSES
        },
        change_fields : {
          login : {
            source_field : 'testEngineer',
            source_field_allowed_values : VIEWTEAM
          }
        }
      }
    ];

    var STATUSES_TO_LOAD = QA_TASK_STATUSES;
    var OPTIONS = {
      COLUMNS : 1,
      MOBILE_COLUMNS : 1,
      MOBILE_BLOCKS_SORTER : 'project_attribute',
      REVIEWERS : VIEWTEAM,
      TEST_ENGINEERS : VIEWTEAM,
      TASK_REWRITE_RULES : TASK_REWRITE_RULES,
      SCREEN_WIDTH : '50%'
    };

    var BLOCKS2 = [
      { login : 'sergey.matveev', title_link : USER_LINK, task_links : TASK_LINK, statuses : OPEN_TASK_STATUSES, limit : LEADLIMIT},
      { login : 'marat.tolegenov', title_link : USER_LINK, task_links : TASK_LINK, statuses : OPEN_TASK_STATUSES, limit : DEVLIMIT},
      { login : 'alfina.biktasheva', title_link : USER_LINK, task_links : TASK_LINK, statuses : OPEN_TASK_STATUSES, limit : DEVLIMIT},
      { login : 'veronika.peknaya', title_link : USER_LINK, task_links : TASK_LINK, statuses : OPEN_TASK_STATUSES, limit : DEVLIMIT},
    ];

    var OPTIONS2 = {
      SCREEN_WIDTH : '50%',
      COLUMNS : 1,
      MOBILE_COLUMNS : 1,
      MOBILE_BLOCKS_SORTER : 'project_attribute',
      LOAD_PROJECTS : ['QA']
    };

    BLOCK2 = {
      VIEWTEAM: VIEWTEAM,
      BLOCKS: BLOCKS2,
      STATUSES_TO_LOAD: OPEN_TASK_STATUSES,
      OPTIONS: OPTIONS2
    };
  }
  else if(~document.location.href.indexOf('hotels')){
    var VIEWTEAM  = ['sergey.matveev', 'maserg', 'ruslan.kislitskiy'];
    var LEADLIMIT = 5;
    var DEVLIMIT  = 3;

    BLOCKS = [
    { login : 'maserg', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT},
    { projects : ['HOT'], statuses : ['Merge ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Merge ready'},
    { projects : ['HOT'], statuses : ['Test ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Test ready'},
    { login : 'ruslan.kislitskiy', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT}
    ];

    var STATUSES_TO_LOAD = ['!Closed', '!Rejected'];
    var OPTIONS = {
      COLUMNS : 2,
      MOBILE_COLUMNS : 1,
      MOBILE_BLOCKS_SORTER : 'project_attribute'
    };
  }
  else if(~document.location.href.indexOf('devops')){
    var VIEWTEAM  = ['maxim.pogozhiy', 'anton.rumyantsev', 'vladimir.karnushin', 'anton.ryabov', 'andrey.mikhaltsov'];
    var LEADLIMIT = 20;
    var DEVLIMIT  = 10;

    BLOCKS = [
    { login : 'vladimir.karnushin', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { projects : ['SRV'], statuses : ['Code Review'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Code Review'},

    { login : 'andrey.mikhaltsov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { projects : ['SRV'], statuses : ['Test ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Test Ready'},

    { login : 'anton.rumyantsev', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT},
    { projects : ['SRV'], statuses : ['Merge ready'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Merge Ready'},

    { login : 'maxim.pogozhiy', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT},
    { projects : ['SRV'], statuses : ['Done'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Done', sort_by : 'updated', limit : DEVLIMIT },

    { login : 'anton.ryabov', title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT}
    ];

    var STATUSES_TO_LOAD = ['!Closed', '!Rejected'];
    var OPTIONS = {
      COLUMNS : 2,
      MOBILE_COLUMNS : 1,
      MOBILE_BLOCKS_SORTER : 'project_attribute'
    };
  }
  else if(~document.location.href.indexOf('pm2')){
    var VIEWTEAM  = [ 'nikolay.malikov' ];
    var PMLIMIT   = Infinity;
    var sorting_order = 'duedate_priority';

    BLOCKS = [
    { login : 'nikolay.malikov',  title_link : USER_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { title : 'Peter Kutis', labels : ['PK'], title_link : LABELS_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order }
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
  else if(~document.location.href.indexOf('pm')){
    var VIEWTEAM  = ['rostislav.palchun','valentin.kachanov','leonid.riaboshtan','nikolay.malikov',
                     'timur.danilov','dmitry.rumyantsev','dmitry.panshin','maxim.azarov','dmitry.kobelev',
                     'Yulia.Vorobyova','andrey.razumovskiy', 'alexey.lyashchenko',
                     'max.karaush','MarinaM','kim','oksana.zaharova', 'marina.vyalkina',
                     'polina.rusakova','dmitry.panshin','violetta.tsimbalyuk',
                     'alina.agarkova', 'evgeny.gaponenko', 'denis.drozdovskiy', 'fedor.tarasyuk'];

    var PMLIMIT   = Infinity;
    var sorting_order = 'duedate_priority';

    BLOCKS = [
    { login : 'rostislav.palchun',  title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'valentin.kachanov',  title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'evgeny.gaponenko',   title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'leonid.riaboshtan',  title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'nikolay.malikov',    title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'timur.danilov',      title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'dmitry.rumyantsev',  title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'dmitry.panshin',     title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'maxim.azarov',       title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'dmitry.kobelev',     title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'Yulia.Vorobyova',    title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'andrey.razumovskiy', title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'MarinaM',            title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'kim',                title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'oksana.zaharova',    title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'polina.rusakova',    title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'violetta.tsimbalyuk',title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'max.karaush',        title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'alina.agarkova',     title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'denis.drozdovskiy',  title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'fedor.tarasyuk',     title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'marina.vyalkina',    title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'alexey.lyashchenko', title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { title : 'TODO', labels : ['PM-Planned'], title_link : LABELS_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order }
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
  else if(~document.location.href.indexOf('marketing')){
    var VIEWTEAM  = ['alexey.teplov', 'stanislav.stavsky', 'alexander.bezhan',
                     'artur.bolshakov','ekaterina.ivanova', 'leonid.evtushenko',
                     'aleksandr.raevsky', 'zarina.bobodzhonova',
                      'pavel.uryadov', 'konstantin.sukhachev'];

    var PMLIMIT   = Infinity;
    var sorting_order = 'duedate_priority';

    BLOCKS = [
    { login : 'alexey.teplov',      title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'stanislav.stavsky',  title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'alexander.bezhan',   title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'artur.bolshakov',    title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'leonid.evtushenko',   title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'ekaterina.ivanova',  title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'aleksandr.raevsky',    title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'zarina.bobodzhonova',title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'pavel.uryadov',      title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order },
    { login : 'konstantin.sukhachev',    title_link : PM_LINK, task_links : TASK_LINK, statuses : PM_TASK_STATUSES, limit : PMLIMIT, sort_by : sorting_order }
    ];

    var STATUSES_TO_LOAD = ['!Closed', '!Rejected', '!Done'];
    var OPTIONS = {
      COLUMNS : 2,
      MOBILE_COLUMNS : 1,
      MOBILE_BLOCKS_SORTER: 'project_attribute',
      LOGIN_KEY_FIELDNAME : 'customfield_10201',
      LOGIN_KEY_CONDTIONS : 'PM',
      SHOW_DUEDATE_INSTEAD_TIMESPEND : true
    };
  }
  else if(~document.location.href.indexOf('roadmap')){
    var VIEWTEAM  = [
      'mikhail.sokolov', 'konstantin.mamonov', 'leonid.riaboshtan', 'konstantin.zubkov',
      'kim', 'max.karaush', 'dmitry.kayutin', 'alexey.lyashchenko', 'vadim.kudelko',
      'dmitry.panshin', 'alexey.teplov', 'nikolay.malikov', 'fedor.tarasyuk'
    ];

    var SVLIMIT   = Infinity;
    var sorting_order = 'duedate_priority';

    BLOCKS = [
    { login : 'mikhail.sokolov',   title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT, sort_by : sorting_order },
    { login : 'konstantin.mamonov',title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT, sort_by : sorting_order },
    { login : 'leonid.riaboshtan', title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT, sort_by : sorting_order },
    { login : 'dmitry.panshin',    title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT, sort_by : sorting_order },
    { login : 'alexey.teplov',     title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT, sort_by : sorting_order },
    { login : 'dmitry.kayutin',    title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT, sort_by : sorting_order },
    { login : 'kim',               title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT, sort_by : sorting_order },
    { login : 'max.karaush',       title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT, sort_by : sorting_order },
    { login : 'alexey.lyashchenko',title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT, sort_by : sorting_order },
    { login : 'vadim.kudelko',     title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT, sort_by : sorting_order },
    { login : 'nikolay.malikov',   title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT, sort_by : sorting_order },
    { login : 'fedor.tarasyuk',    title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT, sort_by : sorting_order },
    { login : 'konstantin.zubkov', title_link : USER_LINK, task_links : TASK_LINK, statuses : SV_TASK_STATUSES, limit : SVLIMIT, sort_by : sorting_order }
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
  else if(~document.location.href.indexOf('tver')){
    var VIEWTEAM  = 'all';

    var SVLIMIT   = Infinity;
    var sorting_order = 'duedate_priority';

    BLOCKS = [
      { projects : ['OTT', 'AH', 'AC', 'PM', 'SEO', 'FE'], title_link : STATUS_LINK, task_links : TASK_LINK, title : 'Tver Tasks', sort_by : sorting_order},
    ];

    var STATUSES_TO_LOAD = ['To Do', 'Open'];
    var OPTIONS = {
      COLUMNS : 2,
      MOBILE_COLUMNS : 1,
      LABELS_TO_LOAD : ['TT']
    };
  }
  else{
    var AVIATEAM  = ['alexey.sutiagin','ek','aleksandr.gladkikh',
                     'Ango','andrey.plotnikov','andrey.iliopulo', 'konstantin.altukhov',
                     'konstantin.kalinin', 'dmitry.zharsky', 'alexey.krylov', 'anton.evseichev', 'vadim.kudryavtsev', 'vadim.shilov', 'leonid.shabalkin',
                     'pavel.vlasov', 'alexey.mozgachev', 'edgar.nurullin', 'gleb.lobastov', 'maxim.urukov',
                     'igor.lobanov', 'kirill.krasavin', 'evgeny.bondarenko',
                     'anton.panov', 'dmitry.panfilov', 'ilya.ermolin', 'nikita.namestnikov', 'kirill.veselov', 'denis.siziy', 'artem.kudryavtsev'];
    var VIEWTEAM  = ['konstantin.zubkov', 'leonid.riaboshtan'].concat(AVIATEAM);

    var LEADLIMIT = 20;
    var DEVLIMIT = 10;

    var TASK_REWRITE_RULES = [
      { // without team
        fields : {
          status : ['Code Review', 'Resolved']
        },
        change_fields : {
          login : {
            source_field : 'reviewer',
            source_field_allowed_values : AVIATEAM
          }
        }
      },
      {
        fields : {
          login  : ['Ango', 'andrey.iliopulo', 'dmitry.zharsky', 'alexey.krylov', 'anton.evseichev', 'vadim.kudryavtsev', 'edgar.nurullin', 'maxim.urukov', 'igor.lobanov'],
          status : ['Code Review', 'Resolved']
        },
        change_fields : {
          login : {
            source_field : 'reviewer',
            source_field_allowed_values : AVIATEAM,
            default : 'dmitry.zharsky',
          }
        }
      },
      {
        fields : {
          login  : ['alexey.mozgachev', 'aleksandr.gladkikh', 'konstantin.altukhov', 'alexandr.petrov', 'pavel.vlasov', 'kirill.krasavin', 'ilya.ermolin', 'anton.panov', 'kirill.veselov', 'dmitry.panfilov', 'denis.siziy', 'artem.kudryavtsev'],
          status : ['Code Review', 'Resolved']
        },
        change_fields : {
          login : {
            source_field : 'reviewer',
            source_field_allowed_values : AVIATEAM,
            default : 'alexey.sutiagin'
          }
        }
      },
		{
			fields : {
				login  : ['konstantin.altukhov'],
				status : ['Code Review', 'Resolved']
			},
			change_fields : {
				login : {
					source_field : 'reviewer',
					source_field_allowed_values : AVIATEAM,
					default :  'alexandr.petrov'
				}
			}
		},
		{
			fields : {
				login  : [ 'alexandr.petrov'],
				status : ['Code Review', 'Resolved']
			},
			change_fields : {
				login : {
					source_field : 'reviewer',
					source_field_allowed_values : AVIATEAM,
					default : 'konstantin.altukhov'
				}
			}
		},
      {
        fields : {
          login  : [ 'evgeny.bondarenko'],
          status : ['Code Review', 'Resolved']
        },
        change_fields : {
          login : {
            source_field : 'reviewer',
            source_field_allowed_values : AVIATEAM,
            default : 'ek'
          }
        }
      },
      {
        fields : {
          login  : ['vadim.shilov', 'leonid.shabalkin'],
          status : ['Code Review', 'Resolved']
        },
        change_fields : {
          login : {
            source_field : 'reviewer',
            source_field_allowed_values : AVIATEAM,
            default : 'konstantin.kalinin'
          }
        }
      },
      {
        fields : {
          login  : ['someandrewman', 'nikita.namestnikov'],
          status : ['Code Review', 'Resolved']
        },
        change_fields : {
          login : {
            source_field : 'reviewer',
            source_field_allowed_values : AVIATEAM,
            default : 'andrey.plotnikov'
          }
        }
      }
    ];

    var sorting_order = 'review_inprogress_created';
    var BACKEND_BLOCKS = [
	    { login : 'alexey.sutiagin',      title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT, sort_by : sorting_order },
	    { login : 'ek',                   title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT, sort_by : sorting_order },
	    { login : 'konstantin.altukhov',  title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
	    { login : 'konstantin.kalinin',   title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT, sort_by : sorting_order},

	    { login : 'alexey.mozgachev',     title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order },
	    { login : 'vadim.shilov',         title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
        { login : 'leonid.shabalkin',     title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
	    { login : 'alexandr.petrov',      title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},

	    { login : 'andrey.plotnikov',     title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
	    { login : 'pavel.vlasov',         title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order },
	    { login : 'ilya.ermolin',    title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order },
	    { login : 'aleksandr.gladkikh',   title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},

	    { login : 'kirill.veselov',       title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order },
	    { login : 'kirill.krasavin',      title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
	    { login : 'evgeny.bondarenko',    title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order },
	    { login : 'anton.panov',          title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order },

	    { login : 'dmitry.panfilov',      title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order },
	    { login : 'nikita.namestnikov',   title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order },
	    { login : 'denis.siziy',          title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order },
	    { login : 'artem.kudryavtsev',    title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order },
    ];

    var BLOCKS = BACKEND_BLOCKS.concat([
	    { login : 'dmitry.zharsky',       title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : LEADLIMIT, sort_by : sorting_order },
      { login : 'alexey.krylov',        title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order },
      { login : 'anton.evseichev',      title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order },
	    { login : 'andrey.iliopulo',      title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
	    { login : 'Ango',                 title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order},
	    { login : 'vadim.kudryavtsev',    title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order },

	    { login : 'gleb.lobastov',        title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order },
	    { login : 'maxim.urukov',         title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order },
	    { login : 'edgar.nurullin',       title_link : USER_LINK, task_links : TASK_LINK, statuses : TASK_STATUSES, limit : DEVLIMIT, sort_by : sorting_order }
	]);

    var STATUSES_TO_LOAD = ['!Closed', '!Done' , '!Rejected'];
    var OPTIONS = {
      TASK_REWRITE_RULES : TASK_REWRITE_RULES,
      COLUMNS : 4,
      MOBILE_COLUMNS : 1,
      LAPTOP_COLUMNS : 2,
      MOBILE_BLOCKS_SORTER : [
        'alexey.sutiagin',
        'konstantin.altukhov',
        'ilya.ermolin',
        'aleksandr.gladkikh',
        'alexandr.petrov',
        'gleb.lobastov',
        'kirill.krasavin',
        'kirill.veselov',

        'ek',
        'andrey.plotnikov',
        'konstantin.kalinin',
        'vadim.shilov',
        'leonid.shabalkin',
        'pavel.vlasov',
        'alexey.mozgachev',
        'evgeny.bondarenko',
        'anton.panov',
        'dmitry.panfilov',
        'denis.siziy',
        'artem.kudryavtsev',
        'nikita.namestnikov',

        'Ango',
        'andrey.iliopulo',
        'dmitry.zharsky',
        'alexey.krylov',
        'anton.evseichev',
        'maxim.urukov',
        'vadim.kudryavtsev',
        'edgar.nurullin',
        'igor.lobanov',

        'Test Ready',
        'Merge Ready',
        'Release',
        'In Release'
      ],
      LAPTOP_BLOCKS_SORTER : [
        'alexey.sutiagin',    'ek',
        'evgeniy.petrov',     'andrey.plotnikov',
        'konstantin.kalinin',  'denis.siziy',
        'vadim.shilov',       'artem.kudryavtsev',
        'leonid.shabalkin',   'dmitry.panfilov',
        'alexandr.petrov',    'ilya.ermolin',
        'aleksandr.gladkikh', 'konstantin.altukhov',
        'Ango',               'edgar.nurullin',
        'evgeny.bondarenko',  'gleb.lobastov',
        'anton.panov',        'maxim.urukov',
        'andrey.iliopulo',     'dmitry.zharsky',
        'alexey.krylov',      'anton.evseichev',
        'nikita.namestnikov', 'igor.lobanov',
        'kirill.krasavin',    'vadim.kudryavtsev',
        'kirill.veselov',
      ],
      // SHOW_DUEDATE_PLUS_TIMESPEND : true,
      REVIEWERS : AVIATEAM
    };

       if(~document.location.href.indexOf('backend')){
		  BLOCKS = BACKEND_BLOCKS;
	  }
  }

  var task_engine = new window.TaskTable(VIEWTEAM, BLOCKS, STATUSES_TO_LOAD, document.getElementById('todo_block'), OPTIONS);

  var task_engine2;
  if(BLOCK2){
    task_engine2 = new window.TaskTable(BLOCK2.VIEWTEAM, BLOCK2.BLOCKS, BLOCK2.STATUSES_TO_LOAD, document.getElementById('todo_block2'), BLOCK2.OPTIONS);
  }
  // MAIN LOOP =>
  (function loadData(){
    task_engine.process(function(){
      setTimeout(loadData, 5.1*60*1000);
    });

    if(task_engine2){
      task_engine2.process(function(){
        setTimeout(loadData, 5.1*60*1000);
      });
    }
  })();
})();

