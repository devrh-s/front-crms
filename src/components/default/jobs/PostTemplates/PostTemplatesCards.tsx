import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';
import Date from '../../common/components/Date';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import Status from '../../common/components/Status';
import Translation from '../../common/components/Translation';
import UserChip from '../../common/components/UserChip';
import { IViewProps } from './types';

interface IPostTemplatesCard {
  elem: IPostTemplate;
  pagePermissions: { [permission: string]: string };
  isAdmin: boolean;
  isSmall: boolean | undefined;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
}

function ProjectTemplatesCard({
  elem,
  isSmall,
  isAdmin,
  pagePermissions,
  handleActions,
  handleDeleteModal,
}: IPostTemplatesCard) {
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
          borderBottom: isSmall ? '4px solid #1976d2' : '7px solid #1976d2',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            padding: '1rem',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <Stack
            flexDirection='row'
            justifyContent='space-between'
            alignItems='center'
            position={'relative'}
          >
            <ChipId id={elem.id} />

            <NameLink
              href={`post-templates/${elem.id}`}
              name={elem.title}
              target='_self'
              sx={{
                color: (theme: Theme) => theme.palette.primary.main,
                width: 'max-content',
                fontWeight: 600,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
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
                permissionType: 'edit_placements',
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: 'delete_placements',
                isAdmin,
              })}
              url={`/post-templates/${elem.id}`}
            />
          </Stack>
          <Stack flexDirection={'row'} justifyContent={'center'} alignItems={'center'}>
            <Status name={elem.status?.name} color={elem.status?.color} />
          </Stack>
          <Stack flexDirection={'row'} justifyContent={'space-between'}>
            <Typography>{elem.job_template?.title}</Typography>
            <Typography>{elem.destination}</Typography>
          </Stack>
          <Stack flexDirection={'row'} justifyContent={'space-between'}>
            <MoreChips data={elem.languages ? elem.languages : []} propName='iso2' />
            <Translation text={elem.translation ? elem.translation.iso2 : ''} />
          </Stack>
          {!isSmall && (
            <>
              <Stack flexDirection={'row'} justifyContent={'center'}>
                <Typography>{elem.shift?.name}</Typography>
              </Stack>
              <Stack flexDirection='row' justifyContent='space-between'>
                <Date
                  date={elem.created_at}
                  sx={{
                    minWidth: 'max-content',
                  }}
                />
                <UserChip data={elem.created_by} />
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function PostTemplatesCards({
  rows,
  searchValue,
  loading,
  view,
  pagePermissions,
  paginationModel,
  isSmall,
  cardsStorageActive,
  handleCardsStorage,
  handleSearch,
  toggleFilters,
  handlePagination,
  handleChangeView,
  handleDeleteModal,
  handleActions,
}: IViewProps) {
  const { isAdmin } = useAuthStore();
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
        availableImport
        availableExport
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        availableAdd={isAdmin || !!pagePermissions['add_placements']}
        pageName='Post Templates'
        hideToolbarFilters
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
          <ProjectTemplatesCard
            key={row.id}
            elem={row}
            pagePermissions={pagePermissions}
            isAdmin={isAdmin}
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
