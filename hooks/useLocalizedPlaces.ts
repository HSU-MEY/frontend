// hooks/useLocalizedPlaces.ts
import { fetchPlaceDetail, PlaceDetailDTO } from '@/api/places.service';
import { useEffect, useMemo, useState } from 'react';

export function useLocalizedPlaces(placeIds: number[]) {
    const ids = useMemo(
        () => Array.from(new Set(placeIds.filter((x): x is number => Number.isFinite(x as any)))),
        [placeIds]
    );
    const [map, setMap] = useState<Record<number, PlaceDetailDTO | null>>({});

    useEffect(() => {
        let cancelled = false;
        if (ids.length === 0) return;

        (async () => {
            const results = await Promise.all(
                ids.map((id) => fetchPlaceDetail(id).catch(() => null))
            );
            if (cancelled) return;
            const m: Record<number, PlaceDetailDTO | null> = {};
            results.forEach((p, i) => { m[ids[i]] = p; });
            setMap(m);
        })();

        return () => { cancelled = true; };
    }, [ids.join(',')]);

    return map; // id -> PlaceDetailDTO
}
