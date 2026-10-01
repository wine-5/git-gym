import { observer } from 'mobx-react-lite';
import { appModel } from '@models/AppModel';
import { CHAPTERS, findLesson } from '@data/lessons';
import {
  Footprints,
  GitBranch,
  Cloud,
  Undo2,
  Sparkles,
  Users,
  Lock,
  CheckCircle2,
  Play,
  FlaskConical,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import styles from './HomeView.module.css';

const CHAPTER_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  basics: { icon: Footprints, color: '#4cc38a' },
  branch: { icon: GitBranch, color: '#f05033' },
  remote: { icon: Cloud, color: '#5aa9ff' },
  undo: { icon: Undo2, color: '#e8c46a' },
  advanced: { icon: Sparkles, color: '#b48cff' },
  team: { icon: Users, color: '#ff8fab' },
};

// 進捗の保存はまだ無いので仮の値
const MOCK_DONE: Record<string, number> = { basics: 6, branch: 2 };
const CURRENT_CHAPTER = 'branch';

export const HomeView = observer(() => {
  const current = findLesson(appModel.currentLessonId);
  const total = CHAPTERS.reduce((sum, c) => sum + c.lessons.length, 0);
  const done = Object.values(MOCK_DONE).reduce((a, b) => a + b, 0);
  const percent = Math.round((done / total) * 100);

  return (
    <main className={styles.home}>
      <div className={styles.inner}>
        <div className={styles.hero}>
          <div>
            <h1>Git Gym</h1>
            <p>コマンドで Git を動かして、体で覚えよう。</p>
          </div>
          <div className={styles.overall}>
            <span>全体の進み具合</span>
            <div className={styles.bar}>
              <i style={{ width: `${percent}%` }} />
            </div>
            <b>{percent}%</b>
          </div>
        </div>

        {current && (
          <div className={styles.continue}>
            <div className={styles.info}>
              <small>つづきから</small>
              <div>
                第{current.chapter.number}章 {current.chapter.title} ・ {current.lesson.id} {current.lesson.title}
              </div>
            </div>
            <button className="btn primary" onClick={() => appModel.openLesson(current.lesson.id)}>
              <Play size={14} fill="currentColor" /> 再開する
            </button>
          </div>
        )}

        <div className={styles.sectionTitle}>コース</div>
        <div className={styles.chapters}>
          {CHAPTERS.map((chapter, i) => {
            const doneCount = MOCK_DONE[chapter.id] ?? 0;
            const isCurrent = chapter.id === CURRENT_CHAPTER;
            const locked = i > 2;
            const completed = doneCount === chapter.lessons.length;
            const { icon: Icon, color } = CHAPTER_ICONS[chapter.id];
            const className = [styles.chapterCard, isCurrent && styles.current, locked && styles.locked]
              .filter(Boolean)
              .join(' ');
            return (
              <div key={chapter.id} className={className}>
                <div className={styles.cardHead}>
                  <div className={styles.chapterIcon} style={{ color, background: `${color}22` }}>
                    {locked ? <Lock size={22} /> : <Icon size={22} />}
                  </div>
                  <div>
                    <div className={styles.num}>
                      CHAPTER {chapter.number}
                      {isCurrent && ' ・ 学習中'}
                    </div>
                    <h3>{chapter.title}</h3>
                  </div>
                  {completed && <CheckCircle2 className={styles.completed} size={20} />}
                </div>
                <div className={styles.desc}>{chapter.summary}</div>
                <div className={styles.cmds}>
                  {chapter.commands.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
                <div className={styles.prog}>
                  <div className={styles.progBar}>
                    <i style={{ width: `${(doneCount / chapter.lessons.length) * 100}%` }} />
                  </div>
                  {doneCount}/{chapter.lessons.length}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.sectionTitle}>その他のモード</div>
        <div className={styles.modes}>
          <button className={styles.mode} onClick={() => appModel.navigate('sandbox')}>
            <div className={styles.ico} style={{ color: '#4cc38a', background: '#4cc38a22' }}>
              <FlaskConical size={20} />
            </div>
            <div>
              <b>フリー練習</b>
              <span>課題なしで自由にコマンドを試せるサンドボックス</span>
            </div>
          </button>
          <button className={styles.mode} onClick={() => appModel.navigate('dictionary')}>
            <div className={styles.ico} style={{ color: '#5aa9ff', background: '#5aa9ff22' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <b>コマンド辞典</b>
              <span>覚えたコマンドがここに集まっていく</span>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
});
