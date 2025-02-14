import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useContext, MouseEvent, useMemo } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TasksContext } from '../contexts/tasksContext';
import ChecklistInputs from './ChecklistInputs';
import { Draggable } from 'react-beautiful-dnd';
import { Controller, Control } from 'react-hook-form';
import type { IChecklistSave } from '../types/types';

interface IChecklistProps {
  checklist: IChecklistSave;
  index: number;
  milestoneInd?: number;
  taskInd?: number;
  stepInd: number;
  commonData: ICommonData;
  control: Control<any>;
  errors: any;
}

export default function Checklist({
  checklist,
  index,
  milestoneInd,
  taskInd,
  stepInd,
  commonData,
  control,
  errors,
}: IChecklistProps) {
  const {
    elems,
    mutateElemsList: mutateTasks,
    generateNameKeys,
    actionOptions: { getDeleteChecklist },
  } = useContext(TasksContext);
  const isInvalid = useMemo(() => {
    if (!errors) return false;
    return !!Object.keys(errors).length;
  }, [errors]);

  const nameKeys = useMemo(
    () =>
      generateNameKeys({
        level: 'checklists',
        indexes: [milestoneInd, taskInd, stepInd, index],
        keys: ['name', 'placement_id'],
      }),
    [milestoneInd, taskInd, stepInd, index]
  );

  const deleteChecklistItem = (e: MouseEvent) => {
    e.stopPropagation();
    mutateTasks(getDeleteChecklist({ stepInd, taskInd, milestoneInd, checklistInd: index }));
  };

  return (
    <Draggable key={checklist.id} draggableId={`${checklist.id}`} index={index}>
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
                      {index + 1}.&nbsp;{value}
                    </Typography>
                  );
                }}
              />
            </Stack>
            <IconButton size='small' color='error' onClick={deleteChecklistItem}>
              <CloseIcon sx={{ width: '1rem', height: '1rem' }} />
            </IconButton>
          </AccordionSummary>
          <AccordionDetails>
            <Stack gap='1rem'>
              <ChecklistInputs
                checklist={checklist}
                control={control}
                commonData={commonData}
                index={index}
                nameKeys={nameKeys}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}
    </Draggable>
  );
}
