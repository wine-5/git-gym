export type TokenizeResult = { ok: true; args: string[] } | { ok: false; error: string };

/**
 * ターミナルに入力された1行を引数に分ける。
 * シェルは通さないので、対応するのは空白区切りと '...' / "..." のクォート、\ によるエスケープだけ。
 */
export function tokenize(line: string): TokenizeResult {
  const args: string[] = [];
  let current = '';
  let hasToken = false;
  let quote: '"' | "'" | null = null;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (quote) {
      if (ch === quote) {
        quote = null;
      } else if (ch === '\\' && quote === '"' && (line[i + 1] === '"' || line[i + 1] === '\\')) {
        current += line[++i];
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      hasToken = true;
    } else if (/\s/.test(ch)) {
      if (hasToken) args.push(current);
      current = '';
      hasToken = false;
    } else {
      current += ch;
      hasToken = true;
    }
  }

  if (quote) {
    return { ok: false, error: `クォート ${quote} が閉じられていません` };
  }
  if (hasToken) args.push(current);
  return { ok: true, args };
}
