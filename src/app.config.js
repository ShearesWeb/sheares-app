const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
    if (IS_DEV) {
        return 'com.sheareswebteam.shearesapp.dev';
    }

    return 'com.sheareswebteam.shearesapp';
};

const getAppName = () => {
    if (IS_DEV) {
        return 'Sheares App (Dev)';
    }

    if (IS_PROD) {
        return 'Sheares App';
    }

    return 'Sheares App (Preview)';
};

export default ({ config }) => ({
    ...config,
    name: getAppName(),
    ios: {
        ...config.ios,
        bundleIdentifier: getUniqueIdentifier(),
        googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist',
    },
    android: {
        ...config.android,
        package: getUniqueIdentifier(),
        googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    },
});
