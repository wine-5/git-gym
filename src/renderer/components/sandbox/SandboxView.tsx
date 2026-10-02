import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { FlaskConical, RotateCcw, FolderOpen, BookOpen, Sparkles, GitBranch, Swords, Archive, Cloud } from 'lucide-react';
import { appModel } from '@models/AppModel';
import type { PracticeSession } from '@models/PracticeSession';
import { PracticeLayout } from '../workspace/PracticeLayout';
import styles from './SandboxView.module.css';
import { t } from '@i18n/t';

/** 自由に試すときのお題（判定はしない） */
const IDEAS = [
  { icon: GitBranch, id: 'branch', command: 'switch' },
  { icon: Swords, id: 'conflict', command: 'merge' },
  { icon: Archive, id: 'stash', command: 'stash' },
  { icon: Cloud, id: 'remote', command: 'push' },
];

export const SandboxView = observer(() => {
  const session = appModel.sandboxSession;

  useEffect(() => {
    void session?.open();
  }, [session]);

  if (!session) return null;
  return <PracticeLayout session={session} left={<SandboxPanel session={session} />} />;
});

const SandboxPanel = observer(({ session }: { session: PracticeSession }) => (
  <section className={styles.panel}>
    <div className="panel-head">
      <span className={styles.headLabel}>
        <FlaskConical size={13} /> {t('nav.sandbox')}
      </span>
    </div>

    <div className={styles.body}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <FlaskConical size={22} />
        </div>
        <h2>{t('sandbox.heroTitle')}</h2>
        <p>{t('sandbox.heroBody')}</p>
      </div>

      <div className={styles.sectionLabel}>
        <Sparkles size={13} /> {t('sandbox.tryIt')}
      </div>
      <ul className={styles.ideas}>
        {IDEAS.map((idea) => (
          <li key={idea.id}>
            <idea.icon size={18} className={styles.ideaIcon} />
            <div>
              <b>{t(`sandbox.idea.${idea.id}`)}</b>
              <span>{t(`sandbox.idea.${idea.id}Detail`)}</span>
              <button className={styles.ideaLink} onClick={() => appModel.openDictionary(idea.command)}>
                {t('sandbox.lookUp', { cmd: idea.command })}
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
          if (window.confirm(t('sandbox.resetConfirm'))) void session.reset();
        }}
      >
        <RotateCcw size={14} /> {t('sandbox.reset')}
      </button>
      <div className={styles.footRow}>
        <button className="btn" onClick={() => session.reveal()}>
          <FolderOpen size={14} /> {t('sandbox.openFolder')}
        </button>
        <button className="btn" onClick={() => appModel.openDictionary()}>
          <BookOpen size={14} /> {t('nav.dictionary')}
        </button>
      </div>
    </div>
  </section>
));
