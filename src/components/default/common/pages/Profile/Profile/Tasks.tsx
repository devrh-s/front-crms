import { useState, MouseEvent } from 'react';
import {
  Box,
  Stack,
  Grow,
  Card,
  CardContent,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  Theme,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DoneIcon from '@mui/icons-material/Done';
import AssignmentIcon from '@mui/icons-material/Assignment';

interface ITaskProps {
  last?: boolean;
  collapsed?: boolean;
  tasks: Array<ITask>;
  title: string;
}

interface ITaskCard {
  task: ITask;
  last?: boolean;
  collapsed?: boolean;
}

function TaskCard({ last, task, collapsed }: ITaskCard) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const getTaskWidth = () => {
    if (!collapsed) return mdDown ? 275 : 325;
    return 360;
  };
  return (
    <Grow in>
      <Card
        className={mdDown ? 'mobile' : ''}
        sx={{
          width: getTaskWidth(),
          borderBottom: `7px solid ${last ? '#21F368' : '#1976d2'}`,
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            padding: '.5rem 1rem',
            flexDirection: 'column',
            gap: '.5rem',
          }}
        >
          <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
            <Typography
              color='primary'
              sx={{
                fontSize: '20px',
                fontWeight: '600',
              }}
            >
              {task?.title}
            </Typography>
            <IconButton
              aria-label='more'
              id='long-button'
              aria-controls={open ? 'long-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-haspopup='true'
              onClick={handleClick}
            >
              <MoreVertIcon color='primary' />
            </IconButton>
            <Menu
              id='long-menu'
              MenuListProps={{
                'aria-labelledby': 'long-button',
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              {!last && (
                <MenuItem>
                  <DoneIcon color='success' /> Done
                </MenuItem>
              )}
              {last && (
                <MenuItem>
                  <AssignmentIcon color='primary' /> Assigned
                </MenuItem>
              )}
            </Menu>
          </Stack>
          <Typography>{task.note}</Typography>
          <Stack flexDirection='row' justifyContent='space-between'>
            {/* <Typography>Assigned By: {task.assigned_by.name}</Typography> */}
            <Typography sx={{ color: task.status.color }} textTransform='capitalize'>
              {task.status.name}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function Tasks({ last, title, tasks, collapsed }: ITaskProps) {
  const xlDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('xl'));
  const getConainerWidth = () => {
    if (!collapsed) return xlDown ? '50%' : '33.333%';
    return '100%';
  };
  return (
    <Box
      flexGrow={1}
      className='customScroll'
      sx={{
        width: getConainerWidth(),
        minWidth: 0,
        height: 'calc(100dvh - 48px - 32px - 64px)',
        paddingBottom: '1rem',
        borderRight: last ? 0 : 1,
        borderColor: 'divider',
        position: 'relative',
        overflow: 'auto',
      }}
    >
      {!collapsed && (
        <Typography
          variant='h5'
          textAlign='center'
          sx={{
            marginBottom: '1rem',
          }}
        >
          {title}
        </Typography>
      )}
      <Stack gap='1rem' alignItems='center'>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} last={last} collapsed />
        ))}
      </Stack>
    </Box>
  );
}
