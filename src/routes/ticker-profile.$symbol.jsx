import { createFileRoute, useRouter } from '@tanstack/react-router';
import styles from '../styles/ticker-profile.module.css';

const URL = 'https://api.massive.com';
const API_KEY = '4jA3_qqxZqAX0gvE6qFzpKTeCh7vRxQw';

function formatCurrency(value) {
  return typeof value === 'number' ? `$${value.toLocaleString()}` : '—';
}

function formatNumber(value) {
  return typeof value === 'number' ? value.toLocaleString() : '—';
}

export const Route = createFileRoute('/ticker-profile/$symbol')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const [detailRes, priceRes, chartRes] = await Promise.all([
      fetch(`${URL}/v3/reference/tickers/${params.symbol}?apiKey=${API_KEY}`),
      fetch(`${URL}/v2/aggs/ticker/${params.symbol}/prev?apiKey=${API_KEY}`),
      fetch(`${URL}/v2/aggs/ticker/${params.symbol}/range/1/day/2024-01-01/2026-01-01?apiKey=${API_KEY}`),
    ]);
    const detail = await detailRes.json();
    const price = await priceRes.json();
    const chart = await chartRes.json();

    return {
      ticker: detail.results,
      quote: price.results?.[0] ?? null,
      candles: chart.results || [],
    };
  },
});

function SimpleChart({ data }) {
  if (!data.length) {
    return <p className={styles.emptyChart}>No chart data available.</p>;
  }

  const width = 900;
  const height = 280;
  const max = Math.max(...data.map((d) => d.close));
  const min = Math.min(...data.map((d) => d.close));
  const range = max - min || 1;

  const points = data
    .map((d, i) => {
      const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
      const y = height - ((d.close - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className={styles.chartFrame}>
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.chart}>
        <polyline fill='none' stroke='#00e09e' strokeWidth='3' points={points} />
      </svg>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <article className={styles.metricCard}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
    </article>
  );
}

function RouteComponent() {
  const { ticker = {}, quote = null, candles = [] } = Route.useLoaderData();
  const router = useRouter();

  const chartData = candles.map((c) => ({
    time: c.t,
    close: c.c,
  }));

  return (
    <main className={styles.page}>
      <button className={styles.back} onClick={() => router.history.back()}>
        ← Back
      </button>

      <header className={styles.headerCard}>
        <h1 className={styles.symbol}>{ticker?.ticker ?? '—'}</h1>
        <p className={styles.company}>{ticker?.name ?? 'Company data unavailable'}</p>
      </header>

      <section className={styles.chartCard}>
        <div className={styles.chartTop}>
          <p>Price Trend</p>
          <span>Daily close</span>
        </div>
        <SimpleChart data={chartData} />
      </section>

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
