import MoreChips from '@/components/default/common/components/MoreChips';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EditIcon from '@mui/icons-material/Edit';
import LowPriorityIcon from '@mui/icons-material/LowPriority';
import PendingIcon from '@mui/icons-material/Pending';
import PeopleIcon from '@mui/icons-material/People';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import { Box, Collapse, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { darkenColor } from './helpers';
import ShowMoreBox from './ShowMoreBox';
import { Task } from './types';

export default function Card({
  title,
  color,
  assignees,
  controllers,
  count_completed_steps,
  count_edits,
  count_incompleted_steps,
  priority,
  is_completed,
  id,
  setIdProfile,
}: Task) {
  const [showMore, setShowMore] = useState(false);

  return (
    <Stack
      bgcolor={darkenColor(color)}
      borderRadius={'0.5rem'}
      padding={'0.5rem'}
      width={'100%'}
      gap={1}
    >
      <Box display={'flex'} gap={1}>
        <Typography
          fontWeight={'bold'}
          onClick={() => setIdProfile(id)}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          {title}
        </Typography>
        {is_completed === 1 && <DoneIcon />}
      </Box>

      <Stack direction={'row'} justifyContent={'space-between'} gap={1}>
        <Box display={'flex'} gap={'0.5rem'}>
          <PeopleIcon />
          <Typography>Assignees:</Typography>
        </Box>
        <MoreChips data={assignees} labelStyle={{ color: 'white' }} />
      </Stack>

      <Collapse in={showMore} timeout='auto' unmountOnExit>
        <Stack direction={'row'} justifyContent={'space-between'} gap={1}>
          <Box display={'flex'} gap={'0.5rem'}>
            <PeopleIcon />
            <Typography>Controllers:</Typography>
          </Box>
          <MoreChips data={controllers} labelStyle={{ color: 'white' }} />
        </Stack>

        <Stack direction={'row'} gap={1}>
          <Box display={'flex'} gap={'0.5rem'}>
            <DoneAllIcon />
            <Typography>Completed steps:</Typography>
          </Box>
          <Typography>{count_completed_steps}</Typography>
        </Stack>

        <Stack direction={'row'} gap={1}>
          <Box display={'flex'} gap={'0.5rem'}>
            <EditIcon />
            <Typography>Edits:</Typography>
          </Box>
          <Typography>{count_edits}</Typography>
        </Stack>

        <Stack direction={'row'} gap={1}>
          <Box display={'flex'} gap={'0.5rem'}>
            <PendingIcon />
            <Typography>Incomplete:</Typography>
          </Box>
          <Typography>{count_incompleted_steps}</Typography>
        </Stack>

        <Stack direction={'row'} gap={1}>
          <Box display={'flex'} gap={'0.5rem'}>
            {priority.name === 'Primary' ? <PriorityHighIcon /> : <LowPriorityIcon />}
            <Typography>Priority:</Typography>
          </Box>
          <Typography>{priority.name}</Typography>
        </Stack>
      </Collapse>

      <ShowMoreBox showMore={showMore} setShowMore={setShowMore} />
    </Stack>
  );
}
