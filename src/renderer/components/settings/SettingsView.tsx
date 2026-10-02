import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import type { AppInfo } from '@shared/api';
import {
  Settings,
  Type,
  TerminalSquare,
  LayoutPanelLeft,
  Languages,
  GraduationCap,
  Download,
  Trash2,
  Minus,
  Plus,
  Music,
  Volume2,
  VolumeX,
  Info,
  GitBranch,
  FolderOpen,
  MousePointerClick,
  Moon,
  Sun,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import { appModel } from '@models/AppModel';
import { FONT_SIZE_RANGE } from '@models/SettingsModel';
import { getLanguage } from '@data/languages';
import { CHAPTERS } from '@data/lessons';
import { COMMANDS } from '@data/commands';
import { downloadText, progressCsv } from '@data/exportProgress';
import { VSCODE_SHORTCUTS } from '../../hooks/useVsCodeShortcuts';
import { LOCALES, type Locale } from '@i18n/locale';
import { t } from '@i18n/t';
import styles from './SettingsView.module.css';

export const SettingsView = observer(() => {
  const [info, setInfo] = useState<AppInfo | null>(null);
  useEffect(() => {
    void window.gitGym?.app.info().then(setInfo);
  }, []);
  const { settings, progress } = appModel;
  const language = appModel.language ? getLanguage(appModel.language) : null;
  const totalLessons = CHAPTERS.reduce((n, c) => n + c.lessons.length, 0);
  const learnedCount = COMMANDS.filter((c) => progress.learned.has(c.name)).length;

  const exportCsv = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadText(
      t('settings.exportFileName', { date }),
      progressCsv({ completed: progress.completed, learned: progress.learned, language: language?.label ?? '' }),
    );
  };

  return (
    <main className={styles.settings}>
      <div className={styles.inner}>
        <h1>
          <Settings size={22} /> {t('settings.title')}
        </h1>

        <Group title={t('settings.groupDisplay')}>
          <Row icon={Globe} label={t('settings.language')} note={t('settings.languageNote')}>
            <select
              className={styles.select}
              value={settings.locale}
              onChange={(e) => settings.setLocale(e.target.value as Locale)}
            >
              {LOCALES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </Row>
          <Row icon={settings.theme === 'light' ? Sun : Moon} label={t('settings.theme')} note={t('settings.themeNote')}>
            <div className={styles.segment}>
              <button className={settings.theme === 'dark' ? styles.segmentOn : undefined} onClick={() => settings.setTheme('dark')}>
                <Moon size={14} /> {t('settings.dark')}
              </button>
              <button className={settings.theme === 'light' ? styles.segmentOn : undefined} onClick={() => settings.setTheme('light')}>
                <Sun size={14} /> {t('settings.light')}
              </button>
            </div>
          </Row>
          <Row icon={Type} label={t('settings.editorFontSize')}>
            <Stepper value={settings.editorFontSize} onChange={(v) => settings.setEditorFontSize(v)} />
          </Row>
          <Row icon={TerminalSquare} label={t('settings.terminalFontSize')}>
            <Stepper value={settings.terminalFontSize} onChange={(v) => settings.setTerminalFontSize(v)} />
          </Row>
          <Row
            icon={LayoutPanelLeft}
            label={t('settings.layout')}
            note={t('settings.layoutNote')}
          >
            <button className="btn" onClick={() => (settings.resetLayout(), appModel.layout.resetDock())}>
              {t('settings.layoutReset')}
            </button>
          </Row>
        </Group>

        <Group title={t('settings.groupSound')}>
          <Row icon={Music} label={t('settings.bgmVolume')}>
            <VolumeSlider value={settings.bgmVolume} onChange={(v) => settings.setBgmVolume(v)} />
          </Row>
          <Row icon={Volume2} label={t('settings.seVolume')}>
            <VolumeSlider
              value={settings.seVolume}
              onChange={(v) => settings.setSeVolume(v)}
              onCommit={() => appModel.sound.play('success')}
            />
          </Row>
          <Row icon={settings.muted ? VolumeX : Volume2} label={t('settings.muteAll')} note={t('settings.muteAllNote')}>
            <button className={settings.muted ? 'btn primary' : 'btn'} onClick={() => settings.toggleMuted()}>
              {settings.muted ? t('settings.muted') : t('settings.mute')}
            </button>
          </Row>
        </Group>

        <Group title={t('settings.groupSupport')}>
          <Row
            icon={MousePointerClick}
            label={t('settings.sourceTree')}
            note={t('settings.sourceTreeNote')}
          >
            <button className={settings.showSourceTree ? 'btn primary' : 'btn'} onClick={() => settings.toggleSourceTree()}>
              {settings.showSourceTree ? t('settings.shown') : t('settings.hidden')}
            </button>
          </Row>
        </Group>

        <Group title={t('settings.groupPracticeLanguage')}>
          <Row
            icon={Languages}
            label={language ? language.label : t('settings.notSelected')}
            note={t('settings.practiceLanguageNote')}
            leading={language && <img src={language.icon} alt="" className={styles.langIcon} />}
          >
            <button className="btn" onClick={() => appModel.navigate('language')}>
              {t('settings.change')}
            </button>
          </Row>
        </Group>

        <Group title={t('settings.groupRecord')}>
          <Row
            icon={GraduationCap}
            label={t('settings.recordSummary', {
              lessons: progress.completed.size,
              totalLessons,
              learned: learnedCount,
              totalCommands: COMMANDS.length,
            })}
            note={t('settings.recordNote')}
          >
            <button className="btn primary" onClick={exportCsv}>
              <Download size={14} /> {t('settings.export')}
            </button>
          </Row>
          <Row icon={Trash2} label={t('settings.resetProgress')} note={t('settings.resetProgressNote')} danger>
            <button
              className={`btn ${styles.danger}`}
              onClick={() => {
                if (window.confirm(t('settings.resetProgressConfirm'))) progress.resetAll();
              }}
            >
              {t('settings.reset')}
            </button>
          </Row>
        </Group>

        <Group title={t('settings.groupShortcuts')}>
          <table className={styles.shortcuts}>
            <tbody>
              {VSCODE_SHORTCUTS.map((s) => (
                <tr key={s.id}>
                  <td>
                    <kbd>{s.keys}</kbd>
                  </td>
                  <td>{s.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Group>

        <Group title={t('settings.groupAbout')}>
          <Row icon={Info} label={`Git Gym ${info?.version ?? ''}`} note={t('settings.aboutNote')}>
            <span />
          </Row>
          <Row
            icon={GitBranch}
            label={info?.gitVersion ?? t('settings.gitNotFound')}
            note={info?.gitBundled ? t('settings.gitBundled') : t('settings.gitSystem')}
          >
            <span />
          </Row>
          <Row icon={FolderOpen} label={t('settings.practiceFolder')} note={info?.practiceRoot ?? ''}>
            <span />
          </Row>
        </Group>

        <p className={styles.footer}>
          {t('settings.footer')}
        </p>
      </div>
    </main>
  );
});

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.group}>
      <h2>{title}</h2>
      <div className={styles.card}>{children}</div>
    </section>
  );
}

interface RowProps {
  icon: LucideIcon;
  label: string;
  note?: string;
  danger?: boolean;
  leading?: React.ReactNode;
  children: React.ReactNode;
}

function Row({ icon: Icon, label, note, danger, leading, children }: RowProps) {
  return (
    <div className={styles.row}>
      <div className={danger ? `${styles.rowIcon} ${styles.dangerIcon}` : styles.rowIcon}>{leading ?? <Icon size={18} />}</div>
      <div className={styles.rowText}>
        <b>{label}</b>
        {note && <span>{note}</span>}
      </div>
      {children}
    </div>
  );
}

function VolumeSlider({ value, onChange, onCommit }: { value: number; onChange: (v: number) => void; onCommit?: () => void }) {
  return (
    <div className={styles.volume}>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        onPointerUp={onCommit}
      />
      <span>{Math.round(value * 100)}</span>
    </div>
  );
}

const Stepper = observer(({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  return (
    <div className={styles.stepper}>
      <button onClick={() => onChange(value - 1)} disabled={value <= FONT_SIZE_RANGE.min} title={t('settings.smaller')}>
        <Minus size={14} />
      </button>
      <span>{value}</span>
      <button onClick={() => onChange(value + 1)} disabled={value >= FONT_SIZE_RANGE.max} title={t('settings.larger')}>
        <Plus size={14} />
      </button>
    </div>
  );
});
