import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Target, CheckCircle2, Circle, CircleDot, Lightbulb, LightbulbOff, BookOpen, ListChecks, ChevronDown } from 'lucide-react';
import { fillPlaceholders, type Chapter } from '@data/lessons';
import type { LessonRunner } from '@models/LessonRunner';
import { appModel } from '@models/AppModel';
import { ExplainModal } from './ExplainModal';
import { InlineText } from '../InlineText';
import styles from './MissionPanel.module.css';

interface Props {
  chapter: Chapter;
  lessonIndex: number;
  runner: LessonRunner;
}

export const MissionPanel = observer(({ chapter, lessonIndex, runner }: Props) => {
  const { lesson, done, doneCount } = runner;
  const [hintCount, setHintCount] = useState(1);
  const [explaining, setExplaining] = useState(false);
  const fill = (text: string) => fillPlaceholders(text, runner.vars);
  const nowIndex = done.indexOf(false);
  // ヒントは最初は隠しておき、表示するかどうかは問題をまたいで覚えておく
  const { showHints } = appModel.settings;
  const shownHints = showHints ? lesson.hints.slice(0, hintCount) : [];

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
                const state = done[i] ? 'done' : i === nowIndex ? 'now' : 'todo';
                const Icon = state === 'done' ? CheckCircle2 : state === 'now' ? CircleDot : Circle;
                return (
                  <li key={check.label} className={styles[state]}>
                    <Icon size={18} className={styles.checkIcon} />
                    <span>
                      <InlineText text={fill(check.label)} />
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
        {showHints && hintCount < lesson.hints.length && (
          <button className={styles.moreHint} onClick={() => setHintCount((n) => Math.min(n + 1, lesson.hints.length))}>
            <ChevronDown size={14} /> 次のヒント
          </button>
        )}
      </div>

      <div className={styles.foot}>
        <button
          className={showHints ? 'btn primary' : 'btn'}
          onClick={() => appModel.settings.toggleHints()}
          title="表示するかどうかは次の問題にも引き継がれます"
        >
          {showHints ? <LightbulbOff size={14} /> : <Lightbulb size={14} />} {showHints ? 'ヒントを隠す' : 'ヒントを表示'}
        </button>
        <button className="btn" onClick={() => setExplaining(true)}>
          <BookOpen size={14} /> 解説を見る
        </button>
      </div>

      {explaining && (
        <ExplainModal
          lesson={lesson}
          onClose={() => setExplaining(false)}
          onOpenDictionary={(name) => {
            setExplaining(false);
            appModel.openDictionary(name);
          }}
        />
      )}
    </section>
  );
});
