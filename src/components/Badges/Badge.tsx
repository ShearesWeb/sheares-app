import React from 'react';
import { Text, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface BadgeProps {
    label: string;
    backgroundColor?: string;
    textColor?: string;
    style?: ViewStyle;         // Style for the badge container (e.g., marginRight)
    textStyle?: TextStyle;     // Style for the text
}

const Badge: React.FC<BadgeProps> = ({
    label,
    backgroundColor = '#ccc',
    textColor = '#fff',
    style,
    textStyle,
}) => {
    return (
        <View style={[styles.badge, { backgroundColor }, style]}>
            <Text style={[styles.text, { color: textColor }, textStyle]}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default Badge;
