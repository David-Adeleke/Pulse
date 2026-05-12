/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';
import { getCachedPrices, storePrices } from '../lib/price-cache';
import { getCachedIndustries, normalizeIndustry, storeIndustries } from '../lib/ticker-metadata-cache';
import styles from '../styles/dashboard.module.css';

// Base URL for the upstream market data provider.
const URL = 'https://api.massive.com';
// API key used for all market/reference requests in this route.
const API_KEY = '4jA3_qqxZqAX0gvE6qFzpKTeCh7vRxQw';
// Number of symbols requested per page.
const limit = 20;

// cache age limit for prices is short since we want them to be relatively fresh, and we have fallback mechanisms to get reasonably recent prices for any missing symbols. industry data is more static, so we can afford to cache it for longer periods.
const PRICE_CACHE_MAX_AGE_MS = 2 * 60 * 1000;
const INDUSTRY_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const GROUPED_LOOKBACK_DAYS = 7;
const GROUPED_CACHE_MAX_AGE_MS = 2 * 60 * 1000;
const FALLBACK_MAX_RETRIES = 4;
const FALLBACK_BASE_DELAY_MS = 350;
const FALLBACK_GAP_MS = 120;
const INDUSTRY_LOOKUP_GAP_MS = 80;

// cache for grouped close prices
let groupedCloseMapCache = null;
let groupedCloseMapCacheAt = 0;
let groupedCloseMapPromise = null;

const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'stock', label: 'Stocks' },
  { value: 'etf', label: 'ETFs' },
];

// Promise-based delay helper for pacing API calls and backoff retries.
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Convert a Date into YYYY-MM-DD (UTC) expected by grouped aggregate endpoints.
function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

// Build recent date keys so we can try multiple days when market data is missing.
function getRecentDateKeys(days) {
  const now = new Date();
  const keys = [];

  for (let index = 0; index < days; index += 1) {
    const candidate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - index));
    keys.push(toDateKey(candidate));
  }

  return keys;
}

// Normalize provider-specific type strings into app-level values.
function normalizeTickerType(rawType) {
  const type = String(rawType ?? '').toUpperCase();
  return type.includes('ETF') ? 'etf' : 'stock';
}

// User-friendly label for ticker type badge.
function tickerTypeLabel(rawType) {
  return normalizeTickerType(rawType) === 'etf' ? 'ETF' : 'Stock';
}

// Fetch grouped close prices for a specific market date.
async function fetchGroupedCloseMapForDate(dateKey) {
  const query = new URLSearchParams({ adjusted: 'true', apiKey: API_KEY });
  const response = await fetch(`${URL}/v2/aggs/grouped/locale/us/market/stocks/${dateKey}?${query.toString()}`);

  if (!response.ok) {
    throw new Error(`Grouped request failed with status ${response.status}`);
  }

  const data = await response.json();
  const groupedRows = Array.isArray(data.results) ? data.results : [];
  // Map ticker symbol => close price.
  const prices = {};

  groupedRows.forEach((row) => {
    const symbol = row?.T;
    const price = row?.c;

    if (symbol && typeof price === 'number') {
      prices[symbol] = price;
    }
  });

  return prices;
}

// Try recent dates until we find a non-empty grouped map.
async function fetchLatestGroupedMarketMap() {
  const dateKeys = getRecentDateKeys(GROUPED_LOOKBACK_DAYS);

  for (const dateKey of dateKeys) {
    try {
      const groupedPriceMap = await fetchGroupedCloseMapForDate(dateKey);
      if (Object.keys(groupedPriceMap).length > 0) {
        return groupedPriceMap;
      }
    } catch {
      continue;
    }
  }

  return {};
}

// Cache grouped map in memory to avoid repeated expensive grouped requests.
async function getGroupedMarketMap() {
  const now = Date.now();
  const hasFreshCache =
    groupedCloseMapCache !== null && now - groupedCloseMapCacheAt <= GROUPED_CACHE_MAX_AGE_MS;

  if (hasFreshCache) {
    return groupedCloseMapCache;
  }

  if (!groupedCloseMapPromise) {
    groupedCloseMapPromise = fetchLatestGroupedMarketMap()
      .then((result) => {
        groupedCloseMapCache = result;
        groupedCloseMapCacheAt = Date.now();
        return result;
      })
      .finally(() => {
        groupedCloseMapPromise = null;
      });
  }

  return groupedCloseMapPromise;
}

