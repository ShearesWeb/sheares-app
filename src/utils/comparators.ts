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
    const adminLevels: CCAPositionType[] = [
        CCAPositionType.Chair,
        CCAPositionType.Head,
        CCAPositionType.Captain,
        CCAPositionType.Vice,
        CCAPositionType.Maincomm,
    ];

    return appointments.some(appointment =>
        adminLevels.includes(appointment.position_type as CCAPositionType)
    );
}