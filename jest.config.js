// jest.config.js
// ============================================
// Configuración de Jest para NaturApp
// Sesión 13: Pruebas de Software Móvil
// ============================================

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  setupFiles: ['<rootDir>/__tests__/setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|firebase)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/services/firebaseConfig.js',
    '!**/node_modules/**',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/__tests__/setup.js'],
};
