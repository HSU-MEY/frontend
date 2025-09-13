import { fetchPlaceDetail, fetchRelatedPlaces, PlaceDetailDTO, RelatedPlaceDTO } from '@/api/places.service';
import Header from '@/components/common/Header';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import styled from 'styled-components/native';

import KakaoMapWebView, { KakaoMapHandle } from '@/components/KakaoMapWebView';
import { KAKAO_JS_API_KEY } from '@/src/env';

const PLACEHOLDER = { uri: 'https://placehold.co/600x400' };

// i18n.language -> ko/en/ja/zh 정규화
function normalizeUiLang(lang?: string): 'ko' | 'en' | 'ja' | 'zh' {
  const l = (lang || 'ko').toLowerCase();
  if (l.startsWith('ko')) return 'ko';
  if (l.startsWith('en')) return 'en';
  if (l.startsWith('ja')) return 'ja';
  if (l.startsWith('zh')) return 'zh';
  return 'ko';
}

function formatDistance(m: number) {
  if (!Number.isFinite(m)) return '';
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

// 언어별 우선순위 선택 (현재 언어 → ko → en → ja → zh)
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

function formatOpeningHours(
  hours: any,
  daysShort: Record<string, string>,
  t: (k: string, o?: any) => string
): string {
  if (!hours) return t('place.hoursUnknown');
  if (typeof hours === 'string') {
    const s = hours.toLowerCase().includes('closed') ? t('place.closed') : hours;
    return s;
  }
  if (Array.isArray(hours)) {
    return hours
      .filter(Boolean)
      .map((s) => (String(s).toLowerCase().includes('closed') ? t('place.closed') : s))
      .join(', ');
  }
  if (typeof hours === 'object') {
    const mapLabel = (dayKey: string) => {
      const k = dayKey.toLowerCase();
      if (k.startsWith('mon')) return daysShort.mon;
      if (k.startsWith('tue')) return daysShort.tue;
      if (k.startsWith('wed')) return daysShort.wed;
      if (k.startsWith('thu')) return daysShort.thu;
      if (k.startsWith('fri')) return daysShort.fri;
      if (k.startsWith('sat')) return daysShort.sat;
      if (k.startsWith('sun')) return daysShort.sun;
      return dayKey;
    };

    const parts = Object.entries(hours).map(([day, val]) => {
      const d = mapLabel(day);
      if (typeof val === 'string') {
        const v = val.toLowerCase().includes('closed') ? t('place.closed') : val;
        return `${d} ${v}`;
      }
      if (val && typeof val === 'object') {
        const open = (val as any).open ?? (val as any).start ?? '';
        const close = (val as any).close ?? (val as any).end ?? '';
        if (open && close) return `${d} ${open}~${close}`;
        if (open || close) return `${d} ${open || close}`;
        return `${d}`;
      }
      return `${d}`;
    });

    return parts.length ? (parts.length <= 2 ? parts.join(' · ') : `${parts.slice(0, 2).join(' · ')} …`) : t('place.hoursUnknown');
  }
  return String(hours);
}

export default function PlaceDetailScreen() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const placeId = useMemo(() => Number(Array.isArray(id) ? id?.[0] : id), [id]);

  const uiLang = normalizeUiLang(i18n.language);

  const [data, setData] = useState<PlaceDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // 카카오 맵 뷰
  const mapRef = useRef<KakaoMapHandle>(null);

  // Nearby
  const [related, setRelated] = useState<RelatedPlaceDTO[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  // 상세 로딩 (불러오는 중 고정 방지: placeId 가드 + setLoading true/false)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErr(null);
        setLoading(true);

        if (!Number.isFinite(placeId)) throw new Error('Invalid placeId');

        const detail = await fetchPlaceDetail(placeId);
        if (!mounted) return;
        setData(detail);
      } catch {
        if (mounted) setErr(t('place.loadFail'));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [placeId, t]);

  // Nearby 로딩 (선택 언어 적용)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setRelatedLoading(true);
        if (!Number.isFinite(placeId)) {
          setRelated([]);
          return;
        }
        const list = await fetchRelatedPlaces(placeId, uiLang);
        if (!mounted) return;
        const top3 = (list ?? [])
          .filter(Boolean)
          .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity))
          .slice(0, 3);
        setRelated(top3);
      } catch {
        if (mounted) setRelated([]);
      } finally {
        if (mounted) setRelatedLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [placeId, uiLang]);

  // 좌표 유효성
  const lat = Number(data?.latitude);
  const lng = Number(data?.longitude);
  const hasCoord = Number.isFinite(lat) && Number.isFinite(lng);

  // 언어별 라벨
  const DAYS_SHORT = useMemo(
    () => t('daysShort', { returnObjects: true }) as Record<string, string>,
    [i18n.language, t]
  );

  // 다국어 필드 선택
  const title =
    pickByLang4(uiLang, data?.nameKo ?? null, data?.nameEn ?? null, data?.nameJp ?? null, data?.nameCh ?? null) ||
    `#${placeId}`;

  const address =
    pickByLang4(uiLang, data?.addressKo ?? null, data?.addressEn ?? null, data?.addressJp ?? null, data?.addressCh ?? null) ||
    data?.address || t('place.addressUnknown');

  const desc =
    pickByLang4(uiLang, data?.descriptionKo ?? null, data?.descriptionEn ?? null, data?.descriptionJp ?? null, data?.descriptionCh ?? null);

  const hours = formatOpeningHours(data?.openingHours, DAYS_SHORT, t);
  const cost = data?.costInfo || t('place.costUnknown');
  const tel = data?.contactInfo || '';
  const imageSrc = data?.imageUrl ? { uri: data.imageUrl } : PLACEHOLDER;

  if (loading) {
    return (
      <Container>
        <Header title={t('place.title')} />
        <TopImage source={PLACEHOLDER} />
        <Section><Title>{t('place.loading')}</Title></Section>
      </Container>
    );
  }
  if (err) {
    return (
      <Container>
        <Header title={t('place.title')} />
        <TopImage source={PLACEHOLDER} />
        <Section><Title>{err}</Title></Section>
      </Container>
    );
  }

  const showNearbySection = relatedLoading || related.length > 0;

  return (
    <Container>
      <Header title={t('place.title')} />
      <TopImage source={imageSrc} />

      <Section>
        <Title>{title}</Title>

        <InfoBox>
          <InfoItem>
            <IconBadge>
              <Ionicons name="information-circle-outline" size={18} color="#1C5BD8" />
            </IconBadge>
            <InfoText>{hours}</InfoText>
          </InfoItem>

          <InfoItem>
            <IconBadge>
              <Ionicons name="location-outline" size={18} color="#1C5BD8" />
            </IconBadge>
            <InfoText>{address}</InfoText>
          </InfoItem>

          <InfoItem>
            <IconBadge>
              <Ionicons name="pricetags-outline" size={18} color="#1C5BD8" />
            </IconBadge>
            <InfoText>{cost}</InfoText>
          </InfoItem>

          {!!tel && (
            <InfoItem>
              <IconBadge>
                <Ionicons name="call-outline" size={18} color="#1C5BD8" />
              </IconBadge>
              <InfoText onPress={() => Linking.openURL(`tel:${tel}`)}>{tel}</InfoText>
            </InfoItem>
          )}

          {!!data?.websiteUrl && (
            <InfoItem>
              <IconBadge>
                <Ionicons name="link-outline" size={18} color="#1C5BD8" />
              </IconBadge>
              <InfoText onPress={() => Linking.openURL(data.websiteUrl!)}>{data.websiteUrl}</InfoText>
            </InfoItem>
          )}
        </InfoBox>

        {!!desc && <Description>{desc}</Description>}
      </Section>

      {/* 지도 */}
      {hasCoord && (
        <Section>
          <Subtitle>{t('place.locationTitle')}</Subtitle>

          <MapBox>
            <KakaoMapWebView
              ref={mapRef}
              jsKey={KAKAO_JS_API_KEY}
              center={{ lat, lng }}
              level={3}
              onReady={() => {
                mapRef.current?.focusTo(lat, lng, 3);
              }}
            />
          </MapBox>

          {!!address && <LocationText style={{ marginBottom: 8 }}>{address}</LocationText>}
        </Section>
      )}

      {/* Nearby */}
      {showNearbySection && (
        <Section>
          <Subtitle>{t('place.nearby')}</Subtitle>

          {relatedLoading && (
            <Row>
              {[0, 1, 2].map((i) => (
                <NearbyCard key={`skeleton-${i}`}>
                  <NearbyImage source={PLACEHOLDER} />
                  <NearbyType>—</NearbyType>
                  <NearbyAddr>—</NearbyAddr>
                  <NearbyDist>—</NearbyDist>
                </NearbyCard>
              ))}
            </Row>
          )}

          {!relatedLoading && related.length > 0 && (
            <Row>
              {related.map((r, idx) => {
                const img = r.firstImage ? { uri: r.firstImage } : PLACEHOLDER;
                return (
                  <NearbyCard key={`${r.title}-${idx}`}>
                    <NearbyImage source={img} />
                    {/* 이미지 아래: (제목) → 타입 → 주소 → 거리(밑줄) */}
                    <NearbyAddr>{r.title}</NearbyAddr>
                    <NearbyType>{r.contentTypeName}</NearbyType>
                    <NearbyAddr numberOfLines={2}>{r.address || ''}</NearbyAddr>
                    <NearbyDist>
                      {t('place.distancePrefix', '이 장소에서')} {formatDistance(r.distance)}
                    </NearbyDist>
                  </NearbyCard>
                );
              })}
            </Row>
          )}
        </Section>
      )}
    </Container>
  );
}

