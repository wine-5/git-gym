import { app, ipcMain } from 'electron';
import { IPC, type WorkspaceRef } from '../shared/api';
import type { ProgressData } from '../shared/progress';
import type { SetupStep } from '../shared/setup';
import type { ProgressStore } from './progressStore';
import type { GitRunner } from './git/GitRunner';
import type { PracticeFolders } from './workspace/PracticeFolders';
import type { WorkspaceHub } from './workspace/WorkspaceHub';

/** レンダラーからの呼び出しを WorkspaceHub につなぐ */
export function registerIpc(
  hub: WorkspaceHub,
  progress: ProgressStore,
  info: { git: GitRunner; gitPath: string; folders: PracticeFolders },
): void {
  ipcMain.handle(IPC.appInfo, async () => {
    const r = await info.git.run(['--version'], info.folders.root).catch(() => null);
    return {
      version: app.getVersion(),
      gitVersion: r && r.exitCode === 0 ? r.stdout.trim() : null,
      gitBundled: info.gitPath !== 'git',
      practiceRoot: info.folders.root,
    };
  });
  ipcMain.handle(IPC.workspaceOpen, (_e, ref: WorkspaceRef, displayName: string, setup?: SetupStep[]) =>
    hub.open(ref, displayName, setup),
  );
  ipcMain.handle(IPC.workspaceReset, (_e, ref: WorkspaceRef) => hub.reset(ref));
  ipcMain.handle(IPC.workspaceReveal, (_e, ref: WorkspaceRef) => hub.reveal(ref));
  ipcMain.handle(IPC.terminalExecute, (_e, ref: WorkspaceRef, line: string) => hub.execute(ref, line));
  ipcMain.handle(IPC.repoSnapshot, (_e, ref: WorkspaceRef) => hub.snapshot(ref));
  ipcMain.handle(IPC.repoQuery, (_e, ref: WorkspaceRef, args: string[]) => hub.query(ref, args));
  ipcMain.handle(IPC.filesList, (_e, ref: WorkspaceRef) => hub.listFiles(ref));
  ipcMain.handle(IPC.filesRead, (_e, ref: WorkspaceRef, file: string) => hub.readFile(ref, file));
  ipcMain.handle(IPC.progressLoad, () => progress.load());
  ipcMain.handle(IPC.progressSave, (_e, data: ProgressData) => progress.save(data));
  ipcMain.handle(IPC.filesWrite, (_e, ref: WorkspaceRef, file: string, content: string) => hub.writeFile(ref, file, content));
}
