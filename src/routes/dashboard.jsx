/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import styles from "../styles/dashboard.module.css"

const URL = 'https://api.massive.com'
const API_KEY = '4jA3_qqxZqAX0gvE6qFzpKTeCh7vRxQw';
const limit = 20


export const Route = createFileRoute('/dashboard')({
  component: Home,
  loader: async () => {
    const res = await fetch(`${URL}/v3/reference/tickers?market=stocks&active=true&order=asc&limit=${limit}&sort=ticker&apiKey=${API_KEY}`)
    const data = await res.json()
    return { stocks: data.results, nextUrl: data.next_url }
  }
});

function Home() {
  const { stocks: initial, nextUrl: initialNextUrl } = Route.useLoaderData()
  const [stocks, setStocks] = useState(Array.isArray(initial) ? initial : [])
  const [nextUrl, setNextUrl] = useState(initialNextUrl)
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!nextUrl) return
    setLoading(true)
    const res = await fetch(`${nextUrl}&apiKey=${API_KEY}`)
    const data = await res.json()
    if (Array.isArray(data.results)) {
      setStocks(prev => [...prev, ...data.results])
      setNextUrl(data.next_url)
    }
    setLoading(false)
  }

  return (
    <main className={styles['dashboard-container']}>
      <div>
        <div className={styles['ticker-container']}>
          {stocks.map((ticker) => (
            <div key={ticker.ticker} className={styles.ticker}>
              <div>
                <Link to='/ticker-profile/$symbol' params={{ symbol: ticker.ticker }}>
                  <h1 className={styles['ticker-symbol']}>{ticker.ticker}</h1>
                  <p className={styles['ticker-name']}>{ticker.name}</p>
                </Link>
              </div>
            </div>
          ))}
        </div>
        {nextUrl && (
          <button className={styles['load-more']}
            onClick={loadMore}
            disabled={loading}>
            {loading ? 'Loading...' : 'Next'}
          </button>
        )}
      </div>
    </main>
  );
}
