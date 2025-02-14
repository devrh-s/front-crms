import {
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Box,
} from '@mui/material';
import Modal from '@/components/default/common/modals/Modal/Modal';
import UserChip from '@/components/default/common/components/UserChip';
import GuideInfo from '../../components/GuideInfo';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChecklistsInfo from '../../components/ChecklistsInfo';

interface IGuideModalProps {
  step: IStep | null;
  open: boolean;
  handleSetModal: (data: IStep | null) => void;
}

export default function StepModal({ step, open, handleSetModal }: IGuideModalProps) {
  return (
    <Modal
      title={`Step: ${step?.name} (ID:${step?.id})`}
      open={open}
      handleClose={() => handleSetModal(null)}
    >
      {step?.assignee && (
        <Stack
          flexDirection='row'
          gap={'1rem'}
          alignItems={'center'}
          sx={{ padding: '0 1rem', pb: '1rem' }}
        >
          <Typography>Assignee: </Typography>
          <UserChip
            data={step?.assignee}
            sx={{
              fontSize: '1rem',
              textTransform: 'capitalize',
              fontWeight: 500,
            }}
          />
        </Stack>
      )}
      <Stack gap='1rem'>
        <ChecklistsInfo data={step?.checklists ? step.checklists : []} />
      </Stack>
    </Modal>
  );
}
