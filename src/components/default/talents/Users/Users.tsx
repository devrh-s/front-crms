'use client';
import Date from '@/components/default/common/components/Date';
import UserAvailability from '@/components/default/common/components/UserAvailability';
import UserChip from '@/components/default/common/components/UserChip';
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
import {
  checkPermission,
  getAppSearchParams,
  getCommonDataReq,
  getPagePermissions,
} from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import { useAuthStore } from '@/zustand/authStore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Stack, Theme, useMediaQuery } from '@mui/material';
import {
  GridActionsCellItem,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from '@mui/x-data-grid';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import UsersCards from './UsersCards';
import { commonDataBlocks, getCommonData } from './commonData';
import UserRoleSelect from './components/UserRoleSelect';
import { IUsersFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const UserActions = dynamic(() => import('./UserActions'), {
  ssr: false,
});
const UsersFilter = dynamic(() => import('./UsersFilter'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

export default function Users() {
  const router = useRouter();
  const [view, setView] = useState('table');
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { echo } = useContext(SocketContext);
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
  const { searchValue, debouncedSearchValue, handleSearch, clearSearch } = useSearch();
  const { actionsData, deleteModal, handleActions, handleDeleteModal, handleClose } = useActions();
  const { isAdmin, permissions } = useAuthStore();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const handleClickCopy = useCopyToClipboard();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: ['users', { paginationModel, sortOptions, debouncedSearchValue, applyFilters }],
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
      const response = await apiGetData(`users?${searchParams}`);
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

  const { data: commonData } = useQuery({
    queryKey: ['users-common'],
    queryFn: async () => {
      const data = await getCommonData();
      return {
        ...data,
        availabilities: [
          { id: 'active', name: 'Active' },
          { id: 'inactive', name: 'Inactive' },
        ],
      };
    },
    refetchOnWindowFocus: false,
    placeholderData: {
      availabilities: [],
      currencies: [],
      roles: [],
    },
  });

  const columns: any[] = useMemo(() => {
    const preparedColumns = [
      {
        field: 'Actions',
        headerName: '',
        type: 'actions',
        ...config.datagrid.column,
        getActions: (params: { id: number; row: any }) => {
          const actions = [
            <GridActionsCellItem
              key='Action Profile'
              icon={<VisibilityIcon />}
              onClick={() => router.push(`/users/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`/users/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_users',
              isAdmin,
            })
          ) {
            actions.push(
              <GridActionsCellItem
                key='Action Edit'
                icon={<EditIcon />}
                onClick={() => handleActions(true, params.id)}
                label='Edit'
                showInMenu
              />
            );
            actions.push(
              <GridActionsCellItem
                key='Action Duplicate'
                icon={<CopyAllIcon />}
                onClick={() => handleActions(true, params.id, true)}
                label='Duplicate'
                showInMenu
              />
            );
          }
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'delete_users',
              isAdmin,
            })
          ) {
            actions.push(
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
        width: 250,
        renderCell: (params: GridRenderCellParams<any, string, string>) => {
          const href = `users/${params.id}`;
          const image = params.row.image;
          return <UserChip data={{ name: params.value!, id: params.id as number, image }} />;
        },
      },
      {
        field: 'email',
        headerName: fields?.email ?? 'Email',
        description: 'Email',
        disableColumnMenu: true,
        width: 300,
      },
      {
        field: 'is_active',
        headerName: fields?.is_active ?? 'Is active',
        description: 'Is active',
        disableColumnMenu: true,
        display: 'flex',
        width: 100,
        renderCell: (params: GridRenderCellParams<any, string>) => (
          <UserAvailability
            availability={params.value === 'active'}
            text={params.value}
            sx={{ fontSize: '14px' }}
          />
        ),
      },
      {
        field: 'task_assigned',
        headerName: fields?.task_assigned ?? 'Task Assigned',
        description: 'Task Assigned',
        disableColumnMenu: true,
        align: 'center',
        width: 150,
      },
      {
        field: 'task_done',
        headerName: fields?.task_done ?? 'Task Done',
        description: 'Task Done',
        disableColumnMenu: true,
        align: 'center',
        width: 150,
      },
      {
        field: 'hourly_cost',
        headerName: fields?.hourly_cost ?? 'Hourly Cost',
        description: 'Hourly Cost',
        disableColumnMenu: true,
        align: 'center',
        width: 150,
        renderCell: (params: GridRenderCellParams<any, number>) => params.value,
      },
      {
        field: 'currency',
        headerName: fields?.currency_id ?? 'Currency',
        description: 'Currency',
        disableColumnMenu: true,
        align: 'center',
        width: 150,
        renderCell: (params: GridRenderCellParams<any, ICurrencies>) => params.value?.name,
      },
      {
        field: 'created_at',
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        disableColumnMenu: true,
        width: 160,
        display: 'flex',
        align: 'center',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
      },
    ];
    const userRoleElem = {
      field: 'role_id',
      headerName: fields?.user_role_id ?? 'User role',
      type: 'actions',
      width: 350,
      display: 'flex',
      cellClassName: 'actionCell',
      getActions: (params: any) => {
        const actions = [];
        if (
          checkPermission({
            pagePermissions,
            permissionType: 'manage_unconfirmed_users',
            isAdmin,
          })
        ) {
          actions.push(
            <UserRoleSelect
              key={params.row?.id}
              userId={params.row?.id}
              commonData={commonData}
              defaultRole={params.row?.role_id}
            />
          );
        }
        return actions;
      },
    };
    if (
      checkPermission({
        pagePermissions,
        permissionType: 'manage_unconfirmed_users',
        isAdmin,
      })
    ) {
      return [...preparedColumns.slice(0, 3), userRoleElem, ...preparedColumns.slice(3)];
    }
    return preparedColumns;
  }, [fields, commonData]);

  const handleChangeView = (_: React.MouseEvent<HTMLElement>, newView: string) => {
    clearSearch();
    clearSort();
    defaultPagination();
    setView((prev) => newView ?? prev);
  };

  useEffect(() => {
    if (echo) {
      echo.channel(`common-data`).listen('CommonDataChanged', (data: any) => {
        const { key } = data;
        const commonDataReq = getCommonDataReq(key, commonDataBlocks);
        if (commonDataReq) {
          updateCommondData({
            name: 'users-common',
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
      <UserActions
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        pagePermissions={pagePermissions}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <UsersCards
            rows={rows}
            commonData={commonData}
            toggleFilters={toggleFilters}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            searchValue={searchValue}
            handleSearch={handleSearch}
            pagePermissions={pagePermissions}
            view={view}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            isSmall
          />
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            columns={columns}
            pageName='users'
            loading={isFetching}
            rowCount={rowCount}
            availableAdd={isAdmin || !!pagePermissions['add_users']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_users']}
            handleSortModelChange={handleSortModelChange}
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
        <UsersCards
          rows={rows}
          loading={isFetching}
          commonData={commonData}
          toggleFilters={toggleFilters}
          searchValue={searchValue}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          paginationModel={paginationModel}
          handlePagination={handlePagination}
          handleSearch={handleSearch}
          pagePermissions={pagePermissions}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
        />
      )}
      <UsersFilter
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
        query='users'
        url='users'
        handleClose={handleClose}
      />
    </Stack>
  );
}
