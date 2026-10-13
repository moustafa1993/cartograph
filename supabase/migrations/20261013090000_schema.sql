-- The whole authorization layer: every row belongs to an organization, and a
-- row is readable when its organization is the one on the caller's Clerk
-- token. The application never filters by organization; if it sees another
-- organization's row, the policy is wrong.

-- ---------------------------------------------------------------------------
-- Row-level security on by default
-- ---------------------------------------------------------------------------

-- Installed before any table exists, so no table in public can be created
-- without RLS. Forgetting to enable it would return every row silently;
-- enabled with no policy returns nothing, which is visible. Only the second
-- failure is allowed to happen.
create schema if not exists private;

create or replace function private.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  cmd record;
begin
  for cmd in
    select * from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
      and schema_name = 'public'
  loop
    execute format('alter table %s enable row level security', cmd.object_identity);
  end loop;
end;
$$;

drop event trigger if exists ensure_rls;
create event trigger ensure_rls
  on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function private.rls_auto_enable();

-- The organization on the caller's Clerk session token. v2 tokens carry it
-- as o.id, v1 as org_id; reading both means a token version change can't
-- quietly empty every query. No organization on the token means null, which
-- matches no row.
create or replace function private.organization_id()
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'org_id', auth.jwt() -> 'o' ->> 'id')
$$;

grant usage on schema private to authenticated;
grant execute on function private.organization_id() to authenticated;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- Clerk owns organizations; this row exists so everything below has a real
-- foreign key to point at, and deleting it removes the organization's data.
create table public.organizations (
  id text primary key check (id like 'org\_%'),
  name text not null,
  created_at timestamptz not null default now()
);

-- One repository, mapped once, for the organization.
create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public.organizations (id) on delete cascade,
  repository text not null check (repository ~ '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'),
  commit_sha text check (commit_sha ~ '^[0-9a-f]{40}$'),
  status text not null default 'queued'
    check (status in ('queued', 'parsing', 'ready', 'failed')),
  -- Why a failed analysis failed. Only a failed one has a reason.
  error text check ((status = 'failed') = (error is not null)),
  created_by text not null,
  created_at timestamptz not null default now(),
  finished_at timestamptz check ((status in ('ready', 'failed')) = (finished_at is not null)),
  -- Lets every child carry (analysis_id, organization_id) as one foreign key,
  -- so a child's organization can never differ from its analysis's.
  unique (id, organization_id)
);

-- A package inside the repository: its root and the framework its adapter
-- recognised. A monorepo has several; a plain repository has one at "".
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public.organizations (id) on delete cascade,
  analysis_id uuid not null,
  root text not null,
  framework text,
  foreign key (analysis_id, organization_id)
    references public.analyses (id, organization_id) on delete cascade,
  unique (analysis_id, root)
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public.organizations (id) on delete cascade,
  analysis_id uuid not null,
  project_id uuid references public.projects (id) on delete cascade,
  path text not null,
  foreign key (analysis_id, organization_id)
    references public.analyses (id, organization_id) on delete cascade,
  unique (analysis_id, path)
);

-- An edge exists only because the parser resolved a real import to a real
-- file, so both ends are required.
create table public.edges (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public.organizations (id) on delete cascade,
  analysis_id uuid not null,
  source_file_id uuid not null references public.files (id) on delete cascade,
  target_file_id uuid not null references public.files (id) on delete cascade,
  kind text not null check (kind in ('import', 're-export', 'dynamic-import', 'require')),
  foreign key (analysis_id, organization_id)
    references public.analyses (id, organization_id) on delete cascade,
  unique (source_file_id, target_file_id, kind)
);

-- Only routes whose method and full path were both recovered from syntax.
create table public.routes (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public.organizations (id) on delete cascade,
  analysis_id uuid not null,
  file_id uuid not null references public.files (id) on delete cascade,
  method text not null,
  path text not null,
  foreign key (analysis_id, organization_id)
    references public.analyses (id, organization_id) on delete cascade
);

create table public.explanations (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public.organizations (id) on delete cascade,
  analysis_id uuid not null,
  file_id uuid not null references public.files (id) on delete cascade,
  body text not null,
  model text not null,
  created_at timestamptz not null default now(),
  foreign key (analysis_id, organization_id)
    references public.analyses (id, organization_id) on delete cascade
);

