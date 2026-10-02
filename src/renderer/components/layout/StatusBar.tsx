import { observer } from 'mobx-react-lite';
import { GitBranch, FilePen, Layers, Volume2, VolumeX, TerminalSquare, PanelLeft, PanelRight } from 'lucide-react';
import { appModel } from '@models/AppModel';
import { getLanguage } from '@data/languages';
import styles from './StatusBar.module.css';
import { t } from '@i18n/t';

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
            <GitBranch size={13} /> {repo.branch ?? t('status.detached')}
          </span>
          <span className={styles.item}>
            <FilePen size={13} /> {t('status.changes', { n: repo.working.length })}
          </span>
          <span className={styles.item}>
            <Layers size={13} /> {t('status.staged', { n: repo.staged.length })}
          </span>
        </>
      )}
      <div className={styles.spacer} />
      {session && (
        <>
          <button
            className={appModel.layout.explorerOpen ? `${styles.language} ${styles.on}` : styles.language}
            onClick={() => appModel.layout.toggleExplorer()}
            title={t('status.toggleExplorer')}
          >
            <PanelLeft size={14} />
          </button>
          <button
            className={appModel.layout.terminalOpen ? `${styles.language} ${styles.on}` : styles.language}
            onClick={() => appModel.layout.toggleTerminal()}
            title={t('status.toggleTerminal')}
          >
            <TerminalSquare size={14} />
          </button>
          <button
            className={appModel.layout.sideOpen ? `${styles.language} ${styles.on}` : styles.language}
            onClick={() => appModel.layout.toggleSide()}
            title={t('status.toggleSide')}
          >
            <PanelRight size={14} />
          </button>
        </>
      )}
      <button
        className={styles.language}
        onClick={() => appModel.settings.toggleMuted()}
        title={appModel.settings.muted ? t('status.unmute') : t('status.mute')}
      >
        {appModel.settings.muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
      {language && (
        <button className={styles.language} onClick={() => appModel.navigate('language')} title={t('status.changeLanguage')}>
          <img src={language.icon} alt="" />
          {language.label}
        </button>
      )}
    </footer>
  );
});
