import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export const removeAccess = () => AsyncStorage.removeItem(ACCESS_KEY);
export const removeRefresh = () => AsyncStorage.removeItem(REFRESH_KEY);
export const clearTokens = async () => { await removeAccess(); await removeRefresh(); };
