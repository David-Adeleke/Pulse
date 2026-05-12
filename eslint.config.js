import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Flat ESLint configuration shared across the project.
export default defineConfig([
  // Do not lint generated production build output.
  globalIgnores(['dist']),
  {
    // Apply this config to JavaScript and JSX files.
    files: ['**/*.{js,jsx}'],
    // Start from recommended base rules and React-focused presets.
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      // Enable modern JavaScript syntax support.
      ecmaVersion: 2020,
      // Include browser globals like window/document.
      globals: globals.browser,
      parserOptions: {
        // Parse the latest ECMAScript version.
        ecmaVersion: 'latest',
        // Turn on JSX parsing.
        ecmaFeatures: { jsx: true },
        // Treat files as ES modules.
        sourceType: 'module',
      },
    },
    rules: {
      // Fail on unused vars, except ALL_CAPS names often used for constants/components.
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
