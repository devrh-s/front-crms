import { checkFilterValue, createDateFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import FiltersDrawer from '../../common/drawers/FiltersDrawer/FiltersDrawer';
import DateRangeFilter from '../../common/filters/DateRangeFilter';
import { IFiltersProps, IJobDashboardFilters } from './types';
import CustomCalendar from '../../common/components/CustomCalendar';

const dateInitial: IDateFilter = {
  value: {
    start: null,
    end: null,
  },
  mode: 'standard',
};

export default function JobDashboardFilter({
  handleSetFilters,
  open,
  toggleFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const [period, setPeriod] = useState<IDateFilter>(dateInitial);

  const generateFiltersData = () => {
    const filters: IJobDashboardFilters = {};
    if (checkFilterValue(period)) {
      filters.period = {
        data: {
          start: period?.value?.start?.format('DD-MM-YYYY'),
          end: period?.value?.end?.format('DD-MM-YYYY'),
        },
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setPeriod(dateInitial);
  };

  useEffect(() => {
    generateFiltersData();
  }, [period]);

  return (
    <FiltersDrawer
      title='Job Dashboard'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <CustomCalendar
        label='Period'
        filter={period as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setPeriod)}
        hideSwitch
      />
    </FiltersDrawer>
  );
}
