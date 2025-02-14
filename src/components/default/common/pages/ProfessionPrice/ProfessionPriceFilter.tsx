import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import DateRangeFilter from '@/components/default/common/filters/DateRangeFilter';
import { checkFilterValue, createDateFilterHandler, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import MultipleSelectFilter from '../../filters/MultipleSelectFilter';
import { IProfessionPriceFilters } from './types';
import CustomCalendar from '../../components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  handleSetFilters: (newFilters: IProfessionPriceFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
  commonData: ICommonData;
}

const dateInitial: IDateFilter = {
  value: {
    start: null,
    end: null,
  },
  mode: 'standard',
};

export default function ProfessionPriceFilter({
  open,
  handleSetFilters,
  handleApplyFilters,
  toggleFilters,
  commonData,
}: IFiltersProps) {
  const [startDate, setStartDate] = useState<IDateFilter>(dateInitial);
  const [endDate, setEndDate] = useState<IDateFilter>(dateInitial);
  const [ratesFilter, setRatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [currenciesFilter, setCurrenciesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const generateFiltersData = () => {
    const filters: IProfessionPriceFilters = {};

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
    if (checkFilterValue(ratesFilter)) {
      filters.rates = {
        data: ratesFilter.value,
        mode: ratesFilter.mode,
      };
    }
    if (checkFilterValue(currenciesFilter)) {
      filters.currencies = {
        data: currenciesFilter.value,
        mode: currenciesFilter.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setStartDate(dateInitial);
    setEndDate(dateInitial);
    setRatesFilter({ value: [], mode: 'standard' });
    setCurrenciesFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, ratesFilter, currenciesFilter]);

  return (
    <FiltersDrawer
      title='Profession Price'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={currenciesFilter}
        label={'Currencies'}
        options={commonData?.currencies ?? []}
        handleChangeFilter={createFilterHandler(setCurrenciesFilter)}
      />
      <MultipleSelectFilter
        filter={ratesFilter}
        label={'Rates'}
        options={commonData?.rates ?? []}
        handleChangeFilter={createFilterHandler(setRatesFilter)}
      />
      <CustomCalendar
        label='Start date'
        filter={startDate as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setStartDate)}
      />

      <CustomCalendar
        label='End Date'
        filter={endDate as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setEndDate)}
      />
    </FiltersDrawer>
  );
}
