/**
 * レッスンとステージの中身を、本物の git で確かめる統合テスト。
 * - すべての言語で、初期化手順が最後まで成功する
 * - 何もしていない時点で達成済みになっているチェックが無い
 * - ステージは「答え」のコマンドを打つとクリアできる
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
import { PROJECTS, type ProjectTemplate } from './renderer/data/projects';
import { ALL_STAGES } from './renderer/data/stages';
import { RepoQuery } from './renderer/models/RepoQuery';

const git = new GitRunner('git');
let root = '';
let env: Record<string, string> = {};

beforeAll(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'git-gym-test-'));
  const config = path.join(root, '.gitconfig');
  await fs.writeFile(
    config,
    '[user]\n\tname = Test\n\temail = test@example.com\n[init]\n\tdefaultBranch = main\n[core]\n\tautocrlf = false\n[pull]\n\trebase = false\n',
  );
  env = { GIT_CONFIG_GLOBAL: config };

  // RepoQuery はレンダラーから preload 経由で git を呼ぶので、テストでは直接 git につなぐ
  const dirs = new Map<string, string>();
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
  (globalThis as unknown as { __dirs: Map<string, string> }).__dirs = dirs;
});

afterAll(async () => {
  await fs.rm(root, { recursive: true, force: true }).catch(() => undefined);
});

/** 練習用フォルダを作って初期化し、判定用の問い合わせを返す */
async function prepare(id: string, lesson: Lesson, project: ProjectTemplate) {
  const dir = path.join(root, 'repos', id);
  await fs.mkdir(dir, { recursive: true });
  await runSetup(lessonSetup(lesson, project), {
    dir,
    remoteDir: path.join(root, 'remotes', `${id}.git`),
    scratchDir: path.join(root, 'scratch', id),
    git,
    env,
  });
  (globalThis as unknown as { __dirs: Map<string, string> }).__dirs.set(id, dir);
  const ref: WorkspaceRef = { kind: 'lessons', id };
  const query = async () => new RepoQuery(ref, await readRepo(git, dir, env));
  return { dir, query };
}

function context(project: ProjectTemplate, commands: string[]): CheckContext {
  return {
    project,
    commands,
    ran: (p) => commands.some((c) => p.test(c)),
    tried: (p) => commands.some((c) => p.test(c)),
  };
}

const languages = Object.keys(PROJECTS) as (keyof typeof PROJECTS)[];

describe.each(languages)('%s', (language) => {
  const project = PROJECTS[language];

  it.concurrent.each(CHAPTERS.flatMap((c) => c.lessons).map((l) => [l.id, l] as const))(
    'レッスン %s：初期化でき、最初は未達成',
    async (id, lesson) => {
      const { query } = await prepare(`lesson-${id}-${language}`, lesson, project);
      const q = await query();
      const ctx = context(project, []);
      for (const check of lesson.checks) {
        expect(await check.test(q, ctx), `${id}: ${check.label}`).toBe(false);
      }
    },
  );

  it.concurrent.each(ALL_STAGES.map((s) => [s.id, s] as const))('ステージ %s：答えでクリアできる', async (id, stage) => {
    const { dir, query } = await prepare(`stage-${id}-${language}`, stage, project);
    const ctx0 = context(project, []);
    expect(await stage.checks[0].test(await query(), ctx0), `${id} は最初から達成済み`).toBe(false);

    // 2つ目のヒントにある `git ...` が答え
    const answer = fillPlaceholders(stage.hints[1], { featureFile: project.featureFile, mainFile: project.mainFile, hpFile: project.hpFile }).match(/`([^`]+)`/)![1];
    const parsed = tokenize(answer);
    if (!parsed.ok) throw new Error(parsed.error);
    const [, ...args] = parsed.args;
    const r = await git.run(args, dir, { env });
    expect(r.exitCode, `${id}: ${answer}\n${r.stderr}`).toBe(0);

    expect(await stage.checks[0].test(await query(), context(project, [answer])), `${id}: ${answer} でクリアできない`).toBe(true);
  });
});
