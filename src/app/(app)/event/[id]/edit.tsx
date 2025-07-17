import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text } from 'react-native';
import TextInput from '@/components/Inputs/TextInput';
import WideButton from '@/components/Buttons/WideButton';
import DateTimeInput from '@/components/Inputs/DateTimeInput';
import ImageInput from '@/components/Inputs/ImageInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageSource } from '@/types/image';
import EventTypeSelector from '@/components/Inputs/EventTypeInput';
import { Event, EventStatus, EventType } from '@/types/event';
import { deleteEvent, getEvent, updateEvent } from '@/data/services/events';
import LoadingScreen from '@/components/Screens/LoadingScreen';
import Modal from '@/components/Modals/Modal';
import TextModal, { ModalMessage } from '@/components/Modals/TextModal';

export default function ModifyEvent() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id;
    const eventId = parseInt(id as string, 10);

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
        async function hydrate() {
            if (!eventId) {
                setError({ title: 'Error', message: 'Event not found.' });
                return
            };


            const event: Event | null = await getEvent(eventId);
            if (!event) {
                setError({ title: 'Error', message: 'Event not found.' });
                return
            }

            const imageSource = event.imageUrl ? {
                uri: event.imageUrl
            } : null

            setName(event.name);
            setDescription(event.description ?? null)
            setVenue(event.venue ?? null)
            setStartTime(event.startTime)
            setEndTime(event.endTime)
            setEventType(event.eventType)
            setImageSource(imageSource)
            setLoading(false);
            setInitialEventStatus(event.status)
        }
        hydrate();
    }, []);

    const handleSave = async () => {

        if (!startTime) {
            setError({
                title: 'Missing Start Date',
                message: 'Please select a start date for your event.'
            })
            return
        }

        if (!endTime) {
            setError({
                title: 'Missing End Date',
                message: 'Please select a end date for your event.'
            })
            return
        }

        const event: Event = {
            id: eventId,
            name,
            description,
            venue,
            startTime,
            endTime,
            eventType,
            status: initialEventStatus,
            imageUrl: imageSource?.uri
        }

        await updateEvent(event)
        router.back();
    };

    const handleDelete = async () => {
        await deleteEvent(eventId, initialEventStatus)
        router.back();
    }

    if (isLoading) {
        return <LoadingScreen />
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Event Type</Text>
                <EventTypeSelector selected={eventType} onSelect={setEventType} />

                <Text style={styles.label}>Name (required)</Text>
                <TextInput value={name} onChangeText={setName} />
                <Text style={styles.label}>Start Time (required)</Text>
                <DateTimeInput value={startTime} onChange={(date) => { setStartTime(date) }}></DateTimeInput>
                <Text style={styles.label}>End Time (required)</Text>
                <DateTimeInput value={endTime} onChange={(date) => { setEndTime(date) }}></DateTimeInput>
                <Text style={styles.label}>Image</Text>
                <ImageInput initialSource={imageSource} onChangeImage={(src) => { setImageSource(src) }}></ImageInput>
                <Text style={styles.label}>Description</Text>
                <TextInput value={description ?? ''} onChangeText={setDescription} numberOfLines={8} />
                <Text style={styles.label}>Venue</Text>
                <TextInput value={venue ?? ''} onChangeText={setVenue} />
                <WideButton style={styles.saveButton} variant='default' text='Update Event' onPress={handleSave} />
                <WideButton style={styles.deleteButton} variant='dark' text='Delete Event' onPress={handleDelete} />
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
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        marginTop: 15,
        color: "#393939"
    },
    saveButton: {
        marginTop: 20,
    },
    deleteButton: {
        marginTop: 10,
        marginBottom: 25,
    },
})
