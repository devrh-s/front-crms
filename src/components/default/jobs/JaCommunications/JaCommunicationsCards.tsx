import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';
import Date from '../../common/components/Date';
import MoreChips from '../../common/components/MoreChips';
import Note from '../../common/components/Note';
import UserChip from '../../common/components/UserChip';
import HTMLModal from '../../common/modals/HTMLModal/HTMLModal';
import { IJaCommunication, IViewProps } from './types';

interface IJaCommunicationCard {
  elem: IJaCommunication;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall: boolean | undefined;
}

function JaCommunicationCard({
  elem,
  handleActions,
  handleDeleteModal,
  isSmall,
  pagePermissions,
  isAdmin,
}: IJaCommunicationCard) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { userProfile } = useUserProfile();
  const [note, setNote] = useState('');
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
      <Card
        className={mdDown ? 'mobile' : ''}
        sx={{
          width: 345,
          borderBottom: mdDown || isSmall ? 'none' : '7px solid #1976d2',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            padding: '1rem',
            flexDirection: 'column',
            gap: mdDown || isSmall ? '0.5rem' : '1rem',
          }}
        >
          <Stack flexDirection='row' justifyContent='space-between'>
            <ChipId id={elem.id} />
            <Typography
              variant='h6'
              sx={{
                fontSize: '1.1rem',
                fontWeight: '600',
              }}
            >
              {elem.job_application?.name}
            </Typography>
            <CardActionsButton
              id={+elem.id}
              open={open}
              handleClick={handleClick}
              anchorEl={anchorEl}
              handleClose={handleClose}
              handleActions={handleActions}
              handleDeleteModal={handleDeleteModal}
              availableEdit={checkPermission({
                pagePermissions,
                permissionType: 'edit_communications',
                userId: userProfile?.id,
                ownerId: elem?.created_by?.id,
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: 'delete_communications',
                userId: userProfile?.id,
                ownerId: elem?.created_by?.id,
                isAdmin,
              })}
              visibleProfile={false}
              url={`/ja-communications/${elem.id}`}
            />
          </Stack>

          <Stack
            flexDirection='row'
            justifyContent='space-between'
            alignItems='center'
            gap='1rem'
            flexGrow={1}
            sx={{ padding: '0 .5rem' }}
          >
            <Typography
              sx={{
                fontSize: '.9rem',
              }}
            >
              {elem.account?.name}
            </Typography>

            <UserChip data={elem.account?.tool} />

            <Typography
              sx={{
                fontSize: '.9rem',
              }}
            >
              {elem.communication_type?.name}
            </Typography>

            <Note value={elem.note} setNote={setNote} />
          </Stack>

          <Stack
            flexDirection='row'
            justifyContent='space-between'
            alignItems='center'
            gap='1rem'
            flexGrow={1}
            sx={{ padding: '0 .5rem' }}
          >
            <Typography
              sx={{
                fontSize: '.9rem',
              }}
            >
              {elem.channel?.value}
            </Typography>
            <UserChip data={elem.channel?.tool} />
          </Stack>

          <MoreChips data={elem.messages} propName='title' />

          {!isSmall && (
            <Stack
              flexDirection='row'
              justifyContent='space-between'
              alignItems='center'
              gap='.5rem'
              flexGrow={1}
            >
              <UserChip data={elem.created_by} sx={{ fontSize: '14px' }} />
              <Date date={elem.created_at} />
              <Date date={elem.followup_date} type='followup-date' />
            </Stack>
          )}
        </CardContent>
        <HTMLModal html={note} handleClose={() => setNote('')} />
      </Card>
    </Grow>
  );
}

export default function JaCommunicationsCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  handlePagination,
  availableAdd,
  cardsStorageActive,
  handleCardsStorage,
  view,
  handleChangeView,
  handleDeleteModal,
  handleActions,
  isSmall,
  pagePermissions,
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
        availableExport
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        pageName='Ja Communications'
        // availableAdd={availableAdd}
        availableAdd={availableAdd && (isAdmin || !!pagePermissions['add_communications'])}
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
          },
        }}
      >
        {visibleCards.map((row) => (
          <JaCommunicationCard
            key={row.id}
            elem={row}
            isSmall={isSmall}
            isAdmin={isAdmin}
            pagePermissions={pagePermissions}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
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
