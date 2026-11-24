import Link from 'next/link';
import { HeartPulse, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
        <HeartPulse className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">404</h1>
      <h2 className="text-lg font-bold text-slate-700 mb-2">
        요청하신 페이지를 찾을 수 없습니다
      </h2>
      <p className="text-xs text-slate-500 mb-6 max-w-sm">
        주소가 잘못 입력되었거나 변경되었을 수 있습니다. 간호학 학습 대시보드로 돌아가세요.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-4 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        학습 대시보드로 돌아가기
      </Link>
    </div>
  );
}
