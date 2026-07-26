import React, { useState, useEffect, useRef } from 'react';
import { useTranslation, SUPPORTED_LANGUAGES } from '../lib/translations';
import { Globe, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LanguageDropdown() {
  const { lang, selectedLang, setLang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter languages based on user search query
  const filteredLanguages = SUPPORTED_LANGUAGES.filter(l => 
    l.label.toLowerCase().includes(search.toLowerCase()) ||
    l.nativeLabel.toLowerCase().includes(search.toLowerCase()) ||
    l.id.toLowerCase().includes(search.toLowerCase())
  );

  // Retrieve current active language option (default to Russian if not matched)
  const activeLangOption = SUPPORTED_LANGUAGES.find(l => l.id === selectedLang) || SUPPORTED_LANGUAGES.find(l => l.id === 'ru') || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative font-sans text-xs" ref={dropdownRef} id="classic-lang-dropdown">
      {/* Small drop-down classic tab/trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-white/10 text-slate-300 hover:text-white transition-all font-mono font-medium shadow-sm cursor-pointer select-none"
      >
        <Globe className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow shrink-0" />
        <span className="text-sm leading-none shrink-0">{activeLangOption.flag}</span>
        <span className="font-extrabold uppercase tracking-wider shrink-0">{activeLangOption.id.slice(0, 2)}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </button>

      {/* Floating dropdown menu with search capability */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-64 bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-2xl z-50 overflow-hidden"
          >
            {/* Custom search filter box inside the dropdown */}
            <div className="p-2 border-b border-white/5 bg-slate-900/30 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === 'ru' ? 'Поиск языка...' : lang === 'zh' ? '搜索语言...' : 'Search language...'}
                className="w-full bg-transparent border-none text-slate-200 text-xs focus:ring-0 focus:outline-none placeholder-slate-500 py-1"
                autoFocus
              />
            </div>

            {/* List of filtered languages with native flag & labels */}
            <div className="max-h-72 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-white/10" id="lang-items-list">
              {filteredLanguages.length > 0 ? (
                filteredLanguages.map((opt) => {
                  const isActive = opt.id === selectedLang;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setLang(opt.id);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-white/5 flex items-center justify-between transition-all group ${
                        isActive ? 'bg-cyan-500/10 text-cyan-400 font-semibold' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg leading-none group-hover:scale-110 transition-transform shrink-0">{opt.flag}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-white group-hover:text-cyan-300 transition-colors truncate">{opt.nativeLabel}</span>
                          <span className="text-[10px] text-slate-400 group-hover:text-slate-300 truncate">{opt.label}</span>
                        </div>
                      </div>
                      
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-center text-slate-500 font-mono text-[10px]">
                  {lang === 'ru' ? 'Язык не найден' : 'No language found'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
