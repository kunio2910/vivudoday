const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync('dist/map-catalog.js','utf8'),context);
const catalog=context.window.MapCatalog;
const provinces=JSON.parse(fs.readFileSync('dist/provinces-source.json','utf8')).provinces;
function inside(point,ring){let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){
  const [x,y]=ring[i],[u,v]=ring[j];
  if((y>point[1])!==(v>point[1])&&point[0]<(u-x)*(point[1]-y)/(v-y)+x)hit=!hit;
}return hit;}
for(const p of provinces){
  const anchor=catalog.anchors[p.name];assert(anchor,`Missing anchor: ${p.name}`);
  assert(anchor.every(n=>n>0&&n<100));
  assert(catalog.suggestions[p.name]?.length>=2,`Missing discovery data: ${p.name}`);
  const center=catalog.representative(p.polygons);
  assert(p.polygons.some(r=>inside(center,r)),`Representative outside polygon: ${p.name}`);
}
assert.equal(provinces.length,34);
assert.equal(Object.values(catalog.suggestions).flat().length,70);
assert.equal(catalog.cluster([{x:0,y:0},{x:1,y:0},{x:40,y:0}],100,100).length,2);
assert.equal(catalog.cluster([{x:0,y:0},{x:1,y:0}],4000,100).length,2);
assert.equal(catalog.cluster([{x:0,y:0},{x:10,y:0},{x:20,y:0}],100,100,11).length,1);
console.log('PASS: 34 province anchors, discovery catalogs and interior representative points');
