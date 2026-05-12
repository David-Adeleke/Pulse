/* eslint-disable react-refresh/only-export-components */
import { Outlet, createRootRoute, useRouterState } from '@tanstack/react-router';
import Logo from '../components/logo'
import Loader from '../components/loader'

// Root route definition for the full application shell.
export const Route = createRootRoute({
  // Root component wraps every page.
  component: RootComponent,
});

// Global layout that controls nav visibility + loading overlay.
function RootComponent() {
  // Current pathname (used to hide the logo on landing page).
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  // Router pending status to show an overlay while loading route data.
  const isLoading = useRouterState({ select: (s) => s.status === 'pending' })
  return (
    <>
      {/* Hide top nav on the home page hero route. */}
      {pathname !== '/' && <Logo />}
      {/* Show app-wide loader when route transitions are pending. */}
      {isLoading && <Loader />}
      {/* Render matched child route content. */}
      <Outlet />
    </>
  );
}
