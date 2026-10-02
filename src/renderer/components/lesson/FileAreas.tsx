import { observer } from 'mobx-react-lite';
import { FolderOpen, PackageCheck, Archive, ArrowRight, type LucideIcon } from 'lucide-react';
import { iconForPath } from '@data/languages';
import type { FileChange, RepoSnapshot } from '@shared/repo';
import { FILE_STATE_MARKS } from '../fileStates';
import { t } from '@i18n/t';
import styles from './FileAreas.module.css';

export const FileAreas = observer(({ repo }: { repo: RepoSnapshot }) => {
  return (
    <div className={styles.flow}>
      <Area icon={FolderOpen} color="#e8c46a" title={t('areas.working')} sub={t('areas.workingSub')} files={repo.working} />
      <Step command="add" />
      <Area icon={PackageCheck} color="#4cc38a" title={t('areas.staged')} sub={t('areas.stagedSub')} files={repo.staged} />
      <Step command="commit" />
      <div className={styles.area}>
        <AreaHead icon={Archive} color="#5aa9ff" title={t('areas.repo')} sub={t('areas.repoSub')} />
        <div className={styles.repoCount}>
          <b>{repo.commits.length}</b>
          <span>{t('areas.commits')}</span>
        </div>
      </div>
    </div>
  );
});

function AreaHead({ icon: Icon, color, title, sub }: { icon: LucideIcon; color: string; title: string; sub: string }) {
  return (
    <div className={styles.head}>
      <div className={styles.icon} style={{ color, background: `${color}22` }}>
        <Icon size={18} />
      </div>
      <div className={styles.title}>{title}</div>
      <div className={styles.sub}>{sub}</div>
    </div>
  );
}

const Area = observer(({ files, ...head }: { icon: LucideIcon; color: string; title: string; sub: string; files: FileChange[] }) => {
  return (
    <div className={styles.area}>
      <AreaHead {...head} />
      {files.length === 0 ? (
        <div className={styles.empty}>{t('areas.empty')}</div>
      ) : (
        files.map((f) => {
          const mark = FILE_STATE_MARKS[f.state];
          const icon = iconForPath(f.path);
          return (
            <div key={f.path} className={styles.chip} title={mark.label}>
              {icon && <img src={icon} alt="" />}
              <span className={styles.chipName}>{f.path}</span>
              <span className={styles.mark} style={{ color: mark.color }}>
                {mark.letter}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
});

function Step({ command }: { command: string }) {
  return (
    <div className={styles.step}>
      <ArrowRight size={16} />
      <code>{command}</code>
    </div>
  );
}
