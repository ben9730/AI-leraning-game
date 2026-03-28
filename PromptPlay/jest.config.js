/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      // Pure TypeScript tests with no RN dependencies (schema, loader, etc.)
      displayName: 'node',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/content/**/*.test.{ts,tsx}'],
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react' } }],
      },
    },
    {
      // Pure TypeScript gamification logic tests (no RN dependencies)
      displayName: 'gamification',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/features/gamification/**/*.test.{ts,tsx}'],
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react' } }],
      },
    },
    {
      // Pure TypeScript skill-tree logic tests (no RN dependencies)
      displayName: 'skill-tree',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/features/skill-tree/**/*.test.{ts,tsx}'],
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react' } }],
      },
    },
    {
      // PWA feature tests — need jsdom for window + navigator globals
      displayName: 'pwa',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/features/pwa/**/*.test.{ts,tsx}'],
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react' } }],
      },
    },
    {
      // React Native feature tests (hooks, components)
      displayName: 'react-native',
      preset: 'react-native',
      testMatch: ['<rootDir>/src/features/**/*.test.{ts,tsx}'],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/src/features/skill-tree/',
        '/src/features/pwa/',
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^expo-haptics$': '<rootDir>/__mocks__/expo-haptics.js',
        '^lottie-react-native$': '<rootDir>/__mocks__/lottie-react-native.js',
      },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react' } }],
        '^.+\\.(js|jsx|mjs|cjs)$': 'babel-jest',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|@testing-library/react-native|expo|@expo|expo-haptics|lottie-react-native|@react-navigation)/)',
      ],
    },
  ],
};
