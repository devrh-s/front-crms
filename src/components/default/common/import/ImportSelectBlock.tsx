import { useMemo, useEffect } from 'react';
import {
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItemText,
  Button,
} from '@mui/material';
import { IColumn, IImportState } from './types';

interface IImportSelectBlockProps {
  values: string[];
  index: number;
  rows: string[][];
  columns: IColumn[];
  state: IImportState;
  setSkipped: (skippedColumns: number[]) => void;
  onChange: (newValues: string[]) => void;
}

export default function ImportSelectBlock({
  state,
  values,
  columns,
  rows,
  index,
  setSkipped,
  onChange,
}: IImportSelectBlockProps) {
  const row = rows?.[index] ?? [];

  const isSkipped = useMemo(() => state.skipped.includes(index), [state.skipped]);

  const handleChange = (event: any) => {
    const newValues = [...values];
    const newValue = event?.target?.value;
    newValues[index] = newValue;
    onChange(newValues);
  };

  const handleClear = () => {
    const newValues = [...values];
    newValues[index] = '';
    onChange(newValues);
  };

  const handleSkip = () => {
    const newSkipped = [...state.skipped, index];
    setSkipped(newSkipped);
    handleClear();
  };

  const handleEdit = () => {
    const newSkipped = [...state.skipped].filter((elem) => elem !== index);
    setSkipped(newSkipped);
  };

  return (
    <Stack
      sx={{
        maxWidth: '350px',
        padding: '1rem',
        borderRadius: '.5rem',
        boxShadow: '0 0 13px 0 rgba(0, 0, 0, 0.15)',
      }}
    >
      {isSkipped ? (
        <Stack gap='.5rem'>
          <Typography
            sx={{
              backgroundColor: (theme) => theme.palette.warning.light,
              position: 'relative',
              color: '#fff',
              padding: '1rem',
              borderRadius: '.5rem',
            }}
          >
            Will not be Imported
          </Typography>
        </Stack>
      ) : (
        <FormControl
          fullWidth
          sx={{
            gap: '1rem',
          }}
        >
          <InputLabel id='demo-simple-select-label'>Column name</InputLabel>
          <Select
            labelId='demo-simple-select-label'
            id='demo-simple-select'
            value={values[index] ?? ''}
            label='Column name'
            onChange={handleChange}
          >
            {columns.map((column) => (
              <MenuItem
                key={column.id}
                value={column.id}
                disabled={values.includes(column.id as string)}
              >
                {column.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <List sx={{ padding: '.5rem', maxHeight: '9.5rem', overflow: 'hidden' }}>
        {row.map((name, ind) => (
          <ListItemText
            key={ind}
            sx={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </ListItemText>
        ))}
      </List>
      {isSkipped ? (
        <Stack flexDirection='row' justifyContent='flex-end'>
          <Button
            variant='outlined'
            size='small'
            onClick={handleEdit}
            sx={{ alignSelf: 'flex-end' }}
          >
            Edit
          </Button>
        </Stack>
      ) : (
        <Stack flexDirection='row' justifyContent='flex-end'>
          <Button variant='text' size='small' onClick={handleClear}>
            Clear
          </Button>
          <Button variant='text' size='small' onClick={handleSkip}>
            Skip
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
