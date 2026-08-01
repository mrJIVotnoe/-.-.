import React from 'react';
import { PhoneCall, AlertTriangle, Mail, Shield, Zap } from 'lucide-react';
import { useTranslation } from '../../lib/translations';

interface OtpFlashCallEngineProps {
  phone: string;
  onPhoneChange: (val: string) => void;
  onSendCode: (phone: string, channel: 'flash_call' | 'sms') => void;
  onVerifyCode: (code: string) => void;
  resendCooldown: number;
  isSending?: boolean;
  isVerifying?: boolean;
  activeOtpInfo?: any;
}

export default function OtpFlashCallEngine({
  phone,
  onPhoneChange
}: OtpFlashCallEngineProps) {
  const { lang } = useTranslation();

  return (
    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-xl text-xs">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-amber-400" />
          <h4 className="font-bold text-white text-sm">
            {lang === 'ru' ? 'Телефон / СМС (Low-Cost Защита)' : 'Phone / SMS (Low-Cost Guard)'}
          </h4>
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono">
          SMS Шлюз Заблокирован
        </span>
      </div>

      <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 space-y-2 text-slate-300">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            {lang === 'ru' 
              ? 'СМС и Flash Call отключены на старте проекта (Low Cost Strategy)' 
              : 'SMS / Flash Call disabled for low-cost operational efficiency'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {lang === 'ru'
            ? 'Для минимизации расходов на сторонние телеком-шлюзы регистрация и вход выполняются через бесплатный E-mail OTP (152-ФЗ / 547-ФЗ) или социальные профили Яндекс ID / Google / Apple / WeChat.'
            : 'Please use Email OTP or Yandex / Google / Apple / WeChat OAuth for instant free authentication.'}
        </p>
      </div>

      <div className="pt-1">
        <label className="block text-slate-400 text-[11px] mb-1">
          {lang === 'ru' ? 'Укажите Ваш e-mail для бесплатного входа' : 'Use your Email address for free access'}
        </label>
        <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-white/10 text-slate-400 text-xs">
          <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{lang === 'ru' ? 'Перейдите на вкладку «Email (152-ФЗ)» или «OAuth / SSO»' : 'Switch to Email or OAuth tab'}</span>
        </div>
      </div>
    </div>
  );
}