const Container = styled.ScrollView`
  flex: 1;
  background-color: #fff;
`;

const TopImage = styled.Image`
  width: 100%;
  height: 220px;
`;

const Section = styled.View`
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 22px;
  margin-bottom: 16px;
  fontFamily: 'Pretendard-SemiBold';
`;

const Subtitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const InfoBox = styled.View`
  margin-bottom: 16px;
`;

const InfoItem = styled.View`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const InfoText = styled.Text`
  margin-left: 8px;
  flex: 1;
  color: #333;
  marginTop: 5px;
  fontFamily: 'Pretendard-Regular';
`;

const LocationText = styled.Text`
  flex: 1;
  color: #333;
  marginTop: 5px;
  fontFamily: 'Pretendard-Medium';
`;

const Description = styled.Text`
  line-height: 20px;
  color: #555;
  fontFamily: 'Pretendard-Regular';
`;

const Card = styled.View`
  flex-direction: row;
  margin-bottom: 12px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 12px;
`;

const CardImage = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  margin-right: 12px;
`;

const CardText = styled.Text`
  flex: 1;
  font-size: 14px;
  color: #333;
  line-height: 18px;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const RelatedCard = styled.View`
  width: 48%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  border-radius: 8px;
`;

const RelatedImage = styled.Image`
  width: 100%;
  height: 100px;
  border-radius: 8px 8px 0 0;
  margin-bottom: 4px;
