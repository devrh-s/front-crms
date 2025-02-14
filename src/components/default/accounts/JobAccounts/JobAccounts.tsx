'use client';
import CustomLink from '@/components/default/common/components/CustomLink';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useActions from '@/hooks/useActions';
import { useCopyToClipboard } from '@/hooks/useCopyToClickbord';
import useFilters from '@/hooks/useFilters';
import useModal from '@/hooks/useModal';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import useUserProfile from '@/hooks/useUserProfile';
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
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from '@mui/x-data-grid';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Date from '../../common/components/Date';
import FilterLink from '../../common/components/FilterLink';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import Note from '../../common/components/Note';
import Status from '../../common/components/Status';
import Text from '../../common/components/Text';
import UserChip from '../../common/components/UserChip';
import { commonDataBlocks, getCommonData } from './commonData';
import JobAccountsCards from './JobAccountsCards';
import { IJobAccountsFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const JobAccountActions = dynamic(() => import('./JobAccountActions'), {
  ssr: false,
});
const JobAccountsFilter = dynamic(() => import('./JobAccountsFilter'), {
  ssr: false,
});
const HTMLModal = dynamic(() => import('@/components/default/common/modals/HTMLModal/HTMLModal'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

interface IJobAccounts {
  url?: string;
}

export default function JobAccounts({ url }: IJobAccounts) {
  const router = useRouter();
  const [view, setView] = useState('table');
  const [note, handleSetNote] = useModal();
  const { echo } = useContext(SocketContext);
  const handleClickCopy = useCopyToClipboard();
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IJobAccountsFilters>('job-accounts');
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
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { userProfile } = useUserProfile();
  const { isAdmin, permissions } = useAuthStore();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const queryClient = useQueryClient();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: [
      url ?? 'job-accounts',
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
        url ? `${url}?${searchParams}` : `job-accounts?${searchParams}`
      );
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Account Manager', 'Job Accounts', permissions),
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
    queryKey: ['job-accounts-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      job_sites: [],
      statuses: [],
      users: [],
      verification_accounts: [],
    },
  });

  const columns: GridColDef[] = useMemo(
    () => [
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
              onClick={() => router.push(`/job-accounts/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`/job-accounts/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_job_accounts',
              userId: userProfile?.id,
              ownerId: params.row.createdBy?.id,
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
              permissionType: 'delete_job_accounts',
              userId: userProfile?.id,
              ownerId: params.row.createdBy?.id,
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
        align: 'center',
        ...config.datagrid.column,
      },
      {
        field: 'name',
        headerName: fields?.name ?? 'Name',
        disableColumnMenu: true,
        description: 'Name',
        width: 250,
        display: 'flex',
        renderCell: (params: GridRenderCellParams<any, number, string>) => {
          const href = `job-accounts/${params.id}`;
          return <NameLink href={href} name={params.value} sx={{ pl: 0 }} />;
        },
      },
      {
        field: 'jobSite',
        headerName: fields?.job_site_id ?? 'Job Site',
        description: 'Job Site',
        disableColumnMenu: true,
        width: 150,
        display: 'flex',
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value?.name} />
        ),
      },
      {
        field: 'profile_link',
        headerName: fields?.profile_link ?? 'Profile Link',
        description: 'Profile Link',
        disableColumnMenu: true,
        display: 'flex',
        width: 100,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <CustomLink link={params?.value} label={'Link'} />
        ),
      },
      {
        field: 'login',
        headerName: fields?.login ?? 'Login',
        description: 'Login',
        disableColumnMenu: true,
        display: 'flex',
        width: 100,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value} />
        ),
      },
      {
        field: 'status',
        headerName: fields?.status_id ?? 'Status',
        description: 'Status',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Status name={params?.value?.name} color={params?.value?.color} />
        ),
      },
      {
        field: 'innerClient',
        headerName: fields?.inner_client_id ?? 'Inner Client',
        description: 'Inner Client',
        disableColumnMenu: true,
        display: 'flex',
        width: 200,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value?.name} />
        ),
      },
      {
        field: 'active_job_posts',
        headerName: fields?.active_job_posts ?? 'Active Job Posts',
        description: 'Active Job Posts',
        disableColumnMenu: true,
        display: 'flex',
        width: 100,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <FilterLink
            link={'/job-posts'}
            label={params.value}
            filterPage='job-posts'
            filterName='job-accounts'
            filterValue={{
              value: [params?.row?.id],
              mode: 'standard',
            }}
          />
        ),
      },
      {
        field: 'available_job_posts',
        headerName: fields?.available_job_posts ?? 'Available Job Post',
        description: 'Available Job Post ',
        disableColumnMenu: true,
        display: 'flex',
        width: 100,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value} />
        ),
      },
      {
        field: 'users',
        headerName: fields?.users ?? 'Users',
        description: 'Users',
        disableColumnMenu: true,
        display: 'flex',
        cellClassName: 'chips-cell',
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return <MoreChips data={params.value} sx={sx} exception='user' />;
        },
        width: 150,
      },
      {
        field: 'createdBy',
        headerName: fields?.created_by ?? 'Created By',
        description: 'Created By',
        disableColumnMenu: true,
        width: 150,
        display: 'flex',
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <UserChip data={params.value} /> : null;
        },
      },
      {
        field: 'created_at',
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        valueFormatter: (params: any) => dayjs(params),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
      },
      {
        field: 'note',
        disableColumnMenu: true,
        headerName: fields?.note ?? 'Notes',
        description: 'Note',
        type: 'actions',
        width: 80,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Note value={params.value} setNote={handleSetNote} />
        ),
      },
    ],
    [fields, userProfile, pagePermissions, isAdmin]
  );

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
            name: 'job-accounts-common',
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
      <JobAccountActions
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <JobAccountsCards
            rows={rows}
            commonData={commonData}
            toggleFilters={toggleFilters}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            searchValue={searchValue}
            handleSearch={handleSearch}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            view={view}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            pagePermissions={pagePermissions}
            isSmall
          />
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            availableExport
            availableImport
            columns={columns}
            pageName='job accounts'
            loading={isFetching}
            rowCount={rowCount}
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            availableAdd={isAdmin || !!pagePermissions['add_job_accounts']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_job_accounts']}
            searchValue={searchValue}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <JobAccountsCards
          rows={rows}
          commonData={commonData}
          toggleFilters={toggleFilters}
          paginationModel={paginationModel}
          handlePagination={handlePagination}
          searchValue={searchValue}
          handleSearch={handleSearch}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          pagePermissions={pagePermissions}
          handleActions={handleActions}
        />
      )}
      <JobAccountsFilter
        commonData={commonData}
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
      <HTMLModal html={note} handleClose={() => handleSetNote('')} />
      <DeleteModal
        rows={rows}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query='job-accounts'
        url='job-accounts'
        handleClose={handleClose}
      />
    </Stack>
  );
}
