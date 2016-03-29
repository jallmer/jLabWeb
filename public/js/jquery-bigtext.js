!function(t){"use strict";var e={rotateText:null,fontSizeFactor:.8,maximumFontSize:null,limitingDimension:"both",horizontalAlign:"center",verticalAlign:"center",textAlign:"center",whiteSpace:"nowrap"};t.fn.bigText=function(i){return this.each(function(){i=t.extend({},e,i);var o=t(this),r=o.parent();o.css("visibility","hidden"),o.css({display:"inline-block",clear:"both","float":"left","font-size":1e3*i.fontSizeFactor+"px","line-height":"1000px","white-space":i.whiteSpace,"text-align":i.textAlign,position:"relative",padding:0,margin:0,left:"50%",top:"50%"});var a={left:parseInt(r.css("padding-left")),top:parseInt(r.css("padding-top")),right:parseInt(r.css("padding-right")),bottom:parseInt(r.css("padding-bottom"))},n={width:o.outerWidth(),height:o.outerHeight()},h={};if(null!==i.rotateText){if("number"!=typeof i.rotateText)throw"bigText error: rotateText value must be a number";var s="rotate("+i.rotateText+"deg)";h={"-webkit-transform":s,"-ms-transform":s,"-moz-transform":s,"-o-transform":s,transform:s},o.css(h);var l=Math.abs(Math.sin(i.rotateText*Math.PI/180)),g=Math.abs(Math.cos(i.rotateText*Math.PI/180));n.width=o.outerWidth()*g+o.outerHeight()*l,n.height=o.outerWidth()*l+o.outerHeight()*g}var m,f=(r.innerWidth()-a.left-a.right)/n.width,c=(r.innerHeight()-a.top-a.bottom)/n.height;"width"===i.limitingDimension.toLowerCase()?(m=Math.floor(1e3*f),r.height(m)):"height"===i.limitingDimension.toLowerCase()?m=Math.floor(1e3*c):c>f?m=Math.floor(1e3*f):f>=c&&(m=Math.floor(1e3*c));var p=m*i.fontSizeFactor;null!==i.maximumFontSize&&p>i.maximumFontSize&&(p=i.maximumFontSize,m=p/i.fontSizeFactor),o.css({"font-size":Math.floor(p)+"px","line-height":Math.ceil(m)+"px","margin-bottom":"0px","margin-right":"0px"}),"height"===i.limitingDimension.toLowerCase()&&r.width(o.width()+4+"px");var d={};switch(i.verticalAlign.toLowerCase()){case"top":d.top="0%";break;case"bottom":d.top="100%",d["margin-top"]=Math.floor(-o.innerHeight())+"px";break;default:d["margin-top"]=Math.floor(-o.innerHeight()/2)+"px"}switch(i.horizontalAlign.toLowerCase()){case"left":d.left="0%";break;case"right":d.left="100%",d["margin-left"]=Math.floor(-o.innerWidth())+"px";break;default:d["margin-left"]=Math.floor(-o.innerWidth()/2)+"px"}o.css(d),o.css("visibility","visible")})}}(jQuery);