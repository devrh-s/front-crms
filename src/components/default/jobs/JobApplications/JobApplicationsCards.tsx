import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { checkPermission } from '@/lib/helpers';
import useUserProfile from '@/hooks/useUserProfile';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import { useAuthStore } from '@/zustand/authStore';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';
import CustomChip from '../../common/components/CustomChip';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import Status from '../../common/components/Status';
import UserChip from '../../common/components/UserChip';
import { IViewProps } from './types';

interface IJobApplicationCard {
  elem: IJobApplication;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleActionsCandidate: (visible: boolean, id?: number | null) => void;
  handleActionsEmployee: (visible: boolean, id?: number | null) => void;
  handleActionsPresale: (visible: boolean, id?: number | null) => void;
}

function JobApplicationCard({
  elem,
  handleActions,
  handleDeleteModal,
  isAdmin,
  pagePermissions,
  handleActionsCandidate,
  handleActionsEmployee,
  handleActionsPresale,
}: IJobApplicationCard) {
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
  const isTransfer = elem.candidate_url || elem.employee_url || elem.presale_url;
  const links = [
    elem?.employee_url && {
      id: 1,
      name: 'Employee',
      link: elem?.employee_url,
      bgColor: 'secondary',
    },
    elem?.candidate_url && {
      id: 2,
      name: 'Candidate',
      link: elem?.candidate_url,
      bgColor: 'primary',
    },
    elem?.presale_url && {
      id: 3,
      name: 'Presale',
      link: elem?.presale_url,
      bgColor: 'error',
    },
  ].filter(Boolean);

  return (
    <Grow in>
      <Card
        className={mdDown ? 'mobile' : ''}
        sx={{
          width: 345,
          borderBottom: '7px solid #1976d2',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            padding: '1rem',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <Stack flexDirection='row' justifyContent='space-between'>
            <ChipId id={+elem.id} />
            <NameLink
              href={`job-applications/${elem.id}`}
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
              isTransfer={!!isTransfer}
              availableToEmployee
              availableToCandidates
              availableToPresale
              handleActionsCandidate={handleActionsCandidate}
              handleActionsEmployee={handleActionsEmployee}
              handleActionsPresale={handleActionsPresale}
              availableEdit={checkPermission({
                pagePermissions,
                permissionType: 'edit_job_applications',
                userId: userProfile?.id,
                ownerId: elem.created_by?.id,
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: 'delete_job_applications',
                userId: userProfile?.id,
                ownerId: elem.created_by?.id,
                isAdmin,
              })}
              url={`/job-applications/${elem.id}`}
              sx={{
                zIndex: 100,
              }}
            />
          </Stack>
          <Stack flexDirection='row' justifyContent='space-between' flexGrow={1}>
            <CustomChip label={elem.country?.name} data={elem.country} />
            <Typography>{elem.city?.name}</Typography>
            <Typography>{elem.gender}</Typography>
          </Stack>
          <Stack flexDirection='row' justifyContent='space-between' flexGrow={1}>
            <UserChip data={elem.manager} />
            <Status
              name={elem.status?.name}
              color={elem.status?.color}
              sx={{ alignSelf: 'center' }}
              view='card'
            />
            <Typography
              sx={{
                color: (theme: Theme) =>
                  elem?.is_talent ? theme.palette.success.main : theme.palette.error.main,
                textTransform: 'capitalize',
              }}
            >
              Is talent
            </Typography>
          </Stack>
          {links.length > 0 && (
            <Stack
              flexDirection='row'
              flexGrow={1}
              alignItems={'center'}
              justifyContent={'space-between'}
            >
              <Typography>Links to profile:</Typography>
              <MoreChips data={links as Array<any>} />
            </Stack>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function JobApplicationsCards({
  rows,
  searchValue,
  handleSearch,
  pagePermissions,
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
  handleActionsCandidate,
  handleActionsEmployee,
  handleActionsPresale,
}: IViewProps) {
  const [visibleCards, setVisibleCards] = useState<typeof rows>([]);
  const { isAdmin } = useAuthStore();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

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
        availableAdd={isAdmin || !!pagePermissions['add_job_applications']}
        pageName='Job Applications'
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
        {visibleCards.map((card) => (
          <JobApplicationCard
            key={card.id}
            elem={card}
            isAdmin={isAdmin}
            pagePermissions={pagePermissions}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            handleActionsCandidate={handleActionsCandidate}
            handleActionsEmployee={handleActionsEmployee}
            handleActionsPresale={handleActionsPresale}
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
