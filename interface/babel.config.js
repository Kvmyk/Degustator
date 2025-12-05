module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '../main/.env',   // <- poprawna ścieżka do Twojego .env względem katalogu interface
      safe: false,
      allowUndefined: true
    }]
  ]
};
