import CustomSelect from '@/components/default/common/form/CustomSelect/CustomSelect';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import DateInput from '@/components/default/common/form/DateInput/DateInput';
import { Stack, TextField, Theme, useMediaQuery } from '@mui/material';
import { FieldError, FieldErrors, FieldErrorsImpl, Merge } from 'react-hook-form';
import CustomLabel from '../CustomLabel/CustomLabel';

export interface ICVInput {
  id?: number;
  country_id?: number;
  start_date: string;
  end_date: string;
  company_name: string;
  specialisation: string;
  note: string;
  cv_type_id?: number;
  professions: number[];
  industries: number[];
  sub_industries: number[];
}

export const getDefaultCVs = (): ICVInput => ({
  start_date: '',
  end_date: '',
  company_name: '',
  specialisation: '',
  note: '',
  professions: [],
  industries: [],
  sub_industries: [],
});

interface ICVInputsProps {
  commonData: ICommonData;
  errors?:
    | Merge<FieldError, (Merge<FieldError, FieldErrorsImpl<ICVInput>> | undefined)[]>
    | FieldErrors<ICVInput>[];
  index: number;
  value: Array<ICVInput>;
  item: ICVInput;
  onChange?: (value: ICVInput[]) => void;
  single?: boolean;
  getValues?: any;
  elem?: ICVInput;
}

export default function CVInputs({
  value,
  index,
  item,
  commonData,
  errors,
  onChange,
  single,
  getValues,
  elem,
}: ICVInputsProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <>
      <CustomSingleSelect
        label={'Country'}
        link='/countries'
        field={{
          value: item.country_id,
          onChange: (targetValue?: number) => {
            value[index].country_id = targetValue;
            onChange && onChange(value);
          },
        }}
        options={commonData.countries ?? []}
        error={errors && errors[index]?.country_id}
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

      <CustomSingleSelect
        label={'CV Type'}
        link='/cv-types'
        field={{
          value: item.cv_type_id,
          onChange: (targetValue?: number) => {
            value[index].cv_type_id = targetValue;
            onChange && onChange(value);
          },
        }}
        options={commonData.cv_types ?? []}
        error={errors && errors[index]?.cv_type_id}
        required
        style={{
          minWidth: 'calc(50% - 1.5rem)',
        }}
      />

      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        value={item.company_name}
        name={`cvs[${index}].company_name`}
        error={!!(errors && errors[index]?.company_name)}
        helperText={errors && (errors[index]?.company_name?.message ?? '')}
        label={<CustomLabel label={'Company Name'} required />}
        onChange={(event) => {
          value[index].company_name = event.target.value;
          onChange && onChange(value);
        }}
        className={mdDown ? 'mobile' : ''}
        sx={{ minWidth: 'calc(33.3% - 1rem)' }}
      />

      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        value={item.specialisation}
        name={`cvs[${index}].specialisation`}
        error={!!(errors && errors[index]?.specialisation)}
        helperText={errors && (errors[index]?.specialisation?.message ?? '')}
        label='Specialisation'
        onChange={(event) => {
          value[index].specialisation = event.target.value;
          onChange && onChange(value);
        }}
        className={mdDown ? 'mobile' : ''}
        sx={{ minWidth: 'calc(33.3% - 1rem)' }}
      />

      <CustomSelect
        type={'Professions'}
        link='/professions'
        options={commonData.professions ?? []}
        value={item.professions}
        error={errors && errors[index]?.professions}
        handleChange={(targetValue) => {
          value[index].professions = targetValue;
          onChange && onChange(value);
        }}
        style={{
          flexGrow: 1,
          minWidth: 'calc(50% - 1.5rem)',
        }}
      />

      <CustomSelect
        type={'Industries'}
        link='/industries'
        options={commonData.industries ?? []}
        value={item.industries}
        error={errors && errors[index]?.industries}
        required
        handleChange={(targetValue) => {
          value[index].industries = targetValue;
          onChange && onChange(value);
        }}
        style={{
          flexGrow: 1,
          minWidth: 'calc(50% - 1.5rem)',
        }}
      />

      <CustomSelect
        type={'Sub Industries'}
        link='/sub-industries'
        options={commonData.sub_industries ?? []}
        value={item.sub_industries}
        error={errors && errors[index]?.sub_industries}
        handleChange={(targetValue) => {
          value[index].sub_industries = targetValue;
          onChange && onChange(value);
        }}
        style={{
          flexGrow: 1,
          minWidth: 'calc(50% - 1.5rem)',
        }}
      />

      <CustomTextEditor
        title='note'
        value={item?.note ?? ''}
        onEditorChange={(targetValue: string) => {
          value[index].note = targetValue;
          onChange && onChange(value);
        }}
        style={{ width: '100%' }}
        error={errors ? errors[index!]?.note?.message : ''}
        height={200}
      />
    </>
  );
}
