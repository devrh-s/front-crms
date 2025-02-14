import { ChangeEvent } from 'react';
import { Stack, Switch } from '@mui/material';
import CustomSelect from '../form/CustomSelect/CustomSelect';
import { styled } from '@mui/material/styles';

const CustomSwitch = styled(Switch)(({ theme }) => ({
  padding: 8,
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
    },
    '&::before': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
      left: 12,
    },
    '&::after': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: 16,
    height: 16,
    margin: 2,
  },
}));

interface IMultipleSelectFilterProps {
  filter: IFilter;
  label: string;
  options: IOption[];
  handleChangeFilter: (value: FilterMode | number[]) => void;
}

export default function MultipleSelectFilter({
  filter,
  handleChangeFilter,
  label,
  options,
}: IMultipleSelectFilterProps) {
  return (
    <Stack flexDirection='row' gap='.5rem' alignItems='center'>
      <CustomSelect
        value={filter.value as number[]}
        type={label}
        options={options}
        handleChange={(value) => handleChangeFilter(value)}
        isFilters
      />
      {filter.mode && (
        <CustomSwitch
          checked={filter.mode === 'standard' ? true : false}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleChangeFilter(event.target.checked ? 'standard' : 'exclude')
          }
        />
      )}
    </Stack>
  );
}
