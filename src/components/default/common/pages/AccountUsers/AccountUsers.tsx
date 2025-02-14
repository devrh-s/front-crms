'use client';
import Date from '@/components/default/common/components/Date';
import UserChip from '@/components/default/common/components/UserChip';
import DeleteModal from '@/components/default/common/modals/DeleteModal/DeleteModal';
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
import AccountUsersActions from './AccountUsersActions';
import AccountUsersCards from './AccountUsersCards';
import AccountUsersFilter from './AccountUsersFilter';
import { commonDataBlocks, getCommonData } from './commonData';
import { IAccountUserFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

interface IAccountUserProps {
  url: string;
}

export default function AccountUsers({ url }: IAccountUserProps) {
  const [view, setView] = useState('table');
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
  } = useFilters<IAccountUserFilters>();
  const {
    paginationModel,
    rowCount,
    handleRowCount,
    handlePagination,
    checkPagination,
    defaultPagination,
  } = usePagination();
  const { searchValue, debouncedSearchValue, handleSearch, clearSearch } = useSearch();
  const { actionsData, deleteModal, handleDeleteModal, handleActions, handleClose } = useActions();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const handleClickCopy = useCopyToClipboard();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);
  const { isFetching, isError, data } = useQuery({
    queryKey: [
      'account-users',
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
    queryKey: ['account-users-common'],
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
        type: 'actions',
        ...config.datagrid.column,
        getActions: (params: { id: number }) => [
          <GridActionsCellItem
            key='Action Edit'
            icon={<EditIcon />}
            onClick={() => handleActions(true, params.id)}
            label='Edit'
            showInMenu
          />,
          <GridActionsCellItem
            key='Action Copy'
            icon={<ContentCopyIcon />}
            onClick={() => handleClickCopy(`/${url}/${params.id}`)}
            label='Copy'
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
        field: 'user',
        headerName: fields?.user_id ?? 'User',
        disableColumnMenu: true,
        description: 'Name',
        flex: 1,
        valueFormatter: (params: any) => params?.row?.user,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <UserChip data={params.row.user} /> : null;
        },
      },
      {
        field: 'start_date',
        headerName: fields?.start_date ?? 'Start Date',
        description: 'Start Date',
        disableColumnMenu: true,
        display: 'flex',
        flex: 1,
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
        flex: 1,
        valueFormatter: (params: any) => dayjs(params),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          if (params.value !== null) return <Date date={params.value} />;
          return null;
        },
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
              name: 'account-users-common',
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
      <AccountUsersActions
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        url={url}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <AccountUsersCards
            rows={rows}
            url={url}
            commonData={commonData}
            toggleFilters={toggleFilters}
            paginationModel={paginationModel}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            handlePagination={handlePagination}
            searchValue={searchValue}
            handleSearch={handleSearch}
            view={view}
            handleActions={handleActions}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            isSmall
          />
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            columns={columns}
            pageName='Account User'
            loading={isFetching}
            rowCount={rowCount}
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <AccountUsersCards
          rows={rows}
          url={url}
          handleActions={handleActions}
          commonData={commonData}
          toggleFilters={toggleFilters}
          paginationModel={paginationModel}
          handlePagination={handlePagination}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          searchValue={searchValue}
          handleSearch={handleSearch}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
        />
      )}
      <AccountUsersFilter
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
        query='account-user'
        url='account-user'
        handleClose={handleClose}
      />
    </Stack>
  );
}
