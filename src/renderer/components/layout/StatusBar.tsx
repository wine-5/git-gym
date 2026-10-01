import { observer } from 'mobx-react-lite';
import { GitBranch, FilePen, Layers } from 'lucide-react';
import { appModel } from '@models/AppModel';
import { getLanguage } from '@data/languages';
import styles from './StatusBar.module.css';

export const StatusBar = observer(() => {
  const language = appModel.language ? getLanguage(appModel.language) : null;

  return (
    <footer className={styles.statusbar}>
      {appModel.screen === 'lesson' && (
        <>
          <span className={`${styles.item} ${styles.branch}`}>
            <GitBranch size={13} /> feature/jump
          </span>
          <span className={styles.item}>
            <FilePen size={13} /> 変更 {appModel.workspace.modifiedCount}
          </span>
          <span className={styles.item}>
            <Layers size={13} /> ステージ 0
          </span>
        </>
      )}
      <div className={styles.spacer} />
      {language && (
        <button className={styles.language} onClick={() => appModel.navigate('language')} title="言語を変更">
          <img src={language.icon} alt="" />
          {language.label}
        </button>
      )}
    </footer>
  );
});
