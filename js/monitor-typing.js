
(()=>{
 const scene=document.querySelector('.visual');if(!scene)return;
 const W=1122,H=720;
 // Monitor sinistro: fascia di editor non coperta dalla scheda Angular.
 // Monitor destro: area interna a destra della scheda Angular.
 const configs=[
  {x:685,y:251,w:88,h:175,font:7.7,title:'app.component.ts',lines:[
   'import { signal }',' from "@angular/core";','','export class App {',' name = signal("FR");',' projects = signal([]);','',' load() {','  this.api.getAll()','   .subscribe(data =>','    this.projects.set(data)','   );',' }','}'
  ]},
  {x:990,y:177,w:129,h:148,font:7.5,title:'portfolio.service.ts',lines:[
   'import { inject }',' from "@angular/core";','','export class Service {',' http = inject(Http);','',' getProjects() {','  return this.http.get(','   "/api/projects"','  );',' }','}'
  ]},
  {x:805,y:47,w:228,h:280,font:10.2,title:'francesco.skills.ts',skills:true,lines:[
   'export const francesco = {',
   '  role: "Front-End Dev",',
   '  location: "Padova",',
   '  experience: "4+ years",',
   '  stack: [',
   '    "Angular",',
   '    "TypeScript",',
   '    "RxJS",',
   '    "Signals",',
   '    "Responsive Design",',
   '    "AI Tools"',
   '  ],',
   '  passion: "Build & Learn"',
   '};'
  ]}
 ];
 const panels=configs.map(c=>{let e=document.createElement('div');e.className='monitor-typing';e.setAttribute('aria-hidden','true');e.innerHTML='<div class="editor-top"></div><div class="editor-body"></div>';e.querySelector('.editor-top').textContent='●  '+c.title;if(c.skills)e.classList.add('skills-editor');scene.append(e);return e});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function align(){const w=scene.clientWidth,h=scene.clientHeight;if(!w||!h)return;
  const scale=Math.max(w/W,h/H),iw=W*scale,ih=H*scale;
  const small=matchMedia('(max-width:580px)').matches,mobile=matchMedia('(max-width:950px)').matches;
  const posX=small?.49:.5,posY=mobile?(small?.5:.42):.4;
  panels.forEach((e,i)=>{let c=configs[i],x=(w-iw)*posX+c.x*scale,y=(h-ih)*posY+c.y*scale;
   e.style.left=x+'px';e.style.top=y+'px';e.style.width=c.w*scale+'px';e.style.height=c.h*scale+'px';
   e.style.fontSize=c.font*scale+'px';e.style.borderRadius=2*scale+'px';
   e.querySelector('.editor-top').style.height=13*scale+'px';e.querySelector('.editor-top').style.lineHeight=13*scale+'px';e.querySelector('.editor-top').style.fontSize=7*scale+'px';
   e.querySelector('.editor-body').style.height='calc(100% - '+13*scale+'px)';
   e.style.display=(x+c.w*scale<0||x>w||y+c.h*scale<0||y>h)?'none':'block';
  });
 }
 new ResizeObserver(align).observe(scene);align();
 const escape=t=>t.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const color=t=>escape(t).replace(/\b(import|from|export|class|const|return|signal|inject)\b/g,'<span class="kw">$1</span>').replace(/\b(subscribe|getAll|getProjects|set|load)\b/g,'<span class="fn">$1</span>');
 const total=c=>c.lines.reduce((a,l)=>a+l.length+1,0);
 let last=[-1,-1,-1];
 function tick(now){panels.forEach((e,i)=>{const c=configs[i],max=total(c),cycle=14000,elapsed=(now+i*3400)%cycle;
  const n=reduced.matches?max:elapsed<(c.skills?15500:10500)?Math.min(max,Math.floor(elapsed/(c.skills?46:44))):elapsed<(c.skills?18000:12500)?max:0;
  if(n===last[i])return;last[i]=n;let left=n,parts=[];
  for(let j=0;j<c.lines.length&&left>0;j++){let l=c.lines[j],t=l.slice(0,left);parts.push('<span class="line">'+color(t)+'</span>');left-=l.length+1}
  if(!reduced.matches&&elapsed<(c.skills?18000:12500))parts.push('<span class="caret"></span>');
  e.querySelector('.editor-body').innerHTML=parts.join('');
 });requestAnimationFrame(tick)}requestAnimationFrame(tick);
})();
