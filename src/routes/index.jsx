import { createFileRoute, Link } from '@tanstack/react-router'
import '../styles/index.css';

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div className="body-container">
        <div className='hero-container'>
          <h1 className='hero-text'>Welcome to PulseNG</h1>
          <p className='hero-subtext'>The stock market, at a glance</p>
          <small className='hero-small'>Clean dashboard and the insights that matter, built for investors tracking the market.</small>
          <Link to='/dashboard'>Go to Dashboard</Link>
        </div>
      </div>
    </>
  )
}
