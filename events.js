(function(){
  function EventEmmiter(){
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
  }

  window.EventEmmiter = EventEmmiter;
})();