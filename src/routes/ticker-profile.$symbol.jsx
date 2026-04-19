import { createFileRoute } from '@tanstack/react-router'
import styles from "../styles/ticker-profile.module.css"

const URL = 'https://api.massive.com'
const API_KEY = '4jA3_qqxZqAX0gvE6qFzpKTeCh7vRxQw';

export const Route = createFileRoute('/ticker-profile/$symbol')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const res = await fetch(`${URL}/v3/reference/tickers/${params.symbol}?apiKey=${API_KEY}`)
    const data = await res.json()
    return { ticker: data.results }
  }
})

function RouteComponent() {
  const { ticker = {} } = Route.useLoaderData()

  console.log(ticker)

  return (
    <>
      <div className={styles['ticker-profile-container']}>
        <div className={styles['ticker-info']}>
          <h1>{ticker.ticker}</h1>
          <p>{ticker.name}</p>
        </div>
        <div className={styles['ticker-financials']}>
          <div className={styles['financial-item']}>
            <p className={styles['financial-label']}>Market Cap</p>
            <p className={styles['financial-value']}>${ticker.market_cap?.toLocaleString() ?? '—'}</p>
          </div>
        </div>
      </div>
    </>
  )
}
