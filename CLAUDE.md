# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Supabase 공식 `with-supabase` Next.js 스타터 킷을 기반으로 한 프로젝트입니다 (README.md 참고). Next.js 16.3.0 App Router + `@supabase/ssr` 쿠키 기반 인증 + shadcn/ui(new-york 스타일)로 구성되어 있습니다. `app/`, `components/tutorial/*`, `hasEnvVars` 분기 등은 스타터 킷의 튜토리얼용 코드로, 실제 기능을 만들면서 점진적으로 대체/삭제될 것을 전제로 합니다.

## 명령어

```bash
npm run dev            # 개발 서버 (localhost:3000)
npm run build           # 프로덕션 빌드
npm run start           # 빌드된 앱 실행
npm run lint            # ESLint (next/core-web-vitals + next/typescript + prettier)
npm run lint:fix        # ESLint 자동 수정
npm run format           # Prettier로 전체 포맷
npm run format:check    # Prettier 포맷 검사만 (수정 없음)
npm run typecheck        # tsc --noEmit
```

- 테스트 러너가 설정되어 있지 않습니다 (Jest/Vitest 등 미설치).
- `check-all`처럼 위 검사들을 한 번에 묶어 실행하는 스크립트는 없습니다. 필요하면 위 명령어를 각각 실행하세요 (`docs/guides/nextjs-16.md`가 `npm run check-all`을 언급하지만 실제로는 존재하지 않습니다 — 아래 "docs/ 폴더 주의사항" 참고).
- Husky + lint-staged가 커밋 시 자동으로 `eslint --fix`/`prettier --write`를 실행합니다 (`.husky/`, `package.json`의 `lint-staged` 설정).
- 로컬 실행 전 `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`가 설정되어 있어야 합니다. 없으면 `lib/utils.ts`의 `hasEnvVars`가 `false`가 되어 홈페이지가 "Connect Supabase" 안내 UI로 대체됩니다.

## 아키텍처

### 폴더 구조 (src/ 없음)

`app/`, `components/`, `lib/`가 프로젝트 루트에 바로 위치합니다 (`src/` 디렉토리 없음). `tsconfig.json`의 경로 별칭은 `@/*` → `./*` 하나뿐입니다. `components.json`(shadcn 설정)의 별칭도 이 구조를 기준으로 합니다.

> ⚠️ `docs/guides/project-structure.md`는 `src/app`, `src/components` 같은 `src/` 기반 구조를 설명하지만 실제 코드베이스와 다릅니다. 새 파일을 만들 때는 실제 구조(루트의 `app/`, `components/`, `lib/`)를 따르세요.

### Supabase 클라이언트 3분할 패턴

- `lib/supabase/client.ts` — 브라우저(Client Component)용, `createBrowserClient`
- `lib/supabase/server.ts` — 서버(Server Component/Route Handler)용, 요청마다 새로 생성 (Fluid compute 환경에서 전역 변수에 담지 말 것). `next/headers`의 `cookies()`로 쿠키를 읽고 쓰되, Server Component에서 호출된 `setAll`은 실패를 조용히 무시하도록 되어 있음 — proxy가 세션 갱신을 담당하기 때문
- `lib/supabase/proxy.ts` — `updateSession()`. 루트의 `proxy.ts`가 모든 요청에서 호출하며, `supabase.auth.getClaims()`와 `NextResponse` 사이에 다른 로직을 끼워 넣지 말 것(주석 경고 있음 — 세션이 랜덤하게 끊기는 버그의 원인이 됨)

둘 다 `Database` 타입(`lib/supabase/database.types.ts`)으로 제네릭을 걺 — 스키마를 변경했다면 이 파일을 재생성해야 함(`mcp__supabase__generate_typescript_types` 또는 Supabase CLI).

### 인증 라우팅: proxy.ts (Next 16의 middleware.ts 후속)

Next.js 16부터 `middleware.ts`/`middleware()`가 `proxy.ts`/`proxy()`로 이름이 바뀌었습니다(Node.js 런타임 기본). 루트의 `proxy.ts`는 정적 자산(`_next/static`, `_next/image`, `favicon.ico`, 이미지 확장자)을 제외한 모든 요청에서 `updateSession()`을 호출하고, 미인증 사용자가 `/`, `/login*`, `/auth*` 이외 경로에 접근하면 `/auth/login`으로 리다이렉트합니다. 인증 관련 페이지는 `app/auth/`(login, sign-up, forgot-password, update-password, error, confirm route handler) 아래에 있습니다.

### Cache Components 활성화됨

`next.config.ts`에 `cacheComponents: true`가 켜져 있습니다(Next 15의 실험적 `dynamicIO`가 정식화된 기능). 정적으로 결정되지 않는 데이터를 쓰는 컴포넌트는 `'use cache'`, `<Suspense>`, 또는 동적 렌더링 경계로 명시적으로 감싸야 빌드/런타임 오류가 나지 않습니다. `app/protected/page.tsx`의 `UserDetails`가 `Suspense`로 감싸진 이유이기도 합니다.

### shadcn/ui

스타일은 `new-york`, base color `neutral`, RSC 지원(`components.json`). 새 컴포넌트 추가는 `npx shadcn@latest add <component>`. 기존 `components/ui/*`를 직접 수정하기보다 조합(composition)으로 확장하는 편이 컴포넌트 재생성 시 충돌을 피할 수 있습니다.

## docs/ 폴더 주의사항

`docs/guides/`에 한국어 가이드 문서(`project-structure.md`, `styling-guide.md`, `component-patterns.md`, `forms-react-hook-form.md`, `nextjs-16.md`)가 있습니다. 이 문서들은 이 프로젝트를 위해 작성되었지만 **일부 내용이 현재 코드베이스 상태와 어긋납니다**:

- `project-structure.md`는 `src/` 레이아웃을 전제로 함 → 실제로는 루트 레이아웃 (위 참고)
- `forms-react-hook-form.md`는 `react-hook-form`, `@hookform/resolvers`, `zod`가 "이미 설치됨"이라 적혀 있지만 `package.json`에 없음 — 폼 작업 시 실제로 설치되어 있는지 먼저 확인할 것
- `nextjs-16.md`의 "코드 품질 체크리스트"가 언급하는 `npm run check-all`은 `package.json`에 정의되어 있지 않음 (`typecheck`, `format:check`는 존재함)

각 문서의 코드 패턴(Server/Client 컴포넌트 경계, cn() 사용법, App Router 규칙 등) 자체는 유효하지만, 특정 패키지/스크립트의 존재 여부는 실제 `package.json`과 대조해서 판단하세요.

## MCP 서버

`.mcp.json`에 `supabase`(원격 프로젝트에 직결), `playwright`, `context7`, `shadcn`, `shrimp-task-manager`, `sequential-thinking` MCP 서버가 구성되어 있습니다. 스키마 조회/마이그레이션/로그 확인은 `mcp__supabase__*` 도구를, UI 컴포넌트 탐색은 `mcp__shadcn__*` 도구를 우선 활용하세요.
