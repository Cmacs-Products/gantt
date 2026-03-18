/** @license

dhtmlxGantt v.9.1.3 Professional

This software is covered by DHTMLX Individual License. Usage without proper license is prohibited.

(c) XB Software

*/
function Xe(t) {
  t._get_linked_task = function(o, l) {
    var d = null, u = l ? o.target : o.source;
    return t.isTaskExists(u) && (d = t.getTask(u)), d;
  }, t._get_link_target = function(o) {
    return t._get_linked_task(o, !0);
  }, t._get_link_source = function(o) {
    return t._get_linked_task(o, !1);
  };
  var n = !1, e = {}, i = {}, a = {}, r = {};
  function s(o) {
    return t.isSummaryTask(o) && o.auto_scheduling === !1;
  }
  t._isLinksCacheEnabled = function() {
    return n;
  }, t._startLinksCache = function() {
    e = {}, i = {}, a = {}, r = {}, n = !0;
  }, t._endLinksCache = function() {
    e = {}, i = {}, a = {}, r = {}, n = !1;
  }, t._formatLink = function(o, l, d) {
    if (n && e[o.id]) return e[o.id];
    var u = [], c = this._get_link_target(o), h = this._get_link_source(o);
    if (!h || !c || t.isSummaryTask(c) && t.isChildOf(h.id, c.id) || t.isSummaryTask(h) && t.isChildOf(c.id, h.id)) return u;
    const _ = t._getAutoSchedulingConfig();
    var f = _.schedule_from_end && t.config.project_end, v = _.move_projects;
    _.apply_constraints && _.gap_behavior === "compress" && (v = !1), l = l || this.isSummaryTask(h) && !s(h) ? this.getSubtaskDates(h.id) : { start_date: h.start_date, end_date: h.end_date };
    var k = this._getImplicitLinks(o, h, function(S) {
      return v && f ? S.$source.length || t.getState("tasksDnd").drag_id == S.id ? 0 : t.calculateDuration({ start_date: S.end_date, end_date: l.end_date, task: h }) : 0;
    }, !0);
    d || (d = { start_date: c.start_date, end_date: c.end_date }, this.isSummaryTask(c) && !s(c) && ((d = this.getSubtaskDates(c.id)).start_date = d.end_date, this.eachTask(function(S) {
      S.type !== this.config.types.project && !S.$target.length && S.start_date < d.start_date && (d.start_date = S.start_date);
    }, c.id)));
    for (var b = this._getImplicitLinks(o, c, function(S) {
      return !v || f || S.$target.length || t.getState("tasksDnd").drag_id == S.id ? 0 : t.calculateDuration({ start_date: d.start_date, end_date: S.start_date, task: c });
    }), m = 0, g = k.length; m < g; m++) for (var p = k[m], y = 0, $ = b.length; y < $; y++) {
      var x = b[y], w = 1 * p.lag + 1 * x.lag, T = { id: o.id, type: o.type, source: p.task, target: x.task, subtaskLink: p.subtaskLink, lag: (1 * o.lag || 0) + w };
      t._linkedTasks[T.target] = t._linkedTasks[T.target] || {}, t._linkedTasks[T.target][T.source] = !0, u.push(t._convertToFinishToStartLink(x.task, T, h, c, p.taskParent, x.taskParent));
    }
    return n && (e[o.id] = u), u;
  }, t._isAutoSchedulable = function(o) {
    if (!(o.auto_scheduling !== !1 && o.unscheduled !== !0)) return !1;
    if (this.isSummaryTask(o)) {
      let l = !0;
      if (this.eachTask(function(d) {
        l && t._isAutoSchedulable(d) && (l = !1);
      }, o.id), l) return !1;
    }
    return !0;
  }, t._getImplicitLinks = function(o, l, d, u) {
    var c = [];
    if (this.isSummaryTask(l) && !s(l)) {
      var h, _ = {};
      for (var f in this.eachTask(function(y) {
        this.isSummaryTask(y) && !s(y) || (_[y.id] = y);
      }, l.id), _) {
        var v = _[f];
        if (t._isAutoSchedulable(v)) {
          var k = u ? v.$source : v.$target;
          h = !1;
          for (var b = 0; b < k.length && o.type != t.config.links.start_to_start && o.type != t.config.links.start_to_finish; b++) {
            var m = t.getLink(k[b]), g = u ? m.target : m.source, p = _[g];
            if (p && t._isAutoSchedulable(v) && t._isAutoSchedulable(p)) {
              let y = 0;
              if (m.lag && (y = Math.abs(m.lag)), m.type != t.config.links.finish_to_start) {
                y += t._convertToFinishToStartLink(null, {}, v, p).additionalLag;
                continue;
              }
              const $ = m.target == p.id && y && y <= p.duration, x = m.target == v.id && y && y <= v.duration;
              if ($ || x) {
                h = !0;
                break;
              }
            }
          }
          if (!h) {
            let y = !0;
            for (const x in t._linkedTasks[v.id]) if (t.isChildOf(x, o.target)) {
              y = !1;
              break;
            }
            let $ = 0;
            y && ($ = d(v)), c.push({ task: v.id, taskParent: v.parent, lag: $, subtaskLink: !0 });
          }
        }
      }
    } else c.push({ task: l.id, taskParent: l.parent, lag: 0 });
    return c;
  }, t._getDirectDependencies = function(o, l) {
    t._linkedTasks = t._linkedTasks || {};
    for (var d = [], u = [], c = l ? o.$source : o.$target, h = 0; h < c.length; h++) {
      var _ = this.getLink(c[h]);
      if (this.isTaskExists(_.source) && this.isTaskExists(_.target)) {
        var f = this.getTask(_.target);
        if (!this._isAutoSchedulable(f) || !this._isAutoSchedulable(o)) continue;
        if (t._getAutoSchedulingConfig().use_progress) {
          if (f.progress == 1) continue;
          d.push(_);
        } else d.push(_);
      }
    }
    for (h = 0; h < d.length; h++) u = u.concat(this._formatLink(d[h]));
    return u;
  }, t._getInheritedDependencies = function(o, l) {
    var d, u = !1, c = [];
    return this.isTaskExists(o.id) && this.eachParent(function(h) {
      var _;
      u || (n && (d = l ? i : a)[h.id] ? c = c.concat(d[h.id]) : this.isSummaryTask(h) && (this._isAutoSchedulable(h) ? (_ = this._getDirectDependencies(h, l), n && (d[h.id] = _), c = c.concat(_)) : u = !0));
    }, o.id, this), c;
  }, t._getDirectSuccessors = function(o) {
    return this._getDirectDependencies(o, !0);
  }, t._getInheritedSuccessors = function(o) {
    return this._getInheritedDependencies(o, !0);
  }, t._getDirectPredecessors = function(o) {
    return this._getDirectDependencies(o, !1);
  }, t._getInheritedPredecessors = function(o) {
    return this._getInheritedDependencies(o, !1);
  }, t._getSuccessors = function(o, l) {
    var d = this._getDirectSuccessors(o);
    return l ? d : d.concat(this._getInheritedSuccessors(o));
  }, t._getPredecessors = function(o, l) {
    var d, u = String(o.id) + "-" + String(l);
    if (n && r[u]) return r[u];
    var c = this._getDirectPredecessors(o);
    return d = l ? c : c.concat(this._getInheritedPredecessors(o)), n && (r[u] = d), d;
  }, t._convertToFinishToStartLink = function(o, l, d, u, c, h) {
    var _ = { target: o, link: t.config.links.finish_to_start, id: l.id, lag: l.lag || 0, sourceLag: 0, targetLag: 0, trueLag: l.lag || 0, source: l.source, preferredStart: null, sourceParent: c, targetParent: h, hashSum: null, subtaskLink: l.subtaskLink }, f = 0;
    switch (String(l.type)) {
      case String(t.config.links.start_to_start):
        f = -d.duration, _.sourceLag = f;
        break;
      case String(t.config.links.finish_to_finish):
        f = -u.duration, _.targetLag = f;
        break;
      case String(t.config.links.start_to_finish):
        f = -d.duration - u.duration, _.sourceLag = -d.duration, _.targetLag = -u.duration;
        break;
      default:
        f = 0;
    }
    return _.lag += f, _.hashSum = _.lag + "_" + _.link + "_" + _.source + "_" + _.target, _;
  };
}
var Ze = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2592e3, quarter: 7776e3, year: 31536e3 };
function Zt(t) {
  return Ze[t] || Ze.hour;
}
function ht(t, n) {
  if (t.forEach) t.forEach(n);
  else for (var e = t.slice(), i = 0; i < e.length; i++) n(e[i], i);
}
function Ee(t, n) {
  if (t.find) return t.find(n);
  for (var e = 0; e < t.length; e++) if (n(t[e], e)) return t[e];
}
function Yt(t, n) {
  if (t.includes) return t.includes(n);
  for (var e = 0; e < t.length; e++) if (t[e] === n) return !0;
  return !1;
}
function Lt(t) {
  return Array.isArray ? Array.isArray(t) : t && t.length !== void 0 && t.pop && t.push;
}
function at(t) {
  return !(!t || typeof t != "object") && !!(t.getFullYear && t.getMonth && t.getDate);
}
function St(t) {
  return at(t) && !isNaN(t.getTime());
}
function wn(t, n) {
  var e = [];
  if (t.filter) return t.filter(n);
  for (var i = 0; i < t.length; i++) n(t[i], i) && (e[e.length] = t[i]);
  return e;
}
function Sn(t, n) {
  var e = !1;
  return function() {
    e || (t.apply(null, arguments), e = !0, setTimeout(function() {
      e = !1;
    }, n));
  };
}
function Qt(t, n) {
  var e, i = function() {
    i.$cancelTimeout(), i.$pending = !0;
    var a = Array.prototype.slice.call(arguments);
    e = setTimeout(function() {
      t.apply(this, a), i.$pending = !1;
    }, n);
  };
  return i.$pending = !1, i.$cancelTimeout = function() {
    clearTimeout(e), i.$pending = !1;
  }, i.$execute = function() {
    var a = Array.prototype.slice.call(arguments);
    t.apply(this, a), i.$cancelTimeout();
  }, i;
}
function lt(t, n) {
  return Qe(t) && !Qe(n) && (t = "0"), t;
}
function Qe(t) {
  return t === 0;
}
function It(t, n) {
  for (var e, i, a, r = 0, s = t.length - 1; r <= s; ) if (i = +t[e = Math.floor((r + s) / 2)], a = +t[e - 1], i < n) r = e + 1;
  else {
    if (!(i > n)) {
      for (; +t[e] == +t[e + 1]; ) e++;
      return e;
    }
    if (!isNaN(a) && a < n) return e - 1;
    s = e - 1;
  }
  return t.length - 1;
}
function tn() {
  return { getVertices: function(t) {
    for (var n, e = {}, i = 0, a = t.length; i < a; i++) e[(n = t[i]).target] = n.target, e[n.source] = n.source;
    var r, s = [];
    for (var i in e) r = e[i], s.push(r);
    return s;
  }, topologicalSort: function(t) {
    for (var n = this.getVertices(t), e = {}, i = 0, a = n.length; i < a; i++) e[n[i]] = { id: n[i], $source: [], $target: [], $incoming: 0 };
    for (i = 0, a = t.length; i < a; i++) {
      var r = e[t[i].target];
      r.$target.push(i), r.$incoming = r.$target.length, e[t[i].source].$source.push(i);
    }
    for (var s = n.filter(function(c) {
      return !e[c].$incoming;
    }), o = []; s.length; ) {
      var l = s.pop();
      o.push(l);
      var d = e[l];
      for (i = 0; i < d.$source.length; i++) {
        var u = e[t[d.$source[i]].target];
        u.$incoming--, u.$incoming || s.push(u.id);
      }
    }
    return o;
  }, groupAdjacentEdges: function(t) {
    for (var n, e = {}, i = 0, a = t.length; i < a; i++) e[(n = t[i]).source] || (e[n.source] = []), e[n.source].push(n);
    return e;
  }, tarjanStronglyConnectedComponents: function(t, n) {
    for (var e = {}, i = [], a = this.groupAdjacentEdges(n), r = !1, s = [], o = 0; o < t.length; o++) {
      var l = v(t[o]);
      if (!l.visited) for (var d = [l], u = 0; d.length; ) {
        var c = d.pop();
        c.visited || (c.index = u, c.lowLink = u, u++, i.push(c), c.onStack = !0, c.visited = !0), r = !1, n = a[c.id] || [];
        for (var h = 0; h < n.length; h++) {
          var _ = v(n[h].target);
          if (_.edge = n[h], _.index === void 0) {
            d.push(c), d.push(_), r = !0;
            break;
          }
          _.onStack && (c.lowLink = Math.min(c.lowLink, _.index));
        }
        if (!r) {
          if (c.index == c.lowLink) {
            for (var f = { tasks: [], links: [], linkKeys: [] }; (_ = i.pop()).onStack = !1, f.tasks.push(_.id), _.edge && (f.links.push(_.edge.id), f.linkKeys.push(_.edge.hashSum)), _ != c; ) ;
            s.push(f);
          }
          d.length && (_ = c, (c = d[d.length - 1]).lowLink = Math.min(c.lowLink, _.lowLink));
        }
      }
    }
    return s;
    function v(k) {
      return e[k] || (e[k] = { id: k, onStack: !1, index: void 0, lowLink: void 0, edge: void 0 }), e[k];
    }
  }, findLoops: function(t) {
    var n = [];
    ht(t, function(i) {
      i.target == i.source && n.push({ tasks: [i.source], links: [i.id] });
    });
    var e = this.getVertices(t);
    return ht(this.tarjanStronglyConnectedComponents(e, t), function(i) {
      i.tasks.length > 1 && n.push(i);
    }), n;
  } };
}
function en(t) {
  return { getVirtualRoot: function() {
    return t.mixin(t.getSubtaskDates(), { id: t.config.root_id, type: t.config.types.project, $source: [], $target: [], $virtual: !0 });
  }, getLinkedTasks: function(n, e) {
    var i = [n], a = !1;
    t._isLinksCacheEnabled() || (t._startLinksCache(), a = !0);
    for (var r = [], s = {}, o = {}, l = 0; l < i.length; l++) this._getLinkedTasks(i[l], s, e, o);
    for (var l in o) r.push(o[l]);
    return a && t._endLinksCache(), r;
  }, _collectRelations: function(n, e, i, a) {
    var r, s = t._getSuccessors(n, e), o = [];
    i && (o = t._getPredecessors(n, e));
    for (var l = [], d = 0; d < s.length; d++) a[r = s[d].hashSum] || (a[r] = !0, l.push(s[d]));
    for (d = 0; d < o.length; d++) a[r = o[d].hashSum] || (a[r] = !0, l.push(o[d]));
    return l;
  }, _getLinkedTasks: function(n, e, i, a) {
    for (var r, s = n === void 0 ? t.config.root_id : n, o = (e = {}, {}), l = [{ from: s, includePredecessors: i, isChild: !1 }]; l.length; ) {
      var d = l.pop(), u = d.isChild;
      if (!e[s = d.from]) {
        r = t.isTaskExists(s) ? t.getTask(s) : this.getVirtualRoot(), e[s] = !0;
        for (var c = this._collectRelations(r, u, i, o), h = 0; h < c.length; h++) {
          var _ = c[h];
          let k = !0;
          t._getAutoSchedulingConfig().use_progress && t.getTask(_.target).progress == 1 && (k = !1);
          const b = t.getTask(_.target), m = t.getTask(_.source);
          (b.unscheduled || m.unscheduled) && (k = !1), k && (a[_.hashSum] = _);
          var f = _.sourceParent == _.targetParent;
          e[_.target] || l.push({ from: _.target, includePredecessors: !0, isChild: f });
        }
        if (t.hasChild(r.id)) {
          var v = t.getChildren(r.id);
          for (h = 0; h < v.length; h++) e[v[h]] || l.push({ from: v[h], includePredecessors: !0, isChild: !0 });
        }
      }
    }
    return a;
  } };
}
var Jt, V = ((t) => (t.ASAP = "asap", t.ALAP = "alap", t.SNET = "snet", t.SNLT = "snlt", t.FNET = "fnet", t.FNLT = "fnlt", t.MSO = "mso", t.MFO = "mfo", t))(V || {});
class Pt {
  static Create(n) {
    const e = new Pt();
    if (n) for (const i in e) n[i] !== void 0 && (e[i] = n[i]);
    return e;
  }
  constructor() {
    this.link = null, this.task = null, this.start_date = null, this.end_date = null, this.latestStart = null, this.earliestStart = null, this.earliestEnd = null, this.latestEnd = null, this.latestSchedulingStart = null, this.earliestSchedulingStart = null, this.latestSchedulingEnd = null, this.earliestSchedulingEnd = null, this.kind = "asap", this.conflict = !1;
  }
}
class ze {
  constructor(n) {
    this.isAsapTask = (e) => {
      const i = this.getConstraintType(e);
      return this._gantt._getAutoSchedulingConfig().schedule_from_end ? i === V.ASAP : i !== V.ALAP;
    }, this.isAlapTask = (e) => !this.isAsapTask(e), this.getConstraintType = (e) => {
      if (!this._gantt._isAutoSchedulable(e)) return;
      const i = this._getTaskConstraint(e), a = this._gantt._getAutoSchedulingConfig();
      return i.constraint_type ? i.constraint_type : a.schedule_from_end ? V.ALAP : V.ASAP;
    }, this._getTaskConstraint = (e) => {
      let i = this._getOwnConstraint(e);
      const a = this._gantt._getAutoSchedulingConfig();
      if (a.project_constraint && !this._gantt.getState().group_mode) {
        let r = V.ASAP;
        a.schedule_from_end && (r = V.ALAP), (i && i.constraint_type) !== r && i || (i = this._getParentConstraint(e));
      }
      return i;
    }, this._getOwnConstraint = (e) => ({ constraint_type: e.constraint_type, constraint_date: e.constraint_date }), this._getParentConstraint = (e) => {
      const i = this._gantt._getAutoSchedulingConfig();
      let a = V.ASAP;
      i.schedule_from_end && (a = V.ALAP);
      let r = { constraint_type: a, constraint_date: null };
      return this._gantt.eachParent((s) => {
        r.constraint_type === a && s.constraint_type && s.constraint_type !== a && (r = { constraint_type: s.constraint_type, constraint_date: s.constraint_date });
      }, e.id), r;
    }, this.hasConstraint = (e) => !!this.getConstraintType(e), this.processConstraint = (e, i) => {
      const a = this._getTaskConstraint(e);
      if (a && !(a.constraint_type === V.ALAP || a.constraint_type === V.ASAP)) {
        if (St(a.constraint_date)) {
          const r = a.constraint_date, s = Pt.Create(i);
          switch (s.task = e.id, a.constraint_type) {
            case V.SNET:
              s.earliestStart = new Date(r), s.earliestEnd = this._gantt.calculateEndDate({ start_date: s.earliestStart, duration: e.duration, task: e }), s.link = null;
              break;
            case V.SNLT:
              s.latestStart = new Date(r), s.latestEnd = this._gantt.calculateEndDate({ start_date: s.latestStart, duration: e.duration, task: e }), s.link = null;
              break;
            case V.FNET:
              s.earliestStart = this._gantt.calculateEndDate({ start_date: r, duration: -e.duration, task: e }), s.earliestEnd = new Date(r), s.link = null;
              break;
            case V.FNLT:
              s.latestStart = this._gantt.calculateEndDate({ start_date: r, duration: -e.duration, task: e }), s.latestEnd = new Date(r), s.link = null;
              break;
            case V.MSO:
              s.earliestStart = new Date(r), s.earliestEnd = this._gantt.calculateEndDate({ start_date: s.earliestStart, duration: e.duration, task: e }), s.latestStart = s.earliestStart, s.latestEnd = s.earliestEnd, s.link = null;
              break;
            case V.MFO:
              s.earliestStart = this._gantt.calculateEndDate({ start_date: r, duration: -e.duration, task: e }), s.earliestEnd = this._gantt.calculateEndDate({ start_date: s.earliestStart, duration: e.duration, task: e }), s.latestStart = s.earliestStart, s.latestEnd = s.earliestEnd, s.link = null;
          }
          return s;
        }
      }
      return i;
    }, this.getConstraints = (e, i) => {
      const a = [], r = {}, s = (l) => {
        r[l.id] || this.hasConstraint(l) && !this._gantt.isSummaryTask(l) && (r[l.id] = l);
      };
      if (this._gantt.isTaskExists(e)) {
        const l = this._gantt.getTask(e);
        s(l);
      }
      let o;
      if (this._gantt.eachTask((l) => s(l), e), i) for (let l = 0; l < i.length; l++) {
        const d = i[l];
        r[d.target] || (o = this._gantt.getTask(d.target), s(o)), r[d.source] || (o = this._gantt.getTask(d.source), s(o));
      }
      for (const l in r) r[l].type !== this._gantt.config.types.placeholder && a.push(r[l]);
      return a;
    }, this._gantt = n;
  }
  static Create(n) {
    return new ze(n);
  }
}
class Tn {
  constructor(n) {
    this._gantt = n;
  }
  isEqual(n, e, i) {
    return !this._gantt._hasDuration(n, e, i);
  }
  isFirstSmaller(n, e, i) {
    return n.valueOf() < e.valueOf() && !this.isEqual(n, e, i);
  }
  isSmallerOrDefault(n, e, i) {
    return !(n && !this.isFirstSmaller(n, e, i));
  }
  isGreaterOrDefault(n, e, i) {
    return !(n && !this.isFirstSmaller(e, n, i));
  }
}
class je {
  static Create(n) {
    const e = new je();
    return e._gantt = n, e._comparator = new Tn(n), e;
  }
  resolveRelationDate(n, e, i) {
    let a = null, r = null, s = null, o = null;
    const l = this._gantt.getTask(n), d = e.successors;
    let u = null;
    const c = i[n];
    for (let _ = 0; _ < d.length; _++) {
      const f = d[_];
      o = f.preferredStart;
      const v = this.getLatestEndDate(f, i, l), k = this._gantt.calculateEndDate({ start_date: v, duration: -l.duration, task: l });
      this._comparator.isGreaterOrDefault(u, v, l) && (u = v), this._comparator.isGreaterOrDefault(o, k, l) && this._comparator.isGreaterOrDefault(a, v, l) && (a = v, s = k, r = f.id);
    }
    !d.length && this._gantt.config.project_end && (this._comparator.isGreaterOrDefault(this._gantt.config.project_end, l.end_date, l) && (a = this._gantt.config.project_end), this._gantt.callEvent("onBeforeTaskAutoSchedule", [l, l.end_date]) === !1 && (a = l.end_date)), a && (l.duration ? (a = this._gantt.getClosestWorkTime({ date: a, dir: "future", task: l }), s = this._gantt.calculateEndDate({ start_date: a, duration: -l.duration, task: l })) : s = a = this._gantt.getClosestWorkTime({ date: a, dir: "past", task: l }));
    const h = Pt.Create(c);
    return h.link = r, h.task = n, h.end_date = a, h.start_date = s, h.kind = "alap", u && (h.latestSchedulingStart = this._gantt.calculateEndDate({ start_date: u, duration: -l.duration, task: l }), h.latestSchedulingEnd = u), h;
  }
  getSuccessorStartDate(n, e) {
    const i = e[n], a = this._gantt.getTask(n);
    let r;
    return r = i && (i.start_date || i.end_date) ? i.start_date ? i.start_date : this._gantt.calculateEndDate({ start_date: i.end_date, duration: -a.duration, task: a }) : a.start_date, r;
  }
  getLatestEndDate(n, e, i) {
    const a = this.getSuccessorStartDate(n.target, e), r = i;
    let s = this._gantt.getClosestWorkTime({ date: a, dir: "past", task: r });
    return s && n.lag && 1 * n.lag == 1 * n.lag && (s = this._gantt.calculateEndDate({ start_date: s, duration: 1 * -n.lag, task: r })), s;
  }
}
class Fe {
  static Create(n) {
    const e = new Fe();
    return e._gantt = n, e._comparator = new Tn(n), e;
  }
  resolveRelationDate(n, e, i) {
    let a = null, r = null, s = null;
    const o = this._gantt.getTask(n), l = e.predecessors, d = this._gantt._getAutoSchedulingConfig(), u = {};
    let c = null;
    for (let v = 0; v < l.length; v++) {
      const k = l[v];
      s = k.preferredStart;
      const b = this.getEarliestStartDate(k, i, o);
      if (this._comparator.isSmallerOrDefault(c, b, o) && (c = b), this._comparator.isSmallerOrDefault(s, b, o) && this._comparator.isSmallerOrDefault(a, b, o) && (a = b, r = k.id), !o.duration) {
        const m = this._gantt.getLink(k.id);
        (u[m.type] === void 0 || u[m.type] < +b) && (u[m.type] = +b);
      }
    }
    !l.length && this._gantt.config.project_start && ((this._comparator.isSmallerOrDefault(o.start_date, this._gantt.config.project_start, o) || d.gap_behavior === "compress" && this._comparator.isGreaterOrDefault(o.start_date, this._gantt.config.project_start, o)) && (a = this._gantt.config.project_start), this._gantt.callEvent("onBeforeTaskAutoSchedule", [o, o.start_date]) === !1 && (a = o.start_date));
    let h = null;
    if (a) if (o.duration) a = this._gantt.getClosestWorkTime({ date: a, dir: "future", task: o }), h = this._gantt.calculateEndDate({ start_date: a, duration: o.duration, task: o });
    else {
      let v = "future";
      const k = this._gantt.config.links;
      if (u[k.finish_to_finish] !== void 0) {
        const b = l.length === 1;
        let m = !0;
        for (const g in u) if (g != k.finish_to_finish && u[k.finish_to_finish] < u[g]) {
          m = !1;
          break;
        }
        (b || m) && (v = "past");
      }
      a = h = this._gantt.getClosestWorkTime({ date: a, dir: v, task: o });
    }
    const _ = i[n], f = Pt.Create(_);
    return f.link = r, f.task = n, f.start_date = a, f.end_date = h, f.kind = "asap", c && (f.earliestSchedulingStart = c, f.earliestSchedulingEnd = this._gantt.calculateEndDate({ start_date: c, duration: o.duration, task: o })), f;
  }
  getPredecessorEndDate(n, e) {
    const i = e[n], a = this._gantt.getTask(n);
    let r;
    return r = i && (i.start_date || i.end_date) ? i.end_date ? i.end_date : this._gantt.calculateEndDate({ start_date: i.start_date, duration: a.duration, task: a }) : a.end_date, r;
  }
  getEarliestStartDate(n, e, i) {
    const a = this.getPredecessorEndDate(n.source, e), r = i, s = this._gantt.getTask(n.source), o = this._gantt._getAutoSchedulingConfig();
    let l;
    if (a && n.lag && 1 * n.lag == 1 * n.lag) {
      let d = r;
      o.move_projects && n.subtaskLink && this._gantt.isTaskExists(n.targetParent) && (d = this._gantt.getTask(n.targetParent)), l = this._gantt.getClosestWorkTime({ date: a, dir: "future", task: s }), n.sourceLag && (l = this._gantt.calculateEndDate({ start_date: l, duration: 1 * n.sourceLag, task: s })), n.targetLag && (l = this._gantt.calculateEndDate({ start_date: l, duration: 1 * n.targetLag, task: d })), l = this._gantt.calculateEndDate({ start_date: l, duration: 1 * n.trueLag, task: d });
    } else {
      const d = this._gantt.getLink(n.id).type === this._gantt.config.links.finish_to_finish;
      l = !r.duration && d ? this._gantt.getClosestWorkTime({ date: a, dir: "past", task: r }) : this._gantt.getClosestWorkTime({ date: a, dir: "future", task: r });
    }
    return l;
  }
}
class di {
  constructor(n, e, i) {
    this._secondIteration = !1, this._gantt = n, this._constraintsHelper = i, this._graphHelper = e, this._asapStrategy = Fe.Create(n), this._alapStrategy = je.Create(n), this._secondIterationRequired = !1;
  }
  generatePlan(n, e) {
    const i = this._graphHelper, a = this._gantt, r = this._constraintsHelper, s = this._alapStrategy, o = this._asapStrategy, l = a._getAutoSchedulingConfig(), { orderedIds: d, reversedIds: u, relationsMap: c, plansHash: h } = this.buildWorkCollections(n, e, i);
    let _;
    return this.processConstraints(d, h, a, r), _ = l.schedule_from_end ? this.iterateTasks(u, d, r.isAlapTask, s, o, c, h) : this.iterateTasks(d, u, r.isAsapTask, o, s, c, h), _;
  }
  applyProjectPlan(n) {
    const e = this._gantt;
    let i, a, r, s;
    const o = [];
    for (let l = 0; l < n.length; l++) {
      if (r = null, s = null, i = n[l], !e.isTaskExists(i.task)) continue;
      a = e.getTask(i.task), i.link && (r = e.getLink(i.link), s = i.kind === "asap" ? this._gantt.getTask(r.source) : this._gantt.getTask(r.target));
      let d = null;
      i.start_date && a.start_date.valueOf() !== i.start_date.valueOf() && (d = i.start_date), d && (a.start_date = d, a.end_date = e.calculateEndDate(a), o.push(a.id), e.callEvent("onAfterTaskAutoSchedule", [a, d, r, s]));
    }
    return o;
  }
  iterateTasks(n, e, i, a, r, s, o) {
    const l = this._gantt, d = [];
    for (let u = 0; u < n.length; u++) {
      const c = n[u], h = l.getTask(c);
      if (!l._isAutoSchedulable(h)) continue;
      const _ = a.resolveRelationDate(c, s[c], o);
      this.limitPlanDates(h, _), i(h) ? this.processResolvedDate(h, _, d, o) : o[h.id] = _;
    }
    for (let u = 0; u < e.length; u++) {
      const c = e[u], h = l.getTask(c);
      if (l._isAutoSchedulable(h) && !i(h)) {
        const _ = r.resolveRelationDate(c, s[c], o);
        this.limitPlanDates(h, _), this.processResolvedDate(h, _, d, o);
      }
    }
    if (this._secondIterationRequired) {
      if (this._secondIteration) this._secondIteration = !1;
      else if (this._secondIteration = !0, this.summaryLagChanged(l, s, o)) return this.iterateTasks(n, e, i, a, r, s, o);
    }
    return d;
  }
  summaryLagChanged(n, e, i) {
    const a = {}, r = {};
    for (const o in e) e[o].predecessors.forEach((l) => {
      if (l.subtaskLink) {
        const d = n.getLink(l.id);
        this.getProjectUpdates(n, i, l, d, "source", a, r), this.getProjectUpdates(n, i, l, d, "target", a, r);
      }
    });
    let s = !1;
    for (const o in a) {
      const l = a[o];
      if (!l.min || !l.max) continue;
      const d = n.getTask(o), u = n.calculateDuration({ start_date: d.start_date, end_date: d.end_date, task: d }), c = n.calculateDuration({ start_date: l.min, end_date: l.max, task: d });
      c !== u && (d.start_date = l.min, d.end_date = l.max, d.duration = c);
    }
    for (const o in r) {
      const l = r[o];
      let d, u;
      const c = a[l.source], h = a[l.target];
      c && (d = { start_date: c.start_date, end_date: c.end_date }), h && (d = { start_date: h.start_date, end_date: h.end_date }), n._formatLink(l, d, u).forEach(function(_) {
        for (const f in e) e[f].predecessors.forEach(function(v) {
          const k = v.id === _.id, b = v.target === _.target, m = v.source === _.source;
          k && b && m && (v.lag = _.lag, v.sourceLag = _.sourceLag, v.targetLag = _.targetLag, v.hashSum = _.hashSum);
        });
      }), s = !0;
    }
    return s;
  }
  getProjectUpdates(n, e, i, a, r, s, o) {
    if (n.getTask(a[r]).type === n.config.types.project) {
      s[a[r]] = s[a[r]] || { id: a[r], link: a };
      const l = s[a[r]];
      let d = e[i[r]];
      d && (r != "source" || d.start_date && d.end_date || (d = n.getTask(d.task)), l.min = l.min || d.start_date, l.min > d.start_date && (l.min = d.start_date), l.max = l.max || d.end_date, l.max < d.end_date && (l.max = d.end_date), o[a.id] = a);
    }
  }
  processResolvedDate(n, e, i, a) {
    if (e.start_date && this._gantt.isLinkExists(e.link)) {
      let r = null, s = null;
      if (e.link && (r = this._gantt.getLink(e.link), s = e.kind === "asap" ? this._gantt.getTask(r.source) : this._gantt.getTask(r.target)), n.start_date.valueOf() !== e.start_date.valueOf() && this._gantt.callEvent("onBeforeTaskAutoSchedule", [n, e.start_date, r, s]) === !1) return;
    }
    a[n.id] = e, e.start_date && i.push(e);
  }
  limitPlanDates(n, e) {
    const i = e.start_date || n.start_date;
    return e.earliestStart && i < e.earliestStart && (e.start_date = e.earliestStart, e.end_date = e.earliestEnd), e.latestStart && i > e.latestStart && (e.start_date = e.latestStart, e.end_date = e.latestEnd), e.latestSchedulingStart && i > e.latestSchedulingStart && (e.start_date = e.latestSchedulingStart, e.end_date = e.latestSchedulingEnd), e.earliestSchedulingStart && i < e.earliestSchedulingStart && (e.start_date = e.earliestSchedulingStart, e.end_date = e.earliestSchedulingEnd), e.start_date && (e.start_date > e.latestSchedulingStart || e.start_date < e.earliestSchedulingStart || e.start_date > e.latestStart || e.start_date < e.earliestStart || e.end_date > e.latestSchedulingEnd || e.end_date < e.earliestSchedulingEnd || e.end_date > e.latestEnd || e.end_date < e.earliestEnd) && (e.conflict = !0), e;
  }
  buildWorkCollections(n, e, i) {
    const a = this._gantt, r = i.topologicalSort(n), s = r.slice().reverse(), o = {}, l = {};
    for (let d = 0, u = r.length; d < u; d++) {
      const c = r[d], h = a.getTask(c);
      a._isAutoSchedulable(h) && (l[c] = { successors: [], predecessors: [] }, o[c] = null);
    }
    for (let d = 0, u = e.length; d < u; d++) {
      const c = e[d];
      o[c.id] === void 0 && (s.unshift(c.id), r.unshift(c.id), o[c.id] = null, l[c.id] = { successors: [], predecessors: [] });
    }
    for (let d = 0, u = n.length; d < u; d++) {
      const c = n[d];
      l[c.source] && l[c.source].successors.push(c), l[c.target] && l[c.target].predecessors.push(c);
    }
    return { orderedIds: r, reversedIds: s, relationsMap: l, plansHash: o };
  }
  processConstraints(n, e, i, a) {
    for (let r = 0; r < n.length; r++) {
      const s = n[r], o = i.getTask(s), l = a.getConstraintType(o);
      if (l && l !== V.ASAP && l !== V.ALAP) {
        const d = a.processConstraint(o, Pt.Create());
        e[o.id] = d;
      }
    }
  }
}
function _e(t, n, e) {
  const i = [t], a = [], r = {}, s = {};
  let o;
  for (; i.length > 0; ) if (o = i.shift(), !e[o]) {
    e[o] = !0, a.push(o);
    for (let u = 0; u < n.length; u++) {
      const c = n[u];
      c.source == o || c.sourceParent == o ? (e[c.target] || (i.push(c.target), s[c.id] = !0, n.splice(u, 1), u--), r[c.hashSum] = c) : c.target != o && c.targetParent != o || (e[c.source] || (i.push(c.source), s[c.id] = !0, n.splice(u, 1), u--), r[c.hashSum] = c);
    }
  }
  const l = [];
  let d = [];
  for (const u in s) l.push(u);
  for (const u in r) d.push(r[u]);
  return d.length || (d = n), { tasks: a, links: l, processedLinks: d };
}
class ci {
  constructor(n, e) {
    this.getConnectedGroupRelations = (i) => _e(i, this._linksBuilder.getLinkedTasks(), {}).processedLinks, this.getConnectedGroup = (i) => {
      const a = this._linksBuilder.getLinkedTasks();
      if (i !== void 0) {
        if (this._gantt.getTask(i).type === this._gantt.config.types.project) return { tasks: [], links: [] };
        const r = _e(i, a, {});
        return { tasks: r.tasks, links: r.links };
      }
      return function(r) {
        const s = {}, o = [];
        let l, d, u;
        for (let c = 0; c < r.length; c++) if (l = r[c].source, d = r[c].target, u = null, s[l] ? s[d] || (u = d) : u = l, u) {
          const h = r.length;
          o.push(_e(u, r, s)), h !== r.length && (c = -1);
        }
        return o;
      }(a).map((r) => ({ tasks: r.tasks, links: r.links }));
    }, this._linksBuilder = e, this._gantt = n;
  }
}
class ui {
  constructor(n, e, i) {
    this.isCircularLink = (a) => !!this.getLoopContainingLink(a), this.getLoopContainingLink = (a) => {
      const r = this._graphHelper, s = this._linksBuilder, o = this._gantt;
      let l = s.getLinkedTasks();
      o.isLinkExists(a.id) || (l = l.concat(o._formatLink(a)));
      const d = r.findLoops(l);
      for (let u = 0; u < d.length; u++) {
        const c = d[u].links;
        for (let h = 0; h < c.length; h++) if (c[h] == a.id) return d[u];
      }
      return null;
    }, this.findCycles = () => {
      const a = this._graphHelper, r = this._linksBuilder.getLinkedTasks();
      return a.findLoops(r);
    }, this._linksBuilder = i, this._graphHelper = e, this._gantt = n;
  }
}
function Cn(t) {
  function n() {
    return { enabled: !1, apply_constraints: !1, gap_behavior: "preserve", descendant_links: !1, schedule_on_parse: !0, move_projects: !0, use_progress: !1, schedule_from_end: !1, project_constraint: !1, show_constraints: !1 };
  }
  return { getDefaultAutoSchedulingConfig: n, getAutoSchedulingConfig: function() {
    const e = t.config;
    if (typeof e.auto_scheduling == "object") {
      const i = { enabled: !1, apply_constraints: !1, gap_behavior: "preserve", descendant_links: !1, schedule_on_parse: !0, move_projects: !0, use_progress: !1, schedule_from_end: !1, project_constraint: !1, show_constraints: !1, ...e.auto_scheduling };
      return i.mode && (i.apply_constraints = i.mode === "constraints", delete i.mode), i.strict !== void 0 && (i.gap_behavior = i.strict ? "compress" : "preserve", delete i.strict), i.move_asap_tasks !== void 0 && (i.gap_behavior = i.move_asap_tasks ? "compress" : "preserve", delete i.move_asap_tasks), i;
    }
    return { enabled: !1, apply_constraints: !1, gap_behavior: "preserve", descendant_links: !1, schedule_on_parse: !0, move_projects: !0, use_progress: !1, schedule_from_end: !1, project_constraint: !1, show_constraints: !1, enabled: !!e.auto_scheduling, apply_constraints: e.auto_scheduling_compatibility ?? !1, gap_behavior: e.auto_scheduling_strict !== !0 ? "preserve" : "compress", descendant_links: e.auto_scheduling_descendant_links ?? !1, schedule_on_parse: e.auto_scheduling_initial ?? !0, move_projects: e.auto_scheduling_move_projects ?? !0, use_progress: e.auto_scheduling_use_progress ?? !1, schedule_from_end: e.schedule_from_end ?? !1, project_constraint: e.auto_scheduling_project_constraint ?? !1, show_constraints: !1 };
  } };
}
function hi(t, n, e, i) {
  const a = function() {
    let r, s, o = !1;
    function l(x, w) {
      t._getAutoSchedulingConfig().enabled && !t._autoscheduling_in_progress && (t.getState().batch_update ? o = !0 : t.autoSchedule(w.source));
    }
    function d(x, w) {
      const T = t._getAutoSchedulingConfig().use_progress, S = t.config.auto_scheduling_use_progress;
      return S ? t.config.auto_scheduling_use_progress = !1 : T && (t.config.auto_scheduling.use_progress = !1), t.isCircularLink(w) ? (t.callEvent("onCircularLinkError", [w, e.getLoopContainingLink(w)]), S ? t.config.auto_scheduling_use_progress = T : T && (t.config.auto_scheduling.use_progress = T), !1) : (S ? t.config.auto_scheduling_use_progress = T : T && (t.config.auto_scheduling.use_progress = T), !0);
    }
    function u(x, w) {
      const T = t.getTask(w.source), S = t.getTask(w.target);
      return !(!t._getAutoSchedulingConfig().descendant_links && (t.isChildOf(T.id, S.id) && t.isSummaryTask(S) || t.isChildOf(S.id, T.id) && t.isSummaryTask(T)));
    }
    function c(x, w, T, S) {
      return !!x != !!w || !(!x && !w) && (x.valueOf() > w.valueOf() ? t._hasDuration({ start_date: w, end_date: x, task: S }) : t._hasDuration({ start_date: x, end_date: w, task: T }));
    }
    function h(x, w) {
      return !!c(x.start_date, w.start_date, x, w) || t.getConstraintType(x) !== t.getConstraintType(w) || !!c(x.constraint_date, w.constraint_date, x, w) || !(!c(x.start_date, w.start_date, x, w) && (!c(x.end_date, w.end_date, x, w) && x.duration === w.duration || x.type === t.config.types.milestone)) || void 0;
    }
    function _(x) {
      return t._getAutoSchedulingConfig().apply_constraints ? i.getConnectedGroupRelations(x) : n.getLinkedTasks(x, !0);
    }
    function f(x, w) {
      let T = !1;
      for (let S = 0; S < r.length; S++) {
        const C = t.getLink(w[S].id);
        !C || C.type !== t.config.links.start_to_start && C.type !== t.config.links.start_to_finish || (w.splice(S, 1), S--, T = !0);
      }
      if (T) {
        const S = {};
        for (let E = 0; E < w.length; E++) S[w[E].id] = !0;
        const C = _(x);
        for (let E = 0; E < C.length; E++) S[C[E].id] || w.push(C[E]);
      }
    }
    function v(x, w) {
      if (t._getAutoSchedulingConfig().schedule_from_end) {
        if (w.end_date && x.end_date && x.end_date.valueOf() === w.end_date.valueOf()) return !0;
      } else if (w.start_date && x.start_date && x.start_date.valueOf() === w.start_date.valueOf()) return !0;
    }
    function k(x) {
      if (x.auto_scheduling === !1) return;
      const w = t._getAutoSchedulingConfig(), T = t.config.constraint_types, S = [T.SNLT, T.FNLT, T.MSO, T.MFO], C = [T.SNET, T.FNET, T.MSO, T.MFO];
      w.schedule_from_end ? S.indexOf(x.constraint_type) > -1 ? x.constraint_type == T.SNLT || x.constraint_type == T.MSO ? x.constraint_date = new Date(x.start_date) : x.constraint_date = new Date(x.end_date) : (x.constraint_type = T.FNLT, x.constraint_date = new Date(x.end_date)) : C.indexOf(x.constraint_type) > -1 ? x.constraint_type == T.SNET || x.constraint_type == T.MSO ? x.constraint_date = new Date(x.start_date) : x.constraint_date = new Date(x.end_date) : (x.constraint_type = T.SNET, x.constraint_date = new Date(x.start_date));
    }
    function b(x) {
      t._getAutoSchedulingConfig().apply_constraints || (x.constraint_type = null, x.constraint_date = null);
    }
    t.attachEvent("onAfterBatchUpdate", function() {
      o && t.autoSchedule(), o = !1;
    }), t.attachEvent("onAfterLinkUpdate", l), t.attachEvent("onAfterLinkAdd", l), t.attachEvent("onAfterLinkDelete", function(x, w) {
      if (t._getAutoSchedulingConfig().enabled && !t._autoscheduling_in_progress && t.isTaskExists(w.target)) {
        const T = t.getTask(w.target), S = t._getPredecessors(T);
        S.length && (t.getState().batch_update ? o = !0 : t.autoSchedule(S[0].source, !1));
      }
    }), t.attachEvent("onParse", function() {
      const x = t._getAutoSchedulingConfig();
      x.enabled && x.schedule_on_parse && t.autoSchedule();
    }), t.attachEvent("onBeforeLinkAdd", d), t.attachEvent("onBeforeLinkAdd", u), t.attachEvent("onBeforeLinkUpdate", d), t.attachEvent("onBeforeLinkUpdate", u), t.attachEvent("onBeforeTaskDrag", function(x, w, T) {
      return t._getAutoSchedulingConfig().enabled && (t.getState().drag_mode !== "progress" && (r = _(x)), s = x), !0;
    });
    const m = function(x, w) {
      const T = t.getTask(x);
      v(T, w) || k(T);
    };
    let g, p = null;
    if (t.ext && t.ext.inlineEditors) {
      const x = t.ext.inlineEditors, w = { start_date: !0, end_date: !0, duration: !0, constraint_type: !0, constraint_date: !0 };
      x.attachEvent("onBeforeSave", function(T) {
        if (w[T.columnName]) {
          const S = t._getAutoSchedulingConfig();
          p = T.id, T.columnName === "constraint_type" && (g = !0);
          const C = T.columnName === "duration", E = S.schedule_from_end && T.columnName === "start_date", D = !S.schedule_from_end && T.columnName === "end_date", I = t.config.inline_editors_date_processing !== "keepDuration" && (E || D), M = T.columnName === "constraint_date";
          (C || I || M) && (t.getTask(T.id).$keep_constraints = !0);
        }
        return !0;
      });
    }
    const y = {};
    let $;
    t.attachEvent("onBeforeTaskChanged", function(x, w, T) {
      return m(x, T), y[x] = T, !0;
    }), t.attachEvent("onAfterTaskDrag", function(x, w, T) {
      x === s && (clearTimeout($), $ = setTimeout(function() {
        (function(S, C) {
          const E = t._getAutoSchedulingConfig();
          if (E.enabled && !t._autoscheduling_in_progress) {
            const D = t.getTask(S), I = E.use_progress && C.progress === 1 != (D.progress === 1);
            if (h(C, D)) {
              if (m(S, C), E.move_projects && s == S) {
                let M = !0;
                t.calculateDuration(C) !== t.calculateDuration(D) && (f(S, r), M = !1), I ? t.autoSchedule() : (M && f(S, r), t._autoSchedule(S, r));
              } else t.autoSchedule(D.id);
              b(D);
            }
          }
          r = null, s = null;
        })(x, y[x]);
      }));
    }), t.ext.inlineEditors && t.ext.inlineEditors.attachEvent("onBeforeSave", function(x) {
      if (t._getAutoSchedulingConfig().enabled && !t._autoscheduling_in_progress) {
        const w = t.ext.inlineEditors.getEditorConfig(x.columnName);
        !w || w.map_to !== "start_date" && w.map_to !== "end_date" && w.map_to !== "duration" || (p = x.id);
      }
      return !0;
    }), t.attachEvent("onLightboxSave", function(x, w) {
      if (t._getAutoSchedulingConfig().enabled && !t._autoscheduling_in_progress) {
        g = !1;
        const T = t.getTask(x);
        h(w, T) && (p = x, v(w, T) && (w.$keep_constraints = !0), t.getConstraintType(w) === t.getConstraintType(T) && +w.constraint_date == +T.constraint_date || (g = !0));
      }
      return !0;
    }), t.attachEvent("onAfterTaskUpdate", function(x, w) {
      return t._getAutoSchedulingConfig().enabled && !t._autoscheduling_in_progress && p !== null && p == x && (p = null, w.$keep_constraints ? delete w.$keep_constraints : g || k(w), t.autoSchedule(w.id), g || b(w)), !0;
    });
  };
  t.attachEvent("onGanttReady", function() {
    a();
  }, { once: !0 });
}
function Y(t) {
  var n = 0, e = 0, i = 0, a = 0;
  if (t.getBoundingClientRect) {
    var r = t.getBoundingClientRect(), s = document.body, o = document.documentElement || document.body.parentNode || document.body, l = window.pageYOffset || o.scrollTop || s.scrollTop, d = window.pageXOffset || o.scrollLeft || s.scrollLeft, u = o.clientTop || s.clientTop || 0, c = o.clientLeft || s.clientLeft || 0;
    n = r.top + l - u, e = r.left + d - c, i = document.body.offsetWidth - r.right, a = document.body.offsetHeight - r.bottom;
  } else {
    for (; t; ) n += parseInt(t.offsetTop, 10), e += parseInt(t.offsetLeft, 10), t = t.offsetParent;
    i = document.body.offsetWidth - t.offsetWidth - e, a = document.body.offsetHeight - t.offsetHeight - n;
  }
  return { y: Math.round(n), x: Math.round(e), width: t.offsetWidth, height: t.offsetHeight, right: Math.round(i), bottom: Math.round(a) };
}
function _i(t) {
  var n = !1, e = !1;
  if (window.getComputedStyle) {
    var i = window.getComputedStyle(t, null);
    n = i.display, e = i.visibility;
  } else t.currentStyle && (n = t.currentStyle.display, e = t.currentStyle.visibility);
  return n != "none" && e != "hidden";
}
function gi(t) {
  return !isNaN(t.getAttribute("tabindex")) && 1 * t.getAttribute("tabindex") >= 0;
}
function fi(t) {
  return !{ a: !0, area: !0 }[t.nodeName.loLowerCase()] || !!t.getAttribute("href");
}
function pi(t) {
  return !{ input: !0, select: !0, textarea: !0, button: !0, object: !0 }[t.nodeName.toLowerCase()] || !t.hasAttribute("disabled");
}
function Vt(t) {
  for (var n = t.querySelectorAll(["a[href]", "area[href]", "input", "select", "textarea", "button", "iframe", "object", "embed", "[tabindex]", "[contenteditable]"].join(", ")), e = Array.prototype.slice.call(n, 0), i = 0; i < e.length; i++) e[i].$position = i;
  for (e.sort(function(r, s) {
    return r.tabIndex === 0 && s.tabIndex !== 0 ? 1 : r.tabIndex !== 0 && s.tabIndex === 0 ? -1 : r.tabIndex === s.tabIndex ? r.$position - s.$position : r.tabIndex < s.tabIndex ? -1 : 1;
  }), i = 0; i < e.length; i++) {
    var a = e[i];
    (gi(a) || pi(a) || fi(a)) && _i(a) || (e.splice(i, 1), i--);
  }
  return e;
}
function En() {
  var t = document.createElement("div");
  t.style.cssText = "visibility:hidden;position:absolute;left:-1000px;width:100px;padding:0px;margin:0px;height:110px;min-height:100px;overflow-y:scroll;", document.body.appendChild(t);
  var n = t.offsetWidth - t.clientWidth;
  return document.body.removeChild(t), Math.max(n, 15);
}
function it(t) {
  if (!t) return "";
  var n = t.className || "";
  return n.baseVal && (n = n.baseVal), n.indexOf || (n = ""), De(n);
}
function xt(t, n) {
  n && t.className.indexOf(n) === -1 && (t.className += " " + n);
}
function Nt(t, n) {
  n = n.split(" ");
  for (var e = 0; e < n.length; e++) {
    var i = new RegExp("\\s?\\b" + n[e] + "\\b(?![-_.])", "");
    t.className = t.className.replace(i, "");
  }
}
function We(t) {
  return typeof t == "string" ? document.getElementById(t) || document.querySelector(t) || document.body : t || document.body;
}
function Dn(t, n) {
  Jt || (Jt = document.createElement("div")), Jt.innerHTML = n;
  var e = Jt.firstChild;
  return t.appendChild(e), e;
}
function An(t) {
  t && t.parentNode && t.parentNode.removeChild(t);
}
function In(t, n) {
  for (var e = t.childNodes, i = e.length, a = [], r = 0; r < i; r++) {
    var s = e[r];
    s.className && s.className.indexOf(n) !== -1 && a.push(s);
  }
  return a;
}
function Dt(t) {
  var n;
  return t.tagName ? n = t : (n = (t = t || window.event).target || t.srcElement).shadowRoot && t.composedPath && (n = t.composedPath()[0]), n;
}
function et(t, n) {
  if (n) {
    for (var e = Dt(t); e; ) {
      if (e.getAttribute && e.getAttribute(n)) return e;
      e = e.parentNode || e.host;
    }
    return null;
  }
}
function De(t) {
  return (String.prototype.trim || function() {
    return this.replace(/^\s+|\s+$/g, "");
  }).apply(t);
}
function kt(t, n, e) {
  var i = Dt(t), a = "";
  for (e === void 0 && (e = !0); i; ) {
    if (a = it(i)) {
      var r = a.indexOf(n);
      if (r >= 0) {
        if (!e) return i;
        var s = r === 0 || !De(a.charAt(r - 1)), o = r + n.length >= a.length || !De(a.charAt(r + n.length));
        if (s && o) return i;
      }
    }
    i = i.parentNode;
  }
  return null;
}
function dt(t, n) {
  var s;
  const e = document.documentElement, i = Y(n), { clientX: a, clientY: r } = ((s = t.touches) == null ? void 0 : s[0]) ?? t;
  return { x: a + e.scrollLeft - e.clientLeft - i.x + n.scrollLeft, y: r + e.scrollTop - e.clientTop - i.y + n.scrollTop };
}
function Mn(t, n) {
  const e = Y(t), i = Y(n);
  return { x: e.x - i.x, y: e.y - i.y };
}
function Z(t, n) {
  if (!t || !n) return !1;
  for (; t && t != n; ) t = t.parentNode;
  return t === n;
}
function ct(t, n) {
  if (t.closest) return t.closest(n);
  if (t.matches || t.msMatchesSelector || t.webkitMatchesSelector) {
    var e = t;
    if (!document.documentElement.contains(e)) return null;
    do {
      if ((e.matches || e.msMatchesSelector || e.webkitMatchesSelector).call(e, n)) return e;
      e = e.parentElement || e.parentNode;
    } while (e !== null && e.nodeType === 1);
    return null;
  }
  return console.error("Your browser is not supported"), null;
}
function Ln(t) {
  for (; t; ) {
    if (t.offsetWidth > 0 && t.offsetHeight > 0) return t;
    t = t.parentElement;
  }
  return null;
}
function Nn() {
  return document.head.createShadowRoot || document.head.attachShadow;
}
function Ae() {
  var t = document.activeElement;
  return t.shadowRoot && (t = t.shadowRoot.activeElement), t === document.body && document.getSelection && (t = document.getSelection().focusNode || document.body), t;
}
function Et(t) {
  if (!t || !Nn()) return document.body;
  for (; t.parentNode && (t = t.parentNode); ) if (t instanceof ShadowRoot) return t.host;
  return document.body;
}
const Pn = Object.freeze(Object.defineProperty({ __proto__: null, addClassName: xt, closest: ct, getActiveElement: Ae, getChildNodes: In, getClassName: it, getClosestSizedElement: Ln, getFocusableNodes: Vt, getNodePosition: Y, getRelativeEventPosition: dt, getRelativeNodePosition: Mn, getRootNode: Et, getScrollSize: En, getTargetNode: Dt, hasClass: function(t, n) {
  return "classList" in t ? t.classList.contains(n) : new RegExp("\\b" + n + "\\b").test(t.className);
}, hasShadowParent: function(t) {
  return !!Et(t);
}, insertNode: Dn, isChildOf: Z, isShadowDomSupported: Nn, locateAttribute: et, locateClassName: kt, removeClassName: Nt, removeNode: An, toNode: We }, Symbol.toStringTag, { value: "Module" })), tt = typeof window < "u" ? window : global;
let mi = class {
  constructor(t) {
    this._mouseDown = !1, this._touchStarts = !1, this._touchActive = !1, this._longTapTimer = !1, this._gantt = t, this._domEvents = t._createDomEventScope();
  }
  attach(t, n, e) {
    const i = this._gantt, a = t.getViewPort();
    this._originPosition = tt.getComputedStyle(a).display, this._restoreOriginPosition = () => {
      a.style.position = this._originPosition;
    }, this._originPosition === "static" && (a.style.position = "relative");
    const r = i.$services.getService("state");
    r.registerProvider("clickDrag", () => ({ autoscroll: !1 }));
    let s = null;
    const o = () => {
      s && (this._mouseDown = !0, t.setStart(i.copy(s)), t.setPosition(i.copy(s)), t.setEnd(i.copy(s)), s = null);
    };
    this._domEvents.attach(a, "mousedown", (f) => {
      c(f);
    });
    const l = Et(i.$root) || document.body;
    function d(f) {
      return f.changedTouches && f.changedTouches[0] || f;
    }
    this._domEvents.attach(l, "mouseup", (f) => {
      h(f);
    }), this._domEvents.attach(a, "mousemove", (f) => {
      _(f);
    }), this._domEvents.attach(a, "touchstart", (f) => {
      this._touchStarts = !0, this._longTapTimer = setTimeout(() => {
        this._touchStarts && (c(d(f)), this._touchStarts = !1, this._touchActive = !0);
      }, this._gantt.config.touch_drag);
    }), this._domEvents.attach(l, "touchend", (f) => {
      this._touchStarts = !1, this._touchActive = !1, clearTimeout(this._longTapTimer), h(d(f));
    }), this._domEvents.attach(a, "touchmove", (f) => {
      if (this._touchActive) {
        let v = u();
        if (v && i.utils.dom.closest(f.target, v)) return;
        _(d(f)), f.preventDefault();
      } else this._touchStarts = !1, clearTimeout(this._longTapTimer);
    });
    const u = () => {
      let f = ".gantt_task_line, .gantt_task_link";
      return e !== void 0 && (f = e instanceof Array ? e.join(", ") : e), f;
    }, c = (f) => {
      s = null;
      let v = u();
      v && i.utils.dom.closest(f.target, v) || (r.registerProvider("clickDrag", () => ({ autoscroll: this._mouseDown })), n && f[n] !== !0 || (s = this._getCoordinates(f, t)));
    }, h = (f) => {
      if (s = null, (!n || f[n] === !0) && this._mouseDown === !0) {
        this._mouseDown = !1;
        const v = this._getCoordinates(f, t);
        t.dragEnd(v);
      }
    }, _ = (f) => {
      if (n && f[n] !== !0) return;
      const v = this._gantt.ext.clickDrag, k = (this._gantt.config.drag_timeline || {}).useKey;
      if (v && k && !n && f[k]) return;
      let b = null;
      if (!this._mouseDown && s) return b = this._getCoordinates(f, t), void (Math.abs(s.relative.left - b.relative.left) > 5 && o());
      this._mouseDown === !0 && (b = this._getCoordinates(f, t), t.setEnd(b), t.render());
    };
  }
  detach() {
    const t = this._gantt;
    this._domEvents.detachAll(), this._restoreOriginPosition && this._restoreOriginPosition(), t.$services.getService("state").unregisterProvider("clickDrag");
  }
  destructor() {
    this.detach();
  }
  _getCoordinates(t, n) {
    const e = n.getViewPort(), i = e.getBoundingClientRect(), { clientX: a, clientY: r } = t;
    return { absolute: { left: a, top: r }, relative: { left: a - i.left + e.scrollLeft, top: r - i.top + e.scrollTop } };
  }
};
var Rn = function() {
  this._silent_mode = !1, this.listeners = {};
};
Rn.prototype = { _silentStart: function() {
  this._silent_mode = !0;
}, _silentEnd: function() {
  this._silent_mode = !1;
} };
function _t(t) {
  var n = new Rn();
  t.attachEvent = function(e, i, a) {
    e = "ev_" + e.toLowerCase(), n.listeners[e] || (n.listeners[e] = function(s) {
      var o = {}, l = 0, d = function() {
        var u = !0;
        for (var c in o) {
          var h = o[c].apply(s, arguments);
          u = u && h;
        }
        return u;
      };
      return d.addEvent = function(u, c) {
        if (typeof u == "function") {
          var h;
          if (c && c.id ? h = c.id : (h = l, l++), c && c.once) {
            var _ = u;
            u = function() {
              _(), d.removeEvent(h);
            };
          }
          return o[h] = u, h;
        }
        return !1;
      }, d.removeEvent = function(u) {
        delete o[u];
      }, d.clear = function() {
        o = {};
      }, d;
    }(this)), a && a.thisObject && (i = i.bind(a.thisObject));
    var r = e + ":" + n.listeners[e].addEvent(i, a);
    return a && a.id && (r = a.id), r;
  }, t.attachAll = function(e) {
    this.attachEvent("listen_all", e);
  }, t.callEvent = function(e, i) {
    if (n._silent_mode) return !0;
    var a = "ev_" + e.toLowerCase(), r = n.listeners;
    return r.ev_listen_all && r.ev_listen_all.apply(this, [e].concat(i)), !r[a] || r[a].apply(this, i);
  }, t.checkEvent = function(e) {
    return !!n.listeners["ev_" + e.toLowerCase()];
  }, t.detachEvent = function(e) {
    if (e) {
      var i = n.listeners;
      for (var a in i) i[a].removeEvent(e);
      var r = e.split(":");
      if (i = n.listeners, r.length === 2) {
        var s = r[0], o = r[1];
        i[s] && i[s].removeEvent(o);
      }
    }
  }, t.detachAllEvents = function() {
    for (var e in n.listeners) n.listeners[e].clear();
  };
}
class vi {
  constructor(n, e, i) {
    var a;
    this._el = document.createElement("div"), this.defaultRender = (r, s) => {
      this._el || (this._el = document.createElement("div"));
      const o = this._el, l = Math.min(r.relative.top, s.relative.top), d = Math.max(r.relative.top, s.relative.top), u = Math.min(r.relative.left, s.relative.left), c = Math.max(r.relative.left, s.relative.left);
      if (this._singleRow) {
        const h = this._getTaskPositionByTop(this._startPoint.relative.top);
        o.style.height = h.height + "px", o.style.top = h.top + "px";
      } else o.style.height = Math.abs(d - l) + "px", o.style.top = l + "px";
      return o.style.width = Math.abs(c - u) + "px", o.style.left = u + "px", o;
    }, this._gantt = e, this._view = i, this._viewPort = n.viewPort, this._el.classList.add(n.className), typeof n.callback == "function" && (this._callback = n.callback), this.render = () => {
      let r;
      r = n.render ? n.render(this._startPoint, this._endPoint) : this.defaultRender(this._startPoint, this._endPoint), r !== this._el && (this._el && this._el.parentNode && this._el.parentNode.removeChild(this._el), this._el = r), n.className !== "" && this._el.classList.add(n.className), this.draw();
    }, (a = this._viewPort).attachEvent && a.detachEvent || _t(this._viewPort), this._singleRow = n.singleRow, this._useRequestAnimationFrame = n.useRequestAnimationFrame;
  }
  draw() {
    if (this._useRequestAnimationFrame) return requestAnimationFrame(() => {
      this._viewPort.appendChild(this.getElement());
    });
    this._viewPort.appendChild(this.getElement());
  }
  clear() {
    if (this._useRequestAnimationFrame) return requestAnimationFrame(() => {
      this._el.parentNode && this._viewPort.removeChild(this._el);
    });
    this._el.parentNode && this._viewPort.removeChild(this._el);
  }
  getElement() {
    return this._el;
  }
  getViewPort() {
    return this._viewPort;
  }
  setStart(n) {
    const e = this._gantt;
    this._startPoint = n, this._startDate = e.dateFromPos(this._startPoint.relative.left), this._viewPort.callEvent("onBeforeDrag", [this._startPoint]);
  }
  setEnd(n) {
    const e = this._gantt;
    if (this._endPoint = n, this._singleRow) {
      const i = this._getTaskPositionByTop(this._startPoint.relative.top);
      this._endPoint.relative.top = i.top;
    }
    this._endDate = e.dateFromPos(this._endPoint.relative.left), this._startPoint.relative.left > this._endPoint.relative.left && (this._positionPoint = { relative: { left: this._endPoint.relative.left, top: this._positionPoint.relative.top }, absolute: { left: this._endPoint.absolute.left, top: this._positionPoint.absolute.top } }), this._startPoint.relative.top > this._endPoint.relative.top && (this._positionPoint = { relative: { left: this._positionPoint.relative.left, top: this._endPoint.relative.top }, absolute: { left: this._positionPoint.absolute.left, top: this._endPoint.absolute.top } }), this._viewPort.callEvent("onDrag", [this._startPoint, this._endPoint]);
  }
  setPosition(n) {
    this._positionPoint = n;
  }
  dragEnd(n) {
    const e = this._gantt;
    n.relative.left < 0 && (n.relative.left = 0), this._viewPort.callEvent("onBeforeDragEnd", [this._startPoint, n]), this.setEnd(n), this._endDate = this._endDate || e.getState().max_date, this._startDate.valueOf() > this._endDate.valueOf() && ([this._startDate, this._endDate] = [this._endDate, this._startDate]), this.clear();
    const i = e.getTaskByTime(this._startDate, this._endDate), a = this._getTasksByTop(this._startPoint.relative.top, this._endPoint.relative.top);
    this._viewPort.callEvent("onDragEnd", [this._startPoint, this._endPoint]), this._callback && this._callback(this._startPoint, this._endPoint, this._startDate, this._endDate, i, a);
  }
  getInBounds() {
    return this._singleRow;
  }
  _getTasksByTop(n, e) {
    const i = this._gantt;
    let a = n, r = e;
    n > e && (a = e, r = n);
    const s = this._getTaskPositionByTop(a).index, o = this._getTaskPositionByTop(r).index, l = [];
    for (let d = s; d <= o; d++)
      i.getTaskByIndex(d) && l.push(i.getTaskByIndex(d));
    return l;
  }
  _getTaskPositionByTop(n) {
    const e = this._gantt, i = this._view, a = i.getItemIndexByTopPosition(n), r = e.getTaskByIndex(a);
    if (r) {
      const s = i.getItemHeight(r.id);
      return { top: i.getItemTop(r.id) || 0, height: s || 0, index: a };
    }
    {
      const s = i.getTotalHeight();
      return { top: n > s ? s : 0, height: e.config.row_height, index: n > s ? e.getTaskCount() : 0 };
    }
  }
}
let ge = !1;
class te {
  constructor(n) {
    this._mouseDown = !1, this._calculateDirectionVector = () => {
      if (this._trace.length >= 10) {
        const e = this._trace.slice(this._trace.length - 10), i = [];
        for (let r = 1; r < e.length; r++) i.push({ x: e[r].x - e[r - 1].x, y: e[r].y - e[r - 1].y });
        const a = { x: 0, y: 0 };
        return i.forEach((r) => {
          a.x += r.x, a.y += r.y;
        }), { magnitude: Math.sqrt(a.x * a.x + a.y * a.y), angleDegrees: 180 * Math.atan2(Math.abs(a.y), Math.abs(a.x)) / Math.PI };
      }
      return null;
    }, this._applyDndReadyStyles = () => {
      this._timeline.$task.classList.add("gantt_timeline_move_available");
    }, this._clearDndReadyStyles = () => {
      this._timeline.$task.classList.remove("gantt_timeline_move_available");
    }, this._getScrollPosition = (e) => {
      const i = this._gantt;
      return { x: i.$ui.getView(e.$config.scrollX).getScrollState().position, y: i.$ui.getView(e.$config.scrollY).getScrollState().position };
    }, this._countNewScrollPosition = (e) => {
      const i = this._calculateDirectionVector();
      let a = this._startPoint.x - e.x, r = this._startPoint.y - e.y;
      return i && (i.angleDegrees < 15 ? r = 0 : i.angleDegrees > 75 && (a = 0)), { x: this._scrollState.x + a, y: this._scrollState.y + r };
    }, this._setScrollPosition = (e, i) => {
      const a = this._gantt;
      requestAnimationFrame(() => {
        a.scrollLayoutCell(e.$id, i.x, i.y);
      });
    }, this._stopDrag = (e) => {
      const i = this._gantt;
      if (this._trace = [], i.$root.classList.remove("gantt_noselect"), this._originalReadonly !== void 0 && this._mouseDown && (i.config.readonly = this._originalReadonly, i.config.drag_timeline && i.config.drag_timeline.render && i.render()), this._originAutoscroll !== void 0 && (i.config.autoscroll = this._originAutoscroll), i.config.drag_timeline) {
        const { useKey: a } = i.config.drag_timeline;
        if (a && e[a] !== !0) return;
      }
      this._mouseDown = !1, ge = !1;
    }, this._startDrag = (e) => {
      const i = this._gantt;
      this._originAutoscroll = i.config.autoscroll, i.config.autoscroll = !1, ge = !0, i.$root.classList.add("gantt_noselect"), this._originalReadonly = i.config.readonly, i.config.readonly = !0, i.config.drag_timeline && i.config.drag_timeline.render && i.render(), this._trace = [], this._mouseDown = !0;
      const { x: a, y: r } = this._getScrollPosition(this._timeline);
      this._scrollState = { x: a, y: r }, this._startPoint = { x: e.clientX, y: e.clientY }, this._trace.push(this._startPoint);
    }, this._gantt = n, this._domEvents = n._createDomEventScope(), this._trace = [];
  }
  static create(n) {
    return new te(n);
  }
  static _isDragInProgress() {
    return ge;
  }
  destructor() {
    this._domEvents.detachAll();
  }
  attach(n) {
    this._timeline = n;
    const e = this._gantt;
    this._domEvents.attach(n.$task, "mousedown", (i) => {
      if (!e.config.drag_timeline) return;
      const { useKey: a, ignore: r, enabled: s } = e.config.drag_timeline;
      if (s === !1) return;
      let o = ".gantt_task_line, .gantt_task_link";
      r !== void 0 && (o = r instanceof Array ? r.join(", ") : r), o && e.utils.dom.closest(i.target, o) || a && i[a] !== !0 || this._startDrag(i);
    }), this._domEvents.attach(document, "keydown", (i) => {
      if (!e.config.drag_timeline) return;
      const { useKey: a } = e.config.drag_timeline;
      a && i[a] === !0 && this._applyDndReadyStyles();
    }), this._domEvents.attach(document, "keyup", (i) => {
      if (!e.config.drag_timeline) return;
      const { useKey: a } = e.config.drag_timeline;
      a && i[a] === !1 && (this._clearDndReadyStyles(), this._stopDrag(i));
    }), this._domEvents.attach(document, "mouseup", (i) => {
      this._stopDrag(i);
    }), this._domEvents.attach(e.$root, "mouseup", (i) => {
      this._stopDrag(i);
    }), this._domEvents.attach(document, "mouseleave", (i) => {
      this._stopDrag(i);
    }), this._domEvents.attach(e.$root, "mouseleave", (i) => {
      this._stopDrag(i);
    }), this._domEvents.attach(e.$root, "mousemove", (i) => {
      if (!e.config.drag_timeline) return;
      const { useKey: a } = e.config.drag_timeline;
      if (a && i[a] !== !0) return;
      const r = this._gantt.ext.clickDrag, s = (this._gantt.config.click_drag || {}).useKey;
      if ((!r || !s || a || !i[s]) && this._mouseDown === !0) {
        this._trace.push({ x: i.clientX, y: i.clientY });
        const o = this._countNewScrollPosition({ x: i.clientX, y: i.clientY });
        this._setScrollPosition(n, o), this._scrollState = o, this._startPoint = { x: i.clientX, y: i.clientY };
      }
    });
  }
}
var fe, ki = {}.constructor.toString();
function J(t) {
  var n, e;
  if (t && typeof t == "object") switch (!0) {
    case at(t):
      e = new Date(t);
      break;
    case Lt(t):
      for (e = new Array(t.length), n = 0; n < t.length; n++) e[n] = J(t[n]);
      break;
    default:
      if (function(i) {
        return i.constructor.toString() !== ki;
      }(t)) e = Object.create(t);
      else {
        if (function(i) {
          return i.$$typeof && i.$$typeof.toString().includes("react.");
        }(t)) return e = t;
        e = {};
      }
      for (n in t) Object.prototype.hasOwnProperty.apply(t, [n]) && (e[n] = J(t[n]));
  }
  return e || t;
}
function H(t, n, e) {
  for (var i in n) (t[i] === void 0 || e) && (t[i] = n[i]);
  return t;
}
function U(t) {
  return t !== void 0;
}
function ut() {
  return fe || (fe = (/* @__PURE__ */ new Date()).valueOf()), ++fe;
}
function j(t, n) {
  return t.bind ? t.bind(n) : function() {
    return t.apply(n, arguments);
  };
}
function Hn(t, n, e, i) {
  t.addEventListener ? t.addEventListener(n, e, i !== void 0 && i) : t.attachEvent && t.attachEvent("on" + n, e);
}
function On(t, n, e, i) {
  t.removeEventListener ? t.removeEventListener(n, e, i !== void 0 && i) : t.detachEvent && t.detachEvent("on" + n, e);
}
const Bn = Object.freeze(Object.defineProperty({ __proto__: null, bind: j, copy: J, defined: U, event: Hn, eventRemove: On, mixin: H, uid: ut }, Symbol.toStringTag, { value: "Module" }));
function zn(t) {
  var n = t.date;
  return t.$services, { getSum: function(e, i, a) {
    a === void 0 && (a = e.length - 1), i === void 0 && (i = 0);
    for (var r = 0, s = i; s <= a; s++) r += e[s];
    return r;
  }, setSumWidth: function(e, i, a, r) {
    var s = i.width;
    r === void 0 && (r = s.length - 1), a === void 0 && (a = 0);
    var o = r - a + 1;
    if (!(a > s.length - 1 || o <= 0 || r > s.length - 1)) {
      var l = e - this.getSum(s, a, r);
      this.adjustSize(l, s, a, r), this.adjustSize(-l, s, r + 1), i.full_width = this.getSum(s);
    }
  }, splitSize: function(e, i) {
    for (var a = [], r = 0; r < i; r++) a[r] = 0;
    return this.adjustSize(e, a), a;
  }, adjustSize: function(e, i, a, r) {
    a || (a = 0), r === void 0 && (r = i.length - 1);
    for (var s = r - a + 1, o = this.getSum(i, a, r), l = a; l <= r; l++) {
      var d = Math.floor(e * (o ? i[l] / o : 1 / s));
      o -= i[l], e -= d, s--, i[l] += d;
    }
    i[i.length - 1] += e;
  }, sortScales: function(e) {
    function i(r, s) {
      var o = new Date(1970, 0, 1);
      return n.add(o, s, r) - o;
    }
    e.sort(function(r, s) {
      return i(r.unit, r.step) < i(s.unit, s.step) ? 1 : i(r.unit, r.step) > i(s.unit, s.step) ? -1 : 0;
    });
    for (var a = 0; a < e.length; a++) e[a].index = a;
  }, _prepareScaleObject: function(e) {
    var i = e.format;
    return i || (i = e.template || e.date || "%d %M"), typeof i == "string" && (i = t.date.date_to_str(i)), { unit: e.unit || "day", step: e.step || 1, format: i, css: e.css, projection: e.projection || null, column_width: e.column_width || null };
  }, primaryScale: function(e) {
    const i = (e || t.config).scales[0], a = { unit: i.unit, step: i.step, template: i.template, format: i.format, date: i.date, css: i.css || t.templates.scale_cell_class, projection: i.projection || null, column_width: i.column_width || null };
    return this._prepareScaleObject(a);
  }, getAdditionalScales: function(e) {
    return (e || t.config).scales.slice(1).map((function(i) {
      return this._prepareScaleObject(i);
    }).bind(this));
  }, prepareConfigs: function(e, i, a, r, s, o, l) {
    for (var d = this.splitSize(r, e.length), u = a, c = [], h = e.length - 1; h >= 0; h--) {
      var _ = h == e.length - 1, f = this.initScaleConfig(e[h], s, o);
      _ && this.processIgnores(f), _ && f.column_width && (u = f.column_width * (f.display_count || f.count)), this.initColSizes(f, i, u, d[h]), this.limitVisibleRange(f), _ && (u = f.full_width), c.unshift(f);
    }
    for (h = 0; h < c.length - 1; h++) this.alineScaleColumns(c[c.length - 1], c[h]);
    for (h = 0; h < c.length; h++) l && this.reverseScale(c[h]), this.setPosSettings(c[h]);
    return c;
  }, reverseScale: function(e) {
    e.width = e.width.reverse(), e.trace_x = e.trace_x.reverse();
    var i = e.trace_indexes;
    e.trace_indexes = {}, e.trace_index_transition = {}, e.rtl = !0;
    for (var a = 0; a < e.trace_x.length; a++) e.trace_indexes[e.trace_x[a].valueOf()] = a, e.trace_index_transition[i[e.trace_x[a].valueOf()]] = a;
    return e;
  }, setPosSettings: function(e) {
    for (var i = 0, a = e.trace_x.length; i < a; i++) e.left.push((e.width[i - 1] || 0) + (e.left[i - 1] || 0));
  }, _ignore_time_config: function(e, i) {
    if (t.config.skip_off_time) {
      for (var a = !0, r = e, s = 0; s < i.step; s++) s && (r = n.add(e, s, i.unit)), a = a && !this.isWorkTime(r, i.unit);
      return a;
    }
    return !1;
  }, processIgnores: function(e) {
    e.ignore_x = {}, e.display_count = e.count;
  }, initColSizes: function(e, i, a, r) {
    var s = a;
    e.height = r;
    var o = e.display_count === void 0 ? e.count : e.display_count;
    o || (o = 1);
    const l = !isNaN(1 * e.column_width) && 1 * e.column_width > 0;
    if (l) {
      const h = 1 * e.column_width;
      e.col_width = h, s = h * o;
    } else e.col_width = Math.floor(s / o), i && e.col_width < i && (e.col_width = i, s = e.col_width * o);
    e.width = [];
    for (var d = e.ignore_x || {}, u = 0; u < e.trace_x.length; u++) if (d[e.trace_x[u].valueOf()] || e.display_count == e.count) e.width[u] = l ? e.col_width : 0;
    else {
      var c = 1;
      e.unit == "month" && (c = Math.round((n.add(e.trace_x[u], e.step, e.unit) - e.trace_x[u]) / 864e5)), e.width[u] = c;
    }
    l || this.adjustSize(s - this.getSum(e.width), e.width), e.full_width = this.getSum(e.width);
  }, initScaleConfig: function(e, i, a) {
    var r = H({ count: 0, col_width: 0, full_width: 0, height: 0, width: [], left: [], trace_x: [], trace_indexes: {}, min_date: new Date(i), max_date: new Date(a) }, e);
    return this.eachColumn(e.unit, e.step, i, a, function(s) {
      r.count++, r.trace_x.push(new Date(s)), r.trace_indexes[s.valueOf()] = r.trace_x.length - 1;
    }), r.trace_x_ascending = r.trace_x.slice(), r;
  }, iterateScales: function(e, i, a, r, s) {
    for (var o = i.trace_x, l = e.trace_x, d = a || 0, u = r || l.length - 1, c = 0, h = 1; h < o.length; h++) {
      var _ = e.trace_indexes[+o[h]];
      _ !== void 0 && _ <= u && (s && s.apply(this, [c, h, d, _]), d = _, c = h);
    }
  }, alineScaleColumns: function(e, i, a, r) {
    this.iterateScales(e, i, a, r, function(s, o, l, d) {
      var u = this.getSum(e.width, l, d - 1);
      this.getSum(i.width, s, o - 1) != u && this.setSumWidth(u, i, s, o - 1);
    });
  }, eachColumn: function(e, i, a, r, s) {
    var o = new Date(a), l = new Date(r);
    n[e + "_start"] && (o = n[e + "_start"](o));
    var d = new Date(o);
    for (+d >= +l && (l = n.add(d, i, e)); +d < +l; ) {
      s.call(this, new Date(d));
      var u = d.getTimezoneOffset();
      d = n.add(d, i, e), d = t._correct_dst_change(d, u, i, e), n[e + "_start"] && (d = n[e + "_start"](d));
    }
  }, limitVisibleRange: function(e) {
    var i = e.trace_x, a = e.width.length - 1, r = 0;
    if (+i[0] < +e.min_date && a != 0) {
      var s = Math.floor(e.width[0] * ((i[1] - e.min_date) / (i[1] - i[0])));
      r += e.width[0] - s, e.width[0] = s, i[0] = new Date(e.min_date);
    }
    var o = i.length - 1, l = i[o], d = n.add(l, e.step, e.unit);
    if (+d > +e.max_date && o > 0 && (s = e.width[o] - Math.floor(e.width[o] * ((d - e.max_date) / (d - l))), r += e.width[o] - s, e.width[o] = s), r) {
      for (var u = this.getSum(e.width), c = 0, h = 0; h < e.width.length; h++) {
        var _ = Math.floor(r * (e.width[h] / u));
        e.width[h] += _, c += _;
      }
      this.adjustSize(r - c, e.width);
    }
  } };
}
function Ve(t) {
  var n = new zn(t);
  return n.processIgnores = function(e) {
    var i = e.count;
    if (e.ignore_x = {}, t.ignore_time || t.config.skip_off_time) {
      var a = t.ignore_time || function() {
        return !1;
      };
      i = 0;
      for (var r = 0; r < e.trace_x.length; r++) a.call(t, e.trace_x[r]) || this._ignore_time_config.call(t, e.trace_x[r], e) ? (e.ignore_x[e.trace_x[r].valueOf()] = !0, e.ignored_colls = !0) : i++;
    }
    e.display_count = i;
  }, n;
}
function yi(t) {
  (function() {
    var n = [];
    function e() {
      return !!n.length;
    }
    function i(d) {
      setTimeout(function() {
        e() || t.$destroyed || t.focus();
      }, 1);
    }
    function a(d) {
      t.eventRemove(d, "keydown", s), t.event(d, "keydown", s), n.push(d);
    }
    function r() {
      var d = n.pop();
      d && t.eventRemove(d, "keydown", s), i();
    }
    function s(d) {
      var u = d.currentTarget;
      u == n[n.length - 1] && t.$keyboardNavigation.trapFocus(u, d);
    }
    function o() {
      a(t.getLightbox());
    }
    t.attachEvent("onLightbox", o), t.attachEvent("onAfterLightbox", r), t.attachEvent("onLightboxChange", function() {
      r(), o();
    }), t.attachEvent("onAfterQuickInfo", function() {
      i();
    }), t.attachEvent("onMessagePopup", function(d) {
      l = t.utils.dom.getActiveElement(), a(d);
    }), t.attachEvent("onAfterMessagePopup", function() {
      r(), setTimeout(function() {
        l && l.focus && (l.focus(), l = null);
      }, 1);
    });
    var l = null;
    t.$keyboardNavigation.isModal = e;
  })();
}
class bi {
  constructor(n) {
    this.show = (e, i) => {
      i === void 0 ? this._showForTask(e) : this._showAtCoordinates(e, i);
    }, this.hide = (e) => {
      const i = this._gantt, a = this._quickInfoBox;
      this._quickInfoBoxId = 0;
      const r = this._quickInfoTask;
      if (this._quickInfoTask = null, a && a.parentNode) {
        if (i.config.quick_info_detached) return i.callEvent("onAfterQuickInfo", [r]), a.parentNode.removeChild(a);
        a.className += " gantt_qi_hidden", a.style.right === "auto" ? a.style.left = "-350px" : a.style.right = "-350px", e && (a.style.left = a.style.right = "", a.parentNode.removeChild(a)), i.callEvent("onAfterQuickInfo", [r]);
      }
    }, this.getNode = () => this._quickInfoBox ? this._quickInfoBox : null, this.setContainer = (e) => {
      e && (this._container = typeof e == "string" ? document.getElementById(e) : e);
    }, this.setContent = (e) => {
      const i = this._gantt, a = { taskId: null, header: { title: "", date: "" }, content: "", buttons: i.config.quickinfo_buttons };
      e || (e = a), e.taskId || (e.taskId = a.taskId), e.header || (e.header = a.header), e.header.title || (e.header.title = a.header.title), e.header.date || (e.header.date = a.header.date), e.content || (e.content = a.content), e.buttons || (e.buttons = a.buttons);
      let r = this.getNode();
      r || (r = this._createQuickInfoElement()), e.taskId && (this._quickInfoBoxId = e.taskId);
      const s = r.querySelector(".gantt_cal_qi_title"), o = s.querySelector(".gantt_cal_qi_tcontent"), l = s.querySelector(".gantt_cal_qi_tdate"), d = r.querySelector(".gantt_cal_qi_content"), u = r.querySelector(".gantt_cal_qi_controls");
      i._waiAria.quickInfoHeader(r, [e.header.title, e.header.date].join(" ")), o.innerHTML = `<span>${e.header.title}</span>`, l.innerHTML = e.header.date, e.header.title || e.header.date ? s.style.display = "" : s.style.display = "none", d.innerHTML = e.content;
      const c = e.buttons;
      c.length ? u.style.display = "" : u.style.display = "none";
      let h = "";
      for (let _ = 0; _ < c.length; _++) {
        const f = i._waiAria.quickInfoButtonAttrString(i.locale.labels[c[_]]);
        h += `<div class="gantt_qi_big_icon ${c[_]} dhx_gantt_${c[_]}" title="${i.locale.labels[c[_]]}" ${f}>
            <div class='dhx_menu_icon dhx_gantt_icon ${c[_]} gantt_menu_icon dhx_gantt_${c[_]}'></div>
            <div>${i.locale.labels[c[_]]}</div>
         </div>`;
      }
      u.innerHTML = h, i.eventRemove(r, "click", this._qiButtonClickHandler), i.eventRemove(r, "keypress", this._qiKeyPressHandler), i.event(r, "click", this._qiButtonClickHandler), i.event(r, "keypress", this._qiKeyPressHandler);
    }, this._qiButtonClickHandler = (e) => {
      this._qi_button_click(e.target);
    }, this._qiKeyPressHandler = (e) => {
      const i = e.which;
      i !== 13 && i !== 32 || setTimeout(() => {
        this._qi_button_click(e.target);
      }, 1);
    }, this._gantt = n;
  }
  _showAtCoordinates(n, e) {
    this.hide(!0), this._quickInfoBoxId = 0, this._quickInfoTask = null, this._quickInfoBox || (this._createQuickInfoElement(), this.setContent()), this._appendAtCoordinates(n, e), this._gantt.callEvent("onQuickInfo", [null]);
  }
  _showForTask(n) {
    const e = this._gantt;
    if (n === this._quickInfoBoxId && e.utils.dom.isChildOf(this._quickInfoBox, document.body) || !e.config.show_quick_info) return;
    this.hide(!0);
    const i = this._getContainer(), a = this._get_event_counter_part(n, 6, i.xViewport, i.yViewport);
    a && (this._quickInfoBox = this._init_quick_info(n), this._quickInfoTask = n, this._quickInfoBox.className = this._prepare_quick_info_classname(n), this._fill_quick_data(n), this._show_quick_info(a, 6), e.callEvent("onQuickInfo", [n]));
  }
  _get_event_counter_part(n, e, i, a) {
    const r = this._gantt;
    let s = r.getTaskNode(n);
    if (!s && (s = r.getTaskRowNode(n), !s)) return null;
    let o = 0;
    const l = e + s.offsetTop + s.offsetHeight;
    let d = s;
    if (r.utils.dom.isChildOf(d, i)) for (; d && d !== i; ) o += d.offsetLeft, d = d.offsetParent;
    const u = r.getScrollState();
    return d ? { left: o, top: l, dx: o + s.offsetWidth / 2 - u.x > i.offsetWidth / 2 ? 1 : 0, dy: l + s.offsetHeight / 2 - u.y > a.offsetHeight / 2 ? 1 : 0, width: s.offsetWidth, height: s.offsetHeight } : null;
  }
  _createQuickInfoElement() {
    const n = this._gantt, e = document.createElement("div");
    e.className += "gantt_cal_quick_info", n._waiAria.quickInfoAttr(e);
    var i = `
		<div class="gantt_cal_qi_tcontrols">
			<a class="gantt_cal_qi_close_btn dhx_gantt_icon dhx_gantt_icon_close"></a>
		</div>
		<div class="gantt_cal_qi_title" ${n._waiAria.quickInfoHeaderAttrString()}>
				
				<div class="gantt_cal_qi_tcontent"></div>
				<div class="gantt_cal_qi_tdate"></div>
			</div>
			<div class="gantt_cal_qi_content"></div>`;
    if (i += '<div class="gantt_cal_qi_controls">', i += "</div>", e.innerHTML = i, n.config.quick_info_detached) {
      const a = this._getContainer();
      n.event(a.parent, "scroll", () => {
        this.hide();
      });
    }
    return this._quickInfoBox = e, e;
  }
  _init_quick_info(n) {
    const e = this._gantt, i = e.getTask(n);
    return typeof this._quickInfoReadonly == "boolean" && e.isReadonly(i) !== this._quickInfoReadonly && (this.hide(!0), this._quickInfoBox = null), this._quickInfoReadonly = e.isReadonly(i), this._quickInfoBox || (this._quickInfoBox = this._createQuickInfoElement()), this._quickInfoBox;
  }
  _prepare_quick_info_classname(n) {
    const e = this._gantt, i = e.getTask(n);
    let a = `gantt_cal_quick_info gantt_${e.getTaskType(i)}`;
    const r = e.templates.quick_info_class(i.start_date, i.end_date, i);
    return r && (a += " " + r), a;
  }
  _fill_quick_data(n) {
    const e = this._gantt, i = e.getTask(n);
    this._quickInfoBoxId = n;
    let a = [];
    if (this._quickInfoReadonly) {
      const r = e.config.quickinfo_buttons, s = { icon_delete: !0, icon_edit: !0 };
      for (let o = 0; o < r.length; o++) this._quickInfoReadonly && s[r[o]] || a.push(r[o]);
    } else a = e.config.quickinfo_buttons;
    this.setContent({ header: { title: e.templates.quick_info_title(i.start_date, i.end_date, i), date: e.templates.quick_info_date(i.start_date, i.end_date, i) }, content: e.templates.quick_info_content(i.start_date, i.end_date, i), buttons: a });
  }
  _appendAtCoordinates(n, e) {
    const i = this._quickInfoBox, a = this._getContainer();
    i.parentNode && i.parentNode.nodeName.toLowerCase() !== "#document-fragment" || a.parent.appendChild(i), i.style.left = n + "px", i.style.top = e + "px";
  }
  _show_quick_info(n, e) {
    const i = this._gantt, a = this._quickInfoBox;
    if (i.config.quick_info_detached) {
      const r = this._getContainer();
      a.parentNode && a.parentNode.nodeName.toLowerCase() !== "#document-fragment" || r.parent.appendChild(a);
      const s = a.offsetWidth, o = a.offsetHeight, l = i.getScrollState(), d = r.xViewport, u = r.yViewport, c = d.offsetWidth + l.x - s, h = n.top - l.y + o;
      let _ = n.top;
      h > u.offsetHeight / 2 && (_ = n.top - (o + n.height + 2 * e), _ < l.y && h <= u.offsetHeight && (_ = n.top)), _ < l.y && (_ = l.y);
      const f = Math.min(Math.max(l.x, n.left - n.dx * (s - n.width)), c), v = _;
      this._appendAtCoordinates(f, v);
    } else a.style.top = "20px", n.dx === 1 ? (a.style.right = "auto", a.style.left = "-300px", setTimeout(() => {
      a.style.left = "10px";
    }, 1)) : (a.style.left = "auto", a.style.right = "-300px", setTimeout(() => {
      a.style.right = "10px";
    }, 1)), a.className += " gantt_qi_" + (n.dx === 1 ? "left" : "right"), i.$root.appendChild(a);
  }
  _qi_button_click(n) {
    const e = this._gantt, i = this._quickInfoBox;
    if (!n || n === i) return;
    if (n.closest(".gantt_cal_qi_close_btn")) return void this.hide();
    const a = n.className;
    if (a.indexOf("_icon") !== -1) {
      const r = this._quickInfoBoxId;
      e.$click.buttons[a.split(" ")[1].replace("icon_", "")](r);
    } else this._qi_button_click(n.parentNode);
  }
  _getContainer() {
    const n = this._gantt;
    let e = this._container ? this._container : n.$task_data;
    return e && e.offsetHeight && e.offsetWidth ? { parent: e, xViewport: n.$task, yViewport: n.$task_data } : (e = this._container ? this._container : n.$grid_data, e && e.offsetHeight && e.offsetWidth ? { parent: e, xViewport: n.$grid, yViewport: n.$grid_data } : { parent: this._container ? this._container : n.$layout, xViewport: n.$layout, yViewport: n.$layout });
  }
}
function ue(t, n) {
  t = t || Hn, n = n || On;
  var e = [], i = { attach: function(a, r, s, o) {
    e.push({ element: a, event: r, callback: s, capture: o }), t(a, r, s, o);
  }, detach: function(a, r, s, o) {
    n(a, r, s, o);
    for (var l = 0; l < e.length; l++) {
      var d = e[l];
      d.element === a && d.event === r && d.callback === s && d.capture === o && (e.splice(l, 1), l--);
    }
  }, detachAll: function() {
    for (var a = e.slice(), r = 0; r < a.length; r++) {
      var s = a[r];
      i.detach(s.element, s.event, s.callback, s.capture), i.detach(s.element, s.event, s.callback, void 0), i.detach(s.element, s.event, s.callback, !1), i.detach(s.element, s.event, s.callback, !0);
    }
    e.splice(0, e.length);
  }, extend: function() {
    return ue(this.event, this.eventRemove);
  } };
  return i;
}
class $i {
  constructor(n) {
    this._gantt = n;
  }
  getNode() {
    const n = this._gantt;
    return this._tooltipNode || (this._tooltipNode = document.createElement("div"), this._tooltipNode.className = "gantt_tooltip", n._waiAria.tooltipAttr(this._tooltipNode)), this._tooltipNode;
  }
  setViewport(n) {
    return this._root = n, this;
  }
  show(n, e) {
    const i = this._gantt, a = document.body, r = this.getNode();
    if (Z(r, a) || (this.hide(), r.style.top = r.style.top || "0px", r.style.left = r.style.left || "0px", a.appendChild(r)), this._isLikeMouseEvent(n)) {
      const s = this._calculateTooltipPosition(n);
      e = s.top, n = s.left;
    }
    return r.style.top = e + "px", r.style.left = n + "px", i._waiAria.tooltipVisibleAttr(r), this;
  }
  hide() {
    const n = this._gantt, e = this.getNode();
    return e && e.parentNode && e.parentNode.removeChild(e), n._waiAria.tooltipHiddenAttr(e), this;
  }
  setContent(n) {
    return this.getNode().innerHTML = n, this;
  }
  _isLikeMouseEvent(n) {
    return !(!n || typeof n != "object") && "clientX" in n && "clientY" in n;
  }
  _getViewPort() {
    return this._root || document.body;
  }
  _calculateTooltipPosition(n) {
    const e = this._gantt, i = this._getViewPortSize(), a = this.getNode(), r = { top: 0, left: 0, width: a.offsetWidth, height: a.offsetHeight, bottom: 0, right: 0 }, s = e.config.tooltip_offset_x, o = e.config.tooltip_offset_y, l = document.body, d = dt(n, l), u = Y(l);
    d.y += u.y, r.top = d.y, r.left = d.x, r.top += o, r.left += s, r.bottom = r.top + r.height, r.right = r.left + r.width;
    const c = window.scrollY + l.scrollTop;
    return r.top < i.top - c ? (r.top = i.top, r.bottom = r.top + r.height) : r.bottom > i.bottom && (r.bottom = i.bottom, r.top = r.bottom - r.height), r.left < i.left ? (r.left = i.left, r.right = i.left + r.width) : r.right > i.right && (r.right = i.right, r.left = r.right - r.width), d.x >= r.left && d.x <= r.right && (r.left = d.x - r.width - s, r.right = r.left + r.width), d.y >= r.top && d.y <= r.bottom && (r.top = d.y - r.height - o, r.bottom = r.top + r.height), r.left < 0 && (r.left = 0), r.right < 0 && (r.right = 0), r;
  }
  _getViewPortSize() {
    const n = this._gantt, e = this._getViewPort();
    let i, a = e, r = window.scrollY + document.body.scrollTop, s = window.scrollX + document.body.scrollLeft;
    return e === n.$task_data ? (a = n.$task, r = 0, s = 0, i = Y(n.$task)) : i = Y(a), { left: i.x + s, top: i.y + r, width: i.width, height: i.height, bottom: i.y + i.height + r, right: i.x + i.width + s };
  }
}
class xi {
  constructor(n) {
    this._listeners = {}, this.tooltip = new $i(n), this._gantt = n, this._domEvents = ue(), this._initDelayedFunctions();
  }
  destructor() {
    this.tooltip.hide(), this._domEvents.detachAll();
  }
  hideTooltip() {
    this.delayHide();
  }
  attach(n) {
    let e = document.body;
    const i = this._gantt;
    n.global || (e = i.$root);
    let a = null;
    const r = (s) => {
      const o = Dt(s), l = ct(o, n.selector);
      if (Z(o, this.tooltip.getNode())) return;
      const d = () => {
        a = l, n.onmouseenter(s, l);
      };
      a ? l && l === a ? n.onmousemove(s, l) : (n.onmouseleave(s, a), a = null, l && l !== a && d()) : l && d();
    };
    this.detach(n.selector), this._domEvents.attach(e, "mousemove", r), this._listeners[n.selector] = { node: e, handler: r };
  }
  detach(n) {
    const e = this._listeners[n];
    e && this._domEvents.detach(e.node, "mousemove", e.handler);
  }
  tooltipFor(n) {
    const e = (i) => {
      let a = i;
      return document.createEventObject && !document.createEvent && (a = document.createEventObject(i)), a;
    };
    this._initDelayedFunctions(), this.attach({ selector: n.selector, global: n.global, onmouseenter: (i, a) => {
      const r = n.html(i, a);
      r && this.delayShow(e(i), r);
    }, onmousemove: (i, a) => {
      const r = n.html(i, a);
      r ? this.delayShow(e(i), r) : (this.delayShow.$cancelTimeout(), this.delayHide());
    }, onmouseleave: () => {
      this.delayShow.$cancelTimeout(), this.delayHide();
    } });
  }
  _initDelayedFunctions() {
    const n = this._gantt;
    this.delayShow && this.delayShow.$cancelTimeout(), this.delayHide && this.delayHide.$cancelTimeout(), this.tooltip.hide(), this.delayShow = Qt((e, i) => {
      n.callEvent("onBeforeTooltip", [e]) === !1 ? this.tooltip.hide() : (this.tooltip.setContent(i), this.tooltip.show(e));
    }, n.config.tooltip_timeout || 1), this.delayHide = Qt(() => {
      this.delayShow.$cancelTimeout(), this.tooltip.hide();
    }, n.config.tooltip_hide_timeout || 1);
  }
}
const nn = { onBeforeUndo: "onAfterUndo", onBeforeRedo: "onAfterRedo" }, an = ["onTaskDragStart", "onAfterTaskUpdate", "onAfterParentExpand", "onAfterTaskDelete", "onBeforeBatchUpdate"];
class wi {
  constructor(n, e) {
    this._batchAction = null, this._batchMode = !1, this._ignore = !1, this._ignoreMoveEvents = !1, this._initialTasks = {}, this._initialLinks = {}, this._nestedTasks = {}, this._nestedLinks = {}, this._undo = n, this._gantt = e, this._attachEvents();
  }
  store(n, e, i = !1) {
    return e === this._gantt.config.undo_types.task ? this._storeTask(n, i) : e === this._gantt.config.undo_types.link && this._storeLink(n, i);
  }
  isMoveEventsIgnored() {
    return this._ignoreMoveEvents;
  }
  toggleIgnoreMoveEvents(n) {
    this._ignoreMoveEvents = n || !1;
  }
  startIgnore() {
    this._ignore = !0;
  }
  stopIgnore() {
    this._ignore = !1;
  }
  startBatchAction() {
    this._timeout || (this._timeout = setTimeout(() => {
      this.stopBatchAction(), this._timeout = null;
    }, 10)), this._ignore || this._batchMode || (this._batchMode = !0, this._batchAction = this._undo.action.create());
  }
  stopBatchAction() {
    if (this._ignore) return;
    const n = this._undo;
    this._batchAction && n.logAction(this._batchAction), this._batchMode = !1, this._batchAction = null;
  }
  onTaskAdded(n) {
    this._ignore || this._storeTaskCommand(n, this._undo.command.type.add);
  }
  onTaskUpdated(n) {
    this._ignore || this._storeTaskCommand(n, this._undo.command.type.update);
  }
  onTaskMoved(n) {
    this._ignore || (n.$local_index = this._gantt.getTaskIndex(n.id), this._storeEntityCommand(n, this.getInitialTask(n.id), this._undo.command.type.move, this._undo.command.entity.task));
  }
  onTaskDeleted(n) {
    if (!this._ignore) {
      if (this._storeTaskCommand(n, this._undo.command.type.remove), this._nestedTasks[n.id]) {
        const e = this._nestedTasks[n.id];
        for (let i = 0; i < e.length; i++) this._storeTaskCommand(e[i], this._undo.command.type.remove);
      }
      if (this._nestedLinks[n.id]) {
        const e = this._nestedLinks[n.id];
        for (let i = 0; i < e.length; i++) this._storeLinkCommand(e[i], this._undo.command.type.remove);
      }
    }
  }
  onLinkAdded(n) {
    this._ignore || this._storeLinkCommand(n, this._undo.command.type.add);
  }
  onLinkUpdated(n) {
    this._ignore || this._storeLinkCommand(n, this._undo.command.type.update);
  }
  onLinkDeleted(n) {
    this._ignore || this._storeLinkCommand(n, this._undo.command.type.remove);
  }
  setNestedTasks(n, e) {
    const i = this._gantt;
    let a = null;
    const r = [];
    let s = this._getLinks(i.getTask(n));
    for (let d = 0; d < e.length; d++) a = this.setInitialTask(e[d]), s = s.concat(this._getLinks(a)), r.push(a);
    const o = {};
    for (let d = 0; d < s.length; d++) o[s[d]] = !0;
    const l = [];
    for (const d in o) l.push(this.setInitialLink(d));
    this._nestedTasks[n] = r, this._nestedLinks[n] = l;
  }
  setInitialTask(n, e) {
    const i = this._gantt;
    if (e || !this._initialTasks[n] || !this._batchMode) {
      const a = i.copy(i.getTask(n));
      a.$index = i.getGlobalTaskIndex(n), a.$local_index = i.getTaskIndex(n), this.setInitialTaskObject(n, a);
    }
    return this._initialTasks[n];
  }
  getInitialTask(n) {
    return this._initialTasks[n];
  }
  clearInitialTasks() {
    this._initialTasks = {};
  }
  setInitialTaskObject(n, e) {
    this._initialTasks[n] = e;
  }
  setInitialLink(n, e) {
    return this._initialLinks[n] && this._batchMode || (this._initialLinks[n] = this._gantt.copy(this._gantt.getLink(n))), this._initialLinks[n];
  }
  getInitialLink(n) {
    return this._initialLinks[n];
  }
  clearInitialLinks() {
    this._initialLinks = {};
  }
  _attachEvents() {
    let n = null;
    const e = this._gantt, i = () => {
      n || (n = setTimeout(() => {
        n = null;
      }), this.clearInitialTasks(), e.eachTask((l) => {
        this.setInitialTask(l.id);
      }), this.clearInitialLinks(), e.getLinks().forEach((l) => {
        this.setInitialLink(l.id);
      }));
    }, a = (l) => e.copy(e.getTask(l));
    for (const l in nn) e.attachEvent(l, () => (this.startIgnore(), !0)), e.attachEvent(nn[l], () => (this.stopIgnore(), !0));
    for (let l = 0; l < an.length; l++) e.attachEvent(an[l], () => (this.startBatchAction(), !0));
    e.attachEvent("onParse", () => {
      this._undo.clearUndoStack(), this._undo.clearRedoStack(), i();
    }), e.attachEvent("onAfterTaskAdd", (l, d) => {
      this.setInitialTask(l, !0), this.onTaskAdded(d);
    }), e.attachEvent("onAfterTaskUpdate", (l, d) => {
      this.onTaskUpdated(d);
    }), e.attachEvent("onAfterParentExpand", (l, d) => {
      this.onTaskUpdated(d);
    }), e.attachEvent("onAfterTaskDelete", (l, d) => {
      this.onTaskDeleted(d);
    }), e.attachEvent("onAfterLinkAdd", (l, d) => {
      this.setInitialLink(l, !0), this.onLinkAdded(d);
    }), e.attachEvent("onAfterLinkUpdate", (l, d) => {
      this.onLinkUpdated(d);
    }), e.attachEvent("onAfterLinkDelete", (l, d) => {
      this.onLinkDeleted(d);
    }), e.attachEvent("onRowDragEnd", (l, d) => (this.onTaskMoved(a(l)), this.toggleIgnoreMoveEvents(), !0)), e.attachEvent("onBeforeTaskDelete", (l) => {
      this.store(l, e.config.undo_types.task);
      const d = [];
      return i(), e.eachTask((u) => {
        d.push(u.id);
      }, l), this.setNestedTasks(l, d), !0;
    });
    const r = e.getDatastore("task");
    r.attachEvent("onBeforeItemMove", (l, d, u) => (this.isMoveEventsIgnored() || i(), !0)), r.attachEvent("onAfterItemMove", (l, d, u) => (this.isMoveEventsIgnored() || this.onTaskMoved(a(l)), !0)), e.attachEvent("onRowDragStart", (l, d, u) => (this.toggleIgnoreMoveEvents(!0), i(), !0));
    let s = null, o = !1;
    if (e.attachEvent("onBeforeTaskDrag", (l) => {
      if (s = e.getState().drag_id, s === l) {
        const d = e.getTask(l);
        e.isSummaryTask(d) && e.config.drag_project && (o = !0);
      }
      if (e.plugins().multiselect) {
        const d = e.getSelectedTasks();
        d.length > 1 && d.forEach((u) => {
          this.store(u, e.config.undo_types.task, !0);
        });
      }
      return this.store(l, e.config.undo_types.task);
    }), e.attachEvent("onAfterTaskDrag", (l) => {
      (o || e.plugins().multiselect && e.getSelectedTasks().length > 1) && s === l && (o = !1, s = null, this.stopBatchAction()), this.store(l, e.config.undo_types.task, !0);
    }), e.attachEvent("onLightbox", (l) => this.store(l, e.config.undo_types.task)), e.attachEvent("onBeforeTaskAutoSchedule", (l) => (this.store(l.id, e.config.undo_types.task, !0), !0)), e.ext.inlineEditors) {
      let l = null, d = null;
      e.attachEvent("onGanttLayoutReady", () => {
        l && e.ext.inlineEditors.detachEvent(l), d && e.ext.inlineEditors.detachEvent(d), d = e.ext.inlineEditors.attachEvent("onEditStart", (u) => {
          e.$data.tempAssignmentsStore && e._lightbox_id || this.store(u.id, e.config.undo_types.task);
        }), l = e.ext.inlineEditors.attachEvent("onBeforeEditStart", (u) => (this.stopBatchAction(), !0));
      });
    }
  }
  _storeCommand(n) {
    const e = this._undo;
    if (e.updateConfigs(), e.undoEnabled) if (this._batchMode) this._batchAction.commands.push(n);
    else {
      const i = e.action.create([n]);
      e.logAction(i);
    }
  }
  _storeEntityCommand(n, e, i, a) {
    const r = this._undo.command.create(n, e, i, a);
    this._storeCommand(r);
  }
  _storeTaskCommand(n, e) {
    this._gantt.isTaskExists(n.id) && (n.$local_index = this._gantt.getTaskIndex(n.id)), this._storeEntityCommand(n, this.getInitialTask(n.id), e, this._undo.command.entity.task);
  }
  _storeLinkCommand(n, e) {
    this._storeEntityCommand(n, this.getInitialLink(n.id), e, this._undo.command.entity.link);
  }
  _getLinks(n) {
    return n.$source.concat(n.$target);
  }
  _storeTask(n, e = !1) {
    const i = this._gantt;
    return this.setInitialTask(n, e), i.eachTask((a) => {
      this.setInitialTask(a.id);
    }, n), !0;
  }
  _storeLink(n, e = !1) {
    return this.setInitialLink(n, e), !0;
  }
}
class Si {
  constructor(n) {
    this.maxSteps = 100, this.undoEnabled = !0, this.redoEnabled = !0, this.action = { create: (e) => ({ commands: e ? e.slice() : [] }), invert: (e) => {
      const i = this._gantt.copy(e), a = this.command;
      for (let r = 0; r < e.commands.length; r++) {
        const s = i.commands[r] = a.invert(i.commands[r]);
        s.type !== a.type.update && s.type !== a.type.move || ([s.value, s.oldValue] = [s.oldValue, s.value]);
      }
      return i;
    } }, this.command = { entity: null, type: null, create: (e, i, a, r) => {
      const s = this._gantt;
      return { entity: r, type: a, value: s.copy(e), oldValue: s.copy(i || e) };
    }, invert: (e) => {
      const i = this._gantt.copy(e);
      return i.type = this.command.inverseCommands(e.type), i;
    }, inverseCommands: (e) => {
      const i = this._gantt, a = this.command.type;
      switch (e) {
        case a.update:
          return a.update;
        case a.remove:
          return a.add;
        case a.add:
          return a.remove;
        case a.move:
          return a.move;
        default:
          return i.assert(!1, "Invalid command " + e), null;
      }
    } }, this._undoStack = [], this._redoStack = [], this._gantt = n;
  }
  getUndoStack() {
    return this._undoStack;
  }
  setUndoStack(n) {
    this._undoStack = n;
  }
  getRedoStack() {
    return this._redoStack;
  }
  setRedoStack(n) {
    this._redoStack = n;
  }
  clearUndoStack() {
    this._undoStack = [];
  }
  clearRedoStack() {
    this._redoStack = [];
  }
  updateConfigs() {
    const n = this._gantt;
    this.maxSteps = n.config.undo_steps || 100, this.command.entity = n.config.undo_types, this.command.type = n.config.undo_actions, this.undoEnabled = !!n.config.undo, this.redoEnabled = !!n.config.redo;
  }
  undo() {
    const n = this._gantt;
    if (this.updateConfigs(), !this.undoEnabled) return;
    const e = this._pop(this._undoStack);
    if (e && this._reorderCommands(e), n.callEvent("onBeforeUndo", [e]) !== !1 && e) return this._applyAction(this.action.invert(e)), this._push(this._redoStack, n.copy(e)), void n.callEvent("onAfterUndo", [e]);
    n.callEvent("onAfterUndo", [null]);
  }
  redo() {
    const n = this._gantt;
    if (this.updateConfigs(), !this.redoEnabled) return;
    const e = this._pop(this._redoStack);
    if (e && this._reorderCommands(e), n.callEvent("onBeforeRedo", [e]) !== !1 && e) return this._applyAction(e), this._push(this._undoStack, n.copy(e)), void n.callEvent("onAfterRedo", [e]);
    n.callEvent("onAfterRedo", [null]);
  }
  logAction(n) {
    this._push(this._undoStack, n), this._redoStack = [];
  }
  _push(n, e) {
    const i = this._gantt;
    if (!e.commands.length) return;
    const a = n === this._undoStack ? "onBeforeUndoStack" : "onBeforeRedoStack";
    if (i.callEvent(a, [e]) !== !1 && e.commands.length) {
      for (n.push(e); n.length > this.maxSteps; ) n.shift();
      return e;
    }
  }
  _pop(n) {
    return n.pop();
  }
  _reorderCommands(n) {
    const e = { any: 0, link: 1, task: 2 }, i = { move: 1, any: 0 };
    n.commands.sort(function(a, r) {
      if (a.entity === "task" && r.entity === "task") return a.type !== r.type ? (i[r.type] || 0) - (i[a.type] || 0) : a.type === "move" && a.oldValue && r.oldValue && r.oldValue.parent === a.oldValue.parent ? a.oldValue.$index - r.oldValue.$index : 0;
      {
        const s = e[a.entity] || e.any;
        return (e[r.entity] || e.any) - s;
      }
    });
  }
  _applyAction(n) {
    let e = null;
    const i = this.command.entity, a = this.command.type, r = this._gantt, s = {};
    s[i.task] = { add: "addTask", get: "getTask", update: "updateTask", remove: "deleteTask", move: "moveTask", isExists: "isTaskExists" }, s[i.link] = { add: "addLink", get: "getLink", update: "updateLink", remove: "deleteLink", isExists: "isLinkExists" }, r.batchUpdate(function() {
      for (let o = 0; o < n.commands.length; o++) {
        e = n.commands[o];
        const l = s[e.entity][e.type], d = s[e.entity].get, u = s[e.entity].isExists;
        if (e.type === a.add) r[l](e.oldValue, e.oldValue.parent, e.oldValue.$local_index);
        else if (e.type === a.remove) r[u](e.value.id) && r[l](e.value.id);
        else if (e.type === a.update) {
          const c = r[d](e.value.id);
          for (const h in e.value) {
            let _ = !(h.startsWith("$") || h.startsWith("_"));
            ["$open"].indexOf(h) > -1 && (_ = !0), _ && (c[h] = e.value[h]);
          }
          r[l](e.value.id);
        } else e.type === a.move && (r[l](e.value.id, e.value.$local_index, e.value.parent), r.callEvent("onRowDragEnd", [e.value.id]));
      }
    });
  }
}
const Ti = { auto_scheduling: function(t) {
  const { getDefaultAutoSchedulingConfig: n } = Cn(t);
  Xe(t);
  var e = en(t), i = tn(), a = ze.Create(t), r = new di(t, i, a), s = new ci(t, e), o = new ui(t, i, e);
  t.getConnectedGroup = s.getConnectedGroup, t.getConstraintType = a.getConstraintType, t.getConstraintLimitations = function(d) {
    var u = a.processConstraint(d, null);
    return u ? { earliestStart: u.earliestStart || null, earliestEnd: u.earliestEnd || null, latestStart: u.latestStart || null, latestEnd: u.latestEnd || null } : { earliestStart: null, earliestEnd: null, latestStart: null, latestEnd: null };
  }, t.isCircularLink = o.isCircularLink, t.findCycles = o.findCycles, t.config.auto_scheduling = n(), t.config.constraint_types = V;
  var l = !1;
  t.attachEvent("onParse", function() {
    return l = !0, !0;
  }), t.attachEvent("onBeforeGanttRender", function() {
    return l = !1, !0;
  }), t._autoSchedule = function(d, u) {
    if (t.callEvent("onBeforeAutoSchedule", [d]) !== !1) {
      t._autoscheduling_in_progress = !0;
      var c = a.getConstraints(d, t.isTaskExists(d) ? u : null), h = [], _ = i.findLoops(u);
      if (_.length) t.callEvent("onAutoScheduleCircularLink", [_]);
      else {
        (function(v, k) {
          if (!t._getAutoSchedulingConfig().apply_constraints) for (var b = 0; b < k.length; b++) {
            var m = k[b], g = t.getTask(m.target);
            t._getAutoSchedulingConfig().gap_behavior !== "preserve" && m.target != v || (m.preferredStart = new Date(g.start_date));
          }
        })(d, u);
        for (let v = 0; v < u.length; v++) if (u[v].subtaskLink) {
          r._secondIterationRequired = !0, r._secondIteration = !1;
          break;
        }
        var f = r.generatePlan(u, c);
        (function(v) {
          v.length && t.batchUpdate(function() {
            for (var k = 0; k < v.length; k++) t.updateTask(v[k]);
          }, l);
        })(h = r.applyProjectPlan(f));
      }
      t._autoscheduling_in_progress = !1, t.callEvent("onAfterAutoSchedule", [d, h]);
    }
  }, t.autoSchedule = function(d, u) {
    var c;
    u = u === void 0 || !!u, c = d !== void 0 ? t._getAutoSchedulingConfig().apply_constraints ? s.getConnectedGroupRelations(d) : e.getLinkedTasks(d, u) : e.getLinkedTasks(), t._autoSchedule(d, c);
  }, t.attachEvent("onTaskLoading", function(d) {
    return d.constraint_date && typeof d.constraint_date == "string" && (d.constraint_date = t.date.parseDate(d.constraint_date, "parse_date")), d.constraint_type = t.getConstraintType(d), !0;
  }), t.attachEvent("onTaskCreated", function(d) {
    return d.constraint_type = t.getConstraintType(d), !0;
  }), hi(t, e, o, s);
}, click_drag: function(t) {
  t.ext || (t.ext = {});
  const n = { className: "gantt_click_drag_rect", useRequestAnimationFrame: !0, callback: void 0, singleRow: !1 };
  function e() {
    const i = { viewPort: t.$task_data, ...n };
    t.ext.clickDrag && t.ext.clickDrag.destructor(), t.ext.clickDrag = new mi(t);
    const a = t.config.click_drag;
    i.render = a.render || n.render, i.className = a.className || n.className, i.callback = a.callback || n.callback, i.viewPort = a.viewPort || t.$task_data, i.useRequestAnimationFrame = a.useRequestAnimationFrame === void 0 ? n.useRequestAnimationFrame : a.useRequestAnimationFrame, i.singleRow = a.singleRow === void 0 ? n.singleRow : a.singleRow;
    const r = t.$ui.getView("timeline"), s = new vi(i, t, r);
    t.ext.clickDrag.attach(s, a.useKey, a.ignore);
  }
  t.attachEvent("onGanttReady", () => {
    t.config.click_drag && e();
  }), t.attachEvent("onGanttLayoutReady", function() {
    t.$container && t.config.click_drag && t.attachEvent("onGanttRender", function() {
      e();
    }, { once: !0 });
  }), t.attachEvent("onDestroy", () => {
    t.ext.clickDrag && t.ext.clickDrag.destructor();
  });
}, critical_path: function(t) {
  Xe(t);
  var n = function(i) {
    var a = en(i), r = tn(), s = { _freeSlack: {}, _totalSlack: {}, _slackNeedCalculate: !0, _linkedTasksById: {}, _successorsByTaskId: {}, _projectEnd: null, _calculateSlacks: function() {
      var o = a.getLinkedTasks(), l = r.findLoops(o);
      if (l.length) {
        i.callEvent("onAutoScheduleCircularLink", [l]);
        var d = {};
        l.forEach(function(f) {
          f.linkKeys.forEach(function(v) {
            d[v] = !0;
          });
        });
        for (var u = 0; u < o.length; u++) o[u].hashSum in d && (o.splice(u, 1), u--);
      }
      const c = r.topologicalSort(o).reverse(), h = {};
      o.forEach((f) => {
        h[f.source] || (h[f.source] = { linked: [] }), h[f.source].linked.push({ target: f.target, link: f });
      });
      const _ = { _cache: {}, getDist: function(f, v) {
        const k = `${f.id}_${v.id}`;
        if (this._cache[k]) return this._cache[k];
        {
          const b = i.calculateDuration({ start_date: f.end_date, end_date: v.start_date, task: f });
          return this._cache[k] = b, b;
        }
      } };
      this._projectEnd = i.getSubtaskDates().end_date, this._calculateFreeSlack(o, c, h, _), this._calculateTotalSlack(o, c, h, _);
    }, _isCompletedTask: function(o) {
      return i._getAutoSchedulingConfig().use_progress && o.progress == 1;
    }, _calculateFreeSlack: function(o, l, d, u) {
      const c = this._freeSlack = {}, h = {};
      i.eachTask(function(f) {
        i.isSummaryTask(f) || (h[f.id] = f);
      });
      const _ = {};
      o.forEach((f) => {
        const v = h[f.source];
        if (!v) return;
        _[f.source] = !0;
        let k = u.getDist(v, i.getTask(f.target));
        k -= f.lag || 0, c[f.source] !== void 0 ? c[f.source] = Math.min(k, c[f.source]) : c[f.source] = k;
      });
      for (const f in h) {
        if (_[f]) continue;
        const v = h[f];
        this._isCompletedTask(v) || v.unscheduled ? c[v.id] = 0 : c[v.id] = i.calculateDuration({ start_date: v.end_date, end_date: this._projectEnd, task: v });
      }
      return this._freeSlack;
    }, _disconnectedTaskSlack(o) {
      return this._isCompletedTask(o) ? 0 : Math.max(i.calculateDuration(o.end_date, this._projectEnd), 0);
    }, _calculateTotalSlack: function(o, l, d, u) {
      this._totalSlack = {}, this._slackNeedCalculate = !1;
      for (var c = {}, h = i.getTaskByTime(), _ = 0; _ < l.length; _++) {
        const v = i.getTask(l[_]);
        if (this._isCompletedTask(v)) c[v.id] = 0;
        else if (d[v.id] || i.isSummaryTask(v)) {
          const k = d[v.id].linked;
          let b = null;
          for (var f = 0; f < k.length; f++) {
            const m = k[f], g = i.getTask(m.target);
            let p = 0;
            c[g.id] !== void 0 && (p += c[g.id]), p += Math.max(u.getDist(v, g) - m.link.targetLag, 0), p -= m.link.trueLag || 0, b = b === null ? p : Math.min(b, p);
          }
          c[v.id] = b || 0;
        } else c[v.id] = this.getFreeSlack(v);
      }
      return h.forEach((function(v) {
        c[v.id] !== void 0 || i.isSummaryTask(v) || (c[v.id] = this.getFreeSlack(v));
      }).bind(this)), this._totalSlack = c, this._totalSlack;
    }, _resetTotalSlackCache: function() {
      this._slackNeedCalculate = !0;
    }, _shouldCalculateTotalSlack: function() {
      return this._slackNeedCalculate;
    }, getFreeSlack: function(o) {
      return this._shouldCalculateTotalSlack() && this._calculateSlacks(), i.isTaskExists(o.id) ? this._isCompletedTask(o) ? 0 : i.isSummaryTask(o) ? void 0 : this._freeSlack[o.id] || 0 : 0;
    }, getTotalSlack: function(o) {
      if (this._shouldCalculateTotalSlack() && this._calculateSlacks(), o === void 0) return this._totalSlack;
      var l;
      if (l = o.id !== void 0 ? o.id : o, this._isCompletedTask(o)) return 0;
      if (this._totalSlack[l] === void 0) {
        if (i.isSummaryTask(i.getTask(l))) {
          var d = null;
          return i.eachTask((function(u) {
            var c = this._totalSlack[u.id];
            c !== void 0 && (d === null || c < d) && (d = c);
          }).bind(this), l), this._totalSlack[l] = d !== null ? d : i.calculateDuration({ start_date: o.end_date, end_date: this._projectEnd, task: o }), this._totalSlack[l];
        }
        return 0;
      }
      return this._totalSlack[l] || 0;
    }, dropCachedFreeSlack: function() {
      this._freeSlack = {}, this._resetTotalSlackCache();
    }, init: function() {
      function o() {
        s.dropCachedFreeSlack();
      }
      i.attachEvent("onAfterLinkAdd", o), i.attachEvent("onTaskIdChange", o), i.attachEvent("onAfterLinkUpdate", o), i.attachEvent("onAfterLinkDelete", o), i.attachEvent("onAfterTaskAdd", o), i.attachEvent("onAfterTaskUpdate", o), i.attachEvent("onAfterTaskDelete", o), i.attachEvent("onRowDragEnd", o), i.attachEvent("onAfterTaskMove", o), i.attachEvent("onParse", o), i.attachEvent("onClear", o), i.$data.tasksStore.attachEvent("onClearAll", o), i.$data.linksStore.attachEvent("onClearAll", o);
    } };
    return s;
  }(t);
  n.init(), t.getFreeSlack = function(i) {
    return n.getFreeSlack(i);
  }, t.getTotalSlack = function(i) {
    return n.getTotalSlack(i);
  };
  var e = function(i) {
    return i._isProjectEnd = function(a) {
      return !this._hasDuration({ start_date: a.end_date, end_date: this._getProjectEnd(), task: a });
    }, { _cache: {}, _slackHelper: null, reset: function() {
      this._cache = {};
    }, _calculateCriticalPath: function() {
      this.reset();
    }, isCriticalTask: function(a) {
      if (!a) return !1;
      if (i._getAutoSchedulingConfig().use_progress && a.progress === 1) return this._cache[a.id] = !1, !1;
      if (a.unscheduled) return !1;
      if (this._cache[a.id] === void 0) if (i.isSummaryTask(a)) {
        let r = !1;
        i.eachTask((function(s) {
          r || (r = this.isCriticalTask(s));
        }).bind(this), a.id), this._cache[a.id] = r;
      } else this._cache[a.id] = this._slackHelper.getTotalSlack(a) <= 0;
      return this._cache[a.id];
    }, init: function(a) {
      this._slackHelper = a;
      var r = i.bind(function() {
        return this.reset(), !0;
      }, this), s = i.bind(function(l, d) {
        return this._cache && (this._cache[d] = this._cache[l], delete this._cache[l]), !0;
      }, this);
      i.attachEvent("onAfterLinkAdd", r), i.attachEvent("onAfterLinkUpdate", r), i.attachEvent("onAfterLinkDelete", r), i.attachEvent("onAfterTaskAdd", r), i.attachEvent("onTaskIdChange", s), i.attachEvent("onAfterTaskUpdate", r), i.attachEvent("onAfterTaskDelete", r), i.attachEvent("onParse", r), i.attachEvent("onClear", r), i.$data.tasksStore.attachEvent("onClearAll", r), i.$data.linksStore.attachEvent("onClearAll", r);
      var o = function() {
        i.config.highlight_critical_path && !i.getState("batchUpdate").batch_update && i.render();
      };
      i.attachEvent("onAfterLinkAdd", o), i.attachEvent("onAfterLinkUpdate", o), i.attachEvent("onAfterLinkDelete", o), i.attachEvent("onAfterTaskAdd", o), i.attachEvent("onTaskIdChange", function(l, d) {
        return i.config.highlight_critical_path && i.isTaskExists(d) && i.refreshTask(d), !0;
      }), i.attachEvent("onAfterTaskUpdate", o), i.attachEvent("onAfterTaskDelete", o);
    } };
  }(t);
  t.config.highlight_critical_path = !1, e.init(n), t.isCriticalTask = function(i) {
    return t.assert(!(!i || i.id === void 0), "Invalid argument for gantt.isCriticalTask"), e.isCriticalTask(i);
  }, t.isCriticalLink = function(i) {
    return this.isCriticalTask(t.getTask(i.source));
  }, t.getSlack = function(i, a) {
    for (var r = 0, s = [], o = {}, l = 0; l < i.$source.length; l++) o[i.$source[l]] = !0;
    for (l = 0; l < a.$target.length; l++) o[a.$target[l]] && s.push(a.$target[l]);
    if (s[0]) for (l = 0; l < s.length; l++) {
      var d = this.getLink(s[l]), u = this._getSlack(i, a, this._convertToFinishToStartLink(d.id, d, i, a, i.parent, a.parent));
      (r > u || l === 0) && (r = u);
    }
    else r = this._getSlack(i, a, {});
    return r;
  }, t._getSlack = function(i, a, r) {
    var s = this.config.types, o = null;
    o = this.getTaskType(i.type) == s.milestone ? i.start_date : i.end_date;
    var l = a.start_date, d = 0;
    d = +o > +l ? -this.calculateDuration({ start_date: l, end_date: o, task: i }) : this.calculateDuration({ start_date: o, end_date: l, task: i });
    var u = r.lag;
    return u && 1 * u == u && (d -= u), d;
  };
}, drag_timeline: function(t) {
  t.ext || (t.ext = {}), t.ext.dragTimeline = { create: () => te.create(t), _isDragInProgress: () => te._isDragInProgress }, t.config.drag_timeline = { enabled: !0, render: !1 };
}, fullscreen: function(t) {
  function n() {
    const u = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    return !(!u || u !== document.body);
  }
  function e() {
    try {
      return document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled;
    } catch (u) {
      console.error("Fullscreen is not available:", u);
    }
  }
  t.$services.getService("state").registerProvider("fullscreen", () => e() ? { fullscreen: n() } : void 0);
  let i = { overflow: null, padding: null, paddingTop: null, paddingRight: null, paddingBottom: null, paddingLeft: null };
  const a = { width: null, height: null, top: null, left: null, position: null, zIndex: null, modified: !1 };
  let r = null;
  function s(u, c) {
    c.width = u.width, c.height = u.height, c.top = u.top, c.left = u.left, c.position = u.position, c.zIndex = u.zIndex;
  }
  let o = !1;
  function l() {
    if (!t.$container) return;
    let u;
    n() ? o && (u = "onExpand", function() {
      const c = t.ext.fullscreen.getFullscreenElement(), h = document.body;
      s(c.style, a), i = { overflow: h.style.overflow, padding: h.style.padding ? h.style.padding : null, paddingTop: h.style.paddingTop ? h.style.paddingTop : null, paddingRight: h.style.paddingRight ? h.style.paddingRight : null, paddingBottom: h.style.paddingBottom ? h.style.paddingBottom : null, paddingLeft: h.style.paddingLeft ? h.style.paddingLeft : null }, h.style.padding && (h.style.padding = "0"), h.style.paddingTop && (h.style.paddingTop = "0"), h.style.paddingRight && (h.style.paddingRight = "0"), h.style.paddingBottom && (h.style.paddingBottom = "0"), h.style.paddingLeft && (h.style.paddingLeft = "0"), h.style.overflow = "hidden", c.style.width = "100vw", c.style.height = "100vh", c.style.top = "0px", c.style.left = "0px", c.style.position = "absolute", c.style.zIndex = 1, a.modified = !0, r = function(_) {
        let f = _.parentNode;
        const v = [];
        for (; f && f.style; ) v.push({ element: f, originalPositioning: f.style.position }), f.style.position = "static", f = f.parentNode;
        return v;
      }(c);
    }()) : o && (o = !1, u = "onCollapse", function() {
      const c = t.ext.fullscreen.getFullscreenElement(), h = document.body;
      a.modified && (i.padding && (h.style.padding = i.padding), i.paddingTop && (h.style.paddingTop = i.paddingTop), i.paddingRight && (h.style.paddingRight = i.paddingRight), i.paddingBottom && (h.style.paddingBottom = i.paddingBottom), i.paddingLeft && (h.style.paddingLeft = i.paddingLeft), h.style.overflow = i.overflow, i = { overflow: null, padding: null, paddingTop: null, paddingRight: null, paddingBottom: null, paddingLeft: null }, s(a, c.style), a.modified = !1), r.forEach((_) => {
        _.element.style.position = _.originalPositioning;
      }), r = null;
    }()), setTimeout(() => {
      t.render();
    }), setTimeout(() => {
      t.callEvent(u, [t.ext.fullscreen.getFullscreenElement()]);
    });
  }
  function d() {
    return !t.$container || !t.ext.fullscreen.getFullscreenElement() ? !0 : e() ? !1 : ((console.warning || console.log)("The `fullscreen` feature not being allowed, or full-screen mode not being supported"), !0);
  }
  t.ext.fullscreen = { expand() {
    if (d() || n() || !t.callEvent("onBeforeExpand", [this.getFullscreenElement()])) return;
    o = !0;
    const u = document.body, c = u.webkitRequestFullscreen ? [Element.ALLOW_KEYBOARD_INPUT] : [], h = u.msRequestFullscreen || u.mozRequestFullScreen || u.webkitRequestFullscreen || u.requestFullscreen;
    h && h.apply(u, c);
  }, collapse() {
    if (d() || !n() || !t.callEvent("onBeforeCollapse", [this.getFullscreenElement()])) return;
    const u = document.msExitFullscreen || document.mozCancelFullScreen || document.webkitExitFullscreen || document.exitFullscreen;
    u && u.apply(document);
  }, toggle() {
    d() || (n() ? this.collapse() : this.expand());
  }, getFullscreenElement: () => t.$root }, t.expand = function() {
    t.ext.fullscreen.expand();
  }, t.collapse = function() {
    t.ext.fullscreen.collapse();
  }, t.attachEvent("onGanttReady", function() {
    t.event(document, "webkitfullscreenchange", l), t.event(document, "mozfullscreenchange", l), t.event(document, "MSFullscreenChange", l), t.event(document, "fullscreenChange", l), t.event(document, "fullscreenchange", l);
  });
}, keyboard_navigation: function(t) {
  (function(n) {
    n.config.keyboard_navigation = !0, n.config.keyboard_navigation_cells = !1, n.$keyboardNavigation = {}, n._compose = function() {
      for (var e = Array.prototype.slice.call(arguments, 0), i = {}, a = 0; a < e.length; a++) {
        var r = e[a];
        for (var s in typeof r == "function" && (r = new r()), r) i[s] = r[s];
      }
      return i;
    }, function(e) {
      e.$keyboardNavigation.shortcuts = { createCommand: function() {
        return { modifiers: { shift: !1, alt: !1, ctrl: !1, meta: !1 }, keyCode: null };
      }, parse: function(i) {
        for (var a = [], r = this.getExpressions(this.trim(i)), s = 0; s < r.length; s++) {
          for (var o = this.getWords(r[s]), l = this.createCommand(), d = 0; d < o.length; d++) this.commandKeys[o[d]] ? l.modifiers[o[d]] = !0 : this.specialKeys[o[d]] ? l.keyCode = this.specialKeys[o[d]] : l.keyCode = o[d].charCodeAt(0);
          a.push(l);
        }
        return a;
      }, getCommandFromEvent: function(i) {
        var a = this.createCommand();
        a.modifiers.shift = !!i.shiftKey, a.modifiers.alt = !!i.altKey, a.modifiers.ctrl = !!i.ctrlKey, a.modifiers.meta = !!i.metaKey, a.keyCode = i.which || i.keyCode, a.keyCode >= 96 && a.keyCode <= 105 && (a.keyCode -= 48);
        var r = String.fromCharCode(a.keyCode);
        return r && (a.keyCode = r.toLowerCase().charCodeAt(0)), a;
      }, getHashFromEvent: function(i) {
        return this.getHash(this.getCommandFromEvent(i));
      }, getHash: function(i) {
        var a = [];
        for (var r in i.modifiers) i.modifiers[r] && a.push(r);
        return a.push(i.keyCode), a.join(this.junctionChar);
      }, getExpressions: function(i) {
        return i.split(this.junctionChar);
      }, getWords: function(i) {
        return i.split(this.combinationChar);
      }, trim: function(i) {
        return i.replace(/\s/g, "");
      }, junctionChar: ",", combinationChar: "+", commandKeys: { shift: 16, alt: 18, ctrl: 17, meta: !0 }, specialKeys: { backspace: 8, tab: 9, enter: 13, esc: 27, space: 32, up: 38, down: 40, left: 37, right: 39, home: 36, end: 35, pageup: 33, pagedown: 34, delete: 46, insert: 45, plus: 107, f1: 112, f2: 113, f3: 114, f4: 115, f5: 116, f6: 117, f7: 118, f8: 119, f9: 120, f10: 121, f11: 122, f12: 123 } };
    }(n), function(e) {
      e.$keyboardNavigation.EventHandler = { _handlers: null, findHandler: function(i) {
        this._handlers || (this._handlers = {});
        var a = e.$keyboardNavigation.shortcuts.getHash(i);
        return this._handlers[a];
      }, doAction: function(i, a) {
        var r = this.findHandler(i);
        if (r) {
          if (e.$keyboardNavigation.facade.callEvent("onBeforeAction", [i, a]) === !1) return;
          r.call(this, a), a.preventDefault ? a.preventDefault() : a.returnValue = !1;
        }
      }, bind: function(i, a) {
        this._handlers || (this._handlers = {});
        for (var r = e.$keyboardNavigation.shortcuts, s = r.parse(i), o = 0; o < s.length; o++) this._handlers[r.getHash(s[o])] = a;
      }, unbind: function(i) {
        for (var a = e.$keyboardNavigation.shortcuts, r = a.parse(i), s = 0; s < r.length; s++) this._handlers[a.getHash(r[s])] && delete this._handlers[a.getHash(r[s])];
      }, bindAll: function(i) {
        for (var a in i) this.bind(a, i[a]);
      }, initKeys: function() {
        this._handlers || (this._handlers = {}), this.keys && this.bindAll(this.keys);
      } };
    }(n), function(e) {
      e.$keyboardNavigation.getFocusableNodes = Vt, e.$keyboardNavigation.trapFocus = function(i, a) {
        if (a.keyCode != 9) return !1;
        for (var r = e.$keyboardNavigation.getFocusableNodes(i), s = Ae(), o = -1, l = 0; l < r.length; l++) if (r[l] == s) {
          o = l;
          break;
        }
        if (a.shiftKey) {
          if (o <= 0) {
            var d = r[r.length - 1];
            if (d) return d.focus(), a.preventDefault(), !0;
          }
        } else if (o >= r.length - 1) {
          var u = r[0];
          if (u) return u.focus(), a.preventDefault(), !0;
        }
        return !1;
      };
    }(n), function(e) {
      e.$keyboardNavigation.GanttNode = function() {
      }, e.$keyboardNavigation.GanttNode.prototype = e._compose(e.$keyboardNavigation.EventHandler, { focus: function() {
        e.focus();
      }, blur: function() {
      }, isEnabled: function() {
        return e.$container.hasAttribute("tabindex");
      }, scrollHorizontal: function(i) {
        var a = e.dateFromPos(e.getScrollState().x), r = e.getScale(), s = i < 0 ? -r.step : r.step;
        a = e.date.add(a, s, r.unit), e.scrollTo(e.posFromDate(a));
      }, scrollVertical: function(i) {
        var a = e.getScrollState().y, r = e.config.row_height;
        e.scrollTo(null, a + (i < 0 ? -1 : 1) * r);
      }, keys: { "alt+left": function(i) {
        this.scrollHorizontal(-1);
      }, "alt+right": function(i) {
        this.scrollHorizontal(1);
      }, "alt+up": function(i) {
        this.scrollVertical(-1);
      }, "alt+down": function(i) {
        this.scrollVertical(1);
      }, "ctrl+z": function() {
        e.undo && e.undo();
      }, "ctrl+r": function() {
        e.redo && e.redo();
      } } }), e.$keyboardNavigation.GanttNode.prototype.bindAll(e.$keyboardNavigation.GanttNode.prototype.keys);
    }(n), function(e) {
      e.$keyboardNavigation.KeyNavNode = function() {
      }, e.$keyboardNavigation.KeyNavNode.prototype = e._compose(e.$keyboardNavigation.EventHandler, { isValid: function() {
        return !0;
      }, fallback: function() {
        return null;
      }, moveTo: function(i) {
        e.$keyboardNavigation.dispatcher.setActiveNode(i);
      }, compareTo: function(i) {
        if (!i) return !1;
        for (var a in this) {
          if (!!this[a] != !!i[a]) return !1;
          var r = !(!this[a] || !this[a].toString), s = !(!i[a] || !i[a].toString);
          if (s != r) return !1;
          if (s && r) {
            if (i[a].toString() != this[a].toString()) return !1;
          } else if (i[a] != this[a]) return !1;
        }
        return !0;
      }, getNode: function() {
      }, focus: function() {
        var i = this.getNode();
        if (i) {
          var a = e.$keyboardNavigation.facade;
          a.callEvent("onBeforeFocus", [i]) !== !1 && i && (i.setAttribute("tabindex", "-1"), i.$eventAttached || (i.$eventAttached = !0, e.event(i, "focus", function(r) {
            return r.preventDefault(), !1;
          }, !1)), e.utils.dom.isChildOf(document.activeElement, i) && (i = document.activeElement), i.focus && i.focus(), a.callEvent("onFocus", [this.getNode()]));
        }
      }, blur: function() {
        var i = this.getNode();
        i && (e.$keyboardNavigation.facade.callEvent("onBlur", [i]), i.setAttribute("tabindex", "-1"));
      } });
    }(n), function(e) {
      e.$keyboardNavigation.HeaderCell = function(i) {
        this.index = i || 0;
      }, e.$keyboardNavigation.HeaderCell.prototype = e._compose(e.$keyboardNavigation.KeyNavNode, { _handlers: null, isValid: function() {
        return !(!e.config.show_grid && e.getVisibleTaskCount() || !e.getGridColumns()[this.index] && e.getVisibleTaskCount());
      }, fallback: function() {
        if (!e.config.show_grid) return e.getVisibleTaskCount() ? new e.$keyboardNavigation.TaskRow() : null;
        for (var i = e.getGridColumns(), a = this.index; a >= 0 && !i[a]; ) a--;
        return i[a] ? new e.$keyboardNavigation.HeaderCell(a) : null;
      }, fromDomElement: function(i) {
        var a = kt(i, "gantt_grid_head_cell");
        if (a) {
          for (var r = 0; a && a.previousSibling; ) a = a.previousSibling, r += 1;
          return new e.$keyboardNavigation.HeaderCell(r);
        }
        return null;
      }, getNode: function() {
        const i = e.$grid_scale;
        return i ? i.childNodes[this.index] : null;
      }, keys: { left: function() {
        this.index > 0 && this.moveTo(new e.$keyboardNavigation.HeaderCell(this.index - 1));
      }, right: function() {
        var i = e.getGridColumns();
        this.index < i.length - 1 && this.moveTo(new e.$keyboardNavigation.HeaderCell(this.index + 1));
      }, down: function() {
        var i, a = e.getChildren(e.config.root_id);
        e.isTaskExists(a[0]) && (i = a[0]), i && (e.config.keyboard_navigation_cells ? this.moveTo(new e.$keyboardNavigation.TaskCell(i, this.index)) : this.moveTo(new e.$keyboardNavigation.TaskRow(i)));
      }, end: function() {
        var i = e.getGridColumns();
        this.moveTo(new e.$keyboardNavigation.HeaderCell(i.length - 1));
      }, home: function() {
        this.moveTo(new e.$keyboardNavigation.HeaderCell(0));
      }, "enter, space": function() {
        Ae().click();
      }, "ctrl+enter": function() {
        e.isReadonly(this) || e.createTask({}, this.taskId);
      } } }), e.$keyboardNavigation.HeaderCell.prototype.bindAll(e.$keyboardNavigation.HeaderCell.prototype.keys);
    }(n), function(e) {
      e.$keyboardNavigation.TaskRow = function(i) {
        if (!i) {
          var a = e.getChildren(e.config.root_id);
          a[0] && (i = a[0]);
        }
        this.taskId = i, e.isTaskExists(this.taskId) && (this.index = e.getTaskIndex(this.taskId), this.globalIndex = e.getGlobalTaskIndex(this.taskId), this.splitItem = !!e.getTask(this.taskId).$split_subtask, this.parentId = e.getParent(this.taskId));
      }, e.$keyboardNavigation.TaskRow.prototype = e._compose(e.$keyboardNavigation.KeyNavNode, { _handlers: null, isValid: function() {
        return e.isTaskExists(this.taskId) && e.getTaskIndex(this.taskId) > -1;
      }, fallback: function() {
        if (!e.getVisibleTaskCount()) {
          var i = new e.$keyboardNavigation.HeaderCell();
          return i.isValid() ? i : null;
        }
        if (this.splitItem) return new e.$keyboardNavigation.TaskRow(this.parentId);
        var a = -1;
        if (e.getTaskByIndex(this.globalIndex - 1)) a = this.globalIndex - 1;
        else if (e.getTaskByIndex(this.globalIndex + 1)) a = this.globalIndex + 1;
        else for (var r = this.globalIndex; r >= 0; ) {
          if (e.getTaskByIndex(r)) {
            a = r;
            break;
          }
          r--;
        }
        return a > -1 ? new e.$keyboardNavigation.TaskRow(e.getTaskByIndex(a).id) : void 0;
      }, fromDomElement: function(i) {
        if (e.config.keyboard_navigation_cells) return null;
        var a = e.locate(i);
        return e.isTaskExists(a) ? new e.$keyboardNavigation.TaskRow(a) : null;
      }, getNode: function() {
        if (e.isTaskExists(this.taskId) && e.isTaskVisible(this.taskId)) return e.config.show_grid ? e.$grid.querySelector(`.gantt_row[${e.config.task_attribute}="${String(this.taskId).replaceAll('"', '\\"')}"]`) : e.getTaskNode(this.taskId);
      }, focus: function(i) {
        if (!i) {
          const a = e.getTaskPosition(e.getTask(this.taskId)), r = e.getTaskHeight(this.taskId), s = e.getScrollState();
          let o, l;
          o = e.$task ? e.$task.offsetWidth : s.inner_width, l = e.$grid_data || e.$task_data ? (e.$grid_data || e.$task_data).offsetHeight : s.inner_height;
          const d = e.config.show_chart && e.$ui.getView("timeline");
          a.top < s.y || a.top + r > s.y + l ? e.scrollTo(null, a.top - 20) : e.config.scroll_on_click && d && (a.left > s.x + o ? e.scrollTo(a.left - e.config.task_scroll_offset) : a.left + a.width < s.x && e.scrollTo(a.left + a.width - e.config.task_scroll_offset));
        }
        e.$keyboardNavigation.KeyNavNode.prototype.focus.apply(this, [i]), function() {
          var a = e.$ui.getView("grid");
          if (a && a.$grid_data) {
            var r = parseInt(a.$grid.scrollLeft), s = parseInt(a.$grid_data.scrollTop), o = a.$config.scrollX;
            if (o && a.$config.scrollable) {
              var l = e.$ui.getView(o);
              l && l.scrollTo(r, s);
            }
            var d = a.$config.scrollY;
            if (d) {
              var u = e.$ui.getView(d);
              u && u.scrollTo(r, s);
            }
          }
        }();
      }, keys: { pagedown: function() {
        e.getVisibleTaskCount() && this.moveTo(new e.$keyboardNavigation.TaskRow(e.getTaskByIndex(e.getVisibleTaskCount() - 1).id));
      }, pageup: function() {
        e.getVisibleTaskCount() && this.moveTo(new e.$keyboardNavigation.TaskRow(e.getTaskByIndex(0).id));
      }, up: function() {
        var i = null, a = e.getPrev(this.taskId);
        i = e.isTaskExists(a) ? new e.$keyboardNavigation.TaskRow(a) : new e.$keyboardNavigation.HeaderCell(), this.moveTo(i);
      }, down: function() {
        var i = e.getNext(this.taskId);
        e.isTaskExists(i) && this.moveTo(new e.$keyboardNavigation.TaskRow(i));
      }, "shift+down": function() {
        e.hasChild(this.taskId) && !e.getTask(this.taskId).$open && e.open(this.taskId);
      }, "shift+up": function() {
        e.hasChild(this.taskId) && e.getTask(this.taskId).$open && e.close(this.taskId);
      }, "shift+right": function() {
        if (!e.isReadonly(this)) {
          var i = e.getPrevSibling(this.taskId);
          e.isTaskExists(i) && !e.isChildOf(this.taskId, i) && (e.getTask(i).$open = !0, e.moveTask(this.taskId, -1, i) !== !1 && e.updateTask(this.taskId));
        }
      }, "shift+left": function() {
        if (!e.isReadonly(this)) {
          var i = e.getParent(this.taskId);
          e.isTaskExists(i) && e.moveTask(this.taskId, e.getTaskIndex(i) + 1, e.getParent(i)) !== !1 && e.updateTask(this.taskId);
        }
      }, space: function(i) {
        e.isSelectedTask(this.taskId) ? e.unselectTask(this.taskId) : e.selectTask(this.taskId);
      }, "ctrl+left": function(i) {
        e.close(this.taskId);
      }, "ctrl+right": function(i) {
        e.open(this.taskId);
      }, delete: function(i) {
        e.isReadonly(this) || e.$click.buttons.delete(this.taskId);
      }, enter: function() {
        e.isReadonly(this) || e.showLightbox(this.taskId);
      }, "ctrl+enter": function() {
        e.isReadonly(this) || e.createTask({}, this.taskId);
      } } }), e.$keyboardNavigation.TaskRow.prototype.bindAll(e.$keyboardNavigation.TaskRow.prototype.keys);
    }(n), function(e) {
      e.$keyboardNavigation.TaskCell = function(i, a) {
        if (!(i = lt(i, e.config.root_id))) {
          var r = e.getChildren(e.config.root_id);
          r[0] && (i = r[0]);
        }
        this.taskId = i, this.columnIndex = a || 0, e.isTaskExists(this.taskId) && (this.index = e.getTaskIndex(this.taskId), this.globalIndex = e.getGlobalTaskIndex(this.taskId));
      }, e.$keyboardNavigation.TaskCell.prototype = e._compose(e.$keyboardNavigation.TaskRow, { _handlers: null, isValid: function() {
        return e.$keyboardNavigation.TaskRow.prototype.isValid.call(this) && !!e.getGridColumns()[this.columnIndex];
      }, fallback: function() {
        var i = e.$keyboardNavigation.TaskRow.prototype.fallback.call(this), a = i;
        if (i instanceof e.$keyboardNavigation.TaskRow) {
          for (var r = e.getGridColumns(), s = this.columnIndex; s >= 0 && !r[s]; ) s--;
          r[s] && (a = new e.$keyboardNavigation.TaskCell(i.taskId, s));
        }
        return a;
      }, fromDomElement: function(i) {
        if (!e.config.keyboard_navigation_cells) return null;
        var a = e.locate(i);
        if (e.isTaskExists(a)) {
          var r = 0, s = et(i, "data-column-index");
          return s && (r = 1 * s.getAttribute("data-column-index")), new e.$keyboardNavigation.TaskCell(a, r);
        }
        return null;
      }, getNode: function() {
        if (e.isTaskExists(this.taskId) && (e.isTaskVisible(this.taskId) || e.config.show_tasks_outside_timescale)) {
          if (e.config.show_grid && e.$grid) {
            var i = e.$grid.querySelector(".gantt_row[" + e.config.task_attribute + "='" + this.taskId + "']");
            return i ? i.querySelector("[data-column-index='" + this.columnIndex + "']") : null;
          }
          return e.getTaskNode(this.taskId);
        }
      }, keys: { up: function() {
        var i = null, a = e.getPrev(this.taskId);
        i = e.isTaskExists(a) ? new e.$keyboardNavigation.TaskCell(a, this.columnIndex) : new e.$keyboardNavigation.HeaderCell(this.columnIndex), this.moveTo(i);
      }, down: function() {
        var i = e.getNext(this.taskId);
        e.isTaskExists(i) && this.moveTo(new e.$keyboardNavigation.TaskCell(i, this.columnIndex));
      }, left: function() {
        this.columnIndex > 0 && this.moveTo(new e.$keyboardNavigation.TaskCell(this.taskId, this.columnIndex - 1));
      }, right: function() {
        var i = e.getGridColumns();
        this.columnIndex < i.length - 1 && this.moveTo(new e.$keyboardNavigation.TaskCell(this.taskId, this.columnIndex + 1));
      }, end: function() {
        var i = e.getGridColumns();
        this.moveTo(new e.$keyboardNavigation.TaskCell(this.taskId, i.length - 1));
      }, home: function() {
        this.moveTo(new e.$keyboardNavigation.TaskCell(this.taskId, 0));
      }, pagedown: function() {
        e.getVisibleTaskCount() && this.moveTo(new e.$keyboardNavigation.TaskCell(e.getTaskByIndex(e.getVisibleTaskCount() - 1).id, this.columnIndex));
      }, pageup: function() {
        e.getVisibleTaskCount() && this.moveTo(new e.$keyboardNavigation.TaskCell(e.getTaskByIndex(0).id, this.columnIndex));
      } } }), e.$keyboardNavigation.TaskCell.prototype.bindAll(e.$keyboardNavigation.TaskRow.prototype.keys), e.$keyboardNavigation.TaskCell.prototype.bindAll(e.$keyboardNavigation.TaskCell.prototype.keys);
    }(n), yi(n), function(e) {
      e.$keyboardNavigation.dispatcher = { isActive: !1, activeNode: null, globalNode: new e.$keyboardNavigation.GanttNode(), enable: function() {
        this.isActive = !0, this.setActiveNode(this.getActiveNode());
      }, disable: function() {
        this.isActive = !1;
      }, isEnabled: function() {
        return !!this.isActive;
      }, getDefaultNode: function() {
        var i;
        return (i = e.config.keyboard_navigation_cells ? new e.$keyboardNavigation.TaskCell() : new e.$keyboardNavigation.TaskRow()).isValid() || (i = i.fallback()), i;
      }, setDefaultNode: function() {
        this.setActiveNode(this.getDefaultNode());
      }, getActiveNode: function() {
        var i = this.activeNode;
        return i && !i.isValid() && (i = i.fallback()), i;
      }, fromDomElement: function(i) {
        for (var a = [e.$keyboardNavigation.TaskRow, e.$keyboardNavigation.TaskCell, e.$keyboardNavigation.HeaderCell], r = 0; r < a.length; r++) if (a[r].prototype.fromDomElement) {
          var s = a[r].prototype.fromDomElement(i);
          if (s) return s;
        }
        return null;
      }, focusGlobalNode: function() {
        this.blurNode(this.globalNode), this.focusNode(this.globalNode);
      }, setActiveNode: function(i) {
        var a = !0;
        this.activeNode && this.activeNode.compareTo(i) && (a = !1), this.isEnabled() && (a && this.blurNode(this.activeNode), this.activeNode = i, this.focusNode(this.activeNode, !a));
      }, focusNode: function(i, a) {
        i && i.focus && i.focus(a);
      }, blurNode: function(i) {
        i && i.blur && i.blur();
      }, keyDownHandler: function(i) {
        if (!e.$keyboardNavigation.isModal() && this.isEnabled() && !i.defaultPrevented) {
          var a = this.globalNode, r = e.$keyboardNavigation.shortcuts.getCommandFromEvent(i), s = this.getActiveNode();
          e.$keyboardNavigation.facade.callEvent("onKeyDown", [r, i]) !== !1 && (s ? s.findHandler(r) ? s.doAction(r, i) : a.findHandler(r) && a.doAction(r, i) : this.setDefaultNode());
        }
      }, _timeout: null, awaitsFocus: function() {
        return this._timeout !== null;
      }, delay: function(i, a) {
        clearTimeout(this._timeout), this._timeout = setTimeout(e.bind(function() {
          this._timeout = null, i();
        }, this), a || 1);
      }, clearDelay: function() {
        clearTimeout(this._timeout);
      } };
    }(n), function() {
      var e = n.$keyboardNavigation.dispatcher;
      e.isTaskFocused = function(k) {
        var b = e.activeNode;
        return (b instanceof n.$keyboardNavigation.TaskRow || b instanceof n.$keyboardNavigation.TaskCell) && b.taskId == k;
      };
      var i = function(k) {
        if (n.config.keyboard_navigation && (n.config.keyboard_navigation_cells || !s(k)) && !o(k) && !function(b) {
          return !!ct(b.target, ".gantt_cal_light");
        }(k)) return e.keyDownHandler(k);
      }, a = function(k) {
        if (e.$preventDefault) return k.preventDefault(), n.$container.blur(), !1;
        e.awaitsFocus() || e.focusGlobalNode();
      }, r = function() {
        if (!e.isEnabled()) return;
        const k = !Z(document.activeElement, n.$container) && document.activeElement.localName != "body";
        var b = e.getActiveNode();
        if (b && !k) {
          var m, g, p = b.getNode();
          p && p.parentNode && (m = p.parentNode.scrollTop, g = p.parentNode.scrollLeft), b.focus(!0), p && p.parentNode && (p.parentNode.scrollTop = m, p.parentNode.scrollLeft = g);
        }
      };
      function s(k) {
        return !!ct(k.target, ".gantt_grid_editor_placeholder");
      }
      function o(k) {
        return !!ct(k.target, ".no_keyboard_navigation");
      }
      function l(k) {
        if (!n.config.keyboard_navigation || !n.config.keyboard_navigation_cells && s(k)) return !0;
        if (!o(k)) {
          var b, m = e.fromDomElement(k);
          if (m && (e.activeNode instanceof n.$keyboardNavigation.TaskCell && Z(k.target, n.$task) && (m = new n.$keyboardNavigation.TaskCell(m.taskId, e.activeNode.columnIndex)), b = m, n.config.show_grid && n.$ui.getView("grid") && n.config.keyboard_navigation_cells)) {
            const g = k.target.classList.contains("gantt_row"), p = k.target.closest(".gantt_task_line"), y = n.utils.dom.getNodePosition(n.$grid).x, $ = y + n.$grid.offsetWidth, x = n.utils.dom.getNodePosition(document.activeElement).x;
            if (g || p && (x < y || $ < x)) {
              let w = n.$grid.scrollLeft;
              const T = w + n.$grid.offsetWidth;
              let S = 0;
              g && (w = n.utils.dom.getRelativeEventPosition(k, n.$grid).x);
              for (let C = 0; C < n.config.columns.length; C++) {
                const E = n.config.columns[C];
                if (!E.hide && (S += E.width, w < S)) {
                  T < S && (S -= E.width), b.columnIndex = C;
                  break;
                }
              }
            }
          }
          b ? e.isEnabled() ? e.delay(function() {
            e.setActiveNode(b);
          }) : e.activeNode = b : (e.$preventDefault = !0, setTimeout(function() {
            e.$preventDefault = !1;
          }, 300));
        }
      }
      n.attachEvent("onDataRender", function() {
        n.config.keyboard_navigation && r();
      }), n.attachEvent("onGanttRender", function() {
        n.$root && (n.eventRemove(n.$root, "keydown", i), n.eventRemove(n.$container, "focus", a), n.eventRemove(n.$container, "mousedown", l), n.config.keyboard_navigation ? (n.event(n.$root, "keydown", i), n.event(n.$container, "focus", a), n.event(n.$container, "mousedown", l), n.$container.setAttribute("tabindex", "0")) : n.$container.removeAttribute("tabindex"));
      });
      var d = n.attachEvent("onGanttReady", function() {
        if (n.detachEvent(d), n.$data.tasksStore.attachEvent("onStoreUpdated", function(b) {
          if (n.config.keyboard_navigation && e.isEnabled()) {
            const m = e.getActiveNode(), g = n.$ui.getView("grid");
            if (!g || !g.$grid_data) return;
            const p = g.getItemTop(b), y = g.$grid_data.scrollTop, $ = y + g.$grid_data.getBoundingClientRect().height;
            m && m.taskId == b && y <= p && $ >= p && r();
          }
        }), n._smart_render) {
          var k = n._smart_render._redrawTasks;
          n._smart_render._redrawTasks = function(b, m) {
            if (n.config.keyboard_navigation && e.isEnabled()) {
              var g = e.getActiveNode();
              if (g && g.taskId !== void 0) {
                for (var p = !1, y = 0; y < m.length; y++) if (m[y].id == g.taskId && m[y].start_date) {
                  p = !0;
                  break;
                }
                p || m.push(n.getTask(g.taskId));
              }
            }
            return k.apply(this, arguments);
          };
        }
      });
      let u = null, c = !1;
      n.attachEvent("onTaskCreated", function(k) {
        return u = k.id, !0;
      }), n.attachEvent("onAfterTaskAdd", function(k, b) {
        if (!n.config.keyboard_navigation) return !0;
        if (e.isEnabled()) {
          if (k == u && (c = !0, setTimeout(() => {
            c = !1, u = null;
          })), c && b.type == n.config.types.placeholder) return;
          var m = 0, g = e.activeNode;
          g instanceof n.$keyboardNavigation.TaskCell && (m = g.columnIndex);
          var p = n.config.keyboard_navigation_cells ? n.$keyboardNavigation.TaskCell : n.$keyboardNavigation.TaskRow;
          b.type == n.config.types.placeholder && n.config.placeholder_task.focusOnCreate === !1 || e.setActiveNode(new p(k, m));
        }
      }), n.attachEvent("onTaskIdChange", function(k, b) {
        if (!n.config.keyboard_navigation) return !0;
        var m = e.activeNode;
        return e.isTaskFocused(k) && (m.taskId = b), !0;
      });
      var h = setInterval(function() {
        n.config.keyboard_navigation && (e.isEnabled() || e.enable());
      }, 500);
      function _(k) {
        var b = { gantt: n.$keyboardNavigation.GanttNode, headerCell: n.$keyboardNavigation.HeaderCell, taskRow: n.$keyboardNavigation.TaskRow, taskCell: n.$keyboardNavigation.TaskCell };
        return b[k] || b.gantt;
      }
      function f(k) {
        for (var b = n.getGridColumns(), m = 0; m < b.length; m++) if (b[m].name == k) return m;
        return 0;
      }
      n.attachEvent("onDestroy", function() {
        clearInterval(h);
      });
      var v = {};
      _t(v), n.mixin(v, { addShortcut: function(k, b, m) {
        var g = _(m);
        g && g.prototype.bind(k, b);
      }, getShortcutHandler: function(k, b) {
        var m = n.$keyboardNavigation.shortcuts.parse(k);
        if (m.length) return v.getCommandHandler(m[0], b);
      }, getCommandHandler: function(k, b) {
        var m = _(b);
        if (m && k) return m.prototype.findHandler(k);
      }, removeShortcut: function(k, b) {
        var m = _(b);
        m && m.prototype.unbind(k);
      }, focus: function(k) {
        var b, m = k ? k.type : null, g = _(m);
        switch (m) {
          case "taskCell":
            b = new g(k.id, f(k.column));
            break;
          case "taskRow":
            b = new g(k.id);
            break;
          case "headerCell":
            b = new g(f(k.column));
        }
        e.delay(function() {
          b ? e.setActiveNode(b) : (e.enable(), e.getActiveNode() ? e.awaitsFocus() || e.enable() : e.setDefaultNode());
        });
      }, getActiveNode: function() {
        if (e.isEnabled()) {
          var k = e.getActiveNode(), b = (g = k) instanceof n.$keyboardNavigation.GanttNode ? "gantt" : g instanceof n.$keyboardNavigation.HeaderCell ? "headerCell" : g instanceof n.$keyboardNavigation.TaskRow ? "taskRow" : g instanceof n.$keyboardNavigation.TaskCell ? "taskCell" : null, m = n.getGridColumns();
          switch (b) {
            case "taskCell":
              return { type: "taskCell", id: k.taskId, column: m[k.columnIndex].name };
            case "taskRow":
              return { type: "taskRow", id: k.taskId };
            case "headerCell":
              return { type: "headerCell", column: m[k.index].name };
          }
        }
        var g;
        return null;
      } }), n.$keyboardNavigation.facade = v, n.ext.keyboardNavigation = v, n.focus = function() {
        v.focus();
      }, n.addShortcut = v.addShortcut, n.getShortcutHandler = v.getShortcutHandler, n.removeShortcut = v.removeShortcut;
    }();
  })(t);
}, quick_info: function(t) {
  t.ext || (t.ext = {}), t.ext.quickInfo = new bi(t), t.config.quickinfo_buttons = ["icon_edit", "icon_delete"], t.config.quick_info_detached = !0, t.config.show_quick_info = !0, t.templates.quick_info_title = function(a, r, s) {
    return s.text.substr(0, 50);
  }, t.templates.quick_info_content = function(a, r, s) {
    return s.details || s.text;
  }, t.templates.quick_info_date = function(a, r, s) {
    return t.templates.task_time(a, r, s);
  }, t.templates.quick_info_class = function(a, r, s) {
    return "";
  }, t.attachEvent("onTaskClick", function(a, r) {
    const s = t.utils.dom.closest(r.target, ".gantt_add"), o = t.utils.dom.closest(r.target, ".gantt_close"), l = t.utils.dom.closest(r.target, ".gantt_open");
    return !s && !o && !l && setTimeout(function() {
      t.ext.quickInfo.show(a);
    }, 0), !0;
  });
  const n = ["onViewChange", "onLightbox", "onBeforeTaskDelete", "onBeforeDrag"], e = function() {
    return t.ext.quickInfo.hide(), !0;
  };
  for (let a = 0; a < n.length; a++) t.attachEvent(n[a], e);
  function i() {
    return t.ext.quickInfo.hide(), t.ext.quickInfo._quickInfoBox = null, !0;
  }
  t.attachEvent("onEmptyClick", function(a) {
    let r = !0;
    const s = document.querySelector(".gantt_cal_quick_info");
    s && t.utils.dom.isChildOf(a.target, s) && (r = !1), r && e();
  }), t.attachEvent("onGanttReady", i), t.attachEvent("onDestroy", i), t.event(window, "keydown", function(a) {
    a.keyCode === 27 && t.ext.quickInfo.hide();
  }), t.showQuickInfo = function() {
    t.ext.quickInfo.show.apply(t.ext.quickInfo, arguments);
  }, t.hideQuickInfo = function() {
    t.ext.quickInfo.hide.apply(t.ext.quickInfo, arguments);
  };
}, tooltip: function(t) {
  t.config.tooltip_timeout = 30, t.config.tooltip_offset_y = 20, t.config.tooltip_offset_x = 10, t.config.tooltip_hide_timeout = 30;
  const n = new xi(t);
  t.ext.tooltips = n, t.attachEvent("onGanttReady", function() {
    t.$root && n.tooltipFor({ selector: "[" + t.config.task_attribute + "]:not(.gantt_task_row)", html: (e) => {
      if (t.config.touch && !t.config.touch_tooltip) return;
      const i = t.locate(e);
      if (t.isTaskExists(i)) {
        const a = t.getTask(i);
        return t.templates.tooltip_text(a.start_date, a.end_date, a);
      }
      return null;
    }, global: !1 });
  }), t.attachEvent("onDestroy", function() {
    n.destructor();
  }), t.attachEvent("onLightbox", function() {
    n.hideTooltip();
  }), t.attachEvent("onBeforeTooltip", function() {
    if (t.getState().link_source_id) return !1;
  }), t.attachEvent("onGanttScroll", function() {
    n.hideTooltip();
  });
}, undo: function(t) {
  const n = new Si(t), e = new wi(n, t);
  function i(u, c) {
    return String(u) === String(c);
  }
  function a(u, c, h) {
    u && (i(u.id, c) && (u.id = h), i(u.parent, c) && (u.parent = h));
  }
  function r(u, c, h) {
    a(u.value, c, h), a(u.oldValue, c, h);
  }
  function s(u, c, h) {
    u && (i(u.source, c) && (u.source = h), i(u.target, c) && (u.target = h));
  }
  function o(u, c, h) {
    s(u.value, c, h), s(u.oldValue, c, h);
  }
  function l(u, c, h) {
    const _ = n;
    for (let f = 0; f < u.length; f++) {
      const v = u[f];
      for (let k = 0; k < v.commands.length; k++) v.commands[k].entity === _.command.entity.task ? r(v.commands[k], c, h) : v.commands[k].entity === _.command.entity.link && o(v.commands[k], c, h);
    }
  }
  function d(u, c, h) {
    const _ = n;
    for (let f = 0; f < u.length; f++) {
      const v = u[f];
      for (let k = 0; k < v.commands.length; k++) {
        const b = v.commands[k];
        b.entity === _.command.entity.link && (b.value && b.value.id === c && (b.value.id = h), b.oldValue && b.oldValue.id === c && (b.oldValue.id = h));
      }
    }
  }
  t.config.undo = !0, t.config.redo = !0, t.config.undo_types = { link: "link", task: "task" }, t.config.undo_actions = { update: "update", remove: "remove", add: "add", move: "move" }, t.ext || (t.ext = {}), t.ext.undo = { undo: () => n.undo(), redo: () => n.redo(), getUndoStack: () => n.getUndoStack(), setUndoStack: (u) => n.setUndoStack(u), getRedoStack: () => n.getRedoStack(), setRedoStack: (u) => n.setRedoStack(u), clearUndoStack: () => n.clearUndoStack(), clearRedoStack: () => n.clearRedoStack(), saveState: (u, c) => e.store(u, c, !0), getInitialState: (u, c) => c === t.config.undo_types.link ? e.getInitialLink(u) : e.getInitialTask(u) }, t.undo = t.ext.undo.undo, t.redo = t.ext.undo.redo, t.getUndoStack = t.ext.undo.getUndoStack, t.getRedoStack = t.ext.undo.getRedoStack, t.clearUndoStack = t.ext.undo.clearUndoStack, t.clearRedoStack = t.ext.undo.clearRedoStack, t.attachEvent("onTaskIdChange", (u, c) => {
    const h = n;
    l(h.getUndoStack(), u, c), l(h.getRedoStack(), u, c);
  }), t.attachEvent("onLinkIdChange", (u, c) => {
    const h = n;
    d(h.getUndoStack(), u, c), d(h.getRedoStack(), u, c);
  }), t.attachEvent("onGanttReady", () => {
    n.updateConfigs();
  });
}, grouping: function(t) {
  function n(l, d, u) {
    if (!l || Array.isArray(u) && !u[0]) return 0;
    if (l && !Array.isArray(u)) {
      const h = [];
      return l.map(function(_) {
        h.push({ resource_id: _, value: 8 });
      }), h;
    }
    if (u[0].resource_id || (u = [{ resource_id: u, value: 8 }]), typeof l == "string" && (l = l.split(",")), l.length == 1) return u[0].resource_id = l[0], [u[0]];
    const c = [];
    l.length > 1 && (l = [...new Set(l)]);
    for (let h = 0; h < l.length; h++) {
      let _ = l[h], f = u.map(function(v) {
        return v.resource_id;
      }).reduce(function(v, k, b) {
        return k === _ && v.push(b), v;
      }, []);
      if (f.length > 0) f.forEach((v) => {
        u[v].resource_id = _, c.push(u[v]);
      });
      else {
        let v = t.copy(u[0]);
        v.resource_id = _, c.push(v);
      }
    }
    return c;
  }
  function e(l, d, u) {
    return l;
  }
  function i(l, d) {
    for (var u = !1, c = !1, h = 0; h < l.length; h++) {
      var _ = l[h][d];
      if (Array.isArray(_) && (c = !0, _.length && _[0].resource_id !== void 0)) {
        u = !0;
        break;
      }
    }
    return { haveArrays: c, haveResourceAssignments: u };
  }
  function a(l) {
    return l.map(r).sort().join(",");
  }
  function r(l) {
    return String(l && typeof l == "object" ? l.resource_id : l);
  }
  function s(l, d) {
    return l[d] instanceof Array ? l[d].length ? a(l[d]) : 0 : l[d];
  }
  function o() {
    const l = this;
    this.$data.tasksStore._listenerToDrop && this.$data.tasksStore.detachEvent(this.$data.tasksStore._listenerToDrop);
    const d = Qt(function() {
      if (!l._groups.dynamicGroups) return !0;
      if (l._groups.regroup) {
        const u = t.getScrollState();
        l._groups.regroup(), u && t.scrollTo(u.x, u.y);
      }
      return !0;
    });
    this.$data.tasksStore.attachEvent("onAfterUpdate", function() {
      return d.$pending || d(), !0;
    }), this.$data.tasksStore.attachEvent("onParse", function() {
      if (!l._groups.dynamicGroups && l._groups.is_active() && i(t.getTaskByTime(), l._groups.relation_property).haveArrays && (l._groups.dynamicGroups = !0, l._groups.regroup && t.getScrollState)) {
        const u = t.getScrollState();
        l._groups.regroup(), u && t.scrollTo(u.x, u.y);
      }
    });
  }
  t._groups = { relation_property: null, relation_id_property: "$group_id", group_id: null, group_text: null, loading: !1, loaded: 0, dynamicGroups: !1, set_relation_value: void 0, _searchCache: null, init: function(l) {
    var d = this;
    l.attachEvent("onClear", function() {
      d.clear();
    }), d.clear();
    var u = l.$data.tasksStore.getParent;
    this._searchCache = null, l.attachEvent("onBeforeTaskMove", function(h, _, f) {
      var v = _ === this.config.root_id, k = this._groups.dynamicGroups && !(this._groups.set_relation_value instanceof Function);
      if (d.is_active() && (v || k)) return !1;
      var b = l.getTask(h);
      if (this._groups.save_tree_structure && l.isTaskExists(b.parent) && l.isTaskExists(_)) {
        var m = l.getTask(b.parent), g = l.getTask(_);
        g.$virtual && l.isChildOf(m.id, g.id) && (b.parent = l.config.root_id);
        let p = !1, y = g;
        for (; y; ) h == y.parent && (p = !0), y = l.isTaskExists(y.parent) ? l.getTask(y.parent) : null;
        if (p) return !1;
      }
      return !0;
    }), l.attachEvent("onRowDragStart", function(h, _) {
      var f = l.getTask(h);
      return this._groups.save_tree_structure && l.isTaskExists(f.parent) && l.config.order_branch && l.config.order_branch != "marker" && (f.$initial_parent = f.parent), !0;
    }), l.attachEvent("onRowDragEnd", function(h, _) {
      if (l.config.order_branch && l.config.order_branch != "marker") {
        var f = l.getTask(h);
        if (f.$initial_parent) {
          if (f.parent == l.config.root_id) {
            var v = l.getTask(f.$rendered_parent), k = l.getTask(f.$initial_parent), b = !1;
            this._groups.dynamicGroups && v[this._groups.group_id] != k[this._groups.group_id] && (b = !0), this._groups.dynamicGroups || v[this._groups.group_id] == k[this._groups.relation_property] || (b = !0), b && (f.parent = f.$initial_parent);
          }
          delete f.$initial_parent;
        }
      }
    }), l.$data.tasksStore._listenerToDrop = l.$data.tasksStore.attachEvent("onStoreUpdated", l.bind(o, l)), l.$data.tasksStore.getParent = function(h) {
      return d.is_active() ? d.get_parent(l, h) : u.apply(this, arguments);
    };
    var c = l.$data.tasksStore.setParent;
    l.$data.tasksStore.setParent = function(h, _) {
      if (!d.is_active()) return c.apply(this, arguments);
      if (d.set_relation_value instanceof Function && l.isTaskExists(_)) {
        var f = (b = l.getTask(_))[d.relation_id_property];
        if (!b.$virtual) {
          var v = s(b, d.relation_property);
          d._searchCache || d._buildCache();
          var k = d._searchCache[v];
          f = l.getTask(k)[d.relation_id_property];
        }
        h[d.group_id] === void 0 && (h[d.group_id] = f), d.save_tree_structure && h[d.group_id] != f && (h[d.group_id] = f), f && (f = typeof f == "string" ? f.split(",") : [f]), h[d.relation_property] = d.set_relation_value(f, h.id, h[d.relation_property]) || f;
      } else if (l.isTaskExists(_)) {
        var b = l.getTask(_);
        d.dynamicGroups || (b.$virtual ? h[d.relation_property] = b[d.relation_id_property] : h[d.relation_property] = b[d.relation_property]), this._setParentInner.apply(this, arguments);
      } else d.dynamicGroups && (h[d.group_id] === void 0 || !h.$virtual && h[d.relation_property][0] === [][0]) && (h[d.relation_property] !== d.group_id ? h[d.relation_property] = h[d.relation_property] || 0 : h[d.relation_property] = 0);
      return l.isTaskExists(_) && (h.$rendered_parent = _, !l.getTask(_).$virtual) ? c.apply(this, arguments) || _ : void 0;
    }, l.attachEvent("onBeforeTaskDisplay", function(h, _) {
      return !(d.is_active() && _.type == l.config.types.project && !_.$virtual);
    }), l.attachEvent("onBeforeParse", function() {
      d.loading = !0, d._clearCache();
    }), l.attachEvent("onTaskLoading", function() {
      return d.is_active() && (d.loaded--, d.loaded <= 0 && (d.loading = !1, d._clearCache(), l.eachTask(l.bind(function(h) {
        this.get_parent(l, h);
      }, d)))), !0;
    }), l.attachEvent("onParse", function() {
      d.loading = !1, d.loaded = 0;
    });
  }, _clearCache: function() {
    this._searchCache = null;
  }, _buildCache: function() {
    this._searchCache = {};
    for (var l = t.$data.tasksStore.getItems(), d = 0; d < l.length; d++) this._searchCache[l[d][this.relation_id_property]] = l[d].id;
  }, get_parent: function(l, d, u) {
    d.id === void 0 && (d = l.getTask(d));
    var c = s(d, this.relation_property);
    if (this.save_tree_structure && l.isTaskExists(d.parent)) {
      let f = l.getTask(d.parent);
      const v = s(f, this.relation_property);
      if (f.type != "project" && c == v) return d.parent;
    }
    if (this._groups_pull[c] === d.id) return l.config.root_id;
    if (this._groups_pull[c] !== void 0) return this._groups_pull[c];
    var h = l.config.root_id;
    if (!this.loading && c !== void 0) {
      this._searchCache || this._buildCache();
      var _ = this._searchCache[c];
      l.isTaskExists(_) && _ != d.id && (h = this._searchCache[c]), this._groups_pull[c] = h;
    }
    return h;
  }, clear: function() {
    this._groups_pull = {}, this.relation_property = null, this.group_id = null, this.group_text = null, this._clearCache();
  }, is_active: function() {
    return !!this.relation_property;
  }, generate_sections: function(l, d) {
    for (var u = [], c = 0; c < l.length; c++) {
      var h = t.copy(l[c]);
      h.type = d, h.open === void 0 && (h.open = !0), h.$virtual = !0, h.readonly = !0, h[this.relation_id_property] = h[this.group_id], h.text = h[this.group_text], u.push(h);
    }
    return u;
  }, clear_temp_tasks: function(l) {
    for (var d = 0; d < l.length; d++) l[d].$virtual && (l.splice(d, 1), d--);
  }, generate_data: function(l, d) {
    var u = l.getLinks(), c = l.getTaskByTime();
    this.clear_temp_tasks(c), c.forEach(function(f) {
      f.$calculate_duration = !1;
    });
    var h = [];
    this.is_active() && d && d.length && (h = this.generate_sections(d, l.config.types.project));
    var _ = { links: u };
    return _.data = h.concat(c), _;
  }, update_settings: function(l, d, u) {
    this.clear(), this.relation_property = l, this.group_id = d, this.group_text = u;
  }, group_tasks: function(l, d, u, c, h) {
    this.update_settings(u, c, h);
    var _ = this.generate_data(l, d);
    this.loaded = _.data.length;
    var f = [];
    l.eachTask(function(b) {
      l.isSelectedTask(b.id) && f.push(b.id);
    }), l._clear_data();
    const v = l._getAutoSchedulingConfig().schedule_on_parse, k = l.config.auto_scheduling_initial;
    k ? l.config.auto_scheduling_initial = !1 : v && (l.config.auto_scheduling.schedule_on_parse = !1), l.parse(_), f.forEach(function(b) {
      l.isTaskExists(b) && l.selectTask(b);
    }), k ? l.config.auto_scheduling_initial = v : v && (l.config.auto_scheduling.schedule_on_parse = v);
  } }, t._groups.init(t), t.groupBy = function(l) {
    var d = this, u = t.getTaskByTime();
    this._groups.set_relation_value = l.set_relation_value, this._groups.dynamicGroups = !1, this._groups.save_tree_structure = l.save_tree_structure;
    var c = i(u, l.relation_property);
    c.haveArrays && (this._groups.dynamicGroups = !0), this._groups.set_relation_value || (this._groups.set_relation_value = function(v) {
      return v.haveResourceAssignments ? n : v.haveArrays ? e : null;
    }(c)), (l = l || {}).default_group_label = l.default_group_label || this.locale.labels.default_group || "None";
    var h = l.relation_property || null, _ = l.group_id || "key", f = l.group_text || "label";
    this._groups.regroup = function() {
      var v = t.getTaskByTime(), k = {}, b = !1;
      v.forEach(function(g) {
        g.$virtual && g.$open !== void 0 && (k[g[_]] = g.$open, b = !0);
      });
      var m = function(g, p, y) {
        var $;
        return $ = g.groups ? y._groups.dynamicGroups ? function(x, w) {
          var T = {}, S = [], C = {}, E = w.relation_property, D = w.delimiter || ",", I = !1, M = 0;
          ht(w.groups, function(R) {
            R.default && (I = !0, M = R.group_id), C[R.key || R[w.group_id]] = R;
          });
          for (var A = 0; A < x.length; A++) {
            var L, N, P = x[A][E];
            if (Lt(P)) if (P.length > 0) L = a(P), N = P.map(function(R, O) {
              var B;
              return B = R && typeof R == "object" ? R.resource_id : R, (R = C[B]).label || R.text;
            }).sort(), N = [...new Set(N)].join(D);
            else {
              if (I) continue;
              L = 0, N = w.default_group_label;
            }
            else if (P) N = C[L = P].label || C[L].text;
            else {
              if (I) continue;
              L = 0, N = w.default_group_label;
            }
            L !== void 0 && T[L] === void 0 && (T[L] = { key: L, label: N }, L === M && (T[L].default = !0), T[L][w.group_text] = N, T[L][w.group_id] = L);
          }
          return (S = function(R) {
            var O = [];
            for (var B in R) R.hasOwnProperty(B) && O.push(R[B]);
            return O;
          }(T)).forEach(function(R) {
            R.key == M && (R.default = !0);
          }), S;
        }(p, g) : g.groups : null, $;
      }(l, v, t);
      return m && b && m.forEach(function(g) {
        k[g[_]] !== void 0 && (g.open = k[g[_]]);
      }), d._groups.group_tasks(d, m, h, _, f), !0;
    }, this._groups.regroup();
  }, t.$services.getService("state").registerProvider("groupBy", function() {
    return { group_mode: t._groups.is_active() ? t._groups.relation_property : null };
  });
}, marker: function(t) {
  function n(i) {
    if (!t.config.show_markers || !i.start_date) return !1;
    var a = t.getState();
    if (+i.start_date > +a.max_date || (!i.end_date || +i.end_date < +a.min_date) && +i.start_date < +a.min_date) return;
    var r = document.createElement("div");
    r.setAttribute("data-marker-id", i.id);
    var s = "gantt_marker";
    t.templates.marker_class && (s += " " + t.templates.marker_class(i)), i.css && (s += " " + i.css), t.templates.marker_class && (s += " " + t.templates.marker_class(i)), i.title && (r.title = i.title), r.className = s;
    var o = t.posFromDate(i.start_date);
    r.style.left = o + "px";
    let l = Math.max(t.getRowTop(t.getVisibleTaskCount()), 0) + "px";
    if (t.config.timeline_placeholder && t.$task_data && (l = t.$task_data.scrollHeight + "px"), r.style.height = l, i.end_date) {
      var d = t.posFromDate(i.end_date);
      r.style.width = Math.max(d - o, 0) + "px";
    }
    if (i.text) {
      let u = null;
      u = typeof i.text == "function" ? i.text(i) : i.text, u && (t.config.external_render && t.config.external_render.isElement(u) ? (r.innerHTML = "<div class='gantt_marker_content' ></div>", t.config.external_render.renderElement(u, r.querySelector(".gantt_marker_content"))) : r.innerHTML = "<div class='gantt_marker_content' >" + i.text + "</div>");
    }
    return r;
  }
  function e() {
    if (t.$task_data && t.$root.contains(t.$task_data)) {
      if (!t.$marker_area || !t.$task_data.contains(t.$marker_area)) {
        var i = document.createElement("div");
        i.className = "gantt_marker_area", t.$task_data.appendChild(i), t.$marker_area = i;
      }
    } else t.$marker_area = null;
  }
  t._markers || (t._markers = t.createDatastore({ name: "marker", initItem: function(i) {
    return i.id = i.id || t.uid(), i;
  } })), t.config.show_markers = !0, t.attachEvent("onBeforeGanttRender", function() {
    t.$marker_area || e();
  }), t.attachEvent("onDataRender", function() {
    t.$marker_area || (e(), t.renderMarkers());
  }), t.attachEvent("onGanttLayoutReady", function() {
    t.attachEvent("onBeforeGanttRender", function() {
      t.$marker_area && (t.$marker_area.innerHTML = ""), e(), t.$services.getService("layers").createDataRender({ name: "marker", defaultContainer: function() {
        return t.$marker_area;
      } }).addLayer(n);
    }, { once: !0 });
  }), t.getMarker = function(i) {
    return this._markers ? this._markers.getItem(i) : null;
  }, t.addMarker = function(i) {
    return this._markers.addItem(i);
  }, t.deleteMarker = function(i) {
    return !!this._markers.exists(i) && (this._markers.removeItem(i), !0);
  }, t.updateMarker = function(i) {
    this._markers.refresh(i);
  }, t._getMarkers = function() {
    return this._markers.getItems();
  }, t.renderMarkers = function() {
    this._markers.refresh();
  };
}, multiselect: function(t) {
  t.config.multiselect = !0, t.config.multiselect_one_level = !1, t._multiselect = { _selected: {}, _one_level: !1, _active: !0, _first_selected_when_shift: null, getDefaultSelected: function() {
    var n = this.getSelected();
    return n.length ? n[n.length - 1] : null;
  }, setFirstSelected: function(n) {
    this._first_selected_when_shift = n;
  }, getFirstSelected: function() {
    return this._first_selected_when_shift;
  }, isActive: function() {
    return this.updateState(), this._active;
  }, updateState: function() {
    this._one_level = t.config.multiselect_one_level;
    var n = this._active;
    this._active = t.config.select_task, this._active != n && this.reset();
  }, reset: function() {
    this._selected = {};
  }, setLastSelected: function(n) {
    t.$data.tasksStore.silent(function() {
      var e = t.$data.tasksStore;
      n ? e.select(n + "") : e.unselect(null);
    });
  }, getLastSelected: function() {
    var n = t.$data.tasksStore.getSelectedId();
    return n && t.isTaskExists(n) ? n : null;
  }, select: function(n, e) {
    return !!(n && t.callEvent("onBeforeTaskMultiSelect", [n, !0, e]) && t.callEvent("onBeforeTaskSelected", [n])) && (this._selected[n] = !0, this.setLastSelected(n), this.afterSelect(n), t.callEvent("onTaskMultiSelect", [n, !0, e]), t.callEvent("onTaskSelected", [n]), !0);
  }, toggle: function(n, e) {
    this._selected[n] ? this.unselect(n, e) : this.select(n, e);
  }, unselect: function(n, e) {
    n && t.callEvent("onBeforeTaskMultiSelect", [n, !1, e]) && (this._selected[n] = !1, this.getLastSelected() == n && this.setLastSelected(this.getDefaultSelected()), this.afterSelect(n), t.callEvent("onTaskMultiSelect", [n, !1, e]), t.callEvent("onTaskUnselected", [n]));
  }, isSelected: function(n) {
    return !(!t.isTaskExists(n) || !this._selected[n]);
  }, getSelected: function() {
    var n = [];
    for (var e in this._selected) this._selected[e] && t.isTaskExists(e) ? n.push(e) : this._selected[e] = !1;
    return n.sort(function(i, a) {
      return t.getGlobalTaskIndex(i) > t.getGlobalTaskIndex(a) ? 1 : -1;
    }), n;
  }, forSelected: function(n) {
    for (var e = this.getSelected(), i = 0; i < e.length; i++) n(e[i]);
  }, isSameLevel: function(n) {
    if (!this._one_level) return !0;
    var e = this.getLastSelected();
    return !e || !t.isTaskExists(e) || !t.isTaskExists(n) || t.calculateTaskLevel(t.getTask(e)) == t.calculateTaskLevel(t.getTask(n));
  }, afterSelect: function(n) {
    t.isTaskExists(n) && t._quickRefresh(function() {
      t.refreshTask(n);
    });
  }, doSelection: function(n) {
    if (!this.isActive() || t._is_icon_open_click(n)) return !1;
    var e = t.locate(n);
    if (!e || !t.callEvent("onBeforeMultiSelect", [n])) return !1;
    var i = this.getSelected(), a = this.getFirstSelected(), r = !1, s = this.getLastSelected(), o = t.config.multiselect, l = (function() {
      const u = t.ext.inlineEditors;
      if (u && u.getState) {
        const h = u.getState(), _ = u.locateCell(n.target);
        t.config.inline_editors_multiselect_open && _ && u.getEditorConfig(_.columnName) && (u.isVisible() && h.id == _.id && h.columnName == _.columnName || u.startEdit(_.id, _.columnName));
      }
      this.setFirstSelected(e), this.isSelected(e) || this.select(e, n), i = this.getSelected();
      for (var c = 0; c < i.length; c++) i[c] !== e && this.unselect(i[c], n);
    }).bind(this), d = (function() {
      if (s) {
        if (e) {
          var u = t.getGlobalTaskIndex(this.getFirstSelected()), c = t.getGlobalTaskIndex(e), h = t.getGlobalTaskIndex(s);
          u != -1 && h != -1 || (u = c, this.reset());
          for (var _ = s; t.getGlobalTaskIndex(_) !== u; ) this.unselect(_, n), _ = u > h ? t.getNext(_) : t.getPrev(_);
          for (_ = e; t.getGlobalTaskIndex(_) !== u; ) this.select(_, n) && !r && (r = !0, a = _), _ = u > c ? t.getNext(_) : t.getPrev(_);
        }
      } else s = e;
    }).bind(this);
    return o && (n.ctrlKey || n.metaKey) ? (this.isSelected(e) || this.setFirstSelected(e), e && this.toggle(e, n)) : o && n.shiftKey ? (t.isTaskExists(this.getFirstSelected()) && this.getFirstSelected() !== null || this.setFirstSelected(e), i.length ? d() : l()) : l(), this.isSelected(e) ? this.setLastSelected(e) : a ? e == s && this.setLastSelected(n.shiftKey ? a : this.getDefaultSelected()) : this.setLastSelected(null), this.getSelected().length || this.setLastSelected(null), this.getLastSelected() && this.isSelected(this.getFirstSelected()) || this.setFirstSelected(this.getLastSelected()), !0;
  } }, function() {
    var n = t.selectTask;
    t.selectTask = function(i) {
      if (!(i = lt(i, this.config.root_id))) return !1;
      var a = t._multiselect, r = i;
      return a.isActive() ? (a.select(i, null) && a.setLastSelected(i), a.setFirstSelected(a.getLastSelected())) : r = n.call(this, i), r;
    };
    var e = t.unselectTask;
    t.unselectTask = function(i) {
      var a = t._multiselect, r = a.isActive();
      (i = i || a.getLastSelected()) && r && (a.unselect(i, null), i == a.getLastSelected() && a.setLastSelected(null), t.refreshTask(i), a.setFirstSelected(a.getLastSelected()));
      var s = i;
      return r || (s = e.call(this, i)), s;
    }, t.toggleTaskSelection = function(i) {
      var a = t._multiselect;
      i && a.isActive() && (a.toggle(i), a.setFirstSelected(a.getLastSelected()));
    }, t.getSelectedTasks = function() {
      var i = t._multiselect;
      return i.isActive(), i.getSelected();
    }, t.eachSelectedTask = function(i) {
      return this._multiselect.forSelected(i);
    }, t.isSelectedTask = function(i) {
      return this._multiselect.isSelected(i);
    }, t.getLastSelectedTask = function() {
      return this._multiselect.getLastSelected();
    }, t.attachEvent("onGanttReady", function() {
      var i = t.$data.tasksStore.isSelected;
      t.$data.tasksStore.isSelected = function(a) {
        return t._multiselect.isActive() ? t._multiselect.isSelected(a) : i.call(this, a);
      };
    });
  }(), t.attachEvent("onTaskIdChange", function(n, e) {
    var i = t._multiselect;
    if (!i.isActive()) return !0;
    t.isSelectedTask(n) && (i.unselect(n, null), i.select(e, null));
  }), t.attachEvent("onAfterTaskDelete", function(n, e) {
    var i = t._multiselect;
    if (!i.isActive()) return !0;
    i._selected[n] && (i._selected[n] = !1, i.setLastSelected(i.getDefaultSelected())), i.forSelected(function(a) {
      t.isTaskExists(a) || i.unselect(a, null);
    });
  }), t.attachEvent("onBeforeTaskMultiSelect", function(n, e, i) {
    const a = t._multiselect;
    if (e && a.isActive()) {
      let r = t.getSelectedId(), s = null;
      r && (s = t.getTask(r));
      let o = t.getTask(n), l = !1;
      if (s && s.$level != o.$level && (l = !0), t.config.multiselect_one_level && l && !i.ctrlKey && !i.shiftKey) return !0;
      if (a._one_level) return a.isSameLevel(n);
    }
    return !0;
  }), t.attachEvent("onTaskClick", function(n, e) {
    return t._multiselect.doSelection(e) && t.callEvent("onMultiSelect", [e]), !0;
  });
}, overlay: function(t) {
  t.ext || (t.ext = {}), t.ext.overlay = {};
  var n = {};
  function e() {
    if (t.$task_data) {
      t.event(t.$task_data, "scroll", function(l) {
        t.ext.$overlay_area && (t.ext.$overlay_area.style.top = l.target.scrollTop + "px");
      });
      var o = document.createElement("div");
      o.className = "gantt_overlay_area", t.$task_data.appendChild(o), t.ext.$overlay_area = o, i();
    }
  }
  function i() {
    for (var o in n) {
      var l = n[o];
      l.isAttached || a(l);
    }
  }
  function a(o) {
    t.ext.$overlay_area.appendChild(o.node), o.isAttached = !0;
  }
  function r() {
    t.ext.$overlay_area.style.display = "block";
  }
  function s() {
    var o = !1;
    for (var l in n)
      if (n[l].isVisible) {
        o = !0;
        break;
      }
    o || (t.ext.$overlay_area.style.display = "none");
  }
  t.attachEvent("onBeforeGanttRender", function() {
    if (t.$root) {
      if (t.ext.$overlay_area || e(), !t.ext.$overlay_area.isConnected) for (var o in t.ext.$overlay_area.innerHTML = "", t.ext.$overlay_area.remove(), t.ext.$overlay_area = null, e(), n) n[o].isAttached = !1;
      i(), s();
    }
  }), t.attachEvent("onGanttReady", function() {
    t.$root && (e(), i(), s());
  }), t.ext.overlay.addOverlay = function(o, l) {
    return l = l || t.uid(), n[l] = function(d, u) {
      var c = document.createElement("div");
      return c.setAttribute("data-overlay-id", d), c.className = "gantt_overlay", c.style.display = "none", { id: d, render: u, isVisible: !1, isAttached: !1, node: c };
    }(l, o), l;
  }, t.ext.overlay.deleteOverlay = function(o) {
    return !!n[o] && (delete n[o], s(), !0);
  }, t.ext.overlay.getOverlaysIds = function() {
    var o = [];
    for (var l in n) o.push(l);
    return o;
  }, t.ext.overlay.refreshOverlay = function(o) {
    r(), n[o].isVisible = !0, n[o].node.innerHTML = "", n[o].node.style.display = "block", n[o].render(n[o].node);
  }, t.ext.overlay.showOverlay = function(o) {
    r(), this.refreshOverlay(o);
  }, t.ext.overlay.hideOverlay = function(o) {
    n[o].isVisible = !1, n[o].node.style.display = "none", s();
  }, t.ext.overlay.isOverlayVisible = function(o) {
    return !!o && n[o].isVisible;
  };
}, export_api: function(t) {
  return t.ext = t.ext || {}, t.ext.export_api = t.ext.export_api || { _apiUrl: "https://export.dhtmlx.com/gantt", _preparePDFConfigRaw(n, e) {
    let i = null;
    n.start && n.end && (i = { start_date: t.config.start_date, end_date: t.config.end_date }, t.config.start_date = t.date.str_to_date(t.config.date_format)(n.start), t.config.end_date = t.date.str_to_date(t.config.date_format)(n.end)), n = t.mixin(n, { name: "gantt." + e, data: t.ext.export_api._serializeHtml() }), i && (t.config.start_date = i.start_date, t.config.end_date = i.end_date);
  }, _prepareConfigPDF: (n, e) => (n = t.mixin(n || {}, { name: "gantt." + e, data: t.ext.export_api._serializeAll(), config: t.config }), t.ext.export_api._fixColumns(n.config.columns), n), _pdfExportRouter(n, e) {
    n && n.raw ? t.ext.export_api._preparePDFConfigRaw(n, e) : n = t.ext.export_api._prepareConfigPDF(n, e), n.version = t.version, t.ext.export_api._sendToExport(n, e);
  }, exportToPDF(n) {
    t.ext.export_api._pdfExportRouter(n, "pdf");
  }, exportToPNG(n) {
    t.ext.export_api._pdfExportRouter(n, "png");
  }, exportToICal(n) {
    n = t.mixin(n || {}, { name: "gantt.ical", data: t.ext.export_api._serializePlain().data, version: t.version }), t.ext.export_api._sendToExport(n, "ical");
  }, exportToExcel(n) {
    let e;
    n = n || {};
    let i, a, r = [];
    const s = t.config.smart_rendering;
    if (n.visual === "base-colors" && (t.config.smart_rendering = !1), n.start || n.end) {
      i = t.getState(), r = [t.config.start_date, t.config.end_date], a = t.getScrollState();
      const o = t.date.str_to_date(t.config.date_format);
      e = t.eachTask, n.start && (t.config.start_date = o(n.start)), n.end && (t.config.end_date = o(n.end)), t.render(), t.config.smart_rendering = s, t.eachTask = t.ext.export_api._eachTaskTimed(t.config.start_date, t.config.end_date);
    } else n.visual === "base-colors" && (t.render(), t.config.smart_rendering = s);
    (n = t.mixin(n, { name: "gantt.xlsx", title: "Tasks", data: t.ext.export_api._serializeTimeline(n), columns: t.ext.export_api._serializeGrid({ raw: n.raw, rawDates: !0 }), version: t.version })).visual && (n.scales = t.ext.export_api._serializeScales(n)), t.ext.export_api._sendToExport(n, "excel"), (n.start || n.end) && (t.config.start_date = i.min_date, t.config.end_date = i.max_date, t.eachTask = e, t.render(), t.scrollTo(a.x, a.y), t.config.start_date = r[0], t.config.end_date = r[1]);
  }, exportToJSON(n) {
    n = t.mixin(n || {}, { name: "gantt.json", data: t.ext.export_api._serializeAll(), config: t.config, columns: t.ext.export_api._serializeGrid(), worktime: t.ext.export_api._getWorktimeSettings(), version: t.version }), t.ext.export_api._sendToExport(n, "json");
  }, importFromExcel(n) {
    try {
      const e = n.data;
      if (e instanceof File) {
        const i = new FormData();
        i.append("file", e), n.data = i;
      }
    } catch {
    }
    t.ext.export_api._sendImportAjaxExcel(n);
  }, importFromMSProject(n) {
    const e = n.data;
    try {
      if (e instanceof File) {
        const i = new FormData();
        i.append("file", e), n.data = i;
      }
    } catch {
    }
    t.ext.export_api._sendImportAjaxMSP(n);
  }, importFromPrimaveraP6: (n) => (n.type = "primaveraP6-parse", t.importFromMSProject(n)), exportToMSProject(n) {
    (n = n || {}).skip_circular_links = n.skip_circular_links === void 0 || !!n.skip_circular_links;
    const e = t.templates.xml_format, i = t.templates.format_date, a = t.config.xml_date, r = t.config.date_format, s = "%d-%m-%Y %H:%i:%s";
    t.config.xml_date = s, t.config.date_format = s, t.templates.xml_format = t.date.date_to_str(s), t.templates.format_date = t.date.date_to_str(s);
    const o = t.ext.export_api._serializeAll();
    t.ext.export_api._customProjectProperties(o, n), t.ext.export_api._customTaskProperties(o, n), n.skip_circular_links && t.ext.export_api._clearRecLinks(o), n = t.ext.export_api._exportConfig(o, n), t.ext.export_api._sendToExport(n, n.type || "msproject"), t.config.xml_date = a, t.config.date_format = r, t.templates.xml_format = e, t.templates.format_date = i, t.config.$custom_data = null, t.config.custom = null;
  }, exportToPrimaveraP6: (n) => ((n = n || {}).type = "primaveraP6", t.exportToMSProject(n)), _fixColumns(n) {
    for (let e = 0; e < n.length; e++) n[e].label = n[e].label || t.locale.labels["column_" + n[e].name], typeof n[e].width == "string" && (n[e].width = 1 * n[e].width);
  }, _xdr(n, e, i) {
    t.ajax.post(n, e, i);
  }, _markColumns(n) {
    const e = n.config.columns;
    if (e) for (let i = 0; i < e.length; i++) e[i].template && (e[i].$template = !0);
  }, _sendImportAjaxExcel(n) {
    const e = n.server || t.ext.export_api._apiUrl, i = n.store || 0, a = n.data, r = n.callback;
    a.append("type", "excel-parse"), a.append("data", JSON.stringify({ sheet: n.sheet || 0 })), i && a.append("store", i);
    const s = new XMLHttpRequest();
    s.onreadystatechange = function(o) {
      s.readyState === 4 && s.status === 0 && r && r(null);
    }, s.onload = function() {
      let o = null;
      if (!(s.status > 400)) try {
        o = JSON.parse(s.responseText);
      } catch {
      }
      r && r(o);
    }, s.open("POST", e, !0), s.setRequestHeader("X-Requested-With", "XMLHttpRequest"), s.send(a);
  }, _ajaxToExport(n, e, i) {
    delete n.callback;
    const a = n.server || t.ext.export_api._apiUrl, r = "type=" + e + "&store=1&data=" + encodeURIComponent(JSON.stringify(n));
    t.ext.export_api._xdr(a, r, function(s) {
      const o = s.xmlDoc || s;
      let l = null;
      if (!(o.status > 400)) try {
        l = JSON.parse(o.responseText);
      } catch {
      }
      i(l);
    });
  }, _serializableGanttConfig(n) {
    const e = t.mixin({}, n);
    return e.columns && (e.columns = e.columns.map(function(i) {
      const a = t.mixin({}, i);
      return delete a.editor, a;
    })), delete e.editor_types, e;
  }, _sendToExport(n, e) {
    const i = t.date.date_to_str(t.config.date_format || t.config.xml_date);
    if (n.skin || (n.skin = t.skin), n.config && (n.config = t.copy(t.ext.export_api._serializableGanttConfig(n.config)), t.ext.export_api._markColumns(n, e), n.config.start_date && n.config.end_date && (n.config.start_date instanceof Date && (n.config.start_date = i(n.config.start_date)), n.config.end_date instanceof Date && (n.config.end_date = i(n.config.end_date)))), n.callback) return t.ext.export_api._ajaxToExport(n, e, n.callback);
    const a = t.ext.export_api._createHiddenForm();
    a.firstChild.action = n.server || t.ext.export_api._apiUrl, a.firstChild.childNodes[0].value = JSON.stringify(n), a.firstChild.childNodes[1].value = e, a.firstChild.submit();
  }, _createHiddenForm() {
    if (!t.ext.export_api._hidden_export_form) {
      const n = t.ext.export_api._hidden_export_form = document.createElement("div");
      n.style.display = "none", n.innerHTML = "<form method='POST' target='_blank'><textarea name='data' style='width:0px; height:0px;' readonly='true'></textarea><input type='hidden' name='type' value=''></form>", document.body.appendChild(n);
    }
    return t.ext.export_api._hidden_export_form;
  }, _copyObjectBase(n) {
    const e = { start_date: void 0, end_date: void 0, constraint_date: void 0, deadline: void 0 };
    for (const a in n) a.charAt(0) !== "$" && a !== "baselines" && (e[a] = n[a]);
    const i = t.templates.xml_format || t.templates.format_date;
    return e.start_date = i(e.start_date), e.end_date && (e.end_date = i(e.end_date)), e.constraint_date && (e.constraint_date = i(e.constraint_date)), e.deadline && (e.deadline = i(e.deadline)), e;
  }, _color_box: null, _color_hash: {}, _getStyles(n) {
    if (t.ext.export_api._color_box || (t.ext.export_api._color_box = document.createElement("DIV"), t.ext.export_api._color_box.style.cssText = "position:absolute; display:none;", document.body.appendChild(t.ext.export_api._color_box)), t.ext.export_api._color_hash[n]) return t.ext.export_api._color_hash[n];
    t.ext.export_api._color_box.className = n;
    const e = t.ext.export_api._getColor(t.ext.export_api._color_box, "color"), i = t.ext.export_api._getColor(t.ext.export_api._color_box, "backgroundColor");
    return t.ext.export_api._color_hash[n] = e + ";" + i;
  }, _getMinutesWorktimeSettings(n) {
    const e = [];
    return n.forEach(function(i) {
      e.push(i.startMinute), e.push(i.endMinute);
    }), e;
  }, _getWorktimeSettings() {
    const n = { hours: [0, 24], minutes: null, dates: { 0: !0, 1: !0, 2: !0, 3: !0, 4: !0, 5: !0, 6: !0 } };
    let e;
    if (t.config.work_time) {
      const i = t._working_time_helper;
      if (i && i.get_calendar) e = i.get_calendar();
      else if (i) e = { hours: i.hours, minutes: null, dates: i.dates };
      else if (t.config.worktimes && t.config.worktimes.global) {
        const a = t.config.worktimes.global;
        if (a.parsed) {
          e = { hours: null, minutes: t.ext.export_api._getMinutesWorktimeSettings(a.parsed.hours), dates: {} };
          for (const r in a.parsed.dates) Array.isArray(a.parsed.dates[r]) ? e.dates[r] = t.ext.export_api._getMinutesWorktimeSettings(a.parsed.dates[r]) : e.dates[r] = a.parsed.dates[r];
        } else e = { hours: a.hours, minutes: null, dates: a.dates };
      } else e = n;
    } else e = n;
    return e;
  }, _eachTaskTimed: (n, e) => function(i, a, r) {
    a = a || t.config.root_id, r = r || t;
    const s = t.getChildren(a);
    if (s) for (let o = 0; o < s.length; o++) {
      const l = t._pull[s[o]];
      (!n || l.end_date > n) && (!e || l.start_date < e) && i.call(r, l), t.hasChild(l.id) && t.eachTask(i, l.id, r);
    }
  }, _originalCopyObject: t.json._copyObject, _copyObjectPlainICal(n) {
    const e = t.templates.task_text(n.start_date, n.end_date, n), i = t.ext.export_api._copyObjectBase(n);
    return i.text = e || i.text, i;
  }, _copyObjectPlainExcel(n) {
    const e = t.templates.task_text(n.start_date, n.end_date, n), i = t.json.serializeTask(n);
    return i.text = e || i.text, i;
  }, _getColor(n, e) {
    let i = n.currentStyle ? n.currentStyle[e] : getComputedStyle(n, null)[e];
    n.closest(".gantt_task_progress") && i === "rgba(0, 0, 0, 0.15)" && (i = (n = n.parentNode.parentNode).currentStyle ? n.currentStyle[e] : getComputedStyle(n, null)[e]);
    const a = i.replace(/\s/g, "").match(/^rgba?\((\d+),(\d+),(\d+)/i);
    return (a && a.length === 4 ? ("0" + parseInt(a[1], 10).toString(16)).slice(-2) + ("0" + parseInt(a[2], 10).toString(16)).slice(-2) + ("0" + parseInt(a[3], 10).toString(16)).slice(-2) : i).replace("#", "");
  }, _copyObjectTable(n) {
    const e = t.date.date_to_str("%Y-%m-%dT%H:%i:%s.000Z"), i = t.ext.export_api._copyObjectColumns(n, t.ext.export_api._copyObjectPlainExcel(n));
    return i.start_date && (typeof i.start_date == "string" ? i.original_start_date = t.date.str_to_date(t.config.date_format)(i.start_date) : (i.original_start_date = i.start_date, i.start_date = e(n.start_date))), i.end_date ? typeof i.end_date == "string" ? i.original_end_date = t.date.str_to_date(t.config.date_format)(i.end_date) : (i.original_end_date = i.end_date, i.end_date = e(n.end_date)) : i.original_start_date && (i.original_end_date = t.calculateEndDate({ start_date: i.original_start_date, duration: i.duration, task: i }), i.end_date = e(i.original_end_date)), i;
  }, _generatedScales: null, _generateScales() {
    const n = t.getState(), e = Ve(t), i = [e.primaryScale(t.config)].concat(e.getSubScales(t.config)), a = e.prepareConfigs(i, t.config.min_column_width, 1e3, t.config.scale_height - 1, n.min_date, n.max_date, t.config.rtl);
    return t.ext.export_api._generatedScales = a, a;
  }, _getDayIndex(n, e) {
    let i = n.trace_indexes;
    if (i[+e]) return i[+e];
    {
      i = n.trace_x;
      const a = t.getState();
      return +e <= a.min_date ? t.config.rtl ? i.length : 0 : +e >= a.max_date ? t.config.rtl ? 0 : i.length : It(i, +e);
    }
  }, _copyObjectColors(n, e) {
    const i = t.ext.export_api._copyObjectTable(n);
    let a, r = i.original_start_date, s = i.original_end_date, o = t.columnIndexByDate;
    if (t.ext.export_api._generatedScales) {
      const h = t.ext.export_api._generatedScales;
      a = h[h.length - 1], i.$start = t.ext.export_api._getDayIndex(a, r), i.$end = t.ext.export_api._getDayIndex(a, s);
    } else a = t.getScale(), i.$start = o.call(t, r), i.$end = o.call(t, s);
    let l = 0;
    const d = a.width;
    if (d.indexOf(0) > -1) {
      let h = 0;
      for (; h < i.$start; h++) d[h] || l++;
      for (i.$start -= l; h < i.$end; h++) d[h] || l++;
      i.$end -= l;
    }
    i.$level = n.$level, i.$type = n.$rendered_type;
    const u = t.templates;
    i.$text = u.task_text(n.start, n.end_date, n), i.$left = u.leftside_text ? u.leftside_text(n.start, n.end_date, n) : "", i.$right = u.rightside_text ? u.rightside_text(n.start, n.end_date, n) : "";
    const c = t.getTaskNode && t.getTaskNode(n.id);
    if (c && c.firstChild) {
      let h = c;
      e.visual !== "base-colors" && (h = c.querySelector(".gantt_task_progress"));
      let _ = t.ext.export_api._getColor(h, "backgroundColor");
      _ === "363636" && (_ = t.ext.export_api._getColor(c, "backgroundColor")), i.$color = _;
    } else if (n.color) i.$color = n.color;
    else {
      const h = t.templates.task_class(n.start, n.end, n);
      if (h) {
        const _ = t.ext.export_api._getStyles(h);
        i.$color = _.split(";")[1];
      }
    }
    return i;
  }, _copyObjectColumns(n, e) {
    for (let i = 0; i < t.config.columns.length; i++) {
      const a = t.config.columns[i].template;
      if (a) {
        let r = a(n);
        r instanceof Date && (r = t.templates.date_grid(r, n)), e["_" + i] = r;
      }
    }
    return e;
  }, _copyObjectAll(n) {
    const e = t.ext.export_api._copyObjectBase(n), i = ["leftside_text", "rightside_text", "task_text", "progress_text", "task_class"];
    for (let a = 0; a < i.length; a++) {
      const r = t.templates[i[a]];
      r && (e["$" + a] = r(n.start_date, n.end_date, n));
    }
    return t.ext.export_api._copyObjectColumns(n, e), e.open = n.$open, e;
  }, _serializeHtml() {
    const n = t.config.smart_scales, e = t.config.smart_rendering;
    (n || e) && (t.config.smart_rendering = !1, t.config.smart_scales = !1, t.render());
    const i = t.$container.parentNode.innerHTML;
    return (n || e) && (t.config.smart_scales = n, t.config.smart_rendering = e, t.render()), i;
  }, _serializeAll() {
    t.json._copyObject = t.ext.export_api._copyObjectAll;
    const n = t.ext.export_api._exportSerialize();
    return t.json._copyObject = t.ext.export_api._originalCopyObject, n;
  }, _serializePlain() {
    const n = t.templates.xml_format, e = t.templates.format_date;
    t.templates.xml_format = t.date.date_to_str("%Y%m%dT%H%i%s", !0), t.templates.format_date = t.date.date_to_str("%Y%m%dT%H%i%s", !0), t.json._copyObject = t.ext.export_api._copyObjectPlainICal;
    const i = t.ext.export_api._exportSerialize();
    return t.templates.xml_format = n, t.templates.format_date = e, t.json._copyObject = t.ext.export_api._originalCopyObject, delete i.links, i;
  }, _getRaw() {
    const n = t.$ui.getView("timeline");
    if (n && t.config.show_chart) {
      let e = n.$config.width;
      t.config.autosize !== "x" && t.config.autosize !== "xy" || (e = Math.max(t.config.autosize_min_width, 0));
      const i = t.getState(), a = n._getScales(), r = t.config.min_column_width, s = t.config.scale_height - 1, o = t.config.rtl;
      return n.$scaleHelper.prepareConfigs(a, r, e, s, i.min_date, i.max_date, o);
    }
    return t.ext.export_api._generateScales();
  }, _serializeTimeline(n) {
    let e;
    t.ext.export_api._generatedScales = null, n.visual && (e = t.ext.export_api._getRaw(n.start, n.end)), n.data && (n.custom_dataset = !0);
    let i = n.data || t.serialize().data;
    if (i.forEach(function(a, r) {
      if (n.visual) if (a.render == "split") {
        const s = [];
        n.custom_dataset ? i.forEach(function(l) {
          if (l.parent == a.id) {
            const d = t.ext.export_api._copyObjectColors(l, n);
            d.$split_subtask = !0, s.push(d);
          }
        }) : t.eachTask(function(l) {
          const d = t.ext.export_api._copyObjectColors(l, n);
          s.push(d);
        }, a.id), a.split_bars = [];
        const o = {};
        for (let l = 0; l < s.length; l++) {
          const d = s[l];
          for (let u = 0; u < s.length; u++) {
            const c = s[u];
            if (d.id == c.id || o[c.id]) continue;
            const h = +d.original_start_date < +c.original_start_date && +c.original_start_date <= +d.original_end_date, _ = +c.original_start_date <= +d.original_start_date && +d.original_end_date <= +c.original_end_date;
            if (h && (d.original_end_date = c.original_start_date, d.end_date = c.start_date, d.$end = c.$start), _) {
              o[d.id] = !0;
              break;
            }
          }
          o[d.id] || a.split_bars.push(d);
        }
        i[r] = a;
      } else a.$split_subtask || (i[r] = t.ext.export_api._copyObjectColors(a, n));
      else i[r] = t.ext.export_api._copyObjectTable(a);
    }), n.raw && !n.data) {
      const a = t.getDatastore("task").visibleOrder;
      if (i.length !== a.length) {
        const r = [];
        i.forEach(function(s) {
          a.indexOf(s.id) > -1 && r.push(s);
        }), i = r;
      }
    }
    if (n.cellColors) {
      const a = t.templates.timeline_cell_class || t.templates.task_cell_class;
      if (a) {
        let r = e[0].trace_x;
        for (let s = 1; s < e.length; s++) e[s].trace_x.length > r.length && (r = e[s].trace_x);
        for (let s = 0; s < i.length; s++) {
          i[s].styles = [];
          const o = t.getTask(i[s].id);
          for (let l = 0; l < r.length; l++) {
            const d = a(o, r[l]);
            d && i[s].styles.push({ index: l, styles: t.ext.export_api._getStyles(d) });
          }
        }
      }
    }
    return i;
  }, _serializeScales(n) {
    const e = [], i = t.ext.export_api._getRaw();
    let a = 1 / 0, r = 0;
    for (let s = 0; s < i.length; s++) a = Math.min(a, i[s].col_width);
    for (let s = 0; s < i.length; s++) {
      let o = 0, l = 0;
      const d = [];
      e.push(d);
      const u = i[s];
      r = Math.max(r, u.trace_x.length);
      const c = u.format || u.template || t.date.date_to_str(u.date);
      for (let h = 0; h < u.trace_x.length; h++) {
        const _ = u.trace_x[h];
        l = o + Math.round(u.width[h] / a);
        const f = { text: c(_), start: o, end: l, styles: "" };
        if (n.cellColors) {
          const v = u.css || t.templates.scaleCell_class;
          if (v) {
            const k = v(_);
            k && (f.styles = t.ext.export_api._getStyles(k));
          }
        }
        d.push(f), o = l;
      }
    }
    return { width: r, height: e.length, data: e };
  }, _serializeGrid(n) {
    t.exportMode = !0;
    const e = [], i = t.config.columns;
    let a = 0;
    for (let r = 0; r < i.length; r++) i[r].name !== "add" && i[r].name !== "buttons" && (n && n.raw && i[r].hide || (e[a] = { id: i[r].template ? "_" + r : i[r].name, header: i[r].label || t.locale.labels["column_" + i[r].name], width: i[r].width ? Math.floor(i[r].width / 4) : "", tree: i[r].tree || !1 }, i[r].name === "duration" && (e[a].type = "number"), i[r].name !== "start_date" && i[r].name !== "end_date" || (e[a].type = "date", n && n.rawDates && (e[a].id = i[r].name)), a++));
    return t.exportMode = !1, e;
  }, _exportSerialize() {
    t.exportMode = !0;
    const n = t.templates.xml_format, e = t.templates.format_date;
    t.templates.xml_format = t.templates.format_date = t.date.date_to_str(t.config.date_format || t.config.xml_date);
    const i = t.serialize();
    return t.templates.xml_format = n, t.templates.format_date = e, t.exportMode = !1, i;
  }, _setLevel(n) {
    for (let e = 0; e < n.length; e++) {
      n[e].parent == 0 && (n[e]._lvl = 1);
      for (let i = e + 1; i < n.length; i++) n[e].id == n[i].parent && (n[i]._lvl = n[e]._lvl + 1);
    }
  }, _clearLevel(n) {
    for (let e = 0; e < n.length; e++) delete n[e]._lvl;
  }, _clearRecLinks(n) {
    t.ext.export_api._setLevel(n.data);
    const e = {};
    for (let r = 0; r < n.data.length; r++) e[n.data[r].id] = n.data[r];
    const i = {};
    for (let r = 0; r < n.links.length; r++) {
      const s = n.links[r];
      t.isTaskExists(s.source) && t.isTaskExists(s.target) && e[s.source] && e[s.target] && (i[s.id] = s);
    }
    for (const r in i) t.ext.export_api._makeLinksSameLevel(i[r], e);
    const a = {};
    for (const r in e) t.ext.export_api._clearCircDependencies(e[r], i, e, {}, a, null);
    Object.keys(i) && t.ext.export_api._clearLinksSameLevel(i, e);
    for (let r = 0; r < n.links.length; r++) i[n.links[r].id] || (n.links.splice(r, 1), r--);
    t.ext.export_api._clearLevel(n.data);
  }, _clearCircDependencies(n, e, i, a, r, s) {
    const o = n.$_source;
    if (!o) return;
    a[n.id] && t.ext.export_api._onCircDependencyFind(s, e, a, r), a[n.id] = !0;
    const l = {};
    for (let d = 0; d < o.length; d++) {
      if (r[o[d]]) continue;
      const u = e[o[d]], c = i[u._target];
      l[c.id] && t.ext.export_api._onCircDependencyFind(u, e, a, r), l[c.id] = !0, t.ext.export_api._clearCircDependencies(c, e, i, a, r, u);
    }
    a[n.id] = !1;
  }, _onCircDependencyFind(n, e, i, a) {
    n && (t.callEvent("onExportCircularDependency", [n.id, n]) && delete e[n.id], delete i[n._source], delete i[n._target], a[n.id] = !0);
  }, _makeLinksSameLevel(n, e) {
    let i, a;
    const r = { target: e[n.target], source: e[n.source] };
    if (r.target._lvl != r.source._lvl) {
      r.target._lvl < r.source._lvl ? (i = "source", a = r.target._lvl) : (i = "target", a = r.source._lvl);
      do {
        const l = e[r[i].parent];
        if (!l) break;
        r[i] = l;
      } while (r[i]._lvl < a);
      let s = e[r.source.parent], o = e[r.target.parent];
      for (; s && o && s.id != o.id; ) r.source = s, r.target = o, s = e[r.source.parent], o = e[r.target.parent];
    }
    n._target = r.target.id, n._source = r.source.id, r.target.$_target || (r.target.$_target = []), r.target.$_target.push(n.id), r.source.$_source || (r.source.$_source = []), r.source.$_source.push(n.id);
  }, _clearLinksSameLevel(n, e) {
    for (const i in n) delete n[i]._target, delete n[i]._source;
    for (const i in e) delete e[i].$_source, delete e[i].$_target;
  }, _customProjectProperties(n, e) {
    if (e && e.project) {
      for (const i in e.project) t.config.$custom_data || (t.config.$custom_data = {}), t.config.$custom_data[i] = typeof e.project[i] == "function" ? e.project[i](t.config) : e.project[i];
      delete e.project;
    }
  }, _customTaskProperties(n, e) {
    e && e.tasks && (n.data.forEach(function(i) {
      for (const a in e.tasks) i.$custom_data || (i.$custom_data = {}), i.$custom_data[a] = typeof e.tasks[a] == "function" ? e.tasks[a](i, t.config) : e.tasks[a];
    }), delete e.tasks);
  }, _exportConfig(n, e) {
    const i = e.name || "gantt.xml";
    delete e.name, t.config.custom = e;
    const a = t.ext.export_api._getWorktimeSettings(), r = t.getSubtaskDates();
    if (r.start_date && r.end_date) {
      const l = t.templates.format_date || t.templates.xml_format;
      t.config.start_end = { start_date: l(r.start_date), end_date: l(r.end_date) };
    }
    const s = !!t._getAutoSchedulingConfig().enabled, o = { callback: e.callback || null, config: t.config, data: n, manual: s, name: i, worktime: a };
    for (const l in e) o[l] = e[l];
    return o;
  }, _sendImportAjaxMSP(n) {
    const e = n.server || t.ext.export_api._apiUrl, i = n.store || 0, a = n.data, r = n.callback, s = { durationUnit: n.durationUnit || void 0, projectProperties: n.projectProperties || void 0, taskProperties: n.taskProperties || void 0, resourceProperties: n.resourceProperties || void 0 };
    a.append("type", n.type || "msproject-parse"), a.append("data", JSON.stringify(s)), i && a.append("store", i);
    const o = new XMLHttpRequest();
    o.onreadystatechange = function(l) {
      o.readyState === 4 && o.status === 0 && r && r(null);
    }, o.onload = function() {
      let l = null;
      if (!(o.status > 400)) try {
        l = JSON.parse(o.responseText);
      } catch {
      }
      r && r(l);
    }, o.open("POST", e, !0), o.setRequestHeader("X-Requested-With", "XMLHttpRequest"), o.send(a);
  } }, t.exportToPDF = t.ext.export_api.exportToPDF, t.exportToPNG = t.ext.export_api.exportToPNG, t.exportToICal = t.ext.export_api.exportToICal, t.exportToExcel = t.ext.export_api.exportToExcel, t.exportToJSON = t.ext.export_api.exportToJSON, t.importFromExcel = t.ext.export_api.importFromExcel, t.importFromMSProject = t.ext.export_api.importFromMSProject, t.exportToMSProject = t.ext.export_api.exportToMSProject, t.importFromPrimaveraP6 = t.ext.export_api.importFromPrimaveraP6, t.exportToPrimaveraP6 = t.ext.export_api.exportToPrimaveraP6, t.ext.export_api;
} }, Ci = { KEY_CODES: { UP: 38, DOWN: 40, LEFT: 37, RIGHT: 39, SPACE: 32, ENTER: 13, DELETE: 46, ESC: 27, TAB: 9 } };
class Ei {
  constructor(n) {
    this.addExtension = (e, i) => {
      this._extensions[e] = i;
    }, this.getExtension = (e) => this._extensions[e], this._extensions = {};
    for (const e in n) this._extensions[e] = n[e];
  }
}
var vt = typeof window < "u";
const gt = typeof navigator < "u" ? navigator : { userAgent: "" }, yt = { isIE: vt && (gt.userAgent.indexOf("MSIE") >= 0 || gt.userAgent.indexOf("Trident") >= 0), isOpera: vt && (gt.userAgent.indexOf("Opera") >= 0 || gt.userAgent.indexOf("OPR") >= 0), isChrome: vt && gt.userAgent.indexOf("Chrome") >= 0, isSafari: vt && (gt.userAgent.indexOf("Safari") >= 0 || gt.userAgent.indexOf("Konqueror") >= 0), isFF: vt && gt.userAgent.indexOf("Firefox") >= 0, isIPad: vt && gt.userAgent.search(/iPad/gi) >= 0, isEdge: vt && gt.userAgent.indexOf("Edge") != -1, isNode: !vt || typeof navigator > "u" || !1, isSalesforce: vt && (!!tt.Sfdc || !!tt.$A || tt.Aura) };
function rn(t) {
  if (typeof t == "string" || typeof t == "number") return t;
  let n = "";
  for (const e in t) {
    let i = "";
    t.hasOwnProperty(e) && (i = typeof t[e] == "string" ? encodeURIComponent(t[e]) : typeof t[e] == "number" ? String(t[e]) : encodeURIComponent(JSON.stringify(t[e])), i = e + "=" + i, n.length && (i = "&" + i), n += i);
  }
  return n;
}
function At(t, n) {
  var e = { method: t };
  if (n.length === 0) throw new Error("Arguments list of query is wrong.");
  if (n.length === 1) return typeof n[0] == "string" ? (e.url = n[0], e.async = !0) : (e.url = n[0].url, e.async = n[0].async || !0, e.callback = n[0].callback, e.headers = n[0].headers), n[0].data ? typeof n[0].data != "string" ? e.data = rn(n[0].data) : e.data = n[0].data : e.data = "", e;
  switch (e.url = n[0], t) {
    case "GET":
    case "DELETE":
      e.callback = n[1], e.headers = n[2];
      break;
    case "POST":
    case "PUT":
      n[1] ? typeof n[1] != "string" ? e.data = rn(n[1]) : e.data = n[1] : e.data = "", e.callback = n[2], e.headers = n[3];
  }
  return e;
}
const sn = { date_to_str: (t, n, e) => {
  t = t.replace(/%[a-zA-Z]/g, (a) => {
    switch (a) {
      case "%d":
        return `"+to_fixed(date.get${n ? "UTC" : ""}Date())+"`;
      case "%m":
        return `"+to_fixed((date.get${n ? "UTC" : ""}Month()+1))+"`;
      case "%j":
        return `"+date.get${n ? "UTC" : ""}Date()+"`;
      case "%n":
        return `"+(date.get${n ? "UTC" : ""}Month()+1)+"`;
      case "%y":
        return `"+to_fixed(date.get${n ? "UTC" : ""}FullYear()%100)+"`;
      case "%Y":
        return `"+date.get${n ? "UTC" : ""}FullYear()+"`;
      case "%D":
        return `"+locale.date.day_short[date.get${n ? "UTC" : ""}Day()]+"`;
      case "%l":
        return `"+locale.date.day_full[date.get${n ? "UTC" : ""}Day()]+"`;
      case "%M":
        return `"+locale.date.month_short[date.get${n ? "UTC" : ""}Month()]+"`;
      case "%F":
        return `"+locale.date.month_full[date.get${n ? "UTC" : ""}Month()]+"`;
      case "%h":
        return `"+to_fixed((date.get${n ? "UTC" : ""}Hours()+11)%12+1)+"`;
      case "%g":
        return `"+((date.get${n ? "UTC" : ""}Hours()+11)%12+1)+"`;
      case "%G":
        return `"+date.get${n ? "UTC" : ""}Hours()+"`;
      case "%H":
        return `"+to_fixed(date.get${n ? "UTC" : ""}Hours())+"`;
      case "%i":
        return `"+to_fixed(date.get${n ? "UTC" : ""}Minutes())+"`;
      case "%a":
        return `"+(date.get${n ? "UTC" : ""}Hours()>11?"pm":"am")+"`;
      case "%A":
        return `"+(date.get${n ? "UTC" : ""}Hours()>11?"PM":"AM")+"`;
      case "%s":
        return `"+to_fixed(date.get${n ? "UTC" : ""}Seconds())+"`;
      case "%W":
        return '"+to_fixed(getISOWeek(date))+"';
      case "%w":
        return '"+to_fixed(getWeek(date))+"';
      default:
        return a;
    }
  });
  const i = new Function("date", "to_fixed", "locale", "getISOWeek", "getWeek", `return "${t}";`);
  return (a) => i(a, e.date.to_fixed, e.locale, e.date.getISOWeek, e.date.getWeek);
}, str_to_date: (t, n, e) => {
  let i = "var temp=date.match(/[a-zA-Z]+|[0-9]+/g);";
  const a = t.match(/%[a-zA-Z]/g);
  for (let o = 0; o < a.length; o++) switch (a[o]) {
    case "%j":
    case "%d":
      i += `set[2]=temp[${o}]||1;`;
      break;
    case "%n":
    case "%m":
      i += `set[1]=(temp[${o}]||1)-1;`;
      break;
    case "%y":
      i += `set[0]=temp[${o}]*1+(temp[${o}]>50?1900:2000);`;
      break;
    case "%g":
    case "%G":
    case "%h":
    case "%H":
      i += `set[3]=temp[${o}]||0;`;
      break;
    case "%i":
      i += `set[4]=temp[${o}]||0;`;
      break;
    case "%Y":
      i += `set[0]=temp[${o}]||0;`;
      break;
    case "%a":
    case "%A":
      i += `set[3]=set[3]%12+((temp[${o}]||'').toLowerCase()=='am'?0:12);`;
      break;
    case "%s":
      i += `set[5]=temp[${o}]||0;`;
      break;
    case "%M":
      i += `set[1]=locale.date.month_short_hash[temp[${o}]]||0;`;
      break;
    case "%F":
      i += `set[1]=locale.date.month_full_hash[temp[${o}]]||0;`;
  }
  let r = "set[0],set[1],set[2],set[3],set[4],set[5]";
  n && (r = ` Date.UTC(${r})`);
  const s = new Function("date", "locale", `var set=[0,0,1,0,0,0]; ${i} return new Date(${r});`);
  return (o) => s(o, e.locale);
} }, on = { date_to_str: (t, n, e) => (i) => t.replace(/%[a-zA-Z]/g, (a) => {
  switch (a) {
    case "%d":
      return n ? e.date.to_fixed(i.getUTCDate()) : e.date.to_fixed(i.getDate());
    case "%m":
      return n ? e.date.to_fixed(i.getUTCMonth() + 1) : e.date.to_fixed(i.getMonth() + 1);
    case "%j":
      return n ? i.getUTCDate() : i.getDate();
    case "%n":
      return n ? i.getUTCMonth() + 1 : i.getMonth() + 1;
    case "%y":
      return n ? e.date.to_fixed(i.getUTCFullYear() % 100) : e.date.to_fixed(i.getFullYear() % 100);
    case "%Y":
      return n ? i.getUTCFullYear() : i.getFullYear();
    case "%D":
      return n ? e.locale.date.day_short[i.getUTCDay()] : e.locale.date.day_short[i.getDay()];
    case "%l":
      return n ? e.locale.date.day_full[i.getUTCDay()] : e.locale.date.day_full[i.getDay()];
    case "%M":
      return n ? e.locale.date.month_short[i.getUTCMonth()] : e.locale.date.month_short[i.getMonth()];
    case "%F":
      return n ? e.locale.date.month_full[i.getUTCMonth()] : e.locale.date.month_full[i.getMonth()];
    case "%h":
      return n ? e.date.to_fixed((i.getUTCHours() + 11) % 12 + 1) : e.date.to_fixed((i.getHours() + 11) % 12 + 1);
    case "%g":
      return n ? (i.getUTCHours() + 11) % 12 + 1 : (i.getHours() + 11) % 12 + 1;
    case "%G":
      return n ? i.getUTCHours() : i.getHours();
    case "%H":
      return n ? e.date.to_fixed(i.getUTCHours()) : e.date.to_fixed(i.getHours());
    case "%i":
      return n ? e.date.to_fixed(i.getUTCMinutes()) : e.date.to_fixed(i.getMinutes());
    case "%a":
      return n ? i.getUTCHours() > 11 ? "pm" : "am" : i.getHours() > 11 ? "pm" : "am";
    case "%A":
      return n ? i.getUTCHours() > 11 ? "PM" : "AM" : i.getHours() > 11 ? "PM" : "AM";
    case "%s":
      return n ? e.date.to_fixed(i.getUTCSeconds()) : e.date.to_fixed(i.getSeconds());
    case "%W":
      return n ? e.date.to_fixed(e.date.getUTCISOWeek(i)) : e.date.to_fixed(e.date.getISOWeek(i));
    case "%w":
      return e.date.to_fixed(e.date.getWeek(i));
    default:
      return a;
  }
}), str_to_date: (t, n, e) => (i) => {
  const a = [0, 0, 1, 0, 0, 0], r = i.match(/[a-zA-Z]+|[0-9]+/g), s = t.match(/%[a-zA-Z]/g);
  for (let o = 0; o < s.length; o++) switch (s[o]) {
    case "%j":
    case "%d":
      a[2] = r[o] || 1;
      break;
    case "%n":
    case "%m":
      a[1] = (r[o] || 1) - 1;
      break;
    case "%y":
      a[0] = 1 * r[o] + (r[o] > 50 ? 1900 : 2e3);
      break;
    case "%g":
    case "%G":
    case "%h":
    case "%H":
      a[3] = r[o] || 0;
      break;
    case "%i":
      a[4] = r[o] || 0;
      break;
    case "%Y":
      a[0] = r[o] || 0;
      break;
    case "%a":
    case "%A":
      a[3] = a[3] % 12 + ((r[o] || "").toLowerCase() === "am" ? 0 : 12);
      break;
    case "%s":
      a[5] = r[o] || 0;
      break;
    case "%M":
      a[1] = e.locale.date.month_short_hash[r[o]] || 0;
      break;
    case "%F":
      a[1] = e.locale.date.month_full_hash[r[o]] || 0;
  }
  return n ? new Date(Date.UTC(a[0], a[1], a[2], a[3], a[4], a[5])) : new Date(a[0], a[1], a[2], a[3], a[4], a[5]);
} };
function Di(t) {
  var n = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/, e = null;
  function i() {
    var r = !1;
    return t.config.csp === "auto" ? (e === null && function() {
      try {
        new Function("canUseCsp = false;");
      } catch {
        e = !0;
      }
    }(), r = e) : r = t.config.csp, r;
  }
  var a = { _isoDateDetected: !1, _isoDateOnly: !1, formatISODate: function(r) {
    return r.toISOString();
  }, formatISODateOnly: function(r) {
    return r.getFullYear() + "-" + t.date.to_fixed(r.getMonth() + 1) + "-" + t.date.to_fixed(r.getDate());
  }, init: function() {
    for (var r = t.locale, s = r.date.month_short, o = r.date.month_short_hash = {}, l = 0; l < s.length; l++) o[s[l]] = l;
    for (s = r.date.month_full, o = r.date.month_full_hash = {}, l = 0; l < s.length; l++) o[s[l]] = l;
  }, date_part: function(r) {
    var s = new Date(r);
    return r.setHours(0), this.hour_start(r), r.getHours() && (r.getDate() < s.getDate() || r.getMonth() < s.getMonth() || r.getFullYear() < s.getFullYear()) && r.setTime(r.getTime() + 36e5 * (24 - r.getHours())), r;
  }, time_part: function(r) {
    return (r.valueOf() / 1e3 - 60 * r.getTimezoneOffset()) % 86400;
  }, week_start: function(r) {
    var s = r.getDay();
    return t.config.start_on_monday && (s === 0 ? s = 6 : s--), this.date_part(this.add(r, -1 * s, "day"));
  }, month_start: function(r) {
    return r.setDate(1), this.date_part(r);
  }, quarter_start: function(r) {
    this.month_start(r);
    var s, o = r.getMonth();
    return s = o >= 9 ? 9 : o >= 6 ? 6 : o >= 3 ? 3 : 0, r.setMonth(s), r;
  }, year_start: function(r) {
    return r.setMonth(0), this.month_start(r);
  }, day_start: function(r) {
    return this.date_part(r);
  }, hour_start: function(r) {
    return r.getMinutes() && r.setMinutes(0), this.minute_start(r), r;
  }, minute_start: function(r) {
    return r.getSeconds() && r.setSeconds(0), r.getMilliseconds() && r.setMilliseconds(0), r;
  }, _add_days: function(r, s, o) {
    r.setDate(r.getDate() + s);
    var l = s >= 0, d = !o.getHours() && r.getHours(), u = r.getDate() <= o.getDate() || r.getMonth() < o.getMonth() || r.getFullYear() < o.getFullYear();
    return l && d && u && r.setTime(r.getTime() + 36e5 * (24 - r.getHours())), s > 1 && d && r.setHours(0), r;
  }, add: function(r, s, o) {
    var l = new Date(r.valueOf());
    switch (o) {
      case "day":
        l = this._add_days(l, s, r);
        break;
      case "week":
        l = this._add_days(l, 7 * s, r);
        break;
      case "month":
        l.setMonth(l.getMonth() + s);
        break;
      case "year":
        l.setYear(l.getFullYear() + s);
        break;
      case "hour":
        l.setTime(l.getTime() + 60 * s * 60 * 1e3);
        break;
      case "minute":
        l.setTime(l.getTime() + 60 * s * 1e3);
        break;
      default:
        return this["add_" + o](r, s, o);
    }
    return l;
  }, add_quarter: function(r, s) {
    return this.add(r, 3 * s, "month");
  }, to_fixed: function(r) {
    return r < 10 ? "0" + r : r;
  }, copy: function(r) {
    return new Date(r.valueOf());
  }, date_to_str: function(r, s) {
    var o = sn;
    return i() && (o = on), o.date_to_str(r, s, t);
  }, str_to_date: function(r, s) {
    var o = sn;
    return i() && (o = on), o.str_to_date(r, s, t);
  }, getISOWeek: function(r) {
    return t.date._getWeekNumber(r, !0);
  }, _getWeekNumber: function(r, s) {
    if (!r) return !1;
    var o = r.getDay();
    s && o === 0 && (o = 7);
    var l = new Date(r.valueOf());
    l.setDate(r.getDate() + (4 - o));
    var d = l.getFullYear(), u = Math.round((l.getTime() - new Date(d, 0, 1).getTime()) / 864e5);
    return 1 + Math.floor(u / 7);
  }, getWeek: function(r) {
    return t.date._getWeekNumber(r, t.config.start_on_monday);
  }, getUTCISOWeek: function(r) {
    return t.date.getISOWeek(r);
  }, convert_to_utc: function(r) {
    return new Date(r.getUTCFullYear(), r.getUTCMonth(), r.getUTCDate(), r.getUTCHours(), r.getUTCMinutes(), r.getUTCSeconds());
  }, parseDate: function(r, s) {
    if (r && !r.getFullYear) {
      if (!((!s || s === "parse_date" || s === "xml_date") && (t.defined(t.templates.xml_date) || t.templates.parse_date && !t.templates.parse_date._ganttAuto)) && typeof r == "string" && n.test(r)) {
        var o = r.indexOf("T") !== -1, l = function(d) {
          if (d.indexOf("T") === -1 && !t.config.server_utc) {
            var u = d.split("-");
            return new Date(parseInt(u[0], 10), parseInt(u[1], 10) - 1, parseInt(u[2], 10));
          }
          var c = new Date(d);
          return isNaN(c.getTime()) ? null : t.config.server_utc ? t.date.convert_to_utc(c) : c;
        }(r);
        if (l) return a._isoDateDetected ? o && (a._isoDateOnly = !1) : (a._isoDateDetected = !0, a._isoDateOnly = !o), l;
      }
      typeof s != "function" && (s = typeof s == "string" ? s === "parse_date" || s === "xml_date" ? t.defined(t.templates.xml_date) ? t.templates.xml_date : t.templates.parse_date : t.defined(t.templates[s]) ? t.templates[s] : t.date.str_to_date(s) : t.defined(t.templates.xml_date) ? t.templates.xml_date : t.templates.parse_date), r = r ? s(r) : null;
    }
    return r;
  } };
  return a;
}
class jn {
  constructor(n) {
    const { url: e, token: i } = n;
    this._url = e, this._token = i, this._mode = 1, this._seed = 1, this._queue = [], this.data = {}, this.api = {}, this._events = {};
  }
  headers() {
    return { Accept: "application/json", "Content-Type": "application/json", "Remote-Token": this._token };
  }
  fetch(n, e) {
    const i = { credentials: "include", headers: this.headers() };
    return e && (i.method = "POST", i.body = e), fetch(n, i).then((a) => a.json());
  }
  load(n) {
    return n && (this._url = n), this.fetch(this._url).then((e) => this.parse(e));
  }
  parse(n) {
    const { key: e, websocket: i } = n;
    e && (this._token = n.key);
    for (const a in n.data) this.data[a] = n.data[a];
    for (const a in n.api) {
      const r = this.api[a] = {}, s = n.api[a];
      for (const o in s) r[o] = this._wrapper(a + "." + o);
    }
    return i && this.connect(), this;
  }
  connect() {
    const n = this._socket;
    n && (this._socket = null, n.onclose = function() {
    }, n.close()), this._mode = 2, this._socket = function(e, i, a, r) {
      let s = i;
      s[0] === "/" && (s = document.location.protocol + "//" + document.location.host + i), s = s.replace(/^http(s|):/, "ws$1:");
      const o = s.indexOf("?") != -1 ? "&" : "?";
      s = `${s}${o}token=${a}&ws=1`;
      const l = new WebSocket(s);
      return l.onclose = () => setTimeout(() => e.connect(), 2e3), l.onmessage = (d) => {
        const u = JSON.parse(d.data);
        switch (u.action) {
          case "result":
            e.result(u.body, []);
            break;
          case "event":
            e.fire(u.body.name, u.body.value);
            break;
          case "start":
            r();
            break;
          default:
            e.onError(u.data);
        }
      }, l;
    }(this, this._url, this._token, () => (this._mode = 3, this._send(), this._resubscribe(), this));
  }
  _wrapper(n) {
    return (function() {
      const e = [].slice.call(arguments);
      let i = null;
      const a = new Promise((r, s) => {
        i = { data: { id: this._uid(), name: n, args: e }, status: 1, resolve: r, reject: s }, this._queue.push(i);
      });
      return this.onCall(i, a), this._mode === 3 ? this._send(i) : setTimeout(() => this._send(), 1), a;
    }).bind(this);
  }
  _uid() {
    return (this._seed++).toString();
  }
  _send(n) {
    if (this._mode == 2) return void setTimeout(() => this._send(), 100);
    const e = n ? [n] : this._queue.filter((a) => a.status === 1);
    if (!e.length) return;
    const i = e.map((a) => (a.status = 2, a.data));
    this._mode !== 3 ? this.fetch(this._url, JSON.stringify(i)).catch((a) => this.onError(a)).then((a) => this.result(a, i)) : this._socket.send(JSON.stringify({ action: "call", body: i }));
  }
  result(n, e) {
    const i = {};
    if (n) for (let a = 0; a < n.length; a++) i[n[a].id] = n[a];
    else for (let a = 0; a < e.length; a++) i[e[a].id] = { id: e[a].id, error: "Network Error", data: null };
    for (let a = this._queue.length - 1; a >= 0; a--) {
      const r = this._queue[a], s = i[r.data.id];
      s && (this.onResponse(r, s), s.error ? r.reject(s.error) : r.resolve(s.data), this._queue.splice(a, 1));
    }
  }
  on(n, e) {
    const i = this._uid();
    let a = this._events[n];
    const r = !!a;
    return r || (a = this._events[n] = []), a.push({ id: i, handler: e }), r || this._mode != 3 || this._socket.send(JSON.stringify({ action: "subscribe", name: n })), { name: n, id: i };
  }
  _resubscribe() {
    if (this._mode == 3) for (const n in this._events) this._socket.send(JSON.stringify({ action: "subscribe", name: n }));
  }
  detach(n) {
    if (!n) {
      if (this._mode == 3) for (const r in this._events) this._socket.send(JSON.stringify({ action: "unsubscribe", key: r }));
      return void (this._events = {});
    }
    const { id: e, name: i } = n, a = this._events[i];
    if (a) {
      const r = a.filter((s) => s.id != e);
      r.length ? this._events[i] = r : (delete this._events[i], this._mode == 3 && this._socket.send(JSON.stringify({ action: "unsubscribe", name: i })));
    }
  }
  fire(n, e) {
    const i = this._events[n];
    if (i) for (let a = 0; a < i.length; a++) i[a].handler(e);
  }
  onError(n) {
    return null;
  }
  onCall(n, e) {
  }
  onResponse(n, e) {
  }
}
const Ai = function(t, n) {
  const e = new jn({ url: t, token: n });
  e.fetch = function(i, a) {
    const r = { headers: this.headers() };
    return a && (r.method = "POST", r.body = a), fetch(i, r).then((s) => s.json());
  }, this._ready = e.load().then((i) => this._remote = i), this.ready = function() {
    return this._ready;
  }, this.on = function(i, a) {
    this.ready().then((r) => {
      if (typeof i == "string") r.on(i, a);
      else for (const s in i) r.on(s, i[s]);
    });
  };
};
function Fn(t, n) {
  if (!n) return !0;
  if (t._on_timeout) return !1;
  var e = Math.ceil(1e3 / n);
  return e < 2 || (setTimeout(function() {
    delete t._on_timeout;
  }, e), t._on_timeout = !0), !0;
}
var Ii = function() {
  var t = {};
  return { getState: function(n) {
    if (t[n]) return t[n].method();
    var e = {};
    for (var i in t) t[i].internal || H(e, t[i].method(), !0);
    return e;
  }, registerProvider: function(n, e, i) {
    t[n] = { method: e, internal: i };
  }, unregisterProvider: function(n) {
    delete t[n];
  } };
};
const Mi = Promise;
var rt = { $create: function(t) {
  return H(t || [], this);
}, $removeAt: function(t, n) {
  t >= 0 && this.splice(t, n || 1);
}, $remove: function(t) {
  this.$removeAt(this.$find(t));
}, $insertAt: function(t, n) {
  if (n || n === 0) {
    var e = this.splice(n, this.length - n);
    this[n] = t, this.push.apply(this, e);
  } else this.push(t);
}, $find: function(t) {
  for (var n = 0; n < this.length; n++) if (t == this[n]) return n;
  return -1;
}, $each: function(t, n) {
  for (var e = 0; e < this.length; e++) t.call(n || this, this[e]);
}, $map: function(t, n) {
  for (var e = 0; e < this.length; e++) this[e] = t.call(n || this, this[e]);
  return this;
}, $filter: function(t, n) {
  for (var e = 0; e < this.length; e++) t.call(n || this, this[e]) || (this.splice(e, 1), e--);
  return this;
} };
function Ut(t, n, e, i) {
  return (i = n ? n.config : i) && i.placeholder_task && e.exists(t) ? e.getItem(t).type === i.types.placeholder : !1;
}
var st = function(t) {
  return this.pull = {}, this.$initItem = t.initItem, this.visibleOrder = rt.$create(), this.fullOrder = rt.$create(), this._skip_refresh = !1, this._filterRule = null, this._searchVisibleOrder = {}, this._indexRangeCache = {}, this._getItemsCache = null, this.$config = t, _t(this), this._attachDataChange(function() {
    return this._indexRangeCache = {}, this._getItemsCache = null, !0;
  }), this;
};
st.prototype = { _attachDataChange: function(t) {
  this.attachEvent("onClearAll", t), this.attachEvent("onBeforeParse", t), this.attachEvent("onBeforeUpdate", t), this.attachEvent("onBeforeDelete", t), this.attachEvent("onBeforeAdd", t), this.attachEvent("onParse", t), this.attachEvent("onBeforeFilter", t);
}, _parseInner: function(t) {
  for (var n = null, e = [], i = 0, a = t.length; i < a; i++) n = t[i], this.$initItem && (this.$config.copyOnParse() && (n = J(n)), n = this.$initItem(n)), this.callEvent("onItemLoading", [n]) && (this.pull.hasOwnProperty(n.id) || this.fullOrder.push(n.id), e.push(n), this.pull[n.id] = n);
  return e;
}, parse: function(t) {
  this.isSilent() || this.callEvent("onBeforeParse", [t]);
  var n = this._parseInner(t);
  this.isSilent() || (this.refresh(), this.callEvent("onParse", [n]));
}, getItem: function(t) {
  return this.pull[t];
}, _updateOrder: function(t) {
  t.call(this.visibleOrder), t.call(this.fullOrder);
}, updateItem: function(t, n) {
  if (U(n) || (n = this.getItem(t)), !this.isSilent() && this.callEvent("onBeforeUpdate", [n.id, n]) === !1) return !1;
  H(this.pull[t], n, !0), this.isSilent() || (this.callEvent("onAfterUpdate", [n.id, n]), this.callEvent("onStoreUpdated", [n.id, n, "update"]));
}, _removeItemInner: function(t) {
  this._updateOrder(function() {
    this.$remove(t);
  }), delete this.pull[t];
}, removeItem: function(t) {
  var n = this.getItem(t);
  if (!this.isSilent() && this.callEvent("onBeforeDelete", [n.id, n]) === !1) return !1;
  this.callEvent("onAfterDeleteConfirmed", [n.id, n]), this._removeItemInner(t), this.isSilent() && this.callEvent("onAfterSilentDelete", [n.id, n]), this.isSilent() || (this.filter(), this.callEvent("onAfterDelete", [n.id, n]), this.callEvent("onStoreUpdated", [n.id, n, "delete"]));
}, _addItemInner: function(t, n) {
  if (this.exists(t.id)) this.silent(function() {
    this.updateItem(t.id, t);
  });
  else {
    var e = this.visibleOrder, i = e.length;
    (!U(n) || n < 0) && (n = i), n > i && (n = Math.min(e.length, n));
  }
  this.pull[t.id] = t, this._updateOrder(function() {
    this.$find(t.id) === -1 && this.$insertAt(t.id, n);
  }), this.filter();
}, isVisible: function(t) {
  return this.visibleOrder.$find(t) > -1;
}, getVisibleItems: function() {
  return this.getIndexRange();
}, addItem: function(t, n) {
  return U(t.id) || (t.id = ut()), this.$initItem && (t = this.$initItem(t)), !(!this.isSilent() && this.callEvent("onBeforeAdd", [t.id, t]) === !1) && (this._addItemInner(t, n), this.isSilent() ? this.sync_link && this.sync_link(t) : (this.callEvent("onAfterAdd", [t.id, t]), this.callEvent("onStoreUpdated", [t.id, t, "add"])), t.id);
}, _changeIdInner: function(t, n) {
  this.pull[t] && (this.pull[n] = this.pull[t]);
  var e = this._searchVisibleOrder[t];
  this.pull[n].id = n, this._updateOrder(function() {
    this[this.$find(t)] = n;
  }), this._searchVisibleOrder[n] = e, delete this._searchVisibleOrder[t], delete this.pull[t];
}, changeId: function(t, n) {
  this._changeIdInner(t, n), this.callEvent("onIdChange", [t, n]);
}, exists: function(t) {
  return !!this.pull[t];
}, _moveInner: function(t, n) {
  var e = this.getIdByIndex(t);
  this._updateOrder(function() {
    this.$removeAt(t), this.$insertAt(e, Math.min(this.length, n));
  });
}, move: function(t, n) {
  var e = this.getIdByIndex(t), i = this.getItem(e);
  this._moveInner(t, n), this.isSilent() || this.callEvent("onStoreUpdated", [i.id, i, "move"]);
}, clearAll: function() {
  this.$destroyed || (this.silent(function() {
    this.unselect();
  }), this.pull = {}, this.visibleOrder = rt.$create(), this.fullOrder = rt.$create(), this.isSilent() || (this.callEvent("onClearAll", []), this.refresh()));
}, silent: function(t, n) {
  var e = !1;
  this.isSilent() && (e = !0), this._skip_refresh = !0, t.call(n || this), e || (this._skip_refresh = !1);
}, isSilent: function() {
  return !!this._skip_refresh;
}, arraysEqual: function(t, n) {
  if (t.length !== n.length) return !1;
  for (var e = 0; e < t.length; e++) if (t[e] !== n[e]) return !1;
  return !0;
}, refresh: function(t, n) {
  var e, i;
  if (!this.$destroyed && !this.isSilent() && (t && (e = this.getItem(t)), i = t ? [t, e, "paint"] : [null, null, null], this.callEvent("onBeforeStoreUpdate", i) !== !1)) {
    var a = this._quick_refresh && !this._mark_recompute;
    if (this._mark_recompute = !1, t) {
      if (!n && !a) {
        var r = this.visibleOrder;
        this.filter(), this.arraysEqual(r, this.visibleOrder) || (t = void 0);
      }
    } else a || this.filter();
    i = t ? [t, e, "paint"] : [null, null, null], this.callEvent("onStoreUpdated", i);
  }
}, count: function() {
  return this.fullOrder.length;
}, countVisible: function() {
  return this.visibleOrder.length;
}, sort: function(t) {
}, serialize: function() {
}, eachItem: function(t) {
  for (var n = 0; n < this.fullOrder.length; n++) {
    var e = this.getItem(this.fullOrder[n]);
    t.call(this, e);
  }
}, find: function(t) {
  var n = [];
  return this.eachItem(function(e) {
    t(e) && n.push(e);
  }), n;
}, filter: function(t) {
  this.isSilent() || this.callEvent("onBeforeFilter", []), this.callEvent("onPreFilter", []);
  var n = rt.$create(), e = [];
  this.eachItem(function(a) {
    this.callEvent("onFilterItem", [a.id, a]) && (Ut(a.id, null, this, this._ganttConfig) ? e.push(a.id) : n.push(a.id));
  });
  for (var i = 0; i < e.length; i++) n.push(e[i]);
  for (this.visibleOrder = n, this._searchVisibleOrder = {}, i = 0; i < this.visibleOrder.length; i++) this._searchVisibleOrder[this.visibleOrder[i]] = i;
  this.isSilent() || this.callEvent("onFilter", []);
}, getIndexRange: function(t, n) {
  var e = Math.min(n || 1 / 0, this.countVisible() - 1), i = t || 0, a = i + "-" + e;
  if (this._indexRangeCache[a]) return this._indexRangeCache[a].slice();
  for (var r = [], s = i; s <= e; s++) r.push(this.getItem(this.visibleOrder[s]));
  return this._indexRangeCache[a] = r.slice(), r;
}, getItems: function() {
  if (this._getItemsCache) return this._getItemsCache.slice();
  var t = [];
  for (var n in this.pull) t.push(this.pull[n]);
  return this._getItemsCache = t.slice(), t;
}, getIdByIndex: function(t) {
  return this.visibleOrder[t];
}, getIndexById: function(t) {
  var n = this._searchVisibleOrder[t];
  return n === void 0 && (n = -1), n;
}, _getNullIfUndefined: function(t) {
  return t === void 0 ? null : t;
}, getFirst: function() {
  return this._getNullIfUndefined(this.visibleOrder[0]);
}, getLast: function() {
  return this._getNullIfUndefined(this.visibleOrder[this.visibleOrder.length - 1]);
}, getNext: function(t) {
  return this._getNullIfUndefined(this.visibleOrder[this.getIndexById(t) + 1]);
}, getPrev: function(t) {
  return this._getNullIfUndefined(this.visibleOrder[this.getIndexById(t) - 1]);
}, destructor: function() {
  this.callEvent("onDestroy", []), this.detachAllEvents(), this.$destroyed = !0, this.pull = null, this.$initItem = null, this.visibleOrder = null, this.fullOrder = null, this._skip_refresh = null, this._filterRule = null, this._searchVisibleOrder = null, this._indexRangeCache = {};
} };
class Wn {
  constructor(n) {
    this._datastore = null, this.isSplitItem = (e) => e.render == "split" && this._datastore.hasChild(e.id), this.isSubrowSplitItem = (e) => e.split_placement == "subrow", this.isDefaultSplitItem = (e) => e.split_placement == "auto" || e.split_placement === void 0, this.isInlineSplitItem = (e) => e.split_placement == "inline", this._datastore = n;
  }
}
var Ue = function(t) {
  var n;
  st.apply(this, [t]), this._branches = {}, this._splitTaskHelper = new Wn(this), this.pull = {}, this.$initItem = function(o) {
    var l = o;
    t.initItem && (l = t.initItem(l));
    var d = this.getItem(o.id);
    return d && !ft(d.parent, l.parent) && this.move(l.id, l.$index || -1, l.parent || this._ganttConfig.root_id), l;
  }, this.$parentProperty = t.parentProperty || "parent", typeof t.rootId != "function" ? this.$getRootId = (n = t.rootId || 0, function() {
    return n;
  }) : this.$getRootId = t.rootId, this.$openInitially = t.openInitially, this.visibleOrder = rt.$create(), this.fullOrder = rt.$create(), this._searchVisibleOrder = {}, this._indexRangeCache = {}, this._eachItemMainRangeCache = null, this._getItemsCache = null, this._skip_refresh = !1, this._ganttConfig = null, t.getConfig && (this._ganttConfig = t.getConfig());
  var e = {}, i = {}, a = {}, r = {}, s = !1;
  return this._attachDataChange(function() {
    return this._indexRangeCache = {}, this._eachItemMainRangeCache = null, this._getItemsCache = null, !0;
  }), this.attachEvent("onPreFilter", function() {
    this._indexRangeCache = {}, this._eachItemMainRangeCache = null, e = {}, i = {}, a = {}, r = {}, s = !1, this.eachItem(function(o) {
      var l = this.getParent(o.id);
      o.$open && a[l] !== !1 ? a[o.id] = !0 : a[o.id] = !1, this._isSplitItem(o) && (s = !0, e[o.id] = !0, i[o.id] = !0), s && i[l] && (this._isDefaultItem(o) || this._isInlineChildItem(o)) && (i[o.id] = !0), a[l] || a[l] === void 0 || this._isInlineChildItem(o) ? r[o.id] = !0 : r[o.id] = !1;
    });
  }), this.attachEvent("onFilterItem", function(o, l) {
    var d = !1;
    this._ganttConfig && (d = this._ganttConfig.open_split_tasks);
    var u = r[l.id];
    return s && (u && i[l.id] && !e[l.id] && (u = !!d), i[l.id] && !e[l.id] && (this._isSplitChildItem(l) || (l.$split_subtask = !0))), l.$expanded_branch = !!r[l.id], this._isInlineChildItem(l) && (u = !1), !!u;
  }), this.attachEvent("onFilter", function() {
    e = {}, i = {}, a = {}, r = {};
  }), this;
};
function ft(t, n) {
  return String(t) === String(n);
}
function q(t) {
  return yt.isNode || !t.$root;
}
Ue.prototype = H({ _buildTree: function(t) {
  for (var n = null, e = this.$getRootId(), i = 0, a = t.length; i < a; i++) n = t[i], this.setParent(n, lt(this.getParent(n), e) || e);
  for (i = 0, a = t.length; i < a; i++) n = t[i], this._add_branch(n), n.$level = this.calculateItemLevel(n), n.$local_index = this.getBranchIndex(n.id), U(n.$open) || (n.$open = U(n.open) ? n.open : this.$openInitially());
  this._updateOrder();
}, _isSplitItem: function(t) {
  return this._splitTaskHelper.isSplitItem(t);
}, _isSplitChildItem: function(t) {
  return this._splitTaskHelper.isSubrowSplitItem(t);
}, _isDefaultItem: function(t) {
  return this._splitTaskHelper.isDefaultSplitItem(t);
}, _isInlineChildItem: function(t) {
  return this._splitTaskHelper.isInlineSplitItem(t);
}, parse: function(t) {
  this._skip_refresh || this.callEvent("onBeforeParse", [t]);
  var n = this._parseInner(t);
  this._buildTree(n), this.filter(), this._skip_refresh || this.callEvent("onParse", [n]);
}, _addItemInner: function(t, n) {
  var e = this.getParent(t);
  U(e) || (e = this.$getRootId(), this.setParent(t, e));
  var i = this.getIndexById(e) + Math.min(Math.max(n, 0), this.visibleOrder.length);
  1 * i !== i && (i = void 0), st.prototype._addItemInner.call(this, t, i), this.setParent(t, e), t.hasOwnProperty("$rendered_parent") && this._move_branch(t, t.$rendered_parent), this._add_branch(t, n);
}, _changeIdInner: function(t, n) {
  var e = this.getChildren(t), i = this._searchVisibleOrder[t];
  st.prototype._changeIdInner.call(this, t, n);
  var a = this.getParent(n);
  this._replace_branch_child(a, t, n), this._branches[t] && (this._branches[n] = this._branches[t]);
  for (var r = 0; r < e.length; r++) {
    var s = this.getItem(e[r]);
    s[this.$parentProperty] = n, s.$rendered_parent = n;
  }
  this._searchVisibleOrder[n] = i, delete this._branches[t];
}, _traverseBranches: function(t, n) {
  U(n) || (n = this.$getRootId());
  var e = this._branches[n];
  if (e) for (var i = 0; i < e.length; i++) {
    var a = e[i];
    t.call(this, a), this._branches[a] && this._traverseBranches(t, a);
  }
}, _updateOrder: function(t) {
  this.fullOrder = rt.$create(), this._traverseBranches(function(n) {
    this.fullOrder.push(n);
  }), t && st.prototype._updateOrder.call(this, t);
}, _removeItemInner: function(t) {
  var n = [];
  this.eachItem(function(i) {
    n.push(i);
  }, t), n.push(this.getItem(t));
  for (var e = 0; e < n.length; e++) this._move_branch(n[e], this.getParent(n[e]), null), st.prototype._removeItemInner.call(this, n[e].id), this._move_branch(n[e], this.getParent(n[e]), null);
}, move: function(t, n, e) {
  var i = arguments[3], a = (this._ganttConfig || {}).root_id || 0;
  if (i = lt(i, a)) {
    if (i === t) return;
    e = this.getParent(i), n = this.getBranchIndex(i);
  }
  if (ft(t, e)) return;
  U(e) || (e = this.$getRootId());
  var r = this.getItem(t), s = this.getParent(r.id), o = this.getChildren(e);
  const l = this.getSiblings(t);
  if (n == -1 && (n = o.length + 1), !(ft(s, e) && (this.getBranchIndex(t) == n || e === gantt.config.root_id && l.length <= 1))) {
    if (this.callEvent("onBeforeItemMove", [t, e, n]) === !1) return !1;
    for (var d = [], u = 0; u < o.length; u++) Ut(o[u], null, this, this._ganttConfig) && (d.push(o[u]), o.splice(u, 1), u--);
    this._replace_branch_child(s, t);
    var c = (o = this.getChildren(e))[n];
    (c = lt(c, a)) ? o = o.slice(0, n).concat([t]).concat(o.slice(n)) : o.push(t), d.length && (o = o.concat(d)), ft(r.$rendered_parent, s) || ft(s, e) || (r.$rendered_parent = s), this.setParent(r, e), this._branches[e] = o;
    var h = this.calculateItemLevel(r) - r.$level;
    r.$level += h, this.eachItem(function(_) {
      _.$level += h;
    }, r.id, this), this._moveInner(this.getIndexById(t), this.getIndexById(e) + n), this.callEvent("onAfterItemMove", [t, e, n]), this.refresh();
  }
}, getBranchIndex: function(t) {
  var n = this.getChildren(this.getParent(t));
  let e = n.indexOf(t + "");
  return e == -1 && (e = n.indexOf(+t)), e;
}, hasChild: function(t) {
  var n = this._branches[t];
  return n && n.length;
}, getChildren: function(t) {
  var n = this._branches[t];
  return n || rt.$create();
}, isChildOf: function(t, n) {
  if (!this.exists(t)) return !1;
  if (n === this.$getRootId()) return !0;
  if (!this.hasChild(n)) return !1;
  var e = this.getItem(t), i = this.getParent(t);
  if (this.getItem(n).$level >= e.$level) return !1;
  for (; e && this.exists(i); ) {
    if ((e = this.getItem(i)) && ft(e.id, n)) return !0;
    i = this.getParent(e);
  }
  return !1;
}, getSiblings: function(t) {
  if (!this.exists(t)) return rt.$create();
  var n = this.getParent(t);
  return this.getChildren(n);
}, getNextSibling: function(t) {
  for (var n = this.getSiblings(t), e = 0, i = n.length; e < i; e++) if (ft(n[e], t)) {
    var a = n[e + 1];
    return a === 0 && e > 0 && (a = "0"), a || null;
  }
  return null;
}, getPrevSibling: function(t) {
  for (var n = this.getSiblings(t), e = 0, i = n.length; e < i; e++) if (ft(n[e], t)) {
    var a = n[e - 1];
    return a === 0 && e > 0 && (a = "0"), a || null;
  }
  return null;
}, getParent: function(t) {
  var n = null;
  return (n = t.id !== void 0 ? t : this.getItem(t)) ? n[this.$parentProperty] : this.$getRootId();
}, clearAll: function() {
  this._branches = {}, st.prototype.clearAll.call(this);
}, calculateItemLevel: function(t) {
  var n = 0;
  return this.eachParent(function() {
    n++;
  }, t), n;
}, _setParentInner: function(t, n, e) {
  e || (t.hasOwnProperty("$rendered_parent") ? this._move_branch(t, t.$rendered_parent, n) : this._move_branch(t, t[this.$parentProperty], n));
}, setParent: function(t, n, e) {
  this._setParentInner(t, n, e), t[this.$parentProperty] = n;
}, _eachItemCached: function(t, n) {
  for (var e = 0, i = n.length; e < i; e++) t.call(this, n[e]);
}, _eachItemIterate: function(t, n, e) {
  var i = this.getChildren(n);
  for (i.length && (i = i.slice().reverse()); i.length; ) {
    var a = i.pop(), r = this.getItem(a);
    if (t.call(this, r), e && e.push(r), this.hasChild(r.id)) for (var s = this.getChildren(r.id), o = s.length - 1; o >= 0; o--) i.push(s[o]);
  }
}, eachItem: function(t, n) {
  var e = this.$getRootId();
  U(n) || (n = e);
  var i = lt(n, e) || e, a = !1, r = !1, s = null;
  i === e && (this._eachItemMainRangeCache ? (a = !0, s = this._eachItemMainRangeCache) : (r = !0, s = this._eachItemMainRangeCache = [])), a ? this._eachItemCached(t, s) : this._eachItemIterate(t, i, r ? s : null);
}, eachParent: function(t, n) {
  for (var e = {}, i = n, a = this.getParent(i); this.exists(a); ) {
    if (e[a]) throw new Error("Invalid tasks tree. Cyclic reference has been detected on task " + a);
    e[a] = !0, i = this.getItem(a), t.call(this, i), a = this.getParent(i);
  }
}, _add_branch: function(t, n, e) {
  var i = e === void 0 ? this.getParent(t) : e;
  this.hasChild(i) || (this._branches[i] = rt.$create());
  var a = this.getChildren(i);
  a.indexOf(t.id + "") > -1 || a.indexOf(+t.id) > -1 || (1 * n == n ? a.splice(n, 0, t.id) : a.push(t.id), t.$rendered_parent = i);
}, _move_branch: function(t, n, e) {
  this._eachItemMainRangeCache = null, this._replace_branch_child(n, t.id), this.exists(e) || ft(e, this.$getRootId()) ? this._add_branch(t, void 0, e) : delete this._branches[t.id], t.$level = this.calculateItemLevel(t), this.eachItem(function(i) {
    i.$level = this.calculateItemLevel(i);
  }, t.id);
}, _replace_branch_child: function(t, n, e) {
  var i = this.getChildren(t);
  if (i && t !== void 0) {
    var a = rt.$create();
    let r = i.indexOf(n + "");
    r != -1 || isNaN(+n) || (r = i.indexOf(+n)), r > -1 && (e ? i.splice(r, 1, e) : i.splice(r, 1)), a = i, this._branches[t] = a;
  }
}, sort: function(t, n, e) {
  this.exists(e) || (e = this.$getRootId()), t || (t = "order");
  var i = typeof t == "string" ? function(l, d) {
    return l[t] == d[t] || at(l[t]) && at(d[t]) && l[t].valueOf() == d[t].valueOf() ? 0 : l[t] > d[t] ? 1 : -1;
  } : t;
  if (n) {
    var a = i;
    i = function(l, d) {
      return a(d, l);
    };
  }
  var r = this.getChildren(e);
  if (r) {
    for (var s = [], o = r.length - 1; o >= 0; o--) s[o] = this.getItem(r[o]);
    for (s.sort(i), o = 0; o < s.length; o++) r[o] = s[o].id, this.sort(t, n, r[o]);
  }
}, filter: function(t) {
  for (let n in this.pull) {
    const e = this.pull[n].$rendered_parent, i = this.getParent(this.pull[n]);
    ft(e, i) || this._move_branch(this.pull[n], e, i);
  }
  return st.prototype.filter.apply(this, arguments);
}, open: function(t) {
  this.exists(t) && (this.getItem(t).$open = !0, this._skipTaskRecalculation = !0, this.callEvent("onItemOpen", [t]));
}, close: function(t) {
  this.exists(t) && (this.getItem(t).$open = !1, this._skipTaskRecalculation = !0, this.callEvent("onItemClose", [t]));
}, destructor: function() {
  st.prototype.destructor.call(this), this._branches = null, this._indexRangeCache = {}, this._eachItemMainRangeCache = null;
} }, st.prototype);
const Li = function(t, n) {
  const e = n.getDatastore(t), i = function(o, l) {
    const d = l.getLayers(), u = e.getItem(o);
    if (u && e.isVisible(o)) for (let c = 0; c < d.length; c++) d[c].render_item(u);
  }, a = function(o) {
    const l = o.getLayers();
    for (let _ = 0; _ < l.length; _++) l[_].clear();
    let d = null;
    const u = {};
    for (let _ = 0; _ < l.length; _++) {
      const f = l[_];
      let v;
      if (f.get_visible_range) {
        var c = f.get_visible_range(e);
        if (c.start !== void 0 && c.end !== void 0) {
          var h = c.start + " - " + c.end;
          u[h] ? v = u[h] : (v = e.getIndexRange(c.start, c.end), u[h] = v);
        } else {
          if (c.ids === void 0) throw new Error("Invalid range returned from 'getVisibleRange' of the layer");
          v = c.ids.map(function(k) {
            return e.getItem(k);
          });
        }
      } else d || (d = e.getVisibleItems()), v = d;
      f.prepare_data && f.prepare_data(v), l[_].render_items(v);
    }
  }, r = function(o) {
    if (o.update_items) {
      let d = [];
      if (o.get_visible_range) {
        var l = o.get_visible_range(e);
        if (l.start !== void 0 && l.end !== void 0 && (d = e.getIndexRange(l.start, l.end)), l.ids !== void 0) {
          let u = l.ids.map(function(c) {
            return e.getItem(c);
          });
          u.length > 0 && (u = u.filter((c) => c !== void 0), d = d.concat(u));
        }
        if ((l.start == null || l.end == null) && l.ids == null) throw new Error("Invalid range returned from 'getVisibleRange' of the layer");
      } else d = e.getVisibleItems();
      o.prepare_data && o.prepare_data(d, o), o.update_items(d);
    }
  };
  function s(o) {
    return !!o.$services.getService("state").getState("batchUpdate").batch_update;
  }
  e.attachEvent("onStoreUpdated", function(o, l, d) {
    if (q(n)) return !0;
    const u = n.$services.getService("layers").getDataRender(t);
    u && (u.onUpdateRequest = function(c) {
      r(c);
    });
  }), e.attachEvent("onStoreUpdated", function(o, l, d) {
    s(n) || (o && d != "move" && d != "delete" ? (e.callEvent("onBeforeRefreshItem", [l.id]), e.callEvent("onAfterRefreshItem", [l.id])) : (e.callEvent("onBeforeRefreshAll", []), e.callEvent("onAfterRefreshAll", [])));
  }), e.attachEvent("onAfterRefreshAll", function() {
    if (q(n)) return !0;
    const o = n.$services.getService("layers").getDataRender(t);
    o && !s(n) && a(o);
  }), e.attachEvent("onAfterRefreshItem", function(o) {
    if (q(n)) return !0;
    const l = n.$services.getService("layers").getDataRender(t);
    l && i(o, l);
  }), e.attachEvent("onItemOpen", function() {
    if (q(n) || e.isSilent()) return !0;
    n.render();
  }), e.attachEvent("onItemClose", function() {
    if (q(n) || e.isSilent()) return !0;
    n.render();
  }), e.attachEvent("onIdChange", function(o, l) {
    if (q(n)) return !0;
    if (e.callEvent("onBeforeIdChange", [o, l]), !s(n) && !e.isSilent()) {
      const d = n.$services.getService("layers").getDataRender(t);
      d ? (function(u, c, h) {
        for (let _ = 0; _ < u.length; _++) u[_].change_id(c, h);
      }(d.getLayers(), o, l, e.getItem(l)), i(l, d)) : n.render();
    }
  });
};
function pe() {
  for (var t = this.$services.getService("datastores"), n = [], e = 0; e < t.length; e++) {
    var i = this.getDatastore(t[e]);
    i.$destroyed || n.push(i);
  }
  return n;
}
const Ni = { create: function() {
  var t = H({}, { createDatastore: function(n) {
    var e = (n.type || "").toLowerCase() == "treedatastore" ? Ue : st;
    if (n) {
      var i = this;
      n.openInitially = function() {
        return i.config.open_tree_initially;
      }, n.copyOnParse = function() {
        return i.config.deepcopy_on_parse;
      };
    }
    var a = new e(n);
    if (this.mixin(a, function(o) {
      var l = null, d = o._removeItemInner;
      function u(c) {
        l = null, this.callEvent("onAfterUnselect", [c]);
      }
      return o._removeItemInner = function(c) {
        return l == c && u.call(this, c), l && this.eachItem && this.eachItem(function(h) {
          h.id == l && u.call(this, h.id);
        }, c), d.apply(this, arguments);
      }, o.attachEvent("onIdChange", function(c, h) {
        o.getSelectedId() == c && o.silent(function() {
          o.unselect(c), o.select(h);
        });
      }), { select: function(c) {
        if (c) {
          if (l == c) return l;
          if (!this._skip_refresh && !this.callEvent("onBeforeSelect", [c])) return !1;
          this.unselect(), l = c, this._skip_refresh || (this.refresh(c), this.callEvent("onAfterSelect", [c]));
        }
        return l;
      }, getSelectedId: function() {
        return l;
      }, isSelected: function(c) {
        return c == l;
      }, unselect: function(c) {
        (c = c || l) && (l = null, this._skip_refresh || (this.refresh(c), u.call(this, c)));
      } };
    }(a)), n.name) {
      var r = "datastore:" + n.name;
      a.attachEvent("onDestroy", (function() {
        this.$services.dropService(r);
        for (var o = this.$services.getService("datastores"), l = 0; l < o.length; l++) if (o[l] === n.name) {
          o.splice(l, 1);
          break;
        }
      }).bind(this)), this.$services.dropService(r), this.$services.setService(r, function() {
        return a;
      });
      var s = this.$services.getService("datastores");
      s ? s.indexOf(n.name) < 0 && s.push(n.name) : (s = [], this.$services.setService("datastores", function() {
        return s;
      }), s.push(n.name)), Li(n.name, this);
    }
    return a;
  }, getDatastore: function(n) {
    return this.$services.getService("datastore:" + n);
  }, _getDatastores: pe, refreshData: function() {
    var n;
    q(this) || (n = this.getScrollState()), this.callEvent("onBeforeDataRender", []);
    for (var e = pe.call(this), i = 0; i < e.length; i++) e[i].refresh();
    this.config.preserve_scroll && !q(this) && ((n.x || n.y) && this.scrollTo(n.x, n.y), this.$layout.getScrollbarsInfo().forEach((a) => {
      const r = this.$ui.getView(a.id);
      if (!r) return;
      const s = this.utils.dom.isChildOf(r.$view, this.$container);
      a.boundViews.forEach((o) => {
        const l = this.$ui.getView(o);
        a.y && l && !s && l.scrollTo(void 0, 0);
      });
    })), this.callEvent("onDataRender", []);
  }, isChildOf: function(n, e) {
    return this.$data.tasksStore.isChildOf(n, e);
  }, refreshTask: function(n, e) {
    var i = this.getTask(n), a = this;
    function r() {
      if (e === void 0 || e) {
        for (var o = 0; o < i.$source.length; o++) a.refreshLink(i.$source[o]);
        for (o = 0; o < i.$target.length; o++) a.refreshLink(i.$target[o]);
      }
    }
    if (i && this.isTaskVisible(n)) this.$data.tasksStore.refresh(n, !!this.getState("tasksDnd").drag_id || e === !1), r();
    else if (this.isTaskExists(n) && this.isTaskExists(this.getParent(n)) && !this._bulk_dnd) {
      this.refreshTask(this.getParent(n));
      var s = !1;
      this.eachParent(function(o) {
        (s || this.isSplitTask(o)) && (s = !0);
      }, n), s && r();
    }
  }, refreshLink: function(n) {
    this.$data.linksStore.refresh(n, !!this.getState("tasksDnd").drag_id);
  }, silent: function(n) {
    var e = this;
    e.$data.tasksStore.silent(function() {
      e.$data.linksStore.silent(function() {
        n();
      });
    });
  }, clearAll: function() {
    for (var n = pe.call(this), e = 0; e < n.length; e++) n[e].silent(function() {
      n[e].clearAll();
    });
    for (e = 0; e < n.length; e++) n[e].clearAll();
    this._update_flags(), this.date._isoDateDetected = !1, this.date._isoDateOnly = !1, this.userdata = {}, this.callEvent("onClear", []), this.render();
  }, _clear_data: function() {
    this.$data.tasksStore.clearAll(), this.$data.linksStore.clearAll(), this._update_flags(), this.userdata = {};
  }, selectTask: function(n) {
    var e = this.$data.tasksStore;
    if (!this.config.select_task) return !1;
    if (n = lt(n, this.config.root_id)) {
      let i = this.getSelectedId();
      e._skipResourceRepaint = !0, e.select(n), e._skipResourceRepaint = !1, i && e.pull[i].$split_subtask && i != n && this.refreshTask(i), e.pull[n].$split_subtask && i != n && this.refreshTask(n);
    }
    return e.getSelectedId();
  }, unselectTask: function(n) {
    var e = this.$data.tasksStore;
    e.unselect(n), n && e.pull[n].$split_subtask && this.refreshTask(n);
  }, isSelectedTask: function(n) {
    return this.$data.tasksStore.isSelected(n);
  }, getSelectedId: function() {
    return this.$data.tasksStore.getSelectedId();
  } });
  return H(t, { getTask: function(n) {
    n = lt(n, this.config.root_id), this.assert(n, "Invalid argument for gantt.getTask");
    var e = this.$data.tasksStore.getItem(n);
    return this.assert(e, "Task not found id=" + n), e;
  }, getTaskByTime: function(n, e) {
    var i = this.$data.tasksStore.getItems(), a = [];
    if (n || e) {
      n = +n || -1 / 0, e = +e || 1 / 0;
      for (var r = 0; r < i.length; r++) {
        var s = i[r];
        +s.start_date < e && +s.end_date > n && a.push(s);
      }
    } else a = i;
    return a;
  }, isTaskExists: function(n) {
    return !(!this.$data || !this.$data.tasksStore) && this.$data.tasksStore.exists(n);
  }, updateTask: function(n, e) {
    U(e) || (e = this.getTask(n)), this.$data.tasksStore.updateItem(n, e), this.isTaskExists(n) && this.refreshTask(n);
  }, addTask: function(n, e, i) {
    if (U(n.id) || (n.id = ut()), this.isTaskExists(n.id) && this.getTask(n.id).$index != n.$index) return n.start_date && typeof n.start_date == "string" && (n.start_date = this.date.parseDate(n.start_date, "parse_date")), n.end_date && typeof n.end_date == "string" && (n.end_date = this.date.parseDate(n.end_date, "parse_date")), this.$data.tasksStore.updateItem(n.id, n);
    if (U(e) || (e = this.getParent(n) || 0), this.isTaskExists(e) || (e = this.config.root_id), this.setParent(n, e), this.getState().lightbox && this.isTaskExists(e)) {
      var a = this.getTask(e);
      this.callEvent("onAfterParentExpand", [e, a]);
    }
    return this.$data.tasksStore.addItem(n, i, e);
  }, deleteTask: function(n) {
    return n = lt(n, this.config.root_id), this.$data.tasksStore.removeItem(n);
  }, getTaskCount: function() {
    return this.$data.tasksStore.count();
  }, getVisibleTaskCount: function() {
    return this.$data.tasksStore.countVisible();
  }, getTaskIndex: function(n) {
    return this.$data.tasksStore.getBranchIndex(n);
  }, getGlobalTaskIndex: function(n) {
    return n = lt(n, this.config.root_id), this.assert(n, "Invalid argument"), this.$data.tasksStore.getIndexById(n);
  }, eachTask: function(n, e, i) {
    return this.$data.tasksStore.eachItem(j(n, i || this), e);
  }, eachParent: function(n, e, i) {
    return this.$data.tasksStore.eachParent(j(n, i || this), e);
  }, changeTaskId: function(n, e) {
    this.$data.tasksStore.changeId(n, e);
    var i = this.$data.tasksStore.getItem(e), a = [];
    i.$source && (a = a.concat(i.$source)), i.$target && (a = a.concat(i.$target));
    for (var r = 0; r < a.length; r++) {
      var s = this.getLink(a[r]);
      s.source == n && (s.source = e), s.target == n && (s.target = e);
    }
  }, calculateTaskLevel: function(n) {
    return this.$data.tasksStore.calculateItemLevel(n);
  }, getNext: function(n) {
    return this.$data.tasksStore.getNext(n);
  }, getPrev: function(n) {
    return this.$data.tasksStore.getPrev(n);
  }, getParent: function(n) {
    return this.$data.tasksStore.getParent(n);
  }, setParent: function(n, e, i) {
    return this.$data.tasksStore.setParent(n, e, i);
  }, getSiblings: function(n) {
    return this.$data.tasksStore.getSiblings(n).slice();
  }, getNextSibling: function(n) {
    return this.$data.tasksStore.getNextSibling(n);
  }, getPrevSibling: function(n) {
    return this.$data.tasksStore.getPrevSibling(n);
  }, getTaskByIndex: function(n) {
    var e = this.$data.tasksStore.getIdByIndex(n);
    return this.isTaskExists(e) ? this.getTask(e) : null;
  }, getChildren: function(n) {
    return this.hasChild(n) ? this.$data.tasksStore.getChildren(n).slice() : [];
  }, hasChild: function(n) {
    return this.$data.tasksStore.hasChild(n);
  }, open: function(n) {
    this.$data.tasksStore.open(n);
  }, close: function(n) {
    this.$data.tasksStore.close(n);
  }, moveTask: function(n, e, i) {
    return i = lt(i, this.config.root_id), this.$data.tasksStore.move.apply(this.$data.tasksStore, arguments);
  }, sort: function(n, e, i, a) {
    var r = !a;
    this.$data.tasksStore.sort(n, e, i), this.callEvent("onAfterSort", [n, e, i]), r && this.render();
  } }), H(t, { getLinkCount: function() {
    return this.$data.linksStore.count();
  }, getLink: function(n) {
    return this.$data.linksStore.getItem(n);
  }, getLinks: function() {
    return this.$data.linksStore.getItems();
  }, isLinkExists: function(n) {
    return this.$data.linksStore.exists(n);
  }, addLink: function(n) {
    return this.$data.linksStore.addItem(n);
  }, updateLink: function(n, e) {
    U(e) || (e = this.getLink(n)), this.$data.linksStore.updateItem(n, e);
  }, deleteLink: function(n) {
    return this.$data.linksStore.removeItem(n);
  }, changeLinkId: function(n, e) {
    return this.$data.linksStore.changeId(n, e);
  } }), t;
} };
function Pi(t) {
  var n = function(u) {
    const c = new zn(u).primaryScale();
    let h = c.unit, _ = c.step;
    if (u.config.scale_offset_minimal) {
      const f = new Ve(u), v = [f.primaryScale()].concat(f.getAdditionalScales());
      f.sortScales(v), h = v[v.length - 1].unit, _ = v[v.length - 1].step || 1;
    }
    return { unit: h, step: _ };
  }(t), e = n.unit, i = n.step, a = function(u, c) {
    var h = { start_date: null, end_date: null };
    if (c.config.start_date && c.config.end_date) {
      h.start_date = c.date[u + "_start"](new Date(c.config.start_date));
      var _ = new Date(c.config.end_date), f = c.date[u + "_start"](new Date(_));
      _ = +_ != +f ? c.date.add(f, 1, u) : f, h.end_date = _;
    }
    return h;
  }(e, t);
  if (!a.start_date || !a.end_date) {
    for (var r = !0, s = t.getTaskByTime(), o = 0; o < s.length; o++)
      if (s[o].type !== t.config.types.project) {
        r = !1;
        break;
      }
    if (s.length && r) {
      var l = s[0].start_date, d = t.date.add(l, 1, t.config.duration_unit);
      a = { start_date: new Date(l), end_date: new Date(d) };
    } else a = t.getSubtaskDates();
    a.start_date && a.end_date || (a = { start_date: /* @__PURE__ */ new Date(), end_date: /* @__PURE__ */ new Date() }), t.eachTask(function(u) {
      t.config.deadlines && u.deadline && me(a, u.deadline, u.deadline), u.constraint_date && u.constraint_type && t._getAutoSchedulingConfig().apply_constraints && t.config.constraint_types && u.constraint_type !== t.config.constraint_types.ASAP && u.constraint_type !== t.config.constraint_types.ALAP && me(a, u.constraint_date, u.constraint_date), t.config.baselines && u.baselines && u.baselines.forEach(function(c) {
        me(a, c.start_date, c.end_date);
      });
    }), a.start_date = t.date[e + "_start"](a.start_date), a.start_date = t.calculateEndDate({ start_date: t.date[e + "_start"](a.start_date), duration: -1, unit: e, step: i }), a.end_date = t.date[e + "_start"](a.end_date), a.end_date = t.calculateEndDate({ start_date: a.end_date, duration: 2, unit: e, step: i });
  }
  t._min_date = a.start_date, t._max_date = a.end_date;
}
function me(t, n, e) {
  n < t.start_date && (t.start_date = new Date(n)), e > t.end_date && (t.end_date = new Date(e));
}
function Ie(t) {
  Pi(t), function(n) {
    if (n.config.fit_tasks) {
      var e = +n._min_date, i = +n._max_date;
      if (+n._min_date != e || +n._max_date != i) return n.render(), n.callEvent("onScaleAdjusted", []), !0;
    }
  }(t);
}
function ln(t, n, e) {
  for (var i = 0; i < n.length; i++) t.isLinkExists(n[i]) && (e[n[i]] = t.getLink(n[i]));
}
function dn(t, n, e) {
  ln(t, n.$source, e), ln(t, n.$target, e);
}
const Me = { getSubtreeLinks: function(t, n) {
  var e = {};
  return t.isTaskExists(n) && dn(t, t.getTask(n), e), t.eachTask(function(i) {
    dn(t, i, e);
  }, n), e;
}, getSubtreeTasks: function(t, n) {
  var e = {};
  return t.eachTask(function(i) {
    e[i.id] = i;
  }, n), e;
} };
class Ri {
  constructor(n, e) {
    this.$gantt = n, this.$dp = e, this._dataProcessorHandlers = [];
  }
  attach() {
    const n = this.$dp, e = this.$gantt, i = {}, a = (o) => this.clientSideDelete(o, n, e);
    this._dataProcessorHandlers.push(e.attachEvent("onAfterTaskAdd", function(o, l) {
      e.isTaskExists(o) && (n.setGanttMode("tasks"), n.setUpdated(o, !0, "inserted"));
    })), this._dataProcessorHandlers.push(e.attachEvent("onAfterTaskUpdate", function(o, l) {
      e.isTaskExists(o) && (n.setGanttMode("tasks"), n.setUpdated(o, !0), e._sendTaskOrder && e._sendTaskOrder(o, l));
    })), this._dataProcessorHandlers.push(e.attachEvent("onBeforeTaskDelete", function(o, l) {
      return e.config.cascade_delete && (i[o] = { tasks: Me.getSubtreeTasks(e, o), links: Me.getSubtreeLinks(e, o) }), !n.deleteAfterConfirmation || (n.setGanttMode("tasks"), n.setUpdated(o, !0, "deleted"), !1);
    })), this._dataProcessorHandlers.push(e.attachEvent("onAfterTaskDelete", function(o, l) {
      n.setGanttMode("tasks");
      const d = !a(o), u = e.config.cascade_delete && i[o];
      if (d || u) {
        if (u) {
          const c = n.updateMode;
          n.setUpdateMode("off");
          const h = i[o];
          for (const _ in h.tasks) a(_) || (n.storeItem(h.tasks[_]), n.setUpdated(_, !0, "deleted"));
          n.setGanttMode("links");
          for (const _ in h.links) a(_) || (n.storeItem(h.links[_]), n.setUpdated(_, !0, "deleted"));
          i[o] = null, c !== "off" && n.sendAllData(), n.setGanttMode("tasks"), n.setUpdateMode(c);
        }
        d && (n.storeItem(l), n.deleteAfterConfirmation || n.setUpdated(o, !0, "deleted")), n.updateMode === "off" || n._tSend || n.sendAllData();
      }
    })), this._dataProcessorHandlers.push(e.attachEvent("onAfterLinkUpdate", function(o, l) {
      e.isLinkExists(o) && (n.setGanttMode("links"), n.setUpdated(o, !0));
    })), this._dataProcessorHandlers.push(e.attachEvent("onAfterLinkAdd", function(o, l) {
      e.isLinkExists(o) && (n.setGanttMode("links"), n.setUpdated(o, !0, "inserted"));
    })), this._dataProcessorHandlers.push(e.attachEvent("onAfterLinkDelete", function(o, l) {
      n.setGanttMode("links"), !a(o) && (n.storeItem(l), n.setUpdated(o, !0, "deleted"));
    })), this._dataProcessorHandlers.push(e.attachEvent("onRowDragEnd", function(o, l) {
      e._sendTaskOrder(o, e.getTask(o));
    }));
    let r = null, s = null;
    this._dataProcessorHandlers.push(e.attachEvent("onTaskIdChange", function(o, l) {
      if (!n._waitMode) return;
      const d = e.getChildren(l);
      if (d.length) {
        r = r || {};
        for (let c = 0; c < d.length; c++) {
          const h = this.getTask(d[c]);
          r[h.id] = h;
        }
      }
      const u = function(c) {
        let h = [];
        return c.$source && (h = h.concat(c.$source)), c.$target && (h = h.concat(c.$target)), h;
      }(this.getTask(l));
      if (u.length) {
        s = s || {};
        for (let c = 0; c < u.length; c++) {
          const h = this.getLink(u[c]);
          s[h.id] = h;
        }
      }
    })), n.attachEvent("onAfterUpdateFinish", function() {
      (r || s) && (e.batchUpdate(function() {
        for (const o in r) e.updateTask(r[o].id);
        for (const o in s) e.updateLink(s[o].id);
        r = null, s = null;
      }), r ? e._dp.setGanttMode("tasks") : e._dp.setGanttMode("links"));
    }), n.attachEvent("onBeforeDataSending", function() {
      if (this._tMode === "CUSTOM") return !0;
      let o = this._serverProcessor;
      if (this._tMode === "REST-JSON" || this._tMode === "REST") {
        const l = this._ganttMode;
        o = o.substring(0, o.indexOf("?") > -1 ? o.indexOf("?") : o.length), this.serverProcessor = o + (o.slice(-1) === "/" ? "" : "/") + l;
      } else {
        const l = this._ganttMode + "s";
        this.serverProcessor = o + e.ajax.urlSeparator(o) + "gantt_mode=" + l;
      }
      return !0;
    }), n.attachEvent("insertCallback", function(o, l, d, u) {
      const c = o.data || e.xml._xmlNodeToJSON(o.firstChild), h = { add: e.addTask, isExist: e.isTaskExists };
      u === "links" && (h.add = e.addLink, h.isExist = e.isLinkExists), h.isExist.call(e, l) || (c.id = l, h.add.call(e, c));
    }), n.attachEvent("updateCallback", function(o, l) {
      const d = o.data || e.xml._xmlNodeToJSON(o.firstChild);
      if (!e.isTaskExists(l)) return;
      const u = e.getTask(l);
      for (const c in d) {
        let h = d[c];
        switch (c) {
          case "id":
            continue;
          case "start_date":
          case "end_date":
            h = e.defined(e.templates.xml_date) ? e.templates.xml_date(h) : e.templates.parse_date(h);
            break;
          case "duration":
            u.end_date = e.calculateEndDate({ start_date: u.start_date, duration: h, task: u });
        }
        u[c] = h;
      }
      e.updateTask(l), e.refreshData();
    }), n.attachEvent("deleteCallback", function(o, l, d, u) {
      const c = { delete: e.deleteTask, isExist: e.isTaskExists };
      u === "links" ? (c.delete = e.deleteLink, c.isExist = e.isLinkExists) : u === "assignment" && (c.delete = function(h) {
        e.$data.assignmentsStore.remove(h);
      }, c.isExist = function(h) {
        return e.$data.assignmentsStore.exists(h);
      }), c.isExist.call(e, l) && c.delete.call(e, l);
    }), this.handleResourceCRUD(n, e), this.handleResourceAssignmentCRUD(n, e), this.handleBaselineCRUD(n, e);
  }
  clientSideDelete(n, e, i) {
    const a = e.updatedRows.slice();
    let r = !1;
    i.getUserData(n, "!nativeeditor_status", e._ganttMode) === "true_deleted" && (r = !0, e.setUpdated(n, !1));
    for (let s = 0; s < a.length && !e._in_progress[n]; s++) a[s] === n && (i.getUserData(n, "!nativeeditor_status", e._ganttMode) === "inserted" && (r = !0), e.setUpdated(n, !1));
    return r;
  }
  handleResourceAssignmentCRUD(n, e) {
    if (!e.config.resources || e.config.resources.dataprocessor_assignments !== !0) return;
    const i = e.getDatastore(e.config.resource_assignment_store), a = {}, r = {};
    function s(o) {
      const l = o.id;
      i.exists(l) && (n.setGanttMode("assignment"), n.setUpdated(l, !0, "inserted")), delete r[l];
    }
    e.attachEvent("onBeforeTaskAdd", function(o, l) {
      return a[o] = !0, !0;
    }), e.attachEvent("onTaskIdChange", function(o, l) {
      delete a[o];
    }), i.attachEvent("onAfterAdd", (o, l) => {
      a[l.task_id] ? function(d) {
        r[d.id] = d, a[d.task_id] = !0;
      }(l) : s(l);
    }), i.attachEvent("onAfterUpdate", (o, l) => {
      i.exists(o) && (r[o] ? s(l) : (n.setGanttMode("assignment"), n.setUpdated(o, !0)));
    }), i.attachEvent("onAfterDelete", (o, l) => {
      n.setGanttMode("assignment"), !this.clientSideDelete(o, n, e) && (n.storeItem(l), n.setUpdated(o, !0, "deleted"));
    });
  }
  handleResourceCRUD(n, e) {
    if (!e.config.resources || e.config.resources.dataprocessor_resources !== !0) return;
    const i = e.getDatastore(e.config.resource_store);
    i.attachEvent("onAfterAdd", (a, r) => {
      (function(s) {
        const o = s.id;
        i.exists(o) && (n.setGanttMode("resource"), n.setUpdated(o, !0, "inserted"));
      })(r);
    }), i.attachEvent("onAfterUpdate", (a, r) => {
      i.exists(a) && (n.setGanttMode("resource"), n.setUpdated(a, !0));
    }), i.attachEvent("onAfterDelete", (a, r) => {
      n.setGanttMode("resource"), !this.clientSideDelete(a, n, e) && (n.storeItem(r), n.setUpdated(a, !0, "deleted"));
    });
  }
  handleBaselineCRUD(n, e) {
    if (!e.config.baselines || e.config.baselines.dataprocessor_baselines !== !0) return;
    const i = e.getDatastore(e.config.baselines.datastore);
    i.attachEvent("onAfterAdd", (a, r) => {
      (function(s) {
        const o = s.id;
        i.exists(o) && (n.setGanttMode("baseline"), n.setUpdated(o, !0, "inserted"));
      })(r);
    }), i.attachEvent("onAfterUpdate", (a, r) => {
      i.exists(a) && (n.setGanttMode("baseline"), n.setUpdated(a, !0));
    }), i.attachEvent("onAfterDelete", (a, r) => {
      n.setGanttMode("baseline"), !this.clientSideDelete(a, n, e) && (n.storeItem(r), n.setUpdated(a, !0, "deleted"));
    });
  }
  detach() {
    ht(this._dataProcessorHandlers, (n) => {
      this.$gantt.detachEvent(n);
    }), this._dataProcessorHandlers = [];
  }
}
const se = class se {
  constructor() {
    this.clear = () => {
      this._storage = {};
    }, this.storeItem = (n) => {
      this._storage[n.id] = J(n);
    }, this.getStoredItem = (n) => this._storage[n] || null, this._storage = {};
  }
};
se.create = () => new se();
let ee = se, Vn = class {
  constructor(t) {
    this.serverProcessor = t, this.action_param = "!nativeeditor_status", this.updatedRows = [], this.autoUpdate = !0, this.updateMode = "cell", this._headers = null, this._payload = null, this._postDelim = "_", this._routerParametersFormat = "parameters", this._waitMode = 0, this._in_progress = {}, this._storage = ee.create(), this._invalid = {}, this.messages = [], this.styles = { updated: "font-weight:bold;", inserted: "font-weight:bold;", deleted: "text-decoration : line-through;", invalid: "background-color:FFE0E0;", invalid_cell: "border-bottom:2px solid red;", error: "color:red;", clear: "font-weight:normal;text-decoration:none;" }, this.enableUTFencoding(!0), _t(this);
  }
  setTransactionMode(t, n) {
    typeof t == "object" ? (this._tMode = t.mode || this._tMode, U(t.headers) && (this._headers = t.headers), U(t.payload) && (this._payload = t.payload), this._tSend = !!n) : (this._tMode = t, this._tSend = n), this._tMode === "REST" && (this._tSend = !1), this._tMode === "JSON" || this._tMode === "REST-JSON" ? (this._tSend = !1, this._serializeAsJson = !0, this._headers = this._headers || {}, this._headers["Content-Type"] = "application/json") : this._headers && !this._headers["Content-Type"] && (this._headers["Content-Type"] = "application/x-www-form-urlencoded"), this._tMode === "CUSTOM" && (this._tSend = !1, this._router = t.router);
  }
  escape(t) {
    return this._utf ? encodeURIComponent(t) : escape(t);
  }
  enableUTFencoding(t) {
    this._utf = !!t;
  }
  getSyncState() {
    return !this.updatedRows.length;
  }
  setUpdateMode(t, n) {
    this.autoUpdate = t === "cell", this.updateMode = t, this.dnd = n;
  }
  ignore(t, n) {
    this._silent_mode = !0, t.call(n || tt), this._silent_mode = !1;
  }
  setUpdated(t, n, e) {
    if (this._silent_mode) return;
    const i = this.findRow(t);
    e = e || "updated";
    const a = this.$gantt.getUserData(t, this.action_param, this._ganttMode);
    a && e === "updated" && (e = a), n ? (this.set_invalid(t, !1), this.updatedRows[i] = t, this.$gantt.setUserData(t, this.action_param, e, this._ganttMode), this._in_progress[t] && (this._in_progress[t] = "wait")) : this.is_invalid(t) || (this.updatedRows.splice(i, 1), this.$gantt.setUserData(t, this.action_param, "", this._ganttMode)), this.markRow(t, n, e), n && this.autoUpdate && this.sendData(t);
  }
  markRow(t, n, e) {
    let i = "";
    const a = this.is_invalid(t);
    if (a && (i = this.styles[a], n = !0), this.callEvent("onRowMark", [t, n, e, a]) && (i = this.styles[n ? e : "clear"] + " " + i, this.$gantt[this._methods[0]](t, i), a && a.details)) {
      i += this.styles[a + "_cell"];
      for (let r = 0; r < a.details.length; r++) a.details[r] && this.$gantt[this._methods[1]](t, r, i);
    }
  }
  getActionByState(t) {
    return t === "inserted" ? "create" : t === "updated" ? "update" : t === "deleted" ? "delete" : "update";
  }
  getState(t) {
    return this.$gantt.getUserData(t, this.action_param, this._ganttMode);
  }
  is_invalid(t) {
    return this._invalid[t];
  }
  set_invalid(t, n, e) {
    e && (n = { value: n, details: e, toString: function() {
      return this.value.toString();
    } }), this._invalid[t] = n;
  }
  checkBeforeUpdate(t) {
    return !0;
  }
  sendData(t) {
    if (this.$gantt.editStop && this.$gantt.editStop(), t === void 0 || this._tSend) {
      const n = [];
      if (this.modes && ["task", "link", "assignment", "baseline"].forEach((e) => {
        this.modes[e] && this.modes[e].updatedRows.length && n.push(e);
      }), n.length) {
        for (let e = 0; e < n.length; e++) this.setGanttMode(n[e]), this.sendAllData();
        return;
      }
      return this.sendAllData();
    }
    return !this._in_progress[t] && (this.messages = [], !(!this.checkBeforeUpdate(t) && this.callEvent("onValidationError", [t, this.messages])) && void this._beforeSendData(this._getRowData(t), t));
  }
  serialize(t, n) {
    if (this._serializeAsJson) return this._serializeAsJSON(t);
    if (typeof t == "string") return t;
    if (n !== void 0) return this.serialize_one(t, "");
    {
      const e = [], i = [];
      for (const a in t) t.hasOwnProperty(a) && (e.push(this.serialize_one(t[a], a + this._postDelim)), i.push(a));
      return e.push("ids=" + this.escape(i.join(","))), this.$gantt.security_key && e.push("dhx_security=" + this.$gantt.security_key), e.join("&");
    }
  }
  serialize_one(t, n) {
    if (typeof t == "string") return t;
    const e = [];
    let i = "";
    for (const a in t) if (t.hasOwnProperty(a)) {
      if ((a === "id" || a == this.action_param) && this._tMode === "REST") continue;
      i = typeof t[a] == "string" || typeof t[a] == "number" ? String(t[a]) : JSON.stringify(t[a]), e.push(this.escape((n || "") + a) + "=" + this.escape(i));
    }
    return e.join("&");
  }
  sendAllData() {
    if (!this.updatedRows.length) return;
    this.messages = [];
    let t = !0;
    if (this._forEachUpdatedRow(function(n) {
      t = t && this.checkBeforeUpdate(n);
    }), !t && !this.callEvent("onValidationError", ["", this.messages])) return !1;
    this._tSend ? this._sendData(this._getAllData()) : this._forEachUpdatedRow(function(n) {
      if (!this._in_progress[n]) {
        if (this.is_invalid(n)) return;
        this._beforeSendData(this._getRowData(n), n);
      }
    });
  }
  findRow(t) {
    let n = 0;
    for (n = 0; n < this.updatedRows.length && t != this.updatedRows[n]; n++) ;
    return n;
  }
  defineAction(t, n) {
    this._uActions || (this._uActions = {}), this._uActions[t] = n;
  }
  afterUpdateCallback(t, n, e, i, a) {
    if (!this.$gantt) return;
    this.setGanttMode(a);
    const r = t, s = e !== "error" && e !== "invalid";
    if (s || this.set_invalid(t, e), this._uActions && this._uActions[e] && !this._uActions[e](i)) return delete this._in_progress[r];
    this._in_progress[r] !== "wait" && this.setUpdated(t, !1);
    const o = t;
    switch (e) {
      case "inserted":
      case "insert":
        n != t && (this.setUpdated(t, !1), this.$gantt[this._methods[2]](t, n), t = n);
        break;
      case "delete":
      case "deleted":
        if (this.deleteAfterConfirmation && this._ganttMode === "task") {
          if (this._ganttMode === "task" && this.$gantt.isTaskExists(t)) {
            this.$gantt.setUserData(t, this.action_param, "true_deleted", this._ganttMode);
            const l = this.$gantt.getTask(t);
            this.$gantt.silent(() => {
              this.$gantt.deleteTask(t);
            }), this.$gantt.callEvent("onAfterTaskDelete", [t, l]), this.$gantt.render(), delete this._in_progress[r];
          }
          return this.callEvent("onAfterUpdate", [t, e, n, i]);
        }
        return this.$gantt.setUserData(t, this.action_param, "true_deleted", this._ganttMode), this.$gantt[this._methods[3]](t), delete this._in_progress[r], this.callEvent("onAfterUpdate", [t, e, n, i]);
    }
    this._in_progress[r] !== "wait" ? (s && this.$gantt.setUserData(t, this.action_param, "", this._ganttMode), delete this._in_progress[r]) : (delete this._in_progress[r], this.setUpdated(n, !0, this.$gantt.getUserData(t, this.action_param, this._ganttMode))), this.callEvent("onAfterUpdate", [o, e, n, i]);
  }
  afterUpdate(t, n, e) {
    let i;
    i = arguments.length === 3 ? arguments[1] : arguments[4];
    let a = this.getGanttMode();
    const r = i.filePath || i.url;
    a = this._tMode !== "REST" && this._tMode !== "REST-JSON" ? r.indexOf("gantt_mode=links") !== -1 ? "link" : r.indexOf("gantt_mode=assignments") !== -1 ? "assignment" : r.indexOf("gantt_mode=baselines") !== -1 ? "baseline" : "task" : r.indexOf("/link") >= 0 ? "link" : r.indexOf("/assignment") >= 0 ? "assignment" : r.indexOf("/baseline") >= 0 ? "baseline" : "task", this.setGanttMode(a);
    const s = this.$gantt.ajax;
    let o;
    try {
      o = JSON.parse(n.xmlDoc.responseText);
    } catch {
      n.xmlDoc.responseText.length || (o = {});
    }
    const l = (c) => {
      const h = o.action || this.getState(c) || "updated", _ = o.sid || c[0], f = o.tid || c[0];
      t.afterUpdateCallback(_, f, h, o, a);
    };
    if (o) return Array.isArray(e) && e.length > 1 ? e.forEach((c) => l(c)) : l(e), t.finalizeUpdate(), void this.setGanttMode(a);
    const d = s.xmltop("data", n.xmlDoc);
    if (!d) return this.cleanUpdate(e);
    const u = s.xpath("//data/action", d);
    if (!u.length) return this.cleanUpdate(e);
    for (let c = 0; c < u.length; c++) {
      const h = u[c], _ = h.getAttribute("type"), f = h.getAttribute("sid"), v = h.getAttribute("tid");
      t.afterUpdateCallback(f, v, _, h, a);
    }
    t.finalizeUpdate();
  }
  cleanUpdate(t) {
    if (t) for (let n = 0; n < t.length; n++) delete this._in_progress[t[n]];
  }
  finalizeUpdate() {
    this._waitMode && this._waitMode--, this.callEvent("onAfterUpdateFinish", []), this.updatedRows.length || this.callEvent("onFullSync", []);
  }
  init(t) {
    if (this._initialized) return;
    this.$gantt = t, this.$gantt._dp_init && this.$gantt._dp_init(this), this._setDefaultTransactionMode(), this.styles = { updated: "gantt_updated", order: "gantt_updated", inserted: "gantt_inserted", deleted: "gantt_deleted", delete_confirmation: "gantt_deleted", invalid: "gantt_invalid", error: "gantt_error", clear: "" }, this._methods = ["_row_style", "setCellTextStyle", "_change_id", "_delete_task"], function(e, i) {
      e.getUserData = function(a, r, s) {
        return this.userdata || (this.userdata = {}), this.userdata[s] = this.userdata[s] || {}, this.userdata[s][a] && this.userdata[s][a][r] ? this.userdata[s][a][r] : "";
      }, e.setUserData = function(a, r, s, o) {
        this.userdata || (this.userdata = {}), this.userdata[o] = this.userdata[o] || {}, this.userdata[o][a] = this.userdata[o][a] || {}, this.userdata[o][a][r] = s;
      }, e._change_id = function(a, r) {
        switch (this._dp._ganttMode) {
          case "task":
            this.changeTaskId(a, r);
            break;
          case "link":
            this.changeLinkId(a, r);
            break;
          case "assignment":
            this.$data.assignmentsStore.changeId(a, r);
            break;
          case "resource":
            this.$data.resourcesStore.changeId(a, r);
            break;
          case "baseline":
            this.$data.baselineStore.changeId(a, r);
            break;
          default:
            throw new Error(`Invalid mode of the dataProcessor after database id is received: ${this._dp._ganttMode}, new id: ${r}`);
        }
      }, e._row_style = function(a, r) {
        this._dp._ganttMode === "task" && e.isTaskExists(a) && (e.getTask(a).$dataprocessor_class = r, e.refreshTask(a));
      }, e._delete_task = function(a, r) {
      }, e._sendTaskOrder = function(a, r) {
        r.$drop_target && (this._dp.setGanttMode("task"), this.getTask(a).target = r.$drop_target, this._dp.setUpdated(a, !0, "order"), delete this.getTask(a).$drop_target);
      }, e.setDp = function() {
        this._dp = i;
      }, e.setDp();
    }(this.$gantt, this);
    const n = new Ri(this.$gantt, this);
    n.attach(), this.attachEvent("onDestroy", function() {
      delete this.setGanttMode, delete this._getRowData, delete this.$gantt._dp, delete this.$gantt._change_id, delete this.$gantt._row_style, delete this.$gantt._delete_task, delete this.$gantt._sendTaskOrder, delete this.$gantt, n.detach();
    }), this.$gantt.callEvent("onDataProcessorReady", [this]), this._initialized = !0;
  }
  setOnAfterUpdate(t) {
    this.attachEvent("onAfterUpdate", t);
  }
  setOnBeforeUpdateHandler(t) {
    this.attachEvent("onBeforeDataSending", t);
  }
  setAutoUpdate(t, n) {
    t = t || 2e3, this._user = n || (/* @__PURE__ */ new Date()).valueOf(), this._needUpdate = !1, this._updateBusy = !1, this.attachEvent("onAfterUpdate", this.afterAutoUpdate), this.attachEvent("onFullSync", this.fullSync), setInterval(() => {
      this.loadUpdate();
    }, t);
  }
  afterAutoUpdate(t, n, e, i) {
    return n !== "collision" || (this._needUpdate = !0, !1);
  }
  fullSync() {
    return this._needUpdate && (this._needUpdate = !1, this.loadUpdate()), !0;
  }
  getUpdates(t, n) {
    const e = this.$gantt.ajax;
    if (this._updateBusy) return !1;
    this._updateBusy = !0, e.get(t, n);
  }
  loadUpdate() {
    const t = this.$gantt.ajax, n = this.$gantt.getUserData(0, "version", this._ganttMode);
    let e = this.serverProcessor + t.urlSeparator(this.serverProcessor) + ["dhx_user=" + this._user, "dhx_version=" + n].join("&");
    e = e.replace("editing=true&", ""), this.getUpdates(e, (i) => {
      const a = t.xpath("//userdata", i);
      this.$gantt.setUserData(0, "version", this._getXmlNodeValue(a[0]), this._ganttMode);
      const r = t.xpath("//update", i);
      if (r.length) {
        this._silent_mode = !0;
        for (let s = 0; s < r.length; s++) {
          const o = r[s].getAttribute("status"), l = r[s].getAttribute("id"), d = r[s].getAttribute("parent");
          switch (o) {
            case "inserted":
              this.callEvent("insertCallback", [r[s], l, d]);
              break;
            case "updated":
              this.callEvent("updateCallback", [r[s], l, d]);
              break;
            case "deleted":
              this.callEvent("deleteCallback", [r[s], l, d]);
          }
        }
        this._silent_mode = !1;
      }
      this._updateBusy = !1;
    });
  }
  destructor() {
    this.callEvent("onDestroy", []), this.detachAllEvents(), this.updatedRows = [], this._in_progress = {}, this._invalid = {}, this._storage.clear(), this._storage = null, this._headers = null, this._payload = null, delete this._initialized;
  }
  setGanttMode(t) {
    t === "tasks" ? t = "task" : t === "links" && (t = "link");
    const n = this.modes || {}, e = this.getGanttMode();
    e && (n[e] = { _in_progress: this._in_progress, _invalid: this._invalid, _storage: this._storage, updatedRows: this.updatedRows });
    let i = n[t];
    i || (i = n[t] = { _in_progress: {}, _invalid: {}, _storage: ee.create(), updatedRows: [] }), this._in_progress = i._in_progress, this._invalid = i._invalid, this._storage = i._storage, this.updatedRows = i.updatedRows, this.modes = n, this._ganttMode = t;
  }
  getGanttMode() {
    return this._ganttMode;
  }
  storeItem(t) {
    this._storage.storeItem(t);
  }
  url(t) {
    this.serverProcessor = this._serverProcessor = t;
  }
  _beforeSendData(t, n) {
    if (!this.callEvent("onBeforeUpdate", [n, this.getState(n), t])) return !1;
    this._sendData(t, n);
  }
  _serializeAsJSON(t) {
    if (typeof t == "string") return t;
    const n = J(t);
    return this._tMode === "REST-JSON" && (delete n.id, delete n[this.action_param]), JSON.stringify(n);
  }
  _applyPayload(t) {
    const n = this.$gantt.ajax;
    if (this._payload) for (const e in this._payload) t = t + n.urlSeparator(t) + this.escape(e) + "=" + this.escape(this._payload[e]);
    return t;
  }
  _cleanupArgumentsBeforeSend(t) {
    let n;
    if (t[this.action_param] === void 0) {
      n = {};
      for (const e in t) n[e] = this._cleanupArgumentsBeforeSend(t[e]);
    } else n = this._cleanupItemBeforeSend(t);
    return n;
  }
  _cleanupItemBeforeSend(t) {
    let n = null;
    return t && (t[this.action_param] === "deleted" ? (n = {}, n.id = t.id, n[this.action_param] = t[this.action_param]) : n = t), n;
  }
  _sendData(t, n) {
    if (!t) return;
    if (!this.callEvent("onBeforeDataSending", n ? [n, this.getState(n), t] : [null, null, t])) return !1;
    n && (this._in_progress[n] = (/* @__PURE__ */ new Date()).valueOf());
    const e = this.$gantt.ajax;
    if (this._tMode === "CUSTOM") {
      const l = this.getState(n), d = this.getActionByState(l);
      delete t[this.action_param];
      const u = this.getGanttMode(), c = (_) => {
        let f = l || "updated", v = n, k = n;
        _ && (f = _.action || l, v = _.sid || v, k = _.id || _.tid || k), this.afterUpdateCallback(v, k, f, _, u);
      };
      let h;
      if (this._router instanceof Function) if (this._routerParametersFormat === "object") {
        const _ = { entity: u, action: d, data: t, id: n };
        h = this._router(_);
      } else h = this._router(u, d, t, n);
      else if (this._router[u] instanceof Function) h = this._router[u](d, t, n);
      else {
        const _ = "Incorrect configuration of gantt.createDataProcessor", f = `
You need to either add missing properties to the dataProcessor router object or to use a router function.
See https://docs.dhtmlx.com/gantt/desktop__server_side.html#customrouting and https://docs.dhtmlx.com/gantt/api__gantt_createdataprocessor.html for details.`;
        if (!this._router[u]) throw new Error(`${_}: router for the **${u}** entity is not defined. ${f}`);
        switch (l) {
          case "inserted":
            if (!this._router[u].create) throw new Error(`${_}: **create** action for the **${u}** entity is not defined. ${f}`);
            h = this._router[u].create(t);
            break;
          case "deleted":
            if (!this._router[u].delete) throw new Error(`${_}: **delete** action for the **${u}** entity is not defined. ${f}`);
            h = this._router[u].delete(n);
            break;
          default:
            if (!this._router[u].update) throw new Error(`${_}: **update**" action for the **${u}** entity is not defined. ${f}`);
            h = this._router[u].update(t, n);
        }
      }
      if (h) {
        if (!h.then && h.id === void 0 && h.tid === void 0 && h.action === void 0) throw new Error("Incorrect router return value. A Promise or a response object is expected");
        h.then ? h.then(c).catch((_) => {
          _ && _.action ? c(_) : c({ action: "error", value: _ });
        }) : c(h);
      } else c(null);
      return;
    }
    let i;
    i = { callback: (l) => {
      const d = [];
      if (n) d.push(n);
      else if (t) for (const u in t) d.push(u);
      return this.afterUpdate(this, l, d);
    }, headers: this._headers };
    const a = "dhx_version=" + this.$gantt.getUserData(0, "version", this._ganttMode), r = this.serverProcessor + (this._user ? e.urlSeparator(this.serverProcessor) + ["dhx_user=" + this._user, a].join("&") : "");
    let s, o = this._applyPayload(r);
    switch (this._tMode) {
      case "GET":
        s = this._cleanupArgumentsBeforeSend(t), i.url = o + e.urlSeparator(o) + this.serialize(s, n), i.method = "GET";
        break;
      case "POST":
        s = this._cleanupArgumentsBeforeSend(t), i.url = o, i.method = "POST", i.data = this.serialize(s, n);
        break;
      case "JSON":
        s = {};
        const l = this._cleanupItemBeforeSend(t);
        for (const d in l) d !== this.action_param && d !== "id" && d !== "gr_id" && (s[d] = l[d]);
        i.url = o, i.method = "POST", i.data = JSON.stringify({ id: n, action: t[this.action_param], data: s });
        break;
      case "REST":
      case "REST-JSON":
        switch (o = r.replace(/(&|\?)editing=true/, ""), s = "", this.getState(n)) {
          case "inserted":
            i.method = "POST", i.data = this.serialize(t, n);
            break;
          case "deleted":
            i.method = "DELETE", o = o + (o.slice(-1) === "/" ? "" : "/") + n;
            break;
          default:
            i.method = "PUT", i.data = this.serialize(t, n), o = o + (o.slice(-1) === "/" ? "" : "/") + n;
        }
        i.url = this._applyPayload(o);
    }
    return this._waitMode++, e.query(i);
  }
  _forEachUpdatedRow(t) {
    const n = this.updatedRows.slice();
    for (let e = 0; e < n.length; e++) {
      const i = n[e];
      this.$gantt.getUserData(i, this.action_param, this._ganttMode) && t.call(this, i);
    }
  }
  _setDefaultTransactionMode() {
    this.serverProcessor && (this.setTransactionMode("POST", !0), this.serverProcessor += (this.serverProcessor.indexOf("?") !== -1 ? "&" : "?") + "editing=true", this._serverProcessor = this.serverProcessor);
  }
  _getXmlNodeValue(t) {
    return t.firstChild ? t.firstChild.nodeValue : "";
  }
  _getAllData() {
    const t = {};
    let n = !1;
    return this._forEachUpdatedRow(function(e) {
      if (this._in_progress[e] || this.is_invalid(e)) return;
      const i = this._getRowData(e);
      this.callEvent("onBeforeUpdate", [e, this.getState(e), i]) && (t[e] = i, n = !0, this._in_progress[e] = (/* @__PURE__ */ new Date()).valueOf());
    }), n ? t : null;
  }
  _prepareDate(t) {
    return this.$gantt.defined(this.$gantt.templates.xml_format) ? this.$gantt.templates.xml_format(t) : (this.$gantt.date._isoDateDetected || this.$gantt.config.date_format === "iso") && this.$gantt.templates.format_date._ganttAuto ? this.$gantt.date._isoDateOnly ? this.$gantt.date.formatISODateOnly(t) : this.$gantt.date.formatISODate(t) : this.$gantt.templates.format_date(t);
  }
  _prepareArray(t, n) {
    return n.push(t), t.map((e) => at(e) ? this._prepareDate(e) : Array.isArray(e) && !Yt(n, e) ? this._prepareArray(e, n) : e && typeof e == "object" && !Yt(n, e) ? this._prepareObject(e, n) : e);
  }
  _prepareObject(t, n) {
    const e = {};
    n.push(t);
    for (const i in t) {
      if (i.substr(0, 1) === "$") continue;
      const a = t[i];
      at(a) ? e[i] = this._prepareDate(a) : a === null ? e[i] = "" : Array.isArray(a) && !Yt(n, a) ? e[i] = this._prepareArray(a, n) : a && typeof a == "object" && !Yt(n, a) ? e[i] = this._prepareObject(a, n) : e[i] = a;
    }
    return e;
  }
  _prepareDataItem(t) {
    const n = this._prepareObject(t, []);
    return n[this.action_param] = this.$gantt.getUserData(t.id, this.action_param, this._ganttMode), n;
  }
  getStoredItem(t) {
    return this._storage.getStoredItem(t);
  }
  _getRowData(t) {
    let n;
    const e = this.$gantt;
    return this.getGanttMode() === "task" ? e.isTaskExists(t) && (n = this.$gantt.getTask(t)) : this.getGanttMode() === "assignment" ? this.$gantt.$data.assignmentsStore.exists(t) && (n = this.$gantt.$data.assignmentsStore.getItem(t)) : this.getGanttMode() === "baseline" ? this.$gantt.$data.baselineStore.exists(t) && (n = this.$gantt.$data.baselineStore.getItem(t)) : e.isLinkExists(t) && (n = this.$gantt.getLink(t)), n || (n = this.getStoredItem(t)), n || (n = { id: t }), this._prepareDataItem(n);
  }
};
const Hi = function(t) {
  return new Vn(t);
}, Oi = function(t) {
  let n, e, i;
  t instanceof Function ? n = t : t.hasOwnProperty("router") ? n = t.router : t.hasOwnProperty("assignment") || t.hasOwnProperty("baseline") || t.hasOwnProperty("link") || t.hasOwnProperty("task") ? n = t : t.hasOwnProperty("headers") && (i = t.headers), e = n ? "CUSTOM" : t.mode || "REST-JSON";
  const a = new Vn(t.url);
  return a.init(this), a.setTransactionMode({ mode: e, router: n, headers: i }, t.batchUpdate), t.deleteAfterConfirmation && (a.deleteAfterConfirmation = t.deleteAfterConfirmation), a;
};
function Bi(t) {
  var n = {}, e = !1;
  function i(l, d) {
    d = typeof d == "function" ? d : function() {
    }, n[l] || (n[l] = this[l], this[l] = d);
  }
  function a(l) {
    n[l] && (this[l] = n[l], n[l] = null);
  }
  function r(l) {
    for (var d in l) i.call(this, d, l[d]);
  }
  function s() {
    for (var l in n) a.call(this, l);
  }
  function o(l) {
    try {
      l();
    } catch (d) {
      tt.console.error(d);
    }
  }
  return t.$services.getService("state").registerProvider("batchUpdate", function() {
    return { batch_update: e };
  }, !1), function(l, d) {
    if (e) o(l);
    else {
      var u, c = this._dp && this._dp.updateMode != "off";
      c && (u = this._dp.updateMode, this._dp.setUpdateMode("off"));
      var h = {}, _ = { render: !0, refreshData: !0, refreshTask: !0, refreshLink: !0, resetProjectDates: function(v) {
        h[v.id] = v;
      } };
      for (var f in r.call(this, _), e = !0, this.callEvent("onBeforeBatchUpdate", []), o(l), this.callEvent("onAfterBatchUpdate", []), s.call(this), h) this.resetProjectDates(h[f]);
      e = !1, d || this.render(), c && (this._dp.setUpdateMode(u), this._dp.setGanttMode("task"), this._dp.sendData(), this._dp.setGanttMode("link"), this._dp.sendData());
    }
  };
}
function zi(t) {
  t.batchUpdate = Bi(t);
}
function ji(t) {
  const n = /* @__PURE__ */ function(i) {
    return { _needRecalc: !0, reset: function() {
      this._needRecalc = !0;
    }, _isRecalcNeeded: function() {
      return !this._isGroupSort() && this._needRecalc;
    }, _isGroupSort: function() {
      return !!i.getState().group_mode;
    }, _getWBSCode: function(a) {
      return a ? (this._isRecalcNeeded() && this._calcWBS(), a.$virtual ? "" : this._isGroupSort() ? a.$wbs || "" : (a.$wbs || (this.reset(), this._calcWBS()), a.$wbs)) : "";
    }, _setWBSCode: function(a, r) {
      a.$wbs = r;
    }, getWBSCode: function(a) {
      return this._getWBSCode(a);
    }, getByWBSCode: function(a) {
      let r = a.split("."), s = i.config.root_id;
      for (let o = 0; o < r.length; o++) {
        const l = i.getChildren(s);
        let d = 1 * r[o] - 1;
        if (!i.isTaskExists(l[d])) return null;
        s = l[d];
      }
      return i.isTaskExists(s) ? i.getTask(s) : null;
    }, _calcWBS: function() {
      if (!this._isRecalcNeeded()) return;
      let a = !0;
      i.eachTask(function(r) {
        if (r.type == i.config.types.placeholder) return;
        if (a) return a = !1, void this._setWBSCode(r, "1");
        const s = this._getPrevNonPlaceholderSibling(r.id);
        if (s !== null) this._increaseWBS(r, s);
        else {
          let o = i.getParent(r.id);
          this._setWBSCode(r, i.getTask(o).$wbs + ".1");
        }
      }, i.config.root_id, this), this._needRecalc = !1;
    }, _increaseWBS: function(a, r) {
      let s = i.getTask(r).$wbs;
      s && (s = s.split("."), s[s.length - 1]++, this._setWBSCode(a, s.join(".")));
    }, _getPrevNonPlaceholderSibling: function(a) {
      let r, s = a;
      do
        r = i.getPrevSibling(s), s = r;
      while (r !== null && i.getTask(r).type == i.config.types.placeholder);
      return r;
    } };
  }(t);
  function e() {
    return n.reset(), !0;
  }
  t.getWBSCode = function(i) {
    return n.getWBSCode(i);
  }, t.getTaskByWBSCode = function(i) {
    return n.getByWBSCode(i);
  }, t.attachEvent("onAfterTaskMove", e), t.attachEvent("onBeforeParse", e), t.attachEvent("onAfterTaskDelete", e), t.attachEvent("onAfterTaskAdd", e), t.attachEvent("onAfterSort", e);
}
function Fi(t) {
  var n = {}, e = !1;
  t.$data.tasksStore.attachEvent("onStoreUpdated", function() {
    n = {}, e = !1;
  }), t.attachEvent("onBeforeGanttRender", function() {
    n = {};
  });
  var i = String(Math.random());
  function a(l) {
    return l === null ? i + String(l) : String(l);
  }
  function r(l, d, u) {
    return Array.isArray(l) ? l.map(function(c) {
      return a(c);
    }).join("_") + `_${d}_${u}` : a(l) + `_${d}_${u}`;
  }
  function s(l, d, u) {
    var c, h = r(d, l, JSON.stringify(u)), _ = {};
    return ht(d, function(f) {
      _[a(f)] = !0;
    }), n[h] ? c = n[h] : (c = n[h] = [], t.eachTask(function(f) {
      if (u) {
        if (!u[t.getTaskType(f)]) return;
      } else if (f.type == t.config.types.project) return;
      l in f && ht(Lt(f[l]) ? f[l] : [f[l]], function(v) {
        var k = v && v.resource_id ? v.resource_id : v;
        if (_[a(k)]) c.push(f);
        else if (!e) {
          var b = r(v, l);
          n[b] || (n[b] = []), n[b].push(f);
        }
      });
    }), e = !0), c;
  }
  function o(l, d, u) {
    var c = t.config.resource_property, h = [];
    if (t.getDatastore("task").exists(d)) {
      var _ = t.getTask(d);
      h = _[c] || [];
    }
    Array.isArray(h) || (h = [h]);
    for (var f = 0; f < h.length; f++) h[f].resource_id == l && u.push({ task_id: _.id, resource_id: h[f].resource_id, value: h[f].value });
  }
  return { getTaskBy: function(l, d, u) {
    return typeof l == "function" ? (c = l, h = [], t.eachTask(function(_) {
      c(_) && h.push(_);
    }), h) : Lt(d) ? s(l, d, u) : s(l, [d], u);
    var c, h;
  }, getResourceAssignments: function(l, d) {
    var u = [], c = t.config.resource_property;
    return d !== void 0 ? o(l, d, u) : t.getTaskBy(c, l).forEach(function(h) {
      o(l, h.id, u);
    }), u;
  } };
}
function Wi(t) {
  const n = { renderEditableLabel: function(e, i, a, r, s) {
    const o = t.config.readonly ? "" : "contenteditable";
    if (e < a.end_date && i > a.start_date) {
      for (let l = 0; l < s.length; l++) {
        const d = s[l];
        return "<div " + o + " data-assignment-cell data-assignment-id='" + d.id + "' data-row-id='" + a.id + "' data-task='" + a.$task_id + "' data-start-date='" + t.templates.format_date(e) + "' data-end-date='" + t.templates.format_date(i) + "'>" + d.value + "</div>";
      }
      return "<div " + o + " data-assignment-cell data-empty  data-row-id='" + a.id + "' data-resource-id='" + a.$resource_id + "' data-task='" + a.$task_id + "' data-start-date='" + t.templates.format_date(e) + "''  data-end-date='" + t.templates.format_date(i) + "'>-</div>";
    }
    return "";
  }, renderSummaryLabel: function(e, i, a, r, s) {
    let o = s.reduce(function(l, d) {
      return l + Number(d.value);
    }, 0);
    return o % 1 && (o = Math.round(10 * o) / 10), o ? "<div>" + o + "</div>" : "";
  }, editableResourceCellTemplate: function(e, i, a, r, s) {
    return a.$role === "task" ? n.renderEditableLabel(e, i, a, r, s) : n.renderSummaryLabel(e, i, a, r, s);
  }, editableResourceCellClass: function(e, i, a, r, s) {
    const o = [];
    o.push("resource_marker"), a.$role === "task" ? o.push("task_cell") : o.push("resource_cell");
    const l = s.reduce(function(u, c) {
      return u + Number(c.value);
    }, 0);
    let d = Number(a.capacity);
    return isNaN(d) && (d = 8), l <= d ? o.push("workday_ok") : o.push("workday_over"), o.join(" ");
  }, getSummaryResourceAssignments: function(e) {
    let i;
    const a = t.getDatastore(t.config.resource_store), r = a.getItem(e);
    return r.$role === "task" ? i = t.getResourceAssignments(r.$resource_id, r.$task_id) : (i = t.getResourceAssignments(e), a.eachItem && a.eachItem(function(s) {
      s.$role !== "task" && (i = i.concat(t.getResourceAssignments(s.id)));
    }, e)), i;
  }, initEditableDiagram: function() {
    t.config.resource_render_empty_cells = !0, function() {
      let a = null;
      function r() {
        return a && cancelAnimationFrame(a), a = requestAnimationFrame(function() {
          t.$container && Array.prototype.slice.call(t.$container.querySelectorAll(".resourceTimeline_cell [data-assignment-cell]")).forEach(function(s) {
            s.contentEditable = !0;
          });
        }), !0;
      }
      t.attachEvent("onGanttReady", function() {
        t.getDatastore(t.config.resource_assignment_store).attachEvent("onStoreUpdated", r), t.getDatastore(t.config.resource_store).attachEvent("onStoreUpdated", r);
      }, { once: !0 }), t.attachEvent("onGanttLayoutReady", function() {
        t.$layout.getCellsByType("viewCell").forEach(function(s) {
          s.$config && s.$config.view === "resourceTimeline" && s.$content && s.$content.attachEvent("onScroll", r);
        });
      });
    }();
    let e = null;
    function i(a, r) {
      let s = r || a.target.closest(".resourceTimeline_cell [data-assignment-cell]");
      if (s) {
        let o = (s.innerText || "").trim();
        o == "-" && (o = "0");
        let l = Number(o), d = s.getAttribute("data-row-id"), u = s.getAttribute("data-assignment-id"), c = s.getAttribute("data-task"), h = s.getAttribute("data-resource-id"), _ = t.templates.parse_date(s.getAttribute("data-start-date")), f = t.templates.parse_date(s.getAttribute("data-end-date"));
        const v = t.getDatastore(t.config.resource_assignment_store);
        if (isNaN(l)) t.getDatastore(t.config.resource_store).refresh(d);
        else {
          const k = t.getTask(c);
          if (u) {
            t.plugins().undo && t.ext.undo.saveState(c, "task");
            const b = v.getItem(u);
            if (!b || l === b.value) return;
            if (b.start_date.valueOf() === _.valueOf() && b.end_date.valueOf() === f.valueOf()) b.value = l, l ? v.updateItem(b.id) : v.removeItem(b.id);
            else {
              if (b.end_date.valueOf() > f.valueOf()) {
                const m = t.copy(b);
                m.id = t.uid(), m.start_date = f, m.duration = t.calculateDuration({ start_date: m.start_date, end_date: m.end_date, task: k }), m.delay = t.calculateDuration({ start_date: k.start_date, end_date: m.start_date, task: k }), m.mode = b.mode || "default", m.duration !== 0 && v.addItem(m);
              }
              b.start_date.valueOf() < _.valueOf() ? (b.end_date = _, b.duration = t.calculateDuration({ start_date: b.start_date, end_date: b.end_date, task: k }), b.mode = "fixedDuration", b.duration === 0 ? v.removeItem(b.id) : v.updateItem(b.id)) : v.removeItem(b.id), l && v.addItem({ task_id: b.task_id, resource_id: b.resource_id, value: l, start_date: _, end_date: f, duration: t.calculateDuration({ start_date: _, end_date: f, task: k }), delay: t.calculateDuration({ start_date: k.start_date, end_date: _, task: k }), mode: "fixedDuration" });
            }
            t.updateTaskAssignments(k.id), t.updateTask(k.id);
          } else if (l) {
            let b = { task_id: c, resource_id: h, value: l, start_date: _, end_date: f, duration: t.calculateDuration({ start_date: _, end_date: f, task: k }), delay: t.calculateDuration({ start_date: k.start_date, end_date: _, task: k }), mode: "fixedDuration" };
            v.addItem(b), t.updateTaskAssignments(k.id), t.updateTask(k.id);
          }
        }
      }
    }
    t.attachEvent("onGanttReady", function() {
      let a = null;
      t.event(t.$container, "keypress", function(r) {
        let s = r.target.closest(".resourceTimeline_cell [data-assignment-cell]");
        s && (r.keyCode !== 13 && r.keyCode !== 27 || (s.blur(), i(r)), a = r.target);
      }), t.event(t.$container, "keydown", function(r) {
        r.key === "Tab" && (e = Vt(t.$container).indexOf(document.activeElement), i(r), setTimeout(function() {
          var l;
          const o = Vt(t.$container);
          e > -1 && ((l = o[e + 1]) == null || l.focus());
        }, 300));
      }), t.event(t.$container, "click", function(r) {
        if (a && (i(r, a), a = null, r.target.hasAttribute("data-assignment-id"))) {
          const s = t.$container.querySelectorAll("[contenteditable='true']"), o = Array.from(s).find((l) => l.getAttribute("data-start-date") == r.target.getAttribute("data-start-date") && l.getAttribute("data-assignment-id") == r.target.getAttribute("data-assignment-id"));
          setTimeout(() => {
            const l = t.$container.querySelectorAll("[contenteditable='true']"), d = Array.from(l).find((u) => u.getAttribute("data-start-date") == o.getAttribute("data-start-date") && u.getAttribute("data-row-id") == o.getAttribute("data-row-id"));
            d && d.focus();
          }, 400);
        }
      });
    }, { once: !0 });
  } };
  return n;
}
function Vi(t) {
  var n = Fi(t);
  t.ext.resources = Wi(t), t.config.resources = { dataprocessor_assignments: !1, dataprocessor_resources: !1, editable_resource_diagram: !1, resource_store: { type: "treeDataStore", fetchTasks: !1, initItem: function(a) {
    return a.parent = a.parent || t.config.root_id, a[t.config.resource_property] = a.parent, a.open = !0, a;
  } }, lightbox_resources: function(a) {
    const r = [], s = t.getDatastore(t.config.resource_store);
    return a.forEach(function(o) {
      if (!s.hasChild(o.id)) {
        const l = t.copy(o);
        l.key = o.id, l.label = o.text, r.push(l);
      }
    }), r;
  } }, t.attachEvent("onBeforeGanttReady", function() {
    if (t.getDatastore(t.config.resource_store)) return;
    const a = t.config.resources ? t.config.resources.resource_store : void 0;
    let r = a ? a.fetchTasks : void 0;
    t.config.resources && t.config.resources.editable_resource_diagram && (r = !0);
    let s = function(l) {
      return l.parent = l.parent || t.config.root_id, l[t.config.resource_property] = l.parent, l.open = !0, l;
    };
    a && a.initItem && (s = a.initItem);
    const o = a && a.type ? a.type : "treeDatastore";
    t.$resourcesStore = t.createDatastore({ name: t.config.resource_store, type: o, fetchTasks: r !== void 0 && r, initItem: s }), t.$data.resourcesStore = t.$resourcesStore, t.$resourcesStore.attachEvent("onParse", function() {
      let l, d = function(u) {
        const c = [];
        return u.forEach(function(h) {
          const _ = t.copy(h);
          _.key = h.id, _.label = h.text, c.push(_);
        }), c;
      };
      t.config.resources && t.config.resources.lightbox_resources && (d = t.config.resources.lightbox_resources), t.config.resources && t.config.resources.editable_resource_diagram ? l = d(t.$resourcesStore.getItems().filter((u) => {
        let c = t.getResourceAssignments(u.id);
        if (!t.$resourcesStore.hasChild(u.id) || c && c.length) return !u.$resource_id || !u.$task_id;
      })) : l = d(t.$resourcesStore.getItems()), t.updateCollection("resourceOptions", l);
    });
  }), t.getTaskBy = n.getTaskBy, t.getResourceAssignments = n.getResourceAssignments, t.config.resource_property = "owner_id", t.config.resource_store = "resource", t.config.resource_render_empty_cells = !1, t.templates.histogram_cell_class = function(a, r, s, o, l) {
  }, t.templates.histogram_cell_label = function(a, r, s, o, l) {
    return o.length + "/3";
  }, t.templates.histogram_cell_allocated = function(a, r, s, o, l) {
    return o.length / 3;
  }, t.templates.histogram_cell_capacity = function(a, r, s, o, l) {
    return 0;
  };
  const e = function(a, r, s, o, l) {
    return o.length <= 1 ? "gantt_resource_marker_ok" : "gantt_resource_marker_overtime";
  }, i = function(a, r, s, o, l) {
    return 8 * o.length;
  };
  t.templates.resource_cell_value = i, t.templates.resource_cell_class = e, t.attachEvent("onBeforeGanttReady", function() {
    t.config.resources && t.config.resources.editable_resource_diagram && (t.config.resource_render_empty_cells = !0, t.templates.resource_cell_value === i && (t.templates.resource_cell_value = t.ext.resources.editableResourceCellTemplate), t.templates.resource_cell_class === e && (t.templates.resource_cell_class = t.ext.resources.editableResourceCellClass), t.ext.resources.initEditableDiagram(t));
  });
}
function Ui(t) {
  var n = "$resourceAssignments";
  t.config.resource_assignment_store = "resourceAssignments", t.config.process_resource_assignments = !0;
  var e = "auto", i = "singleValue", a = "valueArray", r = "resourceValueArray", s = "assignmentsArray", o = e, l = "fixedDates", d = "fixedDuration", u = "default";
  function c(p, y) {
    p.start_date ? p.start_date = t.date.parseDate(p.start_date, "parse_date") : p.start_date = null, p.end_date ? p.end_date = t.date.parseDate(p.end_date, "parse_date") : p.end_date = null;
    var $ = Number(p.delay), x = !1;
    if (isNaN($) ? (p.delay = 0, x = !0) : p.delay = $, t.defined(p.value) || (p.value = null), !p.task_id || !p.resource_id) return !1;
    if (p.mode = p.mode || u, p.mode === d && (isNaN(Number(p.duration)) && (y = y || t.getTask(p.task_id), p.duration = t.calculateDuration({ start_date: p.start_date, end_date: p.end_date, id: y })), x && (y = y || t.getTask(p.task_id), p.delay = t.calculateDuration({ start_date: y.start_date, end_date: p.start_date, id: y }))), p.mode !== l && (y || t.isTaskExists(p.task_id))) {
      var w = _(p, y = y || t.getTask(p.task_id));
      p.start_date = w.start_date, p.end_date = w.end_date, p.duration = w.duration;
    }
  }
  var h = t.createDatastore({ name: t.config.resource_assignment_store, initItem: function(p) {
    return p.id || (p.id = t.uid()), c(p), p;
  } });
  function _(p, y) {
    if (p.mode === l) return { start_date: p.start_date, end_date: p.end_date, duration: p.duration };
    var $, x, w = p.delay ? t.calculateEndDate({ start_date: y.start_date, duration: p.delay, task: y }) : new Date(y.start_date);
    return p.mode === d ? ($ = t.calculateEndDate({ start_date: w, duration: p.duration, task: y }), x = p.duration) : ($ = new Date(y.end_date), x = y.duration - p.delay), { start_date: w, end_date: $, duration: x };
  }
  function f(p) {
    const y = t.config.resource_property;
    let $ = p[y];
    const x = [];
    let w = o === e;
    if (t.defined($) && $) {
      Array.isArray($) || ($ = [$], w && (o = i, w = !1));
      const T = {};
      $.forEach(function(S) {
        S.resource_id || (S = { resource_id: S }, w && (o = a, w = !1)), w && (S.id && S.resource_id ? (o = s, w = !1) : (o = r, w = !1));
        let C, E = u;
        S.mode || (S.start_date && S.end_date || S.start_date && S.duration) && (E = d), C = S.id || !S.$id || T[S.$id] ? S.id && !T[S.id] ? S.id : t.uid() : S.$id, T[C] = !0;
        const D = { id: C, start_date: S.start_date, duration: S.duration, end_date: S.end_date, delay: S.delay, task_id: p.id, resource_id: S.resource_id, value: S.value, mode: S.mode || E };
        Object.keys(S).forEach((I) => {
          I != "$id" && (D[I] = S[I]);
        }), D.start_date && D.start_date.getMonth && D.end_date && D.end_date.getMonth && typeof D.duration == "number" || c(D, p), x.push(D);
      });
    }
    return x;
  }
  function v(p) {
    if (!t.isTaskExists(p)) return;
    const y = t.getTask(p), $ = h.find((x) => x.task_id == y.id);
    k(y, $);
  }
  function k(p, y) {
    y.sort(function($, x) {
      return $.start_date && x.start_date && $.start_date.valueOf() != x.start_date.valueOf() ? $.start_date - x.start_date : 0;
    }), o == s ? p[t.config.resource_property] = y : o == r && (p[t.config.resource_property] = y.map(function($) {
      return { $id: $.id, start_date: $.start_date, duration: $.duration, end_date: $.end_date, delay: $.delay, resource_id: $.resource_id, value: $.value, mode: $.mode };
    })), p[n] = y;
  }
  function b(p) {
    var y = f(p);
    return y.forEach(function($) {
      $.id = $.id || t.uid();
    }), y;
  }
  function m(p, y) {
    var $ = function(x, w) {
      var T = { inBoth: [], inTaskNotInStore: [], inStoreNotInTask: [] };
      if (o == i) {
        var S = x[0], C = S ? S.resource_id : null, E = !1;
        w.forEach(function(A) {
          A.resource_id != C ? T.inStoreNotInTask.push(A) : A.resource_id == C && (T.inBoth.push({ store: A, task: S }), E = !0);
        }), !E && S && T.inTaskNotInStore.push(S);
      } else if (o == a) {
        var D = {}, I = {}, M = {};
        x.forEach(function(A) {
          D[A.resource_id] = A;
        }), w.forEach(function(A) {
          I[A.resource_id] = A;
        }), x.concat(w).forEach(function(A) {
          if (!M[A.resource_id]) {
            M[A.resource_id] = !0;
            var L = D[A.resource_id], N = I[A.resource_id];
            L && N ? T.inBoth.push({ store: N, task: L }) : L && !N ? T.inTaskNotInStore.push(L) : !L && N && T.inStoreNotInTask.push(N);
          }
        });
      } else o != s && o != r || (D = {}, I = {}, M = {}, x.forEach(function(A) {
        D[A.id || A.$id] = A;
      }), w.forEach(function(A) {
        I[A.id] = A;
      }), x.concat(w).forEach(function(A) {
        var L = A.id || A.$id;
        if (!M[L]) {
          M[L] = !0;
          var N = D[L], P = I[L];
          N && P ? T.inBoth.push({ store: P, task: N }) : N && !P ? T.inTaskNotInStore.push(N) : !N && P && T.inStoreNotInTask.push(P);
        }
      }));
      return T;
    }(f(p), y);
    $.inStoreNotInTask.forEach(function(x) {
      h.removeItem(x.id);
    }), $.inTaskNotInStore.forEach(function(x) {
      h.addItem(x);
    }), $.inBoth.forEach(function(x) {
      if (function(T, S) {
        var C = { id: !0 };
        for (var E in T) if (!C[E] && String(T[E]) !== String(S[E])) return !0;
        return !1;
      }(x.task, x.store)) (function(T, S) {
        var C = { id: !0 };
        for (var E in T) C[E] || (S[E] = T[E]);
      })(x.task, x.store), h.updateItem(x.store.id);
      else if (x.task.start_date && x.task.end_date && x.task.mode !== l) {
        var w = _(x.store, p);
        x.store.start_date.valueOf() == w.start_date.valueOf() && x.store.end_date.valueOf() == w.end_date.valueOf() || (x.store.start_date = w.start_date, x.store.end_date = w.end_date, x.store.duration = w.duration, h.updateItem(x.store.id));
      }
    }), v(p.id);
  }
  function g(p) {
    var y = p[n] || h.find(function($) {
      return $.task_id == p.id;
    });
    m(p, y);
  }
  t.$data.assignmentsStore = h, t.attachEvent("onGanttReady", function() {
    if (t.config.process_resource_assignments) {
      t.attachEvent("onParse", function() {
        t.silent(function() {
          h.clearAll();
          var C = [];
          t.eachTask(function(E) {
            if (E.type !== t.config.types.project) {
              var D = b(E);
              k(E, D), D.forEach(function(I) {
                C.push(I);
              });
            }
          }), h.parse(C);
        });
      });
      var p = !1, y = !1, $ = {}, x = !1;
      t.attachEvent("onBeforeBatchUpdate", function() {
        p = !0;
      }), t.attachEvent("onAfterBatchUpdate", function() {
        if (y) {
          var C = {};
          for (var E in $) C[E] = t.getTaskAssignments($[E].id);
          for (var E in t.config.process_resource_assignments && o === "resourceValueArray" && (S = null), $) m($[E], C[E]);
        }
        y = !1, p = !1, $ = {};
      }), t.attachEvent("onTaskCreated", function(C) {
        var E = b(C);
        return h.parse(E), k(C, E), !0;
      }), t.attachEvent("onAfterTaskUpdate", function(C, E) {
        p ? (y = !0, $[C] = E) : E.unscheduled || g(E);
      }), t.attachEvent("onAfterTaskAdd", function(C, E) {
        p ? (y = !0, $[C] = E) : g(E);
      }), t.attachEvent("onRowDragEnd", function(C) {
        g(t.getTask(C));
      }), t.$data.tasksStore.attachEvent("onAfterDeleteConfirmed", function(C, E) {
        var D, I = [C];
        t.eachTask(function(M) {
          I.push(M.id);
        }, C), D = {}, I.forEach(function(M) {
          D[M] = !0;
        }), h.find(function(M) {
          return D[M.task_id];
        }).forEach(function(M) {
          h.removeItem(M.id);
        });
      }), t.$data.tasksStore.attachEvent("onClearAll", function() {
        return w = null, T = null, S = null, h.clearAll(), !0;
      }), t.attachEvent("onTaskIdChange", function(C, E) {
        h.find(function(D) {
          return D.task_id == C;
        }).forEach(function(D) {
          D.task_id = E, h.updateItem(D.id);
        }), v(E);
      }), t.attachEvent("onBeforeUndo", function(C) {
        return x = !0, !0;
      }), t.attachEvent("onAfterUndo", function(C) {
        x = !0;
      });
      var w = null, T = null, S = null;
      h.attachEvent("onStoreUpdated", function() {
        return p && !x || (w = null, T = null, S = null), !0;
      }), t.getResourceAssignments = function(C, E) {
        var D = t.defined(E) && E !== null;
        return w === null && (w = {}, T = {}, h.eachItem(function(I) {
          w[I.resource_id] || (w[I.resource_id] = []), w[I.resource_id].push(I);
          var M = I.resource_id + "-" + I.task_id;
          T[M] || (T[M] = []), T[M].push(I);
        })), D ? (T[C + "-" + E] || []).slice() : (w[C] || []).slice();
      }, t.getTaskAssignments = function(C) {
        if (S === null) {
          var E = [];
          S = {}, h.eachItem(function(D) {
            S[D.task_id] || (S[D.task_id] = []), S[D.task_id].push(D), D.task_id == C && E.push(D);
          });
        }
        return (S[C] || []).slice();
      }, t.getTaskResources = function(C) {
        const E = t.getDatastore("resource"), D = t.getTaskAssignments(C), I = {};
        D.forEach(function(A) {
          I[A.resource_id] || (I[A.resource_id] = A.resource_id);
        });
        const M = [];
        for (const A in I) {
          const L = E.getItem(I[A]);
          L && M.push(L);
        }
        return M;
      }, t.updateTaskAssignments = v;
    }
  }, { once: !0 });
}
function Gi(t) {
  function n(o) {
    return function() {
      return !t.config.placeholder_task || o.apply(this, arguments);
    };
  }
  function e() {
    var o = t.getTaskBy("type", t.config.types.placeholder);
    if (!o.length || !t.isTaskExists(o[0].id)) {
      var l = { unscheduled: !0, type: t.config.types.placeholder, duration: 0, text: t.locale.labels.new_task };
      if (t.callEvent("onTaskCreated", [l]) === !1) return;
      t.addTask(l);
    }
  }
  function i(o) {
    var l = t.getTask(o);
    l.type == t.config.types.placeholder && (l.start_date && l.end_date && l.unscheduled && (l.unscheduled = !1), t.batchUpdate(function() {
      var d = t.copy(l);
      t.silent(function() {
        t.deleteTask(l.id);
      }), delete d["!nativeeditor_status"], d.type = t.config.types.task, d.id = t.uid(), t.addTask(d);
    }));
  }
  t.config.types.placeholder = "placeholder", t.attachEvent("onDataProcessorReady", n(function(o) {
    o && !o._silencedPlaceholder && (o._silencedPlaceholder = !0, o.attachEvent("onBeforeUpdate", n(function(l, d, u) {
      return u.type != t.config.types.placeholder || (o.setUpdated(l, !1), !1);
    })));
  }));
  var a = !1;
  function r(o) {
    return !!(t.config.types.placeholder && t.isTaskExists(o) && t.getTask(o).type == t.config.types.placeholder);
  }
  function s(o) {
    return !(!r(o.source) && !r(o.target));
  }
  t.attachEvent("onGanttReady", function() {
    a || (a = !0, t.attachEvent("onAfterTaskUpdate", n(i)), t.attachEvent("onAfterTaskAdd", n(function(o, l) {
      l.type != t.config.types.placeholder && (t.getTaskBy("type", t.config.types.placeholder).forEach(function(d) {
        t.silent(function() {
          t.isTaskExists(d.id) && t.deleteTask(d.id);
        });
      }), e());
    })), t.attachEvent("onParse", n(e)));
  }), t.attachEvent("onLinkValidation", function(o) {
    return !s(o);
  }), t.attachEvent("onBeforeLinkAdd", function(o, l) {
    return !s(l);
  }), t.attachEvent("onBeforeUndoStack", function(o) {
    for (var l = 0; l < o.commands.length; l++) {
      var d = o.commands[l];
      d.entity === "task" && d.value.type === t.config.types.placeholder && (o.commands.splice(l, 1), l--);
    }
    return !0;
  });
}
function qi(t) {
  function n(u) {
    return function() {
      return !t.config.auto_types || t.getTaskType(t.config.types.project) != t.config.types.project || u.apply(this, arguments);
    };
  }
  function e(u, c) {
    var h = t.getTask(u), _ = r(h);
    _ !== !1 && t.getTaskType(h) !== _ && (c.$needsUpdate = !0, c[h.id] = { task: h, type: _ });
  }
  function i(u) {
    if (!t.getState().group_mode) {
      var c = function(h, _) {
        return e(h, _ = _ || {}), t.eachParent(function(f) {
          e(f.id, _);
        }, h), _;
      }(u);
      c.$needsUpdate && t.batchUpdate(function() {
        (function(h) {
          for (var _ in h) if (h[_] && h[_].task) {
            var f = h[_].task;
            f.type = h[_].type, t.updateTask(f.id);
          }
        })(c);
      });
    }
  }
  var a;
  function r(u) {
    var c = t.config.types, h = t.hasChild(u.id), _ = t.getTaskType(u.type);
    return h && _ === c.task ? c.project : !h && _ === c.project && c.task;
  }
  var s, o, l = !0;
  function d(u) {
    u != t.config.root_id && t.isTaskExists(u) && i(u);
  }
  t.attachEvent("onParse", n(function() {
    l = !1, t.getState().group_mode || (t.batchUpdate(function() {
      t.eachTask(function(u) {
        var c = r(u);
        c !== !1 && function(h, _) {
          t.getState().group_mode || (h.type = _, t.updateTask(h.id));
        }(u, c);
      });
    }), l = !0);
  })), t.attachEvent("onAfterTaskAdd", n(function(u) {
    l && i(u);
  })), t.attachEvent("onAfterTaskUpdate", n(function(u) {
    l && i(u);
  })), t.attachEvent("onBeforeTaskDelete", n(function(u, c) {
    return a = t.getParent(u), !0;
  })), t.attachEvent("onAfterTaskDelete", n(function(u, c) {
    d(a);
  })), t.attachEvent("onRowDragStart", n(function(u, c, h) {
    return s = t.getParent(u), !0;
  })), t.attachEvent("onRowDragEnd", n(function(u, c) {
    d(s), i(u);
  })), t.attachEvent("onBeforeTaskMove", n(function(u, c, h) {
    return o = t.getParent(u), !0;
  })), t.attachEvent("onAfterTaskMove", n(function(u, c, h) {
    document.querySelector(".gantt_drag_marker") || (d(o), i(u));
  }));
}
const oe = class oe {
  constructor(n = null) {
    this.canParse = (e) => {
      let i = "";
      const a = this._config.labels;
      for (const r in a) {
        const s = a[r];
        i += `${s.full}|${s.plural}|${s.short}|`;
      }
      return new RegExp(`^([+-]? *[0-9.]{1,}\\s*(${i})\\s*)*$`).test((e || "").trim());
    }, this.format = (e) => {
      const i = this._config.store, a = this._config.format, r = this._config.short;
      let s = this.transferUnits[i].toMinutes(e), o = a;
      if (o && o === "auto" && (o = this._selectFormatForValue(s)), o || (o = "day"), a === "auto" && !e) return "";
      o = Array.isArray(o) ? o : [o];
      let l = "";
      const d = o.length - 1;
      for (let u = 0; u < o.length; u++) {
        const c = o[u], h = this._getValueFromMinutes(s, c, u === d);
        s -= this._getValueInMinutes(h, c), l += `${this._getLabelForConvert(h, c, r)}${u === d ? "" : " "}`;
      }
      return l;
    }, this.parse = (e) => {
      if (this.canParse(e)) {
        let i = "", a = !1, r = !1, s = 0;
        const o = (e = (e || "").trim()).length - 1, l = /^[+\-0-9\. ]$/;
        for (let d = 0; d < e.length; d++) {
          const u = e[d];
          l.test(u) ? r = a : a = !0, (r || o === d) && (r || (i += u), s += this._getNumericValue(i), a = r = !1, i = ""), i += u;
        }
        if (s) {
          const d = this._config.store;
          return Math.round(this.transferUnits[d].fromMinutes(Math.ceil(s)));
        }
      }
      return null;
    }, this._getValueInMinutes = (e, i) => this.transferUnits[i] && this.transferUnits[i].toMinutes ? this.transferUnits[i].toMinutes(e) : 0, this._getLabelForConvert = (e, i, a) => {
      const r = this._config.labels[i];
      return a ? `${e}${r.short}` : `${e} ${e !== 1 && e !== -1 ? r.plural : r.full}`;
    }, this._getValueFromMinutes = (e, i, a) => {
      if (this.transferUnits[i] && this.transferUnits[i].fromMinutes) {
        const r = this.transferUnits[i].fromMinutes(e);
        return a ? parseFloat(r.toFixed(2)) : parseInt(r.toString(), 10);
      }
      return null;
    }, this._isUnitName = (e, i) => (i = i.toLowerCase(), e.full.toLowerCase() === i || e.plural.toLowerCase() === i || e.short.toLowerCase() === i), this._getUnitName = (e) => {
      const i = this._config.labels;
      let a, r = !1;
      for (a in i) if (this._isUnitName(i[a], e)) {
        r = !0;
        break;
      }
      return r ? a : this._config.enter;
    }, this._config = this._defaultSettings(n), this.transferUnits = { minute: { toMinutes: (e) => e, fromMinutes: (e) => e }, hour: { toMinutes: (e) => e * this._config.minutesPerHour, fromMinutes: (e) => e / this._config.minutesPerHour }, day: { toMinutes: (e) => e * this._config.minutesPerHour * this._config.hoursPerDay, fromMinutes: (e) => e / (this._config.minutesPerHour * this._config.hoursPerDay) }, week: { toMinutes: (e) => e * this._config.minutesPerHour * this._config.hoursPerWeek, fromMinutes: (e) => e / (this._config.minutesPerHour * this._config.hoursPerWeek) }, month: { toMinutes: (e) => e * this._config.minutesPerHour * this._config.hoursPerDay * this._config.daysPerMonth, fromMinutes: (e) => e / (this._config.minutesPerHour * this._config.hoursPerDay * this._config.daysPerMonth) }, year: { toMinutes: (e) => e * this._config.minutesPerHour * this._config.hoursPerDay * this._config.daysPerYear, fromMinutes: (e) => e / (this._config.minutesPerHour * this._config.hoursPerDay * this._config.daysPerYear) } };
  }
  _defaultSettings(n = null) {
    const e = { enter: "day", store: "hour", format: "auto", short: !1, minutesPerHour: 60, hoursPerDay: 8, hoursPerWeek: 40, daysPerMonth: 30, daysPerYear: 365, labels: { minute: { full: "minute", plural: "minutes", short: "min" }, hour: { full: "hour", plural: "hours", short: "h" }, day: { full: "day", plural: "days", short: "d" }, week: { full: "week", plural: "weeks", short: "wk" }, month: { full: "month", plural: "months", short: "mon" }, year: { full: "year", plural: "years", short: "y" } } };
    if (n) {
      for (const i in n) n[i] !== void 0 && i !== "labels" && (e[i] = n[i]);
      if (n.labels) for (const i in n.labels) e.labels[i] = n.labels[i];
    }
    return e;
  }
  _selectFormatForValue(n) {
    const e = ["year", "month", "day", "hour", "minute"], i = [];
    for (let a = 0; a < e.length; a++) i[a] = Math.abs(this.transferUnits[e[a]].fromMinutes(n));
    for (let a = 0; a < i.length; a++)
      if (!(i[a] < 1 && a < i.length - 1)) return e[a];
    return "day";
  }
  _getNumericValue(n) {
    const e = parseFloat(n.replace(/ /g, "")) || 0, i = n.match(new RegExp("\\p{L}", "gu")) ? n.match(new RegExp("\\p{L}", "gu")).join("") : "", a = this._getUnitName(i);
    return e && a ? this._getValueInMinutes(e, a) : 0;
  }
};
oe.create = (n = null) => new oe(n);
let Le = oe;
const le = class le {
  constructor(n) {
    this.format = (e) => this._getWBSCode(e.source), this.canParse = (e) => this._linkReg.test(e), this.parse = (e) => {
      if (!this.canParse(e)) return null;
      const i = this._linkReg.exec(e)[0].trim();
      return { id: void 0, source: this._findSource(i) || null, target: null, type: this._gantt.config.links.finish_to_start, lag: 0 };
    }, this._getWBSCode = (e) => {
      const i = this._gantt.getTask(e);
      return this._gantt.getWBSCode(i);
    }, this._findSource = (e) => {
      const i = new RegExp("^[0-9.]+", "i");
      if (i.exec(e)) {
        const a = i.exec(e)[0], r = this._gantt.getTaskByWBSCode(a);
        if (r) return r.id;
      }
      return null;
    }, this._linkReg = /^[0-9\.]+/, this._gantt = n;
  }
};
le.create = (n = null, e) => new le(e);
let Ne = le;
const de = class de extends Ne {
  constructor(n, e) {
    super(e), this.format = (i) => {
      const a = this._getFormattedLinkType(this._getLinkTypeName(i.type)), r = this._getWBSCode(i.source), s = this._getLagString(i.lag);
      return i.type !== this._gantt.config.links.finish_to_start || i.lag ? `${r}${a}${s}` : r;
    }, this.parse = (i) => {
      if (!this.canParse(i)) return null;
      const a = this._linkReg.exec(i)[0].trim(), r = i.replace(a, "").trim(), s = this._findTypeFormat(a), o = this._getLinkTypeNumber(s);
      return { id: void 0, source: this._findSource(a) || null, target: null, type: o, lag: this._parseLag(r) };
    }, this._getLinkTypeName = (i) => {
      let a = "";
      for (a in this._config.labels) if (String(this._gantt.config.links[a]).toLowerCase() === String(i).toLowerCase()) break;
      return a;
    }, this._getLinkTypeNumber = (i) => {
      let a = "";
      for (a in this._gantt.config.links) if (a.toLowerCase() === i.toLowerCase()) break;
      return this._gantt.config.links[a];
    }, this._getFormattedLinkType = (i) => this._config.labels[i] || "", this._getLagString = (i) => {
      if (!i) return "";
      const a = this._config.durationFormatter.format(i);
      return i < 0 ? a : `+${a}`;
    }, this._findTypeFormat = (i) => {
      const a = i.replace(/[^a-zA-Z]/gi, "");
      let r = "finish_to_start";
      for (const s in this._config.labels) this._config.labels[s].toLowerCase() === a.toLowerCase() && (r = s);
      return r;
    }, this._parseLag = (i) => i ? this._config.durationFormatter.parse(i) : 0, this._config = this._defaultSettings(n), this._linkReg = /^[0-9\.]+[a-zA-Z]*/;
  }
  _defaultSettings(n = null) {
    const e = { durationFormatter: this._gantt.ext.formatters.durationFormatter(), labels: { finish_to_finish: "FF", finish_to_start: "FS", start_to_start: "SS", start_to_finish: "SF" } };
    if (n && n.durationFormatter && (e.durationFormatter = n.durationFormatter), n && n.labels) for (const i in n.labels) e.labels[i] = n.labels[i];
    return e;
  }
};
de.create = (n = null, e) => new de(n, e);
let Pe = de;
function Yi(t) {
  t.ext.formatters = { durationFormatter: function(n) {
    return n || (n = {}), n.store || (n.store = t.config.duration_unit), n.enter || (n.enter = t.config.duration_unit), Le.create(n, t);
  }, linkFormatter: function(n) {
    return Pe.create(n, t);
  } };
}
function Ji(t) {
  t.ext = t.ext || {}, t.config.show_empty_state = !1, t.ext.emptyStateElement = t.ext.emptyStateElement || { isEnabled: () => t.config.show_empty_state === !0, isGanttEmpty: () => !t.getTaskByTime().length, renderContent(n) {
    const e = `<div class='gantt_empty_state'><div class='gantt_empty_state_image'></div>${`<div class='gantt_empty_state_text'>
    <div class='gantt_empty_state_text_link' data-empty-state-create-task>${t.locale.labels.empty_state_text_link}</div>
    <div class='gantt_empty_state_text_description'>${t.locale.labels.empty_state_text_description}</div>
    </div>`}</div>`;
    n.innerHTML = e;
  }, clickEvents: [], attachAddTaskEvent() {
    const n = t.attachEvent("onEmptyClick", function(e) {
      t.utils.dom.closest(e.target, "[data-empty-state-create-task]") && t.createTask({ id: t.uid(), text: "New Task" });
    });
    this.clickEvents.push(n);
  }, detachAddTaskEvents() {
    this.clickEvents.forEach(function(n) {
      t.detachEvent(n);
    }), this.clickEvents = [];
  }, getContainer() {
    if (t.$container) {
      const n = t.utils.dom;
      if (t.$container.contains(t.$grid_data)) return n.closest(t.$grid_data, ".gantt_layout_content");
      if (t.$container.contains(t.$task_data)) return n.closest(t.$task_data, ".gantt_layout_content");
    }
    return null;
  }, getNode() {
    const n = this.getContainer();
    return n ? n.querySelector(".gantt_empty_state_wrapper") : null;
  }, show() {
    const n = this.getContainer();
    if (!n && this.isGanttEmpty()) return null;
    const e = document.createElement("div");
    e.className = "gantt_empty_state_wrapper", e.style.marginTop = t.config.scale_height - n.offsetHeight + "px";
    const i = t.$container.querySelectorAll(".gantt_empty_state_wrapper");
    Array.prototype.forEach.call(i, function(a) {
      a.parentNode.removeChild(a);
    }), this.detachAddTaskEvents(), this.attachAddTaskEvent(), n.appendChild(e), this.renderContent(e);
  }, hide() {
    const n = this.getNode();
    if (!n) return !1;
    n.parentNode.removeChild(n);
  }, init() {
  } }, t.attachEvent("onDataRender", function() {
    const n = t.ext.emptyStateElement;
    n.isEnabled() && n.isGanttEmpty() ? n.show() : n.hide();
  });
}
const Ge = function(t, n) {
  const e = n.baselines && n.baselines.length, i = t.config.baselines.render_mode == "separateRow" || t.config.baselines.render_mode == "individualRow";
  if (e && i) return !0;
}, Tt = function(t, n) {
  let e = !1;
  return t.eachTask(function(i) {
    e || (e = Ge(t, i));
  }, n), e;
}, pt = function(t) {
  return t.render && t.render == "split" && !t.$open;
}, ne = function(t, n, e, i) {
  let a = i || n.$task_data.scrollHeight, r = !1, s = !1;
  return t.eachParent(function(o) {
    if (pt(o)) {
      s = !0;
      const l = n.getItemPosition(o).rowHeight;
      l < a && (a = l, r = !0);
    }
  }, e.id), { maxHeight: a, shrinkHeight: r, splitChild: s };
}, cn = function(t) {
  return Math.sqrt(2 * t * t);
}, un = function(t) {
  return Math.round(t / Math.sqrt(2));
}, Un = function(t, n, e, i, a, r) {
  const s = Ge(t, a), o = ne(t, n, a);
  let l = o.maxHeight, d = e.height, u = d > i, c = e.rowHeight >= i && !o.splitChild && !s;
  (u || c) && (d = i), l < d && (d = l);
  let h = Math.floor((e.rowHeight - d) / 2);
  if (o.splitChild && (h = Math.floor((l - d) / 2)), r || s) {
    let _ = Math.min(e.height, l) - d, f = 2, v = s && a.bar_height >= a.row_height, k = o.splitChild && e.height >= l;
    (v || k) && (f = 0), h = Math.floor(_ / 2) + f, e.rowHeight;
  }
  return { height: d, marginTop: h };
};
function Ki(t) {
  t.config.baselines = { datastore: "baselines", render_mode: !1, dataprocessor_baselines: !1, row_height: 16, bar_height: 8 };
  const n = t.createDatastore({ name: t.config.baselines.datastore, initItem: function(r) {
    return r.id || (r.id = t.uid()), function(s) {
      if (!s.task_id || !s.start_date && !s.end_date) return !1;
      s.start_date ? s.start_date = t.date.parseDate(s.start_date, "parse_date") : s.start_date = null, s.end_date ? s.end_date = t.date.parseDate(s.end_date, "parse_date") : s.end_date = null, s.duration = s.duration || 1, s.start_date && !s.end_date ? s.end_date = t.calculateEndDate(s.start_date, s.duration) : s.end_date && !s.start_date && (s.start_date = t.calculateEndDate(s.end_date, -s.duration));
    }(r), r;
  } });
  function e(r) {
    let s = 0;
    t.adjustTaskHeightForBaselines(r), t.eachTask(function(o) {
      let l = o.row_height || t.config.row_height;
      s = s || l, l > s && (s = l);
    }, r.id), r.row_height < s && (r.row_height = s);
  }
  function i(r) {
    t.eachParent(function(s) {
      if (pt(s)) {
        const o = s.row_height || t.getLayoutView("timeline").getBarHeight(s.id);
        let l = r.row_height;
        t.getChildren(s.id).forEach(function(d) {
          const u = t.getTask(d);
          if (u.id == r.id) return;
          const c = u.row_height || t.getLayoutView("timeline").getBarHeight(u.id);
          l = l || c, c > l && (l = c);
        }), s.row_height = l, s.bar_height = s.bar_height || o;
      }
    }, r.id);
  }
  function a(r) {
    const s = r.task_id;
    if (t.isTaskExists(s)) {
      const o = t.getTask(s);
      o.baselines = o.baselines || [];
      let l = !0;
      for (let d = 0; d < o.baselines.length; d++) {
        let u = o.baselines[d];
        if (u.id == r.id) {
          l = !1, t.mixin(u, r, !0);
          break;
        }
      }
      l && o.baselines.push(r), q(t) || (pt(o) ? e(o) : t.adjustTaskHeightForBaselines(o));
    }
  }
  t.$data.baselineStore = n, t.adjustTaskHeightForBaselines = function(r) {
    let s, o, l = r.baselines && r.baselines.length || 0;
    const d = t.config.baselines.row_height, u = t.getLayoutView("timeline");
    if (u && t.config.show_chart) switch (t.config.baselines.render_mode) {
      case "taskRow":
      default:
        r.row_height = r.bar_height + 8;
        break;
      case "separateRow":
        s = u.getBarHeight(r.id), l ? (r.bar_height = r.bar_height || s, r.bar_height > s && (s = r.bar_height), r.row_height = s + d) : r.bar_height && (r.row_height = r.bar_height + 4), i(r);
        break;
      case "individualRow":
        s = u.getBarHeight(r.id), l ? (r.bar_height = r.bar_height || s, r.bar_height > s && (s = r.bar_height), o = d * l, r.row_height = s + o + 2) : r.bar_height && (r.row_height = r.bar_height + 4), i(r);
    }
  }, t.attachEvent("onGanttReady", function() {
    t.config.baselines && (t.attachEvent("onParse", function() {
      n.eachItem(function(r) {
        a(r);
      });
    }), t.attachEvent("onBeforeTaskUpdate", function(r, s) {
      return function(o) {
        let l = !1;
        const d = {}, u = o.baselines || [], c = t.getTaskBaselines(o.id);
        u.length != c.length && (l = !0), u.forEach(function(h) {
          d[h.id] = !0;
          const _ = n.getItem(h.id);
          if (_) {
            const f = +_.start_date != +h.start_date, v = +_.end_date != +h.end_date;
            (f || v) && n.updateItem(h.id, h);
          } else n.addItem(h);
        }), c.forEach(function(h) {
          d[h.id] || n.removeItem(h.id);
        }), l && (pt(o) ? e(o) : t.adjustTaskHeightForBaselines(o), t.render());
      }(s), !0;
    }), t.attachEvent("onAfterUndo", function(r) {
      if ((t.config.baselines.render_mode == "separateRow" || t.config.baselines.render_mode == "individualRow") && r) {
        let s = !1;
        r.commands.forEach(function(o) {
          if (o.entity == "task") {
            const l = o.value.id;
            if (t.isTaskExists(l)) {
              const d = t.getTask(l);
              if (d.parent && t.isTaskExists(d.parent)) {
                const u = t.getTask(d.parent);
                pt(u) && (e(u), s = !0);
              }
            }
          }
        }), s && t.render();
      }
    }), t.attachEvent("onAfterTaskDelete", function(r, s) {
      if (Ge && s.parent && t.isTaskExists(s.parent)) {
        const o = t.getTask(s.parent);
        pt(o) && e(o);
      }
      n.eachItem(function(o) {
        t.isTaskExists(o.task_id) || n.removeItem(o.id);
      });
    }), t.getTaskBaselines = function(r) {
      const s = [];
      return n.eachItem(function(o) {
        o.task_id == r && s.push(o);
      }), s;
    }, t.$data.baselineStore.attachEvent("onClearAll", function() {
      return t.eachTask(function(r) {
        r.baselines && delete r.baselines;
      }), !0;
    }), t.$data.baselineStore.attachEvent("onBeforeAdd", function(r, s) {
      a(s);
    }), t.$data.tasksStore.attachEvent("onClearAll", function() {
      return n.clearAll(), !0;
    }), t.attachEvent("onTaskIdChange", function(r, s) {
      n.find(function(o) {
        return o.task_id == r;
      }).forEach(function(o) {
        o.task_id = s, n.updateItem(o.id);
      });
    }));
  }, { once: !0 });
}
class Xi {
  constructor(n, e) {
    const i = new jn({ url: n, token: e });
    i.fetch = function(a, r) {
      const s = { headers: this.headers() };
      return r && (s.method = "POST", s.body = r), fetch(a, s).then((o) => o.json());
    }, this._ready = i.load().then((a) => this._remote = a);
  }
  ready() {
    return this._ready;
  }
  on(n, e) {
    this.ready().then((i) => {
      if (typeof n == "string") i.on(n, e);
      else for (const a in n) i.on(a, n[a]);
    });
  }
}
function Zi(t) {
  let n = [], e = null;
  function i(o) {
    var c, h;
    if (!o || !o.type || !((c = o.task) != null && c.id) && !((h = o.link) != null && h.id)) return void console.error("Invalid message format:", o);
    const { type: l, task: d, link: u } = o;
    if (!(d && t._dp._in_progress[d.id] || u && t._dp._in_progress[u.id])) {
      if (l === "add-task") {
        for (const _ in t._dp._in_progress) if (t._dp.getState(_) === "inserted") return void t._dp.attachEvent("onFullSync", function() {
          t.isTaskExists(d.id) || r(o);
        }, { once: !0 });
      }
      n.push(o), e && clearTimeout(e), e = setTimeout(a, 50);
    }
  }
  function a() {
    n.length !== 0 && (n.length === 1 ? r(n[0]) : t.batchUpdate(function() {
      n.forEach((o) => {
        r(o);
      });
    }), n = []);
  }
  function r(o) {
    const { type: l, task: d, link: u } = o;
    switch (l) {
      case "add-task":
        (function(c) {
          if (t.isTaskExists(c.id)) return void console.warn(`Task with ID ${c.id} already exists. Skipping add.`);
          c.start_date = t.templates.parse_date(c.start_date), c.end_date && (c.end_date = t.templates.parse_date(c.end_date)), s(() => {
            t.addTask(c);
          });
        })(d);
        break;
      case "update-task":
        (function(c) {
          const h = c.id;
          if (!t.getTask(h)) return void console.warn(`Task with ID ${h} does not exist. Skipping update.`);
          const _ = t.getDatastore("task").$initItem.bind(t.getDatastore("task")), f = t.getTask(h);
          s(() => {
            const v = _(c);
            for (let k in v) f[k] = v[k];
            v.end_date || (f.end_date = t.calculateEndDate(f)), t.updateTask(h), h !== c.id && t.changeTaskId(h, c.id);
          });
        })(d);
        break;
      case "delete-task":
        (function(c) {
          const h = c.id;
          t.isTaskExists(h) && s(() => {
            t.getTask(h) && (t.getState().lightbox_id == h && (c.id = this._lightbox_id, t.getTask(this._lightbox_id)), t.deleteTask(h, !0));
          });
        })(d);
        break;
      case "add-link":
        (function(c) {
          if (t.isLinkExists(c.id)) return void console.warn(`Link with ID ${c.id} already exists. Skipping add.`);
          s(() => {
            t.addLink(c);
          });
        })(u);
        break;
      case "update-link":
        (function(c) {
          const h = c.id;
          if (!t.isLinkExists(h)) return void console.warn(`Link with ID ${h} does not exist. Skipping update.`);
          const _ = t.getLink(h);
          s(() => {
            Object.assign(_, c), t.updateLink(h), h !== c.id && t.changeLinkId(h, c.id);
          });
        })(u);
        break;
      case "delete-link":
        (function(c) {
          const h = c.id;
          t.getLink(h) && s(() => {
            t.getLink(h) && (t.getState().lightbox_id == h && (c.id = this._lightbox_id, t.getLink(this._lightbox_id)), t.deleteLink(h, !0));
          });
        })(u);
    }
  }
  function s(o) {
    t._dp ? t._dp.ignore(o) : o();
  }
  return { tasks: i, links: i };
}
function Qi(t) {
  t.ext || (t.ext = {}), t.ext.liveUpdates = { RemoteEvents: Xi, remoteUpdates: Zi(t) };
}
function Gn(t) {
  var n = {}, e = {}, i = null, a = -1, r = null, s = /* @__PURE__ */ function(o) {
    var l = -1, d = -1;
    return { resetCache: function() {
      l = -1, d = -1;
    }, _getRowHeight: function() {
      return l === -1 && (l = o.$getConfig().row_height), l;
    }, _refreshState: function() {
      this.resetCache(), d = !0;
      var u = o.$config.rowStore;
      if (u) for (var c = this._getRowHeight(), h = 0; h < u.fullOrder.length; h++) {
        var _ = u.getItem(u.fullOrder[h]);
        if (_ && _.row_height && _.row_height !== c) {
          d = !1;
          break;
        }
      }
    }, canUseSimpleCalculation: function() {
      return d === -1 && this._refreshState(), d;
    }, getRowTop: function(u) {
      return o.$config.rowStore ? u * this._getRowHeight() : 0;
    }, getItemHeight: function(u) {
      return this._getRowHeight();
    }, getTotalHeight: function() {
      return o.$config.rowStore ? o.$config.rowStore.countVisible() * this._getRowHeight() : 0;
    }, getItemIndexByTopPosition: function(u) {
      return o.$config.rowStore ? Math.floor(u / this._getRowHeight()) : 0;
    } };
  }(t);
  return { _resetTopPositionHeight: function() {
    n = {}, e = {}, s.resetCache();
  }, _resetHeight: function() {
    var o = this.$config.rowStore, l = this.getCacheStateTotalHeight(o);
    r ? this.shouldClearHeightCache(r, l) && (r = l, i = null) : r = l, a = -1, s.resetCache();
  }, getRowTop: function(o) {
    if (s.canUseSimpleCalculation()) return s.getRowTop(o);
    var l = this.$config.rowStore;
    if (!l) return 0;
    if (e[o] !== void 0) return e[o];
    for (var d = l.getIndexRange(), u = 0, c = 0, h = 0; h < d.length; h++) e[h] = u, u += this.getItemHeight(d[h].id), h < o && (c = u);
    return c;
  }, getItemTop: function(o) {
    if (this.$config.rowStore) {
      if (n[o] !== void 0) return n[o];
      var l = this.$config.rowStore;
      if (!l) return 0;
      var d = l.getIndexById(o);
      if (d === -1 && l.getParent && l.exists(o)) {
        var u = l.getParent(o);
        if (l.exists(u)) {
          var c = l.getItem(u);
          if (this.$gantt.isSplitTask(c)) return this.getItemTop(u);
        }
      }
      return n[o] = this.getRowTop(d), n[o];
    }
    return 0;
  }, getItemHeight: function(o) {
    if (s.canUseSimpleCalculation()) return s.getItemHeight(o);
    if (!i && this.$config.rowStore && this._fillHeightCache(this.$config.rowStore), i[o] !== void 0) return i[o];
    var l = this.$getConfig().row_height;
    if (this.$config.rowStore) {
      var d = this.$config.rowStore;
      if (!d) return l;
      var u = d.getItem(o);
      return i[o] = u && u.row_height || l;
    }
    return l;
  }, _fillHeightCache: function(o) {
    if (o) {
      i = {};
      var l = this.$getConfig().row_height;
      o.eachItem(function(d) {
        return i[d.id] = d && d.row_height || l;
      });
    }
  }, getCacheStateTotalHeight: function(o) {
    var l = this.$getConfig().row_height, d = {}, u = [], c = 0;
    return o && o.eachItem(function(h) {
      u.push(h), d[h.id] = h.row_height, c += h.row_height || l;
    }), { globalHeight: l, items: u, count: u.length, sumHeight: c };
  }, shouldClearHeightCache: function(o, l) {
    if (o.count != l.count || o.globalHeight != l.globalHeight || o.sumHeight != l.sumHeight) return !0;
    for (var d in o.items) {
      var u = l.items[d];
      if (u !== void 0 && u != o.items[d]) return !0;
    }
    return !1;
  }, getTotalHeight: function() {
    if (s.canUseSimpleCalculation()) return s.getTotalHeight();
    if (a != -1) return a;
    if (this.$config.rowStore) {
      var o = this.$config.rowStore;
      this._fillHeightCache(o);
      var l = this.getItemHeight.bind(this), d = o.getVisibleItems(), u = 0;
      return d.forEach(function(c) {
        u += l(c.id);
      }), a = u, u;
    }
    return 0;
  }, getItemIndexByTopPosition: function(o) {
    if (this.$config.rowStore) {
      if (s.canUseSimpleCalculation()) return s.getItemIndexByTopPosition(o);
      for (var l = this.$config.rowStore, d = 0; d < l.countVisible(); d++) {
        var u = this.getRowTop(d), c = this.getRowTop(d + 1);
        if (!c) {
          var h = l.getIdByIndex(d);
          c = u + this.getItemHeight(h);
        }
        if (o >= u && o < c) return d;
      }
      return l.countVisible() + 2;
    }
    return 0;
  } };
}
class ta {
  constructor(n) {
    this._scrollOrder = 0;
    const { gantt: e, grid: i, dnd: a, getCurrentX: r } = n;
    this.$gantt = e, this.$grid = i, this._dnd = a, this.getCurrentX = r, this._scrollView = this.$gantt.$ui.getView(this.$grid.$config.scrollX), this.attachEvents();
  }
  attachEvents() {
    this.isScrollable() && (this._dnd.attachEvent("onDragMove", (n, e) => {
      const i = this.$grid.$grid.getBoundingClientRect(), a = i.right, r = i.left, s = this.getCurrentX(e.clientX);
      return s >= a - 20 && (this.autoscrollRight(), this.autoscrollStart()), s <= r + 20 && (this.autoscrollLeft(), this.autoscrollStart()), s < a - 20 && s > r + 20 && this.autoscrollStop(), !0;
    }), this._dnd.attachEvent("onDragEnd", () => {
      this.autoscrollStop();
    }));
  }
  autoscrollStart() {
    if (this._scrollOrder === 0) return;
    const n = 10 * this._scrollOrder, e = this._scrollView.getScrollState();
    this._scrollView.scrollTo(e.position + n), setTimeout(() => {
      this.autoscrollStart();
    }, 50);
  }
  autoscrollRight() {
    this._scrollOrder = 1;
  }
  autoscrollLeft() {
    this._scrollOrder = -1;
  }
  autoscrollStop() {
    this._scrollOrder = 0;
  }
  getCorrection() {
    return this.isScrollable() ? this._scrollView.getScrollState().position : 0;
  }
  isScrollable() {
    return !!this.$grid.$config.scrollable;
  }
}
const hn = "data-column-id";
class ea {
  constructor(n, e) {
    this._targetMarker = null, this.calculateCurrentPosition = (i) => {
      const a = this.$grid.$grid.getBoundingClientRect(), r = a.right, s = a.left;
      let o = i;
      return o > r && (o = r), o < s && (o = s), o;
    }, this.$gantt = n, this.$grid = e;
  }
  init() {
    const n = this.$gantt.$services.getService("dnd");
    this._dnd = new n(this.$grid.$grid_scale, { updates_per_second: 60 }), this._scrollableGrid = new ta({ gantt: this.$gantt, grid: this.$grid, dnd: this._dnd, getCurrentX: this.calculateCurrentPosition }), this.attachEvents();
  }
  attachEvents() {
    this._dnd.attachEvent("onBeforeDragStart", (n, e) => {
      if (this._draggedCell = this.$gantt.utils.dom.closest(e.target, ".gantt_grid_head_cell"), !this._draggedCell) return;
      const i = this.$grid.$getConfig().columns, a = this._draggedCell.getAttribute(hn);
      let r, s;
      return i.map(function(o, l) {
        o.name === a && (r = o, s = l);
      }), this.$grid.callEvent("onBeforeColumnDragStart", [{ draggedColumn: r, draggedIndex: s }]) !== !1 && !(!this._draggedCell || !r) && (this._gridConfig = this.$grid.$getConfig(), this._originAutoscroll = this.$gantt.config.autoscroll, this.$gantt.config.autoscroll = !1, !0);
    }), this._dnd.attachEvent("onAfterDragStart", (n, e) => {
      this._draggedCell && (this._dnd.config.column = this._draggedCell.getAttribute(hn), this._dnd.config.marker.innerHTML = this._draggedCell.outerHTML, this._dnd.config.marker.classList.add("gantt_column_drag_marker"), this._dnd.config.marker.style.height = this._gridConfig.scale_height + "px", this._dnd.config.marker.style.lineHeight = this._gridConfig.scale_height + "px", this._draggedCell.classList.add("gantt_grid_head_cell_dragged"));
    }), this._dnd.attachEvent("onDragMove", (n, e) => {
      if (!this._draggedCell) return;
      this._dragX = e.clientX;
      const i = this.calculateCurrentPosition(e.clientX), a = this.findColumnsIndexes();
      return this.setMarkerPosition(i), this.drawTargetMarker(a), !0;
    }), this._dnd.attachEvent("onDragEnd", () => {
      if (!this._draggedCell) return;
      const n = this.findColumnsIndexes(), e = n.targetIndex, i = n.draggedIndex, a = this.$grid.$getConfig().columns, r = a[i], s = a[e];
      if (this.$grid.callEvent("onColumnDragMove", [{ draggedColumn: r, targetColumn: s, draggedIndex: i, targetIndex: e }]) === !1) return this.cleanTargetMarker(), void this.$gantt.render();
      this.$gantt.config.autoscroll = this._originAutoscroll, this._draggedCell.classList.remove("gantt_grid_head_cell_dragged"), this.cleanTargetMarker(), this.reorderColumns();
    });
  }
  reorderColumns() {
    const { targetIndex: n, draggedIndex: e } = this.findColumnsIndexes(), i = this.$grid.$getConfig().columns, a = i[e], r = i[n];
    this.$grid.callEvent("onBeforeColumnReorder", [{ draggedColumn: a, targetColumn: r, draggedIndex: e, targetIndex: n }]) !== !1 && n !== e && (i.splice(e, 1), i.splice(n, 0, a), this.$gantt.render(), this.$grid.callEvent("onAfterColumnReorder", [{ draggedColumn: a, targetColumn: r, draggedIndex: e, targetIndex: n }]));
  }
  findColumnsIndexes() {
    const n = this._dnd.config.column, e = this.$grid.$getConfig().columns;
    let i, a, r, s;
    const o = { startX: 0, endX: 0 };
    let l, d = 0, u = e.length - 1, c = (f, v) => f <= v, h = (f) => ++f;
    this.$gantt.config.rtl && (d = e.length - 1, u = 0, c = (f, v) => f >= v, h = (f) => --f);
    const _ = this._dragX - this.$grid.$grid.getBoundingClientRect().left + this._scrollableGrid.getCorrection();
    for (let f = d; c(f, u) && (i === void 0 || a === void 0); f = h(f)) e[f].hide || (o.startX = o.endX, o.endX += e[f].width, _ >= o.startX && (_ <= o.endX || !c(h(f), u)) && (i = f, r = o.startX, s = o.endX, l = (_ - o.startX) / (o.endX - o.startX)), n === e[f].name && (a = f));
    return { targetIndex: i, draggedIndex: a, xBefore: r, xAfter: s, columnRelativePos: l };
  }
  setMarkerPosition(n, e = 10) {
    const { marker: i } = this._dnd.config, a = this._dnd._obj.getBoundingClientRect();
    i.style.top = `${a.y + e}px`, i.style.left = `${n}px`;
  }
  drawTargetMarker({ targetIndex: n, draggedIndex: e, xBefore: i, xAfter: a, columnRelativePos: r }) {
    let s;
    this._targetMarker || (this._targetMarker = document.createElement("div"), xt(this._targetMarker, "gantt_grid_target_marker"), this._targetMarker.style.display = "none", this._targetMarker.style.height = `${this._gridConfig.scale_height}px`), this._targetMarker.parentNode || this.$grid.$grid_scale.appendChild(this._targetMarker), s = n > e ? a : n < e ? i : r > 0.5 ? a : i, this._targetMarker.style.left = `${s}px`, this._targetMarker.style.display = "block";
  }
  cleanTargetMarker() {
    this._targetMarker && this._targetMarker.parentNode && this.$grid.$grid_scale.removeChild(this._targetMarker), this._targetMarker = null;
  }
}
function qe(t) {
  var n = [];
  return { delegate: function(e, i, a, r) {
    n.push([e, i, a, r]), t.$services.getService("mouseEvents").delegate(e, i, a, r);
  }, destructor: function() {
    for (var e = t.$services.getService("mouseEvents"), i = 0; i < n.length; i++) {
      var a = n[i];
      e.detach(a[0], a[1], a[2], a[3]);
    }
    n = [];
  } };
}
var Gt = function(t, n, e, i) {
  this.$config = H({}, n || {}), this.$gantt = i, this.$parent = t, _t(this), this.$state = {}, H(this, Gn(this));
};
function na(t) {
  function n(e) {
    throw t.assert(!1, "Can't parse data: incorrect value of gantt.parse or gantt.load method. Actual argument value: " + JSON.stringify(e)), new Error("Invalid argument for gantt.parse or gantt.load. An object or a JSON string of format https://docs.dhtmlx.com/gantt/desktop__supported_data_formats.html#json is expected. Actual argument value: " + JSON.stringify(e));
  }
  t.load = function() {
    throw new Error("gantt.load() method is not available in the node.js, use gantt.parse() instead");
  }, t.parse = function(e, i) {
    this.on_load({ xmlDoc: { responseText: e } }, i);
  }, t.serialize = function(e) {
    return this[e = e || "json"].serialize();
  }, t.on_load = function(e, i) {
    if (e.xmlDoc && e.xmlDoc.status === 404) this.assert(!1, "Failed to load the data from <a href='" + e.xmlDoc.responseURL + "' target='_blank'>" + e.xmlDoc.responseURL + "</a>, server returns 404");
    else if (!t.$destroyed) {
      this.callEvent("onBeforeParse", []), i || (i = "json"), this.assert(this[i], "Invalid data type:'" + i + "'");
      var a = e.xmlDoc.responseText, r = this[i].parse(a, e);
      this._process_loading(r);
    }
  }, t._process_loading = function(e) {
    e.collections && this._load_collections(e.collections), e.resources && this.$data.resourcesStore && this.$data.resourcesStore.parse(e.resources), t.config.baselines && e.baselines && this.$data.baselineStore && this.$data.baselineStore.parse(e.baselines);
    const i = e.data || e.tasks;
    e.assignments && function(r, s) {
      const o = {};
      s.forEach((l) => {
        o[l.task_id] || (o[l.task_id] = []), o[l.task_id].push(l);
      }), r.forEach((l) => {
        l[t.config.resource_property] = o[l.id] || [];
      });
    }(i && i.length ? i : t.getTasksByTime(), e.assignments), i && this.$data.tasksStore.parse(i);
    var a = e.links || (e.collections && e.collections.links ? e.collections.links : []);
    this.$data.linksStore.parse(a), this.callEvent("onParse", []), this.render();
  }, t._load_collections = function(e) {
    var i = !1;
    for (var a in e) if (e.hasOwnProperty(a)) {
      i = !0;
      var r = e[a];
      this.serverList[a] = this.serverList[a] || [];
      var s = this.serverList[a];
      if (!s) continue;
      s.splice(0, s.length);
      for (var o = 0; o < r.length; o++) {
        var l = r[o], d = this.copy(l);
        for (var u in d.key = d.value, l) if (l.hasOwnProperty(u)) {
          if (u == "value" || u == "label") continue;
          d[u] = l[u];
        }
        s.push(d);
      }
    }
    i && this.callEvent("onOptionsLoad", []);
  }, t.attachEvent("onBeforeTaskDisplay", function(e, i) {
    return !i.$ignore;
  }), t.json = { parse: function(e) {
    if (e || n(e), typeof e == "string") if (typeof JSON != null) try {
      e = JSON.parse(e);
    } catch {
      n(e);
    }
    else t.assert(!1, "JSON is not supported");
    return e.dhx_security && (t.security_key = e.dhx_security), e;
  }, serializeTask: function(e) {
    return this._copyObject(e);
  }, serializeLink: function(e) {
    return this._copyLink(e);
  }, _copyLink: function(e) {
    var i = {};
    for (var a in e) i[a] = e[a];
    return i;
  }, _copyObject: function(e) {
    var i = {};
    for (var a in e) a.charAt(0) != "$" && (i[a] = e[a], at(i[a]) && (t.defined(t.templates.xml_format) ? i[a] = t.templates.xml_format(i[a]) : (t.date._isoDateDetected || t.config.date_format === "iso") && t.templates.format_date._ganttAuto ? i[a] = t.date._isoDateOnly ? t.date.formatISODateOnly(i[a]) : t.date.formatISODate(i[a]) : i[a] = t.templates.format_date(i[a])));
    return i;
  }, serialize: function() {
    var e = [], i = [];
    let a = [];
    t.eachTask(function(o) {
      t.resetProjectDates(o), e.push(this.serializeTask(o));
    }, t.config.root_id, this);
    for (var r = t.getLinks(), s = 0; s < r.length; s++) i.push(this.serializeLink(r[s]));
    return t.getDatastore("baselines").eachItem(function(o) {
      const l = t.json.serializeTask(o);
      a.push(l);
    }), { data: e, links: i, baselines: a };
  } }, t.xml = { _xmlNodeToJSON: function(e, i) {
    for (var a = {}, r = 0; r < e.attributes.length; r++) a[e.attributes[r].name] = e.attributes[r].value;
    if (!i) {
      for (r = 0; r < e.childNodes.length; r++) {
        var s = e.childNodes[r];
        s.nodeType == 1 && (a[s.tagName] = s.firstChild ? s.firstChild.nodeValue : "");
      }
      a.text || (a.text = e.firstChild ? e.firstChild.nodeValue : "");
    }
    return a;
  }, _getCollections: function(e) {
    for (var i = {}, a = t.ajax.xpath("//coll_options", e), r = 0; r < a.length; r++) for (var s = i[a[r].getAttribute("for")] = [], o = t.ajax.xpath(".//item", a[r]), l = 0; l < o.length; l++) {
      for (var d = o[l].attributes, u = { key: o[l].getAttribute("value"), label: o[l].getAttribute("label") }, c = 0; c < d.length; c++) {
        var h = d[c];
        h.nodeName != "value" && h.nodeName != "label" && (u[h.nodeName] = h.nodeValue);
      }
      s.push(u);
    }
    return i;
  }, _getXML: function(e, i, a) {
    a = a || "data", i.getXMLTopNode || (i = t.ajax.parse(i));
    var r = t.ajax.xmltop(a, i.xmlDoc);
    r && r.tagName == a || function(o) {
      throw t.assert(!1, "Can't parse data: incorrect value of gantt.parse or gantt.load method. Actual argument value: " + JSON.stringify(o)), new Error("Invalid argument for gantt.parse or gantt.load. An XML of format https://docs.dhtmlx.com/gantt/desktop__supported_data_formats.html#xmldhtmlxgantt20 is expected. Actual argument value: " + JSON.stringify(o));
    }(e);
    var s = r.getAttribute("dhx_security");
    return s && (t.security_key = s), r;
  }, parse: function(e, i) {
    i = this._getXML(e, i);
    for (var a = {}, r = a.data = [], s = t.ajax.xpath("//task", i), o = 0; o < s.length; o++) r[o] = this._xmlNodeToJSON(s[o]);
    return a.collections = this._getCollections(i), a;
  }, _copyLink: function(e) {
    return "<item id='" + e.id + "' source='" + e.source + "' target='" + e.target + "' type='" + e.type + "' />";
  }, _copyObject: function(e) {
    return "<task id='" + e.id + "' parent='" + (e.parent || "") + "' start_date='" + e.start_date + "' duration='" + e.duration + "' open='" + !!e.open + "' progress='" + e.progress + "' end_date='" + e.end_date + "'><![CDATA[" + e.text + "]]></task>";
  }, serialize: function() {
    for (var e = [], i = [], a = t.json.serialize(), r = 0, s = a.data.length; r < s; r++) e.push(this._copyObject(a.data[r]));
    for (r = 0, s = a.links.length; r < s; r++) i.push(this._copyLink(a.links[r]));
    return "<data>" + e.join("") + "<coll_options for='links'>" + i.join("") + "</coll_options></data>";
  } }, t.oldxml = { parse: function(e, i) {
    i = t.xml._getXML(e, i, "projects");
    for (var a = { collections: { links: [] } }, r = a.data = [], s = t.ajax.xpath("//task", i), o = 0; o < s.length; o++) {
      r[o] = t.xml._xmlNodeToJSON(s[o]);
      var l = s[o].parentNode;
      l.tagName == "project" ? r[o].parent = "project-" + l.getAttribute("id") : r[o].parent = l.parentNode.getAttribute("id");
    }
    for (s = t.ajax.xpath("//project", i), o = 0; o < s.length; o++)
      (d = t.xml._xmlNodeToJSON(s[o], !0)).id = "project-" + d.id, r.push(d);
    for (o = 0; o < r.length; o++) {
      var d;
      (d = r[o]).start_date = d.startdate || d.est, d.end_date = d.enddate, d.text = d.name, d.duration = d.duration / 8, d.open = 1, d.duration || d.end_date || (d.duration = 1), d.predecessortasks && a.collections.links.push({ target: d.id, source: d.predecessortasks, type: t.config.links.finish_to_start });
    }
    return a;
  }, serialize: function() {
    t.message("Serialization to 'old XML' is not implemented");
  } }, t.serverList = function(e, i) {
    return i ? this.serverList[e] = i.slice(0) : this.serverList[e] || (this.serverList[e] = []), this.serverList[e];
  };
}
function ve(t, n, e, i, a) {
  return this.date = t, this.unit = n, this.task = e, this.id = i, this.calendar = a, this;
}
function ke(t, n, e, i, a, r) {
  return this.date = t, this.dir = n, this.unit = e, this.task = i, this.id = a, this.calendar = r, this;
}
function ye(t, n, e, i, a, r, s) {
  return this.start_date = t, this.duration = n, this.unit = e, this.step = i, this.task = a, this.id = r, this.calendar = s, this;
}
function ia(t, n, e, i) {
  return this.start_date = t, this.end_date = n, this.task = e, this.calendar = i, this.unit = null, this.step = null, this;
}
Gt.prototype = { init: function(t) {
  var n = this.$gantt, e = n._waiAria.gridAttrString(), i = n._waiAria.gridDataAttrString(), a = this.$getConfig(), r = a.reorder_grid_columns || !1;
  this.$config.reorder_grid_columns !== void 0 && (r = this.$config.reorder_grid_columns), t.innerHTML = "<div class='gantt_grid' style='height:inherit;width:inherit;' " + e + "></div>", this.$grid = t.childNodes[0], this.$grid.innerHTML = "<div class='gantt_grid_scale' " + n._waiAria.gridScaleRowAttrString() + "></div><div class='gantt_grid_data' " + i + "></div>", this.$grid_scale = this.$grid.childNodes[0], this.$grid_data = this.$grid.childNodes[1];
  var s = a[this.$config.bind + "_attribute"];
  if (!s && this.$config.bind && (s = "data-" + this.$config.bind + "-id"), this.$config.item_attribute = s || null, !this.$config.layers) {
    var o = this._createLayerConfig();
    this.$config.layers = o;
  }
  var l = function(u, c) {
    var h = { column_before_start: u.bind(function(_, f, v) {
      var k = c.$getConfig(), b = et(v, k.grid_resizer_column_attribute);
      if (!b || !ct(b, ".gantt_grid_column_resize_wrap")) return !1;
      var m = this.locate(v, k.grid_resizer_column_attribute), g = c.getGridColumns()[m];
      return c.callEvent("onColumnResizeStart", [m, g]) !== !1 && void 0;
    }, u), column_after_start: u.bind(function(_, f, v) {
      var k = c.$getConfig(), b = this.locate(v, k.grid_resizer_column_attribute);
      _.config.marker.innerHTML = "", _.config.marker.className += " gantt_grid_resize_area", _.config.marker.style.height = c.$grid.offsetHeight + "px", _.config.marker.style.top = "0px", _.config.drag_index = b;
    }, u), column_drag_move: u.bind(function(_, f, v) {
      var k = c.$getConfig(), b = _.config, m = c.getGridColumns(), g = parseInt(b.drag_index, 10), p = m[g], y = Y(c.$grid_scale), $ = parseInt(b.marker.style.left, 10), x = p.min_width ? p.min_width : k.min_grid_column_width, w = c.$grid_data.offsetWidth, T = 0, S = 0;
      k.rtl ? $ = y.x + y.width - 1 - $ : $ -= y.x - 1;
      for (var C = 0; C < g; C++) x += m[C].width, T += m[C].width;
      if ($ < x && ($ = x), k.keep_grid_width) {
        var E = 0;
        for (C = g + 1; C < m.length; C++) m[C].min_width ? w -= m[C].min_width : k.min_grid_column_width && (w -= k.min_grid_column_width), m[C].max_width && E !== !1 ? E += m[C].max_width : E = !1;
        E && (x = c.$grid_data.offsetWidth - E), $ < x && ($ = x), $ > w && ($ = w);
      } else if (!c.$config.scrollable) {
        var D = $, I = u.$container.offsetWidth, M = 0;
        if (c.$grid_data.offsetWidth <= I - 25) for (C = g + 1; C < m.length; C++) M += m[C].width;
        else {
          for (C = g + 1; C >= 0; C--) M += m[C].width;
          M = I - M;
        }
        M > I && (M -= I);
        var A = c.$parent.$parent;
        if (A && A.$config.mode == "y") {
          var L = A.$lastSize.x;
          I = Math.min(I, L - (A.$cells.length - 1));
        }
        D + M > I && ($ = I - M);
      }
      return b.left = $ - 1, S = Math.abs($ - T), p.max_width && S > p.max_width && (S = p.max_width), k.rtl && (T = y.width - T + 2 - S), b.marker.style.top = y.y + "px", b.marker.style.left = y.x - 1 + T + "px", b.marker.style.width = S + "px", c.callEvent("onColumnResize", [g, m[g], S - 1]), !0;
    }, u), column_drag_end: u.bind(function(_, f, v) {
      for (var k = c.$getConfig(), b = c.getGridColumns(), m = 0, g = parseInt(_.config.drag_index, 10), p = b[g], y = 0; y < g; y++) m += b[y].width;
      var $ = p.min_width && _.config.left - m < p.min_width ? p.min_width : _.config.left - m;
      if (p.max_width && p.max_width < $ && ($ = p.max_width), c.callEvent("onColumnResizeEnd", [g, p, $]) !== !1 && p.width != $) {
        if (p.width = $, k.keep_grid_width) m = k.grid_width;
        else {
          y = g;
          for (var x = b.length; y < x; y++) m += b[y].width;
        }
        c.callEvent("onColumnResizeComplete", [b, c._setColumnsWidth(m, g)]), c.$config.scrollable || u.$layout._syncCellSizes(c.$config.group, { value: k.grid_width, isGravity: !1 }), this.render();
      }
    }, u) };
    return { init: function() {
      var _ = u.$services.getService("dnd"), f = c.$getConfig(), v = new _(c.$grid_scale, { updates_per_second: 60 });
      u.defined(f.dnd_sensitivity) && (v.config.sensitivity = f.dnd_sensitivity), v.attachEvent("onBeforeDragStart", function(k, b) {
        return h.column_before_start(v, k, b);
      }), v.attachEvent("onAfterDragStart", function(k, b) {
        return h.column_after_start(v, k, b);
      }), v.attachEvent("onDragMove", function(k, b) {
        return h.column_drag_move(v, k, b);
      }), v.attachEvent("onDragEnd", function(k, b) {
        return h.column_drag_end(v, k, b);
      });
    }, doOnRender: function() {
      for (var _ = c.getGridColumns(), f = c.$getConfig(), v = 0, k = c.$config.width, b = f.scale_height, m = 0; m < _.length; m++) {
        var g, p = _[m];
        if (v += p.width, g = f.rtl ? k - v : v, p.resize && m != _.length - 1) {
          var y = document.createElement("div");
          y.className = "gantt_grid_column_resize_wrap", y.style.top = "0px", y.style.height = b + "px", y.innerHTML = "<div class='gantt_grid_column_resize'></div>", y.setAttribute(f.grid_resizer_column_attribute, m), y.setAttribute("column_index", m), u._waiAria.gridSeparatorAttr(y), c.$grid_scale.appendChild(y), y.style.left = Math.max(0, g) + "px";
        }
      }
    } };
  }(n, this);
  l.init(), this._renderHeaderResizers = l.doOnRender, this._mouseDelegates = qe(n);
  var d = function(u, c) {
    var h = { row_before_start: u.bind(function(_, f, v) {
      var k = c.$getConfig(), b = c.$config.rowStore;
      if (!et(v, k.task_grid_row_resizer_attribute)) return !1;
      var m = this.locate(v, k.task_grid_row_resizer_attribute), g = b.getItem(m);
      return c.callEvent("onBeforeRowResize", [g]) !== !1 && void 0;
    }, u), row_after_start: u.bind(function(_, f, v) {
      var k = c.$getConfig(), b = this.locate(v, k.task_grid_row_resizer_attribute);
      _.config.marker.innerHTML = "", _.config.marker.className += " gantt_row_grid_resize_area", _.config.marker.style.width = c.$grid.offsetWidth + "px", _.config.drag_id = b;
    }, u), row_drag_move: u.bind(function(_, f, v) {
      var k = c.$config.rowStore, b = c.$getConfig(), m = _.config, g = m.drag_id, p = c.getItemHeight(g), y = c.getItemTop(g) - f.scrollTop, $ = Y(c.$grid_data), x = parseInt(m.marker.style.top, 10), w = y + $.y, T = 0, S = b.min_task_grid_row_height;
      return (T = x - w) < S && (T = S), m.marker.style.left = $.x + "px", m.marker.style.top = w - 1 + "px", m.marker.style.height = Math.abs(T) + 1 + "px", m.marker_height = T, c.callEvent("onRowResize", [g, k.getItem(g), T + p]), !0;
    }, u), row_drag_end: u.bind(function(_, f, v) {
      var k = c.$config.rowStore, b = _.config, m = b.drag_id, g = k.getItem(m), p = c.getItemHeight(m), y = b.marker_height;
      c.callEvent("onBeforeRowResizeEnd", [m, g, y]) !== !1 && g.row_height != y && (g.row_height = y, k.updateItem(m), c.callEvent("onAfterRowResize", [m, g, p, y]), this.render());
    }, u) };
    return { init: function() {
      var _ = u.$services.getService("dnd"), f = c.$getConfig(), v = new _(c.$grid_data, { updates_per_second: 60 });
      u.defined(f.dnd_sensitivity) && (v.config.sensitivity = f.dnd_sensitivity), v.attachEvent("onBeforeDragStart", function(k, b) {
        return h.row_before_start(v, k, b);
      }), v.attachEvent("onAfterDragStart", function(k, b) {
        return h.row_after_start(v, k, b);
      }), v.attachEvent("onDragMove", function(k, b) {
        return h.row_drag_move(v, k, b);
      }), v.attachEvent("onDragEnd", function(k, b) {
        return h.row_drag_end(v, k, b);
      });
    } };
  }(n, this);
  d.init(), this._addLayers(this.$gantt), this._initEvents(), r && (this._columnDND = new ea(n, this), this._columnDND.init()), this.callEvent("onReady", []);
}, _validateColumnWidth: function(t, n) {
  var e = t[n];
  if (e && e != "*") {
    var i = this.$gantt, a = 1 * e;
    isNaN(a) ? i.assert(!1, "Wrong " + n + " value of column " + t.name) : t[n] = a;
  }
}, setSize: function(t, n) {
  this.$config.width = this.$state.width = t, this.$config.height = this.$state.height = n;
  for (var e, i = this.getGridColumns(), a = 0, r = (d = this.$getConfig()).grid_elastic_columns, s = 0, o = i.length; s < o; s++) this._validateColumnWidth(i[s], "min_width"), this._validateColumnWidth(i[s], "max_width"), this._validateColumnWidth(i[s], "width"), a += 1 * i[s].width;
  if (!isNaN(a) && this.$config.scrollable || (a = e = this._setColumnsWidth(t + 1)), this.$config.scrollable && r && !isNaN(a)) {
    let c = "width";
    r == "min_width" && (c = "min_width");
    let h = 0;
    i.forEach(function(_) {
      h += _[c] || d.min_grid_column_width;
    });
    var l = Math.max(h, t);
    a = this._setColumnsWidth(l), e = t;
  }
  this.$config.scrollable ? (this.$grid_scale.style.width = a + "px", this.$grid_data.style.width = a + "px") : (this.$grid_scale.style.width = "inherit", this.$grid_data.style.width = "inherit"), this.$config.width -= 1;
  var d = this.$getConfig();
  e !== t && (e !== void 0 ? (d.grid_width = e, this.$config.width = e - 1) : isNaN(a) || (this._setColumnsWidth(a), d.grid_width = a, this.$config.width = a - 1));
  var u = Math.max(this.$state.height - d.scale_height, 0);
  this.$grid_data.style.height = u + "px", this.refresh();
}, getSize: function() {
  var t = this.$getConfig(), n = this.$config.rowStore ? this.getTotalHeight() : 0, e = this._getGridWidth();
  return { x: this.$state.width, y: this.$state.height, contentX: this.isVisible() ? e : 0, contentY: this.isVisible() ? t.scale_height + n : 0, scrollHeight: this.isVisible() ? n : 0, scrollWidth: this.isVisible() ? e : 0 };
}, _bindStore: function() {
  if (this.$config.bind) {
    var t = this.$gantt.getDatastore(this.$config.bind);
    if (this.$config.rowStore = t, t && !t._gridCacheAttached) {
      var n = this;
      t._gridCacheAttached = t.attachEvent("onBeforeFilter", function() {
        n._resetTopPositionHeight();
      });
    }
  }
}, _unbindStore: function() {
  if (this.$config.bind) {
    var t = this.$gantt.getDatastore(this.$config.bind);
    t && t._gridCacheAttached && (t.detachEvent(t._gridCacheAttached), t._gridCacheAttached = !1);
  }
}, refresh: function() {
  this._bindStore(), this._resetTopPositionHeight(), this._resetHeight(), this._initSmartRenderingPlaceholder(), this._calculateGridWidth(), this._renderGridHeader();
}, getViewPort: function() {
  var t = this.$config.scrollLeft || 0, n = this.$config.scrollTop || 0, e = this.$config.height || 0, i = this.$config.width || 0;
  return { y: n, y_end: n + e, x: t, x_end: t + i, height: e, width: i };
}, scrollTo: function(t, n) {
  if (this.isVisible()) {
    var e = !1;
    this.$config.scrollTop = this.$config.scrollTop || 0, this.$config.scrollLeft = this.$config.scrollLeft || 0, 1 * t == t && (this.$config.scrollLeft = this.$state.scrollLeft = this.$grid.scrollLeft = t, e = !0), 1 * n == n && (this.$config.scrollTop = this.$state.scrollTop = this.$grid_data.scrollTop = n, e = !0), e && this.callEvent("onScroll", [this.$config.scrollLeft, this.$config.scrollTop]);
  }
}, getColumnIndex: function(t, n) {
  for (var e = this.$getConfig().columns, i = 0, a = 0; a < e.length; a++) if (n && e[a].hide && i++, e[a].name == t) return a - i;
  return null;
}, getColumn: function(t) {
  var n = this.getColumnIndex(t);
  return n === null ? null : this.$getConfig().columns[n];
}, getGridColumns: function() {
  return this.$getConfig().columns.slice();
}, isVisible: function() {
  return this.$parent && this.$parent.$config ? !this.$parent.$config.hidden : this.$grid.offsetWidth;
}, _createLayerConfig: function() {
  var t = this.$gantt, n = this;
  return [{ renderer: t.$ui.layers.gridLine(), container: this.$grid_data, filter: [function() {
    return n.isVisible();
  }] }, { renderer: t.$ui.layers.gridTaskRowResizer(), container: this.$grid_data, append: !0, filter: [function() {
    return t.config.resize_rows;
  }] }];
}, _addLayers: function(t) {
  if (this.$config.bind) {
    this._taskLayers = [];
    var n = this, e = this.$gantt.$services.getService("layers"), i = e.getDataRender(this.$config.bind);
    i || (i = e.createDataRender({ name: this.$config.bind, defaultContainer: function() {
      return n.$grid_data;
    } }));
    for (var a = this.$config.layers, r = 0; a && r < a.length; r++) {
      var s = a[r];
      s.view = this;
      var o = i.addLayer(s);
      this._taskLayers.push(o);
    }
    this._bindStore(), this._initSmartRenderingPlaceholder();
  }
}, _refreshPlaceholderOnStoreUpdate: function(t) {
  var n = this.$getConfig(), e = this.$config.rowStore;
  if (e && t === null && this.isVisible() && n.smart_rendering) {
    var i;
    if (this.$config.scrollY) {
      var a = this.$gantt.$ui.getView(this.$config.scrollY);
      a && (i = a.getScrollState().scrollSize);
    }
    if (i || (i = e ? this.getTotalHeight() : 0), i) {
      this.$rowsPlaceholder && this.$rowsPlaceholder.parentNode && this.$rowsPlaceholder.parentNode.removeChild(this.$rowsPlaceholder);
      var r = this.$rowsPlaceholder = document.createElement("div");
      r.style.visibility = "hidden", r.style.height = i + "px", r.style.width = "1px", this.$grid_data.appendChild(r);
    }
  }
}, _initSmartRenderingPlaceholder: function() {
  var t = this.$config.rowStore;
  t && (this._initSmartRenderingPlaceholder = function() {
  }, this._staticBgHandler = t.attachEvent("onStoreUpdated", j(this._refreshPlaceholderOnStoreUpdate, this)));
}, _initEvents: function() {
  var t = this.$gantt;
  this._mouseDelegates.delegate("click", "gantt_close", t.bind(function(n, e, i) {
    var a = this.$config.rowStore;
    if (!a) return !0;
    var r = et(n, this.$config.item_attribute);
    return r && a.close(r.getAttribute(this.$config.item_attribute)), !1;
  }, this), this.$grid), this._mouseDelegates.delegate("click", "gantt_open", t.bind(function(n, e, i) {
    var a = this.$config.rowStore;
    if (!a) return !0;
    var r = et(n, this.$config.item_attribute);
    return r && a.open(r.getAttribute(this.$config.item_attribute)), !1;
  }, this), this.$grid);
}, _clearLayers: function(t) {
  var n = this.$gantt.$services.getService("layers").getDataRender(this.$config.bind);
  if (this._taskLayers) for (var e = 0; e < this._taskLayers.length; e++) n.removeLayer(this._taskLayers[e]);
  this._taskLayers = [];
}, _getColumnWidth: function(t, n, e) {
  var i = t.min_width || n.min_grid_column_width, a = Math.max(e, i || 10);
  return t.max_width && (a = Math.min(a, t.max_width)), a;
}, _checkGridColumnMinWidthLimits: function(t, n) {
  for (var e = 0, i = t.length; e < i; e++) {
    var a = 1 * t[e].width;
    !t[e].min_width && a < n.min_grid_column_width && (t[e].min_width = a);
  }
}, _getGridWidthLimits: function() {
  for (var t = this.$getConfig(), n = this.getGridColumns(), e = 0, i = 0, a = 0; a < n.length; a++) e += n[a].min_width ? n[a].min_width : t.min_grid_column_width, i !== void 0 && (i = n[a].max_width ? i + n[a].max_width : void 0);
  return this._checkGridColumnMinWidthLimits(n, t), [e, i];
}, _setColumnsWidth: function(t, n) {
  var e = this.$getConfig(), i = this.getGridColumns(), a = 0, r = t;
  n = window.isNaN(n) ? -1 : n;
  for (var s = 0, o = i.length; s < o; s++) a += 1 * i[s].width;
  if (window.isNaN(a))
    for (this._calculateGridWidth(), a = 0, s = 0, o = i.length; s < o; s++) a += 1 * i[s].width;
  var l = r - a, d = 0;
  for (s = 0; s < n + 1; s++) d += i[s].width;
  for (a -= d, s = n + 1; s < i.length; s++) {
    var u = i[s], c = Math.round(l * (u.width / a));
    l < 0 ? u.min_width && u.width + c < u.min_width ? c = u.min_width - u.width : !u.min_width && e.min_grid_column_width && u.width + c < e.min_grid_column_width && (c = e.min_grid_column_width - u.width) : u.max_width && u.width + c > u.max_width && (c = u.max_width - u.width), a -= u.width, u.width += c, l -= c;
  }
  for (var h = l > 0 ? 1 : -1; l > 0 && h === 1 || l < 0 && h === -1; ) {
    var _ = l;
    for (s = n + 1; s < i.length; s++) {
      var f;
      if ((f = i[s].width + h) == this._getColumnWidth(i[s], e, f) && (l -= h, i[s].width = f), !l) break;
    }
    if (_ == l) break;
  }
  return l && n > -1 && (f = i[n].width + l) == this._getColumnWidth(i[n], e, f) && (i[n].width = f), this._getColsTotalWidth();
}, _getColsTotalWidth: function() {
  for (var t = this.getGridColumns(), n = 0, e = 0; e < t.length; e++) {
    var i = parseFloat(t[e].width);
    if (window.isNaN(i)) return !1;
    n += i;
  }
  return n;
}, _calculateGridWidth: function() {
  for (var t = this.$getConfig(), n = this.getGridColumns(), e = 0, i = [], a = [], r = 0; r < n.length; r++) {
    var s = parseFloat(n[r].width);
    window.isNaN(s) && (s = t.min_grid_column_width || 10, i.push(r)), a[r] = s, e += s;
  }
  var o = this._getGridWidth() + 1;
  if (t.autofit || i.length) {
    var l = o - e;
    if (t.autofit && !t.grid_elastic_columns) for (r = 0; r < a.length; r++) {
      var d = Math.round(l / (a.length - r));
      a[r] += d, (u = this._getColumnWidth(n[r], t, a[r])) != a[r] && (d = u - a[r], a[r] = u), l -= d;
    }
    else if (i.length) for (r = 0; r < i.length; r++) {
      d = Math.round(l / (i.length - r));
      var u, c = i[r];
      a[c] += d, (u = this._getColumnWidth(n[c], t, a[c])) != a[c] && (d = u - a[c], a[c] = u), l -= d;
    }
    for (r = 0; r < a.length; r++) n[r].width = a[r];
  } else {
    var h = o != e;
    this.$config.width = e - 1, t.grid_width = e, h && this.$parent._setContentSize(this.$config.width, null);
  }
}, _renderGridHeader: function() {
  var t = this.$gantt, n = this.$getConfig(), e = this.$gantt.locale, i = this.$gantt.templates, a = this.getGridColumns();
  n.rtl && (a = a.reverse());
  var r = [], s = 0, o = e.labels, l = n.scale_height - 1;
  const d = {};
  for (var u = 0; u < a.length; u++) {
    var c = u == a.length - 1, h = a[u];
    h.name || (h.name = t.uid() + "");
    var _ = 1 * h.width, f = this._getGridWidth();
    c && f > s + _ && (h.width = _ = f - s), s += _;
    var v = t._sort && h.name == t._sort.name ? `<div data-column-id="${h.name}" class="gantt_sort gantt_${t._sort.direction}"></div>` : "", k = ["gantt_grid_head_cell", "gantt_grid_head_" + h.name, c ? "gantt_last_cell" : "", i.grid_header_class(h.name, h)].join(" "), b = "width:" + (_ - (c ? 1 : 0)) + "px;", m = h.label || o["column_" + h.name] || o[h.name];
    typeof m == "function" && (m = m.call(t, h.name, h)), m = m || "";
    let p = !1;
    t.config.external_render && t.config.external_render.isElement(m) && (p = !0, d[h.name] = m);
    var g = "<div class='" + k + "' style='" + b + "' " + t._waiAria.gridScaleCellAttrString(h, m) + " data-column-id='" + h.name + "' column_id='" + h.name + "' data-column-name='" + h.name + "' data-column-index='" + u + "'>" + (p ? "<div data-component-container></div>" : m) + v + "</div>";
    r.push(g);
  }
  this.$grid_scale.style.height = n.scale_height + "px", this.$grid_scale.style.lineHeight = l + "px", this.$grid_scale.innerHTML = r.join("");
  for (let p in d) t.config.external_render.renderElement(d[p], this.$grid_scale.querySelector("[data-column-id='" + p + "'] [data-component-container]"));
  this._renderHeaderResizers && this._renderHeaderResizers();
}, _getGridWidth: function() {
  return this.$config.width;
}, destructor: function() {
  this._clearLayers(this.$gantt), this._mouseDelegates && (this._mouseDelegates.destructor(), this._mouseDelegates = null), this._unbindStore(), this.$grid = null, this.$grid_scale = null, this.$grid_data = null, this.$gantt = null, this.$config.rowStore && (this.$config.rowStore.detachEvent(this._staticBgHandler), this.$config.rowStore = null), this.callEvent("onDestroy", []), this.detachAllEvents();
} };
var qn = function(t) {
  return { getWorkHoursArguments: function() {
    var n = arguments[0];
    if (!St((n = at(n) ? { date: n } : H({}, n)).date)) throw t.assert(!1, "Invalid date argument for getWorkHours method"), new Error("Invalid date argument for getWorkHours method");
    return n;
  }, setWorkTimeArguments: function() {
    return arguments[0];
  }, unsetWorkTimeArguments: function() {
    return arguments[0];
  }, isWorkTimeArguments: function() {
    var n, e = arguments[0];
    if (e instanceof ve) return e;
    if ((n = e.date ? new ve(e.date, e.unit, e.task, null, e.calendar) : new ve(arguments[0], arguments[1], arguments[2], null, arguments[3])).unit = n.unit || t.config.duration_unit, !St(n.date)) throw t.assert(!1, "Invalid date argument for isWorkTime method"), new Error("Invalid date argument for isWorkTime method");
    return n;
  }, getClosestWorkTimeArguments: function(n) {
    var e, i = arguments[0];
    if (i instanceof ke) return i;
    if (e = at(i) ? new ke(i) : new ke(i.date, i.dir, i.unit, i.task, null, i.calendar), i.id && (e.task = i), e.dir = i.dir || "any", e.unit = i.unit || t.config.duration_unit, !St(e.date)) throw t.assert(!1, "Invalid date argument for getClosestWorkTime method"), new Error("Invalid date argument for getClosestWorkTime method");
    return e;
  }, _getStartEndConfig: function(n) {
    var e, i = ia;
    if (n instanceof i) return n;
    if (at(n) ? e = new i(arguments[0], arguments[1], arguments[2], arguments[3]) : (e = new i(n.start_date, n.end_date, n.task), n.id !== null && n.id !== void 0 && (e.task = n)), e.unit = e.unit || t.config.duration_unit, e.step = e.step || t.config.duration_step, e.start_date = e.start_date || e.start || e.date, !St(e.start_date)) throw t.assert(!1, "Invalid start_date argument for getDuration method"), new Error("Invalid start_date argument for getDuration method");
    if (!St(e.end_date)) throw t.assert(!1, "Invalid end_date argument for getDuration method"), new Error("Invalid end_date argument for getDuration method");
    return e;
  }, getDurationArguments: function(n, e, i, a) {
    return this._getStartEndConfig.apply(this, arguments);
  }, hasDurationArguments: function(n, e, i, a) {
    return this._getStartEndConfig.apply(this, arguments);
  }, calculateEndDateArguments: function(n, e, i, a) {
    var r, s = arguments[0];
    if (s instanceof ye) return s;
    if (r = at(s) ? new ye(arguments[0], arguments[1], arguments[2], void 0, arguments[3], void 0, arguments[4]) : new ye(s.start_date, s.duration, s.unit, s.step, s.task, null, s.calendar), s.id !== null && s.id !== void 0 && (r.task = s, r.unit = null, r.step = null), r.unit = r.unit || t.config.duration_unit, r.step = r.step || t.config.duration_step, !St(r.start_date)) throw t.assert(!1, "Invalid start_date argument for calculateEndDate method"), new Error("Invalid start_date argument for calculateEndDate method");
    return r;
  } };
};
function Yn() {
}
Yn.prototype = { _getIntervals: function(t) {
  for (var n = [], e = 0; e < t.length; e += 2) n.push({ start: t[e], end: t[e + 1] });
  return n;
}, _toHoursArray: function(t) {
  var n = [];
  function e(a) {
    var r, s = Math.floor(a / 3600), o = a - 60 * s * 60, l = Math.floor(o / 60);
    return s + ":" + ((r = String(l)).length < 2 && (r = "0" + r), r);
  }
  for (var i = 0; i < t.length; i++) n.push(e(t[i].start) + "-" + e(t[i].end));
  return n;
}, _intersectHourRanges: function(t, n) {
  var e = [], i = t.length > n.length ? t : n, a = t === i ? n : t;
  i = i.slice(), a = a.slice(), e = [];
  for (var r = 0; r < i.length; r++) for (var s = i[r], o = 0; o < a.length; o++) {
    var l = a[o];
    l.start < s.end && l.end > s.start && (e.push({ start: Math.max(s.start, l.start), end: Math.min(s.end, l.end) }), s.end > l.end && (a.splice(o, 1), o--, r--));
  }
  return e;
}, _mergeAdjacentIntervals: function(t) {
  var n = t.slice();
  n.sort(function(r, s) {
    return r.start - s.start;
  });
  for (var e = n[0], i = 1; i < n.length; i++) {
    var a = n[i];
    a.start <= e.end ? (a.end > e.end && (e.end = a.end), n.splice(i, 1), i--) : e = a;
  }
  return n;
}, _mergeHoursConfig: function(t, n) {
  return this._mergeAdjacentIntervals(this._intersectHourRanges(t, n));
}, merge: function(t, n) {
  const e = J(t.getConfig()), i = J(n.getConfig()), a = e.parsed, r = i.parsed;
  a.customWeeks = e.customWeeks, r.customWeeks = i.customWeeks;
  var s = { hours: this._toHoursArray(this._mergeHoursConfig(a.hours, r.hours)), dates: {}, customWeeks: {} };
  const o = (d, u) => {
    for (let c in d.dates) {
      const h = d.dates[c];
      +c > 1e3 && (s.dates[c] = !1);
      for (const _ in u.dates) {
        const f = u.dates[_];
        if (_ == c && (s.dates[c] = !(!h || !f)), Array.isArray(h)) {
          const v = Array.isArray(f) ? f : u.hours;
          s.dates[c] = this._toHoursArray(this._mergeHoursConfig(h, v));
        }
      }
    }
  };
  if (o(a, r), o(r, a), a.customWeeks) for (var l in a.customWeeks) s.customWeeks[l] = a.customWeeks[l];
  if (r.customWeeks) for (var l in r.customWeeks) s.customWeeks[l] ? s.customWeeks[l + "_second"] = r.customWeeks[l] : s.customWeeks[l] = r.customWeeks[l];
  return s;
} };
class aa {
  constructor() {
    this.clear();
  }
  getItem(n, e, i) {
    if (this._cache.has(n)) {
      const a = this._cache.get(n)[i.getFullYear()];
      if (a && a.has(e)) return a.get(e);
    }
    return -1;
  }
  setItem(n, e, i, a) {
    if (!n || !e) return;
    const r = this._cache, s = a.getFullYear();
    let o;
    r.has(n) ? o = r.get(n) : (o = [], r.set(n, o));
    let l = o[s];
    l || (l = o[s] = /* @__PURE__ */ new Map()), l.set(e, i);
  }
  clear() {
    this._cache = /* @__PURE__ */ new Map();
  }
}
class ra {
  constructor() {
    this.clear();
  }
  getItem(n, e, i) {
    const a = this._cache;
    if (a && a[n]) {
      const r = a[n];
      if (r === void 0) return -1;
      const s = r[i.getFullYear()];
      if (s && s[e] !== void 0) return s[e];
    }
    return -1;
  }
  setItem(n, e, i, a) {
    if (!n || !e) return;
    const r = this._cache;
    if (!r) return;
    r[n] || (r[n] = []);
    const s = r[n], o = a.getFullYear();
    let l = s[o];
    l || (l = s[o] = {}), l[e] = i;
  }
  clear() {
    this._cache = {};
  }
}
class sa {
  constructor(n) {
    this.getMinutesPerWeek = (e) => {
      const i = e.valueOf();
      if (this._weekCache.has(i)) return this._weekCache.get(i);
      const a = this._calendar, r = this._calendar.$gantt;
      let s = 0, o = r.date.week_start(new Date(e));
      for (let l = 0; l < 7; l++) s += 60 * a.getHoursPerDay(o), o = r.date.add(o, 1, "day");
      return this._weekCache.set(i, s), s;
    }, this.getMinutesPerMonth = (e) => {
      const i = e.valueOf();
      if (this._monthCache.has(i)) return this._monthCache.get(i);
      const a = this._calendar, r = this._calendar.$gantt;
      let s = 0, o = r.date.week_start(new Date(e));
      const l = r.date.add(o, 1, "month").valueOf();
      for (; o.valueOf() < l; ) s += 60 * a.getHoursPerDay(o), o = r.date.add(o, 1, "day");
      return this._monthCache.set(i, s), s;
    }, this.clear = () => {
      this._weekCache = /* @__PURE__ */ new Map(), this._monthCache = /* @__PURE__ */ new Map();
    }, this.clear(), this._calendar = n;
  }
}
class oa {
  constructor() {
    this.clear();
  }
  _getCacheObject(n, e, i) {
    const a = this._cache;
    a[e] || (a[e] = []);
    let r = a[e];
    r || (r = a[e] = {});
    let s = r[i];
    s || (s = r[i] = {});
    const o = n.getFullYear();
    let l = s[o];
    return l || (l = s[o] = { durations: {}, endDates: {} }), l;
  }
  _endDateCacheKey(n, e) {
    return String(n) + "-" + String(e);
  }
  _durationCacheKey(n, e) {
    return String(n) + "-" + String(e);
  }
  getEndDate(n, e, i, a, r) {
    const s = this._getCacheObject(n, i, a), o = n.valueOf(), l = this._endDateCacheKey(o, e);
    let d;
    if (s.endDates[l] === void 0) {
      const u = r(), c = u.valueOf();
      s.endDates[l] = c, s.durations[this._durationCacheKey(o, c)] = e, d = u;
    } else d = new Date(s.endDates[l]);
    return d;
  }
  getDuration(n, e, i, a, r) {
    const s = this._getCacheObject(n, i, a), o = n.valueOf(), l = e.valueOf(), d = this._durationCacheKey(o, l);
    let u;
    if (s.durations[d] === void 0) {
      const c = r();
      s.durations[d] = c.valueOf(), u = c;
    } else u = s.durations[d];
    return u;
  }
  clear() {
    this._cache = {};
  }
}
function Re(t, n) {
  this.argumentsHelper = n, this.$gantt = t, this._workingUnitsCache = typeof Map < "u" ? new aa() : new ra(), this._largeUnitsCache = new sa(this), this._dateDurationCache = new oa(), this._worktime = null, this._cached_timestamps = {}, this._cached_timestamps_count = 0;
}
Re.prototype = { units: ["year", "month", "week", "day", "hour", "minute"], _clearCaches: function() {
  this._workingUnitsCache.clear(), this._largeUnitsCache.clear(), this._dateDurationCache.clear();
}, _getUnitOrder: function(t) {
  for (var n = 0, e = this.units.length; n < e; n++) if (this.units[n] == t) return n;
}, _resetTimestampCache: function() {
  this._cached_timestamps = {}, this._cached_timestamps_count = 0;
}, _timestamp: function(t) {
  this._cached_timestamps_count > 1e6 && this._resetTimestampCache();
  var n = null;
  if (t.day || t.day === 0) n = t.day;
  else if (t.date) {
    var e = String(t.date.valueOf());
    this._cached_timestamps[e] ? n = this._cached_timestamps[e] : (n = Date.UTC(t.date.getFullYear(), t.date.getMonth(), t.date.getDate()), this._cached_timestamps[e] = n, this._cached_timestamps_count++);
  }
  return n;
}, _checkIfWorkingUnit: function(t, n) {
  if (!this["_is_work_" + n]) {
    const e = this.$gantt.date[`${n}_start`](new Date(t)), i = this.$gantt.date.add(e, 1, n);
    return this.hasDuration(e, i);
  }
  return this["_is_work_" + n](t);
}, _is_work_day: function(t) {
  var n = this._getWorkHours(t);
  return !!Array.isArray(n) && n.length > 0;
}, _is_work_hour: function(t) {
  for (var n = this._getWorkHours(t), e = t.getHours(), i = 0; i < n.length; i++) if (e >= n[i].startHour && e < n[i].endHour) return !0;
  return !1;
}, _getTimeOfDayStamp: function(t, n) {
  var e = t.getHours();
  return t.getHours() || t.getMinutes() || !n || (e = 24), 60 * e * 60 + 60 * t.getMinutes();
}, _is_work_minute: function(t) {
  for (var n = this._getWorkHours(t), e = this._getTimeOfDayStamp(t), i = 0; i < n.length; i++) if (e >= n[i].start && e < n[i].end) return !0;
  return !1;
}, _nextDate: function(t, n, e) {
  return this.$gantt.date.add(t, e, n);
}, _getWorkUnitsBetweenGeneric: function(t, n, e, i) {
  var a = this.$gantt.date, r = new Date(t), s = new Date(n);
  i = i || 1;
  var o, l, d = 0, u = null, c = !1;
  (o = a[e + "_start"](new Date(r))).valueOf() != r.valueOf() && (c = !0);
  var h = !1;
  (l = a[e + "_start"](new Date(n))).valueOf() != n.valueOf() && (h = !0);
  for (var _ = !1; r.valueOf() < s.valueOf(); ) {
    if (_ = (u = this._nextDate(r, e, i)).valueOf() > s.valueOf(), this._isWorkTime(r, e)) (c || h && _) && (o = a[e + "_start"](new Date(r)), l = a.add(o, i, e)), c ? (c = !1, u = this._nextDate(o, e, i), d += (l.valueOf() - r.valueOf()) / (l.valueOf() - o.valueOf())) : h && _ ? (h = !1, d += (s.valueOf() - r.valueOf()) / (l.valueOf() - o.valueOf())) : d++;
    else {
      var f = this._getUnitOrder(e), v = this.units[f - 1];
      v && !this._isWorkTime(r, v) && (u = this._getClosestWorkTimeFuture(r, v));
    }
    r = u;
  }
  return d;
}, _getMinutesPerHour: function(t) {
  var n = this._getTimeOfDayStamp(t), e = this._getTimeOfDayStamp(this._nextDate(t, "hour", 1));
  e === 0 && (e = 86400);
  for (var i = this._getWorkHours(t), a = 0; a < i.length; a++) {
    var r = i[a];
    if (n >= r.start && e <= r.end) return 60;
    if (n < r.end && e > r.start) return (Math.min(e, r.end) - Math.max(n, r.start)) / 60;
  }
  return 0;
}, _getMinutesPerDay: function(t) {
  var n = this._getWorkHours(t), e = 0;
  return n.forEach(function(i) {
    e += i.durationMinutes;
  }), e;
}, getHoursPerDay: function(t) {
  var n = this._getWorkHours(t), e = 0;
  return n.forEach(function(i) {
    e += i.durationHours;
  }), e;
}, _getWorkUnitsForRange: function(t, n, e, i) {
  var a, r = 0, s = new Date(t), o = new Date(n);
  for (a = j(e == "minute" ? this._getMinutesPerDay : this.getHoursPerDay, this); s.valueOf() < o.valueOf(); ) if (o - s > 27648e5 && s.getDate() === 0) {
    var l = this._largeUnitsCache.getMinutesPerMonth(s);
    e == "hour" && (l /= 60), r += l, s = this.$gantt.date.add(s, 1, "month");
  } else {
    if (o - s > 13824e5) {
      var d = this.$gantt.date.week_start(new Date(s));
      if (s.valueOf() === d.valueOf()) {
        l = this._largeUnitsCache.getMinutesPerWeek(s), e == "hour" && (l /= 60), r += l, s = this.$gantt.date.add(s, 7, "day");
        continue;
      }
    }
    r += a(s), s = this._nextDate(s, "day", 1);
  }
  return r / i;
}, _getMinutesBetweenSingleDay: function(t, n) {
  for (var e = this._getIntervalTimestamp(t, n), i = this._getWorkHours(t), a = 0, r = 0; r < i.length; r++) {
    var s = i[r];
    if (e.end >= s.start && e.start <= s.end) {
      var o = Math.max(s.start, e.start), l = Math.min(s.end, e.end);
      a += (l - o) / 60, e.start = l;
    }
  }
  return Math.floor(a);
}, _getMinutesBetween: function(t, n, e, i) {
  var a = new Date(t), r = new Date(n);
  i = i || 1;
  var s = new Date(a), o = this.$gantt.date.add(this.$gantt.date.day_start(new Date(a)), 1, "day");
  if (r.valueOf() <= o.valueOf()) return this._getMinutesBetweenSingleDay(t, n);
  var l = this.$gantt.date.day_start(new Date(r)), d = r, u = this._getMinutesBetweenSingleDay(s, o), c = this._getMinutesBetweenSingleDay(l, d);
  return u + this._getWorkUnitsForRange(o, l, e, i) + c;
}, _getHoursBetween: function(t, n, e, i) {
  var a = new Date(t), r = new Date(n);
  i = i || 1;
  var s = new Date(a), o = this.$gantt.date.add(this.$gantt.date.day_start(new Date(a)), 1, "day");
  if (r.valueOf() <= o.valueOf()) return Math.round(this._getMinutesBetweenSingleDay(t, n) / 60);
  var l = this.$gantt.date.day_start(new Date(r)), d = r, u = this._getMinutesBetweenSingleDay(s, o, e, i) / 60, c = this._getMinutesBetweenSingleDay(l, d, e, i) / 60, h = u + this._getWorkUnitsForRange(o, l, e, i) + c;
  return Math.round(h);
}, getConfig: function() {
  return this._worktime;
}, _setConfig: function(t) {
  this._worktime = t, this._parseSettings(), this._clearCaches();
}, _parseSettings: function() {
  var t = this.getConfig();
  for (var n in t.parsed = { dates: {}, hours: null, haveCustomWeeks: !1, customWeeks: {}, customWeeksRangeStart: null, customWeeksRangeEnd: null, customWeeksBoundaries: [] }, t.parsed.hours = this._parseHours(t.hours), t.dates) t.parsed.dates[n] = this._parseHours(t.dates[n]);
  if (t.customWeeks) {
    var e = null, i = null;
    for (var n in t.customWeeks) {
      var a = t.customWeeks[n];
      if (a.from && a.to) {
        var r = a.from, s = a.to;
        (!e || e > r.valueOf()) && (e = r.valueOf()), (!i || i < s.valueOf()) && (i = s.valueOf()), t.parsed.customWeeksBoundaries.push({ from: r.valueOf(), fromReadable: new Date(r), to: s.valueOf(), toReadable: new Date(s), name: n }), t.parsed.haveCustomWeeks = !0;
        var o = t.parsed.customWeeks[n] = { from: a.from, to: a.to, hours: this._parseHours(a.hours), dates: {} };
        if (a.days && !a.dates) {
          for (a.dates = a.dates || {}, n = 0; n < a.days.length; n++) a.dates[n] = a.days[n], a.days[n] instanceof Array || (a.dates[n] = !!a.days[n]);
          delete a.days;
        }
        for (var l in a.dates) o.dates[l] = this._parseHours(a.dates[l]);
      }
    }
    t.parsed.customWeeksRangeStart = e, t.parsed.customWeeksRangeEnd = i;
  }
}, _tryChangeCalendarSettings: function(t) {
  var n = JSON.stringify(this.getConfig());
  return t(), !!this.hasWorkTime() || (this._setConfig(JSON.parse(n)), this._clearCaches(), !1);
}, _arraysEqual: function(t, n) {
  if (t === n) return !0;
  if (!t || !n || t.length != n.length) return !1;
  for (var e = 0; e < t.length; ++e) if (t[e] !== n[e]) return !1;
  return !0;
}, _compareSettings: function(t, n) {
  if (!this._arraysEqual(t.hours, n.hours)) return !1;
  var e = Object.keys(t.dates), i = Object.keys(n.dates);
  if (e.sort(), i.sort(), !this._arraysEqual(e, i)) return !1;
  for (var a = 0; a < e.length; a++) {
    var r = e[a], s = t.dates[r], o = t.dates[r];
    if (s !== o && !(Array.isArray(s) && Array.isArray(o) && this._arraysEqual(s, o))) return !1;
  }
  return !0;
}, equals: function(t) {
  if (!(t instanceof Re)) return !1;
  var n = this.getConfig(), e = t.getConfig();
  if (!this._compareSettings(n, e)) return !1;
  if (n.parsed.haveCustomWeeks && e.parsed.haveCustomWeeks) {
    if (n.parsed.customWeeksBoundaries.length != e.parsed.customWeeksBoundaries.length) return !1;
    for (var i in n.parsed.customWeeks) {
      var a = n.parsed.customWeeks[i], r = e.parsed.customWeeks[i];
      if (!r || !this._compareSettings(a, r)) return !1;
    }
  } else if (n.parse.haveCustomWeeks !== e.parsed.haveCustomWeeks) return !1;
  return !0;
}, getWorkHours: function() {
  var t = this.argumentsHelper.getWorkHoursArguments.apply(this.argumentsHelper, arguments);
  return this._getWorkHours(t.date, !1);
}, _getWorkHours: function(t, n) {
  var e = this.getConfig();
  if (n !== !1 && (e = e.parsed), !t) return e.hours;
  const i = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  var a = this._timestamp({ date: i });
  if (e.haveCustomWeeks && e.customWeeksRangeStart <= a && e.customWeeksRangeEnd > a) {
    for (var r = 0; r < e.customWeeksBoundaries.length; r++) if (e.customWeeksBoundaries[r].from <= a && e.customWeeksBoundaries[r].to > a) {
      e = e.customWeeks[e.customWeeksBoundaries[r].name];
      break;
    }
  }
  var s = !0;
  return e.dates[a] !== void 0 ? s = e.dates[a] : e.dates[t.getDay()] !== void 0 && (s = e.dates[t.getDay()]), s === !0 ? e.hours : s || [];
}, _getIntervalTimestamp: function(t, n) {
  var e = { start: 0, end: 0 };
  e.start = 60 * t.getHours() * 60 + 60 * t.getMinutes() + t.getSeconds();
  var i = n.getHours();
  return !i && !n.getMinutes() && !n.getSeconds() && t.valueOf() < n.valueOf() && (i = 24), e.end = 60 * i * 60 + 60 * n.getMinutes() + n.getSeconds(), e;
}, _parseHours: function(t) {
  if (Array.isArray(t)) {
    var n = [];
    t.forEach(function(o) {
      typeof o == "number" ? n.push(60 * o * 60) : typeof o == "string" && o.split("-").map(function(l) {
        return l.trim();
      }).forEach(function(l) {
        var d = l.split(":").map(function(c) {
          return c.trim();
        }), u = parseInt(60 * d[0] * 60);
        d[1] && (u += parseInt(60 * d[1])), d[2] && (u += parseInt(d[2])), n.push(u);
      });
    });
    for (var e = [], i = 0; i < n.length; i += 2) {
      var a = n[i], r = n[i + 1], s = r - a;
      e.push({ start: a, end: r, startHour: Math.floor(a / 3600), startMinute: Math.floor(a / 60), endHour: Math.ceil(r / 3600), endMinute: Math.ceil(r / 60), durationSeconds: s, durationMinutes: s / 60, durationHours: s / 3600 });
    }
    return e;
  }
  return t;
}, setWorkTime: function(t) {
  return this._tryChangeCalendarSettings(j(function() {
    var n = t.hours === void 0 || t.hours, e = this._timestamp(t), i = this.getConfig();
    if (e !== null ? i.dates[e] = n : t.customWeeks || (i.hours = n), t.customWeeks) {
      if (i.customWeeks || (i.customWeeks = {}), typeof t.customWeeks == "string") e !== null ? i.customWeeks[t.customWeeks].dates[e] = n : t.customWeeks || (i.customWeeks[t.customWeeks].hours = n);
      else if (typeof t.customWeeks == "object" && t.customWeeks.constructor === Object) for (var a in t.customWeeks) i.customWeeks[a] = t.customWeeks[a];
    }
    this._parseSettings(), this._clearCaches();
  }, this));
}, unsetWorkTime: function(t) {
  return this._tryChangeCalendarSettings(j(function() {
    if (t) {
      var n = this._timestamp(t);
      n !== null && delete this.getConfig().dates[n];
    } else this.reset_calendar();
    this._parseSettings(), this._clearCaches();
  }, this));
}, _isWorkTime: function(t, n) {
  var e, i = -1;
  return e = String(t.valueOf()), (i = this._workingUnitsCache.getItem(n, e, t)) == -1 && (i = this._checkIfWorkingUnit(t, n), this._workingUnitsCache.setItem(n, e, i, t)), i;
}, isWorkTime: function() {
  var t = this.argumentsHelper.isWorkTimeArguments.apply(this.argumentsHelper, arguments);
  return this._isWorkTime(t.date, t.unit);
}, calculateDuration: function() {
  var t = this.argumentsHelper.getDurationArguments.apply(this.argumentsHelper, arguments);
  if (!t.unit) return !1;
  var n = this;
  return this._dateDurationCache.getDuration(t.start_date, t.end_date, t.unit, t.step, function() {
    return n._calculateDuration(t.start_date, t.end_date, t.unit, t.step);
  });
}, _calculateDuration: function(t, n, e, i) {
  var a = 0, r = 1;
  if (t.valueOf() > n.valueOf()) {
    var s = n;
    n = t, t = s, r = -1;
  }
  return a = e == "hour" && i == 1 ? this._getHoursBetween(t, n, e, i) : e == "minute" && i == 1 ? this._getMinutesBetween(t, n, e, i) : this._getWorkUnitsBetweenGeneric(t, n, e, i), r * Math.round(a);
}, hasDuration: function() {
  var t = this.argumentsHelper.getDurationArguments.apply(this.argumentsHelper, arguments), n = t.start_date, e = t.end_date, i = t.unit, a = t.step;
  if (!i) return !1;
  var r = new Date(n), s = new Date(e);
  for (a = a || 1; r.valueOf() < s.valueOf(); ) {
    if (this._isWorkTime(r, i)) return !0;
    r = this._nextDate(r, i, a);
  }
  return !1;
}, calculateEndDate: function() {
  var t = this.argumentsHelper.calculateEndDateArguments.apply(this.argumentsHelper, arguments), n = t.start_date, e = t.duration, i = t.unit, a = t.step;
  if (!i) return !1;
  var r = t.duration >= 0 ? 1 : -1;
  e = Math.abs(1 * e);
  var s = this;
  return this._dateDurationCache.getEndDate(n, e, i, a * r, function() {
    return s._calculateEndDate(n, e, i, a * r);
  });
}, _calculateEndDate: function(t, n, e, i) {
  return !!e && (i == 1 && e == "minute" ? this._calculateMinuteEndDate(t, n, i) : i == -1 && e == "minute" ? this._subtractMinuteDate(t, n, i) : i == 1 && e == "hour" ? this._calculateHourEndDate(t, n, i) : this._addInterval(t, n, e, i, null).end);
}, _addInterval: function(t, n, e, i, a) {
  for (var r = 0, s = t, o = !1; r < n && (!a || !a(s)); ) {
    var l = this._nextDate(s, e, i);
    e == "day" && (o = o || !s.getHours() && l.getHours()) && (l.setHours(0), l.getHours() || (o = !1));
    var d = new Date(l.valueOf() + 1);
    i > 0 && (d = new Date(l.valueOf() - 1)), this._isWorkTime(d, e) && !o && r++, s = l;
  }
  return { end: s, start: t, added: r };
}, _addHoursUntilDayEnd: function(t, n) {
  for (var e = this.$gantt.date.add(this.$gantt.date.day_start(new Date(t)), 1, "day"), i = 0, a = n, r = this._getIntervalTimestamp(t, e), s = this._getWorkHours(t), o = 0; o < s.length && i < n; o++) {
    var l = s[o];
    if (r.end >= l.start && r.start <= l.end) {
      var d = Math.max(l.start, r.start), u = Math.min(l.end, r.end), c = (u - d) / 3600;
      c > a && (c = a, u = d + 60 * a * 60);
      var h = Math.round((u - d) / 3600);
      i += h, a -= h, r.start = u;
    }
  }
  var _ = e;
  return i === n && (_ = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, r.start)), { added: i, end: _ };
}, _calculateHourEndDate: function(t, n, e) {
  var i = new Date(t), a = 0;
  e = e || 1, n = Math.abs(1 * n);
  var r = this._addHoursUntilDayEnd(i, n);
  if (a = r.added, i = r.end, d = n - a) {
    for (var s = i; a < n; ) {
      var o = this._nextDate(s, "day", e);
      o.setHours(0), o.setMinutes(0), o.setSeconds(0);
      var l = 0;
      if (a + (l = e > 0 ? this.getHoursPerDay(new Date(o.valueOf() - 1)) : this.getHoursPerDay(new Date(o.valueOf() + 1))) >= n) break;
      a += l, s = o;
    }
    i = s;
  }
  if (a < n) {
    var d = n - a;
    i = (r = this._addHoursUntilDayEnd(i, d)).end;
  }
  return i;
}, _addMinutesUntilHourEnd: function(t, n) {
  if (t.getMinutes() === 0) return { added: 0, end: new Date(t) };
  for (var e = this.$gantt.date.add(this.$gantt.date.hour_start(new Date(t)), 1, "hour"), i = 0, a = n, r = this._getIntervalTimestamp(t, e), s = this._getWorkHours(t), o = 0; o < s.length && i < n; o++) {
    var l = s[o];
    if (r.end >= l.start && r.start <= l.end) {
      var d = Math.max(l.start, r.start), u = Math.min(l.end, r.end), c = (u - d) / 60;
      c > a && (c = a, u = d + 60 * a);
      var h = Math.round((u - d) / 60);
      a -= h, i += h, r.start = u;
    }
  }
  var _ = e;
  return i === n && (_ = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, r.start)), { added: i, end: _ };
}, _subtractMinutesUntilHourStart: function(t, n) {
  for (var e = this.$gantt.date.hour_start(new Date(t)), i = 0, a = n, r = 60 * e.getHours() * 60 + 60 * e.getMinutes() + e.getSeconds(), s = 60 * t.getHours() * 60 + 60 * t.getMinutes() + t.getSeconds(), o = this._getWorkHours(t), l = o.length - 1; l >= 0 && i < n; l--) {
    var d = o[l];
    if (s > d.start && r <= d.end) {
      var u = Math.min(s, d.end), c = Math.max(r, d.start), h = (u - c) / 60;
      h > a && (h = a, c = u - 60 * a);
      var _ = Math.abs(Math.round((u - c) / 60));
      a -= _, i += _, s = c;
    }
  }
  var f = e;
  return i === n && (f = new Date(t.getFullYear(), t.getMonth(), t.getDate(), 0, 0, s)), { added: i, end: f };
}, _subtractMinuteDate: function(t, n, e) {
  var i = this.getClosestWorkTime({ date: t, dir: "past", unit: "minute" }), a = 0;
  e = e || -1, n = Math.abs(1 * n), n = Math.round(n);
  const r = this._isMinutePrecision(i);
  let s = this._subtractMinutesUntilHourStart(i, n);
  a += s.added, i = s.end;
  for (var o = 0, l = [], d = 0; a < n; ) {
    var u = this.$gantt.date.day_start(new Date(i)), c = !1;
    i.valueOf() === u.valueOf() && (u = this.$gantt.date.add(u, -1, "day"), c = !0);
    var h = new Date(u.getFullYear(), u.getMonth(), u.getDate(), 23, 59, 59, 999).valueOf();
    h !== o && (l = this._getWorkHours(u), d = this._getMinutesPerDay(u), o = h);
    var _ = n - a, f = this._getTimeOfDayStamp(i, c);
    if (l.length && d) if (l[l.length - 1].end <= f && _ > d) a += d, i = this.$gantt.date.add(i, -1, "day");
    else {
      for (var v = !1, k = null, b = null, m = l.length - 1; m >= 0; m--) if (l[m].start < f - 1 && l[m].end >= f - 1) {
        v = !0, k = l[m], b = l[m - 1];
        break;
      }
      if (v) if (f === k.end && _ >= k.durationMinutes) a += k.durationMinutes, i = this.$gantt.date.add(i, -k.durationMinutes, "minute");
      else if (!r && _ <= f / 60 - k.startMinute) a += _, i = this.$gantt.date.add(i, -_, "minute");
      else if (r) _ <= f / 60 - k.startMinute ? (a += _, i = this.$gantt.date.add(i, -_, "minute")) : (a += f / 60 - k.startMinute, i = b ? new Date(i.getFullYear(), i.getMonth(), i.getDate(), 0, 0, b.end) : this.$gantt.date.day_start(i));
      else {
        var g = this._getMinutesPerHour(i);
        g <= _ ? (a += g, i = this._nextDate(i, "hour", e)) : (s = this._subtractMinutesUntilHourStart(i, _), a += s.added, i = s.end);
      }
      else if (i.getHours() === 0 && i.getMinutes() === 0 && i.getSeconds() === 0) {
        if ((p = this._getClosestWorkTimePast(i, "hour")).valueOf() === i.valueOf()) {
          var p = this.$gantt.date.add(i, -1, "day"), y = this._getWorkHours(p);
          if (y.length) {
            var $ = y[y.length - 1];
            p.setSeconds($.durationSeconds);
          }
        }
        i = p;
      } else i = this._getClosestWorkTimePast(new Date(i - 1), "hour");
    }
    else i = this.$gantt.date.add(i, -1, "day");
  }
  if (a < n) {
    var x = n - a;
    s = this._subtractMinutesUntilHourStart(i, x), a += s.added, i = s.end;
  }
  return i;
}, _calculateMinuteEndDate: function(t, n, e) {
  var i = new Date(t), a = 0;
  e = e || 1, n = Math.abs(1 * n), n = Math.round(n);
  var r = this._addMinutesUntilHourEnd(i, n);
  a += r.added, i = r.end;
  for (var s = 0, o = [], l = 0, d = this._isMinutePrecision(i); a < n; ) {
    var u = this.$gantt.date.day_start(new Date(i)).valueOf();
    u !== s && (o = this._getWorkHours(i), l = this._getMinutesPerDay(i), s = u);
    var c = n - a, h = this._getTimeOfDayStamp(i);
    if (o.length && l) if (o[0].start >= h && c >= l) {
      if (a += l, c == l) {
        i = new Date(i.getFullYear(), i.getMonth(), i.getDate(), 0, 0, o[o.length - 1].end);
        break;
      }
      i = this.$gantt.date.add(i, 1, "day"), i = this.$gantt.date.day_start(i);
    } else {
      for (var _ = !1, f = null, v = 0; v < o.length; v++) if (o[v].start <= h && o[v].end > h) {
        _ = !0, f = o[v];
        break;
      }
      if (_) if (h === f.start && c >= f.durationMinutes) a += f.durationMinutes, i = this.$gantt.date.add(i, f.durationMinutes, "minute");
      else if (c <= f.endMinute - h / 60) a += c, i = this.$gantt.date.add(i, c, "minute");
      else {
        var k = this._getMinutesPerHour(i);
        k <= c ? (a += k, i = d ? this.$gantt.date.add(i, k, "minute") : this._nextDate(i, "hour", e)) : (a += (r = this._addMinutesUntilHourEnd(i, c)).added, i = r.end);
      }
      else i = this._getClosestWorkTimeFuture(i, "hour");
    }
    else i = this.$gantt.date.add(this.$gantt.date.day_start(i), 1, "day");
  }
  if (a < n) {
    var b = n - a;
    a += (r = this._addMinutesUntilHourEnd(i, b)).added, i = r.end;
  }
  return i;
}, getClosestWorkTime: function() {
  var t = this.argumentsHelper.getClosestWorkTimeArguments.apply(this.argumentsHelper, arguments);
  return this._getClosestWorkTime(t.date, t.unit, t.dir);
}, _getClosestWorkTime: function(t, n, e) {
  var i = new Date(t);
  if (this._isWorkTime(i, n)) return i;
  if (i = this.$gantt.date[n + "_start"](i), e != "any" && e) i = e == "past" ? this._getClosestWorkTimePast(i, n) : this._getClosestWorkTimeFuture(i, n);
  else {
    var a = this._getClosestWorkTimeFuture(i, n), r = this._getClosestWorkTimePast(i, n);
    i = Math.abs(a - t) <= Math.abs(t - r) ? a : r;
  }
  return i;
}, _getClosestWorkTimeFuture: function(t, n) {
  return this._getClosestWorkTimeGeneric(t, n, 1);
}, _getClosestWorkTimePast: function(t, n) {
  var e = this._getClosestWorkTimeGeneric(t, n, -1);
  return this.$gantt.date.add(e, 1, n);
}, _findClosestTimeInDay: function(t, n, e) {
  var i = new Date(t), a = null, r = !1;
  this._getWorkHours(i).length || (i = this._getClosestWorkTime(i, "day", n < 0 ? "past" : "future"), n < 0 && (i = new Date(i.valueOf() - 1), r = !0), e = this._getWorkHours(i));
  var s = this._getTimeOfDayStamp(i);
  if (r && (s = this._getTimeOfDayStamp(new Date(i.valueOf() + 1), r)), n > 0) {
    for (var o = 0; o < e.length; o++) if (e[o].start >= s) {
      a = new Date(i.getFullYear(), i.getMonth(), i.getDate(), 0, 0, e[o].start);
      break;
    }
  } else for (o = e.length - 1; o >= 0; o--) {
    if (e[o].end <= s) {
      a = new Date(i.getFullYear(), i.getMonth(), i.getDate(), 0, 0, e[o].end);
      break;
    }
    if (e[o].end > s && e[o].start <= s) {
      a = new Date(i.getFullYear(), i.getMonth(), i.getDate(), 0, 0, s);
      break;
    }
  }
  return a;
}, _getClosestWorkMinute: function(t, n, e) {
  var i = new Date(t), a = this._getWorkHours(i), r = this._findClosestTimeInDay(i, e, a);
  return r || (e > 0 ? (i = this.calculateEndDate(i, e, n), i = this.$gantt.date.day_start(i)) : (i = this.calculateEndDate(i, e, "day"), i = this.$gantt.date.day_start(i), i = this.$gantt.date.add(i, 1, "day"), i = new Date(i.valueOf() - 1)), a = this._getWorkHours(i), r = this._findClosestTimeInDay(i, e, a)), e < 0 && (r = this.$gantt.date.add(r, -1, n)), r;
}, _getClosestWorkTimeGeneric: function(t, n, e) {
  if (n === "hour" || n === "minute") return this._getClosestWorkMinute(t, n, e);
  for (var i = this._getUnitOrder(n), a = this.units[i - 1], r = t, s = 0; !this._isWorkTime(r, n) && (!a || this._isWorkTime(r, a) || (r = e > 0 ? this._getClosestWorkTimeFuture(r, a) : this._getClosestWorkTimePast(r, a), !this._isWorkTime(r, n))); ) {
    if (++s > 3e3) return this.$gantt.assert(!1, "Invalid working time check"), !1;
    var o = r.getTimezoneOffset();
    r = this.$gantt.date.add(r, e, n), r = this.$gantt._correct_dst_change(r, o, e, n), this.$gantt.date[n + "_start"] && (r = this.$gantt.date[n + "_start"](r));
  }
  return r;
}, hasWorkTime: function() {
  var t = this.getConfig(), n = t.dates;
  for (var e in t.dates) ;
  var i = this._checkWorkHours(t.hours), a = !1;
  return [0, 1, 2, 3, 4, 5, 6].forEach((function(r) {
    if (!a) {
      var s = n[r];
      s === !0 ? a = i : Array.isArray(s) && (a = this._checkWorkHours(s));
    }
  }).bind(this)), a;
}, _checkWorkHours: function(t) {
  if (t.length === 0) return !1;
  for (var n = !1, e = 0; e < t.length; e += 2) t[e] !== t[e + 1] && (n = !0);
  return n;
}, _isMinutePrecision: function(t) {
  let n = !1;
  return this._getWorkHours(t).forEach(function(e) {
    (e.startMinute % 60 || e.endMinute % 60) && (n = !0);
  }), n;
} };
const zt = { isLegacyResourceCalendarFormat: function(t) {
  if (!t) return !1;
  for (var n in t) if (t[n] && typeof t[n] == "object") return !0;
  return !1;
}, getResourceProperty: function(t) {
  var n = t.resource_calendars, e = t.resource_property;
  if (this.isLegacyResourceCalendarFormat(n)) for (var i in t) {
    e = i;
    break;
  }
  return e;
}, getCalendarIdFromLegacyConfig: function(t, n) {
  if (n) for (var e in n) {
    var i = n[e];
    if (t[e]) {
      var a = i[t[e]];
      if (a) return a;
    }
  }
  return null;
} }, la = (Kt = {}, { getCalendarIdFromMultipleResources: function(t, n) {
  var e = function(a) {
    return a.map(function(r) {
      return r && r.resource_id ? r.resource_id : r;
    }).sort().join("-");
  }(t);
  if (t.length) {
    if (t.length === 1) return n.getResourceCalendar(e).id;
    if (Kt[e]) return Kt[e].id;
    var i = function(a, r) {
      return r.mergeCalendars(a.map(function(s) {
        var o = s && s.resource_id ? s.resource_id : s;
        return r.getResourceCalendar(o);
      }));
    }(t, n);
    return Kt[e] = i, n.addCalendar(i);
  }
  return null;
} });
var Kt;
function Jn(t) {
  this.$gantt = t, this._calendars = {}, this._legacyConfig = void 0, this.$gantt.attachEvent("onGanttReady", (function() {
    this.$gantt.config.resource_calendars && (this._isLegacyConfig = zt.isLegacyResourceCalendarFormat(this.$gantt.config.resource_calendars));
  }).bind(this)), this.$gantt.attachEvent("onBeforeGanttReady", (function() {
    this.createDefaultCalendars();
  }).bind(this)), this.$gantt.attachEvent("onBeforeGanttRender", (function() {
    this.createDefaultCalendars();
  }).bind(this));
}
function He(t, n) {
  this.argumentsHelper = n, this.$gantt = t;
}
function Kn(t) {
  this.$gantt = t.$gantt, this.argumentsHelper = qn(this.$gantt), this.calendarManager = t, this.$disabledCalendar = new He(this.$gantt, this.argumentsHelper);
}
Jn.prototype = { _calendars: {}, _convertWorkTimeSettings: function(t) {
  const n = t.days;
  if (typeof n != "object" || Array.isArray(n) || n === null) {
    if (n && !t.dates) {
      t.dates = t.dates || {};
      for (let e = 0; e < n.length; e++) t.dates[e] = n[e], n[e] instanceof Array || (t.dates[e] = !!n[e]);
    }
  } else {
    const e = {};
    if (n != null && n.weekdays) for (let i = 0; i < 7; i++) e[i] = n.weekdays[i];
    n != null && n.dates && Object.entries(n.dates).forEach(([i, a]) => {
      e[new Date(i).valueOf()] = a;
    }), Object.entries(e).forEach(([i, a]) => {
      a instanceof Array || (e[i] = !!a);
    }), t = { ...t, dates: e };
  }
  return delete t.days, t;
}, mergeCalendars: function() {
  var t = [], n = arguments;
  if (Array.isArray(n[0])) t = n[0].slice();
  else for (var e = 0; e < arguments.length; e++) t.push(arguments[e]);
  var i, a = new Yn();
  return t.forEach((function(r) {
    i = i ? this._createCalendarFromConfig(a.merge(i, r)) : r;
  }).bind(this)), this.createCalendar(i);
}, _createCalendarFromConfig: function(t) {
  var n = new Re(this.$gantt, qn(this.$gantt));
  n.id = String(ut());
  var e = this._convertWorkTimeSettings(t);
  if (e.customWeeks) for (var i in e.customWeeks) e.customWeeks[i] = this._convertWorkTimeSettings(e.customWeeks[i]);
  return n._setConfig(e), n;
}, createCalendar: function(t) {
  var n;
  return t || (t = {}), H(n = t.getConfig ? J(t.getConfig()) : t.worktime ? J(t.worktime) : J(t), J(this.defaults.fulltime.worktime)), this._createCalendarFromConfig(n);
}, getCalendar: function(t) {
  t = t || "global";
  var n = this._calendars[t];
  return n || (this.createDefaultCalendars(), n = this._calendars[t]), n;
}, getCalendars: function() {
  var t = [];
  for (var n in this._calendars) t.push(this.getCalendar(n));
  return t;
}, _getOwnCalendar: function(t) {
  var n = this.$gantt.config;
  if (t[n.calendar_property]) return this.getCalendar(t[n.calendar_property]);
  if (n.resource_calendars) {
    var e;
    if (e = this._legacyConfig === !1 ? n.resource_property : zt.getResourceProperty(n), Array.isArray(t[e]) && t[e].length) n.dynamic_resource_calendars ? i = la.getCalendarIdFromMultipleResources(t[e], this) : a = this.getResourceCalendar(t[e]);
    else if (this._legacyConfig === void 0 && (this._legacyConfig = zt.isLegacyResourceCalendarFormat(n.resource_calendars)), this._legacyConfig) var i = zt.getCalendarIdFromLegacyConfig(t, n.resource_calendars);
    else if (e && t[e] && n.resource_calendars[t[e]]) var a = this.getResourceCalendar(t[e]);
    if (i && (a = this.getCalendar(i)), a) return a;
  }
  return null;
}, getResourceCalendar: function(t) {
  if (t == null) return this.getCalendar();
  var n = null;
  n = typeof t == "number" || typeof t == "string" ? t : t.id || t.key;
  var e = this.$gantt.config, i = e.resource_calendars, a = null;
  if (Array.isArray(t) && t.length === 1 && (n = typeof t[0] == "object" ? t[0].resource_id : t[0]), i) {
    if (this._legacyConfig === void 0 && (this._legacyConfig = zt.isLegacyResourceCalendarFormat(e.resource_calendars)), this._legacyConfig) {
      for (var r in i) if (i[r][n]) {
        a = i[r][n];
        break;
      }
    } else a = i[n];
    if (a) return this.getCalendar(a);
  }
  return this.getCalendar();
}, getTaskCalendar: function(t) {
  var n, e = this.$gantt;
  if (t == null) return this.getCalendar();
  if (!(n = typeof t != "number" && typeof t != "string" || !e.isTaskExists(t) ? t : e.getTask(t))) return this.getCalendar();
  var i = this._getOwnCalendar(n), a = !!e.getState().group_mode;
  if (!i && e.config.inherit_calendar && e.isTaskExists(n.parent)) {
    for (var r = n; e.isTaskExists(r.parent) && (r = e.getTask(r.parent), !e.isSummaryTask(r) || !(i = this._getOwnCalendar(r))); ) ;
    a && !i && t.$effective_calendar && (i = this.getCalendar(t.$effective_calendar));
  }
  return i || this.getCalendar();
}, addCalendar: function(t) {
  if (!this.isCalendar(t)) {
    var n = t.id;
    (t = this.createCalendar(t)).id = n;
  }
  if (t._tryChangeCalendarSettings(function() {
  })) {
    var e = this.$gantt.config;
    return t.id = t.id || ut(), this._calendars[t.id] = t, e.worktimes || (e.worktimes = {}), e.worktimes[t.id] = t.getConfig(), t.id;
  }
  return this.$gantt.callEvent("onCalendarError", [{ message: "Invalid calendar settings, no worktime available" }, t]), null;
}, deleteCalendar: function(t) {
  var n = this.$gantt.config;
  return !!t && !!this._calendars[t] && (delete this._calendars[t], n.worktimes && n.worktimes[t] && delete n.worktimes[t], !0);
}, restoreConfigCalendars: function(t) {
  for (var n in t) if (!this._calendars[n]) {
    var e = t[n], i = this.createCalendar(e);
    i.id = n, this.addCalendar(i);
  }
}, defaults: { global: { id: "global", worktime: { hours: [8, 12, 13, 17], days: [0, 1, 1, 1, 1, 1, 0] } }, fulltime: { id: "fulltime", worktime: { hours: [0, 24], days: [1, 1, 1, 1, 1, 1, 1] } } }, createDefaultCalendars: function() {
  var t = this.$gantt.config;
  this.restoreConfigCalendars(this.defaults), this.restoreConfigCalendars(t.worktimes);
}, isCalendar: function(t) {
  return [t.isWorkTime, t.setWorkTime, t.getWorkHours, t.unsetWorkTime, t.getClosestWorkTime, t.calculateDuration, t.hasDuration, t.calculateEndDate].every(function(n) {
    return n instanceof Function;
  });
} }, He.prototype = { getWorkHours: function() {
  return [0, 24];
}, setWorkTime: function() {
  return !0;
}, unsetWorkTime: function() {
  return !0;
}, isWorkTime: function() {
  return !0;
}, getClosestWorkTime: function(t) {
  return this.argumentsHelper.getClosestWorkTimeArguments.apply(this.argumentsHelper, arguments).date;
}, calculateDuration: function() {
  var t = this.argumentsHelper.getDurationArguments.apply(this.argumentsHelper, arguments), n = t.start_date, e = t.end_date, i = t.unit, a = t.step;
  return this._calculateDuration(n, e, i, a);
}, _calculateDuration: function(t, n, e, i) {
  var a = this.$gantt.date, r = { week: 6048e5, day: 864e5, hour: 36e5, minute: 6e4 }, s = 0;
  if (r[e]) s = Math.round((n - t) / (i * r[e]));
  else {
    for (var o = new Date(t), l = new Date(n); o.valueOf() < l.valueOf(); ) s += 1, o = a.add(o, i, e);
    o.valueOf() != n.valueOf() && (s += (l - o) / (a.add(o, i, e) - o));
  }
  return Math.round(s);
}, hasDuration: function() {
  var t = this.argumentsHelper.getDurationArguments.apply(this.argumentsHelper, arguments), n = t.start_date, e = t.end_date;
  return !!t.unit && (n = new Date(n), e = new Date(e), n.valueOf() < e.valueOf());
}, hasWorkTime: function() {
  return !0;
}, equals: function(t) {
  return t instanceof He;
}, calculateEndDate: function() {
  var t = this.argumentsHelper.calculateEndDateArguments.apply(this.argumentsHelper, arguments), n = t.start_date, e = t.duration, i = t.unit, a = t.step;
  return this.$gantt.date.add(n, a * e, i);
} }, Kn.prototype = { _getCalendar: function(t) {
  var n;
  if (this.$gantt.config.work_time) {
    var e = this.calendarManager;
    t.task ? n = e.getTaskCalendar(t.task) : t.id ? n = e.getTaskCalendar(t) : t.calendar && (n = t.calendar), n || (n = e.getTaskCalendar());
  } else n = this.$disabledCalendar;
  return n;
}, getWorkHours: function(t) {
  return t = this.argumentsHelper.getWorkHoursArguments.apply(this.argumentsHelper, arguments), this._getCalendar(t).getWorkHours(t.date);
}, setWorkTime: function(t, n) {
  return t = this.argumentsHelper.setWorkTimeArguments.apply(this.argumentsHelper, arguments), n || (n = this.calendarManager.getCalendar()), n.setWorkTime(t);
}, unsetWorkTime: function(t, n) {
  return t = this.argumentsHelper.unsetWorkTimeArguments.apply(this.argumentsHelper, arguments), n || (n = this.calendarManager.getCalendar()), n.unsetWorkTime(t);
}, isWorkTime: function(t, n, e, i) {
  var a = this.argumentsHelper.isWorkTimeArguments.apply(this.argumentsHelper, arguments);
  return (i = this._getCalendar(a)).isWorkTime(a);
}, getClosestWorkTime: function(t) {
  return t = this.argumentsHelper.getClosestWorkTimeArguments.apply(this.argumentsHelper, arguments), this._getCalendar(t).getClosestWorkTime(t);
}, calculateDuration: function() {
  var t = this.argumentsHelper.getDurationArguments.apply(this.argumentsHelper, arguments);
  return this._getCalendar(t).calculateDuration(t);
}, hasDuration: function() {
  var t = this.argumentsHelper.hasDurationArguments.apply(this.argumentsHelper, arguments);
  return this._getCalendar(t).hasDuration(t);
}, calculateEndDate: function(t) {
  return t = this.argumentsHelper.calculateEndDateArguments.apply(this.argumentsHelper, arguments), this._getCalendar(t).calculateEndDate(t);
} };
const da = function(t, n) {
  return { getWorkHours: function(e) {
    return n.getWorkHours(e);
  }, setWorkTime: function(e) {
    return n.setWorkTime(e);
  }, unsetWorkTime: function(e) {
    n.unsetWorkTime(e);
  }, isWorkTime: function(e, i, a) {
    return n.isWorkTime(e, i, a);
  }, getClosestWorkTime: function(e) {
    return n.getClosestWorkTime(e);
  }, calculateDuration: function(e, i, a) {
    return n.calculateDuration(e, i, a);
  }, _hasDuration: function(e, i, a) {
    return n.hasDuration(e, i, a);
  }, calculateEndDate: function(e, i, a, r) {
    return n.calculateEndDate(e, i, a, r);
  }, mergeCalendars: j(t.mergeCalendars, t), createCalendar: j(t.createCalendar, t), addCalendar: j(t.addCalendar, t), getCalendar: j(t.getCalendar, t), getCalendars: j(t.getCalendars, t), getResourceCalendar: j(t.getResourceCalendar, t), getTaskCalendar: j(t.getTaskCalendar, t), deleteCalendar: j(t.deleteCalendar, t) };
};
function ca(t) {
  t.isUnscheduledTask = function(s) {
    return t.assert(s && s instanceof Object, "Invalid argument <b>task</b>=" + s + " of gantt.isUnscheduledTask. Task object was expected"), !!s.unscheduled || !s.start_date;
  }, t._isAllowedUnscheduledTask = function(s) {
    return !(!s.unscheduled || !t.config.show_unscheduled);
  }, t._isTaskInTimelineLimits = function(s) {
    var o = s.start_date ? s.start_date.valueOf() : null, l = s.end_date ? s.end_date.valueOf() : null;
    return !!(o && l && o <= this._max_date.valueOf() && l >= this._min_date.valueOf());
  }, t.isTaskVisible = function(s) {
    if (!this.isTaskExists(s)) return !1;
    var o = this.getTask(s);
    return !(!this._isAllowedUnscheduledTask(o) && !this._isTaskInTimelineLimits(o)) && this.getGlobalTaskIndex(s) >= 0;
  }, t._getProjectEnd = function() {
    if (t.config.project_end) return t.config.project_end;
    var s = t.getTaskByTime();
    return (s = s.sort(function(o, l) {
      return +o.end_date > +l.end_date ? 1 : -1;
    })).length ? s[s.length - 1].end_date : null;
  }, t._getProjectStart = function() {
    if (t.config.project_start) return t.config.project_start;
    if (t.config.start_date) return t.config.start_date;
    if (t.getState().min_date) return t.getState().min_date;
    var s = t.getTaskByTime();
    return (s = s.sort(function(o, l) {
      return +o.start_date > +l.start_date ? 1 : -1;
    })).length ? s[0].start_date : null;
  };
  var n = function(s, o) {
    var l = !!(o && o != t.config.root_id && t.isTaskExists(o)) && t.getTask(o), d = null;
    if (l) if (t._getAutoSchedulingConfig().schedule_from_end) d = t.calculateEndDate({ start_date: l.end_date, duration: -t.config.duration_step, task: s });
    else {
      if (!l.start_date) return n(l, t.getParent(l));
      d = l.start_date;
    }
    else if (t._getAutoSchedulingConfig().schedule_from_end) d = t.calculateEndDate({ start_date: t._getProjectEnd(), duration: -t.config.duration_step, task: s });
    else {
      const u = t.getTaskByIndex(0), c = t.config.start_date || t.getState().min_date;
      d = u ? u.start_date ? u.start_date : u.end_date ? t.calculateEndDate({ start_date: u.end_date, duration: -t.config.duration_step, task: s }) : c : c;
    }
    return t.assert(d, "Invalid dates"), new Date(d);
  };
  t._set_default_task_timing = function(s) {
    s.start_date = s.start_date || n(s, t.getParent(s)), s.duration = s.duration || t.config.duration_step, s.end_date = s.end_date || t.calculateEndDate(s);
  }, t.createTask = function(s, o, l) {
    if (s = s || {}, t.defined(s.id) || (s.id = t.uid()), s.start_date || (s.start_date = n(s, o)), s.text === void 0 && (s.text = t.locale.labels.new_task), s.duration === void 0 && (s.duration = 1), this.isTaskExists(o)) {
      this.setParent(s, o, !0);
      var d = this.getTask(o);
      d.$open = !0, this.config.details_on_create || this.callEvent("onAfterParentExpand", [o, d]);
    }
    return this.callEvent("onTaskCreated", [s]) ? (this.config.details_on_create ? (t.isTaskExists(s.id) ? t.getTask(s.id).$index != s.$index && (s.start_date && typeof s.start_date == "string" && (s.start_date = this.date.parseDate(s.start_date, "parse_date")), s.end_date && typeof s.end_date == "string" && (s.end_date = this.date.parseDate(s.end_date, "parse_date")), this.$data.tasksStore.updateItem(s.id, s)) : (s.$new = !0, this.silent(function() {
      t.$data.tasksStore.addItem(s, l);
    })), this.selectTask(s.id), this.refreshData(), this.showLightbox(s.id)) : this.addTask(s, o, l) && (this.showTask(s.id), this.selectTask(s.id)), s.id) : null;
  }, t._update_flags = function(s, o) {
    var l = t.$data.tasksStore;
    s === void 0 ? (this._lightbox_id = null, l.silent(function() {
      l.unselect();
    }), this.getSelectedTasks && this._multiselect.reset(), this._tasks_dnd && this._tasks_dnd.drag && (this._tasks_dnd.drag.id = null)) : (this._lightbox_id == s && (this._lightbox_id = o), l.getSelectedId() == s && l.silent(function() {
      l.unselect(s), l.select(o);
    }), this._tasks_dnd && this._tasks_dnd.drag && this._tasks_dnd.drag.id == s && (this._tasks_dnd.drag.id = o));
  };
  var e = function(s, o) {
    var l = t.getTaskType(s.type), d = { type: l, $no_start: !1, $no_end: !1, scheduled_summary: !1 };
    return l === t.config.types.project && s.auto_scheduling === !1 && (d.scheduled_summary = !0), o || l != s.$rendered_type ? (l == t.config.types.project ? d.$no_end = d.$no_start = !0 : l != t.config.types.milestone && (d.$no_end = !(s.end_date || s.duration), d.$no_start = !s.start_date, t._isAllowedUnscheduledTask(s) && (d.$no_end = d.$no_start = !1)), d) : (d.$no_start = s.$no_start, d.$no_end = s.$no_end, d);
  };
  function i(s) {
    s.$effective_calendar = t.getTaskCalendar(s).id, s.start_date = t.getClosestWorkTime({ dir: "future", date: s.start_date, unit: t.config.duration_unit, task: s }), s.end_date = t.calculateEndDate(s);
  }
  function a(s, o, l, d) {
    const u = { start: "start_date", end: "end_date" }, c = { start: "$auto_start_date", end: "$auto_end_date" };
    let h;
    h = s.type === t.config.types.project && s.auto_scheduling === !1 ? c : u, o.$no_start && (s[h.start] = l ? new Date(l) : n(s, this.getParent(s))), o.$no_end && (s[h.end] = d ? new Date(d) : this.calculateEndDate({ start_date: s[h.start], duration: this.config.duration_step, task: s })), (o.$no_start || o.$no_end) && this._init_task_timing(s);
  }
  function r(s) {
    let o = null, l = null, d = s !== void 0 ? s : t.config.root_id;
    const u = [], c = [];
    let h = null;
    return t.isTaskExists(d) && (h = t.getTask(d)), t.eachTask(function(_) {
      const f = t.getTaskType(_.type) == t.config.types.project && _.auto_scheduling === !1;
      t.getTaskType(_.type) == t.config.types.project && !f || t.isUnscheduledTask(_) || (_.rollup && u.push(_.id), !_.start_date || _.$no_start && !f || o && !(o > _.start_date.valueOf()) || (o = _.start_date.valueOf()), !_.end_date || _.$no_end && !f || l && !(l < _.end_date.valueOf()) || (l = _.end_date.valueOf()), h && h.render == "split" && (_.split_placement === "inline" ? c.push(_) : _.split_placement === "subrow" || h.$open && t.config.open_split_tasks || c.push(_)));
    }, d), { start_date: o ? new Date(o) : null, end_date: l ? new Date(l) : null, rollup: u, splitItems: c };
  }
  t._init_task_timing = function(s) {
    var o = e(s, !0), l = s.$rendered_type != o.type, d = o.type;
    l && (s.$no_start = o.$no_start, s.$no_end = o.$no_end, s.$rendered_type = o.type), l && d != this.config.types.milestone && d == this.config.types.project && (this._set_default_task_timing(s), s.$calculate_duration = !1), d == this.config.types.milestone && (s.end_date = s.start_date), s.start_date && s.end_date && s.$calculate_duration !== !1 && (s.duration = this.calculateDuration(s)), s.$calculate_duration || (s.$calculate_duration = !0), s.end_date || (s.end_date = s.start_date), s.duration = s.duration || 0, this.config.min_duration === 0 && s.duration === 0 && (s.$no_end = !1, s.type === t.config.types.project && t.hasChild(s.id) && (s.$no_end = !0));
    var u = this.getTaskCalendar(s);
    s.$effective_calendar && s.$effective_calendar !== u.id && (i(s), this.config.inherit_calendar && this.isSummaryTask(s) && this.eachTask(function(c) {
      i(c);
    }, s.id)), s.$effective_calendar = u.id;
  }, t.isSummaryTask = function(s) {
    t.assert(s && s instanceof Object, "Invalid argument <b>task</b>=" + s + " of gantt.isSummaryTask. Task object was expected");
    var o = e(s);
    return !(!o.$no_end && !o.$no_start);
  }, t.resetProjectDates = function(s) {
    var o = e(s);
    if (o.$no_end || o.$no_start) {
      var l = r(s.id);
      a.call(this, s, o, l.start_date, l.end_date), s.$rollup = l.rollup, s.$inlineSplit = l.splitItems;
    }
  }, t.getSubtaskDuration = function(s) {
    var o = 0, l = s !== void 0 ? s : t.config.root_id;
    return this.eachTask(function(d) {
      this.getTaskType(d.type) == t.config.types.project || this.isUnscheduledTask(d) || (o += d.duration);
    }, l), o;
  }, t.getSubtaskDates = function(s) {
    var o = r(s);
    return { start_date: o.start_date, end_date: o.end_date };
  }, t._update_parents = function(s, o, l) {
    if (s) {
      var d = this.getTask(s);
      d.rollup && (l = !0);
      var u = this.getParent(d), c = e(d), h = !0;
      if (l || d.start_date && d.end_date && (c.$no_start || c.$no_end)) {
        const v = d.$auto_start_date ? "$auto_start_date" : "start_date", k = d.$auto_end_date ? "$auto_end_date" : "end_date";
        var _ = d[v].valueOf(), f = d[k].valueOf();
        t.resetProjectDates(d), l || _ != d[v].valueOf() || f != d[k].valueOf() || (h = !1), h && !o && this.refreshTask(d.id, !0), c.scheduled_summary && (h = !0);
      }
      h && u && this.isTaskExists(u) && this._update_parents(u, o, l);
    }
  }, t.roundDate = function(s) {
    var o = t.getScale();
    at(s) && (s = { date: s, unit: o ? o.unit : t.config.duration_unit, step: o ? o.step : t.config.duration_step });
    var l, d, u, c = s.date, h = s.step, _ = s.unit;
    if (!o) return c;
    if (_ == o.unit && h == o.step && +c >= +o.min_date && +c <= +o.max_date) u = Math.floor(t.columnIndexByDate(c)), o.trace_x[u] || (u -= 1, o.rtl && (u = 0)), d = new Date(o.trace_x[u]), l = t.date.add(d, h, _);
    else {
      for (u = Math.floor(t.columnIndexByDate(c)), l = t.date[_ + "_start"](new Date(o.min_date)), o.trace_x[u] && (l = t.date[_ + "_start"](o.trace_x[u])); +l < +c; ) {
        var f = (l = t.date[_ + "_start"](t.date.add(l, h, _))).getTimezoneOffset();
        l = t._correct_dst_change(l, f, l, _), t.date[_ + "_start"] && (l = t.date[_ + "_start"](l));
      }
      d = t.date.add(l, -1 * h, _);
    }
    return s.dir && s.dir == "future" ? l : s.dir && s.dir == "past" || Math.abs(c - d) < Math.abs(l - c) ? d : l;
  }, t.correctTaskWorkTime = function(s) {
    t.config.work_time && t.config.correct_work_time && (this.isWorkTime(s.start_date, void 0, s) ? this.isWorkTime(new Date(+s.end_date - 1), void 0, s) || (s.end_date = this.calculateEndDate(s)) : (s.start_date = this.getClosestWorkTime({ date: s.start_date, dir: "future", task: s }), s.end_date = this.calculateEndDate(s)));
  }, t.attachEvent("onBeforeTaskUpdate", function(s, o) {
    return t._init_task_timing(o), !0;
  }), t.attachEvent("onBeforeTaskAdd", function(s, o) {
    return t._init_task_timing(o), !0;
  }), t.attachEvent("onAfterTaskMove", function(s, o, l) {
    return t._init_task_timing(t.getTask(s)), !0;
  });
}
function _n(t, n) {
  var e, i = t.config.container_resize_timeout || 20;
  let a = gn(t);
  if (t.config.container_resize_method == "timeout") l();
  else try {
    t.event(n, "resize", function() {
      if (t.$scrollbarRepaint) t.$scrollbarRepaint = null;
      else {
        let d = gn(t);
        if (a.x == d.x && a.y == d.y) return;
        a = d, r();
      }
    });
  } catch {
    l();
  }
  function r() {
    clearTimeout(e), e = setTimeout(function() {
      t.$destroyed || t.render();
    }, i);
  }
  var s = t.$root.offsetHeight, o = t.$root.offsetWidth;
  function l() {
    t.$root.offsetHeight == s && t.$root.offsetWidth == o || r(), s = t.$root.offsetHeight, o = t.$root.offsetWidth, setTimeout(l, i);
  }
}
function gn(t) {
  return { x: t.$root.offsetWidth, y: t.$root.offsetHeight };
}
function ua(t) {
  t.assert = /* @__PURE__ */ function(r) {
    return function(s, o) {
      s || r.config.show_errors && r.callEvent("onError", [o]) !== !1 && (r.message ? r.message({ type: "error", text: o, expire: -1 }) : console.log(o));
    };
  }(t);
  var n = "Invalid value of the first argument of `gantt.init`. Supported values: HTMLElement, String (element id).This error means that either invalid object is passed into `gantt.init` or that the element with the specified ID doesn't exist on the page when `gantt.init` is called.";
  function e(r) {
    if (!r || typeof r == "string" && document.getElementById(r) || function(s) {
      try {
        s.cloneNode(!1);
      } catch {
        return !1;
      }
      return !0;
    }(r)) return !0;
    throw t.assert(!1, n), new Error(n);
  }
  t.init = function(r, s, o) {
    t.env.isNode ? r = null : e(r), s && o && (this.config.start_date = this._min_date = new Date(s), this.config.end_date = this._max_date = new Date(o)), this.date.init(), this.init = function(l) {
      t.env.isNode ? l = null : e(l), this.$container && this.$container.parentNode && (this.$container.parentNode.removeChild(this.$container), this.$container = null), this.$layout && this.$layout.clear(), this._reinit(l);
    }, this._reinit(r);
  }, t._quickRefresh = function(r) {
    for (var s = this._getDatastores.call(this), o = 0; o < s.length; o++) s[o]._quick_refresh = !0;
    for (r(), o = 0; o < s.length; o++) s[o]._quick_refresh = !1;
  };
  var i = (function() {
    this._clearTaskLayers && this._clearTaskLayers(), this._clearLinkLayers && this._clearLinkLayers(), this.$layout && (this.$layout.destructor(), this.$layout = null, this.$ui.reset());
  }).bind(t), a = (function() {
    q(t) || (this.$root.innerHTML = "", this.$root.gantt = this, Ie(this), this.config.layout.id = "main", this.$layout = this.$ui.createView("layout", this.$root, this.config.layout), this.$layout.attachEvent("onBeforeResize", function() {
      for (var r = t.$services.getService("datastores"), s = 0; s < r.length; s++) t.getDatastore(r[s]).filter(), t.$data.tasksStore._skipTaskRecalculation ? t.$data.tasksStore._skipTaskRecalculation != "lightbox" && (t.$data.tasksStore._skipTaskRecalculation = !1) : t.getDatastore(r[s]).callEvent("onBeforeRefreshAll", []);
    }), this.$layout.attachEvent("onResize", function() {
      t._quickRefresh(function() {
        t.refreshData();
      });
    }), this.callEvent("onGanttLayoutReady", []), this.$layout.render(), this.$container = this.$layout.$container.firstChild, function(r) {
      window.getComputedStyle(r.$root).getPropertyValue("position") == "static" && (r.$root.style.position = "relative");
      var s = document.createElement("iframe");
      s.className = "gantt_container_resize_watcher", s.tabIndex = -1, r.config.wai_aria_attributes && (s.setAttribute("role", "none"), s.setAttribute("aria-hidden", !0)), r.env.isSalesforce && (r.config.container_resize_method = "timeout"), r.$root.appendChild(s), s.contentWindow ? _n(r, s.contentWindow) : (r.$root.removeChild(s), _n(r, window));
    }(this));
  }).bind(t);
  t.resetLayout = function() {
    i(), a(), this.render();
  }, t._reinit = function(r) {
    this.callEvent("onBeforeGanttReady", []), this._update_flags(), this.$services.getService("templateLoader").initTemplates(this), i(), this.$root = null, r && (this.$root = We(r), a(), this.$mouseEvents.reset(this.$root), function(s) {
      s.$container && !s.config.autosize && s.$root.offsetHeight < 50 && console.warn(`The Gantt container has a small height, so you cannot see its content. If it is not intended, you need to set the 'height' style rule to the container:
https://docs.dhtmlx.com/gantt/faq.html#theganttchartisntrenderedcorrectly`);
    }(t)), this.callEvent("onTemplatesReady", []), this.callEvent("onGanttReady", []), this.render();
  }, t.$click = { buttons: { edit: function(r) {
    t.isReadonly(t.getTask(r)) || t.showLightbox(r);
  }, delete: function(r) {
    var s = t.getTask(r);
    if (!t.isReadonly(s)) {
      var o = t.locale.labels.confirm_deleting, l = t.locale.labels.confirm_deleting_title;
      t._delete_task_confirm({ task: s, message: o, title: l, callback: function() {
        t.isTaskExists(r) && (s.$new ? (t.$data.tasksStore._skipTaskRecalculation = "lightbox", t.silent(function() {
          t.deleteTask(r, !0);
        }), t.$data.tasksStore._skipTaskRecalculation = !1, t.refreshData()) : (t.$data.tasksStore._skipTaskRecalculation = !0, t.deleteTask(r))), t.hideLightbox();
      } });
    }
  } } }, t.render = function() {
    var r;
    if (this.callEvent("onBeforeGanttRender", []), !q(t)) {
      !this.config.sort && this._sort && (this._sort = void 0), this.$root && (this.config.rtl ? (this.$root.classList.add("gantt_rtl"), this.$root.firstChild.classList.add("gantt_rtl")) : (this.$root.classList.remove("gantt_rtl"), this.$root.firstChild.classList.remove("gantt_rtl")));
      var s = this.getScrollState(), o = s ? s.x : 0;
      this._getHorizontalScrollbar() && (o = this._getHorizontalScrollbar().$config.codeScrollLeft || o || 0), r = null, o && (r = t.dateFromPos(o + this.config.task_scroll_offset));
    }
    if (Ie(this), q(t)) t.refreshData();
    else {
      this.$layout.$config.autosize = this.config.autosize;
      var l = this.config.preserve_scroll;
      if (this.config.preserve_scroll = !1, this.$layout.resize(), this.config.preserve_scroll = l, this.config.preserve_scroll && s) {
        const c = t.ext.zoom._initialized;
        if ((o || s.y) && !c) {
          var d = t.getScrollState();
          if (+r != +t.dateFromPos(d.x) || d.y != s.y) {
            o = null;
            var u = null;
            r && (o = Math.max(t.posFromDate(r) - t.config.task_scroll_offset, 0)), s.y && (u = s.y), t.scrollTo(o, u);
          }
        }
        this.$layout.getScrollbarsInfo().forEach((h) => {
          const _ = t.$ui.getView(h.id), f = t.utils.dom.isChildOf(_.$view, t.$container);
          h.boundViews.forEach((v) => {
            const k = t.$ui.getView(v);
            h.y && h.y != s.y && k && !f && k.scrollTo(void 0, 0), h.x_pos && h.x_pos != s.x && k && k.scrollTo(h.x_pos, void 0);
          });
        });
      }
    }
    this.callEvent("onGanttRender", []);
  }, t.setSizes = t.render, t.getTaskRowNode = function(r) {
    for (var s = this.$grid_data.childNodes, o = this.config.task_attribute, l = 0; l < s.length; l++)
      if (s[l].getAttribute && s[l].getAttribute(o) == r) return s[l];
    return null;
  }, t.changeLightboxType = function(r) {
    if (this.getLightboxType() == r) return !0;
    t._silent_redraw_lightbox(r);
  }, t._get_link_type = function(r, s) {
    var o = null;
    return r && s ? o = t.config.links.start_to_start : !r && s ? o = t.config.links.finish_to_start : r || s ? r && !s && (o = t.config.links.start_to_finish) : o = t.config.links.finish_to_finish, o;
  }, t.isLinkAllowed = function(r, s, o, l) {
    var d = null;
    if (!(d = typeof r == "object" ? r : { source: r, target: s, type: this._get_link_type(o, l) }) || !(d.source && d.target && d.type) || d.source == d.target) return !1;
    var u = !0;
    return this.checkEvent("onLinkValidation") && (u = this.callEvent("onLinkValidation", [d])), u;
  }, t._correct_dst_change = function(r, s, o, l) {
    var d = Zt(l) * o;
    if (d > 3600 && d < 86400) {
      var u = r.getTimezoneOffset() - s;
      u && (r = t.date.add(r, u, "minute"));
    }
    return r;
  }, t.isSplitTask = function(r) {
    return t.assert(r && r instanceof Object, "Invalid argument <b>task</b>=" + r + " of gantt.isSplitTask. Task object was expected"), this.$data.tasksStore._isSplitItem(r);
  }, t._is_icon_open_click = function(r) {
    if (!r) return !1;
    var s = r.target || r.srcElement;
    if (!s || !s.className) return !1;
    var o = it(s);
    return o.indexOf("gantt_tree_icon") !== -1 && (o.indexOf("gantt_close") !== -1 || o.indexOf("gantt_open") !== -1);
  };
}
const ha = { date: { month_full: ["كانون الثاني", "شباط", "آذار", "نيسان", "أيار", "حزيران", "تموز", "آب", "أيلول", "تشرين الأول", "تشرين الثاني", "كانون الأول"], month_short: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"], day_full: ["الأحد", "الأثنين", "ألثلاثاء", "الأربعاء", "ألحميس", "ألجمعة", "السبت"], day_short: ["احد", "اثنين", "ثلاثاء", "اربعاء", "خميس", "جمعة", "سبت"] }, labels: { new_task: "مهمة جديد", icon_save: "اخزن", icon_cancel: "الغاء", icon_details: "تفاصيل", icon_edit: "تحرير", icon_delete: "حذف", confirm_closing: "التغييرات سوف تضيع, هل انت متأكد؟", confirm_deleting: "الحدث سيتم حذفها نهائيا ، هل أنت متأكد؟", section_description: "الوصف", section_time: "الفترة الزمنية", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "الغاء", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, _a = { date: { month_full: ["Студзень", "Люты", "Сакавік", "Красавік", "Maй", "Чэрвень", "Ліпень", "Жнівень", "Верасень", "Кастрычнік", "Лістапад", "Снежань"], month_short: ["Студз", "Лют", "Сак", "Крас", "Maй", "Чэр", "Ліп", "Жнів", "Вер", "Каст", "Ліст", "Снеж"], day_full: ["Нядзеля", "Панядзелак", "Аўторак", "Серада", "Чацвер", "Пятніца", "Субота"], day_short: ["Нд", "Пн", "Аўт", "Ср", "Чцв", "Пт", "Сб"] }, labels: { new_task: "Новае заданне", icon_save: "Захаваць", icon_cancel: "Адмяніць", icon_details: "Дэталі", icon_edit: "Змяніць", icon_delete: "Выдаліць", confirm_closing: "", confirm_deleting: "Падзея будзе выдалена незваротна, працягнуць?", section_description: "Апісанне", section_time: "Перыяд часу", section_type: "Тып", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "ІСР", column_text: "Задача", column_start_date: "Пачатак", column_duration: "Працяг", column_add: "", link: "Сувязь", confirm_link_deleting: "будзе выдалена", link_start: "(пачатак)", link_end: "(канец)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Хвiлiна", hours: "Гадзiна", days: "Дзень", weeks: "Тыдзень", months: "Месяц", years: "Год", message_ok: "OK", message_cancel: "Адмяніць", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, ga = { date: { month_full: ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"], month_short: ["Gen", "Feb", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Des"], day_full: ["Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"], day_short: ["Dg", "Dl", "Dm", "Dc", "Dj", "Dv", "Ds"] }, labels: { new_task: "Nova tasca", icon_save: "Guardar", icon_cancel: "Cancel·lar", icon_details: "Detalls", icon_edit: "Editar", icon_delete: "Esborrar", confirm_closing: "", confirm_deleting: "L'esdeveniment s'esborrarà definitivament, continuar ?", section_description: "Descripció", section_time: "Periode de temps", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "Cancel·lar", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, fa = { date: { month_full: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"], month_short: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"], day_full: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"], day_short: ["日", "一", "二", "三", "四", "五", "六"] }, labels: { new_task: "新任務", icon_save: "保存", icon_cancel: "关闭", icon_details: "详细", icon_edit: "编辑", icon_delete: "删除", confirm_closing: "请确认是否撤销修改!", confirm_deleting: "是否删除日程?", section_description: "描述", section_time: "时间范围", section_type: "类型", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "工作分解结构", column_text: "任务名", column_start_date: "开始时间", column_duration: "持续时间", column_add: "", link: "关联", confirm_link_deleting: "将被删除", link_start: " (开始)", link_end: " (结束)", type_task: "任务", type_project: "项目", type_milestone: "里程碑", minutes: "分钟", hours: "小时", days: "天", weeks: "周", months: "月", years: "年", message_ok: "OK", message_cancel: "关闭", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, pa = { date: { month_full: ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"], month_short: ["Led", "Ún", "Bře", "Dub", "Kvě", "Čer", "Čec", "Srp", "Září", "Říj", "List", "Pro"], day_full: ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"], day_short: ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"] }, labels: { new_task: "Nová práce", icon_save: "Uložit", icon_cancel: "Zpět", icon_details: "Detail", icon_edit: "Edituj", icon_delete: "Smazat", confirm_closing: "", confirm_deleting: "Událost bude trvale smazána, opravdu?", section_description: "Poznámky", section_time: "Doba platnosti", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "Zpět", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, ma = { date: { month_full: ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"], month_short: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"], day_full: ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"], day_short: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"] }, labels: { new_task: "Ny opgave", icon_save: "Gem", icon_cancel: "Fortryd", icon_details: "Detaljer", icon_edit: "Tilret", icon_delete: "Slet", confirm_closing: "Dine rettelser vil gå tabt.. Er dy sikker?", confirm_deleting: "Bigivenheden vil blive slettet permanent. Er du sikker?", section_description: "Beskrivelse", section_time: "Tidsperiode", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "Fortryd", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, va = { date: { month_full: [" Januar", " Februar", " März ", " April", " Mai", " Juni", " Juli", " August", " September ", " Oktober", " November ", " Dezember"], month_short: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"], day_full: ["Sonntag", "Montag", "Dienstag", " Mittwoch", " Donnerstag", "Freitag", "Samstag"], day_short: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"] }, labels: { new_task: "Neue Aufgabe", icon_save: "Speichern", icon_cancel: "Abbrechen", icon_details: "Details", icon_edit: "Ändern", icon_delete: "Löschen", confirm_closing: "", confirm_deleting: "Der Eintrag wird gelöscht", section_description: "Beschreibung", section_time: "Zeitspanne", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "PSP", column_text: "Task-Namen", column_start_date: "Startzeit", column_duration: "Dauer", column_add: "", link: "Link", confirm_link_deleting: "werden gelöscht", link_start: "(starten)", link_end: "(ende)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minuten", hours: "Stunden", days: "Tage", weeks: "Wochen", months: "Monate", years: "Jahre", message_ok: "OK", message_cancel: "Abbrechen", section_constraint: "Regel", constraint_type: "Regel", constraint_date: "Regel - Datum", asap: "So bald wie möglich", alap: "So spät wie möglich", snet: "Beginn nicht vor", snlt: "Beginn nicht später als", fnet: "Fertigstellung nicht vor", fnlt: "Fertigstellung nicht später als", mso: "Muss beginnen am", mfo: "Muss fertig sein am", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, ka = { date: { month_full: ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάϊος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"], month_short: ["ΙΑΝ", "ΦΕΒ", "ΜΑΡ", "ΑΠΡ", "ΜΑΙ", "ΙΟΥΝ", "ΙΟΥΛ", "ΑΥΓ", "ΣΕΠ", "ΟΚΤ", "ΝΟΕ", "ΔΕΚ"], day_full: ["Κυριακή", "Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Κυριακή"], day_short: ["ΚΥ", "ΔΕ", "ΤΡ", "ΤΕ", "ΠΕ", "ΠΑ", "ΣΑ"] }, labels: { new_task: "Νέα εργασία", icon_save: "Αποθήκευση", icon_cancel: "Άκυρο", icon_details: "Λεπτομέρειες", icon_edit: "Επεξεργασία", icon_delete: "Διαγραφή", confirm_closing: "", confirm_deleting: "Το έργο θα διαγραφεί οριστικά. Θέλετε να συνεχίσετε;", section_description: "Περιγραφή", section_time: "Χρονική περίοδος", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "Άκυρο", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, ya = { date: { month_full: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], month_short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], day_full: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], day_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] }, labels: { new_task: "New task", icon_save: "Save", icon_cancel: "Cancel", icon_details: "Details", icon_edit: "Edit", icon_delete: "Delete", confirm_closing: "", confirm_deleting: "Task will be deleted permanently, are you sure?", section_description: "Description", section_time: "Time period", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "Cancel", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, ba = { date: { month_full: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"], month_short: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"], day_full: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"], day_short: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] }, labels: { new_task: "Nueva tarea", icon_save: "Guardar", icon_cancel: "Cancelar", icon_details: "Detalles", icon_edit: "Editar", icon_delete: "Eliminar", confirm_closing: "", confirm_deleting: "El evento se borrará definitivamente, ¿continuar?", section_description: "Descripción", section_time: "Período", section_type: "Tipo", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "EDT", column_text: "Tarea", column_start_date: "Inicio", column_duration: "Duración", column_add: "", link: "Enlace", confirm_link_deleting: "será borrada", link_start: " (inicio)", link_end: " (fin)", type_task: "Tarea", type_project: "Proyecto", type_milestone: "Hito", minutes: "Minutos", hours: "Horas", days: "Días", weeks: "Semanas", months: "Meses", years: "Años", message_ok: "OK", message_cancel: "Cancelar", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, $a = { date: { month_full: ["ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن", "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر"], month_short: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], day_full: ["يکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"], day_short: ["ی", "د", "س", "چ", "پ", "ج", "ش"] }, labels: { new_task: "وظیفه جدید", icon_save: "ذخیره", icon_cancel: "لغو", icon_details: "جزییات", icon_edit: "ویرایش", icon_delete: "حذف", confirm_closing: "تغییرات شما ازدست خواهد رفت، آیا مطمئن هستید؟", confirm_deleting: "این مورد برای همیشه حذف خواهد شد، آیا مطمئن هستید؟", section_description: "توضیحات", section_time: "مدت زمان", section_type: "نوع", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "عنوان", column_start_date: "زمان شروع", column_duration: "مدت", column_add: "", link: "ارتباط", confirm_link_deleting: "حذف خواهد شد", link_start: " (آغاز)", link_end: " (پایان)", type_task: "وظیفه", type_project: "پروژه", type_milestone: "نگارش", minutes: "دقایق", hours: "ساعات", days: "روزها", weeks: "هفته", months: "ماه‌ها", years: "سال‌ها", message_ok: "تایید", message_cancel: "لغو", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, xa = { date: { month_full: ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kes&auml;kuu", "Hein&auml;kuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"], month_short: ["Tam", "Hel", "Maa", "Huh", "Tou", "Kes", "Hei", "Elo", "Syy", "Lok", "Mar", "Jou"], day_full: ["Sunnuntai", "Maanantai", "Tiistai", "Keskiviikko", "Torstai", "Perjantai", "Lauantai"], day_short: ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"] }, labels: { new_task: "Uusi tehtävä", icon_save: "Tallenna", icon_cancel: "Peru", icon_details: "Tiedot", icon_edit: "Muokkaa", icon_delete: "Poista", confirm_closing: "", confirm_deleting: "Haluatko varmasti poistaa tapahtuman?", section_description: "Kuvaus", section_time: "Aikajakso", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "Peru", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, wa = { date: { month_full: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"], month_short: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"], day_full: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"], day_short: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"] }, labels: { new_task: "Nouvelle tâche", icon_save: "Enregistrer", icon_cancel: "Annuler", icon_details: "Détails", icon_edit: "Modifier", icon_delete: "Effacer", confirm_closing: "", confirm_deleting: "L'événement sera effacé sans appel, êtes-vous sûr ?", section_description: "Description", section_time: "Période", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "OTP", column_text: "Nom de la tâche", column_start_date: "Date initiale", column_duration: "Durée", column_add: "", link: "Le lien", confirm_link_deleting: "sera supprimé", link_start: "(début)", link_end: "(fin)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Heures", days: "Jours", weeks: "Semaines", months: "Mois", years: "Années", message_ok: "OK", message_cancel: "Annuler", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Sa = { date: { month_full: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"], month_short: ["ינו", "פבר", "מרץ", "אפר", "מאי", "יונ", "יול", "אוג", "ספט", "אוק", "נוב", "דצמ"], day_full: ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"], day_short: ["א", "ב", "ג", "ד", "ה", "ו", "ש"] }, labels: { new_task: "משימה חדש", icon_save: "שמור", icon_cancel: "בטל", icon_details: "פרטים", icon_edit: "ערוך", icon_delete: "מחק", confirm_closing: "", confirm_deleting: "ארוע ימחק סופית.להמשיך?", section_description: "הסבר", section_time: "תקופה", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "בטל", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Ta = { date: { month_full: ["Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj", "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"], month_short: ["Sij", "Velj", "Ožu", "Tra", "Svi", "Lip", "Srp", "Kol", "Ruj", "Lis", "Stu", "Pro"], day_full: ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"], day_short: ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"] }, labels: { new_task: "Novi Zadatak", icon_save: "Spremi", icon_cancel: "Odustani", icon_details: "Detalji", icon_edit: "Izmjeni", icon_delete: "Obriši", confirm_closing: "", confirm_deleting: "Zadatak će biti trajno izbrisan, jeste li sigurni?", section_description: "Opis", section_time: "Vremenski Period", section_type: "Tip", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Naziv Zadatka", column_start_date: "Početno Vrijeme", column_duration: "Trajanje", column_add: "", link: "Poveznica", confirm_link_deleting: "će biti izbrisan", link_start: " (početak)", link_end: " (kraj)", type_task: "Zadatak", type_project: "Projekt", type_milestone: "Milestone", minutes: "Minute", hours: "Sati", days: "Dani", weeks: "Tjedni", months: "Mjeseci", years: "Godine", message_ok: "OK", message_cancel: "Odustani", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Ca = { date: { month_full: ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"], month_short: ["Jan", "Feb", "Már", "Ápr", "Máj", "Jún", "Júl", "Aug", "Sep", "Okt", "Nov", "Dec"], day_full: ["Vasárnap", "Hétfõ", "Kedd", "Szerda", "Csütörtök", "Péntek", "szombat"], day_short: ["Va", "Hé", "Ke", "Sze", "Csü", "Pé", "Szo"] }, labels: { new_task: "Új feladat", icon_save: "Mentés", icon_cancel: "Mégse", icon_details: "Részletek", icon_edit: "Szerkesztés", icon_delete: "Törlés", confirm_closing: "", confirm_deleting: "Az esemény törölve lesz, biztosan folytatja?", section_description: "Leírás", section_time: "Idõszak", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "Mégse", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Ea = { date: { month_full: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"], month_short: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"], day_full: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"], day_short: ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] }, labels: { new_task: "Tugas baru", icon_save: "Simpan", icon_cancel: "Batal", icon_details: "Detail", icon_edit: "Edit", icon_delete: "Hapus", confirm_closing: "", confirm_deleting: "Acara akan dihapus", section_description: "Keterangan", section_time: "Periode", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "Batal", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Da = { date: { month_full: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"], month_short: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"], day_full: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"], day_short: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"] }, labels: { new_task: "Nuovo compito", icon_save: "Salva", icon_cancel: "Chiudi", icon_details: "Dettagli", icon_edit: "Modifica", icon_delete: "Elimina", confirm_closing: "", confirm_deleting: "Sei sicuro di confermare l'eliminazione?", section_description: "Descrizione", section_time: "Periodo di tempo", section_type: "Tipo", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Nome Attività", column_start_date: "Inizio", column_duration: "Durata", column_add: "", link: "Link", confirm_link_deleting: "sarà eliminato", link_start: " (inizio)", link_end: " (fine)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minuti", hours: "Ore", days: "Giorni", weeks: "Settimane", months: "Mesi", years: "Anni", message_ok: "OK", message_cancel: "Chiudi", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Aa = { date: { month_full: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"], month_short: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"], day_full: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"], day_short: ["日", "月", "火", "水", "木", "金", "土"] }, labels: { new_task: "新しい仕事", icon_save: "保存", icon_cancel: "キャンセル", icon_details: "詳細", icon_edit: "編集", icon_delete: "削除", confirm_closing: "", confirm_deleting: "イベント完全に削除されます、宜しいですか？", section_description: "デスクリプション", section_time: "期間", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "キャンセル", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Ia = { date: { month_full: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"], month_short: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"], day_full: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"], day_short: ["일", "월", "화", "수", "목", "금", "토"] }, labels: { new_task: "이름없는 작업", icon_save: "저장", icon_cancel: "취소", icon_details: "세부 사항", icon_edit: "수정", icon_delete: "삭제", confirm_closing: "", confirm_deleting: "작업을 삭제하시겠습니까?", section_description: "설명", section_time: "기간", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "작업명", column_start_date: "시작일", column_duration: "기간", column_add: "", link: "전제", confirm_link_deleting: "삭제 하시겠습니까?", link_start: " (start)", link_end: " (end)", type_task: "작업", type_project: "프로젝트", type_milestone: "마일스톤", minutes: "분", hours: "시간", days: "일", weeks: "주", months: "달", years: "년", message_ok: "OK", message_cancel: "취소", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } };
class Ma {
  constructor(n) {
    this.addLocale = (e, i) => {
      this._locales[e] = i;
    }, this.getLocale = (e) => this._locales[e], this._locales = {};
    for (const e in n) this._locales[e] = n[e];
  }
}
const La = { date: { month_full: ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"], month_short: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"], day_full: ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"], day_short: ["Søn", "Mon", "Tir", "Ons", "Tor", "Fre", "Lør"] }, labels: { new_task: "Ny oppgave", icon_save: "Lagre", icon_cancel: "Avbryt", icon_details: "Detaljer", icon_edit: "Rediger", icon_delete: "Slett", confirm_closing: "", confirm_deleting: "Hendelsen vil bli slettet permanent. Er du sikker?", section_description: "Beskrivelse", section_time: "Tidsperiode", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "Avbryt", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Na = { date: { month_full: ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"], month_short: ["Jan", "Feb", "mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"], day_full: ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"], day_short: ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"] }, labels: { new_task: "Nieuwe taak", icon_save: "Opslaan", icon_cancel: "Annuleren", icon_details: "Details", icon_edit: "Bewerken", icon_delete: "Verwijderen", confirm_closing: "", confirm_deleting: "Item zal permanent worden verwijderd, doorgaan?", section_description: "Beschrijving", section_time: "Tijd periode", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Taak omschrijving", column_start_date: "Startdatum", column_duration: "Duur", column_add: "", link: "Koppeling", confirm_link_deleting: "zal worden verwijderd", link_start: " (start)", link_end: " (eind)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "minuten", hours: "uren", days: "dagen", weeks: "weken", months: "maanden", years: "jaren", message_ok: "OK", message_cancel: "Annuleren", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Pa = { date: { month_full: ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"], month_short: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"], day_full: ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"], day_short: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"] }, labels: { new_task: "Ny oppgave", icon_save: "Lagre", icon_cancel: "Avbryt", icon_details: "Detaljer", icon_edit: "Endre", icon_delete: "Slett", confirm_closing: "Endringer blir ikke lagret, er du sikker?", confirm_deleting: "Oppføringen vil bli slettet, er du sikker?", section_description: "Beskrivelse", section_time: "Tidsperiode", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "Avbryt", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Ra = { date: { month_full: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"], month_short: ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"], day_full: ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"], day_short: ["Nie", "Pon", "Wto", "Śro", "Czw", "Pią", "Sob"] }, labels: { new_task: "Nowe zadanie", icon_save: "Zapisz", icon_cancel: "Anuluj", icon_details: "Szczegóły", icon_edit: "Edytuj", icon_delete: "Usuń", confirm_closing: "", confirm_deleting: "Zdarzenie zostanie usunięte na zawsze, kontynuować?", section_description: "Opis", section_time: "Okres czasu", section_type: "Typ", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Nazwa zadania", column_start_date: "Początek", column_duration: "Czas trwania", column_add: "", link: "Link", confirm_link_deleting: "zostanie usunięty", link_start: " (początek)", link_end: " (koniec)", type_task: "Zadanie", type_project: "Projekt", type_milestone: "Milestone", minutes: "Minuty", hours: "Godziny", days: "Dni", weeks: "Tydzień", months: "Miesiące", years: "Lata", message_ok: "OK", message_cancel: "Anuluj", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Ha = { date: { month_full: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"], month_short: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"], day_full: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"], day_short: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"] }, labels: { new_task: "Nova tarefa", icon_save: "Salvar", icon_cancel: "Cancelar", icon_details: "Detalhes", icon_edit: "Editar", icon_delete: "Excluir", confirm_closing: "", confirm_deleting: "As tarefas serão excluidas permanentemente, confirme?", section_description: "Descrição", section_time: "Período", section_type: "Tipo", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "EAP", column_text: "Nome tarefa", column_start_date: "Data início", column_duration: "Duração", column_add: "", link: "Link", confirm_link_deleting: "Será excluído!", link_start: " (início)", link_end: " (fim)", type_task: "Task", type_project: "Projeto", type_milestone: "Marco", minutes: "Minutos", hours: "Horas", days: "Dias", weeks: "Semanas", months: "Meses", years: "Anos", message_ok: "OK", message_cancel: "Cancelar", section_constraint: "Restrição", constraint_type: "Tipo Restrição", constraint_date: "Data restrição", asap: "Mais breve possível", alap: "Mais tarde possível", snet: "Não começar antes de", snlt: "Não começar depois de", fnet: "Não terminar antes de", fnlt: "Não terminar depois de", mso: "Precisa começar em", mfo: "Precisa terminar em", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Oa = { date: { month_full: ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie", "Iulie", "August", "Septembrie", "Octombrie", "November", "December"], month_short: ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec"], day_full: ["Duminica", "Luni", "Marti", "Miercuri", "Joi", "Vineri", "Sambata"], day_short: ["Du", "Lu", "Ma", "Mi", "Jo", "Vi", "Sa"] }, labels: { new_task: "Sarcina noua", icon_save: "Salveaza", icon_cancel: "Anuleaza", icon_details: "Detalii", icon_edit: "Editeaza", icon_delete: "Sterge", confirm_closing: "Schimbarile nu vor fi salvate, esti sigur?", confirm_deleting: "Evenimentul va fi sters permanent, esti sigur?", section_description: "Descriere", section_time: "Interval", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "Anuleaza", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Ba = { date: { month_full: ["Январь", "Февраль", "Март", "Апрель", "Maй", "Июнь", "Июль", "Август", "Сентябрь", "Oктябрь", "Ноябрь", "Декабрь"], month_short: ["Янв", "Фев", "Maр", "Aпр", "Maй", "Июн", "Июл", "Aвг", "Сен", "Окт", "Ноя", "Дек"], day_full: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"], day_short: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"] }, labels: { new_task: "Новое задание", icon_save: "Сохранить", icon_cancel: "Отменить", icon_details: "Детали", icon_edit: "Изменить", icon_delete: "Удалить", confirm_closing: "", confirm_deleting: "Событие будет удалено безвозвратно, продолжить?", section_description: "Описание", section_time: "Период времени", section_type: "Тип", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "ИСР", column_text: "Задача", column_start_date: "Начало", column_duration: "Длительность", column_add: "", link: "Связь", confirm_link_deleting: "будет удалена", link_start: " (начало)", link_end: " (конец)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Минута", hours: "Час", days: "День", weeks: "Неделя", months: "Месяц", years: "Год", message_ok: "OK", message_cancel: "Отменить", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, za = { date: { month_full: ["Januar", "Februar", "Marec", "April", "Maj", "Junij", "Julij", "Avgust", "September", "Oktober", "November", "December"], month_short: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"], day_full: ["Nedelja", "Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek", "Sobota"], day_short: ["Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"] }, labels: { new_task: "Nova naloga", icon_save: "Shrani", icon_cancel: "Prekliči", icon_details: "Podrobnosti", icon_edit: "Uredi", icon_delete: "Izbriši", confirm_closing: "", confirm_deleting: "Dogodek bo izbrisan. Želite nadaljevati?", section_description: "Opis", section_time: "Časovni okvir", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "Prekliči", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, ja = { date: { month_full: ["Január", "Február", "Marec", "Apríl", "Máj", "Jún", "Júl", "August", "September", "Október", "November", "December"], month_short: ["Jan", "Feb", "Mar", "Apr", "Máj", "Jún", "Júl", "Aug", "Sept", "Okt", "Nov", "Dec"], day_full: ["Nedeľa", "Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota"], day_short: ["Ne", "Po", "Ut", "St", "Št", "Pi", "So"] }, labels: { new_task: "Nová úloha", icon_save: "Uložiť", icon_cancel: "Späť", icon_details: "Detail", icon_edit: "Edituj", icon_delete: "Zmazať", confirm_closing: "Vaše zmeny nebudú uložené. Skutočne?", confirm_deleting: "Udalosť bude natrvalo vymazaná. Skutočne?", section_description: "Poznámky", section_time: "Doba platnosti", section_type: "Type", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "Späť", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Fa = { date: { month_full: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"], month_short: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"], day_full: ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"], day_short: ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"] }, labels: { new_task: "Ny uppgift", icon_save: "Spara", icon_cancel: "Avbryt", icon_details: "Detajer", icon_edit: "Ändra", icon_delete: "Ta bort", confirm_closing: "", confirm_deleting: "Är du säker på att du vill ta bort händelsen permanent?", section_description: "Beskrivning", section_time: "Tid", section_type: "Typ", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Uppgiftsnamn", column_start_date: "Starttid", column_duration: "Varaktighet", column_add: "", link: "Länk", confirm_link_deleting: "kommer tas bort", link_start: " (start)", link_end: " (slut)", type_task: "Uppgift", type_project: "Projekt", type_milestone: "Milstolpe", minutes: "Minuter", hours: "Timmar", days: "Dagar", weeks: "Veckor", months: "Månader", years: "År", message_ok: "OK", message_cancel: "Avbryt", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Wa = { date: { month_full: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"], month_short: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"], day_full: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"], day_short: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"] }, labels: { new_task: "Yeni görev", icon_save: "Kaydet", icon_cancel: "İptal", icon_details: "Detaylar", icon_edit: "Düzenle", icon_delete: "Sil", confirm_closing: "", confirm_deleting: "Görev silinecek, emin misiniz?", section_description: "Açıklama", section_time: "Zaman Aralığı", section_type: "Tip", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Görev Adı", column_start_date: "Başlangıç", column_duration: "Süre", column_add: "", link: "Bağlantı", confirm_link_deleting: "silinecek", link_start: " (başlangıç)", link_end: " (bitiş)", type_task: "Görev", type_project: "Proje", type_milestone: "Kilometretaşı", minutes: "Dakika", hours: "Saat", days: "Gün", weeks: "Hafta", months: "Ay", years: "Yıl", message_ok: "OK", message_cancel: "Ýptal", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } }, Va = { date: { month_full: ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"], month_short: ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", "Вер", "Жов", "Лис", "Гру"], day_full: ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота"], day_short: ["Нед", "Пон", "Вів", "Сер", "Чет", "Птн", "Суб"] }, labels: { new_task: "Нове завдання", icon_save: "Зберегти", icon_cancel: "Відміна", icon_details: "Деталі", icon_edit: "Редагувати", icon_delete: "Вилучити", confirm_closing: "", confirm_deleting: "Подія вилучиться назавжди. Ви впевнені?", section_description: "Опис", section_time: "Часовий проміжок", section_type: "Тип", section_deadline: "Deadline", section_baselines: "Baselines", section_new_resources: "Resources", column_wbs: "WBS", column_text: "Task name", column_start_date: "Start time", column_duration: "Duration", column_add: "", link: "Link", confirm_link_deleting: "will be deleted", link_start: " (start)", link_end: " (end)", type_task: "Task", type_project: "Project", type_milestone: "Milestone", minutes: "Minutes", hours: "Hours", days: "Days", weeks: "Week", months: "Months", years: "Years", message_ok: "OK", message_cancel: "Відміна", section_constraint: "Constraint", constraint_type: "Constraint type", constraint_date: "Constraint date", asap: "As Soon As Possible", alap: "As Late As Possible", snet: "Start No Earlier Than", snlt: "Start No Later Than", fnet: "Finish No Earlier Than", fnlt: "Finish No Later Than", mso: "Must Start On", mfo: "Must Finish On", resources_add_button: "Add Assignment", resources_filter_placeholder: "Search...", resources_filter_label: "hide empty", resources_section_placeholder: "Nothing assigned yet. Click 'Add Assignment' to assign resources.", empty_state_text_link: "Click here", empty_state_text_description: "to create your first task", baselines_section_placeholder: "Start adding a new baseline", baselines_add_button: "Add Baseline", baselines_remove_button: "Remove", baselines_remove_all_button: "Remove All", deadline_enable_button: "Set", deadline_disable_button: "Remove" } };
function Ua() {
  this.constants = Ci, this.version = "9.1.3", this.license = "individual", this.templates = {}, this.ext = {}, this.keys = { edit_save: this.constants.KEY_CODES.ENTER, edit_cancel: this.constants.KEY_CODES.ESC };
}
function Ga(t) {
  var n = new Ua(), e = new Ei(t), i = {};
  n.plugins = function(l) {
    for (var d in l) if (l[d] && !i[d]) {
      var u = e.getExtension(d);
      u && (u(n), i[d] = !0);
    }
    return i;
  }, n.$services = /* @__PURE__ */ function() {
    var l = {};
    return { services: {}, setService: function(d, u) {
      l[d] = u;
    }, getService: function(d) {
      return l[d] ? l[d]() : null;
    }, dropService: function(d) {
      l[d] && delete l[d];
    }, destructor: function() {
      for (var d in l) if (l[d]) {
        var u = l[d];
        u && u.destructor && u.destructor();
      }
      l = null;
    } };
  }(), n.config = { layout: { css: "gantt_container", rows: [{ cols: [{ view: "grid", scrollX: "scrollHor", scrollY: "scrollVer" }, { resizer: !0, width: 1 }, { view: "timeline", scrollX: "scrollHor", scrollY: "scrollVer" }, { view: "scrollbar", id: "scrollVer" }] }, { view: "scrollbar", id: "scrollHor", height: 20 }] }, links: { finish_to_start: "0", start_to_start: "1", finish_to_finish: "2", start_to_finish: "3" }, types: { task: "task", project: "project", milestone: "milestone" }, auto_types: !1, duration_unit: "day", work_time: !1, correct_work_time: !1, skip_off_time: !1, cascade_delete: !0, autosize: !1, autosize_min_width: 0, autoscroll: !0, autoscroll_speed: 30, deepcopy_on_parse: !1, show_links: !0, show_task_cells: !0, static_background: !1, static_background_cells: !0, branch_loading: !1, branch_loading_property: "$has_child", show_loading: !1, show_chart: !0, show_grid: !0, min_duration: 36e5, date_format: "%d-%m-%Y %H:%i", xml_date: void 0, start_on_monday: !0, server_utc: !1, show_progress: !0, fit_tasks: !1, select_task: !0, scroll_on_click: !0, smart_rendering: !0, preserve_scroll: !0, readonly: !1, container_resize_timeout: 20, deadlines: !0, date_grid: "%Y-%m-%d", drag_links: !0, drag_progress: !0, drag_resize: !0, drag_project: !1, drag_move: !0, drag_mode: { resize: "resize", progress: "progress", move: "move", ignore: "ignore" }, round_dnd_dates: !0, link_wrapper_width: 20, link_arrow_size: 12, root_id: 0, autofit: !1, columns: [{ name: "text", tree: !0, width: "*", resize: !0 }, { name: "start_date", align: "center", resize: !0 }, { name: "duration", align: "center" }, { name: "add", width: 44 }], scale_offset_minimal: !0, inherit_scale_class: !1, scales: [{ unit: "day", step: 1, date: "%d %M" }], time_step: 60, duration_step: 1, task_date: "%d %F %Y", time_picker: "%H:%i", task_attribute: "data-task-id", link_attribute: "data-link-id", layer_attribute: "data-layer", buttons_left: ["gantt_save_btn", "gantt_cancel_btn"], _migrate_buttons: { dhx_save_btn: "gantt_save_btn", dhx_cancel_btn: "gantt_cancel_btn", dhx_delete_btn: "gantt_delete_btn" }, buttons_right: ["gantt_delete_btn"], lightbox: { sections: [{ name: "description", height: 70, map_to: "text", type: "textarea", focus: !0 }, { name: "time", type: "duration", map_to: "auto" }], project_sections: [{ name: "description", height: 70, map_to: "text", type: "textarea", focus: !0 }, { name: "type", type: "typeselect", map_to: "type" }, { name: "time", type: "duration", readonly: !0, map_to: "auto" }], milestone_sections: [{ name: "description", height: 70, map_to: "text", type: "textarea", focus: !0 }, { name: "type", type: "typeselect", map_to: "type" }, { name: "time", type: "duration", single_date: !0, map_to: "auto" }] }, drag_lightbox: !0, sort: !1, details_on_create: !0, details_on_dblclick: !0, initial_scroll: !0, task_scroll_offset: 100, order_branch: !1, order_branch_free: !1, task_height: void 0, bar_height: "full", bar_height_padding: 9, min_column_width: 70, min_grid_column_width: 70, grid_resizer_column_attribute: "data-column-index", keep_grid_width: !1, grid_resize: !1, grid_elastic_columns: !1, show_tasks_outside_timescale: !1, show_unscheduled: !0, resize_rows: !1, task_grid_row_resizer_attribute: "data-row-index", min_task_grid_row_height: 30, row_height: 36, readonly_property: "readonly", editable_property: "editable", calendar_property: "calendar_id", resource_calendars: {}, dynamic_resource_calendars: !1, inherit_calendar: !1, type_renderers: {}, open_tree_initially: !1, optimize_render: !0, prevent_default_scroll: !1, show_errors: !0, wai_aria_attributes: !0, smart_scales: !0, rtl: !1, placeholder_task: !1, horizontal_scroll_key: "shiftKey", drag_timeline: { useKey: void 0, ignore: ".gantt_task_line, .gantt_task_link", render: !1 }, drag_multiple: !0, csp: "auto", auto_scheduling: {} }, n.ajax = /* @__PURE__ */ function(l) {
    return { cache: !0, method: "get", parse: function(d) {
      return typeof d != "string" ? d : (d = d.replace(/^[\s]+/, ""), typeof DOMParser > "u" || yt.isIE ? tt.ActiveXObject !== void 0 && ((u = new tt.ActiveXObject("Microsoft.XMLDOM")).async = "false", u.loadXML(d)) : u = new DOMParser().parseFromString(d, "text/xml"), u);
      var u;
    }, xmltop: function(d, u, c) {
      if (u.status === void 0 || u.status < 400) {
        var h = u.responseXML ? u.responseXML || u : this.parse(u.responseText || u);
        if (h && h.documentElement !== null && !h.getElementsByTagName("parsererror").length) return h.getElementsByTagName(d)[0];
      }
      return c !== -1 && l.callEvent("onLoadXMLError", ["Incorrect XML", arguments[1], c]), document.createElement("DIV");
    }, xpath: function(d, u) {
      if (u.nodeName || (u = u.responseXML || u), yt.isIE) return u.selectNodes(d) || [];
      for (var c, h = [], _ = (u.ownerDocument || u).evaluate(d, u, null, XPathResult.ANY_TYPE, null); c = _.iterateNext(); ) h.push(c);
      return h;
    }, query: function(d) {
      return this._call(d.method || "GET", d.url, d.data || "", d.async || !0, d.callback, d.headers);
    }, get: function(d, u, c) {
      var h = At("GET", arguments);
      return this.query(h);
    }, getSync: function(d, u) {
      var c = At("GET", arguments);
      return c.async = !1, this.query(c);
    }, put: function(d, u, c, h) {
      var _ = At("PUT", arguments);
      return this.query(_);
    }, del: function(d, u, c) {
      var h = At("DELETE", arguments);
      return this.query(h);
    }, post: function(d, u, c, h) {
      arguments.length == 1 ? u = "" : arguments.length == 2 && typeof u == "function" && (c = u, u = "");
      var _ = At("POST", arguments);
      return this.query(_);
    }, postSync: function(d, u, c) {
      u = u === null ? "" : String(u);
      var h = At("POST", arguments);
      return h.async = !1, this.query(h);
    }, _call: function(d, u, c, h, _, f) {
      return new l.Promise(function(v, k) {
        var b = typeof XMLHttpRequest !== void 0 ? new XMLHttpRequest() : new tt.ActiveXObject("Microsoft.XMLHTTP"), m = navigator.userAgent.match(/AppleWebKit/) !== null && navigator.userAgent.match(/Qt/) !== null && navigator.userAgent.match(/Safari/) !== null;
        h && (b.onreadystatechange = function() {
          if (b.readyState == 4 || m && b.readyState == 3) {
            if ((b.status < 200 || b.status > 299 || b.responseText === "") && !l.callEvent("onAjaxError", [b])) return;
            setTimeout(function() {
              typeof _ == "function" && _.apply(tt, [{ xmlDoc: b, filePath: u }]), v(b), typeof _ == "function" && (_ = null, b = null);
            }, 0);
          }
        });
        var g = !this || !this.cache;
        if (d == "GET" && g && (u += (u.indexOf("?") >= 0 ? "&" : "?") + "dhxr" + (/* @__PURE__ */ new Date()).getTime() + "=1"), b.open(d, u, h), f) for (var p in f) b.setRequestHeader(p, f[p]);
        else d.toUpperCase() == "POST" || d == "PUT" || d == "DELETE" ? b.setRequestHeader("Content-Type", "application/x-www-form-urlencoded") : d == "GET" && (c = null);
        if (b.setRequestHeader("X-Requested-With", "XMLHttpRequest"), b.send(c), !h) return { xmlDoc: b, filePath: u };
      });
    }, urlSeparator: function(d) {
      return d.indexOf("?") != -1 ? "&" : "?";
    } };
  }(n), n.date = Di(n), n.RemoteEvents = Ai;
  var a = function(l) {
    function d(c) {
      return { target: c.target || c.srcElement, pageX: c.pageX, pageY: c.pageY, clientX: c.clientX, clientY: c.clientY, metaKey: c.metaKey, shiftKey: c.shiftKey, ctrlKey: c.ctrlKey, altKey: c.altKey };
    }
    function u(c, h) {
      this._obj = c, this._settings = h || {}, _t(this);
      var _ = this.getInputMethods();
      this._drag_start_timer = null, l.attachEvent("onGanttScroll", j(function(k, b) {
        this.clearDragTimer();
      }, this));
      for (var f = { passive: !1 }, v = 0; v < _.length; v++) j(function(k) {
        l.event(c, k.down, j(function(m) {
          if (k.accessor(m) && !(m.button !== void 0 && m.button !== 0 || (h.preventDefault && h.selector && ct(m.target, h.selector) && m.preventDefault(), l.config.touch && m.timeStamp && m.timeStamp - 0 < 300))) if (this._settings.original_target = d(m), this._settings.original_element_sizes = { ...dt(m, Ln(c)), width: m.target.offsetWidth, height: m.target.offsetHeight }, l.config.touch) {
            let g = m.target;
            this.clearDragTimer(), this._drag_start_timer = setTimeout(j(function() {
              l.getState().lightbox || this.dragStart(c, m, k, g);
            }, this), l.config.touch_drag);
          } else this.dragStart(c, m, k);
        }, this), f);
        var b = document.body;
        l.event(b, k.up, j(function(m) {
          k.accessor(m) && this.clearDragTimer();
        }, this), f);
      }, this)(_[v]);
    }
    return u.prototype = { traceDragEvents: function(c, h) {
      var _ = j(function(g) {
        return this.dragMove(c, g, h.accessor);
      }, this);
      j(function(g) {
        return this.dragScroll(c, g);
      }, this);
      var f = j(function(g) {
        if (!this.config.started || !U(this.config.updates_per_second) || Fn(this, this.config.updates_per_second)) {
          var p = _(g);
          if (p) try {
            g && g.preventDefault && g.cancelable && g.preventDefault();
          } catch {
          }
          return p;
        }
      }, this), v = Et(l.$root), k = this.config.mousemoveContainer || Et(l.$root), b = { passive: !1 }, m = j(function(g) {
        return l.eventRemove(k, h.move, f), l.eventRemove(v, h.up, m, b), this.dragEnd(c);
      }, this);
      l.event(k, h.move, f, b), l.event(v, h.up, m, b);
    }, checkPositionChange: function(c) {
      var h = c.x - this.config.pos.x, _ = c.y - this.config.pos.y;
      return Math.sqrt(Math.pow(Math.abs(h), 2) + Math.pow(Math.abs(_), 2)) > this.config.sensitivity;
    }, initDnDMarker: function() {
      var c = this.config.marker = document.createElement("div");
      c.className = "gantt_drag_marker", c.innerHTML = "", document.body.appendChild(c);
    }, backupEventTarget: function(c, h, _) {
      if (!l.config.touch) return;
      var f = h(c);
      let v = f.target || f.srcElement;
      v.shadowRoot && _ && (v = _);
      var k = v.cloneNode(!0);
      this.config.original_target = d(f), this.config.original_target.target = k, this.config.backup_element = v, v.parentNode.appendChild(k), v.style.display = "none", (this.config.mousemoveContainer || l.$root || document.body).appendChild(v);
    }, getInputMethods: function() {
      var c = [];
      return c.push({ move: "mousemove", down: "mousedown", up: "mouseup", accessor: function(h) {
        return h;
      } }), l.config.touch && (!l.env.isIE || tt.maxTouchPoints ? c.push({ move: "touchmove", down: "touchstart", up: "touchend", accessor: function(h) {
        return h.touches && h.touches.length > 1 ? null : h.touches[0] ? { target: document.elementFromPoint(h.touches[0].clientX, h.touches[0].clientY), pageX: h.touches[0].pageX, pageY: h.touches[0].pageY, clientX: h.touches[0].clientX, clientY: h.touches[0].clientY } : h;
      } }) : tt.PointerEvent && c.push({ move: "pointermove", down: "pointerdown", up: "pointerup", accessor: function(h) {
        return h.pointerType == "mouse" ? null : h;
      } })), c;
    }, clearDragTimer: function() {
      this._drag_start_timer && (clearTimeout(this._drag_start_timer), this._drag_start_timer = null);
    }, dragStart: function(c, h, _, f) {
      this.config && this.config.started || (this.config = { obj: c, marker: null, started: !1, pos: this.getPosition(h), sensitivity: 4 }, this._settings && H(this.config, this._settings, !0), this.traceDragEvents(c, _), l._prevent_touch_scroll = !0, h.target.closest(".gantt_row") && !l.config.order_branch && (l._prevent_touch_scroll = !1), document.body.classList.add("gantt_noselect"), l.config.touch && this.dragMove(c, h, _.accessor, f));
    }, dragMove: function(c, h, _, f) {
      var v = _(h);
      if (!v) return !1;
      if (!this.config.marker && !this.config.started) {
        var k = this.getPosition(v);
        if (l.config.touch || this.checkPositionChange(k)) {
          if (this.config.started = !0, this.config.ignore = !1, l._touch_drag = !0, this.callEvent("onBeforeDragStart", [c, this.config.original_target]) === !1) return this.config.ignore = !0, !1;
          this.backupEventTarget(h, _, f), this.initDnDMarker(), l._touch_feedback(), this.callEvent("onAfterDragStart", [c, this.config.original_target]);
        } else this.config.ignore = !0;
      }
      if (!this.config.ignore) {
        if (h.targetTouches && !v.target) return;
        const b = l.$root.getRootNode();
        if (b instanceof ShadowRoot) {
          if (f && Object.getOwnPropertyDescriptor(v, "target")) v.target = f;
          else if (b.elementFromPoint && h.targetTouches) {
            const m = h.targetTouches[0];
            v.target = b.elementFromPoint(m.clientX, m.clientY);
          }
        }
        return v.pos = this.getPosition(v), this.config.marker.style.left = v.pos.x + "px", this.config.marker.style.top = v.pos.y + "px", this.callEvent("onDragMove", [c, v, f]), !0;
      }
      return !1;
    }, dragEnd: function(c) {
      var h = this.config.backup_element;
      h && h.parentNode && h.parentNode.removeChild(h), l._prevent_touch_scroll = !1, this.config.marker && (this.config.marker.parentNode.removeChild(this.config.marker), this.config.marker = null, this.callEvent("onDragEnd", [])), this.config.started = !1, l._touch_drag = !1, document.body.classList.remove("gantt_noselect");
    }, getPosition: function(c) {
      var h = 0, _ = 0;
      return c.pageX || c.pageY ? (h = c.pageX, _ = c.pageY) : (c.clientX || c.clientY) && (h = c.clientX + document.body.scrollLeft + document.documentElement.scrollLeft, _ = c.clientY + document.body.scrollTop + document.documentElement.scrollTop), { x: h, y: _ };
    } }, u;
  }(n);
  n.$services.setService("dnd", function() {
    return a;
  });
  var r = /* @__PURE__ */ function(l) {
    var d = {};
    function u(c, h, _) {
      _ = _ || c;
      var f = l.config, v = l.templates;
      l.config[c] && d[_] != f[c] && (h && v[_] || (v[_] = l.date.date_to_str(f[c]), d[_] = f[c]));
    }
    return { initTemplates: function() {
      var c = l.date, h = c.date_to_str, _ = l.config, f = _.xml_date || _.date_format, v = f === "iso", k = v ? function(m) {
        return c.formatISODate(m);
      } : h(f, _.server_utc);
      k._ganttAuto = !0;
      var b = v ? function(m) {
        return c.parseDate(m);
      } : c.str_to_date(f, _.server_utc);
      b._ganttAuto = !0, u("date_scale", !0, void 0, l.config, l.templates), u("date_grid", !0, "grid_date_format", l.config, l.templates), u("task_date", !0, void 0, l.config, l.templates), l.mixin(l.templates, { xml_format: void 0, format_date: k, xml_date: void 0, parse_date: b, progress_text: function(m, g, p) {
        return "";
      }, grid_header_class: function(m, g) {
        return "";
      }, task_text: function(m, g, p) {
        return p.text;
      }, task_class: function(m, g, p) {
        return "";
      }, task_end_date: function(m) {
        return l.templates.task_date(m);
      }, grid_row_class: function(m, g, p) {
        return "";
      }, task_row_class: function(m, g, p) {
        return "";
      }, timeline_cell_class: function(m, g) {
        return "";
      }, timeline_cell_content: function(m, g) {
        return "";
      }, scale_cell_class: function(m) {
        return "";
      }, scale_row_class: function(m) {
        return "";
      }, grid_indent: function(m) {
        return "<div class='gantt_tree_indent'></div>";
      }, grid_folder: function(m) {
        return "<div class='gantt_tree_icon gantt_folder_" + (m.$open ? "open" : "closed") + "'></div>";
      }, grid_file: function(m) {
        return "<div class='gantt_tree_icon gantt_file'></div>";
      }, grid_open: function(m) {
        return "<div class='gantt_tree_icon gantt_" + (m.$open ? "close" : "open") + "'></div>";
      }, grid_blank: function(m) {
        return "<div class='gantt_tree_icon gantt_blank'></div>";
      }, date_grid: function(m, g, p) {
        return g && l.isUnscheduledTask(g) && l.config.show_unscheduled ? l.templates.task_unscheduled_time(g) : l.templates.grid_date_format(m, p);
      }, task_time: function(m, g, p) {
        return l.isUnscheduledTask(p) && l.config.show_unscheduled ? l.templates.task_unscheduled_time(p) : l.templates.task_date(m) + " - " + l.templates.task_end_date(g);
      }, task_unscheduled_time: function(m) {
        return "";
      }, time_picker: h(_.time_picker), link_class: function(m) {
        return "";
      }, link_description: function(m) {
        var g = l.getTask(m.source), p = l.getTask(m.target);
        return "<b>" + g.text + "</b> &ndash;  <b>" + p.text + "</b>";
      }, drag_link: function(m, g, p, y) {
        m = l.getTask(m);
        var $ = l.locale.labels, x = "<b>" + m.text + "</b> " + (g ? $.link_start : $.link_end) + "<br/>";
        return p && (x += "<b> " + (p = l.getTask(p)).text + "</b> " + (y ? $.link_start : $.link_end) + "<br/>"), x;
      }, drag_link_class: function(m, g, p, y) {
        var $ = "";
        return m && p && ($ = " " + (l.isLinkAllowed(m, p, g, y) ? "gantt_link_allow" : "gantt_link_deny")), "gantt_link_tooltip" + $;
      }, tooltip_date_format: c.date_to_str("%Y-%m-%d"), tooltip_text: function(m, g, p) {
        return `<div>Task: ${p.text}</div>
				<div>Start date: ${l.templates.tooltip_date_format(m)}</div>
				<div>End date: ${l.templates.tooltip_date_format(g)}</div>`;
      }, baseline_text: function(m, g, p) {
        return "";
      } });
    }, initTemplate: u };
  }(n);
  n.$services.setService("templateLoader", function() {
    return r;
  }), _t(n);
  var s = new Ii();
  s.registerProvider("global", function() {
    var l = { min_date: n._min_date, max_date: n._max_date, selected_task: null };
    return n.$data && n.$data.tasksStore && (l.selected_task = n.$data.tasksStore.getSelectedId()), l;
  }), n.getState = s.getState, n.$services.setService("state", function() {
    return s;
  }), H(n, Bn), n.Promise = Mi, n.env = yt, function(l) {
    var d = Ni.create();
    H(l, d);
    var u, c = l.createDatastore({ name: "task", type: "treeDatastore", rootId: function() {
      return l.config.root_id;
    }, initItem: j(function(m) {
      this.defined(m.id) || (m.id = this.uid()), m.start_date && (m.start_date = l.date.parseDate(m.start_date, "parse_date")), m.end_date && (m.end_date = l.date.parseDate(m.end_date, "parse_date"));
      var g = null;
      (m.duration || m.duration === 0) && (m.duration = g = 1 * m.duration), g && (m.start_date && !m.end_date ? m.end_date = this.calculateEndDate(m) : !m.start_date && m.end_date && (m.start_date = this.calculateEndDate({ start_date: m.end_date, duration: -m.duration, task: m }))), l.config.deadlines !== !1 && m.deadline && (m.deadline = l.date.parseDate(m.deadline, "parse_date")), m.progress = Number(m.progress) || 0, this._isAllowedUnscheduledTask(m) && this._set_default_task_timing(m), this._init_task_timing(m), m.start_date && m.end_date && this.correctTaskWorkTime(m), m.$source = [], m.$target = [];
      var p = this.$data.tasksStore.getItem(m.id);
      return p && !U(m.open) && (m.$open = p.$open), m.parent === void 0 && (m.parent = this.config.root_id), m.open && (m.$open = !0), m;
    }, l), getConfig: function() {
      return l.config;
    } }), h = l.createDatastore({ name: "link", initItem: j(function(m) {
      return this.defined(m.id) || (m.id = this.uid()), m;
    }, l) });
    function _(m) {
      var g = l.isTaskVisible(m);
      if (!g && l.isTaskExists(m)) {
        var p = l.getParent(m);
        l.isTaskExists(p) && l.isTaskVisible(p) && (p = l.getTask(p), l.isSplitTask(p) && (g = !0));
      }
      return g;
    }
    function f(m, g) {
      return g.indexOf(String(m)) === -1 && g.indexOf(Number(m)) === -1;
    }
    function v(m) {
      if (l.isTaskExists(m.source)) {
        for (var g = l.getTask(m.source), p = 0; p < g.$source.length; p++) if (g.$source[p] == m.id) {
          g.$source.splice(p, 1);
          break;
        }
      }
      if (l.isTaskExists(m.target)) {
        var y = l.getTask(m.target);
        for (p = 0; p < y.$target.length; p++) if (y.$target[p] == m.id) {
          y.$target.splice(p, 1);
          break;
        }
      }
    }
    function k() {
      for (var m = null, g = l.$data.tasksStore.getItems(), p = 0, y = g.length; p < y; p++) (m = g[p]).$source = [], m.$target = [];
      var $ = l.$data.linksStore.getItems();
      for (p = 0, y = $.length; p < y; p++) {
        var x = $[p];
        h.sync_link(x);
      }
    }
    function b(m) {
      var g = m.source, p = m.target;
      for (var y in m.events) (function($, x) {
        g.attachEvent($, function() {
          return p.callEvent(x, Array.prototype.slice.call(arguments));
        }, x);
      })(y, m.events[y]);
    }
    l.attachEvent("onDestroy", function() {
      c.destructor(), h.destructor();
    }), l.attachEvent("onLinkValidation", function(m) {
      if (l.isLinkExists(m.id) || m.id === "predecessor_generated") return !0;
      for (var g = l.getTask(m.source).$source, p = 0; p < g.length; p++) {
        var y = l.getLink(g[p]), $ = m.source == y.source, x = m.target == y.target, w = m.type == y.type;
        if ($ && x && w) return !1;
      }
      return !0;
    }), c.attachEvent("onBeforeRefreshAll", function() {
      if (!c._skipTaskRecalculation) for (var m = c.getVisibleItems(), g = 0; g < m.length; g++) {
        var p = m[g];
        p.$index = g, p.$local_index = l.getTaskIndex(p.id), l.resetProjectDates(p);
      }
    }), c.attachEvent("onFilterItem", function(m, g) {
      if (l.config.show_tasks_outside_timescale) return !0;
      let p = null, y = null;
      if (l.config.start_date && l.config.end_date) {
        if (l._isAllowedUnscheduledTask(g)) return !0;
        if (p = l.config.start_date.valueOf(), y = l.config.end_date.valueOf(), g.start_date && +g.start_date > y || g.end_date && +g.end_date < +p) return !1;
      }
      return !0;
    }), c.attachEvent("onIdChange", function(m, g) {
      l._update_flags(m, g);
      var p = l.getTask(g);
      c.isSilent() || (p.$split_subtask || p.rollup) && l.eachParent(function(y) {
        l.refreshTask(y.id);
      }, g);
    }), c.attachEvent("onAfterUpdate", function(m) {
      if (l._update_parents(m), l.getState("batchUpdate").batch_update) return !0;
      var g = c.getItem(m);
      g.$source || (g.$source = []);
      for (var p = 0; p < g.$source.length; p++) h.refresh(g.$source[p]);
      for (g.$target || (g.$target = []), p = 0; p < g.$target.length; p++) h.refresh(g.$target[p]);
    }), c.attachEvent("onBeforeItemMove", function(m, g, p) {
      return !Ut(m, l, c) || (console.log("The placeholder task cannot be moved to another position."), !1);
    }), c.attachEvent("onAfterItemMove", function(m, g, p) {
      var y = l.getTask(m);
      this.getNextSibling(m) !== null ? y.$drop_target = this.getNextSibling(m) : this.getPrevSibling(m) !== null ? y.$drop_target = "next:" + this.getPrevSibling(m) : y.$drop_target = "next:null";
    }), c.attachEvent("onStoreUpdated", function(m, g, p) {
      if (p == "delete" && l._update_flags(m, null), !l.$services.getService("state").getState("batchUpdate").batch_update) {
        if (l.config.fit_tasks && p !== "paint") {
          var y = l.getState();
          Ie(l);
          var $ = l.getState();
          if (+y.min_date != +$.min_date || +y.max_date != +$.max_date) return l.render(), l.callEvent("onScaleAdjusted", []), !0;
        }
        p == "add" || p == "move" || p == "delete" ? l.$layout && (this.$config.name != "task" || p != "add" && p != "delete" || this._skipTaskRecalculation != "lightbox" && (this._skipTaskRecalculation = !0), l.$layout.resize()) : m || h.refresh();
      }
    }), h.attachEvent("onAfterAdd", function(m, g) {
      h.sync_link(g);
    }), h.attachEvent("onAfterUpdate", function(m, g) {
      k();
    }), h.attachEvent("onAfterDelete", function(m, g) {
      v(g);
    }), h.attachEvent("onAfterSilentDelete", function(m, g) {
      v(g);
    }), h.attachEvent("onBeforeIdChange", function(m, g) {
      v(l.mixin({ id: m }, l.$data.linksStore.getItem(g))), h.sync_link(l.$data.linksStore.getItem(g));
    }), h.attachEvent("onFilterItem", function(m, g) {
      if (!l.config.show_links) return !1;
      var p = _(g.source), y = _(g.target);
      return !(!p || !y || l._isAllowedUnscheduledTask(l.getTask(g.source)) || l._isAllowedUnscheduledTask(l.getTask(g.target))) && l.callEvent("onBeforeLinkDisplay", [m, g]);
    }), u = {}, l.attachEvent("onBeforeTaskDelete", function(m, g) {
      return u[m] = Me.getSubtreeLinks(l, m), !0;
    }), l.attachEvent("onAfterTaskDelete", function(m, g) {
      u[m] && l.$data.linksStore.silent(function() {
        for (var p in u[m]) l.isLinkExists(p) && l.$data.linksStore.removeItem(p), v(u[m][p]);
        u[m] = null;
      });
    }), l.attachEvent("onAfterLinkDelete", function(m, g) {
      l.isTaskExists(g.source) && l.refreshTask(g.source), l.isTaskExists(g.target) && l.refreshTask(g.target);
    }), l.attachEvent("onParse", k), b({ source: h, target: l, events: { onItemLoading: "onLinkLoading", onBeforeAdd: "onBeforeLinkAdd", onAfterAdd: "onAfterLinkAdd", onBeforeUpdate: "onBeforeLinkUpdate", onAfterUpdate: "onAfterLinkUpdate", onBeforeDelete: "onBeforeLinkDelete", onAfterDelete: "onAfterLinkDelete", onIdChange: "onLinkIdChange" } }), b({ source: c, target: l, events: { onItemLoading: "onTaskLoading", onBeforeAdd: "onBeforeTaskAdd", onAfterAdd: "onAfterTaskAdd", onBeforeUpdate: "onBeforeTaskUpdate", onAfterUpdate: "onAfterTaskUpdate", onBeforeDelete: "onBeforeTaskDelete", onAfterDelete: "onAfterTaskDelete", onIdChange: "onTaskIdChange", onBeforeItemMove: "onBeforeTaskMove", onAfterItemMove: "onAfterTaskMove", onFilterItem: "onBeforeTaskDisplay", onItemOpen: "onTaskOpened", onItemClose: "onTaskClosed", onBeforeSelect: "onBeforeTaskSelected", onAfterSelect: "onTaskSelected", onAfterUnselect: "onTaskUnselected" } }), l.$data = { tasksStore: c, linksStore: h }, h.sync_link = function(m) {
      if (l.isTaskExists(m.source)) {
        var g = l.getTask(m.source);
        g.$source = g.$source || [], f(m.id, g.$source) && g.$source.push(m.id);
      }
      if (l.isTaskExists(m.target)) {
        var p = l.getTask(m.target);
        p.$target = p.$target || [], f(m.id, p.$target) && p.$target.push(m.id);
      }
    };
  }(n), n.dataProcessor = Hi, n.createDataProcessor = Oi, function(l) {
    l.ext || (l.ext = {});
    for (var d = [zi, ji, Vi, Ui, Gi, qi, Yi, Ji, Ki, Qi], u = 0; u < d.length; u++) d[u] && d[u](l);
    const { getAutoSchedulingConfig: c } = Cn(l);
    l._getAutoSchedulingConfig = c;
  }(n), function(l) {
    (function(d) {
      d.getGridColumn = function(u) {
        for (var c = d.config.columns, h = 0; h < c.length; h++) if (c[h].name == u) return c[h];
        return null;
      }, d.getGridColumns = function() {
        return d.config.columns.slice();
      };
    })(l), Gt.prototype.getGridColumns = function() {
      for (var d = this.$getConfig().columns, u = [], c = 0; c < d.length; c++) d[c].hide || u.push(d[c]);
      return u;
    };
  }(n), function(l) {
    l.isReadonly = function(d) {
      return typeof d != "number" && typeof d != "string" || !l.isTaskExists(d) || (d = l.getTask(d)), (!d || !d[this.config.editable_property]) && (d && d[this.config.readonly_property] || this.config.readonly);
    };
  }(n), na(n), function(l) {
    var d = new Jn(l), u = new Kn(d);
    H(l, da(d, u));
  }(n), ca(n), function(l) {
    l.getTaskType = function(d) {
      var u = d;
      for (var c in d && typeof d == "object" && (u = d.type), this.config.types) if (this.config.types[c] == u) return u;
      return l.config.types.task;
    };
  }(n), function(l) {
    function d() {
      return l._cached_functions.update_if_changed(l), l._cached_functions.active || l._cached_functions.activate(), !0;
    }
    l._cached_functions = { cache: {}, mode: !1, critical_path_mode: !1, wrap_methods: function(c, h) {
      if (h._prefetch_originals) for (var _ in h._prefetch_originals) h[_] = h._prefetch_originals[_];
      for (h._prefetch_originals = {}, _ = 0; _ < c.length; _++) this.prefetch(c[_], h);
    }, prefetch: function(c, h) {
      var _ = h[c];
      if (_) {
        var f = this;
        h._prefetch_originals[c] = _, h[c] = function() {
          for (var v = new Array(arguments.length), k = 0, b = arguments.length; k < b; k++) v[k] = arguments[k];
          if (f.active) {
            var m = f.get_arguments_hash(Array.prototype.slice.call(v));
            f.cache[c] || (f.cache[c] = {});
            var g = f.cache[c];
            if (f.has_cached_value(g, m)) return f.get_cached_value(g, m);
            var p = _.apply(this, v);
            return f.cache_value(g, m, p), p;
          }
          return _.apply(this, v);
        };
      }
      return _;
    }, cache_value: function(c, h, _) {
      this.is_date(_) && (_ = new Date(_)), c[h] = _;
    }, has_cached_value: function(c, h) {
      return c.hasOwnProperty(h);
    }, get_cached_value: function(c, h) {
      var _ = c[h];
      return this.is_date(_) && (_ = new Date(_)), _;
    }, is_date: function(c) {
      return c && c.getUTCDate;
    }, get_arguments_hash: function(c) {
      for (var h = [], _ = 0; _ < c.length; _++) h.push(this.stringify_argument(c[_]));
      return "(" + h.join(";") + ")";
    }, stringify_argument: function(c) {
      return (c.id ? c.id : this.is_date(c) ? c.valueOf() : c) + "";
    }, activate: function() {
      this.clear(), this.active = !0;
    }, deactivate: function() {
      this.clear(), this.active = !1;
    }, clear: function() {
      this.cache = {};
    }, setup: function(c) {
      var h = [], _ = ["_isProjectEnd", "_getProjectEnd", "_getSlack"];
      this.mode == "auto" ? c.config.highlight_critical_path && (h = _) : this.mode === !0 && (h = _), this.wrap_methods(h, c);
    }, update_if_changed: function(c) {
      (this.critical_path_mode != c.config.highlight_critical_path || this.mode !== c.config.optimize_render) && (this.critical_path_mode = c.config.highlight_critical_path, this.mode = c.config.optimize_render, this.setup(c));
    } }, l.attachEvent("onBeforeGanttRender", d), l.attachEvent("onBeforeDataRender", d), l.attachEvent("onBeforeSmartRender", function() {
      d();
    }), l.attachEvent("onBeforeParse", d), l.attachEvent("onDataRender", function() {
      l._cached_functions.deactivate();
    });
    var u = null;
    l.attachEvent("onSmartRender", function() {
      u && clearTimeout(u), u = setTimeout(function() {
        l._cached_functions.deactivate();
      }, 1e3);
    }), l.attachEvent("onBeforeGanttReady", function() {
      return l._cached_functions.update_if_changed(l), !0;
    });
  }(n), ua(n), function(l) {
    l.destructor = function() {
      for (var d in this.clearAll(), this.callEvent("onDestroy", []), this._getDatastores().forEach(function(u) {
        u.destructor();
      }), this.$root && delete this.$root.gantt, this._eventRemoveAll && this._eventRemoveAll(), this.$layout && this.$layout.destructor(), this.resetLightbox && this.resetLightbox(), this.ext.inlineEditors && this.ext.inlineEditors.destructor && this.ext.inlineEditors.destructor(), this._dp && this._dp.destructor && this._dp.destructor(), this.$services.destructor(), this.detachAllEvents(), this) d.indexOf("$") === 0 && delete this[d];
      this.$destroyed = !0;
    };
  }(n);
  var o = new Ma({ en: ya, ar: ha, be: _a, ca: ga, cn: fa, cs: pa, da: ma, de: va, el: ka, es: ba, fa: $a, fi: xa, fr: wa, he: Sa, hr: Ta, hu: Ca, id: Ea, it: Da, jp: Aa, kr: Ia, nb: La, nl: Na, no: Pa, pl: Ra, pt: Ha, ro: Oa, ru: Ba, si: za, sk: ja, sv: Fa, tr: Wa, ua: Va });
  return n.i18n = { addLocale: o.addLocale, setLocale: function(l) {
    if (typeof l == "string") {
      var d = o.getLocale(l);
      d || (d = o.getLocale("en")), n.locale = d;
    } else if (l) if (n.locale) for (var u in l) l[u] && typeof l[u] == "object" ? (n.locale[u] || (n.locale[u] = {}), n.mixin(n.locale[u], l[u], !0)) : n.locale[u] = l[u];
    else n.locale = l;
    const c = n.locale.labels;
    c.gantt_save_btn = c.gantt_save_btn || c.icon_save, c.gantt_cancel_btn = c.gantt_cancel_btn || c.icon_cancel, c.gantt_delete_btn = c.gantt_delete_btn || c.icon_delete;
  }, getLocale: o.getLocale }, n.i18n.setLocale("en"), n;
}
function qa(t) {
  var n = "data-dhxbox", e = null;
  function i(m, g) {
    var p = m.callback;
    v.hide(m.box), e = m.box = null, p && p(g);
  }
  function a(m) {
    if (e) {
      var g = m.which || m.keyCode, p = !1;
      if (k.keyboard) {
        if (g == 13 || g == 32) {
          var y = m.target || m.srcElement;
          it(y).indexOf("gantt_popup_button") > -1 && y.click ? y.click() : (i(e, !0), p = !0);
        }
        g == 27 && (i(e, !1), p = !0);
      }
      return p ? (m.preventDefault && m.preventDefault(), !(m.cancelBubble = !0)) : void 0;
    }
  }
  var r = Et(t.$root) || document;
  function s(m) {
    s.cover || (s.cover = document.createElement("div"), s.cover.onkeydown = a, s.cover.className = "dhx_modal_cover", document.body.appendChild(s.cover)), s.cover.style.display = m ? "inline-block" : "none";
  }
  function o(m, g, p) {
    return "<div " + t._waiAria.messageButtonAttrString(m) + " class='gantt_popup_button " + ("gantt_" + g.toLowerCase().replace(/ /g, "_") + "_button") + "' data-result='" + p + "' result='" + p + "' ><div>" + m + "</div></div>";
  }
  function l() {
    for (var m = [].slice.apply(arguments, [0]), g = 0; g < m.length; g++) if (m[g]) return m[g];
  }
  function d(m, g, p) {
    var y = m.tagName ? m : function(w, T, S) {
      var C = document.createElement("div"), E = ut();
      t._waiAria.messageModalAttr(C, E), C.className = " gantt_modal_box gantt-" + w.type, C.setAttribute(n, 1);
      var D = "";
      if (w.width && (C.style.width = w.width), w.height && (C.style.height = w.height), w.title && (D += '<div class="gantt_popup_title">' + w.title + "</div>"), D += '<div class="gantt_popup_text" id="' + E + '"><span>' + (w.content ? "" : w.text) + '</span></div><div  class="gantt_popup_controls">', T && (D += o(l(w.ok, t.locale.labels.message_ok, "OK"), "ok", !0)), S && (D += o(l(w.cancel, t.locale.labels.message_cancel, "Cancel"), "cancel", !1)), w.buttons) for (var I = 0; I < w.buttons.length; I++) {
        var M = w.buttons[I];
        D += typeof M == "object" ? o(M.label, M.css || "gantt_" + M.label.toLowerCase() + "_button", M.value || I) : o(M, M, I);
      }
      if (D += "</div>", C.innerHTML = D, w.content) {
        var A = w.content;
        typeof A == "string" && (A = document.getElementById(A)), A.style.display == "none" && (A.style.display = ""), C.childNodes[w.title ? 1 : 0].appendChild(A);
      }
      return C.onclick = function(L) {
        var N = L.target || L.srcElement;
        if (N.className || (N = N.parentNode), ct(N, ".gantt_popup_button")) {
          var P = N.getAttribute("data-result");
          i(w, P = P == "true" || P != "false" && P);
        }
      }, w.box = C, (T || S) && (e = w), C;
    }(m, g, p);
    m.hidden || s(!0), document.body.appendChild(y);
    var $ = Math.abs(Math.floor(((window.innerWidth || document.documentElement.offsetWidth) - y.offsetWidth) / 2)), x = Math.abs(Math.floor(((window.innerHeight || document.documentElement.offsetHeight) - y.offsetHeight) / 2));
    return m.position == "top" ? y.style.top = "-3px" : y.style.top = x + "px", y.style.left = $ + "px", y.onkeydown = a, v.focus(y), m.hidden && v.hide(y), t.callEvent("onMessagePopup", [y]), y;
  }
  function u(m) {
    return d(m, !0, !1);
  }
  function c(m) {
    return d(m, !0, !0);
  }
  function h(m) {
    return d(m);
  }
  function _(m, g, p) {
    return typeof m != "object" && (typeof g == "function" && (p = g, g = ""), m = { text: m, type: g, callback: p }), m;
  }
  function f(m, g, p, y) {
    return typeof m != "object" && (m = { text: m, type: g, expire: p, id: y }), m.id = m.id || ut(), m.expire = m.expire || k.expire, m;
  }
  t.event(r, "keydown", a, !0);
  var v = function() {
    var m = _.apply(this, arguments);
    return m.type = m.type || "alert", h(m);
  };
  v.hide = function(m) {
    for (; m && m.getAttribute && !m.getAttribute(n); ) m = m.parentNode;
    m && (m.parentNode.removeChild(m), s(!1), t.callEvent("onAfterMessagePopup", [m]));
  }, v.focus = function(m) {
    setTimeout(function() {
      var g = Vt(m);
      g.length && g[0].focus && g[0].focus();
    }, 1);
  };
  var k = function(m, g, p, y) {
    switch ((m = f.apply(this, arguments)).type = m.type || "info", m.type.split("-")[0]) {
      case "alert":
        return u(m);
      case "confirm":
        return c(m);
      case "modalbox":
        return h(m);
      default:
        return function($) {
          k.area || (k.area = document.createElement("div"), k.area.className = "gantt_message_area", k.area.style[k.position] = "5px"), Z(k.area, document.body) || document.body.appendChild(k.area), k.hide($.id);
          var x = document.createElement("div");
          return x.innerHTML = "<div>" + $.text + "</div>", x.className = "gantt-info gantt-" + $.type, x.onclick = function() {
            k.hide($.id), $ = null;
          }, t._waiAria.messageInfoAttr(x), k.position == "bottom" && k.area.firstChild ? k.area.insertBefore(x, k.area.firstChild) : k.area.appendChild(x), $.expire > 0 && (k.timers[$.id] = window.setTimeout(function() {
            k && k.hide($.id);
          }, $.expire)), k.pull[$.id] = x, x = null, $.id;
        }(m);
    }
  };
  k.seed = (/* @__PURE__ */ new Date()).valueOf(), k.uid = ut, k.expire = 4e3, k.keyboard = !0, k.position = "top", k.pull = {}, k.timers = {}, k.hideAll = function() {
    for (var m in k.pull) k.hide(m);
  }, k.hide = function(m) {
    var g = k.pull[m];
    g && g.parentNode && (window.setTimeout(function() {
      g.parentNode.removeChild(g), g = null;
    }, 2e3), g.className += " hidden", k.timers[m] && window.clearTimeout(k.timers[m]), delete k.pull[m]);
  };
  var b = [];
  return t.attachEvent("onMessagePopup", function(m) {
    b.push(m);
  }), t.attachEvent("onAfterMessagePopup", function(m) {
    for (var g = 0; g < b.length; g++) b[g] === m && (b.splice(g, 1), g--);
  }), t.attachEvent("onDestroy", function() {
    s.cover && s.cover.parentNode && s.cover.parentNode.removeChild(s.cover);
    for (var m = 0; m < b.length; m++) b[m].parentNode && b[m].parentNode.removeChild(b[m]);
    b = null, k.area && k.area.parentNode && k.area.parentNode.removeChild(k.area), k = null;
  }), { alert: function() {
    var m = _.apply(this, arguments);
    return m.type = m.type || "confirm", u(m);
  }, confirm: function() {
    var m = _.apply(this, arguments);
    return m.type = m.type || "alert", c(m);
  }, message: k, modalbox: v };
}
function fn(t, n) {
  var e = this.$config[t];
  return e ? (e.$extendedConfig || (e.$extendedConfig = !0, Object.setPrototypeOf(e, n)), e) : n;
}
function Ya(t, n) {
  var e, i, a;
  H(t, (e = n, { $getConfig: function() {
    return i || (i = e ? e.$getConfig() : this.$gantt.config), this.$config.config ? fn.call(this, "config", i) : i;
  }, $getTemplates: function() {
    return a || (a = e ? e.$getTemplates() : this.$gantt.templates), this.$config.templates ? fn.call(this, "templates", a) : a;
  } }));
}
const Ja = function(t) {
  var n = {}, e = {};
  function i(a, r, s, o) {
    var l = n[a];
    if (!l || !l.create) return !1;
    a != "resizer" || s.mode || (o.$config.cols ? s.mode = "x" : s.mode = "y"), a != "viewcell" || s.view != "scrollbar" || s.scroll || (o.$config.cols ? s.scroll = "y" : s.scroll = "x"), (s = J(s)).id || e[s.view] || (s.id = s.view), s.id && !s.css && (s.css = s.id + "_cell");
    var d = new l.create(r, s, this, t);
    return l.configure && l.configure(d), Ya(d, o), d.$id || (d.$id = s.id || t.uid()), d.$parent || typeof r != "object" || (d.$parent = r), d.$config || (d.$config = s), e[d.$id] && (d.$id = t.uid()), e[d.$id] = d, d;
  }
  return { initUI: function(a, r) {
    var s = "cell";
    return a.view ? s = "viewcell" : a.resizer ? s = "resizer" : a.rows || a.cols ? s = "layout" : a.views && (s = "multiview"), i.call(this, s, null, a, r);
  }, reset: function() {
    e = {};
  }, registerView: function(a, r, s) {
    n[a] = { create: r, configure: s };
  }, createView: i, getView: function(a) {
    return e[a];
  } };
};
var Ka = /* @__PURE__ */ function(t) {
  return function(n) {
    var e = { click: {}, doubleclick: {}, contextMenu: {} };
    function i(h, _, f, v) {
      e[h][_] || (e[h][_] = []), e[h][_].push({ handler: f, root: v });
    }
    function a(h) {
      h = h || window.event;
      var _ = n.locate(h), f = s(h, e.click), v = !0;
      if (_ !== null ? v = !n.checkEvent("onTaskClick") || n.callEvent("onTaskClick", [_, h]) : n.callEvent("onEmptyClick", [h]), v) {
        if (!o(f, h, _)) return;
        switch (h.target.nodeName) {
          case "SELECT":
          case "INPUT":
            return;
        }
        _ && n.getTask(_) && !n._multiselect && n.config.select_task && n.selectTask(_);
      }
    }
    function r(h) {
      var _ = (h = h || window.event).target || h.srcElement, f = n.locate(_), v = n.locate(_, n.config.link_attribute), k = !n.checkEvent("onContextMenu") || n.callEvent("onContextMenu", [f, v, h]);
      return k || (h.preventDefault ? h.preventDefault() : h.returnValue = !1), k;
    }
    function s(h, _) {
      for (var f = h.target || h.srcElement, v = []; f; ) {
        var k = t.getClassName(f);
        if (k) {
          k = k.split(" ");
          for (var b = 0; b < k.length; b++) if (k[b] && _[k[b]]) for (var m = _[k[b]], g = 0; g < m.length; g++) m[g].root && !t.isChildOf(f, m[g].root) || v.push(m[g].handler);
        }
        f = f.parentNode;
      }
      return v;
    }
    function o(h, _, f) {
      for (var v = !0, k = 0; k < h.length; k++) {
        var b = h[k].call(n, _, f, _.target || _.srcElement);
        v = v && !(b !== void 0 && b !== !0);
      }
      return v;
    }
    function l(h) {
      h = h || window.event;
      var _ = n.locate(h), f = s(h, e.doubleclick), v = !n.checkEvent("onTaskDblClick") || _ === null || n.callEvent("onTaskDblClick", [_, h]);
      if (v) {
        if (!o(f, h, _)) return;
        _ !== null && n.getTask(_) && v && n.config.details_on_dblclick && !n.isReadonly(_) && n.showLightbox(_);
      }
    }
    function d(h) {
      if (n.checkEvent("onMouseMove")) {
        var _ = n.locate(h);
        n._last_move_event = h, n.callEvent("onMouseMove", [_, h]);
      }
    }
    var u = n._createDomEventScope();
    function c(h) {
      u.detachAll(), h && (u.attach(h, "click", a), u.attach(h, "dblclick", l), u.attach(h, "mousemove", d), u.attach(h, "contextmenu", r));
    }
    return { reset: c, global: function(h, _, f) {
      i(h, _, f, null);
    }, delegate: i, detach: function(h, _, f, v) {
      if (e[h] && e[h][_]) {
        for (var k = e[h], b = k[_], m = 0; m < b.length; m++) b[m].root == v && (b.splice(m, 1), m--);
        b.length || delete k[_];
      }
    }, callHandler: function(h, _, f, v) {
      var k = e[h][_];
      if (k) for (var b = 0; b < k.length; b++) (f || k[b].root) && k[b].root !== f || k[b].handler.apply(this, v);
    }, onDoubleClick: l, onMouseMove: d, onContextMenu: r, onClick: a, destructor: function() {
      c(), e = null, u = null;
    } };
  };
}(Pn);
const Xa = { init: Ka };
function pn(t, n, e) {
  return !!n && !(n.left > t.x_end || n.left + n.width < t.x) && !(n.top > t.y_end || n.top + n.height < t.y);
}
function Ft(t) {
  return t.config.smart_rendering && t._smart_render;
}
function ie(t, n, e) {
  return { top: n.getItemTop(t.id), height: n.getItemHeight(t.id), left: 0, right: 1 / 0 };
}
function Q(t, n, e, i, a) {
  var r = n.getItemIndexByTopPosition(a.y) || 0, s = n.getItemIndexByTopPosition(a.y_end) || i.count(), o = Math.max(0, r - 1), l = Math.min(i.count(), s + 1);
  const d = [];
  if (t.config.keyboard_navigation && t.getSelectedId()) {
    let u = t.getTask(t.getSelectedId());
    u.$expanded_branch && !u.$split_subtask && d.push(t.getSelectedId());
  }
  if (t.$ui.getView("grid") && t.ext.inlineEditors && t.ext.inlineEditors.getState().id) {
    let u = t.ext.inlineEditors.getState().id;
    i.exists(u) && d.push(u);
  }
  return { start: o, end: l, ids: d };
}
var Za = function(t) {
  var n = /* @__PURE__ */ function(e) {
    var i = {}, a = {};
    function r(o) {
      var l = null;
      return typeof o.view == "string" ? l = e.$ui.getView(o.view) : o.view && (l = o.view), l;
    }
    function s(o, l, d) {
      if (a[o]) return a[o];
      l.renderer || e.assert(!1, "Invalid renderer call");
      var u = null, c = null, h = null, _ = null, f = null;
      typeof l.renderer == "function" ? (u = l.renderer, h = ie) : (u = l.renderer.render, c = l.renderer.update, _ = l.renderer.onrender, l.renderer.isInViewPort ? f = l.renderer.isInViewPort : h = l.renderer.getRectangle, h || h === null || (h = ie));
      var v = l.filter;
      return d && d.setAttribute(e.config.layer_attribute, !0), a[o] = { render_item: function(k, b, m, g, p) {
        if (b = b || d, !v || v(k)) {
          var y = g || r(l), $ = p || (y ? y.$getConfig() : null), x = m;
          !x && $ && $.smart_rendering && (x = y.getViewPort());
          var w = null;
          !Ft(e) && (h || f) && x ? (f ? f(k, x, y, $, e) : pn(x, h(k, y, $, e))) && (w = u.call(e, k, y, $, x)) : w = u.call(e, k, y, $, x), this.append(k, w, b);
          var T = b.nodeType == 11;
          _ && !T && w && _.call(e, k, w, y);
        } else this.remove_item(k.id);
      }, clear: function(k) {
        l.renderer && l.renderer.clear && l.renderer.clear(), this.rendered = i[o] = {}, l.append || this.clear_container(k);
      }, clear_container: function(k) {
        (k = k || d) && (k.innerHTML = "");
      }, get_visible_range: function(k) {
        var b, m, g = r(l), p = g ? g.$getConfig() : null;
        return p && p.smart_rendering && (b = g.getViewPort()), g && b && (typeof l.renderer == "function" ? m = Q(e, g, 0, k, b) : l.renderer && l.renderer.getVisibleRange && (m = l.renderer.getVisibleRange(e, g, p, k, b))), m || (m = { start: 0, end: k.count() }), m;
      }, prepare_data: function(k) {
        if (l.renderer && l.renderer.prepareData) return l.renderer.prepareData(k, e, l);
      }, render_items: function(k, b) {
        b = b || d;
        var m = document.createDocumentFragment();
        this.clear(b);
        var g = null, p = r(l), y = p ? p.$getConfig() : null;
        y && y.smart_rendering && (g = p.getViewPort());
        for (var $ = 0, x = k.length; $ < x; $++) this.render_item(k[$], m, g, p, y);
        b.appendChild(m, b);
        var w = {};
        k.forEach(function(C) {
          w[C.id] = C;
        });
        var T = {};
        if (_) {
          var S = {};
          for (var $ in this.rendered) T[$] || (S[$] = this.rendered[$], _.call(e, w[$], this.rendered[$], p));
        }
      }, update_items: function(k, b) {
        var m = r(l), g = m ? m.$getConfig() : null;
        if (m && m.$getConfig().smart_rendering && !Ft(e) && this.rendered && (h || f)) {
          b = b || d;
          var p = document.createDocumentFragment(), y = null;
          m && (y = m.getViewPort());
          var $ = {};
          k.forEach(function(M) {
            $[M.id] = M;
          });
          var x = {}, w = {};
          for (var T in this.rendered) w[T] = !0, x[T] = !0;
          for (var S = {}, C = (T = 0, k.length); T < C; T++) {
            var E = k[T], D = this.rendered[E.id];
            w[E.id] = !1, D && D.parentNode ? (f ? f(E, y, m, g, e) : pn(y, h(E, m, g, e))) ? (c && c.call(e, E, D, m, g, y), this.restore(E, p)) : w[E.id] = !0 : (S[k[T].id] = !0, this.render_item(k[T], p, y, m, g));
          }
          for (var T in w) w[T] && this.hide(T);
          if (p.childNodes.length && b.appendChild(p, b), _) {
            var I = {};
            for (var T in this.rendered) x[T] && !S[T] || (I[T] = this.rendered[T], _.call(e, $[T], this.rendered[T], m));
          }
        }
      }, append: function(k, b, m) {
        this.rendered && (b ? (this.rendered[k.id] && this.rendered[k.id].parentNode ? this.replace_item(k.id, b) : m.appendChild(b), this.rendered[k.id] = b) : this.rendered[k.id] && this.remove_item(k.id));
      }, replace_item: function(k, b) {
        var m = this.rendered[k];
        m && m.parentNode && m.parentNode.replaceChild(b, m), this.rendered[k] = b;
      }, remove_item: function(k) {
        this.hide(k), delete this.rendered[k];
      }, hide: function(k) {
        var b = this.rendered[k];
        b && b.parentNode && b.parentNode.removeChild(b), delete this.rendered[k];
      }, restore: function(k, b) {
        var m = this.rendered[k.id];
        m ? m.parentNode || this.append(k, m, b || d) : this.render_item(k, b || d);
      }, change_id: function(k, b) {
        this.rendered[b] = this.rendered[k], delete this.rendered[k];
      }, rendered: i[o], node: d, destructor: function() {
        this.clear(), delete a[o], delete i[o];
      } }, a[o];
    }
    return { getRenderer: s, clearRenderers: function() {
      for (var o in a) s(o).destructor();
    } };
  }(t);
  return { createGroup: function(e, i, a, r) {
    var s = { tempCollection: [], renderers: {}, container: e, filters: [], getLayers: function() {
      this._add();
      var o = [];
      for (var l in this.renderers) o.push(this.renderers[l]);
      return o;
    }, getLayer: function(o) {
      return this.renderers[o];
    }, _add: function(o) {
      o && (o.id = o.id || ut(), this.tempCollection.push(o));
      const l = this.container(), d = this.tempCollection;
      for (let u = 0; u < d.length; u++) {
        if (o = d[u], !(this.container() || o && o.container && o.container.isConnected)) continue;
        let c = o.container, h = o.id, _ = o.topmost;
        if (!c.parentNode) if (_) l.appendChild(c);
        else {
          let f = i ? i() : l.firstChild;
          f && f.parentNode == l ? l.insertBefore(c, f) : l.appendChild(c);
        }
        this.renderers[h] = n.getRenderer(h, o, c), r && r(o, t), this.tempCollection.splice(u, 1), u--;
      }
    }, addLayer: function(o) {
      if (o) {
        typeof o == "function" && (o = { renderer: o }), o.filter === void 0 ? o.filter = mn(a || []) : o.filter instanceof Array && (o.filter.push(a), o.filter = mn(o.filter)), o.container || (o.container = document.createElement("div"));
        var l = this;
        o.requestUpdate = function() {
          t.config.smart_rendering && !Ft(t) && l.renderers[o.id] && l.onUpdateRequest(l.renderers[o.id]);
        };
      }
      return this._add(o), o ? o.id : void 0;
    }, onUpdateRequest: function(o) {
    }, eachLayer: function(o) {
      for (var l in this.renderers) o(this.renderers[l]);
    }, removeLayer: function(o) {
      this.renderers[o] && (this.renderers[o].destructor(), delete this.renderers[o]);
    }, clear: function() {
      for (var o in this.renderers) this.renderers[o].destructor();
      this.renderers = {};
    } };
    return t.attachEvent("onDestroy", function() {
      s.clear(), s = null;
    }), s;
  } };
};
function mn(t) {
  return t instanceof Array || (t = Array.prototype.slice.call(arguments, 0)), function(n) {
    for (var e = !0, i = 0, a = t.length; i < a; i++) {
      var r = t[i];
      r && (e = e && r(n.id, n) !== !1);
    }
    return e;
  };
}
function vn(t, n, e) {
  if (!t.start_date || !t.end_date) return null;
  var i = n.posFromDate(t.start_date, n._getPositioningContext ? n._getPositioningContext(t) : null), a = n.posFromDate(t.end_date, n._getPositioningContext ? n._getPositioningContext(t) : null), r = Math.min(i, a) - 200, s = Math.max(i, a) + 200;
  return { top: n.getItemTop(t.id), height: n.getItemHeight(t.id), left: r, width: s - r };
}
function Xn() {
  var t = [], n = !1;
  function e() {
    t = [], n = !1;
  }
  function i(r, s, o) {
    s.$getConfig(), r.getVisibleItems().forEach(function(l) {
      var d = function(u, c, h, _) {
        if (!_.isTaskExists(u.source) || !_.isTaskExists(u.target)) return null;
        var f = vn(_.getTask(u.source), c), v = vn(_.getTask(u.target), c);
        if (!f || !v) return null;
        var k = 100, b = Math.min(f.left, v.left) - k, m = Math.max(f.left + f.width, v.left + v.width) + k, g = Math.min(f.top, v.top) - k, p = Math.max(f.top + f.height, v.top + v.height) + k;
        return { top: g, height: p - g, bottom: p, left: b, width: m - b, right: m };
      }(l, s, 0, o);
      d && t.push({ id: l.id, rec: d });
    }), t.sort(function(l, d) {
      return l.rec.right < d.rec.right ? -1 : 1;
    }), n = !0;
  }
  var a = !1;
  return function(r, s, o, l, d) {
    (function(f) {
      a || (a = !0, f.attachEvent("onPreFilter", e), f.attachEvent("onStoreUpdated", e), f.attachEvent("onClearAll", e), f.attachEvent("onBeforeStoreUpdate", e));
    })(l), n || i(l, s, r);
    for (var u = [], c = 0; c < t.length; c++) {
      var h = t[c], _ = h.rec;
      _.right < d.x || _.left < d.x_end && _.right > d.x && _.top < d.y_end && _.bottom > d.y && u.push(h.id);
    }
    return { ids: u };
  };
}
function Zn(t, n, e, i, a) {
  var r = e.$gantt.getTask(t.source), s = e.$gantt.getTask(t.target), o = e.getItemTop(r.id), l = e.getItemHeight(r.id), d = e.getItemTop(s.id), u = e.getItemHeight(s.id);
  if (n.y > o + l && n.y > d + u || n.y_end < d && n.y_end < o) return !1;
  var c = 100, h = e.posFromDate(r.start_date, e._getPositioningContext ? e._getPositioningContext(t) : null), _ = e.posFromDate(r.end_date, e._getPositioningContext ? e._getPositioningContext(t) : null), f = e.posFromDate(s.start_date, e._getPositioningContext ? e._getPositioningContext(t) : null), v = e.posFromDate(s.end_date, e._getPositioningContext ? e._getPositioningContext(t) : null);
  if (h > _) {
    var k = _;
    _ = h, h = k;
  }
  return f > v && (k = v, v = f, f = k), h += -100, _ += c, f += -100, v += c, !(n.x > _ && n.x > v) && !(n.x_end < h && n.x_end < f);
}
function Qa(t, n) {
  if (t.view) {
    var e = t.view;
    typeof e == "string" && (e = n.$ui.getView(e)), e && e.attachEvent && e.attachEvent("onScroll", function() {
      n.$services.getService("state").getState("batchUpdate").batch_update || e.$config.$skipSmartRenderOnScroll || t.requestUpdate && t.requestUpdate();
    });
  }
}
var wt = function() {
  function t(n, e, i, a) {
    n && (this.$container = We(n), this.$parent = n), this.$config = H(e, { headerHeight: 33 }), this.$gantt = a, this.$domEvents = a._createDomEventScope(), this.$id = e.id || "c" + ut(), this.$name = "cell", this.$factory = i, this.$externalComponent = null, _t(this);
  }
  return t.prototype.destructor = function() {
    this.$parent = this.$container = this.$view = null, this.$gantt.$services.getService("mouseEvents").detach("click", "gantt_header_arrow", this._headerClickHandler), this.$domEvents.detachAll(), this.callEvent("onDestroy", []), this.detachAllEvents();
  }, t.prototype.cell = function(n) {
    return null;
  }, t.prototype.scrollTo = function(n, e) {
    var i = this.$view;
    this.$config.html && (i = this.$view.firstChild), 1 * n == n && (i.scrollLeft = n), 1 * e == e && (i.scrollTop = e);
  }, t.prototype.clear = function() {
    this.getNode().innerHTML = "", this.getNode().className = "gantt_layout_content", this.getNode().style.padding = "0";
  }, t.prototype.resize = function(n) {
    if (this.$parent) return this.$parent.resize(n);
    n === !1 && (this.$preResize = !0);
    var e = this.$container, i = e.offsetWidth, a = e.offsetHeight, r = this.getSize();
    e === document.body && (i = document.body.offsetWidth, a = document.body.offsetHeight), i < r.minWidth && (i = r.minWidth), i > r.maxWidth && (i = r.maxWidth), a < r.minHeight && (a = r.minHeight), a > r.maxHeight && (a = r.maxHeight), this.setSize(i, a), this.$preResize, this.$preResize = !1;
  }, t.prototype.hide = function() {
    this._hide(!0), this.resize();
  }, t.prototype.show = function(n) {
    this._hide(!1), n && this.$parent && this.$parent.show(), this.resize();
  }, t.prototype._hide = function(n) {
    if (n === !0 && this.$view.parentNode) this.$view.parentNode.removeChild(this.$view);
    else if (n === !1 && !this.$view.parentNode) {
      var e = this.$parent.cellIndex(this.$id);
      this.$parent.moveView(this, e);
    }
    this.$config.hidden = n;
  }, t.prototype.$toHTML = function(n, e) {
    n === void 0 && (n = ""), e = [e || "", this.$config.css || ""].join(" ");
    var i = this.$config, a = "";
    if (i.raw) n = typeof i.raw == "string" ? i.raw : "";
    else {
      if (!n) {
        let r = null;
        r = typeof i.html == "function" ? i.html() : i.html, this.$gantt.config.external_render && this.$gantt.config.external_render.isElement(r) && (this.$externalComponent = r, r = null), n = "<div class='gantt_layout_content' " + (e ? " class='" + e + "' " : "") + " >" + (r || "") + "</div>";
      }
      i.header && (a = "<div class='gantt_layout_header'>" + (i.canCollapse ? "<div class='gantt_layout_header_arrow'></div>" : "") + "<div class='gantt_layout_header_content'>" + i.header + "</div></div>");
    }
    return "<div class='gantt_layout_cell " + e + "' data-cell-id='" + this.$id + "'>" + a + n + "</div>";
  }, t.prototype.$fill = function(n, e) {
    this.$view = n, this.$parent = e, this.init();
  }, t.prototype.getNode = function() {
    return this.$view.querySelector("gantt_layout_cell") || this.$view;
  }, t.prototype.init = function() {
    var n = this;
    this._headerClickHandler = function(e) {
      et(e, "data-cell-id") == n.$id && n.toggle();
    }, this.$gantt.$services.getService("mouseEvents").delegate("click", "gantt_header_arrow", this._headerClickHandler), this.callEvent("onReady", []);
  }, t.prototype.toggle = function() {
    this.$config.collapsed = !this.$config.collapsed, this.resize();
  }, t.prototype.getSize = function() {
    var n = { height: this.$config.height || 0, width: this.$config.width || 0, gravity: this.$config.gravity || 1, minHeight: this.$config.minHeight || 0, minWidth: this.$config.minWidth || 0, maxHeight: this.$config.maxHeight || 1e11, maxWidth: this.$config.maxWidth || 1e11 };
    if (this.$config.collapsed) {
      var e = this.$config.mode === "x";
      n[e ? "width" : "height"] = n[e ? "maxWidth" : "maxHeight"] = this.$config.headerHeight;
    }
    return n;
  }, t.prototype.getContentSize = function() {
    var n = this.$lastSize.contentX;
    n !== 1 * n && (n = this.$lastSize.width);
    var e = this.$lastSize.contentY;
    return e !== 1 * e && (e = this.$lastSize.height), { width: n, height: e };
  }, t.prototype._getBorderSizes = function() {
    var n = { top: 0, right: 0, bottom: 0, left: 0, horizontal: 0, vertical: 0 };
    return this._currentBorders && (this._currentBorders[this._borders.left] && (n.left = 1, n.horizontal++), this._currentBorders[this._borders.right] && (n.right = 1, n.horizontal++), this._currentBorders[this._borders.top] && (n.top = 1, n.vertical++), this._currentBorders[this._borders.bottom] && (n.bottom = 1, n.vertical++)), n;
  }, t.prototype.setSize = function(n, e) {
    this.$view.style.width = n + "px", this.$view.style.height = e + "px";
    var i = this._getBorderSizes(), a = e - i.vertical, r = n - i.horizontal;
    this.$lastSize = { x: n, y: e, contentX: r, contentY: a }, this.$config.header ? this._sizeHeader() : this._sizeContent();
  }, t.prototype._borders = { left: "gantt_layout_cell_border_left", right: "gantt_layout_cell_border_right", top: "gantt_layout_cell_border_top", bottom: "gantt_layout_cell_border_bottom" }, t.prototype._setBorders = function(n, e) {
    e || (e = this);
    var i = e.$view;
    for (var a in this._borders) Nt(i, this._borders[a]);
    typeof n == "string" && (n = [n]);
    var r = {};
    for (a = 0; a < n.length; a++) xt(i, n[a]), r[n[a]] = !0;
    e._currentBorders = r;
  }, t.prototype._sizeContent = function() {
    var n = this.$view.childNodes[0];
    n && n.className == "gantt_layout_content" && (n.style.height = this.$lastSize.contentY + "px");
  }, t.prototype._sizeHeader = function() {
    var n = this.$lastSize;
    n.contentY -= this.$config.headerHeight;
    var e = this.$view.childNodes[0], i = this.$view.childNodes[1], a = this.$config.mode === "x";
    if (this.$config.collapsed) if (i.style.display = "none", a) {
      e.className = "gantt_layout_header collapsed_x", e.style.width = n.y + "px";
      var r = Math.floor(n.y / 2 - n.x / 2);
      e.style.transform = "rotate(90deg) translate(" + r + "px, " + r + "px)", i.style.display = "none";
    } else e.className = "gantt_layout_header collapsed_y";
    else e.className = a ? "gantt_layout_header" : "gantt_layout_header vertical", e.style.width = "auto", e.style.transform = "", i.style.display = "", i.style.height = n.contentY + "px";
    e.style.height = this.$config.headerHeight + "px";
  }, t;
}();
function F(t, n) {
  for (var e in n) n.hasOwnProperty(e) && (t[e] = n[e]);
  function i() {
    this.constructor = t;
  }
  t.prototype = n === null ? Object.create(n) : (i.prototype = n.prototype, new i());
}
var Qn = function(t) {
  function n(e, i, a) {
    var r = t.apply(this, arguments) || this;
    return e && (r.$root = !0), r._parseConfig(i), r.$name = "layout", r;
  }
  return F(n, t), n.prototype.destructor = function() {
    this.$container && this.$view && An(this.$view);
    for (var e = 0; e < this.$cells.length; e++)
      this.$cells[e].destructor();
    this.$cells = [], t.prototype.destructor.call(this);
  }, n.prototype._resizeScrollbars = function(e, i) {
    var a = !1, r = [], s = [];
    const o = [];
    function l(f) {
      f.$parent.show(), a = !0, r.push(f);
    }
    function d(f) {
      f.$parent.hide(), a = !0, s.push(f);
    }
    for (var u, c = 0; c < i.length; c++) e[(u = i[c]).$config.scroll] ? d(u) : u.shouldHide() ? o.push(u) : u.shouldShow() ? l(u) : u.isVisible() ? r.push(u) : s.push(u);
    var h = {};
    for (c = 0; c < r.length; c++) r[c].$config.group && (h[r[c].$config.group] = !0);
    for (o.forEach(function(f) {
      f.$config.group && h[f.$config.group] || d(f);
    }), c = 0; c < s.length; c++) if ((u = s[c]).$config.group && h[u.$config.group]) {
      l(u);
      for (var _ = 0; _ < r.length; _++) if (r[_] == u) {
        this.$gantt.$scrollbarRepaint = !0;
        break;
      }
    }
    return a;
  }, n.prototype.getScrollbarsInfo = function() {
    const e = this.getCellsByType("scroller"), i = [];
    return e.forEach((a) => {
      let r = {};
      const { visible: s, direction: o, size: l, scrollSize: d, position: u } = a.getScrollState();
      let c = a._getLinkedViews().map((h) => h.$config.id);
      r.id = a.$id, r.visible = s, r.boundViews = c, o === "x" ? (r.x = l, r.x_inner = d, r.x_pos = u || 0) : (r.y = l, r.y_inner = d, r.y_pos = u || 0), i.push(r);
    }), i;
  }, n.prototype._syncCellSizes = function(e, i) {
    if (e) {
      var a = {};
      return this._eachChild(function(r) {
        r.$config.group && r.$name != "scrollbar" && r.$name != "resizer" && (a[r.$config.group] || (a[r.$config.group] = []), a[r.$config.group].push(r));
      }), a[e] && this._syncGroupSize(a[e], i), a[e];
    }
  }, n.prototype._syncGroupSize = function(e, i) {
    if (e.length) for (var a = e[0].$parent._xLayout ? "width" : "height", r = e[0].$parent.getNextSibling(e[0].$id) ? 1 : -1, s = i.value, o = i.isGravity, l = 0; l < e.length; l++) {
      var d = e[l].getSize(), u = r > 0 ? e[l].$parent.getNextSibling(e[l].$id) : e[l].$parent.getPrevSibling(e[l].$id);
      u.$name == "resizer" && (u = r > 0 ? u.$parent.getNextSibling(u.$id) : u.$parent.getPrevSibling(u.$id));
      var c = u.getSize();
      if (o) e[l].$config.gravity = s;
      else if (u[a]) {
        var h = d.gravity + c.gravity, _ = d[a] + c[a], f = h / _;
        e[l].$config.gravity = f * s, u.$config[a] = _ - s, u.$config.gravity = h - f * s;
      } else e[l].$config[a] = s;
      var v = this.$gantt.$ui.getView("grid");
      !v || e[l].$content !== v || v.$config.scrollable || o || (this.$gantt.config.grid_width = s);
    }
  }, n.prototype.resize = function(e) {
    var i = !1;
    if (this.$root && !this._resizeInProgress && (this.callEvent("onBeforeResize", []), i = !0, this._resizeInProgress = !0), t.prototype.resize.call(this, !0), t.prototype.resize.call(this, !1), i) {
      var a = [];
      a = (a = (a = a.concat(this.getCellsByType("viewCell"))).concat(this.getCellsByType("viewLayout"))).concat(this.getCellsByType("hostCell"));
      for (var r = this.getCellsByType("scroller"), s = 0; s < a.length; s++) a[s].$config.hidden || a[s].setContentSize();
      var o = this._getAutosizeMode(this.$config.autosize), l = this._resizeScrollbars(o, r);
      if (this.$config.autosize && (this.autosize(this.$config.autosize), a.forEach(function(d) {
        const u = d.$parent, c = u.getContentSize(o);
        o.x && (u.$config.$originalWidthStored || (u.$config.$originalWidthStored = !0, u.$config.$originalWidth = u.$config.width), u.$config.width = c.width), o.y && (u.$config.$originalHeightStored || (u.$config.$originalHeightStored = !0, u.$config.$originalHeight = u.$config.height), u.$config.height = c.height);
      }), l = !0), l)
        for (this.resize(), s = 0; s < a.length; s++) a[s].$config.hidden || a[s].setContentSize();
      this.callEvent("onResize", []);
    }
    i && (this._resizeInProgress = !1);
  }, n.prototype._eachChild = function(e, i) {
    if (e(i = i || this), i.$cells) for (var a = 0; a < i.$cells.length; a++) this._eachChild(e, i.$cells[a]);
  }, n.prototype.isChild = function(e) {
    var i = !1;
    return this._eachChild(function(a) {
      a !== e && a.$content !== e || (i = !0);
    }), i;
  }, n.prototype.getCellsByType = function(e) {
    var i = [];
    if (e === this.$name && i.push(this), this.$content && this.$content.$name == e && i.push(this.$content), this.$cells) for (var a = 0; a < this.$cells.length; a++) {
      var r = n.prototype.getCellsByType.call(this.$cells[a], e);
      r.length && i.push.apply(i, r);
    }
    return i;
  }, n.prototype.getNextSibling = function(e) {
    var i = this.cellIndex(e);
    return i >= 0 && this.$cells[i + 1] ? this.$cells[i + 1] : null;
  }, n.prototype.getPrevSibling = function(e) {
    var i = this.cellIndex(e);
    return i >= 0 && this.$cells[i - 1] ? this.$cells[i - 1] : null;
  }, n.prototype.cell = function(e) {
    for (var i = 0; i < this.$cells.length; i++) {
      var a = this.$cells[i];
      if (a.$id === e) return a;
      var r = a.cell(e);
      if (r) return r;
    }
  }, n.prototype.cellIndex = function(e) {
    for (var i = 0; i < this.$cells.length; i++) if (this.$cells[i].$id === e) return i;
    return -1;
  }, n.prototype.moveView = function(e, i) {
    if (this.$cells[i] !== e) return window.alert("Not implemented");
    i += this.$config.header ? 1 : 0;
    var a = this.$view;
    i >= a.childNodes.length ? a.appendChild(e.$view) : a.insertBefore(e.$view, a.childNodes[i]);
  }, n.prototype._parseConfig = function(e) {
    this.$cells = [], this._xLayout = !e.rows;
    for (var i = e.rows || e.cols || e.views, a = 0; a < i.length; a++) {
      var r = i[a];
      r.mode = this._xLayout ? "x" : "y";
      var s = this.$factory.initUI(r, this);
      s ? (s.$parent = this, this.$cells.push(s)) : (i.splice(a, 1), a--);
    }
  }, n.prototype.getCells = function() {
    return this.$cells;
  }, n.prototype.render = function() {
    var e = Dn(this.$container, this.$toHTML());
    this.$fill(e, null);
    const i = this.$gantt;
    this._eachChild((a) => {
      a.$externalComponent && (i.config.external_render.renderElement(a.$externalComponent, a.$view.querySelector(".gantt_layout_content")), a.$externalComponent = null);
    }), this.callEvent("onReady", []), this.resize(), this.render = this.resize;
  }, n.prototype.$fill = function(e, i) {
    this.$view = e, this.$parent = i;
    for (var a = In(e, "gantt_layout_cell"), r = a.length - 1; r >= 0; r--) {
      var s = this.$cells[r];
      s.$fill(a[r], this), s.$config.hidden && s.$view.parentNode.removeChild(s.$view);
    }
  }, n.prototype.$toHTML = function() {
    for (var e = this._xLayout ? "x" : "y", i = [], a = 0; a < this.$cells.length; a++) i.push(this.$cells[a].$toHTML());
    return t.prototype.$toHTML.call(this, i.join(""), (this.$root ? "gantt_layout_root " : "") + "gantt_layout gantt_layout_" + e);
  }, n.prototype.getContentSize = function(e) {
    for (var i, a, r, s = 0, o = 0, l = 0; l < this.$cells.length; l++) (a = this.$cells[l]).$config.hidden || (i = a.getContentSize(e), a.$config.view === "scrollbar" && e[a.$config.scroll] && (i.height = 0, i.width = 0), a.$config.resizer && (this._xLayout ? i.height = 0 : i.width = 0), r = a._getBorderSizes(), this._xLayout ? (s += i.width + r.horizontal, o = Math.max(o, i.height + r.vertical)) : (s = Math.max(s, i.width + r.horizontal), o += i.height + r.vertical));
    return { width: s += (r = this._getBorderSizes()).horizontal, height: o += r.vertical };
  }, n.prototype._cleanElSize = function(e) {
    return 1 * (e || "").toString().replace("px", "") || 0;
  }, n.prototype._getBoxStyles = function(e) {
    var i = null, a = ["width", "height", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"], r = { boxSizing: (i = window.getComputedStyle ? window.getComputedStyle(e, null) : { width: e.clientWidth, height: e.clientHeight }).boxSizing == "border-box" };
    i.MozBoxSizing && (r.boxSizing = i.MozBoxSizing == "border-box");
    for (var s = 0; s < a.length; s++) r[a[s]] = i[a[s]] ? this._cleanElSize(i[a[s]]) : 0;
    var o = { horPaddings: r.paddingLeft + r.paddingRight + r.borderLeftWidth + r.borderRightWidth, vertPaddings: r.paddingTop + r.paddingBottom + r.borderTopWidth + r.borderBottomWidth, borderBox: r.boxSizing, innerWidth: r.width, innerHeight: r.height, outerWidth: r.width, outerHeight: r.height };
    return o.borderBox ? (o.innerWidth -= o.horPaddings, o.innerHeight -= o.vertPaddings) : (o.outerWidth += o.horPaddings, o.outerHeight += o.vertPaddings), o;
  }, n.prototype._getAutosizeMode = function(e) {
    var i = { x: !1, y: !1 };
    return e === "xy" ? i.x = i.y = !0 : e === "y" || e === !0 ? i.y = !0 : e === "x" && (i.x = !0), i;
  }, n.prototype.autosize = function(e) {
    var i = this._getAutosizeMode(e), a = this._getBoxStyles(this.$container), r = this.getContentSize(e), s = this.$container;
    i.x && (a.borderBox && (r.width += a.horPaddings), s.style.width = r.width + "px"), i.y && (a.borderBox && (r.height += a.vertPaddings), s.style.height = r.height + "px");
  }, n.prototype.getSize = function() {
    this._sizes = [];
    for (var e = 0, i = 0, a = 1e11, r = 0, s = 1e11, o = 0, l = 0; l < this.$cells.length; l++) {
      var d = this._sizes[l] = this.$cells[l].getSize();
      this.$cells[l].$config.hidden || (this._xLayout ? (!d.width && d.minWidth ? e += d.minWidth : e += d.width, a += d.maxWidth, i += d.minWidth, r = Math.max(r, d.height), s = Math.min(s, d.maxHeight), o = Math.max(o, d.minHeight)) : (!d.height && d.minHeight ? r += d.minHeight : r += d.height, s += d.maxHeight, o += d.minHeight, e = Math.max(e, d.width), a = Math.min(a, d.maxWidth), i = Math.max(i, d.minWidth)));
    }
    var u = t.prototype.getSize.call(this);
    return u.maxWidth >= 1e5 && (u.maxWidth = a), u.maxHeight >= 1e5 && (u.maxHeight = s), u.minWidth = u.minWidth != u.minWidth ? 0 : u.minWidth, u.minHeight = u.minHeight != u.minHeight ? 0 : u.minHeight, this._xLayout ? (u.minWidth += this.$config.margin * this.$cells.length || 0, u.minWidth += 2 * this.$config.padding || 0, u.minHeight += 2 * this.$config.padding || 0) : (u.minHeight += this.$config.margin * this.$cells.length || 0, u.minHeight += 2 * this.$config.padding || 0), u;
  }, n.prototype._calcFreeSpace = function(e, i, a) {
    var r = a ? i.minWidth : i.minHeight, s = i.maxWidth, o = e;
    return o ? (o > s && (o = s), o < r && (o = r), this._free -= o) : ((o = Math.floor(this._free / this._gravity * i.gravity)) > s && (o = s, this._free -= o, this._gravity -= i.gravity), o < r && (o = r, this._free -= o, this._gravity -= i.gravity)), o;
  }, n.prototype._calcSize = function(e, i, a) {
    var r = e, s = a ? i.minWidth : i.minHeight, o = a ? i.maxWidth : i.maxHeight;
    return r || (r = Math.floor(this._free / this._gravity * i.gravity)), r > o && (r = o), r < s && (r = s), r;
  }, n.prototype._configureBorders = function() {
    this.$root && this._setBorders([this._borders.left, this._borders.top, this._borders.right, this._borders.bottom], this);
    for (var e = this._xLayout ? this._borders.right : this._borders.bottom, i = this.$cells, a = i.length - 1, r = a; r >= 0; r--) if (!i[r].$config.hidden) {
      a = r;
      break;
    }
    for (r = 0; r < i.length; r++) if (!i[r].$config.hidden) {
      var s = r >= a, o = "";
      !s && i[r + 1] && i[r + 1].$config.view == "scrollbar" && (this._xLayout ? s = !0 : o = "gantt_layout_cell_border_transparent"), this._setBorders(s ? [] : [e, o], i[r]);
    }
  }, n.prototype._updateCellVisibility = function() {
    for (var e = this._visibleCells || {}, i = !this._visibleCells, a = {}, r = null, s = [], o = 0; o < this._sizes.length; o++) (r = this.$cells[o]).$config.hide_empty && s.push(r), !i && r.$config.hidden && e[r.$id] ? r._hide(!0) : r.$config.hidden || e[r.$id] || r._hide(!1), r.$config.hidden || (a[r.$id] = !0);
    for (this._visibleCells = a, o = 0; o < s.length; o++) {
      var l = (r = s[o]).$cells, d = !0;
      l.forEach(function(u) {
        u.$config.hidden || u.$config.resizer || (d = !1);
      }), r.$config.hidden = d;
    }
  }, n.prototype.setSize = function(e, i) {
    this._configureBorders(), t.prototype.setSize.call(this, e, i), i = this.$lastSize.contentY, e = this.$lastSize.contentX;
    var a, r, s = this.$config.padding || 0;
    this.$view.style.padding = s + "px", this._gravity = 0, this._free = this._xLayout ? e : i, this._free -= 2 * s, this._updateCellVisibility();
    for (var o = 0; o < this._sizes.length; o++) if (!(a = this.$cells[o]).$config.hidden) {
      var l = this.$config.margin || 0;
      a.$name != "resizer" || l || (l = -1);
      var d = a.$view, u = this._xLayout ? "marginRight" : "marginBottom";
      o !== this.$cells.length - 1 && (d.style[u] = l + "px", this._free -= l), r = this._sizes[o], this._xLayout ? r.width || (this._gravity += r.gravity) : r.height || (this._gravity += r.gravity);
    }
    for (o = 0; o < this._sizes.length; o++) if (!(a = this.$cells[o]).$config.hidden) {
      var c = (r = this._sizes[o]).width, h = r.height;
      this._xLayout ? this._calcFreeSpace(c, r, !0) : this._calcFreeSpace(h, r, !1);
    }
    for (o = 0; o < this.$cells.length; o++) if (!(a = this.$cells[o]).$config.hidden) {
      r = this._sizes[o];
      var _ = void 0, f = void 0;
      this._xLayout ? (_ = this._calcSize(r.width, r, !0), f = i - 2 * s) : (_ = e - 2 * s, f = this._calcSize(r.height, r, !1)), a.setSize(_, f);
    }
  }, n;
}(wt), tr = function(t) {
  function n(e, i, a) {
    for (var r = t.apply(this, arguments) || this, s = 0; s < r.$cells.length; s++) r.$cells[s].$config.hidden = s !== 0;
    return r.$cell = r.$cells[0], r.$name = "viewLayout", r;
  }
  return F(n, t), n.prototype.cell = function(e) {
    var i = t.prototype.cell.call(this, e);
    return i.$view || this.$fill(null, this), i;
  }, n.prototype.moveView = function(e) {
    var i = this.$view;
    this.$cell && (this.$cell.$config.hidden = !0, i.removeChild(this.$cell.$view)), this.$cell = e, i.appendChild(e.$view);
  }, n.prototype.setSize = function(e, i) {
    wt.prototype.setSize.call(this, e, i);
  }, n.prototype.setContentSize = function() {
    var e = this.$lastSize;
    this.$cell.setSize(e.contentX, e.contentY);
  }, n.prototype.getSize = function() {
    var e = t.prototype.getSize.call(this);
    if (this.$cell) {
      var i = this.$cell.getSize();
      if (this.$config.byMaxSize) for (var a = 0; a < this.$cells.length; a++) {
        var r = this.$cells[a].getSize();
        for (var s in i) i[s] = Math.max(i[s], r[s]);
      }
      for (var o in e) e[o] = e[o] || i[o];
      e.gravity = Math.max(e.gravity, i.gravity);
    }
    return e;
  }, n;
}(Qn), er = function(t) {
  function n(e, i, a) {
    var r = t.apply(this, arguments) || this;
    if (i.view) {
      i.id && (this.$id = ut());
      var s = J(i);
      if (delete s.config, delete s.templates, this.$content = this.$factory.createView(i.view, this, s, this), !this.$content) return !1;
    }
    return r.$name = "viewCell", r;
  }
  return F(n, t), n.prototype.destructor = function() {
    this.clear(), t.prototype.destructor.call(this);
  }, n.prototype.clear = function() {
    if (this.$initialized = !1, this.$content) {
      var e = this.$content.unload || this.$content.destructor;
      e && e.call(this.$content);
    }
    t.prototype.clear.call(this);
  }, n.prototype.scrollTo = function(e, i) {
    this.$content && this.$content.scrollTo ? this.$content.scrollTo(e, i) : t.prototype.scrollTo.call(this, e, i);
  }, n.prototype._setContentSize = function(e, i) {
    var a = this._getBorderSizes();
    if (typeof e == "number") {
      var r = e + a.horizontal;
      this.$config.width = r;
    }
    if (typeof i == "number") {
      var s = i + a.vertical;
      this.$config.height = s;
    }
  }, n.prototype.setSize = function(e, i) {
    if (t.prototype.setSize.call(this, e, i), !this.$preResize && this.$content && !this.$initialized) {
      this.$initialized = !0;
      var a = this.$view.childNodes[0], r = this.$view.childNodes[1];
      r || (r = a), this.$content.init(r);
    }
  }, n.prototype.setContentSize = function() {
    !this.$preResize && this.$content && this.$initialized && this.$content.setSize(this.$lastSize.contentX, this.$lastSize.contentY);
  }, n.prototype.getContentSize = function() {
    var e = t.prototype.getContentSize.call(this);
    if (this.$content && this.$initialized) {
      var i = this.$content.getSize();
      e.width = i.contentX === void 0 ? i.width : i.contentX, e.height = i.contentY === void 0 ? i.height : i.contentY;
    }
    var a = this._getBorderSizes();
    return e.width += a.horizontal, e.height += a.vertical, e;
  }, n;
}(wt), nr = function(t) {
  function n(e, i, a) {
    var r, s, o = t.apply(this, arguments) || this;
    function l(d) {
      var u = d.pageX, c = d.pageY;
      return d.touches && (u = d.touches[0].pageX, c = d.touches[0].pageY), { x: u, y: c };
    }
    return o._moveHandler = function(d) {
      o._moveResizer(o._resizer, l(d).x, l(d).y);
    }, o._upHandler = function(d) {
      var u = o._getNewSizes();
      o.callEvent("onResizeEnd", [r, s, u ? u.back : 0, u ? u.front : 0]) !== !1 && o._setSizes(), o._setBackground(!1), o._clearResizer(), o._clearListeneres(), d.touches && (o.$gantt._prevent_touch_scroll = !1);
    }, o._clearListeneres = function() {
      this.$domEvents.detach(document, "mouseup", o._upHandler), this.$domEvents.detach(document, "mousemove", o._moveHandler), this.$domEvents.detach(document, "mousemove", o._startOnMove), this.$domEvents.detach(document, "mouseup", o._cancelDND), this.$domEvents.detach(document, "touchend", o._upHandler), this.$domEvents.detach(document, "touchmove", o._startOnMove), this.$domEvents.detach(document, "touchstart", o._downHandler);
    }, o._callStartDNDEvent = function() {
      if (this._xMode ? (r = this._behind.$config.width || this._behind.$view.offsetWidth, s = this._front.$config.width || this._front.$view.offsetWidth) : (r = this._behind.$config.height || this._behind.$view.offsetHeight, s = this._front.$config.height || this._front.$view.offsetHeight), o.callEvent("onResizeStart", [r, s]) === !1) return !1;
    }, o._startDND = function(d) {
      if (this._callStartDNDEvent() !== !1) {
        var u = !1;
        this._eachGroupItem(function(c) {
          c._getSiblings(), c._callStartDNDEvent() === !1 && (u = !0);
        }), u || (o._moveHandler(d), o.$domEvents.attach(document, "mousemove", o._moveHandler), o.$domEvents.attach(document, "mouseup", o._upHandler));
      }
    }, o._cancelDND = function() {
      o._setBackground(!1), o._clearResizer(), o._clearListeneres();
    }, o._startOnMove = function(d) {
      d.touches && (o.$gantt._touch_drag = !0, o.$gantt._prevent_touch_scroll = !0), o._isPosChanged(d) && (o._clearListeneres(), o._startDND(d));
    }, o._downHandler = function(d) {
      o._getSiblings(), o._behind.$config.collapsed || o._front.$config.collapsed || (o._setBackground(!0), o._resizer = o._setResizer(), o._positions = { x: l(d).x, y: l(d).y, timestamp: Date.now() }, o.$domEvents.attach(document, "mousemove", o._startOnMove), o.$domEvents.attach(document, "mouseup", o._cancelDND));
    }, o.$name = "resizer", o;
  }
  return F(n, t), n.prototype.init = function() {
    var e = this;
    t.prototype.init.call(this), this._xMode = this.$config.mode === "x", this._xMode && !this.$config.width ? this.$config.width = this.$config.minWidth = 1 : this._xMode || this.$config.height || (this.$config.height = this.$config.minHeight = 1), this.$config.margin = -1, this.$domEvents.attach(this.$view, "mousedown", e._downHandler), this.$domEvents.attach(this.$view, "touchstart", e._downHandler), this.$domEvents.attach(this.$view, "touchmove", e._startOnMove), this.$domEvents.attach(this.$view, "touchend", e._upHandler);
  }, n.prototype.$toHTML = function() {
    var e = this.$config.mode, i = this.$config.css || "";
    return "<div class='gantt_layout_cell gantt_resizer gantt_resizer_" + e + "'><div class='gantt_layout_content gantt_resizer_" + e + (i ? " " + i : "") + "'></div></div>";
  }, n.prototype._clearResizer = function() {
    this._resizer && (this._resizer.parentNode && this._resizer.parentNode.removeChild(this._resizer), this._resizer = null);
  }, n.prototype._isPosChanged = function(e) {
    return !!this._positions && (Math.abs(this._positions.x - e.pageX) > 3 || Math.abs(this._positions.y - e.pageY) > 3 || Date.now() - this._positions.timestamp > 300);
  }, n.prototype._getSiblings = function() {
    var e = this.$parent.getCells();
    this.$config.prev && (this._behind = this.$factory.getView(this.$config.prev), this._behind instanceof wt || (this._behind = this._behind.$parent)), this.$config.next && (this._front = this.$factory.getView(this.$config.next), this._front instanceof wt || (this._front = this._behind.$parent));
    for (var i = 0; i < e.length; i++) this === e[i] && (this._behind || (this._behind = e[i - 1]), this._front || (this._front = e[i + 1]));
  }, n.prototype._setBackground = function(e) {
    var i = "gantt_resizing";
    if (!e) return Nt(this._behind.$view, i), Nt(this._front.$view, i), void document.body.classList.remove("gantt_noselect");
    xt(this._behind.$view, i), xt(this._front.$view, i), document.body.classList.add("gantt_noselect");
  }, n.prototype._setResizer = function() {
    var e = document.createElement("div");
    return e.className = "gantt_resizer_stick", this.$view.appendChild(e), this.$view.style.overflow = "visible", e.style.height = this.$view.style.height, e;
  }, n.prototype._getDirection = function(e, i) {
    var a;
    return (a = this._xMode ? e - this._positions.x : i - this._positions.y) ? a < 0 ? -1 : 1 : 0;
  }, n.prototype._getResizePosition = function(e, i) {
    var a, r, s, o, l;
    this._xMode ? (a = e - this._positions.x, r = this._behind.$config.width || this._behind.$view.offsetWidth, o = this._front.$config.width || this._front.$view.offsetWidth, s = this._behind.$config.minWidth, l = this._front.$config.minWidth) : (a = i - this._positions.y, r = this._behind.$config.height || this._behind.$view.offsetHeight, o = this._front.$config.height || this._front.$view.offsetHeight, s = this._front.$config.minHeight, l = this._front.$config.minHeight);
    var d, u, c = this._getDirection(e, i);
    if (c === -1) {
      if (u = o - a, d = r - Math.abs(a), o - a > this._front.$config.maxWidth) return;
      Math.abs(a) >= r && (a = -Math.abs(r - 2)), r - Math.abs(a) <= s && (a = -Math.abs(r - s));
    } else u = o - Math.abs(a), d = r + a, r + a > this._behind.$config.maxWidth && (a = this._behind.$config.maxWidth - r), Math.abs(a) >= o && (a = o - 2), o - Math.abs(a) <= l && (a = Math.abs(o - l));
    return c === -1 ? (u = o - a, d = r - Math.abs(a)) : (u = o - Math.abs(a), d = r + a), { size: a, newFrontSide: u, newBehindSide: d };
  }, n.prototype._getGroupName = function() {
    return this._getSiblings(), this._front.$config.group || this._behind.$config.group;
  }, n.prototype._eachGroupItem = function(e, i) {
    for (var a = this.$factory.getView("main"), r = this._getGroupName(), s = a.getCellsByType("resizer"), o = 0; o < s.length; o++) s[o]._getGroupName() == r && s[o] != this && e.call(i || this, s[o]);
  }, n.prototype._getGroupResizePosition = function(e, i) {
    var a = this._getResizePosition(e, i);
    if (!this._getGroupName()) return a;
    var r, s = [a];
    this._eachGroupItem(function(l) {
      l._getSiblings();
      var d = J(this._positions);
      this._xMode ? d.x += l._behind.$config.width - this._behind.$config.width : d.y += l._behind.$config.height - this._behind.$config.height, l._positions = d, s.push(l._getResizePosition(e, i));
    });
    for (var o = 0; o < s.length; o++) {
      if (!s[o]) return;
      (r === void 0 || s[o].newBehindSide > r.newBehindSide) && (r = s[o]);
    }
    return r;
  }, n.prototype._moveResizer = function(e, i, a) {
    if (i !== 0) {
      var r = this._getGroupResizePosition(i, a);
      r && Math.abs(r.size) !== 1 && (this._xMode ? (e.style.left = r.size + "px", this._positions.nextX = r.size || 0) : (e.style.top = r.size + "px", this._positions.nextY = r.size || 0), this.callEvent("onResize", [r.newBehindSide, r.newFrontSide]));
    }
  }, n.prototype._setGravity = function(e) {
    var i = this._xMode ? "offsetWidth" : "offsetHeight", a = this._xMode ? this._positions.nextX : this._positions.nextY, r = this._front.$view[i], s = this._behind.$view[i], o = (r - a) / r * this._front.getSize().gravity, l = (s + a) / s * this._behind.getSize().gravity;
    e !== "front" && (this._front.$config.gravity = o), e !== "behind" && (this._behind.$config.gravity = l);
  }, n.prototype._getNewSizes = function() {
    var e, i, a;
    return this._xMode ? (e = this._behind.$config.width, i = this._front.$config.width, a = this._positions.nextX) : (e = this._behind.$config.height, i = this._front.$config.height, a = this._positions.nextY), i || e ? { front: i ? i - a || 1 : 0, back: e ? e + a || 1 : 0 } : null;
  }, n.prototype._assignNewSizes = function(e) {
    this._getSiblings();
    var i = this._xMode ? "width" : "height";
    e ? (e.front ? this._front.$config[i] = e.front : this._setGravity("behind"), e.back ? this._behind.$config[i] = e.back : this._setGravity("front")) : this._setGravity();
  }, n.prototype._setSizes = function() {
    this._resizer && this.$view.removeChild(this._resizer);
    var e = this._getNewSizes();
    if (this._positions.nextX || this._positions.nextY) {
      this._assignNewSizes(e);
      var i, a = this._xMode ? "width" : "height";
      e && e.front || this._front.$config.group && (i = { value: this._front.$config.gravity, isGravity: !0 }, this.$gantt.$layout._syncCellSizes(this._front.$config.group, i)), e && e.back || this._behind.$config.group && (i = { value: this._behind.$config.gravity, isGravity: !0 }, this.$gantt.$layout._syncCellSizes(this._behind.$config.group, i)), e && (e.front ? this._front.$config.group && (i = { value: this._front.$config[a], isGravity: !1 }, this.$gantt.$layout._syncCellSizes(this._front.$config.group, i)) : e.back && this._behind.$config.group && (i = { value: this._behind.$config[a], isGravity: !1 }, this.$gantt.$layout._syncCellSizes(this._behind.$config.group, i))), this._getGroupName() ? this.$factory.getView("main").resize() : this.$parent.resize();
    }
  }, n;
}(wt), ir = function(t) {
  var n = ["altKey", "shiftKey", "metaKey"];
  function e(a, r, s, o) {
    var l = t.apply(this, arguments) || this;
    this.$config = H(r, { scroll: "x" }), l._scrollHorizontalHandler = j(l._scrollHorizontalHandler, l), l._scrollVerticalHandler = j(l._scrollVerticalHandler, l), l._outerScrollVerticalHandler = j(l._outerScrollVerticalHandler, l), l._outerScrollHorizontalHandler = j(l._outerScrollHorizontalHandler, l), l._mouseWheelHandler = j(l._mouseWheelHandler, l), this.$config.hidden = !0;
    var d = o.config.scroll_size;
    return o.env.isIE && (d += 1), this._isHorizontal() ? (l.$config.height = d, l.$parent.$config.height = d) : (l.$config.width = d, l.$parent.$config.width = d), this.$config.scrollPosition = 0, l.$name = "scroller", l;
  }
  function i(a, r) {
    if (r.push(a), a.$cells) for (var s = 0; s < a.$cells.length; s++) i(a.$cells[s], r);
  }
  return F(e, t), e.prototype.init = function(a) {
    a.innerHTML = this.$toHTML(), this.$view = a.firstChild, this.$view || this.init(), this._isVertical() ? this._initVertical() : this._initHorizontal(), this._initMouseWheel(), this._initLinkedViews();
  }, e.prototype.$toHTML = function() {
    return "<div class='gantt_layout_cell " + (this._isHorizontal() ? "gantt_hor_scroll" : "gantt_ver_scroll") + "'><div style='" + (this._isHorizontal() ? "width:2000px" : "height:2000px") + "'></div></div>";
  }, e.prototype._getRootParent = function() {
    for (var a = this.$parent; a && a.$parent; ) a = a.$parent;
    if (a) return a;
  }, e.prototype._eachView = function() {
    var a = [];
    return i(this._getRootParent(), a), a;
  }, e.prototype._getLinkedViews = function() {
    for (var a = this._eachView(), r = [], s = 0; s < a.length; s++) a[s].$config && (this._isVertical() && a[s].$config.scrollY == this.$id || this._isHorizontal() && a[s].$config.scrollX == this.$id) && r.push(a[s]);
    return r;
  }, e.prototype._initHorizontal = function() {
    this.$scroll_hor = this.$view, this.$domEvents.attach(this.$view, "scroll", this._scrollHorizontalHandler);
  }, e.prototype._initLinkedViews = function() {
    for (var a = this._getLinkedViews(), r = this._isVertical() ? "gantt_layout_outer_scroll gantt_layout_outer_scroll_vertical" : "gantt_layout_outer_scroll gantt_layout_outer_scroll_horizontal", s = 0; s < a.length; s++) xt(a[s].$view || a[s].getNode(), r);
  }, e.prototype._initVertical = function() {
    this.$scroll_ver = this.$view, this.$domEvents.attach(this.$view, "scroll", this._scrollVerticalHandler);
  }, e.prototype._updateLinkedViews = function() {
  }, e.prototype._initMouseWheel = function() {
    yt.isFF ? this.$domEvents.attach(this._getRootParent().$view, "wheel", this._mouseWheelHandler, { passive: !1 }) : this.$domEvents.attach(this._getRootParent().$view, "mousewheel", this._mouseWheelHandler, { passive: !1 });
  }, e.prototype.scrollHorizontally = function(a) {
    if (!this._scrolling) {
      this._scrolling = !0, this.$scroll_hor.scrollLeft = a, this.$config.codeScrollLeft = a, a = this.$scroll_hor.scrollLeft;
      for (var r = this._getLinkedViews(), s = 0; s < r.length; s++) r[s].scrollTo && r[s].scrollTo(a, void 0);
      var o = this.$config.scrollPosition;
      this.$config.scrollPosition = a, this.callEvent("onScroll", [o, a, this.$config.scroll]), this._scrolling = !1;
    }
  }, e.prototype.scrollVertically = function(a) {
    if (!this._scrolling) {
      this._scrolling = !0, this.$scroll_ver.scrollTop = a, a = this.$scroll_ver.scrollTop;
      for (var r = this._getLinkedViews(), s = 0; s < r.length; s++) r[s].scrollTo && r[s].scrollTo(void 0, a);
      var o = this.$config.scrollPosition;
      this.$config.scrollPosition = a, this.callEvent("onScroll", [o, a, this.$config.scroll]), this._scrolling = !1;
    }
  }, e.prototype._isVertical = function() {
    return this.$config.scroll == "y";
  }, e.prototype._isHorizontal = function() {
    return this.$config.scroll == "x";
  }, e.prototype._scrollHorizontalHandler = function(a) {
    if (!this._isVertical() && !this._scrolling) {
      if (/* @__PURE__ */ new Date() - (this._wheel_time || 0) < 100) return !0;
      var r = this.$scroll_hor.scrollLeft;
      this.scrollHorizontally(r), this._oldLeft = this.$scroll_hor.scrollLeft;
    }
  }, e.prototype._outerScrollHorizontalHandler = function(a) {
    this._isVertical();
  }, e.prototype.show = function() {
    this.$parent.show();
  }, e.prototype.hide = function() {
    this.$parent.hide();
  }, e.prototype._getScrollSize = function() {
    for (var a, r = 0, s = 0, o = this._isHorizontal(), l = this._getLinkedViews(), d = o ? "scrollWidth" : "scrollHeight", u = o ? "contentX" : "contentY", c = o ? "x" : "y", h = this._getScrollOffset(), _ = 0; _ < l.length; _++) if ((a = l[_]) && a.$content && a.$content.getSize && !a.$config.hidden) {
      var f, v = a.$content.getSize();
      if (f = v.hasOwnProperty(d) ? v[d] : v[u], h) v[u] > v[c] && v[u] > r && f > v[c] - h + 2 && (r = f + (o ? 0 : 2), s = v[c]);
      else {
        var k = Math.max(v[u] - f, 0);
        (f += k) > Math.max(v[c] - k, 0) && f > r && (r = f, s = v[c]);
      }
    }
    return { outerScroll: s, innerScroll: r };
  }, e.prototype.scroll = function(a) {
    this._isHorizontal() ? this.scrollHorizontally(a) : this.scrollVertically(a);
  }, e.prototype.getScrollState = function() {
    return { visible: this.isVisible(), direction: this.$config.scroll, size: this.$config.outerSize, scrollSize: this.$config.scrollSize || 0, position: this.$config.scrollPosition || 0 };
  }, e.prototype.setSize = function(a, r) {
    t.prototype.setSize.apply(this, arguments);
    var s = this._getScrollSize(), o = (this._isVertical() ? r : a) - this._getScrollOffset() + (this._isHorizontal() ? 1 : 0);
    s.innerScroll && o > s.outerScroll && (s.innerScroll += o - s.outerScroll), this.$config.scrollSize = s.innerScroll, this.$config.width = a, this.$config.height = r, this._setScrollSize(s.innerScroll);
  }, e.prototype.isVisible = function() {
    return !(!this.$parent || !this.$parent.$view.parentNode);
  }, e.prototype.shouldShow = function() {
    var a = this._getScrollSize();
    return !(!a.innerScroll && this.$parent && this.$parent.$view.parentNode) && !(!a.innerScroll || this.$parent && this.$parent.$view.parentNode);
  }, e.prototype.shouldHide = function() {
    return !(this._getScrollSize().innerScroll || !this.$parent || !this.$parent.$view.parentNode);
  }, e.prototype.toggleVisibility = function() {
    this.shouldHide() ? this.hide() : this.shouldShow() && this.show();
  }, e.prototype._getScaleOffset = function(a) {
    var r = 0;
    return !a || a.$config.view != "timeline" && a.$config.view != "grid" || (r = a.$content.$getConfig().scale_height), r;
  }, e.prototype._getScrollOffset = function() {
    var a = 0;
    if (this._isVertical()) {
      var r = this.$parent.$parent;
      a = Math.max(this._getScaleOffset(r.getPrevSibling(this.$parent.$id)), this._getScaleOffset(r.getNextSibling(this.$parent.$id)));
    } else for (var s = this._getLinkedViews(), o = 0; o < s.length; o++) {
      var l = s[o].$parent.$cells, d = l[l.length - 1];
      if (d && d.$config.view == "scrollbar" && d.$config.hidden === !1) {
        a = d.$config.width;
        break;
      }
    }
    return a || 0;
  }, e.prototype._setScrollSize = function(a) {
    var r = this._isHorizontal() ? "width" : "height", s = this._isHorizontal() ? this.$scroll_hor : this.$scroll_ver, o = this._getScrollOffset(), l = s.firstChild;
    o ? this._isVertical() ? (this.$config.outerSize = this.$config.height - o + 3, s.style.height = this.$config.outerSize + "px", s.style.top = o - 1 + "px", xt(s, this.$parent._borders.top), xt(s.parentNode, "gantt_task_vscroll")) : (this.$config.outerSize = this.$config.width - o + 1, s.style.width = this.$config.outerSize + "px") : (s.style.top = "auto", Nt(s, this.$parent._borders.top), Nt(s.parentNode, "gantt_task_vscroll"), this.$config.outerSize = this.$config.height), l.style[r] = a + "px";
  }, e.prototype._scrollVerticalHandler = function(a) {
    if (!this._scrollHorizontalHandler() && !this._scrolling) {
      var r = this.$scroll_ver.scrollTop;
      r != this._oldTop && (this.scrollVertically(r), this._oldTop = this.$scroll_ver.scrollTop);
    }
  }, e.prototype._outerScrollVerticalHandler = function(a) {
    this._scrollHorizontalHandler();
  }, e.prototype._checkWheelTarget = function(a) {
    for (var r = this._getLinkedViews().concat(this), s = 0; s < r.length; s++)
      if (Z(a, r[s].$view)) return !0;
    return !1;
  }, e.prototype._mouseWheelHandler = function(a) {
    var r = a.target || a.srcElement;
    if (this._checkWheelTarget(r)) {
      this._wheel_time = /* @__PURE__ */ new Date();
      var s = {}, o = { x: 1, y: 1 }, l = this.$gantt.config.wheel_scroll_sensitivity;
      typeof l == "number" && l ? o = { x: l, y: l } : {}.toString.apply(l) == "[object Object]" && (o = { x: l.x, y: l.y });
      var d = yt.isFF, u = d ? a.deltaX : a.wheelDeltaX, c = d ? a.deltaY : a.wheelDelta, h = -20;
      if (d) {
        const y = parseInt(navigator.userAgent.split("Firefox/")[1]);
        h = y <= 87 ? a.deltaMode !== 0 ? -40 : -10 : y <= 90 ? -3 : y <= 96 ? -1.5 : -1;
      }
      var _ = d ? u * h * o.x : 2 * u * o.x, f = d ? c * h * o.y : c * o.y, v = this.$gantt.config.horizontal_scroll_key;
      if (v !== !1 && n.indexOf(v) >= 0 && (!a[v] || a.deltaX || a.wheelDeltaX || (_ = 2 * f, f = 0)), _ && Math.abs(_) > Math.abs(f)) {
        if (this._isVertical()) return;
        if (s.x || !this.$scroll_hor || !this.$scroll_hor.offsetWidth) return !0;
        var k = _ / -40, b = this._oldLeft, m = b + 30 * k;
        if (this.scrollHorizontally(m), this.$scroll_hor.scrollLeft = m, b == this.$scroll_hor.scrollLeft) return !0;
        this._oldLeft = this.$scroll_hor.scrollLeft;
      } else {
        if (this._isHorizontal()) return;
        if (s.y || !this.$scroll_ver || !this.$scroll_ver.offsetHeight) return !0;
        k = f / -40, f === void 0 && (k = a.detail);
        var g = this._oldTop, p = this.$scroll_ver.scrollTop + 30 * k;
        if (this.scrollVertically(p), this.$scroll_ver.scrollTop = p, g == this.$scroll_ver.scrollTop) return !0;
        this._oldTop = this.$scroll_ver.scrollTop;
      }
      return a.preventDefault && a.preventDefault(), a.cancelBubble = !0, !1;
    }
  }, e;
}(wt), ar = function(t, n) {
  var e = {}, i = "gantt-static-bg-styles-" + t.uid();
  function a(c) {
    var h = /^rgba?\(([\d]{1,3}), *([\d]{1,3}), *([\d]{1,3}) *(,( *[\d.]+ *))?\)$/i.exec(c);
    return h ? { r: 1 * h[1], g: 1 * h[2], b: 1 * h[3], a: 255 * h[5] || 255 } : null;
  }
  function r(c) {
    return e[c] || null;
  }
  function s(c, h, _) {
    return (c + "" + h + _.bottomBorderColor + _.rightBorderColor).replace(/[^\w\d]/g, "");
  }
  function o(c, h) {
    e[c] = h;
  }
  function l(c, h, _) {
    var f = Math.floor(500 / c) || 1, v = Math.floor(500 / h) || 1, k = document.createElement("canvas");
    k.height = h * v, k.width = c * f;
    var b = k.getContext("2d");
    return function(g, p, y, $, x, w) {
      var T = x.createImageData(p * $, g * y);
      T.imageSmoothingEnabled = !1;
      for (var S = 1 * w.rightBorderWidth, C = a(w.rightBorderColor), E = 0, D = 0, I = 0, M = 1; M <= $; M++) for (E = M * p - 1, I = 0; I < S; I++) for (D = 0; D < g * y; D++) m(E - I, D, C, T);
      var A = 1 * w.bottomBorderWidth, L = a(w.bottomBorderColor);
      D = 0;
      for (var N = 1; N <= y; N++) for (D = N * g - 1, I = 0; I < A; I++) for (E = 0; E < p * $; E++) m(E, D - I, L, T);
      x.putImageData(T, 0, 0);
    }(h, c, v, f, b, _), k.toDataURL();
    function m(g, p, y, $) {
      var x = 4 * (p * (c * f) + g);
      $.data[x] = y.r, $.data[x + 1] = y.g, $.data[x + 2] = y.b, $.data[x + 3] = y.a;
    }
  }
  function d(c) {
    return "gantt-static-bg-" + c;
  }
  function u() {
    var c = document.createElement("div");
    c.className = "gantt_task_cell";
    var h = document.createElement("div");
    return h.className = "gantt_task_row", h.appendChild(c), h;
  }
  return { render: function(c, h, _, f, v) {
    if ((h.static_background || h.timeline_placeholder) && document.createElement("canvas").getContext) {
      c.innerHTML = "";
      var k = function(p) {
        var y = u(), $ = u();
        p.appendChild(y), p.appendChild($);
        var x = y.firstChild, w = getComputedStyle(y), T = getComputedStyle(x), S = { bottomBorderWidth: w.getPropertyValue("border-bottom-width").replace("px", ""), rightBorderWidth: T.getPropertyValue("border-right-width").replace("px", ""), bottomBorderColor: w.getPropertyValue("border-bottom-color"), rightBorderColor: T.getPropertyValue("border-right-color") };
        return p.removeChild(y), p.removeChild($), S;
      }(c), b = function(p, y, $, x) {
        var w = {}, T = function(A) {
          for (var L = A.width, N = {}, P = 0; P < L.length; P++) 1 * L[P] && (N[L[P]] = !0);
          return N;
        }($), S = x, C = "";
        for (var E in T) {
          var D = 1 * E, I = s(D, S, p);
          if (!r(I)) {
            var M = l(D, S, p);
            o(I, M), C += "." + d(I) + "{ background-image: url('" + M + "');}";
          }
          w[E] = d(I);
        }
        return C && (function() {
          var A = document.getElementById(i);
          return A || ((A = document.createElement("style")).id = i, document.body.appendChild(A)), A;
        }().innerHTML += C), w;
      }(k, 0, _, v), m = function(p, y, $, x) {
        var w, T, S = [], C = 0, E = $.width.filter(function(z) {
          return !!z;
        }), D = 0, I = 1e5;
        if (n.isIE) {
          var M = navigator.appVersion || "";
          M.indexOf("Windows NT 6.2") == -1 && M.indexOf("Windows NT 6.1") == -1 && M.indexOf("Windows NT 6.0") == -1 || (I = 2e4);
        }
        for (var A = 0; A < E.length; A++) {
          var L = E[A];
          if (L != T && T !== void 0 || A == E.length - 1 || C > I) {
            for (var N = x, P = 0, R = Math.floor(I / y.row_height) * y.row_height, O = C; N > 0; ) {
              var B = Math.min(N, R);
              N -= R, (w = document.createElement("div")).style.height = B + "px", w.style.position = "absolute", w.style.top = P + "px", w.style.left = D + "px", w.style.pointerEvents = "none", w.style.whiteSpace = "no-wrap", w.className = p[T || L], A == E.length - 1 && (O = L + O - 1), w.style.width = O + "px", S.push(w), P += B;
            }
            C = 0, D += O;
          }
          L && (C += L, T = L);
        }
        return S;
      }(b, h, _, f), g = document.createDocumentFragment();
      m.forEach(function(p) {
        g.appendChild(p);
      }), c.appendChild(g);
    }
  }, destroy: function() {
    var c = document.getElementById(i);
    c && c.parentNode && c.parentNode.removeChild(c);
  } };
};
const rr = function() {
  return ar(Bn, yt);
};
var Ye = function(t, n, e, i) {
  this.$config = H({}, n || {}), this.$scaleHelper = new Ve(i), this.$gantt = i, this._posFromDateCache = {}, this._posFromWorkTimeCache = {}, this._timelineDragScroll = null, H(this, Gn(this)), _t(this);
};
function be(t) {
  if (t._delayRender && t._delayRender.$cancelTimeout(), t.$gantt) {
    var n = t.$gantt.$data.tasksStore, e = t.$config.rowStore;
    if (e) {
      var i = "_attached_" + e.$config.name;
      t[i] && (n.detachEvent(t[i]), t[i] = null), e.$attachedResourceViewHandler && (e.detachEvent(e.$attachedResourceViewHandler), e.$attachedResourceViewHandler = null, n.detachEvent(e.$attachedTaskStoreHandler), e.$attachedTaskStoreHandler = null);
    }
  }
}
function he(t) {
  var n = t.prototype.init, e = t.prototype.destructor;
  return { init: function() {
    n.apply(this, arguments), this._linkToTaskStore();
  }, destructor: function() {
    be(this), e.apply(this, arguments);
  }, previousDragId: null, relevantResources: null, _linkToTaskStore: function() {
    if (this.$config.rowStore && this.$gantt.$data.tasksStore) {
      var i = this.$gantt.$data.tasksStore, a = this.$config.rowStore;
      be(this);
      var r = this, s = Qt(function() {
        if (r.$gantt.getState().lightbox) s();
        else {
          const l = r.$config.rowStore, d = r._getRelevantResources();
          if (d && l.$config.name === r.$gantt.config.resource_store) {
            if (d == "nothing_to_repaint") return;
            l._quick_refresh = !0, r.relevantResources.forEach(function(u) {
              l.refresh(u);
            }), l._quick_refresh = !1;
          } else l.refresh();
        }
      }, 300);
      this._delayRender = s;
      var o = "_attached_" + a.$config.name;
      r[o] || (r[o] = i.attachEvent("onStoreUpdated", function() {
        if (!s.$pending && !this._skipResourceRepaint) {
          const l = r.$gantt.getState();
          if (l.drag_mode == "progress") return !0;
          l.drag_mode && l.drag_id && (r.previousDragId = l.drag_id), s();
        }
        return !0;
      })), this.$gantt.attachEvent("onDestroy", function() {
        return be(r), !0;
      }), a.$attachedResourceViewHandler || (a.$attachedResourceViewHandler = a.attachEvent("onBeforeFilter", function() {
        return !r.$gantt.getState().lightbox && (s.$pending && s.$cancelTimeout(), r._updateNestedTasks(), !0);
      }), a.$attachedTaskStoreHandler = i.attachEvent("onAfterDelete", function() {
        a._mark_recompute = !0;
      }));
    }
  }, _getRelevantResources: function() {
    if (!this.$gantt.getTaskAssignments) return null;
    const i = this.$gantt.getState(), a = this.$config.rowStore;
    let r = [];
    if (i.drag_mode && i.drag_id && a.$config.name === this.$gantt.config.resource_store) if (this.previousDragId == i.drag_id) {
      if (this.relevantResources) return this.relevantResources;
      r = this._getIdsFromAssignments(this.previousDragId);
    } else this.previousDragId = i.drag_id, r = this._getIdsFromAssignments(this.previousDragId);
    else {
      if (!this.previousDragId) return null;
      r = this._getIdsFromAssignments(this.previousDragId), this.previousDragId = null;
    }
    return r.length ? (r.forEach(function(s) {
      a.eachParent && a.eachParent(function(o) {
        r.push(o.id);
      }, s);
    }), this.relevantResources = [...new Set(r)]) : this.relevantResources = "nothing_to_repaint";
  }, _getIdsFromAssignments: function(i) {
    const a = this.$gantt, r = [], s = a.getTask(i);
    return a.getTaskAssignments(i).forEach(function(o) {
      r.push(o.resource_id);
    }), a.isSummaryTask(s) && a.config.drag_project && a.eachTask(function(o) {
      a.getTaskAssignments(o.id).forEach(function(l) {
        r.push(l.resource_id);
      });
    }, i), a.config.drag_multiple && a.getSelectedTasks && a.getSelectedTasks().forEach(function(o) {
      a.getTaskAssignments(o).forEach(function(l) {
        r.push(l.resource_id);
      });
    }), r;
  }, _updateNestedTasks: function() {
    var i = this.$gantt, a = i.getDatastore(i.config.resource_store);
    a.$config.fetchTasks && a.silent(function() {
      var r = [], s = {}, o = {};
      for (var l in a.eachItem(function(d) {
        if (d.$role != "task") {
          var u = i.getResourceAssignments(d.id), c = {};
          u.sort(function(h, _) {
            const f = a.pull, v = f[`${h.task_id}_${h.resource_id}`], k = f[`${_.task_id}_${_.resource_id}`];
            return v && k ? v.$local_index - k.$local_index : 0;
          }), u.forEach(function(h) {
            if (!c[h.task_id] && i.isTaskExists(h.task_id)) {
              c[h.task_id] = !0;
              var _, f = i.getTask(h.task_id);
              (_ = a.$config.copyOnParse ? i.copy(f) : Object.create(f)).id = f.id + "_" + d.id, _.$task_id = f.id, _.$resource_id = d.id, _[a.$parentProperty] = d.id, _.$role = "task", r.push(_), s[_.id] = !0;
            }
          });
        } else o[d.id] = !0;
      }), o) s[l] || a.removeItem(l);
      r.length && a.parse(r);
    });
  } };
}
Ye.prototype = { init: function(t) {
  t.innerHTML += "<div class='gantt_task' style='width:inherit;height:inherit;'></div>", this.$task = t.childNodes[0], this.$task.innerHTML = "<div class='gantt_task_scale'></div><div class='gantt_data_area'></div>", this.$task_scale = this.$task.childNodes[0], this.$task_data = this.$task.childNodes[1], this.$task_data.innerHTML = "<div class='gantt_task_bg'></div><div class='gantt_task_baselines'></div><div class='gantt_links_area'></div><div class='gantt_bars_area'></div><div class='gantt_task_constraints'></div><div class='gantt_task_deadlines'></div>", this.$task_bg = this.$task_data.childNodes[0], this.$task_baselines = this.$task_data.childNodes[1], this.$task_links = this.$task_data.childNodes[2], this.$task_bars = this.$task_data.childNodes[3], this.$task_constraints = this.$task_data.childNodes[4], this.$task_deadlines = this.$task_data.childNodes[5], this._tasks = { col_width: 0, width: [], full_width: 0, trace_x: [], rendered: {} };
  var n = this.$getConfig(), e = n[this.$config.bind + "_attribute"], i = n[this.$config.bindLinks + "_attribute"];
  !e && this.$config.bind && (e = "data-" + this.$config.bind + "-id"), !i && this.$config.bindLinks && (i = "data-" + this.$config.bindLinks + "-id"), this.$config.item_attribute = e || null, this.$config.link_attribute = i || null;
  var a = this._createLayerConfig();
  this.$config.layers || (this.$config.layers = a.tasks), this.$config.linkLayers || (this.$config.linkLayers = a.links), this._attachLayers(this.$gantt), this.callEvent("onReady", []), this.$gantt.ext.dragTimeline && (this._timelineDragScroll = this.$gantt.ext.dragTimeline.create(), this._timelineDragScroll.attach(this));
}, setSize: function(t, n) {
  var e = this.$getConfig();
  if (1 * t === t && (this.$config.width = t), 1 * n === n) {
    this.$config.height = n;
    var i = Math.max(this.$config.height - e.scale_height);
    this.$task_data.style.height = i + "px";
  }
  this.refresh(), this.$task_bg.style.backgroundImage = "", e.smart_rendering && this.$config.rowStore ? this.$task_bg.style.height = this.getTotalHeight() + "px" : this.$task_bg.style.height = "";
  for (var a = this._tasks, r = this.$task_data.childNodes, s = 0, o = r.length; s < o; s++) {
    var l = r[s];
    l.hasAttribute("data-layer") && l.style && (l.style.width = a.full_width + "px");
  }
}, isVisible: function() {
  return this.$parent && this.$parent.$config ? !this.$parent.$config.hidden : this.$task.offsetWidth;
}, getSize: function() {
  var t = this.$getConfig(), n = this.$config.rowStore ? this.getTotalHeight() : 0, e = this.isVisible() ? this._tasks.full_width : 0;
  return { x: this.isVisible() ? this.$config.width : 0, y: this.isVisible() ? this.$config.height : 0, contentX: this.isVisible() ? e : 0, contentY: this.isVisible() ? t.scale_height + n : 0, scrollHeight: this.isVisible() ? n : 0, scrollWidth: this.isVisible() ? e : 0 };
}, scrollTo: function(t, n) {
  if (this.isVisible()) {
    var e = !1;
    this.$config.scrollTop = this.$config.scrollTop || 0, this.$config.scrollLeft = this.$config.scrollLeft || 0, 1 * n === n && (this.$config.scrollTop = n, this.$task_data.scrollTop = this.$config.scrollTop, e = !0), 1 * t === t && (this.$task.scrollLeft = t, this.$config.scrollLeft = this.$task.scrollLeft, this._refreshScales(), e = !0), e && this.callEvent("onScroll", [this.$config.scrollLeft, this.$config.scrollTop]);
  }
}, _refreshScales: function() {
  if (this.isVisible() && this.$getConfig().smart_scales) {
    var t = this.getViewPort(), n = this._scales;
    this.$task_scale.innerHTML = this._getScaleChunkHtml(n, t.x, t.x_end);
  }
}, getViewPort: function() {
  var t = this.$config.scrollLeft || 0, n = this.$config.scrollTop || 0, e = this.$config.height || 0, i = this.$config.width || 0;
  return { y: n, y_end: n + e, x: t, x_end: t + i, height: e, width: i };
}, _createLayerConfig: function() {
  var t = this, n = function() {
    return t.isVisible();
  };
  const e = this.$gantt, i = function(r, s) {
    return s.type === e.config.types.project && s.auto_scheduling === !1;
  };
  var a = [{ expose: !0, renderer: this.$gantt.$ui.layers.taskBar(), container: this.$task_bars, filter: [n, function(r, s) {
    return !s.hide_bar;
  }, function(r, s) {
    return !i(0, s);
  }] }, { renderer: this.$gantt.$ui.layers.timedProjectBar(), filter: [n, i], container: this.$task_bars, append: !0 }, { renderer: this.$gantt.$ui.layers.taskSplitBar(), filter: [n], container: this.$task_bars, append: !0 }, { renderer: this.$gantt.$ui.layers.taskRollupBar(), filter: [n], container: this.$task_bars, append: !0 }, { renderer: this.$gantt.$ui.layers.taskConstraints(), filter: [n], container: this.$task_constraints, append: !1 }];
  return e.config.deadlines && a.push({ renderer: this.$gantt.$ui.layers.taskDeadline(), filter: [n], container: this.$task_deadlines, append: !1 }), e.config.baselines && a.push({ renderer: this.$gantt.$ui.layers.taskBaselines(), filter: [n], container: this.$task_baselines, append: !1 }), a.push({ renderer: this.$gantt.$ui.layers.taskBg(), container: this.$task_bg, filter: [n] }), { tasks: a, links: [{ expose: !0, renderer: this.$gantt.$ui.layers.link(), container: this.$task_links, filter: [n] }] };
}, _attachLayers: function(t) {
  this._taskLayers = [], this._linkLayers = [];
  var n = this, e = this.$gantt.$services.getService("layers");
  if (this.$config.bind) {
    this._bindStore();
    var i = e.getDataRender(this.$config.bind);
    i || (i = e.createDataRender({ name: this.$config.bind, defaultContainer: function() {
      return n.$task_data;
    } })), i.container = function() {
      return n.$task_data;
    };
    for (var a = this.$config.layers, r = 0; a && r < a.length; r++) {
      typeof (d = a[r]) == "string" && (d = this.$gantt.$ui.layers[d]()), (typeof d == "function" || d && d.render && d.update) && (d = { renderer: d }), d.view = this;
      var s = i.addLayer(d);
      this._taskLayers.push(s), d.expose && (this._taskRenderer = i.getLayer(s));
    }
    this._initStaticBackgroundRender();
  }
  if (this.$config.bindLinks) {
    n.$config.linkStore = n.$gantt.getDatastore(n.$config.bindLinks);
    var o = e.getDataRender(this.$config.bindLinks);
    o || (o = e.createDataRender({ name: this.$config.bindLinks, defaultContainer: function() {
      return n.$task_data;
    } }));
    var l = this.$config.linkLayers;
    for (r = 0; l && r < l.length; r++) {
      var d;
      typeof d == "string" && (d = this.$gantt.$ui.layers[d]()), (d = l[r]).view = this;
      var u = o.addLayer(d);
      this._taskLayers.push(u), l[r].expose && (this._linkRenderer = o.getLayer(u));
    }
  }
}, _initStaticBackgroundRender: function() {
  var t = this, n = rr(), e = t.$config.rowStore;
  e && (this._staticBgHandler = e.attachEvent("onStoreUpdated", function(i, a, r) {
    if (i === null && t.isVisible()) {
      var s = t.$getConfig();
      if (s.static_background || s.timeline_placeholder) {
        var o = t.$gantt.getDatastore(t.$config.bind), l = t.$task_bg_static;
        if (l || ((l = document.createElement("div")).className = "gantt_task_bg", t.$task_bg_static = l, t.$task_bg.nextSibling ? t.$task_data.insertBefore(l, t.$task_bg.nextSibling) : t.$task_data.appendChild(l)), o) {
          var d = t.getTotalHeight();
          s.timeline_placeholder && (d = s.timeline_placeholder.height || t.$task_data.offsetHeight || 99999), n.render(l, s, t.getScale(), d, t.getItemHeight(a ? a.id : null));
        }
      } else s.static_background && t.$task_bg_static && t.$task_bg_static.parentNode && t.$task_bg_static.parentNode.removeChild(t.$task_bg_static);
    }
  }), this.attachEvent("onDestroy", function() {
    n.destroy();
  }), this._initStaticBackgroundRender = function() {
  });
}, _clearLayers: function(t) {
  var n = this.$gantt.$services.getService("layers"), e = n.getDataRender(this.$config.bind), i = n.getDataRender(this.$config.bindLinks);
  if (this._taskLayers) for (var a = 0; a < this._taskLayers.length; a++) e.removeLayer(this._taskLayers[a]);
  if (this._linkLayers) for (a = 0; a < this._linkLayers.length; a++) i.removeLayer(this._linkLayers[a]);
  this._linkLayers = [], this._taskLayers = [];
}, _render_tasks_scales: function() {
  var u;
  var t = this.$getConfig(), n = "", e = 0, i = 0, a = this.$gantt.getState();
  if (this.isVisible()) {
    var r = this.$scaleHelper, s = this._getScales();
    i = t.scale_height;
    var o = this.$config.width;
    t.autosize != "x" && t.autosize != "xy" || (o = Math.max(t.autosize_min_width, 0));
    var l = r.prepareConfigs(s, t.min_column_width, o, i - 1, a.min_date, a.max_date, t.rtl), d = this._tasks = l[l.length - 1];
    if (this._scales = l, this._posFromDateCache = {}, this._posFromWorkTimeCache = {}, this._tasks.projection && ((u = this._tasks.projection) == null ? void 0 : u.source) === "fixedHours") {
      const c = "timescale-projection-calendar";
      this.$gantt.getCalendar(c) && this.$gantt.deleteCalendar(c);
      let { hours: h } = this._tasks.projection;
      this.$gantt.addCalendar({ id: c, worktime: { hours: h || this.$gantt.getCalendar("global")._worktime.hours.slice(), days: [1, 1, 1, 1, 1, 1, 1] } });
    }
    n = this._getScaleChunkHtml(l, 0, this.$config.width), e = d.full_width + "px", i += "px";
  }
  this.$task_scale.style.height = i, this.$task_data.style.width = this.$task_scale.style.width = e, this.$task_scale.innerHTML = n;
}, _getScaleChunkHtml: function(t, n, e) {
  for (var i = [], a = this.$gantt.templates.scale_row_class, r = 0; r < t.length; r++) {
    var s = "gantt_scale_line", o = a(t[r]);
    o && (s += " " + o), i.push('<div class="' + s + '" style="height:' + t[r].height + "px;position:relative;line-height:" + t[r].height + 'px">' + this._prepareScaleHtml(t[r], n, e, r) + "</div>");
  }
  return i.join("");
}, _prepareScaleHtml: function(t, n, e, i) {
  var a = this.$getConfig(), r = this.$gantt.templates, s = [], o = null, l = null, d = t.format || t.template || t.date;
  typeof d == "string" && (d = this.$gantt.date.date_to_str(d));
  var u = 0, c = t.count;
  !a.smart_scales || isNaN(n) || isNaN(e) || (u = It(t.left, n), c = It(t.left, e) + 1), l = t.css || function() {
  }, !t.css && a.inherit_scale_class && (l = r.scale_cell_class);
  for (var h = u; h < c && t.trace_x[h]; h++) {
    o = new Date(t.trace_x[h]);
    var _ = d.call(this, o), f = t.width[h];
    t.height;
    var v = t.left[h], k = "", b = "", m = "";
    if (f) {
      k = "width:" + f + "px;" + (a.smart_scales ? "position:absolute;left:" + v + "px" : "");
      const p = this.getViewPort(), y = (a.scales[i] || {}).sticky;
      let $ = "";
      const x = 70;
      if (y !== !1 && f > x || y === !0) {
        if (v < p.x && v + f / 2 - x / 2 < p.x) $ = ` style='position:absolute;left: ${p.x - v + 10}px;' `;
        else if (v + f / 2 + x / 2 > p.x_end && f > x) {
          let w = p.x_end - v - 10, T = "-100%";
          w < x && (w = x, T = `-${w}px`), $ = ` style='position:absolute;left: ${w}px;transform: translate(${T},0);' `;
        }
      }
      m = "gantt_scale_cell" + (h == t.count - 1 ? " gantt_last_cell" : ""), (b = l.call(this, o)) && (m += " " + b);
      var g = `<div class='${m}' ${this.$gantt._waiAria.getTimelineCellAttr(_)} style='${k}'><span ${$}>${_}</span></div>`;
      s.push(g);
    }
  }
  return s.join("");
}, _getPositioningContext: function(t) {
  if (this._tasks.unit === this.$gantt.config.duration_unit || this._tasks.unit !== "day" && this._tasks.unit !== "week" || !this._tasks.projection) return null;
  const { source: n } = this._tasks.projection || {};
  return n === "taskCalendar" ? t ? { calendar: this.$gantt.getTaskCalendar(t) } : { calendar: this.$gantt.getCalendar("global") } : n === "fixedHours" ? { calendar: this.$gantt.getCalendar("timescale-projection-calendar") } : null;
}, dateFromPos: function(t, n) {
  var e = this._tasks;
  if (t < 0 || t > e.full_width || !e.full_width) return null;
  var i = It(this._tasks.left, t), a = this._tasks.left[i], r = e.width[i] || e.col_width, s = 0;
  r && (s = (t - a) / r, e.rtl && (s = 1 - s));
  const o = (n ? n.calendar : null) || null;
  var l = 0;
  s && (l = this._getColumnDuration(e, e.trace_x[i]));
  const d = e.trace_x[i], u = new Date(e.trace_x[i].valueOf() + Math.round(s * l));
  if (!o) return u;
  const { start: c, end: h, duration: _, intervals: f } = this._getWorkTrimForCell(d, o);
  if (_ <= 0) return u;
  const v = Math.round(s * _), k = d.valueOf() + 1e3 * (c + v);
  return new Date(k);
}, posFromDate: function(t, n) {
  if (!this.isVisible() || !t) return 0;
  if (n && n.calendar) return this.posFromWorkTime(t, n);
  var e = String(t.valueOf());
  if (this._posFromDateCache[e] !== void 0) return this._posFromDateCache[e];
  var i = this.columnIndexByDate(t);
  this.$gantt.assert(i >= 0, "Invalid day index");
  var a = Math.floor(i), r = i % 1, s = this._tasks.left[Math.min(a, this._tasks.width.length - 1)];
  a == this._tasks.width.length && (s += this._tasks.width[this._tasks.width.length - 1]), r && (a < this._tasks.width.length ? s += this._tasks.width[a] * (r % 1) : s += 1);
  var o = Math.round(s);
  return this._posFromDateCache[e] = o, Math.round(o);
}, _getWorkTrimForCell: function(t, n) {
  const e = this._getColumnDuration(this._tasks, t), i = new Date(t.valueOf() + e);
  let a = null, r = null;
  const s = [];
  for (let o = new Date(t), l = 0; o < i; o = this.$gantt.date.add(o, 1, "day"), l++) {
    const d = n._getWorkHours(o) || [], u = Math.round((o - t) / 1e3);
    for (let c = 0; c < d.length; c++) {
      const h = u + d[c].start, _ = u + d[c].end;
      s.push({ start: h, end: _ }), (a === null || h < a) && (a = h), (r === null || _ > r) && (r = _);
    }
  }
  return a === null || r === null || r <= a ? { start: 0, end: 0, duration: 0, intervals: [] } : { start: a, end: r, duration: r - a, intervals: s };
}, posFromWorkTime: function(t, { calendar: n }) {
  if (!this.isVisible() || !t) return 0;
  if (!n) return this.posFromDate(t);
  const e = (n ? n.id : "") + String(t.valueOf());
  if (this._posFromWorkTimeCache[e] !== void 0) return this._posFromWorkTimeCache[e];
  const i = this.columnIndexByDate(t);
  this.$gantt.assert(i >= 0, "Invalid day index");
  const a = Math.floor(i), r = a, { start: s, end: o, duration: l } = this._getWorkTrimForCell(t, n);
  if (l === 0)
    return this.posFromDate(t);
  const d = (t - this._tasks.trace_x[a]) / 1e3;
  let u = 0;
  u = d <= s ? 0 : d >= o ? 1 : (d - s) / l, this._tasks.rtl && (u = 1 - u);
  const c = this._tasks.left[Math.min(r, this._tasks.width.length - 1)], h = r < this._tasks.width.length ? this._tasks.width[r] : this._tasks.width[this._tasks.width.length - 1];
  return Math.round(c + h * u);
}, _getNextVisibleColumn: function(t, n, e) {
  for (var i = +n[t], a = t; e[i]; ) i = +n[++a];
  return a;
}, _getPrevVisibleColumn: function(t, n, e) {
  for (var i = +n[t], a = t; e[i]; ) i = +n[--a];
  return a;
}, _getClosestVisibleColumn: function(t, n, e) {
  var i = this._getNextVisibleColumn(t, n, e);
  return n[i] || (i = this._getPrevVisibleColumn(t, n, e)), i;
}, columnIndexByDate: function(t) {
  var n = new Date(t).valueOf(), e = this._tasks.trace_x_ascending, i = this._tasks.ignore_x, a = this.$gantt.getState();
  if (n <= a.min_date) return this._tasks.rtl ? e.length : 0;
  if (n >= a.max_date) return this._tasks.rtl ? 0 : e.length;
  var r = It(e, n), s = this._getClosestVisibleColumn(r, e, i), o = e[s], l = this._tasks.trace_index_transition;
  if (!o) return l ? l[0] : 0;
  var d = (t - e[s]) / this._getColumnDuration(this._tasks, e[s]);
  return l ? l[s] + (1 - d) : s + d;
}, getItemPosition: function(t, n, e) {
  var i, a, r;
  let s = n || t.start_date || t.$auto_start_date, o = e || t.end_date || t.$auto_end_date;
  const l = this._getPositioningContext(t);
  return l && l.calendar ? this._tasks.rtl ? (a = this.posFromWorkTime(s, l), i = this.posFromWorkTime(o, l)) : (i = this.posFromWorkTime(s, l), a = this.posFromWorkTime(o, l)) : this._tasks.rtl ? (a = this.posFromDate(s), i = this.posFromDate(o)) : (i = this.posFromDate(s), a = this.posFromDate(o)), r = Math.max(a - i, 0), { left: i, top: this.getItemTop(t.id), height: this.getBarHeight(t.id), width: r, rowHeight: this.getItemHeight(t.id) };
}, getBarHeight: function(t, n) {
  var e = this.$getConfig(), i = this.$config.rowStore.getItem(t), a = i.task_height || i.bar_height || e.bar_height || e.task_height, r = this.getItemHeight(t);
  return a == "full" && (a = r - (e.bar_height_padding || 3)), a = Math.min(a, r), n && (a = Math.round(a / Math.sqrt(2))), Math.max(a, 0);
}, getScale: function() {
  return this._tasks;
}, _getScales: function() {
  var t = this.$getConfig(), n = this.$scaleHelper, e = [n.primaryScale(t)].concat(n.getAdditionalScales(t));
  return n.sortScales(e), e;
}, _getColumnDuration: function(t, n) {
  return this.$gantt.date.add(n, t.step, t.unit) - n;
}, _bindStore: function() {
  if (this.$config.bind) {
    var t = this.$gantt.getDatastore(this.$config.bind);
    if (this.$config.rowStore = t, t && !t._timelineCacheAttached) {
      var n = this;
      t._timelineCacheAttached = t.attachEvent("onBeforeFilter", function() {
        n._resetTopPositionHeight();
      });
    }
  }
}, _unbindStore: function() {
  if (this.$config.bind) {
    var t = this.$gantt.getDatastore(this.$config.bind);
    t && t._timelineCacheAttached && (t.detachEvent(t._timelineCacheAttached), t._timelineCacheAttached = !1);
  }
}, refresh: function() {
  this._bindStore(), this.$config.bindLinks && (this.$config.linkStore = this.$gantt.getDatastore(this.$config.bindLinks)), this._resetTopPositionHeight(), this._resetHeight(), this._initStaticBackgroundRender(), this._render_tasks_scales();
}, destructor: function() {
  var t = this.$gantt;
  this._clearLayers(t), this._unbindStore(), this.$task = null, this.$task_scale = null, this.$task_data = null, this.$task_bg = null, this.$task_links = null, this.$task_bars = null, this.$gantt = null, this.$config.rowStore && (this.$config.rowStore.detachEvent(this._staticBgHandler), this.$config.rowStore = null), this.$config.linkStore && (this.$config.linkStore = null), this._timelineDragScroll && (this._timelineDragScroll.destructor(), this._timelineDragScroll = null), this.callEvent("onDestroy", []), this.detachAllEvents();
} };
var sr = function(t) {
  function n(e, i, a, r) {
    return t.apply(this, arguments) || this;
  }
  return F(n, t), H(n.prototype, { init: function() {
    this.$config.bind === void 0 && (this.$config.bind = this.$getConfig().resource_store), t.prototype.init.apply(this, arguments);
  }, _initEvents: function() {
    var e = this.$gantt;
    t.prototype._initEvents.apply(this, arguments), this._mouseDelegates.delegate("click", "gantt_row", e.bind(function(i, a, r) {
      var s = this.$config.rowStore;
      if (!s) return !0;
      var o = et(i, this.$config.item_attribute);
      return o && s.select(o.getAttribute(this.$config.item_attribute)), !1;
    }, this), this.$grid);
  } }, !0), H(n.prototype, he(n), !0), n;
}(Gt);
const or = function(t) {
  function n(e, i, a, r) {
    return t.apply(this, arguments) || this;
  }
  return F(n, t), H(n.prototype, { init: function(e) {
    const i = this.$gantt, a = i._waiAria.gridAttrString(), r = i._waiAria.gridDataAttrString(), s = this.$getConfig();
    s.row_height = this._getResourceConfig().row_height ? this._getResourceConfig().row_height : i.resource_table.row_height, s.reorder_grid_columns, this.$config.reorder_grid_columns !== void 0 && this.$config.reorder_grid_columns, this.$config.bind === void 0 && (this.$config.bind = "temp_resource_assignment_store", this.$config.name = "resource_grid_lightbox", this.$config.$id = "GridRL"), e.innerHTML = "<div class='gantt_grid' style='width:100%;' " + a + "></div>", this.$grid = e.childNodes[0], this.$grid.innerHTML = "<div class='gantt_grid_scale' " + i._waiAria.gridScaleRowAttrString() + "></div><div class='gantt_grid_data' " + r + "></div>", this.$grid_scale = this.$grid.childNodes[0], this.$grid_data = this.$grid.childNodes[1];
    let o = s[this.$config.bind + "_attribute"];
    if (!o && this.$config.bind && (o = "data-" + this.$config.bind + "-id"), this.$config.item_attribute = o || null, !this.$config.layers) {
      const d = this._createLayerConfig();
      this.$config.layers = d;
    }
    const l = ue();
    this.event = l.attach, this.eventRemove = l.detach, this._eventRemoveAll = l.detachAll, this._createDomEventScope = l.extend, this._addLayers(this.$gantt), this._initEvents(), this.callEvent("onReady", []);
  }, getColumn: function(e) {
    const i = this.getColumnIndex(e);
    return i === null ? null : this._getResourceColumns()[i] || null;
  }, getColumnIndex: function(e, i) {
    const a = this._getResourceColumns();
    let r = 0;
    for (let s = 0; s < a.length; s++) if (i && a[s].hide && r++, a[s].name == e) return s - r;
    return null;
  }, getGridColumns: function() {
    const e = this._getResourceColumns(), i = [];
    for (let a = 0; a < e.length; a++) e[a].hide || i.push(e[a]);
    return i;
  }, _createLayerConfig: function() {
    const e = this.$gantt, i = this;
    return [{ renderer: e.$ui.layers.gridLine(), container: this.$grid_data, filter: [function() {
      return i.isVisible();
    }] }, { renderer: e.$ui.layers.gridTaskRowResizer(), container: this.$grid_data, append: !0, filter: [function() {
      return e.config.resize_rows;
    }] }];
  }, _renderGridHeader: function() {
    const e = this.$gantt, i = this._getResourceConfig(), a = this.$gantt.locale, r = this.$getTemplates();
    let s = this._getResourceColumns();
    i.rtl && (s = s.reverse()), i.scale_height || (i.scale_height = e.resource_table.scale_height);
    let o = [], l = 0, d = a.labels, u = i.scale_height - 1;
    for (let c = 0; c < s.length; c++) {
      let h = c == s.length - 1, _ = s[c];
      _.name || (_.name = e.uid() + "");
      let f = 1 * _.width, v = this._getGridWidth();
      h && v > l + f && (_.width = f = v - l), l += f;
      let k = e._sort && _.name == e._sort.name ? `<div data-column-id="${_.name}" class="gantt_sort gantt_${e._sort.direction}"></div>` : "", b = ["gantt_grid_head_cell", "gantt_grid_head_" + _.name, h ? "gantt_last_cell" : "", r.grid_header_class ? r.grid_header_class(_.name, _) : ""].join(" "), m = "width:" + (f - (h ? 1 : 0)) + "px;", g = _.label || d["column_" + _.name] || d[_.name];
      g = g || "";
      const p = "<div class='" + b + "' style='" + m + "' " + e._waiAria.gridScaleCellAttrString(_, g) + " data-column-id='" + _.name + "' column_id='" + _.name + "' data-column-name='" + _.name + "' data-column-index='" + c + "'>" + g + k + "</div>";
      o.push(p);
    }
    this.$grid_scale.style.height = i.scale_height + "px", this.$grid_scale.style.lineHeight = u + "px", this.$grid_scale.style.width = "inherit", this.$grid_scale.innerHTML = o.join("");
  }, isVisible: function() {
    return this.$parent ? !this.$parent.hidden : this.$grid.offsetWidth;
  }, _initEvents: function() {
  }, _getResourceSection: function() {
    return gantt.getLightboxSection(this.$config.sectionName).section;
  }, $getTemplates: function() {
    return this._getResourceSection().templates || {};
  }, _getResourceConfig: function() {
    return this._getResourceSection().config || gantt.resource_table;
  }, _getResourceColumns: function() {
    var e;
    return ((e = this._getResourceSection().config) == null ? void 0 : e.columns) || gantt.resource_table.columns;
  }, destructor: function() {
    this._mouseDelegates && (this._mouseDelegates.destructor(), this._mouseDelegates = null), this._unbindStore(), this.$grid = null, this.$grid_scale = null, this.$grid_data = null, this._eventRemoveAll(), gantt.ext.inlineEditorsLightbox.destructor(), this.callEvent("onDestroy", []), this.detachAllEvents();
  } }, !0), H(n.prototype, he(n), !0), n;
}(Gt);
var ti = function(t) {
  function n(e, i, a, r) {
    var s = t.apply(this, arguments) || this;
    return s.$config.bindLinks = null, s;
  }
  return F(n, t), H(n.prototype, { init: function() {
    this.$config.bind === void 0 && (this.$config.bind = this.$getConfig().resource_store), t.prototype.init.apply(this, arguments);
  }, _createLayerConfig: function() {
    var e = this, i = function() {
      return e.isVisible();
    };
    return { tasks: [{ renderer: this.$gantt.$ui.layers.resourceRow(), container: this.$task_bars, filter: [i] }, { renderer: this.$gantt.$ui.layers.taskBg(), container: this.$task_bg, filter: [i] }], links: [] };
  } }, !0), H(n.prototype, he(n), !0), n;
}(Ye), lr = function(t) {
  function n(e, i, a, r) {
    var s = t.apply(this, arguments) || this;
    return s.$config.bindLinks = null, s;
  }
  return F(n, t), H(n.prototype, { _createLayerConfig: function() {
    var e = this, i = function() {
      return e.isVisible();
    };
    return { tasks: [{ renderer: this.$gantt.$ui.layers.resourceHistogram(), container: this.$task_bars, filter: [i] }, { renderer: this.$gantt.$ui.layers.taskBg(), container: this.$task_bg, filter: [i] }], links: [] };
  } }, !0), H(n.prototype, he(t), !0), n;
}(ti);
const dr = { init: function(t, n) {
  var e = n.$gantt;
  e.attachEvent("onTaskClick", function(i, a) {
    if (e._is_icon_open_click(a)) return !0;
    var r = t.getState(), s = t.locateCell(a.target);
    return !s || !t.getEditorConfig(s.columnName) || (t.isVisible() && r.id == s.id && r.columnName == s.columnName || t.startEdit(s.id, s.columnName), !1);
  }), n.$config.id === "GridRL" && (e.event(e.getLightbox(), "click", function(i) {
    const a = e.utils.dom, r = t.getState(), s = t.locateCell(i.target);
    if (s && t.getEditorConfig(s.columnName)) {
      if (s.columnName == "duration" || s.columnName == "end") {
        const o = e.getDatastore("temp_resource_assignment_store").getItem(s.id);
        if (o && !o.start_date) return e.message({ type: "warning", text: "Specify assignment start date" }), t.hide(), !1;
      }
      return t.isVisible() && r.id == s.id && r.columnName == s.columnName || t.startEdit(s.id, s.columnName), t.isChanged() && t.save(), !1;
    }
    if (!a.closest(i.target, ".gantt_custom_button.gantt_add_resources")) {
      if (a.closest(i.target, "[data-assignment-delete]")) {
        const o = i.target.getAttribute("data-assignment-delete");
        e.confirm({ text: "Resource assignment will be deleted permanently, are you sure?", cancel: "No", ok: "Delete", callback: function(l) {
          if (l) {
            const d = e.getDatastore("temp_resource_assignment_store");
            if (d.removeItem(o), d.getItems().length == 0) {
              const u = e.getLightboxSection(n.$config.sectionName), c = e.form_blocks.resource_selector, h = e._lightbox_root.querySelector("#" + u.section.id).nextSibling;
              c.set_value.call(e, h, [], {}, u.section, !0);
            }
            e.refreshData();
          }
        } });
      }
      t.isVisible() && t.save(), t.hide();
    }
  }), e.lightbox_events.gantt_save_btn = function() {
    t.save(), e._save_lightbox();
  }), e.attachEvent("onEmptyClick", function() {
    return t.isVisible() && t.isChanged() ? t.save() : t.hide(), !0;
  }), e.attachEvent("onTaskDblClick", function(i, a) {
    var r = t.getState(), s = t.locateCell(a.target);
    return !s || !t.isVisible() || s.columnName != r.columnName;
  });
}, onShow: function(t, n, e) {
  var i = e.$gantt;
  if (i.ext && i.ext.keyboardNavigation && i.ext.keyboardNavigation.attachEvent("onKeyDown", function(a, r) {
    var s = i.constants.KEY_CODES, o = !1;
    return r.keyCode === s.SPACE && t.isVisible() && (o = !0), !o;
  }), n.onkeydown = function(a) {
    a = a || window.event;
    var r = i.constants.KEY_CODES;
    if (!(a.defaultPrevented || a.shiftKey && a.keyCode != r.TAB)) {
      var s = !0;
      switch (a.keyCode) {
        case i.keys.edit_save:
          t.save();
          break;
        case i.keys.edit_cancel:
          t.hide();
          break;
        case r.UP:
        case r.DOWN:
          t.isVisible() && (t.hide(), s = !1);
          break;
        case r.TAB:
          a.shiftKey ? t.editPrevCell(!0) : t.editNextCell(!0);
          break;
        default:
          s = !1;
      }
      s && a.preventDefault();
    }
  }, e.$config.id === "GridRL") {
    let a;
    n.onkeyup = function(r) {
      r = r || window.event;
      var s = i.constants.KEY_CODES;
      r.defaultPrevented || r.shiftKey && r.keyCode != s.TAB || i._lightbox_id && t.isChanged() && t.save();
    }, n.onwheel = function(r) {
      i._lightbox_id && t.isChanged() && (clearTimeout(a), a = setTimeout(function() {
        t.save();
      }, 100));
    };
  }
}, onHide: function() {
}, destroy: function() {
} }, cr = { init: function(t, n) {
  var e = t, i = n.$gantt, a = null, r = i.ext.keyboardNavigation;
  r.attachEvent("onBeforeFocus", function(s) {
    var o = t.locateCell(s);
    if (clearTimeout(a), o) {
      var l = o.columnName, d = o.id, u = e.getState();
      if (e.isVisible() && u.id == d && u.columnName === l) return !1;
    }
    return !0;
  }), r.attachEvent("onFocus", function(s) {
    var o = t.locateCell(s), l = t.getState();
    return clearTimeout(a), !o || o.id == l.id && o.columnName == l.columnName || e.isVisible() && e.save(), !0;
  }), t.attachEvent("onHide", function() {
    clearTimeout(a);
  }), r.attachEvent("onBlur", function() {
    return a = setTimeout(function() {
      e.save();
    }), !0;
  }), i.attachEvent("onTaskDblClick", function(s, o) {
    var l = t.getState(), d = t.locateCell(o.target);
    return !d || !t.isVisible() || d.columnName != l.columnName;
  }), i.attachEvent("onTaskClick", function(s, o) {
    if (i._is_icon_open_click(o)) return !0;
    var l = t.getState(), d = t.locateCell(o.target);
    return !d || !t.getEditorConfig(d.columnName) || (t.isVisible() && l.id == d.id && l.columnName == d.columnName || t.startEdit(d.id, d.columnName), !1);
  }), i.attachEvent("onEmptyClick", function() {
    return e.save(), !0;
  }), r.attachEvent("onKeyDown", function(s, o) {
    var l = t.locateCell(o.target), d = !!l && t.getEditorConfig(l.columnName), u = t.getState(), c = i.constants.KEY_CODES, h = o.keyCode, _ = !1;
    switch (h) {
      case c.ENTER:
        t.isVisible() ? (t.save(), o.preventDefault(), _ = !0) : d && !(o.ctrlKey || o.metaKey || o.shiftKey) && (e.startEdit(l.id, l.columnName), o.preventDefault(), _ = !0);
        break;
      case c.ESC:
        t.isVisible() && (t.hide(), o.preventDefault(), _ = !0);
        break;
      case c.UP:
      case c.DOWN:
        break;
      case c.LEFT:
      case c.RIGHT:
        (d && t.isVisible() || u.editorType === "date") && (_ = !0);
        break;
      case c.SPACE:
        t.isVisible() && (_ = !0), d && !t.isVisible() && (e.startEdit(l.id, l.columnName), o.preventDefault(), _ = !0);
        break;
      case c.DELETE:
        d && !t.isVisible() ? (e.startEdit(l.id, l.columnName), _ = !0) : d && t.isVisible() && (_ = !0);
        break;
      case c.TAB:
        if (t.isVisible()) {
          o.shiftKey ? t.editPrevCell(!0) : t.editNextCell(!0);
          var f = t.getState();
          f.id && r.focus({ type: "taskCell", id: f.id, column: f.columnName }), o.preventDefault(), _ = !0;
        }
        break;
      default:
        if (t.isVisible()) _ = !0;
        else if (h >= 48 && h <= 57 || h > 95 && h < 112 || h >= 64 && h <= 91 || h > 185 && h < 193 || h > 218 && h < 223) {
          var v = s.modifiers, k = v.alt || v.ctrl || v.meta || v.shift;
          v.alt || o.key === "Meta" || k && r.getCommandHandler(s, "taskCell") || d && !t.isVisible() && (e.startEdit(l.id, l.columnName), _ = !0);
        }
    }
    return !_;
  });
}, onShow: function(t, n, e) {
}, onHide: function(t, n, e) {
  const i = e.$gantt;
  i && i.focus();
}, destroy: function() {
} };
function Rt(t) {
  var n = function() {
  };
  return n.prototype = { show: function(e, i, a, r) {
  }, hide: function() {
  }, set_value: function(e, i, a, r) {
    this.get_input(r).value = e;
  }, get_value: function(e, i, a) {
    return this.get_input(a).value || "";
  }, is_changed: function(e, i, a, r) {
    var s = this.get_value(i, a, r);
    return s && e && s.valueOf && e.valueOf ? s.valueOf() != e.valueOf() : s != e;
  }, is_valid: function(e, i, a, r) {
    return !0;
  }, save: function(e, i, a) {
  }, get_input: function(e) {
    return e.querySelector("input");
  }, focus: function(e) {
    var i = this.get_input(e);
    i && (i.focus && i.focus(), i.select && i.select());
  } }, n;
}
function ur(t) {
  var n = Rt();
  function e() {
    return n.apply(this, arguments) || this;
  }
  return F(e, n), H(e.prototype, { show: function(i, a, r, s) {
    var o = `<div role='cell'><input type='text' name='${a.name}' title='${a.name}'></div>`;
    s.innerHTML = o;
  } }, !0), e;
}
function hr(t) {
  var n = Rt();
  function e() {
    return n.apply(this, arguments) || this;
  }
  return F(e, n), H(e.prototype, { show: function(i, a, r, s) {
    var o = r.min || 0, l = r.max || 100, d = `<div role='cell'><input type='number' min='${o}' max='${l}' name='${a.name}' title='${a.name}'></div>`;
    s.innerHTML = d, s.oninput = function(u) {
      +u.target.value < o && (u.target.value = o), +u.target.value > l && (u.target.value = l);
    };
  }, get_value: function(i, a, r) {
    return this.get_input(r).value || "";
  }, is_valid: function(i, a, r, s) {
    return !isNaN(parseInt(i, 10));
  } }, !0), e;
}
function _r(t) {
  var n = Rt();
  function e() {
    return n.apply(this, arguments) || this;
  }
  return F(e, n), H(e.prototype, { show: function(i, a, r, s) {
    for (var o = `<div role='cell'><select name='${a.name}' title='${a.name}'>`, l = [], d = r.options || [], u = 0; u < d.length; u++) l.push("<option value='" + r.options[u].key + "'>" + d[u].label + "</option>");
    o += l.join("") + "</select></div>", s.innerHTML = o;
  }, get_input: function(i) {
    return i.querySelector("select");
  } }, !0), e;
}
function gr(t) {
  var n = Rt(), e = "%Y-%m-%d", i = null, a = null;
  function r() {
    return n.apply(this, arguments) || this;
  }
  return F(r, n), H(r.prototype, { show: function(s, o, l, d) {
    i || (i = t.date.date_to_str(e)), a || (a = t.date.str_to_date(e));
    var u = null, c = null;
    u = typeof l.min == "function" ? l.min(s, o) : l.min, c = typeof l.max == "function" ? l.max(s, o) : l.max;
    var h = `<div style='width:140px' role='cell'><input type='date' ${u ? " min='" + i(u) + "' " : ""} ${c ? " max='" + i(c) + "' " : ""} name='${o.name}' title='${o.name}'></div>`;
    d.innerHTML = h, d.oninput = function(_) {
      _.target.value && (u || c) && (+t.date.str_to_date("%Y-%m-%d")(_.target.value) < +u && (_.target.value = t.date.date_to_str("%Y-%m-%d")(u)), +t.date.str_to_date("%Y-%m-%d")(_.target.value) > +c && (_.target.value = t.date.date_to_str("%Y-%m-%d")(c)));
    };
  }, set_value: function(s, o, l, d) {
    s && s.getFullYear ? this.get_input(d).value = i(s) : this.get_input(d).value = s;
  }, is_valid: function(s, o, l, d) {
    return !(!s || isNaN(s.getTime()));
  }, get_value: function(s, o, l) {
    var d;
    try {
      d = a(this.get_input(l).value || "");
    } catch {
      d = null;
    }
    return d;
  } }, !0), r;
}
function fr(t) {
  var n = Rt();
  function e() {
    return n.apply(this, arguments) || this;
  }
  function i(l) {
    return l.formatter || t.ext.formatters.linkFormatter();
  }
  function a(l, d) {
    for (var u = (l || "").split(d.delimiter || ","), c = 0; c < u.length; c++) {
      var h = u[c].trim();
      h ? u[c] = h : (u.splice(c, 1), c--);
    }
    return u.sort(), u;
  }
  function r(l, d, u) {
    for (var c = l.$target, h = [], _ = 0; _ < c.length; _++) {
      var f = u.getLink(c[_]);
      h.push(i(d).format(f));
    }
    return h.join((d.delimiter || ",") + " ");
  }
  function s(l) {
    return l.source + "_" + l.target + "_" + l.type + "_" + (l.lag || 0);
  }
  function o(l, d, u) {
    var c = function(k, b, m) {
      var g = [];
      return [...new Set(b)].forEach(function(p) {
        var y = i(m).parse(p);
        y && (y.target = k, y.id = "predecessor_generated", t.isLinkAllowed(y) && (y.id = void 0, g.push(y)));
      }), g;
    }(l.id, d, u), h = {};
    l.$target.forEach(function(k) {
      var b = t.getLink(k);
      h[s(b)] = b.id;
    });
    var _ = [];
    c.forEach(function(k) {
      var b = s(k);
      h[b] ? delete h[b] : _.push(k);
    });
    var f = [];
    for (var v in h) f.push(h[v]);
    return { add: _, remove: f };
  }
  return F(e, n), H(e.prototype, { show: function(l, d, u, c) {
    var h = `<div role='cell'><input type='text' name='${d.name}' title='${d.name}'></div>`;
    c.innerHTML = h;
  }, hide: function() {
  }, set_value: function(l, d, u, c) {
    this.get_input(c).value = r(l, u.editor, t);
  }, get_value: function(l, d, u) {
    return a(this.get_input(u).value || "", d.editor);
  }, save: function(l, d, u) {
    var c = o(t.getTask(l), this.get_value(l, d, u), d.editor);
    (c.add.length || c.remove.length) && t.batchUpdate(function() {
      c.add.forEach(function(h) {
        t.addLink(h);
      }), c.remove.forEach(function(h) {
        t.deleteLink(h);
      }), t.autoSchedule && t.autoSchedule();
    });
  }, is_changed: function(l, d, u, c) {
    var h = this.get_value(d, u, c), _ = a(r(l, u.editor, t), u.editor);
    return h.join() !== _.join();
  } }, !0), e;
}
function pr(t) {
  var n = Rt();
  function e() {
    return n.apply(this, arguments) || this;
  }
  function i(a) {
    return a.formatter || t.ext.formatters.durationFormatter();
  }
  return F(e, n), H(e.prototype, { show: function(a, r, s, o) {
    var l = `<div role='cell'><input type='text' name='${r.name}' title='${r.name}'></div>`;
    o.innerHTML = l;
  }, set_value: function(a, r, s, o) {
    this.get_input(o).value = i(s.editor).format(a);
  }, get_value: function(a, r, s) {
    return i(r.editor).parse(this.get_input(s).value || "");
  } }, !0), e;
}
function mr(t) {
  return function(e, i, a) {
    a == "keepDates" ? function(r, s) {
      s == "duration" ? r.end_date = t.calculateEndDate(r) : s != "end_date" && s != "start_date" || (r.duration = t.calculateDuration(r));
    }(e, i) : a == "keepDuration" ? function(r, s) {
      s == "end_date" ? r.start_date = n(r) : s != "start_date" && s != "duration" || (r.end_date = t.calculateEndDate(r));
    }(e, i) : function(r, s) {
      t._getAutoSchedulingConfig().schedule_from_end ? s == "end_date" || s == "duration" ? r.start_date = n(r) : s == "start_date" && (r.duration = t.calculateDuration(r)) : s == "start_date" || s == "duration" ? r.end_date = t.calculateEndDate(r) : s == "end_date" && (r.duration = t.calculateDuration(r));
    }(e, i);
  };
  function n(e) {
    return t.calculateEndDate({ start_date: e.end_date, duration: -e.duration, task: e });
  }
}
function vr(t) {
  t.config.editor_types = { text: new (ur())(), number: new (hr())(), select: new (_r())(), date: new (gr(t))(), predecessor: new (fr(t))(), duration: new (pr(t))() };
}
function kr(t) {
  var n = /* @__PURE__ */ function(a) {
    var r = null;
    return { setMapping: function(s) {
      r = s;
    }, getMapping: function() {
      return r || (a.config.keyboard_navigation_cells && a.ext.keyboardNavigation ? cr : dr);
    } };
  }(t), e = {};
  _t(e);
  var i = { init: vr, createEditors: function(a) {
    function r(c, h) {
      var _ = a.$getConfig(), f = function(b, m) {
        for (var g = a.$getConfig(), p = a.getItemTop(b), y = a.getItemHeight(b), $ = a.getGridColumns(), x = 0, w = 0, T = 0, S = 0; S < $.length; S++) {
          if ($[S].name == m) {
            T = $[S].width;
            break;
          }
          g.rtl ? w += $[S].width : x += $[S].width;
        }
        return g.rtl ? { top: p, right: w, height: y, width: T } : { top: p, left: x, height: y, width: T };
      }(c, h), v = document.createElement("div");
      v.className = "gantt_grid_editor_placeholder", v.setAttribute(a.$config.item_attribute, c), v.setAttribute(a.$config.bind + "_id", c), v.setAttribute("data-column-name", h);
      var k = function(b, m) {
        for (var g = b.getGridColumns(), p = 0; p < g.length; p++) if (g[p].name == m) return p;
        return 0;
      }(a, h);
      return v.setAttribute("data-column-index", k), t._waiAria.inlineEditorAttr(v), _.rtl ? v.style.cssText = ["top:" + f.top + "px", "right:" + f.right + "px", "width:" + f.width + "px", "height:" + f.height + "px"].join(";") : v.style.cssText = ["top:" + f.top + "px", "left:" + f.left + "px", "width:" + f.width + "px", "height:" + f.height + "px"].join(";"), v;
    }
    var s = mr(t), o = [], l = [], d = null, u = { _itemId: null, _columnName: null, _editor: null, _editorType: null, _placeholder: null, locateCell: function(c) {
      if (!Z(c, a.$grid)) return null;
      var h = et(c, a.$config.item_attribute), _ = et(c, "data-column-name");
      if (h && _) {
        var f = _.getAttribute("data-column-name");
        return { id: h.getAttribute(a.$config.item_attribute), columnName: f };
      }
      return null;
    }, getEditorConfig: function(c) {
      var h = a.getColumn(c);
      if (h) return h.editor;
    }, init: function() {
      var c = n.getMapping();
      c.init && c.init(this, a), !(d = a.$gantt.getDatastore(a.$config.bind)) && t.$data.tempAssignmentsStore && (d = t.$data.tempAssignmentsStore);
      var h = this;
      o.push(d.attachEvent("onIdChange", function(_, f) {
        h._itemId == _ && (h._itemId = f);
      })), o.push(d.attachEvent("onStoreUpdated", function() {
        a.$gantt.getState("batchUpdate").batch_update || h.isVisible() && !d.isVisible(h._itemId) && h.hide();
      })), l.push(t.attachEvent("onDataRender", function() {
        h._editor && h._placeholder && !Z(h._placeholder, t.$root) && a.$grid_data.appendChild(h._placeholder);
      })), this.init = function() {
      };
    }, getState: function() {
      return { editor: this._editor, editorType: this._editorType, placeholder: this._placeholder, id: this._itemId, columnName: this._columnName };
    }, startEdit: function(c, h) {
      if (this.isVisible() && this.save(), !d.exists(c)) return;
      var _ = { id: c, columnName: h };
      if (t.isReadonly(d.getItem(c))) return void this.callEvent("onEditPrevent", [_]);
      if (this.callEvent("onBeforeEditStart", [_]) === !1) return void this.callEvent("onEditPrevent", [_]);
      const f = this.show(_.id, _.columnName);
      f && f.then ? f.then((function() {
        this.setValue(), this.callEvent("onEditStart", [_]);
      }).bind(this)) : (this.setValue(), this.callEvent("onEditStart", [_]));
    }, isVisible: function() {
      return t._lightbox_id ? !(!this._editor || !Z(this._placeholder, t._lightbox)) : !(!this._editor || !Z(this._placeholder, t.$root));
    }, show: function(c, h) {
      this.isVisible() && this.save();
      var _ = { id: c, columnName: h }, f = a.getColumn(_.columnName), v = this.getEditorConfig(f.name);
      if (!v) return;
      var k = a.$getConfig().editor_types[v.type], b = r(_.id, _.columnName);
      a.$grid_data.appendChild(b);
      const m = (function() {
        this._editor = k, this._placeholder = b, this._itemId = _.id, this._columnName = _.columnName, this._editorType = v.type;
        var p = n.getMapping();
        p.onShow && p.onShow(this, b, a), b._onReMount = (function() {
          this.setValue();
        }).bind(this);
      }).bind(this), g = k.show(_.id, f, v, b);
      if (g && g.then) return g.then(() => {
        m();
      });
      m();
    }, setValue: function() {
      var c, h = this.getState(), _ = h.id, f = h.columnName, v = a.getColumn(f), k = d.getItem(_), b = this.getEditorConfig(f);
      if (b) {
        if (t._lightbox_id) {
          let m = d.getItem(this._itemId);
          b.map_to === "text" ? c = t.getDatastore(t.config.resource_store).getItem(m.resource_id).text : c = b.map_to === "start_date" ? k.start_date === "" || k.start_date === null ? t.getTask(t._lightbox_id).start_date : k.start_date : k[b.map_to];
        } else c = k[b.map_to];
        b.map_to === "auto" && (c = d.getItem(_)), this._editor.set_value(c, _, v, this._placeholder), this.focus();
      }
    }, focus: function() {
      this._editor.focus(this._placeholder);
    }, getValue: function() {
      var c = a.getColumn(this._columnName);
      return this._editor.get_value(this._itemId, c, this._placeholder);
    }, _getItemValue: function() {
      var c = this.getEditorConfig(this._columnName);
      if (c) {
        var h;
        if (t._lightbox_id) {
          let _ = d.getItem(this._itemId);
          c.type === "select" && c.map_to !== "mode" ? h = t.getDatastore(t.config.resource_store).getItem(_.resource_id).id : h = _[c.map_to];
        } else
          h = t.getTask(this._itemId)[c.map_to];
        return c.map_to == "auto" && (h = d.getItem(this._itemId)), h;
      }
    }, isChanged: function() {
      var c = a.getColumn(this._columnName), h = this._getItemValue();
      return this._editor.is_changed(h, this._itemId, c, this._placeholder);
    }, hide: function() {
      if (this._itemId) {
        var c = this._itemId, h = this._columnName, _ = n.getMapping();
        _.onHide && _.onHide(this, this._placeholder, a), this._itemId = null, this._columnName = null, this._editorType = null, this._placeholder && (this._editor && this._editor.hide && this._editor.hide(this._placeholder), this._editor = null, this._placeholder.parentNode && this._placeholder.parentNode.removeChild(this._placeholder), this._placeholder = null, this.callEvent("onEditEnd", [{ id: c, columnName: h }]));
      }
    }, save: function() {
      if (this.isVisible() && d.exists(this._itemId) && this.isChanged()) {
        var c = this._itemId, h = this._columnName;
        if (d.exists(c)) {
          var _ = d.getItem(c), f = this.getEditorConfig(h), v = { id: c, columnName: h, newValue: this.getValue(), oldValue: this._getItemValue() };
          if (this.callEvent("onBeforeSave", [v]) !== !1 && (!this._editor.is_valid || this._editor.is_valid(v.newValue, v.id, a.getColumn(h), this._placeholder))) {
            t._lightbox_id && v.newValue == "" && (v.newValue = v.oldValue);
            var k = f.map_to, b = v.newValue;
            k != "auto" ? (_[k] = b, s(_, k, t.config.inline_editors_date_processing), d.updateItem(c)) : this._editor.save(c, a.getColumn(h), this._placeholder), this.callEvent("onSave", [v]);
          }
          t._lightbox_id || this.hide();
        }
      } else this.hide();
    }, _findEditableCell: function(c, h) {
      var _ = c, f = a.getGridColumns()[_], v = f ? f.name : null;
      if (v) {
        for (; v && !this.getEditorConfig(v); ) v = this._findEditableCell(c + h, h);
        return v;
      }
      return null;
    }, getNextCell: function(c) {
      return this._findEditableCell(a.getColumnIndex(this._columnName, !0) + c, c);
    }, getFirstCell: function() {
      return this._findEditableCell(0, 1);
    }, getLastCell: function() {
      return this._findEditableCell(a.getGridColumns().length - 1, -1);
    }, editNextCell: function(c) {
      var h = this.getNextCell(1);
      if (h) {
        var _ = this.getNextCell(1);
        _ && this.getEditorConfig(_) && this.startEdit(this._itemId, _);
      } else if (c && this.moveRow(1)) {
        var f = this.moveRow(1);
        (h = this.getFirstCell()) && this.getEditorConfig(h) && this.startEdit(f, h);
      }
    }, editPrevCell: function(c) {
      var h = this.getNextCell(-1);
      if (h) {
        var _ = this.getNextCell(-1);
        _ && this.getEditorConfig(_) && this.startEdit(this._itemId, _);
      } else if (c && this.moveRow(-1)) {
        var f = this.moveRow(-1);
        (h = this.getLastCell()) && this.getEditorConfig(h) && this.startEdit(f, h);
      }
    }, moveRow: function(c) {
      for (var h = c > 0 ? t.getNext : t.getPrev, _ = (h = t.bind(h, t))(this._itemId); t.isTaskExists(_) && t.isReadonly(t.getTask(_)); ) _ = h(_);
      return _;
    }, editNextRow: function(c) {
      var h = this.getState().id;
      if (t.isTaskExists(h)) {
        var _ = null;
        _ = c ? this.moveRow(1) : t.getNext(h), t.isTaskExists(_) && this.startEdit(_, this._columnName);
      }
    }, editPrevRow: function(c) {
      var h = this.getState().id;
      if (t.isTaskExists(h)) {
        var _ = null;
        _ = c ? this.moveRow(-1) : t.getPrev(h), t.isTaskExists(_) && this.startEdit(_, this._columnName);
      }
    }, detachStore: function() {
      o.forEach(function(c) {
        d.detachEvent(c);
      }), l.forEach(function(c) {
        t.detachEvent(c);
      }), o = [], l = [], d = null, this.hide();
    }, destructor: function() {
      this.detachStore(), this.detachAllEvents();
    } };
    return H(u, n), H(u, e), u;
  } };
  return H(i, n), H(i, e), i;
}
function Mt(t, n, e, i, a) {
  if (!t.start_date || !t.end_date) return null;
  var r = e.getItemTop(t.id), s = e.getItemHeight(t.id);
  if (r > n.y_end || r + s < n.y) return !1;
  var o = e.posFromDate(t.start_date, e._getPositioningContext ? e._getPositioningContext(t) : null), l = e.posFromDate(t.end_date, e._getPositioningContext ? e._getPositioningContext(t) : null), d = Math.min(o, l) - 200, u = Math.max(o, l) + 200;
  return !(d > n.x_end || u < n.x);
}
function $e(t) {
  function n(r, s, o) {
    if (t._isAllowedUnscheduledTask(r) || !t._isTaskInTimelineLimits(r)) return;
    var l = s.getItemPosition(r), d = o, u = s.$getTemplates(), c = t.getTaskType(r.type), h = s.getBarHeight(r.id, c == d.types.milestone), _ = 0;
    c == d.types.milestone && (_ = (h - l.height) / 2);
    var f = Math.floor((s.getItemHeight(r.id) - h) / 2);
    const v = t.config.baselines && r.baselines && r.baselines.length, k = t.config.baselines && (t.config.baselines.render_mode == "separateRow" || t.config.baselines.render_mode == "individualRow");
    if (v && k && r.bar_height !== "full" && r.bar_height < r.row_height) if (c === d.types.milestone) {
      let S = s.getBarHeight(r.id, !0), C = Math.sqrt(2 * S * S);
      f = Math.floor((C - h) / 2) + 2;
    } else f = 2;
    c == d.types.milestone && (l.left -= Math.round(h / 2), l.width = h);
    var b = document.createElement("div"), m = Math.round(l.width);
    s.$config.item_attribute && (b.setAttribute(s.$config.item_attribute, r.id), b.setAttribute(s.$config.bind + "_id", r.id)), d.show_progress && c != d.types.milestone && function(S, C, E, D, I) {
      var M = 1 * S.progress || 0;
      E = Math.max(E, 0);
      var A = document.createElement("div"), L = Math.round(E * M);
      L = Math.min(E, L), A.style.width = L + "px", A.className = "gantt_task_progress", A.innerHTML = I.progress_text(S.start_date, S.end_date, S), D.rtl && (A.style.position = "absolute", A.style.right = "0px");
      var N = document.createElement("div");
      N.className = "gantt_task_progress_wrapper", N.appendChild(A), C.appendChild(N);
      const P = !t.isReadonly(S), R = t.ext.dragTimeline && t.ext.dragTimeline._isDragInProgress();
      if (t.config.drag_progress && (P || R)) {
        var O = document.createElement("div"), B = L;
        D.rtl && (B = E - L), O.style.left = B + "px", O.className = "gantt_task_progress_drag", O.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="9" viewBox="0 0 12 9" fill="none">
<path d="M5.58397 1.52543C5.78189 1.22856 6.21811 1.22856 6.41602 1.52543L10.5475 7.72265C10.769 8.05493 10.5308 8.5 10.1315 8.5L1.86852 8.5C1.46917 8.5 1.23097 8.05493 1.45249 7.72265L5.58397 1.52543Z" fill="var(--dhx-gantt-progress-handle-background)" stroke="var(--dhx-gantt-progress-handle-border)"/>
</svg>`, A.appendChild(O), C.appendChild(O);
      }
    }(r, b, m, d, u);
    var g = function(S, C, E) {
      var D = document.createElement("div");
      return t.getTaskType(S.type) != t.config.types.milestone ? D.innerHTML = E.task_text(S.start_date, S.end_date, S) : t.getTaskType(S.type) == t.config.types.milestone && C && (D.style.height = D.style.width = C + "px"), D.className = "gantt_task_content", D;
    }(r, m, u);
    b.appendChild(g);
    var p = function(S, C, E, D) {
      var I = D.$getConfig(), M = [S];
      C && M.push(C);
      var A = t.getState(), L = t.getTask(E);
      if (t.getTaskType(L.type) == I.types.milestone ? M.push("gantt_milestone") : t.getTaskType(L.type) == I.types.project && M.push("gantt_project"), M.push("gantt_bar_" + t.getTaskType(L.type)), t.isSummaryTask(L) && M.push("gantt_dependent_task"), t.isSplitTask(L) && (L.$inlineSplit && L.$inlineSplit.length || I.open_split_tasks && !L.$open && L.$inlineSplit && L.$inlineSplit.length || !I.open_split_tasks) && M.push("gantt_split_parent"), I.select_task && t.isSelectedTask(E) && M.push("gantt_selected"), E == A.drag_id && (M.push("gantt_drag_" + A.drag_mode), A.touch_drag && M.push("gantt_touch_" + A.drag_mode)), A.link_source_id == E && (M.push("gantt_link_source"), A.link_from_start ? M.push("gantt_link_from_start") : M.push("gantt_link_from_end")), A.link_target_id == E && M.push("gantt_link_target"), I.highlight_critical_path && t.isCriticalTask && t.isCriticalTask(L) && M.push("gantt_critical_task"), A.link_landing_area && A.link_target_id && A.link_source_id && A.link_target_id != A.link_source_id && (A.link_target_id == E || A.link_source_id == E)) {
        var N = A.link_source_id, P = A.link_from_start, R = A.link_to_start, O = "";
        O = t.isLinkAllowed(N, E, P, R) ? R ? "link_start_allow" : "link_finish_allow" : R ? "link_start_deny" : "link_finish_deny", M.push(O);
      }
      return M.join(" ");
    }("gantt_task_line", u.task_class(r.start_date, r.end_date, r), r.id, s);
    (r.color || r.progressColor || r.textColor) && (p += " gantt_task_inline_color"), l.width < 20 && (p += " gantt_thin_task"), b.className = p;
    var y = ["left:" + l.left + "px", "top:" + (f + l.top) + "px", "height:" + h + "px", "line-height:" + Math.max(h < 30 ? h - 2 : h, 0) + "px", "width:" + m + "px"];
    b.style.cssText = y.join(";"), r.color && b.style.setProperty("--dhx-gantt-task-background", r.color), r.textColor && b.style.setProperty("--dhx-gantt-task-color", r.textColor), r.progressColor && b.style.setProperty("--dhx-gantt-task-progress-color", r.progressColor);
    var $ = function(S, C, E, D) {
      var I = "gantt_left " + i(!C.rtl, S), M = null;
      return D && (M = { type: "marginRight", value: D }), e(S, E.leftside_text, I, M);
    }(r, d, u, _);
    $ && b.appendChild($), $ = function(S, C, E, D) {
      var I = "gantt_right " + i(!!C.rtl, S), M = null;
      return D && (M = { type: "marginLeft", value: D }), e(S, E.rightside_text, I, M);
    }(r, d, u, _), $ && b.appendChild($), t._waiAria.setTaskBarAttr(r, b);
    var x = t.getState();
    const w = !t.isReadonly(r), T = t.ext.dragTimeline && t.ext.dragTimeline._isDragInProgress();
    return (w || T) && (d.drag_resize && !t.isSummaryTask(r) && c != d.types.milestone && a(b, "gantt_task_drag", r, function(S) {
      var C = document.createElement("div");
      return C.className = S, C;
    }, d), d.drag_links && d.show_links && a(b, "gantt_link_control", r, function(S) {
      var C = document.createElement("div");
      C.className = S, C.style.cssText = ["height:" + h + "px", "line-height:" + h + "px"].join(";");
      var E = document.createElement("div");
      E.className = "gantt_link_point";
      var D = !1;
      return x.link_source_id && d.touch && (D = !0), E.style.display = D ? "block" : "", C.appendChild(E), C;
    }, d, _)), b;
  }
  function e(r, s, o, l) {
    if (!s) return null;
    var d = s(r.start_date, r.end_date, r);
    if (!d) return null;
    var u = document.createElement("div");
    return u.className = "gantt_side_content " + o, u.innerHTML = d, l && (u.style[l.type] = Math.abs(l.value) + "px"), u;
  }
  function i(r, s) {
    var o = r ? { $source: [t.config.links.start_to_start], $target: [t.config.links.start_to_start, t.config.links.finish_to_start] } : { $source: [t.config.links.finish_to_start, t.config.links.finish_to_finish], $target: [t.config.links.finish_to_finish] };
    for (var l in o) for (var d = s[l], u = 0; u < d.length; u++) for (var c = t.getLink(d[u]), h = 0; h < o[l].length; h++) if (c.type == o[l][h]) return "gantt_link_crossing";
    return "";
  }
  function a(r, s, o, l, d, u) {
    var c, h = t.getState();
    +o.start_date >= +h.min_date && ((c = l([s, d.rtl ? "task_right" : "task_left", "task_start_date"].join(" "))).setAttribute("data-bind-property", "start_date"), u && (c.style.marginLeft = u + "px"), r.appendChild(c)), +o.end_date <= +h.max_date && ((c = l([s, d.rtl ? "task_left" : "task_right", "task_end_date"].join(" "))).setAttribute("data-bind-property", "end_date"), u && (c.style.marginRight = u + "px"), r.appendChild(c));
  }
  return function(r, s, o) {
    var l = (o = s.$getConfig()).type_renderers[t.getTaskType(r.type)], d = n;
    return l ? l.call(t, r, function(u) {
      return d.call(t, u, s, o);
    }, s) : d.call(t, r, s, o);
  };
}
function yr(t, n, e, i, a) {
  if (!(t.start_date && t.end_date || t.$auto_start_date && t.$auto_end_date)) return null;
  var r = e.getItemTop(t.id), s = e.getItemHeight(t.id);
  if (r > n.y_end || r + s < n.y) return !1;
  const o = [];
  t.start_date && o.push(e.posFromDate(t.start_date, e._getPositioningContext ? e._getPositioningContext(t) : null)), t.end_date && o.push(e.posFromDate(t.end_date, e._getPositioningContext ? e._getPositioningContext(t) : null)), t.$auto_start_date && o.push(e.posFromDate(t.$auto_start_date, e._getPositioningContext ? e._getPositioningContext(t) : null)), t.$auto_end_date && o.push(e.posFromDate(t.$auto_end_date, e._getPositioningContext ? e._getPositioningContext(t) : null));
  var l = Math.min(...o) - 200, d = Math.max(...o) + 200;
  return !(l > n.x_end || d < n.x);
}
function br(t) {
  function n(r, s, o) {
    if (t._isAllowedUnscheduledTask(r) || !t._isTaskInTimelineLimits(r)) return;
    var l = s.getItemPosition(r), d = o, u = s.$getTemplates(), c = t.getTaskType(r.type), h = s.getBarHeight(r.id, c == d.types.milestone), _ = 0;
    c == d.types.milestone && (_ = (h - l.height) / 2);
    var f = Math.floor((s.getItemHeight(r.id) - h) / 2);
    const v = t.config.baselines && r.baselines && r.baselines.length, k = t.config.baselines && (t.config.baselines.render_mode == "separateRow" || t.config.baselines.render_mode == "individualRow");
    if (v && k && r.bar_height !== "full" && r.bar_height < r.row_height) if (c === d.types.milestone) {
      let S = s.getBarHeight(r.id, !0), C = Math.sqrt(2 * S * S);
      f = Math.floor((C - h) / 2) + 2;
    } else f = 2;
    var b = document.createElement("div"), m = Math.round(l.width);
    s.$config.item_attribute && (b.setAttribute(s.$config.item_attribute, r.id), b.setAttribute(s.$config.bind + "_id", r.id));
    const g = document.createElement("div");
    g.classList.add("gantt_task_line_planned", "gantt_task_line", "gantt_project");
    const p = s.getItemPosition(r, r.start_date, r.end_date);
    g.style.cssText = ["position:absolute", "left:" + p.left + "px", "top:" + (f / 2 + 1) + "px", "height:5px", "width:" + p.width + "px"].join(";"), g.style.setProperty("--dhx-gantt-scheduled-summary-bracket-size", "10px"), b.appendChild(g);
    const y = document.createElement("div"), $ = s.getItemPosition(r, r.$auto_start_date || r.start_date, r.$auto_end_date || r.end_date);
    y.classList.add("gantt_task_line_actual", "gantt_task_line", "gantt_project"), y.style.cssText = ["position:absolute", "left:" + $.left + "px", "top:16px", "height:8px", "width:" + $.width + "px"].join(";"), b.appendChild(y), d.show_progress && c != d.types.milestone && function(S, C, E, D, I) {
      var M = 1 * S.progress || 0;
      E = Math.max(E - 2, 0);
      var A = document.createElement("div"), L = Math.round(E * M);
      L = Math.min(E, L), S.progressColor && (A.style.backgroundColor = S.progressColor, A.style.opacity = 1), A.style.width = L + "px", A.className = "gantt_task_progress", A.innerHTML = I.progress_text(S.start_date, S.end_date, S), D.rtl && (A.style.position = "absolute", A.style.right = "0px");
      var N = document.createElement("div");
      if (N.className = "gantt_task_progress_wrapper", N.appendChild(A), C.appendChild(N), t.config.drag_progress && !t.isReadonly(S)) {
        var P = document.createElement("div"), R = L;
        D.rtl && (R = E - L), P.style.left = R + "px", P.className = "gantt_task_progress_drag", A.appendChild(P), C.appendChild(P);
      }
    }(r, y, m, d, u);
    var x = function(S, C, E, D) {
      var I = D.$getConfig(), M = [S];
      C && M.push(C);
      var A = t.getState(), L = t.getTask(E);
      if (t.getTaskType(L.type) == I.types.milestone ? M.push("gantt_milestone") : t.getTaskType(L.type) == I.types.project && M.push("gantt_project"), M.push("gantt_bar_" + t.getTaskType(L.type)), t.isSummaryTask(L) && M.push("gantt_dependent_task"), t.isSplitTask(L) && (L.$inlineSplit && L.$inlineSplit.length || I.open_split_tasks && !L.$open || !I.open_split_tasks) && M.push("gantt_split_parent"), I.select_task && t.isSelectedTask(E) && M.push("gantt_selected"), E == A.drag_id && (M.push("gantt_drag_" + A.drag_mode), A.touch_drag && M.push("gantt_touch_" + A.drag_mode)), A.link_source_id == E && M.push("gantt_link_source"), A.link_target_id == E && M.push("gantt_link_target"), I.highlight_critical_path && t.isCriticalTask && t.isCriticalTask(L) && M.push("gantt_critical_task"), A.link_landing_area && A.link_target_id && A.link_source_id && A.link_target_id != A.link_source_id && (A.link_target_id == E || A.link_source_id == E)) {
        var N = A.link_source_id, P = A.link_from_start, R = A.link_to_start, O = "";
        O = t.isLinkAllowed(N, E, P, R) ? R ? "link_start_allow" : "link_finish_allow" : R ? "link_start_deny" : "link_finish_deny", M.push(O);
      }
      return M.join(" ");
    }("gantt_task_line", u.task_class(r.$auto_start_date || r.start_date, r.$auto_end_date || r.end_date, r), r.id, s);
    (r.color || r.progressColor || r.textColor) && (x += " gantt_task_inline_color"), l.width < 20 && (x += " gantt_thin_task"), (r.start_date > r.$auto_start_date || r.end_date < r.$auto_end_date) && (x += " gantt_project_scheduling_conflict"), b.className = x, b.style.top = f + l.top + "px", b.style.height = (c == d.types.milestone ? l.height : h) + "px", r.color && b.style.setProperty("--dhx-gantt-task-background", r.color), r.textColor && b.style.setProperty("--dhx-gantt-task-color", r.textColor), r.progressColor && b.style.setProperty("--dhx-gantt-task-progress-color", r.progressColor);
    var w = function(S, C, E, D) {
      var I = "gantt_left " + i(!C.rtl, S), M = null;
      return D && (M = { type: "marginRight", value: D }), e(S, E.leftside_text, I, M);
    }(r, d, u, _);
    w && g.appendChild(w), w = function(S, C, E, D) {
      var I = "gantt_right " + i(!!C.rtl, S), M = null;
      return D && (M = { type: "marginLeft", value: D }), e(S, E.rightside_text, I, M);
    }(r, d, u, _), w && g.appendChild(w), t._waiAria.setTaskBarAttr(r, b);
    var T = t.getState();
    return t.isReadonly(r) || (d.drag_resize && a(g, "gantt_task_drag", r, function(S) {
      var C = document.createElement("div");
      return C.className = S, C;
    }, d), d.drag_links && d.show_links && a(g, "gantt_link_control", r, function(S) {
      var C = document.createElement("div");
      C.className = S, C.style.cssText = ["height:" + h + "px", "line-height:" + h + "px"].join(";");
      var E = document.createElement("div");
      E.className = "gantt_link_point";
      var D = !1;
      return T.link_source_id && d.touch && (D = !0), E.style.display = D ? "block" : "", C.appendChild(E), C;
    }, d, _)), b;
  }
  function e(r, s, o, l) {
    if (!s) return null;
    var d = s(r.start_date, r.end_date, r);
    if (!d) return null;
    var u = document.createElement("div");
    return u.className = "gantt_side_content " + o, u.innerHTML = d, l && (u.style[l.type] = Math.abs(l.value) + "px"), u;
  }
  function i(r, s) {
    var o = r ? { $source: [t.config.links.start_to_start], $target: [t.config.links.start_to_start, t.config.links.finish_to_start] } : { $source: [t.config.links.finish_to_start, t.config.links.finish_to_finish], $target: [t.config.links.finish_to_finish] };
    for (var l in o) for (var d = s[l], u = 0; u < d.length; u++) for (var c = t.getLink(d[u]), h = 0; h < o[l].length; h++) if (c.type == o[l][h]) return "gantt_link_crossing";
    return "";
  }
  function a(r, s, o, l, d, u) {
    var c, h = t.getState();
    +o.start_date >= +h.min_date && ((c = l([s, d.rtl ? "task_right" : "task_left", "task_start_date"].join(" "))).setAttribute("data-bind-property", "start_date"), u && (c.style.marginLeft = u + "px"), r.appendChild(c)), +o.end_date <= +h.max_date && ((c = l([s, d.rtl ? "task_left" : "task_right", "task_end_date"].join(" "))).setAttribute("data-bind-property", "end_date"), u && (c.style.marginRight = u + "px"), r.appendChild(c));
  }
  return function(r, s, o) {
    var l = (o = s.$getConfig()).type_renderers[t.getTaskType(r.type)], d = n;
    return l ? l.call(t, r, function(u) {
      return d.call(t, u, s, o);
    }, s) : d.call(t, r, s, o);
  };
}
function $r(t, n, e, i, a) {
  if (!a.isSplitTask(t)) return !1;
  var r = a.getSubtaskDates(t.id);
  return Mt({ id: t.id, start_date: r.start_date, end_date: r.end_date, parent: t.parent }, n, e);
}
function Oe(t, n, e) {
  return { top: n.getItemTop(t.id), height: n.getItemHeight(t.id), left: 0, right: 1 / 0 };
}
function Ct(t, n) {
  var e = 0, i = t.left.length - 1;
  if (n) for (var a = 0; a < t.left.length; a++) {
    var r = t.left[a];
    if (r < n.x && (e = a), r > n.x_end) {
      i = a;
      break;
    }
  }
  return { start: e, end: i };
}
function Wt(t, n, e, i) {
  var a = n.width[t];
  if (a <= 0) return !1;
  if (!i.config.smart_rendering || Ft(i)) return !0;
  var r = n.left[t] - a, s = n.left[t] + a;
  return r <= e.x_end && s >= e.x;
}
function xr(t, n) {
  var e = n.config.timeline_placeholder;
  if (t = t || [], e && t.filter((l) => l.id === "timeline_placeholder_task").length === 0) {
    var i = n.getState(), a = null, r = i.min_date, s = i.max_date;
    t.length && (a = t[t.length - 1].id);
    var o = { start_date: r, end_date: s, row_height: e.height || 0, id: "timeline_placeholder_task", unscheduled: !0, lastTaskId: a, calendar_id: e.calendar || "global", $source: [], $target: [] };
    t.push(o);
  }
}
function wr(t) {
  var n = { current_pos: null, dirs: { left: "left", right: "right", up: "up", down: "down" }, path: [], clear: function() {
    this.current_pos = null, this.path = [];
  }, point: function(a) {
    this.current_pos = t.copy(a);
  }, get_lines: function(a) {
    this.clear(), this.point(a[0]);
    for (var r = 1; r < a.length; r++) this.line_to(a[r]);
    return this.get_path();
  }, line_to: function(a) {
    var r = t.copy(a), s = this.current_pos, o = this._get_line(s, r);
    this.path.push(o), this.current_pos = r;
  }, get_path: function() {
    return this.path;
  }, get_wrapper_sizes: function(a, r, s) {
    var o, l = r.$getConfig().link_wrapper_width, d = a.y - l / 2;
    switch (a.direction) {
      case this.dirs.left:
        o = { top: d, height: l, lineHeight: l, left: a.x - a.size - l / 2, width: a.size + l };
        break;
      case this.dirs.right:
        o = { top: d, lineHeight: l, height: l, left: a.x - l / 2, width: a.size + l };
        break;
      case this.dirs.up:
        o = { top: d - a.size, lineHeight: a.size + l, height: a.size + l, left: a.x - l / 2, width: l };
        break;
      case this.dirs.down:
        o = { top: d, lineHeight: a.size + l, height: a.size + l, left: a.x - l / 2, width: l };
    }
    return o;
  }, get_line_sizes: function(a, r) {
    var s, o = r.$getConfig(), l = o.link_line_width, d = o.link_wrapper_width, u = a.size + l;
    switch (a.direction) {
      case this.dirs.left:
      case this.dirs.right:
        s = { height: l, width: u, marginTop: (d - l) / 2, marginLeft: (d - l) / 2 };
        break;
      case this.dirs.up:
      case this.dirs.down:
        s = { height: u, width: l, marginTop: (d - l) / 2, marginLeft: (d - l) / 2 };
    }
    return s;
  }, render_line: function(a, r, s, o) {
    var l = this.get_wrapper_sizes(a, s, o), d = document.createElement("div");
    d.style.cssText = ["top:" + l.top + "px", "left:" + l.left + "px", "height:" + l.height + "px", "width:" + l.width + "px"].join(";"), d.className = "gantt_line_wrapper";
    var u = this.get_line_sizes(a, s), c = document.createElement("div");
    return c.style.cssText = ["height:" + u.height + "px", "width:" + u.width + "px", "margin-top:" + u.marginTop + "px", "margin-left:" + u.marginLeft + "px"].join(";"), c.className = "gantt_link_line_" + a.direction, d.appendChild(c), d;
  }, render_corner: function(a, r) {
    const s = a.radius, o = r.$getConfig(), l = o.link_line_width || 2, d = document.createElement("div");
    let u, c;
    return d.classList.add("gantt_link_corner"), d.classList.add(`gantt_link_corner_${a.direction.from}_${a.direction.to}`), d.style.width = `${s}px`, d.style.height = `${s}px`, a.direction.from === "right" && a.direction.to === "down" ? (u = "Right", c = "Top", d.style.left = a.x - o.link_line_width / 2 + "px", d.style.top = `${a.y}px`) : a.direction.from === "down" && a.direction.to === "right" ? (u = "Left", c = "Bottom", d.style.left = a.x - o.link_line_width / 2 + "px", d.style.top = `${a.y}px`) : a.direction.from === "right" && a.direction.to === "up" ? (u = "Right", c = "Bottom", d.style.left = a.x - o.link_line_width / 2 + "px", d.style.top = a.y - s + "px") : a.direction.from === "up" && a.direction.to === "right" ? (u = "Left", c = "Top", d.style.left = a.x - o.link_line_width / 2 + "px", d.style.top = a.y - s + "px") : a.direction.from === "left" && a.direction.to === "down" ? (u = "Left", c = "Top", d.style.left = a.x - s - o.link_line_width / 2 + "px", d.style.top = `${a.y}px`) : a.direction.from === "down" && a.direction.to === "left" ? (u = "Right", c = "Bottom", d.style.left = a.x - s - o.link_line_width / 2 + "px", d.style.top = `${a.y}px`) : a.direction.from === "left" && a.direction.to === "up" ? (u = "Left", c = "Bottom", d.style.left = a.x - s - o.link_line_width / 2 + "px", d.style.top = a.y - s + "px") : a.direction.from === "up" && a.direction.to === "left" && (u = "Right", c = "Top", d.style.left = a.x - s - o.link_line_width / 2 + "px", d.style.top = a.y - s + "px"), d.style[`border${c}Width`] = `${l}px`, d.style[`border${u}Width`] = `${l}px`, d.style[`border${u}Style`] = "solid", d.style[`border${c}Style`] = "solid", d.style[`border${c}${u}Radius`] = `${s}px`, d;
  }, render_arrow(a, r) {
    var s = document.createElement("div"), o = a.y, l = a.x, d = r.link_arrow_size;
    s.style.setProperty("--dhx-gantt-icon-size", `${d}px`);
    var u = "gantt_link_arrow gantt_link_arrow_" + a.direction;
    return s.style.top = o + "px", s.style.left = l + "px", s.className = u, s;
  }, _get_line: function(a, r) {
    var s = this.get_direction(a, r), o = { x: a.x, y: a.y, direction: this.get_direction(a, r) };
    return s == this.dirs.left || s == this.dirs.right ? o.size = Math.abs(a.x - r.x) : o.size = Math.abs(a.y - r.y), o;
  }, get_direction: function(a, r) {
    return r.x < a.x ? this.dirs.left : r.x > a.x ? this.dirs.right : r.y > a.y ? this.dirs.down : this.dirs.up;
  } }, e = { path: [], clear: function() {
    this.path = [];
  }, current: function() {
    return this.path[this.path.length - 1];
  }, point: function(a) {
    return a ? (this.path.push(t.copy(a)), a) : this.current();
  }, point_to: function(a, r, s) {
    s = s ? { x: s.x, y: s.y } : t.copy(this.point());
    var o = n.dirs;
    switch (a) {
      case o.left:
        s.x -= r;
        break;
      case o.right:
        s.x += r;
        break;
      case o.up:
        s.y -= r;
        break;
      case o.down:
        s.y += r;
    }
    return this.point(s);
  }, get_points: function(a, r, s, o) {
    var l = this.get_endpoint(a, r, s, o), d = t.config, u = l.e_y - l.y, c = l.e_x - l.x, h = n.dirs, _ = r.getItemHeight(a.source);
    this.clear(), this.point({ x: l.x, y: l.y });
    var f = 2 * d.link_arrow_size, v = this.get_line_type(a, r.$getConfig()), k = l.e_x > l.x;
    if (v.from_start && v.to_start) this.point_to(h.left, f), k ? (this.point_to(h.down, u), this.point_to(h.right, c)) : (this.point_to(h.right, c), this.point_to(h.down, u)), this.point_to(h.right, f);
    else if (!v.from_start && v.to_start) if (u !== 0 && (k = l.e_x > l.x + 2 * f), this.point_to(h.right, f), k) c -= f, this.point_to(h.down, u), this.point_to(h.right, c);
    else {
      c -= 2 * f;
      var b = u > 0 ? 1 : -1;
      this.point_to(h.down, b * (_ / 2)), this.point_to(h.right, c), this.point_to(h.down, b * (Math.abs(u) - _ / 2)), this.point_to(h.right, f);
    }
    else v.from_start || v.to_start ? v.from_start && !v.to_start && (u !== 0 && (k = l.e_x > l.x - 2 * f), this.point_to(h.left, f), k ? (c += 2 * f, b = u > 0 ? 1 : -1, this.point_to(h.down, b * (_ / 2)), this.point_to(h.right, c), this.point_to(h.down, b * (Math.abs(u) - _ / 2)), this.point_to(h.left, f)) : (c += f, this.point_to(h.down, u), this.point_to(h.right, c))) : (this.point_to(h.right, f), k ? (this.point_to(h.right, c), this.point_to(h.down, u)) : (this.point_to(h.down, u), this.point_to(h.right, c)), this.point_to(h.left, f));
    return this.path;
  }, get_line_type: function(a, r) {
    var s = r.links, o = !1, l = !1;
    return a.type == s.start_to_start ? o = l = !0 : a.type == s.finish_to_finish ? o = l = !1 : a.type == s.finish_to_start ? (o = !1, l = !0) : a.type == s.start_to_finish ? (o = !0, l = !1) : t.assert(!1, "Invalid link type"), r.rtl && (o = !o, l = !l), { from_start: o, to_start: l };
  }, get_endpoint: function(a, r, s, o) {
    var l = r.$getConfig(), d = this.get_line_type(a, l), u = d.from_start, c = d.to_start, h = i(s, r, l), _ = i(o, r, l);
    return { x: u ? h.left : h.left + h.width, e_x: c ? _.left : _.left + _.width, y: h.top + h.rowHeight / 2 - 1, e_y: _.top + _.rowHeight / 2 - 1 };
  } };
  function i(a, r, s) {
    var o = r.getItemPosition(a);
    let l = ne(t, r, a), d = l.maxHeight, u = l.splitChild;
    const c = t.config.baselines && (t.config.baselines.render_mode == "separateRow" || t.config.baselines.render_mode == "individualRow") && a.baselines && a.baselines.length;
    let h;
    l.shrinkHeight && (o.rowHeight = d);
    let _ = t.getTaskType(a.type) == s.types.milestone;
    if (_) {
      let f = r.getBarHeight(a.id, !0);
      h = Math.sqrt(2 * f * f), l.shrinkHeight && d < f && (f = d, h = d), o.left -= h / 2, o.width = h;
    }
    if (u) if (d >= o.height) {
      const f = Tt(t, a.parent);
      c || f ? _ ? (o.rowHeight = o.height + 4, o.left += (o.width - o.rowHeight + 4) / 2, o.width = o.rowHeight - 3) : o.rowHeight = o.height + 6 : _ && (o.left += (h - o.height) / 2);
    } else o.rowHeight = d + 2, _ && (o.left += (o.width - o.rowHeight + 4) / 2, o.width = o.rowHeight - 3);
    else c && (o.rowHeight = o.height + 4);
    return o;
  }
  return { render: function(a, r, s) {
    var o = t.getTask(a.source);
    if (o.hide_bar) return;
    var l = t.getTask(a.target);
    if (l.hide_bar) return;
    var d = e.get_endpoint(a, r, o, l), u = d.e_y - d.y;
    if (!(d.e_x - d.x) && !u) return null;
    var c = e.get_points(a, r, o, l);
    const h = function(k, b) {
      const m = b.link_radius || 4, g = b.link_arrow_size || 6, p = [];
      for (let $ = 0; $ < k.length; $++) {
        const x = k[$], w = k[$ + 1];
        if (!w || b.link_radius <= 1) p.push({ type: "line", data: x });
        else if (x.direction !== w.direction) {
          if (x.size < m || w.size < m) {
            p.push({ type: "line", data: x });
            continue;
          }
          x.size -= m, p.push({ type: "line", data: x });
          let T = x.x, S = x.y - b.link_line_width / 2;
          switch (x.direction) {
            case "right":
              T += x.size;
              break;
            case "left":
              T -= x.size;
              break;
            case "down":
              S += x.size;
              break;
            case "up":
              S -= x.size;
          }
          const C = { x: T, y: S, direction: { from: x.direction, to: w.direction }, radius: m };
          switch (p.push({ type: "corner", data: C }), w.direction) {
            case "right":
              w.x += m, w.size -= m;
              break;
            case "left":
              w.x -= m, w.size -= m;
              break;
            case "down":
              w.y += m, w.size -= m;
              break;
            case "up":
              w.y -= m, w.size -= m;
          }
        } else p.push({ type: "line", data: x });
      }
      const y = k[k.length - 1];
      if (y.direction === "right" || y.direction === "left") {
        y.size -= 3 * g / 4;
        let $ = y.direction === "right" ? y.x + y.size : y.x - y.size - g / 2, x = y.y - b.link_line_width / 2 - g / 2 + 1;
        y.direction === "left" ? (x -= 1, $ -= 2) : $ -= 1;
        const w = { x: $, y: x, size: g, direction: y.direction };
        p.push({ type: "line", data: y }), p.push({ type: "arrow", data: w });
      } else p.push({ type: "line", data: y });
      return p;
    }(n.get_lines(c, r).filter((k) => k.size > 0), s), _ = function(k, b, m, g) {
      const p = document.createElement("div");
      return k.forEach((y) => {
        let $;
        y.type === "line" ? $ = n.render_line(y.data, null, b, m.source) : y.type === "corner" ? $ = n.render_corner(y.data, b) : y.type === "arrow" && ($ = n.render_arrow(y.data, g)), p.appendChild($);
      }), p;
    }(h, r, a, s);
    var f = "gantt_task_link";
    a.color && (f += " gantt_link_inline_color");
    var v = t.templates.link_class ? t.templates.link_class(a) : "";
    return v && (f += " " + v), s.highlight_critical_path && t.isCriticalLink && t.isCriticalLink(a) && (f += " gantt_critical_link"), _.className = f, r.$config.link_attribute && (_.setAttribute(r.$config.link_attribute, a.id), _.setAttribute("link_id", a.id)), a.color && _.style.setProperty("--dhx-gantt-link-background", a.color), t._waiAria.linkAttr(a, _), _;
  }, update: null, isInViewPort: Zn, getVisibleRange: Xn() };
}
function Sr(t, n, e, i, a) {
  if (a.$ui.getView("grid") && (a.config.keyboard_navigation && a.getSelectedId() || a.ext.inlineEditors && a.ext.inlineEditors.getState().id)) return !(!e || !e.$config || e.$config.type) || !!t.$expanded_branch;
  var r = e.getItemTop(t.id), s = e.getItemHeight(t.id);
  return !(r > n.y_end || r + s < n.y);
}
function ei(t) {
  let n = {};
  return t.$data.tasksStore.attachEvent("onStoreUpdated", function() {
    n = {};
  }), function(e, i, a, r) {
    const s = e.id + "_" + i + "_" + a.unit + "_" + a.step;
    let o;
    return o = n[s] ? n[s] : n[s] = function(l, d, u, c) {
      let h, _ = !1, f = {};
      t.config.process_resource_assignments && d === t.config.resource_property ? (h = l.$role == "task" ? t.getResourceAssignments(l.$resource_id, l.$task_id) : t.getResourceAssignments(l.id), _ = !0) : h = l.$role == "task" ? [] : t.getTaskBy(d, l.id), f = function(w, T, S) {
        const C = T.unit, E = T.step, D = {}, I = {};
        for (let M = 0; M < w.length; M++) {
          const A = w[M];
          let L = A;
          if (S && (L = t.getTask(A.task_id)), L.unscheduled) continue;
          let N = A.start_date || L.start_date, P = A.end_date || L.end_date;
          S && (A.start_date && (N = new Date(Math.max(A.start_date.valueOf(), L.start_date.valueOf()))), A.end_date && (P = new Date(Math.min(A.end_date.valueOf(), L.end_date.valueOf()))), A.mode && A.mode == "fixedDates" && (N = A.start_date, P = A.end_date));
          let R = It(T.trace_x, N.valueOf()), O = new Date(T.trace_x[R] || t.date[C + "_start"](new Date(N))), B = new Date(Math.min(N.valueOf(), O.valueOf())), z = t.config.work_time ? t.getTaskCalendar(L) : t;
          for (I[z.id] = {}; B < P; ) {
            const K = I[z.id], W = B.valueOf();
            B = t.date.add(B, E, C), K[W] !== !1 && (D[W] || (D[W] = { tasks: [], assignments: [] }), D[W].tasks.push(L), S && D[W].assignments.push(A));
          }
        }
        return D;
      }(h, u, _);
      const v = u.unit, k = u.step, b = [];
      let m, g, p, y, $;
      const x = c.$getConfig();
      for (let w = 0; w < u.trace_x.length; w++) m = new Date(u.trace_x[w]), g = t.date.add(m, k, v), $ = f[m.valueOf()] || {}, p = $.tasks || [], y = $.assignments || [], p.length || x.resource_render_empty_cells ? b.push({ start_date: m, end_date: g, tasks: p, assignments: y }) : b.push(null);
      return b;
    }(e, i, a, r), o;
  };
}
function Tr(t, n, e, i) {
  var a = 100 * (1 - (1 * t || 0)), r = i.posFromDate(n), s = i.posFromDate(e), o = document.createElement("div");
  return o.className = "gantt_histogram_hor_bar", o.style.top = a + "%", o.style.left = r + "px", o.style.width = s - r + 1 + "px", o;
}
function Cr(t, n, e) {
  if (t === n) return null;
  var i = 1 - Math.max(t, n), a = Math.abs(t - n), r = document.createElement("div");
  return r.className = "gantt_histogram_vert_bar", r.style.top = 100 * i + "%", r.style.height = 100 * a + "%", r.style.left = e + "px", r;
}
function Er(t) {
  var n = ei(t), e = {}, i = {}, a = {};
  function r(l, d) {
    var u = e[l];
    u && u[d] && u[d].parentNode && u[d].parentNode.removeChild(u[d]);
  }
  function s(l, d, u, c, h, _, f) {
    var v = a[l.id];
    v && v.parentNode && v.parentNode.removeChild(v);
    var k = function(b, m, g, p) {
      for (var y = m.getScale(), $ = document.createElement("div"), x = Ct(y, p), w = x.start; w <= x.end; w++) {
        var T = y.trace_x[w], S = y.trace_x[w + 1] || t.date.add(T, y.step, y.unit), C = y.trace_x[w].valueOf(), E = Math.min(b[C] / g, 1) || 0;
        if (E < 0) return null;
        var D = Math.min(b[S.valueOf()] / g, 1) || 0, I = Tr(E, T, S, m);
        I && $.appendChild(I);
        var M = Cr(E, D, m.posFromDate(S));
        M && $.appendChild(M);
      }
      return $;
    }(u, h, _, f);
    return k && d && (k.setAttribute("data-resource-id", l.id), k.setAttribute(h.$config.item_attribute, l.id), k.style.position = "absolute", k.style.top = d.top + 1 + "px", k.style.height = h.getItemHeight(l.id) - 1 + "px", k.style.left = 0), k;
  }
  function o(l, d, u, c, h, _, f) {
    var v = h.histogram_cell_class(_.start_date, _.end_date, l, _.tasks, _.assignments), k = h.histogram_cell_label(_.start_date, _.end_date, l, _.tasks, _.assignments), b = h.histogram_cell_allocated(_.start_date, _.end_date, l, _.tasks, _.assignments), m = f.getItemHeight(l.id) - 1;
    if (v || k) {
      var g = document.createElement("div");
      return g.className = ["gantt_histogram_cell", v].join(" "), g.setAttribute(f.$config.item_attribute, l.id), g.style.cssText = ["left:" + d.left + "px", "width:" + d.width + "px", "height:" + m + "px", "line-height:" + m + "px", "top:" + (d.top + 1) + "px"].join(";"), k && (k = "<div class='gantt_histogram_label'>" + k + "</div>"), b && (k = "<div class='gantt_histogram_fill' style='height:" + 100 * Math.min(b / u || 0, 1) + "%;'></div>" + k), k && (g.innerHTML = k), g;
    }
    return null;
  }
  return { render: function(l, d, u, c) {
    var h = d.$getTemplates(), _ = d.getScale(), f = n(l, u.resource_property, _, d), v = [], k = {}, b = l.capacity || d.$config.capacity || 24;
    e[l.id] = {}, i[l.id] = null, a[l.id] = null;
    for (var m = !!c, g = Ct(_, c), p = g.start; p <= g.end; p++) {
      var y = f[p];
      if (y && (!m || Wt(p, _, c, t))) {
        var $ = h.histogram_cell_capacity(y.start_date, y.end_date, l, y.tasks, y.assignments);
        k[y.start_date.valueOf()] = $ || 0;
        var x = d.getItemPosition(l, y.start_date, y.end_date), w = o(l, x, b, 0, h, y, d);
        w && (v.push(w), e[l.id][p] = w);
      }
    }
    var T = null;
    if (v.length) {
      T = document.createElement("div");
      for (var S = 0; S < v.length; S++) T.appendChild(v[S]);
      var C = s(l, x, k, 0, d, b, c);
      C && (T.appendChild(C), a[l.id] = C), i[l.id] = T;
    }
    return T;
  }, update: function(l, d, u, c, h) {
    var _ = u.$getTemplates(), f = u.getScale(), v = n(l, c.resource_property, f, u), k = l.capacity || u.$config.capacity || 24, b = {}, m = !!h, g = Ct(f, h), p = {};
    if (e && e[l.id]) for (var y in e[l.id]) p[y] = y;
    for (var $ = g.start; $ <= g.end; $++) {
      var x = v[$];
      if (p[$] = !1, x) {
        var w = _.histogram_cell_capacity(x.start_date, x.end_date, l, x.tasks, x.assignments);
        b[x.start_date.valueOf()] = w || 0;
        var T = u.getItemPosition(l, x.start_date, x.end_date);
        if (!m || Wt($, f, h, t)) {
          var S = e[l.id];
          if (S && S[$]) S && S[$] && !S[$].parentNode && d.appendChild(S[$]);
          else {
            var C = o(l, T, k, 0, _, x, u);
            C && (d.appendChild(C), e[l.id][$] = C);
          }
        } else r(l.id, $);
      }
    }
    for (var y in p) p[y] !== !1 && r(l.id, y);
    var E = s(l, T, b, 0, u, k, h);
    E && (d.appendChild(E), a[l.id] = E);
  }, getRectangle: Oe, getVisibleRange: Q };
}
function Je(t, n, e, i, a, r) {
  const s = { id: t.id, parent: t.id };
  function o(u) {
    if (!(u[r.start_date] && u[r.end_date])) return !1;
    for (let c = 0; c < r.length; c++) if (!u[r[c]]) return !1;
    return !0;
  }
  const l = o(t);
  let d = !1;
  return l && (s.start_date = t[r.start_date], s.end_date = t[r.end_date]), t.render == "split" && a.eachTask(function(u) {
    o(u) && (d = !0, s.start_date = s.start_date || u[r.start_date], s.end_date = s.end_date || u[r.end_date], s.start_date < u[r.start_date] && (s.start_date = u[r.start_date]), s.end_date > u[r.end_date] && (s.end_date = u[r.end_date]));
  }), !(!l && !d) && Mt(s, n, e);
}
function Dr(t, n, e, i, a) {
  return ni(a) ? Je(t, n, e, 0, a, { start_date: "constraint_date", end_date: "constraint_date", additional_properties: ["constraint_type"] }) : !1;
}
function ni(t) {
  const n = t._getAutoSchedulingConfig();
  return !!n.apply_constraints && (!(!n.enabled || n.show_constraints === !1) || void 0);
}
function Ar(t) {
  const n = {};
  for (let i in t.config.constraint_types) n[t.config.constraint_types[i]] = i;
  function e(i, a, r) {
    const s = function(_) {
      const f = t.getConstraintType(_);
      return n[f].toLowerCase();
    }(i);
    if (s == "asap" || s == "alap") return !1;
    const o = document.createElement("div"), l = t.getTaskPosition(i, i.constraint_date, i.constraint_date);
    let { height: d, marginTop: u } = Un(t, a, l, 30, i, r), c = d, h = 0;
    switch (s) {
      case "snet":
      case "fnet":
      case "mso":
        h = t.config.rtl ? 1 : -c - 1;
        break;
      case "snlt":
      case "fnlt":
      case "mfo":
        h = t.config.rtl ? -c - 1 : 1;
    }
    switch (i.type === t.config.types.milestone && (u -= 1), o.style.height = d + "px", o.style.width = c + "px", o.style.left = l.left + "px", o.style.top = l.top + "px", o.style.marginLeft = h + "px", o.style.marginTop = u + "px", o.className = "gantt_constraint_marker gantt_constraint_marker_" + s, s) {
      case "snet":
      case "snlt":
      case "fnet":
      case "fnlt":
        o.innerHTML = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Start No Later Than">
<line id="Line 3" x1="30.5" y1="6.92097e-08" x2="30.5" y2="32" stroke="#555D63" stroke-width="3" stroke-dasharray="3 3"/>
<path id="Vector" d="m 18.3979,23.5 v -6 H 3.05161 L 3,14.485 H 18.3979 V 8.5 L 27,16 Z" fill="#555D63"/>
</g>
</svg>
`;
        break;
      case "mfo":
      case "mso":
        o.innerHTML = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Must Start On ">
<path id="Vector" d="m 18.3979,23.5 v -6 H 3.05161 L 3,14.485 H 18.3979 V 8.5 L 27,16 Z" fill="#555D63"/>
<line id="line" x1="30.5" y1="-6.55671e-08" x2="30.5" y2="32" stroke="black" stroke-opacity="0.7" stroke-width="3"/>
</g>
</svg>
`;
    }
    return o.setAttribute("data-task-id", i.id), o;
  }
  return { render: function(i, a, r, s) {
    if (ni(t)) {
      const o = document.createElement("div");
      if (o.className = "gantt_constraint_nodes", o.setAttribute("data-task-row-id", i.id), i.constraint_date && i.constraint_type) {
        const l = e(i, a);
        l && o.appendChild(l);
      }
      if (pt(i)) {
        const l = Tt(t, i.id);
        t.eachTask(function(d) {
          if (d.constraint_date && d.constraint_type) {
            const u = e(d, a, l);
            u && o.appendChild(u);
          }
        }, i.id);
      }
      if (o.childNodes.length) return o;
    }
  }, isInViewPort: Dr, getVisibleRange: Q };
}
function Ir(t, n, e, i, a) {
  return Je(t, n, e, 0, a, { start_date: "deadline", end_date: "deadline" });
}
function Mr(t, n, e, i, a) {
  let r = !1;
  const s = { start_date: "start_date", end_date: "end_date" };
  return t.type == a.config.types.milestone && (s.end_date = s.start_date), t.baselines && (r = kn(t, n, e, i, a, s)), pt(t) && a.eachTask(function(o) {
    r || o.baselines && o.baselines.length && (o.type == a.config.types.milestone && (s.end_date = s.start_date), kn(o, n, e, i, a, s) && (r = !0));
  }, t.id), r;
}
function kn(t, n, e, i, a, r) {
  for (var s = 0; s < t.baselines.length; s++)
    if (Je({ id: t.id, parent: t.parent, start_date: t.baselines[s].start_date, end_date: t.baselines[s].end_date }, n, e, 0, a, r)) return !0;
}
const Lr = { init: function(t, n) {
  var e = t.$services.getService("dnd");
  if (n.$config.bind && t.getDatastore(n.$config.bind)) {
    var i = new e(n.$grid_data, { updates_per_second: 60 });
    t.defined(n.$getConfig().dnd_sensitivity) && (i.config.sensitivity = n.$getConfig().dnd_sensitivity), i.attachEvent("onBeforeDragStart", t.bind(function(o, l) {
      var d = a(l);
      if (!d || (t.hideQuickInfo && t.hideQuickInfo(), ct(l.target, ".gantt_grid_editor_placeholder"))) return !1;
      var u = d.getAttribute(n.$config.item_attribute);
      if (s(u)) return !1;
      var c = r().getItem(u);
      return !t.isReadonly(c) && (i.config.initial_open_state = c.$open, !!t.callEvent("onRowDragStart", [u, l.target || l.srcElement, l]) && void 0);
    }, t)), i.attachEvent("onAfterDragStart", t.bind(function(o, l) {
      var d = a(l);
      i.config.marker.innerHTML = d.outerHTML;
      var u = i.config.marker.firstChild;
      u && (u.style.position = "static"), i.config.id = d.getAttribute(n.$config.item_attribute);
      var c = r(), h = c.getItem(i.config.id);
      i.config.index = c.getBranchIndex(i.config.id), i.config.parent = h.parent, h.$open = !1, h.$transparent = !0, this.refreshData();
    }, t)), i.lastTaskOfLevel = function(o) {
      for (var l = null, d = r().getItems(), u = 0, c = d.length; u < c; u++) d[u].$level == o && (l = d[u]);
      return l ? l.id : null;
    }, i._getGridPos = t.bind(function(o) {
      var l = Y(n.$grid_data), d = l.x + n.$grid.scrollLeft, u = o.pos.y - 10, c = n.getItemHeight(i.config.id);
      u < l.y && (u = l.y);
      var h = n.getTotalHeight();
      u > l.y + h - c && (u = l.y + h - c);
      const _ = l.y + l.height;
      return u > _ - c && (u = _ - c), l.x = d, l.y = u, l;
    }, t), i._getTargetY = t.bind(function(o) {
      var l = Y(n.$grid_data), d = n.$state.scrollTop || 0, u = t.$grid_data.getBoundingClientRect().height + d, c = o.pageY - l.y + d;
      return c > u ? c = u : c < d && (c = d), c;
    }, t), i._getTaskByY = t.bind(function(o, l) {
      var d = r();
      o = o || 0;
      var u = n.getItemIndexByTopPosition(o);
      return (u = l < u ? u - 1 : u) > d.countVisible() - 1 ? null : d.getIdByIndex(u);
    }, t), i.attachEvent("onDragMove", t.bind(function(o, l) {
      var d = t.$grid_data.getBoundingClientRect(), u = d.height + d.y + (n.$state.scrollTop || 0) + window.scrollY, c = i.config, h = i._getGridPos(l);
      t._waiAria.reorderMarkerAttr(c.marker);
      var _ = n.$getConfig(), f = r();
      h.y < u ? c.marker.style.top = h.y + "px" : c.marker.style.top = u + "px", c.marker.style.left = h.x + 10 + "px";
      const v = Y(t.$root);
      h.width > v.width && (c.marker.style.width = v.width - 10 - 2 + "px", c.marker.style.overflow = "hidden");
      var k = f.getItem(i.config.id), b = i._getTargetY(l), m = i._getTaskByY(b, f.getIndexById(k.id));
      function g(D, I) {
        return !f.isChildOf(p.id, I.id) && (D.$level == I.$level || _.order_branch_free);
      }
      if (f.exists(m) || (m = i.lastTaskOfLevel(_.order_branch_free ? k.$level : 0)) == i.config.id && (m = null), f.exists(m)) {
        var p = f.getItem(m), y = n.getItemTop(p.id), $ = n.getItemHeight(p.id);
        if (y + $ / 2 < b) {
          var x = f.getIndexById(p.id), w = f.getNext(p.id), T = f.getItem(w);
          if (s(w)) {
            var S = f.getPrev(T.id);
            T = f.getItem(S);
          }
          if (T) {
            if (T.id == k.id) return _.order_branch_free && f.isChildOf(k.id, p.id) && f.getChildren(p.id).length == 1 ? void f.move(k.id, f.getBranchIndex(p.id) + 1, f.getParent(p.id)) : void 0;
            p = T;
          } else if (w = f.getIdByIndex(x), T = f.getItem(w), s(w) && (S = f.getPrev(T.id), T = f.getItem(S)), g(T, k) && T.id != k.id) return void f.move(k.id, -1, f.getParent(T.id));
        } else if (_.order_branch_free && p.id != k.id && g(p, k) && !s(p.id)) {
          if (!f.hasChild(p.id)) return p.$open = !0, void f.move(k.id, -1, p.id);
          if (f.getIndexById(p.id) || $ / 3 < b) return;
        }
        x = f.getIndexById(p.id), S = f.getIdByIndex(x - 1);
        for (var C = f.getItem(S), E = 1; (!C || C.id == p.id) && x - E >= 0; ) S = f.getIdByIndex(x - E), C = f.getItem(S), E++;
        if (k.id == p.id || s(p.id)) return;
        g(p, k) && k.id != p.id ? f.move(k.id, 0, 0, p.id) : p.$level != k.$level - 1 || f.getChildren(p.id).length ? C && g(C, k) && k.id != C.id && f.move(k.id, -1, f.getParent(C.id)) : f.move(k.id, 0, p.id);
      }
      return !0;
    }, t)), i.attachEvent("onDragEnd", t.bind(function() {
      var o = r(), l = o.getItem(i.config.id);
      l.$transparent = !1, l.$open = i.config.initial_open_state, this.callEvent("onBeforeRowDragEnd", [i.config.id, i.config.parent, i.config.index]) === !1 ? (o.move(i.config.id, i.config.index, i.config.parent), l.$drop_target = null) : this.callEvent("onRowDragEnd", [i.config.id, l.$drop_target]), t.render(), this.refreshData();
    }, t));
  }
  function a(o) {
    return et(o, n.$config.item_attribute);
  }
  function r() {
    return t.getDatastore(n.$config.bind);
  }
  function s(o) {
    return Ut(o, t, r());
  }
} }, nt = { createDropTargetObject: function(t) {
  var n = { targetParent: null, targetIndex: 0, targetId: null, child: !1, nextSibling: !1, prevSibling: !1 };
  return t && H(n, t, !0), n;
}, nextSiblingTarget: function(t, n, e) {
  var i = this.createDropTargetObject();
  return i.targetId = n, i.nextSibling = !0, i.targetParent = e.getParent(i.targetId), i.targetIndex = e.getBranchIndex(i.targetId), (e.getParent(t) != i.targetParent || i.targetIndex < e.getBranchIndex(t)) && (i.targetIndex += 1), i;
}, prevSiblingTarget: function(t, n, e) {
  var i = this.createDropTargetObject();
  return i.targetId = n, i.prevSibling = !0, i.targetParent = e.getParent(i.targetId), i.targetIndex = e.getBranchIndex(i.targetId), e.getParent(t) == i.targetParent && i.targetIndex > e.getBranchIndex(t) && (i.targetIndex -= 1), i;
}, firstChildTarget: function(t, n, e) {
  var i = this.createDropTargetObject();
  return i.targetId = n, i.targetParent = i.targetId, i.targetIndex = 0, i.child = !0, i;
}, lastChildTarget: function(t, n, e) {
  var i = e.getChildren(n), a = this.createDropTargetObject();
  return a.targetId = i[i.length - 1], a.targetParent = n, a.targetIndex = i.length, a.nextSibling = !0, a;
} };
function ii(t, n, e, i, a) {
  for (var r = n; i.exists(r); ) {
    var s = i.calculateItemLevel(i.getItem(r));
    if ((s === e || s === e - 1) && i.getBranchIndex(r) > -1) break;
    r = a ? i.getPrev(r) : i.getNext(r);
  }
  return i.exists(r) ? i.calculateItemLevel(i.getItem(r)) === e ? a ? nt.nextSiblingTarget(t, r, i) : nt.prevSiblingTarget(t, r, i) : nt.firstChildTarget(t, r, i) : null;
}
function xe(t, n, e, i) {
  return ii(t, n, e, i, !0);
}
function yn(t, n, e, i) {
  return ii(t, n, e, i, !1);
}
function bn(t, n, e, i, a, r) {
  var s;
  if (n !== a.$getRootId()) {
    var o = a.getItem(n), l = a.calculateItemLevel(o);
    if (l === r) {
      var d = a.getPrevSibling(n);
      e < 0.5 && !d ? s = nt.prevSiblingTarget(t, n, a) : (e < 0.5 && (n = d), s = nt.nextSiblingTarget(t, n, a));
    } else if (l > r) a.eachParent(function(f) {
      a.calculateItemLevel(f) === r && (n = f.id);
    }, o), s = xe(t, n, r, a);
    else {
      var u = xe(t, n, r, a), c = yn(t, n, r, a);
      s = e < 0.5 ? u : c;
    }
  } else {
    var h = a.$getRootId(), _ = a.getChildren(h);
    s = nt.createDropTargetObject(), s = _.length && i >= 0 ? xe(t, function(f) {
      for (var v = f.getNext(); f.exists(v); ) {
        var k = f.getNext(v);
        if (!f.exists(k)) return v;
        v = k;
      }
      return null;
    }(a), r, a) : yn(t, h, r, a);
  }
  return s;
}
function $n(t, n) {
  var e = Y(n.$grid_data);
  return t.x += e.x + n.$grid.scrollLeft, t.y += e.y - n.$grid_data.scrollTop, t;
}
function we(t, n, e = 0) {
  const i = Y(t.$root);
  return n > i.width && (n = i.width - e - 2), n;
}
const xn = { removeLineHighlight: function(t) {
  t.markerLine && t.markerLine.parentNode && t.markerLine.parentNode.removeChild(t.markerLine), t.markerLine = null;
}, highlightPosition: function(t, n, e) {
  var i = function(r, s) {
    var o = Y(s.$grid_data), l = dt(r, s.$grid_data), d = o.x + s.$grid.scrollLeft, u = l.y - 10, c = s.getItemHeight(r.targetId);
    u < o.y && (u = o.y);
    var h = s.getTotalHeight();
    return u > o.y + h - c && (u = o.y + h - c), o.x = d, o.y = u, o.width = we(s.$gantt, o.width, 9), o;
  }(t, e);
  n.marker.style.left = i.x + 9 + "px", n.marker.style.width = i.width + "px", n.marker.style.overflow = "hidden";
  var a = n.markerLine;
  a || ((a = document.createElement("div")).className = "gantt_drag_marker gantt_grid_dnd_marker", a.innerHTML = "<div class='gantt_grid_dnd_marker_line'></div>", a.style.pointerEvents = "none"), t.child ? function(r, s, o) {
    var l = r.targetParent, d = $n({ x: 0, y: o.getItemTop(l) }, o), u = o.$grid_data.getBoundingClientRect().bottom + window.scrollY;
    let c = we(o.$gantt, o.$grid_data.offsetWidth);
    s.innerHTML = "<div class='gantt_grid_dnd_marker_folder'></div>", s.style.width = c + "px", s.style.top = d.y + "px", s.style.left = d.x + "px", s.style.height = o.getItemHeight(l) + "px", d.y > u && (s.style.top = u + "px");
  }(t, a, e) : function(r, s, o) {
    var l = function(c, h) {
      var _ = h.$config.rowStore, f = { x: 0, y: 0 }, v = h.$grid_data.querySelector(".gantt_tree_indent"), k = 15, b = 0;
      v && (k = v.offsetWidth);
      var m = 40;
      if (c.targetId !== _.$getRootId()) {
        var g = h.getItemTop(c.targetId), p = h.getItemHeight(c.targetId);
        if (b = _.exists(c.targetId) ? _.calculateItemLevel(_.getItem(c.targetId)) : 0, c.prevSibling) f.y = g;
        else if (c.nextSibling) {
          var y = 0;
          _.eachItem(function($) {
            _.getIndexById($.id) !== -1 && y++;
          }, c.targetId), f.y = g + p + y * p;
        } else f.y = g + p, b += 1;
      }
      return f.x = m + b * k, f.width = we(h.$gantt, Math.max(h.$grid_data.offsetWidth - f.x, 0), f.x), $n(f, h);
    }(r, o), d = o.$grid_data.getBoundingClientRect().bottom + window.scrollY;
    s.innerHTML = "<div class='gantt_grid_dnd_marker_line'></div>", s.style.left = l.x + "px", s.style.height = "4px";
    var u = l.y - 2;
    s.style.top = u + "px", s.style.width = l.width + "px", u > d && (s.style.top = d + "px");
  }(t, a, e), n.markerLine || (document.body.appendChild(a), n.markerLine = a);
} }, Nr = { init: function(t, n) {
  var e = t.$services.getService("dnd");
  if (n.$config.bind && t.getDatastore(n.$config.bind)) {
    var i = new e(n.$grid_data, { updates_per_second: 60 });
    t.defined(n.$getConfig().dnd_sensitivity) && (i.config.sensitivity = n.$getConfig().dnd_sensitivity), i.attachEvent("onBeforeDragStart", t.bind(function(o, l) {
      var d = a(l);
      if (!d || (t.hideQuickInfo && t.hideQuickInfo(), ct(l.target, ".gantt_grid_editor_placeholder"))) return !1;
      var u = d.getAttribute(n.$config.item_attribute), c = n.$config.rowStore.getItem(u);
      return !t.isReadonly(c) && !r(u) && (i.config.initial_open_state = c.$open, !!t.callEvent("onRowDragStart", [u, l.target || l.srcElement, l]) && void 0);
    }, t)), i.attachEvent("onAfterDragStart", t.bind(function(o, l) {
      var d = a(l);
      i.config.marker.innerHTML = d.outerHTML;
      var u = i.config.marker.firstChild;
      u && (i.config.marker.style.opacity = 0.4, u.style.position = "static", u.style.pointerEvents = "none"), i.config.id = d.getAttribute(n.$config.item_attribute);
      var c = n.$config.rowStore, h = c.getItem(i.config.id);
      i.config.level = c.calculateItemLevel(h), i.config.drop_target = nt.createDropTargetObject({ targetParent: c.getParent(h.id), targetIndex: c.getBranchIndex(h.id), targetId: h.id, nextSibling: !0 }), h.$open = !1, h.$transparent = !0, this.refreshData();
    }, t)), i.attachEvent("onDragMove", t.bind(function(o, l) {
      var d = s(l);
      return d && t.callEvent("onBeforeRowDragMove", [i.config.id, d.targetParent, d.targetIndex]) !== !1 || (d = nt.createDropTargetObject(i.config.drop_target)), xn.highlightPosition(d, i.config, n), i.config.drop_target = d, t._waiAria.reorderMarkerAttr(i.config.marker), this.callEvent("onRowDragMove", [i.config.id, d.targetParent, d.targetIndex]), !0;
    }, t)), i.attachEvent("onDragEnd", t.bind(function() {
      var o = n.$config.rowStore, l = o.getItem(i.config.id);
      xn.removeLineHighlight(i.config), l.$transparent = !1, l.$open = i.config.initial_open_state;
      var d = i.config.drop_target;
      this.callEvent("onBeforeRowDragEnd", [i.config.id, d.targetParent, d.targetIndex]) === !1 ? l.$drop_target = null : (o.move(i.config.id, d.targetIndex, d.targetParent), t.render(), this.callEvent("onRowDragEnd", [i.config.id, d.targetParent, d.targetIndex])), o.refresh(l.id);
    }, t));
  }
  function a(o) {
    return et(o, n.$config.item_attribute);
  }
  function r(o) {
    return Ut(o, t, t.getDatastore(n.$config.bind));
  }
  function s(o) {
    var l, d = function(f) {
      var v = dt(f, n.$grid_data).y, k = n.$config.rowStore;
      document.doctype || (v += window.scrollY), v = v || 0;
      var b = n.$state.scrollTop || 0, m = t.$grid_data.getBoundingClientRect().height + b + window.scrollY, g = b, p = n.getItemIndexByTopPosition(n.$state.scrollTop);
      if (k.exists(p) || (p = k.countVisible() - 1), p < 0) return k.$getRootId();
      var y = k.getIdByIndex(p), $ = n.$state.scrollTop / n.getItemHeight(y), x = $ - Math.floor($);
      x > 0.1 && x < 0.9 && (m -= n.getItemHeight(y) * x, g += n.getItemHeight(y) * (1 - x));
      const w = Y(n.$grid_data), T = w.y + w.height, S = i.config.marker.offsetHeight;
      v + S + window.scrollY >= m && (i.config.marker.style.top = T - S + "px"), v >= m ? v = m : v <= g && (v = g, i.config.marker.style.top = w.y + "px");
      var C = n.getItemIndexByTopPosition(v);
      if (C > k.countVisible() - 1 || C < 0) return k.$getRootId();
      var E = k.getIdByIndex(C);
      return r(E) ? k.getPrevSibling(E) : k.getIdByIndex(C);
    }(o), u = null, c = n.$config.rowStore, h = !n.$getConfig().order_branch_free, _ = dt(o, n.$grid_data).y;
    return document.doctype || (_ += window.scrollY), d !== c.$getRootId() && (u = (_ - n.getItemTop(d)) / n.getItemHeight(d)), h ? (l = bn(i.config.id, d, u, _, c, i.config.level)) && l.targetParent && r(l.targetParent) && (d = c.getPrevSibling(l.targetParent), l = bn(i.config.id, d, u, _, c, i.config.level)) : l = function(f, v, k, b, m) {
      var g;
      if (v !== m.$getRootId()) g = k < 0.25 ? nt.prevSiblingTarget(f, v, m) : !(k > 0.6) || m.hasChild(v) && m.getItem(v).$open ? nt.firstChildTarget(f, v, m) : nt.nextSiblingTarget(f, v, m);
      else {
        var p = m.$getRootId();
        g = m.hasChild(p) && b >= 0 ? nt.lastChildTarget(f, p, m) : nt.firstChildTarget(f, p, m);
      }
      return g;
    }(i.config.id, d, u, _, c), l;
  }
} };
var Pr = function(t) {
  return { onCreated: function(n) {
    n.$config = H(n.$config, { bind: "task" }), n.$config.id == "grid" && (this.extendGantt(n), t.ext.inlineEditors = t.ext._inlineEditors.createEditors(n), t.ext.inlineEditors.init()), this._mouseDelegates = qe(t);
  }, onInitialized: function(n) {
    var e = n.$getConfig();
    e.order_branch && (e.order_branch == "marker" ? Nr.init(n.$gantt, n) : Lr.init(n.$gantt, n)), this.initEvents(n, t), n.$config.id == "grid" && this.extendDom(n);
  }, onDestroyed: function(n) {
    n.$config.id == "grid" && t.ext.inlineEditors.detachStore(), this.clearEvents(n, t);
  }, initEvents: function(n, e) {
    this._mouseDelegates.delegate("click", "gantt_row", e.bind(function(i, a, r) {
      const s = n.$getConfig();
      if (a !== null) {
        const o = this.getTask(a);
        if (s.scroll_on_click) {
          const l = !e._is_icon_open_click(i), d = e.$ui.getView("timeline");
          l && d && this.showDate(o.start_date);
        }
        e.callEvent("onTaskRowClick", [a, r]);
      }
    }, e), n.$grid), this._mouseDelegates.delegate("click", "gantt_grid_head_cell", e.bind(function(i, a, r) {
      var s = r.getAttribute("data-column-id");
      if (e.callEvent("onGridHeaderClick", [s, i])) {
        var o = n.$getConfig();
        if (s != "add") {
          if (o.sort && s) {
            for (var l, d = s, u = 0; u < o.columns.length; u++) if (o.columns[u].name == s) {
              l = o.columns[u];
              break;
            }
            if (l && l.sort !== void 0 && l.sort !== !0 && !(d = l.sort)) return;
            var c = this._sort && this._sort.direction && this._sort.name == s ? this._sort.direction : "desc";
            c = c == "desc" ? "asc" : "desc", this._sort = { name: s, direction: c }, this.sort(d, c == "desc");
          }
        } else e.$services.getService("mouseEvents").callHandler("click", "gantt_add", n.$grid, [i, o.root_id]);
      }
    }, e), n.$grid), this._mouseDelegates.delegate("click", "gantt_add", e.bind(function(i, a, r) {
      if (!n.$getConfig().readonly) return this.createTask({}, a || e.config.root_id), !1;
    }, e), n.$grid);
  }, clearEvents: function(n, e) {
    this._mouseDelegates.destructor(), this._mouseDelegates = null;
  }, extendDom: function(n) {
    t.$grid = n.$grid, t.$grid_scale = n.$grid_scale, t.$grid_data = n.$grid_data;
  }, extendGantt: function(n) {
    t.getGridColumns = t.bind(n.getGridColumns, n), n.attachEvent("onColumnResizeStart", function() {
      return t.callEvent("onColumnResizeStart", arguments);
    }), n.attachEvent("onColumnResize", function() {
      return t.callEvent("onColumnResize", arguments);
    }), n.attachEvent("onColumnResizeEnd", function() {
      return t.callEvent("onColumnResizeEnd", arguments);
    }), n.attachEvent("onColumnResizeComplete", function(e, i) {
      t.config.grid_width = i;
    }), n.attachEvent("onBeforeRowResize", function() {
      return t.callEvent("onBeforeRowResize", arguments);
    }), n.attachEvent("onRowResize", function() {
      return t.callEvent("onRowResize", arguments);
    }), n.attachEvent("onBeforeRowResizeEnd", function() {
      return t.callEvent("onBeforeRowResizeEnd", arguments);
    }), n.attachEvent("onAfterRowResize", function() {
      return t.callEvent("onAfterRowResize", arguments);
    });
  } };
};
const Rr = { createTaskDND: function() {
  var t;
  return { extend: function(n) {
    n.roundTaskDates = function(e) {
      t.round_task_dates(e);
    };
  }, init: function(n, e) {
    return t = function(i, a) {
      var r = a.$services;
      return { drag: null, dragMultiple: {}, _events: { before_start: {}, before_finish: {}, after_finish: {} }, _handlers: {}, init: function() {
        this._domEvents = a._createDomEventScope(), this.clear_drag_state();
        var s = a.config.drag_mode;
        this.set_actions(), r.getService("state").registerProvider("tasksDnd", j(function() {
          return { drag_id: this.drag ? this.drag.id : void 0, drag_mode: this.drag ? this.drag.mode : void 0, drag_from_start: this.drag ? this.drag.left : void 0 };
        }, this));
        var o = { before_start: "onBeforeTaskDrag", before_finish: "onBeforeTaskChanged", after_finish: "onAfterTaskDrag" };
        for (var l in this._events) for (var d in s) this._events[l][d] = o[l];
        this._handlers[s.move] = this._move, this._handlers[s.resize] = this._resize, this._handlers[s.progress] = this._resize_progress;
      }, set_actions: function() {
        var s = i.$task_data;
        this._domEvents.attach(s, "mousemove", a.bind(function(o) {
          this.on_mouse_move(o);
        }, this)), this._domEvents.attach(s, "mousedown", a.bind(function(o) {
          this.on_mouse_down(o);
        }, this)), this._domEvents.attach(document.body, "mouseup", a.bind(function(o) {
          this.on_mouse_up(o);
        }, this));
      }, _getPositioningContext: function(s) {
        return i._getPositioningContext ? i._getPositioningContext(s) : null;
      }, clear_drag_state: function() {
        this.drag = { id: null, mode: null, pos: null, start_x: null, start_y: null, obj: null, left: null }, this.dragMultiple = {};
      }, _resize: function(s, o, l) {
        var d = i.$getConfig(), u = this._drag_task_coords(s, l);
        l.left ? (s.start_date = a.dateFromPos(u.start + o, this._getPositioningContext(s)), s.start_date || (s.start_date = new Date(a.getState().min_date))) : (s.end_date = a.dateFromPos(u.end + o, this._getPositioningContext(s)), s.end_date || (s.end_date = new Date(a.getState().max_date)));
        var c = this._calculateMinDuration(d.min_duration, d.duration_unit);
        s.end_date - s.start_date < d.min_duration && (l.left ? s.start_date = a.calculateEndDate(s.end_date, -c, d.duration_unit, s) : s.end_date = a.calculateEndDate(s.start_date, c, d.duration_unit, s)), a._init_task_timing(s);
      }, _calculateMinDuration: function(s, o) {
        return Math.ceil(s / { minute: 6e4, hour: 36e5, day: 864e5, week: 6048e5, month: 24192e5, year: 31356e6 }[o]);
      }, _resize_progress: function(s, o, l) {
        var d = this._drag_task_coords(s, l), u = i.$getConfig().rtl ? d.start - l.pos.x : l.pos.x - d.start, c = Math.max(0, u);
        s.progress = Math.min(1, c / Math.abs(d.end - d.start));
      }, _find_max_shift: function(s, o) {
        var l;
        for (var d in s) {
          var u = s[d], c = a.getTask(u.id);
          if (!c.unscheduled) {
            var h = this._drag_task_coords(c, u), _ = a.posFromDate(new Date(a.getState().min_date), this._getPositioningContext(c)), f = a.posFromDate(new Date(a.getState().max_date), this._getPositioningContext(c));
            if (h.end + o > f) {
              var v = f - h.end;
              (v < l || l === void 0) && (l = v);
            } else if (h.start + o < _) {
              var k = _ - h.start;
              (k > l || l === void 0) && (l = k);
            }
          }
        }
        return l;
      }, _move: function(s, o, l, d) {
        var u = this._drag_task_coords(s, l), c = null, h = null;
        d ? (c = new Date(+l.obj.start_date + d), h = new Date(+l.obj.end_date + d)) : (c = a.dateFromPos(u.start + o, this._getPositioningContext(s)), h = a.dateFromPos(u.end + o, this._getPositioningContext(s))), c ? h ? (s.start_date = c, s.end_date = h) : (s.end_date = new Date(a.getState().max_date), s.start_date = a.dateFromPos(a.posFromDate(s.end_date) - (u.end - u.start), this._getPositioningContext(s))) : (s.start_date = new Date(a.getState().min_date), s.end_date = a.dateFromPos(a.posFromDate(s.start_date) + (u.end - u.start), this._getPositioningContext(s)));
      }, _drag_task_coords: function(s, o) {
        return { start: o.obj_s_x = o.obj_s_x || a.posFromDate(s.start_date, this._getPositioningContext(s)), end: o.obj_e_x = o.obj_e_x || a.posFromDate(s.end_date, this._getPositioningContext(s)) };
      }, _mouse_position_change: function(s, o) {
        var l = s.x - o.x, d = s.y - o.y;
        return Math.sqrt(l * l + d * d);
      }, _is_number: function(s) {
        return !isNaN(parseFloat(s)) && isFinite(s);
      }, on_mouse_move: function(s) {
        if (this.drag.start_drag) {
          var o = dt(s, a.$task_data), l = this.drag.start_drag.start_x, d = this.drag.start_drag.start_y;
          (Date.now() - this.drag.timestamp > 50 || this._is_number(l) && this._is_number(d) && this._mouse_position_change({ x: l, y: d }, o) > 20) && this._start_dnd(s);
        }
        if (this.drag.mode) {
          if (!Fn(this, 40)) return;
          this._update_on_move(s);
        }
      }, _update_item_on_move: function(s, o, l, d, u, c) {
        var h = a.getTask(o), _ = a.mixin({}, h), f = a.mixin({}, h);
        this._handlers[l].apply(this, [f, s, d, c]), a.mixin(h, f, !0), a.callEvent("onTaskDrag", [h.id, l, f, _, u]), a.mixin(h, f, !0), a.refreshTask(o);
      }, _update_on_move: function(s) {
        var o = this.drag, l = i.$getConfig();
        if (o.mode) {
          var d = dt(s, i.$task_data);
          if (o.pos && o.pos.x == d.x) return;
          o.pos = d;
          const m = a.getTask(o.id);
          var u = a.dateFromPos(d.x, this._getPositioningContext(m));
          if (!u || isNaN(u.getTime())) return;
          var c = d.x - o.start_x;
          if (this._handlers[o.mode]) {
            if (o.mode === l.drag_mode.move) {
              var h = {};
              this._isMultiselect() && a.getSelectedTasks().indexOf(o.id) >= 0 && (h = this.dragMultiple);
              var _ = !1;
              if (a.isSummaryTask(m) && a.config.drag_project) {
                var f = {};
                f[o.id] = J(o), _ = !0, h = H(f, this.dragMultiple);
              }
              var v = this._find_max_shift(h, c);
              let g;
              if (v !== void 0 && (c = v), this._update_item_on_move(c, o.id, o.mode, o, s), v === void 0) {
                const p = a.posFromDate(o.obj.start_date, this._getPositioningContext(o.obj)), y = a.posFromDate(o.obj.end_date, this._getPositioningContext(o.obj));
                if (o.handle_offset === void 0) {
                  const x = y - p, w = o.start_x - p;
                  o.handle_offset = w / x;
                }
                let $ = p + Math.abs(y - p) * o.handle_offset;
                g = u - a.dateFromPos($, this._getPositioningContext(o.obj));
              }
              for (var k in h) {
                var b = h[k];
                _ && b.id != o.id && (a._bulk_dnd = !0), this._update_item_on_move(c, b.id, b.mode, b, s, g);
              }
              a._bulk_dnd = !1;
            } else this._update_item_on_move(c, o.id, o.mode, o, s);
            a._update_parents(o.id);
          }
        }
      }, on_mouse_down: function(s, o) {
        if (s.button != 2 || s.button === void 0) {
          var l = i.$getConfig(), d = a.locate(s), u = null;
          if (a.isTaskExists(d) && (u = a.getTask(d)), !a.isReadonly(u) && !this.drag.mode) {
            this.clear_drag_state();
            var c = it(o = o || s.target || s.srcElement), h = this._get_drag_mode(c, o);
            if (!c || !h) return o.parentNode ? this.on_mouse_down(s, o.parentNode) : void 0;
            if (h) if (h.mode && h.mode != l.drag_mode.ignore && l["drag_" + h.mode]) {
              if (d = a.locate(o), u = a.copy(a.getTask(d) || {}), a.isReadonly(u)) return this.clear_drag_state(), !1;
              if (a.isSummaryTask(u) && u.auto_scheduling !== !1 && !l.drag_project && h.mode != l.drag_mode.progress) return void this.clear_drag_state();
              h.id = d;
              var _ = dt(s, a.$task_data);
              h.start_x = _.x, h.start_y = _.y, h.obj = u, this.drag.start_drag = h, this.drag.timestamp = Date.now();
            } else this.clear_drag_state();
            else if (a.checkEvent("onMouseDown") && a.callEvent("onMouseDown", [c.split(" ")[0]]) && o.parentNode) return this.on_mouse_down(s, o.parentNode);
          }
        }
      }, _fix_dnd_scale_time: function(s, o) {
        var l = i.$getConfig(), d = a.getScale().unit, u = a.getScale().step;
        function c(_) {
          if (a.config.correct_work_time) {
            var f = i.$getConfig();
            a.isWorkTime(_.start_date, void 0, _) || (_.start_date = a.calculateEndDate({ start_date: _.start_date, duration: -1, unit: f.duration_unit, task: _ }));
          }
        }
        l.round_dnd_dates || (d = "minute", u = l.time_step);
        const h = i._getPositioningContext(s);
        o.mode == l.drag_mode.resize ? o.left ? (s.start_date = a.roundDate({ date: s.start_date, unit: d, step: u }), h && h.calendar && (s.start_date = h.calendar.getClosestWorkTime({ date: s.start_date, dir: "future" })), c(s)) : (s.end_date = a.roundDate({ date: s.end_date, unit: d, step: u }), h && h.calendar && (s.end_date = h.calendar.getClosestWorkTime({ date: s.end_date })), function(_) {
          if (a.config.correct_work_time) {
            var f = i.$getConfig();
            a.isWorkTime(new Date(_.end_date - 1), void 0, _) || (_.end_date = a.calculateEndDate({ start_date: _.end_date, duration: 1, unit: f.duration_unit, task: _ }));
          }
        }(s)) : o.mode == l.drag_mode.move && (s.start_date = a.roundDate({ date: s.start_date, unit: d, step: u }), h && h.calendar && (s.start_date = h.calendar.getClosestWorkTime({ date: s.start_date, dir: "future" })), c(s), s.end_date = a.calculateEndDate(s));
      }, _fix_working_times: function(s, o) {
        var l = i.$getConfig();
        (o = o || { mode: l.drag_mode.move }).mode == l.drag_mode.resize ? o.left ? s.start_date = a.getClosestWorkTime({ date: s.start_date, dir: "future", task: s }) : s.end_date = a.getClosestWorkTime({ date: s.end_date, dir: "past", task: s }) : o.mode == l.drag_mode.move && a.correctTaskWorkTime(s);
      }, _finalize_mouse_up: function(s, o, l, d) {
        var u = a.getTask(s);
        if (o.work_time && o.correct_work_time && this._fix_working_times(u, l), this._fix_dnd_scale_time(u, l), this._fireEvent("before_finish", l.mode, [s, l.mode, a.copy(l.obj), d])) {
          var c = s;
          a._init_task_timing(u), this.clear_drag_state(), a.updateTask(u.id), this._fireEvent("after_finish", l.mode, [c, l.mode, d]);
        } else if (this.clear_drag_state(), s == l.id && (l.obj._dhx_changed = !1, a.mixin(u, l.obj, !0)), a.refreshTask(u.id), u.$level > 100) {
          let h = !1;
          a.eachParent(function(_) {
            if (!h && _.type === a.config.types.project) {
              const f = { start_date: _.start_date, end_date: _.end_date };
              a.resetProjectDates(_), +f.start_date == +_.start_date && +f.end_date == +_.end_date || (h = !0);
            }
          }, u.id), h && a.refreshData();
        } else a.eachParent(function(h) {
          if (h.type === a.config.types.project) {
            const _ = { start_date: h.start_date, end_date: h.end_date };
            a.resetProjectDates(h), +_.start_date == +h.start_date && +_.end_date == +h.end_date || a.refreshTask(h.id);
          }
        }, u.id);
      }, on_mouse_up: function(s) {
        var o = this.drag;
        if (o.mode && o.id) {
          var l = i.$getConfig(), d = a.getTask(o.id), u = this.dragMultiple, c = !1, h = 0;
          o.mode === l.drag_mode.move && (a.isSummaryTask(d) && l.drag_project || this._isMultiselect()) && (c = !0, h = Object.keys(u).length);
          var _ = function() {
            if (c) for (var f in u) u[f].id != o.id && this._finalize_mouse_up(u[f].id, l, u[f], s);
            this._finalize_mouse_up(o.id, l, o, s);
          };
          c && h > 10 ? a.batchUpdate((function() {
            _.call(this);
          }).bind(this)) : _.call(this);
        }
        this.clear_drag_state();
      }, _get_drag_mode: function(s, o) {
        var l = i.$getConfig().drag_mode, d = { mode: null, left: null };
        switch ((s || "").split(" ")[0]) {
          case "gantt_task_line":
          case "gantt_task_content":
            d.mode = l.move;
            break;
          case "gantt_task_drag":
            d.mode = l.resize;
            var u = o.getAttribute("data-bind-property");
            d.left = u == "start_date";
            break;
          case "gantt_task_progress_drag":
            d.mode = l.progress;
            break;
          case "gantt_link_control":
          case "gantt_link_point":
            d.mode = l.ignore;
            break;
          default:
            d = null;
        }
        return d;
      }, _start_dnd: function(s) {
        var o = this.drag = this.drag.start_drag;
        delete o.start_drag;
        var l = i.$getConfig(), d = o.id;
        if (l["drag_" + o.mode] && a.callEvent("onBeforeDrag", [d, o.mode, s]) && this._fireEvent("before_start", o.mode, [d, o.mode, s])) {
          delete o.start_drag;
          var u = a.getTask(d);
          if (a.isReadonly(u)) return void this.clear_drag_state();
          if (this._isMultiselect()) {
            var c = a.getSelectedTasks();
            c.indexOf(o.id) >= 0 && ht(c, a.bind(function(h) {
              var _ = a.getTask(h);
              a.isSummaryTask(_) && a.config.drag_project && o.mode == l.drag_mode.move && this._addSubtasksToDragMultiple(_.id), this.dragMultiple[h] = a.mixin({ id: _.id, obj: a.copy(_) }, this.drag);
            }, this));
          }
          a.isSummaryTask(u) && a.config.drag_project && o.mode == l.drag_mode.move && this._addSubtasksToDragMultiple(u.id), a.callEvent("onTaskDragStart", []);
        } else this.clear_drag_state();
      }, _fireEvent: function(s, o, l) {
        a.assert(this._events[s], "Invalid stage:{" + s + "}");
        var d = this._events[s][o];
        return a.assert(d, "Unknown after drop mode:{" + o + "}"), a.assert(l, "Invalid event arguments"), !a.checkEvent(d) || a.callEvent(d, l);
      }, round_task_dates: function(s) {
        var o = this.drag, l = i.$getConfig();
        o || (o = { mode: l.drag_mode.move }), this._fix_dnd_scale_time(s, o);
      }, destructor: function() {
        this._domEvents.detachAll();
      }, _isMultiselect: function() {
        return a.config.drag_multiple && !!(a.getSelectedTasks && a.getSelectedTasks().length > 0);
      }, _addSubtasksToDragMultiple: function(s) {
        a.eachTask(function(o) {
          this.dragMultiple[o.id] = a.mixin({ id: o.id, obj: a.copy(o) }, this.drag);
        }, s, this);
      } };
    }(n, e), n._tasks_dnd = t, t.init(e);
  }, destructor: function() {
    t && (t.destructor(), t = null);
  } };
} };
var Hr = function(t, n) {
  var e, i, a, r, s;
  function o() {
    return { link_source_id: r, link_target_id: i, link_from_start: s, link_to_start: a, link_landing_area: e };
  }
  var l = n.$services, d = l.getService("state"), u = l.getService("dnd");
  d.registerProvider("linksDnD", o);
  var c = "gantt_link_point", h = "gantt_link_control", _ = new u(t.$task_bars, { sensitivity: 0, updates_per_second: 60, mousemoveContainer: n.$root, selector: "." + c, preventDefault: !0 });
  function f(g, p) {
    var y, $ = _.getPosition(g), x = function(I) {
      var M = 0, A = 0;
      return I && (M = I.offsetWidth || 0, A = I.offsetHeight || 0), { width: M, height: A };
    }(p), w = { right: (y = n.$root).offsetWidth, bottom: y.offsetHeight }, T = n.config.tooltip_offset_x || 10, S = n.config.tooltip_offset_y || 10, C = n.config.scroll_size || 18, E = n.$container.getBoundingClientRect().y + window.scrollY, D = { y: $.y + S, x: $.x + T, bottom: $.y + x.height + S + C, right: $.x + x.width + T + C };
    return D.bottom > w.bottom + E && (D.y = w.bottom + E - x.height - S), D.right > w.right && (D.x = w.right - x.width - T), D;
  }
  function v(g) {
    var p = o();
    p.link_source_id && p.link_target_id && n.isLinkAllowed(p.link_source_id, p.link_target_id, p.link_from_start, p.link_to_start);
    var y = "<div class='" + n.templates.drag_link_class(p.link_source_id, p.link_from_start, p.link_target_id, p.link_to_start) + "'>" + n.templates.drag_link(p.link_source_id, p.link_from_start, p.link_target_id, p.link_to_start) + "</div>";
    g.innerHTML = y;
  }
  function k() {
    r = s = i = null, a = !0;
  }
  function b(g, p, y, $) {
    var x = function() {
      return _._direction && _._direction.parentNode || (_._direction = document.createElement("div"), t.$task_links.appendChild(_._direction)), _._direction;
    }(), w = o(), T = ["gantt_link_direction"];
    n.templates.link_direction_class && T.push(n.templates.link_direction_class(w.link_source_id, w.link_from_start, w.link_target_id, w.link_to_start));
    var S = Math.sqrt(Math.pow(y - g, 2) + Math.pow($ - p, 2));
    if (S = Math.max(0, S - 3)) {
      x.className = T.join(" ");
      var C = ($ - p) / (y - g), E = Math.atan(C);
      m(g, y, p, $) == 2 ? E += Math.PI : m(g, y, p, $) == 3 && (E -= Math.PI);
      var D = Math.sin(E), I = Math.cos(E), M = Math.round(p), A = Math.round(g), L = ["-webkit-transform: rotate(" + E + "rad)", "-moz-transform: rotate(" + E + "rad)", "-ms-transform: rotate(" + E + "rad)", "-o-transform: rotate(" + E + "rad)", "transform: rotate(" + E + "rad)", "width:" + Math.round(S) + "px"];
      if (window.navigator.userAgent.indexOf("MSIE 8.0") != -1) {
        L.push('-ms-filter: "' + function(R, O) {
          return "progid:DXImageTransform.Microsoft.Matrix(M11 = " + O + ",M12 = -" + R + ",M21 = " + R + ",M22 = " + O + ",SizingMethod = 'auto expand')";
        }(D, I) + '"');
        var N = Math.abs(Math.round(g - y)), P = Math.abs(Math.round($ - p));
        switch (m(g, y, p, $)) {
          case 1:
            M -= P;
            break;
          case 2:
            A -= N, M -= P;
            break;
          case 3:
            A -= N;
        }
      }
      L.push("top:" + M + "px"), L.push("left:" + A + "px"), x.style.cssText = L.join(";");
    }
  }
  function m(g, p, y, $) {
    return p >= g ? $ <= y ? 1 : 4 : $ <= y ? 2 : 3;
  }
  _.attachEvent("onBeforeDragStart", n.bind(function(g, p) {
    var y = p.target || p.srcElement;
    if (k(), n.getState("tasksDnd").drag_id) return !1;
    if (kt(y, c)) {
      kt(y, "task_start_date") && (s = !0);
      var $ = n.locate(p);
      r = $;
      var x = n.getTask($);
      return n.isReadonly(x) ? (k(), !1) : (this._dir_start = { x: _.config.original_element_sizes.x + _.config.original_element_sizes.width / 2, y: _.config.original_element_sizes.y + _.config.original_element_sizes.height / 2 }, !0);
    }
    return !1;
  }, this)), _.attachEvent("onAfterDragStart", n.bind(function(g, p) {
    n.config.touch && n.refreshData(), v(_.config.marker);
  }, this)), _.attachEvent("onDragMove", n.bind(function(g, p, y) {
    var $ = _.config, x = f(p, $.marker);
    (function(M, A) {
      M.style.left = A.x + "px", M.style.top = A.y + "px";
    })($.marker, x);
    var w = !!kt(p, h), T = i, S = e, C = a;
    let E, D = !0;
    if (E = p.target.shadowRoot && y ? y : n.locate(p), Z(Dt(p), n.$root) || (w = !1, E = null), w && (D = !kt(p, "task_end_date"), w = !!E), i = E, e = w, a = D, w) {
      const M = kt(p, h).querySelector(`.${c}`);
      if (M) {
        const A = Mn(M, t.$task_bg);
        this._dir_end = { x: A.x + M.offsetWidth / 2, y: A.y + M.offsetHeight / 2 };
      }
    } else this._dir_end = dt(p, t.$task_data), n.env.isEdge && (this._dir_end.y += window.scrollY);
    var I = !(S == w && T == E && C == D);
    return I && (T && n.refreshTask(T, !1), E && n.refreshTask(E, !1)), I && v($.marker), b(this._dir_start.x, this._dir_start.y, this._dir_end.x, this._dir_end.y), !0;
  }, this)), _.attachEvent("onDragEnd", n.bind(function() {
    var g = o();
    if (g.link_source_id && g.link_target_id && g.link_source_id != g.link_target_id) {
      var p = n._get_link_type(g.link_from_start, g.link_to_start), y = { source: g.link_source_id, target: g.link_target_id, type: p };
      y.type && n.isLinkAllowed(y) && n.callEvent("onLinkCreated", [y]) && n.addLink(y);
    }
    k(), n.config.touch ? n.refreshData() : (g.link_source_id && n.refreshTask(g.link_source_id, !1), g.link_target_id && n.refreshTask(g.link_target_id, !1)), _._direction && (_._direction.parentNode && _._direction.parentNode.removeChild(_._direction), _._direction = null);
  }, this)), n.attachEvent("onGanttRender", n.bind(function() {
    _._direction && b(this._dir_start.x, this._dir_start.y, this._dir_end.x, this._dir_end.y);
  }, this));
};
const Or = function() {
  return { init: Hr };
};
var Br = function(t) {
  var n = t.$services;
  return { onCreated: function(e) {
    var i = e.$config;
    i.bind = U(i.bind) ? i.bind : "task", i.bindLinks = U(i.bindLinks) ? i.bindLinks : "link", e._linksDnD = Or(), e._tasksDnD = Rr.createTaskDND(), e._tasksDnD.extend(e), this._mouseDelegates = qe(t);
  }, onInitialized: function(e) {
    this._attachDomEvents(t), this._attachStateProvider(t, e), e._tasksDnD.init(e, t), e._linksDnD.init(e, t), e.$config.id == "timeline" && this.extendDom(e);
  }, onDestroyed: function(e) {
    this._clearDomEvents(t), this._clearStateProvider(t), e._tasksDnD && e._tasksDnD.destructor();
  }, extendDom: function(e) {
    t.$task = e.$task, t.$task_scale = e.$task_scale, t.$task_data = e.$task_data, t.$task_bg = e.$task_bg, t.$task_links = e.$task_links, t.$task_bars = e.$task_bars;
  }, _clearDomEvents: function() {
    this._mouseDelegates.destructor(), this._mouseDelegates = null;
  }, _attachDomEvents: function(e) {
    function i(a, r) {
      if (a && this.callEvent("onLinkDblClick", [a, r])) {
        var s = this.getLink(a);
        if (this.isReadonly(s)) return;
        var o = this.locale.labels.link + " " + this.templates.link_description(this.getLink(a)) + " " + this.locale.labels.confirm_link_deleting;
        window.setTimeout(function() {
          e._delete_link_confirm({ link: s, message: o, title: "", callback: function() {
            e.deleteLink(a);
          } });
        }, this.config.touch ? 300 : 1);
      }
    }
    this._mouseDelegates.delegate("click", "gantt_task_link", e.bind(function(a, r) {
      var s = this.locate(a, this.config.link_attribute);
      s && this.callEvent("onLinkClick", [s, a]);
    }, e), this.$task), this._mouseDelegates.delegate("click", "gantt_scale_cell", e.bind(function(a, r) {
      var s = dt(a, e.$task_data), o = e.dateFromPos(s.x), l = Math.floor(e.columnIndexByDate(o)), d = e.getScale().trace_x[l];
      e.callEvent("onScaleClick", [a, d]);
    }, e), this.$task), this._mouseDelegates.delegate("doubleclick", "gantt_task_link", e.bind(function(a, r, s) {
      r = this.locate(a, e.config.link_attribute), i.call(this, r, a);
    }, e), this.$task), this._mouseDelegates.delegate("doubleclick", "gantt_link_point", e.bind(function(a, r, s) {
      r = this.locate(a);
      var o = this.getTask(r), l = null;
      return s.parentNode && it(s.parentNode) && (l = it(s.parentNode).indexOf("_left") > -1 ? o.$target[0] : o.$source[0]), l && i.call(this, l, a), !1;
    }, e), this.$task);
  }, _attachStateProvider: function(e, i) {
    var a = i;
    n.getService("state").registerProvider("tasksTimeline", function() {
      return { scale_unit: a._tasks ? a._tasks.unit : void 0, scale_step: a._tasks ? a._tasks.step : void 0 };
    });
  }, _clearStateProvider: function() {
    n.getService("state").unregisterProvider("tasksTimeline");
  } };
}, zr = function(t) {
  return { getVerticalScrollbar: function() {
    return t.$ui.getView("scrollVer");
  }, getHorizontalScrollbar: function() {
    return t.$ui.getView("scrollHor");
  }, _legacyGridResizerClass: function(n) {
    for (var e = n.getCellsByType("resizer"), i = 0; i < e.length; i++) {
      var a = e[i], r = !1, s = a.$parent.getPrevSibling(a.$id);
      if (s && s.$config && s.$config.id === "grid") r = !0;
      else {
        var o = a.$parent.getNextSibling(a.$id);
        o && o.$config && o.$config.id === "grid" && (r = !0);
      }
      r && (a.$config.css = (a.$config.css ? a.$config.css + " " : "") + "gantt_grid_resize_wrap");
    }
  }, onCreated: function(n) {
    var e = !0;
    this._legacyGridResizerClass(n), n.attachEvent("onBeforeResize", function() {
      var i = t.$ui.getView("timeline");
      i && (i.$config.hidden = i.$parent.$config.hidden = !t.config.show_chart);
      var a = t.$ui.getView("grid");
      if (a) {
        var r = a._getColsTotalWidth(), s = !t.config.show_grid || !t.config.grid_width || r === 0;
        if (e && !s && r !== !1 && (t.config.grid_width = r), a.$config.hidden = a.$parent.$config.hidden = s, !a.$config.hidden) {
          var o = a._getGridWidthLimits();
          if (o[0] && t.config.grid_width < o[0] && (t.config.grid_width = o[0]), o[1] && t.config.grid_width > o[1] && (t.config.grid_width = o[1]), i && t.config.show_chart) {
            if (a.$config.width = t.config.grid_width - 1, !a.$config.scrollable && a.$config.scrollY && t.$root.offsetWidth) {
              var l = a.$gantt.$layout.$container.offsetWidth, d = t.$ui.getView(a.$config.scrollY).$config.width, u = l - (a.$config.width + d) - 4;
              u < 0 && (a.$config.width += u, t.config.grid_width += u);
            }
            if (e) a.$parent.$config.width = t.config.grid_width, a.$parent.$config.group && t.$layout._syncCellSizes(a.$parent.$config.group, { value: a.$parent.$config.width, isGravity: !1 });
            else if (i && !Z(i.$task, n.$view)) {
              if (!a.$config.original_grid_width) {
                var c = t.skins[t.skin];
                c && c.config && c.config.grid_width ? a.$config.original_grid_width = c.config.grid_width : a.$config.original_grid_width = 0;
              }
              t.config.grid_width = a.$config.original_grid_width, a.$parent.$config.width = t.config.grid_width;
            } else a.$parent._setContentSize(a.$config.width, null), t.$layout._syncCellSizes(a.$parent.$config.group, { value: t.config.grid_width, isGravity: !1 });
          } else i && Z(i.$task, n.$view) && (a.$config.original_grid_width = t.config.grid_width), e || (a.$parent.$config.width = 0);
        }
        e = !1;
      }
    }), this._initScrollStateEvents(n);
  }, _initScrollStateEvents: function(n) {
    t._getVerticalScrollbar = this.getVerticalScrollbar, t._getHorizontalScrollbar = this.getHorizontalScrollbar;
    var e = this.getVerticalScrollbar(), i = this.getHorizontalScrollbar();
    e && e.attachEvent("onScroll", function(a, r, s) {
      var o = t.getScrollState();
      t.callEvent("onGanttScroll", [o.x, a, o.x, r]);
    }), i && i.attachEvent("onScroll", function(a, r, s) {
      var o = t.getScrollState();
      t.callEvent("onGanttScroll", [a, o.y, r, o.y]);
      var l = t.$ui.getView("grid");
      l && l.$grid_data && !l.$config.scrollable && (l.$grid_data.style.left = l.$grid.scrollLeft + "px", l.$grid_data.scrollLeft = l.$grid.scrollLeft);
    }), n.attachEvent("onResize", function() {
      e && !t.$scroll_ver && (t.$scroll_ver = e.$scroll_ver), i && !t.$scroll_hor && (t.$scroll_hor = i.$scroll_hor);
    });
  }, _findGridResizer: function(n, e) {
    for (var i, a = n.getCellsByType("resizer"), r = !0, s = 0; s < a.length; s++) {
      var o = a[s];
      o._getSiblings();
      var l = o._behind, d = o._front;
      if (l && l.$content === e || l.isChild && l.isChild(e)) {
        i = o, r = !0;
        break;
      }
      if (d && d.$content === e || d.isChild && d.isChild(e)) {
        i = o, r = !1;
        break;
      }
    }
    return { resizer: i, gridFirst: r };
  }, onInitialized: function(n) {
    var e = t.$ui.getView("grid"), i = this._findGridResizer(n, e);
    if (i.resizer) {
      var a, r = i.gridFirst, s = i.resizer;
      if (s.$config.mode !== "x") return;
      s.attachEvent("onResizeStart", function(o, l) {
        var d = t.$ui.getView("grid"), u = d ? d.$parent : null;
        if (u) {
          var c = d._getGridWidthLimits();
          d.$config.scrollable || (u.$config.minWidth = c[0]), u.$config.maxWidth = c[1];
        }
        return a = r ? o : l, t.callEvent("onGridResizeStart", [a]);
      }), s.attachEvent("onResize", function(o, l) {
        var d = r ? o : l;
        return t.callEvent("onGridResize", [a, d]);
      }), s.attachEvent("onResizeEnd", function(o, l, d, u) {
        var c = r ? o : l, h = r ? d : u, _ = t.$ui.getView("grid"), f = _ ? _.$parent : null;
        f && (f.$config.minWidth = void 0);
        var v = t.callEvent("onGridResizeEnd", [c, h]);
        return v && h !== 0 && (t.config.grid_width = h), v;
      });
    }
  }, onDestroyed: function(n) {
  } };
};
const jr = { init: function(t) {
  function n(r, s) {
    var o = s(t);
    o.onCreated && o.onCreated(r), r.attachEvent("onReady", function() {
      o.onInitialized && o.onInitialized(r);
    }), r.attachEvent("onDestroy", function() {
      o.onDestroyed && o.onDestroyed(r);
    });
  }
  var e = Ja(t);
  e.registerView("cell", wt), e.registerView("resizer", nr), e.registerView("scrollbar", ir), e.registerView("layout", Qn, function(r) {
    (r.$config ? r.$config.id : null) === "main" && n(r, zr);
  }), e.registerView("viewcell", er), e.registerView("multiview", tr), e.registerView("timeline", Ye, function(r) {
    (r.$config ? r.$config.id : null) !== "timeline" && r.$config.bind != "task" || n(r, Br);
  }), e.registerView("grid", Gt, function(r) {
    (r.$config ? r.$config.id : null) !== "grid" && r.$config.bind != "task" || n(r, Pr);
  }), e.registerView("resourceGrid", sr), e.registerView("GridRL", or), e.registerView("resourceTimeline", ti), e.registerView("resourceHistogram", lr);
  var i = function(r) {
    var s = Za(r);
    return { getDataRender: function(o) {
      return r.$services.getService("layer:" + o) || null;
    }, createDataRender: function(o) {
      var l = o.name, d = o.defaultContainer, u = o.defaultContainerSibling, c = s.createGroup(d, u, function(h, _) {
        if (!c.filters) return !0;
        for (var f = 0; f < c.filters.length; f++) if (c.filters[f](h, _) === !1) return !1;
      }, Qa);
      return r.$services.setService("layer:" + l, function() {
        return c;
      }), r.attachEvent("onGanttReady", function() {
        c.addLayer();
      }), c;
    }, init: function() {
      var o = this.createDataRender({ name: "task", defaultContainer: function() {
        return r.$task_data ? r.$task_data : r.$ui.getView("timeline") ? r.$ui.getView("timeline").$task_data : void 0;
      }, defaultContainerSibling: function() {
        return r.$task_links ? r.$task_links : r.$ui.getView("timeline") ? r.$ui.getView("timeline").$task_links : void 0;
      }, filter: function(d) {
      } }, r), l = this.createDataRender({ name: "link", defaultContainer: function() {
        return r.$task_data ? r.$task_data : r.$ui.getView("timeline") ? r.$ui.getView("timeline").$task_data : void 0;
      } }, r);
      return { addTaskLayer: function(d) {
        const u = Q;
        return typeof d == "function" ? d = { renderer: { render: d, getVisibleRange: u } } : d.renderer && !d.renderer.getVisibleRange && (d.renderer.getVisibleRange = u), d.view = "timeline", o.addLayer(d);
      }, _getTaskLayers: function() {
        return o.getLayers();
      }, removeTaskLayer: function(d) {
        o.removeLayer(d);
      }, _clearTaskLayers: function() {
        o.clear();
      }, addLinkLayer: function(d) {
        const u = Xn();
        return typeof d == "function" ? d = { renderer: { render: d, getVisibleRange: u } } : d.renderer && !d.renderer.getVisibleRange && (d.renderer.getVisibleRange = u), d.view = "timeline", d && d.renderer && (d.renderer.getRectangle || d.renderer.isInViewPort || (d.renderer.isInViewPort = Zn)), l.addLayer(d);
      }, _getLinkLayers: function() {
        return l.getLayers();
      }, removeLinkLayer: function(d) {
        l.removeLayer(d);
      }, _clearLinkLayers: function() {
        l.clear();
      } };
    } };
  }(t), a = kr(t);
  return t.ext.inlineEditors = a, t.ext._inlineEditors = a, a.init(t), { factory: e, mouseEvents: Xa.init(t), layersApi: i.init(), render: { gridLine: function() {
    return /* @__PURE__ */ function(r) {
      return { render: function(s, o, l, d) {
        for (var u = o.getGridColumns(), c = o.$getTemplates(), h = o.$config.rowStore, _ = [], f = 0; f < u.length; f++) {
          var v, k, b, m = f == u.length - 1, g = u[f];
          g.name == "add" ? (k = "<div " + (T = r._waiAria.gridAddButtonAttrString(g)) + " class='gantt_add'></div>", b = "") : (at(k = g.template ? g.template(s) : s[g.name]) && (k = c.date_grid(k, s, g.name)), k == null && (k = ""), b = k, k = "<div class='gantt_tree_content'>" + k + "</div>");
          var p = "gantt_cell" + (m ? " gantt_last_cell" : ""), y = [];
          if (g.tree) {
            p += " gantt_cell_tree";
            for (var $ = 0; $ < s.$level; $++) y.push(c.grid_indent(s));
            !h.hasChild(s.id) || r.isSplitTask(s) && !r.config.open_split_tasks ? (y.push(c.grid_blank(s)), y.push(c.grid_file(s))) : (y.push(c.grid_open(s)), y.push(c.grid_folder(s)));
          }
          var x = "width:" + (g.width - (m ? 1 : 0)) + "px;";
          if (this.defined(g.align)) {
            var w = { right: "flex-end", left: "flex-start", center: "center" }[g.align];
            x += "text-align:" + g.align + ";justify-content:" + w + ";";
          }
          var T = r._waiAria.gridCellAttrString(g, b, s);
          y.push(k), v = "<div class='" + p + "' data-column-index='" + f + "' data-column-name='" + g.name + "' style='" + x + "' " + T + ">" + y.join("") + "</div>", _.push(v);
        }
        switch (p = "", h.$config.name) {
          case "task":
            p = r.getGlobalTaskIndex(s.id) % 2 == 0 ? "" : " odd";
            break;
          case "resource":
            p = h.visibleOrder.indexOf(s.id) % 2 == 0 ? "" : " odd";
        }
        if (p += s.$transparent ? " gantt_transparent" : "", p += s.$dataprocessor_class ? " " + s.$dataprocessor_class : "", c.grid_row_class) {
          var S = c.grid_row_class.call(r, s.start_date, s.end_date, s);
          S && (p += " " + S);
        }
        h.isSelected(s.id) && (p += " gantt_selected");
        var C = document.createElement("div");
        C.className = "gantt_row" + p + " gantt_row_" + r.getTaskType(s.type);
        var E = o.getItemHeight(s.id);
        return C.style.height = E + "px", C.style.lineHeight = E + "px", l.smart_rendering && (C.style.position = "absolute", C.style.left = "0px", C.style.top = o.getItemTop(s.id) + "px"), o.$config.item_attribute && (C.setAttribute(o.$config.item_attribute, s.id), C.setAttribute(o.$config.bind + "_id", s.id)), r._waiAria.taskRowAttr(s, C), C.innerHTML = _.join(""), C;
      }, update: null, getRectangle: ie, isInViewPort: Sr, getVisibleRange: Q, onrender: function(s, o, l) {
        for (var d = l.getGridColumns(), u = 0; u < d.length; u++) {
          var c = d[u];
          if (c.onrender) {
            var h = o.querySelector(`[data-column-name="${c.name}"]`);
            if (h) {
              var _ = c.onrender(s, h);
              if (_ && typeof _ == "string") h.innerHTML = _;
              else if (_ && typeof _ == "object" && r.config.external_render) {
                var f = r.config.external_render;
                f.isElement(_) && f.renderElement(_, h);
              }
            }
          }
        }
      } };
    }(t);
  }, taskBg: function() {
    return /* @__PURE__ */ function(r) {
      var s = {}, o = {};
      function l(f) {
        if (s[f]) {
          for (let v in s[f]) {
            const k = s[f][v];
            k && k.parentNode && k.parentNode.removeChild(k);
          }
          delete s[f];
        }
        o[f] && delete o[f];
      }
      function d(f, v) {
        return !(!s[f.id][v] || !s[f.id][v].parentNode);
      }
      function u(f, v) {
        s[f] && s[f][v] && s[f][v].parentNode && s[f][v].parentNode.removeChild(s[f][v]);
      }
      function c(f) {
        var v, k = f.$getTemplates();
        return k.task_cell_class !== void 0 ? (v = k.task_cell_class, (console.warn || console.log)("gantt.templates.task_cell_class template is deprecated and will be removed soon. Please use gantt.templates.timeline_cell_class instead.")) : v = k.timeline_cell_class, v;
      }
      function h(f) {
        return f.$getTemplates().timeline_cell_content;
      }
      function _(f, v, k, b, m, g, p, y) {
        var $ = f.width[v], x = "";
        if (Wt(v, f, b, r)) {
          var w = g(k, f.trace_x[v]), T = "";
          if (p && (T = p(k, f.trace_x[v])), y.static_background) {
            var S = !(!w && !T);
            if (!y.static_background_cells || !S) return null;
          }
          if (s[k.id][v]) return o[k.id][v] = v, s[k.id][v];
          var C = document.createElement("div");
          return C.style.width = $ + "px", x = "gantt_task_cell" + (v == m - 1 ? " gantt_last_cell" : ""), w && (x += " " + w), C.className = x, T && (C.innerHTML = T), C.style.position = "absolute", C.style.left = f.left[v] + "px", s[k.id][v] = C, o[k.id][v] = v, C;
        }
        return null;
      }
      return { render: function(f, v, k, b) {
        var m = v.$getTemplates(), g = v.getScale(), p = g.count;
        if (k.static_background && !k.static_background_cells) return null;
        var y, $ = document.createElement("div"), x = c(v), w = h(v);
        if (y = b && k.smart_rendering && !Ft(r) ? Ct(g, b.x) : { start: 0, end: p - 1 }, k.show_task_cells) {
          s[f.id] = {}, o[f.id] = {};
          for (var T = y.start; T <= y.end; T++) {
            var S = _(g, T, f, b, p, x, w, k);
            S && $.appendChild(S);
          }
        }
        const C = v.$config.rowStore, E = C.getIndexById(f.id) % 2 != 0;
        var D = m.task_row_class(f.start_date, f.end_date, f), I = "gantt_task_row" + (E ? " odd" : "") + (D ? " " + D : "");
        if (C.isSelected(f.id) && (I += " gantt_selected"), $.className = I, k.smart_rendering ? ($.style.position = "absolute", $.style.top = v.getItemTop(f.id) + "px", $.style.width = "100%") : $.style.position = "relative", $.style.height = v.getItemHeight(f.id) + "px", f.id == "timeline_placeholder_task") {
          var M = 0;
          f.lastTaskId && (M = v.getItemTop(f.lastTaskId) + v.getItemHeight(f.lastTaskId));
          var A = (f.row_height || v.$task_data.offsetHeight) - M;
          A < 0 && (A = 0), k.smart_rendering && ($.style.top = M + "px"), $.style.height = A + "px";
        }
        return v.$config.item_attribute && ($.setAttribute(v.$config.item_attribute, f.id), $.setAttribute(v.$config.bind + "_id", f.id)), $;
      }, update: function(f, v, k, b, m) {
        var g = k.getScale(), p = g.count, y = c(k), $ = h(k);
        if (b.show_task_cells) {
          s[f.id] || (s[f.id] = {}), o[f.id] || (o[f.id] = {});
          var x = Ct(g, m);
          for (var w in o[f.id]) {
            var T = o[f.id][w];
            (Number(T) < x.start || Number(T) > x.end) && u(f.id, T);
          }
          o[f.id] = {};
          for (var S = x.start; S <= x.end; S++) {
            var C = _(g, S, f, m, p, y, $, b);
            !C && d(f, S) ? u(f.id, S) : C && !C.parentNode && v.appendChild(C);
          }
        }
      }, clear: function() {
        for (let f in s) l(f);
        s = {}, o = {};
      }, getRectangle: Oe, getVisibleRange: Q, prepareData: xr };
    }(t);
  }, taskBar: function() {
    return function(r) {
      return { render: $e(r), update: null, isInViewPort: Mt, getVisibleRange: Q };
    }(t);
  }, timedProjectBar: function() {
    return function(r) {
      return { render: br(r), update: null, isInViewPort: yr, getVisibleRange: Q };
    }(t);
  }, taskRollupBar: function() {
    return function(r) {
      const s = $e(r), o = {};
      function l(c, h, _, f, v) {
        let k = !0;
        return f.smart_rendering && (k = Mt(c, h, _)), k;
      }
      function d(c, h, _, f) {
        const v = r.copy(r.getTask(h.id));
        if (v.$rendered_at = c.id, r.callEvent("onBeforeRollupTaskDisplay", [v.id, v, c.id]) === !1) return;
        const k = s(v, _);
        if (!k) return;
        const b = _.getBarHeight(c.id, h.type == r.config.types.milestone), m = Math.floor((_.getItemHeight(c.id) - b) / 2);
        return k.style.top = f.top + m + "px", k.classList.add("gantt_rollup_child"), k.setAttribute("data-rollup-parent-id", c.id), k;
      }
      function u(c, h) {
        return c + "_" + h;
      }
      return { render: function(c, h, _, f) {
        if (c.rollup !== !1 && c.$rollup && c.$rollup.length) {
          const v = document.createElement("div"), k = r.getTaskPosition(c), b = r.$ui.getView("timeline");
          return b._taskRenderer.rendered && _.smart_rendering && !b._taskRenderer.rendered[c.id] ? void 0 : (f && (f.y = 0, f.y_end = r.$task_bg.scrollHeight), c.$rollup.forEach(function(m) {
            if (!r.isTaskExists(m)) return;
            const g = r.getTask(m);
            if (!l(g, f, b, _)) return;
            const p = d(c, g, b, k);
            p ? (o[u(g.id, c.id)] = p, v.appendChild(p)) : o[u(g.id, c.id)] = !1;
          }), v);
        }
        return !1;
      }, update: function(c, h, _, f, v) {
        const k = document.createElement("div"), b = r.getTaskPosition(c);
        v.y = 0, v.y_end = r.$task_bg.scrollHeight, c.$rollup.forEach(function(m) {
          const g = r.getTask(m), p = u(g.id, c.id);
          let y = l(g, v, _, f);
          if (y !== !!o[p]) if (y) {
            const $ = d(c, g, _, b);
            o[p] = $ || !1;
          } else o[p] = !1;
          o[p] && k.appendChild(o[p]), h.innerHTML = "", h.appendChild(k);
        });
      }, isInViewPort: Mt, getVisibleRange: Q };
    }(t);
  }, taskSplitBar: function() {
    return function(r) {
      const s = $e(r), o = new Wn(r.$data.tasksStore), l = {};
      function d(_, f, v, k, b) {
        let m = !_.hide_bar;
        return k.smart_rendering && m && (m = Mt(_, f, v)), m;
      }
      function u(_, f, v, k, b) {
        if (f.hide_bar) return;
        const m = r.isSummaryTask(f);
        m && r.resetProjectDates(f);
        const g = r.copy(r.getTask(f.id));
        if (g.$rendered_at = _.id, r.callEvent("onBeforeSplitTaskDisplay", [g.id, g, _.id]) === !1) return;
        const p = s(g, v);
        if (!p) return;
        const y = f.type === r.config.types.milestone;
        let $;
        const x = k.rowHeight, w = v.getBarHeight(g.id, y);
        let T = Math.floor((v.getItemHeight(_.id) - w) / 2);
        y && ($ = cn(w)), b && (T = y ? Math.floor(($ - w) / 2) + 2 : 2);
        const S = p.querySelector(".gantt_link_control.task_start_date"), C = p.querySelector(".gantt_link_control.task_end_date");
        if (y) {
          if ($ > x) {
            T = 2, p.style.height = x - T + "px";
            const E = un(x), D = (E - x) / 2, I = p.querySelector(".gantt_task_content");
            T = Math.abs(D), S.style.marginLeft = D + "px", C.style.marginRight = D + "px", S.style.height = C.style.height = E + "px", p.style.width = I.style.height = I.style.width = E + "px", p.style.left = v.getItemPosition(g).left - E / 2 + "px";
          }
        } else w + T > x && (T = 0, p.style.height = p.style.lineHeight = S.style.height = C.style.height = x + "px");
        return p.style.top = k.top + T + "px", p.classList.add("gantt_split_child"), m && p.classList.add("gantt_split_subproject"), p;
      }
      function c(_, f) {
        return _ + "_" + f;
      }
      function h(_, f) {
        return r.isSplitTask(_) && (f.open_split_tasks && !_.$open || !f.open_split_tasks) && r.hasChild(_.id);
      }
      return { render: function(_, f, v, k) {
        if (h(_, v)) {
          const b = document.createElement("div"), m = r.getTaskPosition(_), g = Tt(r, _.id);
          return r.hasChild(_.id) && r.eachTask(function(p) {
            if (d(p, k, f, v) && (o.isDefaultSplitItem(p) || o.isInlineSplitItem(p))) {
              const y = u(_, p, f, m, g);
              y ? (l[c(p.id, _.id)] = y, b.appendChild(y)) : l[c(p.id, _.id)] = !1;
            }
          }, _.id), b;
        }
        if (r.isSplitTask(_) && r.hasChild(_.id)) {
          const b = document.createElement("div"), m = r.getTaskPosition(_), g = Tt(r, _.id);
          return r.eachTask(function(p) {
            if (d(p, k, f, v) && o.isInlineSplitItem(p)) {
              const y = u(_, p, f, m, g);
              y ? (l[c(p.id, _.id)] = y, b.appendChild(y)) : l[c(p.id, _.id)] = !1;
            }
          }, _.id), b;
        }
        return !1;
      }, update: function(_, f, v, k, b) {
        if (h(_, k)) {
          const m = document.createElement("div"), g = r.getTaskPosition(_), p = Tt(r, _.id);
          r.eachTask(function(y) {
            const $ = c(y.id, _.id);
            let x = d(y, b, v, k);
            if ((o.isDefaultSplitItem(y) || o.isInlineSplitItem(y)) && x !== !!l[$]) if (x) {
              const w = u(_, y, v, g, p);
              l[$] = w || !1;
            } else l[$] = !1;
            l[$] && m.appendChild(l[$]), f.innerHTML = "", f.appendChild(m);
          }, _.id);
        }
        if (r.isSplitTask(_) && r.hasChild(_.id)) {
          const m = document.createElement("div"), g = r.getTaskPosition(_), p = Tt(r, _.id);
          r.eachTask(function(y) {
            if (d(y, b, v, k) && o.isInlineSplitItem(y)) {
              const $ = u(_, y, v, g, p);
              $ ? (l[c(y.id, _.id)] = $, m.appendChild($)) : l[c(y.id, _.id)] = !1, f.innerHTML = "", f.appendChild(m);
            }
          }, _.id);
        }
      }, isInViewPort: $r, getVisibleRange: Q };
    }(t);
  }, taskConstraints: function() {
    return Ar(t);
  }, taskDeadline: function() {
    return /* @__PURE__ */ function(r) {
      function s(o, l, d) {
        const u = document.createElement("div"), c = r.getTaskPosition(o, o.deadline, o.deadline), { height: h, marginTop: _ } = Un(r, l, c, 20, o, d);
        let f = h;
        return r.config.rtl && (c.left += f), u.style.left = c.left - f + "px", u.style.top = c.top + "px", u.style.marginTop = _ + "px", u.style.width = f + "px", u.style.height = h + "px", u.style.fontSize = h + "px", u.className = "gantt_task_deadline", u.setAttribute("data-task-id", o.id), u;
      }
      return { render: function(o, l, d, u) {
        const c = document.createElement("div");
        if (c.className = "gantt_deadline_nodes", c.setAttribute("data-task-row-id", o.id), o.deadline) {
          const h = s(o, l);
          c.appendChild(h);
        }
        if (pt(o)) {
          const h = Tt(r, o.id);
          r.eachTask(function(_) {
            if (_.deadline) {
              const f = s(_, l, h);
              c.appendChild(f);
            }
          }, o.id);
        }
        if (c.childNodes.length) return c;
      }, isInViewPort: Ir, getVisibleRange: Q };
    }(t);
  }, taskBaselines: function() {
    return /* @__PURE__ */ function(r) {
      function s(o, l, d, u, c) {
        const h = document.createElement("div");
        let _ = l.end_date, f = o.type === r.config.types.milestone;
        f && (_ = l.start_date);
        const v = r.getTaskPosition(o, l.start_date, _);
        let k, b = 0;
        if (f) {
          let S = u.getBarHeight(o.id, !0);
          k = cn(S), b = Math.floor((k - S) / 4);
        }
        let m = ne(r, u, o, v.rowHeight).maxHeight, g = v.top + 1 + b, p = u.getBarHeight(o.id, o.type);
        const y = r.config.baselines.row_height, $ = r.config.baselines.bar_height;
        let x, w;
        switch (r.config.baselines.render_mode) {
          case "separateRow":
            g += v.height + (y - $) / 2, p = $;
            break;
          case "individualRow":
            x = y * d, g += v.height + x + (y - $) / 2, p = $;
            break;
          default:
            w = 1, c ? (m = ne(r, u, o).maxHeight, b ? m >= k ? w = (m - p) / 2 - 1 - b : (p = un(m), g = v.top, w = Math.abs(p - m) / 2, b = 0) : (m > p && (w = (m - p) / 2 - 1), w -= b), o.bar_height || (w -= 1)) : (o.bar_height && v.rowHeight >= o.bar_height && (w = (v.rowHeight - o.bar_height) / 2 - 1), w += b, o.bar_height || (w += 2), f && (w += 1));
        }
        let T = v.top + m + 1 - b;
        return !(g + p > T && (p -= g + p - T, p <= 0)) && (h.style.left = v.left + "px", h.style.width = v.width + "px", h.style.top = g + "px", h.style.height = Math.floor(p) + "px", w && (h.style.marginTop = w + "px"), h.className = `gantt_task_baseline gantt_task_baseline_${d} ${l.className || ""}`, f ? (h.className += " gantt_milestone_baseline", h.style.width = h.style.height = p + "px", h.style.marginLeft = Math.floor(-p / 2) + "px") : h.innerHTML = r.templates.baseline_text(o, l, d), h.setAttribute("data-task-id", o.id), h.setAttribute("data-baseline-id", l.id), h);
      }
      return { render: function(o, l, d, u) {
        if (!r.config.baselines.render_mode) return;
        const c = document.createElement("div");
        return c.className = "gantt_baseline_nodes", c.setAttribute("data-task-row-id", o.id), o.baselines && o.baselines.length && o.baselines.forEach(function(h, _) {
          const f = s(o, h, _, l);
          f && c.appendChild(f);
        }), pt(o) && r.eachTask(function(h) {
          h.baselines && h.baselines.length && h.baselines.forEach(function(_, f) {
            const v = s(h, _, f, l, !0);
            v && c.appendChild(v);
          });
        }, o.id), c.childNodes.length ? c : void 0;
      }, isInViewPort: Mr, getVisibleRange: Q };
    }(t);
  }, link: function() {
    return wr(t);
  }, resourceRow: function() {
    return function(r) {
      var s = ei(r), o = {};
      function l(u, c, h, _, f) {
        var v = h.resource_cell_class(c.start_date, c.end_date, u, c.tasks, c.assignments), k = h.resource_cell_value(c.start_date, c.end_date, u, c.tasks, c.assignments), b = f.getItemHeight(u.id) - 1;
        if (v || k) {
          var m = f.getItemPosition(u, c.start_date, c.end_date), g = document.createElement("div");
          return g.setAttribute(f.$config.item_attribute, u.id), g.className = ["gantt_resource_marker", v].join(" "), g.style.cssText = ["left:" + m.left + "px", "width:" + m.width + "px", "height:" + b + "px", "line-height:" + b + "px", "top:" + m.top + "px"].join(";"), k && (g.innerHTML = k), g;
        }
        return null;
      }
      function d(u, c) {
        o[u] && o[u][c] && o[u][c].parentNode && o[u][c].parentNode.removeChild(o[u][c]);
      }
      return { render: function(u, c, h, _) {
        var f = c.$getTemplates(), v = c.getScale(), k = s(u, h.resource_property, c.getScale(), c), b = !!_, m = [];
        o[u.id] = {};
        for (var g = Ct(v, _), p = g.start; p <= g.end; p++) {
          var y = k[p];
          if (y && (!b || Wt(p, v, _, r))) {
            var $ = l(u, y, f, 0, c);
            $ && (m.push($), o[u.id][p] = $);
          }
        }
        var x = null;
        if (m.length) {
          x = document.createElement("div");
          for (var w = 0; w < m.length; w++) x.appendChild(m[w]);
        }
        return x;
      }, update: function(u, c, h, _, f) {
        var v = h.$getTemplates(), k = h.getScale(), b = s(u, _.resource_property, h.getScale(), h), m = Ct(k, f), g = {};
        if (o && o[u.id]) for (var p in o[u.id]) g[p] = p;
        for (var y = m.start; y <= m.end; y++) {
          var $ = b[y];
          if (g[y] = !1, $) if (Wt(y, k, f, r)) if (o[u.id] && o[u.id][y]) o[u.id] && o[u.id][y] && !o[u.id][y].parentNode && c.appendChild(o[u.id][y]);
          else {
            var x = l(u, $, v, 0, h);
            x && (c.appendChild(x), o[u.id][y] = x);
          }
          else d(u.id, y);
        }
        for (var p in g) g[p] !== !1 && d(u.id, p);
      }, getRectangle: Oe, getVisibleRange: Q };
    }(t);
  }, resourceHistogram: function() {
    return Er(t);
  }, gridTaskRowResizer: function() {
    return /* @__PURE__ */ function(r) {
      return { render: function(s, o, l) {
        var d = o.$getConfig(), u = document.createElement("div");
        return u.className = "gantt_task_grid_row_resize_wrap", u.style.top = o.getItemTop(s.id) + o.getItemHeight(s.id) + "px", u.innerHTML = "<div class='gantt_task_grid_row_resize' role='cell'></div>", u.setAttribute(d.task_grid_row_resizer_attribute, s.id), r._waiAria.rowResizerAttr(u), u;
      }, update: null, getRectangle: ie, getVisibleRange: Q };
    }(t);
  } }, layersService: { getDataRender: function(r) {
    return i.getDataRender(r, t);
  }, createDataRender: function(r) {
    return i.createDataRender(r, t);
  } } };
} };
function Se(t, n) {
  const e = getComputedStyle(n.$root).getPropertyValue("--dhx-gantt-theme");
  let i, a = !!e;
  if (a) i = e;
  else {
    var r = n.skin;
    if (i = r, !r || t) for (var s = document.getElementsByTagName("link"), o = 0; o < s.length; o++) {
      var l = s[o].href.match("dhtmlxgantt_([a-z_]+).css");
      if (l && (n.skins[l[1]] || !r)) {
        i = l[1];
        break;
      }
    }
  }
  n._theme_info = { theme: i, cssVarTheme: a }, n.skin = i || "terrace";
  var d = n.skins[n.skin] || n.skins.terrace;
  (function(h, _, f) {
    for (var v in _) (h[v] === void 0 || f) && (h[v] = _[v]);
  })(n.config, d.config, t), a || (n.config.link_radius = 1);
  var u = n.getGridColumns();
  for (u[1] && !n.defined(u[1].width) && (u[1].width = d._second_column_width), u[2] && !n.defined(u[2].width) && (u[2].width = d._third_column_width), o = 0; o < u.length; o++) {
    var c = u[o];
    c.name == "add" && (c.width || (c.width = 44), n.defined(c.min_width) && n.defined(c.max_width) || (c.min_width = c.min_width || c.width, c.max_width = c.max_width || c.width), c.min_width && (c.min_width = +c.min_width), c.max_width && (c.max_width = +c.max_width), c.width && (c.width = +c.width, c.width = c.min_width && c.min_width > c.width ? c.min_width : c.width, c.width = c.max_width && c.max_width < c.width ? c.max_width : c.width));
  }
  d.config.task_height && (n.config.task_height = d.config.task_height || "full"), d.config.bar_height && (n.config.bar_height = d.config.bar_height || "full"), d._lightbox_template && (n._lightbox_template = d._lightbox_template), d._redefine_lightbox_buttons && (n.config.buttons_right = d._redefine_lightbox_buttons.buttons_right, n.config.buttons_left = d._redefine_lightbox_buttons.buttons_left), n.resetLightbox();
}
function Fr(t) {
  var n = null, e = !1, i = null, a = { started: !1 }, r = {};
  function s(_) {
    return _ && Z(_, t.$root) && _.offsetHeight;
  }
  function o() {
    var _ = !!document.querySelector(".gantt_drag_marker"), f = !!document.querySelector(".gantt_drag_marker.gantt_grid_resize_area") || !!document.querySelector(".gantt_drag_marker.gantt_row_grid_resize_area"), v = !!document.querySelector(".gantt_link_direction"), k = t.getState(), b = k.autoscroll;
    return e = _ && !f && !v, !(!k.drag_mode && !_ || f) || b;
  }
  function l(_) {
    if (i && (clearTimeout(i), i = null), _) {
      var f = t.config.autoscroll_speed;
      f && f < 10 && (f = 10), i = setTimeout(function() {
        n = setInterval(c, f || 50);
      }, t.config.autoscroll_delay || 10);
    }
  }
  function d(_) {
    _ ? (l(!0), a.started || (a.x = r.x, a.y = r.y, a.started = !0)) : (n && (clearInterval(n), n = null), l(!1), a.started = !1);
  }
  function u(_) {
    var f = o();
    if (!n && !i || f || d(!1), !t.config.autoscroll || !f) return !1;
    r = { x: _.clientX, y: _.clientY }, _.type == "touchmove" && (r.x = _.targetTouches[0].clientX, r.y = _.targetTouches[0].clientY), !n && f && d(!0);
  }
  function c() {
    if (!o()) return d(!1), !1;
    var _ = s(t.$task) ? t.$task : s(t.$grid) ? t.$grid : t.$root;
    if (_) {
      var f = !1;
      [".gantt_drag_marker.gantt_grid_resize_area", ".gantt_drag_marker .gantt_row.gantt_row_task", ".gantt_drag_marker.gantt_grid_dnd_marker"].forEach(function(E) {
        f = f || !!document.querySelector(E);
      }), f && (_ = t.$grid);
      var v = Y(_), k = r.x - v.x, b = r.y - v.y + window.scrollY, m = e ? 0 : h(k, v.width, a.x - v.x), g = h(b, v.height, a.y - v.y + window.scrollY), p = t.getScrollState(), y = p.y, $ = p.inner_height, x = p.height, w = p.x, T = p.inner_width, S = p.width;
      (g && !$ || g < 0 && !y || g > 0 && y + $ >= x + 2) && (g = 0), (m && !T || m < 0 && !w || m > 0 && w + T >= S) && (m = 0);
      var C = t.config.autoscroll_step;
      C && C < 2 && (C = 2), g *= C || 30, ((m *= C || 30) || g) && function(E, D) {
        var I = t.getScrollState(), M = null, A = null;
        E && (M = I.x + E, M = Math.min(I.width, M), M = Math.max(0, M)), D && (A = I.y + D, A = Math.min(I.height, A), A = Math.max(0, A)), t.scrollTo(M, A);
      }(m, g);
    }
  }
  function h(_, f, v) {
    return _ - 50 < 0 && _ < v ? -1 : _ > f - 50 && _ > v ? 1 : 0;
  }
  t.attachEvent("onGanttReady", function() {
    if (!q(t)) {
      var _ = Et(t.$root) || document.body;
      t.eventRemove(_, "mousemove", u), t.event(_, "mousemove", u), t.eventRemove(_, "touchmove", u), t.event(_, "touchmove", u), t.eventRemove(_, "pointermove", u), t.event(_, "pointermove", u);
    }
  }), t.attachEvent("onDestroy", function() {
    d(!1);
  });
}
var Te, Ce;
typeof window < "u" && window.jQuery && (Te = window.jQuery, Ce = [], Te.fn.dhx_gantt = function(t) {
  if (typeof (t = t || {}) != "string") {
    var n = [];
    return this.each(function() {
      if (this && this.getAttribute) if (this.gantt || window.gantt.$root == this) n.push(typeof this.gantt == "object" ? this.gantt : window.gantt);
      else {
        var e = window.gantt.$container && window.Gantt ? window.Gantt.getGanttInstance() : window.gantt;
        for (var i in t) i != "data" && (e.config[i] = t[i]);
        e.init(this), t.data && e.parse(t.data), n.push(e);
      }
    }), n.length === 1 ? n[0] : n;
  }
  if (Ce[t]) return Ce[t].apply(this, []);
  Te.error("Method " + t + " does not exist on jQuery.dhx_gantt");
});
typeof window < "u" && window.dhtmlx && (window.dhtmlx.attaches || (window.dhtmlx.attaches = {}), window.dhtmlx.attaches.attachGantt = function(t, n, e) {
  var i = document.createElement("DIV");
  e = e || window.gantt, i.id = "gantt_" + e.uid(), i.style.width = "100%", i.style.height = "100%", i.cmp = "grid", document.body.appendChild(i), this.attachObject(i.id), this.dataType = "gantt", this.dataObj = e;
  var a = this.vs[this.av];
  return a.grid = e, e.init(i.id, t, n), i.firstChild.style.border = "none", a.gridId = i.id, a.gridObj = i, this.vs[this._viewRestore()].grid;
}), typeof window < "u" && window.dhtmlXCellObject !== void 0 && (window.dhtmlXCellObject.prototype.attachGantt = function(t, n, e) {
  e = e || window.gantt;
  var i = document.createElement("DIV");
  return i.id = "gantt_" + e.uid(), i.style.width = "100%", i.style.height = "100%", i.cmp = "grid", document.body.appendChild(i), this.attachObject(i.id), this.dataType = "gantt", this.dataObj = e, e.init(i.id, t, n), i.firstChild.style.border = "none", i = null, this.callEvent("_onContentAttach", []), this.dataObj;
});
const Wr = ["ctrlKey", "altKey", "shiftKey", "metaKey"], Vr = [[{ unit: "month", date: "%M", step: 1 }, { unit: "day", date: "%d", step: 1 }], [{ unit: "day", date: "%d %M", step: 1 }], [{ unit: "day", date: "%d %M", step: 1 }, { unit: "hour", date: "%H:00", step: 8 }], [{ unit: "day", date: "%d %M", step: 1 }, { unit: "hour", date: "%H:00", step: 1 }]];
class Ur {
  constructor(n) {
    this.zoomIn = () => {
      const e = this.getCurrentLevel() - 1;
      e < 0 || this.setLevel(e);
    }, this.zoomOut = () => {
      const e = this.getCurrentLevel() + 1;
      e > this._levels.length - 1 || this.setLevel(e);
    }, this.getCurrentLevel = () => this._activeLevelIndex, this.getLevels = () => this._levels, this.setLevel = (e) => {
      const i = this._getZoomIndexByName(e);
      i === -1 && this.$gantt.assert(i !== -1, "Invalid zoom level for gantt.ext.zoom.setLevel. " + e + " is not an expected value."), this._setLevel(i, 0);
    }, this._getZoomIndexByName = (e) => {
      let i = -1;
      if (typeof e == "string") {
        if (!isNaN(Number(e)) && this._levels[Number(e)]) i = Number(e);
        else for (let a = 0; a < this._levels.length; a++) if (this._levels[a].name === e) {
          i = a;
          break;
        }
      } else i = e;
      return i;
    }, this._getVisibleDate = () => {
      if (!this.$gantt.$task) return null;
      const e = this.$gantt.getScrollState().x, i = this.$gantt.$task.offsetWidth;
      this._visibleDate = this.$gantt.dateFromPos(e + i / 2);
    }, this._setLevel = (e, i) => {
      this._activeLevelIndex = e;
      const a = this.$gantt, r = a.copy(this._levels[this._activeLevelIndex]), s = a.copy(r);
      delete s.name, a.mixin(a.config, s, !0);
      const o = ["resourceTimeline", "resourceHistogram"];
      if (o.forEach(function(l) {
        const d = a.$ui.getView(l);
        if (d) {
          const u = d.$getConfig();
          u.fixed_scales || a.mixin(u, s, !0);
        }
      }), a.$root) {
        if (i) {
          const l = a.dateFromPos(i + a.getScrollState().x);
          a.render();
          const d = a.posFromDate(l);
          a.scrollTo(d - i);
        } else {
          let l;
          a.$task && a.$task.offsetWidth ? l = a.$task.offsetWidth : o.forEach(function(u) {
            const c = a.$ui.getView(u);
            c && (l = c.$task.offsetWidth);
          }), this._visibleDate || this._getVisibleDate();
          const d = this._visibleDate;
          if (a.render(), l) {
            const u = a.posFromDate(d);
            a.scrollTo(u - l / 2);
          }
        }
        this.callEvent("onAfterZoom", [this._activeLevelIndex, r]);
      }
    }, this._attachWheelEvent = (e) => {
      const i = yt.isFF ? "wheel" : "mousewheel";
      let a;
      a = typeof e.element == "function" ? e.element() : e.element, a && this._domEvents.attach(a, i, this.$gantt.bind(function(r) {
        if (this._useKey && (Wr.indexOf(this._useKey) < 0 || !r[this._useKey]))
          return !1;
        if (typeof this._handler == "function") return this._handler.apply(this, [r]), !0;
      }, this), { passive: !1 });
    }, this._defaultHandler = (e) => {
      const i = this.$gantt.$task.getBoundingClientRect().x, a = e.clientX - i;
      let r = !1;
      (this.$gantt.env.isFF ? -40 * e.deltaY : e.wheelDelta) > 0 && (r = !0), e.preventDefault(), e.stopPropagation(), this._setScaleSettings(r, a);
    }, this._setScaleDates = () => {
      this._initialStartDate && this._initialEndDate && (this.$gantt.config.start_date = this._initialStartDate, this.$gantt.config.end_date = this._initialEndDate);
    }, this.$gantt = n, this._domEvents = this.$gantt._createDomEventScope();
  }
  init(n) {
    this.$gantt.env.isNode || (this._initialStartDate = n.startDate, this._initialEndDate = n.endDate, this._activeLevelIndex = n.activeLevelIndex ? n.activeLevelIndex : 0, this._levels = this._mapScales(n.levels || Vr), this._handler = n.handler || this._defaultHandler, this._minColumnWidth = n.minColumnWidth || 60, this._maxColumnWidth = n.maxColumnWidth || 240, this._widthStep = n.widthStep || 3 / 8 * n.minColumnWidth, this._useKey = n.useKey, this._initialized || (_t(this), this.$gantt.attachEvent("onGanttScroll", () => {
      this._getVisibleDate();
    })), this._domEvents.detachAll(), n.trigger === "wheel" && (this.$gantt.$root ? this._attachWheelEvent(n) : this.$gantt.attachEvent("onGanttLayoutReady", () => {
      this.$gantt.attachEvent("onGanttRender", () => {
        this._attachWheelEvent(n);
      }, { once: !0 });
    })), this._initialized = !0, this.setLevel(this._activeLevelIndex));
  }
  _mapScales(n) {
    return n.map((e) => Array.isArray(e) ? { scales: e } : e);
  }
  _setScaleSettings(n, e) {
    n ? this._stepUp(e) : this._stepDown(e);
  }
  _stepUp(n) {
    if (this._activeLevelIndex >= this._levels.length - 1) return;
    let e = this._activeLevelIndex;
    if (this._setScaleDates(), this._widthStep) {
      let i = this.$gantt.config.min_column_width + this._widthStep;
      i > this._maxColumnWidth && (i = this._minColumnWidth, e++), this.$gantt.config.min_column_width = i;
    } else e++;
    this._setLevel(e, n);
  }
  _stepDown(n) {
    if (this._activeLevelIndex < 1) return;
    let e = this._activeLevelIndex;
    if (this._setScaleDates(), this._widthStep) {
      let i = this.$gantt.config.min_column_width - this._widthStep;
      i < this._minColumnWidth && (i = this._maxColumnWidth, e--), this.$gantt.config.min_column_width = i;
    } else e--;
    this._setLevel(e, n);
  }
}
function Gr(t) {
  function n() {
    t.config.touch != "force" && (t.config.touch = t.config.touch && (navigator.userAgent.indexOf("Mobile") != -1 || navigator.userAgent.indexOf("iPad") != -1 || navigator.userAgent.indexOf("Android") != -1 || navigator.userAgent.indexOf("Touch") != -1) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1), t.config.touch && (!t.env.isIE || window.navigator.maxTouchPoints ? t._touch_events(["touchmove", "touchstart", "touchend"], function(r) {
      return r.touches && r.touches.length > 1 ? null : r.touches[0] ? { target: r.target, pageX: r.touches[0].pageX, pageY: r.touches[0].pageY, clientX: r.touches[0].clientX, clientY: r.touches[0].clientY } : r;
    }, function(r) {
      return r.defaultPrevented;
    }) : window.PointerEvent && t._touch_events(["pointermove", "pointerdown", "pointerup"], function(r) {
      return r.pointerType == "mouse" ? null : r;
    }, function(r) {
      return !r || r.pointerType == "mouse";
    }));
  }
  function e(r) {
    var s = r.$config.scrollX ? t.$ui.getView(r.$config.scrollX) : null, o = r.$config.scrollY ? t.$ui.getView(r.$config.scrollY) : null, l = { x: null, y: null };
    return s && s.getScrollState().visible && (l.x = s.$view.scrollLeft), o && o.getScrollState().visible && (l.y = o.$view.scrollTop), l;
  }
  function i() {
    var r;
    return t.$ui.getView("timeline") && (r = t.$ui.getView("timeline")._tasks_dnd), r;
  }
  t.config.touch_drag = 75, t.config.touch = !0, t.config.touch_feedback = !0, t.config.touch_feedback_duration = 1, t._prevent_touch_scroll = !1, t._touch_feedback = function() {
    t.config.touch_feedback && navigator.vibrate && navigator.vibrate(t.config.touch_feedback_duration);
  }, t.attachEvent("onGanttReady", function() {
    t.$container && n();
  }), t.attachEvent("onGanttLayoutReady", function() {
    t.$container && t.attachEvent("onGanttRender", n, { once: !0 });
  });
  var a = [];
  t._touch_events = function(r, s, o) {
    var l, d = 0, u = !1, c = !1, h = null, _ = null, f = null, v = null, k = [], b = null;
    let m = {};
    for (var g = 0; g < a.length; g++) t.eventRemove(a[g][0], a[g][1], a[g][2]);
    (a = []).push([t.$container, r[0], function(y) {
      var $ = i();
      if (!o(y) && u) {
        f && clearTimeout(f);
        var x = s(y);
        if ($ && ($.drag.id || $.drag.start_drag)) return $.on_mouse_move(x), y.preventDefault && y.preventDefault(), y.cancelBubble = !0, !1;
        if (!t._prevent_touch_scroll) {
          if (x && h) {
            var w = h.pageX - x.pageX, T = h.pageY - x.pageY;
            if (!c && (Math.abs(w) > 5 || Math.abs(T) > 5) && (c = !0, d = 0, l = b ? e(b) : t.getScrollState()), c) {
              var S, C = l.x + w, E = l.y + T;
              if (b ? (function(D, I, M) {
                var A = D.$config.scrollX ? t.$ui.getView(D.$config.scrollX) : null, L = D.$config.scrollY ? t.$ui.getView(D.$config.scrollY) : null;
                A && A.scrollTo(I, null), L && L.scrollTo(null, M);
              }(b, C, E), S = e(b)) : (t.scrollTo(C, E), S = t.getScrollState()), l.x != S.x && T > 2 * w || l.y != S.y && w > 2 * T) return p(y);
            }
          }
          return p(y);
        }
        return !0;
      }
    }]);
    try {
      document.addEventListener("touchmove", function(y) {
        t._touch_drag && p(y);
      }, { passive: !1 });
    } catch {
      console.warn("Cannot prevent touch event for the page drag");
    }
    for (a.push([this.$container, "contextmenu", function(y) {
      if (u) return p(y);
    }]), a.push([this.$container, r[1], function(y) {
      if (m = y.touches.length, document && document.body && document.body.classList.add("gantt_touch_active"), !o(y)) if (y.touches && y.touches.length > 1) u = !1;
      else {
        h = s(y), b = function(x) {
          for (var w = t.$layout.getCellsByType("viewCell"), T = 0; T < w.length; T++) {
            var S = w[T].$view.getBoundingClientRect();
            if (x.clientX >= S.left && x.clientX <= S.right && x.clientY <= S.bottom && x.clientY >= S.top) return w[T];
          }
        }(h), t._locate_css(h, "gantt_hor_scroll") || t._locate_css(h, "gantt_ver_scroll") || (u = !0);
        var $ = i();
        f = setTimeout(function() {
          var x = t.locate(h);
          $ && x && !t._locate_css(h, "gantt_link_control") && !t._locate_css(h, "gantt_grid_data") && ($.on_mouse_down(h), $.drag && $.drag.start_drag && (function(w) {
            const T = t._getTaskLayers();
            let S = t.getTask(w);
            if (S) {
              let C = t.isTaskVisible(w);
              if (C) {
                v = w;
                for (let E = 0; E < T.length; E++) if (S = T[E].rendered[w], S && S.getAttribute(t.config.task_attribute) && S.getAttribute(t.config.task_attribute) == w) {
                  const D = S.cloneNode(!0);
                  k.push(S), T[E].rendered[w] = D, S.style.display = "none", D.className += " gantt_drag_move ", S.parentNode.appendChild(D);
                }
              } else if (S.$split_subtask) {
                let E = S.$rendered_parent;
                if (C = t.isTaskVisible(E), !C) return;
                v = w;
                for (let D = 0; D < T.length; D++) {
                  const I = T[D].rendered[E];
                  let M;
                  if (I && I.childNodes && (M = I.querySelector(`[${t.config.task_attribute}="${S.id}"]`)), M) {
                    const A = M.cloneNode(!0);
                    M.parentNode.appendChild(A), t.$task_bars.appendChild(M), M.style.display = "none", k.push(M), M = null;
                  }
                }
              }
            }
          }(x), $._start_dnd(h), t._touch_drag = !0, t.refreshTask(x), t._touch_feedback())), f = null;
        }, t.config.touch_drag);
      }
    }]), a.push([this.$container, r[2], function(y) {
      if (document && document.body && document.body.classList.remove("gantt_touch_active"), !o(y)) {
        f && clearTimeout(f), t._touch_drag = !1, u = !1;
        var $ = s(y), x = i();
        if (x && x.on_mouse_up($), v && t.isTaskExists(v) && (t.refreshTask(v), k.length && (k.forEach(function(T) {
          T.parentNode && T.parentNode.removeChild(T);
        }), t._touch_feedback())), u = c = !1, k = [], v = null, h && d) {
          var w = /* @__PURE__ */ new Date();
          const T = m <= 1, S = _ && _.target.innerHTML == h.target.innerHTML;
          w - d < 500 && T && S ? (t.$services.getService("mouseEvents").onDoubleClick(h), p(y)) : (d = w, _ = h);
        } else d = /* @__PURE__ */ new Date();
      }
    }]), g = 0; g < a.length; g++) t.event(a[g][0], a[g][1], a[g][2]);
    function p(y) {
      return y && y.preventDefault && y.cancelable && y.preventDefault(), y.cancelBubble = !0, !1;
    }
  };
}
function Xt() {
  console.log("Method is not implemented.");
}
function jt() {
}
function ot(t) {
  return jt;
}
jt.prototype.render = Xt, jt.prototype.set_value = Xt, jt.prototype.get_value = Xt, jt.prototype.focus = Xt;
var ae = { getHtmlSelect: function(t, n, e) {
  var i = "", a = this;
  return ht(t = t || [], function(r) {
    var s = [{ key: "value", value: r.key }];
    e == r.key && (s[s.length] = { key: "selected", value: "selected" }), r.attributes && (s = s.concat(r.attributes)), i += a.getHtmlOption({ innerHTML: r.label }, s);
  }), Bt("select", { innerHTML: i }, n);
}, getHtmlOption: function(t, n) {
  return Bt("option", t, n);
}, getHtmlButton: function(t, n) {
  return Bt("button", t, n);
}, getHtmlDiv: function(t, n) {
  return Bt("div", t, n);
}, getHtmlLabel: function(t, n) {
  return Bt("label", t, n);
}, getHtmlInput: function(t) {
  return "<input" + ai(t || []) + ">";
} };
function Bt(t, n, e) {
  return n = n || [], "<" + t + ai(e || []) + ">" + (n.innerHTML || "") + "</" + t + ">";
}
function ai(t) {
  var n = "";
  return ht(t, function(e) {
    n += " " + e.key + "='" + e.value + "'";
  }), n;
}
function Be(t) {
  const n = ot();
  function e() {
    return n.apply(this, arguments) || this;
  }
  return F(e, n), e.prototype.render = function(i) {
    const a = i.height ? `height:${i.height}px;` : "";
    let r = `<div class='gantt_cal_ltext gantt_section_${i.name}' ${a ? `style='${a}'` : ""}>`;
    return r += ae.getHtmlSelect(i.options, [{ key: "style", value: "width:100%;" }, { key: "title", value: i.name }]), r += "</div>", r;
  }, e.prototype.set_value = function(i, a, r, s) {
    var o = i.firstChild;
    !o._dhx_onchange && s.onchange && (o.onchange = s.onchange, o._dhx_onchange = !0), a === void 0 && (a = (o.options[0] || {}).value), o.value = a || "";
  }, e.prototype.get_value = function(i) {
    return i.firstChild.value;
  }, e.prototype.focus = function(i) {
    var a = i.firstChild;
    t._focus(a, !0);
  }, e;
}
const ce = class ce {
  constructor() {
    this.canParse = (n) => !isNaN(this.parse(n)), this.format = (n) => String(n), this.parse = (n) => parseInt(n, 10);
  }
};
ce.create = (n = null) => new ce();
let re = ce;
function qr(t) {
  var n = Be(t);
  function e() {
    return n.apply(this, arguments) || this;
  }
  function i(a, r) {
    var s = [], o = [];
    r && (s = t.getTaskByTime(), a.allow_root && s.unshift({ id: t.config.root_id, text: a.root_label || "" }), s = function(c, h, _) {
      var f = h.filter || function() {
        return !0;
      };
      c = c.slice(0);
      for (var v = 0; v < c.length; v++) {
        var k = c[v];
        (k.id == _ || t.isChildOf(k.id, _) || f(k.id, k) === !1) && (c.splice(v, 1), v--);
      }
      return c;
    }(s, a, r), a.sort && s.sort(a.sort));
    for (var l = a.template || t.templates.task_text, d = 0; d < s.length; d++) {
      var u = l.apply(t, [s[d].start_date, s[d].end_date, s[d]]);
      u === void 0 && (u = ""), o.push({ key: s[d].id, label: u });
    }
    return a.options = o, a.map_to = a.map_to || "parent", t.form_blocks.select.render.apply(this, arguments);
  }
  return F(e, n), e.prototype.render = function(a) {
    return i(a, !1);
  }, e.prototype.set_value = function(a, r, s, o) {
    r === 0 && (r = "0"), !s.id && t.getState().lightbox && (s.id = t.getLightboxValues().id);
    var l = document.createElement("div");
    l.innerHTML = i(o, s.id);
    var d = l.removeChild(l.firstChild);
    return a.onselect = null, a.parentNode.replaceChild(d, a), t.form_blocks.select.set_value.apply(t, [d, r, s, o]);
  }, e;
}
function Yr(t) {
  const n = ot();
  var e = { resources: {}, resourcesValues: {}, filter: {}, eventsInitialized: {} };
  function i() {
    return n.apply(this, arguments) || this;
  }
  function a(l, d, u, c) {
    var h, _ = "";
    if (l) return h = [{ key: "data-item-id", value: l.key }, { key: "data-assignment-id", value: c || "" }, { key: "class", value: "gantt_resource_amount_input" }], u && h.push({ key: "disabled", value: "disabled" }), l.options ? _ += ae.getHtmlSelect(l.options, h, d) : (h[h.length] = { key: "value", value: d || "" }, _ += ae.getHtmlInput(h)), _;
  }
  function r(l) {
    return l === void 0 ? ".gantt_resource_amount_input" : "[data-checked='" + (l ? "true" : "false") + "'] .gantt_resource_amount_input";
  }
  function s(l) {
    return e.resources[l.id];
  }
  function o(l) {
    return e.filter[l.id];
  }
  return t.attachEvent("onAfterLightbox", function() {
    for (var l in e.filter) e.filter[l].checkbox.checked = !1, e.filter[l].input.value = "", e.filter[l].filterApplied = !1;
    e.resourcesValues = {};
  }), F(i, n), i.prototype.render = function(l) {
    var d;
    l.options || (l.options = t.serverList("resourceOptions")), l.map_to && l.map_to != "auto" || (l.map_to = t.config.resource_property);
    var u = t.locale.labels.resources_filter_placeholder || l.filter_placeholder || "type to filter", c = t.locale.labels.resources_filter_label || "hide empty";
    return d = "<div" + (isNaN(l.height) ? "" : " style='height: " + l.height + "px;'") + " class='gantt_section_" + l.name + "'>", d += "<div class='gantt_cal_ltext gantt_resources_filter'><input type='text' class='gantt_resources_filter_input' placeholder='" + u + "'> <label><input class='switch_unsetted' type='checkbox'><span class='matherial_checkbox_icon'></span>" + c + "</label></div>", d += "<div class='gantt_cal_ltext gantt_resources' data-name='" + l.name + "'></div>", d += "</div>";
  }, i.prototype.set_value = function(l, d, u, c) {
    var h, _ = function(v, k) {
      return e.resources[k.id] || (e.resources[k.id] = v.querySelector(".gantt_resources")), e.resources[k.id];
    }(l, c), f = "";
    (function(v, k) {
      if (!e.filter[k.id]) {
        var b = v.querySelector(".gantt_resources_filter"), m = b.querySelector(".gantt_resources_filter_input"), g = b.querySelector(".switch_unsetted");
        e.filter[k.id] = { container: b, input: m, checkbox: g, filterApplied: !1 };
      }
      e.filter[k.id];
    })(l, c), function(v, k, b, m) {
      if (e.eventsInitialized[b.id]) return;
      var g = function($) {
        var x, w, T, S, C;
        y(b, v);
        var E = o(b);
        C = E.checkbox, S = E.input, T = C.checked, w = S.value.trim(), E.filterApplied = !!w, t.getState().lightbox && (k = t.getLightboxValues()), x = function(I, M, A, L) {
          var N, P;
          if (L) {
            var R = M[I.map_to] || [];
            if (Lt(R) || (R = [R]), (R = R.slice()).length === 0) {
              for (var O in R = [], (P = t.copy(I)).options = [], e.resourcesValues[I.id])
                (B = e.resourcesValues[I.id][O]).value !== "" && R.push({ resource_id: O, value: B.value, id: B.id });
              if (R.length === 0) return P;
            } else for (var O in e.resourcesValues[I.id]) {
              var B;
              (B = e.resourcesValues[I.id][O]).value !== "" && (Ee(R, function(G) {
                return G.id == O;
              }) || R.push({ resource_id: O, value: B.value, id: B.id }));
            }
            for (var z = {}, K = 0; K < R.length; K++) z[R[K].resource_id] = !0;
            N = function(W) {
              if (z[String(W.key)] && (A === "" || W.label.toLowerCase().indexOf(A.toLowerCase()) >= 0)) return W;
            };
          } else {
            if (A === "") return I;
            N = function(W) {
              if (W.label.toLowerCase().indexOf(A.toLowerCase()) >= 0) return W;
            };
          }
          return (P = t.copy(I)).options = wn(P.options, N), P;
        }(b, k, w, T);
        var D = k[b.map_to];
        m.form_blocks.resources.set_value(v, D, k, x);
      };
      function p($) {
        var x, w = $.target;
        if ($.target.type === "checkbox") {
          (x = w.parentNode.querySelector(r())).disabled = !w.checked;
          var T = x.getAttribute("data-item-id"), S = kt($, "gantt_resource_row"), C = S.querySelector(".gantt_resource_amount_input");
          if (S.setAttribute("data-checked", w.checked), w.checked) {
            x.nodeName.toLowerCase() === "select" && t.callEvent("onResourcesSelectActivated", [{ target: x }]);
            var E = T, D = b.default_value;
            b.options.forEach(function(I) {
              I.key == E && I.default_value && (D = I.default_value);
            }), C && !C.value && D !== void 0 && (C.value = D, y(b, this)), C.select ? C.select() : C.focus && C.focus();
          } else e.resourcesValues[b.id] && delete e.resourcesValues[b.id][T];
        } else $.target.type !== "text" && $.target.nodeName.toLowerCase() !== "select" || (w.parentNode.parentNode, x = $.target, y(b, this));
      }
      function y($, x) {
        var w = r(), T = x.querySelectorAll(w);
        e.resourcesValues[$.id] = e.resourcesValues[$.id] || {};
        for (var S = 0; S < T.length; S++) {
          var C = T[S].getAttribute("data-item-id"), E = T[S].getAttribute("data-assignment-id");
          T[S].disabled ? delete e.resourcesValues[$.id][C] : e.resourcesValues[$.id][C] = { value: T[S].value, id: E };
        }
      }
      g = Sn(g, 100), o(b).container.addEventListener("keyup", g), o(b).container.addEventListener("input", g, !0), o(b).container.addEventListener("change", g, !0), s(b).addEventListener("input", p), s(b).addEventListener("change", p), t.attachEvent("onResourcesSelectActivated", t.bind(p, s(b))), e.eventsInitialized[b.id] = !0;
    }(l, u, c, this), ht(c.options, function(v, k) {
      c.unassigned_value != v.key && (h = function(b, m, g) {
        var p = {};
        if (m) {
          var y;
          Lt(m) ? y = Ee(m, function($) {
            return $.resource_id == g.key;
          }) : m.resource_id == g.key && (y = m), y && (p.value = y.value, p.id = y.id);
        }
        return e.resourcesValues[b.id] && e.resourcesValues[b.id][g.key] && (p.value = e.resourcesValues[b.id][g.key].value, p.id = e.resourcesValues[b.id][g.key].id), p;
      }(c, d, v), f += ["<label class='gantt_resource_row' data-item-id='" + v.key + "' data-checked=" + (h.value ? "true" : "false") + ">", "<input class='gantt_resource_toggle' type='checkbox'", h.value ? " checked='checked'" : "", "><div class='gantt_resource_cell gantt_resource_cell_checkbox'><span class='matherial_checkbox_icon'></span></div>", "<div class='gantt_resource_cell gantt_resource_cell_label'>", v.label, "</div>", "<div class='gantt_resource_cell gantt_resource_cell_value'>", a(v, h.value, !h.value, h.id), "</div>", "<div class='gantt_resource_cell gantt_resource_cell_unit'>", v.unit, "</div>", "</label>"].join(""));
    }), _.innerHTML = f, _.style.zoom = "1", _._offsetSizes = _.offsetHeight, _.style.zoom = "", t._center_lightbox(t.getLightbox());
  }, i.prototype.get_value = function(l, d, u) {
    for (var c = s(u), h = [], _ = r(!0), f = r(!1), v = o(u), k = t.copy(e.resourcesValues[u.id]) || {}, b = c.querySelectorAll(_), m = c.querySelectorAll(f), g = 0; g < m.length; g++) delete k[m[g].getAttribute("data-item-id")];
    for (g = 0; g < b.length; g++) {
      var p = b[g].getAttribute("data-assignment-id"), y = b[g].getAttribute("data-item-id"), $ = b[g].value.trim();
      $ !== "" && $ !== "0" && (delete k[y], h[h.length] = { resource_id: y, value: $ }, p && (h[h.length - 1] = { ...h[h.length - 1], id: p }));
    }
    if (v.filterApplied) for (var x in k) h[h.length] = { resource_id: x, value: k[x].value, id: k[x].id };
    return h;
  }, i.prototype.focus = function(l) {
    t._focus(l.querySelector(".gantt_resources"));
  }, i;
}
function Jr(t) {
  const n = ot(), e = { resourcesValues: {}, filter: {}, eventsInitialized: {}, gridID: null, resource_filter_value: null, initialValues: [], newValues: [] }, i = { type: "select", map_to: "resource_id", options: t.serverList("resourceOptions") }, a = t.date.date_to_str("%d-%m-%Y");
  function r() {
    return n.apply(this, arguments) || this;
  }
  function s(o) {
    return e.filter[o.id];
  }
  return t.resource_table = { scale_height: 35, row_height: 35, columns: [{ name: "resource", label: "Resource", align: "center", width: 80, editor: i, template: function(o) {
    const l = t.getDatastore(t.config.resource_store).getItem(o.resource_id);
    return l ? l.text : "Unassigned";
  } }, { name: "hours/Day", label: "Hours/Day", align: "center", width: 70, editor: { type: "number", map_to: "value", min: 0, max: 100 }, template: function(o) {
    return o.value ? +o.value : "";
  } }, { name: "start", label: "Start", align: "center", width: 100, template: function(o) {
    return o.start_date ? a(o.start_date) : "";
  } }, { name: "end", label: "End", align: "center", width: 100, template: function(o) {
    return o.end_date ? a(o.end_date) : "";
  } }, { name: "duration", label: "Duration", align: "center", width: 80, template: function(o) {
    return o.duration ? `${o.duration} day${o.duration == 1 ? "" : "s"}` : "";
  } }, { name: "delete", label: "Delete", align: "center", width: 80, template: function(o) {
    return `<div data-assignment-id='${o.id}' data-assignment-delete='${o.id}' class='dhx_gantt_icon dhx_gantt_icon_delete'></div>`;
  } }], resource_default_assignment: { duration: null, value: 8, start_date: null, end_date: null, mode: "default" } }, t.attachEvent("onAfterLightbox", function() {
    for (var o in e.filter) e.filter[o].input.value = "", e.filter[o].filterApplied = !1;
    e.resourcesValues = {}, e.eventsInitialized = {}, e.resource_filter_value = null, e.gridID = null, e.initialValues = [], e.newValues = [];
  }), F(r, n), r.prototype.render = function(o) {
    let l;
    var d;
    return o.options || (o.options = t.serverList("resourceOptions")), o.map_to && o.map_to != "resource_selector" && o.map_to != "auto" || (o.map_to = t.config.resource_property), l = `<div${isNaN(o.height) ? "" : " style='height:auto;'"} class='gantt_section_${o.name}' data-section-name='${o.name}'>`, l += (d = o.index, `<div class='gantt_resource_selector_filter_wrapper gantt_cal_lsection' data-section-name='${o.name}'>
						<div class='gantt_cal_ltext gantt_resources_filter'>
							<label class="dhx_gantt_icon dhx_gantt_icon_search">
								<input type='text' class='gantt_resources_filter_input' placeholder='${t.locale.labels.resources_filter_placeholder || "Search..."}' tab-index="-1"> 
							<label>
						</div>
						<div role='button' aria-label='Add Assignment' class='gantt_custom_button gantt_add_resources' data-index='${d}'><div class='gantt_custom_button_add_resources gantt_add'></div><div class='gantt_custom_button_label'>${t.locale.labels.resources_add_button}</div>
						</div>
					</div>`), l += "</div>", l += `<div class="resources_section_placeholder" style='display:none;'>${t.locale.labels.resources_section_placeholder}</div>`, l;
  }, r.prototype.button_click = function(o, l, d, u) {
    const c = d.getAttribute("data-section-name") || u.getAttribute("data-section-name"), h = document.querySelector("[data-resource-selector-section]"), _ = document.querySelector(".resources_section_placeholder"), f = document.querySelector(`.gantt_section_${c} .gantt_resource_selector_filter_wrapper`), v = document.querySelector(`.gantt_section_${c} .gantt_grid`);
    if (h.style.display = "none", t.callEvent("onSectionButton", [t._lightbox_id, d]) !== !1 && l.closest(".gantt_custom_button.gantt_add_resources")) {
      _.style.display = "none";
      const k = t.getDatastore("temp_resource_assignment_store");
      k && k.getItems().length == 0 && (f.style.display = "flex", v.style.display = "block"), function(b) {
        let m;
        const g = t.getTask(t._lightbox_id), p = t.getTaskAssignments(g.id);
        if (p.length) m = p[0].resource_id;
        else {
          const x = t.serverList("resourceOptions");
          if (!x.length) throw new Error(`There is no any resources in resource store, please check your data:
					https://docs.dhtmlx.com/gantt/desktop__resource_management.html#assigningresources`);
          m = x[0].id;
        }
        const y = t.getDatastore("temp_resource_assignment_store"), $ = (t.getLightboxSection(b).section.config ?? t.resource_table).resource_default_assignment ?? t.resource_table.resource_default_assignment;
        y.addItem({ resource_id: m, task_id: g.id, duration: $.duration ?? t.calculateDuration(g), value: $.value, start_date: $.start_date ?? g.start_date, end_date: $.end_date ?? g.end_date, mode: $.mode }), t.refreshData();
      }(c), function(b) {
        const m = b.querySelectorAll(".gantt_row.gantt_row_task");
        if (m) {
          const g = m[m.length - 1].querySelector(".gantt_cell");
          if (g) {
            const { id: p, columnName: y } = t.ext.inlineEditorsLightbox.locateCell(g);
            p && y && t.ext.inlineEditorsLightbox.startEdit(p, y);
          }
        }
      }(u);
    }
  }, r.prototype.set_value = function(o, l, d, u, c) {
    let h = document.querySelector("[data-resource-selector-section]"), _ = document.querySelector(".resources_section_placeholder");
    if (function(v) {
      e.initialValues = [], e.newValues = [];
      const k = t.$data.assignmentsStore.find(function(b) {
        return b.task_id == v.id;
      });
      for (let b = 0; b < k.length; b++) e.initialValues[b] = { resource_id: k[b].resource_id, value: k[b].value, id: k[b].id };
    }(d), !c) {
      (function(b, m, g, p) {
        if (t.$ui.getView("GridRL") && !e.gridID && t.$ui.getView("GridRL").destructor(), !e.gridID) {
          const y = document.createElement("div");
          y.classList.add("gantt_resource_selector_grid");
          const $ = t.createDatastore({ name: "temp_resource_assignment_store", initItem: function(D) {
            return D.id || (D.id = t.uid()), D;
          } });
          t.$data.tempAssignmentsStore = $;
          const x = { ...t.config.layout, id: "GridRL", sectionName: p.name }, w = t.$ui.createView("GridRL", t.$root, x);
          w.init(y);
          const T = t._lightbox.offsetWidth - (t.config.wide_form ? 150 : 0);
          w.setSize(T, "auto"), t.ext.inlineEditorsLightbox = t.ext._inlineEditors.createEditors(w), t.ext.inlineEditorsLightbox.init(), e.gridID = w.$id, b.appendChild(y);
          const S = t.getDatastore(t.config.resource_assignment_store), C = [];
          S.eachItem(function(D) {
            D.task_id && D.task_id == g.id && C.push(D);
          });
          const E = structuredClone(C);
          $.parse(E);
        }
        t.$data.tempAssignmentsStore.attachEvent("onFilterItem", function(y, $) {
          return $.task_id == g.id && (!e.resource_filter_value || t.getDatastore(t.config.resource_store).getItem($.resource_id).text.toLowerCase().indexOf(e.resource_filter_value) > -1);
        }), t.refreshData();
      })(o, 0, d, u), function(b, m) {
        if (!e.filter[m.id]) {
          var g = b.querySelector(".gantt_resources_filter"), p = g.querySelector(".gantt_resources_filter_input");
          e.filter[m.id] = { container: g, input: p, filterApplied: !1 };
        }
        e.filter[m.id];
      }(o, u), function(b, m, g, p) {
        if (e.eventsInitialized[g.id]) return;
        var y = function(x) {
          var w, T, S;
          $(g, b);
          var C = s(g);
          S = C.input, T = S.value.trim(), e.resource_filter_value = T.toLowerCase(), C.filterApplied = !!T, t.getState().lightbox && (m = t.getLightboxValues()), w = function(D, I, M) {
            var A, L = t.copy(D);
            if (M === "") {
              L.resources = [];
              let N = e.newValues.map((P) => P.resource_id);
              if (N && N.length > 0) for (let P = 0; P < N.length; P++) {
                let R = t.getDatastore(t.config.resource_store).getItem(N[P]);
                R && L.resources.push(R);
              }
              return L;
            }
            return A = function(N) {
              if (N.text.toLowerCase().indexOf(M.toLowerCase()) >= 0) return N;
            }, L.resources = function(N) {
              let P = [];
              const R = t.getDatastore("temp_resource_assignment_store"), O = R.find(function(B) {
                return B.task_id == N.id;
              });
              for (let B = 0; B < O.length; B++) {
                let z = t.getDatastore(t.config.resource_store).getItem(O[B].resource_id);
                z && P.push(z);
              }
              return P;
            }(I, D.options), L.resources = wn(L.resources, A), L;
          }(g, m, T);
          var E = m[g.map_to];
          p.form_blocks.resource_selector.set_value(b, E, m, w);
        };
        function $(x, w) {
          var T = ".gantt_resource_amount_input", S = w.querySelectorAll(T);
          e.resourcesValues[x.id] = e.resourcesValues[x.id] || {};
          for (var C = 0; C < S.length; C++) {
            var E = S[C].getAttribute("data-item-id"), D = S[C].getAttribute("data-assignment-id");
            S[C].disabled ? delete e.resourcesValues[x.id][E] : e.resourcesValues[x.id][E] = { value: S[C].value, id: D };
          }
        }
        y = Sn(y, 100), s(g).container.addEventListener("keyup", y), s(g).container.addEventListener("input", y, !0), s(g).container.addEventListener("change", y, !0), e.eventsInitialized[g.id] = !0;
      }(o, l, u, this), h.style.display = "none";
      let v = document.querySelector(`.gantt_section_${u.name} .gantt_grid`), k = document.querySelector(`.gantt_section_${u.name} .gantt_resource_selector_filter_wrapper`);
      v.style.display = "none", k.style.display = "none";
    }
    const f = t.getDatastore("temp_resource_assignment_store");
    if (f) {
      let v = document.querySelector(`.gantt_section_${u.name} .gantt_resource_selector_filter_wrapper`), k = document.querySelector(`.gantt_section_${u.name} .gantt_grid`);
      f.getItems().length == 0 ? (h.style.display == "none" && (h.style.display = "flex"), v.style.display = "none", k.style.display = "none", _.style.display = "block") : (v.style.display = "flex", k.style.display = "block", _.style.display = "none");
    }
    t._center_lightbox(t.getLightbox());
  }, r.prototype.get_value = function(o, l, d, u) {
    const c = t.getDatastore("temp_resource_assignment_store").find(function(h) {
      return h.task_id == l.id;
    });
    for (let h = 0; h < c.length; h++) e.newValues[h] = { resource_id: c[h].resource_id.toString(), value: c[h].value, id: c[h].id, start_date: c[h].start_date, end_date: c[h].end_date, duration: c[h].duration, mode: c[h].mode, delay: c[h].delay };
    return u == "save" ? e.newValues : e.initialValues;
  }, r;
}
function Kr(t) {
  var n = function() {
    const g = ot();
    function p() {
      return g.apply(this, arguments) || this;
    }
    return F(p, g), p.prototype.render = function(y) {
      let $ = y.height ? `${y.height}px` : "";
      return `<div class='gantt_cal_ltext gantt_cal_template gantt_section_${y.name}' ${$ ? `style='height:${$};'` : ""}></div>`;
    }, p.prototype.set_value = function(y, $) {
      y.innerHTML = $ || "";
    }, p.prototype.get_value = function(y) {
      return y.innerHTML || "";
    }, p.prototype.focus = function() {
    }, p;
  }(), e = function(g) {
    const p = ot();
    function y() {
      return p.apply(this, arguments) || this;
    }
    return F(y, p), y.prototype.render = function($) {
      const x = ($.height || "130") + "px", w = $.placeholder ? `placeholder='${$.placeholder}'` : "";
      return `<div class='gantt_cal_ltext gantt_section_${$.name}' style='height:${x};' ${w}><textarea></textarea></div>`;
    }, y.prototype.set_value = function($, x) {
      g.form_blocks.textarea._get_input($).value = x || "";
    }, y.prototype.get_value = function($) {
      return g.form_blocks.textarea._get_input($).value;
    }, y.prototype.focus = function($) {
      var x = g.form_blocks.textarea._get_input($);
      g._focus(x, !0);
    }, y.prototype._get_input = function($) {
      return $.querySelector("textarea");
    }, y;
  }(t), i = function(g) {
    const p = ot();
    function y() {
      return p.apply(this, arguments) || this;
    }
    return F(y, p), y.prototype.render = function($) {
      var x = g.form_blocks.getTimePicker.call(this, $);
      let w = "gantt_section_time";
      $.name !== "time" && (w += " gantt_section_" + $.name);
      var T = "<div style='padding-top:0px;font-size:inherit;text-align:center;' class='" + w + "'>";
      return T += x, $.single_date ? (x = g.form_blocks.getTimePicker.call(this, $, !0), T += "<span></span>") : T += "<span class='gantt_section_time_spacer'> &nbsp;&ndash;&nbsp; </span>", (T += x) + "</div>";
    }, y.prototype.set_value = function($, x, w, T) {
      var S = T, C = $.getElementsByTagName("select"), E = T._time_format_order;
      if (S.auto_end_date) for (var D = function() {
        A = new Date(C[E[2]].value, C[E[1]].value, C[E[0]].value, 0, 0), L = g.calculateEndDate({ start_date: A, duration: 1, task: w }), g.form_blocks._fill_lightbox_select(C, E.size, L, E, S);
      }, I = 0; I < 4; I++) C[I].onchange = D;
      var M = g._resolve_default_mapping(T);
      typeof M == "string" && (M = { start_date: M });
      var A = w[M.start_date] || /* @__PURE__ */ new Date(), L = w[M.end_date] || g.calculateEndDate({ start_date: A, duration: 1, task: w });
      g.form_blocks._fill_lightbox_select(C, 0, A, E, S), g.form_blocks._fill_lightbox_select(C, E.size, L, E, S);
    }, y.prototype.get_value = function($, x, w) {
      var T, S = $.getElementsByTagName("select"), C = w._time_format_order;
      return T = g.form_blocks.getTimePickerValue(S, w), typeof g._resolve_default_mapping(w) == "string" ? T : { start_date: T, end_date: function(E, D, I) {
        var M = g.form_blocks.getTimePickerValue(E, w, D.size);
        return M <= I && (w.autofix_end !== !1 || w.single_date) ? g.date.add(I, g._get_timepicker_step(), "minute") : M;
      }(S, C, T) };
    }, y.prototype.focus = function($) {
      g._focus($.getElementsByTagName("select")[0]);
    }, y;
  }(t), a = Be(t), r = function(g) {
    var p = ot();
    function y() {
      return p.apply(this, arguments) || this;
    }
    return F(y, p), y.prototype.render = function($) {
      const x = $.height ? `height:${$.height}px;` : "";
      let w = `<div class='gantt_cal_ltext gantt_cal_lcheckbox gantt_section_${$.name}' ${x ? `style='${x}'` : ""}>`;
      if ($.options && $.options.length) for (var T = 0; T < $.options.length; T++) w += "<label><input type='checkbox' value='" + $.options[T].key + "' name='" + $.name + "'>" + $.options[T].label + "</label>";
      else $.single_value = !0, w += "<label><input type='checkbox' name='" + $.name + "'></label>";
      return w += "</div>", w;
    }, y.prototype.set_value = function($, x, w, T) {
      var S = Array.prototype.slice.call($.querySelectorAll("input[type=checkbox]"));
      !$._dhx_onchange && T.onchange && ($.onchange = T.onchange, $._dhx_onchange = !0), T.single_value ? S[0].checked = !!x : ht(S, function(C) {
        C.checked = !!x && x.indexOf(C.value) >= 0;
      });
    }, y.prototype.get_value = function($, x, w) {
      return w.single_value ? $.querySelector("input[type=checkbox]").checked : function(T, S) {
        if (T.map) return T.map(S);
        for (var C = T.slice(), E = [], D = 0; D < C.length; D++) E.push(S(C[D], D));
        return E;
      }(Array.prototype.slice.call($.querySelectorAll("input[type=checkbox]:checked")), function(T) {
        return T.value;
      });
    }, y.prototype.focus = function($) {
      g._focus($.querySelector("input[type=checkbox]"));
    }, y;
  }(t), s = function(g) {
    const p = ot();
    function y() {
      return p.apply(this, arguments) || this;
    }
    return F(y, p), y.prototype.render = function($) {
      const x = $.height ? `${$.height}px` : "";
      let w = `<div class='gantt_cal_ltext gantt_cal_lradio gantt_section_${$.name}' ${x ? `style='height:${x};'` : ""}>`;
      if ($.options && $.options.length) for (var T = 0; T < $.options.length; T++) w += "<label><input type='radio' value='" + $.options[T].key + "' name='" + $.name + "'>" + $.options[T].label + "</label>";
      return w += "</div>", w;
    }, y.prototype.set_value = function($, x, w, T) {
      var S;
      T.options && T.options.length && (S = $.querySelector("input[type=radio][value='" + x + "']") || $.querySelector("input[type=radio][value='" + T.default_value + "']")) && (!$._dhx_onchange && T.onchange && ($.onchange = T.onchange, $._dhx_onchange = !0), S.checked = !0);
    }, y.prototype.get_value = function($, x) {
      var w = $.querySelector("input[type=radio]:checked");
      return w ? w.value : "";
    }, y.prototype.focus = function($) {
      g._focus($.querySelector("input[type=radio]"));
    }, y;
  }(t), o = function(g) {
    var p = ot();
    function y() {
      return p.apply(this, arguments) || this;
    }
    function $(T) {
      return T.formatter || new re();
    }
    function x(T, S) {
      var C = T.getElementsByTagName("select"), E = S._time_format_order, D = 0, I = 0;
      if (g.defined(E[3])) {
        var M = C[E[3]], A = parseInt(M.value, 10);
        isNaN(A) && M.hasAttribute("data-value") && (A = parseInt(M.getAttribute("data-value"), 10)), D = Math.floor(A / 60), I = A % 60;
      }
      return new Date(C[E[2]].value, C[E[1]].value, C[E[0]].value, D, I);
    }
    function w(T, S) {
      var C = T.getElementsByTagName("input")[1];
      return (C = $(S).parse(C.value)) && !window.isNaN(C) || (C = 1), C < 0 && (C *= -1), C;
    }
    return F(y, p), y.prototype.render = function(T) {
      var S = "<div class='gantt_time_selects'>" + g.form_blocks.getTimePicker.call(this, T) + "</div>", C = " " + g.locale.labels[g.config.duration_unit + "s"] + " ", E = T.single_date ? " style='display:none'" : "", D = T.readonly ? " disabled='disabled'" : "", I = g._waiAria.lightboxDurationInputAttrString(T), M = "gantt_duration_value";
      T.formatter && (C = "", M += " gantt_duration_value_formatted");
      var A = "<div class='gantt_duration' " + E + "><div class='gantt_duration_inputs'><input type='button' class='gantt_duration_dec' value='−'" + D + "><input type='text' value='5days' class='" + M + "'" + D + " " + I + "><input type='button' class='gantt_duration_inc' value='+'" + D + "></div><div class='gantt_duration_end_date'>" + C + "<span></span></div></div></div>";
      let L = "gantt_section_time gantt_section_duration";
      return T.name !== "time" && (L += " gantt_section_" + T.name), "<div style='padding-top:0px;font-size:inherit;' class='" + L + "'>" + S + " " + A + "</div>";
    }, y.prototype.set_value = function(T, S, C, E) {
      var D, I, M, A, L = T.getElementsByTagName("select"), N = T.getElementsByTagName("input"), P = N[1], R = [N[0], N[2]], O = T.getElementsByTagName("span")[0], B = E._time_format_order;
      function z() {
        var W = x.call(g, T, E), G = w.call(g, T, E), bt = g.calculateEndDate({ start_date: W, duration: G, task: C }), Ht = g.templates.task_end_date || g.templates.task_date;
        O.innerHTML = Ht(bt);
      }
      function K(W) {
        var G = P.value;
        G = $(E).parse(G), window.isNaN(G) && (G = 0), (G += W) < 1 && (G = 1), P.value = $(E).format(G), z();
      }
      R[0].onclick = g.bind(function() {
        K(-1 * g.config.duration_step);
      }, this), R[1].onclick = g.bind(function() {
        K(1 * g.config.duration_step);
      }, this), L[0].onchange = z, L[1].onchange = z, L[2].onchange = z, L[3] && (L[3].onchange = z), P.onkeydown = g.bind(function(W) {
        var G;
        return (G = (W = W || window.event).charCode || W.keyCode || W.which) == g.constants.KEY_CODES.DOWN ? (K(-1 * g.config.duration_step), !1) : G == g.constants.KEY_CODES.UP ? (K(1 * g.config.duration_step), !1) : void window.setTimeout(z, 1);
      }, this), P.onchange = g.bind(z, this), typeof (D = g._resolve_default_mapping(E)) == "string" && (D = { start_date: D }), I = C[D.start_date] || /* @__PURE__ */ new Date(), M = C[D.end_date] || g.calculateEndDate({ start_date: I, duration: 1, task: C }), A = Math.round(C[D.duration]) || g.calculateDuration({ start_date: I, end_date: M, task: C }), A = $(E).format(A), g.form_blocks._fill_lightbox_select(L, 0, I, B, E), P.value = A, z();
    }, y.prototype.get_value = function(T, S, C) {
      var E = x(T, C), D = w(T, C), I = g.calculateEndDate({ start_date: E, duration: D, task: S });
      return typeof g._resolve_default_mapping(C) == "string" ? E : (g.getScale().projection && g.getCalendar("timescale-projection-calendar") && (E = g.getCalendar("timescale-projection-calendar").getClosestWorkTime({ date: E, unit: g.config.duration_unit, dir: "future" })), { start_date: E, end_date: I, duration: D });
    }, y.prototype.focus = function(T) {
      g._focus(T.getElementsByTagName("select")[0]);
    }, y;
  }(t), l = qr(t), d = Yr(t), u = function(g) {
    var p = ot();
    function y() {
      return p.apply(this, arguments) || this;
    }
    function $(w) {
      return !w || w === g.config.constraint_types.ASAP || w === g.config.constraint_types.ALAP;
    }
    function x(w, T) {
      for (var S = $(T), C = 0; C < w.length; C++) w[C].disabled = S;
    }
    return F(y, p), y.prototype.render = function(w) {
      const T = w.height ? `height:${w.height}px;` : "";
      let S = `<div class='gantt_cal_ltext gantt_section_${w.name}' ${T ? `style='${T}'` : ""}>`;
      var C = [];
      for (var E in g.config.constraint_types) C.push({ key: g.config.constraint_types[E], label: g.locale.labels[g.config.constraint_types[E]] });
      return w.options = w.options || C, S += "<span data-constraint-type-select>" + ae.getHtmlSelect(w.options, [{ key: "data-type", value: "constraint-type" }]) + "</span>", S += "<label data-constraint-time-select>" + (g.locale.labels.constraint_date || "Constraint date") + ": " + g.form_blocks.getTimePicker.call(this, w) + "</label>", S += "</div>", S;
    }, y.prototype.set_value = function(w, T, S, C) {
      var E = w.querySelector("[data-constraint-type-select] select"), D = w.querySelectorAll("[data-constraint-time-select] select"), I = C._time_format_order, M = g._resolve_default_mapping(C);
      E._eventsInitialized || (E.addEventListener("change", function(N) {
        x(D, N.target.value);
      }), E._eventsInitialized = !0);
      var A = S[M.constraint_date] || /* @__PURE__ */ new Date();
      g.form_blocks._fill_lightbox_select(D, 0, A, I, C);
      var L = S[M.constraint_type] || g.getConstraintType(S);
      E.value = L, x(D, L);
    }, y.prototype.get_value = function(w, T, S) {
      var C = w.querySelector("[data-constraint-type-select] select"), E = w.querySelectorAll("[data-constraint-time-select] select"), D = C.value, I = null;
      return $(D) || (I = g.form_blocks.getTimePickerValue(E, S)), { constraint_type: D, constraint_date: I };
    }, y.prototype.focus = function(w) {
      g._focus(w.querySelector("select"));
    }, y;
  }(t), c = function(g) {
    const p = Be(g);
    function y() {
      return p.apply(this, arguments) || this;
    }
    return F(y, p), y.prototype.render = function($) {
      var x = g.config.types, w = g.locale.labels, T = [], S = $.filter || function(D, I) {
        return !x.placeholder || I !== x.placeholder;
      };
      for (var C in x) !S(C, x[C]) == 0 && T.push({ key: x[C], label: w["type_" + C] });
      $.options = T;
      var E = $.onchange;
      return $.onchange = function() {
        g._lightbox_current_type = this.value, g.changeLightboxType(this.value), typeof E == "function" && E.apply(this, arguments);
      }, p.prototype.render.apply(this, arguments);
    }, y;
  }(t), h = function(g) {
    var p = ot();
    function y() {
      return p.apply(this, arguments) || this;
    }
    function $(S) {
      return S.formatter || new re();
    }
    function x(S, C, E, D) {
      const I = "<div class='gantt_time_selects'>" + g.form_blocks.getTimePicker.call(g, D) + "</div>";
      let M = " " + g.locale.labels[g.config.duration_unit + "s"] + " ";
      const A = D.single_date ? " style='display:none'" : "", L = D.readonly ? " disabled='disabled'" : "", N = g._waiAria.lightboxDurationInputAttrString(D), P = g.locale.labels.baselines_remove_button;
      let R = "gantt_duration_value";
      D.formatter && (M = "", R += " gantt_duration_value_formatted");
      const O = "<div class='gantt_duration' " + A + "><div class='gantt_duration_inputs'><input type='button' class='gantt_duration_dec' value='-'" + L + "><input type='text' value='5days' class='" + R + "'" + L + " " + N + "><input type='button' class='gantt_duration_inc' value='+'" + L + "></div><div class='gantt_duration_end_date'>" + M + "<span></span></div></div></div>", B = `<div><div class='baseline_delete_button gantt_custom_button dhx_gantt_icon dhx_gantt_icon_delete' aria-label='${P}'></div></div>`, z = document.createElement("div");
      z.className = "gantt_section_time gantt_section_duration", z.setAttribute("data-baseline-id", C.id), z.innerHTML = I + O + B + "<br>", S.appendChild(z);
      var K, W, G, bt = z.getElementsByTagName("select"), Ht = z.getElementsByTagName("input"), Ot = Ht[1], Ke = [Ht[0], Ht[2]], ri = z.getElementsByTagName("span")[0], si = D._time_format_order;
      function $t() {
        var mt = w.call(g, z, D), X = T.call(g, z, D), oi = g.calculateEndDate({ start_date: mt, duration: X, task: E }), li = g.templates.task_end_date || g.templates.task_date;
        ri.innerHTML = li(oi);
      }
      function qt(mt) {
        var X = Ot.value;
        X = $(D).parse(X), window.isNaN(X) && (X = 0), (X += mt) < 1 && (X = 1), Ot.value = $(D).format(X), $t();
      }
      z.querySelector(".baseline_delete_button").onclick = function(mt) {
        const X = z.parentNode;
        z.innerHTML = "", z.remove(), X.innerHTML === "" && (X.innerHTML = g.locale.labels.baselines_section_placeholder);
      }, Ke[0].onclick = g.bind(function() {
        qt(-1 * g.config.duration_step);
      }, g), Ke[1].onclick = g.bind(function() {
        qt(1 * g.config.duration_step);
      }, g), bt[0].onchange = $t, bt[1].onchange = $t, bt[2].onchange = $t, bt[3] && (bt[3].onchange = $t), Ot.onkeydown = g.bind(function(mt) {
        var X;
        return (X = (mt = mt || window.event).charCode || mt.keyCode || mt.which) == g.constants.KEY_CODES.DOWN ? (qt(-1 * g.config.duration_step), !1) : X == g.constants.KEY_CODES.UP ? (qt(1 * g.config.duration_step), !1) : void window.setTimeout($t, 1);
      }, g), Ot.onchange = g.bind($t, g), g._resolve_default_mapping(D), K = C.start_date || /* @__PURE__ */ new Date(), W = C.end_date || g.calculateEndDate({ start_date: K, duration: 1, task: E }), G = g.calculateDuration({ start_date: K, end_date: W, task: E }), G = $(D).format(G), g.form_blocks._fill_lightbox_select(bt, 0, K, si, D), Ot.value = G, $t();
    }
    function w(S, C) {
      var E = S.getElementsByTagName("select"), D = C._time_format_order, I = 0, M = 0;
      if (g.defined(D[3])) {
        var A = E[D[3]], L = parseInt(A.value, 10);
        isNaN(L) && A.hasAttribute("data-value") && (L = parseInt(A.getAttribute("data-value"), 10)), I = Math.floor(L / 60), M = L % 60;
      }
      return new Date(E[D[2]].value, E[D[1]].value, E[D[0]].value, I, M);
    }
    function T(S, C) {
      var E = S.getElementsByTagName("input")[1];
      return (E = $(C).parse(E.value)) && !window.isNaN(E) || (E = 1), E < 0 && (E *= -1), E;
    }
    return F(y, p), y.prototype.render = function(S) {
      return `<div style='height: ${S.height || 110}px; font-size:inherit;' class='gantt_section_baselines'></div>`;
    }, y.prototype.set_value = function(S, C, E, D) {
      E.baselines ? (S.innerHTML = "", E.baselines.forEach((I) => {
        x(S, I, E, D);
      })) : S.innerHTML = g.locale.labels.baselines_section_placeholder;
    }, y.prototype.get_value = function(S, C, E) {
      const D = [];
      return S.querySelectorAll("[data-baseline-id]").forEach((I) => {
        const M = I.dataset.baselineId;
        let A, L = g.getDatastore("baselines").getItem(M);
        A = L ? g.copy(L) : { id: g.uid(), task_id: C.id, text: "Baseline 1" }, A.start_date = w(I, E), A.duration = T(I, E), A.end_date = g.calculateEndDate({ start_date: A.start_date, duration: A.duration, task: C }), D.push(A);
      }), D;
    }, y.prototype.button_click = function(S, C, E, D) {
      if (g.callEvent("onSectionButton", [g._lightbox_id, E]) !== !1 && (C.closest(".gantt_custom_button.gantt_remove_baselines") && (D.innerHTML = g.locale.labels.baselines_section_placeholder), C.closest(".gantt_custom_button.gantt_add_baselines"))) {
        D.innerHTML == g.locale.labels.baselines_section_placeholder && (D.innerHTML = "");
        const I = g.getTask(g._lightbox_id);
        x(D, { id: g.uid(), task_id: I.id, start_date: I.start_date, end_date: I.end_date }, I, g._get_typed_lightbox_config()[S]);
      }
    }, y.prototype.focus = function(S) {
      g._focus(S.getElementsByTagName("select")[0]);
    }, y;
  }(t), _ = Jr(t);
  t._lightbox_methods = {}, t._lightbox_template = "<div class='gantt_cal_ltitle'><span class='gantt_mark'>&nbsp;</span><span class='gantt_time'></span><span class='gantt_title'></span></div><div class='gantt_cal_larea'></div>", t._lightbox_template = `<div class='gantt_cal_ltitle'><div class="dhx_cal_ltitle_descr"><span class='gantt_mark'>&nbsp;</span><span class='gantt_time'></span><span class='dhx_title'></span>
</div>
<div class="gantt_cal_ltitle_controls">
	<a class="gantt_cal_ltitle_close_btn dhx_gantt_icon dhx_gantt_icon_close"></a>

</div></div><div class='gantt_cal_larea'></div>`, t._lightbox_root = t.$root, t.$services.getService("state").registerProvider("lightbox", function() {
    return { lightbox: t._lightbox_id };
  }), t.showLightbox = function(g) {
    var p = this.getTask(g);
    if (this.callEvent("onBeforeLightbox", [g])) {
      var y = this.getLightbox(this.getTaskType(p.type));
      this.showCover(y), this._fill_lightbox(g, y), this._setLbPosition(y), this._waiAria.lightboxVisibleAttr(y), this.callEvent("onLightbox", [g]);
    } else t.isTaskExists(g) && t.getTask(g).$new && this.$data.tasksStore._updateOrder();
  }, t._get_timepicker_step = function() {
    if (this.config.round_dnd_dates) {
      var g;
      if (function(y) {
        var $ = y.$ui.getView("timeline");
        return !(!$ || !$.isVisible());
      }(this)) {
        var p = t.getScale();
        g = Zt(p.unit) * p.step / 60;
      }
      return (!g || g >= 1440) && (g = this.config.time_step), g;
    }
    return this.config.time_step;
  }, t.getLabel = function(g, p) {
    for (var y = this._get_typed_lightbox_config(), $ = 0; $ < y.length; $++) if (y[$].map_to == g) {
      for (var x = y[$].options, w = 0; w < x.length; w++) if (x[w].key == p) return x[w].label;
    }
    return "";
  }, t.updateCollection = function(g, p) {
    p = p.slice(0);
    var y = t.serverList(g);
    if (!y) return !1;
    y.splice(0, y.length), y.push.apply(y, p || []), t.resetLightbox();
  }, t.getLightboxType = function() {
    return this.getTaskType(this._lightbox_type);
  }, t.getLightbox = function(g) {
    var p, y, $, x, w, T = "";
    if (t.config.csp === !0 || t.env.isSalesforce ? t._lightbox_root = t.$root : t._lightbox_root = document.body, g === void 0 && (g = this.getLightboxType()), !this._lightbox || this.getLightboxType() != this.getTaskType(g)) {
      this._lightbox_type = this.getTaskType(g), p = document.createElement("div"), T = "gantt_cal_light", y = this._is_lightbox_timepicker(), t.config.wide_form && (T += " gantt_cal_light_wide"), y && (T += " gantt_cal_light_full"), p.className = T, p.style.visibility = "hidden", $ = this._lightbox_template, $ += "<div class='gantt_cal_lcontrols'>", $ += k(this.config.buttons_left), $ += "<div class='gantt_cal_lcontrols_push_right'></div>", $ += k(this.config.buttons_right), $ += "</div>", p.innerHTML = $, t._waiAria.lightboxAttr(p), t.config.drag_lightbox && (p.firstChild.onmousedown = t._ready_to_dnd, p.firstChild.addEventListener("touchstart", function(C) {
        t._ready_to_dnd(C.touches[0]);
      }), p.firstChild.onselectstart = function() {
        return !1;
      }, p.firstChild.style.cursor = "pointer", t._init_dnd_events()), this._lightbox && this.resetLightbox(), f(), this._cover.insertBefore(p, this._cover.firstChild), this._lightbox = p, x = this._get_typed_lightbox_config(g), $ = this._render_sections(x);
      var S = (w = p.querySelector("div.gantt_cal_larea")).style.overflow;
      w.style.overflow = "hidden", w.innerHTML = $, function(C) {
        var E, D, I, M, A, L;
        for (L = 0; L < C.length; L++) E = C[L], I = t._lightbox_root.querySelector("#" + E.id), E.id && I && (D = I.querySelector("label"), (M = I.nextSibling) && (A = M.querySelector("input, select, textarea")) && (A.id = A.id || "input_" + t.uid(), E.inputId = A.id, D.setAttribute("for", E.inputId)));
      }(x), w.style.overflow = S, this._init_lightbox_events(this), p.style.display = "none", p.style.visibility = "visible";
    }
    return this._lightbox;
  }, t._render_sections = function(g) {
    for (var p = "", y = 0; y < g.length; y++) {
      var $ = this.form_blocks[g[y].type];
      if ($) {
        g[y].id = "area_" + this.uid();
        var x = g[y].hidden ? " style='display:none'" : "", w = "";
        g[y].button && (w = "<div class='gantt_custom_button' data-index='" + y + "'><div class='gantt_custom_button_" + g[y].button + "'></div><div class='gantt_custom_button_label'>" + this.locale.labels["button_" + g[y].button] + "</div></div>"), g[y].type == "baselines" && (w = "<div class='gantt_custom_button gantt_remove_baselines' data-index='" + y + "'><div class='gantt_custom_button_delete_baselines'></div><div class='gantt_custom_button_label'>" + this.locale.labels.baselines_remove_all_button + "</div></div><div class='gantt_custom_button gantt_add_baselines' data-index='" + y + "'><div class='gantt_custom_button_add_baseline'></div><div class='gantt_custom_button_label'>" + this.locale.labels.baselines_add_button + "</div></div>"), g[y].type == "resource_selector" && (g[y].index = y, w = `<div class='gantt_custom_button gantt_add_resources' data-index='${y}' data-resource-selector-section='${y}' data-section-name='${g.name}'><div class='gantt_custom_button_add_resources gantt_add'></div><div class='gantt_custom_button_label'>${this.locale.labels.resources_add_button}</div></div>`), this.config.wide_form && (p += "<div class='gantt_wrap_section' " + x + ">"), p += "<div id='" + g[y].id + "' class='gantt_cal_lsection'><label>" + w + (g[y].label || this.locale.labels["section_" + g[y].name] || g[y].name) + "</label></div>" + $.render.call(this, g[y]), p += "</div>";
      }
    }
    return p;
  }, t._center_lightbox = function(g) {
    t._setLbPosition(g);
  }, t._setLbPosition = function(g) {
    if (!g) return;
    const p = t._lightbox_root || t.$root;
    g.style.top = Math.max(p.offsetHeight / 2 - g.offsetHeight / 2, 0) + "px", g.style.left = Math.max(p.offsetWidth / 2 - g.offsetWidth / 2, 0) + "px";
  }, t.showCover = function(g) {
    g && (g.style.display = "block", this._setLbPosition(g)), f(), this._cover.style.display = "";
  };
  const f = function() {
    t._cover || (t._cover = document.createElement("div"), t._cover.className = "gantt_cal_cover", t._cover.style.display = "none", t.event(t._cover, "mousemove", t._move_while_dnd), t.event(t._cover, "mouseup", t._finish_dnd), (t._lightbox_root || t.$root).appendChild(t._cover));
  };
  function v(g) {
    for (var p in this.config.types) if (this.config.types[p] == g) return p;
    return "task";
  }
  function k(g, p) {
    var y, $, x = "";
    for ($ = 0; $ < g.length; $++) y = t.config._migrate_buttons[g[$]] ? t.config._migrate_buttons[g[$]] : g[$], x += "<div " + t._waiAria.lightboxButtonAttrString(y) + " class='gantt_btn_set gantt_left_btn_set " + y + "_set'><div dhx_button='1' data-dhx-button='1' class='" + y + "'></div><div>" + t.locale.labels[y] + "</div></div>";
    return x;
  }
  function b(g) {
    var p, y;
    return g.time_format ? g.time_format : (y = ["%d", "%m", "%Y"], Zt((p = t.getScale()) ? p.unit : t.config.duration_unit) < Zt("day") && y.push("%H:%i"), y);
  }
  function m(g, p, y) {
    var $, x, w, T, S, C, E = "";
    switch (y.timeFormat[p]) {
      case "%Y":
        for (g._time_format_order[2] = p, g._time_format_order.size++, g.year_range && (isNaN(g.year_range) ? g.year_range.push && (w = g.year_range[0], T = g.year_range[1]) : $ = g.year_range), $ = $ || 10, x = x || Math.floor($ / 2), w = w || y.date.getFullYear() - x, T = T || t.getState().max_date.getFullYear() + x, S = w; S <= T; S++) E += "<option value='" + S + "'>" + S + "</option>";
        break;
      case "%m":
        for (g._time_format_order[1] = p, g._time_format_order.size++, S = 0; S < 12; S++) E += "<option value='" + S + "'>" + t.locale.date.month_full[S] + "</option>";
        break;
      case "%d":
        for (g._time_format_order[0] = p, g._time_format_order.size++, S = 1; S < 32; S++) E += "<option value='" + S + "'>" + S + "</option>";
        break;
      case "%H:%i":
        for (g._time_format_order[3] = p, g._time_format_order.size++, S = y.first, C = y.date.getDate(), g._time_values = []; S < y.last; ) E += "<option value='" + S + "'>" + t.templates.time_picker(y.date) + "</option>", g._time_values.push(S), y.date.setTime(y.date.valueOf() + 60 * t._get_timepicker_step() * 1e3), S = 24 * (y.date.getDate() != C ? 1 : 0) * 60 + 60 * y.date.getHours() + y.date.getMinutes();
    }
    return E;
  }
  t._init_lightbox_events = function() {
    t.lightbox_events = {}, t.lightbox_events.gantt_save_btn = function() {
      t._save_lightbox();
    }, t.lightbox_events.gantt_delete_btn = function() {
      t._lightbox_current_type = null, t.callEvent("onLightboxDelete", [t._lightbox_id]) && (t.isTaskExists(t._lightbox_id) ? t.$click.buttons.delete(t._lightbox_id) : t.hideLightbox());
    }, t.lightbox_events.gantt_cancel_btn = function() {
      t._cancel_lightbox();
    }, t.lightbox_events.default = function(g, p) {
      if (p.getAttribute("data-dhx-button")) t.callEvent("onLightboxButton", [p.className, p, g]);
      else {
        var y, $, x = it(p);
        if (x.indexOf("gantt_custom_button") != -1) if (x.indexOf("gantt_custom_button_") != -1) for (y = p.parentNode.getAttribute("data-index"), $ = p; $ && it($).indexOf("gantt_cal_lsection") == -1; ) $ = $.parentNode;
        else y = p.getAttribute("data-index"), $ = p.closest(".gantt_cal_lsection"), p = p.firstChild;
        var w = t._get_typed_lightbox_config();
        y && (y *= 1, t.form_blocks[w[1 * y].type].button_click(y, p, $, $.nextSibling));
      }
    }, this.event(t.getLightbox(), "click", function(g) {
      g.target.closest(".gantt_cal_ltitle_close_btn") && t._cancel_lightbox();
      var p = Dt(g), y = it(p);
      return y || (y = it(p = p.previousSibling)), p && y && y.indexOf("gantt_btn_set") === 0 && (y = it(p = p.firstChild)), !(!p || !y) && (t.defined(t.lightbox_events[p.className]) ? t.lightbox_events[p.className] : t.lightbox_events.default)(g, p);
    }), t.getLightbox().onkeydown = function(g) {
      var p = g || window.event, y = g.target || g.srcElement, $ = it(y).indexOf("gantt_btn_set") > -1;
      switch ((g || p).keyCode) {
        case t.constants.KEY_CODES.SPACE:
          if ((g || p).shiftKey) return;
          $ && y.click && y.click();
          break;
        case t.keys.edit_save:
          if ((g || p).shiftKey) return;
          $ && y.click ? y.click() : t._save_lightbox();
          break;
        case t.keys.edit_cancel:
          t._cancel_lightbox();
      }
    };
  }, t._cancel_lightbox = function() {
    var g = this.getLightboxValues("cancel");
    t._lightbox_current_type = null, this.callEvent("onLightboxCancel", [this._lightbox_id, g.$new]), t.isTaskExists(g.id) && g.$new && (this.silent(function() {
      t.$data.tasksStore.removeItem(g.id), t._update_flags(g.id, null);
    }), this.refreshData()), this.hideLightbox();
  }, t._save_lightbox = function() {
    var g = this.getLightboxValues("save");
    t._lightbox_current_type = null, this.callEvent("onLightboxSave", [this._lightbox_id, g, !!g.$new]) && (t.$data.tasksStore._skipTaskRecalculation = "lightbox", g.$new ? (delete g.$new, this.addTask(g, g.parent, this.getTaskIndex(g.id))) : this.isTaskExists(g.id) && (this.mixin(this.getTask(g.id), g, !0), this.refreshTask(g.id), this.updateTask(g.id)), t.$data.tasksStore._skipTaskRecalculation = !1, this.refreshData(), this.hideLightbox());
  }, t._resolve_default_mapping = function(g) {
    var p = g.map_to;
    return { time: !0, time_optional: !0, duration: !0, duration_optional: !0 }[g.type] ? g.map_to == "auto" ? p = { start_date: "start_date", end_date: "end_date", duration: "duration" } : typeof g.map_to == "string" && (p = { start_date: g.map_to }) : g.type === "constraint" && (g.map_to && typeof g.map_to != "string" || (p = { constraint_type: "constraint_type", constraint_date: "constraint_date" })), p;
  }, t.getLightboxValues = function(g) {
    let p = {};
    t.isTaskExists(this._lightbox_id) && (p = this.mixin({}, this.getTask(this._lightbox_id)));
    const y = [...this._get_typed_lightbox_config()].sort(($, x) => $.name === "time" ? 1 : x.name === "time" ? -1 : 0);
    for (let $ = 0; $ < y.length; $++) {
      let x = t._lightbox_root.querySelector("#" + y[$].id);
      x = x && x.nextSibling;
      let w = this.form_blocks[y[$].type];
      if (!w) continue;
      let T = w.get_value.call(this, x, p, y[$], g), S = t._resolve_default_mapping(y[$]);
      if (typeof S == "string" && S != "auto") p[S] = T;
      else if (typeof S == "object") for (let C in S) S[C] && (p[S[C]] = T[C]);
    }
    return t._lightbox_current_type && (p.type = t._lightbox_current_type), p;
  }, t.hideLightbox = function() {
    var g = this.getLightbox();
    g && (g.style.display = "none"), this._waiAria.lightboxHiddenAttr(g), this._lightbox_id = null, this.hideCover(g), this.resetLightbox(), this.callEvent("onAfterLightbox", []);
  }, t.hideCover = function(g) {
    g && (g.style.display = "none"), this._cover && this._cover.parentNode.removeChild(this._cover), this._cover = null;
  }, t.resetLightbox = function() {
    t._lightbox && !t._custom_lightbox && t._lightbox.remove(), t._lightbox = null;
  }, t._set_lightbox_values = function(g, p) {
    var y = g, $ = p.getElementsByTagName("span"), x = [];
    t.templates.lightbox_header ? (x.push(""), x.push(t.templates.lightbox_header(y.start_date, y.end_date, y)), $[1].innerHTML = "", $[2].innerHTML = t.templates.lightbox_header(y.start_date, y.end_date, y)) : (x.push(this.templates.task_time(y.start_date, y.end_date, y)), x.push(String(this.templates.task_text(y.start_date, y.end_date, y) || "").substr(0, 70)), $[1].innerHTML = this.templates.task_time(y.start_date, y.end_date, y), $[2].innerHTML = String(this.templates.task_text(y.start_date, y.end_date, y) || "").substr(0, 70)), $[1].innerHTML = x[0], $[2].innerHTML = x[1], t._waiAria.lightboxHeader(p, x.join(" "));
    for (var w = this._get_typed_lightbox_config(this.getLightboxType()), T = 0; T < w.length; T++) {
      var S = w[T];
      if (this.form_blocks[S.type]) {
        var C = t._lightbox_root.querySelector("#" + S.id).nextSibling, E = this.form_blocks[S.type], D = t._resolve_default_mapping(w[T]), I = this.defined(y[D]) ? y[D] : S.default_value;
        E.set_value.call(t, C, I, y, S), S.focus && E.focus.call(t, C);
      }
    }
    t.isTaskExists(g.id) && (t._lightbox_id = g.id);
  }, t._fill_lightbox = function(g, p) {
    var y = this.getTask(g);
    this._set_lightbox_values(y, p);
  }, t.getLightboxSection = function(g) {
    for (var p = this._get_typed_lightbox_config(), y = 0; y < p.length && p[y].name != g; y++) ;
    var $ = p[y];
    if (!$) return null;
    this._lightbox || this.getLightbox();
    var x = t._lightbox_root.querySelector("#" + $.id), w = x.nextSibling, T = { section: $, header: x, node: w, getValue: function(C) {
      return t.form_blocks[$.type].get_value.call(t, w, C || {}, $);
    }, setValue: function(C, E) {
      return t.form_blocks[$.type].set_value.call(t, w, C, E || {}, $);
    } }, S = this._lightbox_methods["get_" + $.type + "_control"];
    return S ? S(T) : T;
  }, t._lightbox_methods.get_template_control = function(g) {
    return g.control = g.node, g;
  }, t._lightbox_methods.get_select_control = function(g) {
    return g.control = g.node.getElementsByTagName("select")[0], g;
  }, t._lightbox_methods.get_textarea_control = function(g) {
    return g.control = g.node.getElementsByTagName("textarea")[0], g;
  }, t._lightbox_methods.get_time_control = function(g) {
    return g.control = g.node.getElementsByTagName("select"), g;
  }, t._init_dnd_events = function() {
    var g = t._lightbox_root;
    this.event(g, "mousemove", t._move_while_dnd), this.event(g, "mouseup", t._finish_dnd), this.event(g, "touchmove", function(p) {
      t._move_while_dnd(p.touches[0]);
    }), this.event(g, "touchend", function(p) {
      t._finish_dnd(p.touches[0]);
    });
  }, t._move_while_dnd = function(g) {
    if (t._dnd_start_lb) {
      document.gantt_unselectable || (t._lightbox_root.className += " gantt_unselectable", document.gantt_unselectable = !0);
      var p = t.getLightbox(), y = [g.pageX, g.pageY];
      p.style.top = t._lb_start[1] + y[1] - t._dnd_start_lb[1] + "px", p.style.left = t._lb_start[0] + y[0] - t._dnd_start_lb[0] + "px";
    }
  }, t._ready_to_dnd = function(g) {
    var p = t.getLightbox();
    t._lb_start = [p.offsetLeft, p.offsetTop], t._dnd_start_lb = [g.pageX, g.pageY];
  }, t._finish_dnd = function() {
    t._lb_start && (t._lb_start = t._dnd_start_lb = !1, t._lightbox_root.className = t._lightbox_root.className.replace(" gantt_unselectable", ""), document.gantt_unselectable = !1);
  }, t._focus = function(g, p) {
    if (g && g.focus && !t.config.touch) try {
      p && g.select && g.select(), g.focus();
    } catch {
    }
  }, t.form_blocks = { getTimePicker: function(g, p) {
    var y, $, x, w = "", T = this.config, S = { first: 0, last: 1440, date: this.date.date_part(new Date(t._min_date.valueOf())), timeFormat: b(g) };
    for (g._time_format_order = { size: 0 }, t.config.limit_time_select && (S.first = 60 * T.first_hour, S.last = 60 * T.last_hour + 1, S.date.setHours(T.first_hour)), y = 0; y < S.timeFormat.length; y++) y > 0 && (w += " "), ($ = m(g, y, S)) && (x = t._waiAria.lightboxSelectAttrString(S.timeFormat[y]), w += "<select " + (g.readonly ? "disabled='disabled'" : "") + (p ? " style='display:none' " : "") + x + ">" + $ + "</select>");
    return w;
  }, getTimePickerValue: function(g, p, y) {
    var $, x = p._time_format_order, w = 0, T = 0, S = y || 0;
    return t.defined(x[3]) && ($ = parseInt(g[x[3] + S].value, 10), w = Math.floor($ / 60), T = $ % 60), new Date(g[x[2] + S].value, g[x[1] + S].value, g[x[0] + S].value, w, T);
  }, _fill_lightbox_select: function(g, p, y, $) {
    if (g[p + $[0]].value = y.getDate(), g[p + $[1]].value = y.getMonth(), g[p + $[2]].value = y.getFullYear(), t.defined($[3])) {
      var x = 60 * y.getHours() + y.getMinutes();
      x = Math.round(x / t._get_timepicker_step()) * t._get_timepicker_step();
      var w = g[p + $[3]];
      w.value = x, w.setAttribute("data-value", x);
    }
  }, template: new n(), textarea: new e(), select: new a(), time: new i(), duration: new o(), parent: new l(), radio: new s(), checkbox: new r(), resources: new d(), constraint: new u(), baselines: new h(), typeselect: new c(), resource_selector: new _() }, t._is_lightbox_timepicker = function() {
    for (var g = this._get_typed_lightbox_config(), p = 0; p < g.length; p++) if (g[p].name == "time" && g[p].type == "time") return !0;
    return !1;
  }, t._delete_task_confirm = function({ task: g, message: p, title: y, callback: $, ok: x }) {
    t._simple_confirm(p, y, $, x);
  }, t._delete_link_confirm = function({ link: g, message: p, title: y, callback: $, ok: x }) {
    t._simple_confirm(p, y, $, x);
  }, t._simple_confirm = function(g, p, y, $) {
    if (!g) return y();
    var x = { text: g };
    p && (x.title = p), $ && (x.ok = $), y && (x.callback = function(w) {
      w && y();
    }), t.confirm(x);
  }, t._get_typed_lightbox_config = function(g) {
    g === void 0 && (g = this.getLightboxType());
    var p = v.call(this, g);
    return t.config.lightbox[p + "_sections"] ? t.config.lightbox[p + "_sections"] : t.config.lightbox.sections;
  }, t._silent_redraw_lightbox = function(g) {
    var p = this.getLightboxType();
    if (this.getState().lightbox) {
      var y = this.getState().lightbox, $ = this.getLightboxValues(), x = this.copy(this.getTask(y));
      this.resetLightbox();
      var w = this.mixin(x, $, !0), T = this.getLightbox(g || void 0);
      this._set_lightbox_values(w, T), this.showCover(T);
    } else this.resetLightbox(), this.getLightbox(g || void 0);
    this.callEvent("onLightboxChange", [p, this.getLightboxType()]);
  };
}
function Xr(t) {
  if (!yt.isNode) {
    t.utils = { arrayFind: Ee, dom: Pn };
    var n = ue();
    t.event = n.attach, t.eventRemove = n.detach, t._eventRemoveAll = n.detachAll, t._createDomEventScope = n.extend, H(t, qa(t));
    var e = jr.init(t);
    t.$ui = e.factory, t.$ui.layers = e.render, t.$mouseEvents = e.mouseEvents, t.$services.setService("mouseEvents", function() {
      return t.$mouseEvents;
    }), t.mixin(t, e.layersApi), t.$services.setService("layers", function() {
      return e.layersService;
    }), t.mixin(t, /* @__PURE__ */ function() {
      function i(c) {
        return c.$ui.getView("timeline");
      }
      function a(c) {
        return c.$ui.getView("grid");
      }
      function r(c) {
        var h = i(c);
        if (h && !h.$config.hidden) return h;
        var _ = a(c);
        return _ && !_.$config.hidden ? _ : null;
      }
      function s(c) {
        var h = null, _ = !1;
        return [".gantt_drag_marker.gantt_grid_resize_area", ".gantt_drag_marker .gantt_row.gantt_row_task", ".gantt_drag_marker.gantt_grid_dnd_marker"].forEach(function(f) {
          _ = _ || !!document.querySelector(f);
        }), (h = _ ? a(c) : r(c)) ? l(c, h, "scrollY") : null;
      }
      function o(c) {
        var h = r(c);
        return h && h.id != "grid" ? l(c, h, "scrollX") : null;
      }
      function l(c, h, _) {
        var f = h.$config[_];
        return c.$ui.getView(f);
      }
      var d = "DEFAULT_VALUE";
      function u(c, h, _, f) {
        var v = c(this);
        return v && v.isVisible() ? v[h].apply(v, _) : f ? f() : d;
      }
      return { getColumnIndex: function(c) {
        var h = u.call(this, a, "getColumnIndex", [c]);
        return h === d ? 0 : h;
      }, dateFromPos: function(c) {
        var h = u.call(this, i, "dateFromPos", Array.prototype.slice.call(arguments));
        return h === d ? this.getState().min_date : h;
      }, posFromDate: function(c) {
        var h = u.call(this, i, "posFromDate", Array.prototype.slice.call(arguments));
        return h === d ? 0 : h;
      }, getRowTop: function(c) {
        var h = this, _ = u.call(h, i, "getRowTop", [c], function() {
          return u.call(h, a, "getRowTop", [c]);
        });
        return _ === d ? 0 : _;
      }, getTaskTop: function(c) {
        var h = this, _ = u.call(h, i, "getItemTop", [c], function() {
          return u.call(h, a, "getItemTop", [c]);
        });
        return _ === d ? 0 : _;
      }, getTaskPosition: function(c, h, _) {
        var f = u.call(this, i, "getItemPosition", [c, h, _]);
        return f === d ? { left: 0, top: this.getTaskTop(c.id), height: this.getTaskBarHeight(c.id), width: 0 } : f;
      }, getTaskBarHeight: function(c, h) {
        var _ = this, f = u.call(_, i, "getBarHeight", [c, h], function() {
          return u.call(_, a, "getItemHeight", [c]);
        });
        return f === d ? 0 : f;
      }, getTaskHeight: function(c) {
        var h = this, _ = u.call(h, i, "getItemHeight", [c], function() {
          return u.call(h, a, "getItemHeight", [c]);
        });
        return _ === d ? 0 : _;
      }, columnIndexByDate: function(c) {
        var h = u.call(this, i, "columnIndexByDate", [c]);
        return h === d ? 0 : h;
      }, roundTaskDates: function() {
        u.call(this, i, "roundTaskDates", []);
      }, getScale: function() {
        var c = u.call(this, i, "getScale", []);
        return c === d ? null : c;
      }, getTaskNode: function(c) {
        var h = i(this);
        if (h && h.isVisible()) {
          var _ = h._taskRenderer.rendered[c];
          if (!_) {
            var f = h.$config.item_attribute;
            _ = h.$task_bars.querySelector("[" + f + "='" + c + "']");
          }
          return _ || null;
        }
        return null;
      }, getLinkNode: function(c) {
        var h = i(this);
        return h.isVisible() ? h._linkRenderer.rendered[c] : null;
      }, scrollTo: function(c, h) {
        var _ = s(this), f = o(this), v = { position: 0 }, k = { position: 0 };
        _ && (k = _.getScrollState()), f && (v = f.getScrollState());
        var b = f && 1 * c == c, m = _ && 1 * h == h;
        if (b && m) for (var g = _._getLinkedViews(), p = f._getLinkedViews(), y = [], $ = 0; $ < g.length; $++) for (var x = 0; x < p.length; x++) g[$].$config.id && p[x].$config.id && g[$].$config.id === p[x].$config.id && y.push(g[$].$config.id);
        b && (y && y.forEach((function(S) {
          this.$ui.getView(S).$config.$skipSmartRenderOnScroll = !0;
        }).bind(this)), f.scroll(c), y && y.forEach((function(S) {
          this.$ui.getView(S).$config.$skipSmartRenderOnScroll = !1;
        }).bind(this))), m && _.scroll(h);
        var w = { position: 0 }, T = { position: 0 };
        _ && (w = _.getScrollState()), f && (T = f.getScrollState()), this.callEvent("onGanttScroll", [v.position, k.position, T.position, w.position]);
      }, showDate: function(c) {
        var h = this.posFromDate(c), _ = Math.max(h - this.config.task_scroll_offset, 0);
        this.scrollTo(_);
      }, showTask: function(c) {
        var h = this.getTaskPosition(this.getTask(c)), _ = h.left;
        this.config.rtl && (_ = h.left + h.width);
        var f, v = Math.max(_ - this.config.task_scroll_offset, 0), k = this._scroll_state().y;
        f = k ? h.top - (k - this.getTaskBarHeight(c)) / 2 : h.top, this.scrollTo(v, f);
        var b = a(this), m = i(this);
        b && m && b.$config.scrollY != m.$config.scrollY && l(this, b, "scrollY").scrollTo(null, f);
      }, _scroll_state: function() {
        var c = { x: !1, y: !1, x_pos: 0, y_pos: 0, scroll_size: this.config.scroll_size + 1, x_inner: 0, y_inner: 0 }, h = s(this), _ = o(this);
        if (_) {
          var f = _.getScrollState();
          f.visible && (c.x = f.size, c.x_inner = f.scrollSize), c.x_pos = f.position || 0;
        }
        if (h) {
          var v = h.getScrollState();
          v.visible && (c.y = v.size, c.y_inner = v.scrollSize), c.y_pos = v.position || 0;
        }
        return c;
      }, getScrollState: function() {
        var c = this._scroll_state();
        return { x: c.x_pos, y: c.y_pos, inner_width: c.x, inner_height: c.y, width: c.x_inner, height: c.y_inner };
      }, getLayoutView: function(c) {
        return this.$ui.getView(c);
      }, scrollLayoutCell: function(c, h, _) {
        const f = this.$ui.getView(c);
        if (!f) return !1;
        if (h !== null) {
          const v = this.$ui.getView(f.$config.scrollX);
          v && v.scrollTo(h, null);
        }
        if (_ !== null) {
          const v = this.$ui.getView(f.$config.scrollY);
          v && v.scrollTo(null, _);
        }
      } };
    }()), function(i) {
      i.resetSkin || (i.resetSkin = function() {
        this.skin = "", Se(!0, this);
      }, i.skins = {}, i.attachEvent("onGanttLayoutReady", function() {
        Se(!1, this), r();
      })), i._addThemeClass = function() {
        document.documentElement.setAttribute("data-gantt-theme", i.skin);
      }, i.setSkin = function(s) {
        const o = this.skin !== s;
        this.skin = s, i._addThemeClass(), r(), i.$root && (Se(!o, i), this.render());
      };
      let a = null;
      function r() {
        const s = i.$root;
        a && clearInterval(a), s && (a = setInterval(() => {
          const o = getComputedStyle(s).getPropertyValue("--dhx-gantt-theme");
          o && o !== i.skin && i.setSkin(o);
        }, 100));
      }
      i.attachEvent("onDestroy", function() {
        clearInterval(a);
      });
    }(t), function(i) {
      i.skins.skyblue = { config: { grid_width: 370, row_height: 27, bar_height_padding: 4, scale_height: 27, link_line_width: 1, link_arrow_size: 8, link_radius: 2, lightbox_additional_height: 75 }, _second_column_width: 95, _third_column_width: 80 };
    }(t), function(i) {
      i.skins.dark = { config: { grid_width: 390, row_height: 36, scale_height: 36, link_line_width: 2, link_arrow_size: 12, bar_height_padding: 9, lightbox_additional_height: 75 }, _second_column_width: 100, _third_column_width: 70 };
    }(t), function(i) {
      i.skins.meadow = { config: { grid_width: 380, row_height: 27, scale_height: 30, link_line_width: 2, link_arrow_size: 10, bar_height_padding: 4, lightbox_additional_height: 72 }, _second_column_width: 95, _third_column_width: 80 };
    }(t), function(i) {
      i.skins.terrace = { config: { grid_width: 390, row_height: 36, scale_height: 36, link_line_width: 2, link_arrow_size: 12, bar_height_padding: 9, lightbox_additional_height: 75 }, _second_column_width: 100, _third_column_width: 70 };
    }(t), function(i) {
      i.skins.broadway = { config: { grid_width: 390, row_height: 35, scale_height: 35, link_line_width: 1, link_arrow_size: 9, bar_height_padding: 4, lightbox_additional_height: 86 }, _second_column_width: 100, _third_column_width: 80, _lightbox_template: "<div class='gantt_cal_ltitle'><span class='gantt_mark'>&nbsp;</span><span class='gantt_time'></span><span class='gantt_title'></span><div class='gantt_cancel_btn'></div></div><div class='gantt_cal_larea'></div>", _config_buttons_left: {}, _config_buttons_right: { gantt_delete_btn: "icon_delete", gantt_save_btn: "icon_save" } };
    }(t), function(i) {
      i.skins.material = { config: { grid_width: 411, row_height: 34, scale_height: 36, link_line_width: 2, link_arrow_size: 12, bar_height_padding: 9, lightbox_additional_height: 80 }, _second_column_width: 110, _third_column_width: 75, _redefine_lightbox_buttons: { buttons_left: ["dhx_delete_btn"], buttons_right: ["dhx_cancel_btn", "dhx_save_btn"] } }, i.attachEvent("onAfterTaskDrag", function(a) {
        var r = i.getTaskNode(a);
        r && (r.className += " gantt_drag_animation", setTimeout(function() {
          var s = r.className.indexOf(" gantt_drag_animation");
          s > -1 && (r.className = r.className.slice(0, s));
        }, 200));
      });
    }(t), function(i) {
      i.skins.contrast_black = { config: { grid_width: 390, row_height: 35, scale_height: 35, link_line_width: 2, link_arrow_size: 12, lightbox_additional_height: 75 }, _second_column_width: 100, _third_column_width: 80 };
    }(t), function(i) {
      i.skins.contrast_white = { config: { grid_width: 390, row_height: 35, scale_height: 35, link_line_width: 2, link_arrow_size: 12, lightbox_additional_height: 75 }, _second_column_width: 100, _third_column_width: 80 };
    }(t), function(i) {
      i.ext || (i.ext = {});
      for (var a = [Fr, null, null], r = 0; r < a.length; r++) a[r] && a[r](i);
      i.ext.zoom = new Ur(i);
    }(t), Gr(t), Kr(t), function(i) {
      i._extend_to_optional = function(a) {
        var r = a, s = { render: r.render, focus: r.focus, set_value: function(o, l, d, u) {
          var c = i._resolve_default_mapping(u);
          if (!d[c.start_date] || c.start_date == "start_date" && this._isAllowedUnscheduledTask(d)) {
            s.disable(o, u);
            var h = {};
            for (var _ in c) h[c[_]] = d[_];
            return r.set_value.call(i, o, l, h, u);
          }
          return s.enable(o, u), r.set_value.call(i, o, l, d, u);
        }, get_value: function(o, l, d) {
          return d.disabled ? { start_date: null } : r.get_value.call(i, o, l, d);
        }, update_block: function(o, l) {
          if (i.callEvent("onSectionToggle", [i._lightbox_id, l]), o.style.display = l.disabled ? "none" : "", l.button) {
            var d = o.previousSibling.querySelector(".gantt_custom_button_label"), u = i.locale.labels, c = l.disabled ? u[l.name + "_enable_button"] : u[l.name + "_disable_button"];
            d.innerHTML = c;
          }
        }, disable: function(o, l) {
          l.disabled = !0, s.update_block(o, l);
        }, enable: function(o, l) {
          l.disabled = !1, s.update_block(o, l);
        }, button_click: function(o, l, d, u) {
          if (i.callEvent("onSectionButton", [i._lightbox_id, d]) !== !1) {
            var c = i._get_typed_lightbox_config()[o];
            c.disabled ? s.enable(u, c) : s.disable(u, c);
          }
        } };
        return s;
      }, i.form_blocks.duration_optional = i._extend_to_optional(i.form_blocks.duration), i.form_blocks.time_optional = i._extend_to_optional(i.form_blocks.time);
    }(t), function(i) {
      var a = new RegExp(`<(?:.|
)*?>`, "gm"), r = new RegExp(" +", "gm");
      function s(u) {
        return (u + "").replace(a, " ").replace(r, " ");
      }
      var o = new RegExp("'", "gm");
      function l(u) {
        return (u + "").replace(o, "&#39;");
      }
      for (var d in i._waiAria = { getAttributeString: function(u) {
        var c = [" "];
        for (var h in u) {
          var _ = l(s(u[h]));
          c.push(h + "='" + _ + "'");
        }
        return c.push(" "), c.join(" ");
      }, getTimelineCellAttr: function(u) {
        return i._waiAria.getAttributeString({ "aria-label": u });
      }, _taskCommonAttr: function(u, c) {
        u.start_date && u.end_date && (c.setAttribute("aria-label", s(i.templates.tooltip_text(u.start_date, u.end_date, u))), u.$dataprocessor_class && c.setAttribute("aria-busy", !0));
      }, setTaskBarAttr: function(u, c) {
        this._taskCommonAttr(u, c), c.setAttribute("role", "img"), !i.isReadonly(u) && i.config.drag_move && (u.id != i.getState("tasksDnd").drag_id ? c.setAttribute("aria-grabbed", !1) : c.setAttribute("aria-grabbed", !0));
      }, taskRowAttr: function(u, c) {
        this._taskCommonAttr(u, c), !i.isReadonly(u) && i.config.order_branch && c.setAttribute("aria-grabbed", !1), c.setAttribute("role", "row"), c.setAttribute("aria-selected", i.isSelectedTask(u.id) ? "true" : "false"), c.setAttribute("aria-level", u.$level + 1 || 1), i.hasChild(u.id) && c.setAttribute("aria-expanded", u.$open ? "true" : "false");
      }, linkAttr: function(u, c) {
        var h = i.config.links, _ = u.type == h.finish_to_start || u.type == h.start_to_start, f = u.type == h.start_to_start || u.type == h.start_to_finish, v = i.locale.labels.link + " " + i.templates.drag_link(u.source, f, u.target, _);
        c.setAttribute("role", "img"), c.setAttribute("aria-label", s(v));
      }, gridSeparatorAttr: function(u) {
        u.setAttribute("role", "columnheader");
      }, rowResizerAttr: function(u) {
        u.setAttribute("role", "row");
      }, lightboxHiddenAttr: function(u) {
        u.setAttribute("aria-hidden", "true");
      }, lightboxVisibleAttr: function(u) {
        u.setAttribute("aria-hidden", "false");
      }, lightboxAttr: function(u) {
        u.setAttribute("role", "dialog"), u.setAttribute("aria-hidden", "true"), u.firstChild.setAttribute("role", "heading"), u.firstChild.setAttribute("aria-level", "1");
      }, lightboxButtonAttrString: function(u) {
        return this.getAttributeString({ role: "button", "aria-label": i.locale.labels[u], tabindex: "0" });
      }, lightboxHeader: function(u, c) {
        u.setAttribute("aria-label", c);
      }, lightboxSelectAttrString: function(u) {
        var c = "";
        switch (u) {
          case "%Y":
            c = i.locale.labels.years;
            break;
          case "%m":
            c = i.locale.labels.months;
            break;
          case "%d":
            c = i.locale.labels.days;
            break;
          case "%H:%i":
            c = i.locale.labels.hours + i.locale.labels.minutes;
        }
        return i._waiAria.getAttributeString({ "aria-label": c });
      }, lightboxDurationInputAttrString: function(u) {
        return this.getAttributeString({ "aria-label": i.locale.labels.column_duration, "aria-valuemin": "0", role: "spinbutton" });
      }, inlineEditorAttr: function(u) {
        u.setAttribute("role", "row");
      }, gridAttrString: function() {
        return [" role='treegrid'", i.config.multiselect ? "aria-multiselectable='true'" : "aria-multiselectable='false'", " "].join(" ");
      }, gridScaleRowAttrString: function() {
        return "role='row'";
      }, gridScaleCellAttrString: function(u, c) {
        var h = "";
        if (u.name == "add") h = this.getAttributeString({ role: "columnheader", "aria-label": i.locale.labels.new_task });
        else {
          var _ = { role: "columnheader", "aria-label": i.config.external_render && i.config.external_render.isElement(c) ? "" : c };
          i._sort && i._sort.name == u.name && (i._sort.direction == "asc" ? _["aria-sort"] = "ascending" : _["aria-sort"] = "descending"), h = this.getAttributeString(_);
        }
        return h;
      }, gridDataAttrString: function() {
        return "role='rowgroup'";
      }, reorderMarkerAttr: function(u) {
        u.setAttribute("role", "grid"), u.firstChild.removeAttribute("aria-level"), u.firstChild.setAttribute("aria-grabbed", "true");
      }, gridCellAttrString: function(u, c, h) {
        var _ = { role: "gridcell", "aria-label": c };
        return u.editor && !i.isReadonly(h) || (_["aria-readonly"] = !0), this.getAttributeString(_);
      }, gridAddButtonAttrString: function(u) {
        return this.getAttributeString({ role: "button", "aria-label": i.locale.labels.new_task });
      }, messageButtonAttrString: function(u) {
        return "tabindex='0' role='button' aria-label='" + u + "'";
      }, messageInfoAttr: function(u) {
        u.setAttribute("role", "alert");
      }, messageModalAttr: function(u, c) {
        u.setAttribute("role", "dialog"), c && u.setAttribute("aria-labelledby", c);
      }, quickInfoAttr: function(u) {
        u.setAttribute("role", "dialog");
      }, quickInfoHeaderAttrString: function() {
        return " role='heading' aria-level='1' ";
      }, quickInfoHeader: function(u, c) {
        u.setAttribute("aria-label", c);
      }, quickInfoButtonAttrString: function(u) {
        return i._waiAria.getAttributeString({ role: "button", "aria-label": u, tabindex: "0" });
      }, tooltipAttr: function(u) {
        u.setAttribute("role", "tooltip");
      }, tooltipVisibleAttr: function(u) {
        u.setAttribute("aria-hidden", "false");
      }, tooltipHiddenAttr: function(u) {
        u.setAttribute("aria-hidden", "true");
      } }, i._waiAria) i._waiAria[d] = /* @__PURE__ */ function(u) {
        return function() {
          return i.config.wai_aria_attributes ? u.apply(this, arguments) : "";
        };
      }(i._waiAria[d]);
    }(t), t.locate = function(i) {
      var a = Dt(i);
      if (ct(a, ".gantt_task_row")) return null;
      var r = arguments[1] || this.config.task_attribute, s = et(a, r);
      return s ? s.getAttribute(r) : null;
    }, t._locate_css = function(i, a, r) {
      return kt(i, a, r);
    }, t._locateHTML = function(i, a) {
      return et(i, a || this.config.task_attribute);
    };
  }
  t.attachEvent("onParse", function() {
    q(t) || t.attachEvent("onGanttRender", function() {
      if (t.config.initial_scroll) {
        var i = t.getTaskByIndex(0), a = i ? i.id : t.config.root_id;
        t.isTaskExists(a) && t.$task && t.utils.dom.isChildOf(t.$task, t.$container) && t.showTask(a);
      }
    }, { once: !0 });
  }), t.attachEvent("onBeforeGanttReady", function() {
    this.config.scroll_size || (this.config.scroll_size = En() || 15), q(t) || (this._eventRemoveAll(), this.$mouseEvents.reset(), this.resetLightbox());
  }), t.attachEvent("onGanttReady", function() {
    !q(t) && t.config.rtl && t.$layout.getCellsByType("viewCell").forEach(function(i) {
      var a = i.$config.scrollX;
      if (a) {
        var r = t.$ui.getView(a);
        r && r.scrollTo(r.$config.scrollSize, 0);
      }
    });
  }), t.attachEvent("onGanttReady", function() {
    if (!q(t)) {
      var i = t.plugins(), a = { auto_scheduling: t.autoSchedule, click_drag: t.ext.clickDrag, critical_path: t.isCriticalTask, drag_timeline: t.ext.dragTimeline, export_api: t.exportToPDF, fullscreen: t.ext.fullscreen, grouping: t.groupBy, keyboard_navigation: t.ext.keyboardNavigation, marker: t.addMarker, multiselect: t.eachSelectedTask, overlay: t.ext.overlay, quick_info: t.templates.quick_info_content, tooltip: t.ext.tooltips, undo: t.undo };
      for (let r in a) a[r] && !i[r] && console.warn(`You connected the '${r}' extension via an obsolete file. 
To fix it, you need to remove the obsolete file and connect the extension via the plugins method: https://docs.dhtmlx.com/gantt/api__gantt_plugins.html`);
    }
  });
}
function Zr(t) {
  var n = {};
  t.$data.tasksStore.attachEvent("onClearAll", function() {
    n = {};
  });
  var e = Ue.prototype.hasChild;
  t.$data.tasksStore.hasChild = function(i) {
    return t.config.branch_loading ? !!e.call(this, i) || !!this.exists(i) && this.getItem(i)[t.config.branch_loading_property] : e.call(this, i);
  }, t.attachEvent("onTaskOpened", function(i) {
    if (t.config.branch_loading && t._load_url && function(l) {
      return !(!t.config.branch_loading || !t._load_url || n[l] || t.getChildren(l).length || !t.hasChild(l));
    }(i)) {
      var a = t._load_url, r = (a = a.replace(/(\?|&)?parent_id=.+&?/, "")).indexOf("?") >= 0 ? "&" : "?", s = t.getScrollState().y || 0, o = { taskId: i, url: a + r + "parent_id=" + encodeURIComponent(i) };
      if (t.callEvent("onBeforeBranchLoading", [o]) === !1) return;
      t.load(o.url, this._load_type, function() {
        s && t.scrollTo(null, s), t.callEvent("onAfterBranchLoading", [o]);
      }), n[i] = !0;
    }
  });
}
const Qr = tt.gantt = function(t) {
  var n = Ga(t);
  return n.env.isNode || (Xr(n), function(e) {
    e.load = function(i, a, r) {
      this._load_url = i, this.assert(arguments.length, "Invalid load arguments");
      var s = "json", o = null;
      return arguments.length >= 3 ? (s = a, o = r) : typeof arguments[1] == "string" ? s = arguments[1] : typeof arguments[1] == "function" && (o = arguments[1]), this._load_type = s, this.callEvent("onLoadStart", [i, s]), this.ajax.get(i, e.bind(function(l) {
        this.on_load(l, s), this.callEvent("onLoadEnd", [i, s]), typeof o == "function" && o.call(this);
      }, this));
    };
  }(n), Zr(n)), n;
}(Ti);
tt.gantt = Qr;
export {
  Qr as default,
  Qr as gantt
};
//# sourceMappingURL=dhtmlxgantt.es.js.map
