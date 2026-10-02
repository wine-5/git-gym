import { MapPin, GitBranch, Cloud, Tag, PencilLine, GitMerge, FolderX, GitCommitHorizontal, type LucideIcon } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { EmptyState } from '../EmptyState';
import { t } from '@i18n/t';
import type { CommitRef, RefKind, RepoSnapshot } from '@shared/repo';
import { assignColumns, type LaidOutCommit } from './graphLayout';
import styles from './CommitGraph.module.css';

const ROW_H = 44;
const COL_W = 22;
const PAD_X = 18;
const NODE_R = 6;
const CORNER = 8;
/** 1つのコミットに並べるラベルの数（多いと切れて読めなくなるので、残りは +N にまとめる） */
const MAX_REFS = 3;
const LANE_COLORS = ['#5aa9ff', '#b48cff', '#4cc38a', '#e8c46a', '#ff8fab', '#4fd1c5'];

const REF_ICONS: Record<RefKind, LucideIcon> = {
  head: MapPin,
  local: GitBranch,
  remote: Cloud,
  tag: Tag,
};

/** ラベルの説明のキー（表示言語に合わせて描画のたびに引く） */
const REF_TITLE_KEYS: Record<RefKind, string> = {
  head: 'graph.ref.head',
  local: 'graph.ref.local',
  remote: 'graph.ref.remote',
  tag: 'graph.ref.tag',
};

const laneColor = (col: number) => LANE_COLORS[col % LANE_COLORS.length];
const cx = (col: number) => PAD_X + col * COL_W;

interface Props {
  repo: RepoSnapshot;
}

