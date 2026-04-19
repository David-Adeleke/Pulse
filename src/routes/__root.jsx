/* eslint-disable react-refresh/only-export-components */
import { Outlet, createRootRoute, useRouterState } from '@tanstack/react-router';
import Logo from '../components/logo'

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  return (
    <>
      {pathname !== '/' && <Logo />}
      <Outlet />
    </>
  );
}
