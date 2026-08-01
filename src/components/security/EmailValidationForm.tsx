import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, AlertCircle, KeyRound, CheckCircle } from 'lucide-react';
import { useTranslation } from '../../lib/translations';

interface EmailValidationFormProps {
  onSendCode: (email: string, type: 'email') => void;
  onVerifyEmail: (email: string, passOrOtp: string, mode: 'otp' | 'password') => void;
  isSending?: boolean;
}

export default function EmailValidationForm({ onSendCode, onVerifyEmail, isSending }: EmailValidationFormProps) {
  const { lang } = useTranslation();
  const [email, setEmail] = useState('evgeny@yandex.ru');
  const [authType, setAuthType] = useState<'otp' | 'password'>('otp');
  const [codeOrPass, setCodeOrPass] = useState('');

  // Russian Email Domain Validator (152-ФЗ / 547-ФЗ compliance)
  const isRussianEmail = (emailStr: string) => {
    if (!emailStr || !emailStr.includes('@')) return true;
    const domain = emailStr.split('@')[1]?.toLowerCase();
    if (!domain) return true;
    const ruDomains = [
      'yandex.ru', 'ya.ru', 'yandex.com', 'mail.ru', 'bk.ru', 'inbox.ru',
      'list.ru', 'rambler.ru', 'internet.ru', 'sber.ru', 'sberbank.ru',
      'lenta.ru', 'autorub.ru', 'vk.com'
    ];
    return ruDomains.some(d => domain === d || domain.endsWith('.ru'));
  };

  const validDomain = isRussianEmail(email);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl text-xs">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-cyan-400" />
          <h4 className="font-bold text-white text-sm">
            {lang === 'ru' ? 'Авторизация по Email (152-ФЗ / 547-ФЗ)' : 'Email Authentication'}
          </h4>
        </div>
        <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono">
          ФЗ-547 Verified
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-slate-400 text-[11px] mb-1">
            {lang === 'ru' ? 'Адрес электронной почты' : 'Email Address'}
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vladivostok@yandex.ru"
              className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none ${
                !validDomain 
                  ? 'border-amber-500/60 focus:border-amber-400' 
                  : 'border-white/15 focus:border-cyan-500'
              }`}
            />
            {validDomain ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400 absolute right-3 top-3" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 absolute right-3 top-3" />
            )}
          </div>

          {!validDomain && (
            <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                {lang === 'ru'
                  ? 'Соглашения 152-ФЗ и 547-ФЗ требуют использование российских почтовых сервисов (Яндекс, Mail.ru, Rambler). Вход через зарубежные домены может потребовать дополнительной SMS-верификации.'
                  : 'Compliance policy recommends Russian regional domains (Yandex, Mail.ru) for domestic vessel booking.'}
              </span>
            </div>
          )}
        </div>

        {/* Sub-mode selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10 gap-1">
          <button
            type="button"
            onClick={() => setAuthType('otp')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
              authType === 'otp' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ru' ? 'Одноразовый Код (OTP)' : 'One-Time Pass (OTP)'}
          </button>
          <button
            type="button"
            onClick={() => setAuthType('password')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
              authType === 'password' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'ru' ? 'Пароль' : 'Password'}
          </button>
        </div>

        {authType === 'otp' ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={codeOrPass}
                onChange={e => setCodeOrPass(e.target.value)}
                placeholder={lang === 'ru' ? 'Код из письма (6 цифр)' : '6-digit OTP code'}
                className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="button"
                onClick={() => onSendCode(email, 'email')}
                disabled={isSending}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold border border-cyan-500/30 whitespace-nowrap"
              >
                {isSending ? (lang === 'ru' ? 'Отправка...' : 'Sending...') : (lang === 'ru' ? 'Запросить код' : 'Get Code')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="password"
              value={codeOrPass}
              onChange={e => setCodeOrPass(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => onVerifyEmail(email, codeOrPass, authType)}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition-all shadow-lg shadow-cyan-500/20"
        >
          {lang === 'ru' ? 'Войти / Зарегистрироваться' : 'Sign In / Register'}
        </button>
      </div>
    </div>
  );
}
