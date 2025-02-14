import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import useUserProfile from '@/hooks/useUserProfile';
import { checkPermission } from '@/lib/helpers';
import { useAuthStore } from '@/zustand/authStore';
import { Box, CardContent, Grow, Stack, Theme, Typography, useMediaQuery } from '@mui/material';
import Card from '@mui/material/Card';
import { MouseEvent, useEffect, useState } from 'react';
import CardActionsButton from '../../common/components/CardActionsButton';
import LinkItem from '../../common/components/CustomLink';
import MoreChips from '../../common/components/MoreChips';
import { ITool, IViewProps } from './types';

interface IToolCard {
  elem: ITool;
  isAdmin: boolean;
  pagePermissions: { [permission: string]: string };
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  isSmall: boolean | undefined;
}

function ToolCard({
  elem,
  pagePermissions,
  isAdmin,
  isSmall,
  handleActions,
  handleDeleteModal,
}: IToolCard) {
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
          }}
        >
          <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
            <Typography
              sx={{
                fontSize: '20px',
                fontWeight: '600',
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
                permissionType: 'edit_tools',
                isAdmin,
              })}
              availableDelete={checkPermission({
                pagePermissions,
                permissionType: 'delete_tools',
                isAdmin,
              })}
              url={`/tools/${elem.id}`}
            />
          </Stack>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <LinkItem link={elem.link} />
            <Box
              className={isSmall ? 'small' : ''}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                '&.small': {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '8px',
                },
              }}
            >
              <Typography>Tool Types:</Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: '4px',
                  flexWrap: 'wrap',
                }}
              >
                <MoreChips data={elem.tool_types} propName='name' />
              </Box>
            </Box>
            <Box
              className={isSmall ? 'small' : ''}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                '&.small': {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '8px',
                },
              }}
            >
              <Typography>Entity blocks:</Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: '4px',
                  flexWrap: 'wrap',
                }}
              >
                <MoreChips data={elem.entity_blocks} propName='name' />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function ToolsCards({
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
        availableExport
        availableImport
        toggleFilters={toggleFilters}
        searchValue={searchValue}
        handleSearch={handleSearch}
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        availableAdd={isAdmin || !!pagePermissions['add_tools']}
        pageName='Tools'
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
          <ToolCard
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
