(function(){
  /*
  * Page layout definition
  */
  function Layout(columns){
    if(!columns){
      columns = 1;
    }

    var scheme = [];
    var x = 0;
    var line;
    var line_height = 20;
    var block_width = Math.floor(1920 / columns); // FullHD = 1920px
    var block_margin_x = 0;
    var block_margin_y = 10;

    for(var i = 0; i < columns; i++){
      scheme.push([]);
    }

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
      return block_width * x;
    };
  }

  window.TaskLayout = Layout;

})();