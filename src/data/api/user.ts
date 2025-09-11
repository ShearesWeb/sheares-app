import { supabase } from "@/utils/supabase";
import { decode } from 'base64-arraybuffer'
import { ImagePickerAsset } from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { User, UserPreview } from "@/types/user";
import { resolvePublicUrl } from "./commons";
import { hasAdminAppointments } from "@/utils/comparators";

export async function fetchUserPreviewsFromBackend(ids: number[]): Promise<UserPreview[] | null> {
    if (!ids || ids.length === 0) {
        console.warn('No user IDs provided for fetching previews.');
        return [];
    }
    console.log('Fetching user previews for IDs:', ids);
    const { data, error } = await supabase
        .from('public_users')
        .select('id, name, profile_photo_path')
        .in('id', ids);

    if (error) {
        console.error('Supabase error fetching user previews:', error.message);
        return [];
    }

    if (!data) return [];

    const previews: UserPreview[] = await Promise.all(
        data.map(async (user: any) => ({
            id: user.id,
            name: user.name,
            profile_photo_url: await resolvePublicUrl('user-profile-pictures', user.profile_photo_path),
        }))
    );

    return previews;
}


export async function fetchUserFromBackend(email: string): Promise<User | null> {
    const { data, error } = await supabase
        .from('authenticated_user')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (error) {
        console.error('Supabase error fetching user:', error.message);
        return null;
    }

    if (!data) return null;
    console.log('Fetched user data:', data);

    const publicUrl = data.profile_photo_path
        ? await resolvePublicUrl('user-profile-pictures', data.profile_photo_path)
        : null;

    return {
        ...data,
        profile_photo_url: publicUrl ?? null,
        is_admin: hasAdminAppointments(data.appointments || []),
    } as User;
}


export async function uploadUserProfilePictureStorage(
    userId: number,
    originalPath: string | null,
    fileData: ImagePickerAsset
): Promise<string> {
    const manipulated = await ImageManipulator.manipulateAsync(
        fileData.uri,
        [{ resize: { width: 256, height: 256 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true },
    );


    if (!manipulated.base64) {
        throw new Error(`Error uploading image: base64 data not found`);
    }

    if (originalPath) {
        const deleteResult = await supabase.storage.from('user-profile-pictures').remove([originalPath]);
        if (deleteResult.error) {
            console.warn(`Warning: Could not delete original image: ${deleteResult.error.message}`);
        }
    }

    const filePath = `user-${userId}-${new Date().getTime()}.jpg`;
    const { data, error } = await supabase.storage
        .from('user-profile-pictures')
        .upload(filePath, decode(manipulated.base64), {
            contentType: "image/jpeg",
        });

    if (error) {
        throw new Error(`Error uploading image: ${error.message}`);
    }

    return data.path;
}



export async function updateUserProfilePictureApi(userId: number, filePath: string): Promise<string> {
    const { error } = await supabase
        .from("users")
        .update({ profile_photo_path: filePath })
        .eq("id", userId);

    if (error) {
        throw new Error(`Error updating user profile picture: ${error.message}`);
    }

    const publicUrl = await resolvePublicUrl("user-profile-pictures", filePath);
    if (!publicUrl) {
        throw new Error("Failed to resolve public URL for profile picture.");
    }

    return publicUrl;
}


export async function updateUserExpoPushTokenApi(userId: number, token: string): Promise<void> {
    const { error } = await supabase
        .from("users")
        .update({ expo_push_token: token })
        .eq("id", userId);

    if (error) {
        throw new Error(`Error updating user expo push token: ${error.message}`);
    }

    return;
}

