import { useState } from 'react';
import { useFormik } from 'formik';

import type { RegisterFormValues } from '@/features/auth/types';
import { registerValidationSchema } from '@/features/auth/schemas/register.schema';
import { registerUser } from '@/features/auth/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

type FieldErrors = Record<string, string>;

export function useRegisterForm(onSuccess: () => void) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const { errorMessage, failSubmit, clearError } = useAuthStore();

    const formik = useFormik<RegisterFormValues>({
        initialValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            agreeTerms: false,
        },
        validationSchema: registerValidationSchema,
        validateOnBlur: true,
        validateOnChange: false,
        onSubmit: async (values) => {
            clearError();
            setFieldErrors({});
            setSuccessMessage(null);

            try {
                const result = await registerUser({
                    full_name: values.fullName.trim(),
                    email: values.email.trim(),
                    password: values.password,
                });

                setSuccessMessage(result.message);
                // Navigate to Login after a brief delay to show success
                setTimeout(() => onSuccess(), 1200);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    const fieldErr = (error as Error & { fieldErrors?: Array<{ field: string; message: string }> }).fieldErrors;

                    if (fieldErr && fieldErr.length > 0) {
                        const mapped: FieldErrors = {};
                        for (const fe of fieldErr) {
                            // Map backend field names to formik field names
                            const formField = fe.field === 'full_name' ? 'fullName' : fe.field;
                            mapped[formField] = fe.message;
                        }
                        setFieldErrors(mapped);
                    } else {
                        failSubmit(error.message);
                    }
                } else {
                    failSubmit('Registration failed. Please try again.');
                }
            }
        },
    });

    return {
        formik,
        showPassword,
        showConfirmPassword,
        setShowPassword,
        setShowConfirmPassword,
        fieldErrors,
        successMessage,
        errorMessage,
    };
}
