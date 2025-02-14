import CustomSelect from '@/components/default/common/form/CustomSelect/CustomSelect';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import MultiInputGroup, {
  IRenderInputsProps,
} from '@/components/default/common/form/MultiInputGroup/MultiInputGroup';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData } from '@/lib/fetch';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Button, Skeleton, Stack } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { FieldErrors, SubmitHandler, useForm } from 'react-hook-form';
import { blocksWithoutProfile, createModelForURL } from './helpers';

type TaskResultFields = 'task_results';

interface ITaskResult {
  task_resultable_type: string;
  task_resultable_ids: number[];
  model: string;
}

interface IFormInputs {
  task_results: Array<ITaskResult>;
}

interface ITaskResultProps {
  id: string | number | null;
  defaultTaskResults: any[];
  fullScreen: boolean;
  activeBookmark: string;
}

interface IResultDataProps {
  index: number;
  model: string;
  value: any[];
  errors: FieldErrors<IFormInputs>;
  handleChange: (value: any[]) => void;
}

const getDefaultResult = (): ITaskResult => ({
  task_resultable_type: '',
  task_resultable_ids: [],
  model: '',
});

function ResultData({ index, value, model, errors, handleChange }: IResultDataProps) {
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
    refetchOnMount: false,
    placeholderData: [],
    enabled: true,
  });
  useEffect(() => {
    if (model) {
      if (prevModel.current && prevModel.current !== model) {
        value[index].task_resultable_ids = [];
        handleChange(value);
      }
      prevModel.current = model;

      refetch();
    }
  }, [model]);

  const isBlockAllowed = (block?: string) => {
    return block && !blocksWithoutProfile.includes(block);
  };

  const handleOptionClick = (option: any, block: string | undefined) => {
    if (block && isBlockAllowed(model.split('/').pop())) {
      window.open(`/${createModelForURL(block).toLowerCase()}/${option?.item_id || option?.id}`);
    }
  };

  return (
    <AnimatePresence>
      {model && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { duration: 0.3 } }}
          exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
        >
          <CustomSelect
            type={'Results'}
            options={resultOptions}
            value={value[index].task_resultable_ids}
            error={errors && errors.task_results?.[index]?.task_resultable_ids}
            handleChange={(selectedValues?: number[]) => {
              value[index].task_resultable_ids = selectedValues;
              handleChange(value);
            }}
            handleClick={(option) => handleOptionClick(option, model.split('/').pop())}
            required
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function TaskResult({
  id,
  defaultTaskResults,
  fullScreen,
  activeBookmark,
}: ITaskResultProps) {
  const [loading, setLoading] = useState(false);
  const showNotification = useNotification();
  const queryClient = useQueryClient();
  const {
    reset,
    control,
    getValues,
    setValue,
    setError,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IFormInputs>({
    shouldUnregister: false,
    defaultValues: {
      task_results: [],
    },
  });

  const { data: models, isFetching } = useQuery({
    queryKey: [`models`],
    queryFn: async () => {
      const response = await apiGetData(`models?perPage-1&isShort=1`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiSetData(`tasks/${id}/results`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['task'],
        });
        showNotification('Successfully save results', 'success');
      }
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;

      if (error) {
        for (const [key, value] of Object.entries(error)) {
          const errorKey = key as TaskResultFields;
          const errorValue = value as string;
          const error = {
            message: errorValue,
          };
          showNotification(`${status}: ${errorValue}`, 'error');
          setError(errorKey, error);
        }
      }
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    createMutation.mutate(data);
  };

  useEffect(() => {
    if (defaultTaskResults) {
      reset({ task_results: defaultTaskResults });
    }
  }, [defaultTaskResults]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (isFetching) {
      setLoading(true);
    } else {
      timer = setTimeout(() => setLoading(false), 1000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isFetching]);

  return (
    <Stack
      gap='1rem'
      sx={{ minHeight: '85%', display: activeBookmark === 'results' ? 'flex' : 'none' }}
    >
      {loading ? (
        <Stack gap='1rem'>
          <Stack flexDirection='row' gap='5px' alignItems='center'>
            <Skeleton variant='text' width={80} height={40} />
            <Skeleton variant='circular' width={20} height={20} />
          </Stack>
          <Skeleton variant='rounded' width='100%' height={80} />
          <Skeleton variant='rounded' width='100%' height={80} />
          <Skeleton variant='rounded' width='100%' height={80} />
        </Stack>
      ) : (
        <MultiInputGroup
          control={control}
          onAddClick={() => {
            const oldValues = getValues('task_results');
            setValue('task_results', [...oldValues, getDefaultResult()]);
          }}
          onDeleteClick={(index) => {
            const oldValues = getValues('task_results');
            setValue(
              'task_results',
              oldValues.filter((_, ind) => ind !== index)
            );
          }}
          label={'Result'}
          required
          fullScreen={fullScreen}
          name={'task_results'}
          renderInputs={({ value, index, el, onChange: handleChange }: IRenderInputsProps<any>) => (
            <Stack key={index} gap='1rem'>
              <CustomSingleSelect
                label={'Models'}
                field={{
                  value: value[index].task_resultable_type,
                  onChange: (targetValue?: number) => {
                    value[index].task_resultable_type = targetValue;
                    handleChange(value);
                  },
                }}
                options={models}
                error={errors && errors.task_results?.[index]?.task_resultable_type}
                required
                style={{
                  minWidth: 'calc(50% - 1.5rem)',
                }}
              />
              <ResultData
                index={index}
                model={value[index].task_resultable_type}
                value={value}
                errors={errors}
                handleChange={handleChange}
              />
            </Stack>
          )}
        />
      )}
      <Stack
        sx={{
          flex: 1,
          position: 'relative',
          paddingBottom: '2px',
          justifyContent: 'flex-end',
          width: '100%',
        }}
      >
        <Button
          variant='contained'
          size='large'
          type='submit'
          disabled={loading}
          sx={{
            alignSelf: fullScreen ? 'center' : 'unset',
            minWidth: '340px',
            '&.mobile': {
              minWidth: '0',
            },
          }}
          endIcon={<AddCircleOutlineIcon />}
          onClick={handleSubmit(onSubmit)}
        >
          Save results
        </Button>
      </Stack>
    </Stack>
  );
}
