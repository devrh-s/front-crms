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
import MoreChips from '../../common/components/MoreChips';
import Priority from '../../common/components/Priority';
import Status from '../../common/components/Status';
import Translation from '../../common/components/Translation';
import { IViewProps } from './types';

interface IProfessionCard {
  elem: IProfession;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall: boolean | undefined;
}

function ProfessionCard({
  elem,
  pagePermissions,
  isAdmin,
  isSmall,
  handleActions,
  handleDeleteModal,
}: IProfessionCard) {
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
            paddingTop: '1rem',
            PiddingLeft: '1rem',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <Stack
            flexDirection='row'
            justifyContent='space-between'
            gap='1rem'
            alignItems={'center'}
          >
            <Status
              name={elem.status?.name}
              color={elem.status?.color}
              sx={{ alignSelf: 'center' }}
            />
            <Typography
              color='primary'
              sx={{
                fontSize: '20px',
                fontWeight: '700',
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
                permissionType: 'edit_professions',
                userId: userProfile?.id,
                ownerId: elem.created_by?.id,
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: 'delete_professions',
                userId: userProfile?.id,
                ownerId: elem.created_by?.id,
                isAdmin,
              })}
              url={`/professions/${elem.id}`}
            />
          </Stack>

          <Stack
            flexDirection='row'
            flexWrap='nowrap'
            alignItems='center'
            justifyContent='center'
            gap='1rem'
          >
            <Translation text={elem.translation?.name} />

            <Typography
              color='text.secondary'
              sx={{
                fontSize: '16px',
              }}
            >
              {elem.library?.name}
            </Typography>
          </Stack>

          <Stack
            flexDirection='row'
            flexWrap='nowrap'
            alignItems='center'
            justifyContent='center'
            gap='1rem'
          >
            <Priority
              sx={{ fontSize: '16px' }}
              priority={elem.priority?.name}
              color={'text.secondary'}
            />
            <Typography
              color='text.secondary'
              sx={{
                fontSize: '16px',
              }}
            >
              {elem.department?.name}
            </Typography>
          </Stack>
          {!isSmall && (
            <>
              {elem?.task_templates?.length > 0 && (
                <Stack>
                  <MoreChips data={elem?.task_templates} />
                </Stack>
              )}

              {elem?.objects?.length > 0 && (
                <Stack>
                  <MoreChips data={elem?.objects} />
                </Stack>
              )}
              {elem?.links && elem.links.length > 0 && (
                <Stack>
                  <MoreChips data={elem?.links} />
                </Stack>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function ProfessionsCards({
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
        rows={rows}
        availableExport
        availableImport
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        availableAdd={isAdmin || !!pagePermissions['add_professions']}
        pageName='Professions'
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
          <ProfessionCard
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
