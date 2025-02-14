import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import DateRangeFilter from '@/components/default/common/filters/DateRangeFilter';
import SingleSelectFilter from '@/components/default/common/filters/SingleSelectFilter';
import { checkFilterValue, createDateFilterHandler, createFilterHandler } from '@/lib/helpers';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useEffect, useState } from 'react';
import MultipleSelectFilter from '../../common/filters/MultipleSelectFilter';
import { IUsersFilters } from './types';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  commonData: ICommonData;
  handleSetFilters: (newFilters: IUsersFilters) => void;
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

export default function UsersFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  dayjs.extend(isoWeek);
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [availabilityFilter, setAvailabilityFilter] = useState<IFilter>({
    value: 'active',
  });
  const [currenciesFilter, setCurrenciesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [rolesFilter, setRolesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const availabilities = commonData.availabilities ?? [];
  const currencies = commonData.currencies ?? [];
  const roles = commonData.roles ?? [];

  const generateFiltersData = () => {
    const filters: IUsersFilters = {};
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    if (checkFilterValue(availabilityFilter)) {
      filters.is_active = availabilityFilter.value as string;
    }
    if (checkFilterValue(currenciesFilter)) {
      filters.currencies = {
        data: currenciesFilter.value,
        mode: currenciesFilter.mode,
      };
    }
    if (checkFilterValue(rolesFilter)) {
      filters.roles = {
        data: rolesFilter.value,
        mode: rolesFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setCurrenciesFilter({ value: [], mode: 'standard' });
    setAvailabilityFilter({ value: 'active' });
    setRolesFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdAt, availabilityFilter, currenciesFilter, rolesFilter]);

  return (
    <FiltersDrawer
      title='Users'
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
      <SingleSelectFilter
        label='Is active'
        filter={availabilityFilter}
        options={availabilities}
        handleChangeFilter={createFilterHandler(setAvailabilityFilter)}
        width='83%'
      />
      <MultipleSelectFilter
        filter={currenciesFilter}
        label='Currencies'
        options={currencies}
        handleChangeFilter={createFilterHandler(setCurrenciesFilter)}
      />
      <MultipleSelectFilter
        filter={rolesFilter}
        label='Roles'
        options={roles}
        handleChangeFilter={createFilterHandler(setRolesFilter)}
      />
    </FiltersDrawer>
  );
}
