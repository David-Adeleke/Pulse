import { createFileRoute } from '@tanstack/react-router';
import ComingSoon from '../components/coming-soon';

// Watchlist page route (placeholder).
export const Route = createFileRoute('/watchlist')({
  component: RouteComponent,
})

// Placeholder page content until watchlist features are released.
function RouteComponent() {
  return (
    <ComingSoon
      title='Watchlist Experience'
      description='Your personal watchlist view is being polished with fast symbol pinning and cleaner movement tracking.'
    />
  );
}
