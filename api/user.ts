// src/api/user.ts
import { http } from '@/src/lib/http';

export type UserProfile = {
    id: number; nickname: string; email: string; role: 'USER' | 'ADMIN' | string;
};
type Envelope<T> = { isSuccess: boolean; code: string; message: string; result: T };

export async function getMyProfile(): Promise<UserProfile> {
    const res = await http.get<Envelope<UserProfile>>('/users/profiles'); // baseURL에 /api 포함!
    return res.data.result;
}
