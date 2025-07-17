import React from 'react';
import {
    Dimensions,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Event, EventStatus } from '@/types/event';
import { router } from 'expo-router';
import ImageView from './Images/ImageView';
import EventTypeBadge from './Badges/EventTypeBadge';
import EventStatusBadge from './Badges/EventStatusBadge';

const CARD_WIDTH = Dimensions.get('window').width * 0.6;

interface EventCardProps {
    event: Event;
    status: EventStatus;
}

const EventCard: React.FC<EventCardProps> = ({ event, status }) => {
    const formatDate = (date: Date) =>
        `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

    const formatTime = (date: Date) => {
        const h = date.getHours() % 12 || 12;
        const m = date.getMinutes().toString().padStart(2, '0');
        const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
        return `${h}:${m} ${ampm}`;
    };

    return (
        <TouchableOpacity
            onPress={() =>
                router.navigate({ pathname: '/event/[id]', params: { id: event.id } })
            }
            style={styles.card}
        >
            <View style={styles.imageSection}>
                <View style={styles.badgeContainer}>
                    <EventTypeBadge eventType={event.eventType} />
                    <EventStatusBadge status={status} />
                </View>
                <ImageView src={event.imageUrl} style={styles.image} />

                <TouchableOpacity style={styles.shareIcon}>
                    <Feather name="share-2" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.cardBody}>
                <Text style={styles.title}>{event.name}</Text>

                <View style={styles.infoRow}>
                    <Feather name="map-pin" size={16} color="#EF7C00" />
                    <Text style={styles.infoText}>{event.venue}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Feather name="calendar" size={16} color="#EF7C00" />
                    <Text style={styles.infoText}>
                        {formatDate(event.startTime)} - {formatDate(event.endTime)}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Feather name="clock" size={16} color="#EF7C00" />
                    <Text style={styles.infoText}>
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                    </Text>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                    {event.description}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export default EventCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        width: CARD_WIDTH,
        marginVertical: 12,
        marginHorizontal: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    imageSection: {
        position: 'relative',
    },
    image: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    shareIcon: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 8,
        borderRadius: 20,
    },
    cardBody: {
        padding: 14,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 6,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 6,
    },
    description: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
        marginBottom: 10,
    },
    badgeContainer: {
        position: 'absolute',
        top: 10,
        left: 10,
        flexDirection: 'row',
        gap: 6,
        zIndex: 2,
    },
    status_upcoming: {
        backgroundColor: '#007bff',
    },
    status_current: {
        backgroundColor: '#28a745',
    },
    status_completed: {
        backgroundColor: '#F42C38',
    },
});
