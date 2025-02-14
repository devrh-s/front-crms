import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { ILanguageLevelFilters } from './types';

interface IFiltersProps {
  open: boolean;
  rows: IContact[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: ILanguageLevelFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function LanguageLevelsFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [levelFilter, setLevelFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const generateFiltersData = () => {
    const filters: ILanguageLevelFilters = {};

    if (checkFilterValue(levelFilter)) {
      filters.levels = {
        data: levelFilter.value,
        mode: levelFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setLevelFilter({ value: [], mode: 'standard' });
    handleSetFilters({});
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelFilter]);

  return (
    <FiltersDrawer
      title='Language Levels'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={levelFilter}
        label='Levels'
        options={commonData.levels ?? []}
        handleChangeFilter={createFilterHandler(setLevelFilter)}
      />
    </FiltersDrawer>
  );
}
