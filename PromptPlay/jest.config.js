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
      // React Native feature tests (hooks, components)
      displayName: 'react-native',
      preset: 'react-native',
      testMatch: ['<rootDir>/src/features/**/*.test.{ts,tsx}'],
      moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react' } }],
        '^.+\\.(js|jsx|mjs|cjs)$': 'babel-jest',
      },
      transformIgnorePatterns: [
        'node_modules/(?!(react-native|@react-native|@testing-library/react-native|expo|@expo|@react-navigation)/)',
      ],
    },
  ],
};
