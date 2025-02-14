import { Control, Controller, FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';
import CustomSingleSelect from '../CustomSingleSelect/CustomSingleSelect';

interface IProgressInput {
  id?: number;
  status_id?: number;
  type?: string;
  done?: number;
}

interface IProgressInputsProps {
  errors?: Merge<FieldError, (Merge<FieldError, FieldErrorsImpl<IProgressInput>> | undefined)[]>;
  types: IOption[];
  statuses: IOption[];
  control?: Control<any>;
  index: number;
}

const doneOption = [
  { id: 0, name: 'No' },
  { id: 1, name: 'Yes' },
];

export default function ProgressInputs({
  types,
  statuses,
  index,
  errors,
  control,
}: IProgressInputsProps) {
  return (
    <>
      <Controller
        name={`edit_progress.${index}.status.id`}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <CustomSingleSelect
            label='Status'
            field={field}
            required
            options={statuses}
            error={errors && errors[index]?.status_id}
          />
        )}
      />
      <Controller
        name={`edit_progress.${index}.type`}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <CustomSingleSelect label='Types' field={field} required options={types} error={error} />
        )}
      />
      <Controller
        name={`edit_progress.${index}.done`}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <CustomSingleSelect
            label='Done'
            field={field}
            required
            options={doneOption}
            error={error}
          />
        )}
      />
    </>
  );
}
