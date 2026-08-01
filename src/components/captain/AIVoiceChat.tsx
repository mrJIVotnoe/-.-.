import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Mic, RefreshCw, Volume2, Shield } from 'lucide-react';
import { WeatherCondition } from '../../types';
import { useTranslation } from '../../lib/translations';

interface AIVoiceChatProps {
  weather?: WeatherCondition;
  selectedVesselName?: string;
}

export default function AIVoiceChat({ weather, selectedVesselName }: AIVoiceChatProps) {
  const { lang } = useTranslation();
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; text: string }>>([
    {
      role: 'assistant',
      text: lang === 'ru' 
        ? 'Приветствую! Я «Цифровой Капитан JIV» на базе Gemini AI. Задайте мне любой вопрос о фарватере Залива Петра Великого, штормовых условиях или правилах пограничного контроля.'
        : lang === 'en'
        ? 'Greetings! I am the "Digital Captain JIV" powered by Gemini AI. Ask me anything about Peter the Great Bay fairways, weather warnings, or border control rules.'
        : '您好！我是基于 Gemini AI 的“JIV 数字船长”。您可以向我咨询关于彼得大帝湾航道、风暴警报或边防检查规程 responses.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Ты — старший Цифровой Капитан Владивостока. Пользователь спрашивает: "${userMsg}". Контекст: Погода=${weather?.status || 'ясно'}, ветеp=${weather?.windSpeed || 4} м/с, волнение=${weather?.waveHeight || 0.4} м, выбранное судно=${selectedVesselName || 'Джулия VIP'}. Ответь содержательно, дружелюбно, профессиональным морским языком.`
        })
      });
      const data = await res.json();
      const reply = data.reply || (lang === 'ru' ? 'Связь временно нестабильна, курс сохранен.' : 'Connection unstable, heading maintained.');
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      console.error('AI Captain error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: lang === 'ru' ? 'Ошибка связи с ИИ-сервером. Рекомендуется использовать VHF Канал 16.' : 'AI server connection error. Please fallback to VHF Channel 16.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setInput(lang === 'ru' ? 'Какая погода ожидается у мыса Тобизина через 2 часа?' : 'What is the weather forecast at Cape Tobizina in 2 hours?');
      }, 2000);
    }
  };

  return (
    <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{lang === 'ru' ? 'Цифровой Капитан Gemini AI' : 'Gemini AI Digital Captain'}</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                v2.5 Live
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              {lang === 'ru' ? 'Навигационный ассистент & Интеллектуальный штурман' : 'Navigation Assistant & Nautical AI Guide'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Online</span>
        </div>
      </div>

      {/* Messages Window */}
      <div className="h-64 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 text-xs font-bold">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed font-sans ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-800/90 text-slate-200 border border-white/10 rounded-bl-none shadow-sm'
              }`}
            >
              {m.text}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-700 border border-slate-600 text-slate-200 flex items-center justify-center shrink-0 text-xs font-bold">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{lang === 'ru' ? 'Капитан анализирует эхолот и спутниковые данные...' : 'Captain is evaluating sonar and satellite feeds...'}</span>
          </div>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
        <button
          onClick={() => setInput(lang === 'ru' ? 'Правила радиообмена на УКВ Канал 16' : 'VHF Channel 16 radio protocols')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 whitespace-nowrap transition-colors"
        >
          📻 УКВ Канал 16
        </button>
        <button
          onClick={() => setInput(lang === 'ru' ? 'Безопасность у острова Шкота при южном ветре' : 'Safety at Shkota Island during south wind')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 whitespace-nowrap transition-colors"
        >
          🏝️ о. Шкота
        </button>
        <button
          onClick={() => setInput(lang === 'ru' ? 'Где находится система отпугивания акул Shark Shield?' : 'How does Shark Shield system work on Julia yacht?')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 whitespace-nowrap transition-colors"
        >
          🦈 Shark Shield
        </button>
      </div>

      {/* Input controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleVoice}
          className={`p-2.5 rounded-xl border transition-all ${
            isListening 
              ? 'bg-rose-500/20 text-rose-400 border-rose-500 animate-pulse' 
              : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
          }`}
          title={lang === 'ru' ? 'Голосовой ввод' : 'Voice Input'}
        >
          <Mic className="w-4 h-4" />
        </button>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={
            isListening
              ? (lang === 'ru' ? 'Слушаю ваши указания...' : 'Listening to command...')
              : (lang === 'ru' ? 'Задайте вопрос капитану...' : 'Ask Captain a question...')
          }
          className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{lang === 'ru' ? 'Отправить' : 'Send'}</span>
        </button>
      </div>
    </div>
  );
}
