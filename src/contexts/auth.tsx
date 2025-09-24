import React, {
    createContext,
    useContext,
    type PropsWithChildren,
    useEffect,
    useState,
} from 'react';
import { signInAsync, AppleAuthenticationScope } from 'expo-apple-authentication';
import { useStorageState } from './useStorageState';
import {
    GoogleSignin,
    isErrorWithCode,
    statusCodes,
} from '@react-native-google-signin/google-signin';
import { User, UserType } from '@/types/user';
import { supabase } from '../utils/supabase';
import { ImagePickerAsset } from 'expo-image-picker';
import {
    fetchUserFromBackend,
    updateUserExpoPushTokenApi,
    updateUserProfilePictureApi,
    uploadUserProfilePictureStorage
} from '@/data/api/user';
import { getExpoPushNotificationToken } from '@/data/notif/notifications';

// Session Type
type Session =
    | { type: UserType.User; user: User; provider: 'apple' | 'google'; }
    | { type: UserType.Guest }
    | null;

// Auth Context Type
type AuthContextType = {
    signInWithApple: () => void;
    signInWithGoogle: () => void;
    signOut: () => void;
    continueAsGuest: () => void;
    user: User | null;
    session: Session | null;
    updateUserProfilePicture: (file: ImagePickerAsset) => Promise<string | null>;
    isGuest: boolean;
    isLoading: boolean;
    displayName: string | null;
    error: string | null;
    clearError: () => void;
};

// No-op functions for default context
const noop = () => { };
const noopAsync = async () => null;

// Default Context
const AuthContext = createContext<AuthContextType>({
    signInWithApple: noop,
    signInWithGoogle: noop,
    signOut: noop,
    continueAsGuest: noop,
    user: null,
    session: null,
    updateUserProfilePicture: noopAsync,
    isGuest: false,
    isLoading: false,
    displayName: null,
    error: null,
    clearError: noop,
});


// Hook
export function useSession() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}

