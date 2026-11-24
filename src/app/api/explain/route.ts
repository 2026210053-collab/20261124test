import { NextRequest, NextResponse } from 'next/server';
import { streamText } from 'ai';
import { getOpenAIProvider, getModelName } from '@/lib/ai-provider';
import { buildTutorSystemPrompt } from '@/lib/prompts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * 간호학 1:1 심화 Q&A 튜터 스트리밍 API
 *
 * [핵심 원칙]
 * 1. 학생의 질문에 대해 오직 강의 자료에 명시된 사실만을 바탕으로 답변
 * 2. 자료에 없는 질문은 "제공된 강의 자료에서는 해당 내용을 찾을 수 없습니다"로 응답
 * 3. 설명 시 근거 페이지 번호 (p.X)를 반드시 인용
 */
export async function POST(req: NextRequest) {
  try {
    const { messages, documentText, selectedTerm } = await req.json();

    if (!documentText) {
      return NextResponse.json(
        { error: '학습 중인 강의 자료 텍스트가 전달되지 않았습니다.' },
        { status: 400 }
      );
    }

    const openai = getOpenAIProvider();

    if (!openai) {
      const fallbackNotice = `
⚠️ **OpenAI API 키가 필요합니다.**

튜터와의 1:1 심화 질의응답을 진행하려면 \`.env.local\` 파일에 \`OPENAI_API_KEY\`를 설정해 주세요.
설정 후 서버를 재시작하시면 강의 자료를 바탕으로 한 실시간 AI 튜터링이 활성화됩니다.
`.trim();

      return new Response(fallbackNotice, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const systemPrompt = buildTutorSystemPrompt(documentText);

    // 클라이언트에서 전달받은 메시지 배열 준비
    let conversationMessages = messages || [];

    // 만약 요약문에서 특정 용어 하이라이트 후 질문이 들어온 경우
    if (selectedTerm && conversationMessages.length === 0) {
      conversationMessages = [
        {
          role: 'user',
          content: `강의 자료에 나오는 "${selectedTerm}" 개념에 대해 초보 간호학생도 이해하기 쉽게 심화 설명해 줘. 그리고 이 내용이 몇 페이지(p.X)에 나오는지도 정확히 알려줘.`,
        },
      ];
    }

    const result = await streamText({
      model: openai(getModelName()),
      system: systemPrompt,
      messages: conversationMessages,
      temperature: 0.2, // 엄격한 근거 기반 설명을 위해 낮은 온도 유지
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error('튜터 질의응답 API 오류:', error);
    return NextResponse.json(
      { error: error?.message || '질변을 생성하는 도중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
