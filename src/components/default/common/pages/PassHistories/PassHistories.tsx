'use client';
import Date from '@/components/default/common/components/Date';
import Text from '@/components/default/common/components/Text';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import useFilters from '@/hooks/useFilters';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import { apiGetData } from '@/lib/fetch';
import { getAppSearchParams } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import { Stack, Theme, useMediaQuery } from '@mui/material';
import { GridColDef, GridRenderCellParams, GridTreeNodeWithRender } from '@mui/x-data-grid';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import PassHistoriesCards from './PassHistoriesCards';
import AccountUsersFilter from './PassHistoriesFilter';
import { IPassHistoryFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

interface IIPassHistories {
  url?: string;
}

export default function PassHistories({ url }: IIPassHistories) {
  const [view, setView] = useState('table');

  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IPassHistoryFilters>();
  const {
    paginationModel,
    rowCount,
    handleRowCount,
    handlePagination,
    checkPagination,
    defaultPagination,
  } = usePagination();
  const { searchValue, debouncedSearchValue, handleSearch, clearSearch } = useSearch();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);
  const { isFetching, isError, data } = useQuery({
    queryKey: [
      'pass-histories',
      { paginationModel, sortOptions, debouncedSearchValue, applyFilters },
    ],
    queryFn: async () => {
      if (checkPagination(paginationModel)) {
        return Promise.reject();
      }
      const searchParams = getAppSearchParams({
        paginationModel,
        sortOptions,
        debouncedSearchValue,
        filters,
      });
      dispatch(changeSearchParams(searchParams.toString()));
      const response = await apiGetData(`${url}?${searchParams}`);
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
      meta: {},
      fields: {},
      count_edits: 0,
      entity_block_id: null,
    };
  }, [data]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        ...config.datagrid.column,
      },
      {
        field: 'password',
        headerName: fields?.password ?? 'Password',
        disableColumnMenu: true,
        display: 'flex',
        description: 'password',
        flex: 1,
        valueFormatter: (params: any) => params ?? '',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value} />
        ),
      },
      {
        field: 'created_at',
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        disableColumnMenu: true,
        display: 'flex',
        flex: 1,
        valueFormatter: (params: any) => dayjs(params),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
      },
      {
        field: 'next_change_date',
        headerName: fields?.next_change_date ?? 'Next Change Date',
        description: 'Next Change Date',
        disableColumnMenu: true,
        display: 'flex',
        flex: 1,
        valueFormatter: (params: any) => dayjs(params),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
      },
    ],
    [fields]
  );

  const handleChangeView = (_: React.MouseEvent<HTMLElement>, newView: string) => {
    clearSearch();
    clearSort();
    defaultPagination();
    setView((prev) => newView ?? prev);
  };

  useEffect(() => {
    if (meta?.total) {
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
          <PassHistoriesCards
            rows={rows}
            toggleFilters={toggleFilters}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            searchValue={searchValue}
            handleSearch={handleSearch}
            view={view}
            handleChangeView={handleChangeView}
            isSmall
          />
        ) : (
          <CustomTable
            hideCheckboxes
            view={view}
            rows={rows}
            columns={columns}
            pageName='Pass Histories'
            loading={isFetching}
            rowCount={rowCount}
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <PassHistoriesCards
          rows={rows}
          toggleFilters={toggleFilters}
          paginationModel={paginationModel}
          handlePagination={handlePagination}
          searchValue={searchValue}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          handleSearch={handleSearch}
          view={view}
          handleChangeView={handleChangeView}
        />
      )}
      <AccountUsersFilter
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
    </Stack>
  );
}
