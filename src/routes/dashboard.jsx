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
  const [urlHistory, setUrlHistory] = useState([])
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1)

  async function fetchPage(url) {
    setLoading(true)
    const res = await fetch(`${url}&apiKey=${API_KEY}`)
    const data = await res.json()
    if (Array.isArray(data.results)) {
      setStocks(prev => data.results)
      setNextUrl(data.next_url)
    }
    setLoading(false)
  }

  async function nextPage() {
    if (!nextUrl) return
    setUrlHistory(prev => [...prev, nextUrl])
    await fetchPage(nextUrl)
    setPage(prev => prev + 1)
  }

  async function prevPage() {
    if (urlHistory.length === 0) return
    const history = [...urlHistory]
    const prevUrl = history[history.length - 2]
    history.pop()
    setUrlHistory(history)

    if (history.length === 0) {
      setStocks(Array.isArray(initial) ? initial : [])
      setNextUrl(initialNextUrl)
    } else {
      await fetchPage(prevUrl)
    }
    setPage(prev => prev - 1)
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
        <div className={styles.pagination}>
          <button
            className={styles['page-btn']}
            onClick={prevPage}
            disabled={page === 1 || loading}>
            Prev
          </button>

          <span className={styles['page-number']}>Page {page}</span>

          <button
            className={styles['page-btn']}
            onClick={nextPage}
            disabled={!nextUrl || loading}>
            {loading ? 'Loading...' : 'Next'}
          </button>
        </div>
      </div>
    </main>
  );
}