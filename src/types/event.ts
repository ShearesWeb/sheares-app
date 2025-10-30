export enum EventType {
    Welfare = 'welfare',
    Event = 'event',
    Fundraiser = 'fundraiser',
    Election = 'election',
}

export enum EventStatus {
    SignedUp = 'signed up',
    Upcoming = 'upcoming',
    Current = 'current',
    Past = 'past',
}


export interface Event {
    id: number;
    startTime: Date;
    endTime: Date;
    signupStartTime?: Date | null;
    signupEndTime?: Date | null;
    name: string;
    description?: string | null;
    venue?: string | null;
    imageUrl?: string | null;
    ccaId: number;
    eventType: EventType;
    status: EventStatus;
}

export type CreateEventInput = Omit<Event, 'id' | 'status'>;
export type EventLike = Event | CreateEventInput;
export type CreateEventOutput = {
    id: number;
    created_at: Date;
};

export type UpdateEventInput = {
    id: number;
} & Partial<Omit<Event, 'id' | 'created_at' | 'author'>>;
