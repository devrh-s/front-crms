import CardActionsButton from '@/components/default/common/components/CardActionsButton';
import ChipId from '@/components/default/common/components/ChipId';
import Date from '@/components/default/common/components/Date';
import MoreChips from '@/components/default/common/components/MoreChips';
import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import UserChip from '@/components/default/common/components/UserChip';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import { Box, CardContent, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import { IViewProps } from './types';

interface ITaskTemplateCard {
  elem: ITaskTemplate;
  isAdmin: boolean;
  isSmall?: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
}

function TaskTemplateCard({
  elem,
  isAdmin,
  isSmall,
  pagePermissions,
  handleActions,
  handleDeleteModal,
}: ITaskTemplateCard) {
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
        <Stack
          flexDirection='row'
          justifyContent='space-between'
          gap={'0.5rem'}
          alignItems='center'
        >
          <ChipId id={+elem.id} />
          <Typography
            variant='h6'
            sx={{
              fontSize: '1.1rem',
              color: 'primary.main',
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
              permissionType: 'edit_task_templates',
              userId: userProfile?.id,
              ownerId: elem.created_by?.id,
              isAdmin,
            })}
            availableDelete={checkPermission({
              pagePermissions,
              permissionType: 'delete_task_templates',
              userId: userProfile?.id,
              ownerId: elem.created_by?.id,
              isAdmin,
            })}
            url={`/task-templates/${elem.id}`}
          />
        </Stack>
        {elem?.is_draft === 1 && (
          <Typography textAlign={'center'} color={'error'}>
            (Is Draft)
          </Typography>
        )}
        <Stack flexDirection='row' justifyContent='space-between' gap='1rem' flexGrow={1} sx={{}}>
          <Typography sx={{ textAlign: 'center' }}>Cost: {elem.cost}</Typography>
          <Typography sx={{ textAlign: 'center' }}>Task: {elem.task_quantity}</Typography>
        </Stack>
        <Stack flexDirection='row' justifyContent='space-between' gap='1rem' flexGrow={1} sx={{}}>
          <Typography sx={{ textAlign: 'center' }}>{elem.expected_hours}</Typography>
          <Typography sx={{ textAlign: 'center' }}>{elem.frequency.name}</Typography>
        </Stack>
        <Stack>
          <Typography>{elem?.action?.name}</Typography>
          <Typography>{elem?.object?.name}</Typography>
        </Stack>

        {!isSmall && (
          <>
            <Stack sx={{ flex: 1, justifyContent: 'center' }}>
              <MoreChips data={elem.professions} propName='name' />
            </Stack>
            <Stack sx={{ flex: 1, justifyContent: 'center' }}>
              <MoreChips data={elem.step_templates} propName='name' />
            </Stack>
            <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
              <Box>
                <Date date={elem.created_at} sx={{ fontSize: '.9rem' }} />
              </Box>
              {elem.created_by !== undefined && <UserChip data={elem.created_by} />}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function TaskTemplatesCards({
  rows,
  searchValue,
  loading,
  paginationModel,
  view,
  pagePermissions,
  isSmall,
  cardsStorageActive,
  handleCardsStorage,
  handleSearch,
  toggleFilters,
  handlePagination,
  handleChangeView,
  handleDeleteModal,
  handleActions,
}: IViewProps) {
  const { isAdmin } = useAuthStore();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
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
        pageName='Task Templates'
        availableAdd={isAdmin || !!pagePermissions['add_task_templates']}
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
          <TaskTemplateCard
            key={row.id}
            elem={row}
            isAdmin={isAdmin}
            pagePermissions={pagePermissions}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            isSmall={isSmall}
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
