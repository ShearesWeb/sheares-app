import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, Text } from "react-native";
import { Event, EventStatus } from "@/types/event";
import EventSignupCard from "./EventSignupCard";
import EventSignupsService from "@/data/services/event-signups";

interface EventCollectionProps {
  events: Event[] | null;
  status: EventStatus;   // used for the empty-state line
  userId: number;        // <-- REQUIRED: pass current user id in
}

const EventCollection: React.FC<EventCollectionProps> = ({ events, status, userId }) => {
  const [signedMap, setSignedMap] = useState<Record<number, boolean>>({});
  const [busyId, setBusyId] = useState<number | null>(null);

  // Compute status from times
  const getStatus = (e: Event): EventStatus => {
    const now = new Date();
    if (now < e.startTime) return EventStatus.Upcoming;
    if (now > e.endTime) return EventStatus.SignedUp;
    return EventStatus.Current;
  };

  // Preload signup state for visible events
  useEffect(() => {
    let mounted = true;
    const list = events ?? [];
    (async () => {
      try {
        const entries = await Promise.all(
          list.map(async (ev) => {
            const signed = await EventSignupsService.isUserSignedUp(userId, ev.id);
            return [ev.id, signed] as const;
          })
        );
        if (mounted) setSignedMap(Object.fromEntries(entries));
      } catch {
        // ignore preload errors (keep UI responsive)
      }
    })();
    return () => {
      mounted = false;
    };
  }, [events, userId]);

  return (
    <View style={styles.scrollWrapper}>
      {events && events.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {events.map((event) => (
            <EventSignupCard
              key={event.id}
              event={event}
              status={getStatus(event)}                 // or use the passed-in `status` if you prefer
              signed={!!signedMap[event.id]}
              loading={busyId === event.id}
              onToggleSignup={async () => {
                setBusyId(event.id);
                try {
                  if (signedMap[event.id]) {
                    await EventSignupsService.cancelSignup(userId, event.id);
                  } else {
                    const now = new Date();
                    await EventSignupsService.signUpForEvent(userId, event.id, now);
                  }
                  setSignedMap((m) => ({ ...m, [event.id]: !m[event.id] }));
                } finally {
                  setBusyId(null);
                }
              }}
            />
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noEvent}>There are no {status.toLowerCase?.() ?? String(status)} events.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollWrapper: {
    zIndex: 10,
  },
  scrollContainer: {
    gap: 10,
    paddingVertical: 10,
  },
  noEvent: {
    fontSize: 14,
    color: "#999",
    marginTop: 10,
  },
});

export default EventCollection;
