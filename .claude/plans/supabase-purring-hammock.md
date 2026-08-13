# profiles 테이블에 사용자 정보가 안 들어가는 버그 수정

## Context

사용자가 로그인/회원가입을 했는데 Supabase의 `public.profiles` 테이블에 자신의 row가 생성되어 있지 않은 문제. 원격 Supabase DB를 직접 조회해 원인을 확인했다.

`public.profiles`에는 `on_auth_user_created` 트리거(`auth.users` AFTER INSERT)가 `handle_new_user()` 함수를 호출해 profile을 자동 생성하는 구조가 이미 갖춰져 있다 (오늘 적용된 마이그레이션 `create_profiles_table`, `restrict_handle_new_user_execute`로 원격 DB에는 존재하지만 로컬 저장소에는 마이그레이션 파일이 없는 상태 — 이번 작업 범위에서는 이 로컬 동기화 문제는 다루지 않기로 함, 버그 수정만 진행).

문제는 두 가지가 겹쳐서 발생했다:

1. **권한 누락 (근본 원인, 모든 신규 가입에 영향)**: 두 번째 마이그레이션 `restrict_handle_new_user_execute`가 `handle_new_user()` 함수의 EXECUTE 권한을 `PUBLIC`에서 회수하면서, 실제로 `auth.users`에 INSERT를 수행해 트리거를 발동시키는 `supabase_auth_admin` 역할에는 EXECUTE 권한을 재부여하지 않았다. 확인 결과 `has_function_privilege('supabase_auth_admin', ...)` = `false`, 현재 EXECUTE 권한 보유자는 `postgres`, `service_role`뿐이다. 이 상태에서는 **지금 이 순간에도 새로 가입하는 모든 사용자**의 profile 생성이 실패한다 (트리거가 함수를 호출할 권한이 없어 에러).

2. **기존 사용자 미보정 (1명 한정)**: 실제 가입 시각(`06:39:23`)이 `create_profiles_table` 마이그레이션 적용 시각(`07:35:11`)보다 이르다. 즉 이 사용자는 트리거 자체가 존재하기 전에 가입했으므로, 트리거가 정상 작동해도 소급 적용되지 않아 profile row가 없다.

`profiles`의 RLS 정책은 `authenticated`에 대해 SELECT(본인)/UPDATE(본인)만 있고 INSERT 정책이 없음을 확인했다 — 클라이언트 코드에서 직접 insert하는 방식은 애초에 막혀 있으므로, `SECURITY DEFINER` 트리거를 고치는 것이 올바른 해결 방향이다 (애플리케이션 코드 변경은 불필요).

## 변경 사항

Supabase MCP의 `apply_migration`으로 새 마이그레이션 하나를 원격 프로젝트에 적용한다. 이름 예: `grant_handle_new_user_execute_and_backfill_profiles`.

마이그레이션 내용:

1. **권한 부여** — Supabase 공식 권장 패턴대로 `supabase_auth_admin`에 스키마 usage와 함수 EXECUTE 권한을 부여:
   ```sql
   grant usage on schema public to supabase_auth_admin;
   grant execute on function public.handle_new_user() to supabase_auth_admin;
   ```

2. **기존 사용자 백필** — `handle_new_user()`와 동일한 로직으로, `profiles`에 아직 row가 없는 `auth.users`를 채워 넣기:
   ```sql
   insert into public.profiles (id, email, username, full_name, avatar_url)
   select
     u.id,
     u.email,
     u.raw_user_meta_data ->> 'username',
     u.raw_user_meta_data ->> 'full_name',
     u.raw_user_meta_data ->> 'avatar_url'
   from auth.users u
   left join public.profiles p on p.id = u.id
   where p.id is null;
   ```

## 검증

1. 마이그레이션 적용 직후 `mcp__supabase__execute_sql`로 확인:
   - `select has_function_privilege('supabase_auth_admin', 'public.handle_new_user()', 'EXECUTE');` → `true`인지 확인
   - `select count(*) from public.profiles;` 가 `select count(*) from auth.users;`와 같아졌는지 확인 (현재 각각 0건, 1건 → 수정 후 1건, 1건이어야 함)
   - 기존 사용자 row의 `email` 값이 `auth.users`와 일치하는지 확인
2. `mcp__supabase__get_advisors`(security)로 새로 추가한 권한 부여가 예상치 못한 보안 경고를 유발하지 않는지 확인
3. 가능하면 사용자에게 앱에서 새로 회원가입(또는 재로그인)을 한 번 더 시도해 실제로 `profiles`에 row가 즉시 생기는지 눈으로 확인해달라고 안내
