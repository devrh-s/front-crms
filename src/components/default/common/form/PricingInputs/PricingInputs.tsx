import { Controller, UseFormRegister, Control } from 'react-hook-form';
import { TextField, useMediaQuery, Theme } from '@mui/material';
import CustomSingleSelect from '../CustomSingleSelect/CustomSingleSelect';
import CustomLabel from '../CustomLabel/CustomLabel';

interface IPricingInput {
  id: number | string;
  pricing_type_id: number | string;
  package_name: string;
  price: number | string;
  currency_id: number | string;
  job_post_amount: number | string;
}

interface IPricingInputsProps {
  currencies: Array<IOption>;
  pricings: Array<IOption>;
  errors: any;
  index?: number;
  single?: boolean;
  pricingsArr?: Array<IPricingInput>;
  elem?: IPricingInput;
  onChange?: (event: any[]) => void;
  control?: Control<any>;
  register: UseFormRegister<any>;
}

export default function PricingInputs({
  control,
  pricingsArr,
  index,
  elem,
  currencies,
  pricings,
  errors,
  single,
  register,
  onChange,
}: IPricingInputsProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  return (
    <>
      {single ? (
        <TextField
          variant='standard'
          InputLabelProps={{ shrink: true }}
          {...register('package_name')}
          error={!!errors.package_name}
          helperText={errors.package_name ? errors.package_name?.message : ''}
          label={<CustomLabel label={'Package name'} required />}
          className={mdDown ? 'mobile' : ''}
          sx={{
            minWidth: 'calc(50% - 1rem)',
            flexGrow: 1,
            '&.mobile': {
              width: 'auto',
              flex: '1',
            },
          }}
        />
      ) : (
        <TextField
          variant='standard'
          InputLabelProps={{ shrink: true }}
          value={elem?.package_name}
          onChange={(e) => {
            const newValue = pricingsArr ? [...pricingsArr] : [];
            newValue[index ?? 0].package_name = e.target.value;
            if (onChange) {
              onChange(newValue);
            }
          }}
          error={!!errors.job_site_pricings}
          helperText={
            errors.job_site_pricings ? errors.job_site_pricings[index!]?.package_name?.message : ''
          }
          label={<CustomLabel label={'Package name'} required />}
          className={mdDown ? 'mobile' : ''}
          sx={{
            maxWidth: 380,
            '&.mobile': {
              width: 'auto',
              flex: '1',
            },
          }}
        />
      )}
      {single ? (
        <TextField
          variant='standard'
          type='number'
          InputLabelProps={{ shrink: true }}
          {...register('price')}
          error={!!errors.price}
          helperText={errors.price ? errors.price?.message : ''}
          label={<CustomLabel label={'Price'} required />}
          className={mdDown ? 'mobile' : ''}
          inputProps={{ min: 0 }}
          sx={{
            minWidth: 'calc(50% - 1rem)',
            flexGrow: 1,
            '&.mobile': {
              width: 'auto',
              flex: '1',
            },
          }}
        />
      ) : (
        <TextField
          variant='standard'
          type='number'
          InputLabelProps={{ shrink: true }}
          value={elem?.price}
          onChange={(e) => {
            const newValue = pricingsArr ? [...pricingsArr] : [];
            newValue[index ?? 0].price = e.target.value;
            if (onChange) {
              onChange(newValue);
            }
          }}
          error={!!errors.job_site_pricings}
          helperText={
            errors.job_site_pricings ? errors.job_site_pricings[index!]?.price?.message : ''
          }
          inputProps={{ min: 0 }}
          label={<CustomLabel label={'Price'} required />}
          className={mdDown ? 'mobile' : ''}
          sx={{
            maxWidth: 380,
            '&.mobile': {
              width: 'auto',
              flex: '1',
            },
          }}
        />
      )}
      {single ? (
        <Controller
          name='currency_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Currency'
                link='/currencies'
                field={field}
                required
                options={currencies}
                error={error}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                }}
              />
            );
          }}
        />
      ) : (
        <CustomSingleSelect
          label='Currency'
          field={{
            value: elem?.currency_id,
            onChange: (targetValue: number) => {
              const newValue = pricingsArr ? [...pricingsArr] : [];
              newValue[index ?? 0].currency_id = targetValue;
              onChange && onChange(newValue);
            },
          }}
          options={currencies}
          required
          error={errors.job_site_pricings ? errors.job_site_pricings[index!]?.currency_id : ''}
          style={{
            minWidth: 'calc(33.3% - 1rem)',
          }}
        />
      )}
      {single ? (
        <Controller
          name='pricing_type_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Pricing types'
                link='/pricing-types'
                field={field}
                options={pricings}
                error={error}
                required
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                }}
              />
            );
          }}
        />
      ) : (
        <CustomSingleSelect
          label='Pricing types'
          field={{
            value: elem?.pricing_type_id,
            onChange: (targetValue: number) => {
              const newValue = pricingsArr ? [...pricingsArr] : [];
              newValue[index ?? 0].pricing_type_id = targetValue;
              onChange && onChange(newValue);
            },
          }}
          options={pricings}
          required
          error={errors.job_site_pricings ? errors.job_site_pricings[index!]?.pricing_type_id : ''}
          style={{
            minWidth: 'calc(33.3% - 1rem)',
          }}
        />
      )}

      {single ? (
        <TextField
          variant='standard'
          type='number'
          InputLabelProps={{ shrink: true }}
          {...register('job_post_amount')}
          error={!!errors.job_post_amount}
          helperText={errors.job_post_amount ? errors.job_post_amount?.message : ''}
          label={<CustomLabel label={'Job post amount'} required />}
          className={mdDown ? 'mobile' : ''}
          inputProps={{ min: 0 }}
          sx={{
            minWidth: 'calc(50% - 1rem)',
            flexGrow: 1,
            '&.mobile': {
              width: 'auto',
              flex: '1',
            },
          }}
        />
      ) : (
        <TextField
          variant='standard'
          type='number'
          InputLabelProps={{ shrink: true }}
          value={elem?.job_post_amount}
          onChange={(e) => {
            const newValue = pricingsArr ? [...pricingsArr] : [];
            newValue[index ?? 0].job_post_amount = e.target.value;
            if (onChange) {
              onChange(newValue);
            }
          }}
          error={!!errors.job_site_pricings?.[index!]?.job_post_amount}
          helperText={
            errors.job_site_pricings
              ? errors.job_site_pricings[index!]?.job_post_amount?.message
              : ''
          }
          inputProps={{ min: 0 }}
          label={<CustomLabel label={'Job post amount'} required />}
          className={mdDown ? 'mobile' : ''}
          sx={{
            maxWidth: 380,
            '&.mobile': {
              width: 'auto',
              flex: '1',
            },
          }}
        />
      )}
    </>
  );
}
