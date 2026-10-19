import { Component, Suspense, type ReactNode } from 'react';
import styles from './RemoteBoundary.module.css';

interface Props {
  /** Nombre legible del modulo, para el mensaje de error. */
  name: string;
  url: string;
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/** Aisla la carga de un microfront: muestra un estado de carga y un error claro si el remote no responde. */
export class RemoteBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`[host] Error en el microfront ${this.props.name}`, error);
  }

  render() {
    const { name, url, children } = this.props;
    if (this.state.failed) {
      return (
        <div className={styles.error} role="alert">
          <p className={styles.errorTitle}>No se pudo cargar el módulo de {name}.</p>
          <p>
            Verifica que esté corriendo en <code>{url}</code> y vuelve a intentarlo.
          </p>
          <button className={styles.retry} type="button" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      );
    }
    return (
      <Suspense
        fallback={
          <p className={styles.loading} role="status">
            Cargando {name}…
          </p>
        }
      >
        {children}
      </Suspense>
    );
  }
}
