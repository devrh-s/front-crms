import ChipId from '@/components/default/common/components/ChipId';
import Date from '@/components/default/common/components/Date';
import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../components/CardActionsButton';
import { IAccountUser, IViewProps } from './types';

interface IAccountUserCard {
  elem: IAccountUser;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall: boolean | undefined;
  url?: string;
}

function AccountUserCard({
  elem,
  isSmall,
  url,
  handleActions,
  handleDeleteModal,
}: IAccountUserCard) {
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
        sx={{
          width: '100%',
          position: 'relative',
          maxWidth: '350px',
          borderBottom: isSmall || mdDown ? 'none' : '7px solid #1976d2',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            padding: '1rem',
            flexDirection: 'column',
            gap: mdDown ? '0.5rem' : '1.5rem',
          }}
        >
          <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
            <ChipId id={elem.id} />

            <Typography
              color='primary'
              sx={{
                fontSize: '20px',
                fontWeight: '600',
              }}
            >
              {elem.user.name}
            </Typography>

            <CardActionsButton
              id={elem.id}
              open={open}
              handleClick={handleClick}
              anchorEl={anchorEl}
              handleClose={handleClose}
              handleActions={handleActions}
              handleDeleteModal={handleDeleteModal}
              availableEdit
              availableDelete
              url={`/${url}/${elem.id}`}
              visibleProfile={false}
            />
          </Stack>

          <Stack flexDirection='row' justifyContent='space-between' alignItems='center' gap='2rem'>
            <Stack
              flexDirection='column'
              gap='.25rem'
              sx={{
                textAlign: 'center',
                width: '50%',
                color: '#292929',
                boxShadow: '0 0 13px 0 rgba(0, 0, 0, 0.15)',
                background: '#fff',
                borderRadius: '20px',
                padding: '0.5rem',
              }}
            >
              <Date
                date={elem.start_date}
                sx={{
                  fontSize: '.75rem',
                  fontWeight: 700,
                }}
              />
              <Typography fontSize='.625rem'>Start date</Typography>
            </Stack>
            <Stack
              flexDirection='column'
              gap='.25rem'
              sx={{
                textAlign: 'center',
                width: '50%',
                color: '#292929',
                boxShadow: '0 0 13px 0 rgba(0, 0, 0, 0.15)',
                background: '#fff',
                borderRadius: '20px',
                padding: '0.5rem',
              }}
            >
              <Date
                date={elem.end_date}
                sx={{
                  fontSize: '.75rem',
                  fontWeight: 700,
                }}
              />
              <Typography fontSize='.625rem'>End date</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function AccountUsersCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  handlePagination,
  loading,
  view,
  url,
  handleActions,
  cardsStorageActive,
  handleCardsStorage,
  handleChangeView,
  handleDeleteModal,
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
        pageName='Account User'
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
          <AccountUserCard
            key={row.id}
            elem={row}
            isSmall={isSmall}
            url={url}
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
