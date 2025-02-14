import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { Box, CardContent, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';
import Date from '../../common/components/Date';
import NameLink from '../../common/components/NameLink';
import UserChip from '../../common/components/UserChip';
import { ITokenType, IViewProps } from './types';

interface ITokensCard {
  elem: ITokenType;
  isSmall?: boolean;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
}

function TokensCard({ elem, handleActions, handleDeleteModal, isSmall }: ITokensCard) {
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
        <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
          <ChipId id={+elem.id} />
          <NameLink
            href={`tokens/${elem.id}`}
            name={elem.name}
            target='_self'
            sx={{
              color: (theme: Theme) => theme.palette.primary.main,
              fontWeight: 600,
            }}
          />
          <CardActionsButton
            id={+elem.id}
            open={open}
            handleClick={handleClick}
            anchorEl={anchorEl}
            handleClose={handleClose}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            availableDelete
            sx={{
              zIndex: 100,
            }}
          />
        </Stack>
        <Stack
          flexDirection='column'
          justifyContent='center'
          gap='1rem'
          flexGrow={1}
          sx={{
            flexGrow: '1',
          }}
        >
          <Typography
            sx={{
              fontSize: '.9rem',
              flex: 1,
              textAlign: 'center',
            }}
          >
            {elem.description}
          </Typography>
          <Typography
            sx={{
              fontSize: '.9rem',
              flex: 1,
              textAlign: 'center',
              wordBreak: 'break-all',
            }}
          >
            {elem.token}
          </Typography>
        </Stack>

        {!isSmall && (
          <>
            <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
              {elem.created_by !== undefined && <UserChip data={elem.created_by} />}
            </Stack>
            <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
              <Box display={'flex'} flexDirection={'column'} gap={'4px'}>
                <Typography fontSize={14}>Created At</Typography>
                <Date date={elem.created_at} sx={{ fontSize: '.9rem' }} />
              </Box>
              {elem?.expired_at && (
                <Box display={'flex'} flexDirection={'column'} gap={'4px'}>
                  <Typography fontSize={14}>Expired At</Typography>
                  <Date date={elem?.expired_at ?? ''} sx={{ fontSize: '.9rem' }} />
                </Box>
              )}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function TokensCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  handlePagination,
  loading,
  cardsStorageActive,
  handleCardsStorage,
  view,
  handleChangeView,
  handleDeleteModal,
  handleActions,
  isSmall,
}: IViewProps) {
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
        availableAdd
        pageName='Tokens'
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
            rowGap: '.9rem',
            alignItems: 'center',
            minHeight: '100dvh',
          },
        }}
      >
        {visibleCards.map((row) => (
          <TokensCard
            key={row.id}
            elem={row}
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