// Pull grouped prices for the requested symbol set.
async function fetchGroupedPrices(symbols) {
  const uniqueSymbols = [...new Set(symbols)].filter(Boolean);
  if (!uniqueSymbols.length) return {};

  const marketMap = await getGroupedMarketMap();
  const result = {};

  uniqueSymbols.forEach((symbol) => {
    const value = marketMap?.[symbol];
    if (typeof value === 'number') {
      result[symbol] = value;
    }
  });

  return result;
}

// Parse Retry-After header in either seconds or HTTP-date format.
function parseRetryAfterMs(response) {
  const raw = response.headers.get('Retry-After');
  if (!raw) return null;

  const asSeconds = Number(raw);
  if (Number.isFinite(asSeconds) && asSeconds > 0) {
    return asSeconds * 1000;
  }

  const asDate = Date.parse(raw);
  if (Number.isNaN(asDate)) return null;

  const delta = asDate - Date.now();
  return delta > 0 ? delta : null;
}

// Fallback endpoint per symbol (with retry + backoff on transient failures).
async function fetchPreviousClosePrice(symbol) {
  for (let attempt = 0; attempt < FALLBACK_MAX_RETRIES; attempt += 1) {
    const query = new URLSearchParams({ adjusted: 'true', apiKey: API_KEY });
    const response = await fetch(`${URL}/v2/aggs/ticker/${symbol}/prev?${query.toString()}`);

    if (response.ok) {
      const data = await response.json();
      const close = data?.results?.[0]?.c;
      return typeof close === 'number' ? close : null;
    }

    const isRetriable = response.status === 429 || response.status >= 500;
    if (!isRetriable) {
      return null;
    }

    const retryAfterMs = parseRetryAfterMs(response);
    const backoffMs = FALLBACK_BASE_DELAY_MS * (attempt + 1);
    await sleep(retryAfterMs ?? backoffMs);
  }

  return null;
}

// Sequentially fetch previous close prices for missing symbols.
async function fetchPrevClosePrices(symbols) {
  const uniqueSymbols = [...new Set(symbols)].filter(Boolean);
  if (!uniqueSymbols.length) return {};

  const priceMap = {};

  for (const symbol of uniqueSymbols) {
    const close = await fetchPreviousClosePrice(symbol);
    if (typeof close === 'number') {
      priceMap[symbol] = close;
    }
    await sleep(FALLBACK_GAP_MS);
  }

  return priceMap;
}

// Bulk price strategy:
// 1) grouped endpoint for most symbols
// 2) per-symbol previous close endpoint for missing symbols
async function fetchBulkPrices(symbols) {
  const uniqueSymbols = [...new Set(symbols)].filter(Boolean);
  if (!uniqueSymbols.length) return {};

  const grouped = await fetchGroupedPrices(uniqueSymbols);
  const missingSymbols = uniqueSymbols.filter((symbol) => grouped[symbol] === undefined);

  if (!missingSymbols.length) {
    return grouped;
  }

  const fallback = await fetchPrevClosePrices(missingSymbols);
  return { ...grouped, ...fallback };
}

// Fetch and normalize industry metadata for one symbol.
async function fetchIndustryForTicker(symbol) {
  const query = new URLSearchParams({ apiKey: API_KEY });
  const response = await fetch(`${URL}/v3/reference/tickers/${symbol}?${query.toString()}`);

  if (!response.ok) {
    return normalizeIndustry(null);
  }

  const data = await response.json();
  return normalizeIndustry(data?.results?.sic_description);
}

// Sequentially fetch industries to avoid sending burst requests.
async function fetchIndustries(symbols) {
  const uniqueSymbols = [...new Set(symbols)].filter(Boolean);
  if (!uniqueSymbols.length) return {};

  const result = {};

  for (const symbol of uniqueSymbols) {
    result[symbol] = await fetchIndustryForTicker(symbol);
    await sleep(INDUSTRY_LOOKUP_GAP_MS);
  }

  return result;
}

// Display formatter for prices.
function formatPrice(value) {
  return typeof value === 'number' ? `$${value.toLocaleString()}` : '—';
}

