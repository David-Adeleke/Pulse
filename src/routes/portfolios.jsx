import { createFileRoute } from '@tanstack/react-router';
import ComingSoon from '../components/coming-soon';

// Portfolio page route (placeholder).
export const Route = createFileRoute('/portfolios')({
  component: RouteComponent,
})

// Placeholder page content until portfolio tooling ships.
function RouteComponent() {
  return (
    <ComingSoon
      title='Portfolio Tracking'
      description='Portfolio tools are in progress with cleaner allocation views and richer performance snapshots.'
    />
  );
}
