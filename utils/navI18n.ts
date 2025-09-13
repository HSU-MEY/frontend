// src/utils/navI18n.ts
export type Locale = 'ko'|'en'|'ja'|'zh';
export function normalizeLang(lang?: string): Locale {
  const l = (lang || 'ko').toLowerCase();
  if (l.startsWith('ja')) return 'ja';   // 필요하면 'en' 으로 폴백시켜도 됨
  if (l.startsWith('zh')) return 'zh';   // 필요하면 'en' 으로 폴백시켜도 됨
  if (l.startsWith('en')) return 'en';
  return 'ko';
}

const TOKEN = {
  en: { WALK:'Walk', BUS:'Bus', SUBWAY:'Subway', RAIL:'Train', ORIGIN:'Origin', DEST:'Destination', DOT:' · ', ARROW:' → ' },
  ko: { WALK:'도보', BUS:'버스', SUBWAY:'지하철', RAIL:'기차', ORIGIN:'출발지', DEST:'도착지', DOT:' · ', ARROW:' → ' },
  ja: { WALK:'徒歩', BUS:'バス', SUBWAY:'地下鉄', RAIL:'列車', ORIGIN:'出発地', DEST:'到着地', DOT:' ・ ', ARROW:' → ' },
  zh: { WALK:'步行', BUS:'公交', SUBWAY:'地铁', RAIL:'火车', ORIGIN:'起点', DEST:'终点', DOT:' · ', ARROW:' → ' },
} as const;

export function localizeSummary(summary: string, lang?: string) {
  const L = TOKEN[normalizeLang(lang)];
  return summary
    .replace(/도보/g, L.WALK)
    .replace(/버스/g, L.BUS)
    .replace(/지하철/g, L.SUBWAY)
    .replace(/기차/g, L.RAIL)
    .replace(/ → /g, L.ARROW);
}

export function localizeInstruction(instr: string, lang?: string) {
  const L = TOKEN[normalizeLang(lang)];
  return instr
    .replace(/도보 이동/g, `${L.WALK}${L.DOT}`.trim())
    .replace(/버스 이동/g, `${L.BUS}${L.DOT}`.trim())
    .replace(/지하철 이동/g, `${L.SUBWAY}${L.DOT}`.trim())
    .replace(/기차 이동/g, `${L.RAIL}${L.DOT}`.trim())
    .replace(/출발지/g, L.ORIGIN)
    .replace(/도착지/g, L.DEST)
    .replace(/ · /g, L.DOT);
}

export function formatMinutes(min: number, lang?: string) {
  const l = normalizeLang(lang);
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (l === 'en') return (h ? `${h}h ` : '') + (m ? `${m}m` : h ? '' : '0m');
  if (l === 'ja') return (h ? `${h}時間` : '') + (m ? `${m}分` : h ? '' : '0分');
  if (l === 'zh') return (h ? `${h}小时` : '') + (m ? `${m}分` : h ? '' : '0分');
  return (h ? `${h}시간 ` : '') + (m ? `${m}분` : h ? '' : '0분');
}

export function formatMeters(m: number, lang?: string) {
  const l = normalizeLang(lang);
  if (l === 'zh') return `${Math.round(m)}米`;
  return `${Math.round(m)}m`;
}

export function formatDistanceMeters(m: number, lang?: string) {
  const km = m / 1000;
  const l = normalizeLang(lang);
  const unit = l === 'zh' ? '公里' : 'km';
  return `${km.toFixed(1)}${unit}`;
}

export function formatCurrencyKRW(value: number, lang?: string) {
  try {
    return new Intl.NumberFormat(normalizeLang(lang), { style: 'currency', currency: 'KRW' }).format(value);
  } catch {
    return `₩${value.toLocaleString()}`;
  }
}
