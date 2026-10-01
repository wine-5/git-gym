import { app, shell } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import type { PracticeKind } from '../../shared/api';

const ROOT_README = `Git Gym の練習用フォルダです。

lessons/  レッスンで使うリポジトリ
stages/   練習モードで使うリポジトリ
sandbox/  フリー練習のリポジトリ
remotes/  練習用のリモートリポジトリ（GitHub の代わり）

どのフォルダも本物の Git リポジトリなので、エクスプローラー / Finder や SourceTree で開いて中身を確認できます。
アプリの「リセット」を押すと、そのレッスンのフォルダは作り直されます。
`;

/** 学生 PC の本来の ~/.gitconfig を汚さないよう、練習用の global 設定はここに置く */
const DEFAULT_GITCONFIG = `[user]
	name = Git Gym Student
	email = student@git-gym.local
[init]
	defaultBranch = main
[core]
	autocrlf = false
	quotePath = false
`;

const ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/i;

/**
 * 練習用リポジトリを置く実フォルダ（ドキュメント/GitGym）を管理する。
 * 削除を伴う操作は必ずこのルート配下に限定する。
 */
export class PracticeFolders {
  readonly root = path.join(app.getPath('documents'), 'GitGym');
  readonly globalConfig = path.join(this.root, '.gitconfig');

  async ensureRoot(): Promise<void> {
    await fs.mkdir(this.root, { recursive: true });
    const readme = path.join(this.root, 'README.txt');
    await fs.writeFile(readme, ROOT_README, { flag: 'wx' }).catch(() => undefined);
    await fs.writeFile(this.globalConfig, DEFAULT_GITCONFIG, { flag: 'wx' }).catch(() => undefined);
  }

  repoPath(kind: PracticeKind, id: string): string {
    return this.inside(path.join(this.root, kind, this.checkId(id)));
  }

  remotePath(id: string): string {
    return this.inside(path.join(this.root, 'remotes', `${this.checkId(id)}.git`));
  }

  async exists(dir: string): Promise<boolean> {
    return fs
      .stat(this.inside(dir))
      .then((s) => s.isDirectory())
      .catch(() => false);
  }

  /** フォルダを空の状態で作り直す */
  async reset(dir: string): Promise<void> {
    const target = this.inside(dir);
    await fs.rm(target, { recursive: true, force: true });
    await fs.mkdir(target, { recursive: true });
  }

  async open(dir: string): Promise<void> {
    const error = await shell.openPath(this.inside(dir));
    if (error) throw new Error(error);
  }

  private checkId(id: string): string {
    if (!ID_PATTERN.test(id)) throw new Error(`不正なフォルダ名です: ${id}`);
    return id;
  }

  private inside(dir: string): string {
    const resolved = path.resolve(dir);
    const relative = path.relative(this.root, resolved);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error(`練習用フォルダの外は操作できません: ${dir}`);
    }
    return resolved;
  }
}
