(window["webpackJsonpsuduko.js"]=window["webpackJsonpsuduko.js"]||[]).push([[0],[,,,,,function(e,n,t){e.exports=t(12)},,,,,function(e,n,t){},function(e,n,t){},function(e,n,t){"use strict";t.r(n);var r=t(0),a=t.n(r),o=t(4),u=t.n(o),i=(t(10),t(1)),c=t(2);function f(e,n){return e[n.y].values[n.x].value}function l(e){for(var n=e*e,t=e*e,r=[],a=0;a<n;a++){for(var o=[],u=0;u<t;u++)o.push(p(a,u));r.push(o)}for(var i=0;i<t;i++){for(var c=[],f=0;f<n;f++)c.push(p(f,i));r.push(c)}for(var l=e,s=e,v=e,h=l,d=l,m=0;m<s;m++)for(var w=0;w<v;w++){for(var y=[],b=0;b<h;b++)for(var g=0;g<d;g++){var j=w*l+g,E=m*l+b;y.push(p(E,j))}r.push(y)}return r}function s(e,n,t){var r=b(e);return(Array.isArray(n)?n:[n]).forEach(function(e){var n=t(r[e.y].values[e.x]);"undefined"!==typeof n&&(r[e.y].values[e.x]=n)}),r}function v(e){if(0===e.length)return[];var n,t,r,a=[e[0]];for(n=1;n<e.length;n++){for(r=1,t=0;t<a.length;t++)if(m(e[n],a[t])){r=0;break}r&&a.push(e[n])}return a}function h(e,n,t){var r={id:e+":"+n,y:e,x:n,value:t,failing:!1,locked:!1,possible:{0:!0,1:!0,2:!0,3:!0,4:!0,5:!0,6:!0,7:!0,8:!0,9:!0}};return r.possible[t]=!1,r}function d(e,n,t){return s(e,n,function(e){return Object.keys(e.possible).forEach(function(n){e.possible[n]=t(Number(n),e.possible[n])}),e})}function p(e,n){return{y:e,x:n}}function m(e,n){return e.x===n.x&&e.y===n.y}function w(e){return e.x+":"+e.y}var y=function(e){return!e||!e.length};function b(e){return JSON.parse(JSON.stringify(e))}var g=function(){var e=Object(r.useMemo)(function(){return l(3)},[3]),n=Object(r.useMemo)(function(){return function(e){for(var n={},t=0;t<e.length;t++)for(var r=0;r<e[t].length;r++){var a=w(e[t][r]);void 0===n[a]&&(n[a]=[]),n[a]=v([].concat(Object(i.a)(n[a]),Object(i.a)(e[t])))}return n}(l(3))},[3]),t=function(){var e=Object(r.useState)(window.location.href),n=Object(c.a)(e,2),t=n[0],a=n[1],o=Object(r.useMemo)(function(){var e=new URLSearchParams(window.location.search),n={},t=!0,r=!1,a=void 0;try{for(var o,u=e.keys()[Symbol.iterator]();!(t=(o=u.next()).done);t=!0){var i=o.value;n[i]=e.get(i)}}catch(c){r=!0,a=c}finally{try{t||null==u.return||u.return()}finally{if(r)throw a}}return n},[window.location.search]);function u(e){window.history.pushState({},"",e),window.dispatchEvent(new Event("popstate"))}return Object(r.useEffect)(function(){window.addEventListener("popstate",function(){a(window.location.href)})},[]),{href:t,params:o,pushState:u,setQueryParam:function(e,n){var t=new URLSearchParams(window.location.search);t.set(e,n),u(window.location.href.split("?")[0]+"?"+t)},getQueryParam:function(e){return new URLSearchParams(window.location.search).get(e)}}}(),o=t.setQueryParam,u=t.getQueryParam,p=Object(r.useMemo)(function(){return function(e,n){var t=Object(i.a)(e);return Object.keys(n).map(function(e){return function(e){return{x:e.split(":")[0],y:e.split(":")[1]}}(e)}).forEach(function(r){var a=f(t,r);t=d(t,r,0===a?function(t,a){return y(function(e,n,t,r){return function(e,n){return Object(i.a)(e[w(n)])}(e,n).filter(function(e){return!m(n,e)&&t===f(r,e)})}(n,r,t,e))}:function(e,n){return 0===e})}),t}(function(e,n){var t=Object(i.a)(e);return n.forEach(function(n){var r={};n.forEach(function(n){var t=f(e,n);0!==t&&(r[t]?r[t].push(n):r[t]=[n])}),Object.keys(r).length>1&&Object.keys(r).forEach(function(e){r[e].length>1&&r[e].forEach(function(e){t=function(e,n){return s(e,n,function(e){e.failing=!0})}(t,e)})})}),t}(function(e,n){for(var t=e*e,r=e*e,a=[],o=0;o<t;o++){a[o]={id:o,values:[]};for(var u=0;u<r;u++)a[o].values[u]=h(o,u,n[o][u])}return a}(3,function(e,n){for(var t=n*n,r=n*n,a=(e?e.split(""):[]).concat(new Array(t*r)),o=[],u=0;u<t;u++){o[u]=[];for(var i=0;i<r;i++)o[u][i]=parseInt(a[u*t+i]||"0",10)}return o}(u("b"),3)),e),n)},[u,e,n]),g=Object(r.useMemo)(function(){return function(e){for(var n=e.length,t=e.length,r=t*n,a=0;a<n;a++)for(var o=0;o<t;o++)e[a].values[o].value>0&&(r-=1);return r}(p)},[p]),j=function(e){return function(n){var t=function(e){var n=e||window.event,t=n.keyCode||n.which,r=String.fromCharCode(t);return/[1-9]/.test(r)?r:(n.returnValue=!1,/[ -~]/.test(r)&&n.preventDefault&&n.preventDefault(),8===t||32===t?"*":void 0)}(n);if(t){var r="*"!==t?t:0,a=b(p);(function(e){for(var n=[],t=0;t<e.length;t++)for(var r=0;r<e[t].values.length;r++)n.push(e[t].values[r].value);o("b",n.join(""))})(a=function(e,n,t){return s(n,t,function(n){n.value=e})}(r,a,e))}}},E=p.map(function(e){var n=e.values.map(function(e){for(var n=function(e){var n="";return Object.keys(e).forEach(function(t){e[t]&&(n+=t,n+=" ")}),n}({verticalBorder:2===e.x||5===e.x,horizontalBorder:2===e.y||5===e.y,failed:e.failing}),t=[],r=0,o=Object.entries(e.possible);r<o.length;r++){var u=o[r],i=Object(c.a)(u,2),f=i[0],l=i[1];"0"!==f&&l&&t.push(f)}var s=t.join(", ");return a.a.createElement("td",{key:e.id,className:n},a.a.createElement("input",{title:s,disabled:e.locked,key:e.id,type:"text",onPaste:j(e),onKeyDown:j(e),defaultValue:0===e.value?"":e.value,size:1,maxLength:1}))});return a.a.createElement("tr",{key:e.id},n)});return a.a.createElement(a.a.Fragment,null,a.a.createElement("h1",null,"Welcome to Suduko"),a.a.createElement("p",null,"Numbers to play: ",g),a.a.createElement("table",{className:"App gameBoard"},a.a.createElement("tbody",null,E)))};t(11);var j=function(){return a.a.createElement("div",{className:"App"},a.a.createElement(g,null))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));u.a.render(a.a.createElement(j,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}],[[5,1,2]]]);
//# sourceMappingURL=main.a60807aa.chunk.js.map