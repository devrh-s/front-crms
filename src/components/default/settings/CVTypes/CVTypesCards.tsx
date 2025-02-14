import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';
import ScrollBtn from '../../common/components/ScrollBtn';
import { IViewProps } from './types';

interface ICVTypeCard {
  elem: ICVType;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall: boolean | undefined;
}

function CVTypeCard({ elem, isSmall, handleActions, handleDeleteModal }: ICVTypeCard) {
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
      {isSmall ? (
        <Card
          sx={{
            width: '100%',
            position: 'relative',
            maxWidth: '350px',
            borderBottom: isSmall ? '4px solid #1976d2' : '7px solid #1976d2',
          }}
        >
          <CardActionsButton
            id={elem.id}
            open={open}
            handleClick={handleClick}
            anchorEl={anchorEl}
            handleClose={handleClose}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            sx={{
              position: 'absolute',
              right: '0.5rem',
              top: 0,
              zIndex: 100,
            }}
            url={`/cv-types/${elem.id}`}
            visibleProfile={false}
          />
          <CardContent
            sx={{
              display: 'flex',
              padding: '1.5rem  1rem',
              flexDirection: 'row',
              alignItems: 'space-between',
              gap: '1.5rem',
              '@media (max-width: 410px)': {
                padding: '1rem',
              },
              '&:last-child': {
                paddingBottom: '0.75rem',
              },
            }}
          >
            <Stack
              flexDirection='row'
              justifyContent='space-between'
              alignItems='center'
              gap='1rem'
              sx={{
                width: '100%',
                '@media (max-width: 410px)': {
                  gap: '0.5rem',
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  rowGap: '8px',
                }}
              >
                <ChipId id={elem.id} />
              </Box>
              <Stack
                alignItems='center'
                gap='4px'
                sx={{
                  flex: '1',
                }}
              >
                <Typography
                  variant='h5'
                  sx={{
                    fontWeight: 600,
                    fontSize: '16px',
                    color: '#828282',
                  }}
                >
                  {elem.name}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={mdDown ? 'mobile' : ''}
          sx={{
            width: 345,
            borderBottom: '7px solid #1976d2',
            '&.mobile': {
              width: '100%',
              maxWidth: 345,
            },
          }}
        >
          <CardContent
            sx={{
              display: 'flex',
              padding: '1rem',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
            }}
          >
            <Stack
              flexDirection='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{
                width: '100%',
              }}
            >
              <CardActionsButton
                id={elem.id}
                open={open}
                handleClick={handleClick}
                anchorEl={anchorEl}
                handleClose={handleClose}
                handleActions={handleActions}
                handleDeleteModal={handleDeleteModal}
              />
            </Stack>
            <Stack alignItems='center'>
              <Typography typography={'h5'}>{elem.name}</Typography>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Grow>
  );
}

export default function CVTypesCards({
  rows,
  searchValue,
  handleSearch,
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
        padding: '1rem 0 1rem',
        minHeight: mdDown ? 'calc(80dvh - 2rem - 64px)' : 'calc(80dvh - 2rem - 56px)',
      }}
    >
      <CustomToolbar
        view={view}
        hideToolbarFilters
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        pageName='CV Types'
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
          <CVTypeCard
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
