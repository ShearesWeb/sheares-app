import AnnouncementView from '@/components/AnnouncementView';
import Button from '@/components/Buttons/Button';
import EventCollection from '@/components/EventCollection';
import ProfileImage from '@/components/Images/ProfileImage';
import ErrorScreen from '@/components/Screens/ErrorScreen';
import InfoScreen from '@/components/Screens/InfoScreen';
import LoadingScreen from '@/components/Screens/LoadingScreen';
import { isFeatureEnabled } from '@/constants/featureFlags';
import { useSession } from '@/contexts/auth';
import { getAllAnnouncements } from '@/data/services/announcements';
import { CategorizedEvents, getCategorizedEvents } from '@/data/services/events';
import { Announcement } from '@/types/announcement';
import { Event, EventStatus } from '@/types/event';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function Index() {
  const { user, displayName, isGuest } = useSession();
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
  const [currentEvents, setCurrentEvents] = useState<Event[] | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[] | null>(null);


  async function hydrate() {
    try {
      const announcements: Announcement[] = await getAllAnnouncements();

      if (isFeatureEnabled('eventsFeature')) {
        const events: CategorizedEvents = await getCategorizedEvents();
        setCurrentEvents(events.current);
        setUpcomingEvents(events.upcoming);
      }

      setAnnouncements(announcements);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again later.');
      return;
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      hydrate();
    }, [])
  );

  if (isGuest) {
    return <SafeAreaView style={styles.container}>
      <View style={styles.titleSection}>
        <View>
          <Text style={styles.title}>Hello, {displayName}</Text>
          <Text style={styles.subTitle}>Welcome to SHApp</Text>
        </View>
      </View>

      <InfoScreen
        message=' Welcome to the Sheares App.'
        description='While this app is designed for the public, many of its current features cater to Sheares Hall residents. As a guest, your access is currently limited.' />
    </SafeAreaView>
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <ErrorScreen message={error} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <View>
            <Text style={styles.title}>Hello, {displayName}</Text>
            <Text style={styles.subTitle}>Welcome to SHApp</Text>
          </View>
          <TouchableOpacity onPress={() => router.navigate('/settings')}>
            <ProfileImage src={user?.profile_photo_url} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.header}>Announcements</Text>
          <Button variant='bordered' text='Create' onPress={() => router.navigate('/announcement/create')}></Button>
        </View>
        <AnnouncementView announcement={announcements?.[0] ?? null} />

        {
          isFeatureEnabled('eventsFeature') ? (
            <>
              <View style={styles.headerContainer}>
                <Text style={styles.header}>Your Signups</Text>
              </View>
              <EventCollection events={currentEvents} status={EventStatus.Current} />
              <View style={styles.headerContainer}>
                <Text style={styles.header}>Current Events</Text>
                <Button variant='bordered' text='Create' onPress={() => router.navigate('/event/create')}></Button>
              </View>
              <EventCollection events={currentEvents} status={EventStatus.Current} />
              <View style={styles.headerContainer}>
                <Text style={styles.header}>Upcoming Events</Text>
              </View>
              <EventCollection events={upcomingEvents} status={EventStatus.Upcoming} />
            </>
          ) : (
            <InfoScreen
              message="We are still cooking up our events system — check out the CCA infographics meanwhile!"
              description='What to expect: A comprehensive events system that allows you to create, manage, and sign up for events within Sheares Hall.'
            />
          )
        }
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  title: {
    fontWeight: '600',
    fontSize: 36,
  },
  subTitle: {
    color: '#666',
    marginBottom: 20,
  },
  header: {
    fontWeight: '600',
    fontSize: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  adminButton: {
    borderWidth: 1,
    borderColor: '#F18437',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminButtonText: {
    color: '#F18437',
    fontSize: 16,
    fontWeight: 'bold',
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