import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import { Stack, TextField, Theme, useMediaQuery } from '@mui/material';
import { FieldError, FieldErrors, FieldErrorsImpl, Merge } from 'react-hook-form';
import CustomLabel from '../CustomLabel/CustomLabel';

export interface IContentInput {
  id?: number;
  value: string;
  content_type_id?: number;
}

export const getDefaultContent = (): IContentInput => ({
  value: '',
  content_type_id: undefined,
});

interface IProps {
  commonData: ICommonData;
  errors?:
    | FieldErrors<IContentInput>[]
    | Merge<FieldError, (Merge<FieldError, FieldErrorsImpl<IContentInput>> | undefined)[]>;
  index: number;
  value: Array<IContentInput>;
  item: IContentInput;
  onChange?: (value: IContentInput[]) => void;
}

export default function ContentInputs({
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
      <Stack
        flexDirection='row'
        gap='1rem'
        sx={{
          maxWidth: 380,
          minWidth: 'calc(50% - 1rem)',
        }}
      >
        <TextField
          variant='standard'
          InputLabelProps={{ shrink: true }}
          value={item.value}
          name={`names[${index}].value`}
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
          label={'Content Type'}
          field={{
            value: item.content_type_id,
            onChange: (targetValue?: number) => {
              value[index].content_type_id = targetValue;
              onChange && onChange(value);
            },
          }}
          link='/content-types'
          options={commonData.content_types ?? []}
          error={errors && errors[index]?.content_type_id}
          required
          style={{
            width: '50%',
          }}
        />
      </Stack>
    </>
  );
}
