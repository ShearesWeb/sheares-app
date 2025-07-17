import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Announcement } from '@/types/announcement';

export enum AnnouncementCardVariant {
    Default = 0,
    Admin = 1,
}

type AnnouncementCardProps = {
    variant: AnnouncementCardVariant;
    announcement: Announcement;
};

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ variant, announcement }) => {
    const { title, content, created_at } = announcement;
    const date = new Date(created_at).toLocaleString();

    const Container = variant === AnnouncementCardVariant.Admin ? TouchableOpacity : View;


    return (
        <Container
            style={[styles.container, variant === AnnouncementCardVariant.Admin && { 'backgroundColor': '#EF7C00' }]}
            onPress={
                variant == AnnouncementCardVariant.Admin
                    ? () =>
                        router.navigate({
                            pathname: '/announcement/[id]',
                            params: {
                                id: announcement.id
                            }
                        })
                    : undefined
            }
        >
            <View style={styles.headerRow}>
                <Text style={styles.header}>{title}</Text>
                <View>
                    <Text style={styles.date}>{date.toString()}</Text>
                    <Text style={styles.dateSubTitle}>Created at</Text>
                </View>
            </View>
            <ScrollView style={styles.bodyContainer}>
                <Text style={styles.body}>{content}</Text>
            </ScrollView>
        </Container>
    );

};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'lightgrey',
        borderRadius: 10,
        marginVertical: 12,
        padding: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        flexShrink: 1,
        flexWrap: 'wrap',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    date: {
        color: "#393939",
        fontSize: 12,
        textAlign: 'right',
    },
    dateSubTitle: {
        color: "grey",
        fontSize: 12,
        textAlign: 'right'
    },
    bodyContainer: {
        maxHeight: 150,
        marginTop: 10,
    },
    body: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
        flexWrap: 'wrap',
    },
});


export default AnnouncementCard;
