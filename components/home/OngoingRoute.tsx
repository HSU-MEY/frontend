import TicketCard from '@/components/TicketCard';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function OngoingRoute() {
    // 여기에 나중에 API로부터 데이터를 가져올예정
    const currentRoute = {
        image: require('../../assets/images/sample-stage.png'), // 예시 이미지
        title: 'K-POP 루트: idol',
        location: '서울 홍대',
        startDate: '25.07.04',
        progress: 88,
    };

    return (
        <View style={styles.container}>
            {/* 이미지 + 텍스트 가로 배치 */}
            <View style={styles.headerRow}>
                <Image
                    source={require('../../assets/images/icons/route.png')}
                    style={styles.icon}
                />
                <Text style={styles.title}>현재 진행중인 루트가 있어요!</Text>
            </View>

            {/* 동적 카드 */}
            {/* <RouteTicketCard {...currentRoute} /> */}
            <TicketCard
                title="K-POP 루트: idol"
                location="서울 홍대"
                startDate="25.07.04"
                progress={88}
                imageSource={require('@/assets/images/sample-stage.png')}
            />

        </View>
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
});
