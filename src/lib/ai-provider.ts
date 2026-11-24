import { createOpenAI } from '@ai-sdk/openai';

/**
 * OpenAI 인스턴스 초기화 유틸리티
 * 사용자가 .env.local에 설정한 OPENAI_API_KEY를 자동으로 감지합니다.
 */
export function getOpenAIProvider() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_openai_api_key_here')) {
    return null;
  }

  return createOpenAI({
    apiKey: apiKey.trim(),
  });
}

/**
 * 사용할 기본 AI 모델 이름 가져오기
 */
export function getModelName(): string {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}