-- One role per file. Convention may assign any role; a model may only label
-- a file convention couldn't, and never with a routable role. Keep the model
-- list in step with MODEL_ROLES in lib/roles.ts.
create table public.file_roles (
  file_id uuid primary key references public.files (id) on delete cascade,
  organization_id text not null references public.organizations (id) on delete cascade,
  analysis_id uuid not null,
  role text not null,
  source text not null check (source in ('convention', 'model')),
  check (
    source = 'convention'
    or role in ('service', 'repository', 'model', 'util', 'config', 'component', 'hook')
  ),
  foreign key (analysis_id, organization_id)
    references public.analyses (id, organization_id) on delete cascade
);

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public.organizations (id) on delete cascade,
  analysis_id uuid not null,
  file_id uuid references public.files (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  foreign key (analysis_id, organization_id)
    references public.analyses (id, organization_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Indexes: the policy column and every foreign key
-- ---------------------------------------------------------------------------

create index analyses_organization_created_idx on public.analyses (organization_id, created_at desc);
create index projects_organization_idx on public.projects (organization_id);
create index files_organization_idx on public.files (organization_id);
create index files_project_idx on public.files (project_id);
create index edges_organization_idx on public.edges (organization_id);
create index edges_analysis_idx on public.edges (analysis_id);
create index edges_target_idx on public.edges (target_file_id);
create index routes_organization_idx on public.routes (organization_id);
create index routes_analysis_idx on public.routes (analysis_id);
create index routes_file_idx on public.routes (file_id);
create index explanations_organization_idx on public.explanations (organization_id);
create index explanations_analysis_idx on public.explanations (analysis_id);
create index explanations_file_idx on public.explanations (file_id);
create index file_roles_organization_idx on public.file_roles (organization_id);
create index file_roles_analysis_idx on public.file_roles (analysis_id);
create index insights_organization_idx on public.insights (organization_id);
create index insights_analysis_idx on public.insights (analysis_id);
create index insights_file_idx on public.insights (file_id);

-- ---------------------------------------------------------------------------
-- Access
-- ---------------------------------------------------------------------------

-- Signed-out callers get nothing at all. Signed-in callers may read; nothing
-- in the app writes yet, so no write is granted until something needs it.
revoke all on public.organizations, public.analyses, public.projects,
  public.files, public.edges, public.routes, public.explanations,
  public.file_roles, public.insights
  from anon, authenticated;

grant select on public.organizations, public.analyses, public.projects,
  public.files, public.edges, public.routes, public.explanations,
  public.file_roles, public.insights
  to authenticated;

create policy "members read their organization"
  on public.organizations for select to authenticated
  using (id = (select private.organization_id()));

create policy "members read their organization's rows"
  on public.analyses for select to authenticated
  using (organization_id = (select private.organization_id()));

create policy "members read their organization's rows"
  on public.projects for select to authenticated
  using (organization_id = (select private.organization_id()));

create policy "members read their organization's rows"
  on public.files for select to authenticated
  using (organization_id = (select private.organization_id()));

create policy "members read their organization's rows"
  on public.edges for select to authenticated
  using (organization_id = (select private.organization_id()));

create policy "members read their organization's rows"
  on public.routes for select to authenticated
  using (organization_id = (select private.organization_id()));

create policy "members read their organization's rows"
  on public.explanations for select to authenticated
  using (organization_id = (select private.organization_id()));

create policy "members read their organization's rows"
  on public.file_roles for select to authenticated
  using (organization_id = (select private.organization_id()));

create policy "members read their organization's rows"
  on public.insights for select to authenticated
  using (organization_id = (select private.organization_id()));

-- ---------------------------------------------------------------------------
-- Refuse to finish if any table in public is missing RLS or a policy
-- ---------------------------------------------------------------------------

do $$
declare
  offenders text;
begin
  select string_agg(c.relname, ', ' order by c.relname) into offenders
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r', 'p')
    and (
      not c.relrowsecurity
      or not exists (select 1 from pg_policy p where p.polrelid = c.oid)
    );
  if offenders is not null then
    raise exception 'tables in public without RLS or without a policy: %', offenders;
  end if;
end;
$$;
