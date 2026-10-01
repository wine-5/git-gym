import type { SetupStep } from '@shared/setup';
import type { ProjectTemplate } from './projects';

/** レッスンの初期状態を組み立てる手順を短く書くための部品 */

export function writeProject(project: ProjectTemplate): SetupStep[] {
  return project.files.map((f) => ({ kind: 'write', path: f.path, content: f.content }));
}

export function git(...args: string[]): SetupStep {
  return { kind: 'git', args };
}

export function write(path: string, content: string): SetupStep {
  return { kind: 'write', path, content };
}

/** 変更をすべてコミットする */
export function commitAll(message: string): SetupStep[] {
  return [git('add', '-A'), git('commit', '-m', message)];
}

/** ファイルの末尾に1行足してコミットする（履歴を作るため） */
export function appendAndCommit(project: ProjectTemplate, path: string, line: string, message: string): SetupStep[] {
  const base = project.files.find((f) => f.path === path)?.content ?? '';
  return [write(path, `${base}${line}\n`), ...commitAll(message)];
}

/** init して雛形を最初のコミットにした状態 */
export function initialRepo(project: ProjectTemplate): SetupStep[] {
  return [...writeProject(project), git('init', '-b', 'main'), ...commitAll('最初のコミット')];
}

/** 言語ごとの1行コメント */
export function comment(project: ProjectTemplate, text: string): string {
  return project.mainFile.endsWith('.py') ? `# ${text}` : `// ${text}`;
}
