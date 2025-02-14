import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { Box, CardContent, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';
import MoreChips from '../../common/components/MoreChips';
import { IViewProps } from './types';

interface IFormatCard {
  elem: IFormats;
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall?: boolean;
}

function FormatCard({ elem, handleActions, handleDeleteModal, isSmall }: IFormatCard) {
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
        },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          padding: '1.25rem',
          flexDirection: 'column',
          '&:last-child': {
            paddingBottom: '1.5rem',
          },
          gap: '2rem',
        }}
      >
        <Stack flexDirection='row' justifyContent='space-between'>
          <Stack flexDirection='row' gap='0.5rem' alignItems='center'>
            <ChipId id={elem.id} />
            <Typography
              variant='h6'
              sx={{
                fontSize: '1.5rem',
                color: 'primary.main',
                fontWeight: '600',
              }}
            >
              {elem.name}
            </Typography>
          </Stack>
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
            url={`/formats/${elem.id}`}
            visibleProfile={false}
          />
        </Stack>
        <MoreChips data={elem.objects} propName='name' />
      </CardContent>
    </Card>
  );
}

export default function FormatsCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  handlePagination,
  loading,
  view,
  handleChangeView,
  handleDeleteModal,
  handleActions,
  isSmall,
  cardsStorageActive,
  handleCardsStorage,
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
        pageName='Formats'
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
          <FormatCard
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
