# Interacciones con IA

Este documento describe cómo se usó **Claude Code** (Claude Opus, integrado en VS Code) como asistente de desarrollo en este desafío: primero la configuración del agente y después cómo se definieron los patrones de diseño y las decisiones de arquitectura.

El criterio general fue que **las decisiones de arquitectura las tomé yo y la IA las implementó dentro de esas reglas**. Cada bloque lo revisé y lo commiteé yo.

---

## 1. Configuración del agente

> **Antes de escribir código, configuré el agente para que trabajara con un proceso definido: entender primero, implementar por bloques y verificar antes de entregar.**

### 1.1 Plugins

Instalé dos plugins de Claude Code a nivel de usuario:

| Plugin | Origen | Propósito |
|---|---|---|
| **superpowers** (v7.0.0) | Marketplace `obra/superpowers-marketplace` | Agrega *skills* de proceso: relevar requisitos antes de construir, planificar, aplicar TDD, depurar de forma sistemática y verificar antes de dar algo por terminado. |
| **frontend-design** | Directorio oficial de plugins de Anthropic | Agrega lineamientos de diseño de UI para lograr una interfaz con identidad visual propia y no un aspecto de plantilla. |

Ambos están habilitados en `~/.claude/settings.json`:

```json
{
  "enabledPlugins": {
    "superpowers@superpowers-marketplace": true,
    "frontend-design@anthropic-plugin-directory": true
  }
}
```

### 1.2 Inventario de skills

Al iniciar, el agente revisó las skills disponibles y las clasificó según si aplicaban al proyecto:

- **Proceso:** `brainstorming`, `writing-plans`, `executing-plans`, `test-driven-development`, `systematic-debugging`, `verification-before-completion`, `requesting-code-review`.
- **Implementación y calidad:** `frontend-design`, `code-review`, `security-review`, `simplify`, `run`.

### 1.3 Control del historial de commits

El desafío evalúa los commits hechos dentro del plazo. Por eso configuré una regla en la **memoria persistente** del agente: el agente no ejecuta `git commit`. Al terminar cada bloque funcional, sigue este ciclo:

1. ejecuta los tests y el chequeo de tipos,
2. se detiene,
3. propone un mensaje de commit siguiendo *Conventional Commits*.

Yo reviso los cambios y hago el commit. Como la regla queda guardada en la memoria del proyecto, se mantiene también en sesiones nuevas. El resultado es un historial en bloques chicos y estables:

```
feat(back): API REST con login JWT, score por RUT y middlewares de auth/roles
feat(front/login): microfront de login con Module Federation (container hook + vista)
feat(front/score): microfront de consulta de score con escala de riesgo
feat(host): shell con Module Federation, sesión JWT, rutas protegidas y remotes caídos
docs: README con instrucciones de ejecución, API, arquitectura y decisiones
```

### 1.4 Contexto del desafío

Le entregué al agente el enunciado completo como imágenes del documento original. Así trabajó sobre los requisitos literales: endpoints, payload del JWT, middlewares, manejo de errores y plazo.

---

## 2. Patrones de diseño y decisiones de arquitectura

### 2.1 Restricciones iniciales

Antes de empezar, definí las restricciones base del proyecto:

- **Separación en tres partes:** backend, microfrontend(s) y host, cada una en su propia carpeta dentro del mismo repositorio.
- **TypeScript** en todo el proyecto.
- **Patrón Container / Presentational** en el front, con el container implementado como **custom hook**. Así las props del componente de presentación se infieren del tipo de retorno del hook y no hace falta mantener interfaces duplicadas.

### 2.2 Relevamiento de requisitos (skill `brainstorming`)

Con esas restricciones, el agente hizo una ronda de preguntas, de a una por vez, y después de cada respuesta resumió lo entendido para validarlo. Así se cerraron estas decisiones:

