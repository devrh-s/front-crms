import { clearQueryFilters } from '@/redux/slices/queryFilters';
import { IRootState } from '@/redux/store';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function useFilters<T>(page: string | false = false, defaultFilters = {}) {
  const [applyFilters, setApplyFilters] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<T>(defaultFilters as T);
  const queryFilters = useSelector((state: IRootState) => state.queryFilters);
  const dispatch = useDispatch();

  const handleSetFilters = (newFilters?: T) => {
    if (newFilters) {
      return setFilters(newFilters);
    }
  };

  const handleApplyFilters = () => {
    setApplyFilters((prev) => !prev);
  };

  const toggleFilters = (open: boolean) => () => setFiltersOpen(open);

  const isQueryFilterSet = useMemo(() => {
    if (page) {
      return !!queryFilters[page];
    }
  }, [queryFilters, page]);

  const isFiltersSet = useMemo(() => !!Object.keys(filters!)?.length, [filters]);

  useEffect(() => {
    if (isQueryFilterSet) {
      if (isFiltersSet) {
        handleApplyFilters();
        dispatch(clearQueryFilters());
      }
    }
  }, [isQueryFilterSet, isFiltersSet]);

  return {
    filtersOpen,
    filters,
    isQueryFilterSet,
    isFiltersSet,
    applyFilters,
    handleSetFilters,
    handleApplyFilters,
    toggleFilters,
  };
}
5;
