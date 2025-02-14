'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CommunicationInputs from '@/components/default/common/form/CommunicationInputs/CommunicationInputs';
import {
  ContactSingleInputs,
  IContactInput,
} from '@/components/default/common/form/ContactInputs/ContactInputs';
import CustomLabel from '@/components/default/common/form/CustomLabel/CustomLabel';
import CustomSelect from '@/components/default/common/form/CustomSelect/CustomSelect';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import CustomSwitchSelect, {
  getSwitchSelectData,
} from '@/components/default/common/form/CustomSwitchSelect/CustomSwitchSelect';
import CustomTextEditor from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import MultiInputGroup, {
  IRenderInputsProps,
} from '@/components/default/common/form/MultiInputGroup/MultiInputGroup';
import CountryCity from '@/components/default/common/related/actions/CountryCity/CountryCity';
import useAgeAndBirthdayCalculator from '@/hooks/useAgeAndBirthdayCalculator';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import {
  FormHelperText,
  IconButton,
  Stack,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import DateInput from '../../common/form/DateInput/DateInput';
import { IFormInputs, IJobApplicationActionsProps, JobApplicationFields } from './types';
import { toolsValidation } from './validation';

export const defaultJACommunication: IJACommunication = {
  id: '',
  account_id: '',
  communication_type_id: '',
  followup_date: '',
  followup_time: '',
  note: '',
  messages: [],
  channel: '',
};

const getDefaultContact = (): IContactInput => ({
  id: undefined,
  tool_id: undefined,
  value: '',
});

const getDefaultFormInputs = (): IFormInputs => ({
  name: '',
  country_id: '',
  city_id: '',
  gender: '',
  status_id: '',
  manager_id: '',
  birthday: '',
  age: '',
  notes: '',
  professions: [],
  sources: { name: 'accounts', ids: [] },
  job_posts: [],
  job_requests: [],
  contacts: [],
  communications: [],
  reason: '',
});
const bookmarkErrorRelations = {
  profile: [
    'name',
    'gender',
    'country_id',
    'city_id',
    'manager_id',
    'status_id',
    'job_posts',
    'sources',
    'professions',
    'job_requests',
    'reason',
    'notes',
  ],
  communication: ['communications'],
  contact: ['contacts'],
};

export default function JobApplicationActions({
  id,
  commonData,
  visible,
  isProfile = false,
  isDuplicate = false,
  handleActions,
}: IJobApplicationActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const {
    activeBookmark,
    bookmarks,
    changeActiveBookmark,
    toggleBookmarkError,
    getBookmarkErrorName,
  } = useBookmarks(['profile', 'contact', 'communication'], visible);
  const {
    register,
    reset,
    watch,
    control,
    getValues,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: getDefaultFormInputs(),
  });

  const currentJobPosts = watch('job_posts');
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const countries = commonData.countries ?? [];
  const cities = commonData.cities ?? [];
  const users = commonData.users ?? [];
  const statuses = commonData.statuses ?? [];
  const genders = commonData.genders ?? [];
  const job_posts = commonData.job_posts ?? [];
  const job_requests = commonData.job_requests ?? [];
  const accounts = commonData.accounts ?? [];
  const communication_types = commonData.communication_types ?? [];
  const tools = commonData.tools ?? [];
  const messages = commonData.messages ?? [];
  const job_accounts = commonData.job_accounts ?? [];
  const professions = commonData.professions ?? [];
  const chanelOptions = watch('contacts')?.map((con) => {
    const tool = tools.find((tool) => tool.id === con.tool_id);
    return {
      id: tool?.id || '',
      name: `${con.value} (${tool?.name})`,
    };
  });

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
      const errorKey = key as JobApplicationFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
    const bookmarkErrorName = getBookmarkErrorName(bookmarkErrorRelations, Object.keys(errors));
    const [nextBookmark] = bookmarkErrorName;
    toggleBookmarkError(bookmarkErrorName);
    if (activeBookmark !== nextBookmark) {
      changeActiveBookmark(nextBookmark);
    }
  };

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: any) => apiSetData('job-applications', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'job-application' : 'job-applications'],
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
    mutationFn: async (data: any) => apiUpdateData(`job-applications/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'job-application' : 'job-applications'],
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
    queryKey: ['job-application', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`job-applications/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const { handleBirthdayChange, handleAgeChange } = useAgeAndBirthdayCalculator({
    setValue,
    isEdit: !!data,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData: any = {
      ...data,
      [data?.sources?.name]: data?.sources?.ids,
      sources: data?.sources?.ids,
      birthday: data?.birthday ? dayjs(data?.birthday).format('DD-MM-YYYY') : '',
      age: !data.birthday ? +data?.age : '',
    };

    commonData.communications = commonData?.communications?.map(
      (el: IJACommunication, index: number) => {
        const chanel = chanelOptions?.find((chanel) => chanel.id === el.channel);
        return {
          ...el,
          channel: {
            tool_id: chanel?.id,
            value: chanel?.name.match(/^(.*?)(?=\s*\()/)?.[1].trim(),
          },
          followup_date: dayjs(el?.followup_date).format('DD-MM-YYYY'),
          followup_time: dayjs(el?.followup_date, 'HH:mm:ss').format('HH:mm:ss'),
        };
      }
    );

    const validateContacts = (contacts: any[]) => {
      let isValid = true;

      const result = contacts?.map((contact, index) => {
        // @ts-ignore
        const validationRule = toolsValidation[contact.tool_id];

        if (!validationRule) {
          return null;
        }

        const regexp = new RegExp(validationRule.regexp);
        const isContactValid = regexp.test(contact.value);

        if (!isContactValid) {
          const error = {
            [`contacts.${index}.value`]: [validationRule.message],
          };
          handleErrors(error, 422);
          isValid = false;
          return { ...contact, valid: false, message: validationRule.message };
        }

        return null;
      });

      return isValid ? [] : result.filter((contact) => contact !== null);
    };

    const validatedContacts = validateContacts(commonData.contacts);

    if (validatedContacts.length === 0) {
      if (id && !isDuplicate) {
        updateMutation.mutate(commonData);
      } else {
        createMutation.mutate(commonData);
      }
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
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        country_id: data.country?.country_id,
        city_id: data.city?.city_id,
        gender: data.gender,
        notes: data.notes,
        status_id: data?.status?.id,
        manager_id: data?.manager?.id,
        sources: getSwitchSelectData(data, ['accounts', 'job_accounts']),
        job_posts: data.job_posts.map((jobPost: IJobPost) => jobPost.id),
        job_requests: data.job_requests.map((jobRequest: any) => jobRequest.id),
        professions: data.professions.map((profession: any) => profession?.profession_id),
        age: data?.age,
        birthday: data?.birthday,
        communications: data.communications.map((communication: IJACommunication) => ({
          id: communication?.id,
          account_id: communication?.account?.id,
          communication_type_id: communication?.communication_type?.id,
          followup_date: communication?.followup_date ?? null,
          followup_time: communication?.followup_time ?? null,
          channel: communication?.channel?.tool?.id,
          note: communication?.note,
          messages: communication?.messages.map((message: any) => message.id),
        })),
        contacts: data.contacts?.map((contact: IContact) => ({
          id: contact?.id,
          value: contact?.value,
          tool_id: contact?.tool?.id,
        })),
        reason: '',
      });
      setCreationInfo({
        created_at: data.created_at,
        created_by: data.created_by,
      });
    } else {
      setValue('status_id', statuses.find((status) => status.is_default === 1)?.id ?? '');
    }
  }, [data, visible, isDuplicate]);

  useEffect(() => {
    if (!id && currentJobPosts?.length > 0) {
      const fullJobPosts = job_posts.filter((el: any) => currentJobPosts.includes(+el.id));
      const firstJobPost = fullJobPosts.find((el) => el.job_account || el.account);
      if (firstJobPost) {
        const sourceType = firstJobPost?.job_account ? 'job_account' : 'account';
        const filteredJobPostsIds = fullJobPosts
          .filter((el: any) => el[sourceType])
          .map((el) => el[sourceType]!.id);
        setValue('sources', { name: `${sourceType}s`, ids: filteredJobPostsIds });
      }
    }
  }, [id, currentJobPosts]);

  useEffect(() => {
    if (id && visible) {
      refetch();
    }
  }, [id, visible]);

  return (
    <ActionsDrawer
      id={id}
      title='Job Application'
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
      <Stack
        flexDirection='row'
        gap='1rem'
        sx={{
          display: activeBookmark === 'profile' ? 'flex' : 'none',
          minWidth: '100%',
        }}
      >
        <TextField
          variant='standard'
          InputLabelProps={{ shrink: true }}
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name ? errors.name?.message : ''}
          label={<CustomLabel label={'Name'} required />}
          className={mdDown ? 'mobile' : ''}
          sx={{
            width: '50%',
            '&.mobile': {
              width: 'auto',
              flex: '1',
            },
          }}
        />

        <Controller
          name='gender'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Gender'
                field={field}
                options={genders}
                required
                error={error}
                style={{
                  width: '50%',
                }}
              />
            );
          }}
        />
      </Stack>
      <Stack
        flexDirection='row'
        gap='1rem'
        sx={{
          display: activeBookmark === 'profile' ? 'flex' : 'none',
          minWidth: '100%',
        }}
      >
        <CountryCity
          control={control}
          countries={countries}
          cities={cities}
          styles={{
            width: '50%',
          }}
          watch={watch}
          setValue={setValue}
        />
      </Stack>

      <Stack
        flexDirection='row'
        gap='1rem'
        sx={{
          display: activeBookmark === 'profile' ? 'flex' : 'none',
          minWidth: '100%',
        }}
      >
        <Controller
          name='manager_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Manager'
                link='/users'
                field={field}
                options={users}
                required
                error={error}
                style={{
                  width: '50%',
                }}
              />
            );
          }}
        />
        <Controller
          name='status_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='Status'
                link='/statuses'
                field={field}
                options={statuses}
                required
                error={error}
                style={{
                  width: '50%',
                }}
              />
            );
          }}
        />
      </Stack>

      <Stack
        flexDirection='row'
        gap='1rem'
        sx={{
          display: activeBookmark === 'profile' ? 'flex' : 'none',
          minWidth: '100%',
        }}
      >
        <Controller
          control={control}
          name='job_posts'
          render={({ field: { onChange, value, name }, fieldState: { error } }) => (
            <CustomSelect
              type={name}
              link='/job-posts'
              options={job_posts}
              value={value}
              error={error!}
              required
              handleChange={onChange}
              style={{
                display: activeBookmark === 'profile' ? 'flex' : 'none',
                width: '50%',
              }}
            />
          )}
        />
        <Controller
          control={control}
          name='job_requests'
          render={({ field: { onChange, value, name }, fieldState: { error } }) => (
            <CustomSelect
              type={name}
              link='/job-requests'
              options={job_requests}
              value={value}
              error={error!}
              required
              handleChange={onChange}
              style={{
                display: activeBookmark === 'profile' ? 'flex' : 'none',
                width: '50%',
              }}
            />
          )}
        />
      </Stack>

      <Stack
        flexDirection='row'
        gap='1rem'
        sx={{
          display: activeBookmark === 'profile' ? 'flex' : 'none',
          minWidth: '100%',
        }}
      >
        <Controller
          name='birthday'
          control={control}
          render={({ field }) => (
            <DateInput
              label={'Birthday'}
              format='DD-MM-YYYY'
              required
              error={errors?.birthday}
              style={{
                width: fullScreen ? '50%' : 'auto',
                '&.mobile': {
                  width: 'auto',
                  gridColumn: 'auto',
                },
              }}
              disabled={!data && !!watch('age')}
              field={{
                ...field,
                onChange: (date: any) => {
                  field.onChange(date);
                  handleBirthdayChange(date);
                },
              }}
            />
          )}
        />

        <TextField
          variant='standard'
          type='number'
          inputProps={{ min: 0 }}
          InputLabelProps={{ shrink: true, required: true }}
          {...register('age', {
            onChange: (event) => handleAgeChange(event),
          })}
          error={!!errors.age}
          helperText={errors.age ? errors.age?.message : ''}
          label='Age'
          disabled={!data && !!watch('birthday')}
          className={mdDown ? 'mobile' : ''}
          sx={{ minWidth: 'calc(33.3% - 1rem)' }}
        />
      </Stack>

      <Controller
        control={control}
        name='professions'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/professions'
            options={professions}
            value={value}
            error={error!}
            style={{
              display: activeBookmark === 'profile' ? 'flex' : 'none',
              width: '100%',
            }}
            handleChange={onChange}
          />
        )}
      />

      <Controller
        control={control}
        name='sources'
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <CustomSwitchSelect
            label='sources'
            optionsVars={{ accounts, job_accounts }}
            value={value}
            handleChange={onChange}
            required
            error={error!}
            style={{
              display: activeBookmark === 'profile' ? 'flex' : 'none',
              width: '100%',
            }}
          />
        )}
      />
      <Controller
        control={control}
        name='notes'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomTextEditor
            value={value}
            fullScreen={fullScreen}
            height={fullScreen ? 500 : 150}
            onEditorChange={onChange}
            title={name}
            error={error?.message}
            style={{
              display: activeBookmark === 'profile' ? 'flex' : 'none',
              width: '100%',
            }}
          />
        )}
      />

      <Stack sx={{ display: activeBookmark === 'contact' ? 'flex' : 'none' }} gap='1rem'>
        <MultiInputGroup
          control={control}
          required
          error={errors.contacts}
          onAddClick={() => {
            const oldValues = getValues('contacts') ?? [];
            setValue('contacts', [...oldValues, getDefaultContact()]);
          }}
          onDeleteClick={(index) => {
            const oldValues = getValues('contacts');
            setValue(
              'contacts',
              oldValues.filter((_, ind) => ind !== index)
            );
          }}
          label={'Contacts'}
          fullScreen={fullScreen}
          name={'contacts'}
          renderInputs={({ value, index, el, onChange }: IRenderInputsProps<IContactInput>) => (
            <ContactSingleInputs
              control={control}
              tools={tools}
              errors={errors.contacts}
              register={register}
              tool_id={el.tool_id}
              setError={setError}
              clearErrors={clearErrors}
              setValue={setValue}
              onChange={onChange}
              value={value}
              index={index}
              item={el}
            />
          )}
        />
      </Stack>

      <Stack sx={{ display: activeBookmark === 'communication' ? 'flex' : 'none' }} gap='1rem'>
        <Stack flexDirection='row' alignItems='center' gap='3px'>
          <Typography color={errors?.communications && 'error'}>Communications</Typography>
          <Typography component='span' className='MuiFormLabel-asterisk' color={'error'}>
            *
          </Typography>
          <IconButton
            size='small'
            color='primary'
            onClick={() => {
              const oldValues = getValues('communications') ?? [];
              setValue('communications', [...oldValues, defaultJACommunication]);
            }}
          >
            <AddCircleOutlineIcon
              sx={{
                width: '1.5rem',
                height: '1.5rem',
              }}
            />
          </IconButton>
        </Stack>
        {errors?.communications && (
          <FormHelperText error>{errors?.communications.message?.toString()}</FormHelperText>
        )}
        <Controller
          name='communications'
          control={control}
          render={({ field: { onChange, value } }) => {
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
                {value?.map((el, index) => (
                  <Stack
                    key={index}
                    gap='1rem'
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
                      onClick={() =>
                        setValue(
                          'communications',
                          value.filter((_, ind) => ind !== index)
                        )
                      }
                      sx={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        zIndex: 100,
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                    <CommunicationInputs
                      onChange={onChange}
                      getValues={getValues}
                      communicationsArr={value}
                      index={index}
                      elem={el}
                      accounts={accounts}
                      messages={messages}
                      communication_types={communication_types}
                      errors={errors.communications}
                      control={control}
                      single={isProfile}
                      chanelOptions={chanelOptions}
                    />
                  </Stack>
                ))}
              </Stack>
            );
          }}
        />
      </Stack>
    </ActionsDrawer>
  );
}
