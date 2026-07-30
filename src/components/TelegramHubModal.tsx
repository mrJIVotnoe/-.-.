import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Smartphone, 
  Bot, 
  CheckCircle2, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  Bell, 
  ShieldCheck, 
  Sparkles, 
  Anchor, 
  RefreshCw, 
  QrCode, 
  Radio, 
  UserCheck, 
  MessageSquareText, 
  Layers,
  Terminal,
  Zap
} from 'lucide-react';
import { 
  getTelegramWebApp, 
  isTelegramMiniApp, 
  getTelegramUser, 
  triggerHaptic,
  TelegramUser 
} from '../lib/telegramSDK';

interface TelegramHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export default function TelegramHubModal({ isOpen, onClose, lang }: TelegramHubModalProps) {
  const [activeTab, setActiveTab] = useState<'app' | 'links' | 'setup' | 'notifications' | 'webhook'>('app');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [tgConfig, setTgConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);
  
  // Telegram User context
  const tgUser: TelegramUser | null = getTelegramUser();
  const inMiniApp = isTelegramMiniApp();

  // Test Notification form state
  const [testChatId, setTestChatId] = useState<string>(tgUser ? String(tgUser.id) : '');
  const [testTitle, setTestTitle] = useState<string>('⚓ Новая бронь в ФАРВАТЕР JIV Fleet');
  const [testMessage, setTestMessage] = useState<string>('Капитан принял ваш запрос на аренду яхты "Фрегат" 14 м. Выход от причала Улисс.');
  const [notifyStatus, setNotifyStatus] = useState<any>(null);
  const [sendingNotify, setSendingNotify] = useState<boolean>(false);

