import { changeLanguage } from '@/i18n';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const OPTIONS = [
    { code: 'ko', label: '한국어' },
    { code: 'en', label: 'English' },
    { code: 'ja', label: '日本語' },
    { code: 'zh', label: '中文' },
] as const;

export default function LanguagePicker() {
    const { t, i18n } = useTranslation();
    const [open, setOpen] = useState(false);

    const onPick = async (code: (typeof OPTIONS)[number]['code']) => {
        await changeLanguage(code as any);
        setOpen(false);
    };

    return (
        <>
            <TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
                <Image source={require('@/assets/images/icons/language.png')} style={styles.icon} />
                <Text style={styles.label}>{t('home.languageButton')}</Text>
            </TouchableOpacity>

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
    label: {
        fontSize: 16,
        fontFamily: 'Pretendard-Bold',
        color: '#000',
    },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    sheet: { width: '80%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
    title: {
        fontSize: 16,
        fontFamily: 'Pretendard-Bold',
        color: '#000',
        marginBottom: 10
    },
    row: { paddingVertical: 10 },
    lang: { fontSize: 16 },
    selected: { fontWeight: '700' },
    close: { marginTop: 8, alignSelf: 'flex-end' },
    closeText: { fontSize: 14, opacity: 0.7, fontFamily: 'Pretendard-Medium', }
});
