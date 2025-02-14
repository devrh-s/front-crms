import { MouseEvent, useEffect, useState } from 'react';
import {
  Box,
  Stack,
  Chip,
  Link,
  CardContent,
  IconButton,
  Menu,
  Typography,
  MenuItem,
  useMediaQuery,
  Theme,
  Grow,
} from '@mui/material';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import Card from '@mui/material/Card';
import { IViewProps } from './types';
import NameLink from '../../common/components/NameLink';
import Translation from '../../common/components/Translation';
import { useAuthStore } from '@/zustand/authStore';
import useUserProfile from '@/hooks/useUserProfile';
import CardActionsButton from '../../common/components/CardActionsButton';
import { checkPermission } from '@/lib/helpers';

interface IInnerClientCard {
  elem: IInnerClient;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall: boolean | undefined;
}

function InnerClientCard({
  elem,
  isSmall,
  pagePermissions,
  isAdmin,
  handleActions,
  handleDeleteModal,
}: IInnerClientCard) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { userProfile } = useUserProfile();

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
          className={isSmall ? 'small' : ''}
          sx={{
            display: 'flex',
            padding: '1rem',
            flexDirection: 'column',
            gap: '0.5rem',
            '&.small': {
              gap: '0',
              overflowX: 'auto',
              maxHeight: '190px',
            },
          }}
        >
          <Stack
            flexDirection='row'
            justifyContent='space-between'
            alignItems='center'
            gap='0.3rem'
          >
            <NameLink
              href={`/inner-clients/${elem.id}`}
              name={elem.name}
              sx={{
                color: 'primary',
                '&:hover': 'primary',
                '&:visited': 'primary',
                fontSize: '18px',
                fontWeight: '600',
              }}
            />
            <Translation
              text={elem.iso}
              color={'primary'}
              sx={{
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
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
                permissionType: 'edit_inner_clients',
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: 'delete_inner_clients',
                isAdmin,
              })}
              url={`/inner_clients/${elem.id}`}
            />
          </Stack>
          <Box
            className={isSmall ? 'small' : ''}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              '&.small': {
                gap: '0.1rem',
              },
            }}
          >
            <Typography
              color='primary'
              sx={{
                fontSize: '1rem',
                fontWeight: '600',
              }}
            >
              {elem.company_type?.name || ''}
            </Typography>
            <Link
              href={elem.website}
              color='primary'
              sx={{
                fontSize: '1rem',
              }}
              underline='hover'
            >
              {elem.website.length > 45 ? elem.website.slice(0, 45) + '..' : elem.website}
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function InnerClientsCards({
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
        rows={rows}
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        availableAdd={isAdmin || !!pagePermissions['add_inner_clients']}
        pageName='Inner clients'
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
          <InnerClientCard
            key={row.id}
            elem={row}
            isSmall={isSmall}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
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
