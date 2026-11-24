'use client';

import React from 'react';
import {
  HeartPulse,
  Upload,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Key,
} from 'lucide-react';
import { DocumentMetadata } from '@/lib/types';

interface HeaderProps {
  documentMetadata: DocumentMetadata | null;
  onOpenUploadModal: () => void;
  onLoadSample: () => void;
  apiKey: string;
  onOpenApiKeyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  documentMetadata,
  onOpenUploadModal,
  onLoadSample,
  apiKey,
  onOpenApiKeyModal,
}) => {
  const hasKey = apiKey.trim().length > 0;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 및 서비스 타이틀 */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  NurseAI <span className="text-teal-600 font-extrabold">Tutor</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-teal-600" />
                  근거 기반 100%
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                간호학 강의 자료 기반 AI 학습 플랫폼 (Gemini 3.8 Flash)
              </p>
            </div>
          </div>

          {/* 현재 학습 중인 문서 정보 및 액션 버튼들 */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Gemini API 키 상태 버튼 */}
            <button
              onClick={onOpenApiKeyModal}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                hasKey
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 animate-pulse'
              }`}
              title="클릭하여 Gemini API 키 설정"
            >
              <Key className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              <span>{hasKey ? 'Gemini 3.8 Flash 연동됨' : 'Gemini API 키 입력'}</span>
            </button>

            {documentMetadata ? (
              <div className="hidden lg:flex items-center space-x-2 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/80 text-xs text-slate-700">
                <BookOpen className="w-4 h-4 text-teal-600 flex-shrink-0" />
                <span className="font-medium max-w-[160px] truncate" title={documentMetadata.fileName}>
                  {documentMetadata.fileName}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500">{documentMetadata.totalPages}p</span>
              </div>
            ) : null}

            <button
              onClick={onLoadSample}
              className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
              title="당뇨병 & DKA 샘플 강의 자료로 바로 학습을 체험합니다"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
              샘플 자료 불러오기
            </button>

            <button
              onClick={onOpenUploadModal}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              {documentMetadata ? '다른 PDF' : 'PDF 업로드'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
