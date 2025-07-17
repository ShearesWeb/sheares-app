import { useEffect, useCallback, useReducer } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
    initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
    return useReducer(
        (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
        initialValue
    ) as UseStateHook<T>;
}

async function setStorageItemAsync<T>(key: string, value: T | null) {
    const serialized = value === null ? null : JSON.stringify(value);

    if (Platform.OS === 'web') {
        try {
            if (serialized === null) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, serialized);
            }
        } catch (e) {
            console.error('Local storage is unavailable:', e);
        }
    } else {
        if (serialized === null) {
            await SecureStore.deleteItemAsync(key);
        } else {
            await SecureStore.setItemAsync(key, serialized);
        }
    }
}

export function useStorageState<T>(key: string): UseStateHook<T> {
    const [state, setState] = useAsyncState<T>();

    useEffect(() => {
        async function load() {
            let value: string | null = null;

            if (Platform.OS === 'web') {
                try {
                    if (typeof localStorage !== 'undefined') {
                        value = localStorage.getItem(key);
                    }
                } catch (e) {
                    console.error('Local storage is unavailable:', e);
                }
            } else {
                value = await SecureStore.getItemAsync(key);
            }

            if (value !== null) {
                try {
                    setState(JSON.parse(value));
                } catch {
                    // If parse fails, fallback to null
                    setState(null);
                }
            } else {
                setState(null);
            }
        }

        load();
    }, [key, setState]);

    const setValue = useCallback(
        (value: T | null) => {
            setState(value);
            setStorageItemAsync(key, value);
        },
        [key, setState]
    );

    return [state, setValue];
}
