-- DW / FITNESS — initial schema
-- Source: Derrick Washington Fitness lean MVP blueprint (Oct 13, 2026).
-- Members read published catalog + their own profile, enrollments, sessions,
-- and entitlement. Member writes never touch member_access or owner_audit.
-- Privileged owner mutations use the service role (bypasses RLS).

begin;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.enrollment_status as enum ('active', 'archived', 'completed');
create type public.workout_session_state as enum (
  'not_started',
  'in_progress',
  'completed'
);
create type public.asset_readiness as enum ('pending', 'ready', 'failed');

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Catalog / content (owner-published; drafts stay hidden)
-- ---------------------------------------------------------------------------

create table public.video_assets (
  id uuid primary key default gen_random_uuid(),
  provider_asset_id text not null unique,
  readiness public.asset_readiness not null default 'pending',
  caption_readiness public.asset_readiness not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_versions (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null,
  version integer not null check (version >= 1),
  title text not null,
  planned_minutes integer not null check (planned_minutes > 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_id, version)
);

create table public.workout_blocks (
  id uuid primary key default gen_random_uuid(),
  workout_version_id uuid not null references public.workout_versions (id) on delete cascade,
  position integer not null check (position >= 1),
  instructions text not null,
  work_seconds integer not null default 0 check (work_seconds >= 0),
  rest_seconds integer not null default 0 check (rest_seconds >= 0),
  rounds integer not null default 1 check (rounds >= 1),
  video_asset_id uuid references public.video_assets (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workout_version_id, position)
);

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  level text not null,
  weeks integer not null check (weeks >= 1),
  equipment text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.program_sessions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs (id) on delete cascade,
  week_number integer not null check (week_number >= 1),
  session_order integer not null check (session_order >= 1),
  workout_version_id uuid not null references public.workout_versions (id),
  created_at timestamptz not null default now(),
  unique (program_id, week_number, session_order)
);

-- ---------------------------------------------------------------------------
-- Members
-- ---------------------------------------------------------------------------

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  goal text not null default '',
  equipment text not null default '',
  weekly_target integer not null default 3 check (weekly_target >= 1),
  timezone text not null default 'America/New_York',
  accepted_terms_version text,
  accepted_terms_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.member_access (
  user_id uuid primary key references auth.users (id) on delete cascade,
  access_until timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  program_id uuid not null references public.programs (id),
  status public.enrollment_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index enrollments_one_active_per_user
  on public.enrollments (user_id)
  where status = 'active';

create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  enrollment_id uuid not null,
  workout_version_id uuid not null references public.workout_versions (id),
  state public.workout_session_state not null default 'not_started',
  current_block integer check (current_block is null or current_block >= 1),
  started_at timestamptz,
  completed_at timestamptz,
  active_seconds integer not null default 0 check (active_seconds >= 0),
  completion_request_id uuid unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (enrollment_id, user_id)
    references public.enrollments (id, user_id)
    on delete cascade,
  foreign key (workout_version_id, current_block)
    references public.workout_blocks (workout_version_id, position)
);

