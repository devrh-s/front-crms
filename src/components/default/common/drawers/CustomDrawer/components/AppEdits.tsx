import useNotification from '@/hooks/useNotification';
import { apiGetData, apiUpdateData } from '@/lib/fetch';
import { clearEdits, openAddModal } from '@/redux/slices/editsSlice';
import type { IRootState } from '@/redux/store';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import EditIcon from '@mui/icons-material/Edit';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/Info';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Fade,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  MenuList,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface IAppEditsProps {
  open: boolean;
  anchorEl: any;
  handleClose: any;
}

const infoAnimationsVariants = {
  scale: { scale: 1, transition: { duration: 0.2 } },
  hide: { scale: 0 },
};

function getEditIcon(type: string | null) {
  switch (type) {
    case 'edit':
      return <EditIcon fontSize='small' sx={{ color: '#fff' }} />;
    case 'suggestion':
      return <QuestionMarkIcon fontSize='small' sx={{ color: '#fff' }} />;
    default:
      return <HelpOutlineIcon fontSize='small' sx={{ color: '#fff' }} />;
  }
}

interface IEditInfoTooltipProps extends PropsWithChildren {
  completedBy: IUser;
  completedAt: string;
}

function EditInfoTooltip({
  children,
  completedBy,
  completedAt,
}: IEditInfoTooltipProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Box
      component={motion.div}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      sx={{ position: 'relative', height: 24 }}
    >
      <motion.div
        variants={infoAnimationsVariants}
        animate={isHovered ? 'scale' : 'hide'}
        initial='hide'
      >
        <Paper
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            padding: '5px',
            gap: '5px',
            position: 'absolute',
            top: '-3rem',
            left: '-50%',
            transform: 'translateX(-50%)',
          }}
        >
          <Tooltip title={completedBy?.name}>
            <Avatar
              alt={completedBy?.name}
              src={completedBy?.image}
              sx={{ width: 25, height: 25 }}
            />
          </Tooltip>
          <Typography sx={{ color: '#bdbdbd', fontSize: '.8rem' }}>{completedAt}</Typography>
        </Paper>
      </motion.div>
      {children}
    </Box>
  );
}

export default function AppEdits({ open, anchorEl, handleClose }: IAppEditsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const showNotification = useNotification();

  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { entityBlockId, progressableType, progressableId } = useSelector(
    (state: IRootState) => state.edits
  );

  const {
    data: editsData,
    refetch,
    fetchNextPage: fetchNextEdit,
  } = useInfiniteQuery({
    queryKey: ['app-edits', entityBlockId],
    queryFn: async ({ pageParam }) => {
      let URL;
      if (entityBlockId)
        URL = `edit-progress?page=${pageParam}&perPage=5&entity_block_id=${entityBlockId}`;
      else
        URL = `edit-progress?page=${pageParam}&perPage=5&progressable_type=${progressableType}&progressable_id=${progressableId}`;

      const response = await apiGetData(URL);
      return {
        data: response?.data,
        meta: response?.meta,
        nextCursor: pageParam + 1,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!entityBlockId || !!progressableType,
  });

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiUpdateData(`edit-progress/${id}/is-completed`, data),
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['app-edits'],
        }),
        // queryClient.invalidateQueries({
        //   queryKey: [slug ? `media-assets-${slug.join('-')}` : 'media-assets'],
        // }),
      ]);
      showNotification('Successfully update status', 'success');
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      showNotification(`${status}: ${error ?? 'Something went wrong'}`, 'error');
    },
  });

  const edits = useMemo<{ data: any; meta: any }>(() => {
    if (!editsData) return { data: [], meta: [] };
    const data = editsData.pages.flatMap((page) => page.data);
    const meta = editsData.pages[editsData.pages.length - 1]?.meta || {};
    return { data, meta };
  }, [editsData]);

  const handleAddEdits = () => dispatch(openAddModal());

  const clickHandler = (id: number) => {
    handleClose();
    router.push(`/edits/${id}`);
  };

  useEffect(() => {
    dispatch(clearEdits());
  }, [pathname]);

  return (
    <Menu
      id='fade-Edits'
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
      open={open}
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
        <Typography fontWeight={500}>Edits</Typography>
        <Button variant='contained' size='small' onClick={handleAddEdits}>
          Add edit
        </Button>
      </Stack>
      <Divider />
      <MenuList>
        {edits?.data?.map((item: any) => (
          <MenuItem
            key={item?.id}
            sx={{
              padding: '.4rem 0',
              paddingLeft: '5px',
              gap: '.5rem',
            }}
            onClick={() => clickHandler(item?.edit?.id)}
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
                {getEditIcon(item?.type)}
              </Stack>
            </ListItemIcon>
            <Stack sx={{ width: 'calc(100% - 2.4rem)' }}>
              <Typography variant='inherit' noWrap sx={{ color: item?.status?.color ?? '#000' }}>
                {item?.edit?.name}
              </Typography>
              <Stack
                flexDirection='row'
                alignItems='center'
                justifyContent='space-between'
                sx={{ width: '100%' }}
              >
                <Typography sx={{ color: '#bdbdbd' }}>{item?.created_at}</Typography>
                <Stack flexDirection='row' alignItems='flex-end' justifyContent='flex-end'>
                  <motion.div
                    animate={!!item?.completed_by ? 'scale' : 'hide'}
                    variants={infoAnimationsVariants}
                  >
                    <EditInfoTooltip
                      completedBy={item.completed_by}
                      completedAt={item.completed_at}
                    >
                      <InfoIcon color='info' sx={{ marginTop: '-3px' }} />
                    </EditInfoTooltip>
                  </motion.div>
                  <IconButton
                    size='small'
                    onClick={(e) => {
                      e.stopPropagation();
                      mutation.mutate({ id: item?.id, data: { is_completed: !item.done } });
                    }}
                  >
                    {item?.done ? (
                      <DoneAllIcon color='success' sx={{ fontSize: '1.2rem' }} />
                    ) : (
                      <DoneIcon color='success' sx={{ fontSize: '1.2rem' }} />
                    )}
                  </IconButton>
                </Stack>
              </Stack>
            </Stack>
          </MenuItem>
        ))}
      </MenuList>
      {edits?.meta?.current_page < edits?.meta?.last_page && (
        <Stack>
          <Button onClick={() => fetchNextEdit()}>Show more</Button>
        </Stack>
      )}
    </Menu>
  );
}
