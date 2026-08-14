# Plan: 변경사항을 논리 단위로 나눠 커밋

## Context

현재 브랜치에 스테이지되지 않은 변경 1건(`.mcp.json`)과 추적되지 않는 새 파일들(`.claude/agents/`, `.claude/commands/`, `.claude/hooks/`, `CLAUDE.md`, `docs/`, `shrimp_data/`)이 쌓여 있다. 이들은 서로 다른 목적(MCP 도구 설정, Claude Code 커스터마이징, 프로젝트 문서화)을 가지므로 `/git:commit` 규칙(원자적 커밋, 관련 없는 변경사항 분할)에 따라 여러 개의 커밋으로 나눠 기록한다. 스테이지된 파일이 없으므로 전체 diff를 검토해 커밋 단위를 나눈다.

## 커밋 계획 (4개)

### 1. 🔧 chore: MCP 서버 설정 추가

- 파일: `.mcp.json`
- 내용: 기존 `supabase` 항목에 `playwright`, `context7`, `sequential-thinking`, `shadcn`, `shrimp-task-manager` MCP 서버 5개를 추가한 변경(diff 확인 완료, 비밀값 없음).

### 2. 🧑‍💻 chore: Claude Code 서브에이전트/커맨드/훅 설정 추가

- 파일: `.claude/agents/**`, `.claude/commands/**`, `.claude/hooks/**`
- 내용: 프로젝트 전용 서브에이전트(dev/docs 카테고리) 8개, 슬래시 커맨드(git/docs) 5개, Notification·Stop 훅 스크립트 2개.
- 훅 스크립트는 `$CLAUDE_PROJECT_DIR/.env`에서 `SLACK_WEBHOOK_URL`을 읽어오며 값 자체는 커밋에 포함되지 않음(`.env`는 `.gitignore` 대상) — 확인 완료, 커밋해도 안전.

### 3. 📝 docs: CLAUDE.md 프로젝트 가이드 작성

- 파일: `CLAUDE.md`
- 내용: `/init`으로 새로 작성한 프로젝트 가이드(명령어, 아키텍처, docs/ 폴더 주의사항 등).

### 4. 📝 docs: docs 폴더 내용을 실제 코드 상태에 맞게 수정

- 파일: `docs/project-structure.md`, `docs/styling-guide.md`, `docs/component-patterns.md`, `docs/forms-react-hook-form.md`, `docs/nextjs-16.md`
- 내용: `src/` 기반 구조 → 실제 루트 구조, TailwindCSS v4 → v3, `tw-animate-css` → `tailwindcss-animate`, react-hook-form/zod 미설치 명시, 존재하지 않는 npm 스크립트(`typecheck`, `check-all` 등) 수정, `proxy.ts` 관련 설명을 실제 코드로 교체 등.

## 제외 항목

- `shrimp_data/`: `shrimp-task-manager` MCP가 로컬 실행 시마다 생성하는 런타임 데이터(`WebGUI.md`에 로컬 포트 URL만 있음). 버전 관리 가치가 없어 이번 커밋에서 제외하고 추적하지 않은 채로 둔다. `.gitignore`에 추가할지는 별도로 확인이 필요하면 사용자에게 묻는다(이번 계획 범위 밖).

## 실행 방법

각 커밋마다:

1. 해당 파일만 `git add`
2. 컨벤셔널 포맷(`<이모지> <타입>: <설명>`)으로 커밋 메시지 작성, 한국어, 명령형 어조, Claude 서명 없음
3. `git commit`
4. 다음 커밋 그룹으로 이동

마지막에 `git status`로 `shrimp_data/`만 untracked로 남아있는지 확인한다.
