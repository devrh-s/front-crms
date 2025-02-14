'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomSelect from '@/components/default/common/form/CustomSelect/CustomSelect';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import PricingInputs from '@/components/default/common/form/PricingInputs/PricingInputs';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Stack, TextField, Theme, Typography, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';

type JobSiteFields = 'name' | 'website';

interface IJobSitePricing {
  id: number | string;
  pricing_type_id: number | string;
  package_name: string;
  price: number | string;
  currency_id: number | string;
  job_post_amount: number | string;
}

interface IFormInputs {
  name: string;
  website: string;
  note: string;
  countries: number[];
  languages: number[];
  job_site_pricings: Array<IJobSitePricing>;
  reason: string;
}

interface IJobSiteActionsProps {
  id: number | null;
  visible: boolean;
  commonData: ICommonData;
  isProfile?: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

const defaultPricing: IJobSitePricing = {
  id: '',
  pricing_type_id: '',
  package_name: '',
  price: '',
  currency_id: '',
  job_post_amount: '',
};

const bookmarkErrorRelations = {
  profile: ['name', 'website', 'countries', 'languages', 'reason'],
  pricing: ['job_site_pricings'],
};

export default function JobSiteActions({
  id,
  commonData,
  visible,
  isProfile = false,
  isDuplicate = false,
  handleActions,
}: IJobSiteActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const editorRef = useRef<IEditor | null>(null);
  const {
    activeBookmark,
    bookmarks,
    changeActiveBookmark,
    toggleBookmarkError,
    getBookmarkErrorName,
  } = useBookmarks(['profile', 'pricing'], visible);
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const {
    register,
    reset,
    control,
    getValues,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      job_site_pricings: [],
    },
  });

  const countries = commonData.countries ?? [];
  const languages = commonData.languages ?? [];
  const currencies = commonData.currencies ?? [];
  const pricings = commonData.pricings ?? [];

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const clearData = () => {
    reset({
      name: '',
      website: '',
      countries: [],
      languages: [],
      note: '',
      job_site_pricings: [],
      reason: '',
    });
  };

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as JobSiteFields;
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
    mutationFn: (data: any) => apiSetData('job-sites', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'job-site' : 'job-sites'],
        });
        hideHandler();
        showNotification('Successfully created', 'success');
        if (addLibrary) window.close();
      }
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      handleErrors(error, status);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiUpdateData(`job-sites/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'job-site' : 'job-sites'],
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
    queryKey: ['job-site', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`job-sites/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
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
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        website: data.website,
        countries: data.countries.map((country: any) => country.country_id),
        languages: data.languages.map((language: any) => language.language_id),
        note: data.note,
        job_site_pricings: data.jobSitePricings.map((pricing: IPricing) => ({
          id: pricing.id,
          job_site_id: pricing?.job_site?.id,
          pricing_type_id: pricing?.pricing_type?.id,
          currency_id: pricing?.currency?.id,
          package_name: pricing.package_name,
          price: pricing.price,
          job_post_amount: pricing.job_post_amount,
        })),
        reason: '',
      });
      setCreationInfo({
        created_at: data.created_at,
        created_by: data.created_by,
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
      resetHandler={clearData}
      hideHandler={hideHandler}
      submitForm={submitForm}
      fullScreen={fullScreen}
      fullScreenHandler={fullScreenHandler}
      changeActiveBookmark={changeActiveBookmark}
      toggleBookmarkError={toggleBookmarkError}
      register={register}
      isLoading={isFetching}
      errors={errors}
      isDuplicate={isDuplicate}
    >
      <Stack
        flexDirection='row'
        gap='1rem'
        sx={{
          display: activeBookmark === 'profile' ? 'flex' : 'none',
          minWidth: '100%',
          flexGrow: 1,
        }}
      >
        <TextField
          variant='standard'
          InputLabelProps={{ shrink: true }}
          {...register('name')}
          error={!!errors.name}
          label={<CustomLabel label={'Name'} required />}
          helperText={errors.name ? errors.name?.message : ''}
          className={mdDown ? 'mobile' : ''}
          sx={{
            flexGrow: 1,
            maxWidth: '50%',
            '&.mobile': {
              width: 'auto',
              flex: '1',
            },
          }}
        />
        <TextField
          variant='standard'
          InputLabelProps={{ shrink: true }}
          {...register('website')}
          error={!!errors.website}
          label={<CustomLabel label={'Website'} required />}
          helperText={errors.website ? errors.website?.message : ''}
          className={mdDown ? 'mobile' : ''}
          sx={{
            flexGrow: 1,
            maxWidth: '50%',
            '&.mobile': {
              width: 'auto',
              flex: '1',
            },
          }}
        />
      </Stack>

      <Controller
        control={control}
        name='countries'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            options={countries}
            value={value}
            error={error!}
            link='/countries'
            required
            handleChange={onChange}
            style={{
              display: activeBookmark === 'profile' ? 'flex' : 'none',
              flexGrow: 1,
              minWidth: 'calc(50% - 1.5rem)',
            }}
          />
        )}
      />

      <Controller
        control={control}
        name='languages'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            options={languages}
            value={value}
            error={error!}
            link='/languages'
            required
            handleChange={onChange}
            style={{
              display: activeBookmark === 'profile' ? 'flex' : 'none',
              flexGrow: 1,
              minWidth: 'calc(50% - 1.5rem)',
            }}
          />
        )}
      />
      <Controller
        control={control}
        name='note'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomTextEditor
            ref={editorRef}
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
      <Stack
        sx={{
          display: activeBookmark === 'pricing' ? 'flex' : 'none',
          width: '100%',
        }}
        gap='1rem'
      >
        <Stack flexDirection='row' justifyContent='center' alignItems='center' gap='3px'>
          <Typography
            sx={{
              fontSize: '1.2rem',
            }}
          >
            Pricings
          </Typography>
          <IconButton
            size='small'
            color='primary'
            onClick={() => {
              const oldValues = getValues('job_site_pricings');
              setValue('job_site_pricings', [...oldValues, defaultPricing]);
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
        <Controller
          name='job_site_pricings'
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <Stack
                gap='1rem'
                sx={{
                  flexDirection: fullScreen ? 'row' : 'column',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {value?.map((el, index) => (
                  <Stack
                    key={index}
                    gap='1rem'
                    sx={{
                      position: 'relative',
                      border: '1px solid #555252',
                      padding: '1rem',
                      borderRadius: '6px',
                      minWidth: '23rem',
                    }}
                  >
                    <IconButton
                      color='error'
                      onClick={() =>
                        setValue(
                          'job_site_pricings',
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
                    <PricingInputs
                      register={register}
                      onChange={onChange}
                      pricingsArr={value}
                      index={index}
                      elem={el}
                      currencies={currencies}
                      pricings={pricings}
                      errors={errors}
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
