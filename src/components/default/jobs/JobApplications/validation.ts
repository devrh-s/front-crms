export const toolsValidation = {
  phone: {
    regexp: /^(\+380[\s\-]?\d{2}[\s\-]?\d{3}[\s\-]?\d{4})$/,
    message: 'invalid phone number',
  },
  viber: {
    regexp: /^(\+380[\s\-]?\d{2}[\s\-]?\d{3}[\s\-]?\d{4})$/,
    message: 'invalid phone number',
  },
  whatsapp: {
    regexp: /^(\+380[\s\-]?\d{2}[\s\-]?\d{3}[\s\-]?\d{4})$/,
    message: 'invalid phone number',
  },
  linkedIn: {
    regexp: '^https?://(www.)?linkedin.com/.*$',
    message: 'invalid LinkedIn link.',
  },
  instagram: {
    regexp: '^https?://(www.)?instagram.com/.*$',
    message: 'invalid Instagram link.',
  },
  facebook: {
    regexp: '^https?://(www.)?facebook.com/.*$',
    message: 'invalid Facebook link.',
  },
  email: {
    regexp: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$',
    message: 'invalid email address.',
  },
  gmail: {
    regexp: '^[a-zA-Z0-9._%+-]+@gmail.com$',
    message: 'invalid Gmail address.',
  },
  youtube: {
    regexp: '^https?://www.youtube.com/.*$',
    message: 'Invalid YouTube channel link.',
  },
};
