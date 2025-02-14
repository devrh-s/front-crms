'use client';
import Date from '@/components/default/common/components/Date';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useActions from '@/hooks/useActions';
import { useCopyToClipboard } from '@/hooks/useCopyToClickbord';
import useFilters from '@/hooks/useFilters';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import { apiGetData, updateCommondData } from '@/lib/fetch';
import { getAppSearchParams } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Stack, Theme, useMediaQuery } from '@mui/material';
import { GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { commonDataBlocks, getCommonData } from './commonData';
import SalariesCards from './SalariesCards';
import { IProfessuinsFilters } from './SalariesFilter';
import { useGuidesStore } from '@/zustand/guidesStore';

const SalariesActions = dynamic(() => import('./SalariesActions'), {
  ssr: false,
});
const SalariesFilter = dynamic(() => import('./SalariesFilter'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

interface IProps {
  url?: string;
}

export default function Salaries({ url }: IProps) {
  const [view, setView] = useState('table');
  const { echo } = useContext(SocketContext);
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    paginationModel,
    rowCount,
    handleRowCount,
    handlePagination,
    checkPagination,
    defaultPagination,
  } = usePagination();
  const { searchValue, debouncedSearchValue, handleSearch, clearSearch } = useSearch();
  const { actionsData, deleteModal, handleActions, handleDeleteModal, handleClose } = useActions();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IProfessuinsFilters>();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const handleClickCopy = useCopyToClipboard();
  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: [
      url ?? 'salaries',
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
        url ? `${url}?${searchParams}` : `salaries?${searchParams}`
      );
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
    queryKey: ['salaries-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      tools: [],
    },
  });

  const columns: GridColDef<IRates>[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        type: 'actions',
        ...config.datagrid.column,
        getActions: (params: { id: number }) => [
          <GridActionsCellItem
            key='Action Copy'
            icon={<ContentCopyIcon />}
            onClick={() => handleClickCopy(`${url || 'salaries'}/${params.id}`)}
            label='Copy'
            showInMenu
          />,
          <GridActionsCellItem
            key='Action Edit'
            icon={<EditIcon />}
            onClick={() => handleActions(true, params.id)}
            label='Edit'
            showInMenu
          />,
          <GridActionsCellItem
            key='Action Duplicate'
            icon={<CopyAllIcon />}
            onClick={() => handleActions(true, params.id, true)}
            label='Duplicate'
            showInMenu
          />,
          <GridActionsCellItem
            key='Action Delete'
            onClick={() => {
              handleDeleteModal(true, [params.id]);
            }}
            icon={<DeleteIcon />}
            label='Delete'
            showInMenu
          />,
        ],
      },
      {
        field: 'id',
        headerName: 'ID',
        ...config.datagrid.column,
      },
      {
        field: 'currency',
        headerName: fields?.currency_id ?? 'Currency',
        description: 'Currency',
        disableColumnMenu: true,
        display: 'flex',
        valueFormatter: (value: any) => value?.name,
        renderCell: (params) => params.value?.name,
        width: 140,
      },
      {
        field: 'value',
        headerName: fields?.value ?? 'Value',
        description: 'Value',
        disableColumnMenu: true,
        display: 'flex',
        width: 80,
      },
      {
        field: 'salary_type',
        headerName: fields?.salary_type_id ?? 'Salary Type',
        description: 'Salary Type',
        disableColumnMenu: true,
        valueFormatter: (value: any) => value?.name,
        renderCell: (params) => params.value?.name,
        display: 'flex',
        width: 150,
      },

      {
        field: 'hourly_currency',
        headerName: fields?.hourly_currency && 'Hourly Currency',
        description: 'Hourly Currency',
        disableColumnMenu: true,
        valueFormatter: (value: any) => value?.name,
        renderCell: (params) => params.value?.name,
        display: 'flex',
        width: 150,
      },
      {
        field: 'hourly_cost',
        headerName: fields?.hourly_cost ?? 'Hourly Cost',
        description: 'Hourly Cost',
        disableColumnMenu: true,
        display: 'flex',
        width: 80,
      },

      {
        field: 'start_date',
        headerName: fields?.start_date ?? 'Start Date',
        description: 'Start Date',
        disableColumnMenu: true,
        display: 'flex',
        renderCell: (params) => <Date date={params.value} />,
        width: 150,
      },
      {
        field: 'end_date',
        headerName: fields?.end_date ?? 'End Date',
        description: 'End Date',
        disableColumnMenu: true,
        display: 'flex',
        renderCell: (params) => <Date date={params.value} />,
        width: 150,
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
              name: 'rates-common',
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
      <SalariesActions
        id={actionsData.id}
        url={url}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <SalariesCards
            rows={rows}
            url={url}
            loading={isFetching}
            commonData={commonData}
            searchValue={searchValue}
            paginationModel={paginationModel}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            handleSearch={handleSearch}
            view={view}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
          />
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            columns={columns}
            pageName='Salaries'
            loading={isFetching}
            rowCount={rowCount}
            availableAdd={!!url}
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            searchValue={searchValue}
            toggleFilters={toggleFilters}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            rowHeight={config.datagrid.rowHeight}
            multiDeletePermission
          />
        ))}
      {view === 'cards' && (
        <SalariesCards
          rows={rows}
          url={url}
          loading={isFetching}
          commonData={commonData}
          searchValue={searchValue}
          paginationModel={paginationModel}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          handlePagination={handlePagination}
          toggleFilters={toggleFilters}
          handleSearch={handleSearch}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
        />
      )}
      <SalariesFilter
        rows={rows}
        commonData={commonData}
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
      <DeleteModal
        rows={rows}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query={url ?? 'salaries'}
        url={url ?? 'salaries'}
        handleClose={handleClose}
      />
    </Stack>
  );
}
