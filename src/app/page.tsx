'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  MessageSquare,
  HelpCircle,
  Sparkles,
  BookOpen,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';
import { ParsedDocument, ActiveTab } from '@/lib/types';
import { SAMPLE_NURSING_DOCUMENT } from '@/lib/sample-data';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { FileUploader } from '@/components/FileUploader';
import { SummaryView } from '@/components/SummaryView';
import { TutorChat } from '@/components/TutorChat';
import { QuizView } from '@/components/QuizView';
import { ApiKeyModal } from '@/components/ApiKeyModal';

export default function DashboardPage() {
  const [document, setDocument] = useState<ParsedDocument | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('summary');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>('');

  const [initialTutorQuestion, setInitialTutorQuestion] = useState<string | undefined>(
    undefined
  );
  const [previewPageNumber, setPreviewPageNumber] = useState<number | null>(null);

  // 로컬 스토리지에서 사용자가 저장해 둔 Gemini API 키 불러오기
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('nurse_gemini_api_key');
      if (savedKey) {
        setApiKey(savedKey);
      }
    } catch (e) {
      console.warn('LocalStorage access error:', e);
    }
  }, []);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    try {
      if (newKey) {
        localStorage.setItem('nurse_gemini_api_key', newKey);
      } else {
        localStorage.removeItem('nurse_gemini_api_key');
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  const handleLoadSample = () => {
    setDocument(SAMPLE_NURSING_DOCUMENT);
    setActiveTab('summary');
  };

  const handleDocumentLoaded = (doc: ParsedDocument) => {
    setDocument(doc);
    setActiveTab('summary');
    setIsUploadModalOpen(false);
  };

  const handleAskTutorWithTerm = (term: string) => {
    setInitialTutorQuestion(term);
    setActiveTab('tutor');
  };

  const previewPage =
    document && previewPageNumber !== null
      ? document.pages.find((p) => p.pageNumber === previewPageNumber)
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      <Header
        documentMetadata={document ? document.metadata : null}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onLoadSample={handleLoadSample}
        apiKey={apiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      {isUploadModalOpen && (
        <FileUploader
          isModal
          onClose={() => setIsUploadModalOpen(false)}
          onDocumentLoaded={handleDocumentLoaded}
        />
      )}

      {previewPage && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900">
                  Page {previewPage.pageNumber} 원문 미리보기
                </h3>
              </div>
              <button
                onClick={() => setPreviewPageNumber(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-xl my-4 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800 border border-slate-200">
              {previewPage.text}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewPageNumber(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        <Sidebar
          document={document}
          onSelectPagePreview={(pageNum) => setPreviewPageNumber(pageNum)}
        />

        <main className="flex-1 flex flex-col min-w-0">
          {!document ? (
            <div className="flex-1 flex flex-col justify-center items-center bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm text-center">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>간호학 전용 AI (Gemini 3.8 Flash 연동)</span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    의학적 환각 없는 <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-600">
                      간호학 전용 AI 학습 튜터
                    </span>
                  </h1>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xl mx-auto">
                    수업 PDF를 등록하면 AI가 자료의 내용만을 근거로 핵심 요약, 1:1 심화 질의응답, 복습용 국가고시형 퀴즈를 출제합니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-colors">
                    <div className="p-2 w-8 h-8 rounded-lg bg-teal-100 text-teal-700 mb-2.5 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800">1. 핵심 요약</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      병태생리, 약물, 간호중재를 페이지 번호와 함께 체계적으로 구조화합니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-colors">
                    <div className="p-2 w-8 h-8 rounded-lg bg-sky-100 text-sky-700 mb-2.5 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800">2. 1:1 심화 Q&A</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      어려운 개념을 드래그하거나 질문하면 출처를 명시하며 쉽게 풀어줍니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-colors">
                    <div className="p-2 w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 mb-2.5 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-800">3. 맞춤형 퀴즈</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      엄격한 Zod 스키마 기반 4지선다/OX 문제와 오답 노트를 제공합니다.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <FileUploader onDocumentLoaded={handleDocumentLoaded} />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleLoadSample}
                    className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-teal-700 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-600" />
                    <span>[성인간호학 당뇨병 & DKA 샘플 자료]로 바로 체험하기</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col space-y-4">
              <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex space-x-1.5 sm:space-x-2">
                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'summary'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    <FileText className="w-4 h-4 mr-1.5" />
                    <span>1) 핵심 요약</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tutor')}
                    className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'tutor'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    <MessageSquare className="w-4 h-4 mr-1.5" />
                    <span>2) 1:1 심화 Q&A 튜터</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('quiz')}
                    className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${activeTab === 'quiz'
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                  >
                    <HelpCircle className="w-4 h-4 mr-1.5" />
                    <span>3) 맞춤형 복습 퀴즈</span>
                  </button>
                </div>

                <div className="hidden md:flex items-center space-x-1 text-[11px] text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Gemini 3.8 Flash 연동</span>
                </div>
              </div>

              <div className="flex-1 min-h-[550px]">
                {activeTab === 'summary' && (
                  <SummaryView
                    document={document}
                    onAskTutorWithTerm={handleAskTutorWithTerm}
                    apiKey={apiKey}
                    onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
                  />
                )}

                {activeTab === 'tutor' && (
                  <TutorChat
                    document={document}
                    initialQuestion={initialTutorQuestion}
                    onClearInitialQuestion={() => setInitialTutorQuestion(undefined)}
                    apiKey={apiKey}
                    onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
                  />
                )}

                {activeTab === 'quiz' && (
                  <QuizView
                    document={document}
                    apiKey={apiKey}
                    onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
