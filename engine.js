var EventEmmiter = function(){
	var self = this;
	var events = {};

	self.on = function(event, handler){
		if(!handler instanceof Function){ return; }
		events[event] = events[event] || [];
		events[event].push(handler);
	};

	var getCaller = function(func, p1, p2){
		return function(){
			func(p1, p2);
		};
	};

	self.emit = function(event, p1, p2){
		if(!events[event]){ return; }

		for(var hIdx in events[event]){
			var func = events[event][hIdx];
			setTimeout(getCaller(func, p1, p2), 0);
		}
	}
};
var events = new EventEmmiter();

/*
* Place where the data from jira is stored
*/
function Storage(){
	this.persons = {};
	this.tasks = [];
};

Storage.prototype.addPerson = function(login, displayName, avatar){
	if(!this.persons[login]){
		this.persons[login] = {
			displayName : displayName,
			avatar : avatar
		};
	}
};

Storage.prototype.addPersonTask = function(login, task){
	if(!this.persons[login]){
		this.persons[login] = {};
	}
	if(!this.persons[login].tasks){
		this.persons[login].tasks = [];
	}
	this.tasks.push(task);
	this.persons[login].tasks.push(task);
};

Storage.prototype.getPersons = function(login){
	if(login){ return this.persons[login]; }
	return this.persons;
};

Storage.prototype.getTasks = function(login, status, sort){
	var filtered_tasks = [];

	for(var i = 0; i < this.tasks.length; i++){
		var task = this.tasks[i];

		// filter by login
		if(login){
			if(login instanceof Array){
				if(login.indexOf(task.login) === -1){
					continue
				}
			}
			else if(task.login !== login){
				continue;
			}
		}			

		// filter by status
		if(!status){
			filtered_tasks.push(task);
		}
		else if(status instanceof Array){
			if(status.indexOf(task.status) > -1){
				filtered_tasks.push(task);
			}
		}
		else if(status === task.status){
			filtered_tasks.push(task);
		}
	}

	if(sort){
		filtered_tasks.sort(function(a, b){
			return b[sort] - a[sort];
		});
	}
	return filtered_tasks;
};

Storage.prototype.clear = function(login, status, sort){
	this.persons = {};
	this.tasks = [];
};

var storage = new Storage;

/*
* Page layout definition
*/
var LAYOUT = [[],[],[],[]];
LAYOUT.getHeight = function(col){
	var height = 0;
	for(var i in LAYOUT[col]){
		height += LAYOUT[col][i];
	}
	return height;
};
LAYOUT.addHeight = function(col, height){
	LAYOUT[col].push(height);
};
LAYOUT.x = 0;
LAYOUT.nextWindow = function(){
	if(this.x++ >= LAYOUT.length - 1){
		this.x = 0;
	}
};
LAYOUT.getWindowNum = function(){
	return this.x;
};
LAYOUT.reset = function(){
	for(var i in LAYOUT){
		if(LAYOUT[i] instanceof Array){
			LAYOUT[i] = [];
		}
	}
	LAYOUT.x = 0;
};

/*
* SVG drawing helpers
*/
function SVG(container){
	var self = this;
	var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
	svg.setAttribute('class', 'paper');
	container.appendChild(svg);

	this.text = function(x, y, text){
		var txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
		svg.appendChild(txt);
		txt.setAttribute('x', x);
		txt.setAttribute('y', y);
		txt.innerHTML = text;
		return txt;
	};

	this.img = function(x, y, w, h, url){
		var svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
		svgimg.setAttributeNS(null,'height', w);
		svgimg.setAttributeNS(null,'width', h);
		svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href', url);
		svgimg.setAttributeNS(null,'x', x);
		svgimg.setAttributeNS(null,'y', y);
		svgimg.setAttributeNS(null, 'visibility', 'visible');
		svg.appendChild(svgimg);
	}

	this.setAttribute = function(attr, value){
		svg.setAttribute(attr, value);
	}
};

