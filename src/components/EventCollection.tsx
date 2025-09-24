import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { Image } from 'expo-image';
import { Event, EventStatus } from '@/types/event';
import EventCard from './EventCard';


// Props Interface
interface EventCollectionProps {
    events: Event[] | null;
    status: EventStatus;
}


const EventCollection: React.FC<EventCollectionProps> = ({ events, status }) => {

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
                <Text style={styles.noEvent}>There are no {status} event.</Text>
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
    noEvent: {
        fontSize: 14,
        color: '#999',
        marginTop: 10,
    },
});

export default EventCollection;
