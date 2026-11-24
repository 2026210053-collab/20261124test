'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  Loader2,
  FileText,
  Sparkles,
  X,
} from 'lucide-react';
import { ParsedDocument } from '@/lib/types';

interface FileUploaderProps {
  onDocumentLoaded: (doc: ParsedDocument) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onDocumentLoaded,
  onClose,
  isModal = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);

    // 형식 검사
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setErrorMessage('PDF (.pdf) 파일만 업로드할 수 있습니다.');
      return;
    }

    // 용량 검사 (35MB)
    if (file.size > 35 * 1024 * 1024) {
      setErrorMessage('파일 용량이 너무 큽니다. 35MB 이하의 PDF 문서를 선택해 주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'PDF 문서를 처리하는 데 실패했습니다.');
      }

      onDocumentLoaded(data.document);
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      console.error('업로드 실패:', err);
      setErrorMessage(
        err.message || '파일 처리 중 오류가 발생했습니다. 다시 시도해 주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <div className="w-full">
      {/* 에러 메시지 알림 박스 */}
      {errorMessage && (
        <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs text-rose-800 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">업로드 오류: </span>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 드래그 앤 드롭 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-teal-500 bg-teal-50/60 scale-[1.01]'
            : 'border-slate-300 hover:border-teal-400 bg-white hover:bg-slate-50/80 shadow-sm'
        } ${isLoading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">
                PDF 강의 자료를 분석하고 있습니다...
              </p>
              <p className="text-xs text-slate-500">
                페이지별 텍스트 및 메타데이터를 정밀 추출 중입니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <UploadCloud className="w-8 h-8 stroke-[1.8]" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-bold text-slate-800">
                간호학 PDF 강의 자료를 여기에 끌어다 놓으세요
              </p>
              <p className="text-xs text-slate-500">
                또는 <span className="text-teal-600 font-semibold underline underline-offset-2">내 컴퓨터에서 파일 찾기</span>
              </p>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-2">
              <span>PDF 문서 (최대 35MB)</span>
              <span>•</span>
              <span>페이지 메타데이터 자동 추출</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
        <p className="font-semibold text-slate-700 flex items-center">
          <FileText className="w-3.5 h-3.5 mr-1 text-slate-500" /> 안내 사항
        </p>
        <p className="text-slate-500 text-[11px] leading-relaxed">
          • 글자가 이미지로만 된 스캔본의 경우 텍스트 인식이 어려울 수 있으니 OCR이 적용된 문서를 권장합니다.
        </p>
        <p className="text-slate-500 text-[11px] leading-relaxed">
          • 업로드된 문서는 외부 서버에 영구 저장되지 않으며 오직 학생 본인의 브라우저 세션 학습에만 활용됩니다.
        </p>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                새로운 강의 자료 업로드
              </h3>
              <p className="text-xs text-slate-500">
                학습할 간호학 PDF 자료를 등록하세요.
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {content}
        </div>
      </div>
    );
  }

  return content;
};