// Dashboard route definition and initial loader query.
export const Route = createFileRoute('/dashboard')({
  component: Home,
  // Keep loader data warm for 5 minutes.
  staleTime: 5 * 60 * 1000,
  loader: async () => {
    const response = await fetch(
      `${URL}/v3/reference/tickers?market=stocks&active=true&order=asc&limit=${limit}&sort=ticker&apiKey=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Tickers request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Return first page of symbols and provider next-page URL.
    return {
      stocks: Array.isArray(data.results) ? data.results : [],
      nextUrl: data.next_url,
    };
  },
});

// Main dashboard page.
function Home() {
  // Initial route loader payload.
  const { stocks: initial, nextUrl: initialNextUrl } = Route.useLoaderData();
  // Ensure stocks defaults to an array.
  const initialStocks = Array.isArray(initial) ? initial : [];
  // Extract symbol list for initial cache lookups.
  const initialSymbols = initialStocks.map((stock) => stock.ticker);
  // Core page state.
  const [stocks, setStocks] = useState(initialStocks);
  // Price cache hydration on first render.
  const [priceMap, setPriceMap] = useState(() => getCachedPrices(initialSymbols, PRICE_CACHE_MAX_AGE_MS).cachedPrices);
  // Industry cache hydration on first render.
  const [industryMap, setIndustryMap] = useState(
    () => getCachedIndustries(initialSymbols, INDUSTRY_CACHE_MAX_AGE_MS).cachedIndustries
  );
  // Pagination/bookkeeping state.
  const [nextUrl, setNextUrl] = useState(initialNextUrl);
  const [urlHistory, setUrlHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  // Background refresh/loading flags.
  const [refreshingPrices, setRefreshingPrices] = useState(false);
  const [loadingIndustries, setLoadingIndustries] = useState(false);
  // UI filter state.
  const [typeFilter, setTypeFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Refresh price data whenever current page symbols change.
  useEffect(() => {
    const symbols = stocks.map((stock) => stock.ticker);

    if (!symbols.length) {
      setPriceMap({});
      setRefreshingPrices(false);
      return;
    }

    const { cachedPrices, symbolsToRefresh } = getCachedPrices(symbols, PRICE_CACHE_MAX_AGE_MS);
    // Merge known cached values immediately for fast paint.
    setPriceMap((prev) => ({ ...prev, ...cachedPrices }));

    if (!symbolsToRefresh.length) {
      setRefreshingPrices(false);
      return;
    }

    let cancelled = false;
    setRefreshingPrices(true);

    // Load fresh prices in the background and persist to cache.
    async function refreshPrices() {
      try {
        const freshPrices = await fetchBulkPrices(symbolsToRefresh);
        if (cancelled) return;

        setPriceMap((prev) => ({ ...prev, ...freshPrices }));
        storePrices(freshPrices);
      } catch (error) {
        console.error('Failed to refresh stock prices from bulk endpoints.', error);
      } finally {
        if (!cancelled) {
          setRefreshingPrices(false);
        }
      }
    }

    void refreshPrices();

    // Prevent late async updates after effect cleanup.
    return () => {
      cancelled = true;
    };
  }, [stocks]);

  // Refresh industry metadata whenever current page symbols change.
  useEffect(() => {
    const symbols = stocks.map((stock) => stock.ticker);

    if (!symbols.length) {
      setLoadingIndustries(false);
      return;
    }

    const { cachedIndustries, symbolsToRefresh } = getCachedIndustries(symbols, INDUSTRY_CACHE_MAX_AGE_MS);
    // Merge any cached industries immediately.
    setIndustryMap((prev) => ({ ...prev, ...cachedIndustries }));

    if (!symbolsToRefresh.length) {
      setLoadingIndustries(false);
      return;
    }

    let cancelled = false;
    setLoadingIndustries(true);

    // Fetch missing/stale industry labels and persist them.
    async function refreshIndustries() {
      try {
        const freshIndustries = await fetchIndustries(symbolsToRefresh);
        if (cancelled) return;

        setIndustryMap((prev) => ({ ...prev, ...freshIndustries }));
        storeIndustries(freshIndustries);
      } catch (error) {
        console.error('Failed to refresh ticker industries.', error);
      } finally {
        if (!cancelled) {
          setLoadingIndustries(false);
        }
      }
    }

    void refreshIndustries();

    // Prevent state updates if component unmounts mid-request.
    return () => {
      cancelled = true;
    };
  }, [stocks]);

  // Build distinct industry dropdown options from visible page stocks.
  const industryOptions = useMemo(() => {
    const labels = new Set();
    stocks.forEach((stock) => {
      labels.add(normalizeIndustry(industryMap[stock.ticker]));
    });
    return [...labels].sort((a, b) => a.localeCompare(b));
  }, [stocks, industryMap]);

  // Reset industry filter if current option no longer exists.
  useEffect(() => {
    if (industryFilter !== 'all' && !industryOptions.includes(industryFilter)) {
      setIndustryFilter('all');
    }
  }, [industryFilter, industryOptions]);

  // Apply type, industry, and search filters to current page stocks.
  const filteredStocks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return stocks.filter((stock) => {
      const matchesType = typeFilter === 'all' || normalizeTickerType(stock.type) === typeFilter;
      const matchesIndustry =
        industryFilter === 'all' || normalizeIndustry(industryMap[stock.ticker]) === industryFilter;
      const matchesSearch =
        !query ||
        stock.ticker?.toLowerCase().includes(query) ||
        stock.name?.toLowerCase().includes(query);

      return matchesType && matchesIndustry && matchesSearch;
    });
  }, [stocks, typeFilter, industryFilter, searchTerm, industryMap]);

  // Fetch one page from provider URL and update list/pagination cursor.
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

  // Navigate forward using provider's next URL.
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

  // Navigate backward by replaying stored pagination history.
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

  // Metric: count currently visible symbols that already have a numeric price.
  const visiblePriceCount = filteredStocks.filter((stock) => typeof priceMap?.[stock.ticker] === 'number').length;

  return (
    // Main dashboard layout container.
    <main className={styles.dashboardContainer}>
      {/* Header: title + quick stats. */}
      <header className={styles.header}>
        <div>
          <p className={styles.overline}>Market Overview</p>
          <h1 className={styles.title}>Active Stocks</h1>
          <p className={styles.subtitle}>
            Filter by type, filter by industry, and search symbols instantly on each page.
          </p>
        </div>
        <div className={styles.metrics}>
          <div className={styles.metricItem}>
            <span>Page Symbols</span>
            <strong>{stocks.length}</strong>
          </div>
          <div className={styles.metricItem}>
            <span>Showing</span>
            <strong>{filteredStocks.length}</strong>
          </div>
          <div className={styles.metricItem}>
            <span>With Price</span>
            <strong>{visiblePriceCount}</strong>
          </div>
          <div className={styles.metricItem}>
            <span>Price Sync</span>
            <strong>{refreshingPrices ? 'Live' : 'Cached'}</strong>
          </div>
        </div>
      </header>

      {/* Search + filter controls. */}
      <section className={styles.controlsPanel}>
        <div className={styles.searchBox}>
          <label htmlFor='ticker-search' className={styles.controlLabel}>
            Search
          </label>
          <input
            id='ticker-search'
            type='text'
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder='Search by ticker or company name'
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterRow}>
          {/* Type segment buttons. */}
          <div className={styles.typeFilters} role='group' aria-label='Filter by ticker type'>
            {TYPE_FILTERS.map((option) => (
              <button
                key={option.value}
                type='button'
                onClick={() => setTypeFilter(option.value)}
                className={`${styles.filterButton} ${
                  typeFilter === option.value ? styles.filterButtonActive : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Industry dropdown filter. */}
          <label className={styles.industryField}>
            <span className={styles.controlLabel}>Industry</span>
            <select
              value={industryFilter}
              onChange={(event) => setIndustryFilter(event.target.value)}
              className={styles.industrySelect}
            >
              <option value='all'>All industries</option>
              {industryOptions.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Async status for industry metadata loading. */}
        <p className={styles.filterSummary}>
          {loadingIndustries ? 'Updating industries...' : 'Industry data ready'}
        </p>
      </section>

      {/* Symbol cards (or empty state if filters remove all matches). */}
      <section className={styles.tickerContainer}>
        {filteredStocks.length === 0 ? (
          <article className={styles.emptyState}>
            <h2>No matching symbols</h2>
            <p>Try a different search term or change your type/industry filters.</p>
          </article>
        ) : (
          filteredStocks.map((ticker) => (
            <article key={ticker.ticker} className={styles.tickerCard}>
              <Link to='/ticker-profile/$symbol' params={{ symbol: ticker.ticker }} className={styles.tickerLink}>
                <div className={styles.tickerTop}>
                  <h2 className={styles.tickerSymbol}>{ticker.ticker}</h2>
                  <span className={styles.tickerPrice}>{formatPrice(priceMap?.[ticker.ticker])}</span>
                </div>
                <p className={styles.tickerName}>{ticker.name}</p>
                <div className={styles.tickerMeta}>
                  <span className={styles.typeBadge}>{tickerTypeLabel(ticker.type)}</span>
                  <span className={styles.industryBadge}>{normalizeIndustry(industryMap[ticker.ticker])}</span>
                </div>
                <span className={styles.tickerCta}>View details →</span>
              </Link>
            </article>
          ))
        )}
      </section>

      {/* Pagination controls for provider pages. */}
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
