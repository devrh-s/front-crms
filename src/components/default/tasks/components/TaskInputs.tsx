import { TextField } from '@mui/material';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import CustomTextEditor from '../../common/form/CustomTextEditor/CustomTextEditor';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import CustomSelect from '../../common/form/CustomSelect/CustomSelect';
import DateInput from '../../common/form/DateInput/DateInput';
import { Controller, Control } from 'react-hook-form';

interface INameKeys {
  title: string;
  status_id: string;
  priority_id: string;
  parent_tasks: string;
  start_date: string;
  due_date: string;
  professions: string;
  assignees: string;
  controllers: string;
  note: string;
}

interface ITaskInputsProps {
  visible: boolean;
  control: Control<any>;
  fullScreen: boolean;
  nameKeys: INameKeys;
  usersOptional?: boolean;
  commonData: ICommonData;
  selectAssignees: (assigneesIds: number[]) => void;
}

export default function TaskInputs({
  visible,
  control,
  commonData,
  nameKeys,
  fullScreen,
  usersOptional = false,
  selectAssignees,
}: ITaskInputsProps) {
  const statuses = commonData.statuses ?? [];
  const priorities = commonData.priorities ?? [];
  const users = commonData.users ?? [];
  const tasks = commonData.tasks ?? [];
  const professions = commonData.professions ?? [];

  if (visible) {
    return (
      <>
        <Controller
          name={nameKeys.title}
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => {
            return (
              <TextField
                variant='standard'
                InputLabelProps={{ shrink: true }}
                error={!!error}
                helperText={error?.message}
                label={<CustomLabel label={'Task title'} required />}
                value={value}
                onChange={onChange}
              />
            );
          }}
        />
        <Controller
          name={nameKeys.status_id}
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Status'
                link='/statuses'
                field={field}
                required
                options={statuses}
                error={error}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                }}
              />
            );
          }}
        />
        <Controller
          name={nameKeys.priority_id}
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Priority'
                link='/priorities'
                field={field}
                required
                options={priorities}
                error={error}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                }}
              />
            );
          }}
        />
        <Controller
          control={control}
          name={nameKeys.parent_tasks}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <CustomSelect
              type='Parent Tasks'
              link='/tasks'
              options={tasks}
              value={value}
              error={error!}
              handleChange={onChange}
              style={{
                minWidth: 'calc(50% - .75rem)',
              }}
            />
          )}
        />

        <Controller
          name={nameKeys.start_date}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <DateInput
              label={'Start Date'}
              format='DD-MM-YYYY HH:mm:ss'
              required
              error={error}
              style={{
                minWidth: 'calc(50% - .75rem)',
                '&.mobile': {
                  gridColumn: 'auto',
                },
              }}
              field={field}
              variant='date-time'
            />
          )}
        />
        <Controller
          name={nameKeys.due_date}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <DateInput
              label={'Due Date'}
              format='DD-MM-YYYY HH:mm:ss'
              error={error}
              required
              style={{
                minWidth: 'calc(50% - .75rem)',
                '&.mobile': {
                  gridColumn: 'auto',
                },
              }}
              field={field}
              variant='date-time'
            />
          )}
        />

        <Controller
          control={control}
          name={nameKeys.professions}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <CustomSelect
              type={'Professions'}
              link='/professions'
              options={professions}
              value={value}
              error={error!}
              handleChange={onChange}
              style={{
                minWidth: 'calc(50% - .75rem)',
              }}
            />
          )}
        />
        <Controller
          control={control}
          name={nameKeys.assignees}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <CustomSelect
              type='Assignees'
              link='/users'
              options={users}
              required={!usersOptional}
              value={value}
              error={error!}
              handleChange={(selectedIds: number[]) => {
                selectAssignees(selectedIds);
                onChange(selectedIds);
              }}
              style={{
                minWidth: 'calc(50% - .75rem)',
              }}
            />
          )}
        />
        <Controller
          control={control}
          name={nameKeys.controllers}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <CustomSelect
              type='Controllers'
              link='/users'
              options={users}
              required={!usersOptional}
              value={value}
              error={error!}
              handleChange={onChange}
              style={{
                minWidth: 'calc(50% - .75rem)',
              }}
            />
          )}
        />
        <Controller
          control={control}
          name={nameKeys.note}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <CustomTextEditor
              value={value}
              fullScreen={fullScreen}
              height={fullScreen ? 500 : 150}
              onEditorChange={onChange}
              title='Note'
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
