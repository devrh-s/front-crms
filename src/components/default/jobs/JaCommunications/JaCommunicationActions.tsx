'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CommunicationInputs from '@/components/default/common/form/CommunicationInputs/CommunicationInputs';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';

interface IJaCommunication {
  job_application_id?: number | '';
  account_id: number | '';
  communication_type_id: number | '';
  note: string;
  messages: number[];
  followup_date: string;
  followup_time: string;
  reason: string;
  channel: number | string;
}
interface IFormInputs {
  jaCommunication: IJaCommunication;
  reason: string;
}

type JaCommunicationFields = keyof IFormInputs;

const getDefaultFormInputs = (): IFormInputs => ({
  jaCommunication: {
    job_application_id: '',
    account_id: '',
    communication_type_id: '',
    note: '',
    messages: [],
    followup_date: '',
    followup_time: '',
    reason: '',
    channel: '',
  },
  reason: '',
});

interface IJaCommunicationActionsProps {
  id: number | null;
  visible: boolean;
  url?: string;
  commonData: ICommonData;
  jobApplicationHidden?: boolean;
  isDuplicate?: boolean;
  communications?: any;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function JaCommunicationActions({
  id,
  commonData,
  url,
  visible,
  jobApplicationHidden,
  communications,
  isDuplicate = false,
  handleActions,
}: IJaCommunicationActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );
  const {
    register,
    reset,
    control,
    getValues,
    setError,
    setValue,
    clearErrors,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: getDefaultFormInputs(),
  });
  const jobApplications = commonData.job_applications ?? [];
  const accounts = commonData.accounts ?? [];
  const communicationTypes = commonData.communication_types ?? [];
  const messages = commonData.messages ?? [];
  const chanelOptions = communications
    ?.map((con: any) => {
      if (con?.channel?.tool?.id) {
        return {
          id: con.channel.tool.id,
          name: `${con.channel?.value} (${con.channel.tool.name})`,
        };
      }
      return null;
    })
    .filter(Boolean);

  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const clearData = () => reset(getDefaultFormInputs());

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as JaCommunicationFields;
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
    mutationFn: (data: any) => apiSetData(url ?? 'ja-communications', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [url ?? 'ja-communications'],
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
    mutationFn: async (data: any) =>
      apiUpdateData(url ? `${url}/${id}` : `ja-communications/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [url ?? 'ja-communications'],
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

  const onSubmit: SubmitHandler<IFormInputs> = async ({ jaCommunication }) => {
    const chanel = chanelOptions?.find((chanel: any) => chanel.id === jaCommunication?.channel);
    const commonData = {
      ...jaCommunication,
      channel: {
        tool_id: chanel?.id,
        value: chanel?.name.match(/^(.*?)(?=\s*\()/)?.[1].trim(),
      },
      followup_date: jaCommunication?.followup_date
        ? dayjs(jaCommunication.followup_date).format('DD-MM-YYYY')
        : null,
      followup_time: dayjs(jaCommunication?.followup_time, 'HH:mm:ss').format('HH:mm:ss') || null,
    };

    if (jobApplicationHidden) {
      delete commonData.job_application_id;
    }
    if (id && !isDuplicate) {
      updateMutation.mutate(commonData);
    } else {
      createMutation.mutate(commonData);
    }
  };

  const submitHandler = handleSubmit(onSubmit);

  const submitForm = (e: FormEvent) => {
    e.preventDefault();
    clearErrors();
    submitHandler();
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['ja-communication', id],
    queryFn: async () => {
      const response = await apiGetData(url ? `${url}/${id}` : `ja-communications/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  useEffect(() => {
    if (data) {
      reset({
        jaCommunication: {
          job_application_id: data.job_application?.id,
          account_id: data.account?.id,
          communication_type_id: data.communication_type?.id,
          note: data.note,
          messages: data.messages?.map((message: any) => message.id),
          followup_date: data.followup_date,
          followup_time: data.followup_time,
          channel: data.channel?.tool?.id,
        },
        reason: '',
      });
      setCreationInfo({
        created_at: data.created_at,
        created_by: data.created_by,
      });
    }
  }, [data, visible]);

  useEffect(() => {
    if (id && visible) {
      refetch();
    }
  }, [id, visible]);

  return (
    <ActionsDrawer
      id={id}
      title='Ja Communication'
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
      {!jobApplicationHidden && (
        <Controller
          name='jaCommunication'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Job Application'
                link='/job-applications'
                field={field}
                options={jobApplications}
                required
                error={error}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                }}
              />
            );
          }}
        />
      )}

      <CommunicationInputs
        accounts={accounts}
        messages={messages}
        communication_types={communicationTypes}
        errors={[errors]}
        elem={watch('jaCommunication')}
        getValues={getValues}
        single={true}
        control={control}
        communicationsArr={[getValues('jaCommunication')]}
        chanelOptions={chanelOptions}
        onChange={(updatedArr) => {
          setValue('jaCommunication', updatedArr[0]);
        }}
      />
    </ActionsDrawer>
  );
}
