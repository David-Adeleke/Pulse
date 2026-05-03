import { createFileRoute, useRouter } from '@tanstack/react-router'
import styles from "../styles/ticker-profile.module.css"

const URL = 'https://api.massive.com'
const API_KEY = '4jA3_qqxZqAX0gvE6qFzpKTeCh7vRxQw';

// const to = new Date()
// const from = new Date()
// from.setMonth(from.getMonth() - 6)

export const Route = createFileRoute('/ticker-profile/$symbol')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [detailRes, priceRes, chartRes] = await Promise.all([
      fetch(`${URL}/v3/reference/tickers/${params.symbol}?apiKey=${API_KEY}`),
      fetch(`${URL}/v2/aggs/ticker/${params.symbol}/prev?apiKey=${API_KEY}`),
      fetch(`${URL}/v2/aggs/ticker/${params.symbol}/range/1/day/2024-01-01/2026-01-01?apiKey=${API_KEY}`)
    ])
    const detail = await detailRes.json()
    const price = await priceRes.json()
    const chart = await chartRes.json()

    return {
      ticker: detail.results,
      quote: price.results?.[0] ?? null,
      candles: chart.results || []
    }
  }
})

// const formatted = candles.map(c => ({
//   time: c.t,
//   close: c.c
// }))

function SimpleChart({ data }) {
  if (!data.length) return null

  const width = 600
  const height = 200

  const max = Math.max(...data.map(d => d.close))
  const min = Math.min(...data.map(d => d.close))

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width
    const range = max - min || 1
    const y = height - ((d.close - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height}>
      <polyline
        fill="none"
        stroke='#00e09e'
        strokeWidth='2'
        points={points}
      />
    </svg>
  )
}

function RouteComponent() {
  const { ticker = {}, quote = null, candles } = Route.useLoaderData()
  const router = useRouter()

  const chartData = candles.map(c => ({
    time: c.t,
    close: c.c
  }))

  return (
    <>
      <div className={styles['ticker-profile-container']}>
        <button className={styles.back} onClick={() => router.history.back()}>← Back</button>
        <div className={styles['ticker-info']}>
          <h1>{ticker?.ticker ?? '-'}</h1>
          <p>{ticker?.name ?? '-'}</p>
        </div>
        
        <SimpleChart data={chartData} />

        {quote && (
          <div className={styles['ticker-financials']}>
            <div className={styles['financial-item']}>
              <p className={styles['financial-label']}>
                Close Price
              </p>
              <p className={styles['financial-value']}>
                ${quote.c?.toLocaleString() ?? '-'}
              </p>
            </div>
            <div className={styles['financial-item']}>
              <p className={styles['financial-label']}>
                Open Price
              </p>
              <p className={styles['financial-value']}>
                ${quote.o?.toLocaleString() ?? '-'}
              </p>
            </div>

            <div className={styles['financial-item']}>
              <p className={styles['financial-label']}>
                High
              </p>
              <p className={styles['financial-value']}>
                ${quote.h?.toLocaleString() ?? '-'}
              </p>
            </div>

            <div className={styles['financial-item']}>
              <p className={styles['financial-label']}>
                Low
              </p>
              <p className={styles['financial-value']}>
                ${quote.l?.toLocaleString() ?? '-'}
              </p>
            </div>
          </div>
        )}
        <div className={styles['ticker-financials']}>
          <div className={styles['financial-item']}>
            <p className={styles['financial-label']}>Market Cap</p>
            <p className={styles['financial-value']}>${ticker.market_cap?.toLocaleString() ?? '—'}</p>
          </div>
          <div className={styles['financial-item']}>
            <p className={styles['financial-label']}>Volume</p>
            <p className={styles['financial-value']}>${quote?.v?.toLocaleString() ?? '—'}</p>
          </div>
        </div>
      </div>
    </>
  )
}
