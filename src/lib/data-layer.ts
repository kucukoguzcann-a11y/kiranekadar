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
