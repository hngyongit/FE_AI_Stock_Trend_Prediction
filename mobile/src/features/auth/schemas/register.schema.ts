import * as yup from 'yup';

export const registerValidationSchema = yup.object({
    fullName: yup
        .string()
        .required('Full name is required.')
        .min(2, 'Full name must be between 2 and 100 characters.')
        .max(100, 'Full name must be between 2 and 100 characters.'),
    email: yup
        .string()
        .email('Enter a valid email address.')
        .required('Email address is required.'),
    password: yup
        .string()
        .required('Password is required.')
        .min(8, 'Password must be at least 8 characters.')
        .matches(
            /(?=.*[A-Za-z])(?=.*\d)/,
            'Password must contain at least 1 letter and at least 1 digit.',
        ),
    confirmPassword: yup
        .string()
        .required('Please confirm your password.')
        .oneOf([yup.ref('password')], 'Passwords must match.'),
    agreeTerms: yup
        .boolean()
        .oneOf([true], 'You must agree to the Terms of Service and Privacy Policy.'),
});
