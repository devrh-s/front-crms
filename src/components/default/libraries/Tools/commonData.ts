import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  tool_types: 'tool-types?is_group=1&perPage=-1&isShort=1&isCommon=1',
  blocks: 'blocks?is_group=1&perPage=-1&isShort=1&isCommon=1',
  entities: 'entities?is_group=1&perPage=-1&isShort=1&isCommon=1',
  entity_block: 'entity-blocks?is_group=1&perPage=-1&isShort=1&isCommon=1',
  guides: 'guides?is_group=1&perPage=-1&isShort=1&isCommon=1',
  links: 'links?is_group=1&perPage=-1&isShort=1&isCommon=1',
  task_templates: 'task-templates?perPage=-1&isShort=1&isCommon=1&is_group=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
