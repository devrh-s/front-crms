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
import { IChecklistItem, IStep } from '../types';
import Checklist from './Checklist';

interface IStepProps {
  step: IStep;
  index: number;
  commonData: ICommonData;
  fullScreen: boolean;
  errors: any;
  clearErrors: (error?: any) => void;
  handleSetModal: (data: IGuideType | null) => void;
  dispatch: Dispatch<any>;
}

export default function Step({
  index,
  step,
  commonData,
  fullScreen,
  errors,
  clearErrors,
  handleSetModal,
  dispatch,
}: IStepProps) {
  const [startSelectionProcess, setStartSelectionProcess] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string>('');
  const [stepName, setStepName] = useState('');

  const checklist_items = commonData?.checklist_items ?? [];

  const filteredChecklistItems = useMemo(() => {
    const checklistItemsIds = new Set(step?.checklist_items?.map((item) => item?.id));

    return checklist_items.filter((item) => !checklistItemsIds.has(+item.id));
  }, [checklist_items, step?.checklist_items?.length]);

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
        type: 'moveChecklist',
        payload: {
          stepInd: index,
          sourceIndex: result.source.index,
          destIndex: result.destination.index,
        },
      });
    },
    [index, errors]
  );

  const renderChecklist = useCallback(
    (checklist: IChecklistItem, ind: number) => {
      return (
        <Checklist
          key={checklist?.id}
          index={ind}
          stepInd={index}
          checklist={checklist}
          handleSetModal={handleSetModal}
          errors={errors?.checklists?.[ind] ?? []}
          dispatch={dispatch}
        />
      );
    },
    [index, errors]
  );

  const updateStep = useCallback(
    debounce(
      ({ stepName, index }: any) =>
        dispatch({
          type: 'editStep',
          payload: {
            stepInd: index,
            name: stepName,
          },
        }),
      500
    ),
    []
  );

  const deleteSteps = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      dispatch({
        type: 'deleteStep',
        payload: {
          stepInd: index,
        },
      });
    },
    [index]
  );

  useEffect(() => {
    updateStep({ stepName, index });
  }, [stepName]);

  useEffect(() => {
    if (!stepName) {
      setStepName(step?.name);
    }
  }, [step]);

  return (
    <Draggable key={step?.id} draggableId={`${step?.id}`} index={index}>
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
                {index + 1}.&nbsp;{step?.name}
              </Typography>
            </Stack>
            <IconButton size='small' color='error' onClick={deleteSteps}>
              <CloseIcon sx={{ width: '1rem', height: '1rem' }} />
            </IconButton>
          </AccordionSummary>
          <AccordionDetails sx={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <TextField
              value={stepName}
              onChange={(e) => setStepName(e.target.value)}
              variant='standard'
              error={!!errors?.name}
              // required
              disabled
              helperText={errors?.name ? errors.name?.message : ''}
              InputLabelProps={{ shrink: true }}
              label={`Name of Step Template ${index + 1}`}
              sx={{
                width: '100%',
              }}
            />
            <Stack gap='.8rem' sx={{ paddingLeft: fullScreen ? '2rem' : 0 }}>
              <Box textAlign='center'>
                <Typography
                  textAlign='center'
                  color={errors?.checklist_items ? 'error' : 'inherit'}
                  sx={{
                    fontSize: '1.2rem',
                  }}
                >
                  Checklist Items
                  <Typography
                    component='span'
                    color='error'
                    sx={{ marginLeft: '4px', fontSize: '1.2rem' }}
                  >
                    *
                  </Typography>
                </Typography>
                {errors?.checklist_items && (
                  <Typography
                    color='error'
                    sx={{
                      fontSize: '0.875rem',
                      marginTop: '4px',
                    }}
                  >
                    {errors?.checklist_items.message}
                  </Typography>
                )}
              </Box>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId='droppable'>
                  {(provided, snapshot) => (
                    <Stack {...provided.droppableProps} ref={provided.innerRef}>
                      {step?.checklist_items?.map((checklist, index) =>
                        renderChecklist(checklist, index)
                      )}
                      {provided.placeholder}
                    </Stack>
                  )}
                </Droppable>
              </DragDropContext>
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
                        const newChecklistitem = checklist_items.find(
                          (el) => el?.id === selectedId
                        );
                        dispatch({
                          type: 'addNewChecklist',
                          payload: { stepInd: index, newChecklistitem },
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
                    onClick={() =>
                      dispatch({
                        type: 'addNewChecklist',
                        payload: { stepInd: index },
                      })
                    }
                  /> */}
                </SpeedDial>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}
    </Draggable>
  );
}
