import { Box, Stack, CardContent, Typography, useMediaQuery, Theme, Grow } from '@mui/material';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import Card from '@mui/material/Card';
import { IViewProps } from './types';
import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import { IVerificationAccount } from './types';
import Status from '@/components/default/common/components/Status';
import UserChip from '../../components/UserChip';
import { useEffect, useState } from 'react';
interface IVerificationAccountCard {
  elem: IVerificationAccount;
  isSmall: boolean | undefined;
}

function VerificationAccountCard({ elem, isSmall }: IVerificationAccountCard) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <Grow in>
      <Card
        sx={{
          width: '100%',
          position: 'relative',
          maxWidth: '350px',
          borderBottom: isSmall || mdDown ? 'none' : '7px solid #1976d2',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            padding: '1rem',
            flexDirection: 'column',
            gap: mdDown ? '0.5rem' : '1.5rem',
          }}
        >
          <Stack direction='row' justifyContent='center' alignItems='center' gap='1rem'>
            <Typography variant='h6'>{elem.job_account?.login}</Typography>
          </Stack>

          <Stack direction='row' justifyContent='space-between' alignItems='center' gap='1rem'>
            <Box>
              {elem.job_account?.status && (
                <Status
                  name={elem.job_account?.status?.name}
                  color={elem.job_account?.status?.color}
                />
              )}
            </Box>

            <Typography variant='body2' color='textSecondary'>
              {elem.job_account?.tool?.name}
            </Typography>

            <Box>{elem.job_account?.owner && <UserChip data={elem.job_account?.owner} />}</Box>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function VerificationAccountsCards({
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
        pageName='Account User'
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
          },
        }}
      >
        {visibleCards.map((row) => (
          <VerificationAccountCard key={row.id} elem={row} isSmall={isSmall} />
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
