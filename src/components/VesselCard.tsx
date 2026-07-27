/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Vessel } from '../types';
import { Users, Gauge, Anchor, ShieldCheck, Music, HelpCircle, Star, Sparkles, Radio } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../lib/translations';
import { getLocalizedVessel, getLocalizedHomeport } from '../lib/vesselLocalization';

interface VesselCardProps {
  key?: string;
  vessel: Vessel;
  onSelect: (vessel: Vessel) => void;
  onBook: (vessel: Vessel) => void;
  isMapSelected: boolean;
}

export default function VesselCard({
  vessel: rawVessel,
  onSelect,
  onBook,
  isMapSelected
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
      default: 
        return lang === 'ru' ? 'Морское судно' : lang === 'en' ? 'Marine Vessel' : '海上船舶';
    }
  };

  const isGuestChoice = vessel.rating >= 4.9;

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
        
        {/* Rating overview */}
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
          
          {vessel.responseTime && (
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
              {vessel.priceHour && (
                <span className="text-sm font-bold text-white font-mono">
                  {vessel.priceHour.toLocaleString()} ₽ <span className="text-[10px] text-slate-400 font-normal">{lang === 'ru' ? '/ час' : lang === 'en' ? '/ hour' : '/ 小时'}</span>
                </span>
              )}
              {vessel.priceDay && (
                <span className="text-xs text-slate-400 font-mono">
                  {lang === 'ru' ? `или ${vessel.priceDay.toLocaleString()} ₽ / сут.` : lang === 'en' ? `or ${vessel.priceDay.toLocaleString()} RUB / day` : `或 ${vessel.priceDay.toLocaleString()} 卢布 / 天`}
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
