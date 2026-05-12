import { createFileRoute } from '@tanstack/react-router';
import ComingSoon from '../components/coming-soon';

// Trends page route (placeholder).
export const Route = createFileRoute('/trends')({
  component: RouteComponent,
})

// Placeholder page content until trend analytics are ready.
function RouteComponent() {
  return (
    <ComingSoon
      title='Market Trends'
      description='Trend analytics are being enhanced to highlight momentum, market direction, and notable shifts at a glance.'
    />
  );
}
