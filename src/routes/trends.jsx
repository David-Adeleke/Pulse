import { createFileRoute } from '@tanstack/react-router';
import ComingSoon from '../components/coming-soon';

export const Route = createFileRoute('/trends')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <ComingSoon
      title='Market Trends'
      description='Trend analytics are being enhanced to highlight momentum, market direction, and notable shifts at a glance.'
    />
  );
}
