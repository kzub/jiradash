(function(){
  /*
  * Network async loader
  */
  function Network(){
    var each_async = function(ary, fn, fnend) {
      var i = 0;
      -function iter() {
        fn(ary[i], function(){
          if (++i < ary.length){
            setTimeout(iter, 0);
          }else{
            fnend();
          }
        });
      }();
    };

    this.load = function(context, urls, callback){
      var noContext;
      if(!callback){
        callback = urls;
        urls = context;
        context = undefined;
        noContext = true;
      }

      var results = [];
      var error;

      each_async(urls,
        function itrer(url, cb){
          d3.json(url, function(err, data){
            if(err){
              error = err;
              console.error('loadAdditionalResources', err);
            }
            else if(data){
              results.push(data);
            }
            setTimeout(cb);
          });
        },
        function finish(){
          if(noContext){
            callback(error, results);
            return;
          }

          // proxy pass context to determine what for urls are loaded
          callback(error, context, results);
        }
      );
    };
  }

  window.Network = Network;
})();
