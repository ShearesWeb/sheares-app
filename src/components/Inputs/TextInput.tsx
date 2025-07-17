import React from 'react';
import {
    TextInput as TextInputRN,
    StyleSheet,
    View,
    TextInputProps as TextInputPropsRN,
    ViewStyle,
    TextStyle,
} from 'react-native';

type TextInputProps = {
    numberOfLines?: number;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
} & TextInputPropsRN;

const TextInput: React.FC<TextInputProps> = ({
    numberOfLines = 1,
    containerStyle,
    inputStyle,
    placeholder = 'Enter text...',
    ...rest
}) => {
    return (
        <View style={[styles.container, containerStyle]}>
            <TextInputRN
                style={[
                    styles.input,
                    numberOfLines > 1 && styles.multiline,
                    inputStyle,
                ]}
                multiline={numberOfLines > 1}
                numberOfLines={numberOfLines}
                textAlignVertical={numberOfLines > 1 ? 'top' : 'center'}
                placeholder={placeholder}
                placeholderTextColor="#888"
                {...rest}
            />
        </View>
    );
};

export default TextInput;

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
        fontSize: 16,
        color: '#000',
    },
    multiline: {
        minHeight: 160,
    },
});
