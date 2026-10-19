import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ApiError, type LoginAppProps, type LoginRequest } from '@pronto/shared';
import { loginRequest } from '../api/authApi';

type Field = keyof LoginRequest;
type FieldErrors = Partial<Record<Field, string>>;

const validate = ({ username, password }: LoginRequest): FieldErrors => ({
  ...(username.trim() ? {} : { username: 'Ingresa tu usuario' }),
  ...(password ? {} : { password: 'Ingresa tu contraseña' }),
});

const toErrorMessage = (err: unknown): string => {
  if (err instanceof ApiError) {
    if (err.code === 'INVALID_CREDENTIALS') return 'Usuario o contraseña incorrectos. Revisa los datos e intenta de nuevo.';
    if (err.code === 'NETWORK_ERROR') return 'No pudimos conectar con el servidor. Verifica que la API esté corriendo e intenta de nuevo.';
  }
  return 'No se pudo iniciar sesión por un error inesperado. Intenta de nuevo en unos segundos.';
};

/** Container del login: estado, validacion y llamada a la API. La vista recibe su retorno tal cual. */
export const useLogin = ({ apiUrl, onLoginSuccess }: LoginAppProps) => {
  const [values, setValues] = useState<LoginRequest>({ username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: Field) => (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const errors = validate(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const { token } = await loginRequest(apiUrl, { username: values.username.trim(), password: values.password });
      onLoginSuccess(token);
    } catch (err) {
      setErrorMessage(toErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  return { values, fieldErrors, errorMessage, isSubmitting, handleChange, handleSubmit };
};

export type UseLoginResult = ReturnType<typeof useLogin>;
