import { observer } from 'mobx-react-lite';
import { appModel, type Screen } from '@models/AppModel';
import { findLesson } from '@data/lessons';
import { Home, GraduationCap, FlaskConical, BookOpen, RotateCcw, Settings, ChevronRight, type LucideIcon } from 'lucide-react';
import styles from './TitleBar.module.css';

const NAV: { screen: Screen; label: string; icon: LucideIcon }[] = [
  { screen: 'home', label: 'ホーム', icon: Home },
  { screen: 'lesson', label: 'レッスン', icon: GraduationCap },
  { screen: 'sandbox', label: 'フリー練習', icon: FlaskConical },
  { screen: 'dictionary', label: 'コマンド辞典', icon: BookOpen },
];

export const TitleBar = observer(() => {
  const found = findLesson(appModel.currentLessonId);
  const inLesson = appModel.screen === 'lesson' && found;

  return (
    <header className={styles.titlebar}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <circle cx="4" cy="3.5" r="1.6" />
            <circle cx="4" cy="12.5" r="1.6" />
            <circle cx="12" cy="6" r="1.6" />
            <path d="M4 5.1v5.8M12 7.6c0 2.4-3 2.4-6.6 3.8" />
          </svg>
        </div>
        Git Gym
      </div>

      {appModel.language && (
        <nav className={styles.nav}>
          {NAV.map((item) => (
            <button
              key={item.screen}
              className={appModel.screen === item.screen ? styles.active : undefined}
              onClick={() => appModel.navigate(item.screen)}
            >
              <item.icon size={15} />
              {item.label}
            </button>
          ))}
        </nav>
      )}

      {inLesson && (
        <div className={styles.breadcrumb}>
          <span>
            第{found.chapter.number}章 {found.chapter.title}
          </span>
          <ChevronRight size={14} />
          <strong>
            {found.lesson.id} {found.lesson.title}
          </strong>
        </div>
      )}

      <div className={styles.spacer} />

      {inLesson && (
        <>
          <div className={styles.steps} title="章内の進み具合">
            {found.chapter.lessons.map((l, i) => (
              <i key={l.id} className={i < found.index ? styles.done : i === found.index ? styles.now : undefined} />
            ))}
          </div>
          <button
            className="btn"
            title="練習用フォルダを最初の状態に戻します"
            onClick={() => {
              if (window.confirm('このレッスンを最初からやり直しますか？\n練習用フォルダの変更はすべて消えます。')) {
                void appModel.resetLesson();
              }
            }}
          >
            <RotateCcw size={14} /> リセット
          </button>
        </>
      )}
      <button className="btn" title="設定">
        <Settings size={15} />
      </button>
    </header>
  );
});
