import { useState, useEffect } from 'react';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, checkFilterValue } from '@/lib/helpers';
import SingleSelectFilter from '@/components/default/common/filters/SingleSelectFilter';

interface IApiFilter {
  data: number[] | string | number;
  mode?: FilterMode;
}
export interface IProfessuinsFilters {
  priority?: number;
}

interface IFiltersProps {
  open: boolean;
  rows: IContact[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IProfessuinsFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function ProfessionsFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [priorityFilter, setPriorityFilter] = useState<IFilter>({
    value: '',
    mode: 'standard',
  });

  const clearFilters = () => {
    setPriorityFilter({ value: '' });
    handleSetFilters({});
  };

  useEffect(() => {
    const generateFiltersData = () => {
      const filters: IProfessuinsFilters = {};

      if (priorityFilter.value !== '') {
        filters.priority = +priorityFilter.value;
      }

      handleSetFilters(filters);
    };

    generateFiltersData();
  }, [priorityFilter]);

  return (
    <FiltersDrawer
      title='Professions'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <SingleSelectFilter
        filter={priorityFilter}
        label='Priority'
        options={commonData.priorities ?? []}
        handleChangeFilter={createFilterHandler(setPriorityFilter)}
      />
    </FiltersDrawer>
  );
}
