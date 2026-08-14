# 개발 도구 설정: ESLint + Prettier + TypeCheck + Husky/lint-staged + 부가 도구

## Context

현재 프로젝트(Next.js 16 + Supabase 스타터킷)는 ESLint(`eslint-config-next`, flat config)만 설정되어 있고, Prettier·타입체크 스크립트·pre-commit 훅이 없다. `CLAUDE.md`에도 "`typecheck`/`check-all` 스크립트가 없다"고 명시되어 있는 상태다. 커밋 전에 포맷/린트 오류가 섞여 들어가는 것을 막고, 에디터에서 저장 시 자동으로 정리되도록 기본 개발 도구 체계를 구축한다.

사용자와 확인한 범위:

- **포함**: ESLint(기존 + Prettier 충돌 규칙 비활성화), Prettier(+ Tailwind 클래스 자동 정렬), `tsc --noEmit` 타입체크 스크립트, husky + lint-staged(pre-commit에서 변경 파일만 lint/format), VSCode 저장 시 자동 포맷 설정
- **제외**: commitlint(현재 "이모지+한글" 커밋 컨벤션과 충돌하므로 미적용), pre-commit에서의 전체 타입체크(속도 저하 방지 — 타입체크는 별도 명령/CI 몫), GitHub Actions CI 워크플로

기존 코드 스타일(`lib/utils.ts` 등)이 이미 큰따옴표·세미콜론·2-space를 쓰고 있어 Prettier 3 기본값과 대부분 일치한다 — 커스텀 옵션을 최소화해 불필요한 재포맷 diff를 줄인다.

## 변경 파일

### 1. 의존성 설치 (devDependencies)

```
npm install -D prettier eslint-config-prettier prettier-plugin-tailwindcss husky lint-staged
```

### 2. `.prettierrc.json` (신규)

```json
{
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

옵션을 지정하지 않고 Prettier 3 기본값(큰따옴표 아님 → 기본은 큰따옴표 X, 실제로는 `singleQuote: false`가 기본이라 현재 코드와 일치)을 그대로 사용. `prettier-plugin-tailwindcss`만 추가해 className 안의 Tailwind 유틸리티 클래스 순서를 저장 시 자동 정렬.

### 3. `.prettierignore` (신규)

```
.next
node_modules
next-env.d.ts
*.tsbuildinfo
```

### 4. `eslint.config.mjs` 수정

`compat.extends(...)` 마지막에 `"prettier"`를 추가해 포맷 관련 규칙(줄바꿈, 들여쓰기 등 Prettier와 충돌 가능한 규칙)을 끈다:

```js
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
];
```

### 5. `package.json` — scripts 추가

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "typecheck": "tsc --noEmit",
  "prepare": "husky"
}
```

### 6. `package.json` — lint-staged 설정 추가

```json
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md}": ["prettier --write"]
}
```

### 7. Husky 초기화

`npx husky init` 실행 후 생성된 `.husky/pre-commit` 내용을 다음으로 교체(기본값은 `npm test` 실행이라 프로젝트에 안 맞음):

```
npx lint-staged
```

### 8. `.vscode/settings.json` (신규)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### 9. `.vscode/extensions.json` (신규)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### 10. 기존 코드 전체 포맷 정리

`npx prettier --write .` 1회 실행해 기존 파일들을 새 설정 기준으로 정규화(주로 Tailwind 클래스 순서 변경 정도로 diff는 작을 것으로 예상).

## 검증

1. `npm run lint` — ESLint 통과 확인 (prettier 충돌 규칙 비활성화 후에도 next 규칙은 정상 동작해야 함)
2. `npm run typecheck` — `tsc --noEmit` 통과 확인
3. `npm run format:check` — 전체 파일이 Prettier 규칙을 만족하는지 확인
4. lint-staged 동작 검증: 임시로 한 파일을 살짝 수정 후 `git add`로 스테이징 → `npx lint-staged` 직접 실행해 eslint --fix / prettier --write가 스테이징된 파일에만 적용되는지 확인 → 실제 커밋은 하지 않고 변경 원복
5. `npm run build` — 기존 빌드가 깨지지 않는지 최종 확인
