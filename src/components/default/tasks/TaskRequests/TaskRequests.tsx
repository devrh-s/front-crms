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
import { checkPermission, getAppSearchParams, getPagePermissions } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import { setTaskId } from '@/redux/slices/taskIdSlice';
import { useAuthStore } from '@/zustand/authStore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ConstructionIcon from '@mui/icons-material/Construction';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Button, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
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
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import Note from '../../common/components/Note';
import UserChip from '../../common/components/UserChip';
import { commonDataBlocks, getCommonData } from './commonData';
import TaskRequestsCards from './TaskRequestsCards';
import { ITaskRequestsFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const TaskRequestsActions = dynamic(() => import('./TaskRequestsActions'), {
  ssr: false,
});
const TasksActions = dynamic(() => import('../Tasks/TasksActions'), {
  ssr: false,
});
const TaskRequestsFilter = dynamic(() => import('./TaskRequestsFilter'), {
  ssr: false,
});
const HTMLModal = dynamic(() => import('@/components/default/common/modals/HTMLModal/HTMLModal'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

export default function TaskRequests() {
  const [view, setView] = useState('table');
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const { echo } = useContext(SocketContext);
  const queryClient = useQueryClient();
  const { isAdmin, permissions } = useAuthStore();
  const { userProfile } = useUserProfile();
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<ITaskRequestsFilters>();
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
  const [taskRequestData, setTaskRequestData] = useState<ITaskRequest | null>(null);
  const {
    actionsData: actionsDataTask,
    deleteModal: deleteModalTask,
    handleActions: handleActionsTask,
    handleDeleteModal: handleDeleteModalTask,
    handleClose: handleCloseTask,
  } = useActions();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [description, setDescription] = useModal();
  const router = useRouter();
  const [cardsStorageActive, setCardsStorageActive] = useState(false);
  const handleClickCopy = useCopyToClipboard();
  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: [
      'task-requests',
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
      const response = await apiGetData(`task-requests?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Task Manager', 'Task Requests', permissions),
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
    queryKey: ['task-requests-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      task_templates: [],
      users: [],
      tasks: [],
      priorities: [],
      professions: [],
      placements: [],
    },
  });

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'Actions',
        headerName: '',
        maxWidth: 1,
        cellClassName: 'table-actions',
        type: 'actions',
        ...config.datagrid.column,
        getActions: (params: { id: number; row: any }) => {
          const actions = [
            <GridActionsCellItem
              key='Action Profile'
              icon={<VisibilityIcon />}
              onClick={() => router.push(`/task-requests/${params.id}`)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`/task-requests/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_task_request',
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
              permissionType: 'delete_task_request',
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
        disableColumnMenu: true,
        description: 'Title',
        width: 150,
        renderCell: (params: GridRenderCellParams<any>) => {
          const href = `task-requests/${params.id}`;
          if (!params.row.task) {
            return (
              <Stack gap={'0.5rem'} flexDirection={'row'}>
                <RemoveCircleOutlineIcon color='warning' />
                <NameLink href={href} name={params.value} sx={{ pl: 0 }} />
              </Stack>
            );
          }
          if (+params.row.task.is_completed === 1) {
            return (
              <Stack gap={'0.5rem'} flexDirection={'row'}>
                <CheckCircleOutlineIcon color='success' />{' '}
                <NameLink href={href} name={params.value} sx={{ pl: 0 }} />
              </Stack>
            );
          }
          if (+params.row.task.is_completed === 0) {
            return (
              <Stack gap={'0.5rem'} flexDirection={'row'}>
                <ConstructionIcon color='info' />{' '}
                <NameLink href={href} sx={{ pl: 0 }} name={params.value} />
              </Stack>
            );
          }
        },
        display: 'flex',
      },
      {
        field: 'task_template',
        headerName: fields?.task_template_id ?? 'Task Template',
        disableColumnMenu: true,
        description: 'Task Template',
        width: 250,
        renderCell: (params: GridRenderCellParams<any>) => {
          if (params.value) {
            const href = `task-templates/${params.value.id}`;
            return <NameLink href={href} name={params.value?.name} sx={{ pl: 0 }} />;
          }
          return null;
        },
        display: 'flex',
      },
      {
        field: 'task',
        headerName: fields?.task_id ?? 'Task',
        disableColumnMenu: true,
        description: 'Task ',
        width: 250,
        renderCell: (params: GridRenderCellParams<any>) => {
          if (params?.value) {
            const href = `/tasks`;
            return (
              <Typography
                color={'primary'}
                sx={{
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  window.open(href, '_blank');
                  dispatch(setTaskId(params.value.id));
                }}
              >
                {params.value.title}
              </Typography>
            );
          }
          return (
            <Button
              sx={{
                minWidth: 'max-content',
              }}
              size='small'
              variant='contained'
              onClick={() => {
                setTaskRequestData(params.row);
                handleActionsTask(true);
              }}
            >
              Work on task
            </Button>
          );
        },
        display: 'flex',
      },
      {
        field: 'priority',
        headerName: fields?.priority_id ?? 'Priority ',
        disableColumnMenu: true,
        description: 'Priority ',
        display: 'flex',

        renderCell: (params: GridRenderCellParams<any>) => {
          return params.value?.name;
        },
      },
      {
        field: 'professions',
        headerName: fields?.professions ?? 'Professions',
        description: 'Professions',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        valueFormatter: (value: IGuideType[]) => value.map((el: { name: string }) => el.name),
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
        field: 'assignees',
        headerName: fields?.assignees ?? 'Assignees',
        description: 'Assignees',
        disableColumnMenu: true,
        display: 'flex',
        width: 150,
        valueFormatter: (value: IGuideType[]) => value.map((el: { name: string }) => el.name),
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
        field: 'description',
        disableColumnMenu: true,
        headerName: fields?.description ?? 'Description',
        description: 'Description',
        type: 'actions',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Note value={params.value} setNote={setDescription} />
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
          const basicValue = commonDataBlocks[key] as string;
          const commonDataReq = { [key]: basicValue };
          if (commonDataReq) {
            updateCommondData({
              name: 'task-requests-common',
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
      <TaskRequestsActions
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        isDuplicate={actionsData.isDuplicate}
      />
      <TasksActions
        id={actionsDataTask.id}
        visible={actionsDataTask.visible}
        commonData={commonData}
        handleActions={handleActionsTask}
        taskRequest={taskRequestData}
      />

      {view === 'table' &&
        (mdDown ? (
          <TaskRequestsCards
            rows={rows}
            loading={isFetching}
            commonData={commonData}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            cardsStorageActive={cardsStorageActive}
            handleCardsStorage={handleCardsStorage}
            paginationModel={paginationModel}
            pagePermissions={pagePermissions}
            handlePagination={handlePagination}
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
            loading={isFetching}
            rowCount={rowCount}
            availableImport
            availableExport
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            availableAdd={isAdmin || !!pagePermissions['add_task_request']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_task_request']}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            pageName='Task Requests'
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <TaskRequestsCards
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
        />
      )}
      <TaskRequestsFilter
        rows={rows}
        commonData={commonData}
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
      <HTMLModal html={description} handleClose={() => setDescription('')} />
      <DeleteModal
        rows={rows}
        open={deleteModal.open}
        ids={deleteModal.ids}
        query='task-requests'
        url='task-requests'
        handleClose={handleClose}
      />
    </Stack>
  );
}
