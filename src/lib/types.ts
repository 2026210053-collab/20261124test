/**
 * 간호학 AI 튜터 애플리케이션 공통 타입 정의
 */

// 페이지별 추출 텍스트 단위
export interface ParsedPage {
  pageNumber: number;
  text: string;
}

// 업로드된 문서 메타데이터
export interface DocumentMetadata {
  fileName: string;
  totalPages: number;
  characterCount: number;
  uploadedAt: string;
}

// 전체 파싱된 문서 구조체
export interface ParsedDocument {
  metadata: DocumentMetadata;
  pages: ParsedPage[];
  fullText: string;
}

// 퀴즈 문제 단일 객체
export interface QuizQuestion {
  id: number;
  type: 'multiple_choice' | 'ox';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  sourcePage: number;
  conceptTag: string;
}

// 퀴즈 세트 전체 객체
export interface QuizData {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

// 튜터 채팅 메시지 객체
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  sourcePages?: number[];
  createdAt: number;
}

// 대시보드 활성 탭
export type ActiveTab = 'summary' | 'tutor' | 'quiz';

// PDF 파싱 API 응답
export interface ParsePdfApiResponse {
  success: boolean;
  document?: ParsedDocument;
  error?: string;
}

// 퀴즈 답안 제출 상태
export interface UserQuizAnswer {
  questionId: number;
  selectedIndex: number;
  isCorrect: boolean;
}