create table public.owner_audit (
  id uuid primary key default gen_random_uuid(),
  actor uuid not null,
  action text not null,
  target text not null,
  "timestamp" timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index video_assets_readiness_idx
  on public.video_assets (readiness, caption_readiness);

create index workout_versions_workout_id_idx
  on public.workout_versions (workout_id);

create index workout_versions_published_at_idx
  on public.workout_versions (published_at)
  where published_at is not null;

create index workout_blocks_workout_version_id_idx
  on public.workout_blocks (workout_version_id);

create index workout_blocks_video_asset_id_idx
  on public.workout_blocks (video_asset_id)
  where video_asset_id is not null;

create index programs_published_at_idx
  on public.programs (published_at)
  where published_at is not null;

create index program_sessions_program_id_idx
  on public.program_sessions (program_id);

create index program_sessions_workout_version_id_idx
  on public.program_sessions (workout_version_id);

create index enrollments_user_id_idx
  on public.enrollments (user_id);

create index enrollments_program_id_idx
  on public.enrollments (program_id);

create index workout_sessions_user_id_idx
  on public.workout_sessions (user_id);

create index workout_sessions_enrollment_id_idx
  on public.workout_sessions (enrollment_id);

create index workout_sessions_workout_version_id_idx
  on public.workout_sessions (workout_version_id);

create index workout_sessions_state_idx
  on public.workout_sessions (user_id, state);

create index member_access_access_until_idx
  on public.member_access (access_until);

create index owner_audit_timestamp_idx
  on public.owner_audit ("timestamp" desc);

create index owner_audit_actor_idx
  on public.owner_audit (actor);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger video_assets_set_updated_at
  before update on public.video_assets
  for each row execute function public.set_updated_at();

create trigger workout_versions_set_updated_at
  before update on public.workout_versions
  for each row execute function public.set_updated_at();

create trigger workout_blocks_set_updated_at
  before update on public.workout_blocks
  for each row execute function public.set_updated_at();

create trigger programs_set_updated_at
  before update on public.programs
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger member_access_set_updated_at
  before update on public.member_access
  for each row execute function public.set_updated_at();

create trigger enrollments_set_updated_at
  before update on public.enrollments
  for each row execute function public.set_updated_at();

create trigger workout_sessions_set_updated_at
  before update on public.workout_sessions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Privileges: deny-by-default for anon; narrow grants for authenticated.
-- service_role retains full access and bypasses RLS.
-- ---------------------------------------------------------------------------

revoke all on table public.video_assets from anon, authenticated;
revoke all on table public.workout_versions from anon, authenticated;
revoke all on table public.workout_blocks from anon, authenticated;
revoke all on table public.programs from anon, authenticated;
revoke all on table public.program_sessions from anon, authenticated;
revoke all on table public.profiles from anon, authenticated;
revoke all on table public.member_access from anon, authenticated;
revoke all on table public.enrollments from anon, authenticated;
revoke all on table public.workout_sessions from anon, authenticated;
revoke all on table public.owner_audit from anon, authenticated;

grant select on table public.video_assets to authenticated;
grant select on table public.workout_versions to authenticated;
grant select on table public.workout_blocks to authenticated;
grant select on table public.programs to authenticated;
grant select on table public.program_sessions to authenticated;
grant select, update on table public.profiles to authenticated;
grant select on table public.member_access to authenticated;
grant select, update on table public.enrollments to authenticated;
grant select, update on table public.workout_sessions to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.video_assets enable row level security;
alter table public.workout_versions enable row level security;
alter table public.workout_blocks enable row level security;
alter table public.programs enable row level security;
alter table public.program_sessions enable row level security;
alter table public.profiles enable row level security;
alter table public.member_access enable row level security;
alter table public.enrollments enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.owner_audit enable row level security;

alter table public.video_assets force row level security;
alter table public.workout_versions force row level security;
alter table public.workout_blocks force row level security;
alter table public.programs force row level security;
alter table public.program_sessions force row level security;
alter table public.profiles force row level security;
alter table public.member_access force row level security;
alter table public.enrollments force row level security;
alter table public.workout_sessions force row level security;
alter table public.owner_audit force row level security;

-- Published catalog (drafts are never visible to members)

create policy "members_select_published_programs"
  on public.programs
  for select
  to authenticated
  using (published_at is not null and published_at <= now());

create policy "members_select_published_workout_versions"
  on public.workout_versions
  for select
  to authenticated
  using (published_at is not null and published_at <= now());

create policy "members_select_published_program_sessions"
  on public.program_sessions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.programs p
      where p.id = program_sessions.program_id
        and p.published_at is not null
        and p.published_at <= now()
    )
    and exists (
      select 1
      from public.workout_versions wv
      where wv.id = program_sessions.workout_version_id
        and wv.published_at is not null
        and wv.published_at <= now()
    )
  );

create policy "members_select_published_workout_blocks"
  on public.workout_blocks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workout_versions wv
      where wv.id = workout_blocks.workout_version_id
        and wv.published_at is not null
        and wv.published_at <= now()
    )
  );

create policy "members_select_published_video_assets"
  on public.video_assets
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workout_blocks wb
      join public.workout_versions wv
        on wv.id = wb.workout_version_id
      where wb.video_asset_id = video_assets.id
        and wv.published_at is not null
        and wv.published_at <= now()
    )
  );

-- Own profile, enrollments, and workout sessions (SELECT + UPDATE only).
-- History remains readable after access expiry. INSERT/DELETE are denied
-- for members; session start/enroll go through server-side service role.

create policy "members_select_own_profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "members_update_own_profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "members_select_own_enrollments"
  on public.enrollments
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "members_update_own_enrollments"
  on public.enrollments
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "members_select_own_workout_sessions"
  on public.workout_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "members_update_own_workout_sessions"
  on public.workout_sessions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Entitlement is readable by the member; writes are owner/service-role only.

create policy "members_select_own_member_access"
  on public.member_access
  for select
  to authenticated
  using (auth.uid() = user_id);

-- owner_audit: RLS on, no policies for authenticated/anon → no member access.

commit;
