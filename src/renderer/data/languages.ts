import csharpIcon from 'devicon/icons/csharp/csharp-original.svg';
import cppIcon from 'devicon/icons/cplusplus/cplusplus-original.svg';
import pythonIcon from 'devicon/icons/python/python-original.svg';
import javascriptIcon from 'devicon/icons/javascript/javascript-original.svg';
import typescriptIcon from 'devicon/icons/typescript/typescript-original.svg';
import javaIcon from 'devicon/icons/java/java-original.svg';
import markdownIcon from 'devicon/icons/markdown/markdown-original.svg';

export type LanguageId = 'csharp' | 'cpp' | 'python' | 'javascript' | 'typescript' | 'java';

export interface LanguageDef {
  id: LanguageId;
  label: string;
  /** Monaco の languageId */
  monaco: string;
  /** 言語選択画面に出す想定の用途 */
  usage: string;
  icon: string;
  color: string;
}

export const LANGUAGES: LanguageDef[] = [
  { id: 'csharp', label: 'C#', monaco: 'csharp', usage: 'ゲーム（Unity）', icon: csharpIcon, color: '#9b6bdf' },
  { id: 'cpp', label: 'C++', monaco: 'cpp', usage: 'ゲーム（Unreal Engine）', icon: cppIcon, color: '#5a8fd6' },
  { id: 'python', label: 'Python', monaco: 'python', usage: 'AI・データ分析', icon: pythonIcon, color: '#e8c46a' },
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript', usage: 'Web フロントエンド', icon: javascriptIcon, color: '#f0db4f' },
  { id: 'typescript', label: 'TypeScript', monaco: 'typescript', usage: 'Web・アプリ開発', icon: typescriptIcon, color: '#3e8ee8' },
  { id: 'java', label: 'Java', monaco: 'java', usage: '業務システム・Android', icon: javaIcon, color: '#e76f51' },
];

export function getLanguage(id: LanguageId): LanguageDef {
  return LANGUAGES.find((l) => l.id === id)!;
}

const EXTENSIONS: Record<string, { monaco: string; icon: string }> = {
  cs: { monaco: 'csharp', icon: csharpIcon },
  cpp: { monaco: 'cpp', icon: cppIcon },
  h: { monaco: 'cpp', icon: cppIcon },
  hpp: { monaco: 'cpp', icon: cppIcon },
  py: { monaco: 'python', icon: pythonIcon },
  js: { monaco: 'javascript', icon: javascriptIcon },
  ts: { monaco: 'typescript', icon: typescriptIcon },
  java: { monaco: 'java', icon: javaIcon },
  md: { monaco: 'markdown', icon: markdownIcon },
};

function extensionOf(path: string): string {
  return path.slice(path.lastIndexOf('.') + 1).toLowerCase();
}

/** ファイル拡張子から Monaco の languageId を決める */
export function monacoLanguageForPath(path: string): string {
  return EXTENSIONS[extensionOf(path)]?.monaco ?? 'plaintext';
}

/** ファイル拡張子からアイコン画像を決める（無ければ null） */
export function iconForPath(path: string): string | null {
  return EXTENSIONS[extensionOf(path)]?.icon ?? null;
}
