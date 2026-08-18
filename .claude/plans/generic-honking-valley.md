# 모임 이벤트 관리 웹 MVP

## Context

수영, 헬스, 친구 모임 등 정기 모임의 주최자는 공지 전달, 참여자 관리(RSVP), 카풀 조율, 정산(더치페이)을 대부분 카카오톡 단톡방과 수기로 처리하고 있어 부담이 크다. 이 프로젝트는 순수 Next.js 16 + Supabase 스타터킷(인증만 구현됨, 도메인 기능·DB 테이블 전무)이므로, 이번 작업은 그린필드로 모임 이벤트 관리 도메인 전체를 설계·구축하는 것이다.

**확정된 MVP 범위** (사용자 확인 완료, 4개 항목 모두 추천안 채택):
- 공지, 참여자 관리(RSVP), 카풀, 정산 **4개 기능 모두 1차 MVP에 포함**
- 정산은 **기록형** (실제 결제/PG 연동 없음 — 금액 계산 + 계좌 안내 후 수동 송금)
- 카풀은 **텍스트 기반 매칭** (지도 API 연동 없음 — 출발지 텍스트 + 좌석수)
- 알림은 **앱 내 알림만** (카카오톡/이메일 연동 없음)

목표: 위 4개 기능이 동작하는 MVP를 만들되, 기존 인증·Supabase 클라이언트·Suspense 패턴을 최대한 재사용하고 불필요한 추상화(상태관리 라이브러리, 지도 SDK, 실시간 인프라 등)는 도입하지 않는다.

## 기존 코드베이스 확인 사항

- Next.js 16, `src/` 없이 루트 `app/`·`components/`·`lib/`, 경로 별칭 `@/*`
- `proxy.ts`가 `/`, `/login*`, `/auth*` 제외 전 경로를 이미 인증 가드 — 신규 라우트를 `app/protected/` 하위에 둘 필요 없음
- `lib/supabase/server.ts`/`client.ts` 그대로 재사용, `database.types.ts`는 `instruments`/`profiles`뿐(도메인 테이블 없음) — 스키마 변경마다 재생성 필요
- **`profiles` RLS는 `본인만 SELECT` 정책 하나뿐** → 모임원끼리 서로 이름을 봐야 하는 모든 화면이 막힘. 신규 정책 추가 필요(기존 정책은 유지)
- `profiles`는 `auth.users` 트리거로 자동 생성, `set_updated_at()` 트리거 함수가 이미 존재해 재사용 가능. `pgcrypto`(스키마 `extensions`) 설치되어 `gen_random_uuid()` 사용 가능
- `next.config.ts`의 `cacheComponents: true` → 동적 데이터는 async 컴포넌트로 분리 + `<Suspense>`로 감싸야 함. 참조 패턴: `app/protected/page.tsx`의 `UserDetails`(9-17행), `app/protected/layout.tsx`의 `AuthButton`(28-30행)
- shadcn `new-york`, 설치된 컴포넌트는 `badge, button, card, checkbox, dropdown-menu, input, label` 7개뿐
- **미설치**: `react-hook-form`, `zod`, `@hookform/resolvers`, `date-fns` (docs/guides/forms-react-hook-form.md의 "이미 설치됨" 서술은 오기이므로 무시 — CLAUDE.md가 명시적으로 경고)
- 로컬 `supabase/migrations` 폴더 없음 — 기존 스키마는 MCP/대시보드로 직접 적용된 것으로 보임. 신규 스키마도 `mcp__supabase__apply_migration` → `mcp__supabase__generate_typescript_types` 순서로 진행

## DB 스키마

### RLS 헬퍼 함수 (재귀 방지, SECURITY DEFINER, `profiles` 트리거와 동일 스타일)

- `is_group_member(p_group_id uuid) returns boolean`
- `is_group_organizer(p_group_id uuid) returns boolean`
- `shares_group_with(p_user_id uuid) returns boolean` — `profiles` SELECT 정책 확장용 (같은 그룹 멤버끼리 프로필 조회 허용)

### 테이블

