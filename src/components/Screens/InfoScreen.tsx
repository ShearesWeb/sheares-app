import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

interface InfoScreenProps {
    message: string;
    description?: string;
}

const InfoScreen: React.FC<InfoScreenProps> = ({ message, description }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.message}>{message}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
            <Image
                source={require('@/assets/images/shweb-logo.png')}
                style={styles.image}
                contentFit="contain"
            />
            <Text style={styles.footer}>~ The Sheares Web Team</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 20,
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        fontSize: 18,
        color: '#444',
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 12,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    footer: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 10,
    },
});

export default InfoScreen;
