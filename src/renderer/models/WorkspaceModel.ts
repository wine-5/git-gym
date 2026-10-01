import { makeAutoObservable } from 'mobx';
import type { ProjectTemplate } from '@data/projects';

/** エディタで開いている練習用プロジェクトのファイル群 */
export class WorkspaceModel {
  projectName = '';
  files = new Map<string, string>();
  /** 最後にコミットした時点の内容（変更マーク表示用） */
  private committed = new Map<string, string>();
  openTabs: string[] = [];
  activePath: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  load(project: ProjectTemplate): void {
    this.projectName = project.name;
    this.files = new Map(project.files.map((f) => [f.path, f.content]));
    this.committed = new Map(this.files);
    this.openTabs = [project.featureFile, project.mainFile];
    this.activePath = project.featureFile;
  }

  get paths(): string[] {
    return [...this.files.keys()].sort((a, b) => a.localeCompare(b));
  }

  get activeContent(): string {
    return this.activePath ? this.files.get(this.activePath) ?? '' : '';
  }

  isModified(path: string): boolean {
    return this.files.get(path) !== this.committed.get(path);
  }

  get modifiedCount(): number {
    return this.paths.filter((p) => this.isModified(p)).length;
  }

  open(path: string): void {
    if (!this.openTabs.includes(path)) this.openTabs.push(path);
    this.activePath = path;
  }

  close(path: string): void {
    const index = this.openTabs.indexOf(path);
    if (index < 0) return;
    this.openTabs.splice(index, 1);
    if (this.activePath === path) {
      this.activePath = this.openTabs[Math.min(index, this.openTabs.length - 1)] ?? null;
    }
  }

  update(path: string, content: string): void {
    this.files.set(path, content);
  }
}
