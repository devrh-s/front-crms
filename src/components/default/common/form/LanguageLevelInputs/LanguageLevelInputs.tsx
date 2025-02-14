import TowSingleSelects from '@/components/default/common/form/TwoSingleSelects/TwoSingleSelects';
import { FieldErrors, FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';

export interface ILanguageLevelInput {
  id?: number;
  language_id?: number;
  level_id?: number;
}

export const getDefaultLanguage = (): ILanguageLevelInput => ({
  language_id: undefined,
  level_id: undefined,
});

interface ILanguageInputsProps {
  languages: Array<IOption>;
  levels: Array<IOption>;
  errors?:
    | Merge<FieldError, (Merge<FieldError, FieldErrorsImpl<ILanguageLevelInput>> | undefined)[]>
    | FieldErrors<ILanguageLevelInput>[];
  index: number;
  languagesArr: Array<ILanguageLevelInput>;
  elem?: ILanguageLevelInput;
  onChange?: (event: ILanguageLevelInput[]) => void;
}

export default function LanguageLevelInputs({
  languagesArr = [],
  index,
  elem,
  languages,
  levels,
  errors,
  onChange,
}: ILanguageInputsProps) {
  return (
    <TowSingleSelects
      options1={languages}
      options2={levels}
      label1='Language'
      label2='Level'
      link1='/languages'
      link2='/levels'
      required2={false}
      value1={elem?.language_id}
      value2={elem?.level_id}
      onChange1={(targetValue?: number) => {
        languagesArr[index].language_id = targetValue;
        onChange && onChange(languagesArr);
      }}
      onChange2={(targetValue?: number) => {
        languagesArr[index].level_id = targetValue;
        onChange && onChange(languagesArr);
      }}
      error1={errors && errors[index]?.language_id}
      error2={errors && errors[index]?.level_id}
    />
  );
}