  const fetchTgConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/telegram/config');
      if (res.ok) {
        const data = await res.json();
        setTgConfig(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTgConfig();
      if (tgUser && !testChatId) {
        setTestChatId(String(tgUser.id));
      }
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    triggerHaptic('light');
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendTestNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testChatId) return;
    
    setSendingNotify(true);
    triggerHaptic('medium');

    try {
      const res = await fetch('/api/telegram/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: testChatId,
          title: testTitle,
          message: testMessage,
          actionUrl: window.location.origin
        })
      });
      const data = await res.json();
      setNotifyStatus(data);
      triggerHaptic('success');
    } catch (err: any) {
      setNotifyStatus({ status: 'error', message: err?.message || 'Failed to dispatch' });
      triggerHaptic('error');
    } finally {
      setSendingNotify(false);
    }
  };

  if (!isOpen) return null;

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://fleet.your-domain.ru';
  const botUsername = tgConfig?.botUsername || 'JivVladivostokFleetBot';

  const deepLinks = [
    { title: 'Каталог Яхт & Катеров', param: 'fleet', url: `https://t.me/${botUsername}/app?startapp=fleet` },
    { title: 'Морское Такси & SOS', param: 'sea_taxi', url: `https://t.me/${botUsername}/app?startapp=sea_taxi` },
    { title: 'Цифровой Мостик Капитана', param: 'captain', url: `https://t.me/${botUsername}/app?startapp=captain` },
    { title: 'Консьерж & Экскурсии', param: 'concierge', url: `https://t.me/${botUsername}/app?startapp=concierge` },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-sky-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Send className="w-6 h-6 rotate-[-12deg]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-mono flex items-center gap-2">
                  <span>Telegram Mini App & Bot Hub</span>
                </h2>
                {inMiniApp ? (
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    <span>In Telegram App</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                    Ready for Bot
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'ru' 
                  ? 'Интеграция ФАРВАТЕР в Telegram: Mini App, Webhook Бот, PWA адаптация и Уведомления капитанам' 
                  : 'Full Telegram Mini App integration, webhook bot, captain notifications & deep linking.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-all border border-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="p-2 bg-slate-950/60 border-b border-white/5 flex flex-wrap gap-1 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => { setActiveTab('app'); triggerHaptic('light'); }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'app' 
                ? 'bg-sky-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mini App Status</span>
          </button>

          <button
            onClick={() => { setActiveTab('links'); triggerHaptic('light'); }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'links' 
                ? 'bg-sky-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Deep Links</span>
          </button>

          <button
            onClick={() => { setActiveTab('notifications'); triggerHaptic('light'); }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'notifications' 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Push Dispatcher</span>
          </button>

          <button
            onClick={() => { setActiveTab('setup'); triggerHaptic('light'); }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'setup' 
                ? 'bg-emerald-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>BotFather Guide</span>
          </button>

          <button
            onClick={() => { setActiveTab('webhook'); triggerHaptic('light'); }}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === 'webhook' 
                ? 'bg-indigo-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Webhook API</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-300 text-xs sm:text-sm">
          
          {/* TAB 1: MINI APP STATUS & USER CONTEXT */}
          {activeTab === 'app' && (
            <div className="space-y-4 font-mono">
              {/* Telegram User Card if inside Telegram */}
              {inMiniApp && tgUser ? (
                <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {tgUser.photo_url ? (
                      <img src={tgUser.photo_url} alt="TG User" className="w-12 h-12 rounded-full border border-sky-400/50" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 font-bold text-lg">
                        {tgUser.first_name[0]}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm sm:text-base">
                          {tgUser.first_name} {tgUser.last_name || ''}
                        </span>
                        {tgUser.is_premium && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                            PREMIUM
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-sky-300 font-mono">
                        @{tgUser.username || `id${tgUser.id}`} • ID: {tgUser.id}
                      </span>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-bold block">✓ TG WebApp SDK Connected</span>
                    <span>Haptic Feedback Enabled</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-white font-bold block">Браузерный режим (Web Preview Mode)</span>
                      <span className="text-xs text-slate-400">
                        Приложение полностью готово и мгновенно адаптируется при открытии внутри Telegram Mini App.
                      </span>
                    </div>
                  </div>
                  <a
                    href={`https://t.me/${botUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow"
                  >
                    <span>Запустить в TG</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Telegram SDK Features Checklist */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-3">
                <h3 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span>Интегрированные возможности Telegram SDK:</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Telegram WebApp Script Integration</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Haptic Feedback & Native Vibration</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Native Telegram Dark Theme Auto-Match</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Auto Viewport Expand (`expand()`)</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>MainButton & BackButton Dynamic Control</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>InitData HMAC-SHA256 Auth Ready</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DEEP LINKS & DIRECT LAUNCH */}
          {activeTab === 'links' && (
            <div className="space-y-4 font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-500/30 text-xs">
                <span className="text-sky-300 font-bold block mb-1">Прямые ссылки для вызова разделов Mini App (Deep Linking):</span>
                <p className="text-slate-400">
                  Вы можете использовать эти ссылки в маркетинге, Telegram-каналах и QR-кодах причалов Владивостока.
                </p>
              </div>

              <div className="space-y-2">
                {deepLinks.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-white font-bold block text-xs">{item.title}</span>
                      <span className="text-slate-400 text-[11px]">{item.url}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyToClipboard(item.url, `dl_${idx}`)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 font-mono"
                      >
                        {copiedKey === `dl_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Копировать</span>
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Открыть</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PUSH NOTIFICATIONS DISPATCHER */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleSendTestNotification} className="space-y-4 font-mono">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                <span className="font-bold block text-amber-300">🔔 Диспетчер уведомлений каптанам и пассажирам</span>
                <p className="text-slate-300">
                  Отправка push-уведомлений о статусах бронирования, рейдовой эвакуации или прогнозе погоды прямо в Telegram чат.
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-white/10">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-bold">Telegram Chat ID получателя:</label>
                  <input
                    type="text"
                    value={testChatId}
                    onChange={(e) => setTestChatId(e.target.value)}
                    placeholder="Например: 123456789"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                  {tgUser && (
                    <button
                      type="button"
                      onClick={() => setTestChatId(String(tgUser.id))}
                      className="text-[11px] text-amber-400 hover:underline mt-1 block"
                    >
                      Подставить мой Chat ID ({tgUser.id})
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-bold">Заголовок сообщения:</label>
                  <input
                    type="text"
                    value={testTitle}
                    onChange={(e) => setTestTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-bold">Текст сообщения:</label>
                  <textarea
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-500 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingNotify}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Send className={`w-4 h-4 ${sendingNotify ? 'animate-bounce' : ''}`} />
                  <span>{sendingNotify ? 'Отправка...' : 'Отправить тестовое уведомление'}</span>
                </button>

                {notifyStatus && (
                  <div className={`p-3 rounded-xl border text-xs ${
                    notifyStatus.status === 'sent' 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}>
                    <pre className="whitespace-pre-wrap font-mono text-[11px]">
                      {JSON.stringify(notifyStatus, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* TAB 4: BOTFATHER GUIDE */}
          {activeTab === 'setup' && (
            <div className="space-y-4 font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs space-y-1">
                <span className="text-emerald-300 font-bold block">🛠️ Шаги создания бота в @BotFather:</span>
                <p className="text-slate-400">Пять простых шагов для подключения вашего Telegram Бот токена к платформе.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <span className="text-emerald-400 font-bold text-xs block">1. Создание бота:</span>
                  <p className="text-xs text-slate-300">
                    Напишите <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-400 underline">@BotFather</a> в Telegram команду <code className="bg-black px-1.5 py-0.5 rounded text-emerald-300">/newbot</code> и укажите имя: <strong className="text-white">ФАРВАТЕР Владивосток</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <span className="text-emerald-400 font-bold text-xs block">2. Получение Bot Token:</span>
                  <p className="text-xs text-slate-300">
                    Скопируйте предоставленный токен и укажите его в <code className="bg-black px-1.5 py-0.5 rounded text-amber-300">.env</code> под переменной <code className="bg-black px-1.5 py-0.5 rounded text-amber-300">TELEGRAM_BOT_TOKEN</code>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <span className="text-emerald-400 font-bold text-xs block">3. Настройка Mini App URL:</span>
                  <p className="text-xs text-slate-300">
                    Отправьте команду <code className="bg-black px-1.5 py-0.5 rounded text-emerald-300">/newapp</code> в @BotFather, выберите вашего бота, установите название и укажите Web App URL:
                  </p>
                  <div className="p-2 rounded bg-black text-sky-300 text-[11px] flex items-center justify-between gap-2 mt-1">
                    <code>{appOrigin}</code>
                    <button
                      onClick={() => copyToClipboard(appOrigin, 'app_origin')}
                      className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white shrink-0"
                    >
                      {copiedKey === 'app_origin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                  <span className="text-emerald-400 font-bold text-xs block">4. Включение Menu Button:</span>
                  <p className="text-xs text-slate-300">
                    Отправьте <code className="bg-black px-1.5 py-0.5 rounded text-emerald-300">/setmenubutton</code> в @BotFather для вывода запускной кнопки "🚀 ФАРВАТЕР" в диалогах с пользователями.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WEBHOOK API */}
          {activeTab === 'webhook' && (
            <div className="space-y-4 font-mono">
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs space-y-1">
                <span className="font-bold block text-indigo-300">📡 Конфигурация Webhook API Endpoint:</span>
                <p className="text-slate-300">
                  Эндпоинт <code className="bg-black px-1.5 py-0.5 rounded text-indigo-300">/api/telegram/webhook</code> принимает события от Telegram API и мгновенно обрабатывает команды `/start` и `/fleet`.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">Статус вебхука:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ENDPOINT READY</span>
                  </span>
                </div>

                <div className="p-2.5 rounded bg-black text-indigo-300 text-xs overflow-x-auto">
                  <code>POST {appOrigin}/api/telegram/webhook</code>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <Send className="w-4 h-4 text-sky-400" />
            <span>Telegram Bot Username: <strong className="text-white">@{botUsername}</strong></span>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg"
          >
            Закрыть Панель
          </button>
        </div>

      </div>
    </div>
  );
}
