'use client';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import usePagination from '@/hooks/usePagination';
import { apiGetData } from '@/lib/fetch';
import { Stack, Theme, useMediaQuery } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import TablesCards from './TablesCards';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import { getAppSearchParams } from '@/lib/helpers';
import { useDispatch } from 'react-redux';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import { setEditsData } from '@/redux/slices/editsSlice';
import { useGuidesStore } from '@/zustand/guidesStore';

export default function SalaryTypes() {
  const [view, setView] = useState('table');
  const [cardsStorageActive, setCardsStorageActive] = useState(false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const { paginationModel, rowCount, handleRowCount, handlePagination } = usePagination();
  const { searchValue, debouncedSearchValue, handleSearch, clearSearch } = useSearch();
  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: ['tables-information', { sortOptions, debouncedSearchValue }],
    queryFn: async () => {
      const searchParams = getAppSearchParams({
        sortOptions,
        debouncedSearchValue,
      });
      dispatch(changeSearchParams(searchParams.toString()));
      const response = await apiGetData(`tables-information?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const {
    data: rows,
    meta,
    fields,
    count_edits: countEdits,
    entity_block_id: entityBlockId,
  } = useMemo(() => {
    if (data) return data;
    return {
      data: [],
    };
  }, [data]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'table_name',
        headerName: fields?.table_name ?? 'Name',
        disableColumnMenu: true,
        description: 'Name',
        minWidth: 250,
        flex: 2,
      },
      {
        field: 'rows_count',
        headerName: fields?.rows_count ?? 'Rows Count',
        disableColumnMenu: true,
        description: 'Rows Count',
        minWidth: 250,
        flex: 2,
      },
      {
        field: 'size_mb',
        headerName: fields?.size_mb ?? 'Size MB',
        disableColumnMenu: true,
        description: 'Size MB',
        minWidth: 250,
        flex: 2,
      },
      {
        field: 'last_id',
        headerName: fields?.last_id ?? 'Last id',
        disableColumnMenu: true,
        description: 'Last id',
        minWidth: 250,
        flex: 2,
      },
      {
        field: 'type_id',
        headerName: fields?.type_id ?? 'Type id',
        disableColumnMenu: true,
        description: 'Type id',
        minWidth: 250,
        flex: 2,
      },
    ],
    [fields]
  );

  const handleChangeView = (_: React.MouseEvent<HTMLElement>, newView: string) => {
    setView((prev) => newView ?? prev);
  };

  useEffect(() => {
    if (meta?.total) {
      const newPaginationModel = {
        pageSize: 1,
        page: 0,
      };
      handlePagination(newPaginationModel);
      handleRowCount(meta?.total);
    }
    if (entityBlockId) {
      dispatch(
        setEditsData({
          countEdits,
          entityBlockId,
        })
      );
      setGuidesData({ entityBlockId });
    }
  }, [meta, countEdits, entityBlockId]);

  return (
    <Stack gap='2rem'>
      {view === 'table' &&
        (mdDown ? (
          <TablesCards
            view={view}
            rows={rows}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            handleChangeView={handleChangeView}
            searchValue={searchValue}
            handleSearch={handleSearch}
          />
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            columns={columns}
            pageName='Tables information'
            loading={isFetching}
            paginationModel={paginationModel}
            searchValue={searchValue}
            handleSortModelChange={handleSortModelChange}
            handleSearch={handleSearch}
            rowCount={rowCount}
            handleChangeView={handleChangeView}
            rowHeight={config.datagrid.rowHeight}
            isAllSelectable={false}
            hideToolbarFilters
            hideCheckboxes
            availableExport
          />
        ))}
      {view === 'cards' && (
        <TablesCards
          view={view}
          rows={rows}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          handleChangeView={handleChangeView}
          searchValue={searchValue}
          handleSearch={handleSearch}
        />
      )}
    </Stack>
  );
}
