'use client';
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
import JobRequestsCards from './JobRequestsCards';
import { IJobRequestsFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const JobRequestsActions = dynamic(() => import('./JobRequestsActions'), {
  ssr: false,
});
const JobRequestsFilter = dynamic(() => import('./JobRequestsFilter'), {
  ssr: false,
});
const HTMLModal = dynamic(() => import('@/components/default/common/modals/HTMLModal/HTMLModal'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

interface IJobRequests {
  url?: string;
}

export default function JobRequests({ url }: IJobRequests) {
  const [view, setView] = useState('table');
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { echo } = useContext(SocketContext);
  const [note, handleSetNote] = useModal();
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IJobRequestsFilters>();
  const {
    paginationModel,
    rowCount,
    handleRowCount,
    handlePagination,
    checkPagination,
    defaultPagination,
  } = usePagination();
  const { isAdmin, permissions } = useAuthStore();
  const { userProfile } = useUserProfile();
  const { searchValue, debouncedSearchValue, handleSearch, clearSearch } = useSearch();
  const { actionsData, deleteModal, handleActions, handleDeleteModal, handleClose } = useActions();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const queryClient = useQueryClient();
  const handleClickCopy = useCopyToClipboard();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);
  const { isFetching, isError, data } = useQuery({
    queryKey: [
      url ?? 'job-requests',
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
        url ? `${url}?${searchParams}` : `job-requests?${searchParams}`
      );
      return response;
    },
    refetchOnWindowFocus: false,
    // staleTime: 1000,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Jobs', 'Job Requests', permissions),
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
    queryKey: ['job-requests-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      professions: [],
      inner_clients: [],
      managers: [],
      rates: [],
      shifts: [],
      job_templates: [],
      task_templates: [],
      objects: [],
      actions: [],
    },
  });

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        ...config.datagrid.column,
        type: 'actions',
        getActions: (params: { id: number; row: any }) => {
          const actions = [
            <GridActionsCellItem
              key='Action Profile'
              icon={<VisibilityIcon />}
              onClick={() => router.push(`/job-requests/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`/job-requests/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_job_requests',
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
              permissionType: 'delete_job_requests',
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
        description: 'Name',
        disableColumnMenu: true,
        width: 200,
        renderCell: (params: GridRenderCellParams<any, number, string>) => {
          const href = `job-requests/${params.id}`;
          return <NameLink href={href} name={params.value} />;
        },
      },
      {
        field: 'innerClient',
        headerName: fields?.inner_client_id ?? 'Inner Client',
        description: 'Inner Client',
        disableColumnMenu: true,
        width: 150,
        display: 'flex',
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<{ name: string }>) => {
          return <Text text={params?.value?.name} />;
        },
      },
      {
        field: 'quantity',
        headerName: fields?.quantity ?? 'Quantity',
        disableColumnMenu: true,
        align: 'center',
      },
      {
        field: 'status',
        headerName: fields?.status_id ?? 'Status',
        description: 'Status',
        disableColumnMenu: true,
        display: 'flex',
        width: 200,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Status name={params?.value?.name} color={params?.value?.color} />
        ),
      },
      {
        field: 'department',
        headerName: fields?.department_id ?? 'Department',
        description: 'Department',
        disableColumnMenu: true,
        width: 150,
        display: 'flex',
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<{ name: string }>) => (
          <Text text={params?.value?.name} sx={{ color: params?.value?.color }} />
        ),
      },
      {
        field: 'profession',
        headerName: fields?.profession_id ?? 'Profession',
        description: 'Profession',
        disableColumnMenu: true,
        width: 150,
        display: 'flex',
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<{ name: string }>) => {
          return params.value?.name;
        },
      },

      {
        field: 'manager',
        headerName: fields?.manager_id ?? 'Manager',
        description: 'Manager',
        disableColumnMenu: true,
        width: 150,
        display: 'flex',
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <UserChip data={params?.value} /> : null;
        },
      },
      {
        field: 'rate',
        headerName: fields?.rate_id ?? 'Rate',
        description: 'Rate',
        disableColumnMenu: true,
        width: 150,
        display: 'flex',
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<{ name: string }>) => {
          return params.value?.name;
        },
      },
      {
        field: 'shift',
        headerName: fields?.rate_id ?? 'Shift',
        description: 'Shift',
        disableColumnMenu: true,
        width: 250,
        display: 'flex',
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<{ name: string }>) => {
          return params.value?.name;
        },
      },
      {
        field: 'sum_job_applications',
        headerName: fields?.sum_job_applications ?? 'Sum jas',
        disableColumnMenu: true,
        description: 'Sum Job Applications',
        width: 80,
        display: 'flex',
        align: 'center',
        valueFormatter: (value: string) => value,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <FilterLink
            link={'/job-applications'}
            label={params.value}
            filterPage='job-applications'
            filterName='job-requests'
            filterValue={{
              value: [params?.row?.id],
              mode: 'standard',
            }}
          />
        ),
      },
      {
        field: 'jobTemplates',
        headerName: fields?.job_templates ?? 'Job Templates',
        disableColumnMenu: true,
        description: 'Job Templates',
        width: 400,
        display: 'flex',
        valueFormatter: (value: IJobTemplate[]) =>
          value.map((el: { title: string }) => el.title).join(', '),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return <MoreChips data={params.value} propName='title' sx={sx} />;
        },
      },
      {
        field: 'task_templates',
        headerName: fields?.task_templates ?? 'Task Templates',
        disableColumnMenu: true,
        description: 'Task Templates',
        width: 200,
        display: 'flex',
        valueFormatter: (value: IJobTemplate[]) =>
          value.map((el: { title: string }) => el.title).join(', '),
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
        field: 'tools',
        headerName: fields?.tools ?? 'Tools',
        disableColumnMenu: true,
        description: 'Tools',
        width: 150,
        display: 'flex',
        valueFormatter: (value: IJobTemplate[]) =>
          value.map((el: { title: string }) => el.title).join(', '),
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
        field: 'note',
        disableColumnMenu: true,
        headerName: fields?.note ?? 'Note',
        description: 'Note',
        type: 'actions',
        width: 80,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Note value={params.value} setNote={handleSetNote} />
        ),
      },
      {
        field: 'close_date',
        disableColumnMenu: true,
        headerName: fields?.close_date ?? 'Close date',
        description: 'Close date',
        width: 150,
        display: 'flex',
        valueFormatter: (value: string) => dayjs(value)?.format('DD-MM-YY'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value != null && <Date date={params.value} />;
        },
      },
      {
        field: 'demand_date',
        disableColumnMenu: true,
        headerName: fields?.demand_date ?? 'Demand date',
        description: 'Demand date',
        width: 150,
        display: 'flex',
        valueFormatter: (value: string) => dayjs(value)?.format('DD-MM-YY'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value != null && <Date date={params.value} />;
        },
      },
      {
        field: 'created_at',
        disableColumnMenu: true,
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        width: 150,
        display: 'flex',
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
        width: 150,
        display: 'flex',
        valueFormatter: (value: { name: string }) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <UserChip data={params?.value} /> : null;
        },
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
            name: 'job-requests-common',
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
      <JobRequestsActions
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        url={url}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <JobRequestsCards
            rows={rows}
            loading={isFetching}
            commonData={commonData}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            handleSearch={handleSearch}
            pagePermissions={pagePermissions}
            view={view}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            isSmall={true}
          />
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            columns={columns}
            loading={isFetching}
            rowCount={rowCount}
            availableImport
            availableExport
            availableAdd={isAdmin || !!pagePermissions['add_job_requests']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_job_requests']}
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            pageName='Job Requests'
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <JobRequestsCards
          rows={rows}
          loading={isFetching}
          commonData={commonData}
          toggleFilters={toggleFilters}
          searchValue={searchValue}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          pagePermissions={pagePermissions}
          paginationModel={paginationModel}
          handlePagination={handlePagination}
          handleSearch={handleSearch}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
          isSmall={false}
        />
      )}
      <JobRequestsFilter
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
        query='job-requests'
        url='job-requests'
        handleClose={handleClose}
      />
    </Stack>
  );
}
