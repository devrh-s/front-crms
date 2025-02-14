import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { IVerificationAccountFilters } from './types';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { createFilterHandler, checkFilterValue } from '@/lib/helpers';

interface IFiltersProps {
  open: boolean;
  commonData: ICommonData;
  handleSetFilters: (newFilters: IVerificationAccountFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function VerificationAccountsFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [statusesFilter, setStatusesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [toolsFilter, setToolsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [ownersFilter, setOwnersFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const statuses = commonData.statuses ?? [];
  const users = commonData.users ?? [];
  const tools = commonData.tools ?? [];

  const generateFiltersData = () => {
    const filters: IVerificationAccountFilters = {};

    if (checkFilterValue(statusesFilter)) {
      filters.statuses = {
        data: statusesFilter.value,
        mode: statusesFilter.mode,
      };
    }
    if (checkFilterValue(toolsFilter)) {
      filters.tools = {
        data: toolsFilter.value,
        mode: toolsFilter.mode,
      };
    }
    if (checkFilterValue(ownersFilter)) {
      filters.owners = {
        data: ownersFilter.value,
        mode: ownersFilter.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setOwnersFilter({ value: [], mode: 'standard' });
    setStatusesFilter({ value: [], mode: 'standard' });
    setToolsFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownersFilter, statusesFilter, toolsFilter]);

  return (
    <FiltersDrawer
      title='Account user'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={statusesFilter}
        label='Statuses'
        options={statuses}
        handleChangeFilter={createFilterHandler(setStatusesFilter)}
      />
      <MultipleSelectFilter
        filter={toolsFilter}
        label='Tools'
        options={tools}
        handleChangeFilter={createFilterHandler(setToolsFilter)}
      />
      <MultipleSelectFilter
        filter={ownersFilter}
        label='Owners'
        options={users}
        handleChangeFilter={createFilterHandler(setOwnersFilter)}
      />
    </FiltersDrawer>
  );
}
