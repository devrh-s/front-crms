import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import {
  Box,
  CardContent,
  Chip,
  Grow,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import Time from '../../common/components/Time';
import { IShift, IViewProps } from './types';

interface IShiftCard {
  elem: IShift;
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall?: boolean;
}

function ShiftCard({ elem, isSmall, handleActions, handleDeleteModal }: IShiftCard) {
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
            <Box
              sx={{
                display: 'flex',
                gap: '0.6rem',
                alignItems: 'center',
              }}
            >
              <Chip
                label={elem.id}
                sx={{
                  backgroundColor: '#fff',
                  boxShadow: '0 0 3px #000',
                  width: '4.5rem',
                  height: '1.5rem',
                }}
              />
              <Typography
                color='primary'
                sx={{
                  fontSize: '20px',
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                {elem.name}
              </Typography>
            </Box>
            <CardActionsButton
              id={elem.id}
              open={open}
              handleClick={handleClick}
              anchorEl={anchorEl}
              handleClose={handleClose}
              handleActions={handleActions}
              availableEdit
              availableDelete
              handleDeleteModal={handleDeleteModal}
              url={`/shifts/${elem.id}`}
              visibleProfile={false}
            />
          </Stack>

          <Stack flexDirection='row' sx={{ padding: '1rem' }} gap='1rem'>
            <Stack
              flexDirection='row'
              gap='.8rem'
              sx={{
                textAlign: 'center',
                minWidth: '2rem',
                color: '#292929',
                boxShadow: '0 0 13px 0 rgba(0, 0, 0, 0.15)',
                background: '#fff',
                borderRadius: '20px',
                padding: '.8rem 1rem',
              }}
            >
              <Stack
                justifyContent='center'
                alignItems='center'
                sx={{
                  backgroundColor: '#F2F8FF',
                  borderRadius: '50%',
                  padding: '8px',
                }}
              >
                <AccessAlarmIcon color='primary' />
              </Stack>
              <Stack>
                <Time time={elem.start_time} fontWeight={700} />
                <Typography fontSize='.8rem'>Start time</Typography>
              </Stack>
            </Stack>
            <Stack
              flexDirection='row'
              gap='.8rem'
              sx={{
                textAlign: 'center',
                minWidth: '2rem',
                color: '#292929',
                boxShadow: '0 0 13px 0 rgba(0, 0, 0, 0.15)',
                background: '#fff',
                borderRadius: '20px',
                padding: '.8rem 1rem',
              }}
            >
              <Stack
                justifyContent='center'
                alignItems='center'
                sx={{
                  backgroundColor: '#F2F8FF',
                  borderRadius: '50%',
                  padding: '8px',
                }}
              >
                <AccessAlarmIcon color='primary' />
              </Stack>
              <Stack>
                <Time time={elem.end_time} fontWeight={700} />
                <Typography fontSize='.8rem'>End time</Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function ShiftsCards({
  rows,
  searchValue,
  handleSearch,
  paginationModel,
  handlePagination,
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
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        hideToolbarFilters
        pageName='Shifts'
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
          <ShiftCard
            key={row.id}
            elem={row}
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
    </Stack>
  );
}
