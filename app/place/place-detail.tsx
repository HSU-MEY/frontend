// app/place/place-detail.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import styled from 'styled-components/native';

import { fetchPlaceDetail, PlaceDetailDTO } from '@/api/places.service';
import Header from '@/components/common/Header';

const PLACEHOLDER = { uri: 'https://placehold.co/600x400' };

const KR_DAYS: Record<string, string> = {
  monday: '월', tuesday: '화', wednesday: '수', thursday: '목',
  friday: '금', saturday: '토', sunday: '일',
};

function formatOpeningHours(hours: any): string {
  if (!hours) return '운영시간 정보 없음';
  if (typeof hours === 'string') return hours;
  if (Array.isArray(hours)) return hours.filter(Boolean).join(', ');
  if (typeof hours === 'object') {
    const parts = Object.entries(hours).map(([day, val]) => {
      const d = KR_DAYS[day.toLowerCase()] ?? day;
      if (typeof val === 'string') return `${d} ${val}`;
      if (val && typeof val === 'object') {
        const open = (val as any).open ?? (val as any).start ?? '';
        const close = (val as any).close ?? (val as any).end ?? '';
        if (open && close) return `${d} ${open}~${close}`;
        if (open || close) return `${d} ${open || close}`;
        return `${d} 영업`;
      }
      return `${d}`;
    }).filter(Boolean);
    return parts.length ? (parts.length <= 2 ? parts.join(' · ') : `${parts.slice(0,2).join(' · ')} 외`) : '운영시간 정보 없음';
  }
  return String(hours);
}

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const placeId = Number(id);

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
      } catch (e: any) {
        setErr('장소 정보를 불러오지 못했어요.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [placeId]);

  const title = data?.nameKo || data?.nameEn || `장소 #${placeId}`;
  const address = data?.address || '주소 정보 없음';
  const hours = formatOpeningHours(data?.openingHours);
  const cost = data?.costInfo || '비용 정보 없음';
  const tel = data?.contactInfo || '';
  const desc = data?.descriptionKo || data?.descriptionEn || '';
  const imageSrc = data?.imageUrl ? { uri: data.imageUrl } : PLACEHOLDER;

  if (loading) {
    return (
      <Container>
        <Header title="플레이스" />
        <TopImage source={PLACEHOLDER} />
        <Section><Title>불러오는 중…</Title></Section>
      </Container>
    );
  }
  if (err) {
    return (
      <Container>
        <Header title="플레이스" />
        <TopImage source={PLACEHOLDER} />
        <Section><Title>{err}</Title></Section>
      </Container>
    );
  }

  return (
    <Container>
      <Header title="플레이스" />
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

      {/* --- 아래 섹션들은 더미 유지 (백엔드 연결 전까지) --- */}
      <Section>
        <Subtitle>주요 이벤트</Subtitle>
        <Card>
          <CardImage source={{ uri: 'https://placehold.co/300x300' }} />
          <CardText>설화수 피부 진단 & 맞춤 앰플 클래스{"\n"}매일 11:00 - 20:00</CardText>
        </Card>
        <Card>
          <CardImage source={{ uri: 'https://placehold.co/300x300' }} />
          <CardText>‘색채, 결이 되다’ 복운경 작가 쿠레이지 이벤트{"\n"}매일 11:00 - 20:00</CardText>
        </Card>
      </Section>

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

/* ===== styled ===== */
const Container = styled.ScrollView`flex:1;background-color:#fff;`;
const TopImage = styled.Image`width:100%;height:240px;`;
const Section = styled.View`padding:16px;`;
const Title = styled.Text`font-size:22px;font-weight:bold;margin-bottom:16px;`;
const Subtitle = styled.Text`font-size:18px;font-weight:bold;margin-bottom:12px;`;
const InfoBox = styled.View`margin-bottom:16px;`;
const InfoItem = styled.View`flex-direction:row;align-items:flex-start;margin-bottom:8px;`;
const InfoText = styled.Text`margin-left:8px;flex:1;color:#333;`;
const Description = styled.Text`line-height:20px;color:#555;`;
const Card = styled.View`flex-direction:row;margin-bottom:12px;border-radius:8px;background-color:#fff;padding:12px;`;
const CardImage = styled.Image`width:80px;height:80px;border-radius:8px;margin-right:12px;`;
const CardText = styled.Text`flex:1;font-size:14px;color:#333;line-height:18px;`;
const Row = styled.View`flex-direction:row;justify-content:space-between;`;
const RelatedCard = styled.View`width:48%;background-color:#fff;border-radius:8px;`;
const RelatedImage = styled.Image`width:100%;height:100px;border-radius:8px;margin-bottom:4px;`;
const RelatedText = styled.Text`font-size:13px;color:#333;padding:8px;`;
const NearbyCard = styled.View`width:32%;`;
const NearbyImage = styled.Image`width:100%;height:100px;border-radius:8px;margin-bottom:4px;`;
const NearbyText = styled.Text`font-size:12px;color:#333;padding:4px;`;
