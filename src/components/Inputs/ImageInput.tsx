import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ViewStyle,
    Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ImageView from '@/components/Images/ImageView';
import { ImageSource } from '@/types/image';

type ImageInputProps = {
    label?: string;
    onChangeImage: (source: ImageSource) => void;
    initialSource?: ImageSource | null;
    containerStyle?: ViewStyle;
};

const ImageInput: React.FC<ImageInputProps> = ({
    label = 'Upload Image',
    onChangeImage,
    initialSource = null,  // default to null
    containerStyle,
}) => {
    const [imageSource, setImageSource] = useState<ImageSource | null>(initialSource);

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission to access media library is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            const newSource: ImageSource = { uri, storagePath: null };
            setImageSource(newSource);
            onChangeImage(newSource);
        }
    };

    const hasImage = imageSource !== null && (imageSource.uri || imageSource.storagePath);

    return (
        <View style={[styles.container, containerStyle]}>
            <Pressable style={styles.button} onPress={handlePickImage}>
                <View style={styles.bg} />
                <Text style={styles.label}>
                    {hasImage ? 'Change Image' : label}
                </Text>
            </Pressable>
            {imageSource !== null && imageSource.uri && (
                <ImageView src={imageSource.uri} style={styles.imagePreview} />
            )}
        </View>
    );
};


export default ImageInput;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 12,
        width: '100%',
    },
    button: {
        width: '100%',
        maxWidth: 380,
        minHeight: 46,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    bg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#393939',
        borderRadius: 14,
    },
    label: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: -0.3,
        fontFamily: 'NotoSans-Bold',
    },
    imagePreview: {
        marginTop: 12,
    },
});
