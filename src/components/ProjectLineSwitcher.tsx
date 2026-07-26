/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useProjectLine, PROJECT_LINES, ProjectLine } from '../lib/projectLineContext';
import { 
  Globe, 
  Settings, 
  Check, 
  Lock, 
  MapPin, 
  CreditCard, 
  UserCheck, 
  Sparkles,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { useTranslation } from '../lib/translations';

export default function ProjectLineSwitcher() {
  const { projectLine, setProjectLine, details } = useProjectLine();
  const [isOpen, setIsOpen] = useState(false);
  const { lang } = useTranslation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLocalizedLineLabel = (lineId: ProjectLine) => {
    if (lineId === 'ru') {
      return lang === 'ru' ? 'Российская Линия (Яндекс / ФЗ-152)' : 'Russian Line (Yandex / FZ-152)';
    } else if (lineId === 'cn') {
      return lang === 'ru' ? 'Китайская Линия (WeChat / PIPL)' : 'Chinese Line (WeChat / PIPL)';
    } else {
      return lang === 'ru' ? 'Международная Линия (Google / GDPR)' : 'International Line (Google / GDPR)';
    }
  };

  const getAccentColor = (lineId: ProjectLine) => {
    if (lineId === 'ru') return 'from-amber-500 to-red-600 border-red-500/30 text-amber-400';
    if (lineId === 'cn') return 'from-red-500 to-yellow-500 border-red-500/30 text-yellow-400';
    return 'from-cyan-500 to-blue-600 border-cyan-500/30 text-cyan-400';
  };

  return (
    <div className="relative" ref={dropdownRef} id="project-line-switcher-container">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all flex items-center gap-2 border bg-slate-950/80 hover:bg-slate-900 border-white/10`}
      >
        <span className="text-xs">{details.flag}</span>
        <div className="flex flex-col items-start leading-none text-left">
          <span className="text-[9px] text-slate-400 font-mono tracking-widest block">PROJECT LINE</span>
          <span className="text-[10px] text-white font-black">
            {projectLine === 'ru' ? 'RU / YANDEX' : projectLine === 'cn' ? 'CN / WECHAT' : 'INTL / GOOGLE'}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-slate-950 border border-white/10 p-4 shadow-2xl z-50 space-y-3 animate-fade-in">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-bold">
              {lang === 'ru' ? '⚡ Генеральные линии развития' : lang === 'en' ? '⚡ Development Platforms' : '⚡ 平台架构路线'}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              {lang === 'ru' 
                ? 'Выберите технологическую вилку для симуляции соответствующих API, платежных систем и юридических регламентов.'
                : lang === 'en'
                ? 'Select development fork to simulate corresponding APIs, payments, and legal regulations.'
                : '选择技术路线以模拟相应的API、支付系统与合规标准。'}
            </p>
          </div>

          {/* Options list */}
          <div className="space-y-2">
            {(Object.keys(PROJECT_LINES) as ProjectLine[]).map((lineId) => {
              const opt = PROJECT_LINES[lineId];
              const isSelected = projectLine === lineId;
              const accent = getAccentColor(lineId);

              return (
                <button
                  key={lineId}
                  type="button"
                  onClick={() => {
                    setProjectLine(lineId);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? `bg-slate-900/60 border-white/20 ring-1 ring-white/10`
                      : 'bg-transparent border-transparent hover:bg-white/5'
                  }`}
                >
                  <span className="text-xl mt-0.5">{opt.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white block truncate">
                        {opt.name}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-cyan-400 font-bold uppercase font-mono tracking-wider">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block leading-tight mt-0.5">
                      {opt.title}
                    </span>
                    <span className="text-[9px] text-slate-500 leading-normal block mt-1">
                      {opt.desc}
                    </span>

                    {/* Badge details of active tech */}
                    {isSelected && (
                      <div className="mt-2 grid grid-cols-2 gap-1 text-[8px] font-mono text-slate-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                          <span>{opt.mapProvider.toUpperCase()} Maps</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="w-2.5 h-2.5 text-cyan-400" />
                          <span>{opt.paymentSystem.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                          <UserCheck className="w-2.5 h-2.5 text-cyan-400" />
                          <span>Auth: {opt.authSystem.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-1 col-span-2 text-amber-400">
                          <Lock className="w-2.5 h-2.5" />
                          <span>{opt.complianceName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Line Status Footer */}
          <div className="bg-slate-900/40 border border-white/5 p-2 rounded-xl text-[9px] font-mono text-slate-400 space-y-1">
            <div className="flex items-center gap-1 text-amber-400">
              <ShieldAlert className="w-3 h-3" />
              <span className="font-bold">РЕГЛАМЕНТ БЕЗОПАСНОСТИ</span>
            </div>
            <p className="leading-normal">
              {details.complianceShort}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
