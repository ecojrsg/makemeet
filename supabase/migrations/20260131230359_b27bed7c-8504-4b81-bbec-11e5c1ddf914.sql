-- Eliminar políticas restrictivas existentes
DROP POLICY IF EXISTS "Usuarios pueden crear sus propios CVs" ON public.cvs;
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios CVs" ON public.cvs;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus propios CVs" ON public.cvs;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propios CVs" ON public.cvs;

-- Crear políticas PERMISIVAS correctas
CREATE POLICY "Usuarios pueden crear sus propios CVs"
ON public.cvs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden ver sus propios CVs"
ON public.cvs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios CVs"
ON public.cvs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propios CVs"
ON public.cvs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);