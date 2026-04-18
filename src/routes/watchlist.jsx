import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/watchlist')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/watchlist"!</div>
}
