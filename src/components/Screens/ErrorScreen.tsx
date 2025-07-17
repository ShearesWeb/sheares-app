import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Button from '../Buttons/Button';
import { router } from 'expo-router';

interface ErrorScreenProps {
    message?: string;
    icon?: keyof typeof Feather.glyphMap;
    iconColor?: string;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
    message = 'Something went wrong.',
    icon = 'alert-triangle',
    iconColor = '#EF4444',
}) => {
    return (
        <View style={styles.container}>
            <Feather name={icon} size={64} color={iconColor} style={styles.icon} />
            <Text style={styles.message}>{message}</Text>
            <Button variant='dark' text='Go back' onPress={() => { router.back() }} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    icon: {
        marginBottom: 20,
    },
    message: {
        fontSize: 18,
        fontWeight: '500',
        color: '#444',
        textAlign: 'center',
        marginBottom: 20,
        maxWidth: '90%',
        lineHeight: 24,
    },
});

export default ErrorScreen;
