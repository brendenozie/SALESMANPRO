import { usePOSOfflineContext, type POSOfflineContextValue } from '@/contexts/POSOfflineContext';

/**
 * usePOSOffline Hook
 *
 * Provides category POS interfaces (StorePOS, ServicePOS, FitnessPOS)
 * direct access to offline operations, connectivity telemetry, and local catalog search.
 */
export function usePOSOffline(): POSOfflineContextValue {
  return usePOSOfflineContext();
}

export default usePOSOffline;
