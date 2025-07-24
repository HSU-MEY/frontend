import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { ThemeCategory } from '../../components/theme/ThemeRouteCards';
import ThemeRouteCards from '../../components/theme/ThemeRouteCards';
import ThemeTabs from '../../components/theme/ThemeTabs';

export default function RecommendTab() {
    const [selectedCategory, setSelectedCategory] = useState<ThemeCategory>('K-Pop');

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <ThemeTabs selected={selectedCategory} onSelect={setSelectedCategory} />
                <ThemeRouteCards category={selectedCategory} limit={5} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        paddingHorizontal: 16,
        paddingVertical: 30,
        paddingBottom: 20,
    },
});
