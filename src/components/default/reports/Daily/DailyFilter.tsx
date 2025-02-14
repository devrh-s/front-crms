import { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { IDailyFilters, IReportDaily } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import SingleSelectFilter from '@/components/default/common/filters/SingleSelectFilter';
import DateRangeFilter from '@/components/default/common/filters/DateRangeFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  rows: IReportDaily[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IDailyFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

const dateInitial: IDateFilter = {
  value: {
    start: dayjs().startOf('month'),
    end: dayjs().endOf('month'),
  },
  mode: 'standard',
};

export default function DailyFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [view, setView] = useState('daily');
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [usersFilter, setUsersFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [actionFilter, setActionFilter] = useState<IFilter>({
    value: '',
  });

  const users = commonData.users ?? [];
  const actions = commonData.actions ?? [];

  const generateFiltersData = () => {
    const filters: IDailyFilters = {};
    if (checkFilterValue(createdAt)) {
      filters.created_at = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    if (checkFilterValue(usersFilter)) {
      filters.users = { data: usersFilter.value, mode: usersFilter.mode };
    }
    if (actionFilter.value && actionFilter.value !== 'ALL') {
      filters.action = actionFilter.value as string;
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setUsersFilter({ value: [], mode: 'standard' });
    setActionFilter({ value: '' });
    generateFiltersData();
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdAt, usersFilter, actionFilter]);

  return (
    <FiltersDrawer
      title='Daily'
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
        filter={usersFilter}
        label='Users'
        options={users}
        handleChangeFilter={createFilterHandler(setUsersFilter)}
      />
      <SingleSelectFilter
        label='Action'
        filter={actionFilter}
        options={actions}
        handleChangeFilter={createFilterHandler(setActionFilter)}
        width='87%'
      />
    </FiltersDrawer>
  );
}
