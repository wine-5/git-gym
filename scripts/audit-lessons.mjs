// 使い方: node scripts/audit-lessons.mjs <出力する steps.json> <レッスンID,カンマ区切り>
// その後 node scripts/ui-check.mjs 9334 <出力フォルダ> <steps.json> で、各レッスンの開始時のチェック状態を表示する
// 全レッスンを開いて、何もしていない時点で達成済みになっているチェックが無いか調べる
import { writeFileSync } from 'node:fs';
const ids = process.argv[3].split(',');
const steps = [{ eval: 'location.reload()', wait: 3000 }];
for (const id of ids) {
  steps.push({ eval: `window.__gitGym.openLesson("${id}")`, wait: 6000 });
  steps.push({ eval: `(async()=>{const r=window.__gitGym.lessonRunner;await r.evaluate();return "${id}: "+r.done.map(d=>d?"✔":"・").join("")})()`, print: true });
}
writeFileSync(process.argv[2], JSON.stringify(steps));
