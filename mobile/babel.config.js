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
            '@/assets': './assets',
            '@/components/ui/gluestack-ui-provider': './components/ui/gluestack-ui-provider',
            '@/components/ui': './src/components/ui',
            '@/components': './src/components',
            '@/constants': './src/constants',
            '@/hooks': './src/hooks',
            '@': './src',
            'tailwind.config': './tailwind.config.js',
          },
        },
      ],
    ],
  };
};
