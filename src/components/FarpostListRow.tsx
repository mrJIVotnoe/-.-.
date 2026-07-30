/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Vessel } from '../types';
import { 
  Anchor, 
  Users, 
  Gauge, 
  ShieldCheck, 
  Star, 
  Phone, 
  MessageCircle, 
  CheckCircle, 
  Calendar, 
  Eye, 
  Tag, 
  Compass, 
  Info,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../lib/translations';
import { getLocalizedVessel, transliterateCyrillicToLatin } from '../lib/vesselLocalization';

interface FarpostListRowProps {
  key?: string;
  vessel: Vessel;
  onSelect: (vessel: Vessel) => void;
  onBook: (vessel: Vessel) => void;
  isMapSelected: boolean;
}

export default function FarpostListRow({
  vessel: rawVessel,
  onSelect,
  onBook,
  isMapSelected
}: FarpostListRowProps) {
  const { lang, t } = useTranslation();
  const vessel = getLocalizedVessel(rawVessel, lang);
  const [showContacts, setShowContacts] = useState(false);

  // Derive static FarPost specs based on ID
  const getFarpostSpecs = (id: string) => {
    const isEn = lang === 'en';
    const isZh = lang === 'zh';

    const formatLength = (ru: string, en: string, zh: string) => isRu ? ru : isZh ? zh : en;
    const formatEngine = (ru: string, en: string, zh: string) => isRu ? ru : isZh ? zh : en;
    const formatMat = (ru: string, en: string, zh: string) => isRu ? ru : isZh ? zh : en;
    const formatFuel = (ru: string, en: string, zh: string) => isRu ? ru : isZh ? zh : en;
    const formatUpdated = (ru: string, en: string, zh: string) => isRu ? ru : isZh ? zh : en;

    const isRu = lang === 'ru';

    switch (id) {
      case 'julia-60':
        return {
          length: formatLength('60 футов (18.3 м)', '60 ft (18.3 m)', '60英尺 (18.3米)'),
          engine: formatEngine('Судовой дизель Caterpillar 2x800 л.с.', 'Caterpillar Marine Diesel 2x800 HP', 'Caterpillar 柴油机 2x800马力'),
          material: formatMat('Стеклопластик (FRP)', 'Fiberglass (FRP)', '玻璃钢 (FRP)'),
          fuel: formatFuel('Дизель', 'Diesel', '柴油'),
          views: 1420,
          regNum: 'RMRS #184291-VLAD',
          updated: formatUpdated('обновлено сегодня в 11:32', 'updated today at 11:32', '今天 11:32 更新')
        };
      case 'nika-yacht':
        return {
          length: formatLength('40 футов (12.2 м)', '40 ft (12.2 m)', '40英尺 (12.2米)'),
          engine: formatEngine('Volvo Penta 40 л.с.', 'Volvo Penta 40 HP', 'Volvo Penta 40马力'),
          material: formatMat('Дерево (Тик) / Пластик', 'Teak Wood / FRP', '柚木 / 玻璃钢'),
          fuel: formatFuel('Дизель', 'Diesel', '柴油'),
          views: 934,
          regNum: 'GIMS #R-48-22-VLAD',
          updated: formatUpdated('обновлено сегодня в 09:15', 'updated today at 09:15', '今天 09:15 更新')
        };
      case 'princess-yacht':
        return {
          length: formatLength('42 фута (12.8 м)', '42 ft (12.8 m)', '42英尺 (12.8米)'),
          engine: formatEngine('Volvo Penta 2x435 л.с.', 'Volvo Penta 2x435 HP', 'Volvo Penta 2x435马力'),
          material: formatMat('Стеклопластик (FRP)', 'Fiberglass (FRP)', '玻璃钢 (FRP)'),
          fuel: formatFuel('Дизель', 'Diesel', '柴油'),
          views: 651,
          regNum: 'GIMS #R-11-22-VLAD',
          updated: formatUpdated('обновлено сегодня в 10:44', 'updated today at 10:44', '今天 10:44 更新')
        };
      case 'tuna-hunter':
        return {
          length: formatLength('28 футов (8.5 м)', '28 ft (8.5 m)', '28英尺 (8.5米)'),
          engine: formatEngine('Yamaha Outboard 2x200 л.с.', 'Yamaha Outboard 2x200 HP', '雅马哈外挂 2x200马力'),
          material: formatMat('Стеклопластик (FRP)', 'Fiberglass (FRP)', '玻璃钢 (FRP)'),
          fuel: formatFuel('Бензин', 'Gasoline', '汽油'),
          views: 1109,
          regNum: 'GIMS #R-24-88-VLAD',
          updated: formatUpdated('обновлено сегодня в 12:02', 'updated today at 12:02', '今天 12:02 更新')
        };
      case 'novik-sea-ranger':
        return {
          length: formatLength('24 фута (7.3 м)', '24 ft (7.3 m)', '24英尺 (7.3米)'),
          engine: formatEngine('Yamaha 150 л.с.', 'Yamaha 150 HP', '雅马哈 150马力'),
          material: formatMat('Стеклопластик (FRP)', 'Fiberglass (FRP)', '玻璃钢 (FRP)'),
          fuel: formatFuel('Бензин', 'Gasoline', '汽油'),
          views: 782,
          regNum: 'GIMS #R-00-99-VLAD',
          updated: formatUpdated('обновлено вчера в 18:40', 'updated yesterday at 18:40', '昨天 18:40 更新')
        };
      case 'pospelovo-jetski-black':
        return {
          length: formatLength('11 футов (3.3 м)', '11 ft (3.3 m)', '11英尺 (3.3米)'),
          engine: formatEngine('Rotax 1630 ACE 300 л.с.', 'Rotax 1630 ACE 300 HP', 'Rotax 1630 ACE 300马力'),
          material: formatMat('Усиленный композит Polytec', 'Polytec Composite', 'Polytec 复合材料'),
          fuel: formatFuel('Бензин АИ-98', 'Gasoline 98', '98号汽油'),
          views: 2124,
          regNum: 'GIMS #R-01-23-VLAD',
          updated: formatUpdated('обновлено сегодня в 12:15', 'updated today at 12:15', '今天 12:15 更新')
        };
      default:
        return {
          length: formatLength('28 футов (8.5 м)', '28 ft (8.5 m)', '28英尺 (8.5米)'),
          engine: formatEngine('Судовой мотор 220 л.с.', 'Marine Engine 220 HP', '船用发动机 220马力'),
          material: formatMat('Стеклопластик (FRP)', 'Fiberglass (FRP)', '玻璃钢 (FRP)'),
          fuel: formatFuel('Бензин', 'Gasoline', '汽油'),
          views: 850,
          regNum: 'GIMS #R-55-12-VLAD',
          updated: formatUpdated('обновлено сегодня', 'updated today', '今天更新')
        };
    }
  };

  const specs = getFarpostSpecs(vessel.id);
  const hashId = `FP-${vessel.id.slice(0, 4).toUpperCase()}-${Math.floor(specs.views * 1.5 + 10240)}`;
  const isGuestChoice = vessel.rating >= 4.9;

  return (
    <motion.div
      id={`farpost-row-${vessel.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-xl border p-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300 flex flex-col md:flex-row gap-5 ${
        isMapSelected 
          ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
          : 'border-white/5 hover:border-cyan-500/20 hover:bg-slate-900/40'
      }`}
    >
      
      {/* 1. Left image box */}
      <div 
        onClick={() => onSelect(vessel)}
        className="w-full md:w-56 h-36 rounded-lg overflow-hidden cursor-pointer relative flex-shrink-0 select-none group"
      >
        <img 
          src={vessel.images[0]} 
          alt={vessel.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Absolute indicators */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase rounded bg-slate-950/90 text-cyan-400 border border-white/10">
            {lang === 'ru' ? 'В НАЛИЧИИ' : lang === 'en' ? 'IN STOCK' : '现船'}
          </span>
          {vessel.isLive && (
            <span className="px-1.5 py-0.5 text-[8px] font-mono font-bold tracking-widest uppercase rounded bg-emerald-500 text-slate-950 flex items-center gap-1">
              <span className="w-1 h-1 bg-slate-950 rounded-full animate-ping" />
              <span>{lang === 'ru' ? 'В МОРЕ' : lang === 'en' ? 'AT SEA' : '在海中'}</span>
            </span>
          )}
        </div>

        {isGuestChoice && (
          <div className="absolute top-2 right-2 z-10">
            <span className="px-1.5 py-0.5 text-[8px] font-bold tracking-widest uppercase rounded bg-amber-400 text-slate-950 flex items-center gap-1 border border-amber-300">
              <span>★ {lang === 'ru' ? 'ВЫБОР' : lang === 'en' ? 'TOP PICK' : '精选'}</span>
            </span>
          </div>
        )}
      </div>

      {/* 2. Middle details box */}
      <div className="flex-1 flex flex-col justify-between space-y-3">
        
        {/* Top FarPost Ad meta line */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2.5 text-[10px] font-mono text-slate-500">
            <span className="text-cyan-500 font-bold">#{hashId}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              {specs.views} {lang === 'ru' ? 'просмотров' : lang === 'en' ? 'views' : '浏览'}
            </span>
            <span>•</span>
            <span className="text-slate-400 capitalize">{specs.updated}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <span className="text-emerald-400">{lang === 'ru' ? 'г. Владивосток' : lang === 'en' ? 'Vladivostok' : '符拉迪沃斯托克'}</span>
            <span>•</span>
            <span>{vessel.homeport}</span>
          </div>
        </div>

        {/* Vessel Name & Quick spec highlight */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 
              onClick={() => onSelect(vessel)}
              className="text-base font-bold text-white hover:text-cyan-400 cursor-pointer tracking-tight"
            >
              {vessel.name}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-amber-400 font-mono flex items-center bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                ★ {vessel.rating.toFixed(2)}
              </span>
              {(vessel.isCaptainVerified || vessel.verifiedQualification) && (
                <span className="text-[9px] font-mono font-black uppercase bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm border border-amber-300">
                  <ShieldCheck className="w-3 h-3 text-slate-950 stroke-[2.5]" />
                  <span>{lang === 'ru' ? 'Подтверждённая квалификация' : lang === 'en' ? 'Verified Qualification' : '已核验资质'}</span>
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-300 line-clamp-1 mt-1 leading-relaxed">
            {vessel.description}
          </p>
        </div>

        {/* 4-Column FarPost Specifications Table Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono bg-slate-900/40 p-2.5 rounded-lg border border-white/5">
          <div className="space-y-0.5 border-r border-white/5 pr-2">
            <span className="text-slate-500 block uppercase text-[8px]">{lang === 'ru' ? 'Длина' : lang === 'en' ? 'Length' : '长度'}</span>
            <span className="text-white font-semibold block truncate">{specs.length}</span>
          </div>
          <div className="space-y-0.5 border-r border-white/5 px-2">
            <span className="text-slate-500 block uppercase text-[8px]">{lang === 'ru' ? 'Мотор / Мощность' : lang === 'en' ? 'Engine / Power' : '发动机 / 功率'}</span>
            <span className="text-white font-semibold block truncate" title={specs.engine}>{specs.engine}</span>
          </div>
          <div className="space-y-0.5 border-r border-white/5 px-2">
            <span className="text-slate-500 block uppercase text-[8px]">{lang === 'ru' ? 'Корпус / Топливо' : lang === 'en' ? 'Hull / Fuel' : '船体 / 燃料'}</span>
            <span className="text-white font-semibold block truncate">{specs.material} • {specs.fuel}</span>
          </div>
          <div className="space-y-0.5 pl-2">
            <span className="text-slate-500 block uppercase text-[8px]">{lang === 'ru' ? 'Регистрация' : lang === 'en' ? 'Registration' : '登记编号'}</span>
            <span className="text-cyan-400 font-semibold block truncate">{specs.regNum}</span>
          </div>
        </div>

        {/* Bottom features line */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {vessel.features.map(feat => (
              <span 
                key={feat} 
                className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-white/5"
              >
                {feat}
              </span>
            ))}
          </div>
          
          <div className="text-[10px] text-slate-500 font-mono">
            {vessel.reviewsCount} {lang === 'ru' ? 'отзывов' : lang === 'en' ? 'reviews' : '条评价'} • {lang === 'ru' ? `Ответ ${vessel.responseTime}с` : lang === 'en' ? `Responds in ${vessel.responseTime}s` : `${vessel.responseTime}秒内回复`}
          </div>
        </div>

      </div>

      {/* 3. Right side pricing & Farpost contacts box */}
      <div className="w-full md:w-52 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-4 space-y-4">
        
        {/* Pricing tag */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5 font-mono text-center md:text-left">
          <div className="space-y-1">
            <span className="text-[9px] text-slate-500 uppercase block">{lang === 'ru' ? 'Стоимость аренды' : lang === 'en' ? 'Rental Fee' : '租用费用'}</span>
            {vessel.priceHour && (
              <div className="text-lg font-bold text-white">
                {vessel.priceHour.toLocaleString()} ₽ <span className="text-xs font-normal text-slate-400">{lang === 'ru' ? '/ час' : lang === 'en' ? '/ hour' : '/ 小时'}</span>
              </div>
            )}
            {vessel.priceDay ? (
              <div className="text-xs text-slate-400">
                {lang === 'ru' ? `или ${vessel.priceDay.toLocaleString()} ₽ / сут.` : lang === 'en' ? `or ${vessel.priceDay.toLocaleString()} RUB / day` : `或 ${vessel.priceDay.toLocaleString()} 卢布 / 天`}
              </div>
            ) : (
              <div className="text-[10px] text-amber-500/80">{lang === 'ru' ? 'Посуточно не сдается' : lang === 'en' ? 'Hourly rental only' : '按小时出租'}</div>
            )}
          </div>
        </div>

        {/* Contacts revealer or quick book */}
        <div className="space-y-2">
          
          {/* Farpost Reveal Contact info */}
          <div className="relative">
            <AnimatePresence>
              {showContacts ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900 border border-emerald-500/30 p-2.5 rounded-lg text-xs font-mono space-y-1.5 shadow-lg relative z-20"
                >
                  <div className="text-[10px] text-slate-400">{lang === 'ru' ? 'Капитан:' : lang === 'en' ? 'Captain:' : '船长:'} <span className="text-white font-bold">{vessel.captainName}</span></div>
                  <div className="text-emerald-400 font-bold text-xs select-all flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{vessel.captainPhone}</span>
                  </div>
                  
                  {/* WhatsApp button */}
                  <a
                    href={`https://wa.me/${vessel.captainPhone.replace(/[^0-9]/g, '')}?text=Hello,%20interested%20in%20chartering%20${vessel.name}%20via%20JIV`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase rounded-md flex items-center justify-center gap-1 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{lang === 'ru' ? 'Написать в WA' : lang === 'en' ? 'WhatsApp Chat' : 'WhatsApp 咨询'}</span>
                  </a>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <button
              onClick={() => setShowContacts(!showContacts)}
              id={`btn-farpost-contacts-${vessel.id}`}
              className={`w-full py-2.5 rounded-lg font-bold text-xs font-mono tracking-wide transition-all border flex items-center justify-center gap-1.5 ${
                showContacts 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-white/10' 
                  : 'bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>{showContacts ? (lang === 'ru' ? 'Скрыть контакты' : lang === 'en' ? 'Hide Contacts' : '隐藏联系方式') : (lang === 'ru' ? 'Показать контакты' : lang === 'en' ? 'Show Contacts' : '显示联系方式')}</span>
            </button>
          </div>

          {/* Core Booking / Rental Button */}
          <button
            onClick={() => onBook(vessel)}
            id={`btn-farpost-book-${vessel.id}`}
            className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/10 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>{lang === 'ru' ? 'Забронировать' : lang === 'en' ? 'Book Now' : '立即预订'}</span>
          </button>

          {/* Quick Radar location focus */}
          <button
            onClick={() => {
              onSelect(vessel);
              document.getElementById('sea-map-wrapper')?.scrollIntoView({ behavior: 'smooth' });
            }}
            id={`btn-farpost-radar-${vessel.id}`}
            className="w-full py-1.5 border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg text-[10px] font-mono tracking-wider uppercase transition-colors"
          >
            {lang === 'ru' ? 'Показать на карте' : lang === 'en' ? 'Show on Map' : '在地图上显示'}
          </button>
        </div>

      </div>

    </motion.div>
  );
}