`;

const RelatedText = styled.Text`
  font-size: 13px;
  color: #333;
  padding: 8px;
`;

const NearbyText = styled.Text`
  font-size: 12px;
  color: #333;
  padding: 4px;
`;

const MapBox = styled.View`
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
`;

const IconBadge = styled.View`
  border-radius: 8px;        /* 둥근 네모 */
  background-color: #DFEAFF; /* 배경색 */
  align-items: center;
  justify-content: center;
  padding: 6px;
`;

const SmallLabel = styled.Text`
  font-size: 12px;
  color: #333333;
  margin-bottom: 8px;
  fontFamily: 'Pretendard-SemiBold';
`;

const NearbyCard = styled.View`
  width: 30%;
`;

const NearbyImage = styled.Image`
  width: 100%;
  height: 100px;
  border-radius: 8px;
  margin-bottom: 6px;
`;

const NearbyType = styled.Text`
  font-size: 12px;
  color: #1C5BD8;
  fontFamily: 'Pretendard-SemiBold';
  margin-bottom: 2px;
`;

const NearbyAddr = styled.Text`
  font-size: 12px;
  color: #333333;
  margin-bottom: 2px;
  fontFamily: 'Pretendard-Regular';
`;

const NearbyDist = styled.Text`
  font-size: 12px;
  color: #666666;
  text-decoration-line: underline;  /* RN은 textDecorationLine 사용 */
  fontFamily: 'Pretendard-Regular';
`;
