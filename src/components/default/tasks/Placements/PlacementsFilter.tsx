import { useState, useEffect } from 'react';
import { IPlacementTypeFilters, IPlacementType } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, checkFilterValue } from '@/lib/helpers';

interface IFiltersProps {
  open: boolean;
  rows: IPlacementType[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IPlacementTypeFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function PlacementsFilter({
  open,
  commonData,
  handleSetFilters,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [toolsFilter, setToolsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const [placementTypesFilter, setPlacementTypesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const [accountsFilter, setAccountsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const tools = commonData.tools ?? [];
  const placementTypes = commonData.placement_types ?? [];
  const accounts = commonData.accounts ?? [];

  const generateFiltersData = () => {
    const filters: IPlacementTypeFilters = {};
    if (checkFilterValue(toolsFilter)) {
      filters.tools = {
        data: toolsFilter.value,
        mode: toolsFilter.mode,
      };
    }
    if (checkFilterValue(placementTypesFilter)) {
      filters.placement_types = {
        data: placementTypesFilter.value,
        mode: placementTypesFilter.mode,
      };
    }
    if (checkFilterValue(accountsFilter)) {
      filters.accounts = {
        data: accountsFilter.value,
        mode: accountsFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setToolsFilter({ value: [], mode: 'standard' });
    setPlacementTypesFilter({ value: [], mode: 'standard' });
    setAccountsFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolsFilter, placementTypesFilter, accountsFilter]);

  return (
    <FiltersDrawer
      title='Placements'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={toolsFilter}
        label='Tools'
        options={tools}
        handleChangeFilter={createFilterHandler(setToolsFilter)}
      />
      <MultipleSelectFilter
        filter={placementTypesFilter}
        label='Placement types'
        options={placementTypes}
        handleChangeFilter={createFilterHandler(setPlacementTypesFilter)}
      />
      <MultipleSelectFilter
        filter={accountsFilter}
        label='Accounts'
        options={accounts}
        handleChangeFilter={createFilterHandler(setAccountsFilter)}
      />
    </FiltersDrawer>
  );
}
