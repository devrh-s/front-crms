import { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, TextField, Theme, useMediaQuery } from '@mui/material';
import {
  FieldError,
  FieldErrorsImpl,
  Merge,
  UseFormClearErrors,
  UseFormSetValue,
} from 'react-hook-form';
import { debounce } from '@/lib/helpers';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import CustomLabel from '../CustomLabel/CustomLabel';
import { UseMutationResult } from '@tanstack/react-query';

export interface INameInput {
  id?: number;
  name: string;
  translation_id?: number;
}

interface IProps {
  commonData: ICommonData;
  errors?: Merge<FieldError, (Merge<FieldError, FieldErrorsImpl<INameInput>> | undefined)[]>;
  index: number;
  value: Array<INameInput>;
  setValue: UseFormSetValue<any>;
  item: INameInput;
  onChange?: (value: INameInput[]) => void;
  errorsShortName?: any;
  clearErrors: UseFormClearErrors<any>;
  checkUniqueMutation: UseMutationResult<any, ResponseError, any, unknown>;
}

export default function NameInputs({
  value,
  setValue,
  index,
  item,
  commonData,
  errors,
  onChange,
  errorsShortName,
  clearErrors,
  checkUniqueMutation,
}: IProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const previousNameRef = useRef<string>(item.name);
  const shortNameIndexRef = useRef<number>(1);
  const [isEditing, setIsEditing] = useState(false);

  const updateNameFields = useCallback(
    debounce(({ shortName }: { shortName: string }) => {
      clearErrors(['short_name', 'slug']);
      const slug = shortName.toLowerCase().replace(/\s+/g, '-');
      setValue('short_name', shortName);
      setValue('slug', slug);
      checkUniqueMutation.mutate({
        data: { short_name: shortName },
        key: 'short_name',
        url: 'talents/short-name-available',
      });
      // checkUniqueMutation.mutate({
      //   data: { slug },
      //   key: 'slug',
      //   url: 'talents/slug-available',
      // });
    }, 500),
    []
  );

  const generateShortName = useCallback((fullName: string, index: number) => {
    if (!fullName.trim()) {
      return;
    }
    const [lastName, firstName] = fullName.trim().split(/\s+/);
    const shortName = firstName ? `${firstName} ${lastName.slice(0, index)}` : lastName;

    updateNameFields({ shortName });
  }, []);

  useEffect(() => {
    if (isEditing && item.translation_id === 1 && item.name !== previousNameRef.current) {
      shortNameIndexRef.current = 1;
      generateShortName(item.name, shortNameIndexRef.current);
      previousNameRef.current = item.name;
    }
  }, [item, isEditing]);

  useEffect(() => {
    if (isEditing && item.translation_id === 1 && errorsShortName) {
      const maxIndex = item.name.split(/\s+/)[0]?.length || 1;
      if (shortNameIndexRef.current < maxIndex) {
        shortNameIndexRef.current += 1;
        generateShortName(item.name, shortNameIndexRef.current);
      }
    }
  }, [isEditing, item, errorsShortName]);

  return (
    <Stack flexDirection='row' gap='1rem'>
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        value={item.name}
        name={`names[${index}].name`}
        error={!!(errors && errors[index]?.name)}
        helperText={errors && (errors[index]?.name?.message ?? '')}
        label={<CustomLabel label={'Name'} required />}
        onChange={(event) => {
          value[index].name = event.target.value;
          onChange && onChange(value);
          if (!isEditing) setIsEditing(true);
        }}
        className={mdDown ? 'mobile' : ''}
        sx={{ minWidth: 'calc(33.3% - 1rem)' }}
      />

      <CustomSingleSelect
        label={'Translation'}
        link='/languages'
        field={{
          value: item.translation_id,
          onChange: (targetValue?: number) => {
            value[index].translation_id = targetValue;
            onChange && onChange(value);
          },
        }}
        options={commonData.languages ?? []}
        error={errors && errors[index]?.translation_id}
        disabled={index === 0 && item.translation_id === 1}
        required
        style={{
          width: '50%',
        }}
      />
    </Stack>
  );
}
