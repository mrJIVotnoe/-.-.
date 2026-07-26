/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { WeatherCondition } from '../types';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  Wind, 
  Waves, 
  AlertTriangle, 
  ShieldCheck, 
  Compass, 
  Gauge, 
  Droplets, 
  Eye, 
  Clock,
  Thermometer,
  CloudSun,
  Activity,
  ExternalLink
} from 'lucide-react';
import { useTranslation } from '../lib/translations';

interface WeatherWidgetProps {
  currentWeather: WeatherCondition;
  onWeatherChange: (condition: WeatherCondition) => void;
}

type WeatherSource = 'yandex' | 'radar' | 'windy' | 'google' | 'amap' | 'baidu';

// Beautiful interactive animated meteorology radar simulation using HTML Canvas
const RadarSimulation = ({ lang }: { lang: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let angle = 0;

    // Define some static precipitation cells in local coordinates
    const cells = [
      { x: 140, y: 60, radius: 28, color: 'rgba(34, 197, 94, 0.35)' },  // Green rain cell
      { x: 240, y: 120, radius: 36, color: 'rgba(59, 130, 246, 0.3)' }, // Blue cloud cell
      { x: 100, y: 140, radius: 18, color: 'rgba(234, 179, 8, 0.25)' }   // Yellow drizzle
    ];

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 180;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw Radar Grid Circles
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.08)';
      ctx.lineWidth = 1;
      for (let r = 30; r < Math.max(canvas.width, canvas.height); r += 40) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Crosshairs
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(canvas.width, cy);
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, canvas.height);
      ctx.stroke();

      // Draw the precipitation cells (clouds)
      cells.forEach(cell => {
        ctx.beginPath();
        const grad = ctx.createRadialGradient(cell.x, cell.y, 0, cell.x, cell.y, cell.radius);
        grad.addColorStop(0, cell.color);
        grad.addColorStop(0.5, cell.color.replace('0.3', '0.1').replace('0.25', '0.08'));
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.arc(cell.x, cell.y, cell.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw the Radar Sweeper line
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const rx = cx + Math.cos(angle) * 300;
      const ry = cy + Math.sin(angle) * 300;
      ctx.lineTo(rx, ry);
      ctx.stroke();

      // Draw Sweeper Fade Trail (Sector)
      ctx.fillStyle = 'rgba(34, 211, 238, 0.03)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 300, angle - 0.25, angle);
      ctx.closePath();
      ctx.fill();

      // Draw Vladivostok coastline outline silhouette (Aesthetic stylized map)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 120, cy - 50);
      ctx.quadraticCurveTo(cx - 60, cy - 40, cx - 30, cy - 10);
      ctx.quadraticCurveTo(cx, cy + 30, cx + 40, cy + 15);
      ctx.quadraticCurveTo(cx + 90, cy - 5, cx + 130, cy + 35);
      ctx.stroke();

      // Draw Tokarevsky spit/lighthouse outline
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - 10);
      ctx.lineTo(cx - 45, cy + 15);
      ctx.stroke();

      // Draw blinking red dot for Tokarevsky Lighthouse / Vladivostok City Center
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(cx - 45, cy + 15, 3.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
      ctx.beginPath();
      ctx.arc(cx - 45, cy + 15, 7 + Math.sin(Date.now() / 250) * 3, 0, Math.PI * 2);
      ctx.fill();

      // Text label for Vladivostok
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(lang === 'ru' ? 'МАЯК ТОКАРЕВСКИЙ' : lang === 'en' ? 'TOKAREVSKY LIGHT' : '托卡列夫斯基灯塔', cx - 120, cy + 28);

      // Update angle
      angle += 0.012;
      if (angle > Math.PI * 2) angle = 0;

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [lang]);

  return (
    <div className="relative h-44 bg-slate-950 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/25 text-[9px] font-mono text-yellow-400 font-semibold uppercase tracking-wider animate-pulse flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping" />
        {lang === 'ru' ? 'Росгидромет РФ • Радар осадков LIVE' : lang === 'en' ? 'NOAA & Google Marine Radar LIVE' : '高德 / 中国气象局 • 实时降水雷达'}
      </div>
    </div>
  );
};

export default function WeatherWidget({ currentWeather, onWeatherChange }: WeatherWidgetProps) {
  const { lang, t } = useTranslation();
  const [activeSource, setActiveSource] = useState<WeatherSource>(lang === 'ru' ? 'yandex' : (lang === 'zh' || lang === 'zh-TW') ? 'amap' : 'google');
  const [iframeLoading, setIframeLoading] = useState(true);

  // Sync active source when language/mode changes
  useEffect(() => {
    if (lang === 'ru') {
      setActiveSource('yandex');
    } else if (lang === 'zh' || lang === 'zh-TW') {
      setActiveSource('amap');
    } else {
      setActiveSource('google');
    }
  }, [lang]);

  const sourcesList = lang === 'ru'
    ? [
        { id: 'yandex', label: '🟡 Яндекс Погода', desc: 'Яндекс.Погода — детальный прогноз' },
        { id: 'radar', label: '📡 Росгидромет', desc: 'Морской радар осадков Росгидромета РФ' },
        { id: 'windy', label: '💨 Ветровой радар', desc: 'Карта ветра и волнения Приморья' }
      ]
    : (lang === 'zh' || lang === 'zh-TW')
    ? [
        { id: 'amap', label: '🇨🇳 高德天气', desc: '高德地图实时海图与气象预报' },
        { id: 'baidu', label: '🗺️ 百度天气', desc: '百度气象水文雷达' },
        { id: 'windy', label: '💨 Windy 海图', desc: '全球风浪实时雷达' }
      ]
    : [
        { id: 'google', label: '🌐 Google Weather', desc: 'Google Weather API & Marine Forecast' },
        { id: 'windy', label: '💨 Windyty Global', desc: 'Live Marine Wind & Swell Radar' },
        { id: 'radar', label: '⚓ NOAA Marine Radar', desc: 'NOAA Ocean Precipitation & Storm Tracking' }
      ];

  const getWarningMessage = (status: 'calm' | 'moderate' | 'stormy') => {
    if (status === 'calm') {
      return lang === 'ru' 
        ? 'Штиль. Отличная видимость. Безопасный выход в открытое море по всей акватории.'
        : lang === 'en'
        ? 'Calm sea. Excellent visibility. Safe departure into the open sea across the entire area.'
        : '风平浪静。极佳能见度。整个海域皆可安全出海。';
    } else if (status === 'moderate') {
      return lang === 'ru'
        ? 'Умеренное волнение. Рекомендуется соблюдать осторожность при выходе на гидроциклах.'
        : lang === 'en'
        ? 'Moderate waves. Caution is advised when operating jet skis.'
        : '中等海浪。使用摩托艇时建议保持警惕。';
    } else {
      return lang === 'ru'
        ? 'ШТОРМОВОЕ ПРЕДУПРЕЖДЕНИЕ! Высокие волны в Босфоре Восточном и Амурском заливе.'
        : lang === 'en'
        ? 'STORM WARNING! High waves in Eastern Bosphorus and Amur Bay.'
        : '风暴预警！东博斯普鲁斯海峡和阿穆尔湾有巨浪。';
    }
  };

  const getShelteredBaySuggestion = () => {
    return lang === 'ru'
      ? 'Рекомендуется аренда только в защищенных бухтах (Бухта Новик, бухта Труда).'
      : lang === 'en'
      ? 'Rental is recommended only in sheltered bays (Novik Bay, Truda Bay).'
      : '建议仅在有遮蔽的港湾中租赁（诺维克湾、特鲁达湾）。';
  };

  const displayWarning = getWarningMessage(currentWeather.status);
  const displaySuggestion = currentWeather.status === 'stormy' ? getShelteredBaySuggestion() : undefined;

  // Hourly forecast for Vladivostok (Google Weather simulation)
  const hourlyForecast = [
    { time: '09:00', temp: 20, icon: <Sun className="w-4 h-4 text-amber-400" />, pop: '5%' },
    { time: '12:00', temp: 22, icon: <CloudSun className="w-4 h-4 text-yellow-300" />, pop: '10%' },
    { time: '15:00', temp: 23, icon: <CloudSun className="w-4 h-4 text-yellow-300" />, pop: '15%' },
    { time: '18:00', temp: 21, icon: <Cloud className="w-4 h-4 text-slate-300" />, pop: '25%' },
    { time: '21:00', temp: 18, icon: <CloudRain className="w-4 h-4 text-cyan-400" />, pop: '60%' },
    { time: '00:00', temp: 16, icon: <CloudRain className="w-4 h-4 text-cyan-400" />, pop: '80%' },
  ];

  const handleSourceChange = (source: WeatherSource) => {
    setIframeLoading(true);
    setActiveSource(source);
  };

  const toggleWeather = (status: 'calm' | 'moderate' | 'stormy') => {
    let nextWeather: WeatherCondition;
    if (status === 'calm') {
      nextWeather = {
        waveHeight: 0.3,
        windSpeed: 3.5,
        windDirection: 'NE',
        temperatureAir: 22,
        temperatureWater: 18,
        status: 'calm',
        warningMessage: getWarningMessage('calm')
      };
    } else if (status === 'moderate') {
      nextWeather = {
        waveHeight: 1.2,
        windSpeed: 8.5,
        windDirection: 'SE',
        temperatureAir: 19,
        temperatureWater: 17,
        status: 'moderate',
        warningMessage: getWarningMessage('moderate')
      };
    } else {
      nextWeather = {
        waveHeight: 2.8,
        windSpeed: 16.5,
        windDirection: 'S',
        temperatureAir: 15,
        temperatureWater: 16,
        status: 'stormy',
        warningMessage: getWarningMessage('stormy'),
        shelteredBaySuggestion: getShelteredBaySuggestion()
      };
    }
    onWeatherChange(nextWeather);
  };

  const getStatusColor = () => {
    switch (currentWeather.status) {
      case 'calm':
        return 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400';
      case 'moderate':
        return 'border-amber-500/30 bg-amber-950/20 text-amber-400';
      case 'stormy':
        return 'border-rose-500/30 bg-rose-950/20 text-rose-400 animate-pulse';
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 backdrop-blur-xl p-5 shadow-2xl transition-all duration-300" id="weather-widget-container">
      
      {/* Title block */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 block">{t('title_sub', 'weather')}</span>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            {t('title', 'weather')}
          </h3>
        </div>
        
        {/* Source Toggle Switch */}
        <div className="flex bg-slate-900/85 rounded-xl p-1 border border-white/5" id="weather-source-switcher">
          {sourcesList.map((source) => (
            <button
              key={source.id}
              onClick={() => handleSourceChange(source.id as WeatherSource)}
              title={source.desc}
              id={`weather-src-btn-${source.id}`}
              className={`px-2.5 py-1.5 text-xs rounded-lg font-semibold tracking-wide transition-all ${
                activeSource === source.id
                  ? 'bg-white/10 text-white border border-white/10 shadow-inner'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {source.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Area depending on Active Source */}
      <div className="relative border border-white/5 rounded-xl bg-slate-950/90 overflow-hidden mb-5 min-h-[340px] flex flex-col justify-between">
        
        {/* Loading overlay for iframes */}
        {iframeLoading && activeSource === 'windy' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-30 gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <span className="text-[10px] text-cyan-400 font-mono tracking-wider animate-pulse">
              {lang === 'ru' ? 'Соединение с метеосервером...' : lang === 'en' ? 'Connecting to weather server...' : '正在连接气象服务器...'}
            </span>
          </div>
        )}

        {/* Tab: WINDY (LIVE WIND & SWELL EMBED) */}
        {activeSource === 'windy' && (
          <div className="flex-1 flex flex-col">
            <div className="relative flex-1 min-h-[280px]">
              <iframe
                src="https://embed.windy.com/embed2.html?lat=43.0600&lon=131.8869&zoom=10&level=surface&overlay=wind&menu=&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&metricWind=m%2Fs&metricTemp=%C2%B0C&radarRange=-1"
                className="absolute inset-0 w-full h-full border-0 rounded-t-xl"
                loading="lazy"
                referrerPolicy="no-referrer"
                onLoad={() => setIframeLoading(false)}
                title="Windyty Live Marine Radar"
              />
            </div>
            <div className="bg-slate-900/90 border-t border-white/5 p-3 flex justify-between items-center text-[11px] font-mono text-slate-300">
              <span className="flex items-center gap-1">
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === 'ru' ? 'Мертвая зыбь: 0.4 м' : lang === 'en' ? 'Swell: 0.4m' : '涌浪：0.4米'}</span>
              </span>
              <span className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === 'ru' ? 'Ветер: до 6 м/с • Порывы 9 м/с' : lang === 'en' ? 'Wind: up to 6 m/s • Gusts 9 m/s' : '风速：最高 6 米/秒 • 阵风 9 米/秒'}</span>
              </span>
              <a 
                href="https://www.windy.com/43.060/131.887?42.541,131.887,9" 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[10px]"
              >
                <span>{lang === 'ru' ? 'Подробнее' : lang === 'en' ? 'More info' : '了解更多'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Tab: YANDEX WEATHER (RUSSIAN MODE 1) */}
        {activeSource === 'yandex' && (
          <div className="p-4 flex flex-col justify-between flex-1 gap-3" id="yandex-weather-dashboard">
            {/* Top Row: Current Temperature */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center font-mono">🔴</span>
                  Яндекс Погода • Владивосток (Японское море)
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <CloudSun className="w-8 h-8 text-yellow-300" />
                  <div>
                    <span className="text-3xl font-bold text-white font-mono leading-none">22°</span>
                    <span className="text-xs text-slate-400 block font-sans">
                      Ощущается как 23°С • Облачно с прояснениями
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 space-y-1 font-mono">
                <div>Влажность: <span className="text-white">74%</span></div>
                <div>Ветер: <span className="text-white">3.5 м/с, СВ</span></div>
                <div>Давление: <span className="text-white">756 мм рт. ст.</span></div>
              </div>
            </div>

            {/* Radar Canvas component */}
            <RadarSimulation lang={lang} />

            {/* Bottom Row */}
            <div className="bg-slate-900/90 border border-white/5 rounded-lg p-2.5 flex justify-between items-center text-[11px] font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Осадки: в ближайшие 2 часа не ожидаются</span>
              </span>
              <a 
                href="https://yandex.ru/pogoda/vladivostok" 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[10px]"
              >
                <span>Яндекс.Погода Подробнее</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Tab: ROSGIDROMET RADAR (RUSSIAN MODE 1 / INTL NOAA RADAR) */}
        {activeSource === 'radar' && (
          <div className="p-4 flex flex-col justify-between flex-1 gap-3" id="rosgidromet-radar-dashboard">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 font-bold text-xs flex items-center justify-center font-mono">📡</span>
                  {lang === 'ru' ? 'Росгидромет РФ • Морской метеорадар' : 'NOAA & International Marine Weather Radar'}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  {lang === 'ru' 
                    ? 'Оперативный мониторинг осадков, туманов и направления ветра в Заливе Петра Великого' 
                    : 'Real-time precipitation radar & marine storm cell tracking'}
                </p>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-500/30">
                {lang === 'ru' ? '152-ФЗ Данные' : 'NOAA Satellite'}
              </span>
            </div>

            <RadarSimulation lang={lang} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
              <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-500 block">{lang === 'ru' ? 'Высота волны' : 'Wave Height'}</span>
                <span className="font-bold text-white">0.3 м</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-500 block">{lang === 'ru' ? 'Порывы ветра' : 'Wind Gusts'}</span>
                <span className="font-bold text-cyan-400">7.0 м/с</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-500 block">{lang === 'ru' ? 'Температура воды' : 'Water Temp'}</span>
                <span className="font-bold text-amber-400">+18°C</span>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-500 block">{lang === 'ru' ? 'УФ-Индекс' : 'UV Index'}</span>
                <span className="font-bold text-emerald-400">5 (Ср)</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: GOOGLE WEATHER (INTERNATIONAL MODE 2) */}
        {activeSource === 'google' && (
          <div className="p-4 flex flex-col justify-between flex-1 gap-4" id="google-weather-dashboard">
            {/* Top Row: Current Temperature */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-semibold text-white">Google Weather API • Vladivostok</span>
                <div className="flex items-center gap-2 mt-1">
                  <Sun className="w-8 h-8 text-amber-400" />
                  <div>
                    <span className="text-3xl font-bold text-white font-mono leading-none">22°C</span>
                    <span className="text-xs text-slate-400 block font-sans">Feels like 23°C • Mostly Sunny</span>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 space-y-1 font-mono">
                <div>Humidity: <span className="text-white font-mono">74%</span></div>
                <div>Wind: <span className="text-white font-mono">3.5 m/s NE</span></div>
                <div>Pressure: <span className="text-white font-mono">756 mmHg</span></div>
              </div>
            </div>

            {/* Hourly Forecast Slider */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">Hourly Forecast</div>
              <div className="grid grid-cols-6 gap-2 text-center font-mono">
                {hourlyForecast.map((hour, idx) => (
                  <div key={idx} className="bg-slate-900/50 border border-white/5 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">{hour.time}</span>
                    <div className="my-1 flex justify-center">{hour.icon}</div>
                    <span className="text-xs font-bold text-white">{hour.temp}°</span>
                    <span className="text-[9px] text-cyan-400 block mt-0.5">{hour.pop}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-sans">
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-white/5 flex items-center gap-2">
                <Waves className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[9px] text-slate-400 font-mono uppercase">Wave Height</div>
                  <div className="text-xs font-bold text-white font-mono">0.3 m</div>
                </div>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-white/5 flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[9px] text-slate-400 font-mono uppercase">Wind Gusts</div>
                  <div className="text-xs font-bold text-white font-mono">3.5 (7) m/s</div>
                </div>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-white/5 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[9px] text-slate-400 font-mono uppercase">Water Temp</div>
                  <div className="text-xs font-bold text-white font-mono">+18°C</div>
                </div>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-white/5 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[9px] text-slate-400 font-mono uppercase">UV Index</div>
                  <div className="text-xs font-bold text-white font-mono">5 (Mod)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: AMAP / GAODE WEATHER (CHINESE MODE 3) */}
        {activeSource === 'amap' && (
          <div className="p-4 flex flex-col justify-between flex-1 gap-4" id="amap-weather-dashboard">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">🇨🇳</span>
                  高德天气 API • 符拉迪沃斯托克 (海参崴)
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <Sun className="w-8 h-8 text-amber-400" />
                  <div>
                    <span className="text-3xl font-bold text-white font-mono leading-none">22°C</span>
                    <span className="text-xs text-slate-400 block font-sans">体感温度 23°C • 多云转晴</span>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 space-y-1 font-mono">
                <div>湿度: <span className="text-white font-mono">74%</span></div>
                <div>风速: <span className="text-white font-mono">3.5 米/秒，东北</span></div>
                <div>气压: <span className="text-white font-mono">756 毫米汞柱</span></div>
              </div>
            </div>

            {/* Hourly Forecast */}
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">逐小时预报</div>
              <div className="grid grid-cols-6 gap-2 text-center font-mono">
                {hourlyForecast.map((hour, idx) => (
                  <div key={idx} className="bg-slate-900/50 border border-white/5 p-2 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">{hour.time}</span>
                    <div className="my-1 flex justify-center">{hour.icon}</div>
                    <span className="text-xs font-bold text-white">{hour.temp}°</span>
                    <span className="text-[9px] text-cyan-400 block mt-0.5">{hour.pop}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-white/5 rounded-lg p-2.5 flex justify-between items-center text-[11px] font-mono text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>未来2小时内无降水，适宜游艇出航</span>
              </span>
              <a 
                href="https://ditu.amap.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 text-[10px]"
              >
                <span>高德地图气象</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Tab: BAIDU WEATHER (CHINESE MODE 3) */}
        {activeSource === 'baidu' && (
          <div className="p-4 flex flex-col justify-between flex-1 gap-3" id="baidu-weather-dashboard">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">🗺️</span>
                  百度天气 • 气象水文雷达
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  符拉迪沃斯托克彼得大帝湾实时气象与波浪数据
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/30">
                百度 GIS
              </span>
            </div>

            <RadarSimulation lang={lang} />

            <div className="bg-slate-900/90 border border-white/5 rounded-lg p-2.5 flex justify-between items-center text-[11px] font-mono text-slate-300">
              <span>波浪高度: 0.3 米 • 风速: 3.5 米/秒</span>
              <a 
                href="https://map.baidu.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 text-[10px]"
              >
                <span>百度地图</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Weather Safety Alert Banner */}
      <div className={`border rounded-xl p-3 text-xs leading-relaxed flex items-start gap-2.5 mb-4 transition-all duration-300 ${getStatusColor()}`} id="weather-status-alert font-sans">
        {currentWeather.status === 'stormy' ? (
          <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 animate-bounce text-rose-400" />
        ) : (
          <ShieldCheck className="w-4.5 h-4.5 flex-shrink-0 text-emerald-400" />
        )}
        <div>
          <span className="font-semibold block mb-0.5">
            {currentWeather.status === 'calm' 
              ? (lang === 'ru' ? 'Условия благоприятны' : lang === 'en' ? 'Conditions Favorable' : '天气条件良好') 
              : currentWeather.status === 'moderate' 
              ? (lang === 'ru' ? 'Внимание' : lang === 'en' ? 'Caution' : '注意') 
              : (lang === 'ru' ? 'Штормовое положение!' : lang === 'en' ? 'Storm alert!' : '风暴预警！')}
          </span>
          <p className="opacity-90">{displayWarning}</p>
          {displaySuggestion && (
            <div className="mt-2 text-rose-300 bg-rose-950/40 p-2 rounded-lg border border-rose-500/20 font-medium font-sans">
              ⚠️ {displaySuggestion}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
