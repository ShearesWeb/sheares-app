import { Image } from "expo-image";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, View, ViewStyle } from "react-native";


type ProfileImageProps = {
    src?: string | null;
    style?: ViewStyle;
};

const ProfileImage: React.FC<ProfileImageProps> = ({ style, src }) => {
    const [isImageLoading, setIsImageLoading] = useState(true);

    const imageSource = src ? { uri: src } : require("@/assets/images/profile-placeholder.png");


    return <View style={[styles.imageWrapper, style]}>
        {isImageLoading && (
            <View style={styles.loaderOverlay}>
                <ActivityIndicator size="small" color="#EF7C00" />
            </View>
        )}
        <Image
            style={styles.profileImage}
            source={imageSource}
            onLoad={() => setIsImageLoading(false)}
            contentFit="cover"
            contentPosition="center"
        />
    </View>
}

const styles = StyleSheet.create({
    imageWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        overflow: "hidden",
        backgroundColor: "#E9E8E4",
        justifyContent: "center",
        alignItems: "center",
    },
    profileImage: {
        width: "100%",
        height: "100%",
    },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
        backgroundColor: "#e0e0e0",
    },
});
export default ProfileImage