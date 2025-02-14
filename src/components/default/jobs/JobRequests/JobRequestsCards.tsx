import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import { Box, CardContent, Chip, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';
import Date from '../../common/components/Date';
import NameLink from '../../common/components/NameLink';
import Status from '../../common/components/Status';
import UserChip from '../../common/components/UserChip';
import { IViewProps } from './types';

interface IJobRequestCard {
  elem: IJobRequestType;
  isSmall?: boolean;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
}

function JobRequestCard({
  elem,
  handleActions,
  handleDeleteModal,
  isSmall,
  pagePermissions,
  isAdmin,
}: IJobRequestCard) {
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
          padding: '1.25rem',
          flexDirection: 'column',
          height: '100%',
          '&:last-child': {
            paddingBottom: '1.5rem',
          },
          gap: '1rem',
        }}
      >
        <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
          <ChipId id={+elem.id} />
          <NameLink
            href={`job-requests/${elem.id}`}
            name={elem.name}
            target='_self'
            sx={{
              color: (theme: Theme) => theme.palette.primary.main,
              fontWeight: 600,
            }}
          />
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
              permissionType: 'edit_job_requests',
              userId: userProfile?.id,
              ownerId: elem.createdBy?.id,
              isAdmin,
            })}
            availableDelete={checkPermission({
              pagePermissions,
              permissionType: 'delete_job_requests',
              userId: userProfile?.id,
              ownerId: elem.createdBy?.id,
              isAdmin,
            })}
            url={`/job-requests/${elem.id}`}
            sx={{
              zIndex: 100,
            }}
          />
        </Stack>
        <Stack
          flexDirection='row'
          justifyContent='center'
          gap='1rem'
          flexGrow={1}
          sx={{
            flexGrow: '1',
          }}
        >
          <Typography
            sx={{
              fontSize: '.9rem',
              flex: 1,
              textAlign: 'center',
            }}
          >
            {elem.innerClient?.name}
          </Typography>
          <Typography
            sx={{
              fontSize: '.9rem',
              flex: 1,
              textAlign: 'center',
            }}
          >
            {elem?.shift?.name}
          </Typography>
          <Typography
            sx={{
              fontSize: '.9rem',
              flex: 1,
              textAlign: 'center',
            }}
          >
            {elem.profession.name}
          </Typography>
        </Stack>
        <Stack
          flexDirection='row'
          justifyContent='center'
          alignItems='center'
          gap='1rem'
          flexGrow={1}
        >
          <Box
            sx={{
              flex: '1',
              textAlign: 'center',
            }}
          >
            <Status
              name={elem.status?.name}
              color={elem.status?.color}
              sx={{ alignSelf: 'center' }}
              view='card'
            />
          </Box>
          <Typography
            sx={{
              fontSize: '.9rem',
              flex: '1',
              textAlign: 'center',
            }}
          >
            {elem.rate.name}
          </Typography>
          <Typography
            sx={{
              fontSize: '.9rem',
              flex: '1',
              textAlign: 'center',
            }}
          >
            Quantity:
            <Chip size='small' label={elem.quantity} />
          </Typography>
        </Stack>
        {!isSmall && (
          <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
            {elem.createdBy !== undefined && <UserChip data={elem.createdBy} />}
            <Date date={elem.created_at} sx={{ fontSize: '.9rem' }} />
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default function JobRequestsCards({
  rows,
  searchValue,
  pagePermissions,
  handleSearch,
  toggleFilters,
  paginationModel,
  handlePagination,
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
        availableImport
        availableExport
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        availableAdd={isAdmin || !!pagePermissions['add_job_requests']}
        pageName='Job Requests'
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
            rowGap: '.9rem',
            alignItems: 'center',
            minHeight: '100dvh',
          },
        }}
      >
        {visibleCards.map((row) => (
          <JobRequestCard
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
