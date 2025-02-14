import { useState, useEffect } from 'react';
import { Controller, Control, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import CustomSingleSelect from '../../../form/CustomSingleSelect/CustomSingleSelect';

interface ICountryCityProps {
  control: Control<any>;
  professions: any;
  styles?: any;
  similar_professions: any;
  required?: {
    professions: boolean;
    similar_professions: boolean;
  };
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
}

export default function SimilarProfessions({
  control,
  professions,
  similar_professions,
  styles,
  required = {
    professions: true,
    similar_professions: false,
  },
  watch,
  setValue,
}: ICountryCityProps) {
  const [reducedSimilarProfession, setReducedSimilarProfession] = useState(similar_professions);
  const watchProfessionId = watch('profession_id');
  const watchSimilarProfessionId = watch('similar_profession_id');

  useEffect(() => {
    if (watchProfessionId) {
      const foundProfession = professions.find((p: any) => p.id === watchProfessionId);
      const relevantSimilarProfessions = similar_professions.filter(
        (p: any) => p.item_id === foundProfession?.item_id
      );
      if (!relevantSimilarProfessions.find((el: any) => el.id === watchSimilarProfessionId)) {
        setValue('similar_profession_id', '');
      }
      setReducedSimilarProfession(relevantSimilarProfessions);
    } else {
      setReducedSimilarProfession(similar_professions);
    }
  }, [watchProfessionId, similar_professions]);

  return (
    <>
      <Controller
        name='profession_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Profession'
              link='/professions'
              field={field}
              options={professions}
              required
              error={error}
              style={{
                minWidth: 'calc(50% - .75rem)',
              }}
            />
          );
        }}
      />
      <Controller
        name='similar_profession_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Similar profession'
              field={field}
              options={reducedSimilarProfession}
              error={error}
              style={{
                minWidth: 'calc(50% - .75rem)',
              }}
            />
          );
        }}
      />
    </>
  );
}
