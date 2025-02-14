'use client';
import useActions from '@/hooks/useActions';
import useFilters from '@/hooks/useFilters';
import { apiGetData } from '@/lib/fetch';
import { getAppSearchParams } from '@/lib/helpers';
import GroupIcon from '@mui/icons-material/Group';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import LanguageIcon from '@mui/icons-material/Language';
import PublicIcon from '@mui/icons-material/Public';
import { Grid, Theme, useMediaQuery } from '@mui/material';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import CustomToolbar from '../../common/UI/CustomToolbar/CustomToolbar';
import ChartContainer from './ChartContainer';
import JobDashboardFilter from './JobDashboardFilter';
import TotalBlock from './TotalBlock';

export default function JobDashboard() {
  const {
    filters,
    filtersOpen,
    applyFilters,
    handleApplyFilters,
    toggleFilters,
    handleSetFilters,
  } = useFilters();
  const { handleActions } = useActions();
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const { data: dashboard } = useQuery({
    queryKey: ['job-dashboard', { applyFilters }],
    queryFn: async () => {
      const searchParams = getAppSearchParams({ filters });
      const response = await apiGetData(`job-dashboard?${searchParams}`);
      return response;
    },
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  if (!dashboard?.data) {
    return null;
  }

  return (
    <Grid container spacing={2} sx={{ overflowY: 'hidden', padding: 2 }}>
      <Grid item xs={12}>
        <CustomToolbar
          toggleFilters={toggleFilters}
          handleActions={handleActions}
          availableAdd={false}
          pageName='Dashboard'
          hideToolbarViewToggle
          hideToolbarSearch
        />
      </Grid>

      <Grid item container xs={12} spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TotalBlock
            icon={<PublicIcon sx={{ fontSize: 56 }} color='primary' />}
            title='Countries'
            total={dashboard?.data.countries.length}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TotalBlock
            icon={<LanguageIcon sx={{ fontSize: 56 }} color='primary' />}
            title='Languages'
            total={dashboard?.data.languages.length}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TotalBlock
            icon={<GroupIcon sx={{ fontSize: 56 }} color='primary' />}
            title='Users'
            total={dashboard?.data.users.length}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TotalBlock
            icon={<InsertChartIcon sx={{ fontSize: 56 }} color='primary' />}
            title='Total'
            total={
              dashboard?.data.countries.length +
              dashboard?.data.languages.length +
              dashboard?.data.users.length
            }
          />
        </Grid>
      </Grid>

      <Grid item container xs={12} spacing={2} flexWrap={mdDown ? 'wrap' : 'nowrap'}>
        <Grid item xs={12} md={6}>
          <ChartContainer
            title='countries'
            label='country'
            chartData={dashboard?.data}
            toggles={['job_applications', 'job_posts', 'job_sites']}
            isLine
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartContainer
            title='languages'
            label='language'
            chartData={dashboard?.data}
            toggles={['job_templates', 'job_posts', 'job_sites']}
          />
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <ChartContainer
          title='users'
          label='user'
          chartData={dashboard?.data}
          toggles={[
            'job_applications',
            'job_posts',
            'job_sites',
            'job_accounts',
            'job_requests',
            'job_templates',
          ]}
          isHorizontal
          isStack
        />
      </Grid>

      <JobDashboardFilter
        handleSetFilters={handleSetFilters}
        open={filtersOpen}
        toggleFilters={toggleFilters}
        handleApplyFilters={handleApplyFilters}
      />
    </Grid>
  );
}
