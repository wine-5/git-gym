import { observer } from 'mobx-react-lite';
import { GitBranch, FilePen, Layers, Volume2, VolumeX } from 'lucide-react';
import { appModel } from '@models/AppModel';
import { getLanguage } from '@data/languages';
import styles from './StatusBar.module.css';

export const StatusBar = observer(() => {
  const language = appModel.language ? getLanguage(appModel.language) : null;
  const session =
    appModel.screen === 'lesson' ? appModel.lessonSession : appModel.screen === 'sandbox'
        ? appModel.sandboxSession
        : appModel.screen === 'stage'
          ? appModel.stageEntry?.session
          : null;
  const repo = session?.repo;

  return (
    <footer className={styles.statusbar}>
      {repo?.initialized && (
        <>
          <span className={`${styles.item} ${styles.branch}`}>
            <GitBranch size={13} /> {repo.branch ?? '（ブランチ外）'}
          </span>
          <span className={styles.item}>
            <FilePen size={13} /> 変更 {repo.working.length}
          </span>
          <span className={styles.item}>
            <Layers size={13} /> ステージ {repo.staged.length}
          </span>
        </>
      )}
      <div className={styles.spacer} />
      <button
        className={styles.language}
        onClick={() => appModel.settings.toggleMuted()}
        title={appModel.settings.muted ? '音を出す' : '音を消す'}
      >
        {appModel.settings.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
      {language && (
        <button className={styles.language} onClick={() => appModel.navigate('language')} title="言語を変更">
          <img src={language.icon} alt="" />
          {language.label}
        </button>
      )}
    </footer>
  );
});
