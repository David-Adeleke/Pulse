const STORAGE_KEY = 'pulse:price-cache:v1';

function isBrowserStorageAvailable() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readCache() {
  if (!isBrowserStorageAvailable()) return {};

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (error) {
    console.error('Failed to parse cached prices from local storage.', error);
    return {};
  }
}

export function getCachedPrices(symbols, maxAgeMs) {
  const cache = readCache();
  const now = Date.now();
  const cachedPrices = {};
  const symbolsToRefresh = [];

  symbols.forEach((symbol) => {
    const entry = cache[symbol];
    const isValidPrice = typeof entry?.price === 'number';
    const hasFreshPrice = isValidPrice && now - entry.updatedAt <= maxAgeMs;

    if (isValidPrice) {
      cachedPrices[symbol] = entry.price;
    }

    if (!hasFreshPrice) {
      symbolsToRefresh.push(symbol);
    }
  });

  return { cachedPrices, symbolsToRefresh };
}

export function storePrices(priceMap) {
  if (!isBrowserStorageAvailable()) return;

  const cache = readCache();
  const updatedAt = Date.now();
  const nextCache = { ...cache };

  Object.entries(priceMap).forEach(([symbol, price]) => {
    if (typeof price === 'number') {
      nextCache[symbol] = { price, updatedAt };
    }
  });

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCache));
}