export const CommitGraph = observer(({ repo }: Props) => {
  if (!repo.initialized) {
    return (
      <EmptyState
        icon={FolderX}
        title={t('graph.notRepoTitle')}
        description={t('graph.notRepoDesc')}
        command="git init"
      />
    );
  }
  if (repo.commits.length === 0) {
    return (
      <EmptyState
        icon={GitCommitHorizontal}
        title={t('graph.noCommitsTitle')}
        description={t('graph.noCommitsDesc')}
        command={t('graph.commitExample')}
      />
    );
  }

  const commits = assignColumns(repo.commits);
  const pendingCount = repo.working.length + repo.staged.length;
  // 未コミットの変更があれば先頭に「次のコミット」行を出す
  const offset = pendingCount > 0 ? 1 : 0;
  const cy = (row: number) => (row + offset) * ROW_H + ROW_H / 2;

  const maxCol = Math.max(0, ...commits.map((c) => c.col));
  const svgW = cx(Math.max(maxCol, 1)) + PAD_X;
  const svgH = (commits.length + offset) * ROW_H;
  const indexOf = new Map(commits.map((c, i) => [c.hash, i]));
  const headIndex = commits.findIndex((c) => c.refs.some((r) => r.kind === 'head'));

  return (
    <div className={styles.graph}>
      <svg className={styles.svg} width={svgW} height={svgH}>
        {commits.flatMap((c, i) =>
          c.parents.map((parent, p) => {
            const j = indexOf.get(parent);
            if (j === undefined) return null;
            return <Edge key={`${c.hash}-${parent}`} child={c} parent={commits[j]} y1={cy(i)} y2={cy(j)} isMergeParent={p > 0} />;
          }),
        )}

        {offset > 0 && headIndex >= 0 && (
          <line
            x1={cx(commits[headIndex].col)}
            y1={ROW_H / 2 + NODE_R}
            x2={cx(commits[headIndex].col)}
            y2={cy(headIndex) - NODE_R}
            stroke="var(--accent)"
            strokeWidth={2}
            strokeDasharray="3 3"
          />
        )}
        {offset > 0 && headIndex >= 0 && (
          <circle
            cx={cx(commits[headIndex].col)}
            cy={ROW_H / 2}
            r={NODE_R}
            fill="var(--bg-panel)"
            stroke="var(--accent)"
            strokeWidth={2.5}
            strokeDasharray="3 2"
          />
        )}

        {commits.map((c, i) => (
          <Node key={c.hash} commit={c} y={cy(i)} isHead={i === headIndex} />
        ))}
      </svg>

      <div className={styles.rows} style={{ paddingLeft: svgW }}>
        {offset > 0 && (
          <div className={`${styles.row} ${styles.pending}`} style={{ height: ROW_H }}>
            <div className={styles.message}>
              <PencilLine size={13} /> {t('graph.pending')}
            </div>
            <div className={styles.meta}>{t('graph.pendingFiles', { count: pendingCount })}</div>
          </div>
        )}
        {commits.map((c) => (
          <div key={c.hash} className={styles.row} style={{ height: ROW_H }} title={c.message}>
            {c.refs.length > 0 && (
              <div className={styles.refs}>
                {c.refs.slice(0, MAX_REFS).map((r) => (
                  <RefBadge key={r.name} commitRef={r} color={laneColor(c.col)} />
                ))}
                {c.refs.length > MAX_REFS && (
                  <span className={styles.moreRefs} title={c.refs.slice(MAX_REFS).map((r) => r.name).join('\n')}>
                    +{c.refs.length - MAX_REFS}
                  </span>
                )}
              </div>
            )}
            <div className={styles.message}>
              {c.isMerge && <GitMerge size={13} className={styles.mergeIcon} />}
              <span>{c.message}</span>
              <span className={styles.hash}>{c.hash}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

function Edge({ child, parent, y1, y2, isMergeParent }: { child: LaidOutCommit; parent: LaidOutCommit; y1: number; y2: number; isMergeParent: boolean }) {
  const x1 = cx(child.col);
  const x2 = cx(parent.col);

  if (x1 === x2) {
    return <line x1={x1} y1={y1 + NODE_R} x2={x2} y2={y2 - NODE_R} stroke={laneColor(child.col)} strokeWidth={2} />;
  }

  if (!isMergeParent) {
    // 分岐：子の列を下りて、親の高さで親の列へ曲がる
    const color = laneColor(child.col);
    const dir = x2 > x1 ? 1 : -1;
    const d = `M ${x1} ${y1 + NODE_R} V ${y2 - CORNER} Q ${x1} ${y2} ${x1 + dir * CORNER} ${y2} H ${x2 - dir * NODE_R}`;
    return <path d={d} fill="none" stroke={color} strokeWidth={2} />;
  }

  // マージ：取り込まれる側の列を上って、マージコミットへ矢印で合流する
  const color = laneColor(parent.col);
  const dir = x1 > x2 ? 1 : -1;
  const tipX = x1 - dir * NODE_R;
  const baseX = tipX - dir * 6;
  const d = `M ${x2} ${y2 - NODE_R} V ${y1 + CORNER} Q ${x2} ${y1} ${x2 + dir * CORNER} ${y1} H ${baseX}`;
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={2} />
      <polygon points={`${tipX},${y1} ${baseX},${y1 - 4.5} ${baseX},${y1 + 4.5}`} fill={color} />
    </g>
  );
}

function Node({ commit, y, isHead }: { commit: LaidOutCommit; y: number; isHead: boolean }) {
  const x = cx(commit.col);
  const color = laneColor(commit.col);

  return (
    <g>
      {isHead && <circle cx={x} cy={y} r={NODE_R + 5} fill={color} opacity={0.2} />}
      {commit.isMerge ? (
        <polygon points={`${x},${y - 7} ${x + 7},${y} ${x},${y + 7} ${x - 7},${y}`} fill={color} />
      ) : isHead ? (
        <circle cx={x} cy={y} r={NODE_R} fill={color} />
      ) : (
        <circle cx={x} cy={y} r={NODE_R - 1} fill="var(--bg-panel)" stroke={color} strokeWidth={2} />
      )}
    </g>
  );
}

const RefBadge = observer(({ commitRef, color }: { commitRef: CommitRef; color: string }) => {
  const Icon = REF_ICONS[commitRef.kind];
  const style =
    commitRef.kind === 'head'
      ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }
      : commitRef.kind === 'local'
        ? { background: `${color}26`, color, borderColor: `${color}55` }
        : { background: 'transparent', color: 'var(--text-dim)', borderColor: 'var(--border)' };

  return (
    <span className={styles.ref} style={style} title={t(REF_TITLE_KEYS[commitRef.kind])}>
      <Icon size={11} strokeWidth={2.5} />
      {commitRef.name}
    </span>
  );
});
