import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type {
  APIKey,
  APIKeyPersonal,
  APIKeyGlobal,
  APIKeyFormData,
  LocalStoragePersonalKeys,
  LocalStorageActiveKey,
} from '@/types/apiKeys';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_KEYS = {
  personalKeys: 'ai_personal_keys',
  activeKey: 'ai_active_key',
};

export function useAPIKeys() {
  const { usuario } = useAuth();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [activeKeyId, setActiveKeyId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar keys al iniciar
  useEffect(() => {
    loadKeys();
    checkIfAdmin();
  }, [usuario]);

  // Verificar si el usuario es admin
  async function checkIfAdmin() {
    if (!usuario) {
      setIsAdmin(false);
      return;
    }

    try {
      // @ts-ignore - is_admin no está en tipos generados aún
      const { data } = await supabase.from('profiles').select('is_admin').eq('user_id', usuario.id).single();

      setIsAdmin(data?.is_admin || false);
    } catch {
      setIsAdmin(false);
    }
  }

  // Cargar todas las keys (personales + globales)
  async function loadKeys() {
    setLoading(true);
    try {
      const personal = loadPersonalKeys();
      const global = await loadGlobalKeys();
      const active = loadActiveKey();

      setKeys([...personal, ...global]);
      setActiveKeyId(active?.keyId || null);
    } catch (error) {
      console.error('[useAPIKeys] Error al cargar keys:', error);
    } finally {
      setLoading(false);
    }
  }

  // Cargar keys personales desde localStorage
  function loadPersonalKeys(): APIKeyPersonal[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.personalKeys);
      if (!stored) return [];

      const data: LocalStoragePersonalKeys = JSON.parse(stored);
      return data.keys || [];
    } catch {
      return [];
    }
  }

  // Cargar keys globales desde Supabase
  async function loadGlobalKeys(): Promise<APIKeyGlobal[]> {
    try {
      // @ts-ignore - tabla api_keys no está en tipos generados aún
      const { data, error } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false });

      if (error) {
        console.warn('[useAPIKeys] Error al cargar keys globales:', error.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        nombre: row.nombre,
        proveedor: row.proveedor,
        clave: row.clave,
        modelo: row.modelo,
        tipo: 'global' as const,
        created_by: row.created_by,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch {
      return [];
    }
  }

  // Cargar key activa
  function loadActiveKey(): LocalStorageActiveKey | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.activeKey);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  // Guardar keys personales en localStorage
  function savePersonalKeys(personalKeys: APIKeyPersonal[]) {
    const data: LocalStoragePersonalKeys = { keys: personalKeys };
    localStorage.setItem(STORAGE_KEYS.personalKeys, JSON.stringify(data));
  }

  // Guardar key activa
  function saveActiveKey(keyId: string | null, tipo: 'personal' | 'global' | null) {
    if (!keyId || !tipo) {
      localStorage.removeItem(STORAGE_KEYS.activeKey);
      return;
    }

    const data: LocalStorageActiveKey = { keyId, tipo };
    localStorage.setItem(STORAGE_KEYS.activeKey, JSON.stringify(data));
  }

  // Agregar nueva key
  async function addKey(formData: APIKeyFormData): Promise<{ success: boolean; error?: string }> {
    try {
      if (formData.tipo === 'personal') {
        // Agregar key personal a localStorage
        const personalKeys = loadPersonalKeys();
        const newKey: APIKeyPersonal = {
          id: `local_${formData.proveedor}_${Date.now()}`,
          nombre: formData.nombre,
          proveedor: formData.proveedor,
          clave: formData.clave,
          modelo: formData.modelo,
          tipo: 'personal',
          createdAt: new Date().toISOString(),
        };

        personalKeys.push(newKey);
        savePersonalKeys(personalKeys);
        await loadKeys();

        return { success: true };
      } else {
        // Agregar key global a Supabase (solo admins)
        if (!isAdmin) {
          return { success: false, error: 'Solo los administradores pueden crear keys globales' };
        }

        // @ts-ignore - tabla api_keys no está en tipos generados aún
        const { error } = await supabase.from('api_keys').insert({
          nombre: formData.nombre,
          proveedor: formData.proveedor,
          clave: formData.clave,
          modelo: formData.modelo,
          created_by: usuario?.id || null,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        await loadKeys();
        return { success: true };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Error desconocido' };
    }
  }

  // Eliminar key
  async function deleteKey(key: APIKey): Promise<{ success: boolean; error?: string }> {
    try {
      if (key.tipo === 'personal') {
        // Eliminar key personal de localStorage
        const personalKeys = loadPersonalKeys();
        const filtered = personalKeys.filter((k) => k.id !== key.id);
        savePersonalKeys(filtered);

        // Si era la key activa, limpiar selección
        if (activeKeyId === key.id) {
          saveActiveKey(null, null);
          setActiveKeyId(null);
        }

        await loadKeys();
        return { success: true };
      } else {
        // Eliminar key global de Supabase (solo admins)
        if (!isAdmin) {
          return { success: false, error: 'Solo los administradores pueden eliminar keys globales' };
        }

        // @ts-ignore - tabla api_keys no está en tipos generados aún
        const { error } = await supabase.from('api_keys').delete().eq('id', key.id);

        if (error) {
          return { success: false, error: error.message };
        }

        // Si era la key activa, limpiar selección
        if (activeKeyId === key.id) {
          saveActiveKey(null, null);
          setActiveKeyId(null);
        }

        await loadKeys();
        return { success: true };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Error desconocido' };
    }
  }

  // Seleccionar key activa
  async function setActiveKey(key: APIKey | null) {
    if (!key) {
      saveActiveKey(null, null);
      setActiveKeyId(null);
      return;
    }

    saveActiveKey(key.id, key.tipo);
    setActiveKeyId(key.id);
  }

  return {
    keys,
    activeKeyId,
    isAdmin,
    loading,
    addKey,
    deleteKey,
    setActiveKey,
    refresh: loadKeys,
  };
}
