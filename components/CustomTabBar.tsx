// components/CustomTabBar.tsx
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Image,
    ImageStyle,
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// 언어 정규화
function normalizeUiLang(l?: string): 'ko' | 'en' | 'ja' | 'zh' {
    const x = (l || 'ko').toLowerCase();
    if (x.startsWith('ko')) return 'ko';
    if (x.startsWith('en')) return 'en';
    if (x.startsWith('ja')) return 'ja';
    if (x.startsWith('zh')) return 'zh';
    return 'ko';
}

// 가운데 루트 언어별 이미지
const routeIconsByLang: Record<'ko' | 'en' | 'ja' | 'zh', { default: any; focused?: any }> = {
    ko: { default: require('../assets/images/nav/route_ko.png') },
    en: { default: require('../assets/images/nav/route_en.png') },
    ja: { default: require('../assets/images/nav/route_ja.png') },
    zh: { default: require('../assets/images/nav/route_zh.png') },
};

type TabKey = 'index' | 'map' | 'route' | 'chatbot' | 'myroute';
type TabItem = {
    key: TabKey;
    image: any;
    focusedImage: any;
    hideLabel?: boolean;
    // 이 두 가지로 "픽셀"을 네이티브 스타일로 직접 지정
    iconStyle: StyleProp<ImageStyle>;
    iconFocusedStyle?: StyleProp<ImageStyle>;
};

const icons: TabItem[] = [
    {
        key: 'index',
        image: require('../assets/images/nav/home.png'),
        focusedImage: require('../assets/images/nav/home_active.png'),
        iconStyle: { width: 26, height: 26 },
        iconFocusedStyle: { width: 26, height: 26 },
    },
    {
        key: 'map',
        image: require('../assets/images/nav/map.png'),
        focusedImage: require('../assets/images/nav/map_active.png'),
        iconStyle: { width: 26, height: 26 },
        iconFocusedStyle: { width: 26, height: 26 },
    },
    {
        key: 'route',
        image: require('../assets/images/nav/route_ko.png'),   // fallback (실제는 언어별로 교체)
        focusedImage: require('../assets/images/nav/route_ko.png'),
        hideLabel: true,
        // 가운데 아이콘은 크기/위치 자유롭게
        iconStyle: { width: 74, height: 74, marginTop: 14 },
        iconFocusedStyle: { width: 74, height: 74 },
    },
    {
        key: 'chatbot',
        image: require('../assets/images/nav/chatbot.png'),
        focusedImage: require('../assets/images/nav/chatbot_active.png'),
        iconStyle: { width: 24, height: 24 },
        iconFocusedStyle: { width: 24, height: 24 },
    },
    {
        key: 'myroute',
        image: require('../assets/images/nav/myroute.png'),
        focusedImage: require('../assets/images/nav/myroute_active.png'),
        iconStyle: { width: 22, height: 22, marginBottom: 2 },
        iconFocusedStyle: { width: 22, height: 22, marginBottom: 2 },
    },
];

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const uiLang = normalizeUiLang(i18n.language);

    const labels: Record<TabKey, string> = {
        index: t('tabs.home'),
        map: t('tabs.map'),
        route: t('tabs.route'),
        chatbot: t('tabs.chatbot'),
        myroute: t('tabs.myroute'),
    };

    return (
        <View style={styles.tabBarContainer}>
            {icons.map((item) => {
                const isFocused = state.routes[state.index].name === item.key;

                const onPress = () => {
                    if (item.key === 'route') {
                        router.push('/route/start');
                    } else {
                        navigation.navigate(item.key as never);
                    }
                };

                // 이미지 소스 결정 (route만 언어별)
                const src = item.key !== 'route'
                    ? (isFocused ? item.focusedImage : item.image)
                    : ((isFocused && routeIconsByLang[uiLang].focused) ? routeIconsByLang[uiLang].focused : routeIconsByLang[uiLang].default);

                return (
                    <TouchableOpacity key={item.key} style={styles.tabItem} onPress={onPress} activeOpacity={0.8}>
                        <Image
                            source={src}
                            style={[
                                styles.icon,
                                item.iconStyle,
                                isFocused && item.iconFocusedStyle, // 포커스 시 별도 스타일 쓰고 싶을 때
                            ]}
                        />
                        {!item.hideLabel && (
                            <Text style={[styles.label, isFocused && styles.labelFocused]}>
                                {labels[item.key]}
                            </Text>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: '#EAF6FC',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 56,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    icon: {
        resizeMode: 'contain',
    },
    label: {
        marginTop: 2,
        fontSize: 10,
        color: '#000',
        fontWeight: 'bold',
    },
    labelFocused: {
        color: '#0080FF',
        fontWeight: '600',
    },
});
