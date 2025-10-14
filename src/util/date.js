export function fmtDate(v) {
  if (!v) return '—';
  const s = String(v);
  const [yyyy, mm, dd] = s.slice(0, 10).split('-');
  return (yyyy && mm && dd) ? `${dd}-${mm}-${yyyy}` : s;
}
