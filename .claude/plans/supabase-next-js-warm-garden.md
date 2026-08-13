# 회원 프로필 테이블 생성 (profiles)

## Context

현재 프로젝트는 Supabase Auth(email/password)로 회원가입 기능은 구현되어 있지만
(`components/sign-up-form.tsx`), 가입한 사용자의 부가 정보(사용자명, 이름, 아바타 등)를
저장/관리할 곳이 없다. `auth.users`는 Supabase가 관리하는 내부 테이블이라 직접
컬럼을 추가할 수 없으므로, `auth.users`와 1:1로 연결된 `public.profiles` 테이블을
새로 만들어 회원 프로필 정보를 관리할 수 있게 한다.

현재 DB에는 Supabase 퀵스타트 예제 테이블인 `public.instruments`만 존재하고,
`supabase/` 로컬 CLI 디렉토리는 없다 — 이 프로젝트는 Supabase MCP 도구
(`mcp__supabase__apply_migration` 등)로 원격 DB를 직접 관리하는 방식을 쓴다.

이번 작업 범위는 **DB 스키마만** (테이블 + RLS 정책 + 회원가입 시 자동 생성 트리거)이며,
프로필 조회/수정 UI는 포함하지 않는다 (사용자 확인 완료).

필드 구성: 표준 필드 (`id`, `email`, `username`, `full_name`, `avatar_url`, `created_at`, `updated_at`) 사용.
RLS 조회 정책: 본인 프로필만 조회 가능 (다른 사용자 프로필 비공개, email 노출 방지).

## 구현 단계

### 1. 마이그레이션 적용 (`mcp__supabase__apply_migration`)

`name: create_profiles_table` 으로 아래 SQL 적용:

```sql
-- profiles 테이블: auth.users와 1:1 관계, 표준 프로필 필드 저장
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  username text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_key unique (username),
  constraint profiles_username_length check (
    username is null or char_length(username) between 3 and 30
  ),
  constraint profiles_username_format check (
    username is null or username ~ '^[a-zA-Z0-9_]+$'
  )
);

comment on table public.profiles is '사용자 프로필 정보. 회원가입 시 트리거로 auth.users와 함께 자동 생성됨.';

-- RLS 활성화
alter table public.profiles enable row level security;

-- 본인 프로필만 조회 가능
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- 본인 프로필만 수정 가능
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- insert/delete 정책은 의도적으로 생성하지 않음:
-- insert는 트리거(SECURITY DEFINER)로만, delete는 auth.users 삭제 시 CASCADE로만 처리

-- 회원가입 시 프로필 자동 생성 함수
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, username, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at 자동 갱신 함수 및 트리거
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
```

**설계 근거**
- `handle_new_user()`는 `SECURITY DEFINER` + `search_path` 고정: `auth.users` 트리거에서
  RLS를 우회해 insert해야 하고, search_path를 명시하지 않으면 Supabase 보안 어드바이저의
  "Function Search Path Mutable" 경고가 발생한다.
- `username`은 가입 시 수집하지 않으므로 nullable + `UNIQUE`(Postgres는 NULL 다중 허용) +
  길이/형식 체크로 나중에 값이 설정될 때만 검증한다.
- `email`은 가입 시점 값만 복사하고 이후 `auth.users.email` 변경과 자동 동기화하지는
  않는다 (범위 밖, 필요 시 후속 트리거로 추가 가능).

### 2. 검증

1. `mcp__supabase__list_tables` (`schemas: ["public"]`, `verbose: true`) — `profiles` 테이블,
   컬럼, PK/FK, `rls_enabled: true` 확인.
2. `mcp__supabase__get_advisors` (`type: "security"`) — 새 경고(특히 함수 search_path,
   RLS 미설정) 없는지 확인.
3. `mcp__supabase__list_migrations` — `create_profiles_table` 기록 확인.
4. 기존 회원가입 플로우(`components/sign-up-form.tsx` 또는 개발 서버)로 테스트 계정 가입 후,
   `mcp__supabase__execute_sql`로 `select id, email, username, created_at from public.profiles order by created_at desc limit 5;`
   실행해 프로필 행이 자동 생성됐는지 확인.

### 3. TypeScript 타입 반영 (필수 후속 작업)

DB 스키마 작업만으로는 기존 Supabase 클라이언트가 여전히 타입 없이 동작하므로 함께 처리한다.

1. `mcp__supabase__generate_typescript_types` 실행 → 결과를 새 파일
   `lib/supabase/database.types.ts`로 저장.
2. `lib/supabase/client.ts`: `createBrowserClient<Database>(...)`로 제네릭 적용
   (`import type { Database } from "./database.types"` 추가).
3. `lib/supabase/server.ts`: `createServerClient<Database>(...)`로 동일하게 적용.

## 관련 파일

- `lib/supabase/client.ts` — 브라우저 클라이언트 (타입 제네릭 추가)
- `lib/supabase/server.ts` — 서버 클라이언트 (타입 제네릭 추가)
- `lib/supabase/database.types.ts` — 신규 생성 (Supabase 타입 자동 생성 결과)
- `components/sign-up-form.tsx` — 참고용 (현재 `options.data` 메타데이터 미전달 확인,
  향후 회원가입 폼에서 username 등을 넘기면 트리거가 자동으로 반영함)
- 로컬 SQL 마이그레이션 파일은 생성하지 않음 — `supabase/` CLI 디렉토리가 없는 프로젝트
  구조이므로 MCP `apply_migration`으로 원격 DB에 직접 적용하고, 이력은 Supabase 자체
  마이그레이션 기록으로 관리한다.
