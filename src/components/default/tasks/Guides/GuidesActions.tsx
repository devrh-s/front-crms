'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import { IEditor } from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import GuidesInputs from '@/components/default/common/form/GuidesInputs/GuidesInputs';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Stack, TextField, Theme, Typography, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import CustomSelect from '../../common/form/CustomSelect/CustomSelect';
import { IGuideFormat } from './types';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';

type GuidesFields = 'name' | 'tools' | 'objects' | 'status_id' | 'type_id';
interface IFormInputs {
  name: string;
  tools: number[] | [];
  objects: number[] | [];
  reason: string;
  status_id: number | null;
  type_id: number | null;
  guide_formats: IGuideFormat[] | [];
}

interface IGuidesActionsProps {
  id: number | string | null;
  visible: boolean;
  commonData: ICommonData;
  isProfile?: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

const defaultFormats: IGuideFormat = {
  id: '',
  link: '',
  object_id: '',
  format_id: '',
  description: '',
};

const bookmarkErrorRelations = {
  profile: ['name', 'tools', 'objects', 'reason', 'status_id', 'type_id'],
  formats: ['guide_formats'],
};

export default function GuidesActions({
  id,
  commonData,
  visible,
  isProfile = false,
  isDuplicate = false,
  handleActions,
}: IGuidesActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const {
    activeBookmark,
    changeActiveBookmark,
    toggleBookmarkError,
    getBookmarkErrorName,
    toggleInteraction,
    bookmarks,
  } = useBookmarks(['profile', 'formats'], visible);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const tools = commonData.tools ?? [];
  const objects = commonData.objects ?? [];
  const formats = commonData.formats ?? [];
  const statuses = commonData.statuses ?? [];

  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const {
    register,
    reset,
    control,
    getValues,
    setValue,
    watch,
    clearErrors,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      name: '',
      tools: [],
      objects: [],
      status_id: null,
      type_id: null,
      guide_formats: [],
      reason: '',
    },
  });

  const clearData = () =>
    reset({
      name: '',
      tools: [],
      objects: [],
      status_id: null,
      type_id: null,
      guide_formats: [],
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
      const errorKey = key as GuidesFields;
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
    mutationFn: (data: any) => apiSetData('guides', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'guide' : 'guides'],
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
    mutationFn: async (data: any) => apiUpdateData(`guides/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'guide' : 'guides'],
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
    queryKey: ['guide', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`guides/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
    };
    commonData.guide_formats = commonData.guide_formats.map((el: IGuideFormat, index: number) => ({
      ...el,
    }));
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

  useEffect(() => {
    if (data) {
      reset({
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        tools: data.tools.map((el: any) => el.id),
        objects: data.objects.map((el: any) => el.object_id),
        status_id: data.status?.id ?? null,
        type_id: data.type?.object_id ?? null,
        reason: '',
        guide_formats: data?.guide_formats.map((el: any) => ({
          id: el.id,
          link: el?.link,
          object_id: el?.object.object_id,
          format_id: el?.format.id,
          description: el?.description,
        })),
      });
      setCreationInfo({
        created_at: data?.created_at,
        created_by: data?.created_by,
      });
    } else {
      setValue(
        'status_id',
        (statuses.find((status) => status.is_default === 1)?.id as number) ?? ''
      );
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
      title='Guide'
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
      isLoading={isFetching}
      register={register}
      errors={errors}
      isDuplicate={isDuplicate}
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
          display: activeBookmark === 'profile' ? 'flex' : 'none',
          minWidth: 'calc(33.3% - 1rem)',
          '&.mobile': {
            width: 'auto',
            flex: '1',
          },
        }}
      />
      <Controller
        control={control}
        name='tools'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/tools'
            options={tools}
            required
            value={value}
            error={error!}
            handleChange={onChange}
            style={{
              display: activeBookmark === 'profile' ? 'flex' : 'none',
              minWidth: 'calc(50% - .75rem)',
            }}
          />
        )}
      />
      <Controller
        control={control}
        name='objects'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/objects'
            required
            options={objects}
            value={value}
            error={error!}
            handleChange={onChange}
            style={{
              display: activeBookmark === 'profile' ? 'flex' : 'none',
              minWidth: 'calc(50% - .75rem)',
            }}
          />
        )}
      />
      <Controller
        name='status_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Status'
              field={field}
              required
              options={statuses}
              error={error}
              style={{
                display: activeBookmark === 'profile' ? 'flex' : 'none',
                minWidth: 'calc(50% - 1rem)',
              }}
            />
          );
        }}
      />
      <Controller
        name='type_id'
        control={control}
        render={({ field, fieldState: { error } }) => {
          return (
            <CustomSingleSelect
              label='Type'
              field={field}
              required
              options={objects}
              error={error}
              style={{
                display: activeBookmark === 'profile' ? 'flex' : 'none',
                minWidth: 'calc(50% - 1rem)',
              }}
            />
          );
        }}
      />
      <Stack
        sx={{
          display: activeBookmark === 'formats' ? 'flex' : 'none',
          width: '100%',
        }}
        gap='1rem'
      >
        <Stack flexDirection='row' justifyContent='center' alignItems='center' gap='3px'>
          <Box textAlign='center'>
            <Typography
              textAlign='center'
              color={errors.guide_formats ? 'error' : 'inherit'}
              sx={{
                fontSize: '1.2rem',
              }}
            >
              Formats
              <Typography
                component='span'
                color='error'
                sx={{ marginLeft: '4px', fontSize: '1.2rem' }}
              >
                *
              </Typography>
            </Typography>
            {errors.guide_formats && (
              <Typography
                color='error'
                sx={{
                  fontSize: '0.875rem',
                  marginTop: '4px',
                }}
              >
                {errors?.guide_formats.message}
              </Typography>
            )}
          </Box>
          <IconButton
            size='small'
            color='primary'
            onClick={() => {
              const oldValues = getValues('guide_formats');
              setValue('guide_formats', [...oldValues, defaultFormats]);
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
          name='guide_formats'
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
                {value.map((el, index) => (
                  <Stack
                    key={index}
                    gap='1rem'
                    sx={{
                      position: 'relative',
                      border: '1px solid #555252',
                      padding: '1rem',
                      borderRadius: '6px',
                      width: '22rem',
                    }}
                  >
                    <IconButton
                      color='error'
                      onClick={() =>
                        setValue(
                          'guide_formats',
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
                    <GuidesInputs
                      register={register}
                      onChange={onChange}
                      guidesArr={value}
                      control={control}
                      index={index}
                      elem={el}
                      watch={watch}
                      getValues={getValues}
                      objects={objects}
                      formats={formats}
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
