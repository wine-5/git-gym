import { contextBridge } from 'electron';
import type { GitGymApi } from '../shared/api';

// レンダラーに公開する API。Git 実行などはここに IPC 経由で追加していく
const api: GitGymApi = {
  platform: process.platform,
};

contextBridge.exposeInMainWorld('gitGym', api);
