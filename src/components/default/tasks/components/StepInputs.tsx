import { TextField } from '@mui/material';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import { Controller, Control } from 'react-hook-form';

interface INameKeys {
  name: string;
  assignee_id: string;
}

interface IStepInputsProps {
  index: number;
  control: Control<any>;
  nameKeys: INameKeys;
  selectedUsers: IOption[];
  assigneesRequired?: boolean;
}

export default function StepInputs({
  control,
  index,
  selectedUsers,
  nameKeys,
  assigneesRequired = false,
}: IStepInputsProps) {
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
              label={<CustomLabel label={`Name of Step ${index + 1}`} required />}
              value={value}
              onChange={onChange}
            />
          );
        }}
      />
      <Controller
        name={nameKeys.assignee_id}
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Assignee'
              link='/users'
              field={field}
              error={error}
              options={selectedUsers}
              required={assigneesRequired}
            />
          );
        }}
      />
    </>
  );
}
