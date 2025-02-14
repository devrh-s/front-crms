import { MouseEvent, useEffect, useState } from 'react';
import {
  Box,
  Divider,
  Stack,
  CardContent,
  Typography,
  useMediaQuery,
  Theme,
  Grow,
} from '@mui/material';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import Card from '@mui/material/Card';
import { IViewProps, ILibrary } from './types';
import dayjs from 'dayjs';
import Status from '../../common/components/Status';
import Date from '../../common/components/Date';
import UserChip from '../../common/components/UserChip';
import Priority from '../../common/components/Priority';
import Translation from '../../common/components/Translation';

interface ILibraryCard {
  elem: ILibrary;
}

function LibraryCard({ elem }: ILibraryCard) {
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
            padding: '1rem',
            flexDirection: 'column',
            gap: '.8rem',
          }}
        >
          <Typography color='primary' textAlign='center' fontWeight={700}>
            {elem.name}
          </Typography>
          <Stack flexDirection='row' justifyContent='space-between' flexGrow={1}>
            <Priority
              sx={{ fontSize: '16px', textAlign: 'center', flex: 1 }}
              priority={elem.priority?.name}
            />
            <Divider orientation='vertical' flexItem />
            <Typography flex='1' textAlign='center'>
              {elem.library?.name}
            </Typography>
            <Divider orientation='vertical' flexItem />
            <Typography flex='1' textAlign='center'>
              {elem.entity?.name}
            </Typography>
          </Stack>

          <Stack flexDirection='row' justifyContent='space-between'>
            <Box sx={{ width: '50%', display: 'flex', justifyContent: 'center' }}>
              <Status name={elem.status?.name} color={elem.status?.color} />
            </Box>
            <Divider orientation='vertical' flexItem />
            <Translation
              text={elem.translation?.iso3}
              sx={{ width: '50%', fontSize: '16px', textAlign: 'center' }}
            />
          </Stack>

          <Stack flexDirection='row' justifyContent='center' gap='2rem' flexGrow={1}>
            <Date date={elem.created_at} />
            {elem.created_by && <UserChip data={elem.created_by} />}
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function LibrariesCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  cardsStorageActive,
  handleCardsStorage,
  handlePagination,
  view,
  handleChangeView,
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
        pageName='Libraries'
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
          <LibraryCard key={row.id} elem={row} />
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
