import { useState, useCallback } from 'react';
import { GridSortModel, GridSortItem } from '@mui/x-data-grid';

const initialState: GridSortItem = { field: 'id', sort: 'asc' };

export default function useSort(initial?: GridSortItem) {
  const [sortOptions, setSortOptions] = useState<GridSortItem | null>(initial ?? initialState);

  const handleSortModelChange = useCallback((sortModel: GridSortModel) => {
    const [sortParams] = sortModel;
    setSortOptions(sortParams);
  }, []);

  const handleSubSort = useCallback((field: string) => {
    setSortOptions((prev) => {
      if (field === prev?.field && prev?.sort === 'desc') return null;
      return {
        field,
        sort: field === prev?.field && prev?.sort === 'asc' ? 'desc' : 'asc',
      };
    });
  }, []);

  const clearSort = () => {
    setSortOptions(initial ?? initialState);
  };
  return { sortOptions, clearSort, handleSubSort, handleSortModelChange };
}
