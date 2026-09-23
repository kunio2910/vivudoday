(() => {
  'use strict';
  const key = 'vivu-landmark-edits-v1';
  const categories = window.VIETNAM_CATEGORIES.filter(c => c.key !== 'all');
  const validate = p => {
    if (!p || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(p.id)) throw Error('Mã địa danh không hợp lệ.');
    for (const field of ['name', 'province', 'region', 'short', 'description', 'season', 'image', 'imageAlt']) {
      if (typeof p[field] !== 'string' || !p[field].trim() || p[field].length > 10000) throw Error('Thiếu hoặc sai trường: ' + field);
    }
    if (!window.VIETNAM_REGIONS.slice(1).includes(p.region)) throw Error('Khu vực không hợp lệ.');
    const category = categories.find(c => c.key === p.categoryKey);
    if (!category) throw Error('Loại địa danh không hợp lệ.');
    for (const [value, min, max] of [[p.coordinates?.latitude, -90, 90], [p.coordinates?.longitude, -180, 180], [p.position?.left, 0, 100], [p.position?.top, 0, 100]]) {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw Error('Tọa độ hoặc vị trí bản đồ không hợp lệ.');
    }
    for (const value of [p.image, p.credit || '']) if (value && !/^https?:\/\//i.test(value)) throw Error('Ảnh và nguồn ảnh cần URL http hoặc https.');
    if (!Array.isArray(p.tags) || p.tags.some(t => typeof t !== 'string' || t.length > 100)) throw Error('Thẻ không hợp lệ.');
    return { id:p.id, name:p.name.trim(), province:p.province.trim(), region:p.region, category:category.label, categoryKey:category.key, coordinates:{...p.coordinates}, position:{...p.position}, short:p.short, description:p.description, season:p.season, image:p.image, imageAlt:p.imageAlt, credit:p.credit || '', tags:p.tags, managed:true };
  };
  const validateList = list => {
    if (!Array.isArray(list) || list.length > 2000) throw Error('Dữ liệu phải là danh sách tối đa 2000 địa danh.');
    const clean = list.map(validate);
    if (new Set(clean.map(p => p.id)).size !== clean.length) throw Error('Trùng mã địa danh.');
    return clean;
  };
  let edits = [], warning = '';
  let published = [];
  try { published = validateList(window.VIVU_MANAGED_PLACES || []); } catch(e) { warning = 'Dữ liệu công khai lỗi: ' + e.message; }
  try { edits = validateList(JSON.parse(localStorage.getItem(key) || '[]')); } catch(e) { warning = 'Không đọc được bản lưu trên trình duyệt: ' + e.message; }
  const base = window.VIETNAM_PLACES;
  const all = () => [...new Map([...base, ...published, ...edits].map(p => [p.id,p])).values()];
  window.PlaceStore = { key, warning, all, validateList, save(p) {
    const clean = validate(p);
    const next = [...edits.filter(x => x.id !== clean.id), clean];
    localStorage.setItem(key, JSON.stringify(next));
    edits = next;
    return clean;
  }, import(list) {
    const next = [...new Map([...edits, ...validateList(list)].map(p => [p.id,p])).values()];
    localStorage.setItem(key, JSON.stringify(next)); edits = next;
  }, exported() { return [...new Map([...published, ...edits].map(p => [p.id,p])).values()]; } };
  window.VIETNAM_PLACES = all();
})();
