/* eslint-disable react-refresh/only-export-components */
import { restClient } from '@massive.com/client-js';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import "../styles/dashboard.css"

const URL = 'https://api.massive.com'
const API_KEY = '4jA3_qqxZqAX0gvE6qFzpKTeCh7vRxQw';
const limit = 20
const rest = restClient(API_KEY, 'https://api.massive.com')

const NGX_TICKERS = [
  { symbol: 'MTNN', name: 'MTN Nigeria' },
  { symbol: 'DANGCEM', name: 'Dangote Cement' },
  { symbol: 'ZENITHBANK', name: 'Zenith Bank' },
  { symbol: 'GTCO', name: 'Guaranty Trust Holding Company' },
  { symbol: 'SEPLAT', name: 'Seplat Energy' },
  { symbol: 'BUACEMENT', name: 'BUA Cement' },
  { symbol: 'ARADEL', name: 'Aradel' },
];

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
    <main className="dashboard-container">
      <div>
        <div className='ticker-container'>
          {stocks.map((ticker) => (
            <div key={ticker.ticker} className="ticker">
              <div>
                <Link to='/ticker-profile'>
                  <h1 className='ticker-symbol'>{ticker.ticker}</h1>
                  <p className='ticker-name'>{ticker.name}</p>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
