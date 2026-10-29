
(()=>{
 const scene=document.querySelector('.visual'),glow=scene?.querySelector('.fr-laptop-pulse');if(!glow)return;
 // L'immagine incorporata nella hero è un ritaglio 1122×720 della scena originale.
 // Centro del logo FR nel ritaglio: circa (755,575).
 const W=1122,H=720;
 const spots=[{selector:'.fr-laptop-pulse',px:772,py:575,sw:72,sh:57},{selector:'.fr-heart-pulse',px:390,py:474,sw:86,sh:86},{selector:'.fr-forehead-pulse',px:420,py:176,sw:62,sh:62}];
 function align(){const w=scene.clientWidth,h=scene.clientHeight;if(!w||!h)return;
 const scale=Math.max(w/W,h/H),iw=W*scale,ih=H*scale;
 const mobile=matchMedia('(max-width:950px)').matches;
 const posX=matchMedia('(max-width:580px)').matches?.49:.5;
 const posY=mobile?(matchMedia('(max-width:580px)').matches?.5:.42):.4;
 spots.forEach(({selector,px,py,sw,sh})=>{const el=scene.querySelector(selector);if(!el)return;
 const x=(w-iw)*posX+px*scale,y=(h-ih)*posY+py*scale;
 el.style.left=x+'px';el.style.top=y+'px';el.style.width=(sw*scale)+'px';el.style.height=(sh*scale)+'px';
 el.style.display=(x<0||x>w||y<0||y>h)?'none':'block';});
 }
 new ResizeObserver(align).observe(scene);window.addEventListener('resize',align,{passive:true});align();
})();
