/** ターミナルに打っている途中のコマンドの色分け（PowerShell の PSReadLine と同じ考え方） */
export type TokenKind = 'command' | 'parameter' | 'string' | 'plain';

export interface HighlightToken {
  text: string;
  kind: TokenKind;
}

/**
 * 入力をそのまま（空白も含めて）区切り、種類を付ける。
 * 先頭の単語＝コマンド、- で始まる単語＝オプション、"…" / '…'＝文字列（閉じていなくても末尾まで）
 */
export function highlightCommand(input: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  let i = 0;
  let seenWord = false;
  while (i < input.length) {
    const ch = input[i];
    if (ch === ' ') {
      let j = i;
      while (j < input.length && input[j] === ' ') j++;
      tokens.push({ text: input.slice(i, j), kind: 'plain' });
      i = j;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const close = input.indexOf(ch, i + 1);
      const end = close === -1 ? input.length : close + 1;
      tokens.push({ text: input.slice(i, end), kind: 'string' });
      i = end;
      seenWord = true;
      continue;
    }
    // 単語は空白か引用符の手前まで
    let j = i;
    while (j < input.length && input[j] !== ' ' && input[j] !== '"' && input[j] !== "'") j++;
    const word = input.slice(i, j);
    const kind: TokenKind = !seenWord ? 'command' : word.startsWith('-') ? 'parameter' : 'plain';
    tokens.push({ text: word, kind });
    seenWord = true;
    i = j;
  }
  return tokens;
}
