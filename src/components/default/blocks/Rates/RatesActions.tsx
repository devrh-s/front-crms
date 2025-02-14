'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import RateInputs, {
  getDefaultRate,
  IRateInput,
} from '@/components/default/common/form/RateInputs/RateInputs';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

interface IFormInputs {
  rate: IRateInput;
  reason: string;
}

type ProfessionsFields = keyof IFormInputs;

const getDefaultFormInputs = (): IFormInputs => ({
  rate: getDefaultRate(),
  reason: '',
});

interface IActionsProps {
  id: number | null;
  url?: string;
  visible: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function RatesActions({
  id,
  url,
  commonData,
  visible,
  isDuplicate = false,
  handleActions,
}: IActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );

  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);

  const {
    register,
    reset,
    setValue,
    watch,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: getDefaultFormInputs(),
  });

  const clearData = () => reset(getDefaultFormInputs());

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as ProfessionsFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
    toggleBookmarkError('profile');
  };

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => apiSetData(url ?? 'rates', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [url ?? 'rates'],
        });
        hideHandler();
        showNotification('Successfully created', 'success');
        if (addLibrary) window.close();
      }
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      if (status === 422) {
        handleErrors(error, status);
      } else {
        showNotification(`${status}: Something went wrong`, 'error');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiUpdateData(url ? `${url}/${id}` : `rates/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [url ?? 'rates'],
        });
        hideHandler();
        showNotification('Successfully updated', 'success');
        if (addLibrary) window.close();
      }
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      if (status === 422) {
        handleErrors(error, status);
      } else {
        showNotification(`${status}: Something went wrong`, 'error');
      }
    },
  });

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['rates', id],
    queryFn: async () => {
      const response = await apiGetData(url ? `${url}/${id}` : `rates/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const sendData = {
      reason: data.reason,
      ...data.rate,
      start_date: data.rate.start_date
        ? dayjs(data.rate.start_date).format('DD-MM-YYYY')
        : undefined,
      end_date: data.rate.end_date ? dayjs(data.rate.end_date).format('DD-MM-YYYY') : undefined,
    };
    if (id && !isDuplicate) {
      updateMutation.mutate(sendData);
    } else {
      createMutation.mutate(sendData);
    }
  };

  const submitHandler = handleSubmit(onSubmit);

  const submitForm = (e: FormEvent) => {
    e.preventDefault();
    clearErrors();
    submitHandler();
  };

  useEffect(() => {
    if (data) {
      reset({
        rate: {
          id: data?.id,
          rate_id: data?.rate?.id,
          inner_client_id: data?.inner_client?.id,
          start_date: data?.start_date,
          end_date: data?.end_date,
          shift_id: data?.shift.id,
        },
      });
      setCreationInfo({
        created_at: data?.created_at,
        created_by: data?.createdBy,
      });
    }
  }, [data, visible, isDuplicate]);

  useEffect(() => {
    if (id && visible) {
      refetch();
    }
  }, [id, visible]);
  return (
    <ActionsDrawer
      id={id}
      title='Rate'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      hideHandler={hideHandler}
      resetHandler={clearData}
      submitForm={submitForm}
      changeActiveBookmark={changeActiveBookmark}
      toggleBookmarkError={toggleBookmarkError}
      fullScreenHandler={fullScreenHandler}
      fullScreen={fullScreen}
      register={register}
      errors={errors}
      isLoading={isFetching}
      isDuplicate={isDuplicate}
    >
      <RateInputs
        value={[watch('rate')]}
        item={watch('rate')}
        commonData={commonData}
        errors={[errors]}
        index={0}
        onChange={(arr) => {
          const [data] = arr;
          setValue('rate', data);
        }}
      />
    </ActionsDrawer>
  );
}
