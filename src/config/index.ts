// eslint-disable-next-line import/no-anonymous-default-export
export default {
  env: process.env.NEXT_PUBLIC_ENV,
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  MEDIA_URL: process.env.NEXT_PUBLIC_MEDIA_URL,
  MEDIA_SECRET: process.env.NEXT_PUBLIC_MEDIA_SECRET,
  datagrid: {
    rowHeight: 45,
    column: {
      disableColumnMenu: true,
      width: 50,
    },
  },
};
