import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  frequencies: 'frequencies?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  actions: 'actions?perPage=-1&isShort=1&isCommon=1',
  objects: 'objects?perPage=-1&isShort=1&isCommon=1',
  professions: 'professions?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  task_templates: 'task-templates?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  step_templates: 'step-templates?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  checklist_items: 'checklist-items?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  users: 'users?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
