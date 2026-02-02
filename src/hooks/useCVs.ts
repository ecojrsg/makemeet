import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CVData } from '@/types/cv';
import { toast } from 'sonner';

export interface CVGuardado {
  id: string;
  nombre: string;
  etiquetas: string[];
  datos_cv: CVData;
  created_at: string;
  updated_at: string;
}

export function useCVs() {
  const { usuario } = useAuth();
  const [cvs, setCvs] = useState<CVGuardado[]>([]);
  const [cargando, setCargando] = useState(true);

  // Cargar CVs del usuario
  const cargarCVs = useCallback(async () => {
    if (!usuario) {
      setCvs([]);
      setCargando(false);
      return;
    }

    setCargando(true);
    const { data, error } = await supabase
      .from('cvs')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar los CVs');
      console.error(error);
    } else {
      // Mapear los datos para asegurar el tipo correcto
      const cvsFormateados: CVGuardado[] = (data || []).map(cv => ({
        id: cv.id,
        nombre: cv.nombre,
        etiquetas: cv.etiquetas || [],
        datos_cv: cv.datos_cv as unknown as CVData,
        created_at: cv.created_at,
        updated_at: cv.updated_at
      }));
      setCvs(cvsFormateados);
    }
    setCargando(false);
  }, [usuario]);

  useEffect(() => {
    cargarCVs();
  }, [cargarCVs]);

  // Guardar nuevo CV
  const guardarCV = async (nombre: string, etiquetas: string[], datos: CVData) => {
    if (!usuario) {
      toast.error('Debes iniciar sesión para guardar');
      return null;
    }

    const { data, error } = await supabase
      .from('cvs')
      .insert([{
        user_id: usuario.id,
        nombre,
        etiquetas,
        datos_cv: JSON.parse(JSON.stringify(datos))
      }])
      .select()
      .single();

    if (error) {
      toast.error('Error al guardar el CV');
      console.error(error);
      return null;
    }

    toast.success('CV guardado correctamente');
    await cargarCVs();
    return data;
  };

  // Actualizar CV existente
  const actualizarCV = async (id: string, nombre: string, etiquetas: string[], datos: CVData) => {
    if (!usuario) {
      toast.error('Debes iniciar sesión');
      return false;
    }

    const { error } = await supabase
      .from('cvs')
      .update({
        nombre,
        etiquetas,
        datos_cv: JSON.parse(JSON.stringify(datos))
      })
      .eq('id', id);

    if (error) {
      toast.error('Error al actualizar el CV');
      console.error(error);
      return false;
    }

    toast.success('CV actualizado');
    await cargarCVs();
    return true;
  };

  // Eliminar CV
  const eliminarCV = async (id: string) => {
    if (!usuario) {
      toast.error('Debes iniciar sesión');
      return false;
    }

    const { error } = await supabase
      .from('cvs')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error al eliminar el CV');
      console.error(error);
      return false;
    }

    toast.success('CV eliminado');
    await cargarCVs();
    return true;
  };

  return {
    cvs,
    cargando,
    guardarCV,
    actualizarCV,
    eliminarCV,
    recargar: cargarCVs
  };
}
