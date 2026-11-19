(function(){
if (customElements.get('town-scene')) return;
const SRC='three'; // same three.js as the game (import map)
let THREEP=null;
const rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[(Math.random()*a.length)|0], clamp=(v,a,b)=>v<a?a:v>b?b:v;
const P={
  day:{bg:'#b9b6f1',sky:'#e8ebff',gnd:'#9c8c7a',hemi:1.05,sun:'#fff3e2',sunI:2.6,sunPos:[18,30,12],win:0,lamp:0,exp:1.0},
  dusk:{bg:'#e8a7a6',sky:'#ffd1b4',gnd:'#6c5272',hemi:.62,sun:'#ff9858',sunI:1.9,sunPos:[30,9,4],win:.9,lamp:.7,exp:1.05},
  night:{bg:'#25285a',sky:'#5865c9',gnd:'#1f1f3d',hemi:.38,sun:'#a2b4ff',sunI:.5,sunPos:[-14,26,10],win:2.2,lamp:1.5,exp:1.15}
};
const BODY=['#f2a7b5','#a9dcc9','#c9b4e6','#f6dc8a','#f3ead4','#9cc7ea','#c96a4e','#e09a6c','#ecc7a3','#b8d98f','#f7c6a0'];
const ROOF=['#b84a3a','#5b6b9a','#8c3f35','#4f5d7a','#a8553f'];
const DOOR=['#2f4f8a','#b83a3a','#2f6b4a','#23232b','#6d3f8f'];
const SIGN=['#2f5a46','#2c3e6e','#7a2e2e','#3b3b3b'];
const SHIRT=['#e94f4f','#3f7be0','#f2c443','#53b36b','#9b5de5','#f28c38','#ffffff','#2b2b3a','#ef6aa8'];
const SKIN=['#f1c9a5','#d9a47a','#a8704a','#6e4429','#f6d9bf'];

class TownScene extends HTMLElement{
  static get observedAttributes(){return ['config'];}
  constructor(){super();this.cfg={time:'day',weather:'clear',traffic:true,people:true,clouds:true,birds:true,boats:true,sway:true,coins:true,orbit:false,camera:'iso',quality:'high'};}
  set config(v){this._cfgIn(v);} get config(){return this.cfg;}
  attributeChangedCallback(n,o,v){if(n==='config')this._cfgIn(v);}
  _cfgIn(v){let o=v;if(typeof v==='string'){try{o=JSON.parse(v);}catch(e){return;}}if(o&&typeof o==='object')Object.assign(this.cfg,o);if(this.ready)this.applyCfg();}
  connectedCallback(){
    Object.assign(this.style,{display:'block',position:'relative',width:'100%',height:'100%',touchAction:'none',overflow:'hidden'});
    if(this.ready){this.loop();return;}
    if(this.loading)return;this.loading=true;
    (THREEP||(THREEP=import(SRC))).then(T=>this.init(T)).catch(()=>{this.textContent='3D engine failed to load';});
  }
  disconnectedCallback(){cancelAnimationFrame(this.raf);this.raf=0;}
  loop(){if(this.raf)return;let last=performance.now();const f=now=>{this.raf=requestAnimationFrame(f);const dt=Math.min(.05,(now-last)/1000);last=now;this.tick(dt);};this.raf=requestAnimationFrame(f);}

  init(T){
    this.T=T;const S=this;
    const r=new T.WebGLRenderer({antialias:true});
    r.setPixelRatio(Math.min(devicePixelRatio,2));r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;
    r.toneMapping=T.ACESFilmicToneMapping;r.outputColorSpace=T.SRGBColorSpace;
    r.domElement.style.cssText='display:block;width:100%;height:100%;cursor:grab';
    this.appendChild(r.domElement);this.renderer=r;
    const scene=new T.Scene();this.scene=scene;
    const cur={bg:new T.Color(P.day.bg),sky:new T.Color(P.day.sky),gnd:new T.Color(P.day.gnd),sun:new T.Color(P.day.sun),hemi:1.05,sunI:2.6,win:0,lamp:0,exp:1,pos:new T.Vector3(...P.day.sunPos)};
    this.cur=cur;scene.background=cur.bg;
    this.tmp={c1:new T.Color(),c2:new T.Color(),v:new T.Vector3(),grey:new T.Color('#8e93a8'),snow:new T.Color('#dfe6f5')};
    const hemi=new T.HemisphereLight(cur.sky,cur.gnd,1);scene.add(hemi);this.hemi=hemi;
    const sun=new T.DirectionalLight(cur.sun,2.6);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
    Object.assign(sun.shadow.camera,{left:-26,right:26,top:26,bottom:-26,near:1,far:130});
    sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;scene.add(sun);scene.add(sun.target);this.sun=sun;

    const G={},M={};
    const mat=(c,o)=>{const k=c+(o?JSON.stringify(o):'');return M[k]||(M[k]=new T.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0},o||{})));};
    const box1=new T.BoxGeometry(1,1,1),sph=new T.SphereGeometry(1,20,14),cylG=new T.CylinderGeometry(1,1,1,16);
    const add=(p,g,m,x=0,y=0,z=0)=>{const me=new T.Mesh(g,m);me.position.set(x,y,z);me.castShadow=true;me.receiveShadow=true;p.add(me);return me;};
    const boxM=(p,w,h,d,m,x,y,z)=>{const me=add(p,box1,m,x,y,z);me.scale.set(w,h,d);return me;};
    const ball=(p,rad,m,x,y,z)=>{const me=add(p,sph,m,x,y,z);me.scale.setScalar(rad);return me;};
    const rbox=(w,h,d,rr=.12)=>{const k=[w,h,d,rr].map(v=>v.toFixed(2)).join();if(G[k])return G[k];
      const r0=Math.min(rr,w/4,d/4,h/2.2),iw=w-2*r0,id=d-2*r0,cr=Math.min(r0,iw/2-.001,id/2-.001),x0=-iw/2,y0=-id/2,s=new T.Shape();
      s.moveTo(x0+cr,y0);s.lineTo(x0+iw-cr,y0);s.quadraticCurveTo(x0+iw,y0,x0+iw,y0+cr);s.lineTo(x0+iw,y0+id-cr);s.quadraticCurveTo(x0+iw,y0+id,x0+iw-cr,y0+id);
      s.lineTo(x0+cr,y0+id);s.quadraticCurveTo(x0,y0+id,x0,y0+id-cr);s.lineTo(x0,y0+cr);s.quadraticCurveTo(x0,y0,x0+cr,y0);
      const g=new T.ExtrudeGeometry(s,{depth:Math.max(.001,h-2*r0),bevelEnabled:true,bevelThickness:r0,bevelSize:r0,bevelSegments:3,curveSegments:4});
      g.rotateX(-Math.PI/2);g.translate(0,r0,0);return G[k]=g;};
    const roofGeo=(w,d,rh)=>{const k='r'+[w,d,rh].map(v=>v.toFixed(2)).join();if(G[k])return G[k];const s=new T.Shape();s.moveTo(-d/2,0);s.lineTo(d/2,0);s.lineTo(0,rh);s.closePath();
      const g=new T.ExtrudeGeometry(s,{depth:w,bevelEnabled:true,bevelThickness:.04,bevelSize:.04,bevelSegments:1});g.translate(0,0,-w/2);g.rotateY(Math.PI/2);return G[k]=g;};
    const canvasTex=(w,h,draw,rep)=>{const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'));const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;if(rep)t.repeat.set(...rep);return t;};
    const stripe=(a,b)=>new T.MeshStandardMaterial({roughness:.8,map:canvasTex(64,4,x=>{for(let i=0;i<8;i++){x.fillStyle=i%2?b:a;x.fillRect(i*8,0,8,4);}})});
    const awnMats=[stripe('#e84a4a','#fff6ee'),stripe('#3d6fd1','#fff6ee'),stripe('#2f9a5a','#fff6ee'),stripe('#f08a3c','#fff6ee')];
    const winOn=new T.MeshStandardMaterial({color:'#3a4a7c',roughness:.2,metalness:.1,emissive:'#ffc46b',emissiveIntensity:0});
    const winOff=new T.MeshStandardMaterial({color:'#3a4a7c',roughness:.2,metalness:.1,emissive:'#ffc46b',emissiveIntensity:0});
    const bulb=new T.MeshStandardMaterial({color:'#fff6d8',emissive:'#ffd27a',emissiveIntensity:0});
    this.winOn=winOn;this.winOff=winOff;this.bulb=bulb;
    const pickWin=()=>Math.random()<.7?winOn:winOff;
    const frameMat=mat('#f7f2e8');

    // ground
    add(scene,rbox(36,1.7,27,.7),mat('#a5794f'),0,-1.9,0);
    add(scene,rbox(35.6,.28,26.6,.18),mat('#d2c6af'),0,-.26,0);
    boxM(scene,37,.1,4,mat('#5b5d6a',{roughness:.95}),0,.05,0);
    boxM(scene,3,.099,27,mat('#5b5d6a',{roughness:.95}),7,.0495,0);
    const swalk=mat('#e1d6c1');
    for(const z of[-2.65,2.65]){boxM(scene,15.6,.16,1.3,swalk,-2.4,.08,z);boxM(scene,8.4,.16,1.3,swalk,13.8,.08,z);}
    for(const x of[4.85,9.15])for(const z of[-8.4,8.4])boxM(scene,.7,.16,10.2,swalk,x,.08,z);
    const white=mat('#f4f2ea');
    for(let x=-17.5;x<17.6;x+=1.8){if(x>4.6&&x<9.4)continue;boxM(scene,.8,.02,.12,white,x,.11,0);}
    for(let z=-13;z<13.1;z+=1.8){if(Math.abs(z)<3.6)continue;boxM(scene,.12,.02,.8,white,7,.11,z);}
    boxM(scene,.18,.02,1.8,white,5.25,.11,-1);boxM(scene,.18,.02,1.8,white,8.75,.11,1);
    for(const z of[-2.65,2.65])for(let x=5.8;x<8.3;x+=.5)boxM(scene,.25,.02,1,white,x,.11,z);

    // houses
    const tappables=[],houses=[];this.tappables=tappables;this.houses=houses;
    const win=(g,x,y,z,s,sash)=>{boxM(g,.6,.8,.08,frameMat,x,y,z+s*.02);boxM(g,.46,.64,.1,pickWin(),x,y,z+s*.03);if(sash)boxM(g,.46,.05,.12,frameMat,x,y,z+s*.03);};
    const flowers=(g,x,y,z)=>{boxM(g,.6,.13,.2,mat('#6b4428'),x,y-.47,z+.12);boxM(g,.54,.1,.16,mat('#4e9a3c'),x,y-.37,z+.12);ball(g,.07,mat(pick(['#e8445a','#ff7fb0','#ffd34a'])),x-.15,y-.31,z+.15);ball(g,.07,mat('#e8445a'),x+.14,y-.31,z+.15);};
    const house=(x,z,w,d,h,face,o={})=>{
      const g=new T.Group();g.position.set(x,0,z);g.rotation.y=face>0?0:Math.PI;
      add(g,rbox(w-.04,h,d,.1),mat(o.body||pick(BODY)));
      let top=h;
      if(o.flat){add(g,rbox(w+.1,.32,d+.1,.08),mat('#f1ebe0'),0,h-.04,0);top=h+.28;}
      else{const rh=rnd(1.1,1.5);add(g,roofGeo(w+.24,d+.5,rh),mat(o.roof||pick(ROOF)),0,h-.03,0);top=h+rh;}
      const cx=(Math.random()<.5?-1:1)*w*.28;boxM(g,.42,1,.55,mat('#b4513c'),cx,top-.25,-d*.12);
      for(const i of[-1,1])add(g,cylG,mat('#d9773f'),cx+i*.1,top+.33,-d*.12).scale.set(.07,.2,.07);
      if(Math.random()<.6)boxM(g,w+.02,.1,d+.04,mat('#f4efe4'),0,1.72,0);
      const cols=Math.max(1,Math.floor(w/1)),sp=w/cols;
      for(let y=2.25;y<h-.5;y+=1.2)for(let c=0;c<cols;c++){const wx=-w/2+sp*(c+.5);win(g,wx,y,d/2,1,true);win(g,wx,y,-d/2,-1,false);if(Math.random()<.35)flowers(g,wx,y,d/2);}
      if(o.shop){boxM(g,w*.78,.95,.08,frameMat,0,.75,d/2+.02);boxM(g,w*.68,.8,.1,pickWin(),0,.75,d/2+.03);
        const aw=boxM(g,w*.86,.05,.8,pick(awnMats),0,1.46,d/2+.36);aw.rotation.x=.42;boxM(g,w*.72,.26,.07,mat(pick(SIGN)),0,1.86,d/2+.03);}
      else{const dx=cols>1?-sp/2:0;boxM(g,.5,.98,.08,mat(pick(DOOR)),dx,.49,d/2+.03);boxM(g,.5,.14,.09,frameMat,dx,1.07,d/2+.03);boxM(g,.72,.1,.3,mat('#e4dccb'),dx,.05,d/2+.15);if(cols>1)win(g,sp/2,.95,d/2,1,true);}
      win(g,0,.95,-d/2,-1,false);
      g.userData.tap={kind:'house',t:-1,top,base:1};
      scene.add(g);tappables.push(g);houses.push(g);return g;};
    this.house=house;
    const row=(x0,x1,z,face,o={})=>{let x=x0;while(x1-x>1.7){let w=Math.min(rnd(o.wmin||2,o.wmax||2.6),x1-x);if(x1-x-w<1.7)w=x1-x;
      house(x+w/2,z,w,o.d||3,rnd(o.hmin||3.6,o.hmax||4.8),face,{shop:o.shops&&Math.random()<.5,flat:o.flat?Math.random()<o.flat:false,body:o.bodies?pick(o.bodies):undefined});x+=w;}};
    row(-5.4,4.6,-5,1,{shops:true,flat:.5});row(10,17.4,-5,1,{shops:true,flat:.5});
    row(-5.4,4.6,-9.7,1,{hmin:5,hmax:5.8,d:2.8,bodies:['#c2654a','#b8573f','#cf7a55','#a9503c']});
    row(-16.8,4.6,5,-1,{shops:true,flat:.4});row(10,17.4,5,-1,{shops:true,flat:.4});

    // landmarks
    const stone=mat('#dcbc80');
    add(scene,rbox(5,4.2,3.2,.1),stone,11.9,0,-10.1);
    for(let x=9.9;x<14.1;x+=.8)for(const y of[1.3,2.9])boxM(scene,.32,1.05,.1,pickWin(),x,y,-8.47);
    const spireG=new T.ConeGeometry(.3,1.3,4);
    for(const sx of[-2.3,2.3])for(const sz of[-1.4,1.4])add(scene,spireG,stone,11.9+sx,4.85,-10.1+sz);
    add(scene,rbox(1.7,7.4,1.7,.08),mat('#d4b273'),11.9,0,-10.4);
    add(scene,new T.ConeGeometry(1.35,2.2,4),mat('#4a5577'),11.9,8.5,-10.4).rotation.y=Math.PI/4;
    add(scene,rbox(2.2,7.4,2.2,.08),mat('#d6b06e'),16,0,-10.2);
    add(scene,rbox(2.6,1.9,2.6,.1),mat('#e2c286'),16,7.3,-10.2);
    add(scene,new T.ConeGeometry(1.95,3,4),mat('#3f4d70'),16,10.7,-10.2).rotation.y=Math.PI/4;
    add(scene,new T.ConeGeometry(.12,1,8),mat('#e8b84a',{metalness:.6,roughness:.3}),16,12.6,-10.2);
    for(let y=1.2;y<7;y+=1.5)for(const s of[1,-1]){boxM(scene,.3,.8,.1,pickWin(),16,y,-10.2+s*1.11);}
    this.hands=[];
    const faceG=new T.CylinderGeometry(.75,.75,.06,28);faceG.rotateX(Math.PI/2);
    for(let k=0;k<4;k++){const fg=new T.Group();fg.position.set(16,8.25,-10.2);fg.rotation.y=k*Math.PI/2;scene.add(fg);
      add(fg,faceG,mat('#fbf6e6'),0,0,1.32);
      const hp=new T.Group(),mp=new T.Group();hp.position.z=mp.position.z=1.37;fg.add(hp);fg.add(mp);
      boxM(hp,.07,.36,.03,mat('#1f1f28'),0,.15,0);boxM(mp,.05,.56,.03,mat('#1f1f28'),0,.25,.02);this.hands.push({hp,mp});}
    // flag
    add(scene,cylG,mat('#444'),16,13.4,-10.2).scale.set(.03,1.6,.03);
    const flagTex=canvasTex(120,60,x=>{x.fillStyle='#1f3f8f';x.fillRect(0,0,120,60);x.lineCap='butt';
      x.strokeStyle='#fff';x.lineWidth=12;x.beginPath();x.moveTo(0,0);x.lineTo(120,60);x.moveTo(120,0);x.lineTo(0,60);x.stroke();
      x.strokeStyle='#d0263a';x.lineWidth=4;x.stroke();x.fillStyle='#fff';x.fillRect(0,21,120,18);x.fillRect(50,0,20,60);x.fillStyle='#d0263a';x.fillRect(0,25,120,10);x.fillRect(54,0,12,60);});
    const flagGeo=new T.PlaneGeometry(1.2,.64,12,4);flagGeo.translate(.6,0,0);
    const flag=new T.Mesh(flagGeo,new T.MeshStandardMaterial({map:flagTex,side:T.DoubleSide,roughness:.9}));flag.position.set(16.03,13.9,-10.2);flag.castShadow=true;scene.add(flag);
    this.flag=flag;this.flagBase=flagGeo.attributes.position.array.slice();

    // park
    const grass=mat('#6cc24a'),path=mat('#e6d6b6'),wood=mat('#a8754a');
    add(scene,rbox(10.6,.18,8.9,.15),grass,-11.7,0,-8);
    boxM(scene,10.2,.04,.9,path,-11.7,.19,-8);boxM(scene,.9,.04,8.5,path,-11.7,.19,-8);
    add(scene,new T.CylinderGeometry(2.1,2.1,.06,32),path,-11.7,.2,-8);
    add(scene,new T.CylinderGeometry(1.4,1.5,.25,6),mat('#f0ebe0'),-11.7,.3,-8);
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;add(scene,cylG,mat('#f7f3ea'),-11.7+Math.cos(a)*1.2,1.2,-8+Math.sin(a)*1.2).scale.set(.06,1.6,.06);}
    add(scene,new T.ConeGeometry(1.8,1.1,6),mat('#8a5a44'),-11.7,2.55,-8);ball(scene,.14,mat('#e8b84a'),-11.7,3.15,-8);
    for(const [x,z,ry] of[[-15,-8.8,0],[-8.4,-8.8,0],[-12.6,-11.4,Math.PI/2]]){const b=new T.Group();b.position.set(x,.18,z);b.rotation.y=ry;scene.add(b);boxM(b,1.2,.08,.36,wood,0,.42,0);boxM(b,1.2,.3,.06,wood,0,.62,-.16);for(const s of[-.5,.5])boxM(b,.06,.4,.3,mat('#3a3a44'),s,.2,0);}
    // swings
    const sw=new T.Group();sw.position.set(-8.6,.18,-5.6);scene.add(sw);const dark=mat('#3a3d55');
    for(const s of[-1.1,1.1])boxM(sw,.08,1.9,.08,dark,s,.95,0);boxM(sw,2.3,.08,.08,mat('#d94a4a'),0,1.9,0);
    this.swings=[];for(const s of[-.45,.45]){const pv=new T.Group();pv.position.set(s,1.9,0);sw.add(pv);for(const q of[-.17,.17])boxM(pv,.02,1.35,.02,dark,q,-.68,0);boxM(pv,.42,.05,.22,mat('#f2c443'),0,-1.36,0);this.swings.push(pv);}
    // bunting
    this.bunting=[];const flagCone=new T.ConeGeometry(.13,.3,3);const bcol=[mat('#d0263a'),mat('#f7f2e8'),mat('#2c4fa8')];
    const poles=[-16.4,-11.7,-7];for(const x of poles)add(scene,cylG,mat('#6b4428'),x,1.25,-3.75).scale.set(.05,2.5,.05);
    for(let i=0;i<poles.length-1;i++){const a=poles[i],b=poles[i+1];for(let k=1;k<12;k++){const f=k/12,x=a+(b-a)*f,y=2.42-.5*Math.sin(f*Math.PI);const m=add(scene,flagCone,bcol[k%3],x,y-.15,-3.75);m.rotation.x=Math.PI;this.bunting.push(m);}}

    // trees
    this.trees=[];const greens=[mat('#4caf50'),mat('#5ec04a'),mat('#3f9a43'),mat('#6bc95a')],trunk=mat('#7a5232');
    const tree=(x,z,s=1)=>{const g=new T.Group();g.position.set(x,0,z);scene.add(g);add(g,cylG,trunk,0,.45*s,0).scale.set(.12*s,.9*s,.12*s);
      const c=new T.Group();c.position.y=.85*s;g.add(c);const gm=pick(greens);ball(c,.78*s,gm,0,.6*s,0);ball(c,.56*s,gm,.4*s,.3*s,.25*s);ball(c,.56*s,pick(greens),-.35*s,.32*s,-.22*s);
      this.trees.push({c,ph:Math.random()*6});};
    for(let z=-12;z<=-4.4;z+=1.9)tree(-16.5,z,rnd(.9,1.15));
    for(let x=-14.6;x<=-7.4;x+=1.9)if(Math.abs(x+11.7)>1.2)tree(x,-12.3,rnd(.9,1.2));
    for(const [x,z] of[[-14.5,-5.3],[-9.2,-10.6],[-14.6,-10.4],[-7,-11],[-7,-7.6]])tree(x,z,rnd(.85,1.1));
    for(let x=-15.8;x<=4.4;x+=2.4)if(Math.abs(x-1.6)>1.8)tree(x,12.3,rnd(.9,1.15));
    for(const x of[11,13.6,16.4])tree(x,12.1,rnd(.85,1.05));
    for(const x of[-4.5,-1.5,1.8,4])tree(x,-7.35,.62);
    tree(17.2,-6.9,.8);tree(10.1,-7.2,.7);

    // market
    for(const [x,c] of[[-13,1],[-10,0],[-7,3],[-4,2]]){const g=new T.Group();g.position.set(x,0,8.5);scene.add(g);
      boxM(g,1.6,.7,.8,wood,0,.35,0);for(const sx of[-.75,.75])for(const sz of[-.35,.35])boxM(g,.06,1.6,.06,dark,sx,.8,sz);
      const rf=boxM(g,1.9,.06,1.1,awnMats[c],0,1.65,0);rf.rotation.x=.15;
      for(let i=0;i<6;i++)ball(g,.11,mat(pick(['#e8445a','#f28c38','#9ccf3a','#ffd34a','#7a3fa0'])),-.6+i*.24,.8,rnd(-.2,.2));}
    // build plot
    const plot=new T.Group();plot.position.set(1.6,0,9.7);scene.add(plot);
    add(plot,rbox(2.8,.12,2.8,.06),mat('#efe4cc'),0,0,0);
    for(const sx of[-1.25,1.25])for(const sz of[-1.25,1.25])add(plot,new T.ConeGeometry(.12,.35,10),mat('#f08a3c'),sx,.29,sz);
    const plus=new T.Group();plus.position.y=1.3;plot.add(plus);const pm=mat('#3fbf6a',{emissive:'#1a6b33',emissiveIntensity:.3});
    boxM(plus,1,.3,.3,pm,0,0,0);boxM(plus,.3,1,.3,pm,0,0,0);
    const hit=new T.Mesh(box1,new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.scale.set(2.8,2.4,2.8);hit.position.y=1.2;plot.add(hit);
    plot.userData.tap={kind:'plot'};tappables.push(plot);this.plot=plot;this.plus=plus;

    // canal + bridge
    add(scene,rbox(8.2,.3,3.6,.08),mat('#bfb39c'),13.9,0,8.6);
    const water=add(scene,rbox(7.8,.14,3,.05),new T.MeshStandardMaterial({color:'#4fa7e3',roughness:.15,metalness:.1}),13.9,.06,8.6);water.castShadow=false;
    const ripT=canvasTex(128,128,x=>{x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=2;for(let i=0;i<18;i++){const cx=Math.random()*128,cy=Math.random()*128,l=rnd(10,26);x.beginPath();x.moveTo(cx,cy);x.quadraticCurveTo(cx+l/2,cy-3,cx+l,cy);x.stroke();}},[3,1.2]);
    const rip=new T.Mesh(new T.PlaneGeometry(7.6,2.9),new T.MeshBasicMaterial({map:ripT,transparent:true,depthWrite:false}));rip.rotation.x=-Math.PI/2;rip.position.set(13.9,.21,8.6);scene.add(rip);this.rip=rip;this.ripT=ripT;
    const st=mat('#b7aa92');for(const z of[6.95,10.25])boxM(scene,.9,.95,.5,st,12.5,.48,z);
    add(scene,rbox(1.5,.32,3.9,.06),st,12.5,.95,8.6);for(const s of[-.7,.7])boxM(scene,.1,.35,3.9,st,12.5+s,1.4,8.6);
    add(scene,rbox(7.6,.16,2.4,.12),grass,13.9,0,11.9);

    // lamps + lights
    this.lamps=[];let li=0;
    for(const x of[-14,-8,-2,3.4,11,15.6])for(const z of[-3.05,3.05]){add(scene,cylG,dark,x,1.1,z).scale.set(.06,2.2,.06);ball(scene,.15,bulb,x,2.25,z);boxM(scene,.32,.08,.32,dark,x,2.42,z);
      if(li++%2===0){const pl=new T.PointLight('#ffc77a',0,8,1.6);pl.position.set(x,2.1,z);scene.add(pl);this.lamps.push(pl);}}
    // traffic lights
    const sig=c=>new T.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.05});
    this.sig={mr:sig('#ff3b3b'),mg:sig('#3bff7a'),cr:sig('#ff3b3b'),cg:sig('#3bff7a')};
    for(const [x,z,k] of[[5,-3.05,'m'],[9,3.05,'m'],[5,3.05,'c'],[9,-3.05,'c']]){add(scene,cylG,dark,x,1.3,z).scale.set(.06,2.6,.06);boxM(scene,.26,.62,.26,mat('#22232e'),x,2.7,z);ball(scene,.14,this.sig[k+'r'],x,2.86,z);ball(scene,.14,this.sig[k+'g'],x,2.54,z);}

    // vehicles
    const vG=new T.Group();scene.add(vG);this.vG=vG;
    const wheelG=new T.CylinderGeometry(1,1,1,16);wheelG.rotateX(Math.PI/2);const tyre=mat('#1d1d22');
    const wheels=(g,l,rw,wd)=>{for(const sx of[-l,l])for(const sz of[-wd,wd])add(g,wheelG,tyre,sx,rw,sz).scale.set(rw,rw,.2);};
    const bus=()=>{const g=new T.Group(),red=mat('#d6262b',{roughness:.45});add(g,rbox(3.4,1.05,1.25,.12),red,0,.25,0);add(g,rbox(3.4,1,1.25,.14),red,0,1.32,0);
      boxM(g,3.42,.08,1.27,mat('#f2e6c8'),0,1.33,0);boxM(g,2.6,.42,1.29,winOn,-.3,.85,0);boxM(g,.08,.45,1,winOn,1.68,.85,0);boxM(g,3.1,.45,1.29,winOn,0,1.85,0);boxM(g,.08,.45,1.05,winOn,1.68,1.85,0);
      boxM(g,.06,.18,.8,mat('#222'),1.71,1.15,0);for(const s of[-.42,.42])boxM(g,.06,.12,.18,bulb,1.71,.45,s);wheels(g,1.1,.27,.55);return {g,len:3.5,v0:rnd(2.2,2.8)};};
    const car=(taxi)=>{const g=new T.Group(),c=taxi?mat('#1b1b22',{roughness:.3,metalness:.3}):mat(pick(['#3f7be0','#f2c443','#53b36b','#f7f2e8','#9b5de5']),{roughness:.4});
      add(g,rbox(2.1,.62,1.05,.14),c,0,.2,0);add(g,rbox(1.3,.56,.98,.14),c,-.12,.78,0);boxM(g,1.2,.32,1.01,winOn,-.12,1.02,0);
      if(taxi)boxM(g,.32,.12,.18,mat('#ffd34a',{emissive:'#ffb800',emissiveIntensity:.6}),-.12,1.4,0);for(const s of[-.34,.34])boxM(g,.06,.1,.2,bulb,1.06,.48,s);wheels(g,.68,.22,.46);return {g,len:2.2,v0:rnd(2.6,3.4)};};
    const lanes=[
      {axis:'x',c:-1,dir:1,min:-18.6,max:18.6,lo:5.4,hi:8.6,grp:'m'},{axis:'x',c:1,dir:-1,min:-18.6,max:18.6,lo:5.4,hi:8.6,grp:'m'},
      {axis:'z',c:7.75,dir:1,min:-13.9,max:13.9,lo:-3.4,hi:3.4,grp:'c'},{axis:'z',c:6.25,dir:-1,min:-13.9,max:13.9,lo:-3.4,hi:3.4,grp:'c'}];
    const mk=[[bus,()=>car(true),()=>car(false),()=>car(true)],[()=>car(true),bus,()=>car(false),bus],[()=>car(true),()=>car(false)],[bus,()=>car(true)]];
    lanes.forEach((L,i)=>{L.L=L.max-L.min;L.enter=L.dir>0?L.lo-L.min:L.max-L.hi;L.vs=mk[i].map((f,k)=>{const v=f();v.p=L.L/mk[i].length*k+rnd(0,1.5);v.speed=v.v0;v.ph=Math.random()*6;vG.add(v.g);
      v.g.rotation.y=L.axis==='x'?(L.dir>0?0:Math.PI):(L.dir>0?-Math.PI/2:Math.PI/2);return v;});});
    this.lanes=lanes;

    // people
    const pG=new T.Group();scene.add(pG);this.pG=pG;const capG=new T.CapsuleGeometry(.13,.3,3,8);
    const person=()=>{const g=new T.Group();const b=add(g,capG,mat(pick(SHIRT)),0,.36,0);ball(g,.12,mat(pick(SKIN)),0,.72,0);pG.add(g);return g;};
    this.walkers=[];for(let i=0;i<18;i++){const side=i%2?1:-1;const w={g:person(),z:side*rnd(2.3,2.95),x:rnd(-17,17),dir:Math.random()<.5?1:-1,sp:rnd(.7,1.15),ph:Math.random()*6};w.g.position.set(w.x,.16,w.z);this.walkers.push(w);}
    this.wanderers=[];const zones=[[-16,-7.3,-11.8,-4.4,.18],[-16,4.2,7.4,11.4,0],[10.8,17,11.2,12.6,.16]];
    for(let i=0;i<20;i++){const zn=zones[i<10?0:i<17?1:2];const w={g:person(),zn,wait:rnd(0,2),ph:Math.random()*6,tx:0,tz:0};w.g.position.set(rnd(zn[0],zn[1]),zn[4],rnd(zn[2],zn[3]));w.tx=w.g.position.x;w.tz=w.g.position.z;this.wanderers.push(w);}

    // boats
    const bG=new T.Group();scene.add(bG);this.bG=bG;bG.add(rip);
    this.boats=[[ '#d6262b',10.8,7.9,1],['#2c4fa8',16.6,9.3,-1]].map(([c,x,z,d])=>{const g=new T.Group();add(g,rbox(1.5,.36,.66,.12),mat(c,{roughness:.4}),0,0,0);boxM(g,1.52,.06,.68,mat('#f7f2e8'),0,.3,0);add(g,rbox(.62,.32,.5,.08),mat('#f7f2e8'),-.2,.33,0);boxM(g,.5,.14,.52,winOn,-.2,.52,0);
      g.position.set(x,.1,z);bG.add(g);return {g,x,dir:d,sp:rnd(.6,.9),ph:Math.random()*6};});

    // clouds
    const cG=new T.Group();scene.add(cG);this.cG=cG;const cm=new T.MeshStandardMaterial({color:'#ffffff',roughness:1,emissive:'#ffffff',emissiveIntensity:.18,transparent:true,opacity:.95});
    this.clouds=[];for(let i=0;i<6;i++){const g=new T.Group();for(let k=0;k<5;k++){const m=new T.Mesh(sph,cm);m.castShadow=true;m.position.set(rnd(-1.8,1.8),rnd(0,.5),rnd(-1,1));m.scale.set(rnd(1,1.6),rnd(.7,1),rnd(.9,1.3));g.add(m);}
      g.position.set(-30+i*11+rnd(-2,2),rnd(13,16),rnd(-14,12));cG.add(g);this.clouds.push({g,sp:rnd(.5,.9)});}
    // birds
    const brG=new T.Group();scene.add(brG);this.brG=brG;const bm=mat('#3a3550');this.birds=[];
    for(let i=0;i<7;i++){const g=new T.Group();g.position.set(-(i%4)*.9-(i>3?.4:0),rnd(-.4,.4),(i%2?1:-1)*Math.ceil(i/2)*.7);brG.add(g);boxM(g,.42,.1,.1,bm,0,0,0);
      const l=new T.Group(),rr=new T.Group();g.add(l);g.add(rr);boxM(l,.24,.03,.5,bm,0,0,.25);boxM(rr,.24,.03,.5,bm,0,0,-.25);this.birds.push({l,r:rr,ph:Math.random()*6});}
    // weather
    const N=700,rp=new Float32Array(N*6);for(let i=0;i<N;i++){const x=rnd(-22,22),y=rnd(0,22),z=rnd(-16,16);rp.set([x,y,z,x+.06,y+.55,z],i*6);}
    const rg=new T.BufferGeometry();rg.setAttribute('position',new T.BufferAttribute(rp,3));
    this.rain=new T.LineSegments(rg,new T.LineBasicMaterial({color:'#dbe6ff',transparent:true,opacity:.55}));this.rain.frustumCulled=false;scene.add(this.rain);
    const sp=new Float32Array(500*3);for(let i=0;i<500;i++)sp.set([rnd(-22,22),rnd(0,22),rnd(-16,16)],i*3);
    const sg=new T.BufferGeometry();sg.setAttribute('position',new T.BufferAttribute(sp,3));
    const dot=canvasTex(32,32,x=>{const g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,32,32);});
    this.snow=new T.Points(sg,new T.PointsMaterial({size:7,sizeAttenuation:false,map:dot,transparent:true,depthWrite:false,color:'#ffffff'}));this.snow.frustumCulled=false;scene.add(this.snow);

    // collectibles
    const coinG=new T.CylinderGeometry(.38,.38,.1,28);coinG.rotateX(Math.PI/2);
    const coinM=new T.MeshStandardMaterial({color:'#ffc93c',metalness:.55,roughness:.28,emissive:'#7a5200',emissiveIntensity:.45});
    this.coinG=coinG;this.coinM=coinM;this.coins=[];
    houses.slice().sort(()=>Math.random()-.5).slice(0,7).forEach(h=>{const m=new T.Mesh(coinG,coinM);m.castShadow=true;scene.add(m);h.updateMatrixWorld();m.position.set(h.position.x,h.userData.tap.top+.9,h.position.z);m.userData.tapTarget=h;tappables.push(m);
      const c={m,h,cd:0,ph:Math.random()*6,s:1};h.userData.coin=c;this.coins.push(c);});
    this.fx=[];this.octa=new T.OctahedronGeometry(.11);this.sparkM=[new T.MeshStandardMaterial({color:'#fff3b0',emissive:'#ffd24a',emissiveIntensity:1}),new T.MeshStandardMaterial({color:'#ffffff',emissive:'#ffffff',emissiveIntensity:.6})];
    this.dustM=new T.MeshStandardMaterial({color:'#f2ece0',roughness:1});this.sph=sph;

    // camera
    this.VIEW=30;this.ortho=new T.OrthographicCamera(-1,1,1,-1,.1,400);this.persp=new T.PerspectiveCamera(30,1,.5,500);
    this.cam={target:new T.Vector3(0,0,1),goal:null,az:Math.PI/4-1,azT:Math.PI/4,el:.6,zoom:.42,zoomT:1.15,vel:new T.Vector3()};
    this.ray=new T.Raycaster();this.t=0;this.w=1;this.h=1;
    const ro=new ResizeObserver(()=>{this.w=Math.max(1,this.clientWidth);this.h=Math.max(1,this.clientHeight);r.setSize(this.w,this.h,false);});ro.observe(this);
    this.w=Math.max(1,this.clientWidth);this.h=Math.max(1,this.clientHeight);r.setSize(this.w,this.h,false);
    this.bindInput(r.domElement);
    this.ready=true;this.applyCfg();this.loop();
  }

  applyCfg(){const c=this.cfg,r=this.renderer;
    r.setPixelRatio(c.quality==='low'?1:Math.min(devicePixelRatio,2));r.setSize(this.w,this.h,false);
    this.sun.castShadow=c.quality!=='low';
    this.vG.visible=!!c.traffic;this.pG.visible=!!c.people;this.cG.visible=!!c.clouds;this.brG.visible=!!c.birds;this.bG.visible=!!c.boats;
    this.rain.visible=c.weather==='rain';this.snow.visible=c.weather==='snow';
    this.coins.forEach(k=>k.m.visible=!!c.coins&&k.cd<=0);
  }

  bindInput(el){const ptrs=new Map();let moved=0,lastPinch=0,lastMove=0;const c=this.cam;
    const dist=()=>{const a=[...ptrs.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);};
    el.addEventListener('pointerdown',e=>{el.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});el.style.cursor='grabbing';
      if(ptrs.size===1){moved=0;c.vel.set(0,0,0);c.goal=null;}if(ptrs.size===2)lastPinch=dist();});
    el.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
      if(ptrs.size===1){moved+=Math.abs(dx)+Math.abs(dy);const now=performance.now(),dtE=Math.max(8,now-lastMove)/1000;lastMove=now;const d=this.panBy(dx,dy);c.vel.lerp(d.multiplyScalar(1/dtE),.5);}
      else if(ptrs.size===2){const d=dist();if(lastPinch){c.zoom=c.zoomT=clamp(c.zoom*d/lastPinch,.5,3);}lastPinch=d;moved+=99;}});
    const up=e=>{if(!ptrs.has(e.pointerId))return;ptrs.delete(e.pointerId);if(ptrs.size<2)lastPinch=0;el.style.cursor='grab';
      if(performance.now()-lastMove>90)c.vel.set(0,0,0);if(e.type==='pointerup'&&ptrs.size===0&&moved<8)this.pick(e);};
    el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
    el.addEventListener('wheel',e=>{e.preventDefault();c.zoomT=clamp(c.zoomT*Math.exp(-e.deltaY*.0015),.5,3);},{passive:false});
    this.ptrs=ptrs;}
  panBy(dx,dy){const T=this.T,c=this.cam,u=(this.VIEW/c.zoom)/this.h;
    const right=new T.Vector3(Math.cos(c.az),0,-Math.sin(c.az)),fwd=new T.Vector3(-Math.sin(c.az),0,-Math.cos(c.az));
    const d=right.multiplyScalar(-dx*u).add(fwd.multiplyScalar(dy*u/Math.sin(c.el)));c.target.add(d);this.clampT();return d;}
  clampT(){const t=this.cam.target;t.x=clamp(t.x,-16,16);t.z=clamp(t.z,-12,12);}
  rotate(d){this.cam.azT+=d*Math.PI/2;}
  zoomBy(f){this.cam.zoomT=clamp(this.cam.zoomT*f,.5,3);}
  recenter(){const c=this.cam;c.goal=new this.T.Vector3(0,0,1);c.azT=Math.round((c.azT-Math.PI/4)/(Math.PI/2))*(Math.PI/2)+Math.PI/4;c.zoomT=1.15;}
  build(){if(this.built)return;this.cam.goal=this.plot.position.clone();this.cam.zoomT=Math.max(this.cam.zoomT,1.4);this.doBuild();}

  pick(e){if(!this.ready)return;const rc=this.renderer.domElement.getBoundingClientRect();const T=this.T;
    const ndc=new T.Vector2((e.clientX-rc.left)/rc.width*2-1,-((e.clientY-rc.top)/rc.height)*2+1);
    this.ray.setFromCamera(ndc,this.camera);const hits=this.ray.intersectObjects(this.tappables,true);
    for(const h of hits){let o=h.object;if(o.userData.tapTarget)o=o.userData.tapTarget;while(o&&!o.userData.tap)o=o.parent;if(!o||!o.visible)continue;
      if(o.userData.tap.kind==='plot'){this.doBuild();}else this.tapHouse(o);break;}}
  tapHouse(h){const tp=h.userData.tap;if(tp.grow!=null&&tp.grow<1)return;tp.t=0;
    const top=new this.T.Vector3(h.position.x,tp.top+.6,h.position.z);const c=h.userData.coin;
    if(c&&c.cd<=0&&this.cfg.coins){c.cd=rnd(6,11);c.m.visible=false;this.spawnCoin(c.m.position.clone(),14);this.emit('coin',25,c.m.position);}
    else{this.spawnCoin(top,6);this.emit('coin',5,top);}}
  doBuild(){if(this.built)return;this.built=true;const T=this.T,p=this.plot.position;this.plot.visible=false;
    this.tappables.splice(this.tappables.indexOf(this.plot),1);
    const h=this.house(p.x,p.z,2.6,2.6,4.4,1,{shop:true,flat:true,body:'#a9dcc9'});h.userData.tap.grow=0;h.scale.setScalar(.001);
    for(let i=0;i<14;i++){const m=new T.Mesh(this.sph,this.dustM);const a=i/14*Math.PI*2;m.position.set(p.x+Math.cos(a)*1.2,.3,p.z+Math.sin(a)*1.2);this.scene.add(m);
      this.fx.push({m,t:0,life:rnd(.7,1.1),v:new T.Vector3(Math.cos(a)*rnd(1.5,2.6),rnd(.3,1),Math.sin(a)*rnd(1.5,2.6)),dust:true,s:rnd(.25,.45)});}
    this.emit('build',0,new T.Vector3(p.x,4,p.z));}
  spawnCoin(pos,n){const T=this.T;const m=new T.Mesh(this.coinG,this.coinM);m.position.copy(pos);this.scene.add(m);this.fx.push({m,t:0,life:.9,coin:true,y0:pos.y});
    for(let i=0;i<n;i++){const s=new T.Mesh(this.octa,this.sparkM[i%2]);s.position.copy(pos);this.scene.add(s);
      this.fx.push({m:s,t:0,life:rnd(.5,.9),v:new T.Vector3(rnd(-2.5,2.5),rnd(2,5),rnd(-2.5,2.5)),s:1});}}
  emit(type,amount,pos){const v=pos.clone().project(this.camera);
    window.dispatchEvent(new CustomEvent('town-fx',{detail:{type,amount,x:(v.x+1)/2*this.w,y:(1-v.y)/2*this.h}}));}

  updateCam(){const T=this.T,c=this.cam,aspect=this.w/this.h;
    const dir=new T.Vector3(Math.cos(c.el)*Math.sin(c.az),Math.sin(c.el),Math.cos(c.el)*Math.cos(c.az));
    if(this.cfg.camera==='persp'){const cam=this.persp;cam.aspect=aspect;const d=(this.VIEW/c.zoom/2)/Math.tan(T.MathUtils.degToRad(cam.fov/2));
      cam.position.copy(c.target).addScaledVector(dir,d);cam.lookAt(c.target);cam.updateProjectionMatrix();this.camera=cam;}
    else{const cam=this.ortho,hh=this.VIEW/2;cam.left=-hh*aspect;cam.right=hh*aspect;cam.top=hh;cam.bottom=-hh;cam.zoom=c.zoom;
      cam.position.copy(c.target).addScaledVector(dir,120);cam.lookAt(c.target);cam.updateProjectionMatrix();this.camera=cam;}}

  tick(dt){if(!this.ready)return;this.t+=dt;const t=this.t,cfg=this.cfg,cur=this.cur,tm=this.tmp;
    // lighting
    const p=P[cfg.time]||P.day,w=cfg.weather,k=1-Math.exp(-dt*2.2);
    tm.c1.set(p.bg);if(w==='rain')tm.c1.lerp(tm.grey,.45);if(w==='snow')tm.c1.lerp(tm.snow,.3);cur.bg.lerp(tm.c1,k);
    cur.sky.lerp(tm.c2.set(p.sky),k);cur.gnd.lerp(tm.c2.set(p.gnd),k);cur.sun.lerp(tm.c2.set(p.sun),k);
    const wm=w==='rain'?.4:w==='snow'?.8:1;
    cur.hemi+=(p.hemi*(w==='rain'?.85:1)-cur.hemi)*k;cur.sunI+=(p.sunI*wm-cur.sunI)*k;cur.win+=(p.win+(w==='rain'?.35:0)-cur.win)*k;
    cur.lamp+=(p.lamp+(w==='rain'&&cfg.time==='day'?.25:0)-cur.lamp)*k;cur.exp+=(p.exp-cur.exp)*k;cur.pos.lerp(tm.v.set(...p.sunPos),k);
    this.hemi.color.copy(cur.sky);this.hemi.groundColor.copy(cur.gnd);this.hemi.intensity=cur.hemi;this.sun.color.copy(cur.sun);this.sun.intensity=cur.sunI;
    this.sun.position.copy(cur.pos).normalize().multiplyScalar(50);this.renderer.toneMappingExposure=cur.exp;
    this.winOn.emissiveIntensity=cur.win;this.winOff.emissiveIntensity=cur.win*.08;this.bulb.emissiveIntensity=cur.lamp*2.2;
    this.lamps.forEach(l=>l.intensity=cur.lamp*7);
    // signals
    const ph=t%14,mG=ph<6,cGn=ph>=7&&ph<13,S=this.sig;
    S.mg.emissiveIntensity=mG?2.5:.05;S.mr.emissiveIntensity=mG?.05:2.5;S.cg.emissiveIntensity=cGn?2.5:.05;S.cr.emissiveIntensity=cGn?.05:2.5;
    // traffic
    if(cfg.traffic)for(const L of this.lanes){const vs=L.vs.sort((a,b)=>b.p-a.p),green=L.grp==='m'?mG:cGn;
      vs.forEach((v,i)=>{const a=i===0?vs[vs.length-1]:vs[i-1],ap=i===0?a.p+L.L:a.p;let maxP=ap-(a.len+v.len)/2-.9;
        if(!green&&v.p+v.len/2<=L.enter+.1)maxP=Math.min(maxP,L.enter-v.len/2-.3);
        const gap=maxP-v.p,des=gap<3?Math.max(0,gap*1.1):v.v0;v.speed+=(des-v.speed)*Math.min(1,dt*3);v.p+=Math.max(0,v.speed)*dt;if(v.p>maxP&&vs.length>1)v.p=Math.max(v.p-.001,Math.min(v.p,maxP+.001));
        if(v.p>L.L)v.p-=L.L;const co=L.dir>0?L.min+v.p:L.max-v.p,e=clamp(Math.min(v.p,L.L-v.p)/1.3,0,1);
        if(L.axis==='x')v.g.position.set(co,.1+Math.abs(Math.sin(t*9+v.ph))*.02*(v.speed>.2?1:0),L.c);else v.g.position.set(L.c,.1,co);v.g.scale.setScalar(Math.max(.001,e*e*(3-2*e)));});}
    // people
    if(cfg.people){const xing=ph>6.4&&ph<13.6;
      for(const p of this.walkers){const nx=p.x+p.dir*p.sp*dt,inZ=x=>x>5.2&&x<8.8;let mv=true;if(xing&&!inZ(p.x)&&inZ(nx))mv=false;
        if(mv)p.x=nx;if(p.x>17.6)p.x=-17.6;if(p.x<-17.6)p.x=17.6;const e=clamp((17.6-Math.abs(p.x))/1,0,1);
        p.g.position.set(p.x,.16+(mv?Math.abs(Math.sin(t*9*p.sp+p.ph))*.07:0),p.z);p.g.rotation.z=mv?-p.dir*.08:0;p.g.scale.setScalar(Math.max(.001,e));}
      for(const p of this.wanderers){const g=p.g.position;if(p.wait>0){p.wait-=dt;g.y=p.zn[4];continue;}
        const dx=p.tx-g.x,dz=p.tz-g.z,d=Math.hypot(dx,dz);if(d<.1){p.wait=rnd(.6,3.5);p.tx=rnd(p.zn[0],p.zn[1]);p.tz=rnd(p.zn[2],p.zn[3]);continue;}
        g.x+=dx/d*.7*dt;g.z+=dz/d*.7*dt;g.y=p.zn[4]+Math.abs(Math.sin(t*8+p.ph))*.07;}}
    // ambient
    if(cfg.clouds)for(const c of this.clouds){c.g.position.x+=c.sp*dt;if(c.g.position.x>32)c.g.position.x=-32;c.g.position.y+=Math.sin(t*.4+c.sp*9)*.002;}
    if(cfg.birds){const a=t*.16,bx=Math.cos(a)*15,bz=Math.sin(a)*10;this.brG.position.set(bx,10+Math.sin(t*.6)*1.2,bz);this.brG.rotation.y=Math.atan2(-Math.cos(a)*10,-Math.sin(a)*15);
      this.birds.forEach(b=>{const f=Math.sin(t*11+b.ph)*.7;b.l.rotation.x=f;b.r.rotation.x=-f;});}
    if(cfg.boats){this.ripT.offset.x=t*.04;this.ripT.offset.y=Math.sin(t*.3)*.05;
      for(const b of this.boats){b.x+=b.dir*b.sp*dt;if(b.x>16.9)b.dir=-1;if(b.x<10.9)b.dir=1;const ty=b.dir>0?0:Math.PI;b.g.rotation.y+=(ty-b.g.rotation.y)*Math.min(1,dt*2);
        b.g.position.x=b.x;b.g.position.y=.12+Math.sin(t*2+b.ph)*.03;b.g.rotation.x=Math.sin(t*1.7+b.ph)*.05;}}
    if(cfg.sway){for(const tr of this.trees){tr.c.rotation.z=Math.sin(t*1.3+tr.ph)*.04;tr.c.rotation.x=Math.cos(t*1.1+tr.ph)*.03;}
      this.swings.forEach((s,i)=>s.rotation.x=Math.sin(t*2.3+i*1.7)*.55);this.bunting.forEach((b,i)=>b.rotation.z=Math.sin(t*3+i*.7)*.25);
      const pa=this.flag.geometry.attributes.position,base=this.flagBase;for(let i=0;i<pa.count;i++){const x=base[i*3];pa.array[i*3+2]=Math.sin(x*4-t*6)*.09*x;}pa.needsUpdate=true;this.flag.geometry.computeVertexNormals();}
    this.hands.forEach(h=>{h.mp.rotation.z=-t*.6;h.hp.rotation.z=-t*.05;});
    // rain / snow
    if(this.rain.visible){const a=this.rain.geometry.attributes.position.array;for(let i=0;i<a.length;i+=6){a[i+1]-=24*dt;a[i+4]-=24*dt;if(a[i+1]<0){a[i+1]+=22;a[i+4]+=22;}}this.rain.geometry.attributes.position.needsUpdate=true;}
    if(this.snow.visible){const a=this.snow.geometry.attributes.position.array;for(let i=0;i<a.length;i+=3){a[i+1]-=1.6*dt;a[i]+=Math.sin(t+i)*.01;if(a[i+1]<0)a[i+1]+=22;}this.snow.geometry.attributes.position.needsUpdate=true;}
    // collectibles
    this.plus.rotation.y=t*1.5;this.plus.position.y=1.3+Math.sin(t*3)*.15;
    for(const c of this.coins){if(c.cd>0){c.cd-=dt;if(c.cd<=0){c.m.visible=!!cfg.coins;c.s=0;}}c.s=Math.min(1,c.s+dt*3);
      c.m.rotation.y=t*2.2+c.ph;c.m.position.y=c.h.userData.tap.top+.9+Math.sin(t*2.5+c.ph)*.15;const e=c.s;c.m.scale.setScalar(Math.max(.001,1+Math.sin(e*Math.PI)*.4*(1-e)+(e-1)));if(!cfg.coins)c.m.visible=false;else if(c.cd<=0)c.m.visible=true;}
    for(const h of this.houses){const tp=h.userData.tap;let base=1;
      if(tp.grow!=null&&tp.grow<1){tp.grow=Math.min(1,tp.grow+dt/1.1);const g=tp.grow;base=1-Math.exp(-g*7)*Math.cos(g*14);if(g>=1)base=1;}
      if(tp.t>=0){tp.t+=dt;const q=Math.exp(-tp.t*7)*Math.cos(tp.t*20);h.scale.set(base*(1+.14*q),base*(1-.28*q),base*(1+.14*q));if(tp.t>1.2)tp.t=-1;}
      else if(tp.grow!=null)h.scale.setScalar(Math.max(.001,base));}
    for(let i=this.fx.length-1;i>=0;i--){const f=this.fx[i];f.t+=dt;const u=f.t/f.life;
      if(u>=1){this.scene.remove(f.m);this.fx.splice(i,1);continue;}
      if(f.coin){f.m.position.y=f.y0+(1-Math.pow(1-u,3))*2.8;f.m.rotation.y+=dt*14;f.m.scale.setScalar(u>.7?Math.max(.001,1-(u-.7)/.3):1+Math.sin(u*Math.PI)*.3);}
      else if(f.dust){f.m.position.addScaledVector(f.v,dt);f.v.multiplyScalar(Math.exp(-dt*3));f.m.scale.setScalar(Math.max(.001,f.s*(1+u*1.5)*(1-u)));}
      else{f.v.y-=10*dt;f.m.position.addScaledVector(f.v,dt);f.m.rotation.x+=dt*8;f.m.scale.setScalar(Math.max(.001,1-u));}}
    // camera
    const c=this.cam,kk=1-Math.exp(-dt*5);
    if(cfg.orbit&&!this.ptrs.size)c.azT+=dt*.12;
    c.az+=(c.azT-c.az)*kk;c.zoom+=(c.zoomT-c.zoom)*(1-Math.exp(-dt*(t<3?1.6:6)));
    if(c.goal){c.target.lerp(c.goal,1-Math.exp(-dt*3.5));if(c.target.distanceTo(c.goal)<.02)c.goal=null;}
    else if(!this.ptrs.size&&c.vel.lengthSq()>1e-4){c.target.addScaledVector(c.vel,dt);c.vel.multiplyScalar(Math.exp(-dt*4.5));this.clampT();}
    this.updateCam();this.renderer.render(this.scene,this.camera);
  }
}
customElements.define('town-scene',TownScene);
})();
