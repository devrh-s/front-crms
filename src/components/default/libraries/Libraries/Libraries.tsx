'use client';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useFilters from '@/hooks/useFilters';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import { apiGetData, updateCommondData } from '@/lib/fetch';
import { getAppSearchParams, getCommonDataReq } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import { Stack, Theme, useMediaQuery } from '@mui/material';
import { GridColDef, GridRenderCellParams, GridTreeNodeWithRender } from '@mui/x-data-grid';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Date from '../../common/components/Date';
import Priority from '../../common/components/Priority';
import Status from '../../common/components/Status';
import Translation from '../../common/components/Translation';
import UserChip from '../../common/components/UserChip';
import { commonDataBlocks, getCommonData } from './commonData';
import LibrariesCards from './LibrariesCards';
import { ILibrariesFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const LibrariesFilter = dynamic(() => import('./LibrariesFilter'), {
  ssr: false,
});

export default function Libraries() {
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const { echo } = useContext(SocketContext);
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<ILibrariesFilters>(false);
  const {
    paginationModel,
    rowCount,
    handleRowCount,
    handlePagination,
    checkPagination,
    defaultPagination,
  } = usePagination();
  const { searchValue, debouncedSearchValue, handleSearch, clearSearch } = useSearch();
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);
  const { isFetching, isError, data } = useQuery({
    queryKey: ['libraries', { paginationModel, sortOptions, debouncedSearchValue, applyFilters }],
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
      const response = await apiGetData(`libraries?${searchParams}`);
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
    queryKey: ['libraries-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      entities: [],
      languages: [],
      priorities: [],
      groups: [],
      statuses: [],
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
        field: 'name',
        headerName: fields?.name ?? 'Name',
        disableColumnMenu: true,
        description: 'Name',
        width: 250,
      },
      {
        field: 'priority',
        headerName: fields?.priority_id ?? 'Priority',
        description: 'Priority',
        disableColumnMenu: true,
        display: 'flex',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Priority priority={params?.value?.name} />
        ),
        width: 150,
      },
      {
        field: 'library',
        disableColumnMenu: true,
        headerName: fields?.library_id ?? 'Group',
        description: 'Group',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) =>
          params?.value?.name,
        width: 200,
      },
      {
        field: 'entity',
        disableColumnMenu: true,
        headerName: fields?.entity_id ?? 'Entity',
        description: 'Entity',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) =>
          params?.value?.name,
        width: 200,
      },
      {
        field: 'status',
        disableColumnMenu: true,
        headerName: fields?.status_id ?? 'Status',
        description: 'Status',
        width: 200,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Status name={params?.value?.name} color={params?.value?.color} />
        ),
      },
      {
        field: 'translation',
        disableColumnMenu: true,
        headerName: fields?.translation_id ?? 'Translation',
        description: 'Translation',
        display: 'flex',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Translation text={params?.value?.iso2} />
        ),
        width: 150,
      },
      {
        field: 'created_at',
        disableColumnMenu: true,
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        display: 'flex',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
        width: 200,
      },
      {
        field: 'created_by',
        disableColumnMenu: true,
        headerName: fields?.created_by ?? 'Created By',
        description: 'Created By',
        minWidth: 120,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <UserChip data={params.value} /> : null;
        },
        width: 200,
      },
    ],
    [fields]
  );

  const handleChangeView = (_: React.MouseEvent<HTMLElement>, newView: string) => {
    clearSearch();
    clearSort();
  };

  useEffect(() => {
    if (echo) {
      echo.channel(`common-data`).listen('CommonDataChanged', (data: any) => {
        const { key } = data;
        const commonDataReq = getCommonDataReq(key, commonDataBlocks);
        if (commonDataReq) {
          updateCommondData({
            name: 'libraries-common',
            commonDataReq,
            queryClient,
          });
        }
      });
    }
    return () => echo?.leave(`common-data`);
  }, [echo]);

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
      {mdDown ? (
        <LibrariesCards
          rows={rows}
          toggleFilters={toggleFilters}
          paginationModel={paginationModel}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          handlePagination={handlePagination}
          searchValue={searchValue}
          handleSearch={handleSearch}
          handleChangeView={handleChangeView}
        />
      ) : (
        <CustomTable
          rows={rows}
          columns={columns}
          pageName='libraries'
          hideCheckboxes
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
          // colHeaderHeight={100}
          hideToolbarViewToggle
          // styles={{
          //   "& .MuiDataGrid-columnHeaderTitleContainerContent": {
          //     justifyContent: "center",
          //     flexGrow: 1,
          //     height: "100px",
          //   },
          //   "& .MuiDataGrid-columnHeader": {
          //     padding: 0,
          //   },
          //   "& .MuiDataGrid-cell": {
          //     padding: 0,
          //   },
          // }}
        />
      )}
      <LibrariesFilter
        rows={rows}
        commonData={commonData}
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
    </Stack>
  );
}
