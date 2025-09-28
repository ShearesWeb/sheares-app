const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';
const IS_PROD = process.env.APP_VARIANT === 'production';

const getUniqueIdentifier = () => {
    // if (IS_DEV) {
    //     return 'com.sheareswebteam.shearesapp.dev';
    // }

    return 'com.sheareswebteam.shearesapp';
};

const getAppName = () => {
    if (IS_DEV) {
        return 'Sheares App (Dev)';
    }

    if (IS_PREVIEW) {
        return 'Sheares App (Preview)';
    }

    return 'Sheares App';
};

export default ({ config }) => ({
    ...config,
    name: getAppName(),
    ios: {
        ...config.ios,
        bundleIdentifier: getUniqueIdentifier(),
        googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist',
        urlSchemes: [
            'com.googleusercontent.apps.218841951797-tlfao4r4ghrl2bi2k5mk3ainjt61qqcf',
            'com.sheareswebteam.shearesapp',
            'src'
        ],
    },
    android: {
        ...config.android,
        package: getUniqueIdentifier(),
        googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    },
});
