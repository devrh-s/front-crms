import styled from '@emotion/styled';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, Typography } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

const RotatingIcon = styled(KeyboardArrowDownIcon)(({ open }: { open: boolean }) => ({
  transition: 'transform 0.3s ease',
  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
}));

interface IShowMoreProps {
  showMore: boolean;
  setShowMore: Dispatch<SetStateAction<boolean>>;
  hideTasks?: boolean;
}

const ShowMoreBox = ({ showMore, setShowMore, hideTasks }: IShowMoreProps) => (
  <Box
    display={'flex'}
    alignItems={'center'}
    gap={1}
    width={'100%'}
    sx={{ cursor: 'pointer' }}
    onClick={() => setShowMore(!showMore)}
  >
    <Box flex={1} height={'1px'} bgcolor={'white'} />
    {hideTasks ? (
      <Typography>{showMore ? 'Hide tasks' : 'Show tasks'}</Typography>
    ) : (
      <Typography>{showMore ? 'Hide' : 'Show more'}</Typography>
    )}

    <RotatingIcon open={showMore} />
    <Box flex={1} height={'1px'} bgcolor={'white'} />
  </Box>
);

export default ShowMoreBox;
