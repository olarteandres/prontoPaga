# ProntoPaga · Consulta de Riesgo Financiero

MVP para consultar el **score crediticio** de personas o empresas por RUT, con autenticación JWT y control de acceso por rol (`admin` / `user`).

- **Backend:** API REST en Node.js + Express 5 + TypeScript.
- **Frontend:** arquitectura de **microfrontends** con React 19 + TypeScript + Vite y **Module Federation**: un `host` que orquesta dos remotes (`login` y `score`).

---

## Cómo correrlo

Requisitos: **Node.js 20.19+ o 22.12+** (probado con Node 24) y npm 10+.

```bash
npm install
npm run dev
```

`npm run dev` levanta las cuatro aplicaciones en paralelo:

| App | URL | Rol |
|---|---|---|
| **host** | http://localhost:5000 | **Abrir esta.** Shell: rutas, sesión y carga de los remotes |
| login (remote) | http://localhost:5001 | Microfront de inicio de sesión |
| score (remote) | http://localhost:5002 | Microfront de consulta de score |
| back | http://localhost:3000 | API REST |

No hace falta configurar variables de entorno para correr en local: todo tiene valores por defecto. Si quieres cambiarlos, cada paquete trae un `.env.example` (`back/`, `host/`, `front/login/`, `front/score/`) que puedes copiar como `.env`.

### Cuentas de prueba

| Usuario | Contraseña | Rol | RUT asociado | Puede consultar |
|---|---|---|---|---|
| `admin` | `admin123` | admin | — | Cualquier RUT |
| `juan` | `juan123` | user | 12.345.678-5 | Solo 12.345.678-5 |
| `maria` | `maria123` | user | 11.111.111-1 | Solo 11.111.111-1 |

Las mismas cuentas aparecen en el desplegable **"Cuentas de prueba"** de la pantalla de login.

### Otros comandos

```bash
npm test           # tests de todos los paquetes (Vitest)
npm run typecheck  # tsc --noEmit en todos los paquetes
```

---

## API

### `POST /login`

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"juan","password":"juan123"}'
# → { "token": "eyJhbGciOi..." }
```

Credenciales *mock* (sin base de datos). El JWT va firmado con HS256, expira en `JWT_EXPIRES_IN` (1h por defecto) y su payload contiene:

- `sub`: ID del usuario
- `role`: `"admin"` o `"user"`
- `rut`: RUT del usuario (**solo** si el rol es `user`)

### `GET /score/:rut`

```bash
curl http://localhost:3000/score/12.345.678-5 -H "Authorization: Bearer <token>"
# → { "rut": "12.345.678-5", "score": 12, "fecha": "2026-10-19T18:32:35Z" }
```

Acepta el RUT con o sin puntos y guion (`12.345.678-5`, `12345678-5`, `123456785`) y siempre lo responde en formato canónico.

**Cadena de middlewares:** `authenticate` → `validateRutParam` → `authorizeRutAccess` → handler.

| Caso | Respuesta |
|---|---|
| Sin token, token mal firmado o malformado | `401 UNAUTHORIZED` |
| Token expirado | `401 TOKEN_EXPIRED` |
| RUT con formato o dígito verificador inválido | `400 BAD_REQUEST` |
| `user` consultando un RUT distinto al de su token | `403 FORBIDDEN` |
| Credenciales incorrectas en `/login` | `401 INVALID_CREDENTIALS` |

Todos los errores comparten el mismo formato: `{ "error": { "code": "...", "message": "..." } }`.

### Algoritmo del score

Determinista: `sha256(RUT normalizado)` → primeros 4 bytes como entero → `% 101`. El mismo RUT siempre da el mismo score (0–100) sin importar el formato en que llegue, y el valor varía entre RUTs distintos (hay 101 valores posibles, así que dos RUTs pueden coincidir).

---

## Arquitectura

```
                    ┌──────────────────────── host :5000 ────────────────────────┐
                    │  SessionProvider (dueño único del token)                    │
                    │  /login ──► LoginPage ──► <LoginApp/>   ◄── remote login   │
                    │  /score ──► ScorePage ──► <ScoreApp/>   ◄── remote score   │
                    └──────────────┬───────────────────────────────┬─────────────┘
                     onLoginSuccess(token)              token, user, onUnauthorized
                                   │                               │
              login :5001 ─────────┘                               └───────── score :5002
                   │  POST /login                                   GET /score/:rut  │
                   └──────────────────────────► back :3000 ◄─────────────────────────┘
```

### Estructura del repo (npm workspaces)

```
back/            API REST (Express 5 + TS)
  src/config/        env y usuarios mock
  src/middlewares/   authenticate, authorize, validateRut, errorHandler
  src/routes/        /login y /score/:rut
  src/services/      firma/verificación JWT y cálculo del score
  test/              tests de integración con Supertest
