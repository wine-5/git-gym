import { useState } from 'react';
import { Target, CheckCircle2, Circle, CircleDot, Lightbulb, BookOpen, ListChecks } from 'lucide-react';
import { fillPlaceholders, type Chapter, type Lesson } from '@data/lessons';
import { InlineText } from '../InlineText';
import styles from './MissionPanel.module.css';

interface Props {
  chapter: Chapter;
  lesson: Lesson;
  lessonIndex: number;
  vars: Record<string, string>;
  /** 達成済みのチェック数（Git 連携までは仮の値） */
  doneCount: number;
}

export function MissionPanel({ chapter, lesson, lessonIndex, vars, doneCount }: Props) {
  const [hintCount, setHintCount] = useState(1);
  const fill = (text: string) => fillPlaceholders(text, vars);
  const shownHints = lesson.hints.slice(0, hintCount);

  return (
    <section className={styles.panel}>
      <div className="panel-head">
        <span className={styles.headLabel}>
          <Target size={13} /> ミッション
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.chapter}>
          第{chapter.number}章 {chapter.title} ・ {lessonIndex + 1} / {chapter.lessons.length}
        </div>
        <h2>{lesson.title}</h2>
        <p className={styles.description}>
          <InlineText text={fill(lesson.description)} />
        </p>

        {lesson.checks.length > 0 && (
          <>
            <div className={styles.sectionLabel}>
              <ListChecks size={13} /> やること {doneCount} / {lesson.checks.length}
            </div>
            <ul className={styles.checklist}>
              {lesson.checks.map((check, i) => {
                const state = i < doneCount ? 'done' : i === doneCount ? 'now' : 'todo';
                const Icon = state === 'done' ? CheckCircle2 : state === 'now' ? CircleDot : Circle;
                return (
                  <li key={check} className={styles[state]}>
                    <Icon size={18} className={styles.checkIcon} />
                    <span>
                      <InlineText text={fill(check)} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {shownHints.map((hint, i) => (
          <div key={i} className={styles.hint}>
            <span className={styles.hintLabel}>
              <Lightbulb size={14} /> ヒント {i + 1} / {lesson.hints.length}
            </span>
            <InlineText text={fill(hint)} />
          </div>
        ))}
      </div>

      <div className={styles.foot}>
        <button
          className="btn"
          disabled={hintCount >= lesson.hints.length}
          onClick={() => setHintCount((n) => Math.min(n + 1, lesson.hints.length))}
        >
          <Lightbulb size={14} /> 次のヒント
        </button>
        <button className="btn">
          <BookOpen size={14} /> 解説を見る
        </button>
      </div>
    </section>
  );
}
