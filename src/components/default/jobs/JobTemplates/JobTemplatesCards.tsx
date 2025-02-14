import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import {
  Box,
  CardContent,
  Chip,
  Grow,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import Card from '@mui/material/Card';
import { useRouter } from 'next/navigation';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import Status from '../../common/components/Status';
import { IViewProps } from './types';

interface IJobTemplateCard {
  elem: IJobTemplate;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleSetProfile: (profileId: number) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall: boolean | undefined;
}

function JobTemplateCard({
  elem,
  pagePermissions,
  handleActions,
  isAdmin,
  handleSetProfile,
  handleDeleteModal,
}: IJobTemplateCard) {
  const router = useRouter();
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
          <Stack
            flexDirection='row'
            alignItems='center'
            justifyContent='space-between'
            sx={{ position: 'relative' }}
          >
            <ChipId id={elem.id} />
            <NameLink
              href={`job-templates/${elem.id}`}
              name={elem.title}
              target='_self'
              sx={{
                color: (theme: Theme) => theme.palette.primary.main,
                width: 'max-content',
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
                permissionType: 'edit_job_templates',
                userId: userProfile?.id,
                ownerId: elem.id,
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: 'delete_job_templates',
                userId: userProfile?.id,
                ownerId: elem.id,
                isAdmin,
              })}
              url={`/job-templates/${elem.id}`}
              sx={{
                zIndex: 100,
              }}
            />
          </Stack>
          <Stack flexDirection='row' justifyContent='space-between' flexGrow={1}>
            <Typography textTransform='capitalize'>{elem.profession.name}</Typography>
          </Stack>
          <Stack flexDirection='row' justifyContent='space-between' flexGrow={1}>
            <Status
              name={elem.status?.name}
              color={elem.status?.color}
              sx={{ alignSelf: 'center' }}
              view='card'
            />
            <Typography
              sx={{
                fontSize: '.9rem',
                textAlign: 'center',
              }}
            >
              Sum Jas:
              <Chip size='small' label={elem.sum_jas} />
            </Typography>
          </Stack>
          <MoreChips data={elem?.job_requests} />
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function JobTemplatesCards({
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
  handleSetProfile,
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
        availableImport
        availableExport
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        availableAdd={isAdmin || !!pagePermissions['add_job_templates']}
        pageName='Job templates'
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
          <JobTemplateCard
            key={row.id}
            elem={row}
            isSmall={isSmall}
            isAdmin={isAdmin}
            pagePermissions={pagePermissions}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            handleSetProfile={handleSetProfile}
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
