import { useCallback, useEffect, useRef, useState } from 'react';

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}

export interface UsePaginatedListState<T> {
  items: T[];
  page: number;
  hasMore: boolean;
  totalCount: number;
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  setItems: (next: T[] | ((prev: T[]) => T[])) => void;
  reset: () => void;
}

export interface UsePaginatedListOptions {
  pageSize?: number;
  enabled?: boolean;
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
 * Paginated list state for endpoints that return PageResult<T>.
 * Drop into FlatList via `onRefresh`, `onEndReached`, `refreshing`, and
 * `ListFooterComponent` for the loading-more indicator.
 *
 * The `deps` array re-runs the initial load when it changes (e.g. filter).
 */
export const usePaginatedList = <T>(
  fetcher: (args: { page: number; pageSize: number }) => Promise<PageResult<T>>,
  deps: ReadonlyArray<unknown> = [],
  options: UsePaginatedListOptions = {}
): UsePaginatedListState<T> => {
  const { pageSize = 20, enabled = true } = options;
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const inflightRef = useRef(false);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(
    async (mode: 'initial' | 'refresh' | 'more') => {
      if (!enabled) return;
      if (inflightRef.current) return;
      if (mode === 'more' && !hasMore) return;
      inflightRef.current = true;
      const nextPage = mode === 'more' ? page + 1 : 1;
      if (mode === 'refresh') setRefreshing(true);
      else if (mode === 'more') setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const result = await fetcherRef.current({ page: nextPage, pageSize });
        if (!mountedRef.current) return;
        setItems((prev) =>
          mode === 'more' ? [...prev, ...result.items] : result.items
        );
        setPage(result.page);
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);
      } catch (err) {
        if (!mountedRef.current) return;
        setError(extractMessage(err));
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
        inflightRef.current = false;
      }
    },
    [enabled, hasMore, page, pageSize]
  );

  useEffect(() => {
    load('initial');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    items,
    page,
    hasMore,
    totalCount,
    loading,
    loadingMore,
    refreshing,
    error,
    refresh: () => load('refresh'),
    loadMore: () => load('more'),
    setItems: (next) =>
      setItems((prev) =>
        typeof next === 'function' ? (next as (p: T[]) => T[])(prev) : next
      ),
    reset: () => {
      setItems([]);
      setPage(1);
      setHasMore(true);
      setTotalCount(0);
      setError(null);
    },
  };
};
