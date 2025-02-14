import { MouseEvent, useEffect, useState } from 'react';
import {
  Box,
  Stack,
  CardContent,
  Typography,
  useMediaQuery,
  Theme,
  Link as MLink,
} from '@mui/material';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import Card from '@mui/material/Card';
import { IViewProps } from './types';
import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import Status from '../../common/components/Status';
import Link from 'next/link';
import CardActionsButton from '../../common/components/CardActionsButton';
import { useAuthStore } from '@/zustand/authStore';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';

interface IAccountCard {
  elem: IAccount;
  isSmall?: boolean;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
}

function AccountCard({
  elem,
  handleActions,
  handleDeleteModal,
  isSmall,
  isAdmin,
  pagePermissions,
}: IAccountCard) {
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
          height: '100%',
          padding: '12px',
          flexDirection: 'column',
          '&:last-child': {
            paddingBottom: '12px',
          },
          gap: '12px',
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
            url={`/accounts/${elem.id}`}
            availableEdit={checkPermission({
              pagePermissions,
              permissionType: 'edit_accounts',
              userId: userProfile?.id,
              ownerId: elem.created_by?.id,
              isAdmin,
            })}
            availableDelete={checkPermission({
              pagePermissions,
              permissionType: 'delete_accounts',
              userId: userProfile?.id,
              ownerId: elem.created_by?.id,
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
        <Box
          sx={{
            flexGrow: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.3rem',
          }}
        >
          <Status name={elem?.status?.name} color={elem?.status?.color} view='card' />
          <Typography
            color='primary'
            sx={{
              fontSize: '12px',
              textAlign: 'center',
              maxWidth: '100px',
            }}
          >
            {elem.inner_client.name}
          </Typography>
          <Typography
            color='primary'
            sx={{
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            {elem.login}
          </Typography>
        </Box>
        {!isSmall && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.3rem',
            }}
          >
            <Typography
              variant='body2'
              sx={{
                fontSize: '12px',
                textAlign: 'center',
              }}
            >
              {elem.tool.name}
            </Typography>
            {elem.link && (
              <MLink
                component={Link}
                target='_blank'
                href={elem.link}
                underline='none'
                sx={{
                  fontSize: '14px',
                  color: 'rgba(0, 0, 0, 0.87)',
                  '&:hover': 'rgba(0, 0, 0, 0.87)',
                  '&:visited': 'rgba(0, 0, 0, 0.87)',
                }}
              >
                {elem.link?.length && elem.link.length > 13
                  ? `${elem.link?.slice(7, 23)}...`
                  : elem.link}
              </MLink>
            )}
            <Typography
              variant='body2'
              sx={{
                fontSize: '12px',
                textAlign: 'center',
              }}
            >
              {elem.owner.name}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function AccountsCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  cardsStorageActive,
  handleCardsStorage,
  handlePagination,
  loading,
  pagePermissions,
  view,
  handleChangeView,
  handleDeleteModal,
  handleActions,
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
        availableExport
        availableImport
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        availableAdd={isAdmin || !!pagePermissions['add_accounts']}
        pageName='Accounts'
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
          <AccountCard
            key={row.id}
            elem={row}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            isAdmin={isAdmin}
            pagePermissions={pagePermissions}
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
