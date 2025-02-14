import { useState, useEffect } from 'react';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { IFormatsFilters } from './types';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, checkFilterValue } from '@/lib/helpers';

interface IFiltersProps {
  open: boolean;
  rows: IFormats[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IFormatsFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function FormatsFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [objectsFilter, setObjectsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const objects = commonData.objects ?? [];

  const generateFiltersData = () => {
    const filters: IFormatsFilters = {};
    if (checkFilterValue(objectsFilter)) {
      filters.objects = {
        data: objectsFilter.value,
        mode: objectsFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setObjectsFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objectsFilter]);

  return (
    <FiltersDrawer
      title='Formats'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={objectsFilter}
        label='Objects'
        options={objects}
        handleChangeFilter={createFilterHandler(setObjectsFilter)}
      />
    </FiltersDrawer>
  );
}
