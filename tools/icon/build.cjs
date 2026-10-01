// アプリアイコンを icon.svg から作る（追加のライブラリ不要、Electron で描画する）
//   npx electron tools/icon/build.cjs
// 出力: assets/icon/icon.png（1024）, icon.ico（Windows）, icon.icns（Mac）
const { app, BrowserWindow, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const out = path.join(root, 'assets', 'icon');

function ico(pngs) {
  // ヘッダー + 各サイズのディレクトリ + PNG 本体（256 は幅・高さを 0 で表す）
  const sizes = Object.keys(pngs).map(Number);
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  sizes.forEach((s, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(s >= 256 ? 0 : s, e);
    header.writeUInt8(s >= 256 ? 0 : s, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(pngs[s].length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += pngs[s].length;
  });
  return Buffer.concat([header, ...sizes.map((s) => pngs[s])]);
}

function icns(pngs) {
  // 'icns' + 全体の長さ、続いて種類ごとの PNG（ic07=128, ic08=256, ic09=512, ic10=1024）
  const types = { ic07: 128, ic08: 256, ic09: 512, ic10: 1024 };
  const chunks = Object.entries(types).map(([type, s]) => {
    const head = Buffer.alloc(8);
    head.write(type, 0, 'ascii');
    head.writeUInt32BE(pngs[s].length + 8, 4);
    return Buffer.concat([head, pngs[s]]);
  });
  const head = Buffer.alloc(8);
  head.write('icns', 0, 'ascii');
  head.writeUInt32BE(8 + chunks.reduce((n, c) => n + c.length, 0), 4);
  return Buffer.concat([head, ...chunks]);
}

app.whenReady().then(async () => {
  // 画面の大きさや拡大率に左右されないよう、ページ内の canvas に 1024px で描いて取り出す
  const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true } });
  await win.loadURL('data:text/html,<body></body>');
  const svg = fs.readFileSync(path.join(__dirname, 'icon.svg'), 'utf8');
  const dataUrl = await win.webContents.executeJavaScript(`(async () => {
    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(${JSON.stringify(svg)});
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1024;
    canvas.getContext('2d').drawImage(img, 0, 0, 1024, 1024);
    return canvas.toDataURL('image/png');
  })()`);
  const base = nativeImage.createFromDataURL(dataUrl);

  const pngs = {};
  for (const s of [16, 24, 32, 48, 64, 128, 256, 512, 1024]) {
    pngs[s] = (s === 1024 ? base : base.resize({ width: s, height: s, quality: 'best' })).toPNG();
  }

  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'icon.png'), pngs[1024]);
  const icoPngs = Object.fromEntries([16, 24, 32, 48, 64, 128, 256].map((s) => [s, pngs[s]]));
  fs.writeFileSync(path.join(out, 'icon.ico'), ico(icoPngs));
  fs.writeFileSync(path.join(out, 'icon.icns'), icns(pngs));
  console.log(`アイコンを書き出しました: ${path.relative(root, out)}`);
  app.quit();
});
