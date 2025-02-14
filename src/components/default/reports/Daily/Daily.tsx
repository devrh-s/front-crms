'use client';
import SubSortBtn from '@/components/default/common/components/SubSortBtn';
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
import { Stack, Theme, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { GridRenderCellParams, GridTreeNodeWithRender } from '@mui/x-data-grid';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import CustomChip from '../../common/components/CustomChip';
import DailyCards from './DailyCards';
import { commonDataBlocks, getCommonData } from './commonData';
import { IDailyFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const DailyFilter = dynamic(() => import('./DailyFilter'), {
  ssr: false,
});

const actions = [
  {
    id: 'ALL',
    name: 'ALL',
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
    id: 'TOTAL',
    name: 'TOTAL',
  },
];

export default function Daily() {
  const [view, setView] = useState('table');
  const { echo } = useContext(SocketContext);
  const [dynamicColNames, setDynamicColNames] = useState<string[]>([]);
  const { sortOptions, clearSort, handleSubSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IDailyFilters>(false, {
    createdAt: {
      start: dayjs().startOf('month'),
      end: dayjs().endOf('month'),
      data: {
        start: dayjs().startOf('month').format('DD-MM-YYYY'),
        end: dayjs().endOf('month').format('DD-MM-YYYY'),
      },
      mode: 'standard',
    },
  });
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

  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);

  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: [
      'report-daily',
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
      const response = await apiGetData(`reports/users?${searchParams}`);
      setDynamicColNames([...response.month, 'total']);
      return {
        ...response,
        data: [
          ...response.data,
          {
            id: 'total',
            country: { name: 'Total', iso2: 'DF' },
            ...response.total,
          },
        ],
      };
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
    queryKey: ['report-daily-common'],
    queryFn: async () => {
      const data = await getCommonData();
      return { ...data, actions };
    },
    refetchOnWindowFocus: false,
    placeholderData: {
      users: [],
      actions,
    },
  });

  const columns: any[] = useMemo(() => {
    const cols = [
      {
        field: 'id',
        headerName: '#',
        disableColumnMenu: true,
        width: 50,
        align: 'center',
        colSpan: (_: any, row: any) => {
          if (row.id === 'total') {
            return 2;
          }
          return undefined;
        },
        renderCell: ({
          formattedValue,
        }: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return (
            <Stack
              flexDirection='row'
              justifyContent='center'
              alignItems='center'
              gap='.5rem'
              sx={{
                textTransform: 'capitalize',
              }}
            >
              {formattedValue}
            </Stack>
          );
        },
        flex: 1,
      },
      {
        field: 'user',
        headerName: fields?.name_id ?? 'Name',
        disableColumnMenu: true,
        description: 'Name',
        minWidth: 250,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <CustomChip
            label={params.value?.name}
            data={
              {
                name: params.value?.name,
                image: params.value?.image ?? '/images/question_mark.svg',
              } as any
            }
          />
        ),
        flex: 2,
      },
    ];
    const dCols = dynamicColNames.map((colName) => ({
      field: colName,
      sortable: false,
      disableColumnMenu: true,
      description: `Date ${colName}`,
      minWidth: 360,
      renderHeader: () => {
        return (
          <Stack sx={{ flexGrow: 1, height: 'inherit', fontWeight: 500 }}>
            <Stack
              alignItems='center'
              justifyContent='center'
              sx={{
                textTransform: 'capitalize',
                borderBottom: '1px solid rgba(224, 224, 224, .4)',
                height: '60%',
              }}
            >
              {colName !== 'total' ? dayjs(colName).format('DD-MM-YY') : colName}
            </Stack>
            <Stack flexDirection='row' sx={{ height: '40%' }}>
              <Tooltip title='Job Sites' placement='top'>
                <Stack
                  alignItems='center'
                  justifyContent='center'
                  flexDirection='row'
                  gap='.5rem'
                  sx={{
                    width: 'calc(100% / 6)',
                    borderRight: '1px solid rgba(224, 224, 224, .4)',
                    '&:hover button': {
                      display: 'block',
                    },
                  }}
                >
                  <Typography>JS</Typography>
                  <SubSortBtn
                    field={`${colName}$js`}
                    sortOptions={sortOptions}
                    handleSubSort={handleSubSort}
                  />
                </Stack>
              </Tooltip>
              <Tooltip title='Job Accounts' placement='top'>
                <Stack
                  alignItems='center'
                  justifyContent='center'
                  flexDirection='row'
                  gap='.5rem'
                  sx={{
                    width: 'calc(100% / 6)',
                    borderRight: '1px solid rgba(224, 224, 224, .4)',
                    '&:hover button': {
                      display: 'block',
                    },
                  }}
                >
                  <Typography>JAC</Typography>
                  <SubSortBtn
                    field={`${colName}$jac`}
                    sortOptions={sortOptions}
                    handleSubSort={handleSubSort}
                  />
                </Stack>
              </Tooltip>
              <Tooltip title='Job Templates' placement='top'>
                <Stack
                  alignItems='center'
                  justifyContent='center'
                  flexDirection='row'
                  gap='.5rem'
                  sx={{
                    width: 'calc(100% / 6)',
                    borderRight: '1px solid rgba(224, 224, 224, .4)',
                    '&:hover button': {
                      display: 'block',
                    },
                  }}
                >
                  <Typography>JT</Typography>
                  <SubSortBtn
                    field={`${colName}$jt`}
                    sortOptions={sortOptions}
                    handleSubSort={handleSubSort}
                  />
                </Stack>
              </Tooltip>
              <Tooltip title='Job Applications' placement='top'>
                <Stack
                  alignItems='center'
                  justifyContent='center'
                  flexDirection='row'
                  gap='.5rem'
                  sx={{
                    width: 'calc(100% / 6)',
                    borderRight: '1px solid rgba(224, 224, 224, .4)',
                    '&:hover button': {
                      display: 'block',
                    },
                  }}
                >
                  <Typography>JA</Typography>
                  <SubSortBtn
                    field={`${colName}$ja`}
                    sortOptions={sortOptions}
                    handleSubSort={handleSubSort}
                  />
                </Stack>
              </Tooltip>
              <Tooltip title='Job Posts' placement='top'>
                <Stack
                  alignItems='center'
                  justifyContent='center'
                  flexDirection='row'
                  gap='.5rem'
                  sx={{
                    width: 'calc(100% / 6)',
                    borderRight: '1px solid transparent',
                    '&:hover button': {
                      display: 'block',
                    },
                  }}
                >
                  <Typography>JP</Typography>
                  <SubSortBtn
                    field={`${colName}$jp`}
                    sortOptions={sortOptions}
                    handleSubSort={handleSubSort}
                  />
                </Stack>
              </Tooltip>
              <Tooltip title='Job Requests' placement='top'>
                <Stack
                  alignItems='center'
                  justifyContent='center'
                  flexDirection='row'
                  gap='.5rem'
                  sx={{
                    width: 'calc(100% / 6)',
                    borderRight: '1px solid rgba(224, 224, 224, .4)',
                    '&:hover button': {
                      display: 'block',
                    },
                  }}
                >
                  <Typography>JR</Typography>
                  <SubSortBtn
                    field={`${colName}$jr`}
                    sortOptions={sortOptions}
                    handleSubSort={handleSubSort}
                  />
                </Stack>
              </Tooltip>
            </Stack>
          </Stack>
        );
      },
      renderCell: ({
        formattedValue,
      }: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
        const values = {
          js: formattedValue?.js ?? 0,
          jac: formattedValue?.jac ?? 0,
          jt: formattedValue?.jt ?? 0,
          ja: formattedValue?.ja ?? 0,
          jp: formattedValue?.jp ?? 0,
          jr: formattedValue?.jr ?? 0,
        };
        const elemsNum = Object.keys(values).length;
        return (
          <Stack flexDirection='row'>
            <Stack
              sx={{
                width: 'calc(100% / 6)',
                borderRight: '1px solid rgba(224, 224, 224, .4)',
                alignItems: 'center',
                textTransform: 'uppercase',
              }}
            >
              {values.js}
            </Stack>
            <Stack
              sx={{
                width: 'calc(100% / 6)',
                alignItems: 'center',
                textTransform: 'uppercase',
                borderRight: '1px solid rgba(224, 224, 224, .4)',
              }}
            >
              {values.jac}
            </Stack>
            <Stack
              sx={{
                width: 'calc(100% / 6)',
                alignItems: 'center',
                textTransform: 'uppercase',
                borderRight: '1px solid rgba(224, 224, 224, .4)',
              }}
            >
              {values.jt}
            </Stack>
            <Stack
              sx={{
                width: 'calc(100% / 6)',
                alignItems: 'center',
                textTransform: 'uppercase',
                borderRight: '1px solid rgba(224, 224, 224, .4)',
              }}
            >
              {values.ja}
            </Stack>
            <Stack
              sx={{
                width: 'calc(100% / 6)',
                alignItems: 'center',
                textTransform: 'uppercase',
                borderRight: '1px solid transparent',
              }}
            >
              {values.jp}
            </Stack>
            <Stack
              sx={{
                width: 'calc(100% / 6)',
                alignItems: 'center',
                textTransform: 'uppercase',
                borderRight: '1px solid transparent',
              }}
            >
              {values.jr}
            </Stack>
          </Stack>
        );
      },
      flex: 2,
    }));

    return [...cols, ...dCols];
  }, [fields, dynamicColNames]);

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
              name: 'report-daily-common',
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
      {view === 'table' &&
        (mdDown ? (
          <DailyCards
            rows={rows}
            view={view}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            searchValue={searchValue}
            handleChangeView={handleChangeView}
            handleSearch={handleSearch}
            toggleFilters={toggleFilters}
          />
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            columns={columns}
            pageName='daily'
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
            colHeaderHeight={100}
            rowHeight={config.datagrid.rowHeight}
            styles={{
              '& .MuiDataGrid-columnHeaderTitleContainerContent': {
                justifyContent: 'center',
                flexGrow: 1,
                height: '100px',
              },
              '& .MuiDataGrid-columnHeader': {
                padding: 0,
              },
              '& .MuiDataGrid-cell': {
                padding: 0,
              },
            }}
          />
        ))}
      {view === 'cards' && (
        <DailyCards
          rows={rows}
          view={view}
          searchValue={searchValue}
          handleChangeView={handleChangeView}
          handleSearch={handleSearch}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          toggleFilters={toggleFilters}
        />
      )}
      <DailyFilter
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
