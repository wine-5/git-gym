import { Construction } from 'lucide-react';

export function ComingSoon({ title }: { title: string }) {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        color: 'var(--text-dim)',
      }}
    >
      <Construction size={48} color="var(--yellow)" />
      <div style={{ fontSize: 18, color: 'var(--text)', fontWeight: 600 }}>{title}</div>
      <div>この画面は準備中です</div>
    </main>
  );
}
