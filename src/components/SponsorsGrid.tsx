import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  Utensils, 
  Anchor, 
  ShoppingBag, 
  Compass, 
  ChevronRight, 
  Percent, 
  MapPin, 
  ExternalLink, 
  Gift, 
  Waves,
  Heart,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useTranslation } from '../lib/translations';

interface SponsorsGridProps {
  onApplyPromo: (code: string) => void;
}

interface Sponsor {
  id: string;
  name: string;
  category: string;
  badge: string;
  badgeColor: string;
  description: string;
  highlightText: string;
  icon: React.ReactNode;
  promoCode?: string;
  actionText: string;
  link?: string;
  phone?: string;
}

export default function SponsorsGrid({ onApplyPromo }: SponsorsGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { lang, t } = useTranslation();

  const sponsors: Sponsor[] = [
    {
      id: 'zuma',
      name: t('zuma_name', 'sponsors'),
      category: t('zuma_cat', 'sponsors'),
      badge: lang === 'ru' ? 'Скидка 15%' : lang === 'en' ? 'Discount 15%' : '15% 折扣',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      description: t('zuma_desc', 'sponsors'),
      highlightText: t('zuma_promo', 'sponsors'),
      icon: <Utensils className="w-5 h-5 text-rose-400" />,
      promoCode: 'ZUMA15',
      actionText: t('zuma_action', 'sponsors'),
      link: 'https://zumavl.ru/'
    },
    {
      id: 'seven-feet',
      name: t('seven_feet_name', 'sponsors'),
      category: t('seven_feet_cat', 'sponsors'),
      badge: lang === 'ru' ? 'Премиум гость' : lang === 'en' ? 'Premium Guest' : '高级贵宾',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description: t('seven_feet_desc', 'sponsors'),
      highlightText: t('seven_feet_promo', 'sponsors'),
      icon: <Anchor className="w-5 h-5 text-cyan-400" />,
      actionText: t('seven_feet_action', 'sponsors'),
      phone: '+7 (423) 246-13-33'
    },
    {
      id: 'vodnik',
      name: t('vodnik_name', 'sponsors'),
      category: t('vodnik_cat', 'sponsors'),
      badge: lang === 'ru' ? 'Скидка 10%' : lang === 'en' ? 'Discount 10%' : '10% 折扣',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: t('vodnik_desc', 'sponsors'),
      highlightText: t('vodnik_promo', 'sponsors'),
      icon: <ShoppingBag className="w-5 h-5 text-amber-400" />,
      promoCode: 'VODNIK10',
      actionText: t('vodnik_action', 'sponsors'),
      link: 'https://vodnik.ru/'
    },
    {
      id: 'lovi-kupon',
      name: t('lovi_name', 'sponsors'),
      category: t('lovi_cat', 'sponsors'),
      badge: lang === 'ru' ? 'Скидка 50%' : lang === 'en' ? 'Discount 50%' : '50% 折扣',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: t('lovi_desc', 'sponsors'),
      highlightText: t('lovi_promo', 'sponsors'),
      icon: <Gift className="w-5 h-5 text-emerald-400" />,
      promoCode: 'LOVI50',
      actionText: t('lovi_action', 'sponsors'),
      link: 'https://lovikupon.ru/'
    }
  ];

  const handleAction = (sponsor: Sponsor) => {
    if (sponsor.promoCode) {
      onApplyPromo(sponsor.promoCode);
      setCopiedId(sponsor.id);
      setTimeout(() => setCopiedId(null), 3000);
    } else if (sponsor.phone) {
      window.open(`tel:${sponsor.phone}`);
    } else if (sponsor.link) {
      window.open(sponsor.link, '_blank');
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 space-y-5" id="sponsors-grid-container">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 flex-wrap gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              {t('club_offers', 'sponsors')}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              {lang === 'ru' ? 'Партнеры JIV' : lang === 'en' ? 'JIV Partners' : 'JIV 合作商'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            {t('title', 'sponsors')}
          </h3>
          <p className="text-xs text-slate-400 max-w-xl">
            {t('desc', 'sponsors')}
          </p>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="sponsors-bento-grid">
        {sponsors.map((sponsor) => (
          <div 
            key={sponsor.id}
            id={`sponsor-card-${sponsor.id}`}
            className="group relative rounded-xl border border-white/5 bg-slate-900/30 p-4 hover:bg-slate-900/60 hover:border-white/10 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-md overflow-hidden"
          >
            {/* Ambient hover light effect */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500 pointer-events-none" />

            {/* Top header within card */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="p-2 rounded-lg bg-slate-950 border border-white/5 flex-shrink-0 group-hover:scale-110 transition-transform">
                  {sponsor.icon}
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${sponsor.badgeColor} font-bold`}>
                  {sponsor.badge}
                </span>
              </div>
              
              <div>
                <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">{sponsor.category}</span>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors mt-0.5">{sponsor.name}</h4>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">{sponsor.description}</p>
            </div>

            {/* Bottom highlight and action */}
            <div className="space-y-3 pt-3 border-t border-white/5 mt-auto">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="truncate">{sponsor.highlightText}</span>
              </div>

              <button
                onClick={() => handleAction(sponsor)}
                id={`sponsor-action-btn-${sponsor.id}`}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  sponsor.promoCode
                    ? copiedId === sponsor.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-white/5'
                    : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20'
                }`}
              >
                {sponsor.promoCode ? (
                  <>
                    <Percent className="w-3.5 h-3.5" />
                    <span>{copiedId === sponsor.id ? (lang === 'ru' ? 'Промокод скопирован!' : lang === 'en' ? 'Promo Code Copied!' : '优惠码已复制！') : sponsor.actionText}</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{sponsor.actionText}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Environment Pledge Footnote */}
      <div className="p-3 bg-slate-900/20 border border-white/5 rounded-xl flex items-center gap-3 text-xs text-slate-500 leading-relaxed">
        <Shield className="w-5 h-5 text-cyan-400/70 flex-shrink-0" />
        <p className="font-sans">
          {t('verification_text', 'sponsors')}
        </p>
      </div>

    </div>
  );
}
