'use client';
import Date from '@/components/default/common/components/Date';
import Text from '@/components/default/common/components/Text';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useActions from '@/hooks/useActions';
import useFilters from '@/hooks/useFilters';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import { apiGetData, updateCommondData } from '@/lib/fetch';
import { getAppSearchParams } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Stack, Theme, useMediaQuery } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from '@mui/x-data-grid';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import DeleteModal from '../../modals/DeleteModal/DeleteModal';
import { commonDataBlocks, getCommonData } from './commonData';
import ProfessionsPriceActions from './ProfessionPriceAction';
import ProfessionPriceCards from './ProfessionPriceCards';
import ProfessionPriceFilter from './ProfessionPriceFilter';
import { IProfessionPriceFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

interface IProfessionPriceProps {
  url: string;
}

export default function ProfessionPrice({ url }: IProfessionPriceProps) {
  const [view, setView] = useState('table');
  const { actionsData, deleteModal, handleActions, handleDeleteModal, handleClose } = useActions();
  const { echo } = useContext(SocketContext);
  const queryClient = useQueryClient();

  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IProfessionPriceFilters>();
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
      'professions/price',
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
    queryKey: ['professions/price-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      users: [],
    },
  });

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        ...config.datagrid.column,
        cellClassName: 'table-actions',
        type: 'actions',
        getActions: (params: { id: number; row: any }) => {
          const actions = [
            <GridActionsCellItem
              key='Action Edit'
              icon={<EditIcon />}
              onClick={() => handleActions(true, params.id)}
              label='Edit'
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
          ];

          return actions;
        },
      },
      {
        field: 'id',
        headerName: 'ID',
        ...config.datagrid.column,
      },
      {
        field: 'value',
        headerName: fields?.value ?? 'Value',
        disableColumnMenu: true,
        display: 'flex',
        description: 'Value',
        width: 300,
        valueFormatter: (params: any) => params ?? '',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value} />
        ),
      },
      {
        field: 'currency_id',
        headerName: fields?.currency_id ?? 'Currency',
        description: 'Currency',
        disableColumnMenu: true,
        display: 'flex',
        width: 300,
        valueFormatter: (params: any) => params ?? '',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.row?.currency?.iso3} />
        ),
      },
      {
        field: 'rate_id',
        headerName: fields?.rate_id ?? 'Rate',
        description: 'Rate',
        disableColumnMenu: true,
        display: 'flex',
        width: 300,
        valueFormatter: (params: any) => params ?? '',
        renderCell: (params) => {
          const rate = params.row?.rate;
          return <Text text={rate?.name} />;
        },
      },
      {
        field: 'start_date',
        headerName: fields?.start_date ?? 'Start Date',
        description: 'Start Date',
        disableColumnMenu: true,
        display: 'flex',
        width: 300,
        valueFormatter: (params: any) => dayjs(params),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
      },
      {
        field: 'end_date',
        headerName: fields?.end_date ?? 'End Date',
        description: 'End Date',
        disableColumnMenu: true,
        display: 'flex',
        width: 300,
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
    if (echo) {
      echo
        .channel(`common-data`)
        .listen('CommonDataChanged', (data: { key: keyof typeof commonDataBlocks }) => {
          const { key } = data;
          const basicValue = commonDataBlocks[key];
          const commonDataReq = { [key]: basicValue };
          if (commonDataReq) {
            updateCommondData({
              name: 'professions/price-common',
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
      <ProfessionsPriceActions
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        url={url}
        handleActions={handleActions}
      />
      {view === 'table' &&
        (mdDown ? (
          <ProfessionPriceCards
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
            view={view}
            rows={rows}
            columns={columns}
            pageName='profession price'
            loading={isFetching}
            rowCount={rowCount}
            paginationModel={paginationModel}
            searchValue={searchValue}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            handleSortModelChange={handleSortModelChange}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <ProfessionPriceCards
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
        />
      )}
      <ProfessionPriceFilter
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
        commonData={commonData}
      />
      <DeleteModal
        rows={rows}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query={'professions/price'}
        url={url}
        handleClose={handleClose}
      />
    </Stack>
  );
}
