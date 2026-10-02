import { createRoot } from 'react-dom/client';
import { App } from './App';
import { appModel } from './models/AppModel';
import { applyContentOverlays } from './i18n/content/apply';
import './styles/global.css';

// 開発中だけ、画面確認スクリプトからレッスンを直接開けるようにする
if (process.env.NODE_ENV === 'development') {
  (window as unknown as { __gitGym: typeof appModel }).__gitGym = appModel;
}

// レッスンやコマンド辞典の文章を、設定の表示言語で出せるようにする
applyContentOverlays();

createRoot(document.getElementById('root')!).render(<App />);