front/login/     Microfront de login (expone ./LoginApp)
front/score/     Microfront de score (expone ./ScoreApp)
host/            Shell: router, sesión, carga de remotes
shared/          Contratos y utilidades compartidas por back y fronts
```

### Contratos tipados de punta a punta

`shared/` es la fuente única de verdad:

- **Tipos de la API** (`JwtPayload`, `LoginResponse`, `ScoreResponse`, `ApiErrorBody`): los usan el back al responder y los fronts al consumir.
- **Props de los remotes** (`LoginAppProps`, `ScoreAppProps`): las implementan los microfronts y el host las usa en `host/src/remotes.d.ts` para tipar `import('login/LoginApp')` y `import('score/ScoreApp')`. Si un remote cambia su contrato, el host deja de compilar.
- **RUT** (`isValidRut`, `formatRut`, `sameRut`): la misma validación con dígito verificador corre en el front (feedback inmediato) y en el back (fuente de verdad).
- **Tokens de diseño** (`tokens.css`): host y remotes comparten paleta y tipografía.

### Patrón Container / Presentational

Cada vista se divide en dos archivos con sufijo explícito:

- **`*.container.ts`**: un *custom hook* con el estado, los efectos, las llamadas a la API y el mapeo de errores a mensajes.
- **`*.presentational.tsx`**: un componente puro que solo pinta. **Sus props se infieren del hook** con `ReturnType<typeof useX>`, así no hay interfaces duplicadas que mantener sincronizadas.

```tsx
// useLogin.container.ts
export const useLogin = (props: LoginAppProps) => { /* ... */ return { values, errorMessage, handleSubmit, ... }; };
export type UseLoginResult = ReturnType<typeof useLogin>;

// LoginForm.presentational.tsx
export const LoginForm = ({ values, errorMessage, handleSubmit }: UseLoginResult) => <form>...</form>;

// LoginApp.tsx (módulo expuesto)
const LoginApp = (props: LoginAppProps) => <LoginForm {...useLogin(props)} />;
```

| Paquete | Container | Presentational |
|---|---|---|
| login | `useLogin.container.ts` | `LoginForm.presentational.tsx` |
| score | `useScoreQuery.container.ts` | `ScoreQuery.presentational.tsx`, `ScoreResult.presentational.tsx` |
| host | `useSession.container.ts`, `useLoginPage.container.ts`, `useScorePage.container.ts` | `LoginPage.presentational.tsx`, `ScorePage.presentational.tsx` |

### Responsabilidades entre microfronts

- **El host es el único que toca la sesión.** Los remotes no leen ni escriben storage: reciben todo por props y avisan por callbacks (`onLoginSuccess`, `onUnauthorized`). Así quedan desacoplados y se pueden testear (y correr) solos.
- Cada remote se puede levantar de forma aislada: `npm run dev -w front/login` o `npm run dev -w front/score` (este último acepta `?as=juan` o `?as=admin` para iniciar sesión de prueba).
- `react` y `react-dom` se comparten como **singleton** entre host y remotes.
- Si un remote no responde, `RemoteBoundary` muestra un error con la URL esperada y un botón **Reintentar** en vez de romper toda la app.

### Manejo de errores en la UI

| Situación | Qué ve el usuario |
|---|---|
| Credenciales incorrectas | Alerta en el formulario de login |
| RUT vacío o con dígito verificador inválido | Error bajo el campo, **sin** llamar a la API |
| `user` consulta un RUT ajeno (403) | "Tu cuenta solo puede consultar el score del RUT 12.345.678-5." |
| Token expirado o inválido (401) | El host cierra la sesión y muestra un aviso en el login |
| El JWT vence con la app abierta | Logout automático al llegar a `exp`, con aviso |
| API caída | Mensaje indicando que no se pudo conectar con el servidor |
| Remote caído | Error del módulo con botón "Reintentar" |

---

## Decisiones y supuestos

- **Bandas de riesgo:** el enunciado solo pide el número, así que para la UI definí 0–39 riesgo alto, 40–69 medio y 70–100 bajo (score más alto = mejor comportamiento crediticio).
- **El front no autoriza nada.** El host decodifica el JWT solo para la UI (mostrar el rol, precargar el RUT, programar el logout). La firma y los permisos los valida siempre el back.
- **Token en `sessionStorage`:** es simple y se borra al cerrar la pestaña. En producción preferiría una cookie `HttpOnly` + `SameSite` para no exponer el token a JavaScript ante un XSS.
- **Contraseñas en texto plano** en `back/src/config/users.ts`: es *mock*, tal como pide el enunciado. En un caso real irían hasheadas (bcrypt/argon2) en una base de datos.
- `JWT_SECRET` tiene un valor por defecto **solo fuera de producción**. Con `NODE_ENV=production`, el back no arranca si falta.

## Próximos pasos

- Refresh tokens y revocación de sesión.
- Rate limiting en `/login` contra fuerza bruta.
- Tests end-to-end (Playwright) sobre los cuatro servicios levantados.
- Despliegue de cada remote por separado con sus URLs inyectadas por entorno (`VITE_*_REMOTE_URL`).
