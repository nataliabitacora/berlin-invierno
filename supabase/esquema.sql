-- Esquema de The Berlin Winter Project en Supabase.
-- Se pega entero en Supabase → SQL Editor → New query → Run. Solo hace falta una vez.

-- 1. Planes hechos y partida del juego: una fila por persona.
create table if not exists public.datos (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  contenido jsonb not null default '{}'::jsonb,
  actualizado timestamptz not null default now()
);
alter table public.datos enable row level security;
drop policy if exists "Cada persona solo ve y cambia lo suyo" on public.datos;
create policy "Cada persona solo ve y cambia lo suyo" on public.datos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2. Fotos del álbum: los datos de cada foto (la imagen va en el almacén "album").
create table if not exists public.fotos (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  ruta text not null,
  pie text,
  lugar text,
  fecha bigint not null
);
alter table public.fotos enable row level security;
drop policy if exists "Cada persona solo ve y cambia sus fotos" on public.fotos;
create policy "Cada persona solo ve y cambia sus fotos" on public.fotos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. Almacén privado de imágenes: cada persona en su carpeta (su id de usuario).
insert into storage.buckets (id, name, public) values ('album', 'album', false)
  on conflict (id) do nothing;
drop policy if exists "Album: ver lo propio" on storage.objects;
drop policy if exists "Album: subir lo propio" on storage.objects;
drop policy if exists "Album: borrar lo propio" on storage.objects;
create policy "Album: ver lo propio" on storage.objects for select
  using (bucket_id = 'album' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Album: subir lo propio" on storage.objects for insert
  with check (bucket_id = 'album' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Album: borrar lo propio" on storage.objects for delete
  using (bucket_id = 'album' and (storage.foldername(name))[1] = auth.uid()::text);
