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
});

function Home() {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  async function listStockTickers() {
    try {
      const response = await rest.listTickers({
        market: "stocks",
        active: "true",
        order: "asc",
        limit: '10',
        sort: "ticker"
      })
      console.log(response)

    } catch (error) {
      console.error('An error happened', error)
    }
  }

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
          {NGX_TICKERS.map((ticker) => (
            <div key={ticker.symbol}>
              <div className="ticker">
                <Link to='/ticker-profile'>
                  <h1 className='ticker-symbol'>{ticker.symbol}</h1>
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
