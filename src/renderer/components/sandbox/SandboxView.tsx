import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FlaskConical, RotateCcw, FolderOpen, BookOpen, Sparkles, GitBranch, Swords, Archive, Cloud } from 'lucide-react';
import { appModel } from '@models/AppModel';
import type { PracticeSession } from '@models/PracticeSession';
import { PracticeLayout } from '../workspace/PracticeLayout';
import styles from './SandboxView.module.css';

/** 自由に試すときのお題（判定はしない） */
const IDEAS = [
  { icon: GitBranch, title: 'ブランチを3つ作ってみる', detail: '作って切り替えて、グラフの枝の形を見てみよう', command: 'switch' },
  { icon: Swords, title: 'わざとコンフリクトを起こす', detail: '2つのブランチで同じ行を変えてマージしてみよう', command: 'merge' },
  { icon: Archive, title: 'stash を2回してみる', detail: 'stash list で並び方を確かめよう', command: 'stash' },
  { icon: Cloud, title: 'push と pull を往復する', detail: 'origin も用意済み。push → fetch → log --all を見てみよう', command: 'push' },
];

export const SandboxView = observer(() => {
  const session = appModel.sandboxSession;

  useEffect(() => {
    void session?.open();
  }, [session]);

  if (!session) return null;
  return <PracticeLayout session={session} left={<SandboxPanel session={session} />} />;
});

const SandboxPanel = ({ session }: { session: PracticeSession }) => (
  <section className={styles.panel}>
    <div className="panel-head">
      <span className={styles.headLabel}>
        <FlaskConical size={13} /> フリー練習
      </span>
    </div>

    <div className={styles.body}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <FlaskConical size={22} />
        </div>
        <h2>自由に試そう</h2>
        <p>
          ここではどんなコマンドを打っても大丈夫。壊れても「最初からやり直す」でいつでも戻せます。
          リモート（origin）も用意してあるので、push や pull も試せます。
        </p>
      </div>

      <div className={styles.sectionLabel}>
        <Sparkles size={13} /> やってみよう
      </div>
      <ul className={styles.ideas}>
        {IDEAS.map((idea) => (
          <li key={idea.title}>
            <idea.icon size={18} className={styles.ideaIcon} />
            <div>
              <b>{idea.title}</b>
              <span>{idea.detail}</span>
              <button className={styles.ideaLink} onClick={() => appModel.openDictionary(idea.command)}>
                git {idea.command} を調べる
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>

    <div className={styles.foot}>
      <button
        className="btn"
        onClick={() => {
          if (window.confirm('フリー練習のフォルダを最初の状態に戻しますか？\n変更はすべて消えます。')) void session.reset();
        }}
      >
        <RotateCcw size={14} /> 最初からやり直す
      </button>
      <div className={styles.footRow}>
        <button className="btn" onClick={() => session.reveal()}>
          <FolderOpen size={14} /> フォルダを開く
        </button>
        <button className="btn" onClick={() => appModel.openDictionary()}>
          <BookOpen size={14} /> コマンド辞典
        </button>
      </div>
    </div>
  </section>
);
