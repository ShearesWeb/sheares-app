import { supabase } from "@/utils/supabase";

export async function resolvePublicUrl(bucket: string, path: string | null): Promise<string | null> {
    if (!path) return null;
    return supabase.storage.from(bucket).getPublicUrl(path).data?.publicUrl ?? null;
}