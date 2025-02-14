import { useState, useEffect } from 'react';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, checkFilterValue, createDateFilterHandler } from '@/lib/helpers';
import DateRangeFilter from '@/components/default/common/filters/DateRangeFilter';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IDateFilterValues {
  start?: string | null;
  end?: string | null;
}
interface IApiFilter {
  data: number[] | string | IDateFilterValues;
  mode?: FilterMode;
}

const getDateDefault = (): IDateFilter => ({
  value: {
    start: null,
    end: null,
  },
  mode: 'standard',
});

export interface IProfessuinsFilters {
  rates?: IApiFilter;
  shifts?: IApiFilter;
  inner_clients?: IApiFilter;
  startDate?: IApiFilter;
  endDate?: IApiFilter;
}

interface IFiltersProps {
  open: boolean;
  rows: IContact[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IProfessuinsFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function RatesFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [rateFilter, setRateFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [shiftFilter, setShiftFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [innerClientFilter, setInnerClientFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const [startDate, setStartDate] = useState<IDateFilter>(getDateDefault);
  const [endDate, setEndDate] = useState<IDateFilter>(getDateDefault);

  const clearFilters = () => {
    setRateFilter({ value: [], mode: 'standard' });
    setShiftFilter({ value: [], mode: 'standard' });
    setInnerClientFilter({ value: [], mode: 'standard' });
    setStartDate(getDateDefault());
    setEndDate(getDateDefault());
    handleSetFilters({});
  };

  useEffect(() => {
    const generateFiltersData = () => {
      const filters: IProfessuinsFilters = {};

      if (checkFilterValue(rateFilter)) {
        filters.rates = {
          data: rateFilter.value,
          mode: rateFilter.mode,
        };
      }
      if (checkFilterValue(shiftFilter)) {
        filters.shifts = {
          data: shiftFilter.value,
          mode: shiftFilter.mode,
        };
      }
      if (checkFilterValue(innerClientFilter)) {
        filters.inner_clients = {
          data: innerClientFilter.value,
          mode: innerClientFilter.mode,
        };
      }
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

      handleSetFilters(filters);
    };

    generateFiltersData();
  }, [rateFilter, shiftFilter, innerClientFilter, startDate, endDate]);

  return (
    <FiltersDrawer
      title='Rates'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <CustomCalendar
        label='Start date'
        filter={startDate}
        handleChangeFilter={createDateFilterHandler(setStartDate)}
      />
      <CustomCalendar
        label='End Date'
        filter={endDate}
        handleChangeFilter={createDateFilterHandler(setEndDate)}
      />
      <MultipleSelectFilter
        filter={rateFilter}
        label='Rate'
        options={commonData.rates ?? []}
        handleChangeFilter={createFilterHandler(setRateFilter)}
      />
      <MultipleSelectFilter
        filter={shiftFilter}
        label='Shift'
        options={commonData.shifts ?? []}
        handleChangeFilter={createFilterHandler(setShiftFilter)}
      />
      <MultipleSelectFilter
        filter={innerClientFilter}
        label='Inner Client'
        options={commonData.inner_clients ?? []}
        handleChangeFilter={createFilterHandler(setInnerClientFilter)}
      />
    </FiltersDrawer>
  );
}
