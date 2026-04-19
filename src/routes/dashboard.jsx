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
    return { stocks: data.results }
  }
});

function Home() {
  const [loading, setLoading] = useState(true);
  const { stocks = [] } = Route.useLoaderData()

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
      </div>
    </main>
  );
}
