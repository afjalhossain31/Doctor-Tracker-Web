export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export const fmtDay = (key) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });

export const initials = (name = '') =>
  name.replace(/^Dr\.?\s*/i, '').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export const CHART_COLORS = ['#0E7C7B', '#E8A33D', '#D1495B', '#6C5B9E', '#3A86C8', '#7A8B8A'];

export const toneFor = (text = '') => {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) % 997;
  return h % 5;
};
