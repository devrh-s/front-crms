import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import useActions from '@/hooks/useActions';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiUpdateData } from '@/lib/fetch';
import { getPagePermissions } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import { Box, Stack } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MouseEvent, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import TasksActions from '../TasksActions';
import TasksProfile from '../TasksProfile';
import { getCommonData } from '../commonData';
import ColumnTask from './ColumnTask';
import { TaskBoardData } from './types';

interface ITaskBoardProps {
  view: string;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
}

export default function TaskBoard({ view, handleChangeView, toggleFilters }: ITaskBoardProps) {
  const { data: taskboardData } = useQuery<TaskBoardData>({
    queryKey: ['taskboard'],
    queryFn: async () => {
      const response = await apiGetData('taskboard');
      return response;
    },
    refetchOnWindowFocus: false,
  });

  const [columns, setColumns] = useState(taskboardData?.data || []);
  const [idProfile, setIdProfile] = useState<null | number>(null);
  const { isAdmin, permissions } = useAuthStore();
  const { handleActions, actionsData } = useActions();
  const showNotification = useNotification();

  const { data: commonData } = useQuery({
    queryKey: ['tasks-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      task_templates: [],
      users: [],
      inner_clients: [],
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

  useEffect(() => {
    if (taskboardData?.data) {
      setColumns(taskboardData.data);
    }
  }, [taskboardData?.data]);

  const updateCardMutation = useMutation({
    mutationFn: async (data: { task_id: number; status_id: number; index?: number | string }) =>
      apiUpdateData(`taskboard/${data.task_id}/change-index`, {
        status_id: data.status_id,
        index: data.index,
      }),
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      showNotification(`${status}: Something went wrong`, 'error');
    },
  });

  const updateColumnMutation = useMutation({
    mutationFn: async (data: { order: number; status_id: number }) =>
      apiUpdateData(
        `statuses/${data.status_id}/entity-block/${taskboardData?.entity_block_profile_id}`,
        {
          order: data.order,
        }
      ),
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      showNotification(`${status}: Something went wrong`, 'error');
    },
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Task Manager', 'Tasks', permissions),
    [permissions]
  );

  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const modifiedColumns = [...columns];

    if (type === 'column') {
      // Перемещение столбцов
      const [removedColumn] = modifiedColumns.splice(source.index, 1);
      modifiedColumns.splice(destination.index, 0, removedColumn);
      setColumns(modifiedColumns);

      updateColumnMutation.mutate({
        status_id: removedColumn.id,
        order: destination.index,
      });
    }

    if (type === 'card') {
      // Перемещение карточек
      if (source.droppableId === destination.droppableId) {
        // Внутри одного столбца
        const column = modifiedColumns.find((col) => col.id.toString() === source.droppableId);
        if (column) {
          const [movedItem] = column.tasks.splice(source.index, 1);
          column.tasks.splice(destination.index, 0, movedItem);

          updateCardMutation.mutate({
            task_id: movedItem.id,
            status_id: column.id,
            index: destination.index,
          });
        }
      } else {
        // Между столбцами
        const sourceColumn = modifiedColumns.find(
          (col) => col.id.toString() === source.droppableId
        );
        const destinationColumn = modifiedColumns.find(
          (col) => col.id.toString() === destination.droppableId
        );

        if (sourceColumn && destinationColumn) {
          const [movedItem] = sourceColumn.tasks.splice(source.index, 1);
          destinationColumn.tasks.splice(destination.index, 0, movedItem);

          updateCardMutation.mutate({
            task_id: movedItem.id,
            status_id: destinationColumn.id,
            index: destination.index,
          });
        }
      }

      setColumns(modifiedColumns);
    }
  };

  return (
    <Stack sx={{ paddingTop: '.5rem', height: 'calc(100vh - 48px)' }}>
      <CustomToolbar
        view={view}
        handleChangeView={handleChangeView}
        hideToolbarSearch
        hideToolbarFilters
        toggleFilters={toggleFilters}
        showCalendar
        pageName={'Task board'}
        availableAdd={isAdmin || !!pagePermissions['add_tasks']}
        handleActions={handleActions}
        showBoard
      />
      <TasksProfile
        id={idProfile}
        visible={!!idProfile}
        commonData={commonData}
        handleActions={() => {
          setIdProfile(null);
        }}
        editActions={() => {
          handleActions(true, idProfile);
        }}
      />
      <TasksActions
        id={actionsData.id}
        visible={actionsData.visible}
        commonData={commonData}
        handleActions={handleActions}
      />
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='all-columns' type='column' direction='horizontal'>
          {(provided) => (
            <Stack
              direction='row'
              gap={1}
              padding='0.5rem'
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                flexWrap: { xs: 'wrap', md: 'nowrap' },
                overflowX: { xs: 'visible', md: 'auto' },
              }}
            >
              {columns.map((column, index) => (
                <Draggable draggableId={`column-${column.id}`} index={index} key={column.id}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <ColumnTask
                        id={column.id}
                        color={column.color}
                        name={column.name}
                        tasks={column.tasks}
                        setIdProfile={setIdProfile}
                        count_tasks={column.count_tasks}
                        current_tasks={column.current_tasks}
                      />
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
    </Stack>
  );
}
