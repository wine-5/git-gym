import { promises as fs } from 'fs';
import * as path from 'path';
import { pick } from '../i18n';

const MAX_FILES = 500;
const MAX_FILE_BYTES = 1024 * 1024;
const SKIP_DIRS = new Set(['.git', 'node_modules']);

/** .git などを除いたファイルの一覧を / 区切りの相対パスで返す */
export async function listFiles(root: string): Promise<string[]> {
  const files: string[] = [];

  const walk = async (dir: string): Promise<void> => {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      if (files.length >= MAX_FILES) return;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) await walk(full);
      } else if (entry.isFile()) {
        files.push(path.relative(root, full).split(path.sep).join('/'));
      }
    }
  };

  await walk(root);
  return files.sort((a, b) => a.localeCompare(b));
}

export async function readFile(root: string, relative: string): Promise<string | null> {
  const file = resolveInside(root, relative);
  try {
    const stat = await fs.stat(file);
    if (!stat.isFile() || stat.size > MAX_FILE_BYTES) return null;
    return await fs.readFile(file, 'utf8');
  } catch {
    return null;
  }
}

export async function writeFile(root: string, relative: string, content: string): Promise<void> {
  const file = resolveInside(root, relative);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content, 'utf8');
}

export async function deleteFile(root: string, relative: string): Promise<void> {
  await fs.rm(resolveInside(root, relative), { force: true });
}

/** リポジトリの外や .git の中を指すパスは拒否する */
function resolveInside(root: string, relative: string): string {
  const resolved = path.resolve(root, relative);
  const rel = path.relative(root, resolved);
  const first = rel.split(path.sep)[0];
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel) || first === '.git') {
    throw new Error(
      pick({
        ja: `このファイルは扱えません: ${relative}`,
        en: `This file can't be used: ${relative}`,
        zh: `无法处理这个文件：${relative}`,
        ko: `이 파일은 다룰 수 없어요: ${relative}`,
      }),
    );
  }
  return resolved;
}
