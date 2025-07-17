import { CreateEventInput, Event, EventStatus } from '@/types/event';
import { createEventApi, deleteEventApi, fetchAllEventsApi, fetchEventApi, updateEventApi } from '../api/events';
import { InMemoryCache } from '@/utils/cache';
import { getEventStatus } from '@/utils/comparators';

const CACHE_KEY = 'events:categorized';
const EventsCache: InMemoryCache = new InMemoryCache();

export interface CategorizedEvents {
    signedUp?: Event[];
    upcoming: Event[];
    current: Event[];
}


/**
 * Gets categorized events from cache or fallback to fetching and categorizing from API.
 */
export async function getCategorizedEvents(): Promise<CategorizedEvents> {
    const signedUp = EventsCache.cGetCategory<Event>(CACHE_KEY, EventStatus.SignedUp);
    const current = EventsCache.cGetCategory<Event>(CACHE_KEY, EventStatus.Current);
    const upcoming = EventsCache.cGetCategory<Event>(CACHE_KEY, EventStatus.Upcoming);

    // If cache hit, return directly
    if (signedUp && current && upcoming) {
        return { signedUp, current, upcoming };
    }

    // Fallback: fetch from API and categorize
    const allEvents = await fetchAllEventsApi();

    const signedUpMap: Record<string, Event> = {};
    const currentMap: Record<string, Event> = {};
    const upcomingMap: Record<string, Event> = {};

    for (const event of allEvents) {
        const status = getEventStatus(event);
        switch (status) {
            case EventStatus.Current:
                currentMap[event.id.toString()] = event;
                break;
            case EventStatus.SignedUp:
                signedUpMap[event.id.toString()] = event;
                break;
            case EventStatus.Upcoming:
                upcomingMap[event.id.toString()] = event;
                break;
            default:
                break;
        }
    }

    // Populate cache
    EventsCache.cSetCategory(CACHE_KEY, EventStatus.SignedUp, signedUpMap);
    EventsCache.cSetCategory(CACHE_KEY, EventStatus.Current, currentMap);
    EventsCache.cSetCategory(CACHE_KEY, EventStatus.Upcoming, upcomingMap);

    return {
        signedUp: Object.values(signedUpMap),
        current: Object.values(currentMap),
        upcoming: Object.values(upcomingMap),
    };
}


/**
 * Gets a single event by ID from cache or API.
 */
export async function getEvent(id: number): Promise<Event | null> {
    const cached = EventsCache.cGet<Event>(CACHE_KEY, id.toString());
    if (cached) return cached;

    return fetchEventApi(id);
}


/**
 * Creates a new event and updates categorized cache.
 */
export async function createEvent(newEvent: CreateEventInput): Promise<Event> {
    const event: Event = await createEventApi(newEvent);

    EventsCache.cSet(CACHE_KEY, event.status, event.id.toString(), event);
    return event;
}


/**
 * Updates an existing event in API and updates cache if status changes.
 */
export async function updateEvent(update: Event): Promise<void> {
    const updated = await updateEventApi(update);

    EventsCache.cSet(CACHE_KEY, update.status, update.id.toString(), updated);
}

/**
 * Deletes an event from API and removes it from cache.
 */
export async function deleteEvent(id: number): Promise<void> {
    await deleteEventApi(id);
    EventsCache.cDelete(CACHE_KEY, id.toString());
}