// app/event/main.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import { useSession } from '@/contexts/auth';
import LoadingScreen from '@/components/Screens/LoadingScreen';
import ErrorScreen from '@/components/Screens/ErrorScreen';
import InfoScreen from '@/components/Screens/InfoScreen';

import { Event } from '@/types/event';
import { User } from '@/types/user';
import { fetchAllEventsApi, deleteEventApi } from '@/data/api/events';

type EventRowProps = {
  event: Event;
  onEdit: (e: Event) => void;
  onDelete: (e: Event) => void;
  isDeleting?: boolean;
};

function EventRow({ event, onEdit, onDelete, isDeleting }: EventRowProps) {
  return (
    <View style={styles.eventCard}>
      <Text style={styles.eventName}>{event.name}</Text>
      {event.venue ? <Text style={styles.eventMeta}>Venue: {event.venue}</Text> : null}
      <Text style={styles.eventMeta}>Status: {event.status}</Text>
      <Text style={styles.eventDescription}>{event.description ?? 'No description'}</Text>

      <View style={styles.eventTimes}>
        <Text style={styles.eventTimeLabel}>
          Starts: <Text style={styles.eventTimeVal}>{formatDateTime(event.startTime)}</Text>
        </Text>
        <Text style={styles.eventTimeLabel}>
          Ends: <Text style={styles.eventTimeVal}>{formatDateTime(event.endTime)}</Text>
        </Text>
      </View>

      <View style={styles.cardActionsRow}>
        <TouchableOpacity
          style={[styles.smallButton, styles.editButton]}
          onPress={() => onEdit(event)}
          disabled={isDeleting}
        >
          <Text style={styles.smallButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.smallButton, styles.deleteButton]}
          onPress={() => onDelete(event)}
          disabled={isDeleting}
        >
          {isDeleting ? <ActivityIndicator /> : <Text style={styles.smallButtonText}>Delete</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatDateTime(dt: Date | string) {
  const date = dt instanceof Date ? dt : new Date(dt);
  return date.toLocaleString('en-SG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function EventAdminMain() {
  const { user } = useSession();

  const [isBootLoading, setBootLoading] = useState(true);
  const [bootError, setBootError] = useState<string | null>(null);

  const [adminCcas, setAdminCcas] = useState<{ cca_id: number; cca_name: string }[]>([]);
  const [selectedCcaId, setSelectedCcaId] = useState<number | null>(null);

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [isEventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      try {
        setBootError(null);
        setBootLoading(true);

        if (!user) throw new Error('User not found in session.');

        const adminAppointments =
          (user as User).appointments
            ?.filter(a => a.is_admin)
            .map(a => ({ cca_id: a.cca_id, cca_name: a.cca_name })) ?? [];

        setAdminCcas(adminAppointments);
        setSelectedCcaId(null); // start empty
      } catch (e) {
        setBootError('Failed to load your admin CCAs.');
      } finally {
        setBootLoading(false);
      }
    }, [user])
  );

  const refreshEvents = useCallback(async (ccaId: number) => {
    try {
      setEventsError(null);
      setEventsLoading(true);
      const events = await fetchAllEventsApi();
      setAllEvents(events.filter(e => e.ccaId === ccaId));
    } catch (e) {
      setEventsError('Failed to load events for this CCA.');
      setAllEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCcaId !== null) {
      void refreshEvents(selectedCcaId);
    } else {
      setAllEvents([]);
    }
  }, [selectedCcaId, refreshEvents]);

  useFocusEffect(
    useCallback(() => {
      if (selectedCcaId !== null) void refreshEvents(selectedCcaId);
    }, [selectedCcaId, refreshEvents])
  );

  const handleEdit = useCallback((event: Event) => {
    router.navigate(`/event/${event.id}/edit`);
  }, []);

  const handleDelete = useCallback(
    (event: Event) => {
      Alert.alert(
        'Delete Event',
        `Delete "${event.name}"? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                setDeletingId(event.id);
                await deleteEventApi(event.id);
                if (selectedCcaId !== null) await refreshEvents(selectedCcaId);
              } catch (err: any) {
                Alert.alert('Error', err?.message ?? 'Failed to delete event.');
              } finally {
                setDeletingId(null);
              }
            },
          },
        ]
      );
    },
    [selectedCcaId, refreshEvents]
  );

  const handleSelectCca = (id: number) => {
    setSelectedCcaId(id); // no toggle; always select
  };

  if (bootError) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ErrorScreen message={bootError} />
      </SafeAreaView>
    );
  }

  if (isBootLoading) {
    return <LoadingScreen />;
  }

  if (!adminCcas || adminCcas.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollInner}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Manage Events</Text>
            <TouchableOpacity style={[styles.addButton, { opacity: 0.5 }]} disabled>
              <Text style={styles.addButtonText}>＋</Text>
            </TouchableOpacity>
          </View>
          <InfoScreen
            message="No admin CCAs found"
            description="You are not currently listed as an admin for any CCA."
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollInner} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Manage Events</Text>
          <TouchableOpacity
            style={[styles.addButton, !selectedCcaId && { opacity: 0.5 }]}
            disabled={!selectedCcaId}
            onPress={() =>
              router.navigate({
                pathname: '/event/create',
                params: selectedCcaId ? { ccaId: String(selectedCcaId) } : {},
              })
            }
          >
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* CCA Tiles */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Select CCA</Text>
          <View style={styles.tileWrap}>
            {adminCcas.map(cca => {
              const active = selectedCcaId === cca.cca_id;
              return (
                <TouchableOpacity
                  key={cca.cca_id}
                  style={[styles.ccaTile, active && styles.ccaTileActive]}
                  onPress={() => handleSelectCca(cca.cca_id)}
                >
                  <Text style={[styles.ccaTileText, active && styles.ccaTileTextActive]}>
                    {cca.cca_name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Events */}
        {selectedCcaId === null ? (
          <InfoScreen
            message="No CCA selected"
            description="Pick one of your CCAs above to view its events."
          />
        ) : isEventsLoading ? (
          <LoadingScreen />
        ) : eventsError ? (
          <ErrorScreen message={eventsError} />
        ) : allEvents.length === 0 ? (
          <InfoScreen
            message="No events yet"
            description="This CCA has no events. Tap ＋ to create one."
          />
        ) : (
          <View style={styles.eventsWrapper}>
            <Text style={styles.sectionHeader}>Events</Text>
            <FlatList
              data={allEvents}
              keyExtractor={evt => evt.id.toString()}
              renderItem={({ item }) => (
                <EventRow
                  event={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isDeleting={deletingId === item.id}
                />
              )}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const TILE_BORDER = '#ddd';
const TILE_ACTIVE = '#F18437';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  scrollInner: { paddingBottom: 40 },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  title: { fontWeight: '600', fontSize: 32 },

  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F18437',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 24, fontWeight: '600', marginTop: -2 },

  fieldGroup: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' },

  tileWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ccaTile: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: TILE_BORDER,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  ccaTileActive: {
    borderColor: TILE_ACTIVE,
    backgroundColor: '#FFF3EC',
  },
  ccaTileText: { color: '#333', fontSize: 14, fontWeight: '600' },
  ccaTileTextActive: { color: TILE_ACTIVE },

  eventsWrapper: { marginTop: 8, marginBottom: 32 },
  sectionHeader: { fontWeight: '600', fontSize: 24, marginBottom: 16 },

  eventCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fafafa',
  },
  eventName: { fontSize: 18, fontWeight: '600', marginBottom: 4, color: '#111' },
  eventMeta: { fontSize: 14, color: '#666', marginBottom: 4 },
  eventDescription: { fontSize: 14, color: '#444', marginTop: 8, marginBottom: 12 },

  eventTimes: { gap: 4 },
  eventTimeLabel: { fontSize: 13, color: '#333' },
  eventTimeVal: { fontWeight: '500' },

  cardActionsRow: { marginTop: 12, flexDirection: 'row', gap: 10 },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 88,
  },
  smallButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  editButton: { backgroundColor: '#2E7D32' },
  deleteButton: { backgroundColor: '#C62828' },
});
