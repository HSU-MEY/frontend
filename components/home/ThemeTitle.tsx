import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function ThemeTitle() {
    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Image
                    source={require('../../assets/images/icons/theme.png')}
                    style={styles.icon}
                />
                <Text style={styles.title}>테마별 탐색</Text>
            </View>
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
