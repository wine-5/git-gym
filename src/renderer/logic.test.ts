import { describe, expect, it } from 'vitest';
import { assignColumns } from '@components/lesson/graphLayout';
import { findConflicts } from '@components/editor/conflictRegions';
import { hintFor } from '@data/commandHints';
import { progressCsv } from '@data/exportProgress';
import { starsFor } from '@data/stages';
import { fillPlaceholders } from '@data/lessons';
import { complete } from '@data/completion';
import { parseAnsi, stripAnsi, VSCODE_ANSI_COLORS } from '@data/ansi';
import type { CommandResult } from '@shared/terminal';

const result = (stdout: string, stderr = '', exitCode = 0): CommandResult => ({ stdout, stderr, exitCode, cwd: '~' });

describe('assignColumns', () => {
  it('分岐したブランチは右の列、合流後は左に戻る', () => {
    const laid = assignColumns([
      { hash: 'm', message: 'merge', parents: ['a', 'b'], refs: [] },
      { hash: 'a', message: 'main', parents: ['base'], refs: [] },
      { hash: 'b', message: 'feature', parents: ['base'], refs: [] },
      { hash: 'base', message: 'base', parents: [], refs: [] },
    ]);
    expect(laid.map((c) => [c.hash, c.col, c.isMerge])).toEqual([
      ['m', 0, true],
      ['a', 0, false],
      ['b', 1, false],
      ['base', 0, false],
    ]);
  });
});

describe('findConflicts', () => {
  it('<<<<<<< / ======= / >>>>>>> の行番号を返す', () => {
    const text = ['a', '<<<<<<< HEAD', 'x', '=======', 'y', '>>>>>>> feature', 'b'].join('\n');
    expect(findConflicts(text)).toEqual([{ start: 2, separator: 4, end: 6 }]);
  });

  it('途中で終わっているものは数えない', () => {
    expect(findConflicts('<<<<<<< HEAD\nx\n')).toEqual([]);
  });
});

describe('hintFor', () => {
  it('打ち間違いに「もしかして」を出す', () => {
    const hint = hintFor('git comit -m x', result('', "git: 'comit' is not a git command.\n\nThe most similar command is\n\tcommit\n", 1));
    expect(hint).toContain('git commit');
  });

  it('git を付け忘れたら教える', () => {
    expect(hintFor('status', result('', 'status: 使えないコマンド', 127))).toContain('git status');
  });

  it('commit の -m 忘れ', () => {
    expect(hintFor('git commit', result('', 'Aborting commit due to empty commit message.', 1))).toContain('-m');
  });

  it('git status の説明文にはコミット用のヒントを出さない', () => {
    expect(hintFor('git status', result('nothing to commit, working tree clean'))).toBeNull();
  });

  it('push が断られたら pull を勧める', () => {
    expect(hintFor('git push', result('', ' ! [rejected]        main -> main (fetch first)', 1))).toContain('git pull');
  });
});

describe('starsFor', () => {
  it.each([
    [0, false, 3],
    [1, false, 2],
    [2, false, 2],
    [3, false, 1],
    [0, true, 2],
    [5, true, 1],
  ])('失敗 %i 回・答えを見た %s → ★%i', (failed, saw, stars) => {
    expect(starsFor(failed, saw)).toBe(stars);
  });
});

describe('fillPlaceholders', () => {
  it('知らない名前はそのまま残す', () => {
    expect(fillPlaceholders('`{featureFile}` と {unknown}', { featureFile: 'Player.cs' })).toBe('`Player.cs` と {unknown}');
  });
});

describe('progressCsv', () => {
  it('BOM 付きで、クリアしたレッスンに ○ を付ける', () => {
    const csv = progressCsv({ completed: new Set(['1-1']), learned: new Set(['init']), language: 'C#' }, new Date(2026, 9, 1));
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('1-1,リポジトリを作ろう,○');
    expect(csv).toContain('git init,○');
    expect(csv).toContain('1-2,状態を確認しよう,\r\n');
  });
});

describe('complete', () => {
  const source = {
    subcommands: ['commit', 'checkout', 'cherry-pick', 'status', 'switch'],
    branches: ['main', 'feature/jump'],
    files: ['Player.cs', 'Program.cs', 'README.md'],
  };

  it('1つに決まればスペースまで付ける', () => {
    expect(complete('git sta', source)).toEqual({ value: 'git status ', candidates: [] });
    expect(complete('gi', source)).toEqual({ value: 'git ', candidates: [] });
  });

  it('複数あれば共通部分まで伸ばして候補を返す', () => {
    expect(complete('git ch', source)).toEqual({ value: 'git che', candidates: ['checkout', 'cherry-pick'] });
    expect(complete('git c', source).candidates).toEqual(['checkout', 'cherry-pick', 'commit']);
  });

  it('ブランチを取るコマンドではブランチ名も補完する', () => {
    expect(complete('git switch fea', source)).toEqual({ value: 'git switch feature/jump ', candidates: [] });
  });

  it('それ以外はファイル名を補完する', () => {
    expect(complete('git add Pl', source)).toEqual({ value: 'git add Player.cs ', candidates: [] });
    expect(complete('cat P', source)).toEqual({ value: 'cat P', candidates: ['Player.cs', 'Program.cs'] });
  });

  it('候補が無ければそのまま', () => {
    expect(complete('git xyz', source)).toEqual({ value: 'git xyz', candidates: [] });
  });
});

describe('parseAnsi', () => {
  it('git status の赤・緑を区間に分ける', () => {
    const segments = parseAnsi('\x1b[32mmodified:   a.txt\x1b[m\n\x1b[31mb.txt\x1b[m\n');
    expect(segments).toEqual([
      { text: 'modified:   a.txt', style: { fg: VSCODE_ANSI_COLORS[2] } },
      { text: '\n', style: {} },
      { text: 'b.txt', style: { fg: VSCODE_ANSI_COLORS[1] } },
      { text: '\n', style: {} },
    ]);
  });

  it('太字・明るい色・256 色を読む', () => {
    const [bold, bright, indexed] = parseAnsi('\x1b[1;33mA\x1b[0;91mB\x1b[38;5;196mC');
    expect(bold.style).toEqual({ bold: true, fg: VSCODE_ANSI_COLORS[3] });
    expect(bright.style).toEqual({ fg: VSCODE_ANSI_COLORS[9] });
    expect(indexed.style.fg).toBe('rgb(255, 0, 0)');
  });

  it('色以外の制御は読み飛ばす', () => {
    expect(stripAnsi('remote: done\x1b[K\n\x1b[33mabc\x1b[m')).toBe('remote: done\nabc');
  });
});
