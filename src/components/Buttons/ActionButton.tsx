import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ActionButtonProps = {
    text: string;
    icon?: React.ComponentProps<typeof Ionicons>['name'];
    onPress?: () => void;
};

const ActionButton: React.FC<ActionButtonProps> = ({ text, icon = 'add', onPress }) => {

    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            {icon && (<View style={styles.iconWrapper}>
                <Ionicons name={icon} size={16} color="#666" />
            </View>)}
            <Text style={styles.text}>{text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderWidth: 2,
        borderColor: '#E9E8E4',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    iconWrapper: {
        width: 28,
        height: 28,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: '#E9E8E4',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
});

export default ActionButton;