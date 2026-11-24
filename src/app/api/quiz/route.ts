import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getOpenAIProvider, getModelName } from '@/lib/ai-provider';
import { buildQuizSystemPrompt } from '@/lib/prompts';
import { QuizData } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Vercel AI SDK generateObject용 엄격한 Zod 스키마 정의
const quizResponseSchema = z.object({
  title: z.string().describe('퀴즈 세트의 제목 (예: 성인간호학 당뇨병 및 DKA 핵심 복습 퀴즈)'),
  description: z.string().describe('퀴즈에 대한 간략한 설명 및 출제 범위'),
  questions: z.array(
    z.object({
      id: z.number().describe('문제 고유 번호 (1부터 순서대로 부여)'),
      type: z.enum(['multiple_choice', 'ox']).describe('문제 유형 (multiple_choice 또는 ox)'),
      question: z.string().describe('간호학 시험에 출제 가능한 명확하고 구체적인 질문'),
      options: z
        .array(z.string())
        .describe(
          '선택지 배열. 4지선다는 반드시 4개 선택지, OX형은 ["O (그렇다)", "X (아니다)"]의 2개 선택지'
        ),
      correctAnswerIndex: z
        .number()
        .describe('정답 선택지의 인덱스 (0, 1, 2, 3 중 하나)'),
      explanation: z
        .string()
        .describe(
          '정답인 이유와 오답인 이유를 강의 자료 내용에 근거하여 명확하게 해설 (근거 페이지 p.X 명시)'
        ),
      sourcePage: z.number().describe('강의 자료에서 이 문제의 정답 근거가 위치한 실제 페이지 번호'),
      conceptTag: z
        .string()
        .describe('간호학 핵심 영역 태그 (예: 병태생리, 약물요법, 간호중재, 응급간호, 진단기준)'),
    })
  ).min(3).max(10),
});

/**
 * 기본 예비 퀴즈 데이터 (API 키 미설정 시 또는 테스트용)
 */
const SAMPLE_FALLBACK_QUIZ: QuizData = {
  title: '당뇨병 및 DKA 핵심 복습 퀴즈 (샘플)',
  description: '강의 자료 내용을 바탕으로 엄선된 핵심 5문항 퀴즈입니다.',
  questions: [
    {
      id: 1,
      type: 'multiple_choice',
      question: '미국당뇨병학회(ADA) 진단 기준에 따른 당뇨병 진단 수치로 옳은 것은?',
      options: [
        '최소 8시간 금식 후 공복 혈당(FPG) ≥ 110 mg/dL',
        '당화혈색소(HbA1c) ≥ 6.5%',
        '75g 경구당부하검사 2시간 후 혈당 ≥ 180 mg/dL',
        '무작위 혈당 ≥ 160 mg/dL',
      ],
      correctAnswerIndex: 1,
      explanation:
        '자료에 따르면 당화혈색소(HbA1c)는 6.5% 이상일 때 당뇨병으로 진단합니다. 공복 혈당은 126 mg/dL 이상, OGTT 2시간 후 혈당 및 무작위 혈당은 200 mg/dL 이상이어야 합니다. (p.1)',
      sourcePage: 1,
      conceptTag: '진단기준',
    },
    {
      id: 2,
      type: 'ox',
      question:
        '당뇨병성 케톤산증(DKA) 환자에게 정맥 주입(IV)으로 투여할 수 있는 인슐린은 모든 종류의 인슐린(NPH, 란투스 등)이 가능하다.',
      options: ['O (그렇다)', 'X (아니다)'],
      correctAnswerIndex: 1,
      explanation:
        '자료에 따르면 정맥 주입 가능한 유일한 인슐린은 속효성 인슐린(Regular Insulin, RI)뿐이며, NPH나 란투스는 절대 정맥 주사해서는 안 됩니다. (p.3)',
      sourcePage: 3,
      conceptTag: '약물요법',
    },
    {
      id: 3,
      type: 'multiple_choice',
      question:
        'DKA 환자의 응급 수액 요법 중, 혈당이 250 mg/dL 수준으로 감소했을 때 간호사가 취해야 할 가장 올바른 조치는?',
      options: [
        '인슐린 주입 속도를 2배로 증가시킨다.',
        '수액을 즉시 중단하고 수분 섭취를 제한한다.',
        '급격한 저혈당 및 뇌부종 예방을 위해 수액을 5% 포도당 수액(D5W)으로 전환한다.',
        '생리식염수(0.9% NS)의 주입 속도를 시간당 2,000 mL로 올린다.',
      ],
      correctAnswerIndex: 2,
      explanation:
        '혈당이 250 mg/dL로 저하되면 급격한 저혈당 및 뇌부종(cerebral edema)을 예방하기 위해 수액을 5% 포도당 수액(D5W 또는 D5 0.45% NS)으로 전환해야 합니다. (p.3)',
      sourcePage: 3,
      conceptTag: '간호중재',
    },
    {
      id: 4,
      type: 'ox',
      question:
        'DKA 환자의 혈청 칼륨(K+) 수치가 3.3 mEq/L 미만이라도 고혈당 조절이 시급하므로 즉시 인슐린을 고용량으로 투여해야 한다.',
      options: ['O (그렇다)', 'X (아니다)'],
      correctAnswerIndex: 1,
      explanation:
        '인슐린 투여 시 칼륨이 세포 안으로 급격히 이동해 치명적인 저칼륨혈증이 발생합니다. 따라서 칼륨이 3.3 mEq/L 미만이면 인슐린 투여를 보류하고 수액에 KCl을 먼저 투여하여 칼륨 수치가 교정된 후 인슐린을 투여해야 합니다. (p.3)',
      sourcePage: 3,
      conceptTag: '응급간호',
    },
    {
      id: 5,
      type: 'multiple_choice',
      question: '당뇨병 환자의 퇴원 시 발 간호(Foot Care) 교육 내용 중 옳지 않은 것은?',
      options: [
        '발톱은 일자(—) 모양으로 깎아 살 속으로 파고들지 않게 한다.',
        '맨발로 다니지 않고 실내에서도 양말과 슬리퍼를 착용한다.',
        '발가락 사이의 습기를 막기 위해 발가락 사이사이에도 보습 로션을 듬뿍 바른다.',
        '매일 미온수로 발을 씻고 물 온도는 손목이나 팔꿈치로 먼저 확인한다.',
      ],
      correctAnswerIndex: 2,
      explanation:
        '자료에 따르면 발가락 사이에 로션을 바르면 습기로 인한 짓무름 및 진균 감염 위험이 있으므로, 보습 로션을 바를 때 발가락 사이는 제외하고 발등과 발바닥에 발라야 합니다. (p.4)',
      sourcePage: 4,
      conceptTag: '환자교육',
    },
  ],
};

