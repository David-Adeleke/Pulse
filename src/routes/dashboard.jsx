/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { getCachedPrices, storePrices } from '../lib/price-cache';
import styles from '../styles/dashboard.module.css';

const URL = 'https://api.massive.com';
const API_KEY = '4jA3_qqxZqAX0gvE6qFzpKTeCh7vRxQw';
const limit = 20;
const PRICE_CACHE_MAX_AGE_MS = 2 * 60 * 1000;
const SNAPSHOT_CHUNK_SIZE = 40;

function chunkSymbols(symbols, size) {
  const chunks = [];
  for (let index = 0; index < symbols.length; index += size) {
    chunks.push(symbols.slice(index, index + size));
  }
  return chunks;
}

function resolveSnapshotSymbol(snapshot) {
  return snapshot?.ticker ?? snapshot?.symbol ?? snapshot?.details?.ticker ?? null;
}

function resolveSnapshotPrice(snapshot) {
  const candidates = [
    snapshot?.day?.c,
    snapshot?.prevDay?.c,
    snapshot?.lastTrade?.p,
    snapshot?.lastQuote?.p,
    snapshot?.close,
  ];

  return candidates.find((value) => typeof value === 'number') ?? null;
}

async function fetchSnapshotChunk(symbols) {
  const query = new URLSearchParams({
    tickers: symbols.join(','),
    apiKey: API_KEY,
  });

  const response = await fetch(`${URL}/v2/snapshot/locale/us/markets/stocks/tickers?${query.toString()}`);
  if (!response.ok) {
    throw new Error(`Snapshot request failed with status ${response.status}`);
  }

  const data = await response.json();
  let snapshots = [];
  if (Array.isArray(data.tickers)) {
    snapshots = data.tickers;
  } else if (Array.isArray(data.results)) {
    snapshots = data.results;
  }
  const prices = {};

  snapshots.forEach((snapshot) => {
    const symbol = resolveSnapshotSymbol(snapshot);
    const price = resolveSnapshotPrice(snapshot);

    if (symbol && typeof price === 'number') {
      prices[symbol] = price;
    }
  });

  return prices;
}

async function fetchSnapshotPrices(symbols) {
  const uniqueSymbols = [...new Set(symbols)].filter(Boolean);
  if (!uniqueSymbols.length) return {};

  const chunks = chunkSymbols(uniqueSymbols, SNAPSHOT_CHUNK_SIZE);
  const chunkPriceMaps = await Promise.all(chunks.map((chunk) => fetchSnapshotChunk(chunk)));

  return Object.assign({}, ...chunkPriceMaps);
}

function formatPrice(value) {
  return typeof value === 'number' ? `$${value.toLocaleString()}` : '—';
}

export const Route = createFileRoute('/dashboard')({
  component: Home,
  staleTime: 5 * 60 * 1000,
  loader: async () => {
    const response = await fetch(
      `${URL}/v3/reference/tickers?market=stocks&active=true&order=asc&limit=${limit}&sort=ticker&apiKey=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Tickers request failed with status ${response.status}`);
    }

    const data = await response.json();

    return {
      stocks: Array.isArray(data.results) ? data.results : [],
      nextUrl: data.next_url,
    };
  },
});

