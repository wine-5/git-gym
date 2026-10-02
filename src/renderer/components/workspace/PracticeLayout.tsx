import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';
import {
  DockviewReact,
  themeDark,
  themeLight,
  type DockviewApi,
  type DockviewReadyEvent,
  type IDockviewPanelHeaderProps,
  type IDockviewPanelProps,
} from 'dockview-react';
import 'dockview-react/dist/styles/dockview.css';
import {
  GitGraph,
  FolderTree,
  MousePointerClick,
  Target,
  Swords,
  FlaskConical,
  Files,
  FileCode2,
  TerminalSquare,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { PracticeSession } from '@models/PracticeSession';
import type { ClosablePanelId, DockPanelId, LayoutModel } from '@models/LayoutModel';
import { appModel } from '@models/AppModel';
import { COMMANDS } from '@data/commands';
import { t } from '@i18n/t';
import { CodeEditor } from '../editor/CodeEditor';
import { EditorTabs } from '../editor/EditorTabs';
import { FileTree } from '../editor/FileTree';
import { TerminalPanel } from '../lesson/TerminalPanel';
import { CommitGraph } from '../lesson/CommitGraph';
import { FileAreas } from '../lesson/FileAreas';
import { useVsCodeShortcuts } from '../../hooks/useVsCodeShortcuts';
import styles from './PracticeLayout.module.css';

interface Props {
  session: PracticeSession;
  /** 左の欄（ミッションやフリー練習の案内） */
  left: ReactNode;
}

/** パネルの中身に、今のレッスン（またはフリー練習）を渡す */
const PracticeContext = createContext<Props | null>(null);

function usePractice(): Props {
  const value = useContext(PracticeContext);
  if (!value) throw new Error('PracticeContext がありません');
  return value;
}

/** 保存する配置の形式が変わったら数字を上げる（古い配置は読まずに最初の並びにする） */
const STORAGE_KEY = 'git-gym.dock.v1';
const CLOSABLE: ClosablePanelId[] = ['files', 'terminal', 'graph', 'areas'];
const isClosable = (id: string): id is ClosablePanelId => (CLOSABLE as string[]).includes(id);

/* ---------- パネルの中身 ---------- */

const MissionPanel = observer(() => <div className={styles.fill}>{usePractice().left}</div>);

const FilesPanel = observer(() => {
  const { session } = usePractice();
  return (
    <div className={styles.fill}>
      <FileTree workspace={session.workspace} projectName={session.displayName} fileStates={session.fileStates} />
    </div>
  );
});

const EditorPanel = observer(() => {
  const { workspace, fileStates } = usePractice().session;
  return (
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
  );
});

const TerminalDockPanel = observer(() => {
  const { session } = usePractice();
  const { repo, workspace } = session;
  return (
    <div className={styles.fill}>
      <TerminalPanel
        terminal={session.terminal}
        branch={repo.branch ?? undefined}
        onReveal={() => session.reveal()}
        completion={() => ({
          subcommands: COMMANDS.map((c) => c.name),
          branches: repo.commits.flatMap((c) => c.refs.filter((r) => r.kind !== 'head').map((r) => r.name)),
          files: workspace.paths,
        })}
        fontSize={appModel.settings.terminalFontSize}
      />
    </div>
  );
});

const GraphPanel = observer(() => (
  <div className={styles.scroll}>
    <CommitGraph repo={usePractice().session.repo} />
  </div>
));

const AreasPanel = observer(() => (
  <div className={styles.scroll}>
    <FileAreas repo={usePractice().session.repo} />
  </div>
));

const COMPONENTS: Record<DockPanelId, React.FunctionComponent<IDockviewPanelProps>> = {
  mission: MissionPanel,
  files: FilesPanel,
  editor: EditorPanel,
  terminal: TerminalDockPanel,
  graph: GraphPanel,
  areas: AreasPanel,
};

/* ---------- タブ ---------- */

/** タブの見出し。表示言語を変えたらすぐ切り替わるよう、保存した題名ではなく id から作る */
function tabInfo(id: string): { title: string; icon: LucideIcon } {
  switch (id) {
    case 'mission':
      if (appModel.screen === 'stage') return { title: t('stage.head'), icon: Swords };
      if (appModel.screen === 'sandbox') return { title: t('nav.sandbox'), icon: FlaskConical };
      return { title: t('mission.head'), icon: Target };
    case 'files':
      return { title: t('editor.files'), icon: Files };
    case 'editor':
      return { title: t('dock.editor'), icon: FileCode2 };
    case 'terminal':
      return { title: t('terminal.tab'), icon: TerminalSquare };
    case 'graph':
      return { title: t('layout.graph'), icon: GitGraph };
    default:
      return { title: t('layout.areas'), icon: FolderTree };
  }
}

const DockTab = observer(({ api }: IDockviewPanelHeaderProps) => {
  const { title, icon: Icon } = tabInfo(api.id);
  return (
    <div className={styles.tab} title={t('dock.dragHint')}>
      <Icon size={13} />
      <span>{title}</span>
      {isClosable(api.id) && (
        <button
          className={styles.tabClose}
          title={t('dock.close')}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            appModel.layout.setPanelOpen(api.id as ClosablePanelId, false);
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
});

/* ---------- 配置 ---------- */

/** 最初の配置でのパネルの大きさ（px） */
const INITIAL_SIZE: Partial<Record<DockPanelId, { width?: number; height?: number }>> = {
  mission: { width: 300 },
  files: { width: 200 },
  terminal: { height: 250 },
  graph: { width: 360 },
  areas: { height: 236 },
};

function applyInitialSize(api: DockviewApi, id: DockPanelId): void {
  const size = INITIAL_SIZE[id];
  if (size) api.getPanel(id)?.group.api.setSize(size);
}

/** パネルを、最初の配置での場所に追加する（閉じていたパネルを開き直すときも使う） */
function addPanel(api: DockviewApi, id: DockPanelId): void {
  if (api.getPanel(id)) return;
  const base = { id, component: id, tabComponent: 'tab', title: id };
  const has = (other: DockPanelId) => !!api.getPanel(other);
  switch (id) {
    case 'mission':
      api.addPanel({ ...base, position: { direction: 'left' } });
      break;
    case 'editor':
      api.addPanel({ ...base, position: has('mission') ? { referencePanel: 'mission', direction: 'right' } : { direction: 'right' } });
      break;
    case 'files':
      api.addPanel({ ...base, position: { referencePanel: 'editor', direction: 'left' } });
      break;
    case 'terminal':
      api.addPanel({ ...base, position: { referencePanel: 'editor', direction: 'below' } });
      break;
    case 'graph':
      api.addPanel({
        ...base,
        position: has('areas') ? { referencePanel: 'areas', direction: 'above' } : { direction: 'right' },
      });
      break;
    case 'areas':
      api.addPanel({
        ...base,
        position: has('graph') ? { referencePanel: 'graph', direction: 'below' } : { direction: 'right' },
      });
      break;
  }
  applyInitialSize(api, id);
}

/** 最初の並び：ミッション｜ファイル＋エディタ／ターミナル｜コミットグラフ／ファイルの居場所 */
function buildDefault(api: DockviewApi, layout: LayoutModel): void {
  const order: DockPanelId[] = ['mission', 'editor', 'graph', 'areas', 'files', 'terminal'];
  for (const id of order) if (layout.isPanelOpen(id)) addPanel(api, id);
  // 分割を重ねると先に置いたパネルの大きさが変わるので、最後にもう一度そろえる
  for (const id of order) applyInitialSize(api, id);
  api.getPanel('editor')?.api.setActive();
}

/** 開け閉めの設定（Ctrl+J など）に、実際のパネルを合わせる */
function syncPanels(api: DockviewApi, layout: LayoutModel): void {
  for (const id of CLOSABLE) {
    const panel = api.getPanel(id);
    if (layout.isPanelOpen(id) && !panel) addPanel(api, id);
    if (!layout.isPanelOpen(id) && panel) panel.api.close();
  }
}

function restore(api: DockviewApi, layout: LayoutModel): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      api.fromJSON(JSON.parse(saved));
      // ミッションとエディタが無い配置は壊れているので使わない
      if (api.getPanel('mission') && api.getPanel('editor')) return;
      api.clear();
    }
  } catch {
    api.clear();
  }
  buildDefault(api, layout);
}

function save(api: DockviewApi): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(api.toJSON()));
  } catch {
    // 保存できなくても今回は使える
  }
}

