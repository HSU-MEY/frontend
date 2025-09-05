// hooks/useUserRoutes.ts
import { deleteUserRoutes, editUserRoutes, getUserRoutes, SavedRoutes, saveUserRoutes } from "@/api/users.routes.service";
import { useCallback, useEffect, useState } from "react";

export function useUserRoutes(status?: string) {
  const [data, setData] = useState<SavedRoutes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserRoutes(status);
      if (!res.isSuccess) throw new Error(res.message);
      setData(res.result);
    } catch (e: any) {
      setError(e?.message ?? "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { refetch(); }, [refetch]);

  const save = useCallback(async (routeId: number, date: Date, time: string) => {
    const res = await saveUserRoutes(routeId, date, time);
    if (!res.isSuccess) throw new Error(res.message);
    await refetch();
    return res.result;
  }, [refetch]);

  const edit = useCallback(async (id: number, date: Date, time: string) => {
    const res = await editUserRoutes(id, date, time);
    if (!res.isSuccess) throw new Error(res.message);
    await refetch();
  }, [refetch]);

  const remove = useCallback(async (id: number) => {
    const res = await deleteUserRoutes(id);
    if (!res.isSuccess) throw new Error(res.message);
    await refetch();
  }, [refetch]);

  return { data, loading, error, refetch, save, edit, remove };
}
