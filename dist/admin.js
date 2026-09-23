(() => {
  'use strict';
  const $ = id => document.getElementById(id), form = $('editor'), field = name => form.elements.namedItem(name), store = window.PlaceStore;
  const anchors = {'sapa':[23,11],'hanoi':[37,18],'ha-long':[51,16],'phong-nha':[36,34],'hue':[46,41],'da-nang':[53,45],'hoi-an':[55,48],'my-son':[48,49],'nha-trang':[64,62],'da-lat':[54,65],'can-tho':[36,77],'phu-quoc':[21,72]};
  let selected = null, dirty = false;
  const status = text => $('status').textContent = text;
  const normalize = text => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
  for (const r of window.VIETNAM_REGIONS.slice(1)) field('region').add(new Option(r,r));
  for (const c of window.VIETNAM_CATEGORIES.filter(c => c.key !== 'all')) field('categoryKey').add(new Option(c.label,c.key));
  fetch('./provinces-source.json').then(r => r.json()).then(data => { for (const p of data.provinces) $('provinces').append(new Option(p.name,p.name)); }).catch(() => {});
  const pin = () => { $('pin').style.left = field('left').value + '%'; $('pin').style.top = field('top').value + '%'; };
  function renderList() {
    const query = normalize($('search').value);
    const list = store.all().filter(p => normalize(p.name + ' ' + p.province).includes(query));
    $('count').textContent = list.length + ' địa danh'; $('list').replaceChildren();
    for (const p of list) {
      const button = document.createElement('button'), small = document.createElement('small');
      button.type = 'button'; button.textContent = p.name; small.textContent = p.province + ' · ' + p.category;
      button.append(small); button.setAttribute('aria-current', String(p.id === selected)); button.onclick = () => open(p); $('list').append(button);
    }
  }
  function open(p) {
    if (dirty && !confirm('Bỏ những thay đổi chưa lưu?')) return;
    form.reset(); selected = p?.id || null; field('id').readOnly = !!p;
    if (p) {
      for (const key of ['id','name','province','region','categoryKey','short','description','season','image','imageAlt','credit']) field(key).value = p[key] || '';
      field('latitude').value = p.coordinates.latitude; field('longitude').value = p.coordinates.longitude;
      const position = !p.managed && anchors[p.id] ? {left:anchors[p.id][0],top:anchors[p.id][1]} : p.position;
      field('left').value = position.left; field('top').value = position.top; field('tags').value = p.tags.join(', ');
    }
    $('title').textContent = p ? 'Chỉnh sửa: ' + p.name : 'Thêm địa danh';
    $('preview').href = './' + (p ? '#' + p.id : ''); dirty = false; pin(); renderList();
  }
  form.addEventListener('input', () => { dirty = true; pin(); });
  field('name').addEventListener('input', () => { if (!selected) field('id').value = normalize(field('name').value).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80); });
  $('mapPicker').onclick = e => { const rect = $('mapPicker').getBoundingClientRect(); field('left').value = Math.max(0,Math.min(100,(e.clientX-rect.left)/rect.width*100)).toFixed(2); field('top').value = Math.max(0,Math.min(100,(e.clientY-rect.top)/rect.height*100)).toFixed(2); dirty = true; pin(); };
  form.onsubmit = e => {
    e.preventDefault();
    try {
      const p = Object.fromEntries(new FormData(form));
      if (!selected && store.all().some(x => x.id === p.id)) throw Error('Mã địa danh đã tồn tại. Hãy chọn mã khác.');
      p.coordinates = {latitude:Number(p.latitude),longitude:Number(p.longitude)}; p.position = {left:Number(p.left),top:Number(p.top)}; p.tags = p.tags.split(',').map(t => t.trim()).filter(Boolean);
      const saved = store.save(p); dirty = false; open(saved); status('Đã lưu trên trình duyệt. Bấm “Xem trên bản đồ” để kiểm tra.');
    } catch(e) { status('Không lưu được: ' + e.message); }
  };
  function download(name, text, type) { const url = URL.createObjectURL(new Blob([text],{type})); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000); }
  $('export').onclick = () => { download('dia-danh.json',JSON.stringify(store.exported(),null,2),'application/json'); status('Đã xuất dữ liệu đã lưu.' + (dirty ? ' Các thay đổi trong biểu mẫu chưa được lưu.' : '')); };
  $('publish').onclick = () => { download('managed-data.js','window.VIVU_MANAGED_PLACES = ' + JSON.stringify(store.exported(),null,2) + ';\n','text/javascript'); status('Đã tải file. Đưa file vào dist/ trên GitHub để công bố.' + (dirty ? ' Các thay đổi trong biểu mẫu chưa được lưu.' : '')); };
  $('import').onchange = async e => { const file = e.target.files[0]; if (!file) return; try { if (file.size > 5e6) throw Error('File vượt quá 5 MB.'); const list = store.validateList(JSON.parse(await file.text())); if (!confirm('Nhập ' + list.length + ' địa danh? Các mã trùng sẽ được cập nhật.')) return; store.import(list); renderList(); status('Đã nhập dữ liệu. Chọn địa danh trong danh sách để xem.'); } catch(e) { status('Không nhập được: ' + e.message); } finally { $('import').value = ''; } };
  $('new').onclick = () => open(null); $('search').oninput = renderList;
  addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  addEventListener('storage', e => { if (e.key === store.key) status('Dữ liệu đã thay đổi ở tab khác. Hãy tải lại trang trước khi sửa tiếp.'); });
  open(null); if (store.warning) status(store.warning);
})();
