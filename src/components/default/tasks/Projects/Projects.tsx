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
import { checkPermission, getAppSearchParams, getPagePermissions } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import { setTaskId } from '@/redux/slices/taskIdSlice';
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
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import Text from '../../common/components/Text';
import UserChip from '../../common/components/UserChip';
import ProjectsCards from './ProjectsCards';
import { commonDataBlocks, getCommonData } from './commonData';
import { IProjectsFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const ProjectActions = dynamic(() => import('./ProjectActions'), {
  ssr: false,
});
const ProjectsFilter = dynamic(() => import('./ProjectsFilter'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

export default function Projects() {
  const [view, setView] = useState('table');
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const router = useRouter();
  const { echo } = useContext(SocketContext);
  const queryClient = useQueryClient();
  const { isAdmin, permissions } = useAuthStore();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<IProjectsFilters>();
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
  const [cardsStorageActive, setCardsStorageActive] = useState(false);
  const handleClickCopy = useCopyToClipboard();
  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: ['projects', { paginationModel, sortOptions, debouncedSearchValue, applyFilters }],
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
      const response = await apiGetData(`projects?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Task Manager', 'Projects', permissions),
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
    queryKey: ['projects-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      projects_templates: [],
      tasks: [],
    },
  });

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        cellClassName: 'table-actions',
        type: 'actions',
        ...config.datagrid.column,
        getActions: (params: { id: number; row: any }) => {
          const actions = [
            <GridActionsCellItem
              key='Action Profile'
              icon={<VisibilityIcon />}
              onClick={() => router.push(`/projects/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`/projects/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_projects',
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
              permissionType: 'delete_projects',
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
        display: 'flex',
        description: 'Name',
        width: 250,
        renderCell: (params: GridRenderCellParams<any, string>) => {
          const href = `projects/${params.id}`;
          return <NameLink href={href} name={params.value} sx={{ pl: 0 }} />;
        },
        disableColumnMenu: true,
      },
      {
        field: 'project_template',
        headerName: fields?.project_template_id ?? 'Project Template',
        description: 'Project Template',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        renderCell: (params: GridRenderCellParams<any>) => {
          const href = `project-templates/${params.value?.id}`;
          return <NameLink href={href} name={params.value?.name || ''} sx={{ paddingLeft: 0 }} />;
        },
      },
      {
        field: 'inner_client',
        headerName: fields?.inner_client ?? 'Inner Client',
        description: 'Inner Client',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        valueFormatter: (params: any) => params?.name,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Text text={params?.value?.name} />
        ),
      },
      {
        field: 'tasks',
        disableColumnMenu: true,
        headerName: fields?.tasks ?? 'Tasks',
        description: 'Tasks',
        display: 'flex',
        width: 200,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
            alignItems: 'center',
          };
          return (
            <MoreChips
              data={params.value}
              propName='title'
              sx={sx}
              handleSetModal={(data: any) => {
                window.open(`/tasks`);
                dispatch(setTaskId(data.id));
              }}
            />
          );
        },
      },
      {
        field: 'start_date',
        headerName: fields?.start_date ?? 'Start Date',
        description: 'Start Date',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,

        renderCell: (params) => <Date date={params.value ?? ''} />,
      },
      {
        field: 'end_date',
        headerName: fields?.end_date ?? 'End Date',
        description: 'End Date',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        renderCell: (params) => <Date date={params.value ?? ''} />,
      },

      {
        field: 'created_at',
        disableColumnMenu: true,
        headerName: fields?.created_at ?? 'Created At',
        description: 'Created At',
        display: 'flex',
        width: 150,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} />
        ),
      },
      {
        field: 'created_by',
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
    if (echo) {
      echo
        .channel(`common-data`)
        .listen('CommonDataChanged', (data: { key: keyof typeof commonDataBlocks }) => {
          const { key } = data;
          const basicValue = commonDataBlocks[key];
          const commonDataReq = { [key]: basicValue };
          if (commonDataReq) {
            updateCommondData({
              name: 'projects-common',
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
      <ProjectActions
        commonData={commonData}
        id={actionsData.id}
        visible={actionsData.visible}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      {view === 'table' &&
        (mdDown ? (
          <ProjectsCards
            rows={rows}
            loading={isFetching}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            pagePermissions={pagePermissions}
            handleSearch={handleSearch}
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
            pageName='Projects'
            loading={isFetching}
            rowCount={rowCount}
            availableImport
            availableExport
            handleSortModelChange={handleSortModelChange}
            availableAdd={isAdmin || !!pagePermissions['add_projects']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_projects']}
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
        <ProjectsCards
          rows={rows}
          loading={isFetching}
          toggleFilters={toggleFilters}
          searchValue={searchValue}
          paginationModel={paginationModel}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          handlePagination={handlePagination}
          pagePermissions={pagePermissions}
          handleSearch={handleSearch}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
        />
      )}
      <ProjectsFilter
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
        query='projects'
        url='projects'
        handleClose={handleClose}
      />
    </Stack>
  );
}
