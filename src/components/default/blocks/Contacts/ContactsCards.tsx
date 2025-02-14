import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import CustomLink from '../../common/components/CustomLink';
import { IViewProps } from './types';

interface IContactProps {
  elem: IContact;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  permType: string;
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall?: boolean;
  url?: string;
}

function ContactCard({
  elem,
  isAdmin,
  pagePermissions,
  permType,
  handleActions,
  handleDeleteModal,
  url,
}: IContactProps) {
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
            padding: 0,
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <Stack
            flexDirection='row'
            justifyContent='space-between'
            alignItems='center'
            sx={{ padding: '1rem 1rem 0 1rem' }}
          >
            <CustomLink
              link={elem.tool?.link ?? ''}
              label={elem.tool?.name ?? ''}
              sx={{
                fontSize: '16px',
                fontWeight: '600',
                maxWidth: '50%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            />

            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: '600',
                width: '50%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {elem.value}
            </Typography>

            <CardActionsButton
              id={elem.id as number}
              open={open}
              handleClick={handleClick}
              anchorEl={anchorEl}
              handleClose={handleClose}
              handleActions={handleActions}
              handleDeleteModal={handleDeleteModal}
              availableEdit={checkPermission({
                pagePermissions,
                permissionType: `edit${permType}_contacts`,
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: `delete${permType}_contacts`,
                isAdmin,
              })}
              url={`${url || 'contacts'}/${elem.id}`}
              visibleProfile={false}
              disabledDuplicate
            />
          </Stack>

          <Stack padding={'0 1rem'}>
            {elem.relation?.url && (
              <Box display={'flex'} gap={1}>
                <Typography>Relation:</Typography>
                <CustomLink
                  link={elem.relation?.url ?? ''}
                  label={elem.relation?.default_title ?? ''}
                />
              </Box>
            )}
            {elem.located_at?.name && (
              <Box display={'flex'} gap={1}>
                <Typography>Located At :</Typography>
                <Typography>{elem.located_at?.name}</Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function StatusesCards({
  rows,
  url,
  searchValue,
  handleSearch,
  paginationModel,
  handlePagination,
  pagePermissions,
  permType,
  loading,
  view,
  cardsStorageActive,
  handleCardsStorage,
  handleChangeView,
  handleDeleteModal,
  handleActions,
  toggleFilters,
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
        searchValue={searchValue}
        handleSearch={handleSearch}
        toggleFilters={toggleFilters}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        availableAdd={!!url && (isAdmin || !!pagePermissions[`add${permType}_contacts`])}
        pageName='Contacts'
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
          <ContactCard
            key={row.id}
            url={url}
            elem={row}
            isSmall={isSmall}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            isAdmin={isAdmin}
            pagePermissions={pagePermissions}
            permType={permType}
          />
        ))}
      </Box>
      <InfinityScroll
        paginationModel={paginationModel}
        handlePagination={handlePagination}
        handleCardsStorage={handleCardsStorage}
      />
    </Stack>
  );
}
