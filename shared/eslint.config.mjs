import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['react-native', 'react-native/*'], message: 'shared/ must not depend on react-native' },
          { group: ['expo-*', '@expo/*'], message: 'shared/ must not depend on expo' },
          { group: ['@react-native/*'], message: 'shared/ must not depend on @react-native packages' },
        ],
      }],
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },
  {
    files: ['**/*.test.ts', '**/__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },
)
