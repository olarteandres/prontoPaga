import { useState, type ChangeEvent, type FormEvent } from 'react';
import { ApiError, formatRut, isValidRut, type ScoreAppProps, type ScoreResponse } from '@pronto/shared';
import { getScoreRequest } from '../api/scoreApi';
import { getRiskBand } from '../domain/risk';

type Status = 'idle' | 'loading' | 'success' | 'error';

const toErrorMessage = (err: unknown, ownRut: string | undefined): string => {
  if (err instanceof ApiError) {
    if (err.code === 'FORBIDDEN') {
      return ownRut
        ? `Tu cuenta solo puede consultar el score del RUT ${ownRut}.`
        : 'Tu cuenta no tiene permisos para consultar este RUT.';
    }
    if (err.code === 'BAD_REQUEST') return 'El RUT no es válido. Revisa el número y el dígito verificador.';
    if (err.code === 'NETWORK_ERROR') return 'No pudimos conectar con el servidor. Verifica que la API esté corriendo e intenta de nuevo.';
  }
  return 'No se pudo obtener el score por un error inesperado. Intenta de nuevo en unos segundos.';
};

/** Container de la consulta de score: estado del formulario, llamada a la API y manejo de errores. */
export const useScoreQuery = ({ apiUrl, token, user, onUnauthorized }: ScoreAppProps) => {
  const ownRut = user.role === 'user' ? user.rut : undefined;

  const [rut, setRut] = useState(ownRut ?? '');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRutChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRut(event.target.value);
    setFieldError(null);
  };

  const handleRutBlur = () => {
    if (isValidRut(rut)) setRut(formatRut(rut));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'loading') return;

    if (!rut.trim()) return setFieldError('Ingresa un RUT para consultar');
    if (!isValidRut(rut)) return setFieldError('El RUT no es válido. Revisa el número y el dígito verificador.');

    setRut(formatRut(rut));
    setStatus('loading');
    setErrorMessage(null);
    try {
      setResult(await getScoreRequest(apiUrl, token, rut));
      setStatus('success');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized(
          err.code === 'TOKEN_EXPIRED' ? 'Tu sesión expiró. Inicia sesión de nuevo.' : 'Tu sesión no es válida. Inicia sesión de nuevo.',
        );
        return;
      }
      setResult(null);
      setErrorMessage(toErrorMessage(err, ownRut));
      setStatus('error');
    }
  };

  return {
    rut,
    fieldError,
    errorMessage,
    result,
    riskBand: result ? getRiskBand(result.score) : null,
    isLoading: status === 'loading',
    isAdmin: user.role === 'admin',
    ownRut,
    handleRutChange,
    handleRutBlur,
    handleSubmit,
  };
};

export type UseScoreQueryResult = ReturnType<typeof useScoreQuery>;
