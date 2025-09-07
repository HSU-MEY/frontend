// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ACCESS_KEY = 'accessToken';
export const REFRESH_KEY = 'refreshToken';

export const getAccess = () => AsyncStorage.getItem(ACCESS_KEY);
export const getRefresh = () => AsyncStorage.getItem(REFRESH_KEY);

export const setTokens = async (at: string, rt?: string) => {
    await AsyncStorage.setItem(ACCESS_KEY, at);
    if (rt) await AsyncStorage.setItem(REFRESH_KEY, rt);
};

export const removeAccess = () => AsyncStorage.removeItem(ACCESS_KEY);
export const removeRefresh = () => AsyncStorage.removeItem(REFRESH_KEY);
export const clearTokens = async () => { await removeAccess(); await removeRefresh(); };
