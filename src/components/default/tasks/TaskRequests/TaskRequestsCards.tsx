import { MouseEvent, useEffect, useState } from 'react';
import { Box, Stack, CardContent, Typography, useMediaQuery, Theme } from '@mui/material';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import Card from '@mui/material/Card';

import { IViewProps } from './types';
import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import ChipId from '@/components/default/common/components/ChipId';
import MoreChips from '@/components/default/common/components/MoreChips';
import Date from '@/components/default/common/components/Date';
import UserChip from '@/components/default/common/components/UserChip';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ConstructionIcon from '@mui/icons-material/Construction';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { useAuthStore } from '@/zustand/authStore';
import { checkPermission } from '@/lib/helpers';
import CardActionsButton from '@/components/default/common/components/CardActionsButton';
import useUserProfile from '@/hooks/useUserProfile';

interface ITaskRequestCard {
  elem: ITaskRequest;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall?: boolean;
}

function TaskRequestCard({
  elem,
  isAdmin,
  isSmall,
  pagePermissions,
  handleActions,
  handleDeleteModal,
}: ITaskRequestCard) {
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
          {/* <Typography
            variant="h6"
            sx={{
              fontSize: "1.1rem",
              color: "primary.main",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {elem.task_template.name}
          </Typography> */}
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
          {!elem.task && (
            <Stack gap={'0.5rem'} flexDirection={'row'}>
              <RemoveCircleOutlineIcon color='warning' />
            </Stack>
          )}
          {elem.task && +elem.task?.is_completed === 0 && (
            <Stack gap={'0.5rem'} flexDirection={'row'}>
              <ConstructionIcon color='info' />
            </Stack>
          )}
          {elem.task && +elem.task?.is_completed === 1 && (
            <Stack gap={'0.5rem'} flexDirection={'row'}>
              <CheckCircleOutlineIcon color='success' />
            </Stack>
          )}
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
              permissionType: 'edit_task_request',
              userId: userProfile?.id,
              ownerId: elem.created_by?.id,
              isAdmin,
            })}
            availableDelete={checkPermission({
              pagePermissions,
              permissionType: 'delete_task_request',
              userId: userProfile?.id,
              ownerId: elem.created_by?.id,
              isAdmin,
            })}
            url={`/task-requests/${elem.id}`}
          />
        </Stack>
        <Stack flexDirection={'row'} gap={'1rem'} justifyContent={'space-between'}>
          {elem.task_template && <Typography>{elem.task_template.name}</Typography>}
          {elem.task && <Typography>{elem.task.title}</Typography>}
          <Typography>{elem.priority?.name}</Typography>
        </Stack>
        {elem.assignees && (
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
        )}

        {!isSmall && (
          <>
            {elem.professions && (
              <Stack
                flexDirection='row'
                justifyContent='space-between'
                gap='1rem'
                flexGrow={1}
                sx={{
                  flexGrow: '1',
                }}
              >
                Professions:
                <MoreChips data={elem.professions} />
              </Stack>
            )}

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

export default function TaskRequestsCards({
  rows,
  searchValue,
  paginationModel,
  loading,
  view,
  isSmall,
  pagePermissions,
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
        pageName='Task Requests'
        availableAdd={isAdmin || !!pagePermissions['add_task_request']}
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
          <TaskRequestCard
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
