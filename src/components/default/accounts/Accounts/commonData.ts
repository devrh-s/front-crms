import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  inner_clients: 'inner-clients?perPage=-1&isShort=1&isCommon=1',
  users: 'users?perPage=-1&isShort=1&isCommon=1',
  accounts: 'accounts?perPage=-1&isShort=1&isCommon=1',
  tools:
    'tools?perPage=-1&is_group_similar=1&entity_name=accounts&block_name=Profile&isShort=1&isCommon=1',
  statuses: 'statuses?perPage=-1&entity_name=accounts&block_name=Profile&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
