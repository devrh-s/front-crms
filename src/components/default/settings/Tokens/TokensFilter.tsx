import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import DateRangeFilter from '@/components/default/common/filters/DateRangeFilter';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createDateFilterHandler, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { ITokensFilters } from './types';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  commonData: ICommonData;
  handleSetFilters: (newFilters: ITokensFilters) => void;
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

export default function TokensFilter({
  open,
  commonData,
  handleSetFilters,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [expiredAt, setExpiredAt] = useState<IDateFilter>(dateInitial);
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const managers = commonData.users ?? [];

  const generateFiltersData = () => {
    const filters: ITokensFilters = {};
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    if (checkFilterValue(expiredAt)) {
      filters.expiredAt = {
        data: {
          start: expiredAt?.value?.start?.format('DD-MM-YYYY'),
          end: expiredAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: expiredAt.mode,
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

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdAt, expiredAt, createdByFilter]);
  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setExpiredAt(dateInitial);
    setCreatedByFilter({ value: [], mode: 'standard' });
  };

  return (
    <FiltersDrawer
      title='Tokens'
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
        label='Expired At'
        filter={expiredAt as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setExpiredAt)}
      />
      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created By'
        options={managers}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
    </FiltersDrawer>
  );
}
