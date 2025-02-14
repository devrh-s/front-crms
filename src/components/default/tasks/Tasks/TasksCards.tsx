import CardActionsButton from '@/components/default/common/components/CardActionsButton';
import ChipId from '@/components/default/common/components/ChipId';
import Date from '@/components/default/common/components/Date';
import MoreChips from '@/components/default/common/components/MoreChips';
import NameLink from '@/components/default/common/components/NameLink';
import Priority from '@/components/default/common/components/Priority';
import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import Status from '@/components/default/common/components/Status';
import UserChip from '@/components/default/common/components/UserChip';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { checkPermission } from '@/lib/helpers';
import useUserProfile from '@/hooks/useUserProfile';
import { useAuthStore } from '@/zustand/authStore';
import { Box, CardContent, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import { IViewProps } from './types';

interface ITaskCard {
  elem: ITask;
  isSmall?: boolean;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
}

function TaskCard({
  elem,
  isAdmin,
  isSmall,
  pagePermissions,
  handleActions,
  handleDeleteModal,
}: ITaskCard) {
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
            {elem.title}
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
              permissionType: 'edit_tasks',
              userId: userProfile?.id,
              ownerId: elem.created_by?.id,
              isAdmin,
            })}
            availableDelete={checkPermission({
              pagePermissions,
              permissionType: 'delete_tasks',
              userId: userProfile?.id,
              ownerId: elem.created_by?.id,
              isAdmin,
            })}
            url={`/tasks/${elem.id}`}
          />
        </Stack>
        <Stack sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
          <Status name={elem.status.name} color={elem.status.color} sx={{}} />
          <Typography>{elem.is_completed}</Typography>
          <Priority priority={elem.priority.name} />
        </Stack>
        <Stack sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row' }}>
          <NameLink
            href={elem.inner_client?.website}
            name={elem.inner_client?.name}
            sx={{ pl: 0 }}
          />
          <Typography>{elem.task_template.name}</Typography>
        </Stack>

        <Stack
          flexDirection='row'
          justifyContent='space-between'
          gap='1rem'
          flexGrow={1}
          sx={{
            flexGrow: '1',
          }}
        >
          Steps:
          <MoreChips data={elem.steps} />
        </Stack>
        {!isSmall && (
          <>
            <Stack
              flexDirection='row'
              justifyContent='space-between'
              gap='1rem'
              flexGrow={1}
              sx={{
                flexGrow: '1',
              }}
            >
              Assignees:
              <MoreChips data={elem.assignees} />
            </Stack>
            <Stack
              flexDirection='row'
              justifyContent='space-between'
              gap='1rem'
              flexGrow={1}
              sx={{
                flexGrow: '1',
              }}
            >
              Controllers:
              <MoreChips data={elem.controllers} />
            </Stack>
            <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
              {elem.created_by !== undefined && <UserChip data={elem.created_by} />}
              <Date date={elem.created_at} sx={{ fontSize: '.9rem' }} />
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function TasksCards({
  rows,
  searchValue,
  paginationModel,
  pagePermissions,
  loading,
  view,
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
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        pageName='Tasks'
        showCalendar
        showBoard
        availableAdd={isAdmin || !!pagePermissions['add_tasks']}
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
          <TaskCard
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
