'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import useBookmarks from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import CustomTextEditor, {
  IEditor,
} from '@/components/default/common/form/CustomTextEditor/CustomTextEditor';
import {
  Button,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  TextField,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomLabel from '../../common/form/CustomLabel/CustomLabel';
import CustomSingleSelect from '../../common/form/CustomSingleSelect/CustomSingleSelect';
import { IChecklistItem } from '../Tasks/types';
import Checklist from './Checklist';
import checklistReducer from './checklistReducer';
import CustomTimePicker from './components/CustomTimePicker';

type StepTemplatesFields = 'name' | 'hours_planned' | 'checklist_items';
interface IFormInputs {
  name: string;
  hours_planned: string;
  checklist_items: number[] | [];
  reason: string;
  action_id: string;
  object_id: string;
  tool_id: string;
  description: string;
}

interface IStepTemplatesActionsProps {
  id: number | null;
  visible: boolean;
  commonData: ICommonData;
  isProfile?: boolean;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSetModal?: (data: any) => void;
}
const bookmarkErrorRelations = {
  profile: ['name', 'hours_planned'],
  checklists: ['checklist_items'],
};

export default function StepTemplatesActions({
  id,
  commonData,
  isProfile = false,
  isDuplicate = false,
  visible,
  handleActions,
}: IStepTemplatesActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const {
    activeBookmark,
    changeActiveBookmark,
    getBookmarkErrorName,
    toggleBookmarkError,
    bookmarks,
  } = useBookmarks(['profile', 'checklists'], visible);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string>('');
  const [checklistItems, dispatch] = useReducer(checklistReducer, []);
  const [startSelectionProcess, setStartSelectionProcess] = useState(false);

  const editorRef = useRef<IEditor | null>(null);

  const checklist_items = commonData.checklist_items ?? [];
  const objects = commonData.objects ?? [];
  const tools = commonData.tools ?? [];
  const actions = commonData.actions ?? [];

  const {
    register,
    reset,
    getValues,
    clearErrors,
    control,
    setError,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: {
      name: '',
      action_id: '',
      object_id: '',
      tool_id: '',
      hours_planned: '',
      checklist_items: [],
      reason: '',
      description: '',
    },
  });

  const clearData = () =>
    reset({
      name: '',
      hours_planned: '',
      checklist_items: [],
      reason: '',
      action_id: '',
      object_id: '',
      tool_id: '',
      description: '',
    });

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
      dispatch({ type: 'clearChecklists', payload: null });
      setSelectedId('');
    }
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as StepTemplatesFields;
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
    mutationFn: (data: any) => apiSetData('step-templates', data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'step-template' : 'step-templates'],
        });
        hideHandler();
        showNotification('Successfully created', 'success');
        setIsDraft(false);
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
    mutationFn: async (data: any) => apiUpdateData(`step-templates/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'step-template' : 'step-templates'],
        });
        hideHandler();
        showNotification('Successfully updated', 'success');
        setIsDraft(false);
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
    queryKey: ['step-template', id ?? null],
    queryFn: async () => {
      setIsLoading(true);
      const response = await apiGetData(`step-templates/${id}`);
      setIsLoading(false);
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const commonData = {
      ...data,
      checklist_items: checklistItems.map((el: any) => el.id),
      is_draft: isDraft,
      description: editorRef.current?.getContent(),
    };
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
  const onDragEnd = useCallback(
    (result: any) => {
      const { destination, source } = result;
      if (!result.destination) {
        return;
      }
      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }

      dispatch({
        type: 'moveChecklist',
        payload: {
          sourceIndex: result.source.index,
          destIndex: result.destination.index,
        },
      });
    },
    [errors]
  );
  const renderChecklist = useCallback(
    (checklist: IChecklistItem, ind: number) => {
      return (
        <Checklist
          key={checklist?.id}
          index={ind}
          commonData={commonData}
          fullScreen={fullScreen}
          checklist={checklist}
          errors={errors?.checklist_items}
          dispatch={dispatch}
        />
      );
    },
    [errors]
  );

  const filteredChecklistItems = useMemo(() => {
    const checklistItemsIds = new Set(checklistItems.map((item: IChecklistItem) => item.id));

    return checklist_items.filter((item) => !checklistItemsIds.has(+item.id));
  }, [checklist_items, checklistItems.length]);

  useEffect(() => {
    if (data) {
      dispatch({ type: 'setChecklists', payload: data.checklist_items });
      reset({
        name: `${isDuplicate ? `${data?.name} COPY` : data?.name}`,
        tool_id: data?.tool?.id,
        object_id: data?.object?.object_id,
        action_id: data?.action?.action_id,
        hours_planned: data.hours_planned,
        description: data.description,
        checklist_items: data.checklist_items.map((el: any) => el.id),
        reason: '',
      });
      setCreationInfo({
        created_at: data?.created_at,
        created_by: data?.created_by,
      });
      setIsDraft(!!data?.is_draft);
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
      title='Step Template'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      hideHandler={hideHandler}
      submitForm={submitForm}
      changeActiveBookmark={changeActiveBookmark}
      toggleBookmarkError={toggleBookmarkError}
      fullScreenHandler={fullScreenHandler}
      resetHandler={() => {
        clearData();
        dispatch({ type: 'clearChecklists', payload: null });
        setSelectedId('');
      }}
      isLoading={isFetching}
      fullScreen={fullScreen}
      register={register}
      errors={errors}
      toggleDraft={setIsDraft}
      isDraft={isDraft}
      isDuplicate={isDuplicate}
    >
      {activeBookmark === 'profile' && (
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
            '&.mobile': {
              width: 'auto',
              flex: '1',
            },
          }}
        />
      )}
      {activeBookmark === 'profile' && (
        <>
          <Controller
            name='action_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Action'
                  link='/action'
                  field={field}
                  required
                  options={actions}
                  error={error}
                />
              );
            }}
          />
          <Controller
            name='object_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Object'
                  link='/object'
                  field={field}
                  required
                  options={objects}
                  error={error}
                />
              );
            }}
          />
          <Controller
            name='tool_id'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Tool'
                  link='/tools'
                  field={field}
                  required
                  options={tools}
                  error={error}
                />
              );
            }}
          />

          <CustomTimePicker
            errors={errors}
            isLoading={isLoading}
            setValue={setValue}
            value={getValues('hours_planned')}
            isDraft={isDraft}
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
        </>
      )}
      {activeBookmark === 'checklists' && (
        <Stack gap='.8rem' sx={{ paddingLeft: fullScreen ? '2rem' : 0 }}>
          <Typography textAlign='center'>Checklists</Typography>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId='droppable'>
              {(provided, snapshot) => (
                <Stack {...provided.droppableProps} ref={provided.innerRef} gap={0.2}>
                  {checklistItems.map((checklist: any, index: number) =>
                    renderChecklist(checklist, index)
                  )}
                  {provided.placeholder}
                </Stack>
              )}
            </Droppable>
          </DragDropContext>

          {startSelectionProcess && (
            <Stack flexDirection='row' gap='1rem'>
              <CustomSingleSelect
                label='Existing checklists'
                link='/checklist-items'
                field={{
                  value: selectedId,
                  onChange: (targetValue: number) => {
                    setSelectedId(targetValue);
                  },
                }}
                options={filteredChecklistItems}
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
                    const newChecklistitem = checklist_items.find((el) => el?.id === selectedId);
                    dispatch({
                      type: 'addNewChecklist',
                      payload: { newChecklistitem },
                    });
                  }
                  setSelectedId('');
                  setStartSelectionProcess(false);
                }}
              >
                Add
              </Button>
            </Stack>
          )}
          {!startSelectionProcess && (
            <SpeedDial
              ariaLabel='SpeedDial create Step'
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
            </SpeedDial>
          )}
        </Stack>
      )}
    </ActionsDrawer>
  );
}
