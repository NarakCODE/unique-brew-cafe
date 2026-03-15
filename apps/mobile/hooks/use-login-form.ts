import { useState } from 'react';

import type { LoginInput } from '../../../packages/api/src';

import { getErrorMessage } from '@/lib/api-errors';

type LoginField = keyof LoginInput;
type LoginErrors = Partial<Record<LoginField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLoginValues(values: LoginInput): LoginErrors {
  const errors: LoginErrors = {};

  if (!values.email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return errors;
}

export function useLoginForm(onSubmit: (values: LoginInput) => Promise<void>) {
  const [values, setValues] = useState<LoginInput>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function setFieldValue(field: LoginField, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        [field]: undefined,
      };
    });

    if (submissionError) {
      setSubmissionError(null);
    }
  }

  async function submit() {
    const normalizedValues = {
      email: values.email.trim().toLowerCase(),
      password: values.password,
    };
    const nextErrors = validateLoginValues(normalizedValues);

    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      return false;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      await onSubmit(normalizedValues);
      return true;
    } catch (error) {
      setSubmissionError(
        getErrorMessage(error, 'Unable to sign in right now.')
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    values,
    errors,
    isSubmitting,
    submissionError,
    canSubmit:
      values.email.trim().length > 0 &&
      values.password.length > 0 &&
      !isSubmitting,
    setFieldValue,
    submit,
  };
}
