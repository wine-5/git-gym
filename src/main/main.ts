import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { setAppMenu } from './appMenu';
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
    // 開発中もタスクバーにアプリのアイコンを出す（配布版は実行ファイルのアイコンが使われる）
    icon: app.isPackaged ? undefined : path.join(app.getAppPath(), 'assets', 'icon', 'icon.png'),
    backgroundColor: '#1e1f24',
    autoHideMenuBar: true,
    // 画面いっぱいに広げてから見せる（小さいウィンドウが一瞬見えないように）
    show: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
      // 開発中は裏にあるウィンドウも描画し続ける（画面確認スクリプトのスクリーンショット用）
      backgroundThrottling: app.isPackaged,
    },
  });

  win.once('ready-to-show', () => {
    win.maximize();
    win.show();
  });
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
}

app.whenReady().then(() => {
  setAppMenu();
  const gitPath = resolveGitPath();
  const git = new GitRunner(gitPath);
  const folders = new PracticeFolders();
  registerIpc(new WorkspaceHub(folders, git), new ProgressStore(), { git, gitPath, folders });
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
