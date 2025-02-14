import { MouseEvent, useEffect, useState } from 'react';
import {
  Box,
  Stack,
  CardContent,
  IconButton,
  Menu,
  Typography,
  MenuItem,
  useMediaQuery,
  Theme,
  Grow,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import InfinityScroll from '@/components/default/common/UI/InfinityScroll/InfinityScroll';
import ScrollBtn from '@/components/default/common/components/ScrollBtn';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import Card from '@mui/material/Card';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { IViewProps } from './types';
import dayjs from 'dayjs';
import Status from '../../common/components/Status';
import Translation from '../../common/components/Translation';
import Priority from '../../common/components/Priority';
import UserChip from '../../common/components/UserChip';
import Date from '../../common/components/Date';
import CardActionsButton from '../../common/components/CardActionsButton';
import MoreChips from '../../common/components/MoreChips';

interface IEntityBlockFields {
  elem: IEntityBlockFieldType;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  view: string;
  isSmall: boolean | undefined;
}

function EnityBlockFieldsCard({
  elem,
  handleActions,
  handleDeleteModal,
  view,
  isSmall,
}: IEntityBlockFields) {
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
            flexDirection: 'column',
            padding: '1.5rem 1rem',
            gap: !isSmall && !mdDown ? '1rem' : '.5rem',
          }}
        >
          <Stack
            flexDirection='row'
            justifyContent='center'
            alignItems='center'
            sx={{
              position: 'relative',
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
              }}
            >
              {elem.name}
            </Typography>
          </Stack>
          <Stack flexDirection='row' alignItems='center' justifyContent='space-between'>
            <Typography>{elem.entity_type_name}</Typography>
            <Typography>{elem.block_name}</Typography>
          </Stack>

          <Stack flexDirection='row' justifyContent='space-between'>
            <MoreChips data={elem.fields} propName='front_name' />
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function EntityBlockFieldsCards({
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
        pageName='Entity Block Fields'
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
          <EnityBlockFieldsCard
            key={row.id}
            elem={row}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
            view={view}
            isSmall={isSmall}
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
