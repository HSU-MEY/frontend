import i18n from '@/i18n';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { fetchPopularPlaces, PopularPlaceDTO } from '@/api/places.service';

// 언어 정규화 다국어 선택
function normalizeUiLang(lang?: string): 'ko' | 'en' | 'ja' | 'zh' {
  const l = (lang || 'ko').toLowerCase();
  if (l.startsWith('ko')) return 'ko';
  if (l.startsWith('en')) return 'en';
  if (l.startsWith('ja')) return 'ja';
  if (l.startsWith('zh')) return 'zh';
  return 'ko';
}

function pickByLang4(
  uiLang: 'ko' | 'en' | 'ja' | 'zh',
  ko?: string | null,
  en?: string | null,
  ja?: string | null,
  zh?: string | null
): string {
  const by = { ko, en, ja, zh } as const;
  const candidates = [by[uiLang], ko, en, ja, zh];
  for (const c of candidates) if (c && c.trim().length) return c;
  return '';
}

export default function PopularPlaces() {
  const { t, i18n } = useTranslation();
  const uiLang = normalizeUiLang(i18n.language); // ko/en/ja/zh 로 정규화

  const [items, setItems] = useState<PopularPlaceDTO[] | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          const data = await fetchPopularPlaces();
          if (!mounted) return;
          setItems(pickRandom(data ?? [], 2));
        } catch (e) {
          console.warn('fetchPopularPlaces error', e);
          if (mounted) setItems([]);
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => { mounted = false; };
    }, [])
  );

  const cards = useMemo(() => {
    if (!items) return [];
    return items.map((p) => adaptToCard(p, { uiLang }));
  }, [items, uiLang]); // 언어 바뀌면 카드 텍스트 즉시 갱신

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Image
          source={require('../../assets/images/icons/like.png')}
          style={styles.icon}
        />
        <Text style={styles.title}>{t('home.recommendplace')}</Text>
      </View>

      <View style={styles.cardList}>
        {loading && (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator />
          </View>
        )}

        {!loading && cards.length === 0 && (
          <Text style={styles.emptyText}>{t('common.empty') ?? '표시할 추천 장소가 없어요.'}</Text>
        )}

        {!loading &&
          cards.map((c) => (
            <PopularPlaceCard
              key={c.id}
              id={c.id}
              imageUrl={c.imageUrl}
              title={c.title}
              location={c.location}
              description={c.description}
            />
          ))}
      </View>
    </View>
  );
}

function adaptToCard(
  p: PopularPlaceDTO,
  opts: { uiLang: 'ko' | 'en' | 'ja' | 'zh' }
): {
  id: number;
  imageUrl: string | null;
  title: string;
  location: string;
  description: string;
} {
  const title = pickByLang4(opts.uiLang, p.nameKo, p.nameEn, p.nameJp as any, p.nameCh as any)
    || p.nameKo || p.nameEn || '';

  const description = pickByLang4(opts.uiLang, p.descriptionKo ?? null, p.descriptionEn ?? null, (p as any).descriptionJp ?? null, (p as any).descriptionCh ?? null)
    || '';

  const address = pickByLang4(opts.uiLang, (p as any).addressKo ?? null, (p as any).addressEn ?? null, (p as any).addressJp ?? null, (p as any).addressCh ?? null)
    || p.address || '';

  const todayHours = formatTodayHoursLocalized(p.openingHours, opts.uiLang);
  const loc = compactJoin([address || undefined, todayHours || undefined], ' · ');

  return {
    id: p.id,
    imageUrl: p.imageUrl ?? null,
    title: title || '—',
    location: loc || (address || todayHours || ''),
    description,
  };
}

function compactJoin(parts: (string | undefined | null)[], sep: string) {
  return parts.filter(Boolean).join(sep);
}

function formatTodayHoursLocalized(
  openingHours: any,
  uiLang: 'ko' | 'en' | 'ja' | 'zh'
): string | null {
  if (!openingHours || typeof openingHours !== 'object') return null;

  const dayIdx = new Date().getDay(); // 0=Sun..6=Sat
  const key = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayIdx];
  const raw = openingHours[key];
  if (!raw) return null;

  const s = String(raw).trim();

  // 다국어 '휴무' 인식
  const RE_CLOSED = /(^|\s)(closed|휴무|휴관|정기휴무|定休日|休業|休息|休馆)(\s|$)/i;

  // 다국어 '24시간/상시개방' 인식
  const RE_24H =
    /(24\s*hours?|24h|24\/7|always\s*open|open\s*24|상시\s*(개방|운영)|항상\s*(개방|영업)|24시간(영업|운영)?|24時間営業|常時開放|24小时营业|全天(开放|营业))/i;

  // i18n 라벨 (키가 없으면 안전한 기본값)
  const L_CLOSED = (() => { try { return i18n.t('place.closed'); } catch { return 'Closed'; } })();
  const L_ALWAYSOPEN = (() => { try { return i18n.t('place.alwaysOpen'); } catch { return 'Open 24 hours'; } })();

  // "오늘 휴무" 같은 Today-문구
  const CLOSED_TODAY: Record<typeof uiLang, string> = {
    ko: `오늘 ${L_CLOSED}`,
    en: 'Closed today',
    ja: '本日休業',
    zh: '今日休息',
  };

  // 규칙 적용
  if (RE_CLOSED.test(s)) return CLOSED_TODAY[uiLang];
  if (RE_24H.test(s)) return L_ALWAYSOPEN;

  // "09:00-18:00" → "09:00 ~ 18:00"
  const m = s.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (m) return `${m[1]} ~ ${m[2]}`;

  // 그 외 형식은 원문 그대로
  return s;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  if (!arr || arr.length === 0) return [];
  if (arr.length <= count) return [...arr];
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

// 카드
function PopularPlaceCard({
  id,
  imageUrl,
  title,
  location,
  description,
}: {
  id: number;
  imageUrl: string | null;
  title: string;
  location: string;
  description: string;
}) {
  const fallback = require('../../assets/images/sample-beauty3.png');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/place/place-detail/[id]',
          params: { id: String(id) },
        })
      }
    >
      <Image source={imageUrl ? { uri: imageUrl } : fallback} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
        {!!location && <Text style={styles.cardLocation} numberOfLines={1}>{location}</Text>}
        {!!description && <Text style={styles.cardDescription} numberOfLines={2}>{description}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20, marginBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  icon: { width: 20, height: 20, marginRight: 8, resizeMode: 'contain' },
  title: { fontSize: 16, fontFamily: 'Pretendard-Bold', color: '#000' },
  cardList: { marginTop: 14, gap: 16 },
  emptyText: { fontSize: 13, color: '#666' },
  card: {
    width: '100%', height: 231, borderRadius: 5, backgroundColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 2,
  },
  cardImage: {
    width: '100%', height: 118, borderTopLeftRadius: 5, borderTopRightRadius: 5, resizeMode: 'cover',
  },
  cardContent: { padding: 12 },
  cardTitle: { fontSize: 15, fontFamily: 'Pretendard-SemiBold', color: '#333', marginBottom: 0 },
  cardLocation: { fontSize: 12, fontFamily: 'Pretendard-Medium', color: '#666', marginBottom: 6 },
  cardDescription: { fontSize: 12, fontFamily: 'Pretendard-Medium', color: '#666' },
});
