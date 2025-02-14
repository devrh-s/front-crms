import { useState, useEffect } from 'react';
import { IJobPostsFilters } from './types';
import FiltersDrawer from '@/components/default/common/drawers/FiltersDrawer/FiltersDrawer';
import CountryCity from '@/components/default/common/related/filters/CountryCity/CountryCity';
import MultipleSelectFilter from '../../common/filters/MultipleSelectFilter';
import DateRangeFilter from '@/components/default/common/filters/DateRangeFilter';
import { createFilterHandler, createDateFilterHandler, checkFilterValue } from '@/lib/helpers';
import { useSelector } from 'react-redux';
import { IRootState } from '@/redux/store';
import SingleSelectFilter from '../../common/filters/SingleSelectFilter';
import CustomCalendar from '../../common/components/CustomCalendar';

interface IFiltersProps {
  open: boolean;
  commonData: ICommonData;
  handleSetFilters: (newFilters: IJobPostsFilters) => void;
  handleApplyFilters: () => void;
  toggleFilters: (state: boolean) => () => void;
}
const availabilities = [
  { id: 0, name: 'No' },
  { id: 1, name: 'Yes' },
];
const dateInitial: IDateFilter = {
  value: {
    start: null,
    end: null,
  },
  mode: 'standard',
};

