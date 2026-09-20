/** Inline report styles, so the artifact needs no local asset directory. */
export const reportStyle = `
:root{color-scheme:light dark;--bg:#faf7f2;--surface:#fffdf9;--border:#dcd6cc;
--text:#262c32;--muted:#687078;--accent:#1e3a5f;--accent-dim:#eaf0f6;
--pass:#27644b;--pass-bg:#e7f1e9;--fail:#a43c30;--fail-bg:#faeae5;--warning:#916515;
--font-body:'DM Sans',system-ui,sans-serif;--font-mono:'Fira Code',monospace}
@media(prefers-color-scheme:dark){:root{--bg:#171c22;--surface:#20272f;--border:#39434e;
--text:#e5e9ec;--muted:#aab4be;--accent:#a9c4e1;--accent-dim:#293b4e;
--pass:#a7d6b9;--pass-bg:#243e32;--fail:#ffc0af;--fail-bg:#492e2c;--warning:#e5c585}}
*{box-sizing:border-box}body{margin:0;padding:38px 5vw 48px;background:var(--bg);
color:var(--text);font:15px/1.6 var(--font-body);overflow-wrap:anywhere}
main,header,footer{max-width:1440px;margin:auto}h1{font-size:clamp(27px,3.2vw,44px);
letter-spacing:-1.4px;line-height:1.14;max-width:1000px;margin:12px 0 18px}
h2{font-size:19px;letter-spacing:-.4px;margin:0}h3{font-size:16px;margin:8px 0;line-height:1.45}
p{margin:8px 0}a{color:var(--accent)}code,.eyebrow,.count,.badge{font-family:var(--font-mono)}
.eyebrow{color:var(--accent);font-size:11px;text-transform:uppercase;letter-spacing:2px}
.subtle,small{color:var(--muted)}.summary{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin:20px 0 30px}
.badge{font-size:12px;padding:6px 11px;border-radius:5px;border:1px solid var(--border)}
.pass{color:var(--pass);background:var(--pass-bg)}.fail{color:var(--fail);background:var(--fail-bg)}
.indeterminate{color:var(--warning)}.count{font-size:12px;color:var(--muted)}
.layout{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:24px;align-items:start}
.layout>*{min-width:0}.panel{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:22px}
.panel-header{display:flex;gap:14px;align-items:baseline;justify-content:space-between;margin-bottom:12px}
.diagram-shell__hint{font-size:12px;color:var(--muted);margin:0 0 12px}
.mermaid-wrap{height:540px;min-height:360px;display:flex;justify-content:center;position:relative;
overflow:hidden;border:1px solid var(--border);border-radius:6px;background:var(--surface)}
.mermaid-viewport{width:100%;height:100%;overflow:hidden;position:relative;cursor:grab;touch-action:none}
.mermaid-viewport.dragging{cursor:grabbing}.mermaid-canvas{position:absolute;transform-origin:0 0}
.mermaid-canvas svg{display:block;max-width:none!important}.mermaid .nodeLabel{color:var(--text)!important}
.mermaid .edgeLabel{color:var(--text)!important;background:var(--surface)!important;font-family:var(--font-mono)}
.zoom-controls{position:absolute;z-index:2;right:8px;top:8px;display:flex;gap:3px;
align-items:center;background:var(--surface);border:1px solid var(--border);border-radius:5px;padding:4px}
button{font:13px var(--font-body);padding:5px 8px;cursor:pointer;background:var(--surface);color:var(--text);
border:1px solid var(--border);border-radius:4px}button:hover{background:var(--accent-dim)}
button:focus-visible,a:focus-visible,input:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.zoom-label{min-width:40px;text-align:center;font:10px var(--font-mono);color:var(--muted)}
.render-status{font-size:12px;color:var(--muted);margin-top:10px}
input{width:100%;padding:10px 12px;background:var(--surface);color:var(--text);border:1px solid var(--border);
border-radius:5px;font:14px var(--font-body);margin:12px 0}
.entity-list{max-height:680px;overflow:auto}.entity{border-top:1px solid var(--border);padding:14px 0;scroll-margin:20px}
.entity:first-child{border-top:0}.entity:target{background:var(--accent-dim)}.entity code{font-size:12px}
.entity p{font-size:13px}.entity-meta{font-size:12px;color:var(--muted)}
details{font-size:13px;margin-top:10px}summary{cursor:pointer;color:var(--accent)}
details p{white-space:pre-wrap}.outgoing{padding-left:18px;font-size:12px}.outgoing li{margin:5px 0}
.validation{margin-top:24px;border-left:4px solid var(--pass)}.validation.fail{border-left-color:var(--fail)}
.validation.indeterminate{border-left-color:var(--warning)}.findings{padding-left:20px}.findings li{padding:7px 0}
.findings code{font-size:12px}.rule-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:8px;padding:0;list-style:none}
.rule-list li{padding:7px 10px;border:1px solid var(--border);border-radius:4px;font-size:12px}
footer{margin-top:24px;color:var(--muted);font-size:12px}footer code{font-size:11px}
@media(max-width:900px){body{padding:24px 18px}.layout{grid-template-columns:1fr}.entity-list{max-height:none}.mermaid-wrap{height:430px}}
@media print{body{padding:15px}.layout{display:block}.zoom-controls,input,.diagram-shell__hint{display:none}.entity-list{max-height:none;overflow:visible}}
`;
