import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Tooltip,
  Button,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  Stack,
  Skeleton,
  Typography,
} from '@mui/material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import TaskIcon from '@mui/icons-material/Task';
import { useContext, useEffect, MouseEvent, useCallback, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import MilestoneInputs from './MilestoneInputs';
import { Control, Controller } from 'react-hook-form';
import { TasksContext } from '../../contexts/tasksContext';
import { apiGetData } from '@/lib/fetch';
import { getTransformedTask } from '../../helpers';
import { useQuery } from '@tanstack/react-query';
import Task from '../../components/Task';
import CustomErrorTooltip from '@/components/default/common/components/CustomErrorTooltip';
import { IMilestoneSave, ITaskSave } from '../../types/types';

interface IMilestoneProps {
  milestone: IMilestoneSave;
  milestoneInd: number;
  commonData: ICommonData;
  fullScreen: boolean;
  errors: any;
  control: Control<any>;
  clearErrors: (error?: any) => void;
}

async function getTaskTemplates(taskTemplatesIds: Array<string | number>) {
  const results = (await Promise.allSettled(
    taskTemplatesIds.map((id) => apiGetData(`task-templates/${id}`))
  )) as IParallelResult[];
  return results;
}

export default function Milestone({
  milestone,
  milestoneInd,
  commonData,
  fullScreen,
  errors,
  control,
  clearErrors,
}: IMilestoneProps) {
  const [startSelectionProcess, setStartSelectionProcess] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string>('');
  const [tasksIds, setTasksIds] = useState<number[]>([]);
  const [editTasks, setEditTasks] = useState(false);
  const {
    elems: milestones,
    mutateElemsList: mutateMilestones,
    generateNameKeys,
    actionOptions: { getDeleteMilestone, getUpdateTasks, getMoveTask },
  } = useContext(TasksContext);
  const task_templates = commonData?.task_templates ?? [];

  const filteredTaskTemplates = useMemo(() => {
    const taskTemplatesIds = new Set(
      milestone.tasks.map((item: ITaskSave) => item.task_template_id)
    );
    return task_templates.filter((item) => !taskTemplatesIds.has(+item.id));
  }, [task_templates, milestone.tasks?.length]);

  const { data, isFetching } = useQuery({
    queryKey: ['tasks-step-templates', tasksIds],
    queryFn: async () => {
      const response = await getTaskTemplates(tasksIds);
      return response.map((el) => el.value.data);
    },
    refetchOnWindowFocus: false,
    enabled: !!tasksIds?.length,
  });

  const isInvalid = useMemo(() => {
    if (!errors) return false;
    return !!Object.keys(errors).length;
  }, [errors]);

  const nameKeys = useMemo(
    () =>
      generateNameKeys({
        level: 'milestones',
        indexes: [milestoneInd],
        keys: ['name', 'description', 'start_date', 'end_date'],
      }),
    [milestoneInd]
  );

  const onDragEnd = useCallback(
    (result: any) => {
      const { destination, source } = result;
      if (!result.destination) {
        return;
      }
      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }
      if (errors?.tasks?.length) {
        clearErrors('tasks');
      }
      mutateMilestones(
        getMoveTask({
          milestoneInd,
          sourceInd: source.index,
          destInd: destination.index,
          elems: milestones,
        })
      );
    },
    [milestones, milestoneInd, errors]
  );

  const renderTask = (task: ITaskSave, ind: number) => {
    return (
      <Task
        key={task?.id}
        commonData={commonData}
        fullScreen={fullScreen}
        taskInd={ind}
        milestoneInd={milestoneInd}
        control={control}
        errors={errors?.tasks?.[ind] ?? []}
        clearErrors={clearErrors}
        task={task}
      />
    );
  };

  const handleEdit = (e: MouseEvent) => {
    e.stopPropagation();
    setEditTasks(true);
  };

  const deleteTask = (e: MouseEvent) => {
    e.stopPropagation();
    mutateMilestones(getDeleteMilestone({ milestoneInd }));
  };

  useEffect(() => {
    if (data) {
      const newTasks = data.map((task) => getTransformedTask(task));
      mutateMilestones(getUpdateTasks({ milestoneInd, tasks: newTasks }));
      setTasksIds([]);
    }
  }, [data]);

  return (
    <Draggable key={milestone?.id} draggableId={`${milestone?.id}`} index={milestoneInd}>
      {(provided) => (
        <Accordion
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            border: `1px solid ${isInvalid ? 'red' : 'transparent'}`,
            borderRadius: '4px',
          }}
          onChange={() => setEditTasks(false)}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='panel1-content'
            id='panel1-header'
            sx={{
              '& .MuiAccordionSummary-content': {
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
              },
            }}
          >
            <Stack flexDirection='row'>
              <Box {...provided.dragHandleProps}>
                <DragIndicatorIcon />
              </Box>
              <Controller
                name={nameKeys.name}
                control={control}
                render={({ field: { value } }) => {
                  return (
                    <Typography>
                      {milestoneInd + 1}.&nbsp;{value}
                    </Typography>
                  );
                }}
              />
            </Stack>
            <Stack flexDirection='row'>
              <CustomErrorTooltip open={!!errors?.tasks?.length} errorText='Invalid task data'>
                <Tooltip title='Edit tasks'>
                  <IconButton
                    size='small'
                    color={errors?.tasks?.length ? 'error' : 'success'}
                    onClick={handleEdit}
                  >
                    <TaskIcon sx={{ width: '1rem', height: '1rem' }} />
                  </IconButton>
                </Tooltip>
              </CustomErrorTooltip>
              <IconButton size='small' color='error' onClick={deleteTask}>
                <CloseIcon sx={{ width: '1rem', height: '1rem' }} />
              </IconButton>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <MilestoneInputs
              visible
              control={control}
              fullScreen={fullScreen}
              nameKeys={nameKeys}
            />
            {editTasks && (
              <Stack gap='.8rem' sx={{ paddingLeft: fullScreen ? '2rem' : 0 }}>
                <Typography textAlign='center'>Tasks</Typography>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId='droppable'>
                    {(provided, snapshot) => (
                      <Stack {...provided.droppableProps} ref={provided.innerRef}>
                        {milestone?.tasks?.map((task, index) => renderTask(task, index))}
                        {provided.placeholder}
                      </Stack>
                    )}
                  </Droppable>
                </DragDropContext>
                {isFetching && <Skeleton variant='rounded' width={'100%'} height={58} />}
                {startSelectionProcess && (
                  <Stack flexDirection='row' gap='1rem'>
                    <CustomSingleSelect
                      label='Existing step'
                      link='/step-templates'
                      field={{
                        value: selectedId,
                        onChange: (targetValue: number) => {
                          setSelectedId(targetValue);
                        },
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
                          setTasksIds([selectedId]);
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
                    ariaLabel='SpeedDial create Step'
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
                      icon={<AddCircleIcon />}
                      tooltipTitle='Add new'
                      onClick={() =>
                        mutateMilestones(
                          getUpdateTasks({ milestoneInd, tasks: [getTransformedTask()] })
                        )
                      }
                    />
                    <SpeedDialAction
                      icon={<AddBoxIcon />}
                      tooltipTitle='Add existing'
                      onClick={() => setStartSelectionProcess(true)}
                    />
                  </SpeedDial>
                )}
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>
      )}
    </Draggable>
  );
}