/*
* define constants
*/
var CONST = {
	block_width		: 480,
	block_margin_x: 0,
	block_margin_y: 10,
	line_height		: 20
}

var PRIORITY_RANK = {
	'ASAP'		: 4,
	'Blocker'	: 3,
	'Critical': 2,
	'Major'		: 1,
	'Minor'		: 0
};

var DEVTEAM		= ['alexey.sutiagin','ek','fedor.shumov','aleksandr.gladkikh','andrey.ivanov','ivan.hilkov','renat.abdusalamov','anton.ipatov','Ango','alexander.litvinov','andrey.plotnikov','andrey.iliopulo','alexander.neyasov','marina.severyanova','Yury.Kocharyan','konstantin.kalinin','konstantin.zubkov','h3x3d'];
var DEVLIMIT	= 5;
var LEADLIMIT	= 15;

var BLOCKS = [
	{ login : 'alexey.sutiagin', status : ['In Progress', 'To Do', 'Open'], limit : LEADLIMIT},
	{ login : 'ek', status : ['In Progress', 'To Do', 'Open'], limit : LEADLIMIT},
	{ login : 'fedor.shumov', status : ['In Progress', 'To Do', 'Open'], limit : LEADLIMIT},
	{ status : 'Code Review', logins : DEVTEAM },
	
	{ login : 'aleksandr.gladkikh', status : ['In Progress', 'To Do', 'Open'], limit : DEVLIMIT},
	{ login : 'andrey.ivanov', status : ['In Progress', 'To Do', 'Open'], limit : DEVLIMIT},
	{ login : 'ivan.hilkov', status : ['In Progress', 'To Do', 'Open'], limit : DEVLIMIT},
	{ status : 'Test ready', logins : DEVTEAM},
	
	{ login : 'renat.abdusalamov', status : ['In Progress', 'To Do', 'Open'], limit : DEVLIMIT},
	{ login : 'anton.ipatov', status : ['In Progress', 'To Do', 'Open'], limit : DEVLIMIT},
	{ login : 'Ango', status : ['In Progress', 'To Do', 'Open'], limit : DEVLIMIT},
	{ status : 'Merge ready', logins : DEVTEAM},

	{ login : 'alexander.litvinov', status : ['In Progress', 'To Do', 'Open'], limit : DEVLIMIT},
	{ login : 'andrey.plotnikov', status : ['In Progress', 'To Do', 'Open'], limit : DEVLIMIT},
	{ login : 'andrey.iliopulo', status : ['In Progress', 'To Do', 'Open'], limit : DEVLIMIT},
	{ skip : 1 },
	{ login : 'alexander.neyasov', status : ['In Progress', 'To Do', 'Open'], limit : DEVLIMIT},
	{ skip : 1 },
	{ login : 'marina.severyanova', status : ['In Progress', 'To Do', 'Open'], limit : DEVLIMIT},
	{ skip : 1 },
	{ login : 'Yury.Kocharyan', status : ['In Progress', 'To Do', 'Open'], limit : DEVLIMIT},
	{ login : 'konstantin.kalinin', status : ['In Progress', 'To Do', 'Open'], limit : DEVLIMIT},
	{ skip : 1 },
	{ skip : 1 },
	{ login : 'h3x3d', status : ['In Progress', 'To Do', 'Open'], limit : DEVLIMIT},
	{ login : 'konstantin.zubkov', status : ['In Progress', 'To Do', 'Open'], limit : DEVLIMIT},
	{ login : 'andrey.lakotko', limit : DEVLIMIT},
	{ skip : 1 },
	{ skip : 1 },
	{ skip : 1 },
	{ login : 'anastasia.oblomova', limit : DEVLIMIT}
];

/*
* Main program
*/

