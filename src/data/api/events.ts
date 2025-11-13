import { CreateEventInput, Event } from "@/types/event";
import { mockEvents } from "../mock/events";
import { getEventStatus } from "@/utils/comparators";
import { User } from "@/types/user";
import { supabase } from "@/utils/supabase";
import { EVENT_INFO_TABLE, EVENT_INFO_VIEW } from "@/constants/tables";
import { CreateEventOutput } from "@/types/event";
import {UpdateEventInput} from "@/types/event";
const USE_MOCK = false;

// api/events.ts (only the two functions below changed)

export async function fetchAllEventsApi(): Promise<Event[]> {
  console.log("Fetching all Events from API...");

  if (USE_MOCK) return Promise.resolve(mockEvents);

  const { data, error } = await supabase
    .from(EVENT_INFO_VIEW) // make sure this view selects the columns used below
    .select('*')
    .order('start_time', { ascending: false });

  if (error || !data) {
    throw new Error(`Failed to fetch events: ${error?.message ?? "Unknown error"}`);
  }

  const result: Event[] = data.map((row: any) => {
    // Map snake_case -> camelCase
    const mapped = {
      id: row.id,
      name: row.name ?? '',
      description: row.description ?? null,
      venue: row.venue ?? null,
      imageUrl: row.image_url ?? null,
      eventType: row.event_type,                 // enum/string as stored
      ccaId: Number(row.cca_id),                 // IMPORTANT for filtering
      startTime: row.start_time ? new Date(row.start_time) : new Date(),
      endTime: row.end_time ? new Date(row.end_time) : new Date(),
      signupStartTime: row.signup_start_time ? new Date(row.signup_start_time) : undefined,
      signupEndTime: row.signup_end_time ? new Date(row.signup_end_time) : undefined,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
    } as Omit<Event, 'status'>;

    // Prefer status from view if present; else compute
    const status = row.status ?? getEventStatus({
      startTime: mapped.startTime,
      endTime: mapped.endTime,
      signupStartTime: mapped.signupStartTime,
      signupEndTime: mapped.signupEndTime,
      name: mapped.name,
      description: mapped.description,
      venue: mapped.venue,
      imageUrl: mapped.imageUrl,
      ccaId: mapped.ccaId,
      eventType: mapped.eventType,
    } as CreateEventInput);

    return { ...mapped, status } as Event;
  });

  return result;
}

export async function fetchEventApi(id: number): Promise<Event | null> {
  console.log(`Fetching Event with ID ${id}...`);

  if (USE_MOCK) {
    const event = mockEvents.find(e => e.id === id) ?? null;
    return Promise.resolve(event);
  }

  const { data, error } = await supabase
    .from(EVENT_INFO_VIEW)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    console.error(`Error fetching Event with ID ${id}:`, error?.message ?? "Unknown error");
    return null;
  }

  const mapped = {
    id: data.id,
    name: data.name ?? '',
    description: data.description ?? null,
    venue: data.venue ?? null,
    imageUrl: data.image_url ?? null,
    eventType: data.event_type,
    ccaId: Number(data.cca_id),
    startTime: data.start_time ? new Date(data.start_time) : new Date(),
    endTime: data.end_time ? new Date(data.end_time) : new Date(),
    signupStartTime: data.signup_start_time ? new Date(data.signup_start_time) : undefined,
    signupEndTime: data.signup_end_time ? new Date(data.signup_end_time) : undefined,
    createdAt: data.created_at ? new Date(data.created_at) : undefined,
  } as Omit<Event, 'status'>;

  const status = data.status ?? getEventStatus({
    startTime: mapped.startTime,
    endTime: mapped.endTime,
    signupStartTime: mapped.signupStartTime,
    signupEndTime: mapped.signupEndTime,
    name: mapped.name,
    description: mapped.description,
    venue: mapped.venue,
    imageUrl: mapped.imageUrl,
    ccaId: mapped.ccaId,
    eventType: mapped.eventType,
  } as CreateEventInput);

  return { ...mapped, status } as Event;
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
        return Promise.resolve({ id, created_at: new Date() });
    }

    const { data, error } = await supabase
        .from(EVENT_INFO_TABLE)
        .insert([
            {
                start_time: event.startTime,
                end_time: event.endTime,
                name: event.name,
                description: event.description,
                venue: event.venue,
                image_url: event.imageUrl,
                cca_id: event.ccaId,
                event_type: event.eventType,
            },
        ])
        .select('id, created_at')
        .single();
    if (error) {
        throw new Error(`Failed to create event: ${error.message}`);
    }

    return {
        id: data.id,
        created_at: new Date(data.created_at)
    }

}

export async function updateEventApi(event: UpdateEventInput): Promise<void> {
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

    if (fieldsToUpdate.name) updateData.name = fieldsToUpdate.name;
    if (fieldsToUpdate.description !== undefined) updateData.description = fieldsToUpdate.description ?? null;
    if (fieldsToUpdate.venue !== undefined) updateData.venue = fieldsToUpdate.venue ?? null;
    if (fieldsToUpdate.imageUrl !== undefined) updateData.image_url = fieldsToUpdate.imageUrl ?? null;
    if (fieldsToUpdate.ccaId !== undefined) updateData.cca_id = fieldsToUpdate.ccaId ?? null;
    if (fieldsToUpdate.eventType) updateData.event_type = fieldsToUpdate.eventType;

    const { error } = await supabase
        .from(EVENT_INFO_TABLE)
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
        .from(EVENT_INFO_TABLE)
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error(`Failed to delete event ${id}: ${error.message}`);
    }

    return;
}