/**
 * レッスン・ステージ・フリー練習で共通の画面。
 * Unity のエディタのように、タブをドラッグしてパネルを上下左右に分割したり、タブとして重ねたり、
 * 別ウィンドウのように浮かせたりできる。境目をドラッグすると大きさも変えられ、配置は保存される。
 */
export const PracticeLayout = observer(({ session, left }: Props) => {
  const { layout } = appModel;
  useVsCodeShortcuts(layout, session.workspace);
  const apiRef = useRef<DockviewApi | null>(null);
  /** 配置をやり直している間は、パネルが消えても「閉じた」扱いにしない */
  const rebuilding = useRef(false);

  const onReady = ({ api }: DockviewReadyEvent) => {
    apiRef.current = api;
    // 開発中だけ、画面確認スクリプトから配置を操作できるようにする
    if (process.env.NODE_ENV === 'development') (window as unknown as { __dock: DockviewApi }).__dock = api;
    rebuilding.current = true;
    restore(api, layout);
    syncPanels(api, layout);
    rebuilding.current = false;
    api.onDidLayoutChange(() => save(api));
    // タブの × やパネルのドラッグで消えたものは、開け閉めの設定にも反映する
    api.onDidRemovePanel((panel) => {
      if (!rebuilding.current && isClosable(panel.id)) layout.setPanelOpen(panel.id, false);
    });
  };

  useEffect(
    () =>
      reaction(
        () => ({ ...layout.open }),
        () => apiRef.current && syncPanels(apiRef.current, layout),
      ),
    [layout],
  );

  useEffect(
    () =>
      reaction(
        () => layout.dockResetCount,
        () => {
          const api = apiRef.current;
          if (!api) return;
          rebuilding.current = true;
          api.clear();
          buildDefault(api, layout);
          rebuilding.current = false;
          save(api);
        },
      ),
    [layout],
  );

  return (
    <PracticeContext.Provider value={{ session, left }}>
      <main className={styles.layout}>
        <DockviewReact
          className={styles.dock}
          theme={appModel.settings.theme === 'light' ? themeLight : themeDark}
          components={COMPONENTS}
          tabComponents={{ tab: DockTab }}
          onReady={onReady}
        />
      </main>
    </PracticeContext.Provider>
  );
});
