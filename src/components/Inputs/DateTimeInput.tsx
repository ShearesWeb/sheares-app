// components/Inputs/DateTimeInput.tsx
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
  placeholder = 'Select…',
  containerStyle,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // temp holds the chosen date (no time yet) while user is in a datetime flow
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const openDate = () => {
    setShowTimePicker(false);
    setShowDatePicker(true);
  };

  const openTime = () => {
    setShowDatePicker(false);
    setShowTimePicker(true);
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    // Android sends a dismiss event; iOS fires continuously as you scroll
    if (Platform.OS === 'android') setShowDatePicker(false);

    if (!selectedDate) return;

    if (mode === 'datetime') {
      // store the date immediately so UI can show what you picked
      setTempDate(selectedDate);
      // then move to time wheel on BOTH platforms
      openTime();
    } else {
      // pure date mode: commit directly
      onChange(selectedDate);
    }
  };

  const handleTimeChange = (_: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);

    if (!selectedTime) return;

    if (mode === 'datetime') {
      // combine: date from tempDate (or current value), time from selectedTime
      const base = tempDate ?? value ?? new Date();
      const combined = new Date(base);
      combined.setHours(
        selectedTime.getHours(),
        selectedTime.getMinutes(),
        selectedTime.getSeconds(),
        0
      );
      setTempDate(null);
      onChange(combined);
    } else {
      // pure time mode
      onChange(selectedTime);
    }
  };

  // What to show inside the text box:
  // - In datetime flow, prefer tempDate (so user sees the new date before time is chosen)
  // - Otherwise show committed value
  const displayValue = tempDate ?? value ?? null;

  const formatDisplay = () => {
    if (!displayValue) return placeholder;
    if (mode === 'date') return displayValue.toLocaleDateString('en-SG');
    if (mode === 'time')
      return displayValue.toLocaleTimeString('en-SG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    return `${displayValue.toLocaleDateString('en-SG')} ${displayValue.toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable
        accessibilityRole="button"
        onPress={() => (mode === 'datetime' || mode === 'date' ? openDate() : openTime())}
        style={styles.input}
      >
        <Text style={[styles.text, !displayValue && styles.placeholderText]}>
          {formatDisplay()}
        </Text>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={displayValue ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          // keep text visible on iOS
          {...(Platform.OS === 'ios'
            ? { themeVariant: 'light', textColor: '#111' as any }
            : {})}
          style={Platform.OS === 'ios' ? { backgroundColor: '#fff' } : undefined}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={displayValue ?? new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          is24Hour
          {...(Platform.OS === 'ios'
            ? { themeVariant: 'light', textColor: '#111' as any }
            : {})}
          style={Platform.OS === 'ios' ? { backgroundColor: '#fff' } : undefined}
        />
      )}
    </View>
  );
};

export default DateTimeInput;

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  input: {
    borderWidth: 2,
    borderColor: '#E9E8E4',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  text: { fontSize: 16, color: '#000' },
  placeholderText: { color: '#888' },
});
