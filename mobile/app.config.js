const appJson = require('./app.json');

const expoConfig = appJson.expo ?? {};

module.exports = () => ({
  ...expoConfig,
  extra: {
    ...(expoConfig.extra ?? {}),
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL ?? '',
  },
});
