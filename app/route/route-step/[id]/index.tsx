import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

export default function RouteStepIdIndex() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  useEffect(() => {
    if (id) {
      router.replace(`/route/route-step/${id}/1`);
    }
  }, [id]);

  return null;
}
