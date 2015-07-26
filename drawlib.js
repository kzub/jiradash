(function(){
  /*
  * SVG drawing helpers
  */
  function SVG(container){
    var self = this;
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    svg.setAttribute('class', 'paper');
    container.appendChild(svg);

    this.text = function(x, y, text, url, title){
      var txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      txt.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space","preserve");
      txt.setAttribute('x', x);
      txt.setAttribute('y', y);
      txt.textContent = text;

      if(url){
        var link = makeLink(url, title || text);
        link.appendChild(txt);
        svg.appendChild(link);
      }else{
        svg.appendChild(txt);
      }

      txt.changeText = function(a){
        this.textContent = a;
      }

      return txt;
    };

    this.img = function(x, y, w, h, url){
      var svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
      svgimg.setAttributeNS(null,'height', w);
      svgimg.setAttributeNS(null,'width', h);
      svgimg.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href', url);
      svgimg.setAttributeNS(null,'x', x);
      svgimg.setAttributeNS(null,'y', y);
      svgimg.setAttributeNS(null, 'visibility', 'visible');
      svg.appendChild(svgimg);

      svgimg.changeImage = function(new_url){
        svgimg.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href', new_url);
      };
      return svgimg;
    };

    function makeLink(url, description){
      var element = document.createElementNS('http://www.w3.org/2000/svg','a');
      element.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href', url);
      element.setAttribute('target', '_blank');

      if(description){
        element.setAttributeNS('http://www.w3.org/1999/xlink','xlink:title', description);
      }

      return element;
    };

    this.setAttribute = function(attr, value){
      svg.setAttribute(attr, value);
    };

    this.setStyle = function(name, value){
      svg.style[name] = value;
    };
  };

  function LIB(){
    this.paper = function(c){
      return new SVG(c);
    };
  }

  window.DrawLib = LIB;

})();