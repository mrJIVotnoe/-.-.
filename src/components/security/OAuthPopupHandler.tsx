import React, { useState, useEffect } from 'react';
import { Globe, ShieldCheck, ExternalLink, RefreshCw, KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../lib/translations';

interface OAuthPopupHandlerProps {
  onOAuthSuccess: (user: any, provider: string) => void;
}

export default function OAuthPopupHandler({ onOAuthSuccess }: OAuthPopupHandlerProps) {
  const { lang } = useTranslation();
  const [oauthStatus, setOauthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchOauthStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/oauth/status');
      const data = await res.json();
      setOauthStatus(data);
    } catch (e) {
      console.error('OAuth status fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOauthStatus();

    // Strict postMessage origin listener to prevent spoofing
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data && event.data.token && event.data.user) {
        onOAuthSuccess(event.data.user, event.data.provider || 'OAuth');
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const handleLaunchOAuth = async (provider: 'yandex' | 'google' | 'apple' | 'wechat') => {
    try {
      const res = await fetch(`/api/auth/oauth/authorize?provider=${provider}`);
      const data = await res.json();
      if (data.authUrl) {
        const width = 600;
        const height = 650;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        window.open(
          data.authUrl,
          `oauth_${provider}`,
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
        );
      }
    } catch (err) {
      console.error('OAuth launch error:', err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl text-xs">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-400" />
          <h4 className="font-bold text-white text-sm">
            {lang === 'ru' ? 'Единый Вход OAuth 2.0 (SSO)' : 'OAuth 2.0 SSO Portal'}
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="text-purple-300 hover:text-purple-200 font-mono text-[11px] underline flex items-center gap-1"
        >
          {lang === 'ru' ? 'Статус интеграций' : 'Inspect Status'}
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => handleLaunchOAuth('yandex')}
          className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold transition-all text-left flex items-center gap-2"
        >
          <div className="w-6 h-6 rounded bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
            Я
          </div>
          <div>
            <span className="block font-bold">Яндекс ID</span>
            <span className="text-[10px] text-amber-400/70 font-normal">Единая Россия</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleLaunchOAuth('wechat')}
          className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold transition-all text-left flex items-center gap-2"
        >
          <div className="w-6 h-6 rounded bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
            微
          </div>
          <div>
            <span className="block font-bold">WeChat ID</span>
            <span className="text-[10px] text-emerald-400/70 font-normal">微信一键登录</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleLaunchOAuth('google')}
          className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold transition-all text-left flex items-center gap-2"
        >
          <div className="w-6 h-6 rounded bg-blue-500 text-white font-black text-xs flex items-center justify-center">
            G
          </div>
          <div>
            <span className="block font-bold">Google Auth</span>
            <span className="text-[10px] text-blue-400/70 font-normal">International</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleLaunchOAuth('apple')}
          className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 font-bold transition-all text-left flex items-center gap-2"
        >
          <div className="w-6 h-6 rounded bg-white text-slate-950 font-black text-xs flex items-center justify-center">
            
          </div>
          <div>
            <span className="block font-bold">Apple ID</span>
            <span className="text-[10px] text-slate-400 font-normal">iOS Device Sync</span>
          </div>
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                {lang === 'ru' ? 'Телеметрия OAuth-Серверов' : 'OAuth Provider Telemetry'}
              </h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between">
                <span>Yandex OAuth 2.0</span>
                <span className="text-emerald-400 font-bold">ACTIVE (152-ФЗ)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between">
                <span>WeChat Pay & Login</span>
                <span className="text-emerald-400 font-bold">ACTIVE (CN)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between">
                <span>Google OAuth Client</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between">
                <span>Apple Sign-In</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              {lang === 'ru' ? 'Закрыть' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
