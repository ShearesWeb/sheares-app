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
    appointments: UserAppointment[];
    usergroups: UserGroup[];
    is_admin: boolean;
}

export interface UserAppointment {
    cca_id: number;
    cca_name: string;
    // position_id: number;
    position_name: string;
    position_type: string;
}

export interface UserGroup {
    id: number;
    name: string;
    description: string;
}

export interface UserPreview {
    id: number;
    name: string;
    profile_photo_url: string | null;
}