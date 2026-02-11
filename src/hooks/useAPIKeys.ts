// Hook para gestionar API Keys del usuario (guardadas en Supabase)
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { APIKeySaved, APIKeyFormData, ProveedorIA } from '@/types/apiKeys';

export function useAPIKeys() {
  const [keys, setKeys] = useState<APIKeySaved[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar keys del usuario actual
  const loadKeys = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setKeys([]);
        return;
      }

      // @ts-ignore - tabla api_keys no está en tipos generados aún
      const { data, error: fetchError } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setKeys((data || []) as APIKeySaved[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar API keys';
      setError(errorMessage);
      console.error('[useAPIKeys] Error al cargar keys:', err);
    } finally {
      setLoading(false);
    }
  };

  // Agregar nueva key
  const addKey = async (formData: APIKeyFormData): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Debes estar autenticado para guardar API keys');
    }

    // Si la nueva key debe ser activa, desactivar las demás primero
    if (formData.guardar) {
      await deactivateAllKeys();
    }

    // @ts-ignore
    const { error: insertError } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        nombre: formData.nombre || `${formData.proveedor} - ${formData.modelo}`,
        proveedor: formData.proveedor,
        clave: formData.clave,
        modelo: formData.modelo,
        activa: formData.guardar, // Si guardar=true, marcar como activa por defecto
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    await loadKeys();
  };

  // Actualizar key existente
  const updateKey = async (id: string, formData: Partial<APIKeyFormData>): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Debes estar autenticado');
    }

    const updateData: any = {};
    
    if (formData.nombre !== undefined) updateData.nombre = formData.nombre;
    if (formData.proveedor !== undefined) updateData.proveedor = formData.proveedor;
    if (formData.clave !== undefined) updateData.clave = formData.clave;
    if (formData.modelo !== undefined) updateData.modelo = formData.modelo;

    // @ts-ignore
    const { error: updateError } = await supabase
      .from('api_keys')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id); // Asegurar que solo actualice sus propias keys

    if (updateError) {
      throw new Error(updateError.message);
    }

    await loadKeys();
  };

  // Eliminar key
  const deleteKey = async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Debes estar autenticado');
    }

    // @ts-ignore
    const { error: deleteError } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Asegurar que solo elimine sus propias keys

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    await loadKeys();
  };

  // Activar una key específica (desactiva las demás)
  const activateKey = async (id: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Debes estar autenticado');
    }

    // Desactivar todas las keys del usuario
    await deactivateAllKeys();

    // Activar la key seleccionada
    // @ts-ignore
    const { error: activateError } = await supabase
      .from('api_keys')
      .update({ activa: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (activateError) {
      throw new Error(activateError.message);
    }

    await loadKeys();
  };

  // Desactivar todas las keys del usuario
  const deactivateAllKeys = async (): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;

    // @ts-ignore
    await supabase
      .from('api_keys')
      .update({ activa: false })
      .eq('user_id', user.id);
  };

  // Obtener la key activa
  const getActiveKey = (): APIKeySaved | null => {
    return keys.find(k => k.activa) || null;
  };

  // Cargar keys al montar el componente
  useEffect(() => {
    loadKeys();
  }, []);

  return {
    keys,
    loading,
    error,
    activeKey: getActiveKey(),
    loadKeys,
    addKey,
    updateKey,
    deleteKey,
    activateKey,
  };
}
