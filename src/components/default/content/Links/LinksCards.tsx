import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import { Box, CardContent, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { Dispatch, MouseEvent, SetStateAction, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import ChipId from '../../common/components/ChipId';
import Date from '../../common/components/Date';
import MoreChips from '../../common/components/MoreChips';
import NameLink from '../../common/components/NameLink';
import Note from '../../common/components/Note';
import Status from '../../common/components/Status';
import UserChip from '../../common/components/UserChip';
import HTMLModal from '../../common/modals/HTMLModal/HTMLModal';
import { IViewProps } from './types';

interface ILinkCard {
  elem: ILink;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  setNote: Dispatch<SetStateAction<string>>;
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall?: boolean;
}

function LinkCard({
  elem,
  setNote,
  pagePermissions,
  isAdmin,
  handleActions,
  handleDeleteModal,
  isSmall,
}: ILinkCard) {
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
        '&.mobile': {
          width: '100%',
          maxWidth: 345,
          borderBottom: isSmall ? '4px solid #1976d2' : '7px solid #1976d2',
        },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          padding: '1.25rem',
          flexDirection: 'column',
          height: '100%',
          '&:last-child': {
            paddingBottom: '1.5rem',
          },
          gap: '1rem',
        }}
      >
        <Stack
          flexDirection='row'
          justifyContent='space-between'
          gap={'0.5rem'}
          alignItems='center'
        >
          <ChipId id={+elem.id} />
          <Typography
            variant='h6'
            sx={{
              fontSize: '1.1rem',
              color: 'primary.main',
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
              permissionType: 'edit_links',
              userId: userProfile?.id,
              ownerId: elem.created_by?.id,
              isAdmin,
            })}
            availableDelete={checkPermission({
              pagePermissions,
              permissionType: 'delete_links',
              userId: userProfile?.id,
              ownerId: elem.created_by?.id,
              isAdmin,
            })}
            url={`/link/${elem.id}`}
            visibleProfile={false}
          />
        </Stack>

        <Stack
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Typography>{elem?.url}</Typography>

          <Note value={elem.description ?? ''} setNote={setNote} style={{ padding: '.5rem' }} />
        </Stack>

        <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
          <Status name={elem.status?.name} color={elem.status?.color} view='table' />
          <Typography>{elem.tool?.name}</Typography>
          <Typography>{elem.format?.name}</Typography>
        </Stack>

        <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
          <Typography>{elem.object?.name}</Typography>
          <Typography> {elem.owner?.name}</Typography>
        </Stack>

        <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
          <MoreChips data={elem?.professions} />
          <NameLink href={elem?.inner_client?.link} name={elem?.inner_client?.name} />
        </Stack>

        <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
          {elem.created_by !== undefined && <UserChip data={elem?.created_by} />}
          <Date date={elem.created_at} sx={{ fontSize: '.9rem' }} />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function LinksCards({
  rows,
  searchValue,
  handleSearch,
  toggleFilters,
  paginationModel,
  pagePermissions,
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
  const [note, setNote] = useState('');
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
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        availableAdd={isAdmin || !!pagePermissions['add_links']}
        pageName='Links'
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
          <LinkCard
            key={row.id}
            elem={row}
            setNote={setNote}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            isSmall={isSmall}
            isAdmin={isAdmin}
            pagePermissions={pagePermissions}
          />
        ))}
      </Box>
      <HTMLModal html={note} handleClose={() => setNote('')} />
      <InfinityScroll
        paginationModel={paginationModel}
        handlePagination={handlePagination}
        handleCardsStorage={handleCardsStorage}
      />
      <ScrollBtn />
    </Stack>
  );
}
