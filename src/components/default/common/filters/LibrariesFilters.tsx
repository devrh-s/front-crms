import { Dispatch, SetStateAction } from 'react';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import SingleSelectFilter from '@/components/default/common/filters/SingleSelectFilter';
import DateRangeFilter from './DateRangeFilter';
import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';
import CustomCalendar from '../components/CustomCalendar';

interface LibrariesFiltersProps {
  groupFilter: IFilter;
  languageFilter: IFilter;
  statusesFilter: IFilter;
  prioritiesFilter: IFilter;
  createdAt: IDateFilter;
  setCreatedAt: Dispatch<SetStateAction<IDateFilter>>;
  createdByFilter: IFilter;
  commonData: ICommonData;
  setCreatedByFilter: Dispatch<SetStateAction<IFilter>>;
  setLanguageFilter: Dispatch<SetStateAction<IFilter>>;
  setStatusesFilter: Dispatch<SetStateAction<IFilter>>;
  setGroupFilter: Dispatch<SetStateAction<IFilter>>;
  setPrioritiesFilter: Dispatch<SetStateAction<IFilter>>;
}

export default function LibrariesFilters({
  commonData,
  groupFilter,
  languageFilter,
  statusesFilter,
  prioritiesFilter,
  createdAt,
  setCreatedAt,
  createdByFilter,
  setCreatedByFilter,
  setLanguageFilter,
  setStatusesFilter,
  setGroupFilter,
  setPrioritiesFilter,
}: LibrariesFiltersProps) {
  const statuses = commonData.statuses ?? [];
  const languages = commonData.languages ?? [];
  const users = commonData.users ?? [];
  const priorities = commonData.priorities
    ? [{ id: 'all', name: 'All' }, ...commonData.priorities]
    : [];
  const libraries = commonData.groups ?? [];
  return (
    <>
      <SingleSelectFilter
        label='Priority'
        filter={prioritiesFilter}
        options={priorities}
        handleChangeFilter={createFilterHandler(setPrioritiesFilter)}
        width='83%'
      />
      <MultipleSelectFilter
        filter={groupFilter}
        label='Group'
        options={libraries}
        handleChangeFilter={createFilterHandler(setGroupFilter)}
      />
      <MultipleSelectFilter
        filter={languageFilter}
        label='Language'
        options={languages}
        handleChangeFilter={createFilterHandler(setLanguageFilter)}
      />
      <MultipleSelectFilter
        filter={statusesFilter}
        label='Statuses'
        options={statuses}
        handleChangeFilter={createFilterHandler(setStatusesFilter)}
      />
      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created By'
        options={users}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
      <CustomCalendar
        label='Created At'
        filter={createdAt as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setCreatedAt)}
      />
    </>
  );
}
