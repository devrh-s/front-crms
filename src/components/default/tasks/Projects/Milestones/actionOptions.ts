const getSetMilestones = ({ milestones }: { [key: string]: any }) => ({ $set: milestones });

const getUpdateMilestones = ({ milestones }: { [key: string]: any }) => ({ $push: milestones });

const getDeleteMilestone = ({ milestoneInd }: { milestoneInd: number }) => ({
  $splice: [[milestoneInd, 1]],
});

const getMoveMilestone = ({
  sourceInd,
  destInd,
  elems,
}: {
  sourceInd: number;
  destInd: number;
  [key: string]: any;
}) => ({
  $splice: [
    [sourceInd, 1],
    [destInd, 0, elems[sourceInd]],
  ],
});

const getUpdateTasks = ({ milestoneInd, tasks }: { milestoneInd: number; [key: string]: any }) => ({
  [milestoneInd]: { tasks: { $push: tasks } },
});

const getDeleteTask = ({ milestoneInd, taskInd }: { milestoneInd: number; taskInd: number }) => ({
  [milestoneInd]: { tasks: { $splice: [[taskInd, 1]] } },
});

const getMoveTask = ({
  milestoneInd,
  sourceInd,
  destInd,
  elems,
}: {
  milestoneInd: number;
  sourceInd: number;
  destInd: number;
  [key: string]: any;
}) => ({
  [milestoneInd]: {
    tasks: {
      $splice: [
        [sourceInd, 1],
        [destInd, 0, elems[milestoneInd].tasks[sourceInd]],
      ],
    },
  },
});

const getUpdateSteps = ({
  milestoneInd,
  taskInd,
  steps,
}: {
  milestoneInd: number;
  taskInd: number;
  [key: string]: any;
}) => ({
  [milestoneInd]: {
    tasks: {
      [taskInd]: {
        steps: {
          $push: steps,
        },
      },
    },
  },
});

const getDeleteStep = ({
  milestoneInd,
  taskInd,
  stepInd,
}: {
  milestoneInd: number;
  taskInd: number;
  stepInd: number;
}) => ({
  [milestoneInd]: {
    tasks: {
      [taskInd]: {
        steps: {
          $splice: [[stepInd, 1]],
        },
      },
    },
  },
});

const getMoveStep = ({
  milestoneInd,
  sourceInd,
  destInd,
  taskInd,
  elems,
}: {
  milestoneInd: number;
  taskInd: number;
  sourceInd: number;
  destInd: number;
  [key: string]: any;
}) => ({
  [milestoneInd]: {
    tasks: {
      [taskInd]: {
        steps: {
          $splice: [
            [sourceInd, 1],
            [destInd, 0, elems[milestoneInd].tasks[taskInd].steps[sourceInd]],
          ],
        },
      },
    },
  },
});

const getUpdateChecklists = ({
  milestoneInd,
  taskInd,
  stepInd,
  checklists,
}: {
  [key: string]: any;
}) => ({
  [milestoneInd]: {
    tasks: {
      [taskInd]: {
        steps: {
          [stepInd]: {
            checklists: {
              $push: checklists,
            },
          },
        },
      },
    },
  },
});

const getDeleteChecklist = ({
  stepInd,
  taskInd,
  milestoneInd,
  checklistInd,
}: {
  taskInd: number;
  stepInd: number;
  milestoneInd: number;
  checklistInd: number;
}) => ({
  [milestoneInd]: {
    tasks: {
      [taskInd]: {
        steps: {
          [stepInd]: {
            checklists: {
              $splice: [[checklistInd, 1]],
            },
          },
        },
      },
    },
  },
});

const getMoveChecklist = ({
  taskInd,
  stepInd,
  milestoneInd,
  sourceInd,
  destInd,
  elems,
}: {
  milestoneInd: number;
  taskInd: number;
  stepInd: number;
  sourceInd: number;
  destInd: number;
  [key: string]: any;
}) => ({
  [milestoneInd]: {
    tasks: {
      [taskInd]: {
        steps: {
          [stepInd]: {
            checklists: {
              $splice: [
                [sourceInd, 1],
                [
                  destInd,
                  0,
                  elems[milestoneInd].tasks[taskInd].steps[stepInd].checklists[sourceInd],
                ],
              ],
            },
          },
        },
      },
    },
  },
});

export default {
  getSetMilestones,
  getUpdateMilestones,
  getDeleteMilestone,
  getMoveMilestone,
  getUpdateTasks,
  getMoveTask,
  getDeleteTask,
  getUpdateSteps,
  getMoveStep,
  getDeleteStep,
  getUpdateChecklists,
  getMoveChecklist,
  getDeleteChecklist,
};
