import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { getGeminiProvider, getGeminiModelName } from '@/lib/ai-provider';
import { buildTutorSystemPrompt } from '@/lib/prompts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 간호학 1:1 심화 Q&A 튜터 스트리밍 API (Gemini 3.8 Flash 지원)
 */
export async function POST(req: NextRequest) {
  try {
    const { messages, documentText, selectedTerm, apiKey } = await req.json();

    if (!documentText) {
      return NextResponse.json(
        { error: '학습 중인 강의 자료 텍스트가 전달되지 않았습니다.' },
        { status: 400 }
      );
    }

    const google = getGeminiProvider(apiKey);

    if (!google) {
      const fallbackNotice = `
⚠️ **Gemini API 키가 필요합니다.**

1:1 AI 튜터와 대화하려면 화면 상단의 **[Gemini API 키 입력]** 버튼을 눌러 본인의 API 키를 등록해 주세요.  
(Google AI Studio: https://aistudio.google.com/app/apikey 에서 무료 발급 가능)
`.trim();

      return new Response(fallbackNotice, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const systemPrompt = buildTutorSystemPrompt(documentText);

    let conversationMessages = messages || [];

    if (selectedTerm && conversationMessages.length === 0) {
      conversationMessages = [
        {
          role: 'user',
          content: `강의 자료에 나오는 "${selectedTerm}" 개념에 대해 초보 간호학생도 이해하기 쉽게 심화 설명해 줘. 그리고 이 내용이 몇 페이지(p.X)에 나오는지도 정확히 알려줘.`,
        },
      ];
    }

    const result = await streamText({
      model: google(getGeminiModelName()),
      system: systemPrompt,
      messages: conversationMessages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('튜터 질의응답 API 오류:', error);
    return NextResponse.json(
      { error: error?.message || '답변을 생성하는 도중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
