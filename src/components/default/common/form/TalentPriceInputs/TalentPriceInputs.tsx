import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import DateInput from '@/components/default/common/form/DateInput/DateInput';
import { Stack, TextField, Theme, useMediaQuery } from '@mui/material';
import { FieldErrors, FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';
import CustomLabel from '../CustomLabel/CustomLabel';

export interface IPriceInput {
  id?: number;
  value?: number;
  currency_id?: number;
  rate_id?: number;
  start_date: string;
  end_date: string;
}

export const getDefaultPrice = (): IPriceInput => ({
  start_date: '',
  end_date: '',
});

interface IProps {
  commonData: ICommonData;
  errors?:
    | Merge<FieldError, (Merge<FieldError, FieldErrorsImpl<IPriceInput>> | undefined)[]>
    | FieldErrors<IPriceInput>[];
  index: number;
  value: Array<IPriceInput>;
  item: IPriceInput;
  onChange?: (value: IPriceInput[]) => void;
}

export default function TalentPriceInputs({
  value,
  index,
  item,
  commonData,
  errors,
  onChange,
}: IProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <>
      <TextField
        variant='standard'
        type='number'
        InputLabelProps={{ shrink: true }}
        inputProps={{ min: 0 }}
        value={item.value}
        name={`talents.prices[${index}].value`}
        error={!!(errors && errors[index]?.value)}
        helperText={errors && (errors[index]?.value?.message ?? '')}
        label={<CustomLabel label={'Value'} required />}
        onChange={(event) => {
          value[index].value = parseInt(event.target.value);
          onChange && onChange(value);
        }}
        className={mdDown ? 'mobile' : ''}
        sx={{ minWidth: 'calc(33.3% - 1rem)' }}
      />

      <CustomSingleSelect
        label={'Currency'}
        link='/currencies'
        field={{
          value: item.currency_id,
          onChange: (targetValue?: number) => {
            value[index].currency_id = targetValue;
            onChange && onChange(value);
          },
        }}
        options={commonData.currencies ?? []}
        error={errors && errors[index]?.currency_id}
        required
        style={{
          minWidth: 'calc(50% - 1.5rem)',
        }}
      />

      <CustomSingleSelect
        label={'Rate'}
        link='/rates'
        field={{
          value: item.rate_id,
          onChange: (targetValue?: number) => {
            value[index].rate_id = targetValue;
            onChange && onChange(value);
          },
        }}
        options={commonData.rates ?? []}
        error={errors && errors[index]?.rate_id}
        required
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
