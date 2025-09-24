import React, { useState } from 'react';
import { useSession } from '@/contexts/auth';
import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import * as AppleAuthentication from 'expo-apple-authentication';
import SignInButton from '@/components/Buttons/SignInButton';
import TermsModal from '@/components/Modals/TermsModal';
import LoadingScreen from '@/components/Screens/LoadingScreen';
import { useTermsData } from '@/hooks/useTermsHook';
import { Platform } from 'react-native';
import TextModal from '@/components/Modals/TextModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function SignIn() {
    const { signInWithApple, signInWithGoogle, continueAsGuest, error, clearError } = useSession();
    const [modalVisible, setModalVisible] = useState(false);
    const { termsData, isLoading } = useTermsData();

    const handleAppleSignIn = async () => {
        clearError();
        await signInWithApple();
        router.replace('/(app)/(tabs)');
    };

    const handleGoogleSignIn = async () => {
        clearError();
        await signInWithGoogle();
        router.replace('/(app)/(tabs)');
    };

    const handleContinueAsGuest = () => {
        clearError();
        continueAsGuest();
        router.replace('/');
    };
    const insets = useSafeAreaInsets();


    return (
        <SafeAreaView style={styles.container}>
            {/* Top Image Section */}
            <View style={styles.imageContainer}>
                <Image
                    source={require('@/assets/images/loginScreenBackground.png')}
                    style={styles.image}
                    contentFit="contain"
                />
            </View>

            {/* Bottom Sheet Section */}
            <SafeAreaView style={[styles.bottomSheet, { paddingBottom: insets.bottom + 24 }]}>
                <Text style={styles.headerText}>Sheares App</Text>
                <Text style={styles.subHeaderText}>Organise and track your</Text>
                <Text style={styles.subHeaderTextTwo}>Sheares activities</Text>

                {/* Apple Sign-In Button */}
                {Platform.OS === 'ios' && (
                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                        cornerRadius={5}
                        style={styles.appleButton}
                        onPress={handleAppleSignIn}
                    />)}

                {/* Google Sign-In Button */}
                <SignInButton
                    variant="default"
                    text="Sign in with Google"
                    onPress={handleGoogleSignIn}
                    style={styles.signInButton}
                    imageSource={require('@/assets/images/google-logo.png')}
                />

                {/* Continue as Guest Button */}
                <SignInButton
                    variant="dark"
                    text="Continue as Guest"
                    onPress={handleContinueAsGuest}
                    style={styles.signInButton}
                />

                {/* Terms and Privacy */}
                <Text style={styles.tncText}>
                    By tapping Sign In and using Sheares App,{'\n'}
                    you agree to our{' '}
                    <Text
                        style={styles.linkText}
                        onPress={() => {
                            setModalVisible(true);
                        }}
                    >
                        Terms and Privacy Policy
                    </Text>
                </Text>

                {/* Error Display */}
                {error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}
            </SafeAreaView>

            {/* Terms Modal */}
            {termsData && (
                <TermsModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    termsData={termsData}
                />
            )}

            {/* Loading Modal */}
            {modalVisible && isLoading && (
                <View style={styles.modalLoading}>
                    <LoadingScreen />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 300,
        height: 300,
    },
    bottomSheet: {
        backgroundColor: '#F18437',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: '55%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#fff',
    },
    subHeaderText: {
        fontSize: 14,
        color: '#fff',
    },
    subHeaderTextTwo: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 20,
    },
    appleButton: {
        width: 200,
        height: 44,
        marginBottom: 12,
    },
    signInButton: {
        marginBottom: 12,
    },
    tncText: {
        fontSize: 12,
        lineHeight: 16,
        color: '#BA530E',
        textAlign: 'center',
        marginTop: 8,
    },
    linkText: {
        textDecorationLine: 'underline',
        color: '#fff',
    },
    errorText: {
        fontSize: 12,
        color: '#fff',
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 8,
        borderRadius: 4,
        marginTop: 10,
        textAlign: 'center',
    },
    modalLoading: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
