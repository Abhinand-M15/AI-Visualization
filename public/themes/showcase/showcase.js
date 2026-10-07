"use strict";(()=>{var dE=Object.create;var bp=Object.defineProperty;var pE=Object.getOwnPropertyDescriptor;var mE=Object.getOwnPropertyNames;var gE=Object.getPrototypeOf,vE=Object.prototype.hasOwnProperty;var yE=(e,t,n)=>t in e?bp(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n;var es=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(n){throw t=0,n}};var xE=(e,t,n,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of mE(t))!vE.call(e,s)&&s!==n&&bp(e,s,{get:()=>t[s],enumerable:!(i=pE(t,s))||i.enumerable});return e};var Yt=(e,t,n)=>(n=e!=null?dE(gE(e)):{},xE(t||!e||!e.__esModule?bp(n,"default",{value:e,enumerable:!0}):n,e));var St=(e,t,n)=>yE(e,typeof t!="symbol"?t+"":t,n);var my=es(ke=>{"use strict";function Ep(e,t){var n=e.length;e.push(t);t:for(;0<n;){var i=n-1>>>1,s=e[i];if(0<fu(s,t))e[i]=t,e[n]=s,n=i;else break t}}function ns(e){return e.length===0?null:e[0]}function pu(e){if(e.length===0)return null;var t=e[0],n=e.pop();if(n!==t){e[0]=n;t:for(var i=0,s=e.length,a=s>>>1;i<a;){var r=2*(i+1)-1,o=e[r],l=r+1,c=e[l];if(0>fu(o,n))l<s&&0>fu(c,o)?(e[i]=c,e[l]=n,i=l):(e[i]=o,e[r]=n,i=r);else if(l<s&&0>fu(c,n))e[i]=c,e[l]=n,i=l;else break t}}return t}function fu(e,t){var n=e.sortIndex-t.sortIndex;return n!==0?n:e.id-t.id}ke.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(ry=performance,ke.unstable_now=function(){return ry.now()}):(Sp=Date,oy=Sp.now(),ke.unstable_now=function(){return Sp.now()-oy});var ry,Sp,oy,Es=[],oa=[],_E=1,xi=null,Nn=3,Tp=!1,dl=!1,pl=!1,Ap=!1,uy=typeof setTimeout=="function"?setTimeout:null,hy=typeof clearTimeout=="function"?clearTimeout:null,ly=typeof setImmediate!="undefined"?setImmediate:null;function du(e){for(var t=ns(oa);t!==null;){if(t.callback===null)pu(oa);else if(t.startTime<=e)pu(oa),t.sortIndex=t.expirationTime,Ep(Es,t);else break;t=ns(oa)}}function Cp(e){if(pl=!1,du(e),!dl)if(ns(Es)!==null)dl=!0,Vr||(Vr=!0,Hr());else{var t=ns(oa);t!==null&&Rp(Cp,t.startTime-e)}}var Vr=!1,ml=-1,fy=5,dy=-1;function py(){return Ap?!0:!(ke.unstable_now()-dy<fy)}function Mp(){if(Ap=!1,Vr){var e=ke.unstable_now();dy=e;var t=!0;try{t:{dl=!1,pl&&(pl=!1,hy(ml),ml=-1),Tp=!0;var n=Nn;try{e:{for(du(e),xi=ns(Es);xi!==null&&!(xi.expirationTime>e&&py());){var i=xi.callback;if(typeof i=="function"){xi.callback=null,Nn=xi.priorityLevel;var s=i(xi.expirationTime<=e);if(e=ke.unstable_now(),typeof s=="function"){xi.callback=s,du(e),t=!0;break e}xi===ns(Es)&&pu(Es),du(e)}else pu(Es);xi=ns(Es)}if(xi!==null)t=!0;else{var a=ns(oa);a!==null&&Rp(Cp,a.startTime-e),t=!1}}break t}finally{xi=null,Nn=n,Tp=!1}t=void 0}}finally{t?Hr():Vr=!1}}}var Hr;typeof ly=="function"?Hr=function(){ly(Mp)}:typeof MessageChannel!="undefined"?(wp=new MessageChannel,cy=wp.port2,wp.port1.onmessage=Mp,Hr=function(){cy.postMessage(null)}):Hr=function(){uy(Mp,0)};var wp,cy;function Rp(e,t){ml=uy(function(){e(ke.unstable_now())},t)}ke.unstable_IdlePriority=5;ke.unstable_ImmediatePriority=1;ke.unstable_LowPriority=4;ke.unstable_NormalPriority=3;ke.unstable_Profiling=null;ke.unstable_UserBlockingPriority=2;ke.unstable_cancelCallback=function(e){e.callback=null};ke.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):fy=0<e?Math.floor(1e3/e):5};ke.unstable_getCurrentPriorityLevel=function(){return Nn};ke.unstable_next=function(e){switch(Nn){case 1:case 2:case 3:var t=3;break;default:t=Nn}var n=Nn;Nn=t;try{return e()}finally{Nn=n}};ke.unstable_requestPaint=function(){Ap=!0};ke.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var n=Nn;Nn=e;try{return t()}finally{Nn=n}};ke.unstable_scheduleCallback=function(e,t,n){var i=ke.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?i+n:i):n=i,e){case 1:var s=-1;break;case 2:s=250;break;case 5:s=1073741823;break;case 4:s=1e4;break;default:s=5e3}return s=n+s,e={id:_E++,callback:t,priorityLevel:e,startTime:n,expirationTime:s,sortIndex:-1},n>i?(e.sortIndex=n,Ep(oa,e),ns(Es)===null&&e===ns(oa)&&(pl?(hy(ml),ml=-1):pl=!0,Rp(Cp,n-i))):(e.sortIndex=s,Ep(Es,e),dl||Tp||(dl=!0,Vr||(Vr=!0,Hr()))),e};ke.unstable_shouldYield=py;ke.unstable_wrapCallback=function(e){var t=Nn;return function(){var n=Nn;Nn=t;try{return e.apply(this,arguments)}finally{Nn=n}}}});var vy=es((QD,gy)=>{"use strict";gy.exports=my()});var Cy=es(kt=>{"use strict";var Dp=Symbol.for("react.transitional.element"),bE=Symbol.for("react.portal"),SE=Symbol.for("react.fragment"),ME=Symbol.for("react.strict_mode"),wE=Symbol.for("react.profiler"),EE=Symbol.for("react.consumer"),TE=Symbol.for("react.context"),AE=Symbol.for("react.forward_ref"),CE=Symbol.for("react.suspense"),RE=Symbol.for("react.memo"),Sy=Symbol.for("react.lazy"),NE=Symbol.for("react.activity"),yy=Symbol.iterator;function LE(e){return e===null||typeof e!="object"?null:(e=yy&&e[yy]||e["@@iterator"],typeof e=="function"?e:null)}var My={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},wy=Object.assign,Ey={};function kr(e,t,n){this.props=e,this.context=t,this.refs=Ey,this.updater=n||My}kr.prototype.isReactComponent={};kr.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};kr.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Ty(){}Ty.prototype=kr.prototype;function Up(e,t,n){this.props=e,this.context=t,this.refs=Ey,this.updater=n||My}var Ip=Up.prototype=new Ty;Ip.constructor=Up;wy(Ip,kr.prototype);Ip.isPureReactComponent=!0;var xy=Array.isArray;function Lp(){}var Be={H:null,A:null,T:null,S:null},Ay=Object.prototype.hasOwnProperty;function Op(e,t,n){var i=n.ref;return{$$typeof:Dp,type:e,key:t,ref:i!==void 0?i:null,props:n}}function DE(e,t){return Op(e.type,t,e.props)}function Pp(e){return typeof e=="object"&&e!==null&&e.$$typeof===Dp}function UE(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(n){return t[n]})}var _y=/\/+/g;function Np(e,t){return typeof e=="object"&&e!==null&&e.key!=null?UE(""+e.key):t.toString(36)}function IE(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(Lp,Lp):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Gr(e,t,n,i,s){var a=typeof e;(a==="undefined"||a==="boolean")&&(e=null);var r=!1;if(e===null)r=!0;else switch(a){case"bigint":case"string":case"number":r=!0;break;case"object":switch(e.$$typeof){case Dp:case bE:r=!0;break;case Sy:return r=e._init,Gr(r(e._payload),t,n,i,s)}}if(r)return s=s(e),r=i===""?"."+Np(e,0):i,xy(s)?(n="",r!=null&&(n=r.replace(_y,"$&/")+"/"),Gr(s,t,n,"",function(c){return c})):s!=null&&(Pp(s)&&(s=DE(s,n+(s.key==null||e&&e.key===s.key?"":(""+s.key).replace(_y,"$&/")+"/")+r)),t.push(s)),1;r=0;var o=i===""?".":i+":";if(xy(e))for(var l=0;l<e.length;l++)i=e[l],a=o+Np(i,l),r+=Gr(i,t,n,a,s);else if(l=LE(e),typeof l=="function")for(e=l.call(e),l=0;!(i=e.next()).done;)i=i.value,a=o+Np(i,l++),r+=Gr(i,t,n,a,s);else if(a==="object"){if(typeof e.then=="function")return Gr(IE(e),t,n,i,s);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return r}function mu(e,t,n){if(e==null)return e;var i=[],s=0;return Gr(e,i,"","",function(a){return t.call(n,a,s++)}),i}function OE(e){if(e._status===-1){var t=e._result;t=t(),t.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n)},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n)}),e._status===-1&&(e._status=0,e._result=t)}if(e._status===1)return e._result.default;throw e._result}var by=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},PE={map:mu,forEach:function(e,t,n){mu(e,function(){t.apply(this,arguments)},n)},count:function(e){var t=0;return mu(e,function(){t++}),t},toArray:function(e){return mu(e,function(t){return t})||[]},only:function(e){if(!Pp(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};kt.Activity=NE;kt.Children=PE;kt.Component=kr;kt.Fragment=SE;kt.Profiler=wE;kt.PureComponent=Up;kt.StrictMode=ME;kt.Suspense=CE;kt.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Be;kt.__COMPILER_RUNTIME={__proto__:null,c:function(e){return Be.H.useMemoCache(e)}};kt.cache=function(e){return function(){return e.apply(null,arguments)}};kt.cacheSignal=function(){return null};kt.cloneElement=function(e,t,n){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var i=wy({},e.props),s=e.key;if(t!=null)for(a in t.key!==void 0&&(s=""+t.key),t)!Ay.call(t,a)||a==="key"||a==="__self"||a==="__source"||a==="ref"&&t.ref===void 0||(i[a]=t[a]);var a=arguments.length-2;if(a===1)i.children=n;else if(1<a){for(var r=Array(a),o=0;o<a;o++)r[o]=arguments[o+2];i.children=r}return Op(e.type,s,i)};kt.createContext=function(e){return e={$$typeof:TE,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:EE,_context:e},e};kt.createElement=function(e,t,n){var i,s={},a=null;if(t!=null)for(i in t.key!==void 0&&(a=""+t.key),t)Ay.call(t,i)&&i!=="key"&&i!=="__self"&&i!=="__source"&&(s[i]=t[i]);var r=arguments.length-2;if(r===1)s.children=n;else if(1<r){for(var o=Array(r),l=0;l<r;l++)o[l]=arguments[l+2];s.children=o}if(e&&e.defaultProps)for(i in r=e.defaultProps,r)s[i]===void 0&&(s[i]=r[i]);return Op(e,a,s)};kt.createRef=function(){return{current:null}};kt.forwardRef=function(e){return{$$typeof:AE,render:e}};kt.isValidElement=Pp;kt.lazy=function(e){return{$$typeof:Sy,_payload:{_status:-1,_result:e},_init:OE}};kt.memo=function(e,t){return{$$typeof:RE,type:e,compare:t===void 0?null:t}};kt.startTransition=function(e){var t=Be.T,n={};Be.T=n;try{var i=e(),s=Be.S;s!==null&&s(n,i),typeof i=="object"&&i!==null&&typeof i.then=="function"&&i.then(Lp,by)}catch(a){by(a)}finally{t!==null&&n.types!==null&&(t.types=n.types),Be.T=t}};kt.unstable_useCacheRefresh=function(){return Be.H.useCacheRefresh()};kt.use=function(e){return Be.H.use(e)};kt.useActionState=function(e,t,n){return Be.H.useActionState(e,t,n)};kt.useCallback=function(e,t){return Be.H.useCallback(e,t)};kt.useContext=function(e){return Be.H.useContext(e)};kt.useDebugValue=function(){};kt.useDeferredValue=function(e,t){return Be.H.useDeferredValue(e,t)};kt.useEffect=function(e,t){return Be.H.useEffect(e,t)};kt.useEffectEvent=function(e){return Be.H.useEffectEvent(e)};kt.useId=function(){return Be.H.useId()};kt.useImperativeHandle=function(e,t,n){return Be.H.useImperativeHandle(e,t,n)};kt.useInsertionEffect=function(e,t){return Be.H.useInsertionEffect(e,t)};kt.useLayoutEffect=function(e,t){return Be.H.useLayoutEffect(e,t)};kt.useMemo=function(e,t){return Be.H.useMemo(e,t)};kt.useOptimistic=function(e,t){return Be.H.useOptimistic(e,t)};kt.useReducer=function(e,t,n){return Be.H.useReducer(e,t,n)};kt.useRef=function(e){return Be.H.useRef(e)};kt.useState=function(e){return Be.H.useState(e)};kt.useSyncExternalStore=function(e,t,n){return Be.H.useSyncExternalStore(e,t,n)};kt.useTransition=function(){return Be.H.useTransition()};kt.version="19.2.8"});var Sn=es(($D,Ry)=>{"use strict";Ry.exports=Cy()});var Ly=es(Pn=>{"use strict";var BE=Sn();function Ny(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function la(){}var On={d:{f:la,r:function(){throw Error(Ny(522))},D:la,C:la,L:la,m:la,X:la,S:la,M:la},p:0,findDOMNode:null},zE=Symbol.for("react.portal");function FE(e,t,n){var i=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:zE,key:i==null?null:""+i,children:e,containerInfo:t,implementation:n}}var gl=BE.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function gu(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}Pn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=On;Pn.createPortal=function(e,t){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(Ny(299));return FE(e,t,null,n)};Pn.flushSync=function(e){var t=gl.T,n=On.p;try{if(gl.T=null,On.p=2,e)return e()}finally{gl.T=t,On.p=n,On.d.f()}};Pn.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,On.d.C(e,t))};Pn.prefetchDNS=function(e){typeof e=="string"&&On.d.D(e)};Pn.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var n=t.as,i=gu(n,t.crossOrigin),s=typeof t.integrity=="string"?t.integrity:void 0,a=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;n==="style"?On.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:i,integrity:s,fetchPriority:a}):n==="script"&&On.d.X(e,{crossOrigin:i,integrity:s,fetchPriority:a,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};Pn.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var n=gu(t.as,t.crossOrigin);On.d.M(e,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0})}}else t==null&&On.d.M(e)};Pn.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var n=t.as,i=gu(n,t.crossOrigin);On.d.L(e,n,{crossOrigin:i,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};Pn.preloadModule=function(e,t){if(typeof e=="string")if(t){var n=gu(t.as,t.crossOrigin);On.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0})}else On.d.m(e)};Pn.requestFormReset=function(e){On.d.r(e)};Pn.unstable_batchedUpdates=function(e,t){return e(t)};Pn.useFormState=function(e,t,n){return gl.H.useFormState(e,t,n)};Pn.useFormStatus=function(){return gl.H.useHostTransitionStatus()};Pn.version="19.2.8"});var Iy=es((eU,Uy)=>{"use strict";function Dy(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__=="undefined"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Dy)}catch(e){console.error(e)}}Dy(),Uy.exports=Ly()});var qS=es(Vh=>{"use strict";var un=vy(),r_=Sn(),HE=Iy();function $(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)t+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function o_(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function nc(e){var t=e,n=e;if(e.alternate)for(;t.return;)t=t.return;else{e=t;do t=e,(t.flags&4098)!==0&&(n=t.return),e=t.return;while(e)}return t.tag===3?n:null}function l_(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function c_(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Oy(e){if(nc(e)!==e)throw Error($(188))}function VE(e){var t=e.alternate;if(!t){if(t=nc(e),t===null)throw Error($(188));return t!==e?null:e}for(var n=e,i=t;;){var s=n.return;if(s===null)break;var a=s.alternate;if(a===null){if(i=s.return,i!==null){n=i;continue}break}if(s.child===a.child){for(a=s.child;a;){if(a===n)return Oy(s),e;if(a===i)return Oy(s),t;a=a.sibling}throw Error($(188))}if(n.return!==i.return)n=s,i=a;else{for(var r=!1,o=s.child;o;){if(o===n){r=!0,n=s,i=a;break}if(o===i){r=!0,i=s,n=a;break}o=o.sibling}if(!r){for(o=a.child;o;){if(o===n){r=!0,n=a,i=s;break}if(o===i){r=!0,i=a,n=s;break}o=o.sibling}if(!r)throw Error($(189))}}if(n.alternate!==i)throw Error($(190))}if(n.tag!==3)throw Error($(188));return n.stateNode.current===n?e:t}function u_(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=u_(e),t!==null)return t;e=e.sibling}return null}var He=Object.assign,GE=Symbol.for("react.element"),vu=Symbol.for("react.transitional.element"),wl=Symbol.for("react.portal"),Jr=Symbol.for("react.fragment"),h_=Symbol.for("react.strict_mode"),gm=Symbol.for("react.profiler"),f_=Symbol.for("react.consumer"),Us=Symbol.for("react.context"),h0=Symbol.for("react.forward_ref"),vm=Symbol.for("react.suspense"),ym=Symbol.for("react.suspense_list"),f0=Symbol.for("react.memo"),ca=Symbol.for("react.lazy"),xm=Symbol.for("react.activity"),kE=Symbol.for("react.memo_cache_sentinel"),Py=Symbol.iterator;function vl(e){return e===null||typeof e!="object"?null:(e=Py&&e[Py]||e["@@iterator"],typeof e=="function"?e:null)}var WE=Symbol.for("react.client.reference");function _m(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===WE?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Jr:return"Fragment";case gm:return"Profiler";case h_:return"StrictMode";case vm:return"Suspense";case ym:return"SuspenseList";case xm:return"Activity"}if(typeof e=="object")switch(e.$$typeof){case wl:return"Portal";case Us:return e.displayName||"Context";case f_:return(e._context.displayName||"Context")+".Consumer";case h0:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case f0:return t=e.displayName||null,t!==null?t:_m(e.type)||"Memo";case ca:t=e._payload,e=e._init;try{return _m(e(t))}catch{}}return null}var El=Array.isArray,Ft=r_.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,me=HE.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,cr={pending:!1,data:null,method:null,action:null},bm=[],Kr=-1;function os(e){return{current:e}}function gn(e){0>Kr||(e.current=bm[Kr],bm[Kr]=null,Kr--)}function Oe(e,t){Kr++,bm[Kr]=e.current,e.current=t}var rs=os(null),Gl=os(null),_a=os(null),Ku=os(null);function Qu(e,t){switch(Oe(_a,t),Oe(Gl,e),Oe(rs,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?kx(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=kx(t),e=DS(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}gn(rs),Oe(rs,e)}function mo(){gn(rs),gn(Gl),gn(_a)}function Sm(e){e.memoizedState!==null&&Oe(Ku,e);var t=rs.current,n=DS(t,e.type);t!==n&&(Oe(Gl,e),Oe(rs,n))}function ju(e){Gl.current===e&&(gn(rs),gn(Gl)),Ku.current===e&&(gn(Ku),$l._currentValue=cr)}var Bp,By;function ar(e){if(Bp===void 0)try{throw Error()}catch(n){var t=n.stack.trim().match(/\n( *(at )?)/);Bp=t&&t[1]||"",By=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Bp+e+By}var zp=!1;function Fp(e,t){if(!e||zp)return"";zp=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var i={DetermineComponentFrameRoot:function(){try{if(t){var d=function(){throw Error()};if(Object.defineProperty(d.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(d,[])}catch(p){var u=p}Reflect.construct(e,[],d)}else{try{d.call()}catch(p){u=p}e.call(d.prototype)}}else{try{throw Error()}catch(p){u=p}(d=e())&&typeof d.catch=="function"&&d.catch(function(){})}}catch(p){if(p&&u&&typeof p.stack=="string")return[p.stack,u.stack]}return[null,null]}};i.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var s=Object.getOwnPropertyDescriptor(i.DetermineComponentFrameRoot,"name");s&&s.configurable&&Object.defineProperty(i.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var a=i.DetermineComponentFrameRoot(),r=a[0],o=a[1];if(r&&o){var l=r.split(`
`),c=o.split(`
`);for(s=i=0;i<l.length&&!l[i].includes("DetermineComponentFrameRoot");)i++;for(;s<c.length&&!c[s].includes("DetermineComponentFrameRoot");)s++;if(i===l.length||s===c.length)for(i=l.length-1,s=c.length-1;1<=i&&0<=s&&l[i]!==c[s];)s--;for(;1<=i&&0<=s;i--,s--)if(l[i]!==c[s]){if(i!==1||s!==1)do if(i--,s--,0>s||l[i]!==c[s]){var h=`
`+l[i].replace(" at new "," at ");return e.displayName&&h.includes("<anonymous>")&&(h=h.replace("<anonymous>",e.displayName)),h}while(1<=i&&0<=s);break}}}finally{zp=!1,Error.prepareStackTrace=n}return(n=e?e.displayName||e.name:"")?ar(n):""}function XE(e,t){switch(e.tag){case 26:case 27:case 5:return ar(e.type);case 16:return ar("Lazy");case 13:return e.child!==t&&t!==null?ar("Suspense Fallback"):ar("Suspense");case 19:return ar("SuspenseList");case 0:case 15:return Fp(e.type,!1);case 11:return Fp(e.type.render,!1);case 1:return Fp(e.type,!0);case 31:return ar("Activity");default:return""}}function zy(e){try{var t="",n=null;do t+=XE(e,n),n=e,e=e.return;while(e);return t}catch(i){return`
Error generating stack: `+i.message+`
`+i.stack}}var Mm=Object.prototype.hasOwnProperty,d0=un.unstable_scheduleCallback,Hp=un.unstable_cancelCallback,qE=un.unstable_shouldYield,YE=un.unstable_requestPaint,ri=un.unstable_now,ZE=un.unstable_getCurrentPriorityLevel,d_=un.unstable_ImmediatePriority,p_=un.unstable_UserBlockingPriority,$u=un.unstable_NormalPriority,JE=un.unstable_LowPriority,m_=un.unstable_IdlePriority,KE=un.log,QE=un.unstable_setDisableYieldValue,ic=null,oi=null;function ma(e){if(typeof KE=="function"&&QE(e),oi&&typeof oi.setStrictMode=="function")try{oi.setStrictMode(ic,e)}catch{}}var li=Math.clz32?Math.clz32:tT,jE=Math.log,$E=Math.LN2;function tT(e){return e>>>=0,e===0?32:31-(jE(e)/$E|0)|0}var yu=256,xu=262144,_u=4194304;function rr(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Eh(e,t,n){var i=e.pendingLanes;if(i===0)return 0;var s=0,a=e.suspendedLanes,r=e.pingedLanes;e=e.warmLanes;var o=i&134217727;return o!==0?(i=o&~a,i!==0?s=rr(i):(r&=o,r!==0?s=rr(r):n||(n=o&~e,n!==0&&(s=rr(n))))):(o=i&~a,o!==0?s=rr(o):r!==0?s=rr(r):n||(n=i&~e,n!==0&&(s=rr(n)))),s===0?0:t!==0&&t!==s&&(t&a)===0&&(a=s&-s,n=t&-t,a>=n||a===32&&(n&4194048)!==0)?t:s}function sc(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function eT(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function g_(){var e=_u;return _u<<=1,(_u&62914560)===0&&(_u=4194304),e}function Vp(e){for(var t=[],n=0;31>n;n++)t.push(e);return t}function ac(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function nT(e,t,n,i,s,a){var r=e.pendingLanes;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=n,e.entangledLanes&=n,e.errorRecoveryDisabledLanes&=n,e.shellSuspendCounter=0;var o=e.entanglements,l=e.expirationTimes,c=e.hiddenUpdates;for(n=r&~n;0<n;){var h=31-li(n),d=1<<h;o[h]=0,l[h]=-1;var u=c[h];if(u!==null)for(c[h]=null,h=0;h<u.length;h++){var p=u[h];p!==null&&(p.lane&=-536870913)}n&=~d}i!==0&&v_(e,i,0),a!==0&&s===0&&e.tag!==0&&(e.suspendedLanes|=a&~(r&~t))}function v_(e,t,n){e.pendingLanes|=t,e.suspendedLanes&=~t;var i=31-li(t);e.entangledLanes|=t,e.entanglements[i]=e.entanglements[i]|1073741824|n&261930}function y_(e,t){var n=e.entangledLanes|=t;for(e=e.entanglements;n;){var i=31-li(n),s=1<<i;s&t|e[i]&t&&(e[i]|=t),n&=~s}}function x_(e,t){var n=t&-t;return n=(n&42)!==0?1:p0(n),(n&(e.suspendedLanes|t))!==0?0:n}function p0(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function m0(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function __(){var e=me.p;return e!==0?e:(e=window.event,e===void 0?32:kS(e.type))}function Fy(e,t){var n=me.p;try{return me.p=e,t()}finally{me.p=n}}var Ua=Math.random().toString(36).slice(2),wn="__reactFiber$"+Ua,Zn="__reactProps$"+Ua,To="__reactContainer$"+Ua,wm="__reactEvents$"+Ua,iT="__reactListeners$"+Ua,sT="__reactHandles$"+Ua,Hy="__reactResources$"+Ua,rc="__reactMarker$"+Ua;function g0(e){delete e[wn],delete e[Zn],delete e[wm],delete e[iT],delete e[sT]}function Qr(e){var t=e[wn];if(t)return t;for(var n=e.parentNode;n;){if(t=n[To]||n[wn]){if(n=t.alternate,t.child!==null||n!==null&&n.child!==null)for(e=Zx(e);e!==null;){if(n=e[wn])return n;e=Zx(e)}return t}e=n,n=e.parentNode}return null}function Ao(e){if(e=e[wn]||e[To]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Tl(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error($(33))}function oo(e){var t=e[Hy];return t||(t=e[Hy]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function mn(e){e[rc]=!0}var b_=new Set,S_={};function xr(e,t){go(e,t),go(e+"Capture",t)}function go(e,t){for(S_[e]=t,e=0;e<t.length;e++)b_.add(t[e])}var aT=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Vy={},Gy={};function rT(e){return Mm.call(Gy,e)?!0:Mm.call(Vy,e)?!1:aT.test(e)?Gy[e]=!0:(Vy[e]=!0,!1)}function Ou(e,t,n){if(rT(t))if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var i=t.toLowerCase().slice(0,5);if(i!=="data-"&&i!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,""+n)}}function bu(e,t,n){if(n===null)e.removeAttribute(t);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,""+n)}}function Ts(e,t,n,i){if(i===null)e.removeAttribute(n);else{switch(typeof i){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(n);return}e.setAttributeNS(t,n,""+i)}}function bi(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function M_(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function oT(e,t,n){var i=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof i!="undefined"&&typeof i.get=="function"&&typeof i.set=="function"){var s=i.get,a=i.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return s.call(this)},set:function(r){n=""+r,a.call(this,r)}}),Object.defineProperty(e,t,{enumerable:i.enumerable}),{getValue:function(){return n},setValue:function(r){n=""+r},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Em(e){if(!e._valueTracker){var t=M_(e)?"checked":"value";e._valueTracker=oT(e,t,""+e[t])}}function w_(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var n=t.getValue(),i="";return e&&(i=M_(e)?e.checked?"true":"false":e.value),e=i,e!==n?(t.setValue(e),!0):!1}function th(e){if(e=e||(typeof document!="undefined"?document:void 0),typeof e=="undefined")return null;try{return e.activeElement||e.body}catch{return e.body}}var lT=/[\n"\\]/g;function wi(e){return e.replace(lT,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Tm(e,t,n,i,s,a,r,o){e.name="",r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"?e.type=r:e.removeAttribute("type"),t!=null?r==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+bi(t)):e.value!==""+bi(t)&&(e.value=""+bi(t)):r!=="submit"&&r!=="reset"||e.removeAttribute("value"),t!=null?Am(e,r,bi(t)):n!=null?Am(e,r,bi(n)):i!=null&&e.removeAttribute("value"),s==null&&a!=null&&(e.defaultChecked=!!a),s!=null&&(e.checked=s&&typeof s!="function"&&typeof s!="symbol"),o!=null&&typeof o!="function"&&typeof o!="symbol"&&typeof o!="boolean"?e.name=""+bi(o):e.removeAttribute("name")}function E_(e,t,n,i,s,a,r,o){if(a!=null&&typeof a!="function"&&typeof a!="symbol"&&typeof a!="boolean"&&(e.type=a),t!=null||n!=null){if(!(a!=="submit"&&a!=="reset"||t!=null)){Em(e);return}n=n!=null?""+bi(n):"",t=t!=null?""+bi(t):n,o||t===e.value||(e.value=t),e.defaultValue=t}i=i!=null?i:s,i=typeof i!="function"&&typeof i!="symbol"&&!!i,e.checked=o?e.checked:!!i,e.defaultChecked=!!i,r!=null&&typeof r!="function"&&typeof r!="symbol"&&typeof r!="boolean"&&(e.name=r),Em(e)}function Am(e,t,n){t==="number"&&th(e.ownerDocument)===e||e.defaultValue===""+n||(e.defaultValue=""+n)}function lo(e,t,n,i){if(e=e.options,t){t={};for(var s=0;s<n.length;s++)t["$"+n[s]]=!0;for(n=0;n<e.length;n++)s=t.hasOwnProperty("$"+e[n].value),e[n].selected!==s&&(e[n].selected=s),s&&i&&(e[n].defaultSelected=!0)}else{for(n=""+bi(n),t=null,s=0;s<e.length;s++){if(e[s].value===n){e[s].selected=!0,i&&(e[s].defaultSelected=!0);return}t!==null||e[s].disabled||(t=e[s])}t!==null&&(t.selected=!0)}}function T_(e,t,n){if(t!=null&&(t=""+bi(t),t!==e.value&&(e.value=t),n==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=n!=null?""+bi(n):""}function A_(e,t,n,i){if(t==null){if(i!=null){if(n!=null)throw Error($(92));if(El(i)){if(1<i.length)throw Error($(93));i=i[0]}n=i}n==null&&(n=""),t=n}n=bi(t),e.defaultValue=n,i=e.textContent,i===n&&i!==""&&i!==null&&(e.value=i),Em(e)}function vo(e,t){if(t){var n=e.firstChild;if(n&&n===e.lastChild&&n.nodeType===3){n.nodeValue=t;return}}e.textContent=t}var cT=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function ky(e,t,n){var i=t.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?i?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":i?e.setProperty(t,n):typeof n!="number"||n===0||cT.has(t)?t==="float"?e.cssFloat=n:e[t]=(""+n).trim():e[t]=n+"px"}function C_(e,t,n){if(t!=null&&typeof t!="object")throw Error($(62));if(e=e.style,n!=null){for(var i in n)!n.hasOwnProperty(i)||t!=null&&t.hasOwnProperty(i)||(i.indexOf("--")===0?e.setProperty(i,""):i==="float"?e.cssFloat="":e[i]="");for(var s in t)i=t[s],t.hasOwnProperty(s)&&n[s]!==i&&ky(e,s,i)}else for(var a in t)t.hasOwnProperty(a)&&ky(e,a,t[a])}function v0(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var uT=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),hT=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Pu(e){return hT.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function Is(){}var Cm=null;function y0(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var jr=null,co=null;function Wy(e){var t=Ao(e);if(t&&(e=t.stateNode)){var n=e[Zn]||null;t:switch(e=t.stateNode,t.type){case"input":if(Tm(e,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),t=n.name,n.type==="radio"&&t!=null){for(n=e;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+wi(""+t)+'"][type="radio"]'),t=0;t<n.length;t++){var i=n[t];if(i!==e&&i.form===e.form){var s=i[Zn]||null;if(!s)throw Error($(90));Tm(i,s.value,s.defaultValue,s.defaultValue,s.checked,s.defaultChecked,s.type,s.name)}}for(t=0;t<n.length;t++)i=n[t],i.form===e.form&&w_(i)}break t;case"textarea":T_(e,n.value,n.defaultValue);break t;case"select":t=n.value,t!=null&&lo(e,!!n.multiple,t,!1)}}}var Gp=!1;function R_(e,t,n){if(Gp)return e(t,n);Gp=!0;try{var i=e(t);return i}finally{if(Gp=!1,(jr!==null||co!==null)&&(Bh(),jr&&(t=jr,e=co,co=jr=null,Wy(t),e)))for(t=0;t<e.length;t++)Wy(e[t])}}function kl(e,t){var n=e.stateNode;if(n===null)return null;var i=n[Zn]||null;if(i===null)return null;n=i[t];t:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(i=!i.disabled)||(e=e.type,i=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!i;break t;default:e=!1}if(e)return null;if(n&&typeof n!="function")throw Error($(231,t,typeof n));return n}var Fs=!(typeof window=="undefined"||typeof window.document=="undefined"||typeof window.document.createElement=="undefined"),Rm=!1;if(Fs)try{Wr={},Object.defineProperty(Wr,"passive",{get:function(){Rm=!0}}),window.addEventListener("test",Wr,Wr),window.removeEventListener("test",Wr,Wr)}catch{Rm=!1}var Wr,ga=null,x0=null,Bu=null;function N_(){if(Bu)return Bu;var e,t=x0,n=t.length,i,s="value"in ga?ga.value:ga.textContent,a=s.length;for(e=0;e<n&&t[e]===s[e];e++);var r=n-e;for(i=1;i<=r&&t[n-i]===s[a-i];i++);return Bu=s.slice(e,1<i?1-i:void 0)}function zu(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Su(){return!0}function Xy(){return!1}function Jn(e){function t(n,i,s,a,r){this._reactName=n,this._targetInst=s,this.type=i,this.nativeEvent=a,this.target=r,this.currentTarget=null;for(var o in e)e.hasOwnProperty(o)&&(n=e[o],this[o]=n?n(a):a[o]);return this.isDefaultPrevented=(a.defaultPrevented!=null?a.defaultPrevented:a.returnValue===!1)?Su:Xy,this.isPropagationStopped=Xy,this}return He(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Su)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Su)},persist:function(){},isPersistent:Su}),t}var _r={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Th=Jn(_r),oc=He({},_r,{view:0,detail:0}),fT=Jn(oc),kp,Wp,yl,Ah=He({},oc,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:_0,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==yl&&(yl&&e.type==="mousemove"?(kp=e.screenX-yl.screenX,Wp=e.screenY-yl.screenY):Wp=kp=0,yl=e),kp)},movementY:function(e){return"movementY"in e?e.movementY:Wp}}),qy=Jn(Ah),dT=He({},Ah,{dataTransfer:0}),pT=Jn(dT),mT=He({},oc,{relatedTarget:0}),Xp=Jn(mT),gT=He({},_r,{animationName:0,elapsedTime:0,pseudoElement:0}),vT=Jn(gT),yT=He({},_r,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),xT=Jn(yT),_T=He({},_r,{data:0}),Yy=Jn(_T),bT={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},ST={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},MT={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function wT(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=MT[e])?!!t[e]:!1}function _0(){return wT}var ET=He({},oc,{key:function(e){if(e.key){var t=bT[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=zu(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?ST[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:_0,charCode:function(e){return e.type==="keypress"?zu(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?zu(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),TT=Jn(ET),AT=He({},Ah,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Zy=Jn(AT),CT=He({},oc,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:_0}),RT=Jn(CT),NT=He({},_r,{propertyName:0,elapsedTime:0,pseudoElement:0}),LT=Jn(NT),DT=He({},Ah,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),UT=Jn(DT),IT=He({},_r,{newState:0,oldState:0}),OT=Jn(IT),PT=[9,13,27,32],b0=Fs&&"CompositionEvent"in window,Rl=null;Fs&&"documentMode"in document&&(Rl=document.documentMode);var BT=Fs&&"TextEvent"in window&&!Rl,L_=Fs&&(!b0||Rl&&8<Rl&&11>=Rl),Jy=" ",Ky=!1;function D_(e,t){switch(e){case"keyup":return PT.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function U_(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var $r=!1;function zT(e,t){switch(e){case"compositionend":return U_(t);case"keypress":return t.which!==32?null:(Ky=!0,Jy);case"textInput":return e=t.data,e===Jy&&Ky?null:e;default:return null}}function FT(e,t){if($r)return e==="compositionend"||!b0&&D_(e,t)?(e=N_(),Bu=x0=ga=null,$r=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return L_&&t.locale!=="ko"?null:t.data;default:return null}}var HT={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Qy(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!HT[e.type]:t==="textarea"}function I_(e,t,n,i){jr?co?co.push(i):co=[i]:jr=i,t=yh(t,"onChange"),0<t.length&&(n=new Th("onChange","change",null,n,i),e.push({event:n,listeners:t}))}var Nl=null,Wl=null;function VT(e){RS(e,0)}function Ch(e){var t=Tl(e);if(w_(t))return e}function jy(e,t){if(e==="change")return t}var O_=!1;Fs&&(Fs?(wu="oninput"in document,wu||(qp=document.createElement("div"),qp.setAttribute("oninput","return;"),wu=typeof qp.oninput=="function"),Mu=wu):Mu=!1,O_=Mu&&(!document.documentMode||9<document.documentMode));var Mu,wu,qp;function $y(){Nl&&(Nl.detachEvent("onpropertychange",P_),Wl=Nl=null)}function P_(e){if(e.propertyName==="value"&&Ch(Wl)){var t=[];I_(t,Wl,e,y0(e)),R_(VT,t)}}function GT(e,t,n){e==="focusin"?($y(),Nl=t,Wl=n,Nl.attachEvent("onpropertychange",P_)):e==="focusout"&&$y()}function kT(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return Ch(Wl)}function WT(e,t){if(e==="click")return Ch(t)}function XT(e,t){if(e==="input"||e==="change")return Ch(t)}function qT(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var ui=typeof Object.is=="function"?Object.is:qT;function Xl(e,t){if(ui(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var n=Object.keys(e),i=Object.keys(t);if(n.length!==i.length)return!1;for(i=0;i<n.length;i++){var s=n[i];if(!Mm.call(t,s)||!ui(e[s],t[s]))return!1}return!0}function tx(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function ex(e,t){var n=tx(e);e=0;for(var i;n;){if(n.nodeType===3){if(i=e+n.textContent.length,e<=t&&i>=t)return{node:n,offset:t-e};e=i}t:{for(;n;){if(n.nextSibling){n=n.nextSibling;break t}n=n.parentNode}n=void 0}n=tx(n)}}function B_(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?B_(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function z_(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=th(e.document);t instanceof e.HTMLIFrameElement;){try{var n=typeof t.contentWindow.location.href=="string"}catch{n=!1}if(n)e=t.contentWindow;else break;t=th(e.document)}return t}function S0(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var YT=Fs&&"documentMode"in document&&11>=document.documentMode,to=null,Nm=null,Ll=null,Lm=!1;function nx(e,t,n){var i=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;Lm||to==null||to!==th(i)||(i=to,"selectionStart"in i&&S0(i)?i={start:i.selectionStart,end:i.selectionEnd}:(i=(i.ownerDocument&&i.ownerDocument.defaultView||window).getSelection(),i={anchorNode:i.anchorNode,anchorOffset:i.anchorOffset,focusNode:i.focusNode,focusOffset:i.focusOffset}),Ll&&Xl(Ll,i)||(Ll=i,i=yh(Nm,"onSelect"),0<i.length&&(t=new Th("onSelect","select",null,t,n),e.push({event:t,listeners:i}),t.target=to)))}function sr(e,t){var n={};return n[e.toLowerCase()]=t.toLowerCase(),n["Webkit"+e]="webkit"+t,n["Moz"+e]="moz"+t,n}var eo={animationend:sr("Animation","AnimationEnd"),animationiteration:sr("Animation","AnimationIteration"),animationstart:sr("Animation","AnimationStart"),transitionrun:sr("Transition","TransitionRun"),transitionstart:sr("Transition","TransitionStart"),transitioncancel:sr("Transition","TransitionCancel"),transitionend:sr("Transition","TransitionEnd")},Yp={},F_={};Fs&&(F_=document.createElement("div").style,"AnimationEvent"in window||(delete eo.animationend.animation,delete eo.animationiteration.animation,delete eo.animationstart.animation),"TransitionEvent"in window||delete eo.transitionend.transition);function br(e){if(Yp[e])return Yp[e];if(!eo[e])return e;var t=eo[e],n;for(n in t)if(t.hasOwnProperty(n)&&n in F_)return Yp[e]=t[n];return e}var H_=br("animationend"),V_=br("animationiteration"),G_=br("animationstart"),ZT=br("transitionrun"),JT=br("transitionstart"),KT=br("transitioncancel"),k_=br("transitionend"),W_=new Map,Dm="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Dm.push("scrollEnd");function Hi(e,t){W_.set(e,t),xr(t,[e])}var eh=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},_i=[],no=0,M0=0;function Rh(){for(var e=no,t=M0=no=0;t<e;){var n=_i[t];_i[t++]=null;var i=_i[t];_i[t++]=null;var s=_i[t];_i[t++]=null;var a=_i[t];if(_i[t++]=null,i!==null&&s!==null){var r=i.pending;r===null?s.next=s:(s.next=r.next,r.next=s),i.pending=s}a!==0&&X_(n,s,a)}}function Nh(e,t,n,i){_i[no++]=e,_i[no++]=t,_i[no++]=n,_i[no++]=i,M0|=i,e.lanes|=i,e=e.alternate,e!==null&&(e.lanes|=i)}function w0(e,t,n,i){return Nh(e,t,n,i),nh(e)}function Sr(e,t){return Nh(e,null,null,t),nh(e)}function X_(e,t,n){e.lanes|=n;var i=e.alternate;i!==null&&(i.lanes|=n);for(var s=!1,a=e.return;a!==null;)a.childLanes|=n,i=a.alternate,i!==null&&(i.childLanes|=n),a.tag===22&&(e=a.stateNode,e===null||e._visibility&1||(s=!0)),e=a,a=a.return;return e.tag===3?(a=e.stateNode,s&&t!==null&&(s=31-li(n),e=a.hiddenUpdates,i=e[s],i===null?e[s]=[t]:i.push(t),t.lane=n|536870912),a):null}function nh(e){if(50<Hl)throw Hl=0,$m=null,Error($(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var io={};function QT(e,t,n,i){this.tag=e,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=i,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function si(e,t,n,i){return new QT(e,t,n,i)}function E0(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Ps(e,t){var n=e.alternate;return n===null?(n=si(e.tag,t,e.key,e.mode),n.elementType=e.elementType,n.type=e.type,n.stateNode=e.stateNode,n.alternate=e,e.alternate=n):(n.pendingProps=t,n.type=e.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=e.flags&65011712,n.childLanes=e.childLanes,n.lanes=e.lanes,n.child=e.child,n.memoizedProps=e.memoizedProps,n.memoizedState=e.memoizedState,n.updateQueue=e.updateQueue,t=e.dependencies,n.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},n.sibling=e.sibling,n.index=e.index,n.ref=e.ref,n.refCleanup=e.refCleanup,n}function q_(e,t){e.flags&=65011714;var n=e.alternate;return n===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=n.childLanes,e.lanes=n.lanes,e.child=n.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=n.memoizedProps,e.memoizedState=n.memoizedState,e.updateQueue=n.updateQueue,e.type=n.type,t=n.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function Fu(e,t,n,i,s,a){var r=0;if(i=e,typeof e=="function")E0(e)&&(r=1);else if(typeof e=="string")r=t2(e,n,rs.current)?26:e==="html"||e==="head"||e==="body"?27:5;else t:switch(e){case xm:return e=si(31,n,t,s),e.elementType=xm,e.lanes=a,e;case Jr:return ur(n.children,s,a,t);case h_:r=8,s|=24;break;case gm:return e=si(12,n,t,s|2),e.elementType=gm,e.lanes=a,e;case vm:return e=si(13,n,t,s),e.elementType=vm,e.lanes=a,e;case ym:return e=si(19,n,t,s),e.elementType=ym,e.lanes=a,e;default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case Us:r=10;break t;case f_:r=9;break t;case h0:r=11;break t;case f0:r=14;break t;case ca:r=16,i=null;break t}r=29,n=Error($(130,e===null?"null":typeof e,"")),i=null}return t=si(r,n,t,s),t.elementType=e,t.type=i,t.lanes=a,t}function ur(e,t,n,i){return e=si(7,e,i,t),e.lanes=n,e}function Zp(e,t,n){return e=si(6,e,null,t),e.lanes=n,e}function Y_(e){var t=si(18,null,null,0);return t.stateNode=e,t}function Jp(e,t,n){return t=si(4,e.children!==null?e.children:[],e.key,t),t.lanes=n,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var ix=new WeakMap;function Ei(e,t){if(typeof e=="object"&&e!==null){var n=ix.get(e);return n!==void 0?n:(t={value:e,source:t,stack:zy(t)},ix.set(e,t),t)}return{value:e,source:t,stack:zy(t)}}var so=[],ao=0,ih=null,ql=0,Si=[],Mi=0,Ra=null,is=1,ss="";function Ls(e,t){so[ao++]=ql,so[ao++]=ih,ih=e,ql=t}function Z_(e,t,n){Si[Mi++]=is,Si[Mi++]=ss,Si[Mi++]=Ra,Ra=e;var i=is;e=ss;var s=32-li(i)-1;i&=~(1<<s),n+=1;var a=32-li(t)+s;if(30<a){var r=s-s%5;a=(i&(1<<r)-1).toString(32),i>>=r,s-=r,is=1<<32-li(t)+s|n<<s|i,ss=a+e}else is=1<<a|n<<s|i,ss=e}function T0(e){e.return!==null&&(Ls(e,1),Z_(e,1,0))}function A0(e){for(;e===ih;)ih=so[--ao],so[ao]=null,ql=so[--ao],so[ao]=null;for(;e===Ra;)Ra=Si[--Mi],Si[Mi]=null,ss=Si[--Mi],Si[Mi]=null,is=Si[--Mi],Si[Mi]=null}function J_(e,t){Si[Mi++]=is,Si[Mi++]=ss,Si[Mi++]=Ra,is=t.id,ss=t.overflow,Ra=e}var En=null,Fe=null,oe=!1,ba=null,Ti=!1,Um=Error($(519));function Na(e){var t=Error($(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Yl(Ei(t,e)),Um}function sx(e){var t=e.stateNode,n=e.type,i=e.memoizedProps;switch(t[wn]=e,t[Zn]=i,n){case"dialog":te("cancel",t),te("close",t);break;case"iframe":case"object":case"embed":te("load",t);break;case"video":case"audio":for(n=0;n<Ql.length;n++)te(Ql[n],t);break;case"source":te("error",t);break;case"img":case"image":case"link":te("error",t),te("load",t);break;case"details":te("toggle",t);break;case"input":te("invalid",t),E_(t,i.value,i.defaultValue,i.checked,i.defaultChecked,i.type,i.name,!0);break;case"select":te("invalid",t);break;case"textarea":te("invalid",t),A_(t,i.value,i.defaultValue,i.children)}n=i.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||t.textContent===""+n||i.suppressHydrationWarning===!0||LS(t.textContent,n)?(i.popover!=null&&(te("beforetoggle",t),te("toggle",t)),i.onScroll!=null&&te("scroll",t),i.onScrollEnd!=null&&te("scrollend",t),i.onClick!=null&&(t.onclick=Is),t=!0):t=!1,t||Na(e,!0)}function ax(e){for(En=e.return;En;)switch(En.tag){case 5:case 31:case 13:Ti=!1;return;case 27:case 3:Ti=!0;return;default:En=En.return}}function Xr(e){if(e!==En)return!1;if(!oe)return ax(e),oe=!0,!1;var t=e.tag,n;if((n=t!==3&&t!==27)&&((n=t===5)&&(n=e.type,n=!(n!=="form"&&n!=="button")||s0(e.type,e.memoizedProps)),n=!n),n&&Fe&&Na(e),ax(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error($(317));Fe=Yx(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error($(317));Fe=Yx(e)}else t===27?(t=Fe,Ia(e.type)?(e=l0,l0=null,Fe=e):Fe=t):Fe=En?Ci(e.stateNode.nextSibling):null;return!0}function pr(){Fe=En=null,oe=!1}function Kp(){var e=ba;return e!==null&&(qn===null?qn=e:qn.push.apply(qn,e),ba=null),e}function Yl(e){ba===null?ba=[e]:ba.push(e)}var Im=os(null),Mr=null,Os=null;function ha(e,t,n){Oe(Im,t._currentValue),t._currentValue=n}function Bs(e){e._currentValue=Im.current,gn(Im)}function Om(e,t,n){for(;e!==null;){var i=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,i!==null&&(i.childLanes|=t)):i!==null&&(i.childLanes&t)!==t&&(i.childLanes|=t),e===n)break;e=e.return}}function Pm(e,t,n,i){var s=e.child;for(s!==null&&(s.return=e);s!==null;){var a=s.dependencies;if(a!==null){var r=s.child;a=a.firstContext;t:for(;a!==null;){var o=a;a=s;for(var l=0;l<t.length;l++)if(o.context===t[l]){a.lanes|=n,o=a.alternate,o!==null&&(o.lanes|=n),Om(a.return,n,e),i||(r=null);break t}a=o.next}}else if(s.tag===18){if(r=s.return,r===null)throw Error($(341));r.lanes|=n,a=r.alternate,a!==null&&(a.lanes|=n),Om(r,n,e),r=null}else r=s.child;if(r!==null)r.return=s;else for(r=s;r!==null;){if(r===e){r=null;break}if(s=r.sibling,s!==null){s.return=r.return,r=s;break}r=r.return}s=r}}function Co(e,t,n,i){e=null;for(var s=t,a=!1;s!==null;){if(!a){if((s.flags&524288)!==0)a=!0;else if((s.flags&262144)!==0)break}if(s.tag===10){var r=s.alternate;if(r===null)throw Error($(387));if(r=r.memoizedProps,r!==null){var o=s.type;ui(s.pendingProps.value,r.value)||(e!==null?e.push(o):e=[o])}}else if(s===Ku.current){if(r=s.alternate,r===null)throw Error($(387));r.memoizedState.memoizedState!==s.memoizedState.memoizedState&&(e!==null?e.push($l):e=[$l])}s=s.return}e!==null&&Pm(t,e,n,i),t.flags|=262144}function sh(e){for(e=e.firstContext;e!==null;){if(!ui(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function mr(e){Mr=e,Os=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Tn(e){return K_(Mr,e)}function Eu(e,t){return Mr===null&&mr(e),K_(e,t)}function K_(e,t){var n=t._currentValue;if(t={context:t,memoizedValue:n,next:null},Os===null){if(e===null)throw Error($(308));Os=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Os=Os.next=t;return n}var jT=typeof AbortController!="undefined"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(n,i){e.push(i)}};this.abort=function(){t.aborted=!0,e.forEach(function(n){return n()})}},$T=un.unstable_scheduleCallback,tA=un.unstable_NormalPriority,sn={$$typeof:Us,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function C0(){return{controller:new jT,data:new Map,refCount:0}}function lc(e){e.refCount--,e.refCount===0&&$T(tA,function(){e.controller.abort()})}var Dl=null,Bm=0,yo=0,uo=null;function eA(e,t){if(Dl===null){var n=Dl=[];Bm=0,yo=$0(),uo={status:"pending",value:void 0,then:function(i){n.push(i)}}}return Bm++,t.then(rx,rx),t}function rx(){if(--Bm===0&&Dl!==null){uo!==null&&(uo.status="fulfilled");var e=Dl;Dl=null,yo=0,uo=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function nA(e,t){var n=[],i={status:"pending",value:null,reason:null,then:function(s){n.push(s)}};return e.then(function(){i.status="fulfilled",i.value=t;for(var s=0;s<n.length;s++)(0,n[s])(t)},function(s){for(i.status="rejected",i.reason=s,s=0;s<n.length;s++)(0,n[s])(void 0)}),i}var ox=Ft.S;Ft.S=function(e,t){uS=ri(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&eA(e,t),ox!==null&&ox(e,t)};var hr=os(null);function R0(){var e=hr.current;return e!==null?e:Ce.pooledCache}function Hu(e,t){t===null?Oe(hr,hr.current):Oe(hr,t.pool)}function Q_(){var e=R0();return e===null?null:{parent:sn._currentValue,pool:e}}var Ro=Error($(460)),N0=Error($(474)),Lh=Error($(542)),ah={then:function(){}};function lx(e){return e=e.status,e==="fulfilled"||e==="rejected"}function j_(e,t,n){switch(n=e[n],n===void 0?e.push(t):n!==t&&(t.then(Is,Is),t=n),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,ux(e),e;default:if(typeof t.status=="string")t.then(Is,Is);else{if(e=Ce,e!==null&&100<e.shellSuspendCounter)throw Error($(482));e=t,e.status="pending",e.then(function(i){if(t.status==="pending"){var s=t;s.status="fulfilled",s.value=i}},function(i){if(t.status==="pending"){var s=t;s.status="rejected",s.reason=i}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,ux(e),e}throw fr=t,Ro}}function or(e){try{var t=e._init;return t(e._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(fr=n,Ro):n}}var fr=null;function cx(){if(fr===null)throw Error($(459));var e=fr;return fr=null,e}function ux(e){if(e===Ro||e===Lh)throw Error($(483))}var ho=null,Zl=0;function Tu(e){var t=Zl;return Zl+=1,ho===null&&(ho=[]),j_(ho,e,t)}function xl(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function Au(e,t){throw t.$$typeof===GE?Error($(525)):(e=Object.prototype.toString.call(t),Error($(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function $_(e){function t(f,v){if(e){var x=f.deletions;x===null?(f.deletions=[v],f.flags|=16):x.push(v)}}function n(f,v){if(!e)return null;for(;v!==null;)t(f,v),v=v.sibling;return null}function i(f){for(var v=new Map;f!==null;)f.key!==null?v.set(f.key,f):v.set(f.index,f),f=f.sibling;return v}function s(f,v){return f=Ps(f,v),f.index=0,f.sibling=null,f}function a(f,v,x){return f.index=x,e?(x=f.alternate,x!==null?(x=x.index,x<v?(f.flags|=67108866,v):x):(f.flags|=67108866,v)):(f.flags|=1048576,v)}function r(f){return e&&f.alternate===null&&(f.flags|=67108866),f}function o(f,v,x,y){return v===null||v.tag!==6?(v=Zp(x,f.mode,y),v.return=f,v):(v=s(v,x),v.return=f,v)}function l(f,v,x,y){var M=x.type;return M===Jr?h(f,v,x.props.children,y,x.key):v!==null&&(v.elementType===M||typeof M=="object"&&M!==null&&M.$$typeof===ca&&or(M)===v.type)?(v=s(v,x.props),xl(v,x),v.return=f,v):(v=Fu(x.type,x.key,x.props,null,f.mode,y),xl(v,x),v.return=f,v)}function c(f,v,x,y){return v===null||v.tag!==4||v.stateNode.containerInfo!==x.containerInfo||v.stateNode.implementation!==x.implementation?(v=Jp(x,f.mode,y),v.return=f,v):(v=s(v,x.children||[]),v.return=f,v)}function h(f,v,x,y,M){return v===null||v.tag!==7?(v=ur(x,f.mode,y,M),v.return=f,v):(v=s(v,x),v.return=f,v)}function d(f,v,x){if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return v=Zp(""+v,f.mode,x),v.return=f,v;if(typeof v=="object"&&v!==null){switch(v.$$typeof){case vu:return x=Fu(v.type,v.key,v.props,null,f.mode,x),xl(x,v),x.return=f,x;case wl:return v=Jp(v,f.mode,x),v.return=f,v;case ca:return v=or(v),d(f,v,x)}if(El(v)||vl(v))return v=ur(v,f.mode,x,null),v.return=f,v;if(typeof v.then=="function")return d(f,Tu(v),x);if(v.$$typeof===Us)return d(f,Eu(f,v),x);Au(f,v)}return null}function u(f,v,x,y){var M=v!==null?v.key:null;if(typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint")return M!==null?null:o(f,v,""+x,y);if(typeof x=="object"&&x!==null){switch(x.$$typeof){case vu:return x.key===M?l(f,v,x,y):null;case wl:return x.key===M?c(f,v,x,y):null;case ca:return x=or(x),u(f,v,x,y)}if(El(x)||vl(x))return M!==null?null:h(f,v,x,y,null);if(typeof x.then=="function")return u(f,v,Tu(x),y);if(x.$$typeof===Us)return u(f,v,Eu(f,x),y);Au(f,x)}return null}function p(f,v,x,y,M){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return f=f.get(x)||null,o(v,f,""+y,M);if(typeof y=="object"&&y!==null){switch(y.$$typeof){case vu:return f=f.get(y.key===null?x:y.key)||null,l(v,f,y,M);case wl:return f=f.get(y.key===null?x:y.key)||null,c(v,f,y,M);case ca:return y=or(y),p(f,v,x,y,M)}if(El(y)||vl(y))return f=f.get(x)||null,h(v,f,y,M,null);if(typeof y.then=="function")return p(f,v,x,Tu(y),M);if(y.$$typeof===Us)return p(f,v,x,Eu(v,y),M);Au(v,y)}return null}function m(f,v,x,y){for(var M=null,w=null,E=v,b=v=0,A=null;E!==null&&b<x.length;b++){E.index>b?(A=E,E=null):A=E.sibling;var R=u(f,E,x[b],y);if(R===null){E===null&&(E=A);break}e&&E&&R.alternate===null&&t(f,E),v=a(R,v,b),w===null?M=R:w.sibling=R,w=R,E=A}if(b===x.length)return n(f,E),oe&&Ls(f,b),M;if(E===null){for(;b<x.length;b++)E=d(f,x[b],y),E!==null&&(v=a(E,v,b),w===null?M=E:w.sibling=E,w=E);return oe&&Ls(f,b),M}for(E=i(E);b<x.length;b++)A=p(E,f,b,x[b],y),A!==null&&(e&&A.alternate!==null&&E.delete(A.key===null?b:A.key),v=a(A,v,b),w===null?M=A:w.sibling=A,w=A);return e&&E.forEach(function(N){return t(f,N)}),oe&&Ls(f,b),M}function S(f,v,x,y){if(x==null)throw Error($(151));for(var M=null,w=null,E=v,b=v=0,A=null,R=x.next();E!==null&&!R.done;b++,R=x.next()){E.index>b?(A=E,E=null):A=E.sibling;var N=u(f,E,R.value,y);if(N===null){E===null&&(E=A);break}e&&E&&N.alternate===null&&t(f,E),v=a(N,v,b),w===null?M=N:w.sibling=N,w=N,E=A}if(R.done)return n(f,E),oe&&Ls(f,b),M;if(E===null){for(;!R.done;b++,R=x.next())R=d(f,R.value,y),R!==null&&(v=a(R,v,b),w===null?M=R:w.sibling=R,w=R);return oe&&Ls(f,b),M}for(E=i(E);!R.done;b++,R=x.next())R=p(E,f,b,R.value,y),R!==null&&(e&&R.alternate!==null&&E.delete(R.key===null?b:R.key),v=a(R,v,b),w===null?M=R:w.sibling=R,w=R);return e&&E.forEach(function(I){return t(f,I)}),oe&&Ls(f,b),M}function g(f,v,x,y){if(typeof x=="object"&&x!==null&&x.type===Jr&&x.key===null&&(x=x.props.children),typeof x=="object"&&x!==null){switch(x.$$typeof){case vu:t:{for(var M=x.key;v!==null;){if(v.key===M){if(M=x.type,M===Jr){if(v.tag===7){n(f,v.sibling),y=s(v,x.props.children),y.return=f,f=y;break t}}else if(v.elementType===M||typeof M=="object"&&M!==null&&M.$$typeof===ca&&or(M)===v.type){n(f,v.sibling),y=s(v,x.props),xl(y,x),y.return=f,f=y;break t}n(f,v);break}else t(f,v);v=v.sibling}x.type===Jr?(y=ur(x.props.children,f.mode,y,x.key),y.return=f,f=y):(y=Fu(x.type,x.key,x.props,null,f.mode,y),xl(y,x),y.return=f,f=y)}return r(f);case wl:t:{for(M=x.key;v!==null;){if(v.key===M)if(v.tag===4&&v.stateNode.containerInfo===x.containerInfo&&v.stateNode.implementation===x.implementation){n(f,v.sibling),y=s(v,x.children||[]),y.return=f,f=y;break t}else{n(f,v);break}else t(f,v);v=v.sibling}y=Jp(x,f.mode,y),y.return=f,f=y}return r(f);case ca:return x=or(x),g(f,v,x,y)}if(El(x))return m(f,v,x,y);if(vl(x)){if(M=vl(x),typeof M!="function")throw Error($(150));return x=M.call(x),S(f,v,x,y)}if(typeof x.then=="function")return g(f,v,Tu(x),y);if(x.$$typeof===Us)return g(f,v,Eu(f,x),y);Au(f,x)}return typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint"?(x=""+x,v!==null&&v.tag===6?(n(f,v.sibling),y=s(v,x),y.return=f,f=y):(n(f,v),y=Zp(x,f.mode,y),y.return=f,f=y),r(f)):n(f,v)}return function(f,v,x,y){try{Zl=0;var M=g(f,v,x,y);return ho=null,M}catch(E){if(E===Ro||E===Lh)throw E;var w=si(29,E,null,f.mode);return w.lanes=y,w.return=f,w}}}var gr=$_(!0),tb=$_(!1),ua=!1;function L0(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function zm(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Sa(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Ma(e,t,n){var i=e.updateQueue;if(i===null)return null;if(i=i.shared,(pe&2)!==0){var s=i.pending;return s===null?t.next=t:(t.next=s.next,s.next=t),i.pending=t,t=nh(e),X_(e,null,n),t}return Nh(e,i,t,n),nh(e)}function Ul(e,t,n){if(t=t.updateQueue,t!==null&&(t=t.shared,(n&4194048)!==0)){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,y_(e,n)}}function Qp(e,t){var n=e.updateQueue,i=e.alternate;if(i!==null&&(i=i.updateQueue,n===i)){var s=null,a=null;if(n=n.firstBaseUpdate,n!==null){do{var r={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};a===null?s=a=r:a=a.next=r,n=n.next}while(n!==null);a===null?s=a=t:a=a.next=t}else s=a=t;n={baseState:i.baseState,firstBaseUpdate:s,lastBaseUpdate:a,shared:i.shared,callbacks:i.callbacks},e.updateQueue=n;return}e=n.lastBaseUpdate,e===null?n.firstBaseUpdate=t:e.next=t,n.lastBaseUpdate=t}var Fm=!1;function Il(){if(Fm){var e=uo;if(e!==null)throw e}}function Ol(e,t,n,i){Fm=!1;var s=e.updateQueue;ua=!1;var a=s.firstBaseUpdate,r=s.lastBaseUpdate,o=s.shared.pending;if(o!==null){s.shared.pending=null;var l=o,c=l.next;l.next=null,r===null?a=c:r.next=c,r=l;var h=e.alternate;h!==null&&(h=h.updateQueue,o=h.lastBaseUpdate,o!==r&&(o===null?h.firstBaseUpdate=c:o.next=c,h.lastBaseUpdate=l))}if(a!==null){var d=s.baseState;r=0,h=c=l=null,o=a;do{var u=o.lane&-536870913,p=u!==o.lane;if(p?(ie&u)===u:(i&u)===u){u!==0&&u===yo&&(Fm=!0),h!==null&&(h=h.next={lane:0,tag:o.tag,payload:o.payload,callback:null,next:null});t:{var m=e,S=o;u=t;var g=n;switch(S.tag){case 1:if(m=S.payload,typeof m=="function"){d=m.call(g,d,u);break t}d=m;break t;case 3:m.flags=m.flags&-65537|128;case 0:if(m=S.payload,u=typeof m=="function"?m.call(g,d,u):m,u==null)break t;d=He({},d,u);break t;case 2:ua=!0}}u=o.callback,u!==null&&(e.flags|=64,p&&(e.flags|=8192),p=s.callbacks,p===null?s.callbacks=[u]:p.push(u))}else p={lane:u,tag:o.tag,payload:o.payload,callback:o.callback,next:null},h===null?(c=h=p,l=d):h=h.next=p,r|=u;if(o=o.next,o===null){if(o=s.shared.pending,o===null)break;p=o,o=p.next,p.next=null,s.lastBaseUpdate=p,s.shared.pending=null}}while(!0);h===null&&(l=d),s.baseState=l,s.firstBaseUpdate=c,s.lastBaseUpdate=h,a===null&&(s.shared.lanes=0),Da|=r,e.lanes=r,e.memoizedState=d}}function eb(e,t){if(typeof e!="function")throw Error($(191,e));e.call(t)}function nb(e,t){var n=e.callbacks;if(n!==null)for(e.callbacks=null,e=0;e<n.length;e++)eb(n[e],t)}var xo=os(null),rh=os(0);function hx(e,t){e=ks,Oe(rh,e),Oe(xo,t),ks=e|t.baseLanes}function Hm(){Oe(rh,ks),Oe(xo,xo.current)}function D0(){ks=rh.current,gn(xo),gn(rh)}var hi=os(null),Ai=null;function fa(e){var t=e.alternate;Oe(Qe,Qe.current&1),Oe(hi,e),Ai===null&&(t===null||xo.current!==null||t.memoizedState!==null)&&(Ai=e)}function Vm(e){Oe(Qe,Qe.current),Oe(hi,e),Ai===null&&(Ai=e)}function ib(e){e.tag===22?(Oe(Qe,Qe.current),Oe(hi,e),Ai===null&&(Ai=e)):da(e)}function da(){Oe(Qe,Qe.current),Oe(hi,hi.current)}function ii(e){gn(hi),Ai===e&&(Ai=null),gn(Qe)}var Qe=os(0);function oh(e){for(var t=e;t!==null;){if(t.tag===13){var n=t.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||r0(n)||o0(n)))return t}else if(t.tag===19&&(t.memoizedProps.revealOrder==="forwards"||t.memoizedProps.revealOrder==="backwards"||t.memoizedProps.revealOrder==="unstable_legacy-backwards"||t.memoizedProps.revealOrder==="together")){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Hs=0,qt=null,Se=null,en=null,lh=!1,fo=!1,vr=!1,ch=0,Jl=0,po=null,iA=0;function Ye(){throw Error($(321))}function U0(e,t){if(t===null)return!1;for(var n=0;n<t.length&&n<e.length;n++)if(!ui(e[n],t[n]))return!1;return!0}function I0(e,t,n,i,s,a){return Hs=a,qt=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,Ft.H=e===null||e.memoizedState===null?Ib:X0,vr=!1,a=n(i,s),vr=!1,fo&&(a=ab(t,n,i,s)),sb(e),a}function sb(e){Ft.H=Kl;var t=Se!==null&&Se.next!==null;if(Hs=0,en=Se=qt=null,lh=!1,Jl=0,po=null,t)throw Error($(300));e===null||an||(e=e.dependencies,e!==null&&sh(e)&&(an=!0))}function ab(e,t,n,i){qt=e;var s=0;do{if(fo&&(po=null),Jl=0,fo=!1,25<=s)throw Error($(301));if(s+=1,en=Se=null,e.updateQueue!=null){var a=e.updateQueue;a.lastEffect=null,a.events=null,a.stores=null,a.memoCache!=null&&(a.memoCache.index=0)}Ft.H=Ob,a=t(n,i)}while(fo);return a}function sA(){var e=Ft.H,t=e.useState()[0];return t=typeof t.then=="function"?cc(t):t,e=e.useState()[0],(Se!==null?Se.memoizedState:null)!==e&&(qt.flags|=1024),t}function O0(){var e=ch!==0;return ch=0,e}function P0(e,t,n){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~n}function B0(e){if(lh){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}lh=!1}Hs=0,en=Se=qt=null,fo=!1,Jl=ch=0,po=null}function Bn(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return en===null?qt.memoizedState=en=e:en=en.next=e,en}function je(){if(Se===null){var e=qt.alternate;e=e!==null?e.memoizedState:null}else e=Se.next;var t=en===null?qt.memoizedState:en.next;if(t!==null)en=t,Se=e;else{if(e===null)throw qt.alternate===null?Error($(467)):Error($(310));Se=e,e={memoizedState:Se.memoizedState,baseState:Se.baseState,baseQueue:Se.baseQueue,queue:Se.queue,next:null},en===null?qt.memoizedState=en=e:en=en.next=e}return en}function Dh(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function cc(e){var t=Jl;return Jl+=1,po===null&&(po=[]),e=j_(po,e,t),t=qt,(en===null?t.memoizedState:en.next)===null&&(t=t.alternate,Ft.H=t===null||t.memoizedState===null?Ib:X0),e}function Uh(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return cc(e);if(e.$$typeof===Us)return Tn(e)}throw Error($(438,String(e)))}function z0(e){var t=null,n=qt.updateQueue;if(n!==null&&(t=n.memoCache),t==null){var i=qt.alternate;i!==null&&(i=i.updateQueue,i!==null&&(i=i.memoCache,i!=null&&(t={data:i.data.map(function(s){return s.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),n===null&&(n=Dh(),qt.updateQueue=n),n.memoCache=t,n=t.data[t.index],n===void 0)for(n=t.data[t.index]=Array(e),i=0;i<e;i++)n[i]=kE;return t.index++,n}function Vs(e,t){return typeof t=="function"?t(e):t}function Vu(e){var t=je();return F0(t,Se,e)}function F0(e,t,n){var i=e.queue;if(i===null)throw Error($(311));i.lastRenderedReducer=n;var s=e.baseQueue,a=i.pending;if(a!==null){if(s!==null){var r=s.next;s.next=a.next,a.next=r}t.baseQueue=s=a,i.pending=null}if(a=e.baseState,s===null)e.memoizedState=a;else{t=s.next;var o=r=null,l=null,c=t,h=!1;do{var d=c.lane&-536870913;if(d!==c.lane?(ie&d)===d:(Hs&d)===d){var u=c.revertLane;if(u===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),d===yo&&(h=!0);else if((Hs&u)===u){c=c.next,u===yo&&(h=!0);continue}else d={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=d,r=a):l=l.next=d,qt.lanes|=u,Da|=u;d=c.action,vr&&n(a,d),a=c.hasEagerState?c.eagerState:n(a,d)}else u={lane:d,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(o=l=u,r=a):l=l.next=u,qt.lanes|=d,Da|=d;c=c.next}while(c!==null&&c!==t);if(l===null?r=a:l.next=o,!ui(a,e.memoizedState)&&(an=!0,h&&(n=uo,n!==null)))throw n;e.memoizedState=a,e.baseState=r,e.baseQueue=l,i.lastRenderedState=a}return s===null&&(i.lanes=0),[e.memoizedState,i.dispatch]}function jp(e){var t=je(),n=t.queue;if(n===null)throw Error($(311));n.lastRenderedReducer=e;var i=n.dispatch,s=n.pending,a=t.memoizedState;if(s!==null){n.pending=null;var r=s=s.next;do a=e(a,r.action),r=r.next;while(r!==s);ui(a,t.memoizedState)||(an=!0),t.memoizedState=a,t.baseQueue===null&&(t.baseState=a),n.lastRenderedState=a}return[a,i]}function rb(e,t,n){var i=qt,s=je(),a=oe;if(a){if(n===void 0)throw Error($(407));n=n()}else n=t();var r=!ui((Se||s).memoizedState,n);if(r&&(s.memoizedState=n,an=!0),s=s.queue,H0(cb.bind(null,i,s,e),[e]),s.getSnapshot!==t||r||en!==null&&en.memoizedState.tag&1){if(i.flags|=2048,_o(9,{destroy:void 0},lb.bind(null,i,s,n,t),null),Ce===null)throw Error($(349));a||(Hs&127)!==0||ob(i,t,n)}return n}function ob(e,t,n){e.flags|=16384,e={getSnapshot:t,value:n},t=qt.updateQueue,t===null?(t=Dh(),qt.updateQueue=t,t.stores=[e]):(n=t.stores,n===null?t.stores=[e]:n.push(e))}function lb(e,t,n,i){t.value=n,t.getSnapshot=i,ub(t)&&hb(e)}function cb(e,t,n){return n(function(){ub(t)&&hb(e)})}function ub(e){var t=e.getSnapshot;e=e.value;try{var n=t();return!ui(e,n)}catch{return!0}}function hb(e){var t=Sr(e,2);t!==null&&Yn(t,e,2)}function Gm(e){var t=Bn();if(typeof e=="function"){var n=e;if(e=n(),vr){ma(!0);try{n()}finally{ma(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Vs,lastRenderedState:e},t}function fb(e,t,n,i){return e.baseState=n,F0(e,Se,typeof i=="function"?i:Vs)}function aA(e,t,n,i,s){if(Oh(e))throw Error($(485));if(e=t.action,e!==null){var a={payload:s,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(r){a.listeners.push(r)}};Ft.T!==null?n(!0):a.isTransition=!1,i(a),n=t.pending,n===null?(a.next=t.pending=a,db(t,a)):(a.next=n.next,t.pending=n.next=a)}}function db(e,t){var n=t.action,i=t.payload,s=e.state;if(t.isTransition){var a=Ft.T,r={};Ft.T=r;try{var o=n(s,i),l=Ft.S;l!==null&&l(r,o),fx(e,t,o)}catch(c){km(e,t,c)}finally{a!==null&&r.types!==null&&(a.types=r.types),Ft.T=a}}else try{a=n(s,i),fx(e,t,a)}catch(c){km(e,t,c)}}function fx(e,t,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(i){dx(e,t,i)},function(i){return km(e,t,i)}):dx(e,t,n)}function dx(e,t,n){t.status="fulfilled",t.value=n,pb(t),e.state=n,t=e.pending,t!==null&&(n=t.next,n===t?e.pending=null:(n=n.next,t.next=n,db(e,n)))}function km(e,t,n){var i=e.pending;if(e.pending=null,i!==null){i=i.next;do t.status="rejected",t.reason=n,pb(t),t=t.next;while(t!==i)}e.action=null}function pb(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function mb(e,t){return t}function px(e,t){if(oe){var n=Ce.formState;if(n!==null){t:{var i=qt;if(oe){if(Fe){e:{for(var s=Fe,a=Ti;s.nodeType!==8;){if(!a){s=null;break e}if(s=Ci(s.nextSibling),s===null){s=null;break e}}a=s.data,s=a==="F!"||a==="F"?s:null}if(s){Fe=Ci(s.nextSibling),i=s.data==="F!";break t}}Na(i)}i=!1}i&&(t=n[0])}}return n=Bn(),n.memoizedState=n.baseState=t,i={pending:null,lanes:0,dispatch:null,lastRenderedReducer:mb,lastRenderedState:t},n.queue=i,n=Lb.bind(null,qt,i),i.dispatch=n,i=Gm(!1),a=W0.bind(null,qt,!1,i.queue),i=Bn(),s={state:t,dispatch:null,action:e,pending:null},i.queue=s,n=aA.bind(null,qt,s,a,n),s.dispatch=n,i.memoizedState=e,[t,n,!1]}function mx(e){var t=je();return gb(t,Se,e)}function gb(e,t,n){if(t=F0(e,t,mb)[0],e=Vu(Vs)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var i=cc(t)}catch(r){throw r===Ro?Lh:r}else i=t;t=je();var s=t.queue,a=s.dispatch;return n!==t.memoizedState&&(qt.flags|=2048,_o(9,{destroy:void 0},rA.bind(null,s,n),null)),[i,a,e]}function rA(e,t){e.action=t}function gx(e){var t=je(),n=Se;if(n!==null)return gb(t,n,e);je(),t=t.memoizedState,n=je();var i=n.queue.dispatch;return n.memoizedState=e,[t,i,!1]}function _o(e,t,n,i){return e={tag:e,create:n,deps:i,inst:t,next:null},t=qt.updateQueue,t===null&&(t=Dh(),qt.updateQueue=t),n=t.lastEffect,n===null?t.lastEffect=e.next=e:(i=n.next,n.next=e,e.next=i,t.lastEffect=e),e}function vb(){return je().memoizedState}function Gu(e,t,n,i){var s=Bn();qt.flags|=e,s.memoizedState=_o(1|t,{destroy:void 0},n,i===void 0?null:i)}function Ih(e,t,n,i){var s=je();i=i===void 0?null:i;var a=s.memoizedState.inst;Se!==null&&i!==null&&U0(i,Se.memoizedState.deps)?s.memoizedState=_o(t,a,n,i):(qt.flags|=e,s.memoizedState=_o(1|t,a,n,i))}function vx(e,t){Gu(8390656,8,e,t)}function H0(e,t){Ih(2048,8,e,t)}function oA(e){qt.flags|=4;var t=qt.updateQueue;if(t===null)t=Dh(),qt.updateQueue=t,t.events=[e];else{var n=t.events;n===null?t.events=[e]:n.push(e)}}function yb(e){var t=je().memoizedState;return oA({ref:t,nextImpl:e}),function(){if((pe&2)!==0)throw Error($(440));return t.impl.apply(void 0,arguments)}}function xb(e,t){return Ih(4,2,e,t)}function _b(e,t){return Ih(4,4,e,t)}function bb(e,t){if(typeof t=="function"){e=e();var n=t(e);return function(){typeof n=="function"?n():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Sb(e,t,n){n=n!=null?n.concat([e]):null,Ih(4,4,bb.bind(null,t,e),n)}function V0(){}function Mb(e,t){var n=je();t=t===void 0?null:t;var i=n.memoizedState;return t!==null&&U0(t,i[1])?i[0]:(n.memoizedState=[e,t],e)}function wb(e,t){var n=je();t=t===void 0?null:t;var i=n.memoizedState;if(t!==null&&U0(t,i[1]))return i[0];if(i=e(),vr){ma(!0);try{e()}finally{ma(!1)}}return n.memoizedState=[i,t],i}function G0(e,t,n){return n===void 0||(Hs&1073741824)!==0&&(ie&261930)===0?e.memoizedState=t:(e.memoizedState=n,e=fS(),qt.lanes|=e,Da|=e,n)}function Eb(e,t,n,i){return ui(n,t)?n:xo.current!==null?(e=G0(e,n,i),ui(e,t)||(an=!0),e):(Hs&42)===0||(Hs&1073741824)!==0&&(ie&261930)===0?(an=!0,e.memoizedState=n):(e=fS(),qt.lanes|=e,Da|=e,t)}function Tb(e,t,n,i,s){var a=me.p;me.p=a!==0&&8>a?a:8;var r=Ft.T,o={};Ft.T=o,W0(e,!1,t,n);try{var l=s(),c=Ft.S;if(c!==null&&c(o,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var h=nA(l,i);Pl(e,t,h,ci(e))}else Pl(e,t,i,ci(e))}catch(d){Pl(e,t,{then:function(){},status:"rejected",reason:d},ci())}finally{me.p=a,r!==null&&o.types!==null&&(r.types=o.types),Ft.T=r}}function lA(){}function Wm(e,t,n,i){if(e.tag!==5)throw Error($(476));var s=Ab(e).queue;Tb(e,s,t,cr,n===null?lA:function(){return Cb(e),n(i)})}function Ab(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:cr,baseState:cr,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Vs,lastRenderedState:cr},next:null};var n={};return t.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Vs,lastRenderedState:n},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Cb(e){var t=Ab(e);t.next===null&&(t=e.alternate.memoizedState),Pl(e,t.next.queue,{},ci())}function k0(){return Tn($l)}function Rb(){return je().memoizedState}function Nb(){return je().memoizedState}function cA(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var n=ci();e=Sa(n);var i=Ma(t,e,n);i!==null&&(Yn(i,t,n),Ul(i,t,n)),t={cache:C0()},e.payload=t;return}t=t.return}}function uA(e,t,n){var i=ci();n={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Oh(e)?Db(t,n):(n=w0(e,t,n,i),n!==null&&(Yn(n,e,i),Ub(n,t,i)))}function Lb(e,t,n){var i=ci();Pl(e,t,n,i)}function Pl(e,t,n,i){var s={lane:i,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(Oh(e))Db(t,s);else{var a=e.alternate;if(e.lanes===0&&(a===null||a.lanes===0)&&(a=t.lastRenderedReducer,a!==null))try{var r=t.lastRenderedState,o=a(r,n);if(s.hasEagerState=!0,s.eagerState=o,ui(o,r))return Nh(e,t,s,0),Ce===null&&Rh(),!1}catch{}if(n=w0(e,t,s,i),n!==null)return Yn(n,e,i),Ub(n,t,i),!0}return!1}function W0(e,t,n,i){if(i={lane:2,revertLane:$0(),gesture:null,action:i,hasEagerState:!1,eagerState:null,next:null},Oh(e)){if(t)throw Error($(479))}else t=w0(e,n,i,2),t!==null&&Yn(t,e,2)}function Oh(e){var t=e.alternate;return e===qt||t!==null&&t===qt}function Db(e,t){fo=lh=!0;var n=e.pending;n===null?t.next=t:(t.next=n.next,n.next=t),e.pending=t}function Ub(e,t,n){if((n&4194048)!==0){var i=t.lanes;i&=e.pendingLanes,n|=i,t.lanes=n,y_(e,n)}}var Kl={readContext:Tn,use:Uh,useCallback:Ye,useContext:Ye,useEffect:Ye,useImperativeHandle:Ye,useLayoutEffect:Ye,useInsertionEffect:Ye,useMemo:Ye,useReducer:Ye,useRef:Ye,useState:Ye,useDebugValue:Ye,useDeferredValue:Ye,useTransition:Ye,useSyncExternalStore:Ye,useId:Ye,useHostTransitionStatus:Ye,useFormState:Ye,useActionState:Ye,useOptimistic:Ye,useMemoCache:Ye,useCacheRefresh:Ye};Kl.useEffectEvent=Ye;var Ib={readContext:Tn,use:Uh,useCallback:function(e,t){return Bn().memoizedState=[e,t===void 0?null:t],e},useContext:Tn,useEffect:vx,useImperativeHandle:function(e,t,n){n=n!=null?n.concat([e]):null,Gu(4194308,4,bb.bind(null,t,e),n)},useLayoutEffect:function(e,t){return Gu(4194308,4,e,t)},useInsertionEffect:function(e,t){Gu(4,2,e,t)},useMemo:function(e,t){var n=Bn();t=t===void 0?null:t;var i=e();if(vr){ma(!0);try{e()}finally{ma(!1)}}return n.memoizedState=[i,t],i},useReducer:function(e,t,n){var i=Bn();if(n!==void 0){var s=n(t);if(vr){ma(!0);try{n(t)}finally{ma(!1)}}}else s=t;return i.memoizedState=i.baseState=s,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:s},i.queue=e,e=e.dispatch=uA.bind(null,qt,e),[i.memoizedState,e]},useRef:function(e){var t=Bn();return e={current:e},t.memoizedState=e},useState:function(e){e=Gm(e);var t=e.queue,n=Lb.bind(null,qt,t);return t.dispatch=n,[e.memoizedState,n]},useDebugValue:V0,useDeferredValue:function(e,t){var n=Bn();return G0(n,e,t)},useTransition:function(){var e=Gm(!1);return e=Tb.bind(null,qt,e.queue,!0,!1),Bn().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,n){var i=qt,s=Bn();if(oe){if(n===void 0)throw Error($(407));n=n()}else{if(n=t(),Ce===null)throw Error($(349));(ie&127)!==0||ob(i,t,n)}s.memoizedState=n;var a={value:n,getSnapshot:t};return s.queue=a,vx(cb.bind(null,i,a,e),[e]),i.flags|=2048,_o(9,{destroy:void 0},lb.bind(null,i,a,n,t),null),n},useId:function(){var e=Bn(),t=Ce.identifierPrefix;if(oe){var n=ss,i=is;n=(i&~(1<<32-li(i)-1)).toString(32)+n,t="_"+t+"R_"+n,n=ch++,0<n&&(t+="H"+n.toString(32)),t+="_"}else n=iA++,t="_"+t+"r_"+n.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:k0,useFormState:px,useActionState:px,useOptimistic:function(e){var t=Bn();t.memoizedState=t.baseState=e;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=n,t=W0.bind(null,qt,!0,n),n.dispatch=t,[e,t]},useMemoCache:z0,useCacheRefresh:function(){return Bn().memoizedState=cA.bind(null,qt)},useEffectEvent:function(e){var t=Bn(),n={impl:e};return t.memoizedState=n,function(){if((pe&2)!==0)throw Error($(440));return n.impl.apply(void 0,arguments)}}},X0={readContext:Tn,use:Uh,useCallback:Mb,useContext:Tn,useEffect:H0,useImperativeHandle:Sb,useInsertionEffect:xb,useLayoutEffect:_b,useMemo:wb,useReducer:Vu,useRef:vb,useState:function(){return Vu(Vs)},useDebugValue:V0,useDeferredValue:function(e,t){var n=je();return Eb(n,Se.memoizedState,e,t)},useTransition:function(){var e=Vu(Vs)[0],t=je().memoizedState;return[typeof e=="boolean"?e:cc(e),t]},useSyncExternalStore:rb,useId:Rb,useHostTransitionStatus:k0,useFormState:mx,useActionState:mx,useOptimistic:function(e,t){var n=je();return fb(n,Se,e,t)},useMemoCache:z0,useCacheRefresh:Nb};X0.useEffectEvent=yb;var Ob={readContext:Tn,use:Uh,useCallback:Mb,useContext:Tn,useEffect:H0,useImperativeHandle:Sb,useInsertionEffect:xb,useLayoutEffect:_b,useMemo:wb,useReducer:jp,useRef:vb,useState:function(){return jp(Vs)},useDebugValue:V0,useDeferredValue:function(e,t){var n=je();return Se===null?G0(n,e,t):Eb(n,Se.memoizedState,e,t)},useTransition:function(){var e=jp(Vs)[0],t=je().memoizedState;return[typeof e=="boolean"?e:cc(e),t]},useSyncExternalStore:rb,useId:Rb,useHostTransitionStatus:k0,useFormState:gx,useActionState:gx,useOptimistic:function(e,t){var n=je();return Se!==null?fb(n,Se,e,t):(n.baseState=e,[e,n.queue.dispatch])},useMemoCache:z0,useCacheRefresh:Nb};Ob.useEffectEvent=yb;function $p(e,t,n,i){t=e.memoizedState,n=n(i,t),n=n==null?t:He({},t,n),e.memoizedState=n,e.lanes===0&&(e.updateQueue.baseState=n)}var Xm={enqueueSetState:function(e,t,n){e=e._reactInternals;var i=ci(),s=Sa(i);s.payload=t,n!=null&&(s.callback=n),t=Ma(e,s,i),t!==null&&(Yn(t,e,i),Ul(t,e,i))},enqueueReplaceState:function(e,t,n){e=e._reactInternals;var i=ci(),s=Sa(i);s.tag=1,s.payload=t,n!=null&&(s.callback=n),t=Ma(e,s,i),t!==null&&(Yn(t,e,i),Ul(t,e,i))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var n=ci(),i=Sa(n);i.tag=2,t!=null&&(i.callback=t),t=Ma(e,i,n),t!==null&&(Yn(t,e,n),Ul(t,e,n))}};function yx(e,t,n,i,s,a,r){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(i,a,r):t.prototype&&t.prototype.isPureReactComponent?!Xl(n,i)||!Xl(s,a):!0}function xx(e,t,n,i){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(n,i),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(n,i),t.state!==e&&Xm.enqueueReplaceState(t,t.state,null)}function yr(e,t){var n=t;if("ref"in t){n={};for(var i in t)i!=="ref"&&(n[i]=t[i])}if(e=e.defaultProps){n===t&&(n=He({},n));for(var s in e)n[s]===void 0&&(n[s]=e[s])}return n}function Pb(e){eh(e)}function Bb(e){console.error(e)}function zb(e){eh(e)}function uh(e,t){try{var n=e.onUncaughtError;n(t.value,{componentStack:t.stack})}catch(i){setTimeout(function(){throw i})}}function _x(e,t,n){try{var i=e.onCaughtError;i(n.value,{componentStack:n.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(s){setTimeout(function(){throw s})}}function qm(e,t,n){return n=Sa(n),n.tag=3,n.payload={element:null},n.callback=function(){uh(e,t)},n}function Fb(e){return e=Sa(e),e.tag=3,e}function Hb(e,t,n,i){var s=n.type.getDerivedStateFromError;if(typeof s=="function"){var a=i.value;e.payload=function(){return s(a)},e.callback=function(){_x(t,n,i)}}var r=n.stateNode;r!==null&&typeof r.componentDidCatch=="function"&&(e.callback=function(){_x(t,n,i),typeof s!="function"&&(wa===null?wa=new Set([this]):wa.add(this));var o=i.stack;this.componentDidCatch(i.value,{componentStack:o!==null?o:""})})}function hA(e,t,n,i,s){if(n.flags|=32768,i!==null&&typeof i=="object"&&typeof i.then=="function"){if(t=n.alternate,t!==null&&Co(t,n,s,!0),n=hi.current,n!==null){switch(n.tag){case 31:case 13:return Ai===null?mh():n.alternate===null&&Ze===0&&(Ze=3),n.flags&=-257,n.flags|=65536,n.lanes=s,i===ah?n.flags|=16384:(t=n.updateQueue,t===null?n.updateQueue=new Set([i]):t.add(i),um(e,i,s)),!1;case 22:return n.flags|=65536,i===ah?n.flags|=16384:(t=n.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([i])},n.updateQueue=t):(n=t.retryQueue,n===null?t.retryQueue=new Set([i]):n.add(i)),um(e,i,s)),!1}throw Error($(435,n.tag))}return um(e,i,s),mh(),!1}if(oe)return t=hi.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=s,i!==Um&&(e=Error($(422),{cause:i}),Yl(Ei(e,n)))):(i!==Um&&(t=Error($(423),{cause:i}),Yl(Ei(t,n))),e=e.current.alternate,e.flags|=65536,s&=-s,e.lanes|=s,i=Ei(i,n),s=qm(e.stateNode,i,s),Qp(e,s),Ze!==4&&(Ze=2)),!1;var a=Error($(520),{cause:i});if(a=Ei(a,n),Fl===null?Fl=[a]:Fl.push(a),Ze!==4&&(Ze=2),t===null)return!0;i=Ei(i,n),n=t;do{switch(n.tag){case 3:return n.flags|=65536,e=s&-s,n.lanes|=e,e=qm(n.stateNode,i,e),Qp(n,e),!1;case 1:if(t=n.type,a=n.stateNode,(n.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||a!==null&&typeof a.componentDidCatch=="function"&&(wa===null||!wa.has(a))))return n.flags|=65536,s&=-s,n.lanes|=s,s=Fb(s),Hb(s,e,n,i),Qp(n,s),!1}n=n.return}while(n!==null);return!1}var q0=Error($(461)),an=!1;function Mn(e,t,n,i){t.child=e===null?tb(t,null,n,i):gr(t,e.child,n,i)}function bx(e,t,n,i,s){n=n.render;var a=t.ref;if("ref"in i){var r={};for(var o in i)o!=="ref"&&(r[o]=i[o])}else r=i;return mr(t),i=I0(e,t,n,r,a,s),o=O0(),e!==null&&!an?(P0(e,t,s),Gs(e,t,s)):(oe&&o&&T0(t),t.flags|=1,Mn(e,t,i,s),t.child)}function Sx(e,t,n,i,s){if(e===null){var a=n.type;return typeof a=="function"&&!E0(a)&&a.defaultProps===void 0&&n.compare===null?(t.tag=15,t.type=a,Vb(e,t,a,i,s)):(e=Fu(n.type,null,i,t,t.mode,s),e.ref=t.ref,e.return=t,t.child=e)}if(a=e.child,!Y0(e,s)){var r=a.memoizedProps;if(n=n.compare,n=n!==null?n:Xl,n(r,i)&&e.ref===t.ref)return Gs(e,t,s)}return t.flags|=1,e=Ps(a,i),e.ref=t.ref,e.return=t,t.child=e}function Vb(e,t,n,i,s){if(e!==null){var a=e.memoizedProps;if(Xl(a,i)&&e.ref===t.ref)if(an=!1,t.pendingProps=i=a,Y0(e,s))(e.flags&131072)!==0&&(an=!0);else return t.lanes=e.lanes,Gs(e,t,s)}return Ym(e,t,n,i,s)}function Gb(e,t,n,i){var s=i.children,a=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),i.mode==="hidden"){if((t.flags&128)!==0){if(a=a!==null?a.baseLanes|n:n,e!==null){for(i=t.child=e.child,s=0;i!==null;)s=s|i.lanes|i.childLanes,i=i.sibling;i=s&~a}else i=0,t.child=null;return Mx(e,t,a,n,i)}if((n&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Hu(t,a!==null?a.cachePool:null),a!==null?hx(t,a):Hm(),ib(t);else return i=t.lanes=536870912,Mx(e,t,a!==null?a.baseLanes|n:n,n,i)}else a!==null?(Hu(t,a.cachePool),hx(t,a),da(t),t.memoizedState=null):(e!==null&&Hu(t,null),Hm(),da(t));return Mn(e,t,s,n),t.child}function Al(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Mx(e,t,n,i,s){var a=R0();return a=a===null?null:{parent:sn._currentValue,pool:a},t.memoizedState={baseLanes:n,cachePool:a},e!==null&&Hu(t,null),Hm(),ib(t),e!==null&&Co(e,t,i,!0),t.childLanes=s,null}function ku(e,t){return t=hh({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function wx(e,t,n){return gr(t,e.child,null,n),e=ku(t,t.pendingProps),e.flags|=2,ii(t),t.memoizedState=null,e}function fA(e,t,n){var i=t.pendingProps,s=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(oe){if(i.mode==="hidden")return e=ku(t,i),t.lanes=536870912,Al(null,e);if(Vm(t),(e=Fe)?(e=IS(e,Ti),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Ra!==null?{id:is,overflow:ss}:null,retryLane:536870912,hydrationErrors:null},n=Y_(e),n.return=t,t.child=n,En=t,Fe=null)):e=null,e===null)throw Na(t);return t.lanes=536870912,null}return ku(t,i)}var a=e.memoizedState;if(a!==null){var r=a.dehydrated;if(Vm(t),s)if(t.flags&256)t.flags&=-257,t=wx(e,t,n);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error($(558));else if(an||Co(e,t,n,!1),s=(n&e.childLanes)!==0,an||s){if(i=Ce,i!==null&&(r=x_(i,n),r!==0&&r!==a.retryLane))throw a.retryLane=r,Sr(e,r),Yn(i,e,r),q0;mh(),t=wx(e,t,n)}else e=a.treeContext,Fe=Ci(r.nextSibling),En=t,oe=!0,ba=null,Ti=!1,e!==null&&J_(t,e),t=ku(t,i),t.flags|=4096;return t}return e=Ps(e.child,{mode:i.mode,children:i.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Wu(e,t){var n=t.ref;if(n===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error($(284));(e===null||e.ref!==n)&&(t.flags|=4194816)}}function Ym(e,t,n,i,s){return mr(t),n=I0(e,t,n,i,void 0,s),i=O0(),e!==null&&!an?(P0(e,t,s),Gs(e,t,s)):(oe&&i&&T0(t),t.flags|=1,Mn(e,t,n,s),t.child)}function Ex(e,t,n,i,s,a){return mr(t),t.updateQueue=null,n=ab(t,i,n,s),sb(e),i=O0(),e!==null&&!an?(P0(e,t,a),Gs(e,t,a)):(oe&&i&&T0(t),t.flags|=1,Mn(e,t,n,a),t.child)}function Tx(e,t,n,i,s){if(mr(t),t.stateNode===null){var a=io,r=n.contextType;typeof r=="object"&&r!==null&&(a=Tn(r)),a=new n(i,a),t.memoizedState=a.state!==null&&a.state!==void 0?a.state:null,a.updater=Xm,t.stateNode=a,a._reactInternals=t,a=t.stateNode,a.props=i,a.state=t.memoizedState,a.refs={},L0(t),r=n.contextType,a.context=typeof r=="object"&&r!==null?Tn(r):io,a.state=t.memoizedState,r=n.getDerivedStateFromProps,typeof r=="function"&&($p(t,n,r,i),a.state=t.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof a.getSnapshotBeforeUpdate=="function"||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(r=a.state,typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount(),r!==a.state&&Xm.enqueueReplaceState(a,a.state,null),Ol(t,i,a,s),Il(),a.state=t.memoizedState),typeof a.componentDidMount=="function"&&(t.flags|=4194308),i=!0}else if(e===null){a=t.stateNode;var o=t.memoizedProps,l=yr(n,o);a.props=l;var c=a.context,h=n.contextType;r=io,typeof h=="object"&&h!==null&&(r=Tn(h));var d=n.getDerivedStateFromProps;h=typeof d=="function"||typeof a.getSnapshotBeforeUpdate=="function",o=t.pendingProps!==o,h||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(o||c!==r)&&xx(t,a,i,r),ua=!1;var u=t.memoizedState;a.state=u,Ol(t,i,a,s),Il(),c=t.memoizedState,o||u!==c||ua?(typeof d=="function"&&($p(t,n,d,i),c=t.memoizedState),(l=ua||yx(t,n,l,i,u,c,r))?(h||typeof a.UNSAFE_componentWillMount!="function"&&typeof a.componentWillMount!="function"||(typeof a.componentWillMount=="function"&&a.componentWillMount(),typeof a.UNSAFE_componentWillMount=="function"&&a.UNSAFE_componentWillMount()),typeof a.componentDidMount=="function"&&(t.flags|=4194308)):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=i,t.memoizedState=c),a.props=i,a.state=c,a.context=r,i=l):(typeof a.componentDidMount=="function"&&(t.flags|=4194308),i=!1)}else{a=t.stateNode,zm(e,t),r=t.memoizedProps,h=yr(n,r),a.props=h,d=t.pendingProps,u=a.context,c=n.contextType,l=io,typeof c=="object"&&c!==null&&(l=Tn(c)),o=n.getDerivedStateFromProps,(c=typeof o=="function"||typeof a.getSnapshotBeforeUpdate=="function")||typeof a.UNSAFE_componentWillReceiveProps!="function"&&typeof a.componentWillReceiveProps!="function"||(r!==d||u!==l)&&xx(t,a,i,l),ua=!1,u=t.memoizedState,a.state=u,Ol(t,i,a,s),Il();var p=t.memoizedState;r!==d||u!==p||ua||e!==null&&e.dependencies!==null&&sh(e.dependencies)?(typeof o=="function"&&($p(t,n,o,i),p=t.memoizedState),(h=ua||yx(t,n,h,i,u,p,l)||e!==null&&e.dependencies!==null&&sh(e.dependencies))?(c||typeof a.UNSAFE_componentWillUpdate!="function"&&typeof a.componentWillUpdate!="function"||(typeof a.componentWillUpdate=="function"&&a.componentWillUpdate(i,p,l),typeof a.UNSAFE_componentWillUpdate=="function"&&a.UNSAFE_componentWillUpdate(i,p,l)),typeof a.componentDidUpdate=="function"&&(t.flags|=4),typeof a.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof a.componentDidUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=1024),t.memoizedProps=i,t.memoizedState=p),a.props=i,a.state=p,a.context=l,i=h):(typeof a.componentDidUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=4),typeof a.getSnapshotBeforeUpdate!="function"||r===e.memoizedProps&&u===e.memoizedState||(t.flags|=1024),i=!1)}return a=i,Wu(e,t),i=(t.flags&128)!==0,a||i?(a=t.stateNode,n=i&&typeof n.getDerivedStateFromError!="function"?null:a.render(),t.flags|=1,e!==null&&i?(t.child=gr(t,e.child,null,s),t.child=gr(t,null,n,s)):Mn(e,t,n,s),t.memoizedState=a.state,e=t.child):e=Gs(e,t,s),e}function Ax(e,t,n,i){return pr(),t.flags|=256,Mn(e,t,n,i),t.child}var tm={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function em(e){return{baseLanes:e,cachePool:Q_()}}function nm(e,t,n){return e=e!==null?e.childLanes&~n:0,t&&(e|=ai),e}function kb(e,t,n){var i=t.pendingProps,s=!1,a=(t.flags&128)!==0,r;if((r=a)||(r=e!==null&&e.memoizedState===null?!1:(Qe.current&2)!==0),r&&(s=!0,t.flags&=-129),r=(t.flags&32)!==0,t.flags&=-33,e===null){if(oe){if(s?fa(t):da(t),(e=Fe)?(e=IS(e,Ti),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Ra!==null?{id:is,overflow:ss}:null,retryLane:536870912,hydrationErrors:null},n=Y_(e),n.return=t,t.child=n,En=t,Fe=null)):e=null,e===null)throw Na(t);return o0(e)?t.lanes=32:t.lanes=536870912,null}var o=i.children;return i=i.fallback,s?(da(t),s=t.mode,o=hh({mode:"hidden",children:o},s),i=ur(i,s,n,null),o.return=t,i.return=t,o.sibling=i,t.child=o,i=t.child,i.memoizedState=em(n),i.childLanes=nm(e,r,n),t.memoizedState=tm,Al(null,i)):(fa(t),Zm(t,o))}var l=e.memoizedState;if(l!==null&&(o=l.dehydrated,o!==null)){if(a)t.flags&256?(fa(t),t.flags&=-257,t=im(e,t,n)):t.memoizedState!==null?(da(t),t.child=e.child,t.flags|=128,t=null):(da(t),o=i.fallback,s=t.mode,i=hh({mode:"visible",children:i.children},s),o=ur(o,s,n,null),o.flags|=2,i.return=t,o.return=t,i.sibling=o,t.child=i,gr(t,e.child,null,n),i=t.child,i.memoizedState=em(n),i.childLanes=nm(e,r,n),t.memoizedState=tm,t=Al(null,i));else if(fa(t),o0(o)){if(r=o.nextSibling&&o.nextSibling.dataset,r)var c=r.dgst;r=c,i=Error($(419)),i.stack="",i.digest=r,Yl({value:i,source:null,stack:null}),t=im(e,t,n)}else if(an||Co(e,t,n,!1),r=(n&e.childLanes)!==0,an||r){if(r=Ce,r!==null&&(i=x_(r,n),i!==0&&i!==l.retryLane))throw l.retryLane=i,Sr(e,i),Yn(r,e,i),q0;r0(o)||mh(),t=im(e,t,n)}else r0(o)?(t.flags|=192,t.child=e.child,t=null):(e=l.treeContext,Fe=Ci(o.nextSibling),En=t,oe=!0,ba=null,Ti=!1,e!==null&&J_(t,e),t=Zm(t,i.children),t.flags|=4096);return t}return s?(da(t),o=i.fallback,s=t.mode,l=e.child,c=l.sibling,i=Ps(l,{mode:"hidden",children:i.children}),i.subtreeFlags=l.subtreeFlags&65011712,c!==null?o=Ps(c,o):(o=ur(o,s,n,null),o.flags|=2),o.return=t,i.return=t,i.sibling=o,t.child=i,Al(null,i),i=t.child,o=e.child.memoizedState,o===null?o=em(n):(s=o.cachePool,s!==null?(l=sn._currentValue,s=s.parent!==l?{parent:l,pool:l}:s):s=Q_(),o={baseLanes:o.baseLanes|n,cachePool:s}),i.memoizedState=o,i.childLanes=nm(e,r,n),t.memoizedState=tm,Al(e.child,i)):(fa(t),n=e.child,e=n.sibling,n=Ps(n,{mode:"visible",children:i.children}),n.return=t,n.sibling=null,e!==null&&(r=t.deletions,r===null?(t.deletions=[e],t.flags|=16):r.push(e)),t.child=n,t.memoizedState=null,n)}function Zm(e,t){return t=hh({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function hh(e,t){return e=si(22,e,null,t),e.lanes=0,e}function im(e,t,n){return gr(t,e.child,null,n),e=Zm(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function Cx(e,t,n){e.lanes|=t;var i=e.alternate;i!==null&&(i.lanes|=t),Om(e.return,t,n)}function sm(e,t,n,i,s,a){var r=e.memoizedState;r===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:i,tail:n,tailMode:s,treeForkCount:a}:(r.isBackwards=t,r.rendering=null,r.renderingStartTime=0,r.last=i,r.tail=n,r.tailMode=s,r.treeForkCount=a)}function Wb(e,t,n){var i=t.pendingProps,s=i.revealOrder,a=i.tail;i=i.children;var r=Qe.current,o=(r&2)!==0;if(o?(r=r&1|2,t.flags|=128):r&=1,Oe(Qe,r),Mn(e,t,i,n),i=oe?ql:0,!o&&e!==null&&(e.flags&128)!==0)t:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Cx(e,n,t);else if(e.tag===19)Cx(e,n,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break t;for(;e.sibling===null;){if(e.return===null||e.return===t)break t;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(s){case"forwards":for(n=t.child,s=null;n!==null;)e=n.alternate,e!==null&&oh(e)===null&&(s=n),n=n.sibling;n=s,n===null?(s=t.child,t.child=null):(s=n.sibling,n.sibling=null),sm(t,!1,s,n,a,i);break;case"backwards":case"unstable_legacy-backwards":for(n=null,s=t.child,t.child=null;s!==null;){if(e=s.alternate,e!==null&&oh(e)===null){t.child=s;break}e=s.sibling,s.sibling=n,n=s,s=e}sm(t,!0,n,null,a,i);break;case"together":sm(t,!1,null,null,void 0,i);break;default:t.memoizedState=null}return t.child}function Gs(e,t,n){if(e!==null&&(t.dependencies=e.dependencies),Da|=t.lanes,(n&t.childLanes)===0)if(e!==null){if(Co(e,t,n,!1),(n&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error($(153));if(t.child!==null){for(e=t.child,n=Ps(e,e.pendingProps),t.child=n,n.return=t;e.sibling!==null;)e=e.sibling,n=n.sibling=Ps(e,e.pendingProps),n.return=t;n.sibling=null}return t.child}function Y0(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&sh(e)))}function dA(e,t,n){switch(t.tag){case 3:Qu(t,t.stateNode.containerInfo),ha(t,sn,e.memoizedState.cache),pr();break;case 27:case 5:Sm(t);break;case 4:Qu(t,t.stateNode.containerInfo);break;case 10:ha(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Vm(t),null;break;case 13:var i=t.memoizedState;if(i!==null)return i.dehydrated!==null?(fa(t),t.flags|=128,null):(n&t.child.childLanes)!==0?kb(e,t,n):(fa(t),e=Gs(e,t,n),e!==null?e.sibling:null);fa(t);break;case 19:var s=(e.flags&128)!==0;if(i=(n&t.childLanes)!==0,i||(Co(e,t,n,!1),i=(n&t.childLanes)!==0),s){if(i)return Wb(e,t,n);t.flags|=128}if(s=t.memoizedState,s!==null&&(s.rendering=null,s.tail=null,s.lastEffect=null),Oe(Qe,Qe.current),i)break;return null;case 22:return t.lanes=0,Gb(e,t,n,t.pendingProps);case 24:ha(t,sn,e.memoizedState.cache)}return Gs(e,t,n)}function Xb(e,t,n){if(e!==null)if(e.memoizedProps!==t.pendingProps)an=!0;else{if(!Y0(e,n)&&(t.flags&128)===0)return an=!1,dA(e,t,n);an=(e.flags&131072)!==0}else an=!1,oe&&(t.flags&1048576)!==0&&Z_(t,ql,t.index);switch(t.lanes=0,t.tag){case 16:t:{var i=t.pendingProps;if(e=or(t.elementType),t.type=e,typeof e=="function")E0(e)?(i=yr(e,i),t.tag=1,t=Tx(null,t,e,i,n)):(t.tag=0,t=Ym(null,t,e,i,n));else{if(e!=null){var s=e.$$typeof;if(s===h0){t.tag=11,t=bx(null,t,e,i,n);break t}else if(s===f0){t.tag=14,t=Sx(null,t,e,i,n);break t}}throw t=_m(e)||e,Error($(306,t,""))}}return t;case 0:return Ym(e,t,t.type,t.pendingProps,n);case 1:return i=t.type,s=yr(i,t.pendingProps),Tx(e,t,i,s,n);case 3:t:{if(Qu(t,t.stateNode.containerInfo),e===null)throw Error($(387));i=t.pendingProps;var a=t.memoizedState;s=a.element,zm(e,t),Ol(t,i,null,n);var r=t.memoizedState;if(i=r.cache,ha(t,sn,i),i!==a.cache&&Pm(t,[sn],n,!0),Il(),i=r.element,a.isDehydrated)if(a={element:i,isDehydrated:!1,cache:r.cache},t.updateQueue.baseState=a,t.memoizedState=a,t.flags&256){t=Ax(e,t,i,n);break t}else if(i!==s){s=Ei(Error($(424)),t),Yl(s),t=Ax(e,t,i,n);break t}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,Fe=Ci(e.firstChild),En=t,oe=!0,ba=null,Ti=!0,n=tb(t,null,i,n),t.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling;else{if(pr(),i===s){t=Gs(e,t,n);break t}Mn(e,t,i,n)}t=t.child}return t;case 26:return Wu(e,t),e===null?(n=Kx(t.type,null,t.pendingProps,null))?t.memoizedState=n:oe||(n=t.type,e=t.pendingProps,i=xh(_a.current).createElement(n),i[wn]=t,i[Zn]=e,An(i,n,e),mn(i),t.stateNode=i):t.memoizedState=Kx(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return Sm(t),e===null&&oe&&(i=t.stateNode=OS(t.type,t.pendingProps,_a.current),En=t,Ti=!0,s=Fe,Ia(t.type)?(l0=s,Fe=Ci(i.firstChild)):Fe=s),Mn(e,t,t.pendingProps.children,n),Wu(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&oe&&((s=i=Fe)&&(i=VA(i,t.type,t.pendingProps,Ti),i!==null?(t.stateNode=i,En=t,Fe=Ci(i.firstChild),Ti=!1,s=!0):s=!1),s||Na(t)),Sm(t),s=t.type,a=t.pendingProps,r=e!==null?e.memoizedProps:null,i=a.children,s0(s,a)?i=null:r!==null&&s0(s,r)&&(t.flags|=32),t.memoizedState!==null&&(s=I0(e,t,sA,null,null,n),$l._currentValue=s),Wu(e,t),Mn(e,t,i,n),t.child;case 6:return e===null&&oe&&((e=n=Fe)&&(n=GA(n,t.pendingProps,Ti),n!==null?(t.stateNode=n,En=t,Fe=null,e=!0):e=!1),e||Na(t)),null;case 13:return kb(e,t,n);case 4:return Qu(t,t.stateNode.containerInfo),i=t.pendingProps,e===null?t.child=gr(t,null,i,n):Mn(e,t,i,n),t.child;case 11:return bx(e,t,t.type,t.pendingProps,n);case 7:return Mn(e,t,t.pendingProps,n),t.child;case 8:return Mn(e,t,t.pendingProps.children,n),t.child;case 12:return Mn(e,t,t.pendingProps.children,n),t.child;case 10:return i=t.pendingProps,ha(t,t.type,i.value),Mn(e,t,i.children,n),t.child;case 9:return s=t.type._context,i=t.pendingProps.children,mr(t),s=Tn(s),i=i(s),t.flags|=1,Mn(e,t,i,n),t.child;case 14:return Sx(e,t,t.type,t.pendingProps,n);case 15:return Vb(e,t,t.type,t.pendingProps,n);case 19:return Wb(e,t,n);case 31:return fA(e,t,n);case 22:return Gb(e,t,n,t.pendingProps);case 24:return mr(t),i=Tn(sn),e===null?(s=R0(),s===null&&(s=Ce,a=C0(),s.pooledCache=a,a.refCount++,a!==null&&(s.pooledCacheLanes|=n),s=a),t.memoizedState={parent:i,cache:s},L0(t),ha(t,sn,s)):((e.lanes&n)!==0&&(zm(e,t),Ol(t,null,null,n),Il()),s=e.memoizedState,a=t.memoizedState,s.parent!==i?(s={parent:i,cache:i},t.memoizedState=s,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=s),ha(t,sn,i)):(i=a.cache,ha(t,sn,i),i!==s.cache&&Pm(t,[sn],n,!0))),Mn(e,t,t.pendingProps.children,n),t.child;case 29:throw t.pendingProps}throw Error($(156,t.tag))}function As(e){e.flags|=4}function am(e,t,n,i,s){if((t=(e.mode&32)!==0)&&(t=!1),t){if(e.flags|=16777216,(s&335544128)===s)if(e.stateNode.complete)e.flags|=8192;else if(mS())e.flags|=8192;else throw fr=ah,N0}else e.flags&=-16777217}function Rx(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!zS(t))if(mS())e.flags|=8192;else throw fr=ah,N0}function Cu(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?g_():536870912,e.lanes|=t,bo|=t)}function _l(e,t){if(!oe)switch(e.tailMode){case"hidden":t=e.tail;for(var n=null;t!==null;)t.alternate!==null&&(n=t),t=t.sibling;n===null?e.tail=null:n.sibling=null;break;case"collapsed":n=e.tail;for(var i=null;n!==null;)n.alternate!==null&&(i=n),n=n.sibling;i===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:i.sibling=null}}function ze(e){var t=e.alternate!==null&&e.alternate.child===e.child,n=0,i=0;if(t)for(var s=e.child;s!==null;)n|=s.lanes|s.childLanes,i|=s.subtreeFlags&65011712,i|=s.flags&65011712,s.return=e,s=s.sibling;else for(s=e.child;s!==null;)n|=s.lanes|s.childLanes,i|=s.subtreeFlags,i|=s.flags,s.return=e,s=s.sibling;return e.subtreeFlags|=i,e.childLanes=n,t}function pA(e,t,n){var i=t.pendingProps;switch(A0(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return ze(t),null;case 1:return ze(t),null;case 3:return n=t.stateNode,i=null,e!==null&&(i=e.memoizedState.cache),t.memoizedState.cache!==i&&(t.flags|=2048),Bs(sn),mo(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(e===null||e.child===null)&&(Xr(t)?As(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Kp())),ze(t),null;case 26:var s=t.type,a=t.memoizedState;return e===null?(As(t),a!==null?(ze(t),Rx(t,a)):(ze(t),am(t,s,null,i,n))):a?a!==e.memoizedState?(As(t),ze(t),Rx(t,a)):(ze(t),t.flags&=-16777217):(e=e.memoizedProps,e!==i&&As(t),ze(t),am(t,s,e,i,n)),null;case 27:if(ju(t),n=_a.current,s=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&As(t);else{if(!i){if(t.stateNode===null)throw Error($(166));return ze(t),null}e=rs.current,Xr(t)?sx(t,e):(e=OS(s,i,n),t.stateNode=e,As(t))}return ze(t),null;case 5:if(ju(t),s=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==i&&As(t);else{if(!i){if(t.stateNode===null)throw Error($(166));return ze(t),null}if(a=rs.current,Xr(t))sx(t,a);else{var r=xh(_a.current);switch(a){case 1:a=r.createElementNS("http://www.w3.org/2000/svg",s);break;case 2:a=r.createElementNS("http://www.w3.org/1998/Math/MathML",s);break;default:switch(s){case"svg":a=r.createElementNS("http://www.w3.org/2000/svg",s);break;case"math":a=r.createElementNS("http://www.w3.org/1998/Math/MathML",s);break;case"script":a=r.createElement("div"),a.innerHTML="<script><\/script>",a=a.removeChild(a.firstChild);break;case"select":a=typeof i.is=="string"?r.createElement("select",{is:i.is}):r.createElement("select"),i.multiple?a.multiple=!0:i.size&&(a.size=i.size);break;default:a=typeof i.is=="string"?r.createElement(s,{is:i.is}):r.createElement(s)}}a[wn]=t,a[Zn]=i;t:for(r=t.child;r!==null;){if(r.tag===5||r.tag===6)a.appendChild(r.stateNode);else if(r.tag!==4&&r.tag!==27&&r.child!==null){r.child.return=r,r=r.child;continue}if(r===t)break t;for(;r.sibling===null;){if(r.return===null||r.return===t)break t;r=r.return}r.sibling.return=r.return,r=r.sibling}t.stateNode=a;t:switch(An(a,s,i),s){case"button":case"input":case"select":case"textarea":i=!!i.autoFocus;break t;case"img":i=!0;break t;default:i=!1}i&&As(t)}}return ze(t),am(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,n),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==i&&As(t);else{if(typeof i!="string"&&t.stateNode===null)throw Error($(166));if(e=_a.current,Xr(t)){if(e=t.stateNode,n=t.memoizedProps,i=null,s=En,s!==null)switch(s.tag){case 27:case 5:i=s.memoizedProps}e[wn]=t,e=!!(e.nodeValue===n||i!==null&&i.suppressHydrationWarning===!0||LS(e.nodeValue,n)),e||Na(t,!0)}else e=xh(e).createTextNode(i),e[wn]=t,t.stateNode=e}return ze(t),null;case 31:if(n=t.memoizedState,e===null||e.memoizedState!==null){if(i=Xr(t),n!==null){if(e===null){if(!i)throw Error($(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error($(557));e[wn]=t}else pr(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;ze(t),e=!1}else n=Kp(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=n),e=!0;if(!e)return t.flags&256?(ii(t),t):(ii(t),null);if((t.flags&128)!==0)throw Error($(558))}return ze(t),null;case 13:if(i=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(s=Xr(t),i!==null&&i.dehydrated!==null){if(e===null){if(!s)throw Error($(318));if(s=t.memoizedState,s=s!==null?s.dehydrated:null,!s)throw Error($(317));s[wn]=t}else pr(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;ze(t),s=!1}else s=Kp(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=s),s=!0;if(!s)return t.flags&256?(ii(t),t):(ii(t),null)}return ii(t),(t.flags&128)!==0?(t.lanes=n,t):(n=i!==null,e=e!==null&&e.memoizedState!==null,n&&(i=t.child,s=null,i.alternate!==null&&i.alternate.memoizedState!==null&&i.alternate.memoizedState.cachePool!==null&&(s=i.alternate.memoizedState.cachePool.pool),a=null,i.memoizedState!==null&&i.memoizedState.cachePool!==null&&(a=i.memoizedState.cachePool.pool),a!==s&&(i.flags|=2048)),n!==e&&n&&(t.child.flags|=8192),Cu(t,t.updateQueue),ze(t),null);case 4:return mo(),e===null&&tg(t.stateNode.containerInfo),ze(t),null;case 10:return Bs(t.type),ze(t),null;case 19:if(gn(Qe),i=t.memoizedState,i===null)return ze(t),null;if(s=(t.flags&128)!==0,a=i.rendering,a===null)if(s)_l(i,!1);else{if(Ze!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(a=oh(e),a!==null){for(t.flags|=128,_l(i,!1),e=a.updateQueue,t.updateQueue=e,Cu(t,e),t.subtreeFlags=0,e=n,n=t.child;n!==null;)q_(n,e),n=n.sibling;return Oe(Qe,Qe.current&1|2),oe&&Ls(t,i.treeForkCount),t.child}e=e.sibling}i.tail!==null&&ri()>dh&&(t.flags|=128,s=!0,_l(i,!1),t.lanes=4194304)}else{if(!s)if(e=oh(a),e!==null){if(t.flags|=128,s=!0,e=e.updateQueue,t.updateQueue=e,Cu(t,e),_l(i,!0),i.tail===null&&i.tailMode==="hidden"&&!a.alternate&&!oe)return ze(t),null}else 2*ri()-i.renderingStartTime>dh&&n!==536870912&&(t.flags|=128,s=!0,_l(i,!1),t.lanes=4194304);i.isBackwards?(a.sibling=t.child,t.child=a):(e=i.last,e!==null?e.sibling=a:t.child=a,i.last=a)}return i.tail!==null?(e=i.tail,i.rendering=e,i.tail=e.sibling,i.renderingStartTime=ri(),e.sibling=null,n=Qe.current,Oe(Qe,s?n&1|2:n&1),oe&&Ls(t,i.treeForkCount),e):(ze(t),null);case 22:case 23:return ii(t),D0(),i=t.memoizedState!==null,e!==null?e.memoizedState!==null!==i&&(t.flags|=8192):i&&(t.flags|=8192),i?(n&536870912)!==0&&(t.flags&128)===0&&(ze(t),t.subtreeFlags&6&&(t.flags|=8192)):ze(t),n=t.updateQueue,n!==null&&Cu(t,n.retryQueue),n=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),i=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(i=t.memoizedState.cachePool.pool),i!==n&&(t.flags|=2048),e!==null&&gn(hr),null;case 24:return n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Bs(sn),ze(t),null;case 25:return null;case 30:return null}throw Error($(156,t.tag))}function mA(e,t){switch(A0(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Bs(sn),mo(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return ju(t),null;case 31:if(t.memoizedState!==null){if(ii(t),t.alternate===null)throw Error($(340));pr()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(ii(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error($(340));pr()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return gn(Qe),null;case 4:return mo(),null;case 10:return Bs(t.type),null;case 22:case 23:return ii(t),D0(),e!==null&&gn(hr),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Bs(sn),null;case 25:return null;default:return null}}function qb(e,t){switch(A0(t),t.tag){case 3:Bs(sn),mo();break;case 26:case 27:case 5:ju(t);break;case 4:mo();break;case 31:t.memoizedState!==null&&ii(t);break;case 13:ii(t);break;case 19:gn(Qe);break;case 10:Bs(t.type);break;case 22:case 23:ii(t),D0(),e!==null&&gn(hr);break;case 24:Bs(sn)}}function uc(e,t){try{var n=t.updateQueue,i=n!==null?n.lastEffect:null;if(i!==null){var s=i.next;n=s;do{if((n.tag&e)===e){i=void 0;var a=n.create,r=n.inst;i=a(),r.destroy=i}n=n.next}while(n!==s)}}catch(o){xe(t,t.return,o)}}function La(e,t,n){try{var i=t.updateQueue,s=i!==null?i.lastEffect:null;if(s!==null){var a=s.next;i=a;do{if((i.tag&e)===e){var r=i.inst,o=r.destroy;if(o!==void 0){r.destroy=void 0,s=t;var l=n,c=o;try{c()}catch(h){xe(s,l,h)}}}i=i.next}while(i!==a)}}catch(h){xe(t,t.return,h)}}function Yb(e){var t=e.updateQueue;if(t!==null){var n=e.stateNode;try{nb(t,n)}catch(i){xe(e,e.return,i)}}}function Zb(e,t,n){n.props=yr(e.type,e.memoizedProps),n.state=e.memoizedState;try{n.componentWillUnmount()}catch(i){xe(e,t,i)}}function Bl(e,t){try{var n=e.ref;if(n!==null){switch(e.tag){case 26:case 27:case 5:var i=e.stateNode;break;case 30:i=e.stateNode;break;default:i=e.stateNode}typeof n=="function"?e.refCleanup=n(i):n.current=i}}catch(s){xe(e,t,s)}}function as(e,t){var n=e.ref,i=e.refCleanup;if(n!==null)if(typeof i=="function")try{i()}catch(s){xe(e,t,s)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(s){xe(e,t,s)}else n.current=null}function Jb(e){var t=e.type,n=e.memoizedProps,i=e.stateNode;try{t:switch(t){case"button":case"input":case"select":case"textarea":n.autoFocus&&i.focus();break t;case"img":n.src?i.src=n.src:n.srcSet&&(i.srcset=n.srcSet)}}catch(s){xe(e,e.return,s)}}function rm(e,t,n){try{var i=e.stateNode;OA(i,e.type,n,t),i[Zn]=t}catch(s){xe(e,e.return,s)}}function Kb(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Ia(e.type)||e.tag===4}function om(e){t:for(;;){for(;e.sibling===null;){if(e.return===null||Kb(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Ia(e.type)||e.flags&2||e.child===null||e.tag===4)continue t;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Jm(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(e,t):(t=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,t.appendChild(e),n=n._reactRootContainer,n!=null||t.onclick!==null||(t.onclick=Is));else if(i!==4&&(i===27&&Ia(e.type)&&(n=e.stateNode,t=null),e=e.child,e!==null))for(Jm(e,t,n),e=e.sibling;e!==null;)Jm(e,t,n),e=e.sibling}function fh(e,t,n){var i=e.tag;if(i===5||i===6)e=e.stateNode,t?n.insertBefore(e,t):n.appendChild(e);else if(i!==4&&(i===27&&Ia(e.type)&&(n=e.stateNode),e=e.child,e!==null))for(fh(e,t,n),e=e.sibling;e!==null;)fh(e,t,n),e=e.sibling}function Qb(e){var t=e.stateNode,n=e.memoizedProps;try{for(var i=e.type,s=t.attributes;s.length;)t.removeAttributeNode(s[0]);An(t,i,n),t[wn]=e,t[Zn]=n}catch(a){xe(e,e.return,a)}}var Ds=!1,nn=!1,lm=!1,Nx=typeof WeakSet=="function"?WeakSet:Set,pn=null;function gA(e,t){if(e=e.containerInfo,n0=Mh,e=z_(e),S0(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else t:{n=(n=e.ownerDocument)&&n.defaultView||window;var i=n.getSelection&&n.getSelection();if(i&&i.rangeCount!==0){n=i.anchorNode;var s=i.anchorOffset,a=i.focusNode;i=i.focusOffset;try{n.nodeType,a.nodeType}catch{n=null;break t}var r=0,o=-1,l=-1,c=0,h=0,d=e,u=null;e:for(;;){for(var p;d!==n||s!==0&&d.nodeType!==3||(o=r+s),d!==a||i!==0&&d.nodeType!==3||(l=r+i),d.nodeType===3&&(r+=d.nodeValue.length),(p=d.firstChild)!==null;)u=d,d=p;for(;;){if(d===e)break e;if(u===n&&++c===s&&(o=r),u===a&&++h===i&&(l=r),(p=d.nextSibling)!==null)break;d=u,u=d.parentNode}d=p}n=o===-1||l===-1?null:{start:o,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(i0={focusedElem:e,selectionRange:n},Mh=!1,pn=t;pn!==null;)if(t=pn,e=t.child,(t.subtreeFlags&1028)!==0&&e!==null)e.return=t,pn=e;else for(;pn!==null;){switch(t=pn,a=t.alternate,e=t.flags,t.tag){case 0:if((e&4)!==0&&(e=t.updateQueue,e=e!==null?e.events:null,e!==null))for(n=0;n<e.length;n++)s=e[n],s.ref.impl=s.nextImpl;break;case 11:case 15:break;case 1:if((e&1024)!==0&&a!==null){e=void 0,n=t,s=a.memoizedProps,a=a.memoizedState,i=n.stateNode;try{var m=yr(n.type,s);e=i.getSnapshotBeforeUpdate(m,a),i.__reactInternalSnapshotBeforeUpdate=e}catch(S){xe(n,n.return,S)}}break;case 3:if((e&1024)!==0){if(e=t.stateNode.containerInfo,n=e.nodeType,n===9)a0(e);else if(n===1)switch(e.nodeName){case"HEAD":case"HTML":case"BODY":a0(e);break;default:e.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((e&1024)!==0)throw Error($(163))}if(e=t.sibling,e!==null){e.return=t.return,pn=e;break}pn=t.return}}function jb(e,t,n){var i=n.flags;switch(n.tag){case 0:case 11:case 15:Rs(e,n),i&4&&uc(5,n);break;case 1:if(Rs(e,n),i&4)if(e=n.stateNode,t===null)try{e.componentDidMount()}catch(r){xe(n,n.return,r)}else{var s=yr(n.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(s,t,e.__reactInternalSnapshotBeforeUpdate)}catch(r){xe(n,n.return,r)}}i&64&&Yb(n),i&512&&Bl(n,n.return);break;case 3:if(Rs(e,n),i&64&&(e=n.updateQueue,e!==null)){if(t=null,n.child!==null)switch(n.child.tag){case 27:case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}try{nb(e,t)}catch(r){xe(n,n.return,r)}}break;case 27:t===null&&i&4&&Qb(n);case 26:case 5:Rs(e,n),t===null&&i&4&&Jb(n),i&512&&Bl(n,n.return);break;case 12:Rs(e,n);break;case 31:Rs(e,n),i&4&&eS(e,n);break;case 13:Rs(e,n),i&4&&nS(e,n),i&64&&(e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(n=EA.bind(null,n),kA(e,n))));break;case 22:if(i=n.memoizedState!==null||Ds,!i){t=t!==null&&t.memoizedState!==null||nn,s=Ds;var a=nn;Ds=i,(nn=t)&&!a?Ns(e,n,(n.subtreeFlags&8772)!==0):Rs(e,n),Ds=s,nn=a}break;case 30:break;default:Rs(e,n)}}function $b(e){var t=e.alternate;t!==null&&(e.alternate=null,$b(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&g0(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var We=null,Xn=!1;function Cs(e,t,n){for(n=n.child;n!==null;)tS(e,t,n),n=n.sibling}function tS(e,t,n){if(oi&&typeof oi.onCommitFiberUnmount=="function")try{oi.onCommitFiberUnmount(ic,n)}catch{}switch(n.tag){case 26:nn||as(n,t),Cs(e,t,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:nn||as(n,t);var i=We,s=Xn;Ia(n.type)&&(We=n.stateNode,Xn=!1),Cs(e,t,n),Vl(n.stateNode),We=i,Xn=s;break;case 5:nn||as(n,t);case 6:if(i=We,s=Xn,We=null,Cs(e,t,n),We=i,Xn=s,We!==null)if(Xn)try{(We.nodeType===9?We.body:We.nodeName==="HTML"?We.ownerDocument.body:We).removeChild(n.stateNode)}catch(a){xe(n,t,a)}else try{We.removeChild(n.stateNode)}catch(a){xe(n,t,a)}break;case 18:We!==null&&(Xn?(e=We,Xx(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,n.stateNode),Eo(e)):Xx(We,n.stateNode));break;case 4:i=We,s=Xn,We=n.stateNode.containerInfo,Xn=!0,Cs(e,t,n),We=i,Xn=s;break;case 0:case 11:case 14:case 15:La(2,n,t),nn||La(4,n,t),Cs(e,t,n);break;case 1:nn||(as(n,t),i=n.stateNode,typeof i.componentWillUnmount=="function"&&Zb(n,t,i)),Cs(e,t,n);break;case 21:Cs(e,t,n);break;case 22:nn=(i=nn)||n.memoizedState!==null,Cs(e,t,n),nn=i;break;default:Cs(e,t,n)}}function eS(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{Eo(e)}catch(n){xe(t,t.return,n)}}}function nS(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{Eo(e)}catch(n){xe(t,t.return,n)}}function vA(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Nx),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Nx),t;default:throw Error($(435,e.tag))}}function Ru(e,t){var n=vA(e);t.forEach(function(i){if(!n.has(i)){n.add(i);var s=TA.bind(null,e,i);i.then(s,s)}})}function kn(e,t){var n=t.deletions;if(n!==null)for(var i=0;i<n.length;i++){var s=n[i],a=e,r=t,o=r;t:for(;o!==null;){switch(o.tag){case 27:if(Ia(o.type)){We=o.stateNode,Xn=!1;break t}break;case 5:We=o.stateNode,Xn=!1;break t;case 3:case 4:We=o.stateNode.containerInfo,Xn=!0;break t}o=o.return}if(We===null)throw Error($(160));tS(a,r,s),We=null,Xn=!1,a=s.alternate,a!==null&&(a.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)iS(t,e),t=t.sibling}var Fi=null;function iS(e,t){var n=e.alternate,i=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:kn(t,e),Wn(e),i&4&&(La(3,e,e.return),uc(3,e),La(5,e,e.return));break;case 1:kn(t,e),Wn(e),i&512&&(nn||n===null||as(n,n.return)),i&64&&Ds&&(e=e.updateQueue,e!==null&&(i=e.callbacks,i!==null&&(n=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=n===null?i:n.concat(i))));break;case 26:var s=Fi;if(kn(t,e),Wn(e),i&512&&(nn||n===null||as(n,n.return)),i&4){var a=n!==null?n.memoizedState:null;if(i=e.memoizedState,n===null)if(i===null)if(e.stateNode===null){t:{i=e.type,n=e.memoizedProps,s=s.ownerDocument||s;e:switch(i){case"title":a=s.getElementsByTagName("title")[0],(!a||a[rc]||a[wn]||a.namespaceURI==="http://www.w3.org/2000/svg"||a.hasAttribute("itemprop"))&&(a=s.createElement(i),s.head.insertBefore(a,s.querySelector("head > title"))),An(a,i,n),a[wn]=e,mn(a),i=a;break t;case"link":var r=jx("link","href",s).get(i+(n.href||""));if(r){for(var o=0;o<r.length;o++)if(a=r[o],a.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&a.getAttribute("rel")===(n.rel==null?null:n.rel)&&a.getAttribute("title")===(n.title==null?null:n.title)&&a.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){r.splice(o,1);break e}}a=s.createElement(i),An(a,i,n),s.head.appendChild(a);break;case"meta":if(r=jx("meta","content",s).get(i+(n.content||""))){for(o=0;o<r.length;o++)if(a=r[o],a.getAttribute("content")===(n.content==null?null:""+n.content)&&a.getAttribute("name")===(n.name==null?null:n.name)&&a.getAttribute("property")===(n.property==null?null:n.property)&&a.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&a.getAttribute("charset")===(n.charSet==null?null:n.charSet)){r.splice(o,1);break e}}a=s.createElement(i),An(a,i,n),s.head.appendChild(a);break;default:throw Error($(468,i))}a[wn]=e,mn(a),i=a}e.stateNode=i}else $x(s,e.type,e.stateNode);else e.stateNode=Qx(s,i,e.memoizedProps);else a!==i?(a===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):a.count--,i===null?$x(s,e.type,e.stateNode):Qx(s,i,e.memoizedProps)):i===null&&e.stateNode!==null&&rm(e,e.memoizedProps,n.memoizedProps)}break;case 27:kn(t,e),Wn(e),i&512&&(nn||n===null||as(n,n.return)),n!==null&&i&4&&rm(e,e.memoizedProps,n.memoizedProps);break;case 5:if(kn(t,e),Wn(e),i&512&&(nn||n===null||as(n,n.return)),e.flags&32){s=e.stateNode;try{vo(s,"")}catch(m){xe(e,e.return,m)}}i&4&&e.stateNode!=null&&(s=e.memoizedProps,rm(e,s,n!==null?n.memoizedProps:s)),i&1024&&(lm=!0);break;case 6:if(kn(t,e),Wn(e),i&4){if(e.stateNode===null)throw Error($(162));i=e.memoizedProps,n=e.stateNode;try{n.nodeValue=i}catch(m){xe(e,e.return,m)}}break;case 3:if(Yu=null,s=Fi,Fi=_h(t.containerInfo),kn(t,e),Fi=s,Wn(e),i&4&&n!==null&&n.memoizedState.isDehydrated)try{Eo(t.containerInfo)}catch(m){xe(e,e.return,m)}lm&&(lm=!1,sS(e));break;case 4:i=Fi,Fi=_h(e.stateNode.containerInfo),kn(t,e),Wn(e),Fi=i;break;case 12:kn(t,e),Wn(e);break;case 31:kn(t,e),Wn(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,Ru(e,i)));break;case 13:kn(t,e),Wn(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Ph=ri()),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,Ru(e,i)));break;case 22:s=e.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,c=Ds,h=nn;if(Ds=c||s,nn=h||l,kn(t,e),nn=h,Ds=c,Wn(e),i&8192)t:for(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,s&&(n===null||l||Ds||nn||lr(e)),n=null,t=e;;){if(t.tag===5||t.tag===26){if(n===null){l=n=t;try{if(a=l.stateNode,s)r=a.style,typeof r.setProperty=="function"?r.setProperty("display","none","important"):r.display="none";else{o=l.stateNode;var d=l.memoizedProps.style,u=d!=null&&d.hasOwnProperty("display")?d.display:null;o.style.display=u==null||typeof u=="boolean"?"":(""+u).trim()}}catch(m){xe(l,l.return,m)}}}else if(t.tag===6){if(n===null){l=t;try{l.stateNode.nodeValue=s?"":l.memoizedProps}catch(m){xe(l,l.return,m)}}}else if(t.tag===18){if(n===null){l=t;try{var p=l.stateNode;s?qx(p,!0):qx(l.stateNode,!1)}catch(m){xe(l,l.return,m)}}}else if((t.tag!==22&&t.tag!==23||t.memoizedState===null||t===e)&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break t;for(;t.sibling===null;){if(t.return===null||t.return===e)break t;n===t&&(n=null),t=t.return}n===t&&(n=null),t.sibling.return=t.return,t=t.sibling}i&4&&(i=e.updateQueue,i!==null&&(n=i.retryQueue,n!==null&&(i.retryQueue=null,Ru(e,n))));break;case 19:kn(t,e),Wn(e),i&4&&(i=e.updateQueue,i!==null&&(e.updateQueue=null,Ru(e,i)));break;case 30:break;case 21:break;default:kn(t,e),Wn(e)}}function Wn(e){var t=e.flags;if(t&2){try{for(var n,i=e.return;i!==null;){if(Kb(i)){n=i;break}i=i.return}if(n==null)throw Error($(160));switch(n.tag){case 27:var s=n.stateNode,a=om(e);fh(e,a,s);break;case 5:var r=n.stateNode;n.flags&32&&(vo(r,""),n.flags&=-33);var o=om(e);fh(e,o,r);break;case 3:case 4:var l=n.stateNode.containerInfo,c=om(e);Jm(e,c,l);break;default:throw Error($(161))}}catch(h){xe(e,e.return,h)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function sS(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;sS(t),t.tag===5&&t.flags&1024&&t.stateNode.reset(),e=e.sibling}}function Rs(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)jb(e,t.alternate,t),t=t.sibling}function lr(e){for(e=e.child;e!==null;){var t=e;switch(t.tag){case 0:case 11:case 14:case 15:La(4,t,t.return),lr(t);break;case 1:as(t,t.return);var n=t.stateNode;typeof n.componentWillUnmount=="function"&&Zb(t,t.return,n),lr(t);break;case 27:Vl(t.stateNode);case 26:case 5:as(t,t.return),lr(t);break;case 22:t.memoizedState===null&&lr(t);break;case 30:lr(t);break;default:lr(t)}e=e.sibling}}function Ns(e,t,n){for(n=n&&(t.subtreeFlags&8772)!==0,t=t.child;t!==null;){var i=t.alternate,s=e,a=t,r=a.flags;switch(a.tag){case 0:case 11:case 15:Ns(s,a,n),uc(4,a);break;case 1:if(Ns(s,a,n),i=a,s=i.stateNode,typeof s.componentDidMount=="function")try{s.componentDidMount()}catch(c){xe(i,i.return,c)}if(i=a,s=i.updateQueue,s!==null){var o=i.stateNode;try{var l=s.shared.hiddenCallbacks;if(l!==null)for(s.shared.hiddenCallbacks=null,s=0;s<l.length;s++)eb(l[s],o)}catch(c){xe(i,i.return,c)}}n&&r&64&&Yb(a),Bl(a,a.return);break;case 27:Qb(a);case 26:case 5:Ns(s,a,n),n&&i===null&&r&4&&Jb(a),Bl(a,a.return);break;case 12:Ns(s,a,n);break;case 31:Ns(s,a,n),n&&r&4&&eS(s,a);break;case 13:Ns(s,a,n),n&&r&4&&nS(s,a);break;case 22:a.memoizedState===null&&Ns(s,a,n),Bl(a,a.return);break;case 30:break;default:Ns(s,a,n)}t=t.sibling}}function Z0(e,t){var n=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(n=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==n&&(e!=null&&e.refCount++,n!=null&&lc(n))}function J0(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&lc(e))}function zi(e,t,n,i){if(t.subtreeFlags&10256)for(t=t.child;t!==null;)aS(e,t,n,i),t=t.sibling}function aS(e,t,n,i){var s=t.flags;switch(t.tag){case 0:case 11:case 15:zi(e,t,n,i),s&2048&&uc(9,t);break;case 1:zi(e,t,n,i);break;case 3:zi(e,t,n,i),s&2048&&(e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&lc(e)));break;case 12:if(s&2048){zi(e,t,n,i),e=t.stateNode;try{var a=t.memoizedProps,r=a.id,o=a.onPostCommit;typeof o=="function"&&o(r,t.alternate===null?"mount":"update",e.passiveEffectDuration,-0)}catch(l){xe(t,t.return,l)}}else zi(e,t,n,i);break;case 31:zi(e,t,n,i);break;case 13:zi(e,t,n,i);break;case 23:break;case 22:a=t.stateNode,r=t.alternate,t.memoizedState!==null?a._visibility&2?zi(e,t,n,i):zl(e,t):a._visibility&2?zi(e,t,n,i):(a._visibility|=2,Yr(e,t,n,i,(t.subtreeFlags&10256)!==0||!1)),s&2048&&Z0(r,t);break;case 24:zi(e,t,n,i),s&2048&&J0(t.alternate,t);break;default:zi(e,t,n,i)}}function Yr(e,t,n,i,s){for(s=s&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var a=e,r=t,o=n,l=i,c=r.flags;switch(r.tag){case 0:case 11:case 15:Yr(a,r,o,l,s),uc(8,r);break;case 23:break;case 22:var h=r.stateNode;r.memoizedState!==null?h._visibility&2?Yr(a,r,o,l,s):zl(a,r):(h._visibility|=2,Yr(a,r,o,l,s)),s&&c&2048&&Z0(r.alternate,r);break;case 24:Yr(a,r,o,l,s),s&&c&2048&&J0(r.alternate,r);break;default:Yr(a,r,o,l,s)}t=t.sibling}}function zl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var n=e,i=t,s=i.flags;switch(i.tag){case 22:zl(n,i),s&2048&&Z0(i.alternate,i);break;case 24:zl(n,i),s&2048&&J0(i.alternate,i);break;default:zl(n,i)}t=t.sibling}}var Cl=8192;function qr(e,t,n){if(e.subtreeFlags&Cl)for(e=e.child;e!==null;)rS(e,t,n),e=e.sibling}function rS(e,t,n){switch(e.tag){case 26:qr(e,t,n),e.flags&Cl&&e.memoizedState!==null&&e2(n,Fi,e.memoizedState,e.memoizedProps);break;case 5:qr(e,t,n);break;case 3:case 4:var i=Fi;Fi=_h(e.stateNode.containerInfo),qr(e,t,n),Fi=i;break;case 22:e.memoizedState===null&&(i=e.alternate,i!==null&&i.memoizedState!==null?(i=Cl,Cl=16777216,qr(e,t,n),Cl=i):qr(e,t,n));break;default:qr(e,t,n)}}function oS(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function bl(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];pn=i,cS(i,e)}oS(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)lS(e),e=e.sibling}function lS(e){switch(e.tag){case 0:case 11:case 15:bl(e),e.flags&2048&&La(9,e,e.return);break;case 3:bl(e);break;case 12:bl(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Xu(e)):bl(e);break;default:bl(e)}}function Xu(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var n=0;n<t.length;n++){var i=t[n];pn=i,cS(i,e)}oS(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:La(8,t,t.return),Xu(t);break;case 22:n=t.stateNode,n._visibility&2&&(n._visibility&=-3,Xu(t));break;default:Xu(t)}e=e.sibling}}function cS(e,t){for(;pn!==null;){var n=pn;switch(n.tag){case 0:case 11:case 15:La(8,n,t);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var i=n.memoizedState.cachePool.pool;i!=null&&i.refCount++}break;case 24:lc(n.memoizedState.cache)}if(i=n.child,i!==null)i.return=n,pn=i;else t:for(n=e;pn!==null;){i=pn;var s=i.sibling,a=i.return;if($b(i),i===n){pn=null;break t}if(s!==null){s.return=a,pn=s;break t}pn=a}}}var yA={getCacheForType:function(e){var t=Tn(sn),n=t.data.get(e);return n===void 0&&(n=e(),t.data.set(e,n)),n},cacheSignal:function(){return Tn(sn).controller.signal}},xA=typeof WeakMap=="function"?WeakMap:Map,pe=0,Ce=null,ee=null,ie=0,ye=0,ni=null,va=!1,No=!1,K0=!1,ks=0,Ze=0,Da=0,dr=0,Q0=0,ai=0,bo=0,Fl=null,qn=null,Km=!1,Ph=0,uS=0,dh=1/0,ph=null,wa=null,cn=0,Ea=null,So=null,zs=0,Qm=0,jm=null,hS=null,Hl=0,$m=null;function ci(){return(pe&2)!==0&&ie!==0?ie&-ie:Ft.T!==null?$0():__()}function fS(){if(ai===0)if((ie&536870912)===0||oe){var e=xu;xu<<=1,(xu&3932160)===0&&(xu=262144),ai=e}else ai=536870912;return e=hi.current,e!==null&&(e.flags|=32),ai}function Yn(e,t,n){(e===Ce&&(ye===2||ye===9)||e.cancelPendingCommit!==null)&&(Mo(e,0),ya(e,ie,ai,!1)),ac(e,n),((pe&2)===0||e!==Ce)&&(e===Ce&&((pe&2)===0&&(dr|=n),Ze===4&&ya(e,ie,ai,!1)),ls(e))}function dS(e,t,n){if((pe&6)!==0)throw Error($(327));var i=!n&&(t&127)===0&&(t&e.expiredLanes)===0||sc(e,t),s=i?SA(e,t):cm(e,t,!0),a=i;do{if(s===0){No&&!i&&ya(e,t,0,!1);break}else{if(n=e.current.alternate,a&&!_A(n)){s=cm(e,t,!1),a=!1;continue}if(s===2){if(a=t,e.errorRecoveryDisabledLanes&a)var r=0;else r=e.pendingLanes&-536870913,r=r!==0?r:r&536870912?536870912:0;if(r!==0){t=r;t:{var o=e;s=Fl;var l=o.current.memoizedState.isDehydrated;if(l&&(Mo(o,r).flags|=256),r=cm(o,r,!1),r!==2){if(K0&&!l){o.errorRecoveryDisabledLanes|=a,dr|=a,s=4;break t}a=qn,qn=s,a!==null&&(qn===null?qn=a:qn.push.apply(qn,a))}s=r}if(a=!1,s!==2)continue}}if(s===1){Mo(e,0),ya(e,t,0,!0);break}t:{switch(i=e,a=s,a){case 0:case 1:throw Error($(345));case 4:if((t&4194048)!==t)break;case 6:ya(i,t,ai,!va);break t;case 2:qn=null;break;case 3:case 5:break;default:throw Error($(329))}if((t&62914560)===t&&(s=Ph+300-ri(),10<s)){if(ya(i,t,ai,!va),Eh(i,0,!0)!==0)break t;zs=t,i.timeoutHandle=US(Lx.bind(null,i,n,qn,ph,Km,t,ai,dr,bo,va,a,"Throttled",-0,0),s);break t}Lx(i,n,qn,ph,Km,t,ai,dr,bo,va,a,null,-0,0)}}break}while(!0);ls(e)}function Lx(e,t,n,i,s,a,r,o,l,c,h,d,u,p){if(e.timeoutHandle=-1,d=t.subtreeFlags,d&8192||(d&16785408)===16785408){d={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:Is},rS(t,a,d);var m=(a&62914560)===a?Ph-ri():(a&4194048)===a?uS-ri():0;if(m=n2(d,m),m!==null){zs=a,e.cancelPendingCommit=m(Ux.bind(null,e,t,a,n,i,s,r,o,l,h,d,null,u,p)),ya(e,a,r,!c);return}}Ux(e,t,a,n,i,s,r,o,l)}function _A(e){for(var t=e;;){var n=t.tag;if((n===0||n===11||n===15)&&t.flags&16384&&(n=t.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var i=0;i<n.length;i++){var s=n[i],a=s.getSnapshot;s=s.value;try{if(!ui(a(),s))return!1}catch{return!1}}if(n=t.child,t.subtreeFlags&16384&&n!==null)n.return=t,t=n;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function ya(e,t,n,i){t&=~Q0,t&=~dr,e.suspendedLanes|=t,e.pingedLanes&=~t,i&&(e.warmLanes|=t),i=e.expirationTimes;for(var s=t;0<s;){var a=31-li(s),r=1<<a;i[a]=-1,s&=~r}n!==0&&v_(e,n,t)}function Bh(){return(pe&6)===0?(hc(0,!1),!1):!0}function j0(){if(ee!==null){if(ye===0)var e=ee.return;else e=ee,Os=Mr=null,B0(e),ho=null,Zl=0,e=ee;for(;e!==null;)qb(e.alternate,e),e=e.return;ee=null}}function Mo(e,t){var n=e.timeoutHandle;n!==-1&&(e.timeoutHandle=-1,zA(n)),n=e.cancelPendingCommit,n!==null&&(e.cancelPendingCommit=null,n()),zs=0,j0(),Ce=e,ee=n=Ps(e.current,null),ie=t,ye=0,ni=null,va=!1,No=sc(e,t),K0=!1,bo=ai=Q0=dr=Da=Ze=0,qn=Fl=null,Km=!1,(t&8)!==0&&(t|=t&32);var i=e.entangledLanes;if(i!==0)for(e=e.entanglements,i&=t;0<i;){var s=31-li(i),a=1<<s;t|=e[s],i&=~a}return ks=t,Rh(),n}function pS(e,t){qt=null,Ft.H=Kl,t===Ro||t===Lh?(t=cx(),ye=3):t===N0?(t=cx(),ye=4):ye=t===q0?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,ni=t,ee===null&&(Ze=1,uh(e,Ei(t,e.current)))}function mS(){var e=hi.current;return e===null?!0:(ie&4194048)===ie?Ai===null:(ie&62914560)===ie||(ie&536870912)!==0?e===Ai:!1}function gS(){var e=Ft.H;return Ft.H=Kl,e===null?Kl:e}function vS(){var e=Ft.A;return Ft.A=yA,e}function mh(){Ze=4,va||(ie&4194048)!==ie&&hi.current!==null||(No=!0),(Da&134217727)===0&&(dr&134217727)===0||Ce===null||ya(Ce,ie,ai,!1)}function cm(e,t,n){var i=pe;pe|=2;var s=gS(),a=vS();(Ce!==e||ie!==t)&&(ph=null,Mo(e,t)),t=!1;var r=Ze;t:do try{if(ye!==0&&ee!==null){var o=ee,l=ni;switch(ye){case 8:j0(),r=6;break t;case 3:case 2:case 9:case 6:hi.current===null&&(t=!0);var c=ye;if(ye=0,ni=null,ro(e,o,l,c),n&&No){r=0;break t}break;default:c=ye,ye=0,ni=null,ro(e,o,l,c)}}bA(),r=Ze;break}catch(h){pS(e,h)}while(!0);return t&&e.shellSuspendCounter++,Os=Mr=null,pe=i,Ft.H=s,Ft.A=a,ee===null&&(Ce=null,ie=0,Rh()),r}function bA(){for(;ee!==null;)yS(ee)}function SA(e,t){var n=pe;pe|=2;var i=gS(),s=vS();Ce!==e||ie!==t?(ph=null,dh=ri()+500,Mo(e,t)):No=sc(e,t);t:do try{if(ye!==0&&ee!==null){t=ee;var a=ni;e:switch(ye){case 1:ye=0,ni=null,ro(e,t,a,1);break;case 2:case 9:if(lx(a)){ye=0,ni=null,Dx(t);break}t=function(){ye!==2&&ye!==9||Ce!==e||(ye=7),ls(e)},a.then(t,t);break t;case 3:ye=7;break t;case 4:ye=5;break t;case 7:lx(a)?(ye=0,ni=null,Dx(t)):(ye=0,ni=null,ro(e,t,a,7));break;case 5:var r=null;switch(ee.tag){case 26:r=ee.memoizedState;case 5:case 27:var o=ee;if(r?zS(r):o.stateNode.complete){ye=0,ni=null;var l=o.sibling;if(l!==null)ee=l;else{var c=o.return;c!==null?(ee=c,zh(c)):ee=null}break e}}ye=0,ni=null,ro(e,t,a,5);break;case 6:ye=0,ni=null,ro(e,t,a,6);break;case 8:j0(),Ze=6;break t;default:throw Error($(462))}}MA();break}catch(h){pS(e,h)}while(!0);return Os=Mr=null,Ft.H=i,Ft.A=s,pe=n,ee!==null?0:(Ce=null,ie=0,Rh(),Ze)}function MA(){for(;ee!==null&&!qE();)yS(ee)}function yS(e){var t=Xb(e.alternate,e,ks);e.memoizedProps=e.pendingProps,t===null?zh(e):ee=t}function Dx(e){var t=e,n=t.alternate;switch(t.tag){case 15:case 0:t=Ex(n,t,t.pendingProps,t.type,void 0,ie);break;case 11:t=Ex(n,t,t.pendingProps,t.type.render,t.ref,ie);break;case 5:B0(t);default:qb(n,t),t=ee=q_(t,ks),t=Xb(n,t,ks)}e.memoizedProps=e.pendingProps,t===null?zh(e):ee=t}function ro(e,t,n,i){Os=Mr=null,B0(t),ho=null,Zl=0;var s=t.return;try{if(hA(e,s,t,n,ie)){Ze=1,uh(e,Ei(n,e.current)),ee=null;return}}catch(a){if(s!==null)throw ee=s,a;Ze=1,uh(e,Ei(n,e.current)),ee=null;return}t.flags&32768?(oe||i===1?e=!0:No||(ie&536870912)!==0?e=!1:(va=e=!0,(i===2||i===9||i===3||i===6)&&(i=hi.current,i!==null&&i.tag===13&&(i.flags|=16384))),xS(t,e)):zh(t)}function zh(e){var t=e;do{if((t.flags&32768)!==0){xS(t,va);return}e=t.return;var n=pA(t.alternate,t,ks);if(n!==null){ee=n;return}if(t=t.sibling,t!==null){ee=t;return}ee=t=e}while(t!==null);Ze===0&&(Ze=5)}function xS(e,t){do{var n=mA(e.alternate,e);if(n!==null){n.flags&=32767,ee=n;return}if(n=e.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!t&&(e=e.sibling,e!==null)){ee=e;return}ee=e=n}while(e!==null);Ze=6,ee=null}function Ux(e,t,n,i,s,a,r,o,l){e.cancelPendingCommit=null;do Fh();while(cn!==0);if((pe&6)!==0)throw Error($(327));if(t!==null){if(t===e.current)throw Error($(177));if(a=t.lanes|t.childLanes,a|=M0,nT(e,n,a,r,o,l),e===Ce&&(ee=Ce=null,ie=0),So=t,Ea=e,zs=n,Qm=a,jm=s,hS=i,(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?(e.callbackNode=null,e.callbackPriority=0,AA($u,function(){return wS(),null})):(e.callbackNode=null,e.callbackPriority=0),i=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||i){i=Ft.T,Ft.T=null,s=me.p,me.p=2,r=pe,pe|=4;try{gA(e,t,n)}finally{pe=r,me.p=s,Ft.T=i}}cn=1,_S(),bS(),SS()}}function _S(){if(cn===1){cn=0;var e=Ea,t=So,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=Ft.T,Ft.T=null;var i=me.p;me.p=2;var s=pe;pe|=4;try{iS(t,e);var a=i0,r=z_(e.containerInfo),o=a.focusedElem,l=a.selectionRange;if(r!==o&&o&&o.ownerDocument&&B_(o.ownerDocument.documentElement,o)){if(l!==null&&S0(o)){var c=l.start,h=l.end;if(h===void 0&&(h=c),"selectionStart"in o)o.selectionStart=c,o.selectionEnd=Math.min(h,o.value.length);else{var d=o.ownerDocument||document,u=d&&d.defaultView||window;if(u.getSelection){var p=u.getSelection(),m=o.textContent.length,S=Math.min(l.start,m),g=l.end===void 0?S:Math.min(l.end,m);!p.extend&&S>g&&(r=g,g=S,S=r);var f=ex(o,S),v=ex(o,g);if(f&&v&&(p.rangeCount!==1||p.anchorNode!==f.node||p.anchorOffset!==f.offset||p.focusNode!==v.node||p.focusOffset!==v.offset)){var x=d.createRange();x.setStart(f.node,f.offset),p.removeAllRanges(),S>g?(p.addRange(x),p.extend(v.node,v.offset)):(x.setEnd(v.node,v.offset),p.addRange(x))}}}}for(d=[],p=o;p=p.parentNode;)p.nodeType===1&&d.push({element:p,left:p.scrollLeft,top:p.scrollTop});for(typeof o.focus=="function"&&o.focus(),o=0;o<d.length;o++){var y=d[o];y.element.scrollLeft=y.left,y.element.scrollTop=y.top}}Mh=!!n0,i0=n0=null}finally{pe=s,me.p=i,Ft.T=n}}e.current=t,cn=2}}function bS(){if(cn===2){cn=0;var e=Ea,t=So,n=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||n){n=Ft.T,Ft.T=null;var i=me.p;me.p=2;var s=pe;pe|=4;try{jb(e,t.alternate,t)}finally{pe=s,me.p=i,Ft.T=n}}cn=3}}function SS(){if(cn===4||cn===3){cn=0,YE();var e=Ea,t=So,n=zs,i=hS;(t.subtreeFlags&10256)!==0||(t.flags&10256)!==0?cn=5:(cn=0,So=Ea=null,MS(e,e.pendingLanes));var s=e.pendingLanes;if(s===0&&(wa=null),m0(n),t=t.stateNode,oi&&typeof oi.onCommitFiberRoot=="function")try{oi.onCommitFiberRoot(ic,t,void 0,(t.current.flags&128)===128)}catch{}if(i!==null){t=Ft.T,s=me.p,me.p=2,Ft.T=null;try{for(var a=e.onRecoverableError,r=0;r<i.length;r++){var o=i[r];a(o.value,{componentStack:o.stack})}}finally{Ft.T=t,me.p=s}}(zs&3)!==0&&Fh(),ls(e),s=e.pendingLanes,(n&261930)!==0&&(s&42)!==0?e===$m?Hl++:(Hl=0,$m=e):Hl=0,hc(0,!1)}}function MS(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,lc(t)))}function Fh(){return _S(),bS(),SS(),wS()}function wS(){if(cn!==5)return!1;var e=Ea,t=Qm;Qm=0;var n=m0(zs),i=Ft.T,s=me.p;try{me.p=32>n?32:n,Ft.T=null,n=jm,jm=null;var a=Ea,r=zs;if(cn=0,So=Ea=null,zs=0,(pe&6)!==0)throw Error($(331));var o=pe;if(pe|=4,lS(a.current),aS(a,a.current,r,n),pe=o,hc(0,!1),oi&&typeof oi.onPostCommitFiberRoot=="function")try{oi.onPostCommitFiberRoot(ic,a)}catch{}return!0}finally{me.p=s,Ft.T=i,MS(e,t)}}function Ix(e,t,n){t=Ei(n,t),t=qm(e.stateNode,t,2),e=Ma(e,t,2),e!==null&&(ac(e,2),ls(e))}function xe(e,t,n){if(e.tag===3)Ix(e,e,n);else for(;t!==null;){if(t.tag===3){Ix(t,e,n);break}else if(t.tag===1){var i=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof i.componentDidCatch=="function"&&(wa===null||!wa.has(i))){e=Ei(n,e),n=Fb(2),i=Ma(t,n,2),i!==null&&(Hb(n,i,t,e),ac(i,2),ls(i));break}}t=t.return}}function um(e,t,n){var i=e.pingCache;if(i===null){i=e.pingCache=new xA;var s=new Set;i.set(t,s)}else s=i.get(t),s===void 0&&(s=new Set,i.set(t,s));s.has(n)||(K0=!0,s.add(n),e=wA.bind(null,e,t,n),t.then(e,e))}function wA(e,t,n){var i=e.pingCache;i!==null&&i.delete(t),e.pingedLanes|=e.suspendedLanes&n,e.warmLanes&=~n,Ce===e&&(ie&n)===n&&(Ze===4||Ze===3&&(ie&62914560)===ie&&300>ri()-Ph?(pe&2)===0&&Mo(e,0):Q0|=n,bo===ie&&(bo=0)),ls(e)}function ES(e,t){t===0&&(t=g_()),e=Sr(e,t),e!==null&&(ac(e,t),ls(e))}function EA(e){var t=e.memoizedState,n=0;t!==null&&(n=t.retryLane),ES(e,n)}function TA(e,t){var n=0;switch(e.tag){case 31:case 13:var i=e.stateNode,s=e.memoizedState;s!==null&&(n=s.retryLane);break;case 19:i=e.stateNode;break;case 22:i=e.stateNode._retryCache;break;default:throw Error($(314))}i!==null&&i.delete(t),ES(e,n)}function AA(e,t){return d0(e,t)}var gh=null,Zr=null,t0=!1,vh=!1,hm=!1,xa=0;function ls(e){e!==Zr&&e.next===null&&(Zr===null?gh=Zr=e:Zr=Zr.next=e),vh=!0,t0||(t0=!0,RA())}function hc(e,t){if(!hm&&vh){hm=!0;do for(var n=!1,i=gh;i!==null;){if(!t)if(e!==0){var s=i.pendingLanes;if(s===0)var a=0;else{var r=i.suspendedLanes,o=i.pingedLanes;a=(1<<31-li(42|e)+1)-1,a&=s&~(r&~o),a=a&201326741?a&201326741|1:a?a|2:0}a!==0&&(n=!0,Ox(i,a))}else a=ie,a=Eh(i,i===Ce?a:0,i.cancelPendingCommit!==null||i.timeoutHandle!==-1),(a&3)===0||sc(i,a)||(n=!0,Ox(i,a));i=i.next}while(n);hm=!1}}function CA(){TS()}function TS(){vh=t0=!1;var e=0;xa!==0&&BA()&&(e=xa);for(var t=ri(),n=null,i=gh;i!==null;){var s=i.next,a=AS(i,t);a===0?(i.next=null,n===null?gh=s:n.next=s,s===null&&(Zr=n)):(n=i,(e!==0||(a&3)!==0)&&(vh=!0)),i=s}cn!==0&&cn!==5||hc(e,!1),xa!==0&&(xa=0)}function AS(e,t){for(var n=e.suspendedLanes,i=e.pingedLanes,s=e.expirationTimes,a=e.pendingLanes&-62914561;0<a;){var r=31-li(a),o=1<<r,l=s[r];l===-1?((o&n)===0||(o&i)!==0)&&(s[r]=eT(o,t)):l<=t&&(e.expiredLanes|=o),a&=~o}if(t=Ce,n=ie,n=Eh(e,e===t?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i=e.callbackNode,n===0||e===t&&(ye===2||ye===9)||e.cancelPendingCommit!==null)return i!==null&&i!==null&&Hp(i),e.callbackNode=null,e.callbackPriority=0;if((n&3)===0||sc(e,n)){if(t=n&-n,t===e.callbackPriority)return t;switch(i!==null&&Hp(i),m0(n)){case 2:case 8:n=p_;break;case 32:n=$u;break;case 268435456:n=m_;break;default:n=$u}return i=CS.bind(null,e),n=d0(n,i),e.callbackPriority=t,e.callbackNode=n,t}return i!==null&&i!==null&&Hp(i),e.callbackPriority=2,e.callbackNode=null,2}function CS(e,t){if(cn!==0&&cn!==5)return e.callbackNode=null,e.callbackPriority=0,null;var n=e.callbackNode;if(Fh()&&e.callbackNode!==n)return null;var i=ie;return i=Eh(e,e===Ce?i:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),i===0?null:(dS(e,i,t),AS(e,ri()),e.callbackNode!=null&&e.callbackNode===n?CS.bind(null,e):null)}function Ox(e,t){if(Fh())return null;dS(e,t,!0)}function RA(){FA(function(){(pe&6)!==0?d0(d_,CA):TS()})}function $0(){if(xa===0){var e=yo;e===0&&(e=yu,yu<<=1,(yu&261888)===0&&(yu=256)),xa=e}return xa}function Px(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:Pu(""+e)}function Bx(e,t){var n=t.ownerDocument.createElement("input");return n.name=t.name,n.value=t.value,e.id&&n.setAttribute("form",e.id),t.parentNode.insertBefore(n,t),e=new FormData(e),n.parentNode.removeChild(n),e}function NA(e,t,n,i,s){if(t==="submit"&&n&&n.stateNode===s){var a=Px((s[Zn]||null).action),r=i.submitter;r&&(t=(t=r[Zn]||null)?Px(t.formAction):r.getAttribute("formAction"),t!==null&&(a=t,r=null));var o=new Th("action","action",null,i,s);e.push({event:o,listeners:[{instance:null,listener:function(){if(i.defaultPrevented){if(xa!==0){var l=r?Bx(s,r):new FormData(s);Wm(n,{pending:!0,data:l,method:s.method,action:a},null,l)}}else typeof a=="function"&&(o.preventDefault(),l=r?Bx(s,r):new FormData(s),Wm(n,{pending:!0,data:l,method:s.method,action:a},a,l))},currentTarget:s}]})}}for(Nu=0;Nu<Dm.length;Nu++)Lu=Dm[Nu],zx=Lu.toLowerCase(),Fx=Lu[0].toUpperCase()+Lu.slice(1),Hi(zx,"on"+Fx);var Lu,zx,Fx,Nu;Hi(H_,"onAnimationEnd");Hi(V_,"onAnimationIteration");Hi(G_,"onAnimationStart");Hi("dblclick","onDoubleClick");Hi("focusin","onFocus");Hi("focusout","onBlur");Hi(ZT,"onTransitionRun");Hi(JT,"onTransitionStart");Hi(KT,"onTransitionCancel");Hi(k_,"onTransitionEnd");go("onMouseEnter",["mouseout","mouseover"]);go("onMouseLeave",["mouseout","mouseover"]);go("onPointerEnter",["pointerout","pointerover"]);go("onPointerLeave",["pointerout","pointerover"]);xr("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));xr("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));xr("onBeforeInput",["compositionend","keypress","textInput","paste"]);xr("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));xr("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));xr("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ql="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),LA=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Ql));function RS(e,t){t=(t&4)!==0;for(var n=0;n<e.length;n++){var i=e[n],s=i.event;i=i.listeners;t:{var a=void 0;if(t)for(var r=i.length-1;0<=r;r--){var o=i[r],l=o.instance,c=o.currentTarget;if(o=o.listener,l!==a&&s.isPropagationStopped())break t;a=o,s.currentTarget=c;try{a(s)}catch(h){eh(h)}s.currentTarget=null,a=l}else for(r=0;r<i.length;r++){if(o=i[r],l=o.instance,c=o.currentTarget,o=o.listener,l!==a&&s.isPropagationStopped())break t;a=o,s.currentTarget=c;try{a(s)}catch(h){eh(h)}s.currentTarget=null,a=l}}}}function te(e,t){var n=t[wm];n===void 0&&(n=t[wm]=new Set);var i=e+"__bubble";n.has(i)||(NS(t,e,2,!1),n.add(i))}function fm(e,t,n){var i=0;t&&(i|=4),NS(n,e,i,t)}var Du="_reactListening"+Math.random().toString(36).slice(2);function tg(e){if(!e[Du]){e[Du]=!0,b_.forEach(function(n){n!=="selectionchange"&&(LA.has(n)||fm(n,!1,e),fm(n,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Du]||(t[Du]=!0,fm("selectionchange",!1,t))}}function NS(e,t,n,i){switch(kS(t)){case 2:var s=a2;break;case 8:s=r2;break;default:s=sg}n=s.bind(null,t,n,e),s=void 0,!Rm||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(s=!0),i?s!==void 0?e.addEventListener(t,n,{capture:!0,passive:s}):e.addEventListener(t,n,!0):s!==void 0?e.addEventListener(t,n,{passive:s}):e.addEventListener(t,n,!1)}function dm(e,t,n,i,s){var a=i;if((t&1)===0&&(t&2)===0&&i!==null)t:for(;;){if(i===null)return;var r=i.tag;if(r===3||r===4){var o=i.stateNode.containerInfo;if(o===s)break;if(r===4)for(r=i.return;r!==null;){var l=r.tag;if((l===3||l===4)&&r.stateNode.containerInfo===s)return;r=r.return}for(;o!==null;){if(r=Qr(o),r===null)return;if(l=r.tag,l===5||l===6||l===26||l===27){i=a=r;continue t}o=o.parentNode}}i=i.return}R_(function(){var c=a,h=y0(n),d=[];t:{var u=W_.get(e);if(u!==void 0){var p=Th,m=e;switch(e){case"keypress":if(zu(n)===0)break t;case"keydown":case"keyup":p=TT;break;case"focusin":m="focus",p=Xp;break;case"focusout":m="blur",p=Xp;break;case"beforeblur":case"afterblur":p=Xp;break;case"click":if(n.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":p=qy;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":p=pT;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":p=RT;break;case H_:case V_:case G_:p=vT;break;case k_:p=LT;break;case"scroll":case"scrollend":p=fT;break;case"wheel":p=UT;break;case"copy":case"cut":case"paste":p=xT;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":p=Zy;break;case"toggle":case"beforetoggle":p=OT}var S=(t&4)!==0,g=!S&&(e==="scroll"||e==="scrollend"),f=S?u!==null?u+"Capture":null:u;S=[];for(var v=c,x;v!==null;){var y=v;if(x=y.stateNode,y=y.tag,y!==5&&y!==26&&y!==27||x===null||f===null||(y=kl(v,f),y!=null&&S.push(jl(v,y,x))),g)break;v=v.return}0<S.length&&(u=new p(u,m,null,n,h),d.push({event:u,listeners:S}))}}if((t&7)===0){t:{if(u=e==="mouseover"||e==="pointerover",p=e==="mouseout"||e==="pointerout",u&&n!==Cm&&(m=n.relatedTarget||n.fromElement)&&(Qr(m)||m[To]))break t;if((p||u)&&(u=h.window===h?h:(u=h.ownerDocument)?u.defaultView||u.parentWindow:window,p?(m=n.relatedTarget||n.toElement,p=c,m=m?Qr(m):null,m!==null&&(g=nc(m),S=m.tag,m!==g||S!==5&&S!==27&&S!==6)&&(m=null)):(p=null,m=c),p!==m)){if(S=qy,y="onMouseLeave",f="onMouseEnter",v="mouse",(e==="pointerout"||e==="pointerover")&&(S=Zy,y="onPointerLeave",f="onPointerEnter",v="pointer"),g=p==null?u:Tl(p),x=m==null?u:Tl(m),u=new S(y,v+"leave",p,n,h),u.target=g,u.relatedTarget=x,y=null,Qr(h)===c&&(S=new S(f,v+"enter",m,n,h),S.target=x,S.relatedTarget=g,y=S),g=y,p&&m)e:{for(S=DA,f=p,v=m,x=0,y=f;y;y=S(y))x++;y=0;for(var M=v;M;M=S(M))y++;for(;0<x-y;)f=S(f),x--;for(;0<y-x;)v=S(v),y--;for(;x--;){if(f===v||v!==null&&f===v.alternate){S=f;break e}f=S(f),v=S(v)}S=null}else S=null;p!==null&&Hx(d,u,p,S,!1),m!==null&&g!==null&&Hx(d,g,m,S,!0)}}t:{if(u=c?Tl(c):window,p=u.nodeName&&u.nodeName.toLowerCase(),p==="select"||p==="input"&&u.type==="file")var w=jy;else if(Qy(u))if(O_)w=XT;else{w=kT;var E=GT}else p=u.nodeName,!p||p.toLowerCase()!=="input"||u.type!=="checkbox"&&u.type!=="radio"?c&&v0(c.elementType)&&(w=jy):w=WT;if(w&&(w=w(e,c))){I_(d,w,n,h);break t}E&&E(e,u,c),e==="focusout"&&c&&u.type==="number"&&c.memoizedProps.value!=null&&Am(u,"number",u.value)}switch(E=c?Tl(c):window,e){case"focusin":(Qy(E)||E.contentEditable==="true")&&(to=E,Nm=c,Ll=null);break;case"focusout":Ll=Nm=to=null;break;case"mousedown":Lm=!0;break;case"contextmenu":case"mouseup":case"dragend":Lm=!1,nx(d,n,h);break;case"selectionchange":if(YT)break;case"keydown":case"keyup":nx(d,n,h)}var b;if(b0)t:{switch(e){case"compositionstart":var A="onCompositionStart";break t;case"compositionend":A="onCompositionEnd";break t;case"compositionupdate":A="onCompositionUpdate";break t}A=void 0}else $r?D_(e,n)&&(A="onCompositionEnd"):e==="keydown"&&n.keyCode===229&&(A="onCompositionStart");A&&(L_&&n.locale!=="ko"&&($r||A!=="onCompositionStart"?A==="onCompositionEnd"&&$r&&(b=N_()):(ga=h,x0="value"in ga?ga.value:ga.textContent,$r=!0)),E=yh(c,A),0<E.length&&(A=new Yy(A,e,null,n,h),d.push({event:A,listeners:E}),b?A.data=b:(b=U_(n),b!==null&&(A.data=b)))),(b=BT?zT(e,n):FT(e,n))&&(A=yh(c,"onBeforeInput"),0<A.length&&(E=new Yy("onBeforeInput","beforeinput",null,n,h),d.push({event:E,listeners:A}),E.data=b)),NA(d,e,c,n,h)}RS(d,t)})}function jl(e,t,n){return{instance:e,listener:t,currentTarget:n}}function yh(e,t){for(var n=t+"Capture",i=[];e!==null;){var s=e,a=s.stateNode;if(s=s.tag,s!==5&&s!==26&&s!==27||a===null||(s=kl(e,n),s!=null&&i.unshift(jl(e,s,a)),s=kl(e,t),s!=null&&i.push(jl(e,s,a))),e.tag===3)return i;e=e.return}return[]}function DA(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Hx(e,t,n,i,s){for(var a=t._reactName,r=[];n!==null&&n!==i;){var o=n,l=o.alternate,c=o.stateNode;if(o=o.tag,l!==null&&l===i)break;o!==5&&o!==26&&o!==27||c===null||(l=c,s?(c=kl(n,a),c!=null&&r.unshift(jl(n,c,l))):s||(c=kl(n,a),c!=null&&r.push(jl(n,c,l)))),n=n.return}r.length!==0&&e.push({event:t,listeners:r})}var UA=/\r\n?/g,IA=/\u0000|\uFFFD/g;function Vx(e){return(typeof e=="string"?e:""+e).replace(UA,`
`).replace(IA,"")}function LS(e,t){return t=Vx(t),Vx(e)===t}function be(e,t,n,i,s,a){switch(n){case"children":typeof i=="string"?t==="body"||t==="textarea"&&i===""||vo(e,i):(typeof i=="number"||typeof i=="bigint")&&t!=="body"&&vo(e,""+i);break;case"className":bu(e,"class",i);break;case"tabIndex":bu(e,"tabindex",i);break;case"dir":case"role":case"viewBox":case"width":case"height":bu(e,n,i);break;case"style":C_(e,i,a);break;case"data":if(t!=="object"){bu(e,"data",i);break}case"src":case"href":if(i===""&&(t!=="a"||n!=="href")){e.removeAttribute(n);break}if(i==null||typeof i=="function"||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=Pu(""+i),e.setAttribute(n,i);break;case"action":case"formAction":if(typeof i=="function"){e.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof a=="function"&&(n==="formAction"?(t!=="input"&&be(e,t,"name",s.name,s,null),be(e,t,"formEncType",s.formEncType,s,null),be(e,t,"formMethod",s.formMethod,s,null),be(e,t,"formTarget",s.formTarget,s,null)):(be(e,t,"encType",s.encType,s,null),be(e,t,"method",s.method,s,null),be(e,t,"target",s.target,s,null)));if(i==null||typeof i=="symbol"||typeof i=="boolean"){e.removeAttribute(n);break}i=Pu(""+i),e.setAttribute(n,i);break;case"onClick":i!=null&&(e.onclick=Is);break;case"onScroll":i!=null&&te("scroll",e);break;case"onScrollEnd":i!=null&&te("scrollend",e);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error($(61));if(n=i.__html,n!=null){if(s.children!=null)throw Error($(60));e.innerHTML=n}}break;case"multiple":e.multiple=i&&typeof i!="function"&&typeof i!="symbol";break;case"muted":e.muted=i&&typeof i!="function"&&typeof i!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(i==null||typeof i=="function"||typeof i=="boolean"||typeof i=="symbol"){e.removeAttribute("xlink:href");break}n=Pu(""+i),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""+i):e.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":i&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,""):e.removeAttribute(n);break;case"capture":case"download":i===!0?e.setAttribute(n,""):i!==!1&&i!=null&&typeof i!="function"&&typeof i!="symbol"?e.setAttribute(n,i):e.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":i!=null&&typeof i!="function"&&typeof i!="symbol"&&!isNaN(i)&&1<=i?e.setAttribute(n,i):e.removeAttribute(n);break;case"rowSpan":case"start":i==null||typeof i=="function"||typeof i=="symbol"||isNaN(i)?e.removeAttribute(n):e.setAttribute(n,i);break;case"popover":te("beforetoggle",e),te("toggle",e),Ou(e,"popover",i);break;case"xlinkActuate":Ts(e,"http://www.w3.org/1999/xlink","xlink:actuate",i);break;case"xlinkArcrole":Ts(e,"http://www.w3.org/1999/xlink","xlink:arcrole",i);break;case"xlinkRole":Ts(e,"http://www.w3.org/1999/xlink","xlink:role",i);break;case"xlinkShow":Ts(e,"http://www.w3.org/1999/xlink","xlink:show",i);break;case"xlinkTitle":Ts(e,"http://www.w3.org/1999/xlink","xlink:title",i);break;case"xlinkType":Ts(e,"http://www.w3.org/1999/xlink","xlink:type",i);break;case"xmlBase":Ts(e,"http://www.w3.org/XML/1998/namespace","xml:base",i);break;case"xmlLang":Ts(e,"http://www.w3.org/XML/1998/namespace","xml:lang",i);break;case"xmlSpace":Ts(e,"http://www.w3.org/XML/1998/namespace","xml:space",i);break;case"is":Ou(e,"is",i);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=uT.get(n)||n,Ou(e,n,i))}}function e0(e,t,n,i,s,a){switch(n){case"style":C_(e,i,a);break;case"dangerouslySetInnerHTML":if(i!=null){if(typeof i!="object"||!("__html"in i))throw Error($(61));if(n=i.__html,n!=null){if(s.children!=null)throw Error($(60));e.innerHTML=n}}break;case"children":typeof i=="string"?vo(e,i):(typeof i=="number"||typeof i=="bigint")&&vo(e,""+i);break;case"onScroll":i!=null&&te("scroll",e);break;case"onScrollEnd":i!=null&&te("scrollend",e);break;case"onClick":i!=null&&(e.onclick=Is);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!S_.hasOwnProperty(n))t:{if(n[0]==="o"&&n[1]==="n"&&(s=n.endsWith("Capture"),t=n.slice(2,s?n.length-7:void 0),a=e[Zn]||null,a=a!=null?a[n]:null,typeof a=="function"&&e.removeEventListener(t,a,s),typeof i=="function")){typeof a!="function"&&a!==null&&(n in e?e[n]=null:e.hasAttribute(n)&&e.removeAttribute(n)),e.addEventListener(t,i,s);break t}n in e?e[n]=i:i===!0?e.setAttribute(n,""):Ou(e,n,i)}}}function An(e,t,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":te("error",e),te("load",e);var i=!1,s=!1,a;for(a in n)if(n.hasOwnProperty(a)){var r=n[a];if(r!=null)switch(a){case"src":i=!0;break;case"srcSet":s=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error($(137,t));default:be(e,t,a,r,n,null)}}s&&be(e,t,"srcSet",n.srcSet,n,null),i&&be(e,t,"src",n.src,n,null);return;case"input":te("invalid",e);var o=a=r=s=null,l=null,c=null;for(i in n)if(n.hasOwnProperty(i)){var h=n[i];if(h!=null)switch(i){case"name":s=h;break;case"type":r=h;break;case"checked":l=h;break;case"defaultChecked":c=h;break;case"value":a=h;break;case"defaultValue":o=h;break;case"children":case"dangerouslySetInnerHTML":if(h!=null)throw Error($(137,t));break;default:be(e,t,i,h,n,null)}}E_(e,a,o,l,c,r,s,!1);return;case"select":te("invalid",e),i=r=a=null;for(s in n)if(n.hasOwnProperty(s)&&(o=n[s],o!=null))switch(s){case"value":a=o;break;case"defaultValue":r=o;break;case"multiple":i=o;default:be(e,t,s,o,n,null)}t=a,n=r,e.multiple=!!i,t!=null?lo(e,!!i,t,!1):n!=null&&lo(e,!!i,n,!0);return;case"textarea":te("invalid",e),a=s=i=null;for(r in n)if(n.hasOwnProperty(r)&&(o=n[r],o!=null))switch(r){case"value":i=o;break;case"defaultValue":s=o;break;case"children":a=o;break;case"dangerouslySetInnerHTML":if(o!=null)throw Error($(91));break;default:be(e,t,r,o,n,null)}A_(e,i,s,a);return;case"option":for(l in n)n.hasOwnProperty(l)&&(i=n[l],i!=null)&&(l==="selected"?e.selected=i&&typeof i!="function"&&typeof i!="symbol":be(e,t,l,i,n,null));return;case"dialog":te("beforetoggle",e),te("toggle",e),te("cancel",e),te("close",e);break;case"iframe":case"object":te("load",e);break;case"video":case"audio":for(i=0;i<Ql.length;i++)te(Ql[i],e);break;case"image":te("error",e),te("load",e);break;case"details":te("toggle",e);break;case"embed":case"source":case"link":te("error",e),te("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(i=n[c],i!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error($(137,t));default:be(e,t,c,i,n,null)}return;default:if(v0(t)){for(h in n)n.hasOwnProperty(h)&&(i=n[h],i!==void 0&&e0(e,t,h,i,n,void 0));return}}for(o in n)n.hasOwnProperty(o)&&(i=n[o],i!=null&&be(e,t,o,i,n,null))}function OA(e,t,n,i){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var s=null,a=null,r=null,o=null,l=null,c=null,h=null;for(p in n){var d=n[p];if(n.hasOwnProperty(p)&&d!=null)switch(p){case"checked":break;case"value":break;case"defaultValue":l=d;default:i.hasOwnProperty(p)||be(e,t,p,null,i,d)}}for(var u in i){var p=i[u];if(d=n[u],i.hasOwnProperty(u)&&(p!=null||d!=null))switch(u){case"type":a=p;break;case"name":s=p;break;case"checked":c=p;break;case"defaultChecked":h=p;break;case"value":r=p;break;case"defaultValue":o=p;break;case"children":case"dangerouslySetInnerHTML":if(p!=null)throw Error($(137,t));break;default:p!==d&&be(e,t,u,p,i,d)}}Tm(e,r,o,l,c,h,a,s);return;case"select":p=r=o=u=null;for(a in n)if(l=n[a],n.hasOwnProperty(a)&&l!=null)switch(a){case"value":break;case"multiple":p=l;default:i.hasOwnProperty(a)||be(e,t,a,null,i,l)}for(s in i)if(a=i[s],l=n[s],i.hasOwnProperty(s)&&(a!=null||l!=null))switch(s){case"value":u=a;break;case"defaultValue":o=a;break;case"multiple":r=a;default:a!==l&&be(e,t,s,a,i,l)}t=o,n=r,i=p,u!=null?lo(e,!!n,u,!1):!!i!=!!n&&(t!=null?lo(e,!!n,t,!0):lo(e,!!n,n?[]:"",!1));return;case"textarea":p=u=null;for(o in n)if(s=n[o],n.hasOwnProperty(o)&&s!=null&&!i.hasOwnProperty(o))switch(o){case"value":break;case"children":break;default:be(e,t,o,null,i,s)}for(r in i)if(s=i[r],a=n[r],i.hasOwnProperty(r)&&(s!=null||a!=null))switch(r){case"value":u=s;break;case"defaultValue":p=s;break;case"children":break;case"dangerouslySetInnerHTML":if(s!=null)throw Error($(91));break;default:s!==a&&be(e,t,r,s,i,a)}T_(e,u,p);return;case"option":for(var m in n)u=n[m],n.hasOwnProperty(m)&&u!=null&&!i.hasOwnProperty(m)&&(m==="selected"?e.selected=!1:be(e,t,m,null,i,u));for(l in i)u=i[l],p=n[l],i.hasOwnProperty(l)&&u!==p&&(u!=null||p!=null)&&(l==="selected"?e.selected=u&&typeof u!="function"&&typeof u!="symbol":be(e,t,l,u,i,p));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var S in n)u=n[S],n.hasOwnProperty(S)&&u!=null&&!i.hasOwnProperty(S)&&be(e,t,S,null,i,u);for(c in i)if(u=i[c],p=n[c],i.hasOwnProperty(c)&&u!==p&&(u!=null||p!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(u!=null)throw Error($(137,t));break;default:be(e,t,c,u,i,p)}return;default:if(v0(t)){for(var g in n)u=n[g],n.hasOwnProperty(g)&&u!==void 0&&!i.hasOwnProperty(g)&&e0(e,t,g,void 0,i,u);for(h in i)u=i[h],p=n[h],!i.hasOwnProperty(h)||u===p||u===void 0&&p===void 0||e0(e,t,h,u,i,p);return}}for(var f in n)u=n[f],n.hasOwnProperty(f)&&u!=null&&!i.hasOwnProperty(f)&&be(e,t,f,null,i,u);for(d in i)u=i[d],p=n[d],!i.hasOwnProperty(d)||u===p||u==null&&p==null||be(e,t,d,u,i,p)}function Gx(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function PA(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,n=performance.getEntriesByType("resource"),i=0;i<n.length;i++){var s=n[i],a=s.transferSize,r=s.initiatorType,o=s.duration;if(a&&o&&Gx(r)){for(r=0,o=s.responseEnd,i+=1;i<n.length;i++){var l=n[i],c=l.startTime;if(c>o)break;var h=l.transferSize,d=l.initiatorType;h&&Gx(d)&&(l=l.responseEnd,r+=h*(l<o?1:(o-c)/(l-c)))}if(--i,t+=8*(a+r)/(s.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var n0=null,i0=null;function xh(e){return e.nodeType===9?e:e.ownerDocument}function kx(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function DS(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function s0(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var pm=null;function BA(){var e=window.event;return e&&e.type==="popstate"?e===pm?!1:(pm=e,!0):(pm=null,!1)}var US=typeof setTimeout=="function"?setTimeout:void 0,zA=typeof clearTimeout=="function"?clearTimeout:void 0,Wx=typeof Promise=="function"?Promise:void 0,FA=typeof queueMicrotask=="function"?queueMicrotask:typeof Wx!="undefined"?function(e){return Wx.resolve(null).then(e).catch(HA)}:US;function HA(e){setTimeout(function(){throw e})}function Ia(e){return e==="head"}function Xx(e,t){var n=t,i=0;do{var s=n.nextSibling;if(e.removeChild(n),s&&s.nodeType===8)if(n=s.data,n==="/$"||n==="/&"){if(i===0){e.removeChild(s),Eo(t);return}i--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")i++;else if(n==="html")Vl(e.ownerDocument.documentElement);else if(n==="head"){n=e.ownerDocument.head,Vl(n);for(var a=n.firstChild;a;){var r=a.nextSibling,o=a.nodeName;a[rc]||o==="SCRIPT"||o==="STYLE"||o==="LINK"&&a.rel.toLowerCase()==="stylesheet"||n.removeChild(a),a=r}}else n==="body"&&Vl(e.ownerDocument.body);n=s}while(n);Eo(t)}function qx(e,t){var n=e;e=0;do{var i=n.nextSibling;if(n.nodeType===1?t?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(t?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),i&&i.nodeType===8)if(n=i.data,n==="/$"){if(e===0)break;e--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||e++;n=i}while(n)}function a0(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var n=t;switch(t=t.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":a0(n),g0(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}e.removeChild(n)}}function VA(e,t,n,i){for(;e.nodeType===1;){var s=n;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!i&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(i){if(!e[rc])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(a=e.getAttribute("rel"),a==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(a!==s.rel||e.getAttribute("href")!==(s.href==null||s.href===""?null:s.href)||e.getAttribute("crossorigin")!==(s.crossOrigin==null?null:s.crossOrigin)||e.getAttribute("title")!==(s.title==null?null:s.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(a=e.getAttribute("src"),(a!==(s.src==null?null:s.src)||e.getAttribute("type")!==(s.type==null?null:s.type)||e.getAttribute("crossorigin")!==(s.crossOrigin==null?null:s.crossOrigin))&&a&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var a=s.name==null?null:""+s.name;if(s.type==="hidden"&&e.getAttribute("name")===a)return e}else return e;if(e=Ci(e.nextSibling),e===null)break}return null}function GA(e,t,n){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!n||(e=Ci(e.nextSibling),e===null))return null;return e}function IS(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=Ci(e.nextSibling),e===null))return null;return e}function r0(e){return e.data==="$?"||e.data==="$~"}function o0(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function kA(e,t){var n=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||n.readyState!=="loading")t();else{var i=function(){t(),n.removeEventListener("DOMContentLoaded",i)};n.addEventListener("DOMContentLoaded",i),e._reactRetry=i}}function Ci(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var l0=null;function Yx(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="/$"||n==="/&"){if(t===0)return Ci(e.nextSibling);t--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||t++}e=e.nextSibling}return null}function Zx(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var n=e.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(t===0)return e;t--}else n!=="/$"&&n!=="/&"||t++}e=e.previousSibling}return null}function OS(e,t,n){switch(t=xh(n),e){case"html":if(e=t.documentElement,!e)throw Error($(452));return e;case"head":if(e=t.head,!e)throw Error($(453));return e;case"body":if(e=t.body,!e)throw Error($(454));return e;default:throw Error($(451))}}function Vl(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);g0(e)}var Ri=new Map,Jx=new Set;function _h(e){return typeof e.getRootNode=="function"?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var Ws=me.d;me.d={f:WA,r:XA,D:qA,C:YA,L:ZA,m:JA,X:QA,S:KA,M:jA};function WA(){var e=Ws.f(),t=Bh();return e||t}function XA(e){var t=Ao(e);t!==null&&t.tag===5&&t.type==="form"?Cb(t):Ws.r(e)}var Lo=typeof document=="undefined"?null:document;function PS(e,t,n){var i=Lo;if(i&&typeof t=="string"&&t){var s=wi(t);s='link[rel="'+e+'"][href="'+s+'"]',typeof n=="string"&&(s+='[crossorigin="'+n+'"]'),Jx.has(s)||(Jx.add(s),e={rel:e,crossOrigin:n,href:t},i.querySelector(s)===null&&(t=i.createElement("link"),An(t,"link",e),mn(t),i.head.appendChild(t)))}}function qA(e){Ws.D(e),PS("dns-prefetch",e,null)}function YA(e,t){Ws.C(e,t),PS("preconnect",e,t)}function ZA(e,t,n){Ws.L(e,t,n);var i=Lo;if(i&&e&&t){var s='link[rel="preload"][as="'+wi(t)+'"]';t==="image"&&n&&n.imageSrcSet?(s+='[imagesrcset="'+wi(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(s+='[imagesizes="'+wi(n.imageSizes)+'"]')):s+='[href="'+wi(e)+'"]';var a=s;switch(t){case"style":a=wo(e);break;case"script":a=Do(e)}Ri.has(a)||(e=He({rel:"preload",href:t==="image"&&n&&n.imageSrcSet?void 0:e,as:t},n),Ri.set(a,e),i.querySelector(s)!==null||t==="style"&&i.querySelector(fc(a))||t==="script"&&i.querySelector(dc(a))||(t=i.createElement("link"),An(t,"link",e),mn(t),i.head.appendChild(t)))}}function JA(e,t){Ws.m(e,t);var n=Lo;if(n&&e){var i=t&&typeof t.as=="string"?t.as:"script",s='link[rel="modulepreload"][as="'+wi(i)+'"][href="'+wi(e)+'"]',a=s;switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":a=Do(e)}if(!Ri.has(a)&&(e=He({rel:"modulepreload",href:e},t),Ri.set(a,e),n.querySelector(s)===null)){switch(i){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(dc(a)))return}i=n.createElement("link"),An(i,"link",e),mn(i),n.head.appendChild(i)}}}function KA(e,t,n){Ws.S(e,t,n);var i=Lo;if(i&&e){var s=oo(i).hoistableStyles,a=wo(e);t=t||"default";var r=s.get(a);if(!r){var o={loading:0,preload:null};if(r=i.querySelector(fc(a)))o.loading=5;else{e=He({rel:"stylesheet",href:e,"data-precedence":t},n),(n=Ri.get(a))&&eg(e,n);var l=r=i.createElement("link");mn(l),An(l,"link",e),l._p=new Promise(function(c,h){l.onload=c,l.onerror=h}),l.addEventListener("load",function(){o.loading|=1}),l.addEventListener("error",function(){o.loading|=2}),o.loading|=4,qu(r,t,i)}r={type:"stylesheet",instance:r,count:1,state:o},s.set(a,r)}}}function QA(e,t){Ws.X(e,t);var n=Lo;if(n&&e){var i=oo(n).hoistableScripts,s=Do(e),a=i.get(s);a||(a=n.querySelector(dc(s)),a||(e=He({src:e,async:!0},t),(t=Ri.get(s))&&ng(e,t),a=n.createElement("script"),mn(a),An(a,"link",e),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},i.set(s,a))}}function jA(e,t){Ws.M(e,t);var n=Lo;if(n&&e){var i=oo(n).hoistableScripts,s=Do(e),a=i.get(s);a||(a=n.querySelector(dc(s)),a||(e=He({src:e,async:!0,type:"module"},t),(t=Ri.get(s))&&ng(e,t),a=n.createElement("script"),mn(a),An(a,"link",e),n.head.appendChild(a)),a={type:"script",instance:a,count:1,state:null},i.set(s,a))}}function Kx(e,t,n,i){var s=(s=_a.current)?_h(s):null;if(!s)throw Error($(446));switch(e){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(t=wo(n.href),n=oo(s).hoistableStyles,i=n.get(t),i||(i={type:"style",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){e=wo(n.href);var a=oo(s).hoistableStyles,r=a.get(e);if(r||(s=s.ownerDocument||s,r={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},a.set(e,r),(a=s.querySelector(fc(e)))&&!a._p&&(r.instance=a,r.state.loading=5),Ri.has(e)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},Ri.set(e,n),a||$A(s,e,n,r.state))),t&&i===null)throw Error($(528,""));return r}if(t&&i!==null)throw Error($(529,""));return null;case"script":return t=n.async,n=n.src,typeof n=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(t=Do(n),n=oo(s).hoistableScripts,i=n.get(t),i||(i={type:"script",instance:null,count:0,state:null},n.set(t,i)),i):{type:"void",instance:null,count:0,state:null};default:throw Error($(444,e))}}function wo(e){return'href="'+wi(e)+'"'}function fc(e){return'link[rel="stylesheet"]['+e+"]"}function BS(e){return He({},e,{"data-precedence":e.precedence,precedence:null})}function $A(e,t,n,i){e.querySelector('link[rel="preload"][as="style"]['+t+"]")?i.loading=1:(t=e.createElement("link"),i.preload=t,t.addEventListener("load",function(){return i.loading|=1}),t.addEventListener("error",function(){return i.loading|=2}),An(t,"link",n),mn(t),e.head.appendChild(t))}function Do(e){return'[src="'+wi(e)+'"]'}function dc(e){return"script[async]"+e}function Qx(e,t,n){if(t.count++,t.instance===null)switch(t.type){case"style":var i=e.querySelector('style[data-href~="'+wi(n.href)+'"]');if(i)return t.instance=i,mn(i),i;var s=He({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return i=(e.ownerDocument||e).createElement("style"),mn(i),An(i,"style",s),qu(i,n.precedence,e),t.instance=i;case"stylesheet":s=wo(n.href);var a=e.querySelector(fc(s));if(a)return t.state.loading|=4,t.instance=a,mn(a),a;i=BS(n),(s=Ri.get(s))&&eg(i,s),a=(e.ownerDocument||e).createElement("link"),mn(a);var r=a;return r._p=new Promise(function(o,l){r.onload=o,r.onerror=l}),An(a,"link",i),t.state.loading|=4,qu(a,n.precedence,e),t.instance=a;case"script":return a=Do(n.src),(s=e.querySelector(dc(a)))?(t.instance=s,mn(s),s):(i=n,(s=Ri.get(a))&&(i=He({},n),ng(i,s)),e=e.ownerDocument||e,s=e.createElement("script"),mn(s),An(s,"link",i),e.head.appendChild(s),t.instance=s);case"void":return null;default:throw Error($(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(i=t.instance,t.state.loading|=4,qu(i,n.precedence,e));return t.instance}function qu(e,t,n){for(var i=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),s=i.length?i[i.length-1]:null,a=s,r=0;r<i.length;r++){var o=i[r];if(o.dataset.precedence===t)a=o;else if(a!==s)break}a?a.parentNode.insertBefore(e,a.nextSibling):(t=n.nodeType===9?n.head:n,t.insertBefore(e,t.firstChild))}function eg(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function ng(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Yu=null;function jx(e,t,n){if(Yu===null){var i=new Map,s=Yu=new Map;s.set(n,i)}else s=Yu,i=s.get(n),i||(i=new Map,s.set(n,i));if(i.has(e))return i;for(i.set(e,null),n=n.getElementsByTagName(e),s=0;s<n.length;s++){var a=n[s];if(!(a[rc]||a[wn]||e==="link"&&a.getAttribute("rel")==="stylesheet")&&a.namespaceURI!=="http://www.w3.org/2000/svg"){var r=a.getAttribute(t)||"";r=e+r;var o=i.get(r);o?o.push(a):i.set(r,[a])}}return i}function $x(e,t,n){e=e.ownerDocument||e,e.head.insertBefore(n,t==="title"?e.querySelector("head > title"):null)}function t2(e,t,n){if(n===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function zS(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function e2(e,t,n,i){if(n.type==="stylesheet"&&(typeof i.media!="string"||matchMedia(i.media).matches!==!1)&&(n.state.loading&4)===0){if(n.instance===null){var s=wo(i.href),a=t.querySelector(fc(s));if(a){t=a._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=bh.bind(e),t.then(e,e)),n.state.loading|=4,n.instance=a,mn(a);return}a=t.ownerDocument||t,i=BS(i),(s=Ri.get(s))&&eg(i,s),a=a.createElement("link"),mn(a);var r=a;r._p=new Promise(function(o,l){r.onload=o,r.onerror=l}),An(a,"link",i),n.instance=a}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(n,t),(t=n.state.preload)&&(n.state.loading&3)===0&&(e.count++,n=bh.bind(e),t.addEventListener("load",n),t.addEventListener("error",n))}}var mm=0;function n2(e,t){return e.stylesheets&&e.count===0&&Zu(e,e.stylesheets),0<e.count||0<e.imgCount?function(n){var i=setTimeout(function(){if(e.stylesheets&&Zu(e,e.stylesheets),e.unsuspend){var a=e.unsuspend;e.unsuspend=null,a()}},6e4+t);0<e.imgBytes&&mm===0&&(mm=62500*PA());var s=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Zu(e,e.stylesheets),e.unsuspend)){var a=e.unsuspend;e.unsuspend=null,a()}},(e.imgBytes>mm?50:800)+t);return e.unsuspend=n,function(){e.unsuspend=null,clearTimeout(i),clearTimeout(s)}}:null}function bh(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Zu(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var Sh=null;function Zu(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Sh=new Map,t.forEach(i2,e),Sh=null,bh.call(e))}function i2(e,t){if(!(t.state.loading&4)){var n=Sh.get(e);if(n)var i=n.get(null);else{n=new Map,Sh.set(e,n);for(var s=e.querySelectorAll("link[data-precedence],style[data-precedence]"),a=0;a<s.length;a++){var r=s[a];(r.nodeName==="LINK"||r.getAttribute("media")!=="not all")&&(n.set(r.dataset.precedence,r),i=r)}i&&n.set(null,i)}s=t.instance,r=s.getAttribute("data-precedence"),a=n.get(r)||i,a===i&&n.set(null,s),n.set(r,s),this.count++,i=bh.bind(this),s.addEventListener("load",i),s.addEventListener("error",i),a?a.parentNode.insertBefore(s,a.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(s,e.firstChild)),t.state.loading|=4}}var $l={$$typeof:Us,Provider:null,Consumer:null,_currentValue:cr,_currentValue2:cr,_threadCount:0};function s2(e,t,n,i,s,a,r,o,l){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Vp(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Vp(0),this.hiddenUpdates=Vp(null),this.identifierPrefix=i,this.onUncaughtError=s,this.onCaughtError=a,this.onRecoverableError=r,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function FS(e,t,n,i,s,a,r,o,l,c,h,d){return e=new s2(e,t,n,r,l,c,h,d,o),t=1,a===!0&&(t|=24),a=si(3,null,null,t),e.current=a,a.stateNode=e,t=C0(),t.refCount++,e.pooledCache=t,t.refCount++,a.memoizedState={element:i,isDehydrated:n,cache:t},L0(a),e}function HS(e){return e?(e=io,e):io}function VS(e,t,n,i,s,a){s=HS(s),i.context===null?i.context=s:i.pendingContext=s,i=Sa(t),i.payload={element:n},a=a===void 0?null:a,a!==null&&(i.callback=a),n=Ma(e,i,t),n!==null&&(Yn(n,e,t),Ul(n,e,t))}function t_(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var n=e.retryLane;e.retryLane=n!==0&&n<t?n:t}}function ig(e,t){t_(e,t),(e=e.alternate)&&t_(e,t)}function GS(e){if(e.tag===13||e.tag===31){var t=Sr(e,67108864);t!==null&&Yn(t,e,67108864),ig(e,67108864)}}function e_(e){if(e.tag===13||e.tag===31){var t=ci();t=p0(t);var n=Sr(e,t);n!==null&&Yn(n,e,t),ig(e,t)}}var Mh=!0;function a2(e,t,n,i){var s=Ft.T;Ft.T=null;var a=me.p;try{me.p=2,sg(e,t,n,i)}finally{me.p=a,Ft.T=s}}function r2(e,t,n,i){var s=Ft.T;Ft.T=null;var a=me.p;try{me.p=8,sg(e,t,n,i)}finally{me.p=a,Ft.T=s}}function sg(e,t,n,i){if(Mh){var s=c0(i);if(s===null)dm(e,t,i,wh,n),n_(e,i);else if(l2(s,e,t,n,i))i.stopPropagation();else if(n_(e,i),t&4&&-1<o2.indexOf(e)){for(;s!==null;){var a=Ao(s);if(a!==null)switch(a.tag){case 3:if(a=a.stateNode,a.current.memoizedState.isDehydrated){var r=rr(a.pendingLanes);if(r!==0){var o=a;for(o.pendingLanes|=2,o.entangledLanes|=2;r;){var l=1<<31-li(r);o.entanglements[1]|=l,r&=~l}ls(a),(pe&6)===0&&(dh=ri()+500,hc(0,!1))}}break;case 31:case 13:o=Sr(a,2),o!==null&&Yn(o,a,2),Bh(),ig(a,2)}if(a=c0(i),a===null&&dm(e,t,i,wh,n),a===s)break;s=a}s!==null&&i.stopPropagation()}else dm(e,t,i,null,n)}}function c0(e){return e=y0(e),ag(e)}var wh=null;function ag(e){if(wh=null,e=Qr(e),e!==null){var t=nc(e);if(t===null)e=null;else{var n=t.tag;if(n===13){if(e=l_(t),e!==null)return e;e=null}else if(n===31){if(e=c_(t),e!==null)return e;e=null}else if(n===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return wh=e,null}function kS(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(ZE()){case d_:return 2;case p_:return 8;case $u:case JE:return 32;case m_:return 268435456;default:return 32}default:return 32}}var u0=!1,Ta=null,Aa=null,Ca=null,tc=new Map,ec=new Map,pa=[],o2="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function n_(e,t){switch(e){case"focusin":case"focusout":Ta=null;break;case"dragenter":case"dragleave":Aa=null;break;case"mouseover":case"mouseout":Ca=null;break;case"pointerover":case"pointerout":tc.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":ec.delete(t.pointerId)}}function Sl(e,t,n,i,s,a){return e===null||e.nativeEvent!==a?(e={blockedOn:t,domEventName:n,eventSystemFlags:i,nativeEvent:a,targetContainers:[s]},t!==null&&(t=Ao(t),t!==null&&GS(t)),e):(e.eventSystemFlags|=i,t=e.targetContainers,s!==null&&t.indexOf(s)===-1&&t.push(s),e)}function l2(e,t,n,i,s){switch(t){case"focusin":return Ta=Sl(Ta,e,t,n,i,s),!0;case"dragenter":return Aa=Sl(Aa,e,t,n,i,s),!0;case"mouseover":return Ca=Sl(Ca,e,t,n,i,s),!0;case"pointerover":var a=s.pointerId;return tc.set(a,Sl(tc.get(a)||null,e,t,n,i,s)),!0;case"gotpointercapture":return a=s.pointerId,ec.set(a,Sl(ec.get(a)||null,e,t,n,i,s)),!0}return!1}function WS(e){var t=Qr(e.target);if(t!==null){var n=nc(t);if(n!==null){if(t=n.tag,t===13){if(t=l_(n),t!==null){e.blockedOn=t,Fy(e.priority,function(){e_(n)});return}}else if(t===31){if(t=c_(n),t!==null){e.blockedOn=t,Fy(e.priority,function(){e_(n)});return}}else if(t===3&&n.stateNode.current.memoizedState.isDehydrated){e.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Ju(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var n=c0(e.nativeEvent);if(n===null){n=e.nativeEvent;var i=new n.constructor(n.type,n);Cm=i,n.target.dispatchEvent(i),Cm=null}else return t=Ao(n),t!==null&&GS(t),e.blockedOn=n,!1;t.shift()}return!0}function i_(e,t,n){Ju(e)&&n.delete(t)}function c2(){u0=!1,Ta!==null&&Ju(Ta)&&(Ta=null),Aa!==null&&Ju(Aa)&&(Aa=null),Ca!==null&&Ju(Ca)&&(Ca=null),tc.forEach(i_),ec.forEach(i_)}function Uu(e,t){e.blockedOn===t&&(e.blockedOn=null,u0||(u0=!0,un.unstable_scheduleCallback(un.unstable_NormalPriority,c2)))}var Iu=null;function s_(e){Iu!==e&&(Iu=e,un.unstable_scheduleCallback(un.unstable_NormalPriority,function(){Iu===e&&(Iu=null);for(var t=0;t<e.length;t+=3){var n=e[t],i=e[t+1],s=e[t+2];if(typeof i!="function"){if(ag(i||n)===null)continue;break}var a=Ao(n);a!==null&&(e.splice(t,3),t-=3,Wm(a,{pending:!0,data:s,method:n.method,action:i},i,s))}}))}function Eo(e){function t(l){return Uu(l,e)}Ta!==null&&Uu(Ta,e),Aa!==null&&Uu(Aa,e),Ca!==null&&Uu(Ca,e),tc.forEach(t),ec.forEach(t);for(var n=0;n<pa.length;n++){var i=pa[n];i.blockedOn===e&&(i.blockedOn=null)}for(;0<pa.length&&(n=pa[0],n.blockedOn===null);)WS(n),n.blockedOn===null&&pa.shift();if(n=(e.ownerDocument||e).$$reactFormReplay,n!=null)for(i=0;i<n.length;i+=3){var s=n[i],a=n[i+1],r=s[Zn]||null;if(typeof a=="function")r||s_(n);else if(r){var o=null;if(a&&a.hasAttribute("formAction")){if(s=a,r=a[Zn]||null)o=r.formAction;else if(ag(s)!==null)continue}else o=r.action;typeof o=="function"?n[i+1]=o:(n.splice(i,3),i-=3),s_(n)}}}function XS(){function e(a){a.canIntercept&&a.info==="react-transition"&&a.intercept({handler:function(){return new Promise(function(r){return s=r})},focusReset:"manual",scroll:"manual"})}function t(){s!==null&&(s(),s=null),i||setTimeout(n,20)}function n(){if(!i&&!navigation.transition){var a=navigation.currentEntry;a&&a.url!=null&&navigation.navigate(a.url,{state:a.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var i=!1,s=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(n,100),function(){i=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),s!==null&&(s(),s=null)}}}function rg(e){this._internalRoot=e}Hh.prototype.render=rg.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error($(409));var n=t.current,i=ci();VS(n,i,e,t,null,null)};Hh.prototype.unmount=rg.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;VS(e.current,2,null,e,null,null),Bh(),t[To]=null}};function Hh(e){this._internalRoot=e}Hh.prototype.unstable_scheduleHydration=function(e){if(e){var t=__();e={blockedOn:null,target:e,priority:t};for(var n=0;n<pa.length&&t!==0&&t<pa[n].priority;n++);pa.splice(n,0,e),n===0&&WS(e)}};var a_=r_.version;if(a_!=="19.2.8")throw Error($(527,a_,"19.2.8"));me.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error($(188)):(e=Object.keys(e).join(","),Error($(268,e)));return e=VE(t),e=e!==null?u_(e):null,e=e===null?null:e.stateNode,e};var u2={bundleType:0,version:"19.2.8",rendererPackageName:"react-dom",currentDispatcherRef:Ft,reconcilerVersion:"19.2.8"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__!="undefined"&&(Ml=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Ml.isDisabled&&Ml.supportsFiber))try{ic=Ml.inject(u2),oi=Ml}catch{}var Ml;Vh.createRoot=function(e,t){if(!o_(e))throw Error($(299));var n=!1,i="",s=Pb,a=Bb,r=zb;return t!=null&&(t.unstable_strictMode===!0&&(n=!0),t.identifierPrefix!==void 0&&(i=t.identifierPrefix),t.onUncaughtError!==void 0&&(s=t.onUncaughtError),t.onCaughtError!==void 0&&(a=t.onCaughtError),t.onRecoverableError!==void 0&&(r=t.onRecoverableError)),t=FS(e,1,!1,null,null,n,i,null,s,a,r,XS),e[To]=t.current,tg(e),new rg(t)};Vh.hydrateRoot=function(e,t,n){if(!o_(e))throw Error($(299));var i=!1,s="",a=Pb,r=Bb,o=zb,l=null;return n!=null&&(n.unstable_strictMode===!0&&(i=!0),n.identifierPrefix!==void 0&&(s=n.identifierPrefix),n.onUncaughtError!==void 0&&(a=n.onUncaughtError),n.onCaughtError!==void 0&&(r=n.onCaughtError),n.onRecoverableError!==void 0&&(o=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),t=FS(e,1,!0,t,n!=null?n:null,i,s,l,a,r,o,XS),t.context=HS(null),n=t.current,i=ci(),i=p0(i),s=Sa(i),s.callback=null,Ma(n,s,i),n=i,t.current.lanes=n,ac(t,n),ls(t),e[To]=t.current,tg(e),new Hh(t)};Vh.version="19.2.8"});var JS=es((iU,ZS)=>{"use strict";function YS(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__=="undefined"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(YS)}catch(e){console.error(e)}}YS(),ZS.exports=qS()});var e1=es(qh=>{"use strict";var h2=Symbol.for("react.transitional.element"),f2=Symbol.for("react.fragment");function t1(e,t,n){var i=null;if(n!==void 0&&(i=""+n),t.key!==void 0&&(i=""+t.key),"key"in t){n={};for(var s in t)s!=="key"&&(n[s]=t[s])}else n=t;return t=n.ref,{$$typeof:h2,type:e,key:i,ref:t!==void 0?t:null,props:n}}qh.Fragment=f2;qh.jsx=t1;qh.jsxs=t1});var Re=es((fU,n1)=>{"use strict";n1.exports=e1()});var sE=Yt(JS());var Qi=Yt(Sn());var hg=Yt(Sn());var pc="story-autoscroll",KS='<svg class="i-pause" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="3.4" height="12" rx="1"/><rect x="9.6" y="2" width="3.4" height="12" rx="1"/></svg><svg class="i-play" viewBox="0 0 16 16" fill="currentColor"><path d="M4.6 2.7c0-.8.9-1.3 1.6-.9l7 4.6c.6.4.6 1.3 0 1.7l-7 4.6c-.7.4-1.6-.1-1.6-.9z"/></svg>',QS=`
.nd-dock{--nd-accent:#171717;--nd-on-accent:#fff;--nd-fg:#171717;--nd-bg:rgba(255,255,255,.9);--nd-border:rgba(0,0,0,.12);--nd-shadow:0 6px 24px rgba(0,0,0,.14);position:fixed;right:16px;bottom:16px;bottom:max(16px,env(safe-area-inset-bottom));z-index:40;display:flex;align-items:center;gap:8px;font-family:inherit;font-size:13px;line-height:1;color:var(--nd-fg);-webkit-font-smoothing:antialiased}
.nd-dock.nd-gated{display:none}
.nd-dock *{box-sizing:border-box}
.nd-dock button{font:inherit;color:inherit;margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
.nd-pause,.nd-auto{display:inline-flex;align-items:center;gap:8px;height:40px;border:1px solid var(--nd-border);border-radius:999px;background:var(--nd-bg);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:var(--nd-shadow);font-weight:600;white-space:nowrap;transition:transform .18s cubic-bezier(.3,.7,.4,1),background .2s,border-color .2s,color .2s,box-shadow .2s}
.nd-pause{padding:0 16px 0 6px}
.nd-auto{padding:0 14px 0 11px}
.nd-pause:hover,.nd-auto:hover{transform:translateY(-1px);border-color:var(--nd-accent)}
.nd-pause:active,.nd-auto:active{transform:scale(.96)}
.nd-pause:focus-visible,.nd-auto:focus-visible{outline:2px solid var(--nd-accent);outline-offset:3px}
.nd-icon{display:grid;place-items:center;flex-shrink:0;width:28px;height:28px;border-radius:50%;background:var(--nd-accent);color:var(--nd-on-accent);transition:transform .2s cubic-bezier(.3,.7,.4,1),background .2s,color .2s}
.nd-pause:hover .nd-icon{transform:scale(1.08)}
.nd-icon svg{display:block;width:14px;height:14px}
.nd-icon .i-play{display:none;margin-left:1px}
.nd-dock[data-paused=true] .i-pause{display:none}
.nd-dock[data-paused=true] .i-play{display:block}
.nd-track{position:relative;flex-shrink:0;width:28px;height:16px;border-radius:999px;background:rgba(127,127,127,.45);transition:background .2s}
.nd-thumb{position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.35);transition:transform .2s cubic-bezier(.3,.7,.4,1),background .2s}
.nd-auto[aria-checked=true] .nd-track{background:var(--nd-accent)}
.nd-auto[aria-checked=true] .nd-thumb{transform:translateX(12px);background:var(--nd-on-accent)}

.nd-dark{--nd-accent:#fff;--nd-on-accent:#05070d;--nd-fg:#fff;--nd-bg:rgba(10,12,20,.72);--nd-border:rgba(255,255,255,.18);--nd-shadow:0 6px 28px rgba(0,0,0,.5)}

.nd-voyage{--nd-accent:var(--vg-accent,#F28C51);--nd-on-accent:#0a0614;--nd-fg:#fff;--nd-bg:rgba(10,6,20,.6);--nd-shadow:none;gap:6px}
.nd-voyage .nd-pause,.nd-voyage .nd-auto{border-radius:0;border-color:var(--nd-accent);font-size:12px;letter-spacing:.1em;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));box-shadow:none}
.nd-voyage .nd-pause{padding:0 18px 0 12px}
.nd-voyage .nd-auto{padding:0 16px 0 12px}
.nd-voyage .nd-pause:hover,.nd-voyage .nd-auto:hover{transform:none;background:var(--nd-accent);color:var(--nd-on-accent)}
.nd-voyage .nd-pause:focus-visible,.nd-voyage .nd-auto:focus-visible{outline:2px solid #fff;outline-offset:-5px}
.nd-voyage .nd-icon{width:16px;height:16px;border-radius:0;background:none;color:var(--nd-accent)}
.nd-voyage .nd-icon svg{width:14px;height:14px}
.nd-voyage .nd-pause:hover .nd-icon{transform:none;color:var(--nd-on-accent)}
.nd-voyage .nd-track{border-radius:0;background:rgba(255,255,255,.22)}
.nd-voyage .nd-thumb{border-radius:0}
.nd-voyage .nd-auto:hover .nd-track{background:rgba(10,6,20,.35)}
.nd-voyage .nd-auto[aria-checked=true] .nd-track{background:var(--nd-accent)}
.nd-voyage .nd-auto[aria-checked=true]:hover .nd-track{background:var(--nd-on-accent)}
.nd-voyage .nd-auto[aria-checked=true]:hover .nd-thumb{background:var(--nd-accent)}
@media(max-width:360px){.nd-voyage .nd-label{display:none}.nd-voyage .nd-pause{padding:0 12px}}
@media(prefers-reduced-motion:reduce){.nd-pause,.nd-auto,.nd-icon,.nd-track,.nd-thumb{transition:none}}
`;var aU=`
var ndDock = document.getElementById('narration-dock');
var ndPause = document.getElementById('narration-toggle');
var ndAuto = document.getElementById('autoscroll-toggle');
var ndAutoOn = true;
try { if (window.localStorage.getItem('${pc}') === '0') ndAutoOn = false; } catch (e) {}
var ndTween = null;
var ndSnapRestore = null;

function ndSync(paused) {
  if (ndDock) ndDock.setAttribute('data-paused', paused ? 'true' : 'false');
  if (ndPause) {
    ndPause.setAttribute('aria-label', paused ? 'Play narration' : 'Pause narration');
    var label = ndPause.querySelector('.nd-label');
    if (label) label.textContent = paused ? 'Play' : 'Pause';
  }
  if (ndAuto) ndAuto.setAttribute('aria-checked', ndAutoOn ? 'true' : 'false');
}
function ndShow() { if (ndDock) ndDock.classList.remove('nd-gated'); }
if (ndAuto) {
  ndAuto.addEventListener('click', function() {
    ndAutoOn = !ndAutoOn;
    try { window.localStorage.setItem('${pc}', ndAutoOn ? '1' : '0'); } catch (e) {}
    ndAuto.setAttribute('aria-checked', ndAutoOn ? 'true' : 'false');
  });
}

// Scroll position that brings a section into view: its top, or centred when it
// is shorter than the viewport (so a short card does not leave its neighbour
// under the viewport centre, which is where the scroll triggers fire).
function ndSectionTarget(el) {
  var rect = el.getBoundingClientRect();
  var top = rect.top + window.pageYOffset;
  var vh = window.innerHeight;
  var y = rect.height < vh ? top - (vh - rect.height) / 2 : top;
  return Math.max(0, Math.min(y, document.documentElement.scrollHeight - vh));
}
function ndStopScroll() {
  if (ndTween) { ndTween.kill(); ndTween = null; }
  if (ndSnapRestore) { ndSnapRestore(); ndSnapRestore = null; }
}
// Smooth ease-in-out scroll (about a second). A gsap tween rather than
// scrollTo({behavior:'smooth'}): the duration is predictable and it never
// fights scroll-snap, which is switched off while the tween runs.
function ndScrollTo(y) {
  ndStopScroll();
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || Math.abs(y - window.pageYOffset) < 2) { window.scrollTo(0, y); return; }
  var root = document.documentElement;
  var prevSnap = root.style.scrollSnapType;
  root.style.scrollSnapType = 'none';
  ndSnapRestore = function() { root.style.scrollSnapType = prevSnap; };
  var proxy = { y: window.pageYOffset };
  ndTween = gsap.to(proxy, {
    y: y, duration: 1, ease: 'power2.inOut',
    onUpdate: function() { window.scrollTo(0, proxy.y); },
    onComplete: function() { ndTween = null; if (ndSnapRestore) { ndSnapRestore(); ndSnapRestore = null; } }
  });
}
// The reader taking over cancels the automatic scroll.
['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function(type) {
  window.addEventListener(type, ndStopScroll, { passive: true });
});
`;var Gh=!1,og=new Set;function mc(){return Gh}function kh(e){Gh=e,typeof document!="undefined"&&(Gh?document.querySelectorAll("audio, video").forEach(t=>{let n=t;n.paused||(n.dataset.wasPlayingBeforePause="1"),n.pause()}):document.querySelectorAll("audio, video").forEach(t=>{let n=t;n.dataset.wasPlayingBeforePause==="1"&&(delete n.dataset.wasPlayingBeforePause,n.play().catch(()=>{}))}),og.forEach(t=>t(Gh)))}function Wh(e){return og.add(e),()=>og.delete(e)}var lg=!0,cg=!1,ug=new Set;function Xh(){if(!cg&&typeof window!="undefined"){cg=!0;try{window.localStorage.getItem(pc)==="0"&&(lg=!1)}catch{}}return lg}function jS(e){lg=e,cg=!0;try{window.localStorage.setItem(pc,e?"1":"0")}catch{}ug.forEach(t=>t(e))}function $S(e){return ug.add(e),()=>ug.delete(e)}var Vi=Yt(Re());function i1({theme:e}){let t=(0,hg.useSyncExternalStore)(Wh,mc,()=>!1),n=(0,hg.useSyncExternalStore)($S,Xh,()=>!0),i={};return e.variant!=="voyage"&&e.accent&&(i["--nd-accent"]=e.accent),e.variant==="dark"&&e.border&&(i["--nd-border"]=e.border),(0,Vi.jsxs)("div",{className:`nd-dock nd-${e.variant}`,"data-paused":t,style:i,children:[(0,Vi.jsx)("style",{children:QS}),(0,Vi.jsxs)("button",{type:"button",className:"nd-pause","aria-label":t?"Play narration":"Pause narration",onClick:()=>kh(!t),children:[(0,Vi.jsx)("span",{className:"nd-icon","aria-hidden":"true",dangerouslySetInnerHTML:{__html:KS}}),(0,Vi.jsx)("span",{className:"nd-label",children:t?"Play":"Pause"})]}),(0,Vi.jsxs)("button",{type:"button",className:"nd-auto",role:"switch","aria-checked":n,onClick:()=>jS(!n),children:[(0,Vi.jsx)("span",{className:"nd-track","aria-hidden":"true",children:(0,Vi.jsx)("span",{className:"nd-thumb"})}),(0,Vi.jsx)("span",{children:"Auto-scroll"})]})]})}function a1(e,t){let n=/^#\/chapter-(\d+)\/?$/.exec(e);if(!n)return null;let i=Number(n[1])-1;return i>=0&&i<t?i:null}function d2(e){let t=e>>>0;return()=>{t=t+1831565813>>>0;let n=t;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}var s1=new Map;function r1(e,t,n=1600,i=1040){let s=`${e}|${t}|${n}|${i}`,a=s1.get(s);if(a)return a;let r=d2(Math.round(e*1e3)+t*7919),o=n,l=i,c=Math.min(o,l),h=(e+38)%360,d=(e+330)%360,u=[];u.push(`<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${e} 55% 14%)"/><stop offset="0.55" stop-color="hsl(${e} 60% 26%)"/><stop offset="1" stop-color="hsl(${h} 65% 38%)"/></linearGradient><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${Math.round(c*.07)}"/></filter></defs>`),u.push(`<rect width="${o}" height="${l}" fill="url(#g)"/>`),u.push('<g filter="url(#b)">');let p=5;for(let E=0;E<p;E++){let b=Math.round(o*(.1+r()*.8)),A=Math.round(l*(.1+r()*.8)),R=Math.round(c*(.16+r()*.24)),N=E%3===0?d:E%3===1?h:e,I=52+Math.round(r()*22);u.push(`<circle cx="${b}" cy="${A}" r="${R}" fill="hsl(${N} 90% ${I}%)" opacity="${(.4+r()*.35).toFixed(2)}"/>`)}u.push("</g>");let m=Math.round(o*(.3+r()*.4)),S=Math.round(l*(.3+r()*.4));for(let E=1;E<=4;E++){let b=Math.round(c*(.1+E*.1+r()*.03));u.push(`<circle cx="${m}" cy="${S}" r="${b}" fill="none" stroke="hsl(${e} 100% 92%)" stroke-opacity="${(.34-E*.06).toFixed(2)}" stroke-width="${Math.max(2,Math.round(c*.003))}"/>`)}let g=Math.round(l*(.2+r()*.6));u.push(`<path d="M0 ${g} L${o} ${Math.round(g-l*.35)} L${o} ${Math.round(g-l*.2)} L0 ${Math.round(g+l*.15)} Z" fill="hsl(${d} 100% 90%)" opacity="0.08"/>`);let f=Math.round(c/6),v=Math.max(7,Math.round(c*.012)),x=Math.max(2,Math.round(c*.0025)),y=[];for(let E=f/2;E<o;E+=f)for(let b=f/2;b<l;b+=f){if(r()>.34)continue;let A=Math.round(E),R=Math.round(b);y.push(`M${A-v} ${R}H${A+v}M${A} ${R-v}V${R+v}`)}u.push(`<path d="${y.join("")}" fill="none" stroke="hsl(${e} 100% 96%)" stroke-opacity="0.5" stroke-width="${x}" stroke-linecap="round"/>`),u.push(`<rect width="${o}" height="${l}" fill="hsl(${e} 60% 6%)" opacity="0.18"/>`);let M=`<svg xmlns="http://www.w3.org/2000/svg" width="${o}" height="${l}" viewBox="0 0 ${o} ${l}">${u.join("")}</svg>`,w=`data:image/svg+xml;utf8,${encodeURIComponent(M)}`;return s1.set(s,w),w}function o1(e){var t;return(t=e.image)!=null?t:r1(e.hue,e.seed,e.width,e.height)}function Oa(e){var t;return(t=e.imageUrl)!=null?t:r1(e.hue,e.index*7+1,1600,1040)}var l1=`
.sc-root {
  --sc-off-white: #f0f1fa;
  --sc-dark-white: #e4e6ef;
  --sc-black: #000;
  --sc-blue: #1a2ffb;
  --sc-dark-blue: #071bdf;
  --sc-grey-blue: #2b2e3a;
  --sc-green: #c1ff00;
  --sc-red: #ff4c41;
  --sc-purple: #8832f7;
  --sc-radius: 20px;
  --sc-grid-gap: 2vw;
  --sc-pad-x: max(5vw, 40px);
  --sc-pad-y: clamp(30px, 4vw, 50px);
  --sc-header-size: clamp(1rem, 1vw, 2rem);
  --sc-cross-size: clamp(0.875rem, 1vw, 2rem);
  font-family: var(--sc-font-sans), ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* chapter tile <-> chapter page: words and neighbouring tiles leave, page content arrives */
.fw-head,
.fw-foot {
  transition: opacity 0.7s ease, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
.fw-main {
  transition: opacity 0.8s ease, transform 1s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s ease;
}
html.pt-leaving .fw-head,
html.pt-leaving .fw-foot {
  opacity: 0;
  transform: translate3d(-4vw, -28px, 0);
}
html.pt-leaving .fw-row[data-col="0"]:not([data-pt-active]) .fw-main {
  opacity: 0;
  transform: translate3d(-9vw, 0, 0) scale(0.96);
  filter: blur(4px);
}
html.pt-leaving .fw-row[data-col="1"]:not([data-pt-active]) .fw-main {
  opacity: 0;
  transform: translate3d(9vw, 0, 0) scale(0.96);
  filter: blur(4px);
}
/* arriving from a tile: hold the page content until the picture lands */
.pd-fx {
  transition: opacity 1s ease var(--pd-d, 0s), transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) var(--pd-d, 0s);
}
.pd-fade {
  transition: opacity 1s ease var(--pd-d, 0s);
}
html[data-pt-hold] .pd-fx {
  opacity: 0;
  transform: translate3d(0, 32px, 0);
}
html[data-pt-hold] .pd-fade {
  opacity: 0;
}
/* arriving on the grid from Back: keep the tiles static under the overlay */
html[data-pt-back] .fw-row,
html[data-pt-back] .fw-media {
  transition: none !important;
  opacity: 1 !important;
  transform: none !important;
  clip-path: inset(0 round 15px) !important;
}

/* menu links scale with the number of chapters */
.sc-menu-link { font-size: var(--sc-menu-size, 4vw); }
@media (max-width: 767px) {
  .sc-menu-link { font-size: var(--sc-menu-size-m, 8vw); }
}

/* narration text: words light up as the audio plays */
.sc-text[data-audio] .sc-word { opacity: 0.45; transition: opacity 0.3s ease; }
.sc-text[data-audio] .sc-word.on { opacity: 1; }

/* the shared narration dock, dressed like the template's pills */
.sc-root .nd-dock {
  --nd-accent: #c1ff00;
  --nd-on-accent: #05060d;
  --nd-fg: #f0f1fa;
  --nd-bg: #2b2e3a;
  --nd-border: transparent;
  --nd-shadow: 0 6px 24px rgba(5, 6, 13, 0.28);
  font-family: var(--sc-font-sans), ui-sans-serif, system-ui, sans-serif;
}
.sc-root .nd-pause,
.sc-root .nd-auto {
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  height: 3.2em;
  font-size: 0.8125rem;
}
.sc-root .nd-pause:hover,
.sc-root .nd-auto:hover {
  background: #1a2ffb;
  border-color: #1a2ffb;
  transform: none;
}
.sc-root .nd-track { background: rgba(240, 241, 250, 0.3); }
.sc-root .nd-auto:hover .nd-track { background: rgba(240, 241, 250, 0.4); }
.sc-root .nd-auto[aria-checked=true] .nd-thumb { background: var(--nd-on-accent); }
.sc-root .nd-dock { z-index: 60; }

@media (prefers-reduced-motion: reduce) {
  .fw-head, .fw-foot, .fw-main, .pd-fx, .pd-fade { transition: none; }
  .sc-text[data-audio] .sc-word { transition: none; }
}
`;var Ln=Yt(Sn());var Yh=Yt(Sn()),c1=(0,Yh.createContext)(null),u1=c1.Provider;function zn(){let e=(0,Yh.useContext)(c1);if(!e)throw new Error("useShowcase must be used inside the Showcase template.");return e}var p2="cubic-bezier(0.65, 0, 0.35, 1)",h1="cubic-bezier(0.7, 0, 0.2, 1)",f1="cubic-bezier(0.16, 1, 0.3, 1)",cs={lift:650,zoom:800,settle:900,bgFade:550,pushAt:450},vn=null;function d1(){return window.matchMedia("(prefers-reduced-motion: reduce)").matches}var Zh=e=>`translate3d(${e.x.toFixed(2)}px, ${e.y.toFixed(2)}px, 0) scale(${e.s.toFixed(4)})`;function p1(e,t,n){return{x:(window.innerWidth-e*n)/2,y:(window.innerHeight-t*n)/2,s:n}}function m2(e,t){let n=Math.max(window.innerWidth/e,window.innerHeight/t)*1.04;return p1(e,t,n)}function gc(e,t,n,i,s,a=0,r){let o=r!=null?r:n.s>4?0:15,l=[{transform:Zh(t),borderRadius:`${15/t.s}px`,filter:"blur(0px)"},{transform:Zh(n),borderRadius:`${o/n.s}px`,filter:"blur(0px)"}];a>0&&l.splice(1,0,{offset:.5,filter:`blur(${a}px)`});let c=e.animate(l,{duration:i,easing:s,fill:"forwards"});return Promise.race([c.finished.then(()=>{}),vc(i+250)]).then(()=>{e.style.transform=Zh(n),e.style.borderRadius=`${o/n.s}px`,c.cancel()})}function vc(e){return new Promise(t=>window.setTimeout(t,e))}function m1(e,t,n,i,s,a){let r=document.createElement("div");r.setAttribute("data-pt-overlay",""),r.style.cssText="position:fixed;inset:0;z-index:200;overflow:hidden;pointer-events:auto;";let o=document.createElement("div");o.style.cssText=`position:absolute;inset:0;background:${i};opacity:${a};`;let l=document.createElement("div");l.style.cssText=`position:absolute;left:0;top:0;width:${s.width}px;height:${s.height}px;transform-origin:0 0;overflow:hidden;will-change:transform;border-radius:15px;`,l.style.transform=Zh({x:s.left,y:s.top,s:1});let c=document.createElement("img");c.src=n,c.alt="",c.draggable=!1,c.style.cssText="display:block;width:100%;height:100%;object-fit:cover;",l.appendChild(c),r.append(o,l),document.body.appendChild(r);let h={mode:e,slug:t,overlay:r,bgEl:o,box:l,w0:s.width,h0:s.height,cover:m2(s.width,s.height),covered:!1,target:null,timer:0,failSafe:0};return h.failSafe=window.setTimeout(()=>Jh(h),12e3),h}function Jh(e){window.clearTimeout(e.failSafe),window.clearTimeout(e.timer),e.target&&(e.target.style.visibility=""),e.overlay.remove();let t=document.documentElement;t.classList.remove("pt-leaving"),t.removeAttribute("data-pt-hold"),t.removeAttribute("data-pt-back"),t.removeAttribute("data-pt-busy"),vn===e&&(vn=null)}function g1(e){if(vn||d1())return!1;let t=e.media.getBoundingClientRect();if(t.width<10||t.height<10)return!1;let n=m1("open",e.slug,e.src,e.bg,t,0);vn=n,e.router.prefetch(e.href);let i=document.documentElement;i.classList.add("pt-leaving"),i.setAttribute("data-pt-busy","1"),e.row.setAttribute("data-pt-active",""),e.media.style.visibility="hidden",n.target=null;let s={x:t.left,y:t.top,s:1},a=Math.min(window.innerWidth*.6/n.w0,window.innerHeight*.7/n.h0),r=p1(n.w0,n.h0,a);return(async()=>(n.bgEl.animate([{opacity:0},{opacity:1}],{duration:cs.bgFade,easing:"ease-in-out",fill:"forwards"}),n.timer=window.setTimeout(()=>e.router.push(e.href),cs.pushAt),await gc(n.box,s,r,cs.lift,p2),await gc(n.box,r,n.cover,cs.zoom,h1),n.covered=!0,e.media.style.visibility="",e.row.removeAttribute("data-pt-active"),n.target&&y1(n)))(),!0}function v1(e){return!vn||vn.mode!=="open"?!1:(vn.target=e,e.style.visibility="hidden",document.documentElement.setAttribute("data-pt-hold","1"),window.scrollTo(0,0),vn.covered&&y1(vn),!0)}async function y1(e){let t=e.target;if(!t)return;await vc(40);let n=t.getBoundingClientRect(),i={x:n.left,y:n.top,s:n.width/e.w0};document.documentElement.removeAttribute("data-pt-hold"),await gc(e.box,e.cover,i,cs.settle,f1,0,15),t.style.visibility="",e.bgEl.animate([{opacity:1},{opacity:0}],{duration:300,fill:"forwards"}),await vc(320),Jh(e)}function x1(e){if(vn||d1()||!e.figure)return!1;let t=e.figure.getBoundingClientRect(),n=window.innerWidth,i=window.innerHeight;if(!(t.right>0&&t.left<n&&t.bottom>0&&t.top<i&&t.width>10)){let l=Math.min(n*.5,i*.55*(t.width/Math.max(1,t.height))),c=l*(t.height/Math.max(1,t.width));t=new DOMRect((n-l)/2,(i-c)/2,l,c)}let a=m1("back",e.slug,e.src,e.bg,t,0);vn=a,e.router.prefetch("/");let r=document.documentElement;r.classList.add("pt-leaving"),r.setAttribute("data-pt-busy","1"),r.setAttribute("data-pt-back","1");let o={x:t.left,y:t.top,s:1};return e.figure.style.visibility="hidden",(async()=>(a.bgEl.animate([{opacity:0},{opacity:1}],{duration:cs.bgFade*.8,easing:"ease-in-out",fill:"forwards"}),a.timer=window.setTimeout(()=>e.router.push("/",{scroll:!1}),cs.pushAt),await gc(a.box,o,a.cover,cs.zoom,h1),a.covered=!0,a.target&&b1(a)))(),!0}function _1(){if(!vn||vn.mode!=="back")return;let e=document.querySelector(`[data-fw-slug="${vn.slug}"] .fw-media`);if(!e){Jh(vn);return}vn.target=e,e.style.visibility="hidden",vn.covered&&b1(vn)}async function b1(e){let t=e.target;if(!t)return;await vc(40);let n=t.getBoundingClientRect(),i={x:n.left,y:n.top,s:n.width/e.w0};document.documentElement.classList.remove("pt-leaving"),e.bgEl.animate([{opacity:1},{opacity:0}],{duration:cs.settle*.7,delay:150,easing:"ease-in-out",fill:"forwards"}),await gc(e.box,e.cover,i,cs.settle,f1,0,15),t.style.visibility="",await vc(120),Jh(e)}var S1="1.3.26";function E1(e,t,n){return Math.max(e,Math.min(t,n))}function g2(e,t,n){return(1-n)*e+n*t}function v2(e,t,n,i){return g2(e,t,1-Math.exp(-n*i))}function y2(e,t){return(e%t+t)%t}var x2=class{constructor(){St(this,"isRunning",!1);St(this,"value",0);St(this,"from",0);St(this,"to",0);St(this,"currentTime",0);St(this,"lerp");St(this,"duration");St(this,"easing");St(this,"onUpdate")}advance(e){var n;if(!this.isRunning)return;let t=!1;if(this.duration&&this.easing){this.currentTime+=e;let i=E1(0,this.currentTime/this.duration,1);t=i>=1;let s=t?1:this.easing(i);this.value=this.from+(this.to-this.from)*s}else this.lerp?(this.value=v2(this.value,this.to,this.lerp*60,e),Math.round(this.value)===Math.round(this.to)&&(this.value=this.to,t=!0)):(this.value=this.to,t=!0);t&&this.stop(),(n=this.onUpdate)==null||n.call(this,this.value,t)}stop(){this.isRunning=!1}fromTo(e,t,{lerp:n,duration:i,easing:s,onStart:a,onUpdate:r}){this.from=this.value=e,this.to=t,this.lerp=n,this.duration=i,this.easing=s,this.currentTime=0,this.isRunning=!0,a==null||a(),this.onUpdate=r}};function _2(e,t){let n;return function(...i){clearTimeout(n),n=setTimeout(()=>{n=void 0,e.apply(this,i)},t)}}var b2=class{constructor(e,t,{autoResize:n=!0,debounce:i=250}={}){St(this,"width",0);St(this,"height",0);St(this,"scrollHeight",0);St(this,"scrollWidth",0);St(this,"debouncedResize");St(this,"wrapperResizeObserver");St(this,"contentResizeObserver");St(this,"resize",()=>{this.onWrapperResize(),this.onContentResize()});St(this,"onWrapperResize",()=>{this.wrapper instanceof Window?(this.width=window.innerWidth,this.height=window.innerHeight):(this.width=this.wrapper.clientWidth,this.height=this.wrapper.clientHeight)});St(this,"onContentResize",()=>{this.wrapper instanceof Window?(this.scrollHeight=this.content.scrollHeight,this.scrollWidth=this.content.scrollWidth):(this.scrollHeight=this.wrapper.scrollHeight,this.scrollWidth=this.wrapper.scrollWidth)});this.wrapper=e,this.content=t,n&&(this.debouncedResize=_2(this.resize,i),this.wrapper instanceof Window?window.addEventListener("resize",this.debouncedResize):(this.wrapperResizeObserver=new ResizeObserver(this.debouncedResize),this.wrapperResizeObserver.observe(this.wrapper)),this.contentResizeObserver=new ResizeObserver(this.debouncedResize),this.contentResizeObserver.observe(this.content)),this.resize()}destroy(){var e,t;(e=this.wrapperResizeObserver)==null||e.disconnect(),(t=this.contentResizeObserver)==null||t.disconnect(),this.wrapper===window&&this.debouncedResize&&window.removeEventListener("resize",this.debouncedResize)}get limit(){return{x:this.scrollWidth-this.width,y:this.scrollHeight-this.height}}},T1=class{constructor(){St(this,"events",{})}emit(e,...t){var i;let n=this.events[e]||[];for(let s=0,a=n.length;s<a;s++)(i=n[s])==null||i.call(n,...t)}on(e,t){return this.events[e]?this.events[e].push(t):this.events[e]=[t],()=>{var n;this.events[e]=(n=this.events[e])==null?void 0:n.filter(i=>t!==i)}}off(e,t){var n;this.events[e]=(n=this.events[e])==null?void 0:n.filter(i=>t!==i)}destroy(){this.events={}}},S2=100/6,Pa={passive:!1};function M1(e,t){return e===1?S2:e===2?t:1}var M2=class{constructor(e,t={wheelMultiplier:1,touchMultiplier:1}){St(this,"touchStart",{x:0,y:0});St(this,"lastDelta",{x:0,y:0});St(this,"window",{width:0,height:0});St(this,"emitter",new T1);St(this,"onTouchStart",e=>{let{clientX:t,clientY:n}=e.targetTouches?e.targetTouches[0]:e;this.touchStart.x=t,this.touchStart.y=n,this.lastDelta={x:0,y:0},this.emitter.emit("scroll",{deltaX:0,deltaY:0,event:e})});St(this,"onTouchMove",e=>{let{clientX:t,clientY:n}=e.targetTouches?e.targetTouches[0]:e,i=-(t-this.touchStart.x)*this.options.touchMultiplier,s=-(n-this.touchStart.y)*this.options.touchMultiplier;this.touchStart.x=t,this.touchStart.y=n,this.lastDelta={x:i,y:s},this.emitter.emit("scroll",{deltaX:i,deltaY:s,event:e})});St(this,"onTouchEnd",e=>{this.emitter.emit("scroll",{deltaX:this.lastDelta.x,deltaY:this.lastDelta.y,event:e})});St(this,"onWheel",e=>{let{deltaX:t,deltaY:n,deltaMode:i}=e,s=M1(i,this.window.width),a=M1(i,this.window.height);t*=s,n*=a,t*=this.options.wheelMultiplier,n*=this.options.wheelMultiplier,this.emitter.emit("scroll",{deltaX:t,deltaY:n,event:e})});St(this,"onWindowResize",()=>{this.window={width:window.innerWidth,height:window.innerHeight}});this.element=e,this.options=t,window.addEventListener("resize",this.onWindowResize),this.onWindowResize(),this.element.addEventListener("wheel",this.onWheel,Pa),this.element.addEventListener("touchstart",this.onTouchStart,Pa),this.element.addEventListener("touchmove",this.onTouchMove,Pa),this.element.addEventListener("touchend",this.onTouchEnd,Pa)}on(e,t){return this.emitter.on(e,t)}destroy(){this.emitter.destroy(),window.removeEventListener("resize",this.onWindowResize),this.element.removeEventListener("wheel",this.onWheel,Pa),this.element.removeEventListener("touchstart",this.onTouchStart,Pa),this.element.removeEventListener("touchmove",this.onTouchMove,Pa),this.element.removeEventListener("touchend",this.onTouchEnd,Pa)}},w1=e=>Math.min(1,1.001-2**(-10*e)),A1=class{constructor({wrapper:e=window,content:t=document.documentElement,eventsTarget:n=e,smoothWheel:i=!0,syncTouch:s=!1,syncTouchLerp:a=.075,touchInertiaExponent:r=1.7,duration:o,easing:l,lerp:c=.1,infinite:h=!1,orientation:d="vertical",gestureOrientation:u=d==="horizontal"?"both":"vertical",touchMultiplier:p=1,wheelMultiplier:m=1,autoResize:S=!0,prevent:g,virtualScroll:f,overscroll:v=!0,autoRaf:x=!1,anchors:y=!1,autoToggle:M=!1,allowNestedScroll:w=!1,__experimental__naiveDimensions:E=!1,naiveDimensions:b=E,stopInertiaOnNavigate:A=!1,respectReducedMotion:R=!0}={}){St(this,"_isScrolling",!1);St(this,"_isStopped",!1);St(this,"_isLocked",!1);St(this,"_preventNextNativeScrollEvent",!1);St(this,"_resetVelocityTimeout",null);St(this,"_rafId",null);St(this,"_isDraggingSelection",!1);St(this,"reducedMotionMediaQuery",window.matchMedia("(prefers-reduced-motion: reduce)"));St(this,"isTouching");St(this,"isIos");St(this,"time",0);St(this,"userData",{});St(this,"lastVelocity",0);St(this,"velocity",0);St(this,"direction",0);St(this,"options");St(this,"targetScroll");St(this,"animatedScroll");St(this,"animate",new x2);St(this,"emitter",new T1);St(this,"dimensions");St(this,"virtualScroll");St(this,"onScrollEnd",e=>{e instanceof CustomEvent||(this.isScrolling==="smooth"||this.isScrolling===!1)&&e.stopPropagation()});St(this,"dispatchScrollendEvent",()=>{this.options.wrapper.dispatchEvent(new CustomEvent("scrollend",{bubbles:this.options.wrapper===window,detail:{lenisScrollEnd:!0}}))});St(this,"onTransitionEnd",e=>{var t;(t=e.propertyName)!=null&&t.includes("overflow")&&e.target===this.rootElement&&this.checkOverflow()});St(this,"onClick",e=>{let t=e.composedPath().filter(i=>i instanceof HTMLAnchorElement&&i.href).map(i=>new URL(i.href)),n=new URL(window.location.href);if(this.options.anchors){let i=t.find(s=>n.host===s.host&&n.pathname===s.pathname&&s.hash);if(i){let s=typeof this.options.anchors=="object"&&this.options.anchors?this.options.anchors:void 0,a=decodeURIComponent(i.hash);this.scrollTo(a,s);return}}if(this.options.stopInertiaOnNavigate&&t.some(i=>n.host===i.host&&n.pathname!==i.pathname)){this.reset();return}});St(this,"onPointerDown",e=>{e.button===1&&this.reset()});St(this,"onVirtualScroll",e=>{if(typeof this.options.virtualScroll=="function"&&this.options.virtualScroll(e)===!1)return;let{deltaX:t,deltaY:n,event:i}=e;if(this.emitter.emit("virtual-scroll",{deltaX:t,deltaY:n,event:i}),i.ctrlKey||i.lenisStopPropagation)return;let s=i.type.includes("touch"),a=i.type.includes("wheel");if(s&&this.isIos&&(i.type==="touchstart"&&(this._isDraggingSelection=this.isTouchOnSelectionHandle(i)),this._isDraggingSelection)){i.type==="touchend"&&(this._isDraggingSelection=!1);return}this.isTouching=i.type==="touchstart"||i.type==="touchmove";let r=t===0&&n===0;if(this.options.syncTouch&&s&&i.type==="touchstart"&&r&&!this.isStopped&&!this.isLocked){this.reset();return}let o=this.options.gestureOrientation==="vertical"&&n===0||this.options.gestureOrientation==="horizontal"&&t===0;if(r||o)return;let l=i.composedPath();l=l.slice(0,l.indexOf(this.rootElement));let c=this.options.prevent,h=Math.abs(t)>=Math.abs(n)?"horizontal":"vertical";if(l.find(m=>{var S,g,f,v,x;return m instanceof HTMLElement&&(typeof c=="function"&&(c==null?void 0:c(m))||((S=m.hasAttribute)==null?void 0:S.call(m,"data-lenis-prevent"))||h==="vertical"&&((g=m.hasAttribute)==null?void 0:g.call(m,"data-lenis-prevent-vertical"))||h==="horizontal"&&((f=m.hasAttribute)==null?void 0:f.call(m,"data-lenis-prevent-horizontal"))||s&&((v=m.hasAttribute)==null?void 0:v.call(m,"data-lenis-prevent-touch"))||a&&((x=m.hasAttribute)==null?void 0:x.call(m,"data-lenis-prevent-wheel"))||this.options.allowNestedScroll&&this.hasNestedScroll(m,{deltaX:t,deltaY:n}))}))return;if(this.isStopped||this.isLocked){i.cancelable&&i.preventDefault();return}if(!(this.options.syncTouch&&s||this.options.smoothWheel&&a)){this.isScrolling="native",this.animate.stop(),i.lenisStopPropagation=!0;return}let d=n;this.options.gestureOrientation==="both"?d=Math.abs(n)>Math.abs(t)?n:t:this.options.gestureOrientation==="horizontal"&&(d=t),(!this.options.overscroll||this.options.infinite||this.options.wrapper!==window&&this.limit>0&&(this.animatedScroll>0&&this.animatedScroll<this.limit||this.animatedScroll===0&&n>0||this.animatedScroll===this.limit&&n<0))&&(i.lenisStopPropagation=!0),i.cancelable&&i.preventDefault();let u=s&&this.options.syncTouch,p=s&&i.type==="touchend";p&&(d=Math.sign(d)*Math.abs(this.velocity)**this.options.touchInertiaExponent),this.scrollTo(this.targetScroll+d,{programmatic:!1,...u?{lerp:p?this.options.syncTouchLerp:1}:{lerp:this.options.lerp,duration:this.options.duration,easing:this.options.easing}})});St(this,"onNativeScroll",()=>{if(this._resetVelocityTimeout!==null&&(clearTimeout(this._resetVelocityTimeout),this._resetVelocityTimeout=null),this._preventNextNativeScrollEvent){this._preventNextNativeScrollEvent=!1;return}if(this.isScrolling===!1||this.isScrolling==="native"){let e=this.animatedScroll;this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity,this.velocity=this.animatedScroll-e,this.direction=Math.sign(this.animatedScroll-e),this.isStopped||(this.isScrolling="native"),this.emit(),this.velocity!==0&&(this._resetVelocityTimeout=setTimeout(()=>{this.lastVelocity=this.velocity,this.velocity=0,this.isScrolling=!1,this.emit()},400))}});St(this,"raf",e=>{let t=e-(this.time||e);this.time=e,this.animate.advance(t*.001),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))});window.lenisVersion=S1,window.lenis||(window.lenis={}),window.lenis.version=S1,d==="horizontal"&&(window.lenis.horizontal=!0),s===!0&&(window.lenis.touch=!0),this.isIos=/(iPad|iPhone|iPod)/g.test(navigator.userAgent),(!e||e===document.documentElement)&&(e=window),typeof o=="number"&&typeof l!="function"?l=w1:typeof l=="function"&&typeof o!="number"&&(o=1),this.options={wrapper:e,content:t,eventsTarget:n,smoothWheel:i,syncTouch:s,syncTouchLerp:a,touchInertiaExponent:r,duration:o,easing:l,lerp:c,infinite:h,gestureOrientation:u,orientation:d,touchMultiplier:p,wheelMultiplier:m,autoResize:S,prevent:g,virtualScroll:f,overscroll:v,autoRaf:x,anchors:y,autoToggle:M,allowNestedScroll:w,naiveDimensions:b,stopInertiaOnNavigate:A,respectReducedMotion:R},this.dimensions=new b2(e,t,{autoResize:S}),this.updateClassName(),this.targetScroll=this.animatedScroll=this.actualScroll,this.options.wrapper.addEventListener("scroll",this.onNativeScroll),this.options.wrapper.addEventListener("scrollend",this.onScrollEnd,{capture:!0}),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.addEventListener("click",this.onClick),this.options.wrapper.addEventListener("pointerdown",this.onPointerDown),this.virtualScroll=new M2(n,{touchMultiplier:p,wheelMultiplier:m}),this.virtualScroll.on("scroll",this.onVirtualScroll),this.options.autoToggle&&(this.checkOverflow(),this.rootElement.addEventListener("transitionend",this.onTransitionEnd)),this.options.autoRaf&&(this._rafId=requestAnimationFrame(this.raf))}destroy(){this.emitter.destroy(),this.options.wrapper.removeEventListener("scroll",this.onNativeScroll),this.options.wrapper.removeEventListener("scrollend",this.onScrollEnd,{capture:!0}),this.options.wrapper.removeEventListener("pointerdown",this.onPointerDown),(this.options.anchors||this.options.stopInertiaOnNavigate)&&this.options.wrapper.removeEventListener("click",this.onClick),this.virtualScroll.destroy(),this.dimensions.destroy(),this.cleanUpClassName(),this._rafId&&cancelAnimationFrame(this._rafId)}on(e,t){return this.emitter.on(e,t)}off(e,t){return this.emitter.off(e,t)}get overflow(){let e=this.isHorizontal?"overflow-x":"overflow-y";return getComputedStyle(this.rootElement)[e]}checkOverflow(){["hidden","clip"].includes(this.overflow)?this.internalStop():this.internalStart()}setScroll(e){this.isHorizontal?this.options.wrapper.scrollTo({left:e,behavior:"instant"}):this.options.wrapper.scrollTo({top:e,behavior:"instant"})}isTouchOnSelectionHandle(e){var c;let t=window.getSelection();if(!t||t.isCollapsed||t.rangeCount===0)return!1;let n=(c=e.targetTouches[0])!=null?c:e.changedTouches[0];if(!n)return!1;let i=t.getRangeAt(0).getClientRects();if(i.length===0)return!1;let s=i[0],a=i[i.length-1],r=40,o=Math.hypot(n.clientX-s.left,n.clientY-s.top)<=r,l=Math.hypot(n.clientX-a.right,n.clientY-a.bottom)<=r;return o||l}resize(){this.dimensions.resize(),this.animatedScroll=this.targetScroll=this.actualScroll,this.emit()}emit(){this.emitter.emit("scroll",this)}reset(){this.isLocked=!1,this.isScrolling=!1,this.animatedScroll=this.targetScroll=this.actualScroll,this.lastVelocity=this.velocity=0,this.animate.stop()}start(){if(this.isStopped){if(this.options.autoToggle){this.rootElement.style.removeProperty("overflow");return}this.internalStart()}}internalStart(){this.isStopped&&(this.reset(),this.isStopped=!1,this.emit())}stop(){if(!this.isStopped){if(this.options.autoToggle){this.rootElement.style.setProperty("overflow","clip");return}this.internalStop()}}internalStop(){this.isStopped||(this.reset(),this.isStopped=!0,this.emit())}scrollTo(e,{offset:t=0,immediate:n=!1,lock:i=!1,programmatic:s=!0,lerp:a=s?this.options.lerp:void 0,duration:r=s?this.options.duration:void 0,easing:o=s?this.options.easing:void 0,onStart:l,onComplete:c,force:h=!1,userData:d}={}){if(this.prefersReducedMotion&&(s?n=!0:(a=1,r=void 0,o=void 0)),(this.isStopped||this.isLocked)&&!h)return;let u=e,p=t;if(typeof u=="string"&&["top","left","start","#"].includes(u))u=0;else if(typeof u=="string"&&["bottom","right","end"].includes(u))u=this.limit;else{let m=null;if(typeof u=="string"?(m=u.startsWith("#")?document.getElementById(u.slice(1)):document.querySelector(u),m||(u==="#top"?u=0:console.warn("Lenis: Target not found",u))):u instanceof HTMLElement&&(u!=null&&u.nodeType)&&(m=u),m){if(this.options.wrapper!==window){let y=this.rootElement.getBoundingClientRect();p-=this.isHorizontal?y.left:y.top}let S=m.getBoundingClientRect(),g=getComputedStyle(m),f=this.isHorizontal?Number.parseFloat(g.scrollMarginLeft):Number.parseFloat(g.scrollMarginTop),v=getComputedStyle(this.rootElement),x=this.isHorizontal?Number.parseFloat(v.scrollPaddingLeft):Number.parseFloat(v.scrollPaddingTop);u=(this.isHorizontal?S.left:S.top)+this.animatedScroll-(Number.isNaN(f)?0:f)-(Number.isNaN(x)?0:x)}}if(typeof u=="number"){if(u+=p,this.options.infinite){if(s){this.targetScroll=this.animatedScroll=this.scroll;let m=u-this.animatedScroll;m>this.limit/2?u-=this.limit:m<-this.limit/2&&(u+=this.limit)}}else u=E1(0,u,this.limit);if(u===this.targetScroll){l==null||l(this),c==null||c(this);return}if(this.userData=d!=null?d:{},n){this.animatedScroll=this.targetScroll=u,this.setScroll(this.scroll),this.reset(),this.preventNextNativeScrollEvent(),this.emit(),c==null||c(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()});return}s||(this.targetScroll=u),typeof r=="number"&&typeof o!="function"?o=w1:typeof o=="function"&&typeof r!="number"&&(r=1),this.animate.fromTo(this.animatedScroll,u,{duration:r,easing:o,lerp:a,onStart:()=>{i&&(this.isLocked=!0),this.isScrolling="smooth",l==null||l(this)},onUpdate:(m,S)=>{this.isScrolling="smooth",this.lastVelocity=this.velocity,this.velocity=m-this.animatedScroll,this.direction=Math.sign(this.velocity),this.animatedScroll=m,this.setScroll(this.scroll),s&&(this.targetScroll=m),S||this.emit(),S&&(this.reset(),this.emit(),c==null||c(this),this.userData={},requestAnimationFrame(()=>{this.dispatchScrollendEvent()}),this.preventNextNativeScrollEvent())}})}}preventNextNativeScrollEvent(){this._preventNextNativeScrollEvent=!0,requestAnimationFrame(()=>{this._preventNextNativeScrollEvent=!1})}hasNestedScroll(e,{deltaX:t,deltaY:n}){var w;let i=Date.now();e._lenis||(e._lenis={});let s=e._lenis,a,r,o,l,c,h,d,u,p,m;if(i-((w=s.time)!=null?w:0)>2e3){s.time=Date.now();let E=window.getComputedStyle(e);if(s.computedStyle=E,a=["auto","overlay","scroll"].includes(E.overflowX),r=["auto","overlay","scroll"].includes(E.overflowY),c=["auto"].includes(E.overscrollBehaviorX),h=["auto"].includes(E.overscrollBehaviorY),s.hasOverflowX=a,s.hasOverflowY=r,!(a||r))return!1;d=e.scrollWidth,u=e.scrollHeight,p=e.clientWidth,m=e.clientHeight,o=d>p,l=u>m,s.isScrollableX=o,s.isScrollableY=l,s.scrollWidth=d,s.scrollHeight=u,s.clientWidth=p,s.clientHeight=m,s.hasOverscrollBehaviorX=c,s.hasOverscrollBehaviorY=h}else o=s.isScrollableX,l=s.isScrollableY,a=s.hasOverflowX,r=s.hasOverflowY,d=s.scrollWidth,u=s.scrollHeight,p=s.clientWidth,m=s.clientHeight,c=s.hasOverscrollBehaviorX,h=s.hasOverscrollBehaviorY;if(!(a&&o||r&&l))return!1;let S=Math.abs(t)>=Math.abs(n)?"horizontal":"vertical",g,f,v,x,y,M;if(S==="horizontal")g=Math.round(e.scrollLeft),f=d-p,v=t,x=a,y=o,M=c;else if(S==="vertical")g=Math.round(e.scrollTop),f=u-m,v=n,x=r,y=l,M=h;else return!1;return!M&&(g>=f||g<=0)?!0:(v>0?g<f:g>0)&&x&&y}get rootElement(){return this.options.wrapper===window?document.documentElement:this.options.wrapper}get limit(){return this.options.naiveDimensions?this.isHorizontal?this.rootElement.scrollWidth-this.rootElement.clientWidth:this.rootElement.scrollHeight-this.rootElement.clientHeight:this.dimensions.limit[this.isHorizontal?"x":"y"]}get isHorizontal(){return this.options.orientation==="horizontal"}get actualScroll(){var t,n;let e=this.options.wrapper;return this.isHorizontal?(t=e.scrollX)!=null?t:e.scrollLeft:(n=e.scrollY)!=null?n:e.scrollTop}get scroll(){return this.options.infinite?y2(this.animatedScroll,this.limit):this.animatedScroll}get progress(){return this.limit===0?1:this.scroll/this.limit}get isScrolling(){return this._isScrolling}set isScrolling(e){this._isScrolling!==e&&(this._isScrolling=e,this.updateClassName())}get isStopped(){return this._isStopped}set isStopped(e){this._isStopped!==e&&(this._isStopped=e,this.updateClassName())}get isLocked(){return this._isLocked}set isLocked(e){this._isLocked!==e&&(this._isLocked=e,this.updateClassName())}get isSmooth(){return this.isScrolling==="smooth"}get prefersReducedMotion(){return this.options.respectReducedMotion&&this.reducedMotionMediaQuery.matches}get className(){let e="lenis";return this.options.autoToggle&&(e+=" lenis-autoToggle"),this.isStopped&&(e+=" lenis-stopped"),this.isLocked&&(e+=" lenis-locked"),this.isScrolling&&(e+=" lenis-scrolling"),this.isScrolling==="smooth"&&(e+=" lenis-smooth"),e}updateClassName(){this.cleanUpClassName(),this.className.split(" ").forEach(e=>{this.rootElement.classList.add(e)})}cleanUpClassName(){for(let e of Array.from(this.rootElement.classList))(e==="lenis"||e.startsWith("lenis-"))&&this.rootElement.classList.remove(e)}};var C1=Yt(Sn());function Kh(){return(0,C1.useEffect)(()=>{let e=new A1({lerp:.08}),t=0,n=i=>{e.raf(i),t=requestAnimationFrame(n)};return t=requestAnimationFrame(n),()=>{cancelAnimationFrame(t),e.destroy()}},[]),null}var us=Yt(Sn());var Me=Yt(Re()),fg="cubic-bezier(.7,0,.2,1)",dg=!1;function w2({className:e=""}){return(0,Me.jsx)("svg",{className:e,viewBox:"0 0 12 12",width:"1em",height:"1em",fill:"none",stroke:"currentColor",strokeWidth:"1.5","aria-hidden":"true",children:(0,Me.jsx)("path",{d:"M1 6h10M6.5 1.5 11 6l-4.5 4.5"})})}function R1({children:e}){return(0,Me.jsxs)("span",{className:"relative inline-block max-w-full overflow-hidden whitespace-nowrap align-top leading-[1.1]",children:[(0,Me.jsx)("span",{className:"block transition-transform duration-500 [transition-timing-function:cubic-bezier(.7,0,.2,1)] group-hover/swap:-translate-y-full",children:e}),(0,Me.jsx)("span",{"aria-hidden":"true",className:"absolute left-0 top-full block transition-transform duration-500 [transition-timing-function:cubic-bezier(.7,0,.2,1)] group-hover/swap:-translate-y-full",children:e})]})}function N1({className:e=""}){return(0,Me.jsx)("span",{"aria-hidden":"true",className:`inline-block h-[0.4em] w-[0.4em] rounded-full bg-current ${e}`})}function E2(e){return e<=5?{desktop:"6vw",mobile:"12vw"}:e<=8?{desktop:"4vw",mobile:"8vw"}:e<=12?{desktop:"2.8vw",mobile:"6vw"}:{desktop:"2vw",mobile:"5vw"}}function Qh(){let{story:e,router:t}=zn(),[n,i]=(0,us.useState)(!1),[s,a]=(0,us.useState)(dg),r=(0,us.useRef)(dg),o=(0,us.useRef)({}),l=`${e.assetBase}/audio`,c=E2(e.chapters.length);(0,us.useEffect)(()=>{if(!n)return;let g=v=>{v.key==="Escape"&&i(!1)},f=document.body.style.overflow;return document.body.style.overflow="hidden",window.addEventListener("keydown",g),()=>{document.body.style.overflow=f,window.removeEventListener("keydown",g)}},[n]);let h=(0,us.useCallback)(g=>{if(!r.current)return;let f=o.current[g];f||(f=new Audio(`${l}/${g}.ogg`),f.volume=.5,o.current[g]=f),f.currentTime=0,f.play().catch(()=>{})},[l]),d=()=>{let g=!s;a(g),r.current=g,dg=g,g&&h("click")},u=()=>{h("page"),i(g=>!g)},p={onMouseEnter:()=>h("hover")},m="group/swap inline-flex h-[3.2em] items-center gap-[0.7em] rounded-[6.25em] px-[1.4em] text-[.875em] font-medium uppercase transition-[color,background-color] duration-[400ms] max-md:px-[1.1em] max-md:text-[.75em]",S=g=>(0,Me.jsx)("span",{className:"block w-[2px] origin-center rounded-full bg-current",style:{height:s?"40%":"2px",animation:s?`sc-bar 0.9s ease-in-out ${g} infinite alternate`:"none",transition:"height .4s"}});return(0,Me.jsxs)(Me.Fragment,{children:[(0,Me.jsx)("style",{children:"@keyframes sc-bar{from{transform:scaleY(.35)}to{transform:scaleY(1.6)}}"}),(0,Me.jsxs)("header",{className:"fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-4 text-[var(--sc-black)]",style:{paddingInline:"var(--sc-pad-x)",paddingBlock:"var(--sc-pad-y)",fontFamily:"var(--sc-font-sans)"},children:[(0,Me.jsx)("a",{href:"#/",title:e.title,className:"min-w-0 max-w-[46vw] truncate text-[1.8vw] font-medium uppercase leading-none tracking-tight max-md:text-[5vw]",onClick:()=>{h("click"),i(!1)},...p,children:e.title}),(0,Me.jsxs)("div",{className:"flex shrink-0 items-center gap-[0.5em] text-base max-md:text-[.9rem]",children:[(0,Me.jsxs)("button",{type:"button","aria-label":s?"Turn sound off":"Turn sound on","aria-pressed":s,onClick:d,...p,className:"flex h-[3.2em] w-[3.2em] items-center justify-center gap-[3px] rounded-full bg-[var(--sc-dark-white)] text-[var(--sc-black)] transition-[background-color,color] duration-[400ms] hover:bg-[var(--sc-grey-blue)] hover:text-white",children:[S("0s"),S(".15s"),S(".3s"),S(".1s")]}),(0,Me.jsxs)("button",{type:"button","aria-expanded":n,"aria-controls":"sc-menu-panel",onClick:u,...p,className:`${m} bg-[var(--sc-dark-white)] text-[var(--sc-black)] hover:bg-[var(--sc-black)] hover:text-white`,children:[(0,Me.jsx)(R1,{children:n?"Close":"Menu"}),(0,Me.jsxs)("span",{className:"flex flex-col gap-[0.25em]","aria-hidden":"true",children:[(0,Me.jsx)(N1,{className:"h-[0.3em] w-[0.3em]"}),(0,Me.jsx)(N1,{className:"h-[0.3em] w-[0.3em]"})]})]})]})]}),(0,Me.jsx)("div",{id:"sc-menu-panel",role:"dialog","aria-label":"Chapters","aria-hidden":!n,className:"fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[var(--sc-off-white)] text-[var(--sc-black)]",style:{fontFamily:"var(--sc-font-sans)",paddingInline:"var(--sc-pad-x)",paddingTop:"calc(var(--sc-pad-y) * 2 + 3.2em)",paddingBottom:"var(--sc-pad-y)",clipPath:n?"inset(0 0 0 0)":"inset(0 0 100% 0)",visibility:n?"visible":"hidden",transition:`clip-path .6s ${fg}, visibility 0s linear ${n?"0s":".6s"}`},children:(0,Me.jsx)("nav",{"aria-label":"Chapters",className:"flex flex-col",children:e.chapters.map((g,f)=>(0,Me.jsxs)("a",{href:g.href,tabIndex:n?0:-1,onClick:v=>{v.preventDefault(),h("click"),i(!1),t.push(g.href)},onMouseEnter:()=>h("hover"),className:"sc-menu-link group/swap flex items-center gap-[2vw] font-medium uppercase leading-[1.05] tracking-tight",style:{"--sc-menu-size":c.desktop,"--sc-menu-size-m":c.mobile,transform:n?"translateY(0)":"translateY(40px)",opacity:n?1:0,transition:`transform .6s ${fg} ${.1+Math.min(f,12)*.05}s, opacity .6s ${fg} ${.1+Math.min(f,12)*.05}s`},children:[(0,Me.jsx)("span",{className:"min-w-0 truncate",children:(0,Me.jsx)(R1,{children:g.title})}),(0,Me.jsx)(w2,{className:"shrink-0 text-[.5em] opacity-0 transition-opacity duration-[400ms] group-hover/swap:opacity-100"})]},g.slug))})})]})}var Lt=Yt(Re()),T2="(min-width: 1024px)",L1=["zoom","tilt","reveal","slide","rise"];function D1(e){return Math.min(1,Math.max(0,e))}function A2({item:e}){let t=(0,Ln.useRef)(null);return(0,Ln.useEffect)(()=>{let n=t.current;if(!n)return;let i=new IntersectionObserver(s=>{for(let a of s)a.isIntersecting?n.play().catch(()=>{}):n.pause()},{threshold:.25});return i.observe(n),()=>i.disconnect()},[]),(0,Lt.jsx)("video",{ref:t,muted:!0,loop:!0,playsInline:!0,preload:"metadata",className:"absolute inset-0 block h-full w-full object-contain",children:e.videoFallback?(0,Lt.jsxs)(Lt.Fragment,{children:[(0,Lt.jsx)("source",{src:e.videoSrc,type:"video/webm"}),(0,Lt.jsx)("source",{src:e.videoFallback,type:"video/mp4"})]}):(0,Lt.jsx)("source",{src:e.videoSrc})})}function C2({item:e,picture:t,priority:n}){return(0,Lt.jsxs)("div",{className:"relative h-full w-full",children:[(0,Lt.jsx)("img",{src:t,alt:e.alt,width:e.width,height:e.height,loading:n?"eager":"lazy",decoding:"async",draggable:!1,className:"block h-full w-full object-cover"}),e.videoSrc?(0,Lt.jsx)(A2,{item:e}):e.overlay?(0,Lt.jsx)("img",{src:e.overlay,alt:"",loading:n?"eager":"lazy",decoding:"async",draggable:!1,className:"absolute inset-x-0 bottom-0 mx-auto block h-[90%] w-auto max-w-[90%] object-contain"}):null]})}function R2(e){let t=e.length;return t<=14?{lg:"4.5vw",sm:"13vw"}:t<=26?{lg:"3.4vw",sm:"10vw"}:t<=44?{lg:"2.7vw",sm:"8vw"}:{lg:"2.2vw",sm:"6.5vw"}}function N2({text:e}){return(0,Lt.jsx)(Lt.Fragment,{children:e.split(/(\s+)/).map((t,n)=>t===""||/^\s+$/.test(t)?t:(0,Lt.jsx)("span",{className:"sc-word",children:t},n))})}function U1({chapter:e}){let{story:t,router:n}=zn(),i=t.chapters.length,s=e.index>0?t.chapters[e.index-1]:null,a=e.index+1<i?t.chapters[e.index+1]:null,r=(0,Ln.useRef)(null),o=(0,Ln.useRef)(null),l=(0,Ln.useRef)(null),c=(0,Ln.useRef)(null),h=(0,Ln.useRef)(null),d=(0,Ln.useRef)(null),[u,p]=(0,Ln.useState)(!1);(0,Ln.useLayoutEffect)(()=>{var y;if(d.current?v1(d.current):!1)return;window.matchMedia("(prefers-reduced-motion: reduce)").matches||(y=r.current)==null||y.animate([{opacity:0},{opacity:1}],{duration:600,easing:"ease-out"})},[]),(0,Ln.useEffect)(()=>{var q;let v=c.current,x=h.current;if(!v||!x||!e.audioUrl)return;let y=Array.from(x.querySelectorAll(".sc-word")),w=y.map(O=>{var H,D;return((D=(H=O.textContent)==null?void 0:H.trim().length)!=null?D:0)+3}).reduce((O,H)=>{var D;return O.push(((D=O[O.length-1])!=null?D:0)+H),O},[]),E=(q=w[w.length-1])!=null?q:1,b=()=>{if(!v.duration)return;let O=v.currentTime/v.duration*E,H=w.findIndex(D=>D>=O);H===-1&&(H=y.length-1),y.forEach((D,X)=>D.classList.toggle("on",X<=H))},A=0,R=()=>{if(y.forEach(H=>H.classList.add("on")),!a||!Xh()||mc())return;if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){n.push(a.href);return}p(!0),A=window.setTimeout(()=>n.push(a.href),650)},N=()=>{v.play().catch(O=>{O instanceof DOMException&&O.name==="NotAllowedError"&&kh(!0)})},I=Wh(O=>{O?v.pause():v.paused&&!v.ended&&N()});v.addEventListener("timeupdate",b),v.addEventListener("ended",R);let G=window.setTimeout(()=>{v.currentTime=0,mc()||N()},900);return()=>{window.clearTimeout(G),window.clearTimeout(A),I(),v.removeEventListener("timeupdate",b),v.removeEventListener("ended",R),v.pause()}},[e.audioUrl,e.slug,a,n]),(0,Ln.useEffect)(()=>{let v=o.current,x=l.current;if(!v||!x)return;let y=window.matchMedia(T2),M=Array.from(x.querySelectorAll("figure")).map((H,D)=>({el:H,img:H.firstElementChild instanceof HTMLElement?H.firstElementChild:null,kind:D===0?"main":L1[(D-1)%L1.length],left:0,width:0})),w=0,E=0,b=Number.NaN,A=0,R=()=>{var H,D;for(let X of M)X.el.style.removeProperty("transform"),X.el.style.removeProperty("filter"),X.el.style.removeProperty("clip-path"),X.el.style.removeProperty("will-change"),(H=X.img)==null||H.style.removeProperty("transform"),(D=X.img)==null||D.style.removeProperty("will-change")},N=(H,D)=>{let X=window.innerWidth,Q=window.innerHeight;for(let it=0;it<M.length;it++){let rt=M[it],st=rt.left+rt.width/2+H,Pt=Math.max(-1.6,Math.min(1.6,(st-X/2)/(X*.6))),Gt=Math.min(1,Math.abs(Pt)),W=`scaleX(${(1+D*.008).toFixed(3)})`,et="",tt="";switch(rt.kind){case"main":et=`translate3d(${(-Pt*6).toFixed(2)}%, 0, 0) scale(1.14)`;break;case"zoom":W=`scale(${(1-.1*Gt).toFixed(3)}) ${W}`,et=`scale(${(1+.24*Gt).toFixed(3)})`;break;case"tilt":W=`perspective(1400px) rotateY(${(-Pt*16).toFixed(2)}deg) ${W}`,et="scale(1.1)";break;case"reveal":tt=`inset(0 ${(Math.max(0,Math.min(1,(Pt-.05)/.85))*100).toFixed(2)}% 0 0 round 15px)`,et=`translate3d(${(Pt*8).toFixed(2)}%, 0, 0) scale(1.12)`;break;case"slide":et=`translate3d(${(-Pt*12).toFixed(2)}%, 0, 0) scale(1.28)`;break;case"rise":W=`translate3d(0, ${(Pt*7*(it%2?1:-1)*(Q/100)).toFixed(1)}px, 0) ${W}`,et="scale(1.08)";break}rt.el.style.transform=W,rt.el.style.willChange="transform",rt.el.style.filter=D>0?`blur(${D}px)`:"",rt.el.style.clipPath=tt,rt.img&&(rt.img.style.transform=et,rt.img.style.willChange="transform")}};function I(){if(E=0,!y.matches||!v||!x)return;let H=w>0?D1(-v.getBoundingClientRect().top/w):0,D=Math.round(-H*w*100)/100,X=Number.isNaN(b)?0:Math.abs(D-b);A=A*.7+D1(X/45)*.3;let Q=A<.04?0:Math.min(6,Math.round(A*7));(D!==b||Q>0)&&(b=D,x.style.transform=`translate3d(${D}px, 0, 0)`,N(D,Q)),A>=.04&&G()}function G(){E===0&&(E=requestAnimationFrame(I))}let q=()=>{if(!y.matches){v.style.removeProperty("height"),x.style.removeProperty("transform"),R(),b=Number.NaN;return}for(let H of M)H.left=H.el.offsetLeft,H.width=H.el.offsetWidth;w=Math.max(0,x.scrollWidth-window.innerWidth),v.style.height=`${w+window.innerHeight}px`,b=Number.NaN,G()};q();let O=new ResizeObserver(q);return O.observe(x),window.addEventListener("scroll",G,{passive:!0}),window.addEventListener("resize",q),y.addEventListener("change",q),()=>{O.disconnect(),window.removeEventListener("scroll",G),window.removeEventListener("resize",q),y.removeEventListener("change",q),E!==0&&cancelAnimationFrame(E)}},[e.slug]);let m=()=>{try{sessionStorage.setItem("sc-home-restore","1")}catch{}x1({router:n,slug:e.slug,src:Oa(e),bg:e.theme.bg,figure:d.current})||n.push("#/",{scroll:!1})},{theme:S}=e,g=R2(e.title),f={background:S.bg,color:S.text,opacity:u?0:void 0,transition:u?"opacity .6s ease":void 0,"--sc-black":S.highlight,"--pd-highlight":S.highlight,"--pd-text":S.text,"--pd-btn-bg":S.btnBg,"--pd-btn-text":S.btnText,"--pd-title":g.lg,"--pd-title-m":g.sm};return(0,Lt.jsxs)("div",{ref:r,className:"relative min-h-screen",style:{...f,fontFamily:"var(--sc-font-sans), sans-serif"},children:[(0,Lt.jsx)(Kh,{}),(0,Lt.jsx)(Qh,{}),(0,Lt.jsxs)("button",{type:"button",onClick:m,className:"group fixed left-1/2 z-50 flex h-[3.2em] -translate-x-1/2 items-center gap-[0.6em] overflow-hidden rounded-full px-[1.4em] text-[0.875rem] font-medium uppercase",style:{top:"var(--sc-pad-y)",background:"var(--pd-btn-bg)",color:"var(--pd-btn-text)"},children:[(0,Lt.jsx)("span",{"aria-hidden":"true",className:"absolute inset-0 origin-bottom scale-y-0 transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100",style:{background:"var(--pd-highlight)"}}),(0,Lt.jsx)("svg",{"aria-hidden":"true",viewBox:"0 0 16 16",className:"relative h-[1em] w-[1em]",children:(0,Lt.jsx)("path",{d:"M14 8H3M7 4 3 8l4 4",fill:"none",stroke:"currentColor",strokeWidth:"1.5"})}),(0,Lt.jsx)("span",{className:"relative",children:"Back"})]}),(0,Lt.jsx)("div",{ref:o,className:"relative",children:(0,Lt.jsx)("div",{className:"lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden",children:(0,Lt.jsxs)("div",{ref:l,className:"flex flex-col gap-[10vw] px-[var(--sc-pad-x)] pb-[12vw] pt-[26vw] lg:h-full lg:w-max lg:flex-row lg:items-center lg:gap-[5vw] lg:pb-0 lg:pt-[6vh] lg:will-change-transform",children:[(0,Lt.jsxs)("section",{className:"pd-fx shrink-0 lg:w-[36vw]",style:{"--pd-d":"0.1s"},children:[(0,Lt.jsx)("h1",{className:"m-0 text-[length:var(--pd-title-m)] font-medium leading-[0.95] tracking-[-0.02em] lg:text-[length:var(--pd-title)]",children:e.title}),(0,Lt.jsx)("p",{className:"mt-[1.5em] text-[0.75rem] uppercase leading-[1.3] lg:text-[0.8vw]",style:{color:"var(--pd-highlight)"},children:e.tags.join(" \u2022 ")}),(0,Lt.jsxs)("p",{className:"mt-[3em] hidden items-center gap-[0.6em] text-[0.75rem] uppercase lg:flex",children:[(0,Lt.jsx)("span",{children:"Scroll to continue"}),(0,Lt.jsx)("svg",{"aria-hidden":"true",viewBox:"0 0 16 16",className:"h-[1em] w-[1em]",children:(0,Lt.jsx)("path",{d:"M2 8h11M9 4l4 4-4 4",fill:"none",stroke:"currentColor",strokeWidth:"1.5"})})]})]}),e.items.map((v,x)=>(0,Lt.jsx)("figure",{ref:x===0?d:void 0,className:`m-0 w-full shrink-0 overflow-hidden rounded-[15px] lg:h-[62vh] lg:w-auto ${x>0?"pd-fade":""}`,style:{aspectRatio:`${v.width} / ${v.height}`,"--pd-d":`${.15+x*.12}s`},children:(0,Lt.jsx)(C2,{item:v,picture:x===0?Oa(e):o1(v),priority:x<2})},x)),(0,Lt.jsxs)("section",{className:"shrink-0 lg:w-[46vw]",children:[(0,Lt.jsxs)("div",{ref:h,className:"sc-text max-w-[30em] text-[4.2vw] leading-[1.5] lg:text-[1.2vw]","data-audio":e.audioUrl?"":void 0,children:[e.paragraphs.map((v,x)=>(0,Lt.jsx)("p",{className:x===0?"m-0":"mt-[1em]",children:e.audioUrl?(0,Lt.jsx)(N2,{text:v}):v},x)),e.audioUrl&&(0,Lt.jsx)("audio",{ref:c,src:e.audioUrl,preload:"none"})]}),(0,Lt.jsxs)("a",{href:a?a.href:"#/",className:"group relative mt-[3em] flex h-[3.375em] w-fit items-center gap-[1.1em] overflow-hidden rounded-full pl-[1.1em] pr-[1.5em] text-[0.875rem] font-medium uppercase no-underline",style:{background:"var(--pd-btn-bg)",color:"var(--pd-btn-text)"},children:[(0,Lt.jsx)("span",{"aria-hidden":"true",className:"z-[1] block h-[0.5em] w-[0.5em] rounded-full transition-transform duration-[400ms] ease-[cubic-bezier(.35,0,0,1)] group-hover:translate-x-[5em] group-hover:scale-[26]",style:{background:"var(--pd-btn-text)"}}),(0,Lt.jsx)("span",{className:"relative z-[2] transition-colors duration-500 group-hover:[color:var(--pd-text)]",children:a?"Next chapter":"All chapters"})]}),(0,Lt.jsxs)("div",{className:"mt-[4em] grid grid-cols-2 gap-[4vw] text-[4vw] leading-[1.4] lg:text-[1vw]",children:[(0,Lt.jsxs)("div",{children:[(0,Lt.jsx)("h4",{className:"m-0 mb-[1em] text-[0.8em] font-normal uppercase",style:{color:"var(--pd-highlight)"},children:"Chapter"}),(0,Lt.jsxs)("div",{children:[e.index+1," of ",i]})]}),(0,Lt.jsxs)("div",{children:[(0,Lt.jsx)("h4",{className:"m-0 mb-[1em] text-[0.8em] font-normal uppercase",style:{color:"var(--pd-highlight)"},children:"Navigate"}),s&&(0,Lt.jsx)("div",{children:(0,Lt.jsxs)("a",{href:s.href,className:"underline-offset-4 hover:underline",children:["Previous: ",s.title]})}),a&&(0,Lt.jsx)("div",{children:(0,Lt.jsxs)("a",{href:a.href,className:"underline-offset-4 hover:underline",children:["Next: ",a.title]})}),(0,Lt.jsx)("div",{children:(0,Lt.jsx)("a",{href:"#/",className:"underline-offset-4 hover:underline",children:"All chapters"})})]})]})]})]})})})]})}var ia=Yt(Sn());var hM=0,$g=1,fM=2;var Zc=1,dM=2,rl=3,js=0,Vn=1,Di=2,_s=0,Nr=1,Jc=2,tv=3,ev=4,pM=5;var ka=100,mM=101,gM=102,vM=103,yM=104,xM=200,_M=201,bM=202,SM=203,Rf=204,Nf=205,MM=206,wM=207,EM=208,TM=209,AM=210,CM=211,RM=212,NM=213,LM=214,Lf=0,Df=1,Uf=2,Lr=3,If=4,Of=5,Pf=6,Bf=7,nv=0,DM=1,UM=2,Ji=0,iv=1,sv=2,av=3,rv=4,ov=5,lv=6,cv=7;var uv=300,Qa=301,Ir=302,yd=303,xd=304,Kc=306,zf=1e3,ds=1001,Ff=1002,_n=1003,IM=1004;var Qc=1005;var on=1006,_d=1007;var ja=1008;var $n=1009,hv=1010,fv=1011,ol=1012,bd=1013,Ki=1014,Ui=1015,bs=1016,Sd=1017,Md=1018,ll=1020,dv=35902,pv=35899,mv=1021,gv=1022,Ii=1023,ps=1026,$a=1027,wd=1028,Ed=1029,tr=1030,Td=1031;var Ad=1033,jc=33776,$c=33777,tu=33778,eu=33779,Cd=35840,Rd=35841,Nd=35842,Ld=35843,Dd=36196,Ud=37492,Id=37496,Od=37488,Pd=37489,nu=37490,Bd=37491,zd=37808,Fd=37809,Hd=37810,Vd=37811,Gd=37812,kd=37813,Wd=37814,Xd=37815,qd=37816,Yd=37817,Zd=37818,Jd=37819,Kd=37820,Qd=37821,jd=36492,$d=36494,tp=36495,ep=36283,np=36284,iu=36285,ip=36286;var Cc=2300,Hf=2301,Af=2302,Gg=2303,kg=2400,Wg=2401,Xg=2402;var OM=3200;var su=0,PM=1,ea="",Fn="srgb",Rc="srgb-linear",Nc="linear",ve="srgb";var Cr=7680;var qg=519,BM=512,zM=513,FM=514,sp=515,HM=516,VM=517,ap=518,GM=519,Yg=35044,rp=35048;var vv="300 es",Xi=2e3,Yo=2001;function L2(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function D2(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function Lc(e){return document.createElementNS("http://www.w3.org/1999/xhtml",e)}function kM(){let e=Lc("canvas");return e.style.display="block",e}var I1={},Zo=null;function yv(...e){let t="THREE."+e.shift();Zo?Zo("log",t,...e):console.log(t,...e)}function WM(e){let t=e[0];if(typeof t=="string"&&t.startsWith("TSL:")){let n=e[1];n&&n.isStackTrace?e[0]+=" "+n.getLocation():e[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return e}function It(...e){e=WM(e);let t="THREE."+e.shift();if(Zo)Zo("warn",t,...e);else{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function zt(...e){e=WM(e);let t="THREE."+e.shift();if(Zo)Zo("error",t,...e);else{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function Rr(...e){let t=e.join(" ");t in I1||(I1[t]=!0,It(...e))}function XM(e,t,n){return new Promise(function(i,s){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:s();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:i()}}setTimeout(a,n)})}var qM={[Lf]:Df,[Uf]:Pf,[If]:Bf,[Lr]:Of,[Df]:Lf,[Pf]:Uf,[Bf]:If,[Of]:Lr},ms=class{addEventListener(t,n){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(n)===-1&&i[t].push(n)}hasEventListener(t,n){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(n)!==-1}removeEventListener(t,n){let i=this._listeners;if(i===void 0)return;let s=i[t];if(s!==void 0){let a=s.indexOf(n);a!==-1&&s.splice(a,1)}}dispatchEvent(t){let n=this._listeners;if(n===void 0)return;let i=n[t.type];if(i!==void 0){t.target=this;let s=i.slice(0);for(let a=0,r=s.length;a<r;a++)s[a].call(this,t);t.target=null}}},Dn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Cf=Math.PI/180,Vf=180/Math.PI;function au(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Dn[e&255]+Dn[e>>8&255]+Dn[e>>16&255]+Dn[e>>24&255]+"-"+Dn[t&255]+Dn[t>>8&255]+"-"+Dn[t>>16&15|64]+Dn[t>>24&255]+"-"+Dn[n&63|128]+Dn[n>>8&255]+"-"+Dn[n>>16&255]+Dn[n>>24&255]+Dn[i&255]+Dn[i>>8&255]+Dn[i>>16&255]+Dn[i>>24&255]).toLowerCase()}function ne(e,t,n){return Math.max(t,Math.min(n,e))}function U2(e,t){return(e%t+t)%t}function pg(e,t,n){return(1-n)*e+n*t}function yc(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return e/4294967295;case Uint16Array:return e/65535;case Uint8Array:return e/255;case Int32Array:return Math.max(e/2147483647,-1);case Int16Array:return Math.max(e/32767,-1);case Int8Array:return Math.max(e/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Kn(e,t){switch(t.constructor){case Float32Array:return e;case Uint32Array:return Math.round(e*4294967295);case Uint16Array:return Math.round(e*65535);case Uint8Array:return Math.round(e*255);case Int32Array:return Math.round(e*2147483647);case Int16Array:return Math.round(e*32767);case Int8Array:return Math.round(e*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var wv=class wv{constructor(t=0,n=0){this.x=t,this.y=n}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,n){return this.x=t,this.y=n,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let n=this.x,i=this.y,s=t.elements;return this.x=s[0]*n+s[3]*i+s[6],this.y=s[1]*n+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,n){return this.x=ne(this.x,t.x,n.x),this.y=ne(this.y,t.y,n.y),this}clampScalar(t,n){return this.x=ne(this.x,t,n),this.y=ne(this.y,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ne(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(t)/n;return Math.acos(ne(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let n=this.x-t.x,i=this.y-t.y;return n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this}rotateAround(t,n){let i=Math.cos(n),s=Math.sin(n),a=this.x-t.x,r=this.y-t.y;return this.x=a*i-r*s+t.x,this.y=a*s+r*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};wv.prototype.isVector2=!0;var Rt=wv,jn=class{constructor(t=0,n=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=n,this._z=i,this._w=s}static slerpFlat(t,n,i,s,a,r,o){let l=i[s+0],c=i[s+1],h=i[s+2],d=i[s+3],u=a[r+0],p=a[r+1],m=a[r+2],S=a[r+3];if(d!==S||l!==u||c!==p||h!==m){let g=l*u+c*p+h*m+d*S;g<0&&(u=-u,p=-p,m=-m,S=-S,g=-g);let f=1-o;if(g<.9995){let v=Math.acos(g),x=Math.sin(v);f=Math.sin(f*v)/x,o=Math.sin(o*v)/x,l=l*f+u*o,c=c*f+p*o,h=h*f+m*o,d=d*f+S*o}else{l=l*f+u*o,c=c*f+p*o,h=h*f+m*o,d=d*f+S*o;let v=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=v,c*=v,h*=v,d*=v}}t[n]=l,t[n+1]=c,t[n+2]=h,t[n+3]=d}static multiplyQuaternionsFlat(t,n,i,s,a,r){let o=i[s],l=i[s+1],c=i[s+2],h=i[s+3],d=a[r],u=a[r+1],p=a[r+2],m=a[r+3];return t[n]=o*m+h*d+l*p-c*u,t[n+1]=l*m+h*u+c*d-o*p,t[n+2]=c*m+h*p+o*u-l*d,t[n+3]=h*m-o*d-l*u-c*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,n,i,s){return this._x=t,this._y=n,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,n=!0){let i=t._x,s=t._y,a=t._z,r=t._order,o=Math.cos,l=Math.sin,c=o(i/2),h=o(s/2),d=o(a/2),u=l(i/2),p=l(s/2),m=l(a/2);switch(r){case"XYZ":this._x=u*h*d+c*p*m,this._y=c*p*d-u*h*m,this._z=c*h*m+u*p*d,this._w=c*h*d-u*p*m;break;case"YXZ":this._x=u*h*d+c*p*m,this._y=c*p*d-u*h*m,this._z=c*h*m-u*p*d,this._w=c*h*d+u*p*m;break;case"ZXY":this._x=u*h*d-c*p*m,this._y=c*p*d+u*h*m,this._z=c*h*m+u*p*d,this._w=c*h*d-u*p*m;break;case"ZYX":this._x=u*h*d-c*p*m,this._y=c*p*d+u*h*m,this._z=c*h*m-u*p*d,this._w=c*h*d+u*p*m;break;case"YZX":this._x=u*h*d+c*p*m,this._y=c*p*d+u*h*m,this._z=c*h*m-u*p*d,this._w=c*h*d-u*p*m;break;case"XZY":this._x=u*h*d-c*p*m,this._y=c*p*d-u*h*m,this._z=c*h*m+u*p*d,this._w=c*h*d+u*p*m;break;default:It("Quaternion: .setFromEuler() encountered an unknown order: "+r)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,n){let i=n/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let n=t.elements,i=n[0],s=n[4],a=n[8],r=n[1],o=n[5],l=n[9],c=n[2],h=n[6],d=n[10],u=i+o+d;if(u>0){let p=.5/Math.sqrt(u+1);this._w=.25/p,this._x=(h-l)*p,this._y=(a-c)*p,this._z=(r-s)*p}else if(i>o&&i>d){let p=2*Math.sqrt(1+i-o-d);this._w=(h-l)/p,this._x=.25*p,this._y=(s+r)/p,this._z=(a+c)/p}else if(o>d){let p=2*Math.sqrt(1+o-i-d);this._w=(a-c)/p,this._x=(s+r)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+d-i-o);this._w=(r-s)/p,this._x=(a+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,n){let i=t.dot(n)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*n.z-t.z*n.y,this._y=t.z*n.x-t.x*n.z,this._z=t.x*n.y-t.y*n.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ne(this.dot(t),-1,1)))}rotateTowards(t,n){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,n/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,n){let i=t._x,s=t._y,a=t._z,r=t._w,o=n._x,l=n._y,c=n._z,h=n._w;return this._x=i*h+r*o+s*c-a*l,this._y=s*h+r*l+a*o-i*c,this._z=a*h+r*c+i*l-s*o,this._w=r*h-i*o-s*l-a*c,this._onChangeCallback(),this}slerp(t,n){let i=t._x,s=t._y,a=t._z,r=t._w,o=this.dot(t);o<0&&(i=-i,s=-s,a=-a,r=-r,o=-o);let l=1-n;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,n=Math.sin(n*c)/h,this._x=this._x*l+i*n,this._y=this._y*l+s*n,this._z=this._z*l+a*n,this._w=this._w*l+r*n,this._onChangeCallback()}else this._x=this._x*l+i*n,this._y=this._y*l+s*n,this._z=this._z*l+a*n,this._w=this._w*l+r*n,this.normalize();return this}slerpQuaternions(t,n,i){return this.copy(t).slerp(n,i)}random(){let t=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),a=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),a*Math.sin(n),a*Math.cos(n))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,n=0){return this._x=t[n],this._y=t[n+1],this._z=t[n+2],this._w=t[n+3],this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._w,t}fromBufferAttribute(t,n){return this._x=t.getX(n),this._y=t.getY(n),this._z=t.getZ(n),this._w=t.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Ev=class Ev{constructor(t=0,n=0,i=0){this.x=t,this.y=n,this.z=i}set(t,n,i){return i===void 0&&(i=this.z),this.x=t,this.y=n,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,n){return this.x=t.x*n.x,this.y=t.y*n.y,this.z=t.z*n.z,this}applyEuler(t){return this.applyQuaternion(O1.setFromEuler(t))}applyAxisAngle(t,n){return this.applyQuaternion(O1.setFromAxisAngle(t,n))}applyMatrix3(t){let n=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*n+a[3]*i+a[6]*s,this.y=a[1]*n+a[4]*i+a[7]*s,this.z=a[2]*n+a[5]*i+a[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let n=this.x,i=this.y,s=this.z,a=t.elements,r=1/(a[3]*n+a[7]*i+a[11]*s+a[15]);return this.x=(a[0]*n+a[4]*i+a[8]*s+a[12])*r,this.y=(a[1]*n+a[5]*i+a[9]*s+a[13])*r,this.z=(a[2]*n+a[6]*i+a[10]*s+a[14])*r,this}applyQuaternion(t){let n=this.x,i=this.y,s=this.z,a=t.x,r=t.y,o=t.z,l=t.w,c=2*(r*s-o*i),h=2*(o*n-a*s),d=2*(a*i-r*n);return this.x=n+l*c+r*d-o*h,this.y=i+l*h+o*c-a*d,this.z=s+l*d+a*h-r*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let n=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*n+a[4]*i+a[8]*s,this.y=a[1]*n+a[5]*i+a[9]*s,this.z=a[2]*n+a[6]*i+a[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,n){return this.x=ne(this.x,t.x,n.x),this.y=ne(this.y,t.y,n.y),this.z=ne(this.z,t.z,n.z),this}clampScalar(t,n){return this.x=ne(this.x,t,n),this.y=ne(this.y,t,n),this.z=ne(this.z,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ne(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,n){let i=t.x,s=t.y,a=t.z,r=n.x,o=n.y,l=n.z;return this.x=s*l-a*o,this.y=a*r-i*l,this.z=i*o-s*r,this}projectOnVector(t){let n=t.lengthSq();if(n===0)return this.set(0,0,0);let i=t.dot(this)/n;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return mg.copy(this).projectOnVector(t),this.sub(mg)}reflect(t){return this.sub(mg.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let n=Math.sqrt(this.lengthSq()*t.lengthSq());if(n===0)return Math.PI/2;let i=this.dot(t)/n;return Math.acos(ne(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let n=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return n*n+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,n,i){let s=Math.sin(n)*t;return this.x=s*Math.sin(i),this.y=Math.cos(n)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,n,i){return this.x=t*Math.sin(n),this.y=i,this.z=t*Math.cos(n),this}setFromMatrixPosition(t){let n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(t){let n=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=n,this.y=i,this.z=s,this}setFromMatrixColumn(t,n){return this.fromArray(t.elements,n*4)}setFromMatrix3Column(t,n){return this.fromArray(t.elements,n*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(t),this.y=n,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Ev.prototype.isVector3=!0;var L=Ev,mg=new L,O1=new jn,Tv=class Tv{constructor(t,n,i,s,a,r,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,n,i,s,a,r,o,l,c)}set(t,n,i,s,a,r,o,l,c){let h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=n,h[4]=a,h[5]=l,h[6]=i,h[7]=r,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(t,n,i){return t.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let n=t.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){let i=t.elements,s=n.elements,a=this.elements,r=i[0],o=i[3],l=i[6],c=i[1],h=i[4],d=i[7],u=i[2],p=i[5],m=i[8],S=s[0],g=s[3],f=s[6],v=s[1],x=s[4],y=s[7],M=s[2],w=s[5],E=s[8];return a[0]=r*S+o*v+l*M,a[3]=r*g+o*x+l*w,a[6]=r*f+o*y+l*E,a[1]=c*S+h*v+d*M,a[4]=c*g+h*x+d*w,a[7]=c*f+h*y+d*E,a[2]=u*S+p*v+m*M,a[5]=u*g+p*x+m*w,a[8]=u*f+p*y+m*E,this}multiplyScalar(t){let n=this.elements;return n[0]*=t,n[3]*=t,n[6]*=t,n[1]*=t,n[4]*=t,n[7]*=t,n[2]*=t,n[5]*=t,n[8]*=t,this}determinant(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return n*r*h-n*o*c-i*a*h+i*o*l+s*a*c-s*r*l}invert(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],h=t[8],d=h*r-o*c,u=o*l-h*a,p=c*a-r*l,m=n*d+i*u+s*p;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let S=1/m;return t[0]=d*S,t[1]=(s*c-h*i)*S,t[2]=(o*i-s*r)*S,t[3]=u*S,t[4]=(h*n-s*l)*S,t[5]=(s*a-o*n)*S,t[6]=p*S,t[7]=(i*l-c*n)*S,t[8]=(r*n-i*a)*S,this}transpose(){let t,n=this.elements;return t=n[1],n[1]=n[3],n[3]=t,t=n[2],n[2]=n[6],n[6]=t,t=n[5],n[5]=n[7],n[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let n=this.elements;return t[0]=n[0],t[1]=n[3],t[2]=n[6],t[3]=n[1],t[4]=n[4],t[5]=n[7],t[6]=n[2],t[7]=n[5],t[8]=n[8],this}setUvTransform(t,n,i,s,a,r,o){let l=Math.cos(a),c=Math.sin(a);return this.set(i*l,i*c,-i*(l*r+c*o)+r+t,-s*c,s*l,-s*(-c*r+l*o)+o+n,0,0,1),this}scale(t,n){return Rr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(gg.makeScale(t,n)),this}rotate(t){return Rr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(gg.makeRotation(-t)),this}translate(t,n){return Rr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(gg.makeTranslation(t,n)),this}makeTranslation(t,n){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,n,0,0,1),this}makeRotation(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(t,n){return this.set(t,0,0,0,n,0,0,0,1),this}equals(t){let n=this.elements,i=t.elements;for(let s=0;s<9;s++)if(n[s]!==i[s])return!1;return!0}fromArray(t,n=0){for(let i=0;i<9;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){let i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}};Tv.prototype.isMatrix3=!0;var Vt=Tv,gg=new Vt,P1=new Vt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),B1=new Vt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function I2(){let e={enabled:!0,workingColorSpace:Rc,spaces:{},convert:function(s,a,r){return this.enabled===!1||a===r||!a||!r||(this.spaces[a].transfer===ve&&(s.r=Qs(s.r),s.g=Qs(s.g),s.b=Qs(s.b)),this.spaces[a].primaries!==this.spaces[r].primaries&&(s.applyMatrix3(this.spaces[a].toXYZ),s.applyMatrix3(this.spaces[r].fromXYZ)),this.spaces[r].transfer===ve&&(s.r=qo(s.r),s.g=qo(s.g),s.b=qo(s.b))),s},workingToColorSpace:function(s,a){return this.convert(s,this.workingColorSpace,a)},colorSpaceToWorking:function(s,a){return this.convert(s,a,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===ea?Nc:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,a=this.workingColorSpace){return s.fromArray(this.spaces[a].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,a,r){return s.copy(this.spaces[a].toXYZ).multiply(this.spaces[r].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,a){return Rr("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),e.workingToColorSpace(s,a)},toWorkingColorSpace:function(s,a){return Rr("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),e.colorSpaceToWorking(s,a)}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],i=[.3127,.329];return e.define({[Rc]:{primaries:t,whitePoint:i,transfer:Nc,toXYZ:P1,fromXYZ:B1,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Fn},outputColorSpaceConfig:{drawingBufferColorSpace:Fn}},[Fn]:{primaries:t,whitePoint:i,transfer:ve,toXYZ:P1,fromXYZ:B1,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Fn}}}),e}var se=I2();function Qs(e){return e<.04045?e*.0773993808:Math.pow(e*.9478672986+.0521327014,2.4)}function qo(e){return e<.0031308?e*12.92:1.055*Math.pow(e,.41666)-.055}var Uo,Gf=class{static getDataURL(t,n="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement=="undefined")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{Uo===void 0&&(Uo=Lc("canvas")),Uo.width=t.width,Uo.height=t.height;let s=Uo.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),i=Uo}return i.toDataURL(n)}static sRGBToLinear(t){if(typeof HTMLImageElement!="undefined"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&t instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&t instanceof ImageBitmap){let n=Lc("canvas");n.width=t.width,n.height=t.height;let i=n.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let s=i.getImageData(0,0,t.width,t.height),a=s.data;for(let r=0;r<a.length;r++)a[r]=Qs(a[r]/255)*255;return i.putImageData(s,0,0),n}else if(t.data){let n=t.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(Qs(n[i]/255)*255):n[i]=Qs(n[i]);return{data:n,width:t.width,height:t.height}}else return It("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},O2=0,Jo=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:O2++}),this.uuid=au(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let n=this.data;return typeof HTMLVideoElement!="undefined"&&n instanceof HTMLVideoElement?t.set(n.videoWidth,n.videoHeight,0):typeof VideoFrame!="undefined"&&n instanceof VideoFrame?t.set(n.displayWidth,n.displayHeight,0):n!==null?t.set(n.width,n.height,n.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let n=t===void 0||typeof t=="string";if(!n&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let a;if(Array.isArray(s)){a=[];for(let r=0,o=s.length;r<o;r++)s[r].isDataTexture?a.push(vg(s[r].image)):a.push(vg(s[r]))}else a=vg(s);i.url=a}return n||(t.images[this.uuid]=i),i}};function vg(e){return typeof HTMLImageElement!="undefined"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&e instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&e instanceof ImageBitmap?Gf.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(It("Texture: Unable to serialize Texture."),{})}var P2=0,yg=new L,Hn=class e extends ms{constructor(t=e.DEFAULT_IMAGE,n=e.DEFAULT_MAPPING,i=ds,s=ds,a=on,r=ja,o=Ii,l=$n,c=e.DEFAULT_ANISOTROPY,h=ea){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:P2++}),this.uuid=au(),this.name="",this.source=new Jo(t),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=a,this.minFilter=r,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Rt(0,0),this.repeat=new Rt(1,1),this.center=new Rt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Vt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(yg).x}get height(){return this.source.getSize(yg).y}get depth(){return this.source.getSize(yg).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let n in t){let i=t[n];if(i===void 0){It(`Texture.setValues(): parameter '${n}' has value of undefined.`);continue}let s=this[n];if(s===void 0){It(`Texture.setValues(): property '${n}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[n]=i}}toJSON(t){let n=t===void 0||typeof t=="string";if(!n&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==uv)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case zf:t.x=t.x-Math.floor(t.x);break;case ds:t.x=t.x<0?0:1;break;case Ff:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case zf:t.y=t.y-Math.floor(t.y);break;case ds:t.y=t.y<0?0:1;break;case Ff:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Hn.DEFAULT_IMAGE=null;Hn.DEFAULT_MAPPING=uv;Hn.DEFAULT_ANISOTROPY=1;var Av=class Av{constructor(t=0,n=0,i=0,s=1){this.x=t,this.y=n,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,n,i,s){return this.x=t,this.y=n,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,n){switch(t){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,n){return this.x=t.x+n.x,this.y=t.y+n.y,this.z=t.z+n.z,this.w=t.w+n.w,this}addScaledVector(t,n){return this.x+=t.x*n,this.y+=t.y*n,this.z+=t.z*n,this.w+=t.w*n,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,n){return this.x=t.x-n.x,this.y=t.y-n.y,this.z=t.z-n.z,this.w=t.w-n.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let n=this.x,i=this.y,s=this.z,a=this.w,r=t.elements;return this.x=r[0]*n+r[4]*i+r[8]*s+r[12]*a,this.y=r[1]*n+r[5]*i+r[9]*s+r[13]*a,this.z=r[2]*n+r[6]*i+r[10]*s+r[14]*a,this.w=r[3]*n+r[7]*i+r[11]*s+r[15]*a,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let n=Math.sqrt(1-t.w*t.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/n,this.y=t.y/n,this.z=t.z/n),this}setAxisAngleFromRotationMatrix(t){let n,i,s,a,l=t.elements,c=l[0],h=l[4],d=l[8],u=l[1],p=l[5],m=l[9],S=l[2],g=l[6],f=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-S)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+S)<.1&&Math.abs(m+g)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;let x=(c+1)/2,y=(p+1)/2,M=(f+1)/2,w=(h+u)/4,E=(d+S)/4,b=(m+g)/4;return x>y&&x>M?x<.01?(i=0,s=.707106781,a=.707106781):(i=Math.sqrt(x),s=w/i,a=E/i):y>M?y<.01?(i=.707106781,s=0,a=.707106781):(s=Math.sqrt(y),i=w/s,a=b/s):M<.01?(i=.707106781,s=.707106781,a=0):(a=Math.sqrt(M),i=E/a,s=b/a),this.set(i,s,a,n),this}let v=Math.sqrt((g-m)*(g-m)+(d-S)*(d-S)+(u-h)*(u-h));return Math.abs(v)<.001&&(v=1),this.x=(g-m)/v,this.y=(d-S)/v,this.z=(u-h)/v,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(t){let n=t.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,n){return this.x=ne(this.x,t.x,n.x),this.y=ne(this.y,t.y,n.y),this.z=ne(this.z,t.z,n.z),this.w=ne(this.w,t.w,n.w),this}clampScalar(t,n){return this.x=ne(this.x,t,n),this.y=ne(this.y,t,n),this.z=ne(this.z,t,n),this.w=ne(this.w,t,n),this}clampLength(t,n){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ne(i,t,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,n){return this.x+=(t.x-this.x)*n,this.y+=(t.y-this.y)*n,this.z+=(t.z-this.z)*n,this.w+=(t.w-this.w)*n,this}lerpVectors(t,n,i){return this.x=t.x+(n.x-t.x)*i,this.y=t.y+(n.y-t.y)*i,this.z=t.z+(n.z-t.z)*i,this.w=t.w+(n.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,n=0){return this.x=t[n],this.y=t[n+1],this.z=t[n+2],this.w=t[n+3],this}toArray(t=[],n=0){return t[n]=this.x,t[n+1]=this.y,t[n+2]=this.z,t[n+3]=this.w,t}fromBufferAttribute(t,n){return this.x=t.getX(n),this.y=t.getY(n),this.z=t.getZ(n),this.w=t.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Av.prototype.isVector4=!0;var Ne=Av,kf=class extends ms{constructor(t=1,n=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:on,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=n,this.depth=i.depth,this.scissor=new Ne(0,0,t,n),this.scissorTest=!1,this.viewport=new Ne(0,0,t,n),this.textures=[];let s={width:t,height:n,depth:i.depth},a=new Hn(s),r=i.count;for(let o=0;o<r;o++)this.textures[o]=a.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let n={minFilter:on,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(n.mapping=t.mapping),t.wrapS!==void 0&&(n.wrapS=t.wrapS),t.wrapT!==void 0&&(n.wrapT=t.wrapT),t.wrapR!==void 0&&(n.wrapR=t.wrapR),t.magFilter!==void 0&&(n.magFilter=t.magFilter),t.minFilter!==void 0&&(n.minFilter=t.minFilter),t.format!==void 0&&(n.format=t.format),t.type!==void 0&&(n.type=t.type),t.anisotropy!==void 0&&(n.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(n.colorSpace=t.colorSpace),t.flipY!==void 0&&(n.flipY=t.flipY),t.generateMipmaps!==void 0&&(n.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(n.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(n)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,n,i=1){if(this.width!==t||this.height!==n||this.depth!==i){this.width=t,this.height=n,this.depth=i;for(let s=0,a=this.textures.length;s<a;s++)this.textures[s].image.width=t,this.textures[s].image.height=n,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,n),this.scissor.set(0,0,t,n)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,i=t.textures.length;n<i;n++){this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0,this.textures[n].renderTarget=this;let s=Object.assign({},t.textures[n].image);this.textures[n].source=new Jo(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},pi=class extends kf{constructor(t=1,n=1,i={}){super(t,n,i),this.isWebGLRenderTarget=!0}},Dc=class extends Hn{constructor(t=null,n=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:n,height:i,depth:s},this.magFilter=_n,this.minFilter=_n,this.wrapR=ds,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Wf=class extends Hn{constructor(t=null,n=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:n,height:i,depth:s},this.magFilter=_n,this.minFilter=_n,this.wrapR=ds,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var vd=class vd{constructor(t,n,i,s,a,r,o,l,c,h,d,u,p,m,S,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,n,i,s,a,r,o,l,c,h,d,u,p,m,S,g)}set(t,n,i,s,a,r,o,l,c,h,d,u,p,m,S,g){let f=this.elements;return f[0]=t,f[4]=n,f[8]=i,f[12]=s,f[1]=a,f[5]=r,f[9]=o,f[13]=l,f[2]=c,f[6]=h,f[10]=d,f[14]=u,f[3]=p,f[7]=m,f[11]=S,f[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new vd().fromArray(this.elements)}copy(t){let n=this.elements,i=t.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(t){let n=this.elements,i=t.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(t){let n=t.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(t,n,i){return this.determinantAffine()===0?(t.set(1,0,0),n.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,n,i){return this.set(t.x,n.x,i.x,0,t.y,n.y,i.y,0,t.z,n.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let n=this.elements,i=t.elements,s=1/Io.setFromMatrixColumn(t,0).length(),a=1/Io.setFromMatrixColumn(t,1).length(),r=1/Io.setFromMatrixColumn(t,2).length();return n[0]=i[0]*s,n[1]=i[1]*s,n[2]=i[2]*s,n[3]=0,n[4]=i[4]*a,n[5]=i[5]*a,n[6]=i[6]*a,n[7]=0,n[8]=i[8]*r,n[9]=i[9]*r,n[10]=i[10]*r,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(t){let n=this.elements,i=t.x,s=t.y,a=t.z,r=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(a),d=Math.sin(a);if(t.order==="XYZ"){let u=r*h,p=r*d,m=o*h,S=o*d;n[0]=l*h,n[4]=-l*d,n[8]=c,n[1]=p+m*c,n[5]=u-S*c,n[9]=-o*l,n[2]=S-u*c,n[6]=m+p*c,n[10]=r*l}else if(t.order==="YXZ"){let u=l*h,p=l*d,m=c*h,S=c*d;n[0]=u+S*o,n[4]=m*o-p,n[8]=r*c,n[1]=r*d,n[5]=r*h,n[9]=-o,n[2]=p*o-m,n[6]=S+u*o,n[10]=r*l}else if(t.order==="ZXY"){let u=l*h,p=l*d,m=c*h,S=c*d;n[0]=u-S*o,n[4]=-r*d,n[8]=m+p*o,n[1]=p+m*o,n[5]=r*h,n[9]=S-u*o,n[2]=-r*c,n[6]=o,n[10]=r*l}else if(t.order==="ZYX"){let u=r*h,p=r*d,m=o*h,S=o*d;n[0]=l*h,n[4]=m*c-p,n[8]=u*c+S,n[1]=l*d,n[5]=S*c+u,n[9]=p*c-m,n[2]=-c,n[6]=o*l,n[10]=r*l}else if(t.order==="YZX"){let u=r*l,p=r*c,m=o*l,S=o*c;n[0]=l*h,n[4]=S-u*d,n[8]=m*d+p,n[1]=d,n[5]=r*h,n[9]=-o*h,n[2]=-c*h,n[6]=p*d+m,n[10]=u-S*d}else if(t.order==="XZY"){let u=r*l,p=r*c,m=o*l,S=o*c;n[0]=l*h,n[4]=-d,n[8]=c*h,n[1]=u*d+S,n[5]=r*h,n[9]=p*d-m,n[2]=m*d-p,n[6]=o*h,n[10]=S*d+u}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(t){return this.compose(B2,t,z2)}lookAt(t,n,i){let s=this.elements;return fi.subVectors(t,n),fi.lengthSq()===0&&(fi.z=1),fi.normalize(),Ba.crossVectors(i,fi),Ba.lengthSq()===0&&(Math.abs(i.z)===1?fi.x+=1e-4:fi.z+=1e-4,fi.normalize(),Ba.crossVectors(i,fi)),Ba.normalize(),jh.crossVectors(fi,Ba),s[0]=Ba.x,s[4]=jh.x,s[8]=fi.x,s[1]=Ba.y,s[5]=jh.y,s[9]=fi.y,s[2]=Ba.z,s[6]=jh.z,s[10]=fi.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,n){let i=t.elements,s=n.elements,a=this.elements,r=i[0],o=i[4],l=i[8],c=i[12],h=i[1],d=i[5],u=i[9],p=i[13],m=i[2],S=i[6],g=i[10],f=i[14],v=i[3],x=i[7],y=i[11],M=i[15],w=s[0],E=s[4],b=s[8],A=s[12],R=s[1],N=s[5],I=s[9],G=s[13],q=s[2],O=s[6],H=s[10],D=s[14],X=s[3],Q=s[7],it=s[11],rt=s[15];return a[0]=r*w+o*R+l*q+c*X,a[4]=r*E+o*N+l*O+c*Q,a[8]=r*b+o*I+l*H+c*it,a[12]=r*A+o*G+l*D+c*rt,a[1]=h*w+d*R+u*q+p*X,a[5]=h*E+d*N+u*O+p*Q,a[9]=h*b+d*I+u*H+p*it,a[13]=h*A+d*G+u*D+p*rt,a[2]=m*w+S*R+g*q+f*X,a[6]=m*E+S*N+g*O+f*Q,a[10]=m*b+S*I+g*H+f*it,a[14]=m*A+S*G+g*D+f*rt,a[3]=v*w+x*R+y*q+M*X,a[7]=v*E+x*N+y*O+M*Q,a[11]=v*b+x*I+y*H+M*it,a[15]=v*A+x*G+y*D+M*rt,this}multiplyScalar(t){let n=this.elements;return n[0]*=t,n[4]*=t,n[8]*=t,n[12]*=t,n[1]*=t,n[5]*=t,n[9]*=t,n[13]*=t,n[2]*=t,n[6]*=t,n[10]*=t,n[14]*=t,n[3]*=t,n[7]*=t,n[11]*=t,n[15]*=t,this}determinant(){let t=this.elements,n=t[0],i=t[4],s=t[8],a=t[12],r=t[1],o=t[5],l=t[9],c=t[13],h=t[2],d=t[6],u=t[10],p=t[14],m=t[3],S=t[7],g=t[11],f=t[15],v=l*p-c*u,x=o*p-c*d,y=o*u-l*d,M=r*p-c*h,w=r*u-l*h,E=r*d-o*h;return n*(S*v-g*x+f*y)-i*(m*v-g*M+f*w)+s*(m*x-S*M+f*E)-a*(m*y-S*w+g*E)}determinantAffine(){let t=this.elements,n=t[0],i=t[4],s=t[8],a=t[1],r=t[5],o=t[9],l=t[2],c=t[6],h=t[10];return n*(r*h-o*c)-i*(a*h-o*l)+s*(a*c-r*l)}transpose(){let t=this.elements,n;return n=t[1],t[1]=t[4],t[4]=n,n=t[2],t[2]=t[8],t[8]=n,n=t[6],t[6]=t[9],t[9]=n,n=t[3],t[3]=t[12],t[12]=n,n=t[7],t[7]=t[13],t[13]=n,n=t[11],t[11]=t[14],t[14]=n,this}setPosition(t,n,i){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=n,s[14]=i),this}invert(){let t=this.elements,n=t[0],i=t[1],s=t[2],a=t[3],r=t[4],o=t[5],l=t[6],c=t[7],h=t[8],d=t[9],u=t[10],p=t[11],m=t[12],S=t[13],g=t[14],f=t[15],v=n*o-i*r,x=n*l-s*r,y=n*c-a*r,M=i*l-s*o,w=i*c-a*o,E=s*c-a*l,b=h*S-d*m,A=h*g-u*m,R=h*f-p*m,N=d*g-u*S,I=d*f-p*S,G=u*f-p*g,q=v*G-x*I+y*N+M*R-w*A+E*b;if(q===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let O=1/q;return t[0]=(o*G-l*I+c*N)*O,t[1]=(s*I-i*G-a*N)*O,t[2]=(S*E-g*w+f*M)*O,t[3]=(u*w-d*E-p*M)*O,t[4]=(l*R-r*G-c*A)*O,t[5]=(n*G-s*R+a*A)*O,t[6]=(g*y-m*E-f*x)*O,t[7]=(h*E-u*y+p*x)*O,t[8]=(r*I-o*R+c*b)*O,t[9]=(i*R-n*I-a*b)*O,t[10]=(m*w-S*y+f*v)*O,t[11]=(d*y-h*w-p*v)*O,t[12]=(o*A-r*N-l*b)*O,t[13]=(n*N-i*A+s*b)*O,t[14]=(S*x-m*M-g*v)*O,t[15]=(h*M-d*x+u*v)*O,this}scale(t){let n=this.elements,i=t.x,s=t.y,a=t.z;return n[0]*=i,n[4]*=s,n[8]*=a,n[1]*=i,n[5]*=s,n[9]*=a,n[2]*=i,n[6]*=s,n[10]*=a,n[3]*=i,n[7]*=s,n[11]*=a,this}getMaxScaleOnAxis(){let t=this.elements,n=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(n,i,s))}makeTranslation(t,n,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(t){let n=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(t){let n=Math.cos(t),i=Math.sin(t);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,n){let i=Math.cos(n),s=Math.sin(n),a=1-i,r=t.x,o=t.y,l=t.z,c=a*r,h=a*o;return this.set(c*r+i,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+i,h*l-s*r,0,c*l-s*o,h*l+s*r,a*l*l+i,0,0,0,0,1),this}makeScale(t,n,i){return this.set(t,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,n,i,s,a,r){return this.set(1,i,a,0,t,1,r,0,n,s,1,0,0,0,0,1),this}compose(t,n,i){let s=this.elements,a=n._x,r=n._y,o=n._z,l=n._w,c=a+a,h=r+r,d=o+o,u=a*c,p=a*h,m=a*d,S=r*h,g=r*d,f=o*d,v=l*c,x=l*h,y=l*d,M=i.x,w=i.y,E=i.z;return s[0]=(1-(S+f))*M,s[1]=(p+y)*M,s[2]=(m-x)*M,s[3]=0,s[4]=(p-y)*w,s[5]=(1-(u+f))*w,s[6]=(g+v)*w,s[7]=0,s[8]=(m+x)*E,s[9]=(g-v)*E,s[10]=(1-(u+S))*E,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,n,i){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let a=this.determinantAffine();if(a===0)return i.set(1,1,1),n.identity(),this;let r=Io.set(s[0],s[1],s[2]).length(),o=Io.set(s[4],s[5],s[6]).length(),l=Io.set(s[8],s[9],s[10]).length();a<0&&(r=-r),Gi.copy(this);let c=1/r,h=1/o,d=1/l;return Gi.elements[0]*=c,Gi.elements[1]*=c,Gi.elements[2]*=c,Gi.elements[4]*=h,Gi.elements[5]*=h,Gi.elements[6]*=h,Gi.elements[8]*=d,Gi.elements[9]*=d,Gi.elements[10]*=d,n.setFromRotationMatrix(Gi),i.x=r,i.y=o,i.z=l,this}makePerspective(t,n,i,s,a,r,o=Xi,l=!1){let c=this.elements,h=2*a/(n-t),d=2*a/(i-s),u=(n+t)/(n-t),p=(i+s)/(i-s),m,S;if(l)m=a/(r-a),S=r*a/(r-a);else if(o===Xi)m=-(r+a)/(r-a),S=-2*r*a/(r-a);else if(o===Yo)m=-r/(r-a),S=-r*a/(r-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=S,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,n,i,s,a,r,o=Xi,l=!1){let c=this.elements,h=2/(n-t),d=2/(i-s),u=-(n+t)/(n-t),p=-(i+s)/(i-s),m,S;if(l)m=1/(r-a),S=r/(r-a);else if(o===Xi)m=-2/(r-a),S=-(r+a)/(r-a);else if(o===Yo)m=-1/(r-a),S=-a/(r-a);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=m,c[14]=S,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let n=this.elements,i=t.elements;for(let s=0;s<16;s++)if(n[s]!==i[s])return!1;return!0}fromArray(t,n=0){for(let i=0;i<16;i++)this.elements[i]=t[i+n];return this}toArray(t=[],n=0){let i=this.elements;return t[n]=i[0],t[n+1]=i[1],t[n+2]=i[2],t[n+3]=i[3],t[n+4]=i[4],t[n+5]=i[5],t[n+6]=i[6],t[n+7]=i[7],t[n+8]=i[8],t[n+9]=i[9],t[n+10]=i[10],t[n+11]=i[11],t[n+12]=i[12],t[n+13]=i[13],t[n+14]=i[14],t[n+15]=i[15],t}};vd.prototype.isMatrix4=!0;var fe=vd,Io=new L,Gi=new fe,B2=new L(0,0,0),z2=new L(1,1,1),Ba=new L,jh=new L,fi=new L,z1=new fe,F1=new jn,qi=class e{constructor(t=0,n=0,i=0,s=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,n,i,s=this._order){return this._x=t,this._y=n,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,n=this._order,i=!0){let s=t.elements,a=s[0],r=s[4],o=s[8],l=s[1],c=s[5],h=s[9],d=s[2],u=s[6],p=s[10];switch(n){case"XYZ":this._y=Math.asin(ne(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-r,a)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ne(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,a),this._z=0);break;case"ZXY":this._x=Math.asin(ne(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-r,c)):(this._y=0,this._z=Math.atan2(l,a));break;case"ZYX":this._y=Math.asin(-ne(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,p),this._z=Math.atan2(l,a)):(this._x=0,this._z=Math.atan2(-r,c));break;case"YZX":this._z=Math.asin(ne(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,a)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-ne(r,-1,1)),Math.abs(r)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,a)):(this._x=Math.atan2(-h,p),this._y=0);break;default:It("Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,n,i){return z1.makeRotationFromQuaternion(t),this.setFromRotationMatrix(z1,n,i)}setFromVector3(t,n=this._order){return this.set(t.x,t.y,t.z,n)}reorder(t){return F1.setFromEuler(this),this.setFromQuaternion(F1,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],n=0){return t[n]=this._x,t[n+1]=this._y,t[n+2]=this._z,t[n+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};qi.DEFAULT_ORDER="XYZ";var Uc=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},F2=0,H1=new L,Oo=new jn,Xs=new fe,$h=new L,xc=new L,H2=new L,V2=new jn,V1=new L(1,0,0),G1=new L(0,1,0),k1=new L(0,0,1),W1={type:"added"},G2={type:"removed"},Po={type:"childadded",child:null},xg={type:"childremoved",child:null},Cn=class e extends ms{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:F2++}),this.uuid=au(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new L,n=new qi,i=new jn,s=new L(1,1,1);function a(){i.setFromEuler(n,!1)}function r(){n.setFromQuaternion(i,void 0,!1)}n._onChange(a),i._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new fe},normalMatrix:{value:new Vt}}),this.matrix=new fe,this.matrixWorld=new fe,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Uc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,n){this.quaternion.setFromAxisAngle(t,n)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,n){return Oo.setFromAxisAngle(t,n),this.quaternion.multiply(Oo),this}rotateOnWorldAxis(t,n){return Oo.setFromAxisAngle(t,n),this.quaternion.premultiply(Oo),this}rotateX(t){return this.rotateOnAxis(V1,t)}rotateY(t){return this.rotateOnAxis(G1,t)}rotateZ(t){return this.rotateOnAxis(k1,t)}translateOnAxis(t,n){return H1.copy(t).applyQuaternion(this.quaternion),this.position.add(H1.multiplyScalar(n)),this}translateX(t){return this.translateOnAxis(V1,t)}translateY(t){return this.translateOnAxis(G1,t)}translateZ(t){return this.translateOnAxis(k1,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Xs.copy(this.matrixWorld).invert())}lookAt(t,n,i){t.isVector3?$h.copy(t):$h.set(t,n,i);let s=this.parent;this.updateWorldMatrix(!0,!1),xc.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Xs.lookAt(xc,$h,this.up):Xs.lookAt($h,xc,this.up),this.quaternion.setFromRotationMatrix(Xs),s&&(Xs.extractRotation(s.matrixWorld),Oo.setFromRotationMatrix(Xs),this.quaternion.premultiply(Oo.invert()))}add(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return t===this?(zt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(W1),Po.child=t,this.dispatchEvent(Po),Po.child=null):zt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let n=this.children.indexOf(t);return n!==-1&&(t.parent=null,this.children.splice(n,1),t.dispatchEvent(G2),xg.child=t,this.dispatchEvent(xg),xg.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Xs.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Xs.multiply(t.parent.matrixWorld)),t.applyMatrix4(Xs),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(W1),Po.child=t,this.dispatchEvent(Po),Po.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,n){if(this[t]===n)return this;for(let i=0,s=this.children.length;i<s;i++){let r=this.children[i].getObjectByProperty(t,n);if(r!==void 0)return r}}getObjectsByProperty(t,n,i=[]){this[t]===n&&i.push(this);let s=this.children;for(let a=0,r=s.length;a<r;a++)s[a].getObjectsByProperty(t,n,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(xc,t,H2),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(xc,V2,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let n=this.matrixWorld.elements;return t.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(t){t(this);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverseVisible(t)}traverseAncestors(t){let n=this.parent;n!==null&&(t(n),n.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let n=t.x,i=t.y,s=t.z,a=this.matrix.elements;a[12]+=n-a[0]*n-a[4]*i-a[8]*s,a[13]+=i-a[1]*n-a[5]*i-a[9]*s,a[14]+=s-a[2]*n-a[6]*i-a[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].updateMatrixWorld(t)}updateWorldMatrix(t,n,i=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),n===!0){let a=this.children;for(let r=0,o=a.length;r<o;r++)a[r].updateWorldMatrix(!1,!0,i)}}toJSON(t){let n=t===void 0||typeof t=="string",i={};n&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function a(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=a(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];a(t.shapes,d)}else a(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(a(t.materials,this.material[l]));s.material=o}else s.material=a(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(a(t.animations,l))}}if(n){let o=r(t.geometries),l=r(t.materials),c=r(t.textures),h=r(t.images),d=r(t.shapes),u=r(t.skeletons),p=r(t.animations),m=r(t.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),u.length>0&&(i.skeletons=u),p.length>0&&(i.animations=p),m.length>0&&(i.nodes=m)}return i.object=s,i;function r(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,n=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),n===!0)for(let i=0;i<t.children.length;i++){let s=t.children[i];this.add(s.clone())}return this}};Cn.DEFAULT_UP=new L(0,1,0);Cn.DEFAULT_MATRIX_AUTO_UPDATE=!0;Cn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Qn=class extends Cn{constructor(){super(),this.isGroup=!0,this.type="Group"}},k2={type:"move"},Ko=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Qn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Qn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Qn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let n=this._hand;if(n)for(let i of t.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,n,i){let s=null,a=null,r=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&n.session.visibilityState!=="visible-blurred"){if(c&&t.hand){r=!0;for(let S of t.hand.values()){let g=n.getJointPose(S,i),f=this._getHandJoint(c,S);g!==null&&(f.matrix.fromArray(g.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=g.radius),f.visible=g!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),p=.02,m=.005;c.inputState.pinching&&u>p+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=p-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(a=n.getPose(t.gripSpace,i),a!==null&&(l.matrix.fromArray(a.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,a.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(a.linearVelocity)):l.hasLinearVelocity=!1,a.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(a.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=n.getPose(t.targetRaySpace,i),s===null&&a!==null&&(s=a),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(k2)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=a!==null),c!==null&&(c.visible=r!==null),this}_getHandJoint(t,n){if(t.joints[n.jointName]===void 0){let i=new Qn;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[n.jointName]=i,t.add(i)}return t.joints[n.jointName]}},YM={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},za={h:0,s:0,l:0},tf={h:0,s:0,l:0};function _g(e,t,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var Ot=class{constructor(t,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,n,i)}set(t,n,i){if(n===void 0&&i===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,n,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,n=Fn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,se.colorSpaceToWorking(this,n),this}setRGB(t,n,i,s=se.workingColorSpace){return this.r=t,this.g=n,this.b=i,se.colorSpaceToWorking(this,s),this}setHSL(t,n,i,s=se.workingColorSpace){if(t=U2(t,1),n=ne(n,0,1),i=ne(i,0,1),n===0)this.r=this.g=this.b=i;else{let a=i<=.5?i*(1+n):i+n-i*n,r=2*i-a;this.r=_g(r,a,t+1/3),this.g=_g(r,a,t),this.b=_g(r,a,t-1/3)}return se.colorSpaceToWorking(this,s),this}setStyle(t,n=Fn){function i(a){a!==void 0&&parseFloat(a)<1&&It("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let a,r=s[1],o=s[2];switch(r){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,n);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,n);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,n);break;default:It("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let a=s[1],r=a.length;if(r===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,n);if(r===6)return this.setHex(parseInt(a,16),n);It("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,n);return this}setColorName(t,n=Fn){let i=YM[t.toLowerCase()];return i!==void 0?this.setHex(i,n):It("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Qs(t.r),this.g=Qs(t.g),this.b=Qs(t.b),this}copyLinearToSRGB(t){return this.r=qo(t.r),this.g=qo(t.g),this.b=qo(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Fn){return se.workingToColorSpace(Un.copy(this),t),Math.round(ne(Un.r*255,0,255))*65536+Math.round(ne(Un.g*255,0,255))*256+Math.round(ne(Un.b*255,0,255))}getHexString(t=Fn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,n=se.workingColorSpace){se.workingToColorSpace(Un.copy(this),n);let i=Un.r,s=Un.g,a=Un.b,r=Math.max(i,s,a),o=Math.min(i,s,a),l,c,h=(o+r)/2;if(o===r)l=0,c=0;else{let d=r-o;switch(c=h<=.5?d/(r+o):d/(2-r-o),r){case i:l=(s-a)/d+(s<a?6:0);break;case s:l=(a-i)/d+2;break;case a:l=(i-s)/d+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,n=se.workingColorSpace){return se.workingToColorSpace(Un.copy(this),n),t.r=Un.r,t.g=Un.g,t.b=Un.b,t}getStyle(t=Fn){se.workingToColorSpace(Un.copy(this),t);let n=Un.r,i=Un.g,s=Un.b;return t!==Fn?`color(${t} ${n.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,n,i){return this.getHSL(za),this.setHSL(za.h+t,za.s+n,za.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,n){return this.r=t.r+n.r,this.g=t.g+n.g,this.b=t.b+n.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,n){return this.r+=(t.r-this.r)*n,this.g+=(t.g-this.g)*n,this.b+=(t.b-this.b)*n,this}lerpColors(t,n,i){return this.r=t.r+(n.r-t.r)*i,this.g=t.g+(n.g-t.g)*i,this.b=t.b+(n.b-t.b)*i,this}lerpHSL(t,n){this.getHSL(za),t.getHSL(tf);let i=pg(za.h,tf.h,n),s=pg(za.s,tf.s,n),a=pg(za.l,tf.l,n);return this.setHSL(i,s,a),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let n=this.r,i=this.g,s=this.b,a=t.elements;return this.r=a[0]*n+a[3]*i+a[6]*s,this.g=a[1]*n+a[4]*i+a[7]*s,this.b=a[2]*n+a[5]*i+a[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,n=0){return this.r=t[n],this.g=t[n+1],this.b=t[n+2],this}toArray(t=[],n=0){return t[n]=this.r,t[n+1]=this.g,t[n+2]=this.b,t}fromBufferAttribute(t,n){return this.r=t.getX(n),this.g=t.getY(n),this.b=t.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Un=new Ot;Ot.NAMES=YM;var Ic=class e{constructor(t,n=1,i=1e3){this.isFog=!0,this.name="",this.color=new Ot(t),this.near=n,this.far=i}clone(){return new e(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Yi=class extends Cn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new qi,this.environmentIntensity=1,this.environmentRotation=new qi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,n){return super.copy(t,n),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let n=super.toJSON(t);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(n.object.environmentIntensity=this.environmentIntensity),n.object.environmentRotation=this.environmentRotation.toArray(),n}},ki=new L,qs=new L,bg=new L,Ys=new L,Bo=new L,zo=new L,X1=new L,Sg=new L,Mg=new L,wg=new L,Eg=new Ne,Tg=new Ne,Ag=new Ne,Ks=class e{constructor(t=new L,n=new L,i=new L){this.a=t,this.b=n,this.c=i}static getNormal(t,n,i,s){s.subVectors(i,n),ki.subVectors(t,n),s.cross(ki);let a=s.lengthSq();return a>0?s.multiplyScalar(1/Math.sqrt(a)):s.set(0,0,0)}static getBarycoord(t,n,i,s,a){ki.subVectors(s,n),qs.subVectors(i,n),bg.subVectors(t,n);let r=ki.dot(ki),o=ki.dot(qs),l=ki.dot(bg),c=qs.dot(qs),h=qs.dot(bg),d=r*c-o*o;if(d===0)return a.set(0,0,0),null;let u=1/d,p=(c*l-o*h)*u,m=(r*h-o*l)*u;return a.set(1-p-m,m,p)}static containsPoint(t,n,i,s){return this.getBarycoord(t,n,i,s,Ys)===null?!1:Ys.x>=0&&Ys.y>=0&&Ys.x+Ys.y<=1}static getInterpolation(t,n,i,s,a,r,o,l){return this.getBarycoord(t,n,i,s,Ys)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(a,Ys.x),l.addScaledVector(r,Ys.y),l.addScaledVector(o,Ys.z),l)}static getInterpolatedAttribute(t,n,i,s,a,r){return Eg.setScalar(0),Tg.setScalar(0),Ag.setScalar(0),Eg.fromBufferAttribute(t,n),Tg.fromBufferAttribute(t,i),Ag.fromBufferAttribute(t,s),r.setScalar(0),r.addScaledVector(Eg,a.x),r.addScaledVector(Tg,a.y),r.addScaledVector(Ag,a.z),r}static isFrontFacing(t,n,i,s){return ki.subVectors(i,n),qs.subVectors(t,n),ki.cross(qs).dot(s)<0}set(t,n,i){return this.a.copy(t),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(t,n,i,s){return this.a.copy(t[n]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,n,i,s){return this.a.fromBufferAttribute(t,n),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return ki.subVectors(this.c,this.b),qs.subVectors(this.a,this.b),ki.cross(qs).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,i,s,a){return e.getInterpolation(t,this.a,this.b,this.c,n,i,s,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,n){let i=this.a,s=this.b,a=this.c,r,o;Bo.subVectors(s,i),zo.subVectors(a,i),Sg.subVectors(t,i);let l=Bo.dot(Sg),c=zo.dot(Sg);if(l<=0&&c<=0)return n.copy(i);Mg.subVectors(t,s);let h=Bo.dot(Mg),d=zo.dot(Mg);if(h>=0&&d<=h)return n.copy(s);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return r=l/(l-h),n.copy(i).addScaledVector(Bo,r);wg.subVectors(t,a);let p=Bo.dot(wg),m=zo.dot(wg);if(m>=0&&p<=m)return n.copy(a);let S=p*c-l*m;if(S<=0&&c>=0&&m<=0)return o=c/(c-m),n.copy(i).addScaledVector(zo,o);let g=h*m-p*d;if(g<=0&&d-h>=0&&p-m>=0)return X1.subVectors(a,s),o=(d-h)/(d-h+(p-m)),n.copy(s).addScaledVector(X1,o);let f=1/(g+S+u);return r=S*f,o=u*f,n.copy(i).addScaledVector(Bo,r).addScaledVector(zo,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},gs=class{constructor(t=new L(1/0,1/0,1/0),n=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=n}set(t,n){return this.min.copy(t),this.max.copy(n),this}setFromArray(t){this.makeEmpty();for(let n=0,i=t.length;n<i;n+=3)this.expandByPoint(Wi.fromArray(t,n));return this}setFromBufferAttribute(t){this.makeEmpty();for(let n=0,i=t.count;n<i;n++)this.expandByPoint(Wi.fromBufferAttribute(t,n));return this}setFromPoints(t){this.makeEmpty();for(let n=0,i=t.length;n<i;n++)this.expandByPoint(t[n]);return this}setFromCenterAndSize(t,n){let i=Wi.copy(n).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,n=!1){return this.makeEmpty(),this.expandByObject(t,n)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,n=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let a=i.getAttribute("position");if(n===!0&&a!==void 0&&t.isInstancedMesh!==!0)for(let r=0,o=a.count;r<o;r++)t.isMesh===!0?t.getVertexPosition(r,Wi):Wi.fromBufferAttribute(a,r),Wi.applyMatrix4(t.matrixWorld),this.expandByPoint(Wi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),ef.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ef.copy(i.boundingBox)),ef.applyMatrix4(t.matrixWorld),this.union(ef)}let s=t.children;for(let a=0,r=s.length;a<r;a++)this.expandByObject(s[a],n);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,n){return n.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Wi),Wi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let n,i;return t.normal.x>0?(n=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(n=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(n+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(n+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(n+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(n+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),n<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(_c),nf.subVectors(this.max,_c),Fo.subVectors(t.a,_c),Ho.subVectors(t.b,_c),Vo.subVectors(t.c,_c),Fa.subVectors(Ho,Fo),Ha.subVectors(Vo,Ho),wr.subVectors(Fo,Vo);let n=[0,-Fa.z,Fa.y,0,-Ha.z,Ha.y,0,-wr.z,wr.y,Fa.z,0,-Fa.x,Ha.z,0,-Ha.x,wr.z,0,-wr.x,-Fa.y,Fa.x,0,-Ha.y,Ha.x,0,-wr.y,wr.x,0];return!Cg(n,Fo,Ho,Vo,nf)||(n=[1,0,0,0,1,0,0,0,1],!Cg(n,Fo,Ho,Vo,nf))?!1:(sf.crossVectors(Fa,Ha),n=[sf.x,sf.y,sf.z],Cg(n,Fo,Ho,Vo,nf))}clampPoint(t,n){return n.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Wi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Wi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Zs[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Zs[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Zs[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Zs[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Zs[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Zs[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Zs[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Zs[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Zs),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Zs=[new L,new L,new L,new L,new L,new L,new L,new L],Wi=new L,ef=new gs,Fo=new L,Ho=new L,Vo=new L,Fa=new L,Ha=new L,wr=new L,_c=new L,nf=new L,sf=new L,Er=new L;function Cg(e,t,n,i,s){for(let a=0,r=e.length-3;a<=r;a+=3){Er.fromArray(e,a);let o=s.x*Math.abs(Er.x)+s.y*Math.abs(Er.y)+s.z*Math.abs(Er.z),l=t.dot(Er),c=n.dot(Er),h=i.dot(Er);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var rn=new L,af=new Rt,W2=0,hn=class extends ms{constructor(t,n,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:W2++}),this.name="",this.array=t,this.itemSize=n,this.count=t!==void 0?t.length/n:0,this.normalized=i,this.usage=Yg,this.updateRanges=[],this.gpuType=Ui,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,n){this.updateRanges.push({start:t,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,n,i){t*=this.itemSize,i*=n.itemSize;for(let s=0,a=this.itemSize;s<a;s++)this.array[t+s]=n.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)af.fromBufferAttribute(this,n),af.applyMatrix3(t),this.setXY(n,af.x,af.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)rn.fromBufferAttribute(this,n),rn.applyMatrix3(t),this.setXYZ(n,rn.x,rn.y,rn.z);return this}applyMatrix4(t){for(let n=0,i=this.count;n<i;n++)rn.fromBufferAttribute(this,n),rn.applyMatrix4(t),this.setXYZ(n,rn.x,rn.y,rn.z);return this}applyNormalMatrix(t){for(let n=0,i=this.count;n<i;n++)rn.fromBufferAttribute(this,n),rn.applyNormalMatrix(t),this.setXYZ(n,rn.x,rn.y,rn.z);return this}transformDirection(t){for(let n=0,i=this.count;n<i;n++)rn.fromBufferAttribute(this,n),rn.transformDirection(t),this.setXYZ(n,rn.x,rn.y,rn.z);return this}set(t,n=0){return this.array.set(t,n),this}getComponent(t,n){let i=this.array[t*this.itemSize+n];return this.normalized&&(i=yc(i,this.array)),i}setComponent(t,n,i){return this.normalized&&(i=Kn(i,this.array)),this.array[t*this.itemSize+n]=i,this}getX(t){let n=this.array[t*this.itemSize];return this.normalized&&(n=yc(n,this.array)),n}setX(t,n){return this.normalized&&(n=Kn(n,this.array)),this.array[t*this.itemSize]=n,this}getY(t){let n=this.array[t*this.itemSize+1];return this.normalized&&(n=yc(n,this.array)),n}setY(t,n){return this.normalized&&(n=Kn(n,this.array)),this.array[t*this.itemSize+1]=n,this}getZ(t){let n=this.array[t*this.itemSize+2];return this.normalized&&(n=yc(n,this.array)),n}setZ(t,n){return this.normalized&&(n=Kn(n,this.array)),this.array[t*this.itemSize+2]=n,this}getW(t){let n=this.array[t*this.itemSize+3];return this.normalized&&(n=yc(n,this.array)),n}setW(t,n){return this.normalized&&(n=Kn(n,this.array)),this.array[t*this.itemSize+3]=n,this}setXY(t,n,i){return t*=this.itemSize,this.normalized&&(n=Kn(n,this.array),i=Kn(i,this.array)),this.array[t+0]=n,this.array[t+1]=i,this}setXYZ(t,n,i,s){return t*=this.itemSize,this.normalized&&(n=Kn(n,this.array),i=Kn(i,this.array),s=Kn(s,this.array)),this.array[t+0]=n,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,n,i,s,a){return t*=this.itemSize,this.normalized&&(n=Kn(n,this.array),i=Kn(i,this.array),s=Kn(s,this.array),a=Kn(a,this.array)),this.array[t+0]=n,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=a,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Yg&&(t.usage=this.usage),t}dispose(){this.dispatchEvent({type:"dispose"})}};var Oc=class extends hn{constructor(t,n,i){super(new Uint16Array(t),n,i)}};var Pc=class extends hn{constructor(t,n,i){super(new Uint32Array(t),n,i)}};var Ge=class extends hn{constructor(t,n,i){super(new Float32Array(t),n,i)}},X2=new gs,bc=new L,Rg=new L,vs=class{constructor(t=new L,n=-1){this.isSphere=!0,this.center=t,this.radius=n}set(t,n){return this.center.copy(t),this.radius=n,this}setFromPoints(t,n){let i=this.center;n!==void 0?i.copy(n):X2.setFromPoints(t).getCenter(i);let s=0;for(let a=0,r=t.length;a<r;a++)s=Math.max(s,i.distanceToSquared(t[a]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let n=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=n*n}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,n){let i=this.center.distanceToSquared(t);return n.copy(t),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;bc.subVectors(t,this.center);let n=bc.lengthSq();if(n>this.radius*this.radius){let i=Math.sqrt(n),s=(i-this.radius)*.5;this.center.addScaledVector(bc,s/i),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Rg.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(bc.copy(t.center).add(Rg)),this.expandByPoint(bc.copy(t.center).sub(Rg))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},q2=0,Ni=new fe,Ng=new Cn,Go=new L,di=new gs,Sc=new gs,yn=new L,$e=class e extends ms{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:q2++}),this.uuid=au(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(L2(t)?Pc:Oc)(t,1):this.index=t,this}setIndirect(t,n=0){return this.indirect=t,this.indirectOffset=n,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,n){return this.attributes[t]=n,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,n,i=0){this.groups.push({start:t,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,n){this.drawRange.start=t,this.drawRange.count=n}applyMatrix4(t){let n=this.attributes.position;n!==void 0&&(n.applyMatrix4(t),n.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let a=new Vt().getNormalMatrix(t);i.applyNormalMatrix(a),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Ni.makeRotationFromQuaternion(t),this.applyMatrix4(Ni),this}rotateX(t){return Ni.makeRotationX(t),this.applyMatrix4(Ni),this}rotateY(t){return Ni.makeRotationY(t),this.applyMatrix4(Ni),this}rotateZ(t){return Ni.makeRotationZ(t),this.applyMatrix4(Ni),this}translate(t,n,i){return Ni.makeTranslation(t,n,i),this.applyMatrix4(Ni),this}scale(t,n,i){return Ni.makeScale(t,n,i),this.applyMatrix4(Ni),this}lookAt(t){return Ng.lookAt(t),Ng.updateMatrix(),this.applyMatrix4(Ng.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Go).negate(),this.translate(Go.x,Go.y,Go.z),this}setFromPoints(t){let n=this.getAttribute("position");if(n===void 0){let i=[];for(let s=0,a=t.length;s<a;s++){let r=t[s];i.push(r.x,r.y,r.z||0)}this.setAttribute("position",new Ge(i,3))}else{let i=Math.min(t.length,n.count);for(let s=0;s<i;s++){let a=t[s];n.setXYZ(s,a.x,a.y,a.z||0)}t.length>n.count&&It("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),n.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new gs);let t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){zt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),n)for(let i=0,s=n.length;i<s;i++){let a=n[i];di.setFromBufferAttribute(a),this.morphTargetsRelative?(yn.addVectors(this.boundingBox.min,di.min),this.boundingBox.expandByPoint(yn),yn.addVectors(this.boundingBox.max,di.max),this.boundingBox.expandByPoint(yn)):(this.boundingBox.expandByPoint(di.min),this.boundingBox.expandByPoint(di.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&zt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vs);let t=this.attributes.position,n=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){zt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(t){let i=this.boundingSphere.center;if(di.setFromBufferAttribute(t),n)for(let a=0,r=n.length;a<r;a++){let o=n[a];Sc.setFromBufferAttribute(o),this.morphTargetsRelative?(yn.addVectors(di.min,Sc.min),di.expandByPoint(yn),yn.addVectors(di.max,Sc.max),di.expandByPoint(yn)):(di.expandByPoint(Sc.min),di.expandByPoint(Sc.max))}di.getCenter(i);let s=0;for(let a=0,r=t.count;a<r;a++)yn.fromBufferAttribute(t,a),s=Math.max(s,i.distanceToSquared(yn));if(n)for(let a=0,r=n.length;a<r;a++){let o=n[a],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)yn.fromBufferAttribute(o,c),l&&(Go.fromBufferAttribute(t,c),yn.add(Go)),s=Math.max(s,i.distanceToSquared(yn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&zt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,n=this.attributes;if(t===null||n.position===void 0||n.normal===void 0||n.uv===void 0){zt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=n.position,s=n.normal,a=n.uv,r=this.getAttribute("tangent");(r===void 0||r.count!==i.count)&&(r=new hn(new Float32Array(4*i.count),4),this.setAttribute("tangent",r));let o=[],l=[];for(let b=0;b<i.count;b++)o[b]=new L,l[b]=new L;let c=new L,h=new L,d=new L,u=new Rt,p=new Rt,m=new Rt,S=new L,g=new L;function f(b,A,R){c.fromBufferAttribute(i,b),h.fromBufferAttribute(i,A),d.fromBufferAttribute(i,R),u.fromBufferAttribute(a,b),p.fromBufferAttribute(a,A),m.fromBufferAttribute(a,R),h.sub(c),d.sub(c),p.sub(u),m.sub(u);let N=1/(p.x*m.y-m.x*p.y);isFinite(N)&&(S.copy(h).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(N),g.copy(d).multiplyScalar(p.x).addScaledVector(h,-m.x).multiplyScalar(N),o[b].add(S),o[A].add(S),o[R].add(S),l[b].add(g),l[A].add(g),l[R].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:t.count}]);for(let b=0,A=v.length;b<A;++b){let R=v[b],N=R.start,I=R.count;for(let G=N,q=N+I;G<q;G+=3)f(t.getX(G+0),t.getX(G+1),t.getX(G+2))}let x=new L,y=new L,M=new L,w=new L;function E(b){M.fromBufferAttribute(s,b),w.copy(M);let A=o[b];x.copy(A),x.sub(M.multiplyScalar(M.dot(A))).normalize(),y.crossVectors(w,A);let N=y.dot(l[b])<0?-1:1;r.setXYZW(b,x.x,x.y,x.z,N)}for(let b=0,A=v.length;b<A;++b){let R=v[b],N=R.start,I=R.count;for(let G=N,q=N+I;G<q;G+=3)E(t.getX(G+0)),E(t.getX(G+1)),E(t.getX(G+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==n.count)i=new hn(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let u=0,p=i.count;u<p;u++)i.setXYZ(u,0,0,0);let s=new L,a=new L,r=new L,o=new L,l=new L,c=new L,h=new L,d=new L;if(t)for(let u=0,p=t.count;u<p;u+=3){let m=t.getX(u+0),S=t.getX(u+1),g=t.getX(u+2);s.fromBufferAttribute(n,m),a.fromBufferAttribute(n,S),r.fromBufferAttribute(n,g),h.subVectors(r,a),d.subVectors(s,a),h.cross(d),o.fromBufferAttribute(i,m),l.fromBufferAttribute(i,S),c.fromBufferAttribute(i,g),o.add(h),l.add(h),c.add(h),i.setXYZ(m,o.x,o.y,o.z),i.setXYZ(S,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let u=0,p=n.count;u<p;u+=3)s.fromBufferAttribute(n,u+0),a.fromBufferAttribute(n,u+1),r.fromBufferAttribute(n,u+2),h.subVectors(r,a),d.subVectors(s,a),h.cross(d),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let n=0,i=t.count;n<i;n++)yn.fromBufferAttribute(t,n),yn.normalize(),t.setXYZ(n,yn.x,yn.y,yn.z)}toNonIndexed(){function t(o,l){let c=o.array,h=o.itemSize,d=o.normalized,u=new c.constructor(l.length*h),p=0,m=0;for(let S=0,g=l.length;S<g;S++){o.isInterleavedBufferAttribute?p=l[S]*o.data.stride+o.offset:p=l[S]*h;for(let f=0;f<h;f++)u[m++]=c[p++]}return new hn(u,h,d)}if(this.index===null)return It("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let n=new e,i=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,i);n.setAttribute(o,c)}let a=this.morphAttributes;for(let o in a){let l=[],c=a[o];for(let h=0,d=c.length;h<d;h++){let u=c[h],p=t(u,i);l.push(p)}n.morphAttributes[o]=l}n.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;for(let o=0,l=r.length;o<l;o++){let c=r[o];n.addGroup(c.start,c.count,c.materialIndex)}return n}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let n=this.index;n!==null&&(t.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},a=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let p=c[d];h.push(p.toJSON(t.data))}h.length>0&&(s[l]=h,a=!0)}a&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let r=this.groups;r.length>0&&(t.data.groups=JSON.parse(JSON.stringify(r)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let n={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let s=t.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(n))}let a=t.morphAttributes;for(let c in a){let h=[],d=a[c];for(let u=0,p=d.length;u<p;u++)h.push(d[u].clone(n));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let r=t.groups;for(let c=0,h=r.length;c<h;c++){let d=r[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Y2=0,Zi=class extends ms{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Y2++}),this.uuid=au(),this.name="",this.type="Material",this.blending=Nr,this.side=js,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Rf,this.blendDst=Nf,this.blendEquation=ka,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ot(0,0,0),this.blendAlpha=0,this.depthFunc=Lr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=qg,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Cr,this.stencilZFail=Cr,this.stencilZPass=Cr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let n in t){let i=t[n];if(i===void 0){It(`Material: parameter '${n}' has value of undefined.`);continue}let s=this[n];if(s===void 0){It(`Material: '${n}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[n]=i}}toJSON(t){let n=t===void 0||typeof t=="string";n&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Nr&&(i.blending=this.blending),this.side!==js&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Rf&&(i.blendSrc=this.blendSrc),this.blendDst!==Nf&&(i.blendDst=this.blendDst),this.blendEquation!==ka&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Lr&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==qg&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Cr&&(i.stencilFail=this.stencilFail),this.stencilZFail!==Cr&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==Cr&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(a){let r=[];for(let o in a){let l=a[o];delete l.metadata,r.push(l)}return r}if(n){let a=s(t.textures),r=s(t.images);a.length>0&&(i.textures=a),r.length>0&&(i.images=r)}return i}fromJSON(t,n){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Ot().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=n[t.map]||null),t.matcap!==void 0&&(this.matcap=n[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=n[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=n[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=n[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Rt().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=n[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=n[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=n[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=n[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=n[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=n[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=n[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=n[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=n[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=n[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=n[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=n[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=n[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=n[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Rt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=n[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=n[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=n[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=n[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=n[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=n[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=n[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let n=t.clippingPlanes,i=null;if(n!==null){let s=n.length;i=new Array(s);for(let a=0;a!==s;++a)i[a]=n[a].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var Js=new L,Lg=new L,rf=new L,Va=new L,Dg=new L,of=new L,Ug=new L,Qo=class{constructor(t=new L,n=new L(0,0,-1)){this.origin=t,this.direction=n}set(t,n){return this.origin.copy(t),this.direction.copy(n),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,n){return n.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Js)),this}closestPointToPoint(t,n){n.subVectors(t,this.origin);let i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let n=Js.subVectors(t,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(t):(Js.copy(this.origin).addScaledVector(this.direction,n),Js.distanceToSquared(t))}distanceSqToSegment(t,n,i,s){Lg.copy(t).add(n).multiplyScalar(.5),rf.copy(n).sub(t).normalize(),Va.copy(this.origin).sub(Lg);let a=t.distanceTo(n)*.5,r=-this.direction.dot(rf),o=Va.dot(this.direction),l=-Va.dot(rf),c=Va.lengthSq(),h=Math.abs(1-r*r),d,u,p,m;if(h>0)if(d=r*l-o,u=r*o-l,m=a*h,d>=0)if(u>=-m)if(u<=m){let S=1/h;d*=S,u*=S,p=d*(d+r*u+2*o)+u*(r*d+u+2*l)+c}else u=a,d=Math.max(0,-(r*u+o)),p=-d*d+u*(u+2*l)+c;else u=-a,d=Math.max(0,-(r*u+o)),p=-d*d+u*(u+2*l)+c;else u<=-m?(d=Math.max(0,-(-r*a+o)),u=d>0?-a:Math.min(Math.max(-a,-l),a),p=-d*d+u*(u+2*l)+c):u<=m?(d=0,u=Math.min(Math.max(-a,-l),a),p=u*(u+2*l)+c):(d=Math.max(0,-(r*a+o)),u=d>0?a:Math.min(Math.max(-a,-l),a),p=-d*d+u*(u+2*l)+c);else u=r>0?-a:a,d=Math.max(0,-(r*u+o)),p=-d*d+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Lg).addScaledVector(rf,u),p}intersectSphere(t,n){Js.subVectors(t.center,this.origin);let i=Js.dot(this.direction),s=Js.dot(Js)-i*i,a=t.radius*t.radius;if(s>a)return null;let r=Math.sqrt(a-s),o=i-r,l=i+r;return l<0?null:o<0?this.at(l,n):this.at(o,n)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let n=t.normal.dot(this.direction);if(n===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/n;return i>=0?i:null}intersectPlane(t,n){let i=this.distanceToPlane(t);return i===null?null:this.at(i,n)}intersectsPlane(t){let n=t.distanceToPoint(this.origin);return n===0||t.normal.dot(this.direction)*n<0}intersectBox(t,n){let i,s,a,r,o,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(i=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(i=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),h>=0?(a=(t.min.y-u.y)*h,r=(t.max.y-u.y)*h):(a=(t.max.y-u.y)*h,r=(t.min.y-u.y)*h),i>r||a>s||((a>i||isNaN(i))&&(i=a),(r<s||isNaN(s))&&(s=r),d>=0?(o=(t.min.z-u.z)*d,l=(t.max.z-u.z)*d):(o=(t.max.z-u.z)*d,l=(t.min.z-u.z)*d),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,n)}intersectsBox(t){return this.intersectBox(t,Js)!==null}intersectTriangle(t,n,i,s,a){Dg.subVectors(n,t),of.subVectors(i,t),Ug.crossVectors(Dg,of);let r=this.direction.dot(Ug),o;if(r>0){if(s)return null;o=1}else if(r<0)o=-1,r=-r;else return null;Va.subVectors(this.origin,t);let l=o*this.direction.dot(of.crossVectors(Va,of));if(l<0)return null;let c=o*this.direction.dot(Dg.cross(Va));if(c<0||l+c>r)return null;let h=-o*Va.dot(Ug);return h<0?null:this.at(h/r,a)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ys=class extends Zi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ot(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new qi,this.combine=nv,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},q1=new fe,Tr=new Qo,lf=new vs,Y1=new L,cf=new L,uf=new L,hf=new L,Ig=new L,ff=new L,Z1=new L,df=new L,we=class extends Cn{constructor(t=new $e,n=new ys){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,n){return super.copy(t,n),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=s.length;a<r;a++){let o=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}getVertexPosition(t,n){let i=this.geometry,s=i.attributes.position,a=i.morphAttributes.position,r=i.morphTargetsRelative;n.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(a&&o){ff.set(0,0,0);for(let l=0,c=a.length;l<c;l++){let h=o[l],d=a[l];h!==0&&(Ig.fromBufferAttribute(d,t),r?ff.addScaledVector(Ig,h):ff.addScaledVector(Ig.sub(n),h))}n.add(ff)}return n}raycast(t,n){let i=this.geometry,s=this.material,a=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),lf.copy(i.boundingSphere),lf.applyMatrix4(a),Tr.copy(t.ray).recast(t.near),!(lf.containsPoint(Tr.origin)===!1&&(Tr.intersectSphere(lf,Y1)===null||Tr.origin.distanceToSquared(Y1)>(t.far-t.near)**2))&&(q1.copy(a).invert(),Tr.copy(t.ray).applyMatrix4(q1),!(i.boundingBox!==null&&Tr.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,n,Tr)))}_computeIntersections(t,n,i){let s,a=this.geometry,r=this.material,o=a.index,l=a.attributes.position,c=a.attributes.uv,h=a.attributes.uv1,d=a.attributes.normal,u=a.groups,p=a.drawRange;if(o!==null)if(Array.isArray(r))for(let m=0,S=u.length;m<S;m++){let g=u[m],f=r[g.materialIndex],v=Math.max(g.start,p.start),x=Math.min(o.count,Math.min(g.start+g.count,p.start+p.count));for(let y=v,M=x;y<M;y+=3){let w=o.getX(y),E=o.getX(y+1),b=o.getX(y+2);s=pf(this,f,t,i,c,h,d,w,E,b),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=g.materialIndex,n.push(s))}}else{let m=Math.max(0,p.start),S=Math.min(o.count,p.start+p.count);for(let g=m,f=S;g<f;g+=3){let v=o.getX(g),x=o.getX(g+1),y=o.getX(g+2);s=pf(this,r,t,i,c,h,d,v,x,y),s&&(s.faceIndex=Math.floor(g/3),n.push(s))}}else if(l!==void 0)if(Array.isArray(r))for(let m=0,S=u.length;m<S;m++){let g=u[m],f=r[g.materialIndex],v=Math.max(g.start,p.start),x=Math.min(l.count,Math.min(g.start+g.count,p.start+p.count));for(let y=v,M=x;y<M;y+=3){let w=y,E=y+1,b=y+2;s=pf(this,f,t,i,c,h,d,w,E,b),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=g.materialIndex,n.push(s))}}else{let m=Math.max(0,p.start),S=Math.min(l.count,p.start+p.count);for(let g=m,f=S;g<f;g+=3){let v=g,x=g+1,y=g+2;s=pf(this,r,t,i,c,h,d,v,x,y),s&&(s.faceIndex=Math.floor(g/3),n.push(s))}}}};function Z2(e,t,n,i,s,a,r,o){let l;if(t.side===Vn?l=i.intersectTriangle(r,a,s,!0,o):l=i.intersectTriangle(s,a,r,t.side===js,o),l===null)return null;df.copy(o),df.applyMatrix4(e.matrixWorld);let c=n.ray.origin.distanceTo(df);return c<n.near||c>n.far?null:{distance:c,point:df.clone(),object:e}}function pf(e,t,n,i,s,a,r,o,l,c){e.getVertexPosition(o,cf),e.getVertexPosition(l,uf),e.getVertexPosition(c,hf);let h=Z2(e,t,n,i,cf,uf,hf,Z1);if(h){let d=new L;Ks.getBarycoord(Z1,cf,uf,hf,d),s&&(h.uv=Ks.getInterpolatedAttribute(s,o,l,c,d,new Rt)),a&&(h.uv1=Ks.getInterpolatedAttribute(a,o,l,c,d,new Rt)),r&&(h.normal=Ks.getInterpolatedAttribute(r,o,l,c,d,new L),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new L,materialIndex:0};Ks.getNormal(cf,uf,hf,u.normal),h.face=u,h.barycoord=d}return h}var Bc=class extends Hn{constructor(t=null,n=1,i=1,s,a,r,o,l,c=_n,h=_n,d,u){super(null,r,o,l,c,h,s,a,d,u),this.isDataTexture=!0,this.image={data:t,width:n,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var jo=class extends hn{constructor(t,n,i,s=1){super(t,n,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},ko=new fe,J1=new fe,mf=[],K1=new gs,J2=new fe,Mc=new we,wc=new vs,Wa=class extends we{constructor(t,n,i){super(t,n),this.isInstancedMesh=!0,this.instanceMatrix=new jo(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,J2)}computeBoundingBox(){let t=this.geometry,n=this.count;this.boundingBox===null&&(this.boundingBox=new gs),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<n;i++)this.getMatrixAt(i,ko),K1.copy(t.boundingBox).applyMatrix4(ko),this.boundingBox.union(K1)}computeBoundingSphere(){let t=this.geometry,n=this.count;this.boundingSphere===null&&(this.boundingSphere=new vs),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<n;i++)this.getMatrixAt(i,ko),wc.copy(t.boundingSphere).applyMatrix4(ko),this.boundingSphere.union(wc)}copy(t,n){return super.copy(t,n),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,n){return this.instanceColor===null?n.setRGB(1,1,1):n.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,n){return n.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,n){let i=n.morphTargetInfluences,s=this.morphTexture.source.data.data,a=i.length+1,r=t*a+1;for(let o=0;o<i.length;o++)i[o]=s[r+o]}raycast(t,n){let i=this.matrixWorld,s=this.count;if(Mc.geometry=this.geometry,Mc.material=this.material,Mc.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),wc.copy(this.boundingSphere),wc.applyMatrix4(i),t.ray.intersectsSphere(wc)!==!1))for(let a=0;a<s;a++){this.getMatrixAt(a,ko),J1.multiplyMatrices(i,ko),Mc.matrixWorld=J1,Mc.raycast(t,mf);for(let r=0,o=mf.length;r<o;r++){let l=mf[r];l.instanceId=a,l.object=this,n.push(l)}mf.length=0}}setColorAt(t,n){return this.instanceColor===null&&(this.instanceColor=new jo(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),n.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,n){return n.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,n){let i=n.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new Bc(new Float32Array(s*this.count),s,this.count,wd,Ui));let a=this.morphTexture.source.data.data,r=0;for(let c=0;c<i.length;c++)r+=i[c];let o=this.geometry.morphTargetsRelative?1:1-r,l=s*t;return a[l]=o,a.set(i,l+1),this}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Og=new L,K2=new L,Q2=new Vt,fs=class{constructor(t=new L(1,0,0),n=0){this.isPlane=!0,this.normal=t,this.constant=n}set(t,n){return this.normal.copy(t),this.constant=n,this}setComponents(t,n,i,s){return this.normal.set(t,n,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,n){return this.normal.copy(t),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(t,n,i){let s=Og.subVectors(i,n).cross(K2.subVectors(t,n)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,n){return n.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,n,i=!0){let s=t.delta(Og),a=this.normal.dot(s);if(a===0)return this.distanceToPoint(t.start)===0?n.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/a;return i===!0&&(r<0||r>1)?null:n.copy(t.start).addScaledVector(s,r)}intersectsLine(t){let n=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return n<0&&i>0||i<0&&n>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,n){let i=n||Q2.getNormalMatrix(t),s=this.coplanarPoint(Og).applyMatrix4(t),a=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(a),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},Ar=new vs,j2=new Rt(.5,.5),gf=new L,$o=class{constructor(t=new fs,n=new fs,i=new fs,s=new fs,a=new fs,r=new fs){this.planes=[t,n,i,s,a,r]}set(t,n,i,s,a,r){let o=this.planes;return o[0].copy(t),o[1].copy(n),o[2].copy(i),o[3].copy(s),o[4].copy(a),o[5].copy(r),this}copy(t){let n=this.planes;for(let i=0;i<6;i++)n[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,n=Xi,i=!1){let s=this.planes,a=t.elements,r=a[0],o=a[1],l=a[2],c=a[3],h=a[4],d=a[5],u=a[6],p=a[7],m=a[8],S=a[9],g=a[10],f=a[11],v=a[12],x=a[13],y=a[14],M=a[15];if(s[0].setComponents(c-r,p-h,f-m,M-v).normalize(),s[1].setComponents(c+r,p+h,f+m,M+v).normalize(),s[2].setComponents(c+o,p+d,f+S,M+x).normalize(),s[3].setComponents(c-o,p-d,f-S,M-x).normalize(),i)s[4].setComponents(l,u,g,y).normalize(),s[5].setComponents(c-l,p-u,f-g,M-y).normalize();else if(s[4].setComponents(c-l,p-u,f-g,M-y).normalize(),n===Xi)s[5].setComponents(c+l,p+u,f+g,M+y).normalize();else if(n===Yo)s[5].setComponents(l,u,g,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Ar.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let n=t.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),Ar.copy(n.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Ar)}intersectsSprite(t){Ar.center.set(0,0,0);let n=j2.distanceTo(t.center);return Ar.radius=.7071067811865476+n,Ar.applyMatrix4(t.matrixWorld),this.intersectsSphere(Ar)}intersectsSphere(t){let n=this.planes,i=t.center,s=-t.radius;for(let a=0;a<6;a++)if(n[a].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){let n=this.planes;for(let i=0;i<6;i++){let s=n[i];if(gf.x=s.normal.x>0?t.max.x:t.min.x,gf.y=s.normal.y>0?t.max.y:t.min.y,gf.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(gf)<0)return!1}return!0}containsPoint(t){let n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Xa=class extends Zi{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ot(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},Xf=new L,qf=new L,Q1=new fe,Ec=new Qo,vf=new vs,Pg=new L,j1=new L,Yf=class extends Cn{constructor(t=new $e,n=new Xa){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,n){return super.copy(t,n),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let n=t.attributes.position,i=[0];for(let s=1,a=n.count;s<a;s++)Xf.fromBufferAttribute(n,s-1),qf.fromBufferAttribute(n,s),i[s]=i[s-1],i[s]+=Xf.distanceTo(qf);t.setAttribute("lineDistance",new Ge(i,1))}else It("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,n){let i=this.geometry,s=this.matrixWorld,a=t.params.Line.threshold,r=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),vf.copy(i.boundingSphere),vf.applyMatrix4(s),vf.radius+=a,t.ray.intersectsSphere(vf)===!1)return;Q1.copy(s).invert(),Ec.copy(t.ray).applyMatrix4(Q1);let o=a/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=i.index,u=i.attributes.position;if(h!==null){let p=Math.max(0,r.start),m=Math.min(h.count,r.start+r.count);for(let S=p,g=m-1;S<g;S+=c){let f=h.getX(S),v=h.getX(S+1),x=yf(this,t,Ec,l,f,v,S);x&&n.push(x)}if(this.isLineLoop){let S=h.getX(m-1),g=h.getX(p),f=yf(this,t,Ec,l,S,g,m-1);f&&n.push(f)}}else{let p=Math.max(0,r.start),m=Math.min(u.count,r.start+r.count);for(let S=p,g=m-1;S<g;S+=c){let f=yf(this,t,Ec,l,S,S+1,S);f&&n.push(f)}if(this.isLineLoop){let S=yf(this,t,Ec,l,m-1,p,m-1);S&&n.push(S)}}}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=s.length;a<r;a++){let o=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}};function yf(e,t,n,i,s,a,r){let o=e.geometry.attributes.position;if(Xf.fromBufferAttribute(o,s),qf.fromBufferAttribute(o,a),n.distanceSqToSegment(Xf,qf,Pg,j1)>i)return;Pg.applyMatrix4(e.matrixWorld);let c=t.ray.origin.distanceTo(Pg);if(!(c<t.near||c>t.far))return{distance:c,point:j1.clone().applyMatrix4(e.matrixWorld),index:r,face:null,faceIndex:null,barycoord:null,object:e}}var $1=new L,tM=new L,Dr=class extends Yf{constructor(t,n){super(t,n),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let n=t.attributes.position,i=[];for(let s=0,a=n.count;s<a;s+=2)$1.fromBufferAttribute(n,s),tM.fromBufferAttribute(n,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+$1.distanceTo(tM);t.setAttribute("lineDistance",new Ge(i,1))}else It("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var tl=class extends Zi{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ot(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},eM=new fe,Zg=new Qo,xf=new vs,_f=new L,zc=class extends Cn{constructor(t=new $e,n=new tl){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,n){return super.copy(t,n),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,n){let i=this.geometry,s=this.matrixWorld,a=t.params.Points.threshold,r=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),xf.copy(i.boundingSphere),xf.applyMatrix4(s),xf.radius+=a,t.ray.intersectsSphere(xf)===!1)return;eM.copy(s).invert(),Zg.copy(t.ray).applyMatrix4(eM);let o=a/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,d=i.attributes.position;if(c!==null){let u=Math.max(0,r.start),p=Math.min(c.count,r.start+r.count);for(let m=u,S=p;m<S;m++){let g=c.getX(m);_f.fromBufferAttribute(d,g),nM(_f,g,l,s,t,n,this)}}else{let u=Math.max(0,r.start),p=Math.min(d.count,r.start+r.count);for(let m=u,S=p;m<S;m++)_f.fromBufferAttribute(d,m),nM(_f,m,l,s,t,n,this)}}updateMorphTargets(){let n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){let s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,r=s.length;a<r;a++){let o=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=a}}}}};function nM(e,t,n,i,s,a,r){let o=Zg.distanceSqToPoint(e);if(o<n){let l=new L;Zg.closestPointToPoint(e,l),l.applyMatrix4(i);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;a.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:r})}}var Fc=class extends Hn{constructor(t=[],n=Qa,i,s,a,r,o,l,c,h){super(t,n,i,s,a,r,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Ur=class extends Hn{constructor(t,n,i,s,a,r,o,l,c){super(t,n,i,s,a,r,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var $s=class extends Hn{constructor(t,n,i=Ki,s,a,r,o=_n,l=_n,c,h=ps,d=1){if(h!==ps&&h!==$a)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:n,depth:d};super(u,s,a,r,o,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Jo(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let n=super.toJSON(t);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}},Zf=class extends $s{constructor(t,n=Ki,i=Qa,s,a,r=_n,o=_n,l,c=ps){let h={width:t,height:t,depth:1},d=[h,h,h,h,h,h];super(t,t,n,i,s,a,r,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Hc=class extends Hn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},mi=class e extends $e{constructor(t=1,n=1,i=1,s=1,a=1,r=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:n,depth:i,widthSegments:s,heightSegments:a,depthSegments:r};let o=this;s=Math.floor(s),a=Math.floor(a),r=Math.floor(r);let l=[],c=[],h=[],d=[],u=0,p=0;m("z","y","x",-1,-1,i,n,t,r,a,0),m("z","y","x",1,-1,i,n,-t,r,a,1),m("x","z","y",1,1,t,i,n,s,r,2),m("x","z","y",1,-1,t,i,-n,s,r,3),m("x","y","z",1,-1,t,n,i,s,a,4),m("x","y","z",-1,-1,t,n,-i,s,a,5),this.setIndex(l),this.setAttribute("position",new Ge(c,3)),this.setAttribute("normal",new Ge(h,3)),this.setAttribute("uv",new Ge(d,2));function m(S,g,f,v,x,y,M,w,E,b,A){let R=y/E,N=M/b,I=y/2,G=M/2,q=w/2,O=E+1,H=b+1,D=0,X=0,Q=new L;for(let it=0;it<H;it++){let rt=it*N-G;for(let st=0;st<O;st++){let Pt=st*R-I;Q[S]=Pt*v,Q[g]=rt*x,Q[f]=q,c.push(Q.x,Q.y,Q.z),Q[S]=0,Q[g]=0,Q[f]=w>0?1:-1,h.push(Q.x,Q.y,Q.z),d.push(st/E),d.push(1-it/b),D+=1}}for(let it=0;it<b;it++)for(let rt=0;rt<E;rt++){let st=u+rt+O*it,Pt=u+rt+O*(it+1),Gt=u+(rt+1)+O*(it+1),vt=u+(rt+1)+O*it;l.push(st,Pt,vt),l.push(Pt,Gt,vt),X+=6}o.addGroup(p,X,A),p+=X,u+=D}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var qa=class e extends $e{constructor(t=1,n=1,i=1,s=32,a=1,r=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:n,height:i,radialSegments:s,heightSegments:a,openEnded:r,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),a=Math.floor(a);let h=[],d=[],u=[],p=[],m=0,S=[],g=i/2,f=0;v(),r===!1&&(t>0&&x(!0),n>0&&x(!1)),this.setIndex(h),this.setAttribute("position",new Ge(d,3)),this.setAttribute("normal",new Ge(u,3)),this.setAttribute("uv",new Ge(p,2));function v(){let y=new L,M=new L,w=0,E=(n-t)/i;for(let b=0;b<=a;b++){let A=[],R=b/a,N=R*(n-t)+t;for(let I=0;I<=s;I++){let G=I/s,q=G*l+o,O=Math.sin(q),H=Math.cos(q);M.x=N*O,M.y=-R*i+g,M.z=N*H,d.push(M.x,M.y,M.z),y.set(O,E,H).normalize(),u.push(y.x,y.y,y.z),p.push(G,1-R),A.push(m++)}S.push(A)}for(let b=0;b<s;b++)for(let A=0;A<a;A++){let R=S[A][b],N=S[A+1][b],I=S[A+1][b+1],G=S[A][b+1];(t>0||A!==0)&&(h.push(R,N,G),w+=3),(n>0||A!==a-1)&&(h.push(N,I,G),w+=3)}c.addGroup(f,w,0),f+=w}function x(y){let M=m,w=new Rt,E=new L,b=0,A=y===!0?t:n,R=y===!0?1:-1;for(let I=1;I<=s;I++)d.push(0,g*R,0),u.push(0,R,0),p.push(.5,.5),m++;let N=m;for(let I=0;I<=s;I++){let q=I/s*l+o,O=Math.cos(q),H=Math.sin(q);E.x=A*H,E.y=g*R,E.z=A*O,d.push(E.x,E.y,E.z),u.push(0,R,0),w.x=O*.5+.5,w.y=H*.5*R+.5,p.push(w.x,w.y),m++}for(let I=0;I<s;I++){let G=M+I,q=N+I;y===!0?h.push(q,q+1,G):h.push(q+1,q,G),b+=3}c.addGroup(f,b,y===!0?1:2),f+=b}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var bf=new L,Sf=new L,Bg=new L,Mf=new Ks,el=class extends $e{constructor(t=null,n=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:t,thresholdAngle:n},t!==null){let s=Math.pow(10,4),a=Math.cos(Cf*n),r=t.getIndex(),o=t.getAttribute("position"),l=r?r.count:o.count,c=[0,0,0],h=["a","b","c"],d=new Array(3),u={},p=[];for(let m=0;m<l;m+=3){r?(c[0]=r.getX(m),c[1]=r.getX(m+1),c[2]=r.getX(m+2)):(c[0]=m,c[1]=m+1,c[2]=m+2);let{a:S,b:g,c:f}=Mf;if(S.fromBufferAttribute(o,c[0]),g.fromBufferAttribute(o,c[1]),f.fromBufferAttribute(o,c[2]),Mf.getNormal(Bg),d[0]=`${Math.round(S.x*s)},${Math.round(S.y*s)},${Math.round(S.z*s)}`,d[1]=`${Math.round(g.x*s)},${Math.round(g.y*s)},${Math.round(g.z*s)}`,d[2]=`${Math.round(f.x*s)},${Math.round(f.y*s)},${Math.round(f.z*s)}`,!(d[0]===d[1]||d[1]===d[2]||d[2]===d[0]))for(let v=0;v<3;v++){let x=(v+1)%3,y=d[v],M=d[x],w=Mf[h[v]],E=Mf[h[x]],b=`${y}_${M}`,A=`${M}_${y}`;A in u&&u[A]?(Bg.dot(u[A].normal)<=a&&(p.push(w.x,w.y,w.z),p.push(E.x,E.y,E.z)),u[A]=null):b in u||(u[b]={index0:c[v],index1:c[x],normal:Bg.clone()})}}for(let m in u)if(u[m]){let{index0:S,index1:g}=u[m];bf.fromBufferAttribute(o,S),Sf.fromBufferAttribute(o,g),p.push(bf.x,bf.y,bf.z),p.push(Sf.x,Sf.y,Sf.z)}this.setAttribute("position",new Ge(p,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}},Li=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){It("Curve: .getPoint() not implemented.")}getPointAt(t,n){let i=this.getUtoTmapping(t);return this.getPoint(i,n)}getPoints(t=5){let n=[];for(let i=0;i<=t;i++)n.push(this.getPoint(i/t));return n}getSpacedPoints(t=5){let n=[];for(let i=0;i<=t;i++)n.push(this.getPointAt(i/t));return n}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let n=[],i,s=this.getPoint(0),a=0;n.push(0);for(let r=1;r<=t;r++)i=this.getPoint(r/t),a+=i.distanceTo(s),n.push(a),s=i;return this.cacheArcLengths=n,n}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,n=null){let i=this.getLengths(),s=0,a=i.length,r;n?r=n:r=t*i[a-1];let o=0,l=a-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=i[s]-r,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===r)return s/(a-1);let h=i[s],u=i[s+1]-h,p=(r-h)/u;return(s+p)/(a-1)}getTangent(t,n){let s=t-1e-4,a=t+1e-4;s<0&&(s=0),a>1&&(a=1);let r=this.getPoint(s),o=this.getPoint(a),l=n||(r.isVector2?new Rt:new L);return l.copy(o).sub(r).normalize(),l}getTangentAt(t,n){let i=this.getUtoTmapping(t);return this.getTangent(i,n)}computeFrenetFrames(t,n=!1){let i=new L,s=[],a=[],r=[],o=new L,l=new fe;for(let p=0;p<=t;p++){let m=p/t;s[p]=this.getTangentAt(m,new L)}a[0]=new L,r[0]=new L;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),d=Math.abs(s[0].y),u=Math.abs(s[0].z);h<=c&&(c=h,i.set(1,0,0)),d<=c&&(c=d,i.set(0,1,0)),u<=c&&i.set(0,0,1),o.crossVectors(s[0],i).normalize(),a[0].crossVectors(s[0],o),r[0].crossVectors(s[0],a[0]);for(let p=1;p<=t;p++){if(a[p]=a[p-1].clone(),r[p]=r[p-1].clone(),o.crossVectors(s[p-1],s[p]),o.length()>Number.EPSILON){o.normalize();let m=Math.acos(ne(s[p-1].dot(s[p]),-1,1));a[p].applyMatrix4(l.makeRotationAxis(o,m))}r[p].crossVectors(s[p],a[p])}if(n===!0){let p=Math.acos(ne(a[0].dot(a[t]),-1,1));p/=t,s[0].dot(o.crossVectors(a[0],a[t]))>0&&(p=-p);for(let m=1;m<=t;m++)a[m].applyMatrix4(l.makeRotationAxis(s[m],p*m)),r[m].crossVectors(s[m],a[m])}return{tangents:s,normals:a,binormals:r}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},Vc=class extends Li{constructor(t=0,n=0,i=1,s=1,a=0,r=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=n,this.xRadius=i,this.yRadius=s,this.aStartAngle=a,this.aEndAngle=r,this.aClockwise=o,this.aRotation=l}getPoint(t,n=new Rt){let i=n,s=Math.PI*2,a=this.aEndAngle-this.aStartAngle,r=Math.abs(a)<Number.EPSILON;for(;a<0;)a+=s;for(;a>s;)a-=s;a<Number.EPSILON&&(r?a=0:a=s),this.aClockwise===!0&&!r&&(a===s?a=-s:a=a-s);let o=this.aStartAngle+t*a,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=l-this.aX,p=c-this.aY;l=u*h-p*d+this.aX,c=u*d+p*h+this.aY}return i.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Jf=class extends Vc{constructor(t,n,i,s,a,r){super(t,n,i,i,s,a,r),this.isArcCurve=!0,this.type="ArcCurve"}};function xv(){let e=0,t=0,n=0,i=0;function s(a,r,o,l){e=a,t=o,n=-3*a+3*r-2*o-l,i=2*a-2*r+o+l}return{initCatmullRom:function(a,r,o,l,c){s(r,o,c*(o-a),c*(l-r))},initNonuniformCatmullRom:function(a,r,o,l,c,h,d){let u=(r-a)/c-(o-a)/(c+h)+(o-r)/h,p=(o-r)/h-(l-r)/(h+d)+(l-o)/d;u*=h,p*=h,s(r,o,u,p)},calc:function(a){let r=a*a,o=r*a;return e+t*a+n*r+i*o}}}var iM=new L,sM=new L,zg=new xv,Fg=new xv,Hg=new xv,nl=class extends Li{constructor(t=[],n=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=n,this.curveType=i,this.tension=s}getPoint(t,n=new L){let i=n,s=this.points,a=s.length,r=(a-(this.closed?0:1))*t,o=Math.floor(r),l=r-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/a)+1)*a:l===0&&o===a-1&&(o=a-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%a]:(sM.subVectors(s[0],s[1]).add(s[0]),c=sM);let d=s[o%a],u=s[(o+1)%a];if(this.closed||o+2<a?h=s[(o+2)%a]:(iM.subVectors(s[a-1],s[a-2]).add(s[a-1]),h=iM),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(d),p),S=Math.pow(d.distanceToSquared(u),p),g=Math.pow(u.distanceToSquared(h),p);S<1e-4&&(S=1),m<1e-4&&(m=S),g<1e-4&&(g=S),zg.initNonuniformCatmullRom(c.x,d.x,u.x,h.x,m,S,g),Fg.initNonuniformCatmullRom(c.y,d.y,u.y,h.y,m,S,g),Hg.initNonuniformCatmullRom(c.z,d.z,u.z,h.z,m,S,g)}else this.curveType==="catmullrom"&&(zg.initCatmullRom(c.x,d.x,u.x,h.x,this.tension),Fg.initCatmullRom(c.y,d.y,u.y,h.y,this.tension),Hg.initCatmullRom(c.z,d.z,u.z,h.z,this.tension));return i.set(zg.calc(l),Fg.calc(l),Hg.calc(l)),i}copy(t){super.copy(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){let s=t.points[n];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let n=0,i=this.points.length;n<i;n++){let s=this.points[n];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){let s=t.points[n];this.points.push(new L().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function aM(e,t,n,i,s){let a=(i-t)*.5,r=(s-n)*.5,o=e*e,l=e*o;return(2*n-2*i+a+r)*l+(-3*n+3*i-2*a-r)*o+a*e+n}function $2(e,t){let n=1-e;return n*n*t}function tC(e,t){return 2*(1-e)*e*t}function eC(e,t){return e*e*t}function Tc(e,t,n,i){return $2(e,t)+tC(e,n)+eC(e,i)}function nC(e,t){let n=1-e;return n*n*n*t}function iC(e,t){let n=1-e;return 3*n*n*e*t}function sC(e,t){return 3*(1-e)*e*e*t}function aC(e,t){return e*e*e*t}function Ac(e,t,n,i,s){return nC(e,t)+iC(e,n)+sC(e,i)+aC(e,s)}var Kf=class extends Li{constructor(t=new Rt,n=new Rt,i=new Rt,s=new Rt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=n,this.v2=i,this.v3=s}getPoint(t,n=new Rt){let i=n,s=this.v0,a=this.v1,r=this.v2,o=this.v3;return i.set(Ac(t,s.x,a.x,r.x,o.x),Ac(t,s.y,a.y,r.y,o.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Qf=class extends Li{constructor(t=new L,n=new L,i=new L,s=new L){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=n,this.v2=i,this.v3=s}getPoint(t,n=new L){let i=n,s=this.v0,a=this.v1,r=this.v2,o=this.v3;return i.set(Ac(t,s.x,a.x,r.x,o.x),Ac(t,s.y,a.y,r.y,o.y),Ac(t,s.z,a.z,r.z,o.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},jf=class extends Li{constructor(t=new Rt,n=new Rt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=n}getPoint(t,n=new Rt){let i=n;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,n){return this.getPoint(t,n)}getTangent(t,n=new Rt){return n.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,n){return this.getTangent(t,n)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},$f=class extends Li{constructor(t=new L,n=new L){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=n}getPoint(t,n=new L){let i=n;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,n){return this.getPoint(t,n)}getTangent(t,n=new L){return n.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,n){return this.getTangent(t,n)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},td=class extends Li{constructor(t=new Rt,n=new Rt,i=new Rt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=n,this.v2=i}getPoint(t,n=new Rt){let i=n,s=this.v0,a=this.v1,r=this.v2;return i.set(Tc(t,s.x,a.x,r.x),Tc(t,s.y,a.y,r.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Gc=class extends Li{constructor(t=new L,n=new L,i=new L){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=n,this.v2=i}getPoint(t,n=new L){let i=n,s=this.v0,a=this.v1,r=this.v2;return i.set(Tc(t,s.x,a.x,r.x),Tc(t,s.y,a.y,r.y),Tc(t,s.z,a.z,r.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},ed=class extends Li{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,n=new Rt){let i=n,s=this.points,a=(s.length-1)*t,r=Math.floor(a),o=a-r,l=s[r===0?r:r-1],c=s[r],h=s[r>s.length-2?s.length-1:r+1],d=s[r>s.length-3?s.length-1:r+2];return i.set(aM(o,l.x,c.x,h.x,d.x),aM(o,l.y,c.y,h.y,d.y)),i}copy(t){super.copy(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){let s=t.points[n];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let n=0,i=this.points.length;n<i;n++){let s=this.points[n];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let n=0,i=t.points.length;n<i;n++){let s=t.points[n];this.points.push(new Rt().fromArray(s))}return this}},rC=Object.freeze({__proto__:null,ArcCurve:Jf,CatmullRomCurve3:nl,CubicBezierCurve:Kf,CubicBezierCurve3:Qf,EllipseCurve:Vc,LineCurve:jf,LineCurve3:$f,QuadraticBezierCurve:td,QuadraticBezierCurve3:Gc,SplineCurve:ed});var ta=class e extends $e{constructor(t=1,n=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:n,widthSegments:i,heightSegments:s};let a=t/2,r=n/2,o=Math.floor(i),l=Math.floor(s),c=o+1,h=l+1,d=t/o,u=n/l,p=[],m=[],S=[],g=[];for(let f=0;f<h;f++){let v=f*u-r;for(let x=0;x<c;x++){let y=x*d-a;m.push(y,-v,0),S.push(0,0,1),g.push(x/o),g.push(1-f/l)}}for(let f=0;f<l;f++)for(let v=0;v<o;v++){let x=v+c*f,y=v+c*(f+1),M=v+1+c*(f+1),w=v+1+c*f;p.push(x,y,w),p.push(y,M,w)}this.setIndex(p),this.setAttribute("position",new Ge(m,3)),this.setAttribute("normal",new Ge(S,3)),this.setAttribute("uv",new Ge(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}};var il=class e extends $e{constructor(t=1,n=32,i=16,s=0,a=Math.PI*2,r=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:n,heightSegments:i,phiStart:s,phiLength:a,thetaStart:r,thetaLength:o},n=Math.max(3,Math.floor(n)),i=Math.max(2,Math.floor(i));let l=Math.min(r+o,Math.PI),c=0,h=[],d=new L,u=new L,p=[],m=[],S=[],g=[];for(let f=0;f<=i;f++){let v=[],x=f/i,y=r+x*o,M=t*Math.cos(y),w=Math.sqrt(t*t-M*M),E=0;f===0&&r===0?E=.5/n:f===i&&l===Math.PI&&(E=-.5/n);for(let b=0;b<=n;b++){let A=b/n,R=s+A*a;d.x=-w*Math.cos(R),d.y=M,d.z=w*Math.sin(R),m.push(d.x,d.y,d.z),u.copy(d).normalize(),S.push(u.x,u.y,u.z),g.push(A+E,1-x),v.push(c++)}h.push(v)}for(let f=0;f<i;f++)for(let v=0;v<n;v++){let x=h[f][v+1],y=h[f][v],M=h[f+1][v],w=h[f+1][v+1];(f!==0||r>0)&&p.push(x,y,w),(f!==i-1||l<Math.PI)&&p.push(y,M,w)}this.setIndex(p),this.setAttribute("position",new Ge(m,3)),this.setAttribute("normal",new Ge(S,3)),this.setAttribute("uv",new Ge(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var sl=class e extends $e{constructor(t=new Gc(new L(-1,-1,0),new L(-1,1,0),new L(1,1,0)),n=64,i=1,s=8,a=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:n,radius:i,radialSegments:s,closed:a};let r=t.computeFrenetFrames(n,a);this.tangents=r.tangents,this.normals=r.normals,this.binormals=r.binormals;let o=new L,l=new L,c=new Rt,h=new L,d=[],u=[],p=[],m=[];S(),this.setIndex(m),this.setAttribute("position",new Ge(d,3)),this.setAttribute("normal",new Ge(u,3)),this.setAttribute("uv",new Ge(p,2));function S(){for(let x=0;x<n;x++)g(x);g(a===!1?n:0),v(),f()}function g(x){h=t.getPointAt(x/n,h);let y=r.normals[x],M=r.binormals[x];for(let w=0;w<=s;w++){let E=w/s*Math.PI*2,b=Math.sin(E),A=-Math.cos(E);l.x=A*y.x+b*M.x,l.y=A*y.y+b*M.y,l.z=A*y.z+b*M.z,l.normalize(),u.push(l.x,l.y,l.z),o.x=h.x+i*l.x,o.y=h.y+i*l.y,o.z=h.z+i*l.z,d.push(o.x,o.y,o.z)}}function f(){for(let x=1;x<=n;x++)for(let y=1;y<=s;y++){let M=(s+1)*(x-1)+(y-1),w=(s+1)*x+(y-1),E=(s+1)*x+y,b=(s+1)*(x-1)+y;m.push(M,w,b),m.push(w,E,b)}}function v(){for(let x=0;x<=n;x++)for(let y=0;y<=s;y++)c.x=x/n,c.y=y/s,p.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new e(new rC[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}};function Or(e){let t={};for(let n in e){t[n]={};for(let i in e[n]){let s=e[n][i];if(rM(s))s.isRenderTargetTexture?(It("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[n][i]=null):t[n][i]=s.clone();else if(Array.isArray(s))if(rM(s[0])){let a=[];for(let r=0,o=s.length;r<o;r++)a[r]=s[r].clone();t[n][i]=a}else t[n][i]=s.slice();else t[n][i]=s}}return t}function In(e){let t={};for(let n=0;n<e.length;n++){let i=Or(e[n]);for(let s in i)t[s]=i[s]}return t}function rM(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function oC(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function _v(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:se.workingColorSpace}var ZM={clone:Or,merge:In},lC=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,cC=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,bn=class extends Zi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=lC,this.fragmentShader=cC,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Or(t.uniforms),this.uniformsGroups=oC(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let n=super.toJSON(t);n.glslVersion=this.glslVersion,n.uniforms={};for(let s in this.uniforms){let r=this.uniforms[s].value;r&&r.isTexture?n.uniforms[s]={type:"t",value:r.toJSON(t).uuid}:r&&r.isColor?n.uniforms[s]={type:"c",value:r.getHex()}:r&&r.isVector2?n.uniforms[s]={type:"v2",value:r.toArray()}:r&&r.isVector3?n.uniforms[s]={type:"v3",value:r.toArray()}:r&&r.isVector4?n.uniforms[s]={type:"v4",value:r.toArray()}:r&&r.isMatrix3?n.uniforms[s]={type:"m3",value:r.toArray()}:r&&r.isMatrix4?n.uniforms[s]={type:"m4",value:r.toArray()}:n.uniforms[s]={value:r}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}fromJSON(t,n){if(super.fromJSON(t,n),t.uniforms!==void 0)for(let i in t.uniforms){let s=t.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=n[s.value]||null;break;case"c":this.uniforms[i].value=new Ot().setHex(s.value);break;case"v2":this.uniforms[i].value=new Rt().fromArray(s.value);break;case"v3":this.uniforms[i].value=new L().fromArray(s.value);break;case"v4":this.uniforms[i].value=new Ne().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Vt().fromArray(s.value);break;case"m4":this.uniforms[i].value=new fe().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},nd=class extends bn{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Ya=class extends Zi{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ot(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ot(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=su,this.normalScale=new Rt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new qi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var id=class extends Zi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=OM,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},sd=class extends Zi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}},kc=class extends Zi{constructor(t){super(),this.isMeshMatcapMaterial=!0,this.defines={MATCAP:""},this.type="MeshMatcapMaterial",this.color=new Ot(16777215),this.matcap=null,this.map=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=su,this.normalScale=new Rt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={MATCAP:""},this.color.copy(t.color),this.matcap=t.matcap,this.map=t.map,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.alphaMap=t.alphaMap,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.flatShading=t.flatShading,this.fog=t.fog,this}};function wf(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT=="number"?new t(e):Array.prototype.slice.call(e)}var Za=class{constructor(t,n,i,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new n.constructor(i),this.sampleValues=n,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let n=this.parameterPositions,i=this._cachedIndex,s=n[i],a=n[i-1];t:{e:{let r;n:{i:if(!(t<s)){for(let o=i+2;;){if(s===void 0){if(t<a)break i;return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(a=s,s=n[++i],t<s)break e}r=n.length;break n}if(!(t>=a)){let o=n[1];t<o&&(i=2,a=o);for(let l=i-2;;){if(a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=a,a=n[--i-1],t>=a)break e}r=i,i=0;break n}break t}for(;i<r;){let o=i+r>>>1;t<n[o]?r=o:i=o+1}if(s=n[i],a=n[i-1],a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=n.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,a,s)}return this.interpolate_(i,a,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let n=this.resultBuffer,i=this.sampleValues,s=this.valueSize,a=t*s;for(let r=0;r!==s;++r)n[r]=i[a+r];return n}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},ad=class extends Za{constructor(t,n,i,s){super(t,n,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:kg,endingEnd:kg}}intervalChanged_(t,n,i){let s=this.parameterPositions,a=t-2,r=t+1,o=s[a],l=s[r];if(o===void 0)switch(this.getSettings_().endingStart){case Wg:a=t,o=2*n-i;break;case Xg:a=s.length-2,o=n+s[a]-s[a+1];break;default:a=t,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Wg:r=t,l=2*i-n;break;case Xg:r=1,l=i+s[1]-s[0];break;default:r=t-1,l=n}let c=(i-n)*.5,h=this.valueSize;this._weightPrev=c/(n-o),this._weightNext=c/(l-i),this._offsetPrev=a*h,this._offsetNext=r*h}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,p=this._weightNext,m=(i-n)/(s-n),S=m*m,g=S*m,f=-u*g+2*u*S-u*m,v=(1+u)*g+(-1.5-2*u)*S+(-.5+u)*m+1,x=(-1-p)*g+(1.5+p)*S+.5*m,y=p*g-p*S;for(let M=0;M!==o;++M)a[M]=f*r[h+M]+v*r[c+M]+x*r[l+M]+y*r[d+M];return a}},rd=class extends Za{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=(i-n)/(s-n),d=1-h;for(let u=0;u!==o;++u)a[u]=r[c+u]*d+r[l+u]*h;return a}},od=class extends Za{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t){return this.copySampleValue_(t-1)}},ld=class extends Za{interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this.inTangents,d=this.outTangents;if(!h||!d){let m=(i-n)/(s-n),S=1-m;for(let g=0;g!==o;++g)a[g]=r[c+g]*S+r[l+g]*m;return a}let u=o*2,p=t-1;for(let m=0;m!==o;++m){let S=r[c+m],g=r[l+m],f=p*u+m*2,v=d[f],x=d[f+1],y=t*u+m*2,M=h[y],w=h[y+1],E=(i-n)/(s-n),b,A,R,N,I;for(let G=0;G<8;G++){b=E*E,A=b*E,R=1-E,N=R*R,I=N*R;let O=I*n+3*N*E*v+3*R*b*M+A*s-i;if(Math.abs(O)<1e-10)break;let H=3*N*(v-n)+6*R*E*(M-v)+3*b*(s-M);if(Math.abs(H)<1e-10)break;E=E-O/H,E=Math.max(0,Math.min(1,E))}a[m]=I*S+3*N*E*x+3*R*b*w+A*g}return a}},gi=class{constructor(t,n,i,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(n===void 0||n.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=wf(n,this.TimeBufferType),this.values=wf(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let n=t.constructor,i;if(n.toJSON!==this.toJSON)i=n.toJSON(t);else{i={name:t.name,times:wf(t.times,Array),values:wf(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(i.interpolation=s)}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new od(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new rd(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new ad(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let n=new ld(this.times,this.values,this.getValueSize(),t);return this.settings&&(n.inTangents=this.settings.inTangents,n.outTangents=this.settings.outTangents),n}setInterpolation(t){let n;switch(t){case Cc:n=this.InterpolantFactoryMethodDiscrete;break;case Hf:n=this.InterpolantFactoryMethodLinear;break;case Af:n=this.InterpolantFactoryMethodSmooth;break;case Gg:n=this.InterpolantFactoryMethodBezier;break}if(n===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return It("KeyframeTrack:",i),this}return this.createInterpolant=n,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Cc;case this.InterpolantFactoryMethodLinear:return Hf;case this.InterpolantFactoryMethodSmooth:return Af;case this.InterpolantFactoryMethodBezier:return Gg}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let n=this.times;for(let i=0,s=n.length;i!==s;++i)n[i]+=t}return this}scale(t){if(t!==1){let n=this.times;for(let i=0,s=n.length;i!==s;++i)n[i]*=t}return this}trim(t,n){let i=this.times,s=i.length,a=0,r=s-1;for(;a!==s&&i[a]<t;)++a;for(;r!==-1&&i[r]>n;)--r;if(++r,a!==0||r!==s){a>=r&&(r=Math.max(r,1),a=r-1);let o=this.getValueSize();this.times=i.slice(a,r),this.values=this.values.slice(a*o,r*o)}return this}validate(){let t=!0,n=this.getValueSize();n-Math.floor(n)!==0&&(zt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,s=this.values,a=i.length;a===0&&(zt("KeyframeTrack: Track is empty.",this),t=!1);let r=null;for(let o=0;o!==a;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){zt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(r!==null&&r>l){zt("KeyframeTrack: Out of order keys.",this,o,l,r),t=!1;break}r=l}if(s!==void 0&&D2(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){zt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),n=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Af,a=t.length-1,r=1;for(let o=1;o<a;++o){let l=!1,c=t[o],h=t[o+1];if(c!==h&&(o!==1||c!==t[0]))if(s)l=!0;else{let d=o*i,u=d-i,p=d+i;for(let m=0;m!==i;++m){let S=n[d+m];if(S!==n[u+m]||S!==n[p+m]){l=!0;break}}}if(l){if(o!==r){t[r]=t[o];let d=o*i,u=r*i;for(let p=0;p!==i;++p)n[u+p]=n[d+p]}++r}}if(a>0){t[r]=t[a];for(let o=a*i,l=r*i,c=0;c!==i;++c)n[l+c]=n[o+c];++r}return r!==t.length?(this.times=t.slice(0,r),this.values=n.slice(0,r*i)):(this.times=t,this.values=n),this}clone(){let t=this.times.slice(),n=this.values.slice(),i=this.constructor,s=new i(this.name,t,n);return s.createInterpolant=this.createInterpolant,s}};gi.prototype.ValueTypeName="";gi.prototype.TimeBufferType=Float32Array;gi.prototype.ValueBufferType=Float32Array;gi.prototype.DefaultInterpolation=Hf;var Ja=class extends gi{constructor(t,n,i){super(t,n,i)}};Ja.prototype.ValueTypeName="bool";Ja.prototype.ValueBufferType=Array;Ja.prototype.DefaultInterpolation=Cc;Ja.prototype.InterpolantFactoryMethodLinear=void 0;Ja.prototype.InterpolantFactoryMethodSmooth=void 0;var cd=class extends gi{constructor(t,n,i,s){super(t,n,i,s)}};cd.prototype.ValueTypeName="color";var ud=class extends gi{constructor(t,n,i,s){super(t,n,i,s)}};ud.prototype.ValueTypeName="number";var hd=class extends Za{constructor(t,n,i,s){super(t,n,i,s)}interpolate_(t,n,i,s){let a=this.resultBuffer,r=this.sampleValues,o=this.valueSize,l=(i-n)/(s-n),c=t*o;for(let h=c+o;c!==h;c+=4)jn.slerpFlat(a,0,r,c-o,r,c,l);return a}},Wc=class extends gi{constructor(t,n,i,s){super(t,n,i,s)}InterpolantFactoryMethodLinear(t){return new hd(this.times,this.values,this.getValueSize(),t)}};Wc.prototype.ValueTypeName="quaternion";Wc.prototype.InterpolantFactoryMethodSmooth=void 0;var Ka=class extends gi{constructor(t,n,i){super(t,n,i)}};Ka.prototype.ValueTypeName="string";Ka.prototype.ValueBufferType=Array;Ka.prototype.DefaultInterpolation=Cc;Ka.prototype.InterpolantFactoryMethodLinear=void 0;Ka.prototype.InterpolantFactoryMethodSmooth=void 0;var fd=class extends gi{constructor(t,n,i,s){super(t,n,i,s)}};fd.prototype.ValueTypeName="vector";var dd=class{constructor(t,n,i){let s=this,a=!1,r=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=n,this.onError=i,this._abortController=null,this.itemStart=function(h){o++,a===!1&&s.onStart!==void 0&&s.onStart(h,r,o),a=!0},this.itemEnd=function(h){r++,s.onProgress!==void 0&&s.onProgress(h,r,o),r===o&&(a=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let p=c[d],m=c[d+1];if(p.global&&(p.lastIndex=0),p.test(h))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},JM=new dd,pd=class{constructor(t){this.manager=t!==void 0?t:JM,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,n){let i=this;return new Promise(function(s,a){i.load(t,s,n,a)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};pd.DEFAULT_MATERIAL_NAME="__DEFAULT";var Xc=class extends Cn{constructor(t,n=1){super(),this.isLight=!0,this.type="Light",this.color=new Ot(t),this.intensity=n}dispose(){this.dispatchEvent({type:"dispose"})}copy(t,n){return super.copy(t,n),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let n=super.toJSON(t);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,n}};var Vg=new fe,oM=new L,lM=new L,Jg=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Rt(512,512),this.mapType=$n,this.map=null,this.mapPass=null,this.matrix=new fe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new $o,this._frameExtents=new Rt(1,1),this._viewportCount=1,this._viewports=[new Ne(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let n=this.camera,i=this.matrix;oM.setFromMatrixPosition(t.matrixWorld),n.position.copy(oM),lM.setFromMatrixPosition(t.target.matrixWorld),n.lookAt(lM),n.updateMatrixWorld(),Vg.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Vg,n.coordinateSystem,n.reversedDepth),n.coordinateSystem===Yo||n.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Vg)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Ef=new L,Tf=new jn,hs=new L,qc=class extends Cn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new fe,this.projectionMatrix=new fe,this.projectionMatrixInverse=new fe,this.coordinateSystem=Xi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,n){return super.copy(t,n),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Ef,Tf,hs),hs.x===1&&hs.y===1&&hs.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ef,Tf,hs.set(1,1,1)).invert()}updateWorldMatrix(t,n,i=!1){super.updateWorldMatrix(t,n,i),this.matrixWorld.decompose(Ef,Tf,hs),hs.x===1&&hs.y===1&&hs.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ef,Tf,hs.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ga=new L,cM=new Rt,uM=new Rt,xn=class extends qc{constructor(t=50,n=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let n=.5*this.getFilmHeight()/t;this.fov=Vf*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Cf*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Vf*2*Math.atan(Math.tan(Cf*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,n,i){Ga.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ga.x,Ga.y).multiplyScalar(-t/Ga.z),Ga.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ga.x,Ga.y).multiplyScalar(-t/Ga.z)}getViewSize(t,n){return this.getViewBounds(t,cM,uM),n.subVectors(uM,cM)}setViewOffset(t,n,i,s,a,r){this.aspect=t/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,n=t*Math.tan(Cf*.5*this.fov)/this.zoom,i=2*n,s=this.aspect*i,a=-.5*s,r=this.view;if(this.view!==null&&this.view.enabled){let l=r.fullWidth,c=r.fullHeight;a+=r.offsetX*s/l,n-=r.offsetY*i/c,s*=r.width/l,i*=r.height/c}let o=this.filmOffset;o!==0&&(a+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+s,n,n-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let n=super.toJSON(t);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}};var xs=class extends qc{constructor(t=-1,n=1,i=1,s=-1,a=.1,r=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=n,this.top=i,this.bottom=s,this.near=a,this.far=r,this.updateProjectionMatrix()}copy(t,n){return super.copy(t,n),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,n,i,s,a,r){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,a=i-t,r=i+t,o=s+n,l=s-n;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=c*this.view.offsetX,r=a+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(a,r,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let n=super.toJSON(t);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}},Kg=class extends Jg{constructor(){super(new xs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},al=class extends Xc{constructor(t,n){super(t,n),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Cn.DEFAULT_UP),this.updateMatrix(),this.target=new Cn,this.shadow=new Kg}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let n=super.toJSON(t);return n.object.shadow=this.shadow.toJSON(),n.object.target=this.target.uuid,n}},Yc=class extends Xc{constructor(t,n){super(t,n),this.isAmbientLight=!0,this.type="AmbientLight"}};var Wo=-90,Xo=1,md=class extends Cn{constructor(t,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new xn(Wo,Xo,t,n);s.layers=this.layers,this.add(s);let a=new xn(Wo,Xo,t,n);a.layers=this.layers,this.add(a);let r=new xn(Wo,Xo,t,n);r.layers=this.layers,this.add(r);let o=new xn(Wo,Xo,t,n);o.layers=this.layers,this.add(o);let l=new xn(Wo,Xo,t,n);l.layers=this.layers,this.add(l);let c=new xn(Wo,Xo,t,n);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,n=this.children.concat(),[i,s,a,r,o,l]=n;for(let c of n)this.remove(c);if(t===Xi)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Yo)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of n)this.add(c),c.updateMatrixWorld()}update(t,n){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[a,r,o,l,c,h]=this.children,d=t.getRenderTarget(),u=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),m=t.xr.enabled;t.xr.enabled=!1;let S=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let g=!1;t.isWebGLRenderer===!0?g=t.state.buffers.depth.getReversed():g=t.reversedDepthBuffer,t.setRenderTarget(i,0,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(n,a),t.setRenderTarget(i,1,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(n,r),t.setRenderTarget(i,2,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(n,o),t.setRenderTarget(i,3,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(n,l),t.setRenderTarget(i,4,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(n,c),i.texture.generateMipmaps=S,t.setRenderTarget(i,5,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(n,h),t.setRenderTarget(d,u,p),t.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},gd=class extends xn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var bv="\\[\\]\\.:\\/",uC=new RegExp("["+bv+"]","g"),Sv="[^"+bv+"]",hC="[^"+bv.replace("\\.","")+"]",fC=/((?:WC+[\/:])*)/.source.replace("WC",Sv),dC=/(WCOD+)?/.source.replace("WCOD",hC),pC=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Sv),mC=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Sv),gC=new RegExp("^"+fC+dC+pC+mC+"$"),vC=["material","materials","bones","map"],Qg=class{constructor(t,n,i){let s=i||Ve.parseTrackName(n);this._targetGroup=t,this._bindings=t.subscribe_(n,s)}getValue(t,n){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(t,n)}setValue(t,n){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,a=i.length;s!==a;++s)i[s].setValue(t,n)}bind(){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].bind()}unbind(){let t=this._bindings;for(let n=this._targetGroup.nCachedObjects_,i=t.length;n!==i;++n)t[n].unbind()}},Ve=class e{constructor(t,n,i){this.path=n,this.parsedPath=i||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,i){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,i):new e(t,n,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(uC,"")}static parseTrackName(t){let n=gC.exec(t);if(n===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:n[2],objectName:n[3],objectIndex:n[4],propertyName:n[5],propertyIndex:n[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let a=i.nodeName.substring(s+1);vC.indexOf(a)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=a)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,n){if(n===void 0||n===""||n==="."||n===-1||n===t.name||n===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(n);if(i!==void 0)return i}if(t.children){let i=function(a){for(let r=0;r<a.length;r++){let o=a[r];if(o.name===n||o.uuid===n)return o;let l=i(o.children);if(l)return l}return null},s=i(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,n){t[n]=this.targetObject[this.propertyName]}_getValue_array(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)t[n++]=i[s]}_getValue_arrayElement(t,n){t[n]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,n){this.resolvedProperty.toArray(t,n)}_setValue_direct(t,n){this.targetObject[this.propertyName]=t[n]}_setValue_direct_setNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,n){this.targetObject[this.propertyName]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++]}_setValue_array_setNeedsUpdate(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,n){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[n++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,n){this.resolvedProperty[this.propertyIndex]=t[n]}_setValue_arrayElement_setNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty[this.propertyIndex]=t[n],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,n){this.resolvedProperty.fromArray(t,n)}_setValue_fromArray_setNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,n){this.resolvedProperty.fromArray(t,n),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,n){this.bind(),this.getValue(t,n)}_setValue_unbound(t,n){this.bind(),this.setValue(t,n)}bind(){let t=this.node,n=this.parsedPath,i=n.objectName,s=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){It("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=n.objectIndex;switch(i){case"materials":if(!t.material){zt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){zt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){zt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){zt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){zt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){zt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){zt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let r=t[s];if(r===void 0){let c=n.nodeName;zt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(a!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){zt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){zt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}l=this.BindingType.ArrayElement,this.resolvedProperty=r,this.propertyIndex=a}else r.fromArray!==void 0&&r.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=r):Array.isArray(r)?(l=this.BindingType.EntireArray,this.resolvedProperty=r):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ve.Composite=Qg;Ve.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ve.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ve.prototype.GetterByBindingType=[Ve.prototype._getValue_direct,Ve.prototype._getValue_array,Ve.prototype._getValue_arrayElement,Ve.prototype._getValue_toArray];Ve.prototype.SetterByBindingTypeAndVersioning=[[Ve.prototype._setValue_direct,Ve.prototype._setValue_direct_setNeedsUpdate,Ve.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ve.prototype._setValue_array,Ve.prototype._setValue_array_setNeedsUpdate,Ve.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ve.prototype._setValue_arrayElement,Ve.prototype._setValue_arrayElement_setNeedsUpdate,Ve.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ve.prototype._setValue_fromArray,Ve.prototype._setValue_fromArray_setNeedsUpdate,Ve.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var GU=new Float32Array(1);var Cv=class Cv{constructor(t,n,i,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,n,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,n=0){for(let i=0;i<4;i++)this.elements[i]=t[i+n];return this}set(t,n,i,s){let a=this.elements;return a[0]=t,a[2]=n,a[1]=i,a[3]=s,this}};Cv.prototype.isMatrix2=!0;var jg=Cv;function Mv(e,t,n,i){let s=yC(i);switch(n){case mv:return e*t;case wd:return e*t/s.components*s.byteLength;case Ed:return e*t/s.components*s.byteLength;case tr:return e*t*2/s.components*s.byteLength;case Td:return e*t*2/s.components*s.byteLength;case gv:return e*t*3/s.components*s.byteLength;case Ii:return e*t*4/s.components*s.byteLength;case Ad:return e*t*4/s.components*s.byteLength;case jc:case $c:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case tu:case eu:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Rd:case Ld:return Math.max(e,16)*Math.max(t,8)/4;case Cd:case Nd:return Math.max(e,8)*Math.max(t,8)/2;case Dd:case Ud:case Od:case Pd:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case Id:case nu:case Bd:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case zd:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case Fd:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case Hd:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case Vd:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case Gd:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case kd:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case Wd:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case Xd:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case qd:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case Yd:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case Zd:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case Jd:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case Kd:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case Qd:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case jd:case $d:case tp:return Math.ceil(e/4)*Math.ceil(t/4)*16;case ep:case np:return Math.ceil(e/4)*Math.ceil(t/4)*8;case iu:case ip:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function yC(e){switch(e){case $n:case hv:return{byteLength:1,components:1};case ol:case fv:case bs:return{byteLength:2,components:1};case Sd:case Md:return{byteLength:2,components:4};case Ki:case bd:case Ui:return{byteLength:4,components:1};case dv:case pv:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"185"}}));typeof window!="undefined"&&(window.__THREE__?It("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="185");function yw(){let e=null,t=!1,n=null,i=null;function s(a,r){n(a,r),i=e.requestAnimationFrame(s)}return{start:function(){t!==!0&&n!==null&&e!==null&&(i=e.requestAnimationFrame(s),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(a){n=a},setContext:function(a){e=a}}}function EC(e){let t=new WeakMap;function n(o,l){let c=o.array,h=o.usage,d=c.byteLength,u=e.createBuffer();e.bindBuffer(l,u),e.bufferData(l,c,h),o.onUploadCallback();let p;if(c instanceof Float32Array)p=e.FLOAT;else if(typeof Float16Array!="undefined"&&c instanceof Float16Array)p=e.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=e.HALF_FLOAT:p=e.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=e.SHORT;else if(c instanceof Uint32Array)p=e.UNSIGNED_INT;else if(c instanceof Int32Array)p=e.INT;else if(c instanceof Int8Array)p=e.BYTE;else if(c instanceof Uint8Array)p=e.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function i(o,l,c){let h=l.array,d=l.updateRanges;if(e.bindBuffer(c,o),d.length===0)e.bufferSubData(c,0,h);else{d.sort((p,m)=>p.start-m.start);let u=0;for(let p=1;p<d.length;p++){let m=d[u],S=d[p];S.start<=m.start+m.count+1?m.count=Math.max(m.count,S.start+S.count-m.start):(++u,d[u]=S)}d.length=u+1;for(let p=0,m=d.length;p<m;p++){let S=d[p];e.bufferSubData(c,S.start*h.BYTES_PER_ELEMENT,h,S.start,S.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function a(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(e.deleteBuffer(l.buffer),t.delete(o))}function r(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,n(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:a,update:r}}var TC=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,AC=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,CC=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,RC=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,NC=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,LC=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,DC=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,UC=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,IC=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,OC=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,PC=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,BC=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,zC=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,FC=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,HC=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,VC=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,GC=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,kC=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,WC=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,XC=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,qC=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,YC=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,ZC=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,JC=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,KC=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,QC=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,jC=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,$C=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,tR=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,eR=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,nR="gl_FragColor = linearToOutputTexel( gl_FragColor );",iR=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,sR=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,aR=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,rR=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,oR=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,lR=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,cR=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,uR=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,hR=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fR=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,dR=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,pR=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,mR=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,gR=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,vR=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,yR=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,xR=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,_R=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,bR=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,SR=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,MR=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,wR=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,ER=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,TR=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,AR=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,CR=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,RR=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,NR=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,LR=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,DR=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,UR=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,IR=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,OR=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,PR=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,BR=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,zR=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,FR=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,HR=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,VR=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,GR=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,kR=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,WR=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,XR=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,qR=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,YR=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ZR=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,JR=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,KR=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,QR=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,jR=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,$R=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,t3=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,e3=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,n3=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,i3=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,s3=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,a3=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,r3=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,o3=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,l3=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,c3=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,u3=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,h3=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,f3=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,d3=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,p3=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,m3=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,g3=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,v3=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,y3=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,x3=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,_3=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,b3=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,S3=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,M3=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,w3=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,E3=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,T3=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,A3=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,C3=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,R3=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,N3=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,L3=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,D3=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,U3=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,I3=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,O3=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,P3=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,B3=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,z3=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,F3=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,H3=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,V3=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,G3=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,k3=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,W3=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,X3=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,q3=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Y3=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Z3=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,J3=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,K3=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Q3=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,j3=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,$3=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,tN=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,eN=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,nN=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,iN=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sN=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,aN=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Jt={alphahash_fragment:TC,alphahash_pars_fragment:AC,alphamap_fragment:CC,alphamap_pars_fragment:RC,alphatest_fragment:NC,alphatest_pars_fragment:LC,aomap_fragment:DC,aomap_pars_fragment:UC,batching_pars_vertex:IC,batching_vertex:OC,begin_vertex:PC,beginnormal_vertex:BC,bsdfs:zC,iridescence_fragment:FC,bumpmap_pars_fragment:HC,clipping_planes_fragment:VC,clipping_planes_pars_fragment:GC,clipping_planes_pars_vertex:kC,clipping_planes_vertex:WC,color_fragment:XC,color_pars_fragment:qC,color_pars_vertex:YC,color_vertex:ZC,common:JC,cube_uv_reflection_fragment:KC,defaultnormal_vertex:QC,displacementmap_pars_vertex:jC,displacementmap_vertex:$C,emissivemap_fragment:tR,emissivemap_pars_fragment:eR,colorspace_fragment:nR,colorspace_pars_fragment:iR,envmap_fragment:sR,envmap_common_pars_fragment:aR,envmap_pars_fragment:rR,envmap_pars_vertex:oR,envmap_physical_pars_fragment:yR,envmap_vertex:lR,fog_vertex:cR,fog_pars_vertex:uR,fog_fragment:hR,fog_pars_fragment:fR,gradientmap_pars_fragment:dR,lightmap_pars_fragment:pR,lights_lambert_fragment:mR,lights_lambert_pars_fragment:gR,lights_pars_begin:vR,lights_toon_fragment:xR,lights_toon_pars_fragment:_R,lights_phong_fragment:bR,lights_phong_pars_fragment:SR,lights_physical_fragment:MR,lights_physical_pars_fragment:wR,lights_fragment_begin:ER,lights_fragment_maps:TR,lights_fragment_end:AR,lightprobes_pars_fragment:CR,logdepthbuf_fragment:RR,logdepthbuf_pars_fragment:NR,logdepthbuf_pars_vertex:LR,logdepthbuf_vertex:DR,map_fragment:UR,map_pars_fragment:IR,map_particle_fragment:OR,map_particle_pars_fragment:PR,metalnessmap_fragment:BR,metalnessmap_pars_fragment:zR,morphinstance_vertex:FR,morphcolor_vertex:HR,morphnormal_vertex:VR,morphtarget_pars_vertex:GR,morphtarget_vertex:kR,normal_fragment_begin:WR,normal_fragment_maps:XR,normal_pars_fragment:qR,normal_pars_vertex:YR,normal_vertex:ZR,normalmap_pars_fragment:JR,clearcoat_normal_fragment_begin:KR,clearcoat_normal_fragment_maps:QR,clearcoat_pars_fragment:jR,iridescence_pars_fragment:$R,opaque_fragment:t3,packing:e3,premultiplied_alpha_fragment:n3,project_vertex:i3,dithering_fragment:s3,dithering_pars_fragment:a3,roughnessmap_fragment:r3,roughnessmap_pars_fragment:o3,shadowmap_pars_fragment:l3,shadowmap_pars_vertex:c3,shadowmap_vertex:u3,shadowmask_pars_fragment:h3,skinbase_vertex:f3,skinning_pars_vertex:d3,skinning_vertex:p3,skinnormal_vertex:m3,specularmap_fragment:g3,specularmap_pars_fragment:v3,tonemapping_fragment:y3,tonemapping_pars_fragment:x3,transmission_fragment:_3,transmission_pars_fragment:b3,uv_pars_fragment:S3,uv_pars_vertex:M3,uv_vertex:w3,worldpos_vertex:E3,background_vert:T3,background_frag:A3,backgroundCube_vert:C3,backgroundCube_frag:R3,cube_vert:N3,cube_frag:L3,depth_vert:D3,depth_frag:U3,distance_vert:I3,distance_frag:O3,equirect_vert:P3,equirect_frag:B3,linedashed_vert:z3,linedashed_frag:F3,meshbasic_vert:H3,meshbasic_frag:V3,meshlambert_vert:G3,meshlambert_frag:k3,meshmatcap_vert:W3,meshmatcap_frag:X3,meshnormal_vert:q3,meshnormal_frag:Y3,meshphong_vert:Z3,meshphong_frag:J3,meshphysical_vert:K3,meshphysical_frag:Q3,meshtoon_vert:j3,meshtoon_frag:$3,points_vert:tN,points_frag:eN,shadow_vert:nN,shadow_frag:iN,sprite_vert:sN,sprite_frag:aN},dt={common:{diffuse:{value:new Ot(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Vt},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Vt}},envmap:{envMap:{value:null},envMapRotation:{value:new Vt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Vt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Vt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Vt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Vt},normalScale:{value:new Rt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Vt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Vt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Vt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Vt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ot(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new L},probesMax:{value:new L},probesResolution:{value:new L}},points:{diffuse:{value:new Ot(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0},uvTransform:{value:new Vt}},sprite:{diffuse:{value:new Ot(16777215)},opacity:{value:1},center:{value:new Rt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Vt},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0}}},Ms={basic:{uniforms:In([dt.common,dt.specularmap,dt.envmap,dt.aomap,dt.lightmap,dt.fog]),vertexShader:Jt.meshbasic_vert,fragmentShader:Jt.meshbasic_frag},lambert:{uniforms:In([dt.common,dt.specularmap,dt.envmap,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.fog,dt.lights,{emissive:{value:new Ot(0)},envMapIntensity:{value:1}}]),vertexShader:Jt.meshlambert_vert,fragmentShader:Jt.meshlambert_frag},phong:{uniforms:In([dt.common,dt.specularmap,dt.envmap,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.fog,dt.lights,{emissive:{value:new Ot(0)},specular:{value:new Ot(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Jt.meshphong_vert,fragmentShader:Jt.meshphong_frag},standard:{uniforms:In([dt.common,dt.envmap,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.roughnessmap,dt.metalnessmap,dt.fog,dt.lights,{emissive:{value:new Ot(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Jt.meshphysical_vert,fragmentShader:Jt.meshphysical_frag},toon:{uniforms:In([dt.common,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.gradientmap,dt.fog,dt.lights,{emissive:{value:new Ot(0)}}]),vertexShader:Jt.meshtoon_vert,fragmentShader:Jt.meshtoon_frag},matcap:{uniforms:In([dt.common,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.fog,{matcap:{value:null}}]),vertexShader:Jt.meshmatcap_vert,fragmentShader:Jt.meshmatcap_frag},points:{uniforms:In([dt.points,dt.fog]),vertexShader:Jt.points_vert,fragmentShader:Jt.points_frag},dashed:{uniforms:In([dt.common,dt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Jt.linedashed_vert,fragmentShader:Jt.linedashed_frag},depth:{uniforms:In([dt.common,dt.displacementmap]),vertexShader:Jt.depth_vert,fragmentShader:Jt.depth_frag},normal:{uniforms:In([dt.common,dt.bumpmap,dt.normalmap,dt.displacementmap,{opacity:{value:1}}]),vertexShader:Jt.meshnormal_vert,fragmentShader:Jt.meshnormal_frag},sprite:{uniforms:In([dt.sprite,dt.fog]),vertexShader:Jt.sprite_vert,fragmentShader:Jt.sprite_frag},background:{uniforms:{uvTransform:{value:new Vt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Jt.background_vert,fragmentShader:Jt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Vt}},vertexShader:Jt.backgroundCube_vert,fragmentShader:Jt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Jt.cube_vert,fragmentShader:Jt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Jt.equirect_vert,fragmentShader:Jt.equirect_frag},distance:{uniforms:In([dt.common,dt.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Jt.distance_vert,fragmentShader:Jt.distance_frag},shadow:{uniforms:In([dt.lights,dt.fog,{color:{value:new Ot(0)},opacity:{value:1}}]),vertexShader:Jt.shadow_vert,fragmentShader:Jt.shadow_frag}};Ms.physical={uniforms:In([Ms.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Vt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Vt},clearcoatNormalScale:{value:new Rt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Vt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Vt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Vt},sheen:{value:0},sheenColor:{value:new Ot(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Vt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Vt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Vt},transmissionSamplerSize:{value:new Rt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Vt},attenuationDistance:{value:0},attenuationColor:{value:new Ot(0)},specularColor:{value:new Ot(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Vt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Vt},anisotropyVector:{value:new Rt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Vt}}]),vertexShader:Jt.meshphysical_vert,fragmentShader:Jt.meshphysical_frag};var op={r:0,b:0,g:0},rN=new fe,xw=new Vt;xw.set(-1,0,0,0,1,0,0,0,1);function oN(e,t,n,i,s,a){let r=new Ot(0),o=s===!0?0:1,l,c,h=null,d=0,u=null;function p(v){let x=v.isScene===!0?v.background:null;if(x&&x.isTexture){let y=v.backgroundBlurriness>0;x=t.get(x,y)}return x}function m(v){let x=!1,y=p(v);y===null?g(r,o):y&&y.isColor&&(g(y,1),x=!0);let M=e.xr.getEnvironmentBlendMode();M==="additive"?n.buffers.color.setClear(0,0,0,1,a):M==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||x)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function S(v,x){let y=p(x);y&&(y.isCubeTexture||y.mapping===Kc)?(c===void 0&&(c=new we(new mi(1,1,1),new bn({name:"BackgroundCubeMaterial",uniforms:Or(Ms.backgroundCube.uniforms),vertexShader:Ms.backgroundCube.vertexShader,fragmentShader:Ms.backgroundCube.fragmentShader,side:Vn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(M,w,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(rN.makeRotationFromEuler(x.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(xw),c.material.toneMapped=se.getTransfer(y.colorSpace)!==ve,(h!==y||d!==y.version||u!==e.toneMapping)&&(c.material.needsUpdate=!0,h=y,d=y.version,u=e.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new we(new ta(2,2),new bn({name:"BackgroundMaterial",uniforms:Or(Ms.background.uniforms),vertexShader:Ms.background.vertexShader,fragmentShader:Ms.background.fragmentShader,side:js,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,l.material.toneMapped=se.getTransfer(y.colorSpace)!==ve,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||d!==y.version||u!==e.toneMapping)&&(l.material.needsUpdate=!0,h=y,d=y.version,u=e.toneMapping),l.layers.enableAll(),v.unshift(l,l.geometry,l.material,0,0,null))}function g(v,x){v.getRGB(op,_v(e)),n.buffers.color.setClear(op.r,op.g,op.b,x,a)}function f(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return r},setClearColor:function(v,x=1){r.set(v),o=x,g(r,o)},getClearAlpha:function(){return o},setClearAlpha:function(v){o=v,g(r,o)},render:m,addToRenderList:S,dispose:f}}function lN(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},s=u(null),a=s,r=!1;function o(N,I,G,q,O){let H=!1,D=d(N,q,G,I);a!==D&&(a=D,c(a.object)),H=p(N,q,G,O),H&&m(N,q,G,O),O!==null&&t.update(O,e.ELEMENT_ARRAY_BUFFER),(H||r)&&(r=!1,y(N,I,G,q),O!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(O).buffer))}function l(){return e.createVertexArray()}function c(N){return e.bindVertexArray(N)}function h(N){return e.deleteVertexArray(N)}function d(N,I,G,q){let O=q.wireframe===!0,H=i[I.id];H===void 0&&(H={},i[I.id]=H);let D=N.isInstancedMesh===!0?N.id:0,X=H[D];X===void 0&&(X={},H[D]=X);let Q=X[G.id];Q===void 0&&(Q={},X[G.id]=Q);let it=Q[O];return it===void 0&&(it=u(l()),Q[O]=it),it}function u(N){let I=[],G=[],q=[];for(let O=0;O<n;O++)I[O]=0,G[O]=0,q[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:G,attributeDivisors:q,object:N,attributes:{},index:null}}function p(N,I,G,q){let O=a.attributes,H=I.attributes,D=0,X=G.getAttributes();for(let Q in X)if(X[Q].location>=0){let rt=O[Q],st=H[Q];if(st===void 0&&(Q==="instanceMatrix"&&N.instanceMatrix&&(st=N.instanceMatrix),Q==="instanceColor"&&N.instanceColor&&(st=N.instanceColor)),rt===void 0||rt.attribute!==st||st&&rt.data!==st.data)return!0;D++}return a.attributesNum!==D||a.index!==q}function m(N,I,G,q){let O={},H=I.attributes,D=0,X=G.getAttributes();for(let Q in X)if(X[Q].location>=0){let rt=H[Q];rt===void 0&&(Q==="instanceMatrix"&&N.instanceMatrix&&(rt=N.instanceMatrix),Q==="instanceColor"&&N.instanceColor&&(rt=N.instanceColor));let st={};st.attribute=rt,rt&&rt.data&&(st.data=rt.data),O[Q]=st,D++}a.attributes=O,a.attributesNum=D,a.index=q}function S(){let N=a.newAttributes;for(let I=0,G=N.length;I<G;I++)N[I]=0}function g(N){f(N,0)}function f(N,I){let G=a.newAttributes,q=a.enabledAttributes,O=a.attributeDivisors;G[N]=1,q[N]===0&&(e.enableVertexAttribArray(N),q[N]=1),O[N]!==I&&(e.vertexAttribDivisor(N,I),O[N]=I)}function v(){let N=a.newAttributes,I=a.enabledAttributes;for(let G=0,q=I.length;G<q;G++)I[G]!==N[G]&&(e.disableVertexAttribArray(G),I[G]=0)}function x(N,I,G,q,O,H,D){D===!0?e.vertexAttribIPointer(N,I,G,O,H):e.vertexAttribPointer(N,I,G,q,O,H)}function y(N,I,G,q){S();let O=q.attributes,H=G.getAttributes(),D=I.defaultAttributeValues;for(let X in H){let Q=H[X];if(Q.location>=0){let it=O[X];if(it===void 0&&(X==="instanceMatrix"&&N.instanceMatrix&&(it=N.instanceMatrix),X==="instanceColor"&&N.instanceColor&&(it=N.instanceColor)),it!==void 0){let rt=it.normalized,st=it.itemSize,Pt=t.get(it);if(Pt===void 0)continue;let Gt=Pt.buffer,vt=Pt.type,W=Pt.bytesPerElement,et=vt===e.INT||vt===e.UNSIGNED_INT||it.gpuType===bd;if(it.isInterleavedBufferAttribute){let tt=it.data,Mt=tt.stride,Dt=it.offset;if(tt.isInstancedInterleavedBuffer){for(let wt=0;wt<Q.locationSize;wt++)f(Q.location+wt,tt.meshPerAttribute);N.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=tt.meshPerAttribute*tt.count)}else for(let wt=0;wt<Q.locationSize;wt++)g(Q.location+wt);e.bindBuffer(e.ARRAY_BUFFER,Gt);for(let wt=0;wt<Q.locationSize;wt++)x(Q.location+wt,st/Q.locationSize,vt,rt,Mt*W,(Dt+st/Q.locationSize*wt)*W,et)}else{if(it.isInstancedBufferAttribute){for(let tt=0;tt<Q.locationSize;tt++)f(Q.location+tt,it.meshPerAttribute);N.isInstancedMesh!==!0&&q._maxInstanceCount===void 0&&(q._maxInstanceCount=it.meshPerAttribute*it.count)}else for(let tt=0;tt<Q.locationSize;tt++)g(Q.location+tt);e.bindBuffer(e.ARRAY_BUFFER,Gt);for(let tt=0;tt<Q.locationSize;tt++)x(Q.location+tt,st/Q.locationSize,vt,rt,st*W,st/Q.locationSize*tt*W,et)}}else if(D!==void 0){let rt=D[X];if(rt!==void 0)switch(rt.length){case 2:e.vertexAttrib2fv(Q.location,rt);break;case 3:e.vertexAttrib3fv(Q.location,rt);break;case 4:e.vertexAttrib4fv(Q.location,rt);break;default:e.vertexAttrib1fv(Q.location,rt)}}}}v()}function M(){A();for(let N in i){let I=i[N];for(let G in I){let q=I[G];for(let O in q){let H=q[O];for(let D in H)h(H[D].object),delete H[D];delete q[O]}}delete i[N]}}function w(N){if(i[N.id]===void 0)return;let I=i[N.id];for(let G in I){let q=I[G];for(let O in q){let H=q[O];for(let D in H)h(H[D].object),delete H[D];delete q[O]}}delete i[N.id]}function E(N){for(let I in i){let G=i[I];for(let q in G){let O=G[q];if(O[N.id]===void 0)continue;let H=O[N.id];for(let D in H)h(H[D].object),delete H[D];delete O[N.id]}}}function b(N){for(let I in i){let G=i[I],q=N.isInstancedMesh===!0?N.id:0,O=G[q];if(O!==void 0){for(let H in O){let D=O[H];for(let X in D)h(D[X].object),delete D[X];delete O[H]}delete G[q],Object.keys(G).length===0&&delete i[I]}}}function A(){R(),r=!0,a!==s&&(a=s,c(a.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:A,resetDefaultState:R,dispose:M,releaseStatesOfGeometry:w,releaseStatesOfObject:b,releaseStatesOfProgram:E,initAttributes:S,enableAttribute:g,disableUnusedAttributes:v}}function cN(e,t,n){let i;function s(l){i=l}function a(l,c){e.drawArrays(i,l,c),n.update(c,i,1)}function r(l,c,h){h!==0&&(e.drawArraysInstanced(i,l,c,h),n.update(c,i,h))}function o(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let u=0;for(let p=0;p<h;p++)u+=c[p];n.update(u,i,1)}this.setMode=s,this.render=a,this.renderInstances=r,this.renderMultiDraw=o}function uN(e,t,n,i){let s;function a(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let E=t.get("EXT_texture_filter_anisotropic");s=e.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function r(E){return!(E!==Ii&&i.convert(E)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(E){let b=E===bs&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(E!==$n&&i.convert(E)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&E!==Ui&&!b)}function l(E){if(E==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=n.precision!==void 0?n.precision:"highp",h=l(c);h!==c&&(It("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=n.logarithmicDepthBuffer===!0,u=n.reversedDepthBuffer===!0&&t.has("EXT_clip_control");n.reversedDepthBuffer===!0&&u===!1&&It("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),S=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),f=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),x=e.getParameter(e.MAX_VARYING_VECTORS),y=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),M=e.getParameter(e.MAX_SAMPLES),w=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:l,textureFormatReadable:r,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:p,maxVertexTextures:m,maxTextureSize:S,maxCubemapSize:g,maxAttributes:f,maxVertexUniforms:v,maxVaryings:x,maxFragmentUniforms:y,maxSamples:M,samples:w}}function hN(e){let t=this,n=null,i=0,s=!1,a=!1,r=new fs,o=new Vt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let p=d.length!==0||u||i!==0||s;return s=u,i=d.length,p},this.beginShadows=function(){a=!0,h(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(d,u){n=h(d,u,0)},this.setState=function(d,u,p){let m=d.clippingPlanes,S=d.clipIntersection,g=d.clipShadows,f=e.get(d);if(!s||m===null||m.length===0||a&&!g)a?h(null):c();else{let v=a?0:i,x=v*4,y=f.clippingState||null;l.value=y,y=h(m,u,x,p);for(let M=0;M!==x;++M)y[M]=n[M];f.clippingState=y,this.numIntersection=S?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==n&&(l.value=n,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(d,u,p,m){let S=d!==null?d.length:0,g=null;if(S!==0){if(g=l.value,m!==!0||g===null){let f=p+S*4,v=u.matrixWorldInverse;o.getNormalMatrix(v),(g===null||g.length<f)&&(g=new Float32Array(f));for(let x=0,y=p;x!==S;++x,y+=4)r.copy(d[x]).applyMatrix4(v,o),r.normal.toArray(g,y),g[y+3]=r.constant}l.value=g,l.needsUpdate=!0}return t.numPlanes=S,t.numIntersection=0,g}}var er=4,KM=[.125,.215,.35,.446,.526,.582],Pr=20,fN=256,ru=new xs,QM=new Ot,Rv=null,Nv=0,Lv=0,Dv=!1,dN=new L,cp=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,n=0,i=.1,s=100,a={}){let{size:r=256,position:o=dN}=a;Rv=this._renderer.getRenderTarget(),Nv=this._renderer.getActiveCubeFace(),Lv=this._renderer.getActiveMipmapLevel(),Dv=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(r);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,s,l,o),n>0&&this._blur(l,0,0,n),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,n=null){return this._fromTexture(t,n)}fromCubemap(t,n=null){return this._fromTexture(t,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=tw(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=$M(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Rv,Nv,Lv),this._renderer.xr.enabled=Dv,t.scissorTest=!1,cl(t,0,0,t.width,t.height)}_fromTexture(t,n){t.mapping===Qa||t.mapping===Ir?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Rv=this._renderer.getRenderTarget(),Nv=this._renderer.getActiveCubeFace(),Lv=this._renderer.getActiveMipmapLevel(),Dv=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=n||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:on,minFilter:on,generateMipmaps:!1,type:bs,format:Ii,colorSpace:Rc,depthBuffer:!1},s=jM(t,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=jM(t,n,i);let{_lodMax:a}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=pN(a)),this._blurMaterial=gN(a,t,n),this._ggxMaterial=mN(a,t,n)}return s}_compileMaterial(t){let n=new we(new $e,t);this._renderer.compile(n,ru)}_sceneToCubeUV(t,n,i,s,a){let l=new xn(90,1,n,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,p=d.toneMapping;d.getClearColor(QM),d.toneMapping=Ji,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new we(new mi,new ys({name:"PMREM.Background",side:Vn,depthWrite:!1,depthTest:!1})));let S=this._backgroundBox,g=S.material,f=!1,v=t.background;v?v.isColor&&(g.color.copy(v),t.background=null,f=!0):(g.color.copy(QM),f=!0);for(let x=0;x<6;x++){let y=x%3;y===0?(l.up.set(0,c[x],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x+h[x],a.y,a.z)):y===1?(l.up.set(0,0,c[x]),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y+h[x],a.z)):(l.up.set(0,c[x],0),l.position.set(a.x,a.y,a.z),l.lookAt(a.x,a.y,a.z+h[x]));let M=this._cubeSize;cl(s,y*M,x>2?M:0,M,M),d.setRenderTarget(s),f&&d.render(S,l),d.render(t,l)}d.toneMapping=p,d.autoClear=u,t.background=v}_textureToCubeUV(t,n){let i=this._renderer,s=t.mapping===Qa||t.mapping===Ir;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=tw()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=$M());let a=s?this._cubemapMaterial:this._equirectMaterial,r=this._lodMeshes[0];r.material=a;let o=a.uniforms;o.envMap.value=t;let l=this._cubeSize;cl(n,0,0,3*l,2*l),i.setRenderTarget(n),i.render(r,ru)}_applyPMREM(t){let n=this._renderer,i=n.autoClear;n.autoClear=!1;let s=this._lodMeshes.length;for(let a=1;a<s;a++)this._applyGGXFilter(t,a-1,a);n.autoClear=i}_applyGGXFilter(t,n,i){let s=this._renderer,a=this._pingPongRenderTarget,r=this._ggxMaterial,o=this._lodMeshes[i];o.material=r;let l=r.uniforms,c=i/(this._lodMeshes.length-1),h=n/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=0+c*1.25,p=d*u,{_lodMax:m}=this,S=this._sizeLods[i],g=3*S*(i>m-er?i-m+er:0),f=4*(this._cubeSize-S);l.envMap.value=t.texture,l.roughness.value=p,l.mipInt.value=m-n,cl(a,g,f,3*S,2*S),s.setRenderTarget(a),s.render(o,ru),l.envMap.value=a.texture,l.roughness.value=0,l.mipInt.value=m-i,cl(t,g,f,3*S,2*S),s.setRenderTarget(t),s.render(o,ru)}_blur(t,n,i,s,a){let r=this._pingPongRenderTarget;this._halfBlur(t,r,n,i,s,"latitudinal",a),this._halfBlur(r,t,i,i,s,"longitudinal",a)}_halfBlur(t,n,i,s,a,r,o){let l=this._renderer,c=this._blurMaterial;r!=="latitudinal"&&r!=="longitudinal"&&zt("blur direction must be either latitudinal or longitudinal!");let h=3,d=this._lodMeshes[s];d.material=c;let u=c.uniforms,p=this._sizeLods[i]-1,m=isFinite(a)?Math.PI/(2*p):2*Math.PI/(2*Pr-1),S=a/m,g=isFinite(a)?1+Math.floor(h*S):Pr;g>Pr&&It(`sigmaRadians, ${a}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${Pr}`);let f=[],v=0;for(let E=0;E<Pr;++E){let b=E/S,A=Math.exp(-b*b/2);f.push(A),E===0?v+=A:E<g&&(v+=2*A)}for(let E=0;E<f.length;E++)f[E]=f[E]/v;u.envMap.value=t.texture,u.samples.value=g,u.weights.value=f,u.latitudinal.value=r==="latitudinal",o&&(u.poleAxis.value=o);let{_lodMax:x}=this;u.dTheta.value=m,u.mipInt.value=x-i;let y=this._sizeLods[s],M=3*y*(s>x-er?s-x+er:0),w=4*(this._cubeSize-y);cl(n,M,w,3*y,2*y),l.setRenderTarget(n),l.render(d,ru)}};function pN(e){let t=[],n=[],i=[],s=e,a=e-er+1+KM.length;for(let r=0;r<a;r++){let o=Math.pow(2,s);t.push(o);let l=1/o;r>e-er?l=KM[r-e+er-1]:r===0&&(l=0),n.push(l);let c=1/(o-2),h=-c,d=1+c,u=[h,h,d,h,d,d,h,h,d,d,h,d],p=6,m=6,S=3,g=2,f=1,v=new Float32Array(S*m*p),x=new Float32Array(g*m*p),y=new Float32Array(f*m*p);for(let w=0;w<p;w++){let E=w%3*2/3-1,b=w>2?0:-1,A=[E,b,0,E+2/3,b,0,E+2/3,b+1,0,E,b,0,E+2/3,b+1,0,E,b+1,0];v.set(A,S*m*w),x.set(u,g*m*w);let R=[w,w,w,w,w,w];y.set(R,f*m*w)}let M=new $e;M.setAttribute("position",new hn(v,S)),M.setAttribute("uv",new hn(x,g)),M.setAttribute("faceIndex",new hn(y,f)),i.push(new we(M,null)),s>er&&s--}return{lodMeshes:i,sizeLods:t,sigmas:n}}function jM(e,t,n){let i=new pi(e,t,n);return i.texture.mapping=Kc,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function cl(e,t,n,i,s){e.viewport.set(t,n,i,s),e.scissor.set(t,n,i,s)}function mN(e,t,n){return new bn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:fN,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:hp(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:_s,depthTest:!1,depthWrite:!1})}function gN(e,t,n){let i=new Float32Array(Pr),s=new L(0,1,0);return new bn({name:"SphericalGaussianBlur",defines:{n:Pr,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:hp(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:_s,depthTest:!1,depthWrite:!1})}function $M(){return new bn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:hp(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:_s,depthTest:!1,depthWrite:!1})}function tw(){return new bn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:hp(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:_s,depthTest:!1,depthWrite:!1})}function hp(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}var up=class extends pi{constructor(t=1,n={}){super(t,t,n),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new Fc(s),this._setTextureOptions(n),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new mi(5,5,5),a=new bn({name:"CubemapFromEquirect",uniforms:Or(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Vn,blending:_s});a.uniforms.tEquirect.value=n;let r=new we(s,a),o=n.minFilter;return n.minFilter===ja&&(n.minFilter=on),new md(1,10,this).update(t,r),n.minFilter=o,r.geometry.dispose(),r.material.dispose(),this}clear(t,n=!0,i=!0,s=!0){let a=t.getRenderTarget();for(let r=0;r<6;r++)t.setRenderTarget(this,r),t.clear(n,i,s);t.setRenderTarget(a)}};function vN(e){let t=new WeakMap,n=new WeakMap,i=null;function s(u,p=!1){return u==null?null:p?r(u):a(u)}function a(u){if(u&&u.isTexture){let p=u.mapping;if(p===yd||p===xd)if(t.has(u)){let m=t.get(u).texture;return o(m,u.mapping)}else{let m=u.image;if(m&&m.height>0){let S=new up(m.height);return S.fromEquirectangularTexture(e,u),t.set(u,S),u.addEventListener("dispose",c),o(S.texture,u.mapping)}else return null}}return u}function r(u){if(u&&u.isTexture){let p=u.mapping,m=p===yd||p===xd,S=p===Qa||p===Ir;if(m||S){let g=n.get(u),f=g!==void 0?g.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==f)return i===null&&(i=new cp(e)),g=m?i.fromEquirectangular(u,g):i.fromCubemap(u,g),g.texture.pmremVersion=u.pmremVersion,n.set(u,g),g.texture;if(g!==void 0)return g.texture;{let v=u.image;return m&&v&&v.height>0||S&&v&&l(v)?(i===null&&(i=new cp(e)),g=m?i.fromEquirectangular(u):i.fromCubemap(u),g.texture.pmremVersion=u.pmremVersion,n.set(u,g),u.addEventListener("dispose",h),g.texture):null}}}return u}function o(u,p){return p===yd?u.mapping=Qa:p===xd&&(u.mapping=Ir),u}function l(u){let p=0,m=6;for(let S=0;S<m;S++)u[S]!==void 0&&p++;return p===m}function c(u){let p=u.target;p.removeEventListener("dispose",c);let m=t.get(p);m!==void 0&&(t.delete(p),m.dispose())}function h(u){let p=u.target;p.removeEventListener("dispose",h);let m=n.get(p);m!==void 0&&(n.delete(p),m.dispose())}function d(){t=new WeakMap,n=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:d}}function yN(e){let t={};function n(i){if(t[i]!==void 0)return t[i];let s=e.getExtension(i);return t[i]=s,s}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){let s=n(i);return s===null&&Rr("WebGLRenderer: "+i+" extension not supported."),s}}}function xN(e,t,n,i){let s={},a=new WeakMap;function r(d){let u=d.target;u.index!==null&&t.remove(u.index);for(let m in u.attributes)t.remove(u.attributes[m]);u.removeEventListener("dispose",r),delete s[u.id];let p=a.get(u);p&&(t.remove(p),a.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,n.memory.geometries--}function o(d,u){return s[u.id]===!0||(u.addEventListener("dispose",r),s[u.id]=!0,n.memory.geometries++),u}function l(d){let u=d.attributes;for(let p in u)t.update(u[p],e.ARRAY_BUFFER)}function c(d){let u=[],p=d.index,m=d.attributes.position,S=0;if(m===void 0)return;if(p!==null){let v=p.array;S=p.version;for(let x=0,y=v.length;x<y;x+=3){let M=v[x+0],w=v[x+1],E=v[x+2];u.push(M,w,w,E,E,M)}}else{let v=m.array;S=m.version;for(let x=0,y=v.length/3-1;x<y;x+=3){let M=x+0,w=x+1,E=x+2;u.push(M,w,w,E,E,M)}}let g=new(m.count>=65535?Pc:Oc)(u,1);g.version=S;let f=a.get(d);f&&t.remove(f),a.set(d,g)}function h(d){let u=a.get(d);if(u){let p=d.index;p!==null&&u.version<p.version&&c(d)}else c(d);return a.get(d)}return{get:o,update:l,getWireframeAttribute:h}}function _N(e,t,n){let i;function s(d){i=d}let a,r;function o(d){a=d.type,r=d.bytesPerElement}function l(d,u){e.drawElements(i,u,a,d*r),n.update(u,i,1)}function c(d,u,p){p!==0&&(e.drawElementsInstanced(i,u,a,d*r,p),n.update(u,i,p))}function h(d,u,p){if(p===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,a,d,0,p);let S=0;for(let g=0;g<p;g++)S+=u[g];n.update(S,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function bN(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(a,r,o){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=o*(a/3);break;case e.LINES:n.lines+=o*(a/2);break;case e.LINE_STRIP:n.lines+=o*(a-1);break;case e.LINE_LOOP:n.lines+=o*a;break;case e.POINTS:n.points+=o*a;break;default:zt("WebGLInfo: Unknown draw mode:",r);break}}function s(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:s,update:i}}function SN(e,t,n){let i=new WeakMap,s=new Ne;function a(r,o,l){let c=r.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0,u=i.get(o);if(u===void 0||u.count!==d){let R=function(){b.dispose(),i.delete(o),o.removeEventListener("dispose",R)};var p=R;u!==void 0&&u.texture.dispose();let m=o.morphAttributes.position!==void 0,S=o.morphAttributes.normal!==void 0,g=o.morphAttributes.color!==void 0,f=o.morphAttributes.position||[],v=o.morphAttributes.normal||[],x=o.morphAttributes.color||[],y=0;m===!0&&(y=1),S===!0&&(y=2),g===!0&&(y=3);let M=o.attributes.position.count*y,w=1;M>t.maxTextureSize&&(w=Math.ceil(M/t.maxTextureSize),M=t.maxTextureSize);let E=new Float32Array(M*w*4*d),b=new Dc(E,M,w,d);b.type=Ui,b.needsUpdate=!0;let A=y*4;for(let N=0;N<d;N++){let I=f[N],G=v[N],q=x[N],O=M*w*4*N;for(let H=0;H<I.count;H++){let D=H*A;m===!0&&(s.fromBufferAttribute(I,H),E[O+D+0]=s.x,E[O+D+1]=s.y,E[O+D+2]=s.z,E[O+D+3]=0),S===!0&&(s.fromBufferAttribute(G,H),E[O+D+4]=s.x,E[O+D+5]=s.y,E[O+D+6]=s.z,E[O+D+7]=0),g===!0&&(s.fromBufferAttribute(q,H),E[O+D+8]=s.x,E[O+D+9]=s.y,E[O+D+10]=s.z,E[O+D+11]=q.itemSize===4?s.w:1)}}u={count:d,texture:b,size:new Rt(M,w)},i.set(o,u),o.addEventListener("dispose",R)}if(r.isInstancedMesh===!0&&r.morphTexture!==null)l.getUniforms().setValue(e,"morphTexture",r.morphTexture,n);else{let m=0;for(let g=0;g<c.length;g++)m+=c[g];let S=o.morphTargetsRelative?1:1-m;l.getUniforms().setValue(e,"morphTargetBaseInfluence",S),l.getUniforms().setValue(e,"morphTargetInfluences",c)}l.getUniforms().setValue(e,"morphTargetsTexture",u.texture,n),l.getUniforms().setValue(e,"morphTargetsTextureSize",u.size)}return{update:a}}function MN(e,t,n,i,s){let a=new WeakMap;function r(c){let h=s.render.frame,d=c.geometry,u=t.get(c,d);if(a.get(u)!==h&&(t.update(u),a.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),a.get(c)!==h&&(n.update(c.instanceMatrix,e.ARRAY_BUFFER),c.instanceColor!==null&&n.update(c.instanceColor,e.ARRAY_BUFFER),a.set(c,h))),c.isSkinnedMesh){let p=c.skeleton;a.get(p)!==h&&(p.update(),a.set(p,h))}return u}function o(){a=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),n.remove(h.instanceMatrix),h.instanceColor!==null&&n.remove(h.instanceColor)}return{update:r,dispose:o}}var wN={[iv]:"LINEAR_TONE_MAPPING",[sv]:"REINHARD_TONE_MAPPING",[av]:"CINEON_TONE_MAPPING",[rv]:"ACES_FILMIC_TONE_MAPPING",[lv]:"AGX_TONE_MAPPING",[cv]:"NEUTRAL_TONE_MAPPING",[ov]:"CUSTOM_TONE_MAPPING"};function EN(e,t,n,i,s,a){let r=new pi(t,n,{type:e,depthBuffer:s,stencilBuffer:a,samples:i?4:0,depthTexture:s?new $s(t,n):void 0}),o=new pi(t,n,{type:bs,depthBuffer:!1,stencilBuffer:!1}),l=new $e;l.setAttribute("position",new Ge([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new Ge([0,2,0,0,2,0],2));let c=new nd({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),h=new we(l,c),d=new xs(-1,1,1,-1,0,1),u=null,p=null,m=!1,S,g=null,f=[],v=!1;this.setSize=function(x,y){r.setSize(x,y),o.setSize(x,y);for(let M=0;M<f.length;M++){let w=f[M];w.setSize&&w.setSize(x,y)}},this.setEffects=function(x){f=x,v=f.length>0&&f[0].isRenderPass===!0;let y=r.width,M=r.height;for(let w=0;w<f.length;w++){let E=f[w];E.setSize&&E.setSize(y,M)}},this.begin=function(x,y){if(m||x.toneMapping===Ji&&f.length===0)return!1;if(g=y,y!==null){let M=y.width,w=y.height;(r.width!==M||r.height!==w)&&this.setSize(M,w)}return v===!1&&x.setRenderTarget(r),S=x.toneMapping,x.toneMapping=Ji,!0},this.hasRenderPass=function(){return v},this.end=function(x,y){x.toneMapping=S,m=!0;let M=r,w=o;for(let E=0;E<f.length;E++){let b=f[E];if(b.enabled!==!1&&(b.render(x,w,M,y),b.needsSwap!==!1)){let A=M;M=w,w=A}}if(u!==x.outputColorSpace||p!==x.toneMapping){u=x.outputColorSpace,p=x.toneMapping,c.defines={},se.getTransfer(u)===ve&&(c.defines.SRGB_TRANSFER="");let E=wN[p];E&&(c.defines[E]=""),c.needsUpdate=!0}c.uniforms.tDiffuse.value=M.texture,x.setRenderTarget(g),x.render(h,d),g=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){r.depthTexture&&r.depthTexture.dispose(),r.dispose(),o.dispose(),l.dispose(),c.dispose()}}var _w=new Hn,Ov=new $s(1,1),bw=new Dc,Sw=new Wf,Mw=new Fc,ew=[],nw=[],iw=new Float32Array(16),sw=new Float32Array(9),aw=new Float32Array(4);function hl(e,t,n){let i=e[0];if(i<=0||i>0)return e;let s=t*n,a=ew[s];if(a===void 0&&(a=new Float32Array(s),ew[s]=a),t!==0){i.toArray(a,0);for(let r=1,o=0;r!==t;++r)o+=n,e[r].toArray(a,o)}return a}function fn(e,t){if(e.length!==t.length)return!1;for(let n=0,i=e.length;n<i;n++)if(e[n]!==t[n])return!1;return!0}function dn(e,t){for(let n=0,i=t.length;n<i;n++)e[n]=t[n]}function fp(e,t){let n=nw[t];n===void 0&&(n=new Int32Array(t),nw[t]=n);for(let i=0;i!==t;++i)n[i]=e.allocateTextureUnit();return n}function TN(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function AN(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(fn(n,t))return;e.uniform2fv(this.addr,t),dn(n,t)}}function CN(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(fn(n,t))return;e.uniform3fv(this.addr,t),dn(n,t)}}function RN(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(fn(n,t))return;e.uniform4fv(this.addr,t),dn(n,t)}}function NN(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(fn(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),dn(n,t)}else{if(fn(n,i))return;aw.set(i),e.uniformMatrix2fv(this.addr,!1,aw),dn(n,i)}}function LN(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(fn(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),dn(n,t)}else{if(fn(n,i))return;sw.set(i),e.uniformMatrix3fv(this.addr,!1,sw),dn(n,i)}}function DN(e,t){let n=this.cache,i=t.elements;if(i===void 0){if(fn(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),dn(n,t)}else{if(fn(n,i))return;iw.set(i),e.uniformMatrix4fv(this.addr,!1,iw),dn(n,i)}}function UN(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function IN(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(fn(n,t))return;e.uniform2iv(this.addr,t),dn(n,t)}}function ON(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(fn(n,t))return;e.uniform3iv(this.addr,t),dn(n,t)}}function PN(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(fn(n,t))return;e.uniform4iv(this.addr,t),dn(n,t)}}function BN(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function zN(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(fn(n,t))return;e.uniform2uiv(this.addr,t),dn(n,t)}}function FN(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(fn(n,t))return;e.uniform3uiv(this.addr,t),dn(n,t)}}function HN(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(fn(n,t))return;e.uniform4uiv(this.addr,t),dn(n,t)}}function VN(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s);let a;this.type===e.SAMPLER_2D_SHADOW?(Ov.compareFunction=n.isReversedDepthBuffer()?ap:sp,a=Ov):a=_w,n.setTexture2D(t||a,s)}function GN(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTexture3D(t||Sw,s)}function kN(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTextureCube(t||Mw,s)}function WN(e,t,n){let i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(e.uniform1i(this.addr,s),i[0]=s),n.setTexture2DArray(t||bw,s)}function XN(e){switch(e){case 5126:return TN;case 35664:return AN;case 35665:return CN;case 35666:return RN;case 35674:return NN;case 35675:return LN;case 35676:return DN;case 5124:case 35670:return UN;case 35667:case 35671:return IN;case 35668:case 35672:return ON;case 35669:case 35673:return PN;case 5125:return BN;case 36294:return zN;case 36295:return FN;case 36296:return HN;case 35678:case 36198:case 36298:case 36306:case 35682:return VN;case 35679:case 36299:case 36307:return GN;case 35680:case 36300:case 36308:case 36293:return kN;case 36289:case 36303:case 36311:case 36292:return WN}}function qN(e,t){e.uniform1fv(this.addr,t)}function YN(e,t){let n=hl(t,this.size,2);e.uniform2fv(this.addr,n)}function ZN(e,t){let n=hl(t,this.size,3);e.uniform3fv(this.addr,n)}function JN(e,t){let n=hl(t,this.size,4);e.uniform4fv(this.addr,n)}function KN(e,t){let n=hl(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function QN(e,t){let n=hl(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function jN(e,t){let n=hl(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function $N(e,t){e.uniform1iv(this.addr,t)}function tL(e,t){e.uniform2iv(this.addr,t)}function eL(e,t){e.uniform3iv(this.addr,t)}function nL(e,t){e.uniform4iv(this.addr,t)}function iL(e,t){e.uniform1uiv(this.addr,t)}function sL(e,t){e.uniform2uiv(this.addr,t)}function aL(e,t){e.uniform3uiv(this.addr,t)}function rL(e,t){e.uniform4uiv(this.addr,t)}function oL(e,t,n){let i=this.cache,s=t.length,a=fp(n,s);fn(i,a)||(e.uniform1iv(this.addr,a),dn(i,a));let r;this.type===e.SAMPLER_2D_SHADOW?r=Ov:r=_w;for(let o=0;o!==s;++o)n.setTexture2D(t[o]||r,a[o])}function lL(e,t,n){let i=this.cache,s=t.length,a=fp(n,s);fn(i,a)||(e.uniform1iv(this.addr,a),dn(i,a));for(let r=0;r!==s;++r)n.setTexture3D(t[r]||Sw,a[r])}function cL(e,t,n){let i=this.cache,s=t.length,a=fp(n,s);fn(i,a)||(e.uniform1iv(this.addr,a),dn(i,a));for(let r=0;r!==s;++r)n.setTextureCube(t[r]||Mw,a[r])}function uL(e,t,n){let i=this.cache,s=t.length,a=fp(n,s);fn(i,a)||(e.uniform1iv(this.addr,a),dn(i,a));for(let r=0;r!==s;++r)n.setTexture2DArray(t[r]||bw,a[r])}function hL(e){switch(e){case 5126:return qN;case 35664:return YN;case 35665:return ZN;case 35666:return JN;case 35674:return KN;case 35675:return QN;case 35676:return jN;case 5124:case 35670:return $N;case 35667:case 35671:return tL;case 35668:case 35672:return eL;case 35669:case 35673:return nL;case 5125:return iL;case 36294:return sL;case 36295:return aL;case 36296:return rL;case 35678:case 36198:case 36298:case 36306:case 35682:return oL;case 35679:case 36299:case 36307:return lL;case 35680:case 36300:case 36308:case 36293:return cL;case 36289:case 36303:case 36311:case 36292:return uL}}var Pv=class{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.setValue=XN(n.type)}},Bv=class{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=hL(n.type)}},zv=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,n,i){let s=this.seq;for(let a=0,r=s.length;a!==r;++a){let o=s[a];o.setValue(t,n[o.id],i)}}},Uv=/(\w+)(\])?(\[|\.)?/g;function rw(e,t){e.seq.push(t),e.map[t.id]=t}function fL(e,t,n){let i=e.name,s=i.length;for(Uv.lastIndex=0;;){let a=Uv.exec(i),r=Uv.lastIndex,o=a[1],l=a[2]==="]",c=a[3];if(l&&(o=o|0),c===void 0||c==="["&&r+2===s){rw(n,c===void 0?new Pv(o,e,t):new Bv(o,e,t));break}else{let d=n.map[o];d===void 0&&(d=new zv(o),rw(n,d)),n=d}}}var ul=class{constructor(t,n){this.seq=[],this.map={};let i=t.getProgramParameter(n,t.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){let o=t.getActiveUniform(n,r),l=t.getUniformLocation(n,o.name);fL(o,l,this)}let s=[],a=[];for(let r of this.seq)r.type===t.SAMPLER_2D_SHADOW||r.type===t.SAMPLER_CUBE_SHADOW||r.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(r):a.push(r);s.length>0&&(this.seq=s.concat(a))}setValue(t,n,i,s){let a=this.map[n];a!==void 0&&a.setValue(t,i,s)}setOptional(t,n,i){let s=n[i];s!==void 0&&this.setValue(t,i,s)}static upload(t,n,i,s){for(let a=0,r=n.length;a!==r;++a){let o=n[a],l=i[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,n){let i=[];for(let s=0,a=t.length;s!==a;++s){let r=t[s];r.id in n&&i.push(r)}return i}};function ow(e,t,n){let i=e.createShader(t);return e.shaderSource(i,n),e.compileShader(i),i}var dL=37297,pL=0;function mL(e,t){let n=e.split(`
`),i=[],s=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let r=s;r<a;r++){let o=r+1;i.push(`${o===t?">":" "} ${o}: ${n[r]}`)}return i.join(`
`)}var lw=new Vt;function gL(e){se._getMatrix(lw,se.workingColorSpace,e);let t=`mat3( ${lw.elements.map(n=>n.toFixed(4))} )`;switch(se.getTransfer(e)){case Nc:return[t,"LinearTransferOETF"];case ve:return[t,"sRGBTransferOETF"];default:return It("WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function cw(e,t,n){let i=e.getShaderParameter(t,e.COMPILE_STATUS),a=(e.getShaderInfoLog(t)||"").trim();if(i&&a==="")return"";let r=/ERROR: 0:(\d+)/.exec(a);if(r){let o=parseInt(r[1]);return n.toUpperCase()+`

`+a+`

`+mL(e.getShaderSource(t),o)}else return a}function vL(e,t){let n=gL(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}var yL={[iv]:"Linear",[sv]:"Reinhard",[av]:"Cineon",[rv]:"ACESFilmic",[lv]:"AgX",[cv]:"Neutral",[ov]:"Custom"};function xL(e,t){let n=yL[t];return n===void 0?(It("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var lp=new L;function _L(){se.getLuminanceCoefficients(lp);let e=lp.x.toFixed(4),t=lp.y.toFixed(4),n=lp.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${t}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function bL(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(lu).join(`
`)}function SL(e){let t=[];for(let n in e){let i=e[n];i!==!1&&t.push("#define "+n+" "+i)}return t.join(`
`)}function ML(e,t){let n={},i=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let a=e.getActiveAttrib(t,s),r=a.name,o=1;a.type===e.FLOAT_MAT2&&(o=2),a.type===e.FLOAT_MAT3&&(o=3),a.type===e.FLOAT_MAT4&&(o=4),n[r]={type:a.type,location:e.getAttribLocation(t,r),locationSize:o}}return n}function lu(e){return e!==""}function uw(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function hw(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var wL=/^[ \t]*#include +<([\w\d./]+)>/gm;function Fv(e){return e.replace(wL,TL)}var EL=new Map;function TL(e,t){let n=Jt[t];if(n===void 0){let i=EL.get(t);if(i!==void 0)n=Jt[i],It('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Fv(n)}var AL=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function fw(e){return e.replace(AL,CL)}function CL(e,t,n,i){let s="";for(let a=parseInt(t);a<parseInt(n);a++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return s}function dw(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?t+=`
#define HIGH_PRECISION`:e.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var RL={[Zc]:"SHADOWMAP_TYPE_PCF",[rl]:"SHADOWMAP_TYPE_VSM"};function NL(e){return RL[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var LL={[Qa]:"ENVMAP_TYPE_CUBE",[Ir]:"ENVMAP_TYPE_CUBE",[Kc]:"ENVMAP_TYPE_CUBE_UV"};function DL(e){return e.envMap===!1?"ENVMAP_TYPE_CUBE":LL[e.envMapMode]||"ENVMAP_TYPE_CUBE"}var UL={[Ir]:"ENVMAP_MODE_REFRACTION"};function IL(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":UL[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}var OL={[nv]:"ENVMAP_BLENDING_MULTIPLY",[DM]:"ENVMAP_BLENDING_MIX",[UM]:"ENVMAP_BLENDING_ADD"};function PL(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":OL[e.combine]||"ENVMAP_BLENDING_NONE"}function BL(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function zL(e,t,n,i){let s=e.getContext(),a=n.defines,r=n.vertexShader,o=n.fragmentShader,l=NL(n),c=DL(n),h=IL(n),d=PL(n),u=BL(n),p=bL(n),m=SL(a),S=s.createProgram(),g,f,v=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(g=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,m].filter(lu).join(`
`),g.length>0&&(g+=`
`),f=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,m].filter(lu).join(`
`),f.length>0&&(f+=`
`)):(g=[dw(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,m,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+h:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexNormals?"#define HAS_NORMAL":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(lu).join(`
`),f=[dw(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,m,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+h:"",n.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor?"#define USE_COLOR":"",n.vertexAlphas||n.batchingColor?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Ji?"#define TONE_MAPPING":"",n.toneMapping!==Ji?Jt.tonemapping_pars_fragment:"",n.toneMapping!==Ji?xL("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",Jt.colorspace_pars_fragment,vL("linearToOutputTexel",n.outputColorSpace),_L(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(lu).join(`
`)),r=Fv(r),r=uw(r,n),r=hw(r,n),o=Fv(o),o=uw(o,n),o=hw(o,n),r=fw(r),o=fw(o),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,f=["#define varying in",n.glslVersion===vv?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===vv?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let x=v+g+r,y=v+f+o,M=ow(s,s.VERTEX_SHADER,x),w=ow(s,s.FRAGMENT_SHADER,y);s.attachShader(S,M),s.attachShader(S,w),n.index0AttributeName!==void 0?s.bindAttribLocation(S,0,n.index0AttributeName):n.hasPositionAttribute===!0&&s.bindAttribLocation(S,0,"position"),s.linkProgram(S);function E(N){if(e.debug.checkShaderErrors){let I=s.getProgramInfoLog(S)||"",G=s.getShaderInfoLog(M)||"",q=s.getShaderInfoLog(w)||"",O=I.trim(),H=G.trim(),D=q.trim(),X=!0,Q=!0;if(s.getProgramParameter(S,s.LINK_STATUS)===!1)if(X=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(s,S,M,w);else{let it=cw(s,M,"vertex"),rt=cw(s,w,"fragment");zt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(S,s.VALIDATE_STATUS)+`

Material Name: `+N.name+`
Material Type: `+N.type+`

Program Info Log: `+O+`
`+it+`
`+rt)}else O!==""?It("WebGLProgram: Program Info Log:",O):(H===""||D==="")&&(Q=!1);Q&&(N.diagnostics={runnable:X,programLog:O,vertexShader:{log:H,prefix:g},fragmentShader:{log:D,prefix:f}})}s.deleteShader(M),s.deleteShader(w),b=new ul(s,S),A=ML(s,S)}let b;this.getUniforms=function(){return b===void 0&&E(this),b};let A;this.getAttributes=function(){return A===void 0&&E(this),A};let R=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(S,dL)),R},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(S),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=pL++,this.cacheKey=t,this.usedTimes=1,this.program=S,this.vertexShader=M,this.fragmentShader=w,this}var FL=0,Hv=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,n,i){let s=this._getShaderCacheForMaterial(t);return s.has(n)===!1&&(s.add(n),n.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(t){let n=this.materialCache.get(t);for(let i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let n=this.materialCache,i=n.get(t);return i===void 0&&(i=new Set,n.set(t,i)),i}_getShaderStage(t){let n=this.shaderCache,i=n.get(t);return i===void 0&&(i=new Vv(t),n.set(t,i)),i}},Vv=class{constructor(t){this.id=FL++,this.code=t,this.usedTimes=0}};function HL(e){return e===tr||e===nu||e===iu}function VL(e,t,n,i,s,a){let r=new Uc,o=new Hv,l=new Set,c=[],h=new Map,d=i.logarithmicDepthBuffer,u=i.precision,p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(b){return l.add(b),b===0?"uv":`uv${b}`}function S(b,A,R,N,I,G){let q=N.fog,O=I.geometry,H=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?N.environment:null,D=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap,X=t.get(b.envMap||H,D),Q=X&&X.mapping===Kc?X.image.height:null,it=p[b.type];b.precision!==null&&(u=i.getMaxPrecision(b.precision),u!==b.precision&&It("WebGLProgram.getParameters:",b.precision,"not supported, using",u,"instead."));let rt=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,st=rt!==void 0?rt.length:0,Pt=0;O.morphAttributes.position!==void 0&&(Pt=1),O.morphAttributes.normal!==void 0&&(Pt=2),O.morphAttributes.color!==void 0&&(Pt=3);let Gt,vt,W,et;if(it){let _t=Ms[it];Gt=_t.vertexShader,vt=_t.fragmentShader}else{Gt=b.vertexShader,vt=b.fragmentShader;let _t=o.getVertexShaderStage(b),Xe=o.getFragmentShaderStage(b);o.update(b,_t,Xe),W=_t.id,et=Xe.id}let tt=e.getRenderTarget(),Mt=e.state.buffers.depth.getReversed(),Dt=I.isInstancedMesh===!0,wt=I.isBatchedMesh===!0,le=!!b.map,Ht=!!b.matcap,ae=!!X,$t=!!b.aoMap,Zt=!!b.lightMap,Le=!!b.bumpMap&&b.wireframe===!1,De=!!b.normalMap,Tt=!!b.displacementMap,re=!!b.emissiveMap,ce=!!b.metalnessMap,ge=!!b.roughnessMap,B=b.anisotropy>0,ln=b.clearcoat>0,ue=b.dispersion>0,C=b.iridescence>0,_=b.sheen>0,U=b.transmission>0,F=B&&!!b.anisotropyMap,Z=ln&&!!b.clearcoatMap,at=ln&&!!b.clearcoatNormalMap,ot=ln&&!!b.clearcoatRoughnessMap,J=C&&!!b.iridescenceMap,K=C&&!!b.iridescenceThicknessMap,lt=_&&!!b.sheenColorMap,At=_&&!!b.sheenRoughnessMap,ft=!!b.specularMap,ut=!!b.specularColorMap,Ut=!!b.specularIntensityMap,Bt=U&&!!b.transmissionMap,Wt=U&&!!b.thicknessMap,P=!!b.gradientMap,ct=!!b.alphaMap,j=b.alphaTest>0,ht=!!b.alphaHash,gt=!!b.extensions,nt=Ji;b.toneMapped&&(tt===null||tt.isXRRenderTarget===!0)&&(nt=e.toneMapping);let Et={shaderID:it,shaderType:b.type,shaderName:b.name,vertexShader:Gt,fragmentShader:vt,defines:b.defines,customVertexShaderID:W,customFragmentShaderID:et,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:u,batching:wt,batchingColor:wt&&I._colorsTexture!==null,instancing:Dt,instancingColor:Dt&&I.instanceColor!==null,instancingMorph:Dt&&I.morphTexture!==null,outputColorSpace:tt===null?e.outputColorSpace:tt.isXRRenderTarget===!0?tt.texture.colorSpace:se.workingColorSpace,alphaToCoverage:!!b.alphaToCoverage,map:le,matcap:Ht,envMap:ae,envMapMode:ae&&X.mapping,envMapCubeUVHeight:Q,aoMap:$t,lightMap:Zt,bumpMap:Le,normalMap:De,displacementMap:Tt,emissiveMap:re,normalMapObjectSpace:De&&b.normalMapType===PM,normalMapTangentSpace:De&&b.normalMapType===su,packedNormalMap:De&&b.normalMapType===su&&HL(b.normalMap.format),metalnessMap:ce,roughnessMap:ge,anisotropy:B,anisotropyMap:F,clearcoat:ln,clearcoatMap:Z,clearcoatNormalMap:at,clearcoatRoughnessMap:ot,dispersion:ue,iridescence:C,iridescenceMap:J,iridescenceThicknessMap:K,sheen:_,sheenColorMap:lt,sheenRoughnessMap:At,specularMap:ft,specularColorMap:ut,specularIntensityMap:Ut,transmission:U,transmissionMap:Bt,thicknessMap:Wt,gradientMap:P,opaque:b.transparent===!1&&b.blending===Nr&&b.alphaToCoverage===!1,alphaMap:ct,alphaTest:j,alphaHash:ht,combine:b.combine,mapUv:le&&m(b.map.channel),aoMapUv:$t&&m(b.aoMap.channel),lightMapUv:Zt&&m(b.lightMap.channel),bumpMapUv:Le&&m(b.bumpMap.channel),normalMapUv:De&&m(b.normalMap.channel),displacementMapUv:Tt&&m(b.displacementMap.channel),emissiveMapUv:re&&m(b.emissiveMap.channel),metalnessMapUv:ce&&m(b.metalnessMap.channel),roughnessMapUv:ge&&m(b.roughnessMap.channel),anisotropyMapUv:F&&m(b.anisotropyMap.channel),clearcoatMapUv:Z&&m(b.clearcoatMap.channel),clearcoatNormalMapUv:at&&m(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ot&&m(b.clearcoatRoughnessMap.channel),iridescenceMapUv:J&&m(b.iridescenceMap.channel),iridescenceThicknessMapUv:K&&m(b.iridescenceThicknessMap.channel),sheenColorMapUv:lt&&m(b.sheenColorMap.channel),sheenRoughnessMapUv:At&&m(b.sheenRoughnessMap.channel),specularMapUv:ft&&m(b.specularMap.channel),specularColorMapUv:ut&&m(b.specularColorMap.channel),specularIntensityMapUv:Ut&&m(b.specularIntensityMap.channel),transmissionMapUv:Bt&&m(b.transmissionMap.channel),thicknessMapUv:Wt&&m(b.thicknessMap.channel),alphaMapUv:ct&&m(b.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(De||B),vertexNormals:!!O.attributes.normal,vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:I.isPoints===!0&&!!O.attributes.uv&&(le||ct),fog:!!q,useFog:b.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:b.wireframe===!1&&(b.flatShading===!0||O.attributes.normal===void 0&&De===!1&&(b.isMeshLambertMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isMeshPhysicalMaterial)),sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:Mt,skinning:I.isSkinnedMesh===!0,hasPositionAttribute:O.attributes.position!==void 0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:st,morphTextureStride:Pt,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numLightProbeGrids:G.length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:b.dithering,shadowMapEnabled:e.shadowMap.enabled&&R.length>0,shadowMapType:e.shadowMap.type,toneMapping:nt,decodeVideoTexture:le&&b.map.isVideoTexture===!0&&se.getTransfer(b.map.colorSpace)===ve,decodeVideoTextureEmissive:re&&b.emissiveMap.isVideoTexture===!0&&se.getTransfer(b.emissiveMap.colorSpace)===ve,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Di,flipSided:b.side===Vn,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:gt&&b.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(gt&&b.extensions.multiDraw===!0||wt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return Et.vertexUv1s=l.has(1),Et.vertexUv2s=l.has(2),Et.vertexUv3s=l.has(3),l.clear(),Et}function g(b){let A=[];if(b.shaderID?A.push(b.shaderID):(A.push(b.customVertexShaderID),A.push(b.customFragmentShaderID)),b.defines!==void 0)for(let R in b.defines)A.push(R),A.push(b.defines[R]);return b.isRawShaderMaterial===!1&&(f(A,b),v(A,b),A.push(e.outputColorSpace)),A.push(b.customProgramCacheKey),A.join()}function f(b,A){b.push(A.precision),b.push(A.outputColorSpace),b.push(A.envMapMode),b.push(A.envMapCubeUVHeight),b.push(A.mapUv),b.push(A.alphaMapUv),b.push(A.lightMapUv),b.push(A.aoMapUv),b.push(A.bumpMapUv),b.push(A.normalMapUv),b.push(A.displacementMapUv),b.push(A.emissiveMapUv),b.push(A.metalnessMapUv),b.push(A.roughnessMapUv),b.push(A.anisotropyMapUv),b.push(A.clearcoatMapUv),b.push(A.clearcoatNormalMapUv),b.push(A.clearcoatRoughnessMapUv),b.push(A.iridescenceMapUv),b.push(A.iridescenceThicknessMapUv),b.push(A.sheenColorMapUv),b.push(A.sheenRoughnessMapUv),b.push(A.specularMapUv),b.push(A.specularColorMapUv),b.push(A.specularIntensityMapUv),b.push(A.transmissionMapUv),b.push(A.thicknessMapUv),b.push(A.combine),b.push(A.fogExp2),b.push(A.sizeAttenuation),b.push(A.morphTargetsCount),b.push(A.morphAttributeCount),b.push(A.numDirLights),b.push(A.numPointLights),b.push(A.numSpotLights),b.push(A.numSpotLightMaps),b.push(A.numHemiLights),b.push(A.numRectAreaLights),b.push(A.numDirLightShadows),b.push(A.numPointLightShadows),b.push(A.numSpotLightShadows),b.push(A.numSpotLightShadowsWithMaps),b.push(A.numLightProbes),b.push(A.shadowMapType),b.push(A.toneMapping),b.push(A.numClippingPlanes),b.push(A.numClipIntersection),b.push(A.depthPacking)}function v(b,A){r.disableAll(),A.instancing&&r.enable(0),A.instancingColor&&r.enable(1),A.instancingMorph&&r.enable(2),A.matcap&&r.enable(3),A.envMap&&r.enable(4),A.normalMapObjectSpace&&r.enable(5),A.normalMapTangentSpace&&r.enable(6),A.clearcoat&&r.enable(7),A.iridescence&&r.enable(8),A.alphaTest&&r.enable(9),A.vertexColors&&r.enable(10),A.vertexAlphas&&r.enable(11),A.vertexUv1s&&r.enable(12),A.vertexUv2s&&r.enable(13),A.vertexUv3s&&r.enable(14),A.vertexTangents&&r.enable(15),A.anisotropy&&r.enable(16),A.alphaHash&&r.enable(17),A.batching&&r.enable(18),A.dispersion&&r.enable(19),A.batchingColor&&r.enable(20),A.gradientMap&&r.enable(21),A.packedNormalMap&&r.enable(22),A.vertexNormals&&r.enable(23),b.push(r.mask),r.disableAll(),A.fog&&r.enable(0),A.useFog&&r.enable(1),A.flatShading&&r.enable(2),A.logarithmicDepthBuffer&&r.enable(3),A.reversedDepthBuffer&&r.enable(4),A.skinning&&r.enable(5),A.morphTargets&&r.enable(6),A.morphNormals&&r.enable(7),A.morphColors&&r.enable(8),A.premultipliedAlpha&&r.enable(9),A.shadowMapEnabled&&r.enable(10),A.doubleSided&&r.enable(11),A.flipSided&&r.enable(12),A.useDepthPacking&&r.enable(13),A.dithering&&r.enable(14),A.transmission&&r.enable(15),A.sheen&&r.enable(16),A.opaque&&r.enable(17),A.pointsUvs&&r.enable(18),A.decodeVideoTexture&&r.enable(19),A.decodeVideoTextureEmissive&&r.enable(20),A.alphaToCoverage&&r.enable(21),A.numLightProbeGrids>0&&r.enable(22),A.hasPositionAttribute&&r.enable(23),b.push(r.mask)}function x(b){let A=p[b.type],R;if(A){let N=Ms[A];R=ZM.clone(N.uniforms)}else R=b.uniforms;return R}function y(b,A){let R=h.get(A);return R!==void 0?++R.usedTimes:(R=new zL(e,A,b,s),c.push(R),h.set(A,R)),R}function M(b){if(--b.usedTimes===0){let A=c.indexOf(b);c[A]=c[c.length-1],c.pop(),h.delete(b.cacheKey),b.destroy()}}function w(b){o.remove(b)}function E(){o.dispose()}return{getParameters:S,getProgramCacheKey:g,getUniforms:x,acquireProgram:y,releaseProgram:M,releaseShaderCache:w,programs:c,dispose:E}}function GL(){let e=new WeakMap;function t(r){return e.has(r)}function n(r){let o=e.get(r);return o===void 0&&(o={},e.set(r,o)),o}function i(r){e.delete(r)}function s(r,o,l){e.get(r)[o]=l}function a(){e=new WeakMap}return{has:t,get:n,remove:i,update:s,dispose:a}}function kL(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.material.id!==t.material.id?e.material.id-t.material.id:e.materialVariant!==t.materialVariant?e.materialVariant-t.materialVariant:e.z!==t.z?e.z-t.z:e.id-t.id}function pw(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.z!==t.z?t.z-e.z:e.id-t.id}function mw(){let e=[],t=0,n=[],i=[],s=[];function a(){t=0,n.length=0,i.length=0,s.length=0}function r(u){let p=0;return u.isInstancedMesh&&(p+=2),u.isSkinnedMesh&&(p+=1),p}function o(u,p,m,S,g,f){let v=e[t];return v===void 0?(v={id:u.id,object:u,geometry:p,material:m,materialVariant:r(u),groupOrder:S,renderOrder:u.renderOrder,z:g,group:f},e[t]=v):(v.id=u.id,v.object=u,v.geometry=p,v.material=m,v.materialVariant=r(u),v.groupOrder=S,v.renderOrder=u.renderOrder,v.z=g,v.group=f),t++,v}function l(u,p,m,S,g,f){let v=o(u,p,m,S,g,f);m.transmission>0?i.push(v):m.transparent===!0?s.push(v):n.push(v)}function c(u,p,m,S,g,f){let v=o(u,p,m,S,g,f);m.transmission>0?i.unshift(v):m.transparent===!0?s.unshift(v):n.unshift(v)}function h(u,p,m){n.length>1&&n.sort(u||kL),i.length>1&&i.sort(p||pw),s.length>1&&s.sort(p||pw),m&&(n.reverse(),i.reverse(),s.reverse())}function d(){for(let u=t,p=e.length;u<p;u++){let m=e[u];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:n,transmissive:i,transparent:s,init:a,push:l,unshift:c,finish:d,sort:h}}function WL(){let e=new WeakMap;function t(i,s){let a=e.get(i),r;return a===void 0?(r=new mw,e.set(i,[r])):s>=a.length?(r=new mw,a.push(r)):r=a[s],r}function n(){e=new WeakMap}return{get:t,dispose:n}}function XL(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={direction:new L,color:new Ot};break;case"SpotLight":n={position:new L,direction:new L,color:new Ot,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new L,color:new Ot,distance:0,decay:0};break;case"HemisphereLight":n={direction:new L,skyColor:new Ot,groundColor:new Ot};break;case"RectAreaLight":n={color:new Ot,position:new L,halfWidth:new L,halfHeight:new L};break}return e[t.id]=n,n}}}function qL(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Rt};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Rt};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Rt,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=n,n}}}var YL=0;function ZL(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function JL(e){let t=new XL,n=qL(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new L);let s=new L,a=new fe,r=new fe;function o(c){let h=0,d=0,u=0;for(let A=0;A<9;A++)i.probe[A].set(0,0,0);let p=0,m=0,S=0,g=0,f=0,v=0,x=0,y=0,M=0,w=0,E=0;c.sort(ZL);for(let A=0,R=c.length;A<R;A++){let N=c[A],I=N.color,G=N.intensity,q=N.distance,O=null;if(N.shadow&&N.shadow.map&&(N.shadow.map.texture.format===tr?O=N.shadow.map.texture:O=N.shadow.map.depthTexture||N.shadow.map.texture),N.isAmbientLight)h+=I.r*G,d+=I.g*G,u+=I.b*G;else if(N.isLightProbe){for(let H=0;H<9;H++)i.probe[H].addScaledVector(N.sh.coefficients[H],G);E++}else if(N.isDirectionalLight){let H=t.get(N);if(H.color.copy(N.color).multiplyScalar(N.intensity),N.castShadow){let D=N.shadow,X=n.get(N);X.shadowIntensity=D.intensity,X.shadowBias=D.bias,X.shadowNormalBias=D.normalBias,X.shadowRadius=D.radius,X.shadowMapSize=D.mapSize,i.directionalShadow[p]=X,i.directionalShadowMap[p]=O,i.directionalShadowMatrix[p]=N.shadow.matrix,v++}i.directional[p]=H,p++}else if(N.isSpotLight){let H=t.get(N);H.position.setFromMatrixPosition(N.matrixWorld),H.color.copy(I).multiplyScalar(G),H.distance=q,H.coneCos=Math.cos(N.angle),H.penumbraCos=Math.cos(N.angle*(1-N.penumbra)),H.decay=N.decay,i.spot[S]=H;let D=N.shadow;if(N.map&&(i.spotLightMap[M]=N.map,M++,D.updateMatrices(N),N.castShadow&&w++),i.spotLightMatrix[S]=D.matrix,N.castShadow){let X=n.get(N);X.shadowIntensity=D.intensity,X.shadowBias=D.bias,X.shadowNormalBias=D.normalBias,X.shadowRadius=D.radius,X.shadowMapSize=D.mapSize,i.spotShadow[S]=X,i.spotShadowMap[S]=O,y++}S++}else if(N.isRectAreaLight){let H=t.get(N);H.color.copy(I).multiplyScalar(G),H.halfWidth.set(N.width*.5,0,0),H.halfHeight.set(0,N.height*.5,0),i.rectArea[g]=H,g++}else if(N.isPointLight){let H=t.get(N);if(H.color.copy(N.color).multiplyScalar(N.intensity),H.distance=N.distance,H.decay=N.decay,N.castShadow){let D=N.shadow,X=n.get(N);X.shadowIntensity=D.intensity,X.shadowBias=D.bias,X.shadowNormalBias=D.normalBias,X.shadowRadius=D.radius,X.shadowMapSize=D.mapSize,X.shadowCameraNear=D.camera.near,X.shadowCameraFar=D.camera.far,i.pointShadow[m]=X,i.pointShadowMap[m]=O,i.pointShadowMatrix[m]=N.shadow.matrix,x++}i.point[m]=H,m++}else if(N.isHemisphereLight){let H=t.get(N);H.skyColor.copy(N.color).multiplyScalar(G),H.groundColor.copy(N.groundColor).multiplyScalar(G),i.hemi[f]=H,f++}}g>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=dt.LTC_FLOAT_1,i.rectAreaLTC2=dt.LTC_FLOAT_2):(i.rectAreaLTC1=dt.LTC_HALF_1,i.rectAreaLTC2=dt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=u;let b=i.hash;(b.directionalLength!==p||b.pointLength!==m||b.spotLength!==S||b.rectAreaLength!==g||b.hemiLength!==f||b.numDirectionalShadows!==v||b.numPointShadows!==x||b.numSpotShadows!==y||b.numSpotMaps!==M||b.numLightProbes!==E)&&(i.directional.length=p,i.spot.length=S,i.rectArea.length=g,i.point.length=m,i.hemi.length=f,i.directionalShadow.length=v,i.directionalShadowMap.length=v,i.pointShadow.length=x,i.pointShadowMap.length=x,i.spotShadow.length=y,i.spotShadowMap.length=y,i.directionalShadowMatrix.length=v,i.pointShadowMatrix.length=x,i.spotLightMatrix.length=y+M-w,i.spotLightMap.length=M,i.numSpotLightShadowsWithMaps=w,i.numLightProbes=E,b.directionalLength=p,b.pointLength=m,b.spotLength=S,b.rectAreaLength=g,b.hemiLength=f,b.numDirectionalShadows=v,b.numPointShadows=x,b.numSpotShadows=y,b.numSpotMaps=M,b.numLightProbes=E,i.version=YL++)}function l(c,h){let d=0,u=0,p=0,m=0,S=0,g=h.matrixWorldInverse;for(let f=0,v=c.length;f<v;f++){let x=c[f];if(x.isDirectionalLight){let y=i.directional[d];y.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(g),d++}else if(x.isSpotLight){let y=i.spot[p];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(g),y.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(g),p++}else if(x.isRectAreaLight){let y=i.rectArea[m];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(g),r.identity(),a.copy(x.matrixWorld),a.premultiply(g),r.extractRotation(a),y.halfWidth.set(x.width*.5,0,0),y.halfHeight.set(0,x.height*.5,0),y.halfWidth.applyMatrix4(r),y.halfHeight.applyMatrix4(r),m++}else if(x.isPointLight){let y=i.point[u];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(g),u++}else if(x.isHemisphereLight){let y=i.hemi[S];y.direction.setFromMatrixPosition(x.matrixWorld),y.direction.transformDirection(g),S++}}}return{setup:o,setupView:l,state:i}}function gw(e){let t=new JL(e),n=[],i=[],s=[];function a(u){d.camera=u,n.length=0,i.length=0,s.length=0}function r(u){n.push(u)}function o(u){i.push(u)}function l(u){s.push(u)}function c(){t.setup(n)}function h(u){t.setupView(n,u)}let d={lightsArray:n,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:d,setupLights:c,setupLightsView:h,pushLight:r,pushShadow:o,pushLightProbeGrid:l}}function KL(e){let t=new WeakMap;function n(s,a=0){let r=t.get(s),o;return r===void 0?(o=new gw(e),t.set(s,[o])):a>=r.length?(o=new gw(e),r.push(o)):o=r[a],o}function i(){t=new WeakMap}return{get:n,dispose:i}}var QL=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,jL=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,$L=[new L(1,0,0),new L(-1,0,0),new L(0,1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1)],tD=[new L(0,-1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1),new L(0,-1,0),new L(0,-1,0)],vw=new fe,ou=new L,Iv=new L;function eD(e,t,n){let i=new $o,s=new Rt,a=new Rt,r=new Ne,o=new id,l=new sd,c={},h=n.maxTextureSize,d={[js]:Vn,[Vn]:js,[Di]:Di},u=new bn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Rt},radius:{value:4}},vertexShader:QL,fragmentShader:jL}),p=u.clone();p.defines.HORIZONTAL_PASS=1;let m=new $e;m.setAttribute("position",new hn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let S=new we(m,u),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Zc;let f=this.type;this.render=function(w,E,b){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||w.length===0)return;this.type===dM&&(It("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=Zc);let A=e.getRenderTarget(),R=e.getActiveCubeFace(),N=e.getActiveMipmapLevel(),I=e.state;I.setBlending(_s),I.buffers.depth.getReversed()===!0?I.buffers.color.setClear(0,0,0,0):I.buffers.color.setClear(1,1,1,1),I.buffers.depth.setTest(!0),I.setScissorTest(!1);let G=f!==this.type;G&&E.traverse(function(q){q.material&&(Array.isArray(q.material)?q.material.forEach(O=>O.needsUpdate=!0):q.material.needsUpdate=!0)});for(let q=0,O=w.length;q<O;q++){let H=w[q],D=H.shadow;if(D===void 0){It("WebGLShadowMap:",H,"has no shadow.");continue}if(D.autoUpdate===!1&&D.needsUpdate===!1)continue;s.copy(D.mapSize);let X=D.getFrameExtents();s.multiply(X),a.copy(D.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(a.x=Math.floor(h/X.x),s.x=a.x*X.x,D.mapSize.x=a.x),s.y>h&&(a.y=Math.floor(h/X.y),s.y=a.y*X.y,D.mapSize.y=a.y));let Q=e.state.buffers.depth.getReversed();if(D.camera._reversedDepth=Q,D.map===null||G===!0){if(D.map!==null&&(D.map.depthTexture!==null&&(D.map.depthTexture.dispose(),D.map.depthTexture=null),D.map.dispose()),this.type===rl){if(H.isPointLight){It("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}D.map=new pi(s.x,s.y,{format:tr,type:bs,minFilter:on,magFilter:on,generateMipmaps:!1}),D.map.texture.name=H.name+".shadowMap",D.map.depthTexture=new $s(s.x,s.y,Ui),D.map.depthTexture.name=H.name+".shadowMapDepth",D.map.depthTexture.format=ps,D.map.depthTexture.compareFunction=null,D.map.depthTexture.minFilter=_n,D.map.depthTexture.magFilter=_n}else H.isPointLight?(D.map=new up(s.x),D.map.depthTexture=new Zf(s.x,Ki)):(D.map=new pi(s.x,s.y),D.map.depthTexture=new $s(s.x,s.y,Ki)),D.map.depthTexture.name=H.name+".shadowMap",D.map.depthTexture.format=ps,this.type===Zc?(D.map.depthTexture.compareFunction=Q?ap:sp,D.map.depthTexture.minFilter=on,D.map.depthTexture.magFilter=on):(D.map.depthTexture.compareFunction=null,D.map.depthTexture.minFilter=_n,D.map.depthTexture.magFilter=_n);D.camera.updateProjectionMatrix()}let it=D.map.isWebGLCubeRenderTarget?6:1;for(let rt=0;rt<it;rt++){if(D.map.isWebGLCubeRenderTarget)e.setRenderTarget(D.map,rt),e.clear();else{rt===0&&(e.setRenderTarget(D.map),e.clear());let st=D.getViewport(rt);r.set(a.x*st.x,a.y*st.y,a.x*st.z,a.y*st.w),I.viewport(r)}if(H.isPointLight){let st=D.camera,Pt=D.matrix,Gt=H.distance||st.far;Gt!==st.far&&(st.far=Gt,st.updateProjectionMatrix()),ou.setFromMatrixPosition(H.matrixWorld),st.position.copy(ou),Iv.copy(st.position),Iv.add($L[rt]),st.up.copy(tD[rt]),st.lookAt(Iv),st.updateMatrixWorld(),Pt.makeTranslation(-ou.x,-ou.y,-ou.z),vw.multiplyMatrices(st.projectionMatrix,st.matrixWorldInverse),D._frustum.setFromProjectionMatrix(vw,st.coordinateSystem,st.reversedDepth)}else D.updateMatrices(H);i=D.getFrustum(),y(E,b,D.camera,H,this.type)}D.isPointLightShadow!==!0&&this.type===rl&&v(D,b),D.needsUpdate=!1}f=this.type,g.needsUpdate=!1,e.setRenderTarget(A,R,N)};function v(w,E){let b=t.update(S);u.defines.VSM_SAMPLES!==w.blurSamples&&(u.defines.VSM_SAMPLES=w.blurSamples,p.defines.VSM_SAMPLES=w.blurSamples,u.needsUpdate=!0,p.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new pi(s.x,s.y,{format:tr,type:bs})),u.uniforms.shadow_pass.value=w.map.depthTexture,u.uniforms.resolution.value=w.mapSize,u.uniforms.radius.value=w.radius,e.setRenderTarget(w.mapPass),e.clear(),e.renderBufferDirect(E,null,b,u,S,null),p.uniforms.shadow_pass.value=w.mapPass.texture,p.uniforms.resolution.value=w.mapSize,p.uniforms.radius.value=w.radius,e.setRenderTarget(w.map),e.clear(),e.renderBufferDirect(E,null,b,p,S,null)}function x(w,E,b,A){let R=null,N=b.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(N!==void 0)R=N;else if(R=b.isPointLight===!0?l:o,e.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0||E.alphaToCoverage===!0){let I=R.uuid,G=E.uuid,q=c[I];q===void 0&&(q={},c[I]=q);let O=q[G];O===void 0&&(O=R.clone(),q[G]=O,E.addEventListener("dispose",M)),R=O}if(R.visible=E.visible,R.wireframe=E.wireframe,A===rl?R.side=E.shadowSide!==null?E.shadowSide:E.side:R.side=E.shadowSide!==null?E.shadowSide:d[E.side],R.alphaMap=E.alphaMap,R.alphaTest=E.alphaToCoverage===!0?.5:E.alphaTest,R.map=E.map,R.clipShadows=E.clipShadows,R.clippingPlanes=E.clippingPlanes,R.clipIntersection=E.clipIntersection,R.displacementMap=E.displacementMap,R.displacementScale=E.displacementScale,R.displacementBias=E.displacementBias,R.wireframeLinewidth=E.wireframeLinewidth,R.linewidth=E.linewidth,b.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let I=e.properties.get(R);I.light=b}return R}function y(w,E,b,A,R){if(w.visible===!1)return;if(w.layers.test(E.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&R===rl)&&(!w.frustumCulled||i.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse,w.matrixWorld);let G=t.update(w),q=w.material;if(Array.isArray(q)){let O=G.groups;for(let H=0,D=O.length;H<D;H++){let X=O[H],Q=q[X.materialIndex];if(Q&&Q.visible){let it=x(w,Q,A,R);w.onBeforeShadow(e,w,E,b,G,it,X),e.renderBufferDirect(b,null,G,it,w,X),w.onAfterShadow(e,w,E,b,G,it,X)}}}else if(q.visible){let O=x(w,q,A,R);w.onBeforeShadow(e,w,E,b,G,O,null),e.renderBufferDirect(b,null,G,O,w,null),w.onAfterShadow(e,w,E,b,G,O,null)}}let I=w.children;for(let G=0,q=I.length;G<q;G++)y(I[G],E,b,A,R)}function M(w){w.target.removeEventListener("dispose",M);for(let b in c){let A=c[b],R=w.target.uuid;R in A&&(A[R].dispose(),delete A[R])}}}function nD(e,t){function n(){let P=!1,ct=new Ne,j=null,ht=new Ne(0,0,0,0);return{setMask:function(gt){j!==gt&&!P&&(e.colorMask(gt,gt,gt,gt),j=gt)},setLocked:function(gt){P=gt},setClear:function(gt,nt,Et,_t,Xe){Xe===!0&&(gt*=_t,nt*=_t,Et*=_t),ct.set(gt,nt,Et,_t),ht.equals(ct)===!1&&(e.clearColor(gt,nt,Et,_t),ht.copy(ct))},reset:function(){P=!1,j=null,ht.set(-1,0,0,0)}}}function i(){let P=!1,ct=!1,j=null,ht=null,gt=null;return{setReversed:function(nt){if(ct!==nt){let Et=t.get("EXT_clip_control");nt?Et.clipControlEXT(Et.LOWER_LEFT_EXT,Et.ZERO_TO_ONE_EXT):Et.clipControlEXT(Et.LOWER_LEFT_EXT,Et.NEGATIVE_ONE_TO_ONE_EXT),ct=nt;let _t=gt;gt=null,this.setClear(_t)}},getReversed:function(){return ct},setTest:function(nt){nt?tt(e.DEPTH_TEST):Mt(e.DEPTH_TEST)},setMask:function(nt){j!==nt&&!P&&(e.depthMask(nt),j=nt)},setFunc:function(nt){if(ct&&(nt=qM[nt]),ht!==nt){switch(nt){case Lf:e.depthFunc(e.NEVER);break;case Df:e.depthFunc(e.ALWAYS);break;case Uf:e.depthFunc(e.LESS);break;case Lr:e.depthFunc(e.LEQUAL);break;case If:e.depthFunc(e.EQUAL);break;case Of:e.depthFunc(e.GEQUAL);break;case Pf:e.depthFunc(e.GREATER);break;case Bf:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}ht=nt}},setLocked:function(nt){P=nt},setClear:function(nt){gt!==nt&&(gt=nt,ct&&(nt=1-nt),e.clearDepth(nt))},reset:function(){P=!1,j=null,ht=null,gt=null,ct=!1}}}function s(){let P=!1,ct=null,j=null,ht=null,gt=null,nt=null,Et=null,_t=null,Xe=null;return{setTest:function(Ue){P||(Ue?tt(e.STENCIL_TEST):Mt(e.STENCIL_TEST))},setMask:function(Ue){ct!==Ue&&!P&&(e.stencilMask(Ue),ct=Ue)},setFunc:function(Ue,ji,$i){(j!==Ue||ht!==ji||gt!==$i)&&(e.stencilFunc(Ue,ji,$i),j=Ue,ht=ji,gt=$i)},setOp:function(Ue,ji,$i){(nt!==Ue||Et!==ji||_t!==$i)&&(e.stencilOp(Ue,ji,$i),nt=Ue,Et=ji,_t=$i)},setLocked:function(Ue){P=Ue},setClear:function(Ue){Xe!==Ue&&(e.clearStencil(Ue),Xe=Ue)},reset:function(){P=!1,ct=null,j=null,ht=null,gt=null,nt=null,Et=null,_t=null,Xe=null}}}let a=new n,r=new i,o=new s,l=new WeakMap,c=new WeakMap,h={},d={},u={},p=new WeakMap,m=[],S=null,g=!1,f=null,v=null,x=null,y=null,M=null,w=null,E=null,b=new Ot(0,0,0),A=0,R=!1,N=null,I=null,G=null,q=null,O=null,H=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),D=!1,X=0,Q=e.getParameter(e.VERSION);Q.indexOf("WebGL")!==-1?(X=parseFloat(/^WebGL (\d)/.exec(Q)[1]),D=X>=1):Q.indexOf("OpenGL ES")!==-1&&(X=parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]),D=X>=2);let it=null,rt={},st=e.getParameter(e.SCISSOR_BOX),Pt=e.getParameter(e.VIEWPORT),Gt=new Ne().fromArray(st),vt=new Ne().fromArray(Pt);function W(P,ct,j,ht){let gt=new Uint8Array(4),nt=e.createTexture();e.bindTexture(P,nt),e.texParameteri(P,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(P,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let Et=0;Et<j;Et++)P===e.TEXTURE_3D||P===e.TEXTURE_2D_ARRAY?e.texImage3D(ct,0,e.RGBA,1,1,ht,0,e.RGBA,e.UNSIGNED_BYTE,gt):e.texImage2D(ct+Et,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,gt);return nt}let et={};et[e.TEXTURE_2D]=W(e.TEXTURE_2D,e.TEXTURE_2D,1),et[e.TEXTURE_CUBE_MAP]=W(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),et[e.TEXTURE_2D_ARRAY]=W(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),et[e.TEXTURE_3D]=W(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),r.setClear(1),o.setClear(0),tt(e.DEPTH_TEST),r.setFunc(Lr),Le(!1),De($g),tt(e.CULL_FACE),$t(_s);function tt(P){h[P]!==!0&&(e.enable(P),h[P]=!0)}function Mt(P){h[P]!==!1&&(e.disable(P),h[P]=!1)}function Dt(P,ct){return u[P]!==ct?(e.bindFramebuffer(P,ct),u[P]=ct,P===e.DRAW_FRAMEBUFFER&&(u[e.FRAMEBUFFER]=ct),P===e.FRAMEBUFFER&&(u[e.DRAW_FRAMEBUFFER]=ct),!0):!1}function wt(P,ct){let j=m,ht=!1;if(P){j=p.get(ct),j===void 0&&(j=[],p.set(ct,j));let gt=P.textures;if(j.length!==gt.length||j[0]!==e.COLOR_ATTACHMENT0){for(let nt=0,Et=gt.length;nt<Et;nt++)j[nt]=e.COLOR_ATTACHMENT0+nt;j.length=gt.length,ht=!0}}else j[0]!==e.BACK&&(j[0]=e.BACK,ht=!0);ht&&e.drawBuffers(j)}function le(P){return S!==P?(e.useProgram(P),S=P,!0):!1}let Ht={[ka]:e.FUNC_ADD,[mM]:e.FUNC_SUBTRACT,[gM]:e.FUNC_REVERSE_SUBTRACT};Ht[vM]=e.MIN,Ht[yM]=e.MAX;let ae={[xM]:e.ZERO,[_M]:e.ONE,[bM]:e.SRC_COLOR,[Rf]:e.SRC_ALPHA,[AM]:e.SRC_ALPHA_SATURATE,[EM]:e.DST_COLOR,[MM]:e.DST_ALPHA,[SM]:e.ONE_MINUS_SRC_COLOR,[Nf]:e.ONE_MINUS_SRC_ALPHA,[TM]:e.ONE_MINUS_DST_COLOR,[wM]:e.ONE_MINUS_DST_ALPHA,[CM]:e.CONSTANT_COLOR,[RM]:e.ONE_MINUS_CONSTANT_COLOR,[NM]:e.CONSTANT_ALPHA,[LM]:e.ONE_MINUS_CONSTANT_ALPHA};function $t(P,ct,j,ht,gt,nt,Et,_t,Xe,Ue){if(P===_s){g===!0&&(Mt(e.BLEND),g=!1);return}if(g===!1&&(tt(e.BLEND),g=!0),P!==pM){if(P!==f||Ue!==R){if((v!==ka||M!==ka)&&(e.blendEquation(e.FUNC_ADD),v=ka,M=ka),Ue)switch(P){case Nr:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case Jc:e.blendFunc(e.ONE,e.ONE);break;case tv:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case ev:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:zt("WebGLState: Invalid blending: ",P);break}else switch(P){case Nr:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case Jc:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case tv:zt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case ev:zt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:zt("WebGLState: Invalid blending: ",P);break}x=null,y=null,w=null,E=null,b.set(0,0,0),A=0,f=P,R=Ue}return}gt=gt||ct,nt=nt||j,Et=Et||ht,(ct!==v||gt!==M)&&(e.blendEquationSeparate(Ht[ct],Ht[gt]),v=ct,M=gt),(j!==x||ht!==y||nt!==w||Et!==E)&&(e.blendFuncSeparate(ae[j],ae[ht],ae[nt],ae[Et]),x=j,y=ht,w=nt,E=Et),(_t.equals(b)===!1||Xe!==A)&&(e.blendColor(_t.r,_t.g,_t.b,Xe),b.copy(_t),A=Xe),f=P,R=!1}function Zt(P,ct){P.side===Di?Mt(e.CULL_FACE):tt(e.CULL_FACE);let j=P.side===Vn;ct&&(j=!j),Le(j),P.blending===Nr&&P.transparent===!1?$t(_s):$t(P.blending,P.blendEquation,P.blendSrc,P.blendDst,P.blendEquationAlpha,P.blendSrcAlpha,P.blendDstAlpha,P.blendColor,P.blendAlpha,P.premultipliedAlpha),r.setFunc(P.depthFunc),r.setTest(P.depthTest),r.setMask(P.depthWrite),a.setMask(P.colorWrite);let ht=P.stencilWrite;o.setTest(ht),ht&&(o.setMask(P.stencilWriteMask),o.setFunc(P.stencilFunc,P.stencilRef,P.stencilFuncMask),o.setOp(P.stencilFail,P.stencilZFail,P.stencilZPass)),re(P.polygonOffset,P.polygonOffsetFactor,P.polygonOffsetUnits),P.alphaToCoverage===!0?tt(e.SAMPLE_ALPHA_TO_COVERAGE):Mt(e.SAMPLE_ALPHA_TO_COVERAGE)}function Le(P){N!==P&&(P?e.frontFace(e.CW):e.frontFace(e.CCW),N=P)}function De(P){P!==hM?(tt(e.CULL_FACE),P!==I&&(P===$g?e.cullFace(e.BACK):P===fM?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):Mt(e.CULL_FACE),I=P}function Tt(P){P!==G&&(D&&e.lineWidth(P),G=P)}function re(P,ct,j){P?(tt(e.POLYGON_OFFSET_FILL),(q!==ct||O!==j)&&(q=ct,O=j,r.getReversed()&&(ct=-ct),e.polygonOffset(ct,j))):Mt(e.POLYGON_OFFSET_FILL)}function ce(P){P?tt(e.SCISSOR_TEST):Mt(e.SCISSOR_TEST)}function ge(P){P===void 0&&(P=e.TEXTURE0+H-1),it!==P&&(e.activeTexture(P),it=P)}function B(P,ct,j){j===void 0&&(it===null?j=e.TEXTURE0+H-1:j=it);let ht=rt[j];ht===void 0&&(ht={type:void 0,texture:void 0},rt[j]=ht),(ht.type!==P||ht.texture!==ct)&&(it!==j&&(e.activeTexture(j),it=j),e.bindTexture(P,ct||et[P]),ht.type=P,ht.texture=ct)}function ln(){let P=rt[it];P!==void 0&&P.type!==void 0&&(e.bindTexture(P.type,null),P.type=void 0,P.texture=void 0)}function ue(){try{e.compressedTexImage2D(...arguments)}catch(P){zt("WebGLState:",P)}}function C(){try{e.compressedTexImage3D(...arguments)}catch(P){zt("WebGLState:",P)}}function _(){try{e.texSubImage2D(...arguments)}catch(P){zt("WebGLState:",P)}}function U(){try{e.texSubImage3D(...arguments)}catch(P){zt("WebGLState:",P)}}function F(){try{e.compressedTexSubImage2D(...arguments)}catch(P){zt("WebGLState:",P)}}function Z(){try{e.compressedTexSubImage3D(...arguments)}catch(P){zt("WebGLState:",P)}}function at(){try{e.texStorage2D(...arguments)}catch(P){zt("WebGLState:",P)}}function ot(){try{e.texStorage3D(...arguments)}catch(P){zt("WebGLState:",P)}}function J(){try{e.texImage2D(...arguments)}catch(P){zt("WebGLState:",P)}}function K(){try{e.texImage3D(...arguments)}catch(P){zt("WebGLState:",P)}}function lt(P){return d[P]!==void 0?d[P]:e.getParameter(P)}function At(P,ct){d[P]!==ct&&(e.pixelStorei(P,ct),d[P]=ct)}function ft(P){Gt.equals(P)===!1&&(e.scissor(P.x,P.y,P.z,P.w),Gt.copy(P))}function ut(P){vt.equals(P)===!1&&(e.viewport(P.x,P.y,P.z,P.w),vt.copy(P))}function Ut(P,ct){let j=c.get(ct);j===void 0&&(j=new WeakMap,c.set(ct,j));let ht=j.get(P);ht===void 0&&(ht=e.getUniformBlockIndex(ct,P.name),j.set(P,ht))}function Bt(P,ct){let ht=c.get(ct).get(P);l.get(ct)!==ht&&(e.uniformBlockBinding(ct,ht,P.__bindingPointIndex),l.set(ct,ht))}function Wt(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),r.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),h={},d={},it=null,rt={},u={},p=new WeakMap,m=[],S=null,g=!1,f=null,v=null,x=null,y=null,M=null,w=null,E=null,b=new Ot(0,0,0),A=0,R=!1,N=null,I=null,G=null,q=null,O=null,Gt.set(0,0,e.canvas.width,e.canvas.height),vt.set(0,0,e.canvas.width,e.canvas.height),a.reset(),r.reset(),o.reset()}return{buffers:{color:a,depth:r,stencil:o},enable:tt,disable:Mt,bindFramebuffer:Dt,drawBuffers:wt,useProgram:le,setBlending:$t,setMaterial:Zt,setFlipSided:Le,setCullFace:De,setLineWidth:Tt,setPolygonOffset:re,setScissorTest:ce,activeTexture:ge,bindTexture:B,unbindTexture:ln,compressedTexImage2D:ue,compressedTexImage3D:C,texImage2D:J,texImage3D:K,pixelStorei:At,getParameter:lt,updateUBOMapping:Ut,uniformBlockBinding:Bt,texStorage2D:at,texStorage3D:ot,texSubImage2D:_,texSubImage3D:U,compressedTexSubImage2D:F,compressedTexSubImage3D:Z,scissor:ft,viewport:ut,reset:Wt}}function iD(e,t,n,i,s,a,r){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator=="undefined"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Rt,h=new WeakMap,d=new Set,u,p=new WeakMap,m=!1;try{m=typeof OffscreenCanvas!="undefined"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function S(C,_){return m?new OffscreenCanvas(C,_):Lc("canvas")}function g(C,_,U){let F=1,Z=ue(C);if((Z.width>U||Z.height>U)&&(F=U/Math.max(Z.width,Z.height)),F<1)if(typeof HTMLImageElement!="undefined"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&C instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&C instanceof ImageBitmap||typeof VideoFrame!="undefined"&&C instanceof VideoFrame){let at=Math.floor(F*Z.width),ot=Math.floor(F*Z.height);u===void 0&&(u=S(at,ot));let J=_?S(at,ot):u;return J.width=at,J.height=ot,J.getContext("2d").drawImage(C,0,0,at,ot),It("WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+at+"x"+ot+")."),J}else return"data"in C&&It("WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),C;return C}function f(C){return C.generateMipmaps}function v(C){e.generateMipmap(C)}function x(C){return C.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?e.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function y(C,_,U,F,Z,at=!1){if(C!==null){if(e[C]!==void 0)return e[C];It("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let ot;F&&(ot=t.get("EXT_texture_norm16"),ot||It("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let J=_;if(_===e.RED&&(U===e.FLOAT&&(J=e.R32F),U===e.HALF_FLOAT&&(J=e.R16F),U===e.UNSIGNED_BYTE&&(J=e.R8),U===e.UNSIGNED_SHORT&&ot&&(J=ot.R16_EXT),U===e.SHORT&&ot&&(J=ot.R16_SNORM_EXT)),_===e.RED_INTEGER&&(U===e.UNSIGNED_BYTE&&(J=e.R8UI),U===e.UNSIGNED_SHORT&&(J=e.R16UI),U===e.UNSIGNED_INT&&(J=e.R32UI),U===e.BYTE&&(J=e.R8I),U===e.SHORT&&(J=e.R16I),U===e.INT&&(J=e.R32I)),_===e.RG&&(U===e.FLOAT&&(J=e.RG32F),U===e.HALF_FLOAT&&(J=e.RG16F),U===e.UNSIGNED_BYTE&&(J=e.RG8),U===e.UNSIGNED_SHORT&&ot&&(J=ot.RG16_EXT),U===e.SHORT&&ot&&(J=ot.RG16_SNORM_EXT)),_===e.RG_INTEGER&&(U===e.UNSIGNED_BYTE&&(J=e.RG8UI),U===e.UNSIGNED_SHORT&&(J=e.RG16UI),U===e.UNSIGNED_INT&&(J=e.RG32UI),U===e.BYTE&&(J=e.RG8I),U===e.SHORT&&(J=e.RG16I),U===e.INT&&(J=e.RG32I)),_===e.RGB_INTEGER&&(U===e.UNSIGNED_BYTE&&(J=e.RGB8UI),U===e.UNSIGNED_SHORT&&(J=e.RGB16UI),U===e.UNSIGNED_INT&&(J=e.RGB32UI),U===e.BYTE&&(J=e.RGB8I),U===e.SHORT&&(J=e.RGB16I),U===e.INT&&(J=e.RGB32I)),_===e.RGBA_INTEGER&&(U===e.UNSIGNED_BYTE&&(J=e.RGBA8UI),U===e.UNSIGNED_SHORT&&(J=e.RGBA16UI),U===e.UNSIGNED_INT&&(J=e.RGBA32UI),U===e.BYTE&&(J=e.RGBA8I),U===e.SHORT&&(J=e.RGBA16I),U===e.INT&&(J=e.RGBA32I)),_===e.RGB&&(U===e.UNSIGNED_SHORT&&ot&&(J=ot.RGB16_EXT),U===e.SHORT&&ot&&(J=ot.RGB16_SNORM_EXT),U===e.UNSIGNED_INT_5_9_9_9_REV&&(J=e.RGB9_E5),U===e.UNSIGNED_INT_10F_11F_11F_REV&&(J=e.R11F_G11F_B10F)),_===e.RGBA){let K=at?Nc:se.getTransfer(Z);U===e.FLOAT&&(J=e.RGBA32F),U===e.HALF_FLOAT&&(J=e.RGBA16F),U===e.UNSIGNED_BYTE&&(J=K===ve?e.SRGB8_ALPHA8:e.RGBA8),U===e.UNSIGNED_SHORT&&ot&&(J=ot.RGBA16_EXT),U===e.SHORT&&ot&&(J=ot.RGBA16_SNORM_EXT),U===e.UNSIGNED_SHORT_4_4_4_4&&(J=e.RGBA4),U===e.UNSIGNED_SHORT_5_5_5_1&&(J=e.RGB5_A1)}return(J===e.R16F||J===e.R32F||J===e.RG16F||J===e.RG32F||J===e.RGBA16F||J===e.RGBA32F)&&t.get("EXT_color_buffer_float"),J}function M(C,_){let U;return C?_===null||_===Ki||_===ll?U=e.DEPTH24_STENCIL8:_===Ui?U=e.DEPTH32F_STENCIL8:_===ol&&(U=e.DEPTH24_STENCIL8,It("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Ki||_===ll?U=e.DEPTH_COMPONENT24:_===Ui?U=e.DEPTH_COMPONENT32F:_===ol&&(U=e.DEPTH_COMPONENT16),U}function w(C,_){return f(C)===!0||C.isFramebufferTexture&&C.minFilter!==_n&&C.minFilter!==on?Math.log2(Math.max(_.width,_.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?_.mipmaps.length:1}function E(C){let _=C.target;_.removeEventListener("dispose",E),A(_),_.isVideoTexture&&h.delete(_),_.isHTMLTexture&&d.delete(_)}function b(C){let _=C.target;_.removeEventListener("dispose",b),N(_)}function A(C){let _=i.get(C);if(_.__webglInit===void 0)return;let U=C.source,F=p.get(U);if(F){let Z=F[_.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&R(C),Object.keys(F).length===0&&p.delete(U)}i.remove(C)}function R(C){let _=i.get(C);e.deleteTexture(_.__webglTexture);let U=C.source,F=p.get(U);delete F[_.__cacheKey],r.memory.textures--}function N(C){let _=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let F=0;F<6;F++){if(Array.isArray(_.__webglFramebuffer[F]))for(let Z=0;Z<_.__webglFramebuffer[F].length;Z++)e.deleteFramebuffer(_.__webglFramebuffer[F][Z]);else e.deleteFramebuffer(_.__webglFramebuffer[F]);_.__webglDepthbuffer&&e.deleteRenderbuffer(_.__webglDepthbuffer[F])}else{if(Array.isArray(_.__webglFramebuffer))for(let F=0;F<_.__webglFramebuffer.length;F++)e.deleteFramebuffer(_.__webglFramebuffer[F]);else e.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&e.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&e.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let F=0;F<_.__webglColorRenderbuffer.length;F++)_.__webglColorRenderbuffer[F]&&e.deleteRenderbuffer(_.__webglColorRenderbuffer[F]);_.__webglDepthRenderbuffer&&e.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let U=C.textures;for(let F=0,Z=U.length;F<Z;F++){let at=i.get(U[F]);at.__webglTexture&&(e.deleteTexture(at.__webglTexture),r.memory.textures--),i.remove(U[F])}i.remove(C)}let I=0;function G(){I=0}function q(){return I}function O(C){I=C}function H(){let C=I;return C>=s.maxTextures&&It("WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+s.maxTextures),I+=1,C}function D(C){let _=[];return _.push(C.wrapS),_.push(C.wrapT),_.push(C.wrapR||0),_.push(C.magFilter),_.push(C.minFilter),_.push(C.anisotropy),_.push(C.internalFormat),_.push(C.format),_.push(C.type),_.push(C.generateMipmaps),_.push(C.premultiplyAlpha),_.push(C.flipY),_.push(C.unpackAlignment),_.push(C.colorSpace),_.join()}function X(C,_){let U=i.get(C);if(C.isVideoTexture&&B(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&U.__version!==C.version){let F=C.image;if(F===null)It("WebGLRenderer: Texture marked for update but no image data found.");else if(F.complete===!1)It("WebGLRenderer: Texture marked for update but image is incomplete");else{Mt(U,C,_);return}}else C.isExternalTexture&&(U.__webglTexture=C.sourceTexture?C.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,U.__webglTexture,e.TEXTURE0+_)}function Q(C,_){let U=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&U.__version!==C.version){Mt(U,C,_);return}else C.isExternalTexture&&(U.__webglTexture=C.sourceTexture?C.sourceTexture:null);n.bindTexture(e.TEXTURE_2D_ARRAY,U.__webglTexture,e.TEXTURE0+_)}function it(C,_){let U=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&U.__version!==C.version){Mt(U,C,_);return}n.bindTexture(e.TEXTURE_3D,U.__webglTexture,e.TEXTURE0+_)}function rt(C,_){let U=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&U.__version!==C.version){Dt(U,C,_);return}n.bindTexture(e.TEXTURE_CUBE_MAP,U.__webglTexture,e.TEXTURE0+_)}let st={[zf]:e.REPEAT,[ds]:e.CLAMP_TO_EDGE,[Ff]:e.MIRRORED_REPEAT},Pt={[_n]:e.NEAREST,[IM]:e.NEAREST_MIPMAP_NEAREST,[Qc]:e.NEAREST_MIPMAP_LINEAR,[on]:e.LINEAR,[_d]:e.LINEAR_MIPMAP_NEAREST,[ja]:e.LINEAR_MIPMAP_LINEAR},Gt={[BM]:e.NEVER,[GM]:e.ALWAYS,[zM]:e.LESS,[sp]:e.LEQUAL,[FM]:e.EQUAL,[ap]:e.GEQUAL,[HM]:e.GREATER,[VM]:e.NOTEQUAL};function vt(C,_){if(_.type===Ui&&t.has("OES_texture_float_linear")===!1&&(_.magFilter===on||_.magFilter===_d||_.magFilter===Qc||_.magFilter===ja||_.minFilter===on||_.minFilter===_d||_.minFilter===Qc||_.minFilter===ja)&&It("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(C,e.TEXTURE_WRAP_S,st[_.wrapS]),e.texParameteri(C,e.TEXTURE_WRAP_T,st[_.wrapT]),(C===e.TEXTURE_3D||C===e.TEXTURE_2D_ARRAY)&&e.texParameteri(C,e.TEXTURE_WRAP_R,st[_.wrapR]),e.texParameteri(C,e.TEXTURE_MAG_FILTER,Pt[_.magFilter]),e.texParameteri(C,e.TEXTURE_MIN_FILTER,Pt[_.minFilter]),_.compareFunction&&(e.texParameteri(C,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(C,e.TEXTURE_COMPARE_FUNC,Gt[_.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===_n||_.minFilter!==Qc&&_.minFilter!==ja||_.type===Ui&&t.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){let U=t.get("EXT_texture_filter_anisotropic");e.texParameterf(C,U.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function W(C,_){let U=!1;C.__webglInit===void 0&&(C.__webglInit=!0,_.addEventListener("dispose",E));let F=_.source,Z=p.get(F);Z===void 0&&(Z={},p.set(F,Z));let at=D(_);if(at!==C.__cacheKey){Z[at]===void 0&&(Z[at]={texture:e.createTexture(),usedTimes:0},r.memory.textures++,U=!0),Z[at].usedTimes++;let ot=Z[C.__cacheKey];ot!==void 0&&(Z[C.__cacheKey].usedTimes--,ot.usedTimes===0&&R(_)),C.__cacheKey=at,C.__webglTexture=Z[at].texture}return U}function et(C,_,U){return Math.floor(Math.floor(C/U)/_)}function tt(C,_,U,F){let at=C.updateRanges;if(at.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,_.width,_.height,U,F,_.data);else{at.sort((At,ft)=>At.start-ft.start);let ot=0;for(let At=1;At<at.length;At++){let ft=at[ot],ut=at[At],Ut=ft.start+ft.count,Bt=et(ut.start,_.width,4),Wt=et(ft.start,_.width,4);ut.start<=Ut+1&&Bt===Wt&&et(ut.start+ut.count-1,_.width,4)===Bt?ft.count=Math.max(ft.count,ut.start+ut.count-ft.start):(++ot,at[ot]=ut)}at.length=ot+1;let J=n.getParameter(e.UNPACK_ROW_LENGTH),K=n.getParameter(e.UNPACK_SKIP_PIXELS),lt=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,_.width);for(let At=0,ft=at.length;At<ft;At++){let ut=at[At],Ut=Math.floor(ut.start/4),Bt=Math.ceil(ut.count/4),Wt=Ut%_.width,P=Math.floor(Ut/_.width),ct=Bt,j=1;n.pixelStorei(e.UNPACK_SKIP_PIXELS,Wt),n.pixelStorei(e.UNPACK_SKIP_ROWS,P),n.texSubImage2D(e.TEXTURE_2D,0,Wt,P,ct,j,U,F,_.data)}C.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,J),n.pixelStorei(e.UNPACK_SKIP_PIXELS,K),n.pixelStorei(e.UNPACK_SKIP_ROWS,lt)}}function Mt(C,_,U){let F=e.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(F=e.TEXTURE_2D_ARRAY),_.isData3DTexture&&(F=e.TEXTURE_3D);let Z=W(C,_),at=_.source;n.bindTexture(F,C.__webglTexture,e.TEXTURE0+U);let ot=i.get(at);if(at.version!==ot.__version||Z===!0){if(n.activeTexture(e.TEXTURE0+U),(typeof ImageBitmap!="undefined"&&_.image instanceof ImageBitmap)===!1){let j=se.getPrimaries(se.workingColorSpace),ht=_.colorSpace===ea?null:se.getPrimaries(_.colorSpace),gt=_.colorSpace===ea||j===ht?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,gt)}n.pixelStorei(e.UNPACK_ALIGNMENT,_.unpackAlignment);let K=g(_.image,!1,s.maxTextureSize);K=ln(_,K);let lt=a.convert(_.format,_.colorSpace),At=a.convert(_.type),ft=y(_.internalFormat,lt,At,_.normalized,_.colorSpace,_.isVideoTexture);vt(F,_);let ut,Ut=_.mipmaps,Bt=_.isVideoTexture!==!0,Wt=ot.__version===void 0||Z===!0,P=at.dataReady,ct=w(_,K);if(_.isDepthTexture)ft=M(_.format===$a,_.type),Wt&&(Bt?n.texStorage2D(e.TEXTURE_2D,1,ft,K.width,K.height):n.texImage2D(e.TEXTURE_2D,0,ft,K.width,K.height,0,lt,At,null));else if(_.isDataTexture)if(Ut.length>0){Bt&&Wt&&n.texStorage2D(e.TEXTURE_2D,ct,ft,Ut[0].width,Ut[0].height);for(let j=0,ht=Ut.length;j<ht;j++)ut=Ut[j],Bt?P&&n.texSubImage2D(e.TEXTURE_2D,j,0,0,ut.width,ut.height,lt,At,ut.data):n.texImage2D(e.TEXTURE_2D,j,ft,ut.width,ut.height,0,lt,At,ut.data);_.generateMipmaps=!1}else Bt?(Wt&&n.texStorage2D(e.TEXTURE_2D,ct,ft,K.width,K.height),P&&tt(_,K,lt,At)):n.texImage2D(e.TEXTURE_2D,0,ft,K.width,K.height,0,lt,At,K.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Bt&&Wt&&n.texStorage3D(e.TEXTURE_2D_ARRAY,ct,ft,Ut[0].width,Ut[0].height,K.depth);for(let j=0,ht=Ut.length;j<ht;j++)if(ut=Ut[j],_.format!==Ii)if(lt!==null)if(Bt){if(P)if(_.layerUpdates.size>0){let gt=Mv(ut.width,ut.height,_.format,_.type);for(let nt of _.layerUpdates){let Et=ut.data.subarray(nt*gt/ut.data.BYTES_PER_ELEMENT,(nt+1)*gt/ut.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,j,0,0,nt,ut.width,ut.height,1,lt,Et)}_.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,j,0,0,0,ut.width,ut.height,K.depth,lt,ut.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,j,ft,ut.width,ut.height,K.depth,0,ut.data,0,0);else It("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Bt?P&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,j,0,0,0,ut.width,ut.height,K.depth,lt,At,ut.data):n.texImage3D(e.TEXTURE_2D_ARRAY,j,ft,ut.width,ut.height,K.depth,0,lt,At,ut.data)}else{Bt&&Wt&&n.texStorage2D(e.TEXTURE_2D,ct,ft,Ut[0].width,Ut[0].height);for(let j=0,ht=Ut.length;j<ht;j++)ut=Ut[j],_.format!==Ii?lt!==null?Bt?P&&n.compressedTexSubImage2D(e.TEXTURE_2D,j,0,0,ut.width,ut.height,lt,ut.data):n.compressedTexImage2D(e.TEXTURE_2D,j,ft,ut.width,ut.height,0,ut.data):It("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Bt?P&&n.texSubImage2D(e.TEXTURE_2D,j,0,0,ut.width,ut.height,lt,At,ut.data):n.texImage2D(e.TEXTURE_2D,j,ft,ut.width,ut.height,0,lt,At,ut.data)}else if(_.isDataArrayTexture)if(Bt){if(Wt&&n.texStorage3D(e.TEXTURE_2D_ARRAY,ct,ft,K.width,K.height,K.depth),P)if(_.layerUpdates.size>0){let j=Mv(K.width,K.height,_.format,_.type);for(let ht of _.layerUpdates){let gt=K.data.subarray(ht*j/K.data.BYTES_PER_ELEMENT,(ht+1)*j/K.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,ht,K.width,K.height,1,lt,At,gt)}_.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,lt,At,K.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,ft,K.width,K.height,K.depth,0,lt,At,K.data);else if(_.isData3DTexture)Bt?(Wt&&n.texStorage3D(e.TEXTURE_3D,ct,ft,K.width,K.height,K.depth),P&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,lt,At,K.data)):n.texImage3D(e.TEXTURE_3D,0,ft,K.width,K.height,K.depth,0,lt,At,K.data);else if(_.isFramebufferTexture){if(Wt)if(Bt)n.texStorage2D(e.TEXTURE_2D,ct,ft,K.width,K.height);else{let j=K.width,ht=K.height;for(let gt=0;gt<ct;gt++)n.texImage2D(e.TEXTURE_2D,gt,ft,j,ht,0,lt,At,null),j>>=1,ht>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in e){let j=e.canvas;if(j.hasAttribute("layoutsubtree")||j.setAttribute("layoutsubtree","true"),K.parentNode!==j){j.appendChild(K),d.add(_),j.onpaint=ht=>{let gt=ht.changedElements;for(let nt of d)gt.includes(nt.image)&&(nt.needsUpdate=!0)},j.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,K);else{let gt=e.RGBA,nt=e.RGBA,Et=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,gt,nt,Et,K)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(Ut.length>0){if(Bt&&Wt){let j=ue(Ut[0]);n.texStorage2D(e.TEXTURE_2D,ct,ft,j.width,j.height)}for(let j=0,ht=Ut.length;j<ht;j++)ut=Ut[j],Bt?P&&n.texSubImage2D(e.TEXTURE_2D,j,0,0,lt,At,ut):n.texImage2D(e.TEXTURE_2D,j,ft,lt,At,ut);_.generateMipmaps=!1}else if(Bt){if(Wt){let j=ue(K);n.texStorage2D(e.TEXTURE_2D,ct,ft,j.width,j.height)}P&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,lt,At,K)}else n.texImage2D(e.TEXTURE_2D,0,ft,lt,At,K);f(_)&&v(F),ot.__version=at.version,_.onUpdate&&_.onUpdate(_)}C.__version=_.version}function Dt(C,_,U){if(_.image.length!==6)return;let F=W(C,_),Z=_.source;n.bindTexture(e.TEXTURE_CUBE_MAP,C.__webglTexture,e.TEXTURE0+U);let at=i.get(Z);if(Z.version!==at.__version||F===!0){n.activeTexture(e.TEXTURE0+U);let ot=se.getPrimaries(se.workingColorSpace),J=_.colorSpace===ea?null:se.getPrimaries(_.colorSpace),K=_.colorSpace===ea||ot===J?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,_.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,_.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,K);let lt=_.isCompressedTexture||_.image[0].isCompressedTexture,At=_.image[0]&&_.image[0].isDataTexture,ft=[];for(let nt=0;nt<6;nt++)!lt&&!At?ft[nt]=g(_.image[nt],!0,s.maxCubemapSize):ft[nt]=At?_.image[nt].image:_.image[nt],ft[nt]=ln(_,ft[nt]);let ut=ft[0],Ut=a.convert(_.format,_.colorSpace),Bt=a.convert(_.type),Wt=y(_.internalFormat,Ut,Bt,_.normalized,_.colorSpace),P=_.isVideoTexture!==!0,ct=at.__version===void 0||F===!0,j=Z.dataReady,ht=w(_,ut);vt(e.TEXTURE_CUBE_MAP,_);let gt;if(lt){P&&ct&&n.texStorage2D(e.TEXTURE_CUBE_MAP,ht,Wt,ut.width,ut.height);for(let nt=0;nt<6;nt++){gt=ft[nt].mipmaps;for(let Et=0;Et<gt.length;Et++){let _t=gt[Et];_.format!==Ii?Ut!==null?P?j&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Et,0,0,_t.width,_t.height,Ut,_t.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Et,Wt,_t.width,_t.height,0,_t.data):It("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):P?j&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Et,0,0,_t.width,_t.height,Ut,Bt,_t.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Et,Wt,_t.width,_t.height,0,Ut,Bt,_t.data)}}}else{if(gt=_.mipmaps,P&&ct){gt.length>0&&ht++;let nt=ue(ft[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,ht,Wt,nt.width,nt.height)}for(let nt=0;nt<6;nt++)if(At){P?j&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,0,0,ft[nt].width,ft[nt].height,Ut,Bt,ft[nt].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,Wt,ft[nt].width,ft[nt].height,0,Ut,Bt,ft[nt].data);for(let Et=0;Et<gt.length;Et++){let Xe=gt[Et].image[nt].image;P?j&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Et+1,0,0,Xe.width,Xe.height,Ut,Bt,Xe.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Et+1,Wt,Xe.width,Xe.height,0,Ut,Bt,Xe.data)}}else{P?j&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,0,0,Ut,Bt,ft[nt]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,Wt,Ut,Bt,ft[nt]);for(let Et=0;Et<gt.length;Et++){let _t=gt[Et];P?j&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Et+1,0,0,Ut,Bt,_t.image[nt]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Et+1,Wt,Ut,Bt,_t.image[nt])}}}f(_)&&v(e.TEXTURE_CUBE_MAP),at.__version=Z.version,_.onUpdate&&_.onUpdate(_)}C.__version=_.version}function wt(C,_,U,F,Z,at){let ot=a.convert(U.format,U.colorSpace),J=a.convert(U.type),K=y(U.internalFormat,ot,J,U.normalized,U.colorSpace),lt=i.get(_),At=i.get(U);if(At.__renderTarget=_,!lt.__hasExternalTextures){let ft=Math.max(1,_.width>>at),ut=Math.max(1,_.height>>at);Z===e.TEXTURE_3D||Z===e.TEXTURE_2D_ARRAY?n.texImage3D(Z,at,K,ft,ut,_.depth,0,ot,J,null):n.texImage2D(Z,at,K,ft,ut,0,ot,J,null)}n.bindFramebuffer(e.FRAMEBUFFER,C),ge(_)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,F,Z,At.__webglTexture,0,ce(_)):(Z===e.TEXTURE_2D||Z>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,F,Z,At.__webglTexture,at),n.bindFramebuffer(e.FRAMEBUFFER,null)}function le(C,_,U){if(e.bindRenderbuffer(e.RENDERBUFFER,C),_.depthBuffer){let F=_.depthTexture,Z=F&&F.isDepthTexture?F.type:null,at=M(_.stencilBuffer,Z),ot=_.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;ge(_)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ce(_),at,_.width,_.height):U?e.renderbufferStorageMultisample(e.RENDERBUFFER,ce(_),at,_.width,_.height):e.renderbufferStorage(e.RENDERBUFFER,at,_.width,_.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,ot,e.RENDERBUFFER,C)}else{let F=_.textures;for(let Z=0;Z<F.length;Z++){let at=F[Z],ot=a.convert(at.format,at.colorSpace),J=a.convert(at.type),K=y(at.internalFormat,ot,J,at.normalized,at.colorSpace);ge(_)?o.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ce(_),K,_.width,_.height):U?e.renderbufferStorageMultisample(e.RENDERBUFFER,ce(_),K,_.width,_.height):e.renderbufferStorage(e.RENDERBUFFER,K,_.width,_.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Ht(C,_,U){let F=_.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,C),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Z=i.get(_.depthTexture);if(Z.__renderTarget=_,(!Z.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),F){if(Z.__webglInit===void 0&&(Z.__webglInit=!0,_.depthTexture.addEventListener("dispose",E)),Z.__webglTexture===void 0){Z.__webglTexture=e.createTexture(),n.bindTexture(e.TEXTURE_CUBE_MAP,Z.__webglTexture),vt(e.TEXTURE_CUBE_MAP,_.depthTexture);let lt=a.convert(_.depthTexture.format),At=a.convert(_.depthTexture.type),ft;_.depthTexture.format===ps?ft=e.DEPTH_COMPONENT24:_.depthTexture.format===$a&&(ft=e.DEPTH24_STENCIL8);for(let ut=0;ut<6;ut++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ut,0,ft,_.width,_.height,0,lt,At,null)}}else X(_.depthTexture,0);let at=Z.__webglTexture,ot=ce(_),J=F?e.TEXTURE_CUBE_MAP_POSITIVE_X+U:e.TEXTURE_2D,K=_.depthTexture.format===$a?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(_.depthTexture.format===ps)ge(_)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,K,J,at,0,ot):e.framebufferTexture2D(e.FRAMEBUFFER,K,J,at,0);else if(_.depthTexture.format===$a)ge(_)?o.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,K,J,at,0,ot):e.framebufferTexture2D(e.FRAMEBUFFER,K,J,at,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ae(C){let _=i.get(C),U=C.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==C.depthTexture){let F=C.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),F){let Z=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,F.removeEventListener("dispose",Z)};F.addEventListener("dispose",Z),_.__depthDisposeCallback=Z}_.__boundDepthTexture=F}if(C.depthTexture&&!_.__autoAllocateDepthBuffer)if(U)for(let F=0;F<6;F++)Ht(_.__webglFramebuffer[F],C,F);else{let F=C.texture.mipmaps;F&&F.length>0?Ht(_.__webglFramebuffer[0],C,0):Ht(_.__webglFramebuffer,C,0)}else if(U){_.__webglDepthbuffer=[];for(let F=0;F<6;F++)if(n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer[F]),_.__webglDepthbuffer[F]===void 0)_.__webglDepthbuffer[F]=e.createRenderbuffer(),le(_.__webglDepthbuffer[F],C,!1);else{let Z=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,at=_.__webglDepthbuffer[F];e.bindRenderbuffer(e.RENDERBUFFER,at),e.framebufferRenderbuffer(e.FRAMEBUFFER,Z,e.RENDERBUFFER,at)}}else{let F=C.texture.mipmaps;if(F&&F.length>0?n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=e.createRenderbuffer(),le(_.__webglDepthbuffer,C,!1);else{let Z=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,at=_.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,at),e.framebufferRenderbuffer(e.FRAMEBUFFER,Z,e.RENDERBUFFER,at)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function $t(C,_,U){let F=i.get(C);_!==void 0&&wt(F.__webglFramebuffer,C,C.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),U!==void 0&&ae(C)}function Zt(C){let _=C.texture,U=i.get(C),F=i.get(_);C.addEventListener("dispose",b);let Z=C.textures,at=C.isWebGLCubeRenderTarget===!0,ot=Z.length>1;if(ot||(F.__webglTexture===void 0&&(F.__webglTexture=e.createTexture()),F.__version=_.version,r.memory.textures++),at){U.__webglFramebuffer=[];for(let J=0;J<6;J++)if(_.mipmaps&&_.mipmaps.length>0){U.__webglFramebuffer[J]=[];for(let K=0;K<_.mipmaps.length;K++)U.__webglFramebuffer[J][K]=e.createFramebuffer()}else U.__webglFramebuffer[J]=e.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){U.__webglFramebuffer=[];for(let J=0;J<_.mipmaps.length;J++)U.__webglFramebuffer[J]=e.createFramebuffer()}else U.__webglFramebuffer=e.createFramebuffer();if(ot)for(let J=0,K=Z.length;J<K;J++){let lt=i.get(Z[J]);lt.__webglTexture===void 0&&(lt.__webglTexture=e.createTexture(),r.memory.textures++)}if(C.samples>0&&ge(C)===!1){U.__webglMultisampledFramebuffer=e.createFramebuffer(),U.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,U.__webglMultisampledFramebuffer);for(let J=0;J<Z.length;J++){let K=Z[J];U.__webglColorRenderbuffer[J]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,U.__webglColorRenderbuffer[J]);let lt=a.convert(K.format,K.colorSpace),At=a.convert(K.type),ft=y(K.internalFormat,lt,At,K.normalized,K.colorSpace,C.isXRRenderTarget===!0),ut=ce(C);e.renderbufferStorageMultisample(e.RENDERBUFFER,ut,ft,C.width,C.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+J,e.RENDERBUFFER,U.__webglColorRenderbuffer[J])}e.bindRenderbuffer(e.RENDERBUFFER,null),C.depthBuffer&&(U.__webglDepthRenderbuffer=e.createRenderbuffer(),le(U.__webglDepthRenderbuffer,C,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(at){n.bindTexture(e.TEXTURE_CUBE_MAP,F.__webglTexture),vt(e.TEXTURE_CUBE_MAP,_);for(let J=0;J<6;J++)if(_.mipmaps&&_.mipmaps.length>0)for(let K=0;K<_.mipmaps.length;K++)wt(U.__webglFramebuffer[J][K],C,_,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+J,K);else wt(U.__webglFramebuffer[J],C,_,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+J,0);f(_)&&v(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(ot){for(let J=0,K=Z.length;J<K;J++){let lt=Z[J],At=i.get(lt),ft=e.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(ft=C.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(ft,At.__webglTexture),vt(ft,lt),wt(U.__webglFramebuffer,C,lt,e.COLOR_ATTACHMENT0+J,ft,0),f(lt)&&v(ft)}n.unbindTexture()}else{let J=e.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(J=C.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(J,F.__webglTexture),vt(J,_),_.mipmaps&&_.mipmaps.length>0)for(let K=0;K<_.mipmaps.length;K++)wt(U.__webglFramebuffer[K],C,_,e.COLOR_ATTACHMENT0,J,K);else wt(U.__webglFramebuffer,C,_,e.COLOR_ATTACHMENT0,J,0);f(_)&&v(J),n.unbindTexture()}C.depthBuffer&&ae(C)}function Le(C){let _=C.textures;for(let U=0,F=_.length;U<F;U++){let Z=_[U];if(f(Z)){let at=x(C),ot=i.get(Z).__webglTexture;n.bindTexture(at,ot),v(at),n.unbindTexture()}}}let De=[],Tt=[];function re(C){if(C.samples>0){if(ge(C)===!1){let _=C.textures,U=C.width,F=C.height,Z=e.COLOR_BUFFER_BIT,at=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ot=i.get(C),J=_.length>1;if(J)for(let lt=0;lt<_.length;lt++)n.bindFramebuffer(e.FRAMEBUFFER,ot.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+lt,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,ot.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+lt,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,ot.__webglMultisampledFramebuffer);let K=C.texture.mipmaps;K&&K.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ot.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ot.__webglFramebuffer);for(let lt=0;lt<_.length;lt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(Z|=e.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(Z|=e.STENCIL_BUFFER_BIT)),J){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,ot.__webglColorRenderbuffer[lt]);let At=i.get(_[lt]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,At,0)}e.blitFramebuffer(0,0,U,F,0,0,U,F,Z,e.NEAREST),l===!0&&(De.length=0,Tt.length=0,De.push(e.COLOR_ATTACHMENT0+lt),C.depthBuffer&&C.resolveDepthBuffer===!1&&(De.push(at),Tt.push(at),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Tt)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,De))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),J)for(let lt=0;lt<_.length;lt++){n.bindFramebuffer(e.FRAMEBUFFER,ot.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+lt,e.RENDERBUFFER,ot.__webglColorRenderbuffer[lt]);let At=i.get(_[lt]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,ot.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+lt,e.TEXTURE_2D,At,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ot.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){let _=C.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[_])}}}function ce(C){return Math.min(s.maxSamples,C.samples)}function ge(C){let _=i.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function B(C){let _=r.render.frame;h.get(C)!==_&&(h.set(C,_),C.update())}function ln(C,_){let U=C.colorSpace,F=C.format,Z=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||U!==Rc&&U!==ea&&(se.getTransfer(U)===ve?(F!==Ii||Z!==$n)&&It("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):zt("WebGLTextures: Unsupported texture color space:",U)),_}function ue(C){return typeof HTMLImageElement!="undefined"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame!="undefined"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=H,this.resetTextureUnits=G,this.getTextureUnits=q,this.setTextureUnits=O,this.setTexture2D=X,this.setTexture2DArray=Q,this.setTexture3D=it,this.setTextureCube=rt,this.rebindTextures=$t,this.setupRenderTarget=Zt,this.updateRenderTargetMipmap=Le,this.updateMultisampleRenderTarget=re,this.setupDepthRenderbuffer=ae,this.setupFrameBufferTexture=wt,this.useMultisampledRTT=ge,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function sD(e,t){function n(i,s=ea){let a,r=se.getTransfer(s);if(i===$n)return e.UNSIGNED_BYTE;if(i===Sd)return e.UNSIGNED_SHORT_4_4_4_4;if(i===Md)return e.UNSIGNED_SHORT_5_5_5_1;if(i===dv)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===pv)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===hv)return e.BYTE;if(i===fv)return e.SHORT;if(i===ol)return e.UNSIGNED_SHORT;if(i===bd)return e.INT;if(i===Ki)return e.UNSIGNED_INT;if(i===Ui)return e.FLOAT;if(i===bs)return e.HALF_FLOAT;if(i===mv)return e.ALPHA;if(i===gv)return e.RGB;if(i===Ii)return e.RGBA;if(i===ps)return e.DEPTH_COMPONENT;if(i===$a)return e.DEPTH_STENCIL;if(i===wd)return e.RED;if(i===Ed)return e.RED_INTEGER;if(i===tr)return e.RG;if(i===Td)return e.RG_INTEGER;if(i===Ad)return e.RGBA_INTEGER;if(i===jc||i===$c||i===tu||i===eu)if(r===ve)if(a=t.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(i===jc)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===$c)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===tu)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===eu)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=t.get("WEBGL_compressed_texture_s3tc"),a!==null){if(i===jc)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===$c)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===tu)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===eu)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Cd||i===Rd||i===Nd||i===Ld)if(a=t.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(i===Cd)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Rd)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Nd)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Ld)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Dd||i===Ud||i===Id||i===Od||i===Pd||i===nu||i===Bd)if(a=t.get("WEBGL_compressed_texture_etc"),a!==null){if(i===Dd||i===Ud)return r===ve?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(i===Id)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC;if(i===Od)return a.COMPRESSED_R11_EAC;if(i===Pd)return a.COMPRESSED_SIGNED_R11_EAC;if(i===nu)return a.COMPRESSED_RG11_EAC;if(i===Bd)return a.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===zd||i===Fd||i===Hd||i===Vd||i===Gd||i===kd||i===Wd||i===Xd||i===qd||i===Yd||i===Zd||i===Jd||i===Kd||i===Qd)if(a=t.get("WEBGL_compressed_texture_astc"),a!==null){if(i===zd)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Fd)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Hd)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Vd)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Gd)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===kd)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Wd)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Xd)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===qd)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Yd)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Zd)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Jd)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Kd)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Qd)return r===ve?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===jd||i===$d||i===tp)if(a=t.get("EXT_texture_compression_bptc"),a!==null){if(i===jd)return r===ve?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===$d)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===tp)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===ep||i===np||i===iu||i===ip)if(a=t.get("EXT_texture_compression_rgtc"),a!==null){if(i===ep)return a.COMPRESSED_RED_RGTC1_EXT;if(i===np)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===iu)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===ip)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ll?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:n}}var aD=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,rD=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Gv=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,n){if(this.texture===null){let i=new Hc(t.texture);(t.depthNear!==n.depthNear||t.depthFar!==n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let n=t.cameras[0].viewport,i=new bn({vertexShader:aD,fragmentShader:rD,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new we(new ta(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},kv=class extends ms{constructor(t,n){super();let i=this,s=null,a=1,r=null,o="local-floor",l=1,c=null,h=null,d=null,u=null,p=null,m=null,S=typeof XRWebGLBinding!="undefined",g=new Gv,f={},v=n.getContextAttributes(),x=null,y=null,M=[],w=[],E=new Rt,b=null,A=new xn;A.viewport=new Ne;let R=new xn;R.viewport=new Ne;let N=[A,R],I=new gd,G=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let et=M[W];return et===void 0&&(et=new Ko,M[W]=et),et.getTargetRaySpace()},this.getControllerGrip=function(W){let et=M[W];return et===void 0&&(et=new Ko,M[W]=et),et.getGripSpace()},this.getHand=function(W){let et=M[W];return et===void 0&&(et=new Ko,M[W]=et),et.getHandSpace()};function O(W){let et=w.indexOf(W.inputSource);if(et===-1)return;let tt=M[et];tt!==void 0&&(tt.update(W.inputSource,W.frame,c||r),tt.dispatchEvent({type:W.type,data:W.inputSource}))}function H(){s.removeEventListener("select",O),s.removeEventListener("selectstart",O),s.removeEventListener("selectend",O),s.removeEventListener("squeeze",O),s.removeEventListener("squeezestart",O),s.removeEventListener("squeezeend",O),s.removeEventListener("end",H),s.removeEventListener("inputsourceschange",D);for(let W=0;W<M.length;W++){let et=w[W];et!==null&&(w[W]=null,M[W].disconnect(et))}G=null,q=null,g.reset();for(let W in f)delete f[W];t.setRenderTarget(x),p=null,u=null,d=null,s=null,y=null,vt.stop(),i.isPresenting=!1,t.setPixelRatio(b),t.setSize(E.width,E.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){a=W,i.isPresenting===!0&&It("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){o=W,i.isPresenting===!0&&It("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||r},this.setReferenceSpace=function(W){c=W},this.getBaseLayer=function(){return u!==null?u:p},this.getBinding=function(){return d===null&&S&&(d=new XRWebGLBinding(s,n)),d},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(W){if(s=W,s!==null){if(x=t.getRenderTarget(),s.addEventListener("select",O),s.addEventListener("selectstart",O),s.addEventListener("selectend",O),s.addEventListener("squeeze",O),s.addEventListener("squeezestart",O),s.addEventListener("squeezeend",O),s.addEventListener("end",H),s.addEventListener("inputsourceschange",D),v.xrCompatible!==!0&&await n.makeXRCompatible(),b=t.getPixelRatio(),t.getSize(E),S&&"createProjectionLayer"in XRWebGLBinding.prototype){let tt=null,Mt=null,Dt=null;v.depth&&(Dt=v.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,tt=v.stencil?$a:ps,Mt=v.stencil?ll:Ki);let wt={colorFormat:n.RGBA8,depthFormat:Dt,scaleFactor:a};d=this.getBinding(),u=d.createProjectionLayer(wt),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),y=new pi(u.textureWidth,u.textureHeight,{format:Ii,type:$n,depthTexture:new $s(u.textureWidth,u.textureHeight,Mt,void 0,void 0,void 0,void 0,void 0,void 0,tt),stencilBuffer:v.stencil,colorSpace:t.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1})}else{let tt={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:a};p=new XRWebGLLayer(s,n,tt),s.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),y=new pi(p.framebufferWidth,p.framebufferHeight,{format:Ii,type:$n,colorSpace:t.outputColorSpace,stencilBuffer:v.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,r=await s.requestReferenceSpace(o),vt.setContext(s),vt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function D(W){for(let et=0;et<W.removed.length;et++){let tt=W.removed[et],Mt=w.indexOf(tt);Mt>=0&&(w[Mt]=null,M[Mt].disconnect(tt))}for(let et=0;et<W.added.length;et++){let tt=W.added[et],Mt=w.indexOf(tt);if(Mt===-1){for(let wt=0;wt<M.length;wt++)if(wt>=w.length){w.push(tt),Mt=wt;break}else if(w[wt]===null){w[wt]=tt,Mt=wt;break}if(Mt===-1)break}let Dt=M[Mt];Dt&&Dt.connect(tt)}}let X=new L,Q=new L;function it(W,et,tt){X.setFromMatrixPosition(et.matrixWorld),Q.setFromMatrixPosition(tt.matrixWorld);let Mt=X.distanceTo(Q),Dt=et.projectionMatrix.elements,wt=tt.projectionMatrix.elements,le=Dt[14]/(Dt[10]-1),Ht=Dt[14]/(Dt[10]+1),ae=(Dt[9]+1)/Dt[5],$t=(Dt[9]-1)/Dt[5],Zt=(Dt[8]-1)/Dt[0],Le=(wt[8]+1)/wt[0],De=le*Zt,Tt=le*Le,re=Mt/(-Zt+Le),ce=re*-Zt;if(et.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(ce),W.translateZ(re),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert(),Dt[10]===-1)W.projectionMatrix.copy(et.projectionMatrix),W.projectionMatrixInverse.copy(et.projectionMatrixInverse);else{let ge=le+re,B=Ht+re,ln=De-ce,ue=Tt+(Mt-ce),C=ae*Ht/B*ge,_=$t*Ht/B*ge;W.projectionMatrix.makePerspective(ln,ue,C,_,ge,B),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}}function rt(W,et){et===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(et.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(s===null)return;let et=W.near,tt=W.far;g.texture!==null&&(g.depthNear>0&&(et=g.depthNear),g.depthFar>0&&(tt=g.depthFar)),I.near=R.near=A.near=et,I.far=R.far=A.far=tt,(G!==I.near||q!==I.far)&&(s.updateRenderState({depthNear:I.near,depthFar:I.far}),G=I.near,q=I.far),I.layers.mask=W.layers.mask|6,A.layers.mask=I.layers.mask&-5,R.layers.mask=I.layers.mask&-3;let Mt=W.parent,Dt=I.cameras;rt(I,Mt);for(let wt=0;wt<Dt.length;wt++)rt(Dt[wt],Mt);Dt.length===2?it(I,A,R):I.projectionMatrix.copy(A.projectionMatrix),st(W,I,Mt)};function st(W,et,tt){tt===null?W.matrix.copy(et.matrixWorld):(W.matrix.copy(tt.matrixWorld),W.matrix.invert(),W.matrix.multiply(et.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(et.projectionMatrix),W.projectionMatrixInverse.copy(et.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=Vf*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return I},this.getFoveation=function(){if(!(u===null&&p===null))return l},this.setFoveation=function(W){l=W,u!==null&&(u.fixedFoveation=W),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=W)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(I)},this.getCameraTexture=function(W){return f[W]};let Pt=null;function Gt(W,et){if(h=et.getViewerPose(c||r),m=et,h!==null){let tt=h.views;p!==null&&(t.setRenderTargetFramebuffer(y,p.framebuffer),t.setRenderTarget(y));let Mt=!1;tt.length!==I.cameras.length&&(I.cameras.length=0,Mt=!0);for(let Ht=0;Ht<tt.length;Ht++){let ae=tt[Ht],$t=null;if(p!==null)$t=p.getViewport(ae);else{let Le=d.getViewSubImage(u,ae);$t=Le.viewport,Ht===0&&(t.setRenderTargetTextures(y,Le.colorTexture,Le.depthStencilTexture),t.setRenderTarget(y))}let Zt=N[Ht];Zt===void 0&&(Zt=new xn,Zt.layers.enable(Ht),Zt.viewport=new Ne,N[Ht]=Zt),Zt.matrix.fromArray(ae.transform.matrix),Zt.matrix.decompose(Zt.position,Zt.quaternion,Zt.scale),Zt.projectionMatrix.fromArray(ae.projectionMatrix),Zt.projectionMatrixInverse.copy(Zt.projectionMatrix).invert(),Zt.viewport.set($t.x,$t.y,$t.width,$t.height),Ht===0&&(I.matrix.copy(Zt.matrix),I.matrix.decompose(I.position,I.quaternion,I.scale)),Mt===!0&&I.cameras.push(Zt)}let Dt=s.enabledFeatures;if(Dt&&Dt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&S){d=i.getBinding();let Ht=d.getDepthInformation(tt[0]);Ht&&Ht.isValid&&Ht.texture&&g.init(Ht,s.renderState)}if(Dt&&Dt.includes("camera-access")&&S){t.state.unbindTexture(),d=i.getBinding();for(let Ht=0;Ht<tt.length;Ht++){let ae=tt[Ht].camera;if(ae){let $t=f[ae];$t||($t=new Hc,f[ae]=$t);let Zt=d.getCameraImage(ae);$t.sourceTexture=Zt}}}}for(let tt=0;tt<M.length;tt++){let Mt=w[tt],Dt=M[tt];Mt!==null&&Dt!==void 0&&Dt.update(Mt,et,c||r)}Pt&&Pt(W,et),et.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:et}),m=null}let vt=new yw;vt.setAnimationLoop(Gt),this.setAnimationLoop=function(W){Pt=W},this.dispose=function(){}}},oD=new fe,ww=new Vt;ww.set(-1,0,0,0,1,0,0,0,1);function lD(e,t){function n(g,f){g.matrixAutoUpdate===!0&&g.updateMatrix(),f.value.copy(g.matrix)}function i(g,f){f.color.getRGB(g.fogColor.value,_v(e)),f.isFog?(g.fogNear.value=f.near,g.fogFar.value=f.far):f.isFogExp2&&(g.fogDensity.value=f.density)}function s(g,f,v,x,y){f.isNodeMaterial?f.uniformsNeedUpdate=!1:f.isMeshBasicMaterial?a(g,f):f.isMeshLambertMaterial?(a(g,f),f.envMap&&(g.envMapIntensity.value=f.envMapIntensity)):f.isMeshToonMaterial?(a(g,f),d(g,f)):f.isMeshPhongMaterial?(a(g,f),h(g,f),f.envMap&&(g.envMapIntensity.value=f.envMapIntensity)):f.isMeshStandardMaterial?(a(g,f),u(g,f),f.isMeshPhysicalMaterial&&p(g,f,y)):f.isMeshMatcapMaterial?(a(g,f),m(g,f)):f.isMeshDepthMaterial?a(g,f):f.isMeshDistanceMaterial?(a(g,f),S(g,f)):f.isMeshNormalMaterial?a(g,f):f.isLineBasicMaterial?(r(g,f),f.isLineDashedMaterial&&o(g,f)):f.isPointsMaterial?l(g,f,v,x):f.isSpriteMaterial?c(g,f):f.isShadowMaterial?(g.color.value.copy(f.color),g.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function a(g,f){g.opacity.value=f.opacity,f.color&&g.diffuse.value.copy(f.color),f.emissive&&g.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(g.map.value=f.map,n(f.map,g.mapTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,n(f.alphaMap,g.alphaMapTransform)),f.bumpMap&&(g.bumpMap.value=f.bumpMap,n(f.bumpMap,g.bumpMapTransform),g.bumpScale.value=f.bumpScale,f.side===Vn&&(g.bumpScale.value*=-1)),f.normalMap&&(g.normalMap.value=f.normalMap,n(f.normalMap,g.normalMapTransform),g.normalScale.value.copy(f.normalScale),f.side===Vn&&g.normalScale.value.negate()),f.displacementMap&&(g.displacementMap.value=f.displacementMap,n(f.displacementMap,g.displacementMapTransform),g.displacementScale.value=f.displacementScale,g.displacementBias.value=f.displacementBias),f.emissiveMap&&(g.emissiveMap.value=f.emissiveMap,n(f.emissiveMap,g.emissiveMapTransform)),f.specularMap&&(g.specularMap.value=f.specularMap,n(f.specularMap,g.specularMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest);let v=t.get(f),x=v.envMap,y=v.envMapRotation;x&&(g.envMap.value=x,g.envMapRotation.value.setFromMatrix4(oD.makeRotationFromEuler(y)).transpose(),x.isCubeTexture&&x.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(ww),g.reflectivity.value=f.reflectivity,g.ior.value=f.ior,g.refractionRatio.value=f.refractionRatio),f.lightMap&&(g.lightMap.value=f.lightMap,g.lightMapIntensity.value=f.lightMapIntensity,n(f.lightMap,g.lightMapTransform)),f.aoMap&&(g.aoMap.value=f.aoMap,g.aoMapIntensity.value=f.aoMapIntensity,n(f.aoMap,g.aoMapTransform))}function r(g,f){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,f.map&&(g.map.value=f.map,n(f.map,g.mapTransform))}function o(g,f){g.dashSize.value=f.dashSize,g.totalSize.value=f.dashSize+f.gapSize,g.scale.value=f.scale}function l(g,f,v,x){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,g.size.value=f.size*v,g.scale.value=x*.5,f.map&&(g.map.value=f.map,n(f.map,g.uvTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,n(f.alphaMap,g.alphaMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest)}function c(g,f){g.diffuse.value.copy(f.color),g.opacity.value=f.opacity,g.rotation.value=f.rotation,f.map&&(g.map.value=f.map,n(f.map,g.mapTransform)),f.alphaMap&&(g.alphaMap.value=f.alphaMap,n(f.alphaMap,g.alphaMapTransform)),f.alphaTest>0&&(g.alphaTest.value=f.alphaTest)}function h(g,f){g.specular.value.copy(f.specular),g.shininess.value=Math.max(f.shininess,1e-4)}function d(g,f){f.gradientMap&&(g.gradientMap.value=f.gradientMap)}function u(g,f){g.metalness.value=f.metalness,f.metalnessMap&&(g.metalnessMap.value=f.metalnessMap,n(f.metalnessMap,g.metalnessMapTransform)),g.roughness.value=f.roughness,f.roughnessMap&&(g.roughnessMap.value=f.roughnessMap,n(f.roughnessMap,g.roughnessMapTransform)),f.envMap&&(g.envMapIntensity.value=f.envMapIntensity)}function p(g,f,v){g.ior.value=f.ior,f.sheen>0&&(g.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),g.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(g.sheenColorMap.value=f.sheenColorMap,n(f.sheenColorMap,g.sheenColorMapTransform)),f.sheenRoughnessMap&&(g.sheenRoughnessMap.value=f.sheenRoughnessMap,n(f.sheenRoughnessMap,g.sheenRoughnessMapTransform))),f.clearcoat>0&&(g.clearcoat.value=f.clearcoat,g.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(g.clearcoatMap.value=f.clearcoatMap,n(f.clearcoatMap,g.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,n(f.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(g.clearcoatNormalMap.value=f.clearcoatNormalMap,n(f.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===Vn&&g.clearcoatNormalScale.value.negate())),f.dispersion>0&&(g.dispersion.value=f.dispersion),f.iridescence>0&&(g.iridescence.value=f.iridescence,g.iridescenceIOR.value=f.iridescenceIOR,g.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(g.iridescenceMap.value=f.iridescenceMap,n(f.iridescenceMap,g.iridescenceMapTransform)),f.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=f.iridescenceThicknessMap,n(f.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),f.transmission>0&&(g.transmission.value=f.transmission,g.transmissionSamplerMap.value=v.texture,g.transmissionSamplerSize.value.set(v.width,v.height),f.transmissionMap&&(g.transmissionMap.value=f.transmissionMap,n(f.transmissionMap,g.transmissionMapTransform)),g.thickness.value=f.thickness,f.thicknessMap&&(g.thicknessMap.value=f.thicknessMap,n(f.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=f.attenuationDistance,g.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(g.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(g.anisotropyMap.value=f.anisotropyMap,n(f.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=f.specularIntensity,g.specularColor.value.copy(f.specularColor),f.specularColorMap&&(g.specularColorMap.value=f.specularColorMap,n(f.specularColorMap,g.specularColorMapTransform)),f.specularIntensityMap&&(g.specularIntensityMap.value=f.specularIntensityMap,n(f.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,f){f.matcap&&(g.matcap.value=f.matcap)}function S(g,f){let v=t.get(f).light;g.referencePosition.value.setFromMatrixPosition(v.matrixWorld),g.nearDistance.value=v.shadow.camera.near,g.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function cD(e,t,n,i){let s={},a={},r=[],o=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,M){let w=M.program;i.uniformBlockBinding(y,w)}function c(y,M){let w=s[y.id];w===void 0&&(g(y),w=h(y),s[y.id]=w,y.addEventListener("dispose",v));let E=M.program;i.updateUBOMapping(y,E);let b=t.render.frame;a[y.id]!==b&&(u(y),a[y.id]=b)}function h(y){let M=d();y.__bindingPointIndex=M;let w=e.createBuffer(),E=y.__size,b=y.usage;return e.bindBuffer(e.UNIFORM_BUFFER,w),e.bufferData(e.UNIFORM_BUFFER,E,b),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,M,w),w}function d(){for(let y=0;y<o;y++)if(r.indexOf(y)===-1)return r.push(y),y;return zt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(y){let M=s[y.id],w=y.uniforms,E=y.__cache;e.bindBuffer(e.UNIFORM_BUFFER,M);for(let b=0,A=w.length;b<A;b++){let R=w[b];if(Array.isArray(R))for(let N=0,I=R.length;N<I;N++)p(R[N],b,N,E);else p(R,b,0,E)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(y,M,w,E){if(S(y,M,w,E)===!0){let b=y.__offset,A=y.value;if(Array.isArray(A)){let R=0;for(let N=0;N<A.length;N++){let I=A[N],G=f(I);m(I,y.__data,R),typeof I!="number"&&typeof I!="boolean"&&!I.isMatrix3&&!ArrayBuffer.isView(I)&&(R+=G.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(A,y.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,b,y.__data)}}function m(y,M,w){typeof y=="number"||typeof y=="boolean"?M[0]=y:y.isMatrix3?(M[0]=y.elements[0],M[1]=y.elements[1],M[2]=y.elements[2],M[3]=0,M[4]=y.elements[3],M[5]=y.elements[4],M[6]=y.elements[5],M[7]=0,M[8]=y.elements[6],M[9]=y.elements[7],M[10]=y.elements[8],M[11]=0):ArrayBuffer.isView(y)?M.set(new y.constructor(y.buffer,y.byteOffset,M.length)):y.toArray(M,w)}function S(y,M,w,E){let b=y.value,A=M+"_"+w;if(E[A]===void 0)return typeof b=="number"||typeof b=="boolean"?E[A]=b:ArrayBuffer.isView(b)?E[A]=b.slice():E[A]=b.clone(),!0;{let R=E[A];if(typeof b=="number"||typeof b=="boolean"){if(R!==b)return E[A]=b,!0}else{if(ArrayBuffer.isView(b))return!0;if(R.equals(b)===!1)return R.copy(b),!0}}return!1}function g(y){let M=y.uniforms,w=0,E=16;for(let A=0,R=M.length;A<R;A++){let N=Array.isArray(M[A])?M[A]:[M[A]];for(let I=0,G=N.length;I<G;I++){let q=N[I],O=Array.isArray(q.value)?q.value:[q.value];for(let H=0,D=O.length;H<D;H++){let X=O[H],Q=f(X),it=w%E,rt=it%Q.boundary,st=it+rt;w+=rt,st!==0&&E-st<Q.storage&&(w+=E-st),q.__data=new Float32Array(Q.storage/Float32Array.BYTES_PER_ELEMENT),q.__offset=w,w+=Q.storage}}}let b=w%E;return b>0&&(w+=E-b),y.__size=w,y.__cache={},this}function f(y){let M={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(M.boundary=4,M.storage=4):y.isVector2?(M.boundary=8,M.storage=8):y.isVector3||y.isColor?(M.boundary=16,M.storage=12):y.isVector4?(M.boundary=16,M.storage=16):y.isMatrix3?(M.boundary=48,M.storage=48):y.isMatrix4?(M.boundary=64,M.storage=64):y.isTexture?It("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(M.boundary=16,M.storage=y.byteLength):It("WebGLRenderer: Unsupported uniform value type.",y),M}function v(y){let M=y.target;M.removeEventListener("dispose",v);let w=r.indexOf(M.__bindingPointIndex);r.splice(w,1),e.deleteBuffer(s[M.id]),delete s[M.id],delete a[M.id]}function x(){for(let y in s)e.deleteBuffer(s[y]);r=[],s={},a={}}return{bind:l,update:c,dispose:x}}var uD=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Ss=null;function hD(){return Ss===null&&(Ss=new Bc(uD,16,16,tr,bs),Ss.name="DFG_LUT",Ss.minFilter=on,Ss.magFilter=on,Ss.wrapS=ds,Ss.wrapT=ds,Ss.generateMipmaps=!1,Ss.needsUpdate=!0),Ss}var ws=class{constructor(t={}){let{canvas:n=kM(),context:i=null,depth:s=!0,stencil:a=!1,alpha:r=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:p=$n}=t;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext!="undefined"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=i.getContextAttributes().alpha}else m=r;let S=p,g=new Set([Ad,Td,Ed]),f=new Set([$n,Ki,ol,ll,Sd,Md]),v=new Uint32Array(4),x=new Int32Array(4),y=new L,M=null,w=null,E=[],b=[],A=null;this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ji,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,N=!1,I=null,G=null,q=null,O=null;this._outputColorSpace=Fn;let H=0,D=0,X=null,Q=-1,it=null,rt=new Ne,st=new Ne,Pt=null,Gt=new Ot(0),vt=0,W=n.width,et=n.height,tt=1,Mt=null,Dt=null,wt=new Ne(0,0,W,et),le=new Ne(0,0,W,et),Ht=!1,ae=new $o,$t=!1,Zt=!1,Le=new fe,De=new L,Tt=new Ne,re={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ce=!1;function ge(){return X===null?tt:1}let B=i;function ln(T,z){return n.getContext(T,z)}try{let T={alpha:!0,depth:s,stencil:a,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${"185"}`),n.addEventListener("webglcontextlost",Xe,!1),n.addEventListener("webglcontextrestored",Ue,!1),n.addEventListener("webglcontextcreationerror",ji,!1),B===null){let z="webgl2";if(B=ln(z,T),B===null)throw ln(z)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}}catch(T){throw zt("WebGLRenderer: "+T.message),T}let ue,C,_,U,F,Z,at,ot,J,K,lt,At,ft,ut,Ut,Bt,Wt,P,ct,j,ht,gt,nt;function Et(){ue=new yN(B),ue.init(),ht=new sD(B,ue),C=new uN(B,ue,t,ht),_=new nD(B,ue),C.reversedDepthBuffer&&u&&_.buffers.depth.setReversed(!0),G=B.createFramebuffer(),q=B.createFramebuffer(),O=B.createFramebuffer(),U=new bN(B),F=new GL,Z=new iD(B,ue,_,F,C,ht,U),at=new vN(R),ot=new EC(B),gt=new lN(B,ot),J=new xN(B,ot,U,gt),K=new MN(B,J,ot,gt,U),P=new SN(B,C,Z),Ut=new hN(F),lt=new VL(R,at,ue,C,gt,Ut),At=new lD(R,F),ft=new WL,ut=new KL(ue),Wt=new oN(R,at,_,K,m,l),Bt=new eD(R,K,C),nt=new cD(B,U,C,_),ct=new cN(B,ue,U),j=new _N(B,ue,U),U.programs=lt.programs,R.capabilities=C,R.extensions=ue,R.properties=F,R.renderLists=ft,R.shadowMap=Bt,R.state=_,R.info=U}Et(),S!==$n&&(A=new EN(S,n.width,n.height,o,s,a));let _t=new kv(R,B);this.xr=_t,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let T=ue.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=ue.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return tt},this.setPixelRatio=function(T){T!==void 0&&(tt=T,this.setSize(W,et,!1))},this.getSize=function(T){return T.set(W,et)},this.setSize=function(T,z,Y=!0){if(_t.isPresenting){It("WebGLRenderer: Can't change size while VR device is presenting.");return}W=T,et=z,n.width=Math.floor(T*tt),n.height=Math.floor(z*tt),Y===!0&&(n.style.width=T+"px",n.style.height=z+"px"),A!==null&&A.setSize(n.width,n.height),this.setViewport(0,0,T,z)},this.getDrawingBufferSize=function(T){return T.set(W*tt,et*tt).floor()},this.setDrawingBufferSize=function(T,z,Y){W=T,et=z,tt=Y,n.width=Math.floor(T*Y),n.height=Math.floor(z*Y),this.setViewport(0,0,T,z)},this.setEffects=function(T){if(S===$n){zt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(T){for(let z=0;z<T.length;z++)if(T[z].isOutputPass===!0){It("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}A.setEffects(T||[])},this.getCurrentViewport=function(T){return T.copy(rt)},this.getViewport=function(T){return T.copy(wt)},this.setViewport=function(T,z,Y,V){T.isVector4?wt.set(T.x,T.y,T.z,T.w):wt.set(T,z,Y,V),_.viewport(rt.copy(wt).multiplyScalar(tt).round())},this.getScissor=function(T){return T.copy(le)},this.setScissor=function(T,z,Y,V){T.isVector4?le.set(T.x,T.y,T.z,T.w):le.set(T,z,Y,V),_.scissor(st.copy(le).multiplyScalar(tt).round())},this.getScissorTest=function(){return Ht},this.setScissorTest=function(T){_.setScissorTest(Ht=T)},this.setOpaqueSort=function(T){Mt=T},this.setTransparentSort=function(T){Dt=T},this.getClearColor=function(T){return T.copy(Wt.getClearColor())},this.setClearColor=function(){Wt.setClearColor(...arguments)},this.getClearAlpha=function(){return Wt.getClearAlpha()},this.setClearAlpha=function(){Wt.setClearAlpha(...arguments)},this.clear=function(T=!0,z=!0,Y=!0){let V=0;if(T){let k=!1;if(X!==null){let mt=X.texture.format;k=g.has(mt)}if(k){let mt=X.texture.type,xt=f.has(mt),pt=Wt.getClearColor(),bt=Wt.getClearAlpha(),Ct=pt.r,Xt=pt.g,Qt=pt.b;xt?(v[0]=Ct,v[1]=Xt,v[2]=Qt,v[3]=bt,B.clearBufferuiv(B.COLOR,0,v)):(x[0]=Ct,x[1]=Xt,x[2]=Qt,x[3]=bt,B.clearBufferiv(B.COLOR,0,x))}else V|=B.COLOR_BUFFER_BIT}z&&(V|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&(V|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V!==0&&B.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(T){T.setRenderer(this),I=T},this.dispose=function(){n.removeEventListener("webglcontextlost",Xe,!1),n.removeEventListener("webglcontextrestored",Ue,!1),n.removeEventListener("webglcontextcreationerror",ji,!1),Wt.dispose(),ft.dispose(),ut.dispose(),F.dispose(),at.dispose(),K.dispose(),gt.dispose(),nt.dispose(),lt.dispose(),_t.dispose(),_t.removeEventListener("sessionstart",jv),_t.removeEventListener("sessionend",$v),ir.stop()};function Xe(T){T.preventDefault(),yv("WebGLRenderer: Context Lost."),N=!0}function Ue(){yv("WebGLRenderer: Context Restored."),N=!1;let T=U.autoReset,z=Bt.enabled,Y=Bt.autoUpdate,V=Bt.needsUpdate,k=Bt.type;Et(),U.autoReset=T,Bt.enabled=z,Bt.autoUpdate=Y,Bt.needsUpdate=V,Bt.type=k}function ji(T){zt("WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function $i(T){let z=T.target;z.removeEventListener("dispose",$i),rE(z)}function rE(T){oE(T),F.remove(T)}function oE(T){let z=F.get(T).programs;z!==void 0&&(z.forEach(function(Y){lt.releaseProgram(Y)}),T.isShaderMaterial&&lt.releaseShaderCache(T))}this.renderBufferDirect=function(T,z,Y,V,k,mt){z===null&&(z=re);let xt=k.isMesh&&k.matrixWorld.determinantAffine()<0,pt=uE(T,z,Y,V,k);_.setMaterial(V,xt);let bt=Y.index,Ct=1;if(V.wireframe===!0){if(bt=J.getWireframeAttribute(Y),bt===void 0)return;Ct=2}let Xt=Y.drawRange,Qt=Y.attributes.position,Nt=Xt.start*Ct,_e=(Xt.start+Xt.count)*Ct;mt!==null&&(Nt=Math.max(Nt,mt.start*Ct),_e=Math.min(_e,(mt.start+mt.count)*Ct)),bt!==null?(Nt=Math.max(Nt,0),_e=Math.min(_e,bt.count)):Qt!=null&&(Nt=Math.max(Nt,0),_e=Math.min(_e,Qt.count));let Je=_e-Nt;if(Je<0||Je===1/0)return;gt.setup(k,V,pt,Y,bt);let qe,Te=ct;if(bt!==null&&(qe=ot.get(bt),Te=j,Te.setIndex(qe)),k.isMesh)V.wireframe===!0?(_.setLineWidth(V.wireframeLinewidth*ge()),Te.setMode(B.LINES)):Te.setMode(B.TRIANGLES);else if(k.isLine){let Rn=V.linewidth;Rn===void 0&&(Rn=1),_.setLineWidth(Rn*ge()),k.isLineSegments?Te.setMode(B.LINES):k.isLineLoop?Te.setMode(B.LINE_LOOP):Te.setMode(B.LINE_STRIP)}else k.isPoints?Te.setMode(B.POINTS):k.isSprite&&Te.setMode(B.TRIANGLES);if(k.isBatchedMesh)if(ue.get("WEBGL_multi_draw"))Te.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{let Rn=k._multiDrawStarts,yt=k._multiDrawCounts,ei=k._multiDrawCount,he=bt?ot.get(bt).bytesPerElement:1,yi=F.get(V).currentProgram.getUniforms();for(let ts=0;ts<ei;ts++)yi.setValue(B,"_gl_DrawID",ts),Te.render(Rn[ts]/he,yt[ts])}else if(k.isInstancedMesh)Te.renderInstances(Nt,Je,k.count);else if(Y.isInstancedBufferGeometry){let Rn=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,yt=Math.min(Y.instanceCount,Rn);Te.renderInstances(Nt,Je,yt)}else Te.render(Nt,Je)};function Qv(T,z,Y){T.transparent===!0&&T.side===Di&&T.forceSinglePass===!1?(T.side=Vn,T.needsUpdate=!0,hu(T,z,Y),T.side=js,T.needsUpdate=!0,hu(T,z,Y),T.side=Di):hu(T,z,Y)}this.compile=function(T,z,Y=null){Y===null&&(Y=T),w=ut.get(Y),w.init(z),b.push(w),Y.traverseVisible(function(k){k.isLight&&k.layers.test(z.layers)&&(w.pushLight(k),k.castShadow&&w.pushShadow(k))}),T!==Y&&T.traverseVisible(function(k){k.isLight&&k.layers.test(z.layers)&&(w.pushLight(k),k.castShadow&&w.pushShadow(k))}),w.setupLights();let V=new Set;return T.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;let mt=k.material;if(mt)if(Array.isArray(mt))for(let xt=0;xt<mt.length;xt++){let pt=mt[xt];Qv(pt,Y,k),V.add(pt)}else Qv(mt,Y,k),V.add(mt)}),w=b.pop(),V},this.compileAsync=function(T,z,Y=null){let V=this.compile(T,z,Y);return new Promise(k=>{function mt(){if(V.forEach(function(xt){F.get(xt).currentProgram.isReady()&&V.delete(xt)}),V.size===0){k(T);return}setTimeout(mt,10)}ue.get("KHR_parallel_shader_compile")!==null?mt():setTimeout(mt,10)})};let xp=null;function lE(T){xp&&xp(T)}function jv(){ir.stop()}function $v(){ir.start()}let ir=new yw;ir.setAnimationLoop(lE),typeof self!="undefined"&&ir.setContext(self),this.setAnimationLoop=function(T){xp=T,_t.setAnimationLoop(T),T===null?ir.stop():ir.start()},_t.addEventListener("sessionstart",jv),_t.addEventListener("sessionend",$v),this.render=function(T,z){if(z!==void 0&&z.isCamera!==!0){zt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;I!==null&&I.renderStart(T,z);let Y=_t.enabled===!0&&_t.isPresenting===!0,V=A!==null&&(X===null||Y)&&A.begin(R,X);if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),z.parent===null&&z.matrixWorldAutoUpdate===!0&&z.updateMatrixWorld(),_t.enabled===!0&&_t.isPresenting===!0&&(A===null||A.isCompositing()===!1)&&(_t.cameraAutoUpdate===!0&&_t.updateCamera(z),z=_t.getCamera()),T.isScene===!0&&T.onBeforeRender(R,T,z,X),w=ut.get(T,b.length),w.init(z),w.state.textureUnits=Z.getTextureUnits(),b.push(w),Le.multiplyMatrices(z.projectionMatrix,z.matrixWorldInverse),ae.setFromProjectionMatrix(Le,Xi,z.reversedDepth),Zt=this.localClippingEnabled,$t=Ut.init(this.clippingPlanes,Zt),M=ft.get(T,E.length),M.init(),E.push(M),_t.enabled===!0&&_t.isPresenting===!0){let xt=R.xr.getDepthSensingMesh();xt!==null&&_p(xt,z,-1/0,R.sortObjects)}_p(T,z,0,R.sortObjects),M.finish(),R.sortObjects===!0&&M.sort(Mt,Dt,z.reversedDepth),ce=_t.enabled===!1||_t.isPresenting===!1||_t.hasDepthSensing()===!1,ce&&Wt.addToRenderList(M,T),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),$t===!0&&Ut.beginShadows();let k=w.state.shadowsArray;if(Bt.render(k,T,z),$t===!0&&Ut.endShadows(),(V&&A.hasRenderPass())===!1){let xt=M.opaque,pt=M.transmissive;if(w.setupLights(),z.isArrayCamera){let bt=z.cameras;if(pt.length>0)for(let Ct=0,Xt=bt.length;Ct<Xt;Ct++){let Qt=bt[Ct];ey(xt,pt,T,Qt)}ce&&Wt.render(T);for(let Ct=0,Xt=bt.length;Ct<Xt;Ct++){let Qt=bt[Ct];ty(M,T,Qt,Qt.viewport)}}else pt.length>0&&ey(xt,pt,T,z),ce&&Wt.render(T),ty(M,T,z)}X!==null&&D===0&&(Z.updateMultisampleRenderTarget(X),Z.updateRenderTargetMipmap(X)),V&&A.end(R),T.isScene===!0&&T.onAfterRender(R,T,z),gt.resetDefaultState(),Q=-1,it=null,b.pop(),b.length>0?(w=b[b.length-1],Z.setTextureUnits(w.state.textureUnits),$t===!0&&Ut.setGlobalState(R.clippingPlanes,w.state.camera)):w=null,E.pop(),E.length>0?M=E[E.length-1]:M=null,I!==null&&I.renderEnd()};function _p(T,z,Y,V){if(T.visible===!1)return;if(T.layers.test(z.layers)){if(T.isGroup)Y=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(z);else if(T.isLightProbeGrid)w.pushLightProbeGrid(T);else if(T.isLight)w.pushLight(T),T.castShadow&&w.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||ae.intersectsSprite(T)){V&&Tt.setFromMatrixPosition(T.matrixWorld).applyMatrix4(Le);let xt=K.update(T),pt=T.material;pt.visible&&M.push(T,xt,pt,Y,Tt.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||ae.intersectsObject(T))){let xt=K.update(T),pt=T.material;if(V&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Tt.copy(T.boundingSphere.center)):(xt.boundingSphere===null&&xt.computeBoundingSphere(),Tt.copy(xt.boundingSphere.center)),Tt.applyMatrix4(T.matrixWorld).applyMatrix4(Le)),Array.isArray(pt)){let bt=xt.groups;for(let Ct=0,Xt=bt.length;Ct<Xt;Ct++){let Qt=bt[Ct],Nt=pt[Qt.materialIndex];Nt&&Nt.visible&&M.push(T,xt,Nt,Y,Tt.z,Qt)}}else pt.visible&&M.push(T,xt,pt,Y,Tt.z,null)}}let mt=T.children;for(let xt=0,pt=mt.length;xt<pt;xt++)_p(mt[xt],z,Y,V)}function ty(T,z,Y,V){let{opaque:k,transmissive:mt,transparent:xt}=T;w.setupLightsView(Y),$t===!0&&Ut.setGlobalState(R.clippingPlanes,Y),V&&_.viewport(rt.copy(V)),k.length>0&&uu(k,z,Y),mt.length>0&&uu(mt,z,Y),xt.length>0&&uu(xt,z,Y),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function ey(T,z,Y,V){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[V.id]===void 0){let Nt=ue.has("EXT_color_buffer_half_float")||ue.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[V.id]=new pi(1,1,{generateMipmaps:!0,type:Nt?bs:$n,minFilter:ja,samples:Math.max(4,C.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:se.workingColorSpace})}let mt=w.state.transmissionRenderTarget[V.id],xt=V.viewport||rt;mt.setSize(xt.z*R.transmissionResolutionScale,xt.w*R.transmissionResolutionScale);let pt=R.getRenderTarget(),bt=R.getActiveCubeFace(),Ct=R.getActiveMipmapLevel();R.setRenderTarget(mt),R.getClearColor(Gt),vt=R.getClearAlpha(),vt<1&&R.setClearColor(16777215,.5),R.clear(),ce&&Wt.render(Y);let Xt=R.toneMapping;R.toneMapping=Ji;let Qt=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),w.setupLightsView(V),$t===!0&&Ut.setGlobalState(R.clippingPlanes,V),uu(T,Y,V),Z.updateMultisampleRenderTarget(mt),Z.updateRenderTargetMipmap(mt),ue.has("WEBGL_multisampled_render_to_texture")===!1){let Nt=!1;for(let _e=0,Je=z.length;_e<Je;_e++){let qe=z[_e],{object:Te,geometry:Rn,material:yt,group:ei}=qe;if(yt.side===Di&&Te.layers.test(V.layers)){let he=yt.side;yt.side=Vn,yt.needsUpdate=!0,ny(Te,Y,V,Rn,yt,ei),yt.side=he,yt.needsUpdate=!0,Nt=!0}}Nt===!0&&(Z.updateMultisampleRenderTarget(mt),Z.updateRenderTargetMipmap(mt))}R.setRenderTarget(pt,bt,Ct),R.setClearColor(Gt,vt),Qt!==void 0&&(V.viewport=Qt),R.toneMapping=Xt}function uu(T,z,Y){let V=z.isScene===!0?z.overrideMaterial:null;for(let k=0,mt=T.length;k<mt;k++){let xt=T[k],{object:pt,geometry:bt,group:Ct}=xt,Xt=xt.material;Xt.allowOverride===!0&&V!==null&&(Xt=V),pt.layers.test(Y.layers)&&ny(pt,z,Y,bt,Xt,Ct)}}function ny(T,z,Y,V,k,mt){T.onBeforeRender(R,z,Y,V,k,mt),T.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),k.onBeforeRender(R,z,Y,V,T,mt),k.transparent===!0&&k.side===Di&&k.forceSinglePass===!1?(k.side=Vn,k.needsUpdate=!0,R.renderBufferDirect(Y,z,V,k,T,mt),k.side=js,k.needsUpdate=!0,R.renderBufferDirect(Y,z,V,k,T,mt),k.side=Di):R.renderBufferDirect(Y,z,V,k,T,mt),T.onAfterRender(R,z,Y,V,k,mt)}function hu(T,z,Y){z.isScene!==!0&&(z=re);let V=F.get(T),k=w.state.lights,mt=w.state.shadowsArray,xt=k.state.version,pt=lt.getParameters(T,k.state,mt,z,Y,w.state.lightProbeGridArray),bt=lt.getProgramCacheKey(pt),Ct=V.programs;V.environment=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?z.environment:null,V.fog=z.fog;let Xt=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap;V.envMap=at.get(T.envMap||V.environment,Xt),V.envMapRotation=V.environment!==null&&T.envMap===null?z.environmentRotation:T.envMapRotation,Ct===void 0&&(T.addEventListener("dispose",$i),Ct=new Map,V.programs=Ct);let Qt=Ct.get(bt);if(Qt!==void 0){if(V.currentProgram===Qt&&V.lightsStateVersion===xt)return sy(T,pt),Qt}else pt.uniforms=lt.getUniforms(T),I!==null&&T.isNodeMaterial&&I.build(T,Y,pt),T.onBeforeCompile(pt,R),Qt=lt.acquireProgram(pt,bt),Ct.set(bt,Qt),V.uniforms=pt.uniforms;let Nt=V.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Nt.clippingPlanes=Ut.uniform),sy(T,pt),V.needsLights=fE(T),V.lightsStateVersion=xt,V.needsLights&&(Nt.ambientLightColor.value=k.state.ambient,Nt.lightProbe.value=k.state.probe,Nt.directionalLights.value=k.state.directional,Nt.directionalLightShadows.value=k.state.directionalShadow,Nt.spotLights.value=k.state.spot,Nt.spotLightShadows.value=k.state.spotShadow,Nt.rectAreaLights.value=k.state.rectArea,Nt.ltc_1.value=k.state.rectAreaLTC1,Nt.ltc_2.value=k.state.rectAreaLTC2,Nt.pointLights.value=k.state.point,Nt.pointLightShadows.value=k.state.pointShadow,Nt.hemisphereLights.value=k.state.hemi,Nt.directionalShadowMatrix.value=k.state.directionalShadowMatrix,Nt.spotLightMatrix.value=k.state.spotLightMatrix,Nt.spotLightMap.value=k.state.spotLightMap,Nt.pointShadowMatrix.value=k.state.pointShadowMatrix),V.lightProbeGrid=w.state.lightProbeGridArray.length>0,V.currentProgram=Qt,V.uniformsList=null,Qt}function iy(T){if(T.uniformsList===null){let z=T.currentProgram.getUniforms();T.uniformsList=ul.seqWithValue(z.seq,T.uniforms)}return T.uniformsList}function sy(T,z){let Y=F.get(T);Y.outputColorSpace=z.outputColorSpace,Y.batching=z.batching,Y.batchingColor=z.batchingColor,Y.instancing=z.instancing,Y.instancingColor=z.instancingColor,Y.instancingMorph=z.instancingMorph,Y.skinning=z.skinning,Y.morphTargets=z.morphTargets,Y.morphNormals=z.morphNormals,Y.morphColors=z.morphColors,Y.morphTargetsCount=z.morphTargetsCount,Y.numClippingPlanes=z.numClippingPlanes,Y.numIntersection=z.numClipIntersection,Y.vertexAlphas=z.vertexAlphas,Y.vertexTangents=z.vertexTangents,Y.toneMapping=z.toneMapping}function cE(T,z){if(T.length===0)return null;if(T.length===1)return T[0].texture!==null?T[0]:null;y.setFromMatrixPosition(z.matrixWorld);for(let Y=0,V=T.length;Y<V;Y++){let k=T[Y];if(k.texture!==null&&k.boundingBox.containsPoint(y))return k}return null}function uE(T,z,Y,V,k){z.isScene!==!0&&(z=re),Z.resetTextureUnits();let mt=z.fog,xt=V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial?z.environment:null,pt=X===null?R.outputColorSpace:X.isXRRenderTarget===!0?X.texture.colorSpace:se.workingColorSpace,bt=V.isMeshStandardMaterial||V.isMeshLambertMaterial&&!V.envMap||V.isMeshPhongMaterial&&!V.envMap,Ct=at.get(V.envMap||xt,bt),Xt=V.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,Qt=!!Y.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Nt=!!Y.morphAttributes.position,_e=!!Y.morphAttributes.normal,Je=!!Y.morphAttributes.color,qe=Ji;V.toneMapped&&(X===null||X.isXRRenderTarget===!0)&&(qe=R.toneMapping);let Te=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,Rn=Te!==void 0?Te.length:0,yt=F.get(V),ei=w.state.lights;if($t===!0&&(Zt===!0||T!==it)){let Ie=T===it&&V.id===Q;Ut.setState(V,T,Ie)}let he=!1;V.version===yt.__version?(yt.needsLights&&yt.lightsStateVersion!==ei.state.version||yt.outputColorSpace!==pt||k.isBatchedMesh&&yt.batching===!1||!k.isBatchedMesh&&yt.batching===!0||k.isBatchedMesh&&yt.batchingColor===!0&&k.colorTexture===null||k.isBatchedMesh&&yt.batchingColor===!1&&k.colorTexture!==null||k.isInstancedMesh&&yt.instancing===!1||!k.isInstancedMesh&&yt.instancing===!0||k.isSkinnedMesh&&yt.skinning===!1||!k.isSkinnedMesh&&yt.skinning===!0||k.isInstancedMesh&&yt.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&yt.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&yt.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&yt.instancingMorph===!1&&k.morphTexture!==null||yt.envMap!==Ct||V.fog===!0&&yt.fog!==mt||yt.numClippingPlanes!==void 0&&(yt.numClippingPlanes!==Ut.numPlanes||yt.numIntersection!==Ut.numIntersection)||yt.vertexAlphas!==Xt||yt.vertexTangents!==Qt||yt.morphTargets!==Nt||yt.morphNormals!==_e||yt.morphColors!==Je||yt.toneMapping!==qe||yt.morphTargetsCount!==Rn||!!yt.lightProbeGrid!=w.state.lightProbeGridArray.length>0)&&(he=!0):(he=!0,yt.__version=V.version);let yi=yt.currentProgram;he===!0&&(yi=hu(V,z,k),I&&V.isNodeMaterial&&I.onUpdateProgram(V,yi,yt));let ts=!1,sa=!1,zr=!1,Ae=yi.getUniforms(),Ke=yt.uniforms;if(_.useProgram(yi.program)&&(ts=!0,sa=!0,zr=!0),V.id!==Q&&(Q=V.id,sa=!0),yt.needsLights){let Ie=cE(w.state.lightProbeGridArray,k);yt.lightProbeGrid!==Ie&&(yt.lightProbeGrid=Ie,sa=!0)}if(ts||it!==T){_.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),Ae.setValue(B,"projectionMatrix",T.projectionMatrix),Ae.setValue(B,"viewMatrix",T.matrixWorldInverse);let ra=Ae.map.cameraPosition;ra!==void 0&&ra.setValue(B,De.setFromMatrixPosition(T.matrixWorld)),C.logarithmicDepthBuffer&&Ae.setValue(B,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&Ae.setValue(B,"isOrthographic",T.isOrthographicCamera===!0),it!==T&&(it=T,sa=!0,zr=!0)}if(yt.needsLights&&(ei.state.directionalShadowMap.length>0&&Ae.setValue(B,"directionalShadowMap",ei.state.directionalShadowMap,Z),ei.state.spotShadowMap.length>0&&Ae.setValue(B,"spotShadowMap",ei.state.spotShadowMap,Z),ei.state.pointShadowMap.length>0&&Ae.setValue(B,"pointShadowMap",ei.state.pointShadowMap,Z)),k.isSkinnedMesh){Ae.setOptional(B,k,"bindMatrix"),Ae.setOptional(B,k,"bindMatrixInverse");let Ie=k.skeleton;Ie&&(Ie.boneTexture===null&&Ie.computeBoneTexture(),Ae.setValue(B,"boneTexture",Ie.boneTexture,Z))}k.isBatchedMesh&&(Ae.setOptional(B,k,"batchingTexture"),Ae.setValue(B,"batchingTexture",k._matricesTexture,Z),Ae.setOptional(B,k,"batchingIdTexture"),Ae.setValue(B,"batchingIdTexture",k._indirectTexture,Z),Ae.setOptional(B,k,"batchingColorTexture"),k._colorsTexture!==null&&Ae.setValue(B,"batchingColorTexture",k._colorsTexture,Z));let aa=Y.morphAttributes;if((aa.position!==void 0||aa.normal!==void 0||aa.color!==void 0)&&P.update(k,Y,yi),(sa||yt.receiveShadow!==k.receiveShadow)&&(yt.receiveShadow=k.receiveShadow,Ae.setValue(B,"receiveShadow",k.receiveShadow)),(V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial)&&V.envMap===null&&z.environment!==null&&(Ke.envMapIntensity.value=z.environmentIntensity),Ke.dfgLUT!==void 0&&(Ke.dfgLUT.value=hD()),sa){if(Ae.setValue(B,"toneMappingExposure",R.toneMappingExposure),yt.needsLights&&hE(Ke,zr),mt&&V.fog===!0&&At.refreshFogUniforms(Ke,mt),At.refreshMaterialUniforms(Ke,V,tt,et,w.state.transmissionRenderTarget[T.id]),yt.needsLights&&yt.lightProbeGrid){let Ie=yt.lightProbeGrid;Ke.probesSH.value=Ie.texture,Ke.probesMin.value.copy(Ie.boundingBox.min),Ke.probesMax.value.copy(Ie.boundingBox.max),Ke.probesResolution.value.copy(Ie.resolution)}ul.upload(B,iy(yt),Ke,Z)}if(V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(ul.upload(B,iy(yt),Ke,Z),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&Ae.setValue(B,"center",k.center),Ae.setValue(B,"modelViewMatrix",k.modelViewMatrix),Ae.setValue(B,"normalMatrix",k.normalMatrix),Ae.setValue(B,"modelMatrix",k.matrixWorld),V.uniformsGroups!==void 0){let Ie=V.uniformsGroups;for(let ra=0,Fr=Ie.length;ra<Fr;ra++){let ay=Ie[ra];nt.update(ay,yi),nt.bind(ay,yi)}}return yi}function hE(T,z){T.ambientLightColor.needsUpdate=z,T.lightProbe.needsUpdate=z,T.directionalLights.needsUpdate=z,T.directionalLightShadows.needsUpdate=z,T.pointLights.needsUpdate=z,T.pointLightShadows.needsUpdate=z,T.spotLights.needsUpdate=z,T.spotLightShadows.needsUpdate=z,T.rectAreaLights.needsUpdate=z,T.hemisphereLights.needsUpdate=z}function fE(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return H},this.getActiveMipmapLevel=function(){return D},this.getRenderTarget=function(){return X},this.setRenderTargetTextures=function(T,z,Y){let V=F.get(T);V.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),F.get(T.texture).__webglTexture=z,F.get(T.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:Y,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,z){let Y=F.get(T);Y.__webglFramebuffer=z,Y.__useDefaultFramebuffer=z===void 0},this.setRenderTarget=function(T,z=0,Y=0){X=T,H=z,D=Y;let V=null,k=!1,mt=!1;if(T){let pt=F.get(T);if(pt.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(B.FRAMEBUFFER,pt.__webglFramebuffer),rt.copy(T.viewport),st.copy(T.scissor),Pt=T.scissorTest,_.viewport(rt),_.scissor(st),_.setScissorTest(Pt),Q=-1;return}else if(pt.__webglFramebuffer===void 0)Z.setupRenderTarget(T);else if(pt.__hasExternalTextures)Z.rebindTextures(T,F.get(T.texture).__webglTexture,F.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let Xt=T.depthTexture;if(pt.__boundDepthTexture!==Xt){if(Xt!==null&&F.has(Xt)&&(T.width!==Xt.image.width||T.height!==Xt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Z.setupDepthRenderbuffer(T)}}let bt=T.texture;(bt.isData3DTexture||bt.isDataArrayTexture||bt.isCompressedArrayTexture)&&(mt=!0);let Ct=F.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Ct[z])?V=Ct[z][Y]:V=Ct[z],k=!0):T.samples>0&&Z.useMultisampledRTT(T)===!1?V=F.get(T).__webglMultisampledFramebuffer:Array.isArray(Ct)?V=Ct[Y]:V=Ct,rt.copy(T.viewport),st.copy(T.scissor),Pt=T.scissorTest}else rt.copy(wt).multiplyScalar(tt).floor(),st.copy(le).multiplyScalar(tt).floor(),Pt=Ht;if(Y!==0&&(V=G),_.bindFramebuffer(B.FRAMEBUFFER,V)&&_.drawBuffers(T,V),_.viewport(rt),_.scissor(st),_.setScissorTest(Pt),k){let pt=F.get(T.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+z,pt.__webglTexture,Y)}else if(mt){let pt=z;for(let bt=0;bt<T.textures.length;bt++){let Ct=F.get(T.textures[bt]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+bt,Ct.__webglTexture,Y,pt)}}else if(T!==null&&Y!==0){let pt=F.get(T.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,pt.__webglTexture,Y)}Q=-1},this.readRenderTargetPixels=function(T,z,Y,V,k,mt,xt,pt=0){if(!(T&&T.isWebGLRenderTarget)){zt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let bt=F.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&xt!==void 0&&(bt=bt[xt]),bt){_.bindFramebuffer(B.FRAMEBUFFER,bt);try{let Ct=T.textures[pt],Xt=Ct.format,Qt=Ct.type;if(T.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+pt),!C.textureFormatReadable(Xt)){zt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!C.textureTypeReadable(Qt)){zt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}z>=0&&z<=T.width-V&&Y>=0&&Y<=T.height-k&&B.readPixels(z,Y,V,k,ht.convert(Xt),ht.convert(Qt),mt)}finally{let Ct=X!==null?F.get(X).__webglFramebuffer:null;_.bindFramebuffer(B.FRAMEBUFFER,Ct)}}},this.readRenderTargetPixelsAsync=async function(T,z,Y,V,k,mt,xt,pt=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let bt=F.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&xt!==void 0&&(bt=bt[xt]),bt)if(z>=0&&z<=T.width-V&&Y>=0&&Y<=T.height-k){_.bindFramebuffer(B.FRAMEBUFFER,bt);let Ct=T.textures[pt],Xt=Ct.format,Qt=Ct.type;if(T.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+pt),!C.textureFormatReadable(Xt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!C.textureTypeReadable(Qt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Nt=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,Nt),B.bufferData(B.PIXEL_PACK_BUFFER,mt.byteLength,B.STREAM_READ),B.readPixels(z,Y,V,k,ht.convert(Xt),ht.convert(Qt),0);let _e=X!==null?F.get(X).__webglFramebuffer:null;_.bindFramebuffer(B.FRAMEBUFFER,_e);let Je=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await XM(B,Je,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,Nt),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,mt),B.deleteBuffer(Nt),B.deleteSync(Je),mt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,z=null,Y=0){let V=Math.pow(2,-Y),k=Math.floor(T.image.width*V),mt=Math.floor(T.image.height*V),xt=z!==null?z.x:0,pt=z!==null?z.y:0;Z.setTexture2D(T,0),B.copyTexSubImage2D(B.TEXTURE_2D,Y,0,0,xt,pt,k,mt),_.unbindTexture()},this.copyTextureToTexture=function(T,z,Y=null,V=null,k=0,mt=0){let xt,pt,bt,Ct,Xt,Qt,Nt,_e,Je,qe=T.isCompressedTexture?T.mipmaps[mt]:T.image;if(Y!==null)xt=Y.max.x-Y.min.x,pt=Y.max.y-Y.min.y,bt=Y.isBox3?Y.max.z-Y.min.z:1,Ct=Y.min.x,Xt=Y.min.y,Qt=Y.isBox3?Y.min.z:0;else{let Ke=Math.pow(2,-k);xt=Math.floor(qe.width*Ke),pt=Math.floor(qe.height*Ke),T.isDataArrayTexture?bt=qe.depth:T.isData3DTexture?bt=Math.floor(qe.depth*Ke):bt=1,Ct=0,Xt=0,Qt=0}V!==null?(Nt=V.x,_e=V.y,Je=V.z):(Nt=0,_e=0,Je=0);let Te=ht.convert(z.format),Rn=ht.convert(z.type),yt;z.isData3DTexture?(Z.setTexture3D(z,0),yt=B.TEXTURE_3D):z.isDataArrayTexture||z.isCompressedArrayTexture?(Z.setTexture2DArray(z,0),yt=B.TEXTURE_2D_ARRAY):(Z.setTexture2D(z,0),yt=B.TEXTURE_2D),_.activeTexture(B.TEXTURE0),_.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,z.flipY),_.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),_.pixelStorei(B.UNPACK_ALIGNMENT,z.unpackAlignment);let ei=_.getParameter(B.UNPACK_ROW_LENGTH),he=_.getParameter(B.UNPACK_IMAGE_HEIGHT),yi=_.getParameter(B.UNPACK_SKIP_PIXELS),ts=_.getParameter(B.UNPACK_SKIP_ROWS),sa=_.getParameter(B.UNPACK_SKIP_IMAGES);_.pixelStorei(B.UNPACK_ROW_LENGTH,qe.width),_.pixelStorei(B.UNPACK_IMAGE_HEIGHT,qe.height),_.pixelStorei(B.UNPACK_SKIP_PIXELS,Ct),_.pixelStorei(B.UNPACK_SKIP_ROWS,Xt),_.pixelStorei(B.UNPACK_SKIP_IMAGES,Qt);let zr=T.isDataArrayTexture||T.isData3DTexture,Ae=z.isDataArrayTexture||z.isData3DTexture;if(T.isDepthTexture){let Ke=F.get(T),aa=F.get(z),Ie=F.get(Ke.__renderTarget),ra=F.get(aa.__renderTarget);_.bindFramebuffer(B.READ_FRAMEBUFFER,Ie.__webglFramebuffer),_.bindFramebuffer(B.DRAW_FRAMEBUFFER,ra.__webglFramebuffer);for(let Fr=0;Fr<bt;Fr++)zr&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,F.get(T).__webglTexture,k,Qt+Fr),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,F.get(z).__webglTexture,mt,Je+Fr)),B.blitFramebuffer(Ct,Xt,xt,pt,Nt,_e,xt,pt,B.DEPTH_BUFFER_BIT,B.NEAREST);_.bindFramebuffer(B.READ_FRAMEBUFFER,null),_.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(k!==0||T.isRenderTargetTexture||F.has(T)){let Ke=F.get(T),aa=F.get(z);_.bindFramebuffer(B.READ_FRAMEBUFFER,q),_.bindFramebuffer(B.DRAW_FRAMEBUFFER,O);for(let Ie=0;Ie<bt;Ie++)zr?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Ke.__webglTexture,k,Qt+Ie):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Ke.__webglTexture,k),Ae?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,aa.__webglTexture,mt,Je+Ie):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,aa.__webglTexture,mt),k!==0?B.blitFramebuffer(Ct,Xt,xt,pt,Nt,_e,xt,pt,B.COLOR_BUFFER_BIT,B.NEAREST):Ae?B.copyTexSubImage3D(yt,mt,Nt,_e,Je+Ie,Ct,Xt,xt,pt):B.copyTexSubImage2D(yt,mt,Nt,_e,Ct,Xt,xt,pt);_.bindFramebuffer(B.READ_FRAMEBUFFER,null),_.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else Ae?T.isDataTexture||T.isData3DTexture?B.texSubImage3D(yt,mt,Nt,_e,Je,xt,pt,bt,Te,Rn,qe.data):z.isCompressedArrayTexture?B.compressedTexSubImage3D(yt,mt,Nt,_e,Je,xt,pt,bt,Te,qe.data):B.texSubImage3D(yt,mt,Nt,_e,Je,xt,pt,bt,Te,Rn,qe):T.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,mt,Nt,_e,xt,pt,Te,Rn,qe.data):T.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,mt,Nt,_e,qe.width,qe.height,Te,qe.data):B.texSubImage2D(B.TEXTURE_2D,mt,Nt,_e,xt,pt,Te,Rn,qe);_.pixelStorei(B.UNPACK_ROW_LENGTH,ei),_.pixelStorei(B.UNPACK_IMAGE_HEIGHT,he),_.pixelStorei(B.UNPACK_SKIP_PIXELS,yi),_.pixelStorei(B.UNPACK_SKIP_ROWS,ts),_.pixelStorei(B.UNPACK_SKIP_IMAGES,sa),mt===0&&z.generateMipmaps&&B.generateMipmap(yt),_.unbindTexture()},this.initRenderTarget=function(T){F.get(T).__webglFramebuffer===void 0&&Z.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?Z.setTextureCube(T,0):T.isData3DTexture?Z.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?Z.setTexture2DArray(T,0):Z.setTexture2D(T,0),_.unbindTexture()},this.resetState=function(){H=0,D=0,X=null,_.reset(),gt.reset()},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Xi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let n=this.getContext();n.drawingBufferColorSpace=se._getDrawingBufferColorSpace(t),n.unpackColorSpace=se._getUnpackColorSpace()}};var Ew=329229,cu=12713728,na=120,de=5,Wv=.78,fl=900;function fD(e){let t=e;return()=>{t|=0,t=t+1831565813|0;let n=Math.imul(t^t>>>15,1|t);return n=n+Math.imul(n^n>>>7,61|n)^n,((n^n>>>14)>>>0)/4294967296}}function dp(e){return Math.min(1,Math.max(0,e))}function Tw(e,t,n){let i=dp((n-e)/(t-e));return i*i*(3-2*i)}function Aw(e,t){let n=new ws({canvas:e,antialias:!0,alpha:!1});n.setClearColor(Ew,1);let i=new Yi;i.fog=new Ic(Ew,8,48);let s=new xn(60,1,.1,100);s.position.set(0,0,0),i.add(new Yc(8949952,.8));let a=new al(16777215,1.6);a.position.set(2,3,4),i.add(a);let r=fD(1337),o=[],l=[],c=new mi(1,1,1),h=new Ya({color:1053482,roughness:.6,metalness:.3});o.push(c),l.push(h);let d=Math.floor(na/2.5),p=d*20,m=new Wa(c,h,p),S=new fe,g=new jn,f=new L,v=new L,x=0;for(let _=0;_<d;_++){let U=-_*2.5-2;for(let F=0;F<4;F++)for(let Z=0;Z<5;Z++){let at=(Z-2)*2+(r()-.5)*.3,ot=.4+r()*1.4,J=1.4+r()*.5,K=1.4+r()*.5,lt=de+ot/2-.2;F===0?(v.set(at,lt,U),f.set(J,ot,K)):F===1?(v.set(at,-lt,U),f.set(J,ot,K)):F===2?(v.set(lt,at,U),f.set(ot,J,K)):(v.set(-lt,at,U),f.set(ot,J,K)),S.compose(v,g,f),m.setMatrixAt(x++,S)}}m.instanceMatrix.needsUpdate=!0,i.add(m);let y=[];for(let _=-de;_<=de;_+=2.5)y.push(_,de,0,_,de,-na),y.push(_,-de,0,_,-de,-na),y.push(de,_,0,de,_,-na),y.push(-de,_,0,-de,_,-na);for(let _=0;_>=-na;_-=5)y.push(-de,de,_,de,de,_),y.push(-de,-de,_,de,-de,_),y.push(de,-de,_,de,de,_),y.push(-de,-de,_,-de,de,_);let M=new $e;M.setAttribute("position",new hn(new Float32Array(y),3));let w=new Xa({color:2829882,transparent:!0,opacity:.9});o.push(M),l.push(w),i.add(new Dr(M,w));let E=new el(new mi(de*2,de*2,.05)),b=new Xa({color:cu,transparent:!0,opacity:.55});o.push(E),l.push(b);for(let _=-20;_>-na;_-=20){let U=new Dr(E,b);U.position.z=_,i.add(U)}let A=new Qn,R=new Ya({color:15790586,roughness:.35,metalness:.1}),N=new Ya({color:cu,emissive:cu,emissiveIntensity:.5,roughness:.4});l.push(R,N);let I=new il(.34,24,16),G=new qa(.3,.42,1,20),q=new qa(.1,.08,.9,12),O=new il(.13,12,10),H=new el(new mi(1.6,1.6,1.6));o.push(I,G,q,O,H);let D=new we(I,R);D.position.y=.95;let X=new we(G,R),Q=new we(O,N);Q.position.set(0,.15,.36),Q.scale.setScalar(1.4);function it(_,U,F){let Z=new Qn;Z.position.set(_,U,0),Z.rotation.z=F;let at=new we(q,R);at.position.y=-.45;let ot=new we(O,N);return Z.add(at,ot),Z}let rt=it(-.45,.4,2.5),st=it(.45,.4,-2.5),Pt=it(-.2,-.5,.25),Gt=it(.2,-.5,-.25),vt=new Dr(H,new Xa({color:cu}));l.push(vt.material),A.add(D,X,Q,rt,st,Pt,Gt,vt);let W=-na+18;A.position.set(0,0,W),i.add(A);let et=new al(cu,1.2);et.position.set(-2,1,W+4),i.add(et);let tt=new ta(de*2-.4,de*2-.4),Mt=new Ya({color:10466559,transparent:!0,opacity:.18,roughness:.05,metalness:.6,side:Di});o.push(tt),l.push(Mt);let Dt=new we(tt,Mt),wt=W+9;Dt.position.z=wt,i.add(Dt);let le=new Float32Array(fl*3),Ht=new Float32Array(fl*3),ae=new Float32Array(fl*3),$t=new Float32Array(fl);for(let _=0;_<fl;_++){le[_*3]=(r()-.5)*(de*2-.4),le[_*3+1]=(r()-.5)*(de*2-.4),le[_*3+2]=wt;let U=le[_*3],F=le[_*3+1];Ht[_*3]=U*1.4+(r()-.5)*3,Ht[_*3+1]=F*1.4+(r()-.5)*3,Ht[_*3+2]=-4-r()*14,$t[_]=r()*Math.PI*2}let Zt=new $e,Le=new hn(ae,3);Zt.setAttribute("position",Le);let De=new tl({color:new Ot(13227775),size:.14,transparent:!0,opacity:0,depthWrite:!1});o.push(Zt),l.push(De);let Tt=new zc(Zt,De);Tt.frustumCulled=!1,i.add(Tt);function re(){let _=Math.max(1,e.clientWidth),U=Math.max(1,e.clientHeight);n.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),n.setSize(_,U,!1),s.aspect=_/U,s.updateProjectionMatrix()}re();let ce=new ResizeObserver(re);ce.observe(e);let ge=0,B=dp(t()),ln=performance.now(),ue=typeof window.matchMedia=="function"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;function C(_){if(ge=requestAnimationFrame(C),document.documentElement.hasAttribute("data-pt-busy"))return;let U=ue?0:(_-ln)/1e3;B+=(dp(t())-B)*.1;let F=B,Z=-F*(na-30);s.position.set(Math.sin(U*.4)*.15,Math.cos(U*.3)*.1,Z),s.rotation.z=Math.sin(F*Math.PI*2)*.05,A.position.y=Math.sin(U*1.2)*.25,A.rotation.y=Math.sin(U*.5)*.5+F*Math.PI,rt.rotation.z=2.5+Math.sin(U*1.6)*.2,st.rotation.z=-2.5-Math.sin(U*1.6+1)*.2,vt.rotation.set(U*.4,U*.5,0);let at=dp((F-Wv)/(1-Wv));if(Dt.visible=at===0,Mt.opacity=.18+Tw(.5,Wv,F)*.12,at>0){let ot=at*2.2;for(let J=0;J<fl;J++){let K=J*3;ae[K]=le[K]+Ht[K]*ot+Math.sin($t[J]+ot*3)*.1,ae[K+1]=le[K+1]+Ht[K+1]*ot-ot*ot*1.5,ae[K+2]=le[K+2]+Ht[K+2]*ot}Le.needsUpdate=!0,De.opacity=Math.min(1,at*6)*(1-Tw(.6,1,at)*.7),Tt.visible=!0}else Tt.visible=!1;n.render(i,s)}return ge=requestAnimationFrame(C),{dispose(){cancelAnimationFrame(ge),ce.disconnect(),i.traverse(_=>{let U=_;U.geometry&&o.push(U.geometry)}),new Set(o).forEach(_=>_.dispose()),new Set(l).forEach(_=>_.dispose()),m.dispose(),n.dispose()}}}function nr(e,t=0){let n=!1,i=0,s=window.setTimeout(()=>{typeof window.requestIdleCallback=="function"?i=window.requestIdleCallback(()=>{n||e()},{timeout:1200}):n||e()},t);return()=>{n=!0,window.clearTimeout(s),i&&typeof window.cancelIdleCallback=="function"&&window.cancelIdleCallback(i)}}var vi=Yt(Re()),Cw="End of story";function Rw(){let{story:e}=zn(),t=(0,ia.useRef)(null),n=(0,ia.useRef)(null),i=(0,ia.useRef)(null),s=(0,ia.useRef)(null),a=(0,ia.useRef)(null);(0,ia.useEffect)(()=>{let o=t.current,l=n.current,c=i.current,h=s.current,d=a.current;if(!o||!l||!c||!h||!d)return;let u=window.matchMedia("(prefers-reduced-motion: reduce)"),p=0,m=-1,S=(x,y,M)=>{let w=Math.min(1,Math.max(0,(M-x)/(y-x)));return w*w*(3-2*w)},g=()=>{p=0;let x=o.getBoundingClientRect(),y=Math.min(1,Math.max(0,1-x.top/window.innerHeight)),M=u.matches?1:S(.4,1,y);M!==m&&(m=M,h.style.opacity=(1-M).toFixed(3),c.style.transform=`scale(${(1.32-.32*M).toFixed(4)})`,d.style.transform=`scale(${(.82+.18*M).toFixed(4)})`,d.style.opacity=Math.min(1,M*1.6).toFixed(3))},f=()=>{p===0&&(p=requestAnimationFrame(g))},v=new IntersectionObserver(x=>{x.some(y=>y.isIntersecting)&&(o.setAttribute("data-in","1"),v.disconnect())},{threshold:.55});return v.observe(l),g(),window.addEventListener("scroll",f,{passive:!0}),window.addEventListener("resize",f),()=>{v.disconnect(),window.removeEventListener("scroll",f),window.removeEventListener("resize",f),p!==0&&cancelAnimationFrame(p)}},[]),(0,ia.useEffect)(()=>{let o,l=nr(()=>{o=c()},900);return()=>{l(),o==null||o()};function c(){let h=t.current,d=i.current;if(!h||!d)return;let p=Aw(d,()=>{let m=h.getBoundingClientRect(),S=m.height-window.innerHeight;return S<=0?0:Math.min(1,Math.max(0,-m.top/S))});return()=>p.dispose()}},[]);let r=Cw.split(" ");return(0,vi.jsxs)("section",{ref:t,className:"relative w-full",style:{height:"300vh",background:"#05060d",color:"#f0f1fa"},children:[(0,vi.jsxs)("div",{ref:n,className:"sticky top-0 h-screen w-full overflow-hidden",children:[(0,vi.jsx)("canvas",{ref:i,className:"absolute inset-0 h-full w-full will-change-transform",style:{transform:"scale(1.32)"},"aria-hidden":"true"}),(0,vi.jsxs)("div",{ref:a,className:"pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-[var(--sc-pad-x)] text-center will-change-transform",style:{transform:"scale(0.82)",opacity:0},children:[(0,vi.jsx)("p",{className:"mb-6 max-w-[80vw] text-[clamp(0.7rem,1vw,1rem)] uppercase tracking-[0.15em]",style:{fontFamily:"var(--sc-font-mono), 'IBM Plex Mono', monospace"},children:e.title}),(0,vi.jsx)("h2",{className:"font-medium leading-[1] tracking-[-0.03em]",style:{fontFamily:"var(--sc-font-sans), sans-serif",fontSize:"9vw"},"aria-label":Cw,children:r.map((o,l)=>(0,vi.jsxs)("span",{className:"inline-block whitespace-nowrap","aria-hidden":"true",children:[Array.from(o).map((c,h)=>(0,vi.jsx)("span",{className:"sc-cta-letter inline-block",style:{transitionDelay:`${(l*6+h)*45}ms`},children:c},h)),l<r.length-1?"\xA0":""]},l))})]}),(0,vi.jsx)("div",{ref:s,"aria-hidden":"true",className:"pointer-events-none absolute inset-0",style:{background:"#05060d"}}),(0,vi.jsx)("div",{className:"absolute bottom-[var(--sc-pad-y)] left-0 right-0 text-center text-[0.75rem] uppercase tracking-[0.15em]",style:{fontFamily:"var(--sc-font-mono), 'IBM Plex Mono', monospace"},children:"SCROLL TO THE END"})]}),(0,vi.jsx)("style",{children:`
        .sc-cta-letter {
          opacity: 0;
          transform: translateY(60%) rotate(6deg);
          transition: opacity 1.1s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        [data-in] .sc-cta-letter {
          opacity: 1;
          transform: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .sc-cta-letter { transition: none; opacity: 1; transform: none; }
        }
      `})]})}var Oi=Yt(Sn());var Kt=Yt(Re()),ti="cubic-bezier(.16,1,.3,1)";function mp(){return typeof window!="undefined"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches}function pp(e,t,n){return Math.min(n,Math.max(t,e))}function Xv(e,t){(0,Oi.useEffect)(()=>{let n=e.current;if(!n)return;if(mp()){n.classList.add("fw-in");return}let i=new IntersectionObserver(s=>{for(let a of s)a.isIntersecting&&(a.target.classList.add("fw-in"),i.unobserve(a.target))},{threshold:t});return i.observe(n),()=>i.disconnect()},[e,t])}function dD({src:e,label:t}){return(0,Kt.jsx)("img",{src:e,alt:t,width:1600,height:1040,loading:"lazy",decoding:"async",draggable:!1,className:"fw-img block h-full w-full object-cover"})}function pD({chapter:e,index:t}){let{router:n}=zn(),i=(0,Oi.useRef)(null),s=(0,Oi.useRef)(null),a=(0,Oi.useRef)(null),r=(0,Oi.useRef)(null);Xv(i,.2);let o=()=>{try{sessionStorage.setItem("sc-home-scroll",String(Math.round(window.scrollY)))}catch{}},l=h=>{if(o(),h.defaultPrevented||h.button!==0||h.metaKey||h.ctrlKey||h.shiftKey||h.altKey)return;let d=r.current,u=i.current;if(!d||!u)return;g1({router:n,href:e.href,slug:e.slug,src:Oa(e),bg:e.theme.bg,media:d,row:u})&&h.preventDefault()},c=h=>{let d=r.current;if(!d||mp())return;let u=d.getBoundingClientRect(),p=pp(h.clientX-u.left,0,u.width),m=pp(h.clientY-u.top,0,u.height),S=document.createElement("span");S.className="fw-burst",S.style.left=`${p}px`,S.style.top=`${m}px`,S.style.setProperty("--fw-size",`${Math.hypot(Math.max(p,u.width-p),Math.max(m,u.height-m))*2}px`),d.appendChild(S),S.addEventListener("animationend",()=>S.remove(),{once:!0})};return(0,Oi.useEffect)(()=>{let h=s.current,d=a.current;if(!h||!d||mp())return;let u=!1,p=0,m=()=>{p=0;let f=h.getBoundingClientRect(),v=window.innerHeight,x=pp((f.top+f.height/2-v/2)/(v/2+f.height/2),-1,1);d.style.transform=`translate3d(0, ${(x*.04*d.offsetHeight).toFixed(2)}px, 0)`},S=()=>{u&&p===0&&(p=requestAnimationFrame(m))},g=new IntersectionObserver(f=>{for(let v of f)u=v.isIntersecting;S()},{rootMargin:"100px 0px"});return g.observe(h),window.addEventListener("scroll",S,{passive:!0}),window.addEventListener("resize",S,{passive:!0}),()=>{g.disconnect(),window.removeEventListener("scroll",S),window.removeEventListener("resize",S),p!==0&&cancelAnimationFrame(p)}},[]),(0,Kt.jsxs)("a",{ref:i,href:e.href,className:"fw-row","data-col":t%2,onPointerDown:c,onClick:l,"data-fw-slug":e.slug,children:[(0,Kt.jsxs)("div",{ref:s,className:"fw-main",children:[(0,Kt.jsx)("div",{ref:r,className:"fw-media",children:(0,Kt.jsx)("div",{ref:a,className:"fw-par",children:(0,Kt.jsx)("div",{className:"fw-scale",children:(0,Kt.jsx)(dD,{src:Oa(e),label:e.title})})})}),(0,Kt.jsx)("span",{className:"fw-chip",children:"View"})]}),(0,Kt.jsxs)("div",{className:"fw-foot",children:[(0,Kt.jsx)("div",{className:"fw-tag-mask",children:(0,Kt.jsx)("p",{className:"fw-tags",children:e.tags.join(" \u2022 ")})}),(0,Kt.jsxs)("h3",{className:"fw-title","aria-label":e.title,children:[(0,Kt.jsx)("span",{className:"fw-arrow","aria-hidden":"true"}),(0,Kt.jsx)("span",{className:"fw-title-rise",children:(0,Kt.jsx)("span",{className:"fw-title-inner",children:Array.from(e.title).map((h,d)=>(0,Kt.jsxs)("span",{"aria-hidden":"true",className:"fw-letter",style:{transitionDelay:`${d*18}ms`},children:[(0,Kt.jsx)("span",{className:"fw-letter-a",children:h===" "?"\xA0":h}),(0,Kt.jsx)("span",{className:"fw-letter-b",children:h===" "?"\xA0":h})]},d))})})]})]})]})}var mD=["The","Chapters"],gD=["Every part of the story,","one tile at a time. Open any","tile to read it and listen."];function Nw(){var s,a;let{story:e}=zn(),t=(0,Oi.useRef)(null),n=(0,Oi.useRef)(null),i=(0,Oi.useRef)(null);return Xv(t,.3),Xv(i,.5),(0,Oi.useEffect)(()=>{let r=t.current,o=n.current;if(!r||!o||mp())return;let l=0,c=()=>{l=0;let d=window.innerHeight,u=pp((d-r.getBoundingClientRect().top)/(d*.8),0,1);o.style.transform=`translate3d(0, ${(-160*(1-u)).toFixed(2)}px, 0)`},h=()=>{l===0&&(l=requestAnimationFrame(c))};return h(),window.addEventListener("scroll",h,{passive:!0}),window.addEventListener("resize",h,{passive:!0}),()=>{window.removeEventListener("scroll",h),window.removeEventListener("resize",h),l!==0&&cancelAnimationFrame(l)}},[]),(0,Kt.jsxs)("section",{className:"fw-section",style:{fontFamily:"var(--sc-font-sans), sans-serif"},children:[(0,Kt.jsx)("header",{ref:t,className:"fw-head",children:(0,Kt.jsxs)("div",{ref:n,className:"fw-head-inner",children:[(0,Kt.jsx)("h2",{className:"fw-heading","aria-label":"The Chapters",children:mD.map((r,o)=>(0,Kt.jsx)("span",{className:"fw-wm","aria-hidden":"true",children:(0,Kt.jsx)("span",{className:"fw-w",style:{"--i":o},children:r})},r))}),(0,Kt.jsx)("p",{className:"fw-sub",children:gD.map((r,o)=>(0,Kt.jsx)("span",{className:"fw-sl-m",children:(0,Kt.jsx)("span",{className:"fw-sl",style:{"--i":o},children:r})},r))})]})}),(0,Kt.jsx)("div",{className:"fw-list",children:e.chapters.map((r,o)=>(0,Kt.jsx)(pD,{chapter:r,index:o},r.slug))}),(0,Kt.jsx)("div",{ref:i,className:"fw-cta",children:(0,Kt.jsx)("div",{className:"fw-cta-in",children:(0,Kt.jsxs)("a",{href:(a=(s=e.chapters[0])==null?void 0:s.href)!=null?a:"#/",className:"fw-pill",children:[(0,Kt.jsx)("span",{className:"fw-dot-w","aria-hidden":"true",children:(0,Kt.jsx)("span",{className:"fw-dot"})}),(0,Kt.jsx)("span",{children:"START FROM CHAPTER 1"}),(0,Kt.jsx)("svg",{className:"fw-pill-arrow",width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:(0,Kt.jsx)("path",{d:"M4 12h16M14 6l6 6-6 6"})})]})})}),(0,Kt.jsx)("style",{children:`
        .fw-section { position: relative; z-index: 1; background: transparent; color: #000; padding: calc(var(--sc-pad-y) * 2) var(--sc-pad-x) calc(var(--sc-pad-y) * 3); }
        .fw-head { margin-bottom: 8vh; }
        .fw-head-inner { display: flex; justify-content: space-between; align-items: flex-end; gap: 4vw; will-change: transform; }
        .fw-heading { font-size: 8vw; font-weight: 500; line-height: 1; letter-spacing: -0.03em; margin: 0; }
        .fw-wm { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: 0.1em; margin-bottom: -0.1em; margin-right: 0.22em; }
        .fw-wm:last-child { margin-right: 0; }
        .fw-w { display: inline-block; transform: translate3d(200px, 100%, 0); transition: transform 1.1s ${ti}; transition-delay: calc(var(--i) * 0.08s); }
        .fw-head.fw-in .fw-w { transform: translate3d(0, 0, 0); }
        .fw-sub { display: flex; flex-direction: column; font-size: 0.75rem; line-height: 1.1; text-transform: uppercase; margin: 0; max-width: 22vw; }
        .fw-sl-m { display: block; overflow: hidden; }
        .fw-sl { display: block; transform: translateY(110%); transition: transform 1.1s ${ti}; transition-delay: calc(0.3s + var(--i) * 0.06s); }
        .fw-head.fw-in .fw-sl { transform: none; }
        .fw-list { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--sc-grid-gap); }
        .fw-row { --fw-d: 0s; grid-column: span 6 / span 6; display: block; color: #000; text-decoration: none; cursor: pointer; }
        .fw-row[data-col="1"] { --fw-d: 0.12s; }
        .fw-row:nth-child(n+3) { margin-top: 10em; }
        .fw-main { position: relative; padding-top: 65%; }
        .fw-media { position: absolute; inset: 0; overflow: hidden; border-radius: 15px; background: var(--sc-dark-white); clip-path: inset(100% 0 0 0 round 15px); transition: clip-path 1.2s ${ti} var(--fw-d); }
        .fw-row.fw-in .fw-media { clip-path: inset(0 round 15px); }
        .fw-burst { position: absolute; z-index: 3; width: var(--fw-size); height: var(--fw-size); margin: calc(var(--fw-size) / -2) 0 0 calc(var(--fw-size) / -2); border-radius: 50%; pointer-events: none; transform: scale(0); opacity: 1; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); background: radial-gradient(circle, rgba(255,255,255,.2), rgba(255,255,255,0) 70%); -webkit-mask-image: radial-gradient(circle, #000 45%, transparent 70%); mask-image: radial-gradient(circle, #000 45%, transparent 70%); animation: fw-burst .9s ${ti} forwards; }
        @keyframes fw-burst { 0% { transform: scale(0); opacity: 1; } 55% { opacity: .9; } 100% { transform: scale(1); opacity: 0; } }
        .fw-par { position: absolute; left: 0; right: 0; top: -5%; height: 110%; will-change: transform; }
        .fw-scale { width: 100%; height: 100%; transform: scale(1.25); transition: transform 1.6s ${ti} var(--fw-d); }
        .fw-row.fw-in .fw-scale { transform: none; }
        .fw-img { transition: transform 1.1s ${ti}; }
        .fw-row:hover .fw-img { transform: scale(1.05); }
        .fw-chip { position: absolute; right: 10px; bottom: 10px; height: 2em; line-height: 2em; padding: 0 1em; background: var(--sc-off-white); border-radius: 1em; font-family: var(--sc-font-mono), monospace; font-weight: 500; font-size: 0.7rem; text-transform: uppercase; opacity: 0; transform: translateY(8px); transition: opacity .4s, transform .4s ${ti}; }
        .fw-row:hover .fw-chip { opacity: 1; transform: none; }
        .fw-foot { position: relative; width: 100%; }
        .fw-tag-mask { overflow: hidden; margin: 1.5em 0 1em; }
        .fw-tags { font-size: 0.9vw; line-height: 1.3; margin: 0; text-transform: uppercase; transform: translateY(110%); transition: transform 1.1s ${ti} calc(var(--fw-d) + 0.1s); }
        .fw-row.fw-in .fw-tags { transform: none; }
        .fw-title { position: relative; font-size: 3vw; font-weight: 500; height: 1em; line-height: 1; margin: 0; left: -0.06em; overflow: hidden; }
        .fw-title-rise { display: block; transform: translateY(110%); transition: transform 1.1s ${ti} calc(var(--fw-d) + 0.2s); }
        .fw-row.fw-in .fw-title-rise { transform: none; }
        .fw-title-inner { position: relative; display: flex; bottom: 0.1em; transition: transform .55s ${ti}; }
        .fw-arrow { position: absolute; width: 0.8em; height: 0.8em; top: 0.1em; left: -1em; transition: left .55s ${ti}; background: no-repeat center / contain url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2'><path d='M4 12h16M14 6l6 6-6 6'/></svg>"); }
        .fw-row:hover .fw-arrow { left: 0; }
        .fw-row:hover .fw-title-inner { transform: translateX(0.9em); }
        .fw-letter { position: relative; display: inline-block; overflow: hidden; height: 1.2em; }
        .fw-letter-a, .fw-letter-b { display: block; transition: transform .55s ${ti}; transition-delay: inherit; }
        .fw-letter-b { position: absolute; left: 0; top: 100%; }
        .fw-row:hover .fw-letter-a { transform: translateY(-100%); }
        .fw-row:hover .fw-letter-b { transform: translateY(-100%); }
        .fw-cta { display: flex; justify-content: center; margin-top: 12vh; }
        .fw-cta-in { opacity: 0; transform: translateY(40px); transition: opacity 1s ${ti}, transform 1s ${ti}; }
        .fw-cta.fw-in .fw-cta-in { opacity: 1; transform: none; }
        .fw-pill { display: inline-flex; align-items: center; gap: 0.7em; padding: 0 1.4em; height: 3.2em; border-radius: 999px; background: #2b2e3a; color: #f0f1fa; font-size: 0.875rem; font-weight: 500; letter-spacing: 0.04em; text-decoration: none; transition: background-color .4s, color .4s; }
        .fw-pill:hover, .fw-pill:focus-visible { background: #1a2ffb; }
        .fw-dot-w { display: inline-flex; align-items: center; justify-content: center; width: 12px; height: 12px; flex: none; }
        .fw-dot { display: block; width: 8px; height: 8px; border-radius: 50%; background: currentColor; transition: width .4s, height .4s; }
        .fw-pill:hover .fw-dot, .fw-pill:focus-visible .fw-dot { width: 12px; height: 12px; }
        .fw-pill-arrow { flex: none; transition: transform .4s; }
        .fw-pill:hover .fw-pill-arrow, .fw-pill:focus-visible .fw-pill-arrow { transform: translateX(4px); }
        @media (max-width: 1024px) {
          .fw-row { grid-column: span 12 / span 12; }
          .fw-row:nth-child(n+2) { margin-top: 5em; }
          .fw-row[data-col="1"] { --fw-d: 0s; }
          .fw-tags { font-size: 2.5vw; }
          .fw-title { font-size: 6.5vw; }
          .fw-heading { font-size: 14vw; }
          .fw-head-inner { flex-direction: column; align-items: flex-start; }
          .fw-sub { max-width: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fw-head-inner, .fw-par { transform: none !important; }
          .fw-w, .fw-sl, .fw-tags, .fw-title-rise, .fw-scale { transform: none; transition: none; }
          .fw-media { clip-path: inset(0 round 15px); transition: none; }
          .fw-cta-in { opacity: 1; transform: none; transition: none; }
        }
      `})]})}var qv=Yt(Re());function Lw(){let{story:e}=zn();return(0,qv.jsx)("footer",{className:"w-full px-[var(--sc-pad-x)] pb-[var(--sc-pad-y)] pt-[calc(var(--sc-pad-y)*2)]",style:{background:"#05060d",color:"#f0f1fa",fontFamily:"var(--sc-font-sans), sans-serif"},children:(0,qv.jsx)("p",{className:"m-0 border-t pt-6 text-[0.75rem] uppercase",style:{borderColor:"var(--sc-grey-blue)",fontFamily:"var(--sc-font-mono), 'IBM Plex Mono', monospace"},children:e.title})})}var vp=Yt(Sn());function Uw(e,t=!1){let n=e[0].index!==null,i=new Set(Object.keys(e[0].attributes)),s=new Set(Object.keys(e[0].morphAttributes)),a={},r={},o=e[0].morphTargetsRelative,l=new $e,c=0;for(let h=0;h<e.length;++h){let d=e[h],u=0;if(n!==(d.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let p in d.attributes){if(!i.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+p+'" attribute exists among all geometries, or in none of them.'),null;a[p]===void 0&&(a[p]=[]),a[p].push(d.attributes[p]),u++}if(u!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==d.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let p in d.morphAttributes){if(!s.has(p))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;r[p]===void 0&&(r[p]=[]),r[p].push(d.morphAttributes[p])}if(t){let p;if(n)p=d.index.count;else if(d.attributes.position!==void 0)p=d.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,p,h),c+=p}}if(n){let h=0,d=[];for(let u=0;u<e.length;++u){let p=e[u].index;for(let m=0;m<p.count;++m)d.push(p.getX(m)+h);h+=e[u].attributes.position.count}l.setIndex(d)}for(let h in a){let d=Dw(a[h]);if(!d)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,d)}for(let h in r){let d=r[h][0].length;if(d!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let u=0;u<d;++u){let p=[];for(let S=0;S<r[h].length;++S)p.push(r[h][S][u]);let m=Dw(p);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(m)}}}return l}function Dw(e){let t,n,i,s=-1,a=0;for(let c=0;c<e.length;++c){let h=e[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(n===void 0&&(n=h.itemSize),n!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;a+=h.count*n}let r=new t(a),o=new hn(r,n,i),l=0;for(let c=0;c<e.length;++c){let h=e[c];if(h.isInterleavedBufferAttribute){let d=l/n;for(let u=0,p=h.count;u<p;u++)for(let m=0;m<n;m++){let S=h.getComponent(u,m);o.setComponent(u+d,m,S)}}else r.set(h.array,l);l+=h.count*n}return s!==void 0&&(o.gpuType=s),o}var gp=40,Iw=["#16171d","#ffffff","#c9ccd8","#1a2ffb"];function vD(){let t=document.createElement("canvas");t.width=256,t.height=256;let n=t.getContext("2d");if(n){let s=n.createRadialGradient(92.16,81.92,5.12,128,128,133.12);s.addColorStop(0,"#ffffff"),s.addColorStop(.45,"#d6d8e2"),s.addColorStop(.8,"#7c8094"),s.addColorStop(1,"#2c2f3d"),n.fillStyle=s,n.fillRect(0,0,256,256)}let i=new Ur(t);return i.colorSpace=Fn,i}function Ow(e,t){let n=new qa(e,e,t,28,1),i=n.clone();i.rotateZ(Math.PI/2);let s=n.clone();s.rotateX(Math.PI/2);let a=[n,i,s],r=Uw(a,!1);if(a.forEach(o=>o.dispose()),!r)throw new Error("Failed to merge cross geometry");return r}function Pw(e){let t=new ws({canvas:e,antialias:!0,alpha:!1});t.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),t.setClearColor(new Ot("#0a0d1a"),1);let n=new Yi,i=new xn(35,1,.1,100);i.position.z=22;let s=vD(),a=Ow(.32,2),r=Ow(.17,2.02),o=new kc({matcap:s}),l=new ys({color:new Ot("#05060d")}),c=new Wa(a,o,gp),h=new Wa(r,l,gp);c.instanceMatrix.setUsage(rp),h.instanceMatrix.setUsage(rp),n.add(c,h);let d=new Ot,u=[];for(let D=0;D<gp;D+=1)u.push({nx:(Math.random()*2-1)*1.05,ny:(Math.random()*2-1)*1.05,z:-4+Math.random()*7,scale:.7+Math.random()*1.1,rot:new L(Math.random()*6.28,Math.random()*6.28,Math.random()*6.28),spin:new L((Math.random()-.5)*.5,(Math.random()-.5)*.5,(Math.random()-.5)*.5),phase:Math.random()*6.28,floatAmp:.15+Math.random()*.3,offX:0,offY:0}),d.set(Iw[D%Iw.length]),c.setColorAt(D,d);c.instanceColor&&(c.instanceColor.needsUpdate=!0);let p=8,m=4,S=()=>{let D=Math.max(e.clientWidth,1),X=Math.max(e.clientHeight,1);t.setSize(D,X,!1),i.aspect=D/X,i.updateProjectionMatrix(),m=Math.tan(i.fov*Math.PI/360)*i.position.z,p=m*i.aspect};S();let g=new ResizeObserver(S);g.observe(e);let f=0,v=0,x=!1,y=0,M=0,w=D=>{let X=e.getBoundingClientRect();f=(D.clientX-X.left)/X.width*2-1,v=-((D.clientY-X.top)/X.height*2-1),x=f>=-1&&f<=1&&v>=-1&&v<=1},E=()=>{x=!1};window.addEventListener("pointermove",w),document.addEventListener("pointerleave",E);let b=new fe,A=new jn,R=new qi,N=new L,I=new L,G=0,q=performance.now(),O=0,H=D=>{if(G=requestAnimationFrame(H),document.documentElement.hasAttribute("data-pt-busy")){q=D;return}let X=Math.min((D-q)/1e3,.05);q=D,O+=X,y+=((x?f:0)-y)*Math.min(X*3,1),M+=((x?v:0)-M)*Math.min(X*3,1),i.position.x=y*.8,i.position.y=M*.5,i.lookAt(0,0,0);let Q=f*p,it=v*m;for(let rt=0;rt<gp;rt+=1){let st=u[rt],Pt=0,Gt=0;if(x){let vt=st.nx*p-Q,W=st.ny*m-it,et=Math.hypot(vt,W)+1e-4,tt=Math.max(0,1-et/3.5);Pt=vt/et*tt*2.2,Gt=W/et*tt*2.2}st.offX+=(Pt-st.offX)*Math.min(X*4,1),st.offY+=(Gt-st.offY)*Math.min(X*4,1),st.rot.x+=st.spin.x*X,st.rot.y+=st.spin.y*X,st.rot.z+=st.spin.z*X,N.set(st.nx*p+st.offX,st.ny*m+st.offY+Math.sin(O*.8+st.phase)*st.floatAmp,st.z),R.set(st.rot.x,st.rot.y,st.rot.z),A.setFromEuler(R),I.setScalar(st.scale),b.compose(N,A,I),c.setMatrixAt(rt,b),h.setMatrixAt(rt,b)}c.instanceMatrix.needsUpdate=!0,h.instanceMatrix.needsUpdate=!0,t.render(n,i)};return G=requestAnimationFrame(H),{dispose(){cancelAnimationFrame(G),g.disconnect(),window.removeEventListener("pointermove",w),document.removeEventListener("pointerleave",E),c.dispose(),h.dispose(),a.dispose(),r.dispose(),o.dispose(),l.dispose(),s.dispose(),t.dispose()}}}var Pi=Yt(Re()),yD=["0%","33.33%","66.66%","100%"];function Bw(){let{story:e}=zn(),t=e.chapters.length,n=(0,vp.useRef)(null);return(0,vp.useEffect)(()=>{let i,s=nr(()=>{i=a()},100);return()=>{s(),i==null||i()};function a(){let r=n.current;if(!r)return;let o=null;try{o=Pw(r)}catch{o=null}return()=>{o==null||o.dispose()}}},[]),(0,Pi.jsxs)("section",{className:"flex min-h-screen w-full flex-col bg-[#f0f1fa] text-black",style:{fontFamily:"var(--sc-font-sans), sans-serif",padding:"calc(var(--sc-pad-y) * 2) var(--sc-pad-x) var(--sc-pad-y)",gap:"calc(var(--sc-pad-y) * 1.2)"},children:[(0,Pi.jsx)("div",{className:"grid w-full grid-cols-12",style:{columnGap:"var(--sc-grid-gap)"},children:(0,Pi.jsxs)("div",{className:"col-span-6 md:col-[4/span_5]",children:[(0,Pi.jsx)("h1",{className:"m-0 text-[6vw] leading-[1.1] font-normal text-black md:text-[2.5vw]",children:e.title}),(0,Pi.jsxs)("p",{className:"mt-[1.2em] max-w-[34em] text-[3.6vw] leading-[1.3] text-black/60 md:text-[1.05vw]",children:["A story told in ",t," ",t===1?"chapter":"chapters",". Scroll to begin, then open any chapter to read it and listen."]})]})}),(0,Pi.jsx)("div",{className:"relative h-[70vh] w-full overflow-hidden bg-[#0a0d1a] md:h-[450px]",style:{borderRadius:"var(--sc-radius)"},children:(0,Pi.jsx)("canvas",{ref:n,className:"block h-full w-full"})}),(0,Pi.jsxs)("div",{className:"relative mt-auto flex h-8 w-full items-center justify-center",children:[yD.map(i=>(0,Pi.jsx)("span",{"aria-hidden":"true",className:"absolute top-1/2 -translate-x-1/2 -translate-y-1/2 leading-none font-light",style:{left:i,fontSize:"var(--sc-cross-size)"},children:"+"},i)),(0,Pi.jsx)("span",{className:"text-xs font-medium tracking-wide uppercase",children:"Scroll to begin"})]})]})}var Gn=Yt(Sn());var Bi=Yt(Sn()),jt=Yt(Re()),xD=[0,25,50,75,100],_D=8,bD="PLAY STORY",SD=18,MD=15e3,wD=3,Hw=960,Vw=600,zw=["#5a90ff","#1a2ffb","#2a38ee","#5a90ff","#1a2ffb"];function ED(e,t){let n=Hw,i=Vw;e.globalCompositeOperation="source-over",e.fillStyle="#2a38ee",e.fillRect(0,0,n,i);for(let r=0;r<6;r+=1){let o=t*35e-5*(1+r*.17)+r*1.3,l=n*(.5+.46*Math.sin(o)),c=i*(.5+.42*Math.cos(o*.8+r)),h=Math.max(n,i)*(.3+.12*Math.sin(o*1.7)),d=zw[r%zw.length],u=e.createRadialGradient(l,c,0,l,c,h);u.addColorStop(0,`${d}d9`),u.addColorStop(1,`${d}00`),e.fillStyle=u,e.fillRect(0,0,n,i)}e.save(),e.translate(n/2,i/2),e.rotate(-.35);let s=Math.max(n,i)/8,a=t*.025%(s*2);e.fillStyle="rgba(255,255,255,0.055)";for(let r=-n*1.5-s*2;r<n*1.5;r+=s*2)e.fillRect(r+a,-i*1.5,s,i*3);e.restore()}function TD({left:e}){return(0,jt.jsx)("span",{"aria-hidden":"true",className:`absolute top-1/2 block -translate-x-1/2 -translate-y-1/2 text-[clamp(10px,1.1cqw,28px)] leading-none text-white ${e===25||e===75?"max-lg:hidden":""}`,style:{left:`${e}%`},children:"+"})}function AD({index:e}){let t={fill:"none",stroke:"currentColor",strokeWidth:1.5},n;switch(e%4){case 0:n=(0,jt.jsx)("circle",{cx:"12",cy:"12",r:"8",...t});break;case 1:n=(0,jt.jsx)("rect",{x:"4",y:"4",width:"16",height:"16",...t});break;case 2:n=(0,jt.jsx)("path",{d:"M12 3 L21 20 H3 Z",...t});break;default:n=(0,jt.jsx)("path",{d:"M4 12 H20 M12 4 V20",...t})}return(0,jt.jsx)("span",{className:"block shrink-0 px-[clamp(8px,1.5cqw,32px)]",children:(0,jt.jsx)("svg",{"aria-hidden":"true",viewBox:"0 0 24 24",className:"block h-[clamp(8px,1.5cqw,30px)] w-[clamp(8px,1.5cqw,30px)] text-white",children:n})})}function Fw({strip:e,position:t}){let n=(0,jt.jsx)("div",{className:"relative mx-[2.4cqw] h-[clamp(10px,1.4cqw,32px)]",children:xD.map(s=>(0,jt.jsx)(TD,{left:s},s))}),i=(0,jt.jsx)("div",{className:"overflow-hidden",children:(0,jt.jsx)("div",{ref:e,className:"flex w-max will-change-transform",children:Array.from({length:_D*2},(s,a)=>(0,jt.jsx)(AD,{index:a},a))})});return(0,jt.jsx)("div",{className:`absolute inset-x-0 flex flex-col gap-[0.8cqw] ${t==="top"?"top-[1.6cqw]":"bottom-[1.6cqw]"}`,children:t==="top"?(0,jt.jsxs)(jt.Fragment,{children:[n,i]}):(0,jt.jsxs)(jt.Fragment,{children:[i,n]})})}function Yv({className:e,parallax:t}){let n={transform:`translate3d(0, calc(var(--reel-par, 0) * ${t}cqw), 0)`,background:"linear-gradient(165deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.07) 55%, rgba(26,47,251,0.25) 100%)"};return(0,jt.jsx)("div",{"aria-hidden":"true",className:`absolute aspect-[9/16] rounded-[1.6cqw] border border-white/30 ${e}`,style:n,children:(0,jt.jsx)("span",{className:"absolute left-1/2 top-[3%] block h-[1.8%] w-[28%] -translate-x-1/2 rounded-full bg-white/40"})})}function Gw({children:e,onPlay:t,className:n=""}){let i=(0,Bi.useRef)(null),s=(0,Bi.useRef)(null),a=(0,Bi.useRef)(null),r=(0,Bi.useRef)(null),[o,l]=(0,Bi.useState)(!1);(0,Bi.useEffect)(()=>{let h=i.current;if(!h)return;let d=new IntersectionObserver(([u])=>l(u.isIntersecting),{rootMargin:"100px"});return d.observe(h),()=>d.disconnect()},[]);let c=e!=null;return(0,Bi.useEffect)(()=>{if(!o||c)return;let h=s.current;if(!h)return;let d=h.getContext("2d");if(!d)return;let u=window.matchMedia("(prefers-reduced-motion: reduce)").matches,p=0,m=S=>{ED(d,S),u||(p=requestAnimationFrame(m))};return p=requestAnimationFrame(m),()=>cancelAnimationFrame(p)},[o,c]),(0,Bi.useEffect)(()=>{let h=window.matchMedia("(prefers-reduced-motion: reduce)").matches,d=a.current,u=r.current;if(h||!d||!u)return;let p={duration:MD,iterations:1/0,easing:"linear"},m=d.animate([{transform:"translateX(0)"},{transform:"translateX(-50%)"}],p),S=u.animate([{transform:"translateX(-50%)"},{transform:"translateX(0)"}],p),g=y=>{m.playbackRate=y,S.playbackRate=y},f=()=>g(wD),v=()=>g(1),x=i.current;return x==null||x.addEventListener("pointerenter",f),x==null||x.addEventListener("pointerleave",v),()=>{x==null||x.removeEventListener("pointerenter",f),x==null||x.removeEventListener("pointerleave",v),m.cancel(),S.cancel()}},[]),(0,Bi.useEffect)(()=>{if(!o)return;let h=i.current;if(!h)return;let d=0,u=()=>{d=0;let m=h.getBoundingClientRect(),S=window.innerHeight||1,g=m.top+m.height/2,f=Math.max(-1,Math.min(1,(g-S/2)/S));h.style.setProperty("--reel-par",f.toFixed(4))},p=()=>{d||(d=requestAnimationFrame(u))};return u(),window.addEventListener("scroll",p,{passive:!0}),window.addEventListener("resize",p),()=>{window.removeEventListener("scroll",p),window.removeEventListener("resize",p),d&&cancelAnimationFrame(d)}},[o]),(0,jt.jsxs)("div",{ref:i,className:`group/reel relative h-full w-full overflow-hidden bg-[#2a38ee] [container-type:inline-size] ${n}`,children:[c?(0,jt.jsx)("div",{className:"absolute inset-0 [&>*]:h-full [&>*]:w-full [&>video]:object-cover",children:e}):(0,jt.jsx)("canvas",{ref:s,width:Hw,height:Vw,role:"img","aria-label":"Animated background",className:"absolute inset-0 h-full w-full object-cover"}),(0,jt.jsx)(Fw,{strip:a,position:"top"}),(0,jt.jsx)(Fw,{strip:r,position:"bottom"}),(0,jt.jsx)(Yv,{className:"left-[10%] top-[18%] w-[13cqw]",parallax:-5}),(0,jt.jsx)(Yv,{className:"right-[10%] top-[34%] w-[13cqw]",parallax:-3}),(0,jt.jsx)("p",{"aria-hidden":"true",className:"pointer-events-none absolute inset-x-0 top-1/2 m-0 flex -translate-y-1/2 justify-center whitespace-pre text-[10cqw] font-medium leading-none text-white",children:bD.split("").map((h,d)=>(0,jt.jsx)("span",{className:"relative block overflow-hidden",children:(0,jt.jsxs)("span",{className:"relative block transition-transform duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover/reel:-translate-y-full",style:{transitionDelay:`${d*SD}ms`},children:[h===" "?"\xA0":h,(0,jt.jsx)("span",{className:"absolute left-0 top-full block",children:h===" "?"\xA0":h})]})},d))}),(0,jt.jsx)(Yv,{className:"left-1/2 top-[22%] w-[16cqw] -ml-[8cqw]",parallax:-8}),(0,jt.jsx)("div",{className:"absolute inset-0 flex items-center justify-center",children:(0,jt.jsx)("button",{type:"button","aria-label":"Start the story",onClick:t,className:"flex h-[clamp(36px,7cqw,120px)] w-[clamp(36px,7cqw,120px)] items-center justify-center rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:scale-110 focus-visible:scale-110",children:(0,jt.jsx)("svg",{"aria-hidden":"true",viewBox:"0 0 24 24",className:"ml-[6%] h-[34%] w-[34%] text-[#1a2ffb]",children:(0,jt.jsx)("path",{d:"M6 3.5 L20 12 L6 20.5 Z",fill:"currentColor"})})})})]})}var Br=Yt(Sn());var tn=Yt(Re()),CD=.26,RD=.04,ND=.74,kw=20,LD=24,DD=.1,UD=.55,ID=.14,OD=`
  uniform vec4 uRect0;
  uniform vec4 uRect1;
  uniform float uP;
  uniform float uVel;
  uniform float uTime;
  uniform vec2 uView;
  varying vec2 vUv;
  varying vec2 vSize;
  void main() {
    vUv = uv;
    float u = uv.x;
    float v = 1.0 - uv.y;
    vec4 r = mix(uRect0, uRect1, uP);
    vSize = r.zw;
    vec2 pos = r.xy + vec2(u, v) * r.zw;

    float bell = 4.0 * uP * (1.0 - uP);
    // taper and skew while moving: top-right stretches out, right side pulls in
    pos.x += bell * r.z * (0.20 * u * u * (1.0 - v) - 0.10 * u * v);
    pos.y += bell * r.w * (-0.12 * u * (1.0 - v) + 0.06 * u * u);
    // concave bottom edge
    pos.y += bell * r.w * 0.10 * sin(u * 3.14159) * v * v;
    // slightly bowed edges at rest in the full state
    float bow = smoothstep(0.6, 1.0, uP);
    pos.y += bow * r.w * 0.02 * sin(u * 3.14159) * (v * 2.0 - 1.0);
    pos.x += bow * r.z * 0.008 * sin(v * 3.14159) * (u * 2.0 - 1.0);
    // scroll-velocity shear and ripple
    pos.x += uVel * r.z * 0.10 * (0.5 - v);
    pos.y += sin(u * 7.0 + v * 3.0 + uTime * 2.5) * abs(uVel) * r.w * 0.035 * (0.3 + bell);

    vec2 c = (pos - 0.5 * uView) * vec2(1.0, -1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(c, 0.0, 1.0);
  }
`,PD=`
  uniform sampler2D uTex;
  uniform float uP;
  uniform float uRadius;
  varying vec2 vUv;
  varying vec2 vSize;
  void main() {
    vec2 uvc = (vUv - 0.5) / mix(1.25, 1.0, uP) + 0.5;
    vec3 c = texture2D(uTex, uvc).rgb;
    float lum = dot(c, vec3(0.299, 0.587, 0.114));
    // footage turns into a flat saturated blue duotone as the card shrinks
    float tint = 1.0 - smoothstep(0.55, 0.95, uP);
    vec3 duo = mix(vec3(0.02, 0.03, 0.62), vec3(0.55, 0.6, 1.0), clamp(lum * 1.5, 0.0, 1.0));
    float pink = clamp((c.r - c.g) * 2.2 - 0.1, 0.0, 1.0);
    vec3 col = mix(c, duo, tint);
    col = mix(col, vec3(0.93, 0.86, 1.0), pink * tint * 0.6);
    // rounded rectangle mask
    vec2 p = (vUv - 0.5) * vSize;
    vec2 q = abs(p) - 0.5 * vSize + uRadius;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
    float a = 1.0 - smoothstep(-1.0, 1.0, d);
    gl_FragColor = vec4(col, a);
  }
`;function Zv(e){return Math.min(1,Math.max(0,e))}function Ww(e,t,n){return e+(t-e)*n}function BD(e){return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2}function Xw(e,t,n){let i=Zv((n-e)/(t-e));return i*i*(3-2*i)}function zD(e,t,n,i,s,a){let r=1.1+.05*Math.sin(a*.12),o=Math.max(i/t.naturalWidth,s/t.naturalHeight)*r,l=t.naturalWidth*o,c=t.naturalHeight*o,h=(i-l)/2+Math.sin(a*.09)*(l-i)*.35,d=(s-c)/2+Math.cos(a*.07)*(c-s)*.35;if(e.drawImage(t,h,d,l,c),n){let p=n instanceof HTMLVideoElement?n.videoWidth:n.naturalWidth,m=n instanceof HTMLVideoElement?n.videoHeight:n.naturalHeight;if(p>0&&m>0){let S=Math.min(i*.8/p,s*.86/m),g=p*S,f=m*S;e.drawImage(n,(i-g)/2,s-f-s*.02,g,f)}}let u=e.createLinearGradient(0,0,0,s);u.addColorStop(0,"rgba(5,6,13,0.18)"),u.addColorStop(1,"rgba(5,6,13,0.38)"),e.fillStyle=u,e.fillRect(0,0,i,s)}function FD(e,t,n,i){let s=e.createLinearGradient(0,0,t,n);s.addColorStop(0,"#120a2c"),s.addColorStop(1,"#2a0f58"),e.fillStyle=s,e.fillRect(0,0,t,n);let a=[[.03,.08,.3,.34],[.36,.05,.28,.3],[.03,.5,.26,.4],[.33,.52,.3,.38]];for(let[l,c,h,d]of a){e.fillStyle="rgba(255,255,255,0.05)",e.strokeStyle="rgba(190,160,255,0.28)",e.lineWidth=2,e.beginPath(),e.roundRect(l*t,c*n,h*t,d*n,10),e.fill(),e.stroke();for(let u=0;u<4;u++)e.fillStyle="rgba(210,190,255,0.22)",e.fillRect(l*t+14,c*n+18+u*22,h*t*(.35+.4*(u*37%7)/7),6)}let r=[];for(let l=0;l<11;l++)r.push([t*(.36+.26*Math.sin(i*.5+l*1.7)*.5+.13*Math.cos(l*2.3)),n*(.4+.3*Math.cos(i*.4+l*1.3)*.5+.08*Math.sin(l*1.9))]);e.lineWidth=1.5;for(let l=0;l<r.length;l++)for(let c=l+1;c<r.length;c++){let h=r[l][0]-r[c][0],d=r[l][1]-r[c][1],u=Math.hypot(h,d);u<t*.26&&(e.strokeStyle=`rgba(200,170,255,${(.5*(1-u/(t*.26))).toFixed(3)})`,e.beginPath(),e.moveTo(r[l][0],r[l][1]),e.lineTo(r[c][0],r[c][1]),e.stroke())}for(let[l,c]of r){let h=e.createRadialGradient(l,c,0,l,c,16);h.addColorStop(0,"rgba(255,255,255,0.95)"),h.addColorStop(1,"rgba(160,120,255,0)"),e.fillStyle=h,e.fillRect(l-16,c-16,32,32)}let o=e.createLinearGradient(t*.7,0,t,n*.7);o.addColorStop(0,"#ff9be8"),o.addColorStop(1,"#c46bff"),e.fillStyle=o,e.beginPath(),e.roundRect(t*.7,n*.06,t*.27,n*.52,12),e.fill();for(let l=0;l<4;l++){let c=t*(.78+.12*(l*53%5)/5),h=n*(.16+.1*l)+Math.sin(i*1.2+l)*4,d=e.createRadialGradient(c-6,h-6,1,c,h,22);d.addColorStop(0,"#ffffff"),d.addColorStop(1,"rgba(255,200,255,0.2)"),e.fillStyle=d,e.beginPath(),e.arc(c,h,20,0,Math.PI*2),e.fill()}for(let l=0;l<6;l++){let c=t*(.52+l*.075),h=n*.86+Math.sin(i*1.4+l)*3;e.fillStyle=l%2?"rgba(120,255,200,0.75)":"rgba(255,255,255,0.7)",e.beginPath();for(let d=0;d<6;d++){let u=Math.PI/3*d;e.lineTo(c+Math.cos(u)*16,h+Math.sin(u)*14)}e.closePath(),e.fill()}}function qw({trackRef:e,picture:t,avatarImage:n,avatarVideo:i,avatarVideoFallback:s,source:a,onPlay:r}){let o=(0,Br.useRef)(null),l=(0,Br.useRef)(null),c=(0,Br.useRef)(null),h=(0,Br.useRef)(null);return(0,Br.useEffect)(()=>{let d=o.current,u,p=nr(()=>{u=m()},250);return()=>{p(),u==null||u()};function m(){let S=e.current,g=l.current,f=c.current,v=h.current;if(!d||!S||!g||!f||!v)return;let x=document.createElement("canvas");x.setAttribute("aria-hidden","true"),x.style.cssText="position:absolute;inset:0;width:100%;height:100%;display:block;",d.insertBefore(x,d.firstChild);let y;try{y=new ws({canvas:x,antialias:!0,alpha:!0})}catch{x.remove();return}y.setClearColor(0,0),y.setPixelRatio(Math.min(window.devicePixelRatio,2));let M,w=null,E=null;a?M=a:(w=document.createElement("canvas"),w.width=1920,w.height=1080,E=w.getContext("2d"),M=w);let b=null,A=null,R=null;if(!a){if(t){let Tt=new Image;Tt.decoding="async",Tt.onload=()=>{b=Tt},Tt.src=t}if(i){if(R=document.createElement("video"),R.muted=!0,R.loop=!0,R.playsInline=!0,R.preload="auto",s){let Tt=document.createElement("source");Tt.src=i,Tt.type="video/webm";let re=document.createElement("source");re.src=s,re.type="video/mp4",R.append(Tt,re)}else R.src=i;A=R}else if(n){let Tt=new Image;Tt.decoding="async",Tt.onload=()=>{A=Tt},Tt.src=n}}let N=new Ur(M);N.minFilter=on,N.magFilter=on,N.generateMipmaps=!1;let I=new Yi,G=new xs(-1,1,1,-1,-10,10);G.position.z=5;let q={uTex:{value:N},uRect0:{value:new Ne},uRect1:{value:new Ne},uP:{value:0},uVel:{value:0},uTime:{value:0},uView:{value:new Rt(1,1)},uRadius:{value:kw}},O=new ta(1,1,64,40),H=new bn({vertexShader:OD,fragmentShader:PD,uniforms:q,transparent:!0,depthTest:!1,depthWrite:!1}),D=new we(O,H);D.frustumCulled=!1,I.add(D);let X=window.matchMedia("(prefers-reduced-motion: reduce)"),Q=1,it=1,rt=1,st=0,Pt=0,Gt={x:0,y:0,w:1,h:1},vt=0,W=0,et=0,tt=0,Mt=performance.now(),Dt=0,wt=!0,le=0,Ht=()=>{let Tt=S.getBoundingClientRect(),re=Math.max(1,S.offsetHeight-rt);return BD(Zv(-Tt.top/re/UD))},ae=()=>{let Tt=d.getBoundingClientRect();Q=Math.max(1,Tt.width),it=Math.max(1,Tt.height),rt=it,y.setSize(Q,it,!1),G.left=-Q/2,G.right=Q/2,G.top=it/2,G.bottom=-it/2,G.updateProjectionMatrix(),q.uView.value.set(Q,it);let re=d.parentElement;st=re&&parseFloat(getComputedStyle(re).paddingLeft)||0;let ce=window.innerWidth*CD,ge=ce*3/4,B=st,ln=window.innerWidth*RD;Pt=ln+ge;let ue=Math.max(1,Q-st*2),C=it*ND;Gt={x:st,y:(it-C)/2,w:ue,h:C},q.uRect0.value.set(B,ln,ce,ge),q.uRect1.value.set(Gt.x,Gt.y,Gt.w,Gt.h),W=Ht(),et=W,X.matches&&(vt=1)},$t=Tt=>{let re=Pt+it*.1,ce=Ww(re-it/2,0,Tt);g.style.transform=`translate3d(0, ${ce.toFixed(1)}px, 0)`,g.style.opacity=(.14+.86*Xw(.6,1,Tt)).toFixed(3);let ge=Xw(.85,1,Tt).toFixed(3);f.style.opacity=ge,v.style.opacity=ge,f.style.top=`${(Gt.y-28).toFixed(1)}px`,v.style.top=`${(Gt.y+Gt.h+12).toFixed(1)}px`,f.style.left=v.style.left=`${Gt.x}px`,f.style.width=v.style.width=`${Gt.w}px`},Zt=Tt=>{if(Dt=requestAnimationFrame(Zt),!wt||document.documentElement.hasAttribute("data-pt-busy")){Mt=Tt;return}let re=Math.min(.05,Math.max(.001,(Tt-Mt)/1e3));Mt=Tt,X.matches?vt=1:(W=Ht(),vt+=(W-vt)*DD,Math.abs(W-vt)<4e-4&&(vt=W));let ce=(W-et)/re;et=W,tt+=(Zv(Math.abs(ce)*.35)*Math.sign(ce)-tt)*ID,Math.abs(tt)<.002&&(tt=0),q.uP.value=vt,q.uVel.value=tt,q.uTime.value=Tt/1e3,q.uRadius.value=Ww(kw,LD,vt),E&&w&&Tt-le>33?(b?zD(E,b,A,w.width,w.height,Tt/1e3):FD(E,w.width,w.height,Tt/1e3),N.needsUpdate=!0,le=Tt):a&&(N.needsUpdate=!0),$t(vt),y.render(I,G)};ae(),$t(vt);let Le=new ResizeObserver(ae);Le.observe(d);let De=new IntersectionObserver(Tt=>{wt=Tt.some(re=>re.isIntersecting),R&&(wt?R.play().catch(()=>{}):R.pause())},{rootMargin:"200px"});return De.observe(d),vt=W,Dt=requestAnimationFrame(Zt),()=>{cancelAnimationFrame(Dt),Le.disconnect(),De.disconnect(),R&&(R.pause(),R.removeAttribute("src"),R.replaceChildren(),R.load()),O.dispose(),H.dispose(),N.dispose(),y.dispose(),x.remove()}}},[e,a,t,n,i,s]),(0,tn.jsxs)("div",{ref:o,className:"absolute inset-0 overflow-visible",children:[(0,tn.jsxs)("div",{ref:c,"aria-hidden":"true",className:"pointer-events-none absolute flex justify-between text-[1.1vw] leading-none text-black opacity-0",children:[(0,tn.jsx)("span",{children:"+"}),(0,tn.jsx)("span",{className:"max-lg:hidden",children:"+"}),(0,tn.jsx)("span",{children:"+"}),(0,tn.jsx)("span",{className:"max-lg:hidden",children:"+"}),(0,tn.jsx)("span",{children:"+"})]}),(0,tn.jsxs)("div",{ref:h,"aria-hidden":"true",className:"pointer-events-none absolute flex justify-between text-[1.1vw] leading-none text-black opacity-0",children:[(0,tn.jsx)("span",{children:"+"}),(0,tn.jsx)("span",{className:"max-lg:hidden",children:"+"}),(0,tn.jsx)("span",{children:"+"}),(0,tn.jsx)("span",{className:"max-lg:hidden",children:"+"}),(0,tn.jsx)("span",{children:"+"})]}),(0,tn.jsxs)("div",{ref:l,className:"pointer-events-none absolute inset-0 flex items-center justify-center gap-[3vw] text-[9vw] font-medium leading-none text-white will-change-transform",style:{opacity:.14},children:[(0,tn.jsx)("span",{children:"PLAY"}),(0,tn.jsx)("button",{type:"button","aria-label":"Start the story",onClick:r,className:"pointer-events-auto flex h-[6.2vw] w-[9vw] items-center justify-center rounded-full bg-white transition-transform duration-300 hover:scale-110",children:(0,tn.jsx)("svg",{viewBox:"0 0 24 24",className:"h-[2.6vw] w-[2.6vw] fill-black","aria-hidden":"true",children:(0,tn.jsx)("path",{d:"M7 4.5v15l13-7.5z"})})}),(0,tn.jsx)("span",{children:"STORY"})]})]})}var Ee=Yt(Re());function HD(e){let t=e.trim().split(/\s+/).filter(Boolean).slice(0,5);if(t.length===0)return[["Chapter","One"]];if(t.length<=2)return[t];let n=Math.ceil(t.length/2);return[t.slice(0,n),t.slice(n)]}var VD=.1,GD=.08,Yw=.5,kD=.06,WD="cubic-bezier(.16,1,.3,1)",XD=160;function qD(e){return Math.min(1,Math.max(0,e))}function Zw(){var g,f,v;let{story:e,router:t}=zn(),n=e.chapters[0],i=HD((g=n==null?void 0:n.title)!=null?g:""),s=i.map((x,y)=>i.slice(0,y).reduce((M,w)=>M+w.length,0)),a=((f=n==null?void 0:n.summary)!=null?f:"").split(" ").filter(Boolean),r=n?Oa(n):void 0,o=()=>{var x;return t.push((x=n==null?void 0:n.href)!=null?x:"#/")},l=(0,Gn.useRef)(null),c=(0,Gn.useRef)(null),h=(0,Gn.useRef)(null),d=(0,Gn.useRef)(null),u=(0,Gn.useRef)(null),p=(0,Gn.useRef)(null),[m,S]=(0,Gn.useState)(!1);return(0,Gn.useEffect)(()=>{let x=c.current;if(!x)return;let y=new IntersectionObserver(([M])=>{M.isIntersecting&&(S(!0),y.disconnect())},{threshold:0});return y.observe(x),()=>y.disconnect()},[]),(0,Gn.useEffect)(()=>{let x=d.current;if(!x)return;let y=()=>{let w=x.querySelectorAll("[data-desc-word]"),E=-1,b=Number.NEGATIVE_INFINITY;w.forEach(A=>{Math.abs(A.offsetTop-b)>2&&(E+=1,b=A.offsetTop),A.style.transitionDelay=`${(Yw+E*kD).toFixed(3)}s`})};y(),window.addEventListener("resize",y);let M=document.fonts;return M&&M.ready.then(y),()=>window.removeEventListener("resize",y)},[]),(0,Gn.useEffect)(()=>{let x=c.current,y=h.current;if(!x||!y)return;let M=window.matchMedia("(prefers-reduced-motion: reduce)"),w=()=>{if(M.matches){y.style.removeProperty("transform");return}let E=x.getBoundingClientRect(),b=window.innerHeight||1,A=qD((b-E.top)/(b*1.5));y.style.transform=`translate3d(0, ${(-XD*(1-A)).toFixed(2)}px, 0)`};return w(),window.addEventListener("scroll",w,{passive:!0}),window.addEventListener("resize",w),M.addEventListener("change",w),()=>{window.removeEventListener("scroll",w),window.removeEventListener("resize",w),M.removeEventListener("change",w)}},[]),(0,Ee.jsxs)("section",{className:"relative z-[1] w-full bg-transparent pb-[var(--sc-pad-y)] pt-[calc(var(--sc-pad-y)*3)] text-black",ref:l,style:{fontFamily:"var(--sc-font-sans), sans-serif"},children:[(0,Ee.jsxs)("div",{className:"grid grid-cols-12 items-start",style:{paddingInline:"var(--sc-pad-x)",columnGap:"var(--sc-grid-gap)",rowGap:"4vw"},children:[(0,Ee.jsx)("div",{ref:c,className:"col-span-12",children:(0,Ee.jsx)("div",{ref:h,className:"will-change-transform",children:(0,Ee.jsx)("h2",{className:"m-0 text-[13vw] font-medium leading-none text-black md:text-[9vw]",children:i.map((x,y)=>(0,Ee.jsx)("span",{className:"-mb-[0.14em] block overflow-hidden pb-[0.14em]",children:x.map((M,w)=>{let E=s[y]+w;return(0,Ee.jsx)("span",{className:"mr-[0.24em] inline-block align-top motion-reduce:transition-none",style:{transform:m?"translate3d(0,0,0)":"translate3d(200px,100%,0)",transition:`transform 1.1s ${WD} ${(VD+E*GD).toFixed(2)}s`},children:M},w)})},y))})})}),(0,Ee.jsxs)("div",{className:"col-span-12 flex flex-col gap-[4vw] md:gap-[2.5vw]",children:[(0,Ee.jsx)("p",{ref:d,className:"m-0 w-full text-[4.2vw] leading-[1.15] text-black md:w-7/12 md:text-[2vw]",children:a.map((x,y)=>(0,Ee.jsxs)(Gn.Fragment,{children:[(0,Ee.jsx)("span",{"data-desc-word":!0,className:"inline-block transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none",style:{opacity:m?1:0,transform:m?"translate3d(0,0,0)":"translate3d(0,0.6em,0)"},children:x})," "]},y))}),(0,Ee.jsx)("div",{className:"w-fit transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none",style:{opacity:m?1:0,transform:m?"translate3d(0,0,0)":"translate3d(0,24px,0)",transitionDelay:`${Yw+.4}s`},children:(0,Ee.jsxs)("a",{href:(v=n==null?void 0:n.href)!=null?v:"#/",className:"group inline-flex items-center gap-3 rounded-full border border-black bg-transparent px-5 py-3 text-black no-underline transition-[background-color,color,border-color] duration-[400ms] hover:border-[#1a2ffb] hover:bg-[#1a2ffb] hover:text-white focus-visible:border-[#1a2ffb] focus-visible:bg-[#1a2ffb] focus-visible:text-white",style:{fontSize:"var(--sc-header-size)"},children:[(0,Ee.jsx)("span",{"aria-hidden":"true",className:"block h-2 w-2 rounded-full bg-[#1a2ffb] transition-[transform,background-color] duration-[400ms] group-hover:scale-[1.8] group-hover:bg-white group-focus-visible:scale-[1.8] group-focus-visible:bg-white"}),(0,Ee.jsx)("span",{children:"Start reading"}),(0,Ee.jsx)("svg",{"aria-hidden":"true",viewBox:"0 0 16 16",className:"h-4 w-4 transition-transform duration-[400ms] group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5",children:(0,Ee.jsx)("path",{d:"M2 8 H13 M9 4 L13 8 L9 12",fill:"none",stroke:"currentColor",strokeWidth:"1.5"})})]})})]})]}),(0,Ee.jsx)("div",{ref:u,className:"mt-[4vw] hidden md:block md:h-[360vh]",children:(0,Ee.jsx)("div",{ref:p,className:"relative sticky top-0 h-screen",style:{paddingInline:"var(--sc-pad-x)"},children:(0,Ee.jsx)(qw,{trackRef:u,picture:r,avatarImage:n==null?void 0:n.avatarImage,avatarVideo:n==null?void 0:n.avatarVideo,avatarVideoFallback:n==null?void 0:n.avatarVideoFallback,onPlay:o})})}),(0,Ee.jsx)("div",{className:"mt-[4vw] px-[var(--sc-pad-x)] md:hidden",children:(0,Ee.jsx)("div",{className:"relative aspect-[3/4] w-full overflow-hidden rounded-[24px] bg-[#2a38ee]",children:(0,Ee.jsx)(Gw,{onPlay:o,children:r&&(0,Ee.jsxs)("div",{className:"relative",children:[(0,Ee.jsx)("img",{src:r,alt:"",className:"absolute inset-0 h-full w-full object-cover"}),(n==null?void 0:n.avatarImage)&&(0,Ee.jsx)("img",{src:n.avatarImage,alt:"",className:"absolute inset-x-0 bottom-0 mx-auto h-[78%] w-auto max-w-[80%] object-contain"})]})})})})]})}var yp=Yt(Sn());var Qw=Yt(Re()),Jw=`
  varying vec3 vNormal;
  varying float vAlong;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vAlong = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,Kw=`
  uniform vec3 uColor0;
  uniform vec3 uColor1;
  uniform float uProgress;
  uniform float uHalo;
  uniform float uBias;
  varying vec3 vNormal;
  varying float vAlong;
  void main() {
    if (vAlong > uProgress) discard;
    vec3 n = normalize(vNormal);
    vec3 base = mix(uColor0, uColor1, pow(vAlong, uBias));
    if (uHalo > 0.5) {
      float a = pow(max(n.z, 0.0), 1.5) * 0.28;
      gl_FragColor = vec4(base, a);
      return;
    }
    float diffuse = 0.55 + 0.45 * max(dot(n, normalize(vec3(-0.3, 0.6, 0.75))), 0.0);
    float rim = pow(1.0 - max(n.z, 0.0), 2.5);
    float spec = pow(max(dot(n, normalize(vec3(0.25, 0.55, 0.8))), 0.0), 28.0);
    // brighten the head of the line while it is still drawing
    float head = smoothstep(uProgress - 0.04, uProgress, vAlong) * 0.6;
    vec3 col = base * diffuse + base * rim * 0.9 + vec3(spec) * 0.55 + vec3(head);
    gl_FragColor = vec4(col, 1.0);
  }
`;function YD(e){let t=Math.min(1,Math.max(0,e));return t*t*(3-2*t)}function Jv({colors:e,points:t,radius:n=.012,range:i=[.1,.9],gradientBias:s=1,delay:a=500,className:r}){let o=(0,yp.useRef)(null);return(0,yp.useEffect)(()=>{let l=o.current,c,h=nr(()=>{c=d()},a);return()=>{h(),c==null||c()};function d(){if(!l)return;let u=document.createElement("canvas");u.style.cssText="position:absolute;inset:0;width:100%;height:100%;display:block;",l.appendChild(u);let p;try{p=new ws({canvas:u,antialias:!0,alpha:!0})}catch{u.remove();return}p.setClearColor(0,0);let m=new Yi,S=new xs(-1,1,1,-1,-2e3,2e3);S.position.z=10;let g=new Qn;m.add(g);let f=new bn({vertexShader:Jw,fragmentShader:Kw,uniforms:{uColor0:{value:new Ot(e[0])},uColor1:{value:new Ot(e[1])},uProgress:{value:0},uHalo:{value:0},uBias:{value:s}}}),v=new bn({vertexShader:Jw,fragmentShader:Kw,transparent:!0,depthWrite:!1,blending:Jc,uniforms:{uColor0:{value:new Ot(e[0])},uColor1:{value:new Ot(e[1])},uProgress:{value:0},uHalo:{value:1},uBias:{value:s}}}),x=new ys({color:new Ot(e[1])}),y=new ys({color:new Ot(e[0])}),M=1,w=1,E=null,b=null,A=null,R=new Qn,N=new Qn;g.add(R,N);let I=(vt,W,et)=>{vt.clear();let tt=et/8,Mt=new we(new mi(et,tt,1),W),Dt=new we(new mi(tt,et,1),W);vt.add(Mt,Dt)},G=()=>{for(let vt of[b,A])vt&&(g.remove(vt),vt.geometry.dispose());b=null,A=null;for(let vt of[R,N])vt.children.forEach(W=>W.geometry.dispose())},q=()=>{let vt=l.getBoundingClientRect();M=Math.max(1,vt.width),w=Math.max(1,vt.height);let W=Math.max(.75,Math.min(window.devicePixelRatio,1.5,Math.sqrt(35e5/(M*w))));p.setPixelRatio(W),p.setSize(M,w,!1),O=!0,S.left=-M/2,S.right=M/2,S.top=w/2,S.bottom=-w/2,S.updateProjectionMatrix(),G();let et=t.map(([Dt,wt])=>new L((Dt-.5)*M,(.5-wt)*w,0));E=new nl(et,!1,"catmullrom",.5);let tt=n*M;b=new we(new sl(E,420,tt,28,!1),f),A=new we(new sl(E,420,tt*2.4,20,!1),v),A.position.z=-1,g.add(A,b);let Mt=Math.max(14,Math.min(32,M*.014));I(R,y,Mt),I(N,x,Mt),R.position.copy(E.getPoint(0)),N.position.copy(E.getPoint(1))},O=!0,H=-1,D=0,X=0,Q=0,it=!0,rt=()=>{let vt=l.getBoundingClientRect(),W=window.innerHeight,et=(W-vt.top)/(vt.height+W);X=YD((et-i[0])/(i[1]-i[0]))},st=()=>{D=requestAnimationFrame(st),!(!it||document.documentElement.hasAttribute("data-pt-busy"))&&(rt(),Q+=(X-Q)*.12,Math.abs(X-Q)<4e-4&&(Q=X),!(!O&&Q===H)&&(O=!1,H=Q,f.uniforms.uProgress.value=Q,v.uniforms.uProgress.value=Q,R.visible=Q>.002,N.visible=Q>.985,p.render(m,S)))};q();let Pt=new ResizeObserver(q);Pt.observe(l);let Gt=new IntersectionObserver(vt=>{it=vt.some(W=>W.isIntersecting)},{rootMargin:"100px"});return Gt.observe(l),D=requestAnimationFrame(st),()=>{cancelAnimationFrame(D),Pt.disconnect(),Gt.disconnect(),G(),f.dispose(),v.dispose(),x.dispose(),y.dispose(),p.dispose(),u.remove()}}},[e,t,n,i,s,a]),(0,Qw.jsx)("div",{ref:o,"aria-hidden":"true",className:r,style:{position:"absolute",inset:0,pointerEvents:"none",zIndex:0}})}var jw=Yt(Sn());function $w(){return(0,jw.useLayoutEffect)(()=>{try{if(sessionStorage.getItem("sc-home-restore")==="1"){sessionStorage.removeItem("sc-home-restore");let e=Number(sessionStorage.getItem("sc-home-scroll"));Number.isFinite(e)&&e>0&&window.scrollTo(0,e)}}catch{}_1()},[]),null}var Pe=Yt(Re());function Kv(e){return typeof window=="undefined"?null:a1(window.location.hash,e)}function ZD(){return(0,Pe.jsxs)("div",{className:"bg-[#f0f1fa] text-black",children:[(0,Pe.jsx)($w,{}),(0,Pe.jsx)(Kh,{}),(0,Pe.jsx)(Qh,{}),(0,Pe.jsxs)("main",{children:[(0,Pe.jsx)(Bw,{}),(0,Pe.jsxs)("div",{className:"relative bg-[#f0f1fa]",children:[(0,Pe.jsx)(Zw,{}),(0,Pe.jsx)(Jv,{colors:["#5a90ff","#2a38ee"],points:[[-.03,.03],[.22,.07],[.46,.17],[.56,.3],[.44,.42],[.26,.36],[.16,.5],[.3,.64],[.52,.62],[.74,.7],[.92,.86],[1.03,.98]],radius:.0055,range:[.15,.75],delay:500})]}),(0,Pe.jsxs)("div",{className:"relative bg-[#f0f1fa]",children:[(0,Pe.jsx)(Nw,{}),(0,Pe.jsx)("div",{className:"pointer-events-none absolute inset-x-0 bottom-0 h-[1400px]",children:(0,Pe.jsx)(Jv,{colors:["#5a90ff","#2a38ee"],points:[[-.03,.45],[.2,.55],[.42,.72],[.5,.86],[.38,.93],[.28,.85],[.5,.8],[.8,.88],[1.03,.97]],radius:.0035,range:[.2,.85],delay:700})})]}),(0,Pe.jsx)("div",{"data-seam":!0,"aria-hidden":"true",className:"h-[38vh] w-full",style:{background:"linear-gradient(to bottom, rgb(240 241 250) 0%, rgb(233 234 243) 10%, rgb(216 217 225) 20%, rgb(189 190 199) 30%, rgb(157 158 167) 40%, rgb(122 124 132) 50%, rgb(88 89 96) 60%, rgb(56 57 64) 70%, rgb(29 30 38) 80%, rgb(12 13 20) 90%, rgb(5 6 13) 100%)"}}),(0,Pe.jsxs)("div",{id:"end",className:"bg-[#05060d]",children:[(0,Pe.jsx)(Rw,{}),(0,Pe.jsx)(Lw,{})]})]})]})}function tE({story:e,className:t=""}){let n=e.chapters.length,[i,s]=(0,Qi.useState)(()=>Kv(n)),a=(0,Qi.useRef)(!0),r=(0,Qi.useRef)(i),o=(0,Qi.useMemo)(()=>({push(c,h){a.current=(h==null?void 0:h.scroll)!==!1;let d=c==="/"||c===""?"#/":c;window.location.hash===d||d==="#/"&&window.location.hash===""?s(Kv(n)):window.location.hash=d},prefetch(){}}),[n]);if((0,Qi.useEffect)(()=>{let c=()=>s(Kv(n));return window.addEventListener("hashchange",c),()=>window.removeEventListener("hashchange",c)},[n]),(0,Qi.useLayoutEffect)(()=>{r.current!==i&&(r.current=i,a.current&&window.scrollTo(0,0),a.current=!0)},[i]),n===0)return(0,Pe.jsx)("div",{className:"p-10 text-sm text-neutral-400",children:"This story has no chunks yet."});let l=i!==null?e.chapters[i]:null;return(0,Pe.jsx)(u1,{value:{story:e,router:o},children:(0,Pe.jsxs)("div",{className:`sc-root ${t}`,children:[(0,Pe.jsx)("style",{children:l1}),l?(0,Pe.jsx)(U1,{chapter:l},l.slug):(0,Pe.jsx)(ZD,{}),(l==null?void 0:l.audioUrl)&&(0,Pe.jsx)(i1,{theme:{variant:"light"}})]})})}var aE=Yt(Re()),eE=document.getElementById("showcase-data"),nE=document.getElementById("showcase-root"),iE;if(eE&&nE){let e=JSON.parse((iE=eE.textContent)!=null?iE:"{}");(0,sE.createRoot)(nE).render((0,aE.jsx)(tE,{story:e}))}})();
