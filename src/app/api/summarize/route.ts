import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { getGeminiProvider, getGeminiModelName } from '@/lib/ai-provider';
import { buildSummarySystemPrompt } from '@/lib/prompts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 간호학 강의 자료 핵심 요약 스트리밍 API (Gemini 3.8 Flash 지원)
 */
export async function POST(req: NextRequest) {
  try {
    const { documentText, documentTitle, apiKey } = await req.json();

    if (!documentText || typeof documentText !== 'string' || documentText.trim().length === 0) {
      return NextResponse.json(
        { error: '요약할 강의 자료 텍스트가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    const google = getGeminiProvider(apiKey);

    // API 키 미입력 시 친절한 안내 메시지 반환
    if (!google) {
      const fallbackNotice = `
### ⚠️ Gemini API 키가 필요합니다.

실시간 AI 요약을 사용하려면 상단의 **[Gemini API 키 입력]** 버튼을 클릭하여 본인의 API 키를 입력해 주세요.

> 💡 **Google AI Studio 무료 키 발급 안내:**
> - [Google AI Studio (https://aistudio.google.com/app/apikey)](https://aistudio.google.com/app/apikey)에 구글 계정으로 로그인하시면 **신용카드 없이 무료로 즉시 발급**받으실 수 있습니다.
> - 발급받은 키는 본인의 웹 브라우저에만 안전하게 저장되며 외부 서버로 전송되지 않습니다.
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
      model: google(getGeminiModelName()),
      system: systemPrompt,
      prompt: userPrompt,
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
