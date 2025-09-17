import { supabase } from "@/utils/supabase";
import { CCA, CCAPosition } from "@/types/cca";
import { resolvePublicUrl } from "./commons";
import { PUBLIC_CCA_INFO_VIEW } from "@/constants/tables";

async function transformPositions(rawPositions: any[]): Promise<CCAPosition[]> {
    return Promise.all(
        rawPositions
            .map(async (p): Promise<CCAPosition> => ({
                id: p.id,
                type: p.type,
                name: p.name,
                capacity: p.capacity,
                description: p.description || null,
                appointments: null,
                appointmentUserIDs: p.appointments || [],
            }))
    );
}

export async function fetchAllCCAApi(): Promise<CCA[]> {
    console.log("Fetching all CCAs from API...");
    const { data, error } = await supabase
        .from(PUBLIC_CCA_INFO_VIEW)
        .select(`*`)
        .order('name', { ascending: true })

    if (error || !data) {
        throw new Error(`Failed to fetch CCAs: ${error?.message ?? "Unknown error"}`);
    }

    const result: CCA[] = await Promise.all(
        data.map(async (item: any): Promise<CCA> => {
            const positions = await transformPositions(item.positions || []);
            return { ...item, positions };
        })
    );

    return result;
}

export async function fetchCCAApi(id: number): Promise<CCA | null> {
    console.log(`Fetching CCA with ID ${id}...`);

    const { data, error } = await supabase
        .from(PUBLIC_CCA_INFO_VIEW)
        .select(`*`)
        .eq("id", id)
        .maybeSingle();

    if (error || !data) {
        console.error(`Error fetching CCA with ID ${id}:`, error?.message ?? "Unknown error");
        return null;
    }

    const positions = await transformPositions(data.positions || []);
    return { ...data, positions } as CCA;
}