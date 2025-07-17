import { EventLike, EventStatus } from "@/types/event";

export function getEventStatus(event: EventLike): EventStatus {
    const now = new Date();

    if (event.startTime > now) {
        return EventStatus.Upcoming
    } else if (event.startTime <= now && event.endTime >= now) {
        return EventStatus.Current
    } else {
        return EventStatus.Past
    }
}