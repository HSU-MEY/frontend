import TicketCard from '@/components/TicketCard';
import { useUserRoutes } from '@/hooks/useUserRoutes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function OngoingRoute() {
    const { t } = useTranslation();
    const {
        data: ongoingData,
        loading: ongoingLoading,
        error: ongoingError,
    } = useUserRoutes("ON_GOING");

    const firstData = ongoingData?.savedRoutes[0];

    if (ongoingLoading || ongoingError || !ongoingData || !firstData) return null;

    return (
        <>
            {!ongoingLoading && !ongoingError && ongoingData && firstData &&
                <View style={styles.container}>
                    {/* 이미지 + 텍스트 가로 배치 */}
                    <View style={styles.headerRow}>
                        <Image
                            source={require('@/assets/images/icons/route.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.title}>{t('home.ongoingRouteTitle')}</Text>
                    </View>

                    {/* 동적 카드 */}
                    {/* <RouteTicketCard {...currentRoute} /> */}
                    <TicketCard
                        title={firstData.title}
                        location={""}
                        startDate={firstData.preferredStartDate}
                        progress={88}   //TODO: Change to dynamic value
                        imageSource={require('@/assets/images/sample-stage.png')}
                    />
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
