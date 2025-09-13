import { Routes } from '@/api/routes.service';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Image,
    ImageSourcePropType,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

function langSuffix(langCode?: string): 'Ko' | 'En' | 'Jp' | 'Ch' {
    const l = (langCode || 'ko').toLowerCase();
    if (l.startsWith('ko')) return 'Ko';
    if (l.startsWith('en')) return 'En';
    if (l.startsWith('ja')) return 'Jp';
    if (l.startsWith('zh')) return 'Ch';
    return 'Ko';
}

function pickLocalizedField<T extends Record<string, any>>(
    p: T | null | undefined,
    base: string,
    langCode?: string
): string {
    if (!p) return '';
    const suf = langSuffix(langCode);
    const tryKeys = [
        `${base}${suf}`,
        `${base}En`,
        `${base}Ko`,
        `${base}Jp`,
        `${base}Ch`,
        base,
    ];
    for (const k of tryKeys) {
        const v = (p as any)[k];
        if (typeof v === 'string' && v.trim()) return v;
    }
    return '';
}

type ThemeRouteCardProps =
    | {
        /** 라우트 전체를 넘기면 내부에서 다국어 필드 선택 */
        route: Routes;
        imageOverride?: ImageSourcePropType;
    }
    | {
        /** 기존 방식도 지원 (문자열 직접 전달) */
        id: number;
        image: ImageSourcePropType;
        title: string;
        location: string;
        description: string;
        route?: never;
    };

export default function ThemeRouteCard(props: ThemeRouteCardProps) {
    const { i18n } = useTranslation();

    // route가 있으면 그걸 우선 사용, 없으면 개별 props 사용
    const route = 'route' in props ? props.route : undefined;

    const resolvedId =
        (route?.routeId as number | undefined) ??
        ('id' in props ? props.id : undefined);

    const imageSrc: ImageSourcePropType =
        ('imageOverride' in props && props.imageOverride) ||
        (route?.imageUrl ? { uri: route.imageUrl } : undefined) ||
        ('image' in props ? props.image : require('@/assets/images/placeholder-place.png'));

    const title =
        (route && (pickLocalizedField(route, 'title', i18n.language) || route.title)) ||
        ('title' in props ? props.title : '') ||
        '';

    const location =
        (route &&
            (pickLocalizedField(route, 'regionName', i18n.language) ||
                // 백엔드가 regionNameKo만 주는 경우 대비
                (route as any).regionNameKo ||
                (route as any).regionName)) ||
        ('location' in props ? props.location : '') ||
        '';

    const description =
        (route &&
            (pickLocalizedField(route, 'description', i18n.language) ||
                route.description)) ||
        ('description' in props ? props.description : '') ||
        '';

    const onPress = () => {
        if (resolvedId != null) {
            router.push(`/route/route-overview/${resolvedId}`);
        }
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} disabled={resolvedId == null}>
            <Image source={imageSrc} style={styles.image} />

            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                </Text>

                {!!location && (
                    <Text style={styles.location} numberOfLines={1}>
                        {location}
                    </Text>
                )}

                {!!description && (
                    <Text style={styles.description} numberOfLines={4} ellipsizeMode="tail">
                        {description}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
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

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 2,

        height: 100,
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
        height: 50,
    },
});