// Provider
export function SessionProvider({ children }: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState<Session>('session');
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const isGuest = session?.type !== UserType.User;
    const displayName = !isGuest ?
        user?.display_name ? user.display_name :
            user?.name ? user.name : "User" :
        'Guest';

    const clearError = () => setError(null);

    // Configure Google Sign In
    useEffect(() => {
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
            iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
            offlineAccess: true,
            scopes: ['profile', 'email'],
        });
    }, []);

    useEffect(() => {
        const refreshUserData = async () => {
            if (session?.type === UserType.User) {
                try {
                    const refreshedUser = await fetchUserFromBackend(session.user.email);
                    if (refreshedUser) {
                        setUser(refreshedUser);
                    } else {
                        console.error("Session exists but user not found in backend.");
                        setError("Your account could not be found. Please sign in again.");
                        clearSession();
                    }
                } catch (err) {
                    console.error('Failed to refresh user data:', err);
                    setError("Error fetching user data. Please check your connection.");
                }
            }
        };

        refreshUserData();
    }, [
        session?.type,
        session?.type === UserType.User ? session.user.email : undefined
    ]);

    const authenticateWithSupabase = async (idToken: string) => {
        const { error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
        });

        if (error) {
            console.error("Supabase auth error:", error.message);
            setError("Unable to sign in. Please try again later.");
            return null;
        }
        return true;
    };

    const storeSession = (user: User | null, provider?: 'apple' | 'google') => {
        if (user && provider) {
            setSession({ user, type: UserType.User, provider });
            setUser(user);
        } else {
            setSession({ type: UserType.Guest });
        }
    };

    const clearSession = () => {
        setSession(null);
        setUser(null);
    };

    // Update Expo push token
    const updateExpoPushToken = async (userId: number) => {
        try {
            const token = await getExpoPushNotificationToken();
            await updateUserExpoPushTokenApi(userId, token);
        } catch (error) {
            console.error('Failed to update push token:', error);
        }
    };

    // Apple Sign-In
    const signInWithApple = async () => {
        try {
            const credential = await signInAsync({
                requestedScopes: [
                    AppleAuthenticationScope.FULL_NAME,
                    AppleAuthenticationScope.EMAIL,
                ],
            });

            if (credential.identityToken) {
                const { error } = await supabase.auth.signInWithIdToken({
                    provider: 'apple',
                    token: credential.identityToken,
                });

                if (error) {
                    console.error("Supabase auth error:", error.message);
                    setError("Unable to sign in. Please try again later.");
                    return;
                }

                if (credential.email) {
                    const user = await fetchUserFromBackend(credential.email);
                    storeSession(user, 'apple');

                    if (user) {
                        await updateExpoPushToken(user.id);
                    }
                } else {
                    // Handle case where email is not provided (subsequent logins)
                    storeSession(null);
                }
            }
        } catch (error: any) {
            console.error('Apple Sign-In failed:', error);

            if (error.code === 'ERR_REQUEST_CANCELED') {
                setError('Sign in was cancelled.');
            } else {
                setError('Apple Sign-In failed. Please try again.');
            }
        }
    };

    // Google Sign-In using react-native-google-signin for both platforms
    const signInWithGoogle = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();

            if (response.type === 'cancelled') {
                setError("Sign in was cancelled.");
                return;
            }

            const googleUser = response.data;
            const idToken = googleUser.idToken;

            if (!idToken) {
                console.error("Google Sign-in succeeded but no ID token was found.");
                setError("Sign in failed. Please try again.");
                return;
            }

            // Authenticate with Supabase
            const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
            });

            if (error) {
                console.error("Supabase auth error:", error.message);
                setError("Unable to sign in. Please try again later.");
                return;
            }

            const user = await fetchUserFromBackend(googleUser.user.email);
            storeSession(user, 'google');

            if (user) {
                await updateExpoPushToken(user.id);
            }

        } catch (error) {
            console.error('Google sign-in error:', error);
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.SIGN_IN_CANCELLED:
                        setError('Sign in was cancelled.');
                        break;
                    case statusCodes.IN_PROGRESS:
                        setError('Sign-in is already in progress. Please wait.');
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        setError('Google Play Services is not available. Please update or check your device settings.');
                        break;
                    default:
                        setError('Something went wrong during Google Sign-in. Please try again.');
                }
            } else {
                setError('Google Sign-in failed. Please try again.');
            }
        }
    };

    // Sign out
    const signOut = async () => {
        if (session?.type === UserType.User && session.provider === 'google') {
            try {
                await GoogleSignin.signOut();
            } catch (error) {
                console.error('Google sign out error:', error);
            }
        }
        await supabase.auth.signOut();
        clearSession();
    };

    // Continue as guest
    const continueAsGuest = () => {
        storeSession(null);
    };

    // Update profile picture (only for authenticated users)
    const updateUserProfilePicture =
        session?.type === UserType.User
            ? async (fileData: ImagePickerAsset): Promise<string | null> => {
                const userId = session.user.id;

                try {
                    const filePath = await uploadUserProfilePictureStorage(
                        userId,
                        user?.profile_photo_path || null,
                        fileData
                    );

                    if (!filePath) {
                        throw new Error('Failed to upload image to storage.');
                    }

                    const url = await updateUserProfilePictureApi(userId, filePath);

                    if (!url) {
                        throw new Error('Failed to update user image in database.');
                    }

                    // Update session with new image info
                    session.user.profile_photo_path = filePath;
                    session.user.profile_photo_url = url;
                    setSession({ ...session });

                    return url;
                } catch (error) {
                    console.error('Profile picture update failed:', error);
                    throw error;
                }
            }
            : noopAsync;

    return (
        <AuthContext.Provider
            value={{
                signInWithApple,
                signInWithGoogle,
                signOut,
                continueAsGuest,
                updateUserProfilePicture,
                user,
                session,
                isGuest,
                isLoading,
                displayName,
                error,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
