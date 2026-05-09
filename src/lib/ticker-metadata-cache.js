const INDUSTRY_STORAGE_KEY = 'pulse:industry-cache:v1';
const UNKNOWN_INDUSTRY = 'Unknown';

function isBrowserStorageAvailable() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readIndustryCache() {
  if (!isBrowserStorageAvailable()) return {};

  const raw = window.localStorage.getItem(INDUSTRY_STORAGE_KEY);
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (error) {
    console.error('Failed to parse cached industries from local storage.', error);
    return {};
  }
}

export function normalizeIndustry(value) {
  if (typeof value !== 'string') return UNKNOWN_INDUSTRY;

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : UNKNOWN_INDUSTRY;
}

export function getCachedIndustries(symbols, maxAgeMs) {
  const cache = readIndustryCache();
  const now = Date.now();
  const cachedIndustries = {};
  const symbolsToRefresh = [];

  symbols.forEach((symbol) => {
    const entry = cache[symbol];
    const hasIndustry = typeof entry?.industry === 'string' && entry.industry.length > 0;
    const hasFreshIndustry = hasIndustry && now - entry.updatedAt <= maxAgeMs;

    if (hasIndustry) {
      cachedIndustries[symbol] = normalizeIndustry(entry.industry);
    }

    if (!hasFreshIndustry) {
      symbolsToRefresh.push(symbol);
    }
  });

  return { cachedIndustries, symbolsToRefresh };
}

export function storeIndustries(industryMap) {
  if (!isBrowserStorageAvailable()) return;

  const cache = readIndustryCache();
  const updatedAt = Date.now();
  const nextCache = { ...cache };

  Object.entries(industryMap).forEach(([symbol, industry]) => {
    const normalized = normalizeIndustry(industry);
    nextCache[symbol] = { industry: normalized, updatedAt };
  });

  window.localStorage.setItem(INDUSTRY_STORAGE_KEY, JSON.stringify(nextCache));
}
