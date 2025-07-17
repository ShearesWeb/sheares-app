// featureFlags.js
export const featureFlags = {
    eventsFeature: false,
};

type FeatureFlagKey = keyof typeof featureFlags;

export const isFeatureEnabled = (feature: FeatureFlagKey): boolean => {
    if (__DEV__) return true; // Enable all flags in dev
    return featureFlags[feature] === true;
};
