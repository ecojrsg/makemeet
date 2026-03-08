import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { verificarSistema, ResultadoVerificacion } from '@/services/setupService';

interface EstadoSetup {
  verificando: boolean;
  conexionOk: boolean;
  tablasOk: boolean;
  tablasFaltantes: string[];
  tablasIADiagnostico: {
    api_keys: boolean;
    ai_request_logs: boolean;
  };
  proveedoresAuth: string[];
  errorMensaje: string | null;
  listo: boolean;
}

interface SetupContextType extends EstadoSetup {
  reintentar: () => Promise<void>;
}

const SetupContext = createContext<SetupContextType | undefined>(undefined);

const ESTADO_INICIAL: EstadoSetup = {
  verificando: true,
  conexionOk: false,
  tablasOk: false,
  tablasFaltantes: [],
  tablasIADiagnostico: {
    api_keys: false,
    ai_request_logs: false,
  },
  proveedoresAuth: [],
  errorMensaje: null,
  listo: false,
};

export function SetupProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoSetup>(ESTADO_INICIAL);

  const ejecutarVerificacion = useCallback(async () => {
    setEstado((prev) => ({ ...prev, verificando: true, errorMensaje: null }));

    try {
      const resultado: ResultadoVerificacion = await verificarSistema();

      const tablasFaltantes: string[] = [];
      if (!resultado.tablas.profiles) tablasFaltantes.push('profiles');
      if (!resultado.tablas.cvs) tablasFaltantes.push('cvs');

      const tablasOk = resultado.tablas.profiles && resultado.tablas.cvs;
      const listo = resultado.conexionOk && tablasOk;

      setEstado({
        verificando: false,
        conexionOk: resultado.conexionOk,
        tablasOk,
        tablasFaltantes,
        tablasIADiagnostico: {
          api_keys: resultado.tablas.api_keys,
          ai_request_logs: resultado.tablas.ai_request_logs,
        },
        proveedoresAuth: resultado.proveedoresAuth,
        errorMensaje: resultado.errorMensaje,
        listo,
      });
    } catch (error) {
      setEstado({
        verificando: false,
        conexionOk: false,
        tablasOk: false,
        tablasFaltantes: ['profiles', 'cvs'],
        tablasIADiagnostico: {
          api_keys: false,
          ai_request_logs: false,
        },
        proveedoresAuth: [],
        errorMensaje: error instanceof Error ? error.message : 'Error desconocido',
        listo: false,
      });
    }
  }, []);

  useEffect(() => {
    ejecutarVerificacion();
  }, [ejecutarVerificacion]);

  const reintentar = async () => {
    await ejecutarVerificacion();
  };

  return <SetupContext.Provider value={{ ...estado, reintentar }}>{children}</SetupContext.Provider>;
}

export function useSetup() {
  const context = useContext(SetupContext);
  if (context === undefined) {
    throw new Error('useSetup debe usarse dentro de un SetupProvider');
  }
  return context;
}
