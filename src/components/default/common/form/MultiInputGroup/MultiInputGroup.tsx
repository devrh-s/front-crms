import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { FormHelperText, IconButton, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';
import {
  Control,
  Controller,
  FieldError,
  FieldErrorsImpl,
  FieldValues,
  Merge,
  Path,
} from 'react-hook-form';

export interface IRenderInputsProps<P> {
  value: P[];
  index: number;
  el: P;
  onChange: (value: P[]) => void;
}

interface IMultiInputGroupProps<T extends FieldValues, P> {
  control: Control<T>;
  onAddClick?: () => void;
  onDeleteClick: (index: number) => void;
  label: string;
  fullScreen: boolean;
  name: Path<T>;
  required?: boolean;
  error?: Merge<FieldError, FieldErrorsImpl<T>>;
  renderInputs: (props: IRenderInputsProps<P>) => ReactNode;
  hiddenAddButton?: boolean;
}

export default function MultiInputGroup<T extends FieldValues, P>(
  props: IMultiInputGroupProps<T, P>
) {
  const {
    control,
    onAddClick,
    onDeleteClick,
    label,
    fullScreen = false,
    name,
    renderInputs,
    required = false,
    hiddenAddButton = false,
    error,
  } = props;
  return (
    <Stack flexDirection={'column'}>
      <Stack flexDirection='row' alignItems='center' gap='3px'>
        <Typography color={error && 'error'}>{label}</Typography>
        {required && (
          <Typography component='span' className='MuiFormLabel-asterisk' color={'error'}>
            *
          </Typography>
        )}
        {!hiddenAddButton && (
          <IconButton size='small' color='primary' onClick={onAddClick}>
            <AddCircleOutlineIcon
              sx={{
                width: '1.5rem',
                height: '1.5rem',
              }}
            />
          </IconButton>
        )}
      </Stack>
      {error && <FormHelperText error>{error.message?.toString()}</FormHelperText>}

      <Controller name={name} control={control} render={controlRender} />
    </Stack>
  );

  function controlRender({ field: { onChange, value } }: any) {
    return (
      <Stack
        gap='1rem'
        sx={{
          flexDirection: fullScreen ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {value?.map((el: P, index: number) => (
          <Stack
            gap={'1rem'}
            key={index}
            sx={{
              position: 'relative',
              border: '1px solid #000',
              padding: '1rem',
              borderRadius: '5px',
              width: '22rem',
            }}
          >
            <IconButton
              color='error'
              onClick={() => onDeleteClick(index)}
              sx={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                zIndex: 100,
              }}
            >
              <CloseIcon />
            </IconButton>
            {renderInputs({ value, index, el, onChange })}
          </Stack>
        ))}
      </Stack>
    );
  }
}
