import React, { useState } from 'react';
import { StyleSheet, ScrollView, Text } from 'react-native';
import { router } from 'expo-router';
import TextInput from '@/components/Inputs/TextInput';
import WideButton from '@/components/Buttons/WideButton';
import DateTimeInput from '@/components/Inputs/DateTimeInput';
import ImageInput from '@/components/Inputs/ImageInput';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageSource } from '@/types/image';
import EventTypeSelector from '@/components/Inputs/EventTypeInput';
import { CreateEventInput, EventType } from '@/types/event';
import { createEvent } from '@/data/services/events';
import TextModal, { ModalMessage } from '@/components/Modals/TextModal';

export default function CreateEvent() {
    const [error, setError] = useState<ModalMessage | null>(null);

    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string | null>(null);
    const [venue, setVenue] = useState<string | null>('');
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [eventType, setEventType] = useState<EventType>(EventType.Event);
    const [imageSource, setImageSource] = useState<ImageSource | null>(null);

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

        const event: CreateEventInput = {
            name,
            description,
            venue,
            startTime,
            endTime,
            eventType,
            imageUrl: imageSource?.uri
        }

        await createEvent(event)
        router.back();
    };

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
                <WideButton style={styles.button} variant='default' text='Create Event' onPress={handleSave} />
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
    button: {
        marginTop: 20,
        paddingBottom: 25,
    },
})
