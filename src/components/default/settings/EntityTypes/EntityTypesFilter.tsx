import { useState, useEffect } from 'react';
import { IEntityTypesFilters } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, checkFilterValue } from '@/lib/helpers';

interface IFiltersProps {
  open: boolean;
  rows: IEntityType[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IEntityTypesFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function EntityTypesFilter({
  open,
  handleSetFilters,
  commonData,
  toggleFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const [entityFilter, setEntityFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const entities = commonData.entities ?? [];

  const generateFiltersData = () => {
    const filters: IEntityTypesFilters = {};
    if (checkFilterValue(entityFilter)) {
      filters.entities = {
        data: entityFilter.value,
        mode: entityFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setEntityFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityFilter]);

  return (
    <FiltersDrawer
      title='Entity Types'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={entityFilter}
        label='Entities'
        options={entities}
        handleChangeFilter={createFilterHandler(setEntityFilter)}
      />
    </FiltersDrawer>
  );
}
