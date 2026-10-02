import { observer } from 'mobx-react-lite';
import { appModel, type Screen } from '@models/AppModel';
import { findLesson } from '@data/lessons';
import { Home, GraduationCap, Swords, FlaskConical, BookOpen, RotateCcw, Settings, ChevronRight, type LucideIcon } from 'lucide-react';
import styles from './TitleBar.module.css';
import { t } from '@i18n/t';

const NAV: { screen: Screen; labelKey: string; icon: LucideIcon }[] = [
  { screen: 'home', labelKey: 'nav.home', icon: Home },
  { screen: 'stages', labelKey: 'nav.stages', icon: Swords },
  { screen: 'lesson', labelKey: 'nav.lesson', icon: GraduationCap },
  { screen: 'sandbox', labelKey: 'nav.sandbox', icon: FlaskConical },
  { screen: 'dictionary', labelKey: 'nav.dictionary', icon: BookOpen },
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
              className={appModel.screen === item.screen || (item.screen === 'stages' && appModel.screen === 'stage') ? styles.active : undefined}
              onClick={() => (appModel.sound.play('click'), appModel.navigate(item.screen))}
            >
              <item.icon size={15} />
              {t(item.labelKey)}
            </button>
          ))}
        </nav>
      )}

      {inLesson && (
        <div className={styles.breadcrumb}>
          <span>
            {t('chapterNo', { n: found.chapter.number })} {found.chapter.title}
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
          <div className={styles.steps}>
            {/* 章内の進み具合。押すとそのレッスンへ移動する */}
            {found.chapter.lessons.map((l, i) => (
              <button
                key={l.id}
                title={`${l.id} ${l.title}`}
                className={i === found.index ? styles.now : appModel.progress.isDone(l.id) ? styles.done : undefined}
                onClick={() => i !== found.index && appModel.openLesson(l.id)}
              />
            ))}
          </div>
          <button
            className="btn"
            title={t('titlebar.resetTitle')}
            onClick={() => {
              if (window.confirm(t('titlebar.resetConfirm'))) {
                void appModel.resetLesson();
              }
            }}
          >
            <RotateCcw size={14} /> {t('titlebar.reset')}
          </button>
        </>
      )}
      <button
        className={appModel.screen === 'settings' ? `btn ${styles.settingsActive}` : 'btn'}
        title={t('titlebar.settings')}
        onClick={() => appModel.navigate('settings')}
      >
        <Settings size={15} />
      </button>
    </header>
  );
});
