import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, View, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type FeatherIconName = keyof typeof Feather.glyphMap;

interface BadgeProps {
    label: string,
    text?: string | null;
    icon: FeatherIconName;
    backgroundColor?: string;
    textColor?: string;
    style?: ViewStyle;         // Style for the badge container (e.g., marginRight)
    textStyle?: TextStyle;     // Style for the text
}


const IconBadge: React.FC<BadgeProps> = ({
    label,
    text,
    icon,
    backgroundColor = '#EFEFEF',
    textColor = '#333',
    style,
    textStyle,
}) => {
    return (
        <View style={[styles.badge, { backgroundColor }, style]}>
            <Text style={styles.label}>{label}</Text>
            <Feather name={icon} size={20} style={styles.icon} />
            <Text style={[styles.text, { color: textColor }, textStyle]}>: {text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
        borderRadius: 12, // Rounded badge effect
        paddingVertical: 6,
        paddingHorizontal: 10,
        alignSelf: 'flex-start', // Make it only as wide as needed
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 4,
    },
    icon: {
        marginRight: 4,
        color: '#EF7C00',
    },
    text: {
        fontSize: 14,
        fontWeight: '500',
        color: '#444',
    },
});

export default IconBadge;