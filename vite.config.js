import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';

// Vite configuration for the React + TanStack Router + Tailwind stack.
export default defineConfig({
  // Register build-time plugins.
  plugins: [
    // Generates and wires file-based TanStack routes.
    tanstackRouter({
      // Router integration target.
      target: 'react',
      // Split route chunks automatically for better loading behavior.
      autoCodeSplitting: true,
    }),
    // Enables React fast refresh + JSX transform support.
    react(),
    // Enables Tailwind CSS v4 processing through Vite.
    tailwindcss(),
  ],
});
