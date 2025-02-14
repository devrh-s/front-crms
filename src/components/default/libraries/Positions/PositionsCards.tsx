import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import CardActionsButton from '@/components/default/common/components/CardActionsButton';
import ChipId from '@/components/default/common/components/ChipId';
import Date from '@/components/default/common/components/Date';
import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import Status from '@/components/default/common/components/Status';
import Translation from '@/components/default/common/components/Translation';
import UserChip from '@/components/default/common/components/UserChip';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import { IViewProps } from './types';

interface IPositionsProps {
  elem: IPosition;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall?: boolean;
}

function PositionCard({
  elem,
  isSmall,
  pagePermissions,
  isAdmin,
  handleActions,
  handleDeleteModal,
}: IPositionsProps) {
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
    <Grow in>
      <Card
        className={mdDown ? 'mobile' : ''}
        sx={{
          width: 345,
          borderBottom: isSmall ? '4px solid #1976d2' : '7px solid #1976d2',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '0 1rem',
          }}
        >
          <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
            <ChipId id={elem.item_id} />
            <Typography
              color='primary'
              sx={{
                fontSize: '16px',
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              {elem.name}
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
                permissionType: 'edit_positions',
                userId: userProfile?.id,
                ownerId: elem?.created_by?.id,
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: 'delete_positions',
                userId: userProfile?.id,
                ownerId: elem?.created_by?.id,
                isAdmin,
              })}
              url={`/positions/${elem.id}`}
            />
          </Stack>

          <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
            <Status name={elem?.status?.name} color={elem?.status?.color} />
            <Typography
              sx={{
                fontSize: '14px',
                textTransform: 'capitalize',
              }}
            >
              {elem.library.name}
            </Typography>

            <Translation text={elem.translation?.name} />
          </Stack>

          {!isSmall && (
            <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
              <UserChip data={elem?.created_by} />
              <Date date={elem?.created_at} sx={{ fontSize: '.9rem' }} />
            </Stack>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function PositionsCards({
  rows,
  searchValue,
  handleSearch,
  paginationModel,
  handlePagination,
  toggleFilters,
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
      className={mdDown ? 'mobile' : ''}
      gap={mdDown ? '2rem' : '4rem'}
      sx={{
        padding: '.5rem 0',
        minHeight: mdDown ? 'calc(80dvh - 2rem - 64px)' : 'calc(80dvh - 2rem - 56px)',
        '&.mobile': {
          p: 0,
        },
      }}
    >
      <CustomToolbar
        view={view}
        availableExport
        availableImport
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        availableAdd={isAdmin || !!pagePermissions['add_positions']}
        pageName='Positions'
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
          <PositionCard
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
