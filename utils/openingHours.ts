import i18n from '@/i18n';

type Hours =
    | string
    | Record<string, string | { open?: string; close?: string; start?: string; end?: string }>
    | Array<string>;

// 요일 순서 (백엔드 키 기준)
const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

function getDaysShort() {
    // i18n에서 { mon, tue, ... } 가져오기 (없으면 기본 값)
    const fall = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
    try {
        const obj = i18n.t('daysShort', { returnObjects: true }) as any;
        return { ...fall, ...(obj || {}) };
    } catch {
        return fall;
    }
}

function closedLabel() {
    try { return i18n.t('place.closed'); } catch { return 'Closed'; }
}

function alwaysOpenLabel() {
    // ko: 24시간 운영, en: Open 24 hours, ja: 24時間営業, zh: 24小时营业
    try { return i18n.t('place.alwaysOpen'); } catch { return 'Open 24 hours'; }
}

function hoursUnknownLabel() {
    try { return i18n.t('place.hoursUnknown'); } catch { return 'Opening hours unavailable'; }
}

function joinRange(a: string, b: string) {
    // 월-금 / Mon–Fri 등 (ko는 하이픈, 그 외 en/ja/zh는 en dash)
    const dash = i18n.language?.startsWith('ko') ? '-' : '–';
    return `${a}${dash}${b}`;
}

const RE_CLOSED = /(^|\s)(closed|휴무|休業|休息)(\s|$)/i;

const RE_24H =
    /(24\s*hours?|24h|24\/7|always\s*open|open\s*24|상시\s*개방|상시\s*운영|항상\s*(개방|영업)|24時間営業|常時開放|24小时营业|全天(开放|营业))/i;

function normalizeValueString(raw: string): string {
    const s = String(raw).trim();
    if (!s) return '';
    if (RE_CLOSED.test(s)) return 'CLOSED';
    if (RE_24H.test(s)) return '24H';
    return s;
}

/**
 * 개요 (다국어 대응):
 * - 문자열/배열/객체 형태의 hours를 받아 언어별 약칭 요일과 함께 요약 문자열 생성
 * - 'closed' → 각 언어의 휴무 라벨로 교체
 * - '24h/24 hours/24/7/always open' → 각 언어의 '24시간 운영'류 라벨로 교체
 * - 같은 시간대 연속 요일은 "월-금 09:00-18:00"처럼 압축, Closed 요일은 뒤에 한번에 요약
 * - 줄바꿈은 '\n' 유지 (한 줄 UI이면 numberOfLines=1로 잘라 쓰면 됨)
 */
export function summarizeOpeningHours(hours: Hours): string {
    const DAYS = getDaysShort();
    const CLOSED = closedLabel();
    const ALWAYS = alwaysOpenLabel();

    if (!hours) return hoursUnknownLabel();

    // --- 1) 문자열 ---
    if (typeof hours === 'string') {
        const norm = normalizeValueString(hours);
        if (norm === 'CLOSED') return CLOSED;
        if (norm === '24H') return ALWAYS;
        return hours;
    }

    // --- 2) 배열 ---
    if (Array.isArray(hours)) {
        const parts = hours
            .filter(Boolean)
            .map(v => {
                const norm = normalizeValueString(String(v));
                if (norm === 'CLOSED') return CLOSED;
                if (norm === '24H') return ALWAYS;
                return String(v);
            });
        return parts.join(', ');
    }

    // --- 3) 객체 (요일별) ---
    type V = string | { open?: string; close?: string; start?: string; end?: string };

    const labelsOf: Record<string, string> = {
        monday: DAYS.mon, tuesday: DAYS.tue, wednesday: DAYS.wed,
        thursday: DAYS.thu, friday: DAYS.fri, saturday: DAYS.sat, sunday: DAYS.sun
    };

    const orderOfLabel = new Map<string, number>(DAY_ORDER.map((d, i) => [labelsOf[d], i]));

    // 요일별 정규화된 레코드 { label: 'Mon', value: '09:00-18:00' | 'CLOSED' | '24H' | '기타' }
    const norm: { label: string; value: string }[] = [];
    for (const d of DAY_ORDER) {
        const src = hours[d] as V | undefined;
        if (!src) continue;
        const label = labelsOf[d];
        let value = '';
        if (typeof src === 'string') {
            value = normalizeValueString(src);
        } else {
            const open = src.open ?? (src as any).start ?? '';
            const close = src.close ?? (src as any).end ?? '';
            value = open && close ? `${open}-${close}` : (open || close || '');
            value = normalizeValueString(value);
        }
        if (!value) continue;
        norm.push({ label, value });
    }
    if (norm.length === 0) return hoursUnknownLabel();

    // 같은 value끼리 연속 묶기
    type Group = { value: string; labels: string[] };
    const groups: Group[] = [];
    for (const { label, value } of norm) {
        const last = groups[groups.length - 1];
        if (!last || last.value !== value) groups.push({ value, labels: [label] });
        else last.labels.push(label);
    }

    // 1) Closed/24H 제외한 그룹 문자열
    const nonSpecialParts = groups
        .filter(g => g.value !== 'CLOSED' && g.value !== '24H')
        .map(g => {
            if (g.labels.length === 1) return `${g.labels[0]} ${g.value}`;
            return `${joinRange(g.labels[0], g.labels[g.labels.length - 1])} ${g.value}`;
        });

    // 2) 24H 요약
    const alwaysLabels = groups
        .filter(g => g.value === '24H')
        .flatMap(g => g.labels);

    const alwaysSummary = summarizeLabels(alwaysLabels, ALWAYS);

    // 3) Closed 요약
    const closedLabels = groups
        .filter(g => g.value === 'CLOSED')
        .flatMap(g => g.labels);

    const closedSummary = summarizeLabels(closedLabels, CLOSED);

    const SEP = '\n';
    const out = [...nonSpecialParts];
    if (alwaysSummary) out.push(alwaysSummary);
    if (closedSummary) out.push(closedSummary);

    return out.length ? out.join(SEP) : hoursUnknownLabel();

    // ---- helpers ----
    function summarizeLabels(labels: string[], valueLabel: string): string | '' {
        if (!labels.length) return '';

        // 요일 순서 정렬
        const sorted = [...labels].sort((a, b) =>
            (orderOfLabel.get(a) ?? 0) - (orderOfLabel.get(b) ?? 0)
        );

        // 연속 구간 묶기
        const ranges: string[][] = [];
        for (const lab of sorted) {
            const last = ranges[ranges.length - 1];
            if (!last) { ranges.push([lab]); continue; }
            const prevIdx = orderOfLabel.get(last[last.length - 1]) ?? -999;
            const curIdx = orderOfLabel.get(lab) ?? -999;
            if (curIdx === prevIdx + 1) last.push(lab);
            else ranges.push([lab]);
        }

        // 한국어 '토·일' 특례 표기
        const isKo = i18n.language?.startsWith('ko');
        const sat = DAYS.sat, sun = DAYS.sun;

        const parts = ranges.map(range => {
            if (range.length === 1) return `${range[0]} ${valueLabel}`;
            if (range.length === 2 && range[0] === sat && range[1] === sun) {
                return isKo ? `${sat}·${sun} ${valueLabel}` : `${joinRange(sat, sun)} ${valueLabel}`;
            }
            return `${joinRange(range[0], range[range.length - 1])} ${valueLabel}`;
        });

        return parts.join(', ');
    }
}
