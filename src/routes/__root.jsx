/* eslint-disable react-refresh/only-export-components */
import { Outlet, createRootRoute, useRouterState } from '@tanstack/react-router';
import Logo from '../components/logo'
import Loader from '../components/loader'

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const isLoading = useRouterState({ select: (s) => s.status === 'pending' })
  return (
    <>
      {pathname !== '/' && <Logo />}
      {isLoading && <Loader />}
      <Outlet />
    </>
  );
}
