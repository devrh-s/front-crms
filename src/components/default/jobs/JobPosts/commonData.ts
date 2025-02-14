import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  job_accounts: 'job-accounts?perPage=-1&isShort=1&isCommon=1',
  accounts: 'accounts?perPage=-1&isShort=1&isCommon=1',
  users: 'users?perPage=-1&isShort=1&isCommon=1',
  statuses: 'statuses?perPage=-1&entity_name=job_posts&block_name=Profile&isShort=1&isCommon=1',
  countries: 'countries?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  cities: 'cities?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  post_templates: 'post-templates?perPage=-1&isShort=1&isCommon=1',
  job_templates: 'job-templates?perPage=-1&isShort=1&isCommon=1',
  post_templates_full: {
    url: 'post-templates?perPage=-1',
    isFull: true,
  },
  currencies: 'currencies?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  inner_clients: 'inner-clients?perPage=-1&isShort=1&isCommon=1',
  shifts: 'shifts?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  languages: 'languages?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
