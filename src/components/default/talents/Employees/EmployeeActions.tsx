'use client';
import ActionsDrawer from '@/components/default/common/drawers/ActionsDrawer/ActionsDrawer';
import ContactInputs, {
  IContactInput,
} from '@/components/default/common/form/ContactInputs/ContactInputs';
import ContentInputs, {
  getDefaultContent,
  IContentInput,
} from '@/components/default/common/form/ContentInputs/ContentInputs';
import CustomLabel from '@/components/default/common/form/CustomLabel/CustomLabel';
import CustomSelect from '@/components/default/common/form/CustomSelect/CustomSelect';
import CustomSingleSelect from '@/components/default/common/form/CustomSingleSelect/CustomSingleSelect';
import CVInputs, {
  getDefaultCVs,
  ICVInput,
} from '@/components/default/common/form/CVInputs/CVInputs';
import DateInput from '@/components/default/common/form/DateInput/DateInput';
import LanguageLevelInputs, {
  getDefaultLanguage,
  ILanguageLevelInput,
} from '@/components/default/common/form/LanguageLevelInputs/LanguageLevelInputs';
import MultiInputGroup, {
  IRenderInputsProps,
} from '@/components/default/common/form/MultiInputGroup/MultiInputGroup';
import NameInputs, { INameInput } from '@/components/default/common/form/NameInputs/NameInputs';
import ProfessionInputs, {
  getDefaultProfession,
  IProfessionInput,
} from '@/components/default/common/form/ProfessionInputs/ProfessionInputs';
import RateInputs, {
  getDefaultRate,
  IRateInput,
} from '@/components/default/common/form/RateInputs/RateInputs';
import TalentPriceInputs, {
  getDefaultPrice,
  IPriceInput,
} from '@/components/default/common/form/TalentPriceInputs/TalentPriceInputs';
import CountryCity from '@/components/default/common/related/actions/CountryCity/CountryCity';
import { genders } from '@/components/default/talents/Employees/Employees';
import useAgeAndBirthdayCalculator from '@/hooks/useAgeAndBirthdayCalculator';
import useBookmarks, { BookmarkName } from '@/hooks/useBookmarks';
import useNotification from '@/hooks/useNotification';
import { apiGetData, apiSetData, apiUpdateData } from '@/lib/fetch';
import { CircularProgress, Stack, TextField, Theme, useMediaQuery } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CommentInputs, {
  getDefaultComments,
  ICommentInputs,
} from '../../common/form/CommentsInputs/CommentsInput';
import CommunicationInputs from '../../common/form/CommunicationInputs/CommunicationInputs';
import SalaryInputs, {
  getDefaultSalary,
  ISalaryInput,
} from '../../common/form/SalaryInputs/SalaryInputs';
import { defaultJACommunication } from '../../jobs/JobApplications/JobApplicationActions';
import { getCommonData } from './commonData';
import { EmployeeFields, IActionsProps, IFormInputs, IRenderInput, ITalentInput } from './types';

const getDefaultTalent = (): ITalentInput => ({
  shift_id: undefined,
  inner_client_id: undefined,
  status_id: undefined,
  task_templates: [],
  tools: [],
  links: [],
  managers: [],
  objects: [],
  professions: [],
  rates: [],
  salaries: [],
  prices: [],
  comments: [],
  communications: [],
  contract_url: '',
});

const getDefaultFormInputs = (): IFormInputs => ({
  user_id: undefined,
  names: [{ name: '', translation_id: 1 }],
  short_name: '',
  slug: '',
  city_id: undefined,
  country_id: undefined,
  is_student: 0,
  gender: 'unknown',
  birthday: '',
  age: '',
  talents: getDefaultTalent(),
  languages: [],
  cvs: [],
  contacts: [],
  contents: [],
  reason: '',
  tools: [],
});

const getDefaultNames = (): INameInput => ({
  name: '',
  translation_id: undefined,
});

const getDefaultContact = (): IContactInput => ({
  value: '',
  tool_id: undefined,
});

const bookmarkErrorRelations: { [key in BookmarkName]?: string[] } = {
  profile: [
    'user_id',
    'name',
    'short_name',
    'slug',
    'country_id',
    'city_id',
    'gender',
    'is_student',
    'birthday',
    'talents',
  ],
  profession: ['talents.professions'],
  rate: ['talents.rates'],
  salary: ['talents.salaries'],
  language: ['languages'],
  cv: ['cvs'],
  contact: ['contacts'],
  content: ['contents'],
  price: ['talents.prices'],
  comment: ['comments'],
  communication: ['communications'],
};

