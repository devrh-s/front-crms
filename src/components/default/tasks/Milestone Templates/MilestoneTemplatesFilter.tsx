import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { IMilestoneTemplatesFilters } from './types';

interface IFiltersProps {
  open: boolean;
  rows: IMilestoneTemplate[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IMilestoneTemplatesFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function MilestoneTemplatesFilter({
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

  const task_templates = commonData.task_templates ?? [];

  const generateFiltersData = () => {
    const filters: IMilestoneTemplatesFilters = {};
    if (checkFilterValue(taskTemplatesFilter)) {
      filters.task_templates = {
        data: taskTemplatesFilter.value,
        mode: taskTemplatesFilter.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setTaskTemplatesFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskTemplatesFilter]);

  return (
    <FiltersDrawer
      title='Milestone Templates'
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
    </FiltersDrawer>
  );
}
