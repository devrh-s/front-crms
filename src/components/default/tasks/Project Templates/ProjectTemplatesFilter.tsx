import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { IProjectTemplatesFilters } from './types';

interface IFiltersProps {
  open: boolean;
  rows: IProjectTemplate[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IProjectTemplatesFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function ProjectTemplatesFilter({
  open,
  commonData,
  handleSetFilters,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [taskTemplatesFilter, setTaskTemplatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [milestoneTemplatesFilter, setMilestoneTemplatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const task_templates = commonData.task_templates ?? [];
  const milestone_templates = commonData.milestone_templates ?? [];

  const generateFiltersData = () => {
    const filters: IProjectTemplatesFilters = {};
    if (checkFilterValue(taskTemplatesFilter)) {
      filters.task_templates = {
        data: taskTemplatesFilter.value,
        mode: taskTemplatesFilter.mode,
      };
    }
    if (checkFilterValue(milestoneTemplatesFilter)) {
      filters.milestone_templates = {
        data: milestoneTemplatesFilter.value,
        mode: milestoneTemplatesFilter.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setTaskTemplatesFilter({ value: [], mode: 'standard' });
    setMilestoneTemplatesFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskTemplatesFilter, milestoneTemplatesFilter]);

  return (
    <FiltersDrawer
      title='Project Templates'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={taskTemplatesFilter}
        label='Task Templates'
        options={task_templates}
        handleChangeFilter={createFilterHandler(setTaskTemplatesFilter)}
      />
      <MultipleSelectFilter
        filter={milestoneTemplatesFilter}
        label='Milestone Templates'
        options={milestone_templates}
        handleChangeFilter={createFilterHandler(setMilestoneTemplatesFilter)}
      />
    </FiltersDrawer>
  );
}
