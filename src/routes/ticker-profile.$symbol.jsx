import { createFileRoute, useRouter } from '@tanstack/react-router';
import styles from '../styles/ticker-profile.module.css';

// Base API origin.
const URL = 'https://api.massive.com';
// API key used for upstream requests.
const API_KEY = '4jA3_qqxZqAX0gvE6qFzpKTeCh7vRxQw';

// Format monetary values for display.
function formatCurrency(value) {
  return typeof value === 'number' ? `$${value.toLocaleString()}` : '—';
}

// Format plain numeric values (for volume, counts, etc.).
function formatNumber(value) {
  return typeof value === 'number' ? value.toLocaleString() : '—';
}

// Dynamic ticker profile route.
export const Route = createFileRoute('/ticker-profile/$symbol')({
  component: RouteComponent,
  // Loader fetches profile, previous close quote, and chart candles in parallel.
  loader: async ({ params }) => {
    // Fire three API calls at the same time for faster page load.
    const [detailRes, priceRes, chartRes] = await Promise.all([
      fetch(`${URL}/v3/reference/tickers/${params.symbol}?apiKey=${API_KEY}`),
      fetch(`${URL}/v2/aggs/ticker/${params.symbol}/prev?apiKey=${API_KEY}`),
      fetch(`${URL}/v2/aggs/ticker/${params.symbol}/range/1/day/2024-01-01/2026-01-01?apiKey=${API_KEY}`),
    ]);
    // Decode all response bodies.
    const detail = await detailRes.json();
    const price = await priceRes.json();
    const chart = await chartRes.json();

    // Return normalized data consumed by the route component.
    return {
      ticker: detail.results,
      quote: price.results?.[0] ?? null,
      candles: chart.results || [],
    };
  },
});

// Lightweight SVG line chart renderer for closing prices.
function SimpleChart({ data }) {
  // Render an empty state if there are no candles.
  if (!data.length) {
    return <p className={styles.emptyChart}>No chart data available.</p>;
  }

  // SVG canvas dimensions.
  const width = 900;
  const height = 280;
  // Determine vertical scale from min/max close values.
  const max = Math.max(...data.map((d) => d.close));
  const min = Math.min(...data.map((d) => d.close));
  const range = max - min || 1;

  // Convert each close point into SVG x,y coordinates.
  const points = data
    .map((d, i) => {
      // Spread points evenly along the x-axis.
      const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
      // Invert y-axis so higher prices draw upward.
      const y = height - ((d.close - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    // Framed chart area.
    <div className={styles.chartFrame}>
      {/* SVG polyline draws the trend line. */}
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.chart}>
        <polyline fill='none' stroke='#00e09e' strokeWidth='3' points={points} />
      </svg>
    </div>
  );
}

// Small reusable card for one key metric.
function Metric({ label, value }) {
  return (
    <article className={styles.metricCard}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
    </article>
  );
}

// Main ticker profile page component.
function RouteComponent() {
  // Pull normalized loader data with safe defaults.
  const { ticker = {}, quote = null, candles = [] } = Route.useLoaderData();
  // Router instance used for browser-style back navigation.
  const router = useRouter();

  // Shape candle list for chart component consumption.
  const chartData = candles.map((c) => ({
    time: c.t,
    close: c.c,
  }));

  return (
    // Page container.
    <main className={styles.page}>
      {/* Navigate back to the previous history entry. */}
      <button className={styles.back} onClick={() => router.history.back()}>
        ← Back
      </button>

      {/* Header with ticker symbol + company name. */}
      <header className={styles.headerCard}>
        <h1 className={styles.symbol}>{ticker?.ticker ?? '—'}</h1>
        <p className={styles.company}>{ticker?.name ?? 'Company data unavailable'}</p>
      </header>

      {/* Price trend chart section. */}
      <section className={styles.chartCard}>
        <div className={styles.chartTop}>
          <p>Price Trend</p>
        </div>
        <SimpleChart data={chartData} />
      </section>

      {/* Snapshot metric cards. */}
      <section className={styles.metricsGrid}>
        <Metric label='Close Price' value={formatCurrency(quote?.c)} />
        <Metric label='Open Price' value={formatCurrency(quote?.o)} />
        <Metric label='Day High' value={formatCurrency(quote?.h)} />
        <Metric label='Day Low' value={formatCurrency(quote?.l)} />
        <Metric label='Market Cap' value={formatCurrency(ticker?.market_cap)} />
        <Metric label='Volume' value={formatNumber(quote?.v)} />
      </section>
    </main>
  );
}
