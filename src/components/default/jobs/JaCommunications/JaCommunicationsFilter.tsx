import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createDateFilterHandler, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import CustomCalendar from '../../common/components/CustomCalendar';
import { IJaCommunication, IJaCommunicationsFilters } from './types';

interface IFiltersProps {
  open: boolean;
  rows: IJaCommunication[];
  filters: IJaCommunicationsFilters;
  commonData: ICommonData;
  handleSetFilters: (newFilters: IJaCommunicationsFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

const dateInitial: IDateFilter = {
  value: {
    start: null,
    end: null,
  },
  mode: 'standard',
};

export default function JaCommunicationsFilter({
  open,
  filters,
  handleSetFilters,
  commonData,
  toggleFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [accountsFilter, setAccountsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const [communicationTypesFilter, setCommunicationTypesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const [accountToolsFilter, setAccountToolsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const [chanelToolsFilter, setChanelToolsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const accounts = commonData.accounts ?? [];
  const tools = commonData.tools ?? [];
  const communicationTypes = commonData.communication_types ?? [];
  const users = commonData.users ?? [];

  const generateFiltersData = () => {
    const filters: IJaCommunicationsFilters = {};
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }

    if (checkFilterValue(chanelToolsFilter)) {
      filters.channel_tools = {
        data: chanelToolsFilter.value,
        mode: chanelToolsFilter.mode,
      };
    }

    if (checkFilterValue(accountToolsFilter)) {
      filters.account_tools = {
        data: accountToolsFilter.value,
        mode: accountToolsFilter.mode,
      };
    }

    if (checkFilterValue(accountsFilter)) {
      filters.accounts = {
        data: accountsFilter.value,
        mode: accountsFilter.mode,
      };
    }

    if (checkFilterValue(communicationTypesFilter)) {
      filters.communication_types = {
        data: communicationTypesFilter.value,
        mode: communicationTypesFilter.mode,
      };
    }

    if (checkFilterValue(createdByFilter)) {
      filters.created_by = {
        data: createdByFilter.value,
        mode: createdByFilter.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setAccountsFilter({ value: [], mode: 'standard' });
    setCommunicationTypesFilter({ value: [], mode: 'standard' });
    setCreatedByFilter({ value: [], mode: 'standard' });
    setAccountToolsFilter({ value: [], mode: 'standard' });
    setChanelToolsFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createdAt,
    accountsFilter,
    communicationTypesFilter,
    createdByFilter,
    accountToolsFilter,
    chanelToolsFilter,
  ]);

  return (
    <FiltersDrawer
      title='Job Communications'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <CustomCalendar
        label='Created At'
        filter={createdAt as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setCreatedAt)}
      />
      <MultipleSelectFilter
        filter={accountsFilter}
        label='Accounts'
        options={accounts}
        handleChangeFilter={createFilterHandler(setAccountsFilter)}
      />
      <MultipleSelectFilter
        filter={communicationTypesFilter}
        label='Communication Types'
        options={communicationTypes}
        handleChangeFilter={createFilterHandler(setCommunicationTypesFilter)}
      />
      <MultipleSelectFilter
        filter={accountToolsFilter}
        label='Accounts Tools'
        options={tools}
        handleChangeFilter={createFilterHandler(setAccountToolsFilter)}
      />
      <MultipleSelectFilter
        filter={chanelToolsFilter}
        label='Chanel Tools'
        options={tools}
        handleChangeFilter={createFilterHandler(setChanelToolsFilter)}
      />
      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created by'
        options={users}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
    </FiltersDrawer>
  );
}
