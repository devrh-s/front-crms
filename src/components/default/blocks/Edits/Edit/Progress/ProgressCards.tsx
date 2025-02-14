import CardActionsButton from '@/components/default/common/components/CardActionsButton';
import ChipId from '@/components/default/common/components/ChipId';
import Date from '@/components/default/common/components/Date';
import Status from '@/components/default/common/components/Status';
import UserChip from '@/components/default/common/components/UserChip';
import CustomToolbar from '@/components/default/common/UI/CustomToolbar/CustomToolbar';
import {
  Box,
  Card,
  CardContent,
  Grow,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { MouseEvent, useState } from 'react';
import Text from '../../../../common/components/Text';
import { IEditProgress } from '../../types';

interface IProgressCardProps {
  elem: IEditProgress;
  handleDeleteModal: (open: boolean, id?: number[]) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
}

function ProgressCard({ elem, handleActions, handleDeleteModal }: IProgressCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const open = Boolean(anchorEl);
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Grow in>
      <Card
        className={mdDown ? 'mobile' : ''}
        sx={{
          width: 345,
          borderBottom: '7px solid #1976d2',
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
          <Stack flexDirection='row' justifyContent='space-between' alignItems={'center'}>
            <ChipId id={+elem.id} />
            <Text
              text={elem.type}
              sx={{
                color: (theme: Theme) => theme.palette.primary.main,
                fontWeight: 600,
              }}
            />
            <CardActionsButton
              id={elem.id as number}
              open={open}
              handleClick={handleClick}
              anchorEl={anchorEl}
              handleClose={handleClose}
              handleActions={handleActions}
              handleDeleteModal={handleDeleteModal}
              availableEdit
              availableDelete
              url={`edit-progress/${elem.id}`}
              visibleProfile={false}
            />
          </Stack>
          <Status
            name={elem?.status?.name}
            color={elem?.status?.color}
            sx={{ width: 'fit-content', margin: '0 auto' }}
          />
          <Stack flexDirection='column'>
            <Stack flexDirection={'row'} gap={1}>
              <Typography fontWeight={'bold'}>Done:</Typography>
              <Typography>{elem?.done ? 'Yes' : 'No'}</Typography>
            </Stack>
            {elem?.completed_at && (
              <Stack flexDirection={'row'} gap={1}>
                <Typography fontWeight={'bold'}>Completed At:</Typography>
                <Date date={elem?.completed_at} />
              </Stack>
            )}
          </Stack>
          <Stack flexDirection='row' justifyContent='space-between' alignItems='center'>
            {elem.created_by !== undefined && <UserChip data={elem.created_by} />}
            <Date date={elem.created_at} sx={{ fontSize: '.9rem' }} />
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
}

export default function ProgressCards({
  rows,
  view,
  handleChangeView,
  handleActions,
  handleDeleteModal,
}: any) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

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
        handleChangeView={handleChangeView}
        handleActions={handleActions}
        pageName='Progress'
        availableAdd={false}
        hideToolbarFilters
        hideToolbarSearch
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
        {rows.map((card: IEditProgress) => (
          <ProgressCard
            key={card.id}
            elem={card}
            handleActions={handleActions}
            handleDeleteModal={handleDeleteModal}
          />
        ))}
      </Box>
    </Stack>
  );
}
