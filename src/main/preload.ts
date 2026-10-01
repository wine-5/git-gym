import { contextBridge, ipcRenderer } from 'electron';
import { IPC, type GitGymApi } from '../shared/api';

// レンダラーに公開する API。Node の機能はここを通してだけ使わせる
const api: GitGymApi = {
  platform: process.platform,
  workspace: {
    open: (ref, displayName, setup) => ipcRenderer.invoke(IPC.workspaceOpen, ref, displayName, setup),
    reset: (ref) => ipcRenderer.invoke(IPC.workspaceReset, ref),
    reveal: (ref) => ipcRenderer.invoke(IPC.workspaceReveal, ref),
  },
  terminal: {
    execute: (ref, line) => ipcRenderer.invoke(IPC.terminalExecute, ref, line),
  },
  repo: {
    snapshot: (ref) => ipcRenderer.invoke(IPC.repoSnapshot, ref),
    query: (ref, args) => ipcRenderer.invoke(IPC.repoQuery, ref, args),
  },
  files: {
    list: (ref) => ipcRenderer.invoke(IPC.filesList, ref),
    read: (ref, file) => ipcRenderer.invoke(IPC.filesRead, ref, file),
    write: (ref, file, content) => ipcRenderer.invoke(IPC.filesWrite, ref, file, content),
  },
  app: {
    info: () => ipcRenderer.invoke(IPC.appInfo),
  },
  progress: {
    load: () => ipcRenderer.invoke(IPC.progressLoad),
    save: (data) => ipcRenderer.invoke(IPC.progressSave, data),
  },
};

contextBridge.exposeInMainWorld('gitGym', api);
