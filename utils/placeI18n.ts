// utils/placeI18n.ts
export function langSuffix(langCode?: string): 'Ko' | 'En' | 'Jp' | 'Ch' {
    const l = (langCode || 'ko').toLowerCase();
    if (l.startsWith('ko')) return 'Ko';
    if (l.startsWith('en')) return 'En';
    if (l.startsWith('ja')) return 'Jp';
    if (l.startsWith('zh')) return 'Ch';
    return 'Ko';
}

export function pickLocalizedField<T extends Record<string, any>>(
    obj: T | null | undefined,
    base: string,
    langCode?: string
): string {
    if (!obj) return '';
    const suf = langSuffix(langCode);
    const tryKeys = [
        `${base}${suf}`,
        `${base}En`,
        `${base}Ko`,
        `${base}Jp`,
        `${base}Ch`,
        base, // 단일 필드 fallback
    ];
    for (const k of tryKeys) {
        const v = (obj as any)[k];
        if (typeof v === 'string' && v.trim()) return v;
    }
    return '';
}

export const getPlaceName = (place: any, lang?: string) =>
    pickLocalizedField(place, 'name', lang) || place?.name || '';

export const getPlaceAddress = (place: any, lang?: string) =>
    pickLocalizedField(place, 'address', lang) || place?.address || '';
