import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  job_applications: 'job-applications?perPage=-1&isShort=1&isCommon=1',
  accounts: 'accounts?perPage=-1&isShort=1&isCommon=1',
  tools:
    'tools?entity_name=job_applications&block_name=Contacts&is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  communication_types: 'communication-types?perPage=-1&isShort=1&isCommon=1',
  users: 'users?perPage=-1&isShort=1&isCommon=1',
  messages:
    'messages?entity_name=job_applications&block_name=Communications&perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
