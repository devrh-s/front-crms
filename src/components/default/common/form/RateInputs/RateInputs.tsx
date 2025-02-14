import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import { Stack } from '@mui/material';
import DateInput from '@/components/default/common/form/DateInput/DateInput';
import { FieldErrors, FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';

export interface IRateInput {
  id?: number;
  rate_id?: number;
  inner_client_id?: number;
  shift_id?: number;
  start_date: string;
  end_date: string;
}

export const getDefaultRate = (): IRateInput => ({
  end_date: '',
  start_date: '',
});

interface IProps {
  commonData: ICommonData;
  errors?:
    | FieldErrors<IRateInput>[]
    | Merge<FieldError, (Merge<FieldError, FieldErrorsImpl<IRateInput>> | undefined)[]>;
  index: number;
  value: Array<IRateInput>;
  item: IRateInput;
  onChange?: (value: IRateInput[]) => void;
}

export default function RateInputs({ value, index, item, commonData, errors, onChange }: IProps) {
  return (
    <>
      <CustomSingleSelect
        label={'Rate'}
        field={{
          value: item.rate_id,
          onChange: (targetValue?: number) => {
            value[index].rate_id = targetValue;
            onChange && onChange(value);
          },
        }}
        link='/rates'
        options={commonData.rates ?? []}
        error={errors && errors[index]?.rate_id}
        required
        style={{
          minWidth: 'calc(50% - 1.5rem)',
        }}
      />

      <CustomSingleSelect
        label={'Shift'}
        link='/shifts'
        field={{
          value: item.shift_id,
          onChange: (targetValue?: number) => {
            value[index].shift_id = targetValue;
            onChange && onChange(value);
          },
        }}
        options={commonData.shifts ?? []}
        error={errors && errors[index]?.shift_id}
        required
        style={{
          minWidth: 'calc(50% - 1.5rem)',
        }}
      />

      <CustomSingleSelect
        label={'Inner Client'}
        link='/inner-clients'
        field={{
          value: item.inner_client_id,
          onChange: (targetValue?: number) => {
            value[index].inner_client_id = targetValue;
            onChange && onChange(value);
          },
        }}
        required
        options={commonData.inner_clients ?? []}
        error={errors && errors[index]?.inner_client_id}
        style={{
          minWidth: 'calc(50% - 1.5rem)',
        }}
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
