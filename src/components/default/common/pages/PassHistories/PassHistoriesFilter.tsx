import { useState, useEffect } from 'react';
import { IPassHistoryFilters } from './types';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import DateRangeFilter from '@/components/default/common/filters/DateRangeFilter';
import { createDateFilterHandler, checkFilterValue } from '@/lib/helpers';
import CustomCalendar from '../../components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  handleSetFilters: (newFilters: IPassHistoryFilters) => void;
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
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [nextChangeDate, setNextChageDate] = useState<IDateFilter>(dateInitial);

  const generateFiltersData = () => {
    const filters: IPassHistoryFilters = {};

    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    if (checkFilterValue(nextChangeDate)) {
      filters.nextChangeDate = {
        data: {
          start: nextChangeDate?.value?.start?.format('DD-MM-YYYY'),
          end: nextChangeDate?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: nextChangeDate.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setNextChageDate(dateInitial);
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdAt, nextChangeDate]);

  return (
    <FiltersDrawer
      title='Pass History'
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

      <CustomCalendar
        label='Next Change Date'
        filter={createdAt as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setCreatedAt)}
      />
    </FiltersDrawer>
  );
}
