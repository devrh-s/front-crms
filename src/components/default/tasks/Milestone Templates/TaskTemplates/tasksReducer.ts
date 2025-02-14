import update from 'immutability-helper';

const tasksReducer = (tasks: ITaskTemplate[], action: { type: string; payload: any }) => {
  switch (action.type) {
    case 'setTaskTemplates': {
      return action.payload;
    }
    case 'addNewTaskTemplate': {
      const newTaskTemplate = action.payload;
      return newTaskTemplate ? [...tasks, newTaskTemplate] : tasks;
    }
    case 'deleteTaskTemplate': {
      const { taskInd } = action.payload;
      return update(tasks, {
        $splice: [[taskInd, 1]],
      });
    }
    case 'clearTaskTemplates': {
      return [];
    }
    case 'moveTaskTemplate': {
      const { sourceIndex, destIndex } = action.payload;
      return update(tasks, {
        $splice: [
          [sourceIndex, 1],
          [destIndex, 0, tasks[sourceIndex]],
        ],
      });
    }
    case 'addNewStepTemplate': {
      const { taskInd, newStepTemplate } = action.payload;
      return update(tasks, {
        [taskInd]: {
          step_templates: {
            $push: [newStepTemplate],
          },
        },
      });
    }
    case 'deleteStepTemplate': {
      const { taskInd, stepInd } = action.payload;
      return update(tasks, {
        [taskInd]: {
          step_templates: {
            $splice: [[stepInd, 1]],
          },
        },
      });
    }
    case 'moveStepTemplate': {
      const { sourceIndex, destIndex, taskInd } = action.payload;
      return update(tasks, {
        [taskInd]: {
          step_templates: {
            $splice: [
              [sourceIndex, 1],
              [destIndex, 0, tasks[taskInd].step_templates[sourceIndex]],
            ],
          },
        },
      });
    }
    case 'addNewChecklistItem': {
      const { taskInd, stepInd, newChecklistItem } = action.payload;
      return update(tasks, {
        [taskInd]: {
          step_templates: {
            [stepInd]: {
              checklist_items: {
                $push: [newChecklistItem],
              },
            },
          },
        },
      });
    }
    case 'deleteChecklistItem': {
      const { taskInd, stepInd, checklistInd } = action.payload;
      return update(tasks, {
        [taskInd]: {
          step_templates: {
            [stepInd]: {
              checklist_items: {
                $splice: [[checklistInd, 1]],
              },
            },
          },
        },
      });
    }
    case 'moveChecklistItem': {
      const { sourceIndex, destIndex, taskInd, stepInd } = action.payload;
      return update(tasks, {
        [taskInd]: {
          step_templates: {
            [stepInd]: {
              checklist_items: {
                $splice: [
                  [sourceIndex, 1],
                  [
                    destIndex,
                    0,
                    tasks[taskInd].step_templates[stepInd].checklist_items[sourceIndex],
                  ],
                ],
              },
            },
          },
        },
      });
    }
    default:
      throw Error('Unknown action: ' + action.type);
  }
};

export default tasksReducer;
