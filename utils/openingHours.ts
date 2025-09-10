import i18n from '@/i18n';

type Hours =
    | string
    | Record<string, string | { open?: string; close?: string; start?: string; end?: string }>
    | Array<string>;

const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS: Record<string, keyof ReturnType<typeof getDaysShort>> = {
    monday: 'mon', tuesday: 'tue', wednesday: 'wed', thursday: 'thu',
    friday: 'fri', saturday: 'sat', sunday: 'sun',
};

function getDaysShort() {
    // i18n에서 { mon, tue, ... } 가져오기 (없으면 기본 값)
    const fall = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
    try {
        const obj = i18n.t('daysShort', { returnObjects: true }) as any;
        return { ...fall, ...(obj || {}) };
    } catch { return fall; }
}

function closedLabel() {
    try { return i18n.t('place.closed'); } catch { return 'Closed'; }
}

function joinRange(a: string, b: string) {
    // 월-금 / Mon–Fri 등
    const dash = i18n.language.startsWith('ko') ? '-' : '–';
    return `${a}${dash}${b}`;
}

function formatList(items: string[]) {
    // '월·화·수' / 'Mon, Tue, Wed'
    if (i18n.language.startsWith('ko')) return items.join('·');
    return items.join(', ');
}

/** 개요:
 * - 모든 요일을 순서대로 읽어 value(normalized)를 만든다
 * - closed 요일 분리
 * - 같은 시간대끼리 묶어서 "월-금 09:00-18:00" 처럼 압축
 * - 토/일 휴무면 ", 토·일 휴무" 추가
 */
export function summarizeOpeningHours(hours: Hours): string {
    const DAYS = getDaysShort();
    const CLOSED = closedLabel();

    if (!hours) return tryT('place.hoursUnknown', 'Opening hours unavailable');

    if (typeof hours === 'string') {
        return /closed/i.test(hours) ? CLOSED : hours;
    }
    if (Array.isArray(hours)) {
        const s = hours.filter(Boolean).join(', ');
        return s.replace(/closed/ig, CLOSED);
    }

    // 객체 케이스
    type V = string | { open?: string; close?: string; start?: string; end?: string };
    const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
    const LABEL_OF: Record<string, string> = {
        monday: DAYS.mon, tuesday: DAYS.tue, wednesday: DAYS.wed,
        thursday: DAYS.thu, friday: DAYS.fri, saturday: DAYS.sat, sunday: DAYS.sun
    };
    const ORDER_OF_LABEL = new Map<string, number>(
        DAY_ORDER.map((d, i) => [LABEL_OF[d], i])
    );

    const norm: { label: string; value: string }[] = [];
    for (const d of DAY_ORDER) {
        const src = hours[d] as V | undefined;
        if (!src) continue;
        const label = LABEL_OF[d];
        let value = '';
        if (typeof src === 'string') value = src;
        else {
            const open = src.open ?? (src as any).start ?? '';
            const close = src.close ?? (src as any).end ?? '';
            value = open && close ? `${open}-${close}` : (open || close || '');
        }
        if (!value) continue;
        if (/closed/i.test(value)) value = CLOSED;
        norm.push({ label, value });
    }
    if (norm.length === 0) return tryT('place.hoursUnknown', 'Opening hours unavailable');

    // 같은 value끼리 연속 묶기
    type Group = { value: string; labels: string[] };
    const groups: Group[] = [];
    for (const { label, value } of norm) {
        const last = groups[groups.length - 1];
        if (!last || last.value !== value) groups.push({ value, labels: [label] });
        else last.labels.push(label);
    }

    // 1) Closed가 아닌 파트만 먼저 문자열로
    const nonClosedParts = groups
        .filter(g => g.value !== CLOSED)
        .map(g => {
            if (g.labels.length === 1) return `${g.labels[0]} ${g.value}`;
            return `${joinRange(g.labels[0], g.labels[g.labels.length - 1])} ${g.value}`;
        });

    // 2) Closed 라벨만 모아 한 번만 요약
    const closedLabels = groups
        .filter(g => g.value === CLOSED)
        .flatMap(g => g.labels);

    const closedSummary = summarizeClosedLabels(closedLabels);

    const SEP = '\n';

    return closedSummary
        ? [...nonClosedParts, closedSummary].join(SEP)
        : nonClosedParts.join(SEP);

    // ---- helpers ----
    function summarizeClosedLabels(labels: string[]): string | '' {
        if (!labels.length) return '';

        // 라벨을 요일 순서로 정렬
        const sorted = [...labels].sort((a, b) =>
            (ORDER_OF_LABEL.get(a) ?? 0) - (ORDER_OF_LABEL.get(b) ?? 0)
        );

        // 연속 구간으로 합치기
        const ranges: string[][] = [];
        for (const lab of sorted) {
            const last = ranges[ranges.length - 1];
            if (!last) { ranges.push([lab]); continue; }
            const prevIdx = ORDER_OF_LABEL.get(last[last.length - 1]) ?? -999;
            const curIdx = ORDER_OF_LABEL.get(lab) ?? -999;
            if (curIdx === prevIdx + 1) last.push(lab);
            else ranges.push([lab]);
        }

        // 한국어 주말 특별 처리: 토·일 휴무 (중복 방지)
        const isKo = i18n.language?.startsWith('ko');
        const sat = DAYS.sat, sun = DAYS.sun;

        const parts = ranges.map(range => {
            if (range.length === 1) return `${range[0]} ${CLOSED}`;

            // range가 정확히 [토, 일]이면 한국어는 "토·일 휴무", 그 외는 "Sat–Sun Closed"
            if (range.length === 2 && range[0] === sat && range[1] === sun) {
                return isKo ? `${sat}·${sun} ${CLOSED}` : `${joinRange(sat, sun)} ${CLOSED}`;
            }
            return `${joinRange(range[0], range[range.length - 1])} ${CLOSED}`;
        });

        // Closed 요약은 여러 구간일 수도 있음(예: 월-수 휴무, 금 휴무)
        return parts.join(', ');
    }

    function tryT(key: string, fallback: string) {
        try { return i18n.t(key) as string; } catch { return fallback; }
    }
}
