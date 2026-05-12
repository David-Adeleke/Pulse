import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createHashHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

// Create the app router instance from the generated route tree.
const router = createRouter({
  // Register all file-based routes.
  routeTree,
  // Use hash-based routing to work well in static-hosting environments.
  history: createHashHistory(),
});

// Mount the React app and provide the router to the component tree.
createRoot(document.getElementById('root')).render(
  // StrictMode helps surface unsafe patterns during development.
  <StrictMode>
    {/* RouterProvider renders the currently matched route. */}
    <RouterProvider router={router} />
  </StrictMode>
);
