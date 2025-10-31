import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';

import TextInput from '@/components/Inputs/TextInput';
import WideButton from '@/components/Buttons/WideButton';
import DateTimeInput from '@/components/Inputs/DateTimeInput';
import ImageInput from '@/components/Inputs/ImageInput';
import EventTypeSelector from '@/components/Inputs/EventTypeInput';
import LoadingScreen from '@/components/Screens/LoadingScreen';
import TextModal, { ModalMessage } from '@/components/Modals/TextModal';

import { ImageSource } from '@/types/image';
import { Event, EventStatus, EventType, UpdateEventInput } from '@/types/event';
import { fetchEventApi, updateEventApi, deleteEventApi } from '@/data/api/events';
import { useSession } from '@/contexts/auth';
import { User } from '@/types/user';

export default function ModifyEvent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Number(id);

  const { user } = useSession();

  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ModalMessage | null>(null);

  const [initialEventStatus, setInitialEventStatus] = useState<EventStatus>(EventStatus.Current);
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string | null>(null);
  const [venue, setVenue] = useState<string | null>('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [eventType, setEventType] = useState<EventType>(EventType.Event);
  const [imageSource, setImageSource] = useState<ImageSource | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!eventId || Number.isNaN(eventId)) {
          throw new Error('Invalid event id.');
        }

        const event: Event | null = await fetchEventApi(eventId);
        if (!event) {
          throw new Error('Event not found.');
        }

        // Permission gate: must admin the event's CCA
        const adminCcaIds =
          ((user as User | undefined)?.appointments ?? [])
            .filter((a) => a.is_admin)
            .map((a) => a.cca_id);

        if (event.ccaId != null && !adminCcaIds.includes(event.ccaId)) {
          Alert.alert('Not authorized', 'You are not an admin of this event’s CCA.');
          router.back();
          return;
        }

        // hydrate form
        setName(event.name);
        setDescription(event.description ?? null);
        setVenue(event.venue ?? null);
        setStartTime(event.startTime ? new Date(event.startTime as any) : null);
        setEndTime(event.endTime ? new Date(event.endTime as any) : null);
        setEventType(event.eventType);
        setImageSource(event.imageUrl ? { uri: event.imageUrl } : null);
        setInitialEventStatus(event.status);
      } catch (err: any) {
        setError({ title: 'Error', message: err?.message ?? 'Failed to load event.' });
      } finally {
        setLoading(false);
      }
    })();
  }, [eventId, user]);

  const handleSave = async () => {
    try {
      if (!startTime) {
        setError({
          title: 'Missing Start Date',
          message: 'Please select a start date for your event.',
        });
        return;
      }

      if (!endTime) {
        setError({
          title: 'Missing End Date',
          message: 'Please select an end date for your event.',
        });
        return;
      }

      const payload: UpdateEventInput = {
        id: eventId,
        name,
        description,
        venue,
        startTime,
        endTime,
        eventType,
        status: initialEventStatus,
        imageUrl: imageSource?.uri ?? undefined,
      };

      await updateEventApi(payload);
      router.back();
    } catch (err: any) {
      setError({ title: 'Error', message: err?.message ?? 'Failed to update event.' });
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Event',
      'This action cannot be undone. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEventApi(eventId);
              router.back();
            } catch (err: any) {
              setError({ title: 'Error', message: err?.message ?? 'Failed to delete event.' });
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {/* Header with back button */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Event</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Event Type</Text>
        <EventTypeSelector selected={eventType} onSelect={setEventType} />

        <Text style={styles.label}>Name (required)</Text>
        <TextInput value={name} onChangeText={setName} />

        <Text style={styles.label}>Start Time (required)</Text>
        <DateTimeInput value={startTime} onChange={(date) => setStartTime(date)} />

        <Text style={styles.label}>End Time (required)</Text>
        <DateTimeInput value={endTime} onChange={(date) => setEndTime(date)} />

        <Text style={styles.label}>Image</Text>
        <ImageInput
          initialSource={imageSource}
          onChangeImage={(src) => setImageSource(src)}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description ?? ''}
          onChangeText={setDescription}
          numberOfLines={8}
        />

        <Text style={styles.label}>Venue</Text>
        <TextInput value={venue ?? ''} onChangeText={setVenue} />

        <WideButton
          style={styles.saveButton}
          variant="default"
          text="Save Changes"
          onPress={handleSave}
        />
        <WideButton
          style={styles.deleteButton}
          variant="dark"
          text="Delete Event"
          onPress={handleDelete}
        />
      </ScrollView>

      <TextModal message={error} onClose={() => setError(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
    marginBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F18437',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backButtonText: { color: '#fff', fontSize: 20, fontWeight: '600' },
  headerTitle: { fontSize: 24, fontWeight: '600', color: '#111' },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 15,
    color: '#393939',
  },
  saveButton: {
    marginTop: 20,
  },
  deleteButton: {
    marginTop: 10,
    marginBottom: 25,
  },
});
