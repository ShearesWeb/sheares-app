import React from 'react';
import { ActivityIndicator, StyleSheet, View, Text } from 'react-native';

interface LoadingProps {
    message?: string;
    color?: string;
    size?: 'small' | 'large' | number;
}

const LoadingScreen: React.FC<LoadingProps> = ({
    message = 'Loading, please wait...',
    color = '#EF7C00',
    size = 'large',
}) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size={size} color={color} />
            <Text style={styles.message}>{message}</Text>
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
    message: {
        marginTop: 16,
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
    },
});

export default LoadingScreen;
