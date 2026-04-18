import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/ticker-profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/ticker-profile"!</div>
}
