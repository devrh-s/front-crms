import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';
import ChipSimple from '../../common/components/ChipSimple';
import CustomChip from '../../common/components/CustomChip';
import CustomLink from '../../common/components/CustomLink';
import Date from '../../common/components/Date';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import ScrollBtn from '../../common/components/ScrollBtn';
import Status from '../../common/components/Status';
import Text from '../../common/components/Text';
import UserChip from '../../common/components/UserChip';
import { IViewProps } from './types';

interface IJobPostsCard {
  elem: IJobPost;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall: boolean | undefined;
}

function JobPostCard({
  elem,
  pagePermissions,
  isAdmin,
  isSmall,
  handleActions,
  handleDeleteModal,
}: IJobPostsCard) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { userProfile } = useUserProfile();
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
          <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
            <ChipId id={elem.id} />
            <NameLink
              href={`job-posts/${elem.id}`}
              name={elem.name}
              target='_self'
              sx={{
                color: (theme: Theme) => theme.palette.primary.main,
                fontWeight: 600,
              }}
            />
            <CardActionsButton
              id={elem.id}
              open={open}
              handleClick={handleClick}
              anchorEl={anchorEl}
              handleClose={handleClose}
              handleActions={handleActions}
              handleDeleteModal={handleDeleteModal}
              availableEdit={checkPermission({
                pagePermissions,
                permissionType: 'edit_job_posts',
                userId: userProfile?.id,
                ownerId: elem.published_by.id,
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: 'delete_job_posts',
                userId: userProfile?.id,
                ownerId: elem.published_by.id,
                isAdmin,
              })}
              url={`/job-posts/${elem.id}`}
            />
          </Stack>
          <Stack
            flexDirection='row'
            justifyContent='space-between'
            alignItems={'center'}
            gap={mdDown ? '0.5rem' : '0.75rem'}
          >
            <Text
              text={`${elem.currency?.symbol}${elem?.cost}` as any}
              description={elem.currency?.name}
            />
            <CustomLink link={elem?.link} label='Link' />
            <CustomChip label={elem.country?.name} data={elem.country} />
          </Stack>

          {!isSmall ? (
            <Stack
              flexDirection='column'
              justifyContent='space-between'
              gap={mdDown ? '0.5rem' : '0.75rem'}
            >
              <Stack
                flexDirection='row'
                justifyContent='space-between'
                alignItems='center'
                gap='1rem'
              >
                <Typography
                  color='textSecondary'
                  sx={{
                    width: '50%',
                    wordBreak: 'break-all',
                  }}
                >
                  {elem.job_account?.name}
                </Typography>
                <Stack flexDirection='row' justifyContent='center' alignContent='center' gap='5px'>
                  <Typography color='textSecondary'>Sum jas</Typography>
                  <ChipSimple value={elem.sum_jas} />
                </Stack>
              </Stack>
              <MoreChips data={elem.contact_accounts} propName='name' />
              <Stack
                flexDirection='row'
                justifyContent='space-between'
                alignItems='center'
                gap='1rem'
              >
                <Status name={elem.status?.name} color={elem.status?.color} view={'card'} />
                <UserChip data={elem.published_by} />
              </Stack>
              <Stack
                flexDirection='row'
                justifyContent='space-between'
                alignItems='center'
                gap='2rem'
              >
                <Stack
                  flexDirection='column'
                  gap='.25rem'
                  sx={{
                    textAlign: 'center',
                    width: '50%',
                    color: '#292929',
                    boxShadow: '0 0 13px 0 rgba(0, 0, 0, 0.15)',
                    background: '#fff',
                    borderRadius: '20px',
                    padding: '0.5rem',
                  }}
                >
                  <Date
                    date={elem.publish_date}
                    sx={{
                      fontSize: '.75rem',
                      fontWeight: 700,
                    }}
                  />
                  <Typography fontSize='.625rem'>Publish date</Typography>
                </Stack>
                <Stack
                  flexDirection='column'
                  gap='.25rem'
                  sx={{
                    textAlign: 'center',
                    width: '50%',
                    color: '#292929',
                    boxShadow: '0 0 13px 0 rgba(0, 0, 0, 0.15)',
                    background: '#fff',
                    borderRadius: '20px',
                    padding: '0.5rem',
                  }}
                >
                  <Date
                    date={elem?.end_date ?? ''}
                    sx={{
                      fontSize: '.75rem',
                      fontWeight: 700,
                    }}
                  />
                  <Typography fontSize='.625rem'>End date</Typography>
                </Stack>
              </Stack>
            </Stack>
          ) : (
            <Stack
              flexDirection='column'
              justifyContent='space-between'
              gap={mdDown ? '0.5rem' : '0.75rem'}
            >
              <Stack
                flexDirection='row'
                justifyContent='space-between'
                alignItems='center'
                gap='1rem'
              >
                <Typography
                  color='textSecondary'
                  sx={{
                    width: '33.3%',
                    wordBreak: 'break-all',
                  }}
                >
                  {elem.job_account?.name}
                </Typography>
                <Stack
                  flexDirection='row'
                  justifyContent='center'
                  alignContent='center'
                  width='33.3%'
                  gap='5px'
                >
                  <Typography color='textSecondary'>Sum jas</Typography>
                  <ChipSimple value={elem.sum_jas} />
                </Stack>

                <Typography
                  color='textSecondary'
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '5px',
                    width: '33.3%',
                  }}
                >
                  {elem.published_by?.name}
                </Typography>
              </Stack>

              <Stack
                flexDirection='row'
                justifyContent='space-between'
                alignItems='center'
                gap='1rem'
              >
                <Status view={'card'} name={elem.status?.name} color={elem.status?.color} />
                <Stack
                  flexDirection='row'
                  justifyContent='center'
                  alignContent='center'
                  width='50%'
                  gap='5px'
                >
                  <Date
                    sx={{
                      fontSize: '.75rem',
                      fontWeight: 700,
                    }}
                    date={elem.publish_date}
                  />
                  <Typography
                    sx={{
                      fontSize: '.75rem',
                      fontWeight: 700,
                    }}
                    color='textSecondary'
                  >
                    -
                  </Typography>
                  <Date
                    sx={{
                      fontSize: '.75rem',
                      fontWeight: 700,
                    }}
                    date={elem?.end_date ?? ''}
                  />
                </Stack>
              </Stack>
            </Stack>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function UsersCards({
  rows,
  searchValue,
  pagePermissions,
  handleSearch,
  toggleFilters,
  paginationModel,
  handlePagination,
  loading,
  url,
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
  const { isAdmin } = useAuthStore();

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
        availableExport
        availableImport
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        availableAdd={isAdmin || !!pagePermissions['add_job_posts']}
        pageName='Job Posts'
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
        {visibleCards.map((card) => (
          <JobPostCard
            key={card.id}
            elem={card}
            isSmall={isSmall}
            isAdmin={isAdmin}
            pagePermissions={pagePermissions}
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
