import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import { Box, CardContent, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import MoreChips from '../../common/components/MoreChips';
import { IMessage, IViewProps } from './types';

interface IMessageCard {
  elem: IMessage;
  isSmall?: boolean;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
}

function MessageCard({
  elem,
  isAdmin,
  pagePermissions,
  handleActions,
  handleDeleteModal,
  isSmall,
}: IMessageCard) {
  const { userProfile } = useUserProfile();
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
    <Card
      className={mdDown ? 'mobile' : ''}
      sx={{
        width: 345,
        borderBottom: isSmall ? '4px solid #1976d2' : '7px solid #1976d2',
        '&.mobile': {
          width: '100%',
          maxWidth: 345,
          borderBottom: isSmall ? '4px solid #1976d2' : '7px solid #1976d2',
        },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          height: '100%',
          padding: '12px',
          flexDirection: 'column',
          '&:last-child': {
            paddingBottom: '12px',
          },
          gap: '12px',
        }}
      >
        <Stack
          flexDirection='row'
          justifyContent='flex-end'
          alignItems='center'
          sx={{ position: 'relative', width: '100%' }}
        >
          <Typography
            color='primary'
            sx={{
              position: 'relative',
              width: 'max-content',
              right: '50%',
              top: '.25rem',
              fontSize: '20px',
              fontWeight: '600',
            }}
          >
            {elem.title}
          </Typography>
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
              permissionType: 'edit_messages',
              isAdmin,
            })}
            availableDelete={checkPermission({
              pagePermissions,
              permissionType: 'delete_messages',
              isAdmin,
            })}
            url={`/messages/${elem.id}`}
            visibleProfile={false}
            sx={{
              position: 'absolute',
              right: '0.5rem',
              top: 0,
              zIndex: 100,
            }}
          />
        </Stack>
        <Box
          sx={{
            flexGrow: '1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            gap: '0.3rem',
          }}
        >
          <Typography
            color='primary'
            sx={{
              fontSize: '12px',
              textAlign: 'center',
            }}
          >
            {elem.inner_client?.name}
          </Typography>
          <Typography
            color='primary'
            sx={{
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            {elem.message_type?.name}
          </Typography>
        </Box>
        {!isSmall && (
          <Typography
            sx={{
              fontSize: '12px',
              textAlign: 'center',
            }}
          >
            {elem.text}
          </Typography>
        )}
        <Typography>{elem.translation.name}</Typography>
        <MoreChips data={elem.tools} />
        <MoreChips data={elem.entity_blocks} />
      </CardContent>
    </Card>
  );
}

export default function MessagesCards({
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
  const [visibleCards, setVisibleCards] = useState<typeof rows>([]);
  const { isAdmin } = useAuthStore();
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
        availableAdd={isAdmin || !!pagePermissions['add_messages']}
        pageName='Messages'
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
          <MessageCard
            key={row.id}
            elem={row}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            isSmall={isSmall}
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
