import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ImageView from '@/components/Images/ImageView';
import ProfileImage from '@/components/Images/ProfileImage';
import { CCA } from '@/types/cca';
import { getCCA } from '@/data/services/ccas';
import LoadingScreen from '@/components/Screens/LoadingScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorScreen from '@/components/Screens/ErrorScreen';
import PositionTypeBadge from '@/components/Badges/PositionTypeBadge';

export default function CCADetail() {
    const params = useLocalSearchParams();
    const id = params.id;

    const [isLoading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [cca, setCCA] = useState<CCA | null>(null);

    async function hydrate() {
        if (!id) return;

        setLoading(true);

        try {
            const ccaId = parseInt(id as string, 10);
            const fetchedCCA: CCA | null = await getCCA(ccaId);

            if (!fetchedCCA) {
                setError('CCA not found.');
            } else {
                setCCA(fetchedCCA);
            }
        } catch (e) {
            console.error('Failed to load CCA:', e);
            setError('Failed to load CCA. Please try again later.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        hydrate();
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <ErrorScreen message={error} />
            </SafeAreaView>
        );
    }

    if (!cca) {
        return (
            <SafeAreaView style={styles.container}>
                <ErrorScreen message='CCA not found.' />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <ImageView src={cca.image_url} />

                <Text style={styles.title}>{cca.name}</Text>

                <Text style={styles.description}>{cca.description}</Text>

                {cca.positions?.length ? (
                    cca.positions.map((position) => (
                        <View key={position.id} style={styles.positionSection}>
                            <View style={styles.horizontalLine} />
                            <View style={styles.positionHeader}>
                                <Text style={styles.positionTitle}>{position.name}</Text>
                                <PositionTypeBadge ccaType={cca.cca_type} positionType={position.type} style={{ marginLeft: 10 }} />
                            </View>
                            {position.description && <Text style={styles.positionDescription}>{position.description}</Text>}

                            {position.appointments?.length ? (
                                position.appointments.map((user) => (
                                    <View key={user.id} style={styles.personSection}>
                                        <ProfileImage src={user.profile_photo_url} />
                                        <View style={styles.personDetails}>
                                            <Text style={styles.personName}>{user.name}</Text>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noAppointment}>No current appointments.</Text>
                            )}
                        </View>
                    ))
                ) : (
                    <>
                        <View style={styles.horizontalLine} />
                        <Text style={styles.noAppointment}>No current positions.</Text>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#fff',
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 10,
    },
    description: {
        fontSize: 16,
        marginVertical: 10,
        color: '#393939',
    },
    horizontalLine: {
        width: '100%',
        height: 2,
        backgroundColor: '#E9E8E4',
        marginVertical: 10,
    },
    positionSection: {
        marginBottom: 8,
    },
    positionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 4,
    },
    positionTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    positionDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    personSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    personDetails: {
        marginLeft: 12,
    },
    personName: {
        fontSize: 16,
        fontWeight: '600',
    },
    noAppointment: {
        fontSize: 14,
        color: '#999',
        marginTop: 10,
    },
});