function Home() {
  const { stocks: initial, nextUrl: initialNextUrl } = Route.useLoaderData();
  const initialStocks = Array.isArray(initial) ? initial : [];
  const initialSymbols = initialStocks.map((stock) => stock.ticker);
  const [stocks, setStocks] = useState(initialStocks);
  const [priceMap, setPriceMap] = useState(() => getCachedPrices(initialSymbols, PRICE_CACHE_MAX_AGE_MS).cachedPrices);
  const [nextUrl, setNextUrl] = useState(initialNextUrl);
  const [urlHistory, setUrlHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshingPrices, setRefreshingPrices] = useState(false);

  useEffect(() => {
    const symbols = stocks.map((stock) => stock.ticker);

    if (!symbols.length) {
      setPriceMap({});
      setRefreshingPrices(false);
      return;
    }

    const { cachedPrices, symbolsToRefresh } = getCachedPrices(symbols, PRICE_CACHE_MAX_AGE_MS);
    setPriceMap(cachedPrices);

    if (!symbolsToRefresh.length) {
      setRefreshingPrices(false);
      return;
    }

    let cancelled = false;
    setRefreshingPrices(true);

    async function refreshSnapshotPrices() {
      try {
        const freshPrices = await fetchSnapshotPrices(symbolsToRefresh);
        if (cancelled) return;

        setPriceMap((prev) => ({ ...prev, ...freshPrices }));
        storePrices(freshPrices);
      } catch (error) {
        console.error('Failed to refresh stock prices from snapshot API.', error);
      } finally {
        if (!cancelled) {
          setRefreshingPrices(false);
        }
      }
    }

    void refreshSnapshotPrices();

    return () => {
      cancelled = true;
    };
  }, [stocks]);

  async function fetchPage(url) {
    setLoading(true);

    try {
      const response = await fetch(`${url}&apiKey=${API_KEY}`);
      if (!response.ok) {
        throw new Error(`Tickers page request failed with status ${response.status}`);
      }

      const data = await response.json();
      setStocks(Array.isArray(data.results) ? data.results : []);
      setNextUrl(data.next_url);
    } finally {
      setLoading(false);
    }
  }

  async function nextPage() {
    if (!nextUrl) return;

    const currentPageUrl = nextUrl;

    try {
      await fetchPage(currentPageUrl);
      setUrlHistory((prev) => [...prev, currentPageUrl]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Unable to load next page of tickers.', error);
    }
  }

  async function prevPage() {
    if (urlHistory.length === 0) return;

    const history = [...urlHistory];
    const prevUrl = history[history.length - 2];
    history.pop();

    try {
      if (history.length === 0) {
        setStocks(initialStocks);
        setNextUrl(initialNextUrl);
      } else if (prevUrl) {
        await fetchPage(prevUrl);
      }

      setUrlHistory(history);
      setPage((prev) => prev - 1);
    } catch (error) {
      console.error('Unable to load previous page of tickers.', error);
    }
  }

  const pricedCount = stocks.filter((stock) => typeof priceMap?.[stock.ticker] === 'number').length;

  return (
    <main className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Market Overview</p>
          <h1 className={styles.title}>Active Stocks</h1>
          <p className={styles.subtitle}>
            Prices are loaded in bulk from snapshot endpoints and cached locally for faster reloads.
          </p>
        </div>
        <div className={styles.metrics}>
          <div className={styles.metricItem}>
            <span>Symbols</span>
            <strong>{stocks.length}</strong>
          </div>
          <div className={styles.metricItem}>
            <span>With Price</span>
            <strong>{pricedCount}</strong>
          </div>
          <div className={styles.metricItem}>
            <span>Price Sync</span>
            <strong>{refreshingPrices ? 'Live' : 'Cached'}</strong>
          </div>
        </div>
      </header>

      <section className={styles.tickerContainer}>
        {stocks.map((ticker) => (
          <article key={ticker.ticker} className={styles.tickerCard}>
            <Link to='/ticker-profile/$symbol' params={{ symbol: ticker.ticker }} className={styles.tickerLink}>
              <div className={styles.tickerTop}>
                <h2 className={styles.tickerSymbol}>{ticker.ticker}</h2>
                <span className={styles.tickerPrice}>{formatPrice(priceMap?.[ticker.ticker])}</span>
              </div>
              <p className={styles.tickerName}>{ticker.name}</p>
              <span className={styles.tickerCta}>View details →</span>
            </Link>
          </article>
        ))}
      </section>

      <div className={styles.pagination}>
        <button className={styles.pageBtn} onClick={prevPage} disabled={page === 1 || loading}>
          Prev
        </button>

        <span className={styles.pageNumber}>Page {page}</span>

        <button className={styles.pageBtn} onClick={nextPage} disabled={!nextUrl || loading}>
          {loading ? 'Loading...' : 'Next'}
        </button>
      </div>
    </main>
  );
}
