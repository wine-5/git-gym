import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { monacoLanguageForPath } from '@data/languages';
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

interface Props {
  path: string;
  value: string;
  onChange: (path: string, value: string) => void;
}

/**
 * ファイルごとに Monaco のモデルを持ち、タブ切り替えで差し替える。
 * モデルを使い回すので、タブを切り替えても Undo 履歴やカーソル位置が残る。
 */
export function CodeEditor({ path, value, onChange }: Props) {
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

    const sub = editor.onDidChangeModelContent(() => {
      const model = editor.getModel();
      if (model) onChangeRef.current(model.uri.path.slice(1), model.getValue());
    });

    return () => {
      sub.dispose();
      editor.dispose();
      monaco.editor.getModels().forEach((m) => m.dispose());
      editorRef.current = null;
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

  // git switch / restore などでディスク側が変わったら、Undo できる形で中身を差し替える
  useEffect(() => {
    const model = editorRef.current?.getModel();
    if (!model || model.uri.path.slice(1) !== path || model.getValue() === value) return;
    model.pushEditOperations([], [{ range: model.getFullModelRange(), text: value }], () => null);
  }, [path, value]);

  return <div ref={containerRef} className={styles.editor} />;
}
