import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import { checkFilterValue, createFilterHandler } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { IToolsFilters } from './types';

interface IFiltersProps {
  open: boolean;
  rows: ITool[];
  commonData: ICommonData;
  handleSetFilters: (newFilters: IToolsFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function ToolsFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [blocksFilter, setBlocksFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [entitiesFilter, setEntitiesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [toolTypesFilter, setToolTypesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [guidesFilter, setGuidesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [taskTemplatesFilter, setTaskTemplatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const blocks = commonData.blocks ?? [];
  const entities = commonData.entities ?? [];
  const tool_types = commonData.tool_types ?? [];
  const guides = commonData.guides ?? [];
  const task_templates = commonData.task_templates ?? [];

  const generateFiltersData = () => {
    const filters: IToolsFilters = {};
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
    if (checkFilterValue(toolTypesFilter)) {
      filters.tool_types = {
        data: toolTypesFilter.value,
        mode: toolTypesFilter.mode,
      };
    }
    if (checkFilterValue(guidesFilter)) {
      filters.guides = {
        data: guidesFilter.value,
        mode: guidesFilter.mode,
      };
    }
    if (checkFilterValue(taskTemplatesFilter)) {
      filters.task_templates = {
        data: taskTemplatesFilter.value,
        mode: taskTemplatesFilter.mode,
      };
    }
    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setBlocksFilter({ value: [], mode: 'standard' });
    setEntitiesFilter({ value: [], mode: 'standard' });
    setToolTypesFilter({ value: [], mode: 'standard' });
    setGuidesFilter({ value: [], mode: 'standard' });
    setTaskTemplatesFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocksFilter, entitiesFilter, toolTypesFilter, guidesFilter, taskTemplatesFilter]);

  return (
    <FiltersDrawer
      title='Professions'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={toolTypesFilter}
        label='Tool types'
        options={tool_types}
        handleChangeFilter={createFilterHandler(setToolTypesFilter)}
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
      <MultipleSelectFilter
        filter={guidesFilter}
        label='Guides'
        options={guides}
        handleChangeFilter={createFilterHandler(setGuidesFilter)}
      />
      <MultipleSelectFilter
        filter={taskTemplatesFilter}
        label='Task Templates'
        options={task_templates}
        handleChangeFilter={createFilterHandler(setTaskTemplatesFilter)}
      />
    </FiltersDrawer>
  );
}
