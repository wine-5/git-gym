export interface ConflictRegion {
  /** <<<<<<< の行（1始まり） */
  start: number;
  /** ======= の行 */
  separator: number;
  /** >>>>>>> の行 */
  end: number;
}

/** ファイル中のコンフリクト（<<<<<<< 〜 >>>>>>>）の位置を探す */
export function findConflicts(text: string): ConflictRegion[] {
  const regions: ConflictRegion[] = [];
  let start = 0;
  let separator = 0;

  text.split('\n').forEach((line, i) => {
    const n = i + 1;
    if (line.startsWith('<<<<<<<')) {
      start = n;
      separator = 0;
    } else if (line.startsWith('=======') && start) {
      separator = n;
    } else if (line.startsWith('>>>>>>>') && start && separator) {
      regions.push({ start, separator, end: n });
      start = 0;
    }
  });
  return regions;
}
