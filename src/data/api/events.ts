import { CreateEventInput, Event } from "@/types/event";
import { mockEvents } from "../mock/events";
import { getEventStatus } from "@/utils/comparators";
import { User } from "@/types/user";
import { supabase } from "@/utils/supabase";
import { EVENT_INFO_VIEW } from "@/constants/tables";
import { CreateEventOutput } from "@/types/event";
import {UpdateEventInput} from "@/types/event";
const USE_MOCK = true;

export async function fetchAllEventsApi(): Promise<Event[]> {
    if (USE_MOCK) {
        return Promise.resolve(mockEvents);
    }

    // Replace with real API call
    // Example:
    // const response = await fetch('/api/events');
    // return response.json();

    return Promise.resolve([]);
}

export async function fetchEventApi(id: number): Promise<Event | null> {
    if (USE_MOCK) {
        const event = mockEvents.find(e => e.id === id) ?? null;
        return Promise.resolve(event);
    }

    // Replace with real API call
    // Example:
    // const response = await fetch(`/api/events/${id}`);
    // if (!response.ok) return null;
    // return response.json();

    return Promise.resolve(null);
}

export async function createEventApi(event: CreateEventInput): Promise<CreateEventOutput> {
    if (USE_MOCK) {
        const id = mockEvents.length + 1
        const newEvent: Event = {
            id,
            status: getEventStatus(event),
            ...event
        }
        // Update event in mockEvents array
        mockEvents.push(newEvent);

        // Return updated event
        return Promise.resolve({id, created_at: new Date()});
    }

    const { data, error } = await supabase
                .from(EVENT_INFO_VIEW)
                .insert([
                    {
                        startTime: event.startTime,
    endTime: event.endTime,
    signupStartTime: event.signupStartTime,
    signupEndTime: event.signupEndTime,
    name: event.name,
    description: event.description,
    venue: event.venue,
    imageUrl: event.imageUrl,
    ccaId: event.ccaId,
    eventType: event.eventType,
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
    }

}

export async function updateEventApi(event:UpdateEventInput ): Promise<void> {
    // if (USE_MOCK) {
    //     const index = mockEvents.findIndex(e => e.id === event.id);
    //     if (index === -1) {
    //         throw new Error(`Event with id ${event.id} not found`);
    //     }

    //     // Update event in mockEvents array
    //     mockEvents[index] = event;

    //     // Return updated event
    //     return Promise.resolve();
    // }

    const { id, ...fieldsToUpdate } = event;
    
        if (Object.keys(fieldsToUpdate).length === 0) {
            throw new Error('No fields provided for update.');
        }
    
        // Format the fields
        const updateData: any = {};
    if (fieldsToUpdate.startTime) updateData.start_time = fieldsToUpdate.startTime.toISOString?.() ?? fieldsToUpdate.startTime;
    if (fieldsToUpdate.endTime) updateData.end_time = fieldsToUpdate.endTime.toISOString?.() ?? fieldsToUpdate.endTime;
    if (fieldsToUpdate.signupStartTime !== undefined) {
        updateData.signup_start_time = fieldsToUpdate.signupStartTime
            ? fieldsToUpdate.signupStartTime.toISOString?.() ?? fieldsToUpdate.signupStartTime
            : null;
    }
    if (fieldsToUpdate.signupEndTime !== undefined) {
        updateData.signup_end_time = fieldsToUpdate.signupEndTime
            ? fieldsToUpdate.signupEndTime.toISOString?.() ?? fieldsToUpdate.signupEndTime
            : null;
    }
    if (fieldsToUpdate.name) updateData.name = fieldsToUpdate.name;
    if (fieldsToUpdate.description !== undefined) updateData.description = fieldsToUpdate.description ?? null;
    if (fieldsToUpdate.venue !== undefined) updateData.venue = fieldsToUpdate.venue ?? null;
    if (fieldsToUpdate.imageUrl !== undefined) updateData.image_url = fieldsToUpdate.imageUrl ?? null;
    if (fieldsToUpdate.ccaId !== undefined) updateData.cca_id = fieldsToUpdate.ccaId ?? null;
    if (fieldsToUpdate.eventType) updateData.event_type = fieldsToUpdate.eventType;
    if (fieldsToUpdate.status) updateData.status = fieldsToUpdate.status;
    
        const { error } = await supabase
            .from(EVENT_INFO_VIEW)
            .update(updateData)
            .eq('id', id);
    
        if (error) {
            throw new Error(`Failed to update event ${id}: ${error.message}`);
        }
    
        return;
}

export async function deleteEventApi(id: number): Promise<void> {
    if (USE_MOCK) {
        const index = mockEvents.findIndex(e => e.id === id);
        if (index === -1) {
            throw new Error(`Event with id ${id} not found`);
        }

        // Remove event from mockEvents array
        mockEvents.splice(index, 1);

        return Promise.resolve();
    }

    const { error } = await supabase
            .from(EVENT_INFO_VIEW)
            .delete()
            .eq('id', id);
    
        if (error) {
            throw new Error(`Failed to delete event ${id}: ${error.message}`);
        }
    
        return;
}