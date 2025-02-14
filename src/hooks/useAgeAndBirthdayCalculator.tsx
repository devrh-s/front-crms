import { useCallback } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { UseFormSetValue } from 'react-hook-form';

interface UseAgeAndBirthdayCalculatorProps {
  setValue: UseFormSetValue<any>;
  isEdit?: boolean;
}

const useAgeAndBirthdayCalculator = ({ setValue, isEdit }: UseAgeAndBirthdayCalculatorProps) => {
  const handleBirthdayChange = useCallback(
    (date: Dayjs | null) => {
      if (date && isEdit) {
        const birthDate = dayjs(date);
        const today = dayjs();
        const calculatedAge = today.diff(birthDate, 'year');
        setValue('age', calculatedAge, { shouldValidate: true });
      } else {
        setValue('age', '', { shouldValidate: true });
      }
    },
    [setValue, isEdit]
  );

  const handleAgeChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const ageValue = event.target.value;
      if (ageValue && isEdit) {
        const today = dayjs();
        const calculatedBirthday = today.subtract(Number(ageValue), 'year');
        setValue('birthday', calculatedBirthday, { shouldValidate: true });
      } else {
        setValue('birthday', null, { shouldValidate: true });
      }
    },
    [setValue, isEdit]
  );

  return { handleBirthdayChange, handleAgeChange };
};

export default useAgeAndBirthdayCalculator;
