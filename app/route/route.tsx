import Header from '@/components/common/Header';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// // Locale 설정
// LocaleConfig.locales['ko'] = {
//   monthNames: [
//     '1월', '2월', '3월', '4월', '5월', '6월',
//     '7월', '8월', '9월', '10월', '11월', '12월'
//   ],
//   monthNamesShort: [
//     '1월', '2월', '3월', '4월', '5월', '6월',
//     '7월', '8월', '9월', '10월', '11월', '12월'
//   ],
//   dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
//   dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
//   today: '오늘'
// };
// LocaleConfig.defaultLocale = 'ko';

// const cities = ['서울', '인천', '수원', '부산', '경주', '울산', '여수', '대전', '제주'];

export default function RouteScreen() {
  const { t, i18n } = useTranslation();
  const [selectedCity, setSelectedCity] = useState('서울');
  const [selectedDate, setSelectedDate] = useState('');
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // 도시 리스트를 i18n에서 배열로 받기
  const cities = useMemo(() => t('route.cities', { returnObjects: true }) as string[], [i18n.language, t]);

  // 캘린더 Locale을 현재 언어에 맞게 반영
  useEffect(() => {
    LocaleConfig.locales[i18n.language] = {
      monthNames: t('calendar.monthNames', { returnObjects: true }) as string[],
      monthNamesShort: t('calendar.monthNames', { returnObjects: true }) as string[],
      dayNames: t('calendar.dayNames', { returnObjects: true }) as string[],
      dayNamesShort: t('calendar.dayNamesShort', { returnObjects: true }) as string[],
      today: t('calendar.today')
    };
    LocaleConfig.defaultLocale = i18n.language;
  }, [i18n.language, t]);

  return (
    <View style={styles.container}>
      <Header title={t('route.title')} />

      {/* ScrollView는 버튼 높이만큼 패딩 추가 */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 지역 선택 */}
        <Text style={styles.question}>{t('route.whichCity')}</Text>
        <View style={styles.cityGrid}>
          {cities.map((city) => (
            <TouchableOpacity
              key={city}
              onPress={() => setSelectedCity(city)}
              style={[styles.cityButton, selectedCity === city && styles.cityButtonSelected]}
            >
              <Text style={[styles.cityText, selectedCity === city && styles.cityTextSelected]}>
                {city}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 날짜 선택 */}
        <Text style={[styles.question, { marginTop: 28 }]}>{t('route.whichDate')}</Text>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: '#1A5CFF' },
          }}
          theme={{
            selectedDayBackgroundColor: '#1A5CFF',
            todayTextColor: '#1A5CFF',
            textDayFontFamily: 'Pretendard-Medium',
            textMonthFontFamily: 'Pretendard-Bold',
            textDayHeaderFontFamily: 'Pretendard-Medium',
          }}
          renderHeader={(date) => {
            // 헤더(YYYY/MM)도 언어별 포맷으로 보여주고 싶다면 Intl 사용
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            return (
              <Text style={styles.calendarHeader}>
                {i18n.language === 'ko' ? `${year}년 ${month}월` : `${year}/${month.toString().padStart(2, '0')}`}
              </Text>
            );
          }}
        />
      </ScrollView>

      {/* 항상 하단에 고정된 버튼 */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.button}
          onPress={() => router.push('./start')}
        >
          <Text style={styles.buttonText}>{t('route.createRoute')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 36,
  },
  question: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#000',
    marginBottom: 12,
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  cityButton: {
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 1000,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#fff',
  },
  cityButtonSelected: {
    backgroundColor: '#1C5BD8',
    borderColor: '#1C5BD8',
  },
  cityText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    color: '#000',
  },
  cityTextSelected: {
    color: '#fff',
    fontFamily: 'Pretendard-Bold',
  },
  calendarHeader: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  fixedButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    backgroundColor: '#1C5BD8',
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: 'center',
    height: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
  },
});
