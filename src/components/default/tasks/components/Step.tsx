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
  Button,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  Stack,
  Skeleton,
  Typography,
} from '@mui/material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { useContext, useEffect, MouseEvent, useCallback, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import StepInputs from './StepInputs';
import { Control, Controller } from 'react-hook-form';
import { TasksContext } from '../contexts/tasksContext';
import { useQuery } from '@tanstack/react-query';
import Checklist from './Checklist';
import { getTransformedChecklist } from '../helpers';
import { apiGetData } from '@/lib/fetch';
import { IStepSave } from '../types/types';
import { IChecklistSave } from '../types/types';

interface IStepProps {
  step: IStepSave;
  taskInd?: number;
  stepInd: number;
  commonData: ICommonData;
  fullScreen: boolean;
  milestoneInd?: number;
  errors?: any;
  control: Control<any>;
  selectedUsers: IOption[];
  clearErrors: (error?: any) => void;
}

async function getChecklistItems(checklistItemsIds: Array<string | number>) {
  const results = (await Promise.allSettled(
    checklistItemsIds.map((id) => apiGetData(`checklist-items/${id}`))
  )) as IParallelResult[];
  return results;
}

export default function Step({
  milestoneInd,
  taskInd,
  stepInd,
  step,
  commonData,
  fullScreen,
  errors,
  control,
  selectedUsers,
  clearErrors,
}: IStepProps) {
  const [startSelectionProcess, setStartSelectionProcess] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string>('');
  const [checklistItemsIds, setChecklistItemsIds] = useState<number[]>([]);
  const {
    elems: tasks,
    mutateElemsList: mutateTasks,
    generateNameKeys,
    actionOptions: { getDeleteStep, getUpdateChecklists, getMoveChecklist },
  } = useContext(TasksContext);
  const checklist_items = commonData?.checklist_items ?? [];

  const { data, isFetching } = useQuery({
    queryKey: ['tasks-checklist-items', checklistItemsIds],
    queryFn: async () => {
      const response = await getChecklistItems(checklistItemsIds);
      return response.map((el) => el.value.data);
    },
    refetchOnWindowFocus: false,
    enabled: !!checklistItemsIds?.length,
  });

  const filteredChecklistItems = useMemo(() => {
    const checklistItemsIds = new Set(
      step.checklists.map((item: IChecklistSave) => item.checklist_item_id)
    );
    return checklist_items.filter((item) => !checklistItemsIds.has(+item.id));
  }, [checklist_items, step.checklists?.length]);

  const isInvalid = useMemo(() => {
    if (!errors) return false;
    return !!Object.keys(errors).length;
  }, [errors]);

  const nameKeys = useMemo(
    () =>
      generateNameKeys({
        level: 'steps',
        indexes: [milestoneInd, taskInd, stepInd],
        keys: ['name', 'assignee_id'],
      }),
    [milestoneInd, taskInd, stepInd]
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
      if (errors?.checklists?.length) {
        clearErrors();
      }
      mutateTasks(
        getMoveChecklist({
          taskInd,
          stepInd,
          milestoneInd,
          sourceInd: source.index,
          destInd: destination.index,
          elems: tasks,
        })
      );
    },
    [milestoneInd, taskInd, stepInd, tasks, errors]
  );

  const renderChecklist = (checklist: IChecklistSave, ind: number) => {
    return (
      <Checklist
        key={checklist?.id}
        index={ind}
        milestoneInd={milestoneInd}
        taskInd={taskInd}
        stepInd={stepInd}
        checklist={checklist}
        commonData={commonData}
        control={control}
        errors={errors?.checklists?.[ind] ?? []}
      />
    );
  };

  const deleteStep = (e: MouseEvent) => {
    e.stopPropagation();
    mutateTasks(getDeleteStep({ milestoneInd, taskInd, stepInd }));
  };

  useEffect(() => {
    if (data) {
      const newChecklists = data.map((checklist) => getTransformedChecklist(checklist));
      mutateTasks(
        getUpdateChecklists({ taskInd, stepInd, milestoneInd, checklists: newChecklists })
      );
      setChecklistItemsIds([]);
    }
  }, [data]);

  return (
    <Draggable key={step?.id} draggableId={`${step?.id}`} index={stepInd}>
      {(provided, snapshot) => (
        <Accordion
          ref={provided.innerRef}
          {...provided.draggableProps}
          sx={{
            border: `1px solid ${isInvalid ? 'red' : 'transparent'}`,
            borderRadius: '4px',
          }}
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
                      {stepInd + 1}.&nbsp;{value}
                    </Typography>
                  );
                }}
              />
            </Stack>
            <IconButton size='small' color='error' onClick={deleteStep}>
              <CloseIcon sx={{ width: '1rem', height: '1rem' }} />
            </IconButton>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <StepInputs
              control={control}
              selectedUsers={selectedUsers}
              index={stepInd}
              nameKeys={nameKeys}
            />
            <Stack gap='.8rem' sx={{ paddingLeft: fullScreen ? '2rem' : 0 }}>
              <Typography textAlign='center'>Checklist Items</Typography>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId='droppable'>
                  {(provided, snapshot) => (
                    <Stack {...provided.droppableProps} ref={provided.innerRef}>
                      {step.checklists?.map((checklist, index) =>
                        renderChecklist(checklist, index)
                      )}
                      {provided.placeholder}
                    </Stack>
                  )}
                </Droppable>
              </DragDropContext>
              {isFetching && <Skeleton variant='rounded' width={'100%'} height={58} />}
              {startSelectionProcess && (
                <Stack flexDirection='row' gap='1rem'>
                  <CustomSingleSelect
                    label='Existing checklist item'
                    link='/checklist-items'
                    field={{
                      value: selectedId,
                      onChange: (targetValue: number) => {
                        setSelectedId(targetValue);
                      },
                    }}
                    options={filteredChecklistItems}
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
                        setChecklistItemsIds([selectedId]);
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
                  ariaLabel='SpeedDial create Step Template'
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
                        getUpdateChecklists({
                          milestoneInd,
                          taskInd,
                          stepInd,
                          checklists: [getTransformedChecklist()],
                        })
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
          </AccordionDetails>
        </Accordion>
      )}
    </Draggable>
  );
}
