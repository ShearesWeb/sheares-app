import { UserPreview } from "./user";

// Interface for the cca table
export interface Announcement {
    id: number;
    title: string;
    content: string;
    created_at: Date;
    expiry_time: Date;
    author: UserPreview;
}

export type CreateAnnouncementInput = Omit<Announcement, 'id' | 'created_at'>;
export interface CreateAnnouncementOutput {
    id: number;
    created_at: Date;
}

export type UpdateAnnouncementInput = {
    id: number;
} & Partial<Omit<Announcement, 'id' | 'created_at' | 'author'>>;