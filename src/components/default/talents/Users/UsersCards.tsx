import { MouseEvent, useEffect, useState } from 'react';
import {
  Box,
  Stack,
  CardContent,
  Typography,
  useMediaQuery,
  Theme,
  Grow,
  Avatar,
  Chip,
} from '@mui/material';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import Card from '@mui/material/Card';
import { IViewProps } from './types';
import ScrollBtn from '../../common/components/ScrollBtn';
import CardActionsButton from '../../common/components/CardActionsButton';
import NameLink from '../../common/components/NameLink';
import UserAvailability from '../../common/components/UserAvailability';
import ChipId from '../../common/components/ChipId';
import { useAuthStore } from '@/zustand/authStore';
import { checkPermission } from '@/lib/helpers';

interface IUserCard {
  elem: IUser;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall: boolean | undefined;
}

function UserCard({
  elem,
  pagePermissions,
  isAdmin,
  isSmall,
  handleActions,
  handleDeleteModal,
}: IUserCard) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <Grow in>
      {isSmall ? (
        <Card
          sx={{
            width: '100%',
            position: 'relative',
            maxWidth: '350px',
            borderBottom: isSmall ? '4px solid #1976d2' : '7px solid #1976d2',
          }}
        >
          <CardActionsButton
            id={elem.id}
            open={open}
            handleClick={handleClick}
            anchorEl={anchorEl}
            handleClose={handleClose}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            availableEdit={checkPermission({
              pagePermissions,
              permissionType: 'edit_users',
              isAdmin,
            })}
            availableDelete={checkPermission({
              pagePermissions,
              permissionType: 'delete_users',
              isAdmin,
            })}
            url={`/users/${elem.id}`}
            sx={{
              position: 'absolute',
              right: '0.5rem',
              top: 0,
              zIndex: 100,
            }}
          />
          <CardContent
            sx={{
              display: 'flex',
              padding: '1.5rem  1rem',
              flexDirection: 'row',
              alignItems: 'space-between',
              gap: '1.5rem',
              '@media (max-width: 410px)': {
                padding: '1rem',
              },
              '&:last-child': {
                paddingBottom: '0.75rem',
              },
            }}
          >
            <Stack
              flexDirection='row'
              justifyContent='space-between'
              alignItems='center'
              gap='1rem'
              sx={{
                width: '100%',
                '@media (max-width: 410px)': {
                  gap: '0.5rem',
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  rowGap: '8px',
                }}
              >
                <Avatar src={elem.image} sx={{ width: 64, height: 64 }} />
                <ChipId id={elem.id} />
              </Box>
              <Stack
                alignItems='center'
                gap='4px'
                sx={{
                  flex: '1',
                }}
              >
                <Typography
                  variant='h5'
                  sx={{
                    fontWeight: 600,
                    fontSize: '16px',
                    color: '#828282',
                  }}
                >
                  <NameLink
                    href={`/users/${elem.id}`}
                    name={elem.name}
                    sx={{
                      color: 'primary',
                      '&:hover': 'primary',
                      '&:visited': 'primary',
                    }}
                  />
                  {' ' + elem.hourly_cost + '$'}
                </Typography>
                <Typography sx={{ 'font-size': '14px', color: '#292929' }}>{elem.email}</Typography>

                <UserAvailability availability={!!elem.is_active} text={elem.is_active} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={mdDown ? 'mobile' : ''}
          sx={{
            width: 345,
            borderBottom: '7px solid #1976d2',
            '&.mobile': {
              width: '100%',
              maxWidth: 345,
            },
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              padding: '1rem',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
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
              <CardActionsButton
                id={elem.id}
                open={open}
                handleClick={handleClick}
                anchorEl={anchorEl}
                handleClose={handleClose}
                handleActions={handleActions}
                handleDeleteModal={handleDeleteModal}
                availableEdit={checkPermission({
                  pagePermissions,
                  permissionType: 'edit_users',
                  isAdmin,
                })}
                availableDelete={checkPermission({
                  pagePermissions,
                  permissionType: 'delete_users',
                  isAdmin,
                })}
                url={`/users/${elem.id}`}
              />
            </Stack>
            <Box
              sx={{
                position: 'relative',
              }}
            >
              <Avatar src={elem.image} sx={{ width: 145, height: 145 }} />
              <Chip
                label={elem.id}
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
            <Stack alignItems='center'>
              <NameLink
                href={`/users/${elem.id}`}
                name={elem.name}
                sx={{
                  color: 'primary',
                  '&:hover': 'primary',
                  '&:visited': 'primary',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                }}
              />
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
      )}
    </Grow>
  );
}

export default function UsersCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  handlePagination,
  pagePermissions,
  loading,
  view,
  cardsStorageActive,
  handleCardsStorage,
  handleChangeView,
  handleDeleteModal,
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
        availableAdd={isAdmin || !!pagePermissions['add_users']}
        pageName='Users'
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
