import React, { useState } from 'react';
import { StyleSheet, ScrollView, Text } from 'react-native';
import { router } from 'expo-router';
import TextInput from '@/components/Inputs/TextInput';
import WideButton from '@/components/Buttons/WideButton';
import DateTimeInput from '@/components/Inputs/DateTimeInput';
import { createAnnouncement } from '@/data/services/announcements';
import { useSession } from '@/contexts/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorScreen from '@/components/Screens/ErrorScreen';

export default function CreateAnnouncement() {
    const { user } = useSession();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [expiryTime, setExpiryTime] = useState<Date>(() => {
        const now = new Date();
        now.setDate(now.getDate() + 3);
        return now;
    });

    if (!user) {
        return <SafeAreaView style={styles.container}>
            <ErrorScreen message='User not authenticated.' />
        </SafeAreaView>
    }

    const handleSave = async () => {
        try {
            await createAnnouncement({
                title,
                content,
                expires_at: expiryTime,
                author: {
                    id: user.id,
                    name: user.name,
                    profile_photo_url: user.profile_photo_url || null,
                }
            })
            router.back();
        } catch (error) {
            console.error(error)
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Title (required)</Text>
            <TextInput value={title} onChangeText={setTitle} />
            <Text style={styles.label}>Body (required)</Text>
            <TextInput value={content} onChangeText={setContent} numberOfLines={8} />
            <Text style={styles.label}>Expires on (defaults to 3 days)</Text>
            <DateTimeInput value={expiryTime} onChange={(date) => { setExpiryTime(date) }}></DateTimeInput>
            <WideButton style={styles.button} variant='default' text='Post Announcement' onPress={handleSave} />
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
    button: {
        marginTop: 20,
    }
})
