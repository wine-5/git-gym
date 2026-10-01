import { ipcMain } from 'electron';
import { IPC, type SeedFile, type WorkspaceRef } from '../shared/api';
import type { WorkspaceHub } from './workspace/WorkspaceHub';

/** レンダラーからの呼び出しを WorkspaceHub につなぐ */
export function registerIpc(hub: WorkspaceHub): void {
  ipcMain.handle(IPC.workspaceOpen, (_e, ref: WorkspaceRef, displayName: string, seed?: SeedFile[]) =>
    hub.open(ref, displayName, seed),
  );
  ipcMain.handle(IPC.workspaceReset, (_e, ref: WorkspaceRef) => hub.reset(ref));
  ipcMain.handle(IPC.workspaceReveal, (_e, ref: WorkspaceRef) => hub.reveal(ref));
  ipcMain.handle(IPC.terminalExecute, (_e, ref: WorkspaceRef, line: string) => hub.execute(ref, line));
  ipcMain.handle(IPC.repoSnapshot, (_e, ref: WorkspaceRef) => hub.snapshot(ref));
  ipcMain.handle(IPC.filesList, (_e, ref: WorkspaceRef) => hub.listFiles(ref));
  ipcMain.handle(IPC.filesRead, (_e, ref: WorkspaceRef, file: string) => hub.readFile(ref, file));
  ipcMain.handle(IPC.filesWrite, (_e, ref: WorkspaceRef, file: string, content: string) => hub.writeFile(ref, file, content));
}
