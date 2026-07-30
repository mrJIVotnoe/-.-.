import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  CreditCard, 
  Download, 
  CheckCircle2, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  Sparkles, 
  QrCode, 
  MessageSquare, 
  Globe, 
  Code2, 
  DollarSign, 
  ShieldCheck, 
  Layers, 
  Send,
  Zap,
  ArrowRight,
  FileCode
} from 'lucide-react';
import { 
  isWeChatBrowser, 
  isWeChatMiniApp, 
  requestWeChatPay, 
  convertRubToRmb 
} from '../lib/wechatSDK';

interface WeChatHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export default function WeChatHubModal({ isOpen, onClose, lang }: WeChatHubModalProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'pay' | 'package' | 'guide' | 'service'>('status');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [wxConfig, setWxConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);

  // WeChat Pay Test Form state
  const [testRub, setTestRub] = useState<number>(15000); // 15,000 RUB yacht rental demo
  const [payOrderResult, setPayOrderResult] = useState<any>(null);
  const [generatingOrder, setGeneratingOrder] = useState<boolean>(false);

  const inWeChat = isWeChatBrowser();
  const inMiniApp = isWeChatMiniApp();

  const fetchWxConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/wechat/config');
      if (res.ok) {
        const data = await res.json();
        setWxConfig(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWxConfig();
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestWeChatPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingOrder(true);

    try {
      const res = await fetch('/api/wechat/pay/unifiedorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rubAmount: testRub,
          boatTitle: 'Аренда яхты "Азимут" 16м (Залив Петра Великого)',
          bookingId: `RENT-WX-${Date.now().toString().slice(-6)}`
        })
      });
      const data = await res.json();
      setPayOrderResult(data);

      if (data.payParams && inWeChat) {
        // Trigger native WeChat Pay modal if inside WeChat
        await requestWeChatPay(data.payParams);
      }
    } catch (err: any) {
      setPayOrderResult({ error: err?.message || 'Failed to create WeChat Pay order' });
    } finally {
      setGeneratingOrder(false);
    }
  };

  if (!isOpen) return null;

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://fleet.your-domain.ru';
  const rmbCalc = convertRubToRmb(testRub);

  const miniAppFiles = [
    { name: 'app.json', desc: 'Mini App Window & Navigation Bar Config', path: '/wechat-miniprogram/app.json' },
    { name: 'app.js', desc: 'Startup lifecycle & wx.login() openid auth', path: '/wechat-miniprogram/app.js' },
    { name: 'project.config.json', desc: 'WeChat Developer Tools project manifest', path: '/wechat-miniprogram/project.config.json' },
    { name: 'pages/index/index.wxml', desc: 'Webview container embedding JIV Fleet app', path: '/wechat-miniprogram/pages/index/index.wxml' },
    { name: 'pages/index/index.js', desc: 'Webview controller & WeChat sharing handler', path: '/wechat-miniprogram/pages/index/index.js' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                  <span>WeChat Mini App & WeChat Pay Hub</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                    微信小程序
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'ru' 
                  ? 'Прямая бронь для китайских туристов во Владивостоке: 微信小程序, WeChat Pay (0% комиссия), RMB конвертер и Webview SDK' 
                  : 'Direct booking for Chinese tourists: WeChat Mini App, WeChat Pay (0% commission), RMB converter & JS-SDK integration.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-2 bg-slate-950/60 border-b border-white/5 flex flex-wrap gap-1 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'status' 
                ? 'bg-emerald-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mini App SDK Status</span>
          </button>

          <button
            onClick={() => setActiveTab('pay')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pay' 
                ? 'bg-emerald-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>WeChat Pay (微信支付)</span>
          </button>

          <button
            onClick={() => setActiveTab('package')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'package' 
                ? 'bg-sky-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Source Code Package</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'guide' 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Setup Guide (mp.weixin)</span>
          </button>

          <button
            onClick={() => setActiveTab('service')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'service' 
                ? 'bg-purple-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Customer Service Webhook</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-300 text-xs sm:text-sm">
          
          {/* TAB 1: MINI APP SDK & ENVIRONMENT STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-4 font-mono">
              {/* Environment Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-white font-bold block text-sm">
                      {inMiniApp 
                        ? '微信小程序 Webview Container' 
                        : inWeChat 
                          ? 'WeChat In-App Browser (微信内置浏览器)' 
                          : 'Web Browser Preview Mode (准备装载小程序)'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {inMiniApp 
                        ? 'Приложение работает внутри контейнера WeChat Mini App.' 
                        : 'Webview адаптация активна. Вся аналитика и прямые брони с 0% комиссией готовы к приему туристов из КНР.'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase block">
                    ✓ WeChat Ready
                  </span>
                </div>
              </div>

              {/* Integrated Capabilities Grid */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                <h3 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Интегрированные возможности WeChat JS-SDK & Mini App:</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>微信小程序 Webview Container (`app.json`)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>微信支付 WeChat Pay 0% Commission (`unifiedorder`)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>RMB / RUB Realtime Conversion (实时汇率)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>微信登录 WeChat `code2session` OpenID Auth</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>微信分享卡片 `onShareAppMessage` Custom Cover</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>微信地理位置 `wx.getLocation` Dock Map Sync</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WECHAT PAY & RMB CONVERTER */}
          {activeTab === 'pay' && (
            <form onSubmit={handleTestWeChatPay} className="space-y-4 font-mono">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs space-y-1">
                <span className="font-bold block text-emerald-300">💳 微信支付 0% 手续费 (WeChat Pay Direct Payment)</span>
                <p className="text-slate-300">
                  Китайские туристы и бизнес-делегации могут оплачивать аренду яхт и катеров прямо из WeChat в RMB без банковских посредников.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-bold">
                    Стоимость аренды яхты (в рублях ₽):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={testRub}
                      onChange={(e) => setTestRub(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                      min={1000}
                      step={500}
                      required
                    />
                    <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shrink-0 font-bold text-sm">
                      {rmbCalc.formattedRmb}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Автоматический расчет по курсу ЦБ/РМБ: 1 ₽ ≈ 0.082 ¥ RMB (0% комиссия судовладельца)
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={generatingOrder}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{generatingOrder ? 'Создание заказа 微信支付...' : 'Тестовый вызов 微信支付 (Unified Order)'}</span>
                </button>

                {payOrderResult && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
                    <span className="text-xs text-emerald-400 font-bold block">✓ Параметры вызова WeChat Pay API (`chooseWXPay`):</span>
                    <pre className="p-2.5 rounded bg-black text-emerald-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(payOrderResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* TAB 3: SOURCE CODE PACKAGE FOR WECHAT DEVELOPER TOOLS */}
          {activeTab === 'package' && (
            <div className="space-y-4 font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-500/30 text-xs">
                <span className="text-sky-300 font-bold block mb-1">📦 Готовый пакет кода WeChat Mini App (`/wechat-miniprogram/`):</span>
                <p className="text-slate-400">
                  Этот каталог содержит полный проект для импорта в official <strong className="text-white">微信开发者工具 (WeChat Developer Tools)</strong>.
                </p>
              </div>

              <div className="space-y-2">
                {miniAppFiles.map((file, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <FileCode className="w-4 h-4 text-sky-400 shrink-0" />
                      <div>
                        <span className="text-white font-bold block text-xs font-mono">{file.name}</span>
                        <span className="text-slate-400 text-[11px]">{file.desc}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(file.path, `file_${idx}`)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 shrink-0 font-mono"
                    >
                      {copiedKey === `file_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Путь</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SETUP GUIDE FOR WECHAT OPEN PLATFORM */}
          {activeTab === 'guide' && (
            <div className="space-y-4 font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 text-xs space-y-1">
                <span className="text-amber-300 font-bold block">🌏 Пошаговая регистрация в 微信公众平台 (mp.weixin.qq.com):</span>
                <p className="text-slate-400">Пять шагов для публикации Mini App в китайском WeChat App Store.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <span className="text-amber-400 font-bold text-xs block">1. Регистрация аккаунта Mini App:</span>
                  <p className="text-xs text-slate-300">
                    Перейдите на <a href="https://mp.weixin.qq.com" target="_blank" rel="noreferrer" className="text-sky-400 underline">mp.weixin.qq.com</a>, выберите тип "小程序" (Mini Program) и зарегистрируйте аккаунт судовладельца/туроператора.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <span className="text-amber-400 font-bold text-xs block">2. Добавление домена в White List (业务域名):</span>
                  <p className="text-xs text-slate-300">
                    В разделе 开发 -&gt; 开发管理 -&gt; 业务域名 укажите ваш производственный домен для загрузки в Webview:
                  </p>
                  <div className="p-2 rounded bg-black text-emerald-300 text-[11px] flex items-center justify-between gap-2 mt-1">
                    <code>{appOrigin}</code>
                    <button
                      onClick={() => copyToClipboard(appOrigin, 'domain_wl')}
                      className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white shrink-0"
                    >
                      {copiedKey === 'domain_wl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <span className="text-amber-400 font-bold text-xs block">3. Импорт в WeChat Developer Tools:</span>
                  <p className="text-xs text-slate-300">
                    Скачайте <strong className="text-white">微信开发者工具</strong>, создайте новый проект и выберите папку <code className="bg-black px-1.5 py-0.5 rounded text-sky-300">/wechat-miniprogram</code>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <span className="text-amber-400 font-bold text-xs block">4. Подключение WeChat Pay (商户号):</span>
                  <p className="text-xs text-slate-300">
                    Свяжите WeChat Merchant ID (`WECHAT_MCH_ID`) с AppID вашего Mini App в разделе 微信支付 для приема платежей в RMB без комиссии.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMER SERVICE WEBHOOK */}
          {activeTab === 'service' && (
            <div className="space-y-4 font-mono">
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs space-y-1">
                <span className="font-bold block text-purple-300">💬 客服消息 (WeChat Customer Service Endpoint)</span>
                <p className="text-slate-300">
                  Эндпоинт <code className="bg-black px-1.5 py-0.5 rounded text-purple-300">/api/wechat/message/webhook</code> автоматически обрабатывает обращения китайских клиентов и отправляет им ответы капитана.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">Статус WeChat Webhook:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>WEBHOOK ACTIVE</span>
                  </span>
                </div>

                <div className="p-2.5 rounded bg-black text-purple-300 text-xs overflow-x-auto">
                  <code>GET / POST {appOrigin}/api/wechat/message/webhook</code>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>WeChat AppID: <strong className="text-white">{wxConfig?.appId || 'wx1234567890abcdef'}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg"
          >
            Закрыть Панель
          </button>
        </div>

      </div>
    </div>
  );
}
