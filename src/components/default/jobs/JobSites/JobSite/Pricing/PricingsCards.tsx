import CardActionsButton from '@/components/default/common/components/CardActionsButton';
import Date from '@/components/default/common/components/Date';
import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import UserChip from '@/components/default/common/components/UserChip';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import { IPricing, IViewProps } from './types';

interface IPricingCard {
  id: number;
  elem: IPricing;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall?: boolean | undefined;
}

function PricingCard({ id, elem, isSmall, handleActions, handleDeleteModal }: IPricingCard) {
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
          borderBottom: !isSmall && !mdDown ? '7px solid #1976d2' : 'unset',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: !isSmall && !mdDown ? '1rem' : '.5rem',
            paddingTop: 0,
          }}
        >
          <Stack
            flexDirection='row'
            justifyContent='flex-end'
            alignItems='center'
            sx={{
              position: 'relative',
            }}
          >
            <Typography
              sx={{
                color: (theme: Theme) => theme.palette.primary.main,
                fontWeight: 600,
                position: 'absolute',
                textTransform: 'capitalize',
                bottom: 0,
                left: '50%',
                transformX: 'translate(-50%)',
              }}
            >
              {elem.package_name}
            </Typography>
            <CardActionsButton
              id={elem.id}
              open={open}
              handleClick={handleClick}
              anchorEl={anchorEl}
              handleClose={handleClose}
              handleActions={handleActions}
              handleDeleteModal={handleDeleteModal}
              url={`/job-sites/${id}/pricings/${elem.id}`}
              visibleProfile={false}
            />
          </Stack>
          <Stack
            flexDirection='row'
            justifyContent='center'
            alignItems='center'
            gap='1rem'
            sx={{ padding: '0 1rem' }}
          >
            <Typography color='primary' fontSize='.9rem' textTransform='capitalize'>
              {elem.pricing_type.name}
            </Typography>
            <Typography color='primary'>
              <Typography
                component='span'
                sx={{
                  fontSize: !isSmall && !mdDown ? '1.2rem' : '1rem',
                  fontWeight: '700',
                }}
              >
                {elem.currency.symbol}
              </Typography>
              <Typography
                component='span'
                sx={{
                  fontSize: !isSmall && !mdDown ? '1.2rem' : '1rem',
                  fontWeight: '700',
                }}
              >
                {elem.price}
              </Typography>
            </Typography>
          </Stack>
          <Stack flexDirection='row' justifyContent='center' gap='2rem'>
            <Date
              date={elem.created_at}
              sx={{
                minWidth: 'max-content',
              }}
            />
            <UserChip data={elem.created_by} />
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function PricingsCards({
  id,
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  isSmall,
  loading,
  view,
  cardsStorageActive,
  handleCardsStorage,
  handlePagination,
  handleChangeView,
  handleDeleteModal,
  handleActions,
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
        pageName='Pricing'
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
          <PricingCard
            id={id}
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
