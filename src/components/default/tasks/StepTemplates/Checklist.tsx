import { Box, IconButton, Paper, Typography } from '@mui/material';
import { Dispatch, MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
// import Guide from "./Guide";
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Draggable } from 'react-beautiful-dnd';
import { IChecklistItem } from '../Tasks/types';

interface IChecklistProps {
  checklist: IChecklistItem;
  commonData: ICommonData;
  fullScreen: boolean;
  index: number;
  errors: any;
  dispatch: Dispatch<any>;
}

interface IFormInputs {
  placement_id: number | string;
}

export default function Checklist({
  index,
  fullScreen,
  commonData,
  errors,
  checklist,
  dispatch,
}: IChecklistProps) {
  const [checklistName, setchecklistName] = useState('');
  const [placementId, setPlacementId] = useState<number | string>('');
  const isInvalid = useMemo(() => {
    if (!errors) return false;
    return !!Object.keys(errors).length;
  }, [errors]);
  const placements = commonData?.placements ?? [];

  const deleteChecklist = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      dispatch({
        type: 'deleteChecklist',
        payload: {
          checklistInd: index,
        },
      });
    },
    [index]
  );

  useEffect(() => {
    if (!checklistName && !placementId) {
      setchecklistName(checklist.name);
      setPlacementId(checklist.placement_id ?? '');
    }
  }, [checklist]);

  return (
    <Draggable key={checklist.id} draggableId={`${checklist.id}`} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          variant='elevation'
          elevation={1}
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '55px',
            border: '1px solid transparent',
          }}
        >
          <Box {...provided.dragHandleProps} display={'flex'} gap={1}>
            <DragIndicatorIcon />
            <Typography>
              {index + 1}.&nbsp;{checklist?.name}
            </Typography>
          </Box>

          <IconButton size='small' color='error' onClick={deleteChecklist}>
            <CloseIcon sx={{ width: '1rem', height: '1rem' }} />
          </IconButton>
        </Paper>
      )}
    </Draggable>
  );
}
