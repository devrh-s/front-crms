import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  task_templates: {
    url: 'task-templates?is_group_similar=1&perPage=-1',
    isFull: true,
  },
  users: 'users?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  tasks: 'tasks?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  priorities: 'priorities?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  professions: 'professions?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  statuses: 'statuses?perPage=-1&entity_name=tasks&block_name=Profile&isShort=1&isCommon=1',
  inner_clients: 'inner-clients?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  checklist_items: 'checklist-items?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  step_templates: 'step-templates?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  tools:
    'tools?perPage=-1&is_group_similar=1&entity_name=tasks&block_name=Profile&isShort=1&isCommon=1',
  objects: 'objects?perPage=-1&isShort=1&isCommon=1',
  entities: 'entities?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  edits: 'edits?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  formats: 'formats?perPage=-1&isShort=1&isCommon=1',
  placements: 'placements?perPage=-1&isCommon=1&isShort=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
