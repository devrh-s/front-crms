import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  CardContent,
  Chip,
  Grow,
  IconButton,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import { IViewProps } from './types';
import Text from '../../common/components/Text';

interface IPriorityCard {
  elem: IPriority;
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall?: boolean;
}

function PriorityCard({ elem, isSmall, handleActions, handleDeleteModal }: IPriorityCard) {
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
            <IconButton
              sx={{
                pointerEvents: 'none',
                visibility: 'hidden',
              }}
            >
              <MoreVertIcon color='primary' />
            </IconButton>
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
            <CardActionsButton
              id={elem.id}
              open={open}
              handleClick={handleClick}
              anchorEl={anchorEl}
              handleClose={handleClose}
              handleActions={handleActions}
              handleDeleteModal={handleDeleteModal}
              disableEdit={elem.name === 'Primary' || elem.name === 'Secondary'}
              availableEdit
              availableDelete
              url={`/priorities/${elem.id}`}
              visibleProfile={false}
            />
          </Stack>

          <Stack flexDirection='row' justifyContent='center' gap='.5rem'>
            <Chip
              label={elem.id}
              sx={{
                backgroundColor: '#fff',
                boxShadow: '0 0 3px #000',
                width: '4.5rem',
                height: '1.5rem',
              }}
            ></Chip>
          </Stack>

          <Stack flexDirection='row' justifyContent='center' alignItems='center' gap='.5rem'>
            <Chip
              label={elem.color}
              sx={{
                backgroundColor: elem.color,
              }}
            ></Chip>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function PrioritiesCards({
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
        pageName='Priorities'
        hideToolbarColumns
        hideToolbarFilters
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
          <PriorityCard
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
