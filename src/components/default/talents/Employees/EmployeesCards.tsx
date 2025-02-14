import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { checkPermission } from '@/lib/helpers';
import useUserProfile from '@/hooks/useUserProfile';
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
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import ScrollBtn from '../../common/components/ScrollBtn';
import Status from '../../common/components/Status';
import { IViewProps } from './types';

interface IEmployeeCard {
  elem: IEmployeeShort;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall: boolean | undefined;
}

function CandidateCard({
  elem,
  pagePermissions,
  isAdmin,
  isSmall,
  handleActions,
  handleDeleteModal,
}: IEmployeeCard) {
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
    elem?.candidate_url && {
      id: 2,
      name: 'Candidate',
      link: elem?.candidate_url,
      bgColor: 'primary',
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

  const transformedProfessions = {
    professions: elem.talents.professions.map((item) => ({
      id: item.profession.id,
      profession_id: item.profession.profession_id,
      name: item.profession.name,
    })),
  };

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
          id={elem?.id}
          open={open}
          handleClick={handleClick}
          anchorEl={anchorEl}
          handleClose={handleClose}
          handleActions={handleActions}
          handleDeleteModal={handleDeleteModal}
          availableEdit={checkPermission({
            pagePermissions,
            permissionType: 'edit_employees',
            userId: userProfile?.id,
            ownerId: elem.talents?.created_by?.id,
            isAdmin,
          })}
          availableDelete={checkPermission({
            pagePermissions,
            permissionType: 'delete_employees',
            userId: userProfile?.id,
            ownerId: elem.talents?.created_by?.id,
            isAdmin,
          })}
          url={`/employees/${elem?.id}`}
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
            flexDirection='row'
            justifyContent='space-between'
            alignItems='center'
            gap='1rem'
            sx={{
              width: '100%',
              '@media (max-width: 410px)': {
                gap: '1rem',
              },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                rowGap: '8px',
              }}
            >
              <Avatar src={elem?.user?.image} sx={{ width: 64, height: 64 }} />
              <ChipId id={elem?.id} />
            </Box>
            <Stack
              gap='4px'
              sx={{
                flex: '1',
              }}
            >
              <Stack
                flexDirection='row'
                justifyContent='start'
                sx={{
                  gap: '1rem',
                  width: '100%',
                }}
              >
                <NameLink
                  href={`/users/${elem?.user?.id}`}
                  name={elem?.user?.name}
                  sx={{
                    paddingLeft: '0',
                    color: 'primary',
                    '&:hover': 'primary',
                    '&:visited': 'primary',
                  }}
                />

                <Status name={elem?.talents?.status?.name} color={elem?.talents?.status?.color} />
              </Stack>

              <Typography variant='h5'>{elem?.names[0]?.name}</Typography>

              <MoreChips data={transformedProfessions?.professions} />
            </Stack>
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
        </CardContent>
      </Card>
    );
  }

  function renderBigCard() {
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
              id={elem?.id}
              open={open}
              handleClick={handleClick}
              anchorEl={anchorEl}
              handleClose={handleClose}
              handleActions={handleActions}
              handleDeleteModal={handleDeleteModal}
              url={`/employees/${elem?.id}`}
              availableEdit={checkPermission({
                pagePermissions,
                permissionType: 'edit_employees',
                userId: userProfile?.id,
                ownerId: elem.talents?.created_by?.id,
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: 'delete_employees',
                userId: userProfile?.id,
                ownerId: elem.talents?.created_by?.id,
                isAdmin,
              })}
            />
          </Stack>
          <Box
            sx={{
              position: 'relative',
            }}
          >
            <Avatar src={elem?.user?.image} sx={{ width: 145, height: 145 }} />
            <Chip
              label={elem?.id}
              sx={{
                position: 'absolute',
                backgroundColor: '#fff',
                boxShadow: '0 0 3px #000',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                bottom: '-.5rem',
                width: '4.5rem',
                height: '1.5rem',
              }}
            />
          </Box>
          <Stack alignItems='center'>
            <NameLink
              href={`/users/${elem?.user?.id}`}
              name={elem?.user?.name}
              sx={{
                color: 'primary',
                '&:hover': 'primary',
                '&:visited': 'primary',
                fontSize: '1.5rem',
                fontWeight: '700',
              }}
            />
          </Stack>

          <Status name={elem?.talents?.status?.name} color={elem?.talents?.status?.color} />

          <MoreChips data={elem.talents?.objects} />

          <MoreChips
            data={elem?.names?.map((item: any) => ({
              id: item?.id,
              name: `${item?.translation?.iso3}: ${item?.name}`,
            }))}
          />

          <MoreChips data={transformedProfessions?.professions} />
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
        </CardContent>
      </Card>
    );
  }
}

export default function EmployeesCards({
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
        availableAdd={isAdmin || !!pagePermissions['add_employees']}
        pageName='Employees'
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
