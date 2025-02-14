import { useEffect, useRef } from 'react';
import { Stack } from '@mui/material';
import MultiInputGroup, {
  IRenderInputsProps,
} from '@/components/default/common/form/MultiInputGroup/MultiInputGroup';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import CustomSelect from '@/components/default/common/form/CustomSelect/CustomSelect';
import { apiGetData, apiSetData } from '@/lib/fetch';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ILinksDestinations } from './types';

interface ILinksDestionationsProps {
  defaultLinksDestinations: ILinksDestinations[];
  control: any;
  getValues: any;
  errors: any;
  setValue: any;
  fullScreen: boolean;
  commonData: ICommonData;
  activeBookmark: string;
}

interface IResultDataProps {
  index: number;
  model: string;
  value: any[];
  errors: any;

  handleChange: (value: any[]) => void;
}
const getDefaultDestinationsFormInputs = (): ILinksDestinations => ({
  destinationable_type: '',
  destinationable_ids: [],
});
function LinksDestinationData({ index, value, model, errors, handleChange }: IResultDataProps) {
  const prevModel = useRef('');
  const {
    data: resultOptions,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [`models-data-${index}`],
    queryFn: async () => {
      const response = await apiGetData(`models-data?model=${model}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    placeholderData: [],
    enabled: false,
  });
  useEffect(() => {
    if (model) {
      if (prevModel.current && prevModel.current !== model) {
        value[index].destinationable_ids = [];
        handleChange(value);
      }
      prevModel.current = model;
      refetch();
    }
  }, [model]);
  return (
    <AnimatePresence>
      {model && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { duration: 0.3 } }}
          exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
        >
          <CustomSelect
            type={'Destinations'}
            required
            options={resultOptions}
            value={value[index].destinationable_ids}
            error={errors && errors.destinations?.[index]?.destinationable_ids}
            handleChange={(selectedValues?: number[]) => {
              value[index].destinationable_ids = selectedValues;
              handleChange(value);
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LinksDestinations({
  control,
  activeBookmark,
  getValues,
  errors,
  setValue,
  defaultLinksDestinations,
  fullScreen,
  commonData,
}: ILinksDestionationsProps) {
  useEffect(() => {
    if (defaultLinksDestinations) {
      setValue('destinations', defaultLinksDestinations);
    }
  }, [defaultLinksDestinations]);

  const destinationsType = commonData.destinations ?? [];

  return (
    <Stack
      gap='1rem'
      sx={{ minHeight: '85%' }}
      display={activeBookmark === 'destinations' ? 'block' : 'none'}
    >
      <MultiInputGroup
        control={control}
        onAddClick={() => {
          const oldValues = getValues('destinations');
          setValue('destinations', [...oldValues, getDefaultDestinationsFormInputs()]);
        }}
        onDeleteClick={(index) => {
          const oldValues = getValues('destinations');
          setValue(
            'destinations',
            oldValues.filter((_: any, ind: any) => ind !== index)
          );
        }}
        label={'Destinations'}
        fullScreen={fullScreen}
        name={'destinations'}
        renderInputs={({ value, index, el, onChange: handleChange }: IRenderInputsProps<any>) => (
          <Stack key={index} gap='1rem'>
            <CustomSingleSelect
              label={'Type'}
              field={{
                value: value[index].destinationable_type,
                onChange: (targetValue?: number) => {
                  value[index].destinationable_type = targetValue;
                  handleChange(value);
                },
              }}
              options={destinationsType}
              error={errors && errors.destinations?.[index]?.destinationable_type}
              required
              style={{
                minWidth: 'calc(50% - 1.5rem)',
              }}
            />
            <LinksDestinationData
              index={index}
              model={value[index].destinationable_type}
              value={value}
              errors={errors}
              handleChange={handleChange}
            />
          </Stack>
        )}
      />
    </Stack>
  );
}
