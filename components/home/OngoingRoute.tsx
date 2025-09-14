import TicketCard from '@/components/TicketCard';
import { useUserRoutes } from '@/hooks/useUserRoutes';
import { useRouteRunStore } from '@/store/useRouteRunStore';
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OngoingRoute() {
    const { t } = useTranslation();
    const {
        data: ongoingData,
        loading: ongoingLoading,
        error: ongoingError,
        refetch: refetchOngoing,
    } = useUserRoutes("ON_GOING");

    const runStoreRoutes = useRouteRunStore((s) => s.routes);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (isFocused) {
            refetchOngoing();
        }
    }, [isFocused]);

    const firstData = ongoingData?.savedRoutes[0];

    if (ongoingLoading || ongoingError || !ongoingData || !firstData) return null;

    const routeRunData = runStoreRoutes[firstData.routeId];

    let progress = 0;
    if (routeRunData && routeRunData.segments?.length > 0) {
        const totalSteps = routeRunData.segments.length;
        // The user is considered to have completed the step at currentSegmentIndex
        // So progress is (index + 1) / total
        const currentProgress = routeRunData.currentSegmentIndex + 1;
        progress = Math.round((currentProgress / totalSteps) * 100);
    }

    const imageSource = firstData.imageUrl
        ? { uri: firstData.imageUrl }
        : require('@/assets/images/sample-stage.png');


    return (
        <>
            {!ongoingLoading && !ongoingError && ongoingData && firstData &&
                <TouchableOpacity style={styles.container} onPress={() => { router.push(`/route/route-overview/${firstData.routeId}`) }}>
                    {/* 이미지 + 텍스트 가로 배치 */}
                    <View style={styles.headerRow}>
                        <Image
                            source={require('@/assets/images/icons/route.png')}
                            style={styles.icon}
                        />
                        <Text style={styles.title}>{t('home.ongoingRouteTitle')}</Text>
                    </View>

                    {/* 동적 카드 */}
                    <TicketCard
                        title={firstData.title}
                        location={""} // Location is not available in the Route object
                        startDate={firstData.preferredStartDate}
                        progress={progress}
                        imageSource={imageSource}
                    />
                </TouchableOpacity>
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
