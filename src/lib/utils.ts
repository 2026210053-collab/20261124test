import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSS 클래스명을 안전하게 병합하는 유틸리티 함수
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 긴 텍스트를 말줄임표(...)로 단축하는 함수
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * 텍스트 내 페이지 번호 인용(예: (p.3), [p.2], p.5)을 감지하고 추출하는 헬퍼
 */
export function extractCitedPages(text: string): number[] {
  const pageRegex = /(?:\(|\[)?\s*p(?:age)?\.?\s*(\d+)\s*(?:\)|\])?/gi;
  const pages: Set<number> = new Set();
  let match;
  while ((match = pageRegex.exec(text)) !== null) {
    const pageNum = parseInt(match[1], 10);
    if (!isNaN(pageNum) && pageNum > 0) {
      pages.add(pageNum);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}
