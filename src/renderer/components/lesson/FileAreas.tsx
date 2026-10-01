import { FolderOpen, PackageCheck, Archive, ArrowRight, type LucideIcon } from 'lucide-react';
import { iconForPath } from '@data/languages';
import type { FileChange, FileState, RepoSnapshot } from '@shared/repo';
import styles from './FileAreas.module.css';

const STATE_MARK: Record<FileState, { letter: string; label: string; className: string }> = {
  modified: { letter: 'M', label: '変更あり', className: styles.modified },
  untracked: { letter: 'U', label: '新しいファイル（まだ Git が知らない）', className: styles.untracked },
  added: { letter: 'A', label: '追加', className: styles.added },
  deleted: { letter: 'D', label: '削除', className: styles.deleted },
  renamed: { letter: 'R', label: '名前を変更', className: styles.added },
  conflicted: { letter: '!', label: 'コンフリクト（衝突）', className: styles.deleted },
};

export function FileAreas({ repo }: { repo: RepoSnapshot }) {
  return (
    <div className={styles.flow}>
      <Area icon={FolderOpen} color="#e8c46a" title="作業ツリー" sub="編集中のファイル" files={repo.working} />
      <Step command="add" />
      <Area icon={PackageCheck} color="#4cc38a" title="ステージ" sub="次のコミットに入れる" files={repo.staged} />
      <Step command="commit" />
      <div className={styles.area}>
        <AreaHead icon={Archive} color="#5aa9ff" title="リポジトリ" sub="記録された履歴" />
        <div className={styles.repoCount}>
          <b>{repo.commits.length}</b>
          <span>コミット</span>
        </div>
      </div>
    </div>
  );
}

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

function Area({ files, ...head }: { icon: LucideIcon; color: string; title: string; sub: string; files: FileChange[] }) {
  return (
    <div className={styles.area}>
      <AreaHead {...head} />
      {files.length === 0 ? (
        <div className={styles.empty}>からっぽ</div>
      ) : (
        files.map((f) => {
          const mark = STATE_MARK[f.state];
          const icon = iconForPath(f.path);
          return (
            <div key={f.path} className={styles.chip} title={mark.label}>
              {icon && <img src={icon} alt="" />}
              <span className={styles.chipName}>{f.path}</span>
              <span className={`${styles.mark} ${mark.className}`}>{mark.letter}</span>
            </div>
          );
        })
      )}
    </div>
  );
}

function Step({ command }: { command: string }) {
  return (
    <div className={styles.step}>
      <ArrowRight size={16} />
      <code>{command}</code>
    </div>
  );
}
