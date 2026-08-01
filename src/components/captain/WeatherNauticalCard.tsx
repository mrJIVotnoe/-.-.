import React from 'react';
import { Waves, Wind, Compass, AlertTriangle, ShieldCheck, Radio, Sun, Eye } from 'lucide-react';
import { WeatherCondition } from '../../types';
import { useTranslation } from '../../lib/translations';

interface WeatherNauticalCardProps {
  weather: WeatherCondition;
}

export default function WeatherNauticalCard({ weather }: WeatherNauticalCardProps) {
  const { lang } = useTranslation();

  return (
    <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              {lang === 'ru' ? 'Метеоинформер Залива Петра Великого' : 'Peter the Great Bay Nautical Weather'}
            </h4>
            <p className="text-[11px] text-slate-400">
              {lang === 'ru' ? 'Спутники МЧС & Морской гидрометцентр' : 'MCHS Satellite Feed & Hydromet Service'}
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
          {lang === 'ru' ? 'Благоприятно' : 'Favorable'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Wind className="w-3 h-3 text-cyan-400" />
            {lang === 'ru' ? 'Ветер' : 'Wind'}
          </span>
          <p className="text-sm font-bold text-white font-mono">
            {weather.windSpeed || 4.2} м/с <span className="text-xs text-slate-400">ЮВ</span>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Waves className="w-3 h-3 text-blue-400" />
            {lang === 'ru' ? 'Высота волн' : 'Wave Height'}
          </span>
          <p className="text-sm font-bold text-white font-mono">
            {weather.waveHeight || 0.4} м <span className="text-xs text-emerald-400">(0.5 балла)</span>
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Sun className="w-3 h-3 text-amber-400" />
            {lang === 'ru' ? 'Темп. воды' : 'Water Temp'}
          </span>
          <p className="text-sm font-bold text-white font-mono">
            +{weather.temperatureWater || 18.5}°C
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Eye className="w-3 h-3 text-purple-400" />
            {lang === 'ru' ? 'Видимость' : 'Visibility'}
          </span>
          <p className="text-sm font-bold text-white font-mono">
            10.0 км <span className="text-xs text-slate-400">(Ясно)</span>
          </p>
        </div>
      </div>

      {/* VHF Radio Channels Bar */}
      <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/20 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-mono text-slate-300 font-bold">
            {lang === 'ru' ? 'Дежурные УКВ Радиоканалы:' : 'Radio VHF Channels:'}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
            Канал 14 (Улисс)
          </span>
          <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-500/30 text-blue-300">
            Канал 16 (Змеинка)
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300">
            Канал 12 (Поспелово)
          </span>
        </div>
      </div>
    </div>
  );
}
