import { FileText } from 'lucide-react';
import { iconForPath } from '@data/languages';

export function FileIcon({ path, size = 15 }: { path: string; size?: number }) {
  const icon = iconForPath(path);
  if (icon) return <img src={icon} alt="" width={size} height={size} style={{ flex: 'none' }} />;
  return <FileText size={size} style={{ flex: 'none', color: 'var(--text-dim)' }} />;
}
