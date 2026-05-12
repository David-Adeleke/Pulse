const INDUSTRY_STORAGE_KEY = 'pulse:industry-cache:v1';
const UNKNOWN_INDUSTRY = 'Unknown';

// Guard localStorage access for browser-only usage.
function isBrowserStorageAvailable() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

// Read persisted industry cache from localStorage.
function readIndustryCache() {
  // Non-browser contexts cannot access localStorage.
  if (!isBrowserStorageAvailable()) return {};

  // Load serialized cache string.
  const raw = window.localStorage.getItem(INDUSTRY_STORAGE_KEY);
  // Empty cache fallback.
  if (!raw) return {};

  try {
    // Parse and validate cache object shape.
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (error) {
    // Recover from invalid stored data.
    console.error('Failed to parse cached industries from local storage.', error);
    return {};
  }
}

// Normalize an industry label so the UI always receives a non-empty string.
export function normalizeIndustry(value) {
  // Non-string values map to a stable fallback label.
  if (typeof value !== 'string') return UNKNOWN_INDUSTRY;

  // Trim whitespace and keep only non-empty values.
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : UNKNOWN_INDUSTRY;
}

// Split symbols into currently cached values and stale/missing values.
export function getCachedIndustries(symbols, maxAgeMs) {
  // Current cache snapshot/time baseline.
  const cache = readIndustryCache();
  const now = Date.now();
  // Return payload buckets.
  const cachedIndustries = {};
  const symbolsToRefresh = [];

  // Evaluate each requested symbol.
  symbols.forEach((symbol) => {
    // Pull entry and validate presence/freshness.
    const entry = cache[symbol];
    const hasIndustry = typeof entry?.industry === 'string' && entry.industry.length > 0;
    const hasFreshIndustry = hasIndustry && now - entry.updatedAt <= maxAgeMs;

    // Keep any known industry label for immediate display.
    if (hasIndustry) {
      cachedIndustries[symbol] = normalizeIndustry(entry.industry);
    }

    // Queue stale/missing symbols for API refresh.
    if (!hasFreshIndustry) {
      symbolsToRefresh.push(symbol);
    }
  });

  // Return both immediate cache values and refresh work.
  return { cachedIndustries, symbolsToRefresh };
}

// Persist refreshed industry labels to localStorage.
export function storeIndustries(industryMap) {
  // No-op in environments without localStorage.
  if (!isBrowserStorageAvailable()) return;

  // Clone existing cache and stamp updates with current time.
  const cache = readIndustryCache();
  const updatedAt = Date.now();
  const nextCache = { ...cache };

  // Normalize each label before storing.
  Object.entries(industryMap).forEach(([symbol, industry]) => {
    const normalized = normalizeIndustry(industry);
    nextCache[symbol] = { industry: normalized, updatedAt };
  });

  // Save merged cache snapshot.
  window.localStorage.setItem(INDUSTRY_STORAGE_KEY, JSON.stringify(nextCache));
}
