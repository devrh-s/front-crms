import {
  Menu,
  MenuList,
  MenuItem,
  ListItemIcon,
  Typography,
  Stack,
  Divider,
  Button,
  Fade,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiSetData } from '@/lib/fetch';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import TaskIcon from '@mui/icons-material/Task';
import DoneAllIcon from '@mui/icons-material/DoneAll';

interface INotification {
  id: string;
  data: string;
  link: string | null;
  type: string | null;
  read_at: string | null;
  created_at: string | null;
}

interface IAppNotificationsProps {
  open: boolean;
  notifications: Array<INotification>;
  fetchNextNotification: () => void;
  anchorEl: any;
  handleClose: any;
}

function getNotificationIcon(type: string | null) {
  switch (type) {
    case 'user':
      return <HowToRegIcon fontSize='small' sx={{ color: '#fff' }} />;
    case 'task':
      return <TaskIcon fontSize='small' sx={{ color: '#fff' }} />;
    default:
      return <AddAlertIcon fontSize='small' sx={{ color: '#fff' }} />;
  }
}

export default function AppNotifications({
  open,
  anchorEl,
  notifications,
  fetchNextNotification,
  handleClose,
}: IAppNotificationsProps) {
  const router = useRouter();

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (id?: string | null) => apiSetData(id ? `mark-as-read/${id}` : 'mark-as-read', {}),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['notifications'],
        });
      }
    },
  });

  const clickHandler = (notification: INotification) => {
    mutate(notification.id);
    if (notification?.link) {
      handleClose();
      router.push(notification.link);
    }
  };
  return (
    <Menu
      id='fade-notifications'
      MenuListProps={{
        'aria-labelledby': 'fade-button',
      }}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      anchorEl={anchorEl}
      open={!!notifications?.length && open}
      onClose={handleClose}
      TransitionComponent={Fade}
      slotProps={{
        paper: {
          className: 'customScroll',
          sx: {
            width: 375,
            maxHeight: '80%',
          },
        },
      }}
    >
      <Stack
        flexDirection='row'
        alignItems='center'
        justifyContent='space-between'
        sx={{ padding: '0rem .5rem .5rem' }}
      >
        <Typography fontWeight={500}>Notifications</Typography>
        <Button size='small' onClick={() => mutate(null)}>
          Mark all as read
        </Button>
      </Stack>
      <Divider />
      <MenuList>
        {notifications?.map((notification) => (
          <MenuItem
            key={notification?.id}
            sx={{
              padding: '.8rem',
              gap: '.5rem',
            }}
            onClick={() => clickHandler(notification)}
            divider
          >
            <ListItemIcon>
              <Stack
                sx={{
                  backgroundColor: '#90caf9',
                  padding: '.4rem',
                  borderRadius: '50%',
                }}
              >
                {getNotificationIcon(notification?.type)}
              </Stack>
            </ListItemIcon>
            <Stack sx={{ width: 'calc(100% - 2.4rem)' }}>
              <Typography variant='inherit' noWrap>
                {notification?.data}
              </Typography>
              <Stack flexDirection='row' alignItems='center' justifyContent='space-between'>
                <Typography sx={{ color: '#bdbdbd' }}>{notification?.created_at}</Typography>
                <Fade in={!!notification?.read_at}>
                  <DoneAllIcon color='success' />
                </Fade>
              </Stack>
            </Stack>
          </MenuItem>
        ))}
      </MenuList>
      <Stack>
        <Button onClick={() => fetchNextNotification()}>Show more</Button>
      </Stack>
    </Menu>
  );
}
