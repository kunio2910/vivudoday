import * as T from './vendor/three.module.js';
import './data.js';
import './managed-data.js';
import './place-store.js';
import './firebase-config.js';
import './firebase-client.js';
const $=id=>document.getElementById(id);
const project=([x,y],z=.26)=>new T.Vector3((x-109.1)*.963,y-15.3,z);
const cities=[['Hà Nội',105.834,21.028],['Hải Phòng',106.688,20.844],['Huế',107.59,16.463],['Đà Nẵng',108.202,16.054],['Nha Trang',109.196,12.239],['Đà Lạt',108.442,11.94],['TP. Hồ Chí Minh',106.7,10.776],['Cần Thơ',105.746,10.045],['Cà Mau',105.152,9.177]];
for (const p of window.VIETNAM_PLACES) {
  const existing = cities.findIndex(c => c[0] === p.name);
  const entry = [p.name, p.coordinates.longitude, p.coordinates.latitude];
  if (existing >= 0) cities[existing] = entry; else cities.push(entry);
}
// Generalized illustrative waterways, not survey data.
const rivers=[[[103.96,22.5],[104.3,22.04],[104.88,21.7],[105.42,21.32],[105.83,21.03],[106.02,20.72],[106.52,20.26]],[[107.46,16.25],[107.59,16.46],[107.73,16.55]],[[108.48,11.92],[107.82,11.64],[107.34,11.13],[106.85,10.9],[106.75,10.65],[106.9,10.42]],[[105.13,10.95],[105.37,10.65],[105.63,10.43],[105.95,10.27],[106.34,10.13],[106.73,9.91]],[[105.05,10.94],[105.13,10.71],[105.44,10.36],[105.75,10.04],[106.03,9.77],[106.3,9.5]],[[105.88,10.31],[106.14,10.36],[106.44,10.25],[106.75,10.25]],[[105.94,10.25],[106.16,9.99],[106.5,9.79]],[[105.17,10.66],[104.98,10.5],[104.69,10.4]],[[105.43,10.36],[105.13,10.12],[104.96,9.97]],[[105.74,10.04],[105.5,9.91],[105.26,9.68],[105.04,9.3]]];
let renderer,scene,camera,root,ready=false,frame=0,yaw=-.13,tilt=.34,zoom=1;
const labels=[],renderedCityNames=new Set(),pointers=new Map(),cityGroup=new T.Group(),waterGroup=new T.Group(),borders=new T.Group();
function renderCityLabels(){for(const [name,lon,lat] of cities){if(renderedCityNames.has(name))continue;const point=project([lon,lat],.32),marker=new T.Mesh(new T.SphereGeometry(.06,10,8),new T.MeshBasicMaterial({color:0xffd27d}));marker.position.copy(point);cityGroup.add(marker);const el=document.createElement('span');el.className='city';el.textContent=name;$('labels').append(el);labels.push({el,point});renderedCityNames.add(name);}}
function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
function draw(){frame=0;if(!ready)return;root.rotation.set(tilt,yaw,0);root.updateMatrixWorld(true);renderer.render(scene,camera);const boxes=[];
for(const l of labels){const p=root.localToWorld(l.point.clone()).project(camera),x=(p.x+1)*innerWidth/2,y=(1-p.y)*innerHeight/2,w=l.el.offsetWidth||100;const show=$('cities').checked&&p.z<1&&x>0&&x<innerWidth-70&&y>85&&y<innerHeight-110&&!boxes.some(b=>Math.abs(b.y-y)<23&&x<b.x+b.w&&x+w>b.x);l.el.hidden=!show;if(show){l.el.style.left=x+'px';l.el.style.top=y+'px';boxes.push({x,y,w});}}}
function resize(){if(!renderer)return;const aspect=innerWidth/innerHeight,span=Math.max(18,16/aspect)/zoom;camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);schedule();}
function changeZoom(f){zoom=Math.max(.65,Math.min(4,zoom*f));resize();}
function line(points,color,group){group.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color,transparent:true,opacity:.65})));}
async function init(){try{
renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor('#071f2d');$('world').prepend(renderer.domElement);
scene=new T.Scene();camera=new T.OrthographicCamera(-10,10,9,-9,.1,100);camera.position.z=30;root=new T.Group();scene.add(root);root.add(cityGroup,waterGroup,borders);
scene.add(new T.HemisphereLight(0xd7fff0,0x19322e,2));const sun=new T.DirectionalLight(0xffe5ac,3);sun.position.set(-8,10,16);scene.add(sun);
const grid=new T.Group();for(let i=-20;i<=20;i++){line([new T.Vector3(i,-20,-.18),new T.Vector3(i,20,-.18)],0x174353,grid);line([new T.Vector3(-20,i,-.18),new T.Vector3(20,i,-.18)],0x174353,grid);}root.add(grid);
const response=await fetch('./provinces-source.json');if(!response.ok)throw Error('Không tải được ranh giới.');const data=await response.json();
for(const [index,province] of data.provinces.entries()){const shapes=[];for(const ring of province.polygons){if(ring.length<3)continue;const shape=new T.Shape();ring.forEach((p,i)=>{const v=project(p);if(i===0)shape.moveTo(v.x,v.y);else shape.lineTo(v.x,v.y);});shape.closePath();shapes.push(shape);if(ring.length>20)line(ring.map(p=>project(p,.235)),0xc1d799,borders);}const geo=new T.ExtrudeGeometry(shapes,{depth:.23,bevelEnabled:false,steps:1,curveSegments:1});const indices=[[],[]];for(const g of geo.groups)for(let i=g.start;i<g.start+g.count;i++)indices[g.materialIndex].push(i);geo.setIndex(indices[0].concat(indices[1]));geo.clearGroups();geo.addGroup(0,indices[0].length,0);geo.addGroup(indices[0].length,indices[1].length,1);root.add(new T.Mesh(geo,[new T.MeshStandardMaterial({color:new T.Color().setHSL(.36+(index%5)*.012,.35,.3+(index%4)*.035),roughness:.85}),new T.MeshStandardMaterial({color:0x9b8041,roughness:.8})]));}
for(const route of rivers){const curve=new T.CatmullRomCurve3(route.map(p=>project(p)));waterGroup.add(new T.Mesh(new T.TubeGeometry(curve,route.length*8,.018,5,false),new T.MeshBasicMaterial({color:0x55d9ec})));}
renderCityLabels();
ready=true;$('status').hidden=true;resize();
}catch(error){$('status').textContent='Không mở được bản đồ 3D. Hãy kiểm tra WebGL và tải lại, hoặc quay về bản đồ 2D.';console.error(error);}}
$('back').onclick=()=>{if(parent!==window)parent.postMessage({type:'vivu-close-3d'},location.origin);else location.href='./';};
$('plus').onclick=()=>changeZoom(1.2);$('minus').onclick=()=>changeZoom(1/1.2);$('reset').onclick=()=>{yaw=-.13;tilt=.34;zoom=1;resize();};$('top').onclick=()=>{yaw=0;tilt=0;schedule();};
for(const [id,group] of [['cities',cityGroup],['water',waterGroup],['borders',borders]])$(id).onchange=()=>{group.visible=$(id).checked;schedule();};
const world=$('world');world.addEventListener('wheel',e=>{e.preventDefault();changeZoom(Math.exp(-e.deltaY*.001));},{passive:false});
world.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;world.setPointerCapture(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});});
world.addEventListener('pointermove',e=>{const old=pointers.get(e.pointerId);if(!old)return;const next={x:e.clientX,y:e.clientY};if(pointers.size===2){const other=[...pointers.entries()].find(([id])=>id!==e.pointerId)[1],before=Math.hypot(old.x-other.x,old.y-other.y);if(before>5)changeZoom(Math.hypot(next.x-other.x,next.y-other.y)/before);}else{yaw+=(next.x-old.x)*.007;tilt=Math.max(-1.15,Math.min(1.15,tilt+(next.y-old.y)*.007));schedule();}pointers.set(e.pointerId,next);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])world.addEventListener(name,e=>pointers.delete(e.pointerId));
world.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')yaw-=.1;else if(e.key==='ArrowRight')yaw+=.1;else if(e.key==='ArrowUp')tilt=Math.max(-1.15,tilt-.1);else if(e.key==='ArrowDown')tilt=Math.min(1.15,tilt+.1);else if(e.key==='+')changeZoom(1.2);else if(e.key==='-')changeZoom(1/1.2);else return;e.preventDefault();schedule();});
addEventListener('keydown',e=>{if(e.key==='Escape')$('back').click();});addEventListener('vivu:places-ready',()=>{for(const p of window.VIETNAM_PLACES){const existing=cities.findIndex(c=>c[0]===p.name);const entry=[p.name,p.coordinates.longitude,p.coordinates.latitude];if(existing>=0)cities[existing]=entry;else cities.push(entry);}renderCityLabels();schedule();});addEventListener('resize',resize);init();
