import { contextBridge, ipcRenderer } from 'electron';
import { IPC, type GitGymApi } from '../shared/api';

// レンダラーに公開する API。Node の機能はここを通してだけ使わせる
const api: GitGymApi = {
  platform: process.platform,
  workspace: {
    open: (ref, displayName) => ipcRenderer.invoke(IPC.workspaceOpen, ref, displayName),
    reset: (ref) => ipcRenderer.invoke(IPC.workspaceReset, ref),
    reveal: (ref) => ipcRenderer.invoke(IPC.workspaceReveal, ref),
  },
  terminal: {
    execute: (ref, line) => ipcRenderer.invoke(IPC.terminalExecute, ref, line),
  },
  repo: {
    snapshot: (ref) => ipcRenderer.invoke(IPC.repoSnapshot, ref),
  },
};

contextBridge.exposeInMainWorld('gitGym', api);
