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

export default function PopularPlaces() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.toLowerCase() ?? 'ko';
  const isKo = lang.startsWith('ko');

  const [items, setItems] = useState<PopularPlaceDTO[] | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          // 제한 없이 받아온 뒤, 클라이언트에서 랜덤 2개 추출
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
      return () => {
        mounted = false;
      };
    }, [])
  );

  const cards = useMemo(() => {
    if (!items) return [];
    return items.map((p) => adaptToCard(p, { isKo }));
  }, [items, isKo]);

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
  opts: { isKo: boolean }
): {
  id: number;
  imageUrl: string | null;
  title: string;
  location: string;
  description: string;
} {
  const title = opts.isKo ? (p.nameKo || p.nameEn || '') : (p.nameEn || p.nameKo || '');
  const description = opts.isKo
    ? (p.descriptionKo ?? p.descriptionEn ?? '')
    : (p.descriptionEn ?? p.descriptionKo ?? '');

  const todayHours = formatTodayHours(p.openingHours);
  const loc = compactJoin([p.address || undefined, todayHours ? todayHours : undefined], ' · ');

  return {
    id: p.id,
    imageUrl: p.imageUrl ?? null,
    title: title || '이름 미상',
    location: loc || (p.address || todayHours || ''),
    description: description || '',
  };
}

function compactJoin(parts: (string | undefined | null)[], sep: string) {
  return parts.filter(Boolean).join(sep);
}

function formatTodayHours(openingHours: any): string | null {
  if (!openingHours || typeof openingHours !== 'object') return null;

  // JS 기준: 0=일요일 ... 6=토요일
  const dayIdx = new Date().getDay();
  const key = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayIdx];

  const raw = openingHours[key];
  if (!raw) return null;

  if (String(raw).toLowerCase() === 'closed') {
    return '오늘 휴무';
  }

  // "09:00-18:00" -> "09:00 ~ 18:00"
  const m = String(raw).match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  if (m) return `${m[1]} ~ ${m[2]}`;

  // 예상치 못한 형식은 그대로 노출
  return String(raw);
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

//카드

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
      <Image
        source={imageUrl ? { uri: imageUrl } : fallback}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {title}
        </Text>
        {!!location && (
          <Text style={styles.cardLocation} numberOfLines={1}>
            {location}
          </Text>
        )}
        {!!description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#000',
  },
  cardList: {
    marginTop: 14,
    gap: 16,
  },
  emptyText: {
    fontSize: 13,
    color: '#666',
  },
  card: {
    width: '100%',
    height: 231,
    borderRadius: 5,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 118,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    marginBottom: 0,
  },
  cardLocation: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: '#666',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: '#666',
  },
});
