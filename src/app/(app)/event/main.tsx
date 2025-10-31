import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { router, useFocusEffect } from 'expo-router';

import { useSession } from '@/contexts/auth';
import LoadingScreen from '@/components/Screens/LoadingScreen';
import ErrorScreen from '@/components/Screens/ErrorScreen';
import InfoScreen from '@/components/Screens/InfoScreen';

import { Event } from '@/types/event';
import { User } from '@/types/user';
import { fetchAllEventsApi } from '@/data/api/events';

// --- Small presentational component for a single event row/card ---
function EventRow({ event }: { event: Event }) {
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
    </View>
  );
}

// util: nice readable datetime from Date|string
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

  const [isBootLoading, setBootLoading] = useState<boolean>(true);
  const [bootError, setBootError] = useState<string | null>(null);

  const [adminCcas, setAdminCcas] = useState<{ cca_id: number; cca_name: string }[]>([]);
  const [selectedCcaId, setSelectedCcaId] = useState<number | null>(null);

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [isEventsLoading, setEventsLoading] = useState<boolean>(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // derive admin CCAs from user on focus
  useFocusEffect(
    useCallback(() => {
      try {
        setBootError(null);
        setBootLoading(true);

        if (!user) throw new Error('User not found in session.');

        const adminAppointments =
          (user as User).appointments
            ?.filter((appt) => appt.is_admin)
            .map((appt) => ({ cca_id: appt.cca_id, cca_name: appt.cca_name })) ?? [];

        setAdminCcas(adminAppointments);
        setSelectedCcaId(null); // nothing displayed first
      } catch (err) {
        console.error('Failed during init:', err);
        setBootError('Failed to load your admin CCAs.');
      } finally {
        setBootLoading(false);
      }
    }, [user])
  );

  // fetch all events when a CCA is selected
  useEffect(() => {
    async function loadEventsForCca(ccaId: number) {
      try {
        setEventsError(null);
        setEventsLoading(true);

        const events = await fetchAllEventsApi();
        const filtered = events.filter((evt) => evt.ccaId === ccaId);

        setAllEvents(filtered);
      } catch (err) {
        console.error('Error fetching events:', err);
        setEventsError('Failed to load events for this CCA.');
        setAllEvents([]);
      } finally {
        setEventsLoading(false);
      }
    }

    if (selectedCcaId !== null) {
      loadEventsForCca(selectedCcaId);
    } else {
      setAllEvents([]);
    }
  }, [selectedCcaId]);

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
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.navigate('/event/create')}
            >
              <Text style={styles.addButtonText}>＋</Text>
            </TouchableOpacity>
          </View>
          <InfoScreen
            message="No admin CCAs found"
            description="You are not currently listed as an admin for any CCA, so you can't manage events here."
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
          <TouchableOpacity style={styles.addButton} onPress={() => router.navigate('/event/create')}>
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* CCA Picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Select CCA</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedCcaId}
              onValueChange={(itemValue) => setSelectedCcaId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="-- Choose a CCA you admin --" value={null} key="placeholder" />
              {adminCcas.map((cca) => (
                <Picker.Item key={cca.cca_id} label={cca.cca_name} value={cca.cca_id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Events List */}
        {selectedCcaId === null ? (
          <InfoScreen
            message="No CCA selected"
            description="Pick one of your CCAs above to view and manage its events."
          />
        ) : isEventsLoading ? (
          <LoadingScreen />
        ) : eventsError ? (
          <ErrorScreen message={eventsError} />
        ) : allEvents.length === 0 ? (
          <InfoScreen
            message="No events yet"
            description="This CCA doesn't have any events. You can create one using the + button above."
          />
        ) : (
          <View style={styles.eventsWrapper}>
            <Text style={styles.sectionHeader}>Events</Text>
            <FlatList
              data={allEvents}
              keyExtractor={(evt) => evt.id.toString()}
              renderItem={({ item }) => <EventRow event={item} />}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
  pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  picker: { width: '100%' },
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
});
