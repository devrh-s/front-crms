import { useState, useEffect } from 'react';
import { ICompanyTypesFilters, ICompanyType } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, checkFilterValue } from '@/lib/helpers';

interface IFiltersProps {
  open: boolean;
  rows: ICompanyType[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: ICompanyTypesFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function COmpanyTypesFilter({
  open,
  handleSetFilters,
  commonData,
  toggleFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const [innerClientFilter, setInnerClientFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const inner_clients = commonData.inner_clients ?? [];

  const generateFiltersData = () => {
    const filters: ICompanyTypesFilters = {};
    if (checkFilterValue(innerClientFilter)) {
      filters.inner_clients = {
        data: innerClientFilter.value,
        mode: innerClientFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setInnerClientFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerClientFilter]);

  return (
    <FiltersDrawer
      title='Job Sites'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={innerClientFilter}
        label='Inner Clients'
        options={inner_clients}
        handleChangeFilter={createFilterHandler(setInnerClientFilter)}
      />
    </FiltersDrawer>
  );
}
