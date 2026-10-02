import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { appModel } from '@models/AppModel';
import { CHAPTERS, findLesson, nextLesson, type Chapter } from '@data/lessons';
import {
  Footprints,
  GitBranch,
  Cloud,
  Undo2,
  Sparkles,
  Users,
  CheckCircle2,
  Circle,
  Play,
  FlaskConical,
  BookOpen,
  Swords,
  AlertTriangle,
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

export const HomeView = observer(() => {
  // Git が使えない PC（Mac で Command Line Tools が未インストールなど）では、先に案内を出す
  const [gitMissing, setGitMissing] = useState(false);
  useEffect(() => {
    void window.gitGym?.app.info().then((info) => setGitMissing(info.gitVersion === null));
  }, []);
  const { progress } = appModel;
  // 最後に開いたレッスンをクリア済みなら、その次から続ける
  const lastId = appModel.currentLessonId;
  const continueId = progress.isDone(lastId) ? nextLesson(lastId)?.id ?? lastId : lastId;
  const current = findLesson(continueId);
  const percent = progress.percent;

  /** 章の中で最初の未クリアのレッスンを開く */
  const openChapter = (chapter: Chapter) => {
    const lesson = chapter.lessons.find((l) => !progress.isDone(l.id)) ?? chapter.lessons[0];
    appModel.openLesson(lesson.id);
  };

  return (
    <main className={styles.home}>
      <div className={styles.inner}>
        {gitMissing && (
          <div className={styles.gitMissing}>
            <AlertTriangle size={20} />
            <div>
              <b>Git が見つかりません</b>
              <span>
                Mac の場合は「ターミナル」アプリで <code>xcode-select --install</code> を実行して Git をインストールしてから、Git Gym を開き直してください。
              </span>
            </div>
          </div>
        )}

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
          {CHAPTERS.map((chapter) => {
            const doneCount = progress.doneCount(chapter);
            const isCurrent = chapter.id === current?.chapter.id;
            const completed = doneCount === chapter.lessons.length;
            const { icon: Icon, color } = CHAPTER_ICONS[chapter.id];
            const className = [styles.chapterCard, isCurrent && styles.current].filter(Boolean).join(' ');
            return (
              <div key={chapter.id} className={className}>
                <button className={styles.cardHead} onClick={() => openChapter(chapter)} title="この章の続きから始める">
                  <div className={styles.chapterIcon} style={{ color, background: `${color}22` }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <div className={styles.num}>
                      CHAPTER {chapter.number}
                      {isCurrent && ' ・ 学習中'}
                    </div>
                    <h3>{chapter.title}</h3>
                  </div>
                  {completed && <CheckCircle2 className={styles.completed} size={20} />}
                </button>
                <div className={styles.desc}>{chapter.summary}</div>
                <div className={styles.cmds}>
                  {chapter.commands.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
                {/* どのレッスンからでも始められる（確認したいコマンドだけやりたい人向け） */}
                <ul className={styles.lessons}>
                  {chapter.lessons.map((lesson) => {
                    const done = progress.isDone(lesson.id);
                    return (
                      <li key={lesson.id}>
                        <button className={styles.lessonRow} onClick={() => appModel.openLesson(lesson.id)}>
                          {done ? (
                            <CheckCircle2 size={14} className={styles.lessonDone} />
                          ) : (
                            <Circle size={14} className={styles.lessonTodo} />
                          )}
                          <span className={styles.lessonId}>{lesson.id}</span>
                          <span className={styles.lessonTitle}>{lesson.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
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
          <button className={styles.mode} onClick={() => appModel.navigate('stages')}>
            <div className={styles.ico} style={{ color: '#f05033', background: '#f0503322' }}>
              <Swords size={20} />
            </div>
            <div>
              <b>練習モード</b>
              <span>1ステージ＝コマンド1つ。初めての人はここから！</span>
            </div>
          </button>
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
