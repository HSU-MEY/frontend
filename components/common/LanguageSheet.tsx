// components/common/LanguageSheet.tsx
import { changeLanguage } from '@/i18n';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const OPTIONS = [
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '中文' },
] as const;

type Props = {
    visible: boolean;
    onClose: () => void;
};

export default function LanguageSheet({ visible, onClose }: Props) {
    const { t, i18n } = useTranslation();

    const onPick = async (code: (typeof OPTIONS)[number]['code']) => {
        await changeLanguage(code as any);
        onClose();
    };

    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <View style={styles.sheet}>
                    <Text style={styles.title}>{t('home.language')}</Text>

                    {OPTIONS.map(opt => (
                        <TouchableOpacity key={opt.code} style={styles.row} onPress={() => onPick(opt.code)}>
                            <Text
                                style={[
                                    styles.lang,
                                    i18n.language?.toLowerCase().startsWith(opt.code) && styles.selected,
                                ]}
                            >
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.close} onPress={onClose}>
                        <Text style={styles.closeText}>{t('common.close')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    sheet: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
    title: { fontSize: 16, fontFamily: 'Pretendard-Bold', color: '#000', marginBottom: 10 },
    row: { paddingVertical: 10 },
    lang: { fontSize: 16 },
    selected: { fontWeight: '700' },
    close: { marginTop: 8, alignSelf: 'flex-end' },
    closeText: { fontSize: 14, opacity: 0.7, fontFamily: 'Pretendard-Medium' },
});
