/* eslint-disable react-refresh/only-export-components */
import { restClient } from '@massive.com/client-js';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import "../styles/dashboard.css"

const API_KEY = '4jA3_qqxZqAX0gvE6qFzpKTeCh7vRxQw';
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
    const res = await fetch(`https://api.massive.com/v3/reference/tickers?market=stocks&active=true&order=asc&limit=20&sort=ticker&apiKey=${API_KEY}`)
    const data = await res.json()
    // console.log(data)
    return { stocks: data.results }
    // console.log(stocks)
  }
});

function Home() {
  const [loading, setLoading] = useState(true);
  const { stocks = [] } = Route.useLoaderData()

  return (
    <main className="dashboard-container">
      <div className="logo-navbar">
        <div className="logo">
          <Link to='/'>
            <h1>PULSE.NG</h1>
          </Link>
        </div>

        <div className="navbar-container">
          <ul className="navbar">
            <Link to='/'>
              <li>Home</li>
            </Link>
            <Link to='/portfolios'>
              <li>Portfolios</li>
            </Link>
            <Link to='/trends'>
              <li>Market Trends</li>
            </Link>
            <Link to='/watchlist'>
              <li>Watchlist</li>
            </Link>
          </ul>
        </div>
      </div>
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
