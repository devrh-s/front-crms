import { useState, useEffect } from 'react';
import { IEntityTypeFieldsFilters } from './types';
import MultipleSelectFilter from '@/components/default/common/filters/MultipleSelectFilter';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import LibrariesFilters from '@/components/default/common/filters/LibrariesFilters';
import { createFilterHandler, checkFilterValue } from '@/lib/helpers';

interface IFiltersProps {
  open: boolean;
  rows: any;
  commonData: ICommonData;
  handleSetFilters: (newFilters: IEntityTypeFieldsFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}

export default function EntityTypeFieldsFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const [languageFilter, setLanguageFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [entityTypesFilter, setEntityTypesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [blocksFilter, setBlocksFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });

  const industries = commonData.industries ?? [];

  const generateFiltersData = () => {
    const filters: IEntityTypeFieldsFilters = {};

    if (checkFilterValue(languageFilter)) {
      filters.translations = {
        data: languageFilter.value,
        mode: languageFilter.mode,
      };
    }
    if (checkFilterValue(blocksFilter)) {
      filters.blocks = {
        data: blocksFilter.value,
        mode: blocksFilter.mode,
      };
    }
    if (checkFilterValue(entityTypesFilter)) {
      filters.entity_types = {
        data: entityTypesFilter.value,
        mode: entityTypesFilter.mode,
      };
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setLanguageFilter({ value: [], mode: 'standard' });
    setEntityTypesFilter({ value: [], mode: 'standard' });
    setBlocksFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityTypesFilter, blocksFilter, languageFilter]);

  return (
    <FiltersDrawer
      title='Entity Types Fields'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <MultipleSelectFilter
        filter={blocksFilter}
        label='Blocks'
        options={commonData.blocks || []}
        handleChangeFilter={createFilterHandler(setBlocksFilter)}
      />
      <MultipleSelectFilter
        filter={languageFilter}
        label='Translations'
        options={commonData.languages || []}
        handleChangeFilter={createFilterHandler(setLanguageFilter)}
      />
      <MultipleSelectFilter
        filter={entityTypesFilter}
        label='Entity types'
        options={commonData.entity_types || []}
        handleChangeFilter={createFilterHandler(setEntityTypesFilter)}
      />
    </FiltersDrawer>
  );
}
