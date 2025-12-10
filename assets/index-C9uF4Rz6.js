(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function r(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(n){if(n.ep)return;n.ep=!0;const s=r(n);fetch(n.href,s)}})();class at{enabled=!0;owner;radius;layer;isTrigger;scene;onTriggerEnter;constructor(t,r,i,n=!0){this.radius=r,this.layer=i,this.isTrigger=n,this.scene=t}start(){}update(t){}onAttach(){this.scene.collisionSystem.add(this)}onDetach(){this.scene.collisionSystem.remove(this)}}class we{colliders=[];add(t){this.colliders.push(t)}remove(t){this.colliders=this.colliders.filter(r=>r!==t)}update(t){const r=this.colliders.length;for(let i=0;i<r;i++){const n=this.colliders[i],s=n.owner;if(!n.enabled||!s)continue;const o=s.transform.getWorldPosition();for(let a=i+1;a<r;a++){const c=this.colliders[a],h=c.owner;if(!c.enabled||!h||!this.shouldCollide(n,c))continue;const l=h.transform.getWorldPosition(),u=o[0]-l[0],d=o[1]-l[1],m=o[2]-l[2],v=n.radius+c.radius;u*u+d*d+m*m<=v*v&&n.isTrigger&&c.isTrigger&&(n.onTriggerEnter?.(c),c.onTriggerEnter?.(n))}}}shouldCollide(t,r){return!0}}class be{objects=[];_mainCamera=null;destroyQueue=[];collisionSystem=new we;addObject(t){this.objects.push(t),t.scene=this}removeObject(t){const r=this.objects.indexOf(t);r>=0&&this.objects.splice(r,1)}markForDestroy(t){this.destroyQueue.push(t)}findByName(t){return this.objects.find(r=>r.name===t)??null}setMainCamera(t){this._mainCamera=t}get MainCamera(){return this._mainCamera}update(t){for(const r of this.objects)r.update(t);if(this.collisionSystem.update(t),this.destroyQueue.length>0){const r=new Set(this.destroyQueue);for(const i of this.destroyQueue)i.forEachComponent(n=>n.onDetach?.());this.objects=this.objects.filter(i=>!r.has(i)),this.destroyQueue.length=0}}getObjects(){return this.objects}}class W{enabled=!0;mesh;constructor(t){this.mesh=t}start(){}update(t){}onAttach(){}onDetach(){}setMesh(t){this.mesh=t}}class j{enabled=!0;owner;gl;material;vao=null;vbo=null;ibo=null;vertexCount=0;indexCount=0;constructor(t,r){this.gl=t,this.material=r}start(){if(!this.owner){console.warn("MeshRenderer: owner が設定されていません");return}const t=this.owner.getComponent(W);if(!t||!t.mesh){console.warn("MeshRenderer: MeshFilter または mesh が設定されていません.");return}this.initBuffers(t.mesh)}update(t){}onAttach(){}onDetach(){const t=this.gl;this.vao&&(t.deleteVertexArray(this.vao),this.vao=null),this.vbo&&(t.deleteBuffer(this.vbo),this.vbo=null),this.ibo&&(t.deleteBuffer(this.ibo),this.ibo=null)}initBuffers(t){const r=this.gl,i=t.vertices;if(!i||i.length===0){console.warn("MeshRenderer: vertices が空です");return}const n=i[0].uv!==void 0,s=3,o=n?2:0,a=4,c=s+o,h=c*a,l=i.flatMap(v=>n?[...v.pos,...v.uv]:[...v.pos]),u=new Float32Array(l);this.vertexCount=u.length/c,this.vao=r.createVertexArray(),this.vbo=r.createBuffer(),this.ibo=null,r.bindVertexArray(this.vao),r.bindBuffer(r.ARRAY_BUFFER,this.vbo),r.bufferData(r.ARRAY_BUFFER,u,r.STATIC_DRAW);let d=0;const m=r.getAttribLocation(this.material.program.program,"aPosition");if(m>=0&&(r.enableVertexAttribArray(m),r.vertexAttribPointer(m,s,r.FLOAT,!1,h,d)),d+=s*a,n){const v=r.getAttribLocation(this.material.program.program,"aTexCoord");v>=0&&(r.enableVertexAttribArray(v),r.vertexAttribPointer(v,o,r.FLOAT,!1,h,d)),d+=o*a}t.indices&&t.indices.length>0&&(this.ibo=r.createBuffer(),r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,this.ibo),r.bufferData(r.ELEMENT_ARRAY_BUFFER,new Uint16Array(t.indices),r.STATIC_DRAW),this.indexCount=t.indices.length),r.bindVertexArray(null)}render(t){const r=this.gl;!this.vao||!this.owner||(this.material.bind(r,this.owner,t),r.bindVertexArray(this.vao),this.ibo&&this.indexCount>0?r.drawElements(r.TRIANGLES,this.indexCount,r.UNSIGNED_SHORT,0):this.vertexCount>0&&r.drawArrays(r.TRIANGLES,0,this.vertexCount),r.bindVertexArray(null))}}class Te{gl;constructor(t){this.gl=t}render(t,r,i=null){const n=this.gl;n.bindFramebuffer(n.FRAMEBUFFER,i?i.fbo:null);const s=i?i.width:n.drawingBufferWidth,o=i?i.height:n.drawingBufferHeight;n.viewport(0,0,s,o),n.enable(n.DEPTH_TEST),n.depthMask(!0),n.clearColor(0,0,0,1),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT);const a=t.getObjects();for(const c of a){if(!c.active)continue;const h=c.getComponent(j);!h||!h.enabled||(c.layer&r.cullingMask)!=0&&h.render(r)}}}var Fe=1e-6,D=typeof Float32Array<"u"?Float32Array:Array,Re="zyx";function Me(){var e=new D(9);return D!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[5]=0,e[6]=0,e[7]=0),e[0]=1,e[4]=1,e[8]=1,e}function $(){var e=new D(16);return D!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function Ee(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e}function Bt(e,t){var r=t[0],i=t[1],n=t[2],s=t[3],o=t[4],a=t[5],c=t[6],h=t[7],l=t[8],u=t[9],d=t[10],m=t[11],v=t[12],p=t[13],b=t[14],R=t[15],S=r*a-i*o,g=r*c-n*o,y=r*h-s*o,x=i*c-n*a,w=i*h-s*a,J=n*h-s*c,tt=l*p-u*v,et=l*b-d*v,rt=l*R-m*v,it=u*b-d*p,nt=u*R-m*p,st=d*R-m*b,E=S*st-g*nt+y*it+x*rt-w*et+J*tt;return E?(E=1/E,e[0]=(a*st-c*nt+h*it)*E,e[1]=(n*nt-i*st-s*it)*E,e[2]=(p*J-b*w+R*x)*E,e[3]=(d*w-u*J-m*x)*E,e[4]=(c*rt-o*st-h*et)*E,e[5]=(r*st-n*rt+s*et)*E,e[6]=(b*y-v*J-R*g)*E,e[7]=(l*J-d*y+m*g)*E,e[8]=(o*nt-a*rt+h*tt)*E,e[9]=(i*rt-r*nt-s*tt)*E,e[10]=(v*w-p*y+R*S)*E,e[11]=(u*y-l*w-m*S)*E,e[12]=(a*et-o*it-c*tt)*E,e[13]=(r*it-i*et+n*tt)*E,e[14]=(p*g-v*x-b*S)*E,e[15]=(l*x-u*g+d*S)*E,e):null}function Ae(e,t,r){var i=t[0],n=t[1],s=t[2],o=t[3],a=t[4],c=t[5],h=t[6],l=t[7],u=t[8],d=t[9],m=t[10],v=t[11],p=t[12],b=t[13],R=t[14],S=t[15],g=r[0],y=r[1],x=r[2],w=r[3];return e[0]=g*i+y*a+x*u+w*p,e[1]=g*n+y*c+x*d+w*b,e[2]=g*s+y*h+x*m+w*R,e[3]=g*o+y*l+x*v+w*S,g=r[4],y=r[5],x=r[6],w=r[7],e[4]=g*i+y*a+x*u+w*p,e[5]=g*n+y*c+x*d+w*b,e[6]=g*s+y*h+x*m+w*R,e[7]=g*o+y*l+x*v+w*S,g=r[8],y=r[9],x=r[10],w=r[11],e[8]=g*i+y*a+x*u+w*p,e[9]=g*n+y*c+x*d+w*b,e[10]=g*s+y*h+x*m+w*R,e[11]=g*o+y*l+x*v+w*S,g=r[12],y=r[13],x=r[14],w=r[15],e[12]=g*i+y*a+x*u+w*p,e[13]=g*n+y*c+x*d+w*b,e[14]=g*s+y*h+x*m+w*R,e[15]=g*o+y*l+x*v+w*S,e}function Pe(e,t,r,i){var n=t[0],s=t[1],o=t[2],a=t[3],c=n+n,h=s+s,l=o+o,u=n*c,d=n*h,m=n*l,v=s*h,p=s*l,b=o*l,R=a*c,S=a*h,g=a*l,y=i[0],x=i[1],w=i[2];return e[0]=(1-(v+b))*y,e[1]=(d+g)*y,e[2]=(m-S)*y,e[3]=0,e[4]=(d-g)*x,e[5]=(1-(u+b))*x,e[6]=(p+R)*x,e[7]=0,e[8]=(m+S)*w,e[9]=(p-R)*w,e[10]=(1-(u+v))*w,e[11]=0,e[12]=r[0],e[13]=r[1],e[14]=r[2],e[15]=1,e}function De(e,t,r,i,n){var s=1/Math.tan(t/2);if(e[0]=s/r,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=s,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,n!=null&&n!==1/0){var o=1/(i-n);e[10]=(n+i)*o,e[14]=2*n*i*o}else e[10]=-1,e[14]=-2*i;return e}var Se=De,bt=Ae;function T(){var e=new D(3);return D!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function _e(e){var t=new D(3);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t}function Wt(e){var t=e[0],r=e[1],i=e[2];return Math.sqrt(t*t+r*r+i*i)}function A(e,t,r){var i=new D(3);return i[0]=e,i[1]=t,i[2]=r,i}function N(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e}function G(e,t,r,i){return e[0]=t,e[1]=r,e[2]=i,e}function H(e,t,r){return e[0]=t[0]+r[0],e[1]=t[1]+r[1],e[2]=t[2]+r[2],e}function Ce(e,t,r){return e[0]=t[0]-r[0],e[1]=t[1]-r[1],e[2]=t[2]-r[2],e}function V(e,t,r){return e[0]=t[0]*r,e[1]=t[1]*r,e[2]=t[2]*r,e}function jt(e,t,r,i){return e[0]=t[0]+r[0]*i,e[1]=t[1]+r[1]*i,e[2]=t[2]+r[2]*i,e}function Ue(e,t){var r=t[0]-e[0],i=t[1]-e[1],n=t[2]-e[2];return Math.sqrt(r*r+i*i+n*n)}function O(e,t){var r=t[0],i=t[1],n=t[2],s=r*r+i*i+n*n;return s>0&&(s=1/Math.sqrt(s)),e[0]=t[0]*s,e[1]=t[1]*s,e[2]=t[2]*s,e}function Yt(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}function yt(e,t,r){var i=t[0],n=t[1],s=t[2],o=r[0],a=r[1],c=r[2];return e[0]=n*c-s*a,e[1]=s*o-i*c,e[2]=i*a-n*o,e}function Ve(e,t,r,i){var n=t[0],s=t[1],o=t[2];return e[0]=n+i*(r[0]-n),e[1]=s+i*(r[1]-s),e[2]=o+i*(r[2]-o),e}var ct=Ce,Le=Wt;(function(){var e=T();return function(t,r,i,n,s,o){var a,c;for(r||(r=3),i||(i=0),n?c=Math.min(n*r+i,t.length):c=t.length,a=i;a<c;a+=r)e[0]=t[a],e[1]=t[a+1],e[2]=t[a+2],s(e,e,o),t[a]=e[0],t[a+1]=e[1],t[a+2]=e[2];return t}})();function Be(){var e=new D(4);return D!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0,e[3]=0),e}function k(e,t,r,i){var n=new D(4);return n[0]=e,n[1]=t,n[2]=r,n[3]=i,n}function ze(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e}function Oe(e,t){var r=t[0],i=t[1],n=t[2],s=t[3],o=r*r+i*i+n*n+s*s;return o>0&&(o=1/Math.sqrt(o)),e[0]=r*o,e[1]=i*o,e[2]=n*o,e[3]=s*o,e}function xt(e,t,r){var i=t[0],n=t[1],s=t[2],o=t[3];return e[0]=r[0]*i+r[4]*n+r[8]*s+r[12]*o,e[1]=r[1]*i+r[5]*n+r[9]*s+r[13]*o,e[2]=r[2]*i+r[6]*n+r[10]*s+r[14]*o,e[3]=r[3]*i+r[7]*n+r[11]*s+r[15]*o,e}(function(){var e=Be();return function(t,r,i,n,s,o){var a,c;for(r||(r=4),i||(i=0),n?c=Math.min(n*r+i,t.length):c=t.length,a=i;a<c;a+=r)e[0]=t[a],e[1]=t[a+1],e[2]=t[a+2],e[3]=t[a+3],s(e,e,o),t[a]=e[0],t[a+1]=e[1],t[a+2]=e[2],t[a+3]=e[3];return t}})();function X(){var e=new D(4);return D!=Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e[3]=1,e}function Ie(e){return e[0]=0,e[1]=0,e[2]=0,e[3]=1,e}function mt(e,t,r){r=r*.5;var i=Math.sin(r);return e[0]=i*t[0],e[1]=i*t[1],e[2]=i*t[2],e[3]=Math.cos(r),e}function Ht(e,t,r){var i=t[0],n=t[1],s=t[2],o=t[3],a=r[0],c=r[1],h=r[2],l=r[3];return e[0]=i*l+o*a+n*h-s*c,e[1]=n*l+o*c+s*a-i*h,e[2]=s*l+o*h+i*c-n*a,e[3]=o*l-i*a-n*c-s*h,e}function wt(e,t,r,i){var n=t[0],s=t[1],o=t[2],a=t[3],c=r[0],h=r[1],l=r[2],u=r[3],d,m,v,p,b;return m=n*c+s*h+o*l+a*u,m<0&&(m=-m,c=-c,h=-h,l=-l,u=-u),1-m>Fe?(d=Math.acos(m),v=Math.sin(d),p=Math.sin((1-i)*d)/v,b=Math.sin(i*d)/v):(p=1-i,b=i),e[0]=p*n+b*c,e[1]=p*s+b*h,e[2]=p*o+b*l,e[3]=p*a+b*u,e}function Ge(e,t){var r=t[0]+t[4]+t[8],i;if(r>0)i=Math.sqrt(r+1),e[3]=.5*i,i=.5/i,e[0]=(t[5]-t[7])*i,e[1]=(t[6]-t[2])*i,e[2]=(t[1]-t[3])*i;else{var n=0;t[4]>t[0]&&(n=1),t[8]>t[n*3+n]&&(n=2);var s=(n+1)%3,o=(n+2)%3;i=Math.sqrt(t[n*3+n]-t[s*3+s]-t[o*3+o]+1),e[n]=.5*i,i=.5/i,e[3]=(t[s*3+o]-t[o*3+s])*i,e[s]=(t[s*3+n]+t[n*3+s])*i,e[o]=(t[o*3+n]+t[n*3+o])*i}return e}function Ne(e,t,r,i){var n=arguments.length>4&&arguments[4]!==void 0?arguments[4]:Re,s=Math.PI/360;t*=s,i*=s,r*=s;var o=Math.sin(t),a=Math.cos(t),c=Math.sin(r),h=Math.cos(r),l=Math.sin(i),u=Math.cos(i);switch(n){case"xyz":e[0]=o*h*u+a*c*l,e[1]=a*c*u-o*h*l,e[2]=a*h*l+o*c*u,e[3]=a*h*u-o*c*l;break;case"xzy":e[0]=o*h*u-a*c*l,e[1]=a*c*u-o*h*l,e[2]=a*h*l+o*c*u,e[3]=a*h*u+o*c*l;break;case"yxz":e[0]=o*h*u+a*c*l,e[1]=a*c*u-o*h*l,e[2]=a*h*l-o*c*u,e[3]=a*h*u+o*c*l;break;case"yzx":e[0]=o*h*u+a*c*l,e[1]=a*c*u+o*h*l,e[2]=a*h*l-o*c*u,e[3]=a*h*u-o*c*l;break;case"zxy":e[0]=o*h*u-a*c*l,e[1]=a*c*u+o*h*l,e[2]=a*h*l+o*c*u,e[3]=a*h*u-o*c*l;break;case"zyx":e[0]=o*h*u-a*c*l,e[1]=a*c*u+o*h*l,e[2]=a*h*l-o*c*u,e[3]=a*h*u+o*c*l;break;default:throw new Error("Unknown angle order "+n)}return e}var ke=ze,zt=Ht,qt=Oe;(function(){var e=T(),t=A(1,0,0),r=A(0,1,0);return function(i,n,s){var o=Yt(n,s);return o<-.999999?(yt(e,t,n),Le(e)<1e-6&&yt(e,r,n),O(e,e),mt(i,e,Math.PI),i):o>.999999?(i[0]=0,i[1]=0,i[2]=0,i[3]=1,i):(yt(e,n,s),i[0]=e[0],i[1]=e[1],i[2]=e[2],i[3]=1+o,qt(i,i))}})();(function(){var e=X(),t=X();return function(r,i,n,s,o,a){return wt(e,i,o,a),wt(t,n,s,a),wt(r,e,t,2*a*(1-a)),r}})();(function(){var e=Me();return function(t,r,i,n){return e[0]=i[0],e[3]=i[1],e[6]=i[2],e[1]=n[0],e[4]=n[1],e[7]=n[2],e[2]=-r[0],e[5]=-r[1],e[8]=-r[2],qt(t,Ge(t,e))}})();function $t(){var e=new D(2);return D!=Float32Array&&(e[0]=0,e[1]=0),e}function Tt(e,t){var r=new D(2);return r[0]=e,r[1]=t,r}function Ot(e,t){return e[0]=t[0],e[1]=t[1],e}function Xe(e,t,r){return e[0]=t,e[1]=r,e}(function(){var e=$t();return function(t,r,i,n,s,o){var a,c;for(r||(r=2),i||(i=0),n?c=Math.min(n*r+i,t.length):c=t.length,a=i;a<c;a+=r)e[0]=t[a],e[1]=t[a+1],s(e,e,o),t[a]=e[0],t[a+1]=e[1];return t}})();class We{position;rotation;scale;localMatrix;worldMatrix;_dirty=!0;parent=null;children=[];constructor(){this.position=T(),this.rotation=X(),this.scale=A(1,1,1),this.localMatrix=$(),this.worldMatrix=$()}setParent(t){if(this.parent!==t){if(this.parent){const r=this.parent.children.indexOf(this);r>=0&&this.parent.children.splice(r,1)}this.parent=t,t&&t.children.push(this),this.markDirty()}}updateMatrix(){return this.parent&&this.parent.updateMatrix(),this._dirty&&(Pe(this.localMatrix,this.rotation,this.position,this.scale),this.parent?bt(this.worldMatrix,this.parent.worldMatrix,this.localMatrix):Ee(this.worldMatrix,this.localMatrix),this._dirty=!1),this.worldMatrix}updateHierarchy(){this.updateMatrix();for(const t of this.children)t.updateHierarchy()}getWorldPosition(t){this.updateMatrix();const r=this.worldMatrix,i=t??T();return G(i,r[12],r[13],r[14]),i}getForward(t){this.updateMatrix();const r=this.worldMatrix,i=t??T();return G(i,-r[8],-r[9],-r[10]),O(i,i)}getUp(t){this.updateMatrix();const r=this.worldMatrix,i=t??T();return G(i,r[4],r[5],r[6]),O(i,i)}getRight(t){this.updateMatrix();const r=this.worldMatrix,i=t??T();return G(i,r[0],r[1],r[2]),O(i,i)}translate(t){H(this.position,this.position,t),this.markDirty()}rotate(t,r){const i=X();mt(i,r,t),Ht(this.rotation,i,this.rotation),this.markDirty()}setScale(t){N(this.scale,t),this.markDirty()}setPosition(t){N(this.position,t),this.markDirty()}setRotation(t){ke(this.rotation,t),this.markDirty()}setRotationEuler(t,r,i){const n=t*180/Math.PI,s=r*180/Math.PI,o=i*180/Math.PI;Ne(this.rotation,n,s,o),this.markDirty()}getWorldMatrix(){return this.updateMatrix()}getLocalMatrix(){return this._dirty&&this.updateMatrix(),this.localMatrix}markDirty(){if(!this._dirty){this._dirty=!0;for(const t of this.children)t.markDirty()}}getRoot(){let t=this;for(;t.parent;)t=t.parent;return t}*getParents(){let t=this.parent;for(;t;)yield t,t=t.parent}}let je=1;class B{active=!0;destroyed=!1;transform=new We;components=[];componentStarted=new WeakMap;id;name;layer=1;scene;constructor(t="GameObject"){this.id=je++,this.name=t}setActive(t){if(this.active!==t)if(this.active=t,t)for(const r of this.components)r.onEnable?.();else for(const r of this.components)r.onDisable?.()}addComponent(t){return this.components.push(t),t.owner=this,t.onAttach?.(),t}getComponent(t){for(const r of this.components)if(r instanceof t)return r;return null}getComponents(t){const r=[];for(const i of this.components)i instanceof t&&r.push(i);return r}removeComponent(t){const r=this.components.indexOf(t);r>=0&&(this.components.splice(r,1),t.onDetach?.())}update(t){if(!(!this.active||this.destroyed)){for(const r of this.components)this.componentStarted.get(r)||(r.start?.(),this.componentStarted.set(r,!0));this.components.forEach(r=>r.enabled&&r.update?.(t))}}destroy(){this.destroyed||(this.destroyed=!0,this.active=!1,this.scene?.markForDestroy(this))}forEachComponent(t){for(const r of this.components)t(r)}}class Ye{gl;uniforms;program;constructor(t,r,i){this.gl=t,this.uniforms=new Map,this.program=He(t,r,i),this.uniforms=qe(t,this.program)}bind(){this.gl.useProgram(this.program)}}function He(e,t,r){let i=e.createProgram();if(!i)throw new Error("WebGLProgram を作成できませんでした");return e.attachShader(i,t),e.attachShader(i,r),e.linkProgram(i),e.getProgramParameter(i,e.LINK_STATUS)||console.trace(e.getProgramInfoLog(i)),i}function qe(e,t){let r=new Map,i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let n=0;n<i;n++){let s=e.getActiveUniform(t,n);if(!s)continue;let o=s.name;r.set(o,e.getUniformLocation(t,o))}return r}function It(e,t,r,i){r=$e(r);const n=e.createShader(t);if(!n)throw new Error("shader が見つかりません");return e.shaderSource(n,r),e.compileShader(n),e.getShaderParameter(n,e.COMPILE_STATUS)||console.trace(e.getShaderInfoLog(n)),n}function $e(e,t){return e}function M(e,t){const r=e.uniforms.get(t);if(r==null)throw new Error(`Required uniform '${t}' is missing in program`);return r}function Y(e,t){return e.uniforms.get(t)??null}class Ke{enabled=!0;cullingMask=-1;owner;gl;fov;aspect;near;far;yaw;pitch;viewMatrix;projectionMatrix;_vp;_invVP;_qYaw;_qPitch;_q;constructor(t,r){this.gl=t,this.fov=r?.fov??Math.PI/4,this.aspect=r?.aspect??1,this.near=r?.near??.1,this.far=r?.far??1e3,this.yaw=r?.yaw??-Math.PI/2,this.pitch=r?.pitch??0,this.viewMatrix=$(),this.projectionMatrix=$(),this._vp=$(),this._invVP=$(),this._qYaw=X(),this._qPitch=X(),this._q=X()}start(){}update(t){this.updateMatrices()}onAttach(){this.updateMatrices()}onDetach(){}rotate(t,r){this.yaw+=t,this.pitch+=r;const i=Math.PI/2-.01;this.pitch>i&&(this.pitch=i),this.pitch<-i&&(this.pitch=-i),this.updateMatrices()}setAspect(t){this.aspect=t,this.updateMatrices()}getFov(){return this.fov}getAspect(){return this.aspect}updateMatrices(){if(!this.owner)return;mt(this._qYaw,[0,1,0],this.yaw),mt(this._qPitch,[1,0,0],this.pitch),Ie(this._q),zt(this._q,this._qPitch,this._q),zt(this._q,this._qYaw,this._q),this.owner.transform.setRotation(this._q);const t=this.owner.transform.getWorldMatrix();Bt(this.viewMatrix,t),Se(this.projectionMatrix,this.fov,this.aspect,this.near,this.far)}updateShaderUniforms(t){const r=M(t,"uViewMat"),i=M(t,"uProjectionMat");this.gl.uniformMatrix4fv(r,!1,this.viewMatrix),this.gl.uniformMatrix4fv(i,!1,this.projectionMatrix)}worldToScreenUV(t){const r=k(t[0],t[1],t[2],1);bt(this._vp,this.projectionMatrix,this.viewMatrix),xt(r,r,this._vp);const i=r[0]/r[3],n=r[1]/r[3],s=i*.5+.5,o=n*.5+.5;return{u:s,v:o}}screenUVToWorldOnPlane(t,r,i){const n=t*2-1,s=r*2-1;if(bt(this._vp,this.projectionMatrix,this.viewMatrix),!Bt(this._invVP,this._vp))return null;const o=k(n,s,-1,1),a=k(n,s,1,1);xt(o,o,this._invVP),xt(a,a,this._invVP);for(const p of[o,a])p[0]/=p[3],p[1]/=p[3],p[2]/=p[3],p[3]=1;const c=A(o[0],o[1],o[2]),h=A(a[0],a[1],a[2]),l=T();ct(l,h,c),O(l,l);const u=c,d=l[2];if(Math.abs(d)<1e-6)return null;const m=(i-u[2])/d;if(m<0)return null;const v=T();return jt(v,u,l,m),v}isInView(t,r=0){const i=this.worldToScreenUV(t),n=i.u,s=i.v;return n>=-r&&n<=1+r&&s>=-r&&s<=1+r}getViewInfo(t,r=0){const i=this.worldToScreenUV(t);return{visible:i.u>=-r&&i.u<=1+r&&i.v>=-r&&i.v<=1+r,uv:i}}}const vt=`precision highp float;\r
\r
attribute vec3 aPosition;\r
attribute vec2 aTexCoord;\r
\r
uniform mat4 uModelMat;\r
uniform mat4 uViewMat;\r
uniform mat4 uProjectionMat;\r
\r
varying vec2 vTexCoord;\r
varying vec3 vFragPos;\r
\r
void main() {\r
    vec4 worldPos = uModelMat * vec4(aPosition, 1.0);\r
    vFragPos = worldPos.xyz;\r
\r
    vec4 viewPos = uViewMat * worldPos;\r
    gl_Position = uProjectionMat * viewPos;\r
\r
    vTexCoord = aTexCoord;\r
}\r
`,Kt=`precision highp float;\r
\r
varying vec2 vTexCoord;\r
varying vec3 vFragPos;\r
\r
uniform vec4 uColor;\r
\r
void main(){\r
    gl_FragColor = uColor;\r
}`,Ze=`precision highp float;\r
\r
varying vec2 vTexCoord;\r
varying vec3 vFragPos;\r
\r
uniform sampler2D uTexture;\r
uniform vec2 uUVOffset;\r
uniform vec2 uUVScale;\r
\r
void main(){\r
    vec2 uv = vTexCoord * uUVScale + uUVOffset;\r
    gl_FragColor = texture2D(uTexture, uv) + vec4(0, 0, 0, 0.1);\r
}`,Qe=`// shaders/streamBulletField.frag\r
precision highp float;\r
varying vec2 vUv;\r
\r
// 中心 (0.5, 0.5) の周りをぐるぐる回る流れの例\r
uniform float uStrength;\r
\r
void main() {\r
    // [0,1]^2 → 中心を (0,0) に\r
    vec2 p = vUv - 0.5;\r
    float r = length(p);\r
\r
    // 半径ゼロで発散しないように\r
    if (r < 1e-4) {\r
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\r
        return;\r
    }\r
\r
    // 接戦方向 (−y, x) 方向に流す\r
    vec2 dir = vec2(-p.y, p.x) / r;\r
\r
    // 距離による減衰（お好みで調整）\r
    float falloff = exp(-r * 4.0);\r
\r
    vec2 v = dir * falloff * uStrength;\r
\r
    // RG にベクトルを格納\r
    gl_FragColor = vec4(v, 0.0, 1.0);\r
}\r
`,Je=`precision highp float;\r
\r
varying vec2 vTexCoord;\r
\r
uniform sampler2D uDye;      // 元の dye\r
uniform sampler2D uVelocity; // 速度テクスチャ (RG に vx,vy)\r
uniform float uVelScale;     // 速度→明るさのスケール\r
uniform float uMix;          // 0=dyeだけ, 1=最大限ゆらす\r
\r
// HSV → RGB 変換\r
vec3 hsv2rgb(vec3 c) {\r
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);\r
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r
}\r
\r
void main() {\r
    vec3 dye = texture2D(uDye, vTexCoord).rgb;\r
\r
    // --- 1) dye の強さでマスク -------------------------\r
    float intensity = dot(dye, vec3(0.299, 0.587, 0.114));\r
    float dyeMask = smoothstep(0.05, 0.20, intensity);\r
\r
    // --- 2) 速度から色を計算 ---------------------------\r
    vec2 vel = texture2D(uVelocity, vTexCoord).xy;\r
\r
    float speed = length(vel);\r
    float vMag  = clamp(speed * uVelScale, 0.0, 1.0);\r
\r
    float angle = atan(vel.y, vel.x);                  // -pi..pi\r
    float hue   = angle / (2.0 * 3.14159265) + 0.5;    // 0..1\r
\r
    // ★ 彩度・明るさをかなり抑える\r
    float sat = mix(0.1, 0.3, vMag);   // 0.1〜0.3\r
    float val = mix(0.3, 0.5, vMag);   // 0.3〜0.5\r
\r
    vec3 velColor = hsv2rgb(vec3(hue, sat, val));\r
\r
    // ★ dye が薄いところでは、ほぼ何も乗せない\r
    float localMix = uMix * dyeMask * vMag;\r
\r
    // ★ 「完全に置き換え」ではなく、少しだけずらす\r
    //    ＝ dye に対して速度色との差分を少しだけ足すイメージ\r
    vec3 shaded = (dye + localMix * (velColor - dye)) * 0.5;\r
\r
    // ハイライトが飛び過ぎないようにクランプ\r
    shaded = clamp(shaded, 0.0, 1.0);\r
\r
    gl_FragColor = vec4(shaded, 1.0);\r
}\r
`;class At{program;constructor(t){this.program=t}uploadCommonMatrices(t,r,i){const n=M(this.program,"uModelMat");t.uniformMatrix4fv(n,!1,r.transform.getWorldMatrix()),i.updateShaderUniforms(this.program)}bind(t,r,i){this.program.bind(),this.uploadCommonMatrices(t,r,i),this.uploadMaterialUniforms(t)}}class tr extends At{texture=null;textureUnit=0;uvOffset=Tt(0,0);uvScale=Tt(1,1);constructor(t,r=null,i=0){super(t),this.texture=r,this.textureUnit=i}setTexture(t){this.texture=t}uploadMaterialUniforms(t){const r=this.program.uniforms.get("uTexture"),i=this.program.uniforms.get("uUVOffset"),n=this.program.uniforms.get("uUVScale");t.activeTexture(t.TEXTURE0+this.textureUnit),t.bindTexture(t.TEXTURE_2D,this.texture),r&&t.uniform1i(r,this.textureUnit),i&&t.uniform2fv(i,this.uvOffset),n&&t.uniform2fv(n,this.uvScale)}}function er(e){const t={alpha:!0,depth:!1,stencil:!1,antialias:!1,preserveDrawingBuffer:!1};let r;r=e.getContext("webgl2",t);const i=!!r;if(i||(r=e.getContext("webgl",t)||e.getContext("experimental-webgl",t)),!r)throw new Error("WebGL is not supported");let n,s;i?(r.getExtension("EXT_color_buffer_float"),s=r.getExtension("OES_texture_float_linear")):(n=r.getExtension("OES_texture_half_float"),s=r.getExtension("OES_texture_half_float_linear")),r.clearColor(0,0,0,1);const o=i?r.HALF_FLOAT:n.HALF_FLOAT_OES;let a,c,h;if(i){const l=r;a=z(l,l.RGBA16F,l.RGBA,o),c=z(l,l.RG16F,l.RG,o),h=z(l,l.R16F,l.RED,o)}else{const l=r;a=z(l,l.RGBA,l.RGBA,o),c=z(l,l.RGBA,l.RGBA,o),h=z(l,l.RGBA,l.RGBA,o)}return{gl:r,ext:{formatRGBA:a,formatRG:c,formatR:h,halfFloatTexType:o,supportLinearFiltering:!!s}}}function z(e,t,r,i){if(!rr(e,t,r,i)){if("RGBA16F"in e){const n=e;switch(t){case n.R16F:return z(n,n.RG16F,n.RG,i);case n.RG16F:return z(n,n.RGBA16F,n.RGBA,i);default:return null}}return null}return{internalFormat:t,format:r}}function rr(e,t,r,i){let n=e.createTexture();e.bindTexture(e.TEXTURE_2D,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,t,4,4,0,r,i,null);let s=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,s),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,n,0),e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE}class Ft extends At{color=k(1,1,1,1);constructor(t,r){super(t),r&&(this.color=r)}uploadMaterialUniforms(t){const r=this.program.uniforms.get("uColor");r&&t.uniform4fv(r,this.color)}}class ir extends At{dyeTex;velTex;velScale=5;mix=.7;constructor(t,r,i,n=5,s=.7){super(t),this.dyeTex=r,this.velTex=i,this.velScale=n,this.mix=s}setTextures(t,r){this.dyeTex=t,this.velTex=r}uploadMaterialUniforms(t){const r=this.program.uniforms.get("uDye"),i=this.program.uniforms.get("uVelocity"),n=this.program.uniforms.get("uVelScale"),s=this.program.uniforms.get("uMix");t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.dyeTex),r&&t.uniform1i(r,0),t.activeTexture(t.TEXTURE1),t.bindTexture(t.TEXTURE_2D,this.velTex),i&&t.uniform1i(i,1),n&&t.uniform1f(n,this.velScale),s&&t.uniform1f(s,this.mix)}}class Zt{gl;programs=new Map;constructor(t){this.gl=t}load(t,r,i){if(this.programs.has(t))return this.programs.get(t);const n=It(this.gl,this.gl.VERTEX_SHADER,r),s=It(this.gl,this.gl.FRAGMENT_SHADER,i),o=new Ye(this.gl,n,s);return this.programs.set(t,o),o}get(t){const r=this.programs.get(t);if(!r)throw new Error(`Program '${t}' not loaded`);return r}}const C=`precision highp float;\r
\r
attribute vec2 aPosition;\r
varying vec2 vUv;\r
varying vec2 vL;\r
varying vec2 vR;\r
varying vec2 vT;\r
varying vec2 vB;\r
uniform vec2 texelSize;\r
uniform vec2 uOffset;\r
uniform vec2 uScale;\r
\r
void main(){\r
    vUv = aPosition * 0.5 + 0.5;\r
    vL = vUv - vec2(texelSize.x, 0.0);\r
    vR = vUv + vec2(texelSize.x, 0.0);\r
    vT = vUv + vec2(0.0, texelSize.y);\r
    vB = vUv - vec2(0.0, texelSize.y);\r
    gl_Position = vec4(aPosition, 0.0, 1.0);\r
}`,nr=`precision mediump float;\r
precision mediump sampler2D;\r
\r
varying highp vec2 vUv;\r
varying highp vec2 vL;\r
varying highp vec2 vR;\r
varying highp vec2 vT;\r
varying highp vec2 vB;\r
uniform sampler2D uVelocity;\r
uniform vec4 uViewRect;\r
\r
void main () {\r
    float L = texture2D(uVelocity, vL).y;\r
    float R = texture2D(uVelocity, vR).y;\r
    float T = texture2D(uVelocity, vT).x;\r
    float B = texture2D(uVelocity, vB).x;\r
    float vorticity = (R - L - T + B) * 0.5;\r
    //float inside =\r
        //step(uViewRect.x, vUv.x) * step(vUv.x, uViewRect.z) *\r
        //step(uViewRect.y, vUv.y) * step(vUv.y, uViewRect.w);\r
    vec4 result = vec4(vorticity, 0.0, 0.0, 1.0);\r
    //gl_FragColor = result * inside;\r
    gl_FragColor = result;\r
}`,sr=`precision highp float;\r
precision highp sampler2D;\r
\r
varying vec2 vUv;\r
varying vec2 vL;\r
varying vec2 vR;\r
varying vec2 vT;\r
varying vec2 vB;\r
uniform sampler2D uVelocity;\r
uniform sampler2D uCurlMap;\r
uniform float curlStrength;\r
uniform float dt;\r
\r
uniform float time;\r
\r
void main () {\r
    float L = texture2D(uCurlMap, vL).x;\r
    float R = texture2D(uCurlMap, vR).x;\r
    float T = texture2D(uCurlMap, vT).x;\r
    float B = texture2D(uCurlMap, vB).x;\r
    float C = texture2D(uCurlMap, vUv).x;\r
\r
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));\r
    force /= length(force) + 0.0001;\r
    force *= curlStrength * C;\r
    force.y *= -1.0;\r
\r
    vec2 velocity = texture2D(uVelocity, vUv).xy;\r
    velocity += force * dt;\r
    velocity = min(max(velocity, -1000.0), 1000.0);\r
    gl_FragColor = vec4(velocity, 0.0, 1.0);\r
}`,or=`// physics.frag\r
precision mediump float;\r
precision mediump sampler2D;\r
\r
varying vec2 vUv;\r
uniform sampler2D uVelocity;\r
uniform float dt;\r
\r
uniform vec2 uGravity;  // (0.0, -9.8) のようなイメージ（スケールは適当）\r
uniform vec2 uAccel;\r
uniform sampler2D uObstacle;\r
uniform sampler2D uStreamForce;\r
\r
\r
void main () {\r
    vec2 v = texture2D(uVelocity, vUv).xy;\r
    float mask = texture2D(uObstacle, vUv).r;\r
    vec2 streamMask = texture2D(uStreamForce, vUv).xy;\r
    v += uGravity * dt;      // v^{*} = v^n + dt * g\r
    v -= uAccel * dt;\r
    v += streamMask * dt * 1000000.0;   // 今は強くしておく。流れの速さを受け取ることを検討.\r
\r
    // 暴走防止（元コードの vorticity と同じ感じ）\r
    v = clamp(v, vec2(-1000.0), vec2(1000.0));\r
\r
    v *= (1.0 - mask);\r
\r
    gl_FragColor = vec4(v, 0.0, 1.0);\r
}\r
`,ar=`precision mediump float;\r
precision mediump sampler2D;\r
\r
varying highp vec2 vUv;\r
varying highp vec2 vL;\r
varying highp vec2 vR;\r
varying highp vec2 vT;\r
varying highp vec2 vB;\r
uniform sampler2D uVelocity;\r
\r
void main () {\r
    float L = texture2D(uVelocity, vL).x;\r
    float R = texture2D(uVelocity, vR).x;\r
    float T = texture2D(uVelocity, vT).y;\r
    float B = texture2D(uVelocity, vB).y;\r
\r
    vec2 C = texture2D(uVelocity, vUv).xy;\r
    if (vL.x < 0.0) { L = -C.x; }\r
    if (vR.x > 1.0) { R = -C.x; }\r
    if (vT.y > 1.0) { T = -C.y; }\r
    if (vB.y < 0.0) { B = -C.y; }\r
\r
    float div = 0.5 * (R - L + T - B);\r
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);\r
}\r
`,cr=`precision mediump float;\r
precision mediump sampler2D;\r
\r
varying highp vec2 vUv;\r
varying highp vec2 vL;\r
varying highp vec2 vR;\r
varying highp vec2 vT;\r
varying highp vec2 vB;\r
uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
\r
void main () {\r
    float L = texture2D(uPressure, vL).x;\r
    float R = texture2D(uPressure, vR).x;\r
    float T = texture2D(uPressure, vT).x;\r
    float B = texture2D(uPressure, vB).x;\r
    float C = texture2D(uPressure, vUv).x;\r
    float divergence = texture2D(uDivergence, vUv).x;\r
    float pressure = (L + R + B + T - divergence) * 0.25;\r
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);\r
}`,lr=`precision mediump float;\r
precision mediump sampler2D;\r
\r
varying highp vec2 vUv;\r
varying highp vec2 vL;\r
varying highp vec2 vR;\r
varying highp vec2 vT;\r
varying highp vec2 vB;\r
uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
\r
void main () {\r
    float L = texture2D(uPressure, vL).x;\r
    float R = texture2D(uPressure, vR).x;\r
    float T = texture2D(uPressure, vT).x;\r
    float B = texture2D(uPressure, vB).x;\r
    vec2 velocity = texture2D(uVelocity, vUv).xy;\r
    velocity.xy -= vec2(R - L, T - B) * 0.5;\r
    gl_FragColor = vec4(velocity, 0.0, 1.0);\r
}`,hr=`precision highp float;\r
precision highp sampler2D;\r
\r
varying vec2 vUv;\r
\r
uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform vec2 texelSize;\r
uniform vec2 dyeTexelSize;\r
uniform float decayDt;\r
uniform float advectDt;\r
uniform float dissipation;\r
uniform sampler2D uObstacle;\r
uniform vec4 uViewRect;\r
\r
vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {\r
    vec2 st = uv / tsize - 0.5;\r
\r
    vec2 iuv = floor(st);\r
    vec2 fuv = fract(st);\r
\r
    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);\r
    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);\r
    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);\r
    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);\r
\r
    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);\r
}\r
\r
void main () {\r
    float mask = texture2D(uObstacle, vUv).r;\r
    float inside =\r
        step(uViewRect.x, vUv.x) * step(vUv.x, uViewRect.z) *\r
        step(uViewRect.y, vUv.y) * step(vUv.y, uViewRect.w);\r
#ifdef MANUAL_FILTERING\r
    vec2 coord = vUv - advectDt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;\r
    vec4 result = bilerp(uSource, coord, dyeTexelSize);\r
#else\r
    vec2 coord = vUv - advectDt * texture2D(uVelocity, vUv).xy * texelSize;\r
    vec4 result = texture2D(uSource, coord);\r
#endif\r
    float normalDecay = 1.0 + dissipation * decayDt;\r
    float decay = mix(normalDecay, 1.0, clamp(mask, 0.0, 1.0));\r
\r
    gl_FragColor = result * inside / decay;\r
}`,ur=`precision mediump float;\r
precision mediump sampler2D;\r
\r
varying highp vec2 vUv;\r
uniform sampler2D uTexture;\r
uniform float value;\r
\r
void main () {\r
    gl_FragColor = value * texture2D(uTexture, vUv);\r
}`,fr=`precision highp float;\r
precision highp sampler2D;\r
\r
varying vec2 vUv;\r
uniform sampler2D uTarget;\r
uniform float aspectRatio;\r
uniform vec3 color;\r
uniform vec2 point;\r
uniform float radius;\r
\r
void main () {\r
    vec2 p = vUv - point.xy;\r
    p.x *= aspectRatio;\r
    vec3 splat = exp(-dot(p, p) / radius) * color;\r
    vec3 base = texture2D(uTarget, vUv).xyz;\r
    gl_FragColor = vec4(base + splat, 1.0);\r
}`,dr=`precision mediump float;\r
precision mediump sampler2D;\r
\r
varying highp vec2 vUv;\r
uniform sampler2D uTexture;\r
\r
void main () {\r
    gl_FragColor = texture2D(uTexture, vUv);\r
}`;function L(e,t,r,i,n,s,o){const a=e.createTexture();if(!a)throw new Error("createFBO: failed to create texture");e.bindTexture(e.TEXTURE_2D,a),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,i,t,r,0,n,s,null);const c=e.createFramebuffer();if(!c)throw new Error("createFBO: failed to create framebuffer");e.bindFramebuffer(e.FRAMEBUFFER,c),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,a,0);const h=e.checkFramebufferStatus(e.FRAMEBUFFER);if(h!==e.FRAMEBUFFER_COMPLETE)throw console.error("createFBO: incomplete framebuffer",{status:"0x"+h.toString(16),w:t,h:r,internalFormat:i,format:n,type:s}),new Error("createFBO: FRAMEBUFFER_INCOMPLETE (0x"+h.toString(16)+")");e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindTexture(e.TEXTURE_2D,null);const l=1/t,u=1/r;return{texture:a,fbo:c,width:t,height:r,texelSizeX:l,texelSizeY:u,attach(d){return e.activeTexture(e.TEXTURE0+d),e.bindTexture(e.TEXTURE_2D,a),d}}}function ft(e,t,r,i,n,s,o){let a=L(e,t,r,i,n,s,o),c=L(e,t,r,i,n,s,o);return{width:t,height:r,texelSizeX:a.texelSizeX,texelSizeY:a.texelSizeY,get read(){return a},set read(h){a=h},get write(){return c},set write(h){c=h},swap(){let h=a;a=c,c=h}}}function ot(e,t,r,i,n,s,o,a,c,h){let l=L(e,n,s,o,a,c,h);r.bind();let u=r.uniforms.get("uTexture");if(!u)throw new Error("uniform uTexture が見つかりません.");return e.uniform1i(u,i.attach(0)),t(l),l}function dt(e,t,r,i,n,s,o,a,c,h){return i.width==n&&i.height==s||(i.read=ot(e,t,r,i.read,n,s,o,a,c,h),i.write=L(e,n,s,o,a,c,h),i.width=n,i.height=s,i.texelSizeX=1/n,i.texelSizeY=1/s),i}class mr{gl;ext;blit;shaders;config;width;height;copyProgram;dyeScaleX;dyeScaleY;velocity;dye;logicDye;curl;divergence;pressure;stream;obstacle;paused=!1;formats;constructor(t,r,i,n,s,o,a,c,h,l,u){this.gl=t,this.ext=r,this.blit=i,this.shaders=n,this.config=s,this.width=o,this.height=a,this.formats=l,this.copyProgram=u,this.dyeScaleX=c/o,this.dyeScaleY=h/a,this.velocity=ft(t,o,a,l.vel.internalFormat,l.vel.format,l.vel.type,l.vel.param),this.dye=ft(t,c,h,l.dye.internalFormat,l.dye.format,l.dye.type,l.dye.param),this.curl=L(t,o,a,l.vel.internalFormat,l.vel.format,l.vel.type,l.vel.param),this.divergence=L(t,o,a,l.pressure.internalFormat,l.pressure.format,l.pressure.type,l.pressure.param),this.pressure=ft(t,o,a,l.pressure.internalFormat,l.pressure.format,l.pressure.type,l.pressure.param),this.stream=L(t,o,a,l.stream.internalFormat,l.stream.format,l.stream.type,l.stream.param),this.obstacle=L(t,o,a,l.obstacle.internalFormat,l.obstacle.format,l.obstacle.type,l.obstacle.param),this.logicDye=ft(t,c,h,l.dye.internalFormat,l.dye.format,l.dye.type,l.dye.param),this.clearObstacle(),this.clearStream()}step(t,r={uMin:0,uMax:1,vMin:0,vMax:1},i={x:0,y:0}){if(this.paused){this.decayOnly(t,r);return}this.computeCurl(r),this.applyVorticity(t,r),this.applyPhysics(t,r,i),this.computeDivergence(r),this.clearPressure(),this.solvePressure(r),this.subtractGradient(r),this.advectVelocityAndDye(t,r)}setPaused(t){this.paused=t}getPaused(){return this.paused}splat(t,r,i,n,s,o){const a=this.gl,c=this.shaders.splat;c.bind();const h=this.width/this.height,l=c.uniforms.get("uTarget"),u=c.uniforms.get("aspectRatio"),d=c.uniforms.get("point"),m=c.uniforms.get("color"),v=c.uniforms.get("radius"),p=s.a??1;a.uniform1i(l,this.velocity.read.attach(0)),a.uniform1f(u,h),a.uniform2f(d,t,r),a.uniform3f(m,i,n,0),a.uniform1f(v,this.correctRadius(this.config.SPLAT_RADIUS/100,o)),this.blit(this.velocity.write),this.velocity.swap(),a.uniform1i(l,this.dye.read.attach(0)),a.uniform3f(m,s.r*p,s.g*p,s.b*p),this.blit(this.dye.write),this.dye.swap()}logicSplat(t,r,i,n){const s=this.gl,o=this.shaders.splat;o.bind();const a=this.width/this.height,c=o.uniforms.get("uTarget"),h=o.uniforms.get("aspectRatio"),l=o.uniforms.get("point"),u=o.uniforms.get("color"),d=o.uniforms.get("radius"),m=i.a??1;s.uniform1i(c,this.logicDye.read.attach(0)),s.uniform1f(h,a),s.uniform2f(l,t,r),s.uniform3f(u,i.r*m,i.g*m,i.b*m),s.uniform1f(d,this.correctRadius(this.config.SPLAT_RADIUS/100,n)),this.blit(this.logicDye.write),this.logicDye.swap()}getDyeTexture(){return this.dye.read.texture}getVelTexture(){return this.velocity.read.texture}getLogicTexture(){return this.logicDye.read.texture}sampleVelocity(t,r){const i=this.gl,n=Math.min(this.width-1,Math.max(0,Math.floor(t*this.width))),s=Math.min(this.height-1,Math.max(0,Math.floor(r*this.height))),o=i.getParameter(i.FRAMEBUFFER_BINDING);i.bindFramebuffer(i.FRAMEBUFFER,this.velocity.read.fbo);const a=new Float32Array(4);return i.readPixels(n,s,1,1,i.RGBA,i.FLOAT,a),i.bindFramebuffer(i.FRAMEBUFFER,o),{x:a[0],y:a[1]}}sampleLogic(t,r){const i=this.gl,n=Math.min(this.logicDye.width-1,Math.max(0,Math.floor(t*this.logicDye.width))),s=Math.min(this.logicDye.height-1,Math.max(0,Math.floor(r*this.logicDye.height))),o=i.getParameter(i.FRAMEBUFFER_BINDING);i.bindFramebuffer(i.FRAMEBUFFER,this.logicDye.read.fbo);const a=new Float32Array(4);return i.readPixels(n,s,1,1,i.RGBA,i.FLOAT,a),i.bindFramebuffer(i.FRAMEBUFFER,o),{r:a[0],g:a[1],b:a[2],a:a[3]}}getObstacleTarget(){return this.obstacle}getStreamTarget(){return this.stream}clearObstacle(){const t=this.gl,r=this.obstacle;t.bindFramebuffer(t.FRAMEBUFFER,r.fbo),t.viewport(0,0,r.width,r.height),t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT),t.bindFramebuffer(t.FRAMEBUFFER,null)}clearStream(){const t=this.gl,r=this.stream;t.bindFramebuffer(t.FRAMEBUFFER,r.fbo),t.viewport(0,0,r.width,r.height),t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT),t.bindFramebuffer(t.FRAMEBUFFER,null)}computeCurl(t){const r=this.shaders.curl;r.bind(),this.applyCommonUniforms(r,t,this.velocity);const i=M(r,"uVelocity");this.gl.uniform1i(i,this.velocity.read.attach(0)),this.blit(this.curl)}applyVorticity(t,r){const i=this.shaders.vorticity;i.bind(),this.applyCommonUniforms(i,r,this.velocity);const n=M(i,"uVelocity"),s=M(i,"uCurlMap"),o=M(i,"curlStrength"),a=M(i,"dt");this.gl.uniform1i(n,this.velocity.read.attach(0)),this.gl.uniform1i(s,this.curl.attach(1)),this.gl.uniform1f(o,this.config.CURL),this.gl.uniform1f(a,t),this.blit(this.velocity.write),this.velocity.swap()}applyPhysics(t,r,i={x:0,y:0}){const n=this.shaders.physics;n.bind(),this.applyCommonUniforms(n,r,this.velocity);const s=M(n,"uVelocity"),o=M(n,"dt"),a=Y(n,"uAccel"),c=Y(n,"uGravity"),h=Y(n,"uStreamForce");this.gl.uniform1i(s,this.velocity.read.attach(0)),this.gl.uniform1f(o,t),c!=null&&this.gl.uniform2f(c,0,-this.config.GRAVITY),a!=null&&this.gl.uniform2f(a,i.x,i.y),h!=null&&this.gl.uniform1i(h,this.stream.attach(1)),this.blit(this.velocity.write),this.velocity.swap()}computeDivergence(t){const r=this.shaders.divergence;r.bind(),this.applyCommonUniforms(r,t,this.velocity);const i=M(r,"uVelocity");this.gl.uniform1i(i,this.velocity.read.attach(0)),this.blit(this.divergence)}clearPressure(){const t=this.shaders.clear;t.bind();const r=M(t,"uTexture"),i=M(t,"value");this.gl.uniform1i(r,this.pressure.read.attach(0)),this.gl.uniform1f(i,this.config.PRESSURE),this.blit(this.pressure.write),this.pressure.swap()}solvePressure(t){const r=this.shaders.pressure;r.bind(),this.applyCommonUniforms(r,t,this.velocity);const i=M(r,"uDivergence"),n=M(r,"uPressure");this.gl.uniform1i(i,this.divergence.attach(0));for(let s=0;s<this.config.PRESSURE_ITERATIONS;s++)this.gl.uniform1i(n,this.pressure.read.attach(1)),this.blit(this.pressure.write),this.pressure.swap()}subtractGradient(t){const r=this.shaders.subtractGradient;r.bind(),this.applyCommonUniforms(r,t,this.velocity);const i=M(r,"uPressure"),n=M(r,"uVelocity");this.gl.uniform1i(i,this.pressure.read.attach(0)),this.gl.uniform1i(n,this.velocity.read.attach(1)),this.blit(this.velocity.write),this.velocity.swap()}advectVelocityAndDye(t,r,i=!1){const n=this.shaders.advection;n.bind(),this.applyCommonUniforms(n,r,this.velocity);const s=Y(n,"dyeTexelSize"),o=M(n,"uVelocity"),a=M(n,"uSource");let c=M(n,"dissipation");const h=Y(n,"advectDt"),l=Y(n,"decayDt"),u=i?0:t,d=t;if(h&&this.gl.uniform1f(h,u),l&&this.gl.uniform1f(l,d),!this.ext.supportLinearFiltering&&s==null)throw new Error("dyeTexelSize uniform が見つかりません（MANUAL_FILTERING 有効時）");this.ext.supportLinearFiltering||this.gl.uniform2f(s,this.velocity.texelSizeX,this.velocity.texelSizeY);let m=this.velocity.read.attach(0);this.gl.uniform1i(o,m),this.gl.uniform1i(a,m),this.gl.uniform1f(c,this.config.VELOCITY_DISSIPATION),this.blit(this.velocity.write),this.velocity.swap(),this.ext.supportLinearFiltering||this.gl.uniform2f(s,this.dye.texelSizeX,this.dye.texelSizeY),this.gl.uniform1i(o,this.velocity.read.attach(0)),this.gl.uniform1i(a,this.dye.read.attach(1)),this.gl.uniform1f(c,this.config.DENSITY_DISSIPATION),this.blit(this.dye.write),this.dye.swap(),this.ext.supportLinearFiltering||this.gl.uniform2f(s,this.logicDye.texelSizeX,this.logicDye.texelSizeY),this.gl.uniform1i(o,this.velocity.read.attach(0)),this.gl.uniform1i(a,this.logicDye.read.attach(1)),this.gl.uniform1f(c,this.config.LOGIC_DISSIPATION),this.blit(this.logicDye.write),this.logicDye.swap()}decayOnly(t,r){this.advectVelocityAndDye(t,r,!0)}applyCommonUniforms(t,r,i){this.bindObstacle(t),this.bindUVClamp(t,r);const n=M(t,"texelSize");this.gl.uniform2f(n,i.texelSizeX,i.texelSizeY)}bindObstacle(t){const r=t.uniforms.get("uObstacle");r!=null&&this.gl.uniform1i(r,this.obstacle.attach(3))}bindUVClamp(t,r){const i=t.uniforms.get("uViewRect");i!=null&&this.gl.uniform4f(i,r.uMin,r.vMin,r.uMax,r.vMax)}correctRadius(t,r){let i=r.width/r.height;return i>1&&(t*=i),t}resize(t,r){const i=this.gl,n=Math.max(1,t),s=Math.max(1,r);if(n===this.width&&s===this.height)return;this.width=n,this.height=s;const o=Math.max(1,Math.floor(n*this.dyeScaleX)),a=Math.max(1,Math.floor(s*this.dyeScaleY)),{vel:c,dye:h,pressure:l,stream:u,obstacle:d}=this.formats;this.velocity=dt(i,this.blit,this.copyProgram,this.velocity,n,s,c.internalFormat,c.format,c.type,c.param),this.curl=ot(i,this.blit,this.copyProgram,this.curl,n,s,c.internalFormat,c.format,c.type,c.param),this.divergence=ot(i,this.blit,this.copyProgram,this.divergence,n,s,l.internalFormat,l.format,l.type,l.param),this.pressure=dt(i,this.blit,this.copyProgram,this.pressure,n,s,l.internalFormat,l.format,l.type,l.param),this.stream=ot(i,this.blit,this.copyProgram,this.stream,n,s,u.internalFormat,u.format,u.type,u.param),this.obstacle=ot(i,this.blit,this.copyProgram,this.obstacle,n,s,d.internalFormat,d.format,d.type,d.param),this.dye=dt(i,this.blit,this.copyProgram,this.dye,o,a,h.internalFormat,h.format,h.type,h.param),this.logicDye=dt(i,this.blit,this.copyProgram,this.logicDye,o,a,h.internalFormat,h.format,h.type,h.param),this.clearObstacle(),this.clearStream()}}class vr{gl;ext;constructor(t,r){this.gl=t,this.ext=r}velocityFormat(){return{internalFormat:this.ext.formatRGBA.internalFormat,format:this.ext.formatRGBA.format,type:this.ext.halfFloatTexType,param:this.ext.supportLinearFiltering?this.gl.LINEAR:this.gl.NEAREST}}pressureFormat(){return{internalFormat:this.ext.formatR.internalFormat,format:this.ext.formatR.format,type:this.ext.halfFloatTexType,param:this.gl.NEAREST}}dyeFormat(){return{internalFormat:this.ext.formatRGBA.internalFormat,format:this.ext.formatRGBA.format,type:this.ext.halfFloatTexType,param:this.ext.supportLinearFiltering?this.gl.LINEAR:this.gl.NEAREST}}streamFormat(){return{internalFormat:this.ext.formatRG.internalFormat,format:this.ext.formatRG.format,type:this.ext.halfFloatTexType,param:this.gl.NEAREST}}obstacleFormat(){const t=this.ext.formatR??this.ext.formatRGBA;return{internalFormat:t.internalFormat,format:t.format,type:this.ext.halfFloatTexType,param:this.gl.NEAREST}}}class K{enabled=!0;owner;transform;velocity=T();acceleration=T();forceAccum=T();mass;dragK;freezePosX=!1;freezePosY=!1;freezePosZ=!1;_tmpV=T();_tmpA=T();_tmpPos=T();constructor(t=1,r=2){this.mass=t,this.dragK=r,this.transform=void 0}onAttach(){if(!this.owner){console.warn("RigidBody: owner がありません");return}this.transform=this.owner.transform}start(){}update(t){this.integrate(t)}onDetach(){}addForce(t,r="force"){r==="impulse"?(V(this._tmpV,t,1/this.mass),H(this.velocity,this.velocity,this._tmpV)):H(this.forceAccum,this.forceAccum,t)}integrate(t){if(t<=0||!this.transform)return;const r=this.transform.position;N(this._tmpPos,r),this.applyFreezeToForce();const i=N(this._tmpV,this.velocity);if(this.dragK>0){const n=this.dragK/this.mass,s=Math.exp(-n*t);V(this._tmpV,this.velocity,s);const o=(1-s)/this.dragK;V(this._tmpA,this.forceAccum,o);const a=this.velocity;H(a,this._tmpV,this._tmpA),this.applyFreezeToVector(a),V(this._tmpA,a,t),this.freezePosX&&(this._tmpA[0]=0),this.freezePosY&&(this._tmpA[1]=0),this.freezePosZ&&(this._tmpA[2]=0),H(r,r,this._tmpA),ct(this.acceleration,a,i),V(this.acceleration,this.acceleration,1/t)}else V(this.acceleration,this.forceAccum,1/this.mass),this.applyFreezeToVector(this.acceleration),jt(this.velocity,this.velocity,this.acceleration,t),this.applyFreezeToVector(this.velocity),V(this._tmpA,this.velocity,t),this.freezePosX&&(this._tmpA[0]=0),this.freezePosY&&(this._tmpA[1]=0),this.freezePosZ&&(this._tmpA[2]=0),H(r,r,this._tmpA);this.freezePosX&&(r[0]=this._tmpPos[0]),this.freezePosY&&(r[1]=this._tmpPos[1]),this.freezePosZ&&(r[2]=this._tmpPos[2]),G(this.forceAccum,0,0,0),this.transform.markDirty()}setPosition(t){if(!this.transform)return;const r=this.transform.position;this.freezePosX||(r[0]=t[0]),this.freezePosY||(r[1]=t[1]),this.freezePosZ||(r[2]=t[2]),this.applyFreezeToVector(this.velocity),this.applyFreezeToVector(this.acceleration),G(this.forceAccum,0,0,0),this.transform.markDirty()}applyFreezeToVector(t){this.freezePosX&&(t[0]=0),this.freezePosY&&(t[1]=0),this.freezePosZ&&(t[2]=0)}applyFreezeToForce(){this.freezePosX&&(this.forceAccum[0]=0),this.freezePosY&&(this.forceAccum[1]=0),this.freezePosZ&&(this.forceAccum[2]=0)}}class Qt{strength;color;logicColor;scene;fluidSim;canvas;prevUV=$t();initialized=!1;logicSplat;rb=null;enabled=!0;owner;constructor(t,r,i,n=1,s={r:1,g:0,b:0,a:1},o=!1,a=null){this.scene=t,this.fluidSim=r,this.canvas=i,this.logicSplat=o,this.strength=n,this.color=s,this.logicColor=a??void 0}start(){if(!this.owner)return;const t=this.scene.MainCamera;if(!t)return;const r=t.worldToScreenUV(this.owner.transform.getWorldPosition());Xe(this.prevUV,r.u,r.v),this.initialized=!0,this.rb=this.owner.getComponent(K)}update(t){if(!this.owner||!this.enabled)return;const r=this.scene.MainCamera;if(!r)return;const i=r.worldToScreenUV(this.owner.transform.getWorldPosition()),n=Tt(i.u,i.v);if(!this.initialized){Ot(this.prevUV,n),this.initialized=!0;return}let s,o;const a=this.rb;if(a){const c=this.strength*t;s=a.velocity[0]*c,o=a.velocity[1]*c}else s=(n[0]-this.prevUV[0])*this.strength,o=(n[1]-this.prevUV[1])*this.strength;if(n[0]>=0&&n[0]<=1&&n[1]>=0&&n[1]<=1&&(this.fluidSim.splat(n[0],n[1],s,o,this.color,this.canvas),this.logicSplat)){const c=this.logicColor?this.logicColor:this.color;this.fluidSim.logicSplat(n[0],n[1],c,this.canvas)}Ot(this.prevUV,n)}onAttach(){}onDetach(){}}class pr{enabled=!0;owner;input={left:!1,right:!1,up:!1,down:!1};thrustForce;maxSpeed;dragK;moveHeldTime=0;hadInputLastFrame=!1;constructor(t=20,r=4,i=10){this.thrustForce=t,this.maxSpeed=r,this.dragK=i,window.addEventListener("keydown",n=>this.onKey(n,!0)),window.addEventListener("keyup",n=>this.onKey(n,!1))}onKey(t,r){switch(t.key){case"a":case"ArrowLeft":this.input.left=r;break;case"d":case"ArrowRight":this.input.right=r;break;case"w":case"ArrowUp":this.input.up=r;break;case"s":case"ArrowDown":this.input.down=r;break}}start(){}update(t){if(!this.owner||!this.enabled)return;const r=this.owner.getComponent(K);if(!r)return;const i=T();this.input.left&&(i[0]-=1),this.input.right&&(i[0]+=1),this.input.down&&(i[1]-=1),this.input.up&&(i[1]+=1);const n=Math.hypot(i[0],i[1]);if(n>0){if(this.hadInputLastFrame?this.moveHeldTime+=t:this.moveHeldTime=0,this.hadInputLastFrame=!0,i[0]/=n,i[1]/=n,r.velocity[0]*i[0]+r.velocity[1]*i[1]<this.maxSpeed){const o=T(),a=this.thrustCurve(this.moveHeldTime);V(o,i,this.thrustForce*a),r.addForce(o)}}else{this.hadInputLastFrame=!1,this.moveHeldTime=0;const s=T();V(s,r.velocity,-this.dragK),r.addForce(s)}}onAttach(){}onDetach(){}thrustCurve(t){if(t<=0)return 0;if(t<.08)return t/.08;const n=(t-.08)/.25,s=1.3-.6*Math.min(n,1);return Math.max(.6,s)}}class Jt{enabled=!0;owner;scene;fluid;dragStrength;rb=null;waveFactor=1;_triedGetRb=!1;constructor(t,r,i=.01){this.scene=t,this.fluid=r,this.dragStrength=i}setWaveFactor(t){this.waveFactor=Math.max(0,Math.min(1,t))}start(){this.tryCacheRb()}update(t){if(!this.enabled||!this.owner)return;const r=this.scene.MainCamera;if(!r)return;const i=this.rb;if(!i||this.fluid.getPaused())return;const n=this.owner.transform.getWorldPosition(),s=r.worldToScreenUV(n);let o=s.u,a=s.v;if(o<0||o>1||a<0||a>1)return;const c=this.fluid.sampleVelocity(o,a);let h=c.x-i.velocity[0],l=c.y-i.velocity[1];const u=.05;o<u&&h<0&&(h=0),o>1-u&&h>0&&(h=0),a<u&&l<0&&(l=0),a>1-u&&l>0&&(l=0),i.addForce(A(this.dragStrength*this.waveFactor*h,this.dragStrength*this.waveFactor*l,0))}onAttach(){this.tryCacheRb()}onDetach(){}tryCacheRb(){if(!this.owner||this.rb)return;const t=this.owner.getComponent(K);if(!t&&!this._triedGetRb){console.warn("FluidDrag: RigidBody が見つかりません"),this._triedGetRb=!0;return}t&&(this.rb=t,this._triedGetRb=!0)}}class gr{enabled=!0;owner;camera;dist;follow;constructor(t,r=1,i=!1){this.camera=t,this.dist=r,this.follow=i}start(){!this.owner||!this.camera.owner||(this.follow&&this.owner.transform.setParent(this.camera.owner.transform),this.updateLocalTransform())}update(t){}updateLocalTransform(){if(!this.owner||!this.camera.owner)return;const t=this.camera.getFov(),r=this.camera.getAspect(),i=this.camera.owner.transform.getWorldPosition();if(this.follow){const n=2*this.dist*Math.tan(t/2),s=n*r;this.owner.transform.setPosition(A(0,0,-this.dist)),this.owner.transform.setScale(A(s,n,1))}else{const n=i[2]-this.dist,s=2*this.dist*Math.tan(t/2),o=s*r;this.owner.transform.setPosition(A(i[0],i[1],n)),this.owner.transform.setScale(A(o,s,1))}}}class te{vertices;indices;constructor(t,r){this.vertices=t,this.indices=r}}function ee(e=1){const t=e*.5,r=[{pos:[-t,t,0],uv:[0,1]},{pos:[-t,-t,0],uv:[0,0]},{pos:[t,-t,0],uv:[1,0]},{pos:[t,t,0],uv:[1,1]}],i=[0,1,2,0,2,3];return new te(r,i)}function Pt(e=.5,t=16,r=32){const i=[],n=[];for(let s=0;s<=t;s++){const o=s*Math.PI/t,a=Math.sin(o),c=Math.cos(o);for(let h=0;h<=r;h++){const l=h*2*Math.PI/r,u=Math.sin(l),m=Math.cos(l)*a,v=c,p=u*a,b=h/r,R=s/t;i.push({pos:[m*e,v*e,p*e],uv:[b,1-R]})}}for(let s=0;s<t;s++)for(let o=0;o<r;o++){const a=s*(r+1)+o,c=a+r+1;n.push(a,c,a+1),n.push(c,c+1,a+1)}return new te(i,n)}function yr(e,t,r){const{radius:i,material:n,layer:s,hitScale:o=1,name:a="Sphere",isTrigger:c=!0}=r,h=Pt(i),l=new B(a);return l.addComponent(new W(h)),l.addComponent(new j(e,n)),l.addComponent(new at(t,i*o,s,c)),t.addObject(l),l}class re{enabled=!0;owner;scene;life;targetLayers;outOfBoundsMargin;onHitCallback;constructor(t,r=5,i=[],n=.1){this.scene=t,this.life=r,this.targetLayers=i,this.outOfBoundsMargin=n}canHit(t){return this.targetLayers.length===0?!0:this.targetLayers.includes(t)}start(){if(!this.owner)return;const t=this.owner.getComponent(at);t&&(t.onTriggerEnter=r=>this.onTrigger(r))}update(t){if(!this.enabled||!this.owner)return;if(this.life-=t,this.life<=0){this.destroySelf();return}const r=this.scene.MainCamera;if(!r)return;const i=this.owner.transform.getWorldPosition(),n=r.worldToScreenUV(i),s=this.outOfBoundsMargin;if(n.u<-s||n.u>1+s||n.v<-s||n.v>1+s){this.destroySelf();return}}onTrigger(t){this.owner&&this.canHit(t.layer)&&(this.onHitCallback&&t.owner&&this.onHitCallback(this.owner,t.owner),this.destroySelf())}destroySelf(){this.owner&&(typeof this.owner.destroy=="function"?this.owner.destroy():(this.owner.active=!1,this.scene.removeObject&&this.scene.removeObject(this.owner)))}onAttach(){}onDetach(){}}class ie{enabled=!0;owner;path;time=0;originLocal=T();prevLocalOnPath=T();_curr=T();_delta=T();constructor(t){this.path=t}start(){this.owner&&(this.time=0,N(this.originLocal,this.owner.transform.position),N(this.prevLocalOnPath,this.originLocal))}update(t){if(!this.enabled||!this.owner)return;this.time+=t;const r=this.path(this.time);G(this._curr,this.originLocal[0]+r.x,this.originLocal[1]+r.y,this.originLocal[2]+r.z),ct(this._delta,this._curr,this.prevLocalOnPath),this.owner.transform.translate(this._delta),N(this.prevLocalOnPath,this._curr)}onAttach(){}onDetach(){}}function ne(e,t){const r=O(T(),e);return i=>({x:r[0]*t*i,y:r[1]*t*i,z:r[2]*t*i})}function se(e,t,r){const{radius:i,material:n,colliderLayer:s,hitLayers:o,lifeSec:a=5,localPath:c,hitScale:h=1,name:l="ProjectileSphere"}=r,u=Pt(i),d=new B(l);d.addComponent(new W(u)),d.addComponent(new j(e,n));const m=new at(t,i*h,s,!0);if(d.addComponent(m),d.addComponent(new ie(c)),d.addComponent(new re(t,a,o)),r.fluid?.enabled){const{fluidSim:v,canvas:p,strength:b=10,color:R={r:.5,g:.1,b:.1}}=r.fluid;d.addComponent(new Qt(t,v,p,b,R)),d.addComponent(new K),d.addComponent(new Jt(t,v,.015))}return t.addObject(d),d}class xr{enabled=!0;owner;scene;padding;constructor(t,r=.05){this.scene=t,this.padding=r}start(){}update(t){if(!this.enabled||!this.owner)return;const r=this.scene.MainCamera;if(!r)return;const i=this.owner.transform.getWorldPosition(),n=r.worldToScreenUV(i);let{u:s,v:o}=n,a=!1;if(s<this.padding&&(s=this.padding,a=!0),s>1-this.padding&&(s=1-this.padding,a=!0),o<this.padding&&(o=this.padding,a=!0),o>1-this.padding&&(o=1-this.padding,a=!0),!a)return;const c=r.screenUVToWorldOnPlane(s,o,i[2]);if(!c)return;this.owner.transform.setPosition(c);const h=this.owner.getComponent(K);h&&(s===this.padding&&h.velocity[0]<0&&(h.velocity[0]=0),s===1-this.padding&&h.velocity[0]>0&&(h.velocity[0]=0),o===this.padding&&h.velocity[1]<0&&(h.velocity[1]=0),o===1-this.padding&&h.velocity[1]>0&&(h.velocity[1]=0))}onAttach(){}onDetach(){}}const Rt={Default:"default",FixedInterval:"fixedInterval"},Mt=new Map;function wr(e){Mt.set(Rt.Default,()=>Dt),Mt.set(Rt.FixedInterval,()=>new br(e,.5))}const Dt={update(e,t){e.State===St.Dead&&e.owner?.destroy()}};class br{timer=0;interval;ctx;constructor(t,r){this.ctx=t,this.interval=Math.max(r,.1)}update(t,r){t.State===St.Dead&&t.owner?.destroy();const i=t.config;!i||!i.fire||(this.timer+=r,this.timer>=this.interval&&(console.log("fire"),this.timer-=this.interval,i.fire(this.ctx,t)))}}const Tr={getDirectionToTarget(e,t){const r=e.getWorldPosition(),i=t.getWorldPosition(),n=ct(T(),i,r);return O(n,n)},getDistance(e,t){const r=e.getWorldPosition(),i=t.getWorldPosition();return Ue(r,i)},getClampedDirection(e,t,r){const i=e.getForward(),n=this.getDirectionToTarget(e,t),s=Math.acos(Yt(i,n)),o=r*Math.PI/180;if(s<=o)return n;const a=o/s,c=Ve(T(),i,n,a);return O(c,c)},getLookAtAngleZ(e,t){const r=e.getWorldPosition(),i=t.getWorldPosition(),n=i[0]-r[0],s=i[1]-r[1];return Math.atan2(s,n)}},Fr=(e,t,r,i)=>{if(!i.material)return;const n=Pt(.07);r.addComponent(new W(n)),r.addComponent(new j(e,i.material)),r.addComponent(new at(t,.07,"enemy",!0))},oe=new Map,ae={id:0,hitPoint:10,visual:Fr,materialKey:"enemySmall",getBulletSource(e){const t=e.owner;if(!t)throw new Error("Enemy has no owner");return t.transform},fire(e,t){const s=60*Math.PI/180,a=(t.config??ae).getBulletSource(t),c=t.target?Tr.getDirectionToTarget(a,t.target):A(0,-1,0);for(let h=0;h<5;h++){const d=(h/4-.5)*s,m=_e(c),v=m[0],p=m[1],b=Math.cos(d),R=Math.sin(d);m[0]=v*b-p*R,m[1]=v*R+p*b;const S=ne(m,3),g=se(e.gl,e.scene,{radius:.05,material:e.material,colliderLayer:"bullet",hitLayers:["player","wall"],localPath:S,lifeSec:10});g.transform.setParent(a),g.transform.setPosition(A(0,0,0))}},createStrategy(e){const t=Mt.get(Rt.FixedInterval);return t?t(e):Dt}};function Rr(e){const t={...ae,material:e.enemySmall};oe.set(t.id,t)}const St={Default:"default",Dead:"dead"};class Mr{enabled=!0;owner;state=St.Default;name="enemy";config;strategy;target;constructor(t,r,i){const n=oe.get(t);if(!n)throw new Error(`EnemyConfig not found for typeId=${t}`);this.config=n,this.name=i??"enemy",this.strategy=n.createStrategy?n.createStrategy(r):Dt}setTarget(t){this.target=t}start(){if(!this.owner)return;const t=this.owner.getComponent(at);if(!t){console.warn("Enemy: SphereCollider が見つかりません");return}t.onTriggerEnter=r=>{if(r.layer!=="bullet")return;const i=r.owner;if(!i)return;const n=i.getComponent(re);n&&n.canHit("enemy")&&(console.log("[Enemy] hit by bullet",{self:this.owner,other:r}),this.kill())}}update(t){this.strategy.update(this,t)}onAttach(){}onDetach(){}get State(){return this.state}get instanceId(){return this.owner?.id}kill(){this.state="dead",console.log(`${this.name} is killed.`)}createVisual(t,r){this.owner&&this.config.visual(t,r,this.owner,this.config)}}function Er(e){return{unlitColor:e.load("UnlitColor",vt,Kt)}}function Ar(e){const t=k(1,.8,.8,0),r=k(1,.3,.3,0),i=new Ft(e.unlitColor,t),n=new Ft(e.unlitColor,r);return{player:i,enemySmall:n}}const P=document.querySelector("canvas"),ce=window.devicePixelRatio||1,Pr=P.clientWidth,Dr=P.clientHeight;P.width=Pr*ce;P.height=Dr*ce;const{gl:f,ext:le}=er(P);if(!f)throw new Error("WebGL RenderingContext が見つかりません.");const lt=new Zt(f),Sr=Er(lt),pt=Ar(Sr);Rr(pt);const _r=lt.load("UnlitColor",vt,Kt),Cr=k(1,0,0,0),Ur=new Ft(_r,Cr),Vr=lt.load("UnlitTex",vt,Ze),Lr=lt.load("DyeVelVisual",vt,Je),he=(f.bindBuffer(f.ARRAY_BUFFER,f.createBuffer()),f.bufferData(f.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),f.STATIC_DRAW),f.bindBuffer(f.ELEMENT_ARRAY_BUFFER,f.createBuffer()),f.bufferData(f.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),f.STATIC_DRAW),f.vertexAttribPointer(0,2,f.FLOAT,!1,0,0),f.enableVertexAttribArray(0),(e,t=!1)=>{e==null?(f.viewport(0,0,f.drawingBufferWidth,f.drawingBufferHeight),f.bindFramebuffer(f.FRAMEBUFFER,null)):(f.viewport(0,0,e.width,e.height),f.bindFramebuffer(f.FRAMEBUFFER,e.fbo)),t&&(f.clearColor(0,0,0,1),f.clear(f.COLOR_BUFFER_BIT)),f.drawElements(f.TRIANGLES,6,f.UNSIGNED_SHORT,0)});function Br(e,t,r,i){const n=t.load("BulletStreamField",C,Qe),s=64,o=i.streamFormat(),a=L(e,s,s,o.internalFormat,o.format,o.type,o.param);e.bindFramebuffer(e.FRAMEBUFFER,a.fbo),e.viewport(0,0,s,s),n.bind();const c=n.uniforms.get("uStrength");return c&&e.uniform1f(c,3e-4),r(a),e.bindFramebuffer(e.FRAMEBUFFER,null),a.texture}const U=new Zt(f),zr=U.load("curl",C,nr),Or=U.load("vorticity",C,sr),Ir=U.load("physics",C,or),Gr=U.load("divergence",C,ar),Nr=U.load("pressure",C,cr),kr=U.load("subtractGradient",C,lr),Xr=U.load("advection",C,hr),Wr=U.load("clear",C,ur),jr=U.load("splat",C,fr),Yr={curl:zr,vorticity:Or,physics:Ir,divergence:Gr,pressure:Nr,subtractGradient:kr,advection:Xr,clear:Wr,splat:jr},Hr={CURL:30,GRAVITY:0,PRESSURE:.8,PRESSURE_ITERATIONS:20,VELOCITY_DISSIPATION:.2,DENSITY_DISSIPATION:2.2,SPLAT_RADIUS:.01,LOGIC_DISSIPATION:2.2};function ue(e){let t=f.drawingBufferWidth/f.drawingBufferHeight;t<1&&(t=1/t);let r=Math.round(e),i=Math.round(e*t);return f.drawingBufferWidth>f.drawingBufferHeight?{width:i,height:r}:{width:r,height:i}}const qr=256;let Gt=ue(qr);const $r=1024;let Nt=ue($r);const q=new vr(f,le),Kr={vel:q.velocityFormat(),dye:q.dyeFormat(),pressure:q.pressureFormat(),stream:q.streamFormat(),obstacle:q.obstacleFormat()},Zr=Br(f,lt,he,q),Qr=U.load("copy",C,dr),_=new mr(f,le,he,Yr,Hr,Gt.width,Gt.height,Nt.width,Nt.height,Kr,Qr);f.bindFramebuffer(f.FRAMEBUFFER,null);f.viewport(0,0,P.width,P.height);const F=new be,Et=new Te(f),Z={default:1,obstacle:2,stream:4},_t=new B("MainCamera");_t.transform.translate(A(0,0,5));const Ct=_t.addComponent(new Ke(f,{fov:Math.PI/4,aspect:P.width/P.height,near:.1,far:1e3,yaw:0,pitch:0}));Ct.cullingMask=Z.default;F.addObject(_t);F.setMainCamera(Ct);const fe=ee(1),ht=new B("Quad");ht.layer=Z.default;let de=new ir(Lr,_.getDyeTexture(),_.getVelTexture());const me=new gr(Ct,5,!1);ht.addComponent(new W(fe));ht.addComponent(new j(f,de));ht.addComponent(me);F.addObject(ht);const Q=new B("obstacle");Q.layer=Z.obstacle;Q.addComponent(new W(fe));Q.addComponent(new j(f,Ur));Q.transform.setScale(A(.5,.5,.5));Q.transform.translate(A(-2,-1.5,0));F.addObject(Q);const Jr=ee(9),ut=new B("stream"),ti=new tr(Vr,Zr);ut.addComponent(new W(Jr));ut.addComponent(new j(f,ti));ut.layer=Z.stream;ut.transform.translate(A(0,0,0));F.addObject(ut);const I=yr(f,F,{radius:.05,material:pt.player,layer:"player",hitScale:.3,name:"Player"}),ei=new pr(50,1,20),ve=new K(10);ve.freezePosZ=!0;const ri=new Jt(F,_,.05);I.addComponent(ei);I.addComponent(ve);I.addComponent(ri);I.addComponent(new xr(F,.01));const Ut=new B("emitter"),pe=2e3,ii=new Qt(F,_,P,pe,{r:0,g:0,b:.5});Ut.addComponent(ii);Ut.transform.setParent(I.transform);I.transform.translate(A(-2,-1.5,0));F.addObject(Ut);const Vt=new B;Vt.transform.translate(A(1,1,0));F.addObject(Vt);const gt=new B("Enemy");gt.transform.setParent(Vt.transform);gt.addComponent(new ie(e=>({x:Math.cos(e),y:Math.sin(e),z:0})));const ge={gl:f,scene:F,canvas:P,material:pt.player,fluid:_};wr(ge);const Lt=new Mr(0,ge);Lt.setTarget(I.transform);gt.addComponent(Lt);Lt.createVisual(f,F);F.addObject(gt);function ye(){F.update(0);const e=F.MainCamera;if(e){const t=e.cullingMask,r=_.getObstacleTarget();e.cullingMask=Z.obstacle;const i=f.getParameter(f.FRAMEBUFFER_BINDING),n=f.getParameter(f.VIEWPORT);Et.render(F,e,r),f.bindFramebuffer(f.FRAMEBUFFER,i),f.viewport(n[0],n[1],n[2],n[3]),e.cullingMask=t}}ye();let kt=performance.now();function xe(e){let t=(e-kt)/1e3;if(kt=e,t=Math.min(t,1/30),ni(P)){const n=P.width,s=P.height,o=F.MainCamera;o&&o.setAspect(n/s),_.resize(n,s),me.updateLocalTransform(),ye()}F.update(t);const i=F.MainCamera;if(i){const n=i.cullingMask,s=f.getParameter(f.FRAMEBUFFER_BINDING),o=f.getParameter(f.VIEWPORT),a=_.getStreamTarget();i.cullingMask=Z.stream,Et.render(F,i,a),f.bindFramebuffer(f.FRAMEBUFFER,s),f.viewport(o[0],o[1],o[2],o[3]),i.cullingMask=n,_.step(t),de.setTextures(_.getDyeTexture(),_.getVelTexture()),Et.render(F,i)}requestAnimationFrame(xe)}requestAnimationFrame(xe);P.addEventListener("click",e=>{const t=F.MainCamera;if(!t)return;const r=P.getBoundingClientRect(),i=e.clientX-r.left,n=e.clientY-r.top,s=i/r.width,o=1-n/r.height,a=I.transform.getWorldPosition(),c=t.screenUVToWorldOnPlane(s,o,a[2]);if(!c)return;const h=T();if(ct(h,c,a),Wt(h)===0)return;const d=ne(h,3);se(f,F,{radius:.04,material:pt.player,colliderLayer:"bullet",hitLayers:["enemy"],lifeSec:5,localPath:d,name:"PlayerBullet",fluid:{enabled:!0,fluidSim:_,canvas:P,strength:pe,color:{r:0,g:1,b:0}}}).transform.setPosition(a)});function Xt(e){const t=window.devicePixelRatio||1;return Math.floor(e*t)}function ni(e){const t=Xt(e.clientWidth),r=Xt(e.clientHeight);return e.width!==t||e.height!==r?(e.width=t,e.height=r,!0):!1}
