import { useState, useEffect } from 'react';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import DateRangeFilter from '../../common/filters/DateRangeFilter';
import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';
import { ILinksFilters } from './types';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  rows: IGuideType[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: ILinksFilters) => void;
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

export default function LinksFilter({
  open,
  handleSetFilters,
  commonData,
  toggleFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const [toolsFilter, setToolsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [innerClientsFilter, setInnerClientsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [objectsFilter, setObjectsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [ownersFilter, setOwnersFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [formatsFilter, setFormatsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [statusesFilter, setStatusesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [professionsFilter, setProfessionsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);
  const [updatedAt, setUpdatedAt] = useState<IDateFilter>(dateInitial);

  const tools = commonData.tools ?? [];
  const formats = commonData.formats ?? [];
  const accounts = commonData.accounts ?? [];
  const users = commonData.users ?? [];
  const inner_clients = commonData.inner_clients ?? [];
  const objects = commonData.objects ?? [];
  const statuses = commonData.statuses ?? [];
  const professions = commonData.professions ?? [];

  const generateFiltersData = () => {
    const filters: ILinksFilters = {};
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
    if (checkFilterValue(ownersFilter)) {
      filters.owners = {
        data: ownersFilter.value,
        mode: ownersFilter.mode,
      };
    }
    if (checkFilterValue(innerClientsFilter)) {
      filters.inner_clients = {
        data: innerClientsFilter.value,
        mode: innerClientsFilter.mode,
      };
    }
    if (checkFilterValue(objectsFilter)) {
      filters.objects = {
        data: objectsFilter.value,
        mode: objectsFilter.mode,
      };
    }
    if (checkFilterValue(professionsFilter)) {
      filters.professions = {
        data: professionsFilter.value,
        mode: professionsFilter.mode,
      };
    }
    if (checkFilterValue(statusesFilter)) {
      filters.statuses = {
        data: statusesFilter.value,
        mode: statusesFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setUpdatedAt(dateInitial);
    setToolsFilter({ value: [], mode: 'standard' });
    setStatusesFilter({ value: [], mode: 'standard' });
    setObjectsFilter({ value: [], mode: 'standard' });
    setOwnersFilter({ value: [], mode: 'standard' });
    setProfessionsFilter({ value: [], mode: 'standard' });
    setInnerClientsFilter({ value: [], mode: 'standard' });
    setFormatsFilter({ value: [], mode: 'standard' });
    setCreatedByFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
  }, [
    createdByFilter,
    formatsFilter,
    createdAt,
    updatedAt,
    toolsFilter,
    innerClientsFilter,
    objectsFilter,
    professionsFilter,
    ownersFilter,
    statusesFilter,
  ]);

  return (
    <FiltersDrawer
      title='Links'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={toolsFilter}
        label='Tools'
        options={tools}
        handleChangeFilter={createFilterHandler(setToolsFilter)}
      />
      <MultipleSelectFilter
        filter={formatsFilter}
        label='Formats'
        options={formats}
        handleChangeFilter={createFilterHandler(setFormatsFilter)}
      />
      <MultipleSelectFilter
        filter={innerClientsFilter}
        label='Inner Clients'
        options={inner_clients}
        handleChangeFilter={createFilterHandler(setInnerClientsFilter)}
      />
      <MultipleSelectFilter
        filter={objectsFilter}
        label='Objects'
        options={objects}
        handleChangeFilter={createFilterHandler(setObjectsFilter)}
      />

      <MultipleSelectFilter
        filter={ownersFilter}
        label='Owners'
        options={accounts}
        handleChangeFilter={createFilterHandler(setOwnersFilter)}
      />

      <MultipleSelectFilter
        filter={statusesFilter}
        label='Statuses'
        options={statuses}
        handleChangeFilter={createFilterHandler(setStatusesFilter)}
      />
      <MultipleSelectFilter
        filter={professionsFilter}
        label='Professions'
        options={professions}
        handleChangeFilter={createFilterHandler(setProfessionsFilter)}
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
