import { app, BrowserWindow } from 'electron';
import { GitRunner } from './git/GitRunner';
import { resolveGitPath } from './git/gitPath';
import { registerIpc } from './ipc';
import { ProgressStore } from './progressStore';
import { PracticeFolders } from './workspace/PracticeFolders';
import { WorkspaceHub } from './workspace/WorkspaceHub';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'Git Gym',
    backgroundColor: '#1e1f24',
    autoHideMenuBar: true,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
      // 開発中は裏にあるウィンドウも描画し続ける（画面確認スクリプトのスクリーンショット用）
      backgroundThrottling: app.isPackaged,
    },
  });

  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
}

app.whenReady().then(() => {
  registerIpc(new WorkspaceHub(new PracticeFolders(), new GitRunner(resolveGitPath())), new ProgressStore());
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
