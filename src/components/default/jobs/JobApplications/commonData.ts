import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  job_posts: {
    url: 'job-posts?is_group_similar=1&perPage=-1',
    isFull: true,
  },
  countries: 'countries?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  cities: 'cities?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  users: 'users?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  statuses:
    'statuses?perPage=-1&entity_name=job_applications&block_name=Profile&isShort=1&isCommon=1',
  // job_posts: 'job-posts?is_group=1&perPage=-1&isShort=1&isCommon=1',
  job_requests: 'job-requests?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  job_templates: 'job-templates?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  accounts: 'accounts?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  communication_types: 'communication-types?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  tools:
    'tools?perPage=-1&is_group_similar=1&entity_name=job_applications&block_name=Contacts&isShort=1&isCommon=1',
  messages: 'messages?perPage=-1&isShort=1&isCommon=1',
  professions: 'professions?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  job_accounts: 'job-accounts?perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
