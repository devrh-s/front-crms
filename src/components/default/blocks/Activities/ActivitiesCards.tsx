import ChipId from '@/components/default/common/components/ChipId';
import Date from '@/components/default/common/components/Date';
import Note from '@/components/default/common/components/Note';
import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { useEffect, useState } from 'react';
import NameLink from '../../common/components/NameLink';
import { IActivity, IViewProps } from './types';

interface IActivityCard {
  elem: IActivity;
  isSmall: boolean | undefined;
  changeDescription: (newDewcription: string) => void;
}

function ActivityCard({ elem, isSmall, changeDescription }: IActivityCard) {
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
            padding: '1rem',
            flexDirection: 'column',
            gap: !isSmall && !mdDown ? '1rem' : '.5rem',
          }}
        >
          <Stack
            flexDirection='row'
            justifyContent='space-between'
            sx={{
              position: 'relative',
            }}
          >
            <ChipId id={elem.id} />
            <Typography
              sx={{
                fontWeight: 600,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {elem?.user?.name}
            </Typography>
            <Note value={elem.description} setNote={changeDescription} />
          </Stack>

          <Stack flexDirection='row' justifyContent='center' gap='5px'>
            <Typography component='span' fontSize='.9rem'>
              {elem.entityBlock.name}
            </Typography>
          </Stack>

          <Stack flexDirection='row' alignItems='center' justifyContent='space-between'>
            <NameLink
              href={elem.url?.id}
              name={elem?.url?.title}
              sx={{
                color: (theme: Theme) => theme.palette.primary.main,
                fontSize: '.8rem',
              }}
            />
            <Date date={elem.timestamp} />
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function ActivitiesCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  handlePagination,
  loading,
  cardsStorageActive,
  handleCardsStorage,
  changeDescription,
  view,
  handleChangeView,
  isSmall,
  fullScreen = true,
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
        hideToolbarViewToggle={fullScreen ? isSmall : true}
        pageName='Activities'
      />
      <Box
        className={mdDown ? 'mobile' : ''}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 345px)',
          justifyContent: 'center',
          gap: '2rem',
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
          <ActivityCard
            key={row.id}
            elem={row}
            isSmall={isSmall}
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
    </Stack>
  );
}
