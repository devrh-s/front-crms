import { useState, useEffect } from 'react';
import { IToolTypeFilters, IToolType } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, checkFilterValue } from '@/lib/helpers';

interface IFiltersProps {
  open: boolean;
  rows: IToolType[];
  commonData?: ICommonData;
  handleSetFilters: (newFilters: IToolTypeFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function PlacementTypesFilter({
  open,
  handleSetFilters,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [toolsFilter, setToolsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const generateFiltersData = () => {
    const filters: IToolTypeFilters = {};
    if (checkFilterValue(toolsFilter)) {
      filters.tools = {
        data: toolsFilter.value,
        mode: toolsFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setToolsFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolsFilter]);

  return (
    <FiltersDrawer
      title='Placement Types'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={toolsFilter}
        label='Tools'
        options={[]}
        handleChangeFilter={createFilterHandler(setToolsFilter)}
      />
    </FiltersDrawer>
  );
}
