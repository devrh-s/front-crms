import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Dispatch, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import MoreChips from '@/components/default/common/components/MoreChips';
import { debounce } from '@/lib/helpers';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Draggable } from 'react-beautiful-dnd';

interface IChecklistProps {
  checklist: IChecklistItemType;
  index: number;
  taskInd: number;
  stepInd: number;
  errors: any;
  handleSetModal: (data: IGuideType | null) => void;
  dispatch: Dispatch<any>;
}

export default function Checklist({
  checklist,
  index,
  taskInd,
  stepInd,
  errors,
  handleSetModal,
  dispatch,
}: IChecklistProps) {
  const isInvalid = useMemo(() => {
    if (!errors) return false;
    return !!Object.keys(errors).length;
  }, [errors]);

  const deleteChecklistItem = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      dispatch({
        type: 'deleteChecklistItem',
        payload: {
          taskInd,
          stepInd,
          checklistInd: index,
        },
      });
    },
    [taskInd, stepInd, index]
  );

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
              <Typography>
                {index + 1}.&nbsp;{checklist?.name}
              </Typography>
            </Stack>
            <IconButton size='small' color='error' onClick={deleteChecklistItem}>
              <CloseIcon sx={{ width: '1rem', height: '1rem' }} />
            </IconButton>
          </AccordionSummary>
          <AccordionDetails>
            <Stack gap='1rem'>
              <TextField
                defaultValue={checklist.name}
                variant='standard'
                InputLabelProps={{ shrink: true }}
                label={`Name of Checklist Item ${index + 1}`}
                error={!!errors?.name}
                disabled
                helperText={errors?.name ? errors.name?.message : ''}
                sx={{
                  width: '100%',
                }}
              />
              <Stack sx={{ padding: '0 0 1rem' }}>
                <MoreChips
                  data={checklist.guides}
                  propName='name'
                  handleSetModal={handleSetModal}
                />
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}
    </Draggable>
  );
}
