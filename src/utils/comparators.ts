import { CCAPositionType } from "@/types/cca";
import { EventLike, EventStatus } from "@/types/event";
import { UserAppointment } from "@/types/user";

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

export function hasAdminAppointments(appointments: UserAppointment[]): boolean {
    return appointments.some(appointment =>
        appointment.is_admin
    );
}