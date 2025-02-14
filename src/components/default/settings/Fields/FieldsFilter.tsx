import { useState, useEffect } from 'react';
import { IFieldsFilters } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, checkFilterValue } from '@/lib/helpers';

interface IFiltersProps {
  open: boolean;
  rows: IFieldType[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IFieldsFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function FieldsFilter({
  open,
  handleSetFilters,
  commonData,
  toggleFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const [fieldsFilter, setFieldsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const translations = commonData.languages ?? [];

  const generateFiltersData = () => {
    const filters: IFieldsFilters = {};
    if (checkFilterValue(fieldsFilter)) {
      filters.translations = {
        data: fieldsFilter.value,
        mode: fieldsFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setFieldsFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldsFilter]);

  return (
    <FiltersDrawer
      title='Fields'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={fieldsFilter}
        label='Translations'
        options={translations}
        handleChangeFilter={createFilterHandler(setFieldsFilter)}
      />
    </FiltersDrawer>
  );
}
