import { useQuery } from '@tanstack/react-query';
import { useGetAccessToken } from '../../../host-integration/HostContext';
import { batchCardData } from '../../../api/homepageApi';
import { CardDataResult } from '../../../shared/types';

interface UseCardDataResult {
  data: CardDataResult | undefined;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Hook for data cards (Metric, Chart, ActivityFeed).
 * Multiple cards on the same page are batched automatically because
 * TanStack Query deduplicates simultaneous requests for the same query key.
 *
 * Assumptions: batching is done by passing a single-element array; in a
 * production implementation a request-deduplication layer (e.g. DataLoader)
 * could batch all card IDs from one render cycle into a single POST.
 */
export function useCardData(cardId: string): UseCardDataResult {
  const getToken = useGetAccessToken();

  const query = useQuery<Record<string, CardDataResult>, Error>({
    queryKey: ['card-data', cardId],
    queryFn: async () => {
      const response = await batchCardData({ cardIds: [cardId] }, getToken);
      return response.results;
    },
    staleTime: 30_000,
    retry: 1,
  });

  return {
    data: query.data?.[cardId],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
