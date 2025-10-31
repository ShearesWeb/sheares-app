import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Platform, Alert, ToastAndroid } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

import TextInput from '@/components/Inputs/TextInput';
import WideButton from '@/components/Buttons/WideButton';
import DateTimeInput from '@/components/Inputs/DateTimeInput';
import ImageInput from '@/components/Inputs/ImageInput';
import EventTypeSelector from '@/components/Inputs/EventTypeInput';
import TextModal, { ModalMessage } from '@/components/Modals/TextModal';
import InfoScreen from '@/components/Screens/InfoScreen';

import { ImageSource } from '@/types/image';
import { CreateEventInput, EventType } from '@/types/event';
import { createEvent } from '@/data/services/events';
import { useSession } from '@/contexts/auth';
import { User } from '@/types/user';

export default function CreateEvent() {
  const { user } = useSession();
  const params = useLocalSearchParams<{ ccaId?: string }>();

  const [error, setError] = useState<ModalMessage | null>(null);

  // form fields
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string | null>(null);
  const [venue, setVenue] = useState<string | null>('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [eventType, setEventType] = useState<EventType>(EventType.Event);
  const [imageSource, setImageSource] = useState<ImageSource | null>(null);

  // admin CCAs derived from user.appointments
  const adminCcas = useMemo(() => {
    const appts = (user as User | undefined)?.appointments ?? [];
    return appts.filter(a => a.is_admin).map(a => ({ id: a.cca_id, name: a.cca_name }));
  }, [user]);

  // which CCA is selected for this new event
  const [selectedCcaId, setSelectedCcaId] = useState<number | null>(null);

  // preselect from route param if valid
  useEffect(() => {
    if (!params?.ccaId) return;
    const parsed = Number(params.ccaId);
    if (!Number.isNaN(parsed) && adminCcas.some(c => c.id === parsed)) {
      setSelectedCcaId(parsed);
    }
  }, [params?.ccaId, adminCcas]);

  // platform-friendly toast/snackbar
  function notifySuccess(message: string) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      // simple inline alert as a lightweight stand-in for a toast on iOS
      // (we still navigate immediately after showing it)
      Alert.alert('', message);
    }
  }

  const handleSave = async () => {
    try {
      // guard: must be admin of at least one CCA
      if (adminCcas.length === 0) {
        setError({
          title: 'Not Authorized',
          message: 'You are not an admin of any CCA, so you cannot create events.',
        });
        return;
      }

      // guard: must pick a CCA
      if (selectedCcaId === null) {
        setError({
          title: 'Select a CCA',
          message: 'Please choose the CCA you are creating this event for.',
        });
        return;
      }

      // guard: times
      if (!startTime) {
        setError({ title: 'Missing Start Date', message: 'Please select a start date for your event.' });
        return;
      }
      if (!endTime) {
        setError({ title: 'Missing End Date', message: 'Please select an end date for your event.' });
        return;
      }

      const event: CreateEventInput = {
        name,
        description,
        venue,
        startTime,
        endTime,
        eventType,
        imageUrl: imageSource?.uri,
        ccaId: selectedCcaId, // enforce CCA ownership
      };

      await createEvent(event);

      // toast/snackbar + auto-return
      notifySuccess('Event created');
      router.back(); // returns to /event/main, preserving selection & triggering refresh via useFocusEffect
    } catch (err: any) {
      setError({
        title: 'Error creating event',
        message: err?.message ?? 'Something went wrong while creating the event.',
      });
    }
  };

  const noAdmin = adminCcas.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      {/* Header with back button */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* If no admin CCAs, show info and bail */}
        {noAdmin ? (
          <InfoScreen
            message="You can’t create events"
            description="Your account is not an admin of any CCA. Ask your CCA lead to grant you admin rights."
          />
        ) : (
          <>
            {/* CCA Picker */}
            <Text style={styles.label}>CCA (required)</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedCcaId}
                onValueChange={(val) => setSelectedCcaId(val === null ? null : Number(val))}
                style={styles.picker}
              >
                <Picker.Item label="-- Choose your CCA --" value={null} key="placeholder" />
                {adminCcas.map(cca => (
                  <Picker.Item key={cca.id} label={cca.name} value={cca.id} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Event Type</Text>
            <EventTypeSelector selected={eventType} onSelect={setEventType} />

            <Text style={styles.label}>Name (required)</Text>
            <TextInput value={name} onChangeText={setName} />

            <Text style={styles.label}>Start Time (required)</Text>
            <DateTimeInput value={startTime} onChange={(date) => setStartTime(date)} />

            <Text style={styles.label}>End Time (required)</Text>
            <DateTimeInput value={endTime} onChange={(date) => setEndTime(date)} />

            <Text style={styles.label}>Image</Text>
            <ImageInput initialSource={imageSource} onChangeImage={(src) => setImageSource(src)} />

            <Text style={styles.label}>Description</Text>
            <TextInput value={description ?? ''} onChangeText={setDescription} numberOfLines={8} />

            <Text style={styles.label}>Venue</Text>
            <TextInput value={venue ?? ''} onChangeText={setVenue} />

            <WideButton
              style={styles.button}
              variant="default"
              text="Create Event"
              onPress={handleSave}
            />
          </>
        )}
      </ScrollView>

      <TextModal message={error} onClose={() => setError(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
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
  button: { marginTop: 20, paddingBottom: 25 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  picker: { width: '100%' },
});
