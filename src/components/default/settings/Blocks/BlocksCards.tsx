import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import { MouseEvent, useEffect, useState } from 'react';

import Card from '@mui/material/Card';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';
import MoreChips from '../../common/components/MoreChips';
import { IViewProps } from './types';

interface IBlockCard {
  elem: IBlock;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall?: boolean;
}

function BlockCard({ elem, isSmall, handleActions }: IBlockCard) {
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
              <ChipId id={elem.id} />
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
              disabledDuplicate
              availableEdit
              url={`/blocks/${elem.id}`}
              visibleProfile={false}
            />
          </Stack>

          <Stack flexDirection='row' justifyContent='center' gap='.5rem'>
            <Typography
              sx={{
                fontSize: '1rem',
              }}
            >
              {elem.table_name}
            </Typography>
          </Stack>
          <MoreChips data={elem.entities} propName='name' />
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function BlocksCards({
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
        pageName='Blocks'
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
          <BlockCard key={row.id} elem={row} isSmall={isSmall} handleActions={handleActions} />
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
