import { useSession } from '@/contexts/auth';
import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useState } from 'react';
import TermsModal from '@/components/Modals/TermsModal';
import SignInButton from '@/components/Buttons/SignInButton';
import LoadingScreen from '@/components/Screens/LoadingScreen';
import { useTermsData } from '@/hooks/useTermsHook';
import TextModal from '@/components/Modals/TextModal';


export default function SignIn() {
    const { signIn, continueAsGuest, error, clearError } = useSession();
    const [modalVisible, setModalVisible] = useState(false);
    const { termsData, isLoading } = useTermsData();

    return (
        <View style={styles.container}>
            {/* Top Image Section */}
            <View style={styles.imageContainer}>
                <Image
                    source={require('@/assets/images/loginScreenBackground.png')}
                    style={styles.image}
                    contentFit="contain"
                />
            </View>

            {/* Bottom Sheet Section */}
            <SafeAreaView style={styles.bottomSheet}>
                <Text style={styles.headerText}>Sheares App</Text>
                <Text style={styles.subHeaderText}>Organise and track your</Text>
                <Text style={styles.subHeaderTextTwo}>Sheares activities</Text>

                <SignInButton
                    variant="default"
                    text="Sign in with Google"
                    onPress={async () => {
                        await signIn();
                        router.replace('/(app)/(tabs)');
                    }}
                    style={styles.signInbutton}
                    imageSource={require('@/assets/images/google-logo.png')}
                />

                {/* <SignInButton
                    variant="default"
                    text="Sign in with Apple"
                    onPress={() => {
                        signIn();
                        router.replace('/');
                    }}
                    style={styles.signInbutton}
                    imageSource={require('@/assets/images/google-logo.png')}
                /> */}

                <SignInButton
                    variant="dark"
                    text="Continue as Guest"
                    onPress={() => {
                        continueAsGuest();
                        router.replace('/');
                    }}
                    style={styles.signInbutton}
                />


                <Text style={styles.tncText}>
                    By tapping Sign In and using Sheares App,
                </Text>
                <Text style={styles.tncText}>
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
                <TextModal
                    message={error ? { title: "Sign in error", message: error } : null}
                    onClose={clearError}
                />
            </SafeAreaView>

            {termsData && (
                <TermsModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    termsData={termsData}
                />
            )}

            {modalVisible && isLoading && (
                <View style={styles.modalLoading}>
                    <LoadingScreen />
                </View>
            )}
        </View>
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
        alignItems: 'center',
        minHeight: '45%',
        justifyContent: 'flex-start',
    },
    headerText: {
        fontSize: 40,
        fontWeight: 'bold',
        marginTop: 30,
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
        marginBottom: 16,
    },
    signInbutton: {
        marginBottom: 10,
    },
    tncText: {
        fontSize: 12,
        lineHeight: 16,
        color: '#BA530E',
        textAlign: 'center',
    },
    linkText: {
        textDecorationLine: 'underline',
        color: '#fff',
    },
    modalLoading: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
