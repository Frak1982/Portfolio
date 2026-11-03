import { observeAnimationState } from './animation-state.js';
const section = document.getElementById('competenze');
const skills = [...document.querySelectorAll('#competenze .skill')];
if (section && skills.length) {
  let timer,
    clearTimer,
    previous = -1;
  function pulse() {
    let index = Math.floor(Math.random() * skills.length);
    if (skills.length > 1 && index === previous) index = (index + 1) % skills.length;
    previous = index;
    const skill = skills[index];
    skill.classList.add('skill-pulse');
    clearTimer = setTimeout(() => skill.classList.remove('skill-pulse'), 720);
    timer = setTimeout(pulse, 800 + Math.random() * 1000);
  }
  observeAnimationState(section, (active) => {
    clearTimeout(timer);
    clearTimeout(clearTimer);
    skills.forEach((skill) => skill.classList.remove('skill-pulse'));
    if (active) timer = setTimeout(pulse, 800);
  });
}
