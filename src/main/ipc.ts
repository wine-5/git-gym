import { ipcMain } from 'electron';
import { IPC, type WorkspaceRef } from '../shared/api';
import type { WorkspaceHub } from './workspace/WorkspaceHub';

/** レンダラーからの呼び出しを WorkspaceHub につなぐ */
export function registerIpc(hub: WorkspaceHub): void {
  ipcMain.handle(IPC.workspaceOpen, (_e, ref: WorkspaceRef, displayName: string) => hub.open(ref, displayName));
  ipcMain.handle(IPC.workspaceReset, (_e, ref: WorkspaceRef) => hub.reset(ref));
  ipcMain.handle(IPC.workspaceReveal, (_e, ref: WorkspaceRef) => hub.reveal(ref));
  ipcMain.handle(IPC.terminalExecute, (_e, ref: WorkspaceRef, line: string) => hub.execute(ref, line));
  ipcMain.handle(IPC.repoSnapshot, (_e, ref: WorkspaceRef) => hub.snapshot(ref));
}