| 테이블 | 핵심 컬럼 | 관계 |
|---|---|---|
| `groups` | name, description, invite_code(unique), created_by | |
| `group_members` | group_id, user_id, role(`organizer`\|`member`) | unique(group_id, user_id) |
| `events` | group_id, title, location, starts_at, ends_at, is_cancelled | 삭제 대신 취소 플래그(RSVP/카풀/정산 이력 보존) |
| `event_rsvps` | event_id, user_id, status(`attending`\|`not_attending`\|`pending`) | unique(event_id, user_id). 생성 시 전원 행을 미리 만들지 않고, `group_members` LEFT JOIN으로 미응답을 앱 레벨에서 pending 처리 |
| `announcements` | group_id, event_id(nullable), author_id, title, content | |
| `carpool_offers` | event_id, driver_id, departure_point(text), departure_time, total_seats | |
| `carpool_requests` | offer_id, passenger_id, status(`requested`\|`approved`\|`declined`\|`cancelled`) | unique(offer_id, passenger_id). 잔여좌석은 승인 처리 서버 액션에서 재검증(소규모 그룹이라 트리거 강제 불필요) |
| `settlements` | event_id, created_by, total_amount(정수 원), split_method(`equal`\|`custom`), bank_name/account_number/account_holder, status | |
| `settlement_shares` | settlement_id, user_id, amount, ratio(custom만), is_paid | unique(settlement_id, user_id). 균등분배는 `base = total/n`, 나머지를 앞에서부터 +1원씩 배정해 합계를 정확히 맞춤 |
| `notifications` | user_id, type(text), title, body, link_path, is_read | |

### 교차 사용자 쓰기용 RPC (SECURITY DEFINER, 서비스 롤 키 도입 회피)

1. `create_group(p_name, p_description) returns uuid` — group insert + 생성자를 organizer로 원자적 등록 (RLS 부트스트랩 문제 해결)
2. `join_group_by_invite_code(p_code) returns uuid`
3. `mark_settlement_share_paid(p_share_id) returns void` — 본인 share만 `is_paid` 플립
4. `notify_group(p_group_id, p_type, p_title, p_body, p_link_path, p_exclude_self default true) returns void`
5. `notify_user(p_user_id, ...) returns void` — 대상이 호출자와 그룹 공유하는지 확인 후 발송

### RLS 정책 요지

- 조회: 그룹 멤버 전원 (`is_group_member`) — `groups`, `events`, `event_rsvps`, `announcements`, `carpool_offers`, `settlements`, `settlement_shares` 공통. `carpool_requests`는 신청자 본인/해당 offer의 driver/organizer만. `notifications`는 본인 행만
- 쓰기: organizer 전용(`is_group_organizer`) — `events`, `announcements`, `settlements`, `settlement_shares`(amount/ratio). 본인 행만 — `event_rsvps`(자기 응답), `carpool_offers`(자기 offer), `carpool_requests`(자기 신청). RPC 전용 — `groups`/`group_members` insert, `notifications` insert, `settlement_shares.is_paid`

## 정보구조 / 라우트

`app/(dashboard)/` 라우트 그룹 신설(기존 `app/protected/layout.tsx`의 nav/footer 셸을 `components/site-header.tsx`로 소규모 추출해 재사용):

```
groups/page.tsx                                  # 내 모임 목록 + 생성 + 초대코드 참여
groups/new/page.tsx
groups/[groupId]/layout.tsx                       # 멤버십 검증 + 탭 nav(공지/이벤트/멤버)
groups/[groupId]/page.tsx                         # 모임 홈(최근 공지, 다가오는 이벤트, 초대코드)
groups/[groupId]/members/page.tsx                 # 조회만(MVP는 승격/추방 제외)
groups/[groupId]/announcements/page.tsx           # 목록 = 상세(카드 전체 노출, 별도 상세 페이지 없음)
groups/[groupId]/announcements/new/page.tsx
groups/[groupId]/announcements/[id]/edit/page.tsx
groups/[groupId]/events/page.tsx                  # 예정/지난 탭
groups/[groupId]/events/new/page.tsx
groups/[groupId]/events/[eventId]/page.tsx        # 개요 + RSVP 위젯 + 참석자 명단
groups/[groupId]/events/[eventId]/carpool/page.tsx    # 오퍼 목록 + 등록(Dialog) + 신청/승인
groups/[groupId]/events/[eventId]/settlement/page.tsx # 생성/조회/송금완료 체크
notifications/page.tsx                            # 알림함
```

카풀/정산은 최상위 라우트가 아니라 이벤트 상세의 하위 탭으로 둔다(둘 다 "특정 일정" 단위에서만 의미 있음). 카풀 등록은 필드가 적어 `Dialog`로 처리, 이벤트/정산 생성처럼 필드가 많은 폼은 전용 페이지 유지.

## 신규 의존성

