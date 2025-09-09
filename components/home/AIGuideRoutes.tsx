import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getRecommendRouteApi, Routes } from '@/api/routes.service';

export default function AIGuideRoutes() {
  const router = useRouter();

  const [routes, setRoutes] = React.useState<Routes[]>([]);

  useEffect(() => {
    getRecommendRouteApi(undefined, undefined, 3, 0).then((response) => {
      if(response.isSuccess) {
        setRoutes(response.result.routes);
      }
    });
  }, []);

  return (
    <>
    { routes.length != 0 &&
    <View style={styles.container}>
      {/* 섹션 제목 */}
      <View style={styles.headerRow}>
        <Image
          source={require('../../assets/images/icons/robot.png')}
          style={styles.icon}
        />
        <Text style={styles.title}>AI 가이드가 추천하는 루트를 만나보세요</Text>
      </View>

      {/* 가로 스크롤 카드 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
        {routes.map((item) => (
          <TouchableOpacity
            key={item.routeId}
            style={styles.cardContainer}
            onPress={() => router.push(`/route/route-overview/1`)}
          >

            <ImageBackground
              source={item.imageUrl ? { uri: item.imageUrl } : require('@/assets/images/placeholder-place.png')}
              style={styles.cardImage}
              imageStyle={styles.imageStyle}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
                locations={[0.1, 0.5, 0.9]}
                style={styles.overlay}
              >
                <View style={styles.topTextContainer}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardLocation}>{item.regionNameKo}</Text>
                </View>

                <View style={styles.bottomTextContainer}>
                  <Text style={styles.cardDescription}>{item.description}</Text>
                </View>
              </LinearGradient>
            </ImageBackground>

          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
    }
    </>
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
  cardContainer: {
    marginRight: 12,
  },
  cardImage: {
    width: 147,
    height: 98,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },

  imageStyle: {
    borderRadius: 5,
  },

  overlay: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
    borderRadius: 5,
  },

  topTextContainer: {
    // 자동 정렬
    marginTop: 5
  },

  bottomTextContainer: {
    // 자동 정렬
    marginBottom: 5
  },

  cardTitle: {
    fontSize: 13,
    fontFamily: 'Pretendard-Bold',
    color: '#fff',
  },

  cardLocation: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Pretendard-SemiBold',
    marginTop: 0,
  },

  cardDescription: {
    fontSize: 11,
    color: '#fff',
    fontFamily: 'Pretendard-Medium',
  },
});
