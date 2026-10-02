/**
 * 表示言語が日本語以外のとき、練習用リポジトリの中身（コミットメッセージ・README）を訳して作っても
 * レッスンとステージが正しく動くかを、本物の git で確かめる。
 * 言語の設定はモジュールごとに持つので、日本語の統合テストとはファイルを分けている。
 */
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { GitRunner } from './main/git/GitRunner';
import { readRepo } from './main/git/readRepo';
import { runSetup } from './main/workspace/runSetup';
import { tokenize } from './shared/commandLine';
import type { WorkspaceRef } from './shared/api';
import { CHAPTERS, fillPlaceholders, lessonSetup, type CheckContext, type Lesson } from './renderer/data/lessons';
import { PROJECTS } from './renderer/data/projects';
import { ALL_STAGES } from './renderer/data/stages';
import { RepoQuery } from './renderer/models/RepoQuery';
import { setLocale } from './renderer/i18n/locale';
import { localizeSetup } from './renderer/i18n/repoText';

const git = new GitRunner('git');
const project = PROJECTS.python;
const dirs = new Map<string, string>();
let root = '';
let env: Record<string, string> = {};

beforeAll(async () => {
  setLocale('en');
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'git-gym-locale-test-'));
  const config = path.join(root, '.gitconfig');
  await fs.writeFile(
    config,
    '[user]\n\tname = Test\n\temail = test@example.com\n[init]\n\tdefaultBranch = main\n[core]\n\tautocrlf = false\n[pull]\n\trebase = false\n',
  );
  env = { GIT_CONFIG_GLOBAL: config };
  (globalThis as unknown as { window: unknown }).window = {
    gitGym: {
      repo: {
        query: async (ref: WorkspaceRef, args: string[]) => {
          const r = await git.run(['-c', 'core.quotePath=false', ...args], dirs.get(ref.id)!, { env });
          return { stdout: r.stdout, exitCode: r.exitCode };
        },
      },
    },
  };
});

afterAll(async () => {
  await fs.rm(root, { recursive: true, force: true }).catch(() => undefined);
});

async function prepare(id: string, lesson: Lesson) {
  const dir = path.join(root, 'repos', id);
  await fs.mkdir(dir, { recursive: true });
  await runSetup(localizeSetup(lessonSetup(lesson, project)), {
    dir,
    remoteDir: path.join(root, 'remotes', `${id}.git`),
    scratchDir: path.join(root, 'scratch', id),
    git,
    env,
  });
  dirs.set(id, dir);
  const ref: WorkspaceRef = { kind: 'lessons', id };
  return { dir, query: async () => new RepoQuery(ref, await readRepo(git, dir, env)) };
}

function context(commands: string[]): CheckContext {
  return { project, commands, ran: (p) => commands.some((c) => p.test(c)), tried: (p) => commands.some((c) => p.test(c)) };
}

describe('英語で作った練習用リポジトリ', () => {
  it('最初のコミットのメッセージが英語になる', async () => {
    const lesson = CHAPTERS[0].lessons[4];
    const { query } = await prepare('log-en', lesson);
    const q = await query();
    expect(q.snapshot.commits.map((c) => c.message)).toContain('First commit');
  });

  it.concurrent.each(CHAPTERS.flatMap((c) => c.lessons).map((l) => [l.id, l] as const))(
    'レッスン %s：初期化でき、最初は未達成',
    async (id, lesson) => {
      const { query } = await prepare(`lesson-${id}`, lesson);
      const q = await query();
      for (const check of lesson.checks) expect(await check.test(q, context([])), `${id}: ${check.label}`).toBe(false);
    },
  );

  it.concurrent.each(ALL_STAGES.map((s) => [s.id, s] as const))('ステージ %s：答えでクリアできる', async (id, stage) => {
    const { dir, query } = await prepare(`stage-${id}`, stage);
    const answer = fillPlaceholders(stage.hints[1], { featureFile: project.featureFile, mainFile: project.mainFile, hpFile: project.hpFile }).match(
      /`([^`]+)`/,
    )![1];
    const parsed = tokenize(answer);
    if (!parsed.ok) throw new Error(String(parsed.error));
    const r = await git.run(parsed.args.slice(1), dir, { env });
    expect(r.exitCode, `${id}: ${answer}\n${r.stderr}`).toBe(0);
    expect(await stage.checks[0].test(await query(), context([answer])), `${id}: ${answer} でクリアできない`).toBe(true);
  });
});