function processResults(data){
	for(var i = 0; i < data.issues.length; i++){
		var issue = data.issues[i];
		
		if(issue.fields.assignee){
			var displayName = issue.fields.assignee.displayName;
			var email = issue.fields.assignee.emailAddress;
			var login = issue.fields.assignee.name;
			var avatar = issue.fields.assignee.avatarUrls['48x48'];

			storage.addPerson(login, displayName, avatar);

			storage.addPersonTask(login, {
				login : login,
				status : issue.fields.status.name,
				statusIcon : issue.fields.status.iconUrl,
				priorityIcon : issue.fields.priority.iconUrl,
				priority : PRIORITY_RANK[issue.fields.priority.name],
				issuetypeIcon : issue.fields.issuetype.iconUrl,
				key : issue.key,
				subtasks : issue.fields.subtasks.length,
				summary : issue.fields.summary,
				project : issue.fields.project.key,
				timespent : Math.round(10*issue.fields.timespent/3600)/10
			});
		}

		if(i==0)console.log(issue);
	};
}

function clearScreen(){
	// CLEAR SCREEN
	var node = document.body;
	while (node.hasChildNodes()) {
	  node.removeChild(node.lastChild);
	}	
	LAYOUT.reset();
}

function draw(){
	function getLine(init){
		if(init !== undefined){
			this.line = init;
		}
		return CONST.line_height*this.line++;
	};

	// MAIN CODE:
	for(var idx in BLOCKS){
		var title = '';
		var block = BLOCKS[idx];

		if(block.skip){
			LAYOUT.nextWindow();
			continue;
		}

		if(block.login){
			var person = storage.getPersons(block.login);
			title = person && person.displayName || block.login;
		}
		else if(block.status){
			title = block.status instanceof Array ? block.status.join() : block.status;
		}

		var block_data = {
			title : title,			
			tasks : storage.getTasks(block.login || block.logins, block.status, 'priority')
		};

		// create box
		var container = document.createElement("div");
		container.setAttribute('class', 'man');
		document.body.appendChild(container);
		
		// init SVG
		paper = new SVG(container);
		// add names
		paper.text(0, getLine(1), block_data.title).setAttribute('class', 'man_name');
		
		var tasks_to_display = 2;
		// add tasks
		for(var i in block_data.tasks){
			var task = block_data.tasks[i];

			// mark tasks with subtasks
			var css_name = task.status.replace(/ /g, '_').toLowerCase();
			if(task.subtasks){
				css_name += ' subtasks';
			}
			
			// draw  info line
			var text = [task.timespent + 'h', task.key, task.summary].join(' ');
			var y = getLine();
			paper.text(36, y, text).setAttribute('class', css_name);
			paper.img(0,  y-14, 16, 16, task.priorityIcon);
			paper.img(16, y-14, 16, 16, task.issuetypeIcon);
			
			tasks_to_display++;
			
			if(i >= block.limit -1){
				paper.text(0, getLine(), '. . .');
				tasks_to_display+=0.5;
				break;
			}
		}

		// adjust block deminition
		var height = tasks_to_display * CONST.line_height;

		container.style.left = CONST.block_margin_x + (CONST.block_width * LAYOUT.getWindowNum()) + 'px';
		container.style.top  = LAYOUT.getHeight(LAYOUT.getWindowNum()) + 'px';
		container.style.height = height + 'px';
		paper.setAttribute('height', height);

		LAYOUT.addHeight(LAYOUT.getWindowNum(), height + CONST.block_margin_y);
		LAYOUT.nextWindow();
		
	}
}

var TASKS_TO_WORK = 
	'status = "In Progress" Or status = "To Do" OR status="Open" OR status="Code Review" OR status="Merge ready" OR status="Test ready" ' + 
	'AND assignee IN (' + DEVTEAM.join(',') + ') ' + 
	'ORDER BY priority,updatedDate';
var query = '/rest/api/2/search?maxResults=5000&fields=id,key,assignee,status,priority,issuetype,subtasks,summary,project,timespent&jql=' + TASKS_TO_WORK;

var stop = false;
function loadData(){
	d3.json(query, function(err, data){
		clearScreen();
		
		if(data){
			storage.clear();
			processResults(data);
			draw();
		}
		if(stop){ return; }
		setTimeout(loadData, 5*60*1000);
	});	
}

loadData();
// processResults(null, _data);
