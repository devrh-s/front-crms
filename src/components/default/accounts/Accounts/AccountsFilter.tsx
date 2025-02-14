import { useState, useEffect } from 'react';
import { Theme, useMediaQuery } from '@mui/material';
import { IAccountsFilters } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import DateRangeFilter from '../../common/filters/DateRangeFilter';
import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  commonData: ICommonData;
  handleSetFilters: (newFilters: IAccountsFilters) => void;
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

export default function AccountsFilters({
  open,
  commonData,
  handleSetFilters,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [passCreatedAt, setPassCreatedAt] = useState<IDateFilter>(dateInitial);
  const [passNextChangeDate, setPassNextChangeDate] = useState<IDateFilter>(dateInitial);

  const [innerClientsFilter, setInnerClientsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [usersFilter, setUsersFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [ownersFilter, setOwnersFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [toolsFilter, setToolsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [statusesFilter, setStatusesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const inner_clients = commonData.inner_clients ?? [];
  const users = commonData.users ?? [];

  const tools = commonData.tools ?? [];
  const statuses = commonData.statuses ?? [];

  const generateFiltersData = () => {
    const filters: IAccountsFilters = {};
    if (checkFilterValue(passCreatedAt)) {
      filters.passCreatedAt = {
        data: {
          start: passCreatedAt?.value?.start?.format('DD-MM-YYYY'),
          end: passCreatedAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: passCreatedAt.mode,
      };
    }
    if (checkFilterValue(passNextChangeDate)) {
      filters.passNextChangeDate = {
        data: {
          start: passNextChangeDate?.value?.start?.format('DD-MM-YYYY'),
          end: passNextChangeDate?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: passNextChangeDate.mode,
      };
    }
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    if (checkFilterValue(createdByFilter)) {
      filters.created_by = {
        data: createdByFilter.value,
        mode: createdByFilter.mode,
      };
    }

    if (checkFilterValue(innerClientsFilter)) {
      filters.inner_clients = {
        data: innerClientsFilter.value,
        mode: innerClientsFilter.mode,
      };
    }
    if (checkFilterValue(usersFilter)) {
      filters.users = {
        data: usersFilter.value,
        mode: usersFilter.mode,
      };
    }
    if (checkFilterValue(ownersFilter)) {
      filters.owners = {
        data: ownersFilter.value,
        mode: ownersFilter.mode,
      };
    }
    if (checkFilterValue(toolsFilter)) {
      filters.tools = {
        data: toolsFilter.value,
        mode: toolsFilter.mode,
      };
    }
    if (checkFilterValue(statusesFilter)) {
      filters.statuses = {
        data: statusesFilter.value,
        mode: statusesFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createdAt,
    passCreatedAt,
    passNextChangeDate,
    createdByFilter,
    usersFilter,
    ownersFilter,
    innerClientsFilter,
    toolsFilter,
    statusesFilter,
  ]);

  const clearFilters = () => {
    setInnerClientsFilter({ value: [], mode: 'standard' });
    setUsersFilter({ value: [], mode: 'standard' });
    setToolsFilter({ value: [], mode: 'standard' });
    setStatusesFilter({ value: [], mode: 'standard' });
    setCreatedAt(dateInitial);
    setPassCreatedAt(dateInitial);
    setPassNextChangeDate(dateInitial);
    setCreatedByFilter({ value: [], mode: 'standard' });
  };

  return (
    <FiltersDrawer
      title='Accounts'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={innerClientsFilter}
        label='Inner Clients'
        options={inner_clients}
        handleChangeFilter={createFilterHandler(setInnerClientsFilter)}
      />
      <MultipleSelectFilter
        filter={ownersFilter}
        label='Owners'
        options={users}
        handleChangeFilter={createFilterHandler(setOwnersFilter)}
      />
      <MultipleSelectFilter
        filter={usersFilter}
        label='Users'
        options={users}
        handleChangeFilter={createFilterHandler(setUsersFilter)}
      />
      <MultipleSelectFilter
        filter={toolsFilter}
        label='Tools'
        options={tools}
        handleChangeFilter={createFilterHandler(setToolsFilter)}
      />
      <MultipleSelectFilter
        filter={statusesFilter}
        label='Statuses'
        options={statuses}
        handleChangeFilter={createFilterHandler(setStatusesFilter)}
      />
      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created By'
        options={users}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
      <CustomCalendar
        label='Password Created At'
        filter={passCreatedAt as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setPassCreatedAt)}
      />
      <CustomCalendar
        label='Password Next Change Date'
        filter={passNextChangeDate as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setPassNextChangeDate)}
      />
      <CustomCalendar
        label='Created At'
        filter={createdAt as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setCreatedAt)}
      />
    </FiltersDrawer>
  );
}
