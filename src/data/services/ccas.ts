import { CCAType, CCA } from '@/types/cca';
import { InMemoryCache } from '@/utils/cache';
import { getEventStatus } from '@/utils/comparators';
import { fetchAllCCAApi, fetchCCAApi } from '../api/ccas';
import { fetchUserPreviewsFromBackend } from '../api/user';

const CCACache: InMemoryCache = new InMemoryCache();
const CACHE_KEY = "ccas"

export interface CategorizedCCAs {
    [CCAType.Sports]: CCA[];
    [CCAType.Committee]: CCA[];
    [CCAType.Culture]: CCA[];
    [CCAType.JCRC]: CCA[];
}


export async function getCategorizedCCAs(): Promise<CategorizedCCAs> {
    const result: CategorizedCCAs = {
        [CCAType.Sports]: [],
        [CCAType.Committee]: [],
        [CCAType.Culture]: [],
        [CCAType.JCRC]: [],
    };

    let isCacheHit = true;

    for (const type of Object.values(CCAType)) {
        const cached = CCACache.cGetCategory<CCA>(CACHE_KEY, type);
        if (cached) {
            result[type] = cached;
        } else {
            isCacheHit = false;
        }
    }

    if (isCacheHit) return result;

    const allCCAs = await fetchAllCCAApi();

    // Group by type
    const grouped: Record<CCAType, CCA[]> = {
        [CCAType.Sports]: [],
        [CCAType.Committee]: [],
        [CCAType.Culture]: [],
        [CCAType.JCRC]: [],
    };

    for (const cca of allCCAs) {
        grouped[cca.cca_type].push(cca);
    }

    // Convert arrays into id -> value maps and cache the entire category
    for (const type of Object.values(CCAType)) {
        const list = grouped[type];
        const map: Record<string, CCA> = {};
        for (const cca of list) {
            map[cca.id.toString()] = cca;
        }
        CCACache.cSetCategory(CACHE_KEY, type, map);
    }

    return grouped;
}

export async function getCCA(id: number): Promise<CCA | null> {
    let cca = CCACache.cGet<CCA>(CACHE_KEY, id.toString());

    if (!cca) {
        cca = await fetchCCAApi(id);
    }

    if (!cca) return null;

    for (const position of cca.positions) {
        if (!position.appointments) {
            if (position.appointmentUserIDs && position.appointmentUserIDs.length > 0) {
                position.appointments = await fetchUserPreviewsFromBackend(position.appointmentUserIDs);

            } else {
                position.appointments = [];
            }
        }
    }

    CCACache.cSet(CACHE_KEY, cca.cca_type, id.toString(), cca);

    return cca;
}