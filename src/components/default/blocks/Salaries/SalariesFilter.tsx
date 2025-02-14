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
  salary_types?: IApiFilter;
  currencies?: IApiFilter;
  hourly_currencies?: IApiFilter;
  startDate?: IApiFilter;
  endDate?: IApiFilter;
}

interface IFiltersProps {
  open: boolean;
  rows: ISalary[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IProfessuinsFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function SalariesFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [salaryTypesFilter, setSalaryTypesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [currenciesFilter, setCurrenciesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [hourlyCurrenciesFilter, setHourlyCurrenciesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const [startDate, setStartDate] = useState<IDateFilter>(getDateDefault);
  const [endDate, setEndDate] = useState<IDateFilter>(getDateDefault);

  const clearFilters = () => {
    setSalaryTypesFilter({ value: [], mode: 'standard' });
    setCurrenciesFilter({ value: [], mode: 'standard' });
    setHourlyCurrenciesFilter({ value: [], mode: 'standard' });
    setStartDate(getDateDefault());
    setEndDate(getDateDefault());
    handleSetFilters({});
  };

  useEffect(() => {
    const geneSalaryTypesFiltersData = () => {
      const filters: IProfessuinsFilters = {};

      if (checkFilterValue(salaryTypesFilter)) {
        filters.salary_types = {
          data: salaryTypesFilter.value,
          mode: salaryTypesFilter.mode,
        };
      }
      if (checkFilterValue(currenciesFilter)) {
        filters.currencies = {
          data: currenciesFilter.value,
          mode: currenciesFilter.mode,
        };
      }
      if (checkFilterValue(hourlyCurrenciesFilter)) {
        filters.hourly_currencies = {
          data: hourlyCurrenciesFilter.value,
          mode: hourlyCurrenciesFilter.mode,
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

    geneSalaryTypesFiltersData();
  }, [salaryTypesFilter, currenciesFilter, hourlyCurrenciesFilter, startDate, endDate]);

  return (
    <FiltersDrawer
      title='Salaries'
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
        filter={salaryTypesFilter}
        label='Salary Types'
        options={commonData.salary_types ?? []}
        handleChangeFilter={createFilterHandler(setSalaryTypesFilter)}
      />
      <MultipleSelectFilter
        filter={currenciesFilter}
        label='Currencies'
        options={commonData.currencies ?? []}
        handleChangeFilter={createFilterHandler(setCurrenciesFilter)}
      />
      <MultipleSelectFilter
        filter={hourlyCurrenciesFilter}
        label='Hourly Currencies'
        options={commonData.currencies ?? []}
        handleChangeFilter={createFilterHandler(setHourlyCurrenciesFilter)}
      />
    </FiltersDrawer>
  );
}
