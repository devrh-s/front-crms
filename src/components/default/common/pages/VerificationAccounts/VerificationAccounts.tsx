'use client';
import Status from '@/components/default/common/components/Status';
import Text from '@/components/default/common/components/Text';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import useFilters from '@/hooks/useFilters';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import { apiCommonData, apiGetData } from '@/lib/fetch';
import { getAppSearchParams } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import { Stack, Theme, useMediaQuery } from '@mui/material';
import { GridColDef, GridRenderCellParams, GridTreeNodeWithRender } from '@mui/x-data-grid';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import UserChip from '../../components/UserChip';
import { IVerificationAccountFilters } from './types';
import VerificationAccountsCards from './VerificationAccountsCards';
import VerificationAccountsFilter from './VerificationAccountsFilter';
import { useGuidesStore } from '@/zustand/guidesStore';

interface IVerificationAccounts {
  url?: string;
}

const commonDataBlocks = {
  statuses: 'statuses?perPage=-1&isShort=1&isCommon=1',
  users: 'users?perPage=-1&isShort=1&isCommon=1',
  tools: 'tools?perPage=-1&isShort=1&isCommon=1',
};

const getCommonData = () => apiCommonData(commonDataBlocks);

export default function VerificationAccounts({ url }: IVerificationAccounts) {
  const [view, setView] = useState('table');
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IVerificationAccountFilters>();
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
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { isFetching, isError, data } = useQuery({
    queryKey: [
      'verification-accounts',
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

  const { data: commonData } = useQuery({
    queryKey: ['verification-accounts-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      statuses: [],
      tools: [],
      users: [],
    },
  });

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        ...config.datagrid.column,
      },
      {
        field: 'login',
        headerName: fields?.login ?? 'Login',
        disableColumnMenu: true,
        description: 'Job Account Login',
        display: 'flex',
        flex: 1,
        valueGetter: (params: any) => params?.row?.login,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return <Text text={params?.row?.login} />;
        },
      },
      {
        field: 'status',
        headerName: fields?.status_id ?? 'Status',
        disableColumnMenu: true,
        description: 'Status',
        display: 'flex',
        flex: 1,
        valueGetter: (params: any, row: any) => row?.status?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) =>
          params?.row?.status ? (
            <Status name={params?.row?.status?.name} color={params?.row?.status?.color} />
          ) : (
            ''
          ),
      },
      {
        field: 'tool',
        headerName: fields?.tool_id ?? 'Tool',
        disableColumnMenu: true,
        description: 'Tool',
        display: 'flex',
        flex: 1,
        valueGetter: (params: any, row: any) => row?.tool?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.row?.tool?.name} />
        ),
      },
      {
        field: 'owner',
        headerName: fields?.owner_id ?? 'Owner',
        disableColumnMenu: true,
        description: 'Owner',
        display: 'flex',
        flex: 1,
        valueGetter: (params: any, row: any) => row?.owner?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <UserChip data={params?.row?.owner} />
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
          <VerificationAccountsCards
            rows={rows}
            toggleFilters={toggleFilters}
            paginationModel={paginationModel}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            handlePagination={handlePagination}
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
            pageName='Verification Accounts'
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
        <VerificationAccountsCards
          rows={rows}
          toggleFilters={toggleFilters}
          paginationModel={paginationModel}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          handlePagination={handlePagination}
          searchValue={searchValue}
          handleSearch={handleSearch}
          view={view}
          handleChangeView={handleChangeView}
        />
      )}
      <VerificationAccountsFilter
        commonData={commonData}
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
    </Stack>
  );
}
