import { Controller, UseFormRegister, Control } from 'react-hook-form';
import {
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  MenuItem,
  TextField,
  useMediaQuery,
  Theme,
  IconButton,
} from '@mui/material';
import CustomSingleSelect from '../CustomSingleSelect/CustomSingleSelect';
import CustomTextEditor, { IEditor } from '../CustomTextEditor/CustomTextEditor';
import { useState } from 'react';
import { IStepType } from '@/components/default/tasks/Tasks/types';
import CloseIcon from '@mui/icons-material/Close';
import CustomLabel from '../CustomLabel/CustomLabel';

interface IGuideFormat {
  id: number | string;
  link: string;
  object_id: number | string;
  format_id: number | string;
  description: string;
}

interface IPricingInputsProps {
  users: Array<IOption>;
  checklist_items: Array<IOption>;
  step_templates: Array<IOption>;
  errors: any;
  fullScreen: any;
  index?: number;
  single?: boolean;
  guidesArr?: Array<IStepType>;
  elem?: IStepType;
  onChange?: (event: any[]) => void;
  control?: Control<any>;
  register: UseFormRegister<any>;
  setEditorRef: (editor: IEditor) => void;
  getValues: any;
}

export default function StepsInputs({
  control,
  guidesArr,
  index,
  elem,
  fullScreen,
  users,
  step_templates,
  checklist_items,
  errors,
  single,
  getValues,
  register,
  onChange,
  setEditorRef,
}: IPricingInputsProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <>
      {single ? (
        <TextField
          variant='standard'
          InputLabelProps={{ shrink: true }}
          {...register('name')}
          error={!!errors.link}
          label={<CustomLabel label={'Name'} required />}
          helperText={errors.link ? errors.link?.message : ''}
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
          value={elem?.name}
          onChange={(e) => {
            const newValue = guidesArr ? [...guidesArr] : [];
            newValue[index ?? 0].name = e.target.value;
            if (onChange) {
              onChange(newValue);
            }
          }}
          required
          error={!!errors.steps}
          helperText={errors.steps ? errors.steps[index!]?.name?.message : ''}
          label='Name'
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
          name='assignee_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Assignee'
                link='/users'
                field={field}
                required
                options={users}
                error={error}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                }}
              />
            );
          }}
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
          <InputLabel id='objects-label' shrink sx={{ display: 'inline-flex', gap: '.2rem' }}>
            Assignee
            <Typography component='span' color='#e53935'>
              *
            </Typography>
          </InputLabel>
          <Select
            labelId='objects-label'
            value={elem?.assignee_id}
            inputProps={{
              required: true,
            }}
            onChange={(e) => {
              const newValue = guidesArr ? [...guidesArr] : [];
              newValue[index ?? 0].assignee_id = e.target.value as number;
            }}
          >
            {users.map((object: IOption) => (
              <MenuItem key={object.id} value={object.id}>
                {object.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText error>
            {errors.steps ? errors.steps[index!]?.assignee_id?.message : ''}
          </FormHelperText>
        </FormControl>
      )}
      {single ? (
        <Controller
          name='step_template_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Step Template'
                link='/step-templates'
                field={field}
                required
                options={users}
                error={error}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                }}
              />
            );
          }}
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
          <InputLabel
            id='step_template_id-label'
            shrink
            sx={{ display: 'inline-flex', gap: '.2rem' }}
          >
            Step Template
            <Typography component='span' color='#e53935'>
              *
            </Typography>
          </InputLabel>
          <Select
            labelId='step_template_id-label'
            value={elem?.step_template_id}
            inputProps={{
              required: true,
            }}
            onChange={(e) => {
              const newValue = guidesArr ? [...guidesArr] : [];
              newValue[index ?? 0].step_template_id = e.target.value as number;
            }}
          >
            {step_templates.map((object: IOption) => (
              <MenuItem key={object.id} value={object.id}>
                {object.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText error>
            {errors.steps ? errors.steps[index!]?.step_template_id?.message : ''}
          </FormHelperText>
        </FormControl>
      )}
      {/* <Controller
        name="checklists"
        control={control}
        render={({ field: { onChange, value } }) => {
          return (
            <Stack
              gap="1rem"
              sx={{
                flexDirection: fullScreen ? "row" : "column",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {value.map((el: any, index: any) => (
                <Stack
                  key={index}
                  gap="1rem"
                  sx={{
                    position: "relative",
                    border: "1px solid #555252",
                    padding: "1rem",
                    borderRadius: "6px",
                    width: "22rem",
                  }}
                >
                  <IconButton
                    color="error"
                    onClick={() =>
                      setValue(
                        "checklists",
                        value.filter((_, ind) => ind !== index)
                      )
                    }
                    sx={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      zIndex: 100,
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <StepsInputs
                    register={register}
                    onChange={onChange}
                    guidesArr={value}
                    index={index}
                    elem={el}
                    setEditorRef={(editor: IEditor) => (formatsEditorsRef.current[index] = editor)}
                    getValues={getValues}
                    users={users}
                    step_templates={step_templates}
                    checklist_items={checklist_items}
                    errors={errors}
                  />
                </Stack>
              ))}
            </Stack>
          );
        }}
      /> */}

      {/* <CustomTextEditor
        setEditorRef={setEditorRef}
        title="description"
        initialText={single ? getValues("description") : elem?.description ?? ""}
        height={200}
      /> */}
    </>
  );
}
