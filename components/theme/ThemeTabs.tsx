import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ThemeCategory } from './ThemeRouteCards';

const CATEGORIES: { key: ThemeCategory; label: string; icon: any }[] = [
    {
        key: 'K-Pop',
        label: 'K-POP',
        icon: require('../../assets/images/icons/k-pop.png'),
    },
    {
        key: 'K-Drama',
        label: 'K-Drama',
        icon: require('../../assets/images/icons/k-drama.png'),
    },
    {
        key: 'K-Beauty',
        label: 'K-Beauty',
        icon: require('../../assets/images/icons/k-beauty.png'),
    },
    /*
    {
        key: 'K-Fashion',
        label: 'K-Fashion',
        icon: require('../../assets/images/icons/k-fashion.png'),
    },
    {
        key: 'K-Food',
        label: 'K-Food',
        icon: require('../../assets/images/icons/k-food.png'),
    },
    */
];

interface ThemeTabsProps {
    selected: ThemeCategory;
    onSelect: (category: ThemeCategory) => void;
}

export default function ThemeTabs({ selected, onSelect }: ThemeTabsProps) {
    return (
        <View style={styles.tabRowContainer}>
            {CATEGORIES.map((item) => (
                <TouchableOpacity
                    key={item.key}
                    onPress={() => onSelect(item.key)}
                    style={styles.tab}
                >
                    <View style={styles.tabInner}>
                        <Image source={item.icon} style={styles.tabIcon} />
                        <Text style={styles.tabText}>{item.label}</Text>
                        {selected === item.key && <View style={styles.activeUnderline} />}
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    tabRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        marginBottom: 18,
    },
    tab: {
        alignItems: 'center',
        flex: 1,
    },
    tabInner: {
        alignItems: 'center',
    },
    tabIcon: {
        width: 20,
        height: 20,
        marginBottom: 5,
        resizeMode: 'contain',
    },
    tabText: {
        fontSize: 13,
        fontFamily: 'Pretendard-SemiBold',
        color: '#000',
    },
    activeUnderline: {
        marginTop: 5,
        height: 2,
        width: 60,
        backgroundColor: '#279FFF',
        borderRadius: 1,
    },

});
