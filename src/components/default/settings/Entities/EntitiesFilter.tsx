import { useState, useEffect } from 'react';
import { IEntitiesFilters } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, checkFilterValue } from '@/lib/helpers';

interface IFiltersProps {
  open: boolean;
  commonData: ICommonData;
  handleSetFilters: (newFilters: IEntitiesFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function EntitiesFilter({
  open,
  commonData,
  handleSetFilters,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [entityTypeFilter, setEntityTypeFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [blocksFilter, setBlocksFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const entity_types = commonData.entity_types ?? [];
  const blocks = commonData.blocks ?? [];

  const generateFiltersData = () => {
    const filters: IEntitiesFilters = {};
    if (checkFilterValue(entityTypeFilter)) {
      filters.entity_types = {
        data: entityTypeFilter.value,
        mode: entityTypeFilter.mode,
      };
    }
    if (checkFilterValue(blocksFilter)) {
      filters.blocks = {
        data: blocksFilter.value,
        mode: blocksFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setEntityTypeFilter({ value: [], mode: 'standard' });
    setBlocksFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityTypeFilter, blocksFilter]);

  return (
    <FiltersDrawer
      title='Entities'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={entityTypeFilter}
        label='Entity Types'
        options={entity_types}
        handleChangeFilter={createFilterHandler(setEntityTypeFilter)}
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
