import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  checklist_items: 'checklist-items?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  guides: 'guides?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  actions: 'actions?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  objects: 'objects?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  tools:
    'tools?is_group_similar=1&perPage=-1&entity_name=step_templates&block_name=Profile&isShort=1&isCommon=1',
  placements: 'placements?perPage=-1&isCommon=1&isShort=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
