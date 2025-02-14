import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import { Stack, TextField, Theme, useMediaQuery } from '@mui/material';
import DateInput from '@/components/default/common/form/DateInput/DateInput';
import { FieldErrors, FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';
import CustomLabel from '../CustomLabel/CustomLabel';
export interface ISalaryInput {
  id?: number;
  value?: string | number;
  currency_id?: string | number;
  salary_type_id?: string | number;
  start_date?: string;
  end_date?: string;
  hourly_cost?: number | string;
  hourly_currency_id?: string | number;
}

export const getDefaultSalary = (): ISalaryInput => ({
  value: '',
  hourly_cost: '',
  hourly_currency_id: '',
  salary_type_id: '',
  currency_id: '',
  end_date: '',
  start_date: '',
});

interface IProps {
  commonData: ICommonData;
  errors?:
    | FieldErrors<ISalaryInput>[]
    | Merge<FieldError, (Merge<FieldError, FieldErrorsImpl<ISalaryInput>> | undefined)[]>;
  index: number;
  value: Array<ISalaryInput>;
  item: ISalaryInput;
  onChange?: (value: ISalaryInput[]) => void;
}

export default function SalaryInputs({ value, index, item, commonData, errors, onChange }: IProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  return (
    <>
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        value={item.value}
        name={`names[${index}].value`}
        type='number'
        error={!!(errors && errors[index]?.value)}
        helperText={errors && (errors[index]?.value?.message ?? '')}
        label={<CustomLabel label={'Value'} required />}
        onChange={(event) => {
          value[index].value = event.target.value;
          onChange && onChange(value);
        }}
        className={mdDown ? 'mobile' : ''}
        sx={{ minWidth: 'calc(33.3% - 1rem)' }}
      />
      <CustomSingleSelect
        label={'Currency'}
        field={{
          value: item.currency_id,
          onChange: (targetValue?: number) => {
            value[index].currency_id = targetValue;
            onChange && onChange(value);
          },
        }}
        link='/currency'
        options={commonData.currencies ?? []}
        error={errors && errors[index]?.currency_id}
        required
        style={{
          minWidth: 'calc(50% - 1.5rem)',
        }}
      />

      <CustomSingleSelect
        label={'Salary Type'}
        link='/salry-type'
        field={{
          value: item.salary_type_id,
          onChange: (targetValue?: number) => {
            value[index].salary_type_id = targetValue;
            onChange && onChange(value);
          },
        }}
        options={commonData.salary_types ?? []}
        error={errors && errors[index]?.salary_type_id}
        required
        style={{
          minWidth: 'calc(50% - 1.5rem)',
        }}
      />

      <CustomSingleSelect
        label={'Hourly Currency'}
        link='/hourly-currency'
        field={{
          value: item.hourly_currency_id,
          onChange: (targetValue?: number) => {
            value[index].hourly_currency_id = targetValue;
            onChange && onChange(value);
          },
        }}
        required
        options={commonData.currencies ?? []}
        error={errors && errors[index]?.hourly_currency_id}
        style={{
          minWidth: 'calc(50% - 1.5rem)',
        }}
      />
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        value={item.hourly_cost}
        name={`names[${index}].hourly_cost`}
        type='number'
        error={!!(errors && errors[index]?.hourly_cost)}
        helperText={errors && (errors[index]?.hourly_cost?.message ?? '')}
        label={<CustomLabel label={'Hourly Cost'} required />}
        onChange={(event) => {
          value[index].hourly_cost = event.target.value;
          onChange && onChange(value);
        }}
        className={mdDown ? 'mobile' : ''}
        sx={{ minWidth: 'calc(33.3% - 1rem)' }}
      />
      <Stack
        flexDirection='row'
        gap='1rem'
        sx={{
          maxWidth: 380,
          minWidth: 'calc(50% - 1rem)',
        }}
      >
        <DateInput
          label={'Start Date'}
          format='DD-MM-YYYY'
          error={errors && errors[index]?.start_date}
          style={{
            width: '50%',
          }}
          required
          field={{
            value: item.start_date,
            onChange: (targetValue?: string) => {
              value[index].start_date = targetValue ?? '';
              onChange && onChange(value);
            },
          }}
        />

        <DateInput
          label={'End Date'}
          format='DD-MM-YYYY'
          error={errors && errors[index]?.end_date}
          style={{
            width: '50%',
          }}
          field={{
            value: item.end_date,
            onChange: (targetValue?: string) => {
              value[index].end_date = targetValue ?? '';
              onChange && onChange(value);
            },
          }}
        />
      </Stack>
    </>
  );
}
