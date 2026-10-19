/** Quita puntos, guion y espacios; deja el DV en mayuscula. "12.345.678-5" -> "123456785" */
export const cleanRut = (rut: string): string => rut.replace(/[^0-9kK]/g, '').toUpperCase();

export const computeDv = (body: string): string => {
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const dv = 11 - (sum % 11);
  if (dv === 11) return '0';
  if (dv === 10) return 'K';
  return String(dv);
};

export const isValidRut = (rut: string): boolean => {
  if (!/^[0-9.\-\s]+[0-9kK]$/.test(rut.trim())) return false;
  const clean = cleanRut(rut);
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d{1,8}$/.test(body)) return false;
  return computeDv(body) === dv;
};

/** Formato canonico "12.345.678-5". Asume un RUT valido. */
export const formatRut = (rut: string): string => {
  const clean = cleanRut(rut);
  const body = clean.slice(0, -1).replace(/^0+/, '');
  const dv = clean.slice(-1);
  return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
};

export const sameRut = (a: string, b: string): boolean =>
  cleanRut(a).replace(/^0+/, '') === cleanRut(b).replace(/^0+/, '');
