// components/CustomTabBar.tsx
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const icons = [
    {
        key: 'index',
        image: require('../assets/images/nav/home.png'),
        focusedImage: require('../assets/images/nav/home_active.png'),
        width: 35,
        height: 35,
    },
    {
        key: 'map',
        image: require('../assets/images/nav/map.png'),
        focusedImage: require('../assets/images/nav/map_active.png'),
        width: 35,
        height: 35,
    },
    {
        key: 'route',
        image: require('../assets/images/nav/route.png'),
        focusedImage: require('../assets/images/nav/route.png'),
        width: 80,
        height: 80,
        center: true,
    },
    {
        key: 'chatbot',
        image: require('../assets/images/nav/chatbot.png'),
        focusedImage: require('../assets/images/nav/chatbot_active.png'),
        width: 35,
        height: 35,
    },
    {
        key: 'myroute',
        image: require('../assets/images/nav/myroute.png'),
        focusedImage: require('../assets/images/nav/myroute_active.png'),
        width: 35,
        height: 35,
    },
];

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
    const router = useRouter();

    return (
        <View
            style={styles.tabBarContainer}
        >
            {icons.map((item, index) => {
                const isFocused = state.routes[state.index].name === item.key;

                return (
                    <TouchableOpacity
                        key={item.key}
                        style={styles.tabItem}
                        onPress={() => {
                            if (item.key === 'route') {
                                router.push('/route/start'); // 탭이 아닌 라우트는 router.push로 이동
                            } else {
                                navigation.navigate(item.key);
                            }
                        }}
                    >
                        <Image
                            source={isFocused ? item.focusedImage : item.image}
                            style={{
                                width: item.width,
                                height: item.height,
                                resizeMode: 'contain',
                            }}
                        />
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
        height: 56
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
});
