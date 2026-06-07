module.exports = function (api) {
  api.cache(true);

  return {
    presets: [['babel-preset-expo'], 'nativewind/babel'],

    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],

          alias: {
            '@': './src',
            '@/app': './src/app',
            '@/shared': './src/shared',
            '@/features': './src/features',
            '@/stores': './src/stores',
            '@/assets': './assets',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
