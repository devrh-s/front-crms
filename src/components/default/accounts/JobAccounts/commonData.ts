import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  job_sites: 'job-sites?perPage=-1&isShort=1&isCommon=1',
  // job_sites: {
  //   url: 'job-sites?perPage=-1&isShort=1',
  //   isFull: true,
  // },
  statuses: 'statuses?perPage=-1&entity_name=job_accounts&block_name=Profile&isShort=1&isCommon=1',
  inner_clients: 'inner-clients?perPage=-1&isShort=1&isCommon=1',
  users: 'users?perPage=-1&isShort=1&isCommon=1',
  verification_accounts: 'accounts?perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
