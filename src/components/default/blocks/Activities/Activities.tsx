'use client';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useFilters from '@/hooks/useFilters';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import { apiGetData, updateCommondData } from '@/lib/fetch';
import { getAppSearchParams } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import { Stack, Theme, useMediaQuery } from '@mui/material';
import { GridColDef, GridRenderCellParams, GridTreeNodeWithRender } from '@mui/x-data-grid';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import LinkItem from '../../common/components/CustomLink';
import Date from '../../common/components/Date';
import Note from '../../common/components/Note';
import Text from '../../common/components/Text';
import UserChip from '../../common/components/UserChip';
import ActivitiesCards from './ActivitiesCards';
import { commonDataBlocks, getCommonData } from './commonData';
import { IActivitiesFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const ActivitiesFilter = dynamic(() => import('./ActivitiesFilter'), {
  ssr: false,
});
const ActivitiesDescription = dynamic(() => import('./ActivitiesDescription'), {
  ssr: false,
});

interface IActivities {
  url?: string;
  fullScreen?: boolean;
}

const actions = [
  {
    id: 'READ',
    name: 'READ',
  },
  {
    id: 'CREATE',
    name: 'CREATE',
  },
  {
    id: 'UPDATE',
    name: 'UPDATE',
  },
  {
    id: 'DELETE',
    name: 'DELETE',
  },
];

export default function Activities({ url, fullScreen = true }: IActivities) {
  const [view, setView] = useState('table');
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { echo } = useContext(SocketContext);
  const [description, setDescription] = useState('');
  const { sortOptions, clearSort, handleSortModelChange } = useSort({
    field: 'timestamp',
    sort: 'desc',
  });
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IActivitiesFilters>();
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
  const queryClient = useQueryClient();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: [
      url ?? 'activities',
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
      const response = await apiGetData(
        url ? `${url}?${searchParams}` : `activities?${searchParams}`
      );
      return response;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
    queryKey: ['activities-common'],
    queryFn: async () => {
      const data = await getCommonData();
      return { ...data, actions };
    },
    refetchOnWindowFocus: false,
    placeholderData: {
      users: [],
      blocks: [],
      entities: [],
      actions,
    },
  });

  const changeDescription = (newDescription: string) => setDescription(newDescription);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        ...config.datagrid.column,
      },
      {
        field: 'user',
        headerName: fields?.user_id ?? 'User',
        description: 'User',
        display: 'flex',
        disableColumnMenu: true,
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <UserChip data={params.value} />
        ),
        width: 250,
      },
      {
        field: 'timestamp',
        headerName: fields?.timestamp ?? 'Timestamp',
        description: 'Timestamp',
        display: 'flex',
        disableColumnMenu: true,
        valueFormatter: (value: string) => dayjs(value).format('DD-MM-YY hh:mm'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} sx={{ justifyContent: 'center' }} />
        ),
        width: 250,
      },
      {
        field: 'url',
        headerName: fields?.url ?? 'URL',
        description: 'URL',
        display: 'flex',
        disableColumnMenu: true,
        width: 250,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          if (params?.value) {
            const label = params.value?.title.replace(/\/\d+$/, '');

            return <LinkItem link={`/${params.value?.id}`} label={label} />;
          }
          return null;
        },
      },
      {
        field: 'action',
        headerName: fields?.action ?? 'Action',
        description: 'Action',
        display: 'flex',
        disableColumnMenu: true,
        width: 250,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value} sx={{ justifyContent: 'center' }} />
        ),
      },
      {
        field: 'entityBlock',
        headerName: fields?.entity_block_id ?? 'Entity Block',
        disableColumnMenu: true,
        description: 'Entity Block',
        display: 'flex',
        sortable: false,
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value?.name} />
        ),
        width: 250,
      },
      {
        field: 'description',
        headerName: fields?.description ?? 'Description',
        description: 'Description',
        disableColumnMenu: true,
        type: 'actions',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Note value={params?.value} setNote={changeDescription} />
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
    if (echo) {
      echo
        .channel(`common-data`)
        .listen('CommonDataChanged', (data: { key: keyof typeof commonDataBlocks }) => {
          const { key } = data;
          const basicValue = commonDataBlocks[key];
          const commonDataReq = { [key]: basicValue };
          if (commonDataReq) {
            updateCommondData({
              name: 'activities-common',
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
    <Stack>
      {view === 'table' &&
        fullScreen &&
        (mdDown ? (
          <ActivitiesCards
            rows={rows}
            commonData={commonData}
            toggleFilters={toggleFilters}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            searchValue={searchValue}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            handleSearch={handleSearch}
            view={view}
            changeDescription={changeDescription}
            handleChangeView={handleChangeView}
            isSmall
          />
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            hideCheckboxes
            columns={columns}
            pageName='activities'
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
      {(view === 'cards' || !fullScreen) && (
        <ActivitiesCards
          rows={rows}
          loading={isFetching}
          commonData={commonData}
          toggleFilters={toggleFilters}
          searchValue={searchValue}
          paginationModel={paginationModel}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          handlePagination={handlePagination}
          handleSearch={handleSearch}
          changeDescription={changeDescription}
          view={view}
          handleChangeView={handleChangeView}
          fullScreen={fullScreen}
        />
      )}
      <ActivitiesFilter
        rows={rows}
        commonData={commonData}
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
        closeAfterApply
      />
      <ActivitiesDescription json={description} handleClose={() => setDescription('')} />
    </Stack>
  );
}
