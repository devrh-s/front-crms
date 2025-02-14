import { useState, useEffect } from 'react';
import { Theme, useMediaQuery } from '@mui/material';
import { IInnerClientFilters } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, checkFilterValue } from '@/lib/helpers';

interface IFiltersProps {
  open: boolean;
  rows: IInnerClient[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IInnerClientFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function InnerClinetsFilter({
  open,
  handleSetFilters,
  commonData,
  toggleFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const [innerClientsFilter, setInnerClientsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const company_types = commonData.company_types ?? [];

  const generateFiltersData = () => {
    const filters: IInnerClientFilters = {};
    if (checkFilterValue(innerClientsFilter)) {
      filters.company_types = {
        data: innerClientsFilter.value,
        mode: innerClientsFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setInnerClientsFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [innerClientsFilter]);

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
        filter={innerClientsFilter}
        label='Company types'
        options={company_types}
        handleChangeFilter={createFilterHandler(setInnerClientsFilter)}
      />
    </FiltersDrawer>
  );
}
