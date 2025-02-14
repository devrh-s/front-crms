import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Button, SpeedDial, SpeedDialAction, Stack } from '@mui/material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { Dispatch, useCallback, useMemo, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import TaskTemplate from './TaskTemplate';

interface ITaskTemplateProps {
  tasks: ITaskTemplate[];
  fullScreen: boolean;
  commonData: ICommonData;
  errors: any;
  clearErrors: (error?: any) => void;
  handleSetModal: (data: IGuideType | null) => void;
  dispatch: Dispatch<any>;
}

export default function TaskTemplates({
  tasks,
  fullScreen,
  commonData,
  errors,
  clearErrors,
  handleSetModal,
  dispatch,
}: ITaskTemplateProps) {
  const [startSelectionProcess, setStartSelectionProcess] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string>('');
  const task_templates = commonData.task_templates ?? [];

  const filteredTaskTemplates = useMemo(() => {
    const taskTemplatesIds = new Set(tasks.map((task) => task.id));

    return task_templates.filter((template) => !taskTemplatesIds.has(+template.id));
  }, [task_templates, tasks.length]);

  const onDragEnd = useCallback(
    (result: any) => {
      const { destination, source } = result;
      if (!result.destination) {
        return;
      }
      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }
      if (errors?.length) {
        clearErrors('task_templates');
      }
      dispatch({
        type: 'moveTaskTemplate',
        payload: {
          sourceIndex: result.source.index,
          destIndex: result.destination.index,
        },
      });
    },
    [errors]
  );

  const renderTaskTemplate = useCallback(
    (taskTemplate: ITaskTemplate, index: number) => {
      return (
        <TaskTemplate
          key={taskTemplate?.id}
          commonData={commonData}
          fullScreen={fullScreen}
          taskInd={index}
          handleSetModal={handleSetModal}
          dispatch={dispatch}
          errors={errors[index]}
          clearErrors={clearErrors}
          taskTemplate={taskTemplate}
        />
      );
    },
    [errors]
  );

  return (
    <Stack gap='.8rem'>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='droppable'>
          {(provided, snapshot) => (
            <Stack {...provided.droppableProps} ref={provided.innerRef}>
              {tasks.map((task, index) => renderTaskTemplate(task, index))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
      {startSelectionProcess && (
        <Stack flexDirection='row' gap='1rem'>
          <CustomSingleSelect
            label='Existing task template'
            link='/task-templates'
            field={{
              value: selectedId,
              onChange: (targetValue: number) => {
                setSelectedId(targetValue);
              },
            }}
            options={filteredTaskTemplates}
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
                const newTaskTemplate = task_templates.find((el) => el?.id === selectedId);
                dispatch({
                  type: 'addNewTaskTemplate',
                  payload: newTaskTemplate,
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
          ariaLabel='SpeedDial create Task Template'
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
  );
}
