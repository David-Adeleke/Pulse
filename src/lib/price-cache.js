const STORAGE_KEY = 'pulse:price-cache:v1';

// Check whether localStorage can be used in the current runtime.
function isBrowserStorageAvailable() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

// Read persisted price cache from localStorage.
// Returns an object shaped like: { [symbol]: { price, updatedAt } }.
function readCache() {
  // Server-side rendering or non-browser runtimes cannot read localStorage.
  if (!isBrowserStorageAvailable()) return {};

  // Load serialized cache content.
  const raw = window.localStorage.getItem(STORAGE_KEY);
  // If nothing is stored, return an empty cache object.
  if (!raw) return {};

  try {
    // Parse JSON and ensure it is an object before returning.
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (error) {
    // Log malformed cache payloads and recover gracefully.
    console.error('Failed to parse cached prices from local storage.', error);
    return {};
  }
}

// Build two buckets:
// 1) cachedPrices: any numeric prices currently found in cache.
// 2) symbolsToRefresh: symbols with missing/stale entries.
export function getCachedPrices(symbols, maxAgeMs) {
  // Current cache snapshot and current time for freshness checks.
  const cache = readCache();
  const now = Date.now();
  // Output objects accumulated below.
  const cachedPrices = {};
  const symbolsToRefresh = [];

  // Evaluate each requested symbol.
  symbols.forEach((symbol) => {
    // Look up entry and check shape/freshness.
    const entry = cache[symbol];
    const isValidPrice = typeof entry?.price === 'number';
    const hasFreshPrice = isValidPrice && now - entry.updatedAt <= maxAgeMs;

    // Always expose valid cached prices (even if stale) for immediate UI fallback.
    if (isValidPrice) {
      cachedPrices[symbol] = entry.price;
    }

    // Schedule missing/stale symbols for background refresh.
    if (!hasFreshPrice) {
      symbolsToRefresh.push(symbol);
    }
  });

  // Return both immediate values and refresh worklist.
  return { cachedPrices, symbolsToRefresh };
}

// Merge new prices into the cache and persist them with a shared timestamp.
export function storePrices(priceMap) {
  // Skip storage when localStorage is unavailable.
  if (!isBrowserStorageAvailable()) return;

  // Read existing cache, then create a mutable clone.
  const cache = readCache();
  const updatedAt = Date.now();
  const nextCache = { ...cache };

  // Add/update each numeric price entry.
  Object.entries(priceMap).forEach(([symbol, price]) => {
    if (typeof price === 'number') {
      nextCache[symbol] = { price, updatedAt };
    }
  });

  // Persist merged cache snapshot.
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCache));
}
