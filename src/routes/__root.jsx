/* eslint-disable react-refresh/only-export-components */
import { Outlet, createRootRoute } from '@tanstack/react-router';

export const Route = createRootRoute({
  components: RootComponent,
});

function RootComponent() {
  return <Outlet />;
}
