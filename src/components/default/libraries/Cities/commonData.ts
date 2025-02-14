import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  countries: 'countries?is_group=1&perPage=-1&isCommon=1&isShort=1',
  groups: 'cities?is_group=1&perPage=-1&isShort=1&isCommon=1',
  groups_similar: 'cities?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  statuses: 'statuses?perPage=-1&entity_name=cities&block_name=Profile&isShort=1&isCommon=1',
  languages: 'languages?is_group=1&perPage=-1&isShort=1&isCommon=1',
  priorities: 'priorities?perPage=-1&isShort=1&isCommon=1',
  users: 'users?perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
