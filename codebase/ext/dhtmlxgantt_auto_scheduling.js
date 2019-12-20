/*
@license

dhtmlxGantt v.6.3.3 Professional

This software is covered by DHTMLX Enterprise License. Usage without proper license is prohibited.

(c) XB Software Ltd.

*/
Gantt.plugin(function(t){!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("ext/dhtmlxgantt_auto_scheduling",[],e):"object"==typeof exports?exports["ext/dhtmlxgantt_auto_scheduling"]=e():t["ext/dhtmlxgantt_auto_scheduling"]=e()}(window,function(){return function(t){var e={};function n(a){if(e[a])return e[a].exports;var r=e[a]={i:a,l:!1,exports:{}};return t[a].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=t,n.c=e,n.d=function(t,e,a){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var a=Object.create(null);if(n.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)n.d(a,r,function(e){return t[e]}.bind(null,r));return a},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="/codebase/",n(n.s=269)}({10:function(t,e){t.exports=function(t){return{getVirtualRoot:function(){return t.mixin(t.getSubtaskDates(),{id:t.config.root_id,type:t.config.types.project,$source:[],$target:[],$virtual:!0})},getLinkedTasks:function(e,n){var a=[e],r=!1;t._isLinksCacheEnabled()||(t._startLinksCache(),r=!0);for(var i=[],s={},o={},u=0;u<a.length;u++)this._getLinkedTasks(a[u],s,n,o);for(var u in o)i.push(o[u]);return r&&t._endLinksCache(),i},_collectRelations:function(e,n,a,r){var i,s=t._getSuccessors(e,n),o=[];a&&(o=t._getPredecessors(e,n));for(var u=[],c=0;c<s.length;c++)r[i=s[c].hashSum]||(r[i]=!0,u.push(s[c]));for(c=0;c<o.length;c++)r[i=o[c].hashSum]||(r[i]=!0,u.push(o[c]));return u},_getLinkedTasks:function(e,n,a,r){for(var i,s=void 0===e?t.config.root_id:e,o=(n={},{}),u=[{from:s,includePredecessors:a,isChild:!1}];u.length;){var c=u.pop(),l=c.isChild;if(!n[s=c.from]){i=t.isTaskExists(s)?t.getTask(s):this.getVirtualRoot(),n[s]=!0;for(var d=this._collectRelations(i,l,a,o),g=0;g<d.length;g++){var f=d[g];r[f.hashSum]=f;var h=f.sourceParent==f.targetParent;n[f.target]||u.push({from:f.target,includePredecessors:!0,isChild:h})}if(t.hasChild(i.id)){var _=t.getChildren(i.id);for(g=0;g<_.length;g++)n[_[g]]||u.push({from:_[g],includePredecessors:!0,isChild:!0})}}}return r}}}},2:function(t,e){var n={second:1,minute:60,hour:3600,day:86400,week:604800,month:2592e3,quarter:7776e3,year:31536e3};function a(t,e){var n=[];if(t.filter)return t.filter(e);for(var a=0;a<t.length;a++)e(t[a],a)&&(n[n.length]=t[a]);return n}t.exports={getSecondsInUnit:function(t){return n[t]||n.hour},forEach:function(t,e){if(t.forEach)t.forEach(e);else for(var n=t.slice(),a=0;a<n.length;a++)e(n[a],a)},arrayMap:function(t,e){if(t.map)return t.map(e);for(var n=t.slice(),a=[],r=0;r<n.length;r++)a.push(e(n[r],r));return a},arrayFind:function(t,e){if(t.find)return t.find(e);for(var n=0;n<t.length;n++)if(e(t[n],n))return t[n]},arrayFilter:a,arrayDifference:function(t,e){return a(t,function(t,n){return!e(t,n)})},arraySome:function(t,e){if(0===t.length)return!1;for(var n=0;n<t.length;n++)if(e(t[n],n,t))return!0;return!1},hashToArray:function(t){var e=[];for(var n in t)t.hasOwnProperty(n)&&e.push(t[n]);return e},sortArrayOfHash:function(t,e,n){var a=function(t,e){return t<e};t.sort(function(t,r){return t[e]===r[e]?0:n?a(t[e],r[e]):a(r[e],t[e])})},throttle:function(t,e){var n=!1;return function(){n||(t.apply(null,arguments),n=!0,setTimeout(function(){n=!1},e))}},isArray:function(t){return Array.isArray?Array.isArray(t):t&&void 0!==t.length&&t.pop&&t.push},isDate:function(t){return!(!t||"object"!=typeof t||!(t.getFullYear&&t.getMonth&&t.getDate))},isStringObject:function(t){return t&&"object"==typeof t&&"function String() { [native code] }"===Function.prototype.toString.call(t.constructor)},isNumberObject:function(t){return t&&"object"==typeof t&&"function Number() { [native code] }"===Function.prototype.toString.call(t.constructor)},isBooleanObject:function(t){return t&&"object"==typeof t&&"function Boolean() { [native code] }"===Function.prototype.toString.call(t.constructor)},delay:function(t,e){var n,a=function(){a.$cancelTimeout(),t.$pending=!0;var r=Array.prototype.slice.call(arguments);n=setTimeout(function(){t.apply(this,r),a.$pending=!1},e)};return a.$pending=!1,a.$cancelTimeout=function(){clearTimeout(n),t.$pending=!1},a.$execute=function(){t(),t.$cancelTimeout()},a},objectKeys:function(t){if(Object.keys)return Object.keys(t);var e,n=[];for(e in t)Object.prototype.hasOwnProperty.call(t,e)&&n.push(e);return n},requestAnimationFrame:function(t){var e=window;return(e.requestAnimationFrame||e.webkitRequestAnimationFrame||e.msRequestAnimationFrame||e.mozRequestAnimationFrame||e.oRequestAnimationFrame||function(t){setTimeout(t,1e3/60)})(t)},isEventable:function(t){return t.attachEvent&&t.detachEvent}}},23:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),function(t){t.ASAP="asap",t.ALAP="alap",t.SNET="snet",t.SNLT="snlt",t.FNET="fnet",t.FNLT="fnlt",t.MSO="mso",t.MFO="mfo"}(e.ConstraintTypes||(e.ConstraintTypes={}))},24:function(t,e,n){var a=n(2);t.exports=function(){return{getVertices:function(t){for(var e,n={},a=0,r=t.length;a<r;a++)n[(e=t[a]).target]=e.target,n[e.source]=e.source;var i,s=[];for(var a in n)i=n[a],s.push(i);return s},topologicalSort:function(t){for(var e=this.getVertices(t),n={},a=0,r=e.length;a<r;a++)n[e[a]]={id:e[a],$source:[],$target:[],$incoming:0};for(a=0,r=t.length;a<r;a++){var i=n[t[a].target];i.$target.push(a),i.$incoming=i.$target.length,n[t[a].source].$source.push(a)}for(var s=e.filter(function(t){return!n[t].$incoming}),o=[];s.length;){var u=s.pop();o.push(u);var c=n[u];for(a=0;a<c.$source.length;a++){var l=n[t[c.$source[a]].target];l.$incoming--,l.$incoming||s.push(l.id)}}return o},groupAdjacentEdges:function(t){for(var e,n={},a=0,r=t.length;a<r;a++)n[(e=t[a]).source]||(n[e.source]=[]),n[e.source].push(e);return n},tarjanStronglyConnectedComponents:function(t,e){for(var n={},a=[],r=this.groupAdjacentEdges(e),i=!1,s=[],o=0;o<t.length;o++){var u=_(t[o]);if(!u.visited)for(var c=[u],l=0;c.length;){var d=c.pop();d.visited||(d.index=l,d.lowLink=l,l++,a.push(d),d.onStack=!0,d.visited=!0),i=!1;e=r[d.id]||[];for(var g=0;g<e.length;g++){var f=_(e[g].target);if(f.edge=e[g],void 0===f.index){c.push(d),c.push(f),i=!0;break}f.onStack&&(d.lowLink=Math.min(d.lowLink,f.index))}if(!i){if(d.index==d.lowLink){for(var h={tasks:[],links:[]};(f=a.pop()).onStack=!1,h.tasks.push(f.id),f.edge&&h.links.push(f.edge.id),f!=d;);s.push(h)}c.length&&(f=d,(d=c[c.length-1]).lowLink=Math.min(d.lowLink,f.lowLink))}}}return s;function _(t){return n[t]||(n[t]={id:t,onStack:!1,index:void 0,lowLink:void 0,edge:void 0}),n[t]}},findLoops:function(t){var e=[];a.forEach(t,function(t){t.target==t.source&&e.push([t.target,t.source])});var n=this.getVertices(t),r=this.tarjanStronglyConnectedComponents(n,t);return a.forEach(r,function(t){t.tasks.length>1&&e.push(t)}),e}}}},25:function(t,e){t.exports=function(t){t._get_linked_task=function(e,n){var a=null,r=n?e.target:e.source;return t.isTaskExists(r)&&(a=t.getTask(r)),a},t._get_link_target=function(e){return t._get_linked_task(e,!0)},t._get_link_source=function(e){return t._get_linked_task(e,!1)};var e=!1,n={},a={},r={},i={};t._isLinksCacheEnabled=function(){return e},t._startLinksCache=function(){n={},a={},r={},i={},e=!0},t._endLinksCache=function(){n={},a={},r={},i={},e=!1},t._formatLink=function(a){if(e&&n[a.id])return n[a.id];var r=[],i=this._get_link_target(a),s=this._get_link_source(a);if(!s||!i)return r;if(t.isSummaryTask(i)&&t.isChildOf(s.id,i.id)||t.isSummaryTask(s)&&t.isChildOf(i.id,s.id))return r;for(var o=this._getImplicitLinks(a,s,function(t){return 0},!0),u=t.config.auto_scheduling_move_projects,c=this.isSummaryTask(i)?this.getSubtaskDates(i.id):{start_date:i.start_date,end_date:i.end_date},l=this._getImplicitLinks(a,i,function(e){return u?e.$target.length||t.getState().drag_id==e.id?0:t.calculateDuration({start_date:c.start_date,end_date:e.start_date,task:s}):0}),d=0,g=o.length;d<g;d++)for(var f=o[d],h=0,_=l.length;h<_;h++){var p=l[h],k=1*f.lag+1*p.lag,v={id:a.id,type:a.type,source:f.task,target:p.task,lag:(1*a.lag||0)+k};r.push(t._convertToFinishToStartLink(p.task,v,s,i,f.taskParent,p.taskParent))}return e&&(n[a.id]=r),r},t._isAutoSchedulable=function(t){return!1!==t.auto_scheduling},t._getImplicitLinks=function(e,n,a,r){var i=[];if(this.isSummaryTask(n)){var s,o={};for(var u in this.eachTask(function(t){this.isSummaryTask(t)||(o[t.id]=t)},n.id),o){var c=o[u],l=r?c.$source:c.$target;s=!1;for(var d=0;d<l.length;d++){var g=t.getLink(l[d]),f=r?g.target:g.source,h=o[f];if(h&&!1!==c.auto_scheduling&&!1!==h.auto_scheduling&&(g.target==h.id&&Math.abs(g.lag)<=h.duration||g.target==c.id&&Math.abs(g.lag)<=c.duration)){s=!0;break}}s||i.push({task:c.id,taskParent:c.parent,lag:a(c)})}}else i.push({task:n.id,taskParent:n.parent,lag:0});return i},t._getDirectDependencies=function(t,e){for(var n=[],a=[],r=e?t.$source:t.$target,i=0;i<r.length;i++){var s=this.getLink(r[i]);if(this.isTaskExists(s.source)&&this.isTaskExists(s.target)){var o=this.getTask(s.target);this._isAutoSchedulable(o)&&n.push(this.getLink(r[i]))}}for(i=0;i<n.length;i++)a=a.concat(this._formatLink(n[i]));return a},t._getInheritedDependencies=function(t,n){var i,s=!1,o=[];return this.isTaskExists(t.id)&&this.eachParent(function(t){var u;s||(e&&(i=n?a:r)[t.id]?o=o.concat(i[t.id]):this.isSummaryTask(t)&&(this._isAutoSchedulable(t)?(u=this._getDirectDependencies(t,n),e&&(i[t.id]=u),o=o.concat(u)):s=!0))},t.id,this),o},t._getDirectSuccessors=function(t){return this._getDirectDependencies(t,!0)},t._getInheritedSuccessors=function(t){return this._getInheritedDependencies(t,!0)},t._getDirectPredecessors=function(t){return this._getDirectDependencies(t,!1)},t._getInheritedPredecessors=function(t){return this._getInheritedDependencies(t,!1)},t._getSuccessors=function(t,e){var n=this._getDirectSuccessors(t);return e?n:n.concat(this._getInheritedSuccessors(t))},t._getPredecessors=function(t,n){var a,r=String(t.id)+"-"+String(n);if(e&&i[r])return i[r];var s=this._getDirectPredecessors(t);return a=n?s:s.concat(this._getInheritedPredecessors(t)),e&&(i[r]=a),a},t._convertToFinishToStartLink=function(e,n,a,r,i,s){var o={target:e,link:t.config.links.finish_to_start,id:n.id,lag:n.lag||0,source:n.source,preferredStart:null,sourceParent:i,targetParent:s,hashSum:null},u=0;switch(n.type){case t.config.links.start_to_start:u=-a.duration;break;case t.config.links.finish_to_finish:u=-r.duration;break;case t.config.links.start_to_finish:u=-a.duration-r.duration;break;default:u=0}return o.lag+=u,o.hashSum=o.lag+"_"+o.link+"_"+o.source+"_"+o.target,o}}},262:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.attachUIHandlers=function(t,e,n,a){var r=function(){var r,i,s=!1;function o(e,n){t.config.auto_scheduling&&!t._autoscheduling_in_progress&&(t.getState().batch_update?s=!0:t.autoSchedule(n.source))}function u(e,a){return!t.isCircularLink(a)||(t.callEvent("onCircularLinkError",[a,n.getLoopContainingLink(a)]),!1)}function c(e,n){var a=t.getTask(n.source),r=t.getTask(n.target);return!(!t.config.auto_scheduling_descendant_links&&(t.isChildOf(a.id,r.id)&&t.isSummaryTask(r)||t.isChildOf(r.id,a.id)&&t.isSummaryTask(a)))}function l(e,n,a,r){return!!e!=!!n||!(!e&&!n)&&(e.valueOf()>n.valueOf()?t._hasDuration({start_date:n,end_date:e,task:r}):t._hasDuration({start_date:e,end_date:n,task:a}))}function d(e,n){return!!l(e.start_date,n.start_date,e,n)||t.getConstraintType(e)!==t.getConstraintType(n)||!!l(e.constraint_date,n.constraint_date,e,n)||!(!l(e.start_date,n.start_date,e,n)&&(!l(e.end_date,n.end_date,e,n)&&e.duration===n.duration||e.type===t.config.types.milestone))||void 0}function g(n){return t.config.auto_scheduling_compatibility?e.getLinkedTasks(n,!0):a.getConnectedGroupRelations(n)}function f(e){t.config.schedule_from_end?(e.constraint_type=t.config.constraint_types.FNLT,e.constraint_date=new Date(e.end_date)):(e.constraint_type=t.config.constraint_types.SNET,e.constraint_date=new Date(e.start_date))}function h(e){t.config.auto_scheduling_compatibility&&t.config.auto_scheduling_strict&&(e.constraint_type!==t.config.constraint_types.SNET&&e.constraint_type!==t.config.constraint_types.FNLT||(e.constraint_type=null,e.constraint_date=null))}t.attachEvent("onAfterBatchUpdate",function(){s&&t.autoSchedule(),s=!1}),t.attachEvent("onAfterLinkUpdate",o),t.attachEvent("onAfterLinkAdd",o),t.attachEvent("onAfterLinkDelete",function(e,n){if(t.config.auto_scheduling&&!t._autoscheduling_in_progress&&t.isTaskExists(n.target)){var a=t.getTask(n.target),r=t._getPredecessors(a);r.length&&(t.getState().batch_update?s=!0:t.autoSchedule(r[0].source,!1))}}),t.attachEvent("onParse",function(){t.config.auto_scheduling&&t.config.auto_scheduling_initial&&t.autoSchedule()}),t.attachEvent("onBeforeLinkAdd",u),t.attachEvent("onBeforeLinkAdd",c),t.attachEvent("onBeforeLinkUpdate",u),t.attachEvent("onBeforeLinkUpdate",c),t.attachEvent("onBeforeTaskDrag",function(e,n,a){return t.config.auto_scheduling&&t.config.auto_scheduling_move_projects&&(r=g(e),i=e),!0});var _,p=function(e,n){if(t.config.auto_scheduling&&!t._autoscheduling_in_progress){var a=t.getTask(e);d(n,a)&&(f(a),t.config.auto_scheduling_move_projects&&i==e?(t.calculateDuration(n)!==t.calculateDuration(a)&&function(e,n){for(var a=!1,i=0;i<r.length;i++){var s=t.getLink(n[i].id);!s||s.type!==t.config.links.start_to_start&&s.type!==t.config.links.start_to_finish||(n.splice(i,1),i--,a=!0)}if(a){var o={};for(i=0;i<n.length;i++)o[n[i].id]=!0;var u=g(e);for(i=0;i<u.length;i++)o[u[i].id]||n.push(u[i])}}(e,r),t._autoSchedule(e,r)):t.autoSchedule(a.id),h(a))}return r=null,i=null,!0},k=null;if(t.ext&&t.ext.inlineEditors){var v={start_date:!0,end_date:!0,duration:!0,constraint_type:!0,constraint_date:!0};t.ext.inlineEditors.attachEvent("onBeforeSave",function(t){return v[t.columnName]&&(k=t.id),!0})}t.attachEvent("onBeforeTaskChanged",function(t,e,n){return p(t,n)}),t.ext.inlineEditors&&t.ext.inlineEditors.attachEvent("onBeforeSave",function(e){if(t.config.auto_scheduling&&!t._autoscheduling_in_progress){var n=t.ext.inlineEditors.getEditorConfig(e.columnName);"start_date"!==n.map_to&&"end_date"!==n.map_to&&"duration"!==n.map_to||(k=e.id)}return!0}),t.attachEvent("onLightboxSave",function(e,n){if(t.config.auto_scheduling&&!t._autoscheduling_in_progress){_=!1;var a=t.getTask(e);d(n,a)&&(k=e,t.getConstraintType(n)===t.getConstraintType(a)&&+n.constraint_date==+a.constraint_date||(_=!0))}return!0}),t.attachEvent("onAfterTaskUpdate",function(e,n){return t.config.auto_scheduling&&!t._autoscheduling_in_progress&&k&&k==e&&(k=null,_||f(n),t.autoSchedule(n.id),_||h(n)),!0})};t.attachEvent("onGanttReady",function(){r(),r=function(){}})}},263:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var a=function(){return function(t,e,n){var a=this;this.isCircularLink=function(t){return!!a.getLoopContainingLink(t)},this.getLoopContainingLink=function(t){var e=a._graphHelper,n=a._linksBuilder,r=a._gantt,i=n.getLinkedTasks();r.isLinkExists(t.id)||(i=i.concat(r._formatLink(t)));for(var s=e.findLoops(i),o=0;o<s.length;o++)for(var u=s[o].links,c=0;c<u.length;c++)if(u[c]==t.id)return s[o];return null},this.findCycles=function(){var t=a._graphHelper,e=a._linksBuilder.getLinkedTasks();return t.findLoops(e)},this._linksBuilder=n,this._graphHelper=e,this._gantt=t}}();e.LoopsFinder=a},264:function(t,e,n){"use strict";function a(t,e,n){for(var a,r=[t],i=[],s={},o={};r.length>0;)if(!n[a=r.shift()]){n[a]=!0,i.push(a);for(var u=0;u<e.length;u++){var c=e[u];c.source==a||c.sourceParent==a?(n[c.target]||(r.push(c.target),o[c.id]=!0,e.splice(u,1),u--),s[c.hashSum]=c):c.target!=a&&c.targetParent!=a||(n[c.source]||(r.push(c.source),o[c.id]=!0,e.splice(u,1),u--),s[c.hashSum]=c)}}var l=[],d=[];for(var u in o)l.push(u);for(var u in s)d.push(s[u]);return{tasks:i,links:l,processedLinks:d}}Object.defineProperty(e,"__esModule",{value:!0});var r=function(){return function(t,e){var n=this;this.getConnectedGroupRelations=function(t){return a(t,n._linksBuilder.getLinkedTasks(),{}).processedLinks},this.getConnectedGroup=function(t){var e=n._linksBuilder.getLinkedTasks();if(void 0!==t){if(n._gantt.getTask(t).type===n._gantt.config.types.project)return{tasks:[],links:[]};var r=a(t,e,{});return{tasks:r.tasks,links:r.links}}return function(t){for(var e,n,r,i={},s=[],o=0;o<t.length;o++)if(e=t[o].source,n=t[o].target,r=null,i[e]?i[n]||(r=n):r=e,r){var u=t.length;s.push(a(r,t,i)),u!==t.length&&(o=-1)}return s}(e).map(function(t){return{tasks:t.tasks,links:t.links}})},this._linksBuilder=e,this._gantt=t}}();e.ConnectedGroupsHelper=r},265:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var a=n(9),r=function(){function t(){}return t.Create=function(e){var n=new t;return n._gantt=e,n},t.prototype.resolveRelationDate=function(t,e,n){for(var r=null,i=null,s=null,o=this._gantt.getTask(t),u=e.predecessors,c=null,l=0;l<u.length;l++){var d=u[l];s=d.preferredStart;var g=this.getEarliestStartDate(d,n,o);this.isSmallerOrDefault(c,g,o)&&(c=g),this.isSmallerOrDefault(s,g,o)&&this.isSmallerOrDefault(r,g,o)&&(r=g,i=d.id)}!u.length&&this._gantt.config.project_start&&this.isSmallerOrDefault(o.start_date,this._gantt.config.project_start,o)&&(r=this._gantt.config.project_start);var f=null;r&&(r=this._gantt.getClosestWorkTime({date:r,dir:"future",task:o}),f=this._gantt.calculateEndDate({start_date:r,duration:o.duration,task:o}));var h=n[t],_=a.TaskPlan.Create(h);return _.link=i,_.task=t,_.start_date=r,_.end_date=f,_.kind="asap",c&&(_.earliestSchedulingStart=c,_.earliestSchedulingEnd=this._gantt.calculateEndDate({start_date:c,duration:o.duration,task:o})),_},t.prototype.isEqual=function(t,e,n){return!this._gantt._hasDuration(t,e,n)},t.prototype.isFirstSmaller=function(t,e,n){return t.valueOf()<e.valueOf()&&!this.isEqual(t,e,n)},t.prototype.isSmallerOrDefault=function(t,e,n){return!(t&&!this.isFirstSmaller(t,e,n))},t.prototype.getPredecessorEndDate=function(t,e){var n=e[t],a=this._gantt.getTask(t);return n&&(n.start_date||n.end_date)?n.end_date?n.end_date:this._gantt.calculateEndDate({start_date:n.start_date,duration:a.duration,task:a}):a.end_date},t.prototype.getEarliestStartDate=function(t,e,n){var a=this.getPredecessorEndDate(t.source,e),r=n,i=this._gantt.getClosestWorkTime({date:a,dir:"future",task:r});return a&&t.lag&&1*t.lag==1*t.lag&&(i=this._gantt.calculateEndDate({start_date:a,duration:1*t.lag,task:r})),i},t}();e.AsapStrategy=r},266:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var a=n(9),r=function(){function t(){}return t.Create=function(e){var n=new t;return n._gantt=e,n},t.prototype.resolveRelationDate=function(t,e,n){for(var r=null,i=null,s=null,o=null,u=this._gantt.getTask(t),c=e.successors,l=null,d=n[t],g=0;g<c.length;g++){var f=c[g];o=f.preferredStart;var h=this.getLatestEndDate(f,n,u),_=this._gantt.calculateEndDate({start_date:h,duration:-u.duration,task:u});this.isGreaterOrDefault(l,h,u)&&(l=h),this.isGreaterOrDefault(o,_,u)&&this.isGreaterOrDefault(r,h,u)&&(r=h,s=_,i=f.id)}!c.length&&this._gantt.config.project_end&&this.isGreaterOrDefault(this._gantt.config.project_end,u.end_date,u)&&(r=this._gantt.config.project_end),r&&(r=this._gantt.getClosestWorkTime({date:r,dir:"future",task:u}),s=this._gantt.calculateEndDate({start_date:r,duration:-u.duration,task:u}));var p=a.TaskPlan.Create(d);return p.link=i,p.task=t,p.end_date=r,p.start_date=s,p.kind="alap",l&&(p.latestSchedulingStart=this._gantt.calculateEndDate({start_date:l,duration:-u.duration,task:u}),p.latestSchedulingEnd=l),p},t.prototype.isFirstSmaller=function(t,e,n){return!!(t.valueOf()<e.valueOf()&&this._gantt._hasDuration(t,e,n))},t.prototype.isGreaterOrDefault=function(t,e,n){return!(t&&!this.isFirstSmaller(e,t,n))},t.prototype.getSuccessorStartDate=function(t,e){var n=e[t],a=this._gantt.getTask(t);return n&&(n.start_date||n.end_date)?n.start_date?n.start_date:this._gantt.calculateEndDate({start_date:n.end_date,duration:-a.duration,task:a}):a.start_date},t.prototype.getLatestEndDate=function(t,e,n){var a=this.getSuccessorStartDate(t.target,e),r=n,i=this._gantt.getClosestWorkTime({date:a,dir:"past",task:r});return i&&t.lag&&1*t.lag==1*t.lag&&(i=this._gantt.calculateEndDate({start_date:i,duration:1*-t.lag,task:r})),i},t}();e.AlapStrategy=r},267:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var a=n(266),r=n(265),i=n(23),s=n(9),o=function(){function t(t,e,n){this._gantt=t,this._constraintsHelper=n,this._graphHelper=e,this._asapStrategy=r.AsapStrategy.Create(t),this._alapStrategy=a.AlapStrategy.Create(t)}return t.prototype.generatePlan=function(t,e){var n=this._graphHelper,a=this._gantt,r=this._constraintsHelper,i=this._alapStrategy,s=this._asapStrategy,o=this.buildWorkCollections(t,e,n),u=o.orderedIds,c=o.reversedIds,l=o.relationsMap,d=o.plansHash;return this.processConstraints(u,d,a,r),a.config.schedule_from_end?this.iterateTasks(c,u,r.isAlapTask,i,s,l,d):this.iterateTasks(u,c,r.isAsapTask,s,i,l,d)},t.prototype.applyProjectPlan=function(t){for(var e,n,a,r,i=this._gantt,s=[],o=0;o<t.length;o++)if(a=null,r=null,(e=t[o]).task){n=i.getTask(e.task),e.link&&(a=i.getLink(e.link),r="asap"===e.kind?this._gantt.getTask(a.source):this._gantt.getTask(a.target));var u=null;e.start_date&&n.start_date.valueOf()!==e.start_date.valueOf()&&(u=e.start_date),u&&(n.start_date=u,n.end_date=i.calculateEndDate(n),s.push(n.id),i.callEvent("onAfterTaskAutoSchedule",[n,u,a,r]))}return s},t.prototype.iterateTasks=function(t,e,n,a,r,i,s){for(var o=this._gantt,u=[],c=0;c<t.length;c++){var l=t[c],d=o.getTask(l),g=a.resolveRelationDate(l,i[l],s);this.limitPlanDates(d,g),n(d)?this.processResolvedDate(d,g,u,s):s[d.id]=g}for(c=0;c<e.length;c++){l=e[c];if(!n(d=o.getTask(l))){g=r.resolveRelationDate(l,i[l],s);this.limitPlanDates(d,g),this.processResolvedDate(d,g,u,s)}}return u},t.prototype.processResolvedDate=function(t,e,n,a){if(e.start_date&&this._gantt.isLinkExists(e.link)){var r=null,i=null;if(e.link&&(r=this._gantt.getLink(e.link),i="asap"===e.kind?this._gantt.getTask(r.source):this._gantt.getTask(r.target)),t.start_date.valueOf()!==e.start_date.valueOf()&&!1===this._gantt.callEvent("onBeforeTaskAutoSchedule",[t,e.start_date,r,i]))return}a[t.id]=e,e.start_date&&n.push(e)},t.prototype.limitPlanDates=function(t,e){var n=e.start_date||t.start_date;return e.earliestStart&&n<e.earliestStart&&(e.start_date=e.earliestStart,e.end_date=e.earliestEnd),e.latestStart&&n>e.latestStart&&(e.start_date=e.latestStart,e.end_date=e.latestEnd),e.latestSchedulingStart&&n>e.latestSchedulingStart&&(e.start_date=e.latestSchedulingStart,e.end_date=e.latestSchedulingEnd),e.earliestSchedulingStart&&n<e.earliestSchedulingStart&&(e.start_date=e.earliestSchedulingStart,e.end_date=e.earliestSchedulingEnd),e.start_date&&(e.start_date>e.latestSchedulingStart||e.start_date<e.earliestSchedulingStart||e.start_date>e.latestStart||e.start_date<e.earliestStart||e.end_date>e.latestSchedulingEnd||e.end_date<e.earliestSchedulingEnd||e.end_date>e.latestEnd||e.end_date<e.earliestEnd)&&(e.conflict=!0),e},t.prototype.buildWorkCollections=function(t,e,n){for(var a=this._gantt,r=n.topologicalSort(t),i=r.slice().reverse(),s={},o={},u=0,c=r.length;u<c;u++){var l=r[u];!1!==(d=a.getTask(l)).auto_scheduling&&(o[l]={successors:[],predecessors:[]},s[l]=null)}for(u=0,c=e.length;u<c;u++){var d;void 0===s[(d=e[u]).id]&&(i.unshift(d.id),r.unshift(d.id),s[d.id]=null,o[d.id]={successors:[],predecessors:[]})}for(u=0,c=t.length;u<c;u++){var g=t[u];o[g.source]&&o[g.source].successors.push(g),o[g.target]&&o[g.target].predecessors.push(g)}return{orderedIds:r,reversedIds:i,relationsMap:o,plansHash:s}},t.prototype.processConstraints=function(t,e,n,a){for(var r=0;r<t.length;r++){var o=t[r],u=n.getTask(o),c=a.getConstraintType(u);if(c&&c!==i.ConstraintTypes.ASAP&&c!==i.ConstraintTypes.ALAP){var l=a.processConstraint(u,s.TaskPlan.Create());e[u.id]=l}}},t}();e.AutoSchedulingPlanner=o},268:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var a=n(23),r=n(9),i=function(){function t(t){var e=this;this.isAsapTask=function(t){var n=e.getConstraintType(t);return e._gantt.config.schedule_from_end?n===a.ConstraintTypes.ASAP:n!==a.ConstraintTypes.ALAP},this.isAlapTask=function(t){return!e.isAsapTask(t)},this.getConstraintType=function(t){return t.constraint_type?t.constraint_type:e._gantt.config.schedule_from_end?a.ConstraintTypes.ALAP:a.ConstraintTypes.ASAP},this.hasConstraint=function(t){return!!e.getConstraintType(t)},this.processConstraint=function(t,n){if(e.hasConstraint(t)&&t.constraint_type!==a.ConstraintTypes.ALAP&&t.constraint_type!==a.ConstraintTypes.ASAP){var i=t.constraint_date,s=r.TaskPlan.Create(n);switch(s.task=t.id,t.constraint_type){case a.ConstraintTypes.SNET:s.earliestStart=new Date(i),s.earliestEnd=e._gantt.calculateEndDate({start_date:s.earliestStart,duration:t.duration,task:t}),s.link=null;break;case a.ConstraintTypes.SNLT:s.latestStart=new Date(i),s.latestEnd=e._gantt.calculateEndDate({start_date:s.latestStart,duration:t.duration,task:t}),s.link=null;break;case a.ConstraintTypes.FNET:s.earliestStart=e._gantt.calculateEndDate({start_date:i,duration:-t.duration,task:t}),s.earliestEnd=new Date(i),s.link=null;break;case a.ConstraintTypes.FNLT:s.latestStart=e._gantt.calculateEndDate({start_date:i,duration:-t.duration,task:t}),s.latestEnd=new Date(i),s.link=null;break;case a.ConstraintTypes.MSO:s.earliestStart=new Date(i),s.earliestEnd=e._gantt.calculateEndDate({start_date:s.earliestStart,duration:t.duration,task:t}),s.latestStart=s.earliestStart,s.latestEnd=s.earliestEnd,s.link=null;break;case a.ConstraintTypes.MFO:s.earliestStart=e._gantt.calculateEndDate({start_date:i,duration:-t.duration,task:t}),s.earliestEnd=e._gantt.calculateEndDate({start_date:s.earliestStart,duration:t.duration,task:t}),s.latestStart=s.earliestStart,s.latestEnd=s.earliestEnd,s.link=null}return s}return n},this.getConstraints=function(t,n){var a,r=[],i={},s=function(t){i[t.id]||e.hasConstraint(t)&&!e._gantt.isSummaryTask(t)&&(i[t.id]=t)};if(e._gantt.isTaskExists(t)){var o=e._gantt.getTask(t);s(o)}if(e._gantt.eachTask(function(t){return s(t)},t),n)for(var u=0;u<n.length;u++){var c=n[u];i[c.target]||(a=e._gantt.getTask(c.target),s(a)),i[c.source]||(a=e._gantt.getTask(c.source),s(a))}for(var l in i)r.push(i[l]);return r},this._gantt=t}return t.Create=function(e){return new t(e)},t}();e.ConstraintsHelper=i},269:function(e,n,a){a(25)(t);var r=a(10)(t),i=a(24)(t),s=a(23).ConstraintTypes,o=a(268).ConstraintsHelper.Create(t),u=new(0,a(267).AutoSchedulingPlanner)(t,i,o),c=new(0,a(264).ConnectedGroupsHelper)(t,r),l=new(0,a(263).LoopsFinder)(t,i,r);t.getConnectedGroup=c.getConnectedGroup,t.getConstraintType=o.getConstraintType,t.getConstraintLimitations=function(t){var e=o.processConstraint(t,null);return{earliestStart:e.earliestStart||null,earliestEnd:e.earliestEnd||null,latestStart:e.latestStart||null,latestEnd:e.latestEnd||null}},t.isCircularLink=l.isCircularLink,t.findCycles=l.findCycles,t.config.constraint_types=s,t.config.auto_scheduling=!1,t.config.auto_scheduling_descendant_links=!1,t.config.auto_scheduling_initial=!0,t.config.auto_scheduling_strict=!1,t.config.auto_scheduling_move_projects=!0,t.config.project_start=null,t.config.project_end=null,t.config.schedule_from_end=!1,t._autoSchedule=function(e,n){if(!1!==t.callEvent("onBeforeAutoSchedule",[e])){t._autoscheduling_in_progress=!0;var a=o.getConstraints(e,t.isTaskExists(e)?n:null),r=[],s=i.findLoops(n);if(s.length)t.callEvent("onAutoScheduleCircularLink",[s]);else{!function(e,n){if(t.config.auto_scheduling_compatibility)for(var a=0;a<n.length;a++){var r=n[a],i=t.getTask(r.target);t.config.auto_scheduling_strict&&r.target!=e||(r.preferredStart=new Date(i.start_date))}}(e,n);var c=u.generatePlan(n,a);(function(e){var n=!1;function a(){for(var n=0;n<e.length;n++)t.updateTask(e[n])}1==e.length?t.eachParent(function e(a){if(!n){var r=a.start_date.valueOf(),i=a.end_date.valueOf();if(t.resetProjectDates(a),a.start_date.valueOf()==r&&a.end_date.valueOf()==i)for(var s=t.getChildren(a.id),o=0;!n&&o<s.length;o++)e(t.getTask(s[o]));else n=!0}},e[0]):e.length&&(n=!0),n?t.batchUpdate(a):a()})(r=u.applyProjectPlan(c))}t._autoscheduling_in_progress=!1,t.callEvent("onAfterAutoSchedule",[e,r])}},t.autoSchedule=function(e,n){var a;n=void 0===n||!!n,void 0!==e?t.config.auto_scheduling_compatible?r.getLinkedTasks(e,n):a=c.getConnectedGroupRelations(e):a=r.getLinkedTasks(),t._autoSchedule(e,a)},t.attachEvent("onTaskLoading",function(e){return e.constraint_date&&"string"==typeof e.constraint_date&&(e.constraint_date=t.date.parseDate(e.constraint_date,"parse_date")),e.constraint_type=t.getConstraintType(e),!0}),t.attachEvent("onTaskCreated",function(e){return e.constraint_type=t.getConstraintType(e),!0}),(0,a(262).attachUIHandlers)(t,r,l,c)},9:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var a=function(){function t(){this.link=null,this.task=null,this.start_date=null,this.end_date=null,this.latestStart=null,this.earliestStart=null,this.earliestEnd=null,this.latestEnd=null,this.latestSchedulingStart=null,this.earliestSchedulingStart=null,this.latestSchedulingEnd=null,this.earliestSchedulingEnd=null,this.kind="asap",this.conflict=!1}return t.Create=function(e){var n=new t;if(e)for(var a in n)void 0!==e[a]&&(n[a]=e[a]);return n},t}();e.TaskPlan=a}})})});
//# sourceMappingURL=dhtmlxgantt_auto_scheduling.js.map