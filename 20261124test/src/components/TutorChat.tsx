'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Bot,
  User,
  Sparkles,
  ShieldAlert,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';
import { ParsedDocument, ChatMessage } from '@/lib/types';

interface TutorChatProps {
  document: ParsedDocument;
  initialQuestion?: string;
  onClearInitialQuestion?: () => void;
}

// 간호학 추천 빠른 질문 칩 목록
const SUGGESTED_QUESTIONS = [
  'DKA 환자의 응급 수액 요법 3단계를 순서대로 설명해 줘.',
  '인슐린 투여 전 칼륨(K+) 수치를 반드시 확인해야 하는 이유는?',
  '의식이 있는 저혈당 환자에게 적용하는 15-15 규칙이란?',
  '당뇨병 환자의 발 간호(Foot Care) 시 가장 주의할 점은?',
];

export const TutorChat: React.FC<TutorChatProps> = ({
  document,
  initialQuestion,
  onClearInitialQuestion,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 초기 웰컴 메시지 설정
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `안녕하세요, 간호학생 여러분! 👩‍⚕️ **간호학 1:1 전담 AI 튜터**입니다.

현재 **[${document.metadata.fileName}]** 강의 자료를 완벽히 숙지하고 있습니다.
학습 중 이해가 잘 가지 않는 **병태생리 기전, 약물 요법, 응급 처치, 핵심 간호중재**에 대해 자유롭게 질문해 주세요.

> 🔒 **철저한 근거 기반 원칙**: 본 튜터는 업로드된 강의 자료 내용만을 근거로 답변하며, 자료에 없는 내용은 임의로 추측하지 않고 모든 설명에 **근거 페이지 번호(예: (p.2))**를 명시합니다.`,
          createdAt: Date.now(),
        },
      ]);
    }
  }, [document.metadata.fileName]);

  // 요약 뷰 등 외부에서 전달된 initialQuestion 처리
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim().length > 0) {
      handleSend(
        `강의 자료에 언급된 "${initialQuestion}" 개념에 대해 알기 쉽게 심화 설명해 주고, 몇 페이지에 나오는지 근거를 알려줘.`
      );
      if (onClearInitialQuestion) {
        onClearInitialQuestion();
      }
    }
  }, [initialQuestion]);

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      createdAt: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    const assistantMsgId = `assistant-${Date.now()}`;
    const initialAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      createdAt: Date.now(),
    };

    setMessages([...newMessages, initialAssistantMessage]);

    try {
      // API 호출용 메시지 페이로드 포맷팅
      const payloadMessages = newMessages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          documentText: document.fullText,
        }),
      });

      if (!response.ok) {
        throw new Error('튜터 응답을 가져오지 못했습니다.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('스트림을 읽을 수 없습니다.');
      }

      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, content: accumulated } : msg
          )
        );
      }
    } catch (error: any) {
      console.error('튜터 질의응답 오류:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  '⚠️ 답변을 생성하는 중 오류가 발생했습니다. OpenAI API 키 설정을 확인하거나 잠시 후 다시 질문해 주세요.',
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('대화 내용을 모두 초기화하시겠습니까?')) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'assistant',
          content: `대화가 초기화되었습니다. **[${document.metadata.fileName}]** 강의 자료에 대해 궁금한 점을 언제든 질문해 주세요! 🩺`,
          createdAt: Date.now(),
        },
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* 튜터 상단 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>1:1 심화 설명 & 질의응답 튜터</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              강의 자료의 내용만을 엄격히 근거로 설명하며 출처 페이지를 표시합니다.
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="inline-flex items-center px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="대화 내용 지우기"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          <span>대화 초기화</span>
        </button>
      </div>

      {/* 대화 메시지 영역 */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5 max-h-[calc(100vh-17rem)]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
            }`}
          >
            {/* 아바타 아이콘 */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-teal-100 text-teal-800 border border-teal-200'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            {/* 메시지 말풍선 */}
            <div
              className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-slate-50 text-slate-800 border border-slate-200/90 rounded-tl-none shadow-sm'
              }`}
            >
              <div className="prose prose-sm max-w-none text-inherit">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-teal-500 bg-teal-50/50 p-2.5 rounded-r-lg text-teal-900 my-2 text-xs"
                        {...props}
                      />
                    ),
                    code: ({ node, ...props }) => (
                      <code
                        className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-900 text-xs font-mono"
                        {...props}
                      />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>

              <div
                className={`text-[10px] mt-2 ${
                  msg.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                }`}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {isStreaming && (
          <div className="flex items-center space-x-2 text-xs text-teal-600 pl-11 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
            <span>강의 자료 페이지를 대조하며 답변을 작성하고 있습니다...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 추천 빠른 질문 칩 */}
      <div className="px-6 py-2 bg-slate-50/50 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-medium flex items-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-600" /> 추천 질문:
        </span>
        {SUGGESTED_QUESTIONS.map((question, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(question)}
            disabled={isStreaming}
            className="flex-shrink-0 px-2.5 py-1 bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-700 text-slate-600 rounded-full transition-colors text-xs disabled:opacity-50"
          >
            {question}
          </button>
        ))}
      </div>

      {/* 하단 입력 폼 */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="자료에 대해 궁금한 점을 입력하세요 (예: 5% 포도당 수액으로 언제 전환하나요?)"
            disabled={isStreaming}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-4 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-40 transition-colors shadow-sm flex items-center justify-center"
            title="질문 전송"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
