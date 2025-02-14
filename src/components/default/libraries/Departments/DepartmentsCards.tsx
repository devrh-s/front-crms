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
import Date from '../../common/components/Date';
import MoreChips from '../../common/components/MoreChips';
import Priority from '../../common/components/Priority';
import Status from '../../common/components/Status';
import Translation from '../../common/components/Translation';
import UserChip from '../../common/components/UserChip';
import { IViewProps } from './types';

interface IDepartmentCard {
  elem: IDepartment;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall?: boolean;
}

function DepartmentCard({
  elem,
  pagePermissions,
  isAdmin,
  handleActions,
  handleDeleteModal,
  isSmall,
}: IDepartmentCard) {
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
            gap: '1rem',
            padding: 0,
            flexDirection: 'column',
            '&:last-child': {
              paddingBottom: '0',
            },
          }}
        >
          {!isSmall && (
            <Box
              sx={{
                height: '68px',
                bgcolor: elem.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                sx={{
                  fontSize: '16px',
                }}
              >
                {elem.color}
              </Typography>
            </Box>
          )}
          <Stack gap={'1rem'} sx={{ padding: '1rem' }}>
            <Stack
              flexDirection='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{ position: 'relative' }}
            >
              <Translation text={elem.translation?.iso2} />
              <Typography
                textAlign='center'
                color='primary'
                sx={{
                  fontSize: '14px',
                  fontWeight: '600',
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
                  permissionType: 'edit_departments',
                  userId: userProfile?.id,
                  ownerId: elem?.created_by?.id,
                  isAdmin,
                })}
                availableDelete={checkPermission({
                  pagePermissions,
                  permissionType: 'delete_departments',
                  userId: userProfile?.id,
                  ownerId: elem?.created_by?.id,
                  isAdmin,
                })}
                url={`/departments/${elem.id}`}
              />
            </Stack>

            <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
              <Status name={elem.status?.name} color={elem.status?.color} />
              <Typography textAlign='center' color='primary'>
                {elem.library?.name}
              </Typography>
              <Priority
                sx={{ fontSize: '16px' }}
                priority={elem.priority?.name}
                color={'primary'}
              />
            </Stack>
            {!isSmall && (
              <>
                <Stack>
                  <MoreChips data={elem?.professions} />
                </Stack>
                {elem?.links && (
                  <Stack>
                    <MoreChips data={elem?.links} />
                  </Stack>
                )}
              </>
            )}

            <Stack flexDirection='row' justifyContent='center' alignItems='center' gap='2rem'>
              {isSmall && (
                <Box
                  sx={{
                    width: '32px',
                    height: '32px',
                    bgcolor: elem.color,
                    borderRadius: '50%',
                  }}
                ></Box>
              )}
              <Date date={elem.created_at} />
              {elem.created_by && <UserChip data={elem.created_by} />}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function DepartmentsCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  handlePagination,
  pagePermissions,
  loading,
  view,
  handleChangeView,
  handleDeleteModal,
  handleActions,
  isSmall,
  cardsStorageActive,
  handleCardsStorage,
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
        availableImport
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        availableAdd={isAdmin || !!pagePermissions['add_departments']}
        pageName='departments'
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
          <DepartmentCard
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
