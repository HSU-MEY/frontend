import { fetchPlaceDetail, PlaceDetailDTO } from '@/api/places.service';
import Header from '@/components/common/Header';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';
import styled from 'styled-components/native';

const PLACEHOLDER = { uri: 'https://placehold.co/600x400' };

// 다국어 필드 선택
function pickByLang(lang: string, ko?: string | null, en?: string | null) {
  if (lang?.startsWith('ko')) return ko ?? en ?? '';
  return en ?? ko ?? '';
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

  // id가 배열로 올 가능성 방어
  const placeId = useMemo(() => Number(Array.isArray(id) ? id[0] : id), [id]);

  const [data, setData] = useState<PlaceDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErr(null);
        const detail = await fetchPlaceDetail(placeId);
        if (!mounted) return;
        setData(detail);
      } catch (e) {
        if (mounted) setErr(t('place.loadFail'));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [placeId, t]);

  const DAYS_SHORT = useMemo(
    () => t('daysShort', { returnObjects: true }) as Record<string, string>,
    [i18n.language, t]
  );

  const title = pickByLang(i18n.language, data?.nameKo ?? null, data?.nameEn ?? null) || `#${placeId}`;
  const address = data?.address || t('place.addressUnknown');
  const hours = formatOpeningHours(data?.openingHours, DAYS_SHORT, t);
  const cost = data?.costInfo || t('place.costUnknown');
  const tel = data?.contactInfo || '';
  const desc = pickByLang(i18n.language, data?.descriptionKo ?? null, data?.descriptionEn ?? null);
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

  return (
    <Container>
      <Header title={t('place.title')} />
      <TopImage source={imageSrc} />

      <Section>
        <Title>{title}</Title>

        <InfoBox>
          <InfoItem>
            <Ionicons name="information-circle-outline" size={16} color="gray" />
            <InfoText>{hours}</InfoText>
          </InfoItem>

          <InfoItem>
            <Ionicons name="location-outline" size={16} color="gray" />
            <InfoText>{address}</InfoText>
          </InfoItem>

          <InfoItem>
            <Ionicons name="pricetags-outline" size={16} color="gray" />
            <InfoText>{cost}</InfoText>
          </InfoItem>

          {!!tel && (
            <InfoItem>
              <Ionicons name="call-outline" size={16} color="gray" />
              <InfoText onPress={() => Linking.openURL(`tel:${tel}`)}>{tel}</InfoText>
            </InfoItem>
          )}

          {!!data?.websiteUrl && (
            <InfoItem>
              <Ionicons name="link-outline" size={16} color="gray" />
              <InfoText onPress={() => Linking.openURL(data.websiteUrl!)}>{data.websiteUrl}</InfoText>
            </InfoItem>
          )}
        </InfoBox>

        {!!desc && <Description>{desc}</Description>}
      </Section>

      {/* <Section>
        <Subtitle>주요 이벤트</Subtitle>
        <Card>
          <CardImage source={{ uri: 'https://placehold.co/300x300' }} />
          <CardText>
            설화수 피부 진단 & 맞춤 앰플 클래스{"\n"}매일 11:00 - 20:00
          </CardText>
        </Card>
        <Card>
          <CardImage source={{ uri: 'https://placehold.co/300x300' }} />
          <CardText>
            ‘색채, 결이 되다’ 복운경 작가 쿠레이지 이벤트{"\n"}매일 11:00 - 20:00
          </CardText>
        </Card>
      </Section> */}

      <Section>
        <Subtitle>관련 게시물</Subtitle>
        <Row>
          <RelatedCard>
            <RelatedImage source={{ uri: 'https://placehold.co/300x200' }} />
            <RelatedText>설화수 플래그십 스토어에서의 특별한 하루</RelatedText>
          </RelatedCard>
          <RelatedCard>
            <RelatedImage source={{ uri: 'https://placehold.co/300x200' }} />
            <RelatedText>설화수 피부 진단 & 맞춤 클래스 후기</RelatedText>
          </RelatedCard>
        </Row>
      </Section>

      <Section>
        <Subtitle>근처 명소</Subtitle>
        <Row>
          <NearbyCard>
            <NearbyImage source={{ uri: 'https://placehold.co/300x300' }} />
            <NearbyText>핑크로즈 CAFE{"\n"}도보 1.2km</NearbyText>
          </NearbyCard>
          <NearbyCard>
            <NearbyImage source={{ uri: 'https://placehold.co/300x300' }} />
            <NearbyText>진대감 벽제 본점{"\n"}도보 320m</NearbyText>
          </NearbyCard>
          <NearbyCard>
            <NearbyImage source={{ uri: 'https://placehold.co/300x300' }} />
            <NearbyText>스위트브레드 베이커리{"\n"}도보 140m</NearbyText>
          </NearbyCard>
        </Row>
      </Section>
    </Container>
  );
}

const Container = styled.ScrollView`
  flex: 1;
  background-color: #fff;
`;

const TopImage = styled.Image`
  width: 100%;
  height: 240px;
`;

const Section = styled.View`
  padding: 16px;
`;

const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 16px;
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
`;

const Description = styled.Text`
  line-height: 20px;
  color: #555;
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

const NearbyCard = styled.View`
  width: 32%;
`;

const NearbyImage = styled.Image`
  width: 100%;
  height: 100px;
  border-radius: 8px;
  margin-bottom: 4px;
`;

const NearbyText = styled.Text`
  font-size: 12px;
  color: #333;
  padding: 4px;
`;