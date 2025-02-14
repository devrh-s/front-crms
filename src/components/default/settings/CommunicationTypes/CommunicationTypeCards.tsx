import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import MoreChips from '../../common/components/MoreChips';
import { IViewProps } from './types';

interface ICommunicationTypeCard {
  elem: ICommunicationType;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall: boolean | undefined;
}

function CommunicationTypeCard({
  elem,
  isSmall,
  handleActions,
  handleDeleteModal,
}: ICommunicationTypeCard) {
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
          }}
        >
          <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
            <Typography
              color='primary'
              sx={{
                fontSize: '20px',
                fontWeight: '600',
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
              availableEdit
              availableDelete
              handleDeleteModal={handleDeleteModal}
              url={`/communication-types/${elem.id}`}
              visibleProfile={false}
            />
          </Stack>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <Box
              className={isSmall ? 'small' : ''}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                '&.small': {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '8px',
                },
              }}
            >
              {elem.entity_blocks && (
                <>
                  <Typography>Entity blocks:</Typography>
                  <MoreChips data={elem.entity_blocks} propName='name' />
                </>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function CommunicationTypeCards({
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
        pageName='Communication types'
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
          <CommunicationTypeCard
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
      <ScrollBtn />
    </Stack>
  );
}
