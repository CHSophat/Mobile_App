import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  reload: () => Promise<void>;
  setData: (next: T | null | ((prev: T | null) => T | null)) => void;
}

export interface UseApiOptions<T> {
  initialData?: T | null;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (err: unknown) => void;
}

const extractMessage = (err: unknown): string => {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  const anyErr = err as any;
  return (
    anyErr?.response?.data?.message ||
    anyErr?.message ||
    'Unknown error'
  );
};

/**
 * Generic async data hook with loading, refreshing, error, and refresh/reload.
 * `refresh` keeps the previous data on screen (good for pull-to-refresh).
 * `reload` clears data first (good for filter changes).
 */
export const useApi = <T>(
  fetcher: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
  options: UseApiOptions<T> = {}
): UseApiState<T> => {
  const { initialData = null, enabled = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(
    async (mode: 'initial' | 'refresh' | 'reload') => {
      if (!enabled) return;
      if (mode === 'refresh') setRefreshing(true);
      else if (mode === 'reload') {
        setData(null);
        setLoading(true);
      } else setLoading(true);
      setError(null);
      try {
        const result = await fetcherRef.current();
        if (!mountedRef.current) return;
        setData(result);
        onSuccess?.(result);
      } catch (err) {
        if (!mountedRef.current) return;
        setError(extractMessage(err));
        onError?.(err);
      } finally {
        if (!mountedRef.current) return;
        setLoading(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled]
  );

  useEffect(() => {
    run('initial');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    data,
    loading,
    refreshing,
    error,
    refresh: () => run('refresh'),
    reload: () => run('reload'),
    setData: (next) =>
      setData((prev) =>
        typeof next === 'function'
          ? (next as (p: T | null) => T | null)(prev)
          : next
      ),
  };
};
