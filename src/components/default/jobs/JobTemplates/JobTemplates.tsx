'use client';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useActions from '@/hooks/useActions';
import { useCopyToClipboard } from '@/hooks/useCopyToClickbord';
import useFilters from '@/hooks/useFilters';
import useModal from '@/hooks/useModal';
import usePagination from '@/hooks/usePagination';
import useProfile from '@/hooks/useProfile';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import useUserProfile from '@/hooks/useUserProfile';
import { apiGetData, updateCommondData } from '@/lib/fetch';
import { checkPermission, getAppSearchParams, getPagePermissions } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import { useAuthStore } from '@/zustand/authStore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Chip, Stack, Theme, useMediaQuery } from '@mui/material';
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
import JobTemplatesCards from './JobTemplatesCards';
import { commonDataBlocks, getCommonData } from './commonData';
import { IJobTemplatesFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const JobTemplateActions = dynamic(() => import('./JobTemplateActions'), {
  ssr: false,
});
const JobTemplatesFilter = dynamic(() => import('./JobTemplatesFilter'), {
  ssr: false,
});
const HTMLModal = dynamic(() => import('@/components/default/common/modals/HTMLModal/HTMLModal'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

interface IJobTemplates {
  url?: string;
}

export default function JobTemplates({ url }: IJobTemplates) {
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
  } = useFilters<IJobTemplatesFilters>();
  const {
    paginationModel,
    rowCount,
    handleRowCount,
    handlePagination,
    checkPagination,
    defaultPagination,
  } = usePagination();
  const { searchValue, debouncedSearchValue, handleSearch, clearSearch } = useSearch();
  const { profileId, handleSetProfile, handleCloseProfile } = useProfile();
  const { userProfile } = useUserProfile();
  const { isAdmin, permissions } = useAuthStore();
  const [note, handleSetNote] = useModal();
  const [description, handleSetDescription] = useModal();
  const { actionsData, deleteModal, handleActions, handleDeleteModal, handleClose } = useActions();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const router = useRouter();
  const queryClient = useQueryClient();
  const handleClickCopy = useCopyToClipboard();

  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: [
      url ?? 'job-templates',
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
        url ? `${url}?${searchParams}` : `job-templates?${searchParams}`
      );
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Jobs', 'Job Templates', permissions),
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
    queryKey: ['job-templates-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      professions: [],
      statuses: [],
      objects: [],
      task_templates: [],
      users: [],
      tools: [],
      languages: [],
      similar_professions: [],
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
              onClick={() => router.push(`/job-templates/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`/job-templates/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_job_templates',
              userId: userProfile?.id,
              ownerId: params.row.created_by?.id,
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
              permissionType: 'delete_job_templates',
              userId: userProfile?.id,
              ownerId: params.row.created_by?.id,
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
        field: 'title',
        headerName: fields?.title ?? 'Title',
        description: 'Title',
        disableColumnMenu: true,
        width: 300,
        renderCell: (params: GridRenderCellParams<any, number, string>) => {
          const href = `job-templates/${params.id}`;
          return <NameLink href={href} name={params.value} />;
        },
      },
      {
        field: 'status',
        disableColumnMenu: true,
        display: 'flex',
        headerName: fields?.status_id ?? 'Status',
        description: 'Status',
        valueFormatter: (value: IStatus) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Status name={params?.value?.name} color={params?.value?.color} />
        ),
        width: 200,
      },
      {
        field: 'department',
        disableColumnMenu: true,
        display: 'flex',
        headerName: fields?.department_id ?? 'Department',
        description: 'Department',
        valueFormatter: (value: IStatus) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value?.name} sx={{ color: params?.value?.color }} />
        ),
        width: 150,
      },
      {
        field: 'profession',
        disableColumnMenu: true,
        display: 'flex',
        headerName: fields?.profession_id ?? 'Profession',
        description: 'Profession',
        valueFormatter: (value: IStatus) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Chip label={params.value?.name} />
        ),
        width: 150,
      },
      {
        field: 'similar_profession',
        disableColumnMenu: true,
        display: 'flex',
        headerName: fields?.similar_profession_id ?? 'Similar Profession',
        description: 'Similar Profession',
        valueFormatter: (value: IStatus) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          if (params.value) {
            return <Chip label={params.value?.name} />;
          }

          return null;
        },
        width: 150,
      },

      {
        field: 'sum_jas',
        headerName: fields?.sum_jas ?? 'Sum Jas',
        disableColumnMenu: true,
        description: 'Sum Jas',
        width: 100,
        align: 'center',
        display: 'flex',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <FilterLink
            link={'/job-applications'}
            label={params.value}
            filterPage='job-applications'
            filterName='job-templates'
            filterValue={{
              value: [params?.row?.id],
              mode: 'standard',
            }}
          />
        ),
      },
      {
        field: 'sum_job_posts',
        headerName: fields?.sum_job_posts ?? 'Sum Job Posts',
        disableColumnMenu: true,
        description: 'Sum Job Posts',
        align: 'center',
        width: 100,
        display: 'flex',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <FilterLink
            link={'/job-posts'}
            label={params.value}
            filterPage='job-posts'
            filterName='job-templates'
            filterValue={{
              value: [params?.row?.id],
              mode: 'standard',
            }}
          />
        ),
      },
      {
        field: 'tools',
        headerName: fields?.tools ?? 'Tools',
        disableColumnMenu: true,
        description: 'Tools',
        width: 150,
        display: 'flex',
        valueFormatter: (value: ITool[]) => value.map((el: { name: string }) => el.name).join(', '),
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
        field: 'job_requests',
        headerName: fields?.job_requests ?? 'Job Requests',
        disableColumnMenu: true,
        description: 'Job Requests',
        width: 250,
        display: 'flex',
        valueFormatter: (value: ITool[]) => value.map((el: { name: string }) => el.name).join(', '),
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
        width: 150,
        display: 'flex',
        valueFormatter: (value: ITool[]) =>
          value?.map((el: { name: string }) => el.name).join(', '),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return <MoreChips data={params.value ? params.value : []} propName='iso2' sx={sx} />;
        },
      },
      {
        field: 'task_templates',
        headerName: fields?.task_templates ?? 'Task Templates',
        disableColumnMenu: true,
        description: 'Task Templates',
        width: 200,
        display: 'flex',
        valueFormatter: (value: ITool[]) =>
          value?.map((el: { name: string }) => el.name).join(', '),
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
        field: 'objects',
        headerName: fields?.objects ?? 'Objects',
        disableColumnMenu: true,
        description: 'Objects',
        width: 200,
        display: 'flex',
        valueFormatter: (value: ITool[]) =>
          value?.map((el: { name: string }) => el.name).join(', '),
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
        field: 'created_by',
        disableColumnMenu: true,
        headerName: fields?.created_by ?? 'Created By',
        description: 'Created By',
        width: 150,
        valueFormatter: (value: IUser) => value?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          return params.value !== null ? <UserChip data={params.value} /> : null;
        },
      },
      {
        field: 'created_at',
        disableColumnMenu: true,
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        display: 'flex',
        valueFormatter: (value: string) => dayjs(value)?.format('DD-MM-YY'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
        width: 150,
      },
      {
        field: 'role_overview',
        disableColumnMenu: true,
        headerName: fields?.role_overview ?? 'Role Overview',
        description: 'Role Overview',
        type: 'actions',
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
      echo
        .channel(`common-data`)
        .listen('CommonDataChanged', (data: { key: keyof typeof commonDataBlocks }) => {
          const { key } = data;
          const basicValue = commonDataBlocks[key];
          const commonDataReq = { [key]: basicValue };
          if (commonDataReq) {
            updateCommondData({
              name: 'job-templates-common',
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
      <JobTemplateActions
        id={actionsData.id}
        url={url}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <JobTemplatesCards
            rows={rows}
            commonData={commonData}
            toggleFilters={toggleFilters}
            paginationModel={paginationModel}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            handlePagination={handlePagination}
            searchValue={searchValue}
            handleSearch={handleSearch}
            view={view}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            handleSetProfile={handleSetProfile}
            pagePermissions={pagePermissions}
            isSmall
          />
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            columns={columns}
            pageName='job templates'
            loading={isFetching}
            rowCount={rowCount}
            availableImport
            availableExport
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            availableAdd={isAdmin || !!pagePermissions['add_job_templates']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_job_templates']}
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <JobTemplatesCards
          rows={rows}
          loading={isFetching}
          commonData={commonData}
          pagePermissions={pagePermissions}
          toggleFilters={toggleFilters}
          searchValue={searchValue}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          paginationModel={paginationModel}
          handlePagination={handlePagination}
          handleSearch={handleSearch}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
          handleSetProfile={handleSetProfile}
        />
      )}
      <JobTemplatesFilter
        rows={rows}
        filters={filters}
        commonData={commonData}
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
      <HTMLModal html={note} handleClose={() => handleSetNote('')} />
      <HTMLModal html={description} handleClose={() => handleSetDescription('')} />
      <DeleteModal
        rows={rows}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query='job-templates'
        url='job-templates'
        handleClose={handleClose}
      />
    </Stack>
  );
}
