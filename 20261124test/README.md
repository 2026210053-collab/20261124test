# 🩺 간호학 강의자료 AI 튜터 (NurseAI Tutor)

> **의학적 환각(Hallucination) 0% 원칙!**  
> 간호학과 학생이 업로드한 PDF 강의 자료만을 100% 근거로 하여 **1) 핵심 요약**, **2) 1:1 심화 질의응답**, **3) 맞춤형 복습 퀴즈(오답노트 포함)**를 제공하는 풀스택 학습 플랫폼입니다.

---

## ✨ 핵심 기능 요약

1. **📄 PDF 페이지별 텍스트 및 메타데이터 추출 (`/api/parse-pdf`)**
   - 드래그 앤 드롭 또는 파일 탐색기로 PDF 업로드 (최대 35MB).
   - 각 페이지 텍스트를 `[Page 1] ...`, `[Page 2] ...`와 같이 페이지 번호 메타데이터와 함께 보존.
   - 글자가 없는 스캔본(OCR 미처리)이나 암호화된 PDF에 대한 친절한 예외 안내.

2. **🔒 엄격한 근거 기반 답변 (Strict Grounding & 환각 방지)**
   - 시스템 프롬프트에 엄격한 규칙 강제:
     - *"반드시 제공된 강의 자료에 포함된 내용만을 기반으로 답변하세요."*
     - *"자료에 없는 의학 지식이나 추측을 절대 지어내지 마세요. 관련 내용이 없다면 '제공된 강의 자료에서는 해당 내용을 찾을 수 없습니다'라고 명확히 답변하세요."*
     - *"모든 설명, 요약, 퀴즈 해설에는 반드시 근거가 된 페이지 번호(예: `(p.3)`)를 함께 표기하세요."*

3. **📊 3대 학습 대시보드 (탭 UI)**
   - **① 핵심 요약 탭 (`SummaryView.tsx`):**
     - 병태생리, 약물 요법, 핵심 간호중재, 응급 주의사항을 체계적인 마크다운으로 실시간 스트리밍 요약.
     - **선택적 요구사항 구현:** 요약문에서 특정 의학 용어나 문장을 드래그하면 **"💬 이 개념 튜터에게 질문하기"** 플로팅 버튼이 나타나 즉시 1:1 심화 설명 탭으로 연동!
   - **② 1:1 심화 Q&A 튜터 탭 (`TutorChat.tsx`):**
     - Vercel AI SDK 실시간 스트리밍 채팅 인터페이스.
     - 추천 질문 칩 제공 및 출처 페이지(p.X) 자동 인용.
   - **③ 맞춤형 복습 퀴즈 탭 (`QuizView.tsx`):**
     - `generateObject`와 `Zod` 스키마를 통해 JSON 파싱 오류가 원천 차단된 4지선다 & O/X 퀴즈 자동 생성.
     - 정답 즉시 판정, 상세 해설, 근거 페이지 제공.
     - **선택적 요구사항 구현:** **"오답 노트 모아보기"** 필터 버튼으로 틀린 문제만 모아 재학습 가능.
   - **💡 원클릭 샘플 체험:** PDF 파일이 없거나 API 키가 없어도 **"샘플 자료 불러오기"** 버튼으로 '성인간호학 당뇨병 및 DKA' 4페이지 분량의 강의 자료를 즉시 체험 가능.

---

## 🛠️ 기술 스택

- **프레임워크:** Next.js 14 (App Router)
- **언어:** TypeScript
- **스타일링:** Tailwind CSS, Lucide React (의료/학습 아이콘)
- **PDF 처리:** `pdf-parse` (커스텀 페이지 렌더러로 페이지 번호 보존)
- **AI 연동:** Vercel AI SDK (`ai`, `@ai-sdk/openai`), `zod`
- **마크다운 렌더링:** `react-markdown`, `remark-gfm`

---

## 🚀 빠른 시작 가이드 (비개발자 친화적)

### 1단계: 패키지 설치
터미널을 열고 프로젝트 폴더 경로에서 아래 명령어를 실행합니다:

```bash
npm install
```

### 2단계: 환경변수 설정 (`.env.local`)
프로젝트 루트 경로에 `.env.local` 파일을 생성하고 본인의 OpenAI API 키를 입력합니다:

```env
# OpenAI API Key 입력 (필수)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 사용할 AI 모델 (선택 사항, 기본값: gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini
```

> 💡 **참고:** `.env.local`에 API 키를 설정하지 않은 상태에서도 상단의 **[샘플 자료 불러오기]** 버튼을 통해 전체 UI와 내장된 샘플 퀴즈/데이터 흐름을 바로 테스트해 볼 수 있습니다.

### 3단계: 로컬 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 후 학습을 시작합니다!

---

## 📁 전체 폴더 및 파일 구조

```
├── .env.local.example       # 환경변수 예시 파일
├── .gitignore               # Git 무시 파일 목록
├── next.config.mjs          # Next.js 설정 (pdf-parse 서버 외부 패키지 지정)
├── package.json             # 프로젝트 메타데이터 및 종속성
├── postcss.config.mjs       # PostCSS 설정
├── README.md                # 프로젝트 안내 문서
├── tailwind.config.ts       # Tailwind CSS 테마 설정
├── tsconfig.json            # TypeScript 컴파일러 설정
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── explain/
    │   │   │   └── route.ts # 1:1 튜터 심화 질의응답 스트리밍 API
    │   │   ├── parse-pdf/
    │   │   │   └── route.ts # PDF 업로드 및 페이지별 텍스트 추출 API
    │   │   ├── quiz/
    │   │   │   └── route.ts # Zod 스키마 기반 퀴즈 생성 API
    │   │   └── summarize/
    │   │       └── route.ts # 강의 자료 핵심 요약 스트리밍 API
    │   ├── globals.css      # 전역 스타일 및 마크다운 커스텀 스타일
    │   ├── layout.tsx       # Next.js 루트 레이아웃
    │   └── page.tsx         # 메인 학습 대시보드 (탭 오케스트레이션)
    ├── components/
    │   ├── FileUploader.tsx # 드래그 앤 드롭 PDF 업로더 (모달/인라인 지원)
    │   ├── Header.tsx       # 글로벌 네비게이션 헤더 및 문서 정보
    │   ├── QuizView.tsx     # 맞춤형 복습 퀴즈 및 오답노트 컴포넌트
    │   ├── Sidebar.tsx      # 문서 정보, Strict Grounding 뱃지, 페이지 색인
    │   ├── SummaryView.tsx  # 마크다운 핵심 요약 & 용어 선택 튜터 질문 기능
    │   └── TutorChat.tsx    # 1:1 심화 질의응답 실시간 스트리밍 채팅
    └── lib/
        ├── ai-provider.ts   # OpenAI AI SDK 공급자 유틸
        ├── prompts.ts       # 무환각(Strict Grounding) 시스템 프롬프트 정의
        ├── sample-data.ts   # 성인간호학 당뇨병/DKA 4페이지 분량 샘플 자료
        ├── types.ts         # TypeScript 인터페이스 모음
        └── utils.ts         # Tailwind 병합 및 유틸리티 함수
```
