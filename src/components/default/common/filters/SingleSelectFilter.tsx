import { useMemo } from 'react';
import { Stack } from '@mui/material';
import CustomSingleSelect from '../form/CustomSingleSelect/CustomSingleSelect';

interface ISingleSelectFilterProps {
  filter: IFilter;
  label: string;
  options: IOption[];
  handleChangeFilter: (value: FilterMode | string) => void;
  width?: string;
}

export default function SingleSelectFilter({
  filter,
  width,
  handleChangeFilter,
  label,
  options,
}: ISingleSelectFilterProps) {
  const field = useMemo(
    () => ({
      value: filter.value,
      onChange: (newValue: string) => handleChangeFilter(newValue),
    }),
    [filter]
  );

  return (
    <Stack flexDirection='row' gap='.5rem' alignItems='center' sx={{ width: width ?? '100%' }}>
      <CustomSingleSelect
        label={label}
        field={field}
        options={options}
        style={{
          minWidth: 'calc(33.3% - 1rem)',
        }}
      />
    </Stack>
  );
}
