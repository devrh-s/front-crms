'use client';
import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from './axiosInstance';
import config from '@/config';

const { MEDIA_URL, MEDIA_SECRET } = config;

interface ICommonDataValue {
  id: number | string;
  name: string;
  iso2?: string;
  iso3?: string;
  image?: string;
  is_default?: number;
  start_time?: string;
  end_time?: string;
  countryId?: number | string;
  guides?: IGuideType[];
  formats?: IFormats[];
  objects?: IObject[];
  checklist_items?: IChecklistItemType[];
  step_templates?: IStepTemplate[];
  department_id?: number;
}

export async function apiGetData(url: string) {
  try {
    if (url) {
      const result = await api.get(url);
      return result.data;
    }
  } catch (error) {
    const axiosError = error as ResponseError;
    throw axiosError;
  }
}

export async function apiGetDataUnsafe(url: string) {
  const result = await api.get(url);
  return result.data;
}

export async function apiSetData(url: string, data?: any, file = false) {
  try {
    const result = await api.post(url, data, {
      headers: {
        'Content-Type': file ? 'multipart/form-data' : 'application/json',
      },
    });
    return result.data;
  } catch (error) {
    const axiosError = error as ResponseError;
    throw axiosError;
  }
}

export async function apiUpdateData(url: string, data?: any, file = false) {
  try {
    const result = await api.post(`${url}?_method=PUT`, data, {
      headers: {
        'Content-Type': file ? 'multipart/form-data' : 'application/json',
      },
    });
    return result.data;
  } catch (error) {
    const axiosError = error as ResponseError;
    throw axiosError;
  }
}

export async function apiDeleteData(url: string, reason: string | null = null) {
  try {
    const result = await api.delete(url, {
      data: { reason },
    });
    return result.data;
  } catch (error) {
    const axiosError = error as ResponseError;
    throw axiosError;
  }
}

export async function mediaGet(url: string) {
  try {
    const result = await axios.get(`${MEDIA_URL}/${url}`);
    return result.data;
  } catch (error) {
    const axiosError = error as ResponseError;
    throw axiosError;
  }
}

export async function mediaPost(url: string, data: any) {
  try {
    const result = await axios.post(`${MEDIA_URL}/${url}?media=${MEDIA_SECRET}`, data);
    return result.data;
  } catch (error) {
    const axiosError = error as ResponseError;
    throw axiosError;
  }
}

export async function mediaPut(url: string, data: any) {
  try {
    const result = await axios.put(`${MEDIA_URL}/${url}?media=${MEDIA_SECRET}`, data);
    return result.data;
  } catch (error) {
    const axiosError = error as ResponseError;
    throw axiosError;
  }
}

export async function mediaDelete(url: string) {
  try {
    const result = await axios.delete(`${MEDIA_URL}/${url}?media=${MEDIA_SECRET}`);
    return result.data;
  } catch (error) {
    const axiosError = error as ResponseError;
    throw axiosError;
  }
}

export async function mediaUpload(url: string, data?: any) {
  try {
    const result = await axios.post(`${MEDIA_URL}/${url}?media=${MEDIA_SECRET}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data; charset=UTF-8',
      },
    });
    return result.data;
  } catch (error) {
    const axiosError = error as ResponseError;
    throw axiosError;
  }
}

export async function apiGetFile(url: string) {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });
    const headers = response?.headers;
    let fileName = 'data.csv';
    if (typeof headers?.get === 'function') {
      const contentDesposition = headers.get('Content-Disposition');
      const content = contentDesposition?.toString()?.match(/\=\"(.*)\"/)?.[1];
      fileName = content ?? fileName;
    }
    const linkUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = linkUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    const axiosError = error as ResponseError;
    return axiosError.response?.data;
  }
}

export async function apiCommonData(data: any) {
  const dataKeys = Object.keys(data);
  const results = (await Promise.allSettled(
    dataKeys.map((key) => {
      const url = typeof data[key] === 'object' ? data[key].url : data[key];
      return apiGetData(url);
    })
  )) as IParallelResult[];

  const newValue: any = {};

  const getId = (key: string, el: any) => {
    if (key === 'groups' || key === 'groups_similar') {
      return el?.item_id ?? el.id;
    }
    return el.id;
  };

  results.forEach((result, index) => {
    const key = dataKeys[index];
    const isFull = !!data[key]?.isFull;
    if (isFull) {
      newValue[key] = result?.value?.data;
      return;
    }
    newValue[key] = result?.value?.data?.map((el: any) => {
      const value: ICommonDataValue = {
        id: getId(key, el),
        name: el.name ?? el.title,
        is_default: el?.is_default,
        iso2: el.iso2,
        iso3: el.iso3,
      };
      if (el.image_icon) {
        value.image = el.image_icon;
      }
      if (el.image) {
        value.image = el.image;
      }
      if (el.guides) {
        value.guides = el.guides;
      }
      if (el.objects) {
        value.objects = el.objects;
      }
      if (el.step_templates) {
        value.step_templates = el.step_templates;
      }
      if (el.department_id) {
        value.department_id = el.department_id;
      }
      if (el.checklist_items) {
        value.checklist_items = el.checklist_items;
      }
      if (el.formats) {
        value.formats = el.formats;
      }
      if (el.start_time) {
        value.start_time = el.start_time;
      }
      if (el.end_time) {
        value.end_time = el.end_time;
      }
      if (key === 'cities') {
        value.countryId = el.country?.country_id ?? el.country_id;
      }
      return value;
    });
  });
  return newValue;
}

export async function updateCommondData({
  name,
  commonDataReq,
  queryClient,
}: {
  name: string;
  commonDataReq: {
    [key: string]:
      | string
      | {
          url: string;
          isFull: boolean;
        };
  };
  queryClient: QueryClient;
}) {
  try {
    const data = await apiCommonData(commonDataReq);
    queryClient.setQueryData([name], (commonData: any) => ({ ...commonData, ...data }));
  } catch (error) {
    console.error(error);
  }
}
