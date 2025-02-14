import CustomLabel from '@/components/default/common/form/CustomLabel/CustomLabel';
import CustomSelect from '@/components/default/common/form/CustomSelect/CustomSelect';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import { IEditor } from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import GuidesInputs from '@/components/default/common/form/GuidesInputs/GuidesInputs';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { useGuidesStore } from '@/zustand/guidesStore';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  IconButton,
  SpeedDial,
  SpeedDialAction,
  Stack,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { getCommonData } from './commonData';

type GuidesFields = 'name' | 'tools' | 'objects' | 'status_id' | 'type_id';
interface IFormInputs {
  name: string;
  tools: number[] | [];
  objects: number[] | [];
  guide_formats: IGuideFormat[] | [];
  status_id: number | null;
  type_id: number | null;
  entity_block_id?: number | null;
  progressable_id?: number | null;
  progressable_type?: string;
}
interface IGuideFormat {
  id: number | string;
  link: string | null;
  object_id: number | string;
  format_id: number | string;
  description: string | null;
}
const defaultFormats: IGuideFormat = {
  id: '',
  link: '',
  object_id: '',
  format_id: '',
  description: '',
};
interface IAddGuidProps {
  fullScreen: boolean;
}

export default function AddGuide({ fullScreen }: IAddGuidProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const showNotification = useNotification();
  const queryClient = useQueryClient();

  const [startSelectionProcess, setStartSelectionProcess] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string>('');

  const entityBlockId = useGuidesStore((store) => store.entityBlockId);
  const progressableId = useGuidesStore((store) => store.progressableId);
  const progressableType = useGuidesStore((store) => store.progressableType);

  const { data: commonData } = useQuery({
    queryKey: ['guides-common'],
    queryFn: getCommonData,
    refetchOnWindowFocus: false,
    placeholderData: {
      guides: [],
      tools: [],
      objects: [],
      formats: [],
      statuses: [],
    },
  });

  const guides = commonData.guides ?? [];
  const tools = commonData.tools ?? [];
  const objects = commonData.objects ?? [];
  const statuses = commonData.statuses ?? [];
  const formats = commonData.formats ?? [];

  const {
    register,
    reset,
    control,
    watch,
    getValues,
    setValue,
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
    });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiSetData('guides', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['guides-per-page'],
        });
        showNotification('Successfully created', 'success');
        setStartSelectionProcess(false);
        setVisible(false);
        clearData();
      }
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      if (status === 422) {
        handleErrors(error, status);
      } else {
        showNotification(`${status}: 'Something went wrong'}`, 'error');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiUpdateData(`guides/${selectedId}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['guides-per-page'],
        });
        showNotification('Successfully updated', 'success');
        setStartSelectionProcess(false);
        setVisible(false);
        setSelectedId('');
      }
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      if (status === 422) {
        handleErrors(error, status);
      } else {
        showNotification(`${status}: 'Something went wrong'}`, 'error');
      }
    },
  });

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
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['guide', selectedId ?? null],
    queryFn: async () => {
      const response = await apiGetData(`guides/${selectedId}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
    };
    if (entityBlockId) {
      commonData.entity_block_id = entityBlockId;
    }
    if (progressableId) {
      commonData.progressable_id = progressableId;
    }
    if (progressableType) {
      commonData.progressable_type = progressableType;
    }

    if (selectedId) {
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
        name: data?.name,
        tools: data.tools.map((el: any) => el.id),
        objects: data.objects.map((el: any) => el.object_id),
        status_id: data.status?.id ?? null,
        type_id: data.type?.object_id ?? null,
        guide_formats: data.guide_formats.map((el: any) => ({
          id: el.id,
          link: el?.link,
          object_id: el?.object.object_id,
          format_id: el?.format.id,
          description: el?.description,
        })),
      });
    }
  }, [data, visible]);

  useEffect(() => {
    if (selectedId && visible) {
      refetch();
    }
  }, [selectedId, visible]);

  return (
    <>
      {!startSelectionProcess && (
        <SpeedDial
          ariaLabel='SpeedDial create Guide'
          icon={<SpeedDialIcon />}
          direction='left'
          sx={{
            alignSelf: 'flex-end',
            '& .MuiFab-sizeLarge': {
              width: 'unset',
              height: 'unset',
              minHeight: 'unset',
            },
          }}
        >
          <SpeedDialAction
            icon={<AddBoxIcon />}
            tooltipTitle='Add existing'
            onClick={() => setStartSelectionProcess(true)}
          />
          <SpeedDialAction
            icon={<AddCircleIcon />}
            tooltipTitle='Add new'
            onClick={() => {
              setStartSelectionProcess(true);
              setVisible(true);
            }}
          />
        </SpeedDial>
      )}
      {startSelectionProcess && !visible && (
        <Stack flexDirection='row' gap='1rem'>
          <CustomSingleSelect
            label='Existing guides'
            field={{
              value: selectedId,
              onChange: (targetValue: number) => {
                setSelectedId(targetValue);
              },
            }}
            options={guides}
          />
          <Button
            size='small'
            variant='contained'
            sx={{
              alignSelf: 'flex-end',
            }}
            startIcon={<AddCircleIcon />}
            onClick={() => {
              if (typeof selectedId === 'number') {
                setVisible(true);
              } else {
                setStartSelectionProcess(false);
              }
            }}
          >
            Add
          </Button>
        </Stack>
      )}
      {startSelectionProcess && visible && (
        <Stack sx={{ position: 'relative' }}>
          <Stack
            flexDirection='row'
            sx={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              zIndex: 100,
            }}
          >
            {/* <Tooltip title='Reset'>
                <IconButton color='primary' onClick={clearData}>
                  <HistoryIcon />
                </IconButton>
              </Tooltip> */}
            <IconButton
              color='error'
              onClick={() => {
                setStartSelectionProcess(false);
                setVisible(false);
                setSelectedId('');
                clearData();
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
          <form
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              border: '1px solid #555252',
              padding: '1.5rem 1rem 1rem',
              borderRadius: '6px',
            }}
            autoComplete='off'
            onSubmit={submitForm}
          >
            {/* <CreateInfo id={id} creationInfo={creationInfo} /> */}
            <Stack
              flexWrap='wrap'
              gap='1.5rem'
              flexDirection={fullScreen ? 'row' : 'column'}
              sx={{
                width: '100%',
              }}
            >
              <>
                <TextField
                  variant='standard'
                  InputLabelProps={{ shrink: true }}
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name ? errors.name?.message : ''}
                  label={<CustomLabel label={'Name'} required />}
                  sx={{
                    minWidth: 'calc(50% - .75rem)',
                    justifyContent: 'flex-end',
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
                          minWidth: 'calc(50% - 1rem)',
                        }}
                      />
                    );
                  }}
                />
                <Stack
                  sx={{
                    width: '100%',
                  }}
                  gap='1rem'
                >
                  <Stack flexDirection='row' justifyContent='center' alignItems='center' gap='3px'>
                    <Box textAlign='center'>
                      <Typography
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
                                maxWidth: '22rem',
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
                                control={control}
                                register={register}
                                onChange={onChange}
                                guidesArr={value}
                                index={index}
                                watch={watch}
                                elem={el}
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
              </>
            </Stack>
            <Stack
              className={mdDown ? 'mobile' : ''}
              sx={{
                display: 'flex',
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
                className={mdDown ? 'mobile' : ''}
                disabled={isFetching}
                sx={{
                  alignSelf: fullScreen ? 'center' : 'unset',
                  minWidth: '340px',
                  '&.mobile': {
                    minWidth: '0',
                  },
                }}
                endIcon={<AddCircleOutlineIcon />}
              >
                {selectedId ? 'Update' : 'Create'}
              </Button>
            </Stack>
          </form>
        </Stack>
      )}
    </>
  );
}
