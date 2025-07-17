import React from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ViewStyle,
    TextStyle,
} from 'react-native';

export type Option = {
    value: string;
    label: string;
    selectedColor?: string;
    textColor?: string;
};

export type SelectorProps = {
    options: Option[];
    selected: string | null;
    onSelect: (value: string) => void;
    containerStyle?: ViewStyle;
    itemStyle?: ViewStyle;
    selectedTextStyle?: TextStyle;
};

const Selector: React.FC<SelectorProps> = ({
    options,
    selected,
    onSelect,
    containerStyle,
    itemStyle,
    selectedTextStyle,
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.optionsContainer}>
                {options.map((option) => {
                    const isSelected = selected === option.value;
                    return (
                        <Pressable
                            key={option.value}
                            style={[
                                styles.option,
                                itemStyle,
                                isSelected && {
                                    backgroundColor: option.selectedColor || styles.selectedOption.backgroundColor,
                                },
                            ]}
                            onPress={() => onSelect(option.value)}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    isSelected && { color: option.textColor || '#fff' },
                                    isSelected && selectedTextStyle,
                                ]}
                            >
                                {option.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

export default Selector;

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
        width: '100%',
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    option: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
    },
    selectedOption: {
        backgroundColor: '#f18437',
    },
    optionText: {
        fontSize: 14,
        fontFamily: 'NotoSans-Regular',
        color: '#000',
    },
});
