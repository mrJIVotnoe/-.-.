/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Vessel } from '../types';
import { Users, Gauge, Anchor, ShieldCheck, Music, HelpCircle, Star, Sparkles, Radio, ExternalLink, Globe, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../lib/translations';
import { getLocalizedVessel, getLocalizedHomeport } from '../lib/vesselLocalization';
import { formatCurrencyPrice, convertFromRUB } from '../lib/currency';

interface VesselCardProps {
  key?: string;
  vessel: Vessel;
  onSelect: (vessel: Vessel) => void;
  onBook: (vessel: Vessel) => void;
  isMapSelected: boolean;
  selectedCurrency?: 'RUB' | 'USD' | 'CNY';
}

export default function VesselCard({
  vessel: rawVessel,
  onSelect,
  onBook,
  isMapSelected,
  selectedCurrency = 'RUB'
}: VesselCardProps) {
  const { lang, t } = useTranslation();
  const vessel = getLocalizedVessel(rawVessel, lang);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'yacht': 
        return lang === 'ru' ? 'Яхта класса VIP' : lang === 'en' ? 'VIP Class Yacht' : 'VIP 豪华游艇';
      case 'boat': 
        return lang === 'ru' ? 'Катер / Прогулочный' : lang === 'en' ? 'Pleasure Boat' : '观光快艇';
      case 'jetski': 
        return lang === 'ru' ? 'Гидроцикл / Спорт' : lang === 'en' ? 'Jet Ski / Sport' : '运动摩托艇';
      case 'taxi': 
        return lang === 'ru' ? 'Морское такси 24/7' : lang === 'en' ? 'Marine Taxi 24/7' : '水上出租车 24/7';
      case 'catamaran':
        return lang === 'ru' ? 'Парусный катамаран' : lang === 'en' ? 'Sailing Catamaran' : '双体帆船';
      default: 
        return lang === 'ru' ? 'Морское судно' : lang === 'en' ? 'Marine Vessel' : '海上船舶';
    }
  };

  const getSourceBadgeStyle = (sourceType: string) => {
    switch (sourceType) {
      case 'farpost':
        return { bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', name: 'FarPost.ru' };
      case 'yandex':
        return { bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40', name: 'Яндекс' };
      case 'airbnb':
        return { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', name: 'Airbnb Lux' };
      default:
        return { bg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', name: 'JIV Direct' };
    }
  };

  const isGuestChoice = vessel.rating >= 4.9;
  const sourceStyle = getSourceBadgeStyle(vessel.source_type);

  // Price conversion
  const displayPriceHour = vessel.priceHour
    ? formatCurrencyPrice(convertFromRUB(vessel.priceHour, selectedCurrency), selectedCurrency, lang)
    : null;
  const displayPriceDay = vessel.priceDay
    ? formatCurrencyPrice(convertFromRUB(vessel.priceDay, selectedCurrency), selectedCurrency, lang)
    : null;

  return (
    <motion.div 
      id={`vessel-card-${vessel.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`group relative rounded-2xl border overflow-hidden flex flex-col justify-between ${
        isMapSelected 
          ? 'border-cyan-400 bg-slate-950/90 shadow-[0_0_25px_rgba(34,211,238,0.3)] z-10' 
          : 'border-white/10 bg-slate-900/40 hover:bg-slate-900/60 hover:border-cyan-500/35 hover:shadow-[0_12px_36px_rgba(34,211,238,0.08)]'
      }`}
    >
      {/* Visual background glow to support the "Antigravity" floating feel */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Skewed Yacht-Shape Clip-path Image Container */}
      <div 
        onClick={() => onSelect(vessel)}
        className="relative h-56 cursor-pointer overflow-hidden select-none"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 92%, 0% 100%)', // Dynamic angled hull bottom contour
        }}
        id={`vessel-card-hull-${vessel.id}`}
      >
        <img 
          src={vessel.images[0]} 
          alt={vessel.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Shadow overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
        
        {/* Rating and category badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
          <div className="flex gap-1.5 flex-wrap">
            <span className="px-2.5 py-1 text-[9px] font-mono font-bold tracking-wider uppercase rounded-md bg-slate-950/85 backdrop-blur-md text-cyan-400 border border-white/10">
              {getCategoryLabel(vessel.category)}
            </span>
            
            {/* Partner Data Provider Source Badge */}
            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-md border backdrop-blur-md flex items-center gap-1 ${sourceStyle.bg}`}>
              <Globe className="w-2.5 h-2.5" />
              <span>{sourceStyle.name}</span>
            </span>

            {vessel.hasSharkRepeller && (
              <span className="px-2.5 py-1 text-[9px] font-mono font-bold tracking-wider uppercase rounded-md bg-amber-500 text-slate-950 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                <span>{lang === 'ru' ? 'Защита от акул' : lang === 'en' ? 'Shark Repeller' : '防鲨装置'}</span>
              </span>
            )}
          </div>

          {/* Real-time Status indicator */}
          {(vessel.status || vessel.isLive) && (
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded font-sans text-[9px] font-black tracking-wider uppercase w-fit shadow-md ${
              (vessel.status || 'free') === 'free' 
                ? 'bg-emerald-500 text-slate-950' 
                : (vessel.status || 'free') === 'trip'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-rose-500 text-white'
            }`}>
              <span className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  (vessel.status || 'free') === 'maintenance' ? 'bg-white' : 'bg-slate-950'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  (vessel.status || 'free') === 'maintenance' ? 'bg-white' : 'bg-slate-950'
                }`}></span>
              </span>
              <span>
                {vessel.status === 'free' 
                  ? (lang === 'ru' ? 'Свободен' : lang === 'en' ? 'Free' : '空闲中') 
                  : vessel.status === 'trip' 
                  ? (lang === 'ru' ? 'На рейсе' : lang === 'en' ? 'On Trip' : '航行中') 
                  : vessel.status === 'maintenance' 
                  ? (lang === 'ru' ? 'Техпомощь' : lang === 'en' ? 'Maintenance' : '维护中') 
                  : (lang === 'ru' ? 'В море • На связи' : lang === 'en' ? 'At Sea • Connected' : '海中 • 保持联系')}
              </span>
            </div>
          )}
        </div>

        {/* Guest Choice badge in upper right */}
        {isGuestChoice && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-2.5 py-1 rounded-md text-[9px] font-black tracking-wider uppercase shadow-md flex items-center gap-1 border border-amber-300/30">
              <Sparkles className="w-3 h-3 text-slate-950 fill-slate-950" />
              <span>{lang === 'ru' ? 'Выбор Гостей' : lang === 'en' ? 'Guest Choice' : '住客推荐'}</span>
            </div>
          </div>
        )}

        {/* Homeport info */}
        <div className="absolute bottom-6 left-4 right-4">
          <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-300 uppercase">
            <Anchor className="w-3.5 h-3.5" />
            <span>{vessel.homeport}</span>
          </div>
          <h4 className="text-base font-bold text-white tracking-tight mt-0.5 line-clamp-1">{vessel.name}</h4>
        </div>
      </div>

      {/* Core Vessel Specifications */}
      <div className="p-5 space-y-4 font-sans">
        
        {/* Rating & Partner Verification overview */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-amber-400 stroke-none" />
              <span>{vessel.rating.toFixed(2)}</span>
            </div>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              {vessel.reviewsCount} {lang === 'ru' ? 'отзывов' : lang === 'en' ? 'reviews' : '条评价'}
            </span>
          </div>

          {vessel.partnerVerificationId && (
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>API ID: {vessel.partnerVerificationId}</span>
            </span>
          )}
          
          {vessel.responseTime && !vessel.partnerVerificationId && (
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
              {lang === 'ru' ? `Ответ за ${vessel.responseTime}с` : lang === 'en' ? `Responds in ${vessel.responseTime}s` : `可在 ${vessel.responseTime}秒内回复`}
            </span>
          )}
        </div>

        {/* Short description */}
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
          {vessel.description}
        </p>

        {/* Core parameters metrics grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-3 rounded-xl border border-white/5 font-mono text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[9px] uppercase text-slate-500 block">{lang === 'ru' ? 'Вместимость' : lang === 'en' ? 'Capacity' : '载客量'}</span>
              <span className="font-semibold text-white">{vessel.capacity} {lang === 'ru' ? 'чел.' : lang === 'en' ? 'guests' : '人'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-[9px] uppercase text-slate-500 block">{lang === 'ru' ? 'Скорость' : lang === 'en' ? 'Speed' : '航速'}</span>
              <span className="font-semibold text-white">{vessel.speed} {lang === 'ru' ? 'км/ч' : lang === 'en' ? 'km/h' : '公里/小时'}</span>
            </div>
          </div>
        </div>

        {/* Partner Showcase Banner & Deep Link */}
        {vessel.source_type !== 'internal' && (
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-mono">
                  {lang === 'ru' ? 'Партнерская витрина:' : 'Partner Listing:'}
                </span>
                <span className="text-[11px] font-bold text-white">{vessel.source_name}</span>
              </div>
            </div>
            <a
              href={vessel.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors"
              title={lang === 'ru' ? 'Открыть первоисточник на партнерском сайте' : 'Open original listing'}
            >
              <span>{lang === 'ru' ? 'Источник' : 'Original'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Customized local features highlight */}
        <div className="flex flex-wrap gap-1.5">
          {vessel.features.slice(0, 3).map((feat) => (
            <span 
              key={feat} 
              className={`text-[9px] px-2 py-0.5 rounded-md font-mono border ${
                feat.includes('акул') || feat.includes('Shark') || feat.includes('防鲨')
                  ? 'bg-amber-500/10 border-amber-500/25 text-amber-300' 
                  : feat.includes('Музыка') || feat.includes('Акустика') || feat.includes('Sound') || feat.includes('音响')
                  ? 'bg-rose-500/10 border-rose-500/25 text-rose-300'
                  : 'bg-slate-900 border-white/5 text-slate-400'
              }`}
            >
              {feat}
            </span>
          ))}
          {vessel.features.length > 3 && (
            <span className="text-[9px] bg-slate-900 border border-white/5 text-slate-500 px-2 py-0.5 rounded-md font-mono">
              +{vessel.features.length - 3} {lang === 'ru' ? 'еще' : lang === 'en' ? 'more' : '更多'}
            </span>
          )}
        </div>

        {/* Pricing and Action trigger */}
        <div className="flex justify-between items-center border-t border-white/5 pt-4">
          <div>
            <span className="text-[9px] text-slate-500 font-mono block">{lang === 'ru' ? 'СТОИМОСТЬ' : lang === 'en' ? 'RENTAL FEE' : '租金费用'}</span>
            <div className="flex flex-col">
              {displayPriceHour && (
                <span className="text-sm font-bold text-white font-mono">
                  {displayPriceHour} <span className="text-[10px] text-slate-400 font-normal">{lang === 'ru' ? '/ час' : lang === 'en' ? '/ hour' : '/ 小时'}</span>
                </span>
              )}
              {displayPriceDay && (
                <span className="text-xs text-slate-400 font-mono">
                  {lang === 'ru' ? `или ${displayPriceDay} / сут.` : lang === 'en' ? `or ${displayPriceDay} / day` : `或 ${displayPriceDay} / 天`}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSelect(vessel)}
              id={`btn-focus-map-${vessel.id}`}
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/5 text-slate-300 text-xs transition-colors"
              title={lang === 'ru' ? 'Показать причал на радаре' : lang === 'en' ? 'Show pier on radar' : '在雷达上显示码头'}
            >
              {lang === 'ru' ? 'Радар' : lang === 'en' ? 'Radar' : '雷达'}
            </button>
            <button
              onClick={() => onBook(vessel)}
              id={`btn-book-${vessel.id}`}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md ${
                vessel.category === 'taxi' || vessel.category === 'jetski'
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:opacity-90 shadow-cyan-500/10'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 shadow-cyan-500/5'
              }`}
            >
              {vessel.category === 'taxi' || vessel.category === 'jetski' 
                ? (lang === 'ru' ? 'Подать к причалу' : lang === 'en' ? 'Call to Pier' : '呼叫到码头') 
                : (lang === 'ru' ? 'Аренда' : lang === 'en' ? 'Rent' : '租用')}
            </button>
          </div>
        </div>

      </div>

    </motion.div>
  );
}

