'use client';
import MoreChips from '@/components/default/common/components/MoreChips';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useActions from '@/hooks/useActions';
import { useCopyToClipboard } from '@/hooks/useCopyToClickbord';
import useFilters from '@/hooks/useFilters';
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
import NameLink from '../../common/components/NameLink';
import Note from '../../common/components/Note';
import UserChip from '../../common/components/UserChip';
import JobSitesCards from './JobSitesCards';
import { commonDataBlocks, getCommonData } from './commonData';
import { IJobSitesFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const JobSiteActions = dynamic(() => import('./JobSiteActions'), {
  ssr: false,
});
const JobSitesFilter = dynamic(() => import('./JobSitesFilter'), {
  ssr: false,
});
const HTMLModal = dynamic(() => import('@/components/default/common/modals/HTMLModal/HTMLModal'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

export default function JobSites() {
  const router = useRouter();
  const [view, setView] = useState('table');
  const [note, setNote] = useState('');
  const { echo } = useContext(SocketContext);
  const { isAdmin, permissions } = useAuthStore();
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { userProfile } = useUserProfile();
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IJobSitesFilters>();
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
  const handleClickCopy = useCopyToClipboard();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: ['job-sites', { paginationModel, sortOptions, debouncedSearchValue, applyFilters }],
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
      const response = await apiGetData(`job-sites?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Jobs', 'Job Sites', permissions),
    [permissions]
  );

  const { data: commonData } = useQuery({
    queryKey: ['job-sites-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      countries: [],
      actions: [],
      currencies: [],
      pricings: [],
      users: [],
    },
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
              key='Action Profile'
              icon={<VisibilityIcon />}
              onClick={() => router.push(`/job-sites/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`/job-sites/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_job_sites',
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
              permissionType: 'delete_job_sites',
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
        ...config.datagrid.column,
      },
      {
        field: 'name',
        headerName: fields?.name ?? 'Name',
        disableColumnMenu: true,
        description: 'Name',
        width: 300,
        renderCell: (params: GridRenderCellParams<any, number, string>) => {
          const href = `job-sites/${params.id}`;
          return <NameLink href={href} name={params.value} />;
        },
      },
      {
        field: 'website',
        headerName: fields?.website ?? 'Website',
        disableColumnMenu: true,
        description: 'Website',
        display: 'flex',
        width: 150,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <NameLink
            href={params.value}
            name='Link'
            sx={{ color: (theme) => theme.palette.primary }}
          />
        ),
      },
      {
        field: 'countries',
        headerName: fields?.countries ?? 'Countries',
        disableColumnMenu: true,
        description: 'Countries',
        display: 'flex',
        width: 200,
        cellClassName: 'chips-cell',
        valueFormatter: (params: any) => {
          return params.map((c: any) => c.name).join(', ');
        },
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return <MoreChips data={params.value} propName='name' sx={sx} />;
        },
      },
      {
        field: 'languages',
        headerName: fields?.languages ?? 'Languages',
        disableColumnMenu: true,
        description: 'Languages',
        display: 'flex',
        cellClassName: 'chips-cell',
        valueFormatter: (params: any) => {
          return params.map((c: any) => c.iso2).join(', ');
        },
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return <MoreChips data={params.value} propName='iso2' sx={sx} />;
        },
        width: 200,
      },
      {
        field: 'sum_job_accs',
        disableColumnMenu: true,
        headerName: fields?.sum_job_accs ?? 'Sum Job Accs',
        description: 'Sum Job Accs',
        display: 'flex',
        align: 'center',
        width: 150,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <FilterLink
            link={'/job-accounts'}
            label={params.value}
            filterPage='job-accounts'
            filterName='job-sites'
            filterValue={{
              value: [params?.row?.id],
              mode: 'standard',
            }}
          />
        ),
      },
      {
        field: 'created_at',
        disableColumnMenu: true,
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        display: 'flex',
        width: 150,
        valueFormatter: (value: string) => dayjs(value)?.format('DD-MM-YY'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
      },
      {
        field: 'createdBy',
        disableColumnMenu: true,
        headerName: fields?.created_by ?? 'Created By',
        description: 'Created By',
        display: 'flex',
        width: 150,
        valueFormatter: (value: IUser) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <UserChip data={params.value} /> : null;
        },
      },
      {
        field: 'note',
        disableColumnMenu: true,
        headerName: fields?.note ?? 'Notes',
        description: 'Notes',
        type: 'actions',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Note value={params.value} setNote={setNote} />
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
            name: 'job-sites-common',
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
      <JobSiteActions
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <JobSitesCards
            rows={rows}
            commonData={commonData}
            toggleFilters={toggleFilters}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            searchValue={searchValue}
            handleSearch={handleSearch}
            pagePermissions={pagePermissions}
            view={view}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
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
            pageName='job sites'
            loading={isFetching}
            rowCount={rowCount}
            paginationModel={paginationModel}
            searchValue={searchValue}
            availableAdd={isAdmin || !!pagePermissions['add_job_sites']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_job_sites']}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            handleSortModelChange={handleSortModelChange}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            availableExport
            availableImport
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <JobSitesCards
          view={view}
          rows={rows}
          loading={isFetching}
          commonData={commonData}
          searchValue={searchValue}
          paginationModel={paginationModel}
          pagePermissions={pagePermissions}
          toggleFilters={toggleFilters}
          handlePagination={handlePagination}
          handleSearch={handleSearch}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          handleActions={handleActions}
        />
      )}
      <JobSitesFilter
        commonData={commonData}
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
      <HTMLModal html={note} handleClose={() => setNote('')} />
      <DeleteModal
        rows={rows}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query='job-sites'
        url='job-sites'
        handleClose={handleClose}
      />
    </Stack>
  );
}
