"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { X, LogIn, UserPlus, Heart } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  featureName?: string; // "ウィッシュリスト" etc.
}

export default function AuthModal({ onClose, featureName = "この機能" }: AuthModalProps) {
  const router = useRouter();
  const locale = useLocale();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* アイコン */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Heart size={28} className="text-white" fill="white" />
          </div>
        </div>

        {/* テキスト */}
        <h2 className="text-xl font-black text-gray-800 text-center mb-2">
          ログインが必要です
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          <span className="font-bold text-pink-500">{featureName}</span>を使うには
          <br />アカウントが必要です。無料で登録できます！
        </p>

        {/* ボタン */}
        <div className="space-y-3">
          <button
            onClick={() => router.push(`/${locale}/auth/signin`)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black rounded-2xl hover:opacity-90 transition-opacity shadow-md"
          >
            <LogIn size={18} />
            ログイン
          </button>
          <button
            onClick={() => router.push(`/${locale}/auth/signup`)}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-pink-300 text-pink-600 font-black rounded-2xl hover:bg-pink-50 transition-colors"
          >
            <UserPlus size={18} />
            新規登録（無料）
          </button>
        </div>
      </div>
    </div>
  );
}
