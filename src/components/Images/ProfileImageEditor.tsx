import { Image } from "expo-image";
import { useState } from "react";
import * as ImagePicker from 'expo-image-picker';
import { ActivityIndicator, Alert, StyleSheet, View, ViewStyle, Text } from "react-native";
import Button from "../Buttons/Button";
import { useSession } from "@/contexts/auth";

type ProfileImageEditorProps = {
    style?: ViewStyle;
};

const ProfileImageEditor: React.FC<ProfileImageEditorProps> = ({ style }) => {
    const { user, displayName, updateUserProfilePicture } = useSession();

    const [isImageLoading, setIsImageLoading] = useState(true);
    const [isUpdatingImage, setIsUpdatingImage] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(user?.profile_photo_url ?? null);

    const source = imageUri
        ? { uri: imageUri }
        : require('@/assets/images/profile-placeholder.png');

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission required', 'Please allow media library access.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            try {
                setIsUpdatingImage(true);
                const uri = await updateUserProfilePicture(result.assets[0]);
                if (uri) {
                    setImageUri(uri);
                }
            } catch (error) {
                console.error(error);
                Alert.alert("Error", "Failed to update profile picture.");
            } finally {
                setIsUpdatingImage(false);
            }
        }
    };


    return <>
        <View style={[styles.imageWrapper, style]}>
            {(isImageLoading || isUpdatingImage) && (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="small" color="#EF7C00" />
                </View>
            )}
            <Image
                style={styles.profileImage}
                source={source}
                onLoad={() => setIsImageLoading(false)}
                contentFit="cover"
                contentPosition="center"
            />
        </View>
        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Button variant="default" text="Edit profile picture" style={styles.editButton} onPress={pickImage} />
    </>

}

const styles = StyleSheet.create({
    displayName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    email: {
        fontSize: 16,
        color: '#666',
    },
    imageWrapper: {
        width: 100,
        height: 100,
        borderRadius: 100,
        overflow: "hidden",
        backgroundColor: "#e0e0e0",
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
    editButton: {
        marginTop: 20,
    },
});
export default ProfileImageEditor