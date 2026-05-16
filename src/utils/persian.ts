const FA = '۰۱۲۳۴۵۶۷۸۹';

export function toPersian(n: number, pad = 2): string {
  return String(n).padStart(pad, '0').replace(/\d/g, d => FA[+d]);
}
