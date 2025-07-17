import { Announcement, CreateAnnouncementInput, CreateAnnouncementOutput, UpdateAnnouncementInput } from "@/types/announcement";
import { UserPreview } from "@/types/user";
import { supabase } from "@/utils/supabase";
import { resolvePublicUrl } from "./commons";

async function transformAnnouncement(raw: any): Promise<Announcement> {
    const profile_photo_url = await resolvePublicUrl(
        'user-profile-pictures',
        raw.author?.profile_photo_path ?? null
    );

    const author = {
        id: raw.author.id,
        name: raw.author.name,
        profile_photo_url,
    };

    return {
        id: raw.id,
        title: raw.title,
        content: raw.content,
        created_at: new Date(raw.created_at),
        expiry_time: new Date(raw.expiry_time),
        author,
    };
}

export async function fetchAllAnnouncementApi(): Promise<Announcement[]> {
    const { data, error } = await supabase
        .from('announcements')
        .select(`
            id,
            title,
            content,
            created_at,
            expiry_time,
            author:users (
                id,
                name,
                profile_photo_path
            )
        `)
        .gt('expiry_time', new Date().toISOString())
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch announcements: ${error.message}`);
    }

    return await Promise.all(data.map(transformAnnouncement));
}

export async function fetchAnnouncementApi(id: number): Promise<Announcement | null> {
    const { data, error } = await supabase
        .from('announcements')
        .select(`
            id,
            title,
            content,
            created_at,
            expiry_time,
            author:users (
                id,
                name,
                profile_photo_path
            )
        `)
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed to fetch announcement ${id}: ${error.message}`);
    }

    return data ? await transformAnnouncement(data) : null;
}

export async function createAnnouncementApi(payload: CreateAnnouncementInput): Promise<CreateAnnouncementOutput> {
    const { data, error } = await supabase
        .from('announcements')
        .insert([
            {
                user_id: payload.author.id,
                title: payload.title,
                content: payload.content,
                expiry_time: payload.expiry_time.toISOString(),
            },
        ])
        .select('id, created_at')
        .single();

    if (error) {
        throw new Error(`Failed to create announcement: ${error.message}`);
    }

    return {
        id: data.id,
        created_at: new Date(data.created_at)
    };
}

export async function updateAnnouncementApi(payload: UpdateAnnouncementInput): Promise<void> {
    const { id, ...fieldsToUpdate } = payload;

    if (Object.keys(fieldsToUpdate).length === 0) {
        throw new Error('No fields provided for update.');
    }

    // Format the fields
    const updateData: any = {};
    if (fieldsToUpdate.title) updateData.title = fieldsToUpdate.title;
    if (fieldsToUpdate.content) updateData.content = fieldsToUpdate.content;
    if (fieldsToUpdate.expiry_time) {
        updateData.expiry_time = fieldsToUpdate.expiry_time.toISOString?.() ?? fieldsToUpdate.expiry_time;
    }

    const { error } = await supabase
        .from('announcements')
        .update(updateData)
        .eq('id', id);

    if (error) {
        throw new Error(`Failed to update announcement ${id}: ${error.message}`);
    }

    return;
}

export async function deleteAnnouncementApi(id: number): Promise<void> {
    const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Failed to delete announcement ${id}: ${error.message}`);
    }

    return;
}