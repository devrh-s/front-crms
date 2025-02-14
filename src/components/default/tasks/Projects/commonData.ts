import { apiCommonData } from '@/lib/fetch';

export const commonDataBlocks = {
  project_templates: 'project-templates?perPage=-1&isShort=1&isCommon=1',
  task_templates: 'task-templates?perPage=-1&isShort=1&isCommon=1',
  milestone_templates: 'milestone-templates?perPage=-1&isShort=1&isCommon=1',
  checklist_items: 'checklist-items?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  step_templates: 'step-templates?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  users: 'users?perPage=-1&isShort=1&isCommon=1',
  inner_clients: 'inner-clients?perPage=-1&isShort=1&isCommon=1',
  statuses: 'statuses?perPage=-1&entity_name=tasks&block_name=Profile&isShort=1&isCommon=1',
  priorities: 'priorities?is_group_similar=1&perPage=-1&isShort=1&isCommon=1',
  tasks: 'tasks?perPage=-1&isShort=1&isCommon=1',
  professions: 'professions?is_group_similar=1&perPage=-1&isCommon=1&isShort=1',
  placements: 'placements?perPage=-1&isCommon=1&isShort=1',
};

export const getCommonData = () => apiCommonData(commonDataBlocks);
