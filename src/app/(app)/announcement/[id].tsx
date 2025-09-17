import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import WideButton from '@/components/Buttons/WideButton';
import TextInput from '@/components/Inputs/TextInput';
import { Announcement } from '@/types/announcement';
import { deleteAnnouncement, getAnnouncement, updateAnnouncement } from '@/data/services/announcements';
import LoadingScreen from '@/components/Screens/LoadingScreen';
import TextModal, { ModalMessage } from '@/components/Modals/TextModal';
import DateTimeInput from '@/components/Inputs/DateTimeInput';


export default function UpdateAnnouncement() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id;
    const announcementId = parseInt(id as string, 10);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [expiryTime, setExpiryTime] = useState<Date>(new Date());
    const [isLoading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<ModalMessage | null>(null);

    async function hydrate() {
        const announcement: Announcement | null = await getAnnouncement(announcementId);
        if (!announcement) {
            setError({ title: 'Error', message: 'Event not found.' });
            return
        }

        setTitle(announcement.title)
        setContent(announcement.content)
        setExpiryTime(announcement.expires_at)
        setLoading(false);
    }

    useFocusEffect(
        useCallback(() => {
            hydrate();
        }, [])
    );

    const handleSave = async () => {
        try {
            await updateAnnouncement({
                id: announcementId,
                title,
                content,
                expires_at: expiryTime,
            })
            router.back();
        } catch (error) {
            console.error(error)
        }
    };

    const handleDelete = async () => {
        try {
            await deleteAnnouncement(announcementId);
            router.back();
        } catch (error) {
            console.error(error)
        }
    }

    if (isLoading) {
        return <LoadingScreen />
    }


    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Title (required)</Text>
            <TextInput value={title} onChangeText={setTitle} />
            <Text style={styles.label}>Body (required)</Text>
            <TextInput value={content} onChangeText={setContent} numberOfLines={8} />
            <Text style={styles.label}>Expires on (defaults to 3 days)</Text>
            <DateTimeInput value={expiryTime} onChange={(date) => { setExpiryTime(date) }}></DateTimeInput>

            <WideButton style={styles.saveButton} variant='default' text='Update Announcement' onPress={handleSave} />
            <WideButton style={styles.deleteButton} variant='dark' text='Delete Announcement' onPress={handleDelete} />
            <TextModal message={error} onClose={() => setError(null)} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 20
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