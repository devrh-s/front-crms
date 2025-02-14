import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  statuses: 'statuses?perPage=-1&entity_name=industries&block_name=Profile&isCommon=1&isShort=1',
  languages: 'languages?is_group=1&perPage=-1&isCommon=1&isShort=1',
  groups: 'industries?is_group=1&perPage=-1&isCommon=1&isShort=1',
  groups_similar: 'industries?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  priorities: 'priorities?perPage=-1&isCommon=1&isShort=1',
  sub_industries: 'sub-industries?is_group=1&perPage=-1&isCommon=1&isShort=1',
  users: 'users?perPage=-1&isCommon=1&isShort=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
