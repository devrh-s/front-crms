import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import {
  Box,
  CardContent,
  Divider,
  Grow,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import Date from '../../common/components/Date';
import Priority from '../../common/components/Priority';
import Status from '../../common/components/Status';
import Translation from '../../common/components/Translation';
import UserChip from '../../common/components/UserChip';
import { IViewProps } from './types';

interface IActionCard {
  elem: IAction;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  view: string;
  isSmall: boolean | undefined;
}

function SubIndustryCard({
  elem,
  pagePermissions,
  isAdmin,
  handleActions,
  handleDeleteModal,
  view,
  isSmall,
}: IActionCard) {
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
            position: 'relative',
            display: 'flex',
            padding: '1rem',
            flexDirection: 'column',
            '&:last-child': {
              paddingBottom: '1rem',
            },
            gap: mdDown && !isSmall ? '1.25rem' : '1.5rem',
          }}
        >
          <Stack
            flexDirection='row'
            alignItems='center'
            justifyContent='space-between'
            gap='1rem'
            sx={{
              height: view === 'cards' ? '4rem' : 'auto',
            }}
          >
            <Status
              name={elem.status?.name}
              color={elem.status?.color}
              sx={{
                fontSize: '14px',
                alignSelf: 'center',
              }}
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
                permissionType: 'edit_actions',
                userId: userProfile?.id,
                ownerId: elem?.created_by?.id,
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: 'delete_actions',
                userId: userProfile?.id,
                ownerId: elem?.created_by?.id,
                isAdmin,
              })}
              url={`/actions/${elem.id}`}
            />
          </Stack>

          <Stack flexDirection='column' gap='0.5rem'>
            <Stack
              flexDirection='row'
              flexWrap='nowrap'
              alignItems='center'
              justifyContent='center'
              gap='0.5rem'
            >
              <Translation
                text={elem.translation?.name}
                sx={{
                  fontSize: '16px',
                  width: '40%',
                  textAlign: mdDown ? 'start' : 'start',
                }}
                color='text.secondary'
              />
              {mdDown && <Divider color='black' orientation='vertical' flexItem />}
              <Typography
                color='text.secondary'
                sx={{
                  fontSize: '16px',
                  width: '40%',
                  textAlign: mdDown ? 'center' : 'center',
                }}
              >
                {elem.library?.name}
              </Typography>
              {mdDown && <Divider color='black' orientation='vertical' flexItem />}

              <Priority
                priority={elem.priority?.name}
                color='text.secondary'
                sx={{
                  fontSize: '16px',
                  width: '40%',
                  textAlign: 'end',
                }}
              />
            </Stack>
          </Stack>

          <Stack flexDirection='row' justifyContent='center' alignItems='center' gap='2rem'>
            <Date date={elem.created_at} />
            {elem.created_by && <UserChip data={elem.created_by} />}
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function ActionsCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  handlePagination,
  cardsStorageActive,
  handleCardsStorage,
  pagePermissions,
  loading,
  view,
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
        availableAdd={isAdmin || !!pagePermissions['add_actions']}
        pageName='Actions'
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
          <SubIndustryCard
            key={row.id}
            elem={row}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            view={view}
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
