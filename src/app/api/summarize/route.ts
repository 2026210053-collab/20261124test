import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { getOpenAIProvider, getModelName } from '@/lib/ai-provider';
import { buildSummarySystemPrompt } from '@/lib/prompts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 간호학 강의 자료 핵심 요약 스트리밍 API
 *
 * [핵심 원칙]
 * 1. 업로드된 문서 텍스트만을 기반으로 체계적 마크다운 요약 생성
 * 2. 모든 요약 포인트에 근거 페이지 (p.X) 표기 강제
 * 3. OpenAI API 키가 없을 경우 친절한 설정 안내 또는 예비 요약 반환
 */
export async function POST(req: NextRequest) {
  try {
    const { documentText, documentTitle } = await req.json();

    if (!documentText || typeof documentText !== 'string' || documentText.trim().length === 0) {
      return NextResponse.json(
        { error: '요약할 강의 자료 텍스트가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    const openai = getOpenAIProvider();

    // API 키 미설정 시 대응 안내
    if (!openai) {
      const fallbackNotice = `
### ⚠️ OpenAI API 키가 설정되지 않았습니다.

AI 요약 기능을 실행하려면 프로젝트 루트의 \`.env.local\` 파일에 OpenAI API 키를 입력해야 합니다:

\`\`\`env
OPENAI_API_KEY=sk-...여러분의_실제_API키
\`\`\`

> 💡 **안내:** API 키를 입력하고 로컬 서버를 재시작(\`npm run dev\`)하면 OpenAI gpt-4o-mini 모델을 통해 업로드된 강의 자료의 100% 근거 기반 실시간 스트리밍 요약이 작동합니다.
`.trim();

      return new Response(fallbackNotice, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const systemPrompt = buildSummarySystemPrompt();
    const userPrompt = `
[학습 대상 문서명]: ${documentTitle || '간호학 강의 자료'}

아래 제공된 [강의 자료] 전문을 정독하고, 간호학과 학생이 시험 및 실습 대비를 위해 한눈에 복습할 수 있도록 핵심 요약을 작성해 주세요.
반드시 각 항목마다 근거가 된 페이지 번호 (예: (p.1), (p.3))를 명시하세요.

[강의 자료 전문 시작]
${documentText}
[강의 자료 전문 끝]
`.trim();

    const result = await streamText({
      model: openai(getModelName()),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.1, // 환각 방지를 위해 낮은 temperature 적용
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('요약 생성 API 오류:', error);
    return NextResponse.json(
      { error: error?.message || '요약을 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
