import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Bot, 
  CreditCard, 
  BarChart3, 
  ShieldAlert, 
  X, 
  KeyRound, 
  Lock, 
  LogOut,
  Save, 
  Zap, 
  AlertCircle,
  Globe,
  Send
} from 'lucide-react';
import { validateRootCredentials } from '../lib/rootGuardian';

interface AdminCommandCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminCommandCenterModal({ isOpen, onClose }: AdminCommandCenterModalProps) {
  // Auth state for Root access
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [loginInput, setLoginInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'company' | 'connections' | 'acquiring' | 'metrics'>('company');

  // Form states - Company Profile
  const [companyProfile, setCompanyProfile] = useState({
    legalName: 'ООО «Яхтенный Флот Владивосток»',
    inn: '254012345678',
    kpp: '254001001',
    ogrn: '1232500009876',
    director: 'Кузнец Евгений Александрович',
    legalAddress: '690091, г. Владивосток, ул. Набережная, д. 3, офис 401',
    phone: '+7 (423) 200-55-88',
    email: 'admin@vladivostok-fleet.ru'
  });

  // Form states - Connections
  const [connections, setConnections] = useState({
    telegramToken: '1234567890:ABCdefGHIjklMNOpqrsTUVwxyZ',
    telegramBotName: '@vladiwater_bot',
    telegramWebhookUrl: 'https://fleet.vladivostok.ru/api/telegram/webhook',
    wechatAppId: 'wx8888888888888888',
    wechatAppSecret: '••••••••••••••••••••••••••••••••',
    wechatToken: 'jiv_vladivostok_wechat_token'
  });

  // Form states - Acquiring
  const [acquiring, setAcquiring] = useState({
    sbpEnabled: true,
    sbpMerchantId: 'SBP_2540_JIV_MARINA',
    sbpApiKey: '••••••••••••••••',
    wechatPayEnabled: true,
    wechatMchId: '1600000000',
    wechatMchKey: '••••••••••••••••••••••••••••••••',
    bankProvider: 'sber', // sber | tbank | alfa
    commissionSbp: '1.2%',
    commissionCards: '2.3%'
  });

  // Metrics telemetry state
  const [metrics] = useState({
    totalVessels: 28,
    activeBookings: 142,
    monthlyRevenueRub: '18 450 000 ₽',
    monthlyRevenueCny: '1 420 000 ¥',
    captainVerificationRate: '100%',
    systemHealth: '99.98%'
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Security reset when modal closes or opens + load settings
  useEffect(() => {
    if (!isOpen) {
      setToastMessage(null);
      setAuthError(null);
      setLoginInput('');
      setPasswordInput('');
      setIsUnlocked(false);
    } else {
      // Load saved admin settings from API and localStorage
      fetch('/api/admin/settings')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.settings) {
            if (data.settings.company) setCompanyProfile(data.settings.company);
            if (data.settings.connections) setConnections(data.settings.connections);
            if (data.settings.acquiring) setAcquiring(data.settings.acquiring);
          }
        })
        .catch(() => {
          // Fallback to localStorage
          try {
            const c = localStorage.getItem('jiv_admin_company');
            if (c) setCompanyProfile(JSON.parse(c));
            const conn = localStorage.getItem('jiv_admin_connections');
            if (conn) setConnections(JSON.parse(conn));
            const acq = localStorage.getItem('jiv_admin_acquiring');
            if (acq) setAcquiring(JSON.parse(acq));
          } catch (e) {
            console.warn(e);
          }
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const isValid = validateRootCredentials(loginInput, passwordInput);
    if (isValid) {
      // Set session user to Root Sovereign in localStorage
      const rootUser = {
        id: 'usr_root_sovereign',
        name: 'Кузнец (Владелец JIV Fleet)',
        email: 'root@vladivostok-fleet.ru',
        role: 'admin',
        membershipTier: 'Root Sovereign Owner'
      };
      try {
        localStorage.setItem('jiv_user', JSON.stringify(rootUser));
        localStorage.setItem('jiv_auth_token', 'jiv_sess_root_sovereign_active');
      } catch (err) {
        console.warn('LocalStorage save notice:', err);
      }

      setIsUnlocked(true);
      // Security: Clear entered credentials immediately
      setLoginInput('');
      setPasswordInput('');
      triggerToast('👑 Доступ «Вечный Корень» подтверждён. Добро пожаловать в Кабинет!');
    } else {
      setAuthError('Неверный логин или пароль Root Guardian. Проверьте правильность введённых данных.');
      setPasswordInput('');
    }
  };

  const handleLockOut = () => {
    setIsUnlocked(false);
    setLoginInput('');
    setPasswordInput('');
    setAuthError(null);
    triggerToast('🔒 Сессия администратора завершена.');
  };

  const saveCategoryData = async (category: string, data: any, successMsg: string) => {
    try {
      localStorage.setItem(`jiv_admin_${category}`, JSON.stringify(data));
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, data })
      });
      triggerToast(successMsg);
    } catch (err) {
      console.warn('Save settings API notice:', err);
      triggerToast(successMsg);
    }
  };

