import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createDateFilterHandler, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import CustomCalendar from '../../common/components/CustomCalendar';
import { IGPTsFilters } from './types';

interface IFiltersProps {
  open: boolean;
  commonData: ICommonData;
  handleSetFilters: (newFilters: IGPTsFilters) => void;
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

export default function GPTsFilters({
  open,
  commonData,
  handleSetFilters,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [ownersFilter, setOwnersFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [entitiesFilter, setEntitiesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [toolsFilter, setToolsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [taskTemplatesFilter, setTaskTemplatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [linksFilter, setLinksFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [createdAt, setCreatedAt] = useState<IDateFilter>(dateInitial);

  const users = commonData.users ?? [];
  const accounts = commonData.accounts ?? [];
  const tools = commonData.tools ?? [];
  const taskTemplates = commonData.task_templates ?? [];
  const entities = commonData.entities ?? [];
  const links = commonData.links ?? [];

  const generateFiltersData = () => {
    const filters: IGPTsFilters = {};

    if (checkFilterValue(ownersFilter)) {
      filters.owners = {
        data: ownersFilter.value,
        mode: ownersFilter.mode,
      };
    }
    if (checkFilterValue(entitiesFilter)) {
      filters.entities = {
        data: entitiesFilter.value,
        mode: entitiesFilter.mode,
      };
    }
    if (checkFilterValue(toolsFilter)) {
      filters.tools = {
        data: toolsFilter.value,
        mode: toolsFilter.mode,
      };
    }
    if (checkFilterValue(taskTemplatesFilter)) {
      filters.task_templates = {
        data: taskTemplatesFilter.value,
        mode: taskTemplatesFilter.mode,
      };
    }
    if (checkFilterValue(linksFilter)) {
      filters.links = {
        data: linksFilter.value,
        mode: linksFilter.mode,
      };
    }
    if (checkFilterValue(createdByFilter)) {
      filters.created_by = {
        data: createdByFilter.value,
        mode: createdByFilter.mode,
      };
    }
    if (checkFilterValue(createdAt)) {
      filters.createdAt = {
        data: {
          start: createdAt?.value?.start?.format('DD-MM-YYYY'),
          end: createdAt?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: createdAt.mode,
      };
    }
    handleSetFilters(filters);
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ownersFilter,
    entitiesFilter,
    toolsFilter,
    taskTemplatesFilter,
    linksFilter,
    createdAt,
    createdByFilter,
  ]);

  const clearFilters = () => {
    setOwnersFilter({ value: [], mode: 'standard' });
    setEntitiesFilter({ value: [], mode: 'standard' });
    setToolsFilter({ value: [], mode: 'standard' });
    setTaskTemplatesFilter({ value: [], mode: 'standard' });
    setLinksFilter({ value: [], mode: 'standard' });
    setCreatedByFilter({ value: [], mode: 'standard' });
    setCreatedAt(dateInitial);
  };

  return (
    <FiltersDrawer
      title='GPTs'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={ownersFilter}
        label='Owners'
        options={accounts}
        handleChangeFilter={createFilterHandler(setOwnersFilter)}
      />
      <MultipleSelectFilter
        filter={entitiesFilter}
        label='Entities'
        options={entities}
        handleChangeFilter={createFilterHandler(setEntitiesFilter)}
      />
      <MultipleSelectFilter
        filter={toolsFilter}
        label='Tools'
        options={tools}
        handleChangeFilter={createFilterHandler(setToolsFilter)}
      />
      <MultipleSelectFilter
        filter={linksFilter}
        label='Links'
        options={links}
        handleChangeFilter={createFilterHandler(setLinksFilter)}
      />
      <MultipleSelectFilter
        filter={taskTemplatesFilter}
        label='Task Templates'
        options={taskTemplates}
        handleChangeFilter={createFilterHandler(setTaskTemplatesFilter)}
      />
      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created By'
        options={users}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
      <CustomCalendar
        label='Created At'
        labelStart='Start date'
        labelEnd='End date'
        filter={createdAt as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setCreatedAt)}
      />
    </FiltersDrawer>
  );
}
