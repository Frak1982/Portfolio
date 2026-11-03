import { observeAnimationState } from './animation-state.js';
import { observeSceneLayout } from './scene-layout.js';
const scene = document.querySelector('.visual');
if (scene) {
  const configs = [
    {
      x: 685,
      y: 251,
      w: 88,
      h: 175,
      font: 7.7,
      title: 'app.component.ts',
      lines: [
        'import { signal }',
        ' from "@angular/core";',
        '',
        'export class App {',
        ' name = signal("FR");',
        ' projects = signal([]);',
        '',
        ' load() {',
        '  this.api.getAll()',
        '   .subscribe(data =>',
        '    this.projects.set(data)',
        '   );',
        ' }',
        '}',
      ],
    },
    {
      x: 990,
      y: 177,
      w: 129,
      h: 148,
      font: 7.5,
      title: 'portfolio.service.ts',
      lines: [
        'import { inject }',
        ' from "@angular/core";',
        '',
        'export class Service {',
        ' http = inject(Http);',
        '',
        ' getProjects() {',
        '  return this.http.get(',
        '   "/api/projects"',
        '  );',
        ' }',
        '}',
      ],
    },
    {
      x: 805,
      y: 47,
      w: 228,
      h: 280,
      font: 10.2,
      title: 'francesco.skills.ts',
      skills: true,
      lines: [
        'export const francesco = {',
        '  role: "Front-End Dev",',
        '  location: "Padova",',
        '  developingSince: 2022,',
        '  stack: [',
        '    "Angular",',
        '    "TypeScript",',
        '    "RxJS",',
        '    "Signals",',
        '    "Responsive Design",',
        '    "AI Tools"',
        '  ],',
        '  passion: "Build & Learn"',
        '};',
      ],
    },
  ];

  const panels = configs.map((config) => {
    const element = document.createElement('div');
    element.className = 'monitor-typing' + (config.skills ? ' skills-editor' : '');
    element.setAttribute('aria-hidden', 'true');
    const top = document.createElement('div');
    top.className = 'editor-top';
    top.textContent = '●  ' + config.title;
    const body = document.createElement('div');
    body.className = 'editor-body';
    element.append(top, body);
    scene.append(element);
    return { element, body, config, text: config.lines.join('\n'), last: -1 };
  });
  observeSceneLayout(
    scene,
    panels.map(({ element, config }) => ({
      element,
      x: config.x,
      y: config.y,
      width: config.w,
      height: config.h,
      font: config.font,
    })),
  );

  function render(panel, count, caret) {
    if (panel.last === count + ':' + caret) return;
    panel.last = count + ':' + caret;
    const fragment = document.createDocumentFragment();
    for (const text of panel.text.slice(0, count).split('\n')) {
      const line = document.createElement('span');
      line.className = 'line';
      // Tokenize plain text; never insert generated HTML.
      const tokens = text.split(
        /(\b(?:import|from|export|class|const|return|signal|inject|subscribe|getAll|getProjects|set|load)\b)/g,
      );
      for (const token of tokens) {
        if (/^(import|from|export|class|const|return|signal|inject)$/.test(token)) {
          const keyword = document.createElement('span');
          keyword.className = 'kw';
          keyword.textContent = token;
          line.append(keyword);
        } else if (/^(subscribe|getAll|getProjects|set|load)$/.test(token)) {
          const fn = document.createElement('span');
          fn.className = 'fn';
          fn.textContent = token;
          line.append(fn);
        } else {
          line.append(document.createTextNode(token));
        }
      }
      fragment.append(line);
    }
    if (caret) {
      const cursor = document.createElement('span');
      cursor.className = 'caret';
      fragment.append(cursor);
    }
    panel.body.replaceChildren(fragment);
  }

  let frame = 0;
  let startedAt = null;
  function tick(now) {
    if (startedAt === null) startedAt = now;
    panels.forEach((panel, index) => {
      const typingDuration = panel.text.length * 46;
      const holdDuration = 2000;
      const cycle = typingDuration + holdDuration + 1500;
      const elapsed = (now - startedAt + index * 3400) % cycle;
      const count =
        elapsed < typingDuration
          ? Math.floor(elapsed / 46)
          : elapsed < typingDuration + holdDuration
            ? panel.text.length
            : 0;
      render(panel, count, elapsed < typingDuration);
    });
    frame = requestAnimationFrame(tick);
  }
  observeAnimationState(scene, (active) => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (active) {
      startedAt = null;
      frame = requestAnimationFrame(tick);
    } else {
      panels.forEach((panel) => render(panel, panel.text.length, false));
    }
  });
}
