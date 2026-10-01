import type { RepoSnapshot } from '@shared/repo';

/** Git 連携を実装するまでの仮データ */
export function createMockRepo(featureFile: string): RepoSnapshot {
  return {
    initialized: true,
    branch: 'feature/jump',
    commits: [
      {
        hash: 'e51b7d0',
        message: "Merge branch 'feature/damage'",
        parents: ['a3f9c21', '9d2e4b8'],
        refs: [
          { name: 'HEAD', kind: 'head' },
          { name: 'feature/jump', kind: 'local' },
          { name: 'main', kind: 'local' },
        ],
      },
      { hash: 'a3f9c21', message: 'README を更新', parents: ['7be0d14'], refs: [] },
      { hash: '9d2e4b8', message: 'ダメージ処理を追加', parents: ['7be0d14'], refs: [{ name: 'feature/damage', kind: 'local' }] },
      { hash: '7be0d14', message: 'Player クラスを作成', parents: ['0c41e8a'], refs: [{ name: 'origin/main', kind: 'remote' }] },
      { hash: '0c41e8a', message: '最初のコミット', parents: [], refs: [{ name: 'v0.1', kind: 'tag' }] },
    ],
    working: [{ path: featureFile, state: 'modified' }],
    staged: [],
  };
}
