import {
    createContext,
    useContext,
    type PropsWithChildren,
    useEffect,
    useState,
} from 'react';
import { useStorageState } from './useStorageState';
import {
    GoogleSignin,
    isErrorWithCode,
    isSuccessResponse,
    statusCodes,
    User as UserGoogleSignIn,
} from '@react-native-google-signin/google-signin';
import { User, UserType } from '@/types/user';
import { supabase } from '../utils/supabase'
import { ImagePickerAsset } from 'expo-image-picker';
import { fetchUserFromBackend, updateUserExpoPushTokenApi, updateUserProfilePictureApi, uploadUserProfilePictureStorage } from '@/data/api/user';
import { getExpoPushNotificationToken } from '@/data/notif/notifications';

// Session Type
type Session =
    | { type: UserType.User; googleSession: UserGoogleSignIn; }
    | { type: UserType.Guest; }
    | null

// Auth Context Type
type AuthContextType = {
    signIn: () => void;
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

// No-op for default context
const noop = () => { };
const noopAsync = async () => null;

// Default Context
const AuthContext = createContext<AuthContextType>({
    signIn: noop,
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
    const displayName = user?.display_name ? user.display_name : 'Guest';
    const clearError = () => setError(null);

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        });
    }, []);

    useEffect(() => {
        const refreshUserData = async () => {
            if (session?.type === UserType.User) {
                try {
                    const refreshedUser = await fetchUserFromBackend(session.googleSession.user.email);
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
        session?.type === UserType.User ? session.googleSession.user.email : undefined
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

    const storeSession = (user: User | null, googleUser: UserGoogleSignIn | null) => {
        if (user) {
            setSession({ type: UserType.User, googleSession: googleUser as UserGoogleSignIn });
            setUser(user);
        } else {
            setSession({ type: UserType.Guest });
        }
    };

    const clearSession = () => {
        setSession(null);
        setUser(null);
    };

    const updateExpoPushToken = async (userId: number) => {
        const token = await getExpoPushNotificationToken();
        await updateUserExpoPushTokenApi(userId, token);
    }

    const handleSignInError = (error: unknown) => {
        console.error('Error during sign-in:', error);

        if (isErrorWithCode(error)) {
            switch (error.code) {
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
            setError('Unexpected error. Please try again later.');
        }
    };


    const signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();

            if (!isSuccessResponse(response)) {
                console.error("Sign in was cancelled by the user.");
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

            const supabaseUser = await authenticateWithSupabase(idToken);
            if (!supabaseUser) return;

            const user = await fetchUserFromBackend(googleUser.user.email);
            storeSession(user, googleUser);

            if (user) {
                await updateExpoPushToken(user.id)
            }
        } catch (error) {
            handleSignInError(error);
        }
    };

    /** Clears the current session */
    const signOut = async () => {
        await GoogleSignin.signOut();
        await supabase.auth.signOut();
        clearSession();
    };

    /** Continues the app flow as a guest user */
    const continueAsGuest = () => {
        storeSession(null, null);
    };

    /**
     * Uploads a new profile picture and updates the user record in the database.
     * Only available for authenticated users (UserType.User).
     *
     * @param fileData - The image file to upload
     * @returns Public URL of the uploaded image
     */
    const updateUserProfilePicture =
        session?.type === UserType.User && user
            ? async (fileData: ImagePickerAsset): Promise<string> => {
                const userId = user.id;
                const filePath = await uploadUserProfilePictureStorage(userId, user?.profile_photo_path || null, fileData);
                if (!filePath) {
                    throw new Error('Failed to upload image to storage.');
                }

                const url = await updateUserProfilePictureApi(userId, filePath);
                if (!url) {
                    throw new Error('Failed to update user image in database.');
                }

                setUser({
                    ...user,
                    profile_photo_path: filePath,
                    profile_photo_url: url,
                });

                return url;
            }
            : noopAsync;

    return (
        <AuthContext.Provider
            value={{
                signIn,
                signOut,
                continueAsGuest,
                updateUserProfilePicture,
                user,
                session,
                isGuest,
                isLoading,
                displayName,
                error,
                clearError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
