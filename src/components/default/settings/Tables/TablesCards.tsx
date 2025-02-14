import { useEffect, useState } from 'react';
import { Box, Stack, CardContent, Typography, useMediaQuery, Theme, Grow } from '@mui/material';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import Card from '@mui/material/Card';
import { IViewProps, ITableType } from './types';
import ScrollBtn from '../../common/components/ScrollBtn';

interface ITablesCard {
  elem: ITableType;
}

function TablesCard({ elem }: ITablesCard) {
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
            padding: '1rem',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Typography
            color='primary'
            sx={{
              fontSize: '20px',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {elem?.table_name}
          </Typography>
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '16px',
            }}
          >
            <Typography>Rows count: {elem?.rows_count}</Typography>
            <Typography>Size: {elem?.size_mb} MB</Typography>
          </Stack>
          <Stack
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '16px',
            }}
          >
            <Typography>Rows count: {elem?.last_id}</Typography>
            <Typography>Size: {elem?.type_id} MB</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function TablesCards({
  rows,
  searchValue,
  cardsStorageActive,
  handleCardsStorage,
  view,
  handleChangeView,
  handleSearch,
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
        handleChangeView={handleChangeView}
        pageName='Tables information'
        hideToolbarFilters
        searchValue={searchValue}
        handleSearch={handleSearch}
        availableExport
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
          <TablesCard key={row.table_name} elem={row} />
        ))}
      </Box>
      <ScrollBtn />
    </Stack>
  );
}
