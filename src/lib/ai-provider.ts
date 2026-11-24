import { createGoogleGenerativeAI } from '@ai-sdk/google';

/**
 * Google Gemini AI 공급자 초기화 유틸리티
 *
 * [우선순위]
 * 1. 클라이언트(사용자 브라우저)에서 사용자가 직접 입력한 API Key
 * 2. 서버 환경변수 (GEMINI_API_KEY 또는 GOOGLE_GENERATIVE_AI_API_KEY)
 */
export function getGeminiProvider(customApiKey?: string) {
  const apiKey =
    customApiKey?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();

  if (!apiKey || apiKey === '' || apiKey.includes('your_gemini_api_key')) {
    return null;
  }

  return createGoogleGenerativeAI({
    apiKey,
  });
}

/**
 * 사용할 기본 Gemini 모델 이름 (기본값: gemini-3.8-flash)
 */
export function getGeminiModelName(): string {
  return process.env.GEMINI_MODEL || 'gemini-3.8-flash';
}
