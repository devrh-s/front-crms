import { GridPaginationModel } from '@mui/x-data-grid';
import { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { ICVInput } from '../../common/form/CVInputs/CVInputs';
import { ICommentInputs } from '../../common/form/CommentsInputs/CommentsInput';
import { ICommunicationInput } from '../../common/form/CommunicationInputs/CommunicationInputs';
import { IContactInput } from '../../common/form/ContactInputs/ContactInputs';
import { IContentInput } from '../../common/form/ContentInputs/ContentInputs';
import { ILanguageLevelInput } from '../../common/form/LanguageLevelInputs/LanguageLevelInputs';
import { INameInput } from '../../common/form/NameInputs/NameInputs';
import { IProfessionInput } from '../../common/form/ProfessionInputs/ProfessionInputs';
import { IRateInput } from '../../common/form/RateInputs/RateInputs';
import { ISalaryInput } from '../../common/form/SalaryInputs/SalaryInputs';

export interface IViewProps {
  rows: Array<ICandidateShort>;
  view: string;
  searchValue: string;
  loading?: boolean;
  pagePermissions: { [permission: string]: string };
  cardsStorageActive: boolean;
  currentUser?: IOption;
  handleCardsStorage: (value: boolean) => void;
  toggleFilters: (open: boolean) => (event: KeyboardEvent | MouseEvent) => void;
  handleChangeView: (_: MouseEvent<HTMLElement>, newView: string) => void;
  handleDeleteModal: (open: boolean, ids?: number[] | null) => void;
  handleActions: (visible: boolean, id?: number | null) => void;
  handleSearch: (e: ChangeEvent<HTMLInputElement>) => void;
  paginationModel: GridPaginationModel;
  handlePagination: (newPaginationModel: GridPaginationModel) => void;
  commonData?: ICommonData;
  isSmall?: boolean | undefined;
  handleActionsEmployee: (visible: boolean, id?: number | null) => void;
  handleActionsPresale: (visible: boolean, id?: number | null) => void;
}
export interface IFormInputs {
  user_id?: number;
  names: INameInput[];
  short_name: string;
  slug: string;
  country_id?: number;
  city_id?: number;
  gender: 'unknown' | 'female' | 'male';
  is_student: number;
  birthday: string;
  age: string | number;
  talents: ITalentInput;
  languages: ILanguageLevelInput[];
  cvs: ICVInput[];
  contacts: IContactInput[];
  contents: IContentInput[];
  reason: string;
}

export interface ITalentInput {
  id?: number;
  shift_id?: number;
  inner_client_id?: number;
  status_id?: number;
  task_templates: number[];
  tools: number[];
  links: [];
  managers: number[];
  objects: [];
  professions: IProfessionInput[];
  rates: IRateInput[];
  salaries: ISalaryInput[];
  communications: ICommunicationInput[];
  comments: ICommentInputs[];
}
export interface ICandidateActionsProps {
  id: number | null;
  visible: boolean;
  isProfile?: boolean;
  isFromJobApplications?: boolean;
  commonData: ICommonData;
  isDuplicate?: boolean;
  handleActions: (visible: boolean, id?: number | null) => void;
}
