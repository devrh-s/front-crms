import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Button, SpeedDial, SpeedDialAction, Skeleton, Stack } from '@mui/material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { useContext, useCallback, useRef, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Control } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { TasksContext } from '../../contexts/tasksContext';
import { apiGetData } from '@/lib/fetch';
import { getTransformedTask } from '../../helpers';
import Task from '../../components/Task';
import { ITaskSave } from '../../types/types';

interface ITasksProps {
  fullScreen: boolean;
  commonData: ICommonData;
  visible: boolean;
  errors: any;
  control: Control<any>;
  isEdit: boolean;
  clearErrors: (error?: any) => void;
}

interface ITasksData {
  ids: number[];
  status: 'set-tasks' | 'add-existing-task';
}

async function getTaskTemplates(taskTemplatesIds: Array<string | number>) {
  const results = (await Promise.allSettled(
    taskTemplatesIds.map((id) => apiGetData(`task-templates/${id}`))
  )) as IParallelResult[];
  return results;
}

const initialTasksData: ITasksData = { ids: [], status: 'set-tasks' };

export default function Tasks({
  fullScreen,
  commonData,
  errors,
  visible,
  control,
  isEdit,
  clearErrors,
}: ITasksProps) {
  const hasMounted = useRef(false);
  const [startSelectionProcess, setStartSelectionProcess] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string>('');
  const [tasksData, setTasksData] = useState<ITasksData>(initialTasksData);
  const task_templates = commonData.task_templates ?? [];

  const {
    elems: tasks,
    selectedIds: selectedTasksIds,
    mutateElemsList: mutateTasks,
    actionOptions: { getMoveTask, getSetTasks, getUpdateTasks },
  } = useContext(TasksContext);

  const filteredTaskTemplates = useMemo(() => {
    const taskTemplatesIds = new Set(tasks.map((item: ITaskSave) => item.task_template_id));
    return task_templates.filter((item) => !taskTemplatesIds.has(+item.id));
  }, [task_templates, tasks?.length]);

  const { data, isFetching } = useQuery({
    queryKey: ['tasks-task-templates', tasksData.ids],
    queryFn: async () => {
      const response = await getTaskTemplates(tasksData.ids);
      return response.map((el) => el.value.data);
    },
    refetchOnWindowFocus: false,
    enabled: !!tasksData.ids?.length,
  });

  const onDragEnd = useCallback(
    (result: any) => {
      const { destination, source } = result;
      if (!result.destination) {
        return;
      }
      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }
      if (errors?.length) {
        clearErrors();
      }
      mutateTasks(
        getMoveTask({
          sourceInd: source.index,
          destInd: destination.index,
          elems: tasks,
        })
      );
    },
    [errors]
  );

  const clearStepsData = () => setTasksData(initialTasksData);

  const renderTask = (task: ITaskSave, index: number) => {
    return (
      <Task
        key={task?.id}
        commonData={commonData}
        fullScreen={fullScreen}
        taskInd={index}
        control={control}
        errors={errors[index]}
        clearErrors={clearErrors}
        task={task}
      />
    );
  };

  useEffect(() => {
    if (data) {
      const newTasks = data.map((task) => getTransformedTask(task));
      if (tasksData.status === 'set-tasks') {
        mutateTasks(getSetTasks({ tasks: newTasks }));
      } else {
        mutateTasks(getUpdateTasks({ tasks: newTasks }));
      }
      clearStepsData();
    }
  }, [data]);

  useEffect(() => {
    if (!isEdit && hasMounted.current) {
      setTasksData({ ids: selectedTasksIds, status: 'set-tasks' });
    } else {
      hasMounted.current = true;
    }
  }, [isEdit, selectedTasksIds]);

  return (
    <Stack gap='.8rem' sx={{ width: '100%', display: visible ? 'flex' : 'none' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='droppable'>
          {(provided) => (
            <Stack {...provided.droppableProps} ref={provided.innerRef}>
              {tasks.map((task: any, index: number) => renderTask(task, index))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
      {isFetching && <Skeleton variant='rounded' width={'100%'} height={58} />}
      {startSelectionProcess && (
        <Stack flexDirection='row' gap='1rem'>
          <CustomSingleSelect
            label='Existing task template'
            link='/task-templates'
            field={{
              value: selectedId,
              onChange: (targetValue: number) => setSelectedId(targetValue),
            }}
            options={filteredTaskTemplates}
          />
          <Button
            size='small'
            variant='contained'
            sx={{
              alignSelf: 'flex-end',
            }}
            startIcon={<AddCircleIcon />}
            onClick={() => {
              if (typeof selectedId === 'number') {
                setTasksData(() => ({ ids: [selectedId], status: 'add-existing-task' }));
              }
              setSelectedId('');
              setStartSelectionProcess(false);
            }}
          >
            Add
          </Button>
        </Stack>
      )}
      {!startSelectionProcess && (
        <SpeedDial
          ariaLabel='SpeedDial create Task'
          icon={<SpeedDialIcon />}
          direction='left'
          sx={{
            alignSelf: 'flex-end',
            '& .MuiFab-sizeLarge': {
              width: 'unset',
              height: 'unset',
              minHeight: 'unset',
            },
          }}
        >
          <SpeedDialAction
            icon={<AddBoxIcon />}
            tooltipTitle='Add existing'
            onClick={() => setStartSelectionProcess(true)}
          />
        </SpeedDial>
      )}
    </Stack>
  );
}
