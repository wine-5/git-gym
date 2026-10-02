import type { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { GitGraph, FolderTree, MousePointerClick } from 'lucide-react';
import type { PracticeSession } from '@models/PracticeSession';
import type { DockPanelId, DockSlotId } from '@models/LayoutModel';
import { appModel } from '@models/AppModel';
import { COMMANDS } from '@data/commands';
import { CodeEditor } from '../editor/CodeEditor';
import { EditorTabs } from '../editor/EditorTabs';
import { FileTree } from '../editor/FileTree';
import { TerminalPanel } from '../lesson/TerminalPanel';
import { CommitGraph } from '../lesson/CommitGraph';
import { FileAreas } from '../lesson/FileAreas';
import { Splitter } from '../layout/Splitter';
import { DockSlot } from './DockSlot';
import { usePanelSize } from '../../hooks/usePanelSize';
import { useVsCodeShortcuts } from '../../hooks/useVsCodeShortcuts';
import { t } from '@i18n/t';
import styles from './PracticeLayout.module.css';

interface Props {
  session: PracticeSession;
  /** 左の欄（ミッションやフリー練習の案内） */
  left: ReactNode;
}

/**
 * レッスンとフリー練習で共通の画面構成：左の欄｜ファイル一覧＋エディタ＋ターミナル｜コミットグラフ＋ファイルの居場所。
 * VS Code のように各パネルの境目をドラッグして大きさを変えられ、
 * Unity のエディタのように見出しをドラッグしてパネルの場所を入れ替えられる（どちらも保存される）。
 */
export const PracticeLayout = observer(({ session, left }: Props) => {
  const leftPanel = usePanelSize('mission', 290, 220, 640);
  const side = usePanelSize('side', 360, 220, 720);
  const tree = usePanelSize('tree', 200, 130, 640);
  const bottomHeight = usePanelSize('terminal', 250, 110, 640);
  const sideBottomHeight = usePanelSize('areas', 236, 120, 640);

  const { workspace, repo, fileStates } = session;
  const { layout } = appModel;
  useVsCodeShortcuts(layout, workspace);

  const panel = (id: DockPanelId): ReactNode => {
    switch (id) {
      case 'mission':
        return left;
      case 'files':
        return <FileTree workspace={workspace} projectName={session.displayName} fileStates={fileStates} />;
      case 'terminal':
        return (
          <TerminalPanel
            terminal={session.terminal}
            branch={repo.branch ?? undefined}
            onReveal={() => session.reveal()}
            onClose={() => layout.setTerminalOpen(false)}
            completion={() => ({
              subcommands: COMMANDS.map((c) => c.name),
              branches: repo.commits.flatMap((c) => c.refs.filter((r) => r.kind !== 'head').map((r) => r.name)),
              files: workspace.paths,
            })}
            fontSize={appModel.settings.terminalFontSize}
          />
        );
      case 'graph':
        return (
          <section className={styles.panel}>
            <div className="panel-head">
              <span className={styles.headLabel}>
                <GitGraph size={13} /> {t('layout.graph')}
              </span>
            </div>
            <div className={styles.scroll}>
              <CommitGraph repo={repo} />
            </div>
          </section>
        );
      case 'areas':
        return (
          <section className={styles.panel}>
            <div className="panel-head">
              <span className={styles.headLabel}>
                <FolderTree size={13} /> {t('layout.areas')}
              </span>
            </div>
            <div className={styles.scroll}>
              <FileAreas repo={repo} />
            </div>
          </section>
        );
    }
  };

  const slot = (id: DockSlotId) => (
    <DockSlot key={id} slot={id} layout={layout}>
      {panel(layout.dock[id])}
    </DockSlot>
  );

  const open = (id: DockSlotId) => layout.isSlotOpen(id);
  const leftOpen = open('left');
  const sideTopOpen = open('sideTop');
  const sideBottomOpen = open('sideBottom');
  const sideOpen = sideTopOpen || sideBottomOpen;

  const columns = [leftOpen && `${leftPanel.size}px auto`, 'minmax(0, 1fr)', sideOpen && `auto ${side.size}px`]
    .filter(Boolean)
    .join(' ');

  return (
    <main className={styles.layout} style={{ gridTemplateColumns: columns }}>
      {leftOpen && (
        <>
          {slot('left')}
          <Splitter direction="columns" {...leftPanel.splitter()} />
        </>
      )}

      <section
        className={styles.center}
        style={{ gridTemplateRows: open('bottom') ? `minmax(0, 1fr) auto ${bottomHeight.size}px` : 'minmax(0, 1fr)' }}
      >
        <div
          className={styles.editorArea}
          style={{ gridTemplateColumns: open('tree') ? `${tree.size}px auto minmax(0, 1fr)` : 'minmax(0, 1fr)' }}
        >
          {open('tree') && (
            <>
              {slot('tree')}
              <Splitter direction="columns" {...tree.splitter()} />
            </>
          )}
          <div className={styles.editor}>
            <EditorTabs workspace={workspace} fileStates={fileStates} />
            {workspace.activePath ? (
              <CodeEditor
                path={workspace.activePath}
                value={workspace.activeContent}
                onChange={(path, value) => workspace.update(path, value)}
                fontSize={appModel.settings.editorFontSize}
                theme={appModel.settings.theme}
              />
            ) : (
              <div className={styles.noFile}>
                <MousePointerClick size={36} />
                {t('layout.noFile')}
              </div>
            )}
          </div>
        </div>
        {open('bottom') && (
          <>
            <Splitter direction="rows" {...bottomHeight.splitter(true)} />
            {slot('bottom')}
          </>
        )}
      </section>

      {sideOpen && (
        <>
          <Splitter direction="columns" {...side.splitter(true)} />
          <section
            className={styles.side}
            style={{
              gridTemplateRows: sideTopOpen && sideBottomOpen ? `minmax(0, 1fr) auto ${sideBottomHeight.size}px` : 'minmax(0, 1fr)',
            }}
          >
            {sideTopOpen && slot('sideTop')}
            {sideTopOpen && sideBottomOpen && <Splitter direction="rows" {...sideBottomHeight.splitter(true)} />}
            {sideBottomOpen && slot('sideBottom')}
          </section>
        </>
      )}
    </main>
  );
});