- `zod` — 클라이언트(RHF resolver)와 서버 액션이 공유하는 유일한 검증 소스(정산 금액, 좌석수, 커스텀 분배 합계 등)
- `react-hook-form` + `@hookform/resolvers` — 필드가 많은 폼에만 사용(이벤트/정산 생성, 공지 작성). 필드 1~2개짜리(초대코드 입력 등)는 기존 `login-form.tsx`처럼 `useState` 유지
- `date-fns` — 일시 포맷팅
- shadcn 추가: `npx shadcn@latest add form dialog alert-dialog select tabs avatar textarea table skeleton sonner`
- **의도적 제외**: 상태관리 라이브러리(Server Actions + `router.refresh()`로 충분), `calendar`/`popover`(날짜는 `<input type="datetime-local">`로 MVP 처리), 테스트 러너, Realtime 인프라

## Cache Components 대응 & 알림 방식

- 이 도메인은 전부 사용자별 RLS 결과라 프리렌더 대상이 아님. `page.tsx`/`layout.tsx`는 동기 셸로 유지하고, 실제 쿼리는 별도 `async function`으로 분리해 `<Suspense fallback={<Skeleton/>}>`로 감싼다 (`app/protected/page.tsx`의 `UserDetails` 패턴 그대로 재사용)
- 멤버십 검증(`groups/[groupId]/layout.tsx`)은 `lib/groups/access.ts`의 평범한 서버 함수 `getGroupMembership(groupId)`로 뽑아 async 컴포넌트에서 호출 — 새 미들웨어 체계 도입 안 함
- 알림은 **폴링 채택** (Supabase Realtime 미사용): 초 단위 실시간성이 불필요한 도메인이고, Realtime은 replication 활성화·웹소켓 수명주기 관리 등 MVP 대비 비용이 큼. SiteHeader 알림 벨은 페이지 이동마다 새로 조회 + 클라이언트에서 30~60초 `setInterval`로 `router.refresh()`. 필요성이 확인되면 Phase 2 이후 Realtime으로 업그레이드 검토

## 역할/권한 모델

- `group_members.role`로 그룹 단위 역할 표현(한 사용자가 그룹마다 다른 역할 가능)
- DB: organizer 전용 액션은 전부 `is_group_organizer(group_id)` 헬퍼로 통일
- 앱: `lib/groups/roles.ts`의 `getMembership()` 함수 하나로 UI 노출 여부 + 서버 액션 조기 반환 양쪽 재사용
- MVP는 역할 승격/추방 UI 제외(organizer = 그룹 생성자 고정), 스키마는 이후 확장 가능하도록 대비됨

## 구현 단계 (각 단계 독립적으로 브라우저에서 검증 가능)

0. **도구 준비** — 의존성/shadcn 컴포넌트 설치, `(dashboard)` 레이아웃. 검증: `typecheck`/`lint`/`dev` 정상
1. **모임 기반** — `groups`/`group_members` + RPC 2종 + `profiles` 정책 확장 → 목록/생성/참여/멤버 목록. 검증: 계정 A 생성 → 초대코드로 B 참여 → 서로 이름 노출, 비멤버 차단, A만 수정 가능
2. **이벤트 + RSVP** — 목록/생성/상세 + RSVP 위젯 + 참석자 명단. 검증: organizer만 생성, RSVP 반영
3. **공지** — 작성/수정/목록 + `notify_group` RPC 확정. 검증: organizer만 작성, 멤버 전원 노출
4. **인앱 알림** — `notifications` 테이블 + 알림 벨/알림함 + 폴링. 검증: 공지가 알림으로 뜨는지, 읽음 처리
5. **카풀** — offers/requests + 이벤트 상세 내 탭(등록/목록/신청/승인) + `notify_user` 연결. 검증: 좌석 초과 처리, 승인/거절, 알림 발생
6. **정산** — settlements/shares + 균등/커스텀 분배 + 계좌 복사 + 송금완료 체크. 검증: 균등분배 나머지 배분 정확성, 커스텀 합계 검증
7. **마감** — 로딩/빈 상태/토스트 점검, `npm run typecheck && npm run lint && npm run format:check`, `mcp__supabase__get_advisors`로 보안 점검, 2개 계정으로 RLS 경계 재확인

## 재사용할 기존 파일

- `lib/supabase/server.ts` / `client.ts` — 클라이언트 생성 그대로 사용
- `app/protected/page.tsx` (9-17행), `app/protected/layout.tsx` (28-30행) — Suspense + 동적 데이터 경계 패턴
- `components/login-form.tsx` — 단순 폼(useState) 참조 패턴
- `lib/supabase/database.types.ts` — 마이그레이션마다 재생성

## 검증 방법

- 각 Phase 완료 시 `npm run dev`로 실제 브라우저에서 두 계정(생성자 계정 + 테스트 계정)으로 시나리오 수행
- 스키마 변경 후 `npm run typecheck`로 타입 불일치 확인
- Phase 7에서 `mcp__supabase__get_advisors`로 RLS 누락/성능 경고 최종 점검
