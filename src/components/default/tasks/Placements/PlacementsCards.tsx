import CustomChip from '@/components/default/common/components/CustomChip';
import LinkItem from '@/components/default/common/components/CustomLink';
import NameLink from '@/components/default/common/components/NameLink';
import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import Text from '@/components/default/common/components/Text';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';
import { IPlacementType, IViewProps } from './types';

interface IPlacementCard {
  elem: IPlacementType;
  pagePermissions: { [permission: string]: string };
  isAdmin: boolean;
  isSmall: boolean | undefined;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
}

function PlacementsCard({
  elem,
  isSmall,
  isAdmin,
  pagePermissions,
  handleActions,
  handleDeleteModal,
}: IPlacementCard) {
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
            display: 'flex',
            padding: '1rem',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <Stack
            flexDirection='row'
            justifyContent='space-between'
            alignItems='center'
            gap={'0.3rem'}
          >
            <ChipId id={elem.id} />

            <Typography
              sx={{
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: '600',
                textTransform: 'capitalize',
              }}
            >
              {elem.name.split('_').join(' ')}
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
                permissionType: 'edit_placements',
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: 'delete_placements',
                isAdmin,
              })}
              url={`/placements/${elem.id}`}
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
            {elem.tool?.name && (
              <NameLink href={elem.tool?.link ? elem.tool.link : ''} name={elem.tool?.name} />
            )}

            {elem?.link && <LinkItem link={elem.link} label={'Link'} />}
            <Text text={elem.placement_type.name} />
          </Box>

          {!isSmall && elem.accounts && elem.accounts?.length > 0 && (
            <Stack
              sx={{
                flexDirection: 'row',
                gap: '0.6rem',
                flexWrap: 'wrap',
              }}
            >
              {elem.accounts.map((acc) => (
                <CustomChip key={acc.id} data={acc} />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function PlacementsCards({
  rows,
  searchValue,
  loading,
  view,
  pagePermissions,
  paginationModel,
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
        availableAdd={isAdmin || !!pagePermissions['add_placements']}
        pageName='Placements'
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
          <PlacementsCard
            key={row.id}
            elem={row}
            pagePermissions={pagePermissions}
            isAdmin={isAdmin}
            isSmall={isSmall}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
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
