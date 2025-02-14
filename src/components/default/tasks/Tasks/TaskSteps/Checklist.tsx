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
// import Guide from "./Guide";
import MoreChips from '@/components/default/common/components/MoreChips';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import { debounce } from '@/lib/helpers';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Draggable } from 'react-beautiful-dnd';
import { IChecklistItem } from '../types';

interface IChecklistProps {
  checklist: IChecklistItem;
  commonData: ICommonData;
  fullScreen: boolean;
  index: number;
  stepInd: number;
  errors: any;
  handleSetModal: (data: IGuideType | null) => void;
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
  stepInd,
  handleSetModal,
  dispatch,
}: IChecklistProps) {
  const [checklistName, setchecklistName] = useState('');
  const [placementId, setPlacementId] = useState<number | string>('');
  const isInvalid = useMemo(() => {
    if (!errors) return false;
    return !!Object.keys(errors).length;
  }, [errors]);
  const placements = commonData?.placements ?? [];

  const updateChecklist = useCallback(
    debounce(({ checklistName, stepInd, index, placementId }: any) => {
      dispatch({
        type: 'editChecklist',
        payload: {
          stepInd,
          checklistInd: index,
          name: checklistName,
          placement_id: placementId,
        },
      });
    }, 500),
    []
  );

  const deleteChecklist = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      dispatch({
        type: 'deleteChecklist',
        payload: {
          stepInd,
          checklistInd: index,
        },
      });
    },
    [stepInd, index]
  );

  useEffect(() => {
    updateChecklist({ checklistName, stepInd, index, placementId });
  }, [checklistName, placementId]);

  useEffect(() => {
    if (!checklistName && !placementId) {
      setchecklistName(checklist.name);
      setPlacementId(checklist.placement_id ?? '');
    }
  }, [checklist]);

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
            <IconButton size='small' color='error' onClick={deleteChecklist}>
              <CloseIcon sx={{ width: '1rem', height: '1rem' }} />
            </IconButton>
          </AccordionSummary>
          <AccordionDetails>
            <Stack gap='1rem'>
              <TextField
                value={checklistName}
                onChange={(e) => setchecklistName(e.target.value)}
                variant='standard'
                InputLabelProps={{ shrink: true }}
                label={`Name of Checklist ${index + 1}`}
                error={!!errors?.name}
                required
                helperText={errors?.name ? errors.name?.message : ''}
                sx={{
                  width: '100%',
                }}
              />
              <CustomSingleSelect
                label='Placement'
                link='/placements'
                field={{
                  value: placementId,
                  onChange: (targetValue: number) => setPlacementId(targetValue),
                }}
                required
                options={placements}
                error={errors?.['placement_id'] ?? ''}
                style={{
                  minWidth: '100%',
                }}
              />
              {/* <CustomSingleSelect
                label='Placement'
                field={{
                  value: checklist.placement_id,
                  onChange: (targetValue: number) =>
                    updateChecklist({
                      checklistName: checklist.name,
                      stepInd,
                      index,
                      placementId: targetValue,
                    }),
                }}
                required
                options={placements}
                error={errors?.['placement_id'] ?? ''}
                style={{
                  minWidth: '100%',
                }}
              /> */}
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
