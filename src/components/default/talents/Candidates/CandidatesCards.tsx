import Date from '@/components/default/common/components/Date';
import Status from '@/components/default/common/components/Status';
import Text from '@/components/default/common/components/Text';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import {
  Avatar,
  Box,
  CardContent,
  Chip,
  Grow,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';
import CustomChip from '../../common/components/CustomChip';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import ScrollBtn from '../../common/components/ScrollBtn';
import UserChip from '../../common/components/UserChip';
import { IViewProps } from './types';

interface ICandidateCard {
  elem: ICandidateShort;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall: boolean | undefined;
  handleActionsEmployee: (visible: boolean, id?: number | null) => void;
  handleActionsPresale: (visible: boolean, id?: number | null) => void;
}

function CandidateCard({
  elem,
  pagePermissions,
  isAdmin,
  isSmall,
  handleActions,
  handleDeleteModal,
  handleActionsEmployee,
  handleActionsPresale,
}: ICandidateCard) {
  const { userProfile } = useUserProfile();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const links = [
    elem?.employee_url && {
      id: 1,
      name: 'Employee',
      link: elem?.employee_url,
      bgColor: 'secondary',
    },
    elem?.presale_url && {
      id: 3,
      name: 'Presale',
      link: elem?.presale_url,
      bgColor: 'error',
    },
    elem?.job_application_url && {
      id: 4,
      name: 'Job Application',
      link: elem?.job_application_url,
      bgColor: 'warning',
    },
  ].filter(Boolean);

  return <Grow in>{isSmall ? renderSmallCard() : renderBigCard()}</Grow>;

  function renderSmallCard() {
    return (
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
          availableToEmployee
          availableToPresale
          disabledToEmployee={!!elem?.employee_url}
          disabledToPresale={!!elem?.presale_url}
          availableEdit={checkPermission({
            pagePermissions,
            permissionType: 'edit_candidates',
            userId: userProfile?.id,
            ownerId: elem.talents?.created_by?.id,
            isAdmin,
          })}
          availableDelete={checkPermission({
            pagePermissions,
            permissionType: 'delete_candidates',
            userId: userProfile?.id,
            ownerId: elem.talents?.created_by?.id,
            isAdmin,
          })}
          url={`/candidates/${elem.id}`}
          sx={{
            position: 'absolute',
            right: '0.5rem',
            top: 0,
            zIndex: 100,
          }}
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
            flexDirection='column'
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
              <Avatar src={elem.user?.image} sx={{ width: 64, height: 64 }} />
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
                <NameLink
                  href={`/users/${elem?.user?.id}`}
                  name={elem.user?.name}
                  sx={{
                    color: 'primary',
                    '&:hover': 'primary',
                    '&:visited': 'primary',
                  }}
                />
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  function renderBigCard() {
    const names = elem.names.map((item: any) => ({
      id: item.id,
      name: `${item.translation.iso3}: ${item.name}`,
    }));

    return (
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
              url={`/users/${elem.id}`}
              availableToEmployee
              availableToPresale
              disabledToEmployee={!!elem?.employee_url}
              disabledToPresale={!!elem?.presale_url}
              handleActionsEmployee={handleActionsEmployee}
              handleActionsPresale={handleActionsPresale}
              availableEdit={checkPermission({
                pagePermissions,
                permissionType: 'edit_users',
                userId: userProfile?.id,
                ownerId: elem.talents?.created_by?.id,
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: 'delete_users',
                userId: userProfile?.id,
                ownerId: elem.talents?.created_by?.id,
                isAdmin,
              })}
            />
            <Status name={elem?.talents?.status?.name} color={elem?.talents?.status?.color} />
          </Stack>
          <Box
            sx={{
              position: 'relative',
            }}
          >
            <Avatar src={elem.user?.image} sx={{ width: 125, height: 125 }} />
            <Chip
              label={elem.id}
              sx={{
                position: 'absolute',
                backgroundColor: '#fff',
                boxShadow: '0 0 3px #000',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                bottom: '-.5rem',
                width: '4rem',
                height: '1.5rem',
              }}
            />
          </Box>
          <Stack alignItems='center'>
            <NameLink
              href={`/users/${elem?.user?.id}`}
              name={elem.user?.name}
              sx={{
                color: 'primary',
                '&:hover': 'primary',
                '&:visited': 'primary',
                fontSize: '1.5rem',
                fontWeight: '700',
              }}
            />
          </Stack>
          <Stack alignItems='center' width={'100%'}>
            {elem.talents.professions.map((prof) => (
              <Typography key={prof.id}>{prof.profession.name}</Typography>
            ))}
          </Stack>
          <MoreChips data={names} />
          <Stack
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
            width={'100%'}
          >
            <Box display={'flex'} flexDirection={'column'} gap={'4px'} alignItems={'center'}>
              <Typography fontWeight={'bold'}>Short Name</Typography>
              <Typography>{elem.short_name}</Typography>
            </Box>
            <Box display={'flex'} flexDirection={'column'} gap={'4px'} alignItems={'center'}>
              <Typography fontWeight={'bold'}>Slug</Typography>
              <Typography>{elem.slug}</Typography>
            </Box>
            <Box display={'flex'} flexDirection={'column'} gap={'4px'} alignItems={'center'}>
              <Typography fontWeight={'bold'}>Is Student</Typography>
              <Typography>{elem.is_student ? 'Yes' : 'No'}</Typography>
            </Box>
          </Stack>
          <Stack
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
            width={'100%'}
          >
            <Date date={elem.birthday} />
            <Typography>{elem.age} years</Typography>
            <Typography>{elem.gender}</Typography>
          </Stack>
          <Stack
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
            width={'100%'}
          >
            <CustomChip label={elem?.country?.name} data={elem?.country} />
            <Typography>{elem.city.name}</Typography>
          </Stack>
          {links.length > 0 && (
            <Stack
              flexDirection='row'
              width={'100%'}
              flexGrow={1}
              alignItems={'center'}
              justifyContent={'space-between'}
            >
              <Typography>Links to profile:</Typography>
              <MoreChips data={links as Array<any>} />
            </Stack>
          )}
          <Stack display={'flex'} flexDirection={'column'} width={'100%'} gap={0.5}>
            {elem.talents.inner_client?.name && (
              <Typography display={'flex'}>
                Inner Client:{' '}
                <NameLink
                  href={`/inner-clients/${elem.talents?.inner_client?.id}`}
                  name={elem.talents.inner_client?.name ?? ''}
                />
              </Typography>
            )}
            <MoreChips data={elem.talents?.objects} />
            <Typography>Shift: {elem.talents.shift.name}</Typography>
            <Typography>
              Managers:{' '}
              {elem?.talents?.managers?.map((manager: any) => (
                <UserChip data={manager} key={manager.id} />
              ))}
            </Typography>
            {elem.talents?.tools.length > 0 && <MoreChips data={elem.talents?.tools} />}
            {elem.talents?.task_templates.length > 0 && (
              <MoreChips data={elem.talents?.task_templates} sx={{ display: 'flex' }} />
            )}
          </Stack>
          <Stack
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
            width={'100%'}
          >
            {elem.talents?.rates.length > 0 &&
              elem.talents?.rates.map((item: any) => (
                <Stack key={item.id} flexDirection='column' width={'fit-content'}>
                  <Text text={item.rate.name} />
                  <Typography variant='caption'>{item.shift.name}</Typography>
                </Stack>
              ))}
          </Stack>
          <Stack
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
            width={'100%'}
          >
            <Stack flexDirection='column' width={'fit-content'}>
              <Text text={'Created At'} />
              <Date date={elem.talents.created_at} />
            </Stack>
            <Stack flexDirection='column' width={'fit-content'}>
              <Text text={'Created By'} />
              <UserChip data={elem.talents.created_by!} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }
}

export default function CandidatesCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  handlePagination,
  pagePermissions,
  loading,
  view,
  cardsStorageActive,
  handleCardsStorage,
  handleChangeView,
  handleDeleteModal,
  handleActions,
  handleActionsEmployee,
  handleActionsPresale,
  isSmall,
}: IViewProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { isAdmin } = useAuthStore();
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
        availableAdd={isAdmin || !!pagePermissions['add_candidates']}
        pageName='Candidates'
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
          <CandidateCard
            key={row.id}
            elem={row}
            isSmall={isSmall}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            isAdmin={isAdmin}
            pagePermissions={pagePermissions}
            handleActionsEmployee={handleActionsEmployee}
            handleActionsPresale={handleActionsPresale}
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
