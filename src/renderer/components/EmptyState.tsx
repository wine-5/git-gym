import type { LucideIcon } from 'lucide-react';
import styles from './EmptyState.module.css';

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** 次に打つと良いコマンドの例 */
  command?: string;
}

/** 中身がまだ無いパネルに出す案内 */
export function EmptyState({ icon: Icon, title, description, command }: Props) {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>
        <Icon size={26} />
      </div>
      <div className={styles.title}>{title}</div>
      {description && <div className={styles.description}>{description}</div>}
      {command && <code className={styles.command}>{command}</code>}
    </div>
  );
}