export default function EmployeeActions({
  id,
  commonData: commonDataProps,
  visible,
  isProfile = false,
  handleActions,
  isFromJobApplications = false,
  isFromCandidates = false,
  isFromPresales = false,
  isDuplicate = false,
  queryKey,
}: IActionsProps) {
  const showNotification = useNotification();
  const searchParams = useSearchParams();
  const addLibrary = searchParams.get('add-library');
  const [fullScreen, setFullScreen] = useState(false);
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  const {
    activeBookmark,
    changeActiveBookmark,
    getBookmarkErrorName,
    toggleBookmarkError,
    bookmarks,
  } = useBookmarks(
    [
      'profile',
      'profession',
      'rate',
      'salary',
      'price',
      'language',
      'cv',
      'contact',
      'content',
      'comment',
      'communication',
    ],
    visible
  );
  const [creationInfo, setCreationInfo] = useState<ICreationInfo | null>(null);
  const {
    register,
    reset,
    control,
    setValue,
    getValues,
    clearErrors,
    setError,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IFormInputs>({
    defaultValues: getDefaultFormInputs(),
  });

  const chanelOptions = watch('contacts')?.map((con) => {
    const tool = commonDataProps?.tools?.find((tool) => tool.id === con.tool_id);
    return {
      id: tool?.id || '',
      name: `${con.value} (${tool?.name})`,
    };
  });

  const isMoved = isFromJobApplications || isFromCandidates || isFromPresales;

  const clearData = () => reset(getDefaultFormInputs());

  const fullScreenHandler = () => setFullScreen(!fullScreen);

  const hideHandler = (clearOnClose: boolean = true) => {
    if (clearOnClose || isDuplicate) {
      clearData();
    }
    handleActions(false);
    setCreationInfo(null);
  };

  const handleErrors = (errors: any, status: number) => {
    for (const [key, value] of Object.entries(errors)) {
      const errorKey = key as EmployeeFields;
      const errorValues = value as string[];
      const error = {
        message: errorValues[0],
      };
      showNotification(`${status}: ${errorValues[0]}`, 'error');
      setError(errorKey, error);
    }
    const bookmarkErrorName = getBookmarkErrorName(bookmarkErrorRelations, Object.keys(errors));
    const [nextBookmark] = bookmarkErrorName;
    toggleBookmarkError(bookmarkErrorName);
    if (activeBookmark !== nextBookmark) {
      changeActiveBookmark(nextBookmark);
    }
  };

  const queryClient = useQueryClient();

  const getEndpointForCreate = (
    id: string | number | null,
    isFromCandidates: boolean,
    isFromPresales: boolean
  ) => {
    if (isFromCandidates) return `candidates/${id}/employees`;
    if (isFromPresales) return `presales/${id}/employees`;
    return 'employees';
  };

  const getQueryKey = (
    id: string | number | null,
    isFromJobApplications: boolean,
    isFromCandidates: boolean,
    isFromPresales: boolean
  ) => {
    if (isFromJobApplications) return ['job-application', id];
    if (isFromCandidates) return ['candidate', id];
    if (isFromPresales) return ['presale', id];
    return ['employee', id];
  };

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      apiSetData(getEndpointForCreate(id, isFromCandidates, isFromPresales), data),

    onSuccess: (result) => {
      if (result.success) {
        if (isFromCandidates) {
          queryClient.invalidateQueries({
            queryKey: [isProfile ? 'candidate' : 'candidates'],
          });
        }
        if (isFromPresales) {
          queryClient.invalidateQueries({
            queryKey: [isProfile ? 'presale' : 'presales'],
          });
        }
        if (isFromJobApplications) {
          queryClient.invalidateQueries({
            queryKey: [isProfile ? 'job-application' : 'job-applications'],
          });
        }
        if (!queryKey) {
          queryClient.invalidateQueries({
            queryKey: [isProfile ? 'employee' : 'employees'],
          });
        }

        hideHandler();
        showNotification('Successfully created', 'success');
        if (addLibrary) window.close();
      }
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      if (status === 422) {
        handleErrors(error, status);
      } else {
        showNotification(`${status}: Something went wrong`, 'error');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiUpdateData(`employees/${id}`, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: [isProfile ? 'employee' : 'employees'],
        });
        hideHandler();
        showNotification('Successfully updated', 'success');
        if (addLibrary) window.close();
      }
    },
    onError: (responseError: ResponseError) => {
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      if (status === 422) {
        handleErrors(error, status);
      } else {
        showNotification(`${status}: Something went wrong`, 'error');
      }
    },
  });

  const [isUniqueCheckLoading, setIsUniqueCheckLoading] = useState(false);

  const checkUniqueMutation = useMutation({
    mutationFn: (data: any) => {
      setIsUniqueCheckLoading(true);
      return apiSetData(data.url, {
        ...(typeof id === 'number' && { person_id: id }),
        ...data.data,
      });
    },
    onSuccess: () => {
      setIsUniqueCheckLoading(false);
    },
    onError: (responseError: ResponseError) => {
      setIsUniqueCheckLoading(false);
      const status = responseError?.status;
      const { error } = responseError.response?.data;
      if (status === 422) {
        handleErrors(error, status);
      } else {
        showNotification(`${status}: Something went wrong`, 'error');
      }
    },
  });

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    const { talents, names, languages, cvs, contacts, contents, ...other } = data;
    const sendData = {
      ...other,
      birthday: other?.birthday ? dayjs(data.birthday).format('DD-MM-YYYY') : null,
      age: !data.birthday ? data?.age : '',
      names,
      talents: {
        ...talents,

        rates:
          talents?.rates?.map((item) => ({
            ...item,
            start_date: item.start_date ? dayjs(item.start_date).format('DD-MM-YYYY') : null,
            end_date: item.end_date ? dayjs(item.end_date).format('DD-MM-YYYY') : null,
          })) ?? [],
        communications: talents?.communications?.map((el: any, index: number) => {
          const chanel = chanelOptions?.find((chanel) => chanel.id === el.channel);
          return {
            ...el,
            channel: {
              tool_id: chanel?.id,
              value: chanel?.name.match(/^(.*?)(?=\s*\()/)?.[1].trim(),
            },
            followup_date: dayjs(el?.followup_date).format('DD-MM-YYYY'),
            followup_time: dayjs(el?.followup_time, 'HH:mm:ss').format('HH:mm:ss'),
          };
        }),
        salaries:
          talents?.salaries?.map((item) => ({
            ...item,
            start_date: item.start_date ? dayjs(item.start_date).format('DD-MM-YYYY') : null,
            end_date: item.end_date ? dayjs(item.end_date).format('DD-MM-YYYY') : null,
          })) ?? [],
        prices:
          talents?.prices?.map((item) => ({
            ...item,
            start_date: item.start_date ? dayjs(item.start_date).format('DD-MM-YYYY') : null,
            end_date: item.end_date ? dayjs(item.end_date).format('DD-MM-YYYY') : null,
          })) ?? [],
        comments:
          talents?.comments.map((item: IComments) => ({
            ...item,
            date: item.date ? dayjs(item.date).format('DD-MM-YYYY') : null,
          })) ?? [],
      },
      languages: languages || [],
      cvs:
        cvs?.map((item, index) => ({
          ...item,
          start_date: item.start_date ? dayjs(item.start_date).format('DD-MM-YYYY') : null,
          end_date: item.end_date ? dayjs(item.end_date).format('DD-MM-YYYY') : null,
        })) ?? [],
      contacts: contacts || [],
      contents: contents || [],
    };

    if (id && !isDuplicate) {
      if (isFromJobApplications) {
        createMutation.mutate({ ...sendData, job_application_id: id });
      } else if (isFromCandidates) {
        createMutation.mutate({
          ...sendData,
          candidate_id: id,
        });
      } else if (isFromPresales) {
        createMutation.mutate({
          ...sendData,
          presale_id: id,
        });
      } else {
        updateMutation.mutate(sendData);
      }
    } else {
      createMutation.mutate(sendData);
    }
  };

  const submitHandler = handleSubmit(onSubmit);

  const submitForm = (e: FormEvent) => {
    e.preventDefault();
    clearErrors();
    submitHandler();
  };

  const getEndpoint = (
    id: string | number | null,
    isFromJobApplications: boolean,
    isFromCandidates: boolean,
    isFromPresales: boolean
  ) => {
    if (isFromJobApplications) return `job-applications/${id}`;
    if (isFromCandidates) return `candidates/${id}`;
    if (isFromPresales) return `presales/${id}`;
    return `employees/${id}`;
  };

  const { data, isFetching, refetch } = useQuery({
    queryKey: getQueryKey(id, isFromJobApplications, isFromCandidates, isFromPresales),
    queryFn: async () => {
      const response = await apiGetData(
        getEndpoint(id, isFromJobApplications, isFromCandidates, isFromPresales)
      );
      return response.data;
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const { handleBirthdayChange, handleAgeChange } = useAgeAndBirthdayCalculator({
    setValue,
    isEdit: !!data,
  });

  useEffect(() => {
    if (!data) {
      setValue(
        'talents.status_id',
        (commonData?.statuses?.find((status: any) => status.is_default === 1)?.id as number) ?? ''
      );
      return;
    }
    if (isFromJobApplications) {
      //------------ from job application ------------
      reset({
        ...getDefaultFormInputs(),
        names: [{ name: data?.name }],
        short_name: data?.name,
        gender: data?.gender,
        city_id: data?.city?.city_id,
        talents: {
          ...getDefaultTalent(),
          managers: data?.manager ? [data?.manager?.id] : [],
        },
        contacts:
          data?.contacts?.map(
            (item: any): IContactInput => ({
              id: item?.id,
              value: item?.value,
              tool_id: item?.tool?.id,
            })
          ) ?? [],
      });
    } else if (isFromCandidates) {
      //------------ from candidates ------------
      reset({
        ...getDefaultFormInputs(),
        user_id: data?.user?.id,
        names: data?.names?.map(
          (item: any): INameInput => ({
            id: item?.id,
            name: item?.name,
            translation_id: item?.translation?.language_id,
          })
        ),
        short_name: data?.short_name,
        slug: data?.slug,
        gender: data?.gender,
        is_student: data?.is_student ? 1 : 0,
        birthday: data?.birthday,
        age: data?.age,
        country_id: data?.country?.country_id,
        city_id: data?.city?.city_id,
        talents: {
          id: data?.talents?.id,
          links: data?.talents?.links?.map((el: any) => el?.id) ?? [],
          contract_url: data?.talents?.contract_url ?? '',
          shift_id: data?.talents.shift?.id,
          inner_client_id: data?.talents?.inner_client?.id,
          objects: data?.talents?.objects?.map((el: any) => el.object_id),
          task_templates:
            data?.talents?.task_templates?.map((item: { id: number }) => item?.id) ?? [],
          tools: data?.talents?.tools?.map((item: { id: number }) => item?.id) ?? [],
          managers: data?.talents?.managers?.map((item: { id: number }) => item?.id) ?? [],
          status_id: data?.talents?.status?.id,
          rates: data?.talents?.rates?.map(
            (item: any): IRateInput => ({
              id: item?.id,
              rate_id: item?.rate?.id,
              inner_client_id: item?.inner_client?.id,
              start_date: item?.start_date,
              end_date: item?.end_date,
              shift_id: item?.shift?.id,
            })
          ),
          comments: data?.talents?.comments?.map((item: IComments) => ({
            id: item?.id,
            date: item?.date,
            comment_type_id: item?.comment_type?.id,
            note: item?.note,
          })),
          communications: data.talents?.communications.map((communication: IJACommunication) => ({
            id: communication?.id,
            account_id: communication?.account?.id,
            communication_type_id: communication?.communication_type?.id,
            followup_date: communication?.followup_date ?? null,
            followup_time: communication?.followup_time ?? null,
            channel: communication?.channel?.tool?.id,
            note: communication?.note,
            messages: communication?.messages.map((message: any) => message.id),
          })),
          professions: data?.talents?.professions?.map(
            (item: any): IProfessionInput => ({
              id: item?.id,
              profession_id: item.profession?.profession_id,
              priority_id: item.priority?.id,
              department_id: item?.profession?.department_id,
            })
          ),
        },
        languages: data?.languages?.map(
          (item: any): ILanguageLevelInput => ({
            id: item?.id,
            language_id: item?.language?.language_id,
            level_id: item?.level?.level_id,
          })
        ),
        cvs: data?.cvs?.map(
          (item: any): ICVInput => ({
            id: item?.id,
            start_date: item?.start_date,
            end_date: item?.end_date,
            company_name: item?.company_name,
            note: item?.note,
            specialisation: item?.specialisation,
            cv_type_id: item?.cv_type?.id,
            country_id: item?.country?.country_id,
            professions: item?.professions?.map((el: any) => el?.profession_id),
            industries: item?.industries?.map((el: any) => el?.industry_id),
            sub_industries: item?.sub_industries?.map((el: any) => el?.sub_industry_id),
          })
        ),
        contacts: data?.contacts?.map(
          (item: any): IContactInput => ({
            id: item?.id,
            value: item?.value,
            tool_id: item?.tool?.id,
          })
        ),
        contents: data?.contents?.map(
          (item: any): IContentInput => ({
            id: item?.id,
            value: item?.value,
            content_type_id: item?.content_type?.id,
          })
        ),
      });
    } else {
      //------------ from employee ------------
      reset({
        user_id: data?.user?.id,
        names: data?.names?.map(
          (item: any): INameInput => ({
            id: item?.id,
            name: item?.name,
            translation_id: item.translation?.language_id,
          })
        ),
        short_name: `${isDuplicate ? `${data?.short_name} COPY` : data?.short_name}`,
        slug: `${isDuplicate ? `${data?.slug}-copy` : data?.slug}`,
        gender: data?.gender,
        is_student: data?.is_student ? 1 : 0,
        birthday: data?.birthday,
        age: data?.age,
        country_id: data?.country?.country_id,
        city_id: data.city?.city_id,
        talents: {
          id: data?.talents?.id,
          links: data?.talents?.links?.map((el: any) => el?.id) ?? [],
          shift_id: data?.talents?.shift?.id,
          inner_client_id: data?.talents?.inner_client?.id,
          objects: data?.talents?.objects?.map((el: any) => el.object_id),
          task_templates:
            data?.talents?.task_templates?.map((item: { id: number }) => item?.id) ?? [],
          tools: data?.talents?.tools?.map((item: { id: number }) => item?.id) ?? [],
          managers: data.talents.managers?.map((item: { id: number }) => item?.id) ?? [],
          status_id: data?.talents?.status?.id,
          rates: data?.talents?.rates?.map(
            (item: any): IRateInput => ({
              id: item?.id,
              rate_id: item?.rate?.id,
              inner_client_id: item?.inner_client?.id,
              start_date: item?.start_date,
              end_date: item?.end_date,
              shift_id: item?.shift?.id,
            })
          ),
          salaries: data?.talents?.salaries?.map(
            (item: any): ISalaryInput => ({
              value: item?.value,
              start_date: item?.start_date,
              end_date: item?.end_date,
              currency_id: item?.currency?.id,
              salary_type_id: item?.salary_type?.id,
              hourly_cost: item?.hourly_cost,
              hourly_currency_id: item?.hourly_currency?.id,
            })
          ),
          comments: data?.talents?.comments?.map((item: IComments) => ({
            id: item?.id,
            date: item?.date,
            comment_type_id: item?.comment_type?.id,
            note: item?.note,
          })),
          communications: data.talents?.communications.map((communication: IJACommunication) => ({
            id: communication?.id,
            account_id: communication?.account?.id,
            communication_type_id: communication?.communication_type?.id,
            followup_date: communication?.followup_date ?? null,
            followup_time: communication?.followup_time ?? null,
            channel: communication?.channel?.tool?.id,
            note: communication?.note,
            messages: communication?.messages.map((message: any) => message.id),
          })),
          professions: data?.talents?.professions?.map(
            (item: any): IProfessionInput => ({
              id: item?.id,
              profession_id: item?.profession?.profession_id,
              priority_id: item?.priority?.id,
              department_id: item?.profession?.department_id,
              is_permission: item?.is_permission,
              position_id: item?.position?.position_id,
            })
          ),
          contract_url: data?.talents?.contract_url ?? '',
          prices: data?.talents?.prices?.map(
            (item: any): IPriceInput => ({
              id: item?.id,
              value: item?.value,
              start_date: item?.start_date,
              end_date: item?.end_date,
              rate_id: item?.rate?.id,
              currency_id: item?.currency?.id,
            })
          ),
        },
        languages: data?.languages?.map(
          (item: any): ILanguageLevelInput => ({
            id: item?.id,
            language_id: item?.language?.language_id,
            level_id: item?.level?.level_id,
          })
        ),
        cvs: data?.cvs?.map(
          (item: any): ICVInput => ({
            id: item?.id,
            start_date: item?.start_date,
            end_date: item?.end_date,
            company_name: item?.company_name,
            note: item?.note,
            specialisation: item?.specialisation,
            cv_type_id: item?.cv_type?.id,
            country_id: item?.country?.country_id,
            professions: item?.professions?.map((el: any) => el?.profession_id),
            industries: item?.industries?.map((el: any) => el?.industry_id),
            sub_industries: item?.sub_industries?.map((el: any) => el?.sub_industry_id),
          })
        ),
        contacts: data?.contacts?.map(
          (item: any): IContactInput => ({
            id: item?.id,
            value: item?.value,
            tool_id: item?.tool?.id,
          })
        ),
        contents: data?.contents?.map(
          (item: any): IContentInput => ({
            id: item?.id,
            value: item?.value,
            content_type_id: item?.content_type?.id,
          })
        ),

        reason: '',
      });
      setCreationInfo({
        created_at: data?.talents?.created_at,
        created_by: data?.talents?.created_by,
      });
    }
  }, [data, visible, isDuplicate]);

  const {
    data: commonDataEmployees,
    refetch: refetchCommonData,
    isFetching: isFetchingCommonData,
  } = useQuery({
    queryKey: ['employees-common'],
    queryFn: async () => {
      const data = await getCommonData();
      return {
        ...data,
        availabilities: [
          { id: 0, name: 'No' },
          { id: 1, name: 'Yes' },
        ],
        genders,
      };
    },
    refetchOnWindowFocus: false,
    placeholderData: {
      availabilities: [],
      genders,
    },
    enabled: false,
  });

  useEffect(() => {
    if (id && visible) {
      refetch();
      if (isMoved) {
        refetchCommonData();
      }
    }
  }, [id, visible, isFromCandidates, isFromJobApplications, isFromPresales]);

  const commonData = isMoved ? commonDataEmployees : commonDataProps;
  const userOptions = useMemo(() => {
    const options = [];
    if (data?.user) {
      options.push(data.user);
    }
    if (commonData.users) {
      options.push(...commonData.users);
    }
    return options;
  }, [data?.user, commonData.users]);

  return (
    <ActionsDrawer
      id={!isMoved ? id : null}
      title='Employee'
      visible={visible}
      creationInfo={creationInfo}
      bookmarks={bookmarks}
      activeBookmark={activeBookmark}
      hideHandler={hideHandler}
      resetHandler={clearData}
      submitForm={submitForm}
      changeActiveBookmark={changeActiveBookmark}
      toggleBookmarkError={toggleBookmarkError}
      fullScreen={fullScreen}
      fullScreenHandler={fullScreenHandler}
      register={register}
      errors={errors}
      isLoading={isFetching || isFetchingCommonData}
      isDuplicate={isDuplicate}
    >
      {renderProfile()}
      {renderProfessions()}
      {renderRates()}
      {renderSalaries()}
      {renderPrices()}
      {renderLanguages()}
      {renderCVs()}
      {renderContacts()}
      {renderContents()}
      {renderComments()}
      {renderCommunications()}
    </ActionsDrawer>
  );

  function renderProfile() {
    const renderInputs: IRenderInput[] = [
      {
        name: 'talents.shift_id',
        label: 'Shift',
        type: 'SingleSelect',
        link: '/shifts',
        options: commonData.shifts ?? [],
        required: true,
      },
      {
        label: 'Inner client',
        name: 'talents.inner_client_id',
        type: 'SingleSelect',
        link: '/inner-clients',
        options: commonData.inner_clients ?? [],
        required: false,
      },
      {
        label: 'Status',
        name: 'talents.status_id',
        type: 'SingleSelect',
        link: '/statuses',
        options: commonData.statuses ?? [],
        required: true,
      },
      {
        label: 'Task Templates',
        name: 'talents.task_templates',
        type: 'MultiSelect',
        link: '/task-templates',
        options: commonData.task_templates ?? [],
        required: false,
      },
      {
        label: 'Objects',
        name: 'talents.objects',
        type: 'MultiSelect',
        link: '/objects',
        options: commonData.objects ?? [],
        required: true,
      },
      {
        type: 'MultiSelect',
        name: 'talents.tools',
        label: 'Tools',
        link: '/tools',
        options: commonData.tools_candidates ?? [],
        required: false,
      },
      {
        label: 'Managers',
        type: 'MultiSelect',
        name: 'talents.managers',
        link: '/users',
        options: commonData.users ?? [],
        required: true,
      },
      {
        label: 'Links',
        type: 'MultiSelect',
        name: 'talents.links',
        link: '/links',
        options: commonData.links ?? [],
        required: false,
      },
    ];

    return (
      <Stack
        sx={{ display: activeBookmark === 'profile' ? 'flex' : 'none', width: '100%' }}
        gap='1rem'
      >
        <Controller
          name='user_id'
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <CustomSingleSelect
                label='User'
                link='/users'
                field={field}
                options={userOptions}
                error={error}
                style={{
                  minWidth: 'calc(33.3% - 1rem)',
                }}
              />
            );
          }}
        />

        <MultiInputGroup
          control={control}
          onAddClick={() => {
            const oldValues = getValues('names') ?? [];
            setValue('names', [...oldValues, getDefaultNames()]);
          }}
          onDeleteClick={(index) => {
            const oldValues = getValues('names');
            if (index === 0) return;
            setValue(
              'names',
              oldValues.filter((_, ind) => ind !== index)
            );
          }}
          label={'Name'}
          fullScreen={fullScreen}
          name={'names'}
          renderInputs={({ value, index, el, onChange }: IRenderInputsProps<INameInput>) => (
            <NameInputs
              onChange={onChange}
              commonData={commonData}
              index={index}
              item={el}
              value={value}
              setValue={setValue}
              errors={errors.names}
              errorsShortName={errors.short_name}
              clearErrors={clearErrors}
              checkUniqueMutation={checkUniqueMutation}
            />
          )}
        />

        <TextField
          variant='standard'
          InputLabelProps={{ shrink: true }}
          {...register('short_name')}
          error={!!errors.short_name}
          helperText={errors.short_name ? errors.short_name?.message : ''}
          label={<CustomLabel label={'Short Name'} required />}
          className={mdDown ? 'mobile' : ''}
          sx={{ minWidth: 'calc(33.3% - 1rem)' }}
          InputProps={{
            endAdornment: isUniqueCheckLoading && <CircularProgress size={20} />,
          }}
        />
        <TextField
          variant='standard'
          InputLabelProps={{ shrink: true }}
          {...register('slug')}
          error={!!errors.slug}
          helperText={errors.slug ? errors.slug?.message : ''}
          label={<CustomLabel label={'Slug'} required />}
          className={mdDown ? 'mobile' : ''}
          sx={{ minWidth: 'calc(33.3% - 1rem)' }}
        />

        <Stack
          flexDirection='row'
          gap='1rem'
          sx={{
            minWidth: 'calc(50% - 1rem)',
          }}
        >
          <Controller
            name='birthday'
            control={control}
            render={({ field }) => (
              <DateInput
                label={'Birthday'}
                format='DD-MM-YYYY'
                error={errors?.birthday}
                style={{
                  width: fullScreen ? '50%' : 'auto',
                  '&.mobile': {
                    width: 'auto',
                    gridColumn: 'auto',
                  },
                }}
                required
                disabled={!data && !!watch('age')}
                field={{
                  ...field,
                  onChange: (date: Dayjs | null) => {
                    field.onChange(date);
                    handleBirthdayChange(date);
                  },
                }}
              />
            )}
          />

          <TextField
            variant='standard'
            type='number'
            inputProps={{ min: 0 }}
            InputLabelProps={{ shrink: true }}
            {...register('age', {
              onChange: (event) => handleAgeChange(event),
            })}
            error={!!errors.age}
            helperText={errors.age ? errors.age?.message : ''}
            label={<CustomLabel label={'Age'} required />}
            disabled={!data && !!watch('birthday')}
            className={mdDown ? 'mobile' : ''}
            sx={{ minWidth: 'calc(33.3% - 1rem)' }}
          />
        </Stack>

        <Stack
          flexDirection='row'
          gap='1rem'
          sx={{
            minWidth: 'calc(50% - 1rem)',
          }}
        >
          <Controller
            name='gender'
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label='Gender'
                  field={field}
                  options={commonData.genders ?? []}
                  required
                  error={error}
                  style={{
                    width: '50%',
                  }}
                />
              );
            }}
          />
          <Controller
            name='is_student'
            control={control}
            render={({ field, fieldState: { error } }) => (
              <CustomSingleSelect
                label='Is Student'
                field={field}
                required
                options={commonData.availabilities ?? []}
                error={error}
                style={{
                  width: '50%',
                }}
              />
            )}
          />
        </Stack>

        <Stack
          flexDirection='row'
          gap='1rem'
          sx={{
            minWidth: 'calc(50% - 1rem)',
          }}
        >
          <CountryCity
            control={control}
            countries={commonData.countries ?? []}
            cities={commonData.cities ?? []}
            styles={{
              width: '50%',
            }}
            required={{
              city: true,
              country: false,
            }}
            watch={watch}
            setValue={setValue}
          />
        </Stack>

        {renderInputs.map((inputData) => (
          <InputComponent
            key={inputData.label}
            name={inputData.name}
            type={inputData.type}
            link={inputData.link}
            label={inputData.label}
            options={inputData.options}
            required={inputData.required}
          />
        ))}

        <TextField
          variant='standard'
          InputLabelProps={{ shrink: true }}
          {...register('talents.contract_url')}
          error={!!errors.talents?.contract_url}
          helperText={errors.talents?.contract_url?.message ?? ''}
          label={<CustomLabel label={'Contract URL'} required />}
          className={mdDown ? 'mobile' : ''}
          sx={{ minWidth: 'calc(33.3% - 1rem)' }}
        />
      </Stack>
    );
  }

  function renderCommunications() {
    return (
      <Stack sx={{ display: activeBookmark === 'communication' ? 'flex' : 'none' }} gap='1rem'>
        <MultiInputGroup
          control={control}
          name={'talents.communications'}
          label={'Communications'}
          required
          error={errors.talents?.communications}
          fullScreen={fullScreen}
          onAddClick={() => {
            const oldValues = getValues('talents.communications') ?? [];
            setValue('talents.communications', [...oldValues, defaultJACommunication]);
          }}
          onDeleteClick={(index) => {
            const oldValues = getValues('talents.communications');
            setValue(
              'talents.communications',
              oldValues.filter((_, ind) => ind !== index)
            );
          }}
          renderInputs={({ value, index, el, onChange }: IRenderInputsProps<IJACommunication>) => (
            <CommunicationInputs
              onChange={onChange}
              getValues={getValues}
              communicationsArr={value}
              index={index}
              elem={el}
              accounts={commonData?.accounts ?? []}
              messages={commonData?.messages ?? []}
              communication_types={commonData?.communication_types ?? []}
              errors={errors.talents?.communications}
              control={control}
              single={isProfile}
              chanelOptions={chanelOptions}
            />
          )}
        />
      </Stack>
    );
  }

  function renderComments() {
    return (
      <Stack
        sx={{ display: activeBookmark === 'comment' ? 'flex' : 'none', width: '100%' }}
        gap='1rem'
      >
        <MultiInputGroup
          control={control}
          name={'talents.comments'}
          required
          error={errors.talents?.comments}
          onAddClick={() => {
            const oldValues = getValues('talents.comments') ?? [];
            setValue('talents.comments', [...oldValues, getDefaultComments()]);
          }}
          onDeleteClick={(index) => {
            const oldValues = getValues('talents.comments');
            setValue(
              'talents.comments',
              oldValues.filter((_, ind) => ind !== index)
            );
          }}
          label={'Comments'}
          fullScreen={fullScreen}
          renderInputs={({ value, index, el, onChange }: IRenderInputsProps<ICommentInputs>) => (
            <CommentInputs
              commentsArr={value}
              onChange={onChange}
              elem={el}
              index={index}
              comment_types={commonData?.comment_types ?? []}
              errors={errors?.talents?.comments}
            />
          )}
        />
      </Stack>
    );
  }

  function renderPrices() {
    return (
      <Stack sx={{ display: activeBookmark === 'price' ? 'flex' : 'none' }} gap='1rem'>
        <MultiInputGroup
          control={control}
          name={'talents.prices'}
          error={errors.talents?.prices}
          onAddClick={() => {
            const oldValues = getValues('talents.prices') ?? [];
            setValue('talents.prices', [...oldValues, getDefaultPrice()]);
          }}
          onDeleteClick={(index) => {
            const oldValues = getValues('talents.prices');
            setValue(
              'talents.prices',
              oldValues.filter((_, ind) => ind !== index)
            );
          }}
          label={'Prices'}
          fullScreen={fullScreen}
          renderInputs={({ value, index, el, onChange }: IRenderInputsProps<IPriceInput>) => (
            <TalentPriceInputs
              onChange={onChange}
              index={index}
              errors={errors.talents?.prices}
              value={value}
              item={el}
              commonData={commonData}
            />
          )}
        />
      </Stack>
    );
  }

  function renderCVs() {
    return (
      <Stack sx={{ display: activeBookmark === 'cv' ? 'flex' : 'none' }} gap='1rem'>
        <MultiInputGroup
          control={control}
          name={'cvs'}
          label={'CVs'}
          required
          error={errors.cvs}
          fullScreen={fullScreen}
          onAddClick={() => {
            const oldValues = getValues('cvs') ?? [];
            setValue('cvs', [...oldValues, getDefaultCVs()]);
          }}
          onDeleteClick={(index) => {
            const oldValues = getValues('cvs');
            setValue(
              'cvs',
              oldValues.filter((_, ind) => ind !== index)
            );
          }}
          renderInputs={({ value, index, el, onChange }: IRenderInputsProps<ICVInput>) => (
            <CVInputs
              onChange={onChange}
              value={value}
              index={index}
              item={el}
              commonData={commonData}
              errors={errors.cvs}
              elem={el}
              getValues={getValues}
            />
          )}
        />
      </Stack>
    );
  }

  function renderLanguages() {
    return (
      <Stack
        sx={{ display: activeBookmark === 'language' ? 'flex' : 'none', width: '100%' }}
        gap='1rem'
      >
        <MultiInputGroup
          control={control}
          fullScreen={fullScreen}
          required
          error={errors.languages}
          onDeleteClick={(index) => {
            const oldValues = getValues('languages');
            setValue(
              'languages',
              oldValues.filter((_, ind) => ind !== index)
            );
          }}
          onAddClick={() => {
            const oldValues = getValues('languages') ?? [];
            setValue('languages', [...oldValues, getDefaultLanguage()]);
          }}
          label={'Languages'}
          name={'languages'}
          renderInputs={({
            value,
            index,
            el,
            onChange,
          }: IRenderInputsProps<ILanguageLevelInput>) => (
            <LanguageLevelInputs
              onChange={onChange}
              languagesArr={value}
              index={index}
              elem={el}
              languages={commonData.languages ?? []}
              levels={commonData.levels ?? []}
              errors={errors.languages}
            />
          )}
        />
      </Stack>
    );
  }

  function renderContacts() {
    return (
      <Stack
        sx={{ display: activeBookmark === 'contact' ? 'flex' : 'none', width: '100%' }}
        gap='1rem'
      >
        <MultiInputGroup
          control={control}
          name={'contacts'}
          required
          error={errors.contacts}
          onAddClick={() => {
            const oldValues = getValues('contacts') ?? [];
            setValue('contacts', [...oldValues, getDefaultContact()]);
          }}
          onDeleteClick={(index) => {
            const oldValues = getValues('contacts');
            setValue(
              'contacts',
              oldValues.filter((_, ind) => ind !== index)
            );
          }}
          label={'Contacts'}
          fullScreen={fullScreen}
          renderInputs={({ value, index, el, onChange }: IRenderInputsProps<IContactInput>) => (
            <ContactInputs
              onChange={onChange}
              contactsArr={value}
              index={index}
              elem={el}
              tools={commonData.tools ?? []}
              errors={errors.contacts}
              setError={setError}
              clearErrors={clearErrors}
            />
          )}
        />
      </Stack>
    );
  }

  function renderContents() {
    return (
      <Stack
        sx={{ display: activeBookmark === 'content' ? 'flex' : 'none', width: '100%' }}
        gap='1rem'
      >
        <MultiInputGroup
          control={control}
          name={'contents'}
          required
          error={errors.contents}
          onAddClick={() => {
            const oldValues = getValues('contents') ?? [];
            setValue('contents', [...oldValues, getDefaultContent()]);
          }}
          onDeleteClick={(index) => {
            const oldValues = getValues('contents');
            setValue(
              'contents',
              oldValues.filter((_, ind) => ind !== index)
            );
          }}
          label={'Contents'}
          fullScreen={fullScreen}
          renderInputs={({ value, index, el, onChange }: IRenderInputsProps<IContentInput>) => (
            <ContentInputs
              onChange={onChange}
              value={value}
              index={index}
              item={el}
              commonData={commonData}
              errors={errors.contents}
            />
          )}
        />
      </Stack>
    );
  }

  function renderProfessions() {
    return (
      <Stack
        sx={{ display: activeBookmark === 'profession' ? 'flex' : 'none', width: '100%' }}
        gap='1rem'
      >
        <MultiInputGroup
          control={control}
          fullScreen={fullScreen}
          name={'talents.professions'}
          label={'Professions'}
          onAddClick={() => {
            const oldValues = getValues('talents.professions') ?? [];
            setValue('talents.professions', [...oldValues, getDefaultProfession()]);
          }}
          onDeleteClick={(index) => {
            const oldValues = getValues('talents.professions');
            setValue(
              'talents.professions',
              oldValues.filter((_, ind) => ind !== index)
            );
          }}
          required
          error={errors.talents?.professions}
          renderInputs={({ value, index, el, onChange }: IRenderInputsProps<IProfessionInput>) => (
            <ProfessionInputs
              onChange={onChange}
              professionsArr={value}
              index={index}
              elem={el}
              departments={commonData.departments ?? []}
              professions={commonData.professions ?? []}
              priorities={commonData.priorities ?? []}
              positions={commonData.positions ?? []}
              availabilities={commonDataProps?.availabilities ?? []}
              errors={errors.talents?.professions}
            />
          )}
        />
      </Stack>
    );
  }

  function renderRates() {
    return (
      <Stack sx={{ display: activeBookmark === 'rate' ? 'flex' : 'none' }} gap='1rem'>
        <MultiInputGroup
          control={control}
          fullScreen={fullScreen}
          name={'talents.rates'}
          label={'Rates'}
          onAddClick={() => {
            const oldValues = getValues('talents.rates') ?? [];
            setValue('talents.rates', [...oldValues, getDefaultRate()]);
          }}
          onDeleteClick={(index) => {
            const oldValues = getValues('talents.rates');
            setValue(
              'talents.rates',
              oldValues.filter((_, ind) => ind !== index)
            );
          }}
          renderInputs={({ value, index, el, onChange }: IRenderInputsProps<IRateInput>) => (
            <RateInputs
              onChange={onChange}
              value={value}
              index={index}
              item={el}
              commonData={commonData}
              errors={errors.talents?.rates}
            />
          )}
        />
      </Stack>
    );
  }

  function renderSalaries() {
    return (
      <Stack sx={{ display: activeBookmark === 'salary' ? 'flex' : 'none' }} gap='1rem'>
        <MultiInputGroup
          control={control}
          fullScreen={fullScreen}
          name={'talents.salaries'}
          label={'Salaries'}
          onAddClick={() => {
            const oldValues = getValues('talents.salaries') ?? [];
            setValue('talents.salaries', [...oldValues, getDefaultSalary()]);
          }}
          onDeleteClick={(index) => {
            const oldValues = getValues('talents.salaries');
            setValue(
              'talents.salaries',
              oldValues.filter((_, ind) => ind !== index)
            );
          }}
          renderInputs={({ value, index, el, onChange }: IRenderInputsProps<ISalaryInput>) => (
            <SalaryInputs
              onChange={onChange}
              value={value}
              index={index}
              item={el}
              commonData={commonData}
              errors={errors.talents?.salaries}
            />
          )}
        />
      </Stack>
    );
  }

  function InputComponent(props: IRenderInput) {
    const { type } = props;
    switch (type) {
      case 'SingleSelect':
        return (
          <Controller
            name={props.name as any}
            control={control}
            render={({ field, fieldState: { error } }) => {
              return (
                <CustomSingleSelect
                  label={props.label}
                  field={field}
                  link={props.link}
                  options={props.options!}
                  required={props.required}
                  error={error}
                  style={{
                    minWidth: 'calc(33% - 1rem)',
                    '&.mobile': {
                      gridColumn: 'auto',
                    },
                  }}
                />
              );
            }}
          />
        );
      case 'MultiSelect':
        return (
          <Controller
            control={control}
            name={props.name as any}
            render={({ field: { onChange, value, name }, fieldState: { error } }) => (
              <CustomSelect
                type={props.label}
                options={props.options!}
                link={props.link}
                value={value}
                error={error!}
                required={props.required}
                handleChange={onChange}
                style={{
                  flexGrow: 1,
                  minWidth: 'calc(50% - 1.5rem)',
                }}
              />
            )}
          />
        );
    }
  }
}
