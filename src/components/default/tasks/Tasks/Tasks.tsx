'use client';
import Date from '@/components/default/common/components/Date';
import MoreChips from '@/components/default/common/components/MoreChips';
import NameLink from '@/components/default/common/components/NameLink';
import Note from '@/components/default/common/components/Note';
import Priority from '@/components/default/common/components/Priority';
import Status from '@/components/default/common/components/Status';
import UserChip from '@/components/default/common/components/UserChip';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import CustomTable from '@/components/default/common/tables/CustomTable';
import config from '@/config';
import { SocketContext } from '@/contexts/socketContext';
import useActions from '@/hooks/useActions';
import { useCopyToClipboard } from '@/hooks/useCopyToClickbord';
import useFilters from '@/hooks/useFilters';
import useNotification from '@/hooks/useNotification';
import usePagination from '@/hooks/usePagination';
import useSearch from '@/hooks/useSearch';
import useSort from '@/hooks/useSort';
import useUserProfile from '@/hooks/useUserProfile';
import { apiGetData, apiUpdateData, updateCommondData } from '@/lib/fetch';
import { checkPermission, getAppSearchParams, getPagePermissions } from '@/lib/helpers';
import { setEditsData } from '@/redux/slices/editsSlice';
import { changeSearchParams } from '@/redux/slices/searchParamsSlice';
import { clearTaskId } from '@/redux/slices/taskIdSlice';
import { IRootState } from '@/redux/store';
import { useAuthStore } from '@/zustand/authStore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Button, Stack, Theme, useMediaQuery } from '@mui/material';
import {
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from '@mui/x-data-grid';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { isNumber } from 'lodash';
import dynamic from 'next/dynamic';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import TaskBoard from './board/TaskBoard';
import Calendar from './calendar/Calendar';
import { commonDataBlocks, getCommonData } from './commonData';
import TasksCards from './TasksCards';
import { ITaskFilters } from './types';
import { useGuidesStore } from '@/zustand/guidesStore';

const TasksActions = dynamic(() => import('./TasksActions'), {
  ssr: false,
});
const TasksFilter = dynamic(() => import('./TasksFilter'), {
  ssr: false,
});
const TasksProfile = dynamic(() => import('./TasksProfile'), {
  ssr: false,
});
const StepModal = dynamic(() => import('./TaskSteps/StepModal'), {
  ssr: false,
});
const Modal = dynamic(() => import('@/components/default/common/modals/Modal/Modal'), {
  ssr: false,
});
const HTMLModal = dynamic(() => import('@/components/default/common/modals/HTMLModal/HTMLModal'), {
  ssr: false,
});
const DeleteModal = dynamic(
  () => import('@/components/default/common/modals/DeleteModal/DeleteModal'),
  { ssr: false }
);

interface ITasksProps {
  id?: number;
}
type TasksFields = 'status_id';

interface IFormInputs {
  status_id: number | string;
}

export default function Tasks({ id }: ITasksProps) {
  const [view, setView] = useState('table');
  const { echo } = useContext(SocketContext);
  const queryClient = useQueryClient();
  const [stepModal, setStepModal] = useState<IStep | null>(null);
  const { isAdmin, permissions } = useAuthStore();
  const { userProfile } = useUserProfile();
  const dispatch = useDispatch();
  const setGuidesData = useGuidesStore((state) => state.setGuidesData);
  const taskId = useSelector((state: IRootState) => state.taskId.taskId);
  const { sortOptions, clearSort, handleSortModelChange } = useSort();
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters<ITaskFilters>();
  const {
    register,
    reset,
    control,
    getValues,
    setValue,
    watch,
    clearErrors,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      status_id: '',
    },
  });
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
  const [note, setNote] = useState('');
  const [idProfile, setIdProfile] = useState<null | number>(taskId ? taskId : null);
  const [isProfile, setIsProfile] = useState<boolean>(taskId ? true : false);
  const [isLoading, setIsLoading] = useState(false);
  const showNotification = useNotification();
  const handleClickCopy = useCopyToClipboard();
  const [statusTask, setStatusTask] = useState<ITask | null>(null);
  const statusId = watch('status_id');
  const [cardsStorageActive, setCardsStorageActive] = useState(false);

  const handleCardsStorage = (value: boolean) => setCardsStorageActive(value);

  const { isFetching, isError, data } = useQuery({
    queryKey: ['tasks', { paginationModel, sortOptions, debouncedSearchValue, applyFilters }],
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
      const response = await apiGetData(`tasks?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Task Manager', 'Tasks', permissions),
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
    queryKey: ['tasks-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      task_templates: [],
      users: [],
      statuses: [],
      priorities: [],
      tools: [],
      objects: [],
      entities: [],
      edits: [],
      formats: [],
      tasks: [],
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
              onClick={() => setIdProfile(params.id)}
              label='Profile'
              showInMenu
            />,
            <GridActionsCellItem
              key='Action Copy'
              icon={<ContentCopyIcon />}
              onClick={() => handleClickCopy(`tasks/${params.id}`)}
              label='Copy'
              showInMenu
            />,
          ];
          if (
            checkPermission({
              pagePermissions,
              permissionType: 'edit_tasks',
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
              permissionType: 'delete_tasks',
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
        renderCell: (params: GridRenderCellParams<any, number, string>) => {
          return (
            <Box
              color={'primary'}
              sx={{
                cursor: 'pointer',
                textTransform: 'capitalize',
                color: (theme: Theme) => theme.palette.primary.main,
                '&:hover': (theme: Theme) => theme.palette.primary.main,
                '&:visited': (theme: Theme) => theme.palette.primary.main,
              }}
              onClick={() => setIdProfile(params.id as number)}
            >
              {params.value}
            </Box>
          );
        },
      },

      {
        field: 'parent_tasks',
        disableColumnMenu: true,
        headerName: fields?.parent_tasks ?? 'Parent tasks',
        description: 'Parent tasks',
        display: 'flex',
        width: 150,
        valueFormatter: (value: IUser) => value?.name,
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
              handleSetModal={(data: any) => setIdProfile(data.id)}
            />
          );
        },
      },
      {
        field: 'status',
        headerName: fields?.status_id ?? 'Status',
        disableColumnMenu: true,
        width: 200,
        renderCell: (params: GridRenderCellParams<any>) => {
          return (
            <Status
              name={params.value?.name}
              color={params.value?.color}
              onClick={() => {
                setStatusTask(params.row);
                setValue('status_id', params.value.id);
              }}
            />
          );
        },
      },
      {
        field: 'task_template',
        headerName: fields?.task_template_id ?? 'Task template',
        disableColumnMenu: true,
        description: 'Task template',
        renderCell: (params: GridRenderCellParams<any>) => {
          const href = `task-templates/${params.value.id}`;
          return <NameLink href={href} name={params.value?.name} />;
        },
        display: 'flex',
        width: 200,
      },
      {
        field: 'task_request',
        disableColumnMenu: true,
        headerName: fields?.task_request ?? 'Task Requests',
        description: 'Task requests',
        display: 'flex',
        width: 150,
        valueFormatter: (value: IUser) => value?.name,
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
                window.open(`/task-requests/${data.id}`);
              }}
            />
          );
        },
      },
      {
        field: 'professions',
        headerName: fields?.professions ?? 'Professions',
        description: 'Professions',
        disableColumnMenu: true,
        display: 'flex',
        width: 200,
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => {
          const sx = {
            height: config.datagrid.rowHeight,
            overflowY: 'auto',
            padding: '4px 0',
          };
          return <MoreChips data={params.value} propName='name' sx={sx} />;
        },
      },
      {
        field: 'priority',
        headerName: fields?.priority_id ?? 'Priority',
        disableColumnMenu: true,
        description: 'Priority',
        display: 'flex',
        renderCell: (params: GridRenderCellParams<any>) => {
          return <Priority priority={params.value?.name} />;
        },
        width: 100,
      },
      {
        field: 'start_date',
        disableColumnMenu: true,
        headerName: fields?.start_date ?? 'Start date',
        description: 'Start date',
        display: 'flex',
        width: 230,
        valueFormatter: (value: string) => dayjs(value)?.format('DD-MM-YYYY HH:mm:ss'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} format='DD-MM-YYYY 🕒 HH:mm:ss' />
        ),
      },
      {
        field: 'due_date',
        disableColumnMenu: true,
        headerName: fields?.due_date ?? 'Due date',
        description: 'Due date',
        display: 'flex',
        width: 230,
        valueFormatter: (value: string) => dayjs(value)?.format('DD-MM-YYYY HH:mm:ss'),
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Date date={params.value} format='DD-MM-YYYY 🕒 HH:mm:ss' />
        ),
      },
      {
        field: 'total_time',
        headerName: fields?.total_time ?? 'Total time',
        disableColumnMenu: true,
        description: 'Total time',
        width: 100,
        renderCell: (params: GridRenderCellParams<any>) => params.value,
      },
      {
        field: 'steps',
        disableColumnMenu: true,
        headerName: fields?.steps ?? 'Steps',
        description: 'Steps',
        display: 'flex',
        width: 250,
        valueFormatter: (value: IUser) => value?.name,
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
              propName='name'
              sx={sx}
              handleSetModal={handleSetModal}
            />
          );
        },
      },

      {
        field: 'is_completed',
        headerName: fields?.is_completed ?? 'Is completed',
        disableColumnMenu: true,
        description: 'Is completed',
        align: 'center',
        width: 150,
        renderCell: (params: GridRenderCellParams<any>) => {
          return params.value === 1 ? 'YES' : 'NO';
        },
      },
      {
        field: 'assignees',
        disableColumnMenu: true,
        headerName: fields?.assignees ?? 'Assignees',
        description: 'Assignees',
        display: 'flex',
        width: 150,
        valueFormatter: (value: IUser) => value?.name,
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
        field: 'controllers',
        disableColumnMenu: true,
        headerName: fields?.controllers ?? 'Controllers',
        description: 'Controllers',
        display: 'flex',
        width: 150,
        valueFormatter: (value: IUser) => value?.name,
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
        headerName: fields?.note ?? 'Notes',
        description: 'Notes',
        type: 'actions',
        renderCell: (params: GridRenderCellParams<any, any, any, GridTreeNodeWithRender>) => (
          <Note value={params.value} setNote={setNote} />
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
  const statuses = commonData?.statuses ?? [];

  const handleChangeView = (_: React.MouseEvent<HTMLElement>, newView: string) => {
    clearSearch();
    clearSort();
    defaultPagination();
    setView((prev) => newView ?? prev);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as TasksFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiUpdateData(data.path, data.data),
    onSuccess: (result) => {
      if (result.success) {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['tasks'],
          }),
        ]);
        showNotification(result.message, 'success');
        setIsLoading(false);
        setStatusTask(null);
      }
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      if (status === 422) {
        handleErrors(error, status);
      } else {
        showNotification(`${status}: Something went wrong`, 'error');
      }
      setIsLoading(false);
    },
  });

  const handleSetModal = (step: IStep | null) => {
    setStepModal(step);
  };

  const changeStatus = (task: ITask) => {
    setIsLoading(true);
    const data = {
      path: `tasks/${task.id}/change-status`,
      data: { status_id: statusId },
    };

    updateMutation.mutate(data);
    reset({
      status_id: '',
    });
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
              name: 'activities-common',
              commonDataReq,
              queryClient,
            });
          }
        });
    }
    return () => echo?.leave(`common-data`);
  }, [echo]);

  useEffect(() => {
    if (taskId) {
      dispatch(clearTaskId());
    }
  }, [idProfile]);

  return (
    <Stack gap='2rem'>
      <TasksProfile
        id={idProfile}
        visible={!!idProfile}
        commonData={commonData}
        handleActions={() => {
          setIdProfile(null);
          setIsProfile(false);
        }}
        editActions={() => {
          handleActions(true, idProfile);
          setIsProfile(true);
        }}
      />
      <TasksActions
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
        isProfile={isProfile}
        isDuplicate={actionsData.isDuplicate}
      />

      {view === 'table' &&
        (mdDown ? (
          <>
            <TasksCards
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
          </>
        ) : (
          <CustomTable
            view={view}
            rows={rows}
            columns={columns}
            loading={isFetching}
            rowCount={rowCount}
            handleSortModelChange={handleSortModelChange}
            paginationModel={paginationModel}
            handlePagination={handlePagination}
            toggleFilters={toggleFilters}
            searchValue={searchValue}
            availableAdd={isAdmin || !!pagePermissions['add_tasks']}
            multiDeletePermission={isAdmin || !!pagePermissions['delete_tasks']}
            handleSearch={handleSearch}
            handleChangeView={handleChangeView}
            handleDeleteModal={handleDeleteModal}
            handleActions={handleActions}
            showCalendar
            showBoard
            pageName='Tasks'
            rowHeight={config.datagrid.rowHeight}
          />
        ))}
      {view === 'cards' && (
        <TasksCards
          rows={rows}
          loading={isFetching}
          commonData={commonData}
          toggleFilters={toggleFilters}
          searchValue={searchValue}
          paginationModel={paginationModel}
          handlePagination={handlePagination}
          handleSearch={handleSearch}
          cardsStorageActive={cardsStorageActive}
          handleCardsStorage={handleCardsStorage}
          pagePermissions={pagePermissions}
          view={view}
          handleChangeView={handleChangeView}
          handleDeleteModal={handleDeleteModal}
          handleActions={handleActions}
        />
      )}
      {view === 'calendar' && (
        <Calendar
          view={view}
          applyFilters={applyFilters}
          filters={filters}
          openTaskProfile={(id: number) => setIdProfile(id)}
          toggleFilters={toggleFilters}
          handleChangeView={handleChangeView}
        />
      )}
      {view === 'board' && (
        <TaskBoard view={view} handleChangeView={handleChangeView} toggleFilters={toggleFilters} />
      )}
      <TasksFilter
        rows={rows}
        view={view}
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
        query='tasks'
        url='tasks'
        handleClose={handleClose}
      />
      <StepModal open={!!stepModal} step={stepModal} handleSetModal={handleSetModal} />
      <Modal
        title={`Change status for ${statusTask?.title}`}
        open={!!statusTask}
        handleClose={() => setStatusTask(null)}
      >
        <Controller
          name='status_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Status'
                link='/statuses'
                field={field}
                required
                options={statuses}
                error={error}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                }}
              />
            );
          }}
        />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            pt: '3rem',
          }}
        >
          <Button
            disabled={!isNumber(statusId)}
            sx={{
              minWidth: '240px',
            }}
            variant='contained'
            onClick={() => {
              changeStatus(statusTask as ITask);
            }}
          >
            Submit
          </Button>
        </Box>
      </Modal>
    </Stack>
  );
}
