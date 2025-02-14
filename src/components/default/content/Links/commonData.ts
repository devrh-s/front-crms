import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  tools:
    'tools?perPage=-1&is_group_similar=1&entity_name=links&block_name=Profile&isShort=1&isCommon=1',
  inner_clients: 'inner-clients?perPage=-1&isCommon=1&isShort=1',
  objects: 'objects?perPage=-1&isCommon=1&isShort=1',
  accounts: 'accounts?perPage=-1&isCommon=1&isShort=1',
  users: 'users?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  statuses: 'statuses?perPage=-1&entity_name=links&block_name=Profile&isShort=1&isCommon=1',
  formats: 'formats?perPage=-1&isCommon=1&isShort=1',
  professions: 'professions?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  destinations: 'destinations?perPage-1&isShort=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
