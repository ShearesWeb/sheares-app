export enum UserType {
    User = 'user',
    Guest = 'guest',
}

export interface User {
    id: number;
    name: string;
    display_name: string;
    room: string;
    email: string;
    sheares_app_points: number;
    profile_photo_path?: string | null;
    profile_photo_url?: string | null;
}

export interface UserPreview {
    id: number;
    name: string;
    profile_photo_url: string | null;
}