-- Pastelería Lina Valencia · Panel avanzado
-- Ejecutar completo en Supabase > SQL Editor (después de schema.sql). Se puede volver a ejecutar sin riesgo.

-- Especializaciones propias: el tipo de opción ya no está limitado a 4 valores fijos
alter table public.options drop constraint if exists options_kind_check;
alter table public.options add column if not exists price_extra numeric not null default 0;
alter table public.options add column if not exists description text not null default '';

-- Productos: precio base para calcular el total, anticipación, nota del recibo y preguntas al cliente
alter table public.products add column if not exists base_price numeric not null default 0;
alter table public.products add column if not exists lead_days int not null default 0;
alter table public.products add column if not exists receipt_note text not null default '';
alter table public.products add column if not exists custom_fields jsonb not null default '[]';

-- Tamaños: valor que suma cada tamaño al precio base
alter table public.portions add column if not exists price_extra numeric not null default 0;

-- Ajustes del negocio, del recibo y de las especializaciones (clave → JSON)
create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
drop policy if exists "lectura pública" on public.settings;
drop policy if exists "dueños escriben" on public.settings;
create policy "lectura pública" on public.settings for select using (true);
create policy "dueños escriben" on public.settings for all using (public.is_admin()) with check (public.is_admin());
