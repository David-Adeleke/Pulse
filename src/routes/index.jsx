import { createFileRoute, Link } from '@tanstack/react-router'
import './index.css';

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div className='container'>
        <h1>Welcome to PulseNG</h1>
        <p>The stock market, at a glance</p>
        <small>Clean dashboard and the insights that matter, built for investors tracking the market.</small>
      </div>
      <Link to='/dashboard'>Go to Dashboard</Link>
    </>
  )
}
