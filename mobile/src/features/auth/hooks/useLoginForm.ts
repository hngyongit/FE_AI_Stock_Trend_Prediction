import { useState } from 'react';
import { useFormik } from 'formik';

import type { LoginFormValues } from '@/features/auth/types';
import { loginValidationSchema } from '@/features/auth/schemas/login.schema';
import { loginWithCredentials, isMobileAllowedRole, getRoleAccessMessage } from '@/features/auth/services/auth.service';
import { persistRememberedSession, clearPersistedSession } from '@/shared/services/tokenStorage';
import { useAuthStore } from '@/stores/auth.store';

export function useLoginForm(onSuccess: () => void) {
  const [showPassword, setShowPassword] = useState(false);
  const { beginSubmit, clearError, errorMessage, failSubmit, setSession } = useAuthStore();

  const formik = useFormik<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
    validationSchema: loginValidationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      beginSubmit();
      clearError();

      try {
        const session = await loginWithCredentials({
          email: values.email.trim(),
          password: values.password,
        });

        if (!isMobileAllowedRole(session.user.role)) {
          await clearPersistedSession();
          failSubmit(getRoleAccessMessage(session.user.role));
          return;
        }

        if (values.rememberMe) {
          await persistRememberedSession(session);
        } else {
          await clearPersistedSession();
        }

        setSession(session);
        onSuccess();
      } catch (error) {
        failSubmit(
          error instanceof Error
            ? error.message
            : 'Unable to sign in right now. Please try again.'
        );
      }
    },
  });

  return {
    formik,
    showPassword,
    setShowPassword,
    errorMessage,
    isSubmitting: formik.isSubmitting,
  };
}