/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import './index.css';

const API_KEY = 'demo';
const NGX_TICKERS = [
  { symbol: 'MTNN.LAG', name: 'MTN Nigeria' },
  { symbol: 'DANGCEM.LAG', name: 'Dangote Cement' },
  { symbol: 'ZENITHBANK.LAG', name: 'Zenith Bank' },
  { symbol: 'GTCO.LAG', name: 'Guaranty Trust Holding Company' },
  { symbol: 'SEPLAT.LAG', name: 'Seplat Energy' },
  { symbol: 'BUACEMENT.LAG', name: 'BUA Cement' },
];

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchQuote = async ({ symbol, name }) => {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        throw new Error('Unable to fetch NGX market data right now.');
      }

      const data = await response.json();
      const quote = data['Global Quote'];

      return {
        symbol,
        name,
        price: Number(quote?.['05. price'] || 0),
        change: Number(quote?.['09. change'] || 0),
        changePercent: quote?.['10. change percent'] || '0%',
        previousClose: Number(quote?.['08. previous close'] || 0),
      };
    };

    const fetchMarketData = async () => {
      try {
        setLoading(true);
        setError('');

        const results = await Promise.all(NGX_TICKERS.map(fetchQuote));
        setQuotes(results);
        setLastUpdated(new Date().toLocaleTimeString());
      } catch {
        setError(
          'Could not load live market data. This can happen when the API rate limit is exceeded. Please try again in a minute.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();

    return () => controller.abort();
  }, []);

  const filteredQuotes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return quotes;
    }

    return quotes.filter(
      (quote) =>
        quote.symbol.toLowerCase().includes(term) ||
        quote.name.toLowerCase().includes(term)
    );
  }, [quotes, searchTerm]);

  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">NGX Monitor</p>
          <h1>Nigerian Exchange Dashboard</h1>
          <p className="dashboard__subtitle">
            Live quotes powered by Alpha Vantage's public API.
          </p>
        </div>

        <input
          className="dashboard__search"
          type="search"
          placeholder="Search by ticker or company"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Search NGX ticker symbols"
        />
      </header>

      <section className="dashboard__status">
        {loading && <p>Loading NGX quotes...</p>}
        {!loading && !error && <p>Last updated: {lastUpdated}</p>}
        {error && <p className="dashboard__error">{error}</p>}
      </section>

      <section className="dashboard__grid">
        {filteredQuotes.map((quote) => {
          const isPositive = quote.change >= 0;

          return (
            <article key={quote.symbol} className="quote-card">
              <div className="quote-card__top">
                <h2>{quote.symbol}</h2>
                <span className={`quote-card__badge ${isPositive ? 'up' : 'down'}`}>
                  {quote.changePercent}
                </span>
              </div>
              <p className="quote-card__name">{quote.name}</p>
              <p className="quote-card__price">₦ {quote.price.toFixed(2)}</p>
              <p className={`quote-card__change ${isPositive ? 'up' : 'down'}`}>
                {isPositive ? '+' : ''}
                {quote.change.toFixed(2)}
              </p>
              <p className="quote-card__prev-close">
                Previous close: ₦ {quote.previousClose.toFixed(2)}
              </p>
            </article>
          );
        })}
      </section>

      {!loading && !filteredQuotes.length && !error && (
        <p className="dashboard__empty">No ticker matches "{searchTerm}".</p>
      )}
    </main>
  );
}
