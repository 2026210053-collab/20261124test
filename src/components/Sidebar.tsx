'use client';

import React from 'react';
import {
  FileText,
  Calendar,
  Layers,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';
import { ParsedDocument } from '@/lib/types';

interface SidebarProps {
  document: ParsedDocument | null;
  onSelectPagePreview?: (pageNum: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  document,
  onSelectPagePreview,
}) => {
  if (!document) {
    return (
      <aside className="w-full lg:w-80 bg-white border-r border-slate-200 p-5 flex flex-col space-y-4">
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 text-center text-slate-500">
          <FileText className="w-10 h-10 mx-auto text-slate-400 mb-2 stroke-[1.5]" />
          <h4 className="text-sm font-semibold text-slate-700 mb-1">
            강의 자료를 업로드해 주세요
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            PDF를 업로드하거나 상단의 [샘플 자료 불러오기]를 누르면 즉시 학습이 시작됩니다.
          </p>
        </div>

        {/* 엄격한 근거 기반 원칙 안내 */}
        <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-4 text-xs text-teal-900 space-y-2">
          <div className="flex items-center space-x-1.5 font-bold text-teal-800">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>무환각(Anti-Hallucination) 원칙</span>
          </div>
          <p className="text-teal-700 leading-relaxed">
            간호학 특성상 잘못된 정보는 환자 안전에 치명적입니다. 본 튜터는 업로드된 문서 밖의 정보는 절대 지어내지 않으며, 모든 답변에 근거 페이지를 명시합니다.
          </p>
        </div>
      </aside>
    );
  }

  const { metadata, pages } = document;

  return (
    <aside className="w-full lg:w-80 bg-white border-r border-slate-200 p-5 flex flex-col space-y-5 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* 문서 요약 정보 카드 */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-teal-100 rounded-lg text-teal-700">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-600 text-white">
            학습 중
          </span>
        </div>

        <h3
          className="text-sm font-bold text-slate-900 break-words mb-2"
          title={metadata.fileName}
        >
          {metadata.fileName}
        </h3>

        <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <span className="flex items-center text-slate-500">
              <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" /> 총 분량
            </span>
            <span className="font-semibold text-slate-800">{metadata.totalPages} 페이지</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center text-slate-500">
              <FileText className="w-3.5 h-3.5 mr-1 text-slate-400" /> 총 글자 수
            </span>
            <span className="font-semibold text-slate-800">
              {metadata.characterCount.toLocaleString()} 자
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center text-slate-500">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" /> 로드 시각
            </span>
            <span className="text-slate-700">
              {new Date(metadata.uploadedAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* 엄격한 근거 기반 보증 뱃지 */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-950">
        <div className="flex items-center space-x-1.5 font-bold text-emerald-800 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Strict Grounding 활성화</span>
        </div>
        <p className="text-emerald-700 text-[11px] leading-relaxed">
          Google <strong>Gemini 3.8 Flash</strong>가 임의의 지식을 날조하지 않고 오직 강의 자료 내용만을 근거로 요약하고 설명합니다.
        </p>
      </div>

      {/* 페이지별 색인 퀵 네비게이터 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>문서 페이지 색인 ({pages.length}p)</span>
          <span className="text-[11px] text-slate-400 font-normal">클릭하여 미리보기</span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {pages.map((p) => (
            <button
              key={p.pageNumber}
              onClick={() => onSelectPagePreview && onSelectPagePreview(p.pageNumber)}
              className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 transition-all text-xs group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-slate-800 group-hover:text-teal-700">
                  Page {p.pageNumber}
                </span>
                <span className="text-[10px] text-slate-400">
                  {p.text.length} 자
                </span>
              </div>
              <p className="text-slate-500 line-clamp-2 text-[11px] leading-tight">
                {p.text}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 임상 학습 팁 */}
      <div className="mt-auto pt-3 border-t border-slate-200">
        <div className="flex items-start space-x-2 text-slate-500 text-[11px]">
          <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p>
            요약문에서 어려운 의학 용어를 마우스로 드래그하면 즉시 심화 질문을 보낼 수 있습니다.
          </p>
        </div>
      </div>
    </aside>
  );
};
