'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import PricingInputs from '@/components/default/common/form/PricingInputs/PricingInputs';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

type PricingFields = 'package_name' | 'price';

interface IFormInputs {
  package_name: string;
  job_site_id: number;
  pricing_type_id: number | string;
  currency_id: number | string;
  job_post_amount: number | string;
  price: string;
  reason: string;
}

interface IPricingActionsProps {
  id: number | null;
  parentId?: number;
  visible: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function PricingActions({
  id,
  parentId,
  commonData,
  visible,
  isDuplicate = false,
  handleActions,
}: IPricingActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );
  const pricings = commonData.pricings ?? [];
  const currencies = commonData.currencies ?? [];

  const {
    register,
    reset,
    control,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>();

  const clearData = () =>
    reset({
      package_name: '',
      pricing_type_id: '',
      currency_id: '',
      job_post_amount: '',
      price: '',
      reason: '',
    });

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
      const errorKey = key as PricingFields;
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
    mutationFn: (data: any) => apiSetData(`job-sites/${parentId}/pricings`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['pricings'],
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
    mutationFn: async (data: any) => apiUpdateData(`job-sites/${parentId}/pricings/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['pricings'],
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
    queryKey: ['pricing', parentId, id],
    queryFn: async () => {
      const response = await apiGetData(`job-sites/${parentId}/pricings/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    data.job_site_id = parentId!;
    if (id && !isDuplicate) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
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
        package_name: `${isDuplicate ? `${data?.package_name} COPY` : data?.package_name}`,
        pricing_type_id: data.pricing_type.id,
        currency_id: data.currency.id,
        job_post_amount: data.job_post_amount,
        price: data.price,
        reason: '',
      });
      setCreationInfo({
        created_at: data.created_at,
        created_by: data.createdBy,
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
      title='Job Site'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      hideHandler={hideHandler}
      resetHandler={clearData}
      submitForm={submitForm}
      fullScreen={fullScreen}
      isLoading={isFetching}
      fullScreenHandler={fullScreenHandler}
      changeActiveBookmark={changeActiveBookmark}
      toggleBookmarkError={toggleBookmarkError}
      register={register}
      errors={errors}
      isDuplicate={isDuplicate}
    >
      <PricingInputs
        control={control}
        currencies={currencies}
        register={register}
        pricings={pricings}
        errors={errors}
        single
      />
    </ActionsDrawer>
  );
}
