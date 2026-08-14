# 프로젝트 구조 가이드

이 문서는 Next.js 16.3.0 프로젝트의 폴더 구조, 파일 조직 및 네이밍 컨벤션을 정의합니다.

> ℹ️ 이 프로젝트는 `src/` 디렉토리를 사용하지 않습니다. `app/`, `components/`, `lib/`가 프로젝트 루트에 바로 위치합니다.

## 🏗️ 전체 프로젝트 구조 (현재 상태)

```
nextjs-supabase-app/
├── docs/                   # 📚 프로젝트 문서 (이 파일 포함)
├── app/                    # 🚀 Next.js App Router (루트 위치, src/ 아님)
├── components/             # 🧩 React 컴포넌트 (루트 위치)
├── lib/                    # 🛠️ 유틸리티 및 Supabase 클라이언트 (루트 위치)
├── proxy.ts                # 🔐 인증 세션 갱신 (Next 16의 middleware.ts 후속)
├── components.json         # shadcn/ui 설정
├── next.config.ts          # Next.js 설정
├── package.json            # 의존성 및 스크립트
├── tsconfig.json            # TypeScript 설정
└── CLAUDE.md                # 개발 지침 메인 문서
```

## 📁 세부 폴더 구조

### app/ - App Router 페이지 (현재 실제 구성)

```
app/
├── layout.tsx              # 🎨 루트 레이아웃 (ThemeProvider, Geist 폰트)
├── page.tsx                # 🏠 홈페이지 (/)
├── globals.css             # 🎨 전역 CSS 스타일 (Tailwind + shadcn 변수)
├── favicon.ico
├── auth/                   # 🔐 인증 관련 페이지
│   ├── login/page.tsx
│   ├── sign-up/page.tsx
│   ├── sign-up-success/page.tsx
│   ├── forgot-password/page.tsx
│   ├── update-password/page.tsx
│   ├── error/page.tsx
│   └── confirm/route.ts    # OTP 토큰 검증 Route Handler
└── protected/               # 인증된 사용자만 접근하는 페이지
    ├── layout.tsx
    └── page.tsx
```

**🚀 App Router 규칙:**

- `page.tsx`: 해당 경로의 메인 페이지
- `layout.tsx`: 레이아웃 컴포넌트 (자식 페이지 감쌈)
- `route.ts`: Route Handler (API 엔드포인트)
- `loading.tsx` / `error.tsx` / `not-found.tsx`: 필요할 때 추가 (현재 프로젝트에는 없음)

### components/ - 컴포넌트 조직 (현재 실제 구성)

```
components/
├── ui/                     # 🎛️ shadcn/ui 기본 컴포넌트
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   └── label.tsx
├── tutorial/                # 📘 Supabase 스타터 킷의 튜토리얼 전용 컴포넌트
│   ├── code-block.tsx
│   ├── connect-supabase-steps.tsx
│   ├── fetch-data-steps.tsx
│   ├── sign-up-user-steps.tsx
│   └── tutorial-step.tsx
├── auth-button.tsx          # 인증 상태에 따른 버튼 (로그인/로그아웃 분기)
├── logout-button.tsx
├── login-form.tsx
├── sign-up-form.tsx
├── forgot-password-form.tsx
├── update-password-form.tsx
├── theme-switcher.tsx        # next-themes 기반 다크모드 토글
├── env-var-warning.tsx       # Supabase 환경변수 미설정 시 경고 UI
├── deploy-button.tsx
├── hero.tsx
├── next-logo.tsx
└── supabase-logo.tsx
```

**🧩 컴포넌트 분류 규칙:**

