import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { monacoLanguageForPath } from '@data/languages';
import { findConflicts } from './conflictRegions';
import styles from './CodeEditor.module.css';

monaco.editor.defineTheme('git-gym', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#1b1c20',
    'editor.lineHighlightBackground': '#ffffff08',
    'editorLineNumber.foreground': '#6c6d78',
    'editorLineNumber.activeForeground': '#e4e4e8',
    'editorCursor.foreground': '#f05033',
  },
});

/** コンフリクトの「今のブランチ側」「取り込む側」を色分けし、目印の行に説明を添える */
function conflictDecorations(model: monaco.editor.ITextModel): monaco.editor.IModelDeltaDecoration[] {
  const whole = (line: number, className: string, note?: string): monaco.editor.IModelDeltaDecoration => ({
    // 説明は行末に出すので、範囲は行全体にする（空の範囲だと after が描画されない）
    range: new monaco.Range(line, 1, line, model.getLineMaxColumn(line)),
    options: {
      isWholeLine: true,
      className,
      after: note ? { content: note, inlineClassName: 'gg-conflict-note' } : undefined,
    },
  });
  return findConflicts(model.getValue()).flatMap((r) => {
    const out = [
      whole(r.start, 'gg-conflict-marker', '   ▼ 今のブランチの内容'),
      whole(r.separator, 'gg-conflict-marker', '   ▲ 今のブランチ ／ ▼ 取り込むブランチ'),
      whole(r.end, 'gg-conflict-marker', '   ▲ 取り込もうとしたブランチの内容'),
    ];
    for (let l = r.start + 1; l < r.separator; l++) out.push(whole(l, 'gg-conflict-current'));
    for (let l = r.separator + 1; l < r.end; l++) out.push(whole(l, 'gg-conflict-incoming'));
    return out;
  });
}

/** いま表示しているエディタ（ショートカットの Ctrl+1 でフォーカスするため） */
let activeEditor: monaco.editor.IStandaloneCodeEditor | null = null;

export function focusEditor(): void {
  activeEditor?.focus();
}

interface Props {
  path: string;
  value: string;
  onChange: (path: string, value: string) => void;
  fontSize?: number;
}

/**
 * ファイルごとに Monaco のモデルを持ち、タブ切り替えで差し替える。
 * モデルを使い回すので、タブを切り替えても Undo 履歴やカーソル位置が残る。
 */
export function CodeEditor({ path, value, onChange, fontSize = 14 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const viewStates = useRef(new Map<string, monaco.editor.ICodeEditorViewState | null>());
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const editor = monaco.editor.create(containerRef.current!, {
      theme: 'git-gym',
      model: null,
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: "'Cascadia Code', Consolas, Menlo, monospace",
      automaticLayout: true,
      scrollBeyondLastLine: false,
      padding: { top: 10, bottom: 10 },
      tabSize: 4,
      renderWhitespace: 'selection',
      smoothScrolling: true,
    });
    editorRef.current = editor;
    activeEditor = editor;
    const conflicts = editor.createDecorationsCollection();
    const refreshConflicts = () => {
      const model = editor.getModel();
      conflicts.set(model ? conflictDecorations(model) : []);
    };

    const sub = editor.onDidChangeModelContent(() => {
      const model = editor.getModel();
      if (model) onChangeRef.current(model.uri.path.slice(1), model.getValue());
      refreshConflicts();
    });
    const modelSub = editor.onDidChangeModel(refreshConflicts);

    return () => {
      sub.dispose();
      modelSub.dispose();
      editor.dispose();
      monaco.editor.getModels().forEach((m) => m.dispose());
      editorRef.current = null;
      if (activeEditor === editor) activeEditor = null;
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const current = editor.getModel();
    if (current) viewStates.current.set(current.uri.path.slice(1), editor.saveViewState());

    const uri = monaco.Uri.file(path);
    const model = monaco.editor.getModel(uri) ?? monaco.editor.createModel(value, monacoLanguageForPath(path), uri);
    editor.setModel(model);
    const viewState = viewStates.current.get(path);
    if (viewState) editor.restoreViewState(viewState);
    editor.focus();
    // value はモデル作成時の初期値としてだけ使う
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  useEffect(() => {
    editorRef.current?.updateOptions({ fontSize });
  }, [fontSize]);

  // git switch / restore などでディスク側が変わったら、Undo できる形で中身を差し替える
  useEffect(() => {
    const model = editorRef.current?.getModel();
    if (!model || model.uri.path.slice(1) !== path || model.getValue() === value) return;
    model.pushEditOperations([], [{ range: model.getFullModelRange(), text: value }], () => null);
  }, [path, value]);

  return <div ref={containerRef} className={styles.editor} />;
}
