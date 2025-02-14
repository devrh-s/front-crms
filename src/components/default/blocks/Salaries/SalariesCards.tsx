import Date from '@/components/default/common/components/Date';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';

interface ISalariesCardsProps {
  elem: ISalary;
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall?: boolean;
  url?: string;
}

function SalariesCard({ elem, handleActions, handleDeleteModal, url }: ISalariesCardsProps) {
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
            <ChipId id={+elem.id} />
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: '600',
              }}
            >
              {elem.salary_type.name}
            </Typography>
            <CardActionsButton
              id={elem.id as number}
              open={open}
              handleClick={handleClick}
              anchorEl={anchorEl}
              handleClose={handleClose}
              handleActions={handleActions}
              handleDeleteModal={handleDeleteModal}
              availableDelete
              availableEdit
              url={`/${url || 'salaries'}/${elem.id}`}
              visibleProfile={false}
            />
          </Stack>
          <Stack sx={{ p: '0 1rem' }} gap={'1rem'}>
            <Stack flexDirection={'row'} justifyContent={'space-between'}>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                {elem.currency.name + ' - ' + elem.value}
              </Typography>
              <Typography
                sx={{
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                {elem.hourly_currency.name + ' - ' + elem.hourly_cost}
              </Typography>
            </Stack>
            <Stack flexDirection={'row'} justifyContent={'space-between'}>
              <Date date={elem.start_date} />
              {elem.end_date && <Date date={elem.end_date} />}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

interface IProps {
  rows: Array<ISalary>;
  url?: string;
  view: string;
  searchValue: string;
  loading?: boolean;
  cardsStorageActive: boolean;
  handleCardsStorage: (value: boolean) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  paginationModel: GridPaginationModel;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  hideToolbarFilters?: boolean;
  commonData?: ICommonData;
  isSmall?: boolean;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
}

export default function SalariesCards({
  rows,
  url,
  searchValue,
  handleSearch,
  paginationModel,
  handlePagination,
  cardsStorageActive,
  handleCardsStorage,
  view,
  handleChangeView,
  handleDeleteModal,
  handleActions,
  toggleFilters,
  isSmall,
}: IProps) {
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
        availableAdd={false}
        searchValue={searchValue}
        handleSearch={handleSearch}
        toggleFilters={toggleFilters}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        pageName='Salaries'
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
          <SalariesCard
            key={row.id}
            elem={row}
            isSmall={isSmall}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            url={url}
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
