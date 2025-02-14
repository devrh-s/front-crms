'use client';
import ProfileActions from '@/components/default/talents/Users/UserActions';
import useActions from '@/hooks/useActions';
import { apiCommonData, apiGetData } from '@/lib/fetch';
import { getPagePermissions } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Theme,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import DoneOutlineOutlinedIcon from '@mui/icons-material/DoneOutlineOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import LocalAtmOutlinedIcon from '@mui/icons-material/LocalAtmOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import WebStoriesOutlinedIcon from '@mui/icons-material/WebStoriesOutlined';

interface TabPanelProps {
  index: string;
  value: string;
  user: IUser | null;
}

const commonDataBlocks = {
  currencies: 'currencies?is_group_similar=1&isShort=1&isCommon=1',
};

const getCommonData = () => apiCommonData(commonDataBlocks);

export default function ProfileTabPanel({ index, value, user }: TabPanelProps) {
  const { isAdmin, permissions } = useAuthStore();
  const xlDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('xl'));
  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const { actionsData, handleActions } = useActions();

  const { data, isPending } = useQuery({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      const response = await apiGetData(`users/${user?.id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: !!user?.id,
  });

  const pagePermissions = useMemo(
    () => getPagePermissions('Talents', 'Users', permissions),
    [permissions]
  );

  const { data: commonData } = useQuery({
    queryKey: ['users-common'],
    queryFn: async () => {
      const data = await getCommonData();
      return {
        ...data,
        availabilities: [
          { id: 'active', name: 'Active' },
          { id: 'inactive', name: 'Inactive' },
        ],
      };
    },
    refetchOnWindowFocus: false,
    placeholderData: {
      availabilities: [],
      currencies: [],
    },
  });

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
    >
      <ProfileActions
        id={actionsData.id}
        commonData={commonData}
        pagePermissions={pagePermissions}
        isProfile
        visible={actionsData.visible}
        handleActions={handleActions}
      />
      {data && (
        <Stack flexDirection='row' flexWrap='wrap'>
          <Stack
            sx={{
              width: '100%',
              height: 'calc(100dvh - 48px - 32px - 64px)',
              padding: '2rem 0 1rem',
            }}
          >
            <Stack
              flexDirection='row'
              justifyContent='center'
              alignItems='center'
              sx={{
                gap: '1.5rem',
                borderBottom: 1,
                borderColor: 'divider',
                paddingBottom: '2rem',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                }}
              >
                <Avatar src={data?.image} sx={{ width: 128, height: 128 }} />
                <Chip
                  label={data?.id}
                  sx={{
                    position: 'absolute',
                    backgroundColor: '#fff',
                    boxShadow: '0 0 3px #000',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    bottom: '-.5rem',
                    width: '4.5rem',
                    height: '1.5rem',
                  }}
                />
              </Box>
              <Typography variant='h5' color='primary' textTransform='capitalize'>
                {data?.name}
              </Typography>
            </Stack>
            <Stack
              flexDirection='column'
              justifyContent='flex-start'
              alignItems='center'
              gap='1rem'
            >
              <Stack flexDirection='row' alignItems='center' gap='1rem'>
                <Typography
                  sx={{
                    fontSize: '2rem',
                  }}
                >
                  Personal Info
                </Typography>
                <IconButton
                  aria-label='edit'
                  color='primary'
                  onClick={() => handleActions(true, data?.id)}
                >
                  <EditIcon />
                </IconButton>
              </Stack>
              <Stack flexDirection='column' gap='1rem' sx={{ padding: '1rem', width: '100%' }}>
                <Stack
                  flexDirection={smDown ? 'column' : 'row'}
                  alignItems={smDown ? 'flex-start' : 'center'}
                  gap='1rem'
                  justifyContent='flex-start'
                >
                  <Typography
                    sx={{
                      color: 'rgba(0,0,0, .6)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      flexBasis: '30%',
                      flexGrow: 0,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Tooltip title='Full Name'>
                      <PersonOutlineIcon />
                    </Tooltip>
                    Full Name
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: '500',
                      flexBasis: '70%',
                      textTransform: 'capitalize',
                      flexGrow: 0,
                      flexShrink: 0,
                    }}
                  >
                    {data?.name}
                  </Typography>
                </Stack>

                <Stack
                  flexDirection={smDown ? 'column' : 'row'}
                  alignItems={smDown ? 'flex-start' : 'center'}
                  gap='1rem'
                >
                  <Typography
                    sx={{
                      color: 'rgba(0,0,0, .6)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      flexBasis: '30%',
                      flexGrow: 0,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Tooltip title='Email'>
                      <MailOutlineIcon />
                    </Tooltip>
                    Email
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: '500',
                      flexBasis: '70%',
                      flexGrow: 0,
                      flexShrink: 0,
                      wordBreak: 'break-all',
                    }}
                  >
                    {data?.email}
                  </Typography>
                </Stack>

                <Stack
                  flexDirection={smDown ? 'column' : 'row'}
                  alignItems={smDown ? 'flex-start' : 'center'}
                  gap='1rem'
                >
                  <Typography
                    sx={{
                      color: 'rgba(0,0,0, .6)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      flexBasis: '30%',
                      flexGrow: 0,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Tooltip title='Availability'>
                      <EventAvailableOutlinedIcon />
                    </Tooltip>
                    Availability
                  </Typography>
                  <Typography
                    textTransform='capitalize'
                    sx={{
                      display: 'flex',
                      gap: '.5rem',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      color: data?.is_active === 'active' ? 'success.main' : 'error.main',
                    }}
                  >
                    {data?.is_active === 'active' ? (
                      <CheckCircleIcon fontSize='small' color='success' />
                    ) : (
                      <CancelIcon fontSize='small' color='error' />
                    )}
                    {data?.is_active}
                  </Typography>
                </Stack>

                <Stack
                  flexDirection={smDown ? 'column' : 'row'}
                  alignItems={smDown ? 'flex-start' : 'center'}
                  gap='1rem'
                >
                  <Typography
                    sx={{
                      color: 'rgba(0,0,0, .6)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      flexBasis: '30%',
                      flexGrow: 0,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Tooltip title='Task Assigned'>
                      <WebStoriesOutlinedIcon />
                    </Tooltip>
                    Task Assigned
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: '500',
                      flexBasis: '70%',
                      flexGrow: 0,
                      flexShrink: 0,
                    }}
                  >
                    {data?.task_assigned ?? 0}
                  </Typography>
                </Stack>

                <Stack
                  flexDirection={smDown ? 'column' : 'row'}
                  alignItems={smDown ? 'flex-start' : 'center'}
                  gap='1rem'
                >
                  <Typography
                    sx={{
                      color: 'rgba(0,0,0, .6)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      flexBasis: '30%',
                      flexGrow: 0,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Tooltip title='Task Done'>
                      <DoneOutlineOutlinedIcon />
                    </Tooltip>
                    Task Done
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: '500',
                      flexBasis: '70%',
                      flexGrow: 0,
                      flexShrink: 0,
                    }}
                  >
                    {data?.task_done ?? 0}
                  </Typography>
                </Stack>

                <Stack
                  flexDirection={smDown ? 'column' : 'row'}
                  alignItems={smDown ? 'flex-start' : 'center'}
                  gap='1rem'
                >
                  <Typography
                    sx={{
                      color: 'rgba(0,0,0, .6)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      flexBasis: '30%',
                      flexGrow: 0,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Tooltip title='Hourly Cost'>
                      <PriceChangeOutlinedIcon />
                    </Tooltip>
                    Hourly Cost
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '1.25rem',
                      fontWeight: '500',
                      flexBasis: '70%',
                      flexGrow: 0,
                      flexShrink: 0,
                    }}
                  >
                    {data?.hourly_cost}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          {/* {!smDown && (
            <Tasks tasks={user?.assigned_tasks ?? []} title="Tasks Assigned" />
          )}
          {!smDown && (
            <Tasks tasks={user?.done_tasks ?? []} title="Tasks Done" last />
          )} */}
          {smDown && (
            <Accordion
              sx={{
                flexGrow: 1,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls='panel1-content'
                id='panel1-header'
              >
                Tasks Assigned
              </AccordionSummary>
              <AccordionDetails>
                {/* <Tasks
                  tasks={user?.assigned_tasks ?? []}
                  title="Tasks Assigned"
                  collapsed
                /> */}
              </AccordionDetails>
            </Accordion>
          )}
          {smDown && (
            <Accordion
              sx={{
                flexGrow: 1,
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls='panel1-content'
                id='panel1-header'
              >
                Tasks Done
              </AccordionSummary>
              <AccordionDetails>
                {/* <Tasks
                  tasks={user?.done_tasks ?? []}
                  title="Tasks Done"
                  last
                  collapsed
                /> */}
              </AccordionDetails>
            </Accordion>
          )}
        </Stack>
      )}
    </div>
  );
}
