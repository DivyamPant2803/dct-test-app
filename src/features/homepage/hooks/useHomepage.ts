import { useQuery } from '@tanstack/react-query';
import { useHostRoles, useGetAccessToken } from '../../../host-integration/HostContext';
import { getHomepage } from '../../../api/homepageApi';
import { HomepageResponse } from '../../../shared/types';

export function useHomepage(roleOverride?: string): {
  data: HomepageResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const roles = useHostRoles();
  const getToken = useGetAccessToken();

  const query = useQuery<HomepageResponse, Error>({
    queryKey: ['homepage', roles.join(','), roleOverride ?? ''],
    queryFn: () => getHomepage(roles, getToken, roleOverride),
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 2,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
