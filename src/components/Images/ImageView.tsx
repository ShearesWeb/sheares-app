import React, { useState } from "react";
import {
    View,
    ActivityIndicator,
    StyleSheet,
    ImageStyle,
    ViewStyle,
} from "react-native";
import { Image } from "expo-image";

type ImageViewInputProps = {
    src?: string | null;
    style?: ImageStyle;
};

const ImageView: React.FC<ImageViewInputProps> = ({ src, style }) => {
    const [isImageLoading, setIsImageLoading] = useState(true);

    const imageSource = src ? { uri: src } : require('@/assets/images/image-placeholder.png');

    return (
        <View style={styles.imageContainer}>
            {isImageLoading && (
                <ActivityIndicator
                    size="large"
                    color="#EF7C00"
                    style={styles.imageLoader}
                />
            )}
            <Image
                style={[styles.bannerImage as ImageStyle, style]}
                source={imageSource}
                onLoad={() => setIsImageLoading(false)}
                cachePolicy="memory"
                contentFit="cover"
            />
        </View>
    );
};

export default ImageView;

const styles = StyleSheet.create({
    imageContainer: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    } as ViewStyle,

    bannerImage: {
        width: "100%",
        borderRadius: 10,
        aspectRatio: 4 / 3,
    } as ImageStyle,

    imageLoader: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: [{ translateX: -15 }, { translateY: -15 }],
    } as ViewStyle,
});
