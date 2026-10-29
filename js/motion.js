
(()=>{
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const targets=document.querySelectorAll('.project-card,.skill,.about .card,.contact,.section > h2');
if(!reduced.matches && 'IntersectionObserver' in window){
const observer=new IntersectionObserver((entries)=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('motion-in');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px 40px 0px'});
targets.forEach(el=>{el.classList.add('motion-reveal');observer.observe(el)});
}
const hero=document.querySelector('.hero');
if(hero && window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced.matches){
let pending=false,x=50,y=40;
hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();x=(e.clientX-r.left)/r.width*100;y=(e.clientY-r.top)/r.height*100;if(!pending){pending=true;requestAnimationFrame(()=>{hero.style.setProperty('--pointer-x',x+'%');hero.style.setProperty('--pointer-y',y+'%');pending=false})}},{passive:true});
}
})();
