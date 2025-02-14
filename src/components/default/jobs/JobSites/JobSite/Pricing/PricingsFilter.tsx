import { useState, useEffect } from 'react';
import { Theme, useMediaQuery } from '@mui/material';
import { IPricingsFilters, IPricing } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { Dayjs } from 'dayjs';
import DateRangeFilter from '@/components/default/common/filters/DateRangeFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';
import CustomCalendar from '@/components/default/common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  commonData: ICommonData;
  handleSetFilters: (newFilters: IPricingsFilters) => void;
  toggleFilters: (state: boolean) => () => void;
  handleApplyFilters: () => void;
}

const dateInitial: IDateFilter = {
  value: {
    start: null,
    end: null,
  },
  mode: 'standard',
};

export default function PricingsFilter({
  open,
  handleSetFilters,
  handleApplyFilters,
  commonData,
  toggleFilters,
}: IFiltersProps) {
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [pricingTypeFilter, setPricingTypeFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [currenciesFilter, setCurrenciesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const currencies = commonData.currencies ?? [];
  const pricings = commonData.pricings ?? [];
  const users = commonData.users ?? [];

  const generateFiltersData = () => {
    const filters: IPricingsFilters = {};
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    if (checkFilterValue(pricingTypeFilter)) {
      filters.pricing_types = {
        data: pricingTypeFilter.value,
        mode: pricingTypeFilter.mode,
      };
    }
    if (checkFilterValue(currenciesFilter)) {
      filters.currencies = {
        data: currenciesFilter.value,
        mode: currenciesFilter.mode,
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
    setPricingTypeFilter({ value: [], mode: 'standard' });
    setCurrenciesFilter({ value: [], mode: 'standard' });
    setCreatedByFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdAt, pricingTypeFilter, currenciesFilter, createdByFilter]);

  return (
    <FiltersDrawer
      title='Job Requests'
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
        filter={pricingTypeFilter}
        label='Pricing types'
        options={pricings}
        handleChangeFilter={createFilterHandler(setPricingTypeFilter)}
      />
      <MultipleSelectFilter
        filter={currenciesFilter}
        label='Currency'
        options={currencies}
        handleChangeFilter={createFilterHandler(setCurrenciesFilter)}
      />
      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created By'
        options={users}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
    </FiltersDrawer>
  );
}
