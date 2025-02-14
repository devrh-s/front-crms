import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Button, SpeedDial, SpeedDialAction, Skeleton, Stack } from '@mui/material';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { useContext, useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { Control } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { TasksContext } from '../../contexts/tasksContext';
import { apiGetData } from '@/lib/fetch';
import { getTransformedMilestone } from '../../helpers';
import Milestone from './Milestone';
import { IMilestoneSave } from '../../types/types';

interface IMilestonesProps {
  fullScreen: boolean;
  commonData: ICommonData;
  errors: any;
  visible: boolean;
  isEdit: boolean;
  control: Control<any>;
  clearErrors: (error?: any) => void;
}

interface IMilestonesData {
  ids: number[];
  status: 'set-milestones' | 'add-existing-milestone';
}

async function getMilestoneTemplates(milestoneTemplatesIds: Array<string | number>) {
  const results = (await Promise.allSettled(
    milestoneTemplatesIds.map((id) => apiGetData(`milestone-templates/${id}`))
  )) as IParallelResult[];
  return results;
}

const initialMilestonesData: IMilestonesData = { ids: [], status: 'set-milestones' };

export default function Milestones({
  fullScreen,
  commonData,
  visible,
  errors,
  control,
  isEdit,
  clearErrors,
}: IMilestonesProps) {
  const hasMounted = useRef(false);
  const [startSelectionProcess, setStartSelectionProcess] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string>('');
  const [milestonesData, setMilestonesData] = useState<IMilestonesData>(initialMilestonesData);
  const milestone_templates = commonData.milestone_templates ?? [];

  const {
    elems: milestones,
    selectedIds: selectedMilestonesIds,
    mutateElemsList: mutateMilestones,
    actionOptions: { getMoveMilestone, getSetMilestones, getUpdateMilestones },
  } = useContext(TasksContext);

  const filteredMilestoneTemplates = useMemo(() => {
    const milestoneTemplatesIds = new Set(
      milestones.map((item: IMilestoneSave) => item.milestone_template_id)
    );
    return milestone_templates.filter((item) => !milestoneTemplatesIds.has(+item.id));
  }, [milestone_templates, milestones?.length]);

  const { data, isFetching } = useQuery({
    queryKey: ['tasks-milestone-templates', milestonesData.ids],
    queryFn: async () => {
      const response = await getMilestoneTemplates(milestonesData.ids);
      return response.map((el) => el.value.data);
    },
    refetchOnWindowFocus: false,
    enabled: !!milestonesData.ids?.length,
  });

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
        clearErrors();
      }
      mutateMilestones(
        getMoveMilestone({
          sourceInd: source.index,
          destInd: destination.index,
          elems: milestones,
        })
      );
    },
    [errors]
  );

  const clearStepsData = () => setMilestonesData(initialMilestonesData);

  const renderMilestone = (milestone: any, index: number) => (
    <Milestone
      key={milestone?.id}
      commonData={commonData}
      fullScreen={fullScreen}
      milestoneInd={index}
      control={control}
      errors={errors[index]}
      clearErrors={clearErrors}
      milestone={milestone}
    />
  );

  useEffect(() => {
    if (data) {
      const newMilestones = data.map((milestone) => getTransformedMilestone(milestone));
      if (milestonesData.status === 'set-milestones') {
        mutateMilestones(getSetMilestones({ milestones: newMilestones }));
      } else {
        mutateMilestones(getUpdateMilestones({ milestones: newMilestones }));
      }
      clearStepsData();
    }
  }, [data]);

  useEffect(() => {
    if (!isEdit && hasMounted.current) {
      setMilestonesData({ ids: selectedMilestonesIds, status: 'set-milestones' });
    } else {
      hasMounted.current = true;
    }
  }, [isEdit, selectedMilestonesIds]);

  return (
    <Stack gap='.8rem' sx={{ width: '100%', display: visible ? 'flex' : 'none' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId='droppable'>
          {(provided) => (
            <Stack {...provided.droppableProps} ref={provided.innerRef}>
              {milestones.map((milestone: any, index: number) => renderMilestone(milestone, index))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>
      {isFetching && <Skeleton variant='rounded' width={'100%'} height={58} />}
      {startSelectionProcess && (
        <Stack flexDirection='row' gap='1rem'>
          <CustomSingleSelect
            label='Existing task template'
            link='/task-templates'
            field={{
              value: selectedId,
              onChange: (targetValue: number) => setSelectedId(targetValue),
            }}
            options={filteredMilestoneTemplates}
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
                setMilestonesData(() => ({ ids: [selectedId], status: 'add-existing-milestone' }));
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
          ariaLabel='SpeedDial create Task'
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
