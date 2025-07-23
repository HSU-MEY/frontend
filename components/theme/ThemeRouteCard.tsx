import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface ThemeRouteCardProps {
    image: any;
    title: string;
    location: string;
    description: string;
}

export default function ThemeRouteCard({
    image,
    title,
    location,
    description,
}: ThemeRouteCardProps) {
    return (
        <View style={styles.card}>
            <Image source={image} style={styles.image} />

            <View style={styles.content}>
                <Text style={styles.title}>
                    {title}
                </Text>

                <Text style={styles.location}>
                    {location}
                </Text>

                <Text
                    style={styles.description}
                    numberOfLines={4}
                    ellipsizeMode="tail" // 끝부분 잘리고 '...'
                >
                    {description}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 5,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 14,

        // iOS용 그림자
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, // 아래로만 향하지 않도록 최소 높이 부여
        shadowOpacity: 0.2,
        shadowRadius: 6,

        // Android용 그림자
        elevation: 2,

        height: 100
    },
    image: {
        width: 120,
        height: 80,
        borderRadius: 5,
    },
    content: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    title: {
        fontSize: 14,
        fontFamily: 'Pretendard-SemiBold',
        color: '#000',
        marginBottom: 0,
    },
    location: {
        fontSize: 12,
        fontFamily: 'Pretendard-Medium',
        color: '#555',
        marginBottom: 2,
    },
    description: {
        fontSize: 10.5,
        color: '#555',
        fontFamily: 'Pretendard-Medium',
        //backgroundColor: 'black',
        height: 50
    },
});
