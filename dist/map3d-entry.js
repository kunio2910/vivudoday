(() => {
 const old=document.getElementById('open3d');if(!old)return;
 const button=old.cloneNode(true);old.replaceWith(button);document.getElementById('map3dView')?.remove();
 const dialog=document.createElement('dialog');dialog.id='atlasDialog';dialog.setAttribute('aria-label','Bản đồ Việt Nam 3D');document.body.append(dialog);
 button.onclick=e=>{e.stopPropagation();dialog.innerHTML='<iframe title="Bản đồ Việt Nam 3D" src="./map3d.html"></iframe>';dialog.showModal();};
 const close=()=>{dialog.close();dialog.innerHTML='';button.focus();};
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 addEventListener('message',e=>{if(e.origin===location.origin&&e.source===dialog.querySelector('iframe')?.contentWindow&&e.data?.type==='vivu-close-3d')close();});
})();
