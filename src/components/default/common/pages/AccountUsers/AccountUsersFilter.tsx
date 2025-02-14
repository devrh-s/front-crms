import { useState, useEffect } from 'react';
import { IAccountUserFilters } from './types';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import DateRangeFilter from '@/components/default/common/filters/DateRangeFilter';
import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';
import CustomCalendar from '../../components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  commonData: ICommonData;
  handleSetFilters: (newFilters: IAccountUserFilters) => void;
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

export default function AccountUsersFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [startDate, setStartDate] = useState<IDateFilter>(dateInitial);
  const [endDate, setEndDate] = useState<IDateFilter>(dateInitial);

  const [userFilter, setUserFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const users = commonData.users ?? [];

  const generateFiltersData = () => {
    const filters: IAccountUserFilters = {};

    if (checkFilterValue(startDate)) {
      filters.startDate = {
        data: {
          start: startDate?.value?.start?.format('DD-MM-YYYY'),
          end: startDate?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: startDate.mode,
      };
    }
    if (checkFilterValue(endDate)) {
      filters.endDate = {
        data: {
          start: endDate?.value?.start?.format('DD-MM-YYYY'),
          end: endDate?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: endDate.mode,
      };
    }

    if (checkFilterValue(userFilter)) {
      filters.users = {
        data: userFilter.value,
        mode: userFilter.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setStartDate(dateInitial);
    setEndDate(dateInitial);
    setUserFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, userFilter]);

  return (
    <FiltersDrawer
      title='Account user'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <CustomCalendar
        label='Start Date'
        filter={startDate as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setStartDate)}
      />

      <CustomCalendar
        label='End Date'
        filter={endDate as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setEndDate)}
      />

      <MultipleSelectFilter
        filter={userFilter}
        label='User'
        options={users}
        handleChangeFilter={createFilterHandler(setUserFilter)}
      />
    </FiltersDrawer>
  );
}
