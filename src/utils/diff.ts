/**
 * Line-by-line Diff Utility for comparing two Markdown documents
 */

export type DiffChangeType = 'equal' | 'added' | 'removed' | 'modified';

export interface DiffItem {
  id: string;
  type: 'added' | 'removed' | 'modified';
  leftLineNumber?: number;
  rightLineNumber?: number;
  leftContent?: string;
  rightContent?: string;
}

export interface AlignedDiffLine {
  id: string;
  type: DiffChangeType;
  leftLineNumber?: number;
  leftContent?: string;
  rightLineNumber?: number;
  rightContent?: string;
  diffItemId?: string;
}

export interface DiffResult {
  items: DiffItem[];
  alignedLines: AlignedDiffLine[];
  leftLineStatus: Map<number, { type: 'removed' | 'modified'; diffItemId: string }>;
  rightLineStatus: Map<number, { type: 'added' | 'modified'; diffItemId: string }>;
  stats: {
    total: number;
    added: number;
    removed: number;
    modified: number;
    identical: boolean;
  };
}

/**
 * Computes Longest Common Subsequence table for line arrays
 */
function computeLCS(linesA: string[], linesB: string[]): number[][] {
  const m = linesA.length;
  const n = linesB.length;
  // Initialize (m+1) x (n+1) matrix
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (linesA[i - 1] === linesB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

/**
 * Backtracks through LCS matrix to build aligned diff chunks
 */
function backtrackLCS(
  dp: number[][],
  linesA: string[],
  linesB: string[],
  i: number,
  j: number,
  rawChanges: Array<{ type: 'equal' | 'removed' | 'added'; lineA?: string; lineB?: string; lineNumA?: number; lineNumB?: number }>
): void {
  if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
    backtrackLCS(dp, linesA, linesB, i - 1, j - 1, rawChanges);
    rawChanges.push({
      type: 'equal',
      lineA: linesA[i - 1],
      lineB: linesB[j - 1],
      lineNumA: i,
      lineNumB: j,
    });
  } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
    backtrackLCS(dp, linesA, linesB, i, j - 1, rawChanges);
    rawChanges.push({
      type: 'added',
      lineB: linesB[j - 1],
      lineNumB: j,
    });
  } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
    backtrackLCS(dp, linesA, linesB, i - 1, j, rawChanges);
    rawChanges.push({
      type: 'removed',
      lineA: linesA[i - 1],
      lineNumA: i,
    });
  }
}

/**
 * Compares two documents and generates structured diff information
 */
export function compareDocuments(textA: string, textB: string): DiffResult {
  // Normalize newline characters and split into lines
  const linesA = textA.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const linesB = textB.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  const dp = computeLCS(linesA, linesB);
  const rawChanges: Array<{
    type: 'equal' | 'removed' | 'added';
    lineA?: string;
    lineB?: string;
    lineNumA?: number;
    lineNumB?: number;
  }> = [];

  backtrackLCS(dp, linesA, linesB, linesA.length, linesB.length, rawChanges);

  // Group adjacent removed + added into "modified" where appropriate
  const alignedLines: AlignedDiffLine[] = [];
  const items: DiffItem[] = [];
  const leftLineStatus = new Map<number, { type: 'removed' | 'modified'; diffItemId: string }>();
  const rightLineStatus = new Map<number, { type: 'added' | 'modified'; diffItemId: string }>();

  let itemCounter = 1;
  let idx = 0;

  while (idx < rawChanges.length) {
    const cur = rawChanges[idx];

    if (cur.type === 'equal') {
      alignedLines.push({
        id: `eq-${cur.lineNumA}-${cur.lineNumB}`,
        type: 'equal',
        leftLineNumber: cur.lineNumA,
        leftContent: cur.lineA,
        rightLineNumber: cur.lineNumB,
        rightContent: cur.lineB,
      });
      idx++;
      continue;
    }

    // Check if next or sequence is removed followed by added, which represents a modified line
    if (cur.type === 'removed') {
      const next = rawChanges[idx + 1];
      if (next && next.type === 'added') {
        const diffItemId = `diff-${itemCounter++}`;
        const item: DiffItem = {
          id: diffItemId,
          type: 'modified',
          leftLineNumber: cur.lineNumA,
          rightLineNumber: next.lineNumB,
          leftContent: cur.lineA,
          rightContent: next.lineB,
        };
        items.push(item);

        if (cur.lineNumA) {
          leftLineStatus.set(cur.lineNumA, { type: 'modified', diffItemId });
        }
        if (next.lineNumB) {
          rightLineStatus.set(next.lineNumB, { type: 'modified', diffItemId });
        }

        alignedLines.push({
          id: diffItemId,
          type: 'modified',
          leftLineNumber: cur.lineNumA,
          leftContent: cur.lineA,
          rightLineNumber: next.lineNumB,
          rightContent: next.lineB,
          diffItemId,
        });

        idx += 2;
        continue;
      }

      // Standalone removed
      const diffItemId = `diff-${itemCounter++}`;
      const item: DiffItem = {
        id: diffItemId,
        type: 'removed',
        leftLineNumber: cur.lineNumA,
        leftContent: cur.lineA,
      };
      items.push(item);

      if (cur.lineNumA) {
        leftLineStatus.set(cur.lineNumA, { type: 'removed', diffItemId });
      }

      alignedLines.push({
        id: diffItemId,
        type: 'removed',
        leftLineNumber: cur.lineNumA,
        leftContent: cur.lineA,
        diffItemId,
      });

      idx++;
      continue;
    }

    if (cur.type === 'added') {
      // Standalone added
      const diffItemId = `diff-${itemCounter++}`;
      const item: DiffItem = {
        id: diffItemId,
        type: 'added',
        rightLineNumber: cur.lineNumB,
        rightContent: cur.lineB,
      };
      items.push(item);

      if (cur.lineNumB) {
        rightLineStatus.set(cur.lineNumB, { type: 'added', diffItemId });
      }

      alignedLines.push({
        id: diffItemId,
        type: 'added',
        rightLineNumber: cur.lineNumB,
        rightContent: cur.lineB,
        diffItemId,
      });

      idx++;
      continue;
    }

    idx++;
  }

  const addedCount = items.filter((it) => it.type === 'added').length;
  const removedCount = items.filter((it) => it.type === 'removed').length;
  const modifiedCount = items.filter((it) => it.type === 'modified').length;

  return {
    items,
    alignedLines,
    leftLineStatus,
    rightLineStatus,
    stats: {
      total: items.length,
      added: addedCount,
      removed: removedCount,
      modified: modifiedCount,
      identical: items.length === 0,
    },
  };
}
