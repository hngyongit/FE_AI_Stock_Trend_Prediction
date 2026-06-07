import * as yup from 'yup';

export const loginValidationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email address.')
    .required('Email address is required.'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .required('Password is required.'),
  rememberMe: yup.boolean().required(),
});