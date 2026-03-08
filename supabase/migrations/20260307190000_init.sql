-- Base migration for MakeMeEt.
-- Source of truth for schema initialization in empty databases.

create extension if not exists pgcrypto with schema extensions;

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

create table if not exists public.profiles (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null unique,
  nombre text,
  avatar_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.cvs (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null,
  nombre text not null default 'Mi CV',
  datos_cv jsonb not null,
  etiquetas text[] default '{}',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.api_keys (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  proveedor text not null check (proveedor in ('openai', 'gemini')),
  clave text not null,
  modelo text not null,
  activa boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create unique index if not exists unique_active_key_per_user
  on public.api_keys(user_id)
  where activa = true;

create table if not exists public.ai_request_logs (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  api_key_id uuid references public.api_keys(id) on delete set null,
  api_key_nombre text not null,
  proveedor text not null check (proveedor in ('openai', 'gemini')),
  modelo text not null,
  contexto text not null check (contexto in ('resumen', 'experiencia', 'educacion')),
  info_adicional text,
  prompt text not null,
  respuesta text not null,
  tiempo_respuesta_ms integer,
  intentos integer default 1,
  error_mensaje text,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_ai_logs_user_id on public.ai_request_logs(user_id);
create index if not exists idx_ai_logs_created_at on public.ai_request_logs(created_at desc);
create index if not exists idx_ai_logs_user_created on public.ai_request_logs(user_id, created_at desc);

-- ============================================
-- SEGURIDAD (RLS)
-- ============================================

alter table public.profiles enable row level security;
alter table public.cvs enable row level security;
alter table public.api_keys enable row level security;
alter table public.ai_request_logs enable row level security;

drop policy if exists "Usuarios pueden ver su propio perfil" on public.profiles;
create policy "Usuarios pueden ver su propio perfil"
on public.profiles for select
using (auth.uid() = user_id);

drop policy if exists "Usuarios pueden actualizar su propio perfil" on public.profiles;
create policy "Usuarios pueden actualizar su propio perfil"
on public.profiles for update
using (auth.uid() = user_id);

drop policy if exists "Usuarios pueden crear su propio perfil" on public.profiles;
create policy "Usuarios pueden crear su propio perfil"
on public.profiles for insert
with check (auth.uid() = user_id);

drop policy if exists "Usuarios pueden eliminar su propio perfil" on public.profiles;
create policy "Usuarios pueden eliminar su propio perfil"
on public.profiles for delete
using (auth.uid() = user_id);

drop policy if exists "Usuarios pueden ver sus propios CVs" on public.cvs;
create policy "Usuarios pueden ver sus propios CVs"
on public.cvs for select
using (auth.uid() = user_id);

drop policy if exists "Usuarios pueden crear sus propios CVs" on public.cvs;
create policy "Usuarios pueden crear sus propios CVs"
on public.cvs for insert
with check (auth.uid() = user_id);

drop policy if exists "Usuarios pueden actualizar sus propios CVs" on public.cvs;
create policy "Usuarios pueden actualizar sus propios CVs"
on public.cvs for update
using (auth.uid() = user_id);

drop policy if exists "Usuarios pueden eliminar sus propios CVs" on public.cvs;
create policy "Usuarios pueden eliminar sus propios CVs"
on public.cvs for delete
using (auth.uid() = user_id);

drop policy if exists "Usuarios pueden ver sus propias API keys" on public.api_keys;
create policy "Usuarios pueden ver sus propias API keys"
on public.api_keys for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Usuarios pueden insertar sus propias API keys" on public.api_keys;
create policy "Usuarios pueden insertar sus propias API keys"
on public.api_keys for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Usuarios pueden actualizar sus propias API keys" on public.api_keys;
create policy "Usuarios pueden actualizar sus propias API keys"
on public.api_keys for update
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Usuarios pueden eliminar sus propias API keys" on public.api_keys;
create policy "Usuarios pueden eliminar sus propias API keys"
on public.api_keys for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Usuarios pueden ver sus propios logs" on public.ai_request_logs;
create policy "Usuarios pueden ver sus propios logs"
on public.ai_request_logs for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Usuarios pueden insertar sus propios logs" on public.ai_request_logs;
create policy "Usuarios pueden insertar sus propios logs"
on public.ai_request_logs for insert
to authenticated
with check (auth.uid() = user_id);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

create or replace function public.crear_perfil_nuevo_usuario()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.profiles (user_id, nombre)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.crear_perfil_nuevo_usuario();

create or replace function public.actualizar_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.actualizar_updated_at();

drop trigger if exists update_cvs_updated_at on public.cvs;
create trigger update_cvs_updated_at
  before update on public.cvs
  for each row execute function public.actualizar_updated_at();

drop trigger if exists update_api_keys_updated_at on public.api_keys;
create trigger update_api_keys_updated_at
  before update on public.api_keys
  for each row execute function public.actualizar_updated_at();

create or replace function public.limpiar_logs_antiguos_por_usuario()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  limite_logs integer := 500;
begin
  delete from public.ai_request_logs
  where id in (
    select id from public.ai_request_logs
    where user_id = new.user_id
    order by created_at desc
    offset limite_logs
  );
  return new;
end;
$$;

drop trigger if exists trigger_limpiar_logs on public.ai_request_logs;
create trigger trigger_limpiar_logs
  after insert on public.ai_request_logs
  for each row execute function public.limpiar_logs_antiguos_por_usuario();
