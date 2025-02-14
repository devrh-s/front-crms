import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  statuses: 'statuses?perPage=-1&entity_name=departments&block_name=Profile&isCommon=1&isShort=1',
  languages: 'languages?is_group=1&perPage=-1&isCommon=1&isShort=1',
  groups: 'departments?is_group=1&perPage=-1&isCommon=1&isShort=1',
  groups_similar: 'departments?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  priorities: 'priorities?perPage=-1&isCommon=1&isShort=1',
  professions: 'professions?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  users: 'users?perPage=-1&isCommon=1&isShort=1',
  links: 'links?is_group=1&perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
