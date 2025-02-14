'use client';
import Date from '@/components/default/common/components/Date';
import UserAvailability from '@/components/default/common/components/UserAvailability';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import useActions from '@/hooks/useActions';
import useFilters from '@/hooks/useFilters';
import useNotification from '@/hooks/useNotification';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import { apiGetData, apiUpdateData } from '@/lib/fetch';
import { checkPermission, getAppSearchParams, getPagePermissions } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import { useAuthStore } from '@/zustand/authStore';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { Stack, Theme, useMediaQuery } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from '@mui/x-data-grid';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Text from '../../common/components/Text';
import { IUsersFilters } from './types';
import UnconfirmedUsersCards from './UnconfirmedUsersCards';
import { useGuidesStore } from '@/zustand/guidesStore';

const UnconfirmedUsersFilter = dynamic(() => import('./UnconfirmedUsersFilter'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

export default function UnconfirmedUsers() {
  const [view, setView] = useState('table');
  const showNotification = useNotification();
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IUsersFilters>();
  const {
    paginationModel,
    rowCount,
    handleRowCount,
    handlePagination,
    checkPagination,
    defaultPagination,
  } = usePagination();
  const { isAdmin, permissions } = useAuthStore();
  const { searchValue, debouncedSearchValue, handleSearch, clearSearch } = useSearch();
  const { deleteModal, handleActions, handleDeleteModal, handleClose } = useActions();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const queryClient = useQueryClient();

  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const updateMutation = useMutation({
    mutationFn: (userId: number) => apiUpdateData(`unconfirmed-users/${userId}`),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['unconfirmed-users'],
        });
        showNotification('Successfully confirmed', 'success');
      } else if (result?.error) {
        showNotification('Something went wrong', 'error');
      }
    },
  });

  const handleConfirm = async (userId: number) => updateMutation.mutate(userId);

  const { isFetching, isError, data } = useQuery({
    queryKey: [
      'unconfirmed-users',
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
      const response = await apiGetData(`unconfirmed-users?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Talents', 'Users', permissions),
    [permissions]
  );

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
        field: 'Actions',
        headerName: '',
        type: 'actions',
        ...config.datagrid.column,
        getActions: (params: { id: number; row: any }) => {
          const actions = [];

          if (
            checkPermission({
              pagePermissions,
              permissionType: 'manage_unconfirmed_users',
              isAdmin,
            })
          ) {
            actions.push(
              <GridActionsCellItem
                key='Action Confirm'
                icon={<CheckCircleOutlinedIcon />}
                onClick={() => handleConfirm(params.id)}
                label='Confirm'
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
              />
            );
          }
          return actions;
        },
      },
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
        width: 400,
        display: 'flex',
        renderCell: (params: GridRenderCellParams<any, string, string>) => {
          return <Text text={params?.value!} />;
        },
      },
      {
        field: 'email',
        headerName: fields?.email ?? 'Email',
        description: 'Email',
        disableColumnMenu: true,
        width: 400,
      },
      {
        field: 'is_active',
        headerName: fields?.is_active ?? 'Is active',
        description: 'Is active',
        disableColumnMenu: true,
        display: 'flex',
        renderCell: (params: GridRenderCellParams<any, string>) => (
          <UserAvailability
            availability={params.value === 'active'}
            text={params.value}
            sx={{ fontSize: '14px' }}
          />
        ),
        width: 300,
      },
      {
        field: 'created_at',
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        disableColumnMenu: true,
        align: 'center',
        display: 'flex',
        width: 300,

        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
      },
    ],
    [fields, pagePermissions, isAdmin]
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
          <UnconfirmedUsersCards
            rows={rows}
            view={view}
            toggleFilters={toggleFilters}
            paginationModel={paginationModel}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            handlePagination={handlePagination}
            searchValue={searchValue}
            handleSearch={handleSearch}
            pagePermissions={pagePermissions}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleConfirm={handleConfirm}
            handleActions={handleActions}
            isSmall
          />
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            columns={columns}
            pageName='unconfirmed users'
            loading={isFetching}
            rowCount={rowCount}
            availableAdd={false}
            handleSortModelChange={handleSortModelChange}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_users']}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <UnconfirmedUsersCards
          rows={rows}
          loading={isFetching}
          view={view}
          pagePermissions={pagePermissions}
          toggleFilters={toggleFilters}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          searchValue={searchValue}
          paginationModel={paginationModel}
          handlePagination={handlePagination}
          handleSearch={handleSearch}
          handleConfirm={handleConfirm}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
        />
      )}
      <UnconfirmedUsersFilter
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
      <DeleteModal
        rows={rows}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query='unconfirmed-users'
        url='unconfirmed-users'
        handleClose={handleClose}
      />
    </Stack>
  );
}
