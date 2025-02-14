import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { IContactsFilters } from './types';

interface IFiltersProps {
  open: boolean;
  rows: IContact[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IContactsFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function ContactsFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [toolsFilter, setToolsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [locatedAtFilter, setLocatedAtFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const tools = commonData.tools ?? [];
  const located_at = commonData.located_at ?? [];

  const generateFiltersData = () => {
    const filters: IContactsFilters = {};

    if (checkFilterValue(toolsFilter)) {
      filters.tools = {
        data: toolsFilter.value,
        mode: toolsFilter.mode,
      };
    }
    if (checkFilterValue(locatedAtFilter)) {
      filters.located_at = {
        data: locatedAtFilter.value,
        mode: locatedAtFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setToolsFilter({ value: [], mode: 'standard' });
    setLocatedAtFilter({ value: [], mode: 'standard' });
    handleSetFilters({});
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolsFilter, locatedAtFilter]);

  return (
    <FiltersDrawer
      title='Contacts'
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
        filter={locatedAtFilter}
        label='Located At'
        options={located_at}
        handleChangeFilter={createFilterHandler(setLocatedAtFilter)}
      />
    </FiltersDrawer>
  );
}
