import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { TerminalSquare, Copy, Check, AlertTriangle, Link2, SlidersHorizontal, BookOpenText, MousePointerClick } from 'lucide-react';
import { appModel } from '@models/AppModel';
import { CATEGORIES, type GitCommand } from '@data/commands';
import { InlineText } from '../InlineText';
import styles from './CommandDetail.module.css';
import { t } from '@i18n/t';

interface Props {
  command: GitCommand;
  onSelectRelated?: (name: string) => void;
  /** コンパクト表示（レッスンの解説で使う） */
  compact?: boolean;
}

/** 1つの git コマンドの解説 */
export const CommandDetail = observer(({ command, onSelectRelated, compact }: Props) => {
  const category = CATEGORIES.find((c) => c.id === command.category)!;

  return (
    <article className={compact ? `${styles.detail} ${styles.compact}` : styles.detail}>
      <header className={styles.header}>
        <span className={styles.category} style={{ color: category.color, background: `${category.color}22` }}>
          {category.label}
        </span>
        <h2 className={styles.name}>git {command.name}</h2>
        <p className={styles.summary}>{command.summary}</p>
      </header>

      <p className={styles.description}>
        <InlineText text={command.description} />
      </p>

      <Section icon={BookOpenText} title={t('cmd.usage')}>
        {command.usage.map((u) => (
          <CommandLine key={u} command={u} />
        ))}
      </Section>

      <Section icon={TerminalSquare} title={t('cmd.examples')}>
        {command.examples.map((e) => (
          <div key={e.command} className={styles.example}>
            <CommandLine command={e.command} />
            <span className={styles.exampleText}>{e.description}</span>
          </div>
        ))}
      </Section>

      {!compact && command.options.length > 0 && (
        <Section icon={SlidersHorizontal} title={t('cmd.options')}>
          <table className={styles.options}>
            <tbody>
              {command.options.map((o) => (
                <tr key={o.flag}>
                  <td>
                    <code>{o.flag}</code>
                  </td>
                  <td>{o.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      {appModel.settings.showSourceTree && command.sourcetree && (
        <div className={styles.sourcetree}>
          <MousePointerClick size={16} />
          <span>
            <b>{t('cmd.sourcetree')}</b>
            {command.sourcetree}
          </span>
        </div>
      )}

      {command.caution && (
        <div className={styles.caution}>
          <AlertTriangle size={16} />
          <span>
            <InlineText text={command.caution} />
          </span>
        </div>
      )}

      {!compact && onSelectRelated && command.related.length > 0 && (
        <Section icon={Link2} title={t('cmd.related')}>
          <div className={styles.related}>
            {command.related.map((r) => (
              <button key={r} className={styles.relatedButton} onClick={() => onSelectRelated(r)}>
                git {r}
              </button>
            ))}
          </div>
        </Section>
      )}
    </article>
  );
});

function Section({ icon: Icon, title, children }: { icon: typeof BookOpenText; title: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>
        <Icon size={14} /> {title}
      </h3>
      {children}
    </section>
  );
}

/** クリックでコピーできるコマンド表示 */
const CommandLine = observer(({ command }: { command: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard?.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button className={styles.commandLine} onClick={copy} title={t('cmd.copy')}>
      <span className={styles.prompt}>$</span>
      <code>{command}</code>
      {copied ? <Check size={14} className={styles.copied} /> : <Copy size={14} className={styles.copyIcon} />}
    </button>
  );
});
