import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { BookOpen, X, ArrowRight } from 'lucide-react';
import { COMMANDS, type GitCommand } from '@data/commands';
import type { Lesson } from '@data/lessons';
import { CommandDetail } from '../dictionary/CommandDetail';
import { t } from '@i18n/t';
import styles from './ExplainModal.module.css';

/** レッスンの説明・チェック・ヒントに出てくる git コマンドを、出てきた順に集める */
export function commandsInLesson(lesson: Lesson): GitCommand[] {
  const text = [lesson.description, ...lesson.checks.map((c) => c.label), ...lesson.hints].join('\n');
  const names = [...text.matchAll(/git ([a-z][a-z-]*)/g)].map((m) => m[1]);
  return [...new Set(names)].flatMap((n) => COMMANDS.filter((c) => c.name === n));
}

interface Props {
  lesson: Lesson;
  onClose: () => void;
  onOpenDictionary: (command: string) => void;
}

/** レッスンで使うコマンドの解説 */
export const ExplainModal = observer(({ lesson, onClose, onOpenDictionary }: Props) => {
  const commands = commandsInLesson(lesson);
  const [selected, setSelected] = useState(commands[0]?.name);
  const command = commands.find((c) => c.name === selected);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <header className={styles.header}>
          <BookOpen size={18} />
          <span>{t('explain.title', { title: lesson.title })}</span>
          <button className={styles.close} onClick={onClose} title={t('explain.close')}>
            <X size={18} />
          </button>
        </header>

        {commands.length > 1 && (
          <div className={styles.tabs}>
            {commands.map((c) => (
              <button
                key={c.name}
                className={c.name === selected ? styles.tabActive : styles.tab}
                onClick={() => setSelected(c.name)}
              >
                git {c.name}
              </button>
            ))}
          </div>
        )}

        <div className={styles.body}>
          {command ? (
            <CommandDetail command={command} compact />
          ) : (
            <p className={styles.none}>{t('explain.none')}</p>
          )}
        </div>

        {command && (
          <footer className={styles.footer}>
            <button className="btn" onClick={() => onOpenDictionary(command.name)}>
              {t('explain.openDictionary')} <ArrowRight size={14} />
            </button>
          </footer>
        )}
      </div>
    </div>
  );
});
