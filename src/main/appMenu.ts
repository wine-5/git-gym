import { app, Menu, type MenuItemConstructorOptions } from 'electron';

/**
 * アプリのメニュー。Electron 既定のメニューは Ctrl+W でウィンドウを閉じたり Ctrl+R で再読み込みしたりするので、
 * VS Code と同じショートカット（Ctrl+W でタブを閉じる など）と衝突しないよう、必要なものだけにする。
 */
export function setAppMenu(): void {
  const template: MenuItemConstructorOptions[] = [
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' as const }] : []),
    {
      label: '編集',
      submenu: [
        { role: 'undo', label: '元に戻す' },
        { role: 'redo', label: 'やり直す' },
        { type: 'separator' },
        { role: 'cut', label: '切り取り' },
        { role: 'copy', label: 'コピー' },
        { role: 'paste', label: '貼り付け' },
        { role: 'selectAll', label: 'すべて選択' },
      ],
    },
    {
      label: '表示',
      submenu: [
        { role: 'zoomIn', label: '拡大' },
        { role: 'zoomOut', label: '縮小' },
        { role: 'resetZoom', label: '実際のサイズ' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全画面表示' },
        ...(app.isPackaged ? [] : [{ role: 'toggleDevTools' as const, label: '開発者ツール' }]),
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
