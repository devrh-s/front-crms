import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Button, SpeedDial, SpeedDialAction, Stack } from '@mui/material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { Dispatch, useCallback, useMemo, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { IStep } from '../types';
import Step from './Step';

interface ITaskTemplateStepsProps {
  fullScreen: boolean;
  steps: IStep[];
  errors: any;
  commonData: ICommonData;
  taskTemplateId?: number;
  clearErrors: (error?: any) => void;
  handleSetModal: (data: IGuideType | null) => void;
  dispatch: Dispatch<any>;
}

export default function TaskTemplateSteps({
  steps,
  fullScreen,
  commonData,
  errors,
  clearErrors,
  handleSetModal,
  dispatch,
}: ITaskTemplateStepsProps) {
  const [startSelectionProcess, setStartSelectionProcess] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string>('');
  const step_templates = commonData.step_templates ?? [];

  const filteredStepTemplates = useMemo(() => {
    const stepTemplatesIds = new Set(steps.map((step) => step.id));

    return step_templates.filter((template) => !stepTemplatesIds.has(+template.id));
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
        clearErrors('step_templates');
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

  const renderStep = useCallback(
    (step: IStep, index: number) => {
      return (
        <Step
          key={step?.id}
          commonData={commonData}
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
    [errors]
  );

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
            label='Existing step template'
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
                const newStepTemplate = step_templates.find((el) => el?.id === selectedId);
                dispatch({
                  type: 'addNewStepFromTemplate',
                  payload: newStepTemplate,
                });
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
          {/* TODO: delete if not needed */}
          {/* <SpeedDialAction
            icon={<AddCircleIcon />}
            tooltipTitle='Add new'
            onClick={() => dispatch({ type: 'addNewStep' })}
          /> */}
        </SpeedDial>
      )}
    </Stack>
  );
}
