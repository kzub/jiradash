(function(){
  function ENGINE(DEVTEAM, DAYS_TO_ANALIZE, MAIN_CONTAINER, OPTIONS){
    var self = this;
    var layout  = new window.TaskLayout(OPTIONS);
    var network = new window.Network();
    var utils   = new window.Utils(OPTIONS);
    var drawlib = new window.DrawLib();
    var startDate = Date.now() - (DAYS_TO_ANALIZE)*1000*60*60*24;
    var endDate = Date.now();
    let timeoffs = [];
    let people = [];
    var ts_max = utils.getDayEndMs();
    var ts_min = utils.getDayEndMs(startDate);

    window.textUtils.loadDict(DEVTEAM);

    function timeoff_color(type) {
      if (type.startsWith('Отпуск')) return 'green';
      if (type.startsWith('Больничный')) return 'orange';
      if (type.includes('личные обстоятельства')) return 'red';
      if (type.startsWith('Работаю из')) return 'gray';
  
      return '#994d00';
    }

    var drawBlocksTable = function(){
      var task_day_offset = {};

      var bar_height = OPTIONS.BAR_HEIGHT || 18;
      var bar_margin = bar_height / 7;
      var top_margin = 22;
      var bottom_margin = 4;
      var left_margin = 0; // DEVTEAM.reduce(function(a, b){ return ((a|0) >= b.length) || (b.length > 15) ? a|0 : b.length; }); // max name length
      var right_margin = 160; // left_margin;

      var width = layout.getBlockWidth();
      var height = people.length * (bar_height + bar_margin);
      var dates_x_shift = (width / DAYS_TO_ANALIZE)/3;

      var x_v2 = d3.scale.linear()
          .range([0, width - left_margin - right_margin])
          .domain([ts_min, ts_max]);

      var y = d3.scale.linear()
          .range([height, 0])
          .domain([0, people.length]);

      // Draw timeline axis
      var xAxis = d3.svg.axis()
          .scale(x_v2)
          .orient("bottom")
          .tickSize(0)
          .tickValues(d3.time.days(ts_min, ts_max))
          .tickFormat(function(d){
            return new Date(d).toDateString().slice(4, 10);
          });

      // CREATE PLACE TO DRAW
      var svg = d3.select(MAIN_CONTAINER).append("svg")
        .attr("width", width)
        .attr("height", height + top_margin + bottom_margin)
        .append("g")
        .attr("transform", "translate(" + left_margin + "," + top_margin+ ")");

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate("+dates_x_shift+"," + -top_margin + ")")
          .call(xAxis);

      // DRAW SPENTLINE
      var man_line = svg.selectAll(".bar-back")
          .data(people)
        .enter().append("g")

      // BACKGROUND BIG GRAY BAR
      man_line.append('rect')
        .attr("x", 0)
        .attr("y", function(person, i) {
          return height - y(i) + bar_height/2;
        })
        .attr("height", function(d){
          return 2;
        })
        .attr("width", x_v2(ts_max))
        .attr('class', function(d, i){
          if(!d.displayName){
            return 'man-timespent-background3';
          }
          return i % 2 === 0 ? 'man-timespent-background' : 'man-timespent-background2';
        })

      // TIMEOFF BARS
      man_line = man_line.selectAll(".tasks")
        .data(function(person){
          return person.timeoffs;
        })
      .enter().append("g");

      man_line.append("a")
        .append('rect')
        .attr("class", "timeoff-bar")
        .attr("width", function(timeoff, i, p) {
          return x_v2(timeoff.ts_end) - x_v2(timeoff.ts_start);
        })
        .attr("x", function(timeoff, i, p){
          return x_v2(timeoff.ts_start);
        })
        .attr("y", function(d, i, p) {
          return height - y(p);
        })
        .attr("height", bar_height)
        .attr('fill', function(timeoff, i, p){
          return timeoff_color(timeoff.type);
        })

      // TIMEOFF TYPE TEXT
      man_line.append('a')
        .attr('xlink:title', function(timeoff) {
          return timeoff.type;
        })
        .append('text')
        .attr("x", function(timeoff, i, p){
          return x_v2(timeoff.ts_start);
        })
        .attr("y", function(d, i, p) {
          return height - y(p);
        })
        .text(function(timeoff){
          return ('(' + timeoff.duration + ') ' + timeoff.type).slice(0, 30);
        })
        .attr('class', 'text-task-keys')

      // DRAW NAMES (right) draw last to fix overflow
      svg.append("g")
        .attr("transform", "translate(-10, 0)")
        .selectAll(".names")
        .data(people)
        .enter()
      .append("text")
        .attr("x", function(task, i, p){
          return x_v2(ts_max) + 20;
        })
        .attr("y", function(d, i, p) {
          return height - y(i);
        })
        .text(function(p){
          return p.displayName
        })
        .attr('class', 'text-timespent-names-right')

    };

    this.clearScreen = function(){
      // CLEAR SCREEN
      var node = MAIN_CONTAINER;
      while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
      }
      layout.reset();
    };

    this.drawMsg = function(text){
      var container = document.createElement("div");
      container.setAttribute('class', 'message');
      MAIN_CONTAINER.appendChild(container);
      container.innerHTML = text;
    };

    this.process = function(callback){
      network.post('/monitor/keepteam/timeoffs', {
        startDate: (new Date(ts_min - (1000*60*60*24*30)).toJSON()),
        endDate: (new Date(ts_max).toJSON()),
      }, function(err, data) {
        if (err) {
          console.log('Network error');
          return;
        }
        timeoffs = data;

        const byPeople = timeoffs.reduce((acc, elm) => {
          if (!acc[elm.name]) {
            acc[elm.name] = {
              displayName: elm.name,
              timeoffs: [],
            };
          }

          let ts_start = utils.getDayStartMs(elm.startDate);
          let ts_end = utils.getDayEndMs(elm.endDate);

          if (ts_start > ts_max) {
            return acc;
          }
          if (ts_end < ts_min) {
            return acc;
          }
          
          acc[elm.name].timeoffs.push({
            ts_start: ts_start > ts_min ? ts_start : ts_min,
            ts_end: ts_end < ts_max ? ts_end : ts_max,
            type: elm.type,
            duration: Math.round((ts_end - ts_start)/86400000),
          });
          return acc;
        }, {});

        people = Object.values(byPeople)
          .filter(p => !!window.textUtils.findName(p.displayName))
          .filter(p => p.timeoffs.length > 0)
          .sort()

        self.clearScreen();

        drawBlocksTable();
        callback && callback();
      });
    };
  }

  window.Timeoffs = ENGINE;
})();


