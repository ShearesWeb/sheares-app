import React, { useState } from 'react';
import {
    View,
    Text,
    Pressable,
    Platform,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type Mode = 'date' | 'time' | 'datetime';

type DateTimeInputProps = {
    value: Date | null;
    onChange: (date: Date) => void;
    mode?: Mode;
    placeholder?: string;
    containerStyle?: ViewStyle;
};

const DateTimeInput: React.FC<DateTimeInputProps> = ({
    value,
    onChange,
    mode = 'datetime',
    placeholder = 'Select...',
    containerStyle,
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const handleDateChange = (_: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            if (mode === 'datetime') {
                setShowTimePicker(true);
                // Temporarily store date
                setTempDate(selectedDate);
            } else {
                onChange(selectedDate);
            }
        }
    };

    const [tempDate, setTempDate] = useState<Date | null>(null);

    const handleTimeChange = (_: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime && tempDate) {
            const combined = new Date(tempDate);
            combined.setHours(selectedTime.getHours());
            combined.setMinutes(selectedTime.getMinutes());
            combined.setSeconds(selectedTime.getSeconds());
            onChange(combined);
            setTempDate(null);
        } else if (selectedTime && mode === 'time') {
            onChange(selectedTime);
        }
    };

    const formatDisplay = () => {
        if (!value) return placeholder;
        if (mode === 'date') return value.toLocaleDateString();
        if (mode === 'time') return value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${value.toLocaleDateString()} ${value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <Pressable
                onPress={() => {
                    if (mode === 'datetime' || mode === 'date') {
                        setShowDatePicker(true);
                    } else {
                        setShowTimePicker(true);
                    }
                }}
                style={styles.input}
            >
                <Text style={[styles.text, !value && styles.placeholderText]}>
                    {formatDisplay()}
                </Text>
            </Pressable>

            {showDatePicker && (
                <DateTimePicker
                    value={value ?? new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                />
            )}

            {showTimePicker && (
                <DateTimePicker
                    value={value ?? new Date()}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                />
            )}
        </View>
    );
};

export default DateTimeInput;

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    input: {
        borderWidth: 2,
        borderColor: '#E9E8E4',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 16,
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        color: '#000',
    },
    placeholderText: {
        color: '#888',
    },
});
