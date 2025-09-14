// components/common/LanguagePicker.tsx
import { changeLanguage } from '@/i18n';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ImageStyle, Modal, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

const OPTIONS = [
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '中文' },
] as const;

type Variant = 'button' | 'link' | 'icon';

type Props = {
    /** 트리거 모양: 기본 버튼 / 링크 텍스트 / 아이콘 */
    variant?: Variant;
    /** 링크/텍스트 색 (variant="link"에 주로 사용) */
    color?: string;
    /** 트리거에 표시할 라벨 대체(없으면 i18n 키 사용) */
    labelOverride?: string;
    /** 컨테이너 스타일 (바깥 래퍼) */
    containerStyle?: ViewStyle;
    /** 트리거 터치 영역 스타일 */
    triggerStyle?: ViewStyle;
    /** 트리거 텍스트 스타일 */
    textStyle?: TextStyle;
    /** 아이콘 스타일 */
    iconStyle?: ImageStyle;
};

export default function LanguagePicker({
    variant = 'button',
    color = '#0080FF',
    labelOverride,
    containerStyle,
    triggerStyle,
    textStyle,
    iconStyle,
}: Props) {
    const { t, i18n } = useTranslation();
    const [open, setOpen] = useState(false);

    const onPick = async (code: (typeof OPTIONS)[number]['code']) => {
        await changeLanguage(code as any);
        setOpen(false);
    };

    const openModal = () => setOpen(true);

    // ── 트리거 렌더링 (모양만 다르게, 기능 동일) ───────────────────────────────
    let Trigger: React.ReactNode = null;

    if (variant === 'link') {
        Trigger = (
            <TouchableOpacity onPress={openModal} style={[{ paddingVertical: 4, paddingHorizontal: 6 }, triggerStyle]}>
                <Text style={[{ color, fontWeight: '600' }, textStyle]}>
                    {labelOverride ?? i18n.language.toUpperCase()}
                </Text>
            </TouchableOpacity>
        );
    } else if (variant === 'icon') {
        Trigger = (
            <TouchableOpacity onPress={openModal} style={triggerStyle}>
                <Image source={require('@/assets/images/icons/language.png')} style={[styles.icon, iconStyle]} />
            </TouchableOpacity>
        );
    } else {
        // 'button' (기존 스타일 최대한 유지)
        Trigger = (
            <TouchableOpacity onPress={openModal} style={[styles.button, triggerStyle]}>
                <Image source={require('@/assets/images/icons/language.png')} style={[styles.icon, iconStyle]} />
                <Text style={[styles.label, textStyle]}>
                    {labelOverride ?? t('home.languageButton')}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <>
            <View style={containerStyle}>{Trigger}</View>

            <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
                <View style={styles.backdrop}>
                    <View style={styles.sheet}>
                        <Text style={styles.title}>{t('home.language')}</Text>
                        {OPTIONS.map(opt => (
                            <TouchableOpacity key={opt.code} style={styles.row} onPress={() => onPick(opt.code)}>
                                <Text style={[styles.lang, i18n.language === opt.code && styles.selected]}>{opt.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.close} onPress={() => setOpen(false)}>
                            <Text style={styles.closeText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    button: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 0, backgroundColor: 'white', borderRadius: 16 },
    icon: { width: 20, height: 20, marginRight: 8, resizeMode: 'contain' },
    label: { fontSize: 16, fontFamily: 'Pretendard-Bold', color: '#000' },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    sheet: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
    title: { fontSize: 16, fontFamily: 'Pretendard-Bold', color: '#000', marginBottom: 10 },
    row: { paddingVertical: 10 },
    lang: { fontSize: 16 },
    selected: { fontWeight: '700' },
    close: { marginTop: 8, alignSelf: 'flex-end' },
    closeText: { fontSize: 14, opacity: 0.7, fontFamily: 'Pretendard-Medium' },
});
