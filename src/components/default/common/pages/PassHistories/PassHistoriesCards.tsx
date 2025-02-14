import { Box, Stack, CardContent, Typography, useMediaQuery, Theme, Grow } from '@mui/material';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import Card from '@mui/material/Card';
import { IViewProps } from './types';
import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import { IPassHistory } from './types';
import Date from '@/components/default/common/components/Date';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

interface IIPassHistoryCard {
  elem: IPassHistory;
  isSmall: boolean | undefined;
}

function PassHistoryCard({ elem, isSmall }: IIPassHistoryCard) {
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
          <Stack flexDirection='row' justifyContent='center' alignItems='center'>
            <Typography
              color='primary'
              sx={{
                fontSize: '20px',
                fontWeight: '600',
              }}
            >
              {elem.password}
            </Typography>
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
                date={elem.created_at}
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
                date={elem.next_change_date}
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
  cardsStorageActive,
  handleCardsStorage,
  handlePagination,
  loading,
  view,
  handleChangeView,
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
        pageName='Pass Histories'
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
          <PassHistoryCard key={row.id} elem={row} isSmall={isSmall} />
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
