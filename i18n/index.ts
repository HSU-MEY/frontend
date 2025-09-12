// i18n/index.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import zh from './locales/zh.json';

const STORAGE_KEY = 'app_language';

export const supportedLngs = ['ko', 'en', 'ja', 'zh'] as const;
export type SupportedLng = typeof supportedLngs[number];

async function getInitialLanguage(): Promise<SupportedLng> {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved && supportedLngs.includes(saved as SupportedLng)) return saved as SupportedLng;

    const device = Localization.getLocales?.()[0]?.languageCode ?? 'ko';
    const fallback: SupportedLng = supportedLngs.includes(device as SupportedLng) ? (device as SupportedLng) : 'ko';
    return fallback;
}

export async function initI18n() {
    const initialLng = await getInitialLanguage();

    await i18n
        .use(initReactI18next)
        .init({
            lng: initialLng,
            fallbackLng: 'ko',
            supportedLngs,
            resources: {
                ko: { translation: ko },
                en: { translation: en },
                ja: { translation: ja },
                zh: { translation: zh },
            },
            interpolation: { escapeValue: false },
        });

    return i18n;
}

export async function changeLanguage(lng: SupportedLng) {
    await i18n.changeLanguage(lng);
    await AsyncStorage.setItem(STORAGE_KEY, lng);
}

export default i18n;
