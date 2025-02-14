import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createDateFilterHandler, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import CustomCalendar from '@/components/default/common/components/CustomCalendar';
import SingleSelectFilter from '@/components/default/common/filters/SingleSelectFilter';
import { ITaskTemplatesFilters } from './types';

interface IFiltersProps {
  open: boolean;
  rows: IChecklistItemType[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: ITaskTemplatesFilters) => void;
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

export default function TaskTemplatesFilter({
  open,
  handleSetFilters,
  commonData,
  toggleFilters,
  handleApplyFilters,
}: IFiltersProps) {
  const [isDraftFilter, setIsDraftFilter] = useState<IFilter>({
    value: '',
  });
  const [frequenciesFilter, setFrequenciesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [professionsFilter, setProfessionsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [stepTemplatesFilter, setStepTemplatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [actionsFilter, setActionsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [objectFilter, setObjectFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);

  const frequencies = commonData.frequencies ?? [];
  const professions = commonData.professions ?? [];
  const step_templates = commonData.step_templates ?? [];
  const users = commonData.users ?? [];
  const actions = commonData.actions ?? [];
  const objects = commonData.objects ?? [];

  const generateFiltersData = () => {
    const filters: ITaskTemplatesFilters = {};
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    if (checkFilterValue(frequenciesFilter)) {
      filters.frequencies = {
        data: frequenciesFilter.value,
        mode: frequenciesFilter.mode,
      };
    }
    if (checkFilterValue(frequenciesFilter)) {
      filters.frequencies = {
        data: frequenciesFilter.value,
        mode: frequenciesFilter.mode,
      };
    }
    if (checkFilterValue(professionsFilter)) {
      filters.professions = {
        data: professionsFilter.value,
        mode: professionsFilter.mode,
      };
    }
    if (checkFilterValue(stepTemplatesFilter)) {
      filters.step_templates = {
        data: stepTemplatesFilter.value,
        mode: stepTemplatesFilter.mode,
      };
    }
    if (checkFilterValue(createdByFilter)) {
      filters.created_by = {
        data: createdByFilter.value,
        mode: createdByFilter.mode,
      };
    }
    if (checkFilterValue(actionsFilter)) {
      filters.actions = {
        data: actionsFilter.value,
        mode: actionsFilter.mode,
      };
    }
    if (checkFilterValue(objectFilter)) {
      filters.objects = {
        data: objectFilter.value,
        mode: objectFilter.mode,
      };
    }
    if (isDraftFilter.value !== '' && isDraftFilter.value !== undefined) {
      filters.is_draft = +isDraftFilter.value === 1 ? 'true' : 'false';
    }
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt.value.start ? createdAt.value.start.format('DD-MM-YYYY') : '',
          end: createdAt.value.end ? createdAt.value.end.format('DD-MM-YYYY') : '',
        },
        mode: createdAt.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setCreatedAt(dateInitial);
    setActionsFilter({ value: [], mode: 'standard' });
    setObjectFilter({ value: [], mode: 'standard' });
    setCreatedByFilter({ value: [], mode: 'standard' });
    setFrequenciesFilter({ value: [], mode: 'standard' });
    setProfessionsFilter({ value: [], mode: 'standard' });
    setStepTemplatesFilter({ value: [], mode: 'standard' });
    setIsDraftFilter({ value: '' });
  };

  useEffect(() => {
    generateFiltersData();
  }, [
    frequenciesFilter,
    stepTemplatesFilter,
    professionsFilter,
    createdAt,
    createdByFilter,
    actionsFilter,
    objectFilter,
    isDraftFilter,
  ]);

  return (
    <FiltersDrawer
      title='Task Templates Filter'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={actionsFilter}
        label='Actions'
        options={actions}
        handleChangeFilter={createFilterHandler(setActionsFilter)}
      />
      <MultipleSelectFilter
        filter={objectFilter}
        label='Objects'
        options={objects}
        handleChangeFilter={createFilterHandler(setObjectFilter)}
      />
      <MultipleSelectFilter
        filter={frequenciesFilter}
        label='Frequencies'
        options={frequencies}
        handleChangeFilter={createFilterHandler(setFrequenciesFilter)}
      />
      <MultipleSelectFilter
        filter={professionsFilter}
        label='Professions'
        options={professions}
        handleChangeFilter={createFilterHandler(setProfessionsFilter)}
      />
      <MultipleSelectFilter
        filter={stepTemplatesFilter}
        label='Step Templates'
        options={step_templates}
        handleChangeFilter={createFilterHandler(setStepTemplatesFilter)}
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
    </FiltersDrawer>
  );
}
