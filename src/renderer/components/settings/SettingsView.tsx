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
  type LucideIcon,
} from 'lucide-react';
import { appModel } from '@models/AppModel';
import { FONT_SIZE_RANGE } from '@models/SettingsModel';
import { getLanguage } from '@data/languages';
import { CHAPTERS } from '@data/lessons';
import { COMMANDS } from '@data/commands';
import { downloadText, progressCsv } from '@data/exportProgress';
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
      `git-gym-学習記録-${date}.csv`,
      progressCsv({ completed: progress.completed, learned: progress.learned, language: language?.label ?? '' }),
    );
  };

  return (
    <main className={styles.settings}>
      <div className={styles.inner}>
        <h1>
          <Settings size={22} /> 設定
        </h1>

        <Group title="表示">
          <Row icon={Type} label="エディタの文字の大きさ">
            <Stepper value={settings.editorFontSize} onChange={(v) => settings.setEditorFontSize(v)} />
          </Row>
          <Row icon={TerminalSquare} label="ターミナルの文字の大きさ">
            <Stepper value={settings.terminalFontSize} onChange={(v) => settings.setTerminalFontSize(v)} />
          </Row>
          <Row icon={LayoutPanelLeft} label="パネルの大きさ" note="ドラッグで変えた大きさを最初の状態に戻します">
            <button className="btn" onClick={() => settings.resetLayout()}>
              元に戻す
            </button>
          </Row>
        </Group>

        <Group title="サウンド">
          <Row icon={Music} label="BGM の音量">
            <VolumeSlider value={settings.bgmVolume} onChange={(v) => settings.setBgmVolume(v)} />
          </Row>
          <Row icon={Volume2} label="効果音の音量">
            <VolumeSlider
              value={settings.seVolume}
              onChange={(v) => settings.setSeVolume(v)}
              onCommit={() => appModel.sound.play('success')}
            />
          </Row>
          <Row icon={settings.muted ? VolumeX : Volume2} label="すべての音を消す" note="授業中など、音を出せないときに">
            <button className={settings.muted ? 'btn primary' : 'btn'} onClick={() => settings.toggleMuted()}>
              {settings.muted ? 'ミュート中' : 'ミュートする'}
            </button>
          </Row>
        </Group>

        <Group title="練習する言語">
          <Row
            icon={Languages}
            label={language ? language.label : '未選択'}
            note="練習用プロジェクトのコードがこの言語になります"
            leading={language && <img src={language.icon} alt="" className={styles.langIcon} />}
          >
            <button className="btn" onClick={() => appModel.navigate('language')}>
              変更する
            </button>
          </Row>
        </Group>

        <Group title="学習の記録">
          <Row
            icon={GraduationCap}
            label={`クリアしたレッスン ${progress.completed.size} / ${totalLessons}　・　習得したコマンド ${learnedCount} / ${COMMANDS.length}`}
            note="CSV で書き出すと、Excel などで開いて先生に提出できます"
          >
            <button className="btn primary" onClick={exportCsv}>
              <Download size={14} /> 書き出す
            </button>
          </Row>
          <Row icon={Trash2} label="進み具合をリセット" note="クリアの記録と習得したコマンドがすべて消えます" danger>
            <button
              className={`btn ${styles.danger}`}
              onClick={() => {
                if (window.confirm('進み具合をすべて消しますか？\nこの操作は元に戻せません。')) progress.resetAll();
              }}
            >
              リセット
            </button>
          </Row>
        </Group>

        <Group title="アプリについて">
          <Row icon={Info} label={`Git Gym ${info?.version ?? ''}`} note="Git のコマンドを体験しながら覚える学習アプリ">
            <span />
          </Row>
          <Row
            icon={GitBranch}
            label={info?.gitVersion ?? 'Git が見つかりません'}
            note={info?.gitBundled ? 'アプリに同梱した Git を使っています' : 'この PC にインストールされている Git を使っています'}
          >
            <span />
          </Row>
          <Row icon={FolderOpen} label="練習用フォルダ" note={info?.practiceRoot ?? ''}>
            <span />
          </Row>
        </Group>

        <p className={styles.footer}>
          練習用のリポジトリはすべて本物の Git リポジトリです。エクスプローラーや SourceTree でも開けます。
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

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className={styles.stepper}>
      <button onClick={() => onChange(value - 1)} disabled={value <= FONT_SIZE_RANGE.min} title="小さく">
        <Minus size={14} />
      </button>
      <span>{value}</span>
      <button onClick={() => onChange(value + 1)} disabled={value >= FONT_SIZE_RANGE.max} title="大きく">
        <Plus size={14} />
      </button>
    </div>
  );
}
