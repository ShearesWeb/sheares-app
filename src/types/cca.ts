import { UserPreview } from "./user";

// Enum for cca_type
export enum CCAType {
    Sports = 'sports',
    Committee = 'committee',
    Culture = 'culture',
    JCRC = 'jcrc',
}

export enum CCAPositionType {
    Chair = 'chair',
    Head = 'head',
    Captain = 'captain',
    Vice = 'vice',
    Maincomm = 'maincomm',
    Subcomm = 'subcomm',
    Member = 'member',
}

// Interface for the cca table
export interface CCA {
    id: number;
    name: string;
    cca_type: CCAType;
    description?: string | null;
    image_url?: string | null;
    positions: CCAPosition[];
}

export interface CCAPosition {
    id: number;
    name: string;
    type: CCAPositionType;
    capacity: number;
    description?: string | null;
    appointments: UserPreview[] | null;
    appointmentUserIDs: number[];
}