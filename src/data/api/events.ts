import { CreateEventInput, Event } from "@/types/event";
import { mockEvents } from "../mock/events";
import { getEventStatus } from "@/utils/comparators";

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

export async function createEventApi(event: CreateEventInput): Promise<Event> {
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
        return Promise.resolve(newEvent);
    }

    // Replace with real API call
    // Example:
    // const response = await fetch(`/api/events/${event.id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event),
    // });
    // if (!response.ok) throw new Error('Failed to update event');
    // return response.json();

    return Promise.resolve({ id: 1, status: getEventStatus(event), ...event }); // fallback
}

export async function updateEventApi(event: Event): Promise<Event> {
    if (USE_MOCK) {
        const index = mockEvents.findIndex(e => e.id === event.id);
        if (index === -1) {
            throw new Error(`Event with id ${event.id} not found`);
        }

        // Update event in mockEvents array
        mockEvents[index] = event;

        // Return updated event
        return Promise.resolve(event);
    }

    // Replace with real API call
    // Example:
    // const response = await fetch(`/api/events/${event.id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event),
    // });
    // if (!response.ok) throw new Error('Failed to update event');
    // return response.json();

    return Promise.resolve(event); // fallback
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

    // Replace with real API call
    // Example:
    // const response = await fetch(`/api/events/${id}`, {
    //   method: 'DELETE',
    // });
    // if (!response.ok) throw new Error('Failed to delete event');

    return Promise.resolve();
}