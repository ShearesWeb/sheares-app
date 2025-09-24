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
    telegram_handle?: string | null;
    profile_photo_path?: string | null;
    profile_photo_url?: string | null;
    appointments: UserAppointment[];
    is_admin: boolean;
}

export interface UserAppointment {
    cca_id: number;
    cca_name: string;
    is_admin: boolean;
    position_id: number;
    position_name: string;
    position_type: string;
}

export interface UserPreview {
    id: number;
    name: string;
    profile_photo_url: string | null;
}