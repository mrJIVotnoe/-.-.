import React from 'react';
import { Shield, CheckCircle, Navigation, Anchor, MapPin, ExternalLink, QrCode } from 'lucide-react';
import { Vessel } from '../../types';
import { useTranslation } from '../../lib/translations';

interface VesselStatusWidgetProps {
  vessel: Vessel;
  onOpenBooking?: () => void;
}

export default function VesselStatusWidget({ vessel, onOpenBooking }: VesselStatusWidgetProps) {
  const { lang } = useTranslation();

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <img
            src={vessel.images?.[0] || 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=600&q=80'}
            alt={vessel.name}
            className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                GIMS Verified
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                GIMS-RU-25-9012
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">
              {vessel.name}
            </h4>
          </div>
        </div>
        <div className="text-right font-mono">
          <span className="text-xs text-slate-400 block">{lang === 'ru' ? 'Статус судна' : 'Status'}</span>
          <span className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            {lang === 'ru' ? 'Готов к выходу' : 'Ready to Sail'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-sans">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
          <span className="text-[10px] text-slate-400 block font-mono">{lang === 'ru' ? 'Причал базирования' : 'Pier Location'}</span>
          <span className="text-white font-bold flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-rose-400" />
            {vessel.homeport || 'Улисс'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
          <span className="text-[10px] text-slate-400 block font-mono">{lang === 'ru' ? 'Капитан судна' : 'Captain'}</span>
          <span className="text-white font-bold mt-0.5 block truncate">
            {vessel.captainName || 'Александр Г.'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 block font-mono">{lang === 'ru' ? 'Защита от акул' : 'Shark Shield'}</span>
          <span className="text-cyan-300 font-bold flex items-center gap-1 mt-0.5">
            <Shield className="w-3 h-3 text-cyan-400" />
            {vessel.hasSharkRepeller ? (lang === 'ru' ? 'Shark Shield Active' : 'Active') : (lang === 'ru' ? 'Стандарт МЧС' : 'Standard')}
          </span>
        </div>
      </div>

      {onOpenBooking && (
        <button
          type="button"
          onClick={onOpenBooking}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
        >
          <QrCode className="w-4 h-4" />
          <span>{lang === 'ru' ? 'Забронировать & Получить Посадочный Талон (СБП)' : 'Book & Issue Boarding Pass (SBP)'}</span>
        </button>
      )}
    </div>
  );
}
