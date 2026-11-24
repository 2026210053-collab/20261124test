import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '간호학 강의자료 AI 튜터 | 100% 근거 기반 학습 대시보드',
  description:
    '간호학과 학생을 위한 무환각(Strict Grounding) AI 튜터. PDF 강의 자료를 기반으로 핵심 요약, 1:1 심화 질의응답, 맞춤형 복습 퀴즈를 제공합니다.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
