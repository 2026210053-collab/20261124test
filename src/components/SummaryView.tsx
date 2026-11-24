'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileText,
  RotateCw,
  Copy,
  Check,
  MessageSquareQuote,
  Sparkles,
  Download,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { ParsedDocument } from '@/lib/types';

interface SummaryViewProps {
  document: ParsedDocument;
  onAskTutorWithTerm: (term: string) => void;
  apiKey: string;
  onOpenApiKeyModal: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({
  document,
  onAskTutorWithTerm,
  apiKey,
  onOpenApiKeyModal,
}) => {
  const [summaryText, setSummaryText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // 텍스트 드래그/선택 시 플로팅 질문 버튼 상태
  const [selectedText, setSelectedText] = useState<string>('');
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document) {
      generateSummary();
    }
  }, [document.metadata.fileName, apiKey]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setTooltipPos(null);
        setSelectedText('');
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 2 && text.length < 150) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setTooltipPos({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
      } else {
        setTooltipPos(null);
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const generateSummary = async () => {
    setIsLoading(true);
    setError(null);
    setSummaryText('');

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: document.fullText,
          documentTitle: document.metadata.fileName,
          apiKey: apiKey.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('요약을 불러오는 데 실패했습니다.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('응답 스트림을 읽을 수 없습니다.');
      }

      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setSummaryText(accumulated);
      }
    } catch (err: any) {
      console.error('요약 에러:', err);
      setError(err.message || '요약 생성 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summaryText) return;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!summaryText) return;
    const blob = new Blob([summaryText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${document.metadata.fileName.replace(/\.pdf$/i, '')}_핵심요약.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAskSelectedTerm = () => {
    if (selectedText) {
      onAskTutorWithTerm(selectedText);
      setTooltipPos(null);
      setSelectedText('');
    }
  };

  return (
    <div className="relative flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {tooltipPos && selectedText && (
        <div
          style={{
            position: 'fixed',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
          className="z-50 animate-in fade-in zoom-in-90 duration-150"
        >
          <button
            onClick={handleAskSelectedTerm}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-full shadow-xl hover:bg-teal-600 transition-colors border border-slate-700 whitespace-nowrap"
          >
            <MessageSquareQuote className="w-3.5 h-3.5 text-teal-300" />
            <span>이 개념 튜터에게 질문하기</span>
          </button>
        </div>
      )}

      {/* 요약 뷰 상단 툴바 */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-teal-100/80 rounded-lg text-teal-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>강의 자료 핵심 요약</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                Gemini 3.8 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              어려운 의학 용어나 개념을 드래그하면 즉시 튜터에게 질문할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!apiKey && (
            <button
              onClick={onOpenApiKeyModal}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
            >
              API 키 입력
            </button>
          )}

          <button
            onClick={handleCopy}
            disabled={!summaryText || isLoading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            title="요약 전문 복사"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                <span>복사 완료</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1 text-slate-500" />
                <span>복사</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            disabled={!summaryText || isLoading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            title="마크다운 문서로 다운로드"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <span>다운로드</span>
          </button>

          <button
            onClick={generateSummary}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 disabled:opacity-50 transition-colors"
            title="요약 다시 생성"
          >
            <RotateCw className={`w-3.5 h-3.5 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            <span>다시 요약</span>
          </button>
        </div>
      </div>

      {/* 요약 본문 영역 */}
      <div
        ref={contentRef}
        className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-14rem)]"
      >
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-xs text-rose-800 mb-6">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">요약 생성 중 오류가 발생했습니다</p>
              <p className="mt-1">{error}</p>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={onOpenApiKeyModal}
                  className="px-3 py-1 bg-amber-600 text-white rounded-md font-semibold hover:bg-amber-700"
                >
                  API 키 확인/변경
                </button>
                <button
                  onClick={generateSummary}
                  className="px-3 py-1 bg-rose-600 text-white rounded-md font-semibold hover:bg-rose-700"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading && !summaryText && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
              <Sparkles className="w-5 h-5 text-teal-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-slate-800">
                Gemini 3.8 Flash가 강의 자료를 분석하고 있습니다...
              </p>
              <p className="text-xs text-slate-500">
                주요 병태생리, 약물 정보, 간호중재 및 근거 페이지를 구조화하는 중입니다.
              </p>
            </div>
          </div>
        )}

        {summaryText ? (
          <div className="prose prose-slate max-w-none prose-nurse leading-relaxed text-sm">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                strong: ({ node, ...props }) => (
                  <strong className="font-bold text-slate-900" {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code
                    className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 text-xs font-mono border border-teal-200/60"
                    {...props}
                  />
                ),
              }}
            >
              {summaryText}
            </ReactMarkdown>

            {isLoading && (
              <div className="inline-flex items-center space-x-1.5 text-xs text-teal-600 mt-4 font-medium animate-pulse">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
                <span>Gemini가 실시간으로 핵심 내용을 작성하고 있습니다...</span>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>모든 요약 항목은 강의 자료 내 페이지 번호 (p.X)를 근거로 작성되었습니다.</span>
        </span>
        <span className="text-slate-400">Google Gemini 3.8 Flash 연동</span>
      </div>
    </div>
  );
};
