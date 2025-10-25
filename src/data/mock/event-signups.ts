import { EventSignup } from "@/types/event-signups";

const now = new Date();
const hour = 60 * 60 * 1000;
const day = 24 * hour;

export const mockEventSignups: EventSignup[] = [
  {
    userId: 1,
    eventId: 1,
    signedUpAt: new Date(now.getTime() - day),
  },
];
