(() => {
  'use strict';
  const places = window.VIETNAM_PLACES;
  const icons = { coast:'◉', mountain:'△', city:'▦', nature:'❋', history:'⌂' };
  const placeProvinces = {'ha-long':'Quảng Ninh','sapa':'Lào Cai','hanoi':'Hà Nội','phong-nha':'Quảng Trị','hue':'Huế','da-nang':'Đà Nẵng','hoi-an':'Đà Nẵng','my-son':'Đà Nẵng','nha-trang':'Khánh Hòa','da-lat':'Lâm Đồng','can-tho':'Cần Thơ','phu-quoc':'An Giang'};
  const provinceGroups = {
    'Bắc Bộ':['Cao Bằng','Điện Biên','Lai Châu','Sơn La','Lào Cai','Tuyên Quang','Thái Nguyên','Lạng Sơn','Bắc Ninh','Phú Thọ','Hà Nội','Hải Phòng','Hưng Yên','Ninh Bình','Quảng Ninh','Thanh Hóa'],
    'Trung Bộ':['Nghệ An','Hà Tĩnh','Quảng Trị','Huế','Đà Nẵng','Quảng Ngãi','Khánh Hòa'],
    'Tây Nguyên':['Gia Lai','Đắk Lắk','Lâm Đồng'],
    'Nam Bộ':['Đồng Nai','TP. Hồ Chí Minh','Tây Ninh','Đồng Tháp','Vĩnh Long','An Giang','Cần Thơ','Cà Mau']
  };
  let provinceData = [];
  const $ = id => document.getElementById(id);
  for (const p of places) if (p.managed) placeProvinces[p.id] = p.province;
  addEventListener('storage', e => { if (e.key === window.PlaceStore?.key) location.reload(); });
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
  function read(key) { try { const x=JSON.parse(localStorage.getItem(key)||'[]'); return Array.isArray(x)?[...new Set(x.filter(id=>places.some(p=>p.id===id)))]:[]; } catch {return [];} }
  const state={query:'',category:'all',region:'Tất cả',regionView:null,provinceView:null,saved:read('vne-favorites'),trip:read('vivu-trip'),savedOnly:false,view:'map',zoom:1.5,selected:places.some(p=>p.id===location.hash.slice(1))?location.hash.slice(1):null};
  document.body.innerHTML = `<header><a class="brand" href="./"><span class="brand-icon" aria-hidden="true">⌁</span><span><b>Vi vu đó đây</b><small>Một Việt Nam, nhiều điều để khám phá</small></span></a><div class="header-actions"><button id="savedToggle" aria-pressed="false">♡ Đã lưu <span id="savedCount"></span></button><button class="primary" id="openTrip">Hành trình <span id="tripCount"></span></button></div></header><main class="layout" id="layout"><aside class="sidebar"><p class="kicker">Khám phá Việt Nam</p><h1>Bạn muốn đi đâu?</h1><p class="muted">Chọn một nơi. Bắt đầu chuyến đi.</p><div class="search"><input type="search" id="search" aria-label="Tìm địa điểm" placeholder="Thử “Da Lat”, “biển”, “phố cổ”…"><button id="clearSearch" aria-label="Xóa tìm kiếm">×</button></div><label for="region">Khu vực</label><select id="region">${window.VIETNAM_REGIONS.map(r=>`<option>${r}</option>`).join('')}</select><div class="chips" id="categories">${window.VIETNAM_CATEGORIES.map(c=>`<button data-category="${c.key}" aria-pressed="${c.key==='all'}">${c.label}</button>`).join('')}</div><div class="row"><button id="viewToggle">Xem danh sách</button><button class="link-button" id="resetFilters">Đặt lại bộ lọc</button></div><div class="results-head"><span id="resultCount" role="status"></span><small>Chọn để khám phá</small></div><div class="results" id="results"></div></aside><section class="map-section" aria-label="Bản đồ địa điểm"><div class="toolbar"><strong>Việt Nam qua từng điểm đến</strong><div class="map-controls"><button id="zoomOut" aria-label="Thu nhỏ">−</button><button id="zoomReset" aria-label="Đặt lại độ phóng">100%</button><button id="zoomIn" aria-label="Phóng to">+</button></div></div><div class="map-window" id="mapWindow"><div class="map-scene" id="scene"><img src="./MAP.png" width="1024" height="1536" alt="Bản đồ minh họa Việt Nam" draggable="false"><div id="provinceLabels" aria-label="Tỉnh thành Việt Nam"></div><div id="markers"></div></div></div><p class="map-note">Bản đồ minh họa · Vị trí trên ảnh mang tính tương đối. Chọn “Chỉ đường” để xem vị trí địa lý trên Google Maps.</p></section><aside class="details" id="details" aria-label="Thông tin địa điểm"></aside></main><dialog id="tripDialog" aria-labelledby="tripTitle"><div class="dialog-head"><div><p class="kicker">Chuyến đi của bạn</p><h2 id="tripTitle">Những điểm muốn ghé</h2></div><button id="closeTrip" aria-label="Đóng hành trình">×</button></div><p class="muted">Thêm địa điểm và sắp xếp theo thứ tự bạn muốn đi.</p><div id="tripContent"></div><p class="tip">Yêu thích và hành trình được lưu trên trình duyệt này. Xuất danh sách để giữ một bản riêng.</p></dialog><div class="toast" id="notice" role="status"></div>`;
  const provinceBrowser=document.createElement('section');
  provinceBrowser.id='provinceBrowser';provinceBrowser.hidden=true;provinceBrowser.innerHTML='<div class="province-browser-head"><strong id="provinceBrowserTitle">Tỉnh/thành trong khu vực</strong><small id="provinceBrowserMeta"></small></div><div class="province-list" id="provinceList"></div>';
  document.querySelector('.results-head').insertAdjacentElement('afterend',provinceBrowser);
  const provinceRegion=name=>Object.entries(provinceGroups).find(([,names])=>names.includes(name))?.[0]||'Trung Bộ';
  const placeProvinceName=p=>placeProvinces[p.id]||p.province||'';
  const provinceByName=name=>provinceData.find(p=>p.name===name);
  const countryMapBounds={minLon:102,maxLon:118,minLat:7,maxLat:24};
  const offshoreIslands=[
    {name:'Hoàng Sa',longitude:111.75,latitude:16.5},
    {name:'Trường Sa',longitude:114,latitude:9}
  ];
  const coordinateToImage=({longitude,latitude})=>[
    Math.max(2,Math.min(98,(longitude-countryMapBounds.minLon)/(countryMapBounds.maxLon-countryMapBounds.minLon)*100)),
    Math.max(2,Math.min(98,(countryMapBounds.maxLat-latitude)/(countryMapBounds.maxLat-countryMapBounds.minLat)*100))
  ];
  function renderProvinceLabels(){
    const layer=$('provinceLabels');
    if(!layer)return;
    const visibleProvinces=provinceData.filter(province=>!state.regionView||provinceRegion(province.name)===state.regionView);
    const provinceLabels=visibleProvinces.map(province=>{const [left,top]=coordinateToImage({longitude:province.center[0],latitude:province.center[1]});return `<button class="province-label ${province.type==='Thành phố'?'city':''}" data-province="${esc(province.name)}" style="left:${left}%;top:${top}%" aria-label="Mở bản đồ ${esc(province.name)} · ${province.center[1].toFixed(4)}°N, ${province.center[0].toFixed(4)}°E" title="${esc(province.name)} · ${province.center[1].toFixed(4)}°N, ${province.center[0].toFixed(4)}°E"><i aria-hidden="true"></i><span>${esc(province.name)}</span></button>`;}).join('');
    const islandLabels=state.regionView?'':offshoreIslands.map(island=>{const [left,top]=coordinateToImage({longitude:island.longitude,latitude:island.latitude});return `<span class="island-label" style="left:${left}%;top:${top}%" title="${island.name} · ${island.latitude.toFixed(4)}°N, ${island.longitude.toFixed(4)}°E"><i aria-hidden="true"></i><b>${island.name}</b></span>`;}).join('');
    layer.innerHTML=provinceLabels+islandLabels;
  }
  const sidebar=document.querySelector('.sidebar');
  document.querySelector('.header-actions').insertAdjacentHTML('afterbegin','<a href="./admin.html" style="color:inherit;padding:10px">Quản lý địa danh</a>');
  sidebar.querySelector('.kicker')?.remove();
  sidebar.insertAdjacentHTML('afterbegin','<div class="explore-panel-head"><div><span class="panel-eyebrow">Khám Phá</span><strong>Khám phá Việt Nam</strong></div><button id="closeExplore" aria-label="Đóng bảng Khám Phá">×</button></div>');
  document.querySelector('.header-actions').insertAdjacentHTML('afterbegin','<button id="exploreToggle" aria-expanded="false">Khám Phá</button>');
  const exploreBackdrop=document.createElement('div');exploreBackdrop.id='exploreBackdrop';exploreBackdrop.hidden=true;document.body.appendChild(exploreBackdrop);
  function setExplore(open){
    sidebar.hidden=!open;exploreBackdrop.hidden=!open;document.body.classList.toggle('explore-open',open);$('exploreToggle').setAttribute('aria-expanded',String(open));
    if(open){setTimeout(()=>$('search').focus(),0);}
  }
  $('exploreToggle').onclick=()=>setExplore(true);$('closeExplore').onclick=()=>setExplore(false);exploreBackdrop.onclick=()=>setExplore(false);setExplore(false);
  function notify(message){$('notice').textContent=message;clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('notice').textContent='',3000);}
  function persist(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{notify('Trình duyệt không cho lưu. Bạn có thể xuất hành trình để giữ lại.');}}
  function visible(){return places.filter(p=>(!state.savedOnly||state.saved.includes(p.id))&&(state.category==='all'||p.categoryKey===state.category)&&(state.region==='Tất cả'||p.region===state.region)&&(!state.provinceView||placeProvinceName(p)===state.provinceView)&&normalize([p.name,p.region,placeProvinceName(p),...p.tags].join(' ')).includes(normalize(state.query.trim())));}
  function renderProvinceBrowser(){
    const names=state.regionView?provinceGroups[state.regionView]||[]:[];
    const list=provinceData.filter(p=>names.includes(p.name));
    provinceBrowser.hidden=!state.regionView||!provinceData.length;
    if(!state.regionView||!provinceData.length)return;
    $('provinceBrowserTitle').textContent=`Tỉnh/thành thuộc ${state.regionView}`;
    $('provinceBrowserMeta').textContent=`${list.length} đơn vị · bấm để mở bản đồ chi tiết`;
    $('provinceList').innerHTML=list.map(p=>`<button class="province-entry ${p.name===state.provinceView?'selected':''}" data-province="${esc(p.name)}"><span class="province-entry-icon">${p.type==='Tỉnh'?'◇':'▦'}</span><span><strong>${esc(p.name)}</strong><small>${p.type} · ${p.area.toLocaleString('vi-VN')} km²</small></span><span class="chevron">›</span></button>`).join('');
  }
  function renderProvinceDetails(province){
    const [longitude,latitude]=province.center||[109.8,15.5];
    const highlights=places.filter(p=>placeProvinceName(p)===province.name);
    const highlightText=highlights.length?highlights.map(p=>esc(p.name)).join(' · '):'Đang tiếp tục bổ sung điểm đến';
    $('details').innerHTML=`<p class="kicker">Địa phận đã chọn</p><span class="category">${esc(province.type)} · ${esc(provinceRegion(province.name))}</span><h2>${esc(province.name)}</h2><p class="lead">Bản đồ chi tiết tỉnh/thành ${esc(province.name)}</p><p class="muted">Khám phá ranh giới, trung tâm địa lý và các điểm đến nổi bật trong địa phận này.</p><dl class="facts"><dt>Diện tích</dt><dd>${province.area.toLocaleString('vi-VN')} km²</dd><dt>Dân số tham khảo</dt><dd>${province.population.toLocaleString('vi-VN')} người</dd><dt>Tâm bản đồ</dt><dd>${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E</dd></dl><div class="detail-actions"><a class="primary" href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}" target="_blank" rel="noopener noreferrer">Mở vị trí trên Google Maps ↗</a><button data-back-region>← Về ${esc(provinceRegion(province.name))}</button></div><div class="tags">${highlights.length?highlights.map(p=>`<span>${esc(p.name)}</span>`).join(''):'<span>Đang cập nhật địa danh</span>'}</div><p class="tip">Điểm đến nổi bật: ${highlightText}. Chọn một tỉnh khác trong danh sách bên trái để chuyển bản đồ.</p>`;
  }
  function render(){
    const list=visible().filter(p=>!state.regionView||p.region===state.regionView);
    renderProvinceBrowser();
    renderProvinceLabels();
    $('savedCount').textContent=state.saved.length; $('tripCount').textContent=state.trip.length;
    $('savedToggle').setAttribute('aria-pressed',state.savedOnly);
    $('resultCount').textContent=state.provinceView?`${list.length} địa điểm tại ${state.provinceView}`:`${list.length} địa điểm${state.savedOnly?' đã lưu':''}`;
    $('results').innerHTML=list.length?list.map(p=>`<button class="result ${p.id===state.selected?'selected':''}" data-select="${p.id}" aria-pressed="${p.id===state.selected}"><span class="symbol" aria-hidden="true">${icons[p.categoryKey]}</span><span><strong>${esc(p.name)}</strong><small>${placeProvinceName(p)} · ${p.category}</small></span><span class="chevron" aria-hidden="true">›</span></button>`).join(''):`<div class="empty">${state.savedOnly?'Chưa có địa điểm đã lưu phù hợp.':'Chưa có địa điểm nổi bật trong tỉnh này.'}<br>Hãy chọn tỉnh khác hoặc đặt lại bộ lọc.</div>`;
    // Trang bản đồ quốc gia chỉ hiển thị tỉnh/thành; địa danh sẽ xuất hiện trong bản đồ chi tiết.
    $('markers').innerHTML='';
    const province=state.provinceView&&provinceByName(state.provinceView);
    if(province){renderProvinceMap();renderProvinceDetails(province);return;}
    const p=places.find(p=>p.id===state.selected);
    if(!p){$('details').innerHTML='<div class="empty">Chọn một địa điểm để xem thông tin.</div>';return;}
    const {latitude,longitude}=p.coordinates;
    $('details').innerHTML=`<p class="kicker">Điểm đến của bạn</p><span class="category">${p.region} · ${p.category}</span><h2>${esc(p.name)}</h2><p class="lead">${esc(p.short)}</p><p class="muted">${esc(p.description)}</p><dl class="facts"><dt>Thời điểm gợi ý</dt><dd>${esc(p.season)}</dd><dt>Tọa độ tham khảo</dt><dd>${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E</dd></dl><div class="detail-actions"><button class="primary" data-add="${p.id}" ${state.trip.includes(p.id)?'disabled':''}>${state.trip.includes(p.id)?'✓ Đã có trong hành trình':'+ Thêm vào hành trình'}</button><button data-save="${p.id}" aria-pressed="${state.saved.includes(p.id)}">${state.saved.includes(p.id)?'♥ Đã lưu địa điểm':'♡ Lưu địa điểm'}</button><a href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}" target="_blank" rel="noopener noreferrer">Chỉ đường ↗</a><button id="sharePlace">Sao chép liên kết</button></div><div class="tags">${p.tags.map(t=>`<span>#${esc(t)}</span>`).join('')}</div><p class="tip">Chọn thêm những nơi bạn thích, rồi mở “Hành trình” để sắp xếp chuyến đi.</p>`;
    $('sharePlace').onclick=async()=>{try{const url=new URL(location.href);url.hash=p.id;await navigator.clipboard.writeText(url.href);notify('Đã sao chép liên kết địa điểm');}catch{notify('Không thể sao chép tự động. Bạn có thể sao chép URL trên thanh địa chỉ.');}};
  }
  function select(id,fromMap=false){state.selected=id;history.replaceState(null,'',`#${id}`);render();if(fromMap){$('markers').querySelector('.selected')?.focus({preventScroll:true});}else if(matchMedia('(max-width:1100px)').matches)$('details').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});}
  document.addEventListener('click',e=>{const thumbnail=e.target.closest('[data-province-open]');if(thumbnail){e.preventDefault();openProvince(thumbnail.dataset.provinceOpen);return;}const b=e.target.closest('button');if(!b)return;if(b.dataset.province){openProvince(b.dataset.province);return;}if(b.dataset.backRegion){openRegion(state.regionView||'Trung Bộ');return;}if(b.dataset.select)select(b.dataset.select,b.classList.contains('marker'));if(b.dataset.save){const id=b.dataset.save;state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];persist('vne-favorites',state.saved);render();}if(b.dataset.add){if(!state.trip.includes(b.dataset.add))state.trip.push(b.dataset.add);persist('vivu-trip',state.trip);render();notify('Đã thêm vào hành trình');}if(b.dataset.category){state.category=b.dataset.category;document.querySelectorAll('[data-category]').forEach(x=>x.setAttribute('aria-pressed',x===b));render();}});
  $('search').oninput=e=>{state.query=e.target.value;render();};$('clearSearch').onclick=()=>{state.query='';$('search').value='';render();$('search').focus();};$('region').onchange=e=>{if(e.target.value==='Tất cả'){state.regionView=null;state.provinceView=null;state.region='Tất cả';applyRegionView();render();}else openRegion(e.target.value);};
  $('resetFilters').onclick=()=>{state.query='';state.category='all';state.region='Tất cả';state.regionView=null;state.provinceView=null;state.savedOnly=false;$('search').value='';$('region').value='Tất cả';document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.category==='all'));applyRegionView();render();};
  $('savedToggle').onclick=()=>{state.savedOnly=!state.savedOnly;render();};
  $('viewToggle').onclick=()=>{state.view=state.view==='map'?'list':'map';$('layout').classList.toggle('list-mode',state.view==='list');$('viewToggle').textContent=state.view==='map'?'Xem danh sách':'Xem bản đồ';};
  function zoom(delta){state.zoom=Math.max(.75,Math.min(3,Number((state.zoom+delta).toFixed(2))));$('scene').style.width=`${state.zoom*100}%`;$('scene').style.height='auto';$('scene').style.maxWidth='none';$('scene').style.flexShrink='0';$('zoomReset').textContent=`${Math.round(state.zoom*100)}%`;$('zoomOut').disabled=state.zoom<=.75;$('zoomIn').disabled=state.zoom>=3;}
  $('zoomIn').onclick=()=>zoom(.25);$('zoomOut').onclick=()=>zoom(-.25);$('zoomReset').onclick=()=>{state.zoom=1.5;zoom(0);$('mapWindow').scrollTo(0,0);};
  function renderTrip(){
    $('tripContent').innerHTML=state.trip.length?`<ol class="trip-list">${state.trip.map((id,i)=>{const p=places.find(p=>p.id===id);return `<li><div><strong>${i+1}. ${esc(p.name)}</strong><small>${p.region}</small></div><div class="row"><button data-move="${i}" data-step="-1" aria-label="Đưa ${esc(p.name)} lên" ${i===0?'disabled':''}>↑</button><button data-move="${i}" data-step="1" aria-label="Đưa ${esc(p.name)} xuống" ${i===state.trip.length-1?'disabled':''}>↓</button><button data-remove="${id}" aria-label="Bỏ ${esc(p.name)}">×</button></div></li>`;}).join('')}</ol><div class="trip-footer"><button id="exportTrip" class="primary">Xuất hành trình (.txt)</button></div>`:`<div class="empty">Hành trình đang trống.<br>Chọn địa điểm và nhấn “Thêm vào hành trình”.</div><button id="sampleTrip">Thêm gợi ý: Huế → Đà Nẵng → Hội An → Mỹ Sơn</button>`;
    $('sampleTrip')?.addEventListener('click',()=>{state.trip=['hue','da-nang','hoi-an','my-son'];saveTrip();});
    $('exportTrip')?.addEventListener('click',()=>{const text='VI VU ĐÓ ĐÂY — HÀNH TRÌNH\n\n'+state.trip.map((id,i)=>{const p=places.find(p=>p.id===id);return `${i+1}. ${p.name}\n${p.short}\nThời điểm: ${p.season}\nhttps://www.google.com/maps/search/?api=1&query=${p.coordinates.latitude},${p.coordinates.longitude}\n`;}).join('\n');const url=URL.createObjectURL(new Blob(['\ufeff',text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='hanh-trinh-vivu.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Đã xuất hành trình');});
  }
  function saveTrip(){persist('vivu-trip',state.trip);render();renderTrip();}
  $('tripContent').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.remove){state.trip=state.trip.filter(id=>id!==b.dataset.remove);saveTrip();}if(b.dataset.move!==undefined){const i=Number(b.dataset.move),j=i+Number(b.dataset.step);if(j>=0&&j<state.trip.length){[state.trip[i],state.trip[j]]=[state.trip[j],state.trip[i]];saveTrip();}}};
  $('openTrip').onclick=()=>{renderTrip();$('tripDialog').showModal();};$('closeTrip').onclick=()=>$('tripDialog').close();
  addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(places.some(p=>p.id===id)){state.selected=id;render();}});
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)&&!$('tripDialog').open){e.preventDefault();$('search').focus();}});
  const regionViews={
    'Bắc Bộ':{slug:'bac-bo',label:'Bắc Bộ',description:'Núi cao, đồng bằng và biển đảo phía Bắc',scale:1.7,x:'12%',y:'58%'},
    'Trung Bộ':{slug:'trung-bo',label:'Trung Bộ',description:'Dải di sản ven biển miền Trung',scale:1.75,x:'0%',y:'14%'},
    'Tây Nguyên':{slug:'tay-nguyen',label:'Tây Nguyên',description:'Cao nguyên, rừng thông và thác nước',scale:1.8,x:'5%',y:'-15%'},
    'Nam Bộ':{slug:'nam-bo',label:'Nam Bộ',description:'Miền sông nước và những đảo xanh',scale:1.8,x:'0%',y:'-43%'}
  };
  const mapWindow=$('mapWindow'), scene=$('scene'), regionAreas=document.createElement('div');
  const regionLegend=document.createElement('nav');
  regionLegend.id='regionLegend';regionLegend.setAttribute('aria-label','Chọn khu vực');
  regionLegend.innerHTML=Object.values(regionViews).map(r=>`<button class="region-chip ${r.slug}" data-region-view="${r.label}" aria-pressed="false">${r.label}</button>`).join('');
  document.querySelector('.map-section').insertBefore(regionLegend,mapWindow);
  mapWindow.insertAdjacentHTML('beforeend', '<button id="open3d" class="map-3d-launcher" type="button" aria-label="Mở bản đồ Việt Nam 3D"><span class="map-3d-cube" aria-hidden="true">◇</span><span><strong>3D</strong><small>Xem bản đồ không gian</small></span></button><section class="map-3d-view" id="map3dView" hidden aria-label="Bản đồ Việt Nam 3D"><div class="map-3d-head"><div><span class="map-3d-eyebrow">BẢN ĐỒ TƯƠNG TÁC</span><strong>Việt Nam 3D</strong></div><button id="close3d" type="button">← Bản đồ phẳng</button></div><div class="map-3d-stage" id="map3dStage" tabindex="0" role="application" aria-label="Kéo chuột để xoay bản đồ Việt Nam 3D"><div class="map-3d-grid" aria-hidden="true"></div><div class="map-3d-card" id="map3dCard"><div class="map-3d-depth depth-one" aria-hidden="true"></div><div class="map-3d-depth depth-two" aria-hidden="true"></div><div class="map-3d-surface"><img src="./MAP.png" width="1024" height="1536" alt="Mô hình 3D bản đồ Việt Nam" draggable="false"><span class="map-3d-river river-red" aria-hidden="true"></span><span class="map-3d-river river-mekong" aria-hidden="true"></span><span class="map-3d-city city-hanoi">Hà Nội</span><span class="map-3d-city city-danang">Đà Nẵng</span><span class="map-3d-city city-hcm">TP. Hồ Chí Minh</span><span class="map-3d-city city-cantho">Cần Thơ</span></div></div><div class="map-3d-compass" aria-hidden="true"><span>N</span><i>✦</i></div><div class="map-3d-hint"><span class="map-3d-mouse" aria-hidden="true">↔</span><span><strong>Kéo chuột để xoay</strong><small>Cuộn để phóng to · phím mũi tên để điều khiển</small></span></div></div><div class="map-3d-controls" aria-label="Điều khiển bản đồ 3D"><button id="map3dZoomOut" type="button" aria-label="Thu nhỏ bản đồ 3D">−</button><button id="map3dReset" type="button" aria-label="Đặt lại góc nhìn bản đồ 3D">100%</button><button id="map3dZoomIn" type="button" aria-label="Phóng to bản đồ 3D">+</button><span class="map-3d-control-note">↻ Xoay ngang / dọc</span></div></section>');
  const map3dView=$('map3dView'), map3dStage=$('map3dStage'), map3dCard=$('map3dCard');
  const map3d={rotateX:-18,rotateY:12,zoom:1,drag:null};
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  function render3dTransform(){map3dCard.style.setProperty('--map3d-rotate-x',map3d.rotateX+'deg');map3dCard.style.setProperty('--map3d-rotate-y',map3d.rotateY+'deg');map3dCard.style.setProperty('--map3d-zoom',map3d.zoom);$('map3dReset').textContent=Math.round(map3d.zoom*100)+'%';$('map3dZoomOut').disabled=map3d.zoom<=.8;$('map3dZoomIn').disabled=map3d.zoom>=1.45;}
  function set3dZoom(delta){map3d.zoom=clamp(Number((map3d.zoom+delta).toFixed(2)),.8,1.45);render3dTransform();}
  function reset3d(){map3d.rotateX=-18;map3d.rotateY=12;map3d.zoom=1;render3dTransform();notify('Đã đặt lại góc nhìn bản đồ 3D');}
  function close3d(){map3dView.hidden=true;mapWindow.classList.remove('is-3d');$('open3d').setAttribute('aria-expanded','false');map3d.drag=null;}
  function open3d(){state.view='map';$('layout').classList.remove('list-mode');$('viewToggle').textContent='Xem danh sách';state.provinceView=null;state.regionView=null;state.region='Tất cả';$('region').value='Tất cả';applyRegionView();map3dView.hidden=false;mapWindow.classList.add('is-3d');$('open3d').setAttribute('aria-expanded','true');render3dTransform();requestAnimationFrame(()=>map3dStage.focus({preventScroll:true}));notify('Đã mở bản đồ Việt Nam 3D');}
  $('open3d').onclick=open3d;$('close3d').onclick=close3d;$('map3dZoomIn').onclick=()=>set3dZoom(.1);$('map3dZoomOut').onclick=()=>set3dZoom(-.1);$('map3dReset').onclick=reset3d;
  map3dStage.addEventListener('pointerdown',event=>{if(event.target.closest('button'))return;map3d.drag={pointerId:event.pointerId,x:event.clientX,y:event.clientY,rotateX:map3d.rotateX,rotateY:map3d.rotateY};map3dStage.setPointerCapture(event.pointerId);map3dStage.classList.add('is-dragging');});
  map3dStage.addEventListener('pointermove',event=>{if(!map3d.drag||event.pointerId!==map3d.drag.pointerId)return;map3d.rotateY=clamp(map3d.drag.rotateY+(event.clientX-map3d.drag.x)*.42,-70,70);map3d.rotateX=clamp(map3d.drag.rotateX-(event.clientY-map3d.drag.y)*.34,-58,58);render3dTransform();});
  const end3dDrag=event=>{if(!map3d.drag||event.pointerId!==map3d.drag.pointerId)return;map3d.drag=null;map3dStage.classList.remove('is-dragging');if(map3dStage.hasPointerCapture(event.pointerId))map3dStage.releasePointerCapture(event.pointerId);};
  map3dStage.addEventListener('pointerup',end3dDrag);map3dStage.addEventListener('pointercancel',end3dDrag);map3dStage.addEventListener('wheel',event=>{event.preventDefault();set3dZoom(event.deltaY<0?.08:-.08);},{passive:false});
  map3dStage.addEventListener('keydown',event=>{const step=event.shiftKey?10:5;if(event.key==='ArrowLeft'){map3d.rotateY=clamp(map3d.rotateY-step,-70,70);}else if(event.key==='ArrowRight'){map3d.rotateY=clamp(map3d.rotateY+step,-70,70);}else if(event.key==='ArrowUp'){map3d.rotateX=clamp(map3d.rotateX-step,-58,58);}else if(event.key==='ArrowDown'){map3d.rotateX=clamp(map3d.rotateX+step,-58,58);}else if(event.key==='+'||event.key==='='){set3dZoom(.1);return;}else if(event.key==='-'||event.key==='_'){set3dZoom(-.1);return;}else if(event.key==='0'){reset3d();return;}else{return;}event.preventDefault();render3dTransform();});
  render3dTransform();
  const provinceLayer=document.createElement('div');
  provinceLayer.id='provinceLayer';provinceLayer.hidden=true;mapWindow.appendChild(provinceLayer);
  mapWindow.addEventListener('click',e=>{if(e.target.closest('.marker,.marker-thumbnail,.province-label,.region-hotspot,.province-place-dot,.province-shape,.map-3d-view,.map-3d-launcher'))return;if(state.selected){state.selected=null;history.replaceState(null,'',location.pathname+location.search);render();}});
  const provinceBounds={minLon:102,maxLon:110.7,minLat:7.7,maxLat:23.7,width:760,height:1000};
  const projectCoords=([lon,lat])=>[(((lon-provinceBounds.minLon)/(provinceBounds.maxLon-provinceBounds.minLon))*provinceBounds.width),(((provinceBounds.maxLat-lat)/(provinceBounds.maxLat-provinceBounds.minLat))*provinceBounds.height)];
  const projectPoint=point=>projectCoords(point).map(value=>value.toFixed(1)).join(',');
  function provinceViewport(province){
    const points=province.polygons.flatMap(ring=>ring.filter(point=>point.length>=2).map(projectCoords));
    const xs=points.map(point=>point[0]),ys=points.map(point=>point[1]);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const padX=Math.max((maxX-minX)*.24,18),padY=Math.max((maxY-minY)*.24,24);
    return {x:Math.max(0,minX-padX),y:Math.max(0,minY-padY),width:Math.min(provinceBounds.width+1,(maxX-minX)+padX*2),height:Math.min(provinceBounds.height+1,(maxY-minY)+padY*2)};
  }
  function renderProvinceMap(){
    if(!state.provinceView){provinceLayer.innerHTML='';return;}
    if(!provinceData.length){provinceLayer.innerHTML='<div class="province-loading">Đang tải bản đồ ranh giới tỉnh/thành…</div>';return;}
    const province=provinceByName(state.provinceView);if(!province)return;
    const viewport=provinceViewport(province),center=projectPoint(province.center).split(',');
    const shape=`<g class="province-shape active" data-province="${esc(province.name)}" role="img" aria-label="Ranh giới ${esc(province.name)}">${province.polygons.filter(ring=>ring.length>=3).map(ring=>`<polygon points="${ring.map(projectPoint).join(' ')}"></polygon>`).join('')}<text x="${center[0]}" y="${center[1]}" text-anchor="middle">${esc(province.name)}</text></g>`;
    const landmarks=places.filter(place=>placeProvinceName(place)===province.name).map(place=>{const [x,y]=projectCoords([place.coordinates.longitude,place.coordinates.latitude]);const left=((x-viewport.x)/viewport.width*100).toFixed(2),top=((y-viewport.y)/viewport.height*100).toFixed(2);return `<button class="province-place-dot ${place.id===state.selected?'selected':''}" data-select="${place.id}" style="left:${left}%;top:${top}%" aria-label="Chọn ${esc(place.name)}"><i></i><span>${esc(place.name)}</span></button>`;}).join('');
    provinceLayer.innerHTML=`<div class="province-map-canvas"><svg class="province-svg" viewBox="${viewport.x.toFixed(1)} ${viewport.y.toFixed(1)} ${viewport.width.toFixed(1)} ${viewport.height.toFixed(1)}" role="img" aria-label="Bản đồ tỉnh ${esc(province.name)}"><rect class="province-sea" x="${viewport.x.toFixed(1)}" y="${viewport.y.toFixed(1)}" width="${viewport.width.toFixed(1)}" height="${viewport.height.toFixed(1)}"></rect><g>${shape}</g></svg><div class="province-place-layer">${landmarks}</div></div><p class="province-map-caption">Các chấm tròn là địa danh nổi bật trong ${esc(province.name)}.</p>`;
  }
  function openProvince(name){
    const province=provinceByName(name);
    if(!province){notify('Chưa có dữ liệu bản đồ cho tỉnh này');return;}
    setExplore(false);
    state.provinceView=name;state.regionView=provinceRegion(name);state.region=state.regionView;state.savedOnly=false;state.view='map';$('region').value=state.region;$('layout').classList.remove('list-mode');$('viewToggle').textContent='Xem danh sách';
    state.selected=null;
    applyRegionView();render();mapWindow.scrollTo(0,0);notify(`Đã mở bản đồ ${name}`);
  }
  regionAreas.id='regionAreas';regionAreas.setAttribute('aria-label','Chọn khu vực trên bản đồ');scene.appendChild(regionAreas);
  const toolbar=document.querySelector('.toolbar'), toolbarTitle=toolbar.querySelector('strong');
  toolbarTitle.id='mapTitle';toolbarTitle.insertAdjacentHTML('afterend','<small id="mapCrumb">Bản đồ toàn quốc · Chọn một khu vực trên ảnh</small>');
  toolbar.querySelector('.map-controls').insertAdjacentHTML('afterbegin','<button id="backToCountry" hidden>← Việt Nam</button>');
  function renderRegionAreas(){
    regionAreas.innerHTML=state.regionView?'':Object.values(regionViews).map(r=>`<button class="region-hotspot ${r.slug}" data-region-view="${r.label}" aria-label="Mở bản đồ ${r.label}"></button>`).join('');
    regionLegend.querySelectorAll('[data-region-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.regionView===state.regionView)));
  }
  function applyRegionView(){
    const r=state.regionView?regionViews[state.regionView]:null;
    const province=state.provinceView&&provinceByName(state.provinceView);
    mapWindow.classList.toggle('region-mode',Boolean(r&&!province));mapWindow.classList.toggle('province-mode',Boolean(province));scene.hidden=Boolean(province);provinceLayer.hidden=!province;scene.className=`map-scene${r&&!province?' region-view region-'+r.slug:''}`;
    if(province){scene.style.removeProperty('--region-scale');scene.style.removeProperty('--region-x');scene.style.removeProperty('--region-y');toolbarTitle.textContent=`Bản đồ ${province.name}`;$('mapCrumb').textContent=`${province.type} · ${province.area.toLocaleString('vi-VN')} km² · ${provinceRegion(province.name)}`;$('backToCountry').textContent=`← ${state.regionView||'Khu vực'}`;$('backToCountry').hidden=false;renderProvinceMap();}
    else if(r){scene.style.setProperty('--region-scale','1');scene.style.setProperty('--region-x','0%');scene.style.setProperty('--region-y','0%');toolbarTitle.textContent=`Bản đồ ${r.label}`;$('mapCrumb').textContent=`${r.description} · ${provinceData.filter(p=>provinceRegion(p.name)===r.label).length||visible().filter(p=>p.region===r.label).length} tỉnh/thành`;$('backToCountry').textContent='← Việt Nam';$('backToCountry').hidden=false;provinceLayer.innerHTML='';}
    else{scene.style.removeProperty('--region-scale');scene.style.removeProperty('--region-x');scene.style.removeProperty('--region-y');toolbarTitle.textContent='Việt Nam qua từng điểm đến';$('mapCrumb').textContent='Bản đồ toàn quốc · Chọn một khu vực trên ảnh';$('backToCountry').hidden=true;provinceLayer.innerHTML='';}
    renderRegionAreas();
  }
  function openRegion(name){setExplore(false);state.provinceView=null;state.regionView=name;state.region=name;state.savedOnly=false;state.selected=null;$('region').value=name;state.view='map';$('layout').classList.remove('list-mode');$('viewToggle').textContent='Xem danh sách';applyRegionView();render();mapWindow.scrollTo(0,0);notify(`Đã mở bản đồ ${name}`);}
  document.addEventListener('click',e=>{const b=e.target.closest('[data-region-view]');if(b)openRegion(b.dataset.regionView);});
  document.addEventListener('click',e=>{const shape=e.target.closest?.('[data-province]');if(shape&&shape.tagName.toLowerCase()!=='button')openProvince(shape.dataset.province);});
  document.addEventListener('keydown',e=>{const thumbnail=e.target.closest?.('[data-province-open]');if(thumbnail&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openProvince(thumbnail.dataset.provinceOpen);return;}const shape=e.target.closest?.('[data-province]');if(shape&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openProvince(shape.dataset.province);}});
  $('backToCountry').onclick=()=>{if(state.provinceView){state.provinceView=null;applyRegionView();render();mapWindow.scrollTo(0,0);notify(`Đã trở về bản đồ ${state.regionView}`);}else{state.regionView=null;state.region='Tất cả';$('region').value='Tất cả';applyRegionView();render();mapWindow.scrollTo(0,0);notify('Đã trở về bản đồ Việt Nam');}};
  renderRegionAreas();applyRegionView();render();zoom(0);
  fetch('./provinces-source.json',{cache:'force-cache'}).then(response=>{if(!response.ok)throw new Error('province-data');return response.json();}).then(payload=>{provinceData=Array.isArray(payload.provinces)?payload.provinces:[];if(state.provinceView)applyRegionView();render();}).catch(()=>notify('Không tải được dữ liệu bản đồ tỉnh/thành'));
  addEventListener('vivu:places-ready', () => { renderRegionAreas(); applyRegionView(); render(); notify('Đã đồng bộ địa danh từ Firebase'); });
})();
