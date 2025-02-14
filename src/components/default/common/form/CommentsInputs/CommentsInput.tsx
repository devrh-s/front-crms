import { Theme, useMediaQuery } from '@mui/material';

import { FieldError, FieldErrors, FieldErrorsImpl, Merge } from 'react-hook-form';
import 'react-phone-number-input/style.css';
import CustomSingleSelect from '../CustomSingleSelect/CustomSingleSelect';
import CustomTextEditor from '../CustomTextEditor/CustomTextEditor';
import DateInput from '../DateInput/DateInput';

export interface ICommentInputs {
  id?: number;
  date?: string;
  comment_type_id?: number;
  note?: string;
}

export const getDefaultComments = (): ICommentInputs => ({
  date: '',
  comment_type_id: undefined,
  note: '',
});

interface ICommentInputsProps {
  errors?:
    | Merge<FieldError, (Merge<FieldError, FieldErrorsImpl<ICommentInputs>> | undefined)[]>
    | FieldErrors<ICommentInputs>[];
  index: number;
  commentsArr: Array<ICommentInputs>;
  elem: ICommentInputs;
  comment_types: IOption[];
  onChange?: (event: ICommentInputs[]) => void;
}

export default function CommentInputs({
  commentsArr,
  index,
  elem,
  comment_types,
  errors,
  onChange,
}: ICommentInputsProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <>
      <CustomSingleSelect
        label='Comment Type'
        required
        field={{
          value: elem?.comment_type_id,
          onChange: (targetValue?: number) => {
            commentsArr[index].comment_type_id = targetValue;
            onChange && onChange(commentsArr);
          },
        }}
        options={comment_types}
        error={errors && errors[index]?.comment_type_id}
      />

      <CustomTextEditor
        title='note'
        required
        value={elem?.note ?? ''}
        onEditorChange={(targetValue: string) => {
          commentsArr[index].note = targetValue;
          onChange && onChange(commentsArr);
        }}
        style={{ width: '100%' }}
        error={errors ? errors[index!]?.note?.message : ''}
        height={200}
      />
      <DateInput
        label={'Date'}
        format='DD-MM-YYYY'
        error={errors && errors[index]?.date}
        required
        field={{
          value: elem?.date,
          onChange: (targetValue?: string) => {
            commentsArr[index].date = targetValue ?? '';
            onChange && onChange(commentsArr);
          },
        }}
      />
    </>
  );
}
