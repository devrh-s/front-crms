'use client';
import AddImage from '@/components/default/common/components/Addimage';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import CustomSelect from '@/components/default/common/form/CustomSelect/CustomSelect';
import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { TextField, Theme, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';

type ToolsFields = 'name' | 'link' | 'tool_types' | 'entity_block' | 'links' | 'description';

interface IFormInputs {
  name: string;
  link: string;
  links: [];
  tool_types: number[];
  entity_block: number[];
  description: string;
  image_icon: any;
  reason: string;
  task_templates: number[];
}

interface IToolsActionsProps {
  id: number | null;
  visible: boolean;
  commonData: ICommonData;
  isProfile?: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}

export default function ToolsActions({
  id,
  commonData,
  isProfile = false,
  isDuplicate = false,
  visible,
  handleActions,
}: IToolsActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const editorRef = useRef<IEditor | null>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const { activeBookmark, changeActiveBookmark, toggleBookmarkError, bookmarks } = useBookmarks(
    ['profile'],
    visible
  );
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const tool_types = commonData.tool_types ?? [];
  const links = commonData.links ?? [];
  const entity_block = commonData.entity_block ?? [];
  const task_templates = commonData.task_templates ?? [];

  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);

  const {
    register,
    reset,
    control,
    getValues,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      name: '',
      link: '',
      links: [],
      tool_types: [],
      entity_block: [],
      description: '',
      image_icon: '',
      reason: '',
      task_templates: [],
    },
  });

  const clearData = () =>
    reset({
      name: '',
      link: '',
      links: [],
      tool_types: [],
      entity_block: [],
      description: '',
      image_icon: '',
      reason: '',
      task_templates: [],
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
      const errorKey = key as ToolsFields;
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
    mutationFn: (data: any) => apiSetData('tools', data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'tool' : 'tools'],
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
    mutationFn: async (data: any) => apiUpdateData(`tools/${id}`, data, true),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'tool' : 'tools'],
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
    queryKey: ['tool', id ?? null],
    queryFn: async () => {
      const response = await apiGetData(`tools/${id}`);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
    };
    if (typeof commonData.image_icon === 'string') {
      delete commonData.image_icon;
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

  useEffect(() => {
    if (data) {
      reset({
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        link: data?.link,
        tool_types: data?.tool_types.map((tool: any) => tool.id),
        links: data?.links?.map((el: any) => el.id),
        entity_block: data?.entity_blocks.map((el: any) => el.id),
        image_icon: data?.image_icon,
        description: data.description,
        task_templates: data?.task_templates?.map((el: any) => el.id),
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
      title='Tool'
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
        label={<CustomLabel label={'Name'} required />}
        helperText={errors.name ? errors.name?.message : ''}
        className={mdDown ? 'mobile' : ''}
        sx={{
          minWidth: 'calc(33.3% - 1rem)',
          maxWidth: 380,
          '&.mobile': {
            width: 'auto',
            flex: '1',
          },
        }}
      />
      <TextField
        variant='standard'
        InputLabelProps={{ shrink: true }}
        {...register('link')}
        error={!!errors.link}
        helperText={errors.link ? errors.link?.message : ''}
        label='Tool link'
        className={mdDown ? 'mobile' : ''}
        sx={{
          minWidth: 'calc(33.3% - 1rem)',
          maxWidth: 380,
          '&.mobile': {
            width: 'auto',
            flex: '1',
          },
        }}
      />
      <Controller
        control={control}
        name='tool_types'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/tool-types'
            options={tool_types}
            value={value}
            error={error!}
            handleChange={onChange}
            style={{ minWidth: 'calc(33.3% - 1rem)', maxWidth: 360 }}
          />
        )}
      />
      <Controller
        control={control}
        name='entity_block'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/entity-block-fields'
            options={entity_block}
            value={value}
            error={error!}
            handleChange={onChange}
            style={{ minWidth: 'calc(33.3% - 1rem)', maxWidth: 380 }}
          />
        )}
      />
      <Controller
        control={control}
        name='links'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/links'
            options={links}
            value={value}
            error={error!}
            handleChange={onChange}
            style={{ minWidth: 'calc(33.3% - 1rem)', maxWidth: 360 }}
          />
        )}
      />
      <Controller
        control={control}
        name='task_templates'
        render={({ field: { onChange, value, name }, fieldState: { error } }) => (
          <CustomSelect
            type={name}
            link='/task-templates'
            options={task_templates}
            value={value}
            error={error!}
            handleChange={onChange}
            style={{ minWidth: 'calc(33.3% - 1rem)', maxWidth: 360 }}
          />
        )}
      />
      <Controller
        control={control}
        name='description'
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
      <Controller
        control={control}
        name='image_icon'
        render={({ field: { onChange, value } }) => (
          <AddImage value={value} text={value ? 'Update image' : 'Add image'} onChange={onChange} />
        )}
      />
    </ActionsDrawer>
  );
}
