/** ターミナル出力の ANSI エスケープ（色付け）を読み取る */

export interface AnsiStyle {
  /** 文字色（CSS の色） */
  fg?: string;
  /** 背景色（CSS の色） */
  bg?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
  inverse?: boolean;
}

export interface AnsiSegment {
  text: string;
  style: AnsiStyle;
}

/**
 * 16 色（黒・赤・緑・黄・青・紫・水色・白 と、その明るい版）。
 * 実際の色は global.css の --ansi-0〜15 で、VS Code のダーク／ライトのテーマと同じにしてある
 */
export const VSCODE_ANSI_COLORS = Array.from({ length: 16 }, (_, i) => `var(--ansi-${i})`);

// eslint-disable-next-line no-control-regex
const ESCAPE = /\x1b\[([0-9;]*)([A-Za-z])|\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)|\x1b[()][A-Za-z0-9]/g;

/** 256 色指定（38;5;n）の n を CSS の色にする */
function color256(n: number): string | undefined {
  if (n < 0 || n > 255) return undefined;
  if (n < 16) return VSCODE_ANSI_COLORS[n];
  // 216 色と灰色はテーマに関係なく同じ色にする
  if (n < 232) {
    const i = n - 16;
    const level = (v: number) => (v === 0 ? 0 : 55 + v * 40);
    return `rgb(${level(Math.floor(i / 36))}, ${level(Math.floor(i / 6) % 6)}, ${level(i % 6)})`;
  }
  const gray = 8 + (n - 232) * 10;
  return `rgb(${gray}, ${gray}, ${gray})`;
}

/** SGR（ESC [ ... m）のパラメータを今の書式に反映する */
function applySgr(params: number[], style: AnsiStyle): AnsiStyle {
  const next = { ...style };
  for (let i = 0; i < params.length; i++) {
    const p = params[i];
    if (p === 0) {
      for (const key of Object.keys(next)) delete next[key as keyof AnsiStyle];
    } else if (p === 1) next.bold = true;
    else if (p === 2) next.dim = true;
    else if (p === 3) next.italic = true;
    else if (p === 4) next.underline = true;
    else if (p === 7) next.inverse = true;
    else if (p === 22) next.bold = next.dim = false;
    else if (p === 23) next.italic = false;
    else if (p === 24) next.underline = false;
    else if (p === 27) next.inverse = false;
    else if (p >= 30 && p <= 37) next.fg = VSCODE_ANSI_COLORS[p - 30];
    else if (p === 39) delete next.fg;
    else if (p >= 40 && p <= 47) next.bg = VSCODE_ANSI_COLORS[p - 40];
    else if (p === 49) delete next.bg;
    else if (p >= 90 && p <= 97) next.fg = VSCODE_ANSI_COLORS[p - 90 + 8];
    else if (p >= 100 && p <= 107) next.bg = VSCODE_ANSI_COLORS[p - 100 + 8];
    else if (p === 38 || p === 48) {
      let value: string | undefined;
      if (params[i + 1] === 5) {
        value = color256(params[i + 2]);
        i += 2;
      } else if (params[i + 1] === 2) {
        const [r, g, b] = params.slice(i + 2, i + 5);
        value = `rgb(${r ?? 0}, ${g ?? 0}, ${b ?? 0})`;
        i += 4;
      }
      if (value) next[p === 38 ? 'fg' : 'bg'] = value;
    }
  }
  return next;
}

/** 色付きの文字列を、同じ書式が続く区間ごとに分ける */
export function parseAnsi(input: string): AnsiSegment[] {
  const segments: AnsiSegment[] = [];
  let style: AnsiStyle = {};
  let last = 0;
  const push = (text: string) => {
    if (!text) return;
    const prev = segments[segments.length - 1];
    if (prev && prev.style === style) prev.text += text;
    else segments.push({ text, style });
  };

  for (const match of input.matchAll(ESCAPE)) {
    push(input.slice(last, match.index));
    last = (match.index ?? 0) + match[0].length;
    // 色以外の制御（行末消去 ESC[K など）は表示には関係ないので読み飛ばす
    if (match[2] === 'm') {
      const params = match[1] === '' ? [0] : match[1].split(';').map((s) => (s === '' ? 0 : Number(s)));
      style = applySgr(params, style);
    }
  }
  push(input.slice(last));
  return segments;
}

/** 色付けを取り除いた文字だけにする（ヒントの判定などに使う） */
export function stripAnsi(input: string): string {
  return input.replace(ESCAPE, '');
}
