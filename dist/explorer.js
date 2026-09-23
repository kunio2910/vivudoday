(() => {
  'use strict';
  const places = window.VIETNAM_PLACES;
  const icons = { coast:'◉', mountain:'△', city:'▦', nature:'❋', history:'⌂' };
  const placeProvinces = {'ha-long':'Quảng Ninh','sapa':'Lào Cai','hanoi':'Hà Nội','phong-nha':'Quảng Trị','hue':'Huế','da-nang':'Đà Nẵng','hoi-an':'Đà Nẵng','my-son':'Đà Nẵng','nha-trang':'Khánh Hòa','da-lat':'Lâm Đồng','can-tho':'Cần Thơ','phu-quoc':'An Giang'};
  const provinceGroups = {
    'Bắc Bộ':['Cao Bằng','Điện Biên','Lai Châu','Sơn La','Lào Cai','Tuyên Quang','Thái Nguyên','Lạng Sơn','Bắc Ninh','Phú Thọ','Hà Nội','Hải Phòng','Hưng Yên','Ninh Bình','Quảng Ninh'],
    'Trung Bộ':['Thanh Hóa','Nghệ An','Hà Tĩnh','Quảng Trị','Huế','Đà Nẵng','Quảng Ngãi','Khánh Hòa'],
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
  const state={query:'',category:'all',region:'Tất cả',regionView:null,provinceView:null,provinceMarker:null,hcmView:false,hcmMarker:null,hanoiView:false,hanoiMarker:null,daNangView:false,daNangMarker:null,saved:read('vne-favorites'),trip:read('vivu-trip'),savedOnly:false,view:'map',zoom:1,selected:places.some(p=>p.id===location.hash.slice(1))?location.hash.slice(1):null};
  document.body.innerHTML = `<header><a class="brand" href="./"><span class="brand-icon" aria-hidden="true">⌁</span><span><b>Vi vu đó đây</b><small>Một Việt Nam, nhiều điều để khám phá</small></span></a><div class="header-actions"><button id="savedToggle" aria-pressed="false">♡ Đã lưu <span id="savedCount"></span></button><button class="primary" id="openTrip">Hành trình <span id="tripCount"></span></button></div></header><main class="layout" id="layout"><aside class="sidebar"><p class="kicker">Khám phá Việt Nam</p><h1>Bạn muốn đi đâu?</h1><p class="muted">Chọn một nơi. Bắt đầu chuyến đi.</p><div class="search"><input type="search" id="search" aria-label="Tìm địa điểm" placeholder="Thử “Da Lat”, “biển”, “phố cổ”…"><button id="clearSearch" aria-label="Xóa tìm kiếm">×</button></div><label for="region">Khu vực</label><select id="region">${window.VIETNAM_REGIONS.map(r=>`<option>${r}</option>`).join('')}</select><div class="chips" id="categories">${window.VIETNAM_CATEGORIES.map(c=>`<button data-category="${c.key}" aria-pressed="${c.key==='all'}">${c.label}</button>`).join('')}</div><div class="row"><button id="viewToggle">Xem danh sách</button><button class="link-button" id="resetFilters">Đặt lại bộ lọc</button></div><div class="results-head"><span id="resultCount" role="status"></span><small>Chọn để khám phá</small></div><div class="results" id="results"></div></aside><section class="map-section" aria-label="Bản đồ địa điểm"><div class="toolbar"><strong>Việt Nam qua từng điểm đến</strong><div class="map-controls"><button id="zoomOut" aria-label="Thu nhỏ">−</button><button id="zoomReset" aria-label="Đặt lại độ phóng">100%</button><button id="zoomIn" aria-label="Phóng to">+</button></div></div><div class="map-window" id="mapWindow"><div class="map-scene" id="scene"><img src="./MAP.png" width="1024" height="1536" alt="Bản đồ minh họa Việt Nam" draggable="false"><div id="provinceLabels" aria-label="Tỉnh thành Việt Nam"></div><div id="markers"></div></div></div><p class="map-note">Bản đồ minh họa · Vị trí trên ảnh mang tính tương đối. Chọn “Chỉ đường” để xem vị trí địa lý trên Google Maps.</p></section><aside class="details" id="details" aria-label="Thông tin địa điểm"></aside></main><dialog id="tripDialog" aria-labelledby="tripTitle"><div class="dialog-head"><div><p class="kicker">Chuyến đi của bạn</p><h2 id="tripTitle">Những điểm muốn ghé</h2></div><button id="closeTrip" aria-label="Đóng hành trình">×</button></div><p class="muted">Thêm địa điểm và sắp xếp theo thứ tự bạn muốn.</p><div id="tripContent"></div><p class="tip">Yêu thích và hành trình được lưu trên trình duyệt này. Xuất danh sách để giữ một bản riêng.</p></dialog><div class="toast" id="notice" role="status"></div>`;
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
  const hcmDistrictLandmarks=[
    {district:'Quận 1',name:'Dinh Độc Lập',category:'Lịch sử',latitude:10.7771,longitude:106.6953},
    {district:'Quận 1',name:'Chợ Bến Thành',category:'Mua sắm',latitude:10.7724,longitude:106.6980},
    {district:'Quận 1',name:'Phố đi bộ Nguyễn Huệ',category:'Vui chơi',latitude:10.7740,longitude:106.7037},
    {district:'Quận 1',name:'Bưu điện Thành phố',category:'Kiến trúc',latitude:10.7798,longitude:106.6990},
    {district:'Quận 1',name:'Bitexco Financial Tower',category:'Biểu tượng',latitude:10.7717,longitude:106.7042},
    {district:'Quận 3',name:'Bảo tàng Chứng tích Chiến tranh',category:'Lịch sử',latitude:10.7794,longitude:106.6922},
    {district:'Quận 3',name:'Công viên Tao Đàn',category:'Công viên',latitude:10.7760,longitude:106.6918},
    {district:'Quận 3',name:'Hồ Con Rùa',category:'Vui chơi',latitude:10.7830,longitude:106.6970},
    {district:'Quận 4',name:'Bến Nhà Rồng',category:'Lịch sử',latitude:10.7685,longitude:106.7060},
    {district:'Quận 4',name:'Cầu Mống',category:'Check-in',latitude:10.7683,longitude:106.7040},
    {district:'Quận 5',name:'Chùa Bà Thiên Hậu',category:'Văn hóa',latitude:10.7545,longitude:106.6600},
    {district:'Quận 5',name:'Phố Hải Thượng Lãn Ông',category:'Ẩm thực',latitude:10.7550,longitude:106.6605},
    {district:'Quận 6',name:'Công viên Phú Lâm',category:'Công viên',latitude:10.7420,longitude:106.6300},
    {district:'Quận 7',name:'Cầu Ánh Sao',category:'Check-in',latitude:10.7290,longitude:106.7200},
    {district:'Quận 7',name:'Crescent Mall',category:'Mua sắm',latitude:10.7315,longitude:106.7170},
    {district:'Quận 7',name:'SC VivoCity',category:'Vui chơi',latitude:10.7307,longitude:106.7055},
    {district:'Quận 8',name:'Bến Bình Đông',category:'Văn hóa',latitude:10.7450,longitude:106.6600},
    {district:'Quận 10',name:'Vạn Hạnh Mall',category:'Mua sắm',latitude:10.7720,longitude:106.6670},
    {district:'Quận 10',name:'Việt Nam Quốc Tự',category:'Văn hóa',latitude:10.7750,longitude:106.6730},
    {district:'Quận 11',name:'Công viên văn hóa Đầm Sen',category:'Khu vui chơi',latitude:10.7660,longitude:106.6350},
    {district:'Quận 11',name:'Chùa Giác Viên',category:'Văn hóa',latitude:10.7650,longitude:106.6500},
    {district:'Quận 12',name:'Công viên phần mềm Quang Trung',category:'Tham quan',latitude:10.8500,longitude:106.6300},
    {district:'Bình Thạnh',name:'Landmark 81',category:'Biểu tượng',latitude:10.7950,longitude:106.7220},
    {district:'Bình Thạnh',name:'Vinhomes Central Park',category:'Công viên',latitude:10.7950,longitude:106.7200},
    {district:'Gò Vấp',name:'Công viên Gia Định',category:'Công viên',latitude:10.8200,longitude:106.6800},
    {district:'Gò Vấp',name:'CityLand Park Hills',category:'Vui chơi',latitude:10.8370,longitude:106.6710},
    {district:'Phú Nhuận',name:'Công viên Hoàng Văn Thụ',category:'Công viên',latitude:10.8000,longitude:106.6800},
    {district:'Tân Bình',name:'Sân bay Tân Sơn Nhất',category:'Điểm đến',latitude:10.8180,longitude:106.6600},
    {district:'Tân Phú',name:'AEON Mall Tân Phú',category:'Mua sắm',latitude:10.8010,longitude:106.6260},
    {district:'Bình Tân',name:'AEON Mall Bình Tân',category:'Mua sắm',latitude:10.7400,longitude:106.6100},
    {district:'TP. Thủ Đức',name:'Khu du lịch Suối Tiên',category:'Khu vui chơi',latitude:10.8670,longitude:106.8400},
    {district:'TP. Thủ Đức',name:'Vincom Mega Mall Thảo Điền',category:'Mua sắm',latitude:10.8000,longitude:106.7440},
    {district:'Huyện Củ Chi',name:'Địa đạo Củ Chi',category:'Lịch sử',latitude:11.1420,longitude:106.4600},
    {district:'Huyện Hóc Môn',name:'Chùa Hoằng Pháp',category:'Văn hóa',latitude:10.8850,longitude:106.5950},
    {district:'Huyện Bình Chánh',name:'Khu di tích Láng Le - Bàu Cò',category:'Lịch sử',latitude:10.6900,longitude:106.5700},
    {district:'Huyện Nhà Bè',name:'Công viên Phú Xuân',category:'Công viên',latitude:10.6900,longitude:106.7300},
    {district:'Huyện Cần Giờ',name:'Khu du lịch Vàm Sát',category:'Thiên nhiên',latitude:10.4100,longitude:106.9600},
    {district:'Huyện Cần Giờ',name:'Đảo Khỉ',category:'Thiên nhiên',latitude:10.4200,longitude:106.9500}
  ];
  hcmDistrictLandmarks.push(...window.MapCatalog.additionalHcm.map(p=>({source:'https://vietnam.travel/node/1613',...p})));
  hcmDistrictLandmarks.forEach(place=>{
    if(place.name==='Công viên Tao Đàn')place.district='Quận 1';
    if(place.name==='Công viên Hoàng Văn Thụ')place.district='Tân Bình';
    Object.assign(place,window.MapCatalog.details[place.name]||{});
    place.coordinateStatus=place.name==='Chùa Giác Viên'?'source-referenced':'unverified';
    // Unverified legacy coordinates must not silently become routing coordinates.
    if(place.coordinateStatus==='unverified'){delete place.latitude;delete place.longitude;}
  });
  const projectHcm=place=>{const [left,top]=window.MapCatalog.districts[place.district];return {left,top};};
  let hcmQuery='',expandedDistrict=null,hanoiQuery='',hanoiExpandedDistrict=null,daNangQuery='',daNangExpandedDistrict=null;
  const coordinateToImage=({longitude,latitude})=>[
    Math.max(2,Math.min(98,(longitude-countryMapBounds.minLon)/(countryMapBounds.maxLon-countryMapBounds.minLon)*100)),
    Math.max(2,Math.min(98,(countryMapBounds.maxLat-latitude)/(countryMapBounds.maxLat-countryMapBounds.minLat)*100))
  ];
  function provinceThumbnail(province){
    if(province?.name==='TP. Hồ Chí Minh')return '<img class="province-preview-image" src="./map-hcm.png" alt="Bản đồ thu nhỏ TP. Hồ Chí Minh">';
    if(!province?.polygons?.length)return '';
    const points=province.polygons.flatMap(ring=>ring.filter(point=>point.length>=2).map(point=>projectCoords(point)));
    if(!points.length)return '';
    const xs=points.map(point=>point[0]),ys=points.map(point=>point[1]);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),pad=8;
    return `<svg class="province-preview-map" viewBox="${(minX-pad).toFixed(1)} ${(minY-pad).toFixed(1)} ${(maxX-minX+pad*2).toFixed(1)} ${(maxY-minY+pad*2).toFixed(1)}" aria-hidden="true"><g>${province.polygons.filter(ring=>ring.length>=3).map(ring=>`<polygon points="${ring.map(point=>projectCoords(point).map(value=>value.toFixed(1)).join(',')).join(' ')}"></polygon>`).join('')}</g></svg>`;
  }
  function renderProvinceLabels(){
    const layer=$('provinceLabels');
    if(!layer)return;
    const visibleProvinces=provinceData.filter(province=>!state.regionView||provinceRegion(province.name)===state.regionView);
    const rect=$('scene').getBoundingClientRect();
    // Keep clusters local at the 40% default; a fixed 22px radius made the
    // narrow national map collapse into one 34-province bubble.
    const countryDistance=Math.max(8,Math.min(14,rect.width*.025));
    const groups=window.MapCatalog.cluster(visibleProvinces.filter(p=>p.name!==state.provinceMarker).map(p=>({name:p.name,x:window.MapCatalog.anchors[p.name][0],y:window.MapCatalog.anchors[p.name][1]})),rect.width,rect.height,countryDistance).filter(g=>g.length>1);
    const grouped=new Set(groups.flat().map(p=>p.name));
    const clusters=groups.map(group=>{const x=group.reduce((n,p)=>n+p.x,0)/group.length,y=group.reduce((n,p)=>n+p.y,0)/group.length;return `<button class="district-cluster country-cluster" style="left:${x}%;top:${y}%" data-country-cluster="${esc(group.map(p=>p.name).join('|'))}" aria-label="Chọn trong nhóm ${group.length} tỉnh thành">${group.length}</button>`;}).join('');
    const choices=state.countryChoices?.length?`<div class="country-choices"><strong>Chọn tỉnh/thành</strong><button data-close-choices aria-label="Đóng nhóm tỉnh">×</button>${state.countryChoices.map(name=>`<button data-province-choice="${esc(name)}">${esc(name)}</button>`).join('')}</div>`:'';
    const provinceLabels=visibleProvinces.filter(p=>!grouped.has(p.name)).map(province=>{const [left,top]=window.MapCatalog.anchors[province.name]||coordinateToImage({longitude:province.center[0],latitude:province.center[1]}),active=state.provinceMarker===province.name;const thumbnail=active?`<div class="province-preview"><div class="province-preview-top">${provinceThumbnail(province)}<span><strong>${esc(province.name)}</strong><small>${esc(province.type)} · ${province.area.toLocaleString('vi-VN')} km²</small></span></div><button class="province-more" data-province-open="${esc(province.name)}">Xem thêm <span aria-hidden="true">→</span></button></div>`:'';return `<div class="province-marker ${active?'active':''} ${province.type==='Thành phố'?'city':''}" style="left:${left}%;top:${top}%"><button class="province-label ${province.type==='Thành phố'?'city':''}" data-province="${esc(province.name)}" aria-expanded="${active}" aria-label="Chọn ${esc(province.name)} · ${province.center[1].toFixed(4)}°N, ${province.center[0].toFixed(4)}°E" title="${esc(province.name)} · ${province.center[1].toFixed(4)}°N, ${province.center[0].toFixed(4)}°E"><i aria-hidden="true"></i><span>${esc(province.name)}</span></button>${thumbnail}</div>`;}).join('');
    const islandLabels=state.regionView?'':offshoreIslands.map(island=>{const [left,top]=island.name==='Hoàng Sa'?[80,38]:[85,75];return `<span class="island-label" style="left:${left}%;top:${top}%" title="${island.name} · ${island.latitude.toFixed(4)}°N, ${island.longitude.toFixed(4)}°E"><i aria-hidden="true"></i><b>${island.name}</b></span>`;}).join('');
    layer.innerHTML=provinceLabels+islandLabels+clusters+choices;
  }
  const sidebar=document.querySelector('.sidebar');
  document.querySelector('.header-actions').insertAdjacentHTML('afterbegin','<a href="./admin.html" style="color:inherit;padding:10px">Quản lý địa danh</a>');
  sidebar.querySelector('.kicker')?.remove();
  sidebar.insertAdjacentHTML('afterbegin','<div class="explore-panel-head"><div><span class="panel-eyebrow">Khám Phá</span><strong>Khám phá Việt Nam</strong></div><button id="closeExplore" aria-label="Đóng bảng Khám Phá">×</button></div>');
  document.querySelector('.header-actions').insertAdjacentHTML('afterbegin','<label class="header-search" for="topSearchInput"><svg class="header-search-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 5 5"></path></svg><input id="topSearchInput" type="search" aria-label="Tìm địa điểm và mở Khám Phá" placeholder="Tìm địa điểm…"></label>');
  const exploreBackdrop=document.createElement('div');exploreBackdrop.id='exploreBackdrop';exploreBackdrop.hidden=true;document.body.appendChild(exploreBackdrop);
  const topSearchInput=$('topSearchInput');
  function setExplore(open){
    sidebar.hidden=!open;exploreBackdrop.hidden=!open;document.body.classList.toggle('explore-open',open);
    if(open){setTimeout(()=>topSearchInput?.focus({preventScroll:true}),0);}
  }
  topSearchInput?.addEventListener('focus',()=>setExplore(true));topSearchInput?.addEventListener('click',()=>setExplore(true));
  topSearchInput?.addEventListener('input',e=>{$('search').value=e.target.value;state.query=e.target.value;render();});
  $('closeExplore').onclick=()=>setExplore(false);exploreBackdrop.onclick=()=>setExplore(false);setExplore(false);
  function notify(message){$('notice').textContent=message;clearTimeout(notify.timer);notify.timer=setTimeout(()=>$('notice').textContent='',3000);}
  function persist(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{notify('Trình duyệt không cho lưu. Bạn có thể xuất hành trình để giữ lại.');}}
  function visible(){return places.filter(p=>(!state.savedOnly||state.saved.includes(p.id))&&(state.category==='all'||p.categoryKey===state.category)&&(state.region==='Tất cả'||p.region===state.region)&&(!state.provinceView||placeProvinceName(p)===state.provinceView)&&normalize([p.name,p.region,placeProvinceName(p),...p.tags].join(' ')).includes(normalize(state.query.trim())));}
  function renderProvinceBrowser(){
    const names=state.regionView&&!state.query.trim()?provinceGroups[state.regionView]||[]:Object.keys(window.MapCatalog.anchors);
    const list=provinceData.filter(p=>names.includes(p.name)&&normalize(p.name).includes(normalize(state.query.trim())));
    provinceBrowser.hidden=!provinceData.length;
    if(!provinceData.length)return;
    $('provinceBrowserTitle').textContent=state.regionView&&!state.query.trim()?`Tỉnh/thành thuộc ${state.regionView}`:'Tất cả tỉnh/thành';
    $('provinceBrowserMeta').textContent=`${list.length} đơn vị · bấm để mở bản đồ chi tiết`;
    $('provinceList').innerHTML=list.map(p=>`<button class="province-entry ${p.name===state.provinceView?'selected':''}" data-province="${esc(p.name)}"><span class="province-entry-icon">${p.type==='Tỉnh'?'◇':'▦'}</span><span><strong>${esc(p.name)}</strong><small>${p.type} · ${p.area.toLocaleString('vi-VN')} km²</small></span><span class="chevron">›</span></button>`).join('');
  }
  function renderProvinceDetails(province){
    const [longitude,latitude]=province.center||[109.8,15.5];
    const highlights=places.filter(p=>placeProvinceName(p)===province.name);
    const suggestions=window.MapCatalog.suggestions[province.name]||[];
    const source=window.MapCatalog.provinceSources[province.name];
    const suggestionHtml=`<section class="province-suggestions"><h3>Gợi ý khám phá</h3><p class="muted">${source?'Có nguồn giới thiệu; tọa độ từng điểm đang đối chiếu.':'Danh mục khởi tạo — cần kiểm chứng trước chuyến đi.'}</p>${suggestions.map(name=>`<a target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name+' '+province.name)}">${esc(name)} ↗</a>`).join('')}${source?`<p><a href="${esc(source)}" target="_blank" rel="noopener noreferrer">Nguồn giới thiệu ↗</a></p>`:''}</section>`;
    const highlightText=highlights.length?highlights.map(p=>esc(p.name)).join(' · '):'Đang tiếp tục bổ sung điểm đến';
    $('details').innerHTML=`<p class="kicker">Địa phận đã chọn</p><span class="category">${esc(province.type)} · ${esc(provinceRegion(province.name))}</span><h2>${esc(province.name)}</h2><p class="lead">Bản đồ chi tiết tỉnh/thành ${esc(province.name)}</p><p class="muted">Khám phá ranh giới, trung tâm địa lý và các điểm đến nổi bật trong địa phận này.</p><dl class="facts"><dt>Diện tích</dt><dd>${province.area.toLocaleString('vi-VN')} km²</dd><dt>Dân số tham khảo</dt><dd>${province.population.toLocaleString('vi-VN')} người</dd><dt>Điểm đại diện đất liền</dt><dd>${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E</dd></dl><div class="detail-actions"><a class="primary" href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}" target="_blank" rel="noopener noreferrer">Mở vị trí trên Google Maps ↗</a><button data-back-region>← Về ${esc(provinceRegion(province.name))}</button></div><div class="tags">${highlights.length?highlights.map(p=>`<span>${esc(p.name)}</span>`).join(''):'<span>Đang cập nhật địa danh</span>'}</div><p class="tip">Điểm đến đã có tọa độ: ${highlightText}.</p>${suggestionHtml}`;
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
     if(state.hcmView){renderHcmMap();renderHcmDetails();return;}
     if(state.hanoiView){renderHanoiMap();renderHanoiDetails();return;}
     if(state.daNangView){renderDaNangMap();renderDaNangDetails();return;}
    if(province){renderProvinceMap();if(!state.selected){renderProvinceDetails(province);return;}}
    const markerProvince=state.provinceMarker&&provinceByName(state.provinceMarker);
    if(markerProvince){renderProvinceDetails(markerProvince);return;}
    const p=places.find(p=>p.id===state.selected);
    if(!p){$('details').innerHTML='<div class="empty">Chọn một địa điểm để xem thông tin.</div>';return;}
    const {latitude,longitude}=p.coordinates;
    $('details').innerHTML=`<p class="kicker">Điểm đến của bạn</p><span class="category">${p.region} · ${p.category}</span><h2>${esc(p.name)}</h2><p class="lead">${esc(p.short)}</p><p class="muted">${esc(p.description)}</p><dl class="facts"><dt>Thời điểm gợi ý</dt><dd>${esc(p.season)}</dd><dt>Tọa độ tham khảo</dt><dd>${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E</dd></dl><div class="detail-actions"><button class="primary" data-add="${p.id}" ${state.trip.includes(p.id)?'disabled':''}>${state.trip.includes(p.id)?'✓ Đã có trong hành trình':'+ Thêm vào hành trình'}</button><button data-save="${p.id}" aria-pressed="${state.saved.includes(p.id)}">${state.saved.includes(p.id)?'♥ Đã lưu địa điểm':'♡ Lưu địa điểm'}</button><a href="https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}" target="_blank" rel="noopener noreferrer">Chỉ đường ↗</a><button id="sharePlace">Sao chép liên kết</button></div><div class="tags">${p.tags.map(t=>`<span>#${esc(t)}</span>`).join('')}</div><p class="tip">Chọn thêm những nơi bạn thích, rồi mở “Hành trình” để sắp xếp chuyến đi.</p>`;
    $('sharePlace').onclick=async()=>{try{const url=new URL(location.href);url.hash=p.id;await navigator.clipboard.writeText(url.href);notify('Đã sao chép liên kết địa điểm');}catch{notify('Không thể sao chép tự động. Bạn có thể sao chép URL trên thanh địa chỉ.');}};
  }
  function select(id,fromMap=false){state.selected=id;history.replaceState(null,'',`#${id}`);render();if(fromMap){$('markers').querySelector('.selected')?.focus({preventScroll:true});}else if(matchMedia('(max-width:1100px)').matches)$('details').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});}
  document.addEventListener('click',e=>{const thumbnail=e.target.closest('[data-province-open]');if(thumbnail){e.preventDefault();openProvince(thumbnail.dataset.provinceOpen);return;}const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-province-points')){const ids=b.dataset.provincePoints.split('|');provinceLayer.querySelectorAll('.province-point-choices button').forEach(button=>button.classList.toggle('cluster-match',ids.includes(button.dataset.select)));provinceLayer.querySelector('.province-point-choices')?.scrollIntoView({block:'nearest'});return;}
    if(b.hasAttribute('data-country-cluster')){state.countryChoices=b.dataset.countryCluster.split('|');renderProvinceLabels();return;}
    if(b.hasAttribute('data-close-choices')){state.countryChoices=null;renderProvinceLabels();return;}
    if(b.hasAttribute('data-province-choice')){state.provinceMarker=b.dataset.provinceChoice;state.countryChoices=null;render();return;}
     if(b.classList.contains('province-label')||b.classList.contains('region-province-label')){state.provinceMarker=b.dataset.province;state.hcmMarker=null;state.hanoiMarker=null;state.daNangMarker=null;state.selected=null;render();return;}if(b.hasAttribute('data-hcm-place')){state.hcmMarker=b.dataset.hcmPlace;state.hanoiMarker=null;state.daNangMarker=null;state.provinceMarker=null;state.selected=null;render();return;}if(b.hasAttribute('data-hanoi-place')){state.hanoiMarker=b.dataset.hanoiPlace;state.hcmMarker=null;state.daNangMarker=null;state.provinceMarker=null;state.selected=null;render();return;}if(b.hasAttribute('data-danang-place')){state.daNangMarker=b.dataset.danangPlace;state.hcmMarker=null;state.hanoiMarker=null;state.provinceMarker=null;state.selected=null;render();return;}if(b.hasAttribute('data-hcm-clear')){state.hcmMarker=null;render();return;}if(b.hasAttribute('data-hanoi-clear')){state.hanoiMarker=null;render();return;}if(b.hasAttribute('data-danang-clear')){state.daNangMarker=null;render();return;}if(b.dataset.province){openProvince(b.dataset.province);return;}if(b.hasAttribute('data-back-region')){openRegion(state.regionView||'Trung Bộ');return;}if(b.dataset.select)select(b.dataset.select,b.classList.contains('marker'));if(b.dataset.save){const id=b.dataset.save;state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];persist('vne-favorites',state.saved);render();}if(b.dataset.add){if(!state.trip.includes(b.dataset.add))state.trip.push(b.dataset.add);persist('vivu-trip',state.trip);render();notify('Đã thêm vào hành trình');}if(b.dataset.category){state.category=b.dataset.category;document.querySelectorAll('[data-category]').forEach(x=>x.setAttribute('aria-pressed',x===b));render();}});
  $('search').oninput=e=>{state.query=e.target.value;if(topSearchInput)topSearchInput.value=e.target.value;render();};$('clearSearch').onclick=()=>{state.query='';$('search').value='';if(topSearchInput)topSearchInput.value='';render();$('search').focus();};$('region').onchange=e=>{if(e.target.value==='Tất cả')openCountry();else openRegion(e.target.value);};
   $('resetFilters').onclick=()=>{state.query='';state.category='all';state.region='Tất cả';state.regionView=null;state.provinceView=null;state.provinceMarker=null;state.hcmView=false;state.hcmMarker=null;state.hanoiView=false;state.hanoiMarker=null;state.daNangView=false;state.daNangMarker=null;state.savedOnly=false;$('search').value='';if(topSearchInput)topSearchInput.value='';$('region').value='Tất cả';document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.category==='all'));applyRegionView();render();};
  $('savedToggle').onclick=()=>{state.savedOnly=!state.savedOnly;render();};
  $('viewToggle').onclick=()=>{state.view=state.view==='map'?'list':'map';$('layout').classList.toggle('list-mode',state.view==='list');$('viewToggle').textContent=state.view==='map'?'Xem danh sách':'Xem bản đồ';};
   function zoom(delta){state.countryChoices=null;state.zoom=Math.max(.5,Math.min(2.5,Number((state.zoom+delta).toFixed(2))));$('scene').style.width=`${state.zoom*40}%`;$('scene').style.height='auto';$('scene').style.maxWidth='none';$('scene').style.flexShrink='0';$('zoomReset').textContent=`${Math.round(state.zoom*100)}%`;$('zoomOut').disabled=state.zoom<=.5;$('zoomIn').disabled=state.zoom>=2.5;renderProvinceLabels();}
  $('zoomIn').onclick=()=>zoom(.25);$('zoomOut').onclick=()=>zoom(-.25);$('zoomReset').onclick=()=>{state.zoom=1;zoom(0);document.documentElement.scrollTo({top:0,behavior:'smooth'});};
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
    'Bắc Bộ':{slug:'bac-bo',label:'Bắc Bộ',description:'Núi cao, đồng bằng và biển đảo phía Bắc',scale:2,focus:[35,15]},
    'Trung Bộ':{slug:'trung-bo',label:'Trung Bộ',description:'Dải di sản ven biển miền Trung',scale:2,focus:[46,41]},
    'Tây Nguyên':{slug:'tay-nguyen',label:'Tây Nguyên',description:'Cao nguyên, rừng thông và thác nước',scale:2,focus:[43,61]},
    'Nam Bộ':{slug:'nam-bo',label:'Nam Bộ',description:'Miền sông nước và những đảo xanh',scale:2,focus:[45,81]}
  };
  const mapWindow=$('mapWindow'), scene=$('scene'), regionAreas=document.createElement('div');
  const regionLegend=document.createElement('nav');
  regionLegend.id='regionLegend';regionLegend.setAttribute('aria-label','Chọn khu vực');
  regionLegend.innerHTML=`<button class="region-chip all" data-region-view="Tất cả" aria-label="Hiển thị tất cả vùng" aria-pressed="true">Tất Cả</button>${Object.values(regionViews).map(r=>`<button class="region-chip ${r.slug}" data-region-view="${r.label}" aria-pressed="false">${r.label}</button>`).join('')}`;
  document.querySelector('.map-section').insertBefore(regionLegend,mapWindow);
  mapWindow.insertAdjacentHTML('beforeend', '<button id="open3d" class="map-3d-launcher" type="button" aria-label="Mở bản đồ Việt Nam 3D"><span class="map-3d-cube" aria-hidden="true">◇</span><span><strong>3D</strong><small>Xem bản đồ không gian</small></span></button><section class="map-3d-view" id="map3dView" hidden aria-label="Bản đồ Việt Nam 3D"><div class="map-3d-head"><div><span class="map-3d-eyebrow">BẢN ĐỒ TƯƠNG TÁC</span><strong>Việt Nam 3D</strong></div><button id="close3d" type="button">← Bản đồ phẳng</button></div><div class="map-3d-stage" id="map3dStage" tabindex="0" role="application" aria-label="Kéo chuột để xoay bản đồ Việt Nam 3D"><div class="map-3d-grid" aria-hidden="true"></div><div class="map-3d-card" id="map3dCard"><div class="map-3d-depth depth-one" aria-hidden="true"></div><div class="map-3d-depth depth-two" aria-hidden="true"></div><div class="map-3d-surface"><img src="./MAP.png" width="1024" height="1536" alt="Mô hình 3D bản đồ Việt Nam" draggable="false"><span class="map-3d-river river-red" aria-hidden="true"></span><span class="map-3d-river river-mekong" aria-hidden="true"></span><span class="map-3d-city city-hanoi">Hà Nội</span><span class="map-3d-city city-danang">Đà Nẵng</span><span class="map-3d-city city-hcm">TP. Hồ Chí Minh</span><span class="map-3d-city city-cantho">Cần Thơ</span></div></div><div class="map-3d-compass" aria-hidden="true"><span>N</span><i>✦</i></div><div class="map-3d-hint"><span class="map-3d-mouse" aria-hidden="true">↔</span><span><strong>Kéo chuột để xoay</strong><small>Cuộn để phóng to · phím mũi tên để điều khiển</small></span></div></div><div class="map-3d-controls" aria-label="Điều khiển bản đồ 3D"><button id="map3dZoomOut" type="button" aria-label="Thu nhỏ bản đồ 3D">−</button><button id="map3dReset" type="button" aria-label="Đặt lại góc nhìn bản đồ 3D">100%</button><button id="map3dZoomIn" type="button" aria-label="Phóng to bản đồ 3D">+</button><span class="map-3d-control-note">↻ Xoay ngang / dọc</span></div></section>');
  const map3dView=$('map3dView'), map3dStage=$('map3dStage'), map3dCard=$('map3dCard');
  const map3d={rotateX:-18,rotateY:12,zoom:1,drag:null};
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  function render3dTransform(){map3dCard.style.setProperty('--map3d-rotate-x',map3d.rotateX+'deg');map3dCard.style.setProperty('--map3d-rotate-y',map3d.rotateY+'deg');map3dCard.style.setProperty('--map3d-zoom',map3d.zoom);$('map3dReset').textContent=Math.round(map3d.zoom*100)+'%';$('map3dZoomOut').disabled=map3d.zoom<=.8;$('map3dZoomIn').disabled=map3d.zoom>=1.45;}
  function set3dZoom(delta){map3d.zoom=clamp(Number((map3d.zoom+delta).toFixed(2)),.8,1.45);render3dTransform();}
  function reset3d(){map3d.rotateX=-18;map3d.rotateY=12;map3d.zoom=1;render3dTransform();notify('Đã đặt lại góc nhìn bản đồ 3D');}
  function close3d(){map3dView.hidden=true;mapWindow.classList.remove('is-3d');$('open3d').setAttribute('aria-expanded','false');map3d.drag=null;}
   function open3d(){state.view='map';$('layout').classList.remove('list-mode');$('viewToggle').textContent='Xem danh sách';state.provinceView=null;state.provinceMarker=null;state.hcmView=false;state.hcmMarker=null;state.hanoiView=false;state.hanoiMarker=null;state.daNangView=false;state.daNangMarker=null;state.regionView=null;state.region='Tất cả';$('region').value='Tất cả';applyRegionView();map3dView.hidden=false;mapWindow.classList.add('is-3d');$('open3d').setAttribute('aria-expanded','true');render3dTransform();requestAnimationFrame(()=>map3dStage.focus({preventScroll:true}));notify('Đã mở bản đồ Việt Nam 3D');}
  $('open3d').onclick=open3d;$('close3d').onclick=close3d;$('map3dZoomIn').onclick=()=>set3dZoom(.1);$('map3dZoomOut').onclick=()=>set3dZoom(-.1);$('map3dReset').onclick=reset3d;
  map3dStage.addEventListener('pointerdown',event=>{if(event.target.closest('button'))return;map3d.drag={pointerId:event.pointerId,x:event.clientX,y:event.clientY,rotateX:map3d.rotateX,rotateY:map3d.rotateY};map3dStage.setPointerCapture(event.pointerId);map3dStage.classList.add('is-dragging');});
  map3dStage.addEventListener('pointermove',event=>{if(!map3d.drag||event.pointerId!==map3d.drag.pointerId)return;map3d.rotateY=clamp(map3d.drag.rotateY+(event.clientX-map3d.drag.x)*.42,-70,70);map3d.rotateX=clamp(map3d.drag.rotateX-(event.clientY-map3d.drag.y)*.34,-58,58);render3dTransform();});
  const end3dDrag=event=>{if(!map3d.drag||event.pointerId!==map3d.drag.pointerId)return;map3d.drag=null;map3dStage.classList.remove('is-dragging');if(map3dStage.hasPointerCapture(event.pointerId))map3dStage.releasePointerCapture(event.pointerId);};
  map3dStage.addEventListener('pointerup',end3dDrag);map3dStage.addEventListener('pointercancel',end3dDrag);map3dStage.addEventListener('wheel',event=>{event.preventDefault();set3dZoom(event.deltaY<0?.08:-.08);},{passive:false});
  map3dStage.addEventListener('keydown',event=>{const step=event.shiftKey?10:5;if(event.key==='ArrowLeft'){map3d.rotateY=clamp(map3d.rotateY-step,-70,70);}else if(event.key==='ArrowRight'){map3d.rotateY=clamp(map3d.rotateY+step,-70,70);}else if(event.key==='ArrowUp'){map3d.rotateX=clamp(map3d.rotateX-step,-58,58);}else if(event.key==='ArrowDown'){map3d.rotateX=clamp(map3d.rotateX+step,-58,58);}else if(event.key==='+'||event.key==='='){set3dZoom(.1);return;}else if(event.key==='-'||event.key==='_'){set3dZoom(-.1);return;}else if(event.key==='0'){reset3d();return;}else{return;}event.preventDefault();render3dTransform();});
  render3dTransform();
  const provinceLayer=document.createElement('div');
  provinceLayer.id='provinceLayer';provinceLayer.hidden=true;mapWindow.appendChild(provinceLayer);
   const hcmLayer=document.createElement('div');
   hcmLayer.id='hcmLayer';hcmLayer.hidden=true;mapWindow.appendChild(hcmLayer);
  const hanoiLayer=document.createElement('div');
  hanoiLayer.id='hanoiLayer';hanoiLayer.hidden=true;mapWindow.appendChild(hanoiLayer);
  const daNangLayer=document.createElement('div');
  daNangLayer.id='daNangLayer';daNangLayer.hidden=true;mapWindow.appendChild(daNangLayer);
  mapWindow.addEventListener('click',e=>{if(e.target.closest('.province-point-choices,.country-choices,.hcm-directory-panel,.district-cluster,.marker,.marker-thumbnail,.province-marker,.region-hotspot,.region-province-label,.province-place-dot,.province-shape,.hcm-place-marker,.hcm-place-pin,.hanoi-place-marker,.hanoi-place-pin,.danang-place-marker,.danang-place-pin,.map-3d-view,.map-3d-launcher'))return;if(state.selected||state.provinceMarker||state.hcmMarker||state.hanoiMarker||state.daNangMarker){state.selected=null;state.provinceMarker=null;state.hcmMarker=null;state.hanoiMarker=null;state.daNangMarker=null;history.replaceState(null,'',location.pathname+location.search);render();}});
  const provinceBounds={minLon:102,maxLon:110.7,minLat:7.7,maxLat:23.7,width:760,height:1000};
  const projectCoords=([lon,lat])=>[(((lon-provinceBounds.minLon)/(provinceBounds.maxLon-provinceBounds.minLon))*provinceBounds.width),(((provinceBounds.maxLat-lat)/(provinceBounds.maxLat-provinceBounds.minLat))*provinceBounds.height)];
  const projectPoint=point=>projectCoords(point).map(value=>value.toFixed(1)).join(',');
  function provinceViewport(province){
    const points=province.polygons.flatMap(ring=>ring.filter(point=>point.length>=2).map(projectCoords));
    const xs=points.map(point=>point[0]),ys=points.map(point=>point[1]);
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const padX=Math.max((maxX-minX)*.24,18),padY=Math.max((maxY-minY)*.24,24);
    return {x:minX-padX,y:minY-padY,width:(maxX-minX)+padX*2,height:(maxY-minY)+padY*2};
  }
  function renderProvinceMap(){
    if(!state.provinceView){provinceLayer.innerHTML='';return;}
    if(!provinceData.length){provinceLayer.innerHTML='<div class="province-loading">Đang tải bản đồ ranh giới tỉnh/thành…</div>';return;}
    const province=provinceByName(state.provinceView);if(!province)return;
    const viewport=provinceViewport(province),center=projectPoint(province.center).split(',');
    const shape=`<g class="province-shape active" data-province="${esc(province.name)}" role="img" aria-label="Ranh giới ${esc(province.name)}">${province.polygons.filter(ring=>ring.length>=3).map(ring=>`<polygon points="${ring.map(projectPoint).join(' ')}"></polygon>`).join('')}<text x="${center[0]}" y="${center[1]}" text-anchor="middle">${esc(province.name)}</text></g>`;
    const provincePlaces=places.filter(place=>placeProvinceName(place)===province.name);
    const points=provincePlaces.map(place=>{const [x,y]=projectCoords([place.coordinates.longitude,place.coordinates.latitude]);return {id:place.id,x:(x-viewport.x)/viewport.width*100,y:(y-viewport.y)/viewport.height*100};});
    const width=mapWindow.clientWidth,height=width*viewport.height/viewport.width;
    const groups=window.MapCatalog.cluster(points.filter(p=>p.id!==state.selected),width,height,24).filter(g=>g.length>1);
    const grouped=new Set(groups.flat().map(p=>p.id));
    const clusterHtml=groups.map(g=>`<button class="district-cluster" data-province-points="${g.map(p=>p.id).join('|')}" style="left:${g.reduce((sum,p)=>sum+p.x,0)/g.length}%;top:${g.reduce((sum,p)=>sum+p.y,0)/g.length}%" aria-label="Chọn trong nhóm ${g.length} địa danh">${g.length}</button>`).join('');
    const directory=`<div class="province-point-choices"><strong>Địa danh trong tỉnh</strong>${provincePlaces.map(p=>`<button data-select="${esc(p.id)}" aria-pressed="${state.selected===p.id}">${esc(p.name)}</button>`).join('')||'<p>Chưa có điểm đã gắn tọa độ; xem gợi ý trong panel thông tin.</p>'}</div>`;
    const landmarks=provincePlaces.filter(p=>!grouped.has(p.id)).map(place=>{const [x,y]=projectCoords([place.coordinates.longitude,place.coordinates.latitude]);const left=((x-viewport.x)/viewport.width*100).toFixed(2),top=((y-viewport.y)/viewport.height*100).toFixed(2);return `<button class="province-place-dot ${place.id===state.selected?'selected':''}" data-select="${place.id}" style="left:${left}%;top:${top}%" aria-label="Chọn ${esc(place.name)}"><i></i><span>${esc(place.name)}</span>${place.id===state.selected?`<span class="province-landmark-preview"><img src="${esc(place.image)}" alt="${esc(place.imageAlt||place.name)}"><strong>${esc(place.name)}</strong></span>`:''}</button>`;}).join('');
    provinceLayer.innerHTML=`<div class="province-map-canvas" style="aspect-ratio:${viewport.width}/${viewport.height}"><svg class="province-svg" viewBox="${viewport.x.toFixed(1)} ${viewport.y.toFixed(1)} ${viewport.width.toFixed(1)} ${viewport.height.toFixed(1)}" role="img" aria-label="Bản đồ tỉnh ${esc(province.name)}"><rect class="province-sea" x="${viewport.x.toFixed(1)}" y="${viewport.y.toFixed(1)}" width="${viewport.width.toFixed(1)}" height="${viewport.height.toFixed(1)}"></rect><g>${shape}</g></svg><div class="province-place-layer">${landmarks}${clusterHtml}</div></div>${directory}<p class="province-map-caption">Các chấm tròn là địa danh nổi bật trong ${esc(province.name)}.</p>`;
  }
  function renderHcmMap(){
    if(!state.hcmView){hcmLayer.innerHTML='';return;}
    const previous=hcmLayer.querySelector('.hcm-directory');
    const scroll=previous?.scrollTop||0;
    const openGroups=[...hcmLayer.querySelectorAll('details[open]')].map(el=>el.dataset.district);
    const filtered=hcmDistrictLandmarks.filter(p=>normalize(p.name+' '+p.district+' '+p.category).includes(normalize(hcmQuery)));
    const groups=[...new Set(filtered.map(p=>p.district))].map(d=>[d,filtered.filter(p=>p.district===d)]);
    let pins='',lines='';
    for(const [district,items] of groups){
      const {left,top}=projectHcm(items[0]);
      const expanded=expandedDistrict===district||items.some(p=>p.name===state.hcmMarker);
      if(items.length>1&&!expanded){
        pins+=`<button class="district-cluster" style="left:${left}%;top:${top}%" data-cluster="${esc(district)}" aria-label="${esc(district)}, ${items.length} địa điểm">${items.length}</button>`;
        continue;
      }
      items.forEach((place,i)=>{
        const angle=2*Math.PI*i/items.length;
        const canvasWidth=hcmLayer.querySelector('.hcm-map-canvas')?.clientWidth||Math.max(280,mapWindow.clientWidth-256);
        const radius=Math.max(36,items.length*7);
        const x=Math.max(4,Math.min(96,left+(items.length>1?Math.cos(angle)*radius/canvasWidth*100:0))),y=Math.max(4,Math.min(96,top+(items.length>1?Math.sin(angle)*radius/(canvasWidth*1402/1122)*100:0)));
        const active=state.hcmMarker===place.name;
        if(items.length>1)lines+=`<line x1="${left}" y1="${top}" x2="${x}" y2="${y}"/>`;
        pins+=`<div class="hcm-place-marker ${active?'active':''}" style="left:${x}%;top:${y}%"><button class="hcm-place-pin" data-hcm-place="${esc(place.name)}" aria-label="Chọn ${esc(place.name)}" aria-expanded="${active}"><i></i><span>${esc(place.name)}</span></button>${active?`<div class="hcm-place-preview"><img src="./map-hcm.png" alt="Bản đồ minh họa khu vực"><span><strong>${esc(place.name)}</strong><small>${esc(place.category)} · ${esc(place.district)}</small></span></div>`:''}</div>`;
      });
    }
    const directory=groups.map(([district,items])=>`<details class="hcm-district-card" data-district="${esc(district)}" ${hcmQuery||openGroups.includes(district)||items.some(p=>p.name===state.hcmMarker)?'open':''}><summary>${esc(district)} <small>${items.length}</small></summary>${items.map(p=>`<button data-hcm-place="${esc(p.name)}" aria-pressed="${state.hcmMarker===p.name}"><strong>${esc(p.name)}</strong><small>${esc(p.category)}</small></button>`).join('')}</details>`).join('');
    hcmLayer.innerHTML=`<div class="hcm-map-shell"><div class="hcm-map-intro"><div><span class="panel-eyebrow">Bản đồ thành phố</span><strong>TP. Hồ Chí Minh</strong><small>Phân khu theo ảnh nền cũ · không phải ranh giới hành chính hiện hành</small></div><span class="hcm-place-count">${filtered.length} địa điểm</span></div><div class="hcm-map-layout"><aside class="hcm-directory-panel"><div class="hcm-directory-head"><strong>Địa danh theo quận, huyện</strong><label for="districtSearch">Tìm trong thành phố</label><input id="districtSearch" type="search" placeholder="Tên địa danh, quận, loại hình…" value="${esc(hcmQuery)}"><small>Chọn số trên bản đồ để tách nhóm điểm.</small></div><div class="hcm-directory" tabindex="0" aria-label="Danh sách địa danh">${directory||'<p class="empty">Không tìm thấy địa danh.</p>'}</div></aside><div class="hcm-map-canvas"><img src="./map-hcm.png" width="1122" height="1402" alt="Bản đồ minh họa TP. Hồ Chí Minh theo ảnh tham khảo" draggable="false"><div class="hcm-landmark-layer"><svg class="cluster-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${pins}</div></div></div></div>`;
    const hcmLayout=hcmLayer.querySelector('.hcm-map-layout'), hcmCanvas=hcmLayer.querySelector('.hcm-map-canvas');
    if(matchMedia('(min-width:901px)').matches&&hcmLayout&&hcmCanvas){
      const mapHeight=hcmCanvas.getBoundingClientRect().width*(1402/1122);
      hcmLayout.style.height=`${Math.round(mapHeight)}px`;
      hcmLayout.style.gridTemplateRows='minmax(0,1fr)';
    }else if(hcmLayout){hcmLayout.style.removeProperty('height');hcmLayout.style.removeProperty('grid-template-rows');}
    hcmLayer.querySelector('.hcm-directory').scrollTop=scroll;
    const input=$('districtSearch');
     input.oninput=()=>{const value=input.value,pos=input.selectionStart;hcmQuery=value;renderHcmMap();$('districtSearch').focus({preventScroll:true});try{$('districtSearch').setSelectionRange(pos,pos);}catch{}};
   }
  function renderHanoiMap(){
    if(!state.hanoiView){hanoiLayer.innerHTML='';return;}
    if(!provinceData.length){hanoiLayer.innerHTML='<div class="province-loading">Đang tải bản đồ ranh giới Hà Nội…</div>';return;}
    const province=provinceByName('Hà Nội');if(!province){hanoiLayer.innerHTML='<div class="empty">Chưa có hình học bản đồ Hà Nội.</div>';return;}
    const previous=hanoiLayer.querySelector('.hcm-directory');
    const scroll=previous?.scrollTop||0;
    const openGroups=[...hanoiLayer.querySelectorAll('details[open]')].map(el=>el.dataset.district);
    const filtered=window.MapCatalog.hanoiLandmarks.filter(p=>normalize(p.name+' '+p.district+' '+p.category).includes(normalize(hanoiQuery)));
    const viewport=provinceViewport(province), canvasWidth=hanoiLayer.querySelector('.hanoi-map-canvas')?.clientWidth||Math.max(280,mapWindow.clientWidth-256), canvasHeight=canvasWidth*viewport.height/viewport.width;
    const points=filtered.map(place=>{const [x,y]=projectCoords([place.longitude,place.latitude]);return {place,x:(x-viewport.x)/viewport.width*100,y:(y-viewport.y)/viewport.height*100};});
    const groups=window.MapCatalog.cluster(points,canvasWidth,canvasHeight,24);
    let pins='',lines='';
    for(const group of groups){
      const left=group.reduce((sum,p)=>sum+p.x,0)/group.length,top=group.reduce((sum,p)=>sum+p.y,0)/group.length,expanded=group.some(p=>p.place.name===state.hanoiMarker);
      if(group.length>1&&!expanded){pins+=`<button class="district-cluster hanoi-cluster" data-hanoi-place="${esc(group[0].place.name)}" style="left:${left}%;top:${top}%" aria-label="Chọn nhóm ${group.length} địa danh Hà Nội">${group.length}</button>`;continue;}
      group.forEach((point,i)=>{
        const angle=2*Math.PI*i/group.length,radius=Math.max(2,group.length*1.2),x=Math.max(3,Math.min(97,left+(group.length>1?Math.cos(angle)*radius:0))),y=Math.max(3,Math.min(97,top+(group.length>1?Math.sin(angle)*radius*viewport.width/viewport.height:0))),active=state.hanoiMarker===point.place.name;
        if(group.length>1)lines+=`<line x1="${left}" y1="${top}" x2="${x}" y2="${y}"/>`;
        pins+=`<div class="hcm-place-marker hanoi-place-marker ${active?'active':''}" style="left:${x}%;top:${y}%"><button class="hcm-place-pin hanoi-place-pin" data-hanoi-place="${esc(point.place.name)}" aria-label="Chọn ${esc(point.place.name)}" aria-expanded="${active}"><i></i><span>${esc(point.place.name)}</span></button>${active?`<div class="hcm-place-preview hanoi-place-preview"><div class="hanoi-preview-map" aria-hidden="true">⌂</div><span><strong>${esc(point.place.name)}</strong><small>${esc(point.place.category)} · ${esc(point.place.district)}</small></span></div>`:''}</div>`;
      });
    }
    const shape=`<g class="province-shape active" data-province="Hà Nội" role="img" aria-label="Ranh giới Hà Nội">${province.polygons.filter(ring=>ring.length>=3).map(ring=>`<polygon points="${ring.map(projectPoint).join(' ')}"></polygon>`).join('')}<text x="${projectPoint(province.center).split(',')[0]}" y="${projectPoint(province.center).split(',')[1]}" text-anchor="middle">Hà Nội</text></g>`;
    const directory=[...new Set(filtered.map(p=>p.district))].map(d=>[d,filtered.filter(p=>p.district===d)]).map(([district,items])=>`<details class="hcm-district-card" data-district="${esc(district)}" ${hanoiQuery||openGroups.includes(district)||items.some(p=>p.name===state.hanoiMarker)?'open':''}><summary>${esc(district)} <small>${items.length}</small></summary>${items.map(p=>`<button data-hanoi-place="${esc(p.name)}" aria-pressed="${state.hanoiMarker===p.name}"><strong>${esc(p.name)}</strong><small>${esc(p.category)}</small></button>`).join('')}</details>`).join('');
    hanoiLayer.innerHTML=`<div class="hcm-map-shell hanoi-map-shell"><div class="hcm-map-intro"><div><span class="panel-eyebrow">Bản đồ thành phố</span><strong>Hà Nội</strong><small>Bản đồ ranh giới tỉnh/thành và địa danh gợi ý theo quận, huyện</small></div><span class="hcm-place-count">${filtered.length} địa điểm</span></div><div class="hcm-map-layout"><aside class="hcm-directory-panel"><div class="hcm-directory-head"><strong>Địa danh theo quận, huyện</strong><label for="hanoiSearch">Tìm trong thành phố</label><input id="hanoiSearch" type="search" placeholder="Tên địa danh, quận, loại hình…" value="${esc(hanoiQuery)}"><small>Chọn chấm hoặc tên địa danh để xem thông tin.</small></div><div class="hcm-directory hanoi-directory" tabindex="0" aria-label="Danh sách địa danh Hà Nội">${directory||'<p class="empty">Không tìm thấy địa danh.</p>'}</div></aside><div class="hcm-map-canvas hanoi-map-canvas" style="aspect-ratio:${viewport.width}/${viewport.height}"><svg class="province-svg" viewBox="${viewport.x.toFixed(1)} ${viewport.y.toFixed(1)} ${viewport.width.toFixed(1)} ${viewport.height.toFixed(1)}" role="img" aria-label="Bản đồ thành phố Hà Nội"><rect class="province-sea" x="${viewport.x.toFixed(1)}" y="${viewport.y.toFixed(1)}" width="${viewport.width.toFixed(1)}" height="${viewport.height.toFixed(1)}"></rect>${shape}</svg><div class="hcm-landmark-layer"><svg class="cluster-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${pins}</div></div></div></div>`;
    const hanoiLayout=hanoiLayer.querySelector('.hcm-map-layout'),hanoiCanvas=hanoiLayer.querySelector('.hanoi-map-canvas');
    if(matchMedia('(min-width:901px)').matches&&hanoiLayout&&hanoiCanvas){hanoiLayout.style.height=`${Math.round(hanoiCanvas.getBoundingClientRect().width*viewport.height/viewport.width)}px`;hanoiLayout.style.gridTemplateRows='minmax(0,1fr)';}else if(hanoiLayout){hanoiLayout.style.removeProperty('height');hanoiLayout.style.removeProperty('grid-template-rows');}
    hanoiLayer.querySelector('.hcm-directory').scrollTop=scroll;
    const input=$('hanoiSearch');
    input.oninput=()=>{const value=input.value,pos=input.selectionStart;hanoiQuery=value;renderHanoiMap();$('hanoiSearch').focus({preventScroll:true});try{$('hanoiSearch').setSelectionRange(pos,pos);}catch{}};
  }
  function renderHanoiDetails(){
    const place=window.MapCatalog.hanoiLandmarks.find(item=>item.name===state.hanoiMarker);
    if(place){$('details').innerHTML=`<p class="kicker">Địa danh đã chọn</p><span class="category">${esc(place.category)} · ${esc(place.district)}</span><h2>${esc(place.name)}</h2><p class="lead">Địa điểm nổi bật tại ${esc(place.district)}, Hà Nội</p><p class="muted">${esc(place.description)}</p><p>${esc(place.address)}</p><p class="tip">Tọa độ ghim tham khảo: ${place.latitude.toFixed(4)}°N, ${place.longitude.toFixed(4)}°E. Hãy kiểm tra thông tin vận hành trước chuyến đi.</p><a target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}">Mở vị trí trên Google Maps ↗</a>${place.source?`<p><a href="${esc(place.source)}" target="_blank" rel="noopener noreferrer">Nguồn thông tin ↗</a></p>`:''}<div class="detail-actions"><button data-hanoi-clear>← Về tổng quan Hà Nội</button></div><div class="tags"><span>${esc(place.category)}</span><span>${esc(place.district)}</span></div>`;return;}
    $('details').innerHTML=`<p class="kicker">Địa phận đã chọn</p><span class="category">Thành phố · Bắc Bộ</span><h2>Hà Nội</h2><p class="lead">Bản đồ địa danh và khu vui chơi theo quận, huyện</p><p class="muted">Các địa điểm Hà Nội đã được điền vào bản đồ bằng dữ liệu địa danh và tọa độ tham khảo để bạn tìm kiếm, chọn điểm và xem thông tin.</p><dl class="facts"><dt>Quận, huyện</dt><dd>${new Set(window.MapCatalog.hanoiLandmarks.map(place=>place.district)).size} khu vực</dd><dt>Địa điểm đã điền</dt><dd>${window.MapCatalog.hanoiLandmarks.length} địa danh và khu vui chơi</dd><dt>Trạng thái tọa độ</dt><dd>Ghim tham khảo, cần kiểm tra trước chuyến đi</dd></dl><div class="detail-actions"><button data-back-region>← Về Bắc Bộ</button></div><div class="tags"><span>Di sản</span><span>Văn hóa</span><span>Khu vui chơi</span><span>Thiên nhiên</span></div>`;
  }
  function renderDaNangMap(){
    if(!state.daNangView){daNangLayer.innerHTML='';return;}
    const previous=daNangLayer.querySelector('.hcm-directory'),scroll=previous?.scrollTop||0;
    const openGroups=[...daNangLayer.querySelectorAll('details[open]')].map(el=>el.dataset.district);
    const filtered=window.MapCatalog.daNangLandmarks.filter(p=>normalize(p.name+' '+p.district+' '+p.category).includes(normalize(daNangQuery)));
    const canvasWidth=daNangLayer.querySelector('.danang-map-canvas')?.clientWidth||Math.max(280,mapWindow.clientWidth-256),canvasHeight=canvasWidth*1402/1122;
    const points=filtered.map(place=>{const [left,top]=window.MapCatalog.daNangDistricts[place.district]||[50,50];return {place,x:left,y:top};});
    const groups=window.MapCatalog.cluster(points,canvasWidth,canvasHeight,24);let pins='',lines='';
    for(const group of groups){
      const left=group.reduce((sum,p)=>sum+p.x,0)/group.length,top=group.reduce((sum,p)=>sum+p.y,0)/group.length,expanded=group.some(p=>p.place.name===state.daNangMarker);
      if(group.length>1&&!expanded){pins+=`<button class="district-cluster danang-cluster" data-danang-place="${esc(group[0].place.name)}" style="left:${left}%;top:${top}%" aria-label="Chọn nhóm ${group.length} địa danh Đà Nẵng">${group.length}</button>`;continue;}
      group.forEach((point,i)=>{const angle=2*Math.PI*i/group.length,radius=Math.max(2,group.length*1.2),x=Math.max(3,Math.min(97,left+(group.length>1?Math.cos(angle)*radius:0))),y=Math.max(3,Math.min(97,top+(group.length>1?Math.sin(angle)*radius:0))),active=state.daNangMarker===point.place.name;if(group.length>1)lines+=`<line x1="${left}" y1="${top}" x2="${x}" y2="${y}"/>`;pins+=`<div class="hcm-place-marker danang-place-marker ${active?'active':''}" style="left:${x}%;top:${y}%"><button class="hcm-place-pin danang-place-pin" data-danang-place="${esc(point.place.name)}" aria-label="Chọn ${esc(point.place.name)}" aria-expanded="${active}"><i></i><span>${esc(point.place.name)}</span></button>${active?`<div class="hcm-place-preview danang-place-preview"><img src="./map-da-nang.png" alt="Bản đồ Đà Nẵng thu nhỏ"><span><strong>${esc(point.place.name)}</strong><small>${esc(point.place.category)} · ${esc(point.place.district)}</small></span></div>`:''}</div>`;});
    }
    const directory=[...new Set(filtered.map(p=>p.district))].map(d=>[d,filtered.filter(p=>p.district===d)]).map(([district,items])=>`<details class="hcm-district-card" data-district="${esc(district)}" ${daNangQuery||openGroups.includes(district)||items.some(p=>p.name===state.daNangMarker)?'open':''}><summary>${esc(district)} <small>${items.length}</small></summary>${items.map(p=>`<button data-danang-place="${esc(p.name)}" aria-pressed="${state.daNangMarker===p.name}"><strong>${esc(p.name)}</strong><small>${esc(p.category)}</small></button>`).join('')}</details>`).join('');
    daNangLayer.innerHTML=`<div class="hcm-map-shell danang-map-shell"><div class="hcm-map-intro"><div><span class="panel-eyebrow">Bản đồ thành phố</span><strong>Đà Nẵng</strong><small>Địa danh theo các khu vực thể hiện trên ảnh minh họa bạn cung cấp</small></div><span class="hcm-place-count">${filtered.length} địa điểm</span></div><div class="hcm-map-layout"><aside class="hcm-directory-panel"><div class="hcm-directory-head"><strong>Địa danh theo quận, huyện</strong><label for="danangSearch">Tìm trong thành phố</label><input id="danangSearch" type="search" placeholder="Tên địa danh, quận, loại hình…" value="${esc(daNangQuery)}"><small>Chọn chấm hoặc tên địa danh để xem thông tin.</small></div><div class="hcm-directory danang-directory" tabindex="0" aria-label="Danh sách địa danh Đà Nẵng">${directory||'<p class="empty">Không tìm thấy địa danh.</p>'}</div></aside><div class="hcm-map-canvas danang-map-canvas"><img src="./map-da-nang.png" width="1122" height="1402" alt="Bản đồ minh họa thành phố Đà Nẵng" draggable="false"><div class="hcm-landmark-layer"><svg class="cluster-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${pins}</div></div></div></div>`;
    const layout=daNangLayer.querySelector('.hcm-map-layout'),canvas=daNangLayer.querySelector('.danang-map-canvas');
    if(matchMedia('(min-width:901px)').matches&&layout&&canvas){layout.style.height=`${Math.round(canvas.getBoundingClientRect().width*1402/1122)}px`;layout.style.gridTemplateRows='minmax(0,1fr)';}else if(layout){layout.style.removeProperty('height');layout.style.removeProperty('grid-template-rows');}
    daNangLayer.querySelector('.hcm-directory').scrollTop=scroll;
    const input=$('danangSearch');input.oninput=()=>{const value=input.value,pos=input.selectionStart;daNangQuery=value;renderDaNangMap();$('danangSearch').focus({preventScroll:true});try{$('danangSearch').setSelectionRange(pos,pos);}catch{}};
  }
  function renderDaNangDetails(){
    const place=window.MapCatalog.daNangLandmarks.find(item=>item.name===state.daNangMarker);
    if(place){$('details').innerHTML=`<p class="kicker">Địa danh đã chọn</p><span class="category">${esc(place.category)} · ${esc(place.district)}</span><h2>${esc(place.name)}</h2><p class="lead">Địa điểm nổi bật tại ${esc(place.district)}, Đà Nẵng</p><p class="muted">${esc(place.description)}</p><p>${esc(place.address)}</p><p class="tip">Tọa độ ghim tham khảo: ${place.latitude.toFixed(4)}°N, ${place.longitude.toFixed(4)}°E. Vị trí trên ảnh bám theo khu vực minh họa.</p><a target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}">Mở vị trí trên Google Maps ↗</a><div class="detail-actions"><button data-danang-clear>← Về tổng quan Đà Nẵng</button></div><div class="tags"><span>${esc(place.category)}</span><span>${esc(place.district)}</span></div>`;return;}
    $('details').innerHTML=`<p class="kicker">Địa phận đã chọn</p><span class="category">Thành phố · Trung Bộ</span><h2>Đà Nẵng</h2><p class="lead">Bản đồ địa danh và khu vui chơi theo khu vực</p><p class="muted">Ảnh nền Đà Nẵng bạn cung cấp đã được gắn vào bản đồ thành phố. Các địa danh được điền theo những khu vực và nhãn thể hiện trên ảnh.</p><dl class="facts"><dt>Khu vực</dt><dd>${new Set(window.MapCatalog.daNangLandmarks.map(place=>place.district)).size} khu vực</dd><dt>Địa điểm đã điền</dt><dd>${window.MapCatalog.daNangLandmarks.length} địa danh và khu vui chơi</dd><dt>Tọa độ</dt><dd>Ghim tham khảo, có thể kiểm tra lại trước chuyến đi</dd></dl><div class="detail-actions"><button data-back-region>← Về Trung Bộ</button></div><div class="tags"><span>Biển</span><span>Danh thắng</span><span>Khu vui chơi</span><span>Văn hóa</span></div>`;
  }
  document.addEventListener('click',event=>{
    const cluster=event.target.closest('[data-cluster]');
    if(cluster){expandedDistrict=expandedDistrict===cluster.dataset.cluster?null:cluster.dataset.cluster;state.hcmMarker=null;renderHcmMap();renderHcmDetails();}
  });
  function renderHcmDetails(){
    const place=hcmDistrictLandmarks.find(item=>item.name===state.hcmMarker);
    if(place){$('details').innerHTML=`<p class="kicker">Địa danh đã chọn</p><span class="category">${esc(place.category)} · ${esc(place.district)}</span><h2>${esc(place.name)}</h2><p class="lead">Địa điểm nổi bật tại ${esc(place.district)}</p><p class="muted">${esc(place.description||"Địa danh được phân nhóm theo khu vực trên ảnh minh họa. Nội dung chi tiết đang được kiểm chứng.")}</p><p>${esc(place.address||"Địa chỉ chi tiết: đang cập nhật")}</p><p class="tip">${place.source?"Có nguồn tham khảo bên dưới; tọa độ chỉ mang tính tham khảo.":"Dữ liệu khởi tạo — chưa xác minh đầy đủ."}</p><a target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name+' '+(place.address||place.district+' TP. Hồ Chí Minh'))}">Tìm vị trí trên Google Maps ↗</a>${place.source?`<p><a href="${esc(place.source)}" target="_blank" rel="noopener noreferrer">Nguồn thông tin ↗</a></p>`:""}<dl class="facts"><dt>Quận, huyện</dt><dd>${esc(place.district)}</dd><dt>Nhóm địa điểm</dt><dd>${esc(place.category)}</dd></dl><div class="detail-actions"><button data-hcm-clear>← Về tổng quan TP. Hồ Chí Minh</button></div><div class="tags"><span>${esc(place.category)}</span><span>${esc(place.district)}</span></div>`;return;}
    $('details').innerHTML=`<p class="kicker">Địa phận đã chọn</p><span class="category">Thành phố · Nam Bộ</span><h2>TP. Hồ Chí Minh</h2><p class="lead">Bản đồ địa danh và khu vui chơi theo quận, huyện</p><p class="muted">Các địa điểm được tự động điền lên bản đồ minh họa theo nhóm quận, huyện để bạn dễ tìm và chọn điểm đến.</p><dl class="facts"><dt>Phạm vi</dt><dd>${new Set(hcmDistrictLandmarks.map(place=>place.district)).size} quận, huyện</dd><dt>Địa điểm đã điền</dt><dd>${hcmDistrictLandmarks.length} địa danh và khu vui chơi</dd><dt>Phạm vi ảnh nền</dt><dd>TP. Hồ Chí Minh trước sáp nhập; tên quận/huyện theo ảnh tham khảo</dd></dl><div class="detail-actions"><button data-back-region>← Về Nam Bộ</button></div><div class="tags"><span>Quận trung tâm</span><span>Khu vui chơi</span><span>Địa danh lịch sử</span><span>Công viên</span></div><p class="tip">Bản đồ nền được đặt theo hình ảnh tham khảo bạn cung cấp; chấm tròn là điểm neo minh họa theo khu vực, không phải tọa độ GPS. Các nhóm điểm được tách ra có đường nối để dễ chọn.</p>`;
  }
  function openProvince(name){
    const province=provinceByName(name);
    if(!province){notify('Chưa có dữ liệu bản đồ cho tỉnh này');return;}
    setExplore(false);
    hcmQuery='';expandedDistrict=null;hanoiQuery='';hanoiExpandedDistrict=null;daNangQuery='';daNangExpandedDistrict=null;state.provinceView=name;state.provinceMarker=null;state.hcmView=name==='TP. Hồ Chí Minh';state.hcmMarker=null;state.hanoiView=name==='Hà Nội';state.hanoiMarker=null;state.daNangView=name==='Đà Nẵng';state.daNangMarker=null;state.regionView=provinceRegion(name);state.region=state.regionView;state.savedOnly=false;state.view='map';$('region').value=state.region;$('layout').classList.remove('list-mode');$('viewToggle').textContent='Xem danh sách';
    state.selected=null;
    applyRegionView();render();mapWindow.scrollTo(0,0);notify(`Đã mở bản đồ ${name}`);
  }
  regionAreas.id='regionAreas';regionAreas.setAttribute('aria-label','Chọn khu vực trên bản đồ');scene.appendChild(regionAreas);
  const toolbar=document.querySelector('.toolbar'), toolbarTitle=toolbar.querySelector('strong');
  toolbar.appendChild($('open3d'));
  toolbarTitle.id='mapTitle';toolbarTitle.insertAdjacentHTML('afterend','<small id="mapCrumb">Bản đồ toàn quốc · Chọn một khu vực trên ảnh</small>');
  toolbar.querySelector('.map-controls').insertAdjacentHTML('afterbegin','<button id="backToCountry" hidden>← Việt Nam</button>');
  function renderRegionAreas(){
    if(state.regionView){regionAreas.innerHTML='';delete regionAreas.dataset.hoverRegion;return;}
    const hotspots=Object.values(regionViews).map(r=>`<button class="region-hotspot ${r.slug}" data-region-view="${r.label}" aria-label="Mở bản đồ ${r.label}"></button>`).join('');
    const labels=Object.values(regionViews).map(r=>{const names=provinceGroups[r.label]||[];return `<div class="region-hover-labels" data-region="${r.slug}" role="group" aria-label="Tỉnh thành ${r.label}">${names.map(name=>{const point=window.MapCatalog.anchors[name]||[50,50];return `<button type="button" class="region-province-label" data-province="${esc(name)}" style="left:${point[0]}%;top:${point[1]}%" aria-label="Chọn ${esc(name)}" title="${esc(name)}"><i aria-hidden="true"></i><span>${esc(name)}</span></button>`;}).join('')}</div>`;}).join('');
    regionAreas.innerHTML=hotspots+labels;
    let hoverClearTimer;
    const setRegionHover=slug=>{clearTimeout(hoverClearTimer);regionAreas.dataset.hoverRegion=slug;};
    const clearRegionHover=(slug,event)=>{const related=event?.relatedTarget;if(related?.closest?.('.region-province-label')?.parentElement?.dataset.region===slug)return;clearTimeout(hoverClearTimer);hoverClearTimer=setTimeout(()=>{if(!regionAreas.querySelector('.region-province-label:hover')&&!regionAreas.querySelector('.region-hotspot:hover')&&regionAreas.dataset.hoverRegion===slug)delete regionAreas.dataset.hoverRegion;},120);};
    regionAreas.querySelectorAll('.region-hotspot').forEach(button=>{const slug=button.classList[1]||'';button.addEventListener('pointerenter',()=>setRegionHover(slug));button.addEventListener('pointerleave',event=>clearRegionHover(slug,event));button.addEventListener('focus',()=>setRegionHover(slug));button.addEventListener('blur',event=>clearRegionHover(slug,event));});
    regionAreas.querySelectorAll('.region-province-label').forEach(button=>{const slug=button.parentElement.dataset.region;button.addEventListener('pointerenter',()=>setRegionHover(slug));button.addEventListener('pointerleave',event=>clearRegionHover(slug,event));button.addEventListener('focus',()=>setRegionHover(slug));button.addEventListener('blur',event=>clearRegionHover(slug,event));});
    regionLegend.querySelectorAll('[data-region-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.regionView==='Tất cả'?!state.regionView:button.dataset.regionView===state.regionView)));
  }
  function centerRegionView(region){
    if(!region||state.regionView!==region.label||state.provinceView||scene.hidden)return;
    const width=scene.offsetWidth,height=scene.offsetHeight;
    if(!width||!height)return;
    const [focusX,focusY]=region.focus;
    const scale=region.scale;
    const left=mapWindow.clientWidth/2-(width*focusX/100)*scale;
    const top=mapWindow.clientHeight/2-(height*focusY/100)*scale;
    scene.style.transformOrigin='top left';
    scene.style.transform=`translate(${Math.round(left)}px,${Math.round(top)}px) scale(${scale})`;
  }
  function applyRegionView(){
    const r=state.regionView?regionViews[state.regionView]:null;
    const province=state.provinceView&&provinceByName(state.provinceView);
    const hcm=Boolean(state.hcmView&&province),hanoi=Boolean(state.hanoiView&&province),daNang=Boolean(state.daNangView&&province);
    const cityView=hcm||hanoi||daNang;
    const provinceMode=Boolean(province&&!cityView);
    $('layout').classList.toggle('hcm-layout',cityView);
    ['zoomIn','zoomOut','zoomReset'].forEach(id=>$(id).hidden=Boolean(province));
    $('open3d').hidden=Boolean(province);
    mapWindow.classList.toggle('region-mode',Boolean(r&&!province));mapWindow.classList.toggle('province-mode',provinceMode);mapWindow.classList.toggle('hcm-mode',hcm);mapWindow.classList.toggle('hanoi-mode',hanoi);mapWindow.classList.toggle('danang-mode',daNang);scene.hidden=Boolean(province||cityView);provinceLayer.hidden=!provinceMode;hcmLayer.hidden=!hcm;hanoiLayer.hidden=!hanoi;daNangLayer.hidden=!daNang;scene.className=`map-scene${r&&!province?' region-view region-'+r.slug:''}`;
    if(hcm){scene.style.removeProperty('transform');scene.style.removeProperty('transform-origin');toolbarTitle.textContent='Bản đồ TP. Hồ Chí Minh';$('mapCrumb').textContent='Bản đồ quận, huyện · địa danh và khu vui chơi';$('backToCountry').textContent='← Nam Bộ';$('backToCountry').hidden=false;provinceLayer.innerHTML='';hanoiLayer.innerHTML='';daNangLayer.innerHTML='';renderHcmMap();}
    else if(hanoi){scene.style.removeProperty('transform');scene.style.removeProperty('transform-origin');toolbarTitle.textContent='Bản đồ Hà Nội';$('mapCrumb').textContent='Bản đồ quận, huyện · địa danh và khu vui chơi';$('backToCountry').textContent='← Bắc Bộ';$('backToCountry').hidden=false;provinceLayer.innerHTML='';hcmLayer.innerHTML='';daNangLayer.innerHTML='';renderHanoiMap();}
    else if(daNang){scene.style.removeProperty('transform');scene.style.removeProperty('transform-origin');toolbarTitle.textContent='Bản đồ Đà Nẵng';$('mapCrumb').textContent='Bản đồ khu vực · địa danh và khu vui chơi';$('backToCountry').textContent='← Trung Bộ';$('backToCountry').hidden=false;provinceLayer.innerHTML='';hcmLayer.innerHTML='';hanoiLayer.innerHTML='';renderDaNangMap();}
    else if(provinceMode){scene.style.removeProperty('transform');scene.style.removeProperty('transform-origin');toolbarTitle.textContent=`Bản đồ ${province.name}`;$('mapCrumb').textContent=`${province.type} · ${province.area.toLocaleString('vi-VN')} km² · ${provinceRegion(province.name)}`;$('backToCountry').textContent=`← ${state.regionView||'Khu vực'}`;$('backToCountry').hidden=false;hcmLayer.innerHTML='';hanoiLayer.innerHTML='';daNangLayer.innerHTML='';renderProvinceMap();}
    else if(r){scene.style.removeProperty('transform');scene.style.transformOrigin='top left';toolbarTitle.textContent=`Bản đồ ${r.label}`;$('mapCrumb').textContent=`${r.description} · ${provinceData.filter(p=>provinceRegion(p.name)===r.label).length||visible().filter(p=>p.region===r.label).length} tỉnh/thành`;$('backToCountry').textContent='← Tất cả';$('backToCountry').hidden=false;provinceLayer.innerHTML='';}
    else{scene.style.removeProperty('transform');scene.style.removeProperty('transform-origin');toolbarTitle.textContent='Việt Nam qua từng điểm đến';$('mapCrumb').textContent='Bản đồ toàn quốc · Chọn một khu vực trên ảnh';$('backToCountry').hidden=true;provinceLayer.innerHTML='';hcmLayer.innerHTML='';hanoiLayer.innerHTML='';daNangLayer.innerHTML='';}
    renderRegionAreas();
    if(r&&!province)requestAnimationFrame(()=>centerRegionView(r));
  }
  function openCountry(){state.countryChoices=null;state.zoom=1;zoom(0);setExplore(false);state.provinceView=null;state.provinceMarker=null;state.hcmView=false;state.hcmMarker=null;state.hanoiView=false;state.hanoiMarker=null;state.daNangView=false;state.daNangMarker=null;state.regionView=null;state.region='Tất cả';state.savedOnly=false;state.selected=null;$('region').value='Tất cả';state.view='map';$('layout').classList.remove('list-mode');$('viewToggle').textContent='Xem danh sách';applyRegionView();render();mapWindow.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'center'});notify('Đã trở về bản đồ Việt Nam');}
  function openRegion(name){state.countryChoices=null;if(name==='Tất cả'){openCountry();return;}setExplore(false);state.provinceView=null;state.provinceMarker=null;state.hcmView=false;state.hcmMarker=null;state.hanoiView=false;state.hanoiMarker=null;state.daNangView=false;state.daNangMarker=null;state.regionView=name;state.region=name;state.savedOnly=false;state.selected=null;$('region').value=name;state.view='map';$('layout').classList.remove('list-mode');$('viewToggle').textContent='Xem danh sách';applyRegionView();render();mapWindow.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'center'});notify(`Đã mở bản đồ ${name}`);}
  document.addEventListener('click',e=>{const b=e.target.closest('[data-region-view]');if(b)openRegion(b.dataset.regionView);});
  document.addEventListener('click',e=>{const shape=e.target.closest?.('[data-province]');if(shape&&shape.tagName.toLowerCase()!=='button')openProvince(shape.dataset.province);});
  document.addEventListener('keydown',e=>{const thumbnail=e.target.closest?.('[data-province-open]');if(thumbnail&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openProvince(thumbnail.dataset.provinceOpen);return;}const shape=e.target.closest?.('[data-province]');if(shape&&(e.key==='Enter'||e.key===' ')){e.preventDefault();if(shape.classList.contains('province-label')||shape.classList.contains('region-province-label')){state.provinceMarker=shape.dataset.province;state.hcmMarker=null;state.hanoiMarker=null;state.daNangMarker=null;render();}else openProvince(shape.dataset.province);}});
  $('backToCountry').onclick=()=>{if(state.provinceView){state.provinceView=null;state.provinceMarker=null;state.hcmView=false;state.hcmMarker=null;state.hanoiView=false;state.hanoiMarker=null;state.daNangView=false;state.daNangMarker=null;applyRegionView();render();mapWindow.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'center'});notify(`Đã trở về bản đồ ${state.regionView}`);}else openCountry();};
  new ResizeObserver(()=>{renderProvinceLabels();if(state.regionView&&!state.provinceView)centerRegionView(regionViews[state.regionView]);}).observe(scene);
  let resizeTimer;
  addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(state.hcmView)renderHcmMap();else if(state.hanoiView)renderHanoiMap();else if(state.daNangView)renderDaNangMap();else if(state.provinceView)renderProvinceMap();else if(state.regionView)centerRegionView(regionViews[state.regionView]);},120);});
  renderRegionAreas();applyRegionView();render();zoom(0);
  fetch('./provinces-source.json',{cache:'force-cache'}).then(response=>{if(!response.ok)throw new Error('province-data');return response.json();}).then(payload=>{provinceData=Array.isArray(payload.provinces)?payload.provinces.map(p=>({...p,center:window.MapCatalog.representative(p.polygons)||p.center})):[];if(state.provinceView)applyRegionView();render();}).catch(()=>notify('Không tải được dữ liệu bản đồ tỉnh/thành'));
  addEventListener('vivu:places-ready', () => { renderRegionAreas(); applyRegionView(); render(); notify('Đã đồng bộ địa danh từ Firebase'); });
})();