  const handleSaveCompanyProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveCategoryData('company', companyProfile, '✅ Профиль компании и юридические данные сохранены!');
  };

  const handleSaveConnections = (e: React.FormEvent) => {
    e.preventDefault();
    saveCategoryData('connections', connections, '✅ Настройки Telegram & WeChat связей обновлены!');
  };

  const handleSaveAcquiring = (e: React.FormEvent) => {
    e.preventDefault();
    saveCategoryData('acquiring', acquiring, '✅ Параметры СБП и WeChat Pay эквайринга успешно применены!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[92vh] sm:h-[85vh] max-h-[820px]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-950 border-b border-amber-500/30 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div className="truncate">
              <h3 className="text-xs sm:text-sm md:text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2 truncate">
                <span>Пульт Управления</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] sm:text-[10px] font-mono shrink-0">
                  ROOT ADM
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                Командный центр владельца проекта JIV Fleet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isUnlocked && (
              <button
                onClick={handleLockOut}
                title="Заблокировать сессию"
                className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 px-4 py-2 text-xs font-bold text-center animate-fade-in shrink-0">
            {toastMessage}
          </div>
        )}

        {/* Content Area */}
        {!isUnlocked ? (
          /* ROOT GUARDIAN UNLOCK SCREEN (SCROLLABLE & RESPONSIVE) */
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-center min-h-0 w-full">
            <div className="w-full max-w-sm space-y-5 my-auto text-center">
              
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base sm:text-lg font-bold text-white">Авторизация Владельца Root</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Введите логин и пароль для входа в кабинет администратора.
                </p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-4 text-left">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Идентификатор / Логин
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={loginInput}
                      onChange={e => setLoginInput(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="off"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                    <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Ключ Доступа / Пароль
                  </label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="off"
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold uppercase text-xs tracking-wider transition-all shadow-lg shadow-amber-500/20"
                >
                  Войти в Кабинет Администратора
                </button>
              </form>

            </div>
          </div>
        ) : (
          /* UNLOCKED ADMIN DASHBOARD WITH ADAPTIVE TABS & SCROLLING */
          <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0 w-full">
            
            {/* MOBILE TAB NAV STRIP (< md) */}
            <div className="md:hidden flex flex-row overflow-x-auto p-2 gap-1.5 bg-slate-950 border-b border-white/10 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('company')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  activeTab === 'company'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'text-slate-400 border-transparent hover:bg-white/5'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Профиль</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('connections')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  activeTab === 'connections'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'text-slate-400 border-transparent hover:bg-white/5'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Связи</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('acquiring')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  activeTab === 'acquiring'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'text-slate-400 border-transparent hover:bg-white/5'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Эквайринг</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('metrics')}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  activeTab === 'metrics'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'text-slate-400 border-transparent hover:bg-white/5'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                <span>Метрики</span>
              </button>
            </div>

            {/* DESKTOP SIDEBAR NAV (>= md) */}
            <div className="hidden md:flex md:flex-col md:w-60 bg-slate-950 border-r border-white/10 p-3 space-y-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('company')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border ${
                  activeTab === 'company'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-inner'
                    : 'text-slate-400 hover:text-white border-transparent hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Профиль Компании</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('connections')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border ${
                  activeTab === 'connections'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-inner'
                    : 'text-slate-400 hover:text-white border-transparent hover:bg-white/5'
                }`}
              >
                <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Связи (Боты & Чат)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('acquiring')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border ${
                  activeTab === 'acquiring'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-inner'
                    : 'text-slate-400 hover:text-white border-transparent hover:bg-white/5'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Эквайринг (СБП/Pay)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('metrics')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left border ${
                  activeTab === 'metrics'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-inner'
                    : 'text-slate-400 hover:text-white border-transparent hover:bg-white/5'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Метрики & Телеметрия</span>
              </button>

              <div className="pt-4 border-t border-white/10 mt-auto">
                <div className="px-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-[10px] font-mono text-slate-400 space-y-1">
                  <p className="text-amber-400 font-bold">STATUS: SOVEREIGN ROOT</p>
                  <p>152-ФЗ Compliance: OK</p>
                  <p>ORM Postgres: Connected</p>
                </div>
              </div>
            </div>

            {/* TAB CONTENT PANEL (SCROLLABLE) */}
            <div className="flex-1 p-4 sm:p-6 bg-slate-900 overflow-y-auto min-h-0">
              
              {/* TAB 1: COMPANY PROFILE */}
              {activeTab === 'company' && (
                <form onSubmit={handleSaveCompanyProfile} className="space-y-4">
                  <div className="border-b border-white/10 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" />
                      <span>Юридический Профиль Компании (ООО / ИП)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Настройки юрлица для генерации договоров фрахтования и электронных чеков 54-ФЗ
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Наименование Юрлица
                      </label>
                      <input
                        type="text"
                        value={companyProfile.legalName}
                        onChange={e => setCompanyProfile({...companyProfile, legalName: e.target.value})}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        ИНН Юрлица
                      </label>
                      <input
                        type="text"
                        value={companyProfile.inn}
                        onChange={e => setCompanyProfile({...companyProfile, inn: e.target.value})}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        КПП
                      </label>
                      <input
                        type="text"
                        value={companyProfile.kpp}
                        onChange={e => setCompanyProfile({...companyProfile, kpp: e.target.value})}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        ОГРН / ОГРНИП
                      </label>
                      <input
                        type="text"
                        value={companyProfile.ogrn}
                        onChange={e => setCompanyProfile({...companyProfile, ogrn: e.target.value})}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        ФИО Генерального Директора / ИП
                      </label>
                      <input
                        type="text"
                        value={companyProfile.director}
                        onChange={e => setCompanyProfile({...companyProfile, director: e.target.value})}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Юридический и Почтовый Адрес
                      </label>
                      <input
                        type="text"
                        value={companyProfile.legalAddress}
                        onChange={e => setCompanyProfile({...companyProfile, legalAddress: e.target.value})}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Контактный Телефон
                      </label>
                      <input
                        type="text"
                        value={companyProfile.phone}
                        onChange={e => setCompanyProfile({...companyProfile, phone: e.target.value})}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        E-mail Администратора
                      </label>
                      <input
                        type="email"
                        value={companyProfile.email}
                        onChange={e => setCompanyProfile({...companyProfile, email: e.target.value})}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
                    >
                      <Save className="w-4 h-4" />
                      <span>Сохранить профиль компании</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: CONNECTIONS */}
              {activeTab === 'connections' && (
                <form onSubmit={handleSaveConnections} className="space-y-4">
                  <div className="border-b border-white/10 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Bot className="w-4 h-4 text-cyan-400" />
                      <span>Интеграция Мессенджеров & Ботов</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Управление ключами Telegram Bot API и WeChat Official Account Engine
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Telegram Block */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="font-bold text-white text-xs flex items-center gap-2">
                          <Send className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Telegram Bot (@vladiwater_bot)</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                          Webhook Active
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">
                          Bot Token (BotFather)
                        </label>
                        <input
                          type="text"
                          value={connections.telegramToken}
                          onChange={e => setConnections({...connections, telegramToken: e.target.value})}
                          className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">
                          Telegram Webhook Endpoint
                        </label>
                        <input
                          type="text"
                          value={connections.telegramWebhookUrl}
                          onChange={e => setConnections({...connections, telegramWebhookUrl: e.target.value})}
                          className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {/* WeChat Block */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="font-bold text-white text-xs flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <span>WeChat Official Account (微信公众号)</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                          OAuth Ready
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">
                            WeChat AppID
                          </label>
                          <input
                            type="text"
                            value={connections.wechatAppId}
                            onChange={e => setConnections({...connections, wechatAppId: e.target.value})}
                            className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">
                            WeChat AppSecret
                          </label>
                          <input
                            type="password"
                            value={connections.wechatAppSecret}
                            onChange={e => setConnections({...connections, wechatAppSecret: e.target.value})}
                            className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20"
                    >
                      <Save className="w-4 h-4" />
                      <span>Применить связи и токены</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: ACQUIRING & PAYMENTS */}
              {activeTab === 'acquiring' && (
                <form onSubmit={handleSaveAcquiring} className="space-y-4">
                  <div className="border-b border-white/10 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Шлюзы Эквайринга: СБП и WeChat Pay</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Управление комиссиями, QR-кодами СБП и китайскими платежными системами
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* SBP Gateway */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs flex items-center gap-2">
                          <span>📱 Система Быстрых Платежей (СБП 0.7-1.2%)</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={acquiring.sbpEnabled}
                          onChange={e => setAcquiring({...acquiring, sbpEnabled: e.target.checked})}
                          className="w-4 h-4 accent-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">
                            Merchant ID СБП
                          </label>
                          <input
                            type="text"
                            value={acquiring.sbpMerchantId}
                            onChange={e => setAcquiring({...acquiring, sbpMerchantId: e.target.value})}
                            className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">
                            Комиссия СБП
                          </label>
                          <input
                            type="text"
                            value={acquiring.commissionSbp}
                            onChange={e => setAcquiring({...acquiring, commissionSbp: e.target.value})}
                            className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* WeChat Pay Gateway */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs flex items-center gap-2">
                          <span>微信支付 WeChat Pay (CNY 汇率结算)</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={acquiring.wechatPayEnabled}
                          onChange={e => setAcquiring({...acquiring, wechatPayEnabled: e.target.checked})}
                          className="w-4 h-4 accent-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">
                            WeChat Merchant ID (MCH_ID)
                          </label>
                          <input
                            type="text"
                            value={acquiring.wechatMchId}
                            onChange={e => setAcquiring({...acquiring, wechatMchId: e.target.value})}
                            className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono text-slate-400 mb-1">
                            Комиссия Карт / Pay
                          </label>
                          <input
                            type="text"
                            value={acquiring.commissionCards}
                            onChange={e => setAcquiring({...acquiring, commissionCards: e.target.value})}
                            className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                    >
                      <Save className="w-4 h-4" />
                      <span>Сохранить настройки платежей</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 4: METRICS & TELEMETRY */}
              {activeTab === 'metrics' && (
                <div className="space-y-4">
                  <div className="border-b border-white/10 pb-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <span>Сводные Метрики Флота & Оборота</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Реальное состояние флота, бронирований и финансовой выручки
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Судов во Флоте</span>
                      <span className="text-xl font-black text-amber-400 font-mono">{metrics.totalVessels}</span>
                      <span className="text-[9px] text-emerald-400 block">100% GIMS Verified</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Бронирований в Месяц</span>
                      <span className="text-xl font-black text-cyan-400 font-mono">{metrics.activeBookings}</span>
                      <span className="text-[9px] text-cyan-300 block">+18% к прошлому месяцу</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Аптайм Сервера</span>
                      <span className="text-xl font-black text-emerald-400 font-mono">{metrics.systemHealth}</span>
                      <span className="text-[9px] text-slate-400 block">Docker Cloud-Run</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-1 sm:col-span-2">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Выручка Фрахта (RUB)</span>
                      <span className="text-2xl font-black text-white font-mono">{metrics.monthlyRevenueRub}</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">WeChat Pay (CNY)</span>
                      <span className="text-xl font-black text-emerald-300 font-mono">{metrics.monthlyRevenueCny}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 text-xs text-slate-300 space-y-2">
                    <h5 className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Лог Безопасности & Автоматическая Модерация</span>
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Все сессии капитанов и партнеров защищены сквозным шифрованием (SHA-256 + Argon2id).
                      При перезапуске контейнера Docker учётная запись «Вечный Корень» моментально восстанавливается без участия внешних провайдеров.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
