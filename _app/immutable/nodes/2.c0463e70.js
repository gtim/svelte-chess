import{S as F,i as R,s as S,k as f,y as z,a as $,q as T,l as b,m as g,z as A,c as U,r as B,h as d,n as E,p as N,b as D,A as G,G as o,J as O,g as I,d as J,B as K,K as P,w as V}from"../chunks/index.e346a5a4.js";import{C as j}from"../chunks/Chess.2ed0e94a.js";function H(c){let t,n,e,l,u,p,r,_,v,i,k,m,y,w,q={};return n=new j({props:q}),c[1](n),{c(){t=f("div"),z(n.$$.fragment),e=$(),l=f("button"),u=T("Reset board"),p=$(),r=f("button"),_=T("Undo"),v=$(),i=f("button"),k=T("Flip board"),this.h()},l(a){t=b(a,"DIV",{style:!0});var s=g(t);A(n.$$.fragment,s),e=U(s),l=b(s,"BUTTON",{class:!0});var h=g(l);u=B(h,"Reset board"),h.forEach(d),p=U(s),r=b(s,"BUTTON",{class:!0});var x=g(r);_=B(x,"Undo"),x.forEach(d),v=U(s),i=b(s,"BUTTON",{class:!0});var C=g(i);k=B(C,"Flip board"),C.forEach(d),s.forEach(d),this.h()},h(){E(l,"class","svelte-1d7yk7v"),E(r,"class","svelte-1d7yk7v"),E(i,"class","svelte-1d7yk7v"),N(t,"max-width","512px"),N(t,"margin","0 auto")},m(a,s){D(a,t,s),G(n,t,null),o(t,e),o(t,l),o(l,u),o(t,p),o(t,r),o(r,_),o(t,v),o(t,i),o(i,k),m=!0,y||(w=[O(l,"click",c[2]),O(r,"click",c[3]),O(i,"click",c[4])],y=!0)},p(a,[s]){const h={};n.$set(h)},i(a){m||(I(n.$$.fragment,a),m=!0)},o(a){J(n.$$.fragment,a),m=!1},d(a){a&&d(t),c[1](null),K(n),y=!1,P(w)}}}function L(c,t,n){let e;function l(_){V[_?"unshift":"push"](()=>{e=_,n(0,e)})}return[e,l,()=>e==null?void 0:e.reset(),()=>e==null?void 0:e.undo(),()=>e==null?void 0:e.toggleOrientation()]}class W extends F{constructor(t){super(),R(this,t,L,H,S,{})}}export{W as component};
