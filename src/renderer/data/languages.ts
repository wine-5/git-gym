import csharpIcon from 'devicon/icons/csharp/csharp-original.svg';
import cppIcon from 'devicon/icons/cplusplus/cplusplus-original.svg';
import pythonIcon from 'devicon/icons/python/python-original.svg';
import javascriptIcon from 'devicon/icons/javascript/javascript-original.svg';
import typescriptIcon from 'devicon/icons/typescript/typescript-original.svg';
import javaIcon from 'devicon/icons/java/java-original.svg';
import markdownIcon from 'devicon/icons/markdown/markdown-original.svg';
import { t } from '@i18n/t';

export type LanguageId = 'csharp' | 'cpp' | 'python' | 'javascript' | 'typescript' | 'java';

export interface LanguageDef {
  id: LanguageId;
  label: string;
  /** Monaco の languageId */
  monaco: string;
  /** 言語選択画面に出す想定の用途（今の表示言語で返す） */
  readonly usage: string;
  icon: string;
  color: string;
}

function lang(def: Omit<LanguageDef, 'usage'>): LanguageDef {
  return {
    ...def,
    get usage() {
      return t(`langUsage.${def.id}`);
    },
  };
}

export const LANGUAGES: LanguageDef[] = [
  lang({ id: 'csharp', label: 'C#', monaco: 'csharp', icon: csharpIcon, color: '#9b6bdf' }),
  lang({ id: 'cpp', label: 'C++', monaco: 'cpp', icon: cppIcon, color: '#5a8fd6' }),
  lang({ id: 'python', label: 'Python', monaco: 'python', icon: pythonIcon, color: '#e8c46a' }),
  lang({ id: 'javascript', label: 'JavaScript', monaco: 'javascript', icon: javascriptIcon, color: '#f0db4f' }),
  lang({ id: 'typescript', label: 'TypeScript', monaco: 'typescript', icon: typescriptIcon, color: '#3e8ee8' }),
  lang({ id: 'java', label: 'Java', monaco: 'java', icon: javaIcon, color: '#e76f51' }),
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
