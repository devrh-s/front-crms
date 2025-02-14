import update from 'immutability-helper';
import { uniqueId } from 'lodash';

const defaultChecklist = {
  name: '',
  guides: [],
};

export default (checklistItems: any, action: any) => {
  switch (action.type) {
    case 'addNewChecklist': {
      const { checklistInd, newChecklistitem } = action.payload;

      checklistItems = [
        ...checklistItems,
        newChecklistitem ?? { ...defaultChecklist, id: uniqueId() },
      ];
      return checklistItems;
    }
    case 'deleteChecklist': {
      const { checklistInd } = action.payload;
      checklistItems = update(checklistItems, {
        $splice: [
          [checklistInd, 1],
          [checklistInd, 0],
        ],
      });
      return checklistItems;
    }
    case 'clearChecklists': {
      return [];
    }
    case 'setChecklists': {
      return action.payload;
    }
    case 'moveChecklist': {
      const { sourceIndex, destIndex } = action.payload;
      checklistItems = update(checklistItems, {
        $splice: [
          [sourceIndex, 1],
          [destIndex, 0, checklistItems[sourceIndex]],
        ],
      });
      return checklistItems;
    }

    default:
      throw Error('Unknown action: ' + action.type);
  }
};
