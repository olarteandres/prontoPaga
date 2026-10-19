import type { Role } from '@pronto/shared';

export interface MockUser {
  id: string;
  username: string;
  password: string;
  role: Role;
  rut?: string;
}

/** Credenciales mock: no hay persistencia segun el enunciado. */
export const MOCK_USERS: readonly MockUser[] = [
  { id: 'u-001', username: 'admin', password: 'admin123', role: 'admin' },
  { id: 'u-002', username: 'juan', password: 'juan123', role: 'user', rut: '12.345.678-5' },
  { id: 'u-003', username: 'maria', password: 'maria123', role: 'user', rut: '11.111.111-1' },
];
