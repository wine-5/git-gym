import { observer } from 'mobx-react-lite';
import { Star, Map as MapIcon, Swords } from 'lucide-react';
import { appModel } from '@models/AppModel';
import { ALL_STAGES, WORLDS } from '@data/stages';
import styles from './StageMapView.module.css';

/** 練習モードのステージ選択。どのステージからでも遊べる */
export const StageMapView = observer(() => {
  const { progress } = appModel;
  const cleared = (id: string) => progress.stageStars.has(id);
  const nextId = ALL_STAGES.find((s) => !cleared(s.id))?.id;
  const totalStars = ALL_STAGES.reduce((n, s) => n + (progress.stageStars.get(s.id) ?? 0), 0);

  return (
    <main className={styles.map}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <h1>
              <Swords size={24} /> 練習モード
            </h1>
            <p>1ステージ＝コマンド1つ。サクサク進めて、Git の操作を体に覚えさせよう！</p>
          </div>
          <div className={styles.totalStars}>
            <Star size={20} fill="currentColor" />
            <b>{totalStars}</b>
            <span>/ {ALL_STAGES.length * 3}</span>
          </div>
        </header>

        {WORLDS.map((world) => (
          <section key={world.id} className={styles.world} style={{ '--world': world.color } as React.CSSProperties}>
            <h2>
              <MapIcon size={16} /> WORLD {world.number}　{world.title}
              <span className={styles.worldCount}>
                {world.stages.filter((s) => cleared(s.id)).length} / {world.stages.length}
              </span>
            </h2>
            <ol className={styles.path}>
              {world.stages.map((stage, i) => {
                const stars = progress.stageStars.get(stage.id) ?? 0;
                const isNext = stage.id === nextId;
                const className = [styles.node, stars > 0 && styles.cleared, isNext && styles.next]
                  .filter(Boolean)
                  .join(' ');
                return (
                  <li key={stage.id} className={styles.step}>
                    {i > 0 && <span className={stars > 0 || isNext ? `${styles.link} ${styles.linkOn}` : styles.link} />}
                    <button
                      className={className}
                      onClick={() => appModel.openStage(stage.id)}
                      title={stage.description}
                    >
                      <span className={styles.num}>{i + 1}</span>
                    </button>
                    <span className={styles.title}>{stage.title}</span>
                    <span className={styles.stars}>
                      {[1, 2, 3].map((n) => (
                        <Star key={n} size={12} fill={n <= stars ? 'currentColor' : 'none'} className={n <= stars ? styles.starOn : styles.starOff} />
                      ))}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </main>
  );
});
