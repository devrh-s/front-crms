import { Stack, Typography, IconButton, useMediaQuery } from '@mui/material';
import { GridSortItem } from '@mui/x-data-grid';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface ISubSortBtnProps {
  sortOptions: GridSortItem | null;
  field: string;
  handleSubSort: (newField: string) => void;
}

export default function SubSortBtn({ field, sortOptions, handleSubSort }: ISubSortBtnProps) {
  return (
    <IconButton
      size='small'
      sx={{
        display: 'none',
      }}
      onClick={() => handleSubSort(field)}
    >
      {sortOptions?.sort === 'desc' ? (
        <ArrowDownwardIcon sx={{ fontSize: '1rem' }} />
      ) : (
        <ArrowUpwardIcon sx={{ fontSize: '1rem' }} />
      )}
    </IconButton>
  );
}
