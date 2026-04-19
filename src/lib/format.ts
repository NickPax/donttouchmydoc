export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : decimals)} ${units[i]}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  requestAnimationFrame(() => {
    a.remove();
    URL.revokeObjectURL(url);
  });
}

export function parseRanges(input: string, maxPage: number): number[][] {
  const result: number[][] = [];
  if (!input.trim()) return result;
  const parts = input.split(',').map((s) => s.trim()).filter(Boolean);
  for (const p of parts) {
    const m = p.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      const a = Math.max(1, Math.min(maxPage, parseInt(m[1], 10)));
      const b = Math.max(1, Math.min(maxPage, parseInt(m[2], 10)));
      const [lo, hi] = a <= b ? [a, b] : [b, a];
      const range: number[] = [];
      for (let i = lo; i <= hi; i++) range.push(i);
      if (range.length) result.push(range);
      continue;
    }
    const n = parseInt(p, 10);
    if (Number.isFinite(n) && n >= 1 && n <= maxPage) {
      result.push([n]);
    }
  }
  return result;
}
