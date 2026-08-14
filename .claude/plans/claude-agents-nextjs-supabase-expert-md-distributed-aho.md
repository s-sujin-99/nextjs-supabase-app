# `.claude/agents/nextjs-supabase-expert.md` 재점검 및 정렬

## Context

이전 대화에서 이 파일의 리스트 들여쓰기(공백 1칸 → 3/5칸)를 이미 한 번 수정하고 검증까지 마쳤습니다. 그런데 사용자가 "문제없는지 다시 확인해봐"라고 요청해 재검사한 결과, **파일이 그 사이에 외부(에디터/사용자)에서 다시 수정되어 있었습니다** (`Modify` 타임스탬프가 제 수정 이후로 갱신됨). 백업본과 diff한 결과 두 가지가 바뀌었습니다:

1. **리스트 들여쓰기 문제가 재발**: `1. **제목**` 아래 하위 항목이 다시 공백 1칸(` - 항목`, ` * 하위항목`)으로 되돌아가 있습니다. 이전과 동일한 원인(CommonMark 스펙상 `1. ` 폭인 3칸을 채우지 못해 마크다운 파서/린터가 리스트로 인식 못함 → 빨간 줄)입니다. 118곳(하위 불릿) + 18곳(하위-하위 불릿) 모두 재발.
2. **YAML 프론트매터 구조 자체가 바뀜**: 기존에는 `description:` 필드 안에 `\n` 이스케이프로 접힌 긴 텍스트와 `<example>...</example>` 블록들이 전부 들어있었는데, 지금은 `description:`이 짧고 깔끔한 한 줄 문장으로 정리되고, `<example>` 블록 4개는 프론트매터 밖(6~29번 줄)으로 빠져나와 마크다운 본문 최상단에 위치합니다.
   - 참고: 이 저장소의 다른 에이전트 파일들(`code-reviewer`, `development-planner`, `prd-generator`, `notion-api-database-expert`, `starter-cleaner`)은 전부 `<example>` 블록이 `description:` 필드 **안에** 들어있는 구조입니다. Claude Code의 Task 도구는 에이전트를 고를 때 `description:` 필드만 참고하므로, 지금처럼 example이 프론트매터 밖에 있으면 이 examples가 에이전트 선택(routing) 힌트로는 더 이상 활용되지 않을 가능성이 있습니다. 이건 단순 포맷 문제가 아니라 **동작에 영향을 줄 수 있는 구조 변경**이라 사용자 확인이 필요합니다.

이번 계획은 (1) 재발한 들여쓰기 문제는 지난번과 동일한 방식으로 다시 안전하게 고치고, (2) example 블록 위치는 사용자에게 의도한 변경인지 확인 후 처리 방향을 정합니다.

## 대상 파일

- `D:\claude\nextjs-supabase-app\.claude\agents\nextjs-supabase-expert.md`

## 변경 A: 리스트 들여쓰기 재정렬 (지난번과 동일, 재적용)

파일 전체에서 아래 규칙을 기계적으로 재적용합니다 (텍스트 내용은 한 글자도 바꾸지 않음):

| 레벨 | 마커 | 현재 들여쓰기 | 변경 후 들여쓰기 |
|---|---|---|---|
| 1 (순서 리스트) | `1. **제목**` | 0칸 | 0칸 (변경 없음) |
| 2 (하위 불릿) | ` - 항목` | 공백 1칸 | 공백 3칸 |
| 3 (하위-하위 불릿) | ` * 항목` | 공백 1칸 | 공백 5칸 |

- 적용 방법: `sed -E -i 's/^ - /   - /; s/^ \* /     * /'` (지난번과 동일한 명령, 지난번에 코드 블록 내부엔 이 패턴이 없음을 이미 확인했고 이번 diff에서도 코드 블록 내용은 안 바뀐 것을 확인함).
- YAML 프론트매터(1~5번 줄)와 `<example>` 블록(7~29번 줄) 텍스트는 건드리지 않습니다.

## 변경 B: `<example>` 블록을 `description:` 필드 안으로 복원 (사용자 확정)

사용자가 "description 안으로 되돌리기"를 선택했습니다. 다른 에이전트 파일들(`code-reviewer` 등)과 동일하게 `description:` 필드 하나 안에 설명 문장 + `**Examples:**` + `<example>` 블록 4개가 전부 들어가도록 복원합니다.

- 현재 본문(7~29번 줄)에 있는 `<example>` 텍스트는 줄바꿈 중간에 단어가 끊기지 않고 깔끔하게 정리되어 있으므로, 이 텍스트를 그대로 재사용합니다(원래 있던, 단어 중간에 줄바꿈되던 버전보다 낫습니다).
- YAML의 멀티라인 폴딩(줄바꿈 위치에 따라 의미가 달라지는 것) 위험을 피하기 위해, `description:` 값을 **물리적으로 한 줄**에 전부 적습니다. 현재 `description:`이 이미 한 줄로 되어 있는 것과 동일한 방식이며, 예시들 사이 구분은 원래 파일처럼 리터럴 `\n` (역슬래시+n 두 글자) 문자로 표시합니다.
- 결과적으로 `description:` 값은 다음 형태가 됩니다 (한 줄):
  `Use this agent when the user needs assistance with Next.js and Supabase development tasks, including building or modifying features using Next.js 16 App Router and Server Components, implementing authentication flows with Supabase Auth, creating database queries and mutations with Supabase, setting up proxy (middleware) for route protection, integrating shadcn/ui components, troubleshooting Supabase client usage patterns, optimizing server/client component architecture, database schema design and migrations, performance optimization and caching strategies.\n\n**Examples:**\n\n<example>\nContext: ...\nuser: "..."\nassistant: "..."\n</example>\n\n<example>...(총 4개)`
- 본문(현재 7~29번 줄)에 있던 `<example>` 블록과 그 앞뒤 빈 줄은 삭제합니다 (내용이 `description:`으로 이동했으므로).
- 프론트매터 안의 큰따옴표(`user: "..."`)는 원본 파일에도 동일하게 있던 패턴이라 YAML 파싱에 문제없음을 이미 확인했지만, 수정 후 다시 한번 YAML 파싱 검증을 합니다 (Node `js-yaml` 또는 Python `yaml` 모듈로 frontmatter만 파싱 시도).

## 검증

- 수정 후 `npx prettier --check ".claude/agents/nextjs-supabase-expert.md"` 재확인.
- 남은 `^ [-*] ` 패턴(1칸 들여쓰기 리스트)이 없는지 `grep`으로 최종 확인.
- YAML 프론트매터(1~5번 줄)만 추출해 `js-yaml`(또는 Python `yaml`)로 파싱해 에러 없이 `name`/`description`/`model` 3개 키가 정상적으로 읽히는지 확인.
- 본문에서 `<example>` 중복(프론트매터 안 + 본문 밖에 둘 다 남아있는 경우)이 없는지 확인.
- 최종적으로 파일 전체를 눈으로 훑어 텍스트 유실/중복이 없는지 확인.
