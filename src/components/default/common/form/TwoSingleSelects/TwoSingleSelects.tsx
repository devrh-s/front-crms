import { Stack } from '@mui/material';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import { FieldError } from 'react-hook-form';

interface ITwoSelectsProps {
  options1: Array<IOption>;
  options2: Array<IOption>;
  onChange1: (targetValue?: number) => void;
  onChange2: (targetValue?: number) => void;
  value1?: number;
  value2?: number;
  label1: string;
  label2: string;
  error1?: FieldError;
  error2?: FieldError;
  link1?: string;
  link2?: string;
  required1?: boolean;
  required2?: boolean;
}

export default function TowSingleSelects({
  options1,
  options2,
  label1 = '',
  label2 = '',
  required1 = true,
  required2 = true,
  value1,
  value2,
  onChange1,
  onChange2,
  error1,
  error2,
  link1,
  link2,
}: ITwoSelectsProps) {
  return (
    <Stack
      flexDirection='row'
      gap='1rem'
      sx={{
        maxWidth: 380,
        minWidth: 'calc(50% - 1rem)',
      }}
    >
      <CustomSingleSelect
        label={label1}
        link={link1}
        field={{
          value: value1,
          onChange: onChange1,
        }}
        options={options1}
        error={error1}
        required={required1}
        style={{
          width: '50%',
        }}
      />

      <CustomSingleSelect
        label={label2}
        link={link2}
        field={{
          value: value2,
          onChange: onChange2,
        }}
        options={options2}
        error={error2}
        required={required2}
        style={{
          width: '50%',
        }}
      />
    </Stack>
  );
}
