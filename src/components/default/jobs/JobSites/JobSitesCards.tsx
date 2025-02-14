import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import {
  Avatar,
  Box,
  CardContent,
  Grow,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import Card from '@mui/material/Card';
import { Dispatch, MouseEvent, SetStateAction, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import Date from '../../common/components/Date';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import Note from '../../common/components/Note';
import HTMLModal from '../../common/modals/HTMLModal/HTMLModal';
import { IViewProps } from './types';

interface IJobSiteCard {
  elem: IJobSite;
  isSmall?: boolean;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  setNote: Dispatch<SetStateAction<string>>;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
}

function JobSiteCard({
  elem,
  pagePermissions,
  isAdmin,
  isSmall,
  setNote,
  handleActions,
  handleDeleteModal,
}: IJobSiteCard) {
  const { userProfile } = useUserProfile();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const [country] = elem?.countries ?? [];
  const languages = elem?.languages ?? [];
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <Grow in>
      <Card
        className={mdDown ? 'mobile' : ''}
        sx={{
          width: 345,
          borderBottom: !isSmall && !mdDown ? '7px solid #1976d2' : 'unset',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem 1rem',
            gap: !isSmall && !mdDown ? '1rem' : '.5rem',
          }}
        >
          <Stack
            flexDirection='row'
            justifyContent='flex-end'
            alignItems='center'
            sx={{
              position: 'relative',
            }}
          >
            <NameLink
              href={`job-sites/${elem.id}`}
              name={elem.name}
              target='_self'
              sx={{
                color: (theme: Theme) => theme.palette.primary.main,
                fontWeight: 600,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
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
                permissionType: 'edit_job_sites',
                userId: userProfile?.id,
                ownerId: elem.createdBy?.id,
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: 'delete_job_sites',
                userId: userProfile?.id,
                ownerId: elem.createdBy?.id,
                isAdmin,
              })}
              url={`/job-sites/${elem.id}`}
            />
          </Stack>
          <Stack flexDirection='row' alignItems='center' justifyContent='space-between'>
            <NameLink
              href={elem.website!}
              name='Link'
              sx={{
                color: (theme: Theme) => theme.palette.primary.main,
              }}
            />
            <Stack flexDirection='row' alignItems='center' gap='.5rem'>
              <Avatar
                src={country?.image ?? '/images/question_mark.svg'}
                sx={{ boxShadow: '0px 4px 32.3px 0px #1928281A' }}
              />
              <Typography>{country?.name}</Typography>
            </Stack>
            <Note value={elem?.note} setNote={setNote} style={{ padding: '.5rem' }} />
          </Stack>
          {!isSmall && (
            <Stack flexDirection='row' justifyContent='space-between'>
              <MoreChips data={languages} />
              <Date
                date={elem?.created_at}
                sx={{
                  minWidth: 'max-content',
                }}
              />
            </Stack>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function JobSitesCards({
  rows,
  searchValue,
  pagePermissions,
  isSmall,
  loading,
  view,
  paginationModel,
  cardsStorageActive,
  handleCardsStorage,
  handleSearch,
  toggleFilters,
  handlePagination,
  handleChangeView,
  handleDeleteModal,
  handleActions,
}: IViewProps) {
  const [note, setNote] = useState('');
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
    <Stack sx={{ padding: '.5rem 0' }}>
      <Stack
        gap='2rem'
        sx={{
          minHeight: 'calc(100dvh - 48px)',
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
          availableAdd={isAdmin || !!pagePermissions['add_job_sites']}
          pageName='Job sites'
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
          {visibleCards.map((card) => (
            <JobSiteCard
              key={card.id}
              elem={card}
              isSmall={isSmall}
              setNote={setNote}
              isAdmin={isAdmin}
              pagePermissions={pagePermissions}
              handleActions={handleActions}
              handleDeleteModal={handleDeleteModal}
            />
          ))}
        </Box>
        <HTMLModal html={note} handleClose={() => setNote('')} />
      </Stack>
      <InfinityScroll
        paginationModel={paginationModel}
        handlePagination={handlePagination}
        handleCardsStorage={handleCardsStorage}
      />
      <ScrollBtn />
    </Stack>
  );
}
