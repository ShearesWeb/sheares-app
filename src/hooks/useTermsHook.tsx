import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Asset from 'expo-asset';
import yaml from 'js-yaml';
import { TermsData } from '@/types/terms';

const loadYAMLAsset = async (assetPath: string): Promise<any> => {
    const asset = Asset.Asset.fromModule(assetPath);
    await asset.downloadAsync();
    const fileContent = await FileSystem.readAsStringAsync(asset.localUri!);
    return yaml.load(fileContent);
};

export function useTermsData() {
    const [termsData, setTermsData] = useState<TermsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchTerms() {
            try {
                const data = (await loadYAMLAsset(require('@/assets/content/terms-and-conditions.yaml'))) as TermsData;
                setTermsData(data);
            } catch (e) {
                setError(e instanceof Error ? e : new Error('Failed to load terms data'));
            } finally {
                setIsLoading(false);
            }
        }

        fetchTerms();
    }, []);

    return { termsData, isLoading, error };
}
