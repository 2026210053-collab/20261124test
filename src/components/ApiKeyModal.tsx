'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  ExternalLink,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (newKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setInputVal(apiKey);
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputVal.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const handleClear = () => {
    setInputVal('');
    onSaveApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Gemini API 키 설정
              </h3>
              <p className="text-[11px] text-slate-500">
                적용 모델: <span className="font-semibold text-teal-700">gemini-3.8-flash</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 leading-relaxed">
            <div className="flex items-center space-x-1 font-bold mb-1 text-teal-800">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>무료 발급 안내 (신용카드 불필요)</span>
            </div>
            <p className="text-teal-700 text-[11px]">
              Google AI Studio에서 구글 계정으로 로그인 후 클릭 한 번으로 무료 API 키를 발급받으실 수 있습니다.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 mt-2 text-[11px] font-bold text-teal-700 underline underline-offset-2 hover:text-teal-900"
            >
              <span>Google AI Studio에서 API 키 발급받기</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 pr-20 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                  title={showKey ? '숨기기' : '보기'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {inputVal && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 text-rose-400 hover:text-rose-600"
                    title="초기화"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-teal-600" />
              입력하신 키는 사용자의 브라우저(LocalStorage)에만 안전하게 보관됩니다.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              닫기
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-white" />
                  저장 완료!
                </>
              ) : (
                '저장하기'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
