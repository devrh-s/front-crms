import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import JSONModal from '@/components/default/common/modals/JSONModal/JSONModal';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';
import MoreChips from '../../common/components/MoreChips';
import { ICompanyType, IViewProps } from './types';

interface ICompanyTypeCard {
  elem: ICompanyType;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  changeDescription: (newDescription: string) => void;
  isSmall: boolean | undefined;
}

function CompanyTypeCard({ elem, isSmall, handleActions, handleDeleteModal }: ICompanyTypeCard) {
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
          borderWidth: isSmall ? '4px' : '7px',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            padding: '1rem',
            flexDirection: 'column',
            gap: isSmall ? '0' : mdDown ? '1rem' : '1.5rem',
            '&:last-child': {
              paddingBottom: '1rem',
            },
          }}
        >
          <Stack flexDirection='row' justifyContent='space-between'>
            <ChipId id={elem.id} />

            {!isSmall && (
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
            )}

            <CardActionsButton
              id={elem.id}
              open={open}
              handleClick={handleClick}
              anchorEl={anchorEl}
              handleClose={handleClose}
              handleActions={handleActions}
              handleDeleteModal={handleDeleteModal}
              url={`/company-types/${elem.id}`}
              visibleProfile={false}
            />
          </Stack>
          <Stack
            flexDirection='row'
            flexWrap='wrap'
            alignItems='center'
            columnGap='10px'
            rowGap='12px'
            sx={{
              padding: '4px 0',
            }}
          >
            {isSmall && (
              <Typography
                variant='h6'
                sx={{
                  fontSize: '1.5rem',
                  color: 'primary.main',
                  fontWeight: '600',
                  marginRight: '0.75rem',
                }}
              >
                {elem.name}
              </Typography>
            )}

            <MoreChips data={elem.inner_clients} propName='name' />
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function CompanyTypesCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
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
  const [description, setDescription] = useState('');
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const changeDescription = (newDescription: string) => setDescription(newDescription);
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
        pageName='Company Types'
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
          <CompanyTypeCard
            key={row.id}
            elem={row}
            isSmall={isSmall}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            changeDescription={changeDescription}
          />
        ))}
      </Box>
      <InfinityScroll
        paginationModel={paginationModel}
        handlePagination={handlePagination}
        handleCardsStorage={handleCardsStorage}
      />
      <ScrollBtn />
      <JSONModal json={description} handleClose={() => setDescription('')} />
    </Stack>
  );
}
