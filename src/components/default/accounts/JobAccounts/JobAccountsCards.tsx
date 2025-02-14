import CustomLink from '@/components/default/common/components/CustomLink';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipSimple from '../../common/components/ChipSimple';
import ScrollBtn from '../../common/components/ScrollBtn';
import Status from '../../common/components/Status';
import { IViewProps } from './types';

interface IJobAccountCard {
  elem: IJobAccount;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall: boolean | undefined;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
}

function JobAccountCard({
  elem,
  isSmall,
  handleActions,
  handleDeleteModal,
  isAdmin,
  pagePermissions,
}: IJobAccountCard) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { userProfile } = useUserProfile();
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
        sx={{
          width: 345,
          borderBottom: !isSmall && !mdDown ? '7px solid #1976d2' : 'unset',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            padding: '1rem',
            flexDirection: 'column',
            gap: mdDown ? '0.5rem' : '1rem',
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
                transform: 'translateX(50%)',
                fontSize: '20px',
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
              url={`/job-accounts/${elem.id}`}
              availableEdit={checkPermission({
                pagePermissions,
                permissionType: 'edit_job_accounts',
                userId: userProfile?.id,
                ownerId: elem.createdBy?.id,
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: 'delete_job_accounts',
                userId: userProfile?.id,
                ownerId: elem.createdBy?.id,
                isAdmin,
              })}
              sx={{
                position: 'absolute',
                right: '0.5rem',
                top: 0,
                zIndex: 100,
              }}
            />
          </Stack>

          <Stack flexDirection='column' gap={mdDown ? (isSmall ? '0.25rem' : '0.5rem') : '0.75rem'}>
            <Stack
              flexDirection='row'
              gap='1rem'
              alignItems='center'
              justifyContent='space-between'
            >
              <Typography
                sx={{
                  width: '50%',
                }}
              >
                {elem.innerClient?.name}
              </Typography>
              <Box
                sx={{
                  width: '50%',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Typography>{elem.login}</Typography>
              </Box>
            </Stack>

            <Stack
              flexDirection='row'
              gap='1rem'
              alignItems='center'
              justifyContent='space-between'
            >
              <Status name={elem.status?.name} color={elem.status?.color} view='table' />
              <Box
                sx={{
                  width: '50%',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <Typography>
                  Active Job Posts <ChipSimple value={elem.active_job_posts} />
                </Typography>
              </Box>
            </Stack>
            <Typography>{`Active Available Posts: ${elem?.available_job_posts ?? 0}`}</Typography>
            {!isSmall && (
              <Stack
                flexDirection='row'
                gap='1rem'
                alignItems='center'
                justifyContent='space-between'
              >
                <Typography
                  sx={{
                    width: '50%',
                  }}
                >
                  {elem.jobSite?.name}
                </Typography>
                <Box
                  sx={{
                    width: '50%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <CustomLink link={elem.profile_link} label='Link' />
                </Box>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function JobAccountsCards({
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
        availableExport
        availableImport
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        availableAdd={isAdmin || !!pagePermissions['add_job_accounts']}
        pageName='Job Accounts'
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
          <JobAccountCard
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