1. **ui/**: shadcn/ui 기반 재사용 가능한 기본 컴포넌트. 순수 UI, 비즈니스 로직 없음. `npx shadcn@latest add <name>`으로 추가
2. **tutorial/**: Supabase 공식 스타터 킷의 데모용 컴포넌트. 실제 기능 개발이 진행되면 삭제 대상
3. **루트(components/ 바로 아래)**: 인증 폼, 헤더 요소 등 이 프로젝트 전용 컴포넌트

> `layout/`, `navigation/`, `sections/`, `providers/` 같은 하위 폴더는 아직 존재하지 않습니다. 컴포넌트 수가 늘어나 루트가 복잡해지면 이런 카테고리 폴더 도입을 고려하되, 먼저 실제로 필요해졌을 때 만드세요(선제적으로 빈 폴더를 만들지 말 것).

### lib/ - 유틸리티 및 Supabase 클라이언트 (현재 실제 구성)

```
lib/
├── utils.ts                 # cn() 헬퍼, hasEnvVars 체크
└── supabase/
    ├── client.ts             # 브라우저(Client Component)용 클라이언트
    ├── server.ts              # 서버(Server Component/Route Handler)용 클라이언트
    ├── proxy.ts               # updateSession() — 루트 proxy.ts에서 호출
    └── database.types.ts      # Supabase 스키마 기반 타입 (재생성 필요 시 CLI/MCP 사용)
```

**📚 lib/ 폴더 확장 시:**

새로운 종류의 유틸리티가 필요해지면 아래처럼 하위 폴더를 만들 수 있습니다 (아직 없음 — 필요해질 때 생성):

```
lib/
├── types/             # TypeScript 타입 정의
├── hooks/              # 커스텀 훅
├── schemas/            # Zod 스키마 (zod 설치 후)
└── actions/             # Server Actions
```

## 🏷️ 파일 네이밍 컨벤션

### 파일명 규칙

```bash
# ✅ 올바른 파일명 (이 프로젝트의 실제 컨벤션)
auth-button.tsx          # kebab-case — 컴포넌트 파일 전반
login-form.tsx
theme-switcher.tsx

# ❌ 잘못된 파일명
auth_button.tsx          # snake_case (금지)
AuthButton.tsx            # PascalCase 파일명 (이 프로젝트에서는 미사용)
```

### 컴포넌트 네이밍

```typescript
// ✅ 올바른 컴포넌트 네이밍 (export 함수명은 PascalCase, 파일명은 kebab-case)
export function AuthButton() {} // components/auth-button.tsx
export function LoginForm() {} // components/login-form.tsx

// ❌ 잘못된 컴포넌트 네이밍
export function authButton() {} // camelCase (금지)
```

## 🔗 경로 별칭 (Path Aliases)

`tsconfig.json`에는 별칭이 하나뿐입니다:

```json
"paths": { "@/*": ["./*"] }
```

`components.json`(shadcn 설정)의 별칭도 이를 기준으로 매핑됩니다:

- `@/components` → `components`
- `@/components/ui` → `components/ui`
- `@/lib` → `lib`
- `@/lib/utils` → `lib/utils.ts`
- `@/hooks` → `hooks` (⚠️ 이 폴더는 아직 존재하지 않습니다. shadcn CLI가 훅이 필요한 컴포넌트를 추가할 때 자동 생성합니다.)

```typescript
// ✅ 경로 별칭 사용 (권장)
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

// ❌ 상대 경로 사용 (금지)
import { Button } from "../../../components/ui/button";
```

## 📝 새 파일/폴더 추가 규칙

### 1. 새 UI 컴포넌트 추가

```bash
# shadcn/ui 컴포넌트 추가
npx shadcn@latest add [component-name]

# 커스텀 UI 컴포넌트 추가
components/ui/custom-component.tsx
```

### 2. 새 페이지 추가

```bash
# 정적 페이지
app/about/page.tsx

# 동적 페이지
app/users/[id]/page.tsx

# 그룹 라우트
app/(marketing)/about/page.tsx
```

### 3. 새 비즈니스 컴포넌트 추가

```bash
# 위치 결정 기준:
1. 특정 페이지에서만 사용 → 해당 페이지 폴더 내
2. 여러 페이지에서 사용 → components/ 루트 또는 적절한 하위 폴더
3. 카테고리가 3~4개 이상 쌓이면 → 그때 layout/, sections/ 등 하위 폴더 도입 검토
```

## 🎯 코드 조직 베스트 프랙티스

### 1. 단일 책임 원칙

- 하나의 파일은 하나의 주요 기능만 담당
- 관련된 타입과 유틸리티는 같은 파일에 포함 가능

### 2. 의존성 순서

```typescript
// 1. 외부 라이브러리
import { Suspense } from "react";
import Link from "next/link";

// 2. 내부 라이브러리 (@/ 경로)
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 3. 상대 경로
import "./component.css";
```

### 3. Export 규칙

```typescript
// ✅ Named export 사용 (권장) — 이 프로젝트의 컴포넌트 대부분이 이 방식
export function LoginForm() {}

// ✅ Default export (페이지/레이아웃 컴포넌트만)
export default function LoginPage() {}
```

## 🚫 피해야 할 구조

```bash
# 깊은 중첩 구조 (4단계 이상)
components/pages/auth/forms/login/login-form.tsx

# 의미 없는 폴더명
components/misc/
components/common/
components/shared/

# 혼재된 케이스
components/userProfile/LoginForm.tsx
```

## ✅ 체크리스트

새 파일/폴더 추가 시 확인사항:

- [ ] `app/`, `components/`, `lib/` 루트 구조 유지 (src/ 만들지 않기)
- [ ] kebab-case 파일명 사용
- [ ] PascalCase 컴포넌트명 사용
- [ ] `@/*` 경로 별칭 사용
- [ ] 실제로 필요해지기 전에 카테고리 폴더를 미리 만들지 않기
