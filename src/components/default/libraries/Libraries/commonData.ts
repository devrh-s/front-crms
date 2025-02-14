import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  groups: 'libraries?is_group=1&perPage=-1&isCommon=1&isShort=1',
  groups_similar: 'libraries?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  entities: 'entities?is_group=1&perPage=-1&isCommon=1&isShort=1',
  statuses: 'statuses?perPage=-1&entity_name=libraries&block_name=Profile&isCommon=1&isShort=1',
  languages: 'languages?is_group=1&perPage=-1&isCommon=1&isShort=1',
  priorities: 'priorities?perPage=-1&isCommon=1&isShort=1',
  users: 'users?perPage=-1&isCommon=1&isShort=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
