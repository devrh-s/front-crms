import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import { apiGetData } from '@/lib/fetch';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Button, SpeedDial, SpeedDialAction, Stack } from '@mui/material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { useQuery } from '@tanstack/react-query';
import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { IStep } from '../types';
import Step from './Step';

interface ITaskStepsProps {
  stepsIds: number[];
  isUpdate: boolean;
  fullScreen: boolean;
  steps: IStep[];
  errors: any;
  visible: boolean;
  assignees: number[];
  commonData: ICommonData;
  taskTemplateId?: number;
  clearErrors: (error?: any) => void;
  handleSetModal: (data: IGuideType | null) => void;
  dispatch: Dispatch<any>;
}

interface IStepsData {
  ids: number[];
  status: 'set-steps' | 'add-existing-step';
}

async function getStepTemplates(stepsIds: number[], isUpdate = false) {
  const results = (await Promise.allSettled(
    stepsIds.map((id) =>
      apiGetData(isUpdate ? `steps/${id}?isShort=1` : `step-templates/${id}?createTask=1`)
    )
  )) as IParallelResult[];
  return results;
}

const initialStepsData: IStepsData = { ids: [], status: 'set-steps' };

export default function TaskSteps({
  steps,
  stepsIds,
  fullScreen,
  commonData,
  isUpdate,
  assignees,
  visible,
  taskTemplateId,
  errors,
  clearErrors,
  handleSetModal,
  dispatch,
}: ITaskStepsProps) {
  const [startSelectionProcess, setStartSelectionProcess] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string>('');
  const [stepsData, setStepsData] = useState<IStepsData>(initialStepsData);
  const step_templates = commonData.step_templates ?? [];
  const { data } = useQuery({
    queryKey: [`task-steps-${taskTemplateId}`, stepsData.ids, isUpdate],
    queryFn: async () => {
      const response = await getStepTemplates(stepsData.ids, isUpdate);
      return response.map((el) => el.value.data);
    },
    refetchOnWindowFocus: false,
    enabled: visible && !!stepsData.ids?.length,
  });

  const filteredSteps = useMemo(() => {
    const stepsIds = new Set(steps.map((step) => step.id));
    return step_templates.filter((template) => !stepsIds.has(+template.id));
  }, [step_templates, steps.length]);

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
        clearErrors('steps');
      }
      dispatch({
        type: 'moveStep',
        payload: {
          sourceIndex: result.source.index,
          destIndex: result.destination.index,
        },
      });
    },
    [errors]
  );

  const clearStepsData = () => setStepsData(initialStepsData);

  const renderStep = useCallback(
    (step: IStep, index: number) => {
      return (
        <Step
          key={step?.id}
          commonData={commonData}
          assignees={assignees}
          fullScreen={fullScreen}
          index={index}
          handleSetModal={handleSetModal}
          dispatch={dispatch}
          errors={errors[index]}
          clearErrors={clearErrors}
          step={step}
        />
      );
    },
    [errors, assignees]
  );

  useEffect(() => {
    setStepsData({ ids: stepsIds, status: 'set-steps' });
  }, [stepsIds]);

  useEffect(() => {
    if (data) {
      if (stepsData.status === 'set-steps') {
        dispatch({ type: 'setSteps', payload: data });
      } else {
        dispatch({ type: 'addExistingStep', payload: data });
      }
      clearStepsData();
    }
  }, [data]);

  return (
    <Stack gap='.8rem'>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='droppable'>
          {(provided, snapshot) => (
            <Stack {...provided.droppableProps} ref={provided.innerRef}>
              {steps.map((step, index) => renderStep(step, index))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
      {startSelectionProcess && (
        <Stack flexDirection='row' gap='1rem'>
          <CustomSingleSelect
            label='Existing steps'
            link='/step-templates'
            field={{
              value: selectedId,
              onChange: (targetValue: number) => {
                setSelectedId(targetValue);
              },
            }}
            options={filteredSteps}
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
                setStepsData(() => ({ ids: [selectedId], status: 'add-existing-step' }));
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
            icon={<AddBoxIcon />}
            tooltipTitle='Add existing'
            onClick={() => setStartSelectionProcess(true)}
          />
          <SpeedDialAction
            icon={<AddCircleIcon />}
            tooltipTitle='Add new'
            onClick={() => dispatch({ type: 'addNewStep' })}
          />
        </SpeedDial>
      )}
    </Stack>
  );
}
