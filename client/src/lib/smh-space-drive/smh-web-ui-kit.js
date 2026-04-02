import { jsxs as V, jsx as b, Fragment as ms } from "react/jsx-runtime";
import hi, { useRef as ut, useEffect as Se, useState as z, useMemo as bs } from "react";
const Xt = ({ children: e, size: t = 24, style: a = {}, ...i }) => /* @__PURE__ */ b(
  "svg",
  {
    width: t,
    height: t,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: { flexShrink: 0, ...a },
    ...i,
    children: e
  }
), vs = (e) => /* @__PURE__ */ V(Xt, { ...e, children: [
  /* @__PURE__ */ b("path", { d: "M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" }),
  /* @__PURE__ */ b("path", { d: "m15 5 4 4" })
] }), pi = (e) => /* @__PURE__ */ V(Xt, { ...e, children: [
  /* @__PURE__ */ b("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
  /* @__PURE__ */ b("polyline", { points: "7 10 12 15 17 10" }),
  /* @__PURE__ */ b("line", { x1: "12", y1: "15", x2: "12", y2: "3" })
] }), ui = (e) => /* @__PURE__ */ V(Xt, { ...e, children: [
  /* @__PURE__ */ b("polyline", { points: "3 6 5 6 21 6" }),
  /* @__PURE__ */ b("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }),
  /* @__PURE__ */ b("line", { x1: "10", y1: "11", x2: "10", y2: "17" }),
  /* @__PURE__ */ b("line", { x1: "14", y1: "11", x2: "14", y2: "17" })
] }), Ae = ({ children: e, size: t = 24, style: a = {}, bgColor: i = "#e5e5e5", ...r }) => /* @__PURE__ */ b(
  "svg",
  {
    width: t,
    height: t,
    viewBox: "0 0 24 24",
    fill: "none",
    style: { flexShrink: 0, ...a },
    ...r,
    children: e
  }
), Ki = ({ size: e = 24, style: t = {} }) => /* @__PURE__ */ b(Ae, { size: e, style: t, children: /* @__PURE__ */ b("path", { d: "M2 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z", fill: t.color || "#ffb020" }) }), Es = ({ size: e = 24, style: t = {} }) => /* @__PURE__ */ V(Ae, { size: e, style: t, children: [
  /* @__PURE__ */ b("rect", { x: "3", y: "2", width: "18", height: "20", rx: "2", fill: t.color || "#0abf5b", opacity: "0.15", stroke: t.color || "#0abf5b", strokeWidth: "1.5" }),
  /* @__PURE__ */ b("circle", { cx: "9", cy: "9", r: "2", fill: t.color || "#0abf5b" }),
  /* @__PURE__ */ b("path", { d: "M3 16l4-4 3 3 4-4 7 7v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3z", fill: t.color || "#0abf5b", opacity: "0.4" })
] }), Fs = ({ size: e = 24, style: t = {} }) => /* @__PURE__ */ V(Ae, { size: e, style: t, children: [
  /* @__PURE__ */ b("rect", { x: "3", y: "4", width: "18", height: "16", rx: "2", fill: t.color || "#7b61ff", opacity: "0.15", stroke: t.color || "#7b61ff", strokeWidth: "1.5" }),
  /* @__PURE__ */ b("polygon", { points: "10,8 16,12 10,16", fill: t.color || "#7b61ff" })
] }), Ss = ({ size: e = 24, style: t = {} }) => /* @__PURE__ */ V(Ae, { size: e, style: t, children: [
  /* @__PURE__ */ b("rect", { x: "3", y: "2", width: "18", height: "20", rx: "2", fill: t.color || "#e34d59", opacity: "0.15", stroke: t.color || "#e34d59", strokeWidth: "1.5" }),
  /* @__PURE__ */ b("text", { x: "12", y: "15", textAnchor: "middle", fontSize: "7", fontWeight: "700", fill: t.color || "#e34d59", fontFamily: "sans-serif", children: "PDF" })
] }), Bs = ({ size: e = 24, style: t = {} }) => /* @__PURE__ */ V(Ae, { size: e, style: t, children: [
  /* @__PURE__ */ b("rect", { x: "3", y: "2", width: "18", height: "20", rx: "2", fill: t.color || "#3370ff", opacity: "0.15", stroke: t.color || "#3370ff", strokeWidth: "1.5" }),
  /* @__PURE__ */ b("text", { x: "12", y: "15", textAnchor: "middle", fontSize: "7", fontWeight: "700", fill: t.color || "#3370ff", fontFamily: "sans-serif", children: "W" })
] }), ws = ({ size: e = 24, style: t = {} }) => /* @__PURE__ */ V(Ae, { size: e, style: t, children: [
  /* @__PURE__ */ b("rect", { x: "3", y: "2", width: "18", height: "20", rx: "2", fill: t.color || "#2ba471", opacity: "0.15", stroke: t.color || "#2ba471", strokeWidth: "1.5" }),
  /* @__PURE__ */ b("text", { x: "12", y: "15", textAnchor: "middle", fontSize: "7", fontWeight: "700", fill: t.color || "#2ba471", fontFamily: "sans-serif", children: "X" })
] }), Cs = ({ size: e = 24, style: t = {} }) => /* @__PURE__ */ V(Ae, { size: e, style: t, children: [
  /* @__PURE__ */ b("rect", { x: "3", y: "2", width: "18", height: "20", rx: "2", fill: t.color || "#ed7b2f", opacity: "0.15", stroke: t.color || "#ed7b2f", strokeWidth: "1.5" }),
  /* @__PURE__ */ b("text", { x: "12", y: "15", textAnchor: "middle", fontSize: "7", fontWeight: "700", fill: t.color || "#ed7b2f", fontFamily: "sans-serif", children: "P" })
] }), _s = ({ size: e = 24, style: t = {} }) => /* @__PURE__ */ V(Ae, { size: e, style: t, children: [
  /* @__PURE__ */ b("rect", { x: "3", y: "2", width: "18", height: "20", rx: "2", fill: t.color || "#a0a3b1", opacity: "0.15", stroke: t.color || "#a0a3b1", strokeWidth: "1.5" }),
  /* @__PURE__ */ b("polyline", { points: "9,9 6,12 9,15", stroke: t.color || "#a0a3b1", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }),
  /* @__PURE__ */ b("polyline", { points: "15,9 18,12 15,15", stroke: t.color || "#a0a3b1", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })
] }), Rs = ({ size: e = 24, style: t = {} }) => /* @__PURE__ */ V(Ae, { size: e, style: t, children: [
  /* @__PURE__ */ b("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z", fill: t.color || "#86909c", opacity: "0.15", stroke: t.color || "#86909c", strokeWidth: "1.5" }),
  /* @__PURE__ */ b("polyline", { points: "14,2 14,8 20,8", stroke: t.color || "#86909c", strokeWidth: "1.5" }),
  /* @__PURE__ */ b("line", { x1: "8", y1: "13", x2: "16", y2: "13", stroke: t.color || "#86909c", strokeWidth: "1", opacity: "0.5" }),
  /* @__PURE__ */ b("line", { x1: "8", y1: "17", x2: "13", y2: "17", stroke: t.color || "#86909c", strokeWidth: "1", opacity: "0.5" })
] }), xs = ({ size: e = 24, style: t = {} }) => /* @__PURE__ */ V(Ae, { size: e, style: t, children: [
  /* @__PURE__ */ b("rect", { x: "3", y: "2", width: "18", height: "20", rx: "2", fill: t.color || "#c9a06e", opacity: "0.15", stroke: t.color || "#c9a06e", strokeWidth: "1.5" }),
  /* @__PURE__ */ b("text", { x: "12", y: "15", textAnchor: "middle", fontSize: "6", fontWeight: "700", fill: t.color || "#c9a06e", fontFamily: "sans-serif", children: "ZIP" })
] }), Ds = ({ size: e = 24, style: t = {} }) => /* @__PURE__ */ V(Ae, { size: e, style: t, children: [
  /* @__PURE__ */ b("rect", { x: "3", y: "2", width: "18", height: "20", rx: "2", fill: t.color || "#e95fbc", opacity: "0.15", stroke: t.color || "#e95fbc", strokeWidth: "1.5" }),
  /* @__PURE__ */ b("circle", { cx: "10", cy: "15", r: "2", fill: t.color || "#e95fbc" }),
  /* @__PURE__ */ b("path", { d: "M12 15V7l5-2v8", stroke: t.color || "#e95fbc", strokeWidth: "1.5", fill: "none" })
] }), Os = ({ size: e = 24, style: t = {} }) => /* @__PURE__ */ V(Ae, { size: e, style: t, children: [
  /* @__PURE__ */ b("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z", fill: t.color || "#a8b0b8", opacity: "0.15", stroke: t.color || "#a8b0b8", strokeWidth: "1.5" }),
  /* @__PURE__ */ b("text", { x: "12", y: "16", textAnchor: "middle", fontSize: "9", fontWeight: "700", fill: t.color || "#a8b0b8", fontFamily: "sans-serif", children: "?" })
] }), Us = (e) => /* @__PURE__ */ V(Xt, { ...e, children: [
  /* @__PURE__ */ b("path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" }),
  /* @__PURE__ */ b("polyline", { points: "10 17 15 12 10 7" }),
  /* @__PURE__ */ b("line", { x1: "15", y1: "12", x2: "3", y2: "12" })
] });
function yi({
  visible: e,
  header: t,
  children: a,
  onClose: i,
  onCancel: r,
  onConfirm: s,
  confirmBtn: o = "确定",
  cancelBtn: n = "取消",
  destroyOnClose: p = !1
}) {
  const c = ut(null);
  if (Se(() => {
    if (!e) return;
    const h = (u) => {
      u.key === "Escape" && (i == null || i());
    };
    return document.addEventListener("keydown", h), () => document.removeEventListener("keydown", h);
  }, [e, i]), !e && p || !e) return null;
  const l = typeof o == "object" ? o.content : o, d = typeof o == "object" ? o.loading : !1;
  return /* @__PURE__ */ b("div", { className: "smh-dialog-overlay", ref: c, onClick: (h) => {
    h.target === c.current && (i == null || i());
  }, children: /* @__PURE__ */ V("div", { className: "smh-dialog", children: [
    /* @__PURE__ */ V("div", { className: "smh-dialog__header", children: [
      /* @__PURE__ */ b("span", { className: "smh-dialog__title", children: t }),
      /* @__PURE__ */ b("button", { className: "smh-dialog__close", onClick: i, children: "✕" })
    ] }),
    /* @__PURE__ */ b("div", { className: "smh-dialog__body", children: a }),
    /* @__PURE__ */ V("div", { className: "smh-dialog__footer", children: [
      /* @__PURE__ */ b("button", { className: "smh-dialog__btn smh-dialog__btn--cancel", onClick: r || i, children: n }),
      /* @__PURE__ */ V("button", { className: "smh-dialog__btn smh-dialog__btn--confirm", onClick: s, disabled: d, children: [
        d && /* @__PURE__ */ b("span", { className: "smh-dialog__spinner" }),
        l
      ] })
    ] })
  ] }) });
}
const fi = {
  confirm({ header: e, body: t, onConfirm: a, onClose: i }) {
    const r = document.createElement("div");
    document.body.appendChild(r);
    const s = () => {
      r.remove();
    }, o = document.createElement("div");
    o.className = "smh-dialog-overlay";
    const n = document.createElement("div");
    n.className = "smh-dialog";
    const p = document.createElement("div");
    p.className = "smh-dialog__header";
    const c = document.createElement("span");
    c.className = "smh-dialog__title", c.textContent = e || "确认";
    const l = document.createElement("button");
    l.className = "smh-dialog__close", l.textContent = "✕", l.onclick = () => {
      i == null || i(), s();
    }, p.appendChild(c), p.appendChild(l);
    const d = document.createElement("div");
    d.className = "smh-dialog__body", d.textContent = t || "";
    const h = document.createElement("div");
    h.className = "smh-dialog__footer";
    const u = document.createElement("button");
    u.className = "smh-dialog__btn smh-dialog__btn--cancel", u.textContent = "取消", u.onclick = () => {
      i == null || i(), s();
    };
    const y = document.createElement("button");
    y.className = "smh-dialog__btn smh-dialog__btn--confirm smh-dialog__btn--warning", y.textContent = "删除", y.onclick = () => {
      a == null || a();
    }, h.appendChild(u), h.appendChild(y), n.appendChild(p), n.appendChild(d), n.appendChild(h), o.appendChild(n), o.addEventListener("click", (A) => {
      A.target === o && (i == null || i(), s());
    });
    const f = (A) => {
      A.key === "Escape" && (i == null || i(), s(), document.removeEventListener("keydown", f));
    };
    return document.addEventListener("keydown", f), r.appendChild(o), { destroy: s };
  }
};
var ks = Object.defineProperty, Ts = (e, t) => {
  for (var a in t)
    ks(e, a, { get: t[a], enumerable: !0 });
};
function Xi(e, t) {
  return function() {
    return e.apply(t, arguments);
  };
}
var { toString: Vs } = Object.prototype, { getPrototypeOf: Ua } = Object, { iterator: Wt, toStringTag: Wi } = Symbol, Zt = /* @__PURE__ */ ((e) => (t) => {
  const a = Vs.call(t);
  return e[a] || (e[a] = a.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), me = (e) => (e = e.toLowerCase(), (t) => Zt(t) === e), Yt = (e) => (t) => typeof t === e, { isArray: at } = Array, et = Yt("undefined");
function gt(e) {
  return e !== null && !et(e) && e.constructor !== null && !et(e.constructor) && de(e.constructor.isBuffer) && e.constructor.isBuffer(e);
}
var Zi = me("ArrayBuffer");
function Ns(e) {
  let t;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? t = ArrayBuffer.isView(e) : t = e && e.buffer && Zi(e.buffer), t;
}
var Qs = Yt("string"), de = Yt("function"), Yi = Yt("number"), mt = (e) => e !== null && typeof e == "object", Ls = (e) => e === !0 || e === !1, Vt = (e) => {
  if (Zt(e) !== "object")
    return !1;
  const t = Ua(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Wi in e) && !(Wt in e);
}, Ms = (e) => {
  if (!mt(e) || gt(e))
    return !1;
  try {
    return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
  } catch {
    return !1;
  }
}, zs = me("Date"), Ps = me("File"), Hs = (e) => !!(e && typeof e.uri < "u"), $s = (e) => e && typeof e.getParts < "u", js = me("Blob"), Gs = me("FileList"), Js = (e) => mt(e) && de(e.pipe);
function Ks() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {};
}
var Ai = Ks(), Ii = typeof Ai.FormData < "u" ? Ai.FormData : void 0, Xs = (e) => {
  let t;
  return e && (Ii && e instanceof Ii || de(e.append) && ((t = Zt(e)) === "formdata" || // detect form-data instance
  t === "object" && de(e.toString) && e.toString() === "[object FormData]"));
}, Ws = me("URLSearchParams"), [Zs, Ys, qs, eo] = [
  "ReadableStream",
  "Request",
  "Response",
  "Headers"
].map(me), to = (e) => e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function bt(e, t, { allOwnKeys: a = !1 } = {}) {
  if (e === null || typeof e > "u")
    return;
  let i, r;
  if (typeof e != "object" && (e = [e]), at(e))
    for (i = 0, r = e.length; i < r; i++)
      t.call(null, e[i], i, e);
  else {
    if (gt(e))
      return;
    const s = a ? Object.getOwnPropertyNames(e) : Object.keys(e), o = s.length;
    let n;
    for (i = 0; i < o; i++)
      n = s[i], t.call(null, e[n], n, e);
  }
}
function qi(e, t) {
  if (gt(e))
    return null;
  t = t.toLowerCase();
  const a = Object.keys(e);
  let i = a.length, r;
  for (; i-- > 0; )
    if (r = a[i], t === r.toLowerCase())
      return r;
  return null;
}
var Me = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, er = (e) => !et(e) && e !== Me;
function Ea() {
  const { caseless: e, skipUndefined: t } = er(this) && this || {}, a = {}, i = (r, s) => {
    if (s === "__proto__" || s === "constructor" || s === "prototype")
      return;
    const o = e && qi(a, s) || s;
    Vt(a[o]) && Vt(r) ? a[o] = Ea(a[o], r) : Vt(r) ? a[o] = Ea({}, r) : at(r) ? a[o] = r.slice() : (!t || !et(r)) && (a[o] = r);
  };
  for (let r = 0, s = arguments.length; r < s; r++)
    arguments[r] && bt(arguments[r], i);
  return a;
}
var ao = (e, t, a, { allOwnKeys: i } = {}) => (bt(
  t,
  (r, s) => {
    a && de(r) ? Object.defineProperty(e, s, {
      value: Xi(r, a),
      writable: !0,
      enumerable: !0,
      configurable: !0
    }) : Object.defineProperty(e, s, {
      value: r,
      writable: !0,
      enumerable: !0,
      configurable: !0
    });
  },
  { allOwnKeys: i }
), e), io = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e), ro = (e, t, a, i) => {
  e.prototype = Object.create(t.prototype, i), Object.defineProperty(e.prototype, "constructor", {
    value: e,
    writable: !0,
    enumerable: !1,
    configurable: !0
  }), Object.defineProperty(e, "super", {
    value: t.prototype
  }), a && Object.assign(e.prototype, a);
}, so = (e, t, a, i) => {
  let r, s, o;
  const n = {};
  if (t = t || {}, e == null) return t;
  do {
    for (r = Object.getOwnPropertyNames(e), s = r.length; s-- > 0; )
      o = r[s], (!i || i(o, e, t)) && !n[o] && (t[o] = e[o], n[o] = !0);
    e = a !== !1 && Ua(e);
  } while (e && (!a || a(e, t)) && e !== Object.prototype);
  return t;
}, oo = (e, t, a) => {
  e = String(e), (a === void 0 || a > e.length) && (a = e.length), a -= t.length;
  const i = e.indexOf(t, a);
  return i !== -1 && i === a;
}, no = (e) => {
  if (!e) return null;
  if (at(e)) return e;
  let t = e.length;
  if (!Yi(t)) return null;
  const a = new Array(t);
  for (; t-- > 0; )
    a[t] = e[t];
  return a;
}, lo = /* @__PURE__ */ ((e) => (t) => e && t instanceof e)(typeof Uint8Array < "u" && Ua(Uint8Array)), co = (e, t) => {
  const i = (e && e[Wt]).call(e);
  let r;
  for (; (r = i.next()) && !r.done; ) {
    const s = r.value;
    t.call(e, s[0], s[1]);
  }
}, ho = (e, t) => {
  let a;
  const i = [];
  for (; (a = e.exec(t)) !== null; )
    i.push(a);
  return i;
}, po = me("HTMLFormElement"), uo = (e) => e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function(a, i, r) {
  return i.toUpperCase() + r;
}), gi = (({ hasOwnProperty: e }) => (t, a) => e.call(t, a))(Object.prototype), yo = me("RegExp"), tr = (e, t) => {
  const a = Object.getOwnPropertyDescriptors(e), i = {};
  bt(a, (r, s) => {
    let o;
    (o = t(r, s, e)) !== !1 && (i[s] = o || r);
  }), Object.defineProperties(e, i);
}, fo = (e) => {
  tr(e, (t, a) => {
    if (de(e) && ["arguments", "caller", "callee"].indexOf(a) !== -1)
      return !1;
    const i = e[a];
    if (de(i)) {
      if (t.enumerable = !1, "writable" in t) {
        t.writable = !1;
        return;
      }
      t.set || (t.set = () => {
        throw Error("Can not rewrite read-only method '" + a + "'");
      });
    }
  });
}, Ao = (e, t) => {
  const a = {}, i = (r) => {
    r.forEach((s) => {
      a[s] = !0;
    });
  };
  return at(e) ? i(e) : i(String(e).split(t)), a;
}, Io = () => {
}, go = (e, t) => e != null && Number.isFinite(e = +e) ? e : t;
function mo(e) {
  return !!(e && de(e.append) && e[Wi] === "FormData" && e[Wt]);
}
var bo = (e) => {
  const t = new Array(10), a = (i, r) => {
    if (mt(i)) {
      if (t.indexOf(i) >= 0)
        return;
      if (gt(i))
        return i;
      if (!("toJSON" in i)) {
        t[r] = i;
        const s = at(i) ? [] : {};
        return bt(i, (o, n) => {
          const p = a(o, r + 1);
          !et(p) && (s[n] = p);
        }), t[r] = void 0, s;
      }
    }
    return i;
  };
  return a(e, 0);
}, vo = me("AsyncFunction"), Eo = (e) => e && (mt(e) || de(e)) && de(e.then) && de(e.catch), ar = ((e, t) => e ? setImmediate : t ? ((a, i) => (Me.addEventListener(
  "message",
  ({ source: r, data: s }) => {
    r === Me && s === a && i.length && i.shift()();
  },
  !1
), (r) => {
  i.push(r), Me.postMessage(a, "*");
}))(`axios@${Math.random()}`, []) : (a) => setTimeout(a))(typeof setImmediate == "function", de(Me.postMessage)), Fo = typeof queueMicrotask < "u" ? queueMicrotask.bind(Me) : typeof process < "u" && process.nextTick || ar, So = (e) => e != null && de(e[Wt]), E = {
  isArray: at,
  isArrayBuffer: Zi,
  isBuffer: gt,
  isFormData: Xs,
  isArrayBufferView: Ns,
  isString: Qs,
  isNumber: Yi,
  isBoolean: Ls,
  isObject: mt,
  isPlainObject: Vt,
  isEmptyObject: Ms,
  isReadableStream: Zs,
  isRequest: Ys,
  isResponse: qs,
  isHeaders: eo,
  isUndefined: et,
  isDate: zs,
  isFile: Ps,
  isReactNativeBlob: Hs,
  isReactNative: $s,
  isBlob: js,
  isRegExp: yo,
  isFunction: de,
  isStream: Js,
  isURLSearchParams: Ws,
  isTypedArray: lo,
  isFileList: Gs,
  forEach: bt,
  merge: Ea,
  extend: ao,
  trim: to,
  stripBOM: io,
  inherits: ro,
  toFlatObject: so,
  kindOf: Zt,
  kindOfTest: me,
  endsWith: oo,
  toArray: no,
  forEachEntry: co,
  matchAll: ho,
  isHTMLForm: po,
  hasOwnProperty: gi,
  hasOwnProp: gi,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: tr,
  freezeMethods: fo,
  toObjectSet: Ao,
  toCamelCase: uo,
  noop: Io,
  toFiniteNumber: go,
  findKey: qi,
  global: Me,
  isContextDefined: er,
  isSpecCompliantForm: mo,
  toJSONObject: bo,
  isAsyncFn: vo,
  isThenable: Eo,
  setImmediate: ar,
  asap: Fo,
  isIterable: So
}, ue = class ir extends Error {
  static from(t, a, i, r, s, o) {
    const n = new ir(t.message, a || t.code, i, r, s);
    return n.cause = t, n.name = t.name, t.status != null && n.status == null && (n.status = t.status), o && Object.assign(n, o), n;
  }
  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [config] The config.
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   *
   * @returns {Error} The created error.
   */
  constructor(t, a, i, r, s) {
    super(t), Object.defineProperty(this, "message", {
      value: t,
      enumerable: !0,
      writable: !0,
      configurable: !0
    }), this.name = "AxiosError", this.isAxiosError = !0, a && (this.code = a), i && (this.config = i), r && (this.request = r), s && (this.response = s, this.status = s.status);
  }
  toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: E.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
};
ue.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
ue.ERR_BAD_OPTION = "ERR_BAD_OPTION";
ue.ECONNABORTED = "ECONNABORTED";
ue.ETIMEDOUT = "ETIMEDOUT";
ue.ERR_NETWORK = "ERR_NETWORK";
ue.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
ue.ERR_DEPRECATED = "ERR_DEPRECATED";
ue.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
ue.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
ue.ERR_CANCELED = "ERR_CANCELED";
ue.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
ue.ERR_INVALID_URL = "ERR_INVALID_URL";
var P = ue, Bo = null;
function Fa(e) {
  return E.isPlainObject(e) || E.isArray(e);
}
function rr(e) {
  return E.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function la(e, t, a) {
  return e ? e.concat(t).map(function(r, s) {
    return r = rr(r), !a && s ? "[" + r + "]" : r;
  }).join(a ? "." : "") : t;
}
function wo(e) {
  return E.isArray(e) && !e.some(Fa);
}
var Co = E.toFlatObject(E, {}, null, function(t) {
  return /^is[A-Z]/.test(t);
});
function _o(e, t, a) {
  if (!E.isObject(e))
    throw new TypeError("target must be an object");
  t = t || new FormData(), a = E.toFlatObject(
    a,
    {
      metaTokens: !0,
      dots: !1,
      indexes: !1
    },
    !1,
    function(f, A) {
      return !E.isUndefined(A[f]);
    }
  );
  const i = a.metaTokens, r = a.visitor || l, s = a.dots, o = a.indexes, p = (a.Blob || typeof Blob < "u" && Blob) && E.isSpecCompliantForm(t);
  if (!E.isFunction(r))
    throw new TypeError("visitor must be a function");
  function c(y) {
    if (y === null) return "";
    if (E.isDate(y))
      return y.toISOString();
    if (E.isBoolean(y))
      return y.toString();
    if (!p && E.isBlob(y))
      throw new P("Blob is not supported. Use a Buffer instead.");
    return E.isArrayBuffer(y) || E.isTypedArray(y) ? p && typeof Blob == "function" ? new Blob([y]) : Buffer.from(y) : y;
  }
  function l(y, f, A) {
    let m = y;
    if (E.isReactNative(t) && E.isReactNativeBlob(y))
      return t.append(la(A, f, s), c(y)), !1;
    if (y && !A && typeof y == "object") {
      if (E.endsWith(f, "{}"))
        f = i ? f : f.slice(0, -2), y = JSON.stringify(y);
      else if (E.isArray(y) && wo(y) || (E.isFileList(y) || E.endsWith(f, "[]")) && (m = E.toArray(y)))
        return f = rr(f), m.forEach(function(v, C) {
          !(E.isUndefined(v) || v === null) && t.append(
            // eslint-disable-next-line no-nested-ternary
            o === !0 ? la([f], C, s) : o === null ? f : f + "[]",
            c(v)
          );
        }), !1;
    }
    return Fa(y) ? !0 : (t.append(la(A, f, s), c(y)), !1);
  }
  const d = [], h = Object.assign(Co, {
    defaultVisitor: l,
    convertValue: c,
    isVisitable: Fa
  });
  function u(y, f) {
    if (!E.isUndefined(y)) {
      if (d.indexOf(y) !== -1)
        throw Error("Circular reference detected in " + f.join("."));
      d.push(y), E.forEach(y, function(m, F) {
        (!(E.isUndefined(m) || m === null) && r.call(t, m, E.isString(F) ? F.trim() : F, f, h)) === !0 && u(m, f ? f.concat(F) : [F]);
      }), d.pop();
    }
  }
  if (!E.isObject(e))
    throw new TypeError("data must be an object");
  return u(e), t;
}
var qt = _o;
function mi(e) {
  const t = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(e).replace(/[!'()~]|%20|%00/g, function(i) {
    return t[i];
  });
}
function sr(e, t) {
  this._pairs = [], e && qt(e, this, t);
}
var or = sr.prototype;
or.append = function(t, a) {
  this._pairs.push([t, a]);
};
or.toString = function(t) {
  const a = t ? function(i) {
    return t.call(this, i, mi);
  } : mi;
  return this._pairs.map(function(r) {
    return a(r[0]) + "=" + a(r[1]);
  }, "").join("&");
};
var nr = sr;
function Ro(e) {
  return encodeURIComponent(e).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function lr(e, t, a) {
  if (!t)
    return e;
  const i = a && a.encode || Ro, r = E.isFunction(a) ? {
    serialize: a
  } : a, s = r && r.serialize;
  let o;
  if (s ? o = s(t, r) : o = E.isURLSearchParams(t) ? t.toString() : new nr(t, r).toString(i), o) {
    const n = e.indexOf("#");
    n !== -1 && (e = e.slice(0, n)), e += (e.indexOf("?") === -1 ? "?" : "&") + o;
  }
  return e;
}
var xo = class {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   * @param {Object} options The options for the interceptor, synchronous and runWhen
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(e, t, a) {
    return this.handlers.push({
      fulfilled: e,
      rejected: t,
      synchronous: a ? a.synchronous : !1,
      runWhen: a ? a.runWhen : null
    }), this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {void}
   */
  eject(e) {
    this.handlers[e] && (this.handlers[e] = null);
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = []);
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(e) {
    E.forEach(this.handlers, function(a) {
      a !== null && e(a);
    });
  }
}, bi = xo, ka = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1,
  legacyInterceptorReqResOrdering: !0
}, Do = typeof URLSearchParams < "u" ? URLSearchParams : nr, Oo = typeof FormData < "u" ? FormData : null, Uo = typeof Blob < "u" ? Blob : null, ko = {
  isBrowser: !0,
  classes: {
    URLSearchParams: Do,
    FormData: Oo,
    Blob: Uo
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, cr = {};
Ts(cr, {
  hasBrowserEnv: () => Ta,
  hasStandardBrowserEnv: () => To,
  hasStandardBrowserWebWorkerEnv: () => Vo,
  navigator: () => Sa,
  origin: () => No
});
var Ta = typeof window < "u" && typeof document < "u", Sa = typeof navigator == "object" && navigator || void 0, To = Ta && (!Sa || ["ReactNative", "NativeScript", "NS"].indexOf(Sa.product) < 0), Vo = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", No = Ta && window.location.href || "http://localhost", ne = {
  ...cr,
  ...ko
};
function Qo(e, t) {
  return qt(e, new ne.classes.URLSearchParams(), {
    visitor: function(a, i, r, s) {
      return ne.isNode && E.isBuffer(a) ? (this.append(i, a.toString("base64")), !1) : s.defaultVisitor.apply(this, arguments);
    },
    ...t
  });
}
function Lo(e) {
  return E.matchAll(/\w+|\[(\w*)]/g, e).map((t) => t[0] === "[]" ? "" : t[1] || t[0]);
}
function Mo(e) {
  const t = {}, a = Object.keys(e);
  let i;
  const r = a.length;
  let s;
  for (i = 0; i < r; i++)
    s = a[i], t[s] = e[s];
  return t;
}
function zo(e) {
  function t(a, i, r, s) {
    let o = a[s++];
    if (o === "__proto__") return !0;
    const n = Number.isFinite(+o), p = s >= a.length;
    return o = !o && E.isArray(r) ? r.length : o, p ? (E.hasOwnProp(r, o) ? r[o] = [r[o], i] : r[o] = i, !n) : ((!r[o] || !E.isObject(r[o])) && (r[o] = []), t(a, i, r[o], s) && E.isArray(r[o]) && (r[o] = Mo(r[o])), !n);
  }
  if (E.isFormData(e) && E.isFunction(e.entries)) {
    const a = {};
    return E.forEachEntry(e, (i, r) => {
      t(Lo(i), r, a, 0);
    }), a;
  }
  return null;
}
var dr = zo;
function Po(e, t, a) {
  if (E.isString(e))
    try {
      return (t || JSON.parse)(e), E.trim(e);
    } catch (i) {
      if (i.name !== "SyntaxError")
        throw i;
    }
  return (a || JSON.stringify)(e);
}
var Va = {
  transitional: ka,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function(t, a) {
      const i = a.getContentType() || "", r = i.indexOf("application/json") > -1, s = E.isObject(t);
      if (s && E.isHTMLForm(t) && (t = new FormData(t)), E.isFormData(t))
        return r ? JSON.stringify(dr(t)) : t;
      if (E.isArrayBuffer(t) || E.isBuffer(t) || E.isStream(t) || E.isFile(t) || E.isBlob(t) || E.isReadableStream(t))
        return t;
      if (E.isArrayBufferView(t))
        return t.buffer;
      if (E.isURLSearchParams(t))
        return a.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), t.toString();
      let n;
      if (s) {
        if (i.indexOf("application/x-www-form-urlencoded") > -1)
          return Qo(t, this.formSerializer).toString();
        if ((n = E.isFileList(t)) || i.indexOf("multipart/form-data") > -1) {
          const p = this.env && this.env.FormData;
          return qt(
            n ? { "files[]": t } : t,
            p && new p(),
            this.formSerializer
          );
        }
      }
      return s || r ? (a.setContentType("application/json", !1), Po(t)) : t;
    }
  ],
  transformResponse: [
    function(t) {
      const a = this.transitional || Va.transitional, i = a && a.forcedJSONParsing, r = this.responseType === "json";
      if (E.isResponse(t) || E.isReadableStream(t))
        return t;
      if (t && E.isString(t) && (i && !this.responseType || r)) {
        const o = !(a && a.silentJSONParsing) && r;
        try {
          return JSON.parse(t, this.parseReviver);
        } catch (n) {
          if (o)
            throw n.name === "SyntaxError" ? P.from(n, P.ERR_BAD_RESPONSE, this, null, this.response) : n;
        }
      }
      return t;
    }
  ],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: ne.classes.FormData,
    Blob: ne.classes.Blob
  },
  validateStatus: function(t) {
    return t >= 200 && t < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
E.forEach(["delete", "get", "head", "post", "put", "patch"], (e) => {
  Va.headers[e] = {};
});
var Na = Va, Ho = E.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]), $o = (e) => {
  const t = {};
  let a, i, r;
  return e && e.split(`
`).forEach(function(o) {
    r = o.indexOf(":"), a = o.substring(0, r).trim().toLowerCase(), i = o.substring(r + 1).trim(), !(!a || t[a] && Ho[a]) && (a === "set-cookie" ? t[a] ? t[a].push(i) : t[a] = [i] : t[a] = t[a] ? t[a] + ", " + i : i);
  }), t;
}, vi = /* @__PURE__ */ Symbol("internals");
function dt(e) {
  return e && String(e).trim().toLowerCase();
}
function Nt(e) {
  return e === !1 || e == null ? e : E.isArray(e) ? e.map(Nt) : String(e);
}
function jo(e) {
  const t = /* @__PURE__ */ Object.create(null), a = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let i;
  for (; i = a.exec(e); )
    t[i[1]] = i[2];
  return t;
}
var Go = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function ca(e, t, a, i, r) {
  if (E.isFunction(i))
    return i.call(this, t, a);
  if (r && (t = a), !!E.isString(t)) {
    if (E.isString(i))
      return t.indexOf(i) !== -1;
    if (E.isRegExp(i))
      return i.test(t);
  }
}
function Jo(e) {
  return e.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (t, a, i) => a.toUpperCase() + i);
}
function Ko(e, t) {
  const a = E.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((i) => {
    Object.defineProperty(e, i + a, {
      value: function(r, s, o) {
        return this[i].call(this, t, r, s, o);
      },
      configurable: !0
    });
  });
}
var ea = class {
  constructor(e) {
    e && this.set(e);
  }
  set(e, t, a) {
    const i = this;
    function r(o, n, p) {
      const c = dt(n);
      if (!c)
        throw new Error("header name must be a non-empty string");
      const l = E.findKey(i, c);
      (!l || i[l] === void 0 || p === !0 || p === void 0 && i[l] !== !1) && (i[l || n] = Nt(o));
    }
    const s = (o, n) => E.forEach(o, (p, c) => r(p, c, n));
    if (E.isPlainObject(e) || e instanceof this.constructor)
      s(e, t);
    else if (E.isString(e) && (e = e.trim()) && !Go(e))
      s($o(e), t);
    else if (E.isObject(e) && E.isIterable(e)) {
      let o = {}, n, p;
      for (const c of e) {
        if (!E.isArray(c))
          throw TypeError("Object iterator must return a key-value pair");
        o[p = c[0]] = (n = o[p]) ? E.isArray(n) ? [...n, c[1]] : [n, c[1]] : c[1];
      }
      s(o, t);
    } else
      e != null && r(t, e, a);
    return this;
  }
  get(e, t) {
    if (e = dt(e), e) {
      const a = E.findKey(this, e);
      if (a) {
        const i = this[a];
        if (!t)
          return i;
        if (t === !0)
          return jo(i);
        if (E.isFunction(t))
          return t.call(this, i, a);
        if (E.isRegExp(t))
          return t.exec(i);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(e, t) {
    if (e = dt(e), e) {
      const a = E.findKey(this, e);
      return !!(a && this[a] !== void 0 && (!t || ca(this, this[a], a, t)));
    }
    return !1;
  }
  delete(e, t) {
    const a = this;
    let i = !1;
    function r(s) {
      if (s = dt(s), s) {
        const o = E.findKey(a, s);
        o && (!t || ca(a, a[o], o, t)) && (delete a[o], i = !0);
      }
    }
    return E.isArray(e) ? e.forEach(r) : r(e), i;
  }
  clear(e) {
    const t = Object.keys(this);
    let a = t.length, i = !1;
    for (; a--; ) {
      const r = t[a];
      (!e || ca(this, this[r], r, e, !0)) && (delete this[r], i = !0);
    }
    return i;
  }
  normalize(e) {
    const t = this, a = {};
    return E.forEach(this, (i, r) => {
      const s = E.findKey(a, r);
      if (s) {
        t[s] = Nt(i), delete t[r];
        return;
      }
      const o = e ? Jo(r) : String(r).trim();
      o !== r && delete t[r], t[o] = Nt(i), a[o] = !0;
    }), this;
  }
  concat(...e) {
    return this.constructor.concat(this, ...e);
  }
  toJSON(e) {
    const t = /* @__PURE__ */ Object.create(null);
    return E.forEach(this, (a, i) => {
      a != null && a !== !1 && (t[i] = e && E.isArray(a) ? a.join(", ") : a);
    }), t;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([e, t]) => e + ": " + t).join(`
`);
  }
  getSetCookie() {
    return this.get("set-cookie") || [];
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(e) {
    return e instanceof this ? e : new this(e);
  }
  static concat(e, ...t) {
    const a = new this(e);
    return t.forEach((i) => a.set(i)), a;
  }
  static accessor(e) {
    const a = (this[vi] = this[vi] = {
      accessors: {}
    }).accessors, i = this.prototype;
    function r(s) {
      const o = dt(s);
      a[o] || (Ko(i, s), a[o] = !0);
    }
    return E.isArray(e) ? e.forEach(r) : r(e), this;
  }
};
ea.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization"
]);
E.reduceDescriptors(ea.prototype, ({ value: e }, t) => {
  let a = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(i) {
      this[a] = i;
    }
  };
});
E.freezeMethods(ea);
var Ie = ea;
function da(e, t) {
  const a = this || Na, i = t || a, r = Ie.from(i.headers);
  let s = i.data;
  return E.forEach(e, function(n) {
    s = n.call(a, s, r.normalize(), t ? t.status : void 0);
  }), r.normalize(), s;
}
function hr(e) {
  return !!(e && e.__CANCEL__);
}
var Xo = class extends P {
  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   *
   * @returns {CanceledError} The created error.
   */
  constructor(e, t, a) {
    super(e ?? "canceled", P.ERR_CANCELED, t, a), this.name = "CanceledError", this.__CANCEL__ = !0;
  }
}, vt = Xo;
function pr(e, t, a) {
  const i = a.config.validateStatus;
  !a.status || !i || i(a.status) ? e(a) : t(
    new P(
      "Request failed with status code " + a.status,
      [P.ERR_BAD_REQUEST, P.ERR_BAD_RESPONSE][Math.floor(a.status / 100) - 4],
      a.config,
      a.request,
      a
    )
  );
}
function Wo(e) {
  const t = /^([-+\w]{1,25})(:?\/\/|:)/.exec(e);
  return t && t[1] || "";
}
function Zo(e, t) {
  e = e || 10;
  const a = new Array(e), i = new Array(e);
  let r = 0, s = 0, o;
  return t = t !== void 0 ? t : 1e3, function(p) {
    const c = Date.now(), l = i[s];
    o || (o = c), a[r] = p, i[r] = c;
    let d = s, h = 0;
    for (; d !== r; )
      h += a[d++], d = d % e;
    if (r = (r + 1) % e, r === s && (s = (s + 1) % e), c - o < t)
      return;
    const u = l && c - l;
    return u ? Math.round(h * 1e3 / u) : void 0;
  };
}
var Yo = Zo;
function qo(e, t) {
  let a = 0, i = 1e3 / t, r, s;
  const o = (c, l = Date.now()) => {
    a = l, r = null, s && (clearTimeout(s), s = null), e(...c);
  };
  return [(...c) => {
    const l = Date.now(), d = l - a;
    d >= i ? o(c, l) : (r = c, s || (s = setTimeout(() => {
      s = null, o(r);
    }, i - d)));
  }, () => r && o(r)];
}
var en = qo, Ht = (e, t, a = 3) => {
  let i = 0;
  const r = Yo(50, 250);
  return en((s) => {
    const o = s.loaded, n = s.lengthComputable ? s.total : void 0, p = o - i, c = r(p), l = o <= n;
    i = o;
    const d = {
      loaded: o,
      total: n,
      progress: n ? o / n : void 0,
      bytes: p,
      rate: c || void 0,
      estimated: c && n && l ? (n - o) / c : void 0,
      event: s,
      lengthComputable: n != null,
      [t ? "download" : "upload"]: !0
    };
    e(d);
  }, a);
}, Ei = (e, t) => {
  const a = e != null;
  return [
    (i) => t[0]({
      lengthComputable: a,
      total: e,
      loaded: i
    }),
    t[1]
  ];
}, Fi = (e) => (...t) => E.asap(() => e(...t)), tn = ne.hasStandardBrowserEnv ? /* @__PURE__ */ ((e, t) => (a) => (a = new URL(a, ne.origin), e.protocol === a.protocol && e.host === a.host && (t || e.port === a.port)))(
  new URL(ne.origin),
  ne.navigator && /(msie|trident)/i.test(ne.navigator.userAgent)
) : () => !0, an = ne.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(e, t, a, i, r, s, o) {
      if (typeof document > "u") return;
      const n = [`${e}=${encodeURIComponent(t)}`];
      E.isNumber(a) && n.push(`expires=${new Date(a).toUTCString()}`), E.isString(i) && n.push(`path=${i}`), E.isString(r) && n.push(`domain=${r}`), s === !0 && n.push("secure"), E.isString(o) && n.push(`SameSite=${o}`), document.cookie = n.join("; ");
    },
    read(e) {
      if (typeof document > "u") return null;
      const t = document.cookie.match(new RegExp("(?:^|; )" + e + "=([^;]*)"));
      return t ? decodeURIComponent(t[1]) : null;
    },
    remove(e) {
      this.write(e, "", Date.now() - 864e5, "/");
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function rn(e) {
  return typeof e != "string" ? !1 : /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function sn(e, t) {
  return t ? e.replace(/\/?\/$/, "") + "/" + t.replace(/^\/+/, "") : e;
}
function ur(e, t, a) {
  let i = !rn(t);
  return e && (i || a == !1) ? sn(e, t) : t;
}
var Si = (e) => e instanceof Ie ? { ...e } : e;
function Pe(e, t) {
  t = t || {};
  const a = {};
  function i(c, l, d, h) {
    return E.isPlainObject(c) && E.isPlainObject(l) ? E.merge.call({ caseless: h }, c, l) : E.isPlainObject(l) ? E.merge({}, l) : E.isArray(l) ? l.slice() : l;
  }
  function r(c, l, d, h) {
    if (E.isUndefined(l)) {
      if (!E.isUndefined(c))
        return i(void 0, c, d, h);
    } else return i(c, l, d, h);
  }
  function s(c, l) {
    if (!E.isUndefined(l))
      return i(void 0, l);
  }
  function o(c, l) {
    if (E.isUndefined(l)) {
      if (!E.isUndefined(c))
        return i(void 0, c);
    } else return i(void 0, l);
  }
  function n(c, l, d) {
    if (d in t)
      return i(c, l);
    if (d in e)
      return i(void 0, c);
  }
  const p = {
    url: s,
    method: s,
    data: s,
    baseURL: o,
    transformRequest: o,
    transformResponse: o,
    paramsSerializer: o,
    timeout: o,
    timeoutMessage: o,
    withCredentials: o,
    withXSRFToken: o,
    adapter: o,
    responseType: o,
    xsrfCookieName: o,
    xsrfHeaderName: o,
    onUploadProgress: o,
    onDownloadProgress: o,
    decompress: o,
    maxContentLength: o,
    maxBodyLength: o,
    beforeRedirect: o,
    transport: o,
    httpAgent: o,
    httpsAgent: o,
    cancelToken: o,
    socketPath: o,
    responseEncoding: o,
    validateStatus: n,
    headers: (c, l, d) => r(Si(c), Si(l), d, !0)
  };
  return E.forEach(Object.keys({ ...e, ...t }), function(l) {
    if (l === "__proto__" || l === "constructor" || l === "prototype") return;
    const d = E.hasOwnProp(p, l) ? p[l] : r, h = d(e[l], t[l], l);
    E.isUndefined(h) && d !== n || (a[l] = h);
  }), a;
}
var yr = (e) => {
  const t = Pe({}, e);
  let { data: a, withXSRFToken: i, xsrfHeaderName: r, xsrfCookieName: s, headers: o, auth: n } = t;
  if (t.headers = o = Ie.from(o), t.url = lr(
    ur(t.baseURL, t.url, t.allowAbsoluteUrls),
    e.params,
    e.paramsSerializer
  ), n && o.set(
    "Authorization",
    "Basic " + btoa(
      (n.username || "") + ":" + (n.password ? unescape(encodeURIComponent(n.password)) : "")
    )
  ), E.isFormData(a)) {
    if (ne.hasStandardBrowserEnv || ne.hasStandardBrowserWebWorkerEnv)
      o.setContentType(void 0);
    else if (E.isFunction(a.getHeaders)) {
      const p = a.getHeaders(), c = ["content-type", "content-length"];
      Object.entries(p).forEach(([l, d]) => {
        c.includes(l.toLowerCase()) && o.set(l, d);
      });
    }
  }
  if (ne.hasStandardBrowserEnv && (i && E.isFunction(i) && (i = i(t)), i || i !== !1 && tn(t.url))) {
    const p = r && s && an.read(s);
    p && o.set(r, p);
  }
  return t;
}, on = typeof XMLHttpRequest < "u", nn = on && function(e) {
  return new Promise(function(a, i) {
    const r = yr(e);
    let s = r.data;
    const o = Ie.from(r.headers).normalize();
    let { responseType: n, onUploadProgress: p, onDownloadProgress: c } = r, l, d, h, u, y;
    function f() {
      u && u(), y && y(), r.cancelToken && r.cancelToken.unsubscribe(l), r.signal && r.signal.removeEventListener("abort", l);
    }
    let A = new XMLHttpRequest();
    A.open(r.method.toUpperCase(), r.url, !0), A.timeout = r.timeout;
    function m() {
      if (!A)
        return;
      const v = Ie.from(
        "getAllResponseHeaders" in A && A.getAllResponseHeaders()
      ), _ = {
        data: !n || n === "text" || n === "json" ? A.responseText : A.response,
        status: A.status,
        statusText: A.statusText,
        headers: v,
        config: e,
        request: A
      };
      pr(
        function(B) {
          a(B), f();
        },
        function(B) {
          i(B), f();
        },
        _
      ), A = null;
    }
    "onloadend" in A ? A.onloadend = m : A.onreadystatechange = function() {
      !A || A.readyState !== 4 || A.status === 0 && !(A.responseURL && A.responseURL.indexOf("file:") === 0) || setTimeout(m);
    }, A.onabort = function() {
      A && (i(new P("Request aborted", P.ECONNABORTED, e, A)), A = null);
    }, A.onerror = function(C) {
      const _ = C && C.message ? C.message : "Network Error", w = new P(_, P.ERR_NETWORK, e, A);
      w.event = C || null, i(w), A = null;
    }, A.ontimeout = function() {
      let C = r.timeout ? "timeout of " + r.timeout + "ms exceeded" : "timeout exceeded";
      const _ = r.transitional || ka;
      r.timeoutErrorMessage && (C = r.timeoutErrorMessage), i(
        new P(
          C,
          _.clarifyTimeoutError ? P.ETIMEDOUT : P.ECONNABORTED,
          e,
          A
        )
      ), A = null;
    }, s === void 0 && o.setContentType(null), "setRequestHeader" in A && E.forEach(o.toJSON(), function(C, _) {
      A.setRequestHeader(_, C);
    }), E.isUndefined(r.withCredentials) || (A.withCredentials = !!r.withCredentials), n && n !== "json" && (A.responseType = r.responseType), c && ([h, y] = Ht(c, !0), A.addEventListener("progress", h)), p && A.upload && ([d, u] = Ht(p), A.upload.addEventListener("progress", d), A.upload.addEventListener("loadend", u)), (r.cancelToken || r.signal) && (l = (v) => {
      A && (i(!v || v.type ? new vt(null, e, A) : v), A.abort(), A = null);
    }, r.cancelToken && r.cancelToken.subscribe(l), r.signal && (r.signal.aborted ? l() : r.signal.addEventListener("abort", l)));
    const F = Wo(r.url);
    if (F && ne.protocols.indexOf(F) === -1) {
      i(
        new P(
          "Unsupported protocol " + F + ":",
          P.ERR_BAD_REQUEST,
          e
        )
      );
      return;
    }
    A.send(s || null);
  });
}, ln = (e, t) => {
  const { length: a } = e = e ? e.filter(Boolean) : [];
  if (t || a) {
    let i = new AbortController(), r;
    const s = function(c) {
      if (!r) {
        r = !0, n();
        const l = c instanceof Error ? c : this.reason;
        i.abort(
          l instanceof P ? l : new vt(l instanceof Error ? l.message : l)
        );
      }
    };
    let o = t && setTimeout(() => {
      o = null, s(new P(`timeout of ${t}ms exceeded`, P.ETIMEDOUT));
    }, t);
    const n = () => {
      e && (o && clearTimeout(o), o = null, e.forEach((c) => {
        c.unsubscribe ? c.unsubscribe(s) : c.removeEventListener("abort", s);
      }), e = null);
    };
    e.forEach((c) => c.addEventListener("abort", s));
    const { signal: p } = i;
    return p.unsubscribe = () => E.asap(n), p;
  }
}, cn = ln, dn = function* (e, t) {
  let a = e.byteLength;
  if (a < t) {
    yield e;
    return;
  }
  let i = 0, r;
  for (; i < a; )
    r = i + t, yield e.slice(i, r), i = r;
}, hn = async function* (e, t) {
  for await (const a of pn(e))
    yield* dn(a, t);
}, pn = async function* (e) {
  if (e[Symbol.asyncIterator]) {
    yield* e;
    return;
  }
  const t = e.getReader();
  try {
    for (; ; ) {
      const { done: a, value: i } = await t.read();
      if (a)
        break;
      yield i;
    }
  } finally {
    await t.cancel();
  }
}, Bi = (e, t, a, i) => {
  const r = hn(e, t);
  let s = 0, o, n = (p) => {
    o || (o = !0, i && i(p));
  };
  return new ReadableStream(
    {
      async pull(p) {
        try {
          const { done: c, value: l } = await r.next();
          if (c) {
            n(), p.close();
            return;
          }
          let d = l.byteLength;
          if (a) {
            let h = s += d;
            a(h);
          }
          p.enqueue(new Uint8Array(l));
        } catch (c) {
          throw n(c), c;
        }
      },
      cancel(p) {
        return n(p), r.return();
      }
    },
    {
      highWaterMark: 2
    }
  );
}, wi = 64 * 1024, { isFunction: Rt } = E, un = (({ Request: e, Response: t }) => ({
  Request: e,
  Response: t
}))(E.global), { ReadableStream: Ci, TextEncoder: _i } = E.global, Ri = (e, ...t) => {
  try {
    return !!e(...t);
  } catch {
    return !1;
  }
}, yn = (e) => {
  e = E.merge.call(
    {
      skipUndefined: !0
    },
    un,
    e
  );
  const { fetch: t, Request: a, Response: i } = e, r = t ? Rt(t) : typeof fetch == "function", s = Rt(a), o = Rt(i);
  if (!r)
    return !1;
  const n = r && Rt(Ci), p = r && (typeof _i == "function" ? /* @__PURE__ */ ((y) => (f) => y.encode(f))(new _i()) : async (y) => new Uint8Array(await new a(y).arrayBuffer())), c = s && n && Ri(() => {
    let y = !1;
    const f = new a(ne.origin, {
      body: new Ci(),
      method: "POST",
      get duplex() {
        return y = !0, "half";
      }
    }).headers.has("Content-Type");
    return y && !f;
  }), l = o && n && Ri(() => E.isReadableStream(new i("").body)), d = {
    stream: l && ((y) => y.body)
  };
  r && ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((y) => {
    !d[y] && (d[y] = (f, A) => {
      let m = f && f[y];
      if (m)
        return m.call(f);
      throw new P(
        `Response type '${y}' is not supported`,
        P.ERR_NOT_SUPPORT,
        A
      );
    });
  });
  const h = async (y) => {
    if (y == null)
      return 0;
    if (E.isBlob(y))
      return y.size;
    if (E.isSpecCompliantForm(y))
      return (await new a(ne.origin, {
        method: "POST",
        body: y
      }).arrayBuffer()).byteLength;
    if (E.isArrayBufferView(y) || E.isArrayBuffer(y))
      return y.byteLength;
    if (E.isURLSearchParams(y) && (y = y + ""), E.isString(y))
      return (await p(y)).byteLength;
  }, u = async (y, f) => {
    const A = E.toFiniteNumber(y.getContentLength());
    return A ?? h(f);
  };
  return async (y) => {
    let {
      url: f,
      method: A,
      data: m,
      signal: F,
      cancelToken: v,
      timeout: C,
      onDownloadProgress: _,
      onUploadProgress: w,
      responseType: B,
      headers: H,
      withCredentials: J = "same-origin",
      fetchOptions: j
    } = yr(y), Be = t || fetch;
    B = B ? (B + "").toLowerCase() : "text";
    let He = cn(
      [F, v && v.toAbortSignal()],
      C
    ), we = null;
    const Ce = He && He.unsubscribe && (() => {
      He.unsubscribe();
    });
    let Te;
    try {
      if (w && c && A !== "get" && A !== "head" && (Te = await u(H, m)) !== 0) {
        let ye = new a(f, {
          method: "POST",
          body: m,
          duplex: "half"
        }), Re;
        if (E.isFormData(m) && (Re = ye.headers.get("content-type")) && H.setContentType(Re), ye.body) {
          const [rt, Oe] = Ei(
            Te,
            Ht(Fi(w))
          );
          m = Bi(ye.body, wi, rt, Oe);
        }
      }
      E.isString(J) || (J = J ? "include" : "omit");
      const W = s && "credentials" in a.prototype, Ve = {
        ...j,
        signal: He,
        method: A.toUpperCase(),
        headers: H.normalize().toJSON(),
        body: m,
        duplex: "half",
        credentials: W ? J : void 0
      };
      we = s && new a(f, Ve);
      let le = await (s ? Be(we, j) : Be(f, Ve));
      const _e = l && (B === "stream" || B === "response");
      if (l && (_ || _e && Ce)) {
        const ye = {};
        ["status", "statusText", "headers"].forEach(($e) => {
          ye[$e] = le[$e];
        });
        const Re = E.toFiniteNumber(le.headers.get("content-length")), [rt, Oe] = _ && Ei(
          Re,
          Ht(Fi(_), !0)
        ) || [];
        le = new i(
          Bi(le.body, wi, rt, () => {
            Oe && Oe(), Ce && Ce();
          }),
          ye
        );
      }
      B = B || "text";
      let it = await d[E.findKey(d, B) || "text"](
        le,
        y
      );
      return !_e && Ce && Ce(), await new Promise((ye, Re) => {
        pr(ye, Re, {
          data: it,
          headers: Ie.from(le.headers),
          status: le.status,
          statusText: le.statusText,
          config: y,
          request: we
        });
      });
    } catch (W) {
      throw Ce && Ce(), W && W.name === "TypeError" && /Load failed|fetch/i.test(W.message) ? Object.assign(
        new P(
          "Network Error",
          P.ERR_NETWORK,
          y,
          we,
          W && W.response
        ),
        {
          cause: W.cause || W
        }
      ) : P.from(W, W && W.code, y, we, W && W.response);
    }
  };
}, fn = /* @__PURE__ */ new Map(), fr = (e) => {
  let t = e && e.env || {};
  const { fetch: a, Request: i, Response: r } = t, s = [i, r, a];
  let o = s.length, n = o, p, c, l = fn;
  for (; n--; )
    p = s[n], c = l.get(p), c === void 0 && l.set(p, c = n ? /* @__PURE__ */ new Map() : yn(t)), l = c;
  return c;
};
fr();
var Qa = {
  http: Bo,
  xhr: nn,
  fetch: {
    get: fr
  }
};
E.forEach(Qa, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { value: t });
    } catch {
    }
    Object.defineProperty(e, "adapterName", { value: t });
  }
});
var xi = (e) => `- ${e}`, An = (e) => E.isFunction(e) || e === null || e === !1;
function In(e, t) {
  e = E.isArray(e) ? e : [e];
  const { length: a } = e;
  let i, r;
  const s = {};
  for (let o = 0; o < a; o++) {
    i = e[o];
    let n;
    if (r = i, !An(i) && (r = Qa[(n = String(i)).toLowerCase()], r === void 0))
      throw new P(`Unknown adapter '${n}'`);
    if (r && (E.isFunction(r) || (r = r.get(t))))
      break;
    s[n || "#" + o] = r;
  }
  if (!r) {
    const o = Object.entries(s).map(
      ([p, c]) => `adapter ${p} ` + (c === !1 ? "is not supported by the environment" : "is not available in the build")
    );
    let n = a ? o.length > 1 ? `since :
` + o.map(xi).join(`
`) : " " + xi(o[0]) : "as no adapter specified";
    throw new P(
      "There is no suitable adapter to dispatch the request " + n,
      "ERR_NOT_SUPPORT"
    );
  }
  return r;
}
var Ar = {
  /**
   * Resolve an adapter from a list of adapter names or functions.
   * @type {Function}
   */
  getAdapter: In,
  /**
   * Exposes all known adapters
   * @type {Object<string, Function|Object>}
   */
  adapters: Qa
};
function ha(e) {
  if (e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)
    throw new vt(null, e);
}
function Di(e) {
  return ha(e), e.headers = Ie.from(e.headers), e.data = da.call(e, e.transformRequest), ["post", "put", "patch"].indexOf(e.method) !== -1 && e.headers.setContentType("application/x-www-form-urlencoded", !1), Ar.getAdapter(e.adapter || Na.adapter, e)(e).then(
    function(i) {
      return ha(e), i.data = da.call(e, e.transformResponse, i), i.headers = Ie.from(i.headers), i;
    },
    function(i) {
      return hr(i) || (ha(e), i && i.response && (i.response.data = da.call(
        e,
        e.transformResponse,
        i.response
      ), i.response.headers = Ie.from(i.response.headers))), Promise.reject(i);
    }
  );
}
var Ir = "1.13.6", ta = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((e, t) => {
  ta[e] = function(i) {
    return typeof i === e || "a" + (t < 1 ? "n " : " ") + e;
  };
});
var Oi = {};
ta.transitional = function(t, a, i) {
  function r(s, o) {
    return "[Axios v" + Ir + "] Transitional option '" + s + "'" + o + (i ? ". " + i : "");
  }
  return (s, o, n) => {
    if (t === !1)
      throw new P(
        r(o, " has been removed" + (a ? " in " + a : "")),
        P.ERR_DEPRECATED
      );
    return a && !Oi[o] && (Oi[o] = !0, console.warn(
      r(
        o,
        " has been deprecated since v" + a + " and will be removed in the near future"
      )
    )), t ? t(s, o, n) : !0;
  };
};
ta.spelling = function(t) {
  return (a, i) => (console.warn(`${i} is likely a misspelling of ${t}`), !0);
};
function gn(e, t, a) {
  if (typeof e != "object")
    throw new P("options must be an object", P.ERR_BAD_OPTION_VALUE);
  const i = Object.keys(e);
  let r = i.length;
  for (; r-- > 0; ) {
    const s = i[r], o = t[s];
    if (o) {
      const n = e[s], p = n === void 0 || o(n, s, e);
      if (p !== !0)
        throw new P(
          "option " + s + " must be " + p,
          P.ERR_BAD_OPTION_VALUE
        );
      continue;
    }
    if (a !== !0)
      throw new P("Unknown option " + s, P.ERR_BAD_OPTION);
  }
}
var Qt = {
  assertOptions: gn,
  validators: ta
}, fe = Qt.validators, $t = class {
  constructor(e) {
    this.defaults = e || {}, this.interceptors = {
      request: new bi(),
      response: new bi()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(e, t) {
    try {
      return await this._request(e, t);
    } catch (a) {
      if (a instanceof Error) {
        let i = {};
        Error.captureStackTrace ? Error.captureStackTrace(i) : i = new Error();
        const r = i.stack ? i.stack.replace(/^.+\n/, "") : "";
        try {
          a.stack ? r && !String(a.stack).endsWith(r.replace(/^.+\n.+\n/, "")) && (a.stack += `
` + r) : a.stack = r;
        } catch {
        }
      }
      throw a;
    }
  }
  _request(e, t) {
    typeof e == "string" ? (t = t || {}, t.url = e) : t = e || {}, t = Pe(this.defaults, t);
    const { transitional: a, paramsSerializer: i, headers: r } = t;
    a !== void 0 && Qt.assertOptions(
      a,
      {
        silentJSONParsing: fe.transitional(fe.boolean),
        forcedJSONParsing: fe.transitional(fe.boolean),
        clarifyTimeoutError: fe.transitional(fe.boolean),
        legacyInterceptorReqResOrdering: fe.transitional(fe.boolean)
      },
      !1
    ), i != null && (E.isFunction(i) ? t.paramsSerializer = {
      serialize: i
    } : Qt.assertOptions(
      i,
      {
        encode: fe.function,
        serialize: fe.function
      },
      !0
    )), t.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? t.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : t.allowAbsoluteUrls = !0), Qt.assertOptions(
      t,
      {
        baseUrl: fe.spelling("baseURL"),
        withXsrfToken: fe.spelling("withXSRFToken")
      },
      !0
    ), t.method = (t.method || this.defaults.method || "get").toLowerCase();
    let s = r && E.merge(r.common, r[t.method]);
    r && E.forEach(["delete", "get", "head", "post", "put", "patch", "common"], (u) => {
      delete r[u];
    }), t.headers = Ie.concat(s, r);
    const o = [];
    let n = !0;
    this.interceptors.request.forEach(function(y) {
      if (typeof y.runWhen == "function" && y.runWhen(t) === !1)
        return;
      n = n && y.synchronous;
      const f = t.transitional || ka;
      f && f.legacyInterceptorReqResOrdering ? o.unshift(y.fulfilled, y.rejected) : o.push(y.fulfilled, y.rejected);
    });
    const p = [];
    this.interceptors.response.forEach(function(y) {
      p.push(y.fulfilled, y.rejected);
    });
    let c, l = 0, d;
    if (!n) {
      const u = [Di.bind(this), void 0];
      for (u.unshift(...o), u.push(...p), d = u.length, c = Promise.resolve(t); l < d; )
        c = c.then(u[l++], u[l++]);
      return c;
    }
    d = o.length;
    let h = t;
    for (; l < d; ) {
      const u = o[l++], y = o[l++];
      try {
        h = u(h);
      } catch (f) {
        y.call(this, f);
        break;
      }
    }
    try {
      c = Di.call(this, h);
    } catch (u) {
      return Promise.reject(u);
    }
    for (l = 0, d = p.length; l < d; )
      c = c.then(p[l++], p[l++]);
    return c;
  }
  getUri(e) {
    e = Pe(this.defaults, e);
    const t = ur(e.baseURL, e.url, e.allowAbsoluteUrls);
    return lr(t, e.params, e.paramsSerializer);
  }
};
E.forEach(["delete", "get", "head", "options"], function(t) {
  $t.prototype[t] = function(a, i) {
    return this.request(
      Pe(i || {}, {
        method: t,
        url: a,
        data: (i || {}).data
      })
    );
  };
});
E.forEach(["post", "put", "patch"], function(t) {
  function a(i) {
    return function(s, o, n) {
      return this.request(
        Pe(n || {}, {
          method: t,
          headers: i ? {
            "Content-Type": "multipart/form-data"
          } : {},
          url: s,
          data: o
        })
      );
    };
  }
  $t.prototype[t] = a(), $t.prototype[t + "Form"] = a(!0);
});
var Lt = $t, mn = class gr {
  constructor(t) {
    if (typeof t != "function")
      throw new TypeError("executor must be a function.");
    let a;
    this.promise = new Promise(function(s) {
      a = s;
    });
    const i = this;
    this.promise.then((r) => {
      if (!i._listeners) return;
      let s = i._listeners.length;
      for (; s-- > 0; )
        i._listeners[s](r);
      i._listeners = null;
    }), this.promise.then = (r) => {
      let s;
      const o = new Promise((n) => {
        i.subscribe(n), s = n;
      }).then(r);
      return o.cancel = function() {
        i.unsubscribe(s);
      }, o;
    }, t(function(s, o, n) {
      i.reason || (i.reason = new vt(s, o, n), a(i.reason));
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason)
      throw this.reason;
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(t) {
    if (this.reason) {
      t(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(t) : this._listeners = [t];
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(t) {
    if (!this._listeners)
      return;
    const a = this._listeners.indexOf(t);
    a !== -1 && this._listeners.splice(a, 1);
  }
  toAbortSignal() {
    const t = new AbortController(), a = (i) => {
      t.abort(i);
    };
    return this.subscribe(a), t.signal.unsubscribe = () => this.unsubscribe(a), t.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let t;
    return {
      token: new gr(function(r) {
        t = r;
      }),
      cancel: t
    };
  }
}, bn = mn;
function vn(e) {
  return function(a) {
    return e.apply(null, a);
  };
}
function En(e) {
  return E.isObject(e) && e.isAxiosError === !0;
}
var Ba = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
  WebServerIsDown: 521,
  ConnectionTimedOut: 522,
  OriginIsUnreachable: 523,
  TimeoutOccurred: 524,
  SslHandshakeFailed: 525,
  InvalidSslCertificate: 526
};
Object.entries(Ba).forEach(([e, t]) => {
  Ba[t] = e;
});
var Fn = Ba;
function mr(e) {
  const t = new Lt(e), a = Xi(Lt.prototype.request, t);
  return E.extend(a, Lt.prototype, t, { allOwnKeys: !0 }), E.extend(a, t, null, { allOwnKeys: !0 }), a.create = function(r) {
    return mr(Pe(e, r));
  }, a;
}
var q = mr(Na);
q.Axios = Lt;
q.CanceledError = vt;
q.CancelToken = bn;
q.isCancel = hr;
q.VERSION = Ir;
q.toFormData = qt;
q.AxiosError = P;
q.Cancel = q.CanceledError;
q.all = function(t) {
  return Promise.all(t);
};
q.spread = vn;
q.isAxiosError = En;
q.mergeConfig = Pe;
q.AxiosHeaders = Ie;
q.formToJSON = (e) => dr(E.isHTMLForm(e) ? new FormData(e) : e);
q.getAdapter = Ar.getAdapter;
q.HttpStatusCode = Fn;
q.default = q;
var R = q, {
  Axios: Jl,
  AxiosError: Kl,
  CanceledError: Xl,
  isCancel: Wl,
  CancelToken: Zl,
  VERSION: Yl,
  all: ql,
  Cancel: ec,
  isAxiosError: tc,
  spread: ac,
  toFormData: ic,
  AxiosHeaders: rc,
  HttpStatusCode: sc,
  formToJSON: oc,
  getAdapter: nc,
  mergeConfig: lc
} = R, x = "https://api.tencentsmh.cn".replace(/\/+$/, ""), he = class {
  constructor(e, t = x, a = R) {
    this.basePath = t, this.axios = a, e && (this.configuration = e, this.basePath = e.basePath ?? t);
  }
}, Sn = class extends Error {
  constructor(e, t) {
    super(t), this.field = e, this.name = "RequiredError";
  }
}, D = {}, O = "https://example.com", I = function(e, t, a) {
  if (a == null)
    throw new Sn(t, `Required parameter ${t} was null or undefined when calling ${e}.`);
};
function wa(e, t, a = "") {
  t != null && (typeof t == "object" ? Array.isArray(t) ? t.forEach((i) => wa(e, i, a)) : Object.keys(t).forEach(
    (i) => wa(e, t[i], `${a}${a !== "" ? "." : ""}${i}`)
  ) : e.has(a) ? e.append(a, t) : e.set(a, t));
}
var U = function(e, ...t) {
  const a = new URLSearchParams(e.search);
  wa(a, t), e.search = a.toString();
}, $ = function(e, t, a) {
  const i = typeof e != "string";
  return (i && a && a.isJsonMime ? a.isJsonMime(t.headers["Content-Type"]) : i) ? JSON.stringify(e !== void 0 ? e : {}) : e || "";
}, k = function(e) {
  return e.pathname + e.search + e.hash;
}, T = function(e, t, a, i) {
  return (r = t, s = a) => {
    const o = { ...e.options, url: (r.defaults.baseURL ? "" : (i == null ? void 0 : i.basePath) ?? s) + e.url };
    return r.request(o);
  };
}, Bn = function(e) {
  return {
    /**
     * 用于批量复制目录或文件
     * @summary 批量复制目录或文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {BatchCopyCopyEnum} copy 开启批量复制操作
     * @param {Array<BatchCopyRequestInner>} batchCopyRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    batchCopy: async (t, a, i, r, s, o, n, p = {}) => {
      I("batchCopy", "libraryId", t), I("batchCopy", "spaceId", a), I("batchCopy", "copy", i), I("batchCopy", "batchCopyRequest", r);
      const c = "/api/v1/batch/{LibraryId}/{SpaceId}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), l = new URL(c, O);
      let d;
      e && (d = e.baseOptions);
      const h = { method: "POST", ...d, ...p }, u = {}, y = {};
      i !== void 0 && (y.copy = i), s !== void 0 && (y.access_token = s), o !== void 0 && (y.library_secret = o), n !== void 0 && (y.user_id = n), u["Content-Type"] = "application/json", U(l, y);
      let f = d && d.headers ? d.headers : {};
      return h.headers = { ...u, ...f, ...p.headers }, h.data = $(r, h, e), {
        url: k(l),
        options: h
      };
    },
    /**
     * 用于批量删除目录或文件
     * @summary 批量删除目录或文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {BatchDeleteDeleteEnum} _delete 开启批量删除操作
     * @param {Array<BatchDeleteRequestInner>} batchDeleteRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    batchDelete: async (t, a, i, r, s, o, n, p = {}) => {
      I("batchDelete", "libraryId", t), I("batchDelete", "spaceId", a), I("batchDelete", "_delete", i), I("batchDelete", "batchDeleteRequest", r);
      const c = "/api/v1/batch/{LibraryId}/{SpaceId}#2".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), l = new URL(c, O);
      let d;
      e && (d = e.baseOptions);
      const h = { method: "POST", ...d, ...p }, u = {}, y = {};
      i !== void 0 && (y.delete = i), s !== void 0 && (y.access_token = s), o !== void 0 && (y.library_secret = o), n !== void 0 && (y.user_id = n), u["Content-Type"] = "application/json", U(l, y);
      let f = d && d.headers ? d.headers : {};
      return h.headers = { ...u, ...f, ...p.headers }, h.data = $(r, h, e), {
        url: k(l),
        options: h
      };
    },
    /**
     * 用于批量重命名或移动目录或文件
     * @summary 批量重命名或移动目录或文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {BatchMoveMoveEnum} move 开启批量重命名或移动操作
     * @param {Array<BatchMoveRequestInner>} batchMoveRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    batchMove: async (t, a, i, r, s, o, n, p = {}) => {
      I("batchMove", "libraryId", t), I("batchMove", "spaceId", a), I("batchMove", "move", i), I("batchMove", "batchMoveRequest", r);
      const c = "/api/v1/batch/{LibraryId}/{SpaceId}#1".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), l = new URL(c, O);
      let d;
      e && (d = e.baseOptions);
      const h = { method: "POST", ...d, ...p }, u = {}, y = {};
      i !== void 0 && (y.move = i), s !== void 0 && (y.access_token = s), o !== void 0 && (y.library_secret = o), n !== void 0 && (y.user_id = n), u["Content-Type"] = "application/json", U(l, y);
      let f = d && d.headers ? d.headers : {};
      return h.headers = { ...u, ...f, ...p.headers }, h.data = $(r, h, e), {
        url: k(l),
        options: h
      };
    }
  };
}, pa = function(e) {
  const t = Bn(e);
  return {
    /**
     * 用于批量复制目录或文件
     * @summary 批量复制目录或文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {BatchCopyCopyEnum} copy 开启批量复制操作
     * @param {Array<BatchCopyRequestInner>} batchCopyRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async batchCopy(a, i, r, s, o, n, p, c) {
      var u, y;
      const l = await t.batchCopy(a, i, r, s, o, n, p, c), d = (e == null ? void 0 : e.serverIndex) ?? 0, h = (y = (u = D["BatchApi.batchCopy"]) == null ? void 0 : u[d]) == null ? void 0 : y.url;
      return (f, A) => T(l, R, x, e)(f, h || A);
    },
    /**
     * 用于批量删除目录或文件
     * @summary 批量删除目录或文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {BatchDeleteDeleteEnum} _delete 开启批量删除操作
     * @param {Array<BatchDeleteRequestInner>} batchDeleteRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async batchDelete(a, i, r, s, o, n, p, c) {
      var u, y;
      const l = await t.batchDelete(a, i, r, s, o, n, p, c), d = (e == null ? void 0 : e.serverIndex) ?? 0, h = (y = (u = D["BatchApi.batchDelete"]) == null ? void 0 : u[d]) == null ? void 0 : y.url;
      return (f, A) => T(l, R, x, e)(f, h || A);
    },
    /**
     * 用于批量重命名或移动目录或文件
     * @summary 批量重命名或移动目录或文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {BatchMoveMoveEnum} move 开启批量重命名或移动操作
     * @param {Array<BatchMoveRequestInner>} batchMoveRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async batchMove(a, i, r, s, o, n, p, c) {
      var u, y;
      const l = await t.batchMove(a, i, r, s, o, n, p, c), d = (e == null ? void 0 : e.serverIndex) ?? 0, h = (y = (u = D["BatchApi.batchMove"]) == null ? void 0 : u[d]) == null ? void 0 : y.url;
      return (f, A) => T(l, R, x, e)(f, h || A);
    }
  };
}, wn = class extends he {
  /**
   * 用于批量复制目录或文件
   * @summary 批量复制目录或文件
   * @param {BatchApiBatchCopyRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  batchCopy(e, t) {
    return pa(this.configuration).batchCopy(e.libraryId, e.spaceId, e.copy, e.batchCopyRequest, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于批量删除目录或文件
   * @summary 批量删除目录或文件
   * @param {BatchApiBatchDeleteRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  batchDelete(e, t) {
    return pa(this.configuration).batchDelete(e.libraryId, e.spaceId, e._delete, e.batchDeleteRequest, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于批量重命名或移动目录或文件
   * @summary 批量重命名或移动目录或文件
   * @param {BatchApiBatchMoveRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  batchMove(e, t) {
    return pa(this.configuration).batchMove(e.libraryId, e.spaceId, e.move, e.batchMoveRequest, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
}, Cn = function(e) {
  return {
    /**
     * 用于检查目录或相簿状态
     * @summary 检查目录或相簿状态
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    checkDirectoryStatus: async (t, a, i, r, s, o, n = {}) => {
      I("checkDirectoryStatus", "libraryId", t), I("checkDirectoryStatus", "spaceId", a), I("checkDirectoryStatus", "filePath", i);
      const p = "/api/v1/directory/{LibraryId}/{SpaceId}/{FilePath}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), c = new URL(p, O);
      let l;
      e && (l = e.baseOptions);
      const d = { method: "HEAD", ...l, ...n }, h = {}, u = {};
      r !== void 0 && (u.access_token = r), s !== void 0 && (u.library_secret = s), o !== void 0 && (u.user_id = o), U(c, u);
      let y = l && l.headers ? l.headers : {};
      return d.headers = { ...h, ...y, ...n.headers }, {
        url: k(c),
        options: d
      };
    },
    /**
     * 用于复制目录或相簿。 - 自动创建中间所需的各级父目录。 
     * @summary 复制目录或相簿
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {CopyDirectoryRequest} copyDirectoryRequest 
     * @param {CopyDirectoryConflictResolutionStrategyEnum} [conflictResolutionStrategy] 最后一级目录冲突时的处理方式，ask冲突时返回 HTTP 409，rename冲突时自动重命名最后一级目录，默认为 ask
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    copyDirectory: async (t, a, i, r, s, o, n, p, c = {}) => {
      I("copyDirectory", "libraryId", t), I("copyDirectory", "spaceId", a), I("copyDirectory", "filePath", i), I("copyDirectory", "copyDirectoryRequest", r);
      const l = "/api/v1/directory/{LibraryId}/{SpaceId}/{FilePath}#1".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), d = new URL(l, O);
      let h;
      e && (h = e.baseOptions);
      const u = { method: "PUT", ...h, ...c }, y = {}, f = {};
      s !== void 0 && (f.conflict_resolution_strategy = s), o !== void 0 && (f.access_token = o), n !== void 0 && (f.library_secret = n), p !== void 0 && (f.user_id = p), y["Content-Type"] = "application/json", U(d, f);
      let A = h && h.headers ? h.headers : {};
      return u.headers = { ...y, ...A, ...c.headers }, u.data = $(r, u, e), {
        url: k(d),
        options: u
      };
    },
    /**
     * 用于创建目录或相簿。 - 媒体类型媒体库可以进一步设置是否为分相簿媒体库，当设置为不分相簿时，则不允许创建目录或相簿，当设置为分相簿时，仅允许创建1层目录或相簿；文件类型媒体库不限制目录层数； - 自动创建中间所需的各级父目录； - 即使 ConflictResolutionStrategy 为 rename，如果路径中的某一父级实际为文件，则依然会返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码。 
     * @summary 创建目录或相簿
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {CreateDirectoryConflictResolutionStrategyEnum} [conflictResolutionStrategy] 最后一级目录冲突时的处理方式，ask冲突时返回 HTTP 409，rename冲突时自动重命名最后一级目录，默认为 ask
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {CreateDirectoryWithInodeEnum} [withInode] 是否返回 inode，即文件目录 ID，0 或 1，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createDirectory: async (t, a, i, r, s, o, n, p, c = {}) => {
      I("createDirectory", "libraryId", t), I("createDirectory", "spaceId", a), I("createDirectory", "filePath", i);
      const l = "/api/v1/directory/{LibraryId}/{SpaceId}/{FilePath}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), d = new URL(l, O);
      let h;
      e && (h = e.baseOptions);
      const u = { method: "PUT", ...h, ...c }, y = {}, f = {};
      r !== void 0 && (f.conflict_resolution_strategy = r), s !== void 0 && (f.access_token = s), o !== void 0 && (f.library_secret = o), n !== void 0 && (f.user_id = n), p !== void 0 && (f.with_inode = p), U(d, f);
      let A = h && h.headers ? h.headers : {};
      return u.headers = { ...y, ...A, ...c.headers }, {
        url: k(d),
        options: u
      };
    },
    /**
     * 用于删除目录或相簿。如果媒体库启用回收站功能，则该接口不会永久删除目录或相簿，而是将目录或相簿以及其下的文件移入回收站，可通过相关接口永久删除或恢复回收站内的目录或相簿，或直接清空回收站；
     * @summary 删除目录或相簿
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {DeleteDirectoryPermanentEnum} [permanent] 当媒体库开启回收站时，则该参数指定将文件移入回收站还是永久删除文件，1: 永久删除，0: 移入回收站，默认为 0
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteDirectory: async (t, a, i, r, s, o, n, p = {}) => {
      I("deleteDirectory", "libraryId", t), I("deleteDirectory", "spaceId", a), I("deleteDirectory", "filePath", i);
      const c = "/api/v1/directory/{LibraryId}/{SpaceId}/{FilePath}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), l = new URL(c, O);
      let d;
      e && (d = e.baseOptions);
      const h = { method: "DELETE", ...d, ...p }, u = {}, y = {};
      r !== void 0 && (y.permanent = r), s !== void 0 && (y.access_token = s), o !== void 0 && (y.library_secret = o), n !== void 0 && (y.user_id = n), U(l, y);
      let f = d && d.headers ? d.headers : {};
      return h.headers = { ...u, ...f, ...p.headers }, {
        url: k(l),
        options: h
      };
    },
    /**
     * 此接口可同时用于查看文件或文件夹详情，路径如果为文件，则返回文件详情，如果为文件夹，则返回文件夹详情。 
     * @summary 查看文件、目录或相簿详情
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {InfoFileOrDirectoryInfoEnum} info 固定为 1
     * @param {InfoFileOrDirectoryWithInodeEnum} [withInode] 是否返回 inode，即文件目录 ID，0 或 1，默认不返回
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {InfoFileOrDirectoryWithFavoriteStatusEnum} [withFavoriteStatus] 是否返回收藏状态，0 或 1，默认不返回
     * @param {InfoFileOrDirectoryWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    infoFileOrDirectory: async (t, a, i, r, s, o, n, p, c, l = {}) => {
      I("infoFileOrDirectory", "libraryId", t), I("infoFileOrDirectory", "spaceId", a), I("infoFileOrDirectory", "filePath", i), I("infoFileOrDirectory", "info", r);
      const d = "/api/v1/directory/{LibraryId}/{SpaceId}/{FilePath}#1".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), h = new URL(d, O);
      let u;
      e && (u = e.baseOptions);
      const y = { method: "GET", ...u, ...l }, f = {}, A = {};
      r !== void 0 && (A.info = r), s !== void 0 && (A.with_inode = s), o !== void 0 && (A.access_token = o), n !== void 0 && (A.library_secret = n), p !== void 0 && (A.with_favorite_status = p), c !== void 0 && (A.with_content_cas = c), U(h, A);
      let m = u && u.headers ? u.headers : {};
      return y.headers = { ...f, ...m, ...l.headers }, {
        url: k(h),
        options: y
      };
    },
    /**
     * 用于列出目录或相簿内容。 目录内容的列出顺序为：首先按照字典序列出子目录，随后根据上传时间列出媒体库中的媒体资源，或根据文件名列出文件库中的文件资源。 
     * @summary 列出目录或相簿内容
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {ListDirectoryByMarkerEnum} byMarker 固定传 1，表示使用 marker 方式分页
     * @param {string} [marker] 用于顺序列出分页的标识
     * @param {number} [limit] 用于顺序列出分页时本地列出的项目数限制，不传默认值20，最大返回100
     * @param {ListDirectoryOrderByEnum} [orderBy] 排序字段
     * @param {ListDirectoryOrderByTypeEnum} [orderByType] 排序方式，升序为 asc，降序为 desc
     * @param {ListDirectoryFilterEnum} [filter] 筛选方式，不传返回全部，onlyDir 只返回文件夹，onlyFile 只返回文件
     * @param {ListDirectorySortTypeEnum} [sortType] 排序方式，不传则文件和文件夹单独排序，先返回文件夹，后返回文件。union 文件和文件夹拉通排序
     * @param {ListDirectoryWithInodeEnum} [withInode] 是否返回 inode，即文件目录 ID，0 或 1，默认不返回
     * @param {ListDirectoryWithFavoriteStatusEnum} [withFavoriteStatus] 是否返回收藏状态，0 或 1，默认不返回
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {ListDirectoryWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listDirectory: async (t, a, i, r, s, o, n, p, c, l, d, h, u, y, f, A, m = {}) => {
      I("listDirectory", "libraryId", t), I("listDirectory", "spaceId", a), I("listDirectory", "filePath", i), I("listDirectory", "byMarker", r);
      const F = "/api/v1/directory/{LibraryId}/{SpaceId}/{FilePath}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), v = new URL(F, O);
      let C;
      e && (C = e.baseOptions);
      const _ = { method: "GET", ...C, ...m }, w = {}, B = {};
      r !== void 0 && (B["by-marker"] = r), s !== void 0 && (B.marker = s), o !== void 0 && (B.limit = o), n !== void 0 && (B.order_by = n), p !== void 0 && (B.order_by_type = p), c !== void 0 && (B.filter = c), l !== void 0 && (B.sort_type = l), d !== void 0 && (B.with_inode = d), h !== void 0 && (B.with_favorite_status = h), u !== void 0 && (B.access_token = u), y !== void 0 && (B.library_secret = y), f !== void 0 && (B.user_id = f), A !== void 0 && (B.with_content_cas = A), U(v, B);
      let H = C && C.headers ? C.headers : {};
      return _.headers = { ...w, ...H, ...m.headers }, {
        url: k(v),
        options: _
      };
    },
    /**
     * 用于列出目录或相簿内容。 目录内容的列出顺序为：首先按照字典序列出子目录，随后根据上传时间列出媒体库中的媒体资源，或根据文件名列出文件库中的文件资源。 page翻页的深度会有限制，强烈建议业务方改用marker翻页的形式。 
     * @summary 列出目录或相簿内容（传统分页）
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {ListDirectoryByPageByPageEnum} byPage 固定传 1，表示使用 page 方式分页
     * @param {number} [page] 分页码，默认第一页，最大翻页的条目数（Page*PageSize的大小）是1万
     * @param {number} [pageSize] 分页大小，默认 20，最大翻页的条目数（Page*PageSize的大小）是1万
     * @param {ListDirectoryByPageOrderByEnum} [orderBy] 排序字段
     * @param {ListDirectoryByPageOrderByTypeEnum} [orderByType] 排序方式，升序为 asc，降序为 desc
     * @param {ListDirectoryByPageFilterEnum} [filter] 筛选方式，不传返回全部，onlyDir 只返回文件夹，onlyFile 只返回文件
     * @param {ListDirectoryByPageSortTypeEnum} [sortType] 排序方式，不传则文件和文件夹单独排序，先返回文件夹，后返回文件。union 文件和文件夹拉通排序
     * @param {ListDirectoryByPageWithInodeEnum} [withInode] 是否返回 inode，即文件目录 ID，0 或 1，默认不返回
     * @param {ListDirectoryByPageWithFavoriteStatusEnum} [withFavoriteStatus] 是否返回收藏状态，0 或 1，默认不返回
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {ListDirectoryByPageWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listDirectoryByPage: async (t, a, i, r, s, o, n, p, c, l, d, h, u, y, f, A, m = {}) => {
      I("listDirectoryByPage", "libraryId", t), I("listDirectoryByPage", "spaceId", a), I("listDirectoryByPage", "filePath", i), I("listDirectoryByPage", "byPage", r);
      const F = "/api/v1/directory/{LibraryId}/{SpaceId}/{FilePath}#2".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), v = new URL(F, O);
      let C;
      e && (C = e.baseOptions);
      const _ = { method: "GET", ...C, ...m }, w = {}, B = {};
      r !== void 0 && (B["by-page"] = r), s !== void 0 && (B.page = s), o !== void 0 && (B.page_size = o), n !== void 0 && (B.order_by = n), p !== void 0 && (B.order_by_type = p), c !== void 0 && (B.filter = c), l !== void 0 && (B.sort_type = l), d !== void 0 && (B.with_inode = d), h !== void 0 && (B.with_favorite_status = h), u !== void 0 && (B.access_token = u), y !== void 0 && (B.library_secret = y), f !== void 0 && (B.user_id = f), A !== void 0 && (B.with_content_cas = A), U(v, B);
      let H = C && C.headers ? C.headers : {};
      return _.headers = { ...w, ...H, ...m.headers }, {
        url: k(v),
        options: _
      };
    },
    /**
     * 用于重命名或移动目录或相簿。 要求权限： admin、space_admin 或 move_directory。 该接口的源和目标均需要指定完整的目录路径或相簿名；对于文件类型媒体库，源与目标可以跨越多层级多目录，来实现将目录移动到任意其他父目录下的功能，且支持同时修改目录名； 自动创建中间所需的各级父目录。 
     * @summary 重命名或移动目录或相簿
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {MoveDirectoryRequest} moveDirectoryRequest 
     * @param {MoveDirectoryConflictResolutionStrategyEnum} [conflictResolutionStrategy] 最后一级目录冲突时的处理方式，ask冲突时返回 HTTP 409，rename冲突时自动重命名最后一级目录，默认为 ask
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    moveDirectory: async (t, a, i, r, s, o, n, p, c = {}) => {
      I("moveDirectory", "libraryId", t), I("moveDirectory", "spaceId", a), I("moveDirectory", "filePath", i), I("moveDirectory", "moveDirectoryRequest", r);
      const l = "/api/v1/directory/{LibraryId}/{SpaceId}/{FilePath}#2".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), d = new URL(l, O);
      let h;
      e && (h = e.baseOptions);
      const u = { method: "PUT", ...h, ...c }, y = {}, f = {};
      s !== void 0 && (f.conflict_resolution_strategy = s), o !== void 0 && (f.access_token = o), n !== void 0 && (f.library_secret = n), p !== void 0 && (f.user_id = p), y["Content-Type"] = "application/json", U(d, f);
      let A = h && h.headers ? h.headers : {};
      return u.headers = { ...y, ...A, ...c.headers }, u.data = $(r, u, e), {
        url: k(d),
        options: u
      };
    },
    /**
     * 用于更新目录自定义标签。需要 admin 权限或 spaceAdmin 权限
     * @summary 更新目录自定义标签
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {UpdateDirectoryLabelsUpdateEnum} update 固定为 1
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {UpdateDirectoryLabelsRequest} [updateDirectoryLabelsRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateDirectoryLabels: async (t, a, i, r, s, o, n, p = {}) => {
      I("updateDirectoryLabels", "libraryId", t), I("updateDirectoryLabels", "spaceId", a), I("updateDirectoryLabels", "filePath", i), I("updateDirectoryLabels", "update", r);
      const c = "/api/v1/directory/{LibraryId}/{SpaceId}/{FilePath}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), l = new URL(c, O);
      let d;
      e && (d = e.baseOptions);
      const h = { method: "POST", ...d, ...p }, u = {}, y = {};
      r !== void 0 && (y.update = r), s !== void 0 && (y.access_token = s), o !== void 0 && (y.library_secret = o), u["Content-Type"] = "application/json", U(l, y);
      let f = d && d.headers ? d.headers : {};
      return h.headers = { ...u, ...f, ...p.headers }, h.data = $(n, h, e), {
        url: k(l),
        options: h
      };
    },
    /**
     * 用于更新文件的标签（Labels）或分类（Category）。 需要 admin 权限或 spaceAdmin 权限。 
     * @summary 更新文件标签或分类
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {UpdateFileLabelsUpdateEnum} update 固定为 1
     * @param {UpdateFileLabelsRequest} updateFileLabelsRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateFileLabels: async (t, a, i, r, s, o, n, p = {}) => {
      I("updateFileLabels", "libraryId", t), I("updateFileLabels", "spaceId", a), I("updateFileLabels", "filePath", i), I("updateFileLabels", "update", r), I("updateFileLabels", "updateFileLabelsRequest", s);
      const c = "/api/v1/directory/{LibraryId}/{SpaceId}/{FilePath}#1".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), l = new URL(c, O);
      let d;
      e && (d = e.baseOptions);
      const h = { method: "POST", ...d, ...p }, u = {}, y = {};
      r !== void 0 && (y.update = r), o !== void 0 && (y.access_token = o), n !== void 0 && (y.library_secret = n), u["Content-Type"] = "application/json", U(l, y);
      let f = d && d.headers ? d.headers : {};
      return h.headers = { ...u, ...f, ...p.headers }, h.data = $(s, h, e), {
        url: k(l),
        options: h
      };
    }
  };
}, ve = function(e) {
  const t = Cn(e);
  return {
    /**
     * 用于检查目录或相簿状态
     * @summary 检查目录或相簿状态
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async checkDirectoryStatus(a, i, r, s, o, n, p) {
      var h, u;
      const c = await t.checkDirectoryStatus(a, i, r, s, o, n, p), l = (e == null ? void 0 : e.serverIndex) ?? 0, d = (u = (h = D["DirectoryApi.checkDirectoryStatus"]) == null ? void 0 : h[l]) == null ? void 0 : u.url;
      return (y, f) => T(c, R, x, e)(y, d || f);
    },
    /**
     * 用于复制目录或相簿。 - 自动创建中间所需的各级父目录。 
     * @summary 复制目录或相簿
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {CopyDirectoryRequest} copyDirectoryRequest 
     * @param {CopyDirectoryConflictResolutionStrategyEnum} [conflictResolutionStrategy] 最后一级目录冲突时的处理方式，ask冲突时返回 HTTP 409，rename冲突时自动重命名最后一级目录，默认为 ask
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async copyDirectory(a, i, r, s, o, n, p, c, l) {
      var y, f;
      const d = await t.copyDirectory(a, i, r, s, o, n, p, c, l), h = (e == null ? void 0 : e.serverIndex) ?? 0, u = (f = (y = D["DirectoryApi.copyDirectory"]) == null ? void 0 : y[h]) == null ? void 0 : f.url;
      return (A, m) => T(d, R, x, e)(A, u || m);
    },
    /**
     * 用于创建目录或相簿。 - 媒体类型媒体库可以进一步设置是否为分相簿媒体库，当设置为不分相簿时，则不允许创建目录或相簿，当设置为分相簿时，仅允许创建1层目录或相簿；文件类型媒体库不限制目录层数； - 自动创建中间所需的各级父目录； - 即使 ConflictResolutionStrategy 为 rename，如果路径中的某一父级实际为文件，则依然会返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码。 
     * @summary 创建目录或相簿
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {CreateDirectoryConflictResolutionStrategyEnum} [conflictResolutionStrategy] 最后一级目录冲突时的处理方式，ask冲突时返回 HTTP 409，rename冲突时自动重命名最后一级目录，默认为 ask
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {CreateDirectoryWithInodeEnum} [withInode] 是否返回 inode，即文件目录 ID，0 或 1，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createDirectory(a, i, r, s, o, n, p, c, l) {
      var y, f;
      const d = await t.createDirectory(a, i, r, s, o, n, p, c, l), h = (e == null ? void 0 : e.serverIndex) ?? 0, u = (f = (y = D["DirectoryApi.createDirectory"]) == null ? void 0 : y[h]) == null ? void 0 : f.url;
      return (A, m) => T(d, R, x, e)(A, u || m);
    },
    /**
     * 用于删除目录或相簿。如果媒体库启用回收站功能，则该接口不会永久删除目录或相簿，而是将目录或相簿以及其下的文件移入回收站，可通过相关接口永久删除或恢复回收站内的目录或相簿，或直接清空回收站；
     * @summary 删除目录或相簿
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {DeleteDirectoryPermanentEnum} [permanent] 当媒体库开启回收站时，则该参数指定将文件移入回收站还是永久删除文件，1: 永久删除，0: 移入回收站，默认为 0
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteDirectory(a, i, r, s, o, n, p, c) {
      var u, y;
      const l = await t.deleteDirectory(a, i, r, s, o, n, p, c), d = (e == null ? void 0 : e.serverIndex) ?? 0, h = (y = (u = D["DirectoryApi.deleteDirectory"]) == null ? void 0 : u[d]) == null ? void 0 : y.url;
      return (f, A) => T(l, R, x, e)(f, h || A);
    },
    /**
     * 此接口可同时用于查看文件或文件夹详情，路径如果为文件，则返回文件详情，如果为文件夹，则返回文件夹详情。 
     * @summary 查看文件、目录或相簿详情
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {InfoFileOrDirectoryInfoEnum} info 固定为 1
     * @param {InfoFileOrDirectoryWithInodeEnum} [withInode] 是否返回 inode，即文件目录 ID，0 或 1，默认不返回
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {InfoFileOrDirectoryWithFavoriteStatusEnum} [withFavoriteStatus] 是否返回收藏状态，0 或 1，默认不返回
     * @param {InfoFileOrDirectoryWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async infoFileOrDirectory(a, i, r, s, o, n, p, c, l, d) {
      var f, A;
      const h = await t.infoFileOrDirectory(a, i, r, s, o, n, p, c, l, d), u = (e == null ? void 0 : e.serverIndex) ?? 0, y = (A = (f = D["DirectoryApi.infoFileOrDirectory"]) == null ? void 0 : f[u]) == null ? void 0 : A.url;
      return (m, F) => T(h, R, x, e)(m, y || F);
    },
    /**
     * 用于列出目录或相簿内容。 目录内容的列出顺序为：首先按照字典序列出子目录，随后根据上传时间列出媒体库中的媒体资源，或根据文件名列出文件库中的文件资源。 
     * @summary 列出目录或相簿内容
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {ListDirectoryByMarkerEnum} byMarker 固定传 1，表示使用 marker 方式分页
     * @param {string} [marker] 用于顺序列出分页的标识
     * @param {number} [limit] 用于顺序列出分页时本地列出的项目数限制，不传默认值20，最大返回100
     * @param {ListDirectoryOrderByEnum} [orderBy] 排序字段
     * @param {ListDirectoryOrderByTypeEnum} [orderByType] 排序方式，升序为 asc，降序为 desc
     * @param {ListDirectoryFilterEnum} [filter] 筛选方式，不传返回全部，onlyDir 只返回文件夹，onlyFile 只返回文件
     * @param {ListDirectorySortTypeEnum} [sortType] 排序方式，不传则文件和文件夹单独排序，先返回文件夹，后返回文件。union 文件和文件夹拉通排序
     * @param {ListDirectoryWithInodeEnum} [withInode] 是否返回 inode，即文件目录 ID，0 或 1，默认不返回
     * @param {ListDirectoryWithFavoriteStatusEnum} [withFavoriteStatus] 是否返回收藏状态，0 或 1，默认不返回
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {ListDirectoryWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listDirectory(a, i, r, s, o, n, p, c, l, d, h, u, y, f, A, m, F) {
      var w, B;
      const v = await t.listDirectory(a, i, r, s, o, n, p, c, l, d, h, u, y, f, A, m, F), C = (e == null ? void 0 : e.serverIndex) ?? 0, _ = (B = (w = D["DirectoryApi.listDirectory"]) == null ? void 0 : w[C]) == null ? void 0 : B.url;
      return (H, J) => T(v, R, x, e)(H, _ || J);
    },
    /**
     * 用于列出目录或相簿内容。 目录内容的列出顺序为：首先按照字典序列出子目录，随后根据上传时间列出媒体库中的媒体资源，或根据文件名列出文件库中的文件资源。 page翻页的深度会有限制，强烈建议业务方改用marker翻页的形式。 
     * @summary 列出目录或相簿内容（传统分页）
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {ListDirectoryByPageByPageEnum} byPage 固定传 1，表示使用 page 方式分页
     * @param {number} [page] 分页码，默认第一页，最大翻页的条目数（Page*PageSize的大小）是1万
     * @param {number} [pageSize] 分页大小，默认 20，最大翻页的条目数（Page*PageSize的大小）是1万
     * @param {ListDirectoryByPageOrderByEnum} [orderBy] 排序字段
     * @param {ListDirectoryByPageOrderByTypeEnum} [orderByType] 排序方式，升序为 asc，降序为 desc
     * @param {ListDirectoryByPageFilterEnum} [filter] 筛选方式，不传返回全部，onlyDir 只返回文件夹，onlyFile 只返回文件
     * @param {ListDirectoryByPageSortTypeEnum} [sortType] 排序方式，不传则文件和文件夹单独排序，先返回文件夹，后返回文件。union 文件和文件夹拉通排序
     * @param {ListDirectoryByPageWithInodeEnum} [withInode] 是否返回 inode，即文件目录 ID，0 或 1，默认不返回
     * @param {ListDirectoryByPageWithFavoriteStatusEnum} [withFavoriteStatus] 是否返回收藏状态，0 或 1，默认不返回
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {ListDirectoryByPageWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listDirectoryByPage(a, i, r, s, o, n, p, c, l, d, h, u, y, f, A, m, F) {
      var w, B;
      const v = await t.listDirectoryByPage(a, i, r, s, o, n, p, c, l, d, h, u, y, f, A, m, F), C = (e == null ? void 0 : e.serverIndex) ?? 0, _ = (B = (w = D["DirectoryApi.listDirectoryByPage"]) == null ? void 0 : w[C]) == null ? void 0 : B.url;
      return (H, J) => T(v, R, x, e)(H, _ || J);
    },
    /**
     * 用于重命名或移动目录或相簿。 要求权限： admin、space_admin 或 move_directory。 该接口的源和目标均需要指定完整的目录路径或相簿名；对于文件类型媒体库，源与目标可以跨越多层级多目录，来实现将目录移动到任意其他父目录下的功能，且支持同时修改目录名； 自动创建中间所需的各级父目录。 
     * @summary 重命名或移动目录或相簿
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {MoveDirectoryRequest} moveDirectoryRequest 
     * @param {MoveDirectoryConflictResolutionStrategyEnum} [conflictResolutionStrategy] 最后一级目录冲突时的处理方式，ask冲突时返回 HTTP 409，rename冲突时自动重命名最后一级目录，默认为 ask
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async moveDirectory(a, i, r, s, o, n, p, c, l) {
      var y, f;
      const d = await t.moveDirectory(a, i, r, s, o, n, p, c, l), h = (e == null ? void 0 : e.serverIndex) ?? 0, u = (f = (y = D["DirectoryApi.moveDirectory"]) == null ? void 0 : y[h]) == null ? void 0 : f.url;
      return (A, m) => T(d, R, x, e)(A, u || m);
    },
    /**
     * 用于更新目录自定义标签。需要 admin 权限或 spaceAdmin 权限
     * @summary 更新目录自定义标签
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {UpdateDirectoryLabelsUpdateEnum} update 固定为 1
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {UpdateDirectoryLabelsRequest} [updateDirectoryLabelsRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateDirectoryLabels(a, i, r, s, o, n, p, c) {
      var u, y;
      const l = await t.updateDirectoryLabels(a, i, r, s, o, n, p, c), d = (e == null ? void 0 : e.serverIndex) ?? 0, h = (y = (u = D["DirectoryApi.updateDirectoryLabels"]) == null ? void 0 : u[d]) == null ? void 0 : y.url;
      return (f, A) => T(l, R, x, e)(f, h || A);
    },
    /**
     * 用于更新文件的标签（Labels）或分类（Category）。 需要 admin 权限或 spaceAdmin 权限。 
     * @summary 更新文件标签或分类
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {UpdateFileLabelsUpdateEnum} update 固定为 1
     * @param {UpdateFileLabelsRequest} updateFileLabelsRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateFileLabels(a, i, r, s, o, n, p, c) {
      var u, y;
      const l = await t.updateFileLabels(a, i, r, s, o, n, p, c), d = (e == null ? void 0 : e.serverIndex) ?? 0, h = (y = (u = D["DirectoryApi.updateFileLabels"]) == null ? void 0 : u[d]) == null ? void 0 : y.url;
      return (f, A) => T(l, R, x, e)(f, h || A);
    }
  };
}, _n = class extends he {
  /**
   * 用于检查目录或相簿状态
   * @summary 检查目录或相簿状态
   * @param {DirectoryApiCheckDirectoryStatusRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  checkDirectoryStatus(e, t) {
    return ve(this.configuration).checkDirectoryStatus(e.libraryId, e.spaceId, e.filePath, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于复制目录或相簿。 - 自动创建中间所需的各级父目录。 
   * @summary 复制目录或相簿
   * @param {DirectoryApiCopyDirectoryRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  copyDirectory(e, t) {
    return ve(this.configuration).copyDirectory(e.libraryId, e.spaceId, e.filePath, e.copyDirectoryRequest, e.conflictResolutionStrategy, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于创建目录或相簿。 - 媒体类型媒体库可以进一步设置是否为分相簿媒体库，当设置为不分相簿时，则不允许创建目录或相簿，当设置为分相簿时，仅允许创建1层目录或相簿；文件类型媒体库不限制目录层数； - 自动创建中间所需的各级父目录； - 即使 ConflictResolutionStrategy 为 rename，如果路径中的某一父级实际为文件，则依然会返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码。 
   * @summary 创建目录或相簿
   * @param {DirectoryApiCreateDirectoryRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  createDirectory(e, t) {
    return ve(this.configuration).createDirectory(e.libraryId, e.spaceId, e.filePath, e.conflictResolutionStrategy, e.accessToken, e.librarySecret, e.userId, e.withInode, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于删除目录或相簿。如果媒体库启用回收站功能，则该接口不会永久删除目录或相簿，而是将目录或相簿以及其下的文件移入回收站，可通过相关接口永久删除或恢复回收站内的目录或相簿，或直接清空回收站；
   * @summary 删除目录或相簿
   * @param {DirectoryApiDeleteDirectoryRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  deleteDirectory(e, t) {
    return ve(this.configuration).deleteDirectory(e.libraryId, e.spaceId, e.filePath, e.permanent, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 此接口可同时用于查看文件或文件夹详情，路径如果为文件，则返回文件详情，如果为文件夹，则返回文件夹详情。 
   * @summary 查看文件、目录或相簿详情
   * @param {DirectoryApiInfoFileOrDirectoryRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  infoFileOrDirectory(e, t) {
    return ve(this.configuration).infoFileOrDirectory(e.libraryId, e.spaceId, e.filePath, e.info, e.withInode, e.accessToken, e.librarySecret, e.withFavoriteStatus, e.withContentCas, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于列出目录或相簿内容。 目录内容的列出顺序为：首先按照字典序列出子目录，随后根据上传时间列出媒体库中的媒体资源，或根据文件名列出文件库中的文件资源。 
   * @summary 列出目录或相簿内容
   * @param {DirectoryApiListDirectoryRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  listDirectory(e, t) {
    return ve(this.configuration).listDirectory(e.libraryId, e.spaceId, e.filePath, e.byMarker, e.marker, e.limit, e.orderBy, e.orderByType, e.filter, e.sortType, e.withInode, e.withFavoriteStatus, e.accessToken, e.librarySecret, e.userId, e.withContentCas, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于列出目录或相簿内容。 目录内容的列出顺序为：首先按照字典序列出子目录，随后根据上传时间列出媒体库中的媒体资源，或根据文件名列出文件库中的文件资源。 page翻页的深度会有限制，强烈建议业务方改用marker翻页的形式。 
   * @summary 列出目录或相簿内容（传统分页）
   * @param {DirectoryApiListDirectoryByPageRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  listDirectoryByPage(e, t) {
    return ve(this.configuration).listDirectoryByPage(e.libraryId, e.spaceId, e.filePath, e.byPage, e.page, e.pageSize, e.orderBy, e.orderByType, e.filter, e.sortType, e.withInode, e.withFavoriteStatus, e.accessToken, e.librarySecret, e.userId, e.withContentCas, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于重命名或移动目录或相簿。 要求权限： admin、space_admin 或 move_directory。 该接口的源和目标均需要指定完整的目录路径或相簿名；对于文件类型媒体库，源与目标可以跨越多层级多目录，来实现将目录移动到任意其他父目录下的功能，且支持同时修改目录名； 自动创建中间所需的各级父目录。 
   * @summary 重命名或移动目录或相簿
   * @param {DirectoryApiMoveDirectoryRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  moveDirectory(e, t) {
    return ve(this.configuration).moveDirectory(e.libraryId, e.spaceId, e.filePath, e.moveDirectoryRequest, e.conflictResolutionStrategy, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于更新目录自定义标签。需要 admin 权限或 spaceAdmin 权限
   * @summary 更新目录自定义标签
   * @param {DirectoryApiUpdateDirectoryLabelsRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  updateDirectoryLabels(e, t) {
    return ve(this.configuration).updateDirectoryLabels(e.libraryId, e.spaceId, e.filePath, e.update, e.accessToken, e.librarySecret, e.updateDirectoryLabelsRequest, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于更新文件的标签（Labels）或分类（Category）。 需要 admin 权限或 spaceAdmin 权限。 
   * @summary 更新文件标签或分类
   * @param {DirectoryApiUpdateFileLabelsRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  updateFileLabels(e, t) {
    return ve(this.configuration).updateFileLabels(e.libraryId, e.spaceId, e.filePath, e.update, e.updateFileLabelsRequest, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
}, Rn = function(e) {
  return {
    /**
     * 收藏文件目录。需要提供路径或inode，二者二选一；如果同时提供，以inode为准。 
     * @summary 收藏指定空间文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {CreateFavoriteRequest} createFavoriteRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createFavorite: async (t, a, i, r, s, o = {}) => {
      I("createFavorite", "libraryId", t), I("createFavorite", "spaceId", a), I("createFavorite", "createFavoriteRequest", i);
      const n = "/api/v1/favorite/{LibraryId}/{SpaceId}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "POST", ...c, ...o }, d = {}, h = {};
      r !== void 0 && (h.access_token = r), s !== void 0 && (h.library_secret = s), d["Content-Type"] = "application/json", U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, l.data = $(i, l, e), {
        url: k(p),
        options: l
      };
    },
    /**
     * 取消收藏。根据路径或inode取消收藏，二者二选一；如果同时提供，以inode为准。 
     * @summary 取消收藏指定空间文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {DeleteFavoriteCancelEnum} cancel 取消收藏标志，传递该参数表示执行取消收藏操作
     * @param {CreateFavoriteRequest} deleteFavoriteRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteFavorite: async (t, a, i, r, s, o, n = {}) => {
      I("deleteFavorite", "libraryId", t), I("deleteFavorite", "spaceId", a), I("deleteFavorite", "cancel", i), I("deleteFavorite", "deleteFavoriteRequest", r);
      const p = "/api/v1/favorite/{LibraryId}/{SpaceId}#1".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), c = new URL(p, O);
      let l;
      e && (l = e.baseOptions);
      const d = { method: "POST", ...l, ...n }, h = {}, u = {};
      s !== void 0 && (u.access_token = s), o !== void 0 && (u.library_secret = o), i !== void 0 && (u.cancel = i), h["Content-Type"] = "application/json", U(c, u);
      let y = l && l.headers ? l.headers : {};
      return d.headers = { ...h, ...y, ...n.headers }, d.data = $(r, d, e), {
        url: k(c),
        options: d
      };
    },
    /**
     * 查看指定空间收藏列表，支持分页和排序
     * @summary 查看指定空间收藏列表
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [marker] 用于顺序列出分页的标识，可选参数
     * @param {number} [limit] 用于顺序列出分页时本地列出的项目数限制，默认为20，可选参数
     * @param {number} [page] 分页码，默认第一页，可选参数，不能与marker和limit参数同时使用
     * @param {number} [pageSize] 分页大小，默认20，可选参数，不能与marker和limit参数同时使用
     * @param {ListFavoriteOrderByEnum} [orderBy] 排序字段，按收藏时间排序为favoriteTime（默认），目前仅支持按收藏时间排序，可选参数
     * @param {ListFavoriteOrderByTypeEnum} [orderByType] 排序方式，升序为asc，降序为desc（默认），可选参数
     * @param {boolean} [withPath] 是否返回path，返回为true，不返回为false（默认），可选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listFavorite: async (t, a, i, r, s, o, n, p, c, l, d, h = {}) => {
      I("listFavorite", "libraryId", t), I("listFavorite", "spaceId", a);
      const u = "/api/v1/favorite/{LibraryId}/{SpaceId}/list".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), y = new URL(u, O);
      let f;
      e && (f = e.baseOptions);
      const A = { method: "GET", ...f, ...h }, m = {}, F = {};
      i !== void 0 && (F.marker = i), r !== void 0 && (F.limit = r), s !== void 0 && (F.page = s), o !== void 0 && (F.page_size = o), n !== void 0 && (F.order_by = n), p !== void 0 && (F.order_by_type = p), c !== void 0 && (F.with_path = c), l !== void 0 && (F.access_token = l), d !== void 0 && (F.library_secret = d), U(y, F);
      let v = f && f.headers ? f.headers : {};
      return A.headers = { ...m, ...v, ...h.headers }, {
        url: k(y),
        options: A
      };
    }
  };
}, ua = function(e) {
  const t = Rn(e);
  return {
    /**
     * 收藏文件目录。需要提供路径或inode，二者二选一；如果同时提供，以inode为准。 
     * @summary 收藏指定空间文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {CreateFavoriteRequest} createFavoriteRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createFavorite(a, i, r, s, o, n) {
      var d, h;
      const p = await t.createFavorite(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["FavoriteApi.createFavorite"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    },
    /**
     * 取消收藏。根据路径或inode取消收藏，二者二选一；如果同时提供，以inode为准。 
     * @summary 取消收藏指定空间文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {DeleteFavoriteCancelEnum} cancel 取消收藏标志，传递该参数表示执行取消收藏操作
     * @param {CreateFavoriteRequest} deleteFavoriteRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteFavorite(a, i, r, s, o, n, p) {
      var h, u;
      const c = await t.deleteFavorite(a, i, r, s, o, n, p), l = (e == null ? void 0 : e.serverIndex) ?? 0, d = (u = (h = D["FavoriteApi.deleteFavorite"]) == null ? void 0 : h[l]) == null ? void 0 : u.url;
      return (y, f) => T(c, R, x, e)(y, d || f);
    },
    /**
     * 查看指定空间收藏列表，支持分页和排序
     * @summary 查看指定空间收藏列表
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [marker] 用于顺序列出分页的标识，可选参数
     * @param {number} [limit] 用于顺序列出分页时本地列出的项目数限制，默认为20，可选参数
     * @param {number} [page] 分页码，默认第一页，可选参数，不能与marker和limit参数同时使用
     * @param {number} [pageSize] 分页大小，默认20，可选参数，不能与marker和limit参数同时使用
     * @param {ListFavoriteOrderByEnum} [orderBy] 排序字段，按收藏时间排序为favoriteTime（默认），目前仅支持按收藏时间排序，可选参数
     * @param {ListFavoriteOrderByTypeEnum} [orderByType] 排序方式，升序为asc，降序为desc（默认），可选参数
     * @param {boolean} [withPath] 是否返回path，返回为true，不返回为false（默认），可选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listFavorite(a, i, r, s, o, n, p, c, l, d, h, u) {
      var m, F;
      const y = await t.listFavorite(a, i, r, s, o, n, p, c, l, d, h, u), f = (e == null ? void 0 : e.serverIndex) ?? 0, A = (F = (m = D["FavoriteApi.listFavorite"]) == null ? void 0 : m[f]) == null ? void 0 : F.url;
      return (v, C) => T(y, R, x, e)(v, A || C);
    }
  };
}, xn = class extends he {
  /**
   * 收藏文件目录。需要提供路径或inode，二者二选一；如果同时提供，以inode为准。 
   * @summary 收藏指定空间文件
   * @param {FavoriteApiCreateFavoriteRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  createFavorite(e, t) {
    return ua(this.configuration).createFavorite(e.libraryId, e.spaceId, e.createFavoriteRequest, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 取消收藏。根据路径或inode取消收藏，二者二选一；如果同时提供，以inode为准。 
   * @summary 取消收藏指定空间文件
   * @param {FavoriteApiDeleteFavoriteRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  deleteFavorite(e, t) {
    return ua(this.configuration).deleteFavorite(e.libraryId, e.spaceId, e.cancel, e.deleteFavoriteRequest, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 查看指定空间收藏列表，支持分页和排序
   * @summary 查看指定空间收藏列表
   * @param {FavoriteApiListFavoriteRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  listFavorite(e, t) {
    return ua(this.configuration).listFavorite(e.libraryId, e.spaceId, e.marker, e.limit, e.page, e.pageSize, e.orderBy, e.orderByType, e.withPath, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
}, Dn = function(e) {
  return {
    /**
     * 用于取消上传任务。 要求权限： admin、space_admin、upload_file、upload_file_force、begin_upload 或 begin_upload_force（注意：虽然本接口为删除接口，但因为删除的是上传任务信息，故仍需上传文件的相关权限） 如果上传任务为分块上传任务，那么该请求将同时放弃 COS 中的分块上传任务。 
     * @summary 取消上传任务
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} confirmKey 确认参数
     * @param {AbortFileUploadUploadEnum} upload 上传任务标识
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    abortFileUpload: async (t, a, i, r, s, o, n, p = {}) => {
      I("abortFileUpload", "libraryId", t), I("abortFileUpload", "spaceId", a), I("abortFileUpload", "confirmKey", i), I("abortFileUpload", "upload", r);
      const c = "/api/v1/file/{LibraryId}/{SpaceId}/{ConfirmKey}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{ConfirmKey}", encodeURIComponent(String(i))), l = new URL(c, O);
      let d;
      e && (d = e.baseOptions);
      const h = { method: "DELETE", ...d, ...p }, u = {}, y = {};
      r !== void 0 && (y.upload = r), s !== void 0 && (y.access_token = s), o !== void 0 && (y.library_secret = o), n !== void 0 && (y.user_id = n), U(l, y);
      let f = d && d.headers ? d.headers : {};
      return h.headers = { ...u, ...f, ...p.headers }, {
        url: k(l),
        options: h
      };
    },
    /**
     * 用于查询文件删除的原因，可能是用户主动删除或者 quota 超限删除。 要求权限：admin 或 space_admin 
     * @summary 查询文件删除原因
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} inode 文件的 Inode
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    checkFileDeletion: async (t, a, i, r, s, o = {}) => {
      I("checkFileDeletion", "libraryId", t), I("checkFileDeletion", "spaceId", a), I("checkFileDeletion", "inode", i);
      const n = "/api/v1/file-deletion-check/{LibraryId}/{SpaceId}/{Inode}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{Inode}", encodeURIComponent(String(i))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "GET", ...c, ...o }, d = {}, h = {};
      r !== void 0 && (h.access_token = r), s !== void 0 && (h.library_secret = s), U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, {
        url: k(p),
        options: l
      };
    },
    /**
     * 用于检查文件状态
     * @summary 检查文件状态
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {string} [historyId] 历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    checkFileStatus: async (t, a, i, r, s, o, n, p = {}) => {
      I("checkFileStatus", "libraryId", t), I("checkFileStatus", "spaceId", a), I("checkFileStatus", "filePath", i);
      const c = "/api/v1/file/{LibraryId}/{SpaceId}/{FilePath}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), l = new URL(c, O);
      let d;
      e && (d = e.baseOptions);
      const h = { method: "HEAD", ...d, ...p }, u = {}, y = {};
      r !== void 0 && (y.history_id = r), s !== void 0 && (y.access_token = s), o !== void 0 && (y.library_secret = o), n !== void 0 && (y.user_id = n), U(l, y);
      let f = d && d.headers ? d.headers : {};
      return h.headers = { ...u, ...f, ...p.headers }, {
        url: k(l),
        options: h
      };
    },
    /**
     * 用于完成上传文件。 要求权限：admin、space_admin、upload_file、upload_file_force 或 confirm_upload。 在文件上传完成后，请务必及时调用该接口，否则文件将不能被正确存储；如果调用该接口时实际并未完成文件上传，将返回错误信息。 
     * @summary 完成上传文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} confirmKey 确认参数，指定为开始上传文件时响应体中的 confirmKey 字段的值
     * @param {CompleteFileUploadConfirmEnum} confirm 完成上传标识
     * @param {CompleteFileUploadConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件；不传则沿用开始上传时的设置
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {CompleteFileUploadWithInodeEnum} [withInode] 是否返回 inode（文件目录 ID），0 或 1，默认 0
     * @param {CompleteFileUploadWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {CompleteFileUploadRequest} [completeFileUploadRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    completeFileUpload: async (t, a, i, r, s, o, n, p, c, l, d, h, u = {}) => {
      I("completeFileUpload", "libraryId", t), I("completeFileUpload", "spaceId", a), I("completeFileUpload", "confirmKey", i), I("completeFileUpload", "confirm", r);
      const y = "/api/v1/file/{LibraryId}/{SpaceId}/{ConfirmKey}#1".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{ConfirmKey}", encodeURIComponent(String(i))), f = new URL(y, O);
      let A;
      e && (A = e.baseOptions);
      const m = { method: "POST", ...A, ...u }, F = {}, v = {};
      r !== void 0 && (v.confirm = r), s !== void 0 && (v.conflict_resolution_strategy = s), o !== void 0 && (v.content_cas = o), n !== void 0 && (v.access_token = n), p !== void 0 && (v.library_secret = p), c !== void 0 && (v.user_id = c), l !== void 0 && (v.with_inode = l), d !== void 0 && (v.with_content_cas = d), F["Content-Type"] = "application/json", U(f, v);
      let C = A && A.headers ? A.headers : {};
      return m.headers = { ...F, ...C, ...u.headers }, m.data = $(h, m, e), {
        url: k(f),
        options: m
      };
    },
    /**
     * 用于转换文档格式，当前仅支持 doc/docx 转 pdf。 要求权限： 非 acl 鉴权：admin、space_admin acl 鉴权：canDownload（当前文件夹可下载）& canUpload（目标文件夹可上传） 非 acl 鉴权是指当前用户对所有文件的操作权限，详情可参考生成访问令牌接口； acl 鉴权是通过共享授权接口给指定用户，以文件夹为单位授予的权限，详情可参考角色授权模块； 该接口的源和目标均需要指定完整的文件路径，源与目标可以跨越目录，来实现将文件移动到任意其他目录下的功能，且支持同时修改文件名； 不会自动创建中间所需的各级父目录，所以必须保证路径的各级目录存在。 
     * @summary 文档转码
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {ConvertFileConvertEnum} convert 文档转码操作标识，固定值为1
     * @param {ConvertFileRequest} convertFileRequest 
     * @param {ConvertFileConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    convertFile: async (t, a, i, r, s, o, n, p, c, l = {}) => {
      I("convertFile", "libraryId", t), I("convertFile", "spaceId", a), I("convertFile", "filePath", i), I("convertFile", "convert", r), I("convertFile", "convertFileRequest", s);
      const d = "/api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#2".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), h = new URL(d, O);
      let u;
      e && (u = e.baseOptions);
      const y = { method: "PUT", ...u, ...l }, f = {}, A = {};
      r !== void 0 && (A.convert = r), o !== void 0 && (A.conflict_resolution_strategy = o), n !== void 0 && (A.access_token = n), p !== void 0 && (A.library_secret = p), c !== void 0 && (A.user_id = c), f["Content-Type"] = "application/json", U(h, A);
      let m = u && u.headers ? u.headers : {};
      return y.headers = { ...f, ...m, ...l.headers }, y.data = $(s, y, e), {
        url: k(h),
        options: y
      };
    },
    /**
     * 用于复制文件。 要求权限： admin、space_admin 或 copy_file/copy_file_force。 该接口的源和目标均需要指定完整的文件路径，源与目标可以跨越目录，来实现将文件复制到任意其他目录下的功能，且支持同时修改文件名； 不会自动创建中间所需的各级父目录，所以必须保证路径的各级目录存在。 
     * @summary 复制文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {CopyFileRequest} copyFileRequest 
     * @param {CopyFileConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {CopyFileWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    copyFile: async (t, a, i, r, s, o, n, p, c, l, d = {}) => {
      I("copyFile", "libraryId", t), I("copyFile", "spaceId", a), I("copyFile", "filePath", i), I("copyFile", "copyFileRequest", r);
      const h = "/api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#3".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), u = new URL(h, O);
      let y;
      e && (y = e.baseOptions);
      const f = { method: "PUT", ...y, ...d }, A = {}, m = {};
      s !== void 0 && (m.conflict_resolution_strategy = s), o !== void 0 && (m.content_cas = o), n !== void 0 && (m.access_token = n), p !== void 0 && (m.library_secret = p), c !== void 0 && (m.user_id = c), l !== void 0 && (m.with_content_cas = l), A["Content-Type"] = "application/json", U(u, m);
      let F = y && y.headers ? y.headers : {};
      return f.headers = { ...A, ...F, ...d.headers }, f.data = $(r, f, e), {
        url: k(u),
        options: f
      };
    },
    /**
     * 用于创建符号链接。 要求权限： 非 acl 鉴权：admin、space_admin 或 upload_file/upload_file_force/create_symlink/create_symlink_force acl 鉴权：canUpload（当前文件夹可上传） 非 acl 鉴权是指当前用户对所有文件的操作权限，详情可参考生成访问令牌接口； acl 鉴权是通过共享授权接口给指定用户，以文件夹为单位授予的权限，详情可参考角色授权模块； 符号链接本身与文件的概念一致，可以通过删除文件、重命名或移动文件、复制文件等接口删除、重命名或移动或复制符号链接本身，而不会影响符号链接所指向的文件； 与标准文件系统略有不同，符号链接所指向的文件，不会因为重命名或移动而丢失指向； 当符号链接指向的文件被覆盖上传时，该符号链接将指向新上传的文件。 
     * @summary 创建符号链接
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {CreateSymlinkRequest} createSymlinkRequest 
     * @param {CreateSymlinkConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite覆盖已有文件，默认为 rename
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSymlink: async (t, a, i, r, s, o, n, p, c = {}) => {
      I("createSymlink", "libraryId", t), I("createSymlink", "spaceId", a), I("createSymlink", "filePath", i), I("createSymlink", "createSymlinkRequest", r);
      const l = "/api/v1/file/{LibraryId}/{SpaceId}/{FilePath}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), d = new URL(l, O);
      let h;
      e && (h = e.baseOptions);
      const u = { method: "PUT", ...h, ...c }, y = {}, f = {};
      s !== void 0 && (f.conflict_resolution_strategy = s), o !== void 0 && (f.access_token = o), n !== void 0 && (f.library_secret = n), p !== void 0 && (f.user_id = p), y["Content-Type"] = "application/json", U(d, f);
      let A = h && h.headers ? h.headers : {};
      return u.headers = { ...y, ...A, ...c.headers }, u.data = $(r, u, e), {
        url: k(d),
        options: u
      };
    },
    /**
     * 用于删除文件。 要求权限： admin、space_admin 或 delete_file（未开启回收站或 Permanent 为 0）/delete_file_permanent（开启回收站且 Permanent 为 1） 如果媒体库启用回收站功能，则该接口不会永久删除文件，而是将文件移入回收站，可通过相关接口永久删除或恢复回收站内的文件，或直接清空回收站。 
     * @summary 删除文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {DeleteFilePermanentEnum} [permanent] 当媒体库开启回收站时，则该参数指定将文件移入回收站还是永久删除文件，1: 永久删除，0: 移入回收站，默认为 0
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteFile: async (t, a, i, r, s, o, n, p, c = {}) => {
      I("deleteFile", "libraryId", t), I("deleteFile", "spaceId", a), I("deleteFile", "filePath", i);
      const l = "/api/v1/file/{LibraryId}/{SpaceId}/{FilePath}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), d = new URL(l, O);
      let h;
      e && (h = e.baseOptions);
      const u = { method: "DELETE", ...h, ...c }, y = {}, f = {};
      r !== void 0 && (f.permanent = r), s !== void 0 && (f.access_token = s), o !== void 0 && (f.library_secret = o), n !== void 0 && (f.user_id = n), p !== void 0 && (f.content_cas = p), U(d, f);
      let A = h && h.headers ? h.headers : {};
      return u.headers = { ...y, ...A, ...c.headers }, {
        url: k(d),
        options: u
      };
    },
    /**
     * 用于下载文件。 可以直接在使用文件的参数中指定该 URL，例如对于图片文件可直接在小程序 <image> 标签、 HTML <img> 标签或小程序 wx.previewImage 接口等中使用，该接口将自动 302 跳转到真实的图片 URL；视频和文件同理； 
     * @summary 下载文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {string} [historyId] 历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版
     * @param {DownloadFileContentDispositionEnum} [contentDisposition] 用于设置Content-Disposition响应头，支持 inline 或者 attachment，可选参数，不传默认为inline
     * @param {DownloadFilePurposeEnum} [purpose] 用途，可选参数，可以设置为download或者preview，用于决定是否将该文件加入最近使用文件列表中，如果设置为preview，则会将该文件加入最近使用文件列表中，否则不会加入
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {number} [trafficLimit] 单链接下载限速，范围100KB/s-100MB/s，单位B
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {DownloadFileWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    downloadFile: async (t, a, i, r, s, o, n, p, c, l, d, h, u = {}) => {
      I("downloadFile", "libraryId", t), I("downloadFile", "spaceId", a), I("downloadFile", "filePath", i);
      const y = "/api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#2".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), f = new URL(y, O);
      let A;
      e && (A = e.baseOptions);
      const m = { method: "GET", ...A, ...u }, F = {}, v = {};
      r !== void 0 && (v.history_id = r), s !== void 0 && (v.content_disposition = s), o !== void 0 && (v.purpose = o), n !== void 0 && (v.access_token = n), p !== void 0 && (v.library_secret = p), c !== void 0 && (v.user_id = c), l !== void 0 && (v.traffic_limit = l), d !== void 0 && (v.content_cas = d), h !== void 0 && (v.with_content_cas = h), U(f, v);
      let C = A && A.headers ? A.headers : {};
      return m.headers = { ...F, ...C, ...u.headers }, {
        url: k(f),
        options: m
      };
    },
    /**
     * 下载视频转码接口转码后的文件，扩展下载文件接口。 权限说明：同下载文件接口。 补充说明： - 若 m3u8 转封装未完成，则返回 FileConverting - 若转码未完成，则返回原始视频的下载链接 
     * @summary 视频下载
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {DownloadTranscodedVideoTranscodingTemplateIdEnum} transcodingTemplateId 转码模板（见视频转码接口），可支持的模板列表为：h264_360p（流畅）、h264_480p（低清）、h264_720p（高清）、h264_1080p（超清）、h264_2K、h264_4K
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    downloadTranscodedVideo: async (t, a, i, r, s, o, n = {}) => {
      I("downloadTranscodedVideo", "libraryId", t), I("downloadTranscodedVideo", "spaceId", a), I("downloadTranscodedVideo", "filePath", i), I("downloadTranscodedVideo", "transcodingTemplateId", r);
      const p = "/api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#4".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), c = new URL(p, O);
      let l;
      e && (l = e.baseOptions);
      const d = { method: "GET", ...l, ...n }, h = {}, u = {};
      r !== void 0 && (u.transcoding_template_id = r), s !== void 0 && (u.access_token = s), o !== void 0 && (u.library_secret = o), U(c, u);
      let y = l && l.headers ? l.headers : {};
      return d.headers = { ...h, ...y, ...n.headers }, {
        url: k(c),
        options: d
      };
    },
    /**
     * 用于开始表单上传文件（multipart/form-data）。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 调用该接口将返回一系列用于 form 表单上传（multipart/form-data 格式）和确认上传完成的参数，上传的目标 URL 为 https://{Domain}/，其中 Domain 为响应体中的 domain 字段，例如 https://examplebucket-1250000000.cos.ap-beijing.myqcloud.com/； form 表单上传时还需要指定一系列额外的信息字段，这些字段的名和值包含在响应体中的 form 字段中，可以在 HTML form 表单中通过隐藏域或通过 JS 相关库、小程序 wx.uploadFile 等指定这些字段； form 表单中的文件字段，其表单字段名固定为 file，且必须作为表单中的最后一项； 在完成实际上传后，上传的目标 URL 将返回 HTTP 204 No Content，由于可能的跨域限制，建议直接通过相关接口的回调来判断是否上传完成，并且在上传完成后及时调用完成上传文件接口，确认上传结果； 默认情况下同名文件将自动修改文件名，可在完成上传文件接口中获取最终的文件路径； 不会自动创建所需的各级父目录，所以必须保证路径的各级目录存在。 
     * @summary 开始表单上传文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {FormUploadFileConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {number} [filesize] 上传文件大小，单位为字节（Byte），用于判断剩余空间是否足够
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [xSmhMeta] 自定义元数据，名称以 x-smh-meta- 开头的扩展头，值为字符串
     * @param {number} [trafficLimit] 单链接下载限速，范围100KB/s-100MB/s，单位B
     * @param {boolean} [preferSameOrigin] 是否倾向于保持相同域名，可选参数，可能的值为 true 或 false。此参数仅当上传文件的路径存在同名文件，且 ConflictResolutionStrategy 设置为 rename 或 overwrite 时生效。当设置此参数时，后台会尽量保证新上传的文件与原文件使用相同的域名进行上传或下载，但在特殊情况下仍有可能使用不同域名，因此不应过于依赖此参数。
     * @param {FormUploadFileWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {FormUploadFileRequest} [formUploadFileRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    formUploadFile: async (t, a, i, r, s, o, n, p, c, l, d, h, u, y, f = {}) => {
      I("formUploadFile", "libraryId", t), I("formUploadFile", "spaceId", a), I("formUploadFile", "filePath", i);
      const A = "/api/v1/file/{LibraryId}/{SpaceId}/{FilePath}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), m = new URL(A, O);
      let F;
      e && (F = e.baseOptions);
      const v = { method: "POST", ...F, ...f }, C = {}, _ = {};
      r !== void 0 && (_.conflict_resolution_strategy = r), s !== void 0 && (_.content_cas = s), o !== void 0 && (_.filesize = o), n !== void 0 && (_.access_token = n), p !== void 0 && (_.library_secret = p), c !== void 0 && (_.user_id = c), d !== void 0 && (_.traffic_limit = d), h !== void 0 && (_.prefer_same_origin = h), u !== void 0 && (_.with_content_cas = u), C["Content-Type"] = "application/json", l != null && (C["x-smh-meta-*"] = String(l)), U(m, _);
      let w = F && F.headers ? F.headers : {};
      return v.headers = { ...C, ...w, ...f.headers }, v.data = $(y, v, e), {
        url: k(m),
        options: v
      };
    },
    /**
     * 用于获取照片/视频封面缩略图。 视频封面使用该视频的首帧图片； 针对照片或视频封面，优先使用人脸识别智能缩放裁剪为 {Size}px × {Size}px 大小，如果未识别到人脸则居中缩放裁剪为 {Size}px × {Size}px 大小，如果未指定 {Size} 参数则使用照片或视频封面原图，最后 302 跳转到对应的图片的 URL； 可以直接在使用图片的参数中指定该 URL，例如小程序 <image> 标签、 HTML <img> 标签或小程序 wx.previewImage 接口等，该接口将自动 302 跳转到真实的图片 URL； 如果文件不属于可预览的媒体类型，则会跳转至文件的下载链接。 
     * @summary 获取照片/视频封面缩略图
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {number} preview 预览标识，固定值为1
     * @param {number} [size] 缩放大小，优先使用人脸识别智能缩放裁剪为 size×size，未识别到人脸则居中缩放裁剪为 size×size；不传则使用原图
     * @param {number} [scale] 等比例缩放百分比（1-100），当未传 size 时生效
     * @param {number} [widthSize] 缩放宽度，当未传 size 和 scale 时生效；未传高度时，高度按等比例缩放
     * @param {number} [heightSize] 缩放高度，当未传 size 和 scale 时生效；未传宽度时，宽度按等比例缩放
     * @param {number} [frameNumber] 帧数，针对 gif 的降帧处理
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getCover: async (t, a, i, r, s, o, n, p, c, l, d, h, u = {}) => {
      I("getCover", "libraryId", t), I("getCover", "spaceId", a), I("getCover", "filePath", i), I("getCover", "preview", r);
      const y = "/api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#1".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), f = new URL(y, O);
      let A;
      e && (A = e.baseOptions);
      const m = { method: "GET", ...A, ...u }, F = {}, v = {};
      r !== void 0 && (v.preview = r), s !== void 0 && (v.size = s), o !== void 0 && (v.scale = o), n !== void 0 && (v.width_size = n), p !== void 0 && (v.height_size = p), c !== void 0 && (v.frame_number = c), l !== void 0 && (v.access_token = l), d !== void 0 && (v.library_secret = d), h !== void 0 && (v.user_id = h), U(f, v);
      let C = A && A.headers ? A.headers : {};
      return m.headers = { ...F, ...C, ...u.headers }, {
        url: k(f),
        options: m
      };
    },
    /**
     * 根据文件 ID 查询文件信息
     * @summary 根据文件ID查询文件信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} inode 文件ID
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {GetFileInfoByInodeWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getFileInfoByInode: async (t, a, i, r, s, o, n = {}) => {
      I("getFileInfoByInode", "libraryId", t), I("getFileInfoByInode", "spaceId", a), I("getFileInfoByInode", "inode", i);
      const p = "/api/v1/inode/{LibraryId}/{SpaceId}/{Inode}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{Inode}", encodeURIComponent(String(i))), c = new URL(p, O);
      let l;
      e && (l = e.baseOptions);
      const d = { method: "GET", ...l, ...n }, h = {}, u = {};
      r !== void 0 && (u.access_token = r), s !== void 0 && (u.library_secret = s), o !== void 0 && (u.with_content_cas = o), U(c, u);
      let y = l && l.headers ? l.headers : {};
      return d.headers = { ...h, ...y, ...n.headers }, {
        url: k(c),
        options: d
      };
    },
    /**
     * 用于获取文件上传任务状态。 要求权限： admin、space_admin、upload_file、upload_file_force、begin_upload 或 begin_upload_force（注意：虽然本接口为读接口，但因为读取的是上传任务信息，故仍需上传文件的相关权限） 
     * @summary 获取文件上传任务状态
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} confirmKey 确认参数
     * @param {GetFileUploadUploadEnum} upload 上传任务标识
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getFileUpload: async (t, a, i, r, s, o, n, p = {}) => {
      I("getFileUpload", "libraryId", t), I("getFileUpload", "spaceId", a), I("getFileUpload", "confirmKey", i), I("getFileUpload", "upload", r);
      const c = "/api/v1/file/{LibraryId}/{SpaceId}/{ConfirmKey}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{ConfirmKey}", encodeURIComponent(String(i))), l = new URL(c, O);
      let d;
      e && (d = e.baseOptions);
      const h = { method: "GET", ...d, ...p }, u = {}, y = {};
      r !== void 0 && (y.upload = r), s !== void 0 && (y.access_token = s), o !== void 0 && (y.library_secret = o), n !== void 0 && (y.user_id = n), U(l, y);
      let f = d && d.headers ? d.headers : {};
      return h.headers = { ...u, ...f, ...p.headers }, {
        url: k(l),
        options: h
      };
    },
    /**
     * 用于获取文件下载链接和信息。 要求权限：无 
     * @summary 获取文件下载链接和信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {InfoFileInfoEnum} info 获取文件信息标识
     * @param {string} [historyId] 历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版
     * @param {InfoFileContentDispositionEnum} [contentDisposition] 用于设置Content-Disposition响应头，支持 inline 或者 attachment，可选参数，不传默认为inline
     * @param {InfoFilePurposeEnum} [purpose] 用途，可选参数，可以设置为download或者preview，用于决定是否将该文件加入最近使用文件列表中，如果设置为preview，则会将该文件加入最近使用文件列表中，否则不会加入
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {number} [trafficLimit] 单链接下载限速，范围100KB/s-100MB/s，单位B
     * @param {InfoFilePreCheckEnum} [preCheck] 是否只用于校验文件是否可预览和下载，设置该参数后返回结果中不包含cosUrl
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {InfoFileWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    infoFile: async (t, a, i, r, s, o, n, p, c, l, d, h, u, y, f = {}) => {
      I("infoFile", "libraryId", t), I("infoFile", "spaceId", a), I("infoFile", "filePath", i), I("infoFile", "info", r);
      const A = "/api/v1/file/{LibraryId}/{SpaceId}/{FilePath}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), m = new URL(A, O);
      let F;
      e && (F = e.baseOptions);
      const v = { method: "GET", ...F, ...f }, C = {}, _ = {};
      r !== void 0 && (_.info = r), s !== void 0 && (_.history_id = s), o !== void 0 && (_.content_disposition = o), n !== void 0 && (_.purpose = n), p !== void 0 && (_.access_token = p), c !== void 0 && (_.library_secret = c), l !== void 0 && (_.user_id = l), d !== void 0 && (_.traffic_limit = d), h !== void 0 && (_.pre_check = h), u !== void 0 && (_.content_cas = u), y !== void 0 && (_.with_content_cas = y), U(m, _);
      let w = F && F.headers ? F.headers : {};
      return v.headers = { ...C, ...w, ...f.headers }, {
        url: k(m),
        options: v
      };
    },
    /**
     * 用于重命名或移动文件。 要求权限： admin、space_admin 或 move_file/move_file_force。 该接口的源和目标均需要指定完整的文件路径，源与目标可以跨越目录，来实现将文件移动到任意其他目录下的功能，且支持同时修改文件名； 不会自动创建中间所需的各级父目录，所以必须保证路径的各级目录存在。 
     * @summary 重命名或移动文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {MoveFileRequest} moveFileRequest 
     * @param {MoveFileConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {MoveFileWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    moveFile: async (t, a, i, r, s, o, n, p, c, l, d = {}) => {
      I("moveFile", "libraryId", t), I("moveFile", "spaceId", a), I("moveFile", "filePath", i), I("moveFile", "moveFileRequest", r);
      const h = "/api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#4".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), u = new URL(h, O);
      let y;
      e && (y = e.baseOptions);
      const f = { method: "PUT", ...y, ...d }, A = {}, m = {};
      s !== void 0 && (m.conflict_resolution_strategy = s), o !== void 0 && (m.content_cas = o), n !== void 0 && (m.access_token = n), p !== void 0 && (m.library_secret = p), c !== void 0 && (m.user_id = c), l !== void 0 && (m.with_content_cas = l), A["Content-Type"] = "application/json", U(u, m);
      let F = y && y.headers ? y.headers : {};
      return f.headers = { ...A, ...F, ...d.headers }, f.data = $(r, f, e), {
        url: k(u),
        options: f
      };
    },
    /**
     * 用于开始分块上传文件。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 分块上传指使用通过 HTTP PUT 请求上传一个文件的分块，通过多次上传完成整个文件的上传，每次请求的请求体为文件内容的单个分块； 调用该接口将返回一系列用于分块上传请求和确认上传完成的参数，上传的目标 URL 为 https://{Domain}{Path}?uploadId={UploadId}&partNumber={PartNumber}，其中 Domain 为响应体中的 domain 字段，Path 为响应体中的 path 字段，UploadId 为响应体中的 uploadId 字段，PartNumber 为从 1 开始的分块顺序，例如 https://examplebucket-1250000000.cos.ap-beijing.myqcloud.com/smhxxx/xxx.mp4?uploadId=xxx&partNumber=1； 上传每个分块时还需要指定一系列额外的请求头部字段，这些字段的名和值包含在响应体中的 headers 字段中； 当在浏览器使用 JS 上传文件时，需要提前在绑定的 COS 存储桶中设置跨域访问 CORS 设置； 在完成实际上传后，上传的目标 URL 将返回 HTTP 200 OK； 与对象存储 COS 的分块上传不同，SMH 的分块上传无需记录 ETag，也无需在完成上传时传入这些 ETag，只需保证上传分块的连续即可，SMH 将在完成上传时自动执行这些操作； 默认情况下同名文件将自动修改文件名，可在完成上传文件接口中获取最终的文件路径； 不会自动创建所需的各级父目录，所以必须保证路径的各级目录存在。 
     * @summary 开始分块上传文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {MultipartUploadFileMultipartEnum} multipart 是否为分块上传标识，固定值为1
     * @param {MultipartUploadFileConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {number} [filesize] 上传文件大小，单位为字节（Byte），用于判断剩余空间是否足够
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [xSmhMeta] 自定义元数据，名称以 x-smh-meta- 开头的扩展头，值为字符串
     * @param {number} [trafficLimit] 单链接下载限速，范围100KB/s-100MB/s，单位B
     * @param {boolean} [preferSameOrigin] 是否倾向于保持相同域名，可选参数，可能的值为 true 或 false。此参数仅当上传文件的路径存在同名文件，且 ConflictResolutionStrategy 设置为 rename 或 overwrite 时生效。当设置此参数时，后台会尽量保证新上传的文件与原文件使用相同的域名进行上传或下载，但在特殊情况下仍有可能使用不同域名，因此不应过于依赖此参数。
     * @param {MultipartUploadFileWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {MultipartUploadFileRequest} [multipartUploadFileRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    multipartUploadFile: async (t, a, i, r, s, o, n, p, c, l, d, h, u, y, f, A = {}) => {
      I("multipartUploadFile", "libraryId", t), I("multipartUploadFile", "spaceId", a), I("multipartUploadFile", "filePath", i), I("multipartUploadFile", "multipart", r);
      const m = "/api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#1".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), F = new URL(m, O);
      let v;
      e && (v = e.baseOptions);
      const C = { method: "POST", ...v, ...A }, _ = {}, w = {};
      r !== void 0 && (w.multipart = r), s !== void 0 && (w.conflict_resolution_strategy = s), o !== void 0 && (w.content_cas = o), n !== void 0 && (w.filesize = n), p !== void 0 && (w.access_token = p), c !== void 0 && (w.library_secret = c), l !== void 0 && (w.user_id = l), h !== void 0 && (w.traffic_limit = h), u !== void 0 && (w.prefer_same_origin = u), y !== void 0 && (w.with_content_cas = y), _["Content-Type"] = "application/json", d != null && (_["x-smh-meta-*"] = String(d)), U(F, w);
      let B = v && v.headers ? v.headers : {};
      return C.headers = { ..._, ...B, ...A.headers }, C.data = $(f, C, e), {
        url: k(F),
        options: C
      };
    },
    /**
     * 用于获取 HTML 格式文档预览。 返回HTML或JPG格式的文档用于预览； 如果文件不属于可预览的文档类型，则会跳转至文件的下载链接。 
     * @summary 获取 HTML 格式文档预览
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {PreviewFilePreviewEnum} preview 文档预览标识，固定值为1
     * @param {string} [historyId] 历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版
     * @param {string} [type] 文档预览方式，如果设置为 pic 则以 jpg 格式预览文档首页，否则以 html 格式预览文档
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    previewFile: async (t, a, i, r, s, o, n, p, c, l = {}) => {
      I("previewFile", "libraryId", t), I("previewFile", "spaceId", a), I("previewFile", "filePath", i), I("previewFile", "preview", r);
      const d = "/api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#3".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), h = new URL(d, O);
      let u;
      e && (u = e.baseOptions);
      const y = { method: "GET", ...u, ...l }, f = {}, A = {};
      r !== void 0 && (A.preview = r), s !== void 0 && (A.history_id = s), o !== void 0 && (A.type = o), n !== void 0 && (A.access_token = n), p !== void 0 && (A.library_secret = p), c !== void 0 && (A.user_id = c), U(h, A);
      let m = u && u.headers ? u.headers : {};
      return y.headers = { ...f, ...m, ...l.headers }, {
        url: k(h),
        options: y
      };
    },
    /**
     * 用于分块上传任务续期。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 仅支持分块上传任务的续期。 
     * @summary 分块上传任务续期
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} confirmKey 确认参数，指定为开始上传文件时响应体中的 confirmKey 字段的值
     * @param {RenewMultipartUploadRenewEnum} renew 续期标识
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {number} [trafficLimit] 单链接下载限速，范围100KB/s-100MB/s，单位B
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    renewMultipartUpload: async (t, a, i, r, s, o, n, p, c = {}) => {
      I("renewMultipartUpload", "libraryId", t), I("renewMultipartUpload", "spaceId", a), I("renewMultipartUpload", "confirmKey", i), I("renewMultipartUpload", "renew", r);
      const l = "/api/v1/file/{LibraryId}/{SpaceId}/{ConfirmKey}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{ConfirmKey}", encodeURIComponent(String(i))), d = new URL(l, O);
      let h;
      e && (h = e.baseOptions);
      const u = { method: "POST", ...h, ...c }, y = {}, f = {};
      r !== void 0 && (f.renew = r), s !== void 0 && (f.access_token = s), o !== void 0 && (f.library_secret = o), n !== void 0 && (f.user_id = n), p !== void 0 && (f.traffic_limit = p), U(d, f);
      let A = h && h.headers ? h.headers : {};
      return u.headers = { ...y, ...A, ...c.headers }, {
        url: k(d),
        options: u
      };
    },
    /**
     * 用于开始简单上传文件。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 PUT 简单上传指使用 HTTP PUT 请求上传一个文件，请求体即为文件的内容； 调用该接口将返回一系列用于 PUT 简单上传请求和确认上传完成的参数，上传的目标 URL 为 https://{Domain}{Path}，其中 Domain 为响应体中的 domain 字段，Path 为响应体中的 path 字段，例如 https://examplebucket-1250000000.cos.ap-beijing.myqcloud.com/smhxxx/xxx.mp4； PUT 简单上传时还需要指定一系列额外的请求头部字段，这些字段的名和值包含在响应体中的 headers 字段中； 当在浏览器使用 JS 上传文件时，需要提前在绑定的 COS 存储桶中设置跨域访问 CORS 设置； 在完成实际上传后，上传的目标 URL 将返回 HTTP 200 OK； 默认情况下同名文件将自动修改文件名，可在完成上传文件接口中获取最终的文件路径； 不会自动创建所需的各级父目录，所以必须保证路径的各级目录存在。 
     * @summary 开始简单上传文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {SimpleUploadFileConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {number} [filesize] 上传文件大小，单位为字节（Byte），用于判断剩余空间是否足够
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [xSmhMeta] 自定义元数据，名称以 x-smh-meta- 开头的扩展头，值为字符串
     * @param {number} [trafficLimit] 单链接下载限速，范围100KB/s-100MB/s，单位B
     * @param {boolean} [preferSameOrigin] 是否倾向于保持相同域名，可选参数，可能的值为 true 或 false。此参数仅当上传文件的路径存在同名文件，且 ConflictResolutionStrategy 设置为 rename 或 overwrite 时生效。当设置此参数时，后台会尽量保证新上传的文件与原文件使用相同的域名进行上传或下载，但在特殊情况下仍有可能使用不同域名，因此不应过于依赖此参数。
     * @param {SimpleUploadFileWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {SimpleUploadFileRequest} [simpleUploadFileRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    simpleUploadFile: async (t, a, i, r, s, o, n, p, c, l, d, h, u, y, f = {}) => {
      I("simpleUploadFile", "libraryId", t), I("simpleUploadFile", "spaceId", a), I("simpleUploadFile", "filePath", i);
      const A = "/api/v1/file/{LibraryId}/{SpaceId}/{FilePath}#1".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), m = new URL(A, O);
      let F;
      e && (F = e.baseOptions);
      const v = { method: "PUT", ...F, ...f }, C = {}, _ = {};
      r !== void 0 && (_.conflict_resolution_strategy = r), s !== void 0 && (_.content_cas = s), o !== void 0 && (_.filesize = o), n !== void 0 && (_.access_token = n), p !== void 0 && (_.library_secret = p), c !== void 0 && (_.user_id = c), d !== void 0 && (_.traffic_limit = d), h !== void 0 && (_.prefer_same_origin = h), u !== void 0 && (_.with_content_cas = u), C["Content-Type"] = "application/json", l != null && (C["x-smh-meta-*"] = String(l)), U(m, _);
      let w = F && F.headers ? F.headers : {};
      return v.headers = { ...C, ...w, ...f.headers }, v.data = $(y, v, e), {
        url: k(m),
        options: v
      };
    }
  };
}, Z = function(e) {
  const t = Dn(e);
  return {
    /**
     * 用于取消上传任务。 要求权限： admin、space_admin、upload_file、upload_file_force、begin_upload 或 begin_upload_force（注意：虽然本接口为删除接口，但因为删除的是上传任务信息，故仍需上传文件的相关权限） 如果上传任务为分块上传任务，那么该请求将同时放弃 COS 中的分块上传任务。 
     * @summary 取消上传任务
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} confirmKey 确认参数
     * @param {AbortFileUploadUploadEnum} upload 上传任务标识
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async abortFileUpload(a, i, r, s, o, n, p, c) {
      var u, y;
      const l = await t.abortFileUpload(a, i, r, s, o, n, p, c), d = (e == null ? void 0 : e.serverIndex) ?? 0, h = (y = (u = D["FileApi.abortFileUpload"]) == null ? void 0 : u[d]) == null ? void 0 : y.url;
      return (f, A) => T(l, R, x, e)(f, h || A);
    },
    /**
     * 用于查询文件删除的原因，可能是用户主动删除或者 quota 超限删除。 要求权限：admin 或 space_admin 
     * @summary 查询文件删除原因
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} inode 文件的 Inode
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async checkFileDeletion(a, i, r, s, o, n) {
      var d, h;
      const p = await t.checkFileDeletion(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["FileApi.checkFileDeletion"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    },
    /**
     * 用于检查文件状态
     * @summary 检查文件状态
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {string} [historyId] 历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async checkFileStatus(a, i, r, s, o, n, p, c) {
      var u, y;
      const l = await t.checkFileStatus(a, i, r, s, o, n, p, c), d = (e == null ? void 0 : e.serverIndex) ?? 0, h = (y = (u = D["FileApi.checkFileStatus"]) == null ? void 0 : u[d]) == null ? void 0 : y.url;
      return (f, A) => T(l, R, x, e)(f, h || A);
    },
    /**
     * 用于完成上传文件。 要求权限：admin、space_admin、upload_file、upload_file_force 或 confirm_upload。 在文件上传完成后，请务必及时调用该接口，否则文件将不能被正确存储；如果调用该接口时实际并未完成文件上传，将返回错误信息。 
     * @summary 完成上传文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} confirmKey 确认参数，指定为开始上传文件时响应体中的 confirmKey 字段的值
     * @param {CompleteFileUploadConfirmEnum} confirm 完成上传标识
     * @param {CompleteFileUploadConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件；不传则沿用开始上传时的设置
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {CompleteFileUploadWithInodeEnum} [withInode] 是否返回 inode（文件目录 ID），0 或 1，默认 0
     * @param {CompleteFileUploadWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {CompleteFileUploadRequest} [completeFileUploadRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async completeFileUpload(a, i, r, s, o, n, p, c, l, d, h, u, y) {
      var F, v;
      const f = await t.completeFileUpload(a, i, r, s, o, n, p, c, l, d, h, u, y), A = (e == null ? void 0 : e.serverIndex) ?? 0, m = (v = (F = D["FileApi.completeFileUpload"]) == null ? void 0 : F[A]) == null ? void 0 : v.url;
      return (C, _) => T(f, R, x, e)(C, m || _);
    },
    /**
     * 用于转换文档格式，当前仅支持 doc/docx 转 pdf。 要求权限： 非 acl 鉴权：admin、space_admin acl 鉴权：canDownload（当前文件夹可下载）& canUpload（目标文件夹可上传） 非 acl 鉴权是指当前用户对所有文件的操作权限，详情可参考生成访问令牌接口； acl 鉴权是通过共享授权接口给指定用户，以文件夹为单位授予的权限，详情可参考角色授权模块； 该接口的源和目标均需要指定完整的文件路径，源与目标可以跨越目录，来实现将文件移动到任意其他目录下的功能，且支持同时修改文件名； 不会自动创建中间所需的各级父目录，所以必须保证路径的各级目录存在。 
     * @summary 文档转码
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {ConvertFileConvertEnum} convert 文档转码操作标识，固定值为1
     * @param {ConvertFileRequest} convertFileRequest 
     * @param {ConvertFileConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async convertFile(a, i, r, s, o, n, p, c, l, d) {
      var f, A;
      const h = await t.convertFile(a, i, r, s, o, n, p, c, l, d), u = (e == null ? void 0 : e.serverIndex) ?? 0, y = (A = (f = D["FileApi.convertFile"]) == null ? void 0 : f[u]) == null ? void 0 : A.url;
      return (m, F) => T(h, R, x, e)(m, y || F);
    },
    /**
     * 用于复制文件。 要求权限： admin、space_admin 或 copy_file/copy_file_force。 该接口的源和目标均需要指定完整的文件路径，源与目标可以跨越目录，来实现将文件复制到任意其他目录下的功能，且支持同时修改文件名； 不会自动创建中间所需的各级父目录，所以必须保证路径的各级目录存在。 
     * @summary 复制文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {CopyFileRequest} copyFileRequest 
     * @param {CopyFileConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {CopyFileWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async copyFile(a, i, r, s, o, n, p, c, l, d, h) {
      var A, m;
      const u = await t.copyFile(a, i, r, s, o, n, p, c, l, d, h), y = (e == null ? void 0 : e.serverIndex) ?? 0, f = (m = (A = D["FileApi.copyFile"]) == null ? void 0 : A[y]) == null ? void 0 : m.url;
      return (F, v) => T(u, R, x, e)(F, f || v);
    },
    /**
     * 用于创建符号链接。 要求权限： 非 acl 鉴权：admin、space_admin 或 upload_file/upload_file_force/create_symlink/create_symlink_force acl 鉴权：canUpload（当前文件夹可上传） 非 acl 鉴权是指当前用户对所有文件的操作权限，详情可参考生成访问令牌接口； acl 鉴权是通过共享授权接口给指定用户，以文件夹为单位授予的权限，详情可参考角色授权模块； 符号链接本身与文件的概念一致，可以通过删除文件、重命名或移动文件、复制文件等接口删除、重命名或移动或复制符号链接本身，而不会影响符号链接所指向的文件； 与标准文件系统略有不同，符号链接所指向的文件，不会因为重命名或移动而丢失指向； 当符号链接指向的文件被覆盖上传时，该符号链接将指向新上传的文件。 
     * @summary 创建符号链接
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {CreateSymlinkRequest} createSymlinkRequest 
     * @param {CreateSymlinkConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite覆盖已有文件，默认为 rename
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createSymlink(a, i, r, s, o, n, p, c, l) {
      var y, f;
      const d = await t.createSymlink(a, i, r, s, o, n, p, c, l), h = (e == null ? void 0 : e.serverIndex) ?? 0, u = (f = (y = D["FileApi.createSymlink"]) == null ? void 0 : y[h]) == null ? void 0 : f.url;
      return (A, m) => T(d, R, x, e)(A, u || m);
    },
    /**
     * 用于删除文件。 要求权限： admin、space_admin 或 delete_file（未开启回收站或 Permanent 为 0）/delete_file_permanent（开启回收站且 Permanent 为 1） 如果媒体库启用回收站功能，则该接口不会永久删除文件，而是将文件移入回收站，可通过相关接口永久删除或恢复回收站内的文件，或直接清空回收站。 
     * @summary 删除文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {DeleteFilePermanentEnum} [permanent] 当媒体库开启回收站时，则该参数指定将文件移入回收站还是永久删除文件，1: 永久删除，0: 移入回收站，默认为 0
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteFile(a, i, r, s, o, n, p, c, l) {
      var y, f;
      const d = await t.deleteFile(a, i, r, s, o, n, p, c, l), h = (e == null ? void 0 : e.serverIndex) ?? 0, u = (f = (y = D["FileApi.deleteFile"]) == null ? void 0 : y[h]) == null ? void 0 : f.url;
      return (A, m) => T(d, R, x, e)(A, u || m);
    },
    /**
     * 用于下载文件。 可以直接在使用文件的参数中指定该 URL，例如对于图片文件可直接在小程序 <image> 标签、 HTML <img> 标签或小程序 wx.previewImage 接口等中使用，该接口将自动 302 跳转到真实的图片 URL；视频和文件同理； 
     * @summary 下载文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {string} [historyId] 历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版
     * @param {DownloadFileContentDispositionEnum} [contentDisposition] 用于设置Content-Disposition响应头，支持 inline 或者 attachment，可选参数，不传默认为inline
     * @param {DownloadFilePurposeEnum} [purpose] 用途，可选参数，可以设置为download或者preview，用于决定是否将该文件加入最近使用文件列表中，如果设置为preview，则会将该文件加入最近使用文件列表中，否则不会加入
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {number} [trafficLimit] 单链接下载限速，范围100KB/s-100MB/s，单位B
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {DownloadFileWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async downloadFile(a, i, r, s, o, n, p, c, l, d, h, u, y) {
      var F, v;
      const f = await t.downloadFile(a, i, r, s, o, n, p, c, l, d, h, u, y), A = (e == null ? void 0 : e.serverIndex) ?? 0, m = (v = (F = D["FileApi.downloadFile"]) == null ? void 0 : F[A]) == null ? void 0 : v.url;
      return (C, _) => T(f, R, x, e)(C, m || _);
    },
    /**
     * 下载视频转码接口转码后的文件，扩展下载文件接口。 权限说明：同下载文件接口。 补充说明： - 若 m3u8 转封装未完成，则返回 FileConverting - 若转码未完成，则返回原始视频的下载链接 
     * @summary 视频下载
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {DownloadTranscodedVideoTranscodingTemplateIdEnum} transcodingTemplateId 转码模板（见视频转码接口），可支持的模板列表为：h264_360p（流畅）、h264_480p（低清）、h264_720p（高清）、h264_1080p（超清）、h264_2K、h264_4K
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async downloadTranscodedVideo(a, i, r, s, o, n, p) {
      var h, u;
      const c = await t.downloadTranscodedVideo(a, i, r, s, o, n, p), l = (e == null ? void 0 : e.serverIndex) ?? 0, d = (u = (h = D["FileApi.downloadTranscodedVideo"]) == null ? void 0 : h[l]) == null ? void 0 : u.url;
      return (y, f) => T(c, R, x, e)(y, d || f);
    },
    /**
     * 用于开始表单上传文件（multipart/form-data）。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 调用该接口将返回一系列用于 form 表单上传（multipart/form-data 格式）和确认上传完成的参数，上传的目标 URL 为 https://{Domain}/，其中 Domain 为响应体中的 domain 字段，例如 https://examplebucket-1250000000.cos.ap-beijing.myqcloud.com/； form 表单上传时还需要指定一系列额外的信息字段，这些字段的名和值包含在响应体中的 form 字段中，可以在 HTML form 表单中通过隐藏域或通过 JS 相关库、小程序 wx.uploadFile 等指定这些字段； form 表单中的文件字段，其表单字段名固定为 file，且必须作为表单中的最后一项； 在完成实际上传后，上传的目标 URL 将返回 HTTP 204 No Content，由于可能的跨域限制，建议直接通过相关接口的回调来判断是否上传完成，并且在上传完成后及时调用完成上传文件接口，确认上传结果； 默认情况下同名文件将自动修改文件名，可在完成上传文件接口中获取最终的文件路径； 不会自动创建所需的各级父目录，所以必须保证路径的各级目录存在。 
     * @summary 开始表单上传文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {FormUploadFileConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {number} [filesize] 上传文件大小，单位为字节（Byte），用于判断剩余空间是否足够
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [xSmhMeta] 自定义元数据，名称以 x-smh-meta- 开头的扩展头，值为字符串
     * @param {number} [trafficLimit] 单链接下载限速，范围100KB/s-100MB/s，单位B
     * @param {boolean} [preferSameOrigin] 是否倾向于保持相同域名，可选参数，可能的值为 true 或 false。此参数仅当上传文件的路径存在同名文件，且 ConflictResolutionStrategy 设置为 rename 或 overwrite 时生效。当设置此参数时，后台会尽量保证新上传的文件与原文件使用相同的域名进行上传或下载，但在特殊情况下仍有可能使用不同域名，因此不应过于依赖此参数。
     * @param {FormUploadFileWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {FormUploadFileRequest} [formUploadFileRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async formUploadFile(a, i, r, s, o, n, p, c, l, d, h, u, y, f, A) {
      var C, _;
      const m = await t.formUploadFile(a, i, r, s, o, n, p, c, l, d, h, u, y, f, A), F = (e == null ? void 0 : e.serverIndex) ?? 0, v = (_ = (C = D["FileApi.formUploadFile"]) == null ? void 0 : C[F]) == null ? void 0 : _.url;
      return (w, B) => T(m, R, x, e)(w, v || B);
    },
    /**
     * 用于获取照片/视频封面缩略图。 视频封面使用该视频的首帧图片； 针对照片或视频封面，优先使用人脸识别智能缩放裁剪为 {Size}px × {Size}px 大小，如果未识别到人脸则居中缩放裁剪为 {Size}px × {Size}px 大小，如果未指定 {Size} 参数则使用照片或视频封面原图，最后 302 跳转到对应的图片的 URL； 可以直接在使用图片的参数中指定该 URL，例如小程序 <image> 标签、 HTML <img> 标签或小程序 wx.previewImage 接口等，该接口将自动 302 跳转到真实的图片 URL； 如果文件不属于可预览的媒体类型，则会跳转至文件的下载链接。 
     * @summary 获取照片/视频封面缩略图
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {number} preview 预览标识，固定值为1
     * @param {number} [size] 缩放大小，优先使用人脸识别智能缩放裁剪为 size×size，未识别到人脸则居中缩放裁剪为 size×size；不传则使用原图
     * @param {number} [scale] 等比例缩放百分比（1-100），当未传 size 时生效
     * @param {number} [widthSize] 缩放宽度，当未传 size 和 scale 时生效；未传高度时，高度按等比例缩放
     * @param {number} [heightSize] 缩放高度，当未传 size 和 scale 时生效；未传宽度时，宽度按等比例缩放
     * @param {number} [frameNumber] 帧数，针对 gif 的降帧处理
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getCover(a, i, r, s, o, n, p, c, l, d, h, u, y) {
      var F, v;
      const f = await t.getCover(a, i, r, s, o, n, p, c, l, d, h, u, y), A = (e == null ? void 0 : e.serverIndex) ?? 0, m = (v = (F = D["FileApi.getCover"]) == null ? void 0 : F[A]) == null ? void 0 : v.url;
      return (C, _) => T(f, R, x, e)(C, m || _);
    },
    /**
     * 根据文件 ID 查询文件信息
     * @summary 根据文件ID查询文件信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} inode 文件ID
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {GetFileInfoByInodeWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getFileInfoByInode(a, i, r, s, o, n, p) {
      var h, u;
      const c = await t.getFileInfoByInode(a, i, r, s, o, n, p), l = (e == null ? void 0 : e.serverIndex) ?? 0, d = (u = (h = D["FileApi.getFileInfoByInode"]) == null ? void 0 : h[l]) == null ? void 0 : u.url;
      return (y, f) => T(c, R, x, e)(y, d || f);
    },
    /**
     * 用于获取文件上传任务状态。 要求权限： admin、space_admin、upload_file、upload_file_force、begin_upload 或 begin_upload_force（注意：虽然本接口为读接口，但因为读取的是上传任务信息，故仍需上传文件的相关权限） 
     * @summary 获取文件上传任务状态
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} confirmKey 确认参数
     * @param {GetFileUploadUploadEnum} upload 上传任务标识
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getFileUpload(a, i, r, s, o, n, p, c) {
      var u, y;
      const l = await t.getFileUpload(a, i, r, s, o, n, p, c), d = (e == null ? void 0 : e.serverIndex) ?? 0, h = (y = (u = D["FileApi.getFileUpload"]) == null ? void 0 : u[d]) == null ? void 0 : y.url;
      return (f, A) => T(l, R, x, e)(f, h || A);
    },
    /**
     * 用于获取文件下载链接和信息。 要求权限：无 
     * @summary 获取文件下载链接和信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {InfoFileInfoEnum} info 获取文件信息标识
     * @param {string} [historyId] 历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版
     * @param {InfoFileContentDispositionEnum} [contentDisposition] 用于设置Content-Disposition响应头，支持 inline 或者 attachment，可选参数，不传默认为inline
     * @param {InfoFilePurposeEnum} [purpose] 用途，可选参数，可以设置为download或者preview，用于决定是否将该文件加入最近使用文件列表中，如果设置为preview，则会将该文件加入最近使用文件列表中，否则不会加入
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {number} [trafficLimit] 单链接下载限速，范围100KB/s-100MB/s，单位B
     * @param {InfoFilePreCheckEnum} [preCheck] 是否只用于校验文件是否可预览和下载，设置该参数后返回结果中不包含cosUrl
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {InfoFileWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async infoFile(a, i, r, s, o, n, p, c, l, d, h, u, y, f, A) {
      var C, _;
      const m = await t.infoFile(a, i, r, s, o, n, p, c, l, d, h, u, y, f, A), F = (e == null ? void 0 : e.serverIndex) ?? 0, v = (_ = (C = D["FileApi.infoFile"]) == null ? void 0 : C[F]) == null ? void 0 : _.url;
      return (w, B) => T(m, R, x, e)(w, v || B);
    },
    /**
     * 用于重命名或移动文件。 要求权限： admin、space_admin 或 move_file/move_file_force。 该接口的源和目标均需要指定完整的文件路径，源与目标可以跨越目录，来实现将文件移动到任意其他目录下的功能，且支持同时修改文件名； 不会自动创建中间所需的各级父目录，所以必须保证路径的各级目录存在。 
     * @summary 重命名或移动文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {MoveFileRequest} moveFileRequest 
     * @param {MoveFileConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {MoveFileWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async moveFile(a, i, r, s, o, n, p, c, l, d, h) {
      var A, m;
      const u = await t.moveFile(a, i, r, s, o, n, p, c, l, d, h), y = (e == null ? void 0 : e.serverIndex) ?? 0, f = (m = (A = D["FileApi.moveFile"]) == null ? void 0 : A[y]) == null ? void 0 : m.url;
      return (F, v) => T(u, R, x, e)(F, f || v);
    },
    /**
     * 用于开始分块上传文件。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 分块上传指使用通过 HTTP PUT 请求上传一个文件的分块，通过多次上传完成整个文件的上传，每次请求的请求体为文件内容的单个分块； 调用该接口将返回一系列用于分块上传请求和确认上传完成的参数，上传的目标 URL 为 https://{Domain}{Path}?uploadId={UploadId}&partNumber={PartNumber}，其中 Domain 为响应体中的 domain 字段，Path 为响应体中的 path 字段，UploadId 为响应体中的 uploadId 字段，PartNumber 为从 1 开始的分块顺序，例如 https://examplebucket-1250000000.cos.ap-beijing.myqcloud.com/smhxxx/xxx.mp4?uploadId=xxx&partNumber=1； 上传每个分块时还需要指定一系列额外的请求头部字段，这些字段的名和值包含在响应体中的 headers 字段中； 当在浏览器使用 JS 上传文件时，需要提前在绑定的 COS 存储桶中设置跨域访问 CORS 设置； 在完成实际上传后，上传的目标 URL 将返回 HTTP 200 OK； 与对象存储 COS 的分块上传不同，SMH 的分块上传无需记录 ETag，也无需在完成上传时传入这些 ETag，只需保证上传分块的连续即可，SMH 将在完成上传时自动执行这些操作； 默认情况下同名文件将自动修改文件名，可在完成上传文件接口中获取最终的文件路径； 不会自动创建所需的各级父目录，所以必须保证路径的各级目录存在。 
     * @summary 开始分块上传文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {MultipartUploadFileMultipartEnum} multipart 是否为分块上传标识，固定值为1
     * @param {MultipartUploadFileConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {number} [filesize] 上传文件大小，单位为字节（Byte），用于判断剩余空间是否足够
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [xSmhMeta] 自定义元数据，名称以 x-smh-meta- 开头的扩展头，值为字符串
     * @param {number} [trafficLimit] 单链接下载限速，范围100KB/s-100MB/s，单位B
     * @param {boolean} [preferSameOrigin] 是否倾向于保持相同域名，可选参数，可能的值为 true 或 false。此参数仅当上传文件的路径存在同名文件，且 ConflictResolutionStrategy 设置为 rename 或 overwrite 时生效。当设置此参数时，后台会尽量保证新上传的文件与原文件使用相同的域名进行上传或下载，但在特殊情况下仍有可能使用不同域名，因此不应过于依赖此参数。
     * @param {MultipartUploadFileWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {MultipartUploadFileRequest} [multipartUploadFileRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async multipartUploadFile(a, i, r, s, o, n, p, c, l, d, h, u, y, f, A, m) {
      var _, w;
      const F = await t.multipartUploadFile(a, i, r, s, o, n, p, c, l, d, h, u, y, f, A, m), v = (e == null ? void 0 : e.serverIndex) ?? 0, C = (w = (_ = D["FileApi.multipartUploadFile"]) == null ? void 0 : _[v]) == null ? void 0 : w.url;
      return (B, H) => T(F, R, x, e)(B, C || H);
    },
    /**
     * 用于获取 HTML 格式文档预览。 返回HTML或JPG格式的文档用于预览； 如果文件不属于可预览的文档类型，则会跳转至文件的下载链接。 
     * @summary 获取 HTML 格式文档预览
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {PreviewFilePreviewEnum} preview 文档预览标识，固定值为1
     * @param {string} [historyId] 历史版本 ID，用于获取不同版本的文件内容，可选参数，不传默认为最新版
     * @param {string} [type] 文档预览方式，如果设置为 pic 则以 jpg 格式预览文档首页，否则以 html 格式预览文档
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async previewFile(a, i, r, s, o, n, p, c, l, d) {
      var f, A;
      const h = await t.previewFile(a, i, r, s, o, n, p, c, l, d), u = (e == null ? void 0 : e.serverIndex) ?? 0, y = (A = (f = D["FileApi.previewFile"]) == null ? void 0 : f[u]) == null ? void 0 : A.url;
      return (m, F) => T(h, R, x, e)(m, y || F);
    },
    /**
     * 用于分块上传任务续期。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 仅支持分块上传任务的续期。 
     * @summary 分块上传任务续期
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} confirmKey 确认参数，指定为开始上传文件时响应体中的 confirmKey 字段的值
     * @param {RenewMultipartUploadRenewEnum} renew 续期标识
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {number} [trafficLimit] 单链接下载限速，范围100KB/s-100MB/s，单位B
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async renewMultipartUpload(a, i, r, s, o, n, p, c, l) {
      var y, f;
      const d = await t.renewMultipartUpload(a, i, r, s, o, n, p, c, l), h = (e == null ? void 0 : e.serverIndex) ?? 0, u = (f = (y = D["FileApi.renewMultipartUpload"]) == null ? void 0 : y[h]) == null ? void 0 : f.url;
      return (A, m) => T(d, R, x, e)(A, u || m);
    },
    /**
     * 用于开始简单上传文件。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 PUT 简单上传指使用 HTTP PUT 请求上传一个文件，请求体即为文件的内容； 调用该接口将返回一系列用于 PUT 简单上传请求和确认上传完成的参数，上传的目标 URL 为 https://{Domain}{Path}，其中 Domain 为响应体中的 domain 字段，Path 为响应体中的 path 字段，例如 https://examplebucket-1250000000.cos.ap-beijing.myqcloud.com/smhxxx/xxx.mp4； PUT 简单上传时还需要指定一系列额外的请求头部字段，这些字段的名和值包含在响应体中的 headers 字段中； 当在浏览器使用 JS 上传文件时，需要提前在绑定的 COS 存储桶中设置跨域访问 CORS 设置； 在完成实际上传后，上传的目标 URL 将返回 HTTP 200 OK； 默认情况下同名文件将自动修改文件名，可在完成上传文件接口中获取最终的文件路径； 不会自动创建所需的各级父目录，所以必须保证路径的各级目录存在。 
     * @summary 开始简单上传文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {SimpleUploadFileConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式，ask冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename冲突时自动重命名文件，overwrite如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 rename
     * @param {string} [contentCas] 文件内容的Cas标识，可选参数
     * @param {number} [filesize] 上传文件大小，单位为字节（Byte），用于判断剩余空间是否足够
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [xSmhMeta] 自定义元数据，名称以 x-smh-meta- 开头的扩展头，值为字符串
     * @param {number} [trafficLimit] 单链接下载限速，范围100KB/s-100MB/s，单位B
     * @param {boolean} [preferSameOrigin] 是否倾向于保持相同域名，可选参数，可能的值为 true 或 false。此参数仅当上传文件的路径存在同名文件，且 ConflictResolutionStrategy 设置为 rename 或 overwrite 时生效。当设置此参数时，后台会尽量保证新上传的文件与原文件使用相同的域名进行上传或下载，但在特殊情况下仍有可能使用不同域名，因此不应过于依赖此参数。
     * @param {SimpleUploadFileWithContentCasEnum} [withContentCas] 0 或 1，是否返回文件内容的Cas标识，可选，默认不返回
     * @param {SimpleUploadFileRequest} [simpleUploadFileRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async simpleUploadFile(a, i, r, s, o, n, p, c, l, d, h, u, y, f, A) {
      var C, _;
      const m = await t.simpleUploadFile(a, i, r, s, o, n, p, c, l, d, h, u, y, f, A), F = (e == null ? void 0 : e.serverIndex) ?? 0, v = (_ = (C = D["FileApi.simpleUploadFile"]) == null ? void 0 : C[F]) == null ? void 0 : _.url;
      return (w, B) => T(m, R, x, e)(w, v || B);
    }
  };
}, jt = class extends he {
  /**
   * 用于取消上传任务。 要求权限： admin、space_admin、upload_file、upload_file_force、begin_upload 或 begin_upload_force（注意：虽然本接口为删除接口，但因为删除的是上传任务信息，故仍需上传文件的相关权限） 如果上传任务为分块上传任务，那么该请求将同时放弃 COS 中的分块上传任务。 
   * @summary 取消上传任务
   * @param {FileApiAbortFileUploadRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  abortFileUpload(e, t) {
    return Z(this.configuration).abortFileUpload(e.libraryId, e.spaceId, e.confirmKey, e.upload, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于查询文件删除的原因，可能是用户主动删除或者 quota 超限删除。 要求权限：admin 或 space_admin 
   * @summary 查询文件删除原因
   * @param {FileApiCheckFileDeletionRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  checkFileDeletion(e, t) {
    return Z(this.configuration).checkFileDeletion(e.libraryId, e.spaceId, e.inode, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于检查文件状态
   * @summary 检查文件状态
   * @param {FileApiCheckFileStatusRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  checkFileStatus(e, t) {
    return Z(this.configuration).checkFileStatus(e.libraryId, e.spaceId, e.filePath, e.historyId, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于完成上传文件。 要求权限：admin、space_admin、upload_file、upload_file_force 或 confirm_upload。 在文件上传完成后，请务必及时调用该接口，否则文件将不能被正确存储；如果调用该接口时实际并未完成文件上传，将返回错误信息。 
   * @summary 完成上传文件
   * @param {FileApiCompleteFileUploadRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  completeFileUpload(e, t) {
    return Z(this.configuration).completeFileUpload(e.libraryId, e.spaceId, e.confirmKey, e.confirm, e.conflictResolutionStrategy, e.contentCas, e.accessToken, e.librarySecret, e.userId, e.withInode, e.withContentCas, e.completeFileUploadRequest, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于转换文档格式，当前仅支持 doc/docx 转 pdf。 要求权限： 非 acl 鉴权：admin、space_admin acl 鉴权：canDownload（当前文件夹可下载）& canUpload（目标文件夹可上传） 非 acl 鉴权是指当前用户对所有文件的操作权限，详情可参考生成访问令牌接口； acl 鉴权是通过共享授权接口给指定用户，以文件夹为单位授予的权限，详情可参考角色授权模块； 该接口的源和目标均需要指定完整的文件路径，源与目标可以跨越目录，来实现将文件移动到任意其他目录下的功能，且支持同时修改文件名； 不会自动创建中间所需的各级父目录，所以必须保证路径的各级目录存在。 
   * @summary 文档转码
   * @param {FileApiConvertFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  convertFile(e, t) {
    return Z(this.configuration).convertFile(e.libraryId, e.spaceId, e.filePath, e.convert, e.convertFileRequest, e.conflictResolutionStrategy, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于复制文件。 要求权限： admin、space_admin 或 copy_file/copy_file_force。 该接口的源和目标均需要指定完整的文件路径，源与目标可以跨越目录，来实现将文件复制到任意其他目录下的功能，且支持同时修改文件名； 不会自动创建中间所需的各级父目录，所以必须保证路径的各级目录存在。 
   * @summary 复制文件
   * @param {FileApiCopyFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  copyFile(e, t) {
    return Z(this.configuration).copyFile(e.libraryId, e.spaceId, e.filePath, e.copyFileRequest, e.conflictResolutionStrategy, e.contentCas, e.accessToken, e.librarySecret, e.userId, e.withContentCas, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于创建符号链接。 要求权限： 非 acl 鉴权：admin、space_admin 或 upload_file/upload_file_force/create_symlink/create_symlink_force acl 鉴权：canUpload（当前文件夹可上传） 非 acl 鉴权是指当前用户对所有文件的操作权限，详情可参考生成访问令牌接口； acl 鉴权是通过共享授权接口给指定用户，以文件夹为单位授予的权限，详情可参考角色授权模块； 符号链接本身与文件的概念一致，可以通过删除文件、重命名或移动文件、复制文件等接口删除、重命名或移动或复制符号链接本身，而不会影响符号链接所指向的文件； 与标准文件系统略有不同，符号链接所指向的文件，不会因为重命名或移动而丢失指向； 当符号链接指向的文件被覆盖上传时，该符号链接将指向新上传的文件。 
   * @summary 创建符号链接
   * @param {FileApiCreateSymlinkRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  createSymlink(e, t) {
    return Z(this.configuration).createSymlink(e.libraryId, e.spaceId, e.filePath, e.createSymlinkRequest, e.conflictResolutionStrategy, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于删除文件。 要求权限： admin、space_admin 或 delete_file（未开启回收站或 Permanent 为 0）/delete_file_permanent（开启回收站且 Permanent 为 1） 如果媒体库启用回收站功能，则该接口不会永久删除文件，而是将文件移入回收站，可通过相关接口永久删除或恢复回收站内的文件，或直接清空回收站。 
   * @summary 删除文件
   * @param {FileApiDeleteFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  deleteFile(e, t) {
    return Z(this.configuration).deleteFile(e.libraryId, e.spaceId, e.filePath, e.permanent, e.accessToken, e.librarySecret, e.userId, e.contentCas, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于下载文件。 可以直接在使用文件的参数中指定该 URL，例如对于图片文件可直接在小程序 <image> 标签、 HTML <img> 标签或小程序 wx.previewImage 接口等中使用，该接口将自动 302 跳转到真实的图片 URL；视频和文件同理； 
   * @summary 下载文件
   * @param {FileApiDownloadFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  downloadFile(e, t) {
    return Z(this.configuration).downloadFile(e.libraryId, e.spaceId, e.filePath, e.historyId, e.contentDisposition, e.purpose, e.accessToken, e.librarySecret, e.userId, e.trafficLimit, e.contentCas, e.withContentCas, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 下载视频转码接口转码后的文件，扩展下载文件接口。 权限说明：同下载文件接口。 补充说明： - 若 m3u8 转封装未完成，则返回 FileConverting - 若转码未完成，则返回原始视频的下载链接 
   * @summary 视频下载
   * @param {FileApiDownloadTranscodedVideoRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  downloadTranscodedVideo(e, t) {
    return Z(this.configuration).downloadTranscodedVideo(e.libraryId, e.spaceId, e.filePath, e.transcodingTemplateId, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于开始表单上传文件（multipart/form-data）。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 调用该接口将返回一系列用于 form 表单上传（multipart/form-data 格式）和确认上传完成的参数，上传的目标 URL 为 https://{Domain}/，其中 Domain 为响应体中的 domain 字段，例如 https://examplebucket-1250000000.cos.ap-beijing.myqcloud.com/； form 表单上传时还需要指定一系列额外的信息字段，这些字段的名和值包含在响应体中的 form 字段中，可以在 HTML form 表单中通过隐藏域或通过 JS 相关库、小程序 wx.uploadFile 等指定这些字段； form 表单中的文件字段，其表单字段名固定为 file，且必须作为表单中的最后一项； 在完成实际上传后，上传的目标 URL 将返回 HTTP 204 No Content，由于可能的跨域限制，建议直接通过相关接口的回调来判断是否上传完成，并且在上传完成后及时调用完成上传文件接口，确认上传结果； 默认情况下同名文件将自动修改文件名，可在完成上传文件接口中获取最终的文件路径； 不会自动创建所需的各级父目录，所以必须保证路径的各级目录存在。 
   * @summary 开始表单上传文件
   * @param {FileApiFormUploadFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  formUploadFile(e, t) {
    return Z(this.configuration).formUploadFile(e.libraryId, e.spaceId, e.filePath, e.conflictResolutionStrategy, e.contentCas, e.filesize, e.accessToken, e.librarySecret, e.userId, e.xSmhMeta, e.trafficLimit, e.preferSameOrigin, e.withContentCas, e.formUploadFileRequest, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于获取照片/视频封面缩略图。 视频封面使用该视频的首帧图片； 针对照片或视频封面，优先使用人脸识别智能缩放裁剪为 {Size}px × {Size}px 大小，如果未识别到人脸则居中缩放裁剪为 {Size}px × {Size}px 大小，如果未指定 {Size} 参数则使用照片或视频封面原图，最后 302 跳转到对应的图片的 URL； 可以直接在使用图片的参数中指定该 URL，例如小程序 <image> 标签、 HTML <img> 标签或小程序 wx.previewImage 接口等，该接口将自动 302 跳转到真实的图片 URL； 如果文件不属于可预览的媒体类型，则会跳转至文件的下载链接。 
   * @summary 获取照片/视频封面缩略图
   * @param {FileApiGetCoverRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  getCover(e, t) {
    return Z(this.configuration).getCover(e.libraryId, e.spaceId, e.filePath, e.preview, e.size, e.scale, e.widthSize, e.heightSize, e.frameNumber, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 根据文件 ID 查询文件信息
   * @summary 根据文件ID查询文件信息
   * @param {FileApiGetFileInfoByInodeRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  getFileInfoByInode(e, t) {
    return Z(this.configuration).getFileInfoByInode(e.libraryId, e.spaceId, e.inode, e.accessToken, e.librarySecret, e.withContentCas, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于获取文件上传任务状态。 要求权限： admin、space_admin、upload_file、upload_file_force、begin_upload 或 begin_upload_force（注意：虽然本接口为读接口，但因为读取的是上传任务信息，故仍需上传文件的相关权限） 
   * @summary 获取文件上传任务状态
   * @param {FileApiGetFileUploadRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  getFileUpload(e, t) {
    return Z(this.configuration).getFileUpload(e.libraryId, e.spaceId, e.confirmKey, e.upload, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于获取文件下载链接和信息。 要求权限：无 
   * @summary 获取文件下载链接和信息
   * @param {FileApiInfoFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  infoFile(e, t) {
    return Z(this.configuration).infoFile(e.libraryId, e.spaceId, e.filePath, e.info, e.historyId, e.contentDisposition, e.purpose, e.accessToken, e.librarySecret, e.userId, e.trafficLimit, e.preCheck, e.contentCas, e.withContentCas, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于重命名或移动文件。 要求权限： admin、space_admin 或 move_file/move_file_force。 该接口的源和目标均需要指定完整的文件路径，源与目标可以跨越目录，来实现将文件移动到任意其他目录下的功能，且支持同时修改文件名； 不会自动创建中间所需的各级父目录，所以必须保证路径的各级目录存在。 
   * @summary 重命名或移动文件
   * @param {FileApiMoveFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  moveFile(e, t) {
    return Z(this.configuration).moveFile(e.libraryId, e.spaceId, e.filePath, e.moveFileRequest, e.conflictResolutionStrategy, e.contentCas, e.accessToken, e.librarySecret, e.userId, e.withContentCas, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于开始分块上传文件。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 分块上传指使用通过 HTTP PUT 请求上传一个文件的分块，通过多次上传完成整个文件的上传，每次请求的请求体为文件内容的单个分块； 调用该接口将返回一系列用于分块上传请求和确认上传完成的参数，上传的目标 URL 为 https://{Domain}{Path}?uploadId={UploadId}&partNumber={PartNumber}，其中 Domain 为响应体中的 domain 字段，Path 为响应体中的 path 字段，UploadId 为响应体中的 uploadId 字段，PartNumber 为从 1 开始的分块顺序，例如 https://examplebucket-1250000000.cos.ap-beijing.myqcloud.com/smhxxx/xxx.mp4?uploadId=xxx&partNumber=1； 上传每个分块时还需要指定一系列额外的请求头部字段，这些字段的名和值包含在响应体中的 headers 字段中； 当在浏览器使用 JS 上传文件时，需要提前在绑定的 COS 存储桶中设置跨域访问 CORS 设置； 在完成实际上传后，上传的目标 URL 将返回 HTTP 200 OK； 与对象存储 COS 的分块上传不同，SMH 的分块上传无需记录 ETag，也无需在完成上传时传入这些 ETag，只需保证上传分块的连续即可，SMH 将在完成上传时自动执行这些操作； 默认情况下同名文件将自动修改文件名，可在完成上传文件接口中获取最终的文件路径； 不会自动创建所需的各级父目录，所以必须保证路径的各级目录存在。 
   * @summary 开始分块上传文件
   * @param {FileApiMultipartUploadFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  multipartUploadFile(e, t) {
    return Z(this.configuration).multipartUploadFile(e.libraryId, e.spaceId, e.filePath, e.multipart, e.conflictResolutionStrategy, e.contentCas, e.filesize, e.accessToken, e.librarySecret, e.userId, e.xSmhMeta, e.trafficLimit, e.preferSameOrigin, e.withContentCas, e.multipartUploadFileRequest, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于获取 HTML 格式文档预览。 返回HTML或JPG格式的文档用于预览； 如果文件不属于可预览的文档类型，则会跳转至文件的下载链接。 
   * @summary 获取 HTML 格式文档预览
   * @param {FileApiPreviewFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  previewFile(e, t) {
    return Z(this.configuration).previewFile(e.libraryId, e.spaceId, e.filePath, e.preview, e.historyId, e.type, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于分块上传任务续期。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 仅支持分块上传任务的续期。 
   * @summary 分块上传任务续期
   * @param {FileApiRenewMultipartUploadRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  renewMultipartUpload(e, t) {
    return Z(this.configuration).renewMultipartUpload(e.libraryId, e.spaceId, e.confirmKey, e.renew, e.accessToken, e.librarySecret, e.userId, e.trafficLimit, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于开始简单上传文件。 要求权限：admin、space_admin 或 upload_file/upload_file_force/begin_upload/begin_upload_force。 PUT 简单上传指使用 HTTP PUT 请求上传一个文件，请求体即为文件的内容； 调用该接口将返回一系列用于 PUT 简单上传请求和确认上传完成的参数，上传的目标 URL 为 https://{Domain}{Path}，其中 Domain 为响应体中的 domain 字段，Path 为响应体中的 path 字段，例如 https://examplebucket-1250000000.cos.ap-beijing.myqcloud.com/smhxxx/xxx.mp4； PUT 简单上传时还需要指定一系列额外的请求头部字段，这些字段的名和值包含在响应体中的 headers 字段中； 当在浏览器使用 JS 上传文件时，需要提前在绑定的 COS 存储桶中设置跨域访问 CORS 设置； 在完成实际上传后，上传的目标 URL 将返回 HTTP 200 OK； 默认情况下同名文件将自动修改文件名，可在完成上传文件接口中获取最终的文件路径； 不会自动创建所需的各级父目录，所以必须保证路径的各级目录存在。 
   * @summary 开始简单上传文件
   * @param {FileApiSimpleUploadFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  simpleUploadFile(e, t) {
    return Z(this.configuration).simpleUploadFile(e.libraryId, e.spaceId, e.filePath, e.conflictResolutionStrategy, e.contentCas, e.filesize, e.accessToken, e.librarySecret, e.userId, e.xSmhMeta, e.trafficLimit, e.preferSameOrigin, e.withContentCas, e.simpleUploadFileRequest, t).then((a) => a(this.axios, this.basePath));
  }
}, On = function(e) {
  return {
    /**
     * 用于删除特定历史版本。权限要求：delete_history权限、admin权限或space_admin权限
     * @summary 删除历史版本
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {Array<string>} requestBody 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteHistory: async (t, a, i, r, s, o = {}) => {
      I("deleteHistory", "libraryId", t), I("deleteHistory", "spaceId", a), I("deleteHistory", "requestBody", i);
      const n = "/api/v1/directory-history/{LibraryId}/{SpaceId}/delete".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "POST", ...c, ...o }, d = {}, h = {};
      r !== void 0 && (h.access_token = r), s !== void 0 && (h.library_secret = s), d["Content-Type"] = "application/json", U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, l.data = $(i, l, e), {
        url: k(p),
        options: l
      };
    },
    /**
     * 用于清空整个library的历史版本，请求此接口时，需要先关闭历史版本。注意：此接口会清空整个library全部文件的历史版本，相应的空间会释放，不可找回数据，请谨慎操作！此接口有频控限制，每分钟最多调用1次，请勿频繁调用。权限要求：admin权限
     * @summary 清空历史版本
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    emptyHistory: async (t, a, i, r = {}) => {
      I("emptyHistory", "libraryId", t);
      const s = "/api/v1/directory-history/{LibraryId}/library-history".replace("{LibraryId}", encodeURIComponent(String(t))), o = new URL(s, O);
      let n;
      e && (n = e.baseOptions);
      const p = { method: "DELETE", ...n, ...r }, c = {}, l = {};
      a !== void 0 && (l.access_token = a), i !== void 0 && (l.library_secret = i), U(o, l);
      let d = n && n.headers ? n.headers : {};
      return p.headers = { ...c, ...d, ...r.headers }, {
        url: k(o),
        options: p
      };
    },
    /**
     * 用于查询历史版本配置信息。权限要求：admin权限
     * @summary 查询历史版本配置信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getHistoryConfig: async (t, a, i, r = {}) => {
      I("getHistoryConfig", "libraryId", t);
      const s = "/api/v1/directory-history/{LibraryId}/library-history".replace("{LibraryId}", encodeURIComponent(String(t))), o = new URL(s, O);
      let n;
      e && (n = e.baseOptions);
      const p = { method: "GET", ...n, ...r }, c = {}, l = {};
      a !== void 0 && (l.access_token = a), i !== void 0 && (l.library_secret = i), U(o, l);
      let d = n && n.headers ? n.headers : {};
      return p.headers = { ...c, ...d, ...r.headers }, {
        url: k(o),
        options: p
      };
    },
    /**
     * 用于查看历史版本列表。
     * @summary 查看历史版本列表
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径，对于多级目录，使用斜杠(/)分隔，例如 foo/bar.txt
     * @param {string} [marker] 用于顺序列出分页的标识
     * @param {number} [limit] 用于顺序列出分页时本地列出的项目数限制，默认为 20；若不指定任何翻页参数，默认采用（marker，limit）参数翻页；若与（page，page_size）参数同时使用，默认采用（page，page_size）参数翻页
     * @param {number} [page] 分页码，默认第一页
     * @param {number} [pageSize] 分页大小，默认 20；若与（marker，limit）参数同时使用，默认采用（page，page_size）参数翻页
     * @param {ListHistoryOrderByEnum} [orderBy] 排序字段，按文件 id 排序为 id，按创建时间排序为 creationTime，默认为 id，最新版本排序始终在首位
     * @param {ListHistoryOrderByTypeEnum} [orderByType] 排序方式，升序为 asc，降序为 desc，默认为 desc
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listHistory: async (t, a, i, r, s, o, n, p, c, l, d, h = {}) => {
      I("listHistory", "libraryId", t), I("listHistory", "spaceId", a), I("listHistory", "filePath", i);
      const u = "/api/v1/directory-history/{LibraryId}/{SpaceId}/history-list/{FilePath}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), y = new URL(u, O);
      let f;
      e && (f = e.baseOptions);
      const A = { method: "GET", ...f, ...h }, m = {}, F = {};
      r !== void 0 && (F.marker = r), s !== void 0 && (F.limit = s), o !== void 0 && (F.page = o), n !== void 0 && (F.page_size = n), p !== void 0 && (F.order_by = p), c !== void 0 && (F.order_by_type = c), l !== void 0 && (F.access_token = l), d !== void 0 && (F.library_secret = d), U(y, F);
      let v = f && f.headers ? f.headers : {};
      return A.headers = { ...m, ...v, ...h.headers }, {
        url: k(y),
        options: A
      };
    },
    /**
     * 用于设置历史版本配置信息。权限要求：admin权限。多次调用接口会覆盖之前设置，以最后一次调用为准。更新时，可以设置部分字段；未传入字段，其值保持不变。配置设置生效可能有 1 分钟左右延迟。
     * @summary 设置历史版本配置信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {SetHistoryConfigRequest} setHistoryConfigRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setHistoryConfig: async (t, a, i, r, s = {}) => {
      I("setHistoryConfig", "libraryId", t), I("setHistoryConfig", "setHistoryConfigRequest", a);
      const o = "/api/v1/directory-history/{LibraryId}/library-history".replace("{LibraryId}", encodeURIComponent(String(t))), n = new URL(o, O);
      let p;
      e && (p = e.baseOptions);
      const c = { method: "POST", ...p, ...s }, l = {}, d = {};
      i !== void 0 && (d.access_token = i), r !== void 0 && (d.library_secret = r), l["Content-Type"] = "application/json", U(n, d);
      let h = p && p.headers ? p.headers : {};
      return c.headers = { ...l, ...h, ...s.headers }, c.data = $(a, c, e), {
        url: k(n),
        options: c
      };
    },
    /**
     * 用于设置历史版本为最新版本。权限要求：admin权限、space_admin权限或set_history_latest权限
     * @summary 设置历史版本为最新版本
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} historyId 历史版本 ID
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setHistoryLatest: async (t, a, i, r, s, o = {}) => {
      I("setHistoryLatest", "libraryId", t), I("setHistoryLatest", "spaceId", a), I("setHistoryLatest", "historyId", i);
      const n = "/api/v1/directory-history/{LibraryId}/{SpaceId}/latest-version/{HistoryId}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{HistoryId}", encodeURIComponent(String(i))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "POST", ...c, ...o }, d = {}, h = {};
      r !== void 0 && (h.access_token = r), s !== void 0 && (h.library_secret = s), U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, {
        url: k(p),
        options: l
      };
    }
  };
}, Xe = function(e) {
  const t = On(e);
  return {
    /**
     * 用于删除特定历史版本。权限要求：delete_history权限、admin权限或space_admin权限
     * @summary 删除历史版本
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {Array<string>} requestBody 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteHistory(a, i, r, s, o, n) {
      var d, h;
      const p = await t.deleteHistory(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["HistoryApi.deleteHistory"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    },
    /**
     * 用于清空整个library的历史版本，请求此接口时，需要先关闭历史版本。注意：此接口会清空整个library全部文件的历史版本，相应的空间会释放，不可找回数据，请谨慎操作！此接口有频控限制，每分钟最多调用1次，请勿频繁调用。权限要求：admin权限
     * @summary 清空历史版本
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async emptyHistory(a, i, r, s) {
      var c, l;
      const o = await t.emptyHistory(a, i, r, s), n = (e == null ? void 0 : e.serverIndex) ?? 0, p = (l = (c = D["HistoryApi.emptyHistory"]) == null ? void 0 : c[n]) == null ? void 0 : l.url;
      return (d, h) => T(o, R, x, e)(d, p || h);
    },
    /**
     * 用于查询历史版本配置信息。权限要求：admin权限
     * @summary 查询历史版本配置信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getHistoryConfig(a, i, r, s) {
      var c, l;
      const o = await t.getHistoryConfig(a, i, r, s), n = (e == null ? void 0 : e.serverIndex) ?? 0, p = (l = (c = D["HistoryApi.getHistoryConfig"]) == null ? void 0 : c[n]) == null ? void 0 : l.url;
      return (d, h) => T(o, R, x, e)(d, p || h);
    },
    /**
     * 用于查看历史版本列表。
     * @summary 查看历史版本列表
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径，对于多级目录，使用斜杠(/)分隔，例如 foo/bar.txt
     * @param {string} [marker] 用于顺序列出分页的标识
     * @param {number} [limit] 用于顺序列出分页时本地列出的项目数限制，默认为 20；若不指定任何翻页参数，默认采用（marker，limit）参数翻页；若与（page，page_size）参数同时使用，默认采用（page，page_size）参数翻页
     * @param {number} [page] 分页码，默认第一页
     * @param {number} [pageSize] 分页大小，默认 20；若与（marker，limit）参数同时使用，默认采用（page，page_size）参数翻页
     * @param {ListHistoryOrderByEnum} [orderBy] 排序字段，按文件 id 排序为 id，按创建时间排序为 creationTime，默认为 id，最新版本排序始终在首位
     * @param {ListHistoryOrderByTypeEnum} [orderByType] 排序方式，升序为 asc，降序为 desc，默认为 desc
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listHistory(a, i, r, s, o, n, p, c, l, d, h, u) {
      var m, F;
      const y = await t.listHistory(a, i, r, s, o, n, p, c, l, d, h, u), f = (e == null ? void 0 : e.serverIndex) ?? 0, A = (F = (m = D["HistoryApi.listHistory"]) == null ? void 0 : m[f]) == null ? void 0 : F.url;
      return (v, C) => T(y, R, x, e)(v, A || C);
    },
    /**
     * 用于设置历史版本配置信息。权限要求：admin权限。多次调用接口会覆盖之前设置，以最后一次调用为准。更新时，可以设置部分字段；未传入字段，其值保持不变。配置设置生效可能有 1 分钟左右延迟。
     * @summary 设置历史版本配置信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {SetHistoryConfigRequest} setHistoryConfigRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setHistoryConfig(a, i, r, s, o) {
      var l, d;
      const n = await t.setHistoryConfig(a, i, r, s, o), p = (e == null ? void 0 : e.serverIndex) ?? 0, c = (d = (l = D["HistoryApi.setHistoryConfig"]) == null ? void 0 : l[p]) == null ? void 0 : d.url;
      return (h, u) => T(n, R, x, e)(h, c || u);
    },
    /**
     * 用于设置历史版本为最新版本。权限要求：admin权限、space_admin权限或set_history_latest权限
     * @summary 设置历史版本为最新版本
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} historyId 历史版本 ID
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setHistoryLatest(a, i, r, s, o, n) {
      var d, h;
      const p = await t.setHistoryLatest(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["HistoryApi.setHistoryLatest"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    }
  };
}, Un = class extends he {
  /**
   * 用于删除特定历史版本。权限要求：delete_history权限、admin权限或space_admin权限
   * @summary 删除历史版本
   * @param {HistoryApiDeleteHistoryRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  deleteHistory(e, t) {
    return Xe(this.configuration).deleteHistory(e.libraryId, e.spaceId, e.requestBody, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于清空整个library的历史版本，请求此接口时，需要先关闭历史版本。注意：此接口会清空整个library全部文件的历史版本，相应的空间会释放，不可找回数据，请谨慎操作！此接口有频控限制，每分钟最多调用1次，请勿频繁调用。权限要求：admin权限
   * @summary 清空历史版本
   * @param {HistoryApiEmptyHistoryRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  emptyHistory(e, t) {
    return Xe(this.configuration).emptyHistory(e.libraryId, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于查询历史版本配置信息。权限要求：admin权限
   * @summary 查询历史版本配置信息
   * @param {HistoryApiGetHistoryConfigRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  getHistoryConfig(e, t) {
    return Xe(this.configuration).getHistoryConfig(e.libraryId, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于查看历史版本列表。
   * @summary 查看历史版本列表
   * @param {HistoryApiListHistoryRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  listHistory(e, t) {
    return Xe(this.configuration).listHistory(e.libraryId, e.spaceId, e.filePath, e.marker, e.limit, e.page, e.pageSize, e.orderBy, e.orderByType, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于设置历史版本配置信息。权限要求：admin权限。多次调用接口会覆盖之前设置，以最后一次调用为准。更新时，可以设置部分字段；未传入字段，其值保持不变。配置设置生效可能有 1 分钟左右延迟。
   * @summary 设置历史版本配置信息
   * @param {HistoryApiSetHistoryConfigRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  setHistoryConfig(e, t) {
    return Xe(this.configuration).setHistoryConfig(e.libraryId, e.setHistoryConfigRequest, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于设置历史版本为最新版本。权限要求：admin权限、space_admin权限或set_history_latest权限
   * @summary 设置历史版本为最新版本
   * @param {HistoryApiSetHistoryLatestRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  setHistoryLatest(e, t) {
    return Xe(this.configuration).setHistoryLatest(e.libraryId, e.spaceId, e.historyId, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
}, kn = function(e) {
  return {
    /**
     * 用于确认 m3u8 上传完成。 接口说明： 将 segments 分成多个批次完成，比如每批100个 ts（有密钥时长度放宽到101个） 先完成 segments，确保所有 ts 和密钥文件都完成后，再完成 playlist 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口 
     * @summary m3u8 上传完成(确认)
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} confirmKey 为m3u8 上传准备接口响应体中的 confirmKey
     * @param {ConfirmM3u8UploadConfirmEnum} confirm 确认上传，固定值为 1
     * @param {ConfirmM3u8UploadRequest} confirmM3u8UploadRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    confirmM3u8Upload: async (t, a, i, r, s, o, n, p = {}) => {
      I("confirmM3u8Upload", "libraryId", t), I("confirmM3u8Upload", "spaceId", a), I("confirmM3u8Upload", "confirmKey", i), I("confirmM3u8Upload", "confirm", r), I("confirmM3u8Upload", "confirmM3u8UploadRequest", s);
      const c = "/api/v1/hls/{LibraryId}/{SpaceId}/{ConfirmKey}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{ConfirmKey}", encodeURIComponent(String(i))), l = new URL(c, O);
      let d;
      e && (d = e.baseOptions);
      const h = { method: "POST", ...d, ...p }, u = {}, y = {};
      r !== void 0 && (y.confirm = r), o !== void 0 && (y.access_token = o), n !== void 0 && (y.library_secret = n), u["Content-Type"] = "application/json", U(l, y);
      let f = d && d.headers ? d.headers : {};
      return h.headers = { ...u, ...f, ...p.headers }, h.data = $(s, h, e), {
        url: k(l),
        options: h
      };
    },
    /**
     * 将指定视频转码到模版指定的规格（帧率、码率、分辨率）。 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口 
     * @summary 视频转码
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {CreateTranscodeTaskTranscodeEnum} transcode 是否转码，固定值为 1
     * @param {CreateTranscodeTaskRequest} createTranscodeTaskRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createTranscodeTask: async (t, a, i, r, s, o, n, p = {}) => {
      I("createTranscodeTask", "libraryId", t), I("createTranscodeTask", "spaceId", a), I("createTranscodeTask", "filePath", i), I("createTranscodeTask", "transcode", r), I("createTranscodeTask", "createTranscodeTaskRequest", s);
      const c = "/api/v1/hls/{LibraryId}/{SpaceId}/{FilePath}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), l = new URL(c, O);
      let d;
      e && (d = e.baseOptions);
      const h = { method: "POST", ...d, ...p }, u = {}, y = {};
      r !== void 0 && (y.transcode = r), o !== void 0 && (y.access_token = o), n !== void 0 && (y.library_secret = n), u["Content-Type"] = "application/json", U(l, y);
      let f = d && d.headers ? d.headers : {};
      return h.headers = { ...u, ...f, ...p.headers }, h.data = $(s, h, e), {
        url: k(l),
        options: h
      };
    },
    /**
     * 用于查询媒体文件的元信息，包括视频高度、宽度、比特率、时长以及允许使用的转码模板列表
     * @summary 查询媒体文件的元信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {GetMediaFileInfoInfoEnum} info 是否查询元信息，固定值为 1
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getMediaFileInfo: async (t, a, i, r, s, o, n, p = {}) => {
      I("getMediaFileInfo", "libraryId", t), I("getMediaFileInfo", "spaceId", a), I("getMediaFileInfo", "filePath", i), I("getMediaFileInfo", "info", r);
      const c = "/api/v1/hls/{LibraryId}/{SpaceId}/{FilePath}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), l = new URL(c, O);
      let d;
      e && (d = e.baseOptions);
      const h = { method: "GET", ...d, ...p }, u = {}, y = {};
      r !== void 0 && (y.info = r), s !== void 0 && (y.access_token = s), o !== void 0 && (y.library_secret = o), n !== void 0 && (y.user_id = n), U(l, y);
      let f = d && d.headers ? d.headers : {};
      return h.headers = { ...u, ...f, ...p.headers }, {
        url: k(l),
        options: h
      };
    },
    /**
     * 可以直接在视频播放器中指定该 URL，该接口将自动 302 跳转到真实的 m3u8 播放列表 URL。 此接口仅支持将其他格式的源文件转码为 HLS 格式目标文件进行播放，不支持以 HLS 格式作为源文件。 此接口暂不支持播放符号链接文件和文件的历史版本。 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口 
     * @summary 发起实时转码任务并获取带授权信息的播放列表
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {LiveTranscodeMediaFileLiveTranscodeEnum} liveTranscode 是否发起实时转码，固定值为 1
     * @param {LiveTranscodeMediaFileTranscodingTemplateIdEnum} transcodingTemplateId 转码模板ID，可支持的模板列表为： - h264_360p（流畅） - h264_480p（低清） - h264_720p（高清） - h264_1080p（超清） - h264_2K - h264_4K 注意：不允许输入比原视频分辨率更大的转码模板 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    liveTranscodeMediaFile: async (t, a, i, r, s, o, n, p, c = {}) => {
      I("liveTranscodeMediaFile", "libraryId", t), I("liveTranscodeMediaFile", "spaceId", a), I("liveTranscodeMediaFile", "filePath", i), I("liveTranscodeMediaFile", "liveTranscode", r), I("liveTranscodeMediaFile", "transcodingTemplateId", s);
      const l = "/api/v1/hls/{LibraryId}/{SpaceId}/{FilePath}#1".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), d = new URL(l, O);
      let h;
      e && (h = e.baseOptions);
      const u = { method: "GET", ...h, ...c }, y = {}, f = {};
      r !== void 0 && (f.live_transcode = r), s !== void 0 && (f.transcoding_template_id = s), o !== void 0 && (f.access_token = o), n !== void 0 && (f.library_secret = n), p !== void 0 && (f.user_id = p), U(d, f);
      let A = h && h.headers ? h.headers : {};
      return u.headers = { ...y, ...A, ...c.headers }, {
        url: k(d),
        options: u
      };
    },
    /**
     * 用于重传或追加 m3u8 分片文件。 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口
     * @summary m3u8 分片重传与追加
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} confirmKey 为m3u8 上传准备接口响应体中的 confirmKey
     * @param {ModifyM3u8SegmentsModifyEnum} modify 是否修改，固定值为 1
     * @param {ModifyM3u8SegmentsRequest} modifyM3u8SegmentsRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {number} [trafficLimit] 单连接上传限速，范围 100KB/s-100MB/s，单位 Byte
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    modifyM3u8Segments: async (t, a, i, r, s, o, n, p, c = {}) => {
      I("modifyM3u8Segments", "libraryId", t), I("modifyM3u8Segments", "spaceId", a), I("modifyM3u8Segments", "confirmKey", i), I("modifyM3u8Segments", "modify", r), I("modifyM3u8Segments", "modifyM3u8SegmentsRequest", s);
      const l = "/api/v1/hls/{LibraryId}/{SpaceId}/{ConfirmKey}#2".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{ConfirmKey}", encodeURIComponent(String(i))), d = new URL(l, O);
      let h;
      e && (h = e.baseOptions);
      const u = { method: "POST", ...h, ...c }, y = {}, f = {};
      r !== void 0 && (f.modify = r), o !== void 0 && (f.access_token = o), n !== void 0 && (f.library_secret = n), p !== void 0 && (f.traffic_limit = p), y["Content-Type"] = "application/json", U(d, f);
      let A = h && h.headers ? h.headers : {};
      return u.headers = { ...y, ...A, ...c.headers }, u.data = $(s, u, e), {
        url: k(d),
        options: u
      };
    },
    /**
     * 用于准备 m3u8 播放列表及其分片文件的上传。 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口 
     * @summary m3u8 上传准备
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {PrepareM3u8UploadRequest} prepareM3u8UploadRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数，获取请参见 生成访问令牌
     * @param {PrepareM3u8UploadConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式, 取值如下： ask：默认值, 冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码 rename：冲突时自动重命名文件 overwrite：如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件 
     * @param {number} [trafficLimit] 单连接上传限速，范围 100KB/s-100MB/s，单位 Byte
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    prepareM3u8Upload: async (t, a, i, r, s, o, n, p = {}) => {
      I("prepareM3u8Upload", "libraryId", t), I("prepareM3u8Upload", "spaceId", a), I("prepareM3u8Upload", "filePath", i), I("prepareM3u8Upload", "prepareM3u8UploadRequest", r);
      const c = "/api/v1/hls/{LibraryId}/{SpaceId}/{FilePath}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{FilePath}", encodeURIComponent(String(i))), l = new URL(c, O);
      let d;
      e && (d = e.baseOptions);
      const h = { method: "PUT", ...d, ...p }, u = {}, y = {};
      s !== void 0 && (y.access_token = s), o !== void 0 && (y.conflict_resolution_strategy = o), n !== void 0 && (y.traffic_limit = n), u["Content-Type"] = "application/json", U(l, y);
      let f = d && d.headers ? d.headers : {};
      return h.headers = { ...u, ...f, ...p.headers }, h.data = $(r, h, e), {
        url: k(l),
        options: h
      };
    },
    /**
     * 可选接口，用于对 m3u8 上传任务进行续期，刷新上传信息的有效期。 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口
     * @summary m3u8 上传续期
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} confirmKey 为m3u8 上传准备接口响应体中的 confirmKey
     * @param {RenewM3u8UploadRenewEnum} renew 是否续期，固定值为 1
     * @param {RenewM3u8UploadRequest} renewM3u8UploadRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {number} [trafficLimit] 单连接上传限速，范围 100KB/s-100MB/s，单位 Byte
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    renewM3u8Upload: async (t, a, i, r, s, o, n, p, c = {}) => {
      I("renewM3u8Upload", "libraryId", t), I("renewM3u8Upload", "spaceId", a), I("renewM3u8Upload", "confirmKey", i), I("renewM3u8Upload", "renew", r), I("renewM3u8Upload", "renewM3u8UploadRequest", s);
      const l = "/api/v1/hls/{LibraryId}/{SpaceId}/{ConfirmKey}#1".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{ConfirmKey}", encodeURIComponent(String(i))), d = new URL(l, O);
      let h;
      e && (h = e.baseOptions);
      const u = { method: "POST", ...h, ...c }, y = {}, f = {};
      r !== void 0 && (f.renew = r), o !== void 0 && (f.access_token = o), n !== void 0 && (f.library_secret = n), p !== void 0 && (f.traffic_limit = p), y["Content-Type"] = "application/json", U(d, f);
      let A = h && h.headers ? h.headers : {};
      return u.headers = { ...y, ...A, ...c.headers }, u.data = $(s, u, e), {
        url: k(d),
        options: u
      };
    }
  };
}, Le = function(e) {
  const t = kn(e);
  return {
    /**
     * 用于确认 m3u8 上传完成。 接口说明： 将 segments 分成多个批次完成，比如每批100个 ts（有密钥时长度放宽到101个） 先完成 segments，确保所有 ts 和密钥文件都完成后，再完成 playlist 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口 
     * @summary m3u8 上传完成(确认)
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} confirmKey 为m3u8 上传准备接口响应体中的 confirmKey
     * @param {ConfirmM3u8UploadConfirmEnum} confirm 确认上传，固定值为 1
     * @param {ConfirmM3u8UploadRequest} confirmM3u8UploadRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async confirmM3u8Upload(a, i, r, s, o, n, p, c) {
      var u, y;
      const l = await t.confirmM3u8Upload(a, i, r, s, o, n, p, c), d = (e == null ? void 0 : e.serverIndex) ?? 0, h = (y = (u = D["HlsApi.confirmM3u8Upload"]) == null ? void 0 : u[d]) == null ? void 0 : y.url;
      return (f, A) => T(l, R, x, e)(f, h || A);
    },
    /**
     * 将指定视频转码到模版指定的规格（帧率、码率、分辨率）。 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口 
     * @summary 视频转码
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {CreateTranscodeTaskTranscodeEnum} transcode 是否转码，固定值为 1
     * @param {CreateTranscodeTaskRequest} createTranscodeTaskRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createTranscodeTask(a, i, r, s, o, n, p, c) {
      var u, y;
      const l = await t.createTranscodeTask(a, i, r, s, o, n, p, c), d = (e == null ? void 0 : e.serverIndex) ?? 0, h = (y = (u = D["HlsApi.createTranscodeTask"]) == null ? void 0 : u[d]) == null ? void 0 : y.url;
      return (f, A) => T(l, R, x, e)(f, h || A);
    },
    /**
     * 用于查询媒体文件的元信息，包括视频高度、宽度、比特率、时长以及允许使用的转码模板列表
     * @summary 查询媒体文件的元信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {GetMediaFileInfoInfoEnum} info 是否查询元信息，固定值为 1
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getMediaFileInfo(a, i, r, s, o, n, p, c) {
      var u, y;
      const l = await t.getMediaFileInfo(a, i, r, s, o, n, p, c), d = (e == null ? void 0 : e.serverIndex) ?? 0, h = (y = (u = D["HlsApi.getMediaFileInfo"]) == null ? void 0 : u[d]) == null ? void 0 : y.url;
      return (f, A) => T(l, R, x, e)(f, h || A);
    },
    /**
     * 可以直接在视频播放器中指定该 URL，该接口将自动 302 跳转到真实的 m3u8 播放列表 URL。 此接口仅支持将其他格式的源文件转码为 HLS 格式目标文件进行播放，不支持以 HLS 格式作为源文件。 此接口暂不支持播放符号链接文件和文件的历史版本。 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口 
     * @summary 发起实时转码任务并获取带授权信息的播放列表
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {LiveTranscodeMediaFileLiveTranscodeEnum} liveTranscode 是否发起实时转码，固定值为 1
     * @param {LiveTranscodeMediaFileTranscodingTemplateIdEnum} transcodingTemplateId 转码模板ID，可支持的模板列表为： - h264_360p（流畅） - h264_480p（低清） - h264_720p（高清） - h264_1080p（超清） - h264_2K - h264_4K 注意：不允许输入比原视频分辨率更大的转码模板 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async liveTranscodeMediaFile(a, i, r, s, o, n, p, c, l) {
      var y, f;
      const d = await t.liveTranscodeMediaFile(a, i, r, s, o, n, p, c, l), h = (e == null ? void 0 : e.serverIndex) ?? 0, u = (f = (y = D["HlsApi.liveTranscodeMediaFile"]) == null ? void 0 : y[h]) == null ? void 0 : f.url;
      return (A, m) => T(d, R, x, e)(A, u || m);
    },
    /**
     * 用于重传或追加 m3u8 分片文件。 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口
     * @summary m3u8 分片重传与追加
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} confirmKey 为m3u8 上传准备接口响应体中的 confirmKey
     * @param {ModifyM3u8SegmentsModifyEnum} modify 是否修改，固定值为 1
     * @param {ModifyM3u8SegmentsRequest} modifyM3u8SegmentsRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {number} [trafficLimit] 单连接上传限速，范围 100KB/s-100MB/s，单位 Byte
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async modifyM3u8Segments(a, i, r, s, o, n, p, c, l) {
      var y, f;
      const d = await t.modifyM3u8Segments(a, i, r, s, o, n, p, c, l), h = (e == null ? void 0 : e.serverIndex) ?? 0, u = (f = (y = D["HlsApi.modifyM3u8Segments"]) == null ? void 0 : y[h]) == null ? void 0 : f.url;
      return (A, m) => T(d, R, x, e)(A, u || m);
    },
    /**
     * 用于准备 m3u8 播放列表及其分片文件的上传。 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口 
     * @summary m3u8 上传准备
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} filePath 文件路径｜目录路径，对于多级文件路径，使用斜杠(/)分隔，例如 foo/bar/file.txt；对于根目录，该参数留空
     * @param {PrepareM3u8UploadRequest} prepareM3u8UploadRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数，获取请参见 生成访问令牌
     * @param {PrepareM3u8UploadConflictResolutionStrategyEnum} [conflictResolutionStrategy] 文件名冲突时的处理方式, 取值如下： ask：默认值, 冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码 rename：冲突时自动重命名文件 overwrite：如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件 
     * @param {number} [trafficLimit] 单连接上传限速，范围 100KB/s-100MB/s，单位 Byte
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async prepareM3u8Upload(a, i, r, s, o, n, p, c) {
      var u, y;
      const l = await t.prepareM3u8Upload(a, i, r, s, o, n, p, c), d = (e == null ? void 0 : e.serverIndex) ?? 0, h = (y = (u = D["HlsApi.prepareM3u8Upload"]) == null ? void 0 : u[d]) == null ? void 0 : y.url;
      return (f, A) => T(l, R, x, e)(f, h || A);
    },
    /**
     * 可选接口，用于对 m3u8 上传任务进行续期，刷新上传信息的有效期。 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口
     * @summary m3u8 上传续期
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} confirmKey 为m3u8 上传准备接口响应体中的 confirmKey
     * @param {RenewM3u8UploadRenewEnum} renew 是否续期，固定值为 1
     * @param {RenewM3u8UploadRequest} renewM3u8UploadRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {number} [trafficLimit] 单连接上传限速，范围 100KB/s-100MB/s，单位 Byte
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async renewM3u8Upload(a, i, r, s, o, n, p, c, l) {
      var y, f;
      const d = await t.renewM3u8Upload(a, i, r, s, o, n, p, c, l), h = (e == null ? void 0 : e.serverIndex) ?? 0, u = (f = (y = D["HlsApi.renewM3u8Upload"]) == null ? void 0 : y[h]) == null ? void 0 : f.url;
      return (A, m) => T(d, R, x, e)(A, u || m);
    }
  };
}, Tn = class extends he {
  /**
   * 用于确认 m3u8 上传完成。 接口说明： 将 segments 分成多个批次完成，比如每批100个 ts（有密钥时长度放宽到101个） 先完成 segments，确保所有 ts 和密钥文件都完成后，再完成 playlist 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口 
   * @summary m3u8 上传完成(确认)
   * @param {HlsApiConfirmM3u8UploadRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  confirmM3u8Upload(e, t) {
    return Le(this.configuration).confirmM3u8Upload(e.libraryId, e.spaceId, e.confirmKey, e.confirm, e.confirmM3u8UploadRequest, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 将指定视频转码到模版指定的规格（帧率、码率、分辨率）。 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口 
   * @summary 视频转码
   * @param {HlsApiCreateTranscodeTaskRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  createTranscodeTask(e, t) {
    return Le(this.configuration).createTranscodeTask(e.libraryId, e.spaceId, e.filePath, e.transcode, e.createTranscodeTaskRequest, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于查询媒体文件的元信息，包括视频高度、宽度、比特率、时长以及允许使用的转码模板列表
   * @summary 查询媒体文件的元信息
   * @param {HlsApiGetMediaFileInfoRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  getMediaFileInfo(e, t) {
    return Le(this.configuration).getMediaFileInfo(e.libraryId, e.spaceId, e.filePath, e.info, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 可以直接在视频播放器中指定该 URL，该接口将自动 302 跳转到真实的 m3u8 播放列表 URL。 此接口仅支持将其他格式的源文件转码为 HLS 格式目标文件进行播放，不支持以 HLS 格式作为源文件。 此接口暂不支持播放符号链接文件和文件的历史版本。 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口 
   * @summary 发起实时转码任务并获取带授权信息的播放列表
   * @param {HlsApiLiveTranscodeMediaFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  liveTranscodeMediaFile(e, t) {
    return Le(this.configuration).liveTranscodeMediaFile(e.libraryId, e.spaceId, e.filePath, e.liveTranscode, e.transcodingTemplateId, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于重传或追加 m3u8 分片文件。 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口
   * @summary m3u8 分片重传与追加
   * @param {HlsApiModifyM3u8SegmentsRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  modifyM3u8Segments(e, t) {
    return Le(this.configuration).modifyM3u8Segments(e.libraryId, e.spaceId, e.confirmKey, e.modify, e.modifyM3u8SegmentsRequest, e.accessToken, e.librarySecret, e.trafficLimit, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于准备 m3u8 播放列表及其分片文件的上传。 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口 
   * @summary m3u8 上传准备
   * @param {HlsApiPrepareM3u8UploadRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  prepareM3u8Upload(e, t) {
    return Le(this.configuration).prepareM3u8Upload(e.libraryId, e.spaceId, e.filePath, e.prepareM3u8UploadRequest, e.accessToken, e.conflictResolutionStrategy, e.trafficLimit, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 可选接口，用于对 m3u8 上传任务进行续期，刷新上传信息的有效期。 权限说明： 要求 space_admin 权限 或 admin 权限，有关权限详情请参见 生成访问令牌接口
   * @summary m3u8 上传续期
   * @param {HlsApiRenewM3u8UploadRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  renewM3u8Upload(e, t) {
    return Le(this.configuration).renewM3u8Upload(e.libraryId, e.spaceId, e.confirmKey, e.renew, e.renewM3u8UploadRequest, e.accessToken, e.librarySecret, e.trafficLimit, t).then((a) => a(this.axios, this.basePath));
  }
}, Vn = function(e) {
  return {
    /**
     * 用于创建配额。当在配置了配额的租户空间中上传即将超过配额的文件时，会返回 QuotaLimitReached 错误码；租户空间的剩余空间非实时更新，当系统负荷较高时可能会有比较大的更新延时，进而可能导致意外超出配额，如果配置了超额自动删除选项，可能进一步导致旧文件被删除；配额与租户空间是一对多的关系，即多个租户空间可以共享同一个配额，但每个租户空间只能设置一个配额。
     * @summary 创建配额
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {CreateQuotaRequest} createQuotaRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createQuota: async (t, a, i, r, s, o = {}) => {
      I("createQuota", "libraryId", t), I("createQuota", "createQuotaRequest", a);
      const n = "/api/v1/quota/{LibraryId}".replace("{LibraryId}", encodeURIComponent(String(t))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "POST", ...c, ...o }, d = {}, h = {};
      i !== void 0 && (h.access_token = i), r !== void 0 && (h.library_secret = r), s !== void 0 && (h.user_id = s), d["Content-Type"] = "application/json", U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, l.data = $(a, l, e), {
        url: k(p),
        options: l
      };
    },
    /**
     * 用于获取租户空间配额
     * @summary 获取租户空间配额
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getQuota: async (t, a, i, r, s, o = {}) => {
      I("getQuota", "libraryId", t), I("getQuota", "spaceId", a);
      const n = "/api/v1/quota/{LibraryId}/{SpaceId}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "GET", ...c, ...o }, d = {}, h = {};
      i !== void 0 && (h.access_token = i), r !== void 0 && (h.library_secret = r), s !== void 0 && (h.user_id = s), U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, {
        url: k(p),
        options: l
      };
    },
    /**
     * 用于获取租户配额信息
     * @summary 获取租户配额信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} quotaId 配额 ID，必选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getQuotaInfo: async (t, a, i, r, s, o = {}) => {
      I("getQuotaInfo", "libraryId", t), I("getQuotaInfo", "quotaId", a);
      const n = "/api/v1/quota/{LibraryId}/{QuotaId}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{QuotaId}", encodeURIComponent(String(a))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "GET", ...c, ...o }, d = {}, h = {};
      i !== void 0 && (h.access_token = i), r !== void 0 && (h.library_secret = r), s !== void 0 && (h.user_id = s), U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, {
        url: k(p),
        options: l
      };
    },
    /**
     * 用于修改配额
     * @summary 修改配额
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {UpdateQuotaRequest} updateQuotaRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateQuota: async (t, a, i, r, s, o, n = {}) => {
      I("updateQuota", "libraryId", t), I("updateQuota", "spaceId", a), I("updateQuota", "updateQuotaRequest", i);
      const p = "/api/v1/quota/{LibraryId}/{SpaceId}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), c = new URL(p, O);
      let l;
      e && (l = e.baseOptions);
      const d = { method: "PUT", ...l, ...n }, h = {}, u = {};
      r !== void 0 && (u.access_token = r), s !== void 0 && (u.library_secret = s), o !== void 0 && (u.user_id = o), h["Content-Type"] = "application/json", U(c, u);
      let y = l && l.headers ? l.headers : {};
      return d.headers = { ...h, ...y, ...n.headers }, d.data = $(i, d, e), {
        url: k(c),
        options: d
      };
    },
    /**
     * 用于根据配额 ID 修改配额
     * @summary 修改配额
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} quotaId 配额 ID，创建配额时会返回，也可以通过【获取租户空间配额】接口查询指定租户空间所在的配额 ID
     * @param {UpdateQuotaByIdRequest} updateQuotaByIdRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateQuotaById: async (t, a, i, r, s, o, n = {}) => {
      I("updateQuotaById", "libraryId", t), I("updateQuotaById", "quotaId", a), I("updateQuotaById", "updateQuotaByIdRequest", i);
      const p = "/api/v1/quota/{LibraryId}/{QuotaId}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{QuotaId}", encodeURIComponent(String(a))), c = new URL(p, O);
      let l;
      e && (l = e.baseOptions);
      const d = { method: "PUT", ...l, ...n }, h = {}, u = {};
      r !== void 0 && (u.access_token = r), s !== void 0 && (u.library_secret = s), o !== void 0 && (u.user_id = o), h["Content-Type"] = "application/json", U(c, u);
      let y = l && l.headers ? l.headers : {};
      return d.headers = { ...h, ...y, ...n.headers }, d.data = $(i, d, e), {
        url: k(c),
        options: d
      };
    }
  };
}, ht = function(e) {
  const t = Vn(e);
  return {
    /**
     * 用于创建配额。当在配置了配额的租户空间中上传即将超过配额的文件时，会返回 QuotaLimitReached 错误码；租户空间的剩余空间非实时更新，当系统负荷较高时可能会有比较大的更新延时，进而可能导致意外超出配额，如果配置了超额自动删除选项，可能进一步导致旧文件被删除；配额与租户空间是一对多的关系，即多个租户空间可以共享同一个配额，但每个租户空间只能设置一个配额。
     * @summary 创建配额
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {CreateQuotaRequest} createQuotaRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createQuota(a, i, r, s, o, n) {
      var d, h;
      const p = await t.createQuota(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["QuotaApi.createQuota"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    },
    /**
     * 用于获取租户空间配额
     * @summary 获取租户空间配额
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getQuota(a, i, r, s, o, n) {
      var d, h;
      const p = await t.getQuota(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["QuotaApi.getQuota"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    },
    /**
     * 用于获取租户配额信息
     * @summary 获取租户配额信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} quotaId 配额 ID，必选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getQuotaInfo(a, i, r, s, o, n) {
      var d, h;
      const p = await t.getQuotaInfo(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["QuotaApi.getQuotaInfo"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    },
    /**
     * 用于修改配额
     * @summary 修改配额
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {UpdateQuotaRequest} updateQuotaRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateQuota(a, i, r, s, o, n, p) {
      var h, u;
      const c = await t.updateQuota(a, i, r, s, o, n, p), l = (e == null ? void 0 : e.serverIndex) ?? 0, d = (u = (h = D["QuotaApi.updateQuota"]) == null ? void 0 : h[l]) == null ? void 0 : u.url;
      return (y, f) => T(c, R, x, e)(y, d || f);
    },
    /**
     * 用于根据配额 ID 修改配额
     * @summary 修改配额
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} quotaId 配额 ID，创建配额时会返回，也可以通过【获取租户空间配额】接口查询指定租户空间所在的配额 ID
     * @param {UpdateQuotaByIdRequest} updateQuotaByIdRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateQuotaById(a, i, r, s, o, n, p) {
      var h, u;
      const c = await t.updateQuotaById(a, i, r, s, o, n, p), l = (e == null ? void 0 : e.serverIndex) ?? 0, d = (u = (h = D["QuotaApi.updateQuotaById"]) == null ? void 0 : h[l]) == null ? void 0 : u.url;
      return (y, f) => T(c, R, x, e)(y, d || f);
    }
  };
}, Nn = class extends he {
  /**
   * 用于创建配额。当在配置了配额的租户空间中上传即将超过配额的文件时，会返回 QuotaLimitReached 错误码；租户空间的剩余空间非实时更新，当系统负荷较高时可能会有比较大的更新延时，进而可能导致意外超出配额，如果配置了超额自动删除选项，可能进一步导致旧文件被删除；配额与租户空间是一对多的关系，即多个租户空间可以共享同一个配额，但每个租户空间只能设置一个配额。
   * @summary 创建配额
   * @param {QuotaApiCreateQuotaRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  createQuota(e, t) {
    return ht(this.configuration).createQuota(e.libraryId, e.createQuotaRequest, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于获取租户空间配额
   * @summary 获取租户空间配额
   * @param {QuotaApiGetQuotaRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  getQuota(e, t) {
    return ht(this.configuration).getQuota(e.libraryId, e.spaceId, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于获取租户配额信息
   * @summary 获取租户配额信息
   * @param {QuotaApiGetQuotaInfoRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  getQuotaInfo(e, t) {
    return ht(this.configuration).getQuotaInfo(e.libraryId, e.quotaId, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于修改配额
   * @summary 修改配额
   * @param {QuotaApiUpdateQuotaRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  updateQuota(e, t) {
    return ht(this.configuration).updateQuota(e.libraryId, e.spaceId, e.updateQuotaRequest, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于根据配额 ID 修改配额
   * @summary 修改配额
   * @param {QuotaApiUpdateQuotaByIdRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  updateQuotaById(e, t) {
    return ht(this.configuration).updateQuotaById(e.libraryId, e.quotaId, e.updateQuotaByIdRequest, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
}, Qn = function(e) {
  return {
    /**
     * 用于查看最近使用文件列表，仅文件预览及文件编辑操作会被记录到最近使用文件列表中，返回的文件列表按照操作时间进行倒序排列
     * @summary 查看最近使用文件列表
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {ListRecentlyUsedFileRequest} [listRecentlyUsedFileRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listRecentlyUsedFile: async (t, a, i, r, s, o = {}) => {
      I("listRecentlyUsedFile", "libraryId", t), I("listRecentlyUsedFile", "spaceId", a);
      const n = "/api/v1/recent/{LibraryId}/{SpaceId}/recently-used-file".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "POST", ...c, ...o }, d = {}, h = {};
      i !== void 0 && (h.access_token = i), r !== void 0 && (h.library_secret = r), d["Content-Type"] = "application/json", U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, l.data = $(s, l, e), {
        url: k(p),
        options: l
      };
    }
  };
}, Ln = function(e) {
  const t = Qn(e);
  return {
    /**
     * 用于查看最近使用文件列表，仅文件预览及文件编辑操作会被记录到最近使用文件列表中，返回的文件列表按照操作时间进行倒序排列
     * @summary 查看最近使用文件列表
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {ListRecentlyUsedFileRequest} [listRecentlyUsedFileRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listRecentlyUsedFile(a, i, r, s, o, n) {
      var d, h;
      const p = await t.listRecentlyUsedFile(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["RecentApi.listRecentlyUsedFile"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    }
  };
}, Mn = class extends he {
  /**
   * 用于查看最近使用文件列表，仅文件预览及文件编辑操作会被记录到最近使用文件列表中，返回的文件列表按照操作时间进行倒序排列
   * @summary 查看最近使用文件列表
   * @param {RecentApiListRecentlyUsedFileRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  listRecentlyUsedFile(e, t) {
    return Ln(this.configuration).listRecentlyUsedFile(e.libraryId, e.spaceId, e.accessToken, e.librarySecret, e.listRecentlyUsedFileRequest, t).then((a) => a(this.axios, this.basePath));
  }
}, zn = function(e) {
  return {
    /**
     * 用于清空回收站。要求权限：admin、space_admin 或 delete_recycled。调用清空回收站接口时，回收站内的文件将首先在回收站内不可见，删除和释放空间的操作将异步执行。
     * @summary 清空回收站
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    recycleEmpty: async (t, a, i, r, s, o = {}) => {
      I("recycleEmpty", "libraryId", t), I("recycleEmpty", "spaceId", a);
      const n = "/api/v1/recycled/{LibraryId}/{SpaceId}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "DELETE", ...c, ...o }, d = {}, h = {};
      i !== void 0 && (h.access_token = i), r !== void 0 && (h.library_secret = r), s !== void 0 && (h.user_id = s), U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, {
        url: k(p),
        options: l
      };
    },
    /**
     * 用于查看回收站文件详情，以便进行预览
     * @summary 查看回收站文件详情
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {number} recycledItemId 回收站 ID
     * @param {number} info 获取文件详情，固定值为1
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    recycleInfo: async (t, a, i, r, s, o, n = {}) => {
      I("recycleInfo", "libraryId", t), I("recycleInfo", "spaceId", a), I("recycleInfo", "recycledItemId", i), I("recycleInfo", "info", r);
      const p = "/api/v1/recycled/{LibraryId}/{SpaceId}/{RecycledItemId}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{RecycledItemId}", encodeURIComponent(String(i))), c = new URL(p, O);
      let l;
      e && (l = e.baseOptions);
      const d = { method: "GET", ...l, ...n }, h = {}, u = {};
      r !== void 0 && (u.info = r), s !== void 0 && (u.access_token = s), o !== void 0 && (u.library_secret = o), U(c, u);
      let y = l && l.headers ? l.headers : {};
      return d.headers = { ...h, ...y, ...n.headers }, {
        url: k(c),
        options: d
      };
    },
    /**
     * 用于列出回收站项目。 目录内容的列出顺序为：默认无排序，根据传入参数 orderBy 和 orderByType 来决定排列顺序。 
     * @summary 列出回收站项目
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {RecycleListByMarkerEnum} byMarker 固定传 1，表示使用 marker 方式分页
     * @param {string} [marker] 用于顺序列出分页的标识
     * @param {number} [limit] 用于顺序列出分页时本地列出的项目数限制，不传默认值 20，最大返回 100
     * @param {RecycleListOrderByEnum} [orderBy] 排序字段，按名称排序为 name，按修改时间排序为 modificationTime，按文件大小排序为 size，按删除时间排序为 removalTime，按剩余时间排序为 remainingTime
     * @param {RecycleListOrderByTypeEnum} [orderByType] 排序方式，升序为 asc，降序为 desc
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    recycleList: async (t, a, i, r, s, o, n, p, c, l, d = {}) => {
      I("recycleList", "libraryId", t), I("recycleList", "spaceId", a), I("recycleList", "byMarker", i);
      const h = "/api/v1/recycled/{LibraryId}/{SpaceId}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), u = new URL(h, O);
      let y;
      e && (y = e.baseOptions);
      const f = { method: "GET", ...y, ...d }, A = {}, m = {};
      i !== void 0 && (m["by-marker"] = i), r !== void 0 && (m.marker = r), s !== void 0 && (m.limit = s), o !== void 0 && (m.order_by = o), n !== void 0 && (m.order_by_type = n), p !== void 0 && (m.access_token = p), c !== void 0 && (m.library_secret = c), l !== void 0 && (m.user_id = l), U(u, m);
      let F = y && y.headers ? y.headers : {};
      return f.headers = { ...A, ...F, ...d.headers }, {
        url: k(u),
        options: f
      };
    },
    /**
     * 用于列出回收站项目。 目录内容的列出顺序为：默认无排序，根据传入参数 orderBy 和 orderByType 来决定排列顺序。 page 翻页的深度会有限制，强烈建议业务方改用 marker 翻页的形式。 
     * @summary 列出回收站项目（by-page）
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {RecycleListByPageByPageEnum} byPage 固定传 1，表示使用 page 方式分页
     * @param {number} [page] 分页码，默认第一页，最大翻页的条目数（Page*PageSize 的大小）是 1 万
     * @param {number} [pageSize] 分页大小，默认 20，最大翻页的条目数（Page*PageSize 的大小）是 1 万
     * @param {RecycleListByPageOrderByEnum} [orderBy] 排序字段
     * @param {RecycleListByPageOrderByTypeEnum} [orderByType] 排序方式，升序为 asc，降序为 desc
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    recycleListByPage: async (t, a, i, r, s, o, n, p, c, l, d = {}) => {
      I("recycleListByPage", "libraryId", t), I("recycleListByPage", "spaceId", a), I("recycleListByPage", "byPage", i);
      const h = "/api/v1/recycled/{LibraryId}/{SpaceId}#3".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), u = new URL(h, O);
      let y;
      e && (y = e.baseOptions);
      const f = { method: "GET", ...y, ...d }, A = {}, m = {};
      i !== void 0 && (m["by-page"] = i), r !== void 0 && (m.page = r), s !== void 0 && (m.page_size = s), o !== void 0 && (m.order_by = o), n !== void 0 && (m.order_by_type = n), p !== void 0 && (m.access_token = p), c !== void 0 && (m.library_secret = c), l !== void 0 && (m.user_id = l), U(u, m);
      let F = y && y.headers ? y.headers : {};
      return f.headers = { ...A, ...F, ...d.headers }, {
        url: k(u),
        options: f
      };
    },
    /**
     * 可用于预览文档、图片、视频等文件类型；文档类型可返回HTML或JPG格式；视频返回首帧图片；照片或视频封面支持智能裁剪为指定大小，未识别到人脸时居中缩放裁剪；当未指定 size 参数时使用原图；接口返回302并跳转到可直接用于展示或下载的文件URL。
     * @summary 预览回收站项目
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {number} recycledItemId 回收站 ID
     * @param {number} preview 预览标志，固定值为1
     * @param {string} [type] 文档类型文件的预览方式，设置为 pic 时以JPG格式预览文档首页，否则以HTML格式预览文档
     * @param {number} [size] 图片或视频封面的缩放大小，优先使用人脸识别智能缩放裁剪为 size×size 大小
     * @param {number} [scale] 图片或视频封面的等比例缩放百分比，不传 size 时生效
     * @param {number} [widthSize] 图片或视频封面的缩放宽度，不传高度时按等比例缩放，不传 size 和 scale 时生效
     * @param {number} [heightSize] 图片或视频封面的缩放高度，不传宽度时按等比例缩放，不传 size 和 scale 时生效
     * @param {number} [frameNumber] gif 文件降帧的帧数，仅在预览 gif 类型文件时生效
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    recyclePreview: async (t, a, i, r, s, o, n, p, c, l, d, h, u = {}) => {
      I("recyclePreview", "libraryId", t), I("recyclePreview", "spaceId", a), I("recyclePreview", "recycledItemId", i), I("recyclePreview", "preview", r);
      const y = "/api/v1/recycled/{LibraryId}/{SpaceId}/{RecycledItemId}#1".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{RecycledItemId}", encodeURIComponent(String(i))), f = new URL(y, O);
      let A;
      e && (A = e.baseOptions);
      const m = { method: "GET", ...A, ...u }, F = {}, v = {};
      r !== void 0 && (v.preview = r), s !== void 0 && (v.type = s), o !== void 0 && (v.size = o), n !== void 0 && (v.scale = n), p !== void 0 && (v.width_size = p), c !== void 0 && (v.height_size = c), l !== void 0 && (v.frame_number = l), d !== void 0 && (v.access_token = d), h !== void 0 && (v.library_secret = h), U(f, v);
      let C = A && A.headers ? A.headers : {};
      return m.headers = { ...F, ...C, ...u.headers }, {
        url: k(f),
        options: m
      };
    },
    /**
     * 用于永久删除指定回收站项目。要求权限：admin、space_admin 或 delete_recycled。
     * @summary 永久删除指定回收站项目
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {number} recycledItemId 回收站项目 ID
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    recyclePurge: async (t, a, i, r, s, o, n = {}) => {
      I("recyclePurge", "libraryId", t), I("recyclePurge", "spaceId", a), I("recyclePurge", "recycledItemId", i);
      const p = "/api/v1/recycled/{LibraryId}/{SpaceId}/{RecycledItemId}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{RecycledItemId}", encodeURIComponent(String(i))), c = new URL(p, O);
      let l;
      e && (l = e.baseOptions);
      const d = { method: "DELETE", ...l, ...n }, h = {}, u = {};
      r !== void 0 && (u.access_token = r), s !== void 0 && (u.library_secret = s), o !== void 0 && (u.user_id = o), U(c, u);
      let y = l && l.headers ? l.headers : {};
      return d.headers = { ...h, ...y, ...n.headers }, {
        url: k(c),
        options: d
      };
    },
    /**
     * 用于永久删除指定回收站项目（批量）。要求权限：admin、space_admin 或 delete_recycled。
     * @summary 永久删除指定回收站项目（批量）
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {number} _delete 永久删除标志，固定值为1
     * @param {Array<number>} recyclePurgeBatchRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    recyclePurgeBatch: async (t, a, i, r, s, o, n, p = {}) => {
      I("recyclePurgeBatch", "libraryId", t), I("recyclePurgeBatch", "spaceId", a), I("recyclePurgeBatch", "_delete", i), I("recyclePurgeBatch", "recyclePurgeBatchRequest", r);
      const c = "/api/v1/recycled/{LibraryId}/{SpaceId}#1".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), l = new URL(c, O);
      let d;
      e && (d = e.baseOptions);
      const h = { method: "POST", ...d, ...p }, u = {}, y = {};
      i !== void 0 && (y.delete = i), s !== void 0 && (y.access_token = s), o !== void 0 && (y.library_secret = o), n !== void 0 && (y.user_id = n), u["Content-Type"] = "application/json", U(l, y);
      let f = d && d.headers ? d.headers : {};
      return h.headers = { ...u, ...f, ...p.headers }, h.data = $(r, h, e), {
        url: k(l),
        options: h
      };
    },
    /**
     * 用于恢复指定回收站项目。要求权限：admin、space_admin 或 restore_recycled。恢复项目时需保证该项目所在的目录存在。
     * @summary 恢复指定回收站项目
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {number} recycledItemId 回收站项目 ID
     * @param {RecycleRestoreRestoreEnum} restore 固定为 1
     * @param {RecycleRestoreConflictResolutionStrategyEnum} [conflictResolutionStrategy] 路径冲突时的处理方式，ask: 冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename: 冲突时自动重命名文件，overwrite: 如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 ask
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {RecycleRestoreRestorePathStrategyEnum} [restorePathStrategy] 恢复项目源路径的处理方式，originalPath:恢复到原始路径，原始路径不存在则报错; fallbackToRoot:恢复到原始路径，原始路径不存在则恢复到根目录，默认为 originalPath
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    recycleRestore: async (t, a, i, r, s, o, n, p, c, l = {}) => {
      I("recycleRestore", "libraryId", t), I("recycleRestore", "spaceId", a), I("recycleRestore", "recycledItemId", i), I("recycleRestore", "restore", r);
      const d = "/api/v1/recycled/{LibraryId}/{SpaceId}/{RecycledItemId}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{RecycledItemId}", encodeURIComponent(String(i))), h = new URL(d, O);
      let u;
      e && (u = e.baseOptions);
      const y = { method: "POST", ...u, ...l }, f = {}, A = {};
      r !== void 0 && (A.restore = r), s !== void 0 && (A.conflict_resolution_strategy = s), o !== void 0 && (A.access_token = o), n !== void 0 && (A.library_secret = n), p !== void 0 && (A.user_id = p), c !== void 0 && (A.restore_path_strategy = c), U(h, A);
      let m = u && u.headers ? u.headers : {};
      return y.headers = { ...f, ...m, ...l.headers }, {
        url: k(h),
        options: y
      };
    },
    /**
     * 用于恢复指定回收站项目（批量）。要求权限：admin、space_admin 或 restore_recycled。恢复项目时需保证该项目所在的目录存在；恢复项目时如果有同名文件存在，则默认重命名文件。
     * @summary 批量恢复回收站项目
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {number} restore 恢复，固定值为1
     * @param {Array<number>} recycleRestoreBatchRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {RecycleRestoreBatchRestorePathStrategyEnum} [restorePathStrategy] 恢复项目源路径的处理方式，originalPath:恢复到原始路径，原始路径不存在则报错; fallbackToRoot:恢复到原始路径，原始路径不存在则恢复到根目录，默认为 originalPath
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    recycleRestoreBatch: async (t, a, i, r, s, o, n, p, c = {}) => {
      I("recycleRestoreBatch", "libraryId", t), I("recycleRestoreBatch", "spaceId", a), I("recycleRestoreBatch", "restore", i), I("recycleRestoreBatch", "recycleRestoreBatchRequest", r);
      const l = "/api/v1/recycled/{LibraryId}/{SpaceId}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), d = new URL(l, O);
      let h;
      e && (h = e.baseOptions);
      const u = { method: "POST", ...h, ...c }, y = {}, f = {};
      i !== void 0 && (f.restore = i), s !== void 0 && (f.access_token = s), o !== void 0 && (f.library_secret = o), n !== void 0 && (f.user_id = n), p !== void 0 && (f.restore_path_strategy = p), y["Content-Type"] = "application/json", U(d, f);
      let A = h && h.headers ? h.headers : {};
      return u.headers = { ...y, ...A, ...c.headers }, u.data = $(r, u, e), {
        url: k(d),
        options: u
      };
    },
    /**
     * 用于设置回收站生命周期。未对租户空间设置时，采用媒体库默认值；当延长保留天数时，已有文件同步使用新值；当缩短保留天数时，已有文件沿用旧值，新删除文件使用新值。
     * @summary 设置回收站生命周期
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {number} lifecycle 设置回收站生命周期标志，固定值为1
     * @param {RecycleSetLifecycleRequest} recycleSetLifecycleRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    recycleSetLifecycle: async (t, a, i, r, s, o, n = {}) => {
      I("recycleSetLifecycle", "libraryId", t), I("recycleSetLifecycle", "spaceId", a), I("recycleSetLifecycle", "lifecycle", i), I("recycleSetLifecycle", "recycleSetLifecycleRequest", r);
      const p = "/api/v1/recycled/{LibraryId}/{SpaceId}#2".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), c = new URL(p, O);
      let l;
      e && (l = e.baseOptions);
      const d = { method: "POST", ...l, ...n }, h = {}, u = {};
      i !== void 0 && (u.lifecycle = i), s !== void 0 && (u.access_token = s), o !== void 0 && (u.library_secret = o), h["Content-Type"] = "application/json", U(c, u);
      let y = l && l.headers ? l.headers : {};
      return d.headers = { ...h, ...y, ...n.headers }, d.data = $(r, d, e), {
        url: k(c),
        options: d
      };
    }
  };
}, Ee = function(e) {
  const t = zn(e);
  return {
    /**
     * 用于清空回收站。要求权限：admin、space_admin 或 delete_recycled。调用清空回收站接口时，回收站内的文件将首先在回收站内不可见，删除和释放空间的操作将异步执行。
     * @summary 清空回收站
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async recycleEmpty(a, i, r, s, o, n) {
      var d, h;
      const p = await t.recycleEmpty(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["RecycledApi.recycleEmpty"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    },
    /**
     * 用于查看回收站文件详情，以便进行预览
     * @summary 查看回收站文件详情
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {number} recycledItemId 回收站 ID
     * @param {number} info 获取文件详情，固定值为1
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async recycleInfo(a, i, r, s, o, n, p) {
      var h, u;
      const c = await t.recycleInfo(a, i, r, s, o, n, p), l = (e == null ? void 0 : e.serverIndex) ?? 0, d = (u = (h = D["RecycledApi.recycleInfo"]) == null ? void 0 : h[l]) == null ? void 0 : u.url;
      return (y, f) => T(c, R, x, e)(y, d || f);
    },
    /**
     * 用于列出回收站项目。 目录内容的列出顺序为：默认无排序，根据传入参数 orderBy 和 orderByType 来决定排列顺序。 
     * @summary 列出回收站项目
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {RecycleListByMarkerEnum} byMarker 固定传 1，表示使用 marker 方式分页
     * @param {string} [marker] 用于顺序列出分页的标识
     * @param {number} [limit] 用于顺序列出分页时本地列出的项目数限制，不传默认值 20，最大返回 100
     * @param {RecycleListOrderByEnum} [orderBy] 排序字段，按名称排序为 name，按修改时间排序为 modificationTime，按文件大小排序为 size，按删除时间排序为 removalTime，按剩余时间排序为 remainingTime
     * @param {RecycleListOrderByTypeEnum} [orderByType] 排序方式，升序为 asc，降序为 desc
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async recycleList(a, i, r, s, o, n, p, c, l, d, h) {
      var A, m;
      const u = await t.recycleList(a, i, r, s, o, n, p, c, l, d, h), y = (e == null ? void 0 : e.serverIndex) ?? 0, f = (m = (A = D["RecycledApi.recycleList"]) == null ? void 0 : A[y]) == null ? void 0 : m.url;
      return (F, v) => T(u, R, x, e)(F, f || v);
    },
    /**
     * 用于列出回收站项目。 目录内容的列出顺序为：默认无排序，根据传入参数 orderBy 和 orderByType 来决定排列顺序。 page 翻页的深度会有限制，强烈建议业务方改用 marker 翻页的形式。 
     * @summary 列出回收站项目（by-page）
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {RecycleListByPageByPageEnum} byPage 固定传 1，表示使用 page 方式分页
     * @param {number} [page] 分页码，默认第一页，最大翻页的条目数（Page*PageSize 的大小）是 1 万
     * @param {number} [pageSize] 分页大小，默认 20，最大翻页的条目数（Page*PageSize 的大小）是 1 万
     * @param {RecycleListByPageOrderByEnum} [orderBy] 排序字段
     * @param {RecycleListByPageOrderByTypeEnum} [orderByType] 排序方式，升序为 asc，降序为 desc
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async recycleListByPage(a, i, r, s, o, n, p, c, l, d, h) {
      var A, m;
      const u = await t.recycleListByPage(a, i, r, s, o, n, p, c, l, d, h), y = (e == null ? void 0 : e.serverIndex) ?? 0, f = (m = (A = D["RecycledApi.recycleListByPage"]) == null ? void 0 : A[y]) == null ? void 0 : m.url;
      return (F, v) => T(u, R, x, e)(F, f || v);
    },
    /**
     * 可用于预览文档、图片、视频等文件类型；文档类型可返回HTML或JPG格式；视频返回首帧图片；照片或视频封面支持智能裁剪为指定大小，未识别到人脸时居中缩放裁剪；当未指定 size 参数时使用原图；接口返回302并跳转到可直接用于展示或下载的文件URL。
     * @summary 预览回收站项目
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {number} recycledItemId 回收站 ID
     * @param {number} preview 预览标志，固定值为1
     * @param {string} [type] 文档类型文件的预览方式，设置为 pic 时以JPG格式预览文档首页，否则以HTML格式预览文档
     * @param {number} [size] 图片或视频封面的缩放大小，优先使用人脸识别智能缩放裁剪为 size×size 大小
     * @param {number} [scale] 图片或视频封面的等比例缩放百分比，不传 size 时生效
     * @param {number} [widthSize] 图片或视频封面的缩放宽度，不传高度时按等比例缩放，不传 size 和 scale 时生效
     * @param {number} [heightSize] 图片或视频封面的缩放高度，不传宽度时按等比例缩放，不传 size 和 scale 时生效
     * @param {number} [frameNumber] gif 文件降帧的帧数，仅在预览 gif 类型文件时生效
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async recyclePreview(a, i, r, s, o, n, p, c, l, d, h, u, y) {
      var F, v;
      const f = await t.recyclePreview(a, i, r, s, o, n, p, c, l, d, h, u, y), A = (e == null ? void 0 : e.serverIndex) ?? 0, m = (v = (F = D["RecycledApi.recyclePreview"]) == null ? void 0 : F[A]) == null ? void 0 : v.url;
      return (C, _) => T(f, R, x, e)(C, m || _);
    },
    /**
     * 用于永久删除指定回收站项目。要求权限：admin、space_admin 或 delete_recycled。
     * @summary 永久删除指定回收站项目
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {number} recycledItemId 回收站项目 ID
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async recyclePurge(a, i, r, s, o, n, p) {
      var h, u;
      const c = await t.recyclePurge(a, i, r, s, o, n, p), l = (e == null ? void 0 : e.serverIndex) ?? 0, d = (u = (h = D["RecycledApi.recyclePurge"]) == null ? void 0 : h[l]) == null ? void 0 : u.url;
      return (y, f) => T(c, R, x, e)(y, d || f);
    },
    /**
     * 用于永久删除指定回收站项目（批量）。要求权限：admin、space_admin 或 delete_recycled。
     * @summary 永久删除指定回收站项目（批量）
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {number} _delete 永久删除标志，固定值为1
     * @param {Array<number>} recyclePurgeBatchRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async recyclePurgeBatch(a, i, r, s, o, n, p, c) {
      var u, y;
      const l = await t.recyclePurgeBatch(a, i, r, s, o, n, p, c), d = (e == null ? void 0 : e.serverIndex) ?? 0, h = (y = (u = D["RecycledApi.recyclePurgeBatch"]) == null ? void 0 : u[d]) == null ? void 0 : y.url;
      return (f, A) => T(l, R, x, e)(f, h || A);
    },
    /**
     * 用于恢复指定回收站项目。要求权限：admin、space_admin 或 restore_recycled。恢复项目时需保证该项目所在的目录存在。
     * @summary 恢复指定回收站项目
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {number} recycledItemId 回收站项目 ID
     * @param {RecycleRestoreRestoreEnum} restore 固定为 1
     * @param {RecycleRestoreConflictResolutionStrategyEnum} [conflictResolutionStrategy] 路径冲突时的处理方式，ask: 冲突时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，rename: 冲突时自动重命名文件，overwrite: 如果冲突目标为目录时返回 HTTP 409 Conflict 及 SameNameDirectoryOrFileExists 错误码，否则覆盖已有文件，默认为 ask
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {RecycleRestoreRestorePathStrategyEnum} [restorePathStrategy] 恢复项目源路径的处理方式，originalPath:恢复到原始路径，原始路径不存在则报错; fallbackToRoot:恢复到原始路径，原始路径不存在则恢复到根目录，默认为 originalPath
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async recycleRestore(a, i, r, s, o, n, p, c, l, d) {
      var f, A;
      const h = await t.recycleRestore(a, i, r, s, o, n, p, c, l, d), u = (e == null ? void 0 : e.serverIndex) ?? 0, y = (A = (f = D["RecycledApi.recycleRestore"]) == null ? void 0 : f[u]) == null ? void 0 : A.url;
      return (m, F) => T(h, R, x, e)(m, y || F);
    },
    /**
     * 用于恢复指定回收站项目（批量）。要求权限：admin、space_admin 或 restore_recycled。恢复项目时需保证该项目所在的目录存在；恢复项目时如果有同名文件存在，则默认重命名文件。
     * @summary 批量恢复回收站项目
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {number} restore 恢复，固定值为1
     * @param {Array<number>} recycleRestoreBatchRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {RecycleRestoreBatchRestorePathStrategyEnum} [restorePathStrategy] 恢复项目源路径的处理方式，originalPath:恢复到原始路径，原始路径不存在则报错; fallbackToRoot:恢复到原始路径，原始路径不存在则恢复到根目录，默认为 originalPath
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async recycleRestoreBatch(a, i, r, s, o, n, p, c, l) {
      var y, f;
      const d = await t.recycleRestoreBatch(a, i, r, s, o, n, p, c, l), h = (e == null ? void 0 : e.serverIndex) ?? 0, u = (f = (y = D["RecycledApi.recycleRestoreBatch"]) == null ? void 0 : y[h]) == null ? void 0 : f.url;
      return (A, m) => T(d, R, x, e)(A, u || m);
    },
    /**
     * 用于设置回收站生命周期。未对租户空间设置时，采用媒体库默认值；当延长保留天数时，已有文件同步使用新值；当缩短保留天数时，已有文件沿用旧值，新删除文件使用新值。
     * @summary 设置回收站生命周期
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {number} lifecycle 设置回收站生命周期标志，固定值为1
     * @param {RecycleSetLifecycleRequest} recycleSetLifecycleRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async recycleSetLifecycle(a, i, r, s, o, n, p) {
      var h, u;
      const c = await t.recycleSetLifecycle(a, i, r, s, o, n, p), l = (e == null ? void 0 : e.serverIndex) ?? 0, d = (u = (h = D["RecycledApi.recycleSetLifecycle"]) == null ? void 0 : h[l]) == null ? void 0 : u.url;
      return (y, f) => T(c, R, x, e)(y, d || f);
    }
  };
}, Pn = class extends he {
  /**
   * 用于清空回收站。要求权限：admin、space_admin 或 delete_recycled。调用清空回收站接口时，回收站内的文件将首先在回收站内不可见，删除和释放空间的操作将异步执行。
   * @summary 清空回收站
   * @param {RecycledApiRecycleEmptyRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  recycleEmpty(e, t) {
    return Ee(this.configuration).recycleEmpty(e.libraryId, e.spaceId, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于查看回收站文件详情，以便进行预览
   * @summary 查看回收站文件详情
   * @param {RecycledApiRecycleInfoRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  recycleInfo(e, t) {
    return Ee(this.configuration).recycleInfo(e.libraryId, e.spaceId, e.recycledItemId, e.info, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于列出回收站项目。 目录内容的列出顺序为：默认无排序，根据传入参数 orderBy 和 orderByType 来决定排列顺序。 
   * @summary 列出回收站项目
   * @param {RecycledApiRecycleListRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  recycleList(e, t) {
    return Ee(this.configuration).recycleList(e.libraryId, e.spaceId, e.byMarker, e.marker, e.limit, e.orderBy, e.orderByType, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于列出回收站项目。 目录内容的列出顺序为：默认无排序，根据传入参数 orderBy 和 orderByType 来决定排列顺序。 page 翻页的深度会有限制，强烈建议业务方改用 marker 翻页的形式。 
   * @summary 列出回收站项目（by-page）
   * @param {RecycledApiRecycleListByPageRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  recycleListByPage(e, t) {
    return Ee(this.configuration).recycleListByPage(e.libraryId, e.spaceId, e.byPage, e.page, e.pageSize, e.orderBy, e.orderByType, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 可用于预览文档、图片、视频等文件类型；文档类型可返回HTML或JPG格式；视频返回首帧图片；照片或视频封面支持智能裁剪为指定大小，未识别到人脸时居中缩放裁剪；当未指定 size 参数时使用原图；接口返回302并跳转到可直接用于展示或下载的文件URL。
   * @summary 预览回收站项目
   * @param {RecycledApiRecyclePreviewRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  recyclePreview(e, t) {
    return Ee(this.configuration).recyclePreview(e.libraryId, e.spaceId, e.recycledItemId, e.preview, e.type, e.size, e.scale, e.widthSize, e.heightSize, e.frameNumber, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于永久删除指定回收站项目。要求权限：admin、space_admin 或 delete_recycled。
   * @summary 永久删除指定回收站项目
   * @param {RecycledApiRecyclePurgeRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  recyclePurge(e, t) {
    return Ee(this.configuration).recyclePurge(e.libraryId, e.spaceId, e.recycledItemId, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于永久删除指定回收站项目（批量）。要求权限：admin、space_admin 或 delete_recycled。
   * @summary 永久删除指定回收站项目（批量）
   * @param {RecycledApiRecyclePurgeBatchRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  recyclePurgeBatch(e, t) {
    return Ee(this.configuration).recyclePurgeBatch(e.libraryId, e.spaceId, e._delete, e.recyclePurgeBatchRequest, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于恢复指定回收站项目。要求权限：admin、space_admin 或 restore_recycled。恢复项目时需保证该项目所在的目录存在。
   * @summary 恢复指定回收站项目
   * @param {RecycledApiRecycleRestoreRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  recycleRestore(e, t) {
    return Ee(this.configuration).recycleRestore(e.libraryId, e.spaceId, e.recycledItemId, e.restore, e.conflictResolutionStrategy, e.accessToken, e.librarySecret, e.userId, e.restorePathStrategy, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于恢复指定回收站项目（批量）。要求权限：admin、space_admin 或 restore_recycled。恢复项目时需保证该项目所在的目录存在；恢复项目时如果有同名文件存在，则默认重命名文件。
   * @summary 批量恢复回收站项目
   * @param {RecycledApiRecycleRestoreBatchRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  recycleRestoreBatch(e, t) {
    return Ee(this.configuration).recycleRestoreBatch(e.libraryId, e.spaceId, e.restore, e.recycleRestoreBatchRequest, e.accessToken, e.librarySecret, e.userId, e.restorePathStrategy, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于设置回收站生命周期。未对租户空间设置时，采用媒体库默认值；当延长保留天数时，已有文件同步使用新值；当缩短保留天数时，已有文件沿用旧值，新删除文件使用新值。
   * @summary 设置回收站生命周期
   * @param {RecycledApiRecycleSetLifecycleRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  recycleSetLifecycle(e, t) {
    return Ee(this.configuration).recycleSetLifecycle(e.libraryId, e.spaceId, e.lifecycle, e.recycleSetLifecycleRequest, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
}, Hn = function(e) {
  return {
    /**
     * 用于搜索目录与文件。 使用本接口搜索时，如果在返回时有部分或全部搜索结果，则返回已搜索出的结果的第一页（每页 20 个），如果暂未搜索到结果则返回空数组，因此该接口实际返回的 contents 数量可能为 0 到 20 之间不等，且是否还有更多搜索结果，不应参考 contents 的数量，而应参考 nextMarker 字段； 当需要获取后续页时，传入marker参数进行翻页； 本接口QPS使用上限为10，此接口不可用于业务的高频操作页面，比如空间首页列表的查询等，如有更大QPS的需求请提工单联系智能媒资托管团队； 
     * @summary 搜索目录与文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [marker] 用于顺序列出分页的标识，可选参数，建议将marker放入请求体中传入
     * @param {number} [limit] 用于顺序列出分页时本地列出的项目数限制，可选参数，取值范围[1,100]
     * @param {SearchFsWithFavoriteStatusEnum} [withFavoriteStatus] 0 或 1，是否返回收藏状态，可选，默认不返回
     * @param {SearchFsRequest} [searchFsRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    searchFs: async (t, a, i, r, s, o, n, p, c, l = {}) => {
      I("searchFs", "libraryId", t), I("searchFs", "spaceId", a);
      const d = "/api/v1/search/{LibraryId}/{SpaceId}/search-fs".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), h = new URL(d, O);
      let u;
      e && (u = e.baseOptions);
      const y = { method: "POST", ...u, ...l }, f = {}, A = {};
      i !== void 0 && (A.access_token = i), r !== void 0 && (A.library_secret = r), s !== void 0 && (A.user_id = s), o !== void 0 && (A.marker = o), n !== void 0 && (A.limit = n), p !== void 0 && (A.with_favorite_status = p), f["Content-Type"] = "application/json", U(h, A);
      let m = u && u.headers ? u.headers : {};
      return y.headers = { ...f, ...m, ...l.headers }, y.data = $(c, y, e), {
        url: k(h),
        options: y
      };
    }
  };
}, $n = function(e) {
  const t = Hn(e);
  return {
    /**
     * 用于搜索目录与文件。 使用本接口搜索时，如果在返回时有部分或全部搜索结果，则返回已搜索出的结果的第一页（每页 20 个），如果暂未搜索到结果则返回空数组，因此该接口实际返回的 contents 数量可能为 0 到 20 之间不等，且是否还有更多搜索结果，不应参考 contents 的数量，而应参考 nextMarker 字段； 当需要获取后续页时，传入marker参数进行翻页； 本接口QPS使用上限为10，此接口不可用于业务的高频操作页面，比如空间首页列表的查询等，如有更大QPS的需求请提工单联系智能媒资托管团队； 
     * @summary 搜索目录与文件
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [marker] 用于顺序列出分页的标识，可选参数，建议将marker放入请求体中传入
     * @param {number} [limit] 用于顺序列出分页时本地列出的项目数限制，可选参数，取值范围[1,100]
     * @param {SearchFsWithFavoriteStatusEnum} [withFavoriteStatus] 0 或 1，是否返回收藏状态，可选，默认不返回
     * @param {SearchFsRequest} [searchFsRequest] 
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async searchFs(a, i, r, s, o, n, p, c, l, d) {
      var f, A;
      const h = await t.searchFs(a, i, r, s, o, n, p, c, l, d), u = (e == null ? void 0 : e.serverIndex) ?? 0, y = (A = (f = D["SearchApi.searchFs"]) == null ? void 0 : f[u]) == null ? void 0 : A.url;
      return (m, F) => T(h, R, x, e)(m, y || F);
    }
  };
}, jn = class extends he {
  /**
   * 用于搜索目录与文件。 使用本接口搜索时，如果在返回时有部分或全部搜索结果，则返回已搜索出的结果的第一页（每页 20 个），如果暂未搜索到结果则返回空数组，因此该接口实际返回的 contents 数量可能为 0 到 20 之间不等，且是否还有更多搜索结果，不应参考 contents 的数量，而应参考 nextMarker 字段； 当需要获取后续页时，传入marker参数进行翻页； 本接口QPS使用上限为10，此接口不可用于业务的高频操作页面，比如空间首页列表的查询等，如有更大QPS的需求请提工单联系智能媒资托管团队； 
   * @summary 搜索目录与文件
   * @param {SearchApiSearchFsRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  searchFs(e, t) {
    return $n(this.configuration).searchFs(e.libraryId, e.spaceId, e.accessToken, e.librarySecret, e.userId, e.marker, e.limit, e.withFavoriteStatus, e.searchFsRequest, t).then((a) => a(this.axios, this.basePath));
  }
}, Gn = function(e) {
  return {
    /**
     * 用于创建租户空间。需要 admin 或 create_space 权限，有关权限详情请参见生成访问令牌接口。
     * @summary 创建租户空间
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {CreateSpaceRequest} [createSpaceRequest] 租户空间的扩展属性
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createSpace: async (t, a, i, r, s, o = {}) => {
      I("createSpace", "libraryId", t);
      const n = "/api/v1/space/{LibraryId}".replace("{LibraryId}", encodeURIComponent(String(t))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "POST", ...c, ...o }, d = {}, h = {};
      a !== void 0 && (h.access_token = a), i !== void 0 && (h.library_secret = i), r !== void 0 && (h.user_id = r), d["Content-Type"] = "application/json", U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, l.data = $(s, l, e), {
        url: k(p),
        options: l
      };
    },
    /**
     * 用于删除租户空间。 要求权限：admin 或 delete_space 
     * @summary 删除租户空间
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {DeleteSpaceForceEnum} [force] 是否强制删除，1:强制删除，不判断space是否为空; 0:非强制删除，不允许删除非空的space
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteSpace: async (t, a, i, r, s, o, n = {}) => {
      I("deleteSpace", "libraryId", t), I("deleteSpace", "spaceId", a);
      const p = "/api/v1/space/{LibraryId}/{SpaceId}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), c = new URL(p, O);
      let l;
      e && (l = e.baseOptions);
      const d = { method: "DELETE", ...l, ...n }, h = {}, u = {};
      i !== void 0 && (u.access_token = i), r !== void 0 && (u.library_secret = r), s !== void 0 && (u.user_id = s), o !== void 0 && (u.force = o), U(c, u);
      let y = l && l.headers ? l.headers : {};
      return d.headers = { ...h, ...y, ...n.headers }, {
        url: k(c),
        options: d
      };
    },
    /**
     * 用于列出空间首页内容，会忽略目录的层级关系，列出空间下所有文件。 要求权限：read_only 或 space_admin 或 admin 
     * @summary 列出空间首页内容
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {GetContentsViewFilterEnum} filter 筛选方式
     * @param {string} [marker] 用于顺序列出分页的标识
     * @param {number} [limit] 用于顺序列出分页时本地列出的项目数限制
     * @param {GetContentsViewOrderByEnum} [orderBy] 排序字段
     * @param {GetContentsViewOrderByTypeEnum} [orderByType] 排序方式
     * @param {boolean} [withPath] 是否返回 path
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [category] 文件自定义的分类
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getContentsView: async (t, a, i, r, s, o, n, p, c, l, d, h, u = {}) => {
      I("getContentsView", "libraryId", t), I("getContentsView", "spaceId", a), I("getContentsView", "filter", i);
      const y = "/api/v1/space/{LibraryId}/{SpaceId}/contents-view".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), f = new URL(y, O);
      let A;
      e && (A = e.baseOptions);
      const m = { method: "GET", ...A, ...u }, F = {}, v = {};
      r !== void 0 && (v.marker = r), s !== void 0 && (v.limit = s), o !== void 0 && (v.order_by = o), n !== void 0 && (v.order_by_type = n), i !== void 0 && (v.filter = i), p !== void 0 && (v.with_path = p), c !== void 0 && (v.access_token = c), l !== void 0 && (v.library_secret = l), d !== void 0 && (v.user_id = d), h !== void 0 && (v.category = h), U(f, v);
      let C = A && A.headers ? A.headers : {};
      return m.headers = { ...F, ...C, ...u.headers }, {
        url: k(f),
        options: m
      };
    },
    /**
     * 用于空间文件数量统计。 需要拥有 admin 或 space_admin 权限。 
     * @summary 空间文件数量统计
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getFileCountInSpace: async (t, a, i, r, s = {}) => {
      I("getFileCountInSpace", "libraryId", t), I("getFileCountInSpace", "spaceId", a);
      const o = "/api/v1/space/{LibraryId}/{SpaceId}/file-count".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), n = new URL(o, O);
      let p;
      e && (p = e.baseOptions);
      const c = { method: "GET", ...p, ...s }, l = {}, d = {};
      i !== void 0 && (d.access_token = i), r !== void 0 && (d.library_secret = r), U(n, d);
      let h = p && p.headers ? p.headers : {};
      return c.headers = { ...l, ...h, ...s.headers }, {
        url: k(n),
        options: c
      };
    },
    /**
     * 用于查询媒体库中的租户空间数量
     * @summary 查询媒体库租户空间数量
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getLibrarySpaceCount: async (t, a, i, r, s = {}) => {
      I("getLibrarySpaceCount", "libraryId", t);
      const o = "/api/v1/space/{LibraryId}/count".replace("{LibraryId}", encodeURIComponent(String(t))), n = new URL(o, O);
      let p;
      e && (p = e.baseOptions);
      const c = { method: "GET", ...p, ...s }, l = {}, d = {};
      a !== void 0 && (d.access_token = a), i !== void 0 && (d.library_secret = i), r !== void 0 && (d.user_id = r), U(n, d);
      let h = p && p.headers ? p.headers : {};
      return c.headers = { ...l, ...h, ...s.headers }, {
        url: k(n),
        options: c
      };
    },
    /**
     * 用于查询租户空间的扩展属性
     * @summary 查询租户空间属性
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSpaceExtension: async (t, a, i, r, s, o = {}) => {
      I("getSpaceExtension", "libraryId", t), I("getSpaceExtension", "spaceId", a);
      const n = "/api/v1/space/{LibraryId}/{SpaceId}/extension".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "GET", ...c, ...o }, d = {}, h = {};
      i !== void 0 && (h.access_token = i), r !== void 0 && (h.library_secret = r), s !== void 0 && (h.user_id = s), U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, {
        url: k(p),
        options: l
      };
    },
    /**
     * 用于查询租户空间大小
     * @summary 查询租户空间大小
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getSpaceSize: async (t, a, i, r, s, o = {}) => {
      I("getSpaceSize", "libraryId", t), I("getSpaceSize", "spaceId", a);
      const n = "/api/v1/space/{LibraryId}/{SpaceId}/size".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "GET", ...c, ...o }, d = {}, h = {};
      i !== void 0 && (h.access_token = i), r !== void 0 && (h.library_secret = r), s !== void 0 && (h.user_id = s), U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, {
        url: k(p),
        options: l
      };
    },
    /**
     * 用于列出租户空间列表信息。如需列出所有租户空间，需要 admin 或 space_admin 权限，否则仅列出当前访问令牌所代表的用户所创建的租户空间。
     * @summary 列出租户空间
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [marker] 用于顺序列出分页的标识。
     * @param {number} [limit] 用于顺序列出分页时本地列出的项目数限制。
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    listSpace: async (t, a, i, r, s, o, n = {}) => {
      I("listSpace", "libraryId", t);
      const p = "/api/v1/space/{LibraryId}/list".replace("{LibraryId}", encodeURIComponent(String(t))), c = new URL(p, O);
      let l;
      e && (l = e.baseOptions);
      const d = { method: "GET", ...l, ...n }, h = {}, u = {};
      a !== void 0 && (u.access_token = a), i !== void 0 && (u.library_secret = i), r !== void 0 && (u.user_id = r), s !== void 0 && (u.marker = s), o !== void 0 && (u.limit = o), U(c, u);
      let y = l && l.headers ? l.headers : {};
      return d.headers = { ...h, ...y, ...n.headers }, {
        url: k(c),
        options: d
      };
    },
    /**
     * 用于设置租户空间的下载限速，要求权限：admin或space_admin
     * @summary 设置租户空间限速
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {SetSpaceTrafficLimitRequest} setSpaceTrafficLimitRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    setSpaceTrafficLimit: async (t, a, i, r, s, o = {}) => {
      I("setSpaceTrafficLimit", "libraryId", t), I("setSpaceTrafficLimit", "spaceId", a), I("setSpaceTrafficLimit", "setSpaceTrafficLimitRequest", i);
      const n = "/api/v1/space/{LibraryId}/{SpaceId}/traffic-limit".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "POST", ...c, ...o }, d = {}, h = {};
      r !== void 0 && (h.access_token = r), s !== void 0 && (h.library_secret = s), d["Content-Type"] = "application/json", U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, l.data = $(i, l, e), {
        url: k(p),
        options: l
      };
    },
    /**
     * 用于修改租户空间属性。 要求权限：非 acl 鉴权：admin 或 space_admin； acl 鉴权：无权限 
     * @summary 修改租户空间属性
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {UpdateSpaceExtensionRequest} [updateSpaceExtensionRequest] 租户空间的扩展属性
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    updateSpaceExtension: async (t, a, i, r, s, o, n = {}) => {
      I("updateSpaceExtension", "libraryId", t), I("updateSpaceExtension", "spaceId", a);
      const p = "/api/v1/space/{LibraryId}/{SpaceId}/extension".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))), c = new URL(p, O);
      let l;
      e && (l = e.baseOptions);
      const d = { method: "POST", ...l, ...n }, h = {}, u = {};
      i !== void 0 && (u.access_token = i), r !== void 0 && (u.library_secret = r), s !== void 0 && (u.user_id = s), h["Content-Type"] = "application/json", U(c, u);
      let y = l && l.headers ? l.headers : {};
      return d.headers = { ...h, ...y, ...n.headers }, d.data = $(o, d, e), {
        url: k(c),
        options: d
      };
    }
  };
}, Fe = function(e) {
  const t = Gn(e);
  return {
    /**
     * 用于创建租户空间。需要 admin 或 create_space 权限，有关权限详情请参见生成访问令牌接口。
     * @summary 创建租户空间
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {CreateSpaceRequest} [createSpaceRequest] 租户空间的扩展属性
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createSpace(a, i, r, s, o, n) {
      var d, h;
      const p = await t.createSpace(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["SpaceApi.createSpace"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    },
    /**
     * 用于删除租户空间。 要求权限：admin 或 delete_space 
     * @summary 删除租户空间
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {DeleteSpaceForceEnum} [force] 是否强制删除，1:强制删除，不判断space是否为空; 0:非强制删除，不允许删除非空的space
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteSpace(a, i, r, s, o, n, p) {
      var h, u;
      const c = await t.deleteSpace(a, i, r, s, o, n, p), l = (e == null ? void 0 : e.serverIndex) ?? 0, d = (u = (h = D["SpaceApi.deleteSpace"]) == null ? void 0 : h[l]) == null ? void 0 : u.url;
      return (y, f) => T(c, R, x, e)(y, d || f);
    },
    /**
     * 用于列出空间首页内容，会忽略目录的层级关系，列出空间下所有文件。 要求权限：read_only 或 space_admin 或 admin 
     * @summary 列出空间首页内容
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {GetContentsViewFilterEnum} filter 筛选方式
     * @param {string} [marker] 用于顺序列出分页的标识
     * @param {number} [limit] 用于顺序列出分页时本地列出的项目数限制
     * @param {GetContentsViewOrderByEnum} [orderBy] 排序字段
     * @param {GetContentsViewOrderByTypeEnum} [orderByType] 排序方式
     * @param {boolean} [withPath] 是否返回 path
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [category] 文件自定义的分类
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getContentsView(a, i, r, s, o, n, p, c, l, d, h, u, y) {
      var F, v;
      const f = await t.getContentsView(a, i, r, s, o, n, p, c, l, d, h, u, y), A = (e == null ? void 0 : e.serverIndex) ?? 0, m = (v = (F = D["SpaceApi.getContentsView"]) == null ? void 0 : F[A]) == null ? void 0 : v.url;
      return (C, _) => T(f, R, x, e)(C, m || _);
    },
    /**
     * 用于空间文件数量统计。 需要拥有 admin 或 space_admin 权限。 
     * @summary 空间文件数量统计
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getFileCountInSpace(a, i, r, s, o) {
      var l, d;
      const n = await t.getFileCountInSpace(a, i, r, s, o), p = (e == null ? void 0 : e.serverIndex) ?? 0, c = (d = (l = D["SpaceApi.getFileCountInSpace"]) == null ? void 0 : l[p]) == null ? void 0 : d.url;
      return (h, u) => T(n, R, x, e)(h, c || u);
    },
    /**
     * 用于查询媒体库中的租户空间数量
     * @summary 查询媒体库租户空间数量
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getLibrarySpaceCount(a, i, r, s, o) {
      var l, d;
      const n = await t.getLibrarySpaceCount(a, i, r, s, o), p = (e == null ? void 0 : e.serverIndex) ?? 0, c = (d = (l = D["SpaceApi.getLibrarySpaceCount"]) == null ? void 0 : l[p]) == null ? void 0 : d.url;
      return (h, u) => T(n, R, x, e)(h, c || u);
    },
    /**
     * 用于查询租户空间的扩展属性
     * @summary 查询租户空间属性
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getSpaceExtension(a, i, r, s, o, n) {
      var d, h;
      const p = await t.getSpaceExtension(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["SpaceApi.getSpaceExtension"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    },
    /**
     * 用于查询租户空间大小
     * @summary 查询租户空间大小
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getSpaceSize(a, i, r, s, o, n) {
      var d, h;
      const p = await t.getSpaceSize(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["SpaceApi.getSpaceSize"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    },
    /**
     * 用于列出租户空间列表信息。如需列出所有租户空间，需要 admin 或 space_admin 权限，否则仅列出当前访问令牌所代表的用户所创建的租户空间。
     * @summary 列出租户空间
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [marker] 用于顺序列出分页的标识。
     * @param {number} [limit] 用于顺序列出分页时本地列出的项目数限制。
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async listSpace(a, i, r, s, o, n, p) {
      var h, u;
      const c = await t.listSpace(a, i, r, s, o, n, p), l = (e == null ? void 0 : e.serverIndex) ?? 0, d = (u = (h = D["SpaceApi.listSpace"]) == null ? void 0 : h[l]) == null ? void 0 : u.url;
      return (y, f) => T(c, R, x, e)(y, d || f);
    },
    /**
     * 用于设置租户空间的下载限速，要求权限：admin或space_admin
     * @summary 设置租户空间限速
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {SetSpaceTrafficLimitRequest} setSpaceTrafficLimitRequest 
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async setSpaceTrafficLimit(a, i, r, s, o, n) {
      var d, h;
      const p = await t.setSpaceTrafficLimit(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["SpaceApi.setSpaceTrafficLimit"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    },
    /**
     * 用于修改租户空间属性。 要求权限：非 acl 鉴权：admin 或 space_admin； acl 鉴权：无权限 
     * @summary 修改租户空间属性
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {UpdateSpaceExtensionRequest} [updateSpaceExtensionRequest] 租户空间的扩展属性
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async updateSpaceExtension(a, i, r, s, o, n, p) {
      var h, u;
      const c = await t.updateSpaceExtension(a, i, r, s, o, n, p), l = (e == null ? void 0 : e.serverIndex) ?? 0, d = (u = (h = D["SpaceApi.updateSpaceExtension"]) == null ? void 0 : h[l]) == null ? void 0 : u.url;
      return (y, f) => T(c, R, x, e)(y, d || f);
    }
  };
}, Jn = class extends he {
  /**
   * 用于创建租户空间。需要 admin 或 create_space 权限，有关权限详情请参见生成访问令牌接口。
   * @summary 创建租户空间
   * @param {SpaceApiCreateSpaceRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  createSpace(e, t) {
    return Fe(this.configuration).createSpace(e.libraryId, e.accessToken, e.librarySecret, e.userId, e.createSpaceRequest, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于删除租户空间。 要求权限：admin 或 delete_space 
   * @summary 删除租户空间
   * @param {SpaceApiDeleteSpaceRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  deleteSpace(e, t) {
    return Fe(this.configuration).deleteSpace(e.libraryId, e.spaceId, e.accessToken, e.librarySecret, e.userId, e.force, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于列出空间首页内容，会忽略目录的层级关系，列出空间下所有文件。 要求权限：read_only 或 space_admin 或 admin 
   * @summary 列出空间首页内容
   * @param {SpaceApiGetContentsViewRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  getContentsView(e, t) {
    return Fe(this.configuration).getContentsView(e.libraryId, e.spaceId, e.filter, e.marker, e.limit, e.orderBy, e.orderByType, e.withPath, e.accessToken, e.librarySecret, e.userId, e.category, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于空间文件数量统计。 需要拥有 admin 或 space_admin 权限。 
   * @summary 空间文件数量统计
   * @param {SpaceApiGetFileCountInSpaceRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  getFileCountInSpace(e, t) {
    return Fe(this.configuration).getFileCountInSpace(e.libraryId, e.spaceId, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于查询媒体库中的租户空间数量
   * @summary 查询媒体库租户空间数量
   * @param {SpaceApiGetLibrarySpaceCountRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  getLibrarySpaceCount(e, t) {
    return Fe(this.configuration).getLibrarySpaceCount(e.libraryId, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于查询租户空间的扩展属性
   * @summary 查询租户空间属性
   * @param {SpaceApiGetSpaceExtensionRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  getSpaceExtension(e, t) {
    return Fe(this.configuration).getSpaceExtension(e.libraryId, e.spaceId, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于查询租户空间大小
   * @summary 查询租户空间大小
   * @param {SpaceApiGetSpaceSizeRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  getSpaceSize(e, t) {
    return Fe(this.configuration).getSpaceSize(e.libraryId, e.spaceId, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于列出租户空间列表信息。如需列出所有租户空间，需要 admin 或 space_admin 权限，否则仅列出当前访问令牌所代表的用户所创建的租户空间。
   * @summary 列出租户空间
   * @param {SpaceApiListSpaceRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  listSpace(e, t) {
    return Fe(this.configuration).listSpace(e.libraryId, e.accessToken, e.librarySecret, e.userId, e.marker, e.limit, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于设置租户空间的下载限速，要求权限：admin或space_admin
   * @summary 设置租户空间限速
   * @param {SpaceApiSetSpaceTrafficLimitRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  setSpaceTrafficLimit(e, t) {
    return Fe(this.configuration).setSpaceTrafficLimit(e.libraryId, e.spaceId, e.setSpaceTrafficLimitRequest, e.accessToken, e.librarySecret, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于修改租户空间属性。 要求权限：非 acl 鉴权：admin 或 space_admin； acl 鉴权：无权限 
   * @summary 修改租户空间属性
   * @param {SpaceApiUpdateSpaceExtensionRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  updateSpaceExtension(e, t) {
    return Fe(this.configuration).updateSpaceExtension(e.libraryId, e.spaceId, e.accessToken, e.librarySecret, e.userId, e.updateSpaceExtensionRequest, t).then((a) => a(this.axios, this.basePath));
  }
}, Kn = function(e) {
  return {
    /**
     * 用于查询媒体库级别耗时任务执行情况。任务的具体返回请参阅会产生异步任务的接口说明，部分接口会根据任务耗时情况返回同步或异步结果，此时异步结果通常与同步结果的格式保持一致；仅能查询到任务结束时间在最近30天的任务，更早期的任务无法查询；
     * @summary 查询媒体库任务接口
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} taskIdList 任务 ID 列表，用逗号分隔，例如 10 或 10,12,13
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    queryLibraryTask: async (t, a, i, r, s, o = {}) => {
      I("queryLibraryTask", "libraryId", t), I("queryLibraryTask", "taskIdList", a);
      const n = "/api/v1/task/{LibraryId}/{TaskIdList}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{TaskIdList}", encodeURIComponent(String(a))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "GET", ...c, ...o }, d = {}, h = {};
      i !== void 0 && (h.access_token = i), r !== void 0 && (h.library_secret = r), s !== void 0 && (h.user_id = s), U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, {
        url: k(p),
        options: l
      };
    },
    /**
     * 用于查询耗时任务执行情况。任务的具体返回请参阅会产生异步任务的接口说明，部分接口会根据任务耗时情况返回同步或异步结果，此时异步结果通常与同步结果的格式保持一致；仅能查询到任务结束时间在最近30天的任务，更早期的任务无法查询；
     * @summary 查询任务接口
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} taskIdList 任务 ID 列表，用逗号分隔，例如 10 或 10,12,13
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    queryTask: async (t, a, i, r, s, o, n = {}) => {
      I("queryTask", "libraryId", t), I("queryTask", "spaceId", a), I("queryTask", "taskIdList", i);
      const p = "/api/v1/task/{LibraryId}/{SpaceId}/{TaskIdList}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceId}", encodeURIComponent(String(a))).replace("{TaskIdList}", encodeURIComponent(String(i))), c = new URL(p, O);
      let l;
      e && (l = e.baseOptions);
      const d = { method: "GET", ...l, ...n }, h = {}, u = {};
      r !== void 0 && (u.access_token = r), s !== void 0 && (u.library_secret = s), o !== void 0 && (u.user_id = o), U(c, u);
      let y = l && l.headers ? l.headers : {};
      return d.headers = { ...h, ...y, ...n.headers }, {
        url: k(c),
        options: d
      };
    }
  };
}, Ui = function(e) {
  const t = Kn(e);
  return {
    /**
     * 用于查询媒体库级别耗时任务执行情况。任务的具体返回请参阅会产生异步任务的接口说明，部分接口会根据任务耗时情况返回同步或异步结果，此时异步结果通常与同步结果的格式保持一致；仅能查询到任务结束时间在最近30天的任务，更早期的任务无法查询；
     * @summary 查询媒体库任务接口
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} taskIdList 任务 ID 列表，用逗号分隔，例如 10 或 10,12,13
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async queryLibraryTask(a, i, r, s, o, n) {
      var d, h;
      const p = await t.queryLibraryTask(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["TaskApi.queryLibraryTask"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    },
    /**
     * 用于查询耗时任务执行情况。任务的具体返回请参阅会产生异步任务的接口说明，部分接口会根据任务耗时情况返回同步或异步结果，此时异步结果通常与同步结果的格式保持一致；仅能查询到任务结束时间在最近30天的任务，更早期的任务无法查询；
     * @summary 查询任务接口
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceId 空间 ID，如果媒体库为单租户模式，则该参数固定为连字符(-)；如果媒体库为多租户模式，则必须指定该参数
     * @param {string} taskIdList 任务 ID 列表，用逗号分隔，例如 10 或 10,12,13
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async queryTask(a, i, r, s, o, n, p) {
      var h, u;
      const c = await t.queryTask(a, i, r, s, o, n, p), l = (e == null ? void 0 : e.serverIndex) ?? 0, d = (u = (h = D["TaskApi.queryTask"]) == null ? void 0 : h[l]) == null ? void 0 : u.url;
      return (y, f) => T(c, R, x, e)(y, d || f);
    }
  };
}, Xn = class extends he {
  /**
   * 用于查询媒体库级别耗时任务执行情况。任务的具体返回请参阅会产生异步任务的接口说明，部分接口会根据任务耗时情况返回同步或异步结果，此时异步结果通常与同步结果的格式保持一致；仅能查询到任务结束时间在最近30天的任务，更早期的任务无法查询；
   * @summary 查询媒体库任务接口
   * @param {TaskApiQueryLibraryTaskRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  queryLibraryTask(e, t) {
    return Ui(this.configuration).queryLibraryTask(e.libraryId, e.taskIdList, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于查询耗时任务执行情况。任务的具体返回请参阅会产生异步任务的接口说明，部分接口会根据任务耗时情况返回同步或异步结果，此时异步结果通常与同步结果的格式保持一致；仅能查询到任务结束时间在最近30天的任务，更早期的任务无法查询；
   * @summary 查询任务接口
   * @param {TaskApiQueryTaskRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  queryTask(e, t) {
    return Ui(this.configuration).queryTask(e.libraryId, e.spaceId, e.taskIdList, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
}, Wn = function(e) {
  return {
    /**
     * 用于生成调用智能媒资托管服务的访问令牌（Access Token）。
     * @summary 生成访问令牌
     * @param {string} libraryId 媒体库ID，在媒体托管控制台创建媒体库后获取。
     * @param {string} librarySecret 媒体库密钥，在媒体托管控制台创建媒体库后获取。
     * @param {string} [spaceId] 空间ID，可同时指定多个空间ID，使用英文逗号（,）分隔。
     * @param {string} [userId] 用户身份识别，由业务后台自行控制。
     * @param {string} [clientId] 客户端识别，由业务后台自行控制。
     * @param {string} [sessionId] SessionId，由业务后台自行控制。
     * @param {number} [period] 令牌有效时长及每次使用令牌后自动续期的有效时长，单位为秒。
     * @param {CreateTokenGrantEnum} [grant] 授予的权限，如为空则只授予读取权限。
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    createToken: async (t, a, i, r, s, o, n, p, c = {}) => {
      I("createToken", "libraryId", t), I("createToken", "librarySecret", a);
      const l = "/api/v1/token", d = new URL(l, O);
      let h;
      e && (h = e.baseOptions);
      const u = { method: "GET", ...h, ...c }, y = {}, f = {};
      t !== void 0 && (f.library_id = t), a !== void 0 && (f.library_secret = a), i !== void 0 && (f.space_id = i), r !== void 0 && (f.user_id = r), s !== void 0 && (f.client_id = s), o !== void 0 && (f.session_id = o), n !== void 0 && (f.period = n), p !== void 0 && (f.grant = p), U(d, f);
      let A = h && h.headers ? h.headers : {};
      return u.headers = { ...y, ...A, ...c.headers }, {
        url: k(d),
        options: u
      };
    },
    /**
     * 用于删除指定的访问令牌（Access Token）。删除指定访问令牌无需校验媒体库密钥，故可在客户端调用该接口。
     * @summary 删除访问令牌
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} accessToken 访问令牌
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteToken: async (t, a, i = {}) => {
      I("deleteToken", "libraryId", t), I("deleteToken", "accessToken", a);
      const r = "/api/v1/token/{LibraryId}/{AccessToken}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{AccessToken}", encodeURIComponent(String(a))), s = new URL(r, O);
      let o;
      e && (o = e.baseOptions);
      const n = { method: "DELETE", ...o, ...i }, p = {};
      U(s, {});
      let l = o && o.headers ? o.headers : {};
      return n.headers = { ...p, ...l, ...i.headers }, {
        url: k(s),
        options: n
      };
    },
    /**
     * 用于删除特定用户的所有访问令牌（Access Token）。调用该接口需要用到媒体库密钥，所以必须在后端调用该接口以保证密钥安全；必须指定 UserId 参数，因此在创建访问令牌时，如果后续计划主动删除对应的访问令牌，则在创建时也需要指定 UserId；
     * @summary 删除特定用户的所有访问令牌
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} librarySecret 媒体库密钥
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [clientId] 客户端识别，多个 ClientId 用英文逗号分隔，一次最多不超过 100 个
     * @param {string} [sessionId] 会话识别，多个 SessionId 用英文逗号分隔，一次最多不超过 100 个
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    deleteUserTokens: async (t, a, i, r, s, o = {}) => {
      I("deleteUserTokens", "libraryId", t), I("deleteUserTokens", "librarySecret", a);
      const n = "/api/v1/token/{LibraryId}".replace("{LibraryId}", encodeURIComponent(String(t))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "DELETE", ...c, ...o }, d = {}, h = {};
      i !== void 0 && (h.user_id = i), a !== void 0 && (h.library_secret = a), r !== void 0 && (h.client_id = r), s !== void 0 && (h.session_id = s), U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, {
        url: k(p),
        options: l
      };
    },
    /**
     * 用于续期访问令牌（Access Token）。续期时不支持指定新的有效时长，仅按照获取令牌时指定的有效时长续期。
     * @summary 续期访问令牌
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} accessToken 访问令牌
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    renewToken: async (t, a, i = {}) => {
      I("renewToken", "libraryId", t), I("renewToken", "accessToken", a);
      const r = "/api/v1/token/{LibraryId}/{AccessToken}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{AccessToken}", encodeURIComponent(String(a))), s = new URL(r, O);
      let o;
      e && (o = e.baseOptions);
      const n = { method: "POST", ...o, ...i }, p = {};
      U(s, {});
      let l = o && o.headers ? o.headers : {};
      return n.headers = { ...p, ...l, ...i.headers }, {
        url: k(s),
        options: n
      };
    }
  };
}, xt = function(e) {
  const t = Wn(e);
  return {
    /**
     * 用于生成调用智能媒资托管服务的访问令牌（Access Token）。
     * @summary 生成访问令牌
     * @param {string} libraryId 媒体库ID，在媒体托管控制台创建媒体库后获取。
     * @param {string} librarySecret 媒体库密钥，在媒体托管控制台创建媒体库后获取。
     * @param {string} [spaceId] 空间ID，可同时指定多个空间ID，使用英文逗号（,）分隔。
     * @param {string} [userId] 用户身份识别，由业务后台自行控制。
     * @param {string} [clientId] 客户端识别，由业务后台自行控制。
     * @param {string} [sessionId] SessionId，由业务后台自行控制。
     * @param {number} [period] 令牌有效时长及每次使用令牌后自动续期的有效时长，单位为秒。
     * @param {CreateTokenGrantEnum} [grant] 授予的权限，如为空则只授予读取权限。
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async createToken(a, i, r, s, o, n, p, c, l) {
      var y, f;
      const d = await t.createToken(a, i, r, s, o, n, p, c, l), h = (e == null ? void 0 : e.serverIndex) ?? 0, u = (f = (y = D["TokenApi.createToken"]) == null ? void 0 : y[h]) == null ? void 0 : f.url;
      return (A, m) => T(d, R, x, e)(A, u || m);
    },
    /**
     * 用于删除指定的访问令牌（Access Token）。删除指定访问令牌无需校验媒体库密钥，故可在客户端调用该接口。
     * @summary 删除访问令牌
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} accessToken 访问令牌
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteToken(a, i, r) {
      var p, c;
      const s = await t.deleteToken(a, i, r), o = (e == null ? void 0 : e.serverIndex) ?? 0, n = (c = (p = D["TokenApi.deleteToken"]) == null ? void 0 : p[o]) == null ? void 0 : c.url;
      return (l, d) => T(s, R, x, e)(l, n || d);
    },
    /**
     * 用于删除特定用户的所有访问令牌（Access Token）。调用该接口需要用到媒体库密钥，所以必须在后端调用该接口以保证密钥安全；必须指定 UserId 参数，因此在创建访问令牌时，如果后续计划主动删除对应的访问令牌，则在创建时也需要指定 UserId；
     * @summary 删除特定用户的所有访问令牌
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} librarySecret 媒体库密钥
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {string} [clientId] 客户端识别，多个 ClientId 用英文逗号分隔，一次最多不超过 100 个
     * @param {string} [sessionId] 会话识别，多个 SessionId 用英文逗号分隔，一次最多不超过 100 个
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async deleteUserTokens(a, i, r, s, o, n) {
      var d, h;
      const p = await t.deleteUserTokens(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["TokenApi.deleteUserTokens"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    },
    /**
     * 用于续期访问令牌（Access Token）。续期时不支持指定新的有效时长，仅按照获取令牌时指定的有效时长续期。
     * @summary 续期访问令牌
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} accessToken 访问令牌
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async renewToken(a, i, r) {
      var p, c;
      const s = await t.renewToken(a, i, r), o = (e == null ? void 0 : e.serverIndex) ?? 0, n = (c = (p = D["TokenApi.renewToken"]) == null ? void 0 : p[o]) == null ? void 0 : c.url;
      return (l, d) => T(s, R, x, e)(l, n || d);
    }
  };
}, Zn = class extends he {
  /**
   * 用于生成调用智能媒资托管服务的访问令牌（Access Token）。
   * @summary 生成访问令牌
   * @param {TokenApiCreateTokenRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  createToken(e, t) {
    return xt(this.configuration).createToken(e.libraryId, e.librarySecret, e.spaceId, e.userId, e.clientId, e.sessionId, e.period, e.grant, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于删除指定的访问令牌（Access Token）。删除指定访问令牌无需校验媒体库密钥，故可在客户端调用该接口。
   * @summary 删除访问令牌
   * @param {TokenApiDeleteTokenRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  deleteToken(e, t) {
    return xt(this.configuration).deleteToken(e.libraryId, e.accessToken, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于删除特定用户的所有访问令牌（Access Token）。调用该接口需要用到媒体库密钥，所以必须在后端调用该接口以保证密钥安全；必须指定 UserId 参数，因此在创建访问令牌时，如果后续计划主动删除对应的访问令牌，则在创建时也需要指定 UserId；
   * @summary 删除特定用户的所有访问令牌
   * @param {TokenApiDeleteUserTokensRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  deleteUserTokens(e, t) {
    return xt(this.configuration).deleteUserTokens(e.libraryId, e.librarySecret, e.userId, e.clientId, e.sessionId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于续期访问令牌（Access Token）。续期时不支持指定新的有效时长，仅按照获取令牌时指定的有效时长续期。
   * @summary 续期访问令牌
   * @param {TokenApiRenewTokenRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  renewToken(e, t) {
    return xt(this.configuration).renewToken(e.libraryId, e.accessToken, t).then((a) => a(this.axios, this.basePath));
  }
}, Yn = function(e) {
  return {
    /**
     * 用于查询媒体库级别的容量信息。 要求权限：admin 
     * @summary 查询媒体库容量信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getLibraryUsage: async (t, a, i, r, s = {}) => {
      I("getLibraryUsage", "libraryId", t);
      const o = "/api/v1/usage/{LibraryId}".replace("{LibraryId}", encodeURIComponent(String(t))), n = new URL(o, O);
      let p;
      e && (p = e.baseOptions);
      const c = { method: "GET", ...p, ...s }, l = {}, d = {};
      a !== void 0 && (d.access_token = a), i !== void 0 && (d.library_secret = i), r !== void 0 && (d.user_id = r), U(n, d);
      let h = p && p.headers ? p.headers : {};
      return c.headers = { ...l, ...h, ...s.headers }, {
        url: k(n),
        options: c
      };
    },
    /**
     * 用于批量查询列出租户空间容量信息。 要求权限：admin 或 space_admin 如果要查询任意空间的容量信息则需要 admin 权限，如果是 space_admin 权限，则只能查询访问令牌指定的租户空间的容量信息 
     * @summary 批量查询列出租户空间容量信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceIds 空间列表，以逗号分隔，如 space1,space2
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    getUsage: async (t, a, i, r, s, o = {}) => {
      I("getUsage", "libraryId", t), I("getUsage", "spaceIds", a);
      const n = "/api/v1/usage/{LibraryId}/{SpaceIds}".replace("{LibraryId}", encodeURIComponent(String(t))).replace("{SpaceIds}", encodeURIComponent(String(a))), p = new URL(n, O);
      let c;
      e && (c = e.baseOptions);
      const l = { method: "GET", ...c, ...o }, d = {}, h = {};
      i !== void 0 && (h.access_token = i), r !== void 0 && (h.library_secret = r), s !== void 0 && (h.user_id = s), U(p, h);
      let u = c && c.headers ? c.headers : {};
      return l.headers = { ...d, ...u, ...o.headers }, {
        url: k(p),
        options: l
      };
    }
  };
}, ki = function(e) {
  const t = Yn(e);
  return {
    /**
     * 用于查询媒体库级别的容量信息。 要求权限：admin 
     * @summary 查询媒体库容量信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getLibraryUsage(a, i, r, s, o) {
      var l, d;
      const n = await t.getLibraryUsage(a, i, r, s, o), p = (e == null ? void 0 : e.serverIndex) ?? 0, c = (d = (l = D["UsageApi.getLibraryUsage"]) == null ? void 0 : l[p]) == null ? void 0 : d.url;
      return (h, u) => T(n, R, x, e)(h, c || u);
    },
    /**
     * 用于批量查询列出租户空间容量信息。 要求权限：admin 或 space_admin 如果要查询任意空间的容量信息则需要 admin 权限，如果是 space_admin 权限，则只能查询访问令牌指定的租户空间的容量信息 
     * @summary 批量查询列出租户空间容量信息
     * @param {string} libraryId 媒体库 ID，必选参数
     * @param {string} spaceIds 空间列表，以逗号分隔，如 space1,space2
     * @param {string} [accessToken] 访问令牌，对于公有读媒体库或租户空间，可不指定该参数，否则必须指定该参数
     * @param {string} [librarySecret] 访问媒体库密钥，可选参数
     * @param {string} [userId] 用户身份识别，当访问令牌对应的权限为管理员权限且申请访问令牌时的用户身份识别为空时用来临时指定用户身份，详情请参阅生成访问令牌接口，可选参数
     * @param {*} [options] Override http request option.
     * @throws {RequiredError}
     */
    async getUsage(a, i, r, s, o, n) {
      var d, h;
      const p = await t.getUsage(a, i, r, s, o, n), c = (e == null ? void 0 : e.serverIndex) ?? 0, l = (h = (d = D["UsageApi.getUsage"]) == null ? void 0 : d[c]) == null ? void 0 : h.url;
      return (u, y) => T(p, R, x, e)(u, l || y);
    }
  };
}, qn = class extends he {
  /**
   * 用于查询媒体库级别的容量信息。 要求权限：admin 
   * @summary 查询媒体库容量信息
   * @param {UsageApiGetLibraryUsageRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  getLibraryUsage(e, t) {
    return ki(this.configuration).getLibraryUsage(e.libraryId, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
  /**
   * 用于批量查询列出租户空间容量信息。 要求权限：admin 或 space_admin 如果要查询任意空间的容量信息则需要 admin 权限，如果是 space_admin 权限，则只能查询访问令牌指定的租户空间的容量信息 
   * @summary 批量查询列出租户空间容量信息
   * @param {UsageApiGetUsageRequest} requestParameters Request parameters.
   * @param {*} [options] Override http request option.
   * @throws {RequiredError}
   */
  getUsage(e, t) {
    return ki(this.configuration).getUsage(e.libraryId, e.spaceIds, e.accessToken, e.librarySecret, e.userId, t).then((a) => a(this.axios, this.basePath));
  }
}, el = class {
  constructor(e = {}) {
    var t;
    this.apiKey = e.apiKey, this.username = e.username, this.password = e.password, this.accessToken = e.accessToken, this.awsv4 = e.awsv4, this.basePath = e.basePath, this.serverIndex = e.serverIndex, this.baseOptions = {
      ...e.baseOptions,
      headers: {
        ...(t = e.baseOptions) == null ? void 0 : t.headers
      }
    }, this.formDataCtor = e.formDataCtor;
  }
  /**
   * Check if the given MIME is a JSON MIME.
   * JSON MIME examples:
   *   application/json
   *   application/json; charset=UTF8
   *   APPLICATION/JSON
   *   application/vnd.company+json
   * @param mime - MIME (Multipurpose Internet Mail Extensions)
   * @return True if the given MIME is JSON, false otherwise.
   */
  isJsonMime(e) {
    const t = new RegExp("^(application/json|[^;/ 	]+/[^;/ 	]+[+]json)[ 	]*(;.*)?$", "i");
    return e !== null && (t.test(e) || e.toLowerCase() === "application/json-patch+json");
  }
}, tl = "1.0.6", al = tl, il = "smh-js-sdk", rl = () => `${il}/${al}`;
function Gt(e) {
  var i, r;
  const t = ((i = e == null ? void 0 : e.response) == null ? void 0 : i.status) || (e == null ? void 0 : e.status) || (e == null ? void 0 : e.statusCode), a = t === 403 || ((r = e == null ? void 0 : e.message) == null ? void 0 : r.includes("Request has expired"));
  return {
    statusCode: t,
    isExpired: a
  };
}
var Ca = /* @__PURE__ */ ((e) => (e.FILE_NOT_FOUND = "FileNotFound", e.FILE_MODIFIED = "FileModified", e.FILE_SIZE_MISMATCH = "FileSizeMismatch", e.FILE_CRC64_MISMATCH = "FileCrc64Mismatch", e.FILE_TOO_LARGE = "FileTooLarge", e.INVALID_FILE = "InvalidFile", e.UPLOAD_FAILED = "UploadFailed", e.UPLOAD_CANCELED = "UploadCanceled", e.UPLOAD_PAUSED = "UploadPaused", e.PART_UPLOAD_FAILED = "PartUploadFailed", e.RENEW_UPLOAD_FAILED = "RenewUploadFailed", e.DOWNLOAD_FAILED = "DownloadFailed", e.DOWNLOAD_CANCELED = "DownloadCanceled", e.DOWNLOAD_PAUSED = "DownloadPaused", e.INVALID_PARAMETER = "InvalidParameter", e.NETWORK_ERROR = "NetworkError", e.REQUEST_TIMEOUT = "RequestTimeout", e.SERVER_ERROR = "ServerError", e.OPERATION_FAILED = "OperationFailed", e))(Ca || {}), It = class _a extends Error {
  constructor(t, a, i, r) {
    let s;
    typeof t == "string" ? Object.values(Ca).includes(t) ? s = a || t : s = t : t instanceof Error || typeof t == "object" && "message" in t ? s = a || t.message : s = a || "Unknown error", super(s), this.name = "SMHError", this.response = {}, this.name = "SMHError", Object.setPrototypeOf(this, _a.prototype), this.timestamp = Date.now(), typeof t == "string" && Object.values(Ca).includes(t) ? (this.code = t, this.cause = i, r && Object.assign(this.response, r)) : t instanceof _a ? (this.code = t.code, this.status = t.status, this.reqId = t.reqId, this.cause = t.cause, Object.assign(this.response, t.response)) : t instanceof Error ? (this.code = "OperationFailed", this.cause = t) : typeof t == "object" && "code" in t ? (this.code = t.code, this.status = t.status, this.reqId = t.reqId, this.cause = t.cause, t.response && Object.assign(this.response, t.response)) : this.code = "OperationFailed", r && Object.assign(this.response, r), this.cause && this.cause.stack && (this.stack = `${this.stack}
Caused by: ${this.cause.stack}`);
  }
  /**
   * 转换为日志字符串
   */
  toLogString() {
    const t = [];
    if (t.push(`[${this.code}] ${this.message}`), this.status && t.push(`Status: ${this.status}`), this.reqId && t.push(`ReqId: ${this.reqId}`), Object.keys(this.response).length > 0) {
      t.push("Response:");
      for (const [a, i] of Object.entries(this.response))
        typeof i == "object" ? t.push(`  ${a}: ${JSON.stringify(i)}`) : t.push(`  ${a}: ${i}`);
    }
    return this.cause && t.push(`Caused by: ${this.cause.message}`), t.join(`
`);
  }
  /**
   * 转换为 JSON 格式
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      status: this.status,
      reqId: this.reqId,
      response: this.response,
      timestamp: this.timestamp,
      cause: this.cause ? {
        name: this.cause.name,
        message: this.cause.message
      } : void 0
    };
  }
};
function br(e) {
  const t = {
    isNetworkError: !1
  }, a = e == null ? void 0 : e.response, i = !!(e != null && e.isAxiosError || e != null && e.config || e != null && e.request || a), r = (l, d) => {
    if (!l) return;
    const h = d.toLowerCase(), u = l[h] ?? l[d];
    if (typeof u == "string" && u) return u;
    if (Array.isArray(u) && typeof u[0] == "string") return u[0];
    if (typeof l.get == "function") {
      const y = l.get(h);
      if (typeof y == "string" && y) return y;
      if (Array.isArray(y) && typeof y[0] == "string") return y[0];
    }
  };
  if (a) {
    t.status = a.status;
    const l = a.data;
    l && typeof l == "object" ? (t.responseData = l, l.code && (t.serverCode = l.code), l.message && (t.serverMessage = l.message), t.reqId = l.requestId || l.reqId || l.requestID) : typeof l == "string" && l.length > 0 && (t.serverMessage = l);
    const d = a.headers;
    t.reqId = t.reqId || r(d, "x-request-id") || r(d, "x-smh-request-id") || r(d, "x-cos-request-id") || r(d, "requestid") || r(d, "reqid");
  }
  const s = typeof (e == null ? void 0 : e.code) == "string" ? e.code : "", o = i && !a, n = [
    "ERR_NETWORK",
    "ECONNABORTED",
    "ETIMEDOUT",
    "ENOTFOUND",
    "EAI_AGAIN",
    "ECONNREFUSED",
    "ECONNRESET",
    "EHOSTUNREACH",
    "ENETUNREACH",
    "EPIPE"
  ].includes(s), p = typeof (e == null ? void 0 : e.message) == "string" ? e.message : "", c = /network error|timeout|timed out|getaddrinfo|socket hang up|connection/i.test(p);
  return o && (n || c || e != null && e.request) && (t.isNetworkError = !0), t;
}
function Y(e, t, a, i, r) {
  const s = { ...i };
  return (r == null ? void 0 : r.status) != null && s.status == null && (s.status = r.status), r != null && r.reqId && s.requestId == null && (s.requestId = r.reqId), new It({
    code: e,
    message: t,
    cause: a,
    status: r == null ? void 0 : r.status,
    reqId: r == null ? void 0 : r.reqId,
    response: s,
    timestamp: Date.now()
  });
}
var sl = {
  // ─── 400 Bad Request ──────────────────────────────────
  BadRequest: "请求无效，请检查后重试",
  EmptyLibraryIdOrSecret: "媒体库配置信息缺失",
  EmptyLibrarySecret: "媒体库密钥不能为空",
  EmptyLibraryId: "媒体库 ID 不能为空",
  EmptySpaceId: "空间 ID 不能为空",
  EmptyFileName: "文件名不能为空",
  EmptyCosUploadId: "上传标识缺失，请重新上传",
  EmptyAccessToken: "访问令牌不能为空，请先登录",
  NotMultiSpaceLibrary: "当前媒体库不支持多空间操作",
  MultipartUploadIncomplete: "分片上传尚未完成，无法确认",
  UploadIncomplete: "文件上传尚未完成，无法确认",
  DirectoryNameLengthExceed: "文件夹名称过长，请缩短后重试",
  DirectoryNotAllowed: "当前媒体库不允许创建文件夹",
  RootDirectoryNotAllowed: "不允许对根目录执行此操作",
  DirectoryLevelExceed: "当前媒体库只允许创建一级文件夹",
  FileNameLengthExceed: "文件名过长，请缩短后重试",
  ExtnameNotAllowed: "当前媒体库不允许此文件类型",
  UploadToRootDirectoryNotAllowed: "不允许将文件上传到根目录",
  SourceDirectoryIsParentOfDestination: "不能将文件夹移动到其子文件夹中",
  InvalidSourceDirectory: "源文件夹无效",
  InvalidSourceFile: "源文件无效",
  InvalidSpaceOrDirectoryPath: "空间或目录路径不存在",
  InvalidConflictResolutionStrategy: "冲突处理策略无效",
  ParamInvalid: "请求参数无效，请检查后重试",
  SpaceIdInvalid: "空间 ID 格式无效",
  IllegalFileName: '文件名包含非法字符（\\ / : * ? " < > |）',
  FileTypeNotMatched: "目标文件类型与源文件不匹配",
  BadCrc64: "文件校验失败，数据可能已损坏，请重新上传",
  QuotaLimitReached: "存储空间不足，请清理文件或扩容",
  FileUncompressNotAllowed: "仅支持解压压缩包文件",
  SearchTooComplex: "搜索条件过于复杂，请简化后重试",
  SearchNotEnabled: "搜索功能未启用",
  RecycleBinNotEnabled: "回收站功能未启用",
  QuotaSpacesInvalid: "配额关联的空间无效",
  SearchIdInvalid: "搜索标识无效",
  InvalidDestinationPath: "目标路径无效",
  MultipartUploadPartTooSmall: "分片大小过小，无法完成上传",
  IncompleteBody: "请求数据不完整，请重试",
  TooManyItems: "批量操作数量超过上限（最多 1000 项）",
  NoItemsProvided: "批量操作至少需要一项内容",
  InvalidTimeFormat: "时间格式不正确",
  OverwriteFileNotAllowed: "开启历史版本后不允许覆盖文件",
  InvalidFileHistoryCount: "文件历史版本数量参数无效",
  InvalidFileHistoryExpireDay: "文件历史版本过期天数参数无效",
  InvalidFileHistoryMergeInterval: "版本合并间隔参数无效（5～600 秒）",
  SymlinkDepthLimitExceeded: "快捷方式嵌套层级超出限制",
  SymlinkToDirectoryNotAllowed: "快捷方式不能指向文件夹",
  SymlinkOverwriteConflict: "快捷方式和普通文件不能互相覆盖",
  UnsupportedSourceFormat: "不支持的源文件格式，请使用 .txt、.doc 或 .docx 文件",
  UnsupportedTargetFormat: "目标文件格式必须为 PDF",
  FunctionNotEnabled: "该功能未启用",
  UnsupportedFileType: "文件夹或快捷方式不支持历史版本",
  QuotaCapacityLessThanSize: "配额容量不能小于当前已使用空间",
  QuotaCapacityRequired: "需要指定配额容量",
  InvalidDirectoryStatsType: "目录统计类型无效",
  ResourceMigrationNotEnabled: "资源迁移功能未启用",
  ResourceNotSupported: "不支持的资源类型",
  ResolutionUpScalingNotAllowed: "目标分辨率不能高于原视频分辨率",
  M3u8OnlyMediaPlaylistAllowed: "仅支持 M3U8 媒体播放列表",
  M3u8HttpKeyNotAllowed: "M3U8 不允许使用 HTTP 密钥",
  M3u8HttpSegmentNotAllowed: "M3U8 不允许使用 HTTP 分段",
  M3u8PlaylistInvalid: "M3U8 播放列表无效",
  M3u8SegmentsInvalid: "M3U8 分段无效",
  M3u8InfoMapUnknown: "M3U8 信息映射未知",
  M3u8InfoMapFieldUnknown: "M3U8 信息映射字段未知",
  OnlyVideoCanBeTranscoded: "仅视频文件支持转码",
  CaptchaInvalid: "验证码无效，请重新输入",
  WatermarkNotEnabled: "水印功能未启用",
  GraphicCaptchaFailed: "图形验证码验证失败",
  CloseOldList: "旧版接口已关闭，请使用新版接口",
  // ─── 403 Forbidden ───────────────────────────────────
  NoPermission: "没有操作权限",
  AccessTokenNotMatchLibrary: "访问令牌与媒体库不匹配",
  AccessTokenNotMatchSpace: "访问令牌与空间不匹配",
  AccessTokenVersionNotMatch: "访问令牌版本不匹配",
  InvalidAccessToken: "访问令牌无效或已过期，请重新登录",
  ReadForbidden: "没有读取权限",
  WriteForbidden: "没有写入权限",
  LibraryServiceExpired: "媒体库服务已过期",
  LibraryInitializing: "媒体库正在初始化，请稍后重试",
  OperationOnRawM3u8IsForbidden: "不允许操作原始 M3U8 文件",
  SpaceBanned: "空间已被禁用",
  ShareDisabled: "分享功能已关闭",
  ShareExpired: "分享链接已过期",
  ShareAuditing: "分享链接正在审核中",
  ShareTokenInvalid: "分享令牌无效",
  ExtractionCodeInvalid: "提取码错误",
  LoginRequired: "请先登录后访问",
  ShareAccessDenied: "您无权访问此分享",
  AnonymousNotAllowed: "不允许匿名用户访问",
  CannotPreview: "该文件不支持预览",
  CannotDownload: "该文件不允许下载",
  CannotSaveToNetDisk: "不允许保存到网盘",
  CannotModify: "该文件不允许修改",
  ShareServiceDisabled: "分享服务已关闭",
  // ─── 404 Not Found ───────────────────────────────────
  ConfirmKeyNotFound: "上传确认信息未找到，请重新上传",
  RouteNotFound: "请求的接口不存在",
  LibraryNotFound: "媒体库不存在",
  SpaceNotFound: "空间不存在",
  DirectoryNotFound: "文件夹不存在",
  SourceDirectoryNotFound: "源文件夹不存在",
  SourceFileNotFound: "源文件不存在",
  UploadNotFound: "上传任务不存在或已过期",
  FileNotFound: "文件不存在",
  PathNotFound: "路径不存在",
  MarkerNotFound: "分页标记未找到",
  NoQuota: "该空间未设置配额",
  QuotaNotFound: "配额不存在",
  WrongLibraryIdOrSecret: "媒体库 ID 或密钥错误",
  FavoriteIdNotFound: "收藏记录不存在",
  FileRemovedByQuota: "文件因超出配额已被删除",
  CosObjectNonexistent: "文件存储对象不存在",
  RootLinkFileNotFound: "快捷方式指向的文件不存在",
  TrafficStatsNotFound: "流量统计信息不存在",
  M3u8Converting: "M3U8 正在转码中，请稍后重试",
  ShareNotFound: "分享不存在",
  FileNotInShare: "文件不在分享范围内",
  ShareFileEmpty: "分享中没有文件",
  // ─── 408 Request Timeout ─────────────────────────────
  ReadRequestTimeout: "请求超时，请重试",
  // ─── 409 Conflict ────────────────────────────────────
  DuplicateQuota: "该空间已存在配额",
  UploadComplete: "上传已完成，无法重复操作",
  SameNameDirectoryOrFileExists: "已存在同名文件或文件夹",
  DuplicateFavoriteRecord: "该文件已收藏",
  SpaceNotEmpty: "空间非空，无法删除",
  PathConflict: "操作冲突，请避免同时操作同一文件",
  RenameTooManyTimes: "重命名次数过多，请稍后重试",
  CircleSymlink: "检测到快捷方式循环引用",
  ShareHasBeenUpdated: "分享已被更新，请刷新后重试",
  // ─── 413 / 414 / 429 / 431 ──────────────────────────
  RequestEntityTooLarge: "请求内容过大",
  URITooLong: "请求地址过长",
  RateLimitExceeded: "操作过于频繁，请稍后重试",
  HeaderFieldsTooLarge: "请求头信息过大",
  // ─── 451 ─────────────────────────────────────────────
  SensitiveContentRecognized: "内容包含敏感信息，操作被拒绝",
  // ─── 499 ─────────────────────────────────────────────
  ClientDisconnected: "连接已断开",
  // ─── 500 / 503 ──────────────────────────────────────
  ServerOverloaded: "服务器繁忙，请稍后重试",
  InternalServerError: "服务器内部错误，请稍后重试",
  RequestTimeout: "服务器处理超时，请稍后重试"
};
function ol(e, t) {
  return e ? sl[e] ?? t : t;
}
function La(e, t, a, i) {
  if (e instanceof It)
    return e;
  const r = br(e), s = ol(r.serverCode) || r.serverMessage || (e == null ? void 0 : e.message) || a;
  let o;
  return r.isNetworkError ? o = "NetworkError" : r.status != null && r.status >= 500 ? o = "ServerError" : o = t, Y(
    o,
    s,
    e instanceof Error ? e : void 0,
    {
      ...i,
      ...r.serverCode && { serverCode: r.serverCode },
      ...r.serverMessage && { serverMessage: r.serverMessage },
      ...r.responseData && { responseData: r.responseData },
      ...r.reqId && { requestId: r.reqId }
    },
    { status: r.status, reqId: r.reqId }
  );
}
function pe(e) {
  if (e === 0) return "0 B";
  const t = 1024, a = ["B", "KB", "MB", "GB", "TB"], i = Math.floor(Math.log(e) / Math.log(t));
  return (e / Math.pow(t, i)).toFixed(2) + " " + a[i];
}
function vr(e) {
  const t = Math.floor(e / 1e3), a = Math.floor(t / 60), i = Math.floor(a / 60);
  return i > 0 ? `${i}h ${a % 60}m ${t % 60}s` : a > 0 ? `${a}m ${t % 60}s` : `${t}s`;
}
var Dt = /* @__PURE__ */ Symbol("getList"), nl = class {
  constructor() {
    this.listeners = {};
  }
  [Dt](e) {
    return this.listeners[e] || (this.listeners[e] = []), this.listeners[e];
  }
  on(e, t) {
    return this[Dt](e).push(t), this;
  }
  once(e, t) {
    if (!t) return this;
    const a = t;
    return a.once = !0, this.on(e, a), this;
  }
  off(e, t) {
    const a = this[Dt](e);
    if (t === "*")
      for (let i = a.length - 1; i >= 0; i -= 1)
        a.splice(i, 1);
    else
      for (let i = a.length - 1; i >= 0; i -= 1)
        t === a[i] && a.splice(i, 1);
    return this;
  }
  emit(e, t) {
    const a = this[Dt](e).map((i) => i);
    for (let i = 0; i < a.length; i += 1) {
      const r = a[i];
      r(t), a[i].once && this.off(e, a[i]);
    }
    return this;
  }
}, ll = nl;
async function Er(e, t, a, i) {
  const r = new Array(e.length);
  let s = 0, o = 0, n = null;
  const p = (i == null ? void 0 : i.shouldStop) || (() => !1);
  return new Promise((c, l) => {
    let d = 0;
    const h = () => {
      for (; o < t && s < e.length && !n && !p(); ) {
        const u = s++, y = e[u];
        o++, (async () => {
          try {
            if (p() || n)
              return;
            r[u] = await a(y);
          } catch (f) {
            n || (n = f);
          } finally {
            o--, d++, n ? o === 0 && l(n) : d === e.length ? c(r) : p() ? o === 0 && c(r) : h();
          }
        })();
      }
      (e.length === 0 || o === 0 && s === 0 && p()) && c(r);
    };
    h();
  });
}
function Mt(e, t, a, i) {
  function r(s) {
    return s instanceof a ? s : new a(function(o) {
      o(s);
    });
  }
  return new (a || (a = Promise))(function(s, o) {
    function n(l) {
      try {
        c(i.next(l));
      } catch (d) {
        o(d);
      }
    }
    function p(l) {
      try {
        c(i.throw(l));
      } catch (d) {
        o(d);
      }
    }
    function c(l) {
      l.done ? s(l.value) : r(l.value).then(n, p);
    }
    c((i = i.apply(e, [])).next());
  });
}
var X = class {
  constructor() {
    this.mutex = Promise.resolve();
  }
  lock() {
    let e = () => {
    };
    return this.mutex = this.mutex.then(() => new Promise(e)), new Promise((t) => {
      e = t;
    });
  }
  dispatch(e) {
    return Mt(this, void 0, void 0, function* () {
      const t = yield this.lock();
      try {
        return yield Promise.resolve(e());
      } finally {
        t();
      }
    });
  }
}, ya;
function cl() {
  return typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global;
}
var Ra = cl(), fa = (ya = Ra.Buffer) !== null && ya !== void 0 ? ya : null, dl = Ra.TextEncoder ? new Ra.TextEncoder() : null;
function Fr(e, t) {
  return (e & 15) + (e >> 6 | e >> 3 & 8) << 4 | (t & 15) + (t >> 6 | t >> 3 & 8);
}
function hl(e, t) {
  const a = t.length >> 1;
  for (let i = 0; i < a; i++) {
    const r = i << 1;
    e[i] = Fr(t.charCodeAt(r), t.charCodeAt(r + 1));
  }
}
function pl(e, t) {
  if (e.length !== t.length * 2)
    return !1;
  for (let a = 0; a < t.length; a++) {
    const i = a << 1;
    if (t[a] !== Fr(e.charCodeAt(i), e.charCodeAt(i + 1)))
      return !1;
  }
  return !0;
}
var Ti = 87, Vi = 48;
function Ni(e, t, a) {
  let i = 0;
  for (let r = 0; r < a; r++) {
    let s = t[r] >>> 4;
    e[i++] = s > 9 ? s + Ti : s + Vi, s = t[r] & 15, e[i++] = s > 9 ? s + Ti : s + Vi;
  }
  return String.fromCharCode.apply(null, e);
}
var Qi = fa !== null ? (e) => {
  if (typeof e == "string") {
    const t = fa.from(e, "utf8");
    return new Uint8Array(t.buffer, t.byteOffset, t.length);
  }
  if (fa.isBuffer(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.length);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
} : (e) => {
  if (typeof e == "string")
    return dl.encode(e);
  if (ArrayBuffer.isView(e))
    return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
  throw new Error("Invalid data type!");
}, Li = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", yt = new Uint8Array(256);
for (let e = 0; e < Li.length; e++)
  yt[Li.charCodeAt(e)] = e;
function ul(e) {
  let t = Math.floor(e.length * 0.75);
  const a = e.length;
  return e[a - 1] === "=" && (t -= 1, e[a - 2] === "=" && (t -= 1)), t;
}
function yl(e) {
  const t = ul(e), a = e.length, i = new Uint8Array(t);
  let r = 0;
  for (let s = 0; s < a; s += 4) {
    const o = yt[e.charCodeAt(s)], n = yt[e.charCodeAt(s + 1)], p = yt[e.charCodeAt(s + 2)], c = yt[e.charCodeAt(s + 3)];
    i[r] = o << 2 | n >> 4, r += 1, i[r] = (n & 15) << 4 | p >> 2, r += 1, i[r] = (p & 3) << 6 | c & 63, r += 1;
  }
  return i;
}
var Ot = 16 * 1024, pt = 4, fl = new X(), Aa = /* @__PURE__ */ new Map();
function Al(e, t) {
  return Mt(this, void 0, void 0, function* () {
    let a = null, i = null, r = !1;
    if (typeof WebAssembly > "u")
      throw new Error("WebAssembly is not supported in this environment!");
    const s = (w, B = 0) => {
      i.set(w, B);
    }, o = () => i, n = () => a.exports, p = (w) => {
      a.exports.Hash_SetMemorySize(w);
      const B = a.exports.Hash_GetBuffer(), H = a.exports.memory.buffer;
      i = new Uint8Array(H, B, w);
    }, c = () => new DataView(a.exports.memory.buffer).getUint32(a.exports.STATE_SIZE, !0), l = fl.dispatch(() => Mt(this, void 0, void 0, function* () {
      if (!Aa.has(e.name)) {
        const B = yl(e.data), H = WebAssembly.compile(B);
        Aa.set(e.name, H);
      }
      const w = yield Aa.get(e.name);
      a = yield WebAssembly.instantiate(w, {
        // env: {
        //   emscripten_memcpy_big: (dest, src, num) => {
        //     const memoryBuffer = wasmInstance.exports.memory.buffer;
        //     const memView = new Uint8Array(memoryBuffer, 0);
        //     memView.set(memView.subarray(src, src + num), dest);
        //   },
        //   print_memory: (offset, len) => {
        //     const memoryBuffer = wasmInstance.exports.memory.buffer;
        //     const memView = new Uint8Array(memoryBuffer, 0);
        //     console.log('print_int32', memView.subarray(offset, offset + len));
        //   },
        // },
      });
    })), d = () => Mt(this, void 0, void 0, function* () {
      a || (yield l);
      const w = a.exports.Hash_GetBuffer(), B = a.exports.memory.buffer;
      i = new Uint8Array(B, w, Ot);
    }), h = (w = null) => {
      r = !0, a.exports.Hash_Init(w);
    }, u = (w) => {
      let B = 0;
      for (; B < w.length; ) {
        const H = w.subarray(B, B + Ot);
        B += H.length, i.set(H), a.exports.Hash_Update(H.length);
      }
    }, y = (w) => {
      if (!r)
        throw new Error("update() called before init()");
      const B = Qi(w);
      u(B);
    }, f = new Uint8Array(t * 2), A = (w, B = null) => {
      if (!r)
        throw new Error("digest() called before init()");
      return r = !1, a.exports.Hash_Final(B), w === "binary" ? i.slice(0, t) : Ni(f, i, t);
    }, m = () => {
      if (!r)
        throw new Error("save() can only be called after init() and before digest()");
      const w = a.exports.Hash_GetState(), B = c(), H = a.exports.memory.buffer, J = new Uint8Array(H, w, B), j = new Uint8Array(pt + B);
      return hl(j, e.hash), j.set(J, pt), j;
    }, F = (w) => {
      if (!(w instanceof Uint8Array))
        throw new Error("load() expects an Uint8Array generated by save()");
      const B = a.exports.Hash_GetState(), H = c(), J = pt + H, j = a.exports.memory.buffer;
      if (w.length !== J)
        throw new Error(`Bad state length (expected ${J} bytes, got ${w.length})`);
      if (!pl(e.hash, w.subarray(0, pt)))
        throw new Error("This state was written by an incompatible hash implementation");
      const Be = w.subarray(pt);
      new Uint8Array(j, B, H).set(Be), r = !0;
    }, v = (w) => typeof w == "string" ? w.length < Ot / 4 : w.byteLength < Ot;
    let C = v;
    switch (e.name) {
      case "argon2":
      case "scrypt":
        C = () => !0;
        break;
      case "blake2b":
      case "blake2s":
        C = (w, B) => B <= 512 && v(w);
        break;
      case "blake3":
        C = (w, B) => B === 0 && v(w);
        break;
      case "xxhash64":
      case "xxhash3":
      case "xxhash128":
      case "crc64":
        C = () => !1;
        break;
    }
    const _ = (w, B = null, H = null) => {
      if (!C(w, B))
        return h(B), y(w), A("hex", H);
      const J = Qi(w);
      return i.set(J), a.exports.Hash_Calculate(J.length, B, H), Ni(f, i, t);
    };
    return yield d(), {
      getMemory: o,
      writeMemory: s,
      getExports: n,
      setMemorySize: p,
      init: h,
      update: y,
      digest: A,
      save: m,
      load: F,
      calculate: _,
      hashLength: t
    };
  });
}
new X();
new X();
new X();
new X();
new X();
new X();
new X();
new X();
new X();
new X();
new X();
var Il = "sha256", gl = "AGFzbQEAAAABEQRgAAF/YAF/AGAAAGACf38AAwgHAAEBAQIAAwUEAQECAgYOAn8BQfCJBQt/AEGACAsHcAgGbWVtb3J5AgAOSGFzaF9HZXRCdWZmZXIAAAlIYXNoX0luaXQAAQtIYXNoX1VwZGF0ZQACCkhhc2hfRmluYWwABA1IYXNoX0dldFN0YXRlAAUOSGFzaF9DYWxjdWxhdGUABgpTVEFURV9TSVpFAwEKnEoHBQBBgAkLnQEAQQBCADcDwIkBQQBBHEEgIABB4AFGIgAbNgLoiQFBAEKnn+anxvST/b5/Qquzj/yRo7Pw2wAgABs3A+CJAUEAQrGWgP6fooWs6ABC/6S5iMWR2oKbfyAAGzcD2IkBQQBCl7rDg5Onlod3QvLmu+Ojp/2npX8gABs3A9CJAUEAQti9loj8oLW+NkLnzKfQ1tDrs7t/IAAbNwPIiQEL7wICAX4Gf0EAQQApA8CJASIBIACtfDcDwIkBAkACQAJAIAGnQT9xIgINAEGACSEDDAELAkBBwAAgAmsiBCAAIAQgAEkbIgNFDQAgA0EDcSEFIAJBgIkBaiEGQQAhAgJAIANBBEkNACADQfwAcSEHQQAhAgNAIAYgAmoiAyACQYAJai0AADoAACADQQFqIAJBgQlqLQAAOgAAIANBAmogAkGCCWotAAA6AAAgA0EDaiACQYMJai0AADoAACAHIAJBBGoiAkcNAAsLIAVFDQADQCAGIAJqIAJBgAlqLQAAOgAAIAJBAWohAiAFQX9qIgUNAAsLIAAgBEkNAUGAiQEQAyAAIARrIQAgBEGACWohAwsCQCAAQcAASQ0AA0AgAxADIANBwABqIQMgAEFAaiIAQT9LDQALCyAARQ0AQQAhAkEAIQUDQCACQYCJAWogAyACai0AADoAACACQQFqIQIgACAFQQFqIgVB/wFxSw0ACwsLoz4BRX9BACAAKAI8IgFBGHQgAUGA/gNxQQh0ciABQQh2QYD+A3EgAUEYdnJyIgFBGXcgAUEOd3MgAUEDdnMgACgCOCICQRh0IAJBgP4DcUEIdHIgAkEIdkGA/gNxIAJBGHZyciICaiAAKAIgIgNBGHQgA0GA/gNxQQh0ciADQQh2QYD+A3EgA0EYdnJyIgRBGXcgBEEOd3MgBEEDdnMgACgCHCIDQRh0IANBgP4DcUEIdHIgA0EIdkGA/gNxIANBGHZyciIFaiAAKAIEIgNBGHQgA0GA/gNxQQh0ciADQQh2QYD+A3EgA0EYdnJyIgZBGXcgBkEOd3MgBkEDdnMgACgCACIDQRh0IANBgP4DcUEIdHIgA0EIdkGA/gNxIANBGHZyciIHaiAAKAIkIgNBGHQgA0GA/gNxQQh0ciADQQh2QYD+A3EgA0EYdnJyIghqIAJBD3cgAkENd3MgAkEKdnNqIgNqIAAoAhgiCUEYdCAJQYD+A3FBCHRyIAlBCHZBgP4DcSAJQRh2cnIiCkEZdyAKQQ53cyAKQQN2cyAAKAIUIglBGHQgCUGA/gNxQQh0ciAJQQh2QYD+A3EgCUEYdnJyIgtqIAJqIAAoAhAiCUEYdCAJQYD+A3FBCHRyIAlBCHZBgP4DcSAJQRh2cnIiDEEZdyAMQQ53cyAMQQN2cyAAKAIMIglBGHQgCUGA/gNxQQh0ciAJQQh2QYD+A3EgCUEYdnJyIg1qIAAoAjAiCUEYdCAJQYD+A3FBCHRyIAlBCHZBgP4DcSAJQRh2cnIiDmogACgCCCIJQRh0IAlBgP4DcUEIdHIgCUEIdkGA/gNxIAlBGHZyciIPQRl3IA9BDndzIA9BA3ZzIAZqIAAoAigiCUEYdCAJQYD+A3FBCHRyIAlBCHZBgP4DcSAJQRh2cnIiEGogAUEPdyABQQ13cyABQQp2c2oiCUEPdyAJQQ13cyAJQQp2c2oiEUEPdyARQQ13cyARQQp2c2oiEkEPdyASQQ13cyASQQp2c2oiE2ogACgCNCIUQRh0IBRBgP4DcUEIdHIgFEEIdkGA/gNxIBRBGHZyciIVQRl3IBVBDndzIBVBA3ZzIA5qIBJqIAAoAiwiAEEYdCAAQYD+A3FBCHRyIABBCHZBgP4DcSAAQRh2cnIiFkEZdyAWQQ53cyAWQQN2cyAQaiARaiAIQRl3IAhBDndzIAhBA3ZzIARqIAlqIAVBGXcgBUEOd3MgBUEDdnMgCmogAWogC0EZdyALQQ53cyALQQN2cyAMaiAVaiANQRl3IA1BDndzIA1BA3ZzIA9qIBZqIANBD3cgA0ENd3MgA0EKdnNqIhRBD3cgFEENd3MgFEEKdnNqIhdBD3cgF0ENd3MgF0EKdnNqIhhBD3cgGEENd3MgGEEKdnNqIhlBD3cgGUENd3MgGUEKdnNqIhpBD3cgGkENd3MgGkEKdnNqIhtBD3cgG0ENd3MgG0EKdnNqIhxBGXcgHEEOd3MgHEEDdnMgAkEZdyACQQ53cyACQQN2cyAVaiAYaiAOQRl3IA5BDndzIA5BA3ZzIBZqIBdqIBBBGXcgEEEOd3MgEEEDdnMgCGogFGogE0EPdyATQQ13cyATQQp2c2oiHUEPdyAdQQ13cyAdQQp2c2oiHkEPdyAeQQ13cyAeQQp2c2oiH2ogE0EZdyATQQ53cyATQQN2cyAYaiADQRl3IANBDndzIANBA3ZzIAFqIBlqIB9BD3cgH0ENd3MgH0EKdnNqIiBqIBJBGXcgEkEOd3MgEkEDdnMgF2ogH2ogEUEZdyARQQ53cyARQQN2cyAUaiAeaiAJQRl3IAlBDndzIAlBA3ZzIANqIB1qIBxBD3cgHEENd3MgHEEKdnNqIiFBD3cgIUENd3MgIUEKdnNqIiJBD3cgIkENd3MgIkEKdnNqIiNBD3cgI0ENd3MgI0EKdnNqIiRqIBtBGXcgG0EOd3MgG0EDdnMgHmogI2ogGkEZdyAaQQ53cyAaQQN2cyAdaiAiaiAZQRl3IBlBDndzIBlBA3ZzIBNqICFqIBhBGXcgGEEOd3MgGEEDdnMgEmogHGogF0EZdyAXQQ53cyAXQQN2cyARaiAbaiAUQRl3IBRBDndzIBRBA3ZzIAlqIBpqICBBD3cgIEENd3MgIEEKdnNqIiVBD3cgJUENd3MgJUEKdnNqIiZBD3cgJkENd3MgJkEKdnNqIidBD3cgJ0ENd3MgJ0EKdnNqIihBD3cgKEENd3MgKEEKdnNqIilBD3cgKUENd3MgKUEKdnNqIipBD3cgKkENd3MgKkEKdnNqIitBGXcgK0EOd3MgK0EDdnMgH0EZdyAfQQ53cyAfQQN2cyAbaiAnaiAeQRl3IB5BDndzIB5BA3ZzIBpqICZqIB1BGXcgHUEOd3MgHUEDdnMgGWogJWogJEEPdyAkQQ13cyAkQQp2c2oiLEEPdyAsQQ13cyAsQQp2c2oiLUEPdyAtQQ13cyAtQQp2c2oiLmogJEEZdyAkQQ53cyAkQQN2cyAnaiAgQRl3ICBBDndzICBBA3ZzIBxqIChqIC5BD3cgLkENd3MgLkEKdnNqIi9qICNBGXcgI0EOd3MgI0EDdnMgJmogLmogIkEZdyAiQQ53cyAiQQN2cyAlaiAtaiAhQRl3ICFBDndzICFBA3ZzICBqICxqICtBD3cgK0ENd3MgK0EKdnNqIjBBD3cgMEENd3MgMEEKdnNqIjFBD3cgMUENd3MgMUEKdnNqIjJBD3cgMkENd3MgMkEKdnNqIjNqICpBGXcgKkEOd3MgKkEDdnMgLWogMmogKUEZdyApQQ53cyApQQN2cyAsaiAxaiAoQRl3IChBDndzIChBA3ZzICRqIDBqICdBGXcgJ0EOd3MgJ0EDdnMgI2ogK2ogJkEZdyAmQQ53cyAmQQN2cyAiaiAqaiAlQRl3ICVBDndzICVBA3ZzICFqIClqIC9BD3cgL0ENd3MgL0EKdnNqIjRBD3cgNEENd3MgNEEKdnNqIjVBD3cgNUENd3MgNUEKdnNqIjZBD3cgNkENd3MgNkEKdnNqIjdBD3cgN0ENd3MgN0EKdnNqIjhBD3cgOEENd3MgOEEKdnNqIjlBD3cgOUENd3MgOUEKdnNqIjogOCA0IC4gLCAhIBsgGSADIA4gBEEAKALYiQEiO0EadyA7QRV3cyA7QQd3c0EAKALkiQEiPGpBACgC4IkBIj1BACgC3IkBIj5zIDtxID1zaiAHakGY36iUBGoiB0EAKALUiQEiP2oiACAMaiA7IA1qID4gD2ogPSAGaiAAID4gO3NxID5zaiAAQRp3IABBFXdzIABBB3dzakGRid2JB2oiQEEAKALQiQEiQWoiDCAAIDtzcSA7c2ogDEEadyAMQRV3cyAMQQd3c2pBz/eDrntqIkJBACgCzIkBIkNqIg0gDCAAc3EgAHNqIA1BGncgDUEVd3MgDUEHd3NqQaW3181+aiJEQQAoAsiJASIAaiIPIA0gDHNxIAxzaiAPQRp3IA9BFXdzIA9BB3dzakHbhNvKA2oiRSBBIEMgAHNxIEMgAHFzIABBHncgAEETd3MgAEEKd3NqIAdqIgZqIgdqIAUgD2ogCiANaiALIAxqIAcgDyANc3EgDXNqIAdBGncgB0EVd3MgB0EHd3NqQfGjxM8FaiIKIAYgAHMgQ3EgBiAAcXMgBkEedyAGQRN3cyAGQQp3c2ogQGoiDGoiBCAHIA9zcSAPc2ogBEEadyAEQRV3cyAEQQd3c2pBpIX+kXlqIgsgDCAGcyAAcSAMIAZxcyAMQR53IAxBE3dzIAxBCndzaiBCaiINaiIPIAQgB3NxIAdzaiAPQRp3IA9BFXdzIA9BB3dzakHVvfHYemoiQCANIAxzIAZxIA0gDHFzIA1BHncgDUETd3MgDUEKd3NqIERqIgZqIgcgDyAEc3EgBHNqIAdBGncgB0EVd3MgB0EHd3NqQZjVnsB9aiJCIAYgDXMgDHEgBiANcXMgBkEedyAGQRN3cyAGQQp3c2ogRWoiDGoiBWogFiAHaiAQIA9qIAggBGogBSAHIA9zcSAPc2ogBUEadyAFQRV3cyAFQQd3c2pBgbaNlAFqIgggDCAGcyANcSAMIAZxcyAMQR53IAxBE3dzIAxBCndzaiAKaiINaiIPIAUgB3NxIAdzaiAPQRp3IA9BFXdzIA9BB3dzakG+i8ahAmoiDiANIAxzIAZxIA0gDHFzIA1BHncgDUETd3MgDUEKd3NqIAtqIgZqIgcgDyAFc3EgBXNqIAdBGncgB0EVd3MgB0EHd3NqQcP7sagFaiIQIAYgDXMgDHEgBiANcXMgBkEedyAGQRN3cyAGQQp3c2ogQGoiDGoiBCAHIA9zcSAPc2ogBEEadyAEQRV3cyAEQQd3c2pB9Lr5lQdqIhYgDCAGcyANcSAMIAZxcyAMQR53IAxBE3dzIAxBCndzaiBCaiINaiIFaiABIARqIAIgB2ogFSAPaiAFIAQgB3NxIAdzaiAFQRp3IAVBFXdzIAVBB3dzakH+4/qGeGoiByANIAxzIAZxIA0gDHFzIA1BHncgDUETd3MgDUEKd3NqIAhqIgFqIgYgBSAEc3EgBHNqIAZBGncgBkEVd3MgBkEHd3NqQaeN8N55aiIEIAEgDXMgDHEgASANcXMgAUEedyABQRN3cyABQQp3c2ogDmoiAmoiDCAGIAVzcSAFc2ogDEEadyAMQRV3cyAMQQd3c2pB9OLvjHxqIgUgAiABcyANcSACIAFxcyACQR53IAJBE3dzIAJBCndzaiAQaiIDaiINIAwgBnNxIAZzaiANQRp3IA1BFXdzIA1BB3dzakHB0+2kfmoiCCADIAJzIAFxIAMgAnFzIANBHncgA0ETd3MgA0EKd3NqIBZqIgFqIg8gF2ogESANaiAUIAxqIAkgBmogDyANIAxzcSAMc2ogD0EadyAPQRV3cyAPQQd3c2pBho/5/X5qIgYgASADcyACcSABIANxcyABQR53IAFBE3dzIAFBCndzaiAHaiICaiIJIA8gDXNxIA1zaiAJQRp3IAlBFXdzIAlBB3dzakHGu4b+AGoiDCACIAFzIANxIAIgAXFzIAJBHncgAkETd3MgAkEKd3NqIARqIgNqIhEgCSAPc3EgD3NqIBFBGncgEUEVd3MgEUEHd3NqQczDsqACaiINIAMgAnMgAXEgAyACcXMgA0EedyADQRN3cyADQQp3c2ogBWoiAWoiFCARIAlzcSAJc2ogFEEadyAUQRV3cyAUQQd3c2pB79ik7wJqIg8gASADcyACcSABIANxcyABQR53IAFBE3dzIAFBCndzaiAIaiICaiIXaiATIBRqIBggEWogEiAJaiAXIBQgEXNxIBFzaiAXQRp3IBdBFXdzIBdBB3dzakGqidLTBGoiGCACIAFzIANxIAIgAXFzIAJBHncgAkETd3MgAkEKd3NqIAZqIgNqIgkgFyAUc3EgFHNqIAlBGncgCUEVd3MgCUEHd3NqQdzTwuUFaiIUIAMgAnMgAXEgAyACcXMgA0EedyADQRN3cyADQQp3c2ogDGoiAWoiESAJIBdzcSAXc2ogEUEadyARQRV3cyARQQd3c2pB2pHmtwdqIhcgASADcyACcSABIANxcyABQR53IAFBE3dzIAFBCndzaiANaiICaiISIBEgCXNxIAlzaiASQRp3IBJBFXdzIBJBB3dzakHSovnBeWoiGSACIAFzIANxIAIgAXFzIAJBHncgAkETd3MgAkEKd3NqIA9qIgNqIhNqIB4gEmogGiARaiAdIAlqIBMgEiARc3EgEXNqIBNBGncgE0EVd3MgE0EHd3NqQe2Mx8F6aiIaIAMgAnMgAXEgAyACcXMgA0EedyADQRN3cyADQQp3c2ogGGoiAWoiCSATIBJzcSASc2ogCUEadyAJQRV3cyAJQQd3c2pByM+MgHtqIhggASADcyACcSABIANxcyABQR53IAFBE3dzIAFBCndzaiAUaiICaiIRIAkgE3NxIBNzaiARQRp3IBFBFXdzIBFBB3dzakHH/+X6e2oiFCACIAFzIANxIAIgAXFzIAJBHncgAkETd3MgAkEKd3NqIBdqIgNqIhIgESAJc3EgCXNqIBJBGncgEkEVd3MgEkEHd3NqQfOXgLd8aiIXIAMgAnMgAXEgAyACcXMgA0EedyADQRN3cyADQQp3c2ogGWoiAWoiE2ogICASaiAcIBFqIB8gCWogEyASIBFzcSARc2ogE0EadyATQRV3cyATQQd3c2pBx6KerX1qIhkgASADcyACcSABIANxcyABQR53IAFBE3dzIAFBCndzaiAaaiICaiIJIBMgEnNxIBJzaiAJQRp3IAlBFXdzIAlBB3dzakHRxqk2aiIaIAIgAXMgA3EgAiABcXMgAkEedyACQRN3cyACQQp3c2ogGGoiA2oiESAJIBNzcSATc2ogEUEadyARQRV3cyARQQd3c2pB59KkoQFqIhggAyACcyABcSADIAJxcyADQR53IANBE3dzIANBCndzaiAUaiIBaiISIBEgCXNxIAlzaiASQRp3IBJBFXdzIBJBB3dzakGFldy9AmoiFCABIANzIAJxIAEgA3FzIAFBHncgAUETd3MgAUEKd3NqIBdqIgJqIhMgI2ogJiASaiAiIBFqICUgCWogEyASIBFzcSARc2ogE0EadyATQRV3cyATQQd3c2pBuMLs8AJqIhcgAiABcyADcSACIAFxcyACQR53IAJBE3dzIAJBCndzaiAZaiIDaiIJIBMgEnNxIBJzaiAJQRp3IAlBFXdzIAlBB3dzakH827HpBGoiGSADIAJzIAFxIAMgAnFzIANBHncgA0ETd3MgA0EKd3NqIBpqIgFqIhEgCSATc3EgE3NqIBFBGncgEUEVd3MgEUEHd3NqQZOa4JkFaiIaIAEgA3MgAnEgASADcXMgAUEedyABQRN3cyABQQp3c2ogGGoiAmoiEiARIAlzcSAJc2ogEkEadyASQRV3cyASQQd3c2pB1OapqAZqIhggAiABcyADcSACIAFxcyACQR53IAJBE3dzIAJBCndzaiAUaiIDaiITaiAoIBJqICQgEWogJyAJaiATIBIgEXNxIBFzaiATQRp3IBNBFXdzIBNBB3dzakG7laizB2oiFCADIAJzIAFxIAMgAnFzIANBHncgA0ETd3MgA0EKd3NqIBdqIgFqIgkgEyASc3EgEnNqIAlBGncgCUEVd3MgCUEHd3NqQa6Si454aiIXIAEgA3MgAnEgASADcXMgAUEedyABQRN3cyABQQp3c2ogGWoiAmoiESAJIBNzcSATc2ogEUEadyARQRV3cyARQQd3c2pBhdnIk3lqIhkgAiABcyADcSACIAFxcyACQR53IAJBE3dzIAJBCndzaiAaaiIDaiISIBEgCXNxIAlzaiASQRp3IBJBFXdzIBJBB3dzakGh0f+VemoiGiADIAJzIAFxIAMgAnFzIANBHncgA0ETd3MgA0EKd3NqIBhqIgFqIhNqICogEmogLSARaiApIAlqIBMgEiARc3EgEXNqIBNBGncgE0EVd3MgE0EHd3NqQcvM6cB6aiIYIAEgA3MgAnEgASADcXMgAUEedyABQRN3cyABQQp3c2ogFGoiAmoiCSATIBJzcSASc2ogCUEadyAJQRV3cyAJQQd3c2pB8JauknxqIhQgAiABcyADcSACIAFxcyACQR53IAJBE3dzIAJBCndzaiAXaiIDaiIRIAkgE3NxIBNzaiARQRp3IBFBFXdzIBFBB3dzakGjo7G7fGoiFyADIAJzIAFxIAMgAnFzIANBHncgA0ETd3MgA0EKd3NqIBlqIgFqIhIgESAJc3EgCXNqIBJBGncgEkEVd3MgEkEHd3NqQZnQy4x9aiIZIAEgA3MgAnEgASADcXMgAUEedyABQRN3cyABQQp3c2ogGmoiAmoiE2ogMCASaiAvIBFqICsgCWogEyASIBFzcSARc2ogE0EadyATQRV3cyATQQd3c2pBpIzktH1qIhogAiABcyADcSACIAFxcyACQR53IAJBE3dzIAJBCndzaiAYaiIDaiIJIBMgEnNxIBJzaiAJQRp3IAlBFXdzIAlBB3dzakGF67igf2oiGCADIAJzIAFxIAMgAnFzIANBHncgA0ETd3MgA0EKd3NqIBRqIgFqIhEgCSATc3EgE3NqIBFBGncgEUEVd3MgEUEHd3NqQfDAqoMBaiIUIAEgA3MgAnEgASADcXMgAUEedyABQRN3cyABQQp3c2ogF2oiAmoiEiARIAlzcSAJc2ogEkEadyASQRV3cyASQQd3c2pBloKTzQFqIhcgAiABcyADcSACIAFxcyACQR53IAJBE3dzIAJBCndzaiAZaiIDaiITIDZqIDIgEmogNSARaiAxIAlqIBMgEiARc3EgEXNqIBNBGncgE0EVd3MgE0EHd3NqQYjY3fEBaiIZIAMgAnMgAXEgAyACcXMgA0EedyADQRN3cyADQQp3c2ogGmoiAWoiCSATIBJzcSASc2ogCUEadyAJQRV3cyAJQQd3c2pBzO6hugJqIhogASADcyACcSABIANxcyABQR53IAFBE3dzIAFBCndzaiAYaiICaiIRIAkgE3NxIBNzaiARQRp3IBFBFXdzIBFBB3dzakG1+cKlA2oiGCACIAFzIANxIAIgAXFzIAJBHncgAkETd3MgAkEKd3NqIBRqIgNqIhIgESAJc3EgCXNqIBJBGncgEkEVd3MgEkEHd3NqQbOZ8MgDaiIUIAMgAnMgAXEgAyACcXMgA0EedyADQRN3cyADQQp3c2ogF2oiAWoiE2ogLEEZdyAsQQ53cyAsQQN2cyAoaiA0aiAzQQ93IDNBDXdzIDNBCnZzaiIXIBJqIDcgEWogMyAJaiATIBIgEXNxIBFzaiATQRp3IBNBFXdzIBNBB3dzakHK1OL2BGoiGyABIANzIAJxIAEgA3FzIAFBHncgAUETd3MgAUEKd3NqIBlqIgJqIgkgEyASc3EgEnNqIAlBGncgCUEVd3MgCUEHd3NqQc+U89wFaiIZIAIgAXMgA3EgAiABcXMgAkEedyACQRN3cyACQQp3c2ogGmoiA2oiESAJIBNzcSATc2ogEUEadyARQRV3cyARQQd3c2pB89+5wQZqIhogAyACcyABcSADIAJxcyADQR53IANBE3dzIANBCndzaiAYaiIBaiISIBEgCXNxIAlzaiASQRp3IBJBFXdzIBJBB3dzakHuhb6kB2oiHCABIANzIAJxIAEgA3FzIAFBHncgAUETd3MgAUEKd3NqIBRqIgJqIhNqIC5BGXcgLkEOd3MgLkEDdnMgKmogNmogLUEZdyAtQQ53cyAtQQN2cyApaiA1aiAXQQ93IBdBDXdzIBdBCnZzaiIUQQ93IBRBDXdzIBRBCnZzaiIYIBJqIDkgEWogFCAJaiATIBIgEXNxIBFzaiATQRp3IBNBFXdzIBNBB3dzakHvxpXFB2oiCSACIAFzIANxIAIgAXFzIAJBHncgAkETd3MgAkEKd3NqIBtqIgNqIhEgEyASc3EgEnNqIBFBGncgEUEVd3MgEUEHd3NqQZTwoaZ4aiIbIAMgAnMgAXEgAyACcXMgA0EedyADQRN3cyADQQp3c2ogGWoiAWoiEiARIBNzcSATc2ogEkEadyASQRV3cyASQQd3c2pBiISc5nhqIhkgASADcyACcSABIANxcyABQR53IAFBE3dzIAFBCndzaiAaaiICaiITIBIgEXNxIBFzaiATQRp3IBNBFXdzIBNBB3dzakH6//uFeWoiGiACIAFzIANxIAIgAXFzIAJBHncgAkETd3MgAkEKd3NqIBxqIgNqIhQgPGo2AuSJAUEAID8gAyACcyABcSADIAJxcyADQR53IANBE3dzIANBCndzaiAJaiIBIANzIAJxIAEgA3FzIAFBHncgAUETd3MgAUEKd3NqIBtqIgIgAXMgA3EgAiABcXMgAkEedyACQRN3cyACQQp3c2ogGWoiAyACcyABcSADIAJxcyADQR53IANBE3dzIANBCndzaiAaaiIJajYC1IkBQQAgPSAvQRl3IC9BDndzIC9BA3ZzICtqIDdqIBhBD3cgGEENd3MgGEEKdnNqIhggEWogFCATIBJzcSASc2ogFEEadyAUQRV3cyAUQQd3c2pB69nBonpqIhkgAWoiEWo2AuCJAUEAIEEgCSADcyACcSAJIANxcyAJQR53IAlBE3dzIAlBCndzaiAZaiIBajYC0IkBQQAgPiAwQRl3IDBBDndzIDBBA3ZzIC9qIBdqIDpBD3cgOkENd3MgOkEKdnNqIBJqIBEgFCATc3EgE3NqIBFBGncgEUEVd3MgEUEHd3NqQffH5vd7aiIXIAJqIhJqNgLciQFBACBDIAEgCXMgA3EgASAJcXMgAUEedyABQRN3cyABQQp3c2ogF2oiAmo2AsyJAUEAIDsgNEEZdyA0QQ53cyA0QQN2cyAwaiA4aiAYQQ93IBhBDXdzIBhBCnZzaiATaiASIBEgFHNxIBRzaiASQRp3IBJBFXdzIBJBB3dzakHy8cWzfGoiESADamo2AtiJAUEAIAAgAiABcyAJcSACIAFxcyACQR53IAJBE3dzIAJBCndzaiARamo2AsiJAQuyBgIEfwF+QQAoAsCJASIAQQJ2QQ9xIgFBAnRBgIkBaiICIAIoAgBBfyAAQQN0IgB0QX9zcUGAASAAdHM2AgACQAJAAkAgAUEOSQ0AAkAgAUEORw0AQQBBADYCvIkBC0GAiQEQA0EAIQIMAQsgAUENRg0BIAFBAWohAgsgAiEDAkBBBiACa0EHcSIARQ0AIAIgAGohAyACQQJ0QYCJAWohAQNAIAFBADYCACABQQRqIQEgAEF/aiIADQALCyACQXlqQQdJDQAgA0ECdCEBA0AgAUGYiQFqQgA3AgAgAUGQiQFqQgA3AgAgAUGIiQFqQgA3AgAgAUGAiQFqQgA3AgAgAUEgaiIBQThHDQALC0EAIQFBAEEAKQPAiQEiBKciAEEbdCAAQQt0QYCA/AdxciAAQQV2QYD+A3EgAEEDdEEYdnJyNgK8iQFBACAEQh2IpyIAQRh0IABBgP4DcUEIdHIgAEEIdkGA/gNxIABBGHZycjYCuIkBQYCJARADQQBBACgC5IkBIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgLkiQFBAEEAKALgiQEiAEEYdCAAQYD+A3FBCHRyIABBCHZBgP4DcSAAQRh2cnI2AuCJAUEAQQAoAtyJASIAQRh0IABBgP4DcUEIdHIgAEEIdkGA/gNxIABBGHZycjYC3IkBQQBBACgC2IkBIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgLYiQFBAEEAKALUiQEiAEEYdCAAQYD+A3FBCHRyIABBCHZBgP4DcSAAQRh2cnI2AtSJAUEAQQAoAtCJASIAQRh0IABBgP4DcUEIdHIgAEEIdkGA/gNxIABBGHZycjYC0IkBQQBBACgCzIkBIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgLMiQFBAEEAKALIiQEiAEEYdCAAQYD+A3FBCHRyIABBCHZBgP4DcSAAQRh2cnI2AsiJAQJAQQAoAuiJASICRQ0AQQAhAANAIAFBgAlqIAFByIkBai0AADoAACABQQFqIQEgAiAAQQFqIgBB/wFxSw0ACwsLBgBBgIkBC6MBAEEAQgA3A8CJAUEAQRxBICABQeABRiIBGzYC6IkBQQBCp5/mp8b0k/2+f0Krs4/8kaOz8NsAIAEbNwPgiQFBAEKxloD+n6KFrOgAQv+kuYjFkdqCm38gARs3A9iJAUEAQpe6w4OTp5aHd0Ly5rvjo6f9p6V/IAEbNwPQiQFBAELYvZaI/KC1vjZC58yn0NbQ67O7fyABGzcDyIkBIAAQAhAECwsLAQBBgAgLBHAAAAA=", ml = "8c18dd94", bl = {
  name: Il,
  data: gl,
  hash: ml
};
new X();
new X();
function xa() {
  return Al(bl, 32).then((e) => {
    e.init(256);
    const t = {
      init: () => (e.init(256), t),
      update: (a) => (e.update(a), t),
      // biome-ignore lint/suspicious/noExplicitAny: Conflict with IHasher type
      digest: (a) => e.digest(a),
      save: () => e.save(),
      load: (a) => (e.load(a), t),
      blockSize: 64,
      digestSize: 32
    };
    return t;
  });
}
new X();
new X();
new X();
new X();
new X();
new X();
new X();
new X();
new X();
var Sr = 1 * 1024 * 1024;
async function Br(e) {
  return e.arrayBuffer();
}
async function vl(e, t, a) {
  const i = Math.min(t, Sr), r = e.slice(0, i), s = await Br(r), o = await xa();
  return o.init(), o.update(new Uint8Array(s)), o.digest("hex");
}
async function Mi(e, t, a) {
  const i = Sr, r = Math.ceil(t / i);
  let s = await xa();
  s.init();
  let o = "";
  for (let n = 0; n < r; n++) {
    const p = n * i, c = Math.min(p + i, t), l = e.slice(p, c), d = await Br(l);
    if (s.update(new Uint8Array(d)), o = s.digest("hex"), n < r - 1 && (s = await xa(), s.init(), s.update(El(o))), a) {
      const h = Math.min(100, (n + 1) / r * 100);
      a(h);
    }
  }
  return o;
}
function El(e) {
  const t = new Uint8Array(e.length / 2);
  for (let a = 0; a < e.length; a += 2)
    t[a / 2] = parseInt(e.substr(a, 2), 16);
  return t;
}
var wr = BigInt("0xC96C5795D7870F42"), aa = BigInt("0xFFFFFFFFFFFFFFFF"), Fl = BigInt(255), Ia = BigInt(1), Sl = BigInt(8), Ze = aa, Bl = aa, Ye = null;
function Cr() {
  if (!Ye) {
    Ye = new Array(256);
    for (let e = 0; e < 256; e++) {
      let t = BigInt(e);
      for (let a = 0; a < 8; a++)
        t & Ia ? t = t >> Ia ^ wr : t = t >> Ia;
      Ye[e] = t;
    }
  }
}
function Da(e, t) {
  let a = BigInt(0), i = 0;
  for (; t; )
    t & BigInt(1) && (a ^= e[i]), t >>= BigInt(1), i++;
  return a;
}
function Ut(e, t) {
  for (let a = 0; a < 64; a++)
    e[a] = Da(t, t[a]);
}
function Oa(e, t) {
  Ye || Cr();
  const a = t instanceof ArrayBuffer ? new Uint8Array(t) : t;
  for (let i = 0; i < a.length; i++) {
    const r = Number((e ^ BigInt(a[i])) & Fl);
    e = e >> Sl ^ Ye[r];
  }
  return e;
}
function Jt(e) {
  return ((e ^ Bl) & aa).toString(10);
}
function wl(e, t, a) {
  if (a === 0)
    return e;
  Ye || Cr();
  let i = BigInt(e);
  const r = new Array(64), s = new Array(64);
  s[0] = wr;
  let o = BigInt(1);
  for (let p = 1; p < 64; p++)
    s[p] = o, o <<= BigInt(1);
  Ut(r, s), Ut(s, r);
  let n = a;
  for (; n > 0 && (Ut(r, s), n & 1 && (i = Da(r, i)), n >>= 1, n !== 0); )
    Ut(s, r), n & 1 && (i = Da(s, i)), n >>= 1;
  return i ^= BigInt(t), (i & aa).toString(10);
}
function _r(e) {
  if (!e || e.length === 0)
    return Jt(Ze);
  if (e.length === 1)
    return e[0].crc64;
  let t = e[0].crc64;
  for (let a = 1; a < e.length; a++) {
    const i = e[a];
    t = wl(t, i.crc64, i.size);
  }
  return t;
}
async function ga(e, t) {
  let i = Ze, r = 0;
  for (; r < e.size; ) {
    const s = Math.min(r + 1048576, e.size), n = await e.slice(r, s).arrayBuffer();
    i = Oa(i, n), r = s;
  }
  return Jt(i);
}
function kt(e) {
  const t = e.match(/^(.+)\.cos\.([^.]+)\.myqcloud\.com$/);
  return t ? {
    bucket: t[1],
    region: t[2]
  } : {
    bucket: "",
    region: ""
  };
}
var zt = /* @__PURE__ */ ((e) => (e.WAITING = "waiting", e.START = "start", e.COMPUTING_HASH = "computing_hash", e.CREATED = "created", e.PREPARING = "preparing", e.RUNNING = "running", e.PAUSED = "paused", e.COMPLETE = "complete", e.CONFIRMING = "confirming", e.SUCCESS = "success", e.RAPID_SUCCESS = "rapid_success", e.ERROR = "error", e.CANCELED = "canceled", e))(zt || {}), Rr = class extends ll {
  // 最大重试次数
  constructor(e, t) {
    super(), this.verbose = !1, this.state = "waiting", this.message = "", this.progress = 0, this.loaded = 0, this.speed = 0, this.left_time = 0, this.startSize = 0, this.lastEmittedProgress = 0, this.lastProgressLoaded = 0, this.start_time = 0, this.end_time = 0, this.used_avg_speed = 0, this.used_time_len = 0, this.avg_speed = 0, this.pauseFlag = !1, this.cancelFlag = !1, this.abortController = new AbortController(), this.speedList = [], this.speed_0_count = 0, this.task_start_time = 0, this.start_done_part_loaded = 0, this.PROGRESS_EMIT_STEP = 0.2, this.MAX_SPEED_0_COUNT = 10, this.MAX_RETRY_TIMES = 3, this.file = e, this.verbose = (t == null ? void 0 : t.verbose) || !1, this.id = (t == null ? void 0 : t.id) || this.generateTaskId();
  }
  /**
   * 日志输出
   */
  logInfo(...e) {
    if (this.verbose) {
      const t = this.getTaskType().charAt(0).toUpperCase();
      console.info(`[${t}]`, ...e);
    }
  }
  logWarn(...e) {
    if (this.verbose) {
      const t = this.getTaskType().charAt(0).toUpperCase();
      console.warn(`[${t}]`, ...e);
    }
  }
  logError(...e) {
    if (this.verbose) {
      const t = this.getTaskType().charAt(0).toUpperCase();
      console.error(`[${t}]`, ...e);
    }
  }
  /**
   * 生成唯一任务ID
   */
  generateTaskId() {
    return `${this.getTaskType()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * 等待开始
   */
  async wait() {
    this.state !== "waiting" && (this.error = void 0, this.pauseCalcSpeed(), this.pauseFlag = !1, this.cancelFlag = !1, this.state === "error" && (this.end_time = 0, this.message = ""), await this.changeState(
      "waiting"
      /* WAITING */
    ));
  }
  /**
   * 取消所有正在进行的 HTTP 请求，并重建控制器供后续使用（恢复场景）
   */
  abortRequest() {
    this.abortController.abort(), this.abortController = new AbortController();
  }
  /**
   * 获取当前的 AbortSignal，供 fetch/axios 请求使用
   */
  get abortSignal() {
    return this.abortController.signal;
  }
  /**
   * 停止（暂停）任务
   */
  async pause() {
    ["paused", "success", "error", "canceled"].includes(this.state) || (this.pauseFlag = !0, this.abortRequest(), this.pauseCalcSpeed(), this.calcTotalAvgSpeed(), await this.changeState(
      "paused"
      /* PAUSED */
    ));
  }
  /**
   * 取消任务
   */
  async cancel() {
    this.cancelFlag || this.state === "canceled" || (this.cancelFlag = !0, this.abortRequest(), this.pauseCalcSpeed(), this.calcTotalAvgSpeed(), await this.changeState(
      "canceled"
      /* CANCELED */
    ));
  }
  /**
   * 开始计算速度
   */
  startCalcSpeed() {
    this.left_time = 0, this.speed = 0, this.lastProgressLoaded = this.loaded, this.speedList = [], this.tid_speed && clearInterval(this.tid_speed), this.tid_speed = setInterval(() => {
      const e = Math.max(0, this.loaded - this.lastProgressLoaded);
      this.speedList.push(e), this.speedList.length > 10 && this.speedList.shift(), this.speed = this.calcSmoothSpeed(this.speedList), this.left_time = this.speed === 0 ? 24 * 3600 : (this.file.size - this.loaded) / this.speed, this.lastProgressLoaded = this.loaded, this.checkTimeout();
    }, 1e3);
  }
  /**
   * 停止计算速度
   */
  pauseCalcSpeed() {
    this.tid_speed && (clearInterval(this.tid_speed), this.tid_speed = void 0), this.speed = 0;
  }
  /**
   * 计算平滑速度（滑动平均）
   */
  calcSmoothSpeed(e) {
    return e.length === 0 ? 0 : e.reduce((a, i) => a + i, 0) / e.length;
  }
  /**
   * 计算总平均速度
   */
  calcTotalAvgSpeed() {
    const e = Date.now() - this.task_start_time, t = this.loaded - (this.start_done_part_loaded || 0);
    this.used_time_len && this.used_avg_speed ? this.avg_speed = (this.used_time_len / 1e3 * this.used_avg_speed + t) / (this.used_time_len + e) * 1e3 : this.avg_speed = e > 0 ? t / e * 1e3 : 0, this.used_time_len += e, this.used_avg_speed = this.avg_speed;
  }
  /**
   * 检查超时
   */
  async checkTimeout() {
    this.speed_0_count == null && (this.speed_0_count = 0), this.speed === 0 ? this.speed_0_count++ : this.speed_0_count = 0;
  }
  /**
   * 更新进度
   * @param loaded 当前已处理的总字节数
   * @param options 选项
   */
  updateProgress(e, t) {
    if (t != null && t.init) {
      this.startSize = e, this.loaded = e, this.lastProgressLoaded = e, this.progress = this.file.size > 0 ? e / this.file.size * 100 : 0, this.lastEmittedProgress = this.progress, this.notifyProgress("running", this.progress);
      return;
    }
    if (this.loaded = e, this.progress = this.file.size > 0 ? e / this.file.size * 100 : 100, this.speed > 0) {
      const i = this.file.size > e ? this.file.size - e : 0;
      this.left_time = i / this.speed;
    }
    const a = Math.abs(this.progress - this.lastEmittedProgress);
    a > 0 && (t != null && t.immediately || a >= this.PROGRESS_EMIT_STEP) && (this.lastEmittedProgress = this.progress, this.notifyProgress("running", this.progress));
  }
  /**
   * 改变状态
   */
  async changeState(e, t) {
    this.state = e;
    const a = this.getCheckpoint();
    this.emit("statechange", { checkpoint: a, state: e, error: t });
  }
  /**
   * 通知进度
   */
  notifyProgress(e, t) {
    const a = {
      state: e,
      loaded: this.loaded,
      total: this.file.size,
      progress: t,
      speed: this.speed,
      leftTime: this.left_time
    };
    this.emit("progress", a);
  }
  /**
   * 处理错误
   */
  async handleError(e) {
    const t = e instanceof It ? e : Y("OperationFailed", e.message, e);
    return this.cancelFlag ? (await this.changeState("error", t), t) : e.message === "paused" ? (await this.pause(), t) : (this.message = t.message, this.error = t, this.end_time = Date.now(), this.pauseCalcSpeed(), this.calcTotalAvgSpeed(), await this.changeState("error", t), t);
  }
}, Cl = class extends Rr {
  // 浏览器默认并发数
  constructor(e, t) {
    const a = {
      name: e.file.name,
      size: e.file.size,
      type: e.file.type
    };
    if (!e.file || !e.file.name || isNaN(e.file.size))
      throw Y(
        "InvalidFile",
        "Invalid file: file must have name and size",
        void 0,
        { file: a }
      );
    super(a, { verbose: e.verbose }), this.part_info_list = [], this.rapid_upload = !1, this.DEFAULT_PARALLEL = 2, this.options = e, this.fileApi = new jt(t);
    const i = e.partFileSize || 32, r = 1, s = 5 * 1024;
    if (i < r || i > s)
      throw Y(
        "InvalidParameter",
        `partFileSize must be between ${r}MB and ${s}MB`,
        void 0,
        { partFileSize: i }
      );
    this.CHUNK_FILE_SIZE = i * 1024 * 1024, this.MIN_SIZE_FOR_HASH = 1 * 1024 * 1024, this.chunk_size = (e.chunkSize || 5) * 1024 * 1024, e.checkpoint && this.restoreCheckpoint(e.checkpoint);
  }
  getTaskType() {
    return "upload";
  }
  /**
   * 检查任务是否被停止
   */
  throwIfStopped(e) {
    if (this.pauseFlag || this.cancelFlag)
      throw Y(
        this.pauseFlag ? "UploadPaused" : "UploadCanceled",
        `Upload stopped ${e}`,
        void 0,
        { fileName: this.file.name }
      );
  }
  /**
   * 恢复checkpoint
   */
  restoreCheckpoint(e) {
    this.state = e.state, this.progress = e.progress, this.loaded = e.loaded, this.startSize = e.loaded, this.lastProgressLoaded = e.loaded, this.upload_id = e.upload_id, this.confirm_key = e.confirm_key, this.bucket = e.bucket, this.region = e.region, this.key = e.key, this.chunk_size = e.chunk_size, this.part_info_list = e.part_info_list || [], this.rapid_upload = e.rapid_upload || !1, this.crc64 = e.crc64, this.start_time = e.start_time || 0, this.end_time = e.end_time || 0, this.used_avg_speed = e.used_avg_speed || 0, this.used_time_len = e.used_time_len || 0;
  }
  /**
   * 获取checkpoint信息
   */
  getCheckpoint() {
    return {
      id: this.id,
      file: {
        name: this.file.name,
        size: this.file.size,
        type: this.file.type
      },
      state: this.state,
      progress: this.progress,
      loaded: this.loaded,
      upload_id: this.upload_id,
      confirm_key: this.confirm_key,
      bucket: this.bucket,
      region: this.region,
      key: this.key,
      chunk_size: this.chunk_size,
      part_info_list: this.part_info_list.map((e) => ({
        part_number: e.part_number,
        chunk_size: e.chunk_size,
        etag: e.etag,
        crc64: e.crc64,
        from: e.from,
        to: e.to,
        start_time: e.start_time,
        end_time: e.end_time
      })),
      crc64: this.crc64,
      rapid_upload: this.rapid_upload,
      start_time: this.start_time,
      end_time: this.end_time,
      used_avg_speed: this.used_avg_speed,
      used_time_len: this.used_time_len
    };
  }
  /**
   * 开始任务
   */
  async start() {
    ["waiting", "error", "paused", "canceled"].includes(this.state) && (await this.changeState(
      "start"
      /* START */
    ), await this.doStart());
  }
  /**
   * 执行开始
   */
  async doStart() {
    this.pauseFlag = !1, this.cancelFlag = !1;
    try {
      await this.run();
    } catch (e) {
      if (this.pauseFlag || this.cancelFlag || R.isCancel(e))
        return;
      await this.handleError(e);
    }
  }
  /**
   * 暂停任务
   */
  async pause() {
    this.pauseFlag = !0, this.clearRenewalTimer(), this.logInfo(`Task paused: ${this.file.name}, progress: ${this.progress.toFixed(2)}%`), await super.pause();
  }
  /**
   * 取消任务
   */
  async cancel() {
    if (!this.cancelFlag) {
      if (this.clearRenewalTimer(), this.confirm_key) {
        try {
          await this.fileApi.abortFileUpload({
            libraryId: this.options.libraryId,
            spaceId: this.options.spaceId,
            confirmKey: this.confirm_key,
            upload: 1,
            accessToken: this.options.accessToken,
            userId: this.options.userId
          });
        } catch {
        }
        this.confirm_key = void 0, this.upload_id = void 0;
      }
      this.logInfo(`Task canceled: ${this.file.name}`), await super.cancel();
    }
  }
  /**
   * 主运行流程
   */
  async run() {
    if (this.start_time || (this.start_time = Date.now()), this.rapid_upload)
      return this.end_time = Date.now(), await this.changeState(
        "success"
        /* SUCCESS */
      );
    if (await this.executeUpload(), this.rapid_upload) {
      this.end_time = Date.now();
      return;
    }
    this.end_time = Date.now(), await this.changeState(
      "success"
      /* SUCCESS */
    );
    const e = this.end_time - this.start_time;
    this.logInfo(`Upload success: ${this.file.name}, size: ${pe(this.file.size)}, time: ${vr(e)}, speed: ${pe(this.used_avg_speed || 0)}/s`);
  }
  /**
   * 执行上传流程
   */
  async executeUpload() {
    const e = this.file.size, t = this.CHUNK_FILE_SIZE, a = this.options.enableInstantUpload !== !1, i = e > t;
    this.logInfo(`Upload strategy: fileSize=${pe(e)}, threshold=${pe(t)}, useMultipart=${i}, enableInstantUpload=${a}`);
    let r;
    a && e >= this.MIN_SIZE_FOR_HASH && !this.confirm_key && !this.rapid_upload && (await this.changeState(
      "computing_hash"
      /* COMPUTING_HASH */
    ), r = await vl(this.options.file, e), this.throwIfStopped("during beginning hash calculation")), i ? await this.executeMultipartUpload(r) : await this.executeSimpleUpload(r);
  }
  /**
   * 执行简单上传
   */
  async executeSimpleUpload(e) {
    var p;
    const t = this.getFileMetaFields(), a = e ? { beginningHash: e, size: String(this.file.size), ...t } : { ...t };
    await this.changeState(
      "created"
      /* CREATED */
    );
    let i = await this.fileApi.simpleUploadFile({
      libraryId: this.options.libraryId,
      spaceId: this.options.spaceId,
      filePath: this.options.filePath,
      filesize: this.file.size,
      accessToken: this.options.accessToken,
      userId: this.options.userId,
      trafficLimit: this.options.trafficLimit,
      simpleUploadFileRequest: a,
      ...this.options.conflictResolutionStrategy && {
        conflictResolutionStrategy: this.options.conflictResolutionStrategy
      }
    }), r = i.status;
    if (r === 202) {
      await this.changeState(
        "computing_hash"
        /* COMPUTING_HASH */
      );
      const c = await Mi(this.options.file, this.file.size, (l) => {
        this.notifyProgress("computing_hash", l);
      });
      if (this.throwIfStopped("during hash calculation"), i = await this.fileApi.simpleUploadFile({
        libraryId: this.options.libraryId,
        spaceId: this.options.spaceId,
        filePath: this.options.filePath,
        filesize: this.file.size,
        accessToken: this.options.accessToken,
        userId: this.options.userId,
        trafficLimit: this.options.trafficLimit,
        simpleUploadFileRequest: {
          fullHash: c,
          beginningHash: e,
          size: String(this.file.size),
          ...t
        },
        ...this.options.conflictResolutionStrategy && {
          conflictResolutionStrategy: this.options.conflictResolutionStrategy
        }
      }), r = i.status, r === 200) {
        if (this.rapid_upload = !0, this.loaded = this.file.size, this.progress = 100, this.updateProgress(this.file.size, { immediately: !0 }), this.start_time) {
          const l = Date.now() - this.start_time;
          this.used_avg_speed = l > 0 ? this.file.size / l * 1e3 : 0, this.speed = this.used_avg_speed;
        }
        await this.changeState(
          "rapid_success"
          /* RAPID_SUCCESS */
        ), this.logInfo(`Rapid upload success: ${this.file.name}`);
        return;
      }
    }
    const s = i.data, { bucket: o, region: n } = kt(s.domain);
    this.confirm_key = s.confirmKey, this.bucket = o, this.region = n, this.key = ((p = s.path) == null ? void 0 : p.replace(/^\//, "")) || "", await this.changeState(
      "running"
      /* RUNNING */
    ), this.task_start_time = Date.now(), this.startCalcSpeed(), await this.simpleUploadWithRetry(s), this.pauseCalcSpeed(), this.calcTotalAvgSpeed(), this.throwIfStopped("after upload completion"), await this.changeState(
      "confirming"
      /* CONFIRMING */
    ), await this.confirmUpload();
  }
  /**
   * 带重试的简单上传
   */
  async simpleUploadWithRetry(e, t = 0) {
    var a;
    try {
      await this.simpleUpload(e);
    } catch (i) {
      if (this.pauseFlag || this.cancelFlag)
        throw i;
      const { isExpired: r } = Gt(i);
      if (t < this.MAX_RETRY_TIMES)
        if (this.loaded = 0, this.startSize = 0, this.lastProgressLoaded = 0, this.updateProgress(0, { immediately: !0 }), r) {
          const o = (await this.fileApi.simpleUploadFile({
            libraryId: this.options.libraryId,
            spaceId: this.options.spaceId,
            filePath: this.options.filePath,
            filesize: this.file.size,
            accessToken: this.options.accessToken,
            userId: this.options.userId,
            trafficLimit: this.options.trafficLimit,
            simpleUploadFileRequest: { ...this.getFileMetaFields() },
            ...this.options.conflictResolutionStrategy && {
              conflictResolutionStrategy: this.options.conflictResolutionStrategy
            }
          })).data, { bucket: n, region: p } = kt(o.domain);
          return this.bucket = n, this.region = p, this.key = ((a = o.path) == null ? void 0 : a.replace(/^\//, "")) || "", this.simpleUploadWithRetry(o, t + 1);
        } else
          return this.logWarn(`Simple upload retry ${t + 1}/${this.MAX_RETRY_TIMES}: ${(i == null ? void 0 : i.message) || i}`), this.simpleUploadWithRetry(e, t + 1);
      else
        throw Y(
          "UploadFailed",
          "Simple upload failed after retries",
          i,
          { fileName: this.file.name, fileSize: this.file.size, retryCount: t }
        );
    }
  }
  /**
   * 简单上传（使用 axios）
   */
  async simpleUpload(e) {
    const t = e.headers || {}, a = `https://${e.domain}${e.path || ""}`;
    this.updateProgress(0, { immediately: !0 }), this.crc64 = await ga(this.options.file);
    const i = await this.toUploadData(this.options.file);
    await R.put(a, i, {
      headers: {
        ...t
      },
      maxContentLength: 1 / 0,
      maxBodyLength: 1 / 0,
      timeout: Math.max(5 * 60 * 1e3, Math.ceil(this.file.size / (100 * 1024)) * 1e3),
      signal: this.abortSignal,
      onUploadProgress: (r) => {
        r.loaded && this.updateProgress(r.loaded);
      }
    }), this.updateProgress(this.file.size, { immediately: !0 });
  }
  /**
   * 执行分块上传
   */
  async executeMultipartUpload(e) {
    var a;
    (!this.part_info_list || this.part_info_list.length === 0) && this.initChunks();
    let t;
    if (this.upload_id && this.confirm_key) {
      const i = await this.renewUploadTask();
      t = {
        domain: i.domain,
        path: i.path || `/${this.key}`,
        uploadId: this.upload_id,
        confirmKey: this.confirm_key,
        expiration: i.expiration,
        headers: i.headers
      };
    } else {
      const i = this.getFileMetaFields(), r = e ? { beginningHash: e, size: String(this.file.size), ...i } : { ...i };
      await this.changeState(
        "created"
        /* CREATED */
      );
      let s = await this.fileApi.multipartUploadFile({
        libraryId: this.options.libraryId,
        spaceId: this.options.spaceId,
        filePath: this.options.filePath,
        multipart: 1,
        filesize: this.file.size,
        accessToken: this.options.accessToken,
        userId: this.options.userId,
        trafficLimit: this.options.trafficLimit,
        multipartUploadFileRequest: r,
        ...this.options.conflictResolutionStrategy && {
          conflictResolutionStrategy: this.options.conflictResolutionStrategy
        }
      }), o = s.status;
      if (o === 202) {
        await this.changeState(
          "computing_hash"
          /* COMPUTING_HASH */
        );
        const c = await Mi(this.options.file, this.file.size, (l) => {
          this.notifyProgress("computing_hash", l);
        });
        if (this.throwIfStopped("during full hash calculation"), s = await this.fileApi.multipartUploadFile({
          libraryId: this.options.libraryId,
          spaceId: this.options.spaceId,
          filePath: this.options.filePath,
          multipart: 1,
          filesize: this.file.size,
          accessToken: this.options.accessToken,
          userId: this.options.userId,
          trafficLimit: this.options.trafficLimit,
          multipartUploadFileRequest: {
            fullHash: c,
            beginningHash: e,
            size: String(this.file.size),
            ...i
          },
          ...this.options.conflictResolutionStrategy && {
            conflictResolutionStrategy: this.options.conflictResolutionStrategy
          }
        }), o = s.status, o === 200) {
          if (this.rapid_upload = !0, this.loaded = this.file.size, this.progress = 100, this.updateProgress(this.file.size, { immediately: !0 }), this.start_time) {
            const l = Date.now() - this.start_time;
            this.used_avg_speed = l > 0 ? this.file.size / l * 1e3 : 0, this.speed = this.used_avg_speed;
          }
          await this.changeState(
            "rapid_success"
            /* RAPID_SUCCESS */
          ), this.logInfo(`Rapid upload success: ${this.file.name}`);
          return;
        }
      }
      t = s.data;
      const { bucket: n, region: p } = kt(t.domain);
      this.confirm_key = t.confirmKey, this.upload_id = t.uploadId, this.bucket = n, this.region = p, this.key = ((a = t.path) == null ? void 0 : a.replace(/^\//, "")) || "", t.expiration && this.scheduleRenewal(t.expiration);
    }
    await this.changeState(
      "running"
      /* RUNNING */
    ), this.task_start_time = Date.now(), this.startCalcSpeed(), await this.multipartUpload(t), this.pauseCalcSpeed(), this.calcTotalAvgSpeed(), this.crc64 || (await this.changeState(
      "computing_hash"
      /* COMPUTING_HASH */
    ), this.crc64 = await this.calculateMultipartCRC64(), this.throwIfStopped("after CRC64 calculation")), await this.changeState(
      "confirming"
      /* CONFIRMING */
    ), await this.confirmUpload();
  }
  /**
   * 上传单个分片
   */
  async uploadSinglePart(e, t, a, i = 0) {
    if (this.throwIfStopped("during part upload"), e.etag)
      return;
    e.start_time = Date.now();
    const r = `https://${t.domain}${t.path || ""}?partNumber=${e.part_number}&uploadId=${this.upload_id}`, s = this.options.file.slice(e.from, e.to), o = await this.toUploadData(s);
    try {
      const n = await R.put(r, o, {
        headers: {
          ...a
        },
        maxContentLength: 1 / 0,
        maxBodyLength: 1 / 0,
        timeout: Math.max(3e5, Math.ceil(e.chunk_size / 102400) * 1e3),
        signal: this.abortSignal
      });
      e.etag = n.headers.etag || n.headers.ETag || "", e.end_time = Date.now(), e.crc64 || (e.crc64 = await ga(s)), this.loaded += e.chunk_size, this.updateProgress(this.loaded, { immediately: !0 }), this.notifyPartCompleted(e), this.logInfo(`Part ${e.part_number}/${this.part_info_list.length} uploaded, size: ${pe(e.chunk_size)}`);
    } catch (n) {
      if (this.pauseFlag || this.cancelFlag || R.isCancel(n))
        throw n;
      if (i < this.MAX_RETRY_TIMES)
        return this.logWarn(`Part ${e.part_number} upload retry ${i + 1}/${this.MAX_RETRY_TIMES}`), await new Promise((p) => setTimeout(p, Math.min(1e3 * Math.pow(2, i), 1e4))), this.uploadSinglePart(e, t, a, i + 1);
      throw n;
    }
  }
  /**
   * 分块上传
   */
  async multipartUpload(e, t = 0) {
    const a = e.headers || {}, i = this.options.parallel || this.DEFAULT_PARALLEL;
    let r = 0;
    this.part_info_list && this.part_info_list.length > 0 && this.part_info_list.forEach((s) => {
      s.etag && (r += s.chunk_size);
    }), this.loaded = r, r > 0 ? this.updateProgress(r, { immediately: !0, init: !0 }) : this.updateProgress(0, { immediately: !0 });
    try {
      const s = this.part_info_list.filter((o) => !o.etag);
      await Er(
        s,
        i,
        async (o) => {
          await this.uploadSinglePart(o, e, a);
        },
        { shouldStop: () => this.pauseFlag || this.cancelFlag }
      ), this.updateProgress(this.file.size, { immediately: !0 });
    } catch (s) {
      if (this.pauseFlag || this.cancelFlag)
        throw s;
      const { isExpired: o } = Gt(s);
      if (o && t < this.MAX_RETRY_TIMES)
        try {
          const n = await this.renewUploadTask();
          return this.logWarn(`Multipart upload retry ${t + 1}/${this.MAX_RETRY_TIMES}: signature expired`), this.multipartUpload({
            ...n,
            headers: n.headers
          }, t + 1);
        } catch (n) {
          throw Y(
            "RenewUploadFailed",
            "Failed to renew multipart upload",
            n,
            { fileName: this.file.name, confirmKey: this.confirm_key }
          );
        }
      else
        throw Y(
          "PartUploadFailed",
          "Multipart upload failed after retries",
          s,
          { fileName: this.file.name, fileSize: this.file.size, retryCount: t }
        );
    }
  }
  /**
   * 动态计算分块大小
   */
  calcAutoChunkSize(e, t) {
    const a = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 5120], i = 1e4;
    let r = 1024 * 1024;
    for (let s = 0; s < a.length && (r = a[s] * 1024 * 1024, !(e / r <= i)); s++)
      ;
    return Math.max(t, r);
  }
  /**
   * 初始化分片信息
   */
  initChunks() {
    const e = this.file.size, t = 1e4, a = 1 * 1024 * 1024, i = 5 * 1024 * 1024 * 1024, r = i * t;
    if (e > r)
      throw Y(
        "FileTooLarge",
        `File size ${pe(e)} exceeds maximum supported size ${pe(r)}`,
        void 0,
        { fileSize: e, maxFileSize: r }
      );
    let s = this.calcAutoChunkSize(e, this.chunk_size);
    if (s < a && (s = a), s > i)
      throw Y(
        "InvalidParameter",
        `Required chunk size ${pe(s)} exceeds maximum chunk size ${pe(i)}`,
        void 0,
        { chunkSize: s, maxChunkSize: i }
      );
    let o = Math.ceil(e / s);
    if (o > t)
      throw Y(
        "InvalidParameter",
        `File size ${pe(e)} requires ${o} parts, exceeds maximum ${t} parts`,
        void 0,
        { fileSize: e, partCount: o, maxPartCount: t }
      );
    this.chunk_size = s, this.part_info_list = [];
    for (let n = 0; n < o; n++) {
      const p = n * s, c = Math.min((n + 1) * s, e);
      this.part_info_list.push({
        part_number: n + 1,
        chunk_size: c - p,
        from: p,
        to: c
      });
    }
  }
  /**
   * 计算分块上传的 CRC64
   */
  async calculateMultipartCRC64() {
    if (!this.part_info_list || this.part_info_list.length === 0)
      throw Y(
        "OperationFailed",
        "No part info available for CRC64 calculation",
        void 0,
        { fileName: this.file.name }
      );
    for (const e of this.part_info_list)
      if (!e.crc64) {
        const t = this.options.file.slice(e.from, e.to);
        e.crc64 = await ga(t);
      }
    return _r(
      this.part_info_list.map((e) => ({ crc64: e.crc64, size: e.chunk_size }))
    );
  }
  /**
   * 确认上传
   */
  async confirmUpload() {
    await this.fileApi.completeFileUpload({
      libraryId: this.options.libraryId,
      spaceId: this.options.spaceId,
      confirmKey: this.confirm_key,
      confirm: 1,
      accessToken: this.options.accessToken,
      userId: this.options.userId,
      completeFileUploadRequest: {
        crc64: this.crc64,
        ...this.getFileMetaFields()
      },
      ...this.options.conflictResolutionStrategy && {
        conflictResolutionStrategy: this.options.conflictResolutionStrategy
      }
    });
  }
  /**
   * 续期上传任务
   */
  async renewUploadTask() {
    if (!this.confirm_key)
      throw Y(
        "RenewUploadFailed",
        "Cannot renew upload task: confirm_key is missing",
        void 0,
        { fileName: this.file.name }
      );
    try {
      const t = (await this.fileApi.renewMultipartUpload({
        libraryId: this.options.libraryId,
        spaceId: this.options.spaceId,
        confirmKey: this.confirm_key,
        renew: 1,
        trafficLimit: this.options.trafficLimit,
        accessToken: this.options.accessToken,
        userId: this.options.userId
      })).data;
      if (t.domain) {
        const { bucket: a, region: i } = kt(t.domain);
        this.bucket = a, this.region = i, t.expiration && this.scheduleRenewal(t.expiration);
      }
      return t;
    } catch (e) {
      const t = Y(
        "RenewUploadFailed",
        "Failed to renew upload task",
        e,
        { confirmKey: this.confirm_key }
      );
      throw await this.handleError(t), t;
    }
  }
  /**
   * 安排续期定时器
   */
  scheduleRenewal(e) {
    this.clearRenewalTimer();
    const t = new Date(e).getTime(), a = Date.now(), i = (t - a) / 1e3, r = t - a - 5 * 60 * 1e3;
    if (i < 5 * 60) {
      this.renewUploadTask();
      return;
    }
    r > 0 && this.state === "running" && (this.renewTimer = setTimeout(() => {
      this.renewUploadTask();
    }, r));
  }
  /**
   * 清除续期定时器
   */
  clearRenewalTimer() {
    this.renewTimer && (clearTimeout(this.renewTimer), this.renewTimer = void 0);
  }
  getFileMetaFields() {
    const e = {};
    return this.options.labels && (e.labels = this.options.labels), this.options.category && (e.category = this.options.category), this.options.localCreationTime && (e.localCreationTime = this.options.localCreationTime), this.options.localModificationTime && (e.localModificationTime = this.options.localModificationTime), e;
  }
  async toUploadData(e) {
    if (e == null || typeof Buffer < "u" && Buffer.isBuffer(e) || typeof e.pipe == "function" || e instanceof ArrayBuffer || typeof Uint8Array < "u" && e instanceof Uint8Array || this.isNativeBlob(e)) return e;
    if (typeof e.arrayBuffer == "function" && typeof e.size == "number") {
      const t = await e.arrayBuffer();
      return typeof Buffer < "u" ? Buffer.from(t) : t;
    }
    return e;
  }
  isNativeBlob(e) {
    const t = e == null ? void 0 : e[Symbol.toStringTag];
    return t === "Blob" || t === "File" || typeof Blob < "u" && e instanceof Blob;
  }
  /**
   * 改变状态
   */
  async changeState(e, t) {
    await super.changeState(e, t);
    const a = this.getCheckpoint();
    if (typeof this.options.onStateChange == "function")
      try {
        await this.options.onStateChange(a, e, t);
      } catch {
      }
  }
  /**
   * 通知进度
   */
  notifyProgress(e, t) {
    super.notifyProgress(e, t), typeof this.options.onProgress == "function" && this.options.onProgress({
      state: e,
      loaded: this.loaded,
      total: this.file.size,
      progress: t,
      speed: this.speed,
      leftTime: this.left_time
    });
  }
  /**
   * 通知分片完成
   */
  notifyPartCompleted(e) {
    const t = this.getCheckpoint();
    typeof this.options.onPartComplete == "function" && this.options.onPartComplete(t, e), this.emit("partialcomplete", { checkpoint: t, partInfo: e });
  }
  /**
   * 处理错误
   */
  async handleError(e) {
    const t = La(
      e,
      "UploadFailed",
      "Upload failed",
      {
        fileName: this.file.name,
        fileSize: this.file.size,
        elapsedTime: (this.end_time || Date.now()) - this.start_time
      }
    );
    return this.logError(`Upload failed: ${this.file.name}, error: ${t.message}`), super.handleError(t);
  }
}, zi = class extends Rr {
  constructor(e, t, a) {
    if (!e || !e.path)
      throw Y(
        "InvalidParameter",
        "Invalid remote file: file and file.path are required",
        void 0,
        { file: e }
      );
    const i = {
      name: e.name,
      size: e.size || 0,
      type: e.type
    };
    super(i, { verbose: t.verbose }), this.part_info_list = [], this.is_multipart = !1, this.local_crc64 = Ze, this.DEFAULT_PARALLEL = 2, this.options = t, this.fileApi = new jt(a), this.MULTIPART_THRESHOLD = (t.partFileSize || 32) * 1024 * 1024, this.chunk_size = (t.chunkSize || 5) * 1024 * 1024, t.checkpoint && this.restoreCheckpoint(t.checkpoint);
  }
  /**
   * 通过浏览器 URL 方式下载文件（推荐用于 Web 端）
   * 获取 cosUrl 后通过 <a> 标签触发浏览器原生下载，
   * 不会将文件内容加载到内存中，适合任意大小的文件。
   * 
   * @param options - URL 下载选项
   * @param configuration - SDK 配置
   * 
   */
  static async downloadByUrl(e, t) {
    const r = (await new jt(t).infoFile({
      libraryId: e.libraryId,
      spaceId: e.spaceId,
      filePath: e.filePath,
      info: 1,
      contentDisposition: "attachment",
      accessToken: e.accessToken,
      userId: e.userId,
      trafficLimit: e.trafficLimit,
      purpose: "download"
    })).data, s = r == null ? void 0 : r.cosUrl;
    if (!s)
      throw Y(
        "OperationFailed",
        "Failed to get download URL: cosUrl not found in response",
        void 0,
        { filePath: e.filePath }
      );
    const o = e.fileName || e.filePath.split("/").pop() || "download", n = document.createElement("a");
    n.href = s, n.download = o, n.style.display = "none", document.body.appendChild(n), n.click(), document.body.removeChild(n);
  }
  getTaskType() {
    return "download";
  }
  /**
   * 恢复 checkpoint
   */
  restoreCheckpoint(e) {
    this.state = e.state, this.progress = e.progress, this.loaded = e.loaded, this.startSize = e.loaded, this.lastProgressLoaded = e.loaded, this.download_url = e.download_url, this.chunk_size = e.chunk_size, this.part_info_list = e.part_info_list || [], this.remote_crc64 = e.remote_crc64, this.is_multipart = e.is_multipart || !1, this.start_time = e.start_time || 0, this.end_time = e.end_time || 0, this.used_avg_speed = e.used_avg_speed || 0, this.used_time_len = e.used_time_len || 0;
  }
  /**
   * 获取 checkpoint 信息
   */
  getCheckpoint() {
    return {
      id: this.id,
      file: {
        name: this.file.name,
        size: this.file.size,
        type: this.file.type
      },
      state: this.state,
      progress: this.progress,
      loaded: this.loaded,
      download_url: this.download_url,
      chunk_size: this.chunk_size,
      part_info_list: this.part_info_list.map((e) => ({
        part_number: e.part_number,
        start: e.start,
        end: e.end,
        size: e.size,
        done: e.done,
        crc64: e.crc64
      })),
      remote_crc64: this.remote_crc64,
      is_multipart: this.is_multipart,
      start_time: this.start_time,
      end_time: this.end_time,
      used_avg_speed: this.used_avg_speed,
      used_time_len: this.used_time_len
    };
  }
  /**
   * 开始下载
   * @returns 下载完成后返回 Blob
   */
  async start() {
    ["waiting", "error", "paused", "canceled"].includes(this.state) && (await this.changeState(
      "start"
      /* START */
    ), await this.doStart());
  }
  /**
   * 开始下载并返回结果
   * @returns 下载完成后返回 Blob
   */
  async startAndGetBlob() {
    if (!["waiting", "error", "paused", "canceled"].includes(this.state)) {
      if (this.resultBlob)
        return this.resultBlob;
      throw Y("OperationFailed", "Download already in progress");
    }
    return await this.changeState(
      "start"
      /* START */
    ), await this.doStartAndGetBlob();
  }
  /**
   * 执行开始
   */
  async doStart() {
    this.pauseFlag = !1, this.cancelFlag = !1;
    try {
      await this.run();
    } catch (e) {
      if (this.pauseFlag || this.cancelFlag)
        return;
      const t = e;
      if ((t == null ? void 0 : t.name) === "AbortError")
        return;
      await this.handleError(t);
    }
  }
  /**
   * 执行开始并返回结果
   */
  async doStartAndGetBlob() {
    this.pauseFlag = !1, this.cancelFlag = !1;
    try {
      return await this.run();
    } catch (e) {
      if (this.pauseFlag || this.cancelFlag)
        throw e;
      const t = e;
      throw (t == null ? void 0 : t.name) === "AbortError" || await this.handleError(t), e;
    }
  }
  /**
   * 暂停下载
   */
  async pause() {
    this.is_multipart || (this.local_crc64 = Ze), this.logWarn(`Task paused: ${this.file.name}, progress: ${this.progress.toFixed(2)}%`), await super.pause();
  }
  /**
   * 取消下载
   */
  async cancel() {
    this.is_multipart && this.part_info_list && this.part_info_list.length > 0 && this.part_info_list.forEach((e) => {
      e.blob = void 0, e.done = !1;
    }), this.loaded = 0, this.progress = 0, this.resultBlob = void 0, this.logWarn(`Task canceled: ${this.file.name}`), await super.cancel();
  }
  /**
   * 获取下载结果
   */
  getResult() {
    return this.resultBlob;
  }
  /**
   * 主运行流程
   */
  async run() {
    this.start_time || (this.start_time = Date.now()), await this.getDownloadUrl();
    const e = (this.file.size || 0) > this.MULTIPART_THRESHOLD;
    this.is_multipart = e, await this.changeState(
      "preparing"
      /* PREPARING */
    ), e ? ((!this.part_info_list || this.part_info_list.length === 0) && this.initChunks(), this.updateProgress(this.loaded, { immediately: !0, init: !0 }), await this.changeState(
      "running"
      /* RUNNING */
    ), this.task_start_time = Date.now(), this.startCalcSpeed(), await this.multipartDownload(), this.pauseCalcSpeed(), this.calcTotalAvgSpeed()) : (await this.changeState(
      "running"
      /* RUNNING */
    ), this.task_start_time = Date.now(), this.startCalcSpeed(), await this.simpleDownloadWithRetry(), this.pauseCalcSpeed(), this.calcTotalAvgSpeed());
    const t = await this.finalizeDownload();
    this.end_time = Date.now(), await this.changeState(
      "success"
      /* SUCCESS */
    );
    const a = this.end_time - this.start_time;
    return this.logInfo(`Download success: ${this.file.name}, size: ${pe(this.file.size)}, time: ${vr(a)}, speed: ${pe(this.used_avg_speed || 0)}/s`), t;
  }
  /**
   * 检查是否被停止
   */
  throwIfStopped(e) {
    if (this.pauseFlag || this.cancelFlag)
      throw Y(
        this.pauseFlag ? "DownloadPaused" : "DownloadCanceled",
        `Download stopped ${e}`,
        void 0,
        { fileName: this.file.name }
      );
  }
  /**
   * 获取下载 URL
   */
  async getDownloadUrl() {
    try {
      const t = (await this.fileApi.infoFile({
        libraryId: this.options.libraryId,
        spaceId: this.options.spaceId,
        filePath: this.options.filePath,
        info: 1,
        accessToken: this.options.accessToken,
        userId: this.options.userId,
        trafficLimit: this.options.trafficLimit,
        purpose: "download"
      })).data, a = t == null ? void 0 : t.cosUrl;
      t != null && t.size && (this.file.size = Number(t.size)), t != null && t.crc64 && !this.remote_crc64 && (this.remote_crc64 = t.crc64), this.download_url = a;
    } catch (e) {
      throw e;
    }
  }
  /**
   * 初始化分片列表
   */
  initChunks() {
    const e = this.file.size || 0, t = this.chunk_size, a = Math.ceil(e / t);
    this.part_info_list = [];
    for (let i = 0; i < a; i++) {
      const r = i * t, s = Math.min((i + 1) * t, e) - 1;
      this.part_info_list.push({
        part_number: i + 1,
        start: r,
        end: s,
        size: s - r + 1,
        done: !1
      });
    }
  }
  /**
   * 带重试的简单下载
   */
  async simpleDownloadWithRetry(e = 0) {
    try {
      await this.simpleDownload();
    } catch (t) {
      if (this.pauseFlag || this.cancelFlag)
        throw t;
      const a = t;
      if ((a == null ? void 0 : a.name) === "AbortError")
        throw t;
      const { isExpired: i } = Gt(t);
      if (e < this.MAX_RETRY_TIMES)
        return this.logWarn(`Simple download retry ${e + 1}/${this.MAX_RETRY_TIMES}`), await new Promise((r) => setTimeout(r, Math.min(1e3 * Math.pow(2, e), 1e4))), i && await this.getDownloadUrl(), this.simpleDownloadWithRetry(e + 1);
      throw this.logError(`Simple download failed: ${this.file.name}`), t;
    }
  }
  /**
   * 简单下载
   */
  async simpleDownload() {
    var o;
    this.updateProgress(0, { immediately: !0 }), this.local_crc64 = Ze;
    const e = await fetch(this.download_url, {
      method: "GET",
      signal: this.abortSignal
    });
    if (!e.ok)
      throw new Error(`Download failed with status ${e.status}`);
    const t = e.headers.get("content-length"), a = t ? Number(t) : this.file.size || 0;
    a > 0 && this.file.size !== a && (this.file.size = a, this.updateProgress(0, { immediately: !0 }));
    const i = (o = e.body) == null ? void 0 : o.getReader();
    if (!i)
      throw new Error("Failed to get response reader");
    const r = [];
    let s = 0;
    try {
      for (; ; ) {
        const { done: n, value: p } = await i.read();
        if (n) break;
        p && (r.push(p.buffer.slice(p.byteOffset, p.byteOffset + p.byteLength)), s += p.length, this.local_crc64 = Oa(this.local_crc64, p), this.updateProgress(s));
      }
    } finally {
      i.releaseLock();
    }
    this.resultBlob = new Blob(r, { type: this.file.type || "application/octet-stream" });
  }
  /**
   * 分片下载
   */
  async multipartDownload() {
    const e = this.options.parallel || this.DEFAULT_PARALLEL;
    let t = 0;
    this.part_info_list.forEach((r) => {
      r.done && r.blob && (t += r.size);
    }), this.loaded = t, t > 0 ? this.updateProgress(t, { immediately: !0, init: !0 }) : this.updateProgress(0, { immediately: !0 });
    const a = async (r, s = 0) => {
      var o;
      if (this.throwIfStopped("during multipart download"), !(r.done && r.blob))
        try {
          const n = {
            Range: `bytes=${r.start}-${r.end}`
          }, p = await fetch(this.download_url, {
            method: "GET",
            headers: n,
            signal: this.abortSignal
          });
          if (!p.ok && p.status !== 206)
            throw new Error(`Part download failed with status ${p.status}`);
          const c = (o = p.body) == null ? void 0 : o.getReader();
          if (!c)
            throw new Error("Failed to get response reader");
          const l = [];
          let d = Ze;
          try {
            for (; ; ) {
              const { done: h, value: u } = await c.read();
              if (h) break;
              u && (l.push(u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength)), d = Oa(d, u));
            }
          } finally {
            c.releaseLock();
          }
          r.blob = new Blob(l), r.crc64 = Jt(d), r.done = !0, this.loaded += r.size, this.updateProgress(this.loaded, { immediately: !0 }), this.notifyPartCompleted(r), this.logInfo(`Part ${r.part_number}/${this.part_info_list.length} downloaded, size: ${pe(r.size)}, crc64: ${r.crc64}`);
        } catch (n) {
          if (this.pauseFlag || this.cancelFlag)
            throw n;
          const p = n;
          if ((p == null ? void 0 : p.name) === "AbortError")
            throw n;
          const { isExpired: c } = Gt(n);
          if (s < this.MAX_RETRY_TIMES)
            return this.logWarn(`Part ${r.part_number} download retry ${s + 1}/${this.MAX_RETRY_TIMES}`), c && await this.getDownloadUrl(), await new Promise((l) => setTimeout(l, Math.min(1e3 * Math.pow(2, s), 1e4))), a(r, s + 1);
          throw n;
        }
    }, i = this.part_info_list.filter((r) => !r.done || !r.blob);
    await Er(
      i,
      e,
      async (r) => {
        await a(r);
      },
      { shouldStop: () => this.pauseFlag || this.cancelFlag }
    );
  }
  /**
   * 完成下载，验证并返回结果
   */
  async finalizeDownload() {
    var e;
    if (this.file.size) {
      const t = this.is_multipart ? this.part_info_list.reduce((a, i) => {
        var r;
        return a + (((r = i.blob) == null ? void 0 : r.size) || 0);
      }, 0) : ((e = this.resultBlob) == null ? void 0 : e.size) || 0;
      if (t !== this.file.size)
        throw Y(
          "FileSizeMismatch",
          `Download size mismatch: expected ${this.file.size}, got ${t}`,
          void 0,
          { expectedSize: this.file.size, actualSize: t }
        );
    }
    if (this.remote_crc64) {
      let t;
      if (this.is_multipart ? t = this.combinePartCrc64() : t = Jt(this.local_crc64), t !== this.remote_crc64)
        throw Y(
          "FileCrc64Mismatch",
          `Download CRC64 mismatch: expected ${this.remote_crc64}, got ${t}`
        );
    }
    if (this.is_multipart) {
      const t = this.part_info_list.sort((i, r) => i.part_number - r.part_number), a = t.map((i) => i.blob);
      this.resultBlob = new Blob(a, { type: this.file.type || "application/octet-stream" }), t.forEach((i) => {
        i.blob = void 0;
      });
    }
    return this.resultBlob;
  }
  /**
   * 合并分片 CRC64
   */
  combinePartCrc64() {
    const e = this.part_info_list.filter((t) => t.done && t.crc64).sort((t, a) => t.part_number - a.part_number).map((t) => ({ crc64: t.crc64, size: t.size }));
    return _r(e);
  }
  /**
   * 改变状态
   */
  async changeState(e, t) {
    await super.changeState(e, t);
    const a = this.getCheckpoint();
    if (typeof this.options.onStateChange == "function")
      try {
        await this.options.onStateChange(a, e, t);
      } catch {
      }
  }
  /**
   * 通知进度
   */
  notifyProgress(e, t) {
    super.notifyProgress(e, t), typeof this.options.onProgress == "function" && this.options.onProgress({
      state: e,
      loaded: this.loaded,
      total: this.file.size,
      progress: t,
      speed: this.speed,
      leftTime: this.left_time
    });
  }
  /**
   * 通知分片完成
   */
  notifyPartCompleted(e) {
    const t = this.getCheckpoint();
    typeof this.options.onPartComplete == "function" && this.options.onPartComplete(t, e), this.emit("partialcomplete", { checkpoint: t, partInfo: e });
  }
  /**
   * 处理错误
   */
  async handleError(e) {
    const t = La(
      e,
      "DownloadFailed",
      "Download failed",
      {
        fileName: this.file.name,
        fileSize: this.file.size,
        elapsedTime: (this.end_time || Date.now()) - this.start_time
      }
    );
    return this.is_multipart || (this.resultBlob = void 0), this.logError(`Download failed: ${this.file.name}, error: ${t.message}`), super.handleError(t);
  }
}, xr = class {
  constructor(e = {}) {
    var a;
    this.refreshingPromise = null, this.defaultLibraryId = e.libraryId, this.defaultSpaceId = e.spaceId, this.defaultAccessToken = e.accessToken, this.onTokenRefresh = e.onTokenRefresh, this.axiosInstance = R.create({
      timeout: e.timeout || 3e4,
      ...e.baseOptions,
      headers: {
        // TODO：暂定Client-Version，后面需改成X-SMH-SDK-Version
        "Client-Version": rl(),
        ...(a = e.baseOptions) == null ? void 0 : a.headers
      }
    }), this.setupRetryInterceptor(e.maxRetries || 3, e.retryDelay || 1e3), this.configuration = new el({
      basePath: e.basePath,
      baseOptions: e.baseOptions
    });
    const t = this.configuration.basePath;
    this._batch = new wn(this.configuration, t, this.axiosInstance), this._directory = new _n(this.configuration, t, this.axiosInstance), this._favorite = new xn(this.configuration, t, this.axiosInstance), this._file = new jt(this.configuration, t, this.axiosInstance), this._history = new Un(this.configuration, t, this.axiosInstance), this._hls = new Tn(this.configuration, t, this.axiosInstance), this._quota = new Nn(this.configuration, t, this.axiosInstance), this._recent = new Mn(this.configuration, t, this.axiosInstance), this._recycled = new Pn(this.configuration, t, this.axiosInstance), this._search = new jn(this.configuration, t, this.axiosInstance), this._space = new Jn(this.configuration, t, this.axiosInstance), this._task = new Xn(this.configuration, t, this.axiosInstance), this._token = new Zn(this.configuration, t, this.axiosInstance), this._usage = new qn(this.configuration, t, this.axiosInstance), this.batch = this.wrapApi(this._batch), this.directory = this.wrapApi(this._directory), this.favorite = this.wrapApi(this._favorite), this.file = this.wrapApi(this._file), this.history = this.wrapApi(this._history), this.hls = this.wrapApi(this._hls), this.quota = this.wrapApi(this._quota), this.recent = this.wrapApi(this._recent), this.recycled = this.wrapApi(this._recycled), this.search = this.wrapApi(this._search), this.space = this.wrapApi(this._space), this.task = this.wrapApi(this._task), this.token = this.wrapApi(this._token, { skipTokenRefresh: !0 }), this.usage = this.wrapApi(this._usage);
  }
  /**
   * 设置重试拦截器
   */
  setupRetryInterceptor(e, t) {
    this.axiosInstance.interceptors.response.use(void 0, async (a) => {
      const i = a.config;
      if (!i || (i._retryCount ?? 0) >= e)
        return Promise.reject(a);
      if (a.code === "ECONNABORTED" || a.code === "ETIMEDOUT" || a.response && a.response.status >= 500) {
        i._retryCount = (i._retryCount || 0) + 1;
        const r = t * Math.pow(2, i._retryCount - 1);
        return new Promise((s) => {
          setTimeout(() => {
            s(this.axiosInstance.request(i));
          }, r);
        });
      }
      return Promise.reject(a);
    });
  }
  /**
   * 更新配置
   */
  updateConfig(e) {
    e.basePath && (this.configuration.basePath = e.basePath), e.baseOptions && (this.configuration.baseOptions = {
      ...this.configuration.baseOptions,
      ...e.baseOptions
    });
  }
  /**
   * 获取当前配置
   */
  getConfig() {
    return this.configuration;
  }
  /**
   * 设置访问令牌
   */
  setAccessToken(e) {
    this.configuration.accessToken = e;
  }
  /**
   * 清除访问令牌
   */
  clearAccessToken() {
    this.configuration.accessToken = void 0;
  }
  /**
   * 更新默认的 libraryId
   */
  setDefaultLibraryId(e) {
    this.defaultLibraryId = e;
  }
  /**
   * 更新默认的 spaceId
   */
  setDefaultSpaceId(e) {
    this.defaultSpaceId = e;
  }
  /**
   * 更新默认的 accessToken
   */
  setDefaultAccessToken(e) {
    this.defaultAccessToken = e;
  }
  /**
   * 获取默认的 libraryId
   */
  getDefaultLibraryId() {
    return this.defaultLibraryId;
  }
  /**
   * 获取默认的 spaceId
   */
  getDefaultSpaceId() {
    return this.defaultSpaceId;
  }
  /**
   * 获取默认的 accessToken
   */
  getDefaultAccessToken() {
    return this.defaultAccessToken;
  }
  /**
   * 包装API实例，自动注入 libraryId 和 accessToken
   */
  wrapApi(e, t) {
    const a = (t == null ? void 0 : t.skipTokenRefresh) ?? !1;
    return new Proxy(e, {
      get: (i, r) => {
        const s = i[r];
        return typeof s != "function" ? s : async (...o) => {
          if (o.length > 0 && typeof o[0] == "object" && o[0] !== null) {
            const n = { ...o[0] };
            r !== "createToken" && r !== "renewToken" && !n.libraryId && this.defaultLibraryId && (n.libraryId = this.defaultLibraryId), !n.spaceId && this.defaultSpaceId && (n.spaceId = this.defaultSpaceId), !n.accessToken && this.defaultAccessToken && (n.accessToken = this.defaultAccessToken), o[0] = n;
          }
          try {
            const n = await s.apply(i, o);
            if (r === "deleteToken" && o.length > 0 && typeof o[0] == "object" && o[0] !== null) {
              const p = o[0];
              p.accessToken && p.accessToken === this.defaultAccessToken && (this.defaultAccessToken = void 0);
            }
            return n;
          } catch (n) {
            if (!a && this.onTokenRefresh && this.isTokenExpiredError(n))
              try {
                const p = await this.doTokenRefresh();
                if (p)
                  return o.length > 0 && typeof o[0] == "object" && o[0] !== null && (o[0] = { ...o[0], accessToken: p }), await s.apply(i, o);
              } catch (p) {
                console.warn("[SMHClient] Token refresh failed, will throw original error:", (p == null ? void 0 : p.message) || p);
              }
            throw n instanceof It ? n : La(
              n,
              "OperationFailed",
              `${String(r)} failed`,
              { api: String(r) }
            );
          }
        };
      }
    });
  }
  /**
   * 创建上传任务
   * 自动注入 libraryId、spaceId、accessToken 和 configuration
   * @returns Uploader 实例
   */
  createUploadTask(e) {
    const t = {
      ...e,
      libraryId: e.libraryId || this.defaultLibraryId || "",
      spaceId: e.spaceId || this.defaultSpaceId || "",
      accessToken: e.accessToken || this.defaultAccessToken || ""
    };
    return new Cl(t, this.configuration);
  }
  /**
   * 创建下载任务
   * 自动注入 libraryId、spaceId、accessToken 和 configuration
   * @returns Downloader 实例
   */
  createDownloadTask(e) {
    const t = {
      ...e,
      libraryId: e.libraryId || this.defaultLibraryId || "",
      spaceId: e.spaceId || this.defaultSpaceId || "",
      accessToken: e.accessToken || this.defaultAccessToken || ""
    }, a = {
      name: e.filePath.split("/").pop() || "unknown",
      path: e.filePath,
      size: void 0,
      type: void 0
    };
    return new zi(a, t, this.configuration);
  }
  /**
   * 通过浏览器 URL 方式下载文件（推荐用于 Web 端）
   * 获取 cosUrl 后通过 <a> 标签触发浏览器原生下载，
   * 不需要将文件内容加载到内存中，适合任意大小的文件。
   * 
   * @example
   * ```typescript
   * await client.downloadByUrl({
   *   filePath: 'docs/file.pdf',
   *   fileName: 'my-file.pdf'  // 可选，自定义保存文件名
   * });
   * ```
   */
  async downloadByUrl(e) {
    const t = {
      ...e,
      libraryId: e.libraryId || this.defaultLibraryId || "",
      spaceId: e.spaceId || this.defaultSpaceId || "",
      accessToken: e.accessToken || this.defaultAccessToken || ""
    };
    return zi.downloadByUrl(t, this.configuration);
  }
  /**
   * 设置或更新 Token 续期回调（运行时动态设置）
   * 
   * @example
   * ```ts
   * client.setOnTokenRefresh(async () => {
   *   const res = await myBackend.refreshToken();
   *   return res.accessToken;
   * });
   * ```
   */
  setOnTokenRefresh(e) {
    this.onTokenRefresh = e;
  }
  /**
   * 判断错误是否为 token 过期
   */
  isTokenExpiredError(e) {
    var a;
    const t = br(e);
    return t.status === 403 && t.serverCode === "InvalidAccessToken" || e instanceof It && e.status === 403 && ((a = e.response) == null ? void 0 : a.serverCode) === "InvalidAccessToken";
  }
  /**
   * 执行 token 续期（带防抖，并发请求只触发一次）
   */
  async doTokenRefresh() {
    return this.onTokenRefresh ? this.refreshingPromise ? this.refreshingPromise : (this.refreshingPromise = this.onTokenRefresh().then((e) => (e && (this.defaultAccessToken = e, this.configuration.accessToken = e), e)).finally(() => {
      this.refreshingPromise = null;
    }), this.refreshingPromise) : "";
  }
};
/*! Bundled license information:

hash-wasm/dist/index.esm.js:
  (*!
   * hash-wasm (https://www.npmjs.com/package/hash-wasm)
   * (c) Dani Biro
   * @license MIT
   *)
*/
const ge = /* @__PURE__ */ new Map();
let qe = null, Ue = null, Ma = "", ae = "", za = "";
function _l(e) {
  if (e.libraryId && (Ma = e.libraryId), e.basePath && (za = e.basePath.replace(/\/+$/, "")), typeof e.getAccessToken == "function" && (qe = e.getAccessToken), typeof e.onError == "function" && (Ue = e.onError), e.spaceId && e.spaceId !== ae) {
    ae && ze() && ge.set(ae, {
      accessToken: ze(),
      expiresAt: tt()
    }), ae = e.spaceId;
    const t = ge.get(ae);
    t && console.log("[SMH Token 缓存] 从缓存恢复 space token", {
      spaceId: ae,
      hasToken: !!t.accessToken,
      expiresAt: t.expiresAt ? new Date(t.expiresAt).toISOString() : "未设置",
      isExpired: t.expiresAt ? t.expiresAt <= Date.now() : !0
    });
  } else e.spaceId && (ae = e.spaceId);
}
function ze() {
  const e = ge.get(ae);
  return (e == null ? void 0 : e.accessToken) || "";
}
function ma(e) {
  const t = ge.get(ae) || {};
  t.accessToken = e, ge.set(ae, t);
}
function tt() {
  const e = ge.get(ae);
  return (e == null ? void 0 : e.expiresAt) || 0;
}
function Pi(e) {
  const t = ge.get(ae) || {};
  t.expiresAt = e, ge.set(ae, t);
}
function Rl() {
  return ze();
}
function Pa() {
  return Ma;
}
function ia() {
  return ae;
}
function Ha() {
  return za;
}
function Hi() {
  return {
    expiresAt: tt()
  };
}
function Pt() {
  const e = tt();
  return e ? Date.now() > e - 5 * 60 * 1e3 : !0;
}
function $i() {
  const e = tt();
  return e ? Date.now() > e : !0;
}
function ba(e) {
  e && (e <= Date.now() ? (console.warn("[SMH Token 续期] 返回的 expiresAt 已过期，使用默认有效期（2小时）", {
    returnedExpiresAt: new Date(e).toISOString(),
    now: (/* @__PURE__ */ new Date()).toISOString()
  }), Pi(Date.now() + 7200 * 1e3)) : Pi(e));
}
const ft = /* @__PURE__ */ new Map();
async function ra() {
  const e = ze();
  if (e && !Pt())
    return e;
  if (console.log("[SMH Token 续期] 触发续期检查", {
    spaceId: ae,
    hasToken: !!e,
    expiresAt: tt() ? new Date(tt()).toISOString() : "未设置",
    isExpiringSoon: Pt(),
    isExpired: $i(),
    now: (/* @__PURE__ */ new Date()).toISOString(),
    hasGetAccessToken: !!qe,
    cacheSize: ge.size
  }), !qe) {
    if (e && !$i()) {
      if (Pt())
        try {
          console.log("[SMH Token 续期] 路径A: token 即将过期，尝试 SDK renewToken 续期");
          const { renewTokenViaSdk: r } = await Promise.resolve().then(() => ji), s = await r();
          if (s && s.accessToken)
            return ma(s.accessToken), ba(s.expiresAt), console.log("[SMH Token 续期] 路径A: SDK renewToken 续期成功", {
              newExpiresAt: s.expiresAt ? new Date(s.expiresAt).toISOString() : "未返回"
            }), ze();
        } catch (r) {
          return console.warn("[SMH] SDK renewToken 续期失败，使用当前 token:", r.message), e;
        }
      return e;
    }
    if (e)
      try {
        console.log("[SMH Token 续期] 路径B: token 已过期，最后尝试 SDK renewToken 续期");
        const { renewTokenViaSdk: r } = await Promise.resolve().then(() => ji), s = await r();
        if (s && s.accessToken)
          return ma(s.accessToken), ba(s.expiresAt), console.log("[SMH Token 续期] 路径B: SDK renewToken 续期成功（token 已过期）", {
            newExpiresAt: s.expiresAt ? new Date(s.expiresAt).toISOString() : "未返回"
          }), ze();
      } catch (r) {
        console.error("[SMH] SDK renewToken 续期失败:", r.message);
      }
    throw Ue == null || Ue({ type: "error", message: "SMH 访问令牌已过期，请刷新页面" }), new Error("SMH accessToken 已过期且未提供 getAccessToken 函数");
  }
  const t = ae, a = ft.get(t);
  if (a)
    return a;
  const i = (async () => {
    try {
      console.log("[SMH Token 续期] 路径C: 调用集成方 getAccessToken 获取新 token");
      const r = await qe();
      if (r && r.accessToken)
        return ma(r.accessToken), ba(r.expiresAt), console.log("[SMH Token 续期] 路径C: 集成方 getAccessToken 返回成功", {
          newExpiresAt: r.expiresAt ? new Date(r.expiresAt).toISOString() : "未返回",
          isNewTokenAlreadyExpired: r.expiresAt ? r.expiresAt <= Date.now() : "未知"
        }), ze();
      throw new Error("getAccessToken 未返回有效的 accessToken");
    } catch (r) {
      throw Ue == null || Ue({ type: "error", message: r.message || "SMH 令牌获取失败" }), r;
    } finally {
      ft.delete(t);
    }
  })();
  return ft.set(t, i), i;
}
async function xl() {
  if (!qe)
    throw new Error("未提供 getAccessToken 函数");
  await ra();
}
function cc() {
  ge.clear(), ft.clear(), qe = null, Ue = null, Ma = "", ae = "", za = "";
}
function dc(e) {
  const t = e || ae;
  t && (ge.delete(t), ft.delete(t), console.log("[SMH Token 缓存] 已清除 space 缓存", { spaceId: t }));
}
class Kt extends Error {
  /**
   * @param {string} operation - 操作名称，如 'getFileList'、'uploadFile'
   * @param {string} message - 错误描述信息
   * @param {string|number} [code] - SMH API 业务错误码（如 'SameFileExists'、'QuotaLimitExceeded'）
   * @param {number} [status] - HTTP 状态码（如 401、403、404、500）
   * @param {Error} [cause] - 原始错误对象
   */
  constructor(t, a, i, r, s) {
    super(`[SMH] ${t} 失败: ${a}`), this.name = "SMHError", this.operation = t, this.code = i, this.status = r, this.err = s, this.message = a;
  }
}
function re(e, t) {
  return async (...a) => {
    var i, r, s, o, n, p, c, l, d, h, u, y, f;
    try {
      return await e(...a);
    } catch (A) {
      if (A instanceof Kt)
        throw A;
      Object.keys(A).forEach((C) => {
        console.log(C, A[C]);
      });
      const m = ((r = (i = A == null ? void 0 : A.response) == null ? void 0 : i.data) == null ? void 0 : r.message) || ((n = (o = (s = A == null ? void 0 : A.cause) == null ? void 0 : s.response) == null ? void 0 : o.data) == null ? void 0 : n.message) || A.message || "未知错误", F = ((c = (p = A == null ? void 0 : A.response) == null ? void 0 : p.data) == null ? void 0 : c.code) || ((h = (d = (l = A == null ? void 0 : A.cause) == null ? void 0 : l.response) == null ? void 0 : d.data) == null ? void 0 : h.code) || A.code, v = ((u = A == null ? void 0 : A.response) == null ? void 0 : u.status) || ((f = (y = A == null ? void 0 : A.cause) == null ? void 0 : y.response) == null ? void 0 : f.status) || A.status;
      throw console.error(`[SMH] ${t} 失败:`, { message: m, code: F, status: v }, A), new Kt(t, m, F, v, A);
    }
  };
}
const ke = /* @__PURE__ */ new Map();
async function oe() {
  const e = await ra(), t = ia(), a = t;
  let i = ke.get(a);
  return i ? i.setDefaultAccessToken(e) : (i = new xr({
    basePath: Ha(),
    libraryId: Pa(),
    spaceId: t,
    accessToken: e
  }), ke.set(a, i), console.log("[SMH Client 缓存] 创建新 client", { spaceId: t, cacheSize: ke.size })), i;
}
function Dr(e) {
  e ? (ke.delete(e), console.log("[SMH Client 缓存] 重置指定 client", { spaceId: e, cacheSize: ke.size })) : (ke.clear(), console.log("[SMH Client 缓存] 重置所有 client"));
}
async function Or() {
  const e = Rl(), t = Pa();
  if (!e || !t)
    throw new Error("无法续期：缺少 accessToken 或 libraryId");
  const a = ia();
  let i = ke.get(a);
  i || (i = new xr({
    basePath: Ha(),
    libraryId: t,
    spaceId: a,
    accessToken: e
  }), ke.set(a, i)), console.log("[SMH Token 续期] renewTokenViaSdk: 调用 SDK renewToken", {
    libraryId: t,
    hasCurrentToken: !!e
  });
  const r = await i.token.renewToken({
    libraryId: t,
    accessToken: e
  }), s = r.data.accessToken, o = r.data.expiresAt, n = o ? new Date(o).getTime() : Date.now() + 7200 * 1e3;
  return console.log("[SMH Token 续期] renewTokenViaSdk: SDK 返回结果", {
    hasNewToken: !!s,
    rawExpiresAt: o,
    parsedExpiresAt: new Date(n).toISOString(),
    isAlreadyExpired: n <= Date.now(),
    usedDefault: !o
  }), i.setDefaultAccessToken(s), { accessToken: s, expiresAt: n };
}
async function Ur(e = "", { page: t = 1, pageSize: a = 100 } = {}) {
  return (await (await oe()).directory.listDirectoryByPage({
    filePath: e,
    byPage: 1,
    page: t,
    pageSize: a
  })).data;
}
async function kr(e = "") {
  return Array.isArray(e) && (e = e.join("/")), await (await oe()).file.deleteFile({
    filePath: e,
    permanent: 1
  }), !0;
}
async function Tr(e = "") {
  return Array.isArray(e) && (e = e.join("/")), await (await oe()).directory.deleteDirectory({
    filePath: e,
    permanent: 1
  }), !0;
}
async function Vr(e = "") {
  return Array.isArray(e) && (e = e.join("/")), (await (await oe()).directory.infoFileOrDirectory({
    filePath: e,
    info: 1
  })).data;
}
async function Nr(e = "") {
  return Array.isArray(e) && (e = e.join("/")), (await (await oe()).directory.createDirectory({
    filePath: e,
    conflictResolutionStrategy: "rename"
  })).data;
}
async function Qr(e, t) {
  return Array.isArray(e) && (e = e.join("/")), Array.isArray(t) && (t = t.join("/")), (await (await oe()).file.moveFile({
    filePath: t,
    moveFileRequest: { from: e },
    conflictResolutionStrategy: "rename"
  })).data;
}
async function Lr(e, t) {
  return Array.isArray(e) && (e = e.join("/")), Array.isArray(t) && (t = t.join("/")), (await (await oe()).directory.moveDirectory({
    filePath: t,
    moveDirectoryRequest: { from: e },
    conflictResolutionStrategy: "rename"
  })).data;
}
async function Mr(e, t) {
  return Array.isArray(e) && (e = e.join("/")), Array.isArray(t) && (t = t.join("/")), (await (await oe()).file.moveFile({
    filePath: t,
    moveFileRequest: { from: e },
    conflictResolutionStrategy: "ask"
  })).data;
}
async function zr(e, t) {
  return Array.isArray(e) && (e = e.join("/")), Array.isArray(t) && (t = t.join("/")), (await (await oe()).directory.moveDirectory({
    filePath: t,
    moveDirectoryRequest: { from: e },
    conflictResolutionStrategy: "ask"
  })).data;
}
async function At(e = "", t = !1) {
  if (Array.isArray(e) && (e = e.join("/")), t) {
    const c = (await (await oe()).file.infoFile({
      filePath: e,
      info: 1,
      purpose: "preview"
    })).data;
    return c.cosUrl ? (await fetch(c.cosUrl)).text() : c;
  }
  const a = await ra(), i = Ha(), r = Pa(), s = ia(), o = e.split("/").map(encodeURIComponent).join("/");
  return `${i}/api/v1/file/${r}/${s}/${o}?access_token=${encodeURIComponent(a)}`;
}
async function Pr(e = "") {
  return Array.isArray(e) && (e = e.join("/")), (await (await oe()).file.infoFile({
    filePath: e,
    info: 1,
    purpose: "preview"
  })).data.cosUrl || "";
}
async function Hr(e = "", t) {
  Array.isArray(e) && (e = e.join("/")), await (await oe()).downloadByUrl({
    filePath: e,
    fileName: t
  });
}
async function $r(e, t = "", a = {}) {
  const i = e, r = Dl(t);
  if (r)
    try {
      await (await oe()).directory.checkDirectoryStatus({ filePath: r });
    } catch {
      await (await oe()).directory.createDirectory({
        filePath: r,
        conflictResolutionStrategy: "rename"
      });
    }
  const s = await oe();
  return new Promise((o, n) => {
    s.createUploadTask({
      filePath: t,
      file: i,
      conflictResolutionStrategy: "overwrite",
      onStateChange: (c, l, d) => {
        var h, u, y, f;
        a.onStateChangeCallback && a.onStateChangeCallback(l), l === zt.SUCCESS || l === zt.RAPID_SUCCESS ? $a({ name: i.name, path: t.split("/") }).then((A) => {
          a.onSuccessCallback && a.onSuccessCallback({ id: A, name: i.name }), o(c);
        }).catch(() => {
          a.onSuccessCallback && a.onSuccessCallback({ id: "", name: i.name }), o(c);
        }) : l === zt.ERROR && (a.onErrorCallback && a.onErrorCallback(((u = (h = d.cause) == null ? void 0 : h.response) == null ? void 0 : u.data) || d), n(((f = (y = d.cause) == null ? void 0 : y.response) == null ? void 0 : f.data) || d));
      },
      onProgress: (c) => {
        const l = Math.floor(c.progress), d = c.speed || 0;
        console.log(`进度: ${l}%, 速度: ${d} B/s`), a.onProgressCallback && a.onProgressCallback(l, d);
      }
    }).start();
  });
}
function Dl(e) {
  if (!e || e === "/" || !e.includes("/")) return "";
  if (e.endsWith("/")) return e.slice(0, -1);
  const t = e.lastIndexOf("/");
  return t === 0 ? "/" : e.substring(0, t);
}
async function $a(e) {
  var r;
  const t = e.name || e.filename || "", a = t.split(".").pop().toLowerCase(), i = ((r = e.path) == null ? void 0 : r.join("/")) || t;
  return ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "avif", "mp4", "avi", "mov", "wmv", "flv", "mkv", "webm"].includes(a) ? await At(i) : ["json", "txt", "md", "log", "docx"].includes(a) ? await At(i, !0) : await At(i);
}
async function jr(e = {}) {
  const {
    keywords: t,
    extname: a,
    excludeExtName: i,
    fileType: r,
    minFileSize: s,
    maxFileSize: o,
    modificationTimeStart: n,
    modificationTimeEnd: p,
    orderBy: c,
    orderByType: l,
    labels: d,
    categories: h,
    limit: u = 50,
    marker: y,
    dirPath: f
  } = e, A = {};
  t && t.length > 0 && (A.keywords = t), a && a.length > 0 && (A.extname = a), i && i.length > 0 && (A.excludeExtName = i), r && r.length > 0 && (A.fileType = r), s !== void 0 && (A.minFileSize = s), o !== void 0 && (A.maxFileSize = o), n && (A.modificationTimeStart = n), p && (A.modificationTimeEnd = p), c && (A.orderBy = c), l && (A.orderByType = l), d && d.length > 0 && (A.labels = d), h && h.length > 0 && (A.categories = h), y && (A.marker = y);
  const m = await oe(), F = await m.search.searchFs({
    searchFsRequest: A,
    limit: u
  }), v = F.data.contents || [], C = await Promise.all(
    v.map(async (w) => {
      if (!w.inode) return w;
      try {
        const H = (await m.file.getFileInfoByInode({ inode: w.inode })).data || {};
        return {
          ...w,
          path: H.path || []
        };
      } catch (B) {
        return console.warn(`获取 inode ${w.inode} 的路径信息失败:`, B.message), w;
      }
    })
  );
  let _ = C;
  if (f) {
    const w = f.split("/").filter(Boolean);
    _ = C.filter((B) => !B.path || !Array.isArray(B.path) || B.path.length <= w.length ? !1 : w.every((H, J) => B.path[J] === H));
  }
  return {
    contents: _,
    nextMarker: F.data.nextMarker || void 0
  };
}
async function ja() {
  const e = await oe(), t = ia(), i = (await e.usage.getUsage({
    spaceIds: t
  })).data, r = Array.isArray(i) ? i.find((s) => s.spaceId === t) || i[0] : i;
  return r ? {
    used: parseInt(r.size, 10) || 0,
    total: parseInt(r.capacity, 10) || 0
  } : null;
}
const K = {
  SMHError: Kt,
  getFileList: re(Ur, "getFileList"),
  uploadFile: re($r, "uploadFile"),
  getPreview: re(At, "getPreview"),
  getDocPreviewUrl: re(Pr, "getDocPreviewUrl"),
  downloadFile: re(Hr, "downloadFile"),
  getFileInfo: re(Vr, "getFileInfo"),
  getFilePreviewUrlOrContent: re($a, "getFilePreviewUrlOrContent"),
  delFile: re(kr, "delFile"),
  delDirectory: re(Tr, "delDirectory"),
  createDirectory: re(Nr, "createDirectory"),
  moveFile: re(Qr, "moveFile"),
  moveDirectory: re(Lr, "moveDirectory"),
  renameFile: re(Mr, "renameFile"),
  renameDirectory: re(zr, "renameDirectory"),
  resetClient: Dr,
  renewTokenViaSdk: re(Or, "renewTokenViaSdk"),
  getSpaceUsage: re(ja, "getSpaceUsage"),
  searchFiles: re(jr, "searchFiles")
}, ji = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  SMHError: Kt,
  createDirectory: Nr,
  default: K,
  delDirectory: Tr,
  delFile: kr,
  downloadFile: Hr,
  getDocPreviewUrl: Pr,
  getFileInfo: Vr,
  getFileList: Ur,
  getFilePreviewUrlOrContent: $a,
  getPreview: At,
  getSpaceUsage: ja,
  moveDirectory: Lr,
  moveFile: Qr,
  renameDirectory: zr,
  renameFile: Mr,
  renewTokenViaSdk: Or,
  resetClient: Dr,
  searchFiles: jr,
  uploadFile: $r
}, Symbol.toStringTag, { value: "Module" })), Ol = 3e3, Gi = {
  success: "✓",
  error: "✕",
  warning: "!",
  info: "i"
}, Ji = {
  success: { bg: "#e6f7ee", border: "#b7eb8f", color: "#389e0d", iconBg: "#52c41a" },
  error: { bg: "#fff1f0", border: "#ffa39e", color: "#cf1322", iconBg: "#ff4d4f" },
  warning: { bg: "#fffbe6", border: "#ffe58f", color: "#ad6800", iconBg: "#faad14" },
  info: { bg: "#e6f4ff", border: "#91caff", color: "#0958d9", iconBg: "#1677ff" }
};
function Ul() {
  let e = document.getElementById("__smh_toast_container__");
  return e || (e = document.createElement("div"), e.id = "__smh_toast_container__", Object.assign(e.style, {
    position: "fixed",
    top: "16px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: "999999",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    pointerEvents: "none"
  }), document.body.appendChild(e)), e;
}
const se = {};
se.notify = ({ type: e = "info", message: t, duration: a = Ol }) => {
  if (typeof t != "string" || !t) return;
  const i = Ji[e] || Ji.info, r = Gi[e] || Gi.info, s = document.createElement("div");
  Object.assign(s.style, {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "8px",
    background: i.bg,
    border: `1px solid ${i.border}`,
    color: i.color,
    fontSize: "14px",
    lineHeight: "1.5",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    pointerEvents: "auto",
    opacity: "0",
    transform: "translateY(-8px)",
    transition: "opacity 0.25s ease, transform 0.25s ease",
    maxWidth: "400px",
    wordBreak: "break-word"
  });
  const o = document.createElement("span");
  Object.assign(o.style, {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: i.iconBg,
    color: "#fff",
    fontSize: "11px",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: "0",
    lineHeight: "1"
  }), o.textContent = r;
  const n = document.createElement("span");
  n.textContent = t, s.appendChild(o), s.appendChild(n);
  const p = Ul();
  p.appendChild(s), requestAnimationFrame(() => {
    s.style.opacity = "1", s.style.transform = "translateY(0)";
  }), setTimeout(() => {
    s.style.opacity = "0", s.style.transform = "translateY(-8px)", setTimeout(() => {
      s.remove(), p.children.length === 0 && p.remove();
    }, 250);
  }, a);
};
const kl = [
  // {
  //   id: 'storage',
  //   title: '',
  //   items: [
  //     { id: 'personal', name: '云空间', icon: '/assets/CodeBubbyAssets/3970_352035/43.svg' },
  //   ],
  // },
];
function va(e, t = 20) {
  const a = (e || "").split(".").pop().toLowerCase(), i = { fontSize: t, flexShrink: 0 };
  return a === "__dir__" ? /* @__PURE__ */ b(Ki, { style: { ...i, color: "#ffb020" } }) : ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "avif", "tpg", "heif"].includes(a) ? /* @__PURE__ */ b(Es, { style: { ...i, color: "#0abf5b" } }) : ["mp4", "avi", "mov", "wmv", "flv", "mkv", "webm"].includes(a) ? /* @__PURE__ */ b(Fs, { style: { ...i, color: "#7b61ff" } }) : a === "pdf" ? /* @__PURE__ */ b(Ss, { style: { ...i, color: "#e34d59" } }) : ["doc", "docx"].includes(a) ? /* @__PURE__ */ b(Bs, { style: { ...i, color: "#3370ff" } }) : ["xls", "xlsx", "csv"].includes(a) ? /* @__PURE__ */ b(ws, { style: { ...i, color: "#2ba471" } }) : ["ppt", "pptx"].includes(a) ? /* @__PURE__ */ b(Cs, { style: { ...i, color: "#ed7b2f" } }) : ["json", "js", "ts", "jsx", "tsx", "html", "css", "less", "scss", "py", "java", "go", "c", "cpp", "h", "rs", "rb", "php", "sh", "yaml", "yml", "xml", "sql"].includes(a) ? /* @__PURE__ */ b(_s, { style: { ...i, color: "#a0a3b1" } }) : ["txt", "md", "log", "ini", "conf", "cfg"].includes(a) ? /* @__PURE__ */ b(Rs, { style: { ...i, color: "#86909c" } }) : ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "tgz"].includes(a) ? /* @__PURE__ */ b(xs, { style: { ...i, color: "#c9a06e" } }) : ["mp3", "wav", "flac", "aac", "ogg", "wma", "m4a"].includes(a) ? /* @__PURE__ */ b(Ds, { style: { ...i, color: "#e95fbc" } }) : /* @__PURE__ */ b(Os, { style: { ...i, color: "#a8b0b8" } });
}
const Tl = ["json", "txt", "md", "log", "doc", "docx", "pdf", "xls", "xlsx", "ppt", "pptx"], Vl = ["json", "txt", "md", "log"];
function Tt(e) {
  const t = (e || "").split(".").pop().toLowerCase();
  return ["doc", "docx", "pdf", "xls", "xlsx", "ppt", "pptx", "txt"].includes(t) ? "doc" : ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "avif"].includes(t) ? "image" : ["mp4", "avi", "mov", "wmv", "flv", "mkv", "webm"].includes(t) ? "video" : "other";
}
function We(e) {
  if (!e || e <= 0)
    return "0 B";
  const t = ["B", "KB", "MB", "GB", "TB"], a = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1), i = e / 1024 ** a;
  return `${i.toFixed(i >= 10 ? 0 : 1)} ${t[a]}`;
}
function Nl(e) {
  if (!e)
    return "";
  const t = new Date(e);
  if (Number.isNaN(t.getTime()))
    return "";
  const a = (i) => String(i).padStart(2, "0");
  return `${t.getFullYear()}/${a(t.getMonth() + 1)}/${a(t.getDate())} ${a(t.getHours())}:${a(t.getMinutes())}`;
}
function Ql() {
  const [e, t] = z(""), [a, i] = z(!1);
  return Se(() => {
    function r() {
      const { expiresAt: o } = Hi();
      if (!o) {
        t("");
        return;
      }
      const n = Date.now(), p = Math.floor((o - n) / 1e3);
      if (p <= 0) {
        t("已过期"), i(!0);
        return;
      }
      i(!1);
      const c = Math.floor(p / 86400), l = Math.floor(p % 86400 / 3600), d = Math.floor(p % 3600 / 60), h = p % 60;
      c > 0 ? t(`${c}天${l}小时后过期`) : l > 0 ? t(`${l}小时${d}分钟后过期`) : d > 0 ? t(`${d}分${h}秒后过期`) : t(`${h}秒后过期`);
    }
    r();
    const s = setInterval(r, 60 * 1e3);
    return () => clearInterval(s);
  }, []), e ? /* @__PURE__ */ V(
    "span",
    {
      className: "cd-sidebar-user-card__expire",
      style: {
        fontSize: "11px",
        color: a ? "#e54545" : "#8c8c8c",
        marginTop: "2px"
      },
      title: (() => {
        const { expiresAt: r } = Hi();
        return r ? `过期时间：${new Date(r).toLocaleString()}` : "";
      })(),
      children: [
        "🔑 ",
        e
      ]
    }
  ) : null;
}
function Ll({ username: e, quota: t = null, onQuotaChange: a = null, enableSearch: i = !1 }) {
  const [r, s] = z("personal"), [o, n] = z(!1), [p, c] = z([]), [l, d] = z(!1), [h, u] = z(0), [y, f] = z(0), [A, m] = z(""), [F, v] = z(0), [C, _] = z(""), [w, B] = z(null), [H, J] = z(null), [j, Be] = z([]), [He, we] = z(!1), [Ce, Te] = z(null), [W, Ve] = z(""), [le, _e] = z(null), [it, ye] = z(!1), [Re, rt] = z({}), [Oe, $e] = z(null), [Hl, Et] = z(null), [$l, Ga] = z(!1), [Gr, Ft] = z(!1), [je, sa] = z("新建文件夹"), [Jr, Ja] = z(!1), [ee, Ne] = z([]), [Ka, Xa] = z(!1), [Wa, Za] = z(!1), [Kr, St] = z(!1), [be, st] = z([]), [Ya, qa] = z([]), [Xr, ei] = z(!1), [ce, Ge] = z(1), [Je] = z(50), [Ke, ti] = z(0), [xe, ai] = z(null), [oa, na] = z(""), [Wr, ii] = z(!1), Bt = ut(null), ot = ut(null), ri = ut(!0), nt = le !== null ? le : p, si = bs(() => {
    if (le === null) return null;
    const g = {};
    return le.forEach((S) => {
      const N = Array.isArray(S.path) ? S.path : [], L = N.length > 1 ? N.slice(0, -1).join("/") : "/";
      g[L] || (g[L] = []), g[L].push(S);
    }), g;
  }, [le]), lt = ut(null);
  Se(() => {
    lt.current && clearTimeout(lt.current);
    const g = W.trim();
    if (!g) {
      _e(null), ye(!1);
      return;
    }
    return ye(!0), lt.current = setTimeout(async () => {
      try {
        if (!i) return;
        let N = (await K.searchFiles({ keywords: [g], limit: 100 })).contents || [];
        j.length > 0 && (N = N.filter((L) => {
          const M = Array.isArray(L.path) ? L.path : [];
          return M.length <= j.length ? !1 : j.every((Q, G) => M[G] === Q);
        })), _e(N);
      } catch (S) {
        console.error("搜索失败", S), se.error("搜索失败，请稍后重试"), _e([]);
      } finally {
        ye(!1);
      }
    }, 500), () => {
      lt.current && clearTimeout(lt.current);
    };
  }, [W, j, i]);
  const Zr = async (g) => {
    if (!g || g.type === "dir") {
      $e(null), Et(null);
      return;
    }
    $e(g), Ga(!0);
    try {
      const S = await K.getFileInfo(g.path || "");
      Et(S);
    } catch (S) {
      console.error("获取文件信息失败", S), Et(null);
    } finally {
      Ga(!1);
    }
  };
  Se(() => {
    (async () => {
      const S = p.filter((N) => {
        const L = N.name || N.filename || "";
        return Tt(L) === "image" && N.type !== "dir";
      });
      for (const N of S) {
        const L = N.path || N.name || N.filename;
        if (!Re[L])
          try {
            const M = await K.getPreview(N.path || "");
            rt((Q) => ({ ...Q, [L]: M }));
          } catch (M) {
            console.error("加载缩略图失败", M);
          }
      }
    })();
  }, [p]);
  const wt = (g) => g ? Array.isArray(g.path) ? g.path.join("/") : g.path ? String(g.path).replace(/^\/+/, "") : [...j, g.name || g.filename].filter(Boolean).join("/") : "", Yr = async (g, S = {}) => {
    if (!g)
      return;
    const { skipEnterDir: N = !1 } = S;
    if (!N && g.type === "dir") {
      le !== null && Array.isArray(g.path) && g.path.length > 0 ? (Ve(""), _e(null), Be(g.path)) : cs(g.name || g.filename);
      return;
    }
    if (g.type === "dir")
      return;
    const L = g.name || g.filename || "";
    if (Tt(L) === "image") {
      try {
        const G = await K.getPreview(g.path || ""), ie = Array.isArray(g.path) ? g.path.join("/") : g.path || g.name || g.filename || "";
        B({ url: G, name: L, path: ie });
      } catch (G) {
        console.error("获取图片预览失败", G);
      }
      return;
    }
    const Q = (L.split(".").pop() || "").toLowerCase();
    if (Tl.includes(Q)) {
      const G = Array.isArray(g.path) ? g.path.join("/") : g.path || g.name || g.filename || "";
      try {
        const ie = await K.getDocPreviewUrl(g.path || "");
        if (Vl.includes(Q)) {
          const Qe = await K.getPreview(g.path || "", !0);
          J({ name: L, path: G, url: ie, content: Qe });
        } else
          J({ name: L, path: G, url: ie });
      } catch {
        try {
          const Qe = await K.getPreview(g.path || "", !0);
          J({ name: L, path: G, content: Qe });
        } catch {
          J({ name: L, path: G, content: "无法加载内容" });
        }
      }
    }
  }, qr = (g) => {
    if (!g)
      return;
    const S = g.name || g.filename || "该文件", N = fi.confirm({
      header: "删除确认",
      body: `确认删除 ${S} 吗？`,
      theme: "warning",
      confirmBtn: "删除",
      onConfirm: async () => {
        N.destroy();
        const L = wt(g);
        if (L)
          try {
            g.type === "dir" ? await K.delDirectory(L) : await K.delFile(L), await De(j.join("/"), ce), a == null || a();
          } catch (M) {
            console.error("删除失败", M);
          }
      },
      onClose: () => {
        N.destroy();
      }
    });
  }, es = async (g) => {
    if (!(!g || g.type === "dir"))
      try {
        const S = g.name || g.filename || "文件";
        await K.downloadFile(g.path || "", S);
      } catch (S) {
        console.error("下载失败", S);
      }
  }, ts = async () => {
    if (ee.length !== 0) {
      Xa(!0);
      try {
        for (const g of ee) {
          if (g.type === "dir")
            continue;
          const S = g.name || g.filename || "文件";
          await K.downloadFile(g.path || "", S), await new Promise((N) => setTimeout(N, 300));
        }
      } finally {
        Xa(!1);
      }
    }
  }, as = () => {
    if (ee.length === 0)
      return;
    const g = fi.confirm({
      header: "批量删除确认",
      body: `确认删除选中的 ${ee.length} 个文件吗？`,
      theme: "warning",
      confirmBtn: "删除",
      onConfirm: async () => {
        g.destroy();
        try {
          for (const S of ee) {
            const N = wt(S);
            N && (S.type === "dir" ? await K.delDirectory(N) : await K.delFile(N));
          }
          Ne([]), await De(j.join("/"), ce), a == null || a();
        } catch (S) {
          console.error("批量删除失败", S);
        }
      },
      onClose: () => {
        g.destroy();
      }
    });
  }, ct = async (g = "") => {
    ei(!0);
    try {
      const N = ((await K.getFileList(g, { page: 1, pageSize: 200 })).contents || []).filter((L) => L.type === "dir");
      qa(N);
    } catch (S) {
      console.error("获取目录列表失败", S), qa([]);
    } finally {
      ei(!1);
    }
  }, is = () => {
    ee.length !== 0 && (st([]), St(!0), ct(""));
  }, rs = (g) => {
    const S = [...be, g];
    st(S), ct(S.join("/"));
  }, ss = () => {
    const g = be.slice(0, -1);
    st(g), ct(g.join("/"));
  }, oi = (g) => {
    if (g < 0)
      st([]), ct("");
    else {
      const S = be.slice(0, g + 1);
      st(S), ct(S.join("/"));
    }
  }, os = async () => {
    if (ee.length === 0) return;
    const g = be.join("/"), S = j.join("/");
    if (g === S) {
      se.notify({ type: "warning", message: "目标目录与当前目录相同" });
      return;
    }
    Za(!0);
    try {
      for (const N of ee) {
        const L = wt(N);
        if (!L) continue;
        const M = N.name || N.filename, Q = g ? `${g}/${M}` : M;
        N.type === "dir" ? await K.moveDirectory(L, Q) : await K.moveFile(L, Q);
      }
      se.notify({ type: "success", message: `已移动 ${ee.length} 个文件` }), Ne([]), St(!1), await De(j.join("/"), ce), a == null || a();
    } catch (N) {
      console.error("批量移动失败", N), se.notify({ type: "error", message: "移动失败，请重试" });
    } finally {
      Za(!1);
    }
  }, ns = (g, S) => {
    S.stopPropagation();
    const N = g.path || g.name || g.filename;
    Ne((L) => L.some((Q) => (Q.path || Q.name || Q.filename) === N) ? L.filter((Q) => (Q.path || Q.name || Q.filename) !== N) : [...L, g]);
  }, ls = () => {
    const g = nt.filter((S) => S.type !== "dir");
    ee.length === g.length ? Ne([]) : Ne(g);
  }, ni = (g) => {
    const S = g.path || g.name || g.filename;
    return ee.some((N) => (N.path || N.name || N.filename) === S);
  }, De = async (g = "", S = 1) => {
    try {
      const N = await K.getFileList(g, { page: S, pageSize: Je }), L = (N.contents || []).map((M) => ({
        ...M,
        type: M.type || Tt(M.name || M.filename || "")
      }));
      c(L), ti(N.totalNum || L.length);
    } catch {
      c([]), ti(0);
    }
  };
  Se(() => {
    Ge(1), Ne([]), De(j.join("/"), 1);
  }, [j]), Se(() => {
    if (ri.current) {
      ri.current = !1;
      return;
    }
    De(j.join("/"), ce);
  }, [ce]);
  const cs = (g) => {
    Be((S) => [...S, g]);
  }, ds = (g, S) => {
    S && S.stopPropagation();
    const N = g.name || g.filename || "";
    ai(g), na(N), setTimeout(() => {
      if (ot.current) {
        ot.current.focus();
        const L = N.lastIndexOf(".");
        L > 0 && g.type !== "dir" ? ot.current.setSelectionRange(0, L) : ot.current.select();
      }
    }, 50);
  }, Ct = () => {
    ai(null), na("");
  }, li = async () => {
    var L;
    if (!xe || !oa.trim()) {
      Ct();
      return;
    }
    const g = xe.name || xe.filename || "", S = oa.trim();
    if (S === g) {
      Ct();
      return;
    }
    if (/[\\/:*?"<>|]/.test(S)) {
      se.notify({ type: "warning", message: '名称不支持特殊字符 "\\/:*?"<>|"' });
      return;
    }
    if (S.length > 255) {
      se.notify({ type: "warning", message: "名称长度不能超过255个字" });
      return;
    }
    ii(!0);
    try {
      const M = wt(xe), Q = M.split("/");
      Q[Q.length - 1] = S;
      const G = Q.join("/");
      xe.type === "dir" ? await K.renameDirectory(M, G) : await K.renameFile(M, G), Ct(), await De(j.join("/"), ce);
    } catch (M) {
      console.error("重命名失败", M), ((L = M == null ? void 0 : M.response) == null ? void 0 : L.status) === 409 || (M == null ? void 0 : M.status) === 409 ? se.notify({ type: "error", message: "目标名称已存在，请使用其他名称" }) : se.notify({ type: "error", message: "重命名失败" });
    } finally {
      ii(!1);
    }
  }, hs = (g) => {
    g.key === "Enter" ? (g.preventDefault(), li()) : g.key === "Escape" && (g.preventDefault(), Ct());
  }, ps = async () => {
    if (!je.trim())
      return;
    if (/[\\/:*?"<>|]/.test(je)) {
      se.notify({ type: "warning", message: '名称不支持特殊字符 "\\/:*?"<>|"' });
      return;
    }
    if (je.length > 255) {
      se.notify({ type: "warning", message: "名称长度不能超过255个字" });
      return;
    }
    Ja(!0);
    try {
      const S = j.length > 0 ? `${j.join("/")}/${je.trim()}` : je.trim();
      await K.createDirectory(S), await De(j.join("/"), ce), Ft(!1), sa("新建文件夹");
    } catch (S) {
      console.error("创建文件夹失败", S), se.notify({ type: "error", message: "创建文件夹失败" });
    } finally {
      Ja(!1);
    }
  }, us = async (g) => {
    var N, L, M;
    const S = (N = g.target.files) == null ? void 0 : N[0];
    if (S) {
      d(!0), u(0), m(S.name), v(S.size || 0), _("");
      try {
        const Q = j.length > 0 ? `${j.join("/")}/${S.name}` : S.name;
        await K.uploadFile(S, Q, {
          onProgressCallback: (G, ie) => {
            u(G), f(ie);
          },
          onStateChangeCallback: (G) => _(G),
          onSuccessCallback: () => {
          },
          onErrorCallback: () => {
          }
        }), await De(j.join("/"), ce), a == null || a();
      } catch (Q) {
        const G = (Q == null ? void 0 : Q.code) || ((L = Q == null ? void 0 : Q.response) == null ? void 0 : L.code) || "", ie = ((M = Q == null ? void 0 : Q.response) == null ? void 0 : M.message) || (Q == null ? void 0 : Q.message) || "未知错误";
        G === "QuotaLimitReached" ? se.notify({ type: "error", message: "空间配额不足，请清理文件或联系管理员扩容" }) : se.notify({ type: "error", message: `文件上传失败：${ie}` });
      } finally {
        d(!1), u(0), f(0), m(""), v(0), _(""), Bt.current && (Bt.current.value = "");
      }
    }
  }, ys = async (g) => {
    var N, L, M;
    g.preventDefault(), we(!1);
    const S = (N = g.dataTransfer.files) == null ? void 0 : N[0];
    if (S) {
      d(!0), u(0), f(0), m(S.name), v(S.size || 0), _("");
      try {
        const Q = j.length > 0 ? `${j.join("/")}/${S.name}` : S.name;
        await K.uploadFile(S, Q, {
          onProgressCallback: (G, ie) => {
            u(G), f(ie);
          },
          onStateChangeCallback: (G) => _(G),
          onSuccessCallback: () => {
          },
          onErrorCallback: () => {
          }
        }), await De(j.join("/"), ce), a == null || a();
      } catch (Q) {
        console.error("文件上传失败", Q != null && Q.toLogString ? Q.toLogString() : Q);
        const G = (Q == null ? void 0 : Q.code) || ((L = Q == null ? void 0 : Q.response) == null ? void 0 : L.code) || "", ie = ((M = Q == null ? void 0 : Q.response) == null ? void 0 : M.message) || (Q == null ? void 0 : Q.message) || "未知错误";
        G === "QuotaLimitReached" ? se.notify({ type: "error", message: "空间配额不足，请清理文件或联系管理员扩容" }) : se.notify({ type: "error", message: `文件上传失败：${ie}` });
      } finally {
        d(!1), u(0), f(0), m(""), v(0), _("");
      }
    }
  }, fs = (g) => {
    g.preventDefault(), we(!0);
  }, As = (g) => {
    g.currentTarget.contains(g.relatedTarget) || we(!1);
  }, Is = (g) => /* @__PURE__ */ V("div", { className: "cd-sidebar-group", children: [
    g.title ? /* @__PURE__ */ b("div", { className: "cd-sidebar-group-title", children: g.title }) : null,
    g.items.map((S) => /* @__PURE__ */ V(
      "button",
      {
        type: "button",
        className: `cd-sidebar-item${r === S.id ? " active" : ""}`,
        onClick: () => s(S.id),
        children: [
          /* @__PURE__ */ b("span", { className: "cd-sidebar-icon", children: /* @__PURE__ */ b("img", { src: S.icon, alt: S.name }) }),
          S.name,
          S.suffix ? /* @__PURE__ */ b("span", { className: "cd-sidebar-item__suffix", children: /* @__PURE__ */ b("img", { src: S.suffix, alt: "suffix" }) }) : null
        ]
      },
      S.id
    ))
  ] }, g.id), _t = [
    { label: "全部文件", path: [] },
    ...j.map((g, S) => ({ label: g, path: j.slice(0, S + 1) }))
  ];
  W.trim() ? it || `${nt.length}` : `${p.length}`;
  const ci = (g, S) => {
    const N = g.name || g.filename || "未命名文件", L = g.type === "dir", M = L ? "dir" : Tt(N), Q = g.path || `${N}-${S}`, G = Ce === Q, ie = M === "image", Qe = ie ? Re[g.path || g.name || g.filename] : null, di = xe && (xe.path || xe.name || xe.filename) === (g.path || g.name || g.filename), gs = G && !di && ee.length === 0 ? /* @__PURE__ */ V("div", { className: "cd-row-actions", children: [
      /* @__PURE__ */ b(
        "button",
        {
          className: "cd-row-action-icon",
          onClick: (te) => ds(g, te),
          title: "重命名",
          children: /* @__PURE__ */ b(vs, { size: "16" })
        }
      ),
      /* @__PURE__ */ b(
        "button",
        {
          className: "cd-row-action-icon",
          onClick: (te) => {
            te.stopPropagation(), es(g);
          },
          disabled: L,
          title: "下载",
          children: /* @__PURE__ */ b(pi, { size: "16" })
        }
      ),
      /* @__PURE__ */ b(
        "button",
        {
          className: "cd-row-action-icon cd-row-action-icon--danger",
          onClick: (te) => {
            te.stopPropagation(), qr(g);
          },
          title: "删除",
          children: /* @__PURE__ */ b(ui, { size: "16" })
        }
      )
    ] }) : L ? "-" : We(g.size);
    return /* @__PURE__ */ V(
      "div",
      {
        className: `cd-list-row ${(Oe == null ? void 0 : Oe.path) === g.path ? "selected" : ""} ${ni(g) ? "checked" : ""}`,
        onClick: () => Zr(g),
        onDoubleClick: () => Yr(g),
        tabIndex: 0,
        onMouseEnter: () => Te(Q),
        onMouseLeave: () => Te(null),
        onFocus: () => Te(Q),
        onBlur: (te) => {
          te.currentTarget.contains(te.relatedTarget) || Te(null);
        },
        children: [
          /* @__PURE__ */ b("div", { className: "cd-col-checkbox", children: !L && /* @__PURE__ */ b(
            "input",
            {
              type: "checkbox",
              checked: ni(g),
              onChange: (te) => ns(g, te),
              onClick: (te) => te.stopPropagation(),
              className: "cd-checkbox"
            }
          ) }),
          /* @__PURE__ */ V("div", { className: "cd-col-name", children: [
            /* @__PURE__ */ b("span", { className: `cd-file-icon ${ie && Qe ? "cd-file-thumbnail" : ""}`, children: ie && Qe ? /* @__PURE__ */ b("img", { src: Qe, alt: N, className: "cd-thumbnail-img" }) : va(L ? "__dir__" : N) }),
            di ? /* @__PURE__ */ b(
              "input",
              {
                ref: ot,
                className: "cd-rename-input",
                value: oa,
                onChange: (te) => na(te.target.value),
                onKeyDown: hs,
                onBlur: li,
                onClick: (te) => te.stopPropagation(),
                onDoubleClick: (te) => te.stopPropagation(),
                disabled: Wr,
                maxLength: 255
              }
            ) : /* @__PURE__ */ b("span", { className: `cd-file-name-text ${L ? "cd-no-select" : ""}`, children: N })
          ] }),
          /* @__PURE__ */ b("div", { className: "cd-col-time", children: Nl(g.updateTime || g.creationTime) }),
          /* @__PURE__ */ b("div", { className: "cd-col-size", children: gs })
        ]
      },
      Q
    );
  };
  return /* @__PURE__ */ V("div", { className: "cloud-drive-layout", children: [
    o && /* @__PURE__ */ b("div", { className: "cd-sidebar-overlay", onClick: () => n(!1) }),
    /* @__PURE__ */ V("nav", { className: `cd-sidebar ${o ? "cd-sidebar--open" : "cd-sidebar--closed"}`, children: [
      /* @__PURE__ */ b("div", { className: "cd-sidebar-top", children: /* @__PURE__ */ b("div", { className: "cd-sidebar-user-card", children: /* @__PURE__ */ V("div", { className: "cd-sidebar-user-card__info", children: [
        /* @__PURE__ */ b("span", { className: "cd-sidebar-user-card__role", children: "租户空间" }),
        /* @__PURE__ */ b(Ql, {}),
        t && t.total > 0 && /* @__PURE__ */ V("div", { className: "cd-sidebar-user-card__quota", children: [
          /* @__PURE__ */ b("div", { className: "cd-sidebar-user-card__quota-bar", children: /* @__PURE__ */ b(
            "div",
            {
              className: "cd-sidebar-user-card__quota-fill",
              style: { width: `${Math.min(t.used / t.total * 100, 100)}%` }
            }
          ) }),
          /* @__PURE__ */ V("span", { className: "cd-sidebar-user-card__quota-text", children: [
            We(t.used),
            " / ",
            We(t.total)
          ] })
        ] })
      ] }) }) }),
      kl.map((g) => Is(g))
    ] }),
    /* @__PURE__ */ V(
      "main",
      {
        className: "cd-main",
        onDragOver: fs,
        onDrop: ys,
        onDragLeave: As,
        onClick: (g) => {
          g.target.closest(".cd-list-row") || ($e(null), Et(null));
        },
        children: [
          He ? /* @__PURE__ */ V("div", { className: "cd-drag-overlay", children: [
            /* @__PURE__ */ b("span", { className: "cd-drag-icon", children: /* @__PURE__ */ V("svg", { width: "48", height: "48", viewBox: "0 0 24 24", fill: "none", stroke: "#0052d9", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ b("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
              /* @__PURE__ */ b("polyline", { points: "17 8 12 3 7 8" }),
              /* @__PURE__ */ b("line", { x1: "12", y1: "3", x2: "12", y2: "15" })
            ] }) }),
            "释放文件以上传"
          ] }) : null,
          /* @__PURE__ */ V("div", { className: "cd-top-bar", children: [
            /* @__PURE__ */ V("div", { className: "cd-top-bar__left", children: [
              /* @__PURE__ */ V(
                "button",
                {
                  type: "button",
                  className: "cd-top-bar__btn cd-top-bar__btn--new",
                  onClick: () => {
                    sa("新建文件夹"), Ft(!0);
                  },
                  children: [
                    /* @__PURE__ */ V("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [
                      /* @__PURE__ */ b("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
                      /* @__PURE__ */ b("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
                    ] }),
                    "新建"
                  ]
                }
              ),
              /* @__PURE__ */ V(
                "button",
                {
                  type: "button",
                  className: "cd-top-bar__btn cd-top-bar__btn--upload",
                  onClick: () => {
                    var g;
                    return (g = Bt.current) == null ? void 0 : g.click();
                  },
                  disabled: l,
                  children: [
                    /* @__PURE__ */ V("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                      /* @__PURE__ */ b("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
                      /* @__PURE__ */ b("polyline", { points: "17 8 12 3 7 8" }),
                      /* @__PURE__ */ b("line", { x1: "12", y1: "3", x2: "12", y2: "15" })
                    ] }),
                    l ? "文件上传中..." : "上传"
                  ]
                }
              ),
              /* @__PURE__ */ b(
                "input",
                {
                  type: "file",
                  ref: Bt,
                  style: { display: "none" },
                  onChange: us
                }
              )
            ] }),
            /* @__PURE__ */ V("div", { className: "cd-top-bar__right", children: [
              i && /* @__PURE__ */ V("div", { className: "cd-search", children: [
                /* @__PURE__ */ V("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "rgba(0,0,0,0.4)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                  /* @__PURE__ */ b("circle", { cx: "11", cy: "11", r: "8" }),
                  /* @__PURE__ */ b("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
                ] }),
                /* @__PURE__ */ b(
                  "input",
                  {
                    type: "text",
                    placeholder: "搜索文件...",
                    value: W,
                    onChange: (g) => Ve(g.target.value)
                  }
                ),
                it ? /* @__PURE__ */ b("span", { style: { fontSize: "12px", color: "rgba(0,0,0,0.4)", whiteSpace: "nowrap" }, children: "搜索中..." }) : W ? /* @__PURE__ */ b(
                  "button",
                  {
                    type: "button",
                    style: { border: "none", background: "transparent", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" },
                    onClick: () => {
                      Ve(""), _e(null);
                    },
                    title: "清除搜索",
                    children: /* @__PURE__ */ V("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "rgba(0,0,0,0.4)", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
                      /* @__PURE__ */ b("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                      /* @__PURE__ */ b("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
                    ] })
                  }
                ) : null
              ] }),
              l && /* @__PURE__ */ V("div", { className: "cd-upload-progress", children: [
                /* @__PURE__ */ V("div", { className: "cd-upload-progress__info", children: [
                  /* @__PURE__ */ b("span", { className: "cd-upload-progress__name", title: A, children: A }),
                  /* @__PURE__ */ b("span", { className: "cd-upload-progress__percent", children: C === "computing_hash" ? `秒传中 ${h}%` : `${h}% · ${We(y)}/s` })
                ] }),
                /* @__PURE__ */ b("div", { className: "cd-upload-progress__bar", children: /* @__PURE__ */ b(
                  "div",
                  {
                    className: "cd-upload-progress__fill",
                    style: { width: `${h}%` }
                  }
                ) })
              ] }),
              t && /* @__PURE__ */ V("span", { className: "cd-top-bar__quota-text", children: [
                We((t.used || 0) + (l ? Math.floor(F * h / 100) : 0)),
                t.total > 0 ? ` / ${We(t.total)}` : ""
              ] })
            ] })
          ] }),
          j.length > 0 && /* @__PURE__ */ b("div", { className: "cd-breadcrumb", children: _t.map((g, S) => /* @__PURE__ */ V(hi.Fragment, { children: [
            /* @__PURE__ */ b(
              "button",
              {
                type: "button",
                className: S === _t.length - 1 ? "active" : "",
                title: g.label,
                onClick: () => {
                  S !== _t.length - 1 && Be(g.path);
                },
                children: g.label
              }
            ),
            S < _t.length - 1 ? /* @__PURE__ */ b("span", { className: "cd-breadcrumb__sep", children: "/" }) : null
          ] }, g.label || S)) }),
          /* @__PURE__ */ V("div", { className: "cd-list-header", children: [
            /* @__PURE__ */ b("div", { className: "cd-col-checkbox", children: /* @__PURE__ */ b(
              "input",
              {
                type: "checkbox",
                checked: ee.length > 0 && ee.length === nt.filter((g) => g.type !== "dir").length,
                onChange: ls,
                className: "cd-checkbox"
              }
            ) }),
            /* @__PURE__ */ b("div", { className: "cd-col-name", children: "名称" }),
            /* @__PURE__ */ b("div", { className: "cd-col-time", children: "最近修改" }),
            /* @__PURE__ */ b("div", { className: "cd-col-size", children: "大小" })
          ] }),
          /* @__PURE__ */ b("div", { className: "cd-file-list-container", children: nt.length === 0 ? /* @__PURE__ */ V("div", { className: "cd-file-empty", children: [
            /* @__PURE__ */ V("svg", { width: "64", height: "56", viewBox: "0 0 64 56", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [
              /* @__PURE__ */ b("path", { d: "M58 14H30L24 6H6C3.79 6 2 7.79 2 10V46C2 48.21 3.79 50 6 50H58C60.21 50 62 48.21 62 46V18C62 15.79 60.21 14 58 14Z", fill: "#E3E6EB" }),
              /* @__PURE__ */ b("path", { d: "M32 26V38M26 32H38", stroke: "#A6ADB4", strokeWidth: "2", strokeLinecap: "round" })
            ] }),
            W.trim() ? it ? "搜索中..." : "未找到匹配的文件" : "暂无文件"
          ] }) : si ? (
            // 搜索模式：按文件夹分组展示
            Object.entries(si).map(([g, S]) => /* @__PURE__ */ V("div", { className: "cd-search-group", children: [
              /* @__PURE__ */ V(
                "div",
                {
                  className: "cd-search-group__header",
                  onClick: () => {
                    Ve(""), _e(null), Be(g === "/" ? [] : g.split("/"));
                  },
                  children: [
                    /* @__PURE__ */ b("span", { className: "cd-search-group__icon", children: va("__dir__") }),
                    /* @__PURE__ */ b("span", { className: "cd-search-group__path", children: g === "/" ? "根目录" : g }),
                    /* @__PURE__ */ V("span", { className: "cd-search-group__count", children: [
                      S.length,
                      " 项"
                    ] })
                  ]
                }
              ),
              S.map((N, L) => ci(N, L))
            ] }, g))
          ) : nt.map((g, S) => ci(g, S)) }),
          Ke > Je && /* @__PURE__ */ V("div", { className: "cd-pagination", children: [
            /* @__PURE__ */ V("span", { className: "cd-pagination__info", children: [
              "共 ",
              Ke,
              " 项，第 ",
              ce,
              "/",
              Math.ceil(Ke / Je),
              " 页"
            ] }),
            /* @__PURE__ */ V("div", { className: "cd-pagination__btns", children: [
              /* @__PURE__ */ b(
                "button",
                {
                  type: "button",
                  className: "cd-pagination__btn",
                  disabled: ce <= 1,
                  onClick: () => Ge((g) => Math.max(g - 1, 1)),
                  children: /* @__PURE__ */ b("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ b("polyline", { points: "15 18 9 12 15 6" }) })
                }
              ),
              (() => {
                const g = Math.ceil(Ke / Je), S = [], N = 5;
                let L = Math.max(1, ce - Math.floor(N / 2)), M = Math.min(g, L + N - 1);
                M - L < N - 1 && (L = Math.max(1, M - N + 1)), L > 1 && (S.push(/* @__PURE__ */ b("button", { type: "button", className: "cd-pagination__btn cd-pagination__page", onClick: () => Ge(1), children: "1" }, 1)), L > 2 && S.push(/* @__PURE__ */ b("span", { className: "cd-pagination__ellipsis", children: "…" }, "s1")));
                for (let Q = L; Q <= M; Q++)
                  S.push(
                    /* @__PURE__ */ b(
                      "button",
                      {
                        type: "button",
                        className: `cd-pagination__btn cd-pagination__page ${ce === Q ? "cd-pagination__page--active" : ""}`,
                        onClick: () => Ge(Q),
                        children: Q
                      },
                      Q
                    )
                  );
                return M < g && (M < g - 1 && S.push(/* @__PURE__ */ b("span", { className: "cd-pagination__ellipsis", children: "…" }, "s2")), S.push(/* @__PURE__ */ b("button", { type: "button", className: "cd-pagination__btn cd-pagination__page", onClick: () => Ge(g), children: g }, g))), S;
              })(),
              /* @__PURE__ */ b(
                "button",
                {
                  type: "button",
                  className: "cd-pagination__btn",
                  disabled: ce >= Math.ceil(Ke / Je),
                  onClick: () => Ge((g) => Math.min(g + 1, Math.ceil(Ke / Je))),
                  children: /* @__PURE__ */ b("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ b("polyline", { points: "9 18 15 12 9 6" }) })
                }
              )
            ] })
          ] }),
          ee.length > 0 && /* @__PURE__ */ V("div", { className: "cd-batch-bar", children: [
            /* @__PURE__ */ V("div", { className: "cd-batch-bar__left", children: [
              /* @__PURE__ */ V("span", { className: "cd-batch-bar__count", children: [
                "已选 ",
                ee.length,
                " 项"
              ] }),
              /* @__PURE__ */ V(
                "button",
                {
                  type: "button",
                  className: "cd-batch-bar__btn",
                  onClick: ts,
                  disabled: Ka,
                  children: [
                    /* @__PURE__ */ b(pi, { size: "12" }),
                    Ka ? "下载中..." : "下载"
                  ]
                }
              ),
              /* @__PURE__ */ V(
                "button",
                {
                  type: "button",
                  className: "cd-batch-bar__btn",
                  onClick: is,
                  children: [
                    /* @__PURE__ */ b(Us, { size: "12" }),
                    "移动"
                  ]
                }
              ),
              /* @__PURE__ */ V(
                "button",
                {
                  type: "button",
                  className: "cd-batch-bar__btn cd-batch-bar__btn--danger",
                  onClick: as,
                  children: [
                    /* @__PURE__ */ b(ui, { size: "12" }),
                    "删除"
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ b(
              "button",
              {
                type: "button",
                className: "cd-batch-bar__cancel",
                onClick: () => Ne([]),
                children: "取消选择"
              }
            )
          ] })
        ]
      }
    ),
    /* @__PURE__ */ b(
      Pl,
      {
        previewImg: w,
        setPreviewImg: B,
        previewDoc: H,
        setPreviewDoc: J
      }
    ),
    /* @__PURE__ */ b(
      yi,
      {
        visible: Gr,
        header: "创建文件夹",
        onClose: () => Ft(!1),
        onCancel: () => Ft(!1),
        onConfirm: ps,
        confirmBtn: { content: "确定", loading: Jr },
        cancelBtn: "取消",
        destroyOnClose: !0,
        children: /* @__PURE__ */ V("div", { className: "cd-create-folder-dialog", children: [
          /* @__PURE__ */ b(
            "input",
            {
              className: "smh-dialog__input",
              value: je,
              onChange: (g) => sa(g.target.value),
              maxLength: 255,
              placeholder: "请输入文件夹名称",
              autoFocus: !0
            }
          ),
          /* @__PURE__ */ b("div", { className: "cd-create-folder-tip", children: '名称不支持特殊字符 "\\/:*?"<>|"，长度不超过 255 个字' })
        ] })
      }
    ),
    /* @__PURE__ */ b(
      yi,
      {
        visible: Kr,
        header: `移动 ${ee.length} 个文件到...`,
        onClose: () => St(!1),
        onCancel: () => St(!1),
        onConfirm: os,
        confirmBtn: { content: Wa ? "移动中..." : "移动到此处", loading: Wa },
        cancelBtn: "取消",
        destroyOnClose: !0,
        children: /* @__PURE__ */ V("div", { className: "cd-move-dialog", children: [
          /* @__PURE__ */ V("div", { className: "cd-move-dialog__breadcrumb", children: [
            /* @__PURE__ */ b(
              "button",
              {
                type: "button",
                className: be.length === 0 ? "active" : "",
                onClick: () => oi(-1),
                children: "根目录"
              }
            ),
            be.map((g, S) => /* @__PURE__ */ V(hi.Fragment, { children: [
              /* @__PURE__ */ b("span", { className: "cd-move-dialog__sep", children: "/" }),
              /* @__PURE__ */ b(
                "button",
                {
                  type: "button",
                  className: S === be.length - 1 ? "active" : "",
                  title: g,
                  onClick: () => oi(S),
                  children: g
                }
              )
            ] }, S))
          ] }),
          /* @__PURE__ */ V("div", { className: "cd-move-dialog__list", children: [
            be.length > 0 && /* @__PURE__ */ V("div", { className: "cd-move-dialog__item cd-move-dialog__item--back", onClick: ss, children: [
              /* @__PURE__ */ b("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ b("polyline", { points: "15 18 9 12 15 6" }) }),
              /* @__PURE__ */ b("span", { children: "返回上级" })
            ] }),
            Xr ? /* @__PURE__ */ V("div", { className: "cd-move-dialog__empty", children: [
              /* @__PURE__ */ b("span", { className: "cd-move-dialog__spinner" }),
              "加载中..."
            ] }) : Ya.length === 0 ? /* @__PURE__ */ b("div", { className: "cd-move-dialog__empty", children: "暂无子文件夹" }) : Ya.map((g, S) => {
              const N = g.name || g.filename, L = ee.some((M) => (M.name || M.filename) === N && M.type === "dir");
              return /* @__PURE__ */ V(
                "div",
                {
                  className: `cd-move-dialog__item ${L ? "cd-move-dialog__item--disabled" : ""}`,
                  onClick: () => !L && rs(N),
                  children: [
                    /* @__PURE__ */ b(Ki, { size: 18, style: { color: "#ffb020" } }),
                    /* @__PURE__ */ b("span", { className: "cd-move-dialog__item-name", title: N, children: N })
                  ]
                },
                S
              );
            })
          ] }),
          /* @__PURE__ */ V("div", { className: "cd-move-dialog__target", children: [
            "目标位置：",
            be.length > 0 ? `/${be.join("/")}` : "/（根目录）"
          ] })
        ] })
      }
    )
  ] });
}
function Ml({ item: e, onClose: t }) {
  const [a, i] = z(!0), [r, s] = z(!1);
  Se(() => {
    function h(u) {
      u.key === "Escape" && t();
    }
    return document.addEventListener("keydown", h), () => document.removeEventListener("keydown", h);
  }, [t]);
  function o(h) {
    h.target === h.currentTarget && t();
  }
  function n() {
    i(!1);
  }
  function p() {
    i(!1), s(!0);
  }
  const c = e.path || "", l = !e.url && e.content, d = e.url ? `${e.url}${e.url.includes("?") ? "&" : "?"}ci-process=doc-preview&dstType=html&htmlwaterword=&htmlfillstyle=&htmlfront=&htmlrotate=&htmlhorizontal=&htmlvertical=` : "";
  return /* @__PURE__ */ V("div", { className: "doc-preview-mask", onClick: o, children: [
    /* @__PURE__ */ b("div", { className: "doc-preview-top", children: /* @__PURE__ */ b("div", { className: "doc-preview-top__info", children: /* @__PURE__ */ b("span", { className: "doc-preview-top__name", title: c, children: c || e.name }) }) }),
    /* @__PURE__ */ V("div", { className: "doc-preview-container", onClick: (h) => h.stopPropagation(), children: [
      !l && a && /* @__PURE__ */ V("div", { className: "doc-preview-loading", children: [
        /* @__PURE__ */ b("div", { className: "doc-preview-loading__spinner" }),
        /* @__PURE__ */ b("span", { className: "doc-preview-loading__text", children: "文档加载中..." })
      ] }),
      l ? (
        /* 纯文本展示 */
        /* @__PURE__ */ b("div", { className: "doc-preview-text", children: /* @__PURE__ */ b("pre", { className: "doc-preview-text__content", children: e.content || "无法加载文件内容" }) })
      ) : r ? /* @__PURE__ */ V("div", { className: "doc-preview-error", children: [
        /* @__PURE__ */ b("p", { className: "doc-preview-error__text", children: "文档预览加载失败" }),
        e.content && /* @__PURE__ */ b(
          "button",
          {
            className: "doc-preview-error__link",
            onClick: () => {
              s(!1), i(!1);
            },
            children: "切换为文本模式查看"
          }
        )
      ] }) : d && /* @__PURE__ */ b(
        "iframe",
        {
          className: "doc-preview-iframe",
          src: d,
          title: e.name || "文档预览",
          onLoad: n,
          onError: p,
          sandbox: "allow-scripts allow-same-origin allow-popups"
        }
      )
    ] }),
    /* @__PURE__ */ b("button", { className: "doc-preview-close", onClick: t, title: "关闭", children: "✕" })
  ] });
}
function zl({ item: e, onClose: t }) {
  Se(() => {
    function r(s) {
      s.key === "Escape" && t();
    }
    return document.addEventListener("keydown", r), () => document.removeEventListener("keydown", r);
  }, [t]);
  function a(r) {
    r.target === r.currentTarget && t();
  }
  const i = e.path || "";
  return /* @__PURE__ */ V("div", { className: "img-preview-mask", onClick: a, children: [
    /* @__PURE__ */ b(
      "img",
      {
        className: "img-preview-photo",
        src: e.url,
        alt: e.name
      }
    ),
    i && /* @__PURE__ */ b("div", { className: "img-preview-top", children: /* @__PURE__ */ b("div", { className: "img-preview-top__info", children: /* @__PURE__ */ b("span", { className: "img-preview-top__path", title: i, children: i }) }) }),
    /* @__PURE__ */ b("button", { className: "img-preview-close", onClick: t, title: "关闭", children: "✕" })
  ] });
}
function Pl({ previewImg: e, setPreviewImg: t, previewDoc: a, setPreviewDoc: i }) {
  return /* @__PURE__ */ V(ms, { children: [
    e && /* @__PURE__ */ b(
      zl,
      {
        item: e,
        onClose: () => t(null)
      }
    ),
    a && /* @__PURE__ */ b(
      Ml,
      {
        item: a,
        onClose: () => i(null)
      }
    )
  ] });
}
function hc({
  basePath: e,
  libraryId: t,
  spaceId: a,
  getAccessToken: i,
  enableSearch: r = !1
}) {
  const [s, o] = z(!0), [n, p] = z(null), [c, l] = z(null), d = async () => {
    try {
      const h = await ja();
      h && l(h);
    } catch (h) {
      console.error("获取配额失败:", h.message);
    }
  };
  return Se(() => {
    if (!e || !t || !a || typeof i != "function") {
      p("缺少必要参数：basePath、libraryId、spaceId、getAccessToken 均为必填项"), o(!1);
      return;
    }
    _l({
      basePath: e,
      libraryId: t,
      spaceId: a,
      getAccessToken: i,
      // UI 组件层提供 Toast 错误提示，服务层本身不依赖任何 UI
      onError: ({ message: h }) => se.notify({ type: "error", message: h })
    }), xl().then(() => d()).catch((h) => {
      console.error("初始化失败:", h.message);
    }).finally(() => {
      o(!1);
    });
  }, [e, t, a, i]), Se(() => {
    if (s || n) return;
    const h = setInterval(() => {
      Pt() && ra().catch(() => {
      });
    }, 30 * 1e3);
    return () => clearInterval(h);
  }, [s, n]), s ? /* @__PURE__ */ V("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", height: "100%", gap: 10 }, children: [
    /* @__PURE__ */ b("span", { style: {
      width: 28,
      height: 28,
      border: "3px solid #e5e6eb",
      borderTopColor: "#0052d9",
      borderRadius: "50%",
      animation: "smhSpin 0.8s linear infinite",
      display: "inline-block"
    } }),
    /* @__PURE__ */ b("style", { children: "@keyframes smhSpin { to { transform: rotate(360deg); } }" }),
    /* @__PURE__ */ b("span", { style: { fontSize: 14, color: "rgba(0,0,0,0.45)" }, children: "正在初始化空间..." })
  ] }) : n ? /* @__PURE__ */ V("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }, children: [
    /* @__PURE__ */ V("svg", { width: "48", height: "48", viewBox: "0 0 48 48", fill: "none", children: [
      /* @__PURE__ */ b("circle", { cx: "24", cy: "24", r: "22", stroke: "#e34d59", strokeWidth: "3", fill: "#fff1f0" }),
      /* @__PURE__ */ b("path", { d: "M24 14v14", stroke: "#e34d59", strokeWidth: "3", strokeLinecap: "round" }),
      /* @__PURE__ */ b("circle", { cx: "24", cy: "34", r: "2", fill: "#e34d59" })
    ] }),
    /* @__PURE__ */ b("span", { style: { fontSize: 14, color: "rgba(0,0,0,0.45)" }, children: n })
  ] }) : /* @__PURE__ */ b("div", { style: { display: "flex", flexDirection: "column", height: "100%" }, children: /* @__PURE__ */ b("div", { style: { flex: 1, overflow: "hidden" }, children: /* @__PURE__ */ b(
    Ll,
    {
      username: a,
      enableSearch: r,
      quota: c,
      onQuotaChange: d
    }
  ) }) });
}
export {
  Ll as FilePage,
  Kt as SMHError,
  hc as SpaceDrive,
  cc as clearConfig,
  dc as clearSpaceCache,
  Nr as createDirectory,
  Tr as delDirectory,
  kr as delFile,
  Hr as downloadFile,
  ra as ensureValidToken,
  Rl as getAccessToken,
  Ha as getBasePath,
  Pr as getDocPreviewUrl,
  Vr as getFileInfo,
  Ur as getFileList,
  $a as getFilePreviewUrlOrContent,
  Pa as getLibraryId,
  At as getPreview,
  ia as getSpaceId,
  ja as getSpaceUsage,
  Hi as getTokenExpireInfo,
  xl as initToken,
  $i as isTokenExpired,
  Pt as isTokenExpiringSoon,
  Lr as moveDirectory,
  Qr as moveFile,
  zr as renameDirectory,
  Mr as renameFile,
  Or as renewTokenViaSdk,
  Dr as resetClient,
  jr as searchFiles,
  _l as setSmhConfig,
  $r as uploadFile
};