export default function JobPostsFilter({
  open,
  handleSetFilters,
  commonData,
  handleApplyFilters,
  toggleFilters,
}: IFiltersProps) {
  const queryFilter = useSelector((state: IRootState) => state.queryFilters['job-posts']);
  const [jobAccountFilter, setJobAccountFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [accountFilter, setAccountFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [publishDate, setPublishDate] = useState<IDateFilter>(dateInitial);
  const [plannedDate, setPlannedDate] = useState<IDateFilter>(dateInitial);
  const [endDate, setEndDate] = useState<IDateFilter>(dateInitial);
  const [publishedByFilter, setPublished_byFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [publishedSiteFilter, setPublishedSiteFilter] = useState<IFilter>({
    value: '',
  });
  const [createdByFilter, setCreatedByFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [statusFilter, setStatusFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [shiftsFilter, setShiftsFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [currencyFilter, setCurrencyFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [cityFilter, setCityFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [countryFilter, setCountryFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [postTemplatesFilter, setPostTemplatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [translationFilter, setTranslationFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [jobTemplatesFilter, setJobTemplatesFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [contactAccountFilter, setContactAccountFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const [innerClientFilter, setInnerClientFilter] = useState<IFilter>({
    value: [],
    mode: 'standard',
  });
  const filtersSetters = {
    'job-templates': setJobTemplatesFilter,
    'job-accounts': setJobAccountFilter,
  };

  const jobAccounts = commonData.job_accounts ?? [];
  const publishedBy = commonData.users ?? [];
  const statuses = commonData.statuses ?? [];
  const currencies = commonData.currencies ?? [];
  const cities = commonData.cities ?? [];
  const shifts = commonData.shifts ?? [];
  const countries = commonData.countries ?? [];
  const postTemplates = commonData.post_templates ?? [];
  const jobTemplates = commonData.job_templates ?? [];
  const accounts = commonData.accounts ?? [];
  const contactAccounts = commonData.accounts ?? [];
  const innerClients = commonData.inner_clients ?? [];
  const languages = commonData?.languages ?? [];

  const generateFiltersData = () => {
    const filters: IJobPostsFilters = {};
    if (checkFilterValue(plannedDate)) {
      filters.plannedDate = {
        data: {
          start: plannedDate?.value?.start?.format('DD-MM-YYYY'),
          end: plannedDate?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: plannedDate.mode,
      };
    }
    if (checkFilterValue(publishDate)) {
      filters.publishDate = {
        data: {
          start: publishDate?.value?.start?.format('DD-MM-YYYY'),
          end: publishDate?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: publishDate.mode,
      };
    }
    if (checkFilterValue(endDate)) {
      filters.endDate = {
        data: {
          start: endDate?.value?.start?.format('DD-MM-YYYY'),
          end: endDate?.value?.end?.format('DD-MM-YYYY'),
        },
        mode: endDate.mode,
      };
    }
    if (checkFilterValue(accountFilter)) {
      filters.accounts = {
        data: accountFilter.value,
        mode: accountFilter.mode,
      };
    }
    if (checkFilterValue(jobAccountFilter)) {
      filters.job_accounts = {
        data: jobAccountFilter.value,
        mode: jobAccountFilter.mode,
      };
    }
    if (checkFilterValue(translationFilter)) {
      filters.translations = {
        data: translationFilter.value,
        mode: translationFilter.mode,
      };
    }
    if (checkFilterValue(publishedByFilter)) {
      filters.published_by = {
        data: publishedByFilter.value,
        mode: publishedByFilter.mode,
      };
    }

    if (checkFilterValue(createdByFilter)) {
      filters.created_by = {
        data: createdByFilter.value,
        mode: createdByFilter.mode,
      };
    }
    if (checkFilterValue(shiftsFilter)) {
      filters.shifts = {
        data: shiftsFilter.value,
        mode: shiftsFilter.mode,
      };
    }

    if (checkFilterValue(statusFilter)) {
      filters.statuses = {
        data: statusFilter.value,
        mode: statusFilter.mode,
      };
    }

    if (checkFilterValue(currencyFilter)) {
      filters.currencies = {
        data: currencyFilter.value,
        mode: currencyFilter.mode,
      };
    }

    if (checkFilterValue(cityFilter)) {
      filters.cities = {
        data: cityFilter.value,
        mode: cityFilter.mode,
      };
    }

    if (checkFilterValue(countryFilter)) {
      filters.countries = {
        data: countryFilter.value,
        mode: countryFilter.mode,
      };
    }

    if (checkFilterValue(postTemplatesFilter)) {
      filters.post_templates = {
        data: postTemplatesFilter.value,
        mode: postTemplatesFilter.mode,
      };
    }
    if (checkFilterValue(jobTemplatesFilter)) {
      filters.job_templates = {
        data: jobTemplatesFilter.value,
        mode: jobTemplatesFilter.mode,
      };
    }

    if (checkFilterValue(contactAccountFilter)) {
      filters.contact_accounts = {
        data: contactAccountFilter.value,
        mode: contactAccountFilter.mode,
      };
    }
    if (checkFilterValue(innerClientFilter)) {
      filters.inner_clients = {
        data: innerClientFilter.value,
        mode: innerClientFilter.mode,
      };
    }
    if (publishedSiteFilter.value !== '' && publishedSiteFilter.value !== undefined) {
      filters.published_site = +publishedSiteFilter.value === 1 ? 'true' : 'false';
    }

    handleSetFilters(filters);
  };

  const clearFilters = () => {
    setPublishedSiteFilter({ value: '' });
    setPlannedDate(dateInitial);
    setPublishDate(dateInitial);
    setEndDate(dateInitial);
    setTranslationFilter({ value: [], mode: 'standard' });
    setJobAccountFilter({ value: [], mode: 'standard' });
    setPublished_byFilter({ value: [], mode: 'standard' });
    setAccountFilter({ value: [], mode: 'standard' });
    setCreatedByFilter({ value: [], mode: 'standard' });
    setStatusFilter({ value: [], mode: 'standard' });
    setCurrencyFilter({ value: [], mode: 'standard' });
    setCityFilter({ value: [], mode: 'standard' });
    setCountryFilter({ value: [], mode: 'standard' });
    setPostTemplatesFilter({ value: [], mode: 'standard' });
    setJobTemplatesFilter({ value: [], mode: 'standard' });
    setContactAccountFilter({ value: [], mode: 'standard' });
    setInnerClientFilter({ value: [], mode: 'standard' });
    setShiftsFilter({ value: [], mode: 'standard' });
  };

  useEffect(() => {
    generateFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    publishDate,
    plannedDate,
    endDate,
    jobAccountFilter,
    accountFilter,
    publishedByFilter,
    createdByFilter,
    statusFilter,
    currencyFilter,
    cityFilter,
    countryFilter,
    postTemplatesFilter,
    jobTemplatesFilter,
    contactAccountFilter,
    innerClientFilter,
    shiftsFilter,
    publishedSiteFilter,
    translationFilter,
  ]);

  useEffect(() => {
    if (queryFilter) {
      const filterSetter = filtersSetters?.[queryFilter?.name as keyof typeof filtersSetters];
      if (filterSetter instanceof Function) {
        filterSetter(queryFilter?.value);
      }
    }
  }, [queryFilter]);

  return (
    <FiltersDrawer
      title='Job Posts'
      visible={open}
      toggleFilters={toggleFilters}
      handleApplyFilters={handleApplyFilters}
      clearFilters={clearFilters}
      handleSetFilters={handleSetFilters}
    >
      <CustomCalendar
        label={'Planned date'}
        filter={plannedDate as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setPlannedDate)}
      />
      <CustomCalendar
        label='Publish date'
        filter={publishDate as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setPublishDate)}
      />
      <CustomCalendar
        label='End date'
        filter={endDate as IDateFilter}
        handleChangeFilter={createDateFilterHandler(setEndDate)}
      />
      <MultipleSelectFilter
        filter={publishedByFilter}
        label='Published By'
        options={publishedBy}
        handleChangeFilter={createFilterHandler(setPublished_byFilter)}
      />
      <MultipleSelectFilter
        filter={createdByFilter}
        label='Created By'
        options={publishedBy}
        handleChangeFilter={createFilterHandler(setCreatedByFilter)}
      />
      <MultipleSelectFilter
        filter={statusFilter}
        label='Status'
        options={statuses}
        handleChangeFilter={createFilterHandler(setStatusFilter)}
      />
      <MultipleSelectFilter
        filter={shiftsFilter}
        label='Shifts'
        options={shifts}
        handleChangeFilter={createFilterHandler(setShiftsFilter)}
      />
      <MultipleSelectFilter
        filter={currencyFilter}
        label='Currency'
        options={currencies}
        handleChangeFilter={createFilterHandler(setCurrencyFilter)}
      />
      <CountryCity
        countryFilter={countryFilter}
        cityFilter={cityFilter}
        countries={countries}
        cities={cities}
        countryFilterHandler={createFilterHandler(setCountryFilter)}
        cityFilterHandler={createFilterHandler(setCityFilter)}
      />
      <MultipleSelectFilter
        filter={postTemplatesFilter}
        label='Post Template'
        options={postTemplates}
        handleChangeFilter={createFilterHandler(setPostTemplatesFilter)}
      />
      <MultipleSelectFilter
        filter={jobTemplatesFilter}
        label='Job Template'
        options={jobTemplates}
        handleChangeFilter={createFilterHandler(setJobTemplatesFilter)}
      />
      <MultipleSelectFilter
        filter={accountFilter}
        label='Account'
        options={accounts}
        handleChangeFilter={createFilterHandler(setAccountFilter)}
      />
      <MultipleSelectFilter
        filter={innerClientFilter}
        label='Inner Client'
        options={innerClients}
        handleChangeFilter={createFilterHandler(setInnerClientFilter)}
      />
      <MultipleSelectFilter
        filter={jobAccountFilter}
        label='Job Account'
        options={jobAccounts}
        handleChangeFilter={createFilterHandler(setJobAccountFilter)}
      />
      <MultipleSelectFilter
        filter={translationFilter}
        label='Translations'
        options={languages}
        handleChangeFilter={createFilterHandler(setTranslationFilter)}
      />
      <MultipleSelectFilter
        filter={contactAccountFilter}
        label='Contact Account'
        options={contactAccounts}
        handleChangeFilter={createFilterHandler(setContactAccountFilter)}
      />
      <SingleSelectFilter
        label={'Published Site'}
        filter={publishedSiteFilter}
        options={availabilities ?? []}
        handleChangeFilter={createFilterHandler(setPublishedSiteFilter)}
      />
    </FiltersDrawer>
  );
}