/**
 * 맞춤형 복습 퀴즈 생성 API
 */
export async function POST(req: NextRequest) {
  try {
    const { documentText, questionCount = 5 } = await req.json();

    if (!documentText || typeof documentText !== 'string' || documentText.trim().length === 0) {
      return NextResponse.json(
        { error: '퀴즈를 출제할 강의 자료 텍스트가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    const openai = getOpenAIProvider();

    // API 키가 없는 경우 친절한 안내와 함께 샘플 퀴즈 데이터 반환 (비개발자 UX 배려)
    if (!openai) {
      return NextResponse.json({
        success: true,
        quiz: SAMPLE_FALLBACK_QUIZ,
        isFallback: true,
        notice:
          'OpenAI API 키가 설정되지 않아 샘플 퀴즈가 표시되었습니다. 실제 문서 기반 맞춤 퀴즈를 생성하려면 .env.local에 OPENAI_API_KEY를 등록해 주세요.',
      });
    }

    const systemPrompt = buildQuizSystemPrompt(documentText);
    const userPrompt = `
아래 제공된 [강의 자료]만을 바탕으로, 간호학생이 핵심 개념을 복습할 수 있도록 총 ${questionCount}문제의 퀴즈(4지선다형 및 O/X형 혼합)를 생성해 주세요.
각 문제마다 반드시 강의 자료 내의 근거 페이지 번호(sourcePage: 숫자)를 지정하고, 상세한 정답/오답 해설을 작성하세요.
절대 자료에 없는 임의의 내용을 출제하지 마세요.
`.trim();

    const result = await generateObject({
      model: openai(getModelName()),
      schema: quizResponseSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.1, // 문제 및 정답 일관성을 위해 낮은 온도 설정
    });

    return NextResponse.json({
      success: true,
      quiz: result.object,
      isFallback: false,
    });
  } catch (error: any) {
    console.error('퀴즈 생성 API 오류:', error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          '퀴즈를 생성하는 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      },
      { status: 500 }
    );
  }
}
