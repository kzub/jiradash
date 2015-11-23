(function(){
  /*
  * Page layout definition
  */
  function Layout(OPTIONS){
    var columns = 1;
    var ratio = window.devicePixelRatio || 1;
    var screen_width = window.innerWidth - 5;
    var screen_height = window.innerHeight;

    if(OPTIONS && OPTIONS.SCREEN_WIDTH){
      var lastchar = OPTIONS.SCREEN_WIDTH.length - 1;
      if(lastchar && OPTIONS.SCREEN_WIDTH[lastchar] === '%'){
        screen_width *= +OPTIONS.SCREEN_WIDTH.slice(0, lastchar)/100;
      }else{
        screen_width = OPTIONS.SCREEN_WIDTH;
      }
    }

    if(OPTIONS && OPTIONS.COLUMNS){
      columns = OPTIONS.COLUMNS || 1;
    }
    if(isLaptop() && OPTIONS && OPTIONS.LAPTOP_COLUMNS){
      columns = OPTIONS.LAPTOP_COLUMNS || 1;
    }
    if(isMobile()){
      columns = OPTIONS.MOBILE_COLUMNS || 1;
      screen_width *= ratio;
      screen_height *= ratio;
    }

    var scheme = [];
    var x = 0;
    var line;
    var line_height = 20;
    var block_width;
    var block_margin_x = 10;
    var block_margin_y = 10;

    for(var i = 0; i < columns; i++){
      scheme.push([]);
    }

    function isMobile(){
      return typeof window.orientation !== 'undefined';
    };
    this.isMobile = isMobile;

    function isLaptop(){
      return screen.width < 1920;
    }
    this.isLaptop = isLaptop;

    this.getBlockWidth = function(){
      return Math.floor(screen_width / columns) - 2*block_margin_x;
    };
    block_width = this.getBlockWidth();

    this.getBlockHeight = function(){
      var height = 0;
      for(var i in scheme[x]){
        height += scheme[x][i];
      }
      return height;
    };

    this.addBlockHeight = function(height){
      scheme[x].push(height + block_margin_y);
    };

    this.nextWindow = function(){
      if(x++ >= scheme.length - 1){
        x = 0;
      }
    };

    this.reset = function(){
      for(var i in scheme){
        if(scheme[i] instanceof Array){
          scheme[i] = [];
        }
      }
      x = 0;
    };

    this.getLine = function(init){
      if(init !== undefined){
        line = init;
      }
      return line_height * line++;
    };

    this.getLineHeight = function(){
      return line_height;
    };

    this.getBlockLeft = function(){
      return (block_width +block_margin_x) * x;
    };
  }

  window.TaskLayout = Layout;

})();