| Tema | Decisión |
|---|---|
| Integración entre host y microfronts | **Module Federation**: los remotes se cargan en runtime desde el host. |
| Ubicación del login | El login es un **microfront independiente**, no parte del host. Quedan dos remotes: `front/login` y `front/score`. |
| Bundler | **Vite**, con `@module-federation/vite`. |

Después, el agente presentó como propuesta las decisiones de implementación restantes. Las validé antes de empezar a codear:

- monorepo con **npm workspaces** y un único `npm run dev` para levantar los cuatro servicios;
- paquete **`shared/`** como fuente única de tipos de la API, contratos de props de los remotes y validación de RUT;
- **CSS Modules**, sin librerías de UI;
- validación del RUT con **dígito verificador** en el front (feedback inmediato) y en el back (fuente de verdad);
- **Vitest** y **Supertest** para los tests.

### 2.3 Responsabilidades entre el host y los remotes

Se estableció que **el host es el único dueño de la sesión**. Los remotes no leen ni escriben en el storage: reciben todo por props y avisan por callbacks (`onLoginSuccess`, `onUnauthorized`). Los contratos están tipados en `shared/src/contracts.ts`, así que si un remote cambia sus props, el host deja de compilar.

### 2.4 Convención de nombres

Durante la implementación, definí que cada archivo indique en su nombre qué rol cumple en el patrón. La convención se aplicó a todo el código existente y a todo lo nuevo:

```
useLogin.container.ts          → hook con estado, llamadas a la API y mapeo de errores
LoginForm.presentational.tsx   → componente puro; sus props son ReturnType<typeof useLogin>
LoginApp.tsx                   → composición: <LoginForm {...useLogin(props)} />
```

### 2.5 Implementación por bloques

El desarrollo avanzó por bloques independientes, en este orden: **backend → microfront de login → microfront de score → host → documentación**. Cada bloque se verificó y se commiteó antes de pasar al siguiente.

---

## 3. Skills utilizadas

| Skill | Plugin | Uso |
|---|---|---|
| **`superpowers:using-superpowers`** | superpowers | Se carga al iniciar cada sesión y hace que el agente evalúe qué skill aplica antes de actuar. |
| **`superpowers:brainstorming`** | superpowers | Relevamiento de requisitos y decisiones de arquitectura antes de implementar. |
| **`frontend-design:frontend-design`** | frontend-design | Definición de la identidad visual de los fronts: tokens de diseño compartidos (`shared/src/styles/tokens.css`), tipografía y diseño responsive. |
| **Memoria persistente** | Claude Code | Regla de control de commits, vigente entre sesiones. |

### Verificación

Además de las skills, cada bloque se verificó antes de darlo por terminado:

- `npm test` y `npm run typecheck` en cada paquete;
- pruebas de los endpoints con `curl`: respuestas 401, 403 y 400, y que el score sea determinista;
- pruebas de punta a punta con **Playwright** sobre un navegador headless: el flujo de login y consulta, el intento de consultar un RUT ajeno, el logout por token inválido, capturas en desktop y en mobile, y el comportamiento cuando un remote no está disponible. Esta última prueba dio origen al componente `RemoteBoundary`.

---

## 4. Resumen de decisiones

| Definidas por mí | Propuestas por la IA y validadas por mí |
|---|---|
| Back, host y microfronts en carpetas separadas | Monorepo con npm workspaces y paquete `shared/` |
| Module Federation | Host como único dueño de la sesión; remotes por props y callbacks |
| Login como microfront independiente | Contratos de props tipados entre el host y los remotes |
| Vite como bundler | `RemoteBoundary` para manejar remotes caídos |
| Container (hook) & Presentational con inferencia de tipos | Score determinista con `sha256(RUT) % 101` |
| Sufijos `.container` / `.presentational` | Bandas de riesgo (0–39 alto, 40–69 medio, 70–100 bajo) |
| Control manual de commits, uno por bloque | Validación de RUT compartida entre front y back |
