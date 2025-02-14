import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import { Box, CardContent, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';
import Date from '../../common/components/Date';
import MoreChips from '../../common/components/MoreChips';
import Status from '../../common/components/Status';
import Translation from '../../common/components/Translation';
import UserChip from '../../common/components/UserChip';
import CustomToolbar from '../../common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '../../common/UI/InfinityScroll/InfinityScroll';
import { IViewProps } from './types';

interface IObjectCard {
  elem: IObject;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall: boolean | undefined;
}

function ObjectCard({
  elem,
  pagePermissions,
  isAdmin,
  handleActions,
  handleDeleteModal,
  isSmall,
}: IObjectCard) {
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

  return (
    <Card
      className={mdDown ? 'mobile' : ''}
      sx={{
        width: 345,
        borderBottom: isSmall ? '4px solid #1976d2' : '7px solid #1976d2',
      }}
    >
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          padding: 0,
          flexDirection: 'column',
          gap: '.5rem',
          '&:last-child': {
            pb: '18px',
          },
        }}
      >
        <Box
          className={isSmall ? 'small' : 'normal'}
          sx={{
            overflow: 'hidden',
            '& .eaflet-container': {
              width: 313,
            },
            '& .leaflet-tile': {
              width: '100%!important',
              transform: 'unset!important',
            },
            '&.normal': {},
          }}
        ></Box>
        <Stack
          flexDirection='row'
          justifyContent='space-between'
          alignItems='center'
          sx={{ padding: '0 1rem' }}
        >
          <ChipId id={elem.object_id} />
          <Typography
            color='primary'
            sx={{
              fontSize: '16px',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {elem.name}
          </Typography>

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
              permissionType: 'edit_objects',
              userId: userProfile?.id,
              ownerId: elem?.created_by?.id,
              isAdmin,
            })}
            availableDelete={checkPermission({
              pagePermissions,
              permissionType: 'delete_objects',
              userId: userProfile?.id,
              ownerId: elem?.created_by?.id,
              isAdmin,
            })}
            url={`/objects/${elem.id}`}
          />
        </Stack>
        <Stack sx={{ p: '0 1rem' }} gap={'1rem'} flex={1}>
          <Stack gap={'1rem'} flex={1}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <Box justifyContent='center' display='flex' alignItems='center' gap='0.2rem'>
                <Typography
                  sx={{
                    fontSize: '14px',
                    textTransform: 'capitalize',
                  }}
                >
                  {elem.library.name}
                </Typography>
                |
                <Translation text={elem.translation?.name} />
                |
                <Status
                  name={elem.status?.name}
                  color={elem.status?.color}
                  sx={{ alignSelf: 'center', fontSize: '14px' }}
                />
              </Box>
              {elem.professions?.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                  }}
                >
                  <Stack justifyContent='center' gap='4px' flexWrap='wrap'>
                    <MoreChips data={elem.professions} propName='name' />
                  </Stack>
                </Box>
              )}
            </Box>
            {!isSmall && (
              <>
                {elem?.guides?.length > 0 && (
                  <Stack>
                    <MoreChips data={elem?.guides} />
                  </Stack>
                )}

                {elem?.formats?.length > 0 && (
                  <Stack>
                    <MoreChips data={elem?.formats} />
                  </Stack>
                )}
                {elem?.links && elem.links.length > 0 && (
                  <Stack>
                    <MoreChips data={elem?.links} />
                  </Stack>
                )}
              </>
            )}
          </Stack>
          {!isSmall && (
            <Stack flexDirection={'row'} justifyContent={'space-between'}>
              <Date date={elem.created_at ? elem.created_at : ''} />
              {elem.created_by && <UserChip data={elem.created_by} />}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ObjectsCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  handlePagination,
  cardsStorageActive,
  handleCardsStorage,
  pagePermissions,
  loading,
  view,
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
        availableAdd={isAdmin || !!pagePermissions['add_objects']}
        pageName='Objects'
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
          <ObjectCard
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
