import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import { debounce } from '@/lib/helpers';
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
  TextField,
  Typography,
} from '@mui/material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { Dispatch, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import Step from './Step';

interface IStepProps {
  taskTemplate: ITaskTemplate;
  taskInd: number;
  commonData: ICommonData;
  fullScreen: boolean;
  errors: any;
  clearErrors: (error?: any) => void;
  handleSetModal: (data: IGuideType | null) => void;
  dispatch: Dispatch<any>;
}

export default function TaskTemplate({
  taskTemplate,
  taskInd,
  commonData,
  fullScreen,
  errors,
  clearErrors,
  handleSetModal,
  dispatch,
}: IStepProps) {
  const [startSelectionProcess, setStartSelectionProcess] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string>('');

  const step_templates = commonData?.step_templates ?? [];

  const filteredStepTemplates = useMemo(() => {
    const stepTemplatesIds = new Set(taskTemplate.step_templates.map((step) => step.id));

    return step_templates.filter((template) => !stepTemplatesIds.has(+template.id));
  }, [step_templates, taskTemplate.step_templates.length]);

  const isInvalid = useMemo(() => {
    if (!errors) return false;
    return !!Object.keys(errors).length;
  }, [errors]);

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
        type: 'moveStepTemplate',
        payload: {
          taskInd,
          sourceIndex: result.source.index,
          destIndex: result.destination.index,
        },
      });
    },
    [taskInd, errors]
  );

  const renderStep = useCallback(
    (step: IStepTemplate, ind: number) => {
      return (
        <Step
          key={step?.id}
          commonData={commonData}
          fullScreen={fullScreen}
          taskInd={taskInd}
          stepInd={ind}
          handleSetModal={handleSetModal}
          dispatch={dispatch}
          errors={errors?.step_templates?.[ind] ?? []}
          clearErrors={clearErrors}
          step={step}
        />
      );
    },
    [taskInd, errors]
  );

  const deleteTaskTemplate = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      dispatch({
        type: 'deleteTaskTemplate',
        payload: {
          taskInd,
        },
      });
    },
    [taskInd]
  );

  return (
    <Draggable key={taskTemplate?.id} draggableId={`${taskTemplate?.id}`} index={taskInd}>
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
              <Typography>
                {taskInd + 1}.&nbsp;{taskTemplate?.name}
              </Typography>
            </Stack>
            <IconButton size='small' color='error' onClick={deleteTaskTemplate}>
              <CloseIcon sx={{ width: '1rem', height: '1rem' }} />
            </IconButton>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <TextField
              defaultValue={taskTemplate.name}
              variant='standard'
              error={!!errors?.name}
              disabled
              helperText={errors?.name ? errors.name?.message : ''}
              InputLabelProps={{ shrink: true }}
              label={`Name of Task Template ${taskInd + 1}`}
              sx={{
                width: '100%',
              }}
            />
            <Stack gap='.8rem' sx={{ paddingLeft: fullScreen ? '2rem' : 0 }}>
              <Typography textAlign='center'>Step Templates</Typography>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId='droppable'>
                  {(provided, snapshot) => (
                    <Stack {...provided.droppableProps} ref={provided.innerRef}>
                      {taskTemplate?.step_templates.map((step, index) => renderStep(step, index))}
                      {provided.placeholder}
                    </Stack>
                  )}
                </Droppable>
              </DragDropContext>
              {startSelectionProcess && (
                <Stack flexDirection='row' gap='1rem'>
                  <CustomSingleSelect
                    label='Existing step template'
                    link='/step-template'
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
                          type: 'addNewStepTemplate',
                          payload: { taskInd: taskInd, newStepTemplate },
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
