import { TextField } from '@mui/material';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import CustomTextEditor from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import CustomLabel from '@/components/default/common/form/CustomLabel/CustomLabel';
import CustomSelect from '@/components/default/common/form/CustomSelect/CustomSelect';
import DateInput from '@/components/default/common/form/DateInput/DateInput';
import { Controller, Control } from 'react-hook-form';

interface INameKeys {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

interface IMilestoneInputsProps {
  visible: boolean;
  control: Control<any>;
  fullScreen: boolean;
  nameKeys: INameKeys;
}

export default function MilestoneInputs({
  visible,
  control,
  nameKeys,
  fullScreen,
}: IMilestoneInputsProps) {
  if (visible) {
    return (
      <>
        <Controller
          name={nameKeys.name}
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => {
            return (
              <TextField
                variant='standard'
                InputLabelProps={{ shrink: true }}
                error={!!error}
                helperText={error?.message}
                label={<CustomLabel label={'Milestone title'} required />}
                value={value}
                onChange={onChange}
              />
            );
          }}
        />
        <Controller
          name={nameKeys.start_date}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <DateInput
              label={'Start Date'}
              format='DD-MM-YYYY'
              required
              error={error}
              style={{
                minWidth: 'calc(50% - .75rem)',
                '&.mobile': {
                  gridColumn: 'auto',
                },
              }}
              field={field}
            />
          )}
        />
        <Controller
          name={nameKeys.end_date}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <DateInput
              label={'End Date'}
              format='DD-MM-YYYY'
              error={error}
              required
              style={{
                minWidth: 'calc(50% - .75rem)',
                '&.mobile': {
                  gridColumn: 'auto',
                },
              }}
              field={field}
            />
          )}
        />

        <Controller
          control={control}
          name={nameKeys.description}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <CustomTextEditor
              value={value}
              fullScreen={fullScreen}
              height={fullScreen ? 500 : 150}
              onEditorChange={onChange}
              title='Description'
              error={error?.message}
              style={{
                width: '100%',
              }}
            />
          )}
        />
      </>
    );
  }
}
