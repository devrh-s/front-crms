import CustomTextEditor from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import { FormControl, Theme, useMediaQuery } from '@mui/material';
import { Control, Controller } from 'react-hook-form';
import CustomLabel from '../CustomLabel/CustomLabel';
import CustomSelect from '../CustomSelect/CustomSelect';
import CustomSingleSelect from '../CustomSingleSelect/CustomSingleSelect';
import DateInput from '../DateInput/DateInput';

export interface ICommunicationInput {
  id?: number | string;
  account_id?: number | string;
  communication_type_id: number | string;
  followup_date: string | null;
  followup_time?: string | null;
  note: string;
  channel?: string | number;
  messages: any;
}

interface IPricingInputsProps {
  communication_types: Array<IOption>;
  accounts: Array<IOption>;
  errors: any;
  index?: number;
  single?: boolean;
  communicationsArr: Array<ICommunicationInput>;
  getValues: any;
  elem: ICommunicationInput;
  control?: Control<any>;
  messages: IOption[];
  chanelOptions?: IOption[];
  onChange?: (event: any[]) => void;
}

export default function CommunicationInputs({
  control,
  communicationsArr,
  index = 0,
  elem,
  communication_types,
  accounts,
  messages,
  errors,
  single,
  chanelOptions,
  onChange,
}: IPricingInputsProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <>
      {single ? (
        <Controller
          name='account_id'
          control={control}
          render={() => (
            <CustomSingleSelect
              label='Account'
              field={{
                value: elem?.account_id,
                onChange: (targetValue: number) => {
                  communicationsArr[index].account_id = targetValue;
                  onChange && onChange(communicationsArr);
                },
              }}
              options={accounts}
              error={errors && errors[index]?.account_id}
              link='/account'
              required
              style={{
                minWidth: 'calc(50% - 1.5rem)',
              }}
            />
          )}
        />
      ) : (
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
          <CustomLabel label='Account' required={true} link={'/accounts'} />
          <CustomSingleSelect
            field={{
              value: elem?.account_id,
              onChange: (targetValue: number) => {
                communicationsArr[index].account_id = targetValue;
                onChange && onChange(communicationsArr);
              },
            }}
            options={accounts}
            error={errors && errors[index]?.account_id}
            link='/account'
            style={{
              minWidth: 'calc(50% - 1.5rem)',
            }}
          />
        </FormControl>
      )}
      {single ? (
        <Controller
          name='communication_type_id'
          control={control}
          render={() => (
            <CustomSingleSelect
              label='Communication Type'
              field={{
                value: elem?.communication_type_id,
                onChange: (targetValue: number) => {
                  communicationsArr[index].communication_type_id = targetValue;
                  onChange && onChange(communicationsArr);
                },
              }}
              options={communication_types}
              error={errors && errors[index]?.communication_type_id}
              required
              style={{
                minWidth: 'calc(50% - 1.5rem)',
              }}
            />
          )}
        />
      ) : (
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
          <CustomLabel label='Communication Type' required={true} link={'/communication-types'} />
          <CustomSingleSelect
            field={{
              value: elem?.communication_type_id,
              onChange: (targetValue: number) => {
                communicationsArr[index].communication_type_id = targetValue;
                onChange && onChange(communicationsArr);
              },
            }}
            options={communication_types}
            error={errors && errors[index]?.communication_type_id}
            style={{
              minWidth: 'calc(50% - 1.5rem)',
            }}
          />
        </FormControl>
      )}

      <CustomSingleSelect
        label='Channel'
        field={{
          value: elem?.channel,
          onChange: (targetValue: number) => {
            communicationsArr[index].channel = targetValue;
            onChange && onChange(communicationsArr);
          },
        }}
        options={chanelOptions ?? []}
        error={errors && errors[index]?.channel}
        required
        style={{
          minWidth: 'calc(50% - 1.5rem)',
        }}
      />

      <CustomTextEditor
        title='note'
        required
        value={elem?.note}
        onEditorChange={(targetValue: string) => {
          communicationsArr[index].note = targetValue;
          onChange && onChange(communicationsArr);
        }}
        style={{ width: '100%' }}
        error={errors && errors[index!]?.note?.message}
        height={200}
      />
      {single ? (
        <Controller
          control={control}
          name='jaCommunication.messages'
          render={({ field: { onChange, value } }) => (
            <CustomSelect
              type={'Messages'}
              options={messages}
              link='/messages'
              value={value}
              error={errors && errors[index]?.message}
              handleChange={onChange}
              style={{
                minWidth: '100%',
              }}
            />
          )}
        />
      ) : (
        <CustomSelect
          type={'Messages'}
          options={messages}
          link='/messages'
          value={elem?.messages}
          error={errors && errors?.messages?.message!}
          handleChange={(ids: any) => {
            const newValue = communicationsArr ? [...communicationsArr] : [];
            newValue[index ?? 0].messages = ids;
            if (onChange) {
              onChange(newValue);
            }
          }}
          style={{
            width: '100%',
          }}
        />
      )}

      <DateInput
        label={'Followup time'}
        variant='time'
        required
        error={errors && errors[index]?.followup_time}
        style={{
          minWidth: 'calc(33.3% - 1rem)',
          '&.mobile': {
            gridColumn: 'auto',
          },
        }}
        field={{
          value: elem?.followup_time,
          onChange: (targetValue: any) => {
            const updatedArr = [...communicationsArr];
            updatedArr[index] = {
              ...updatedArr[index],
              followup_time: targetValue,
            };
            onChange && onChange(updatedArr);
          },
        }}
      />

      <DateInput
        label={'Followup date'}
        format='DD-MM-YYYY'
        required
        error={errors && errors[index]?.followup_date}
        style={{
          minWidth: 'calc(33.3% - 1rem)',
          '&.mobile': {
            gridColumn: 'auto',
          },
        }}
        field={{
          value: elem?.followup_date,
          onChange: (targetValue: any) => {
            communicationsArr[index].followup_date = targetValue;
            onChange && onChange(communicationsArr);
          },
        }}
      />
    </>
  );
}
