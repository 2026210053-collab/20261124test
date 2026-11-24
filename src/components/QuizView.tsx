'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCw,
  BookOpen,
  Award,
  AlertCircle,
  FileQuestion,
  Filter,
  Check,
  Sparkles,
} from 'lucide-react';
import { ParsedDocument, QuizData, QuizQuestion } from '@/lib/types';

interface QuizViewProps {
  document: ParsedDocument;
}

export const QuizView: React.FC<QuizViewProps> = ({ document }) => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // 사용자의 선택 답안 맵 (questionId -> selectedOptionIndex)
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});

  // 오답 노트 필터 모드 (틀린 문제만 모아보기)
  const [showWrongOnly, setShowWrongOnly] = useState<boolean>(false);

  useEffect(() => {
    if (document) {
      loadQuiz();
    }
  }, [document.metadata.fileName]);

  const loadQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setNotice(null);
    setUserAnswers({});
    setShowWrongOnly(false);

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: document.fullText,
          questionCount: 5,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '퀴즈를 불러오는 데 실패했습니다.');
      }

      setQuizData(data.quiz);
      if (data.notice) {
        setNotice(data.notice);
      }
    } catch (err: any) {
      console.error('퀴즈 로딩 에러:', err);
      setError(err.message || '퀴즈를 생성하는 도중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    // 이미 푼 문제는 선택 변경 불가 (한 번 풀면 피드백 제공)
    if (userAnswers[questionId] !== undefined) return;

    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-2xl border border-slate-200 p-8 space-y-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
          <FileQuestion className="w-5 h-5 text-teal-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-800">
            강의 자료를 바탕으로 맞춤형 복습 퀴즈를 출제하고 있습니다...
          </p>
          <p className="text-xs text-slate-500">
            4지선다형 및 O/X 문제와 근거 페이지를 정밀 검증 중입니다.
          </p>
        </div>
      </div>
    );
  }

  if (error || !quizData) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4">
        <div className="p-3 bg-rose-100 rounded-full text-rose-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">
            퀴즈를 불러올 수 없습니다
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md">
            {error || '퀴즈 데이터가 존재하지 않습니다.'}
          </p>
        </div>
        <button
          onClick={loadQuiz}
          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5 mr-1.5" />
          다시 시도
        </button>
      </div>
    );
  }

  const { questions } = quizData;
  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = questions.length;

  // 정답 및 오답 통계 계산
  const correctCount = questions.filter(
    (q) => userAnswers[q.id] === q.correctAnswerIndex
  ).length;

  const wrongQuestions = questions.filter(
    (q) => userAnswers[q.id] !== undefined && userAnswers[q.id] !== q.correctAnswerIndex
  );

  const displayedQuestions = showWrongOnly ? wrongQuestions : questions;
  const isFinished = answeredCount === totalQuestions;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* 퀴즈 상단 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900">{quizData.title}</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
              총 {totalQuestions}문항
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{quizData.description}</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* 오답 노트 토글 버튼 */}
          {answeredCount > 0 && wrongQuestions.length > 0 && (
            <button
              onClick={() => setShowWrongOnly(!showWrongOnly)}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                showWrongOnly
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5 mr-1 text-rose-500" />
              <span>오답 노트만 보기 ({wrongQuestions.length})</span>
            </button>
          )}

          <button
            onClick={loadQuiz}
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5 mr-1" />
            <span>새 퀴즈 생성</span>
          </button>
        </div>
      </div>

      {/* API 키 미설정 시 안내 배너 */}
      {notice && (
        <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200/80 text-xs text-amber-800 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* 진행 상황 및 스코어 바 */}
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center space-x-3">
          <span>
            풀이 현황:{' '}
            <strong className="text-slate-900">
              {answeredCount} / {totalQuestions}
            </strong>
          </span>
          {answeredCount > 0 && (
            <span>
              정답:{' '}
              <strong className="text-emerald-600">{correctCount}</strong>개
            </span>
          )}
        </div>

        {/* 진행 바 */}
        <div className="w-36 sm:w-48 bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* 완료 시 결과 축하 카드 */}
      {isFinished && !showWrongOnly && (
        <div className="m-6 p-5 rounded-2xl bg-gradient-to-r from-teal-50 to-sky-50 border border-teal-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-teal-600 text-white rounded-xl shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-teal-950">
                퀴즈를 모두 완료했습니다! 🎉
              </h4>
              <p className="text-xs text-teal-800 mt-0.5">
                총 {totalQuestions}문제 중{' '}
                <strong className="text-teal-900 font-extrabold">{correctCount}문제</strong>
                를 맞히셨습니다. (정답률 {Math.round((correctCount / totalQuestions) * 100)}%)
              </p>
            </div>
          </div>

          {wrongQuestions.length > 0 && (
            <button
              onClick={() => setShowWrongOnly(true)}
              className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors"
            >
              틀린 {wrongQuestions.length}문제 복습하기
            </button>
          )}
        </div>
      )}

      {/* 문제 리스트 영역 */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[calc(100vh-16rem)]">
        {displayedQuestions.map((q, idx) => {
          const userAnswer = userAnswers[q.id];
          const isAnswered = userAnswer !== undefined;
          const isCorrect = isAnswered && userAnswer === q.correctAnswerIndex;

          return (
            <div
              key={q.id}
              className={`p-5 rounded-xl border transition-all ${
                isAnswered
                  ? isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-rose-200 bg-rose-50/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* 문제 헤더 (태그, 번호, 근거 페이지) */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                    Q{idx + 1}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    {q.conceptTag || '간호학'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {q.type === 'ox' ? 'O/X 퀴즈' : '4지선다'}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  <BookOpen className="w-3 h-3 text-teal-600" />
                  <span>근거: p.{q.sourcePage}</span>
                </div>
              </div>

              {/* 문제 지문 */}
              <h3 className="text-sm font-bold text-slate-900 leading-snug mb-4">
                {q.question}
              </h3>

              {/* 선택지 목록 */}
              <div className="space-y-2">
                {q.options.map((option, optIdx) => {
                  const isSelected = userAnswer === optIdx;
                  const isThisCorrect = optIdx === q.correctAnswerIndex;

                  let optionStyle =
                    'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 text-slate-700';

                  if (isAnswered) {
                    if (isThisCorrect) {
                      optionStyle =
                        'border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                    } else if (isSelected && !isThisCorrect) {
                      optionStyle =
                        'border-rose-400 bg-rose-50 text-rose-950 font-semibold ring-1 ring-rose-400';
                    } else {
                      optionStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectAnswer(q.id, optIdx)}
                      disabled={isAnswered}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm text-left transition-all ${optionStyle}`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {q.type === 'ox'
                            ? optIdx === 0
                              ? 'O'
                              : 'X'
                            : optIdx + 1}
                        </span>
                        <span>{option}</span>
                      </div>

                      {isAnswered && (
                        <div>
                          {isThisCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                          {isSelected && !isThisCorrect && (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 정답 확인 후 상세 해설 박스 */}
              {isAnswered && (
                <div
                  className={`mt-4 p-4 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-200 ${
                    isCorrect
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/60 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-bold mb-1">
                    {isCorrect ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>정답입니다!</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>오답입니다.</span>
                      </>
                    )}
                    <span className="ml-2 font-normal text-slate-500">
                      (정답: {q.type === 'ox' ? (q.correctAnswerIndex === 0 ? 'O' : 'X') : `${q.correctAnswerIndex + 1}번`})
                    </span>
                  </div>

                  <p className="mt-1.5 text-slate-700 whitespace-pre-line">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
