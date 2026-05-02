import { createFileRoute, Link } from '@tanstack/react-router'
import styles from "../styles/ticker-profile.module.css"

const URL = 'https://api.massive.com'
const API_KEY = '4jA3_qqxZqAX0gvE6qFzpKTeCh7vRxQw';

export const Route = createFileRoute('/ticker-profile/$symbol')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [detailRes, priceRes] = await Promise.all([
      fetch(`${URL}/v3/reference/tickers/${params.symbol}?apiKey=${API_KEY}`),
      fetch(`${URL}/v2/aggs/ticker/${params.symbol}/prev?apiKey=${API_KEY}`)
    ]) 
    const detail = await detailRes.json()
    const price = await priceRes.json()
    return { 
      ticker: detail.results,
      quote: price.results?.[0] ?? null
    }
  }
})

function RouteComponent() {
  const { ticker = {}, quote = null } = Route.useLoaderData()

  return (
    <>
      <div className={styles['ticker-profile-container']}>
        <Link to='/dashboard'>Back</Link>
        <div className={styles['ticker-info']}>
          <h1>{ticker.ticker}</h1>
          <p>{ticker.name}</p>
        </div>
        {quote && (
          <div className={styles['ticker-financials']}>
            <div className={styles['financial-item']}>
              <p className={styles['financial-label']}>
                Close Price
              </p>
            </div>
          </div>
        )}
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
