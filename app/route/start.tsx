import Header from '@/components/common/Header';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AiGuideTab from './AiGuideTab';
import RecommendTab from './RecommendTab';

const tabs = ['추천 루트', 'AI가이드 추천 루트'];

export default function RouteStartScreen() {
    const [activeTab, setActiveTab] = useState(0);

    return (
        <View style={styles.container}>
            <Header title="루트" />

            {/* 탭 선택 바 */}
            <View style={styles.tabBar}>
                {tabs.map((tab, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.tabItem, activeTab === index && styles.activeTab]}
                        onPress={() => setActiveTab(index)}
                    >
                        <Text style={[styles.tabText, activeTab === index && styles.activeTabText]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 탭 내용 */}
            {activeTab === 0 ? <RecommendTab /> : <AiGuideTab />}
        </View>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        justifyContent: 'space-around',
        marginTop: 20,
        marginHorizontal: 16
    },
    tabItem: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#1C5BD8',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        margin: 0,
    },
    tabText: {
        fontFamily: 'Pretendard-SemiBold',
        fontSize: 16,
        color: '#333',
    },
    activeTabText: {
        color: '#fff',
        fontFamily: 'Pretendard-Bold'
    },
});
