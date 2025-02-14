import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  CardContent,
  Grow,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import ScrollBtn from '../../common/components/ScrollBtn';
import Text from '../../common/components/Text';
import UserAvailability from '../../common/components/UserAvailability';
import { IViewProps } from './types';

interface IUserCard {
  elem: IUser;
  isSmall: boolean | undefined;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleConfirm: (userId: number) => void;
}

function UserCard({
  elem,
  isSmall,
  pagePermissions,
  isAdmin,
  handleActions,
  handleDeleteModal,
  handleConfirm,
}: IUserCard) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const isManaged = checkPermission({
    pagePermissions,
    permissionType: 'delete_users',
    isAdmin,
  });

  return (
    <Grow in>
      <Card
        sx={{
          width: '100%',
          position: 'relative',
          maxWidth: '350px',
          borderBottom: isSmall ? 'none' : '7px solid #1976d2',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            padding: isSmall ? '.5rem' : '1rem',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Stack
            flexDirection='row'
            justifyContent='space-between'
            alignItems='center'
            sx={{
              width: '100%',
            }}
          >
            <UserAvailability availability={!!elem.is_active} text={elem.is_active} />
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
              sx={{
                '& .MuiSvgIcon-root': {
                  color: 'rgba(0, 0, 0, 0.54)',
                },
              }}
            >
              {isManaged && [
                <MenuItem
                  key='confirm'
                  onClick={() => handleConfirm(elem.id)}
                  sx={{
                    gap: '.5rem',
                  }}
                >
                  <CheckCircleOutlinedIcon /> Confirm
                </MenuItem>,
                <MenuItem
                  key='delete'
                  onClick={() => handleDeleteModal(true, [elem.id])}
                  sx={{
                    gap: '.5rem',
                  }}
                >
                  <DeleteIcon /> Delete
                </MenuItem>,
              ]}
            </Menu>
          </Stack>
          <Box
            sx={{
              position: 'relative',
            }}
          ></Box>
          <Stack alignItems='center'>
            <Text text={elem.name} sx={{ fontSize: '1.5rem', fontWeight: '600' }} />
            <Typography
              sx={{
                color: '#292929',
                opacity: '0.7',
                fontSize: '14px',
              }}
            >
              {elem.email}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function UnconfirmedUsersCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  handlePagination,
  pagePermissions,
  loading,
  cardsStorageActive,
  handleCardsStorage,
  view,
  handleChangeView,
  handleDeleteModal,
  handleConfirm,
  handleActions,
  isSmall,
}: IViewProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { isAdmin } = useAuthStore();
  const [visibleCards, setVisibleCards] = useState<typeof rows>([]);
  useEffect(() => {
    if (cardsStorageActive) {
      setVisibleCards((prev) => [...prev, ...rows]);
      handleCardsStorage(false);
    } else {
      setVisibleCards(rows);
    }
  }, [rows]);
  return (
    <Stack
      gap='2rem'
      sx={{
        padding: '.5rem 0',
        minHeight: mdDown ? 'calc(80dvh - 2rem - 64px)' : 'calc(80dvh - 2rem - 56px)',
      }}
    >
      <CustomToolbar
        view={view}
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        availableAdd={false}
        pageName='Unconfirmed Users'
      />
      <Box
        className={mdDown ? 'mobile' : ''}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 345px)',
          justifyContent: 'center',
          gap: '1rem',
          '&.mobile': {
            display: 'flex',
            flexDirection: 'column',
            rowGap: '12px',
            alignItems: 'center',
            minHeight: '100dvh',
          },
        }}
      >
        {visibleCards.map((row) => (
          <UserCard
            key={row.id}
            elem={row}
            isSmall={isSmall}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            handleConfirm={handleConfirm}
            isAdmin={isAdmin}
            pagePermissions={pagePermissions}
          />
        ))}
      </Box>
      <InfinityScroll
        paginationModel={paginationModel}
        handlePagination={handlePagination}
        handleCardsStorage={handleCardsStorage}
      />
      <ScrollBtn />
    </Stack>
  );
}
