// 画面確認用: 起動中の Electron を CDP で操作してスクリーンショットを撮る
// 1. npx electron-forge start -- --remote-debugging-port=9334
// 2. node scripts/ui-check.mjs 9334 <出力フォルダ> <steps.json>
// steps: {eval, print} / {term: "git status"} / {editor: "テキスト"} / {type} / {key} / {wait} / {shot: "名前"}
import { writeFileSync, readFileSync } from 'node:fs';
const [port, out, stepsFile] = process.argv.slice(2);
const steps = JSON.parse(readFileSync(stepsFile, 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  // confirm / alert は自動で OK にする
  if (m.method === 'Page.javascriptDialogOpening') ws.send(JSON.stringify({ id: ++id, method: 'Page.handleJavaScriptDialog', params: { accept: true } }));
  pending.get(m.id)?.(m);
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable');
const FOCUS_TERM="document.querySelector('input[placeholder*=git]').focus()";
const FOCUS_EDITOR="document.querySelector('.monaco-editor textarea').focus()";
for (const s of steps) {
  if (s.term) { await send('Runtime.evaluate',{expression:FOCUS_TERM}); for (const ch of s.term) await send('Input.insertText',{text:ch}); await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13}); await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter'}); await sleep(s.wait ?? 1300); }
  if (s.editor) { const r = await send('Runtime.evaluate',{expression:"(()=>{const b=document.querySelector('.monaco-editor .view-lines').getBoundingClientRect();return [b.left+60,b.top+8]})()",returnByValue:true}); const [x,y]=r.result.result.value; for (const type of ['mousePressed','mouseReleased']) await send('Input.dispatchMouseEvent',{type,x,y,button:'left',clickCount:1}); await sleep(200); await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Home',code:'Home',windowsVirtualKeyCode:36}); await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Home',code:'Home'}); await send('Input.insertText',{text:s.editor}); }
  if (s.eval) { const r = await send('Runtime.evaluate', { expression: s.eval, awaitPromise: true, returnByValue: true }); if (s.print) console.log(JSON.stringify(r.result?.result?.value ?? r.result)); }
  if (s.type) { for (const ch of s.type) await send('Input.insertText', { text: ch }); }
  if (s.key) { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: s.key, code: s.key, windowsVirtualKeyCode: s.key === 'Enter' ? 13 : 0 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: s.key, code: s.key }); }
  if (s.wait) await sleep(s.wait);
  if (s.shot) { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(`${out}/${s.shot}.png`, Buffer.from(r.result.data, 'base64')); }
}
ws.close(); process.exit(0);
