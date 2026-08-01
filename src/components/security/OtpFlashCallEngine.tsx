import React, { useState } from 'react';
import { PhoneCall, Phone, KeyRound, RefreshCw, CheckCircle, AlertTriangle, Zap, Shield } from 'lucide-react';
import { useTranslation } from '../../lib/translations';

interface OtpFlashCallEngineProps {
  phone: string;
  onPhoneChange: (val: string) => void;
  onSendCode: (phone: string, channel: 'flash_call' | 'sms') => void;
  onVerifyCode: (code: string) => void;
  resendCooldown: number;
  isSending?: boolean;
  isVerifying?: boolean;
  activeOtpInfo?: {
    channel?: string;
    callerNumber?: string;
    demoCodePreview?: string;
    costSavingsNote?: string;
  } | null;
}

export default function OtpFlashCallEngine({
  phone,
  onPhoneChange,
  onSendCode,
  onVerifyCode,
  resendCooldown,
  isSending,
  isVerifying,
  activeOtpInfo
}: OtpFlashCallEngineProps) {
  const { lang } = useTranslation();
  const [channel, setChannel] = useState<'flash_call' | 'sms'>('flash_call');
  const [code, setCode] = useState('');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl text-xs">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h4 className="font-bold text-white text-sm">
            {lang === 'ru' ? 'Верификация Номера (Flash Call / СМС)' : 'Phone Verification'}
          </h4>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
          Flash Call 0.20₽
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-slate-400 text-[11px] mb-1">
            {lang === 'ru' ? 'Номер мобильного телефона' : 'Mobile Phone Number'}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => onPhoneChange(e.target.value)}
            placeholder="+7 (902) 555-12-34"
            className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Channel preference */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10 gap-1">
          <button
            type="button"
            onClick={() => setChannel('flash_call')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 ${
              channel === 'flash_call' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'Flash Call (Звонок-сброс)' : 'Flash Call'}</span>
          </button>
          <button
            type="button"
            onClick={() => setChannel('sms')}
            className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 ${
              channel === 'sms' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{lang === 'ru' ? 'СМС Код' : 'SMS Code'}</span>
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder={
              channel === 'flash_call'
                ? (lang === 'ru' ? 'Последние 4 цифры звонящего' : 'Last 4 digits of caller')
                : (lang === 'ru' ? 'Код из СМС' : 'Code from SMS')
            }
            className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={() => onSendCode(phone, channel)}
            disabled={resendCooldown > 0 || isSending}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold border border-emerald-500/30 whitespace-nowrap disabled:opacity-50"
          >
            {resendCooldown > 0
              ? `${resendCooldown}s`
              : isSending
              ? (lang === 'ru' ? 'Звоним...' : 'Calling...')
              : (lang === 'ru' ? 'Запросить' : 'Get Code')}
          </button>
        </div>

        {activeOtpInfo && (
          <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/30 text-emerald-300 text-[11px] space-y-1">
            <p className="font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {activeOtpInfo.channel === 'flash_call'
                ? (lang === 'ru' ? 'Звонок выполнен! Введите последние 4 цифры:' : 'Call placed! Enter last 4 digits:')
                : (lang === 'ru' ? 'СМС отправлено!' : 'SMS sent!')}
            </p>
            <p className="font-mono text-white text-xs bg-emerald-950/60 p-1.5 rounded border border-emerald-500/20 text-center">
              {activeOtpInfo.demoCodePreview || 'XXXX'}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => onVerifyCode(code)}
          disabled={!code.trim() || isVerifying}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          {isVerifying ? (lang === 'ru' ? 'Проверка...' : 'Verifying...') : (lang === 'ru' ? 'Подтвердить и Войти' : 'Verify & Enter')}
        </button>
      </div>
    </div>
  );
}
