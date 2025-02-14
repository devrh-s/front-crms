import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  guides: 'guides?perPage=-1&isShort=1&isCommon=1',
  tools: 'tools?entity_name=guides&block_name=Profile&perPage=-1&isShort=1&isCommon=1',
  objects: 'objects?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  formats: 'formats?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  statuses: 'statuses?isShort=1&perPage=-1&entity_name=guides&block_name=Profile',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
