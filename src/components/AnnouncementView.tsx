import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Entypo } from '@expo/vector-icons';
import { Announcement } from '@/types/announcement';

type AnnouncementProps = {
    announcement?: Announcement | null;
};

const AnnouncementView: React.FC<AnnouncementProps> = ({ announcement }) => {
    if (!announcement) {
        return (
            // <View style={styles.placeholderContainer}>
            //     <Image
            //         source={require('@/assets/images/emptyAnnouncementsPlaceholder.png')}
            //         style={styles.placeholderImage}
            //         contentFit="contain"
            //     />
            // </View>
            <Text style={styles.noAnnouncement}>There are no current announcements.</Text>
        );
    }

    const { title, content, created_at } = announcement;
    const displayContent = content.length > 100 ? `${content.slice(0, 100)}...` : content;
    const date = new Date(created_at).toLocaleString();

    return (
        <TouchableOpacity
            style={styles.announcementContainer}
            onPress={() => router.navigate('/announcement')}
        >
            <View style={styles.announcementText}>
                <Text style={styles.header}>{title}</Text>
                <Text style={styles.body}>{displayContent}</Text>
                <Text style={styles.date}>{date}</Text>
            </View>
            <View style={styles.chevronContainer}>
                <Entypo name="chevron-right" size={30} color="white" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    announcementContainer: {
        marginVertical: 20,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#F18437',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    announcementText: {
        flex: 1,
        marginRight: 10,
    },
    header: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 5,
    },
    body: {
        color: 'white',
        fontSize: 14,
        marginBottom: 5,
    },
    date: {
        color: '#FFD7C4',
        fontSize: 12,
        marginTop: 5,
    },
    chevronContainer: {
        alignItems: 'center',
        justifyContent: 'center',
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
    noAnnouncement: {
        fontSize: 14,
        color: '#999',
        marginTop: 10,
    },
});

export default AnnouncementView;
