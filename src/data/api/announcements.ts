import { Announcement, CreateAnnouncementInput, CreateAnnouncementOutput, UpdateAnnouncementInput } from "@/types/announcement";
import { UserPreview } from "@/types/user";
import { supabase } from "@/utils/supabase";
import { resolvePublicUrl } from "./commons";
import { USER_PROFILE_PICTURE_BUCKET } from "@/constants/storage";
import { ANNOUNCEMENTS_TABLE } from "@/constants/tables";

async function transformAnnouncement(raw: any): Promise<Announcement> {
    const profile_photo_url = await resolvePublicUrl(
        USER_PROFILE_PICTURE_BUCKET,
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
        expires_at: new Date(raw.expires_at),
        author,
    };
}

export async function fetchAllAnnouncementApi(): Promise<Announcement[]> {
    const { data, error } = await supabase
        .from(ANNOUNCEMENTS_TABLE)
        .select(`
            id,
            title,
            content,
            created_at,
            expires_at,
            author:users (
                id,
                name,
                profile_photo_path
            )
        `)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch announcements: ${error.message}`);
    }

    return await Promise.all(data.map(transformAnnouncement));
}

export async function fetchAnnouncementApi(id: number): Promise<Announcement | null> {
    const { data, error } = await supabase
        .from(ANNOUNCEMENTS_TABLE)
        .select(`
            id,
            title,
            content,
            created_at,
            expires_at,
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
        .from(ANNOUNCEMENTS_TABLE)
        .insert([
            {
                user_id: payload.author.id,
                title: payload.title,
                content: payload.content,
                expires_at: payload.expires_at.toISOString(),
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
    if (fieldsToUpdate.expires_at) {
        updateData.expires_at = fieldsToUpdate.expires_at.toISOString?.() ?? fieldsToUpdate.expires_at;
    }

    const { error } = await supabase
        .from(ANNOUNCEMENTS_TABLE)
        .update(updateData)
        .eq('id', id);

    if (error) {
        throw new Error(`Failed to update announcement ${id}: ${error.message}`);
    }

    return;
}

export async function deleteAnnouncementApi(id: number): Promise<void> {
    const { error } = await supabase
        .from(ANNOUNCEMENTS_TABLE)
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Failed to delete announcement ${id}: ${error.message}`);
    }

    return;
}