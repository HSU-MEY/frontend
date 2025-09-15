// components/RouteListPage.tsx
import { Route } from '@/api/users.routes.service';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import TicketCard from './../TicketCard';

interface RouteListPageProps {
    title: string;
    routes: Route[];
    onDelete?: (id: string) => void;
}

export default function RouteListPage({ title, routes, onDelete }: RouteListPageProps) {
    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Image
                    source={require('../../assets/images/icons/route.png')}
                    style={styles.icon}
                />
                <Text style={styles.title}>{title}</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {routes.map((route) => (
                    <View key={route.savedRouteId} style={styles.cardWrapper}>
                        <TicketCard
                            title={route.title}
                            location={'Seoul'}
                            startDate={route.preferredStartDate}
                            progress={10}
                            imageSource={require('@/assets/images/sample-route-default.jpg')}
                            onDelete={onDelete ? () => onDelete(route.savedRouteId.toString()) : undefined}
                        />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 0,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 20
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 8,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 18,
        fontFamily: 'Pretendard-Bold',
    },
    scrollContent: {
        gap: 16,
        paddingBottom: 40,
    },
    cardWrapper: {
        alignItems: 'center',
    },
});
