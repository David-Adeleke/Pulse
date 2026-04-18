/* eslint-disable react-refresh/only-export-components */
import { restClient } from '@massive.com/client-js';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

const API_KEY = '4jA3_qqxZqAX0gvE6qFzpKTeCh7vRxQw';
const rest = restClient(API_KEY, 'https://api.massive.com')

const NGX_TICKERS = [
  { symbol: 'MTNN.LAG', name: 'MTN Nigeria' },
  { symbol: 'DANGCEM.LAG', name: 'Dangote Cement' },
  { symbol: 'ZENITHBANK.LAG', name: 'Zenith Bank' },
  { symbol: 'GTCO.LAG', name: 'Guaranty Trust Holding Company' },
  { symbol: 'SEPLAT.LAG', name: 'Seplat Energy' },
  { symbol: 'BUACEMENT.LAG', name: 'BUA Cement' },
  { symbol: 'ARADEL.LAG', name: 'Aradel' },
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
// listStockTickers()
  return (
    <main className="dashboard">
      {NGX_TICKERS.map((ticker) => (
        <div key={ticker.symbol}>
          <h1>{ticker.symbol}</h1>
          <p>{ticker.name}</p>
        </div>
      ))}
    </main>
  );
}
