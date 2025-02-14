import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import DateRangeFilter from '@/components/default/common/filters/DateRangeFilter';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createDateFilterHandler, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { IActivitiesFilters, IActivity } from './types';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  rows: IActivity[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IActivitiesFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
  closeAfterApply?: boolean;
}

const dateInitial: IDateFilter = {
  value: {
    start: null,
    end: null,
  },
  mode: 'standard',
};

export default function ActivitiesFilter({
  open,
  handleSetFilters,
  commonData,
  toggleFilters,
  handleApplyFilters,
  closeAfterApply,
}: IFiltersProps) {
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [userFilter, setUserFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [actionFilter, setActionFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [blocksFilter, setBlocksFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [entitiesFilter, setEntitiesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const users = commonData.users ?? [];
  const actions = commonData.actions ?? [];
  const blocks = commonData.blocks ?? [];
  const entities = commonData.entities ?? [];

  const generateFiltersData = () => {
    const filters: IActivitiesFilters = {};
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    if (checkFilterValue(userFilter)) {
      filters.users = {
        data: userFilter.value,
        mode: userFilter.mode,
      };
    }
    if (checkFilterValue(actionFilter)) {
      filters.actions = {
        data: actionFilter.value,
        mode: actionFilter.mode,
      };
    }
    if (checkFilterValue(blocksFilter)) {
      filters.blocks = {
        data: blocksFilter.value,
        mode: blocksFilter.mode,
      };
    }
    if (checkFilterValue(entitiesFilter)) {
      filters.entities = {
        data: entitiesFilter.value,
        mode: entitiesFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setUserFilter({ value: [], mode: 'standard' });
    setBlocksFilter({ value: [], mode: 'standard' });
    setEntitiesFilter({ value: [], mode: 'standard' });
    setCreatedAt(dateInitial);
    setActionFilter({ value: [] });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdAt, userFilter, actionFilter, blocksFilter, entitiesFilter]);

  return (
    <FiltersDrawer
      title='Activities'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
      closeAfterApply={closeAfterApply}
    >
      <MultipleSelectFilter
        filter={userFilter}
        label='Users'
        options={users}
        handleChangeFilter={createFilterHandler(setUserFilter)}
      />
      <MultipleSelectFilter
        filter={actionFilter}
        label='Action'
        options={actions}
        handleChangeFilter={createFilterHandler(setActionFilter)}
      />
      <MultipleSelectFilter
        filter={entitiesFilter}
        label='Entities'
        options={entities}
        handleChangeFilter={createFilterHandler(setEntitiesFilter)}
      />
      <MultipleSelectFilter
        filter={blocksFilter}
        label='Blocks'
        options={blocks}
        handleChangeFilter={createFilterHandler(setBlocksFilter)}
      />
      <CustomCalendar
        label='Created At'
        filter={createdAt as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setCreatedAt)}
      />
    </FiltersDrawer>
  );
}
