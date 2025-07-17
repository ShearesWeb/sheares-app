import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Event } from '@/types/event';
import EventStatusBadge from '@/components/Badges/EventStatusBadge';
import { formatFullWeekdayDate, formatLongDateRange, formatTimeRange } from '@/utils/formatters';
import IconBadge from '@/components/Badges/IconBadge';
import ImageView from '@/components/Images/ImageView';
import EventTypeBadge from '@/components/Badges/EventTypeBadge';
import { getEvent } from '@/data/services/events';
import LoadingScreen from '@/components/Screens/LoadingScreen';
import ErrorScreen from '@/components/Screens/ErrorScreen';

export default function EventDetails() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [isLoading, setLoading] = useState<boolean>(true);
    const [event, setEvent] = useState<Event | null>(null);

    async function hydrate() {
        if (!id) return;

        const eventId = parseInt(id as string, 10);
        const event: Event | null = await getEvent(eventId);
        setEvent(event);
        setLoading(false);
    }

    useFocusEffect(
        useCallback(() => {
            hydrate();
        }, [])
    );

    if (isLoading) {
        return <LoadingScreen />
    }

    if (!event) {
        return <SafeAreaView style={styles.container}>
            <ErrorScreen message='Event not found.' />
        </SafeAreaView>
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            {/* Header Overlay */}
            <View style={styles.headerOverlay}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconWrapper}>
                    <Feather name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.iconGroup}>
                    <TouchableOpacity onPress={() => router.navigate({ pathname: '/event/[id]/edit', params: { id: event.id } })} style={styles.iconWrapper}>
                        <Feather name="edit-2" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconWrapper}>
                        <Feather name="share-2" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} scrollEventThrottle={16}>
                <ImageView src={event.imageUrl} style={styles.imageContainer} />

                <View style={styles.contentContainer}>
                    <Text style={styles.eventTitle}>{event.name}</Text>
                    <Text style={styles.eventDate}>{formatFullWeekdayDate(event.startTime)}</Text>
                    <View style={styles.badgeRow}>
                        <EventTypeBadge eventType={event.eventType} />
                        <EventStatusBadge status={event.status} />
                    </View>
                    <IconBadge icon="map-pin" label="Venue" text={event.venue} />
                    <IconBadge icon="calendar" label="Date" text={formatLongDateRange(event.startTime, event.endTime)} />
                    <IconBadge icon="clock" label="Time" text={formatTimeRange(event.startTime, event.endTime)} />

                    <View style={styles.sectionDivider} />

                    <Text style={styles.sectionHeading}>About the Event</Text>
                    <Text style={styles.eventDescription}>{event.description}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    scrollContent: {
        paddingBottom: 40,
    },

    headerOverlay: {
        position: 'absolute',
        top: 40,
        left: 20,
        right: 20,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    iconGroup: {
        flexDirection: 'row',
        gap: 10,
    },

    iconWrapper: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 50,
    },

    imageContainer: {
        borderRadius: 0,
    },

    contentContainer: {
        backgroundColor: '#fff',
        marginTop: 10,
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },

    eventTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 5,
    },

    eventDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 10,
    },

    badgeRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 5,
    },

    sectionDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 15,
    },

    sectionHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },

    eventDescription: {
        fontSize: 16,
        color: '#555',
        lineHeight: 22,
    },
});
