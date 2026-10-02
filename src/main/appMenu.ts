import { app, Menu, type MenuItemConstructorOptions } from 'electron';
import { pick } from './i18n';

/**
 * アプリのメニュー。Electron 既定のメニューは Ctrl+W でウィンドウを閉じたり Ctrl+R で再読み込みしたりするので、
 * VS Code と同じショートカット（Ctrl+W でタブを閉じる など）と衝突しないよう、必要なものだけにする。
 */
export function setAppMenu(): void {
  const template: MenuItemConstructorOptions[] = [
    ...(process.platform === 'darwin' ? [{ role: 'appMenu' as const }] : []),
    {
      label: pick({ ja: '編集', en: 'Edit', zh: '编辑', ko: '편집' }),
      submenu: [
        { role: 'undo', label: pick({ ja: '元に戻す', en: 'Undo', zh: '撤销', ko: '실행 취소' }) },
        { role: 'redo', label: pick({ ja: 'やり直す', en: 'Redo', zh: '重做', ko: '다시 실행' }) },
        { type: 'separator' },
        { role: 'cut', label: pick({ ja: '切り取り', en: 'Cut', zh: '剪切', ko: '잘라내기' }) },
        { role: 'copy', label: pick({ ja: 'コピー', en: 'Copy', zh: '复制', ko: '복사' }) },
        { role: 'paste', label: pick({ ja: '貼り付け', en: 'Paste', zh: '粘贴', ko: '붙여넣기' }) },
        { role: 'selectAll', label: pick({ ja: 'すべて選択', en: 'Select All', zh: '全选', ko: '모두 선택' }) },
      ],
    },
    {
      label: pick({ ja: '表示', en: 'View', zh: '视图', ko: '보기' }),
      submenu: [
        { role: 'zoomIn', label: pick({ ja: '拡大', en: 'Zoom In', zh: '放大', ko: '확대' }) },
        { role: 'zoomOut', label: pick({ ja: '縮小', en: 'Zoom Out', zh: '缩小', ko: '축소' }) },
        { role: 'resetZoom', label: pick({ ja: '実際のサイズ', en: 'Actual Size', zh: '实际大小', ko: '실제 크기' }) },
        { type: 'separator' },
        { role: 'togglefullscreen', label: pick({ ja: '全画面表示', en: 'Toggle Full Screen', zh: '全屏显示', ko: '전체 화면' }) },
        ...(app.isPackaged ? [] : [{ role: 'toggleDevTools' as const, label: pick({ ja: '開発者ツール', en: 'Developer Tools', zh: '开发者工具', ko: '개발자 도구' }) }]),
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
