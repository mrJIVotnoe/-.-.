import React, { useState } from 'react';
import { 
  Building2, 
  BarChart3, 
  Target, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle, 
  TrendingUp, 
  Sparkles, 
  Award, 
  FileText, 
  CreditCard, 
  Send, 
  Eye, 
  MousePointerClick, 
  Users, 
  Zap, 
  HelpCircle, 
  ExternalLink,
  PlusCircle,
  Copy,
  PieChart,
  Megaphone,
  QrCode,
  Upload
} from 'lucide-react';
import { useTranslation } from '../lib/translations';

import { AdCampaign } from '../types';

interface PartnerBridgeProps {
  campaigns?: AdCampaign[];
  setCampaigns?: React.Dispatch<React.SetStateAction<AdCampaign[]>>;
  budgetBalance?: number;
  setBudgetBalance?: React.Dispatch<React.SetStateAction<number>>;
  onGoToFleetRental?: () => void;
}

export default function PartnerBridge({
  campaigns: externalCampaigns,
  setCampaigns: setExternalCampaigns,
  budgetBalance: externalBudget,
  setBudgetBalance: setExternalBudget,
  onGoToFleetRental
}: PartnerBridgeProps) {
  const { lang } = useTranslation();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'analytics' | 'compliance' | 'billing' | 'packages'>('campaigns');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Internal fallback state if props not passed
  const [internalBudget, setInternalBudget] = useState<number>(lang === 'ru' ? 42500 : lang === 'zh' || lang === 'zh-TW' ? 3800 : 550);
  const budgetBalance = externalBudget !== undefined ? externalBudget : internalBudget;
  const setBudgetBalance = setExternalBudget || setInternalBudget;

  const [depositInput, setDepositInput] = useState<string>('10000');

  // Ad ERIR generator state for Russian Mode
  const [eridToken, setEridToken] = useState<string>('erid: 2VtzquJIV2026Ad');
  const [contractNum, setContractNum] = useState<string>('П-2026/08-Д');
  const [innInput, setInnInput] = useState<string>('254012345678');

  // New campaign creator draft state
  const [newCampaignTitle, setNewCampaignTitle] = useState<string>('');
  const [newCampaignText, setNewCampaignText] = useState<string>('');
  const [newCampaignCode, setNewCampaignCode] = useState<string>('JIV2026');
  const [selectedFormat, setSelectedFormat] = useState<'search_banner' | 'weather_radar' | 'push_promo' | 'route_sponsor'>('search_banner');

  // Mock Active Campaigns internal fallback
  const [internalCampaigns, setInternalCampaigns] = useState<AdCampaign[]>([
    {
      id: 'CAM-101',
      name: lang === 'ru' ? 'Ресторан Zuma — Морские обеды' : lang === 'zh' || lang === 'zh-TW' ? 'Zuma 帝王蟹特色美餐饮赞助' : 'Zuma Seafood Restaurant Banner',
      format: 'search_banner',
      status: 'active',
      impressions: 14280,
      clicks: 890,
      ctr: '6.2%',
      spent: lang === 'ru' ? '12 400 ₽' : lang === 'zh' || lang === 'zh-TW' ? '1 100 ￥' : '$160',
      erid: 'erid: 2Vtzqu8901ZUMA',
      bannerText: lang === 'ru' ? '🦀 Ресторан Zuma: Скидка 10% на свежайших камчатских крабов и парных ежей для пассажиров JIV!' : '🦀 Zuma Seafood: 10% OFF King Crab for JIV Guests!',
      promoCode: 'ZUMA2026'
    },
    {
      id: 'CAM-102',
      name: lang === 'ru' ? 'Водник — Яхтенная экипировка' : lang === 'zh' || lang === 'zh-TW' ? 'Vodnik 航海用品与水上装备' : 'Vodnik Marine Gear Promo',
      format: 'weather_radar',
      status: 'active',
      impressions: 28900,
      clicks: 1420,
      ctr: '4.9%',
      spent: lang === 'ru' ? '18 000 ₽' : lang === 'zh' || lang === 'zh-TW' ? '1 600 ￥' : '$230',
      erid: 'erid: 2Vtzqu102VODNIK',
      bannerText: lang === 'ru' ? '⚓ Водник: Профессиональная ветрозащитная экипировка и спасательные жилеты с быстрой доставкой на пирс!' : '⚓ Vodnik: Professional Marine Gear',
      promoCode: 'VODNIK15'
    }
  ]);

  const campaigns = externalCampaigns || internalCampaigns;
  const setCampaigns = setExternalCampaigns || setInternalCampaigns;

  const handleDeposit = () => {
    const val = parseFloat(depositInput);
    if (!isNaN(val) && val > 0) {
      setBudgetBalance(prev => prev + val);
      triggerToast(
        lang === 'ru' 
          ? `Баланс успешно пополнен на ${val.toLocaleString()} ₽ через Национальную платёжную систему (НСПК / Мир) и СБП!` 
          : lang === 'zh' || lang === 'zh-TW' 
          ? `通过微信/支付宝成功充值 ${val} ￥ 广告预算！` 
          : `Successfully deposited $${val} via Stripe Corporate to Ad Balance!`
      );
    }
  };

  const handleGenerateErid = () => {
    const rand = Math.floor(100000 + Math.random() * 900000);
    const token = `erid: 2Vtzqu${rand}JIV`;
    setEridToken(token);
    triggerToast(
      lang === 'ru' 
        ? `Токен ЕРИР создан: ${token}. Данные автоматически переданы в ОРД-Яндекс (ФЗ-38).` 
        : lang === 'zh' || lang === 'zh-TW' 
        ? `合规标记已生成：${token}` 
        : `Ad Compliance token generated: ${token}`
    );
  };

  const handleCreateCampaign = () => {
    if (!newCampaignTitle.trim()) {
      triggerToast(lang === 'ru' ? 'Введите название партнёрской компании!' : 'Enter campaign title!');
      return;
    }

    const randId = Math.floor(100 + Math.random() * 900);
    const newCamp: AdCampaign = {
      id: `CAM-${randId}`,
      name: newCampaignTitle,
      format: selectedFormat,
      status: 'active',
      impressions: 15,
      clicks: 1,
      ctr: '6.7%',
      spent: lang === 'ru' ? '500 ₽' : lang === 'zh' || lang === 'zh-TW' ? '45 ￥' : '$6',
      erid: eridToken,
      bannerText: newCampaignText || (lang === 'ru' ? 'Специальное предложение от официального партнёра JIV Владивосток.' : 'Special offer from official JIV partner.'),
      promoCode: newCampaignCode || 'JIV2026',
      targetLink: 'https://vladivostok-sea.ru/partner'
    };

    setCampaigns(prev => [newCamp, ...prev]);
    setBudgetBalance(prev => Math.max(0, prev - 500));
    setNewCampaignTitle('');
    setNewCampaignText('');
    
    triggerToast(
      lang === 'ru' 
        ? '🚀 Кампания успешно запущена! Активный баннер теперь отображается на вкладке «Аренда флота».' 
        : '🚀 Campaign launched! Active banner is now visible on the Fleet Rental tab.'
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-xl p-4 sm:p-6 shadow-2xl space-y-6" id="partner-bridge-container">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3 rounded-xl bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Megaphone className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              {lang === 'ru' ? 'Кабинет Рекламодателя' : lang === 'zh' || lang === 'zh-TW' ? '广告商与合作伙伴中心' : 'Partner & Advertiser Hub'}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
              {lang === 'ru' ? '🇷🇺 Режим 1: ОРД ФЗ-38' : lang === 'zh' || lang === 'zh-TW' ? '🇨🇳 模式 3: 微信/支付宝广告' : '🌐 Mode 2: Global AdSense'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-cyan-400" />
            <span>
              {lang === 'ru' ? 'Мостик Партнёра & Монетизация JIV' : lang === 'zh' || lang === 'zh-TW' ? '合作伙伴核心: JIV 商业化后台' : 'Partner Bridge — Commercial Console'}
            </span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            {lang === 'ru'
              ? 'Управляйте рекламными бюджетами, регистрируйте креативы в ЕРИР (ФЗ-38), запускайте таргетированные банеры для туристов и спонсируйте морские маршруты.'
              : lang === 'zh' || lang === 'zh-TW'
              ? '精准投放符拉迪沃斯托克游艇乘客、微信小程序弹窗及支付宝水域赞助。支持实时 ROI 分析。'
              : 'Target ocean tourists, launch sponsored marine routes, manage ad spend, and review real-time ROI metrics.'}
          </p>
        </div>

        {/* Quick Budget Card */}
        <div className="bg-slate-900/90 border border-white/10 p-3.5 rounded-xl flex items-center gap-4 shrink-0 shadow-inner">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase block">
              {lang === 'ru' ? 'Рекламный баланс' : lang === 'zh' || lang === 'zh-TW' ? '广告可用余额' : 'Ad Balance'}
            </span>
            <span className="text-lg font-bold text-white font-mono">
              {lang === 'ru' ? `${budgetBalance.toLocaleString()} ₽` : lang === 'zh' || lang === 'zh-TW' ? `${budgetBalance.toLocaleString()} ￥` : `$${budgetBalance}`}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('billing')}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition-all font-mono"
          >
            {lang === 'ru' ? 'Пополнить' : lang === 'zh' || lang === 'zh-TW' ? '充值' : 'Top Up'}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex rounded-xl bg-slate-950 p-1 border border-white/10 text-xs font-mono overflow-x-auto scrollbar-none" id="partner-tabs">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'campaigns' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>{lang === 'ru' ? 'Кампании' : lang === 'zh' || lang === 'zh-TW' ? '广告项目' : 'Campaigns'}</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'analytics' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{lang === 'ru' ? 'Аналитика ROI' : lang === 'zh' || lang === 'zh-TW' ? '数据与ROI' : 'Analytics & ROI'}</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'compliance' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{lang === 'ru' ? 'Маркировка (ОРД)' : lang === 'zh' || lang === 'zh-TW' ? '合规标记' : 'Ad Compliance'}</span>
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'packages' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{lang === 'ru' ? 'Пакеты Спонсоров' : lang === 'zh' || lang === 'zh-TW' ? '赞助套餐' : 'Packages'}</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'billing' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-md' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{lang === 'ru' ? 'Финансы' : lang === 'zh' || lang === 'zh-TW' ? '财务与发票' : 'Billing'}</span>
        </button>
      </div>

      {/* TAB 1: CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="space-y-5 animate-fade-in">
          {/* Quick Creator Box */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-cyan-400" />
                <span>{lang === 'ru' ? 'Быстрый запуск рекламного формата' : lang === 'zh' || lang === 'zh-TW' ? '快速创建新广告' : 'Launch New Campaign'}</span>
              </span>
              {onGoToFleetRental && (
                <button
                  onClick={onGoToFleetRental}
                  className="text-xs text-cyan-400 hover:underline font-mono flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{lang === 'ru' ? 'Смотреть на "Аренда флота"' : 'View on Fleet Rental'}</span>
                </button>
              )}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newCampaignTitle}
                  onChange={(e) => setNewCampaignTitle(e.target.value)}
                  placeholder={lang === 'ru' ? 'Бренд / Компания (напр. Ресторан Zuma)' : 'Brand / Company Name'}
                  className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
                <select
                  value={selectedFormat}
                  onChange={(e: any) => setSelectedFormat(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="search_banner">{lang === 'ru' ? 'VIP-Баннер в Поиске Катеров (Аренда Флота)' : 'Search VIP Banner (Fleet Rental)'}</option>
                  <option value="weather_radar">{lang === 'ru' ? 'Спонсор Мега-Радара Погоды' : 'Weather Radar Sponsor'}</option>
                  <option value="push_promo">{lang === 'ru' ? 'PUSH-уведомление туристам' : 'Push Notification'}</option>
                  <option value="route_sponsor">{lang === 'ru' ? 'Спонсорство Маршрута' : 'Marine Route Sponsor'}</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newCampaignText}
                  onChange={(e) => setNewCampaignText(e.target.value)}
                  placeholder={lang === 'ru' ? 'Текст спецпредложения (напр. Скидка 15% на морепродукты!)' : 'Promo details (e.g. 15% OFF Seafood)'}
                  className="sm:col-span-2 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
                <input
                  type="text"
                  value={newCampaignCode}
                  onChange={(e) => setNewCampaignCode(e.target.value)}
                  placeholder={lang === 'ru' ? 'Промокод (напр. JIV2026)' : 'Promo Code'}
                  className="bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-cyan-500 font-bold"
                />
              </div>

              {/* Native Banner Photo Upload */}
              <div className="flex items-center gap-2 pt-1">
                <label className="flex-1 cursor-pointer py-2 px-3 rounded-lg bg-slate-950 border border-dashed border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[10px] font-mono flex items-center justify-center gap-1.5 transition-all">
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === 'ru' ? '📁 Прикрепить рекламный баннер / логотип с устройства' : '📁 Upload ad banner image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        triggerToast(lang === 'ru' ? '📁 Графический баннер успешно загружен и прикреплен к кампании!' : '📁 Ad banner uploaded!');
                      }
                    }}
                  />
                </label>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-slate-400 font-mono">
                  {lang === 'ru' ? 'Стоимость запуска: 500 ₽ • Маркировка ОРД ФЗ-38 включена' : 'Cost: $6 / 500 RUB • Compliance included'}
                </span>
                <button
                  onClick={handleCreateCampaign}
                  className="py-2.5 px-6 rounded-lg bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-2 shadow-lg font-mono"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{lang === 'ru' ? 'Запустить кампанию' : 'Launch Campaign'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* List of active campaigns */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
              {lang === 'ru' ? 'Активные промо-кампании' : 'Active Promos'}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {campaigns.map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{c.name}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold">
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3 flex-wrap">
                      <span>Формат: <strong className="text-slate-200">{c.format}</strong></span>
                      <span className="text-cyan-400">{c.erid}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono bg-slate-950/80 p-2.5 rounded-lg border border-white/5 shrink-0">
                    <div>
                      <span className="text-[9px] text-slate-500 block">Показы</span>
                      <span className="font-bold text-white">{c.impressions.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Клики</span>
                      <span className="font-bold text-cyan-400">{c.clicks}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">CTR</span>
                      <span className="font-bold text-emerald-400">{c.ctr}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block">Расход</span>
                      <span className="font-bold text-amber-400">{c.spent}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Всего показов</span>
              <span className="text-xl font-bold text-white font-mono">43,180</span>
              <span className="text-[9px] text-emerald-400 font-mono block">+24% за неделю</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Переходы (CTR)</span>
              <span className="text-xl font-bold text-cyan-400 font-mono">2,310</span>
              <span className="text-[9px] text-emerald-400 font-mono block">Средний CTR: 5.35%</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Лиды и Брони</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">184</span>
              <span className="text-[9px] text-emerald-400 font-mono block">Конверсия: 7.9%</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Окупаемость (ROI)</span>
              <span className="text-xl font-bold text-amber-400 font-mono">410%</span>
              <span className="text-[9px] text-amber-400 font-mono block">Высокая выгода</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Распределение целевой аудитории туристо-потока</span>
              <span className="text-xs font-mono text-cyan-400">JIV Analytics 2026</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950 border border-white/5 space-y-1">
                <span className="text-slate-400 block">🇷🇺 Владивосток & Приморье</span>
                <span className="text-base font-bold text-white">52%</span>
                <span className="text-[10px] text-slate-500 block">Местные жители и туристы из РФ</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-white/5 space-y-1">
                <span className="text-slate-400 block">🇨🇳 Китай и Восточная Азия</span>
                <span className="text-base font-bold text-emerald-400">34%</span>
                <span className="text-[10px] text-slate-500 block">Групповые и VIP туры из КНР</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-white/5 space-y-1">
                <span className="text-slate-400 block">🌐 Международный сектор</span>
                <span className="text-base font-bold text-cyan-400">14%</span>
                <span className="text-[10px] text-slate-500 block">Индивидуальные яхтенные гиды</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLIANCE */}
      {activeTab === 'compliance' && (
        <div className="space-y-5 animate-fade-in">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {lang === 'ru' ? 'Модуль маркировки интернет-рекламы (ФЗ-38 ОРД / ЕРИР)' : 'Internet Ad Compliance Module'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                100% Legal RU
              </span>
            </div>

            <p className="text-xs text-slate-300">
              {lang === 'ru'
                ? 'Все баннеры и рекламные интеграции в приложении JIV автоматически передаются в ОРД (Яндекс / VK) и регистрируются в Едином реестре интернет-рекламы (ЕРИР) с присвоением токена erid.'
                : 'All sponsored banners automatically comply with local advertising regulations and generate unique erid tokens.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-slate-400 block">ИНН Рекламодателя:</label>
                <input
                  type="text"
                  value={innInput}
                  onChange={(e) => setInnInput(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block">Номер Договора:</label>
                <input
                  type="text"
                  value={contractNum}
                  onChange={(e) => setContractNum(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-white/5 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">Сгенерированный токен ЕРИР:</span>
                <span className="text-xs font-bold text-cyan-400 font-mono">{eridToken}</span>
              </div>
              <button
                onClick={handleGenerateErid}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/40 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Обновить токен</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PACKAGES */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          {/* Package 1 */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4 flex flex-col justify-between hover:border-cyan-500/40 transition-all">
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">
                START
              </span>
              <h3 className="text-base font-bold text-white">Бронзовый Партнер</h3>
              <p className="text-xs text-slate-400">Идеально для локальных ресторанов морепродуктов и сувениров.</p>
              <div className="text-2xl font-bold text-white font-mono">
                {lang === 'ru' ? '5 000 ₽ / мес' : lang === 'zh' || lang === 'zh-TW' ? '450 ￥ / 月' : '$60 / mo'}
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Баннер в карточках катеров</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Скидочный промокод для гостей</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => triggerToast('Выбран пакет Бронзовый Партнёр')}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all font-mono"
            >
              Подключить
            </button>
          </div>

          {/* Package 2 */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-900/80 border border-cyan-500/50 space-y-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-[9px] font-bold px-3 py-1 rounded-bl-xl font-mono uppercase">
              POPULAR
            </div>
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30">
                SILVER PRO
              </span>
              <h3 className="text-base font-bold text-white">Серебряный Спонсор</h3>
              <p className="text-xs text-slate-400">Спонсорство метео-радара и PUSH-рассылки на смарт-часы туристам.</p>
              <div className="text-2xl font-bold text-cyan-400 font-mono">
                {lang === 'ru' ? '15 000 ₽ / мес' : lang === 'zh' || lang === 'zh-TW' ? '1 350 ￥ / 月' : '$180 / mo'}
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Брендинг виджета Яндекс.Погоды</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Топ-3 позиция в поиске катеров</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Авто-маркировка ОРД ФЗ-38 включена</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => triggerToast('Выбран пакет Серебряный Спонсор')}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all font-mono shadow-md"
            >
              Подключить PRO
            </button>
          </div>

          {/* Package 3 */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-amber-500/30 space-y-4 flex flex-col justify-between hover:border-amber-500/60 transition-all">
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold border border-amber-500/20">
                ADMIRAL VIP
              </span>
              <h3 className="text-base font-bold text-white">Золотой Адмирал</h3>
              <p className="text-xs text-slate-400">Эксклюзивный бренд-партнер всего сезона во Владивостоке.</p>
              <div className="text-2xl font-bold text-amber-400 font-mono">
                {lang === 'ru' ? '45 000 ₽ / мес' : lang === 'zh' || lang === 'zh-TW' ? '4 000 ￥ / 月' : '$550 / mo'}
              </div>
              <ul className="text-xs text-slate-300 space-y-2 font-mono pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Спонсорство интерактивных морских карт</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Интеграция в WeChat / Alipay (Китайский рынок)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Персональный менеджера ОРД и бухгалтерский учет</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => triggerToast('Заявка на VIP Адмирал отправлена')}
              className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition-all font-mono border border-amber-500/40"
            >
              Запросить КП
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: BILLING */}
      {activeTab === 'billing' && (
        <div className="p-5 rounded-xl bg-slate-900/80 border border-white/10 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'ru' ? 'Пополнение рекламного баланса и счета' : 'Payment & Ad Budget Top-Up'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="space-y-2">
              <label className="text-slate-400 block">Сумма пополнения:</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={depositInput}
                  onChange={(e) => setDepositInput(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white font-mono w-full"
                />
                <button
                  onClick={handleDeposit}
                  className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shrink-0"
                >
                  {lang === 'ru' ? 'Оплатить' : 'Pay'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 block">Способ оплаты по режимам:</label>
              <div className="p-3 rounded-lg bg-slate-950 border border-white/5 space-y-1 text-[11px]">
                {lang === 'ru' ? (
                  <div>
                    <span className="text-cyan-400 font-bold">🇷🇺 РФ:</span> Национальная платёжная система (НСПК / «Мир») и СБП (Система Быстрых Платежей), Безналичный расчёт для юрлиц.
                  </div>
                ) : lang === 'zh' || lang === 'zh-TW' ? (
                  <div>
                    <span className="text-emerald-400 font-bold">🇨🇳 中国:</span> 微信支付 (WeChat Pay), 支付宝 (Alipay), 银联企业对公转账.
                  </div>
                ) : (
                  <div>
                    <span className="text-cyan-400 font-bold">🌐 INTL:</span> Stripe Corporate, PayPal Business, SWIFT Transfer.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
