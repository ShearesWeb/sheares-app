import { EventSignup } from "@/types/event-signups";
import { supabase } from "@/utils/supabase";
import { EVENT_SIGNUPS_TABLE, EVENT_SIGNUPS_INFO_VIEW } from "@/constants/tables";
import { mockEventSignups } from "../mock/event-signups";

const USE_MOCK = false;

// Fetch all signups for a specific event
export async function fetchEventSignupsByEventApi(eventId: number): Promise<EventSignup[]> {
    console.log(`Fetching signups for Event ID ${eventId}...`);

    if (USE_MOCK) {
        return Promise.resolve(mockEventSignups.filter(s => s.eventId === eventId));
    }

    const { data, error } = await supabase
        .from(EVENT_SIGNUPS_INFO_VIEW)
        .select('*')
        .eq('event_id', eventId)
        .order('signed_up_at', { ascending: true });

    if (error || !data) {
        throw new Error(`Failed to fetch signups for event ${eventId}: ${error?.message ?? "Unknown error"}`);
    }

    return data.map((s: any) => ({
        ...s,
        signedUpAt: new Date(s.signed_up_at),
    }));
}

// Fetch all signups for a specific user
export async function fetchEventSignupsByUserApi(userId: number): Promise<EventSignup[]> {
    console.log(`Fetching signups for User ID ${userId}...`);

    if (USE_MOCK) {
        return mockEventSignups.filter(s => s.userId === userId);
    }

    const { data, error } = await supabase
        .from(EVENT_SIGNUPS_INFO_VIEW)
        .select('*')
        .eq('user_id', userId)
        .order('signed_up_at', { ascending: false });

    if (error || !data) {
        throw new Error(`Failed to fetch signups for user ${userId}: ${error?.message ?? "Unknown error"}`);
    }

    return data.map((s: any) => ({
        ...s,
        signedUpAt: new Date(s.signed_up_at),
    }));
}

// Create a new signup
export async function createEventSignupApi(signup: EventSignup): Promise<void> {
    console.log(`Creating signup for User ${signup.userId} to Event ${signup.eventId}...`);

    if (USE_MOCK) {
        mockEventSignups.push({ ...signup, signedUpAt: signup.signedUpAt || new Date() });
        return;
    }

    const { error } = await supabase
        .from(EVENT_SIGNUPS_TABLE)
        .insert([
            {
                user_id: signup.userId,
                event_id: signup.eventId,
                sign_up_time: signup.signedUpAt || new Date(),
                check_in_time: null,
            },
        ]);

    if (error) {
        throw new Error(`Failed to create signup: ${error.message}`);
    }
}

// Delete a signup (unsubscribe)
export async function deleteEventSignupApi(userId: number, eventId: number): Promise<void> {
    console.log(`Deleting signup for User ${userId} from Event ${eventId}...`);

    if (USE_MOCK) {
        const index = mockEventSignups.findIndex(s => s.userId === userId && s.eventId === eventId);
        if (index === -1) throw new Error(`Signup not found for user ${userId} and event ${eventId}`);
        mockEventSignups.splice(index, 1);
        return;
    }

    const { error } = await supabase
        .from(EVENT_SIGNUPS_TABLE)
        .delete()
        .eq('user_id', userId)
        .eq('event_id', eventId);

    if (error) {
        throw new Error(`Failed to delete signup: ${error.message}`);
    }
}

// Check if a user is already signed up for an event 
export async function isUserSignedUpApi(userId: number, eventId: number): Promise<boolean> {
    console.log(`Checking signup status: User ${userId} ↔ Event ${eventId}...`);

    if (USE_MOCK) {
        return mockEventSignups.some(s => s.userId === userId && s.eventId === eventId);
    }

    // Use the base table for existence checks (most efficient with a composite unique index on (user_id, event_id)) 
    const { count, error } = await supabase
        .from(EVENT_SIGNUPS_TABLE)
        .select('event_id', { count: 'exact', head: true }) // head: true avoids returning row data 
        .eq('user_id', userId)
        .eq('event_id', eventId);

    if (error) {
        throw new Error(`Failed to check signup status: ${error.message}`);
    }

    return (count ?? 0) > 0;
}
