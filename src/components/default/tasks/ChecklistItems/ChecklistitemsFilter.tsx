import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createDateFilterHandler, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import CustomCalendar from '../../common/components/CustomCalendar';
import SingleSelectFilter from '../../common/filters/SingleSelectFilter';
import { IChecklistItemsFilters } from './types';

interface IFiltersProps {
  open: boolean;
  rows: IChecklistItemType[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IChecklistItemsFilters) => void;
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

export default function CheklistItemsFilter({
  open,
  handleSetFilters,
  commonData,
  toggleFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const [isDraftFilter, setIsDraftFilter] = useState<IFilter>({
    value: '',
  });
  const [guidesFilter, setGuidesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [actionsFilter, setActionsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [objectsFilter, setObjectsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [toolsFilter, setToolsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [updatedAt, setUpdatedAt] = useState<IDateFilter>(dateInitial);

  const actions = commonData.actions ?? [];
  const objects = commonData.objects ?? [];
  const tools = commonData.tools ?? [];
  const guides = commonData.guides ?? [];
  const users = commonData.users ?? [];

  const generateFiltersData = () => {
    const filters: IChecklistItemsFilters = {};
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    if (checkFilterValue(objectsFilter)) {
      filters.objects = {
        data: objectsFilter.value,
        mode: objectsFilter.mode,
      };
    }
    if (checkFilterValue(actionsFilter)) {
      filters.actions = {
        data: actionsFilter.value,
        mode: actionsFilter.mode,
      };
    }
    if (checkFilterValue(toolsFilter)) {
      filters.tools = {
        data: toolsFilter.value,
        mode: toolsFilter.mode,
      };
    }
    if (checkFilterValue(updatedAt)) {
      filters.updatedAt = {
        data: {
          start: updatedAt?.value?.start?.format('DD-MM-YYYY'),
          end: updatedAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: updatedAt.mode,
      };
    }
    if (checkFilterValue(guidesFilter)) {
      filters.guides = {
        data: guidesFilter.value,
        mode: guidesFilter.mode,
      };
    }
    if (checkFilterValue(createdByFilter)) {
      filters.created_by = {
        data: createdByFilter.value,
        mode: createdByFilter.mode,
      };
    }
    if (isDraftFilter.value !== '' && isDraftFilter.value !== undefined) {
      filters.is_draft = +isDraftFilter.value === 1 ? 'true' : 'false';
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setToolsFilter({ value: [], mode: 'standard' });
    setObjectsFilter({ value: [], mode: 'standard' });
    setActionsFilter({ value: [], mode: 'standard' });
    setCreatedAt(dateInitial);
    setUpdatedAt(dateInitial);
    setGuidesFilter({ value: [], mode: 'standard' });
    setCreatedByFilter({ value: [], mode: 'standard' });
    setIsDraftFilter({ value: '' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    guidesFilter,
    createdAt,
    updatedAt,
    createdByFilter,
    toolsFilter,
    actionsFilter,
    objectsFilter,
    isDraftFilter,
  ]);

  return (
    <FiltersDrawer
      title='Checklist Items Filter'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={guidesFilter}
        label='Guides'
        options={guides}
        handleChangeFilter={createFilterHandler(setGuidesFilter)}
      />
      <MultipleSelectFilter
        filter={actionsFilter}
        label='Actions'
        options={actions}
        handleChangeFilter={createFilterHandler(setActionsFilter)}
      />
      <MultipleSelectFilter
        filter={objectsFilter}
        label='Objects'
        options={objects}
        handleChangeFilter={createFilterHandler(setObjectsFilter)}
      />
      <MultipleSelectFilter
        filter={toolsFilter}
        label='Tools'
        options={tools}
        handleChangeFilter={createFilterHandler(setToolsFilter)}
      />
      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created by'
        options={users}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
      <SingleSelectFilter
        label={'Is Draft'}
        filter={isDraftFilter}
        options={commonData?.availabilities ?? []}
        handleChangeFilter={createFilterHandler(setIsDraftFilter)}
      />
      <CustomCalendar
        label='Created At'
        filter={createdAt as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setCreatedAt)}
      />
      <CustomCalendar
        label='Updated At'
        filter={updatedAt as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setUpdatedAt)}
      />
    </FiltersDrawer>
  );
}
