import { useState, useEffect } from 'react';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { IEntityBlockFilters } from './types';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, checkFilterValue } from '@/lib/helpers';

interface IFiltersProps {
  open: boolean;
  rows: ITool[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IEntityBlockFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function StatusesFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [blocksFilter, setBlocksFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [entitiesFilter, setEntitiesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const entities = commonData.entities ?? [];
  const blocks = commonData.blocks ?? [];

  const generateFiltersData = () => {
    const filters: IEntityBlockFilters = {};

    if (checkFilterValue(blocksFilter)) {
      filters.blocks = {
        data: blocksFilter.value,
        mode: blocksFilter.mode,
      };
    }
    if (checkFilterValue(entitiesFilter)) {
      filters.entities = {
        data: entitiesFilter.value,
        mode: entitiesFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setBlocksFilter({ value: [], mode: 'standard' });
    setEntitiesFilter({ value: [], mode: 'standard' });
    handleSetFilters({});
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entitiesFilter, blocksFilter]);

  return (
    <FiltersDrawer
      title='Statuses'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={entitiesFilter}
        label='Entities'
        options={entities}
        handleChangeFilter={createFilterHandler(setEntitiesFilter)}
      />
      <MultipleSelectFilter
        filter={blocksFilter}
        label='Blocks'
        options={blocks}
        handleChangeFilter={createFilterHandler(setBlocksFilter)}
      />
    </FiltersDrawer>
  );
}
