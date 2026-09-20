/** Browser-only interactions embedded in the exported artifact. */
export const reportClient = String.raw`
const search = document.querySelector('#entity-search');
search.addEventListener('input', () => {
  const term = search.value.toLocaleLowerCase();
  for (const entity of document.querySelectorAll('.entity')) {
    entity.hidden = !entity.textContent.toLocaleLowerCase().includes(term);
  }
});
for (const link of document.querySelectorAll('.outgoing a')) {
  link.addEventListener('click', () => { search.value = ''; search.dispatchEvent(new Event('input')); });
}

function attachDiagram(svg) {
  const viewport = document.querySelector('.mermaid-viewport');
  const canvas = document.querySelector('.mermaid-canvas');
  const label = document.querySelector('.zoom-label');
  const width = svg.viewBox.baseVal.width, height = svg.viewBox.baseVal.height;
  svg.style.width = width + 'px'; svg.style.height = height + 'px';
  let scale = 1, x = 0, y = 0, drag = null;
  const clamp = value => Math.max(.08, Math.min(6, value));
  function apply() {
    canvas.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
    label.textContent = Math.round(scale * 100) + '%';
  }
  function center(value) {
    scale = clamp(value);
    x = (viewport.clientWidth - width * scale) / 2;
    y = (viewport.clientHeight - height * scale) / 2;
    apply();
  }
  function fit() { center(Math.min(1.2, (viewport.clientWidth - 40) / width, (viewport.clientHeight - 70) / height)); }
  function zoom(factor, cx = viewport.clientWidth / 2, cy = viewport.clientHeight / 2) {
    const next = clamp(scale * factor), ratio = next / scale;
    x = cx - (cx - x) * ratio; y = cy - (cy - y) * ratio; scale = next; apply();
  }
  function imageUrl() {
    const clone = svg.cloneNode(true);
    clone.style.maxWidth = 'none';
    clone.style.background = getComputedStyle(document.body).getPropertyValue('--surface');
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], {type:'image/svg+xml'}));
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return url;
  }
  const actions = {
    'zoom-in': () => zoom(1.2), 'zoom-out': () => zoom(1 / 1.2),
    'zoom-fit': fit, 'zoom-one': () => center(1),
    'zoom-expand': () => window.open(imageUrl(), '_blank', 'noopener'),
    'download': () => {
      const link = document.createElement('a'); link.href = imageUrl();
      link.download = 'trace-graph.svg'; link.click();
    },
  };
  for (const button of document.querySelectorAll('[data-action]')) {
    button.disabled = false;
    button.addEventListener('click', () => actions[button.dataset.action]());
  }
  viewport.addEventListener('wheel', event => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const rect = viewport.getBoundingClientRect();
    zoom(event.deltaY < 0 ? 1.15 : 1 / 1.15, event.clientX - rect.left, event.clientY - rect.top);
  }, {passive:false});
  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0 || drag) return;
    drag = {id:event.pointerId, startX:event.clientX, startY:event.clientY, x, y, moved:false, onSvg:!!event.target.closest('svg')};
    viewport.setPointerCapture(event.pointerId); viewport.classList.add('dragging');
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
    drag.moved ||= Math.abs(dx) + Math.abs(dy) > 4;
    x = drag.x + dx; y = drag.y + dy; apply();
  });
  viewport.addEventListener('pointerup', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const expand = !drag.moved && drag.onSvg;
    drag = null; viewport.classList.remove('dragging');
    if (expand) actions['zoom-expand']();
  });
  viewport.addEventListener('pointercancel', () => { drag = null; viewport.classList.remove('dragging'); });
  new ResizeObserver(fit).observe(viewport);
  fit();
}

async function render() {
  const status = document.querySelector('.render-status');
  const code = JSON.parse(document.querySelector('#trace-diagram').textContent);
  if (!code) { status.textContent = 'No identities were recognized in this document.'; return; }
  try {
    const {default: mermaid} = await import('https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.esm.min.mjs');
    const dark = matchMedia('(prefers-color-scheme: dark)').matches;
    mermaid.initialize({startOnLoad:false, securityLevel:'strict', theme:'base',
      flowchart:{htmlLabels:false, curve:'basis'},
      themeVariables:{fontFamily:'DM Sans, sans-serif', fontSize:'16px',
        primaryColor:dark?'#293b4e':'#eaf0f6', primaryBorderColor:dark?'#a9c4e1':'#1e3a5f',
        primaryTextColor:dark?'#e5e9ec':'#262c32', lineColor:dark?'#aab4be':'#687078',
        edgeLabelBackground:dark?'#20272f':'#fffdf9'}});
    const {svg} = await mermaid.render('trace-graph', code);
    document.querySelector('.mermaid-canvas').innerHTML = svg;
    attachDiagram(document.querySelector('.mermaid-canvas svg'));
    status.textContent = 'Every observed relationship is shown. Full labels and source context are in the entity key.';
    document.body.dataset.render = 'complete';
  } catch (error) {
    status.textContent = 'Diagram unavailable: ' + error.message + '. Entity details and validation findings remain available below.';
    document.body.dataset.render = 'failed';
  }
}
render();
`;
