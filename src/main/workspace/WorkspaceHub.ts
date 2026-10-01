import type { WorkspaceInfo, WorkspaceRef } from '../../shared/api';
import type { RepoSnapshot } from '../../shared/repo';
import type { CommandResult } from '../../shared/terminal';
import type { GitRunner } from '../git/GitRunner';
import { readRepo } from '../git/readRepo';
import { TerminalSession } from '../terminal/TerminalSession';
import type { PracticeFolders } from './PracticeFolders';
import { listFiles, readFile, writeFile } from './repoFiles';

interface OpenWorkspace {
  path: string;
  session: TerminalSession;
}

/** 開いている練習用リポジトリと、それぞれのターミナルをまとめて管理する */
export class WorkspaceHub {
  private readonly workspaces = new Map<string, OpenWorkspace>();
  private readonly displayNames = new Map<string, string>();

  constructor(
    private readonly folders: PracticeFolders,
    private readonly git: GitRunner,
  ) {}

  async open(ref: WorkspaceRef, displayName: string): Promise<WorkspaceInfo> {
    await this.folders.ensureRoot();
    const dir = this.folders.repoPath(ref.kind, ref.id);
    if (!(await this.folders.exists(dir))) await this.folders.reset(dir);

    this.displayNames.set(key(ref), displayName);
    const workspace = this.createSession(ref, dir);
    return { path: workspace.path, cwd: workspace.session.displayCwd };
  }

  async reset(ref: WorkspaceRef): Promise<WorkspaceInfo> {
    const dir = this.folders.repoPath(ref.kind, ref.id);
    await this.folders.reset(dir);
    const workspace = this.createSession(ref, dir);
    return { path: workspace.path, cwd: workspace.session.displayCwd };
  }

  async reveal(ref: WorkspaceRef): Promise<void> {
    await this.folders.open(this.get(ref).path);
  }

  execute(ref: WorkspaceRef, line: string): Promise<CommandResult> {
    return this.get(ref).session.execute(line);
  }

  snapshot(ref: WorkspaceRef): Promise<RepoSnapshot> {
    return readRepo(this.git, this.get(ref).path, this.gitEnv);
  }

  listFiles(ref: WorkspaceRef): Promise<string[]> {
    return listFiles(this.get(ref).path);
  }

  readFile(ref: WorkspaceRef, file: string): Promise<string | null> {
    return readFile(this.get(ref).path, file);
  }

  writeFile(ref: WorkspaceRef, file: string, content: string): Promise<void> {
    return writeFile(this.get(ref).path, file, content);
  }

  private get gitEnv(): Record<string, string> {
    return { GIT_CONFIG_GLOBAL: this.folders.globalConfig };
  }

  private createSession(ref: WorkspaceRef, dir: string): OpenWorkspace {
    const displayName = this.displayNames.get(key(ref)) ?? ref.id;
    const session = new TerminalSession(dir, displayName, this.git, this.gitEnv);
    const workspace = { path: dir, session };
    this.workspaces.set(key(ref), workspace);
    return workspace;
  }

  private get(ref: WorkspaceRef): OpenWorkspace {
    const workspace = this.workspaces.get(key(ref));
    if (!workspace) throw new Error(`ワークスペースが開かれていません: ${key(ref)}`);
    return workspace;
  }
}

function key(ref: WorkspaceRef): string {
  return `${ref.kind}/${ref.id}`;
}
