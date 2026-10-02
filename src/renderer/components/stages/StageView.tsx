import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Swords, Lightbulb, Star, ArrowRight, RotateCcw, Map as MapIcon, Target, CheckCircle2 } from 'lucide-react';
import { appModel } from '@models/AppModel';
import type { LessonRunner } from '@models/LessonRunner';
import { fillPlaceholders } from '@data/lessons';
import { findStage, nextStage, starsFor, type Stage, type World } from '@data/stages';
import { PracticeLayout } from '../workspace/PracticeLayout';
import { InlineText } from '../InlineText';
import { Confetti } from '../effects/Confetti';
import { t } from '@i18n/t';
import styles from './StageView.module.css';

export const StageView = observer(() => {
  const found = findStage(appModel.currentStageId);
  const entry = appModel.stageEntry;

  useEffect(() => {
    void entry?.session.open().then(() => entry.runner.evaluate());
  }, [entry]);

  if (!found || !entry) return null;

  return (
    <PracticeLayout
      session={entry.session}
      left={<StagePanel key={found.stage.id} world={found.world} stage={found.stage} index={found.index} runner={entry.runner} />}
    />
  );
});

interface PanelProps {
  world: World;
  stage: Stage;
  index: number;
  runner: LessonRunner;
}

const StagePanel = observer(({ world, stage, index, runner }: PanelProps) => {
  const [hintLevel, setHintLevel] = useState(0);
  const [stars, setStars] = useState<number | null>(null);
  const fill = (text: string) => fillPlaceholders(text, runner.vars);
  const next = nextStage(stage.id);

  // クリアした瞬間に星を決めて保存する
  useEffect(() => {
    if (runner.completed && stars === null) {
      const result = starsFor(runner.failedCount, hintLevel >= 2);
      setStars(result);
      appModel.progress.setStars(stage.id, result);
      // ファンファーレのあと、星のアニメーションに合わせて1つずつ鳴らす
      appModel.sound.play('stageClear');
      for (let n = 1; n <= result; n++) setTimeout(() => appModel.sound.play('star'), 500 + n * 150);
    }
  }, [runner.completed, stars, hintLevel, runner, stage.id]);

  const retry = () => {
    setStars(null);
    setHintLevel(0);
    void appModel.resetStage();
  };

  return (
    <section className={styles.panel} style={{ '--world': world.color } as React.CSSProperties}>
      <div className="panel-head">
        <span className={styles.headLabel}>
          <Swords size={13} /> {t('stage.head')}
        </span>
        <button className={styles.mapLink} onClick={() => appModel.navigate('stages')}>
          <MapIcon size={12} /> {t('stage.map')}
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.world}>
          WORLD {world.number} {world.title}
        </div>
        <div className={styles.stageNo}>
          STAGE {world.number}-{index + 1}
          <span>{stage.title}</span>
        </div>

        <div className={stars !== null ? `${styles.mission} ${styles.missionDone}` : styles.mission}>
          <div className={styles.missionLabel}>
            {stars !== null ? <CheckCircle2 size={14} /> : <Target size={14} />} {t('mission.head')}
          </div>
          <p>
            <InlineText text={fill(stage.description)} />
          </p>
        </div>

        {stars === null ? (
          <>
            {stage.hints.slice(0, hintLevel).map((hint, i) => (
              <div key={i} className={i === 1 ? `${styles.hint} ${styles.answer}` : styles.hint}>
                <Lightbulb size={14} />
                <span>
                  {i === 1 && <b>{t('stage.answer')}</b>}
                  <InlineText text={fill(hint)} />
                </span>
              </div>
            ))}
            {hintLevel < stage.hints.length && (
              <button className={`btn ${styles.hintButton}`} onClick={() => setHintLevel((n) => n + 1)}>
                <Lightbulb size={14} /> {hintLevel === 0 ? t('stage.showHint') : t('stage.showAnswer')}
              </button>
            )}
          </>
        ) : (
          <div className={styles.result}>
            <Confetti count={120} />
            <div className={styles.resultTitle}>STAGE CLEAR!</div>
            <div className={styles.bigStars}>
              {[1, 2, 3].map((n) => (
                <Star
                  key={n}
                  size={36}
                  fill={n <= stars ? 'currentColor' : 'none'}
                  className={n <= stars ? styles.starOn : styles.starOff}
                  style={{ animationDelay: `${n * 0.15}s` }}
                />
              ))}
            </div>
            <p className={styles.resultNote}>
              {stars === 3 ? t('stage.perfect') : t('stage.cleared')}
            </p>
            {next ? (
              <button className={`btn primary ${styles.nextButton}`} onClick={() => appModel.openStage(next.id)} autoFocus>
                {t('stage.next')} <ArrowRight size={15} />
              </button>
            ) : (
              <button className={`btn primary ${styles.nextButton}`} onClick={() => appModel.navigate('stages')} autoFocus>
                {t('stage.allClear')} <MapIcon size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className={styles.foot}>
        <button className="btn" onClick={retry}>
          <RotateCcw size={14} /> {t('stage.retry')}
        </button>
      </div>
    </section>
  );
});
