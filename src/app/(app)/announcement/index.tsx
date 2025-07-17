import React, { useCallback, useState } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import AnnouncementCard, { AnnouncementCardVariant } from '@/components/AnnouncementCard';
import { Announcement } from '@/types/announcement';
import { getAllAnnouncements } from '@/data/services/announcements';
import LoadingScreen from '@/components/Screens/LoadingScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '@/contexts/auth';
import { Image } from 'expo-image';


export default function Announcements() {
    const { user } = useSession();
    const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
    const [isLoading, setLoading] = useState<boolean>(true);

    async function hydrate() {
        const announcements: Announcement[] = await getAllAnnouncements();
        setAnnouncements(announcements);
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

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            {announcements ?
                (<FlatList
                    showsVerticalScrollIndicator={false}
                    data={announcements}
                    renderItem={({ item }) => <AnnouncementCard variant={item.author.id === user?.id ? AnnouncementCardVariant.Admin : AnnouncementCardVariant.Default} announcement={item} />}
                    keyExtractor={item => item.id.toString()} />)
                : (<View style={styles.placeholderContainer}>
                    <Image
                        source={require('@/assets/images/emptyAnnouncementsPlaceholder.png')}
                        style={styles.placeholderImage}
                        contentFit="contain"
                    />
                </View>)}
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: "#fff"
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
})
