import { useState, useEffect } from 'react';
import { IGuidesFilters } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';

import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  rows: IGuideType[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IGuidesFilters) => void;
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

export default function GuidesFilter({
  open,
  handleSetFilters,
  commonData,
  toggleFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const [formatsFilter, setFormatsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [toolsFilter, setToolsFilter] = useState<IFilter>({
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
  const [statusesFilter, setStatusesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [typesFilter, setTypesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [checkListItemsFilter, setCheckListItemsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [updatedAt, setUpdatedAt] = useState<IDateFilter>(dateInitial);

  const formats = commonData.formats ?? [];
  const users = commonData.users ?? [];
  const statuses = commonData.statuses ?? [];
  const tools = commonData.tools ?? [];
  const actions = commonData.actions ?? [];
  const objects = commonData.objects ?? [];
  const checklist_items = commonData.checklist_items ?? [];

  const generateFiltersData = () => {
    const filters: IGuidesFilters = {};
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
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
    if (checkFilterValue(formatsFilter)) {
      filters.formats = {
        data: formatsFilter.value,
        mode: formatsFilter.mode,
      };
    }
    if (checkFilterValue(createdByFilter)) {
      filters.created_by = {
        data: createdByFilter.value,
        mode: createdByFilter.mode,
      };
    }
    if (checkFilterValue(toolsFilter)) {
      filters.tools = {
        data: toolsFilter.value,
        mode: toolsFilter.mode,
      };
    }
    if (checkFilterValue(actionsFilter)) {
      filters.actions = {
        data: actionsFilter.value,
        mode: actionsFilter.mode,
      };
    }
    if (checkFilterValue(objectsFilter)) {
      filters.objects = {
        data: objectsFilter.value,
        mode: objectsFilter.mode,
      };
    }
    if (checkFilterValue(statusesFilter)) {
      filters.statuses = {
        data: statusesFilter.value,
        mode: statusesFilter.mode,
      };
    }
    if (checkFilterValue(typesFilter)) {
      filters.types = {
        data: typesFilter.value,
        mode: typesFilter.mode,
      };
    }
    if (checkFilterValue(checkListItemsFilter)) {
      filters.checklist_items = {
        data: checkListItemsFilter.value,
        mode: checkListItemsFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setUpdatedAt(dateInitial);
    setToolsFilter({ value: [], mode: 'standard' });
    setActionsFilter({ value: [], mode: 'standard' });
    setObjectsFilter({ value: [], mode: 'standard' });
    setCheckListItemsFilter({ value: [], mode: 'standard' });
    setFormatsFilter({ value: [], mode: 'standard' });
    setCreatedByFilter({ value: [], mode: 'standard' });
    setStatusesFilter({ value: [], mode: 'standard' });
    setTypesFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    createdByFilter,
    formatsFilter,
    createdAt,
    updatedAt,
    toolsFilter,
    actionsFilter,
    objectsFilter,
    checkListItemsFilter,
    statusesFilter,
    typesFilter,
  ]);

  return (
    <FiltersDrawer
      title='Guides'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={formatsFilter}
        label='Formats'
        options={formats}
        handleChangeFilter={createFilterHandler(setFormatsFilter)}
      />
      <MultipleSelectFilter
        filter={statusesFilter}
        label='Statuses'
        options={statuses}
        handleChangeFilter={createFilterHandler(setStatusesFilter)}
      />
      <MultipleSelectFilter
        filter={typesFilter}
        label='Types'
        options={objects}
        handleChangeFilter={createFilterHandler(setTypesFilter)}
      />
      <MultipleSelectFilter
        filter={toolsFilter}
        label='Tools'
        options={tools}
        handleChangeFilter={createFilterHandler(setToolsFilter)}
      />
      <MultipleSelectFilter
        filter={checkListItemsFilter}
        label='Cheklist Items'
        options={checklist_items}
        handleChangeFilter={createFilterHandler(setCheckListItemsFilter)}
      />
      <MultipleSelectFilter
        filter={objectsFilter}
        label='Objects'
        options={objects}
        handleChangeFilter={createFilterHandler(setObjectsFilter)}
      />
      <MultipleSelectFilter
        filter={actionsFilter}
        label='Actions'
        options={actions}
        handleChangeFilter={createFilterHandler(setActionsFilter)}
      />
      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created by'
        options={users}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
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
