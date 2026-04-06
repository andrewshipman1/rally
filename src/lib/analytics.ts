interface AnalyticsEvent {
  event: string;
  tripId?: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export function track(event: string, properties?: { tripId?: string; userId?: string; metadata?: Record<string, unknown> }) {
  const payload: AnalyticsEvent = {
    event,
    tripId: properties?.tripId,
    userId: properties?.userId,
    timestamp: new Date().toISOString(),
    metadata: properties?.metadata,
  };
  console.log('[Rally Analytics]', JSON.stringify(payload));
}
