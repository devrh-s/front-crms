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
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import ListIcon from '@mui/icons-material/List';
import { useContext, useEffect, MouseEvent, useCallback, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import TaskInputs from './TaskInputs';
import { Control, Controller } from 'react-hook-form';
import { TasksContext } from '../contexts/tasksContext';
import { apiGetData } from '@/lib/fetch';
import { getTransformedStep } from '../helpers';
import { useQuery } from '@tanstack/react-query';
import CustomErrorTooltip from '@/components/default/common/components/CustomErrorTooltip';
import Step from './Step';
import { IStepSave, ITaskSave } from '../types/types';

interface ITaskProps {
  task: ITaskSave;
  taskInd: number;
  milestoneInd?: number;
  commonData: ICommonData;
  fullScreen: boolean;
  errors: any;
  control: Control<any>;
  clearErrors: (error?: any) => void;
}

async function getStepTemplates(stepTemplatesIds: Array<string | number>) {
  const results = (await Promise.allSettled(
    stepTemplatesIds.map((id) => apiGetData(`step-templates/${id}`))
  )) as IParallelResult[];
  return results;
}

export default function Task({
  task,
  milestoneInd,
  taskInd,
  commonData,
  fullScreen,
  errors,
  control,
  clearErrors,
}: ITaskProps) {
  const [startSelectionProcess, setStartSelectionProcess] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string>('');
  const [stepsIds, setStepsIds] = useState<number[]>([]);
  const [slectedUsers, setSelectedUsers] = useState<IOption[]>([]);
  const [editSteps, setEditSteps] = useState(false);
  const {
    elems: tasks,
    mutateElemsList: mutateTasks,
    generateNameKeys,
    actionOptions: { getDeleteTask, getUpdateSteps, getMoveStep },
  } = useContext(TasksContext);

  const users = commonData?.users ?? [];
  const step_templates = commonData?.step_templates ?? [];

  const filteredStepTemplates = useMemo(() => {
    const stepTemplatesIds = new Set(task.steps.map((item: IStepSave) => item.step_template_id));
    return step_templates.filter((item) => !stepTemplatesIds.has(+item.id));
  }, [step_templates, task.steps?.length]);

  const { data, isFetching } = useQuery({
    queryKey: ['tasks-step-templates', stepsIds],
    queryFn: async () => {
      const response = await getStepTemplates(stepsIds);
      return response.map((el) => el.value.data);
    },
    refetchOnWindowFocus: false,
    enabled: !!stepsIds?.length,
  });

  const isInvalid = useMemo(() => {
    if (!errors) return false;
    return !!Object.keys(errors).length;
  }, [errors]);

  const nameKeys = useMemo(
    () =>
      generateNameKeys({
        level: 'tasks',
        indexes: [milestoneInd, taskInd],
        keys: [
          'title',
          'status_id',
          'priority_id',
          'parent_tasks',
          'start_date',
          'due_date',
          'professions',
          'assignees',
          'controllers',
          'note',
        ],
      }),
    [milestoneInd, taskInd]
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
      if (errors?.steps?.length) {
        clearErrors();
      }
      mutateTasks(
        getMoveStep({
          sourceInd: source.index,
          destInd: destination.index,
          taskInd,
          milestoneInd,
          elems: tasks,
        })
      );
    },
    [tasks, milestoneInd, taskInd, errors]
  );

  const selectAssignees = useCallback(
    async (assigneesIds: number[]) => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      const selectedAssignees = users.filter((el) => assigneesIds.includes(+el.id));
      setSelectedUsers(selectedAssignees);
    },
    [users]
  );

  const renderStep = (step: IStepSave, ind: number) => {
    return (
      <Step
        key={step?.id}
        commonData={commonData}
        fullScreen={fullScreen}
        selectedUsers={slectedUsers}
        milestoneInd={milestoneInd}
        taskInd={taskInd}
        stepInd={ind}
        control={control}
        errors={errors?.steps?.[ind] ?? []}
        clearErrors={clearErrors}
        step={step}
      />
    );
  };

  const handleEdit = (e: MouseEvent) => {
    e.stopPropagation();
    setEditSteps(true);
  };

  const deleteTask = (e: MouseEvent) => {
    e.stopPropagation();
    mutateTasks(getDeleteTask({ milestoneInd, taskInd }));
  };

  useEffect(() => {
    if (task.assignees && JSON.stringify(task.assignees) !== JSON.stringify(slectedUsers)) {
      selectAssignees(task.assignees);
    }
  }, [JSON.stringify(task.assignees)]);

  useEffect(() => {
    if (data) {
      const newSteps = data.map((step) => getTransformedStep(step));
      mutateTasks(getUpdateSteps({ milestoneInd, taskInd, steps: newSteps }));
      setStepsIds([]);
    }
  }, [data]);

  return (
    <Draggable key={task?.id} draggableId={`${task?.id}`} index={taskInd}>
      {(provided) => (
        <Accordion
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            border: `1px solid ${isInvalid ? 'red' : 'transparent'}`,
            borderRadius: '4px',
          }}
          onChange={() => setEditSteps(false)}
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
                name={nameKeys.title}
                control={control}
                render={({ field: { value }, fieldState: { error } }) => {
                  return (
                    <Typography>
                      {taskInd + 1}.&nbsp;{value}
                    </Typography>
                  );
                }}
              />
            </Stack>
            <Stack flexDirection='row'>
              <CustomErrorTooltip open={!!errors?.steps?.length} errorText='Invalid step data'>
                <Tooltip title='Edit step'>
                  <IconButton
                    size='small'
                    color={errors?.steps?.length ? 'error' : 'success'}
                    onClick={handleEdit}
                  >
                    <ListIcon sx={{ width: '1rem', height: '1rem' }} />
                  </IconButton>
                </Tooltip>
              </CustomErrorTooltip>
              <IconButton size='small' color='error' onClick={deleteTask}>
                <CloseIcon sx={{ width: '1rem', height: '1rem' }} />
              </IconButton>
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <TaskInputs
              visible
              control={control}
              commonData={commonData}
              fullScreen={fullScreen}
              selectAssignees={selectAssignees}
              nameKeys={nameKeys}
              usersOptional
            />
            {editSteps && (
              <Stack gap='.8rem' sx={{ paddingLeft: fullScreen ? '2rem' : 0 }}>
                <Typography textAlign='center'>Steps</Typography>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId='droppable'>
                    {(provided, snapshot) => (
                      <Stack {...provided.droppableProps} ref={provided.innerRef}>
                        {task?.steps?.map((step, index) => renderStep(step, index))}
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
                      options={filteredStepTemplates}
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
                          setStepsIds([selectedId]);
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
                        mutateTasks(
                          getUpdateSteps({ milestoneInd, taskInd, steps: [getTransformedStep()] })
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
