import { FormControl, TextField, Theme, useMediaQuery } from '@mui/material';
import CustomSingleSelect from '../CustomSingleSelect/CustomSingleSelect';

import { matchIsValidTel, MuiTelInput } from 'mui-tel-input';
import {
  Controller,
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormClearErrors,
  UseFormSetError,
  UseFormSetValue,
} from 'react-hook-form';
import 'react-phone-number-input/style.css';
import CustomLabel from '../CustomLabel/CustomLabel';

export interface IContactInput {
  id?: number;
  tool_id?: number;
  value: string;
}

interface IFormInputs {
  contacts: { tool_id: number; value: string }[];
  sources: { name: string; ids: number[] };
  professions: string[];
  ja_communications: string[];
}

interface IContactInputsProps {
  errors?: Merge<FieldError, (Merge<FieldError, FieldErrorsImpl<IContactInput>> | undefined)[]>;
  index: number;
  contactsArr: Array<IContactInput>;
  elem: IContactInput;
  onChange?: (event: IContactInput[]) => void;
  tools: IOption[];
  setError: UseFormSetError<any>;
  clearErrors: UseFormClearErrors<any>;
}

const allowedToolNames = ['Viber', 'WhatsApp', 'Phone'];

export default function ContactInputs({
  contactsArr,
  index,
  elem,
  tools,
  errors,
  onChange,
  setError,
  clearErrors,
}: IContactInputsProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const handlePhoneChange = (e: string) => {
    const validate = matchIsValidTel(e, {
      onlyCountries: [],
      excludedCountries: [],
      continents: [],
    });
    if (!validate) {
      setError(`contacts.${index}.value` as const, {
        type: 'manual',
        message: 'invalid phone number',
      });
    } else {
      clearErrors(`contacts.${index}.value` as const);
    }
    const newValue = contactsArr ? [...contactsArr] : [];
    newValue[index ?? 0].value = e;
    onChange && onChange(newValue);
  };

  const isPhone = (id?: number) => {
    const tool = tools.find((tool) => tool.id === id);
    return tool && allowedToolNames.includes(tool.name);
  };

  return (
    <>
      <FormControl
        variant='standard'
        className={mdDown ? 'mobile' : ''}
        sx={{
          maxWidth: 380,
          '&.mobile': {
            width: 'auto',
            flex: '1',
          },
        }}
      >
        <CustomLabel label='Tool' required={true} link={'/tools'} />
        <CustomSingleSelect
          field={{
            value: elem?.tool_id,
            onChange: (targetValue: number) => {
              contactsArr[index].tool_id = targetValue;
              onChange && onChange(contactsArr);
            },
          }}
          options={tools}
          error={errors && errors[index]?.tool_id}
        />
      </FormControl>

      {isPhone(elem.tool_id) ? (
        <MuiTelInput
          value={elem.value ?? ''}
          label={'Phone'}
          focusOnSelectCountry
          onChange={handlePhoneChange}
          continents={['EU', 'OC', 'NA', 'SA']}
          error={!!(errors && errors[index]?.value)}
          helperText={errors ? (errors[index]?.value?.message ?? '') : ''}
          required
        />
      ) : (
        <TextField
          variant='standard'
          InputLabelProps={{ shrink: true }}
          value={elem.value}
          onChange={(e) => {
            const newValue = contactsArr ? [...contactsArr] : [];
            newValue[index ?? 0].value = e.target.value;
            onChange && onChange(newValue);
          }}
          error={!!(errors && errors[index]?.value)}
          helperText={errors ? (errors[index]?.value?.message ?? '') : ''}
          label={<CustomLabel label={'Value'} required />}
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

interface IContactSingleInputsProps<T extends IContactInput> {
  errors?: any;
  control: any;
  register: any;
  tools: IOption[];
  tool_id?: number;
  setError: UseFormSetError<any>;
  clearErrors: UseFormClearErrors<any>;
  setValue: UseFormSetValue<any>;
  index?: number;
  value: Array<IContactInput>;
  onChange?: (value: IContactInput[]) => void;
  item: IContactInput;
}

export function ContactSingleInputs<T extends IContactInput>({
  control,
  tools,
  errors,
  tool_id,
  setError,
  clearErrors,
  setValue,
  index = 0,
  value,
  onChange,
  item,
}: IContactSingleInputsProps<T>) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const handlePhoneChange = (e: string) => {
    const validate = matchIsValidTel(e, {
      onlyCountries: [],
      excludedCountries: [],
      continents: [],
    });
    if (!validate) {
      setError(`value` as const, {
        type: 'manual',
        message: 'invalid phone number',
      });
    } else {
      clearErrors(`value` as const);
    }
    value[index].value = e;
    onChange && onChange(value);
    setValue('value', e);
  };

  const isPhone = (id?: number) => {
    const tool = tools.find((tool) => tool.id === id);
    return tool && allowedToolNames.includes(tool.name);
  };

  return (
    <>
      <CustomSingleSelect
        label='Tool'
        link='/tools'
        options={tools}
        error={errors && errors[index]?.tool_id}
        field={{
          value: item?.tool_id,
          onChange: (targetValue: number) => {
            value[index].tool_id = targetValue;
            onChange && onChange(value);
          },
        }}
        required
        style={{
          minWidth: 'calc(50% - 1.5rem)',
        }}
      />

      {isPhone(tool_id) ? (
        <Controller
          name='value'
          control={control}
          render={({ field }) => (
            <MuiTelInput
              {...field}
              label='Phone'
              value={item?.value}
              focusOnSelectCountry
              continents={['EU', 'OC', 'NA', 'SA']}
              onChange={handlePhoneChange}
              error={!!(errors && errors.value)}
              helperText={errors ? (errors.value?.message ?? '') : ''}
              required
            />
          )}
        />
      ) : (
        <TextField
          variant='standard'
          InputLabelProps={{ shrink: true }}
          error={!!(errors && errors[index]?.value)}
          helperText={errors && (errors[index]?.value?.message ?? '')}
          label={<CustomLabel label={'Value'} required />}
          onChange={(event) => {
            value[index].value = event.target.value;
            onChange && onChange(value);
          }}
          value={item?.value}
          className={mdDown ? 'mobile' : ''}
          sx={{
            minWidth: 'calc(50% - 1.5rem)',
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
