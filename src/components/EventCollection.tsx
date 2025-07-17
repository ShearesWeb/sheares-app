import { ScrollView, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Event, EventStatus } from '@/types/event';
import EventCard from './EventCard';


// Props Interface
interface EventCollectionProps {
    events: Event[] | null;
    status: EventStatus;
}


const EventCollection: React.FC<EventCollectionProps> = ({ events, status }) => {
    const placeholderImage = status === EventStatus.Current
        ? require('@/assets/images/emptyCurrentEventsPlaceholder.png')
        : require('@/assets/images/emptyUpcomingEventsPlaceholder.png');

    return (
        <View style={styles.scrollWrapper}>
            {events && events.length > 0 ? (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                >
                    {events.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            status={status}
                        />
                    ))}
                </ScrollView>
            ) : (
                <View style={styles.placeholderContainer}>
                    <Image source={placeholderImage} style={styles.placeholderImage} contentFit='contain' />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    scrollWrapper: {
        zIndex: 10,
    },
    scrollContainer: {
        gap: 10,
        paddingVertical: 10,
    },
    placeholderContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderImage: {
        width: 300,
        height: 300,
    },
});

export default EventCollection;
