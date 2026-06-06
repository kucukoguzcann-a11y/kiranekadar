type DataLayerEvent = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

export function pushDataLayerEvent(event: DataLayerEvent) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

export function sanitizeAnalyticsValue(
  value: string | number | null | undefined,
  fallback: string
) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : fallback;
  }

  if (value == null) {
    return fallback;
  }

  const normalized = value.toString().trim();

  if (!normalized || normalized.toLowerCase() === 'all') {
    return fallback;
  }

  return normalized;
}
