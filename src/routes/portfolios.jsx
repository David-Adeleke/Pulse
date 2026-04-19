import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/portfolios')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div>Hello "/portfolio"!</div>
    </>
  )
}
